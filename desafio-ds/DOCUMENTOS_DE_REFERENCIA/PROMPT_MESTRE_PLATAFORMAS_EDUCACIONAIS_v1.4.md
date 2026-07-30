---
title: "Prompt Mestre — Integrações Educacionais, Perfis Locais e Recuperação Administrativa"
version: "1.4"
date: "2026-07-29"
language: "pt-BR"
purpose: "Padrão reutilizável para atualizar plataformas educacionais do professor Gabriel, incluindo integrações, perfis locais, recuperação administrativa, créditos e histórico de versões"
---

# PROMPT MESTRE PARA ATUALIZAÇÃO DAS PLATAFORMAS EDUCACIONAIS

## Registro desta versão do prompt mestre

- Versão do prompt mestre: 1.4
- Data da consolidação: 29/07/2026
- Idealização e direção pedagógica: Professor Gabriel
- Ferramenta de apoio utilizada nesta consolidação: ChatGPT
- Modelo utilizado: GPT-5.6 Thinking
- Modo: raciocínio, organização e produção assistida
- Alteração principal: inclusão do padrão de divulgação cruzada das plataformas, laboratórios, simuladores, desafios e aulas disponíveis



Analise integralmente a plataforma educacional existente e implemente, de maneira incremental, compatível e segura, os padrões descritos neste documento.

Este prompt é um **padrão transversal** para diferentes sistemas educacionais. Ele não deve ser aplicado cegamente. Antes de alterar o código, identifique quais recursos fazem sentido para a plataforma atual, quais já existem, quais precisam ser adaptados e quais não se aplicam.

O objetivo é criar uma experiência coerente entre as plataformas utilizadas pelo professor Gabriel, principalmente nos seguintes aspectos:

- identificação e continuidade do aluno;
- perfil local protegido por senha;
- persistência temporária de progresso;
- exportação, importação e migração de perfil;
- recuperação administrativa de acesso;
- integração assistida com Google Classroom;
- integração com GitHub;
- abertura e continuidade no VS Code;
- organização das atividades;
- tutoriais progressivos;
- exportação de resultados;
- entrega de evidências;
- acessibilidade;
- responsividade;
- privacidade;
- integridade dos registros;
- consciência do horário escolar e da aula atual;
- alertas contextuais de salvamento, exportação e entrega;
- orientação sobre carreiras e áreas de tecnologia;
- oportunidades locais de estágio, emprego, aprendizagem e concursos públicos;
- conexão entre conteúdos estudados e possibilidades profissionais;
- descoberta de outras plataformas, laboratórios, desafios, aulas, simuladores e emuladores educacionais;
- clareza sobre as limitações de uma aplicação totalmente front-end.

---

# 1. PRINCÍPIOS GERAIS

## 1.1. Não reescrever o que já funciona

Antes de implementar qualquer funcionalidade:

1. Analise a arquitetura atual.
2. Identifique componentes já existentes.
3. Preserve fluxos que estejam funcionando.
4. Reutilize estilos, componentes, estados e padrões visuais.
5. Evite grandes reescritas sem necessidade.
6. Mantenha compatibilidade com dados já salvos, quando houver.
7. Crie migrações de versão sempre que o formato de dados mudar.

## 1.2. Aplicação contextual

Cada plataforma deve ativar somente os recursos relevantes.

Exemplos:

- Uma atividade de programação pode usar GitHub e VS Code.
- Uma atividade de diagnóstico pode não precisar de GitHub.
- Uma atividade textual pode exportar PDF ou arquivo de evidência.
- Uma atividade guiada pode precisar apenas de Classroom e perfil local.
- Uma plataforma com fases deve persistir níveis, progresso e desbloqueios.
- Uma plataforma de recuperação adaptada pode persistir preferências de acessibilidade e adaptações.

Não adicionar botões que apenas simulam integração.

Cada botão deve:

- executar uma ação real;
- abrir um destino válido;
- baixar um arquivo real;
- iniciar um tutorial útil;
- ou deixar explicitamente claro que depende de configuração externa.

## 1.3. Divulgação progressiva

A interface deve seguir a regra:

> Mostrar somente o necessário para a etapa atual e disponibilizar ajuda adicional sob demanda.

Organizar informações em três níveis:

### Nível 1 — Essencial

Visível imediatamente:

- o que o aluno precisa fazer;
- o que será produzido;
- o que será entregue;
- prazo;
- ação atual;
- próxima ação.

### Nível 2 — Ajuda contextual

Exibido ao selecionar “Preciso de ajuda”:

- passo a passo da etapa atual;
- demonstração;
- problemas possíveis;
- soluções mais prováveis.

### Nível 3 — Tutorial completo

Exibido somente quando solicitado:

- funcionamento do Classroom;
- organização da escola;
- Google Drive;
- Google Fotos;
- GitHub;
- VS Code;
- armazenamento;
- recuperação;
- migração;
- perguntas frequentes.

---

# 2. ANÁLISE OBRIGATÓRIA DA PLATAFORMA

Antes de implementar, produza uma análise da plataforma atual contendo:

- tipo de atividade;
- público-alvo;
- dispositivos principais;
- fluxo atual;
- formato dos resultados;
- integrações existentes;
- componentes que podem ser reaproveitados;
- riscos de perda de dados;
- riscos de privacidade;
- problemas de responsividade;
- necessidade de Classroom;
- necessidade de GitHub;
- necessidade de VS Code;
- necessidade de perfil local;
- necessidade de exportação;
- necessidade de recuperação administrativa;
- compatibilidade com outras plataformas do professor Gabriel.

Classifique cada funcionalidade como:

- obrigatória;
- recomendada;
- opcional;
- não aplicável;
- dependente de credenciais;
- dependente de backend;
- dependente de autorização institucional.

Ao final da análise, implemente o que for possível no contexto atual sem bloquear o restante da plataforma.

---

# 3. PADRÃO VISUAL E EXPERIÊNCIA DO USUÁRIO

A plataforma deve funcionar adequadamente em:

- celular;
- Chromebook;
- notebook;
- computador do laboratório;
- computador pessoal;
- navegadores modernos.

Requisitos:

- layout responsivo;
- ausência de textos sobrepostos;
- ausência de rolagem horizontal desnecessária;
- botões grandes no celular;
- ações principais dentro de áreas confortáveis para o polegar;
- textos curtos;
- cards enxutos;
- stepper de progresso;
- indicadores claros de status;
- feedback de carregamento;
- feedback de salvamento;
- feedback de erro;
- navegação por teclado;
- contraste adequado;
- suporte a leitores de tela;
- opção de reduzir animações;
- animações curtas e funcionais;
- estados vazios explicativos;
- modais acessíveis;
- foco visível;
- mensagens que não culpem o aluno.

Não mostrar todas as funcionalidades de uma vez.

Na maior parte do tempo, o aluno deve enxergar:

- onde está;
- o que está fazendo;
- o que precisa fazer agora;
- como pedir ajuda;
- como salvar;
- como sair com segurança.

---

# 4. ORGANIZAÇÃO ESCOLAR E CONTEXTO DO ALUNO

A plataforma deve ajudar o aluno a compreender a estrutura:

1. Colégio.
2. Conta escolar.
3. Turma.
4. Disciplina.
5. Professor.
6. Tema ou unidade.
7. Atividade.
8. Prazo.
9. Resultado esperado.
10. Entrega.
11. Correção ou devolução.

Apresentar de forma resumida:

> Colégio → Turma → Disciplina → Tema → Atividade

Exemplo:

> 2º DS → Programação Front-End → JavaScript → Exercícios 41 a 50

Na tela principal da atividade, mostrar somente:

- disciplina;
- professor;
- turma;
- título;
- tema;
- prazo;
- status;
- próxima ação.

Outras informações devem ficar em “Ver detalhes”.

---

# 5. COMO FUNCIONAM AS ATIVIDADES DO PROFESSOR GABRIEL

Criar um modelo configurável denominado:

> Como funcionam as atividades do professor Gabriel

Esse modelo deve refletir a organização real do Google Classroom e das plataformas.

Estrutura recomendada:

- turma;
- disciplina;
- trimestre ou unidade;
- tema;
- título da atividade;
- objetivo;
- instruções;
- materiais necessários;
- etapas;
- tempo estimado;
- resultado esperado;
- nome esperado do arquivo;
- formato de entrega;
- prazo;
- pontuação, quando houver;
- observações;
- recuperação ou correção;
- status.

Sempre que possível, utilizar os mesmos nomes apresentados no Classroom.

Exemplo:

Classroom:

> 2º Trimestre — JavaScript — Exercícios 41 a 50

Plataforma:

> 2º Trimestre → JavaScript → Exercícios 41 a 50

Evitar criar nomes diferentes para o mesmo conteúdo.

---

# 6. CENTRAL DE CONCLUSÃO E ENTREGA

Ao concluir a atividade, exibir uma Central de conclusão e entrega.

Ela deve conter:

- confirmação de atividade concluída;
- resumo do que foi realizado;
- nome do resultado gerado;
- formato;
- data e horário;
- botão para visualizar;
- botão para baixar novamente;
- informação sobre onde o arquivo foi salvo;
- botão de ajuda para localizar;
- status de preparação;
- próximos passos;
- botão para abrir o Classroom;
- botão para abrir GitHub ou VS Code, quando aplicável.

Quando houver vários arquivos de código, preferir um arquivo ZIP organizado.

O ZIP pode conter:

- código-fonte;
- recursos;
- README.md;
- instruções de execução;
- identificação da atividade;
- resumo;
- evidências;
- .gitignore;
- instruções de entrega;
- instruções de publicação.

Nunca incluir:

- senhas;
- tokens;
- segredos;
- chaves privadas;
- credenciais;
- arquivos .env;
- dados pessoais desnecessários.

---

# 7. MODOS DE ORIENTAÇÃO

Oferecer:

1. Entrega rápida.
2. Me guie passo a passo.
3. Já sei entregar.

## 7.1. Entrega rápida

Apresentar checklist curto:

1. Atividade concluída.
2. Resultado preparado.
3. Arquivo localizado.
4. Classroom aberto.
5. Arquivo ou link anexado.
6. Entrega confirmada.

## 7.2. Modo guiado

Mostrar uma etapa por vez.

Cada etapa deve conter:

- instrução curta;
- demonstração;
- botão “Consegui”;
- botão “Não consegui”;
- botão “Voltar”;
- botão “Ver mais”;
- botão “Pular tutorial”;
- indicador de progresso.

Ao selecionar “Não consegui”, mostrar somente os problemas relacionados àquela etapa.

## 7.3. Aluno experiente

Permitir:

- pular tutoriais;
- abrir diretamente o Classroom;
- copiar link;
- baixar arquivo;
- abrir GitHub;
- abrir VS Code;
- marcar etapas manualmente.

A ajuda deve continuar disponível.

---

# 8. GOOGLE CLASSROOM

## 8.1. Configuração da atividade

O professor deve poder configurar:

- link geral do Classroom;
- link direto da atividade;
- turma;
- disciplina;
- título;
- tema;
- prazo;
- tipo de entrega;
- nome esperado do arquivo;
- comentário particular;
- instruções adicionais;
- critérios de conclusão;
- link de repositório;
- materiais complementares.

Quando houver link direto:

> Abrir esta atividade no Google Classroom

Quando não houver:

> Abrir o Google Classroom

## 8.2. Tutorial de entrega

Fluxo básico:

1. Confirme a conta escolar correta.
2. Abra a turma indicada.
3. Entre na atividade correta.
4. Leia as instruções.
5. Abra “Seu trabalho”.
6. Escolha adicionar ou criar.
7. Selecione arquivo ou link.
8. Localize o resultado.
9. Aguarde o carregamento.
10. Confira o nome.
11. Adicione comentário particular, quando solicitado.
12. Clique em “Entregar”.
13. Confirme.
14. Verifique o status.

Quando não houver anexo, orientar o uso de “Marcar como concluída”, quando essa for a opção disponível.

## 8.3. Termos coerentes

Usar termos próximos aos do Classroom:

- Turma;
- Mural;
- Atividades;
- Tema;
- Instruções;
- Seu trabalho;
- Adicionar ou criar;
- Arquivo;
- Link;
- Comentário particular;
- Entregar;
- Marcar como concluída;
- Cancelar envio;
- Entregue;
- Pendente;
- Devolvido.

Adaptar o tutorial ao dispositivo.

## 8.4. Confirmação real

Não registrar “entregue” apenas porque o aluno abriu o Classroom.

Diferenciar:

- resultado exportado;
- Classroom aberto;
- aluno confirmou que anexou;
- aluno confirmou que entregou;
- entrega confirmada por API.

---

# 9. TUTORIAL GERAL DO CLASSROOM

Criar uma Central de Ajuda opcional com módulos curtos:

- entrar com a conta escolar;
- identificar a conta correta;
- encontrar uma turma;
- entender o Mural;
- entender Atividades;
- localizar um tema;
- abrir uma atividade;
- ler instruções;
- verificar prazo;
- anexar arquivo;
- anexar link;
- criar documento;
- escrever comentário particular;
- entregar;
- marcar como concluída;
- cancelar envio;
- corrigir e reenviar;
- consultar atividades pendentes;
- consultar entregas;
- consultar devolutivas;
- consultar notas, quando disponível;
- resolver armazenamento cheio;
- usar no celular;
- usar no computador.

Cada módulo deve conter:

- explicação breve;
- animação ou imagem;
- exemplo;
- botão “Entendi”;
- botão “Mostrar novamente”;
- botão “Praticar”;
- botão “Preciso de ajuda”.

Não abrir esse tutorial automaticamente em todas as atividades.

---

# 10. ARMAZENAMENTO DAS CONTAS ESCOLARES

Considerar como regra institucional real:

- algumas contas possuem 5 GB;
- as demais possuem no máximo 15 GB;
- nenhuma conta de aluno deve ser tratada como ilimitada.

O espaço pode ser consumido por:

- Google Drive;
- Google Classroom;
- Gmail;
- Google Fotos;
- cópias de documentos;
- anexos;
- arquivos pessoais;
- vídeos;
- backups automáticos.

Exibir aviso educativo:

> A conta escolar possui 5 GB ou, no máximo, 15 GB. Utilize-a apenas para atividades e materiais escolares.

## 10.1. Possíveis sintomas

- servidor recusado;
- upload que não inicia;
- upload infinito;
- arquivo que desaparece;
- falha ao criar documento;
- falha ao anexar;
- atividade que não conclui;
- aviso de limite;
- erro no Drive.

## 10.2. Diagnóstico progressivo

Perguntar uma questão por vez:

1. O arquivo foi baixado?
2. Está na pasta Downloads?
3. Abre normalmente?
4. A conta correta está conectada?
5. A internet funciona?
6. O armazenamento está cheio?
7. A conta possui 5 GB ou 15 GB?
8. Há fotos, vídeos, e-mails ou arquivos antigos ocupando espaço?

## 10.3. Limpeza orientada

Orientar a verificar:

- arquivos grandes no Drive;
- lixeira do Drive;
- materiais antigos;
- arquivos de anos anteriores;
- Gmail com anexos grandes;
- lixeira e spam;
- Google Fotos;
- backups indevidos.

Antes de excluir:

1. verificar se o arquivo ainda será necessário;
2. baixar uma cópia quando importante;
3. confirmar que a cópia abre;
4. excluir;
5. esvaziar a lixeira.

A plataforma nunca deve apagar automaticamente arquivos do aluno.

---

# 11. GOOGLE FOTOS E BACKUP INDEVIDO

É comum o aluno conectar a conta escolar ao celular e ativar o backup automático.

Isso pode:

- consumir rapidamente 5 GB ou 15 GB;
- misturar fotos pessoais e conta institucional;
- impedir entregas;
- causar exclusões sincronizadas;
- expor conteúdo pessoal.

Tutorial:

1. Abrir Google Fotos no celular.
2. Conferir a conta ativa.
3. Abrir configurações de backup.
4. Desativar o backup da conta escolar.
5. Selecionar conta pessoal, se apropriado.
6. Conferir outros dispositivos.
7. Abrir Google Fotos da conta escolar no navegador.
8. Conferir fotos e vídeos.
9. Garantir cópia em outro local.
10. Excluir somente após conferência.
11. Esvaziar a lixeira quando houver certeza.

Exibir alerta:

> Fotos sincronizadas podem ser removidas também de outros dispositivos. Desative o backup da conta escolar antes de excluir.

---

# 12. GITHUB

Ativar quando a atividade envolver programação.

Possibilidades:

- baixar projeto em ZIP;
- copiar arquivos;
- abrir repositório de referência;
- criar repositório a partir de template;
- abrir no GitHub;
- abrir no github.dev;
- abrir no VS Code Web;
- abrir em Codespaces;
- tutorial para criar repositório;
- tutorial para enviar arquivos;
- tutorial de clone, commit e push.

## 12.1. Fluxo iniciante

1. Baixar ZIP.
2. Extrair.
3. Conferir arquivos.
4. Criar repositório.
5. Add file.
6. Upload files.
7. Selecionar arquivos.
8. Escrever mensagem de commit.
9. Confirmar commit.
10. Copiar link.
11. Anexar link no Classroom.

## 12.2. Repositório modelo

Quando houver template:

- criar cópia do template;
- não alterar o original;
- manter estrutura;
- personalizar somente o necessário.

## 12.3. Segurança

Nunca solicitar token pessoal no frontend.

Nunca publicar:

- senhas;
- chaves;
- tokens;
- .env;
- credenciais;
- dados pessoais.

Quando o repositório for público, evitar nome completo e dados desnecessários.

---

# 13. VS CODE

Oferecer conforme a atividade:

- Abrir no VS Code Web;
- Abrir no github.dev;
- Abrir em Codespaces;
- Usar no VS Code Desktop;
- Como abrir no computador.

Links possíveis:

```text
https://vscode.dev/github/ORGANIZACAO/REPOSITORIO
```

```text
https://github.dev/ORGANIZACAO/REPOSITORIO
```

Usar VS Code Web para:

- leitura;
- alterações simples;
- arquivos de texto;
- HTML/CSS/JS simples;
- revisão rápida.

Recomendar Desktop ou Codespaces para:

- terminal;
- compilação;
- servidor local;
- bibliotecas;
- depuração;
- ambientes complexos.

Tutorial Desktop:

1. Baixar projeto.
2. Abrir Downloads.
3. Extrair ZIP.
4. Abrir VS Code.
5. Arquivo → Abrir Pasta.
6. Selecionar pasta.
7. Ler README.
8. Abrir terminal.
9. Executar comandos indicados.

Não prometer abrir automaticamente um caminho local desconhecido.

---

# 14. NÍVEIS DE INTEGRAÇÃO EXTERNA

## Nível 1 — Atalho e tutorial

Padrão inicial.

Inclui:

- download;
- exportação;
- botão de abertura;
- checklist;
- tutorial;
- confirmação manual;
- solução de problemas.

Não exige OAuth.

## Nível 2 — Integração autenticada

Somente quando houver:

- backend;
- OAuth;
- credenciais;
- autorização institucional;
- escopos mínimos;
- tratamento de dados;
- política de privacidade.

Pode incluir:

- seleção de turma;
- criação de atividade;
- consulta de dados;
- inclusão de links;
- leitura de status;
- operações autorizadas.

Não prometer acesso irrestrito a qualquer atividade.

## Nível 3 — Add-on ou integração avançada

Tratar como evolução futura.

Pode envolver:

- Google Cloud;
- OAuth;
- Google Workspace Marketplace;
- revisão;
- autorização administrativa;
- testes;
- backend;
- conformidade institucional.

---

# 15. PERFIS LOCAIS CRIPTOGRAFADOS

O sistema deve possuir um padrão reutilizável de perfil local protegido.

O aluno poderá:

- criar perfil;
- desbloquear com senha;
- continuar no mesmo computador;
- usar vários perfis;
- começar do zero;
- continuar sem salvar;
- exportar;
- importar;
- migrar;
- excluir do equipamento.

Não chamar apenas de cache.

Usar:

- Perfil local protegido;
- Progresso salvo neste dispositivo;
- Perfil criptografado;
- Backup do perfil;
- Migração do perfil.

---

# 16. CRIAÇÃO DO PERFIL

Opções iniciais:

- Criar meu perfil;
- Continuar sem salvar;
- Importar perfil;
- Ver perfis deste computador.

Solicitar:

- nome;
- turma, quando necessário;
- senha local;
- confirmação;
- apelido visual opcional.

Exibir aviso:

> Esta senha protege apenas seu perfil local. Não use a senha do Google, Classroom, e-mail ou GitHub.

A lista pública deve mostrar apenas o mínimo:

- primeiro nome e inicial;
- apelido;
- avatar;
- último acesso;
- data de expiração.

Não mostrar antes do desbloqueio:

- respostas;
- notas;
- progresso detalhado;
- arquivos;
- nome completo, quando houver modo de privacidade;
- dados de outras plataformas.

---

# 17. PROTEÇÃO DA SENHA E DOS DADOS

Nunca armazenar senha em texto puro.

Nunca usar somente:

- MD5;
- SHA-1;
- SHA-256 direto;
- comparação de string simples.

Usar:

- Argon2id, quando possível;
- PBKDF2 com HMAC-SHA-256 como alternativa nativa;
- salt aleatório e exclusivo;
- parâmetros versionados;
- AES-GCM de 256 bits;
- IV aleatório e exclusivo;
- criptografia autenticada;
- Web Crypto API;
- bibliotecas confiáveis.

Utilizar IndexedDB para os dados criptografados.

Evitar localStorage para:

- perfis;
- respostas;
- chaves;
- logs;
- arquivos;
- dados pessoais.

---

# 18. ARQUITETURA DE ENVELOPE CRIPTOGRÁFICO

Cada perfil deve possuir uma chave aleatória de dados.

Estrutura:

```text
Dados do perfil
      │
      ▼
Chave aleatória do perfil
      │
      ├── protegida pela senha do aluno
      │
      └── protegida pela recuperação do professor
```

Benefícios:

- a senha do aluno pode ser redefinida;
- o progresso não precisa ser recriado;
- a senha antiga nunca é revelada;
- a recuperação administrativa é separada;
- a chave de dados continua a mesma;
- os dados permanecem criptografados.

---

# 19. PERSISTÊNCIA DE 5 OU 6 DIAS

Configuração padrão:

- 6 dias desde o último acesso;
- possibilidade de configurar 5 dias;
- bloqueio por inatividade;
- exclusão após expiração.

Diferenciar:

## Bloqueio

O perfil continua salvo, mas exige senha novamente.

Pode ocorrer:

- após 5 ou 10 minutos;
- ao fechar;
- ao sair;
- ao trocar de perfil.

## Expiração

O perfil é removido após 5 ou 6 dias.

Mostrar avisos:

- expira em 2 dias;
- expira amanhã;
- faça backup;
- será removido deste computador.

Não prometer permanência absoluta.

O navegador pode apagar dados por:

- limpeza manual;
- política do equipamento;
- modo privado;
- falta de espaço;
- limpeza automática;
- reinstalação;
- troca de navegador.

Solicitar armazenamento persistente quando disponível.

---

# 20. SALVAMENTO AUTOMÁTICO

Salvar depois de:

- resposta concluída;
- etapa concluída;
- mudança de fase;
- alteração de preferência;
- exportação;
- conclusão;
- geração de evidência;
- atualização de progresso.

Feedback:

- Salvando…
- Progresso protegido neste dispositivo.
- Última gravação: horário.

Depois do bloqueio:

- remover chave da memória;
- remover dados descriptografados;
- manter apenas o envelope criptografado.

---

# 21. CONTEÚDO DO PERFIL

Estrutura comum:

- ID aleatório;
- versão;
- criação;
- atualização;
- expiração;
- identidade;
- turma;
- acessibilidade;
- preferências;
- progresso;
- fases;
- atividades;
- respostas;
- resultados;
- evidências;
- configurações;
- exportações;
- importações;
- migrações;
- alterações;
- auditoria;
- cadeia de integridade.

Separar:

```text
perfil
├── identidade
├── preferências
├── acessibilidade
├── histórico geral
├── migrações
└── plataformas
    ├── desafio-ds
    ├── diagnostico
    ├── modo-guiado
    └── outras
```

Uma plataforma não deve modificar dados privados de outra.

---

# 22. EXPORTAÇÃO DO PERFIL

Botão:

> Exportar backup do perfil

Gerar arquivo próprio, por exemplo:

```text
perfil-educacional-2026.edu-profile
```

Não incluir nome completo no nome externo.

O pacote deve ser criptografado e autenticado.

Pode conter:

- identidade;
- progresso;
- preferências;
- dados das plataformas;
- logs;
- histórico;
- versões;
- parâmetros criptográficos;
- integridade.

A parte não criptografada deve conter apenas:

- formato;
- versão;
- salt;
- parâmetros;
- IV;
- identificador;
- data;
- código de compatibilidade.

---

# 23. IMPORTAÇÃO E MIGRAÇÃO

Fluxo:

1. Selecionar arquivo.
2. Validar formato.
3. Validar tamanho.
4. Ler versão.
5. Solicitar senha.
6. Derivar chave.
7. Descriptografar.
8. Validar integridade.
9. Verificar compatibilidade.
10. Mostrar resumo.
11. Confirmar.
12. Importar.
13. Registrar migração.
14. Atualizar versão.

Mostrar antes da importação:

- nome;
- data;
- origem;
- progresso;
- versão;
- dados compatíveis;
- dados incompatíveis;
- conflitos.

---

# 24. HISTÓRICO DE EXPORTAÇÕES E MIGRAÇÕES

Registrar:

- ID;
- data;
- plataforma;
- versão;
- perfil;
- navegador aproximado;
- sistema operacional aproximado;
- hash do pacote;
- origem;
- destino;
- resultado;
- alterações de conversão.

Não prometer identificação perfeita do equipamento.

Não usar fingerprinting invasivo.

Diferenciar:

- exportação: arquivo criado;
- importação: arquivo aberto;
- migração: dados integrados em outro ambiente.

---

# 25. CONFLITOS E MESCLAGEM

Quando existir perfil igual:

- manter local;
- usar importado;
- criar cópia;
- mesclar;
- cancelar.

Nunca mesclar silenciosamente.

Regras:

- atividade concluída não volta para pendente;
- preferências recentes podem prevalecer;
- logs são preservados;
- duplicados usam IDs;
- respostas conflitantes são mostradas;
- não inventar progresso;
- não somar pontuação sem regra.

Registrar todas as decisões.

---

# 26. ALTERAÇÃO DE IDENTIDADE

O ID e a origem inicial devem ser imutáveis.

Quando o nome for alterado:

1. solicitar senha;
2. mostrar valor atual;
3. mostrar novo valor;
4. solicitar confirmação;
5. registrar motivo;
6. preservar valor anterior;
7. criar evento de alteração.

A recuperação de senha não deve alterar o nome.

Separar:

- redefinição de senha;
- correção de identidade;
- migração;
- mesclagem.

---

# 27. LOG DE AUDITORIA

Registrar eventos:

- criação;
- abertura;
- bloqueio;
- salvamento;
- atividade iniciada;
- atividade concluída;
- resultado exportado;
- perfil exportado;
- perfil importado;
- migração;
- preferência alterada;
- identidade alterada;
- conflito resolvido;
- perfil removido;
- erro de integridade;
- atualização de versão;
- recuperação administrativa.

Cada evento deve ter:

- ID;
- tipo;
- data;
- plataforma;
- versão;
- dados anteriores;
- dados posteriores;
- ID anterior;
- hash anterior;
- hash atual.

Usar cadeia de hashes para detectar:

- alterações;
- remoções;
- reordenação;
- inconsistências.

Não afirmar que o log é absolutamente imutável.

Usar termos:

- log com verificação de integridade;
- histórico protegido;
- alterações detectáveis;
- pacote autenticado.

---

# 28. RECUPERAÇÃO ADMINISTRATIVA PELO PROFESSOR

O professor deve conseguir redefinir a senha sem descobrir a senha antiga.

A operação correta é:

- Recuperação administrativa;
- Redefinir senha;
- Recuperar acesso.

Não usar:

- Mostrar senha;
- Descobrir senha antiga.

## 28.1. Modelo preferencial

Usar chave pública e chave privada.

### Chave pública

Pode estar na plataforma para proteger a chave do perfil.

Não abre os dados.

### Chave privada

Fica com o professor.

Deve ser:

- protegida pela senha mestre;
- armazenada em arquivo administrativo separado;
- mantida em local seguro;
- possuir backup;
- nunca ficar no perfil do aluno.

Para recuperar, exigir preferencialmente:

1. senha mestre do professor;
2. arquivo ou chave administrativa.

## 28.2. Modo simplificado

Pode existir quando o arquivo administrativo não for viável.

Requisitos:

- frase-senha forte;
- salt institucional;
- derivação lenta;
- atraso progressivo;
- proteção inferior explicitada;
- não embutir senha no código;
- não usar senha universal fixa.

---

# 29. FLUXO DE RECUPERAÇÃO

1. Aluno informa que esqueceu a senha.
2. Professor abre modo administrativo.
3. Seleciona perfil.
4. Confirma identidade.
5. Informa motivo.
6. Digita senha mestre.
7. Seleciona arquivo administrativo, quando configurado.
8. Sistema valida.
9. Sistema recupera somente a chave do perfil.
10. Aluno cria nova senha.
11. Sistema cria novo salt.
12. Sistema protege novamente a chave.
13. Testa a nova senha.
14. Registra evento.
15. Encerra modo administrativo.
16. Descarta chaves da memória.

A nova senha não deve:

- alterar ID;
- apagar progresso;
- alterar nome;
- remover logs;
- zerar fases;
- criar novo perfil silenciosamente.

---

# 30. MODO DO PROFESSOR

Criar área separada:

> Modo do professor

Acesso:

- menu administrativo;
- botão discreto;
- arquivo de recuperação;
- credencial administrativa.

Não usar atalho secreto como única segurança.

Campos:

- perfil;
- aluno;
- turma;
- motivo;
- senha mestre;
- arquivo de recuperação.

Após validação:

- autorização por poucos minutos;
- acesso somente ao perfil selecionado;
- acesso somente à operação necessária;
- nova autenticação para outro perfil;
- encerramento automático;
- limpeza da memória.

---

# 31. LOG DA RECUPERAÇÃO

Registrar:

- recuperação iniciada;
- senha redefinida;
- data;
- perfil;
- plataforma;
- motivo;
- resultado;
- progresso preservado;
- identidade alterada ou não;
- identificador administrativo.

Nunca registrar:

- senha antiga;
- senha nova;
- senha mestre;
- chave privada;
- chave derivada;
- conteúdo descriptografado.

Mostrar ao aluno:

> Senha redefinida com autorização administrativa.

---

# 32. CHAVES DE RECUPERAÇÃO

Permitir:

- chave do professor;
- chave institucional;
- chave da coordenação;
- chave emergencial.

Evitar compartilhar uma única senha entre todos.

Cada chave deve possuir:

- ID;
- versão;
- data;
- status;
- responsável;
- permissões.

Permitir rotação:

1. validar chave atual;
2. criar nova;
3. atualizar perfis;
4. registrar;
5. manter transição;
6. revogar antiga;
7. gerar backup.

---

# 33. PERDA DA CREDENCIAL DO PROFESSOR

Se o professor perder senha mestre e chave privada:

- não criar entrada secreta;
- não usar senha universal;
- não revelar perfis;
- não reconstruir chave;
- informar que a recuperação não está disponível.

Por isso, ao configurar:

- gerar backup;
- fornecer instruções;
- registrar ID;
- registrar data;
- orientar armazenamento separado.

---

# 34. COMPUTADORES COMPARTILHADOS

Requisitos:

- bloqueio automático;
- nome reduzido;
- respostas ocultas;
- senha não salva;
- botão “Sair e bloquear”;
- botão “Remover meu perfil”;
- descarte de dados descriptografados;
- sessão encerrada ao fechar;
- aviso para não abandonar o computador.

Ao finalizar:

- Sair e manter progresso;
- Exportar e sair;
- Remover deste computador;
- Continuar trabalhando.

---

# 35. EXCLUSÃO DO PERFIL

Solicitar:

- perfil;
- confirmação;
- aviso;
- senha ou confirmação adequada.

Opções:

- cancelar;
- exportar antes;
- excluir deste computador.

Não apagar perfis de outros alunos.

---

# 36. COMPROVANTE E EVIDÊNCIA

Ao final da atividade, gerar um comprovante contendo:

- atividade;
- data;
- resultado;
- arquivo;
- progresso;
- etapas confirmadas;
- link de repositório;
- Classroom aberto;
- status declarado;
- status confirmado por API, quando houver;
- problemas;
- orientações usadas.

Diferenciar claramente eventos internos, confirmações do aluno e confirmações externas.

---

# 37. PAINEL DO PROFESSOR

Permitir configurar:

- turma;
- disciplina;
- temas;
- títulos;
- prazos;
- instruções;
- resultado esperado;
- formato;
- Classroom;
- GitHub;
- VS Code;
- tutorial;
- checklist;
- comentário;
- nome do arquivo;
- repositório modelo;
- tempo de retenção;
- bloqueio;
- recuperação;
- chaves autorizadas;
- problemas comuns;
- orientação de recuperação.

Opções de tutorial:

- obrigatório;
- recomendado;
- opcional;
- checklist rápido;
- desativado.

---

# 38. COMPONENTES REUTILIZÁVEIS

Sugestões:

- DeliveryHub
- ExportResult
- QuickDeliveryChecklist
- GuidedDeliveryTutorial
- ClassroomDeliveryFlow
- ClassroomHelpCenter
- GitHubPublishingFlow
- VSCodeOpeningFlow
- DeliveryTroubleshooter
- StorageHelp
- TeacherIntegrationSettings
- DeliveryReceipt
- LocalProfileManager
- ProfileSelector
- ProfileCreator
- ProfileUnlock
- EncryptedProfileStore
- AutoSaveManager
- SessionLock
- ProfileExpiration
- ProfileExporter
- ProfileImporter
- ProfileMigration
- ProfileConflictResolver
- ProfileAuditLog
- ProfileIntegrityChecker
- SharedDevicePrivacy
- TeacherRecoveryMode
- RecoveryCredentialValidator
- ProfileKeyEnvelope
- StudentPasswordReset
- TeacherKeyManager
- TeacherKeyRotation
- RecoveryAuditLog
- RecoveryConsent
- RecoveryKeyBackup
- RecoveryKeyCompatibility

Adapte nomes à arquitetura atual.

---

# 39. VERSIONAMENTO

Todo perfil deve possuir:

- versão do formato;
- versão da criptografia;
- versão da derivação;
- versão do esquema;
- versão por plataforma.

Ao migrar:

1. validar;
2. criar cópia lógica;
3. migrar;
4. registrar;
5. validar resultado;
6. salvar.

Não destruir arquivo incompatível.

Mensagem:

> Este perfil foi criado em uma versão ainda não compatível.

---

# 40. TESTES OBRIGATÓRIOS

## Perfis

- criação;
- múltiplos perfis;
- senha correta;
- senha errada;
- salts distintos;
- bloqueio;
- reabertura;
- expiração;
- exclusão;
- salvamento automático;
- modo privado;
- falta de espaço;
- dados apagados;
- persistência negada.

## Exportação e migração

- exportação;
- importação;
- outro computador;
- outra plataforma;
- perfil duplicado;
- conflito;
- mesclagem;
- versão antiga;
- versão futura;
- arquivo corrompido;
- senha incorreta;
- integridade inválida.

## Recuperação

- credencial correta;
- senha mestre errada;
- arquivo errado;
- perfil incompatível;
- redefinição;
- progresso preservado;
- senha antiga deixa de funcionar;
- nova senha funciona;
- recuperação continua disponível;
- modo professor expira;
- outro perfil exige nova autenticação;
- rotação;
- revogação;
- múltiplos professores.

## Classroom

- link correto;
- link ausente;
- popup bloqueado;
- conta errada;
- falta de internet;
- arquivo inexistente;
- upload falha;
- armazenamento cheio;
- celular;
- computador;
- status manual;
- status por API.

## GitHub e VS Code

- ZIP;
- template;
- upload;
- link;
- vscode.dev;
- github.dev;
- Codespaces;
- Desktop;
- projeto sem terminal;
- projeto com terminal.

## UX e acessibilidade

- celular;
- desktop;
- teclado;
- leitor de tela;
- contraste;
- zoom de 100%;
- zoom aumentado;
- textos longos;
- idioma;
- animação reduzida.

---

# 41. LIMITAÇÕES QUE DEVEM SER INFORMADAS

Em uma aplicação totalmente front-end:

- o navegador controla a persistência;
- o aluno controla o arquivo exportado;
- não existe autoridade externa;
- logs não são absolutamente imutáveis;
- o sistema operacional informado é aproximado;
- o destino da exportação só é conhecido na importação;
- não há confirmação real de entrega sem API;
- a recuperação exige chave administrativa válida;
- perder todas as chaves pode tornar o perfil irrecuperável;
- não se deve prometer segurança absoluta.

Explique essas limitações sem assustar o aluno.

---


# 42. CRÉDITOS, SOBRE O PROJETO E HISTÓRICO DE VERSÕES

Todas as plataformas devem possuir uma área discreta e acessível denominada preferencialmente:

- Créditos;
- Sobre o projeto;
- Versões e atualizações.

Essa área pode ser apresentada como:

- aba no menu;
- item nas configurações;
- botão no rodapé;
- modal acessível;
- página “Sobre”.

Ela não deve ocupar espaço excessivo na tela principal nem interromper a atividade do aluno.

## 42.1. Crédito principal

Registrar de forma clara:

> Idealização, desenvolvimento pedagógico e coordenação do projeto: Professor Gabriel.

Explicar que as plataformas, laboratórios, atividades e ferramentas educacionais são desenvolvidos e refinados pelo professor Gabriel com apoio de inteligência artificial, por meio de planejamento pedagógico, criação de prompts, testes, revisão, ajustes, correções e novas versões.

Utilizar uma descrição semelhante:

> Este projeto educacional é idealizado e desenvolvido pelo professor Gabriel com apoio de ferramentas de inteligência artificial. As atividades, laboratórios e plataformas são criados e aperfeiçoados de forma contínua a partir do uso em sala de aula, da observação pedagógica, dos testes realizados e dos retornos dos estudantes e de outros professores. O objetivo principal é apoiar o aprendizado, facilitar o trabalho escolar e melhorar continuamente a experiência educacional.

Não apresentar a inteligência artificial como autora autônoma do projeto.

Diferenciar:

- autoria e direção pedagógica;
- colaboração humana;
- assistência técnica da inteligência artificial;
- implementação e refinamento iterativo.

## 42.2. Contexto educacional

Registrar que o desenvolvimento ocorre em contexto educacional e colaborativo com:

- estudantes do 1º ano de Desenvolvimento de Sistemas;
- estudantes do 2º ano de Desenvolvimento de Sistemas;
- estudantes do 3º ano de Desenvolvimento de Sistemas;
- estudantes do curso Técnico Subsequente noturno em Desenvolvimento de Sistemas;
- professores colaboradores;
- comunidade escolar do Colégio Alberto.

Utilizar preferencialmente crédito coletivo, sem expor nomes individuais:

> Desenvolvido em colaboração com estudantes do 1º, 2º e 3º anos do curso Técnico em Desenvolvimento de Sistemas e com estudantes do curso Técnico Subsequente noturno em Desenvolvimento de Sistemas do Colégio Alberto, além da contribuição de professores colaboradores.

Nomes individuais de estudantes somente podem ser exibidos quando:

- houver autorização;
- houver finalidade pedagógica clara;
- o professor decidir registrar a contribuição;
- não houver exposição indevida.

Por padrão, utilizar créditos por turma ou grupo.

## 42.3. Ciclo de desenvolvimento e aperfeiçoamento

Explicar resumidamente o processo:

1. O professor planeja a atividade ou ferramenta.
2. A plataforma é criada ou atualizada com apoio de inteligência artificial.
3. A atividade é publicada ou vinculada ao Google Classroom.
4. Os estudantes utilizam a ferramenta.
5. Dúvidas, dificuldades, erros e sugestões são observados.
6. Os estudantes podem fornecer retornos verbalmente ou pelo Classroom.
7. O professor registra os pontos relevantes.
8. Novos prompts são elaborados.
9. A ferramenta recebe ajustes, correções e melhorias.
10. Uma nova versão é disponibilizada.

Exibir uma descrição curta:

> As melhorias são realizadas de forma iterativa. Os retornos surgem durante o uso em sala, em comentários verbais, nas atividades do Google Classroom e em testes conduzidos pelo professor. Esses registros orientam novos prompts, correções e atualizações.

Não publicar comentários particulares, nomes de alunos ou dados pessoais no histórico público.

## 42.4. Objetivo do projeto

Manter o foco principal explícito:

> O objetivo central é melhorar o aprendizado.

Objetivos complementares:

- facilitar o trabalho do professor;
- apoiar a autonomia dos estudantes;
- tornar atividades mais acessíveis;
- melhorar a experiência de uso;
- criar recursos adequados à realidade escolar;
- reduzir dificuldades de entrega;
- oferecer orientação passo a passo;
- aproximar teoria e prática;
- aperfeiçoar continuamente as ferramentas.

Evitar apresentar a tecnologia como finalidade isolada.

## 42.5. Informações exibidas na área de créditos

A área deve poder mostrar:

- nome da plataforma;
- descrição curta;
- idealização;
- desenvolvimento pedagógico;
- coordenação;
- instituição;
- curso;
- turmas colaboradoras;
- professores colaboradores;
- assistência de inteligência artificial;
- ferramenta de IA utilizada;
- modelo de IA utilizado;
- modo de utilização;
- versão atual;
- total de versões registradas;
- total de atualizações registradas;
- data da criação;
- data da última atualização;
- situação do projeto;
- categorias de melhorias recentes;
- link ou botão para o histórico de versões;
- política de privacidade ou segurança, quando aplicável.

Exemplo:

```text
Idealização e desenvolvimento pedagógico
Professor Gabriel

Contexto
Curso Técnico em Desenvolvimento de Sistemas
Colégio Alberto

Colaboração
Estudantes do 1º, 2º e 3º DS
Estudantes do Técnico Subsequente noturno
Professores colaboradores

Assistência tecnológica
ChatGPT
Modelo: modelo realmente utilizado na atualização
Modo: modo realmente utilizado
Finalidade: apoio à análise, programação, revisão e refinamento

Versão atual
v2.8.1

Última atualização
29/07/2026
```

## 42.6. Registro do uso de inteligência artificial

Registrar somente informações verdadeiras e disponíveis.

Campos recomendados:

- ferramenta: ChatGPT;
- organização da ferramenta: OpenAI, quando apropriado;
- modelo utilizado;
- modo utilizado;
- finalidade;
- data da atualização;
- responsável pela validação humana.

Exemplo:

```text
Ferramenta de apoio: ChatGPT
Modelo: GPT-5.6 Thinking
Modo: raciocínio e desenvolvimento assistido
Uso: análise, criação de código, revisão, correções e documentação
Validação pedagógica e funcional: Professor Gabriel
```

O exemplo acima pode ser usado para este documento mestre, consolidado em 29/07/2026.

Nas demais plataformas:

- registrar o modelo realmente utilizado;
- não manter um nome de modelo incorreto após futuras atualizações;
- não inventar o modo de IA;
- permitir editar esses campos;
- registrar mais de uma ferramenta ou modelo quando necessário;
- informar “não registrado” quando o dado antigo não estiver disponível.

A área deve explicar:

> A inteligência artificial é utilizada como ferramenta de apoio. As decisões pedagógicas, os testes, a seleção das funcionalidades e a validação final são realizados pelo professor.

## 42.7. Versionamento

Implementar versionamento legível.

Padrão recomendado:

```text
MAJOR.MINOR.PATCH
```

Exemplo:

```text
2.7.4
```

Interpretação:

- MAJOR: mudança estrutural ou incompatível;
- MINOR: nova funcionalidade ou melhoria relevante;
- PATCH: correção, refinamento ou ajuste menor.

Também podem existir identificadores:

- alpha;
- beta;
- teste;
- piloto;
- estável.

Exemplos:

```text
v1.0.0-beta
v1.4.0
v2.0.0
v2.0.3
```

Não alterar a versão sem registrar a atualização.

## 42.8. Contadores de evolução

A plataforma pode mostrar:

- versão atual;
- quantidade de versões registradas;
- quantidade de atualizações;
- quantidade de correções;
- quantidade de melhorias;
- quantidade de ciclos de testes.

Esses números devem ser calculados com dados reais.

Fontes possíveis:

- arquivo CHANGELOG;
- Git;
- GitHub Releases;
- metadados da plataforma;
- histórico interno de versões;
- registros fornecidos pelo professor.

Não inventar números.

Quando a plataforma já tiver passado por muitas atualizações, mas não existir histórico completo, utilizar:

> Projeto desenvolvido de forma contínua em diversas versões. Histórico detalhado registrado a partir da versão atual.

Nesse caso:

- não atribuir um número falso às versões anteriores;
- iniciar o controle formal na versão atual;
- registrar que houve desenvolvimento anterior não numerado;
- permitir adicionar versões históricas posteriormente.

## 42.9. Histórico resumido de alterações

Criar um changelog acessível, mas enxuto.

Cada versão deve registrar:

- número;
- data;
- título curto;
- resumo;
- categorias alteradas;
- responsável pela validação;
- modelo de IA utilizado, quando conhecido.

Categorias recomendadas:

- interface;
- experiência do usuário;
- responsividade;
- acessibilidade;
- conteúdo;
- atividade pedagógica;
- lógica;
- código;
- desempenho;
- segurança;
- perfil local;
- criptografia;
- Classroom;
- GitHub;
- VS Code;
- exportação;
- importação;
- migração;
- recuperação administrativa;
- correção de bugs.

Exemplo:

```text
v2.8.1 — 29/07/2026

- Corrigidos problemas de sobreposição de textos.
- Melhorada a responsividade no celular e no computador.
- Adicionado tutorial progressivo de entrega no Classroom.
- Aperfeiçoada a exportação dos resultados.
- Incluído perfil local criptografado com recuperação administrativa.
```

Evitar descrições excessivamente técnicas para o aluno.

## 42.10. Histórico público e histórico técnico

Separar dois níveis.

### Histórico público

Pode mostrar:

- melhorias de interface;
- novas atividades;
- acessibilidade;
- responsividade;
- integrações;
- correções gerais;
- melhorias de desempenho;
- mudanças pedagógicas resumidas.

### Histórico técnico ou administrativo

Pode incluir:

- arquivos modificados;
- migrações;
- mudanças de esquema;
- dependências;
- testes;
- detalhes internos;
- identificadores de commits;
- correções específicas.

O histórico técnico deve ficar disponível somente quando necessário.

## 42.11. Segurança no changelog

Não publicar detalhes que facilitem exploração de falhas.

Evitar:

- descrever vulnerabilidade ainda não corrigida;
- mostrar chaves;
- mostrar tokens;
- mostrar caminhos sensíveis;
- revelar credenciais;
- expor arquitetura secreta;
- publicar dados de alunos;
- reproduzir comentários particulares.

Em correções de segurança, utilizar descrição resumida:

> Reforçada a proteção dos perfis locais.

Em vez de:

> Era possível alterar o campo específico utilizando determinado procedimento.

## 42.12. Feedback dos estudantes

Registrar que os estudantes contribuem por meio de:

- comentários verbais;
- testes em sala;
- dificuldades observadas;
- sugestões;
- comentários no Google Classroom;
- devolutivas sobre usabilidade;
- identificação de bugs;
- propostas de melhoria.

Não transformar automaticamente todo comentário em requisito.

O professor deve:

1. analisar;
2. validar;
3. priorizar;
4. adaptar pedagogicamente;
5. registrar;
6. solicitar atualização;
7. testar novamente.

A área de créditos pode mostrar:

> Agradecimento aos estudantes que testam as atividades e contribuem com sugestões, relatos de dificuldades e identificação de melhorias.

## 42.13. Participação de outros professores

Permitir registrar colaboração de professores em:

- revisão de conteúdo;
- testes;
- interdisciplinaridade;
- acessibilidade;
- sugestões pedagógicas;
- organização institucional;
- validação de atividades.

Por padrão:

> Com a colaboração de professores da comunidade escolar.

Nomes individuais somente quando o professor desejar e houver concordância.

## 42.14. Dados configuráveis

Criar uma configuração semelhante:

```json
{
  "credits": {
    "projectTitle": "",
    "shortDescription": "",
    "lead": {
      "name": "Professor Gabriel",
      "roles": [
        "Idealização",
        "Desenvolvimento pedagógico",
        "Coordenação",
        "Validação"
      ]
    },
    "institution": "Colégio Alberto",
    "program": "Técnico em Desenvolvimento de Sistemas",
    "collaborators": {
      "studentGroups": [
        "1º DS",
        "2º DS",
        "3º DS",
        "Técnico Subsequente noturno em Desenvolvimento de Sistemas"
      ],
      "teachers": "Professores colaboradores"
    },
    "aiAssistance": {
      "tool": "ChatGPT",
      "provider": "OpenAI",
      "model": "",
      "mode": "",
      "purpose": [
        "Análise",
        "Programação",
        "Revisão",
        "Correção",
        "Documentação"
      ],
      "humanValidation": "Professor Gabriel"
    },
    "version": {
      "current": "",
      "status": "",
      "createdAt": "",
      "updatedAt": "",
      "registeredVersions": 0,
      "registeredUpdates": 0
    }
  }
}
```

Não deixar dados de exemplo falsos em produção.

## 42.15. Estrutura do changelog

Criar estrutura compatível com:

```json
{
  "version": "2.8.1",
  "date": "2026-07-29",
  "title": "Integrações e perfis locais",
  "summary": "Melhorias na entrega, continuidade e recuperação de acesso.",
  "categories": [
    "Classroom",
    "Perfil local",
    "Segurança",
    "Responsividade"
  ],
  "changes": [
    "Adicionado tutorial progressivo de entrega.",
    "Adicionada persistência local criptografada.",
    "Adicionada recuperação administrativa.",
    "Corrigidos problemas de layout."
  ],
  "ai": {
    "tool": "ChatGPT",
    "model": "GPT-5.6 Thinking",
    "mode": "Raciocínio e desenvolvimento assistido"
  },
  "validatedBy": "Professor Gabriel"
}
```

O modelo acima é ilustrativo. Atualizar conforme a ferramenta realmente utilizada em cada versão.

## 42.16. Local da aba

A aba de créditos deve estar disponível em todas as plataformas.

Sugestões:

- menu lateral;
- configurações;
- rodapé;
- tela inicial;
- menu “Ajuda e informações”.

No celular:

- utilizar modal ou página dedicada;
- evitar texto excessivo;
- organizar por acordeões.

Seções sugeridas:

1. Sobre.
2. Créditos.
3. Colaboração.
4. Inteligência artificial.
5. Versão atual.
6. Histórico de atualizações.
7. Objetivo educacional.

## 42.17. Versão compacta no rodapé

Exibir de forma discreta:

```text
Idealização e desenvolvimento pedagógico: Professor Gabriel
Versão 2.8.1 · Atualizado em 29/07/2026
```

Opcionalmente:

```text
Desenvolvido com apoio de IA e colaboração dos estudantes.
```

O rodapé não precisa apresentar o histórico completo.

## 42.18. Texto institucional recomendado

Utilizar como base:

> Esta plataforma educacional foi idealizada e é desenvolvida pelo professor Gabriel com apoio de inteligência artificial. Seu desenvolvimento acontece de forma contínua, a partir do planejamento pedagógico, da aplicação das atividades, dos testes em sala de aula e dos retornos dos estudantes e de professores colaboradores. Participam desse processo estudantes do 1º, 2º e 3º anos do curso Técnico em Desenvolvimento de Sistemas e estudantes do curso Técnico Subsequente noturno em Desenvolvimento de Sistemas do Colégio Alberto. O objetivo principal é melhorar o aprendizado e criar ferramentas que facilitem o trabalho escolar, ampliem a autonomia e tornem as atividades mais acessíveis, práticas e significativas.

## 42.19. Texto curto recomendado

> Idealização e desenvolvimento pedagógico: Professor Gabriel. Projeto aperfeiçoado com apoio de inteligência artificial e colaboração de estudantes e professores do Colégio Alberto.

## 42.20. Requisitos de implementação

Criar componentes reutilizáveis, como:

- CreditsPage;
- AboutProject;
- ProjectCredits;
- CollaborationCredits;
- AIAssistanceInfo;
- VersionBadge;
- VersionHistory;
- ChangelogViewer;
- UpdateSummary;
- CreditsFooter;
- CreditsSettings;
- SchoolScheduleProvider;
- CurrentPeriodDetector;
- ClassPeriodBadge;
- RemainingClassTime;
- ScheduleNotification;
- BreakNotification;
- OutsideShiftMessage;
- EndOfClassReminder;
- SchoolScheduleSettings;
- CareerHub;
- OpportunityRadar;
- OpportunityCard;
- OpportunityFilters;
- PublicExamCard;
- InternshipCard;
- CareerPathExplorer;
- SkillsCareerMap;
- OpportunityVerifier;
- CareerPreparationChecklist;
- TeacherOpportunityPanel;
- ToolDiscoveryBanner;
- EducationalPromoCard;
- CrossPlatformRecommendation;
- ToolCatalog;
- ToolRecommendationEngine;
- RecommendationFrequencyManager;
- RecommendationSnooze;
- RelatedTools;
- TeacherToolCatalogManager.

Integrar com o sistema de versionamento da plataforma.

Quando houver Git:

- obter versão de tag ou release;
- obter data de compilação;
- obter commit curto, quando apropriado;
- não expor repositório privado.

Quando não houver Git:

- utilizar arquivo de metadados versionado;
- manter CHANGELOG;
- atualizar manualmente de forma controlada.

## 42.21. Testes da área de créditos

Testar:

- visualização no celular;
- visualização no computador;
- textos longos;
- acordeões;
- contraste;
- leitor de tela;
- navegação por teclado;
- versão sem histórico;
- versão com várias atualizações;
- dados antigos sem modelo de IA registrado;
- ausência de nomes individuais;
- histórico público;
- histórico técnico;
- data correta;
- número correto;
- atualização automática;
- privacidade.

## 42.22. Regra principal dos créditos

A área de créditos deve reconhecer:

- a idealização do professor Gabriel;
- a direção pedagógica;
- o desenvolvimento iterativo;
- a colaboração dos estudantes;
- a contribuição de professores;
- o apoio da inteligência artificial;
- a validação humana;
- o objetivo educacional.

Ela não deve:

- retirar o protagonismo do professor;
- apresentar a IA como autora exclusiva;
- expor estudantes;
- inventar versões;
- inventar modelos;
- inventar correções;
- publicar dados particulares;
- revelar detalhes perigosos de segurança.



# 43. CONSCIÊNCIA DO HORÁRIO ESCOLAR E IDENTIFICAÇÃO DA AULA ATUAL

Todas as plataformas devem possuir um módulo reutilizável e configurável de consciência do horário escolar.

Esse módulo deve utilizar:

- data e horário atuais;
- fuso horário institucional;
- turno da turma;
- dias letivos configurados;
- grade de horários;
- disciplina ou atividade atual, quando conhecida;
- prazo da atividade;
- estado do perfil;
- estado do salvamento;
- tempo restante da aula.

O objetivo não é vigiar o aluno nem bloquear o uso fora do horário.

O objetivo é:

- situar o aluno;
- ajudá-lo a administrar o tempo;
- lembrar de salvar;
- lembrar de exportar;
- lembrar de entregar;
- reduzir perdas de progresso;
- incentivar o estudo além do horário escolar;
- adaptar mensagens ao contexto real de uso.

## 43.1. Fuso horário institucional

Utilizar como padrão:

```text
America/Sao_Paulo
```

Não depender exclusivamente do relógio ou fuso configurado no aparelho.

Quando houver diferença relevante entre o horário do dispositivo e o horário institucional:

- não bloquear a atividade;
- utilizar preferencialmente o horário institucional;
- mostrar aviso curto;
- permitir que o aluno continue;
- registrar apenas a diferença necessária para diagnóstico técnico.

Exemplo:

> O horário deste aparelho parece diferente do horário da escola. Vou usar o horário escolar para orientar esta atividade.

Não coletar localização precisa.

## 43.2. Grade padrão do período da manhã

O período da manhã atende principalmente:

- 1º DS;
- 2º DS;
- 3º DS;
- outras turmas matutinas configuradas.

Grade padrão:

| Período | Início | Término | Duração |
|---|---:|---:|---:|
| 1ª aula | 07:30 | 08:20 | 50 minutos |
| 2ª aula | 08:20 | 09:10 | 50 minutos |
| 3ª aula | 09:10 | 10:00 | 50 minutos |
| Intervalo | 10:00 | 10:20 | 20 minutos |
| 4ª aula | 10:20 | 11:10 | 50 minutos |
| 5ª aula | 11:10 | 12:00 | 50 minutos |
| 6ª aula | 12:00 | 12:50 | 50 minutos |

Representação estruturada sugerida:

```json
{
  "morning": {
    "label": "Período da manhã",
    "timezone": "America/Sao_Paulo",
    "periods": [
      { "type": "class", "number": 1, "start": "07:30", "end": "08:20" },
      { "type": "class", "number": 2, "start": "08:20", "end": "09:10" },
      { "type": "class", "number": 3, "start": "09:10", "end": "10:00" },
      { "type": "break", "label": "Intervalo", "start": "10:00", "end": "10:20" },
      { "type": "class", "number": 4, "start": "10:20", "end": "11:10" },
      { "type": "class", "number": 5, "start": "11:10", "end": "12:00" },
      { "type": "class", "number": 6, "start": "12:00", "end": "12:50" }
    ]
  }
}
```

## 43.3. Grade padrão do período da noite

O período da noite atende principalmente:

- curso Técnico Subsequente noturno em Desenvolvimento de Sistemas;
- turmas noturnas configuradas.

Grade padrão:

| Período | Início | Término | Duração |
|---|---:|---:|---:|
| 1ª aula | 18:50 | 19:30 | 40 minutos |
| 2ª aula | 19:30 | 20:15 | 45 minutos |
| 3ª aula | 20:15 | 21:00 | 45 minutos |
| Intervalo | 21:00 | 21:15 | 15 minutos |
| 4ª aula | 21:15 | 22:00 | 45 minutos |
| 5ª aula | 22:00 | 22:40 | 40 minutos |

Não presumir que todas as aulas noturnas possuem 50 minutos.

Utilizar os horários reais configurados.

Representação estruturada sugerida:

```json
{
  "night": {
    "label": "Período da noite",
    "timezone": "America/Sao_Paulo",
    "periods": [
      { "type": "class", "number": 1, "start": "18:50", "end": "19:30" },
      { "type": "class", "number": 2, "start": "19:30", "end": "20:15" },
      { "type": "class", "number": 3, "start": "20:15", "end": "21:00" },
      { "type": "break", "label": "Intervalo", "start": "21:00", "end": "21:15" },
      { "type": "class", "number": 4, "start": "21:15", "end": "22:00" },
      { "type": "class", "number": 5, "start": "22:00", "end": "22:40" }
    ]
  }
}
```

## 43.4. Configuração por turma

Não determinar o turno apenas pelo nome digitado livremente.

Associar cada turma a uma configuração estruturada.

Padrão recomendado:

```json
{
  "classes": {
    "1ds": {
      "label": "1º DS",
      "shift": "morning"
    },
    "2ds": {
      "label": "2º DS",
      "shift": "morning"
    },
    "3ds": {
      "label": "3º DS",
      "shift": "morning"
    },
    "subsequente-noturno": {
      "label": "Técnico Subsequente noturno em Desenvolvimento de Sistemas",
      "shift": "night"
    }
  }
}
```

Permitir que o professor configure outras turmas e turnos.

Quando o perfil não tiver turma definida:

- não adivinhar;
- utilizar somente a informação de horário geral;
- oferecer seleção da turma;
- permitir continuar sem selecionar.

## 43.5. Identificação do período atual

O sistema deve identificar um dos estados:

- antes do início do turno;
- durante uma aula;
- durante o intervalo;
- entre períodos;
- depois do fim do turno;
- fora do turno da turma;
- fora de um dia letivo;
- horário não identificado;
- relógio inconsistente.

Exemplo interno:

```json
{
  "state": "class",
  "shift": "morning",
  "periodNumber": 4,
  "start": "10:20",
  "end": "11:10",
  "remainingMinutes": 33
}
```

Atualizar o cálculo de forma leve, sem recarregar a página.

Não executar processamento contínuo desnecessário.

## 43.6. Notificação da aula atual

Quando o aluno estiver dentro do turno correspondente à turma, mostrar uma notificação curta.

Exemplos:

> Você está na 1ª aula. Organize-se para concluir esta etapa.

> Agora é a 4ª aula. Restam aproximadamente 33 minutos.

> Você está na última aula. Salve e prepare sua entrega.

A notificação deve:

- aparecer de forma discreta;
- não bloquear a atividade;
- poder ser fechada;
- não repetir constantemente;
- adaptar-se ao tempo restante;
- utilizar linguagem acolhedora;
- evitar tom de vigilância.

Não utilizar frases como:

- “Estamos monitorando você.”
- “Você deveria estar em aula.”
- “Seu comportamento foi registrado.”

Preferir:

- “Pelo horário escolar, você está na 3ª aula.”
- “Parece que esta é sua aula atual.”
- “Use o tempo restante para concluir e salvar.”

## 43.7. Contagem regressiva contextual

Mostrar o tempo restante somente quando isso ajudar.

Formatos possíveis:

- Restam 35 minutos.
- Aproximadamente 15 minutos para o fim da aula.
- Últimos 5 minutos.
- A aula termina às 11:10.

Evitar cronômetro grande e ansioso.

Não atualizar o texto a cada segundo.

Preferir atualização:

- a cada minuto;
- em marcos importantes;
- ao trocar de etapa;
- ao retornar à página.

Marcos sugeridos:

- início da aula;
- 30 minutos restantes;
- 20 minutos restantes;
- 15 minutos restantes;
- 10 minutos restantes;
- 5 minutos restantes;
- 2 minutos restantes;
- fim da aula.

Permitir que o professor ajuste esses marcos.

## 43.8. Alertas de salvamento e entrega

As notificações devem considerar:

- progresso salvo ou não;
- existência de perfil local;
- exportação pendente;
- resultado ainda não gerado;
- Classroom ainda não aberto;
- prazo;
- tempo restante.

Exemplos:

### Mais de 20 minutos restantes

> Você ainda tem tempo. Continue com calma.

### Entre 10 e 20 minutos

> Restam cerca de 15 minutos. Confira o que ainda falta.

### Entre 5 e 10 minutos

> A aula está terminando. Salve seu progresso e prepare o resultado.

### Menos de 5 minutos

> Últimos minutos: salve, exporte e confira a entrega.

### Resultado pronto, mas não exportado

> Seu resultado está pronto. Baixe o arquivo antes de sair.

### Arquivo exportado, Classroom não aberto

> Arquivo salvo. Agora abra a atividade no Classroom.

### Perfil temporário

> Você está sem perfil salvo. Exporte o resultado antes de fechar.

Não afirmar que a atividade está entregue sem confirmação.

## 43.9. Intervalo

Durante o intervalo, mostrar mensagem breve e não invasiva.

Exemplos:

> Agora é o intervalo. Seu progresso está salvo.

> Intervalo de 20 minutos. Você pode continuar ou fazer uma pausa.

> Intervalo. Ao voltar, continue da etapa em que parou.

No período noturno:

> Intervalo de 15 minutos. Seu progresso permanece protegido.

Não pressionar o aluno a continuar durante o intervalo.

Quando o perfil estiver desbloqueado em computador compartilhado:

> Vai sair do computador? Use “Sair e bloquear”.

O sistema pode sugerir bloqueio automático durante o intervalo.

## 43.10. Mudança de aula

Ao detectar mudança entre períodos:

- atualizar o indicador;
- evitar modal;
- mostrar aviso curto;
- preservar a etapa atual;
- salvar automaticamente;
- registrar somente o evento técnico necessário.

Exemplo:

> A 3ª aula terminou. Seu progresso foi salvo.

Depois:

> Início da 4ª aula. Continue quando estiver pronto.

Não zerar cronômetros internos da atividade, salvo quando a atividade tiver regra específica.

## 43.11. Última aula do turno

Dar atenção especial à última aula.

Manhã:

- 6ª aula;
- termina às 12:50.

Noite:

- 5ª aula;
- termina às 22:40.

Exemplos:

> Você está na última aula da manhã. Reserve alguns minutos para entregar.

> Última aula da noite. Confira o arquivo e o Classroom antes de encerrar.

> Restam 10 minutos do turno. Salve e finalize o que for possível.

Não bloquear o aluno depois do horário.

## 43.12. Uso fora do horário da turma

Quando um aluno utilizar a plataforma fora do turno configurado, não tratar isso como erro.

Mensagem principal recomendada:

> Você está estudando fora do horário da sua turma. Muito bom continuar praticando!

Mensagem complementar, somente quando necessária:

> Apenas confira o prazo da atividade e faça a entrega no local indicado pelo professor.

Outras mensagens curtas:

> Bom estudo! Aproveite para revisar com calma.

> Estudar além do horário ajuda no aperfeiçoamento. Continue avançando.

> Você está fora do horário regular, mas pode continuar normalmente.

Não mostrar elogios repetitivos em todas as aberturas.

Utilizar frequência controlada.

## 43.13. Uso antes do turno

Exemplos:

> Sua turma começa às 07:30. Você pode adiantar a atividade.

> A aula noturna começa às 18:50. Aproveite para revisar as instruções.

Não impedir o acesso.

## 43.14. Uso depois do turno

Exemplos:

> O turno já terminou. Seu progresso continua disponível.

> A aula acabou, mas você pode continuar. Confira apenas o prazo de entrega.

> Antes de fechar, salve ou exporte seu resultado.

No período noturno, evitar mensagens que incentivem permanência excessiva.

Não utilizar técnicas de engajamento que pressionem o estudante a continuar tarde da noite.

## 43.15. Finais de semana, feriados e dias não letivos

Quando não houver aula configurada:

> Hoje não há aula regular configurada. Você pode continuar estudando normalmente.

> Estudo extra detectado. Confira apenas os prazos das atividades.

A lista de dias letivos, recessos e feriados deve ser configurável.

Não presumir automaticamente que todo sábado ou domingo nunca terá atividade.

## 43.16. Recomendações de estudo complementar

Quando o aluno estiver fora do horário e desejar estudar mais, a plataforma pode oferecer recursos relacionados ao conteúdo atual.

Exemplos de categorias:

- documentação oficial da linguagem;
- documentação da ferramenta;
- Curso em Vídeo;
- materiais publicados pelo professor;
- repositórios de exemplo;
- exercícios complementares;
- vídeos ou leituras selecionados;
- Google Classroom;
- GitHub;
- MDN para conteúdos web;
- documentação oficial de Python, Java, C, C++, C# ou outras linguagens;
- materiais institucionais.

Essas recomendações devem:

- estar relacionadas à atividade;
- ser configuradas pelo professor;
- abrir somente quando solicitadas;
- não aparecer como propaganda;
- priorizar fontes educacionais confiáveis;
- utilizar links válidos;
- distinguir material oficial de material complementar.

Não apresentar uma lista grande automaticamente.

Botão sugerido:

> Continuar estudando

Ao abrir:

- 1 recurso principal;
- até 3 recursos adicionais;
- breve descrição;
- nível indicado;
- relação com a atividade.

## 43.17. Mensagens curtas e progressivas

As notificações devem ter preferencialmente:

- uma frase principal;
- no máximo uma frase complementar;
- uma ação principal;
- uma ação secundária opcional.

Exemplo:

```text
Você está na 4ª aula.
Restam cerca de 30 minutos.

[Continuar] [Ver planejamento]
```

Evitar:

- parágrafos longos;
- várias instruções simultâneas;
- excesso de ícones;
- modais frequentes;
- alertas sonoros;
- animações contínuas;
- cores agressivas.

## 43.18. Tipos de notificação

Utilizar níveis:

### Informativa

- aula atual;
- início do turno;
- intervalo;
- estudo fora do horário.

### Atenção

- aula terminando;
- progresso ainda não salvo;
- arquivo ainda não exportado;
- prazo próximo.

### Importante

- sessão temporária;
- risco de perda;
- armazenamento local indisponível;
- arquivo necessário ainda não gerado.

### Confirmação

- progresso salvo;
- resultado exportado;
- perfil bloqueado;
- comprovante criado.

Não utilizar “erro” quando houver apenas orientação.

## 43.19. Controle de frequência

Evitar poluição.

Regras sugeridas:

- mostrar identificação da aula uma vez por sessão;
- atualizar silenciosamente o indicador;
- mostrar aviso de 15 minutos apenas uma vez;
- mostrar aviso de 5 minutos apenas uma vez;
- não repetir elogio fora do horário na mesma sessão;
- não reabrir notificação fechada;
- permitir silenciar lembretes não essenciais;
- manter alertas críticos disponíveis.

Salvar preferências no perfil local:

- mostrar lembretes de horário;
- reduzir notificações;
- mostrar tempo restante;
- silenciar mensagens motivacionais;
- manter somente alertas de salvamento.

## 43.20. Indicador compacto permanente

Pode existir um chip discreto:

```text
4ª aula · termina 11:10
```

ou:

```text
Fora do horário da turma
```

ou:

```text
Intervalo · volta 10:20
```

Ao tocar ou clicar, abrir detalhes:

- turno;
- aula atual;
- horário de início;
- horário de fim;
- tempo restante;
- próxima aula;
- lembretes de entrega.

## 43.21. Integração com o perfil local

O módulo deve utilizar a turma salva no perfil.

Ao criar o perfil:

- solicitar turma;
- associar turno;
- permitir correção;
- registrar alteração;
- não mudar silenciosamente.

Quando o aluno importar perfil:

- preservar turma;
- verificar se a plataforma conhece a turma;
- solicitar confirmação em caso de incompatibilidade.

As preferências de notificações devem migrar com o perfil.

## 43.22. Integração com a atividade

Quando a atividade possuir horário específico, usar a informação mais precisa.

Prioridade:

1. horário específico da atividade;
2. horário da disciplina;
3. horário geral da turma;
4. turno do perfil;
5. apenas horário institucional.

Exemplo:

Mesmo durante a 4ª aula geral, se a atividade estiver configurada para a 5ª aula, mostrar:

> Esta atividade está prevista para a 5ª aula. Você pode adiantar normalmente.

Não bloquear.

## 43.23. Integração com prazo e Classroom

O horário da aula não substitui o prazo da atividade.

Diferenciar:

- fim da aula;
- fim do turno;
- prazo do Classroom;
- tempo mínimo da atividade;
- expiração do perfil.

Exemplo:

> A aula termina em 10 minutos, mas o prazo da atividade é amanhã às 23:59.

ou:

> A aula está terminando e o prazo também é hoje. Priorize salvar e entregar.

Não inventar prazo.

Quando não houver prazo configurado:

> Confira o prazo diretamente no Google Classroom.

## 43.24. Tempo mínimo de participação

Quando a plataforma possuir tempo mínimo:

- não confundir com duração da aula;
- mostrar ambos separadamente;
- respeitar as regras da atividade;
- considerar autorização antecipada do professor, quando existente;
- não impedir salvamento ou exportação;
- explicar claramente o que falta.

Exemplo:

```text
Aula atual: restam 18 minutos
Participação na atividade: 22 de 25 minutos
```

Quando o horário escolar terminar antes do tempo mínimo:

- preservar progresso;
- permitir exportação de evidência parcial;
- oferecer retomada;
- permitir liberação registrada pelo professor, quando a plataforma possuir esse recurso.

## 43.25. Privacidade

O módulo não deve:

- rastrear localização;
- fotografar o aluno;
- acessar câmera;
- acessar microfone;
- inferir presença física;
- afirmar que o aluno está dentro da escola;
- registrar comportamento disciplinar;
- enviar alertas externos sem autorização;
- criar ranking por horário de acesso.

Utilizar linguagem:

> Pelo horário configurado da sua turma...

Não utilizar:

> Detectamos que você está na escola...

## 43.26. Ausência de internet

O cálculo de aula atual deve funcionar localmente.

Quando offline:

- usar o horário institucional e a grade já salva;
- mostrar que o prazo do Classroom pode estar desatualizado;
- permitir continuar;
- salvar localmente;
- orientar sincronização ou entrega quando a internet voltar.

Mensagem:

> Você está sem internet. O horário da aula continua disponível, mas confira o prazo no Classroom quando reconectar.

## 43.27. Relógio incorreto

Detectar inconsistências quando houver uma referência confiável disponível.

Não impedir a atividade.

Exemplo:

> O relógio deste aparelho pode estar incorreto. Os lembretes de horário podem não ser precisos.

Permitir:

- continuar;
- ocultar aviso;
- ajustar manualmente o turno;
- usar horário institucional obtido quando conectado.

## 43.28. Configuração do professor

Criar painel para:

- definir fuso;
- editar horários;
- criar turnos;
- associar turmas;
- definir dias letivos;
- cadastrar recessos;
- configurar horários especiais;
- alterar duração;
- configurar marcos de alerta;
- ativar ou desativar contagem;
- escolher mensagens;
- definir recomendações;
- associar disciplinas;
- associar atividades;
- configurar prazos;
- testar uma simulação de horário.

Permitir exceções:

- aula reduzida;
- conselho de classe;
- evento escolar;
- semana de prova;
- reposição;
- sábado letivo;
- mudança temporária;
- horário especial.

## 43.29. Estrutura de dados sugerida

```json
{
  "schoolSchedule": {
    "timezone": "America/Sao_Paulo",
    "shifts": {},
    "classes": {},
    "schoolDays": [],
    "exceptions": [],
    "notificationRules": {
      "showCurrentPeriod": true,
      "showRemainingTime": true,
      "milestones": [30, 20, 15, 10, 5, 2],
      "showBreakNotice": true,
      "showOutsideShiftEncouragement": true,
      "repeatOutsideShiftMessage": false
    }
  }
}
```

## 43.30. Componentes sugeridos

Criar componentes reutilizáveis:

- SchoolScheduleProvider;
- CurrentPeriodDetector;
- ClassPeriodBadge;
- RemainingClassTime;
- ScheduleNotification;
- BreakNotification;
- OutsideShiftMessage;
- EndOfClassReminder;
- SaveBeforeLeavingReminder;
- SchoolScheduleSettings;
- ScheduleExceptionManager;
- StudyResourceSuggestions;
- SchedulePreferenceSettings;
- SchoolClockStatus.

Adaptar os nomes à arquitetura existente.

## 43.31. Testes obrigatórios

Testar:

- 07:29;
- 07:30;
- 08:19;
- 08:20;
- 09:59;
- 10:00;
- 10:19;
- 10:20;
- 12:49;
- 12:50;
- 18:49;
- 18:50;
- 19:29;
- 19:30;
- 20:14;
- 20:15;
- 20:59;
- 21:00;
- 21:14;
- 21:15;
- 21:59;
- 22:00;
- 22:39;
- 22:40;
- aluno matutino usando à noite;
- aluno noturno usando pela manhã;
- fim de semana;
- feriado;
- horário especial;
- relógio incorreto;
- perfil sem turma;
- perfil importado;
- uso offline;
- última aula;
- intervalo;
- aviso fechado;
- preferência de silêncio;
- mudança de minuto;
- mudança de aula;
- prazo diferente do fim da aula;
- atividade com tempo mínimo.

## 43.32. Regra principal do módulo de horário

A plataforma deve ajudar o aluno a compreender o tempo disponível sem pressioná-lo.

Ela deve:

- informar;
- orientar;
- lembrar;
- salvar;
- incentivar;
- respeitar o turno;
- permitir estudo fora do horário;
- preservar o progresso.

Ela não deve:

- vigiar;
- punir;
- bloquear;
- envergonhar;
- gerar ansiedade;
- confundir fim da aula com prazo;
- repetir notificações;
- incentivar permanência excessiva à noite.



# 44. CARREIRAS, ESTÁGIOS, EMPREGOS E CONCURSOS EM TECNOLOGIA

Antes de criar esse módulo, verifique se a plataforma já possui:

- área de carreiras;
- informações sobre profissões;
- oportunidades;
- vagas;
- estágios;
- aprendizagem;
- concursos;
- portfólio;
- currículo;
- trilhas profissionais;
- indicação de áreas tecnológicas.

Quando já existir, aperfeiçoe e integre o conteúdo em vez de criar uma segunda área duplicada.

Todas as plataformas compatíveis devem poder oferecer uma área opcional denominada preferencialmente:

- Carreiras e oportunidades;
- Tecnologia e mercado de trabalho;
- Onde posso trabalhar?;
- Oportunidades na região;
- Meu futuro em tecnologia.

A área não deve desviar o aluno da atividade atual.

Ela deve:

- mostrar inicialmente apenas uma orientação curta;
- abrir detalhes somente quando solicitado;
- relacionar a atividade atual a competências profissionais;
- utilizar informações verificadas;
- informar a data da consulta;
- diferenciar vaga aberta, prevista, encerrada e não confirmada;
- priorizar fontes oficiais;
- evitar promessas de contratação;
- não afirmar que o diploma garante automaticamente o preenchimento de todos os requisitos.

## 44.1. Objetivo educacional

O módulo deve ajudar o aluno a compreender que o curso Técnico em Desenvolvimento de Sistemas não prepara somente para uma única função.

A formação pode contribuir para atividades relacionadas a:

- desenvolvimento de sistemas;
- programação;
- desenvolvimento web;
- desenvolvimento front-end;
- desenvolvimento back-end;
- desenvolvimento full-stack;
- desenvolvimento mobile;
- testes de software;
- qualidade de software;
- análise de requisitos;
- documentação;
- manutenção de sistemas;
- implantação;
- suporte técnico;
- help desk;
- service desk;
- manutenção de computadores;
- hardware;
- software;
- redes;
- infraestrutura;
- banco de dados;
- análise de dados;
- Business Intelligence;
- automação;
- segurança da informação;
- computação em nuvem;
- sistemas empresariais;
- atendimento ao usuário;
- treinamento de usuários;
- geoprocessamento, quando houver formação complementar;
- empreendedorismo;
- prestação de serviços;
- trabalho autônomo;
- concursos públicos;
- estágios;
- aprendizagem profissional;
- continuidade de estudos.

Não afirmar que o estudante está automaticamente habilitado para toda vaga citada.

Cada oportunidade possui requisitos próprios.

## 44.2. Importância do curso Técnico em Desenvolvimento de Sistemas

Apresentar uma explicação curta e positiva:

> O curso Técnico em Desenvolvimento de Sistemas desenvolve competências que podem ser utilizadas em empresas privadas, órgãos públicos, instituições de ensino, comércio, indústria, logística, saúde, turismo, serviços, portos e diferentes organizações que dependem de tecnologia. Além de programar, o profissional pode participar de testes, implantação, documentação, manutenção, suporte e melhoria de sistemas.

Explicação ampliada opcional:

> Praticamente todos os setores utilizam sistemas, computadores, redes, bancos de dados e serviços digitais. Por isso, os conhecimentos do curso podem ser aplicados em empresas especializadas em tecnologia e também em departamentos internos de organizações de outras áreas.

Deixar claro que:

- algumas vagas exigem apenas ensino médio;
- algumas exigem formação técnica específica;
- algumas aceitam cursos equivalentes;
- algumas exigem ensino superior;
- algumas exigem experiência;
- algumas exigem certificações;
- algumas exigem registro profissional;
- algumas aceitam estudantes para estágio ou aprendizagem;
- os requisitos precisam ser conferidos individualmente.

## 44.3. Regiões prioritárias

Priorizar oportunidades em:

### Litoral do Paraná

- Paranaguá;
- Matinhos;
- Pontal do Paraná;
- Guaratuba;
- Antonina;
- Morretes;
- Guaraqueçaba;
- cidades próximas e demais municípios do litoral.

### Curitiba e Região Metropolitana

- Curitiba;
- São José dos Pinhais;
- Pinhais;
- Colombo;
- Araucária;
- Fazenda Rio Grande;
- Campo Largo;
- Campina Grande do Sul;
- Quatro Barras;
- outras cidades configuradas.

### Outras modalidades

- trabalho remoto;
- trabalho híbrido;
- oportunidades estaduais;
- oportunidades nacionais compatíveis com trabalho remoto;
- concursos estaduais e federais com prova ou lotação acessível;
- programas de estágio e aprendizagem.

Permitir que o professor altere a ordem e acrescente cidades.

## 44.4. Tipos de oportunidade

Criar filtros para:

- estágio;
- estágio técnico;
- estágio de nível médio;
- estágio de nível superior;
- jovem aprendiz;
- aprendizagem profissional;
- primeiro emprego;
- vaga efetiva;
- temporário;
- contrato;
- prestação de serviços;
- freelancer;
- trabalho autônomo;
- trainee;
- banco de talentos;
- voluntariado tecnológico;
- projeto de inovação;
- hackathon;
- iniciação científica;
- incubadora;
- coworking;
- concurso público;
- processo seletivo público;
- cadastro de reserva;
- emprego público;
- oportunidade de capacitação.

## 44.5. Áreas profissionais

Permitir filtros por área:

### Desenvolvimento

- programação;
- front-end;
- back-end;
- full-stack;
- mobile;
- desktop;
- APIs;
- integração de sistemas;
- manutenção de software;
- sistemas web;
- jogos digitais.

### Qualidade e análise

- testes;
- QA;
- automação de testes;
- análise de requisitos;
- análise de sistemas;
- documentação;
- suporte à implantação;
- levantamento de processos.

### Suporte e infraestrutura

- suporte técnico;
- help desk;
- service desk;
- field service;
- manutenção de computadores;
- montagem;
- hardware;
- instalação de software;
- atendimento remoto;
- administração de usuários;
- redes;
- cabeamento;
- switches;
- roteadores;
- servidores;
- infraestrutura;
- telecomunicações.

### Dados e gestão

- banco de dados;
- SQL;
- relatórios;
- Business Intelligence;
- análise de dados;
- ERP;
- sistemas empresariais;
- automação de processos;
- planilhas;
- indicadores.

### Segurança e nuvem

- segurança da informação;
- monitoramento;
- controle de acesso;
- backups;
- proteção de dados;
- computação em nuvem;
- administração de serviços;
- continuidade de negócios.

### Design e experiência

- web design;
- UX;
- UI;
- acessibilidade;
- prototipação;
- conteúdo digital;
- multimídia;
- edição web.

### Setor público e serviços locais

- técnico em informática;
- manutenção de computadores;
- analista de sistemas;
- técnico de suporte;
- agente de tecnologia;
- operador de sistemas;
- técnico de redes;
- técnico administrativo com informática;
- áreas correlatas descritas em editais.

## 44.6. Setores econômicos e institucionais

Explicar que profissionais de tecnologia podem atuar em:

- empresas de software;
- consultorias;
- escolas;
- universidades;
- órgãos municipais;
- órgãos estaduais;
- órgãos federais;
- câmaras municipais;
- hospitais;
- clínicas;
- laboratórios;
- comércio;
- supermercados;
- hotéis;
- turismo;
- restaurantes;
- indústrias;
- empresas portuárias;
- terminais;
- logística;
- transporte;
- telecomunicações;
- provedores de internet;
- escritórios;
- bancos;
- cooperativas;
- startups;
- hubs de inovação;
- terceiro setor;
- pequenas empresas;
- trabalho autônomo.

Apresentar esses setores como possibilidades gerais, não como garantia de vaga aberta.

## 44.7. Fontes prioritárias

Ao pesquisar oportunidades, utilizar preferencialmente:

### Fontes públicas e oficiais

- páginas de concursos das prefeituras;
- câmaras municipais;
- Diário Oficial;
- Governo do Estado do Paraná;
- Central de Estágio do Governo do Paraná;
- Agência do Trabalhador/SINE Paraná;
- portais de concursos das instituições;
- Fundação FAFIPA;
- NC-UFPR;
- Instituto AOCP;
- universidades e institutos públicos;
- empresas públicas;
- portais federais;
- páginas oficiais das bancas;
- páginas oficiais dos órgãos contratantes.

### Estágio e aprendizagem

- CIEE/PR;
- Central de Estágio do Paraná;
- IEL Paraná;
- instituições de ensino;
- páginas oficiais das empresas;
- programas de aprendizagem;
- agências de estágio reconhecidas.

### Iniciativa privada

- página “Trabalhe conosco” da empresa;
- Gupy;
- LinkedIn;
- Indeed;
- Vagas.com;
- InfoJobs;
- Trabalha Brasil;
- Glassdoor;
- bancos de talentos;
- portais regionais;
- Agência do Trabalhador.

Agregadores devem ser utilizados como ponto de descoberta.

Antes de apresentar a oportunidade como confirmada:

- procurar a página original;
- conferir a empresa;
- conferir a data;
- conferir o prazo;
- conferir a cidade;
- conferir os requisitos;
- conferir se a candidatura ainda existe.

## 44.8. Hierarquia de confiabilidade

Classificar a fonte:

### Nível A — Oficial

- edital;
- diário oficial;
- prefeitura;
- câmara;
- governo;
- banca organizadora;
- página oficial da empresa;
- plataforma oficial de candidatura.

### Nível B — Institucional

- CIEE;
- IEL;
- Central de Estágio;
- Agência do Trabalhador;
- instituição de ensino;
- entidade parceira reconhecida.

### Nível C — Agregador

- portal de vagas;
- site de concursos;
- mecanismo de busca.

### Nível D — Não confirmado

- postagem sem edital;
- rede social sem link oficial;
- mensagem encaminhada;
- captura de tela;
- informação verbal;
- página sem identificação.

Não apresentar fonte de nível D como oportunidade confirmada.

## 44.9. Pesquisa atualizada obrigatória

Vagas e concursos mudam rapidamente.

Antes de mostrar oportunidades atuais, pesquisar novamente na internet.

Registrar:

- data da consulta;
- horário da consulta;
- fonte;
- cidade;
- situação;
- prazo;
- última confirmação.

Exemplo:

```text
Consultado em: 29/07/2026
Situação: inscrições abertas
Fonte: edital oficial e banca organizadora
```

Não reutilizar indefinidamente uma lista antiga.

## 44.10. Estados das oportunidades

Utilizar estados padronizados:

- inscrições abertas;
- candidatura aberta;
- previsto;
- edital publicado;
- em andamento;
- cadastro de reserva;
- resultado publicado;
- convocação;
- encerrado;
- suspenso;
- cancelado;
- removido;
- prazo não localizado;
- aguardando confirmação;
- informação histórica.

Usar cores e ícones acessíveis, sem depender apenas da cor.

## 44.11. Validade e expiração

Cada oportunidade deve possuir:

- `publishedAt`;
- `checkedAt`;
- `deadline`;
- `status`;
- `sourceType`;
- `sourceName`;
- `officialSourceAvailable`.

Regras:

- depois do prazo, mover para “Encerradas”;
- não manter card de “aberta” sem revalidação;
- destacar quando a informação estiver desatualizada;
- permitir que o professor arquive;
- permitir nova verificação;
- manter histórico quando houver valor pedagógico.

Mensagem:

> Esta oportunidade pode ter mudado. Confira a fonte oficial antes de se inscrever.

## 44.12. Exemplo local verificado na consolidação do prompt

Na data de 29/07/2026, foi verificado o seguinte exemplo:

```text
Órgão: Prefeitura do Município de Matinhos – PR
Edital: 107/2026
Cargo: Técnico em Informática/Manutenção de Computadores
Escolaridade: ensino médio técnico em Informática ou equivalente
Carga horária: 40 horas semanais
Vagas imediatas: 1
Vencimento inicial indicado no edital: R$ 2.138,60
Inscrições indicadas: 28/07/2026 a 27/08/2026
Prova objetiva indicada: 27/09/2026
Fonte principal: edital oficial organizado pela Fundação FAFIPA
```

Esse registro serve como exemplo real da relação entre formação técnica e oportunidade pública regional.

Regras obrigatórias:

- tratar como recorte datado;
- verificar novamente antes de exibir como aberto;
- não manter o card ativo depois do prazo;
- conferir retificações;
- conferir requisitos completos;
- conferir atribuições;
- conferir conteúdo programático;
- conferir taxa;
- conferir comunicados da banca;
- não afirmar automaticamente que todo diploma de Desenvolvimento de Sistemas será aceito como equivalente;
- orientar o candidato a consultar a banca quando houver dúvida sobre equivalência.

## 44.13. Análise de compatibilidade da formação

Cada card pode mostrar:

- relação forte;
- relação parcial;
- formação complementar necessária;
- requisito não confirmado;
- não compatível.

Exemplo:

```text
Relação com Desenvolvimento de Sistemas: parcial/forte
Motivo: a vaga envolve informática, manutenção, software, redes e segurança.
Atenção: o edital exige Técnico em Informática ou equivalente. Confirme se o diploma é aceito.
```

Nunca usar apenas palavras semelhantes para concluir equivalência.

Ler:

- requisito;
- atribuições;
- conteúdo programático;
- legislação;
- retificações;
- perguntas frequentes da banca.

## 44.14. Estrutura do card de oportunidade

Mostrar inicialmente:

- cargo ou título;
- organização;
- cidade;
- tipo;
- modalidade;
- escolaridade;
- prazo;
- estado;
- data da verificação;
- botão “Ver fonte oficial”.

Ao expandir:

- resumo;
- atribuições;
- requisitos;
- remuneração ou bolsa, quando publicada;
- carga horária;
- quantidade de vagas;
- benefícios, quando publicados;
- etapas;
- documentos;
- relação com o curso;
- competências relacionadas;
- observações;
- fonte;
- aviso de conferência.

## 44.15. Filtros

Permitir filtrar por:

- cidade;
- distância;
- litoral;
- Curitiba e região;
- remoto;
- público;
- privado;
- estágio;
- aprendizagem;
- concurso;
- nível médio;
- nível técnico;
- nível superior;
- sem experiência;
- área;
- prazo;
- presencial;
- híbrido;
- remoto;
- aberto;
- previsto;
- encerrado;
- compatibilidade com a formação.

Não usar localização precisa sem autorização.

A distância pode ser configurada manualmente pela cidade.

## 44.16. Busca de vagas privadas

Ao buscar iniciativa privada, combinar termos:

- estágio TI;
- estágio desenvolvimento;
- suporte técnico;
- técnico de informática;
- help desk;
- service desk;
- manutenção de computadores;
- redes;
- infraestrutura;
- desenvolvedor júnior;
- front-end;
- back-end;
- full-stack;
- programação;
- QA;
- banco de dados;
- analista de sistemas;
- jovem aprendiz tecnologia;
- assistente de TI;
- field service;
- suporte N1;
- suporte N2;
- implantação;
- ERP;
- telecomunicações.

Combinar com:

- Paranaguá;
- Matinhos;
- Pontal do Paraná;
- Guaratuba;
- Antonina;
- Morretes;
- Curitiba;
- Região Metropolitana;
- remoto.

## 44.17. Busca de concursos públicos

Pesquisar por:

- técnico em informática;
- técnico de tecnologia da informação;
- técnico em manutenção de computadores;
- analista de sistemas;
- analista de tecnologia da informação;
- técnico de suporte;
- técnico de redes;
- técnico administrativo;
- agente de tecnologia;
- programador;
- desenvolvedor;
- operador de sistemas;
- segurança da informação;
- banco de dados;
- geoprocessamento;
- informática;
- tecnologia;
- sistemas;
- redes;
- hardware;
- software.

Pesquisar em:

- prefeituras;
- câmaras;
- autarquias;
- universidades;
- institutos;
- empresas públicas;
- órgãos estaduais;
- órgãos federais;
- forças armadas em seleções técnicas, quando aplicável;
- conselhos profissionais;
- fundações;
- hospitais públicos;
- empresas portuárias públicas.

## 44.18. Estágios

Explicar:

> O estágio permite aplicar o conteúdo do curso em ambiente profissional, aprender processos, desenvolver comunicação, construir experiência e conhecer diferentes áreas.

Verificar sempre:

- nível de ensino aceito;
- semestre ou período;
- idade mínima;
- matrícula ativa;
- jornada;
- bolsa;
- auxílio-transporte;
- cidade;
- modalidade;
- atividades;
- prazo;
- documentação;
- compatibilidade com o horário escolar.

Não apresentar informação jurídica como definitiva sem consultar a regra atual e a instituição responsável.

## 44.19. Jovem aprendiz

Mostrar como possibilidade de entrada profissional.

Explicar de maneira breve:

- pode envolver atividades administrativas ou tecnológicas;
- nem toda vaga será especificamente de programação;
- experiência em informática pode ser diferencial;
- conferir idade, jornada e requisitos;
- priorizar programas oficiais e empresas identificadas.

Não prometer que toda vaga de aprendizagem terá relação direta com Desenvolvimento de Sistemas.

## 44.20. Trabalho remoto

Criar filtro específico.

Orientar o aluno a observar:

- equipamento;
- internet;
- horário;
- tipo de contrato;
- comunicação;
- segurança;
- origem da empresa;
- descrição das atividades;
- processo seletivo;
- possíveis golpes.

Não recomendar oportunidade que:

- cobre pagamento para candidatura;
- solicite senha;
- solicite token;
- solicite acesso remoto antes de contratação;
- prometa ganho irreal;
- exija compra obrigatória sem transparência;
- utilize domínio suspeito;
- peça documentos sensíveis por canal inadequado.

## 44.21. Prevenção contra golpes

Exibir alerta:

> Empresas sérias não precisam da sua senha do e-mail, Google, banco, GitHub ou Classroom.

Sinais de risco:

- cobrança para participar da seleção;
- promessa de contratação garantida;
- salário muito alto sem descrição;
- contato somente por perfil desconhecido;
- pedido de PIX;
- pedido de código de verificação;
- instalação de aplicativo de acesso remoto;
- arquivos executáveis suspeitos;
- falta de identificação da empresa;
- pressão para enviar documentos imediatamente.

Botão:

> Como verificar uma oportunidade?

Tutorial:

1. Confira o domínio.
2. Procure a página oficial.
3. Verifique a empresa.
4. Leia a descrição.
5. Não envie senhas.
6. Não pague para se candidatar.
7. Peça ajuda ao professor ou responsável em caso de dúvida.

## 44.22. Relação com a atividade atual

No final de uma atividade, a plataforma pode mostrar uma conexão curta:

### Exemplo de front-end

> O que você praticou hoje aparece em vagas de desenvolvimento web, front-end, suporte a sites e manutenção de sistemas.

### Exemplo de redes

> Este conteúdo se relaciona a suporte técnico, redes, infraestrutura e manutenção.

### Exemplo de banco de dados

> SQL e modelagem aparecem em desenvolvimento, relatórios, ERP, análise de dados e administração de sistemas.

### Exemplo de testes

> Testar, registrar falhas e documentar resultados são competências usadas em QA e suporte.

Mostrar no máximo uma conexão principal e permitir “Ver carreiras relacionadas”.

## 44.23. Mapa de competências

Criar correspondências configuráveis:

```json
{
  "skills": {
    "html": ["Front-end", "Web design", "Manutenção de sites"],
    "css": ["Front-end", "UI", "Responsividade"],
    "javascript": ["Front-end", "Full-stack", "Automação web"],
    "python": ["Desenvolvimento", "Automação", "Dados", "Testes"],
    "sql": ["Banco de dados", "ERP", "Dados", "Back-end"],
    "git": ["Desenvolvimento", "Controle de versão", "Colaboração"],
    "hardware": ["Suporte", "Manutenção", "Field service"],
    "networks": ["Redes", "Infraestrutura", "Suporte"],
    "testing": ["QA", "Testes", "Suporte", "Documentação"]
  }
}
```

Não transformar esse mapa em certificação automática.

## 44.24. Trilhas profissionais

Permitir que o aluno explore trilhas:

- desenvolvimento web;
- desenvolvimento mobile;
- suporte técnico;
- manutenção e hardware;
- redes e infraestrutura;
- banco de dados;
- dados e BI;
- testes e qualidade;
- segurança;
- setor público;
- empreendedorismo;
- continuidade acadêmica.

Cada trilha pode mostrar:

- o que faz;
- competências;
- atividades da plataforma relacionadas;
- ferramentas;
- exemplos de cargos;
- próximos estudos;
- portfólio sugerido;
- oportunidades atuais;
- cursos de continuidade.

## 44.25. Preparação para vagas

Criar checklist opcional:

- currículo atualizado;
- e-mail profissional;
- telefone correto;
- cidade;
- disponibilidade;
- formação;
- experiências;
- projetos;
- GitHub;
- portfólio;
- certificados;
- documentação;
- leitura da vaga;
- candidatura;
- acompanhamento.

Não armazenar documentos pessoais sem necessidade.

Não solicitar:

- CPF;
- RG;
- endereço completo;
- dados bancários;
- documentos sensíveis;

a menos que exista uma integração institucional segura e finalidade clara.

## 44.26. Currículo

Oferecer orientação:

- objetivo;
- formação;
- competências;
- projetos;
- ferramentas;
- atividades;
- experiências;
- cursos;
- contato.

Para estudante sem experiência, valorizar:

- projetos escolares;
- atividades práticas;
- participação em laboratórios;
- GitHub;
- trabalhos em equipe;
- resolução de problemas;
- documentação;
- apresentações;
- atendimento;
- projetos pessoais.

Não inventar experiência.

## 44.27. Portfólio e GitHub

Relacionar o módulo ao GitHub.

O aluno pode transformar atividades autorizadas em portfólio.

Orientar:

- remover dados pessoais;
- não publicar respostas proibidas;
- não publicar avaliações sigilosas;
- não publicar tokens;
- escrever README;
- explicar objetivo;
- listar tecnologias;
- inserir imagens;
- informar aprendizados;
- manter commits;
- respeitar regras do professor.

Botões possíveis:

- Preparar para portfólio;
- Criar README;
- Abrir GitHub;
- Conferir segurança;
- Copiar link.

## 44.28. Preparação para concurso

Quando houver edital:

1. Baixar edital oficial.
2. Conferir cargo.
3. Conferir formação.
4. Conferir equivalência.
5. Conferir prazo.
6. Conferir taxa e isenção.
7. Conferir conteúdo programático.
8. Conferir prova.
9. Conferir documentos.
10. Acompanhar retificações.

Criar resumo sem substituir o edital.

Exibir:

> O edital oficial é a referência principal. Este resumo serve apenas como orientação.

## 44.29. Conteúdo programático e plano de estudos

Quando um concurso tiver conteúdo de tecnologia:

- extrair os temas;
- relacionar com conteúdos do curso;
- marcar conteúdos já estudados;
- marcar conteúdos que precisam de revisão;
- criar plano opcional;
- não garantir aprovação;
- citar o edital;
- registrar versão do edital.

Exemplo de categorias:

- arquitetura de computadores;
- engenharia de software;
- desenvolvimento;
- linguagens;
- redes;
- segurança;
- sistemas operacionais;
- manutenção;
- banco de dados;
- legislação;
- português;
- matemática;
- conhecimentos gerais.

## 44.30. Oportunidades locais de inovação

Além de vagas, mostrar opcionalmente:

- hubs;
- laboratórios;
- coworkings;
- eventos;
- feiras;
- hackathons;
- cursos;
- comunidades;
- palestras;
- incubadoras;
- projetos de extensão;
- atividades de empreendedorismo.

Exemplo regional verificado na consolidação:

> Paranaguá passou a contar em 2026 com o Hub de Inovação e Empreendedorismo do Litoral Casa Dacheux, com proposta de formação, conexão com setores produtivos, coworking, espaço maker e laboratório de informática.

Esse tipo de informação deve ser atualizado e apresentado como oportunidade de aprendizagem e conexão, não como vaga de emprego.

## 44.31. Interface enxuta

Na tela inicial, mostrar no máximo:

```text
Carreiras relacionadas
O conteúdo desta atividade aparece em suporte técnico, desenvolvimento e testes.

[Ver áreas] [Ver oportunidades]
```

A página completa pode conter:

- oportunidades;
- trilhas;
- mapa regional;
- concursos;
- estágios;
- currículo;
- portfólio;
- segurança.

Usar acordeões, filtros e abas.

## 44.32. Notificações

Não exibir vagas em pop-ups repetitivos.

Pode mostrar:

- nova oportunidade relevante;
- prazo próximo;
- concurso regional confirmado;
- estágio compatível;
- vaga salva perto do encerramento.

Regras:

- notificações opcionais;
- frequência limitada;
- possibilidade de silenciar;
- não criar ansiedade;
- não interromper avaliação;
- não mostrar propaganda;
- não recomendar vaga incompatível de forma insistente.

## 44.33. Favoritos

Permitir salvar localmente:

- vaga;
- concurso;
- trilha;
- recurso;
- prazo;
- observação.

Salvar no perfil criptografado.

Não enviar candidatura automaticamente.

Não salvar credenciais externas.

## 44.34. Histórico de oportunidades

Registrar:

- oportunidade visualizada;
- favoritada;
- removida;
- marcada como encerrada;
- fonte aberta;
- checklist iniciado;
- plano criado.

Esse histórico é pessoal e deve ficar criptografado.

Não utilizar para avaliar nota ou comportamento.

## 44.35. Atualização automática

Uma aplicação totalmente front-end fechada não consegue garantir monitoramento contínuo sozinha.

Possibilidades:

### Sem backend

- botão “Atualizar oportunidades”;
- consulta quando a plataforma abrir;
- lista configurada pelo professor;
- importação de arquivo de oportunidades;
- links de busca;
- data da última verificação.

### Com backend ou serviço autorizado

- consulta periódica;
- normalização;
- deduplicação;
- alertas;
- cache;
- expiração;
- painel do professor;
- histórico.

Não fingir atualização em tempo real.

## 44.36. Importação de oportunidades pelo professor

Permitir arquivo JSON ou CSV com:

- título;
- organização;
- cidade;
- tipo;
- área;
- requisitos;
- prazo;
- situação;
- fonte;
- link;
- data da verificação;
- observações;
- compatibilidade;
- tags.

Validar o arquivo.

Não executar conteúdo importado.

## 44.37. Estrutura de dados sugerida

```json
{
  "opportunities": [
    {
      "id": "uuid",
      "title": "",
      "organization": "",
      "city": "",
      "state": "PR",
      "region": "Litoral do Paraná",
      "type": "concurso",
      "sector": "public",
      "area": ["Suporte", "Hardware", "Redes"],
      "educationLevel": ["Técnico"],
      "requiredCourse": "",
      "equivalenceRequiresConfirmation": true,
      "workMode": "presencial",
      "openings": null,
      "compensation": null,
      "workload": null,
      "publishedAt": "",
      "deadline": "",
      "checkedAt": "",
      "status": "aguardando confirmação",
      "source": {
        "name": "",
        "type": "official",
        "url": ""
      },
      "courseRelation": {
        "level": "partial",
        "explanation": ""
      },
      "tags": [],
      "isHistoricalExample": false
    }
  ]
}
```

## 44.38. Painel do professor

Permitir:

- ativar ou desativar o módulo;
- selecionar cidades;
- selecionar fontes;
- adicionar oportunidades;
- revisar resultados;
- aprovar cards;
- corrigir dados;
- marcar encerrada;
- importar;
- exportar;
- cadastrar trilhas;
- relacionar competências;
- configurar mensagens;
- definir frequência;
- selecionar oportunidades em destaque;
- adicionar materiais de preparação.

## 44.39. Componentes sugeridos

- CareerHub;
- OpportunityRadar;
- OpportunityCard;
- OpportunityFilters;
- RegionalOpportunityMap;
- PublicExamCard;
- InternshipCard;
- ApprenticeshipCard;
- CareerPathExplorer;
- SkillsCareerMap;
- CourseRelevance;
- OpportunitySourceBadge;
- OpportunityFreshness;
- OpportunityVerifier;
- OpportunityBookmarks;
- CareerPreparationChecklist;
- ResumeGuide;
- PortfolioGuide;
- GitHubPortfolioFlow;
- PublicExamStudyPlan;
- ScamPrevention;
- TeacherOpportunityPanel;
- OpportunityImportExport.

## 44.40. Testes obrigatórios

Testar:

- vaga oficial;
- vaga de agregador;
- vaga sem prazo;
- vaga vencida;
- concurso retificado;
- concurso suspenso;
- vaga removida;
- cidade sem resultado;
- trabalho remoto;
- resultado duplicado;
- formação não compatível;
- equivalência incerta;
- salário ausente;
- salário informado;
- estágio;
- aprendizagem;
- nível médio;
- nível técnico;
- nível superior;
- perfil sem cidade;
- consulta offline;
- fonte indisponível;
- link quebrado;
- oportunidade suspeita;
- dados importados;
- favoritos;
- notificações;
- celular;
- computador;
- leitor de tela;
- filtros;
- data da última consulta.

## 44.41. Transparência

Exibir:

> As oportunidades mudam rapidamente. Sempre confirme prazo, requisitos e candidatura na fonte oficial.

Diferenciar:

- informação verificada;
- informação encontrada;
- informação prevista;
- informação histórica;
- recomendação educacional;
- inferência de compatibilidade.

## 44.42. Regra principal do módulo profissional

O módulo deve:

- ampliar a visão do aluno;
- conectar estudo e prática;
- mostrar oportunidades reais;
- valorizar o curso;
- incentivar preparação;
- orientar com segurança;
- priorizar fontes oficiais;
- respeitar a privacidade;
- manter informações atualizadas.

Ele não deve:

- garantir emprego;
- garantir estágio;
- garantir aprovação;
- afirmar equivalência sem confirmação;
- publicar vaga vencida como aberta;
- substituir edital;
- coletar documentos desnecessários;
- cobrar candidatura;
- favorecer empresa sem critério;
- exibir propaganda disfarçada;
- pressionar o aluno;
- inventar oportunidades.



# 45. DIVULGAÇÃO CRUZADA DAS PLATAFORMAS E FERRAMENTAS EDUCACIONAIS

Antes de implementar, verifique se a plataforma já possui:

- seção “Outras ferramentas”;
- catálogo de plataformas;
- cards de recomendação;
- menu de laboratórios;
- central de recursos;
- links para projetos relacionados;
- notificações institucionais;
- área de novidades.

Quando já existir algo semelhante, aperfeiçoe e integre o novo padrão em vez de criar outro sistema duplicado.

Todas as plataformas compatíveis devem poder apresentar, de forma ocasional e não invasiva, pequenas recomendações sobre outras ferramentas educacionais desenvolvidas no ecossistema do professor Gabriel.

Esse recurso deve ser tratado como:

- divulgação interna;
- descoberta de ferramentas;
- recomendação educacional;
- indicação de recurso relacionado;
- novidade da plataforma.

Não tratar como publicidade comercial.

Não exibir anúncios de terceiros.

Não utilizar rastreamento publicitário.

## 45.1. Objetivo

O módulo deve ajudar o aluno a descobrir que existem outras ferramentas disponíveis, como:

- Lab Virtual DS;
- Desafio DS;
- Desafio de Informática;
- Diagnóstico Edu;
- Modo Guiado;
- aulas guiadas;
- desafios progressivos;
- laboratórios virtuais;
- simuladores;
- emuladores;
- testes;
- atividades adaptadas;
- plataforma de recuperação adaptada;
- CTF e desafios de cibersegurança;
- ferramentas específicas de programação;
- ferramentas de hardware e redes;
- outros projetos configurados pelo professor.

A lista deve ser configurável.

Não presumir que todos esses projetos estarão publicados ou acessíveis em todas as versões.

Não mostrar como disponível uma plataforma cujo link ainda não esteja configurado ou validado.

## 45.2. Formato visual

Apresentar como card, toast, banner discreto ou modal pequeno.

Exemplo:

```text
Você sabia?

No Lab Virtual DS você encontra simuladores, ferramentas e atividades de várias áreas da tecnologia.

[Conhecer] [Agora não] [Não mostrar por 30 minutos]
```

Outro exemplo:

```text
Explore outro desafio

O Desafio DS reúne fases, áreas da tecnologia e atividades práticas.

[Ver ferramenta] [Fechar]
```

O conteúdo deve ser curto.

Preferir:

- título de até 5 palavras;
- descrição de uma ou duas frases;
- uma ação principal;
- uma ação secundária;
- botão de fechar.

Evitar:

- textos longos;
- carrosséis automáticos;
- som;
- tela cheia;
- animações repetitivas;
- contagem regressiva;
- bloqueio da atividade;
- linguagem comercial exagerada.

## 45.3. Comportamento fechável

Todo anúncio interno deve possuir:

- botão fechar;
- opção “Agora não”;
- opção “Não mostrar novamente por 30 minutos”;
- ação principal para abrir ou conhecer;
- foco de teclado correto;
- suporte a leitor de tela.

Quando o aluno fechar:

- remover imediatamente;
- não reabrir na mesma tela;
- respeitar o período escolhido;
- registrar apenas a preferência necessária.

Não utilizar padrões enganosos.

O botão de fechar deve ser visível e acessível.

## 45.4. Frequência para perfil persistente

Quando o aluno estiver usando perfil local criptografado:

- registrar quais recomendações já foram vistas;
- registrar a última exibição;
- registrar fechamento;
- registrar clique;
- registrar silenciamento temporário;
- evitar repetir a mesma recomendação antes de 3 dias;
- permitir nova exibição depois de 3 dias;
- alternar entre ferramentas;
- respeitar preferências do aluno.

Regra padrão:

```text
Mesma recomendação:
no máximo uma vez a cada 3 dias por perfil.
```

Uma recomendação diferente pode aparecer antes, mas a frequência geral também deve ser limitada.

Regra geral sugerida:

```text
No máximo uma recomendação por sessão.
No máximo duas recomendações em um período de 24 horas por perfil.
```

O professor deve poder ajustar esses valores.

## 45.5. Silenciamento por 30 minutos

Ao selecionar:

> Não mostrar por 30 minutos

Registrar no perfil criptografado:

- horário do início;
- horário final;
- escopo do silenciamento;
- plataforma atual.

Durante esse período:

- não mostrar nenhuma recomendação promocional;
- manter alertas críticos de salvamento, prazo e segurança;
- não confundir silenciamento de divulgação com silenciamento de avisos importantes.

Quando o aluno estiver sem perfil persistente, usar somente armazenamento de sessão para esse silenciamento.

## 45.6. Usuário sem perfil persistente

Quando o aluno selecionar:

- continuar sem salvar;
- sessão temporária;
- navegação sem perfil;
- modo privado;

o sistema não conhece o histórico completo de exibição.

Nesse caso:

- usar `sessionStorage` ou estado de sessão não sensível;
- mostrar no máximo uma recomendação por sessão;
- não mostrar imediatamente na abertura;
- esperar um momento adequado;
- não repetir depois de fechada;
- respeitar silenciamento de 30 minutos dentro da sessão;
- não depender de cookies de terceiros;
- não criar impressão digital do dispositivo.

Não utilizar `localStorage` para tentar rastrear permanentemente usuários sem perfil.

## 45.7. Momento adequado para exibição

Mostrar somente em momentos de baixa interrupção, como:

- após salvar o progresso;
- depois de concluir uma etapa;
- na tela inicial depois de alguns minutos;
- durante uma pausa natural;
- após exportar o resultado;
- na central de conclusão;
- ao finalizar uma sessão;
- ao abrir a área de ajuda;
- em um intervalo escolar, quando adequado;
- ao navegar pelo catálogo de recursos.

Não mostrar:

- durante digitação;
- durante avaliação;
- durante cronômetro crítico;
- durante recuperação de senha;
- durante importação ou exportação;
- durante erro grave;
- enquanto o aluno estiver entregando no Classroom;
- nos últimos minutos da aula quando ainda houver entrega pendente;
- imediatamente após uma falha;
- em sequência com outros alertas;
- sobrepondo tutorial obrigatório.

## 45.8. Prioridade das mensagens

A ordem de prioridade deve ser:

1. segurança;
2. risco de perda de progresso;
3. prazo e entrega;
4. instrução da atividade;
5. acessibilidade;
6. horário escolar;
7. divulgação de outras ferramentas.

Se já existir uma mensagem mais importante:

- adiar a recomendação;
- não empilhar notificações;
- não competir visualmente;
- não interromper o aluno.

## 45.9. Catálogo central

Além das recomendações ocasionais, criar uma área permanente e opcional:

> Conheça outras ferramentas

Ela pode conter:

- nome;
- ícone;
- descrição;
- áreas;
- tipo;
- público;
- nível;
- dispositivos;
- status;
- link;
- última atualização;
- recursos principais;
- relação com a plataforma atual.

Categorias:

- laboratórios;
- desafios;
- aulas;
- simuladores;
- emuladores;
- diagnósticos;
- recuperação;
- acessibilidade;
- programação;
- hardware;
- redes;
- cibersegurança;
- inovação;
- ferramentas de apoio.

## 45.10. Registro inicial de ferramentas

Criar catálogo configurável com exemplos como:

### Lab Virtual DS

Descrição curta:

> Laboratório com ferramentas, simuladores e atividades de diferentes áreas do curso de Desenvolvimento de Sistemas.

Pode incluir áreas como:

- programação;
- computação gráfica;
- cores e pixels;
- sistemas operacionais;
- máquinas virtuais;
- hardware;
- redes;
- banco de dados;
- segurança;
- outras áreas configuradas.

### Desafio DS

Descrição curta:

> Plataforma de desafios por fases e áreas da tecnologia, com progressão, atividades práticas e acompanhamento do progresso.

Pode destacar:

- fases;
- áreas de DS;
- vidas;
- desafios;
- laboratórios;
- progresso;
- tutoriais;
- evidências.

### Desafio de Informática

Descrição curta:

> Atividades e desafios para praticar fundamentos de informática, ferramentas digitais e resolução de problemas.

### Diagnóstico Edu

Descrição curta:

> Ferramenta de diagnóstico de aprendizagem que adapta perguntas e indicadores conforme as respostas do aluno.

### Modo Guiado

Descrição curta:

> Aulas e atividades passo a passo, com progresso controlado, explicações, evidências e entrega pelo Classroom.

### Plataforma de Recuperação Adaptada

Descrição curta:

> Atividades adaptadas, explicações progressivas e recursos de apoio conforme as necessidades do aluno.

### CTF de Cibersegurança

Descrição curta:

> Desafios educativos de segurança digital, criptografia e investigação em ambiente controlado.

Esses nomes e textos devem ser atualizáveis.

Não exibir projetos incompletos como prontos.

Utilizar estados:

- disponível;
- em teste;
- piloto;
- em desenvolvimento;
- temporariamente indisponível;
- arquivado.

## 45.11. Recomendação contextual

Relacionar a recomendação ao conteúdo atual quando possível.

Exemplos:

### Atividade de hardware

> Quer praticar mais? O Lab Virtual DS possui ferramentas de hardware e sistemas.

### Atividade de programação

> Continue praticando no Desafio DS com exercícios de programação e lógica.

### Atividade diagnóstica

> Conheça o Modo Guiado para realizar atividades com instruções passo a passo.

### Atividade de segurança

> Explore o CTF de Cibersegurança em um ambiente educativo e controlado.

### Dificuldade de aprendizagem

> A Plataforma de Recuperação Adaptada oferece explicações progressivas e atividades com apoio adicional.

Não recomendar aleatoriamente algo totalmente desconectado quando houver opção mais relevante.

## 45.12. Rotação aleatória controlada

A seleção pode parecer aleatória para o aluno, mas deve seguir regras.

Usar rotação ponderada considerando:

- relevância para a atividade;
- ferramentas ainda não visualizadas;
- disponibilidade;
- dispositivo;
- turma;
- nível;
- frequência;
- última exibição;
- preferência do professor.

Não usar aleatoriedade pura que repita sempre a mesma ferramenta.

Fluxo sugerido:

1. filtrar ferramentas disponíveis;
2. remover a plataforma atual;
3. remover itens vistos recentemente;
4. priorizar itens relacionados;
5. aplicar rotação;
6. escolher uma recomendação;
7. registrar a exibição.

## 45.13. Não recomendar a própria plataforma

A recomendação não deve promover a mesma ferramenta em que o aluno já está.

Exemplo:

- dentro do Lab Virtual DS, não recomendar o Lab Virtual DS;
- dentro do Desafio DS, recomendar outras ferramentas;
- dentro do Diagnóstico Edu, recomendar Modo Guiado, recuperação ou laboratórios.

## 45.14. Links e abertura

Cada item deve possuir link configurado e validado.

Botões:

- Conhecer;
- Abrir ferramenta;
- Ver detalhes;
- Continuar depois;
- Copiar link.

Quando o destino for externo:

- abrir de forma segura;
- informar que será aberta outra ferramenta;
- preservar o progresso atual;
- salvar antes de sair;
- evitar perda de sessão;
- utilizar `noopener` e `noreferrer` quando apropriado;
- oferecer retorno à plataforma atual.

Antes de abrir:

> Seu progresso foi salvo. A outra ferramenta será aberta em uma nova guia.

## 45.15. Integração com perfil local

Salvar no perfil criptografado:

- IDs das recomendações vistas;
- datas;
- cliques;
- fechamentos;
- silenciamentos;
- preferência “mostrar menos”;
- categorias de interesse, quando escolhidas;
- versão do catálogo.

Não usar esse histórico para nota.

Não usar para avaliação disciplinar.

Não enviar para terceiros.

## 45.16. Preferências do aluno

Oferecer em configurações:

- mostrar recomendações;
- mostrar menos recomendações;
- não mostrar nesta sessão;
- pausar por 30 minutos;
- pausar por 3 dias;
- mostrar somente ferramentas relacionadas;
- mostrar novidades;
- ocultar ferramentas em desenvolvimento.

Se o aluno desativar recomendações:

- respeitar;
- manter o catálogo acessível manualmente;
- não reativar silenciosamente.

## 45.17. Preferências do professor

O professor deve poder:

- ativar ou desativar o módulo;
- cadastrar ferramentas;
- editar textos;
- configurar links;
- definir status;
- escolher turmas;
- escolher plataformas de origem;
- definir frequência;
- destacar ferramenta;
- agendar novidade;
- ocultar ferramenta;
- escolher categorias;
- configurar imagens;
- definir prioridade;
- testar uma recomendação;
- consultar métricas locais agregadas, quando permitido.

Não exibir métricas pessoais dos alunos sem finalidade pedagógica e base adequada.

## 45.18. Novidades e atualizações

A recomendação pode destacar:

- nova ferramenta;
- nova fase;
- novo simulador;
- nova aula;
- nova área;
- correção importante;
- melhoria de acessibilidade;
- novo tutorial.

Exemplo:

```text
Novidade no Lab Virtual DS

Agora há uma nova atividade de redes e infraestrutura.

[Conhecer] [Depois]
```

Não apresentar toda correção pequena como anúncio.

## 45.19. Créditos e autoria

Cada ferramenta recomendada pode mostrar:

> Idealização e desenvolvimento pedagógico: Professor Gabriel.

Versão ampliada:

> Projeto desenvolvido com apoio de inteligência artificial e colaboração de estudantes e professores do Colégio Alberto.

Não repetir o texto completo em todos os cards.

Pode existir link:

> Sobre o projeto

## 45.20. Imagens e ícones

Utilizar:

- ícones consistentes;
- pequenas ilustrações;
- miniaturas otimizadas;
- identidade visual de cada plataforma.

Não carregar imagens pesadas sem necessidade.

Fornecer texto alternativo.

Não usar animação que distraia.

## 45.21. Acessibilidade

O anúncio interno deve:

- ser navegável por teclado;
- possuir foco inicial adequado;
- anunciar título e conteúdo ao leitor de tela;
- ter botão fechar nomeado;
- respeitar redução de movimento;
- não depender apenas de cor;
- não desaparecer rápido demais;
- não bloquear zoom;
- manter contraste.

Toasts não devem sumir antes de o aluno conseguir lê-los.

## 45.22. Privacidade

O módulo não deve:

- usar rede de anúncios;
- usar cookies publicitários;
- criar perfil comercial;
- enviar dados a anunciantes;
- rastrear o aluno entre sites;
- vender dados;
- exibir publicidade paga;
- coletar informações desnecessárias.

As recomendações são exclusivamente educacionais e pertencem ao ecossistema de ferramentas do professor.

## 45.23. Métricas opcionais

Quando houver necessidade pedagógica, registrar apenas métricas mínimas:

- recomendação exibida;
- fechada;
- aberta;
- ferramenta acessada;
- frequência.

Preferir dados agregados.

Não registrar:

- conteúdo das atividades;
- respostas;
- senha;
- histórico de navegação externo;
- dados pessoais desnecessários.

Em sistema totalmente front-end, manter métricas no próprio perfil ou somente na sessão.

## 45.24. Usuário novo

Para um aluno sem histórico:

- não mostrar recomendação imediatamente;
- esperar uma primeira ação significativa;
- permitir que ele compreenda a plataforma atual;
- mostrar no máximo uma recomendação na sessão;
- priorizar ferramenta introdutória;
- não sobrecarregar tutorial inicial.

Momento sugerido:

- depois de 8 a 12 minutos de uso;
- após concluir uma etapa;
- na tela de encerramento.

O valor deve ser configurável.

## 45.25. Usuário recorrente

Para perfil conhecido:

- respeitar histórico;
- não repetir por 3 dias;
- priorizar novidades;
- considerar ferramentas ainda não abertas;
- limitar frequência;
- respeitar silenciamento.

## 45.26. Sessões curtas

Se a sessão durar poucos minutos:

- não forçar exibição;
- não mostrar ao sair se houver entrega pendente;
- não considerar obrigatório que toda sessão contenha recomendação.

A indicação deve aparecer ao longo do uso regular, não em todas as visitas.

## 45.27. Durante o horário escolar

Relacionar com o módulo de horário.

Não mostrar:

- nos últimos 10 minutos quando a atividade estiver incompleta;
- quando houver exportação pendente;
- durante o aviso de entrega;
- junto com contagem crítica.

Pode mostrar:

- no intervalo;
- depois de concluir;
- depois de entregar;
- no início de uma sessão longa, após ambientação.

## 45.28. Fora do horário escolar

Quando o aluno estiver estudando fora do turno, a recomendação pode ser um pouco mais apropriada.

Exemplo:

> Quer continuar praticando? Conheça outros laboratórios e desafios disponíveis.

Mesmo assim:

- mostrar no máximo uma vez;
- respeitar silêncio;
- evitar incentivar estudo excessivo durante a madrugada;
- não utilizar pressão de continuidade.

## 45.29. Estrutura de dados sugerida

```json
{
  "toolCatalog": [
    {
      "id": "lab-virtual-ds",
      "name": "Lab Virtual DS",
      "shortDescription": "",
      "categories": ["Laboratório", "Simuladores"],
      "areas": ["Programação", "Hardware", "Redes"],
      "status": "available",
      "url": "",
      "icon": "",
      "image": "",
      "audiences": ["1º DS", "2º DS", "3º DS", "Subsequente"],
      "devices": ["mobile", "desktop"],
      "relatedSkills": [],
      "priority": 1,
      "version": "",
      "updatedAt": ""
    }
  ],
  "crossPromotion": {
    "enabled": true,
    "maxPerSession": 1,
    "maxPerDay": 2,
    "sameItemCooldownHours": 72,
    "snoozeMinutes": 30,
    "firstDisplayAfterMinutes": 10,
    "avoidCriticalMoments": true
  }
}
```

## 45.30. Histórico por perfil

Estrutura sugerida:

```json
{
  "recommendationHistory": {
    "items": {
      "lab-virtual-ds": {
        "lastShownAt": "",
        "lastOpenedAt": "",
        "lastClosedAt": "",
        "shownCount": 0,
        "openedCount": 0
      }
    },
    "snoozedUntil": "",
    "disabled": false,
    "reducedFrequency": false
  }
}
```

Esse conteúdo deve permanecer dentro do perfil criptografado.

## 45.31. Componentes sugeridos

- ToolDiscoveryBanner;
- EducationalPromoCard;
- CrossPlatformRecommendation;
- ToolCatalog;
- ToolCatalogCard;
- ToolRecommendationEngine;
- RecommendationFrequencyManager;
- RecommendationSnooze;
- RecommendationHistory;
- RelatedTools;
- ToolStatusBadge;
- ToolDiscoverySettings;
- TeacherToolCatalogManager;
- EducationalNetworkFooter;
- NewToolAnnouncement.

## 45.32. Testes obrigatórios

Testar:

- perfil novo;
- perfil recorrente;
- sessão temporária;
- modo privado;
- recomendação fechada;
- silenciamento de 30 minutos;
- cooldown de 3 dias;
- limite por sessão;
- limite diário;
- plataforma atual removida da seleção;
- link ausente;
- ferramenta indisponível;
- ferramenta em desenvolvimento;
- ferramenta relacionada;
- rotação;
- atividade crítica;
- últimos minutos da aula;
- intervalo;
- entrega pendente;
- celular;
- computador;
- teclado;
- leitor de tela;
- redução de movimento;
- sem internet;
- perfil importado;
- preferências migradas;
- catálogo vazio;
- catálogo atualizado.

## 45.33. Regra principal

A divulgação cruzada deve:

- ajudar o aluno a descobrir recursos;
- valorizar o ecossistema educacional;
- ampliar oportunidades de aprendizagem;
- aparecer ocasionalmente;
- ser curta;
- ser fechável;
- respeitar preferências;
- usar frequência controlada;
- preservar o progresso;
- manter finalidade educacional.

Ela não deve:

- poluir a tela;
- interromper a atividade;
- competir com alertas importantes;
- aparecer repetidamente;
- parecer propaganda comercial;
- rastrear o aluno;
- insistir depois de fechada;
- abrir links automaticamente;
- mostrar ferramenta indisponível;
- criar ansiedade;
- obrigar o aluno a conhecer outra plataforma.


# 46. ENTREGA DA IMPLEMENTAÇÃO

Ao finalizar, apresente:

1. análise inicial;
2. funcionalidades implementadas;
3. funcionalidades reaproveitadas;
4. funcionalidades não aplicáveis;
5. integrações reais;
6. integrações assistidas;
7. recursos que exigem backend;
8. recursos que exigem credenciais;
9. alterações no modelo de dados;
10. alterações de segurança;
11. alterações de interface;
12. arquivos modificados;
13. testes executados;
14. problemas encontrados;
15. limitações;
16. próximos passos recomendados.

Não afirmar que algo foi implementado se estiver apenas desenhado.

Não simular API.

Não usar dados falsos como se fossem confirmação real.

---

# 47. RESULTADO ESPERADO

Ao final, o aluno deve conseguir:

- identificar sua turma e atividade;
- entender o que precisa fazer;
- concluir a atividade;
- exportar o resultado;
- localizar o arquivo;
- abrir o Classroom;
- entregar;
- resolver problemas comuns;
- publicar no GitHub, quando necessário;
- abrir no VS Code;
- continuar no mesmo equipamento;
- desbloquear seu perfil;
- começar do zero;
- exportar backup;
- migrar para outro equipamento;
- consultar histórico;
- redefinir a senha com ajuda do professor;
- preservar seu progresso;
- sair com segurança.

O professor deve conseguir:

- configurar o fluxo;
- organizar atividades;
- definir integrações;
- acompanhar evidências;
- orientar alunos;
- recuperar acesso;
- redefinir senha;
- preservar progresso;
- auditar alterações;
- manter o padrão entre as plataformas.

---

# 48. REGRA FINAL

Implemente tudo de forma:

- funcional;
- modular;
- progressiva;
- segura;
- responsiva;
- acessível;
- compatível;
- transparente;
- sem sobrecarregar a interface;
- sem armazenar senhas;
- sem expor dados;
- sem prometer capacidades inexistentes;
- sem destruir funcionalidades já existentes.

Sempre priorize:

1. segurança;
2. continuidade;
3. clareza;
4. simplicidade;
5. compatibilidade;
6. experiência do aluno;
7. experiência do professor;
8. integridade dos registros.
