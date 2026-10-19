import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../data/events.repository';
import { VenuesRepository } from '../data/venues.repository';

export interface ImportResult {
  imported: string[];
  skipped: { row: number; reason: string }[];
}

@Injectable()
export class ImportsService {
  constructor(
    private readonly events: EventsRepository,
    private readonly venues: VenuesRepository,
  ) {}

  importPromoterA(csv: string): ImportResult {
    const result: ImportResult = { imported: [], skipped: [] };
    const lines = csv.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].trim().split(';');
      const code = cols[0];
      const title = cols[1];
      const [day, month, rest] = cols[2].split('/');
      const [year, time] = rest.split(' ');
      const date = new Date(`${year}-${month}-${day}T${time}:00`);
      const venueId = cols[3];
      const prices: Record<string, number> = {};
      for (const p of cols[4].split('|')) {
        const [sector, amount] = p.split('=');
        prices[sector] = parseFloat(amount.replace(',', '.'));
      }
      if (!title) {
        result.skipped.push({ row: i + 1, reason: 'titolo mancante' });
        continue;
      }
      if (isNaN(date.getTime()) || date.getTime() < Date.now()) {
        result.skipped.push({ row: i + 1, reason: 'data non valida o passata' });
        continue;
      }
      if (!this.venues.findById(venueId)) {
        result.skipped.push({ row: i + 1, reason: 'locale sconosciuto' });
        continue;
      }
      this.events.save({
        id: 'imp-' + code,
        title,
        venueId,
        date: date.toISOString(),
        promoter: 'A',
        organizerId: 'u-org-1',
        status: 'draft',
        pricingType: 'standard',
        sectorPrices: prices,
      });
      result.imported.push('imp-' + code);
    }
    return result;
  }

  importPromoterB(json: string): ImportResult {
    const result: ImportResult = { imported: [], skipped: [] };
    const data = JSON.parse(json);
    for (let i = 0; i < data.events.length; i++) {
      const e = data.events[i];
      const code = e.ref;
      const title = e.name;
      const date = new Date(e.startsAt);
      const venueId = e.venueCode;
      const prices: Record<string, number> = {};
      for (const p of e.prices) {
        prices[p.sector] = p.amount;
      }
      if (!title) {
        result.skipped.push({ row: i + 1, reason: 'titolo mancante' });
        continue;
      }
      if (isNaN(date.getTime()) || date.getTime() < Date.now()) {
        result.skipped.push({ row: i + 1, reason: 'data non valida o passata' });
        continue;
      }
      // TODO controllare il locale come per il promoter A
      this.events.save({
        id: 'imp-' + code,
        title,
        venueId,
        date: date.toISOString(),
        promoter: 'B',
        organizerId: 'u-org-2',
        status: 'draft',
        pricingType: 'standard',
        sectorPrices: prices,
      });
      result.imported.push('imp-' + code);
    }
    return result;
  }
}
