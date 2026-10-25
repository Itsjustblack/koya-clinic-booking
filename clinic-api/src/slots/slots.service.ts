import { Injectable } from '@nestjs/common';
import { BookingStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../database/prisma.service.js';
import { ResetSlotDto } from './dto/reset-slots.dto.js';

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async reset(slots: ResetSlotDto[]) {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.booking.deleteMany();
      await transaction.slot.deleteMany();
      await transaction.slot.createMany({
        data: slots.map((slot) => ({
          id: slot.id,
          provider: slot.provider,
          start: new Date(slot.start),
          end: new Date(slot.end),
        })),
      });
    });
  }

  async findAll(provider?: string) {
    const slots = await this.prisma.slot.findMany({
      where: provider ? { provider } : undefined,
      orderBy: { start: 'asc' },
      include: {
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { id: true },
          take: 1,
        },
      },
    });

    return {
      slots: slots.map(({ bookings, ...slot }) => ({
        ...slot,
        available: bookings.length === 0,
      })),
    };
  }
}
