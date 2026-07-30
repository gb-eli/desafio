# Desafio DS v22.0 — Front-end, perfis protegidos e Modo Guiado

Aplicação web estática do curso de **Desenvolvimento de Sistemas**, preparada para GitHub Pages e uso em celular, tablet, Chromebook, notebook e computador.

## Modos

- **Competitivo:** 5 vidas, 5 dicas, até 5 pulos, carta extra, tempo, XP e progressão.
- **Diagnóstico completo:** sem eliminação por tempo ou vidas, com relatório pedagógico e sem XP competitivo.
- **Modo Guiado:** 88 aulas por turma e disciplina, códigos curtos, explicações progressivas, laboratórios, tempo ativo mínimo, exportação e Classroom.

## Novidades da v22.0

### Perfis locais protegidos

- criação e seleção de múltiplos perfis;
- PBKDF2-HMAC-SHA-256 com salt exclusivo;
- AES-GCM de 256 bits para dados e chave do perfil;
- IndexedDB para armazenamento criptografado;
- bloqueio automático após inatividade;
- expiração após seis dias desde o último salvamento;
- backup `.edu-profile` criptografado;
- importação em outro equipamento ou navegador compatível;
- recuperação administrativa por arquivo de chave, frase-senha mestre e senha do Modo Professor;
- sessão temporária para quem não deseja salvar.

### Conclusão e entrega

A plataforma diferencia:

1. resultado preparado;
2. arquivo exportado;
3. Classroom aberto;
4. entrega declarada pelo aluno;
5. confirmação externa por API — **não disponível nesta versão estática**.

O Modo Guiado oferece:

- Entrega rápida;
- Me guie passo a passo;
- Já sei entregar;
- ajuda para localizar arquivos e resolver falhas de upload;
- botões para Classroom, GitHub e VS Code Web quando aplicável.

### Contexto escolar e informações

- indicador do período escolar no fuso `America/Sao_Paulo`;
- horários configurados para manhã e noite;
- lembretes não bloqueantes de salvamento e entrega;
- área Sobre, créditos, versões e limitações;
- Central de Ajuda para Classroom, GitHub, VS Code e armazenamento;
- catálogo de ferramentas com estado real e sem links falsos;
- conexões educacionais com carreiras, sem anunciar vagas desatualizadas.

## Aulas guiadas

- 1º DS — Introdução à Programação: 14 aulas;
- 1º DS — Análise e Método para Sistemas: 16 aulas;
- 2º DS — Programação Front-End: 12 aulas;
- 2º DS — Inovação Tecnológica e Empreendedorismo: 10 aulas;
- 3º DS — Programação no Desenvolvimento de Sistemas: 10 aulas;
- Subsequente noturno — Programação Front-End: 12 aulas;
- Subsequente noturno — Programação Mobile I: 14 aulas.

**Total: 88 aulas.**

## Publicação no GitHub Pages

1. Envie todo o conteúdo desta pasta para a raiz do repositório.
2. Mantenha `index.html` na raiz.
3. Ative o GitHub Pages na branch escolhida.
4. Abra a página publicada em aba anônima para evitar cache anterior.
5. Não publique a pasta privada do professor.

## Arquivos principais

- `index.html`: telas e modais;
- `css/style.css`: interface e responsividade;
- `js/app.js`: desafio competitivo e diagnóstico;
- `js/guided.js`: Modo Guiado e Central de Entrega;
- `js/guided-data.js`: 88 aulas e hashes de códigos;
- `js/profile-store.js`: perfis criptografados, backup e recuperação;
- `js/schedule.js`: horário escolar contextual;
- `js/platform-shell.js`: ajuda, créditos, versões, ferramentas e carreiras;
- `ANALISE_IMPLEMENTACAO_PROMPT_MESTRE_V21.md`: relatório de aplicação do padrão;
- `GUIA_PERFIS_LOCAIS_V21.md`: uso dos perfis e recuperação;
- `CHANGELOG_V21.md`: alterações desta versão;
- `VALIDACAO_ESTRUTURAL_V21.json`: testes automatizados.

## Limitações do front-end

- o navegador controla a persistência;
- não há sincronização automática entre aparelhos;
- a entrega do Classroom não pode ser confirmada sem API, OAuth e backend;
- a recuperação depende do arquivo administrativo e da frase-senha correta;
- perder todas as chaves pode tornar o perfil irrecuperável;
- códigos e senhas em hash são controles pedagógicos, não autenticação de servidor;
- oportunidades profissionais atuais não são exibidas sem verificação recente.


## EduAuth Offline v22

A versão 22 substitui senhas fixas por autorizações temporárias vinculadas a turma, disciplina, aula, ação, horário e sessão. O pacote público usa exclusivamente chaves de desenvolvimento e não deve ser utilizado em atividade real antes do provisionamento de produção. Consulte `eduauth-integration-report.md`.


### Estado do provisionamento

A Fase 1 do EduAuth está funcional e reproduzível, mas usa chaves de desenvolvimento. A plataforma deve permanecer em teste até que o pacote público de produção seja gerado pelo futuro EduAuth Professor.
