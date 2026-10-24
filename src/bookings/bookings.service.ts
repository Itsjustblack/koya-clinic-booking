import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import type { Booking } from '../generated/prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { BookingStatus } from '../generated/prisma/enums.js';
import { ERROR_MESSAGES } from '../common/errors/error-messages.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { ListBookingsDto } from './dto/list-bookings.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateBookingDto, idempotencyKey?: string) {
    const normalizedIdempotencyKey = idempotencyKey?.trim() || undefined;

    if (normalizedIdempotencyKey) {
      const existingBooking = await this.prisma.booking.findUnique({
        where: { idempotencyKey: normalizedIdempotencyKey },
      });

      if (existingBooking) {
        return this.replayIdempotentBooking(existingBooking, input);
      }
    }

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
          idempotencyKey: normalizedIdempotencyKey,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        if (normalizedIdempotencyKey) {
          const existingBooking = await this.prisma.booking.findUnique({
            where: { idempotencyKey: normalizedIdempotencyKey },
          });

          if (existingBooking) {
            return this.replayIdempotentBooking(existingBooking, input);
          }
        }

        throw new HttpException(
          { error: ERROR_MESSAGES.SLOT_ALREADY_BOOKED },
          HttpStatus.CONFLICT,
        );
      }

      throw error;
    }

    return this.toResponseDto(booking);
  }

  private replayIdempotentBooking(
    booking: Booking,
    input: CreateBookingDto,
  ) {
    const matchesRequest =
      booking.slotId === input.slot_id &&
      booking.name === input.name &&
      booking.email === input.email;

    if (!matchesRequest) {
      throw new HttpException(
        { error: ERROR_MESSAGES.IDEMPOTENCY_KEY_REUSED },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
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

  async findAll(query: ListBookingsDto) {
    const bookings = await this.prisma.booking.findMany({
      where: { email: query.email },
      orderBy: { createdAt: 'asc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit + 1,
    });

    const hasMore = bookings.length > query.limit;
    const page = hasMore ? bookings.slice(0, query.limit) : bookings;

    return {
      bookings: page.map((booking) => this.toResponseDto(booking)),
      page: query.page,
      limit: query.limit,
      has_next_page: hasMore,
      has_previous_page: query.page > 1,
    };
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
