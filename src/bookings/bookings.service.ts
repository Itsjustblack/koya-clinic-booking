import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { Booking } from '../generated/prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { BookingStatus } from '../generated/prisma/enums.js';
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

    if (slot.start <= new Date()) {
      throw new HttpException(
        { error: ERROR_MESSAGES.SLOT_ALREADY_STARTED },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        slotId: input.slot_id,
        status: BookingStatus.CONFIRMED,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new HttpException(
        { error: ERROR_MESSAGES.SLOT_ALREADY_BOOKED },
        HttpStatus.CONFLICT,
      );
    }

    let booking: Booking;

    try {
      booking = await this.prisma.booking.create({
        data: {
          id: nanoid(12),
          slotId: input.slot_id,
          name: input.name,
          email: input.email,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpException(
          { error: ERROR_MESSAGES.SLOT_ALREADY_BOOKED },
          HttpStatus.CONFLICT,
        );
      }

      throw error;
    }

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

  async cancel(id: string) {
    const result = await this.prisma.booking.updateMany({
      where: {
        id,
        status: BookingStatus.CONFIRMED,
      },
      data: { status: BookingStatus.CANCELLED },
    });

    if (result.count === 0) {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        throw new HttpException(
          { error: ERROR_MESSAGES.BOOKING_NOT_FOUND },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        { error: ERROR_MESSAGES.BOOKING_ALREADY_CANCELLED },
        HttpStatus.CONFLICT,
      );
    }

    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id },
    });

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
