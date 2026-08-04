# EduAuth v32.0 — instruções do professor

## Liberação normal de uma aula

1. Publique somente o conteúdo de `PUBLICAR_NO_GITHUB`.
2. Mantenha `PROFESSOR_PRIVADO_NAO_PUBLICAR` fora do repositório e longe dos alunos.
3. Abra `ABRIR_PAINEL_DO_PROFESSOR.html` no pacote completo ou o `index.html` do painel separado.
4. Selecione turma, disciplina e aula.
5. Clique em **Gerar código coletivo da aula**.
6. Informe os 8 números à turma.

O código:

- é vinculado à turma, disciplina e aula;
- é calculado com a data e a hora atuais;
- pode ser compartilhado com toda a turma;
- permanece válido por até 1 hora;
- é solicitado apenas no início da aula.

Não há código-base longo nem validação adicional no fluxo normal da atividade.

## Quando o código expirar

O aluno será orientado a solicitar outro código nos comentários da atividade no Google Classroom. Gere novamente o código para a mesma turma, disciplina e aula.

## Segurança

Nunca publique:

- `validator-config.js`;
- `CONFIGURACAO_PRIVADA_V32_0.json`;
- a pasta `PROFESSOR_PRIVADO_NAO_PUBLICAR`;
- o ZIP separado do painel do professor.

Não existe senha mestre fixa.
