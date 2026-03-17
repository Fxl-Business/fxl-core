-- Migration 012: Backfill scope for existing documents
-- Product docs: SDK/onboarding content visible to all tenants
-- Tenant docs: FXL process/tooling content — already defaulted to 'tenant' by migration 011

BEGIN;

-- Set SDK docs to product scope
UPDATE documents
SET scope = 'product'
WHERE slug LIKE 'sdk/%';

-- Verify: log counts for audit (advisory, not blocking)
DO $$
DECLARE
  product_count INT;
  tenant_count INT;
BEGIN
  SELECT COUNT(*) INTO product_count FROM documents WHERE scope = 'product';
  SELECT COUNT(*) INTO tenant_count FROM documents WHERE scope = 'tenant';
  RAISE NOTICE 'After migration 012: % product docs, % tenant docs', product_count, tenant_count;
END $$;

COMMIT;
