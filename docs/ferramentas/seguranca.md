---
title: Seguranca
badge: Ferramentas
description: Checklist anti AI-slop, rate-limit e validacao
---

# Segurança — Checklist Anti AI-Slop

## Por que este documento existe

Ferramentas de vibe coding e IA generativa tendem a produzir código que funciona mas não é seguro. Este checklist garante que todo projeto FXL passa por revisão de segurança antes de ir para produção.

---

## Regras absolutas (zero exceção)

### 1. Variáveis de ambiente
- `.env` e `.env.local` no `.gitignore` — verificar antes do primeiro commit
- Nunca hardcodar chaves, tokens ou senhas no código-fonte
- `service_role` key do Supabase nunca vai para o frontend

### 2. Row Level Security
- RLS habilitado em TODA tabela do Supabase, sem exceção
- Testar isolamento: usuário A não consegue acessar dados do usuário B
- Incluir policies RLS em toda migration de criação de tabela

### 3. Rate limiting
- Login: máximo 5 tentativas por minuto por IP
- APIs públicas: máximo 100 requisições por minuto por IP
- Upload de arquivos: máximo 10 por minuto por usuário

### 4. Validação de input
- Usar Zod para validar toda entrada do usuário
- Sanitizar HTML em campos de texto livre
- Validar tipos, tamanhos e formatos no servidor (Edge Function), não apenas no frontend

### 5. CORS
- Listar domínios específicos no Supabase — nunca usar `*` em produção
- Verificar em: Supabase Dashboard → Settings → API → CORS Origins

### 6. Headers de segurança
Adicionar no `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 7. Erros e logs
- Nunca expor stack traces para o usuário final
- Mensagens de erro genéricas ao usuário — detalhes apenas em logs internos
- Nunca logar dados sensíveis (senhas, tokens, dados pessoais de clientes)

---

## Erros comuns de vibe coding / AI-slop

| Erro | Por que acontece | Como evitar |
|---|---|---|
| Chaves no código-fonte | IA coloca direto para funcionar rápido | Verificar `.gitignore` antes do primeiro commit |
| RLS desabilitado | IA não habilita porque complica o desenvolvimento | Habilitar na migration e testar isolamento |
| Sem validação de input | IA confia no frontend para validar | Schema Zod em toda entrada, validar no servidor |
| `any` em TypeScript | IA usa para evitar erros de tipo rapidamente | `strict: true`, nunca aceitar `any` em review |
| Dados sensíveis em logs | IA loga tudo para facilitar debug | Revisar todos os `console.log` antes de deploy |
| CORS aberto (`*`) | IA configura permissivo para evitar erros de CORS | Listar domínios corretos antes de deploy |
| Sem rate limiting | IA não pensa em cenários de abuso | Incluir rate limiting no sprint de auth |

---

## Checklist de deploy

Execute antes de cada deploy para produção:

**Variáveis de ambiente**
- [ ] `.env` e `.env.local` no `.gitignore`
- [ ] Nenhuma chave ou senha no código-fonte
- [ ] Todas as variáveis configuradas na Vercel (Production)
- [ ] `.env.example` atualizado com todas as variáveis (sem valores)

**Banco de dados**
- [ ] RLS habilitado em todas as tabelas
- [ ] Policies testadas: usuário A não acessa dados do usuário B
- [ ] Sem queries sem WHERE clause em tabelas grandes

**Frontend**
- [ ] Sem `any` no TypeScript
- [ ] Inputs validados com Zod
- [ ] Mensagens de erro genéricas para o usuário

**Infraestrutura**
- [ ] Headers de segurança no `vercel.json`
- [ ] CORS configurado com domínios específicos
- [ ] Redirect URLs do Supabase Auth atualizadas

**Código**
- [ ] `console.log` de dados sensíveis removidos
- [ ] Stack traces não expostos ao usuário
- [ ] Dados de teste removidos do banco de produção
