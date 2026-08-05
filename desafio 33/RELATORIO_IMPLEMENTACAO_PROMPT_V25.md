# Relatório de implementação — Desafio DS v25.0.0

## Referência

Atualização orientada pelo **Prompt Mestre — Revisão de Laboratórios Educacionais, Segurança Front-End, Loja, Carteira, Personagens e Créditos v1.3**.

## Diagnóstico inicial

A versão 24 já possuía:

- 88 aulas no Modo Guiado;
- Central de Código em 52 aulas;
- perfis locais criptografados;
- EduAuth Offline;
- exportação de evidências;
- integração assistida com Classroom;
- responsividade e recursos de acessibilidade;
- modos competitivo e diagnóstico completo.

A auditoria identificou como pontos aplicáveis:

- ausência de aceite obrigatório e versionado;
- documentação de privacidade e simulações ainda dispersa;
- necessidade de reforçar sanitização de importações e URLs;
- XP mantido também como valor direto no estado da partida;
- ausência de extrato específico de XP com valores disponível, em análise e bloqueado;
- cache offline incompleto para alguns módulos;
- eventos comuns de copiar, colar e botão direito tratados de forma excessivamente punitiva.

## Funcionalidades implementadas

### Termo e compromisso pedagógico

- fluxo obrigatório antes de novas atividades;
- resumo em linguagem simples;
- termo completo em 16 seções;
- política de privacidade;
- aviso de simulações fictícias;
- duas confirmações explícitas e não pré-marcadas;
- versão, hash, data, fuso e identificador do aceite;
- persistência no perfil criptografado e fallback de sessão;
- novo aceite quando a versão do termo mudar;
- exportação do registro nas evidências;
- acesso a Perfis e backup antes do aceite.

### Permissões contextuais

- manifesto versionado;
- explicação antes de copiar, importar, baixar, solicitar armazenamento persistente ou tela cheia;
- finalidade, dados utilizados, processamento, armazenamento, alternativa e revogação;
- nenhuma solicitação de câmera, microfone ou localização nesta plataforma;
- decisões registradas somente quando houver perfil desbloqueado.

### Segurança de entrada e importação

- validação de tamanho e profundidade;
- rejeição de `__proto__`, `constructor` e `prototype`;
- bloqueio de esquemas de URL perigosos;
- sanitização da prévia HTML;
- ausência de `eval` e `new Function`;
- CSP sem `unsafe-eval`;
- importação de perfil validada antes do processamento.

### Extrato de XP

- fonte de verdade baseada em transações;
- sequência e `previousHash`;
- nonce e hash por transação;
- XP disponível, em análise e bloqueado;
- reconciliação antes de exibir resultados;
- recompensas incompatíveis colocadas em análise;
- bloqueio de inconsistências sem definir punição pedagógica automática;
- XP explicitamente separado de nota e proficiência.

### Experiência, acessibilidade e offline

- aviso rápido de atualização, fechável e exibido uma vez por versão;
- eventos comuns de copiar, colar e botão direito deixaram de causar eliminação automática;
- service worker com 42 recursos essenciais;
- manifesto PWA;
- termos e extrato responsivos;
- lembrete escolar reposicionado no celular;
- funcionamento por teclado e redução de movimento preservados.

## Recursos reaproveitados

- perfis criptografados e recuperação administrativa;
- EduAuth coletivo, individual e assinado;
- Central de Entrega;
- Modo Guiado e todas as aulas;
- Central de Código;
- diagnóstico com amostra mínima;
- modo competitivo com vidas, dicas, pulos e carta extra;
- relatório pedagógico;
- horários escolares;
- créditos e histórico de versões.

## Recursos não aplicáveis

### Loja e inventário

A plataforma não possuía loja, compras, itens comercializáveis ou inventário persistente. Não foi criada uma loja artificial. Foram aplicadas somente as regras relacionadas a XP e recompensas educacionais.

### Permissões sensíveis

O Desafio DS não necessita de câmera, microfone, localização, Bluetooth, USB ou sensores para seus fluxos atuais. Essas permissões não foram adicionadas.

### Feedbacks de outros laboratórios

Os relatos específicos de Lab Virtual DS, HoloMotion, CTF, VoxelCraft e outros projetos não foram aplicados ao Desafio DS, porque pertencem a códigos diferentes.

## Integrações reais

- IndexedDB;
- Web Crypto API;
- Cache API e Service Worker;
- downloads locais;
- exportação de perfil e evidências;
- abertura de Classroom, GitHub e VS Code por links configurados;
- EduAuth Offline.

## Integrações assistidas

- o aluno ainda precisa anexar e confirmar a entrega no Classroom;
- GitHub e VS Code são abertos por links e tutoriais;
- o status externo não é confirmado automaticamente.

## Recursos que exigiriam backend

- confirmação automática de entrega no Classroom;
- sincronização de perfil entre dispositivos sem arquivo;
- auditoria central inviolável;
- ranking central confiável;
- revogação instantânea e central de autorizações;
- carteira ou saldo com autoridade externa.

## Modelo de dados

- perfil: schema 2.0.0;
- termo: 1.3.0;
- permissões: 1.0.0;
- extrato XP: 1.0.0;
- plataforma: 25.0.0.

## Limitação de segurança

O projeto permanece integralmente no front-end. Um usuário com controle total do navegador pode modificar o ambiente em execução. As proteções reduzem adulterações simples, detectam inconsistências e evitam premiar estados incoerentes, mas não equivalem a um servidor autoritativo.
