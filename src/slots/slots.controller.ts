import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ResetSlotsDto } from './dto/reset-slots.dto.js';
import { SlotsService } from './slots.service.js';

@Controller()
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
)
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async reset(@Body() body: ResetSlotsDto) {
    await this.slotsService.reset(body.slots);
  }

  @Get('slots')
  findAll(@Query('provider') provider?: string) {
    return this.slotsService.findAll(provider);
  }
}
