# Relatório de integração EduAuth Offline — Desafio DS v32.0

## Identificação

- Plataforma: Desafio DS
- Versão: 32.0.0
- Protocolo: EduAuth Offline 1.0
- Arquitetura: front-end estático para GitHub Pages
- Registro curricular: 121 IDs históricos e 114 aulas ativas
- Painel privado: `PAINEL_EDUAUTH_PROFESSOR_V32_0_ABRIR_AQUI`

## Fluxo normal do Modo Guiado

| Operação | Modalidade | Tamanho | Validade |
|---|---|---:|---:|
| Iniciar aula guiada | código coletivo da turma | 8 dígitos | até 1 hora |

O professor escolhe turma, disciplina e aula no painel privado. O aluno digita o código somente ao iniciar. Nenhuma etapa normal pede outro PIN, código-base ou validação docente.

## Contexto do código

O código é vinculado a:

- plataforma;
- turma;
- disciplina;
- aula;
- ação de início;
- minuto de emissão.

A verificação aceita códigos emitidos nos 60 minutos anteriores. Um código de outra turma, disciplina ou aula é rejeitado.

## Comprovantes e conclusão

Comprovantes externos são enviados pelo próprio aluno e entram no relatório final. A aula exige link do GitHub somente quando sua atividade determinar entrega de código. A conclusão depende das etapas, do tempo mínimo e dos comprovantes solicitados, sem autorização adicional do professor.

## Separação do pacote privado

- O pacote público contém somente o material necessário à verificação do código coletivo e à verificação de assinaturas administrativas legadas.
- A chave privada de assinatura permanece exclusivamente no painel do professor.
- O ZIP público não contém a pasta privada nem os arquivos de configuração do painel.

## Limitação técnica

Como a verificação coletiva funciona integralmente no navegador, ela não equivale a autenticação central com backend. O objetivo é evitar senha fixa, reduzir abertura fora de contexto e tornar a liberação da aula simples para o professor e os estudantes.

## Resultado

`EDUAUTH PLATFORM INTEGRATION: VALID — SIMPLIFIED CLASS FLOW`
