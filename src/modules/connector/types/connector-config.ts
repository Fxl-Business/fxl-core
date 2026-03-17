/**
 * Configuration for a single spoke connector.
 * Stored in tenant_modules.config as JSON (module_id = 'connector:<appId>').
 * Everything else (entities, widgets) comes from the spoke's manifest.
 */
export interface ConnectorConfig {
  /** Unique spoke identifier, matches FxlAppManifest.appId (e.g., "sitio-santa-cruz") */
  appId: string
  /** Display name for the connector (e.g., "Sitio Santa Cruz") */
  appName: string
  /** Base URL of the spoke API (e.g., "https://sitio-santa-cruz.vercel.app") */
  baseUrl: string
  /** API key for authenticating hub→spoke requests (sent as X-FXL-API-Key header) */
  apiKey: string
}

/** Runtime status of a connector */
export type ConnectorStatus = 'online' | 'offline' | 'error' | 'loading'
