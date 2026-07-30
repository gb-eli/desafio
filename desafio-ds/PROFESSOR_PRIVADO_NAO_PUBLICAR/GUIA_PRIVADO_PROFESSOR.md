# GUIA PRIVADO DO PROFESSOR — DESAFIO DS v22.0

## Mudança principal

As senhas fixas e os 88 códigos permanentes das aulas foram removidos. A plataforma usa o EduAuth Offline.

## Ambiente entregue

O pacote contém um Validador EduAuth Professor de **desenvolvimento** em `EDUAUTH_PROFESSOR_DESENVOLVIMENTO`. Ele permite testar PIN coletivo, PIN individual e autorização assinada.

**Não use as chaves de desenvolvimento em aula real e não publique esta pasta.**

## Fluxo

1. O aluno solicita a autorização na plataforma.
2. A plataforma mostra um código-base `EA1-...`.
3. Cole o código no validador privado.
4. Confira turma, disciplina, aula e ação.
5. Gere a senha temporária ou autorização assinada.
6. Informe o resultado ao aluno.

## Produção

Antes do uso real, construa/provisione o EduAuth Professor com chaves de produção, substitua a configuração pública de desenvolvimento e publique nova versão. Nenhuma chave privada deve ir ao GitHub.
