import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSlots, type AvailabilityFilter } from "../hooks";
import { SlotCard } from "./slot-card";
import type { Slot } from "@/types/api";
import { getApiErrorMessage } from "@/lib/api-error";

const ALL_PROVIDERS = "__all__";

const AVAILABILITY_LABELS: Record<AvailabilityFilter, string> = {
	all: "All",
	available: "Available",
	unavailable: "Unavailable",
};

export function SlotsSection({ onBook }: { onBook: (slot: Slot) => void }) {
	const {
		slots,
		totalCount,
		isLoading,
		isError,
		error,
		providers,
		provider,
		setProvider,
		availability,
		setAvailability,
		page,
		setPage,
		totalPages,
	} = useSlots();

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-lg font-semibold">
					Available slots ({totalCount})
				</h2>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Status:</span>
						<Select
							value={availability}
							onValueChange={(value) =>
								setAvailability((value ?? "all") as AvailabilityFilter)
							}
						>
							<SelectTrigger className="w-36">
								<SelectValue placeholder="All">
									{(value: AvailabilityFilter) => AVAILABILITY_LABELS[value]}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="available">Available</SelectItem>
								<SelectItem value="unavailable">Unavailable</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Provider</span>
						<Select
							value={provider ?? ALL_PROVIDERS}
							onValueChange={(value) =>
								setProvider(value === ALL_PROVIDERS ? null : (value ?? null))
							}
						>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="All">
									{(value: string) => (value === ALL_PROVIDERS ? "All" : value)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL_PROVIDERS}>All</SelectItem>
								{providers.map((name) => (
									<SelectItem
										key={name}
										value={name}
									>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{isLoading && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-40"
						/>
					))}
				</div>
			)}

			{isError && (
				<Alert variant="destructive">
					<AlertTitle>Couldn't load slots</AlertTitle>
					<AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
				</Alert>
			)}

			{!isLoading && slots.length === 0 && (
				<p className="text-sm text-muted-foreground">
					No slots match this filter.
				</p>
			)}

			{slots.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{slots.map((slot) => (
						<SlotCard
							key={slot.id}
							slot={slot}
							onBook={onBook}
						/>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-between pt-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
					>
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
