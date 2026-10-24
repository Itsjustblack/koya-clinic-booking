/*
  Warnings:

  - A unique constraint covering the columns `[slot_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bookings_slot_id_status_idx";

-- CreateIndex
CREATE UNIQUE INDEX "bookings_one_confirmed_booking_per_slot_idx" ON "bookings"("slot_id") WHERE (status = 'confirmed');
