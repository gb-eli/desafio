# Relatório Técnico — Desafio DS v29.0

## Base utilizada

Desafio DS v27.0, preservando 121 aulas e todos os identificadores de progresso.

## Alterações principais

- painel consolidado da disciplina;
- indicador de progresso, tempo e evidências;
- explicação do papel pedagógico de cada plataforma;
- informações da aula em camadas recolhíveis;
- ação atual destacada em todas as etapas;
- rastreamento de segmentos de sessão;
- relatório consolidado em PDF por impressão, HTML e JSON;
- registro de explicações, ferramentas, evidências e eventos;
- botão rápido de relatório dentro da aula;
- ajuste responsivo do botão Retomar;
- EduAuth e manifests atualizados para v28.

## Preservação

- aulas anteriores: 121;
- aulas atuais: 121;
- IDs únicos: 121;
- aulas anteriores ausentes: 0;
- disciplinas: 7;
- turmas: 4.

## Central de Código

- aulas atendidas: 73;
- pacotes técnicos: 53;
- arquivos únicos: 160;
- comandos únicos documentados: 148.

## Segurança

- CSP sem `unsafe-eval`;
- scripts locais;
- nenhuma chave privada no pacote público;
- valores inseridos no relatório são escapados;
- relatório sem handlers HTML inline;
- PIN coletivo de oito dígitos;
- PIN individual de dez dígitos e uso único;
- perfis mantidos em IndexedDB com Web Crypto;
- aplicação continua sem backend.

## Testes visuais

Foram renderizados cenários representativos em:

- 1366 × 1000;
- 1024 × 900;
- 390 × 844.

O catálogo e a tela interna não apresentaram rolagem horizontal. Os botões principais no celular mantiveram altura aproximada de 42 a 45 pixels.

## Limitação do ambiente

A política administrativa do Chromium disponível bloqueia navegação local em `127.0.0.1`. Os testes visuais foram realizados com `page.set_content`, utilizando o CSS e a estrutura real dos componentes. A conferência final de IndexedDB, service worker e impressão deve ocorrer na URL HTTPS publicada no GitHub Pages.
