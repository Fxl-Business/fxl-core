---
title: Fase 6 — Tutorial
badge: Processo
description: Material de adocao compativel com o usuario
---

# Fase 6 — Tutorial e Documentação

## Objetivo

Garantir que o usuário final saiba usar o sistema. O formato varia conforme o tipo de projeto e a maturidade analítica do público.

---

## Por tipo de projeto

### BI Personalizado

**Contexto:** Tutorial personalizado para o cliente específico, considerando seu contexto e maturidade.

#### Entregas

1. **Vídeo tutorial** — gravação de tela com narração
2. **Documento de orientação** — PDF ou página com instruções escritas

#### Estrutura do vídeo tutorial

| Bloco | Duração | Conteúdo |
|-------|---------|----------|
| Introdução | 1-2 min | O que o sistema resolve para este cliente especificamente |
| Acesso e login | 1 min | Onde acessar, como fazer login |
| Navegação geral | 1-2 min | Sidebar, seções, lógica de navegação |
| Tela de Inputs | 2-3 min | Como exportar do sistema de origem, como fazer upload |
| Cada tela principal | 2-3 min cada | KPIs, filtros, como interpretar variações |
| Dúvidas frequentes | 1-2 min | Erros comuns, o que fazer se o dado não atualizar |

**Duração total:** 10-15 minutos (ideal)

#### Adaptação por maturidade analítica

| Maturidade | Adaptação |
|------------|-----------|
| Baixa | Explicar conceitos básicos (o que é KPI, como ler gráfico). Ritmo mais lento. Mais exemplos práticos. |
| Média | Foco em interpretação e ação. Mostrar como identificar problemas nos dados. |
| Alta | Direto ao ponto. Focar em funcionalidades avançadas e drill-down. |

#### Prompt — Gerar Roteiro do Tutorial

```
Com base no Documento de Briefing e na maturidade analítica deste cliente, gere:

1. Roteiro completo do vídeo tutorial (texto para narração + indicações de tela)
2. Documento de orientação escrita (formato para PDF)

Personalize para o segmento e perfil do cliente.
Adapte a linguagem conforme a maturidade analítica.

Maturidade analítica: [BAIXA / MÉDIA / ALTA]

[COLE O DOCUMENTO DE BRIEFING AQUI]
```

#### Saída esperada

- Vídeo tutorial gravado e enviado ao cliente
- Documento de orientação entregue

#### Critério de avanço

✅ Vídeo tutorial gravado e enviado ao cliente. Documento de orientação entregue.

---

### Produto FXL

**Contexto:** Documentação genérica para qualquer usuário do produto. Deve ser autoexplicativa.

#### Entregas

1. **Documentação do produto** — página web ou PDF público
2. **Vídeo de apresentação** (opcional) — visão geral do produto

#### Estrutura da documentação

1. **O que é este produto**
   - Problema que resolve
   - Para quem é destinado

2. **Primeiros passos**
   - Como acessar / criar conta
   - Como conectar dados ou fazer upload

3. **Guia de cada tela**
   - O que você encontra
   - KPIs disponíveis e como interpretar
   - Filtros e interações

4. **Perguntas frequentes**
   - Problemas comuns e soluções
   - Limitações conhecidas

5. **Suporte**
   - Como entrar em contato
   - Horário de atendimento (se aplicável)

#### Prompt — Gerar Documentação de Produto

```
Com base no Documento de Definição de Produto, gere a documentação completa para usuários.

A documentação deve ser autoexplicativa — o usuário não terá onboarding personalizado.
Use linguagem clara e acessível.
Inclua exemplos práticos de uso.

[COLE O DOCUMENTO DE DEFINIÇÃO AQUI]
```

#### Saída esperada

- Documentação publicada e acessível
- Link disponível para usuários

#### Critério de avanço

✅ Documentação publicada e acessível. Link disponível para usuários.

---

## Checklist de validação MD ↔ HTML

- [ ] Estrutura de tutorial com tabela de blocos
- [ ] Adaptação por maturidade explicada
- [ ] Prompts para geração de conteúdo
- [ ] Diferença clara entre tutorial personalizado e documentação de produto
