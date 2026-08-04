# Relatório técnico — Fase 1 de UX, lógica e integrações — v29.0

## Escopo implementado

A primeira fase da auditoria concentrou-se nos problemas que poderiam produzir conclusões ou relatórios incoerentes:

1. reconhecimento contextual de evidências;
2. estados de confiança;
3. validação docente;
4. deduplicação global;
5. métricas separadas;
6. ação interna do Desafio DS.

## Reconhecimento contextual

O formato `ds-evidence` foi atualizado para a versão 2. Uma evidência reconhecida automaticamente deve corresponder a:

- `platform.id`;
- `activity.lessonId`;
- `activity.taskId`;
- `student.classKey`;
- `student.disciplineKey`;
- arquivo importado com hash local;
- schema e versão vigentes.

Uma informação ausente gera reconhecimento parcial. Uma informação explicitamente divergente gera incompatibilidade.

## Evidências manuais

O registro manual continua disponível para acessibilidade, falha de exportação ou plataforma sem formato compatível. Ele é identificado como declaração do aluno e não conclui sozinho uma missão obrigatória externa.

Registros produzidos internamente pelo próprio Desafio DS são reconhecidos como ações internas contextualizadas e não tentam abrir nova guia.

## Validação do professor

A validação utiliza a ação crítica `teacher-maintenance` do EduAuth. O registro inclui:

- professor;
- justificativa;
- data e hora;
- perfil;
- aula;
- atividade;
- ID da evidência;
- status anterior;
- autorização assinada.

A validação não altera outras aulas ou evidências.

## Deduplicação

Antes de importar ou registrar um arquivo, o sistema consulta todas as aulas do perfil atual. São comparados:

- `evidenceId`;
- `source.transactionId`;
- hash SHA-256 local do arquivo.

O histórico não é mesclado automaticamente e uma duplicidade é rejeitada com mensagem simples.

## Métricas

O painel passou a separar:

- aulas concluídas;
- progresso das etapas;
- evidências válidas / evidências únicas;
- arquivos exportados;
- tempo ativo;
- horário escolar.

O relatório JSON também informa evidências válidas, pendentes, incompatíveis e validações docentes.

## Limitação honesta

Em uma arquitetura totalmente front-end, um usuário com controle completo do navegador ainda pode alterar o ambiente em execução. A v29 dificulta adulterações simples, detecta incoerências, evita reconhecimento automático indevido e exige revisão docente nos casos parciais, mas não substitui uma autoridade central de servidor.
