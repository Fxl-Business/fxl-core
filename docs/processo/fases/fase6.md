---
title: Fase 6 — Tutorial
badge: Processo
description: Material de adocao compativel com o usuario
---

# Fase 6 — Tutorial e Documentacao

Garante que o usuario final saiba usar o sistema.
O formato varia conforme o tipo de projeto e a maturidade analitica do publico.

---

## Operacao

### BI Personalizado

1. Avaliar maturidade analitica do cliente (Baixa / Media / Alta)
2. Gerar roteiro do tutorial a partir do briefing (usar prompt abaixo)
3. Gravar video tutorial de tela com narracao (10-15 min)
4. Gerar documento de orientacao escrita
5. Enviar video + documento ao cliente
6. Projeto concluido

{% prompt label="Gerar Roteiro do Tutorial" %}
Com base no Documento de Briefing e na maturidade analitica deste cliente, gere:

1. Roteiro completo do video tutorial (texto para narracao + indicacoes de tela)
2. Documento de orientacao escrita (formato para PDF)

Personalize para o segmento e perfil do cliente.
Adapte a linguagem conforme a maturidade analitica.

Maturidade analitica: [BAIXA / MEDIA / ALTA]

[COLE O DOCUMENTO DE BRIEFING AQUI]
{% /prompt %}

### Produto FXL

1. Gerar documentacao generica do produto (usar prompt abaixo)
2. Publicar documentacao acessivel ao usuario
3. Gravar video de apresentacao (opcional)
4. Disponibilizar link de documentacao
5. Produto concluido

{% prompt label="Gerar Documentacao de Produto" %}
Com base no Documento de Definicao de Produto, gere a documentacao completa para usuarios.

A documentacao deve ser autoexplicativa — o usuario nao tera onboarding personalizado.
Use linguagem clara e acessivel.
Inclua exemplos praticos de uso.

[COLE O DOCUMENTO DE DEFINICAO AQUI]
{% /prompt %}

---

## Detalhes

### Por tipo de projeto

#### BI Personalizado

**Entregas:** Video tutorial (10-15 min) + documento de orientacao escrita.

**Estrutura do video:**

| Bloco | Duracao | Conteudo |
|-------|---------|----------|
| Introducao | 1-2 min | O que o sistema resolve para este cliente |
| Acesso e login | 1 min | Onde acessar, como fazer login |
| Navegacao geral | 1-2 min | Sidebar, secoes, logica de navegacao |
| Tela de Inputs | 2-3 min | Como exportar do sistema de origem, como fazer upload |
| Cada tela principal | 2-3 min cada | KPIs, filtros, como interpretar variacoes |
| Duvidas frequentes | 1-2 min | Erros comuns, o que fazer se o dado nao atualizar |

**Adaptacao por maturidade analitica:**

| Maturidade | Adaptacao |
|------------|-----------|
| Baixa | Explicar conceitos basicos (o que e KPI, como ler grafico). Ritmo mais lento. Mais exemplos. |
| Media | Foco em interpretacao e acao. Mostrar como identificar problemas nos dados. |
| Alta | Direto ao ponto. Focar em funcionalidades avancadas e drill-down. |

#### Produto FXL

**Entregas:** Documentacao publica + video de apresentacao (opcional).

**Estrutura da documentacao:**

1. O que e este produto — problema que resolve, publico-alvo
2. Primeiros passos — acesso, cadastro, upload de dados
3. Guia de cada tela — KPIs, filtros, interacoes
4. Perguntas frequentes — problemas comuns e solucoes
5. Suporte — como entrar em contato

### Criterio de avanco

**BI Personalizado:** Video tutorial gravado e enviado. Documento de orientacao entregue.

**Produto FXL:** Documentacao publicada e acessivel. Link disponivel para usuarios.
