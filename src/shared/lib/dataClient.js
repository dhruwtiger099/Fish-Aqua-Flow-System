/** Infrastructure boundary: feature services depend on this client; UI never calls fetch directly. */
import { appConfig } from '../config/env';

export async function getJson(path, options = {}) {
  const response = await fetch(`${appConfig.sheetsEndpoint}${path}`, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Data request failed (${response.status})`);
  return response.json();
}

export async function postJson(path, body, options = {}) {
  return getJson(path, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body),
  });
}
