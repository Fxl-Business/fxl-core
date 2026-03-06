---
title: Deploy — Vercel
badge: Build
description: Setup, environment variables e dominios
---

# Deploy — Padrão FXL (Vercel)

## Setup inicial

1. Conectar repositório GitHub à Vercel
2. Configurar framework:
   - React + Vite: Framework preset → "Vite"
   - Next.js: Framework preset → "Next.js" (detectado automaticamente)
3. Configurar Environment Variables (ver seção abaixo)
4. Fazer deploy de Preview para validar build
5. Promover para produção

---

## Environment Variables

### Convenções de prefixo

| Build tool | Prefixo obrigatório | Exemplo |
|---|---|---|
| Vite | `VITE_` | `VITE_SUPABASE_URL` |
| Next.js | `NEXT_PUBLIC_` | `NEXT_PUBLIC_SUPABASE_URL` |

> Variáveis sem o prefixo correto não ficam disponíveis no frontend (build-time).

### Arquivos obrigatórios

- `.env.example` — commitado no repositório, sem valores reais, com todas as variáveis documentadas
- `.env.local` — nunca commitado, contém valores reais de desenvolvimento
- Vercel Dashboard — configurar separadamente por ambiente (Preview, Production)

### `.env.example` padrão

```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Adicionar outras variáveis conforme o projeto
```

### Separar por ambiente

Na Vercel, configurar as variáveis em:
- **Production** — Dados de produção
- **Preview** — Dados de staging/desenvolvimento

---

## Domínios

### Padrão FXL
- Projetos internos: `[projeto].fxlbi.com.br`
- Projetos de cliente: domínio do cliente (configurar DNS apontando para Vercel)

### Preview automático
A Vercel gera URL de preview automática para cada branch e PR. Usar para validação antes de ir para produção.

### Configurar domínio personalizado
1. Adicionar domínio na Vercel (Settings → Domains)
2. Configurar DNS: CNAME apontando para `cname.vercel-dns.com`
3. Adicionar domínio nas Redirect URLs do Supabase Auth (Authentication → URL Configuration)

> **Atenção:** Se o domínio não estiver nas Redirect URLs do Supabase Auth, o login via magic link ou OAuth vai falhar em produção.

---

## Checklist pré-deploy produção

- [ ] Todas as environment variables configuradas na Vercel (Production)
- [ ] Build local sem erros (`npm run build`)
- [ ] Checklist de segurança aprovado (`seguranca.md`)
- [ ] RLS ativo em todas as tabelas do Supabase
- [ ] Redirect URLs do Supabase Auth atualizadas com o domínio de produção
- [ ] Favicon e título da aba atualizados (não "Vite App" ou "React App")
- [ ] Layout responsivo testado em mobile
- [ ] Dados de teste removidos do banco de produção
