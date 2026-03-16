# Deferred Items - Phase 61

## Pre-existing Issues (Out of Scope)

1. **TS2307: Cannot find module '@/components/docs/MarkdownRenderer'**
   - File: `src/modules/clients/pages/FinanceiroContaAzul/DocViewer.tsx` line 3
   - Import `from '@/components/docs/MarkdownRenderer'` uses old `@/` alias that should be `@shared/` or `@platform/`
   - Discovered during: Plan 06 execution
   - Likely needs: Plan 03 or 04 (clients module migration) to fix this import
