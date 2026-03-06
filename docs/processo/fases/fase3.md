---
title: Fase 3 — Desenvolvimento
badge: Processo
description: Sprints com stack padrao e referencias de build
---

# Fase 3 — Desenvolvimento

## Objetivo

Transformar o wireframe aprovado em sistema funcional. O desenvolvimento segue o Blueprint — sem desvios de escopo.

---

## Caminhos de desenvolvimento

| Caminho | Quando usar | Status |
|---|---|---|
| Claude Code | Padrão para todos os novos projetos | ✅ Padrão |
| Lovable | Projetos já em andamento no Lovable | ⚠️ Temporário |

---

## Caminho 1: Claude Code (Padrão)

### Fluxo

1. Criar repositório do projeto no GitHub
2. Copiar template `CLAUDE.md` de `docs/build/arquitetura/claude_md_projeto.md` e preencher
3. Planejar sprints (tabela com escopo, dependência, critério de aceite por sprint)
4. Montar o Master Prompt usando o template de `docs/build/arquitetura/master_prompt.md`
5. Executar o sprint no Claude Code
6. Revisar: testes, segurança, documentação
7. Repetir passos 4–6 para cada sprint
8. Sistema completo → Fase 4

### Referências obrigatórias

Antes de iniciar, ler (via caminho absoluto no CLAUDE.md do projeto):
- `docs/build/arquitetura/premissas_gerais.md` — stack e estrutura de pastas
- `docs/build/arquitetura/supabase.md` — conexão, Auth, RLS
- `docs/build/arquitetura/deploy_vercel.md` — setup e checklist de deploy
- `docs/build/arquitetura/seguranca.md` — checklist anti AI-slop
- `docs/build/arquitetura/testes.md` — o que testar e quando
- `docs/build/arquitetura/master_prompt.md` — template do prompt de sprint
- `docs/build/arquitetura/claude_md_projeto.md` — template do CLAUDE.md do projeto

### Regras de desenvolvimento

- Seguir stack padrão: React + TypeScript + Tailwind + shadcn/ui + Supabase + Vercel + Vite
- Seguir design system FXL (`docs/build/design/design_system.md`)
- Skeleton loading obrigatório em todas as telas que carregam dados
- Filtro de período com mês atual como padrão
- Responsivo: desktop prioritário, mobile funcional
- Sem dependências não autorizadas (ver `docs/build/arquitetura/premissas_gerais.md`)
- TypeScript strict mode — nunca usar `any`
- RLS obrigatório em toda tabela Supabase
- Executar checklist de segurança antes de concluir cada sprint
- Documentar decisões técnicas em `docs/SPRINTS.md` e `docs/CHANGELOG.md`

---

## Por tipo de projeto

### BI Personalizado

#### Entradas

- Blueprint aprovado (Fase 2)
- Wireframe visual (referência)
- Design system FXL (`docs/build/design/design_system.md`)
- Dados reais ou amostra do cliente

#### Saída esperada

- Repositório com código-fonte versionado
- Aplicação funcional deployada na Vercel
- Documentação técnica em `docs/`
- Dados de teste carregados

#### Critério de avanço

✅ Sistema funcional com todas as telas do Blueprint implementadas. Checklist de segurança aprovado. Pronto para auditoria.

---

### Produto FXL

#### Considerações adicionais para Produto

- Testar com dados de múltiplos perfis fictícios
- Garantir que não há dados hardcoded de um contexto específico
- UI autoexplicativa (usuário não terá onboarding personalizado)
- Se SaaS: considerar isolamento de dados entre tenants desde o início

#### Critério de avanço

✅ Sistema funcional. Testado com múltiplos perfis de dados. Checklist de segurança aprovado. Pronto para auditoria.

---

## Caminho 2: Lovable (Temporário)

> ⚠️ Este caminho está em descontinuação. Usar apenas para projetos já iniciados no Lovable. Novos projetos devem usar o Caminho 1 (Claude Code).

### Fluxo

1. Claude gera o Prompt de Desenvolvimento a partir do Blueprint
2. Operador cola o prompt no Lovable
3. Lovable gera a aplicação
4. Operador ajusta e refina
5. Sistema funcional → Fase 4

#### Entradas

- Blueprint aprovado (Fase 2)
- Wireframe visual (referência)
- Design system FXL (`docs/build/design/design_system.md`)
- Dados reais ou amostra do cliente

#### Prompt — Gerar Prompt de Desenvolvimento

{% prompt label="Prompt — Gerar Prompt de Desenvolvimento" %}
O wireframe foi aprovado. Com base no Blueprint e no Documento de Briefing, gere o Prompt de Desenvolvimento completo para o Lovable.

Incluir:
- Contexto do projeto
- Estrutura de navegação
- Especificação de cada tela (componentes, dados, interações)
- Regras de UI do design system FXL
- Tela de Inputs (upload, validação, feedback)
- Regras de tratamento de dados

[COLE O BLUEPRINT AQUI]
{% /prompt %}

#### Regras de desenvolvimento (Lovable)

- Seguir design system FXL
- Skeleton loading obrigatório em todas as telas
- Filtro de período com mês atual como padrão
- Responsivo: desktop prioritário, mobile funcional
- Sem dependências externas desnecessárias

---

## Checklist de validação MD ↔ HTML

- [ ] Dois caminhos de desenvolvimento documentados (Claude Code e Lovable)
- [ ] Claude Code claramente marcado como padrão
- [ ] Lovable claramente marcado como temporário com aviso de descontinuação
- [ ] Regras de desenvolvimento expandidas para Claude Code
- [ ] Referências à pasta `docs/build/arquitetura/` presentes
- [ ] Seções BI Personalizado e Produto com critérios de avanço
