# Configuração do Google Classroom — v29.1

O Desafio DS não utiliza mais a página inicial genérica do Classroom como destino principal.

Ao selecionar **Abrir Classroom**, o estudante escolhe a disciplina disponível em sua turma. O seletor utiliza os sete links reais descritos em `CLASSROOM_DISCIPLINAS_V29_1.md`.

## Segurança do link

Os endereços fornecidos pelo professor continham `/u/6/`, que identifica somente a posição da conta Google no navegador em que a página foi salva. Para funcionar em dispositivos dos estudantes, os links foram normalizados para:

```text
https://classroom.google.com/c/ID_DA_TURMA
```

## Entrega

Abrir a turma não confirma a entrega. O aluno deve localizar a atividade indicada, anexar o arquivo ou link e selecionar **Entregar**.

Links do tipo `/submissions/`, `/by-status/`, `/done/`, `/not-done/` ou `/returned/` pertencem à visualização do professor e não devem ser publicados para os estudantes.
