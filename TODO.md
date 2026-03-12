# TODO
## Padrão
- [ ] Cores pré-definidas para graficso
- [ ] Graficos padrões por tipo de analise (ex: Ranking -> Barra horizontal) 
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


### Perguntar Claude:

De uma analisada nesse repositório: https://github.com/Fxl-Business/fxl-core

Esse hoje é o que começou como uma documentação, para documentar o processo da minha empresa, desde a primeira reunião com o cliente, até a parte tecnica de como fazer o sistema em cima disso

Porém acho que eu posso ter acabado me embolando um pouco em o que é documentação/sistema

Primeiramente o motivo de tratar tudo como documentação: O motivo para tratar tudo como documentação é para que a AI do Claude Code tivesse acesso a todo o processo da empresa e pudesse me ajudar a fazer evoluções, mas com o decorrer da implementação dessa docu,entação evolui para usar o Claude Code com o GSD (é possível ver toda configuração dentro de .claude e .planing)

Outro ponto é, isso não é uma documentação como outra qualquer de um sistema como o "Supabase" por exemplo, pq ela não é uma documentação que deve estar aberta ao publico, ela é uma documentação extremamente complexa que vai além do sistema em si, mas também do processo da empresa, seria interessante fazer algo diferente por conta disso?

A documentação que mais me agrada na internet é do supabase: https://supabase.com/docs , gosto muito do layout e etc...

Outro ponto é, eu não sei nem se realmente não devo considerar algumas partes do meu projeto como "Documentação", pq por exemplo o "Wireframe builder" ele nada mais é do que a documentação que o Claude vai ler para montar o wireframe, ent ele é uma ferramenta ou uma documentação?

E indenpendente do que seja, o objetivo é que no futuro ele seja sim, uma ferramenta interna do meu projeto

Outro ponto é a parte de de clientes, meio que cada um é a documentação de cada cliente, com seu Briefing, Blueprint e etc..., mas será que isso deveria estar no mesmo local que a documentação do processo?

Enfim, estou com muitas dúvidas em relação a esse processo, e preciso evoluir a estrutura disso tudo, para que o projeto consiga crescer sem conflitos