# Segurança do Desafio DS

## Arquitetura

A plataforma funciona totalmente no front-end e é publicada no GitHub Pages. Não existe servidor autoritativo.

## Controles implementados

- CSP restritiva sem `unsafe-eval`;
- scripts e bibliotecas locais;
- sanitização de textos, HTML e CSS de prévias;
- rejeição de URLs perigosas;
- validação de estruturas JSON e bloqueio de `__proto__`, `constructor` e `prototype`;
- tamanho máximo para importação de perfil;
- perfis criptografados em IndexedDB;
- EduAuth Offline para autorizações contextuais;
- extrato encadeado de XP com reconciliação;
- bloqueio de recompensas suspeitas;
- exportações com registro de aceite e integridade.

## Limitações honestas

Um usuário avançado com controle total do navegador pode alterar o ambiente em execução e recalcular proteções locais. Os controles têm a finalidade de dificultar adulterações simples, detectar incoerências, impedir recompensas válidas a partir de estados suspeitos e produzir evidências para revisão humana.

## Relato responsável

Ao encontrar uma falha:

1. interrompa a exploração;
2. registre módulo, etapa, navegador e dispositivo;
3. explique os passos para reproduzir;
4. não inclua senhas ou dados pessoais;
5. entregue o relatório ao professor.
