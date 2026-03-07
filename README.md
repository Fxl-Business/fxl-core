# FXL Core — Plataforma Operacional FXL

Processo, padroes, ferramentas e clientes — o nucleo operacional da FXL.

## Visao de Longo Prazo

Ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas
estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

## Estrutura

| Pasta | Para quem | O que contem |
|---|---|---|
| `docs/processo/` | Claude + Humanos | Regras normativas, fases, identidade, fluxos |
| `docs/padroes/` + `docs/ferramentas/techs/` | Claude + Humanos | Padroes — regras base, stack aprovada, padroes tecnicos |
| `docs/ferramentas/` | Claude + Humanos | Ferramentas — Wireframe Builder, blocos, galeria |
| `docs/referencias/` | Claude + Humanos | Blocos Disponiveis (spec de componentes) |
| `tools/` | Claude + Humanos | Ferramentas AI-first do processo (wireframe-builder etc.) |
| `clients/` | Claude + Humanos | Knowledge base e wireframes por cliente |
| `src/` | App | Shell React — layout, renderer, paginas interativas |
| `.claude/ + .agents/` | Claude Code | AI runtime — GSD, commands, hooks, skills |

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Deploy

Conectar na Vercel com framework preset **Vite**. Deploy automatico via push na `main`.
