import type { BlueprintConfig } from '@tools/wireframe-builder/types/blueprint'

const config = {
  slug: 'financeiro-conta-azul',
  label: 'Financeiro Conta Azul',
  screens: [
    // ─── 1. Resultado Mensal (DFC) ───────────────────────────────
    {
      id: 'resultado-mensal-dfc',
      title: 'Resultado Mensal (DFC)',
      periodType: 'mensal',
      filters: [{ key: 'centro-custo', label: 'Centro de Custo' }],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 4,
          items: [
            {
              label: 'Receita Total',
              value: 'R$ 485.200',
              variation: '▲ 8,3% vs Fev/2026',
              variationPositive: true,
              sparkline: [410, 425, 438, 447, 460, 472, 485],
            },
            {
              label: 'Margem de Contribuição',
              value: 'R$ 218.340',
              sub: '45,0% s/ receita',
              variation: '▲ 9,3% vs Fev/2026',
              variationPositive: true,
              sparkline: [185000, 190000, 195000, 200000, 205000, 210000, 218340],
            },
            {
              label: 'Resultado Operacional',
              value: 'R$ 87.344',
              sub: '18,0% s/ receita',
              variation: '▲ 16,8% vs Fev/2026',
              variationPositive: true,
              sparkline: [72000, 74000, 76000, 79000, 82000, 85000, 87344],
            },
            {
              label: 'Resultado Final',
              value: 'R$ 58.232',
              sub: '12,0% s/ receita',
              variation: '▲ 15,8% vs Fev/2026',
              variationPositive: true,
              sparkline: [44000, 46000, 48000, 50000, 53000, 56000, 58232],
            },
          ],
        },
        {
          type: 'calculo-card',
          title: 'Resumo do Resultado',
          rows: [
            {
              label: 'Faturamento',
              value: 'R$ 485.200',
              pct: '100,00%',
              valueCompare: 'R$ 447.300',
              variation: '▲ 8,5%',
              variationPositive: true,
            },
            {
              operator: '(-)',
              label: 'Custos Variáveis',
              value: '(R$ 266.860)',
              pct: '55,00%',
              valueCompare: '(R$ 247.500)',
              variation: '▲ 7,8%',
              variationPositive: false,
            },
            {
              operator: '(=)',
              label: 'Margem de Contribuição',
              value: 'R$ 218.340',
              pct: '45,00%',
              highlight: true,
              valueCompare: 'R$ 199.800',
              variation: '▲ 9,3%',
              variationPositive: true,
            },
            {
              operator: '(-)',
              label: 'Custos Fixos',
              value: '(R$ 130.996)',
              pct: '27,00%',
              valueCompare: '(R$ 125.000)',
              variation: '▲ 4,8%',
              variationPositive: false,
            },
            {
              operator: '(=)',
              label: 'Resultado Operacional',
              value: 'R$ 87.344',
              pct: '18,00%',
              highlight: true,
              valueCompare: 'R$ 74.800',
              variation: '▲ 16,8%',
              variationPositive: true,
            },
            {
              operator: '(-)',
              label: 'Despesas Financeiras',
              value: '(R$ 29.112)',
              pct: '6,00%',
              valueCompare: '(R$ 24.500)',
              variation: '▲ 18,8%',
              variationPositive: false,
            },
            {
              operator: '(=)',
              label: 'Resultado Final',
              value: 'R$ 58.232',
              pct: '12,00%',
              highlight: true,
              valueCompare: 'R$ 50.300',
              variation: '▲ 15,8%',
              variationPositive: true,
            },
          ],
        },
        {
          type: 'waterfall-chart',
          title: 'Resultado do Mês',
          height: 280,
          bars: [
            { label: 'Faturamento', value: 485200, type: 'positive' },
            { label: '(-) C. Variáveis', value: -266860, type: 'negative' },
            { label: '(=) MC', value: 218340, type: 'subtotal' },
            { label: '(-) C. Fixos', value: -130996, type: 'negative' },
            { label: '(=) RO', value: 87344, type: 'subtotal' },
            { label: '(-) D. Financ.', value: -29112, type: 'negative' },
            { label: '(=) Resultado', value: 58232, type: 'subtotal' },
          ],
          compareBars: [
            { label: 'Faturamento', value: 447300, type: 'positive' },
            { label: '(-) C. Variáveis', value: -247500, type: 'negative' },
            { label: '(=) MC', value: 199800, type: 'subtotal' },
            { label: '(-) C. Fixos', value: -125000, type: 'negative' },
            { label: '(=) RO', value: 74800, type: 'subtotal' },
            { label: '(-) D. Financ.', value: -24500, type: 'negative' },
            { label: '(=) Resultado', value: 50300, type: 'subtotal' },
          ],
        },
        {
          type: 'drill-down-table',
          title: 'DFC Gerencial',
          subtitle: 'Detalhe por visão selecionada — clique em uma linha para expandir',
          columns: [
            { key: 'linha', label: 'Linha DFC' },
            { key: 'atual', label: 'Mês Atual (R$)', align: 'right' },
            { key: 'pct', label: '% s/ Receita', align: 'right' },
            { key: 'anterior', label: 'Mês Anterior', align: 'right', compareOnly: true },
            { key: 'variacao', label: 'Var. %', align: 'right', compareOnly: true },
          ],
          rows: [],
          viewSwitcher: {
            options: ['Grupo de Despesa', 'Centro de Custo', 'Categoria', 'Forma de Pagamento'],
            default: 'Grupo de Despesa',
            rowsByView: {
              'Grupo de Despesa': [
                {
                  id: 'receita',
                  isTotal: true,
                  data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
                  children: [
                    { id: 'rec-servicos', data: { linha: 'Serviços', atual: '290.000', pct: '59,8%', anterior: '265.000', anoAnt: '240.000', variacao: '▲ 9,4%' } },
                    { id: 'rec-produtos', data: { linha: 'Produtos', atual: '135.200', pct: '27,9%', anterior: '122.800', anoAnt: '112.000', variacao: '▲ 10,1%' } },
                    { id: 'rec-outros', data: { linha: 'Outros', atual: '60.000', pct: '12,3%', anterior: '60.000', anoAnt: '58.000', variacao: '—' } },
                  ],
                },
                {
                  id: 'cv',
                  data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
                  children: [
                    { id: 'cv-folha', data: { linha: 'Folha Variável', atual: '(145.560)', pct: '30,0%', anterior: '(134.430)', anoAnt: '(123.000)', variacao: '▲ 8,3%' } },
                    { id: 'cv-insumos', data: { linha: 'Insumos', atual: '(72.780)', pct: '15,0%', anterior: '(70.000)', anoAnt: '(68.000)', variacao: '▲ 4,0%' } },
                    { id: 'cv-com', data: { linha: 'Comissões', atual: '(48.520)', pct: '10,0%', anterior: '(43.570)', anoAnt: '(40.000)', variacao: '▲ 11,4%' } },
                  ],
                },
                {
                  id: 'mc',
                  isTotal: true,
                  data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
                },
                {
                  id: 'cf',
                  data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
                  children: [
                    { id: 'cf-adm', data: { linha: 'Administrativo', atual: '(78.000)', pct: '16,1%', anterior: '(75.000)', anoAnt: '(70.000)', variacao: '▲ 4,0%' } },
                    { id: 'cf-oper', data: { linha: 'Operacional', atual: '(27.996)', pct: '5,8%', anterior: '(25.000)', anoAnt: '(26.000)', variacao: '▲ 12,0%' } },
                    { id: 'cf-alug', data: { linha: 'Ocupação', atual: '(25.000)', pct: '5,2%', anterior: '(25.000)', anoAnt: '(22.000)', variacao: '—' } },
                  ],
                },
                {
                  id: 'ro',
                  isTotal: true,
                  data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
                },
                {
                  id: 'df',
                  data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
                  children: [
                    { id: 'df-fin', data: { linha: 'Financeiro', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' } },
                  ],
                },
                {
                  id: 'rf',
                  isTotal: true,
                  data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
                },
              ],
              'Centro de Custo': [
                {
                  id: 'receita',
                  isTotal: true,
                  data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
                  children: [
                    { id: 'rec-sp', data: { linha: 'CC São Paulo', atual: '291.120', pct: '60,0%', anterior: '268.680', anoAnt: '246.000', variacao: '▲ 8,3%' } },
                    { id: 'rec-rj', data: { linha: 'CC Rio de Janeiro', atual: '145.560', pct: '30,0%', anterior: '134.340', anoAnt: '123.000', variacao: '▲ 8,3%' } },
                    { id: 'rec-int', data: { linha: 'CC Interior', atual: '48.520', pct: '10,0%', anterior: '44.780', anoAnt: '41.000', variacao: '▲ 8,3%' } },
                  ],
                },
                {
                  id: 'cv',
                  data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
                  children: [
                    { id: 'cv-sp', data: { linha: 'CC São Paulo', atual: '(160.116)', pct: '33,0%', anterior: '(148.800)', anoAnt: '(138.600)', variacao: '▲ 7,6%' } },
                    { id: 'cv-rj', data: { linha: 'CC Rio de Janeiro', atual: '(80.058)', pct: '16,5%', anterior: '(74.400)', anoAnt: '(69.300)', variacao: '▲ 7,6%' } },
                    { id: 'cv-int', data: { linha: 'CC Interior', atual: '(26.686)', pct: '5,5%', anterior: '(24.800)', anoAnt: '(23.100)', variacao: '▲ 7,6%' } },
                  ],
                },
                {
                  id: 'mc',
                  isTotal: true,
                  data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
                },
                {
                  id: 'cf',
                  data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
                  children: [
                    { id: 'cf-sp', data: { linha: 'CC São Paulo', atual: '(78.598)', pct: '16,2%', anterior: '(75.000)', anoAnt: '(70.800)', variacao: '▲ 4,8%' } },
                    { id: 'cf-rj', data: { linha: 'CC Rio de Janeiro', atual: '(39.299)', pct: '8,1%', anterior: '(37.500)', anoAnt: '(35.400)', variacao: '▲ 4,8%' } },
                    { id: 'cf-int', data: { linha: 'CC Interior', atual: '(13.099)', pct: '2,7%', anterior: '(12.500)', anoAnt: '(11.800)', variacao: '▲ 4,8%' } },
                  ],
                },
                {
                  id: 'ro',
                  isTotal: true,
                  data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
                },
                {
                  id: 'df',
                  data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
                  children: [
                    { id: 'df-sp', data: { linha: 'CC São Paulo', atual: '(17.467)', pct: '3,6%', anterior: '(14.700)', anoAnt: '(12.000)', variacao: '▲ 18,8%' } },
                    { id: 'df-rj', data: { linha: 'CC Rio de Janeiro', atual: '(8.734)', pct: '1,8%', anterior: '(7.350)', anoAnt: '(6.000)', variacao: '▲ 18,8%' } },
                    { id: 'df-int', data: { linha: 'CC Interior', atual: '(2.911)', pct: '0,6%', anterior: '(2.450)', anoAnt: '(2.000)', variacao: '▲ 18,8%' } },
                  ],
                },
                {
                  id: 'rf',
                  isTotal: true,
                  data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
                },
              ],
              Categoria: [
                {
                  id: 'receita',
                  isTotal: true,
                  data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
                  children: [
                    { id: 'rec-cons', data: { linha: 'Consultoria', atual: '290.000', pct: '59,8%', anterior: '265.000', anoAnt: '240.000', variacao: '▲ 9,4%' } },
                    { id: 'rec-proj', data: { linha: 'Projetos', atual: '135.200', pct: '27,9%', anterior: '122.800', anoAnt: '112.000', variacao: '▲ 10,1%' } },
                    { id: 'rec-out', data: { linha: 'Outros', atual: '60.000', pct: '12,3%', anterior: '60.000', anoAnt: '58.000', variacao: '—' } },
                  ],
                },
                {
                  id: 'cv',
                  data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
                  children: [
                    { id: 'cv-cat1', data: { linha: 'Compra de Mercadoria', atual: '(145.560)', pct: '30,0%', anterior: '(134.430)', anoAnt: '(123.000)', variacao: '▲ 8,3%' } },
                    { id: 'cv-cat2', data: { linha: 'Custos com Frota', atual: '(22.910)', pct: '4,7%', anterior: '(21.000)', anoAnt: '(19.500)', variacao: '▲ 9,1%' } },
                    { id: 'cv-cat3', data: { linha: 'Custos com Impostos', atual: '(54.753)', pct: '11,3%', anterior: '(50.000)', anoAnt: '(47.000)', variacao: '▲ 9,5%' } },
                    { id: 'cv-cat4', data: { linha: 'Custos Operacionais', atual: '(43.637)', pct: '9,0%', anterior: '(40.000)', anoAnt: '(38.000)', variacao: '▲ 9,1%' } },
                  ],
                },
                {
                  id: 'mc',
                  isTotal: true,
                  data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
                },
                {
                  id: 'cf',
                  data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
                  children: [
                    { id: 'cf-rh', data: { linha: 'Recursos Humanos', atual: '(86.814)', pct: '17,9%', anterior: '(83.000)', anoAnt: '(78.000)', variacao: '▲ 4,6%' } },
                    { id: 'cf-adm', data: { linha: 'Despesas Administrativas', atual: '(19.322)', pct: '4,0%', anterior: '(18.000)', anoAnt: '(17.000)', variacao: '▲ 7,3%' } },
                    { id: 'cf-imovel', data: { linha: 'Imóvel', atual: '(8.050)', pct: '1,7%', anterior: '(8.000)', anoAnt: '(7.500)', variacao: '▲ 0,6%' } },
                    { id: 'cf-dir', data: { linha: 'Despesas com Diretoria', atual: '(13.963)', pct: '2,9%', anterior: '(13.000)', anoAnt: '(12.000)', variacao: '▲ 7,4%' } },
                    { id: 'cf-com', data: { linha: 'Despesas Comerciais e Marketing', atual: '(2.847)', pct: '0,6%', anterior: '(2.500)', anoAnt: '(2.200)', variacao: '▲ 13,9%' } },
                  ],
                },
                {
                  id: 'ro',
                  isTotal: true,
                  data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
                },
                {
                  id: 'df',
                  data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
                  children: [
                    { id: 'df-jur', data: { linha: 'Juros bancários', atual: '(15.000)', pct: '3,1%', anterior: '(12.000)', anoAnt: '(10.000)', variacao: '▲ 25,0%' } },
                    { id: 'df-tar', data: { linha: 'Tarifas e IOF', atual: '(8.112)', pct: '1,7%', anterior: '(7.500)', anoAnt: '(6.000)', variacao: '▲ 8,2%' } },
                    { id: 'df-mul', data: { linha: 'Multas e juros mora', atual: '(6.000)', pct: '1,2%', anterior: '(5.000)', anoAnt: '(4.000)', variacao: '▲ 20,0%' } },
                  ],
                },
                {
                  id: 'rf',
                  isTotal: true,
                  data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
                },
              ],
              'Forma de Pagamento': [
                {
                  id: 'receita',
                  isTotal: true,
                  data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
                  children: [
                    { id: 'rec-conv', data: { linha: 'Convênio', atual: '71.200', pct: '14,7%', anterior: '65.000', anoAnt: '60.000', variacao: '▲ 9,5%' } },
                    { id: 'rec-dup', data: { linha: 'Duplicata', atual: '152.000', pct: '31,3%', anterior: '140.000', anoAnt: '128.000', variacao: '▲ 8,6%' } },
                    { id: 'rec-car', data: { linha: 'Cartão', atual: '131.600', pct: '27,1%', anterior: '121.200', anoAnt: '111.000', variacao: '▲ 8,6%' } },
                    { id: 'rec-din', data: { linha: 'Dinheiro', atual: '130.400', pct: '26,9%', anterior: '121.600', anoAnt: '111.000', variacao: '▲ 7,2%' } },
                  ],
                },
                {
                  id: 'cv',
                  data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
                  children: [
                    { id: 'cv-folha', data: { linha: 'Folha Variável', atual: '(145.560)', pct: '30,0%', anterior: '(134.430)', anoAnt: '(123.000)', variacao: '▲ 8,3%' } },
                    { id: 'cv-insumos', data: { linha: 'Insumos', atual: '(72.780)', pct: '15,0%', anterior: '(70.000)', anoAnt: '(68.000)', variacao: '▲ 4,0%' } },
                    { id: 'cv-com', data: { linha: 'Comissões', atual: '(48.520)', pct: '10,0%', anterior: '(43.570)', anoAnt: '(40.000)', variacao: '▲ 11,4%' } },
                  ],
                },
                {
                  id: 'mc',
                  isTotal: true,
                  data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
                },
                {
                  id: 'cf',
                  data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
                  children: [
                    { id: 'cf-adm', data: { linha: 'Administrativo', atual: '(78.000)', pct: '16,1%', anterior: '(75.000)', anoAnt: '(70.000)', variacao: '▲ 4,0%' } },
                    { id: 'cf-oper', data: { linha: 'Operacional', atual: '(27.996)', pct: '5,8%', anterior: '(25.000)', anoAnt: '(26.000)', variacao: '▲ 12,0%' } },
                    { id: 'cf-alug', data: { linha: 'Ocupação', atual: '(25.000)', pct: '5,2%', anterior: '(25.000)', anoAnt: '(22.000)', variacao: '—' } },
                  ],
                },
                {
                  id: 'ro',
                  isTotal: true,
                  data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
                },
                {
                  id: 'df',
                  data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
                  children: [
                    { id: 'df-fin', data: { linha: 'Financeiro', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' } },
                  ],
                },
                {
                  id: 'rf',
                  isTotal: true,
                  data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
                },
              ],
            },
          },
        },
      ],
    },

    // ─── 2. Visão por Receita ────────────────────────────────────
    {
      id: 'visao-por-receita',
      title: 'Visão por Receita',
      periodType: 'mensal',
      filters: [
        { key: 'categoria', label: 'Categoria' },
        { key: 'centro-custo', label: 'Centro de Custo' },
        { key: 'cliente', label: 'Cliente' },
      ],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 4,
          items: [
            {
              label: 'Receita Prevista',
              value: 'R$ 485.200',
              variation: '▲ 8,3% vs Fev/2026',
              variationPositive: true,
              sparkline: [420, 430, 445, 455, 465, 478, 485],
            },
            {
              label: 'Receitas Recebidas',
              value: 'R$ 359.260',
              sub: '74,0% recebido',
              sparkline: [300, 310, 325, 335, 340, 350, 359],
            },
            {
              label: 'Receitas a Vencer',
              value: 'R$ 102.440',
              sub: '32 títulos',
              sparkline: [120, 115, 110, 108, 105, 103, 102],
            },
            {
              label: 'Receitas Vencidas',
              value: 'R$ 23.500',
              sub: '4,9% inadimplência',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≤5%)',
              sparkline: [18, 20, 21, 22, 23, 23, 24],
              variationPositive: false,
            },
          ],
        },
        {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'donut-chart', title: 'Distribuição por Status' },
            { type: 'bar-line-chart', title: 'Receita por Categoria', chartType: 'bar' },
          ],
        },
        {
          type: 'bar-line-chart',
          title: 'Receita por Status — Atual vs Comparativo',
          chartType: 'bar',
          compareOnly: true,
        },
        {
          type: 'data-table',
          title: 'Top Clientes por Receita',
          columns: [
            { key: 'rank', label: '#', align: 'center' },
            { key: 'cliente', label: 'Cliente' },
            { key: 'prevista', label: 'Prevista', align: 'right' },
            { key: 'recebida', label: 'Recebida', align: 'right' },
            { key: 'aberto', label: 'Em Aberto', align: 'right' },
            { key: 'status', label: 'Status' },
            { key: 'pct', label: '% s/ Total', align: 'right' },
          ],
          rowCount: 6,
        },
        {
          type: 'data-table',
          title: 'Receita por Categoria',
          columns: [
            { key: 'categoria', label: 'Categoria' },
            { key: 'atual', label: 'Atual', align: 'right' },
            { key: 'pct', label: '% s/ Total', align: 'right' },
            { key: 'anterior', label: 'Anterior', align: 'right', compareOnly: true },
            { key: 'variacao', label: 'Var. %', align: 'right', compareOnly: true },
          ],
          rowCount: 5,
        },
      ],
    },

    // ─── 3. Visão por Despesas ───────────────────────────────────
    {
      id: 'visao-por-despesas',
      title: 'Visão por Despesas',
      periodType: 'mensal',
      filters: [
        { key: 'grupo-despesa', label: 'Grupo de Despesa', options: ['Todos', 'Variáveis', 'Fixos', 'Financeiros'] },
        { key: 'centro-custo', label: 'Centro de Custo' },
      ],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 4,
          items: [
            {
              label: 'Despesa Prevista',
              value: 'R$ 426.976',
              sub: '88,0% s/ receita',
              sparkline: [390, 398, 407, 412, 418, 423, 427],
            },
            {
              label: 'Despesas Pagas',
              value: 'R$ 318.976',
              sub: '74,7% do total',
              sparkline: [290, 295, 302, 306, 310, 315, 319],
            },
            {
              label: 'Despesas a Vencer',
              value: 'R$ 91.500',
              sub: '48 títulos',
              sparkline: [105, 102, 98, 95, 93, 92, 92],
            },
            {
              label: 'Despesas Vencidas',
              value: 'R$ 16.500',
              sub: '3,9% do total',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≤5%)',
              sparkline: [12, 13, 14, 15, 16, 16, 17],
            },
          ],
        },
        {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'donut-chart', title: 'Participação por Grupo' },
            { type: 'bar-line-chart', title: 'Despesa por Grupo', chartType: 'bar' },
          ],
        },
        {
          type: 'bar-line-chart',
          title: 'Despesa por Status — Atual vs Comparativo',
          chartType: 'bar',
          compareOnly: true,
        },
        {
          type: 'data-table',
          title: 'Análise por Categoria',
          columns: [
            { key: 'categoria', label: 'Categoria' },
            { key: 'grupo', label: 'Grupo' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'atual', label: 'Mês Atual', align: 'right' },
            { key: 'pctRec', label: '% s/ Receita', align: 'right' },
            { key: 'anterior', label: 'Anterior', align: 'right', compareOnly: true },
            { key: 'variacao', label: 'Var. %', align: 'right', compareOnly: true },
          ],
          rowCount: 9,
        },
      ],
    },

    // ─── 4. Visão por Centro de Custo ────────────────────────────
    {
      id: 'visao-por-centro-de-custo',
      title: 'Visão por Centro de Custo',
      periodType: 'mensal',
      filters: [{ key: 'centro-custo', label: 'Centro de Custo' }],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 3,
          items: [
            {
              label: 'Receita Total (CCs)',
              value: 'R$ 485.200',
              variation: '▲ 12,4% YoY',
              variationPositive: true,
              sparkline: [430, 445, 455, 462, 470, 478, 485],
            },
            {
              label: 'Custo Total Alocado',
              value: 'R$ 397.864',
              sub: '82,0% sobre receita',
              sparkline: [350, 360, 368, 375, 381, 388, 398],
            },
            {
              label: 'Resultado Consolidado',
              value: 'R$ 87.336',
              sub: '18,0% margem',
              semaforo: 'verde',
              semaforoLabel: 'Saudável',
              sparkline: [65, 70, 74, 78, 82, 85, 87],
            },
          ],
        },
        {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'bar-line-chart', title: 'Receita x Custo x Resultado por CC', chartType: 'bar' },
            { type: 'donut-chart', title: '% Participação na Receita Total' },
          ],
        },
        {
          type: 'clickable-table',
          title: 'DRE por Centro de Custo',
          subtitle: 'Clique em uma linha para ver detalhes',
          columns: [
            { key: 'cc', label: 'Centro de Custo' },
            { key: 'receita', label: 'Receita', align: 'right' },
            { key: 'cv', label: 'C. Variáveis', align: 'right' },
            { key: 'mc', label: 'M. Contrib.', align: 'right' },
            { key: 'pctMc', label: '% MC', align: 'right' },
            { key: 'cf', label: 'C. Fixos', align: 'right' },
            { key: 'ro', label: 'Result. Op.', align: 'right' },
            { key: 'pctRo', label: '% RO', align: 'right' },
            { key: 'df', label: 'D. Fin.', align: 'right' },
            { key: 'rf', label: 'Result. Final', align: 'right' },
            { key: 'partic', label: '% Partic.', align: 'right' },
            { key: 'anterior', label: 'Mês Ant.', align: 'right', compareOnly: true },
            { key: 'variacao', label: 'Var. %', align: 'right', compareOnly: true },
          ],
          rows: [
            { id: 'sp', data: { cc: 'Unidade SP', receita: '242.600', cv: '121.300', mc: '121.300', pctMc: '50,0%', cf: '72.780', ro: '48.520', pctRo: '20,0%', df: '14.556', rf: '33.964', partic: '50%', anterior: '224.000', variacao: '▲ 8,3%' } },
            { id: 'rj', data: { cc: 'Unidade RJ', receita: '145.560', cv: '80.058', mc: '65.502', pctMc: '45,0%', cf: '38.000', ro: '27.502', pctRo: '18,9%', df: '8.734', rf: '18.768', partic: '30%', anterior: '134.340', variacao: '▲ 8,3%' } },
            { id: 'bh', data: { cc: 'Unidade BH', receita: '97.040', cv: '58.224', mc: '38.816', pctMc: '40,0%', cf: '20.216', ro: '18.600', pctRo: '19,2%', df: '5.822', rf: '12.778', partic: '20%', anterior: '89.460', variacao: '▲ 8,5%' } },
            { id: 'total', variant: 'total', data: { cc: 'Total', receita: '485.200', cv: '259.582', mc: '225.618', pctMc: '46,5%', cf: '130.996', ro: '94.622', pctRo: '19,5%', df: '29.112', rf: '65.510', partic: '100%', anterior: '447.800', variacao: '▲ 8,3%' } },
          ],
          modalTitleKey: 'cc',
        },
      ],
    },

    // ─── 5. Margens Reais da Operação ────────────────────────────
    {
      id: 'margens-reais-da-operacao',
      title: 'Margens Reais da Operação',
      periodType: 'mensal',
      filters: [],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 3,
          items: [
            {
              label: '% Margem de Contribuição',
              value: '45,0%',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥40%)',
              variation: '▲ 2,1 pp vs Fev/2026',
              variationPositive: true,
              sparkline: [38, 39, 40, 41, 42, 43, 44, 45],
            },
            {
              label: '% Resultado Operacional',
              value: '18,0%',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥15%)',
              variation: '▲ 3,2 pp vs Fev/2026',
              variationPositive: true,
              sparkline: [13, 14, 15, 15, 16, 17, 17, 18],
            },
            {
              label: '% Resultado Final / EBITDA',
              value: '12,0%',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥10%)',
              variation: '▼ 1,2 pp vs Fev/2026',
              variationPositive: false,
              sparkline: [10, 11, 12, 13, 13, 12, 12, 12],
            },
          ],
        },
        {
          type: 'bar-line-chart',
          title: 'Composição do Resultado (% sobre Faturamento)',
          chartType: 'bar',
          height: 260,
        },
        {
          type: 'bar-line-chart',
          title: 'Margens Atuais vs Comparativo — MC%, RO%, RF%',
          chartType: 'bar',
          height: 240,
          compareOnly: true,
        },
      ],
    },

    // ─── 6. Fluxo de Caixa Mensal ────────────────────────────────
    {
      id: 'fluxo-de-caixa-mensal',
      title: 'Fluxo de Caixa Mensal',
      periodType: 'mensal',
      filters: [],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 4,
          items: [
            {
              label: 'Saldo Inicial',
              value: 'R$ 285.600',
              sub: '01/Mar/2026',
              sparkline: [260, 268, 272, 278, 282, 284, 286],
            },
            {
              label: 'Total Entradas',
              value: 'R$ 355.300',
              sub: 'Realizado',
              variation: '▼ 5,8% vs previsto',
              variationPositive: false,
              sparkline: [310, 318, 325, 333, 340, 348, 355],
            },
            {
              label: 'Total Saídas',
              value: 'R$ 315.812',
              sub: 'Realizado',
              variation: '▲ 0,2% vs previsto',
              variationPositive: false,
              sparkline: [290, 295, 300, 305, 308, 312, 316],
            },
            {
              label: 'Saldo Final Projetado',
              value: 'R$ 325.088',
              sub: '31/Mar/2026',
              semaforo: 'verde',
              semaforoLabel: 'Saudável',
              sparkline: [280, 288, 295, 302, 310, 318, 325],
            },
          ],
        },
        {
          type: 'bar-line-chart',
          title: 'Entradas x Saídas x Saldo — Dias do Mês',
          chartType: 'bar-line',
          height: 240,
        },
        {
          type: 'saldo-banco',
          banks: [
            { label: 'Itaú — CC Principal', value: 'R$ 198.450,00' },
            { label: 'Bradesco — CC Operacional', value: 'R$ 87.320,00' },
            { label: 'Santander — Reserva', value: 'R$ 24.800,00' },
            { label: 'Nubank — Digital', value: 'R$ 14.518,00' },
          ],
          total: 'R$ 325.088,00',
        },
        {
          type: 'clickable-table',
          title: 'Fluxo Previsto x Realizado',
          subtitle: 'Clique em uma linha para ver detalhes da movimentação',
          columns: [
            { key: 'descricao', label: 'Descrição' },
            { key: 'previsto', label: 'Previsto', align: 'right' },
            { key: 'realizado', label: 'Realizado', align: 'right' },
            { key: 'diferenca', label: 'Diferença', align: 'right' },
            { key: 'status', label: '% Real.', align: 'right' },
            { key: 'mesComp', label: 'Mês Comparativo', align: 'right', compareOnly: true },
          ],
          rows: [
            { id: 'rec-cli', data: { descricao: 'Recebimento de Clientes', previsto: '359.260', realizado: '342.800', diferenca: '(16.460)', status: '▲ 95,4%', mesComp: '330.000' } },
            { id: 'rec-out', data: { descricao: 'Outras Entradas', previsto: '18.000', realizado: '12.500', diferenca: '(5.500)', status: '▲ 69,4%', mesComp: '11.000' }, variant: 'highlight' },
            { id: 'total-e', data: { descricao: 'Total Entradas', previsto: '377.260', realizado: '355.300', diferenca: '(21.960)', status: '▲ 94,2%', mesComp: '341.000' }, variant: 'total' },
            { id: 'forn', data: { descricao: 'Pagamento Fornecedores', previsto: '145.000', realizado: '148.200', diferenca: '(3.200)', status: '▼ 102,2%', mesComp: '138.000' }, variant: 'highlight' },
            { id: 'folha', data: { descricao: 'Folha de Pagamento', previsto: '78.000', realizado: '78.000', diferenca: '—', status: '= 100%', mesComp: '78.000' } },
            { id: 'alug', data: { descricao: 'Aluguel', previsto: '25.000', realizado: '25.000', diferenca: '—', status: '= 100%', mesComp: '25.000' } },
            { id: 'imp', data: { descricao: 'Impostos e Tributos', previsto: '38.000', realizado: '35.500', diferenca: '2.500', status: '▲ 93,4%', mesComp: '34.000' } },
            { id: 'fin', data: { descricao: 'Parcelas Financiamentos', previsto: '29.112', realizado: '29.112', diferenca: '—', status: '= 100%', mesComp: '29.112' } },
            { id: 'total-s', data: { descricao: 'Total Saídas', previsto: '315.112', realizado: '315.812', diferenca: '(700)', status: '▼ 100,2%', mesComp: '304.112' }, variant: 'total' },
            { id: 'saldo', data: { descricao: 'Saldo do Período', previsto: '62.148', realizado: '39.488', diferenca: '(22.660)', status: '▼ 63,5%', mesComp: '36.888' }, variant: 'highlight' },
          ],
          modalTitleKey: 'descricao',
        },
        {
          type: 'manual-input',
          title: 'Ajustes Manuais no Fluxo',
          initialBalance: '285.600',
          entries: [
            { id: '1', type: 'receita', month: 'Mar/2026', value: 'R$ 15.000', description: 'Adiantamento cliente XYZ' },
            { id: '2', type: 'despesa', month: 'Mar/2026', value: 'R$ 8.500', description: 'Manutenção emergencial servidor' },
          ],
        },
      ],
    },

    // ─── 7. Fluxo de Caixa Anual Projetado ───────────────────────
    {
      id: 'fluxo-de-caixa-anual-projetado',
      title: 'Fluxo de Caixa Anual Projetado',
      periodType: 'anual',
      filters: [],
      hasCompareSwitch: true,
      sections: [
        {
          type: 'kpi-grid',
          columns: 4,
          items: [
            {
              label: 'Total Entradas 2026',
              value: 'R$ 4,77M',
              variation: '▲ 10,2% vs 2025',
              variationPositive: true,
              sparkline: [400, 415, 430, 448, 465, 482, 500, 518, 536, 555, 574, 595],
            },
            {
              label: 'Total Saídas 2026',
              value: 'R$ 4,08M',
              sub: '85,6% s/ entradas',
              sparkline: [340, 353, 366, 380, 395, 410, 425, 440, 456, 472, 490, 510],
            },
            {
              label: 'Saldo Líquido 2026',
              value: 'R$ 690k',
              variation: '▲ 18,5% vs 2025',
              variationPositive: true,
              sparkline: [60, 62, 64, 68, 70, 72, 75, 78, 80, 83, 84, 85],
            },
            {
              label: 'Saldo Final Projetado',
              value: 'R$ 775k',
              sub: 'Dez/2026',
              semaforo: 'verde',
              semaforoLabel: 'Meta atingida',
              sparkline: [306, 333, 372, 412, 452, 492, 535, 578, 623, 670, 718, 775],
            },
          ],
        },
        {
          type: 'bar-line-chart',
          title: 'Entradas x Saídas x Saldo Acumulado — 12 Meses',
          chartType: 'bar-line',
          height: 280,
        },
        {
          type: 'clickable-table',
          title: 'Projeção Mensal Detalhada',
          subtitle: 'Entradas, saídas e saldos mês a mês',
          columns: [
            { key: 'linha', label: 'Linha' },
            { key: 'jan', label: 'Jan', align: 'right' },
            { key: 'fev', label: 'Fev', align: 'right' },
            { key: 'mar', label: 'Mar', align: 'right' },
            { key: 'abr', label: 'Abr', align: 'right' },
            { key: 'mai', label: 'Mai', align: 'right' },
            { key: 'jun', label: 'Jun', align: 'right' },
            { key: 'jul', label: 'Jul', align: 'right' },
            { key: 'ago', label: 'Ago', align: 'right' },
            { key: 'set', label: 'Set', align: 'right' },
            { key: 'out', label: 'Out', align: 'right' },
            { key: 'nov', label: 'Nov', align: 'right' },
            { key: 'dez', label: 'Dez', align: 'right' },
          ],
          rows: [
            {
              id: 'entradas',
              variant: 'total',
              data: { linha: 'Total Entradas', jan: '310k', fev: '325k', mar: '355k', abr: '368k', mai: '380k', jun: '392k', jul: '405k', ago: '418k', set: '430k', out: '445k', nov: '460k', dez: '485k' },
            },
            {
              id: 'saidas',
              variant: 'total',
              data: { linha: 'Total Saídas', jan: '289k', fev: '298k', mar: '316k', abr: '328k', mai: '340k', jun: '352k', jul: '362k', ago: '375k', set: '385k', out: '398k', nov: '412k', dez: '428k' },
            },
            {
              id: 'saldo-mes',
              data: { linha: 'Saldo do Mês', jan: '21k', fev: '27k', mar: '39k', abr: '40k', mai: '40k', jun: '40k', jul: '43k', ago: '43k', set: '45k', out: '47k', nov: '48k', dez: '57k' },
            },
            {
              id: 'saldo-acum',
              variant: 'highlight',
              data: { linha: 'Saldo Acumulado', jan: '306k', fev: '333k', mar: '372k', abr: '412k', mai: '452k', jun: '492k', jul: '535k', ago: '578k', set: '623k', out: '670k', nov: '718k', dez: '775k' },
            },
          ],
        },
        {
          type: 'manual-input',
          title: 'Simulação de Cenários',
          initialBalance: '285.600',
        },
      ],
    },

    // ─── 8. Indicadores de Desempenho ────────────────────────────
    {
      id: 'indicadores-de-desempenho',
      title: 'Indicadores de Desempenho',
      periodType: 'mensal',
      filters: [{ key: 'centro-custo', label: 'Centro de Custo' }],
      hasCompareSwitch: true,
      sections: [
        // Liquidez
        {
          type: 'kpi-grid',
          columns: 4,
          groupLabel: 'Liquidez',
          items: [
            {
              label: 'Liquidez Corrente',
              value: '2,14',
              sub: 'Ativo / Passivo Circulante',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥1,5)',
              sparkline: [1.8, 1.9, 1.95, 2.0, 2.05, 2.1, 2.14],
            },
            {
              label: 'Liquidez Imediata',
              value: '1,42',
              sub: 'Caixa / Passivo Circulante',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥1,0)',
              sparkline: [1.1, 1.15, 1.2, 1.25, 1.3, 1.38, 1.42],
            },
            {
              label: 'Prazo Médio Recebimento',
              value: '28 dias',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≤35 dias)',
              sparkline: [35, 34, 32, 31, 30, 29, 28],
            },
            {
              label: 'Prazo Médio Pagamento',
              value: '42 dias',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥30 dias)',
              sparkline: [38, 39, 40, 40, 41, 42, 42],
            },
          ],
        },
        // Rentabilidade
        {
          type: 'kpi-grid',
          columns: 4,
          groupLabel: 'Rentabilidade',
          items: [
            {
              label: 'ROE',
              value: '18,4%',
              sub: 'Retorno s/ Patrimônio',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥15%)',
              sparkline: [14, 15, 16, 16, 17, 17, 18],
            },
            {
              label: 'EBITDA',
              value: 'R$ 92.150',
              sub: '19,0% s/ receita',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥18%)',
              sparkline: [72, 75, 80, 83, 87, 90, 92],
            },
            {
              label: 'Ticket Médio',
              value: 'R$ 24.260',
              variation: '▲ 6,2% vs Fev/2026',
              variationPositive: true,
              sparkline: [21000, 21500, 22000, 22500, 23000, 23800, 24260],
            },
            {
              label: 'Custo de Aquisição (CAC)',
              value: 'R$ 3.850',
              variation: '▼ 4,1% vs Fev/2026',
              variationPositive: true,
              sparkline: [4200, 4100, 4000, 3980, 3950, 3900, 3850],
            },
          ],
        },
        // Endividamento & Cobertura
        {
          type: 'kpi-grid',
          columns: 3,
          groupLabel: 'Endividamento & Cobertura',
          items: [
            {
              label: 'Dívida / EBITDA',
              value: '1,8x',
              semaforo: 'amarelo',
              semaforoLabel: 'Amarelo (1,5x–2,5x)',
              sparkline: [2.1, 2.0, 1.95, 1.9, 1.85, 1.82, 1.8],
            },
            {
              label: 'Cobertura de Juros',
              value: '5,2x',
              sub: 'EBIT / Despesas Financeiras',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≥4x)',
              sparkline: [4.2, 4.4, 4.6, 4.8, 5.0, 5.1, 5.2],
            },
            {
              label: 'Inadimplência',
              value: '4,9%',
              semaforo: 'verde',
              semaforoLabel: 'Verde (≤5%)',
              sparkline: [5.8, 5.5, 5.2, 5.0, 4.9, 4.9, 4.9],
            },
          ],
        },
        {
          type: 'bar-line-chart',
          title: 'KPIs do Mês vs Comparativo',
          chartType: 'bar',
          height: 260,
          compareOnly: true,
        },
        {
          type: 'pareto-chart',
          title: 'Principais Categorias de Despesa (Pareto)',
        },
        {
          type: 'data-table',
          title: 'Painel de KPIs — Resumo',
          columns: [
            { key: 'indicador', label: 'Indicador' },
            { key: 'valor', label: 'Valor Atual', align: 'right' },
            { key: 'meta', label: 'Meta', align: 'right' },
            { key: 'status', label: 'Status' },
            { key: 'tendencia', label: 'Tendência', align: 'center' },
            { key: 'anterior', label: 'Mês Ant.', align: 'right', compareOnly: true },
            { key: 'anoAnt', label: 'Ano Ant.', align: 'right', compareOnly: true },
          ],
          rowCount: 10,
        },
      ],
    },

    // ─── 9. Upload de Relatórios ─────────────────────────────────
    {
      id: 'upload-de-relatorios',
      title: 'Upload de Relatórios',
      periodType: 'none',
      filters: [],
      hasCompareSwitch: false,
      sections: [
        {
          type: 'info-block',
          content: 'Como exportar do Conta Azul:\n1. Acesse Financeiro → Contas a Receber / Contas a Pagar\n2. Filtre pelo período desejado (mês completo)\n3. Clique em "Exportar" → formato XLS ou CSV\n4. Faça o upload do arquivo abaixo na aba correspondente',
          variant: 'info',
        },
        {
          type: 'upload-section',
          label: 'Contas a Receber (Receitas)',
          acceptedFormats: ['XLS', 'XLSX', 'CSV'],
          successMessage: '286 registros encontrados — Fev/2026. Verifique antes de confirmar.',
          history: [
            { id: 'h1', date: '04/03/2026', type: 'Contas a Receber', period: 'Fev/2026', records: 342, status: 'success' },
            { id: 'h2', date: '02/02/2026', type: 'Contas a Receber', period: 'Jan/2026', records: 318, status: 'success' },
            { id: 'h3', date: '05/01/2026', type: 'Contas a Receber', period: 'Dez/2025', records: 295, status: 'warning' },
          ],
        },
        {
          type: 'upload-section',
          label: 'Contas a Pagar (Despesas)',
          acceptedFormats: ['XLS', 'XLSX', 'CSV'],
          errorMessages: [
            'Coluna "Centro de Custo" não encontrada — verifique o template',
            '3 registros com data inválida na linha 45, 67, 89',
          ],
          history: [
            { id: 'h4', date: '04/03/2026', type: 'Contas a Pagar', period: 'Fev/2026', records: 218, status: 'success' },
            { id: 'h5', date: '02/02/2026', type: 'Contas a Pagar', period: 'Jan/2026', records: 201, status: 'error' },
            { id: 'h6', date: '05/01/2026', type: 'Contas a Pagar', period: 'Dez/2025', records: 198, status: 'success' },
          ],
        },
        {
          type: 'upload-section',
          label: 'Extrato Bancário (Conciliação)',
          acceptedFormats: ['XLS', 'XLSX', 'OFX', 'CSV'],
          history: [
            { id: 'h7', date: '04/03/2026', type: 'Extrato Bancário', period: 'Fev/2026', records: 540, status: 'success' },
            { id: 'h8', date: '02/02/2026', type: 'Extrato Bancário', period: 'Jan/2026', records: 512, status: 'success' },
          ],
        },
      ],
    },

    // ─── 10. Configurações ───────────────────────────────────────
    {
      id: 'configuracoes',
      title: 'Configurações',
      periodType: 'none',
      filters: [],
      hasCompareSwitch: false,
      sections: [
        {
          type: 'config-table',
          title: 'Categorias Financeiras',
          addLabel: '+ Nova Categoria',
          columns: [
            { key: 'nome', label: 'Categoria', width: '220px' },
            { key: 'grupo', label: 'Grupo', type: 'badge' },
            { key: 'tipo', label: 'Tipo', type: 'badge' },
            { key: 'conta', label: 'Conta Contábil' },
            { key: 'ativo', label: 'Ativo', type: 'status' },
            { key: 'acoes', label: 'Ações', type: 'actions' },
          ],
          rows: [
            { nome: 'Consultoria Técnica', grupo: 'Receita Operacional', tipo: 'Variável', conta: '3.1.01', ativo: 'Sim' },
            { nome: 'Projetos de Implantação', grupo: 'Receita Operacional', tipo: 'Variável', conta: '3.1.02', ativo: 'Sim' },
            { nome: 'Licenças de Software', grupo: 'Receita Recorrente', tipo: 'Fixo', conta: '3.1.03', ativo: 'Sim' },
            { nome: 'Mão de Obra Variável', grupo: 'Custo Variável', tipo: 'Variável', conta: '4.1.01', ativo: 'Sim' },
            { nome: 'Folha de Pagamento', grupo: 'Custo Fixo', tipo: 'Fixo', conta: '4.2.01', ativo: 'Sim' },
            { nome: 'Aluguel', grupo: 'Custo Fixo', tipo: 'Fixo', conta: '4.2.02', ativo: 'Sim' },
            { nome: 'Juros Bancários', grupo: 'Financeiro', tipo: 'Variável', conta: '5.1.01', ativo: 'Sim' },
            { nome: 'Tarifas Bancárias', grupo: 'Financeiro', tipo: 'Fixo', conta: '5.1.02', ativo: 'Não' },
          ],
        },
        {
          type: 'config-table',
          title: 'Contas Bancárias',
          addLabel: '+ Nova Conta',
          columns: [
            { key: 'banco', label: 'Banco', width: '200px' },
            { key: 'agencia', label: 'Agência' },
            { key: 'conta', label: 'Conta' },
            { key: 'tipo', label: 'Tipo', type: 'badge' },
            { key: 'saldo', label: 'Saldo Ref.' },
            { key: 'ativo', label: 'Ativo', type: 'status' },
            { key: 'acoes', label: 'Ações', type: 'actions' },
          ],
          rows: [
            { banco: 'Itaú', agencia: '0001', conta: '12345-6', tipo: 'Corrente', saldo: 'R$ 198.450', ativo: 'Sim' },
            { banco: 'Bradesco', agencia: '1234', conta: '98765-4', tipo: 'Corrente', saldo: 'R$ 87.320', ativo: 'Sim' },
            { banco: 'Santander', agencia: '0567', conta: '11223-3', tipo: 'Corrente', saldo: 'R$ 24.800', ativo: 'Sim' },
            { banco: 'Nubank', agencia: '—', conta: '44556-7', tipo: 'Corrente', saldo: 'R$ 14.518', ativo: 'Sim' },
            { banco: 'Itaú', agencia: '0001', conta: '55678-9', tipo: 'Aplicação', saldo: 'R$ 120.000', ativo: 'Sim' },
          ],
        },
        {
          type: 'config-table',
          title: 'Centros de Custo',
          addLabel: '+ Novo Centro',
          columns: [
            { key: 'nome', label: 'Centro de Custo', width: '220px' },
            { key: 'codigo', label: 'Código' },
            { key: 'resp', label: 'Responsável' },
            { key: 'ativo', label: 'Ativo', type: 'status' },
            { key: 'acoes', label: 'Ações', type: 'actions' },
          ],
          rows: [
            { nome: 'Unidade São Paulo', codigo: 'CC-SP', resp: 'Ana Lima', ativo: 'Sim' },
            { nome: 'Unidade Rio de Janeiro', codigo: 'CC-RJ', resp: 'Carlos Melo', ativo: 'Sim' },
            { nome: 'Unidade Belo Horizonte', codigo: 'CC-BH', resp: 'Julia Reis', ativo: 'Sim' },
            { nome: 'Corporativo', codigo: 'CC-00', resp: 'Diego Souza', ativo: 'Sim' },
          ],
        },
        {
          type: 'config-table',
          title: 'Metas e Semáforos',
          columns: [
            { key: 'indicador', label: 'Indicador', width: '220px' },
            { key: 'semVerde', label: 'Semáforo Verde', type: 'text' },
            { key: 'semAmarero', label: 'Semáforo Amarelo', type: 'text' },
            { key: 'semVerm', label: 'Semáforo Vermelho', type: 'text' },
            { key: 'acoes', label: 'Ações', type: 'actions' },
          ],
          rows: [
            { indicador: 'Margem de Contribuição', semVerde: '≥ 40%', semAmarero: '30%–39%', semVerm: '< 30%' },
            { indicador: 'Resultado Operacional', semVerde: '≥ 15%', semAmarero: '10%–14%', semVerm: '< 10%' },
            { indicador: 'Resultado Final / EBITDA', semVerde: '≥ 10%', semAmarero: '5%–9%', semVerm: '< 5%' },
            { indicador: 'Inadimplência', semVerde: '≤ 5%', semAmarero: '5%–10%', semVerm: '> 10%' },
            { indicador: 'Liquidez Corrente', semVerde: '≥ 1,5', semAmarero: '1,0–1,49', semVerm: '< 1,0' },
            { indicador: 'Dívida / EBITDA', semVerde: '≤ 1,5', semAmarero: '1,5–2,5', semVerm: '> 2,5' },
          ],
        },
      ],
    },
  ],
} satisfies BlueprintConfig

export default config
