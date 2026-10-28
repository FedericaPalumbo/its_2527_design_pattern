import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../data/events.repository';
import { TicketsRepository } from '../data/tickets.repository';
import type { EventRecord } from '../data/types';
import { applyEarlyBirdDiscount, isEarlyBirdActive } from '../shared/early-bird';

@Injectable()
export class EventsService {
  constructor(
    private readonly events: EventsRepository,
    private readonly tickets: TicketsRepository,
  ) { }

  listOnSale(): EventRecord[] {
    return this.events.findAll().filter((e) => e.status === 'on_sale');
  }

  // prezzo "a partire da" mostrato in vetrina, commissione inclusa
  priceFrom(event: EventRecord): string {
    let min = 0;
    switch (event.pricingType) {
      case 'standard':
        min = Math.min(...Object.values(event.sectorPrices));
        break;
      case 'flat':
        min = event.flatPrice ?? 0;
        break;
      case 'free':
        min = 0;
        break;
    }

    // early bird: finché la soglia non è raggiunta, la vetrina mostra il prezzo scontato.
    // Lo sconto va applicato prima della commissione, come negli ordini.
    if (isEarlyBirdActive(event.id, this.tickets.countByEvent(event.id))) {
      min = applyEarlyBirdDiscount(min);
    }

    return (min * 1.12).toFixed(2);
  }
}