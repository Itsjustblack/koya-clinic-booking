import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { ListBookingsDto } from './dto/list-bookings.dto.js';

@Controller('bookings')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(
    @Body() body: CreateBookingDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.bookingsService.create(body, idempotencyKey);
  }

  @Get()
  findAll(@Query() query: ListBookingsDto) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
