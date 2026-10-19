import { Module } from '@nestjs/common';
import { AlphaWebhookController } from './alpha-webhook.controller.js';

@Module({
  controllers: [AlphaWebhookController],
})
export class PaymentsModule {}
