import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { Booking } from "@/types/api";

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<p className="text-sm">
			<span className="text-muted-foreground">{label}: </span>
			<span className="font-medium text-foreground">{value}</span>
		</p>
	);
}

export function BookingCard({
	booking,
	onCancel,
	isCancelling,
}: {
	booking: Booking;
	onCancel?: (booking: Booking) => void;
	isCancelling?: boolean;
}) {
	const isConfirmed = booking.status === "confirmed";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle>{booking.name}</CardTitle>
					<Badge
						className={
							isConfirmed
								? "border-transparent bg-green-100 text-green-700 capitalize dark:bg-green-900/30 dark:text-green-400"
								: "border-transparent bg-red-100 text-red-700 capitalize dark:bg-red-900/30 dark:text-red-400"
						}
					>
						{booking.status}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-1.5">
				<DetailRow label="Email" value={booking.email} />
				<DetailRow label="Slot" value={booking.slot_id} />
				<DetailRow label="Booked" value={formatDateTime(booking.created_at)} />
				<DetailRow label="Booking ID" value={booking.id} />
			</CardContent>
			{isConfirmed && onCancel && (
				<CardFooter>
					<Button
						className="w-full border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
						disabled={isCancelling}
						onClick={() => onCancel(booking)}
					>
						{isCancelling ? "Cancelling…" : "Cancel booking"}
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
