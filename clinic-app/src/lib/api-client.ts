import axios from "axios";

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"X-API-Key": import.meta.env.VITE_API_KEY,
	},
});
