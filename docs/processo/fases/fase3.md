---
title: Fase 3 — Desenvolvimento
badge: Processo
description: Sprints de codigo com GSD, padroes tecnicos e regras de operacao
---

# Fase 3 — Desenvolvimento

Transforma o wireframe aprovado em sistema funcional.
O desenvolvimento segue o Blueprint — sem desvios de escopo.

---

## Operacao

1. Criar repositorio do projeto no GitHub
2. Configurar `CLAUDE.md` na raiz do projeto (define identidade, stack, regras e referencias do projeto)
3. Planejar sprints usando GSD: `/gsd:plan-phase` define pesquisa, planos e tarefas
4. Executar cada sprint: `/gsd:execute-phase` executa os planos com commits atomicos por tarefa
5. Ler as referencias obrigatorias antes de iniciar (ver abaixo)
6. Revisar: testes, seguranca, documentacao
7. Repetir passos 3-6 para cada sprint
8. Sistema completo -> Fase 4

### Referencias obrigatorias

Antes de iniciar, ler:
- [Premissas Gerais](/ferramentas/premissas-gerais) — stack e estrutura de pastas
- [Seguranca](/ferramentas/seguranca) — checklist anti AI-slop
- [Testes](/ferramentas/testes) — o que testar e quando

Para tecnologias especificas, consultar o [Tech Radar](/ferramentas/tech-radar):
- [Supabase](/ferramentas/techs/supabase) — conexao, Auth, RLS
- [Vercel](/ferramentas/techs/vercel) — setup e checklist de deploy

### Workflow com GSD

O GSD organiza o desenvolvimento em fases e planos. Cada plano contém tarefas atomicas
que sao comitadas individualmente, garantindo rastreabilidade e reversibilidade.

{% prompt label="Iniciar sprint com GSD" %}
Vamos iniciar um sprint de desenvolvimento para o projeto [NOME].

Antes de comecar:
- Leia CLAUDE.md do projeto
- Leia o Blueprint aprovado
- Consulte os padroes em docs/ferramentas/premissas-gerais.md e docs/ferramentas/seguranca.md

Escopo deste sprint:
[LISTE AS TELAS/FUNCIONALIDADES]

Use /gsd:plan-phase para planejar o sprint.
Depois use /gsd:execute-phase para executar.
{% /prompt %}

### Regras de operacao

A IA opera como equipe de desenvolvimento — com autonomia para executar, mas dentro de regras claras:

- **Autonomia com limites:** executa tarefas do plano sem perguntar, mas para em decisoes arquiteturais
- **Documentacao continua:** toda decisao tecnica e registrada nos commits e no changelog
- **Seguranca-first:** checklist de seguranca aplicado antes de concluir cada sprint
- Stack padrao: React + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel + Vite
- Skeleton loading obrigatorio em todas as telas que carregam dados
- Filtro de periodo com mes atual como padrao
- Responsivo: desktop prioritario, mobile funcional
- Sem dependencias nao autorizadas (ver [Premissas Gerais](/ferramentas/premissas-gerais))
- TypeScript strict mode — nunca usar `any`
- RLS obrigatorio em toda tabela Supabase
- Checklist de seguranca antes de concluir cada sprint

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
