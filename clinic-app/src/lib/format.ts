const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
	weekday: "short",
	month: "short",
	day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
	hour: "numeric",
	minute: "2-digit",
	hour12: true,
});

export function formatSlotDate(iso: string): string {
	return dateTimeFormatter.format(new Date(iso));
}

export function formatSlotTimeRange(startIso: string, endIso: string): string {
	return `${timeFormatter.format(new Date(startIso))} – ${timeFormatter.format(new Date(endIso))}`;
}

export function formatDateTime(iso: string): string {
	return `${dateTimeFormatter.format(new Date(iso))}, ${timeFormatter.format(new Date(iso))}`;
}
