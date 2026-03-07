---
title: Supabase
badge: Ferramentas
description: Conexao, Auth, RLS e migrations
status: Ativo
---

# Supabase — Padrao FXL

## Status no Tech Radar

✅ **Ativo** — Padrao FXL para banco de dados, autenticacao e RLS em todos os projetos.

---

## Configuracao inicial

### Client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key sao obrigatorios. Verifique o arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Variaveis de ambiente minimas

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> **Regra absoluta:** A `service_role` key NUNCA vai para o frontend. Usar apenas em Edge Functions.

---

## Auth

Supabase Auth e o padrao para todos os projetos FXL. Nao usar bibliotecas de auth externas.

**Metodo primario:** Email + senha
**Alternativa:** Magic link (link por email)
**Nao usar por padrao:** OAuth social (requer configuracao adicional e caso de uso claro)

### Estrutura de arquivos de auth

```
src/
├── hooks/
│   └── useAuth.ts              ← hook principal de autenticacao
├── components/
│   └── auth/
│       ├── AuthGuard.tsx       ← protege rotas autenticadas
│       ├── LoginForm.tsx       ← formulario de login
│       └── SignUpForm.tsx      ← formulario de cadastro
```

O hook `useAuth.ts` deve expor: `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`.
Usar `supabase.auth.onAuthStateChange` para manter estado reativo.

---

## Row Level Security (RLS)

**Regra absoluta:** TODA tabela tem RLS habilitado, sem excecao.

### Habilitar RLS (incluir em toda migration)

```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

### Policies para dados do usuario

```sql
-- Usuario ve apenas seus proprios dados
CREATE POLICY "users_select_own" ON nome_da_tabela
  FOR SELECT USING (auth.uid() = user_id);

-- Usuario insere apenas com seu proprio user_id
CREATE POLICY "users_insert_own" ON nome_da_tabela
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuario atualiza apenas seus proprios dados
CREATE POLICY "users_update_own" ON nome_da_tabela
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuario deleta apenas seus proprios dados
CREATE POLICY "users_delete_own" ON nome_da_tabela
  FOR DELETE USING (auth.uid() = user_id);
```

### Policies para tabelas publicas (leitura publica)

```sql
CREATE POLICY "public_read" ON nome_da_tabela
  FOR SELECT USING (true);
```

### Policies para SaaS multi-tenant (isolamento por organizacao)

```sql
CREATE POLICY "org_isolation_select" ON nome_da_tabela
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

---

## Migrations

- Pasta: `supabase/migrations/`
- Nomes incrementais: `001_create_users.sql`, `002_create_transactions.sql`
- Cada migration faz **uma coisa** — nunca misturar criacoes de tabelas nao relacionadas
- **Nunca editar uma migration existente** — criar nova migration com a correcao
- Toda criacao de tabela deve incluir as policies RLS correspondentes

---

## Edge Functions

Usar Edge Functions quando:
- Precisa usar a `service_role` key
- Integracoes com APIs externas (webhooks, pagamentos)
- Processamento pesado que nao deve rodar no cliente

Nao usar para:
- CRUD simples — queries diretas do client sao suficientes
- Validacao que o Zod resolve no frontend
