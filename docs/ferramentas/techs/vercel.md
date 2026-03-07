---
title: Deploy — Vercel
badge: Ferramentas
description: Setup, environment variables e dominios
status: Ativo
---

# Deploy — Padrao FXL (Vercel)

## Status no Tech Radar

✅ **Ativo** — Plataforma padrao de deploy FXL. Preview e producao no mesmo fluxo.

---

## Setup inicial

1. Conectar repositorio GitHub a Vercel
2. Configurar framework:
   - React + Vite: Framework preset → "Vite"
   - Next.js: Framework preset → "Next.js" (detectado automaticamente)
3. Configurar Environment Variables (ver secao abaixo)
4. Fazer deploy de Preview para validar build
5. Promover para producao

---

## Environment Variables

### Convencoes de prefixo

| Build tool | Prefixo obrigatorio | Exemplo |
|---|---|---|
| Vite | `VITE_` | `VITE_SUPABASE_URL` |
| Next.js | `NEXT_PUBLIC_` | `NEXT_PUBLIC_SUPABASE_URL` |

> Variaveis sem o prefixo correto nao ficam disponiveis no frontend (build-time).

### Arquivos obrigatorios

- `.env.example` — commitado no repositorio, sem valores reais, com todas as variaveis documentadas
- `.env.local` — nunca commitado, contem valores reais de desenvolvimento
- Vercel Dashboard — configurar separadamente por ambiente (Preview, Production)

### `.env.example` padrao

```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Adicionar outras variaveis conforme o projeto
```

### Separar por ambiente

Na Vercel, configurar as variaveis em:
- **Production** — Dados de producao
- **Preview** — Dados de staging/desenvolvimento

---

## Dominios

### Padrao FXL
- Projetos internos: `[projeto].fxlbi.com.br`
- Projetos de cliente: dominio do cliente (configurar DNS apontando para Vercel)

### Preview automatico
A Vercel gera URL de preview automatica para cada branch e PR. Usar para validacao antes de ir para producao.

### Configurar dominio personalizado
1. Adicionar dominio na Vercel (Settings → Domains)
2. Configurar DNS: CNAME apontando para `cname.vercel-dns.com`
3. Adicionar dominio nas Redirect URLs do Supabase Auth (Authentication → URL Configuration)

> **Atencao:** Se o dominio nao estiver nas Redirect URLs do Supabase Auth, o login via magic link ou OAuth vai falhar em producao.

---

## Checklist pre-deploy producao

- [ ] Todas as environment variables configuradas na Vercel (Production)
- [ ] Build local sem erros (`npm run build`)
- [ ] Checklist de seguranca aprovado (`seguranca.md`)
- [ ] RLS ativo em todas as tabelas do Supabase
- [ ] Redirect URLs do Supabase Auth atualizadas com o dominio de producao
- [ ] Favicon e titulo da aba atualizados (nao "Vite App" ou "React App")
- [ ] Layout responsivo testado em mobile
- [ ] Dados de teste removidos do banco de producao
