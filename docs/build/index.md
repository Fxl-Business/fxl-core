---
title: Build
badge: Build
description: Ponto de entrada da base tecnica FXL
---

# docs/build/arquitetura/ — Índice

## O que é esta pasta

Contém as premissas técnicas que todo projeto FXL deve seguir quando desenvolvido via Claude Code. É a fundação que garante qualidade, segurança e consistência entre projetos.

## Como usar

Ao iniciar um novo projeto (Fase 3), o `CLAUDE.md` do repositório do projeto deve referenciar esta pasta por caminho absoluto. Exemplo:

```
Antes de começar, leia:
- [CAMINHO_ABSOLUTO]/docs/build/premissas_gerais.md
- [CAMINHO_ABSOLUTO]/docs/build/supabase.md
- [CAMINHO_ABSOLUTO]/docs/build/deploy_vercel.md
- [CAMINHO_ABSOLUTO]/docs/build/seguranca.md
- [CAMINHO_ABSOLUTO]/docs/build/testes.md
```

## Documentos disponíveis

| Documento | O que define | Quando consultar |
|---|---|---|
| `premissas_gerais.md` | Stack, estrutura de pastas, convenções de código | Sempre — é o primeiro a ler |
| `supabase.md` | Conexão, Auth, RLS, migrations | Ao configurar banco de dados |
| `deploy_vercel.md` | Setup, environment variables, domínios | Ao configurar deploy |
| `seguranca.md` | Checklist anti AI-slop, rate-limit, validação | Antes de cada deploy |
| `master_prompt.md` | Template para montar o prompt de desenvolvimento | Ao iniciar cada projeto novo |
| `testes.md` | O que testar, quando testar, critérios de aprovação | Durante e entre sprints |
| `claude_md_projeto.md` | Template do CLAUDE.md para repositórios de projeto | Ao criar repositório novo |

## Evolução

Cada projeto concluído deve contribuir com aprendizados para esta pasta. Se um padrão recorrente emergir em um projeto, registrar aqui para os próximos.
