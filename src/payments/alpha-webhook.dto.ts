import { ApiProperty } from '@nestjs/swagger';
import type { AlphaWebhookEvent } from '../../vendor/alpha-pay';

export class AlphaWebhookDto implements AlphaWebhookEvent {
  @ApiProperty({ enum: ['charge.refunded', 'charge.disputed'] })
  type: 'charge.refunded' | 'charge.disputed';

  @ApiProperty({ example: 'ch_000001' })
  chargeId: string;
}
