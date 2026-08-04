(function(){
  'use strict';

  const esc=value=>String(value==null?'':value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const safeName=value=>String(value||'relatorio').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,140)||'relatorio';
  const fmt=seconds=>{const total=Math.max(0,Number(seconds)||0),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=Math.floor(total%60);return h?`${h}h ${String(m).padStart(2,'0')}min`:`${m}min ${String(s).padStart(2,'0')}s`;};
  const date=value=>{if(!value)return 'Não registrado';try{return new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});}catch(_){return String(value);}};
  const statusLabel=status=>({completed:'Concluída',progress:'Em andamento',unlocked:'Liberada',locked:'Aguardando autorização'}[status]||status||'Não iniciado');

  function download(content,name,type){
    const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }

  function eventDescription(event){
    const labels={
      aula_aberta:'Aula aberta',etapa_aberta:'Etapa acessada',etapa_concluida:'Etapa concluída',
      evidencia_exportada:'Evidência exportada',classroom_aberto:'Classroom aberto',
      explicacao_extra:'Explicação complementar acessada',plataforma_externa_aberta:'Ferramenta externa aberta',
      evidencia_externa_importada:'Evidência externa importada',evidencia_externa_manual:'Declaração de evidência registrada',evidencia_validada_professor:'Evidência validada pelo professor',resultado_interno_aberto:'Registro interno iniciado',
      codigo_arquivo_copiado:'Código copiado',codigo_arquivo_baixado:'Arquivo de código baixado',
      codigo_projeto_baixado:'Projeto baixado',codigo_comando_copiado:'Comando copiado',
      conclusao_antecipada:'Conclusão antecipada autorizada',aula_concluida:'Aula concluída',
      aba_oculta:'Saída temporária da aba',retorno_aba:'Retorno à plataforma',atividade_retomada:'Atividade retomada',
      camada_informacao_aberta:'Informação complementar aberta',sessao_pdf_solicitada:'Relatório PDF solicitado'
    };
    return labels[event?.type]||String(event?.type||'Evento').replace(/_/g,' ');
  }

  function summaryCards(report){
    const s=report.summary||{};
    return [
      ['Aulas concluídas',`${s.completedLessons||0}/${s.totalLessons||0}`],
      ['Progresso das etapas',`${s.stepProgressPercent??s.progressPercent??0}%`],
      ['Tempo ativo',fmt(s.activeSeconds)],
      ['Evidências válidas',`${s.validEvidenceCount||0}/${s.externalEvidenceCount||0}`],
      ['Arquivos exportados',String(s.exportCount||0)],
      ['Ações registradas',String(s.eventCount||0)],
      ['Liberações docentes',String(s.teacherOverrides||0)]
    ].map(([label,value])=>`<article><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join('');
  }

  function toolsTable(report){
    const rows=(report.ecosystem||[]).map(tool=>`<tr><td>${esc(tool.name||tool.id)}</td><td>${esc(tool.role||'Ferramenta de apoio')}</td><td>${esc(tool.lessonCount||0)}</td><td>${esc(tool.evidenceCount||0)}</td></tr>`).join('');
    return rows||'<tr><td colspan="4">Nenhuma plataforma externa vinculada à disciplina.</td></tr>';
  }

  function lessonBlocks(report){
    return (report.lessons||[]).map(item=>{
      const extras=(item.extrasUsed||[]).join(', ')||'Nenhuma';
      const tools=(item.toolsAccessed||[]).join(', ')||'Nenhuma';
      const confidenceLabel=value=>({RECOGNIZED:'Reconhecida automaticamente',TEACHER_VALIDATED:'Validada pelo professor',PARTIAL:'Reconhecida parcialmente',MANUAL:'Declaração do aluno',REVIEW_REQUIRED:'Aguardando professor',INCOMPATIBLE:'Incompatível'}[value]||value||'Não classificada');
      const evidences=(item.externalEvidence||[]).map(ev=>`<li><strong>${esc(ev.platform||'Ferramenta')}</strong> — <b>${esc(confidenceLabel(ev.confidence))}</b>: ${esc(ev.summary||'Sem resumo')}${ev.teacherReview?.teacher?`<br><small>Validação: ${esc(ev.teacherReview.teacher)} — ${esc(date(ev.teacherReview.at))}</small>`:''}</li>`).join('')||'<li>Nenhuma evidência externa.</li>';
      const answers=[];
      if(item.challengeAnswer)answers.push(`<p><b>Desafio:</b> ${esc(item.challengeAnswer)}</p>`);
      if(item.reflectionAnswer)answers.push(`<p><b>Reflexão:</b> ${esc(item.reflectionAnswer)}</p>`);
      const records=[...(item.answers||[]).map(row=>({group:'Resposta',...row})),...(item.labRecords||[]).map(row=>({group:'Laboratório',...row}))];
      const recordHtml=records.length?`<div class="lesson-sub"><h4>Registros completos da atividade</h4><table><thead><tr><th>Tipo</th><th>Campo</th><th>Conteúdo</th></tr></thead><tbody>${records.map(row=>`<tr><td>${esc(row.group)}</td><td>${esc(row.key)}</td><td>${esc(row.value)}</td></tr>`).join('')}</tbody></table></div>`:'';
      const runs=(item.sessionRuns||[]).map(run=>`<li>${date(run.startedAt)} até ${date(run.endedAt)} - ${fmt(run.activeSeconds)} - ${esc(run.endReason||'sessão aberta')}</li>`).join('')||'<li>Nenhum segmento de sessão registrado.</li>';
      return `<section class="lesson ${esc(item.status)}">
        <header><div><span>AULA ${String(item.number||0).padStart(2,'0')}</span><h3>${esc(item.title)}</h3><p>${esc(item.unit||item.module||'')}</p></div><div class="lesson-status"><b>${esc(statusLabel(item.status))}</b><small>${esc(item.progressPercent||0)}%</small></div></header>
        <div class="lesson-grid">
          <p><b>Tempo ativo:</b> ${esc(fmt(item.activeSeconds))}</p>
          <p><b>Etapa atual:</b> ${esc(item.currentStepLabel||'Não iniciada')}</p>
          <p><b>Último acesso:</b> ${esc(date(item.lastAccess))}</p>
          <p><b>Conclusão:</b> ${esc(date(item.completedAt))}</p>
          <p><b>Explicações abertas:</b> ${esc(extras)}</p>
          <p><b>Ferramentas acessadas:</b> ${esc(tools)}</p>
        </div>
        ${answers.length?`<div class="lesson-notes">${answers.join('')}</div>`:''}
        ${recordHtml}
        <div class="lesson-sub"><h4>Evidências relacionadas</h4><ul>${evidences}</ul></div>
        <div class="lesson-sub"><h4>Segmentos de trabalho</h4><ul>${runs}</ul></div>
        ${item.teacherOverride?`<div class="teacher-note"><b>Liberação antecipada:</b> ${esc(item.teacherOverride.teacher||'Professor')} - ${esc(item.teacherOverride.reason||item.teacherOverride.note||'motivo registrado')} - ${esc(date(item.teacherOverride.at))}</div>`:''}
      </section>`;
    }).join('');
  }

  function eventRows(report){
    const events=report.timeline||[];
    if(!events.length)return '<tr><td colspan="5">Nenhuma ação registrada.</td></tr>';
    return events.map(event=>`<tr><td>${esc(date(event.at))}</td><td>${esc(event.lessonNumber?`Aula ${event.lessonNumber}`:'Geral')}</td><td>${esc(eventDescription(event))}</td><td>${esc(event.detail||'')}</td><td>${esc(event.sessionId||'')}</td></tr>`).join('');
  }

  function html(report,{forPrint=false}={}){
    const title=`Relatório da sessão - ${report?.student?.name||'Estudante'}`;
    const generated=date(report.generatedAt);
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
      @page{size:A4;margin:13mm 12mm}*{box-sizing:border-box}body{margin:0;background:#eef3f8;color:#172234;font:12px/1.48 Arial,Helvetica,sans-serif}.page{width:min(1100px,calc(100% - 24px));margin:20px auto;background:#fff;padding:28px;border-radius:18px;box-shadow:0 14px 50px rgba(14,31,53,.14)}h1,h2,h3,h4,p{margin-top:0}h1{font-size:28px;margin-bottom:5px;color:#10283f}h2{font-size:18px;margin:28px 0 11px;padding-bottom:7px;border-bottom:2px solid #dbe7ef}h3{font-size:15px;margin:3px 0}h4{font-size:12px;margin-bottom:5px}.top{display:flex;justify-content:space-between;gap:16px;border-bottom:4px solid #237b68;padding-bottom:16px}.brand{font-weight:900;color:#237b68;letter-spacing:.1em}.version{padding:7px 10px;border-radius:999px;background:#e7f5f1;color:#135e50;white-space:nowrap}.identity{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 22px;margin:17px 0;padding:14px;border:1px solid #d8e2ea;border-radius:12px}.identity p{margin:0}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.cards article{border:1px solid #d8e2ea;border-radius:11px;padding:11px;background:#f8fbfd}.cards span{display:block;color:#617080;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.cards strong{display:block;font-size:18px;margin-top:4px}.schedule{padding:11px 13px;border-left:4px solid #237b68;background:#edf8f5}.lesson{border:1px solid #d8e2ea;border-radius:13px;padding:13px;margin:10px 0;break-inside:avoid}.lesson>header{display:flex;justify-content:space-between;gap:12px}.lesson>header span{font-size:9px;font-weight:900;color:#237b68;letter-spacing:.11em}.lesson>header p{color:#667788;margin:0}.lesson-status{text-align:right}.lesson-status b{display:block;color:#237b68}.lesson-status small{color:#667788}.lesson-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 15px;padding:9px 0}.lesson-grid p{margin:0}.lesson-notes,.teacher-note{padding:9px;border-radius:9px;background:#f5f8fb;margin:7px 0}.lesson-sub{margin-top:8px}.lesson-sub ul{margin:0;padding-left:18px}.completed{border-left:5px solid #1d8f6b}.progress{border-left:5px solid #d59a16}.unlocked{border-left:5px solid #4586c8}.locked{border-left:5px solid #aab5bf}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #d8e2ea;padding:6px;text-align:left;vertical-align:top}th{background:#eef4f8}.terms{padding:12px;border:1px solid #d8e2ea;border-radius:11px}.footer{margin-top:25px;padding-top:10px;border-top:1px solid #d8e2ea;color:#637283;font-size:10px}.screen-actions{position:sticky;top:0;z-index:3;display:flex;gap:8px;justify-content:flex-end;padding:10px;background:rgba(238,243,248,.94);backdrop-filter:blur(10px)}.screen-actions button{border:0;border-radius:9px;padding:10px 13px;font-weight:800;background:#237b68;color:#fff;cursor:pointer}.screen-actions button.secondary{background:#31465b}.warning{padding:10px;background:#fff5d9;border:1px solid #efd38c;border-radius:10px;margin:12px 0}
      @media(max-width:720px){.page{width:100%;margin:0;border-radius:0;padding:18px}.top{display:block}.version{display:inline-block;margin-top:8px}.identity,.cards,.lesson-grid{grid-template-columns:1fr}.screen-actions{justify-content:stretch}.screen-actions button{flex:1}}
      @media print{body{background:#fff}.page{width:100%;margin:0;padding:0;box-shadow:none}.screen-actions,.no-print{display:none!important}h2{break-after:avoid}.lesson{break-inside:avoid}a{color:#172234;text-decoration:none}}
    </style></head><body>${forPrint?'':'<div class="screen-actions no-print"><strong>O diálogo de impressão será aberto automaticamente. Caso não apareça, use Ctrl+P ou o menu Imprimir do navegador e selecione Salvar como PDF.</strong></div>'}<main class="page">
      <div class="top"><div><div class="brand">DESAFIO DS - MODO GUIADO</div><h1>Relatório consolidado da sessão</h1><p>${esc(report.discipline?.label||'Disciplina')} - ${esc(report.course?.label||'Turma')}</p></div><div class="version">Versão ${esc(report.platformVersion||report.version||'')}</div></div>
      <section class="identity"><p><b>Estudante:</b> ${esc(report.student?.name||'')}</p><p><b>Turma:</b> ${esc(report.course?.label||'')}</p><p><b>Disciplina:</b> ${esc(report.discipline?.label||'')}</p><p><b>Gerado em:</b> ${esc(generated)}</p><p><b>Perfil:</b> ${esc(report.student?.profileMode||'Perfil local ou sessão')}</p><p><b>Recursos de apoio:</b> ${esc((report.student?.supportResources||[]).join(', ')||'Padrão')}</p></section>
      <section class="cards">${summaryCards(report)}</section>
      <p class="schedule"><b>Contexto escolar:</b> ${esc(report.schedule?.label||report.schedule?.state||'Horário não identificado')} ${report.schedule?.remainingMinutes!=null?`- aproximadamente ${esc(report.schedule.remainingMinutes)} minuto(s) restantes`:''}</p>
      <h2>Ecossistema utilizado na disciplina</h2><table><thead><tr><th>Plataforma</th><th>Função pedagógica</th><th>Aulas relacionadas</th><th>Evidências</th></tr></thead><tbody>${toolsTable(report)}</tbody></table>
      <h2>Progresso por aula</h2>${lessonBlocks(report)}
      <h2>Histórico de ações</h2><p class="warning">Este histórico registra ações técnicas e pedagógicas realizadas dentro da plataforma. Abrir o Classroom não confirma automaticamente a entrega.</p><table><thead><tr><th>Data e hora</th><th>Aula</th><th>Ação</th><th>Detalhe</th><th>Sessão</th></tr></thead><tbody>${eventRows(report)}</tbody></table>
      <h2>Termo, privacidade e avaliação</h2><section class="terms"><p><b>Termo vigente:</b> ${esc(report.terms?.status||'não validado')} - versão ${esc(report.terms?.termsVersion||'não registrada')}</p><p><b>Aceite:</b> ${esc(date(report.terms?.acceptedAt))}</p><p><b>Critério pedagógico:</b> proficiência, participação efetiva, evidências, correção de erros e critérios definidos pelo professor.</p><p><b>Gamificação:</b> XP, vidas, cartas, itens e recompensas não determinam a nota.</p><p><b>Limitação:</b> os registros ficam no dispositivo e não equivalem a uma confirmação central por servidor.</p></section>
      <footer class="footer">Relatório gerado localmente pelo navegador. Para produzir o PDF, utilize a opção Imprimir e selecione Salvar como PDF. Nenhuma senha, chave privada ou segredo EduAuth é incluído.</footer>
    </main></body></html>`;
  }

  function print(report){
    const content=html(report);
    let popup=null;
    try{popup=window.open('','_blank');}catch(_){}
    if(!popup){download(content,`${safeName(report.fileBase||'RELATORIO_SESSAO')}.html`,'text/html;charset=utf-8');return {fallback:true};}
    try{popup.opener=null;popup.document.open();popup.document.write(content);popup.document.close();popup.focus();setTimeout(()=>popup.print(),450);return {fallback:false};}
    catch(_){try{popup.close();}catch(__){}download(content,`${safeName(report.fileBase||'RELATORIO_SESSAO')}.html`,'text/html;charset=utf-8');return {fallback:true};}
  }
  function downloadHtml(report){download(html(report),`${safeName(report.fileBase||'RELATORIO_SESSAO')}.html`,'text/html;charset=utf-8');}
  function downloadJson(report){download(JSON.stringify(report,null,2),`${safeName(report.fileBase||'RELATORIO_SESSAO')}.json`,'application/json;charset=utf-8');}

  window.DS_GuidedSessionReport={html,print,downloadHtml,downloadJson,formatDuration:fmt};
})();
