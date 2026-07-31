# Política de Privacidade em Linguagem Simples

## Dados utilizados

A plataforma utiliza somente informações necessárias para:

- identificar a atividade e a turma;
- preservar o progresso;
- gerar evidências;
- registrar autorizações e eventos técnicos;
- oferecer acessibilidade e continuidade local.

## Onde os dados ficam

Perfis protegidos são criptografados com Web Crypto API e armazenados em IndexedDB no navegador. Preferências visuais simples podem ser mantidas separadamente. O navegador e a política do equipamento controlam a permanência dos dados.

## O que não é coletado pelo projeto

- localização precisa;
- câmera ou microfone;
- reconhecimento facial ou biometria;
- endereço residencial;
- documentos pessoais;
- histórico externo de navegação;
- dados para publicidade.

## Senhas

Senhas locais não são guardadas em texto puro. O perfil utiliza PBKDF2 e AES-GCM. A recuperação administrativa redefine a senha sem revelar a senha antiga.

## Exportação e exclusão

O aluno pode exportar backup criptografado, importar em outro equipamento e excluir o perfil deste navegador. É recomendado manter cópias das evidências e do perfil.

## Serviços externos

Abrir Google Classroom, GitHub ou VS Code Web leva o aluno a outro serviço. A plataforma registra apenas a abertura necessária ao fluxo. Abrir o Classroom não confirma que a atividade foi entregue.

## Limitações

Uma aplicação totalmente front-end não possui servidor central para confirmar identidade, sincronizar dados ou garantir permanência absoluta. Um usuário com controle total do navegador pode manipular o ambiente; a plataforma busca detectar inconsistências e impedir que estados suspeitos gerem vantagens válidas.
