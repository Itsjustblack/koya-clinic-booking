import type { Slot } from "@/types/api";

export function isSlotExpired(slot: Slot): boolean {
	return new Date(slot.start).getTime() < Date.now();
}

export function isSlotBookable(slot: Slot): boolean {
	return slot.available && !isSlotExpired(slot);
}
