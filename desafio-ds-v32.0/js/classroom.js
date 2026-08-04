(function(){
  'use strict';
  const VERSION='1.0.0';
  const CLASSROOMS=Object.freeze({
    '1DS':Object.freeze({label:'1º DS — Manhã',disciplines:Object.freeze([
      Object.freeze({key:'intro-programacao',label:'Introdução à Programação',url:'https://classroom.google.com/c/ODQyMTU5MjQ3MTA1'}),
      Object.freeze({key:'analise-metodo',label:'Análise e Método para Sistemas',url:'https://classroom.google.com/c/NzkzNTA2MzQ0MjU1'})
    ])}),
    '2DS':Object.freeze({label:'2º DS — Manhã',disciplines:Object.freeze([
      Object.freeze({key:'front-end',label:'Programação Front-End',url:'https://classroom.google.com/c/ODQyMTU3NDI1MTAy'}),
      Object.freeze({key:'inovacao',label:'Inovação Tecnológica e Empreendedorismo',url:'https://classroom.google.com/c/NzkzNTA2MTk2NDg4'})
    ])}),
    '3DS':Object.freeze({label:'3º DS — Manhã',disciplines:Object.freeze([
      Object.freeze({key:'programacao-ds',label:'Programação no Desenvolvimento de Sistemas',url:'https://classroom.google.com/c/ODQyMTU2NzEwNzc1'})
    ])}),
    '2DS Noite':Object.freeze({label:'2º DS Subsequente — Noite',disciplines:Object.freeze([
      Object.freeze({key:'front-end-sub',label:'Programação Front-End',url:'https://classroom.google.com/c/ODcxMDE0NTQ3NzYw'}),
      Object.freeze({key:'mobile-1',label:'Programação Mobile I',url:'https://classroom.google.com/c/ODcxMDE0Mjg4NTU4'})
    ])})
  });
  let modal=null,lastFocus=null,request={};
  const esc=value=>window.DS_Sanitize?.escapeHtml?.(value)||String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function safeClassroomUrl(value){
    try{const url=new URL(String(value));if(url.protocol!=='https:'||url.hostname!=='classroom.google.com'||!/^\/c\/[A-Za-z0-9_-]+\/?$/.test(url.pathname))return null;return url.href;}catch(_){return null;}
  }
  function currentClass(){return window.DS_ProfileManager?.current?.()?.identity?.classKey||null;}
  function resolveCourse(courseKey){return CLASSROOMS[courseKey]?courseKey:(CLASSROOMS[currentClass()]?currentClass():null);}
  function inject(){
    if(modal)return;
    modal=document.createElement('div');modal.id='classroomSelectorModal';modal.className='modal-overlay classroom-selector-overlay hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','classroomSelectorTitle');
    modal.innerHTML=`<div class="modal-card classroom-selector-card"><header class="classroom-selector-head"><div><span class="modal-kicker">GOOGLE CLASSROOM</span><h2 id="classroomSelectorTitle">Escolha a disciplina</h2><p id="classroomSelectorSubtitle">Abra a turma correta antes de anexar sua atividade.</p></div><button id="classroomSelectorClose" class="btn ghost" type="button" aria-label="Fechar seletor do Classroom">Fechar</button></header><div id="classroomSelectorBody"></div><aside class="classroom-account-note"><strong>Antes de continuar</strong><p>Confirme que o navegador está conectado à sua conta escolar. Abrir o Classroom não confirma a entrega: anexe o arquivo ou link e selecione <b>Entregar</b>.</p></aside></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#classroomSelectorClose').addEventListener('click',close);
    modal.addEventListener('click',event=>{if(event.target===modal)close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.classList.contains('hidden'))close();});
  }
  function courseSection(courseKey,currentDiscipline){
    const course=CLASSROOMS[courseKey];
    return `<section class="classroom-course-group" data-course="${esc(courseKey)}"><div class="classroom-course-label"><span>Turma</span><strong>${esc(course.label)}</strong></div><div class="classroom-discipline-grid">${course.disciplines.map(item=>{const active=item.key===currentDiscipline;return `<button class="classroom-discipline-card${active?' is-current':''}" type="button" data-classroom-course="${esc(courseKey)}" data-classroom-discipline="${esc(item.key)}"><span class="classroom-card-icon" aria-hidden="true">CL</span><span class="classroom-card-copy"><strong>${esc(item.label)}</strong><small>${active?'Disciplina atual · ':''}Abrir turma no Classroom</small></span><span class="classroom-card-arrow" aria-hidden="true">→</span></button>`;}).join('')}</div></section>`;
  }
  function render(courseKey,currentDiscipline){
    const body=modal.querySelector('#classroomSelectorBody');const resolved=resolveCourse(courseKey);
    body.innerHTML=resolved?courseSection(resolved,currentDiscipline):`<p class="classroom-selector-intro">Nenhuma turma ativa foi identificada. Escolha primeiro a turma e depois a disciplina.</p>${Object.keys(CLASSROOMS).map(key=>courseSection(key,currentDiscipline)).join('')}`;
    body.querySelectorAll('[data-classroom-discipline]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.classroomCourse,button.dataset.classroomDiscipline)));
  }
  function select(courseKey,disciplineKey){
    const course=CLASSROOMS[courseKey],item=course?.disciplines.find(entry=>entry.key===disciplineKey);const url=safeClassroomUrl(item?.url);if(!course||!item||!url)return;
    const detail={courseKey,courseLabel:course.label,disciplineKey,disciplineLabel:item.label,url,source:request.source||'manual',openedAt:new Date().toISOString(),version:VERSION};
    try{request.onOpen?.(detail);}catch(error){console.warn('Classroom callback:',error);}
    document.dispatchEvent(new CustomEvent('ds:classroom-opened',{detail}));
    window.open(url,'_blank','noopener,noreferrer');close();
  }
  function open(options={}){inject();request=options||{};lastFocus=document.activeElement;render(options.courseKey,options.disciplineKey);modal.classList.remove('hidden');document.body.classList.add('modal-open');setTimeout(()=>modal.querySelector('.classroom-discipline-card')?.focus(),30);return true;}
  function close(){if(!modal)return;modal.classList.add('hidden');document.body.classList.remove('modal-open');request={};lastFocus?.focus?.();lastFocus=null;}
  function get(courseKey,disciplineKey){const course=CLASSROOMS[courseKey],item=course?.disciplines.find(entry=>entry.key===disciplineKey);return item?{...item,courseKey,courseLabel:course.label}:null;}
  function list(courseKey){const course=CLASSROOMS[courseKey];return course?course.disciplines.map(item=>({...item,courseKey,courseLabel:course.label})):Object.entries(CLASSROOMS).flatMap(([key])=>list(key));}
  window.DS_Classroom={open,close,get,list,catalog:CLASSROOMS,version:VERSION};
})();
