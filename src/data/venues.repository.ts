import { Injectable } from '@nestjs/common';
import { seedVenues } from './seed.js';
import type { Venue } from './types.js';

@Injectable()
export class VenuesRepository {
  private readonly venues = new Map<string, Venue>(seedVenues().map((v) => [v.id, v]));

  findAll(): Venue[] {
    return [...this.venues.values()];
  }

  findById(id: string): Venue | undefined {
    return this.venues.get(id);
  }
}
