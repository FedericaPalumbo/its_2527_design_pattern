import { ApiProperty } from '@nestjs/swagger';

export class ImportFeedDto {
  @ApiProperty({
    description: 'Contenuto del feed: CSV per il promoter A, JSON in stringa per il promoter B',
    example: 'codice;titolo;data;locale;prezzi\nX1;Concerto di prova;12/06/2027 21:00;v-arena;PIT=49,90|A=69,90',
  })
  content: string;
}
