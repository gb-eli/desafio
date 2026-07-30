# Guia de perfis locais e recuperação — v21.0

## Perfil do aluno

Na tela inicial, o aluno pode:

- criar perfil;
- desbloquear um perfil existente;
- importar um backup;
- continuar sem salvar.

A senha é local e não deve ser igual à senha do Google, Classroom, e-mail ou GitHub.

## Expiração e bloqueio

- o perfil é bloqueado após aproximadamente 10 minutos de inatividade;
- o perfil expira seis dias após o último salvamento;
- a expiração remove o perfil deste navegador;
- o aluno deve exportar backup quando precisar continuar em outro equipamento.

## Backup

O botão **Backup** gera um arquivo `.edu-profile` criptografado. Para importar:

1. abra Perfis locais;
2. selecione Importar;
3. escolha o arquivo;
4. volte à aba Perfis;
5. desbloqueie usando a senha original.

## Configuração da recuperação administrativa

1. Abra Perfis locais → Recuperação.
2. Digite a senha do Modo Professor.
3. Crie uma frase-senha mestre forte.
4. Gere o arquivo `.ds-recovery-key`.
5. Guarde o arquivo fora do GitHub.
6. Faça uma segunda cópia de segurança.

A chave pública fica no navegador e pode proteger novos perfis. A chave privada permanece somente no arquivo baixado.

## Vincular um perfil já existente

1. Configure a chave administrativa.
2. Desbloqueie o perfil do aluno.
3. Abra Perfis locais.
4. Selecione **Vincular recuperação administrativa**.

## Redefinir a senha

1. Abra Recuperação.
2. Escolha o perfil.
3. Selecione o arquivo administrativo.
4. Digite a frase-senha mestre.
5. Defina uma nova senha local.
6. Teste a nova senha.

A operação preserva identidade, progresso, aulas e histórico.

## Limite importante

Sem o arquivo administrativo correto e a frase-senha mestre, a plataforma não consegue recuperar a senha. Não existe senha universal secreta.
