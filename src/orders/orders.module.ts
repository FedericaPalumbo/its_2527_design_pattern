import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { TicketsModule } from '../tickets/tickets.module.js';
import { OrdersController } from './orders.controller.js';

@Module({
  imports: [TicketsModule, NotificationsModule],
  controllers: [OrdersController],
})
export class OrdersModule {}
