# Phase 138: Admin UI + Retention - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Super admins podem visualizar, filtrar, inspecionar e exportar o historico completo de operacoes criticas via /admin/audit-logs, e o sistema gerencia automaticamente a retencao de logs antigos via pg_cron + platform_settings.

</domain>

<decisions>
## Implementation Decisions

### Table Layout & Data Display
- Timestamps displayed as relative ("2h ago") with absolute datetime on hover tooltip
- Actor column shows truncated email with avatar initial badge (consistent with UsersPage)
- Empty state uses illustrated component with "No audit logs found" message + clear filters CTA
- Default 25 rows per page with 25/50/100 page size selector

### Filter UX
- Filters in horizontal bar above table, inline with page header area
- Date range uses two date inputs (from/to) with preset chips (Today, 7d, 30d, 90d)
- Action type filter is multi-select dropdown with checkboxes listing all 10 action types
- Org filter is combobox with search-as-you-type from tenant list

### Detail Sheet & Diff View
- Sheet width 480px (w-[480px]) — right-side slide-in
- UPDATE actions show side-by-side before/after diff with red/green highlighting per changed field
- Metadata displayed as formatted key-value pairs with collapsible raw JSON toggle
- Non-UPDATE entries use same Sheet layout minus diff section — all fields + metadata visible

### Export & Retention Config
- Export button top-right of filter bar with Download icon — exports currently filtered results as CSV
- Toast notification "X logs exported" after download starts
- Retention config as new row in existing SettingsPanel with number Input + "days" label
- Retention value validation: min 30, max 365 days — enforced client-side + DB constraint

### Claude's Discretion
- Component decomposition and file organization within src/platform/pages/admin/
- Loading skeleton patterns (follow existing admin page conventions)
- Exact Tailwind classes for diff highlighting colors

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/platform/services/audit-service.ts — queryAuditLogs() read path already implemented (Phase 137)
- src/platform/types/audit.ts — AuditLogRow, AuditQueryParams, AuditQueryResponse, AuditAction, AuditResourceType types
- src/shared/ui/ — sheet.tsx, select.tsx, button.tsx, input.tsx, badge.tsx, dialog.tsx (shadcn)
- src/platform/pages/admin/SettingsPanel.tsx — platform_settings inline edit pattern

### Established Patterns
- Admin pages: useState for filters/loading/error, useEffect for fetching, service layer functions
- Error states: red bordered box with message + Retry button
- Loading: skeleton/animate-pulse divs
- Layout: mx-auto max-w-Xql space-y-6 wrapper
- AdminSidebar: static adminNavItems array with lucide-react icons

### Integration Points
- AdminSidebar.tsx — add "Audit Logs" nav item with lucide-react icon
- AppRouter.tsx — add /admin/audit-logs route
- SettingsPanel.tsx — add audit_retention_days setting row
- platform_settings table — new key for retention config
- pg_cron extension — scheduled job for log cleanup

</code_context>

<specifics>
## Specific Ideas

- Follow exact patterns from UsersPage.tsx and TenantsPage.tsx for table + filter composition
- Use native Blob API + URL.createObjectURL for CSV export (no server-side endpoint)
- pg_cron job reads retention period dynamically from platform_settings
- SECURITY DEFINER function for cleanup to bypass RLS on audit_logs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
