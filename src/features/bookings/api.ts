import { apiClient } from "@/lib/api-client";
import type { Booking, BookingsPage } from "@/types/api";

export interface CreateBookingInput {
	slot_id: string;
	name: string;
	email: string;
	idempotencyKey: string;
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
	const { slot_id, name, email, idempotencyKey } = input;
	const { data } = await apiClient.post<Booking>(
		"/bookings",
		{ slot_id, name, email },
		{ headers: { "Idempotency-Key": idempotencyKey } },
	);
	return data;
}

export async function fetchBooking(id: string): Promise<Booking> {
	const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
	return data;
}

export async function fetchBookings(
	email: string,
	cursor: string | null,
	limit: number,
): Promise<BookingsPage> {
	const { data } = await apiClient.get<BookingsPage>("/bookings", {
		params: { email, limit, cursor: cursor ?? undefined },
	});
	return data;
}

export async function cancelBooking(id: string): Promise<Booking> {
	const { data } = await apiClient.delete<Booking>(`/bookings/${id}`);
	return data;
}
