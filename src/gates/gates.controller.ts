import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import type { GkDecision } from '../../vendor/gatekeeper';
import { GatesService } from './gates.service';
import { ScanDto } from './scan.dto';

@Controller('gates')
export class GatesController {
  constructor(private readonly gates: GatesService) {}

  @Post(':gate/scan')
  @HttpCode(200)
  scan(@Param('gate') gate: string, @Body() body: ScanDto): GkDecision {
    return this.gates.scan(gate, body.raw);
  }
}
