(function(){
  'use strict';

  const resources = window.DS_CODE_RESOURCES || {};
  let overlay = null;
  let currentResource = null;
  let currentLesson = null;
  let selectedFile = 0;
  let currentTab = 'overview';
  let onEvent = null;

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function safeName(value){
    return String(value||'projeto').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
  }
  function emit(type, detail={}){
    try { if(typeof onEvent === 'function') onEvent(type, detail); } catch(_){}
  }
  function resourceForLesson(lesson){
    return lesson?.codeResourceId ? resources[lesson.codeResourceId] || null : null;
  }
  function ensureModal(){
    if(overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'guidedCodeCenter';
    overlay.className = 'code-center-overlay hidden';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','codeCenterTitle');
    overlay.innerHTML = `
      <div class="code-center-card">
        <header class="code-center-header">
          <div><span class="code-center-kicker">CENTRAL DE CÓDIGO</span><h2 id="codeCenterTitle">Código da aula</h2><p id="codeCenterDescription"></p></div>
          <button id="codeCenterClose" class="code-center-close" type="button" aria-label="Fechar central de código">×</button>
        </header>
        <nav id="codeCenterTabs" class="code-center-tabs" aria-label="Seções da central de código"></nav>
        <div id="codeCenterBody" class="code-center-body"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#codeCenterClose').addEventListener('click', close);
    overlay.addEventListener('click', event=>{ if(event.target===overlay) close(); });
    document.addEventListener('keydown', event=>{ if(event.key==='Escape' && !overlay.classList.contains('hidden')) close(); });
  }
  function open(lesson, options={}){
    const resource = resourceForLesson(lesson);
    if(!resource) return false;
    ensureModal();
    currentLesson = lesson;
    currentResource = resource;
    selectedFile = 0;
    currentTab = 'overview';
    onEvent = options.onEvent || null;
    overlay.querySelector('#codeCenterTitle').textContent = resource.title || 'Código da aula';
    overlay.querySelector('#codeCenterDescription').textContent = resource.description || '';
    renderTabs();
    render();
    overlay.classList.remove('hidden');
    document.body.classList.add('code-center-open');
    overlay.querySelector('#codeCenterClose').focus();
    emit('codigo_central_aberta',{resourceId:resource.id,lessonId:lesson?.id||''});
    return true;
  }
  function close(){
    if(!overlay) return;
    overlay.classList.add('hidden');
    document.body.classList.remove('code-center-open');
    emit('codigo_central_fechada',{resourceId:currentResource?.id||''});
    currentResource=null;currentLesson=null;onEvent=null;
  }
  function renderTabs(){
    const tabs=[['overview','Visão geral'],['files','Arquivos'],['terminal','Terminal e dependências'],['help','Ajuda e limitações']];
    overlay.querySelector('#codeCenterTabs').innerHTML=tabs.map(([id,label])=>`<button type="button" data-code-tab="${id}" class="${id===currentTab?'active':''}">${escapeHtml(label)}</button>`).join('');
    overlay.querySelectorAll('[data-code-tab]').forEach(button=>button.addEventListener('click',()=>{
      currentTab=button.dataset.codeTab;renderTabs();render();emit('codigo_aba_aberta',{tab:currentTab,resourceId:currentResource?.id||''});
    }));
  }
  function render(){
    const body=overlay.querySelector('#codeCenterBody');
    if(!currentResource){body.innerHTML='<p>Recurso indisponível.</p>';return;}
    if(currentTab==='overview') renderOverview(body);
    else if(currentTab==='files') renderFiles(body);
    else if(currentTab==='terminal') renderTerminal(body);
    else renderHelp(body);
  }
  function renderOverview(body){
    const r=currentResource;
    const canPreview=r.kind==='web' && r.files.some(f=>f.name==='index.html');
    body.innerHTML=`
      <section class="code-center-overview">
        <div class="code-center-tags">${(r.tags||[]).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div>
        <h3>Deseja recuperar o código ou testar na sua máquina?</h3><div class="code-center-actions">
          ${canPreview?'<button id="codePreviewBtn" class="btn primary" type="button">Testar aqui</button>':''}
          <button id="codeZipBtn" class="btn secondary" type="button">Baixar projeto .ZIP</button>
          <button id="codeVscodeBtn" class="btn ghost" type="button">Abrir VS Code Web</button>
        </div>
        <div class="code-center-notice"><strong>Como usar:</strong> baixe e extraia o projeto antes de abrir a pasta no VS Code. A prévia interna serve para testes rápidos e pode limitar APIs, arquivos e recursos externos.</div>
        <section><h3>Passos para testar</h3><ol>${(r.runSteps||[]).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol></section>
        <section><h3>Arquivos incluídos</h3><div class="code-file-summary">${r.files.map((f,i)=>`<button type="button" data-open-file="${i}"><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.description||f.language||'')}</span></button>`).join('')}</div></section>
        <div id="codePreviewArea" class="code-preview-area hidden"></div>
      </section>`;
    body.querySelector('#codeZipBtn').addEventListener('click',()=>downloadProject(r));
    body.querySelector('#codeVscodeBtn').addEventListener('click',()=>{
      emit('codigo_vscode_aberto',{resourceId:r.id});
      window.open('https://vscode.dev/','_blank','noopener,noreferrer');
    });
    body.querySelector('#codePreviewBtn')?.addEventListener('click',()=>renderPreview(body.querySelector('#codePreviewArea')));
    body.querySelectorAll('[data-open-file]').forEach(button=>button.addEventListener('click',()=>{selectedFile=Number(button.dataset.openFile)||0;currentTab='files';renderTabs();render();}));
  }
  function renderFiles(body){
    const r=currentResource;
    const file=r.files[selectedFile]||r.files[0];
    body.innerHTML=`
      <div class="code-files-layout">
        <aside class="code-file-list" aria-label="Arquivos do projeto">${r.files.map((f,i)=>`<button type="button" data-file-index="${i}" class="${i===selectedFile?'active':''}"><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.language||'')}</span></button>`).join('')}</aside>
        <section class="code-file-view">
          <header><div><h3>${escapeHtml(file.name)}</h3><p>${escapeHtml(file.description||'')}</p></div><div class="code-file-actions"><button id="copyCurrentCode" class="btn ghost" type="button">Copiar</button><button id="downloadCurrentFile" class="btn secondary" type="button">Baixar arquivo</button></div></header>
          <pre tabindex="0"><code>${escapeHtml(file.code)}</code></pre>
        </section>
      </div>`;
    body.querySelectorAll('[data-file-index]').forEach(button=>button.addEventListener('click',()=>{selectedFile=Number(button.dataset.fileIndex)||0;render();}));
    body.querySelector('#copyCurrentCode').addEventListener('click',async event=>{
      const ok=await copyText(file.code);event.target.textContent=ok?'Copiado!':'Não foi possível copiar';setTimeout(()=>event.target.textContent='Copiar',1600);emit('codigo_copiado',{resourceId:r.id,file:file.name,ok});
    });
    body.querySelector('#downloadCurrentFile').addEventListener('click',()=>{downloadBlob(new Blob([file.code],{type:'text/plain;charset=utf-8'}),file.name);emit('codigo_arquivo_baixado',{resourceId:r.id,file:file.name});});
  }
  function renderTerminal(body){
    const r=currentResource;
    const commands=r.commands||[];
    const deps=r.dependencies||[];
    body.innerHTML=`
      <div class="code-terminal-grid">
        <section><h3>Comandos para copiar</h3>${commands.length?commands.map((item,index)=>`<article class="command-card"><div><strong>${escapeHtml(item.label||'Comando')}</strong><p>${escapeHtml(item.note||'')}</p></div><pre><code>${escapeHtml(item.command)}</code></pre><button type="button" data-copy-command="${index}" class="btn ghost">Copiar comando</button></article>`).join(''):'<p class="code-empty">Esta aula não exige comandos adicionais.</p>'}</section>
        <section><h3>Dependências e verificação</h3>${deps.length?deps.map(dep=>`<article class="dependency-card"><header><strong>${escapeHtml(dep.name)}</strong><span>${dep.required?'Obrigatória':'Opcional'}</span></header><p><b>Finalidade:</b> ${escapeHtml(dep.purpose||'')}</p><p><b>Instalação:</b> ${escapeHtml(dep.install||'Consulte a documentação oficial.')}</p><p><b>Verificação:</b> <code>${escapeHtml(dep.verify||'')}</code></p></article>`).join(''):'<p class="code-empty">O projeto usa somente recursos nativos ou não exige instalação adicional.</p>'}</section>
      </div>`;
    body.querySelectorAll('[data-copy-command]').forEach(button=>button.addEventListener('click',async()=>{
      const command=commands[Number(button.dataset.copyCommand)]?.command||'';const ok=await copyText(command);button.textContent=ok?'Copiado!':'Falha ao copiar';setTimeout(()=>button.textContent='Copiar comando',1600);emit('codigo_comando_copiado',{resourceId:r.id,commandLabel:commands[Number(button.dataset.copyCommand)]?.label||'',ok});
    }));
  }
  function renderHelp(body){
    const r=currentResource;
    body.innerHTML=`
      <div class="code-help-grid">
        <section><h3>Perguntas frequentes</h3>${(r.faq||[]).map((item,index)=>`<details ${index===0?'open':''}><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</section>
        <section><h3>Limitações e cuidados</h3><ul>${(r.limitations||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="code-center-warning"><strong>Antes de publicar</strong><p>Não envie senhas, tokens, chaves, arquivos .env nem dados pessoais para o GitHub.</p></div></section>
      </div>`;
  }
  function renderPreview(container){
    try{
      const srcdoc=composeWebPreview(currentResource);
      container.innerHTML='<div class="code-preview-toolbar"><strong>Prévia isolada</strong><button type="button" class="btn ghost" id="closeCodePreview">Fechar prévia</button></div><iframe title="Prévia do projeto da aula" sandbox="allow-scripts allow-forms"></iframe>';
      container.querySelector('iframe').srcdoc=srcdoc;
      container.classList.remove('hidden');
      container.querySelector('#closeCodePreview').addEventListener('click',()=>{container.classList.add('hidden');container.innerHTML='';});
      emit('codigo_previa_aberta',{resourceId:currentResource.id});
    }catch(error){
      container.innerHTML=`<p class="code-center-error">Não foi possível montar a prévia: ${escapeHtml(error.message)}</p>`;container.classList.remove('hidden');
    }
  }
  function composeWebPreview(resource){
    const index=resource.files.find(f=>f.name==='index.html');
    if(!index) throw new Error('index.html não encontrado');
    const css=resource.files.filter(f=>/\.css$/i.test(f.name)).map(f=>`/* ${f.name} */\n${f.code}`).join('\n');
    const js=resource.files.filter(f=>/\.js$/i.test(f.name) && !/sw\.js$/i.test(f.name)).map(f=>`/* ${f.name} */\n${f.code}`).join('\n');
    let html=index.code
      .replace(/<link\b[^>]*href=["'][^"']+\.css(?:\?[^"']*)?["'][^>]*>/gi,'')
      .replace(/<script\b[^>]*src=["'][^"']+\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');
    const policy=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; connect-src https://jsonplaceholder.typicode.com; form-action 'none'; base-uri 'none'">`;
    html=html.replace(/<head([^>]*)>/i,`<head$1>${policy}<style>${css}</style>`);
    html=html.replace(/<\/body>/i,`<script>${js.replace(/<\/script/gi,'<\\/script')}</script></body>`);
    return html;
  }
  async function copyText(value){
    try{const result=await window.DS_Permissions?.explain?.('clipboard-write',()=>navigator.clipboard.writeText(String(value)));if(result?.allowed)return true;}catch(_){
      try{const area=document.createElement('textarea');area.value=String(value);area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return ok;}catch(__){return false;}
    }
  }
  function downloadProject(resource){
    const files=resource.files.map(file=>({name:file.name,data:new TextEncoder().encode(file.code)}));
    const blob=makeZip(files);
    const name=`${safeName(resource.title)}.zip`;
    downloadBlob(blob,name);
    emit('codigo_projeto_baixado',{resourceId:resource.id,fileCount:files.length,name});
  }
  function downloadBlob(blob,name){
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  const crcTable=(()=>{const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}return table;})();
  function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&0xff]^(crc>>>8);return (crc^0xffffffff)>>>0;}
  function dosDateTime(date=new Date()){
    const year=Math.max(1980,date.getFullYear());
    return {date:((year-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate(),time:(date.getHours()<<11)|(date.getMinutes()<<5)|Math.floor(date.getSeconds()/2)};
  }
  function u16(value){return [value&255,(value>>>8)&255];}
  function u32(value){return [value&255,(value>>>8)&255,(value>>>16)&255,(value>>>24)&255];}
  function concat(chunks){const length=chunks.reduce((sum,c)=>sum+c.length,0);const out=new Uint8Array(length);let offset=0;chunks.forEach(c=>{out.set(c,offset);offset+=c.length;});return out;}
  function makeZip(files){
    const locals=[];const centrals=[];let offset=0;const dt=dosDateTime();
    files.forEach(file=>{
      const name=new TextEncoder().encode(file.name.replace(/^\/+/,''));const data=file.data;const crc=crc32(data);const flags=0x0800;
      const local=Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(flags),...u16(0),...u16(dt.time),...u16(dt.date),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);
      locals.push(local,data);
      const central=Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(flags),...u16(0),...u16(dt.time),...u16(dt.date),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]);
      centrals.push(central);offset+=local.length+data.length;
    });
    const centralData=concat(centrals);const end=Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralData.length),...u32(offset),...u16(0)]);
    return new Blob([...locals,centralData,end],{type:'application/zip'});
  }

  window.DS_CodeCenter={open,close,has:lesson=>Boolean(resourceForLesson(lesson)),getResource:resourceForLesson,downloadProject:lesson=>{const r=resourceForLesson(lesson);if(r)downloadProject(r);}};
})();
