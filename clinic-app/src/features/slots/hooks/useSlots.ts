import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSlots } from "../api";
import { isSlotBookable } from "../status";

export type AvailabilityFilter = "all" | "available" | "unavailable";

const PAGE_SIZE = 6;

export function useSlots() {
	const query = useQuery({
		queryKey: ["slots"],
		queryFn: () => fetchSlots(),
	});

	const [provider, setProviderState] = useState<string | null>(null);
	const [availability, setAvailabilityState] = useState<AvailabilityFilter>("all");
	const [page, setPage] = useState(1);

	const providers = useMemo(() => {
		if (!query.data) return [];
		return Array.from(new Set(query.data.map((slot) => slot.provider))).sort();
	}, [query.data]);

	const filteredSlots = useMemo(() => {
		if (!query.data) return [];
		return query.data.filter((slot) => {
			if (provider && slot.provider !== provider) return false;
			if (availability === "available" && !isSlotBookable(slot)) return false;
			if (availability === "unavailable" && slot.available) return false;
			return true;
		});
	}, [query.data, provider, availability]);

	const availableCount = useMemo(
		() => filteredSlots.filter(isSlotBookable).length,
		[filteredSlots],
	);

	const totalPages = Math.max(1, Math.ceil(filteredSlots.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const slots = filteredSlots.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	function setProvider(value: string | null) {
		setProviderState(value);
		setPage(1);
	}

	function setAvailability(value: AvailabilityFilter) {
		setAvailabilityState(value);
		setPage(1);
	}

	return {
		...query,
		slots,
		totalCount: availableCount,
		providers,
		provider,
		setProvider,
		availability,
		setAvailability,
		page: currentPage,
		setPage,
		totalPages,
	};
}
