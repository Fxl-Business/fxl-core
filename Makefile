.PHONY: dev build lint preview install migrate seed-docs seed-docs-force

dev:
	npm run dev

build:
	npm run build

lint:
	npx tsc --noEmit

preview:
	npm run preview

install:
	npm install

migrate:
	@set -a && . ./.env.local && set +a && \
		supabase link --project-ref $$SUPABASE_PROJECT_REF -p $$SUPABASE_DB_PASSWORD && \
		supabase db push -p $$SUPABASE_DB_PASSWORD --yes

seed-docs:
	npx tsx --env-file .env.local scripts/seed-documents.ts

seed-docs-force:
	npx tsx --env-file .env.local scripts/seed-documents.ts --force
