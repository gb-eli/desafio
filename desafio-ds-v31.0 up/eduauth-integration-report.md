# Relatório de Integração EduAuth Offline — Desafio DS v28.0

## Identificação

- Plataforma: Desafio DS
- Versão: 27.0.0
- Protocolo: EduAuth Offline 1.0
- Data: 03/08/2026
- Arquitetura: totalmente front-end e GitHub Pages
- Aulas registradas: 121 aulas guiadas, além dos recursos gerais
- Validador privado: `EDUAUTH_PROFESSOR_V28_PRIVADO`

## Autorizações

| Operação | Risco | Modalidade | Validade |
|---|---|---|---:|
| Iniciar Desafio DS | baixo | PIN coletivo de 8 dígitos | 15 min |
| Iniciar Modo Prova | médio | PIN individual de 8 dígitos | 5 min |
| Abrir aula guiada | baixo | PIN coletivo de 8 dígitos | 15 min |
| Conclusão antecipada | alto | PIN individual de 10 dígitos | 3 min |
| Continuar prova após bloqueio | alto | PIN individual de 10 dígitos | 3 min |
| Auditoria docente | crítico | autorização assinada | 2 min |
| Recuperação de perfil | crítico | autorização assinada + envelope | 2 min |
| Manutenção individual de aula | crítico | autorização assinada | 3 min |

A manutenção docente não cria acesso mestre global. Ela permite somente desbloquear ou reiniciar a aula selecionada no perfil atual.

## Registro e chaves

- Todos os 121 IDs de aula estão no registro v28.
- O ZIP público contém apenas a chave pública de assinatura.
- A chave privada ECDSA P-256 está exclusivamente no pacote privado.
- As chaves HMAC coletiva e de sessão são específicas da versão v28.
- O validador antigo não é compatível com os códigos v28.

## Código-base

- Prefixo `EA1`;
- Base32 Crockford;
- checksum CRC32C;
- PIN coletivo vinculado a turma, disciplina, aula, ação e janela UTC;
- PIN individual vinculado também à sessão, solicitação e recurso;
- QR Code opcional;
- copiar e colar continua sendo o fluxo principal.

## Limitações honestas

Como o sistema funciona no navegador, o material HMAC necessário à verificação offline pode ser inspecionado por usuário avançado. O protocolo reduz senhas fixas, compartilhamento casual e autorizações fora de contexto, mas não equivale a autenticação central com backend. Logs e autorizações permanecem locais.

## Resultado

`EDUAUTH PLATFORM INTEGRATION: VALID`
