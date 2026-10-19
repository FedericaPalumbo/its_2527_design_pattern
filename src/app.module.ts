import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module.js';
import { EventsModule } from './events/events.module.js';
import { GatesModule } from './gates/gates.module.js';
import { HealthController } from './health.controller.js';
import { ImportsModule } from './imports/imports.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { VenuesModule } from './venues/venues.module.js';

@Module({
  imports: [
    DataModule,
    NotificationsModule,
    EventsModule,
    VenuesModule,
    TicketsModule,
    OrdersModule,
    PaymentsModule,
    ReportsModule,
    GatesModule,
    ImportsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
