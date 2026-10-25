import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSlotDate, formatSlotTimeRange } from "@/lib/format";
import { isSlotExpired } from "../status";
import type { Slot } from "@/types/api";

const STATUS_LABEL = {
	available: "Available",
	booked: "Booked",
	expired: "Expired",
};

const BADGE_STYLES = {
	available: "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	booked: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	expired: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const BUTTON_STYLES = {
	available: "border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
	booked: "border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
	expired: "border-transparent bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700",
};

const BUTTON_TEXT = {
	available: "Book this slot",
	booked: "Booked",
	expired: "Expired",
};

export function SlotCard({ slot, onBook }: { slot: Slot; onBook: (slot: Slot) => void }) {
	const status = !slot.available ? "booked" : isSlotExpired(slot) ? "expired" : "available";
	const canBook = status === "available";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle>{slot.provider}</CardTitle>
					<Badge className={BADGE_STYLES[status]}>{STATUS_LABEL[status]}</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">{formatSlotDate(slot.start)}</p>
				<p className="font-medium">{formatSlotTimeRange(slot.start, slot.end)}</p>
			</CardContent>
			<CardFooter>
				<Button
					className={`w-full ${BUTTON_STYLES[status]}`}
					disabled={!canBook}
					onClick={() => onBook(slot)}
				>
					{BUTTON_TEXT[status]}
				</Button>
			</CardFooter>
		</Card>
	);
}
