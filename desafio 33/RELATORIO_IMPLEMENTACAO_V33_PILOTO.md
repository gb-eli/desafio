# Relatório de implementação — Desafio DS v33.0 piloto

Data: 4 de agosto de 2026

## Objetivo

Implementar o primeiro recorte do novo padrão pedagógico do Desafio DS com conteúdo real, exemplos explicados, códigos, simuladores internos e diferenciação entre estudantes do período da manhã e adultos do período noturno.

## Escopo entregue

- 21 aulas piloto completas;
- três aulas por disciplina;
- sete disciplinas;
- quatro grupos de estudantes;
- 15 pilotos do período da manhã;
- seis pilotos do período noturno;
- duração prevista entre 20 e 25 minutos;
- ausência de dependência externa na prática principal;
- preservação dos 121 IDs históricos;
- preservação das 114 aulas ativas e sete legadas;
- preservação de perfis, progresso, sessão, Classroom, PDF e EduAuth.

## Novo modelo de conteúdo

As aulas piloto utilizam dados próprios para:

- contexto;
- resultado esperado;
- definição;
- finalidade;
- explicação progressiva;
- glossário;
- exemplo resolvido;
- prática guiada;
- laboratório interno;
- questões com feedback;
- atividade final;
- critérios de correção;
- retomada;
- erros comuns;
- história e curiosidades;
- empresas e aplicações;
- guia de VS Code;
- comandos e dependências.

## Laboratórios internos

Foram adicionados componentes reutilizáveis para:

- sequência de algoritmo;
- entrada, processamento e saída;
- comparação entre linguagens;
- classificação;
- construtor de entrevista;
- construtor de requisitos;
- métricas não funcionais;
- visualização HTML;
- responsividade;
- JavaScript educacional;
- decisão tecnológica;
- linha do tempo;
- organograma;
- módulos e testes;
- compilação C;
- game loop;
- orçamento;
- DOM e cadastro;
- API simulada;
- comparação mobile;
- PWA e offline.

## Experiência por público

### Manhã

- blocos mais visuais;
- curiosidades e comparações;
- códigos progressivos;
- animações leves;
- exploração opcional;
- exemplos de escola, aplicativos, jogos e tecnologia.

### Noite

- linguagem direta;
- tipografia e áreas de toque ampliadas;
- menos elementos simultâneos;
- exemplos de orçamento, clientes, serviços e trabalho de campo;
- uma entrega útil por aula;
- retomada e salvamento contínuo.

## Autenticação e sessão

O fluxo EduAuth da v32 foi preservado:

- código coletivo de oito dígitos;
- vínculo com turma, disciplina e aula;
- validade de uma hora;
- solicitação somente para iniciar;
- nenhuma autenticação adicional durante a aula.

## Compatibilidade

- os IDs originais das aulas foram mantidos;
- o progresso antigo permanece associado às mesmas aulas;
- as 93 aulas não piloto permanecem disponíveis no padrão v32 para comparação;
- o novo conteúdo é aplicado por uma camada independente (`pilot-content-v33.js`);
- o painel privado foi sincronizado com os títulos dos 21 pilotos.

## Limites do piloto

- esta versão não reescreve as 114 aulas;
- os 21 pilotos precisam de revisão pedagógica em uso real;
- a expansão para as outras 93 aulas somente deve ocorrer após aprovação;
- o navegador Chromium administrado não concluiu a automação interativa local;
- IndexedDB, Service Worker, impressão, downloads e clique completo devem receber conferência final na URL HTTPS.

## Arquivos principais

- `PLANO_IMPLEMENTACAO_V33.md`;
- `MAPA_21_AULAS_PILOTO_V33.md`;
- `js/pilot-content-v33.js`;
- `VALIDACAO_FINAL_V33_PILOTO.json`;
- `RESULTADO_QA_V33_PILOTO.json`;
- `CHANGELOG_V33_PILOTO.md`.
