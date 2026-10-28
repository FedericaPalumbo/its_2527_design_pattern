import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderSeatDto {
  @ApiProperty({ description: 'Posto numerato (es. A-1-1) o settore in piedi (es. PIT)', example: 'A-1-1' })
  seatId: string;

  @ApiPropertyOptional({ description: 'Quantità, solo per i posti in piedi', example: 1 })
  quantity?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'e-1' })
  eventId: string;

  @ApiProperty({ type: [OrderSeatDto] })
  seats: OrderSeatDto[];

  @ApiProperty({ description: 'Numero di carta', example: '4242424242424242' })
  card: string;

  @ApiProperty({ example: 'Giulia Rossi' })
  holderName: string;

  @ApiPropertyOptional({
    description: "Obbligatoria se manca l'header x-user-id",
    example: 'giulia.rossi@example.com',
  })
  email?: string;
}
