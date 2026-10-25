import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
	if (isAxiosError<{ error?: string }>(error)) {
		return error.response?.data?.error ?? fallback;
	}
	return fallback;
}

export function getRetryAfterSeconds(error: unknown): number | null {
	if (isAxiosError(error) && error.response?.status === 429) {
		const header = error.response.headers["retry-after"];
		const seconds = Number(header);
		return Number.isFinite(seconds) ? seconds : null;
	}
	return null;
}
