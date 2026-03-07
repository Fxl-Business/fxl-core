---
title: Fase 3 — Desenvolvimento
badge: Processo
description: Sprints com stack padrao e referencias de build
---

# Fase 3 — Desenvolvimento

Transforma o wireframe aprovado em sistema funcional.
O desenvolvimento segue o Blueprint — sem desvios de escopo.

---

## Operacao

1. Criar repositorio do projeto no GitHub
2. Configurar `CLAUDE.md` do projeto usando o [template](/ferramentas/claude-md-template)
3. Planejar sprints (tabela com escopo, dependencia, criterio de aceite por sprint)
4. Montar o Master Prompt usando o [Template de Sprint](/ferramentas/master-prompt)
5. Ler as referencias obrigatorias antes de iniciar (ver abaixo)
6. Executar o sprint no Claude Code com GSD
7. Revisar: testes, seguranca, documentacao
8. Repetir passos 4-7 para cada sprint
9. Sistema completo → Fase 4

### Referencias obrigatorias

Antes de iniciar, ler:
- [Premissas Gerais](/ferramentas/premissas-gerais) — stack e estrutura de pastas
- [Seguranca](/ferramentas/seguranca) — checklist anti AI-slop
- [Testes](/ferramentas/testes) — o que testar e quando
- [Template de Sprint](/ferramentas/master-prompt) — template do prompt de sprint
- [CLAUDE.md Template](/ferramentas/claude-md-template) — template do CLAUDE.md do projeto

Para tecnologias especificas:
- [Supabase](/ferramentas/techs/supabase) — conexao, Auth, RLS
- [Vercel](/ferramentas/techs/vercel) — setup e checklist de deploy

### Regras de desenvolvimento

- Stack padrao: React + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel + Vite
- Skeleton loading obrigatorio em todas as telas que carregam dados
- Filtro de periodo com mes atual como padrao
- Responsivo: desktop prioritario, mobile funcional
- Sem dependencias nao autorizadas (ver [Premissas Gerais](/ferramentas/premissas-gerais))
- TypeScript strict mode — nunca usar `any`
- RLS obrigatorio em toda tabela Supabase
- Checklist de seguranca antes de concluir cada sprint
- Documentar decisoes tecnicas em `docs/SPRINTS.md` e `docs/CHANGELOG.md`

---

## Detalhes

### Por tipo de projeto

#### BI Personalizado

**Entradas:** Blueprint aprovado (Fase 2), wireframe visual, dados reais ou amostra do cliente.

**Saida:** Repositorio com codigo-fonte, aplicacao deployada na Vercel, documentacao tecnica, dados de teste carregados.

#### Produto FXL

**Consideracoes adicionais:**
- Testar com dados de multiplos perfis ficticios
- Garantir que nao ha dados hardcoded de um contexto especifico
- UI autoexplicativa (usuario nao tera onboarding personalizado)
- Se SaaS: considerar isolamento de dados entre tenants desde o inicio

**Saida:** Repositorio com codigo-fonte, aplicacao deployada, testado com multiplos perfis de dados.

### Criterio de avanco

**BI Personalizado:** Sistema funcional com todas as telas do Blueprint implementadas. Checklist de seguranca aprovado. Pronto para auditoria.

**Produto FXL:** Sistema funcional. Testado com multiplos perfis de dados. Checklist de seguranca aprovado. Pronto para auditoria.
