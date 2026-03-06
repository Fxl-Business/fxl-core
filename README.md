# FXL Core — Nucleo FXL

Processo, knowledge, skills AI-first e clientes — o nucleo operacional da FXL.

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
