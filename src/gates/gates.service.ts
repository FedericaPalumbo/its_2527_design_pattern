import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  GK_REJECT_ALREADY_USED,
  GK_REJECT_INVALID,
  GK_REJECT_VOID,
  Gatekeeper,
  type GkDecision,
  type GkScanEvent,
} from '../../vendor/gatekeeper';
import { TicketsRepository } from '../data/tickets.repository';
import { checksum } from '../tickets/tickets.service';

@Injectable()
export class GatesService implements OnModuleInit {
  private gk: Gatekeeper;

  constructor(private readonly tickets: TicketsRepository) {}

  onModuleInit(): void {
    this.gk = new Gatekeeper({ site: 'arena-nord' });
    for (const gate of ['G1', 'G2', 'G3']) {
      this.gk.connect(gate, (e) => this.onScan(e));
    }
  }

  onScan(e: GkScanEvent): void {
    const parts = e.raw.split('|');
    if (parts.length !== 3 || parts[0] !== 'TH' || checksum(parts[1]) !== parts[2]) {
      console.log(`[varchi] ${e.gate} codice non valido ${e.raw}`);
      this.gk.reject(e.gate, GK_REJECT_INVALID);
      return;
    }
    const ticket = this.tickets.findById(parts[1]);
    if (!ticket) {
      this.gk.reject(e.gate, GK_REJECT_INVALID);
      return;
    }
    if (ticket.status === 'used') {
      this.gk.reject(e.gate, GK_REJECT_ALREADY_USED);
      return;
    }
    if (ticket.status === 'void') {
      this.gk.reject(e.gate, GK_REJECT_VOID);
      return;
    }
    ticket.status = 'used';
    this.tickets.save(ticket);
    console.log(`[varchi] ${e.gate} ingresso ${ticket.id} alle ${new Date(e.ts).toISOString()}`);
    this.gk.open(e.gate);
  }

  scan(gate: string, raw: string): GkDecision {
    this.gk.simulate(gate, raw);
    return this.gk.lastDecision(gate)!;
  }
}
