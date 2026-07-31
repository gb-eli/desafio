# Análise e implementação do Prompt Mestre — Desafio DS v21.0

## 1. Análise inicial

- **Tipo:** diagnóstico gamificado e plataforma de aulas guiadas.
- **Público:** turmas de Desenvolvimento de Sistemas do ensino médio integrado e subsequente noturno.
- **Dispositivos:** celular, tablet, Chromebook, notebook e computador de laboratório.
- **Arquitetura:** HTML, CSS e JavaScript sem backend, publicada no GitHub Pages.
- **Resultados:** comprovante textual/PDF no desafio e evidências HTML/JSON no Modo Guiado.
- **Integrações anteriores:** abertura assistida do Google Classroom e ferramentas externas.
- **Riscos anteriores:** perfil e progresso do Modo Guiado em `localStorage`, ausência de expiração, inexistência de backup de perfil e possibilidade de confundir abertura do Classroom com entrega.

## 2. Funcionalidades implementadas

- perfil local opcional protegido por senha;
- múltiplos perfis no mesmo navegador;
- IndexedDB para envelopes criptografados;
- PBKDF2-HMAC-SHA-256 com 210.000 iterações e salt exclusivo;
- chave aleatória de dados por perfil;
- AES-GCM 256 para dados e envelope da senha;
- expiração de seis dias e bloqueio automático por inatividade;
- sessão temporária sem persistência;
- exportação e importação `.edu-profile`;
- recuperação administrativa com RSA-OAEP, arquivo privado, frase-senha e senha do Modo Professor;
- migração dos dados legados do Modo Guiado quando o aluno desbloqueia um perfil;
- armazenamento separado para `desafio` e `guided` dentro do perfil;
- Central de Entrega em três níveis;
- distinção entre exportado, Classroom aberto e declaração do aluno;
- ajuda de Classroom, GitHub, VS Code, Drive e Google Fotos;
- horário escolar contextual para manhã e noite;
- créditos, uso de IA, versionamento e changelog;
- catálogo interno com estados reais;
- carreiras relacionadas sem dados atuais inventados.

## 3. Funcionalidades reaproveitadas

- seleção entre Desafio DS e Modo Guiado;
- banco de perguntas e laboratórios;
- relatórios de proficiência;
- estrutura responsiva da v20;
- códigos de aula protegidos por hash;
- painel docente e liberação antecipada;
- exportação HTML/JSON/TXT/PDF;
- links externos autorizados;
- temas, contraste e apoios pedagógicos.

## 4. Funcionalidades não aplicáveis nesta etapa

- exclusão automática de arquivos do Drive ou Google Fotos;
- coleta de documentos pessoais;
- candidaturas automáticas a vagas;
- ranking por horário de acesso;
- monitoramento de localização ou presença física;
- integração comercial ou anúncios de terceiros.

## 5. Integrações reais

- download de arquivos;
- Web Crypto API;
- IndexedDB;
- abertura real do Classroom, GitHub, VS Code Web e materiais configurados;
- impressão do resultado para PDF pelo navegador.

## 6. Integrações assistidas

- entrega no Classroom com tutorial e confirmação manual;
- publicação no GitHub;
- abertura no VS Code Web;
- diagnóstico de problemas de armazenamento;
- catálogo de outras plataformas sem abertura quando o link não está configurado.

## 7. Recursos que exigem backend

- sincronização automática entre dispositivos;
- painel centralizado com todos os alunos;
- confirmação externa de entrega;
- métricas agregadas institucionais;
- atualização contínua de oportunidades;
- autenticação realmente secreta de códigos e senhas.

## 8. Recursos que exigem credenciais

- Google Classroom API;
- OAuth do Google Workspace;
- API do GitHub para operações autenticadas;
- qualquer banco de dados externo;
- serviço de consulta periódica de oportunidades.

## 9. Alterações no modelo de dados

Novo envelope de perfil:

```text
record
├── metadados públicos mínimos
├── studentWrap — chave do perfil protegida pela senha do aluno
├── teacherWrap — chave do perfil protegida pela chave pública administrativa
└── payload — identidade, preferências, progresso e auditoria criptografados
```

Os dados por plataforma ficam separados:

```text
platforms
├── desafio
└── guided
```

## 10. Alterações de segurança

- senha nunca armazenada em texto puro;
- salt e IV exclusivos;
- criptografia autenticada;
- chave administrativa privada nunca embutida no código;
- acesso à recuperação protegido também pela senha do Modo Professor;
- chave privada baixada em arquivo separado;
- CSP preservada;
- links externos usam `noopener,noreferrer`;
- dados antigos sensíveis são removidos do `localStorage` após migração.

## 11. Alterações de interface

- painel de continuidade antes dos modos;
- gerenciador de perfis em modal responsivo;
- indicador escolar compacto;
- dock de Ajuda, Ferramentas e Sobre;
- controles estáticos no final da página no celular para não cobrir conteúdo;
- Central de Entrega reformulada;
- rodapé compacto de créditos e versão.

## 12. Arquivos modificados

- `index.html`;
- `css/style.css`;
- `js/app.js`;
- `js/config.js`;
- `js/guided.js`;
- `js/guided-data.js`;
- `README.md`.

Arquivos criados:

- `js/profile-store.js`;
- `js/schedule.js`;
- `js/platform-shell.js`;
- `CHANGELOG_V21.md`;
- `GUIA_PERFIS_LOCAIS_V21.md`;
- este relatório;
- `VALIDACAO_ESTRUTURAL_V21.json`.

## 13. Testes executados

- sintaxe de todos os JavaScripts com Node;
- existência de referências locais;
- IDs duplicados no HTML;
- contagem de 88 aulas;
- comparação entre 88 códigos privados e 88 hashes públicos;
- ausência das senhas privadas no pacote público;
- presença de PBKDF2, AES-GCM, RSA-OAEP e IndexedDB;
- teste criptográfico de derivação, criptografia, descriptografia e recuperação;
- teste visual empacotado em 1440 × 1000 e 390 × 844;
- verificação de rolagem horizontal;
- abertura da área Sobre e alternância do Modo Guiado.

## 14. Problemas encontrados

- a v20 utilizava `localStorage` para identidade e progresso guiado;
- a conclusão guiada não diferenciava declaração do aluno de confirmação externa;
- controles fixos poderiam cobrir conteúdo no celular;
- não existia histórico formal da v21 ou área institucional de créditos.

## 15. Limitações

- testes com URL local foram bloqueados pela política administrativa do ambiente de construção;
- o teste visual foi executado com os arquivos empacotados em memória;
- IndexedDB deve ser validado novamente na URL real do GitHub Pages;
- conflitos de importação oferecem cancelamento seguro, mas ainda não possuem mesclagem avançada;
- a recuperação administrativa somente funciona nos perfis vinculados à chave pública configurada;
- nenhuma vaga atual é anunciada sem pesquisa e revalidação.

## 16. Próximos passos recomendados

1. Publicar em um repositório de teste.
2. Criar a chave administrativa em computador seguro.
3. Guardar duas cópias do arquivo de recuperação em locais separados.
4. Criar um perfil de teste, bloquear, desbloquear, exportar e importar.
5. Testar a recuperação de senha preservando o progresso.
6. Configurar os links diretos de cada atividade do Classroom.
7. Cadastrar URLs reais das demais plataformas quando estiverem publicadas.
8. Avaliar futuramente um backend institucional para sincronização e confirmação de entrega.
