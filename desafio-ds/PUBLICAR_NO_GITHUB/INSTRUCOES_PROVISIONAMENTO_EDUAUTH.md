# Provisionamento EduAuth para produção

A versão 22.0 conclui a integração estrutural, mas utiliza chaves de desenvolvimento.

Antes do uso real:

1. Gere uma chave HMAC coletiva exclusiva do Desafio DS.
2. Gere uma chave HMAC de sessão separada.
3. Gere um par ECDSA P-256 para autorizações assinadas.
4. Mantenha a chave privada somente no EduAuth Professor.
5. Exporte para a plataforma somente:
   - as chaves HMAC operacionais necessárias ao front-end;
   - a chave pública ECDSA;
   - IDs e versões das chaves.
6. Substitua `js/eduauth/config.js` por uma configuração de produção.
7. Defina `environment: "production"`.
8. Defina `productionProvisioned: true`.
9. Execute os vetores com chaves de teste separadas das chaves de produção.
10. Gere novo ZIP público e confirme que nenhuma chave privada foi incluída.

O material simétrico no navegador continua extraível por um usuário avançado. Esse limite é inerente ao funcionamento totalmente front-end.
