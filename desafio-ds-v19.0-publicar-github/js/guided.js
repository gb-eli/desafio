(function(){
  'use strict';

  const DATA = window.DS_GUIDED_DATA;
  if(!DATA) return;

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const STORAGE_KEY = 'desafio_ds_guided_v19';
  const PROFILE_KEY = 'desafio_ds_guided_profile_v19';
  const SUPPORT_KEY = 'desafio_ds_guided_support_v19';
  const STEP_NAMES = ['Abertura','Diagnóstico','Explicação','Explicações extras','Demonstração','Prática guiada','Laboratório','Desafio','Revisão','Conclusão e entrega'];
  const SUPPORT_LABELS = {
    focus:'uma etapa por vez', reading:'leitura facilitada', vision:'fonte e contraste',
    pace:'mais dicas e passo a passo', advanced:'aprofundamento'
  };
  const THEME_BY_DISCIPLINE = {
    'intro-programacao':'theme-python', 'analise-metodo':'theme-analysis', 'front-end':'theme-front',
    'front-end-sub':'theme-front', inovacao:'theme-innovation', 'programacao-ds':'theme-python', 'mobile-1':'theme-back'
  };
  const CLASS_THEME = {'1DS':'class-ds1','2DS':'class-ds2','3DS':'class-ds3','2DS Noite':'class-night'};
  const EXTERNAL_LINKS = {
    'intro-programacao':[
      ['Documentação Python','https://docs.python.org/3/'],['Jupyter no navegador','https://jupyter.org/try'],['GitHub','https://github.com/']
    ],
    'analise-metodo':[
      ['GitHub Projects','https://github.com/features/issues'],['Figma','https://www.figma.com/'],['Miro','https://miro.com/']
    ],
    'front-end':[
      ['MDN Web Docs','https://developer.mozilla.org/pt-BR/'],['VS Code','https://code.visualstudio.com/'],['GitHub','https://github.com/']
    ],
    'front-end-sub':[
      ['MDN Web Docs','https://developer.mozilla.org/pt-BR/'],['VS Code','https://code.visualstudio.com/'],['GitHub','https://github.com/']
    ],
    inovacao:[
      ['Figma/FigJam','https://www.figma.com/figjam/'],['Canva','https://www.canva.com/'],['Miro','https://miro.com/']
    ],
    'programacao-ds':[
      ['Python','https://docs.python.org/3/'],['Compiler Explorer','https://godbolt.org/'],['Java Learn','https://dev.java/learn/']
    ],
    'mobile-1':[
      ['Android Developers','https://developer.android.com/'],['Flutter','https://docs.flutter.dev/'],['React Native','https://reactnative.dev/']
    ]
  };

  const el = {
    startScreen: $('#startScreen'), challengeForm: $('#startForm'), guidedForm: $('#guidedStartForm'),
    challengeTab: $('#experienceChallengeBtn'), guidedTab: $('#experienceGuidedBtn'),
    name: $('#guidedPlayerName'), course: $('#guidedPlayerClass'), discipline: $('#guidedDiscipline'),
    supportEnabled: $('#guidedSupportEnabled'), supportOptions: $('#guidedSupportOptions'), supportTeacher: $('#guidedSupportTeacher'), supportNote: $('#guidedSupportNote'),
    catalog: $('#guidedCatalogScreen'), catalogIdentity: $('#guidedCatalogIdentity'), catalogTitle: $('#guidedCatalogTitle'), catalogDescription: $('#guidedCatalogDescription'),
    overallProgress: $('#guidedOverallProgress'), overallBar: $('#guidedOverallProgressBar'), lessonList: $('#guidedLessonList'), resumeBanner: $('#guidedResumeBanner'),
    teacherPanelBtn: $('#guidedTeacherPanelBtn'), changeProfile: $('#guidedChangeProfileBtn'),
    lessonScreen: $('#guidedLessonScreen'), lessonTitle: $('#guidedLessonTitle'), lessonMeta: $('#guidedLessonMeta'), activeTime: $('#guidedActiveTime'), stepIndicator: $('#guidedStepIndicator'),
    lessonBar: $('#guidedLessonProgressBar'), stepContent: $('#guidedStepContent'), stepFeedback: $('#guidedStepFeedback'), prev: $('#guidedPrevStepBtn'), next: $('#guidedNextStepBtn'),
    extraBtn: $('#guidedExtraBtn'), teacherRelease: $('#guidedTeacherReleaseBtn'), stepList: $('#guidedStepList'), sessionStatus: $('#guidedSessionStatus'), idleCount: $('#guidedIdleCount'),
    toolShortcuts: $('#guidedToolShortcuts'), backCatalog: $('#guidedBackToCatalogBtn'), watermark: $('#guidedWatermark'), supportMenu: $('#guidedSupportMenuBtn'),
    unlockModal: $('#guidedUnlockModal'), unlockTitle: $('#guidedUnlockTitle'), unlockDescription: $('#guidedUnlockDescription'), lessonCode: $('#guidedLessonCode'), unlockStatus: $('#guidedUnlockStatus'), unlockCancel: $('#guidedUnlockCancelBtn'), unlockConfirm: $('#guidedUnlockConfirmBtn'),
    extraModal: $('#guidedExtraModal'), extraTitle: $('#guidedExtraTitle'), extraOptions: $('#guidedExtraOptions'), extraContent: $('#guidedExtraContent'), extraClose: $('#guidedExtraCloseBtn'),
    teacherModal: $('#guidedTeacherModal'), teacherName: $('#guidedTeacherName'), teacherPassword: $('#guidedTeacherPassword'), teacherReason: $('#guidedTeacherReason'), teacherNote: $('#guidedTeacherNote'), teacherStatus: $('#guidedTeacherStatus'), teacherCancel: $('#guidedTeacherCancelBtn'), teacherConfirm: $('#guidedTeacherConfirmBtn'),
    supportDrawer: $('#guidedSupportDrawer'), supportDrawerClose: $('#guidedSupportDrawerClose'), fontLarge: $('#guidedFontLarge'), focusMode: $('#guidedFocusMode'), reducedMotion: $('#guidedReducedMotion'), detailedDefault: $('#guidedDetailedDefault'),
    idleOverlay: $('#guidedIdleOverlay'), idleTitle: $('#guidedIdleTitle'), idleMessage: $('#guidedIdleMessage'), idleContinue: $('#guidedIdleContinueBtn')
  };

  let profile = null;
  let pendingLesson = null;
  let currentLesson = null;
  let currentProgress = null;
  let currentStep = 0;
  let canAdvance = false;
  let stepOpenedAt = 0;
  let readGateTimer = null;
  let ticker = null;
  let lastActivityAt = Date.now();
  let hiddenAt = 0;
  let externalAuthorizedUntil = 0;
  let teacherAction = null;
  let currentDemoState = {};

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function sanitizeName(value){
    return String(value || '').replace(/[<>\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().slice(0,80);
  }
  function storageRead(key, fallback){
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch(_) { return fallback; }
  }
  function storageWrite(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_){} }
  function getAllProgress(){ return storageRead(STORAGE_KEY, {}); }
  function saveAllProgress(data){ storageWrite(STORAGE_KEY, data); }
  function progressKey(lessonId){ return `${profile?.name || 'anon'}|${profile?.courseKey || ''}|${lessonId}`.toLowerCase(); }
  function getProgress(lesson){
    const all = getAllProgress();
    const key = progressKey(lesson.id);
    return all[key] || {
      lessonId:lesson.id, unlocked:false, completed:false, currentStep:0, completedSteps:[], activeSeconds:0,
      idleEpisodes:0, events:[], answers:{}, labData:{}, extraUsed:[], extraHelpful:{}, exports:0,
      teacherOverride:null, startedAt:null, completedAt:null, lastAccess:null, sessionId:createSessionId()
    };
  }
  function saveProgress(progress=currentProgress){
    if(!profile || !progress || !progress.lessonId) return;
    progress.lastAccess = new Date().toISOString();
    const all = getAllProgress();
    all[progressKey(progress.lessonId)] = progress;
    saveAllProgress(all);
  }
  function logEvent(type, detail='', extra={}){
    if(!currentProgress) return;
    currentProgress.events = Array.isArray(currentProgress.events) ? currentProgress.events : [];
    currentProgress.events.push({at:new Date().toISOString(), type, detail:String(detail).slice(0,300), ...extra});
    if(currentProgress.events.length > 500) currentProgress.events = currentProgress.events.slice(-500);
    saveProgress();
  }
  function createSessionId(){
    const array = new Uint32Array(2); crypto.getRandomValues(array);
    return `GUIA-${array[0].toString(36).slice(-4).toUpperCase()}${array[1].toString(36).slice(-4).toUpperCase()}`;
  }
  async function sha256(value){
    const bytes = new TextEncoder().encode(String(value));
    const buffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function fmt(seconds){
    const s = Math.max(0, Number(seconds)||0), m = Math.floor(s/60), r = Math.floor(s%60);
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
  }
  function courseData(){ return DATA.courses[profile?.courseKey] || null; }
  function disciplineData(){ return courseData()?.disciplines?.[profile?.disciplineKey] || null; }
  function lessonById(id){ return DATA.lessons.find(item=>item.id===id) || null; }
  function supportPreferences(){ return storageRead(SUPPORT_KEY, {fontLarge:false,focusMode:false,reducedMotion:false,detailedDefault:false}); }
  function saveSupportPreferences(){
    const preferences = {fontLarge:!!el.fontLarge?.checked,focusMode:!!el.focusMode?.checked,reducedMotion:!!el.reducedMotion?.checked,detailedDefault:!!el.detailedDefault?.checked};
    storageWrite(SUPPORT_KEY, preferences); applySupportPreferences();
    if(currentProgress) logEvent('preferencias_apoio', Object.entries(preferences).filter(([,v])=>v).map(([k])=>k).join(', ') || 'padrão');
  }
  function applySupportPreferences(){
    const p = supportPreferences();
    document.body.classList.toggle('guided-large-text', !!p.fontLarge || profile?.supports?.includes('vision'));
    document.body.classList.toggle('guided-focus-mode', !!p.focusMode || profile?.supports?.includes('focus'));
    document.body.classList.toggle('guided-reduced-motion', !!p.reducedMotion);
    if(el.fontLarge) el.fontLarge.checked=!!p.fontLarge;
    if(el.focusMode) el.focusMode.checked=!!p.focusMode;
    if(el.reducedMotion) el.reducedMotion.checked=!!p.reducedMotion;
    if(el.detailedDefault) el.detailedDefault.checked=!!p.detailedDefault;
  }

  function install(){
    el.challengeTab?.addEventListener('click', ()=>switchExperience('challenge'));
    el.guidedTab?.addEventListener('click', ()=>switchExperience('guided'));
    el.course?.addEventListener('change', ()=>{ populateDisciplines(); updateGuidedClassTheme(); });
    el.supportEnabled?.addEventListener('change', ()=>el.supportOptions?.classList.toggle('hidden', !el.supportEnabled.checked));
    el.guidedForm?.addEventListener('submit', enterCatalog);
    el.changeProfile?.addEventListener('click', backToGuidedEntry);
    el.teacherPanelBtn?.addEventListener('click', ()=>openTeacherModal('panel'));
    el.backCatalog?.addEventListener('click', returnToCatalog);
    el.prev?.addEventListener('click', previousStep);
    el.next?.addEventListener('click', nextStep);
    el.extraBtn?.addEventListener('click', openExtraModal);
    el.extraClose?.addEventListener('click', closeExtraModal);
    el.teacherRelease?.addEventListener('click', ()=>openTeacherModal('release'));
    el.supportMenu?.addEventListener('click', ()=>el.supportDrawer?.classList.remove('hidden'));
    el.supportDrawerClose?.addEventListener('click', ()=>el.supportDrawer?.classList.add('hidden'));
    [el.fontLarge,el.focusMode,el.reducedMotion,el.detailedDefault].forEach(node=>node?.addEventListener('change',saveSupportPreferences));
    el.unlockCancel?.addEventListener('click', closeUnlockModal);
    el.unlockConfirm?.addEventListener('click', confirmLessonCode);
    el.lessonCode?.addEventListener('input', ()=>{ el.lessonCode.value=el.lessonCode.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5); });
    el.lessonCode?.addEventListener('keydown', e=>{ if(e.key==='Enter'){e.preventDefault();confirmLessonCode();} });
    el.teacherCancel?.addEventListener('click', closeTeacherModal);
    el.teacherConfirm?.addEventListener('click', confirmTeacherAction);
    el.idleContinue?.addEventListener('click', resumeFromIdle);
    ['pointerdown','keydown','touchstart','scroll'].forEach(type=>document.addEventListener(type,registerActivity,{passive:true}));
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('beforeunload', ()=>saveProgress());
    populateDisciplines(); restoreProfile(); applySupportPreferences();
    if(new URLSearchParams(location.search).get('modo')==='guiado') switchExperience('guided');
  }

  function switchExperience(mode){
    const guided = mode === 'guided';
    el.challengeTab?.classList.toggle('active', !guided);
    el.guidedTab?.classList.toggle('active', guided);
    el.challengeTab?.setAttribute('aria-selected', String(!guided));
    el.guidedTab?.setAttribute('aria-selected', String(guided));
    el.challengeForm?.classList.toggle('hidden', guided);
    el.guidedForm?.classList.toggle('hidden', !guided);
    document.body.classList.toggle('guided-entry-active', guided);
    if(guided){
      updateGuidedClassTheme(); restoreProfileToForm();
    } else {
      const challengeCourse=document.querySelector('#playerClass')?.value || '1DS';
      document.body.classList.remove('class-ds1','class-ds2','class-ds3','class-night','theme-python','theme-analysis','theme-front','theme-innovation','theme-back');
      document.body.classList.add(CLASS_THEME[challengeCourse] || 'class-ds1');
    }
  }
  function populateDisciplines(){
    if(!el.course || !el.discipline) return;
    const course = DATA.courses[el.course.value] || DATA.courses['1DS'];
    el.discipline.innerHTML='';
    Object.entries(course.disciplines).forEach(([key,item])=>{
      const option=document.createElement('option'); option.value=key; option.textContent=item.label; el.discipline.appendChild(option);
    });
  }
  function updateGuidedClassTheme(){
    const course = el.course?.value || profile?.courseKey || '1DS';
    document.body.classList.remove('class-ds1','class-ds2','class-ds3','class-night','theme-python','theme-analysis','theme-front','theme-innovation','theme-back');
    document.body.classList.add(CLASS_THEME[course] || 'class-ds1');
    const discipline = el.discipline?.value || profile?.disciplineKey;
    if(discipline && THEME_BY_DISCIPLINE[discipline]) document.body.classList.add(THEME_BY_DISCIPLINE[discipline]);
  }
  function restoreProfile(){ profile = storageRead(PROFILE_KEY,null); }
  function restoreProfileToForm(){
    if(!profile) return;
    if(el.name) el.name.value=profile.name || '';
    if(el.course && DATA.courses[profile.courseKey]) el.course.value=profile.courseKey;
    populateDisciplines();
    if(el.discipline && courseDataFrom(profile.courseKey)?.disciplines?.[profile.disciplineKey]) el.discipline.value=profile.disciplineKey;
    if(el.supportEnabled){ el.supportEnabled.checked=!!profile.supportEnabled; el.supportOptions?.classList.toggle('hidden',!profile.supportEnabled); }
    $$('input[name="guidedSupport"]').forEach(input=>input.checked=(profile.supports||[]).includes(input.value));
    if(el.supportTeacher) el.supportTeacher.value=profile.supportTeacher || '';
    if(el.supportNote) el.supportNote.value=profile.supportNote || '';
    updateGuidedClassTheme();
  }
  function courseDataFrom(key){ return DATA.courses[key] || null; }
  function enterCatalog(event){
    event.preventDefault();
    const name=sanitizeName(el.name?.value);
    if(!name){ el.name?.focus(); return; }
    const courseKey=el.course.value, disciplineKey=el.discipline.value;
    const supports=el.supportEnabled?.checked ? $$('input[name="guidedSupport"]:checked').map(x=>x.value) : [];
    profile={name,courseKey,disciplineKey,supportEnabled:!!el.supportEnabled?.checked,supports,supportTeacher:sanitizeName(el.supportTeacher?.value),supportNote:String(el.supportNote?.value||'').trim().slice(0,240)};
    storageWrite(PROFILE_KEY,profile);
    updateGuidedClassTheme(); applySupportPreferences(); showCatalog();
  }
  function backToGuidedEntry(){
    stopTicker(); currentLesson=null; currentProgress=null;
    [el.catalog,el.lessonScreen].forEach(screen=>screen?.classList.remove('active'));
    el.startScreen?.classList.add('active'); document.body.classList.remove('guided-active','game-active');
    switchExperience('guided');
  }
  function showCatalog(){
    stopTicker(); currentLesson=null; currentProgress=null;
    el.startScreen?.classList.remove('active'); el.lessonScreen?.classList.remove('active'); el.catalog?.classList.add('active');
    document.body.classList.add('guided-active'); document.body.classList.remove('game-active');
    const course=courseData(), discipline=disciplineData();
    if(!course || !discipline) return backToGuidedEntry();
    el.catalogIdentity.textContent=`${profile.name} • ${course.label}`;
    el.catalogTitle.textContent=discipline.label;
    el.catalogDescription.textContent=`${discipline.lessons.length} aulas organizadas em sequência. Abra a aula com o código fornecido pelo professor e continue do ponto salvo.`;
    renderCatalog();
  }
  function renderCatalog(){
    const lessons=disciplineData()?.lessons || [];
    let completed=0, last=null;
    el.lessonList.innerHTML='';
    lessons.forEach(lesson=>{
      const progress=getProgress(lesson);
      if(progress.completed) completed++;
      if(progress.unlocked && !progress.completed) last={lesson,progress};
      const percentage=progress.completed ? 100 : Math.round((new Set(progress.completedSteps||[]).size/STEP_NAMES.length)*100);
      const article=document.createElement('article'); article.className=`guided-lesson-card ${progress.completed?'completed':progress.unlocked?'unlocked':'locked'}`;
      article.innerHTML=`
        <div class="guided-lesson-number">${String(lesson.number).padStart(2,'0')}</div>
        <div class="guided-lesson-card-main">
          <div class="guided-lesson-tags"><span>${escapeHtml(lesson.module)}</span><span>${progress.completed?'Concluída':progress.unlocked?'Em andamento':'Código necessário'}</span></div>
          <h2>${escapeHtml(lesson.title)}</h2>
          <p>${escapeHtml(lesson.focus)}</p>
          <div class="guided-card-progress"><i style="width:${percentage}%"></i></div>
          <small>${percentage}% • mínimo de ${Math.round(lesson.minimumActiveSeconds/60)} minutos ativos</small>
        </div>
        <div class="guided-lesson-card-actions">
          <button class="btn ${progress.unlocked?'primary':'secondary'} guided-open-lesson" type="button">${progress.completed?'Revisar':progress.unlocked?'Continuar':'Inserir código'}</button>
        </div>`;
      $('.guided-open-lesson',article).addEventListener('click',()=>requestLesson(lesson));
      el.lessonList.appendChild(article);
    });
    const pct=lessons.length?Math.round(completed/lessons.length*100):0;
    el.overallProgress.textContent=`${pct}%`; el.overallBar.style.width=`${pct}%`;
    if(last){
      el.resumeBanner.classList.remove('hidden');
      el.resumeBanner.innerHTML=`<div><strong>Continuar aula ${last.lesson.number}</strong><span>${escapeHtml(last.lesson.title)} • etapa ${(last.progress.currentStep||0)+1}</span></div><button class="btn primary" type="button">Retomar</button>`;
      $('button',el.resumeBanner).addEventListener('click',()=>openLesson(last.lesson));
    } else el.resumeBanner.classList.add('hidden');
  }
  function requestLesson(lesson){
    const progress=getProgress(lesson);
    if(progress.unlocked || progress.completed) return openLesson(lesson);
    pendingLesson=lesson;
    el.unlockTitle.textContent=`Liberar aula ${lesson.number}`;
    el.unlockDescription.textContent=`${lesson.title}. Digite o código curto fornecido pelo professor.`;
    el.lessonCode.value=''; el.unlockStatus.textContent=''; el.unlockModal.classList.remove('hidden'); setTimeout(()=>el.lessonCode.focus(),50);
  }
  function closeUnlockModal(){ pendingLesson=null; el.unlockModal?.classList.add('hidden'); }
  async function confirmLessonCode(){
    if(!pendingLesson) return closeUnlockModal();
    const value=String(el.lessonCode.value||'').toUpperCase().trim();
    const progress=getProgress(pendingLesson);
    progress.events=progress.events||[];
    const codeHash=await sha256(value);
    const correct=codeHash===pendingLesson.codeHash;
    progress.events.push({at:new Date().toISOString(),type:'tentativa_codigo',detail:correct?'correto':'incorreto'});
    if(!correct){
      el.unlockStatus.textContent='Código incorreto. Confira com o professor.'; el.unlockStatus.className='mode-status bad';
      const all=getAllProgress(); all[progressKey(pendingLesson.id)]=progress; saveAllProgress(all); return;
    }
    progress.unlocked=true; progress.startedAt=progress.startedAt||new Date().toISOString(); progress.lastAccess=new Date().toISOString();
    const all=getAllProgress(); all[progressKey(pendingLesson.id)]=progress; saveAllProgress(all);
    const lesson=pendingLesson; closeUnlockModal(); openLesson(lesson);
  }
  function openLesson(lesson){
    currentLesson=lesson; currentProgress=getProgress(lesson); currentProgress.unlocked=true; currentProgress.startedAt=currentProgress.startedAt||new Date().toISOString();
    currentStep=Math.max(0,Math.min(Number(currentProgress.currentStep)||0,STEP_NAMES.length-1));
    saveProgress();
    el.catalog?.classList.remove('active'); el.lessonScreen?.classList.add('active');
    document.body.classList.add('guided-active','game-active');
    el.lessonTitle.textContent=`Aula ${lesson.number} — ${lesson.title}`;
    el.lessonMeta.textContent=`${disciplineData().label} • ${lesson.module}`;
    el.watermark.textContent=`${profile.name} • ${courseData().label} • ${currentProgress.sessionId}`;
    currentProgress.idleEpisodes=Number(currentProgress.idleEpisodes)||0;
    lastActivityAt=Date.now(); startTicker(); logEvent('aula_aberta',lesson.title,{step:currentStep}); renderStep();
  }
  function returnToCatalog(){
    saveProgress(); stopTicker(); el.lessonScreen?.classList.remove('active'); document.body.classList.remove('game-active'); showCatalog();
  }

  function startTicker(){
    stopTicker();
    ticker=setInterval(()=>{
      if(!currentLesson || !currentProgress) return;
      const now=Date.now(), idleSeconds=Math.floor((now-lastActivityAt)/1000);
      if(document.visibilityState==='visible' && idleSeconds<180){
        currentProgress.activeSeconds=(Number(currentProgress.activeSeconds)||0)+1;
      }
      updateSessionIndicators(idleSeconds);
      if(idleSeconds>=180 && !currentDemoState.warn180){ currentDemoState.warn180=true; showIdleWarning(1,idleSeconds); }
      if(idleSeconds>=240 && !currentDemoState.warn240){ currentDemoState.warn240=true; showIdleWarning(2,idleSeconds); }
      if(idleSeconds>=300 && !currentDemoState.warn300){ currentDemoState.warn300=true; handleIdleEpisode(); }
      if((currentProgress.activeSeconds||0)%10===0) saveProgress();
    },1000);
  }
  function stopTicker(){ if(ticker) clearInterval(ticker); ticker=null; if(readGateTimer) clearTimeout(readGateTimer); readGateTimer=null; }
  function registerActivity(){
    if(!currentLesson) return;
    lastActivityAt=Date.now();
    if(currentDemoState.warn180 || currentDemoState.warn240){
      currentDemoState.warn180=false; currentDemoState.warn240=false; el.idleOverlay?.classList.add('hidden');
      logEvent('atividade_retomada','Interação detectada');
    }
  }
  function updateSessionIndicators(idleSeconds=0){
    if(el.activeTime) el.activeTime.textContent=`Ativo ${fmt(currentProgress?.activeSeconds||0)}`;
    if(el.sessionStatus) el.sessionStatus.textContent=idleSeconds>=180?'Ocioso — aguardando retorno':'Em andamento';
    if(el.idleCount) el.idleCount.textContent=`Ocorrências de inatividade: ${currentProgress?.idleEpisodes||0}/${DATA.maxIdleEpisodes}`;
  }
  function showIdleWarning(level,idleSeconds){
    if(!el.idleOverlay) return;
    el.idleTitle.textContent=level===1?'Você está entrando no modo ocioso':'Sua atividade foi pausada por inatividade';
    el.idleMessage.textContent=level===1
      ? 'Você está há três minutos sem realizar uma ação. Toque em continuar para manter a sessão ativa.'
      : 'Confirme que deseja continuar. O progresso já realizado permanece salvo.';
    el.idleOverlay.classList.remove('hidden'); logEvent('aviso_inatividade',`nível ${level}`,{idleSeconds});
  }
  function resumeFromIdle(){
    lastActivityAt=Date.now(); currentDemoState.warn180=false; currentDemoState.warn240=false; currentDemoState.warn300=false;
    el.idleOverlay?.classList.add('hidden'); logEvent('confirmacao_retorno','Aluno confirmou continuidade');
  }
  function handleIdleEpisode(){
    currentProgress.idleEpisodes=(Number(currentProgress.idleEpisodes)||0)+1;
    logEvent('periodo_inatividade',`Ocorrência ${currentProgress.idleEpisodes}`,{idleSeconds:300}); saveProgress();
    el.idleOverlay?.classList.add('hidden');
    if(currentProgress.idleEpisodes>=DATA.maxIdleEpisodes){
      logEvent('sessao_encerrada','Quarta ocorrência de inatividade');
      currentProgress.endedBy='inatividade'; saveProgress();
      alert('A sessão foi encerrada após quatro períodos de inatividade. O progresso foi salvo.');
    } else {
      alert('A atividade foi pausada após cinco minutos sem ações. O progresso foi salvo e você poderá continuar pela lista de aulas.');
    }
    currentDemoState.warn180=false;currentDemoState.warn240=false;currentDemoState.warn300=false;
    returnToCatalog();
  }
  function visibilityChanged(){
    if(!currentProgress) return;
    if(document.hidden){ hiddenAt=Date.now(); logEvent('aba_oculta',Date.now()<externalAuthorizedUntil?'saída autorizada':'saída sem ferramenta registrada'); }
    else if(hiddenAt){ const seconds=Math.round((Date.now()-hiddenAt)/1000); logEvent('retorno_aba',`${seconds}s fora da plataforma`,{seconds,authorized:hiddenAt<externalAuthorizedUntil}); hiddenAt=0; lastActivityAt=Date.now(); }
  }

  function renderStep(){
    if(!currentLesson || !currentProgress) return;
    currentProgress.currentStep=currentStep; saveProgress();
    stepOpenedAt=Date.now(); currentDemoState={warn180:false,warn240:false,warn300:false};
    canAdvance=(currentProgress.completedSteps||[]).includes(currentStep);
    el.stepFeedback.classList.add('hidden'); el.stepFeedback.textContent='';
    el.stepIndicator.textContent=`Etapa ${currentStep+1}/${STEP_NAMES.length}`;
    el.lessonBar.style.width=`${Math.round((currentStep)/ (STEP_NAMES.length-1)*100)}%`;
    el.prev.disabled=currentStep===0; el.extraBtn.classList.toggle('hidden', currentStep<2 || currentStep>8);
    el.next.classList.toggle('hidden', currentStep===STEP_NAMES.length-1);
    el.next.textContent='Continuar';
    el.next.disabled=false;
    renderStepList(); renderToolShortcuts();
    switch(currentStep){
      case 0: renderIntro(); break;
      case 1: renderDiagnostic(); break;
      case 2: renderMainExplanation(); break;
      case 3: renderExtraSelection(); break;
      case 4: renderDemonstration(); break;
      case 5: renderGuidedPractice(); break;
      case 6: renderLab(); break;
      case 7: renderChallenge(); break;
      case 8: renderReview(); break;
      case 9: renderFinish(); break;
    }
    logEvent('etapa_aberta',STEP_NAMES[currentStep],{step:currentStep});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function renderStepList(){
    el.stepList.innerHTML='';
    STEP_NAMES.forEach((name,i)=>{
      const li=document.createElement('li');
      const done=(currentProgress.completedSteps||[]).includes(i), accessible=i<=currentStep || done;
      li.className=`${i===currentStep?'current':''} ${done?'done':''}`;
      const button=document.createElement('button'); button.type='button'; button.disabled=!accessible;
      button.innerHTML=`<span>${done?'✓':i+1}</span>${escapeHtml(name)}`;
      button.addEventListener('click',()=>{ if(accessible){currentStep=i;renderStep();} });
      li.appendChild(button); el.stepList.appendChild(li);
    });
  }
  function renderToolShortcuts(){
    el.toolShortcuts.innerHTML='';
    const items=[['Explicações A–J',()=>openExtraModal()],['Ferramenta externa',()=>openExternalTool(0)],['Aplicação real',()=>openExtraModal('real')]];
    items.forEach(([label,fn])=>{ const b=document.createElement('button');b.type='button';b.className='guided-tool-chip';b.textContent=label;b.addEventListener('click',fn);el.toolShortcuts.appendChild(b); });
  }
  function markStepComplete(detail=''){
    const set=new Set(currentProgress.completedSteps||[]); set.add(currentStep); currentProgress.completedSteps=Array.from(set).sort((a,b)=>a-b); canAdvance=true;
    saveProgress(); logEvent('etapa_concluida',STEP_NAMES[currentStep],{detail});
    showFeedback('Etapa concluída. Você pode continuar.','ok'); renderStepList();
  }
  function showFeedback(message,type='info'){
    el.stepFeedback.textContent=message; el.stepFeedback.className=`guided-step-feedback ${type}`; el.stepFeedback.classList.remove('hidden');
  }
  function setReadGate(seconds, button){
    if(canAdvance){ button.disabled=false; return; }
    button.disabled=true; let remaining=seconds; button.textContent=`Aguarde ${remaining}s`;
    const interval=setInterval(()=>{
      if(document.hidden) return;
      remaining--; button.textContent=remaining>0?`Aguarde ${remaining}s`:'Marcar como compreendido';
      if(remaining<=0){clearInterval(interval);button.disabled=false;}
    },1000);
    readGateTimer=setTimeout(()=>clearInterval(interval),(seconds+3)*1000);
  }

  function renderIntro(){
    el.stepContent.innerHTML=`
      <div class="guided-hero-block"><span class="guided-kicker">${escapeHtml(currentLesson.module)}</span><h1>${escapeHtml(currentLesson.title)}</h1><p>${escapeHtml(currentLesson.focus)}</p></div>
      <div class="guided-info-grid">
        <div><span>Objetivo</span><strong>${escapeHtml(currentLesson.objective)}</strong></div>
        <div><span>Resultado esperado</span><strong>${escapeHtml(currentLesson.expectedResult)}</strong></div>
        <div><span>Tempo</span><strong>Mínimo 25 min ativos</strong></div>
        <div><span>Entrega</span><strong>Evidência + Classroom</strong></div>
      </div>
      <section class="guided-real-card"><h2>Situação de partida</h2><p>${escapeHtml(currentLesson.realWorld)}</p></section>
      <label class="guided-ready-check"><input id="guidedReadyCheck" type="checkbox" ${canAdvance?'checked':''}/> Li o objetivo e estou pronto para iniciar.</label>`;
    $('#guidedReadyCheck')?.addEventListener('change',e=>{if(e.target.checked)markStepComplete('objetivo confirmado');else canAdvance=false;});
  }
  function renderDiagnostic(){
    const key=`diagnostic-${currentLesson.id}`;
    const answered=currentProgress.answers?.[key];
    el.stepContent.innerHTML=`
      <span class="guided-kicker">DIAGNÓSTICO RÁPIDO</span><h1>O que você já sabe?</h1>
      <p>Esta resposta não vale nota. Ela ajuda a recomendar a forma de explicação mais útil.</p>
      <div class="guided-choice-list">
        <label><input type="radio" name="diagnostic" value="domino" ${answered==='domino'?'checked':''}/> Já conheço e consigo explicar.</label>
        <label><input type="radio" name="diagnostic" value="lembro" ${answered==='lembro'?'checked':''}/> Já vi, mas preciso revisar.</label>
        <label><input type="radio" name="diagnostic" value="novo" ${answered==='novo'?'checked':''}/> É novo ou ainda está confuso.</label>
      </div>
      <div class="guided-mini-question"><strong>Em uma frase, onde esse conteúdo pode aparecer?</strong><textarea id="guidedDiagnosticText" maxlength="300" placeholder="Escreva uma hipótese ou exemplo.">${escapeHtml(currentProgress.answers?.[`${key}-text`]||'')}</textarea></div>
      <button id="guidedSaveDiagnostic" class="btn primary" type="button">Registrar diagnóstico</button>`;
    $('#guidedSaveDiagnostic')?.addEventListener('click',()=>{
      const choice=$('input[name="diagnostic"]:checked')?.value, text=$('#guidedDiagnosticText')?.value.trim();
      if(!choice) return showFeedback('Escolha uma opção antes de continuar.','warn');
      currentProgress.answers=currentProgress.answers||{}; currentProgress.answers[key]=choice; currentProgress.answers[`${key}-text`]=text;
      if(choice==='novo') currentProgress.recommendedExtra='practical'; else if(choice==='lembro') currentProgress.recommendedExtra='detailed'; else currentProgress.recommendedExtra='comparison';
      markStepComplete(`diagnóstico: ${choice}`);
    });
  }
  function renderMainExplanation(){
    const buttonId='guidedUnderstoodMain';
    el.stepContent.innerHTML=`
      <span class="guided-kicker">EXPLICAÇÃO PRINCIPAL</span><h1>Entenda o conceito central</h1>
      <div class="guided-main-explanation"><p>${escapeHtml(currentLesson.mainExplanation)}</p><div class="guided-keywords">${currentLesson.keywords.map(k=>`<span>${escapeHtml(k)}</span>`).join('')}</div></div>
      <section class="guided-example-card"><h2>Exemplo objetivo</h2><p>${escapeHtml(currentLesson.practice)}</p></section>
      <p class="guided-reading-note">Leia com atenção. O botão será liberado após alguns segundos para evitar avanço acidental.</p>
      <button id="${buttonId}" class="btn primary" type="button">Marcar como compreendido</button>`;
    const button=$(`#${buttonId}`); setReadGate(profile?.supports?.includes('reading')?12:8,button);
    button?.addEventListener('click',()=>markStepComplete('explicação principal lida'));
  }
  function renderExtraSelection(){
    const used=currentProgress.extraUsed||[];
    const recommended=currentProgress.recommendedExtra || (supportPreferences().detailedDefault?'detailed':'practical');
    el.stepContent.innerHTML=`
      <span class="guided-kicker">ESCOLHA COMO APRENDER</span><h1>Precisa entender de outro jeito?</h1>
      <p>Abra pelo menos uma explicação. Você pode combinar quantas formas forem necessárias.</p>
      <div class="guided-recommendation">Recomendação para você: <strong>${extraTitle(recommended)}</strong></div>
      <div id="guidedInlineExtraOptions" class="guided-extra-options"></div>
      <div id="guidedInlineExtraContent" class="guided-extra-content">Nenhuma explicação aberta nesta etapa.</div>
      <div id="guidedExtraHelpful" class="guided-helpful hidden"><p>Esta explicação ajudou?</p><button data-value="sim" class="btn secondary" type="button">Ajudou</button><button data-value="parcial" class="btn secondary" type="button">Parcialmente</button><button data-value="nao" class="btn ghost" type="button">Ainda não entendi</button></div>`;
    renderExtraButtons($('#guidedInlineExtraOptions'),$('#guidedInlineExtraContent'),$('#guidedExtraHelpful'),true);
    if(used.length){canAdvance=true;showFeedback(`${used.length} forma(s) de explicação já explorada(s).`,'ok');}
  }
  function extraDefinitions(){
    return [
      ['objective','A','Resumo objetivo'],['detailed','B','Explicação detalhada'],['practical','C','Exemplo prático'],['real','D','Aplicação na vida real'],
      ['analogy','E','Entenda por analogia'],['visual','F','Explicação visual'],['steps','G','Passo a passo'],['comparison','H','Comparar tecnologias'],['errors','I','Erros comuns'],['advanced','J','Desafio avançado']
    ];
  }
  function extraTitle(key){ return extraDefinitions().find(item=>item[0]===key)?.[2] || 'Exemplo prático'; }
  function renderExtraButtons(container,content,helpful,inline=false){
    container.innerHTML='';
    extraDefinitions().forEach(([key,letter,title])=>{
      const b=document.createElement('button');b.type='button';b.className='guided-extra-option';b.innerHTML=`<span>${letter}</span><strong>${escapeHtml(title)}</strong>`;
      b.addEventListener('click',()=>showExtra(key,content,helpful,inline));container.appendChild(b);
    });
  }
  function showExtra(key,content,helpful,inline){
    const x=currentLesson.extras; let html='';
    if(key==='detailed') html=`<h3>Explicação detalhada</h3>${x.detailed.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}`;
    else if(key==='steps') html=`<h3>Passo a passo</h3><ol><li>Observe a situação real.</li><li>Identifique os elementos de ${escapeHtml(currentLesson.focus)}.</li><li>Realize a prática: ${escapeHtml(currentLesson.practice)}</li><li>Teste o resultado e corrija.</li><li>Registre o que aprendeu.</li></ol>`;
    else if(key==='advanced') html=`<h3>Desafio avançado</h3><p>${escapeHtml(currentLesson.challenge)}</p><p>Explique também uma alternativa e os possíveis riscos.</p>`;
    else html=`<h3>${escapeHtml(extraTitle(key))}</h3><p>${escapeHtml(x[key] || x.objective)}</p>`;
    content.innerHTML=html; helpful.classList.remove('hidden');
    currentProgress.extraUsed=Array.from(new Set([...(currentProgress.extraUsed||[]),key])); saveProgress(); logEvent('explicacao_extra',key);
    $$('button',helpful).forEach(btn=>{btn.onclick=()=>{
      currentProgress.extraHelpful=currentProgress.extraHelpful||{};currentProgress.extraHelpful[key]=btn.dataset.value;saveProgress();
      if(btn.dataset.value==='nao'){showFeedback('Tente outra opção, como exemplo prático, analogia ou passo a passo.','warn');}
      else {markStepComplete(`explicação extra ${key}`); if(!inline) closeExtraModal();}
    };});
  }
  function openExtraModal(preselect){
    if(!currentLesson) return;
    el.extraTitle.textContent=`Explicações — ${currentLesson.title}`; el.extraContent.textContent='Escolha uma opção para abrir somente a explicação desejada.';
    renderExtraButtons(el.extraOptions,el.extraContent,document.createElement('div'),false); el.extraModal.classList.remove('hidden');
    if(preselect) showExtra(preselect,el.extraContent,document.createElement('div'),false);
    else if(currentProgress.recommendedExtra) {
      const note=document.createElement('p');note.className='guided-recommendation';note.textContent=`Sugestão: ${extraTitle(currentProgress.recommendedExtra)}`;el.extraContent.prepend(note);
    }
  }
  function closeExtraModal(){ el.extraModal?.classList.add('hidden'); }

  function renderDemonstration(){
    el.stepContent.innerHTML=`<span class="guided-kicker">VEJA FUNCIONANDO</span><h1>Demonstração interativa</h1><p>Observe o exemplo, altere pelo menos um controle e compare o resultado.</p><div id="guidedDemoTool" class="guided-lab-workspace"></div>`;
    renderInteractiveTool($('#guidedDemoTool'),'demo');
  }
  function renderGuidedPractice(){
    const checks=currentProgress.answers?.practiceChecks||{};
    const steps=[`Identifique o objetivo: ${currentLesson.objective}`,`Prepare a estrutura ou os dados necessários.`,`Realize a prática: ${currentLesson.practice}`,`Teste uma situação diferente.`,`Registre uma correção ou melhoria.`];
    el.stepContent.innerHTML=`<span class="guided-kicker">FAÇA COMIGO</span><h1>Prática guiada</h1><p>Conclua cada passo. Você pode voltar às explicações quando necessário.</p><div class="guided-checklist">${steps.map((s,i)=>`<label><input type="checkbox" data-index="${i}" ${checks[i]?'checked':''}/> <span><b>Passo ${i+1}</b>${escapeHtml(s)}</span></label>`).join('')}</div><button id="guidedCheckPractice" class="btn primary" type="button">Verificar prática</button>`;
    $$('.guided-checklist input').forEach(input=>input.addEventListener('change',()=>{
      currentProgress.answers=currentProgress.answers||{};currentProgress.answers.practiceChecks=currentProgress.answers.practiceChecks||{};currentProgress.answers.practiceChecks[input.dataset.index]=input.checked;saveProgress();
    }));
    $('#guidedCheckPractice')?.addEventListener('click',()=>{
      const all=$$('.guided-checklist input').every(i=>i.checked); if(!all)return showFeedback('Conclua os cinco passos antes de continuar.','warn');markStepComplete('prática guiada concluída');
    });
  }
  function renderLab(){
    el.stepContent.innerHTML=`<span class="guided-kicker">LABORATÓRIO</span><h1>Experiência prática</h1><p>${escapeHtml(currentLesson.practice)}</p><div id="guidedLabTool" class="guided-lab-workspace"></div>`;
    renderInteractiveTool($('#guidedLabTool'),'lab');
  }
  function renderInteractiveTool(container,phase){
    const type=currentLesson.toolType || 'planner';
    const codeTypes=['code','compiler','dom','mobilecode','jsconsole','html','css','semantic','form','multicode','debugger'];
    const phoneTypes=['prototype','responsive','thumb','uxreview','components','router','pwa','game','mobilecode'];
    const boardTypes=['kanban','board'];
    if(codeTypes.includes(type)) return renderCodeTool(container,phase,type);
    if(phoneTypes.includes(type)) return renderPhoneTool(container,phase,type);
    if(boardTypes.includes(type)) return renderBoardTool(container,phase);
    return renderPlanningTool(container,phase,type);
  }
  function renderCodeTool(container,phase,type){
    const saved=currentProgress.labData?.[`${phase}-code`] || starterCode(type);
    container.innerHTML=`
      <div class="guided-code-toolbar"><span>${escapeHtml(type.toUpperCase())} LAB</span><button id="guidedRestoreCode" class="btn tiny" type="button">Restaurar</button></div>
      <textarea id="guidedCodeEditor" class="guided-code-editor" spellcheck="false">${escapeHtml(saved)}</textarea>
      <div class="guided-tool-actions"><button id="guidedRunCode" class="btn primary" type="button">Testar exemplo</button><button id="guidedExternalTool" class="btn secondary" type="button">Abrir ferramenta real</button></div>
      <div id="guidedCodeOutput" class="guided-code-output">Saída aguardando execução.</div>`;
    const editor=$('#guidedCodeEditor');
    editor.addEventListener('input',()=>{currentProgress.labData=currentProgress.labData||{};currentProgress.labData[`${phase}-code`]=editor.value;saveProgress();});
    $('#guidedRestoreCode').addEventListener('click',()=>{editor.value=starterCode(type);editor.dispatchEvent(new Event('input'));});
    $('#guidedRunCode').addEventListener('click',()=>{
      const value=editor.value.trim(); if(value.length<15)return showFeedback('Adicione ou mantenha um exemplo com conteúdo suficiente.','warn');
      $('#guidedCodeOutput').textContent=type==='html'||type==='semantic'||type==='form'?'Prévia atualizada. Estrutura reconhecida.':'Teste executado no simulador: estrutura analisada e tentativa registrada.';
      if(['html','semantic','form'].includes(type)) createSafePreview(container,value);
      currentProgress.labData[`${phase}-tested`]=true;saveProgress();logEvent('ferramenta_codigo','teste executado',{phase,type,chars:value.length});markStepComplete(`laboratório ${type}`);
    });
    $('#guidedExternalTool').addEventListener('click',()=>openExternalTool(0));
  }
  function createSafePreview(container,html){
    let iframe=$('.guided-safe-preview',container); if(!iframe){iframe=document.createElement('iframe');iframe.className='guided-safe-preview';iframe.setAttribute('sandbox','');iframe.title='Prévia segura do HTML';container.appendChild(iframe);}
    const safe=String(html).replace(/<script[\s\S]*?<\/script>/gi,'').replace(/on\w+\s*=\s*["'][^"']*["']/gi,'');
    iframe.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:"><style>body{font-family:Arial;padding:18px;color:#172033}button,input{padding:10px;margin:4px}</style>${safe}`;
  }
  function starterCode(type){
    if(['html','semantic','form'].includes(type)) return '<main>\n  <h1>Minha atividade</h1>\n  <p>Edite este conteúdo e teste a prévia.</p>\n  <button type="button">Continuar</button>\n</main>';
    if(type==='css') return '.cartao {\n  padding: 1rem;\n  border-radius: 12px;\n  max-width: 420px;\n}';
    if(type==='dom'||type==='jsconsole') return 'const mensagem = "Teste concluído";\nconsole.log(mensagem);';
    if(type==='compiler') return '#include <stdio.h>\nint main(){\n  printf("Teste DS\\n");\n  return 0;\n}';
    return '# Exemplo para explorar\nnome = "Estudante"\nprint(nome)';
  }
  function renderPhoneTool(container,phase,type){
    const saved=currentProgress.labData?.[`${phase}-phone`] || {title:'MiniApp DS',text:'Conteúdo principal',action:'Continuar'};
    container.innerHTML=`
      <div class="guided-phone-editor"><div><label>Título<input id="phoneTitle" value="${escapeHtml(saved.title)}"/></label><label>Mensagem<textarea id="phoneText">${escapeHtml(saved.text)}</textarea></label><label>Ação principal<input id="phoneAction" value="${escapeHtml(saved.action)}"/></label><button id="phoneApply" class="btn primary" type="button">Atualizar protótipo</button></div>
      <div class="guided-phone"><div class="guided-phone-notch"></div><header id="phonePreviewTitle">${escapeHtml(saved.title)}</header><main><p id="phonePreviewText">${escapeHtml(saved.text)}</p></main><footer><button id="phonePreviewAction" type="button">${escapeHtml(saved.action)}</button></footer></div></div>`;
    $('#phoneApply').addEventListener('click',()=>{
      const data={title:$('#phoneTitle').value.trim(),text:$('#phoneText').value.trim(),action:$('#phoneAction').value.trim()};
      if(!data.title||!data.text||!data.action)return showFeedback('Preencha título, mensagem e ação.','warn');
      $('#phonePreviewTitle').textContent=data.title;$('#phonePreviewText').textContent=data.text;$('#phonePreviewAction').textContent=data.action;
      currentProgress.labData=currentProgress.labData||{};currentProgress.labData[`${phase}-phone`]=data;saveProgress();logEvent('prototipo_atualizado',type,{phase});markStepComplete(`protótipo ${type}`);
    });
  }
  function renderBoardTool(container,phase){
    const tasks=currentProgress.labData?.[`${phase}-board`] || [
      {text:'Entender o problema',status:'todo'},{text:'Criar primeira versão',status:'doing'},{text:'Testar com usuário',status:'test'}
    ];
    container.innerHTML=`<div class="guided-kanban" id="guidedKanban"></div><button id="guidedSaveBoard" class="btn primary" type="button">Salvar organização</button>`;
    const statuses=[['todo','A fazer'],['doing','Em andamento'],['test','Em teste'],['done','Concluído']];
    const board=$('#guidedKanban');
    statuses.forEach(([key,label])=>{
      const col=document.createElement('section');col.innerHTML=`<h3>${label}</h3>`;
      tasks.forEach((task,index)=>{if(task.status===key){const card=document.createElement('div');card.className='guided-kanban-card';card.innerHTML=`<span>${escapeHtml(task.text)}</span><select data-index="${index}">${statuses.map(([v,l])=>`<option value="${v}" ${v===task.status?'selected':''}>${l}</option>`).join('')}</select>`;col.appendChild(card);}});board.appendChild(col);
    });
    $$('select',board).forEach(select=>select.addEventListener('change',()=>{tasks[Number(select.dataset.index)].status=select.value;currentProgress.labData[`${phase}-board`]=tasks;saveProgress();renderBoardTool(container,phase);}));
    $('#guidedSaveBoard')?.addEventListener('click',()=>{currentProgress.labData[`${phase}-board`]=tasks;saveProgress();logEvent('kanban_salvo',`${tasks.length} tarefas`);markStepComplete('quadro organizado');});
  }
  function renderPlanningTool(container,phase,type){
    const saved=currentProgress.labData?.[`${phase}-plan`] || {};
    const labels=toolLabels(type);
    container.innerHTML=`<div class="guided-planner-grid">${labels.map((label,i)=>`<label>${escapeHtml(label)}<textarea data-field="f${i}" maxlength="500" placeholder="Registre sua análise...">${escapeHtml(saved[`f${i}`]||'')}</textarea></label>`).join('')}</div><div class="guided-tool-actions"><button id="guidedSavePlan" class="btn primary" type="button">Salvar laboratório</button><button id="guidedOpenReal" class="btn secondary" type="button">Abrir ferramenta real</button></div>`;
    $('#guidedSavePlan').addEventListener('click',()=>{
      const data={};let filled=0;$$('textarea',container).forEach(t=>{data[t.dataset.field]=t.value.trim();if(data[t.dataset.field].length>=8)filled++;});
      if(filled<labels.length)return showFeedback(`Preencha os ${labels.length} campos com respostas explicativas.`,'warn');
      currentProgress.labData=currentProgress.labData||{};currentProgress.labData[`${phase}-plan`]=data;saveProgress();logEvent('laboratorio_planejamento',type,{phase});markStepComplete(`ferramenta ${type}`);
    });
    $('#guidedOpenReal').addEventListener('click',()=>openExternalTool(0));
  }
  function toolLabels(type){
    const map={
      radar:['Tecnologia ou tendência','Problema ou oportunidade','Aplicação possível'],problem:['Problema central','Causas e evidências','Consequências e usuários'],persona:['Quem é o usuário?','Dificuldades e contexto','Objetivos e necessidades'],
      budget:['Funcionalidades essenciais','O que ficará para depois','Como validar o MVP'],canvas:['Proposta e público','Recursos, atividades e parceiros','Canais, custos e sustentação'],feedback:['O que foi testado?','Resultado esperado e obtido','Impacto e melhoria sugerida'],
      risk:['Forças e oportunidades','Fraquezas e ameaças','Risco prioritário e resposta'],ai:['Aplicação de IA','Dados e benefício','Riscos, limites e supervisão'],pitch:['Problema e público','Solução e diferencial','Validação e próximo passo'],
      requirements:['Funcionalidades esperadas','Regras e prioridades','Critérios de qualidade'],interview:['Perguntas para o usuário','Evidências que serão coletadas','Como registrar as respostas'],story:['História de usuário','Critérios de aceitação','Definição de pronto'],
      uml:['Atores e objetivos','Fluxo principal','Elementos ou classes'],project:['Objetivo do projeto','Estrutura e etapas','Teste, evidência e entrega'],timeline:['Etapas na ordem correta','Dependências','Resultado esperado'],
      decision:['Opções consideradas','Critérios de escolha','Decisão e justificativa'],classifier:['Categorias utilizadas','Itens classificados','Conclusão da análise'],matrix:['Impacto e urgência','Esforço e risco','Prioridade justificada'],
      systemmap:['Usuários, entradas e dados','Processos e regras','Saídas e objetivo'],comparison:['Opção A','Opção B','Escolha e justificativa'],planner:['O que precisa ser feito?','Quem ou o que será necessário?','Como verificar o resultado?']
    };
    return map[type] || map.planner;
  }
  function openExternalTool(index=0){
    const links=EXTERNAL_LINKS[profile?.disciplineKey] || [];
    const item=links[index] || links[0]; if(!item)return showFeedback('Não há ferramenta externa configurada para esta disciplina.','warn');
    externalAuthorizedUntil=Date.now()+20*60*1000; logEvent('ferramenta_externa',item[0],{url:item[1],authorized:true});
    window.open(item[1],'_blank','noopener,noreferrer');
    showFeedback(`Saída autorizada para ${item[0]}. Retorne à plataforma após realizar o roteiro.`,'ok');
  }

  function renderChallenge(){
    const value=currentProgress.answers?.challenge||'';
    el.stepContent.innerHTML=`<span class="guided-kicker">AGORA É SUA VEZ</span><h1>Desafio da aula</h1><section class="guided-challenge-card"><p>${escapeHtml(currentLesson.challenge)}</p><ul><li>Explique a decisão.</li><li>Mostre um exemplo ou evidência.</li><li>Registre como você verificaria o resultado.</li></ul></section><label class="guided-long-answer">Sua solução<textarea id="guidedChallengeAnswer" minlength="40" maxlength="1800" placeholder="Descreva sua resposta, código, análise ou plano...">${escapeHtml(value)}</textarea></label><button id="guidedSaveChallenge" class="btn primary" type="button">Salvar desafio</button>`;
    $('#guidedSaveChallenge').addEventListener('click',()=>{
      const text=$('#guidedChallengeAnswer').value.trim();if(text.length<40)return showFeedback('Desenvolva um pouco mais a resposta. Use pelo menos 40 caracteres.','warn');
      currentProgress.answers=currentProgress.answers||{};currentProgress.answers.challenge=text;saveProgress();logEvent('desafio_salvo',`${text.length} caracteres`);markStepComplete('desafio registrado');
    });
  }
  function renderReview(){
    const selected=currentProgress.answers?.review;
    const options=[
      `Aplicar ${currentLesson.focus} em uma situação, testar e registrar o resultado.`,
      'Memorizar palavras sem realizar nenhuma experiência prática.',
      'Pular diretamente para a entrega sem verificar o laboratório.',
      'Copiar uma solução sem compreender o problema.'
    ];
    el.stepContent.innerHTML=`<span class="guided-kicker">REVISÃO</span><h1>Consolide o que aprendeu</h1><div class="guided-review-summary"><h2>Ideias principais</h2><ul>${currentLesson.keywords.slice(0,6).map(k=>`<li>${escapeHtml(k)}</li>`).join('')}</ul><p><strong>Aplicação real:</strong> ${escapeHtml(currentLesson.realWorld)}</p><p><strong>Erro comum:</strong> ${escapeHtml(currentLesson.error)}</p></div><fieldset class="guided-review-question"><legend>Qual ação demonstra melhor a aprendizagem desta aula?</legend>${options.map((o,i)=>`<label><input type="radio" name="review" value="${i}" ${String(i)===String(selected)?'checked':''}/> ${escapeHtml(o)}</label>`).join('')}</fieldset><label class="guided-long-answer">Reflexão final<textarea id="guidedReflection" maxlength="500" placeholder="Qual explicação ou ferramenta mais ajudou?">${escapeHtml(currentProgress.answers?.reflection||'')}</textarea></label><button id="guidedSaveReview" class="btn primary" type="button">Concluir revisão</button>`;
    $('#guidedSaveReview').addEventListener('click',()=>{
      const choice=$('input[name="review"]:checked')?.value, reflection=$('#guidedReflection').value.trim();
      if(choice==null)return showFeedback('Responda à questão de revisão.','warn');if(choice!=='0')return showFeedback('Revise: aprendizagem exige aplicar, testar e registrar o resultado.','warn');
      if(reflection.length<10)return showFeedback('Registre uma reflexão curta sobre a aula.','warn');
      currentProgress.answers=currentProgress.answers||{};currentProgress.answers.review=choice;currentProgress.answers.reflection=reflection;saveProgress();markStepComplete('revisão concluída');
    });
  }
  function renderFinish(){
    const min=currentLesson.minimumActiveSeconds||DATA.minimumActiveSeconds;
    const remaining=Math.max(0,min-(currentProgress.activeSeconds||0));
    const allPrevious=[0,1,2,3,4,5,6,7,8].every(i=>(currentProgress.completedSteps||[]).includes(i));
    const timeOk=remaining===0 || !!currentProgress.teacherOverride;
    const ready=allPrevious && timeOk;
    if(ready && !canAdvance) markStepComplete('requisitos finais atendidos');
    el.stepContent.innerHTML=`
      <span class="guided-kicker">FINALIZAR E ENTREGAR</span><h1>${ready?'Aula pronta para conclusão':'Confira os requisitos'}</h1>
      <div class="guided-completion-grid">
        <div><span>Etapas obrigatórias</span><strong>${allPrevious?'Concluídas':'Há etapas pendentes'}</strong></div>
        <div><span>Tempo ativo</span><strong>${fmt(currentProgress.activeSeconds||0)}</strong></div>
        <div><span>Tempo restante</span><strong>${currentProgress.teacherOverride?'Liberado pelo professor':fmt(remaining)}</strong></div>
        <div><span>Explicações extras</span><strong>${(currentProgress.extraUsed||[]).length}</strong></div>
      </div>
      ${!timeOk?`<div class="guided-time-warning"><strong>Você concluiu as atividades antes do tempo mínimo.</strong><p>Revise o conteúdo, abra outra explicação ou realize o aprofundamento. A conclusão antecipada também pode ser autorizada pelo professor.</p></div>`:''}
      <section class="guided-export-panel"><h2>1. Exporte sua evidência</h2><p>O arquivo reúne respostas, laboratório, tempo, recursos utilizados e registro de conclusão.</p><div class="guided-export-actions"><button id="guidedExportHtml" class="btn primary" type="button">Exportar evidência .HTML</button><button id="guidedExportJson" class="btn secondary" type="button">Baixar dados .JSON</button></div></section>
      <section class="guided-classroom-panel"><h2>2. Envie no Google Classroom</h2><p>Depois de exportar, abra a atividade, anexe o arquivo e selecione <strong>Entregar</strong>.</p><button id="guidedOpenClassroom" class="btn secondary" type="button">Abrir Google Classroom</button></section>
      <button id="guidedFinalizeLesson" class="btn primary full" type="button" ${ready?'':'disabled'}>Concluir aula e voltar para a lista</button>`;
    $('#guidedExportHtml').addEventListener('click',()=>exportEvidence('html'));
    $('#guidedExportJson').addEventListener('click',()=>exportEvidence('json'));
    $('#guidedOpenClassroom').addEventListener('click',openClassroom);
    $('#guidedFinalizeLesson').addEventListener('click',()=>{
      currentProgress.completed=true;currentProgress.completedAt=new Date().toISOString();currentProgress.endedBy='concluida';saveProgress();logEvent('aula_concluida',currentLesson.title);
      alert('Aula concluída. Confirme que o arquivo foi anexado e entregue no Google Classroom.');returnToCatalog();
    });
  }

  function nextStep(){
    if(currentStep===STEP_NAMES.length-1){
      if(!canAdvance) return showFeedback('Conclua as etapas e o tempo mínimo, ou solicite liberação do professor.','warn');
      return;
    }
    if(!canAdvance)return showFeedback('Realize a ação solicitada nesta etapa antes de continuar.','warn');
    currentStep=Math.min(STEP_NAMES.length-1,currentStep+1);renderStep();
  }
  function previousStep(){ if(currentStep>0){currentStep--;renderStep();} }

  function exportEvidence(format){
    if(!currentProgress)return;
    currentProgress.exports=(Number(currentProgress.exports)||0)+1;logEvent('evidencia_exportada',format,{count:currentProgress.exports});
    const report=buildReportData();
    if(format==='json') return downloadBlob(JSON.stringify(report,null,2),fileName('json'),'application/json');
    const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Evidência ${escapeHtml(currentLesson.title)}</title><style>body{font-family:Arial,sans-serif;max-width:920px;margin:30px auto;padding:0 24px;color:#152033}h1{color:#0b5d4f}.box{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:14px 0}dt{font-weight:bold}pre{white-space:pre-wrap;background:#f1f5f9;padding:14px;border-radius:8px}</style><body><h1>Desafio DS — Modo Guiado</h1><div class="box"><p><b>Aluno:</b> ${escapeHtml(report.student.name)}</p><p><b>Turma:</b> ${escapeHtml(report.student.class)}</p><p><b>Disciplina:</b> ${escapeHtml(report.lesson.discipline)}</p><p><b>Aula:</b> ${report.lesson.number} — ${escapeHtml(report.lesson.title)}</p><p><b>Tempo ativo:</b> ${escapeHtml(report.session.activeTime)}</p><p><b>Sessão:</b> ${escapeHtml(report.session.id)}</p></div><div class="box"><h2>Objetivo</h2><p>${escapeHtml(currentLesson.objective)}</p><h2>Desafio</h2><pre>${escapeHtml(currentProgress.answers?.challenge||'Não registrado')}</pre><h2>Reflexão</h2><pre>${escapeHtml(currentProgress.answers?.reflection||'Não registrada')}</pre></div><div class="box"><h2>Ferramentas e progresso</h2><p>Etapas concluídas: ${(currentProgress.completedSteps||[]).length}/${STEP_NAMES.length}</p><p>Explicações extras: ${(currentProgress.extraUsed||[]).map(extraTitle).join(', ')||'Nenhuma'}</p><p>Recursos de apoio ativos: ${(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x).join(', ')||'Padrão'}</p><p>Liberação antecipada: ${currentProgress.teacherOverride?'Sim — '+escapeHtml(currentProgress.teacherOverride.reason):'Não'}</p></div><p>Gerado em ${new Date().toLocaleString('pt-BR')}.</p></body></html>`;
    downloadBlob(html,fileName('html'),'text/html;charset=utf-8');
  }
  function buildReportData(){
    return {
      app:'Desafio DS — Modo Guiado',version:DATA.version,generatedAt:new Date().toISOString(),
      student:{name:profile.name,class:courseData().label,supportResources:(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x)},
      lesson:{id:currentLesson.id,number:currentLesson.number,title:currentLesson.title,module:currentLesson.module,discipline:disciplineData().label,objective:currentLesson.objective},
      session:{id:currentProgress.sessionId,startedAt:currentProgress.startedAt,activeSeconds:currentProgress.activeSeconds,activeTime:fmt(currentProgress.activeSeconds),idleEpisodes:currentProgress.idleEpisodes,teacherOverride:currentProgress.teacherOverride},
      progress:{completedSteps:currentProgress.completedSteps,extraUsed:currentProgress.extraUsed,exports:currentProgress.exports},
      answers:currentProgress.answers,labData:currentProgress.labData,events:currentProgress.events
    };
  }
  function fileName(ext){
    const safe=(value)=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'').toUpperCase();
    return `${safe(profile.courseKey)}_${safe(disciplineData().short)}_AULA${String(currentLesson.number).padStart(2,'0')}_${safe(profile.name)}.${ext}`;
  }
  function downloadBlob(content,name,type){
    const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    showFeedback(`Arquivo ${name} gerado. Agora abra o Classroom e anexe a evidência.`,'ok');
  }
  function openClassroom(){
    const url=currentLesson.classroomUrl || DATA.defaultClassroom;externalAuthorizedUntil=Date.now()+30*60*1000;logEvent('classroom_aberto',url,{authorized:true});window.open(url,'_blank','noopener,noreferrer');showFeedback('Google Classroom aberto. Anexe o arquivo exportado e finalize a entrega.','ok');
  }

  function openTeacherModal(action){
    teacherAction=action;el.teacherName.value='';el.teacherPassword.value='';el.teacherNote.value='';el.teacherStatus.textContent='';
    el.teacherReason.previousElementSibling?.classList.toggle('hidden',action==='panel');
    el.teacherReason.classList.toggle('hidden',action==='panel');
    el.teacherNote.previousElementSibling?.classList.toggle('hidden',action==='panel');
    el.teacherNote.classList.toggle('hidden',action==='panel');
    el.teacherModal.classList.remove('hidden');setTimeout(()=>el.teacherName.focus(),50);
  }
  function closeTeacherModal(){teacherAction=null;el.teacherModal?.classList.add('hidden');}
  async function confirmTeacherAction(){
    const name=sanitizeName(el.teacherName.value),password=el.teacherPassword.value;
    if(!name||!password)return setTeacherStatus('Informe professor e senha.','warn');
    const hash=await sha256(password);if(hash!==DATA.teacherPasswordHash)return setTeacherStatus('Senha docente inválida.','bad');
    if(teacherAction==='release'){
      const note=el.teacherNote.value.trim();if(!note)return setTeacherStatus('Registre uma observação para a liberação.','warn');
      currentProgress.teacherOverride={teacher:name,reason:el.teacherReason.value,note,at:new Date().toISOString(),activeSeconds:currentProgress.activeSeconds};
      logEvent('conclusao_antecipada',el.teacherReason.value,{teacher:name,note,activeSeconds:currentProgress.activeSeconds});saveProgress();closeTeacherModal();showFeedback('Conclusão antecipada autorizada e registrada.','ok');if(currentStep===9)renderFinish();
    } else {
      closeTeacherModal();openTeacherPanel(name);
    }
  }
  function setTeacherStatus(text,type){el.teacherStatus.textContent=text;el.teacherStatus.className=`mode-status ${type}`;}
  function openTeacherPanel(teacher){
    const lessons=disciplineData()?.lessons||[];
    el.extraTitle.textContent=`Painel do professor — ${disciplineData().label}`;
    el.extraOptions.innerHTML=`<button id="teacherExportProgress" class="btn primary" type="button">Exportar progresso</button>`;
    el.extraContent.innerHTML=`<p>Acesso autorizado para <strong>${escapeHtml(teacher)}</strong>. Os códigos não são exibidos no site público; consulte o arquivo privado entregue separadamente ao professor.</p><div class="guided-teacher-code-list">${lessons.map(l=>{const p=getProgress(l);return `<div><span>Aula ${l.number}</span><strong>••••</strong><small>${escapeHtml(l.title)} • ${p.completed?'concluída':p.unlocked?'em andamento':'bloqueada'}</small></div>`;}).join('')}</div>`;
    $('#teacherExportProgress').addEventListener('click',()=>{
      const data=lessons.map(l=>({lesson:l.number,title:l.title,progress:getProgress(l)}));downloadBlob(JSON.stringify({teacher,student:profile.name,course:courseData().label,discipline:disciplineData().label,data},null,2),`PROGRESSO_${profile.courseKey}_${disciplineData().short}_${profile.name.replace(/\s+/g,'_')}.json`,'application/json');
    });
    el.extraModal.classList.remove('hidden');
  }

  install();
})();
