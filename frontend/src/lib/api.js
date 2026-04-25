import axios from 'axios';

// In dev, Vite proxy forwards /api/* to localhost:8000
// In production, same-origin or set VITE_API_URL env var
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_BASE = `${BASE_URL}/api/v1`;
export const UPLOADS_BASE = `${BASE_URL}/uploads`;

/**
 * Create an axios instance with auth header.
 * Call with no args for unauthenticated requests.
 */
export function createApi(token) {
  return axios.create({
    baseURL: API_BASE,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/**
 * Get the full URL for an uploaded image.
 */
export function getImageUrl(storageKey) {
  if (!storageKey) return '';
  return `${UPLOADS_BASE}/${storageKey}`;
}
