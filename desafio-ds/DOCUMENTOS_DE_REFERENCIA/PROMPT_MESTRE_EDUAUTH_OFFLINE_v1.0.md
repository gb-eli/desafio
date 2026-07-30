# PROMPT MESTRE — PADRÃO UNIVERSAL EDUAUTH OFFLINE

**Versão:** 1.0  
**Finalidade:** integração de códigos dinâmicos, autorizações do professor, recuperação de perfis e segurança operacional em plataformas educacionais sem backend.

---

## 1. PAPEL E RESPONSABILIDADE

Atue como arquiteto de software sênior especializado em:

- JavaScript e TypeScript;
- aplicações frontend;
- GitHub Pages;
- Progressive Web Apps;
- funcionamento offline;
- Web Crypto API;
- criptografia simétrica e assimétrica;
- geração de códigos temporários;
- autenticação por desafio e resposta;
- segurança de aplicações educacionais;
- IndexedDB;
- acessibilidade;
- experiência do usuário em celular, Chromebook e computador;
- integração entre múltiplas plataformas;
- testes automatizados;
- migração de sistemas legados.

Analise integralmente o código da plataforma antes de realizar qualquer modificação.

Não remova nem altere desnecessariamente:

- atividades;
- conteúdos;
- etapas;
- regras pedagógicas;
- layout;
- progresso;
- perfis;
- exportações;
- relatórios;
- funcionamento offline;
- integração com Google Classroom;
- recursos de acessibilidade;
- funcionalidades já existentes.

O objetivo é integrar um sistema universal de autorização, e não reconstruir toda a plataforma.

---

## 2. CONTEXTO GERAL

A plataforma faz parte de um conjunto de sistemas educacionais hospedados no GitHub Pages.

Esses sistemas não possuem:

- backend;
- banco de dados central;
- API de autenticação;
- servidor de autorização;
- comunicação direta entre o dispositivo do professor e o dispositivo do aluno.

Entre as plataformas que poderão utilizar o padrão estão:

- Desafio DS;
- Laboratório Virtual DS;
- Desafio de Informática;
- Diagnóstico Edu;
- Modo Guiado;
- plataformas de recuperação adaptada;
- plataformas de avaliação;
- plataformas de diagnóstico;
- atividades práticas;
- provas;
- desafios;
- simuladores;
- futuros sistemas educacionais.

Atualmente, algumas dessas plataformas utilizam ou poderão utilizar:

- senhas fixas;
- senhas escondidas no JavaScript;
- códigos permanentes;
- senha mestre;
- senha do professor;
- senha para liberar aula;
- senha para liberar desafio;
- senha para liberar resultado;
- senha para conclusão antecipada;
- senha para alterar configurações;
- senha para desbloquear etapa;
- senha para recuperar perfil;
- senha para redefinir a senha do aluno.

Esses mecanismos devem ser substituídos pelo padrão:

# EDUAUTH OFFLINE

---

## 3. OBJETIVO PRINCIPAL

Integrar a plataforma ao protocolo EduAuth Offline.

O sistema deverá permitir que:

1. a plataforma identifique automaticamente o que está sendo solicitado;
2. a plataforma gere um código-base público;
3. o código-base possa aparecer na tela do aluno;
4. o professor copie, digite ou receba esse código;
5. o validador do professor interprete o código-base;
6. o validador gere uma senha curta;
7. a senha digitada na plataforma seja validada offline;
8. a senha seja vinculada ao contexto correto;
9. senhas estáticas sejam eliminadas;
10. a mesma estrutura funcione em todas as plataformas;
11. o validador possa ser construído posteriormente a partir dos arquivos de retorno de cada sistema.

O QR Code deverá existir como alternativa, mas não poderá ser obrigatório no fluxo comum.

---

## 4. PRINCÍPIO FUNDAMENTAL DO SISTEMA

O EduAuth utilizará três mecanismos principais.

### Mecanismo A — Código dinâmico curto

Utilizado para permitir que o professor informe apenas uma senha numérica.

É funcional para:

- liberar uma aula;
- liberar um desafio;
- iniciar uma atividade;
- iniciar um diagnóstico;
- liberar um resultado;
- autorizar uma exceção;
- realizar uma autorização individual;
- substituir senhas mestre estáticas.

Esse mecanismo utiliza uma chave simétrica específica de cada plataforma.

A plataforma e o validador conseguem calcular a mesma senha porque possuem material de verificação compatível.

Essa modalidade deve ser tratada como:

> Proteção operacional offline para aplicações frontend.

Não deve ser apresentada como segurança equivalente a um backend.

### Mecanismo B — Autorização assinada

Utilizado quando for necessário um nível maior de segurança.

O autenticador do professor utiliza uma chave privada.

A plataforma possui apenas a chave pública.

O professor gera uma autorização completa assinada.

A plataforma verifica a assinatura sem possuir a chave privada.

Essa autorização será transferida por:

- copiar e colar;
- QR Code;
- compartilhamento;
- arquivo.

### Mecanismo C — Recuperação criptográfica de perfil

Utilizado para redefinir a senha de um perfil local sem revelar a senha antiga.

A recuperação deve trabalhar com envelopes criptográficos e chaves de dados.

O professor autoriza a redefinição, mas nunca descobre a senha anterior do aluno.

---

## 5. LIMITAÇÕES QUE DEVEM SER RECONHECIDAS

Como a plataforma é executada integralmente no navegador do aluno, qualquer material simétrico incluído no frontend poderá ser analisado por um usuário tecnicamente avançado.

Portanto, o EduAuth oferece:

- eliminação de senhas estáticas;
- códigos rotativos;
- códigos vinculados ao contexto;
- códigos diferentes por plataforma;
- códigos diferentes por aula;
- códigos diferentes por turma;
- códigos diferentes por horário;
- códigos diferentes por sessão;
- expiração;
- uso único;
- limitação de tentativas;
- redução do compartilhamento indevido;
- dificuldade contra descoberta casual;
- padronização operacional;
- rastreabilidade local.

O EduAuth não pode prometer:

- impossibilidade absoluta de fraude;
- segredo impossível de extrair do frontend;
- auditoria central;
- revogação central instantânea;
- proteção equivalente a backend;
- bloqueio impossível de contornar;
- impossibilidade de alteração do JavaScript;
- segurança contra um usuário com controle completo do navegador.

Não ocultar essas limitações no relatório técnico.

---

## 6. MODALIDADES DE AUTORIZAÇÃO

Implementar as quatro modalidades abaixo.

---

### 6.1 CLASS_SHARED_PIN

#### Código coletivo para uma turma

Utilizar para:

- liberar uma aula;
- liberar o Modo Guiado;
- liberar um desafio;
- iniciar uma atividade;
- acessar um laboratório;
- iniciar uma etapa comum;
- abrir um conteúdo;
- liberar uma atividade para toda a turma.

#### Características

- a mesma senha é utilizada pelos alunos da turma;
- a senha é vinculada à plataforma;
- a senha é vinculada à turma;
- a senha é vinculada à disciplina;
- a senha é vinculada à aula ou atividade;
- a senha é vinculada à ação;
- a senha é vinculada à faixa de horário;
- a senha muda automaticamente;
- a senha não depende de cada dispositivo;
- não deve existir uma sessão individual por aluno;
- o código-base poderá ser igual para todos os alunos da turma;
- a senha poderá ser projetada ou informada oralmente pelo professor.

#### Exemplo de uso

Na plataforma do aluno:

```text
Esta aula precisa de autorização do professor.

Plataforma: Desafio DS
Turma: 2º DS A
Disciplina: Programação Front-End
Aula: Aula 03
Ação: Iniciar aula

Código-base:
EA1-C1-K01-8G4M-2D7K-P9W3

Use este código para solicitar a senha ao professor.
```

No validador:

```text
Plataforma: Desafio DS
Turma: 2º DS A
Disciplina: Programação Front-End
Aula: Aula 03
Ação: Iniciar aula
Janela: 12:45 até 13:00

Senha da turma:
4839 1726
```

A senha `4839 1726` deverá funcionar para todos os alunos que estiverem no mesmo contexto.

#### Validade recomendada

- padrão: 15 minutos;
- mínimo configurável: 5 minutos;
- máximo recomendado: 30 minutos;
- tolerância de relógio: uma faixa anterior ou posterior, somente quando configurada.

#### Tamanho

- padrão: 8 dígitos;
- exibição: `4839 1726`;
- armazenamento e cálculo: `48391726`.

#### Segurança

Utilizar HMAC-SHA-256 com uma chave específica da plataforma.

Estrutura conceitual:

```text
HMAC-SHA-256(
  platformClassKey,
  canonicalContext
)
```

Depois realizar truncamento dinâmico e conversão para oito dígitos.

#### Contexto obrigatório

```json
{
  "protocol": "EDUAUTH",
  "version": 1,
  "mode": "CLASS_SHARED_PIN",
  "keyId": "desafio-ds-class-01",
  "platformId": "desafio-ds",
  "classId": "2ds-a",
  "subjectId": "programacao-front-end",
  "lessonId": "aula-03",
  "activityId": "atividade-principal",
  "actionId": "lesson-start",
  "timeSlot": 0,
  "policyVersion": 1
}
```

#### Não utilizar para

- redefinição de senha;
- recuperação de perfil;
- alteração administrativa crítica;
- exclusão de registros;
- alteração de notas;
- desbloqueio geral da plataforma;
- acesso permanente ao painel do professor.

---

### 6.2 SESSION_SCOPED_PIN

#### Código individual vinculado à sessão

Utilizar para:

- conclusão antecipada;
- liberação individual de resultado;
- desbloqueio de uma etapa;
- alteração protegida;
- autorização excepcional;
- correção de um problema durante a atividade;
- redefinição de senha;
- recuperação operacional;
- autorização administrativa;
- substituição da antiga senha mestre estática.

#### Características

- a senha é válida apenas para uma solicitação;
- a senha é vinculada à sessão;
- a senha é vinculada ao dispositivo;
- a senha é vinculada à ação;
- a senha é vinculada ao recurso;
- a senha possui expiração;
- a senha é consumida depois do uso;
- outro aluno não poderá usar a mesma senha em outra sessão;
- gerar uma nova solicitação invalida a anterior.

#### Fluxo

1. A plataforma identifica o contexto.
2. A plataforma gera um `sessionId`.
3. A plataforma gera um `requestId`.
4. A plataforma gera um `sessionNonce`.
5. A plataforma calcula um código-base público.
6. O código-base aparece na tela.
7. O professor digita ou cola o código-base no validador.
8. O validador interpreta a solicitação.
9. O validador gera a senha da sessão.
10. O professor informa a senha.
11. A plataforma calcula a senha esperada.
12. A plataforma compara os valores.
13. A autorização é aplicada.
14. A solicitação é consumida.
15. A senha não poderá ser reutilizada.

#### Exemplo

Na plataforma:

```text
Autorização individual necessária.

Ação: Autorizar conclusão antecipada
Aula: Aula 03
Sessão: 7K4P
Validade: 04:42

Código-base:
EA1-S1-K02-7K4P-9N6D-Q2MV-4B8R

Informe este código ao professor.
```

No validador:

```text
SOLICITAÇÃO INDIVIDUAL

Plataforma: Modo Guiado DS
Turma: 2º DS A
Aula: Aula 03
Ação: Conclusão antecipada
Sessão: 7K4P
Validade restante: 04:31

Senha da sessão:
7304 1829
```

#### Contexto obrigatório

```json
{
  "protocol": "EDUAUTH",
  "version": 1,
  "mode": "SESSION_SCOPED_PIN",
  "keyId": "modo-guiado-session-01",
  "platformId": "modo-guiado-ds",
  "classId": "2ds-a",
  "subjectId": "programacao-front-end",
  "lessonId": "aula-03",
  "activityId": "atividade-principal",
  "actionId": "early-completion",
  "sessionId": "UUID",
  "requestId": "UUID",
  "sessionNonce": "valor-aleatorio",
  "profileIdHash": "identificador-pseudonimizado",
  "timeSlot": 0,
  "expiresAt": 0,
  "policyVersion": 1
}
```

#### Tamanho

- risco médio: 8 dígitos;
- risco alto: 10 dígitos;
- risco crítico: preferir autorização assinada.

#### Validade

- autorização comum: 5 minutos;
- autorização de alto risco: 2 a 5 minutos;
- autorização mestre dinâmica: no máximo 5 minutos;
- código consumido: inválido imediatamente;
- nova solicitação: invalida a anterior.

#### Nome correto da função

Não utilizar o conceito de senha mestre fixa.

Substituir por:

```text
Autorização mestre dinâmica
```

A autorização mestre deverá ser:

- vinculada à ação;
- vinculada à sessão;
- temporária;
- de uso único;
- registrada;
- limitada ao recurso solicitado.

Nunca criar:

```javascript
isMasterUnlocked = true;
```

---

### 6.3 SIGNED_GRANT

#### Autorização assinada com chave privada do professor

Utilizar para:

- ações críticas;
- recuperação de perfil;
- alterações administrativas importantes;
- exclusão de registros;
- autorização excepcional de alto impacto;
- abertura de configurações sensíveis;
- ações em que um PIN curto não seja suficiente.

#### Funcionamento

1. O professor desbloqueia o EduAuth Professor.
2. O autenticador monta uma autorização.
3. O autenticador assina a autorização com a chave privada.
4. A plataforma verifica utilizando a chave pública.
5. A chave privada nunca é enviada à plataforma.

#### Transferência

Permitir:

- copiar e colar o token completo;
- QR Code;
- importar arquivo;
- compartilhamento pelo sistema operacional.

#### QR Code

O QR Code é opcional.

O sistema não poderá obrigar o professor a utilizar a câmera no fluxo comum.

O leitor de QR Code deverá existir no validador para situações em que:

- o professor estiver usando o celular;
- o aluno estiver em outro dispositivo;
- a solicitação for longa;
- a autorização for crítica;
- copiar e colar não for conveniente.

#### Token

Exemplo conceitual:

```text
EA1-G1.<payload-compactado>.<assinatura>
```

Esse token poderá ser grande.

Não tentar reduzir uma assinatura criptográfica completa para apenas oito dígitos.

---

### 6.4 PROFILE_RECOVERY_ENVELOPE

#### Recuperação segura de perfil local

A recuperação não deverá descobrir nem revelar a senha antiga.

Cada perfil deverá utilizar:

- uma chave de dados aleatória;
- uma proteção vinculada à senha do aluno;
- um salt exclusivo;
- derivação de chave;
- criptografia autenticada;
- um envelope adicional de recuperação do professor;
- registro de alterações.

#### Fluxo

1. O aluno solicita recuperação.
2. A plataforma gera uma solicitação vinculada ao perfil e à sessão.
3. O professor autoriza a recuperação.
4. O sistema libera a redefinição.
5. O aluno ou professor define uma nova senha.
6. A chave de dados do perfil é novamente protegida.
7. A senha antiga permanece desconhecida.
8. O evento é registrado.

Nunca usar expressões como:

- quebrar a senha;
- descobrir a senha;
- mostrar a senha antiga;
- recuperar a senha em texto puro.

Utilizar:

```text
Redefinir a senha do perfil
```

---

## 7. CÓDIGO-BASE PÚBLICO

O código-base não é a senha.

Ele serve para transportar o contexto necessário até o validador.

Pode ser exibido publicamente na tela do aluno.

### O código-base deverá informar

- versão do protocolo;
- modalidade;
- versão da chave;
- plataforma;
- turma;
- disciplina;
- aula;
- atividade;
- ação;
- faixa de horário;
- sessão, quando aplicável;
- nonce, quando aplicável;
- checksum para detectar erros de digitação.

### Formato geral

```text
EA1-<MODO>-<VERSÃO-DA-CHAVE>-<PAYLOAD>-<CHECKSUM>
```

Prefixos:

```text
EA1-C1 = código coletivo
EA1-S1 = código de sessão
EA1-G1 = autorização assinada
EA1-R1 = recuperação de perfil
```

### Características

- não diferencia maiúsculas e minúsculas;
- ignora espaços;
- ignora hífens;
- usa caracteres que evitem confusão;
- não usar `O` e `0` simultaneamente;
- não usar `I`, `L` e `1` simultaneamente;
- apresentar em grupos;
- permitir copiar com um toque;
- permitir leitura em voz alta;
- possuir checksum;
- detectar código incompleto;
- detectar erro de digitação.

### Tamanho recomendado

#### Código coletivo

Entre 24 e 40 caracteres, desconsiderando hífens.

#### Código de sessão

Entre 32 e 56 caracteres, desconsiderando hífens.

#### Token assinado

Poderá ultrapassar 100 caracteres e deverá priorizar copiar, colar ou QR Code.

### Codificação

Preferir:

- Base32 Crockford;
- estrutura binária compacta;
- CBOR determinístico;
- checksum separado.

Não colocar JSON bruto inteiro no código visível.

---

## 8. REGISTRO COMPACTO DE IDENTIFICADORES

Para reduzir o tamanho do código-base, cada plataforma deverá gerar um registro de códigos internos.

Exemplo:

```json
{
  "platforms": {
    "01": "desafio-ds"
  },
  "classes": {
    "01": "2ds-a",
    "02": "2ds-b"
  },
  "subjects": {
    "01": "programacao-front-end"
  },
  "lessons": {
    "01": "aula-01",
    "02": "aula-02",
    "03": "aula-03"
  },
  "activities": {
    "01": "atividade-principal"
  },
  "actions": {
    "01": "lesson-start",
    "02": "early-completion"
  }
}
```

O mesmo registro deverá ser incluído no manifest entregue ao validador.

Não depender de descrições amigáveis para realizar cálculos criptográficos.

---

## 9. FLUXOS DE USO DO PROFESSOR

### 9.1 Fluxo principal por código-base

Esse deverá ser o fluxo padrão.

1. O aluno abre a atividade.
2. A plataforma mostra o código-base.
3. O professor abre o validador.
4. O professor digita ou cola o código-base.
5. O validador interpreta o contexto.
6. O validador mostra o que será autorizado.
7. O professor confirma.
8. O validador gera a senha.
9. O aluno digita a senha.
10. A plataforma valida.

### 9.2 Geração manual pelo professor

Para códigos coletivos, permitir que o professor gere a senha sem receber um código-base.

O professor poderá selecionar:

- plataforma;
- turma;
- disciplina;
- aula;
- atividade;
- ação.

O validador deverá calcular a mesma senha.

Depois de gerar, o validador deverá mostrar também o código-base correspondente para conferência.

### 9.3 Copiar e colar

Permitir que o código-base seja:

- copiado na plataforma;
- colado no validador;
- compartilhado em mensagem;
- enviado pelo chat da turma;
- transferido por arquivo de texto;
- digitado manualmente.

### 9.4 QR Code

Disponibilizar como alternativa.

O validador deverá possuir:

- botão “Ler QR Code”;
- acesso à câmera;
- seleção de câmera;
- leitura de imagem;
- importação de captura de tela;
- permissão clara;
- tratamento de câmera indisponível.

O QR Code não poderá ser obrigatório para liberar uma aula.

---

## 10. ARQUITETURA DE CHAVES

O EduAuth deverá utilizar chaves separadas.

### 10.1 Chave-raiz do validador

Existe apenas no EduAuth Professor.

Nunca deverá ser incluída:

- nas plataformas;
- nos repositórios;
- nos manifests públicos;
- nos relatórios;
- nos vetores de produção;
- no console.

### 10.2 Chave de código coletivo

Uma chave diferente para cada plataforma.

Exemplo:

```text
desafio-ds-class-key-01
diagnostico-edu-class-key-01
modo-guiado-class-key-01
```

Pode ser derivada pelo validador:

```text
HKDF(
  rootKey,
  salt = "EDUAUTH-CLASS-v1",
  info = platformId + keyVersion
)
```

A plataforma precisará possuir material compatível para validar o PIN.

Reconhecer que esse material poderá ser extraído por um usuário avançado.

### 10.3 Chave de sessão

Separada da chave coletiva.

Exemplo:

```text
desafio-ds-session-key-01
```

Nunca utilizar a mesma chave para:

- códigos coletivos;
- códigos individuais;
- recuperação;
- assinatura;
- criptografia.

### 10.4 Chave privada de assinatura

Existe somente no validador.

A plataforma recebe apenas a chave pública.

### 10.5 Chave privada de recuperação

Existe somente no validador.

É utilizada para envelopes de recuperação de perfil.

---

## 11. PROVISIONAMENTO EM DUAS FASES

Como o validador será construído depois da integração das plataformas, realizar a implantação em duas fases.

### Fase 1 — Integração estrutural

Cada plataforma deverá:

- implementar o núcleo EduAuth;
- criar os componentes;
- mapear as ações;
- gerar o código-base;
- criar o manifest;
- utilizar somente chaves de teste claramente identificadas;
- executar vetores de teste;
- gerar o pacote de retorno.

As chaves deverão conter aviso:

```text
DEVELOPMENT TEST KEY — DO NOT USE IN PRODUCTION
```

### Fase 2 — Provisionamento de produção

Depois que o EduAuth Professor estiver construído:

1. gerar chaves de produção;
2. gerar uma configuração específica para cada plataforma;
3. importar a configuração na plataforma;
4. substituir as chaves de teste;
5. executar novamente os vetores;
6. verificar compatibilidade;
7. publicar nova versão;
8. garantir que nenhuma chave privada foi publicada.

Nunca utilizar as chaves de teste em uma atividade real.

---

## 12. DATA, HORÁRIO, SALT E NONCE

### 12.1 Horário

Utilizar Unix Time em UTC.

Não utilizar textos localizados como parte do cálculo:

```text
29 de julho
quarta-feira
12 horas
```

Cálculo:

```text
timeSlot = floor(unixSeconds / windowSeconds)
```

### 12.2 Janelas sugeridas

```json
{
  "classSharedPinWindowSeconds": 900,
  "sessionPinWindowSeconds": 300,
  "highRiskPinWindowSeconds": 120,
  "allowedClockDriftSlots": 1
}
```

### 12.3 Salt

O salt:

- não é uma senha;
- não precisa ser secreto;
- serve para separar contextos;
- deverá ser versionado;
- poderá ser utilizado em HKDF e derivação.

### 12.4 Nonce

O nonce:

- deverá ser aleatório;
- deverá ser gerado com `crypto.getRandomValues`;
- deverá impedir solicitações repetidas;
- será obrigatório para códigos de sessão;
- não deverá utilizar `Math.random()`.

### 12.5 Sessão

Utilizar:

```javascript
crypto.randomUUID()
```

ou valor equivalente produzido criptograficamente.

O `sessionId` deverá ser mantido em `sessionStorage`.

Fechar a aba deverá encerrar a sessão, salvo regra explicitamente configurada.

---

## 13. SERIALIZAÇÃO E CÁLCULO

Antes de realizar:

- hash;
- HMAC;
- assinatura;
- verificação;
- geração de checksum;

o contexto deverá ser:

1. validado;
2. normalizado;
3. reduzido aos campos permitidos;
4. convertido para representação canônica;
5. codificado em UTF-8.

Não depender da ordem natural dos objetos JavaScript.

Utilizar JSON canônico ou representação binária determinística.

---

## 14. GERAÇÃO DO PIN

Estrutura conceitual:

```javascript
const contextBytes = canonicalEncode(context);

const hmac = await hmacSha256(
  platformScopedKey,
  contextBytes
);

const truncatedValue = dynamicTruncate(hmac);

const pin = String(
  truncatedValue % (10 ** pinLength)
).padStart(pinLength, "0");
```

Não usar:

```javascript
Math.random()
```

para gerar:

- chaves;
- nonce;
- sessão;
- salt;
- códigos;
- tokens.

---

## 15. CLASSIFICAÇÃO DE RISCO

Criar:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### LOW

Exemplos:

- liberar aula;
- iniciar atividade comum;
- acessar laboratório;
- abrir desafio.

Modalidades:

- `CLASS_SHARED_PIN`;
- `SIGNED_GRANT` opcional.

### MEDIUM

Exemplos:

- iniciar avaliação;
- liberar resultado;
- desbloquear etapa individual.

Modalidades:

- `SESSION_SCOPED_PIN`;
- `SIGNED_GRANT`.

### HIGH

Exemplos:

- conclusão antecipada;
- redefinição de senha;
- recuperação de perfil;
- alteração protegida.

Modalidades:

- `SESSION_SCOPED_PIN` de 10 dígitos;
- `SIGNED_GRANT` recomendado.

### CRITICAL

Exemplos:

- alteração administrativa ampla;
- exclusão de registros;
- exportação de dados protegidos;
- alteração de chave;
- gerenciamento de recuperação.

Modalidades:

- `SIGNED_GRANT`;
- nova autenticação do professor no validador;
- motivo obrigatório.

---

## 16. CATÁLOGO UNIVERSAL DE AÇÕES

Criar um arquivo de ações.

Exemplo:

```javascript
export const EDUAUTH_ACTIONS = {
  LESSON_START: {
    id: "lesson-start",
    label: "Iniciar aula",
    risk: "LOW",
    preferredMode: "CLASS_SHARED_PIN",
    pinLength: 8,
    ttlSeconds: 900,
    sharedAcrossClass: true,
    sessionBound: false,
    singleUse: false
  },

  CHALLENGE_START: {
    id: "challenge-start",
    label: "Iniciar desafio",
    risk: "LOW",
    preferredMode: "CLASS_SHARED_PIN",
    pinLength: 8,
    ttlSeconds: 900,
    sharedAcrossClass: true,
    sessionBound: false,
    singleUse: false
  },

  RESULT_RELEASE: {
    id: "result-release",
    label: "Liberar resultado",
    risk: "MEDIUM",
    preferredMode: "SESSION_SCOPED_PIN",
    pinLength: 8,
    ttlSeconds: 300,
    sharedAcrossClass: false,
    sessionBound: true,
    singleUse: true
  },

  EARLY_COMPLETION: {
    id: "early-completion",
    label: "Autorizar conclusão antecipada",
    risk: "HIGH",
    preferredMode: "SESSION_SCOPED_PIN",
    strongerMode: "SIGNED_GRANT",
    pinLength: 10,
    ttlSeconds: 180,
    sharedAcrossClass: false,
    sessionBound: true,
    singleUse: true,
    requireReason: true
  },

  PROFILE_RECOVERY: {
    id: "profile-recovery",
    label: "Redefinir senha do perfil",
    risk: "HIGH",
    preferredMode: "SESSION_SCOPED_PIN",
    strongerMode: "PROFILE_RECOVERY_ENVELOPE",
    pinLength: 10,
    ttlSeconds: 180,
    sharedAcrossClass: false,
    sessionBound: true,
    singleUse: true,
    requireReason: true
  },

  ADMIN_OVERRIDE: {
    id: "admin-override",
    label: "Executar alteração administrativa",
    risk: "CRITICAL",
    preferredMode: "SIGNED_GRANT",
    ttlSeconds: 120,
    sharedAcrossClass: false,
    sessionBound: true,
    singleUse: true,
    requireReason: true,
    requireTeacherReauthentication: true
  }
};
```

Adicionar somente ações existentes na plataforma.

---

## 17. ESCOPO DA AUTORIZAÇÃO

Uma senha nunca poderá desbloquear toda a plataforma.

Proibido:

```javascript
window.teacherMode = true;
window.adminUnlocked = true;
window.masterAccess = true;
```

Utilizar autorização limitada:

```json
{
  "authorizationId": "UUID",
  "requestId": "UUID",
  "platformId": "modo-guiado-ds",
  "actionId": "early-completion",
  "resourceId": "aula-03",
  "sessionId": "UUID",
  "grantedAt": 0,
  "expiresAt": 0,
  "consumed": false
}
```

Uma senha para conclusão antecipada não poderá:

- alterar configurações;
- liberar outras aulas;
- recuperar outro perfil;
- abrir painel administrativo;
- liberar outro aluno;
- funcionar em outra sessão.

---

## 18. LIMITAÇÃO DE TENTATIVAS

Implementar:

- máximo padrão de 5 tentativas;
- atraso progressivo;
- invalidação depois do limite;
- nova solicitação obrigatória;
- registro local;
- mensagem neutra;
- proteção contra duplo clique;
- proteção contra envio repetido.

Mensagem:

```text
Código inválido, expirado ou pertencente a outra solicitação.
```

Não informar:

- parte correta;
- número de dígitos corretos;
- valor esperado;
- diferença entre os códigos.

---

## 19. INTERFACE DA PLATAFORMA

Criar um componente reutilizável.

### Estados obrigatórios

#### Autorização necessária

```text
Esta ação precisa de autorização do professor.
```

#### Preparando

```text
Identificando a plataforma...
Organizando os dados da aula...
Preparando a solicitação...
Gerando o código-base...
```

#### Aguardando

Mostrar:

- tipo de autorização;
- risco;
- turma;
- disciplina;
- aula;
- atividade;
- ação;
- código-base;
- botão copiar;
- botão mostrar QR Code;
- campo para senha;
- cronômetro;
- tentativas restantes;
- botão cancelar;
- botão gerar nova solicitação.

#### Validando

```text
Validando o código...
Conferindo a sessão...
Conferindo a atividade...
Aplicando a autorização...
```

#### Sucesso

```text
Autorização confirmada.

A permissão foi aplicada somente para:
Autorizar conclusão antecipada da Aula 03.
```

#### Erro

```text
Não foi possível validar esta autorização.

Confira o código ou solicite uma nova senha ao professor.
```

### Acessibilidade

Garantir:

- funcionamento por teclado;
- foco visível;
- leitores de tela;
- contraste;
- áreas de toque adequadas;
- redução de movimento;
- feedback que não dependa somente de cor;
- responsividade;
- suporte a celular;
- suporte a Chromebook;
- suporte a computador Windows.

---

## 20. ESTRUTURA DE ARQUIVOS

Adaptar ao projeto existente.

Estrutura sugerida:

```text
src/eduauth/
├── core/
│   ├── protocol.js
│   ├── canonical-encoder.js
│   ├── hmac-provider.js
│   ├── signature-provider.js
│   ├── time-slot.js
│   ├── random.js
│   ├── base32.js
│   ├── checksum.js
│   ├── schema-validator.js
│   └── identifiers.js
├── modes/
│   ├── class-shared-pin.js
│   ├── session-scoped-pin.js
│   ├── signed-grant.js
│   └── profile-recovery-envelope.js
├── config/
│   ├── platform.js
│   ├── actions.js
│   ├── registries.js
│   ├── key-config.js
│   └── policies.js
├── storage/
│   ├── session-store.js
│   ├── authorization-store.js
│   ├── attempt-limiter.js
│   └── audit-log.js
├── ui/
│   ├── authorization-modal.js
│   ├── public-request-code.js
│   ├── pin-input.js
│   ├── qr-code-view.js
│   ├── countdown.js
│   └── authorization-feedback.js
└── index.js
```

---

## 21. MIGRAÇÃO DAS SENHAS EXISTENTES

Pesquisar por:

```text
password
senha
masterPassword
master
teacherPassword
adminPassword
accessCode
unlockCode
pin
codigoProfessor
senhaMestre
senhaProfessor
admin
override
```

Criar inventário com:

- arquivo;
- linha aproximada;
- finalidade;
- mecanismo atual;
- risco;
- ação EduAuth correspondente;
- modalidade escolhida;
- alteração realizada.

Nunca incluir o valor da senha antiga no relatório.

Depois da migração, remover:

- senha fixa;
- senha padrão;
- senha escondida;
- senha de emergência;
- código universal;
- comparação direta com texto;
- desbloqueio global.

---

## 22. LOGS E AUDITORIA LOCAL

Registrar:

- data e horário;
- plataforma;
- turma;
- disciplina;
- aula;
- atividade;
- ação;
- modalidade;
- risco;
- `requestId`;
- `sessionId`;
- resultado;
- quantidade de tentativas;
- expiração;
- consumo;
- motivo, quando aplicável.

Não registrar:

- senha digitada;
- senha esperada;
- chave;
- segredo;
- HMAC completo;
- senha antiga do perfil.

O histórico deverá ser armazenado localmente.

Não afirmar que o histórico local é inviolável.

---

## 23. PACOTE DE RETORNO OBRIGATÓRIO

Ao concluir a integração, criar os arquivos:

```text
eduauth-platform-manifest.json
eduauth-action-registry.json
eduauth-integration-report.md
eduauth-test-vectors.json
eduauth-provisioning-template.json
```

Esses arquivos serão utilizados para construir o EduAuth Professor.

---

## 24. ESTRUTURA DO MANIFEST

Criar:

```json
{
  "schema": "eduauth-platform-manifest",
  "schemaVersion": 1,
  "protocolVersion": 1,

  "platform": {
    "id": "platform-id",
    "name": "Nome da plataforma",
    "version": "1.0.0",
    "repository": "proprietario/repositorio",
    "origin": "https://exemplo.github.io/repositorio/"
  },

  "integration": {
    "status": "complete",
    "coreVersion": "1.0.0",
    "offlineSupported": true,
    "githubPagesSupported": true,
    "productionProvisioned": false
  },

  "requestCode": {
    "prefix": "EA1",
    "encoding": "BASE32_CROCKFORD",
    "checksum": "CRC32C",
    "caseInsensitive": true,
    "ignoreSeparators": true
  },

  "identifierRegistry": {
    "platformCode": "01",
    "classes": {},
    "subjects": {},
    "lessons": {},
    "activities": {},
    "actions": {}
  },

  "keyConfiguration": {
    "classKeyId": "platform-class-01",
    "sessionKeyId": "platform-session-01",
    "signingPublicKeyId": "teacher-signing-01",
    "recoveryPublicKeyId": "teacher-recovery-01",
    "environment": "development"
  },

  "timePolicy": {
    "useUtc": true,
    "classWindowSeconds": 900,
    "sessionWindowSeconds": 300,
    "highRiskWindowSeconds": 180,
    "allowedClockDriftSlots": 1
  },

  "contextSources": {
    "classId": {
      "source": "runtime",
      "path": ""
    },
    "subjectId": {
      "source": "runtime",
      "path": ""
    },
    "lessonId": {
      "source": "runtime",
      "path": ""
    },
    "activityId": {
      "source": "runtime",
      "path": ""
    },
    "profileIdHash": {
      "source": "runtime-optional",
      "path": ""
    },
    "sessionId": {
      "source": "generated",
      "storage": "sessionStorage"
    }
  },

  "actions": [],

  "storage": {
    "sessionStore": "sessionStorage",
    "authorizationStore": "sessionStorage",
    "auditStore": "IndexedDB"
  },

  "security": {
    "maximumAttempts": 5,
    "progressiveDelay": true,
    "staticPasswordPresent": false,
    "staticMasterPasswordPresent": false,
    "privateKeyPresent": false
  },

  "ui": {
    "publicRequestCode": true,
    "copyButton": true,
    "manualEntry": true,
    "qrOptional": true,
    "cameraRequired": false,
    "reducedMotion": true,
    "keyboardAccessible": true
  },

  "compatibility": {
    "chromeAndroid": "not-tested",
    "chromeChromebook": "not-tested",
    "edgeWindows": "not-tested",
    "offline": "not-tested"
  },

  "limitations": [],
  "pendingItems": []
}
```

---

## 25. REGISTRO DE AÇÕES

Criar `eduauth-action-registry.json`.

Cada ação deverá conter:

```json
{
  "id": "early-completion",
  "numericCode": "02",
  "label": "Autorizar conclusão antecipada",
  "risk": "HIGH",
  "preferredMode": "SESSION_SCOPED_PIN",
  "strongerMode": "SIGNED_GRANT",
  "pinLength": 10,
  "ttlSeconds": 180,
  "sharedAcrossClass": false,
  "sessionBound": true,
  "singleUse": true,
  "requireReason": true,
  "requireTeacherReauthentication": false,
  "integrationPoints": [
    {
      "file": "src/exemplo.js",
      "function": "finishLesson",
      "lineApproximation": 100
    }
  ]
}
```

---

## 26. TEMPLATE DE PROVISIONAMENTO

Criar `eduauth-provisioning-template.json`.

Não incluir chaves de produção.

Estrutura:

```json
{
  "schema": "eduauth-provisioning-template",
  "schemaVersion": 1,
  "platformId": "platform-id",

  "requiredKeys": [
    {
      "type": "CLASS_HMAC_KEY",
      "keyId": "platform-class-01",
      "required": true
    },
    {
      "type": "SESSION_HMAC_KEY",
      "keyId": "platform-session-01",
      "required": true
    },
    {
      "type": "SIGNING_PUBLIC_KEY",
      "keyId": "teacher-signing-01",
      "required": true
    },
    {
      "type": "RECOVERY_PUBLIC_KEY",
      "keyId": "teacher-recovery-01",
      "required": false
    }
  ],

  "environment": "development",
  "productionProvisioned": false
}
```

---

## 27. VETORES DE TESTE

Criar `eduauth-test-vectors.json`.

Utilizar somente chaves de teste.

Incluir:

- contexto canônico;
- código-base esperado;
- faixa temporal;
- HMAC esperado;
- PIN esperado;
- código de sessão;
- expiração;
- checksum;
- exemplos inválidos.

Testes mínimos:

1. código coletivo válido;
2. código coletivo expirado;
3. código de outra turma;
4. código de outra aula;
5. código de outra plataforma;
6. código-base com erro de digitação;
7. checksum inválido;
8. código individual válido;
9. código individual de outra sessão;
10. código individual expirado;
11. código individual reutilizado;
12. cinco tentativas incorretas;
13. atualização da página;
14. encerramento da sessão;
15. diferença de relógio;
16. registro desconhecido;
17. versão incompatível;
18. ação não autorizada;
19. token assinado válido;
20. token assinado alterado.

---

## 28. RELATÓRIO DE INTEGRAÇÃO

Criar `eduauth-integration-report.md`.

O relatório deverá conter:

### Identificação

- plataforma;
- versão;
- repositório;
- data;
- versão do EduAuth.

### Senhas encontradas

- arquivo;
- linha;
- finalidade;
- risco;
- modalidade substituta.

### Ações integradas

- ação;
- contexto;
- modalidade;
- validade;
- quantidade de dígitos;
- comportamento autorizado.

### Código-base

- formato;
- tamanho;
- campos utilizados;
- forma de cópia;
- forma de digitação;
- QR Code opcional.

### Arquivos modificados

Listar todos.

### Testes executados

Apresentar resultados.

### Limitações

Explicar:

- ausência de backend;
- possibilidade de inspeção do frontend;
- limitação das chaves simétricas;
- limitação dos logs locais;
- diferença entre PIN operacional e autorização assinada.

### Pendências

Listar somente pendências reais.

---

## 29. CRITÉRIOS DE ACEITAÇÃO

A integração somente estará concluída quando:

- nenhuma senha fixa permanecer;
- nenhuma senha mestre estática permanecer;
- todas as ações protegidas estiverem mapeadas;
- cada ação possuir classificação de risco;
- cada ação possuir modalidade;
- o código-base aparecer na tela;
- o código-base puder ser copiado;
- o código-base puder ser digitado;
- o QR Code for opcional;
- liberar uma aula não exigir câmera;
- a mesma senha coletiva funcionar para a turma;
- códigos individuais forem vinculados à sessão;
- códigos individuais expirarem;
- códigos individuais forem consumidos;
- tentativas forem limitadas;
- o contexto utilizar UTC;
- o sistema funcionar no GitHub Pages;
- o sistema preservar o funcionamento offline;
- o manifest estiver completo;
- o registro de ações estiver completo;
- os vetores de teste forem reproduzíveis;
- o template de provisionamento estiver completo;
- nenhuma chave privada estiver no projeto;
- nenhuma chave de produção estiver nos vetores de teste.

---

## 30. FORMA DE ENTREGA

Não entregar apenas explicações ou pseudocódigo.

Executar a integração e apresentar:

1. diagnóstico do sistema atual;
2. senhas e autorizações encontradas;
3. classificação de risco;
4. arquitetura aplicada;
5. arquivos criados;
6. arquivos modificados;
7. código implementado;
8. componentes visuais;
9. código-base funcionando;
10. validação de PIN coletivo;
11. validação de PIN de sessão;
12. QR Code opcional;
13. testes executados;
14. limitações;
15. arquivos de retorno;
16. instruções para provisionamento de produção.

Ao final, apresentar:

```text
EDUAUTH PLATFORM INTEGRATION: VALID
```

Caso existam problemas:

```text
EDUAUTH PLATFORM INTEGRATION: INCOMPLETE
```

E listar exatamente as pendências.

---

## 31. RESULTADO ESPERADO

### Liberação de aula

Todos os alunos visualizam:

```text
Código-base:
EA1-C1-K01-8G4M-2D7K-P9W3
```

O professor pode:

- colar esse código no validador;
- digitar esse código;
- selecionar manualmente a aula;
- gerar a senha sem usar câmera.

O validador apresenta:

```text
Senha da turma:
4839 1726
```

### Autorização individual

O aluno visualiza:

```text
Código-base da sessão:
EA1-S1-K02-7K4P-9N6D-Q2MV-4B8R
```

O validador apresenta:

```text
Senha da sessão:
7304 1829
```

Essa senha funciona apenas:

- naquela sessão;
- naquela ação;
- naquele período;
- naquele recurso;
- uma única vez, quando configurado.

### Recuperação

A plataforma apresenta uma solicitação.

O professor autoriza a redefinição.

A senha antiga não é revelada.

O perfil recebe uma nova senha e mantém seus dados criptografados.

---

## 32. REGRA FINAL

Todas as plataformas deverão usar:

- o mesmo protocolo;
- o mesmo formato de código-base;
- o mesmo cálculo de horário;
- a mesma codificação;
- o mesmo checksum;
- a mesma serialização;
- o mesmo modelo de risco;
- o mesmo núcleo criptográfico;
- o mesmo formato de manifest;
- o mesmo formato de retorno.

As plataformas poderão possuir:

- identificadores diferentes;
- turmas diferentes;
- disciplinas diferentes;
- aulas diferentes;
- atividades diferentes;
- ações diferentes;
- chaves específicas;
- políticas específicas.

Nenhuma plataforma poderá criar um algoritmo próprio incompatível com o EduAuth Core.
