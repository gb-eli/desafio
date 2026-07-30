# Configuração dos links do Google Classroom

O Modo Guiado já mostra o botão **Abrir Google Classroom** ao final de cada aula.

Na versão entregue, o botão abre a página inicial do Classroom:

`https://classroom.google.com/`

Para direcionar cada aula à atividade correta:

1. Abra `js/guided-data.js`.
2. Localize a disciplina ou a aula desejada.
3. Substitua o endereço do campo `classroom` ou `classroomUrl` pelo link copiado da atividade no Classroom.
4. Mantenha o endereço completo começando com `https://`.
5. Publique novamente no GitHub Pages.

O sistema registra que o botão foi aberto, mas não pode confirmar que o aluno anexou e entregou a atividade sem integração autenticada com a API do Google Classroom.
