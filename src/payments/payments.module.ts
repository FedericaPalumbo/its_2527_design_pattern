import { Module } from '@nestjs/common';
import { AlphaWebhookController } from './alpha-webhook.controller';

@Module({
  controllers: [AlphaWebhookController],
})
export class PaymentsModule {}
