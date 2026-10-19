import { Global, Module } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { OrdersRepository } from './orders.repository';
import { TicketsRepository } from './tickets.repository';
import { UsersRepository } from './users.repository';
import { VenuesRepository } from './venues.repository';

@Global()
@Module({
  providers: [EventsRepository, VenuesRepository, UsersRepository, OrdersRepository, TicketsRepository],
  exports: [EventsRepository, VenuesRepository, UsersRepository, OrdersRepository, TicketsRepository],
})
export class DataModule {}
