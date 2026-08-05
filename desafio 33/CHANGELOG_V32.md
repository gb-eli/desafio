# Desafio DS v32.0 — fluxo simplificado de aula

Data: 04/08/2026.

## Autenticação

- A aula guiada solicita somente um código coletivo de oito números no início.
- O código é vinculado à turma, disciplina e aula selecionadas.
- A validade é de uma hora a partir da geração no Painel EduAuth Professor.
- Nenhuma etapa normal da aula solicita novo PIN, código-base ou validação docente.
- Quando o código estiver inválido ou expirado, o aluno é orientado a solicitar outro nos comentários da atividade no Google Classroom.

## Plataformas e comprovantes

- Lab Virtual DS, Lab 3D/HoloMotion, CTF Cyber e Fliperama DS aparecem pelo nome, sem endereço fixo.
- O professor ou a atividade no Classroom informa o endereço atualizado.
- Atividades externas solicitam resumo e comprovante em imagem, PDF, JSON, HTML ou texto.
- Atividades de código que exigem publicação solicitam o link do GitHub.
- O comprovante final inclui nome da plataforma, arquivo, hash, horário, descrição e links informados.

## Conclusão

- A conclusão verifica etapas, dez minutos mínimos e comprovantes obrigatórios.
- Foi removida a liberação antecipada do fluxo normal da aula.
- O botão final conclui a aula e abre o comprovante pronto para Imprimir → Salvar como PDF.
- O documento inclui aluno, turma, disciplina, aula, início, fim, tempo ativo, respostas, práticas, laboratórios, comprovantes, links e log da sessão.

## UX e responsividade

- Botões receberam áreas de toque reais de pelo menos 48 px.
- Elementos decorativos e pseudo-elementos não interceptam cliques.
- Foi removido o deslocamento visual de botões no hover, evitando diferença entre a área visível e a área clicável.
- A barra de ações é adaptada para celular, tablet e Chromebook.
- Formulários de comprovante são exibidos em uma coluna em telas pequenas.
