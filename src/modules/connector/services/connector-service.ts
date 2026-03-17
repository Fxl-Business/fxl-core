/**
 * Connector service — fetches data from spoke APIs via the FXL contract.
 *
 * All requests use a 5s timeout via AbortController.
 * Error handling per spec Section 6.4:
 * - Offline/timeout: returns { error: 'offline' }
 * - 401: caller should retry with refreshed token, then show "Reconnect"
 * - 500: returns { error: 'server-error' }
 * - Invalid manifest: returns { error: 'invalid-manifest' }
 */

import type {
  FxlAppManifest,
  FxlPaginatedResponse,
  FxlKpiData,
  FxlChartData,
  FxlTableData,
  FxlListData,
  FxlHealthResponse,
} from '../types'

const TIMEOUT_MS = 5000

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export type ConnectorError =
  | { type: 'offline'; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'server-error'; message: string; statusCode: number }
  | { type: 'invalid-manifest'; message: string }
  | { type: 'unknown'; message: string }

export type ConnectorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ConnectorError }

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build headers including API key for spoke authentication */
function buildHeaders(apiKey?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  if (apiKey) {
    headers['X-FXL-API-Key'] = apiKey
  }
  return headers
}

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

function buildError(err: unknown): ConnectorError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { type: 'offline', message: 'Request timed out (5s)' }
  }
  if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network'))) {
    return { type: 'offline', message: 'Network error — spoke may be offline' }
  }
  return { type: 'unknown', message: String(err) }
}

async function handleResponse<T>(response: Response): Promise<ConnectorResult<T>> {
  if (response.ok) {
    const data = await response.json() as T
    return { ok: true, data }
  }

  if (response.status === 401) {
    return { ok: false, error: { type: 'unauthorized', message: 'Authentication failed — token may be expired' } }
  }

  if (response.status >= 500) {
    return { ok: false, error: { type: 'server-error', message: `Spoke returned ${response.status}`, statusCode: response.status } }
  }

  return { ok: false, error: { type: 'unknown', message: `Unexpected status ${response.status}` } }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch the spoke's manifest (GET /api/fxl/manifest) */
export async function fetchManifest(baseUrl: string, apiKey?: string): Promise<ConnectorResult<FxlAppManifest>> {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/fxl/manifest`, { headers: buildHeaders(apiKey) })
    const result = await handleResponse<FxlAppManifest>(response)

    // Validate manifest shape
    if (result.ok) {
      const m = result.data
      if (!m.appId || !m.appName || !Array.isArray(m.entities)) {
        return { ok: false, error: { type: 'invalid-manifest', message: 'Manifest missing required fields (appId, appName, entities)' } }
      }
    }

    return result
  } catch (err) {
    return { ok: false, error: buildError(err) }
  }
}

/** Fetch a paginated list of entities (GET /api/fxl/entities/:type) */
export async function fetchEntities(
  baseUrl: string,
  entityType: string,
  page = 1,
  pageSize = 20,
  apiKey?: string,
): Promise<ConnectorResult<FxlPaginatedResponse<Record<string, unknown>>>> {
  try {
    const url = `${baseUrl}/api/fxl/entities/${encodeURIComponent(entityType)}?page=${page}&pageSize=${pageSize}`
    const response = await fetchWithTimeout(url, { headers: buildHeaders(apiKey) })
    return handleResponse(response)
  } catch (err) {
    return { ok: false, error: buildError(err) }
  }
}

/** Fetch a single entity by ID (GET /api/fxl/entities/:type/:id) */
export async function fetchEntity(
  baseUrl: string,
  entityType: string,
  entityId: string,
  apiKey?: string,
): Promise<ConnectorResult<Record<string, unknown>>> {
  try {
    const url = `${baseUrl}/api/fxl/entities/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`
    const response = await fetchWithTimeout(url, { headers: buildHeaders(apiKey) })
    return handleResponse(response)
  } catch (err) {
    return { ok: false, error: buildError(err) }
  }
}

/** Fetch widget data (GET /api/fxl/widgets/:id/data) */
export async function fetchWidgetData<T extends FxlKpiData | FxlChartData | FxlTableData | FxlListData>(
  baseUrl: string,
  widgetEndpoint: string,
  apiKey?: string,
): Promise<ConnectorResult<T>> {
  try {
    // widgetEndpoint is a relative path like "/api/fxl/widgets/total-reservations/data"
    const url = widgetEndpoint.startsWith('http') ? widgetEndpoint : `${baseUrl}${widgetEndpoint}`
    const response = await fetchWithTimeout(url, { headers: buildHeaders(apiKey) })
    return handleResponse(response)
  } catch (err) {
    return { ok: false, error: buildError(err) }
  }
}

/** Check spoke health (GET /api/fxl/health) */
export async function fetchHealth(baseUrl: string, apiKey?: string): Promise<ConnectorResult<FxlHealthResponse>> {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/fxl/health`, { headers: buildHeaders(apiKey) })
    return handleResponse(response)
  } catch (err) {
    return { ok: false, error: buildError(err) }
  }
}
