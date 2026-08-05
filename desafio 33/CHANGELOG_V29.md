# Desafio DS v29.0 — 03/08/2026

## Fase 1 — Integridade, reconhecimento e coerência das evidências

### Corrigido

- uma evidência não conclui mais uma missão apenas por possuir o mesmo nome de plataforma;
- o reconhecimento confere plataforma, aula, atividade, turma e disciplina;
- o mesmo resultado não pode ser reutilizado em outra aula apenas reformatando o JSON;
- a duplicidade é pesquisada em todo o perfil por `evidenceId`, transação de origem e hash do arquivo;
- o próprio Desafio DS não é mais tratado como link externo vazio;
- exportações de PDF, HTML e JSON não são mais somadas como evidências pedagógicas;
- o progresso geral considera as etapas parcialmente realizadas e exibe separadamente as aulas concluídas.

### Novos estados de confiança

- **Reconhecida automaticamente**;
- **Validada pelo professor**;
- **Reconhecida parcialmente**;
- **Declaração do aluno**;
- **Incompatível com esta aula**.

Somente evidências reconhecidas automaticamente ou validadas pelo professor atendem uma missão obrigatória.

### Validação docente

Arquivos parciais e declarações do aluno podem ser validados pelo professor por autorização EduAuth assinada. A validação fica vinculada ao perfil, à aula, à atividade, à evidência e à justificativa registrada.

### Compatibilidade

- as 121 aulas e seus IDs foram preservados;
- evidências antigas continuam visíveis;
- arquivos antigos sem contexto completo passam para o estado **Reconhecida parcialmente** e podem ser revisados pelo professor;
- não houve alteração nas chaves EduAuth, apenas atualização da versão da plataforma e do validador correspondente.
