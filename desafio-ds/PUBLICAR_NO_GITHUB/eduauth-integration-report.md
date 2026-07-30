# RELATÓRIO DE INTEGRAÇÃO EDUAUTH OFFLINE — DESAFIO DS v22.0

## 1. Identificação

- Plataforma: Desafio DS
- Versão da plataforma: 22.0.0
- Protocolo: EduAuth Offline 1.0
- Data da integração: 29/07/2026
- Arquitetura: aplicação totalmente front-end
- Hospedagem prevista: GitHub Pages
- Funcionamento offline: preservado dentro das limitações dos arquivos já carregados e do navegador
- Estado do provisionamento: Fase 1 — desenvolvimento
- Chaves presentes: exclusivamente chaves de teste, identificadas como `DEVELOPMENT TEST KEY — DO NOT USE IN PRODUCTION`

## 2. Diagnóstico do sistema anterior

Foram encontrados mecanismos estáticos ou permanentes nas seguintes operações:

| Operação anterior | Risco | Substituição aplicada |
|---|---|---|
| Iniciar o Modo Desafio | baixo | `CLASS_SHARED_PIN` |
| Iniciar o Modo Prova | médio | `SESSION_SCOPED_PIN` |
| Abrir auditoria docente | crítico | `SIGNED_GRANT` |
| Liberar uma das 88 aulas guiadas | baixo | `CLASS_SHARED_PIN` |
| Autorizar conclusão antecipada | alto | `SESSION_SCOPED_PIN` de 10 dígitos |
| Liberar continuação da prova | alto | `SESSION_SCOPED_PIN` de 10 dígitos |
| Abrir a recuperação administrativa | crítico | `SIGNED_GRANT` |
| Redefinir a senha de um perfil | crítico | `SIGNED_GRANT` + envelope criptográfico existente |

Os valores antigos não são reproduzidos neste relatório. Foram removidos do pacote público:

- senhas fixas de modo;
- senha docente fixa;
- senha fixa de recuperação da prova;
- hashes permanentes das 88 aulas;
- comparação direta de senha com texto ou hash estático;
- desbloqueio administrativo global baseado em senha permanente.

A frase-senha utilizada para proteger um **arquivo administrativo de recuperação criptográfica** continua existindo porque não é uma senha fixa embutida na plataforma. Ela é definida pelo professor e protege localmente a chave privada do envelope de recuperação.

## 3. Arquitetura aplicada

### Código coletivo

- Modalidade: `CLASS_SHARED_PIN`.
- Uso: iniciar o Desafio DS e liberar uma aula guiada.
- PIN: oito dígitos.
- Janela: 15 minutos.
- Contexto: plataforma, turma, disciplina, aula, atividade, ação e faixa UTC.
- Resultado: a mesma turma recebe o mesmo PIN para o mesmo contexto e faixa de horário.

### Código individual

- Modalidade: `SESSION_SCOPED_PIN`.
- Uso: iniciar prova, autorizar conclusão antecipada e liberar continuação da prova.
- PIN: oito ou dez dígitos conforme o risco.
- Validade: três a cinco minutos.
- Vínculos: solicitação, sessão, recurso, ação, aula e expiração.
- Uso único: habilitado.
- Nova solicitação: invalida a anterior.

### Autorização assinada

- Modalidade: `SIGNED_GRANT`.
- Algoritmo: ECDSA P-256 com SHA-256.
- Uso: auditoria docente e recuperação de perfil.
- Site público: contém somente a chave pública.
- Validador privado de desenvolvimento: contém a chave privada de teste.
- Token: vinculado à plataforma, ação, aula, solicitação, sessão e recurso.

### Recuperação do perfil

A recuperação criptográfica criada na v21 foi preservada e recebeu autorização EduAuth antes das operações críticas. O procedimento:

1. não revela a senha antiga;
2. recupera a chave de dados por meio do arquivo administrativo;
3. protege novamente a chave com a nova senha local;
4. preserva progresso, identidade e histórico;
5. registra o evento localmente.

## 4. Código-base público

- Prefixos: `EA1-C1`, `EA1-S1`, `EA1-G1` e `EA1-R1`.
- Codificação: Base32 Crockford.
- Detecção de erro: CRC32C.
- Separadores: hífens ignorados na leitura.
- Maiúsculas/minúsculas: indiferentes.
- Caracteres ambíguos: normalizados.
- Código coletivo: payload compacto sem nonce individual.
- Código de sessão: 31 bytes de payload e 56 caracteres Base32 antes dos separadores.
- QR Code: opcional.
- Fluxo principal: copiar, colar ou digitar.

## 5. Núcleo criptográfico

- HMAC-SHA-256 para PIN coletivo e individual.
- Truncamento dinâmico semelhante ao utilizado em códigos temporários.
- Unix Time em UTC para faixas de horário.
- `crypto.getRandomValues` para nonce.
- `crypto.randomUUID` para sessão.
- comparação de PIN com tempo constante aproximado em JavaScript;
- ECDSA P-256 para autorizações críticas;
- AES-GCM, PBKDF2 e RSA-OAEP preservados no gerenciador de perfis da v21.

Nenhuma chave privada foi colocada na pasta pública.

## 6. Interface implementada

O componente EduAuth possui os estados:

- preparando a solicitação;
- autorização necessária;
- aguardando professor;
- código-base visível;
- copiar código;
- mostrar ou ocultar QR Code;
- gerar nova solicitação;
- campo de PIN ou token assinado;
- validade restante;
- tentativas restantes;
- validação em andamento;
- autorização confirmada;
- erro neutro sem revelar detalhes do valor esperado.

Também foram incluídos:

- cinco tentativas;
- atraso progressivo;
- persistência da contagem na sessão;
- bloqueio após o limite;
- áreas de toque responsivas;
- navegação por teclado;
- foco visível herdado do projeto;
- suporte à redução de movimento do projeto;
- QR Code sem obrigatoriedade de câmera.

## 7. Ações realmente integradas

1. `challenge-start`;
2. `assessment-start`;
3. `lesson-start`;
4. `early-completion`;
5. `prova-rescue`;
6. `teacher-audit`;
7. `profile-recovery`;
8. `profile-recovery-reset`.

Não foram adicionadas ações fictícias sem ponto real de integração.

## 8. Arquivos criados

- `js/eduauth/config.js`;
- `js/eduauth/core.js`;
- `js/eduauth/ui.js`;
- `js/eduauth/qrcode-browser.js`;
- `js/eduauth/QRCODE_LICENSE.txt`;
- `eduauth-platform-manifest.json`;
- `eduauth-action-registry.json`;
- `eduauth-test-vectors.json`;
- `eduauth-provisioning-template.json`;
- `eduauth-integration-report.md`;
- `VALIDACAO_EDUAUTH_V22.json`;
- `RESULTADO_TESTES_CRIPTOGRAFICOS_V22.json`;
- `CHANGELOG_V22.md`.

No pacote privado:

- `EDUAUTH_PROFESSOR_DESENVOLVIMENTO/index.html`;
- `EDUAUTH_PROFESSOR_DESENVOLVIMENTO/validator-config.js`;
- `EDUAUTH_PROFESSOR_DESENVOLVIMENTO/eduauth-validator.js`;
- biblioteca local de QR Code e licença;
- guia privado atualizado.

## 9. Arquivos modificados

- `index.html`;
- `css/style.css`;
- `js/app.js`;
- `js/guided.js`;
- `js/guided-data.js`;
- `js/profile-store.js`;
- `js/config.js`;
- `js/platform-shell.js`;
- 13 arquivos do banco modular em `js/bank-chunks/`;
- `README.md`;
- `LEIA-ME.txt`.

## 10. Preservação funcional

Foram preservados:

- os 88 conteúdos do Modo Guiado;
- diagnóstico e competição;
- banco de perguntas e laboratórios;
- perfis locais criptografados;
- exportação e importação;
- recuperação por envelope;
- Central de Entrega;
- Classroom assistido;
- horário escolar;
- acessibilidade;
- responsividade;
- relatórios e comprovantes;
- funcionamento estático no GitHub Pages.

O banco modular foi recriptografado com um material interno de conteúdo neutro. Esse material não é tratado como credencial de segurança. Em uma aplicação front-end, o conteúdo enviado ao navegador sempre poderá ser inspecionado por um usuário avançado.

## 11. Testes executados

A validação final registrou 31 verificações aprovadas, incluindo:

- sintaxe de todos os JavaScripts públicos e privados;
- referências de scripts e estilos;
- IDs HTML duplicados;
- 88 aulas preservadas;
- remoção dos hashes permanentes;
- ausência das senhas antigas no público;
- ausência de chave privada no público;
- correspondência entre o validador e a configuração pública;
- leitura dos 13 chunks recriptografados;
- PIN coletivo determinístico;
- PIN individual diferente por solicitação;
- invalidação da solicitação individual anterior;
- consumo após o primeiro uso;
- verificação de checksum;
- autorização ECDSA válida;
- vínculo da autorização assinada ao recurso;
- presença dos cinco arquivos obrigatórios de retorno;
- equilíbrio estrutural do CSS.

Resultados detalhados:

- `VALIDACAO_EDUAUTH_V22.json`;
- `RESULTADO_TESTES_CRIPTOGRAFICOS_V22.json`;
- `eduauth-test-vectors.json`.

O Chromium instalado no ambiente de construção ficou bloqueado por uma política administrativa e não concluiu a captura visual automatizada. Portanto, o teste visual completo deve ser repetido na URL publicada. A estrutura responsiva da v21 foi preservada e os novos componentes receberam regras específicas para celular.

## 12. Limitações do front-end

Por funcionar integralmente no navegador:

- as chaves simétricas de validação podem ser extraídas por alguém tecnicamente avançado;
- não existe revogação central;
- não existe auditoria central;
- logs locais podem ser apagados;
- o JavaScript pode ser alterado por quem controla completamente o dispositivo;
- o PIN é proteção operacional, não autenticação equivalente a servidor;
- uma autorização assinada oferece proteção maior porque a chave privada não está no site público;
- a recuperação depende do arquivo administrativo e da frase-senha do professor.

## 13. Pendência de produção

Esta entrega conclui a **Fase 1 — integração estrutural** determinada pelo Prompt Mestre.

As chaves presentes são somente de desenvolvimento. Antes do uso com estudantes, deve ocorrer a Fase 2:

1. gerar as chaves de produção no EduAuth Professor;
2. exportar a configuração pública específica do Desafio DS;
3. substituir as chaves de desenvolvimento;
4. executar novamente os vetores;
5. atualizar `productionProvisioned` para `true`;
6. publicar uma nova versão;
7. manter todas as chaves privadas fora do GitHub.

O ZIP público desta versão pode ser utilizado para revisão e testes de integração, mas **não deve ser usado como autorização real em sala**.

## 14. Situação

`EDUAUTH PLATFORM INTEGRATION: VALID`

**Escopo:** Fase 1, ambiente de desenvolvimento, ainda não provisionado para produção.
