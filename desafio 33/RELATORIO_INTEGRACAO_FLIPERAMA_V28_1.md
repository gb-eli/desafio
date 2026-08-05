# Relatório de integração — Fliperama DS — v28.1

## Endereço configurado

`https://gb-eli.github.io/Fliperama-DS/fliperama-ds-v0.21.0/index.html`

## Pontos atualizados

- catálogo pedagógico das aulas (`js/ecosystem.js`);
- catálogo público do ecossistema (`tool-ecosystem.json`);
- catálogo visual em Ajuda → Ferramentas (`js/platform-shell.js`);
- documentação de configuração;
- problemas conhecidos;
- cache offline e versão dos recursos.

## Aulas que utilizam o Fliperama DS

- 1º DS — Introdução à Programação — lógica e física de jogos;
- 2º DS — Front-End — auditoria de interface Web;
- 2º DS — Front-End — auditoria do Lab Virtual e Fliperama DS;
- 3º DS — Programação no DS — física e animação 2D.

## Fluxo do aluno

1. O professor libera a aula pelo EduAuth.
2. O aluno lê o objetivo e o roteiro.
3. Seleciona **Abrir ferramenta**.
4. O Fliperama DS abre em nova guia.
5. O aluno realiza o teste indicado.
6. Retorna ao Desafio DS.
7. Registra ou importa a evidência.
8. O resultado aparece no relatório consolidado.

## Segurança e limitações

- a abertura usa nova guia com `noopener` e `noreferrer`;
- não existe leitura direta do armazenamento da outra plataforma;
- a integração usa evidência declarada/importada;
- nenhuma chave EduAuth foi alterada;
- nenhuma aula ou progresso foi modificado;
- o ambiente de construção não conseguiu consultar externamente a URL por restrição de rede, portanto a conferência HTTP final deve ocorrer após a publicação.
