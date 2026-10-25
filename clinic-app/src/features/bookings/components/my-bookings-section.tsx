import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getApiErrorMessage, getRetryAfterSeconds } from "@/lib/api-error";
import { useBookings, useCancelBooking } from "../hooks";
import { BookingCard } from "./booking-card";
import type { Booking } from "@/types/api";

export function MyBookingsSection() {
	const [emailInput, setEmailInput] = useState("");
	const [searchedEmail, setSearchedEmail] = useState("");
	const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
	const [cursorIndex, setCursorIndex] = useState(0);
	const [cancellingId, setCancellingId] = useState<string | null>(null);

	const { data, isLoading, isError, error, isFetching } = useBookings(
		searchedEmail,
		cursorStack[cursorIndex],
	);
	const cancelBooking = useCancelBooking();

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		setCursorStack([null]);
		setCursorIndex(0);
		setSearchedEmail(emailInput.trim().toLowerCase());
	}

	function goToNextPage() {
		if (!data?.next_cursor) return;
		setCursorStack((stack) => [
			...stack.slice(0, cursorIndex + 1),
			data.next_cursor,
		]);
		setCursorIndex((i) => i + 1);
	}

	function goToPreviousPage() {
		setCursorIndex((i) => Math.max(0, i - 1));
	}

	function handleCancel(booking: Booking) {
		setCancellingId(booking.id);
		cancelBooking.mutate(booking.id, {
			onSuccess: () => toast.error("Booking cancelled"),
			onError: (error) => {
				const seconds = getRetryAfterSeconds(error);
				toast.error(
					seconds !== null
						? `Too many attempts. Try again in ${seconds}s.`
						: getApiErrorMessage(error),
				);
			},
			onSettled: () => setCancellingId(null),
		});
	}

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">My Bookings</h2>

			<form
				onSubmit={handleSearch}
				className="flex items-end gap-2"
			>
				<div className="flex-1 space-y-2">
					<Label htmlFor="lookup-email">Email</Label>
					<Input
						id="lookup-email"
						type="email"
						placeholder="you@example.com"
						value={emailInput}
						onChange={(e) => setEmailInput(e.target.value)}
					/>
				</div>
				<Button
					type="submit"
					disabled={!emailInput.trim()}
				>
					Search
				</Button>
			</form>

			{isLoading && (
				<div className="grid gap-4 sm:grid-cols-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-36"
						/>
					))}
				</div>
			)}

			{isError && (
				<Alert variant="destructive">
					<AlertTitle>Couldn't load bookings</AlertTitle>
					<AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
				</Alert>
			)}

			{data && data.bookings.length === 0 && (
				<p className="text-sm text-muted-foreground">
					No bookings for this email.
				</p>
			)}

			{data && data.bookings.length > 0 && (
				<>
					<div className="grid gap-4 sm:grid-cols-2">
						{data.bookings.map((booking) => (
							<BookingCard
								key={booking.id}
								booking={booking}
								onCancel={handleCancel}
								isCancelling={cancellingId === booking.id}
							/>
						))}
					</div>

					{(cursorIndex > 0 || data.next_cursor) && (
						<div className="flex items-center justify-between pt-2">
							<Button
								variant="outline"
								size="sm"
								disabled={cursorIndex === 0 || isFetching}
								onClick={goToPreviousPage}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {cursorIndex + 1}
							</span>
							<Button
								variant="outline"
								size="sm"
								disabled={!data.next_cursor || isFetching}
								onClick={goToNextPage}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
