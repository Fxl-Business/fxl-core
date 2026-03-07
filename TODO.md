# TODO
## Segurança
- [ ] Não expor variaveis de ambiente, premissa obrigatória, local para confiuraçõa de variaveis
- [ ] Mapear a importancia e o uso de edge functios
- [ ] Reforçar Input Validation em todo input, para não sofrer sql injection e etc... Premissa obrigatória
      - Sanitize all user inputs
- [ ] Escolher integração de autenticação
- [ ] Adicionar rate limit 

## Evolução
- [ ] Configurar as Skills dentro do fxl-core

## Design
- [ ] Skelleton Loading
- [ ] Optimistic UI
- [ ] Progress Bar illusions

# Utils
- [ ] Analisar utiliade do "Debug/BugBot" do Cursor ou Code Review do Codex
- [x] Testar utilização do "Whisperflow"
- [ ] Pesquisar sobre 21st Dev, magicui.design, animate-ui
- [ ] 

## Como usar o Claude Code?
- Tarefas complexas começar pelo modo planejamento
- Criar repositório de skills
  - Dicas: Criar um /techdebt Para rodar no final de cada sessão do Claude Code, para eliminar código duplicado 
  - Criar agentes que sejam analistas, engenheiros, que vão escrever modelos DBT, revisar o código e testar as mudanças em ambiente de desenvolvimento. 
  - O Claude Code pode receber comandos como "Vá e resolva os problemas na integração CI". Não precisa dar tantos detalhes; ele consegue pegar esse contexto automaticamente. 
  - Desafie o Claude Code. Ele trabalha melhor quando você fala coisas como:
    1. Prove pra mim que isso funciona.
    2. Item B: Depois de uma implementação ruim, fale coisas como "Sabendo de tudo que você sabe, joga isso que você acabou de fora e implementa uma solução elegante".
- Interessante entender como criar sub-agents, que a gente possa anexar os agentes em cada requisição. Porque, com esses agentes sub-agents, a gente consegue manter o contexto do agente principal mais focado. 