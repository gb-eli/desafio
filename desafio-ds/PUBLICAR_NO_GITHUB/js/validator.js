(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const out=$('output');
  const esc=value=>window.DS_Sanitize.escapeHtml(value);
  const tableRows=group=>Object.entries(group||{}).map(([name,item])=>`<tr><td>${esc(name)}</td><td>${esc(item.correct??item.acertos??0)}</td><td>${esc(item.total??0)}</td><td>${esc(item.percent??item.percentual??0)}%</td><td>${esc(item.level??'-')}</td></tr>`).join('');
  function list(items,renderer){return (items||[]).length?(items||[]).map(renderer).join(''):'<li>Nenhum registro.</li>';}
  $('clearBtn').addEventListener('click',()=>{$('tokenInput').value='';out.classList.add('hidden');out.textContent='';});
  $('validateBtn').addEventListener('click',async()=>{
    try{
      const token=$('tokenInput').value.trim();
      const data=await window.DS_Crypto.decryptToken(token);
      out.classList.remove('hidden');
      const proficiency=data.proficiencia_geral||{};
      const areas=tableRows(data.proficiencias?.areas||{});
      const competencies=tableRows(data.proficiencias?.competencies||{});
      const technologies=tableRows(data.proficiencias?.technologies||{});
      const languages=tableRows(data.proficiencias?.languages||{});
      const difficulties=Object.entries(data.dificuldades||{}).map(([level,item])=>`<tr><td>Nível ${esc(level)}</td><td>${esc(item.acertos)}</td><td>${esc(item.erros)}</td><td>${esc(item.percentual)}%</td><td>${esc(item.tempo_medio_segundos)}s</td></tr>`).join('');
      const careers=(data.trilhas_indicadas||[]).map(item=>`<li><b>${esc(item.label)}</b> — ${esc(item.role)} (${esc(item.score)}%)</li>`).join('')||'<li>Sem amostra suficiente.</li>';
      const bugs=list(data.bugs_reportados,b=>`<li><b>Fase ${esc(b.fase||'-')} — ${esc(b.area||'-')}</b><br>${esc(b.relato||'')}</li>`);
      const integrity=list(data.detalhes_integridade,i=>`<li>${esc(i.reason||'-')} • ${esc(i.severity||'-')} • fase ${esc(i.index||'-')}</li>`);
      const divergences=list(data.divergencias,d=>`<li>${esc(d)}</li>`);
      const json=esc(JSON.stringify(data,null,2));
      out.innerHTML=`<h2>${esc(data.jogador||'-')}</h2>
        <p><b>Turma:</b> ${esc(data.turma||'-')} | <b>Modo:</b> ${esc(data.modo_label||data.modo||'-')}</p>
        <p><b>Versão:</b> ${esc(data.versao||'-')} | <b>Banco:</b> ${esc(data.banco_versao||'-')}</p>
        <p><b>Situação:</b> ${esc(data.situacao||'-')} | <b>Tempo:</b> ${esc(data.tempo_total||'-')}</p>
        <p><b>XP:</b> ${esc(data.pontuacao||0)} | <b>Precisão bruta:</b> ${esc(data.precisao??0)}% | <b>Proficiência:</b> ${esc(proficiency.indice??0)}% — ${esc(proficiency.nivel||'-')}</p>
        <p><b>Premiação:</b> ${esc(data.premiacao||'-')} | <b>Cargo indicado:</b> ${esc(data.cargo_indicado||'-')}</p>
        <p><b>Acertos:</b> ${esc(data.acertos||0)} | <b>Erros:</b> ${esc(data.erros||0)} | <b>Não respondidas:</b> ${esc(data.perguntas_nao_respondidas||0)}</p>
        <p><b>Integridade:</b> ${esc(data.alertas_integridade||0)} evento(s), ${esc(data.alertas_criticos||0)} crítico(s) | <b>Sessão:</b> ${esc(data.sessao||'-')}</p>
        <h3>Trilhas indicadas</h3><ol>${careers}</ol>
        <h3>Proficiência por área</h3><table class="table"><thead><tr><th>Área</th><th>Acertos</th><th>Amostra</th><th>Índice</th><th>Nível</th></tr></thead><tbody>${areas}</tbody></table>
        <h3>Competências</h3><table class="table"><thead><tr><th>Competência</th><th>Acertos</th><th>Amostra</th><th>Índice</th><th>Nível</th></tr></thead><tbody>${competencies}</tbody></table>
        <h3>Tecnologias e linguagens</h3><table class="table"><thead><tr><th>Tecnologia</th><th>Acertos</th><th>Amostra</th><th>Índice</th><th>Nível</th></tr></thead><tbody>${technologies}</tbody></table>
        <h3>Idiomas técnicos</h3><table class="table"><thead><tr><th>Idioma</th><th>Acertos</th><th>Amostra</th><th>Índice</th><th>Nível</th></tr></thead><tbody>${languages}</tbody></table>
        <h3>Dificuldade</h3><table class="table"><thead><tr><th>Nível</th><th>Acertos</th><th>Erros</th><th>%</th><th>Tempo médio</th></tr></thead><tbody>${difficulties}</tbody></table>
        <h3>Bugs informados</h3><ul>${bugs}</ul>
        <h3>Alertas de integridade</h3><ul>${integrity}</ul>
        <h3>Divergências automáticas</h3><ul>${divergences}</ul>
        <h3>JSON completo</h3><pre>${json}</pre>`;
    }catch(error){out.classList.remove('hidden');out.textContent='Não foi possível abrir o comprovante. Confira se o token foi copiado por completo.\n\n'+(error?.message||String(error));}
  });
})();
