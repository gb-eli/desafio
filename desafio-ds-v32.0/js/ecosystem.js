(function(){
  'use strict';

  const EVIDENCE_SCHEMA='ds-evidence';
  const EVIDENCE_VERSION=3;
  const MAX_FILE_BYTES=5_000_000;
  const TRUST=Object.freeze({
    RECOGNIZED:'RECOGNIZED',
    TEACHER_VALIDATED:'TEACHER_VALIDATED',
    PARTIAL:'PARTIAL',
    MANUAL:'MANUAL',
    REVIEW_REQUIRED:'REVIEW_REQUIRED',
    INCOMPATIBLE:'INCOMPATIBLE'
  });
  const TRUST_META=Object.freeze({
    RECOGNIZED:{label:'Comprovante anexado',tone:'ok',counts:true},
    TEACHER_VALIDATED:{label:'Registro preservado',tone:'ok',counts:true},
    PARTIAL:{label:'Comprovante incompleto',tone:'warn',counts:false},
    MANUAL:{label:'Comprovante enviado pelo aluno',tone:'ok',counts:true},
    REVIEW_REQUIRED:{label:'Falta arquivo ou link solicitado',tone:'warn',counts:false},
    INCOMPATIBLE:{label:'Pertence a outra atividade',tone:'danger',counts:false}
  });
  const catalog=Object.freeze({
    'desafio-ds':Object.freeze({id:'desafio-ds',name:'Desafio DS',category:'Atividade interna',mode:'internal',description:'Registro realizado dentro da própria aula.'}),
    'lab-virtual-ds':Object.freeze({id:'lab-virtual-ds',name:'Lab Virtual DS',category:'Laboratórios e simuladores',mode:'external'}),
    'lab-3d-vr':Object.freeze({id:'lab-3d-vr',name:'Lab 3D / HoloMotion',category:'3D, 360 e realidade virtual',mode:'external'}),
    'ctf-cyber':Object.freeze({id:'ctf-cyber',name:'CTF Cyber',category:'Cibersegurança educacional',mode:'external'}),
    'fliperama-ds':Object.freeze({id:'fliperama-ds',name:'Fliperama DS',category:'Jogos, lógica e física',mode:'external'}),
    'github':Object.freeze({id:'github',name:'GitHub',category:'Código e publicação',mode:'external'})
  });

  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const cleanText=(value,max=1600)=>String(value??'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,max);
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():`ev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const normalizedId=value=>cleanText(value,180).toLowerCase();
  const slug=value=>cleanText(value,100).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const safeStudentUrl=value=>{
    const raw=String(value||'').trim();
    if(!raw)return '';
    try{
      const url=new URL(raw);
      if(url.protocol!=='https:')return '';
      return url.href;
    }catch(_){return '';}
  };
  async function sha256(value){
    const bytes=value instanceof ArrayBuffer?value:new TextEncoder().encode(String(value));
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  async function imagePreview(file){
    if(!file?.type?.startsWith('image/'))return '';
    try{
      const bitmap=await createImageBitmap(file);
      const maxW=900,maxH=560,scale=Math.min(1,maxW/bitmap.width,maxH/bitmap.height);
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
      return canvas.toDataURL('image/jpeg',.72);
    }catch(_){return '';}
  }
  function taskIdFor(lesson,task,index=0){return cleanText(task?.id||`${lesson?.id||'lesson'}:${task?.toolId||'tool'}:${slug(task?.activity||index)}`,180);}
  function evidenceList(progress){return Array.isArray(progress?.externalEvidence)?progress.externalEvidence:[];}
  function ensureList(progress){if(!Array.isArray(progress.externalEvidence))progress.externalEvidence=[];return progress.externalEvidence;}
  function normalizeEvidence(input,fileMeta={},context={}){
    const p=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
    const platformId=cleanText(p.platform?.id||p.platformId||context.platformId||'',80);
    const platform=catalog[platformId]||{id:platformId,name:cleanText(p.platform?.name||platformId,120)};
    if(!platformId)throw new Error('Selecione a plataforma utilizada.');
    const activityTitle=cleanText(p.activity?.title||p.activityTitle||context.activityTitle||'',220);
    const evidenceId=cleanText(p.evidenceId||p.id||uuid(),120);
    return {
      id:evidenceId,evidenceId,schema:EVIDENCE_SCHEMA,schemaVersion:EVIDENCE_VERSION,
      importedAt:new Date().toISOString(),generatedAt:cleanText(p.generatedAt||new Date().toISOString(),60),
      platform:{id:platformId,name:platform.name||platformId,version:''},
      activity:{id:cleanText(context.lessonId||p.activity?.id||'',120),lessonId:cleanText(context.lessonId||p.activity?.lessonId||'',120),taskId:cleanText(context.taskId||p.activity?.taskId||'',180),title:activityTitle},
      student:{classKey:cleanText(context.classKey||p.student?.classKey||'',80),disciplineKey:cleanText(context.disciplineKey||p.student?.disciplineKey||'',100)},
      result:{status:context.status||'student-proof',summary:cleanText(p.result?.summary||p.summary||context.summary||'',1600),score:null},
      source:{url:safeStudentUrl(p.source?.url||p.repositoryUrl||context.sourceUrl||''),fileName:cleanText(fileMeta.name||p.source?.fileName||'',180),fileSize:Number(fileMeta.size||0),fileType:cleanText(fileMeta.type||'',100),fileHash:cleanText(fileMeta.hash||'',80),previewDataUrl:cleanText(fileMeta.previewDataUrl||'',350000)},
      integrity:{declared:'comprovante informado pelo aluno',localImportHash:cleanText(fileMeta.hash||'',80)},
      provenance:{type:context.provenance||'student-proof'},review:null,notes:''
    };
  }
  function classifyEvidence(item,lesson,profile,task,index=0){
    if(normalizedId(item?.platform?.id)!==normalizedId(task?.toolId))return {status:TRUST.INCOMPATIBLE,...TRUST_META.INCOMPATIBLE,reasons:['A plataforma não corresponde à missão selecionada.']};
    const expectedTask=taskIdFor(lesson,task,index);
    if(item?.activity?.lessonId&&normalizedId(item.activity.lessonId)!==normalizedId(lesson?.id))return {status:TRUST.INCOMPATIBLE,...TRUST_META.INCOMPATIBLE,reasons:['O comprovante pertence a outra aula.']};
    if(item?.activity?.taskId&&normalizedId(item.activity.taskId)!==normalizedId(expectedTask))return {status:TRUST.INCOMPATIBLE,...TRUST_META.INCOMPATIBLE,reasons:['O comprovante pertence a outra missão.']};
    if(task?.toolId==='github'&&task?.required&&!safeStudentUrl(item?.source?.url))return {status:TRUST.REVIEW_REQUIRED,...TRUST_META.REVIEW_REQUIRED,reasons:['Esta aula exige o link do repositório ou da publicação.']};
    if(catalog[task?.toolId]?.mode!=='internal'&&!item?.source?.fileName&&task?.toolId!=='github')return {status:TRUST.REVIEW_REQUIRED,...TRUST_META.REVIEW_REQUIRED,reasons:['Anexe o comprovante solicitado pela aula.']};
    if(String(item?.result?.summary||'').trim().length<20)return {status:TRUST.PARTIAL,...TRUST_META.PARTIAL,reasons:['Descreva resumidamente o que foi realizado e o resultado.']};
    return {status:TRUST.MANUAL,...TRUST_META.MANUAL,reasons:['Comprovante, plataforma e atividade foram registrados pelo aluno.']};
  }
  function bestTaskMatch(lesson,profile,item){
    const tasks=Array.isArray(lesson?.platformTasks)?lesson.platformTasks:[];
    const rows=tasks.map((task,index)=>({task,index,trust:classifyEvidence(item,lesson,profile,task,index)}));
    return rows.find(row=>row.trust.status!==TRUST.INCOMPATIBLE)||rows[0]||{task:null,index:-1,trust:{status:TRUST.INCOMPATIBLE,...TRUST_META.INCOMPATIBLE,reasons:['A aula não possui missão vinculada.']}};
  }
  function taskStatus(task,evidence,lesson,profile,index=0){
    return evidence.map(item=>({item,trust:classifyEvidence(item,lesson,profile,task,index)})).find(row=>row.trust.counts)||null;
  }
  function requiredSatisfied(lesson,progress,profile){
    const tasks=Array.isArray(lesson?.platformTasks)?lesson.platformTasks:[];
    return tasks.filter(task=>task.required).every((task,index)=>Boolean(taskStatus(task,evidenceList(progress),lesson,profile,index)));
  }
  function confidenceCounts(lesson,progress,profile){
    const counts={recognized:0,teacherValidated:0,partial:0,manual:0,incompatible:0,total:0,valid:0};
    evidenceList(progress).forEach(item=>{const trust=bestTaskMatch(lesson,profile,item).trust;counts.total++;if(trust.counts)counts.valid++;if(trust.status===TRUST.MANUAL||trust.status===TRUST.RECOGNIZED)counts.manual++;else if(trust.status===TRUST.PARTIAL||trust.status===TRUST.REVIEW_REQUIRED)counts.partial++;else counts.incompatible++;});
    return counts;
  }
  function template(lesson,profile,task,index=0){
    const tool=catalog[task?.toolId]||{id:task?.toolId||'',name:task?.toolId||''};
    return {schema:EVIDENCE_SCHEMA,schemaVersion:EVIDENCE_VERSION,evidenceId:uuid(),generatedAt:new Date().toISOString(),platform:{id:tool.id,name:tool.name},activity:{lessonId:lesson.id,taskId:taskIdFor(lesson,task,index),title:task?.activity||lesson.title},student:{name:profile?.name||'',classKey:profile?.courseKey||'',disciplineKey:profile?.disciplineKey||''},result:{status:'student-proof',summary:'Descreva o que foi realizado e o resultado.'},source:{url:'',fileName:''}};
  }

  function render(container,options={}){
    const lesson=options.lesson||{},profile=options.profile||{},progress=options.progress||{};
    const tasks=Array.isArray(lesson.platformTasks)?lesson.platformTasks:[];
    const evidence=evidenceList(progress);
    if(!tasks.length){container.innerHTML='<div class="ecosystem-empty"><strong>Esta aula é realizada dentro do Modo Guiado.</strong><p>Não é necessário abrir outra plataforma nem enviar comprovante externo.</p></div>';return;}
    container.innerHTML=`<section class="ecosystem-panel ecosystem-simple"><header><div><span class="guided-kicker">PLATAFORMA E COMPROVANTE</span><h2>Realize a atividade indicada</h2><p>Use o endereço informado pelo professor ou pelo Classroom. A plataforma aparece aqui somente pelo nome, pois os endereços podem mudar.</p></div><span class="ecosystem-evidence-count">${evidence.length} comprovante(s)</span></header><div class="ecosystem-task-list"></div><details class="ecosystem-import" ${lesson.requiresExternalEvidence?'open':''}><summary>Enviar comprovante da atividade</summary><form data-proof-form class="ecosystem-proof-form"><label>Plataforma e atividade<select name="taskIndex">${tasks.map((task,index)=>`<option value="${index}">${escapeHtml(catalog[task.toolId]?.name||task.toolId)} — ${escapeHtml(task.activity||lesson.title)}</option>`).join('')}</select></label><label>O que foi realizado e qual foi o resultado?<textarea name="summary" maxlength="1600" placeholder="Descreva o módulo, a atividade, o teste e o resultado obtido."></textarea></label><label data-proof-file-label>Comprovante da atividade<input name="proofFile" type="file" accept="image/*,.pdf,.json,.txt,.html,application/pdf,application/json,text/plain,text/html"><small>Aceita imagem, PDF, JSON, HTML ou texto de até 5 MB.</small></label><label data-github-link class="hidden">Link do código ou da publicação<input name="sourceUrl" inputmode="url" maxlength="500" placeholder="https://github.com/... ou https://...github.io/..."><small>Obrigatório somente quando a aula solicitar entrega pelo GitHub.</small></label><button class="btn primary full" type="submit">Salvar comprovante nesta aula</button><p data-proof-status class="mode-status" aria-live="polite"></p></form></details><section class="ecosystem-evidence-list"><h3>Comprovantes registrados</h3><p class="ecosystem-confidence-help">O comprovante ficará no relatório final com nome da plataforma, arquivo, horário, resumo e links informados.</p><div data-evidence-list></div></section></section>`;
    const list=container.querySelector('.ecosystem-task-list');
    tasks.forEach((task,index)=>{
      const tool=catalog[task.toolId]||{id:task.toolId,name:task.toolId,mode:'external'};
      const done=Boolean(taskStatus(task,evidence,lesson,profile,index));
      const article=document.createElement('article');article.className=`ecosystem-task-card ${done?'done':''}`;
      article.innerHTML=`<div class="ecosystem-task-head"><span>${task.required?'Obrigatória':'Complementar'}</span><strong>${escapeHtml(tool.name)}</strong><em>${done?'Comprovante enviado':'Pendente'}</em></div><p>${escapeHtml(task.activity||'Atividade indicada pelo professor.')}</p><ol>${(task.steps||[]).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><small><b>Resultado esperado:</b> ${escapeHtml(task.expectedEvidence||'Registre o resultado e anexe o comprovante.')}</small><div class="ecosystem-actions"><button data-select-task="${index}" class="btn secondary" type="button">Enviar comprovante</button></div>`;
      list.appendChild(article);
    });
    const form=container.querySelector('[data-proof-form]'),select=form.elements.taskIndex,githubLabel=form.querySelector('[data-github-link]'),fileLabel=form.querySelector('[data-proof-file-label]');
    function updateFormMode(){const task=tasks[Number(select.value)||0],github=task?.toolId==='github';githubLabel.classList.toggle('hidden',!github);fileLabel.querySelector('small').textContent=github?'Anexe uma captura, relatório ou arquivo de apoio, quando houver.':'Obrigatório para atividades realizadas em outra plataforma.';}
    updateFormMode();select.addEventListener('change',updateFormMode);
    container.querySelectorAll('[data-select-task]').forEach(button=>button.addEventListener('click',()=>{select.value=button.dataset.selectTask;updateFormMode();container.querySelector('.ecosystem-import').open=true;form.elements.summary.focus();form.scrollIntoView({behavior:'smooth',block:'center'});}));
    function paintEvidence(){
      const target=container.querySelector('[data-evidence-list]'),rows=evidenceList(progress);
      target.innerHTML=rows.length?rows.map((item,index)=>{const match=bestTaskMatch(lesson,profile,item),trust=match.trust,meta=TRUST_META[trust.status]||TRUST_META.PARTIAL;return `<article class="evidence-row evidence-${meta.tone}"><div><div class="evidence-row-title"><strong>${escapeHtml(item.platform?.name||item.platform?.id)}</strong><span class="evidence-confidence ${meta.tone}">${escapeHtml(meta.label)}</span></div><span>${escapeHtml(item.activity?.title||'Atividade')}</span><small>${escapeHtml(item.result?.summary||'Sem descrição')}</small>${item.source?.fileName?`<small>Arquivo: ${escapeHtml(item.source.fileName)} • ${Math.ceil((item.source.fileSize||0)/1024)} KB</small>`:''}${item.source?.url?`<small>Link informado: ${escapeHtml(item.source.url)}</small>`:''}${item.source?.previewDataUrl?`<img class="evidence-preview" src="${item.source.previewDataUrl}" alt="Prévia do comprovante enviado">`:''}</div><div><time>${new Date(item.importedAt||Date.now()).toLocaleString('pt-BR')}</time><button data-remove-evidence="${index}" class="btn ghost" type="button">Remover</button></div></article>`;}).join(''):'<p class="ecosystem-empty-note">Nenhum comprovante registrado ainda.</p>';
      container.querySelector('.ecosystem-evidence-count').textContent=`${rows.length} comprovante(s)`;
      target.querySelectorAll('[data-remove-evidence]').forEach(button=>button.addEventListener('click',()=>{if(!confirm('Remover este comprovante?'))return;ensureList(progress).splice(Number(button.dataset.removeEvidence),1);options.onChange?.();options.onEvent?.('comprovante_removido','',{remaining:ensureList(progress).length});render(container,options);}));
    }
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      const status=form.querySelector('[data-proof-status]'),index=Number(select.value)||0,task=tasks[index],tool=catalog[task.toolId]||{id:task.toolId,name:task.toolId,mode:'external'},summary=cleanText(form.elements.summary.value,1600),file=form.elements.proofFile.files[0],sourceUrl=safeStudentUrl(form.elements.sourceUrl?.value||'');
      if(summary.length<20){status.textContent='Explique em pelo menos 20 caracteres o que foi realizado e o resultado.';return;}
      if(tool.mode!=='internal'&&task.toolId!=='github'&&!file){status.textContent='Anexe o comprovante da atividade realizada na plataforma.';return;}
      if(task.toolId==='github'&&task.required&&!sourceUrl){status.textContent='Informe o link do repositório ou da publicação solicitado nesta aula.';return;}
      if(file&&file.size>MAX_FILE_BYTES){status.textContent='O arquivo ultrapassa 5 MB.';return;}
      try{
        let meta={};
        if(file){const buffer=await file.arrayBuffer();meta={name:file.name,size:file.size,type:file.type,hash:await sha256(buffer),previewDataUrl:await imagePreview(file)};}
        const item=normalizeEvidence({platformId:task.toolId,activityTitle:task.activity||lesson.title,summary,source:{url:sourceUrl}},meta,{platformId:task.toolId,lessonId:lesson.id,taskId:taskIdFor(lesson,task,index),activityTitle:task.activity||lesson.title,classKey:profile.courseKey,disciplineKey:profile.disciplineKey,summary,sourceUrl,provenance:tool.mode==='internal'?'internal-platform':'student-proof'});
        const duplicate=options.findDuplicate?.(item,lesson.id);if(duplicate)throw new Error(duplicate);
        item.confidence={...classifyEvidence(item,lesson,profile,task,index),checkedAt:new Date().toISOString(),lessonId:lesson.id,taskId:item.activity.taskId};
        ensureList(progress).push(item);if(progress.externalEvidence.length>30)progress.externalEvidence=progress.externalEvidence.slice(-30);
        if(task.toolId==='github'){progress.delivery=progress.delivery||{};progress.delivery.githubUrl=sourceUrl;progress.delivery.githubSavedAt=new Date().toISOString();}
        options.onChange?.();options.onEvent?.('comprovante_enviado',task.toolId,{evidenceId:item.id,fileName:meta.name||'',hasLink:!!sourceUrl});
        status.textContent='Comprovante salvo nesta aula.';form.reset();select.value=String(index);updateFormMode();if(requiredSatisfied(lesson,progress,profile))options.onComplete?.('comprovante registrado');paintEvidence();
      }catch(error){status.textContent=error?.message||'Não foi possível salvar o comprovante.';}
    });
    paintEvidence();
  }

  window.DS_Ecosystem={catalog,render,evidenceList,requiredSatisfied,template,normalizeEvidence,classifyEvidence,bestTaskMatch,confidenceCounts,taskIdFor,trust:TRUST,trustMeta:TRUST_META,schema:EVIDENCE_SCHEMA,schemaVersion:EVIDENCE_VERSION};
})();
