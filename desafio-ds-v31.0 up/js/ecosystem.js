(function(){
  'use strict';

  const EVIDENCE_SCHEMA='ds-evidence';
  const EVIDENCE_VERSION=2;
  const MAX_FILE_BYTES=2_500_000;
  const TRUST=Object.freeze({
    RECOGNIZED:'RECOGNIZED',
    TEACHER_VALIDATED:'TEACHER_VALIDATED',
    PARTIAL:'PARTIAL',
    MANUAL:'MANUAL',
    REVIEW_REQUIRED:'REVIEW_REQUIRED',
    INCOMPATIBLE:'INCOMPATIBLE'
  });
  const TRUST_META=Object.freeze({
    RECOGNIZED:{label:'Reconhecida automaticamente',tone:'ok',counts:true},
    TEACHER_VALIDATED:{label:'Validada pelo professor',tone:'ok',counts:true},
    PARTIAL:{label:'Reconhecida parcialmente',tone:'warn',counts:false},
    MANUAL:{label:'Declaração do aluno',tone:'info',counts:false},
    REVIEW_REQUIRED:{label:'Aguardando professor',tone:'warn',counts:false},
    INCOMPATIBLE:{label:'Incompatível com esta aula',tone:'danger',counts:false}
  });
  const catalog=Object.freeze({
    'desafio-ds':Object.freeze({id:'desafio-ds',name:'Desafio DS',category:'Aulas, diagnóstico e desafios',mode:'internal',status:'available',url:'',description:'Plataforma atual. Use para registrar, revisar e consolidar resultados das demais ferramentas.',evidence:'Registro interno do Modo Guiado.'}),
    'lab-virtual-ds':Object.freeze({id:'lab-virtual-ds',name:'Lab Virtual DS',category:'Laboratórios e simuladores',mode:'external-online',status:'available',url:'https://gb-eli.github.io/lab-virtual/LABV2.0/lab/index.html',description:'Laboratórios de programação, hardware, sistemas, redes, banco de dados e ferramentas educacionais.',evidence:'Exporte a evidência da atividade ou registre manualmente o módulo e o resultado.'}),
    'lab-3d-vr':Object.freeze({id:'lab-3d-vr',name:'Lab 3D / HoloMotion',category:'3D, 360 e realidade virtual',mode:'external-online',status:'available',url:'https://gb-eli.github.io/LAB-DS-3D-VR/holomotion-lab-ds-3.2.0/index.html',description:'Experiências 3D/VR, controles, gestos, desempenho e visualização espacial.',evidence:'Registre dispositivo, modo de qualidade, teste realizado e resultado.'}),
    'ctf-cyber':Object.freeze({id:'ctf-cyber',name:'CTF Cyber',category:'Cibersegurança autorizada',mode:'external-online',status:'available',url:'https://gb-eli.github.io/ctfds/ctfds-cyber-security-github-pages-v2.1.0/index.html',description:'Desafios educacionais de segurança, criptografia e investigação em ambiente controlado.',evidence:'Use somente o desafio indicado pelo professor e registre a medida defensiva aprendida.'}),
    'fliperama-ds':Object.freeze({id:'fliperama-ds',name:'Fliperama DS',category:'Jogos, física e evolução gráfica',mode:'external-online',status:'available',url:'https://gb-eli.github.io/Fliperama-DS/fliperama-ds-v0.21.0/index.html',description:'Jogos e evolução tecnológica para analisar lógica, física, animação, controles, UX, responsividade e desempenho.',evidence:'Registre jogo, comportamento testado, parâmetro analisado e melhoria sugerida.'}),
    'github':Object.freeze({id:'github',name:'GitHub',category:'Código e publicação',mode:'external-online',status:'available',url:'https://github.com/',description:'Repositórios, versionamento, documentação e GitHub Pages.',evidence:'Informe o repositório, commit ou URL publicada e o teste realizado.'})
  });

  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const cleanText=(value,max=1200)=>String(value??'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,max);
  const safeUrl=value=>{
    const raw=String(value||'').trim();if(!raw)return '';
    try{const u=new URL(raw,location.href);if(!['https:','http:'].includes(u.protocol))return '';return u.href;}catch(_){return '';}
  };
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():`ev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const normalizedId=value=>cleanText(value,160).toLowerCase();
  const slug=value=>cleanText(value,100).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  async function sha256(value){const bytes=value instanceof ArrayBuffer?value:new TextEncoder().encode(String(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');}
  function taskIdFor(lesson,task,index=0){return cleanText(task?.id||`${lesson?.id||'lesson'}:${task?.toolId||'tool'}:${slug(task?.activity||index)}`,180);}
  function isManual(item){return ['declared-by-student','manual','student-declaration'].includes(normalizedId(item?.provenance?.type||item?.result?.status));}
  function normalizeEvidence(input,fileMeta={},context={}){
    const p=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
    const platformId=cleanText(p.platform?.id||p.platformId||p.source?.platformId||'',80);
    const platform=catalog[platformId]||null;
    const activityTitle=cleanText(p.activity?.title||p.lesson?.title||p.activityTitle||p.title||context.activityTitle||'',180);
    const summary=cleanText(p.result?.summary||p.summary||p.answers?.reflection||p.resultSummary||'',1200);
    const status=cleanText(p.result?.status||p.status||context.status||'imported',60);
    const generatedAt=cleanText(p.generatedAt||p.completedAt||new Date().toISOString(),60);
    const sourceUrl=safeUrl(p.source?.url||p.repositoryUrl||p.url||'');
    if(!platformId||!activityTitle)throw new Error('A evidência precisa informar plataforma e atividade.');
    const evidenceId=cleanText(p.evidenceId||p.id||uuid(),120);
    const sourceTransactionId=cleanText(p.source?.transactionId||p.sourceTransactionId||p.exportId||p.originExportId||'',140);
    const lessonId=cleanText(p.activity?.lessonId||p.lesson?.id||p.lessonId||p.activity?.id||p.activityId||context.lessonId||'',120);
    const taskId=cleanText(p.activity?.taskId||p.taskId||context.taskId||'',180);
    return {
      id:evidenceId,evidenceId,schema:cleanText(p.schema||EVIDENCE_SCHEMA,80),schemaVersion:Number(p.schemaVersion||(context.provenance==='imported-file'?1:EVIDENCE_VERSION)),
      importedAt:new Date().toISOString(),generatedAt,
      platform:{id:platformId,name:platform?.name||cleanText(p.platform?.name||platformId,120),version:cleanText(p.platform?.version||p.toolVersion||'',80)},
      activity:{id:cleanText(p.activity?.id||p.activityId||lessonId,120),lessonId,taskId,title:activityTitle},
      student:{classKey:cleanText(p.student?.classKey||p.classId||context.classKey||'',80),disciplineKey:cleanText(p.student?.disciplineKey||p.disciplineId||context.disciplineKey||'',100)},
      result:{status,summary,score:Number.isFinite(Number(p.result?.score))?Number(p.result.score):null},
      source:{url:sourceUrl,fileName:cleanText(fileMeta.name||p.source?.fileName||'',180),fileSize:Number(fileMeta.size||0),fileHash:cleanText(fileMeta.hash||'',80),transactionId:sourceTransactionId},
      integrity:{declared:cleanText(p.integrity?.status||p.integrity||'não verificada externamente',80),localImportHash:cleanText(fileMeta.hash||'',80)},
      provenance:{type:cleanText(context.provenance||p.provenance?.type||status,80),originId:cleanText(p.provenance?.originId||p.originId||sourceTransactionId,140)},
      review:null,
      notes:cleanText(p.notes||'',600)
    };
  }
  function exactOrMissing(actual,expected){if(!actual)return 'missing';return normalizedId(actual)===normalizedId(expected)?'match':'mismatch';}
  function classifyEvidence(item,lesson,profile,task,index=0){
    if(item?.review?.status==='VALIDATED' && normalizedId(item.review.lessonId)===normalizedId(lesson?.id) && normalizedId(item.review.taskId)===normalizedId(taskIdFor(lesson,task,index))){
      return {status:TRUST.TEACHER_VALIDATED,label:TRUST_META.TEACHER_VALIDATED.label,tone:'ok',counts:true,reasons:['Autorização docente vinculada à aula e à atividade.']};
    }
    const reasons=[];
    const platformState=exactOrMissing(item?.platform?.id,task?.toolId);
    if(platformState==='mismatch')return {status:TRUST.INCOMPATIBLE,label:TRUST_META.INCOMPATIBLE.label,tone:'danger',counts:false,reasons:['A plataforma do arquivo não corresponde à ferramenta solicitada.']};
    const expectedTaskId=taskIdFor(lesson,task,index);
    const lessonState=exactOrMissing(item?.activity?.lessonId||item?.activity?.id,lesson?.id);
    const taskState=exactOrMissing(item?.activity?.taskId,expectedTaskId);
    const classState=exactOrMissing(item?.student?.classKey,profile?.courseKey);
    const disciplineState=exactOrMissing(item?.student?.disciplineKey,profile?.disciplineKey);
    if([lessonState,taskState,classState,disciplineState].includes('mismatch')){
      if(lessonState==='mismatch')reasons.push('O identificador da aula é diferente.');
      if(taskState==='mismatch')reasons.push('A atividade registrada é diferente da missão solicitada.');
      if(classState==='mismatch')reasons.push('A turma registrada é diferente do perfil atual.');
      if(disciplineState==='mismatch')reasons.push('A disciplina registrada é diferente da aula atual.');
      return {status:TRUST.INCOMPATIBLE,label:TRUST_META.INCOMPATIBLE.label,tone:'danger',counts:false,reasons};
    }
    const internalRecord=catalog[task?.toolId]?.mode==='internal'&&normalizedId(item?.provenance?.type)==='internal-platform';
    if(isManual(item))return {status:TRUST.MANUAL,label:TRUST_META.MANUAL.label,tone:'info',counts:false,reasons:['A informação foi declarada no Desafio DS e ainda não foi confirmada pelo professor.']};
    if(item?.schema!==EVIDENCE_SCHEMA)reasons.push('O arquivo utiliza um schema diferente do padrão ds-evidence.');
    if(Number(item?.schemaVersion||0)<EVIDENCE_VERSION)reasons.push('O arquivo utiliza uma versão anterior do formato de evidência.');
    if(lessonState==='missing')reasons.push('O arquivo não identifica a aula de origem.');
    if(taskState==='missing')reasons.push('O arquivo não identifica a missão específica.');
    if(classState==='missing')reasons.push('O arquivo não identifica a turma.');
    if(disciplineState==='missing')reasons.push('O arquivo não identifica a disciplina.');
    if(!item?.source?.fileHash&&!internalRecord)reasons.push('Não há hash local do arquivo importado.');
    if(reasons.length)return {status:TRUST.PARTIAL,label:TRUST_META.PARTIAL.label,tone:'warn',counts:false,reasons};
    return {status:TRUST.RECOGNIZED,label:TRUST_META.RECOGNIZED.label,tone:'ok',counts:true,reasons:['Plataforma, aula, atividade, turma, disciplina e arquivo correspondem.']};
  }
  function bestTaskMatch(lesson,profile,item){
    const tasks=Array.isArray(lesson?.platformTasks)?lesson.platformTasks:[];
    const matches=tasks.map((task,index)=>({task,index,trust:classifyEvidence(item,lesson,profile,task,index)}));
    const rank={[TRUST.TEACHER_VALIDATED]:6,[TRUST.RECOGNIZED]:5,[TRUST.MANUAL]:4,[TRUST.PARTIAL]:3,[TRUST.REVIEW_REQUIRED]:2,[TRUST.INCOMPATIBLE]:1};
    return matches.sort((a,b)=>(rank[b.trust.status]||0)-(rank[a.trust.status]||0))[0]||{task:null,index:-1,trust:{status:TRUST.INCOMPATIBLE,label:TRUST_META.INCOMPATIBLE.label,tone:'danger',counts:false,reasons:['A aula não possui tarefa compatível.']}};
  }
  function taskStatus(task,evidence,lesson,profile,index=0){
    const candidates=evidence.map(item=>({item,trust:classifyEvidence(item,lesson,profile,task,index)})).filter(row=>row.trust.status!==TRUST.INCOMPATIBLE);
    const valid=candidates.find(row=>row.trust.counts);
    const pending=candidates.find(row=>!row.trust.counts);
    return valid||pending||null;
  }
  function evidenceList(progress){return Array.isArray(progress?.externalEvidence)?progress.externalEvidence:[];}
  function ensureList(progress){if(!Array.isArray(progress.externalEvidence))progress.externalEvidence=[];return progress.externalEvidence;}
  function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function template(lesson,profile,task,index=0){
    const normalizedTask=typeof task==='string'?{toolId:task,activity:lesson?.title}:task||{};
    const tool=catalog[normalizedTask.toolId]||catalog['desafio-ds'];
    return {schema:EVIDENCE_SCHEMA,schemaVersion:EVIDENCE_VERSION,evidenceId:uuid(),generatedAt:new Date().toISOString(),platform:{id:tool.id,name:tool.name,version:''},activity:{id:lesson.id,lessonId:lesson.id,taskId:taskIdFor(lesson,normalizedTask,index),title:normalizedTask.activity||lesson.title},student:{name:profile?.name||'',classKey:profile?.courseKey||'',disciplineKey:profile?.disciplineKey||''},result:{status:'completed',summary:'Descreva o que foi realizado, o resultado e o teste efetuado.',score:null},source:{url:'',fileName:'',transactionId:uuid()},integrity:{status:'declared-by-origin'},provenance:{type:'exported-by-tool'},notes:''};
  }
  function requiredSatisfied(lesson,progress,profile){
    const tasks=Array.isArray(lesson?.platformTasks)?lesson.platformTasks:[];
    const required=tasks.map((task,index)=>({task,index})).filter(row=>row.task.required);
    if(!required.length)return true;
    return required.every(({task,index})=>Boolean(taskStatus(task,evidenceList(progress),lesson,profile,index)?.trust?.counts));
  }
  function confidenceCounts(lesson,progress,profile){
    const counts={recognized:0,teacherValidated:0,partial:0,manual:0,incompatible:0,total:0,valid:0};
    evidenceList(progress).forEach(item=>{const trust=bestTaskMatch(lesson,profile,item).trust;counts.total++;if(trust.counts)counts.valid++;if(trust.status===TRUST.RECOGNIZED)counts.recognized++;else if(trust.status===TRUST.TEACHER_VALIDATED)counts.teacherValidated++;else if(trust.status===TRUST.PARTIAL)counts.partial++;else if(trust.status===TRUST.MANUAL)counts.manual++;else counts.incompatible++;});
    return counts;
  }

  function render(container,options={}){
    const lesson=options.lesson||{},profile=options.profile||{},progress=options.progress||{};
    const tasks=Array.isArray(lesson.platformTasks)?lesson.platformTasks:[];
    const evidence=evidenceList(progress);
    if(!tasks.length){container.innerHTML='<div class="ecosystem-empty"><strong>Nenhuma plataforma externa é obrigatória nesta aula.</strong><p>Utilize o laboratório interno e a Central de Código.</p></div>';return;}
    container.innerHTML=`<section class="ecosystem-panel"><header><div><span class="guided-kicker">ECOSSISTEMA DS</span><h2>Ferramentas relacionadas à aula</h2><p>Abra somente a ferramenta indicada, realize o roteiro e retorne para registrar ou importar a evidência.</p></div><span class="ecosystem-evidence-count">${evidence.length} evidência(s)</span></header><div class="ecosystem-task-list"></div><details class="ecosystem-import" ${lesson.requiresExternalEvidence?'open':''}><summary>Registrar ou importar resultado</summary><div class="ecosystem-import-grid"><form data-manual-evidence><label>Missão realizada<select name="taskIndex">${tasks.map((t,index)=>{const x=catalog[t.toolId]||{name:t.toolId};return `<option value="${index}">${escapeHtml(x.name)} — ${escapeHtml(t.activity||lesson.title)}</option>`;}).join('')}</select></label><label>Resultado e teste<textarea name="summary" maxlength="1200" placeholder="Explique o que realizou, resultado obtido, problema encontrado e como verificou."></textarea></label><label>Link do GitHub ou da publicação (opcional)<input name="sourceUrl" maxlength="500" placeholder="https://..."></label><button class="btn primary" type="submit">Registrar declaração do aluno</button><small>Uma declaração manual fica aguardando validação do professor quando a evidência é obrigatória.</small></form><div class="ecosystem-file-box"><strong>Importar arquivo</strong><p>Aceita <code>.ds-evidence.json</code> ou JSON compatível de até 2,5 MB.</p><input data-evidence-file type="file" accept=".json,.ds-evidence.json,application/json"><button data-import-evidence class="btn secondary" type="button">Importar arquivo selecionado</button><button data-download-template class="btn ghost" type="button">Baixar modelo da primeira missão</button><p data-import-status class="mode-status" aria-live="polite"></p></div></div></details><section class="ecosystem-evidence-list"><h3>Evidências vinculadas</h3><p class="ecosystem-confidence-help">Somente evidências reconhecidas automaticamente ou validadas pelo professor concluem uma missão obrigatória.</p><div data-evidence-list></div></section></section>`;
    const list=container.querySelector('.ecosystem-task-list');
    tasks.forEach((task,index)=>{
      const tool=catalog[task.toolId]||{id:task.toolId,name:task.toolId,status:'unknown',mode:'external-online',url:'',description:'Ferramenta configurada pelo professor.'};
      const status=taskStatus(task,evidence,lesson,profile,index);
      const done=Boolean(status?.trust?.counts);
      const pending=Boolean(status&&!done);
      const actionLabel=tool.mode==='internal'?'Registrar resultado no Desafio DS':'Abrir ferramenta';
      const article=document.createElement('article');article.className=`ecosystem-task-card ${done?'done':pending?'pending':''}`;
      article.innerHTML=`<div class="ecosystem-task-head"><span>${task.required?'Obrigatória':'Complementar'}</span><strong>${escapeHtml(tool.name)}</strong><em>${done?'Comprovada':pending?'Revisão necessária':'Pendente'}</em></div><p>${escapeHtml(task.activity||tool.description)}</p><ol>${(task.steps||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol><small><b>Resultado esperado:</b> ${escapeHtml(task.expectedEvidence||tool.evidence||'Registre o resultado.')}</small><div class="ecosystem-actions"><button data-open-tool="${index}" class="btn secondary" type="button">${actionLabel}</button><button data-task-template="${index}" class="btn ghost" type="button">Baixar ficha</button></div>${tool.status==='teacher-link'&&!tool.url?'<p class="ecosystem-warning">O endereço ainda não está configurado. Solicite o link ao professor e registre a evidência manualmente.</p>':''}`;
      list.appendChild(article);
    });
    function paintEvidence(){
      const target=container.querySelector('[data-evidence-list]');const rows=evidenceList(progress);
      target.innerHTML=rows.length?rows.map((item,i)=>{
        const match=bestTaskMatch(lesson,profile,item),trust=match.trust,meta=TRUST_META[trust.status]||TRUST_META.REVIEW_REQUIRED;
        item.confidence={status:trust.status,label:trust.label,reasons:trust.reasons,counts:trust.counts,checkedAt:new Date().toISOString(),lessonId:lesson.id,taskId:match.task?taskIdFor(lesson,match.task,match.index):''};
        const canReview=!trust.counts&&trust.status!==TRUST.INCOMPATIBLE&&typeof options.onReviewEvidence==='function';
        return `<article class="evidence-row evidence-${meta.tone}"><div><div class="evidence-row-title"><strong>${escapeHtml(item.platform?.name||item.platform?.id)}</strong><span class="evidence-confidence ${meta.tone}">${escapeHtml(meta.label)}</span></div><span>${escapeHtml(item.activity?.title||'Atividade')}</span><small>${escapeHtml(item.result?.summary||'Sem resumo')}</small><details><summary>Por que recebeu este status?</summary><ul>${trust.reasons.map(reason=>`<li>${escapeHtml(reason)}</li>`).join('')}</ul></details></div><div><time>${new Date(item.importedAt||Date.now()).toLocaleString('pt-BR')}</time>${canReview?`<button data-review-evidence="${i}" class="btn secondary" type="button">Validar com professor</button>`:''}<button data-remove-evidence="${i}" class="btn ghost" type="button">Remover</button></div></article>`;
      }).join(''):'<p class="ecosystem-empty-note">Nenhuma evidência vinculada ainda.</p>';
      container.querySelector('.ecosystem-evidence-count').textContent=`${rows.length} evidência(s)`;
      target.querySelectorAll('[data-review-evidence]').forEach(btn=>btn.addEventListener('click',()=>options.onReviewEvidence?.(rows[Number(btn.dataset.reviewEvidence)],Number(btn.dataset.reviewEvidence),()=>render(container,options))));
      target.querySelectorAll('[data-remove-evidence]').forEach(btn=>btn.addEventListener('click',()=>{if(!confirm('Remover esta evidência da aula?'))return;ensureList(progress).splice(Number(btn.dataset.removeEvidence),1);options.onChange?.();options.onEvent?.('evidencia_externa_removida','',{remaining:ensureList(progress).length});render(container,options);}));
    }
    container.querySelectorAll('[data-open-tool]').forEach(btn=>btn.addEventListener('click',()=>{
      const task=tasks[Number(btn.dataset.openTool)],tool=catalog[task.toolId];
      if(tool?.mode==='internal'){
        options.onEvent?.('resultado_interno_aberto',task.toolId,{activity:task.activity,lessonId:lesson.id});
        container.querySelector('.ecosystem-import')?.setAttribute('open','');container.querySelector('[name="taskIndex"]').value=String(Number(btn.dataset.openTool));container.querySelector('[name="summary"]')?.focus();
        options.feedback?.('Registre aqui o resultado produzido dentro do Desafio DS. Nenhuma nova guia é necessária.','ok');options.onInternalAction?.(task,Number(btn.dataset.openTool));return;
      }
      const url=safeUrl(tool?.url);options.onEvent?.('plataforma_externa_aberta',task.toolId,{activity:task.activity,lessonId:lesson.id,taskId:taskIdFor(lesson,task,Number(btn.dataset.openTool))});
      if(!url){options.feedback?.('O endereço desta ferramenta ainda não está configurado. Solicite o link ao professor.','warn');return;}
      window.open(url,'_blank','noopener,noreferrer');options.feedback?.(`${tool.name} aberta em nova guia. Retorne depois para registrar a evidência.`,'ok');
    }));
    container.querySelectorAll('[data-task-template]').forEach(btn=>btn.addEventListener('click',()=>{const index=Number(btn.dataset.taskTemplate),task=tasks[index];downloadJson(template(lesson,profile,task,index),`${lesson.id}-${task.toolId}.ds-evidence.json`);options.onEvent?.('modelo_evidencia_baixado',task.toolId,{taskId:taskIdFor(lesson,task,index)});}));
    container.querySelector('[data-download-template]').addEventListener('click',()=>{downloadJson(template(lesson,profile,tasks[0],0),`${lesson.id}-modelo.ds-evidence.json`);options.onEvent?.('modelo_evidencia_baixado','geral');});
    container.querySelector('[data-manual-evidence]').addEventListener('submit',event=>{
      event.preventDefault();const form=event.currentTarget,data=Object.fromEntries(new FormData(form)),index=Math.max(0,Math.min(Number(data.taskIndex)||0,tasks.length-1)),task=tasks[index];const summary=cleanText(data.summary,1200);if(summary.length<40){options.feedback?.('Descreva o resultado e o teste com pelo menos 40 caracteres.','warn');return;}
      const internal=catalog[task.toolId]?.mode==='internal';
      const item=normalizeEvidence({platformId:task.toolId,activityTitle:task.activity||lesson.title,resultSummary:summary,repositoryUrl:data.sourceUrl,status:internal?'internal-record':'declared-by-student'},{},{lessonId:lesson.id,taskId:taskIdFor(lesson,task,index),classKey:profile.courseKey,disciplineKey:profile.disciplineKey,provenance:internal?'internal-platform':'declared-by-student'});
      const duplicate=options.findDuplicate?.(item,lesson.id);if(duplicate){options.feedback?.(duplicate,'warn');return;}
      ensureList(progress).push(item);if(progress.externalEvidence.length>30)progress.externalEvidence=progress.externalEvidence.slice(-30);options.onChange?.();options.onEvent?.('evidencia_externa_manual',item.platform.id,{evidenceId:item.id,taskId:item.activity.taskId});if(requiredSatisfied(lesson,progress,profile))options.onComplete?.('evidência externa validada');form.reset();render(container,options);
    });
    container.querySelector('[data-import-evidence]').addEventListener('click',async()=>{
      const file=container.querySelector('[data-evidence-file]').files[0],status=container.querySelector('[data-import-status]');
      if(!file){status.textContent='Selecione um arquivo.';return;}if(file.size>MAX_FILE_BYTES){status.textContent='Arquivo maior que 2,5 MB.';return;}
      try{
        const buffer=await file.arrayBuffer(),hash=await sha256(buffer),text=new TextDecoder().decode(buffer);let parsed;
        if(window.DS_Sanitize?.parseJsonSafe)parsed=window.DS_Sanitize.parseJsonSafe(text,{maxChars:MAX_FILE_BYTES,maxDepth:18,maxKeys:5000});else parsed=JSON.parse(text);
        const item=normalizeEvidence(parsed,{name:file.name,size:file.size,hash},{provenance:'imported-file'});
        const duplicate=options.findDuplicate?.(item,lesson.id);if(duplicate)throw new Error(duplicate);
        const match=bestTaskMatch(lesson,profile,item);item.confidence={...match.trust,checkedAt:new Date().toISOString(),lessonId:lesson.id,taskId:match.task?taskIdFor(lesson,match.task,match.index):''};
        progress.externalEvidence.push(item);if(progress.externalEvidence.length>30)progress.externalEvidence=progress.externalEvidence.slice(-30);options.onChange?.();options.onEvent?.('evidencia_externa_importada',item.platform.id,{evidenceId:item.id,fileHash:hash.slice(0,12),confidence:item.confidence.status});status.textContent=item.confidence.counts?'Evidência reconhecida e vinculada à aula.':'Arquivo importado, mas precisa de revisão antes de concluir a missão.';if(requiredSatisfied(lesson,progress,profile))options.onComplete?.('evidência externa reconhecida');render(container,options);
      }catch(error){status.textContent=error?.message||'Não foi possível importar o arquivo.';options.onEvent?.('evidencia_externa_rejeitada','',{reason:String(error?.message||'erro').slice(0,120)});}
    });
    paintEvidence();
  }

  window.DS_Ecosystem={catalog,render,evidenceList,requiredSatisfied,template,normalizeEvidence,classifyEvidence,bestTaskMatch,confidenceCounts,taskIdFor,trust:TRUST,trustMeta:TRUST_META,schema:EVIDENCE_SCHEMA,schemaVersion:EVIDENCE_VERSION};
})();
