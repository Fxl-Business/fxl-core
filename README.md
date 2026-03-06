# FXL — Monorepo

Documentacao, knowledge de clientes, skills AI-first e app React — tudo em um lugar.

## Visao de Longo Prazo

Ter um processo capaz de entender qualquer negocio e, a partir de perguntas e respostas
estruturadas, gerar qualquer produto digital de forma progressivamente automatizada.

## Estrutura

| Pasta | Para quem | O que contem |
|---|---|---|
| `docs/` | Claude + Humanos | Documentacao renderizada via Markdoc — fonte unica de verdade |
| `clients/` | Claude + Humanos | Knowledge base e wireframes por cliente |
| `skills/` | Claude Code | Ferramentas AI-first do processo (wireframe-builder etc.) |
| `src/` | App | Shell React — layout, renderer Markdoc, paginas interativas |

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Deploy

Conectar na Vercel com framework preset **Vite**. Deploy automatico via push na `main`.
