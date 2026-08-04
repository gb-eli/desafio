(function(){
  'use strict';

  const DATA = window.DS_GUIDED_DATA;
  if(!DATA) return;

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const STORAGE_KEY = 'desafio_ds_guided_v19';
  const PROFILE_KEY = 'desafio_ds_guided_profile_v19';
  const SUPPORT_KEY = 'desafio_ds_guided_support_v19';
  const STEP_NAMES = ['Objetivo','O que você já sabe','Explicação','Ajuda opcional','Exemplo','Prática guiada','Plataforma e comprovante','Atividade principal','Revisão','Comprovante final'];
  const SUPPORT_LABELS = {
    focus:'uma etapa por vez', reading:'leitura facilitada', vision:'fonte e contraste',
    pace:'mais dicas e passo a passo', advanced:'aprofundamento'
  };
  const THEME_BY_DISCIPLINE = {
    'intro-programacao':'theme-python', 'analise-metodo':'theme-analysis', 'front-end':'theme-front',
    'front-end-sub':'theme-front', inovacao:'theme-innovation', 'programacao-ds':'theme-python', 'mobile-1':'theme-back'
  };
  const CLASS_THEME = {'1DS':'class-ds1','2DS':'class-ds2','3DS':'class-ds3','2DS Noite':'class-night'};
  const ECOSYSTEM_ROLES = {
    'desafio-ds':'Consolidar progresso, registrar comprovantes e gerar o relatório final.',
    'lab-virtual-ds':'Explorar hardware, terminal, redes, sistemas, programação e simuladores técnicos.',
    'lab-3d-vr':'Analisar experiências 3D/360, interação espacial, desempenho, acessibilidade e qualidade gráfica.',
    'ctf-cyber':'Praticar segurança em ambiente educacional autorizado, com criptografia, análise e defesa.',
    'fliperama-ds':'Aplicar lógica, física, animação, colisões, controles, UX e desempenho em jogos.',
    'github':'Publicar código, documentar projetos, manter versões e informar o link da entrega quando solicitado.'
  };


  const el = {
    startScreen: $('#startScreen'), challengeForm: $('#startForm'), guidedForm: $('#guidedStartForm'),
    challengeTab: $('#experienceChallengeBtn'), guidedTab: $('#experienceGuidedBtn'),
    name: $('#guidedPlayerName'), course: $('#guidedPlayerClass'), discipline: $('#guidedDiscipline'),
    supportEnabled: $('#guidedSupportEnabled'), supportOptions: $('#guidedSupportOptions'), supportTeacher: $('#guidedSupportTeacher'), supportNote: $('#guidedSupportNote'),
    catalog: $('#guidedCatalogScreen'), catalogIdentity: $('#guidedCatalogIdentity'), catalogTitle: $('#guidedCatalogTitle'), catalogDescription: $('#guidedCatalogDescription'),
    overallProgress: $('#guidedOverallProgress'), overallBar: $('#guidedOverallProgressBar'), lessonList: $('#guidedLessonList'), resumeBanner: $('#guidedResumeBanner'),
    sessionCompleted: $('#guidedSessionCompleted'), sessionActiveTotal: $('#guidedSessionActiveTotal'), sessionEvidence: $('#guidedSessionEvidence'), sessionExports: $('#guidedSessionExports'), scheduleSummary: $('#guidedScheduleSummary'), scheduleDetail: $('#guidedScheduleDetail'), ecosystemOverview: $('#guidedEcosystemOverview'),
    sessionPdf: $('#guidedSessionPdfBtn'), sessionHtml: $('#guidedSessionHtmlBtn'), sessionJson: $('#guidedSessionJsonBtn'), howItWorks: $('#guidedHowItWorksBtn'), quickSessionPdf: $('#guidedQuickSessionPdfBtn'),
    teacherPanelBtn: $('#guidedTeacherPanelBtn'), changeProfile: $('#guidedChangeProfileBtn'), lockProfile: $('#guidedLockProfileBtn'),
    lessonScreen: $('#guidedLessonScreen'), lessonTitle: $('#guidedLessonTitle'), lessonMeta: $('#guidedLessonMeta'), activeTime: $('#guidedActiveTime'), stepIndicator: $('#guidedStepIndicator'),
    lessonBar: $('#guidedLessonProgressBar'), stepContent: $('#guidedStepContent'), stepFeedback: $('#guidedStepFeedback'), prev: $('#guidedPrevStepBtn'), next: $('#guidedNextStepBtn'),
    extraBtn: $('#guidedExtraBtn'), stepList: $('#guidedStepList'), sessionStatus: $('#guidedSessionStatus'), idleCount: $('#guidedIdleCount'),
    toolShortcuts: $('#guidedToolShortcuts'), backCatalog: $('#guidedBackToCatalogBtn'), toChallenge: $('#guidedToChallengeBtn'), lessonHub: $('#guidedLessonHubBtn'), watermark: $('#guidedWatermark'), supportMenu: $('#guidedSupportMenuBtn'),
    extraModal: $('#guidedExtraModal'), extraTitle: $('#guidedExtraTitle'), extraOptions: $('#guidedExtraOptions'), extraContent: $('#guidedExtraContent'), extraClose: $('#guidedExtraCloseBtn'),
    teacherModal: $('#guidedTeacherModal'), teacherName: $('#guidedTeacherName'), teacherPassword: $('#guidedTeacherPassword'), teacherReason: $('#guidedTeacherReason'), teacherNote: $('#guidedTeacherNote'), teacherStatus: $('#guidedTeacherStatus'), teacherCancel: $('#guidedTeacherCancelBtn'), teacherConfirm: $('#guidedTeacherConfirmBtn'),
    supportDrawer: $('#guidedSupportDrawer'), supportDrawerClose: $('#guidedSupportDrawerClose'), fontLarge: $('#guidedFontLarge'), focusMode: $('#guidedFocusMode'), reducedMotion: $('#guidedReducedMotion'), detailedDefault: $('#guidedDetailedDefault'),
    idleOverlay: $('#guidedIdleOverlay'), idleTitle: $('#guidedIdleTitle'), idleMessage: $('#guidedIdleMessage'), idleContinue: $('#guidedIdleContinueBtn')
  };

  let profile = null;
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
  function displayNumber(lesson){ return Number(lesson?.sequence || lesson?.number || 0); }
  function unitForLesson(lesson){ return (disciplineData()?.units||[]).find(unit=>unit.id===lesson?.unitId) || null; }
  function isActiveLesson(lesson){ return lesson && lesson.status!=='ARCHIVED'; }
  function orderedLessons(){ return [...(disciplineData()?.lessons||[])].filter(isActiveLesson).sort((a,b)=>displayNumber(a)-displayNumber(b)); }
  function evidenceOk(lesson=currentLesson,progress=currentProgress){
    if(!lesson?.requiresExternalEvidence) return true;
    return Boolean(window.DS_Ecosystem?.requiredSatisfied?.(lesson,progress,profile));
  }
  function evidenceIdentity(item){
    const sourceTransaction=String(item?.source?.transactionId||item?.provenance?.originId||'').trim().toLowerCase();
    const evidenceId=String(item?.evidenceId||item?.id||'').trim().toLowerCase();
    const fileHash=String(item?.source?.fileHash||'').trim().toLowerCase();
    return {sourceTransaction,evidenceId,fileHash};
  }
  function findGlobalEvidenceDuplicate(candidate,currentLessonId=''){
    if(!profile)return '';
    const target=evidenceIdentity(candidate),all=getAllProgress(),prefix=`${profile.name}|${profile.courseKey}|`.toLowerCase();
    for(const [key,progress] of Object.entries(all||{})){
      if(!String(key).toLowerCase().startsWith(prefix))continue;
      for(const existing of (progress?.externalEvidence||[])){
        const known=evidenceIdentity(existing);
        if(target.evidenceId&&known.evidenceId&&target.evidenceId===known.evidenceId)return `Esta evidência já foi registrada${progress.lessonId===currentLessonId?' nesta aula':' em outra aula do perfil'}.`;
        if(target.sourceTransaction&&known.sourceTransaction&&target.sourceTransaction===known.sourceTransaction)return 'Este resultado possui o mesmo identificador de exportação de uma evidência já registrada.';
        if(target.fileHash&&known.fileHash&&target.fileHash===known.fileHash)return `Este arquivo já foi importado${progress.lessonId===currentLessonId?' nesta aula':' em outra aula do perfil'}.`;
      }
    }
    return '';
  }
  function uniqueEvidenceKey(item){
    const id=evidenceIdentity(item);return id.sourceTransaction||id.evidenceId||id.fileHash||`${item?.platform?.id||''}|${item?.activity?.lessonId||item?.activity?.id||''}|${item?.generatedAt||item?.importedAt||''}`;
  }
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
    el.changeProfile?.addEventListener('click', ()=>{ backToGuidedEntry(); setTimeout(()=>document.querySelector('#profileOpenBtn')?.click(),80); });
    el.lockProfile?.addEventListener('click', async()=>{ try{ await window.DS_ProfileManager?.lock?.('manual'); storageWrite(PROFILE_KEY,null); profile=null; backToGuidedEntry(); showFeedback('Perfil bloqueado. Escolha um usuário para continuar.','ok'); setTimeout(()=>document.querySelector('#profileOpenBtn')?.click(),80); }catch(error){ showFeedback(error?.message||'Não foi possível bloquear o perfil.','warn'); } });
    el.teacherPanelBtn?.addEventListener('click', openTeacherModal);
    el.sessionPdf?.addEventListener('click', ()=>exportDisciplineSession('pdf'));
    el.sessionHtml?.addEventListener('click', ()=>exportDisciplineSession('html'));
    el.sessionJson?.addEventListener('click', ()=>exportDisciplineSession('json'));
    el.howItWorks?.addEventListener('click', openAutonomyGuide);
    el.quickSessionPdf?.addEventListener('click', ()=>exportDisciplineSession('pdf'));
    el.backCatalog?.addEventListener('click', returnToCatalog);
    el.toChallenge?.addEventListener('click', goToChallengeHub);
    el.lessonHub?.addEventListener('click', goToChallengeHub);
    el.prev?.addEventListener('click', previousStep);
    el.next?.addEventListener('click', nextStep);
    el.extraBtn?.addEventListener('click', openExtraModal);
    el.extraClose?.addEventListener('click', closeExtraModal);
    el.supportMenu?.addEventListener('click', ()=>el.supportDrawer?.classList.remove('hidden'));
    el.supportDrawerClose?.addEventListener('click', ()=>el.supportDrawer?.classList.add('hidden'));
    [el.fontLarge,el.focusMode,el.reducedMotion,el.detailedDefault].forEach(node=>node?.addEventListener('change',saveSupportPreferences));
    el.teacherCancel?.addEventListener('click', closeTeacherModal);
    el.teacherConfirm?.addEventListener('click', confirmTeacherAction);
    el.idleContinue?.addEventListener('click', resumeFromIdle);
    ['pointerdown','keydown','touchstart','scroll'].forEach(type=>document.addEventListener(type,registerActivity,{passive:true}));
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('beforeunload', ()=>{ closeLessonRun('página fechada'); saveProgress(); });
    window.addEventListener('pagehide', ()=>{ closeLessonRun('página ocultada'); saveProgress(); window.DS_ProfileManager?.saveNow?.(); });
    document.addEventListener('ds:profile-locked', ()=>{ if(currentLesson){closeLessonRun('perfil bloqueado');saveProgress();stopTicker();} profile=null;currentLesson=null;currentProgress=null;[el.catalog,el.lessonScreen].forEach(screen=>screen?.classList.remove('active'));el.startScreen?.classList.add('active');document.body.classList.remove('guided-active','game-active');switchExperience('guided'); });
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
    updateGuidedClassTheme(); applySupportPreferences(); migrateCurriculumProgress(); showCatalog();
  }
  function mergeProgressForCurriculum(target, source, sourceLessonId){
    const merged={...target};
    merged.unlocked=Boolean(target.unlocked||source.unlocked||source.completed);
    merged.completed=Boolean(target.completed||source.completed);
    merged.activeSeconds=Math.max(Number(target.activeSeconds)||0,Number(source.activeSeconds)||0);
    merged.completedSteps=Array.from(new Set([...(target.completedSteps||[]),...(source.completedSteps||[])])).sort((a,b)=>a-b);
    merged.events=[...(target.events||[]),...(source.events||[]),{at:new Date().toISOString(),type:'migracao_curricular_v30',detail:`Progresso associado de ${sourceLessonId}`,sourceLessonId}].slice(-500);
    merged.answers={...(source.answers||{}),...(target.answers||{})};
    merged.labData={...(source.labData||{}),...(target.labData||{})};
    merged.externalEvidence=[...(source.externalEvidence||[]),...(target.externalEvidence||[])];
    merged.curriculumMigration={fromLessonId:sourceLessonId,toLessonId:target.lessonId||'',at:new Date().toISOString(),mode:'non-destructive'};
    return merged;
  }
  function migrateCurriculumProgress(){
    if(!profile||!DATA.curriculumMigration?.archivedLessons)return;
    const all=getAllProgress(),prefix=`${profile.name}|${profile.courseKey}|`.toLowerCase();let changed=false;
    Object.entries(DATA.curriculumMigration.archivedLessons).forEach(([sourceId,targetId])=>{
      const sourceKey=`${profile.name}|${profile.courseKey}|${sourceId}`.toLowerCase(),targetKey=`${profile.name}|${profile.courseKey}|${targetId}`.toLowerCase();
      const source=all[sourceKey];if(!source)return;
      if(source.curriculumMigratedTo===targetId)return;
      const target=all[targetKey]||getProgress(lessonById(targetId));
      all[targetKey]=mergeProgressForCurriculum(target,source,sourceId);
      source.curriculumMigratedTo=targetId;source.curriculumMigratedAt=new Date().toISOString();source.archivedLesson=true;all[sourceKey]=source;changed=true;
    });
    if(changed)saveAllProgress(all);
  }
  function backToGuidedEntry(){
    closeLessonRun('troca de usuário ou disciplina'); stopTicker(); currentLesson=null; currentProgress=null;
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
    const units=discipline.units?.length||1;
    const activeCount=orderedLessons().length, archivedCount=(discipline.lessons||[]).filter(item=>item.status==='ARCHIVED').length;
    el.catalogDescription.textContent=`${activeCount} aulas ativas em ${units} unidades progressivas. O progresso anterior foi preservado${archivedCount?` e ${archivedCount} conteúdo(s) consolidado(s) permanecem no histórico`:''}; ferramentas externas aparecem somente quando fazem parte do roteiro.`;
    renderCatalog();
  }
  function renderCatalog(){
    const discipline=disciplineData();
    const lessons=orderedLessons();
    const units=discipline?.units?.length?discipline.units:[{id:'all',title:'Sequência de aulas',description:'Conteúdos organizados em progressão pedagógica.',lessonIds:lessons.map(x=>x.id)}];
    let completed=0, last=null;
    el.lessonList.innerHTML='';
    lessons.forEach(lesson=>{const progress=getProgress(lesson);if(progress.completed)completed++;if(progress.unlocked&&!progress.completed)last={lesson,progress};});
    units.forEach((unit,unitIndex)=>{
      const unitLessons=(unit.lessonIds||[]).map(lessonById).filter(isActiveLesson).sort((a,b)=>displayNumber(a)-displayNumber(b));
      if(!unitLessons.length)return;
      const unitCompleted=unitLessons.filter(lesson=>getProgress(lesson).completed).length;
      const unitStepPct=Math.round(unitLessons.reduce((sum,lesson)=>{const p=getProgress(lesson);return sum+(p.completed?100:Math.round((new Set(p.completedSteps||[]).size/STEP_NAMES.length)*100));},0)/unitLessons.length);
      const section=document.createElement('section');section.className='guided-unit-group';
      section.innerHTML=`<header class="guided-unit-header"><div><span>UNIDADE ${unitIndex+1}</span><h2>${escapeHtml(unit.title||`Unidade ${unitIndex+1}`)}</h2><p>${escapeHtml(unit.description||unit.objective||'Conteúdos organizados em sequência progressiva.')}</p></div><div class="guided-unit-progress"><strong>${unitCompleted}/${unitLessons.length}</strong><span>concluídas • ${unitStepPct}% das etapas</span><div><i style="width:${unitStepPct}%"></i></div></div></header><div class="guided-unit-lessons"></div>`;
      const target=$('.guided-unit-lessons',section);
      unitLessons.forEach(lesson=>{
        const progress=getProgress(lesson);
        const percentage=progress.completed?100:Math.round((new Set(progress.completedSteps||[]).size/STEP_NAMES.length)*100);
        const platforms=(lesson.platformTasks||[]).map(task=>window.DS_Ecosystem?.catalog?.[task.toolId]?.name||task.toolId);
        const article=document.createElement('article');article.className=`guided-lesson-card ${progress.completed?'completed':progress.unlocked?'unlocked':'locked'}`;
        article.innerHTML=`
          <div class="guided-lesson-number"><small>AULA</small>${String(displayNumber(lesson)).padStart(2,'0')}</div>
          <div class="guided-lesson-card-main">
            <div class="guided-lesson-tags"><span>${escapeHtml(lesson.module)}</span><span>${progress.completed?'Concluída':progress.unlocked?'Em andamento':'Autorização necessária'}</span>${lesson.legacyNumber&&lesson.legacyNumber!==displayNumber(lesson)?`<span class="legacy-tag">origem ${lesson.legacyNumber}</span>`:''}</div>
            <h3>${escapeHtml(lesson.title)}</h3>
            <p>${escapeHtml(lesson.focus)}</p>
            ${platforms.length?`<div class="guided-platform-chips">${platforms.map(name=>`<span>${escapeHtml(name)}</span>`).join('')}</div>`:''}
            <div class="guided-card-progress"><i style="width:${percentage}%"></i></div>
            <small>${percentage}% • mínimo ${Math.round((lesson.minimumActiveSeconds||DATA.minimumActiveSeconds)/60)} min • previsto ${lesson.expectedMinutes||25} min</small>
          </div>
          <div class="guided-lesson-card-actions"><button class="btn ${progress.unlocked?'primary':'secondary'} guided-open-lesson" type="button">${progress.completed?'Revisar':progress.unlocked?'Continuar':'Liberar aula'}</button></div>`;
        $('.guided-open-lesson',article).addEventListener('click',()=>requestLesson(lesson));target.appendChild(article);
      });
      el.lessonList.appendChild(section);
    });
    const completionPct=lessons.length?Math.round(completed/lessons.length*100):0;
    const stepPct=lessons.length?Math.round(lessons.reduce((sum,lesson)=>{const p=getProgress(lesson);return sum+(p.completed?100:Math.round((new Set(p.completedSteps||[]).size/STEP_NAMES.length)*100));},0)/lessons.length):0;
    el.overallProgress.textContent=`${stepPct}% • ${completed}/${lessons.length} aulas`;el.overallBar.style.width=`${stepPct}%`;el.overallProgress.title=`${completionPct}% das aulas concluídas; ${stepPct}% das etapas realizadas`;
    if(last){el.resumeBanner.classList.remove('hidden');el.resumeBanner.innerHTML=`<div><strong>Continuar aula ${displayNumber(last.lesson)}</strong><span>${escapeHtml(last.lesson.title)} • etapa ${(last.progress.currentStep||0)+1}</span></div><button class="btn primary" type="button">Retomar</button>`;$('button',el.resumeBanner).addEventListener('click',()=>openLesson(last.lesson));}else el.resumeBanner.classList.add('hidden');
    renderSessionDashboard();
  }
  function statusForProgress(progress){
    if(progress?.completed) return 'completed';
    if((progress?.activeSeconds||0)>0 || (progress?.currentStep||0)>0 || (progress?.completedSteps||[]).length) return 'progress';
    if(progress?.unlocked) return 'unlocked';
    return 'locked';
  }
  function toolNamesAccessed(progress){
    const names=new Set();
    (progress?.events||[]).forEach(event=>{
      const type=String(event.type||'');
      if(['plataforma_externa_aberta','orientacao_plataforma','comprovante_enviado'].includes(type) && event.detail){names.add(window.DS_Ecosystem?.catalog?.[event.detail]?.name||event.detail);}
      if(type.startsWith('codigo_') || type.includes('code_')) names.add('Central de Código');
      if(type==='explicacao_extra' || type==='camada_informacao_aberta') names.add('Explicações e apoio');
      if(type.includes('laboratorio') || type.includes('simulador') || type.includes('auditoria')) names.add('Laboratório interno');
    });
    return Array.from(names);
  }
  function reportFileBase(){
    const safe=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toUpperCase();
    return `SESSAO_${safe(profile?.courseKey)}_${safe(disciplineData()?.short||profile?.disciplineKey)}_${safe(profile?.name)}`;
  }
  function buildDisciplineSessionReport(){
    if(!profile || !disciplineData()) return null;
    saveProgress();
    const rows=orderedLessons().map(lesson=>{
      const progress=getProgress(lesson),evidence=window.DS_Ecosystem?.evidenceList?.(progress)||[];
      const pct=progress.completed?100:Math.round((new Set(progress.completedSteps||[]).size/STEP_NAMES.length)*100);
      return {
        id:lesson.id,number:displayNumber(lesson),title:lesson.title,module:lesson.module,unit:unitForLesson(lesson)?.title||lesson.unitTitle||'',status:statusForProgress(progress),progressPercent:pct,
        activeSeconds:Number(progress.activeSeconds)||0,currentStep:Number(progress.currentStep)||0,currentStepLabel:STEP_NAMES[Math.max(0,Math.min(Number(progress.currentStep)||0,STEP_NAMES.length-1))],
        startedAt:progress.startedAt||null,lastAccess:progress.lastAccess||null,completedAt:progress.completedAt||null,completedSteps:progress.completedSteps||[],extrasUsed:(progress.extraUsed||[]).map(extraTitle),
        toolsAccessed:toolNamesAccessed(progress),exports:Number(progress.exports)||0,teacherOverride:progress.teacherOverride||null,sessionRuns:progress.sessionRuns||[],
        challengeAnswer:String(progress.answers?.challenge||'').slice(0,4000),reflectionAnswer:String(progress.answers?.reflection||'').slice(0,4000),
        answers:Object.entries(progress.answers||{}).map(([key,value])=>({key,value:typeof value==='string'?value.slice(0,3000):JSON.stringify(value).slice(0,3000)})),
        labRecords:Object.entries(progress.labData||{}).map(([key,value])=>({key,value:typeof value==='string'?value.slice(0,3000):JSON.stringify(value).slice(0,3000)})),
        externalEvidence:evidence.map(item=>{const match=window.DS_Ecosystem?.bestTaskMatch?.(lesson,profile,item);const confidence=item.confidence?.status||match?.trust?.status||'PARTIAL';return {id:item.id||item.evidenceId||'',sourceTransactionId:item.source?.transactionId||'',platform:item.platform?.name||item.platform?.id||'',platformId:item.platform?.id||'',platformVersion:item.platform?.version||'',activity:item.activity?.title||'',activityId:item.activity?.id||'',lessonId:item.activity?.lessonId||'',taskId:item.activity?.taskId||'',summary:item.result?.summary||'',url:item.source?.url||'',importedAt:item.importedAt||item.generatedAt||'',confidence,confidenceLabel:item.confidence?.label||match?.trust?.label||'',teacherReview:item.review||null};}),
        events:(progress.events||[]).map(event=>({...event,lessonId:lesson.id,lessonNumber:displayNumber(lesson),lessonTitle:lesson.title,sessionId:progress.sessionId||''}))
      };
    });
    const allEvents=rows.flatMap(item=>item.events).sort((a,b)=>new Date(a.at||0)-new Date(b.at||0));
    const toolMap=new Map();
    rows.forEach(row=>{
      const lesson=lessonById(row.id),tasks=lesson?.platformTasks||[];
      tasks.forEach(task=>{
        const tool=window.DS_Ecosystem?.catalog?.[task.toolId]||{id:task.toolId,name:task.toolId};
        const current=toolMap.get(task.toolId)||{id:task.toolId,name:tool.name,role:ECOSYSTEM_ROLES[task.toolId]||tool.description||'Ferramenta de apoio contextual.',lessonIds:new Set(),evidenceCount:0};
        current.lessonIds.add(row.id);current.evidenceCount+=row.externalEvidence.filter(ev=>(ev.platformId===task.toolId || (ev.platform||'').toLowerCase()===(tool.name||'').toLowerCase())&&['RECOGNIZED','TEACHER_VALIDATED','MANUAL'].includes(ev.confidence)).length;toolMap.set(task.toolId,current);
      });
    });
    const completed=rows.filter(row=>row.status==='completed').length;
    const activeSeconds=rows.reduce((sum,row)=>sum+row.activeSeconds,0);
    const evidenceMap=new Map();rows.flatMap(row=>row.externalEvidence).forEach(item=>{const key=item.sourceTransactionId||item.id||`${item.platformId}|${item.lessonId}|${item.importedAt}`;if(!evidenceMap.has(key))evidenceMap.set(key,item);});
    const uniqueEvidence=Array.from(evidenceMap.values()),externalEvidenceCount=uniqueEvidence.length;
    const validEvidenceCount=uniqueEvidence.filter(item=>['RECOGNIZED','TEACHER_VALIDATED','MANUAL'].includes(item.confidence)).length;
    const pendingEvidenceCount=uniqueEvidence.filter(item=>['PARTIAL','REVIEW_REQUIRED'].includes(item.confidence)).length;
    const incompatibleEvidenceCount=uniqueEvidence.filter(item=>item.confidence==='INCOMPATIBLE').length;
    const exportCount=rows.reduce((sum,row)=>sum+row.exports,0);
    const stepProgressPercent=rows.length?Math.round(rows.reduce((sum,row)=>sum+row.progressPercent,0)/rows.length):0;
    const completionPercent=rows.length?Math.round(completed/rows.length*100):0;
    const terms=window.DS_Terms?.evidence?.()||{status:'não validado'};
    const schedule=window.DS_Schedule?.snapshot?.()||window.DS_Schedule?.calculate?.()||null;
    return {
      schema:'desafio-ds-guided-session-report',schemaVersion:1,platformVersion:DATA.version,generatedAt:new Date().toISOString(),fileBase:reportFileBase(),
      student:{name:profile.name,profileMode:window.DS_ProfileManager?.hasSession?.()?'Perfil local protegido':'Sessão temporária',supportResources:(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x),supportTeacher:profile.supportTeacher||''},
      course:{id:profile.courseKey,label:courseData().label},discipline:{id:profile.disciplineKey,label:disciplineData().label,short:disciplineData().short},schedule,
      summary:{totalLessons:rows.length,completedLessons:completed,inProgressLessons:rows.filter(row=>row.status==='progress').length,unlockedLessons:rows.filter(row=>row.status==='unlocked').length,progressPercent:stepProgressPercent,stepProgressPercent,completionPercent,activeSeconds,externalEvidenceCount,validEvidenceCount,pendingEvidenceCount,incompatibleEvidenceCount,exportCount,platformsUsedCount:Array.from(toolMap.values()).filter(item=>item.evidenceCount>0).length,eventCount:allEvents.length,teacherOverrides:rows.filter(row=>row.teacherOverride).length},
      ecosystem:Array.from(toolMap.values()).map(item=>({id:item.id,name:item.name,role:item.role,lessonCount:item.lessonIds.size,evidenceCount:item.evidenceCount})),lessons:rows,timeline:allEvents,terms,
      assessment:{method:'proficiência, participação efetiva, evidências, correção de erros e critérios do professor',xpInfluencesGrade:false,cosmeticsInfluenceGrade:false},
      limitations:['Dados armazenados localmente no navegador.','Abrir o Classroom não confirma entrega.','A impressão em PDF depende do recurso de impressão do navegador.']
    };
  }
  function exportDisciplineSession(format='pdf'){
    const report=buildDisciplineSessionReport();
    if(!report) return showFeedback('Entre em uma turma e disciplina antes de gerar o relatório.','warn');
    const renderer=window.DS_GuidedSessionReport;
    if(!renderer) return showFeedback('O gerador de relatório ainda não foi carregado. Atualize a página.','warn');
    if(currentProgress) logEvent('sessao_pdf_solicitada',format,{discipline:profile.disciplineKey});
    if(format==='json'){renderer.downloadJson(report);showFeedback('Dados completos da sessão baixados em JSON.','ok');return;}
    if(format==='html'){renderer.downloadHtml(report);showFeedback('Relatório HTML baixado. Ele pode ser aberto e impresso depois.','ok');return;}
    const result=renderer.print(report);showFeedback(result?.fallback?'O navegador bloqueou a janela. O relatório HTML foi baixado para impressão em PDF.':'Relatório aberto. Na tela de impressão, selecione “Salvar como PDF”.','ok');
  }
  function renderSessionDashboard(){
    if(!profile || !disciplineData()) return;
    const report=buildDisciplineSessionReport();if(!report)return;
    const formatter=window.DS_GuidedSessionReport?.formatDuration||fmt;
    if(el.sessionCompleted)el.sessionCompleted.textContent=`${report.summary.completedLessons}/${report.summary.totalLessons}`;
    if(el.sessionActiveTotal)el.sessionActiveTotal.textContent=formatter(report.summary.activeSeconds);
    if(el.sessionEvidence){el.sessionEvidence.textContent=`${report.summary.validEvidenceCount}/${report.summary.externalEvidenceCount}`;el.sessionEvidence.title=`${report.summary.validEvidenceCount} comprovantes completos, ${report.summary.pendingEvidenceCount} incompletos e ${report.summary.incompatibleEvidenceCount} de outra atividade`;}
    if(el.sessionExports)el.sessionExports.textContent=String(report.summary.exportCount);
    if(el.scheduleSummary)el.scheduleSummary.textContent=report.schedule?.label||'Fora do horário';
    if(el.scheduleDetail)el.scheduleDetail.textContent=report.schedule?.now?`${report.schedule.now.formattedDate} • ${report.schedule.now.formattedTime} • ${report.schedule.detail||'America/Sao_Paulo'}`:'Horário institucional • America/Sao_Paulo';
    if(el.ecosystemOverview){
      el.ecosystemOverview.innerHTML=report.ecosystem.length?report.ecosystem.map(tool=>`<article><div><strong>${escapeHtml(tool.name)}</strong><span>${tool.lessonCount} aula(s) relacionada(s)</span></div><p>${escapeHtml(tool.role)}</p></article>`).join(''):'<article><div><strong>Laboratórios internos</strong><span>Prática dentro da própria aula</span></div><p>Esta disciplina utiliza simuladores e exemplos internos sem exigir outra plataforma.</p></article>';
    }
  }
  function openAutonomyGuide(){
    el.extraTitle.textContent='Como realizar as aulas de forma autônoma';
    el.extraOptions.innerHTML=`<button class="btn primary" data-guide-tab="flow" type="button">Fluxo da aula</button><button class="btn secondary" data-guide-tab="help" type="button">Quando tiver dificuldade</button><button class="btn secondary" data-guide-tab="tools" type="button">Uso das plataformas</button><button class="btn secondary" data-guide-tab="delivery" type="button">Relatório e entrega</button>`;
    const panels={
      flow:`<div class="guided-guide-panel"><h3>Uma ação de cada vez</h3><ol><li>Leia o objetivo e o resultado esperado.</li><li>Registre o diagnóstico rápido.</li><li>Estude a explicação principal.</li><li>Abra somente a ajuda que precisar.</li><li>Observe a demonstração.</li><li>Realize a prática e o laboratório.</li><li>Conclua o desafio e a revisão.</li><li>Exporte o relatório e confira a entrega.</li></ol><p>O progresso é salvo depois das etapas, respostas, comprovantes e exportações.</p></div>`,
      help:`<div class="guided-guide-panel"><h3>Você não precisa ficar preso</h3><ul><li>Use <b>Explicação extra</b> para exemplos práticos, analogias, comparação e erros comuns.</li><li>Abra <b>Apoio</b> para fonte maior, modo foco ou menos animações.</li><li>Use a Central de Código para baixar exemplos e consultar comandos.</li><li>Registre uma hipótese mesmo quando ainda não souber a resposta completa.</li><li>Peça ajuda ao professor quando a plataforma ou o equipamento impedir a atividade.</li></ul></div>`,
      tools:`<div class="guided-guide-panel"><h3>Ferramentas com propósito</h3>${Object.entries(ECOSYSTEM_ROLES).map(([id,role])=>`<p><b>${escapeHtml(window.DS_Ecosystem?.catalog?.[id]?.name||id)}:</b> ${escapeHtml(role)}</p>`).join('')}<p>Uma plataforma externa só aparece quando faz parte da prática, do teste ou do comprovante solicitado na aula.</p></div>`,
      delivery:`<div class="guided-guide-panel"><h3>Registro completo da aprendizagem</h3><ul><li>O comprovante por aula registra respostas, tempo, explicações abertas, atividades, arquivos enviados, links e logs da sessão.</li><li>O relatório consolidado reúne toda a disciplina e também pode ser salvo como PDF.</li><li>O JSON preserva os dados técnicos completos para auditoria e migração.</li><li>Abrir o Classroom não confirma a entrega: o aluno ainda precisa anexar e selecionar Entregar.</li></ul></div>`
    };
    const show=key=>{el.extraContent.innerHTML=panels[key]||panels.flow;$$('[data-guide-tab]',el.extraOptions).forEach(button=>{const active=button.dataset.guideTab===key;button.classList.toggle('primary',active);button.classList.toggle('secondary',!active);});};
    $$('[data-guide-tab]',el.extraOptions).forEach(button=>button.addEventListener('click',()=>show(button.dataset.guideTab)));show('flow');el.extraModal.classList.remove('hidden');
  }

  async function requestLesson(lesson){
    const progress=getProgress(lesson);if(progress.unlocked||progress.completed)return openLesson(lesson);
    try{
      await window.DS_EduAuth.authorize({actionId:'lesson-start',classId:profile.courseKey,subjectId:`${profile.courseKey}:${profile.disciplineKey}`,lessonId:lesson.id,activityId:'aula-guiada',resourceId:lesson.id});
      progress.unlocked=true;progress.startedAt=progress.startedAt||new Date().toISOString();progress.lastAccess=new Date().toISOString();progress.events=progress.events||[];progress.events.push({at:new Date().toISOString(),type:'eduauth_lesson_start',detail:'CLASS_SHARED_PIN'});const all=getAllProgress();all[progressKey(lesson.id)]=progress;saveAllProgress(all);openLesson(lesson);
    }catch(error){showFeedback(error?.message||'A aula não foi liberada.','warn');}
  }

  function openLesson(lesson){
    currentLesson=lesson; currentProgress=getProgress(lesson); currentProgress.unlocked=true; currentProgress.startedAt=currentProgress.startedAt||new Date().toISOString();
    currentStep=Math.max(0,Math.min(Number(currentProgress.currentStep)||0,STEP_NAMES.length-1));saveProgress();startLessonRun();
    el.catalog?.classList.remove('active');el.lessonScreen?.classList.add('active');document.body.classList.add('guided-active','game-active');
    const unit=unitForLesson(lesson);
    el.lessonTitle.textContent=`Aula ${displayNumber(lesson)} — ${lesson.title}`;
    el.lessonMeta.textContent=`${disciplineData().label} • ${unit?.title||lesson.module} • ${lesson.expectedMinutes||25} min previstos`;
    el.watermark.textContent=`${profile.name} • ${courseData().label} • ${currentProgress.sessionId}`;
    currentProgress.idleEpisodes=Number(currentProgress.idleEpisodes)||0;lastActivityAt=Date.now();startTicker();logEvent('aula_aberta',lesson.title,{step:currentStep,sequence:displayNumber(lesson),unit:unit?.id||''});renderStep();
  }
  function returnToCatalog(reason='retorno ao catálogo'){
    closeLessonRun(reason); saveProgress(); stopTicker(); el.lessonScreen?.classList.remove('active'); document.body.classList.remove('game-active'); showCatalog();
  }
  function goToChallengeHub(){
    closeLessonRun('troca para Desafio DS'); saveProgress(); stopTicker(); currentLesson=null; currentProgress=null;
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
    returnToCatalog('inatividade');
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
    decorateStepContent();
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
    const items=[['Ajuda e explicações',()=>openSupportCoach('essential')]];
    if(window.DS_CodeCenter?.has?.(currentLesson)) items.push(['Código e execução',openCodeCenter]);
    if((currentLesson?.platformTasks||[]).length) items.push(['Ferramenta da aula',()=>openSupportCoach('tool')]);
    items.push(['O que significa?',()=>openSupportCoach('glossary')],['Aplicação real',()=>openExtraModal('real')]);
    items.forEach(([label,fn])=>{ const b=document.createElement('button');b.type='button';b.className='guided-tool-chip';b.textContent=label;b.addEventListener('click',fn);el.toolShortcuts.appendChild(b); });
  }
  function currentActionInstruction(){
    const actions=[
      'Leia o objetivo, confira o resultado esperado e confirme que está pronto.',
      'Registre o que já sabe. Não é prova e não vale nota.',
      'Estude o conceito central e relacione-o ao exemplo apresentado.',
      'Abra somente as explicações que ajudam você a compreender melhor.',
      'Observe a demonstração e identifique entrada, processo e resultado.',
      'Siga o roteiro, teste e registre o que mudou.',
      'Utilize o laboratório interno ou a plataforma indicada e registre o comprovante solicitado.',
      'Resolva o desafio, explique seu raciocínio e valide o resultado.',
      'Revise, localize erros e descreva o que aprendeu.',
      'Confira o tempo, os comprovantes e gere o PDF antes de sair.'
    ];
    return actions[currentStep]||'Siga a orientação da etapa atual.';
  }
  function lessonDifficulty(){
    const lessons=orderedLessons(),index=Math.max(0,lessons.findIndex(item=>item.id===currentLesson?.id)),ratio=lessons.length?index/lessons.length:0;
    if(/cyber|auditoria|projeto|integrad/i.test(`${currentLesson?.module||''} ${currentLesson?.title||''}`)) return 'Aplicação integrada';
    if(ratio<.34)return 'Fundamentos';if(ratio<.72)return 'Intermediário';return 'Avançado';
  }
  function decorateStepContent(){
    if(!el.stepContent || !currentLesson)return;
    const realExamples=(currentLesson.realExamples||[]).slice(0,5),careers=(currentLesson.careers||[]).slice(0,5),keywords=(currentLesson.keywords||[]).slice(0,10);
    const inspection=currentLesson.authorizedInspection;
    const context=document.createElement('section');context.className='guided-autonomy-context';
    context.innerHTML=`
      <div class="guided-now-card"><span>O QUE FAZER AGORA</span><strong>${escapeHtml(STEP_NAMES[currentStep])}</strong><p>${escapeHtml(currentActionInstruction())}</p></div>
      <div class="guided-context-status"><span>${escapeHtml(lessonDifficulty())}</span><span>${Math.round((currentLesson.minimumActiveSeconds||DATA.minimumActiveSeconds)/60)} min mínimos</span><span>${currentProgress.completedSteps?.length||0}/${STEP_NAMES.length} etapas</span></div>
      <nav class="guided-support-actions" aria-label="Apoios da aula">
        <button type="button" data-support-action="essential">Não entendi</button>
        <button type="button" data-support-action="glossary">O que significa?</button>
        <button type="button" data-support-action="steps">Ver passo a passo</button>
        <button type="button" data-support-action="tool">Ferramenta da aula</button>
        <button type="button" data-support-action="levels">Níveis de apoio</button>
      </nav>
      <div class="guided-context-layers">
        <details data-layer="vida-real"><summary>Aplicação na vida real</summary><p>${escapeHtml(currentLesson.realWorld||currentLesson.practice||'Este conteúdo será aplicado na prática da aula.')}</p>${realExamples.length?`<ul>${realExamples.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`:''}</details>
        <details data-layer="empresas-carreiras"><summary>Empresas, áreas e carreiras</summary>${careers.length?`<ul>${careers.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`:'<p>Observe onde essa competência aparece em projetos, equipes e serviços de tecnologia.</p>'}</details>
        <details data-layer="tecnologias"><summary>Tecnologias e conexões</summary><p>${escapeHtml(currentLesson.comparison||'Compare o conceito com outras ferramentas e tecnologias estudadas.')}</p>${keywords.length?`<div class="guided-context-keywords">${keywords.map(item=>`<span>${escapeHtml(item)}</span>`).join('')}</div>`:''}</details>
        <details data-layer="erros-ajuda"><summary>Erros comuns e ajuda</summary><p><b>Evite:</b> ${escapeHtml(currentLesson.error||currentLesson.extras?.errors||'Avançar sem testar o resultado.')}</p><p>Quando estiver confuso, use “Não entendi”, consulte os termos ou abra o passo a passo.</p><button data-context-help class="btn tiny secondary" type="button">Abrir ajuda essencial</button></details>
        ${inspection?`<details data-layer="inspecao-autorizada" class="guided-authorized-inspection"><summary>${escapeHtml(inspection.title)}</summary><p><b>Escopo:</b> ${escapeHtml(inspection.scope)}</p><ol>${(inspection.tasks||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><p><b>Registro:</b> ${escapeHtml(inspection.expected)}</p></details>`:''}
      </div>`;
    el.stepContent.prepend(context);
    $$('[data-support-action]',context).forEach(button=>button.addEventListener('click',()=>openSupportCoach(button.dataset.supportAction)));
    $$('details[data-layer]',context).forEach(details=>details.addEventListener('toggle',()=>{if(details.open)logEvent('camada_informacao_aberta',details.dataset.layer,{step:currentStep});}));
    $('[data-context-help]',context)?.addEventListener('click',()=>openSupportCoach('essential'));
  }
  function openSupportCoach(mode='essential'){
    if(!currentLesson)return;
    const support=currentLesson.support||{},levels=support.levels||{},tool=support.tool||{},glossary=support.glossary||[],steps=support.steps||[];
    el.extraOptions.innerHTML='';
    const titles={essential:'Não entendi — ajuda essencial',glossary:'O que significa?',steps:'Passo a passo',tool:'Ferramenta da aula',levels:'Escolha o nível de apoio'};
    el.extraTitle.textContent=titles[mode]||titles.essential;
    if(mode==='glossary'){
      el.extraContent.innerHTML=glossary.length?`<div class="guided-glossary">${glossary.map(item=>`<article><h3>${escapeHtml(item.term)}</h3><p>${escapeHtml(item.meaning)}</p><small>${escapeHtml(item.example||'')}</small></article>`).join('')}</div>`:'<p>Os termos principais aparecem destacados na explicação da aula.</p>';
    }else if(mode==='steps'){
      el.extraContent.innerHTML=`<div class="guided-support-panel"><p>Faça uma ação por vez. Confirme o resultado antes de avançar.</p><ol>${steps.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><button class="btn primary" type="button" data-support-done="steps">Entendi o roteiro</button></div>`;
    }else if(mode==='tool'){
      el.extraContent.innerHTML=`<div class="guided-support-panel"><h3>${escapeHtml(tool.name||'Atividade interna')}</h3><p><b>Para que será usada:</b> ${escapeHtml(tool.purpose||'Realizar a parte prática da aula.')}</p><ol>${(tool.whatToDo||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><p><b>Resultado esperado:</b> ${escapeHtml(tool.expected||currentLesson.expectedResult)}</p><details><summary>Se a ferramenta não abrir</summary><p>${escapeHtml(tool.fallback||'Registre o problema e continue pela alternativa interna.')}</p></details>${window.DS_CodeCenter?.has?.(currentLesson)?'<button class="btn secondary" type="button" data-open-code-support>Abrir código e comandos</button>':''}</div>`;
    }else if(mode==='levels'){
      const selected=currentProgress?.supportLevel||'application';
      el.extraContent.innerHTML=`<div class="guided-level-grid"><button type="button" data-support-level="essential" class="${selected==='essential'?'selected':''}"><span>NÍVEL 1</span><strong>Essencial</strong><p>${escapeHtml(levels.essential||'Exemplo e passo a passo.')}</p></button><button type="button" data-support-level="application" class="${selected==='application'?'selected':''}"><span>NÍVEL 2</span><strong>Aplicação</strong><p>${escapeHtml(levels.application||currentLesson.practice)}</p></button><button type="button" data-support-level="exploration" class="${selected==='exploration'?'selected':''}"><span>NÍVEL 3</span><strong>Exploração</strong><p>${escapeHtml(levels.exploration||currentLesson.challenge)}</p></button></div><p class="guided-support-note">O nível de apoio não altera nota. Ele muda apenas a quantidade de orientação.</p>`;
    }else{
      el.extraContent.innerHTML=`<div class="guided-support-panel"><h3>Vamos separar a atividade em partes</h3><p>${escapeHtml(support.misunderstood||currentLesson.mainExplanation)}</p><ol>${steps.slice(0,3).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><p><b>Primeira ação:</b> faça somente o primeiro item e observe o resultado.</p><div class="guided-support-next"><button type="button" class="btn primary" data-support-next="steps">Preciso do passo a passo</button><button type="button" class="btn secondary" data-support-next="glossary">Não entendi um termo</button><button type="button" class="btn ghost" data-support-next="levels">Quero outra forma</button></div></div>`;
    }
    el.extraModal.classList.remove('hidden');
    logEvent('apoio_aberto',mode,{step:currentStep});
    $$('[data-support-next]',el.extraContent).forEach(button=>button.addEventListener('click',()=>openSupportCoach(button.dataset.supportNext)));
    $$('[data-support-level]',el.extraContent).forEach(button=>button.addEventListener('click',()=>{currentProgress.supportLevel=button.dataset.supportLevel;saveProgress();logEvent('nivel_apoio_selecionado',button.dataset.supportLevel);openSupportCoach('levels');}));
    $('[data-open-code-support]',el.extraContent)?.addEventListener('click',()=>{closeExtraModal();openCodeCenter();});
    $('[data-support-done]',el.extraContent)?.addEventListener('click',()=>{logEvent('apoio_compreendido',mode);closeExtraModal();});
  }

  function startLessonRun(){
    if(!currentProgress)return;
    currentProgress.sessionRuns=Array.isArray(currentProgress.sessionRuns)?currentProgress.sessionRuns:[];
    currentProgress.sessionRuns.forEach(run=>{if(!run.endedAt){run.endedAt=currentProgress.lastAccess||new Date().toISOString();run.activeEndSeconds=Number(currentProgress.activeSeconds)||0;run.activeSeconds=Math.max(0,(run.activeEndSeconds||0)-(run.activeStartSeconds||0));run.endReason='sessão anterior interrompida';}});
    const id=createSessionId().replace('GUIA-','RUN-');
    currentProgress.sessionRuns.push({id,startedAt:new Date().toISOString(),endedAt:null,activeStartSeconds:Number(currentProgress.activeSeconds)||0,activeEndSeconds:null,activeSeconds:0,startStep:currentStep,endStep:null,endReason:null});
    if(currentProgress.sessionRuns.length>60)currentProgress.sessionRuns=currentProgress.sessionRuns.slice(-60);
    currentProgress.currentRunId=id;saveProgress();logEvent('segmento_sessao_iniciado',id,{step:currentStep});
  }
  function closeLessonRun(reason='retorno ao catálogo'){
    if(!currentProgress?.currentRunId)return;
    const run=(currentProgress.sessionRuns||[]).find(item=>item.id===currentProgress.currentRunId&&!item.endedAt);if(!run)return;
    run.endedAt=new Date().toISOString();run.activeEndSeconds=Number(currentProgress.activeSeconds)||0;run.activeSeconds=Math.max(0,run.activeEndSeconds-(run.activeStartSeconds||0));run.endStep=currentStep;run.endReason=reason;currentProgress.currentRunId=null;logEvent('segmento_sessao_encerrado',reason,{runId:run.id,activeSeconds:run.activeSeconds,endStep:currentStep});saveProgress();
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
        <div><span>Tempo</span><strong>Mínimo ${Math.round((currentLesson.minimumActiveSeconds||DATA.minimumActiveSeconds)/60)} min • máximo 40 min previstos</strong></div>
        <div><span>Ferramenta</span><strong>${escapeHtml(currentLesson.support?.tool?.name||'Modo Guiado')}</strong></div>
      </div>
      <details class="guided-lesson-plan"><summary>Ver plano da aula</summary><ol>${(currentLesson.support?.steps||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><p><b>Entrega:</b> ${escapeHtml(currentLesson.expectedResult)}</p></details>
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
    else if(key==='steps') html=`<h3>Passo a passo</h3><ol>${(currentLesson.support?.steps||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
    else if(key==='advanced') html=`<h3>Desafio avançado</h3><p>${escapeHtml(currentLesson.support?.levels?.exploration||currentLesson.challenge)}</p><p>Apresente também uma alternativa, um risco e um critério para validar sua escolha.</p>`;
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
    const steps=(currentLesson.support?.steps||[`Identifique o objetivo: ${currentLesson.objective}`,`Prepare a estrutura ou os dados necessários.`,`Realize a prática: ${currentLesson.practice}`,`Teste uma situação diferente.`,`Registre uma correção ou melhoria.`]).slice(0,5);
    el.stepContent.innerHTML=`<span class="guided-kicker">FAÇA COMIGO</span><h1>Prática guiada</h1><p>Conclua cada passo. Você pode voltar às explicações quando necessário.</p><div class="guided-checklist">${steps.map((s,i)=>`<label><input type="checkbox" data-index="${i}" ${checks[i]?'checked':''}/> <span><b>Passo ${i+1}</b>${escapeHtml(s)}</span></label>`).join('')}</div><button id="guidedCheckPractice" class="btn primary" type="button">Verificar prática</button>`;
    $$('.guided-checklist input').forEach(input=>input.addEventListener('change',()=>{
      currentProgress.answers=currentProgress.answers||{};currentProgress.answers.practiceChecks=currentProgress.answers.practiceChecks||{};currentProgress.answers.practiceChecks[input.dataset.index]=input.checked;saveProgress();
    }));
    $('#guidedCheckPractice')?.addEventListener('click',()=>{
      const all=$$('.guided-checklist input').every(i=>i.checked); if(!all)return showFeedback('Conclua os cinco passos antes de continuar.','warn');markStepComplete('prática guiada concluída');
    });
  }
  function renderLab(){
    el.stepContent.innerHTML=`<span class="guided-kicker">LABORATÓRIO</span><h1>Experiência prática</h1><p>${escapeHtml(currentLesson.practice)}</p><div id="guidedLabTool" class="guided-lab-workspace"></div>${currentLesson.platformTasks?.length&&currentLesson.toolType!=='ecosystem-lab'?'<details class="guided-related-platforms"><summary>Ferramentas externas relacionadas</summary><div id="guidedRelatedEcosystem"></div></details>':''}`;
    renderInteractiveTool($('#guidedLabTool'),'lab');
    if($('#guidedRelatedEcosystem'))renderEcosystemTool($('#guidedRelatedEcosystem'),'related');
  }
  function renderInteractiveTool(container,phase){
    const type=currentLesson.toolType||'planner';
    const codeTypes=['code','compiler','dom','mobilecode','jsconsole','html','css','semantic','form','multicode','debugger'];
    const phoneTypes=['prototype','thumb','uxreview','components','router','pwa','game','mobilecode','prototype-flow'];
    const boardTypes=['kanban','board'];
    if(type==='ecosystem-lab')return renderEcosystemTool(container,phase);
    if(['device-emulator','responsive','responsive-css'].includes(type))return renderDeviceEmulator(container,phase,type);
    if(type==='simulator')return renderPythonSimulator(container,phase);
    if(type==='decision')return renderDecisionSimulator(container,phase);
    if(type==='boxmodel')return renderBoxModelTool(container,phase);
    if(type==='ui-audit')return renderUiAuditTool(container,phase);
    if(type==='fitts-hick')return renderFittsHickTool(container,phase);
    if(type==='mobile-navigation')return renderMobileNavigationTool(container,phase);
    if(type==='mobile-quality')return renderMobileQualityTool(container,phase);
    if(type==='language-lab')return renderLanguageLab(container,phase);
    if(type==='api-mobile')return renderApiMobileTool(container,phase);
    if(type==='mobile-ecosystem')return renderMobileEcosystemTool(container,phase);
    if(type==='cyber-lab')return renderCyberLab(container,phase);
    if(type==='system-review')return renderSystemReviewTool(container,phase);
    if(codeTypes.includes(type))return renderCodeTool(container,phase,type);
    if(phoneTypes.includes(type))return renderPhoneTool(container,phase,type);
    if(boardTypes.includes(type))return renderBoardTool(container,phase);
    return renderPlanningTool(container,phase,type);
  }
  function renderEcosystemTool(container,phase){
    if(!container)return;
    window.DS_Ecosystem?.render?.(container,{lesson:currentLesson,profile,progress:currentProgress,onChange:()=>saveProgress(),findDuplicate:(item,lessonId)=>findGlobalEvidenceDuplicate(item,lessonId),onInternalAction:()=>logEvent('resultado_interno_iniciado',currentLesson.id,{phase}),onEvent:(type,detail,extra)=>logEvent(type,detail,extra),onComplete:message=>{if(phase==='lab')markStepComplete(message);else saveProgress();},feedback:showFeedback});
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
  function bytesToHex(bytes){return Array.from(bytes).map(value=>value.toString(16).padStart(2,'0')).join('');}
  async function sha256Text(value){
    if(!window.crypto?.subtle) return 'Web Crypto indisponível neste contexto.';
    const bytes=new TextEncoder().encode(String(value));
    return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));
  }
  function textToBinary(value){return Array.from(String(value)).map(char=>char.codePointAt(0).toString(2).padStart(8,'0')).join(' ');}
  function binaryToText(value){
    const groups=String(value).trim().split(/\s+/).filter(Boolean);
    if(!groups.length||groups.some(group=>!/^[01]{8}$/.test(group))) return null;
    return groups.map(group=>String.fromCharCode(parseInt(group,2))).join('');
  }
  function caesarTransform(value,shift){
    const amount=((Number(shift)%26)+26)%26;
    return Array.from(String(value)).map(char=>{
      const code=char.charCodeAt(0);let base=null;
      if(code>=65&&code<=90)base=65;else if(code>=97&&code<=122)base=97;
      return base===null?char:String.fromCharCode(((code-base+amount)%26)+base);
    }).join('');
  }
  function base64Utf8(value){try{return btoa(unescape(encodeURIComponent(String(value))));}catch(_){return 'Falha ao codificar';}}
  function fromBase64Utf8(value){try{return decodeURIComponent(escape(atob(String(value).trim())));}catch(_){return null;}}
  function cyberScenarioSet(mode){
    const sets={
      'xss':{title:'Revisão de XSS e DOM seguro',items:[
        ['Exibir o nome digitado por uma pessoa.',['saida.innerHTML = nome','saida.textContent = nome','eval(nome)'],1,'textContent trata a entrada como texto.'],
        ['Receber um link externo.',['Aceitar qualquer esquema','Validar protocolo e destino','Executar o link como código'],1,'Links precisam de protocolo e destino permitidos.'],
        ['Sanitização significa:',['Substituir toda validação','Limpar conforme o contexto de uso','Ocultar o campo com CSS'],1,'Validação e sanitização têm papéis diferentes.'] ]},
      'storage-auth':{title:'Armazenamento e autenticação',items:[
        ['Preferência de tema claro/escuro.',['localStorage pode ser suficiente','Chave privada no HTML','Senha em variável global'],0,'Preferências não sensíveis podem ficar localmente.'],
        ['Senha do aluno.',['Texto puro em localStorage','Derivação de chave e envelope criptográfico','Atributo hidden no DOM'],1,'Senha não deve ser armazenada em texto puro.'],
        ['Segredo de servidor.',['Dentro do JavaScript público','Em comentário no HTML','Fora do frontend, em ambiente controlado'],2,'O navegador público não consegue guardar segredo de servidor.'] ]},
      'requirements-security':{title:'Requisitos verificáveis de segurança',items:[
        ['“O sistema deve ser seguro” é:',['Critério completo','Requisito vago','Teste automatizado'],1,'É necessário definir comportamento observável.'],
        ['Quem pode redefinir senha?', ['Qualquer visitante','Somente fluxo autorizado e registrado','Quem alterar o DOM'],1,'A ação precisa de autorização limitada.'],
        ['Disponibilidade significa:',['Apenas cores bonitas','Continuar ou recuperar o serviço e os dados','Esconder erros'],1,'Disponibilidade trata acesso e continuidade.'] ]},
      'threat-flow':{title:'Fluxo de dados e ameaças',items:[
        ['Entrada de dados do usuário.',['Confiar automaticamente','Validar tipo, tamanho e contexto','Executar como código'],1,'Toda entrada deve ser tratada como não confiável.'],
        ['Arquivo exportado.',['Nunca validar ao importar','Validar formato, versão e integridade','Somar todos os valores'],1,'Importação exige validação e prevenção de replay.'],
        ['Hash serve principalmente para:',['Recuperar a senha original','Verificar integridade ou comparação','Criptografar vídeo'],1,'Hash não é reversível como uma cifra.'] ]},
      'permissions':{title:'Permissões e minimização de dados',items:[
        ['Leitura de QR Code opcional.',['Solicitar câmera ao abrir o portal','Explicar antes e oferecer digitação manual','Negar acesso à aula'],1,'A câmera deve ser contextual e ter alternativa.'],
        ['Cidade para contextualizar conteúdo.',['Usar localização precisa contínua','Permitir seleção manual','Inferir nacionalidade'],1,'Use o dado menos preciso necessário.'],
        ['Microfone não usado pela atividade.',['Solicitar mesmo assim','Não solicitar','Manter ativo em segundo plano'],1,'Permissões sem finalidade não devem ser pedidas.'] ]},
      'incident':{title:'Resposta a incidente educacional',items:[
        ['Primeiro passo ao perceber falha relevante.',['Explorar até conseguir vantagem','Interromper, preservar evidência e comunicar','Publicar dados de colegas'],1,'A prioridade é reduzir dano e comunicar.'],
        ['Ao corrigir.',['Apagar todo histórico','Registrar correção e testar regressão','Culpar o usuário'],1,'Correção precisa ser verificável.'],
        ['Comunicado adequado.',['Expõe dados pessoais','Explica impacto e orientação sem detalhes sensíveis','Ensina como repetir a falha'],1,'Transparência deve preservar segurança e privacidade.'] ]},
      'secure-code':{title:'Código seguro e limites do frontend',items:[
        ['const senha="1234" em JavaScript público.',['Segredo protegido','Segredo extraível','Assinatura digital'],1,'Código entregue ao navegador pode ser inspecionado.'],
        ['window.adminUnlocked=true.',['Autorização limitada','Desbloqueio global inseguro','Controle de sessão forte'],1,'Permissões devem ser vinculadas à ação e sessão.'],
        ['Ação crítica.',['PIN permanente','Autorização assinada e limitada','Botão oculto'],1,'Assinatura permite verificar sem publicar chave privada.'] ]},
      'api-mobile':{title:'API, token e modo offline',items:[
        ['Token administrativo no aplicativo.',['Seguro por estar compilado','Segredo exposto','Cache recomendado'],1,'Aplicações distribuídas podem ser analisadas.'],
        ['Falha de rede.',['Tela infinita','Estado de erro e fallback local','Apagar dados'],1,'Disponibilidade exige tratamento de falha.'],
        ['Resposta da API.',['Confiar sem verificar','Validar status e estrutura','Inserir diretamente com innerHTML'],1,'Dados remotos também são não confiáveis.'] ]}
    };
    return sets[mode]||sets['requirements-security'];
  }
  function renderCyberLab(container,phase){
    const mode=currentLesson.toolConfig?.cyberMode||'binary';
    const key=`${phase}-cyber-${mode}`;
    const saved=currentProgress.labData?.[key]||{};
    const notice='<p class="guided-cyber-notice"><strong>Escopo educacional:</strong> utilize somente este simulador e os ambientes autorizados pelo professor.</p>';
    if(mode==='binary'){
      const secret='01010011 01000101 01000111 01010101 01010010 01000001 01001110 01000011 01000001';
      container.innerHTML=`${notice}<div class="guided-cyber-lab"><section><h3>Texto e binário</h3><label>Texto curto<input data-cyber-text maxlength="30" value="${escapeHtml(saved.text||'DS')}"></label><button data-binary-convert class="btn primary" type="button">Converter</button><pre data-binary-output></pre></section><section><h3>Desafio de decodificação</h3><code class="guided-cyber-code">${secret}</code><label>Mensagem encontrada<input data-binary-answer maxlength="30" value="${escapeHtml(saved.answer||'')}"></label><button data-binary-check class="btn secondary" type="button">Verificar e salvar</button><div data-cyber-feedback></div></section></div>`;
      const convert=()=>{const value=container.querySelector('[data-cyber-text]').value;container.querySelector('[data-binary-output]').textContent=textToBinary(value)||'Digite um texto.';};
      container.querySelector('[data-binary-convert]').onclick=convert;convert();
      container.querySelector('[data-binary-check]').onclick=()=>{const answer=container.querySelector('[data-binary-answer]').value.trim().toUpperCase();const ok=answer==='SEGURANCA';container.querySelector('[data-cyber-feedback]').textContent=ok?'Correto: cada grupo representa um caractere. Binário é representação, não criptografia.':'Revise os grupos de oito bits e a tabela ASCII.';currentProgress.labData[key]={text:container.querySelector('[data-cyber-text]').value,answer,ok};saveProgress();logEvent('cyber_lab',mode,{phase,ok});if(ok)markStepComplete('desafio binário concluído');};return;
    }
    if(mode==='caesar-hash'){
      container.innerHTML=`${notice}<div class="guided-cyber-lab"><section><h3>Cifra de César</h3><label>Texto<input data-caesar-text maxlength="80" value="${escapeHtml(saved.text||'SEGURANCA')}"></label><label>Deslocamento <output data-caesar-shift-out>${saved.shift||3}</output><input data-caesar-shift type="range" min="-13" max="13" value="${saved.shift||3}"></label><div class="guided-tool-actions"><button data-caesar-encode class="btn primary" type="button">Criptografar</button><button data-caesar-decode class="btn secondary" type="button">Descriptografar</button></div><pre data-caesar-output></pre></section><section><h3>Hash SHA-256</h3><label>Entrada para comparar<input data-hash-text maxlength="100" value="${escapeHtml(saved.hashText||'atividade-ds')}"></label><button data-hash-run class="btn secondary" type="button">Gerar hash</button><code class="guided-hash-output" data-hash-output></code><button data-caesar-save class="btn primary" type="button">Salvar comparação</button></section></div>`;
      const shift=container.querySelector('[data-caesar-shift]');shift.oninput=()=>container.querySelector('[data-caesar-shift-out]').textContent=shift.value;
      const transform=sign=>{const value=container.querySelector('[data-caesar-text]').value;container.querySelector('[data-caesar-output]').textContent=caesarTransform(value,Number(shift.value)*sign);};
      container.querySelector('[data-caesar-encode]').onclick=()=>transform(1);container.querySelector('[data-caesar-decode]').onclick=()=>transform(-1);
      container.querySelector('[data-hash-run]').onclick=async()=>{container.querySelector('[data-hash-output]').textContent=await sha256Text(container.querySelector('[data-hash-text]').value);};
      container.querySelector('[data-caesar-save]').onclick=async()=>{const state={text:container.querySelector('[data-caesar-text]').value,shift:Number(shift.value),hashText:container.querySelector('[data-hash-text]').value,hash:await sha256Text(container.querySelector('[data-hash-text]').value)};currentProgress.labData[key]=state;saveProgress();logEvent('cyber_lab',mode,{phase});markStepComplete('cifra e hash comparados');};return;
    }
    if(mode==='encoding-advanced'){
      container.innerHTML=`${notice}<div class="guided-cyber-lab"><section><h3>Comparador de representações</h3><label>Texto<input data-encoding-text maxlength="80" value="${escapeHtml(saved.text||'Desafio DS')}"></label><button data-encoding-run class="btn primary" type="button">Converter e comparar</button><dl class="guided-encoding-results"><dt>Binário</dt><dd data-enc-binary></dd><dt>Hexadecimal UTF-8</dt><dd data-enc-hex></dd><dt>Base64</dt><dd data-enc-base64></dd><dt>SHA-256</dt><dd data-enc-hash></dd></dl></section><section><h3>Conclusão</h3><label>Por que Base64 não protege um segredo?<textarea data-encoding-answer maxlength="400">${escapeHtml(saved.answer||'')}</textarea></label><button data-encoding-save class="btn secondary" type="button">Salvar análise</button></section></div>`;
      container.querySelector('[data-encoding-run]').onclick=async()=>{const value=container.querySelector('[data-encoding-text]').value,bytes=new TextEncoder().encode(value);container.querySelector('[data-enc-binary]').textContent=textToBinary(value);container.querySelector('[data-enc-hex]').textContent=bytesToHex(bytes);container.querySelector('[data-enc-base64]').textContent=base64Utf8(value);container.querySelector('[data-enc-hash]').textContent=await sha256Text(value);};
      container.querySelector('[data-encoding-save]').onclick=()=>{const answer=container.querySelector('[data-encoding-answer]').value.trim();if(answer.length<35)return showFeedback('Explique que Base64 é uma codificação reversível.','warn');currentProgress.labData[key]={text:container.querySelector('[data-encoding-text]').value,answer};saveProgress();logEvent('cyber_lab',mode,{phase});markStepComplete('representações comparadas');};return;
    }
    const set=cyberScenarioSet(mode);
    container.innerHTML=`${notice}<div class="guided-cyber-scenarios"><h3>${escapeHtml(set.title)}</h3><p>Escolha a resposta mais segura e pedagogicamente adequada em cada situação.</p>${set.items.map((item,index)=>`<label class="guided-cyber-question"><span>${index+1}. ${escapeHtml(item[0])}</span><select data-cyber-question="${index}"><option value="">Selecione...</option>${item[1].map((option,i)=>`<option value="${i}" ${String(saved.answers?.[index])===String(i)?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select><small data-cyber-explain="${index}"></small></label>`).join('')}<button data-cyber-verify class="btn primary" type="button">Verificar laboratório</button><div class="guided-code-output" data-cyber-result></div></div>`;
    container.querySelector('[data-cyber-verify]').onclick=()=>{const answers={},wrong=[];set.items.forEach((item,index)=>{const raw=container.querySelector(`[data-cyber-question="${index}"]`).value;const value=raw===''?null:Number(raw);answers[index]=Number.isFinite(value)?value:null;const ok=value===item[2];container.querySelector(`[data-cyber-explain="${index}"]`).textContent=ok?`Correto. ${item[3]}`:`Revise. ${item[3]}`;if(!ok)wrong.push(index);});currentProgress.labData[key]={answers,completed:wrong.length===0};saveProgress();logEvent('cyber_lab',mode,{phase,correct:set.items.length-wrong.length,total:set.items.length});container.querySelector('[data-cyber-result]').textContent=wrong.length?`Você acertou ${set.items.length-wrong.length} de ${set.items.length}. Corrija as situações indicadas.`:'Todas as situações foram analisadas corretamente.';if(!wrong.length)markStepComplete(`laboratório ${mode} concluído`);};
  }
  function renderSystemReviewTool(container,phase){
    const key=`${phase}-system-review`;
    const targets=currentLesson.analysisTargets||['Desafio DS','Lab Virtual DS','Lab 3D / HoloMotion','CTF Cyber','Diagnóstico Edu'];
    const saved=currentProgress.labData?.[key]||{target:targets[0],checks:[],severity:'medium',problem:'',evidence:'',mvp:'',validation:'',feedback:''};
    const criteria=[['objective','Objetivo e resultado esperado estão claros'],['flow','Fluxo e navegação possuem continuidade'],['mobile','Funciona em celular e computador'],['accessibility','Possui acessibilidade e alternativa'],['performance','Carrega e responde adequadamente'],['security','Entradas, dados e autorizações são tratados com segurança'],['evidence','Exportação e evidência estão claras'],['pedagogy','A ferramenta contribui para o aprendizado']];
    container.innerHTML=`<div class="guided-system-review"><section class="guided-review-controls"><label>Ferramenta analisada<select data-review-target>${targets.map(item=>`<option ${item===saved.target?'selected':''}>${escapeHtml(item)}</option>`).join('')}</select></label><label>Gravidade do principal problema<select data-review-severity><option value="low" ${saved.severity==='low'?'selected':''}>Baixa — refinamento</option><option value="medium" ${saved.severity==='medium'?'selected':''}>Média — dificulta o uso</option><option value="high" ${saved.severity==='high'?'selected':''}>Alta — impede concluir</option></select></label><fieldset><legend>Critérios verificados</legend>${criteria.map(([id,label])=>`<label><input type="checkbox" data-review-check="${id}" ${saved.checks.includes(id)?'checked':''}> ${escapeHtml(label)}</label>`).join('')}</fieldset></section><section class="guided-review-notes"><label>Problema ou oportunidade observada<textarea data-review-field="problem" maxlength="500">${escapeHtml(saved.problem)}</textarea></label><label>Evidência e passos para reproduzir<textarea data-review-field="evidence" maxlength="700">${escapeHtml(saved.evidence)}</textarea></label><label>MVP ou protótipo de melhoria<textarea data-review-field="mvp" maxlength="700">${escapeHtml(saved.mvp)}</textarea></label><label>Como validar o resultado<textarea data-review-field="validation" maxlength="500">${escapeHtml(saved.validation)}</textarea></label><label>Feedback respeitoso e acionável<textarea data-review-field="feedback" maxlength="500">${escapeHtml(saved.feedback)}</textarea></label><button data-save-system-review class="btn primary" type="button">Salvar auditoria e MVP</button><div class="guided-code-output" data-system-review-result></div></section></div>`;
    container.querySelector('[data-save-system-review]').onclick=()=>{const state={target:container.querySelector('[data-review-target]').value,severity:container.querySelector('[data-review-severity]').value,checks:$$('[data-review-check]:checked',container).map(input=>input.dataset.reviewCheck)};$$('[data-review-field]',container).forEach(field=>state[field.dataset.reviewField]=field.value.trim());const filled=['problem','evidence','mvp','validation','feedback'].filter(field=>state[field].length>=25);if(state.checks.length<5||filled.length<5)return showFeedback('Verifique pelo menos cinco critérios e preencha os cinco registros com explicações.','warn');currentProgress.labData[key]=state;saveProgress();logEvent('auditoria_sistema',state.target,{phase,severity:state.severity,criteria:state.checks.length});container.querySelector('[data-system-review-result]').textContent=`Auditoria de ${state.target} salva. O MVP deve preservar o que funciona e ser validado pelos critérios registrados.`;markStepComplete('análise, MVP e feedback registrados');};
  }
  function renderCodeTool(container,phase,type){
    const saved=currentProgress.labData?.[`${phase}-code`] || starterCode(type);
    container.innerHTML=`
      <div class="guided-code-toolbar"><span>${escapeHtml(type.toUpperCase())} LAB</span><button id="guidedRestoreCode" class="btn tiny" type="button">Restaurar</button></div>
      <textarea id="guidedCodeEditor" class="guided-code-editor" spellcheck="false">${escapeHtml(saved)}</textarea>
      <div class="guided-tool-actions"><button id="guidedRunCode" class="btn primary" type="button">Testar exemplo</button><button id="guidedExternalTool" class="btn secondary" type="button">Como acessar a ferramenta</button></div>
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
    container.innerHTML=`<div class="guided-planner-grid">${labels.map((label,i)=>`<label>${escapeHtml(label)}<textarea data-field="f${i}" maxlength="500" placeholder="Registre sua análise...">${escapeHtml(saved[`f${i}`]||'')}</textarea></label>`).join('')}</div><div class="guided-tool-actions"><button id="guidedSavePlan" class="btn primary" type="button">Salvar laboratório</button><button id="guidedOpenReal" class="btn secondary" type="button">Como acessar a ferramenta</button></div>`;
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
    const tasks=Array.isArray(currentLesson?.platformTasks)?currentLesson.platformTasks:[];
    const task=tasks[index]||tasks[0];
    if(!task)return showFeedback('Esta atividade é realizada dentro do próprio Modo Guiado.','info');
    const tool=window.DS_Ecosystem?.catalog?.[task.toolId];
    const name=tool?.name||task.toolId||'plataforma indicada';
    logEvent('orientacao_plataforma',name,{taskId:task.id||'',activity:task.activity||''});
    showFeedback(`Use ${name} pelo endereço informado pelo professor ou na atividade do Classroom. Depois retorne e envie o comprovante nesta aula.`,'info');
    openSupportCoach('tool');
  }

  function renderChallenge(){
    const value=currentProgress.answers?.challenge||'';
    const tasks=currentLesson.platformTasks||[];const ext=window.DS_Ecosystem?.evidenceList?.(currentProgress)||[];
    el.stepContent.innerHTML=`<span class="guided-kicker">AGORA É SUA VEZ</span><h1>Desafio da aula</h1><section class="guided-challenge-card"><p>${escapeHtml(currentLesson.challenge)}</p><ul><li>Explique a decisão.</li><li>Mostre um exemplo, teste ou comprovante.</li><li>Registre como verificou o resultado.</li>${tasks.length?'<li>Relacione o resultado obtido na plataforma indicada.</li>':''}</ul></section>${tasks.length?`<div class="guided-evidence-summary"><strong>Integração com o ecossistema</strong><span>${ext.length} comprovante(s) registrado(s)</span><p>${currentLesson.requiresExternalEvidence?'O comprovante da plataforma é obrigatório para finalizar esta aula.':'O comprovante da plataforma é complementar.'}</p></div>`:''}<label class="guided-long-answer">Sua solução<textarea id="guidedChallengeAnswer" minlength="40" maxlength="1800" placeholder="Descreva sua resposta, código, análise, link ou plano...">${escapeHtml(value)}</textarea></label><button id="guidedSaveChallenge" class="btn primary" type="button">Salvar desafio</button>`;
    $('#guidedSaveChallenge').addEventListener('click',()=>{const text=$('#guidedChallengeAnswer').value.trim();if(text.length<40)return showFeedback('Desenvolva um pouco mais a resposta. Use pelo menos 40 caracteres.','warn');currentProgress.answers=currentProgress.answers||{};currentProgress.answers.challenge=text;saveProgress();logEvent('desafio_salvo',`${text.length} caracteres`,{externalEvidence:ext.length});markStepComplete('desafio registrado');});
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
  function requiresGithubDelivery(){
    return (currentLesson?.platformTasks||[]).some(task=>task.toolId==='github'&&task.required);
  }
  function safeEvidenceUrl(value){
    const raw=String(value||'').trim();
    if(!raw)return '';
    try{const url=new URL(raw);return url.protocol==='https:'?url.href:'';}catch(_){return '';}
  }
  function validDeliveryUrl(value){
    const safe=safeEvidenceUrl(value);if(!safe)return false;
    const url=new URL(safe);return url.hostname==='github.com'||url.hostname.endsWith('.github.io');
  }
  function registeredDeliveryLinks(){
    const links=[];
    const stored=safeEvidenceUrl(currentProgress?.delivery?.githubUrl||'');
    if(stored)links.push({label:'GitHub informado na conclusão',url:stored});
    (window.DS_Ecosystem?.evidenceList?.(currentProgress)||[]).forEach(item=>{
      const url=safeEvidenceUrl(item?.source?.url||'');
      if(url&&!links.some(row=>row.url===url))links.push({label:item?.platform?.name||'Link informado pelo aluno',url});
    });
    return links;
  }
  function proofSummaryHtml(){
    const evidence=window.DS_Ecosystem?.evidenceList?.(currentProgress)||[];
    if(!evidence.length)return '<p class="guided-empty-proof">Nenhum comprovante externo foi solicitado ou enviado nesta aula.</p>';
    return `<div class="guided-proof-summary">${evidence.map(item=>`<article><strong>${escapeHtml(item?.platform?.name||item?.platform?.id||'Plataforma')}</strong><span>${escapeHtml(item?.activity?.title||'Atividade')}</span><p>${escapeHtml(item?.result?.summary||'Sem descrição')}</p>${item?.source?.fileName?`<small>Arquivo: ${escapeHtml(item.source.fileName)}</small>`:''}${safeEvidenceUrl(item?.source?.url)?`<a href="${escapeHtml(safeEvidenceUrl(item.source.url))}" target="_blank" rel="noopener noreferrer">Link informado pelo aluno</a>`:''}</article>`).join('')}</div>`;
  }
  function lessonReceiptHtml(report){
    const when=value=>value?new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'Não registrado';
    const answers=Object.entries(report.answers||{}).filter(([,value])=>String(value||'').trim()).map(([key,value])=>`<article><h3>${escapeHtml(key)}</h3><pre>${escapeHtml(typeof value==='string'?value:JSON.stringify(value,null,2))}</pre></article>`).join('')||'<p>Nenhuma resposta textual registrada.</p>';
    const labs=Object.entries(report.labData||{}).map(([key,value])=>`<article><h3>${escapeHtml(key)}</h3><pre>${escapeHtml(JSON.stringify(value,null,2))}</pre></article>`).join('')||'<p>Nenhum dado adicional de laboratório registrado.</p>';
    const proofs=(report.externalEvidence||[]).map(item=>`<article class="proof"><h3>${escapeHtml(item?.platform?.name||item?.platform?.id||'Plataforma')}</h3><p><b>Atividade:</b> ${escapeHtml(item?.activity?.title||'')}</p><p><b>Descrição:</b> ${escapeHtml(item?.result?.summary||'')}</p>${item?.source?.fileName?`<p><b>Arquivo:</b> ${escapeHtml(item.source.fileName)} (${Math.round((Number(item.source.fileSize)||0)/1024)} KB)</p>`:''}${item?.source?.fileHash?`<p class="hash"><b>Hash:</b> ${escapeHtml(item.source.fileHash)}</p>`:''}${safeEvidenceUrl(item?.source?.url)?`<p><b>Link:</b> <a href="${escapeHtml(safeEvidenceUrl(item.source.url))}">${escapeHtml(safeEvidenceUrl(item.source.url))}</a></p>`:''}${/^data:image\/(?:jpeg|png|webp);base64,/i.test(String(item?.source?.previewDataUrl||''))?`<img src="${item.source.previewDataUrl}" alt="Prévia do comprovante enviado">`:''}</article>`).join('')||'<p>Nenhum comprovante externo solicitado ou registrado.</p>';
    const links=(report.deliveryLinks||[]).map(item=>`<li><b>${escapeHtml(item.label)}:</b> <a href="${escapeHtml(item.url)}">${escapeHtml(item.url)}</a></li>`).join('')||'<li>Nenhum link de entrega informado.</li>';
    const events=(report.events||[]).map(event=>`<tr><td>${escapeHtml(when(event.at))}</td><td>${escapeHtml(event.type||'')}</td><td>${escapeHtml(event.detail||'')}</td></tr>`).join('')||'<tr><td colspan="3">Sem eventos registrados.</td></tr>';
    const steps=(report.progress?.completedSteps||[]).map(index=>`<li>${escapeHtml(STEP_NAMES[index]||`Etapa ${index+1}`)}</li>`).join('');
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(fileName('pdf').replace('.pdf',''))}</title><style>@page{size:A4;margin:13mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;line-height:1.45;margin:0;font-size:11pt}header{border-bottom:3px solid #0f766e;padding-bottom:12px;margin-bottom:16px}h1{font-size:22pt;margin:0 0 5px;color:#10233f}h2{font-size:15pt;color:#10233f;border-bottom:1px solid #cbd5e1;padding-bottom:5px;margin-top:22px}h3{font-size:11.5pt;margin:0 0 5px}.meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.meta div,.card,.proof{border:1px solid #cbd5e1;border-radius:8px;padding:9px;break-inside:avoid}.meta span{display:block;font-size:9pt;color:#64748b}.meta strong{display:block}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.proof img{display:block;max-width:100%;max-height:380px;margin-top:8px;border:1px solid #cbd5e1}.hash{overflow-wrap:anywhere;font-size:8.5pt}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;border-radius:6px;padding:8px;font:9.5pt/1.45 Consolas,monospace}table{width:100%;border-collapse:collapse;font-size:8.7pt}th,td{border:1px solid #cbd5e1;padding:5px;vertical-align:top}th{background:#e2e8f0;text-align:left}a{color:#075985;overflow-wrap:anywhere}.signature{margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:40px}.signature div{border-top:1px solid #475569;padding-top:5px;text-align:center}@media print{.no-print{display:none!important}}@media(max-width:700px){.meta,.grid{grid-template-columns:1fr}}</style></head><body><header><h1>Comprovante de aula concluída</h1><p>Desafio DS — Modo Guiado • versão ${escapeHtml(report.version)}</p></header><section class="meta"><div><span>Aluno</span><strong>${escapeHtml(report.student.name)}</strong></div><div><span>Turma</span><strong>${escapeHtml(report.student.class)}</strong></div><div><span>Disciplina</span><strong>${escapeHtml(report.lesson.discipline)}</strong></div><div><span>Aula</span><strong>${report.lesson.number} — ${escapeHtml(report.lesson.title)}</strong></div><div><span>Início</span><strong>${escapeHtml(when(report.session.startedAt))}</strong></div><div><span>Fim</span><strong>${escapeHtml(when(report.session.endedAt))}</strong></div><div><span>Tempo ativo</span><strong>${escapeHtml(report.session.activeTime)}</strong></div><div><span>ID da sessão</span><strong>${escapeHtml(report.session.id)}</strong></div></section><h2>Objetivo e realização</h2><div class="card"><p><b>Objetivo:</b> ${escapeHtml(report.lesson.objective||'')}</p><p><b>Etapas concluídas:</b> ${(report.progress?.completedSteps||[]).length}/${STEP_NAMES.length}</p><ol>${steps}</ol></div><h2>Respostas e atividades</h2><div class="grid">${answers}</div><h2>Dados das práticas e laboratórios</h2><div class="grid">${labs}</div><h2>Comprovantes de outras plataformas</h2><div class="grid">${proofs}</div><h2>Links de entregas informados</h2><ul>${links}</ul><h2>Log da sessão</h2><table><thead><tr><th>Horário</th><th>Evento</th><th>Detalhe</th></tr></thead><tbody>${events}</tbody></table><p>Documento gerado em ${escapeHtml(when(report.generatedAt))}. Os comprovantes e links foram informados pelo aluno e permanecem registrados no perfil local.</p><div class="signature"><div>Aluno</div><div>Professor</div></div></body></html>`;
  }
  function printLessonReceipt(){
    currentProgress.exports=(Number(currentProgress.exports)||0)+1;
    currentProgress.delivery=currentProgress.delivery||{};currentProgress.delivery.receiptGenerated=true;currentProgress.delivery.receiptGeneratedAt=new Date().toISOString();
    logEvent('comprovante_pdf_gerado',currentLesson.title,{count:currentProgress.exports});saveProgress();
    const report=buildReportData();
    const html=lessonReceiptHtml(report);
    const popup=window.open('','_blank');
    if(!popup){
      downloadBlob(html,fileName('html'),'text/html;charset=utf-8');
      showFeedback('O navegador bloqueou a janela de impressão. O comprovante em HTML foi baixado; abra-o e use Imprimir → Salvar como PDF.','warn');
      return false;
    }
    try{popup.opener=null;}catch(_){}
    popup.document.open();popup.document.write(html);popup.document.close();
    setTimeout(()=>{try{popup.focus();popup.print();}catch(_){}},350);
    return true;
  }
  function renderFinish(){
    const min=currentLesson.minimumActiveSeconds||DATA.minimumActiveSeconds;
    const remaining=Math.max(0,min-(currentProgress.activeSeconds||0));
    const allPrevious=[0,1,2,3,4,5,6,7,8].every(index=>(currentProgress.completedSteps||[]).includes(index));
    const timeOk=remaining===0;
    const externalOk=evidenceOk();
    const githubRequired=requiresGithubDelivery();
    const existingGithub=String(currentProgress?.delivery?.githubUrl||'').trim();
    const githubOk=!githubRequired||validDeliveryUrl(existingGithub);
    const ready=allPrevious&&timeOk&&externalOk&&githubOk;
    const evidence=window.DS_Ecosystem?.evidenceList?.(currentProgress)||[];
    const completed=!!currentProgress.completed;
    window.DS_Schedule?.setActivityContext?.({resultReady:ready,exportPending:!completed,classroomOpened:!!currentProgress?.delivery?.classroomOpened});
    el.stepContent.innerHTML=`
      <span class="guided-kicker">COMPROVANTE FINAL</span><h1>${completed?'Aula concluída':'Confira e conclua a aula'}</h1>
      <p class="guided-finish-intro">Você só precisou do código coletivo para iniciar. Agora confira o tempo, as atividades e os comprovantes antes de gerar o PDF.</p>
      <div class="guided-completion-grid">
        <div><span>Etapas anteriores</span><strong>${allPrevious?'Concluídas':'Há etapas pendentes'}</strong></div>
        <div><span>Tempo ativo</span><strong>${fmt(currentProgress.activeSeconds||0)}</strong></div>
        <div><span>Tempo restante</span><strong>${timeOk?'Concluído':fmt(remaining)}</strong></div>
        <div><span>Comprovante externo</span><strong>${currentLesson.requiresExternalEvidence?(externalOk?`${evidence.length} registrado(s)`:'Pendente'):'Não solicitado'}</strong></div>
      </div>
      ${!timeOk?`<div class="guided-time-warning"><strong>O tempo mínimo ainda não terminou.</strong><p>Continue revisando, testando ou melhorando sua atividade. Não é necessário pedir outro código durante a aula.</p></div>`:''}
      ${!externalOk?`<div class="guided-time-warning"><strong>Falta o comprovante da plataforma solicitada.</strong><p>Volte à etapa “Plataforma e comprovante”, selecione o nome da plataforma, descreva o resultado e anexe o arquivo solicitado.</p><button id="guidedReturnEvidence" class="btn secondary" type="button">Enviar comprovante</button></div>`:''}
      ${githubRequired?`<section class="guided-github-delivery"><h2>Link do código no GitHub</h2><p>Publique o código no GitHub e cole abaixo o endereço do repositório ou da página publicada. Esse link aparecerá no comprovante final.</p><label>URL do GitHub<input id="guidedGithubDeliveryUrl" type="url" inputmode="url" placeholder="https://github.com/usuario/repositorio" value="${escapeHtml(existingGithub)}"></label><small id="guidedGithubDeliveryStatus">${githubOk?'Link válido registrado.':'Informe um endereço https://github.com ou github.io.'}</small></section>`:''}
      <section class="guided-final-proofs"><h2>Comprovantes registrados</h2>${proofSummaryHtml()}</section>
      <section class="guided-final-actions"><h2>Gerar comprovante da aula</h2><p>O comprovante contém aluno, turma, disciplina, aula, horários de início e fim, tempo ativo, respostas, atividades, logs, arquivos enviados e links informados.</p><button id="guidedFinalizeLesson" class="btn primary full" type="button" ${ready||completed?'':'disabled'}>${completed?'Imprimir comprovante novamente':'Concluir aula e abrir PDF'}</button><button id="guidedOpenClassroom" class="btn secondary full" type="button">Abrir Classroom</button><details><summary>Opções de backup</summary><div class="guided-export-actions"><button id="guidedExportHtml" class="btn ghost" type="button">Baixar comprovante HTML</button><button id="guidedExportJson" class="btn ghost" type="button">Baixar dados JSON</button></div></details>${completed?'<button id="guidedFinishBackCatalog" class="btn ghost full" type="button">Voltar para a lista de aulas</button>':''}</section>`;
    $('#guidedReturnEvidence')?.addEventListener('click',()=>{currentStep=6;renderStep();});
    $('#guidedGithubDeliveryUrl')?.addEventListener('input',event=>{
      const value=event.target.value.trim();currentProgress.delivery=currentProgress.delivery||{};currentProgress.delivery.githubUrl=value;currentProgress.delivery.githubSavedAt=new Date().toISOString();saveProgress();
      const status=$('#guidedGithubDeliveryStatus');if(status)status.textContent=validDeliveryUrl(value)?'Link válido registrado.':'Informe um endereço https://github.com ou github.io.';
    });
    $('#guidedExportHtml')?.addEventListener('click',()=>{const html=lessonReceiptHtml(buildReportData());downloadBlob(html,fileName('html'),'text/html;charset=utf-8');});
    $('#guidedExportJson')?.addEventListener('click',()=>exportEvidence('json'));
    $('#guidedOpenClassroom')?.addEventListener('click',openClassroom);
    $('#guidedFinishBackCatalog')?.addEventListener('click',()=>returnToCatalog('comprovante gerado'));
    $('#guidedFinalizeLesson')?.addEventListener('click',()=>{
      if(completed){printLessonReceipt();return;}
      const githubUrl=$('#guidedGithubDeliveryUrl')?.value.trim()||existingGithub;
      if(githubRequired&&!validDeliveryUrl(githubUrl))return showFeedback('Cole o link válido do GitHub antes de concluir.','warn');
      currentProgress.delivery=currentProgress.delivery||{};if(githubUrl)currentProgress.delivery.githubUrl=githubUrl;
      const steps=new Set(currentProgress.completedSteps||[]);steps.add(9);currentProgress.completedSteps=Array.from(steps).sort((a,b)=>a-b);
      currentProgress.completed=true;currentProgress.completedAt=new Date().toISOString();currentProgress.endedBy='concluida';
      logEvent('aula_concluida',currentLesson.title,{externalEvidence:evidence.length,deliveryLinks:registeredDeliveryLinks().length});
      closeLessonRun('aula concluída');stopTicker();saveProgress();printLessonReceipt();renderFinish();
    });
  }

  function nextStep(){
    if(currentStep===STEP_NAMES.length-1){
      if(!canAdvance) return showFeedback('Conclua as etapas, registre os comprovantes solicitados e cumpra o tempo mínimo da aula.','warn');
      return;
    }
    if(!canAdvance)return showFeedback('Realize a ação solicitada nesta etapa antes de continuar.','warn');
    currentStep=Math.min(STEP_NAMES.length-1,currentStep+1);renderStep();
  }
  function previousStep(){ if(currentStep>0){currentStep--;renderStep();} }

  function exportEvidence(format){
    if(!currentProgress)return;
    currentProgress.exports=(Number(currentProgress.exports)||0)+1;currentProgress.delivery=currentProgress.delivery||{};currentProgress.delivery.exported=true;currentProgress.delivery.exportedAt=new Date().toISOString();saveProgress();logEvent('evidencia_exportada',format,{count:currentProgress.exports});window.DS_Schedule?.setActivityContext?.({resultReady:true,exportPending:false});
    const report=buildReportData();if(format==='json')return downloadBlob(JSON.stringify(report,null,2),fileName('json'),'application/json');
    const externalRows=(report.externalEvidence||[]).map(item=>`<li><strong>${escapeHtml(item.platform?.name||item.platform?.id)}</strong> — ${escapeHtml(item.activity?.title||'Atividade')}<br>${escapeHtml(item.result?.summary||'Sem resumo')}${item.source?.url?`<br>Link: ${escapeHtml(item.source.url)}`:''}</li>`).join('')||'<li>Nenhum comprovante externo vinculado.</li>';
    const schedule=report.session.schedule;const scheduleText=schedule?escapeHtml(schedule.label||schedule.state||'Horário registrado'):'Não disponível';
    const html=`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comprovante ${escapeHtml(currentLesson.title)}</title><style>body{font-family:Arial,sans-serif;max-width:920px;margin:30px auto;padding:0 24px;color:#152033;line-height:1.55}h1{color:#0b5d4f}.box{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:14px 0}pre{white-space:pre-wrap;background:#f1f5f9;padding:14px;border-radius:8px;overflow-wrap:anywhere}li{margin:.55rem 0}.badge{display:inline-block;padding:.25rem .55rem;border-radius:999px;background:#e2e8f0}</style><body><h1>Desafio DS — Modo Guiado</h1><p class="badge">Versão ${escapeHtml(report.version)}</p><div class="box"><p><b>Aluno:</b> ${escapeHtml(report.student.name)}</p><p><b>Turma:</b> ${escapeHtml(report.student.class)}</p><p><b>Disciplina:</b> ${escapeHtml(report.lesson.discipline)}</p><p><b>Unidade:</b> ${escapeHtml(report.lesson.unit?.title||'')}</p><p><b>Aula:</b> ${report.lesson.number} — ${escapeHtml(report.lesson.title)}</p><p><b>Tempo ativo:</b> ${escapeHtml(report.session.activeTime)}</p><p><b>Horário escolar:</b> ${scheduleText}</p><p><b>Sessão:</b> ${escapeHtml(report.session.id)}</p></div><div class="box"><h2>Objetivo</h2><p>${escapeHtml(currentLesson.objective)}</p><h2>Desafio</h2><pre>${escapeHtml(currentProgress.answers?.challenge||'Não registrado')}</pre><h2>Reflexão</h2><pre>${escapeHtml(currentProgress.answers?.reflection||'Não registrada')}</pre></div><div class="box"><h2>Resultados das plataformas integradas</h2><ul>${externalRows}</ul></div><div class="box"><h2>Progresso e integridade</h2><p>Etapas concluídas: ${(currentProgress.completedSteps||[]).length}/${STEP_NAMES.length}</p><p>Explicações extras: ${(currentProgress.extraUsed||[]).map(extraTitle).join(', ')||'Nenhuma'}</p><p>Recursos de apoio: ${(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x).join(', ')||'Padrão'}</p></div><div class="box"><h2>Termo e compromisso pedagógico</h2><p>Status: ${escapeHtml(report.terms.status)}</p><p>Versão: ${escapeHtml(report.terms.termsVersion||'não validada')}</p><p>Data do aceite: ${escapeHtml(report.terms.acceptedAt||'não registrada')}</p><p>Registro: ${escapeHtml(report.terms.acceptanceId||'não disponível')}</p><p>Integridade: ${escapeHtml(report.terms.integrity||'pendente')}</p><p>Finalidade educacional: XP, moedas, itens e cosméticos não determinam nota.</p></div><p>Gerado em ${new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}.</p></body></html>`;
    downloadBlob(html,fileName('html'),'text/html;charset=utf-8');
  }
  function buildReportData(){
    const unit=unitForLesson(currentLesson);const schedule=window.DS_Schedule?.snapshot?.()||window.DS_Schedule?.calculate?.()||null;
    return {app:'Desafio DS — Modo Guiado',version:DATA.version,generatedAt:new Date().toISOString(),student:{name:profile.name,class:courseData().label,supportResources:(profile.supports||[]).map(x=>SUPPORT_LABELS[x]||x)},lesson:{id:currentLesson.id,number:displayNumber(currentLesson),legacyNumber:currentLesson.legacyNumber||currentLesson.number,title:currentLesson.title,module:currentLesson.module,unit:{id:unit?.id||'',title:unit?.title||''},discipline:disciplineData().label,objective:currentLesson.objective,minimumActiveSeconds:currentLesson.minimumActiveSeconds||DATA.minimumActiveSeconds,expectedMinutes:currentLesson.expectedMinutes||25,requiredPlatforms:(currentLesson.platformTasks||[]).map(x=>x.toolId)},session:{id:currentProgress.sessionId,startedAt:currentProgress.startedAt,endedAt:currentProgress.completedAt||new Date().toISOString(),activeSeconds:currentProgress.activeSeconds,activeTime:fmt(currentProgress.activeSeconds),idleEpisodes:currentProgress.idleEpisodes,schedule,runs:currentProgress.sessionRuns||[]},progress:{completedSteps:currentProgress.completedSteps,stepLabels:(currentProgress.completedSteps||[]).map(index=>STEP_NAMES[index]||`Etapa ${index+1}`),extraUsed:currentProgress.extraUsed,exports:currentProgress.exports,completed:!!currentProgress.completed},externalEvidence:window.DS_Ecosystem?.evidenceList?.(currentProgress)||[],deliveryLinks:registeredDeliveryLinks(),delivery:currentProgress.delivery||{},terms:window.DS_Terms?.evidence?.()||{status:'não validado'},permissions:window.DS_ProfileManager?.getPath?.('permissions.history',[])?.slice(-20)||[],assessment:{method:'atividades, comprovantes e critérios definidos pelo professor',xpInfluencesGrade:false,cosmeticsInfluenceGrade:false},answers:currentProgress.answers||{},labData:currentProgress.labData||{},events:currentProgress.events||[]};
  }
  function fileName(ext){
    const safe=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'').toUpperCase();
    return `${safe(profile.courseKey)}_${safe(disciplineData().short)}_AULA${String(displayNumber(currentLesson)).padStart(2,'0')}_${safe(profile.name)}.${ext}`;
  }
  function downloadBlob(content,name,type){
    const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    showFeedback(`Arquivo ${name} gerado. Agora abra o Classroom e anexe o comprovante.`,'ok');
  }
  function openClassroom(){
    if(!window.DS_Classroom?.open)return showFeedback('O seletor do Classroom não foi carregado. Atualize a página.','warn');
    window.DS_Classroom.open({courseKey:profile?.courseKey,disciplineKey:profile?.disciplineKey,source:'modo-guiado',onOpen:selection=>{
      externalAuthorizedUntil=Date.now()+30*60*1000;currentProgress.delivery=currentProgress.delivery||{};currentProgress.delivery.classroomOpened=true;currentProgress.delivery.classroomOpenedAt=selection.openedAt;currentProgress.delivery.classroomCourseKey=selection.courseKey;currentProgress.delivery.classroomDisciplineKey=selection.disciplineKey;currentProgress.delivery.classroomUrl=selection.url;saveProgress();logEvent('classroom_aberto',selection.url,{authorized:true,deliveryConfirmed:false,courseKey:selection.courseKey,disciplineKey:selection.disciplineKey,disciplineLabel:selection.disciplineLabel});window.DS_Schedule?.setActivityContext?.({classroomOpened:true});showFeedback(`Classroom de ${selection.disciplineLabel} aberto. Anexe o arquivo e confirme a entrega diretamente na atividade.`,'ok');
    }});
  }

  function openTeacherModal(){
    el.teacherName.value='';
    if(el.teacherPassword)el.teacherPassword.value='';
    el.teacherStatus.textContent='';
    const title=$('#guidedTeacherTitle'),intro=title?.nextElementSibling;
    if(title)title.textContent='Auditoria do professor';
    if(intro)intro.textContent='Este acesso é exclusivo do professor e não interfere na realização normal da aula pelo aluno.';
    el.teacherReason.previousElementSibling?.classList.add('hidden');
    el.teacherReason.classList.add('hidden');
    el.teacherNote.previousElementSibling?.classList.add('hidden');
    el.teacherNote.classList.add('hidden');
    el.teacherModal.classList.remove('hidden');
    setTimeout(()=>el.teacherName.focus(),50);
  }
  function closeTeacherModal(){el.teacherModal?.classList.add('hidden');}
  async function confirmTeacherAction(){
    const name=sanitizeName(el.teacherName.value);
    if(!name)return setTeacherStatus('Informe a identificação do professor.','warn');
    closeTeacherModal();
    try{
      await window.DS_EduAuth.authorize({actionId:'teacher-audit',classId:profile.courseKey,subjectId:`${profile.courseKey}:${profile.disciplineKey}`,lessonId:currentLesson?.id||'painel-professor',activityId:'principal',resourceId:profile.disciplineKey,teacher:name,reason:'Auditoria pedagógica'});
      openTeacherPanel(name);
    }catch(error){showFeedback(error?.message||'Auditoria não autorizada.','warn');}
  }

  function setTeacherStatus(text,type){el.teacherStatus.textContent=text;el.teacherStatus.className=`mode-status ${type}`;}
  function openTeacherPanel(teacher){
    const lessons=orderedLessons();
    el.extraTitle.textContent=`Painel do professor — ${disciplineData().label}`;
    el.extraOptions.innerHTML=`<button id="teacherExportProgress" class="btn primary" type="button">Exportar progresso</button><button id="teacherMaintenance" class="btn secondary" type="button">Manutenção avançada</button>`;
    el.extraContent.innerHTML=`<p>A auditoria é somente leitura. Para desbloquear ou reiniciar uma aula específica será exigida uma nova autorização assinada e vinculada ao perfil, disciplina e ação.</p><div class="guided-teacher-code-list">${lessons.map(l=>{const p=getProgress(l);return `<div><span>Aula ${displayNumber(l)}</span><strong>${p.completed?'100%':Math.round((new Set(p.completedSteps||[]).size/STEP_NAMES.length)*100)+'%'}</strong><small>${escapeHtml(l.title)} • ${p.completed?'concluída':p.unlocked?'em andamento':'bloqueada'}</small></div>`;}).join('')}</div>`;
    $('#teacherExportProgress').addEventListener('click',()=>{const data=lessons.map(l=>({lesson:displayNumber(l),id:l.id,title:l.title,progress:getProgress(l)}));downloadBlob(JSON.stringify({teacher,student:profile.name,course:courseData().label,discipline:disciplineData().label,data},null,2),`PROGRESSO_${profile.courseKey}_${disciplineData().short}_${profile.name.replace(/\s+/g,'_')}.json`,'application/json');});
    $('#teacherMaintenance').addEventListener('click',async()=>{try{await window.DS_EduAuth.authorize({actionId:'teacher-maintenance',classId:profile.courseKey,subjectId:`${profile.courseKey}:${profile.disciplineKey}`,lessonId:'painel-professor',activityId:'manutencao-perfil',resourceId:profile.name,teacher,reason:'Manutenção individual do progresso'});renderTeacherMaintenance(teacher);}catch(error){showFeedback(error?.message||'Manutenção não autorizada.','warn');}});
    el.extraModal.classList.remove('hidden');
  }
  function renderTeacherMaintenance(teacher){
    const lessons=orderedLessons();el.extraTitle.textContent='Manutenção avançada — autorização temporária';
    el.extraOptions.innerHTML='<button id="teacherBackAudit" class="btn ghost" type="button">Voltar à auditoria</button>';
    el.extraContent.innerHTML=`<p>Selecione apenas a aula que precisa de correção. Nenhuma ação altera outras aulas.</p><label>Aula<select id="teacherLessonSelect">${lessons.map(l=>`<option value="${escapeHtml(l.id)}">${String(displayNumber(l)).padStart(2,'0')} — ${escapeHtml(l.title)}</option>`).join('')}</select></label><div class="guided-maintenance-actions"><button id="teacherUnlockLesson" class="btn secondary" type="button">Desbloquear sem concluir</button><button id="teacherResetLesson" class="btn danger" type="button">Reiniciar progresso da aula</button></div><p class="guided-delivery-disclaimer">O reinício exige confirmação e gera evento local de auditoria. O perfil e as demais aulas são preservados.</p>`;
    $('#teacherBackAudit').onclick=()=>openTeacherPanel(teacher);
    $('#teacherUnlockLesson').onclick=()=>{const lesson=lessonById($('#teacherLessonSelect').value),p=getProgress(lesson);p.unlocked=true;p.events=p.events||[];p.events.push({at:new Date().toISOString(),type:'manutencao_docente',detail:'aula desbloqueada',teacher});const all=getAllProgress();all[progressKey(lesson.id)]=p;saveAllProgress(all);showFeedback(`Aula ${displayNumber(lesson)} desbloqueada sem marcar conclusão.`,'ok');renderTeacherMaintenance(teacher);};
    $('#teacherResetLesson').onclick=()=>{const lesson=lessonById($('#teacherLessonSelect').value);if(!confirm(`Reiniciar somente a aula ${displayNumber(lesson)}?`))return;const all=getAllProgress();all[progressKey(lesson.id)]={lessonId:lesson.id,unlocked:true,completed:false,currentStep:0,completedSteps:[],activeSeconds:0,idleEpisodes:0,events:[{at:new Date().toISOString(),type:'manutencao_docente',detail:'progresso reiniciado',teacher}],answers:{},labData:{},extraUsed:[],extraHelpful:{},exports:0,teacherOverride:null,startedAt:new Date().toISOString(),completedAt:null,lastAccess:new Date().toISOString(),sessionId:createSessionId()};saveAllProgress(all);showFeedback(`Somente a aula ${displayNumber(lesson)} foi reiniciada.`,'ok');renderTeacherMaintenance(teacher);};
  }

  install();
})();
