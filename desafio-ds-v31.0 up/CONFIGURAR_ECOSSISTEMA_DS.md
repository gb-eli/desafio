# Configuração do Ecossistema DS — v29.0

A plataforma funciona integralmente no front-end. O Desafio DS não consegue ler diretamente o IndexedDB ou o `localStorage` de outro domínio do GitHub Pages.

## Integração utilizada

1. A aula apresenta um roteiro para a ferramenta relacionada.
2. O aluno abre a ferramenta em nova guia.
3. Realiza a atividade indicada.
4. Retorna ao Modo Guiado e registra ou importa a evidência.
5. O relatório final consolida o resultado vinculado à aula.

## Links configurados

- Lab Virtual DS
- Lab 3D / HoloMotion
- CTF Cyber
- Fliperama DS: `https://gb-eli.github.io/Fliperama-DS/fliperama-ds-v0.21.0/index.html`
- GitHub

O Fliperama DS está marcado como `available` em:

- `js/ecosystem.js`;
- `tool-ecosystem.json`;
- catálogo de ferramentas da área Ajuda e informações.

## Segurança da abertura

A ferramenta abre em nova guia usando `noopener` e `noreferrer`. O progresso da aula permanece salvo no Desafio DS.

## Formato de evidência

```json
{
  "schema": "ds-evidence",
  "schemaVersion": 1,
  "platform": {"id": "fliperama-ds", "name": "Fliperama DS"},
  "activity": {"id": "atividade", "title": "Título"},
  "result": {"status": "completed", "summary": "Jogo testado, comportamento observado e melhoria proposta"},
  "generatedAt": "2026-08-03T16:47:00-03:00"
}
```

O arquivo não deve conter senhas, tokens, documentos pessoais ou dados de outros alunos.
