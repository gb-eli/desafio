# Problemas conhecidos — v33.0 piloto

- A v33.0 é um piloto pedagógico: 21 aulas usam o novo padrão e 93 permanecem no padrão v32 para comparação.
- A sincronização automática entre dispositivos continua indisponível sem backend. O aluno deve exportar o backup antes de trocar de equipamento.
- O Google Classroom abre a turma correspondente, mas não confirma a entrega e não publica comentários automaticamente.
- Quando o código coletivo expira, o estudante deve solicitar uma nova senha nos comentários da atividade no Classroom.
- Linguagens compiladas dependem do compilador disponível no equipamento. O piloto oferece simulação, código, comandos e alternativa de leitura/teste.
- Simuladores internos são educacionais e não substituem integralmente um runtime ou compilador profissional.
- O suporte offline depende de primeira abertura bem-sucedida em HTTPS e de suporte a Service Worker.
- O navegador Chromium administrado do ambiente de desenvolvimento não concluiu o teste interativo local. Foram geradas quatro renderizações estáticas responsivas; clique, IndexedDB, PDF, download e Service Worker precisam de conferência na URL HTTPS.
