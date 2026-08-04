# Problemas conhecidos — v32.0

- A sincronização automática entre dispositivos continua indisponível sem backend. O aluno deve exportar o backup antes de trocar de equipamento.
- Integrações hospedadas em origens diferentes usam arquivo, link ou registro contextual; uma plataforma não pode ler diretamente o IndexedDB de outra origem.
- O Google Classroom abre a turma correta por disciplina, mas não confirma a entrega e não publica comentários automaticamente.
- Quando a senha coletiva expira, o estudante deve solicitar uma nova senha nos comentários da atividade no Classroom.
- Algumas ferramentas externas exigem internet e podem não abrir durante indisponibilidade da rede escolar. A aula deve oferecer alternativa interna ou registro manual.
- C, C++, Java, C# e Assembly dependem de compiladores ou ambientes disponíveis no equipamento. As aulas mantêm leitura de código e análise como alternativa.
- O suporte offline depende de uma primeira abertura bem-sucedida em HTTPS e do suporte a Service Worker.
- O código coletivo EduAuth é calculado offline, vale por uma hora e não substitui a autoridade de um backend institucional.
- O Chromium administrado do ambiente de desenvolvimento bloqueou a abertura completa por endereço local. A responsividade das novas camadas foi validada em uma estrutura representativa com o CSS real; o fluxo final deve ser conferido na URL HTTPS publicada.
