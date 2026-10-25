import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking, type CreateBookingInput } from "../api";

export function useCreateBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateBookingInput) => createBooking(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["slots"] });
		},
	});
}
