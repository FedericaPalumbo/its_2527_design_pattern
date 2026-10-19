import { Injectable } from '@nestjs/common';
import { seedEvents } from './seed';
import type { EventRecord } from './types';

@Injectable()
export class EventsRepository {
  private readonly events = new Map<string, EventRecord>(seedEvents().map((e) => [e.id, e]));

  findAll(): EventRecord[] {
    return [...this.events.values()];
  }

  findById(id: string): EventRecord | undefined {
    return this.events.get(id);
  }

  save(event: EventRecord): void {
    this.events.set(event.id, event);
  }
}
