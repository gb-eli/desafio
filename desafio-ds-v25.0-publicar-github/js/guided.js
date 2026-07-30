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
    toolShortcuts: $('#guidedToolShortcuts'), backCatalog: $('#guidedBackToCatalogBtn'), toChallenge: $('#guidedToChallengeBtn'), lessonHub: $('#guidedLessonHubBtn'), watermark: $('#guidedWatermark'), supportMenu: $('#guidedSupportMenuBtn'),
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
    const manager=window.DS_ProfileManager;
    if(manager?.hasSession?.()) return manager.getPath(`platforms.guided.storage.${key}`, fallback);
    try { const value = JSON.parse(sessionStorage.getItem(key)); return value ?? fallback; } catch(_) { return fallback; }
  }
  function storageWrite(key, value){
    const manager=window.DS_ProfileManager;
    if(manager?.hasSession?.()){ manager.setPath(`platforms.guided.storage.${key}`, value); return; }
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch(_){}
  }
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
    document.body.classList.toggle('guided-large-text', Boolean(p.fontLarge || profile?.supports?.includes('vision')));
    document.body.classList.toggle('guided-focus-mode', Boolean(p.focusMode || profile?.supports?.includes('focus')));
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
    el.toChallenge?.addEventListener('click', goToChallengeHub);
    el.lessonHub?.addEventListener('click', goToChallengeHub);
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
  async function enterCatalog(event){
    event.preventDefault();
    if(!window.DS_Terms?.isAccepted?.()){await window.DS_Terms?.ensureAccepted?.();return;}
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
    el.catalogDescription.textContent=`${discipline.lessons.length} aulas organizadas em sequência. Solicite a autorização temporária ao professor pelo EduAuth e continue do ponto salvo.`;
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
          <div class="guided-lesson-tags"><span>${escapeHtml(lesson.module)}</span><span>${progress.completed?'Concluída':progress.unlocked?'Em andamento':'Autorização necessária'}</span></div>
          <h2>${escapeHtml(lesson.title)}</h2>
          <p>${escapeHtml(lesson.focus)}</p>
          <div class="guided-card-progress"><i style="width:${percentage}%"></i></div>
          <small>${percentage}% • mínimo de ${Math.round(lesson.minimumActiveSeconds/60)} minutos ativos</small>
        </div>
        <div class="guided-lesson-card-actions">
          <button class="btn ${progress.unlocked?'primary':'secondary'} guided-open-lesson" type="button">${progress.completed?'Revisar':progress.unlocked?'Continuar':'Solicitar autorização'}</button>
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
  async function requestLesson(lesson){
    const progress=getProgress(lesson);if(progress.unlocked||progress.completed)return openLesson(lesson);
    pendingLesson=lesson;
    try{
      await window.DS_EduAuth.authorize({actionId:'lesson-start',classId:profile.courseKey,subjectId:`${profile.courseKey}:${profile.disciplineKey}`,lessonId:lesson.id,activityId:'aula-guiada',resourceId:lesson.id});
      progress.unlocked=true;progress.startedAt=progress.startedAt||new Date().toISOString();progress.lastAccess=new Date().toISOString();progress.events=progress.events||[];progress.events.push({at:new Date().toISOString(),type:'eduauth_lesson_start',detail:'CLASS_SHARED_PIN'});const all=getAllProgress();all[progressKey(lesson.id)]=progress;saveAllProgress(all);pendingLesson=null;openLesson(lesson);
    }catch(error){pendingLesson=null;showFeedback(error?.message||'A aula não foi liberada.','warn');}
  }
  function closeUnlockModal(){pendingLesson=null;el.unlockModal?.classList.add('hidden');}
  async function confirmLessonCode(){if(pendingLesson)return requestLesson(pendingLesson);closeUnlockModal();}

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
  function goToChallengeHub(){
    saveProgress(); stopTicker(); currentLesson=null; currentProgress=null;
    [el.catalog,el.lessonScreen].forEach(screen=>screen?.classList.remove('active'));
    el.startScreen?.classList.add('active');
    document.body.classList.remove('guided-active','game-active');
    switchExperience('challenge');
    document.querySelector('#playerName')?.focus();
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
  function openCodeCenter(){
    const center=window.DS_CodeCenter;
    if(!center?.has?.(currentLesson)) return showFeedback('Esta aula não precisa de arquivos externos. Use o laboratório e os exemplos internos.','info');
    center.open(currentLesson,{onEvent:(type,detail={})=>logEvent(type,detail.file||detail.commandLabel||detail.resourceId||'',detail)});
  }
  function renderToolShortcuts(){
    el.toolShortcuts.innerHTML='';
    const items=[['Explicações A–J',()=>openExtraModal()]];
    if(window.DS_CodeCenter?.has?.(currentLesson)) items.push(['Código e execução',openCodeCenter]);
    items.push(['Ferramenta externa',()=>openExternalTool(0)],['Aplicação real',()=>openExtraModal('real')]);
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
    const x=currentLesson.extras || {}; let html='';
    const detailed=Array.isArray(x.detailed)?x.detailed:(currentLesson.detailedExplanation||[]);
    if(key==='detailed') html=`<h3>Explicação detalhada</h3>${detailed.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}`;
    else if(key==='steps') html=`<h3>Passo a passo</h3><ol><li>Observe a situação real.</li><li>Identifique os elementos de ${escapeHtml(currentLesson.focus)}.</li><li>Realize a prática: ${escapeHtml(currentLesson.practice)}</li><li>Teste em uma condição diferente.</li><li>Registre o que mudou e por quê.</li></ol>`;
    else if(key==='advanced') html=`<h3>Desafio avançado</h3><p>${escapeHtml(currentLesson.challenge)}</p><p>Apresente também uma alternativa, um risco e um critério para validar sua escolha.</p>`;
    else if(key==='real' && Array.isArray(currentLesson.realExamples) && currentLesson.realExamples.length){
      html=`<h3>Aplicações na vida real</h3><p>${escapeHtml(x.real || currentLesson.realWorld)}</p><div class="guided-real-grid">${currentLesson.realExamples.map(item=>`<article><span aria-hidden="true">↗</span><p>${escapeHtml(item)}</p></article>`).join('')}</div>${Array.isArray(currentLesson.careers)&&currentLesson.careers.length?`<h4>Profissões relacionadas</h4><div class="guided-chip-list">${currentLesson.careers.map(item=>`<span>${escapeHtml(item)}</span>`).join('')}</div>`:''}`;
    } else if(key==='comparison' && Array.isArray(currentLesson.codeSamples) && currentLesson.codeSamples.length){
      html=`<h3>Comparação prática</h3><p>${escapeHtml(x.comparison || currentLesson.comparison)}</p><div class="guided-code-comparison">${currentLesson.codeSamples.map(sample=>`<article><header><strong>${escapeHtml(sample.language)}</strong><span>${escapeHtml(sample.label||'Exemplo')}</span></header><pre><code>${escapeHtml(sample.code)}</code></pre><p>${escapeHtml(sample.note||'')}</p></article>`).join('')}</div>`;
    } else if(key==='visual' && currentLesson.toolConfig?.devices){
      html=`<h3>Explicação visual</h3><p>${escapeHtml(x.visual || '')}</p><div class="guided-visual-flow"><span>Celular</span><b>→</b><span>Tablet</span><b>→</b><span>Notebook</span><b>→</b><span>Teste e ajuste</span></div>`;
    } else html=`<h3>${escapeHtml(extraTitle(key))}</h3><p>${escapeHtml(x[key] || x.objective || currentLesson.mainExplanation)}</p>`;
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
    const phoneTypes=['prototype','thumb','uxreview','components','router','pwa','game','mobilecode','prototype-flow'];
    const boardTypes=['kanban','board'];
    if(['device-emulator','responsive','responsive-css'].includes(type)) return renderDeviceEmulator(container,phase,type);
    if(type==='simulator') return renderPythonSimulator(container,phase);
    if(type==='decision') return renderDecisionSimulator(container,phase);
    if(type==='boxmodel') return renderBoxModelTool(container,phase);
    if(type==='ui-audit') return renderUiAuditTool(container,phase);
    if(type==='fitts-hick') return renderFittsHickTool(container,phase);
    if(type==='mobile-navigation') return renderMobileNavigationTool(container,phase);
    if(type==='mobile-quality') return renderMobileQualityTool(container,phase);
    if(type==='language-lab') return renderLanguageLab(container,phase);
    if(type==='api-mobile') return renderApiMobileTool(container,phase);
    if(type==='mobile-ecosystem') return renderMobileEcosystemTool(container,phase);
    if(codeTypes.includes(type)) return renderCodeTool(container,phase,type);
    if(phoneTypes.includes(type)) return renderPhoneTool(container,phase,type);
    if(boardTypes.includes(type)) return renderBoardTool(container,phase);
    return renderPlanningTool(container,phase,type);
  }
  function renderPythonSimulator(container,phase){
    const isLoop=currentLesson.number===6 || /repet/i.test(currentLesson.title);
    if(isLoop){
      const saved=currentProgress.labData?.[`${phase}-python-loop`]||{kind:'for',count:5,start:1};
      container.innerHTML=`<div class="guided-python-sim"><section class="guided-sim-controls"><label>Estrutura<select data-py="kind"><option value="for" ${saved.kind==='for'?'selected':''}>for com range</option><option value="while" ${saved.kind==='while'?'selected':''}>while com condição</option></select></label><label>Valor inicial<input data-py="start" type="number" min="0" max="20" value="${saved.start}"></label><label>Repetições <output data-loop-output>${saved.count}</output><input data-py="count" type="range" min="1" max="12" value="${saved.count}"></label><button data-run-loop class="btn primary" type="button">Executar passo a passo</button><button data-save-loop class="btn secondary" type="button">Salvar simulação</button></section><section><pre class="guided-sim-code" data-loop-code></pre><div class="guided-trace" data-loop-trace><p>Execute para acompanhar contador, condição e saída.</p></div></section></div>`;
      const read=()=>({kind:container.querySelector('[data-py="kind"]').value,start:Number(container.querySelector('[data-py="start"]').value),count:Number(container.querySelector('[data-py="count"]').value)});
      const paint=()=>{const d=read();container.querySelector('[data-loop-output]').textContent=d.count;container.querySelector('[data-loop-code]').textContent=d.kind==='for'?`for numero in range(${d.start}, ${d.start+d.count}):\n    print(numero)`:`numero = ${d.start}\nlimite = ${d.start+d.count}\nwhile numero < limite:\n    print(numero)\n    numero += 1`;};
      container.addEventListener('input',paint);container.addEventListener('change',paint);paint();
      container.querySelector('[data-run-loop]').onclick=()=>{const d=read();const rows=[];for(let i=0;i<d.count;i++){const value=d.start+i;rows.push(`<div><b>Passo ${i+1}</b><span>contador = ${value}</span><span>${d.kind==='while'?`${value} < ${d.start+d.count} → verdadeiro`:'item obtido do range'}</span><code>saída: ${value}</code></div>`);}container.querySelector('[data-loop-trace]').innerHTML=rows.join('')+`<p class="guided-sim-result">Fim: ${d.kind==='while'?`a condição ${d.start+d.count} < ${d.start+d.count} tornou-se falsa`:'o range foi percorrido'}.</p>`;logEvent('simulador_python','laço executado',{phase,...d});};
      container.querySelector('[data-save-loop]').onclick=()=>{const d=read();currentProgress.labData[`${phase}-python-loop`]=d;saveProgress();markStepComplete('laço testado passo a passo');};
      return;
    }
    const saved=currentProgress.labData?.[`${phase}-python-vars`]||{name:'Ana',age:16,grade:8.5,active:true};
    container.innerHTML=`<div class="guided-python-sim"><section class="guided-sim-controls"><label>nome (str)<input data-var="name" value="${escapeHtml(saved.name)}"></label><label>idade (int)<input data-var="age" type="number" min="0" max="120" value="${saved.age}"></label><label>nota (float)<input data-var="grade" type="number" min="0" max="10" step="0.1" value="${saved.grade}"></label><label class="guided-inline-check"><input data-var="active" type="checkbox" ${saved.active?'checked':''}> matriculado (bool)</label><button data-save-vars class="btn primary" type="button">Salvar estado da memória</button></section><section><pre class="guided-sim-code" data-var-code></pre><div class="guided-memory" data-memory></div><div class="guided-code-output" data-var-output></div></section></div>`;
    const read=()=>({name:container.querySelector('[data-var="name"]').value,age:Number(container.querySelector('[data-var="age"]').value),grade:Number(container.querySelector('[data-var="grade"]').value),active:container.querySelector('[data-var="active"]').checked});
    const paint=()=>{const d=read();container.querySelector('[data-var-code]').textContent=`nome = ${JSON.stringify(d.name)}\nidade = int(${d.age})\nnota = float(${d.grade})\nmatriculado = ${d.active?'True':'False'}\nmeses = idade * 12`;container.querySelector('[data-memory]').innerHTML=[['nome','str',d.name],['idade','int',d.age],['nota','float',d.grade.toFixed(1)],['matriculado','bool',d.active?'True':'False'],['meses','int',d.age*12]].map(x=>`<article><small>${x[1]}</small><strong>${escapeHtml(String(x[0]))}</strong><span>${escapeHtml(String(x[2]))}</span></article>`).join('');container.querySelector('[data-var-output]').textContent=`${d.name || 'Estudante'} tem aproximadamente ${d.age*12} meses e nota ${d.grade.toFixed(1)}.`;};
    container.addEventListener('input',paint);container.addEventListener('change',paint);paint();container.querySelector('[data-save-vars]').onclick=()=>{const d=read();currentProgress.labData[`${phase}-python-vars`]=d;saveProgress();logEvent('simulador_python','variáveis testadas',{phase});markStepComplete('variáveis e tipos testados');};
  }
  function renderDecisionSimulator(container,phase){
    const saved=currentProgress.labData?.[`${phase}-decision`]||{grade:70,attendance:80,authorized:false};
    container.innerHTML=`<div class="guided-decision-sim"><section class="guided-sim-controls"><label>Nota <output data-d-out="grade">${saved.grade}</output><input data-d="grade" type="range" min="0" max="100" value="${saved.grade}"></label><label>Presença <output data-d-out="attendance">${saved.attendance}%</output><input data-d="attendance" type="range" min="0" max="100" value="${saved.attendance}"></label><label class="guided-inline-check"><input data-d="authorized" type="checkbox" ${saved.authorized?'checked':''}> autorização especial</label><button data-save-decision class="btn primary" type="button">Salvar teste de decisão</button></section><section><pre class="guided-sim-code">if nota >= 60 and presenca >= 75:\n    resultado = "Aprovado"\nelif autorizacao:\n    resultado = "Análise do professor"\nelse:\n    resultado = "Revisar atividade"</pre><div class="guided-decision-path" data-decision-path></div></section></div>`;
    const read=()=>({grade:Number(container.querySelector('[data-d="grade"]').value),attendance:Number(container.querySelector('[data-d="attendance"]').value),authorized:container.querySelector('[data-d="authorized"]').checked});
    const paint=()=>{const d=read();container.querySelector('[data-d-out="grade"]').textContent=d.grade;container.querySelector('[data-d-out="attendance"]').textContent=`${d.attendance}%`;const pass=d.grade>=60&&d.attendance>=75;const result=pass?'Aprovado':d.authorized?'Análise do professor':'Revisar atividade';container.querySelector('[data-decision-path]').innerHTML=`<div class="${d.grade>=60?'ok':'no'}">nota ≥ 60: <b>${d.grade>=60?'verdadeiro':'falso'}</b></div><div class="${d.attendance>=75?'ok':'no'}">presença ≥ 75: <b>${d.attendance>=75?'verdadeiro':'falso'}</b></div><div class="${d.authorized?'ok':'no'}">autorização: <b>${d.authorized?'verdadeiro':'falso'}</b></div><p>Resultado: <strong>${result}</strong></p>`;};
    container.addEventListener('input',paint);container.addEventListener('change',paint);paint();container.querySelector('[data-save-decision]').onclick=()=>{const d=read();currentProgress.labData[`${phase}-decision`]=d;saveProgress();logEvent('simulador_decisao','condições testadas',{phase,...d});markStepComplete('caminhos de decisão testados');};
  }
  function renderBoxModelTool(container,phase){
    const saved=currentProgress.labData?.[`${phase}-box`]||{width:260,padding:24,border:4,margin:16,boxSizing:'content-box'};
    container.innerHTML=`<div class="guided-box-lab"><section class="guided-sim-controls"><label>width <output data-b-out="width">${saved.width}px</output><input data-b="width" type="range" min="120" max="360" value="${saved.width}"></label><label>padding <output data-b-out="padding">${saved.padding}px</output><input data-b="padding" type="range" min="0" max="48" value="${saved.padding}"></label><label>border <output data-b-out="border">${saved.border}px</output><input data-b="border" type="range" min="0" max="16" value="${saved.border}"></label><label>margin <output data-b-out="margin">${saved.margin}px</output><input data-b="margin" type="range" min="0" max="40" value="${saved.margin}"></label><label>box-sizing<select data-b="boxSizing"><option value="content-box" ${saved.boxSizing==='content-box'?'selected':''}>content-box</option><option value="border-box" ${saved.boxSizing==='border-box'?'selected':''}>border-box</option></select></label><button data-save-box class="btn primary" type="button">Salvar análise do Box Model</button></section><section class="guided-box-stage"><div class="guided-box-container"><div class="guided-box-preview">conteúdo</div></div><pre data-box-css></pre><p data-box-total></p></section></div>`;
    const read=()=>Object.fromEntries($$('[data-b]',container).map(n=>[n.dataset.b,n.type==='range'?Number(n.value):n.value]));
    const paint=()=>{const d=read();$$('[data-b-out]',container).forEach(o=>o.textContent=`${d[o.dataset.bOut]}px`);const box=container.querySelector('.guided-box-preview');box.style.width=`${d.width}px`;box.style.padding=`${d.padding}px`;box.style.borderWidth=`${d.border}px`;box.style.margin=`${d.margin}px`;box.style.boxSizing=d.boxSizing;const total=d.boxSizing==='border-box'?d.width:d.width+d.padding*2+d.border*2;container.querySelector('[data-box-css]').textContent=`.card {\n  box-sizing: ${d.boxSizing};\n  width: ${d.width}px;\n  padding: ${d.padding}px;\n  border: ${d.border}px solid;\n  margin: ${d.margin}px;\n}`;container.querySelector('[data-box-total]').innerHTML=`Largura visual da caixa: <strong>${total}px</strong>${total>360?' • ultrapassou o contêiner de 360 px':''}`;container.querySelector('.guided-box-container').classList.toggle('has-overflow',total+d.margin*2>400);};
    container.addEventListener('input',paint);container.addEventListener('change',paint);paint();container.querySelector('[data-save-box]').onclick=()=>{const d=read();currentProgress.labData[`${phase}-box`]=d;saveProgress();logEvent('box_model','configuração testada',{phase,...d});markStepComplete('Box Model analisado');};
  }
  function renderUiAuditTool(container,phase){
    const issues=currentLesson.auditIssues||[
      {id:'label',label:'Rótulos diferentes para a mesma ação.'},{id:'danger',label:'Ação destrutiva com o mesmo destaque da ação principal.'},{id:'back',label:'Fluxo sem retorno previsível.'},{id:'feedback',label:'Ação sem feedback de carregamento, sucesso ou erro.'}
    ];
    const distractors=[{id:'logo',label:'A tela possui um título identificando o aplicativo.'},{id:'spacing-ok',label:'Existe espaçamento entre o conteúdo e as bordas.'}];
    const saved=currentProgress.labData?.[`${phase}-audit`]||{selected:[],repaired:false};
    const all=[...issues,...distractors];
    container.innerHTML=`<div class="guided-ui-audit"><section class="guided-audit-phone ${saved.repaired?'is-repaired':''}"><header><button type="button">←</button><strong>${saved.repaired?'Portal DS':'DESAFIO ds'}</strong><button class="guided-audit-link" type="button">Menu</button></header><main><h3>${saved.repaired?'Cadastro do estudante':'CADASTRE AGORA!!!'}</h3><p>${saved.repaired?'Preencha os dados obrigatórios para continuar.':'Digite tudo para ir para próxima página clique abaixo.'}</p><label>Nome<input placeholder="Nome"></label><button class="guided-audit-main" type="button">${saved.repaired?'Continuar':'Avançar'}</button><button class="guided-audit-alt" type="button">${saved.repaired?'Cancelar':'Próximo'}</button><div class="guided-audit-feedback">${saved.repaired?'Dados ainda não enviados.':' '}</div></main><footer><button type="button">Início</button><button type="button">Aulas</button><button class="guided-audit-danger" type="button">Excluir</button></footer></section><section class="guided-audit-check"><h3>Encontre os problemas</h3>${all.map(x=>`<label><input type="checkbox" value="${x.id}" ${saved.selected.includes(x.id)?'checked':''}> ${escapeHtml(x.label)}</label>`).join('')}<div class="guided-tool-actions"><button data-check-audit class="btn primary" type="button">Verificar análise</button><button data-repair-audit class="btn secondary" type="button">Aplicar correções</button></div><div class="guided-code-output" data-audit-result>Marque os problemas observados.</div></section></div>`;
    const selection=()=>$$('input[type="checkbox"]:checked',container).map(n=>n.value);
    container.querySelector('[data-check-audit]').onclick=()=>{const sel=selection(),correct=issues.filter(x=>sel.includes(x.id)).length,wrong=distractors.filter(x=>sel.includes(x.id)).length;const score=Math.max(0,correct-wrong);container.querySelector('[data-audit-result]').innerHTML=`Você identificou <strong>${correct} de ${issues.length}</strong> problemas reais${wrong?` e marcou ${wrong} item coerente como erro.`:'.'}`+(score>=Math.ceil(issues.length*.67)?'<br>Boa análise: agora aplique as correções.':'<br>Revise rótulos, hierarquia, retorno, feedback e consistência entre ações.');currentProgress.labData[`${phase}-audit`]={selected:sel,repaired:saved.repaired};saveProgress();logEvent('auditoria_ui','problemas verificados',{phase,correct,wrong});};
    container.querySelector('[data-repair-audit]').onclick=()=>{const sel=selection(),correct=issues.filter(x=>sel.includes(x.id)).length;if(correct<Math.ceil(issues.length*.67))return showFeedback('Identifique a maior parte dos problemas antes de aplicar as correções.','warn');const state={selected:sel,repaired:true};currentProgress.labData[`${phase}-audit`]=state;saveProgress();logEvent('auditoria_ui','correções aplicadas',{phase,correct});renderUiAuditTool(container,phase);markStepComplete('coerência e continuidade revisadas');};
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
      $('#guidedCodeOutput').textContent=['html','semantic','form','css'].includes(type)?'Prévia atualizada. Estrutura e estilos reconhecidos.':'Teste executado no simulador: estrutura analisada e tentativa registrada.';
      if(['html','semantic','form'].includes(type)) createSafePreview(container,value);
      if(type==='css') createCssPreview(container,value);
      currentProgress.labData[`${phase}-tested`]=true;saveProgress();logEvent('ferramenta_codigo','teste executado',{phase,type,chars:value.length});markStepComplete(`laboratório ${type}`);
    });
    $('#guidedExternalTool').addEventListener('click',()=>openExternalTool(0));
  }
  function createCssPreview(container,css){
    let iframe=$('.guided-safe-preview',container);if(!iframe){iframe=document.createElement('iframe');iframe.className='guided-safe-preview';iframe.setAttribute('sandbox','');iframe.title='Prévia segura do CSS';container.appendChild(iframe);}
    const safe=String(css).replace(/@import[^;]+;/gi,'').replace(/url\s*\([^)]*\)/gi,'none').replace(/expression\s*\([^)]*\)/gi,'');
    iframe.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box}body{font-family:Arial;padding:18px;color:#172033}.demo{max-width:520px;margin:auto}.card{border:2px solid #94a3b8;padding:16px;border-radius:12px}.actions{display:flex;gap:10px;flex-wrap:wrap}button{min-height:44px}</style><style>${safe}</style><main class="demo"><article class="card"><h2>Componente de teste</h2><p>Altere cores, espaçamento, tipografia e organização.</p><div class="actions"><button>Continuar</button><button>Revisar</button></div></article></main>`;
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
    if(Array.isArray(currentLesson?.codeSamples)&&currentLesson.codeSamples.length) return currentLesson.codeSamples[0].code;
    return '# Exemplo para explorar\nnome = "Estudante"\nprint(nome)';
  }
  function deviceProfiles(){
    return {
      'android-small':{label:'Android compacto',w:320,h:640},
      'android-large':{label:'Android grande',w:412,h:915},
      iphone:{label:'iPhone',w:390,h:844},
      tablet:{label:'Tablet',w:768,h:1024},
      notebook:{label:'Notebook',w:1280,h:800}
    };
  }
  function renderDeviceEmulator(container,phase,type){
    const profiles=deviceProfiles();
    const saved=currentProgress.labData?.[`${phase}-device`]||{device:'android-small',orientation:'portrait',layout:'stack',font:16,title:'Portal DS',text:'Conteúdo responsivo sem sobreposição.',action:'Continuar',safeArea:true};
    container.innerHTML=`<div class="guided-device-lab">
      <form class="guided-device-controls">
        <label>Dispositivo<select data-field="device">${Object.entries(profiles).map(([key,v])=>`<option value="${key}" ${saved.device===key?'selected':''}>${v.label}</option>`).join('')}</select></label>
        <label>Orientação<select data-field="orientation"><option value="portrait" ${saved.orientation==='portrait'?'selected':''}>Vertical</option><option value="landscape" ${saved.orientation==='landscape'?'selected':''}>Horizontal</option></select></label>
        <label>Organização<select data-field="layout"><option value="stack" ${saved.layout==='stack'?'selected':''}>Uma coluna</option><option value="grid" ${saved.layout==='grid'?'selected':''}>Grade adaptável</option><option value="fixed" ${saved.layout==='fixed'?'selected':''}>Largura fixa problemática</option></select></label>
        <label>Tamanho do texto <output data-output="font">${saved.font}px</output><input data-field="font" type="range" min="12" max="28" value="${saved.font}"></label>
        <label>Título<input data-field="title" value="${escapeHtml(saved.title)}"></label>
        <label>Texto<textarea data-field="text">${escapeHtml(saved.text)}</textarea></label>
        <label>Ação<input data-field="action" value="${escapeHtml(saved.action)}"></label>
        <label class="guided-inline-check"><input data-field="safeArea" type="checkbox" ${saved.safeArea?'checked':''}> Mostrar área segura</label>
        <button data-action="save-device" class="btn primary" type="button">Salvar teste em dispositivos</button>
      </form>
      <section class="guided-device-stage"><div class="guided-device-frame"><div class="guided-device-notch"></div><div class="guided-device-safe"><header><button class="guided-mini-menu" aria-label="Abrir menu">☰</button><strong data-preview="title"></strong></header><main><div class="guided-device-cards"><article><h4>Conteúdo</h4><p data-preview="text"></p></article><article><h4>Teste</h4><p>Redimensione, gire e observe a organização.</p></article></div></main><footer><button data-preview="action" type="button"></button></footer></div></div><p class="guided-device-readout"></p></section>
    </div>`;
    const controls=container.querySelector('.guided-device-controls'),frame=container.querySelector('.guided-device-frame'),safe=container.querySelector('.guided-device-safe');
    const read=()=>{
      const obj={}; $$('[data-field]',controls).forEach(n=>obj[n.dataset.field]=n.type==='checkbox'?n.checked:n.type==='range'?Number(n.value):n.value); return obj;
    };
    const paint=()=>{
      const d=read(),profile=profiles[d.device]||profiles['android-small']; let w=profile.w,h=profile.h;if(d.orientation==='landscape'){[w,h]=[h,w];}
      const scale=Math.min(1,620/Math.max(w,h),520/w); frame.style.setProperty('--device-width',`${w}px`);frame.style.setProperty('--device-height',`${h}px`);frame.style.setProperty('--device-scale',String(scale));
      frame.dataset.layout=d.layout; safe.classList.toggle('show-safe',d.safeArea);safe.style.fontSize=`${d.font}px`;
      container.querySelector('[data-preview="title"]').textContent=d.title;container.querySelector('[data-preview="text"]').textContent=d.text;container.querySelector('[data-preview="action"]').textContent=d.action;
      container.querySelector('[data-output="font"]').textContent=`${d.font}px`;container.querySelector('.guided-device-readout').textContent=`Viewport CSS: ${w} × ${h} • ${d.orientation==='landscape'?'horizontal':'vertical'} • ${profile.label}`;
    };
    controls.addEventListener('input',paint);controls.addEventListener('change',paint);paint();
    container.querySelector('[data-action="save-device"]').addEventListener('click',()=>{const d=read();currentProgress.labData[`${phase}-device`]=d;saveProgress();logEvent('emulador_dispositivos',`${d.device}/${d.orientation}`,{phase,type});markStepComplete('teste multidispositivo salvo');});
  }
  function renderFittsHickTool(container,phase){
    const mode=currentLesson.toolConfig?.mode||'fitts';
    const saved=currentProgress.labData?.[`${phase}-fitts`]||{size:44,distance:180,choices:8,position:70};
    container.innerHTML=`<div class="guided-law-lab"><section class="guided-law-controls"><label>Tamanho do alvo <output data-o="size">${saved.size}px</output><input data-f="size" type="range" min="20" max="96" value="${saved.size}"></label><label>Distância até a ação <output data-o="distance">${saved.distance}px</output><input data-f="distance" type="range" min="20" max="320" value="${saved.distance}"></label><label>Quantidade de escolhas <output data-o="choices">${saved.choices}</output><input data-f="choices" type="range" min="2" max="16" value="${saved.choices}"></label><label>Posição vertical <input data-f="position" type="range" min="8" max="88" value="${saved.position}"></label><button class="btn primary" data-save-law type="button">Salvar análise</button></section><section class="guided-law-phone"><div class="guided-thumb-zone"></div><button class="guided-law-target" type="button">Ação</button>${Array.from({length:8},(_,i)=>`<span class="guided-choice" style="--i:${i}">Opção ${i+1}</span>`).join('')}</section><section class="guided-law-metrics"><h3>${mode==='hick'?'Lei de Hick':'Lei de Fitts'}</h3><p data-metric></p><small>O índice é comparativo e serve para observar tendências; não representa o tempo real de todas as pessoas.</small></section></div>`;
    const get=()=>Object.fromEntries($$('[data-f]',container).map(n=>[n.dataset.f,Number(n.value)]));
    const paint=()=>{const d=get();$$('[data-o]',container).forEach(o=>o.textContent=o.dataset.o==='choices'?d.choices:`${d[o.dataset.o]}px`);const target=container.querySelector('.guided-law-target');target.style.width=target.style.height=`${d.size}px`;target.style.top=`${d.position}%`;target.style.right=`${Math.min(76,d.distance/4)}%`;const f=Math.log2(d.distance/d.size+1),h=Math.log2(d.choices+1);container.querySelector('[data-metric]').innerHTML=`Índice de Fitts: <strong>${f.toFixed(2)}</strong> • Índice de Hick: <strong>${h.toFixed(2)}</strong><br>${d.size<44?'Alvo pequeno: aumente a área de toque.':'Alvo com tamanho mais confortável.'} ${d.choices>7?'Muitas escolhas simultâneas: considere agrupar.':'Quantidade de escolhas mais controlada.'}`;$$('.guided-choice',container).forEach((n,i)=>n.hidden=i>=d.choices);};
    container.addEventListener('input',paint);paint();container.querySelector('[data-save-law]').addEventListener('click',()=>{const d=get();currentProgress.labData[`${phase}-fitts`]=d;saveProgress();logEvent('leis_interacao',mode,{...d,phase});markStepComplete(`análise ${mode} salva`);});
  }
  function renderMobileNavigationTool(container,phase){
    const saved=currentProgress.labData?.[`${phase}-nav`]||{pattern:'bottom',items:4,active:0};
    container.innerHTML=`<div class="guided-nav-lab"><div class="guided-nav-controls"><label>Padrão<select data-nav="pattern"><option value="bottom" ${saved.pattern==='bottom'?'selected':''}>Barra inferior</option><option value="drawer" ${saved.pattern==='drawer'?'selected':''}>Menu hambúrguer</option><option value="tabs" ${saved.pattern==='tabs'?'selected':''}>Abas</option></select></label><label>Itens principais <input data-nav="items" type="range" min="3" max="8" value="${saved.items}"><output>${saved.items}</output></label><button data-save-nav class="btn primary" type="button">Salvar navegação</button></div><div class="guided-nav-phone"><header><button class="guided-hamburger" type="button">☰</button><strong>MiniApp DS</strong></header><nav class="guided-nav-preview"></nav><main><h4>Tela ativa</h4><p>Selecione uma opção e observe o estado.</p></main></div></div>`;
    const render=()=>{const pattern=container.querySelector('[data-nav="pattern"]').value,items=Number(container.querySelector('[data-nav="items"]').value);container.querySelector('output').textContent=items;const nav=container.querySelector('.guided-nav-preview');nav.dataset.pattern=pattern;nav.innerHTML=Array.from({length:items},(_,i)=>`<button type="button" class="${i===saved.active?'active':''}" data-i="${i}">${['Início','Aulas','Projetos','Perfil','Busca','Avisos','Ajuda','Mais'][i]}</button>`).join('');container.querySelector('.guided-hamburger').hidden=pattern!=='drawer';$$('button[data-i]',nav).forEach(b=>b.onclick=()=>{saved.active=Number(b.dataset.i);render();});};container.addEventListener('input',render);container.addEventListener('change',render);render();container.querySelector('[data-save-nav]').onclick=()=>{saved.pattern=container.querySelector('[data-nav="pattern"]').value;saved.items=Number(container.querySelector('[data-nav="items"]').value);currentProgress.labData[`${phase}-nav`]=saved;saveProgress();logEvent('navegacao_mobile',saved.pattern,{phase,items:saved.items});markStepComplete('navegação testada');};
  }
  function renderMobileQualityTool(container,phase){
    const saved=currentProgress.labData?.[`${phase}-quality`]||{large:false,contrast:false,reduced:false,slow:false,offline:false,compat:false};
    container.innerHTML=`<div class="guided-quality-lab"><div class="guided-quality-controls"><label><input data-q="large" type="checkbox" ${saved.large?'checked':''}> Texto ampliado</label><label><input data-q="contrast" type="checkbox" ${saved.contrast?'checked':''}> Alto contraste</label><label><input data-q="reduced" type="checkbox" ${saved.reduced?'checked':''}> Movimento reduzido</label><label><input data-q="slow" type="checkbox" ${saved.slow?'checked':''}> Rede/hardware limitado</label><label><input data-q="offline" type="checkbox" ${saved.offline?'checked':''}> Sem internet / API indisponível</label><label><input data-q="compat" type="checkbox" ${saved.compat?'checked':''}> Navegador com recurso não suportado</label><button data-save-quality class="btn primary" type="button">Salvar revisão de qualidade</button></div><div class="guided-quality-preview"><div class="guided-quality-loader"></div><h3>Atividade mobile</h3><p data-quality-message>Esta tela precisa continuar legível e funcional em diferentes condições.</p><button type="button">Ação principal</button><small data-quality-fallback></small></div></div>`;
    const read=()=>Object.fromEntries($$('[data-q]',container).map(n=>[n.dataset.q,n.checked]));
    const paint=()=>{const d=read(),preview=container.querySelector('.guided-quality-preview');Object.entries(d).forEach(([k,v])=>preview.classList.toggle(`q-${k}`,v));const msg=container.querySelector('[data-quality-message]'),fallback=container.querySelector('[data-quality-fallback]');if(d.offline){msg.textContent='Sem conexão. O conteúdo salvo continua disponível e a sincronização será tentada depois.';}else if(d.compat){msg.textContent='Este navegador não oferece o recurso principal. Use a alternativa compatível abaixo.';}else{msg.textContent='Esta tela precisa continuar legível e funcional em diferentes condições.';}fallback.textContent=d.compat?'Alternativa: formulário HTML básico e download local.':d.offline?'Disponibilidade: dados locais preservados.':'';};
    container.addEventListener('change',paint);paint();container.querySelector('[data-save-quality]').onclick=()=>{const d=read();currentProgress.labData[`${phase}-quality`]=d;saveProgress();logEvent('qualidade_mobile','acessibilidade e compatibilidade testadas',{phase,...d});markStepComplete('revisão de acessibilidade, desempenho e compatibilidade salva');};
  }
  function analyzeLanguageSample(language,code){
    const l=String(language).toLowerCase();const problems=[];
    if(/java|kotlin/.test(l)&&!/\{[\s\S]*\}/.test(code))problems.push('verifique os blocos entre chaves');
    if(l.includes('java')&&!l.includes('javascript')&&!/;/.test(code))problems.push('Java normalmente exige ponto e vírgula nas instruções');
    if(l.includes('kotlin')&&/!!/.test(code))problems.push('o operador !! pode causar falha quando o valor é nulo');
    if(l.includes('swift')&&/!\b/.test(code)&&!/!=/.test(code))problems.push('evite abrir opcional à força sem validação');
    if(l.includes('rust')&&/String/.test(code)&&/->\s*&str/.test(code))problems.push('revise tempo de vida e propriedade do texto retornado');
    const event=/click|tap|onClick|setOnClickListener|Button|botao|button/i.test(code)?'evento de interface identificado':'função ou regra de negócio identificada';
    return{issues:problems.length,message:problems.length?`Revisar: ${problems.join('; ')}.`:'Estrutura básica coerente para a simulação.',flow:`Fluxo simulado: entrada → ${event} → atualização de estado → feedback na tela.`};
  }
  function renderLanguageLab(container,phase){
    const samples=(currentLesson.codeSamples||[]);const sample=samples[0]||{language:'Código',label:'Exemplo',code:starterCode('code'),note:''};const saved=currentProgress.labData?.[`${phase}-language`]||{index:0,code:sample.code};
    container.innerHTML=`<div class="guided-language-lab"><div class="guided-language-tabs">${samples.map((x,i)=>`<button type="button" data-lang-index="${i}" class="${i===saved.index?'active':''}">${escapeHtml(x.language)}</button>`).join('')}</div><div class="guided-code-toolbar"><span data-language-title>${escapeHtml(sample.language)} • ${escapeHtml(sample.label)}</span><button data-restore-language class="btn tiny" type="button">Restaurar</button></div><textarea class="guided-code-editor" data-language-editor spellcheck="false"></textarea><p class="guided-language-note"></p><div class="guided-tool-actions"><button data-run-language class="btn primary" type="button">Executar simulação</button><button data-open-language class="btn secondary" type="button">Abrir documentação</button></div><div class="guided-code-output" data-language-output>Edite um valor e execute o exemplo.</div></div>`;
    let idx=Math.min(saved.index,samples.length-1);const editor=container.querySelector('[data-language-editor]');const load=(i,keep=false)=>{idx=i;const x=samples[i]||sample;editor.value=keep&&saved.code?saved.code:x.code;container.querySelector('[data-language-title]').textContent=`${x.language} • ${x.label}`;container.querySelector('.guided-language-note').textContent=x.note||'';$$('[data-lang-index]',container).forEach(b=>b.classList.toggle('active',Number(b.dataset.langIndex)===i));};load(idx,true);$$('[data-lang-index]',container).forEach(b=>b.onclick=()=>load(Number(b.dataset.langIndex)));container.querySelector('[data-restore-language]').onclick=()=>load(idx);container.querySelector('[data-run-language]').onclick=()=>{const code=editor.value.trim();if(code.length<15)return showFeedback('Mantenha um exemplo de código suficiente para o teste.','warn');const language=samples[idx]?.language||'Código';const analysis=analyzeLanguageSample(language,code);container.querySelector('[data-language-output]').innerHTML=`<strong>${escapeHtml(language)}:</strong> ${escapeHtml(analysis.message)}<br><small>${escapeHtml(analysis.flow)}</small>`;currentProgress.labData[`${phase}-language`]={index:idx,code};saveProgress();logEvent('laboratorio_linguagem',language,{phase,chars:code.length,issues:analysis.issues});if(analysis.issues===0)markStepComplete(`exemplo ${language} testado`);else showFeedback('O simulador encontrou um ponto para revisar antes de concluir.','warn');};container.querySelector('[data-open-language]').onclick=()=>openExternalTool(0);
  }
  function renderApiMobileTool(container,phase){
    const saved=currentProgress.labData?.[`${phase}-api`]||{state:'idle',theme:'claro'};
    container.innerHTML=`<div class="guided-api-lab"><div class="guided-api-actions"><button data-api="loading" type="button">Carregando</button><button data-api="success" type="button">Sucesso</button><button data-api="empty" type="button">Vazio</button><button data-api="error" type="button">Erro/offline</button></div><div class="guided-api-phone"><header>Dados do projeto</header><main data-api-screen></main><label>Tema<select data-api-theme><option value="claro" ${saved.theme==='claro'?'selected':''}>Claro</option><option value="escuro" ${saved.theme==='escuro'?'selected':''}>Escuro</option></select></label></div><pre class="guided-api-json" data-api-json></pre><button data-save-api class="btn primary" type="button">Salvar teste de dados</button></div>`;
    let state=saved.state;const paint=()=>{const screen=container.querySelector('[data-api-screen]'),json=container.querySelector('[data-api-json]');const map={idle:'Escolha um estado da requisição.',loading:'Carregando dados…',success:'3 projetos encontrados.',empty:'Nenhum projeto encontrado.',error:'Não foi possível conectar. Tente novamente.'};screen.dataset.state=state;screen.textContent=map[state];json.textContent=state==='success'?JSON.stringify({projetos:[{id:1,nome:'Lab DS'},{id:2,nome:'MiniApp'}]},null,2):JSON.stringify({estado:state},null,2);container.querySelector('.guided-api-phone').dataset.theme=container.querySelector('[data-api-theme]').value;};$$('[data-api]',container).forEach(b=>b.onclick=()=>{state=b.dataset.api;paint();});container.querySelector('[data-api-theme]').onchange=paint;paint();container.querySelector('[data-save-api]').onclick=()=>{const d={state,theme:container.querySelector('[data-api-theme]').value};currentProgress.labData[`${phase}-api`]=d;saveProgress();logEvent('api_mobile',state,{phase,theme:d.theme});markStepComplete('estados da API testados');};
  }
  function renderMobileEcosystemTool(container,phase){
    const choices=['Web responsiva/PWA','Android nativo','iOS nativo','Flutter','React Native'];const scenarios=['Sistema escolar para celulares simples','Aplicativo com câmera e GPS intensivos','Protótipo rápido para Android e iOS'];const saved=currentProgress.labData?.[`${phase}-ecosystem`]||{};
    container.innerHTML=`<div class="guided-ecosystem-lab">${scenarios.map((x,i)=>`<label><span>${escapeHtml(x)}</span><select data-scenario="${i}">${choices.map(c=>`<option ${saved[i]===c?'selected':''}>${c}</option>`).join('')}</select><textarea data-reason="${i}" placeholder="Justifique considerando usuário, hardware, prazo e manutenção.">${escapeHtml(saved[`r${i}`]||'')}</textarea></label>`).join('')}<button data-save-ecosystem class="btn primary" type="button">Salvar decisões tecnológicas</button></div>`;container.querySelector('[data-save-ecosystem]').onclick=()=>{const d={};let ok=true;scenarios.forEach((_,i)=>{d[i]=container.querySelector(`[data-scenario="${i}"]`).value;d[`r${i}`]=container.querySelector(`[data-reason="${i}"]`).value.trim();if(d[`r${i}`].length<15)ok=false;});if(!ok)return showFeedback('Justifique cada decisão com pelo menos 15 caracteres.','warn');currentProgress.labData[`${phase}-ecosystem`]=d;saveProgress();logEvent('ecossistema_mobile','arquiteturas comparadas',{phase});markStepComplete('comparação tecnológica concluída');};
  }
  function renderPhoneTool(container,phase,type){
    const saved=currentProgress.labData?.[`${phase}-phone`] || {title:'MiniApp DS',text:'Conteúdo principal',action:'Continuar',menu:'bottom'};
    container.innerHTML=`<div class="guided-phone-editor"><div><label>Título<input id="phoneTitle" value="${escapeHtml(saved.title)}"/></label><label>Mensagem<textarea id="phoneText">${escapeHtml(saved.text)}</textarea></label><label>Ação principal<input id="phoneAction" value="${escapeHtml(saved.action)}"/></label><label>Navegação<select id="phoneMenu"><option value="bottom" ${saved.menu==='bottom'?'selected':''}>Inferior</option><option value="hamburger" ${saved.menu==='hamburger'?'selected':''}>Hambúrguer</option><option value="tabs" ${saved.menu==='tabs'?'selected':''}>Abas</option></select></label><button id="phoneApply" class="btn primary" type="button">Atualizar protótipo</button></div><div class="guided-phone" data-menu="${escapeHtml(saved.menu)}"><div class="guided-phone-notch"></div><header><button class="guided-mini-menu" type="button">☰</button><span id="phonePreviewTitle">${escapeHtml(saved.title)}</span></header><main><p id="phonePreviewText">${escapeHtml(saved.text)}</p></main><footer><button id="phonePreviewAction" type="button">${escapeHtml(saved.action)}</button><nav><span>Início</span><span>Aulas</span><span>Perfil</span></nav></footer></div></div>`;
    $('#phoneApply').addEventListener('click',()=>{const data={title:$('#phoneTitle').value.trim(),text:$('#phoneText').value.trim(),action:$('#phoneAction').value.trim(),menu:$('#phoneMenu').value};if(!data.title||!data.text||!data.action)return showFeedback('Preencha título, mensagem e ação.','warn');$('#phonePreviewTitle').textContent=data.title;$('#phonePreviewText').textContent=data.text;$('#phonePreviewAction').textContent=data.action;container.querySelector('.guided-phone').dataset.menu=data.menu;currentProgress.labData=currentProgress.labData||{};currentProgress.labData[`${phase}-phone`]=data;saveProgress();logEvent('prototipo_atualizado',type,{phase,menu:data.menu});markStepComplete(`protótipo ${type}`);});
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
  function deliveryState(){
    currentProgress.delivery=currentProgress.delivery||{mode:'guided',exported:false,classroomOpened:false,fileLocated:false,attached:false,declaredDelivered:false};
    return currentProgress.delivery;
  }
  function setDeliveryFlag(flag,value=true){
    const delivery=deliveryState();delivery[flag]=value;delivery.updatedAt=new Date().toISOString();saveProgress();
    logEvent(`entrega_${flag}`,String(value));renderFinish();
  }
  function deliveryHelpHtml(mode){
    const d=deliveryState();
    if(mode==='experienced')return `<div class="guided-delivery-experienced"><h3>Já sei entregar</h3><p>Use os atalhos abaixo. A ajuda completa continua disponível.</p><div class="guided-delivery-status"><span class="${d.exported?'done':''}">Arquivo ${d.exported?'exportado':'pendente'}</span><span class="${d.classroomOpened?'done':''}">Classroom ${d.classroomOpened?'aberto':'não aberto'}</span><span class="${d.declaredDelivered?'done':''}">Entrega ${d.declaredDelivered?'declarada pelo aluno':'não confirmada'}</span></div></div>`;
    if(mode==='quick')return `<div class="guided-delivery-checklist"><h3>Checklist rápido</h3><label><input type="checkbox" data-delivery-flag="fileLocated" ${d.fileLocated?'checked':''}> Localizei o arquivo em Downloads.</label><label><input type="checkbox" data-delivery-flag="attached" ${d.attached?'checked':''}> Anexei o arquivo ou link em Seu trabalho.</label><label><input type="checkbox" data-delivery-flag="declaredDelivered" ${d.declaredDelivered?'checked':''}> Cliquei em Entregar e conferi o status.</label><p class="guided-delivery-disclaimer">As confirmações acima são declarações do aluno. Somente uma API autenticada poderia confirmar externamente.</p></div>`;
    return `<div class="guided-delivery-wizard"><h3>Me guie passo a passo</h3><ol><li class="${d.exported?'done':''}"><strong>Prepare o resultado</strong><span>Exporte a evidência em HTML ou JSON.</span></li><li class="${d.fileLocated?'done':''}"><strong>Localize o arquivo</strong><span>Normalmente ele fica na pasta Downloads do navegador.</span><button type="button" class="btn tiny ghost" data-delivery-action="located">Consegui localizar</button></li><li class="${d.classroomOpened?'done':''}"><strong>Abra a atividade</strong><span>Confirme a conta, a turma e o título correto.</span></li><li class="${d.attached?'done':''}"><strong>Anexe em Seu trabalho</strong><span>Use Adicionar ou criar → Arquivo ou Link.</span><button type="button" class="btn tiny ghost" data-delivery-action="attached">Consegui anexar</button></li><li class="${d.declaredDelivered?'done':''}"><strong>Entregue e confirme</strong><span>Clique em Entregar e verifique se aparece Entregue.</span><button type="button" class="btn tiny secondary" data-delivery-action="delivered">Confirmo que entreguei</button></li></ol><details><summary>Não encontrei o arquivo</summary><p>Abra os downloads do navegador, pesquise pelo nome da turma ou da aula e confira se o arquivo abre normalmente. Você também pode exportar novamente.</p></details><details><summary>O upload não inicia</summary><p>Confira a internet, a conta escolar e o espaço disponível no Drive, Gmail e Google Fotos. A conta escolar pode possuir 5 GB ou, no máximo, 15 GB.</p></details></div>`;
  }
  function bindDeliveryHelp(){
    $$('.guided-delivery-mode').forEach(button=>button.addEventListener('click',()=>{deliveryState().mode=button.dataset.mode;saveProgress();renderFinish();}));
    $$('[data-delivery-flag]').forEach(input=>input.addEventListener('change',()=>setDeliveryFlag(input.dataset.deliveryFlag,input.checked)));
    $$('[data-delivery-action]').forEach(button=>button.addEventListener('click',()=>setDeliveryFlag(button.dataset.deliveryAction==='located'?'fileLocated':button.dataset.deliveryAction==='attached'?'attached':'declaredDelivered',true)));
  }
  function renderFinish(){
    const min=currentLesson.minimumActiveSeconds||DATA.minimumActiveSeconds;
    const remaining=Math.max(0,min-(currentProgress.activeSeconds||0));
    const allPrevious=[0,1,2,3,4,5,6,7,8].every(i=>(currentProgress.completedSteps||[]).includes(i));
    const timeOk=remaining===0 || !!currentProgress.teacherOverride;
    const ready=allPrevious && timeOk;
    const delivery=deliveryState();
    if(ready && !canAdvance) markStepComplete('requisitos finais atendidos');
    window.DS_Schedule?.setActivityContext?.({resultReady:ready,exportPending:!delivery.exported,classroomOpened:delivery.classroomOpened});
    el.stepContent.innerHTML=`
      <span class="guided-kicker">FINALIZAR E ENTREGAR</span><h1>${ready?'Aula pronta para conclusão':'Confira os requisitos'}</h1>
      <div class="guided-completion-grid">
        <div><span>Etapas obrigatórias</span><strong>${allPrevious?'Concluídas':'Há etapas pendentes'}</strong></div>
        <div><span>Tempo ativo</span><strong>${fmt(currentProgress.activeSeconds||0)}</strong></div>
        <div><span>Tempo restante</span><strong>${currentProgress.teacherOverride?'Liberado pelo professor':fmt(remaining)}</strong></div>
        <div><span>Perfil</span><strong>${window.DS_ProfileManager?.isUnlocked?.()?'Protegido e criptografado':'Sessão temporária'}</strong></div>
      </div>
      ${!timeOk?`<div class="guided-time-warning"><strong>Você concluiu as atividades antes do tempo mínimo.</strong><p>Revise o conteúdo, abra outra explicação ou realize o aprofundamento. A conclusão antecipada também pode ser autorizada pelo professor.</p></div>`:''}
      <div class="guided-delivery-mode-tabs" role="tablist" aria-label="Modo de orientação da entrega">
        <button type="button" class="guided-delivery-mode ${delivery.mode==='quick'?'active':''}" data-mode="quick">Entrega rápida</button>
        <button type="button" class="guided-delivery-mode ${delivery.mode==='guided'?'active':''}" data-mode="guided">Me guie</button>
        <button type="button" class="guided-delivery-mode ${delivery.mode==='experienced'?'active':''}" data-mode="experienced">Já sei entregar</button>
      </div>
      <div class="guided-delivery-help">${deliveryHelpHtml(delivery.mode)}</div>
      <section class="guided-export-panel"><h2>1. Exporte sua evidência</h2><p>O arquivo reúne respostas, laboratório, tempo, recursos utilizados e registro de conclusão.</p><p><strong>Nome esperado:</strong> ${escapeHtml(fileName('html'))}</p><div class="guided-export-actions"><button id="guidedExportHtml" class="btn primary" type="button">Exportar evidência .HTML</button><button id="guidedExportJson" class="btn secondary" type="button">Baixar dados .JSON</button></div></section>
      <section class="guided-classroom-panel"><h2>2. Envie no Google Classroom</h2><p>Depois de exportar, abra a atividade, anexe o arquivo e selecione <strong>Entregar</strong>.</p><div class="guided-delivery-status"><span class="${delivery.exported?'done':''}">${delivery.exported?'Arquivo exportado':'Arquivo ainda não exportado'}</span><span class="${delivery.classroomOpened?'done':''}">${delivery.classroomOpened?'Classroom aberto':'Classroom ainda não aberto'}</span><span class="${delivery.declaredDelivered?'done':''}">${delivery.declaredDelivered?'Aluno declarou a entrega':'Entrega não confirmada'}</span></div><button id="guidedOpenClassroom" class="btn secondary" type="button">Abrir atividade no Google Classroom</button></section>
      ${window.DS_CodeCenter?.has?.(currentLesson)?`<section class="guided-code-next"><h2>Código da aula</h2><p>Visualize, copie ou baixe os arquivos da aula. Quando houver dependências, a central mostra os comandos de instalação, verificação, erros comuns e limitações.</p><div><button id="guidedOpenCodeCenter" class="btn secondary" type="button">Abrir código e instruções</button><button id="guidedDownloadCodeProject" class="btn ghost" type="button">Baixar projeto .ZIP</button></div></section>`:''}
      ${['intro-programacao','front-end','front-end-sub','programacao-ds','mobile-1'].includes(profile?.disciplineKey)?`<section class="guided-code-next"><h2>Publicação e continuidade</h2><p>Organize os arquivos, leia o README e publique somente depois de testar. O VS Code Web não abre automaticamente arquivos baixados: extraia o ZIP e escolha a pasta.</p><div><button id="guidedOpenGithub" class="btn ghost" type="button">Abrir GitHub</button><button id="guidedOpenVscode" class="btn ghost" type="button">Abrir VS Code Web</button></div></section>`:''}
      <p class="guided-delivery-disclaimer">Abrir o Classroom não significa que a atividade foi entregue. A confirmação real depende do próprio Classroom ou de integração oficial autenticada.</p>
      <button id="guidedFinalizeLesson" class="btn primary full" type="button" ${ready?'':'disabled'}>Concluir aula e voltar para a lista</button>`;
    bindDeliveryHelp();
    $('#guidedExportHtml').addEventListener('click',()=>exportEvidence('html'));
    $('#guidedExportJson').addEventListener('click',()=>exportEvidence('json'));
    $('#guidedOpenClassroom').addEventListener('click',openClassroom);
    $('#guidedOpenCodeCenter')?.addEventListener('click',openCodeCenter);
    $('#guidedDownloadCodeProject')?.addEventListener('click',()=>{window.DS_CodeCenter?.downloadProject?.(currentLesson);logEvent('codigo_projeto_baixado_finalizacao',currentLesson.id);});
    $('#guidedOpenGithub')?.addEventListener('click',()=>window.open('https://github.com/','_blank','noopener,noreferrer'));
    $('#guidedOpenVscode')?.addEventListener('click',()=>window.open('https://vscode.dev/','_blank','noopener,noreferrer'));
    $('#guidedFinalizeLesson').addEventListener('click',()=>{
      currentProgress.completed=true;currentProgress.completedAt=new Date().toISOString();currentProgress.endedBy='concluida';saveProgress();logEvent('aula_concluida',currentLesson.title,{deliveryDeclared:!!delivery.declaredDelivered});
      alert('Aula concluída. A plataforma registrou sua declaração, mas confirme o status diretamente no Google Classroom.');returnToCatalog();
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
    currentProgress.exports=(Number(currentProgress.exports)||0)+1;currentProgress.delivery=currentProgress.delivery||{};currentProgress.delivery.exported=true;currentProgress.delivery.exportedAt=new Date().toISOString();saveProgress();logEvent('evidencia_exportada',format,{count:currentProgress.exports});window.DS_Schedule?.setActivityContext?.({resultReady:true,exportPending:false});
    const report=buildReportData();
    if(format==='json') return downloadBlob(JSON.stringify(report,null,2),fileName('json'),'application/json');
    const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Evidência ${escapeHtml(currentLesson.title)}</title><style>body{font-family:Arial,sans-serif;max-width:920px;margin:30px auto;padding:0 24px;color:#152033}h1{color:#0b5d4f}.box{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:14px 0}dt{font-weight:bold}pre{white-space:pre-wrap;background:#f1f5f9;padding:14px;border-radius:8px}</style><body><h1>Desafio DS — Modo Guiado</h1><div class="box"><p><b>Aluno:</b> ${escapeHtml(report.student.name)}</p><p><b>Turma:</b> ${escapeHtml(report.student.class)}</p><p><b>Disciplina:</b> ${escapeHtml(report.lesson.discipline)}</p><p><b>Aula:</b> ${report.lesson.number} — ${escapeHtml(report.lesson.title)}</p><p><b>Tempo ativo:</b> ${escapeHtml(report.session.activeTime)}</p><p><b>Sessão:</b> ${escapeHtml(report.session.id)}</p></div><div class="box"><h2>Objetivo</h2><p>${escapeHtml(currentLesson.objective)}</p><h2>Desafio</h2><pre>${escapeHtml(currentProgress.answers?.challenge||'Não registrado')}</pre><h2>Reflexão</h2><pre>${escapeHtml(currentProgress.answers?.reflection||'Não registrada')}</pre></div><div class="box"><h2>Ferramentas e progresso</h2><p>Etapas concluídas: ${(currentProgress.completedSteps||[]).length}/${STEP_NAMES.length}</p><p>Explicações extras: ${(currentProgress.extraUsed||[]).map(extraTitle).join(', ')||'Nenhuma'}</p><p>Recursos de apoio ativos: ${(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x).join(', ')||'Padrão'}</p><p>Liberação antecipada: ${currentProgress.teacherOverride?'Sim — '+escapeHtml(currentProgress.teacherOverride.reason):'Não'}</p></div><div class="box"><h2>Termo e compromisso pedagógico</h2><p>Status: ${escapeHtml(report.terms.status)}</p><p>Versão do termo: ${escapeHtml(report.terms.termsVersion||'não validada')}</p><p>Data do aceite: ${escapeHtml(report.terms.acceptedAt||'não registrada')}</p><p>Registro: ${escapeHtml(report.terms.acceptanceId||'não disponível')}</p><p>Integridade: ${escapeHtml(report.terms.integrity||'pendente')}</p><p>Finalidade: atividade educacional; XP e gamificação não determinam nota.</p></div><p>Gerado em ${new Date().toLocaleString('pt-BR')}.</p></body></html>`;
    downloadBlob(html,fileName('html'),'text/html;charset=utf-8');
  }
  function buildReportData(){
    return {
      app:'Desafio DS — Modo Guiado',version:DATA.version,generatedAt:new Date().toISOString(),
      student:{name:profile.name,class:courseData().label,supportResources:(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x)},
      lesson:{id:currentLesson.id,number:currentLesson.number,title:currentLesson.title,module:currentLesson.module,discipline:disciplineData().label,objective:currentLesson.objective},
      session:{id:currentProgress.sessionId,startedAt:currentProgress.startedAt,activeSeconds:currentProgress.activeSeconds,activeTime:fmt(currentProgress.activeSeconds),idleEpisodes:currentProgress.idleEpisodes,teacherOverride:currentProgress.teacherOverride},
      progress:{completedSteps:currentProgress.completedSteps,extraUsed:currentProgress.extraUsed,exports:currentProgress.exports},
      terms:window.DS_Terms?.evidence?.()||{status:'não validado'},permissions:window.DS_ProfileManager?.getPath?.('permissions.history',[])?.slice(-20)||[],assessment:{method:'proficiência, evidências e critérios do professor',xpInfluencesGrade:false,cosmeticsInfluenceGrade:false},
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
    const url=currentLesson.classroomUrl || DATA.defaultClassroom;externalAuthorizedUntil=Date.now()+30*60*1000;currentProgress.delivery=currentProgress.delivery||{};currentProgress.delivery.classroomOpened=true;currentProgress.delivery.classroomOpenedAt=new Date().toISOString();saveProgress();logEvent('classroom_aberto',url,{authorized:true,deliveryConfirmed:false});window.DS_Schedule?.setActivityContext?.({classroomOpened:true});window.open(url,'_blank','noopener,noreferrer');showFeedback('Google Classroom aberto. Anexe o arquivo e confirme a entrega diretamente na atividade.','ok');
  }

  function openTeacherModal(action){
    teacherAction=action;el.teacherName.value='';if(el.teacherPassword)el.teacherPassword.value='';el.teacherNote.value='';el.teacherStatus.textContent='';
    el.teacherReason.previousElementSibling?.classList.toggle('hidden',action==='panel');
    el.teacherReason.classList.toggle('hidden',action==='panel');
    el.teacherNote.previousElementSibling?.classList.toggle('hidden',action==='panel');
    el.teacherNote.classList.toggle('hidden',action==='panel');
    el.teacherModal.classList.remove('hidden');setTimeout(()=>el.teacherName.focus(),50);
  }
  function closeTeacherModal(){teacherAction=null;el.teacherModal?.classList.add('hidden');}
  async function confirmTeacherAction(){
    const name=sanitizeName(el.teacherName.value);if(!name)return setTeacherStatus('Informe a identificação do professor.','warn');
    if(teacherAction==='release'){
      const note=el.teacherNote.value.trim();if(!note)return setTeacherStatus('Registre uma observação para a liberação.','warn');
      closeTeacherModal();
      try{await window.DS_EduAuth.authorize({actionId:'early-completion',classId:profile.courseKey,subjectId:`${profile.courseKey}:${profile.disciplineKey}`,lessonId:currentLesson.id,activityId:'aula-guiada',resourceId:currentLesson.id,teacher:name,reason:note});currentProgress.teacherOverride={teacher:name,reason:el.teacherReason.value,note,at:new Date().toISOString(),activeSeconds:currentProgress.activeSeconds,authorization:'EDUAUTH_SESSION'};logEvent('conclusao_antecipada',el.teacherReason.value,{teacher:name,note,activeSeconds:currentProgress.activeSeconds,authorization:'EDUAUTH'});saveProgress();showFeedback('Conclusão antecipada autorizada para esta aula e sessão.','ok');if(currentStep===9)renderFinish();}catch(error){showFeedback(error?.message||'Autorização não confirmada.','warn');}
    }else{
      closeTeacherModal();
      try{await window.DS_EduAuth.authorize({actionId:'teacher-audit',classId:profile.courseKey,subjectId:`${profile.courseKey}:${profile.disciplineKey}`,lessonId:currentLesson?.id||'painel-professor',activityId:'principal',resourceId:profile.disciplineKey,teacher:name});openTeacherPanel(name);}catch(error){showFeedback(error?.message||'Auditoria não autorizada.','warn');}
    }
  }

  function setTeacherStatus(text,type){el.teacherStatus.textContent=text;el.teacherStatus.className=`mode-status ${type}`;}
  function openTeacherPanel(teacher){
    const lessons=disciplineData()?.lessons||[];
    el.extraTitle.textContent=`Painel do professor — ${disciplineData().label}`;
    el.extraOptions.innerHTML=`<button id="teacherExportProgress" class="btn primary" type="button">Exportar progresso</button>`;
    el.extraContent.innerHTML=`<p>Acesso autorizado para <strong>${escapeHtml(teacher)}</strong>. As autorizações não ficam gravadas na plataforma. Utilize o Validador EduAuth Professor privado para gerar a permissão vinculada à ação atual.</p><div class="guided-teacher-code-list">${lessons.map(l=>{const p=getProgress(l);return `<div><span>Aula ${l.number}</span><strong>••••</strong><small>${escapeHtml(l.title)} • ${p.completed?'concluída':p.unlocked?'em andamento':'bloqueada'}</small></div>`;}).join('')}</div>`;
    $('#teacherExportProgress').addEventListener('click',()=>{
      const data=lessons.map(l=>({lesson:l.number,title:l.title,progress:getProgress(l)}));downloadBlob(JSON.stringify({teacher,student:profile.name,course:courseData().label,discipline:disciplineData().label,data},null,2),`PROGRESSO_${profile.courseKey}_${disciplineData().short}_${profile.name.replace(/\s+/g,'_')}.json`,'application/json');
    });
    el.extraModal.classList.remove('hidden');
  }

  install();
})();
