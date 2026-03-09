---
title: Coleta de Branding
badge: Ferramentas
description: Processo estruturado para coletar identidade visual do cliente e gerar configuracao de branding
---

# Coleta de Branding

## O que e branding no FXL

Branding controla a identidade visual do wireframe de cada cliente. Quando configurado, as cores do cliente substituem os tons neutros padrao em graficos, tabelas, sidebar e cabecalhos. A tipografia e o logo tambem sao aplicados.

O resultado: o cliente ve o wireframe com a cara da empresa dele, nao com cores genericas.

{% callout type="info" %}
Branding afeta **apenas o wireframe** — nunca muda o tema do app FXL Core (sidebar, header, docs).
{% /callout %}

## Campos obrigatorios

| Campo | Descricao | Exemplo | Onde obter |
|-------|-----------|---------|------------|
| primaryColor | Cor principal da marca (hex) | `#1B6B93` | Manual de marca, site do cliente, logo |
| secondaryColor | Cor secundaria (hex) | `#4FC0D0` | Manual de marca ou derivar da primaria |
| accentColor | Cor de destaque (hex) | `#A2FF86` | Manual de marca ou escolher cor complementar |
| headingFont | Fonte dos titulos | `Poppins` | Manual de marca, site do cliente |
| bodyFont | Fonte do corpo de texto | `Inter` | Manual de marca (Inter e o padrao) |
| logoUrl | URL do logo | `/clients/slug/assets/logo.png` | Arquivo enviado pelo cliente |
| faviconUrl | URL do favicon (opcional) | `/clients/slug/assets/favicon.ico` | Arquivo enviado pelo cliente |

## Minimo viavel

Apenas **primaryColor** e **logoUrl** sao necessarios para gerar um branding funcional. Todos os outros campos tem valores padrao sensiveis:

- secondaryColor: `#6B7280` (cinza medio)
- accentColor: `#3B82F6` (azul)
- headingFont: `Inter`
- bodyFont: `Inter`

{% callout type="warning" %}
Se o cliente nao tiver manual de marca, extraia a cor primaria do logo ou do site usando um color picker.
{% /callout %}

## Passo a passo

1. **Solicitar logo** — Peca ao cliente o arquivo do logo em PNG ou SVG. Salve em `clients/[slug]/assets/`

2. **Coletar cores** — Pergunte se existe manual de marca. Se nao, use um color picker no logo ou no site do cliente para extrair as cores principais

3. **Definir tipografia** — Pergunte se o cliente tem preferencia de fonte. Se nao, use Inter (padrao)

4. **Preencher branding.md** — Documente as informacoes coletadas no arquivo `clients/[slug]/docs/branding.md` seguindo o template abaixo

5. **Gerar branding.config.ts** — Use o Claude Code para gerar o arquivo de configuracao a partir dos dados documentados

## Template branding.md

Use esta estrutura ao criar o `branding.md` de um novo cliente:

```markdown
# Branding — [Nome do Cliente]

## Paleta de cores

| Funcao | Cor | Hex |
|--------|-----|-----|
| Primaria | [amostra] | #XXXXXX |
| Secundaria | [amostra] | #XXXXXX |
| Destaque | [amostra] | #XXXXXX |

## Tipografia

- **Titulos:** [Nome da fonte]
- **Corpo:** [Nome da fonte]

## Logo

- Arquivo: `clients/[slug]/assets/logo.png`
- Formato: PNG / SVG
- Fundo: transparente / solido

## Tom e voz

- [Descricao do tom de comunicacao do cliente]

## Referencias visuais

- [Links para site, redes sociais, materiais existentes]
```

{% operational %}
## Geracao automatica do branding.config.ts

Apos preencher o branding.md, use este comando no Claude Code para gerar o arquivo de configuracao:

{% prompt label="Gerar branding.config.ts" %}
Leia o arquivo clients/[slug]/docs/branding.md e gere o arquivo clients/[slug]/wireframe/branding.config.ts com as cores, fontes e logo documentados. Importe o tipo BrandingConfig de @tools/wireframe-builder/types/branding.
{% /prompt %}

O Claude Code vai:
1. Ler o branding.md para extrair cores, fontes e logo
2. Criar o branding.config.ts com tipagem correta
3. Verificar com `npx tsc --noEmit` que nao ha erros de tipo

{% callout type="info" %}
O branding.config.ts e a fonte de verdade consumida pelos componentes. O branding.md e a versao legivel para documentacao.
{% /callout %}
{% /operational %}
