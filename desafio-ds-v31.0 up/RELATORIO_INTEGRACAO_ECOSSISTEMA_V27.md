# Relatório de Integração do Ecossistema DS — v27.0

## Resultado

- 109 aulas anteriores preservadas.
- 12 novas aulas integradas.
- 121 aulas no total.
- Importação e registro de evidência externa implementados.
- Conclusão bloqueada quando a evidência obrigatória estiver ausente.
- Resultados externos incluídos nos relatórios HTML e JSON.

## Plataformas configuradas

| Plataforma | Situação | Integração |
|---|---|---|
| Lab Virtual DS | disponível | abertura em nova guia + evidência |
| Lab 3D / HoloMotion | disponível | abertura em nova guia + evidência |
| CTF Cyber | disponível | abertura autorizada + evidência e orientação ética |
| GitHub | disponível | repositório, Pages e link registrado |
| Fliperama DS | histórico: link pendente na v27 | resolvido na v28.1 com URL oficial |
| Desafio DS | plataforma atual | resultado interno e consolidação |

## Segurança

- URLs aceitas somente em HTTP/HTTPS.
- Arquivos limitados a 2,5 MB.
- JSON validado com limites de profundidade e chaves quando o sanitizador está disponível.
- Arquivos duplicados são detectados por SHA-256 local.
- Nenhum resultado externo concede nota automaticamente.
- A evidência pode exigir revisão do professor.

## Limitação front-end

Sites publicados em origens diferentes não compartilham IndexedDB ou localStorage. Portanto, a integração usa exportação/importação explícita, sem simular sincronização inexistente.
