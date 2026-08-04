# Desafio DS v27.0 — 03/08/2026

## Modo Guiado

- Preservadas as 109 aulas da v26 com seus IDs originais.
- Adicionadas 12 aulas integradas, totalizando 121.
- Reorganização visual por unidades e sequência pedagógica.
- Exibição de tempo previsto, mínimo, plataformas e progresso por unidade.
- Evidência externa obrigatória somente nas aulas que realmente usam outra plataforma.
- Resultados importados passam a integrar os relatórios HTML e JSON.

## Ecossistema DS

- Integração assistida com Lab Virtual DS, Lab 3D/HoloMotion, CTF Cyber, GitHub e Fliperama DS.
- Formato `ds-evidence` v1 para importar resultados.
- Registro manual disponível quando a plataforma ainda não exportar o formato.
- Duplicidade de arquivo detectada por SHA-256 local.
- Fliperama DS permanece com link configurável pelo professor.

## Perfis e professor

- Botões separados para trocar usuário/turma e sair/bloquear.
- Auditoria docente permanece somente leitura.
- Manutenção avançada exige nova autorização assinada e afeta somente a aula selecionada.
- Conclusão antecipada continua vinculada à sessão, professor, motivo e tempo ativo.

## EduAuth

- Novo conjunto v27 compatível com todas as 121 aulas.
- Validador privado correspondente incluído apenas no pacote completo.
- Ação assinada `teacher-maintenance` adicionada.
- Nenhuma chave privada presente no ZIP público.

## Horário escolar

- Data e hora de `America/Sao_Paulo` exibidas no indicador.
- Manhã organizada em seis aulas; noite em cinco aulas.
- Tempo restante, intervalo e uso fora do turno continuam apenas informativos.

## Central de Código

- Vínculos antigos e novos aplicados também à lista de aulas realmente exibida no catálogo.
- 73 aulas com recurso contextual de código, projeto, comandos ou exemplos.
- 53 pacotes técnicos, 160 arquivos e 148 comandos documentados.
- Exemplos Python, JavaScript, JSON, XML, TOML e CSS validados estruturalmente.
