# Problemas Conhecidos e Limitações

- O navegador pode remover dados locais conforme espaço e política do equipamento.
- O suporte offline depende de uma primeira abertura bem-sucedida e do suporte a Service Worker.
- Classroom, GitHub e VS Code são serviços externos e exigem internet.
- A plataforma não confirma automaticamente a entrega no Classroom.
- A CSP mantém `style-src 'unsafe-inline'` para estilos de progresso e componentes existentes; scripts inline e `eval` continuam bloqueados.
- Um usuário com controle completo do navegador pode manipular o ambiente local; estados incoerentes são bloqueados ou marcados para revisão.
