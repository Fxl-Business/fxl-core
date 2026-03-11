---
title: Gauge Chart
badge: Ferramentas
description: Medidor radial semicircular com zonas de cor e ponteiro para exibir KPIs com meta.
---

# Gauge Chart

Medidor radial (semicirculo) com zonas de cor e ponteiro dinamico. Usado para exibir KPIs que possuem limites e metas claras — como margem bruta (72% contra meta de 70%), taxa de ocupacao, NPS ou qualquer indicador com faixas verde/amarelo/vermelho. O ponteiro aponta para o valor atual dentro da escala definida.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Tipo | Obrigatorio | Descricao |
|------|------|-------------|-----------|
| `title` | `string` | Sim | Titulo exibido acima do valor e do gauge |
| `value` | `number` | Sim | Valor atual a ser indicado pelo ponteiro |
| `min` | `number` | Nao | Valor minimo da escala. Padrao: `0` |
| `max` | `number` | Nao | Valor maximo da escala. Padrao: `100` |
| `zones` | `Zone[]` | Nao | Array de zonas com limites e cores (ver abaixo). Se omitido, usa divisao padrao 3 zonas |
| `height` | `number` | Nao | Altura do componente em pixels. Padrao: `200` |
| `chartColors` | `string[]` | Nao | Cores extras passadas pelo sistema (reservado para uso futuro) |

### Tipo Zone

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `value` | `number` | Sim | **Limite superior** da zona (nao o tamanho do arco) |
| `label` | `string` | Nao | Label descritivo da zona (nao exibido visualmente, documentacao) |
| `color` | `string` | Nao | Cor CSS da zona. Se omitido, usa cor padrao baseada na ordem |

## Exemplo de uso

```ts
{
  type: 'gauge-chart',
  title: 'Margem Bruta',
  value: 72,
  min: 0,
  max: 100,
  zones: [
    { value: 40, color: 'var(--wf-negative)', label: 'Critico' },
    { value: 70, color: '#f59e0b', label: 'Atencao' },
    { value: 100, color: 'var(--wf-positive)', label: 'Meta atingida' },
  ],
}
```

Sem zones (divisao automatica 40%/30%/30%):

```ts
{
  type: 'gauge-chart',
  title: 'Taxa de Ocupacao',
  value: 85,
}
```

## Comportamento

**Posicao do ponteiro:** calculada por `(value - min) / (max - min)`. O angulo varia de 180 graus (esquerda, valor minimo) a 0 graus (direita, valor maximo). O valor e automaticamente limitado ao intervalo `[min, max]`.

**Zonas padrao (quando `zones` e omitido):**
- `0–40%` da escala: vermelho (perigo) — `var(--wf-negative)`
- `40–70%` da escala: ambar — `#f59e0b`
- `70–100%` da escala: verde (ok) — `var(--wf-positive)`

**Formato das zones:** o campo `value` de cada zona e o **limite superior** da faixa (nao o tamanho do arco). As zonas devem estar em ordem crescente e a ultima zona deve ter `value` igual a `max`.

**Valor exibido:** o numero atual (`value`) e exibido em destaque acima do gauge, em `text-2xl font-bold`.

**Animacao:** desabilitada (`isAnimationActive={false}`) para renderizacao instantanea, consistente com os demais graficos do wireframe.

## Limitacoes

- Exibe apenas **um valor** (nao e multi-serie)
- As zones sao **limites superiores acumulados** — cada `zone.value` e o teto daquela faixa
- Nao possui tooltip ou legenda (o valor e exibido diretamente acima do gauge)
- Comparacao temporal (`compareMode`) nao altera a renderizacao — o gauge exibe sempre o valor atual
