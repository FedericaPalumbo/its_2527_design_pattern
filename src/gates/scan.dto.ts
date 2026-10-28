import { ApiProperty } from '@nestjs/swagger';

export class ScanDto {
  @ApiProperty({ description: 'Codice letto dal varco', example: 'TH|<id biglietto>|<checksum>' })
  raw: string;
}
