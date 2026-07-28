# Desafio DS v18.1 — GitHub Pages

Aplicação estática para as turmas:

- 1º DS — Manhã;
- 2º DS — Manhã;
- 3º DS — Manhã;
- 2º DS — Noite.

## Publicação

Envie o conteúdo desta pasta para a raiz do repositório configurado no GitHub Pages. O arquivo `index.html` precisa permanecer na raiz.

Depois da publicação, abra a página em uma aba anônima ou limpe o cache. Os arquivos usam `?v=18.1` para reduzir o risco de o navegador reutilizar JavaScript ou CSS de versões anteriores.

## Estrutura pedagógica

- 234 perguntas protegidas;
- 13 áreas, com 18 perguntas por área;
- dificuldade progressiva do nível 1 ao 5;
- 15 laboratórios práticos;
- questões de múltipla escolha, digitação, código, comando, associação, classificação e ordenação;
- alternativas embaralhadas com fonte criptográfica;
- tempo mínimo de leitura;
- XP ponderado por dificuldade, nível cognitivo, ritmo e sequência de acertos;
- proficiência geral, por área, competência, tecnologia, linguagem de programação e idioma técnico;
- indicação educacional de trilhas e cargos;
- premiações de Madeira a Titã;
- Arcade DS liberado por desempenho e integridade.

## Áreas

1. Análise e Métodos de Sistemas
2. Back-end / APIs / Cloud / Virtualização
3. Banco de Dados / SQL
4. CMD / Terminal / Organização de Arquivos
5. Ciência de Dados / Dados
6. Computação Gráfica / UX / UI
7. Computação e Hardware
8. Front-end / HTML / CSS / JavaScript
9. Inglês Técnico — Bônus
10. Inovação Tecnológica e Empreendedorismo
11. Python / Programação
12. Segurança de Aplicações / Criptografia
13. Espanhol Técnico — Bônus

## Segurança e integridade

- política CSP restritiva;
- sanitização do nome e de entradas textuais;
- saída dinâmica escapada ou inserida por `textContent`;
- laboratório de front-end em `iframe` sem permissão de scripts e com CSP própria;
- bloqueio de colar em respostas digitadas durante a atividade;
- registro de respostas excessivamente rápidas, perda de foco e atalhos de inspeção;
- banco dividido em 13 módulos cifrados com AES-GCM;
- provas de resposta com sal individual;
- comprovante final cifrado.

## Limite técnico importante

O GitHub Pages é uma hospedagem estática. Essas medidas reduzem XSS, manipulação casual, chutes e cópia simples, mas não transformam o navegador do aluno em um ambiente inviolável. Quem controla o dispositivo pode estudar o código em execução. Supervisão docente e conferência do relatório continuam necessárias.

Consulte `AUDITORIA_TECNICA_V18_1.md` para os testes e limites registrados nesta versão.
