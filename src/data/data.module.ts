import { Global, Module } from '@nestjs/common';
import { EventsRepository } from './events.repository.js';
import { OrdersRepository } from './orders.repository.js';
import { TicketsRepository } from './tickets.repository.js';
import { UsersRepository } from './users.repository.js';
import { VenuesRepository } from './venues.repository.js';

@Global()
@Module({
  providers: [EventsRepository, VenuesRepository, UsersRepository, OrdersRepository, TicketsRepository],
  exports: [EventsRepository, VenuesRepository, UsersRepository, OrdersRepository, TicketsRepository],
})
export class DataModule {}
