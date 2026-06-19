const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env;

export const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? "http://localhost:8000";
export const CACHE_TTL_MS = 15 * 60 * 1000;
export const CHECK_TIMEOUT_MS = 2500;
