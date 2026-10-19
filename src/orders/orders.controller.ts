import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  HttpException,
  NotFoundException,
  Param,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { type AlphaCharge, AlphaPayClient, AlphaTimeoutError } from '../../vendor/alpha-pay/index.js';
import { EventsRepository } from '../data/events.repository.js';
import { OrdersRepository } from '../data/orders.repository.js';
import { TicketsRepository } from '../data/tickets.repository.js';
import type { Order, OrderItem } from '../data/types.js';
import { UsersRepository } from '../data/users.repository.js';
import { VenuesRepository } from '../data/venues.repository.js';
import { SeatInventory } from '../inventory/seat-inventory.js';
import { MailerService } from '../notifications/mailer.service.js';
import { round2 } from '../shared/money.js';
import { TicketsService } from '../tickets/tickets.service.js';

interface CreateOrderBody {
  eventId: string;
  seats: { seatId: string; quantity?: number }[];
  card: string;
  holderName: string;
  email?: string;
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly events: EventsRepository,
    private readonly venues: VenuesRepository,
    private readonly users: UsersRepository,
    private readonly orders: OrdersRepository,
    private readonly tickets: TicketsRepository,
    private readonly ticketsService: TicketsService,
    private readonly mailer: MailerService,
  ) {}

  @Post()
  async create(@Body() body: CreateOrderBody, @Headers('x-user-id') userId?: string) {
    const event = this.events.findById(body.eventId);
    if (!event) throw new NotFoundException('evento non trovato');
    if (event.status !== 'on_sale') throw new BadRequestException('evento non in vendita');
    const venue = this.venues.findById(event.venueId)!;
    const user = userId ? this.users.findById(userId) : undefined;
    const email = body.email ?? user?.email;
    if (!email) throw new BadRequestException('email obbligatoria');
    if (!body.seats || body.seats.length === 0) throw new BadRequestException('nessun posto selezionato');

    const inventory = SeatInventory.getInstance();
    const items: OrderItem[] = [];
    for (const requested of body.seats) {
      const seat = venue.seats.find((s) => s.id === requested.seatId);
      if (!seat) throw new BadRequestException('posto inesistente: ' + requested.seatId);
      let qty = 1;
      if (seat.kind === 'numbered') {
        if (inventory.isSold(event.id, seat.id)) throw new ConflictException('posto già venduto: ' + seat.id);
      } else if (seat.kind === 'standing') {
        qty = requested.quantity ?? 1;
        if (inventory.standingSold(event.id, seat.id) + qty > seat.capacity!) {
          throw new ConflictException('settore esaurito: ' + seat.sector);
        }
      }

      // calcolo del prezzo
      let unitPrice = 0;
      switch (event.pricingType) {
        case 'standard':
          unitPrice = event.sectorPrices[seat.sector];
          break;
        case 'flat':
          unitPrice = event.flatPrice!;
          break;
        case 'free':
          unitPrice = 0;
          break;
        default:
          throw new BadRequestException('tipo di prezzo non gestito');
      }
      const fee = round2(unitPrice * 0.12);
      let lineTotal: number;
      if (seat.kind === 'standing') {
        // per i posti in piedi la commissione si calcola direttamente sul totale, il risultato è lo stesso
        lineTotal = round2(unitPrice * qty * 1.12);
      } else {
        lineTotal = round2(unitPrice + fee);
      }
      items.push({ seatId: seat.id, sector: seat.sector, quantity: qty, unitPrice, fee, lineTotal });
    }
    let total = 0;
    for (const it of items) total += it.lineTotal;
    total = round2(total);

    // pagamento
    let charge: AlphaCharge | null = null;
    if (total > 0) {
      const alpha = new AlphaPayClient(process.env.ALPHA_API_KEY ?? 'sk_test_tickethub');
      const reference = `TH-${event.id}-${Date.now()}`;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[alpha] addebito tentativo ${attempt} ${reference} ${total}`);
          charge = await alpha.charge({
            amountCents: Math.round(total * 100),
            currency: 'EUR',
            reference,
            card: body.card,
          });
          console.log(`[alpha] esito ${charge.status} ${charge.chargeId}`);
          break;
        } catch (err) {
          if (err instanceof AlphaTimeoutError && attempt < 3) {
            console.log('[alpha] timeout, riprovo');
            continue;
          }
          console.log('[alpha] errore', err);
          throw new ServiceUnavailableException('servizio di pagamento non disponibile');
        }
      }
      if (charge!.status === 'declined') throw new HttpException('pagamento rifiutato', 402);
    }

    for (const it of items) {
      const seat = venue.seats.find((s) => s.id === it.seatId)!;
      if (seat.kind === 'numbered') {
        inventory.markSold(event.id, seat.id);
      } else {
        inventory.addStanding(event.id, seat.id, it.quantity);
      }
    }

    const order: Order = {
      id: this.orders.nextId(),
      eventId: event.id,
      userId: userId ?? 'guest',
      email,
      holderName: body.holderName,
      items,
      total,
      status: 'paid',
      alphaChargeId: charge ? charge.chargeId : null,
      createdAt: new Date().toISOString(),
    };
    this.orders.save(order);

    const issued = this.ticketsService.createForOrder(order, venue);
    const html = issued.map((t) => this.ticketsService.render(t, 'html')).join('\n');
    this.mailer.send(email, `I tuoi biglietti per ${event.title}`, html);

    return {
      order,
      tickets: issued.map((t) => ({ id: t.id, seatId: t.seatId, price: t.price, code: t.code })),
    };
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    const order = this.orders.findById(id);
    if (!order) throw new NotFoundException('ordine non trovato');
    return { order, tickets: this.tickets.findByOrder(order.id) };
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    const order = this.orders.findById(id);
    if (!order) throw new NotFoundException('ordine non trovato');
    if (order.status !== 'paid') throw new BadRequestException('ordine non annullabile');
    const event = this.events.findById(order.eventId)!;
    const venue = this.venues.findById(event.venueId)!;

    if (order.alphaChargeId) {
      const client = new AlphaPayClient(process.env.ALPHA_API_KEY ?? 'sk_test_tickethub');
      let done = false;
      for (let attempt = 1; attempt <= 2 && !done; attempt++) {
        try {
          console.log(`[alpha] rimborso tentativo ${attempt} ${order.alphaChargeId}`);
          await client.refund(order.alphaChargeId, Math.round(order.total * 100));
          done = true;
        } catch (err) {
          if (err instanceof AlphaTimeoutError) {
            console.log('[alpha] timeout rimborso');
            continue;
          }
          throw new ServiceUnavailableException('rimborso non riuscito');
        }
      }
      if (!done) throw new ServiceUnavailableException('rimborso non riuscito');
    }

    const inventory = SeatInventory.getInstance();
    for (const it of order.items) {
      const seat = venue.seats.find((s) => s.id === it.seatId)!;
      if (seat.kind === 'numbered') {
        inventory.release(event.id, seat.id);
      } else {
        inventory.removeStanding(event.id, seat.id, it.quantity);
      }
    }
    for (const t of this.tickets.findByOrder(order.id)) {
      t.status = 'void';
      this.tickets.save(t);
    }
    order.status = 'refunded';
    this.orders.save(order);
    this.mailer.send(order.email, `Rimborso ordine ${order.id}`, `Abbiamo rimborsato EUR ${order.total.toFixed(2)}`);
    return { order };
  }
}
