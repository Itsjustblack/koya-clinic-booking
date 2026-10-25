import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { BookingCard } from "./booking-card";
import type { Booking } from "@/types/api";

export function BookingConfirmationDialog({
	booking,
	onOpenChange,
}: {
	booking: Booking | null;
	onOpenChange: (open: boolean) => void;
}) {
	if (!booking) return null;

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Booking Confirmed</DialogTitle>
					<DialogDescription>Here are your booking details.</DialogDescription>
				</DialogHeader>
				<BookingCard booking={booking} />
			</DialogContent>
		</Dialog>
	);
}
