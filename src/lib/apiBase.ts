/**
 * Browser: same-origin proxy `/api/v1` (cookies work on localhost + LAN IP).
 * Server: direct backend URL from BACKEND_URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }

  const backend = process.env.BACKEND_URL?.replace(/\/$/, '') ?? '';
  if (!backend) {
    throw new Error('BACKEND_URL is not set');
  }

  return `${backend}/v1`;
}
