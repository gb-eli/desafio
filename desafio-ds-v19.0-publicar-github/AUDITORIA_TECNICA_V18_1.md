# Auditoria técnica — Desafio DS v18.1

## Banco de conteúdo

- **234 perguntas**;
- **15 laboratórios**;
- **13 áreas**, todas com 18 perguntas;
- distribuição de dificuldade:
  - nível 1: 13;
  - nível 2: 52;
  - nível 3: 104;
  - nível 4: 52;
  - nível 5: 13;
- formatos:
  - 172 múltipla escolha;
  - 13 completar frase;
  - 13 relacionar;
  - 13 classificar/arrastar;
  - 13 ordenar;
  - 8 completar código;
  - 2 completar comando.

Os 13 itens fundamentais foram reescritos para evitar alternativas absurdas. Também foram revisados enunciados excessivamente curtos e alternativas cujo comprimento poderia indicar a resposta.

## Laboratórios

- nível intermediário: 9;
- nível avançado: 5;
- nível especialista: 1;
- controladores reconhecidos: requisitos, fluxograma, máquina virtual, API, SQL, CMD, dados, UX, hardware, front-end, inovação, Python, segurança e idioma técnico.

Todos os 15 registros apontam para um controlador existente em `labs.js`. A conclusão é idempotente, e o fluxo principal possui tratamento de falha e opção de pular quando um laboratório não consegue prosseguir.

## Alternativas

O embaralhamento usa `crypto.getRandomValues`. Em 20.000 simulações, a posição da alternativa correta ficou distribuída em aproximadamente:

- A: 25,15%;
- B: 25,48%;
- C: 24,49%;
- D: 24,88%.

A resposta é validada pelo token depois do embaralhamento, não pela posição visual.

## Proficiência, XP e premiação

O XP considera dificuldade, nível cognitivo, ritmo normal e sequência de acertos. A proficiência geral pondera:

- desempenho ponderado;
- desempenho avançado;
- cobertura de áreas;
- ritmo;
- duração;
- integridade.

Respostas muito rápidas, poucas áreas, duração incompatível ou alertas de integridade limitam a classificação. O relatório apresenta:

- proficiência geral;
- proficiência por área;
- domínio por dificuldade;
- competências;
- tecnologias e linguagens de programação;
- inglês e espanhol técnicos;
- trilhas profissionais indicadas;
- níveis de Madeira, Bronze, Prata, Ouro, Platina, Diamante, Mestre, Lendário, Épico, Mítico e Titã.

## Segurança revisada

Verificações realizadas:

- CSP com `default-src 'self'`, `script-src 'self'`, `script-src-attr 'none'`, `connect-src 'none'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'` e `frame-ancestors 'none'`;
- ausência de `eval`, `new Function` e `document.write` no JavaScript da aplicação;
- nome do aluno normalizado e limitado;
- saída dinâmica escapada ou inserida com `textContent` nos pontos que recebem dados do aluno;
- prévia de HTML limitada a uma lista de tags e atributos;
- atributos de evento removidos;
- CSS da prévia remove URLs, expressões, comportamentos legados e protocolos de script;
- prévia de front-end isolada em iframe sem scripts e com CSP própria;
- banco cifrado em 13 chunks e verificado nos três perfis de acesso: 39 pacotes descriptografados e comparados com o inventário esperado;
- 234 IDs de pergunta e 15 IDs de laboratório sem duplicidade;
- provas de resposta de múltipla escolha verificadas.

## Testes automatizados executados

- sintaxe de todos os arquivos JavaScript;
- leitura estrutural dos dois arquivos HTML;
- correspondência dos módulos cifrados;
- distribuição de alternativas;
- limitadores de proficiência para tentativa rápida;
- existência de controladores para todos os laboratórios;
- referências a scripts e arquivos principais.

## Limitações conhecidas

Não foi possível concluir uma navegação automatizada integral com Chromium neste ambiente porque o processo headless não encerrou corretamente. Portanto, a auditoria desta revisão combina testes unitários, validação de banco, análise estática e os testes reais já realizados em sala na versão anterior.

Como o projeto roda integralmente no navegador, a criptografia do banco e do comprovante é proteção operacional. Ela não oferece a mesma garantia de um servidor que mantenha chaves fora do dispositivo do aluno.
