---
title: Testes
badge: Padroes
description: O que testar, quando testar, criterios
---

# Testes — Premissas FXL

## Filosofia

Testes não são opcionais. Sprint sem testes = sprint incompleto. O Claude Code gera testes junto com o código — não como etapa separada.

---

## Testes obrigatórios por tipo

| Tipo | Quando executar | O que verifica |
|---|---|---|
| Funcionalidade | Ao concluir cada feature | Comportamento esperado funciona, casos de erro tratados |
| Integração | Ao concluir cada sprint | Fluxo completo funciona end-to-end |
| Segurança | Antes de marcar sprint como completo | RLS, inputs, autenticação |
| Responsividade | Antes de cada deploy | Layout em mobile e desktop |

---

## Por tipo de componente

### Telas
- [ ] Renderiza sem erros no console
- [ ] Dados corretos são exibidos
- [ ] Skeleton loading aparece durante carregamento
- [ ] Filtros funcionam e atualizam os dados exibidos
- [ ] Layout responsivo em 375px (mobile) e 1280px (desktop)

### Auth
- [ ] Login com credenciais corretas funciona
- [ ] Login com credenciais incorretas exibe mensagem de erro (genérica)
- [ ] Signup cria usuário e perfil corretamente
- [ ] AuthGuard redireciona não-autenticados para /login
- [ ] Logout limpa sessão e redireciona para /login

### Supabase (queries e mutations)
- [ ] Query retorna dados esperados para o usuário autenticado
- [ ] RLS: usuário A não consegue acessar dados do usuário B
- [ ] Mutations (insert/update/delete) funcionam e refletem na UI
- [ ] Erros de rede são tratados com mensagem ao usuário

### Inputs e formulários
- [ ] Formato válido é aceito e processado
- [ ] Formato inválido é rejeitado com mensagem clara
- [ ] Validação Zod funciona no submit
- [ ] Feedback visual de loading durante submit
- [ ] Campos obrigatórios bloqueiam submit quando vazios

---

## Formato de report do Claude Code

Ao concluir cada sprint, o Claude Code deve apresentar:

```
## Resultado dos testes — Sprint [N]

### Passaram ✅
- [Lista dos testes executados com sucesso]

### Falharam ❌
- [Lista de falhas com descrição e como corrigir]

### Não testados ⚠️
- [Lista de itens que não foram testados e por quê]
```

---

## Critério de sprint aprovado

Um sprint está completo quando:
- [ ] Todos os critérios de aceite do Master Prompt atendidos
- [ ] Nenhum teste obrigatório falhando
- [ ] RLS testado e funcionando (isolamento verificado)
- [ ] Responsividade verificada em mobile e desktop
- [ ] Documentação atualizada (CHANGELOG, SPRINTS)
- [ ] Checklist de segurança aprovado
