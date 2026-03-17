---
title: Super Admin — Operacoes via MCP
badge: Ferramentas
description: Operacoes de administracao da plataforma disponiveis via Claude Code MCP
---

## Visao Geral

Operacoes de super admin estao disponiveis via Claude Code usando MCP (Model Context Protocol)
para Supabase e Clerk. Isso permite queries no banco de dados e gestao de usuarios/organizacoes
diretamente pelo Claude Code, sem navegar dashboards externos.

## Pre-requisitos

Para usar os MCP servers, as seguintes variaveis de ambiente devem estar exportadas no shell
antes de iniciar o Claude Code:

- **`SUPABASE_ACCESS_TOKEN`** — Obtido em Supabase Dashboard > Account > Access Tokens
- **`CLERK_SECRET_KEY`** — Obtido em Clerk Dashboard > API Keys > Secret keys

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
export CLERK_SECRET_KEY="sk_live_..."
```

## Operacoes Supabase (via MCP)

| Operacao | Descricao | Exemplo |
|----------|-----------|---------|
| Listar tenants | Query na tabela tenant_modules agrupada por org_id | `SELECT DISTINCT org_id FROM tenant_modules` |
| Gerenciar feature flags | Ler/atualizar platform_settings | `SELECT * FROM platform_settings` |
| Habilitar modulo | Insert/update em tenant_modules | `INSERT INTO tenant_modules (org_id, module_id, enabled) VALUES (...)` |
| Desabilitar modulo | Update enabled=false em tenant_modules | `UPDATE tenant_modules SET enabled=false WHERE ...` |
| Verificar RLS | Consultar policies ativas | `SELECT * FROM pg_policies` |
| Aplicar migrations | Executar SQL de migracao | Via Supabase MCP SQL execution |

## Operacoes Clerk (via MCP)

{% callout type="warning" %}
O pacote `@anthropic/mcp-server-clerk@latest` pode nao estar publicado ainda no npm.
Verifique a disponibilidade antes de usar. Se nao existir, as operacoes Clerk devem
ser feitas via Clerk Dashboard ou Backend API diretamente.
{% /callout %}

| Operacao | Descricao |
|----------|-----------|
| Criar tenant (Organization) | Cria nova Clerk Organization com slug e metadata |
| Listar Organizations | Lista todas as orgs com membros e metadata |
| Adicionar membro a tenant | Convida usuario para Organization |
| Definir super_admin | Atualiza publicMetadata.super_admin de um usuario |
| Listar usuarios | Lista todos os usuarios com claims e orgs |

## Configuracao

Os MCP servers estao configurados em `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    },
    "clerk": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-clerk@latest"],
      "env": {
        "CLERK_SECRET_KEY": "${CLERK_SECRET_KEY}"
      }
    }
  }
}
```

O flag `--read-only` no Supabase MCP impede operacoes de escrita por padrao.
Remova o flag quando operacoes de escrita forem necessarias.

## Seguranca

- Nunca commitar tokens no repositorio (`.mcp.json` usa `${VAR}` references)
- Usar `--read-only` no Supabase MCP para operacoes exploratorias
- Remover `--read-only` apenas quando write e necessario
- Clerk secret key tem acesso total — usar com cuidado
- Ambos os tokens devem ser tratados como secrets e nunca expostos em logs

{% operational %}
## Referencia Rapida para Claude

Ao executar operacoes de super admin:
1. Usar Supabase MCP para queries e mutations no banco
2. Usar Clerk MCP para gestao de orgs e usuarios
3. Sempre confirmar com o usuario antes de operacoes destrutivas (DELETE, remover membro)
4. Para criar tenant: Clerk MCP (criar org) + Supabase MCP (seed tenant_modules)
5. Para habilitar modulo: Supabase MCP (INSERT/UPDATE tenant_modules)
6. Para gerenciar feature flags: Supabase MCP (SELECT/UPDATE platform_settings)
{% /operational %}
