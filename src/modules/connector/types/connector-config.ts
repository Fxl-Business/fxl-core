/**
 * Configuration for a single spoke connector.
 * Stored in tenant_modules.config as JSON.
 * Everything else (entities, widgets) comes from the spoke's manifest.
 */
export interface ConnectorConfig {
  /** Unique spoke identifier, matches FxlAppManifest.appId (e.g., "beach-houses") */
  appId: string
  /** Base URL of the spoke API (e.g., "https://beach.fxl.app") */
  baseUrl: string
}

/** Runtime status of a connector */
export type ConnectorStatus = 'online' | 'offline' | 'error' | 'loading'
