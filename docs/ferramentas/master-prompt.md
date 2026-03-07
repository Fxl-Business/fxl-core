---
title: Master Prompt
badge: Ferramentas
description: Template para montar prompt de desenvolvimento
---

# Master Prompt — Template de Desenvolvimento

## Filosofia

O Claude Code é tratado como uma equipe de desenvolvedores. O Master Prompt é o briefing de sprint — deve ser específico, com critérios de aceite claros e escopo fechado.

### Princípios
1. **Tratar a IA como equipe de devs** — Master Prompt = briefing de sprint completo
2. **Dividir em sprints** — escopo fechado, critérios de aceite, entregáveis claros
3. **Autonomia com documentação** — tomar decisões técnicas sem perguntar, documentar tudo em `docs/SPRINTS.md`
4. **Testes são entregáveis** — sprint completo = testes passando
5. **Documentação gerada junto** — README, CHANGELOG e docs atualizados por sprint

---

## Antes de criar o Master Prompt

### Passo 1 — Planejar os sprints

| Sprint | Escopo | Dependência | Critério de aceite |
|---|---|---|---|
| Sprint 1 | Setup + Auth | — | Login/signup funcional, rotas protegidas |
| Sprint 2 | [Tela principal] | Sprint 1 | Dados exibidos, filtros funcionando |
| Sprint 3 | [Módulo X] | Sprint 2 | Funcionalidades do módulo completas |
| Sprint N | Deploy + Segurança | Sprint N-1 | Checklist de segurança aprovado |

### Passo 2 — Blueprint técnico por sprint

Para cada sprint, definir antes de escrever o prompt:
- Quais telas e componentes serão criados
- Quais tabelas no Supabase serão necessárias
- Quais RLS policies serão criadas
- Quais queries serão usadas
- Dados de teste realistas (nunca lorem ipsum)

### Passo 3 — Escrever o Master Prompt usando o template abaixo

---

## Template do Master Prompt

```
# Master Prompt — [Nome do Projeto] — Sprint [N]

## Contexto do projeto
[Descrição breve do que é o projeto, para quem é e o problema que resolve]

## Premissas técnicas
Antes de começar, leia obrigatoriamente:
- [CAMINHO_ABSOLUTO]/docs/build/premissas_gerais.md
- [CAMINHO_ABSOLUTO]/docs/build/supabase.md
- [CAMINHO_ABSOLUTO]/docs/build/deploy_vercel.md
- [CAMINHO_ABSOLUTO]/docs/build/seguranca.md
- [CAMINHO_ABSOLUTO]/docs/build/testes.md

## Sprint atual: Sprint [N] — [Nome do Sprint]

### Objetivo
[O que este sprint entrega — em uma frase]

### Escopo

#### [Nome da Tela/Componente 1]
- Localização: `src/pages/[Nome].tsx`
- O que exibe: [descrição]
- De onde vêm os dados: [tabela Supabase ou prop]
- Interações: [o que o usuário pode fazer]

#### [Nome da Tela/Componente 2]
[repetir estrutura acima]

### Schema do banco (Supabase)

```sql
-- [Descrição da tabela]
CREATE TABLE nome_da_tabela (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  [campos...],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON nome_da_tabela
  FOR SELECT USING (auth.uid() = user_id);
```

### Dados de teste
[Dados fictícios e realistas para popular o banco durante o desenvolvimento. Nunca lorem ipsum.]

### Critério de aceite
- [ ] [Critério específico e verificável]
- [ ] [Critério específico e verificável]
- [ ] Checklist de segurança de `seguranca.md` aprovado
- [ ] Testes do sprint passando (ver `testes.md`)
- [ ] `docs/SPRINTS.md` atualizado com decisões tomadas
- [ ] `docs/CHANGELOG.md` atualizado

## Regras de execução
1. **Autonomia total** — tome decisões técnicas sem perguntar. Documente em `docs/SPRINTS.md`
2. **Documentação contínua** — atualizar CHANGELOG e SPRINTS a cada feature concluída
3. **Segurança primeiro** — executar checklist de `seguranca.md` antes de concluir o sprint
4. **Ao concluir** — apresentar resumo: implementado, decisões autônomas, critérios atendidos, débitos técnicos
```

---

## Exemplo preenchido — Sprint 1 de "BI Conta Azul"

```
# Master Prompt — BI Conta Azul — Sprint 1: Setup + Auth

## Contexto do projeto
BI Conta Azul é um dashboard financeiro para PMEs que usam o software Conta Azul.
Permite visualizar faturamento, despesas e fluxo de caixa com dados exportados do Conta Azul.
Usuário primário: gestor financeiro da empresa. Um usuário = uma empresa.

## Premissas técnicas
Antes de começar, leia obrigatoriamente:
- [CAMINHO_ABSOLUTO]/docs/build/premissas_gerais.md
- [CAMINHO_ABSOLUTO]/docs/build/supabase.md
- [CAMINHO_ABSOLUTO]/docs/build/deploy_vercel.md
- [CAMINHO_ABSOLUTO]/docs/build/seguranca.md
- [CAMINHO_ABSOLUTO]/docs/build/testes.md

## Sprint atual: Sprint 1 — Setup + Autenticação

### Objetivo
Projeto configurado com a stack FXL padrão e autenticação funcional com Supabase Auth.

### Escopo

#### Inicialização do projeto
- Criar projeto React + TypeScript + Vite
- Configurar Tailwind CSS e shadcn/ui
- Configurar path aliases (@/components, @/hooks, @/types, @/lib)
- Configurar tsconfig.json com strict: true
- Criar .env.example com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
- Criar estrutura de pastas conforme premissas_gerais.md

#### Conexão com Supabase
- Criar src/lib/supabase.ts com validação de variáveis de ambiente
- Configurar cliente Supabase com tipagem TypeScript

#### Tela de Login (`src/pages/Login.tsx`)
- Exibe: formulário com email e senha, link para cadastro
- Comportamento: chama supabase.auth.signInWithPassword
- Feedback: loading state no botão, mensagem de erro genérica em falha
- Ao autenticar com sucesso: redirecionar para /dashboard

#### Tela de Cadastro (`src/pages/SignUp.tsx`)
- Exibe: formulário com nome, email, senha e confirmação de senha
- Comportamento: cria conta via supabase.auth.signUp, cria perfil em user_profiles
- Validação: Zod — email válido, senha mínimo 8 caracteres, confirmação idêntica à senha

#### Hook de autenticação (`src/hooks/useAuth.ts`)
- Expõe: user, session, loading, signIn, signOut
- Usa supabase.auth.onAuthStateChange para estado reativo
- Persiste sessão entre recarregamentos

#### AuthGuard (`src/components/auth/AuthGuard.tsx`)
- Redireciona para /login se não autenticado
- Exibe skeleton loading enquanto carrega estado de auth
- Envolve todas as rotas privadas em App.tsx

#### Dashboard placeholder (`src/pages/Dashboard.tsx`)
- Exibe: header com nome do usuário, botão de logout, texto "Sprint 2 em breve"
- Acessível apenas via AuthGuard

### Schema do banco (Supabase)

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Dados de teste
- Usuário 1: maria.gestora@contaazul-demo.com / Senha@2026
- Usuário 2: joao.diretor@contaazul-demo.com / Senha@2026
(Inserir via Supabase Auth dashboard após configurar o projeto)

### Critério de aceite
- [ ] Projeto inicializado com React + TypeScript + Vite, sem erros de build
- [ ] Tailwind e shadcn/ui configurados e funcionando
- [ ] Conexão com Supabase estabelecida (supabase.ts sem erros)
- [ ] Login com email/senha funcional (usuários de teste conseguem entrar)
- [ ] Cadastro cria usuário em auth.users e perfil em user_profiles
- [ ] AuthGuard redireciona não-autenticados para /login
- [ ] Dashboard placeholder acessível apenas para autenticados
- [ ] Logout funcional (limpa sessão e redireciona para /login)
- [ ] Checklist de segurança de seguranca.md aprovado para este sprint

## Regras de execução
1. Autonomia total — tome decisões de implementação sem perguntar. Documente em docs/SPRINTS.md
2. Documentação contínua — atualizar CHANGELOG e SPRINTS a cada feature concluída
3. Segurança primeiro — RLS obrigatório, .env no .gitignore antes do primeiro commit
4. Ao concluir — apresentar: implementado, decisões autônomas, critérios atendidos, débitos identificados
```
