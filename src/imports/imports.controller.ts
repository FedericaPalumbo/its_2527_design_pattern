import { Body, Controller, Post } from '@nestjs/common';
import { ImportsService } from './imports.service.js';

@Controller('imports')
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post('promoter-a')
  promoterA(@Body() body: { content: string }) {
    return this.imports.importPromoterA(body.content);
  }

  @Post('promoter-b')
  promoterB(@Body() body: { content: string }) {
    return this.imports.importPromoterB(body.content);
  }
}
