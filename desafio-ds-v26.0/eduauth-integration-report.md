# RELATÓRIO DE INTEGRAÇÃO EDUAUTH OFFLINE — DESAFIO DS v26.0

## 1. Identificação

- Plataforma: Desafio DS
- Versão: 26.0.0
- Protocolo: EduAuth Offline 1.0
- Data da revisão: 31/07/2026
- Arquitetura: aplicação totalmente front-end
- Hospedagem: GitHub Pages
- Funcionamento offline: preservado conforme os recursos já carregados pelo navegador
- Estado: configuração operacional específica desta versão
- Validador do professor: separado da pasta pública

## 2. Autorizações integradas

| Operação | Risco | Modalidade |
|---|---|---|
| Iniciar o Desafio DS | baixo | `CLASS_SHARED_PIN` |
| Iniciar o Modo Prova | médio | `SESSION_SCOPED_PIN` |
| Liberar uma aula do Modo Guiado | baixo | `CLASS_SHARED_PIN` |
| Autorizar conclusão antecipada | alto | `SESSION_SCOPED_PIN` de 10 dígitos |
| Liberar continuação da prova | alto | `SESSION_SCOPED_PIN` de 10 dígitos |
| Abrir auditoria docente | crítico | `SIGNED_GRANT` |
| Abrir recuperação de perfil | crítico | `SIGNED_GRANT` |
| Redefinir senha de perfil | crítico | `SIGNED_GRANT` e envelope criptográfico |

Não permanecem no fluxo público senhas fixas de início, senha docente universal ou códigos permanentes das aulas.

## 3. Arquitetura operacional

### PIN coletivo

- oito dígitos;
- vinculado à plataforma, turma, disciplina, aula, ação e faixa UTC;
- janela padrão de 15 minutos;
- pode ser informado para todos os estudantes da mesma turma e contexto;
- QR Code opcional.

### PIN individual

- oito ou dez dígitos conforme o risco;
- vinculado à solicitação, sessão, recurso e ação;
- validade curta;
- uso único;
- nova solicitação invalida a anterior;
- cinco tentativas com atraso progressivo.

### Autorização assinada

- ECDSA P-256 com SHA-256;
- site público contém somente a chave pública;
- chave privada permanece no Validador EduAuth Professor;
- token vinculado ao recurso e à ação específica.

### Recuperação de perfil

A recuperação não revela a senha antiga. A chave de dados do perfil é recuperada por envelope criptográfico, protegida novamente com a nova senha e o progresso é preservado.

## 4. Código-base

- prefixo `EA1`;
- Base32 Crockford;
- checksum CRC32C;
- indiferente a maiúsculas e minúsculas;
- hífens e espaços ignorados;
- pode ser copiado ou digitado;
- QR Code disponível somente como alternativa.

## 5. Segurança e limitações

- nenhuma chave privada está no ZIP público;
- nenhum arquivo privado está dentro da pasta de publicação;
- o material HMAC necessário à verificação offline está no frontend;
- um usuário tecnicamente avançado pode inspecionar esse material;
- portanto, o mecanismo oferece proteção operacional, rotação, contexto e redução de compartilhamento casual, mas não equivale a autenticação com backend;
- logs locais são verificáveis dentro das limitações do navegador, mas não constituem auditoria central inviolável.

## 6. Revisão curricular integrada

A versão 26 preserva integralmente as 88 aulas anteriores e inclui 21 novas aulas no final das disciplinas existentes. O Modo Guiado passa a possuir 109 aulas.

As novas aulas utilizam os mesmos controles EduAuth de liberação das demais aulas. Foram acrescentados mini laboratórios de binário, Cifra de César, hash, codificação, XSS, armazenamento, permissões, requisitos de segurança, incidentes, API e código seguro, além de auditoria de sistemas com MVP e feedback.

## 7. Arquivos de retorno

- `eduauth-platform-manifest.json`;
- `eduauth-action-registry.json`;
- `eduauth-test-vectors.json`;
- `eduauth-provisioning-template.json`;
- `eduauth-integration-report.md`.

## 8. Testes

Foram executados:

- sintaxe JavaScript pública e privada;
- referências de arquivos;
- IDs HTML;
- integridade do CSS;
- contagem e IDs das 109 aulas;
- cobertura curricular das três disciplinas revisadas;
- correspondência das chaves públicas e privadas;
- ausência de chave privada no pacote público;
- vetores de PIN e assinatura;
- execução dos simuladores em Chromium empacotado em memória;
- largura de 1366 px e 390 px sem estouro horizontal.

A política administrativa do ambiente bloqueou navegação direta por `file://` e servidor HTTP local. A aplicação foi executada no Chromium por empacotamento em memória para validação visual e funcional dos componentes.

## 9. Resultado

`EDUAUTH PLATFORM INTEGRATION: VALID`
