import { Body, Controller, Post } from '@nestjs/common';
import { ImportFeedDto } from './import-feed.dto';
import { ImportsService } from './imports.service';

@Controller('imports')
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post('promoter-a')
  promoterA(@Body() body: ImportFeedDto) {
    return this.imports.importPromoterA(body.content);
  }

  @Post('promoter-b')
  promoterB(@Body() body: ImportFeedDto) {
    return this.imports.importPromoterB(body.content);
  }
}
