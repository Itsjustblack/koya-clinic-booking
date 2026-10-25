import { useQuery } from "@tanstack/react-query";
import { fetchBookings } from "../api";

export function useBookings(email: string, cursor: string | null, limit = 4) {
	return useQuery({
		queryKey: ["bookings", email, cursor, limit],
		queryFn: () => fetchBookings(email, cursor, limit),
		enabled: email.length > 0,
	});
}
