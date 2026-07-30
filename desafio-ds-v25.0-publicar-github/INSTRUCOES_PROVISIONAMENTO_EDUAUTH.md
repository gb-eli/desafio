# EduAuth Offline — Estado da v24.0

A versão 23.0 foi provisionada para uso operacional em frontend estático.

- Chaves HMAC específicas desta versão estão no frontend porque a validação é offline.
- A chave privada de assinatura está somente no validador privado do professor.
- Não publique a pasta `PROFESSOR_PRIVADO_NAO_PUBLICAR`.
- Para trocar as chaves, gere novo pacote e altere a versão.

## Limitação

A proteção é operacional. Como o navegador recebe o código JavaScript e as chaves simétricas de verificação, um usuário avançado pode inspecionar o material. Ações críticas usam autorização assinada, cuja chave privada não está no site público.
