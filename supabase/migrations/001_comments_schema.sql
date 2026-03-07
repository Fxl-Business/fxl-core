-- Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  target_id text not null,        -- 'screen:resultado-mensal-dfc' or 'section:resultado-mensal-dfc:2'
  author_id uuid not null,        -- auth.uid() (operator or anonymous)
  author_name text not null,      -- Display name
  author_role text not null check (author_role in ('operador', 'cliente')),
  text text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- Share tokens table
create table public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default gen_random_uuid()::text,
  client_slug text not null,
  created_by uuid references auth.users(id),
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.share_tokens enable row level security;

-- RLS Policies

-- Comments: authenticated users can read all comments for their client
create policy "Authenticated users can read comments"
  on comments for select
  to authenticated
  using (true);

-- Comments: authenticated users can insert their own comments
create policy "Authenticated users can insert comments"
  on comments for insert
  to authenticated
  with check (author_id = (select auth.uid()));

-- Comments: only operators can resolve comments
create policy "Operators can resolve comments"
  on comments for update
  to authenticated
  using ((select (auth.jwt()->>'is_anonymous')::boolean) is false)
  with check (resolved = true);

-- Share tokens: only non-anonymous authenticated users can manage tokens
create policy "Operators can manage tokens"
  on share_tokens for all
  to authenticated
  using ((select (auth.jwt()->>'is_anonymous')::boolean) is false);

-- Share tokens: anonymous can read valid tokens (for validation)
create policy "Anyone can validate tokens"
  on share_tokens for select
  to anon, authenticated
  using (revoked = false and expires_at > now());
