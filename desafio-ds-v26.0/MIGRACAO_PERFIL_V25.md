# Migração de perfil — v24 para v25

## Compatibilidade

A versão 25 mantém o schema principal de perfil 2.0.0 e acrescenta áreas opcionais:

- `acceptances.terms`;
- `permissions.history`;
- `platforms.desafio-ds.xpLedger` quando houver tentativa competitiva salva.

Perfis antigos continuam podendo ser desbloqueados.

## Primeiro acesso na v25

1. O perfil é desbloqueado normalmente.
2. O sistema verifica o termo 1.3.0.
3. O aluno realiza o aceite explícito.
4. O registro é salvo no perfil protegido.
5. Novas tentativas competitivas passam a gerar extrato de XP.

## Dados não alterados

- identidade;
- senha local;
- chave de dados do perfil;
- progresso do Modo Guiado;
- resultados anteriores;
- preferências de acessibilidade;
- histórico de exportações e recuperações.

## Reversão

Antes de publicar a nova versão, mantenha um backup do repositório e exporte um perfil de teste. Em caso de problema, a versão anterior pode ser republicada sem converter ou apagar o arquivo exportado.
