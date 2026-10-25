import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { SlotsSection } from "@/features/slots/components/slots-section";
import { BookingDialog } from "@/features/bookings/components/booking-dialog";
import { BookingConfirmationDialog } from "@/features/bookings/components/booking-confirmation-dialog";
import { MyBookingsSection } from "@/features/bookings/components/my-bookings-section";
import type { Booking, Slot } from "@/types/api";

function App() {
	const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
	const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-bold">Koya Clinic</h1>
				<p className="text-muted-foreground">Book an appointment with one of our providers.</p>
			</header>

			<Tabs defaultValue="book">
				<TabsList>
					<TabsTrigger value="book">Book a slot</TabsTrigger>
					<TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
				</TabsList>
				<TabsContent value="book" className="pt-4">
					<SlotsSection onBook={setBookingSlot} />
				</TabsContent>
				<TabsContent value="my-bookings" className="pt-4">
					<MyBookingsSection />
				</TabsContent>
			</Tabs>

			<BookingDialog
				key={bookingSlot?.id}
				slot={bookingSlot}
				onOpenChange={(open) => !open && setBookingSlot(null)}
				onBooked={setConfirmedBooking}
			/>

			<BookingConfirmationDialog
				booking={confirmedBooking}
				onOpenChange={(open) => !open && setConfirmedBooking(null)}
			/>

			<Toaster />
		</div>
	);
}

export default App;
