# Relatório de integração EduAuth Offline — Desafio DS v33.0 piloto

## Identificação

- Plataforma: Desafio DS
- Versão: 33.0.0 piloto
- Protocolo: EduAuth Offline 1.0
- Arquitetura: front-end estático para GitHub Pages
- Registro curricular: 121 IDs históricos, 114 aulas ativas e 21 pilotos
- Painel privado: `PAINEL_EDUAUTH_PROFESSOR_V33_0_PILOTO_ABRIR_AQUI`

## Fluxo normal

| Operação | Modalidade | Tamanho | Validade |
|---|---|---:|---:|
| Iniciar aula guiada | código coletivo da turma | 8 dígitos | até 1 hora |

O professor escolhe turma, disciplina e aula. O estudante informa o código somente no início. As etapas pedagógicas, práticas, simuladores, fixação e conclusão não solicitam outro código.

## Contexto do código

O código é vinculado à plataforma, turma, disciplina, aula, ação de início e janela de tempo. Um código de outra turma, disciplina ou aula é rejeitado.

## Piloto v33

- títulos dos 21 pilotos sincronizados entre plataforma e painel;
- os 93 registros não piloto continuam compatíveis;
- nenhuma mudança nas chaves de produção foi necessária;
- progresso e IDs históricos permanecem preservados.

## Separação do pacote privado

O ZIP público contém somente material de verificação. A chave privada de assinatura e a configuração do professor permanecem exclusivamente no painel privado.

## Limitação

A verificação ocorre no navegador e não equivale a autenticação central com backend. Seu objetivo é permitir liberação simples, contextual e sem senha fixa.

## Resultado

`EDUAUTH PLATFORM INTEGRATION: VALID — V33 PILOT`
