import ConfigTable from '@skills/wireframe-builder/components/ConfigTable'
import type { ConfigColumn, ConfigRow } from '@skills/wireframe-builder/components/ConfigTable'

const CAT_COLS: ConfigColumn[] = [
  { key: 'nome',   label: 'Categoria',          width: '220px' },
  { key: 'grupo',  label: 'Grupo',  type: 'badge' },
  { key: 'tipo',   label: 'Tipo',   type: 'badge' },
  { key: 'conta',  label: 'Conta Contábil' },
  { key: 'ativo',  label: 'Ativo',  type: 'status' },
  { key: 'acoes',  label: 'Ações',  type: 'actions' },
]
const CAT_ROWS: ConfigRow[] = [
  { nome: 'Consultoria Técnica',    grupo: 'Receita Operacional', tipo: 'Variável',  conta: '3.1.01',  ativo: 'Sim' },
  { nome: 'Projetos de Implantação',grupo: 'Receita Operacional', tipo: 'Variável',  conta: '3.1.02',  ativo: 'Sim' },
  { nome: 'Licenças de Software',   grupo: 'Receita Recorrente',  tipo: 'Fixo',      conta: '3.1.03',  ativo: 'Sim' },
  { nome: 'Mão de Obra Variável',   grupo: 'Custo Variável',      tipo: 'Variável',  conta: '4.1.01',  ativo: 'Sim' },
  { nome: 'Folha de Pagamento',     grupo: 'Custo Fixo',          tipo: 'Fixo',      conta: '4.2.01',  ativo: 'Sim' },
  { nome: 'Aluguel',                grupo: 'Custo Fixo',          tipo: 'Fixo',      conta: '4.2.02',  ativo: 'Sim' },
  { nome: 'Juros Bancários',        grupo: 'Financeiro',          tipo: 'Variável',  conta: '5.1.01',  ativo: 'Sim' },
  { nome: 'Tarifas Bancárias',      grupo: 'Financeiro',          tipo: 'Fixo',      conta: '5.1.02',  ativo: 'Não' },
]

const BANCO_COLS: ConfigColumn[] = [
  { key: 'banco',  label: 'Banco',              width: '200px' },
  { key: 'agencia',label: 'Agência' },
  { key: 'conta',  label: 'Conta' },
  { key: 'tipo',   label: 'Tipo',   type: 'badge' },
  { key: 'saldo',  label: 'Saldo Ref.' },
  { key: 'ativo',  label: 'Ativo',  type: 'status' },
  { key: 'acoes',  label: 'Ações',  type: 'actions' },
]
const BANCO_ROWS: ConfigRow[] = [
  { banco: 'Itaú',      agencia: '0001',  conta: '12345-6',  tipo: 'Corrente',  saldo: 'R$ 198.450', ativo: 'Sim' },
  { banco: 'Bradesco',  agencia: '1234',  conta: '98765-4',  tipo: 'Corrente',  saldo: 'R$ 87.320',  ativo: 'Sim' },
  { banco: 'Santander', agencia: '0567',  conta: '11223-3',  tipo: 'Corrente',  saldo: 'R$ 24.800',  ativo: 'Sim' },
  { banco: 'Nubank',    agencia: '—',     conta: '44556-7',  tipo: 'Corrente',  saldo: 'R$ 14.518',  ativo: 'Sim' },
  { banco: 'Itaú',      agencia: '0001',  conta: '55678-9',  tipo: 'Aplicação', saldo: 'R$ 120.000', ativo: 'Sim' },
]

const CC_COLS: ConfigColumn[] = [
  { key: 'nome',  label: 'Centro de Custo',  width: '220px' },
  { key: 'codigo',label: 'Código' },
  { key: 'resp',  label: 'Responsável' },
  { key: 'ativo', label: 'Ativo', type: 'status' },
  { key: 'acoes', label: 'Ações', type: 'actions' },
]
const CC_ROWS: ConfigRow[] = [
  { nome: 'Unidade São Paulo',    codigo: 'CC-SP', resp: 'Ana Lima',    ativo: 'Sim' },
  { nome: 'Unidade Rio de Janeiro', codigo: 'CC-RJ', resp: 'Carlos Melo', ativo: 'Sim' },
  { nome: 'Unidade Belo Horizonte', codigo: 'CC-BH', resp: 'Julia Reis',  ativo: 'Sim' },
  { nome: 'Corporativo',          codigo: 'CC-00', resp: 'Diego Souza',  ativo: 'Sim' },
]

const META_COLS: ConfigColumn[] = [
  { key: 'indicador', label: 'Indicador',       width: '220px' },
  { key: 'semVerde',  label: 'Semáforo Verde',  type: 'text' },
  { key: 'semAmarero',label: 'Semáforo Amarelo',type: 'text' },
  { key: 'semVerm',   label: 'Semáforo Vermelho',type: 'text' },
  { key: 'acoes',     label: 'Ações',           type: 'actions' },
]
const META_ROWS: ConfigRow[] = [
  { indicador: 'Margem de Contribuição', semVerde: '≥ 40%', semAmarero: '30%–39%', semVerm: '< 30%' },
  { indicador: 'Resultado Operacional',  semVerde: '≥ 15%', semAmarero: '10%–14%', semVerm: '< 10%' },
  { indicador: 'Resultado Final / EBITDA',semVerde: '≥ 10%', semAmarero: '5%–9%',  semVerm: '< 5%'  },
  { indicador: 'Inadimplência',          semVerde: '≤ 5%',  semAmarero: '5%–10%',  semVerm: '> 10%' },
  { indicador: 'Liquidez Corrente',      semVerde: '≥ 1,5', semAmarero: '1,0–1,49',semVerm: '< 1,0' },
  { indicador: 'Dívida / EBITDA',        semVerde: '≤ 1,5', semAmarero: '1,5–2,5', semVerm: '> 2,5' },
]

export default function ConfiguracaoScreen() {
  return (
    <div className="space-y-6">
      <ConfigTable
        title="Categorias Financeiras"
        addLabel="+ Nova Categoria"
        columns={CAT_COLS}
        rows={CAT_ROWS}
      />

      <ConfigTable
        title="Contas Bancárias"
        addLabel="+ Nova Conta"
        columns={BANCO_COLS}
        rows={BANCO_ROWS}
      />

      <ConfigTable
        title="Centros de Custo"
        addLabel="+ Novo Centro"
        columns={CC_COLS}
        rows={CC_ROWS}
      />

      <ConfigTable
        title="Metas e Semáforos"
        columns={META_COLS}
        rows={META_ROWS}
      />
    </div>
  )
}
