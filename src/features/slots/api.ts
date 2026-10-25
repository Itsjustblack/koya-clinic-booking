import { apiClient } from "@/lib/api-client";
import type { Slot } from "@/types/api";

export async function fetchSlots(provider?: string): Promise<Slot[]> {
	const { data } = await apiClient.get<{ slots: Slot[] }>("/slots", {
		params: provider ? { provider } : undefined,
	});
	return data.slots;
}
