import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { Booking } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { ERROR_MESSAGES } from '../common/errors/error-messages.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateBookingDto) {
    const slot = await this.prisma.slot.findUnique({
      where: { id: input.slot_id },
    });

    if (!slot) {
      throw new HttpException(
        { error: ERROR_MESSAGES.SLOT_NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        id: nanoid(12),
        slotId: input.slot_id,
        name: input.name,
        email: input.email,
      },
    });

    return this.toResponseDto(booking);
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new HttpException(
        { error: ERROR_MESSAGES.BOOKING_NOT_FOUND },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toResponseDto(booking);
  }

  private toResponseDto(booking: Booking) {
    return {
      id: booking.id,
      slot_id: booking.slotId,
      name: booking.name,
      email: booking.email,
      status: booking.status,
      created_at: booking.createdAt,
    };
  }
}
