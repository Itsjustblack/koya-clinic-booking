import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatSlotDate, formatSlotTimeRange } from "@/lib/format";
import { getApiErrorMessage, getRetryAfterSeconds } from "@/lib/api-error";
import { useCreateBooking } from "../hooks";
import type { Slot } from "@/types/api";
import type { Booking } from "@/types/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingDialog({
	slot,
	onOpenChange,
	onBooked,
}: {
	slot: Slot | null;
	onOpenChange: (open: boolean) => void;
	onBooked: (booking: Booking) => void;
}) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [idempotencyKey, setIdempotencyKey] = useState(() =>
		crypto.randomUUID(),
	);
	const [retryAfter, setRetryAfter] = useState<number | null>(null);
	const createBooking = useCreateBooking();

	useEffect(() => {
		if (retryAfter === null || retryAfter <= 0) return;
		const timer = setTimeout(() => setRetryAfter(retryAfter - 1), 1000);
		return () => clearTimeout(timer);
	}, [retryAfter]);

	if (!slot) return null;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!slot) return;
		const trimmedName = name.trim();
		const trimmedEmail = email.trim();

		if (!trimmedName || !trimmedEmail) {
			setFieldError("Name and email are required.");
			return;
		}
		if (!EMAIL_PATTERN.test(trimmedEmail)) {
			setFieldError("Enter a valid email address.");
			return;
		}
		setFieldError(null);

		createBooking.mutate(
			{
				slot_id: slot.id,
				name: trimmedName,
				email: trimmedEmail,
				idempotencyKey,
			},
			{
				onSuccess: (booking) => {
					onOpenChange(false);
					onBooked(booking);
					toast.success("Booking confirmed");
				},
				onError: (error) => {
					const seconds = getRetryAfterSeconds(error);
					if (seconds !== null) {
						setRetryAfter(seconds);
						toast.error(`Too many attempts. Try again in ${seconds}s.`);
						return;
					}
					if (isAxiosError(error) && error.response?.status === 422) {
						// A fresh key avoids re-hitting the same idempotency conflict on retry.
						setIdempotencyKey(crypto.randomUUID());
					}
					toast.error(getApiErrorMessage(error));
				},
			},
		);
	}

	const isRateLimited = retryAfter !== null && retryAfter > 0;

	return (
		<Dialog
			open
			onOpenChange={onOpenChange}
			disablePointerDismissal
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Book with {slot.provider}</DialogTitle>
					<DialogDescription>
						{formatSlotDate(slot.start)} ·{" "}
						{formatSlotTimeRange(slot.start, slot.end)}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="booking-name">Full name</Label>
						<Input
							id="booking-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoComplete="name"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="booking-email">Email</Label>
						<Input
							id="booking-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete="email"
						/>
					</div>

					{fieldError && (
						<Alert variant="destructive">
							<AlertDescription>{fieldError}</AlertDescription>
						</Alert>
					)}

					{isRateLimited && (
						<Alert variant="destructive">
							<AlertDescription>
								Too many booking attempts. Try again in {retryAfter}s.
							</AlertDescription>
						</Alert>
					)}

					<DialogFooter>
						<Button
							type="submit"
							disabled={createBooking.isPending || isRateLimited}
						>
							{createBooking.isPending ? "Booking…" : "Confirm"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
