# Desafio DS v19.0 — Desafio + Modo Guiado

Aplicação web estática para o curso de **Desenvolvimento de Sistemas**, preparada para publicação no GitHub Pages.

## Modos disponíveis

### Desafio DS

Mantém o diagnóstico gamificado da versão anterior:

- perguntas protegidas;
- laboratórios práticos;
- dificuldade progressiva;
- pontuação, vidas, dicas e power-ups;
- relatórios por área e competência;
- comprovante final.

### Modo Guiado

Nova experiência para acompanhar as aulas do professor:

- nome, turma e disciplina;
- lista de aulas por turma;
- código curto por aula;
- explicações progressivas;
- explicações extras A–J;
- exemplos práticos e aplicações reais;
- ferramentas simuladas;
- laboratórios;
- desafio e revisão;
- tempo mínimo de 25 minutos ativos;
- recursos de apoio;
- registro da sessão;
- exportação de evidência;
- botão do Google Classroom.

## Turmas e disciplinas do Modo Guiado

- **1º DS — Manhã — A**
  - Introdução à Programação: 14 aulas;
  - Análise e Método para Sistemas: 16 aulas.
- **2º DS — Manhã — A**
  - Programação Front-End: 12 aulas;
  - Inovação Tecnológica e Empreendedorismo: 10 aulas.
- **3º DS — Manhã — C**
  - Programação no Desenvolvimento de Sistemas: 10 aulas.
- **2º Semestre — Noite — A**
  - Programação Front-End: 12 aulas;
  - Programação Mobile I: 12 aulas.

Total: **86 aulas guiadas**.

## Publicação

1. Envie todo o conteúdo desta pasta para a raiz do repositório.
2. Confirme que `index.html` está na raiz.
3. Ative o GitHub Pages para a branch desejada.
4. Aguarde a publicação.
5. Abra a página em aba anônima para evitar cache antigo.

## Arquivos principais

- `index.html`: telas do Desafio e do Modo Guiado;
- `css/style.css`: estilos gerais e responsivos;
- `js/app.js`: motor do Desafio DS;
- `js/guided.js`: motor do Modo Guiado;
- `js/guided-data.js`: turmas, disciplinas e banco de aulas;
- `GUIA_PUBLICO_MODO_GUIADO.md`: funcionamento do modo para estudantes;
- o guia privado do professor é entregue fora da pasta que será publicada;
- `CONFIGURAR_CLASSROOM.md`: configuração dos links de entrega;
- `CHANGELOG_V19.md`: alterações desta versão.

## Armazenamento

O Modo Guiado usa `localStorage` para manter:

- perfil selecionado;
- preferências de apoio;
- aulas liberadas;
- etapas concluídas;
- respostas;
- tempo ativo;
- eventos da sessão;
- autorizações docentes.

Os dados permanecem no navegador utilizado. Para sincronizar entre aparelhos, será necessária uma integração futura com autenticação e banco de dados.

## Limite técnico

O GitHub Pages é uma hospedagem estática. Os códigos e senhas funcionam como controles pedagógicos, mas não equivalem a autenticação protegida em servidor. Um usuário com conhecimento técnico e controle do dispositivo pode estudar os arquivos públicos.
