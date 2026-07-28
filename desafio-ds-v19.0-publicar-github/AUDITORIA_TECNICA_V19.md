# Auditoria técnica — Desafio DS v19.0

## Escopo

A versão v19.0 preserva o Desafio DS v18.1 e adiciona o Modo Guiado como experiência paralela.

## Verificações realizadas

- sintaxe de todos os arquivos JavaScript validada com `node --check`;
- 86 aulas carregadas no banco;
- identificadores de aula únicos;
- códigos com 3 a 5 caracteres no guia privado;
- 86 códigos convertidos para SHA-256 no banco público;
- ausência de códigos em texto puro no banco público;
- senha docente armazenada somente como hash no projeto publicado;
- 156 identificadores HTML analisados sem duplicidade;
- referências estáticas conferidas;
- turmas e disciplinas conferidas;
- tempo mínimo configurado em 1.500 segundos ativos;
- avisos de inatividade configurados em 180, 240 e 300 segundos;
- quarta ocorrência configurada para encerrar a sessão;
- exportação HTML e JSON implementada;
- link do Google Classroom implementado;
- layout responsivo incluído para celular, tablet e computador.

## Trilhas

- Introdução à Programação: 14 aulas;
- Análise e Método para Sistemas: 16 aulas;
- Programação Front-End — 2º DS: 12 aulas;
- Inovação Tecnológica e Empreendedorismo: 10 aulas;
- Programação no Desenvolvimento de Sistemas: 10 aulas;
- Programação Front-End — Subsequente: 12 aulas;
- Programação Mobile I: 12 aulas.

## Segurança e privacidade

- o Modo Guiado não registra cada tecla digitada;
- são registrados eventos pedagógicos, etapas, ferramentas, trocas de aba e inatividade;
- recursos de apoio são registrados como preferências funcionais;
- o relatório comum não precisa expor diagnóstico;
- códigos das aulas não ficam em texto puro no banco publicado;
- o guia com códigos permanece fora da pasta de publicação.

## Limitações

### Hospedagem estática

O GitHub Pages não oferece autenticação segura, banco de dados central ou segredo de servidor. Um usuário que controla o dispositivo ainda pode estudar a lógica em execução.

### Progresso

O progresso utiliza `localStorage`. Trocar de navegador, aparelho ou limpar dados pode remover a continuidade.

### Google Classroom

O botão abre o Classroom, mas a aplicação não confirma o envio sem integração autenticada com a API.

### Teste visual automatizado

O ambiente de construção utilizado bloqueia navegação local no Chromium por política administrativa. Foram executadas validações estáticas, estruturais e de sintaxe. Recomenda-se uma conferência visual final após a publicação de teste no GitHub Pages.
