import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../data/events.repository';
import type { EventRecord } from '../data/types';

@Injectable()
export class EventsService {
  constructor(private readonly events: EventsRepository) {}

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
    return (min * 1.12).toFixed(2);
  }
}
