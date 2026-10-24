import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { RateLimitService } from './rate-limit.service.js';
import { RateLimitGuard } from '../common/guards/rate-limit.guard.js';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, RateLimitService, RateLimitGuard],
})
export class BookingsModule {}
