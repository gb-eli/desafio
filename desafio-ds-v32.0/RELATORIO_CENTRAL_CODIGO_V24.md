# Relatório — Central de Código por Aula

**Plataforma:** Desafio DS  
**Versão:** 24.0.0  
**Data:** 30/07/2026  
**Arquitetura:** aplicação totalmente front-end compatível com GitHub Pages

## Objetivo

Permitir que o estudante consulte exemplos coerentes com a aula sem sobrecarregar a interface principal. A Central de Código só aparece quando a aula possui material técnico aplicável.

## Recursos implementados

- botão contextual **Código e execução**;
- visualização dos arquivos do projeto;
- cópia de código;
- download de arquivo individual;
- geração do projeto completo em ZIP no próprio navegador;
- README incluído em cada projeto;
- prévia isolada para projetos web;
- botão para abrir o VS Code Web;
- comandos de instalação, execução e verificação;
- indicação de dependências obrigatórias e opcionais;
- perguntas frequentes;
- limitações e cuidados de segurança;
- registro local de abertura, cópia e download no progresso da aula;
- acesso adicional na etapa de conclusão.

## Cobertura curricular

| Disciplina | Aulas | Aulas com Central de Código |
|---|---:|---:|
| Introdução à Programação — 1º DS | 14 | 14 |
| Programação Front-End — 2º DS manhã | 12 | 12 |
| Programação Front-End — Técnico Subsequente | 12 | 12 |
| Programação Mobile — Técnico Subsequente | 14 | 14 |
| **Total** | **52** | **52** |

As demais aulas permanecem sem o botão quando não precisam de código.

## Exemplos incluídos

### Introdução à Programação

- pseudocódigo e Python;
- primeiro programa;
- variáveis e conversões;
- operadores;
- condições;
- laços;
- listas;
- funções e modularização;
- strings;
- JSON;
- classes;
- comparação entre Python, JavaScript, Java, C++ e C#;
- testes com `unittest`;
- projeto final modular.

### Programação Front-End

- projeto inicial com Git;
- HTML fundamental;
- HTML semântico;
- formulário e login responsivo;
- fundamentos do CSS;
- Box Model;
- Flexbox, Grid e media queries;
- JavaScript básico;
- condições, laços e funções;
- DOM e eventos;
- armazenamento e API simulada;
- projeto final e publicação.

### Programação Mobile

- login mobile-first;
- emulador e layout responsivo;
- zona do polegar e Lei de Fitts;
- Lei de Hick;
- navegação mobile;
- componentes responsivos;
- fluxo entre telas;
- compatibilidade e fallback;
- Android com Java;
- Android com Kotlin;
- Swift e SwiftUI;
- Rust com Cargo;
- PWA, API, cache e modo offline.

## Dependências e comandos

Os comandos aparecem apenas quando fazem sentido. Exemplos:

- `python main.py`;
- `python -m http.server 5500`;
- `git init`, `git add .` e `git commit`;
- `gradlew.bat assembleDebug`;
- `adb devices`;
- `swift main.swift`;
- `cargo check` e `cargo run`;
- `npx serve .` como alternativa opcional.

## Segurança e limitações

- nenhuma senha, token ou chave foi incluída nos projetos de exemplo;
- o gerador de ZIP não depende de serviço externo;
- projetos Android exigem Android Studio e Android SDK;
- SwiftUI/iOS exige Xcode em macOS;
- o VS Code Web não abre automaticamente arquivos locais;
- Service Worker exige localhost ou HTTPS;
- APIs externas podem falhar por indisponibilidade ou CORS;
- a prévia interna é isolada e não substitui o teste no ambiente real.

## Validação

- 88 aulas preservadas;
- 52 aulas técnicas vinculadas à Central;
- 36 recursos de código;
- 119 arquivos de exemplo;
- 126 comandos documentados;
- sintaxe JavaScript validada;
- arquivos Python compilados para validação sintática;
- JSON, XML e TOML analisados;
- geração e leitura de ZIP testadas;
- nenhuma chave privada EduAuth incluída no pacote público.

O navegador administrado do ambiente de construção bloqueou páginas locais e `127.0.0.1`, portanto a conferência visual final deve ser realizada na URL publicada do GitHub Pages.
