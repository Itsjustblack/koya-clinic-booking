import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBooking } from "../api";

export function useCancelBooking() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => cancelBooking(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["slots"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
		},
	});
}
