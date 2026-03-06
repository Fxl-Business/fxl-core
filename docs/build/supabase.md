---
title: Supabase
badge: Build
description: Conexao, Auth, RLS e migrations
---

# Supabase — Padrão FXL

## Configuração inicial

### Client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são obrigatórios. Verifique o arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Variáveis de ambiente mínimas

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> **Regra absoluta:** A `service_role` key NUNCA vai para o frontend. Usar apenas em Edge Functions.

---

## Auth

Supabase Auth é o padrão para todos os projetos FXL. Não usar bibliotecas de auth externas.

**Método primário:** Email + senha
**Alternativa:** Magic link (link por email)
**Não usar por padrão:** OAuth social (requer configuração adicional e caso de uso claro)

### Estrutura de arquivos de auth

```
src/
├── hooks/
│   └── useAuth.ts              ← hook principal de autenticação
├── components/
│   └── auth/
│       ├── AuthGuard.tsx       ← protege rotas autenticadas
│       ├── LoginForm.tsx       ← formulário de login
│       └── SignUpForm.tsx      ← formulário de cadastro
```

O hook `useAuth.ts` deve expor: `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`.
Usar `supabase.auth.onAuthStateChange` para manter estado reativo.

---

## Row Level Security (RLS)

**Regra absoluta:** TODA tabela tem RLS habilitado, sem exceção.

### Habilitar RLS (incluir em toda migration)

```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

### Policies para dados do usuário

```sql
-- Usuário vê apenas seus próprios dados
CREATE POLICY "users_select_own" ON nome_da_tabela
  FOR SELECT USING (auth.uid() = user_id);

-- Usuário insere apenas com seu próprio user_id
CREATE POLICY "users_insert_own" ON nome_da_tabela
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário atualiza apenas seus próprios dados
CREATE POLICY "users_update_own" ON nome_da_tabela
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuário deleta apenas seus próprios dados
CREATE POLICY "users_delete_own" ON nome_da_tabela
  FOR DELETE USING (auth.uid() = user_id);
```

### Policies para tabelas públicas (leitura pública)

```sql
CREATE POLICY "public_read" ON nome_da_tabela
  FOR SELECT USING (true);
```

### Policies para SaaS multi-tenant (isolamento por organização)

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
- Cada migration faz **uma coisa** — nunca misturar criações de tabelas não relacionadas
- **Nunca editar uma migration existente** — criar nova migration com a correção
- Toda criação de tabela deve incluir as policies RLS correspondentes

---

## Edge Functions

Usar Edge Functions quando:
- Precisa usar a `service_role` key
- Integrações com APIs externas (webhooks, pagamentos)
- Processamento pesado que não deve rodar no cliente

Não usar para:
- CRUD simples — queries diretas do client são suficientes
- Validação que o Zod resolve no frontend
