# Relatório Técnico — Desafio DS v27.0

**Data:** 03/08/2026  
**Base analisada:** `desafio-main(3).zip`  
**Versão identificada na base:** v26.0  
**Arquitetura:** aplicação estática, front-end, GitHub Pages e funcionamento offline progressivo

## 1. Diagnóstico da versão recebida

A versão enviada continha 109 aulas no Modo Guiado e os recursos acumulados das versões anteriores. A auditoria encontrou dois pontos críticos antes do uso em sala:

1. o pacote completo carregava um Validador EduAuth privado de versão anterior, sem correspondência integral com as aulas atuais;
2. a Central de Código possuía os materiais, mas parte dos vínculos era aplicada somente ao vetor técnico agregado e não aos objetos de aula exibidos no catálogo.

Os dois pontos foram corrigidos na v27.

## 2. Preservação e migração

- 109 IDs de aulas da v26 preservados;
- títulos, objetivos, explicações, práticas e desafios anteriores mantidos;
- nenhuma aula antiga removida;
- progresso continua associado ao mesmo `lesson.id`;
- nova ordem visual definida por `unitId`, `unitTitle` e `sequence`;
- 12 aulas novas adicionadas sem reutilizar IDs existentes.

## 3. Organização curricular

| Disciplina | Total v27 |
|---|---:|
| 1º DS — Introdução à Programação | 19 |
| 1º DS — Análise e Método para Sistemas | 20 |
| 2º DS — Programação Front-End | 17 |
| 2º DS — Inovação e Empreendedorismo | 14 |
| 3º DS — Programação no DS | 16 |
| 2º DS Subsequente — Front-End | 16 |
| 2º DS Subsequente — Programação Mobile | 19 |
| **Total** | **121** |

As aulas foram agrupadas em unidades progressivas, mantendo o número histórico e exibindo uma sequência pedagógica própria.

## 4. Novas integrações

- Lab Virtual DS;
- Lab 3D / HoloMotion;
- CTF Cyber;
- Fliperama DS, com link configurável;
- GitHub e GitHub Pages;
- consolidação de resultados no Desafio DS.

A integração utiliza o schema `ds-evidence` v1, importação de JSON, registro manual e hash SHA-256 local. Evidências obrigatórias impedem a conclusão apenas nas aulas em que a plataforma externa faz parte do roteiro.

## 5. Central de Código

- 73 aulas vinculadas;
- 53 pacotes técnicos;
- 160 arquivos de exemplo;
- 148 comandos documentados;
- cópia e download de arquivos;
- ZIP criado no navegador;
- prévia isolada para projetos Web;
- comandos, dependências, FAQ e limitações sob demanda.

Foram validados 19 arquivos Python, 33 JavaScript, 3 JSON/Webmanifest, 2 XML, 1 TOML e 24 CSS.

## 6. Perfis

A interface apresenta ações distintas para:

- trocar usuário ou turma;
- sair e bloquear;
- exportar e importar backup;
- excluir o perfil selecionado;
- recuperar acesso com autorização docente;
- executar manutenção somente sobre a aula escolhida.

Não foi criado um desbloqueio global permanente.

## 7. EduAuth v27

- 121 aulas guiadas registradas;
- 125 recursos totais no registro, incluindo modos gerais;
- PIN coletivo de oito dígitos;
- PIN individual de dez dígitos e uso único;
- ação assinada `teacher-maintenance`;
- chaves HMAC públicas compatíveis com o validador offline;
- chave ECDSA privada somente no pacote do professor;
- configuração marcada como provisionada para produção.

Resultado: `EDUAUTH PLATFORM INTEGRATION: VALID`.

## 8. Horário escolar

Fuso: `America/Sao_Paulo`.

- manhã: seis aulas e intervalo;
- noite: cinco aulas e intervalo;
- data, hora, período atual e minutos restantes;
- horário escolar, tempo mínimo da atividade e prazo do Classroom tratados como informações diferentes.

## 9. Testes executados

- 38 verificações finais aprovadas;
- sintaxe de 46 arquivos JavaScript públicos/privados;
- leitura de 21 arquivos JSON;
- preservação dos 109 IDs antigos;
- 121 IDs únicos;
- sequência completa por disciplina;
- tempos mínimos e previstos;
- referências de ferramentas e URLs;
- referências HTML e cache offline;
- PIN coletivo, PIN individual e uso único;
- correspondência entre chave pública e validador privado;
- ausência das antigas senhas fixas;
- ausência de chave privada no pacote público;
- harness visual em 1366×900, 1024×768 e 390×844 sem estouro horizontal.

## 10. Limitações honestas

- o Chromium administrado do ambiente bloqueou `127.0.0.1`, impedindo o teste HTTP completo da aplicação neste ambiente;
- a conferência visual foi realizada em harness com os componentes e CSS reais;
- sites de diferentes origens não compartilham IndexedDB ou `localStorage`;
- abrir o Classroom não comprova entrega;
- o link do Fliperama DS deve ser configurado quando a publicação definitiva estiver disponível;
- mecanismos offline no navegador não equivalem à autoridade de um backend.

## 11. Publicação

Publicar somente o conteúdo do ZIP público. Guardar o pacote completo e o Validador EduAuth privado fora do repositório. Após publicar em HTTPS, testar em janela anônima:

1. aceite dos termos;
2. criação e desbloqueio de perfil;
3. liberação coletiva de uma aula;
4. conclusão antecipada individual;
5. Central de Código;
6. importação de evidência;
7. exportação final;
8. atualização offline após o primeiro carregamento.
