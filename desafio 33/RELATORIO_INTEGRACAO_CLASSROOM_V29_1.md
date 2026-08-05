# Relatório de integração do Google Classroom — v29.1

## Objetivo

Substituir o destino genérico do Google Classroom por um fluxo contextual no qual o estudante escolhe a disciplina antes de abrir a turma correta.

## Fonte dos endereços

Os identificadores das turmas foram extraídos do arquivo salvo da página inicial do Google Classroom fornecido pelo professor em 03/08/2026.

Os endereços originais continham `/u/6/`, que representa a posição da conta Google no navegador do professor. Esse trecho foi removido para que o link use a conta autenticada no dispositivo do estudante.

## Fluxo implementado

1. O estudante seleciona **Abrir Classroom**.
2. O sistema identifica a turma do perfil.
3. Exibe somente as disciplinas daquela turma.
4. Destaca a disciplina atual sem abrir automaticamente.
5. O estudante escolhe a disciplina.
6. A turma abre em nova guia.
7. O histórico registra turma, disciplina, URL e horário.
8. A plataforma continua informando que abrir o Classroom não confirma a entrega.

## Mapeamento

| Turma | Disciplina | Endereço |
|---|---|---|
| 1º DS — manhã | Introdução à Programação | `https://classroom.google.com/c/ODQyMTU5MjQ3MTA1` |
| 1º DS — manhã | Análise e Método para Sistemas | `https://classroom.google.com/c/NzkzNTA2MzQ0MjU1` |
| 2º DS — manhã | Programação Front-End | `https://classroom.google.com/c/ODQyMTU3NDI1MTAy` |
| 2º DS — manhã | Inovação Tecnológica e Empreendedorismo | `https://classroom.google.com/c/NzkzNTA2MTk2NDg4` |
| 3º DS — manhã | Programação no Desenvolvimento de Sistemas | `https://classroom.google.com/c/ODQyMTU2NzEwNzc1` |
| 2º DS Subsequente — noite | Programação Front-End | `https://classroom.google.com/c/ODcxMDE0NTQ3NzYw` |
| 2º DS Subsequente — noite | Programação Mobile I | `https://classroom.google.com/c/ODcxMDE0Mjg4NTU4` |

## Pontos de acesso

- resultado do Desafio DS;
- conclusão de uma aula do Modo Guiado;
- barra global da plataforma;
- Central de Ajuda, na aba Classroom.

## Segurança e coerência

- somente URLs HTTPS do domínio `classroom.google.com` são aceitas pelo módulo;
- links de correção do professor não foram publicados;
- o pacote público não contém credenciais da conta Google;
- o sistema não afirma que a entrega foi confirmada;
- as 121 aulas anteriores foram preservadas;
- o EduAuth v29 permanece compatível, sem troca de chaves.

## Testes

O seletor foi testado em um harness local com os componentes e CSS reais:

- 1366 × 900: duas disciplinas do 1º DS, uma destacada, sem rolagem horizontal;
- 390 × 844: cards em coluna, controles de toque, sem rolagem horizontal;
- sem perfil ativo: quatro grupos e sete disciplinas;
- seleção de Análise e Método: URL correta capturada;
- nenhum erro de console no fluxo testado.

## Limitação

Os links abrem a turma, não uma atividade individual. O estudante precisa localizar a tarefa indicada pelo professor, anexar o arquivo ou link e selecionar **Entregar**.
