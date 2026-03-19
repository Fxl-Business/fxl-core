# Requirements: Nexo

**Defined:** 2026-03-18
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v7.0 Requirements

Requirements for Admin-Only Org Management milestone.

### Access Control

- [ ] **ACC-01**: Self-service org creation (`/criar-empresa`) is removed — no client-side `createOrganization()` calls
- [ ] **ACC-02**: Only super admin can create organizations (via admin panel)
- [ ] **ACC-03**: User without org membership sees `/solicitar-acesso` screen with clear instructions
- [ ] **ACC-04**: `/solicitar-acesso` screen has Nexo branding, message explaining how to request access, and sign out button

### Admin User Management

- [ ] **ADM-01**: Admin can view list of unaffiliated users (users with 0 org memberships) in admin panel
- [ ] **ADM-02**: Admin can filter users by status (all / unaffiliated / affiliated)
- [ ] **ADM-03**: Admin can link an unaffiliated user to an organization directly from users list
- [ ] **ADM-04**: Admin can search existing unaffiliated users when adding members to a tenant

### Tenant Archival

- [ ] **ARC-01**: Admin can archive a tenant via soft-delete (sets `archived_at` timestamp on all org-scoped data)
- [ ] **ARC-02**: Archiving a tenant sets Clerk org metadata `archived=true` and removes all org memberships
- [ ] **ARC-03**: Archived tenant data is hidden from normal queries (RLS filters `archived_at IS NULL`)
- [ ] **ARC-04**: Admin can view archived tenants in a separate tab on tenants page
- [ ] **ARC-05**: Admin can restore an archived tenant (reverses soft-delete, restores Clerk org metadata)

### Admin Dashboard

- [ ] **DASH-01**: Dashboard shows count of unaffiliated users
- [ ] **DASH-02**: Dashboard shows count of archived tenants
- [ ] **DASH-03**: Dashboard has quick action links to unaffiliated users and archived tenants views

## Future Requirements

### Invitation System

- **INV-01**: Admin can send email invitations to users for a specific org
- **INV-02**: User can accept invitation via email link and join org automatically

### Access Request Workflow

- **REQ-01**: User can submit access request from `/solicitar-acesso` screen
- **REQ-02**: Admin sees pending access requests in admin panel
- **REQ-03**: Admin can approve/deny access requests

## Out of Scope

| Feature | Reason |
|---------|--------|
| Email invitations | Future milestone — manual process via admin panel for now |
| Access request form/workflow | Future milestone — admin checks unaffiliated users manually |
| Self-service org creation behind feature flag | Removed entirely, not gated |
| Hard delete of tenant data | Always soft-delete for compliance/recovery |
| Tenant data export before archival | Future — archive preserves data in DB |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACC-01 | — | Pending |
| ACC-02 | — | Pending |
| ACC-03 | — | Pending |
| ACC-04 | — | Pending |
| ADM-01 | — | Pending |
| ADM-02 | — | Pending |
| ADM-03 | — | Pending |
| ADM-04 | — | Pending |
| ARC-01 | — | Pending |
| ARC-02 | — | Pending |
| ARC-03 | — | Pending |
| ARC-04 | — | Pending |
| ARC-05 | — | Pending |
| DASH-01 | — | Pending |
| DASH-02 | — | Pending |
| DASH-03 | — | Pending |

**Coverage:**
- v7.0 requirements: 16 total
- Mapped to phases: 0
- Unmapped: 16 ⚠️

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*
