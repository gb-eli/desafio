(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const C = () => window.DS_Crypto;
  const R = () => window.DS_Random;
  const S = () => window.DS_Sanitize;
  const A = () => window.DS_Assessment;
  const P = () => window.DS_Proficiency;
  const CONFIG = window.DS_CONFIG || {appVersion:'sem-config', maxSecurityWarnings:4, modes:{}};
  const MODES = CONFIG.modes || {};
  const BANKS = window.DS_BANKS || {};
  const SECURE_BANKS = window.DS_SECURE_BANKS || {};
  const BANK_MANIFEST = window.DS_BANK_MANIFEST || {};
  const bankScriptCache = new Set();
  const decryptedBanks = {};
  let unlockedPassword = ''; // material de conteúdo, não credencial do aluno
  let activeBank = {questions:[], labs:[], version:'sem-banco', nome:'Banco não carregado'};

  const el = {
    start: $('#startScreen'), game: $('#gameScreen'), result: $('#resultScreen'), form: $('#startForm'), name: $('#playerName'), turma: $('#playerClass'),
    modePass: $('#modePassword'), modeSelect: $('#modeSelect'), unlockMode: $('#unlockModeBtn'), modeStatus: $('#modeUnlockStatus'), modeBadge: $('#modeBadge'), startBtn: $('#startBtn'), moduleWrap: $('#moduleSelectWrap'), moduleSelect: $('#moduleSelect'), playStyleWrap: $('#playStyleWrap'),
    playerHud: $('#playerHud'), modeHud: $('#modeHud'), score: $('#scoreHud'), scoreLabel: $('#scoreHudLabel'), scoreBar: $('#scoreBar'), lives: $('#livesHud'), hints: $('#hintsHud'), skips: $('#skipsHud'), combo: $('#comboHud'), power: $('#powerBar'), powerStatus: $('#powerStatus'), activatePower: $('#activatePowerBtn'), extraCard: $('#extraCardBtn'), xpLedger: $('#xpLedgerBtn'), switchExperience: $('#switchExperienceBtn'), timerLabel: $('#timerLabel'),
    area: $('#areaTag'), type: $('#typeTag'), difficulty: $('#difficultyTag'), skill: $('#skillTag'), title: $('#questionTitle'), desc: $('#questionDesc'), timer: $('#timerHud'), body: $('#questionBody'), feedback: $('#feedback'),
    check: $('#checkBtn'), next: $('#nextBtn'), hint: $('#hintBtn'), skipLab: $('#skipLabBtn'), progress: $('#missionProgress'), progressText: $('#progressText'), eventLog: $('#eventLog'), areaHint: $('#areaHint'),
    resultTitle: $('#resultTitle'), resultMessage: $('#resultMessage'), resultModeNotice: $('#resultModeNotice'), finalScore: $('#finalScore'), resultStats: $('#resultStats'), areaReport: $('#areaReport'), proficiencyOverview: $('#proficiencyOverview'), competencyReport: $('#competencyReport'), learningReport: $('#learningReport'), tokenBox: $('#tokenBox'), tokenPrint: $('#tokenPrintBox'), copyToken: $('#copyTokenBtn'), download: $('#downloadResultBtn'), printPdf: $('#printResultBtn'), openClassroomResult: $('#openClassroomResultBtn'), resultDeliveryHelp: $('#resultDeliveryHelpBtn'), resultExportStatus: $('#resultExportStatus'), resultClassroomStatus: $('#resultClassroomStatus'), restart: $('#restartBtn'), resultHub: $('#resultHubBtn'), powerToast: $('#powerToast'),
    levelTransition: $('#levelTransition'), levelTransitionKicker: $('#levelTransitionKicker'), levelTransitionTitle: $('#levelTransitionTitle'), levelTransitionMessage: $('#levelTransitionMessage'),
    reportBug: $('#reportBugBtn'), bugModal: $('#bugModal'), bugText: $('#bugText'), bugType: $('#bugType'), saveBug: $('#saveBugBtn'), cancelBug: $('#cancelBugBtn'), finishBug: $('#finishByBugBtn'), rescueModal: $('#rescueModal'), rescuePassword: $('#rescuePassword'), rescueStatus: $('#rescueStatus'), confirmRescue: $('#confirmRescueBtn'), forceFinish: $('#forceFinishBtn'), teacherPanel: $('#teacherPanel'), rescueTeacherName: $('#rescueTeacherName'), rescueReason: $('#rescueReason'), sideToggle: $('#sideToggle'), sidePanel: $('#sidePanel'), watermark: $('#sessionWatermark'), competitiveExitModal: $('#competitiveExitModal'), competitiveExitTitle: $('#competitiveExitTitle'), competitiveExitMessage: $('#competitiveExitMessage'), continueDiagnostic: $('#continueDiagnosticBtn'), endCompetitive: $('#endCompetitiveBtn'), extraCardModal: $('#extraCardModal'), extraCardCancel: $('#extraCardCancelBtn')
  };

  const themeByArea = {
    'Computação e Hardware':'theme-hardware',
    'CMD / Terminal / Organização de Arquivos':'theme-cmd',
    'Análise e Métodos de Sistemas':'theme-analysis',
    'Inovação Tecnológica e Empreendedorismo':'theme-innovation',
    'Banco de Dados / SQL':'theme-sql',
    'Front-end / HTML / CSS / JavaScript':'theme-front',
    'Python / Programação':'theme-python',
    'Back-end / APIs / Cloud / Virtualização':'theme-back',
    'Computação Gráfica / UX / UI':'theme-ux',
    'Inglês Técnico — Bônus':'theme-english',
    'Ciência de Dados / Dados':'theme-data',
    'Segurança de Aplicações / Criptografia':'theme-security',
    'Espanhol Técnico — Bônus':'theme-spanish'
  };
  const classTheme = {'1DS':'class-ds1','2DS':'class-ds2','3DS':'class-ds3','2DS Noite':'class-night'};

  let mission = [], index = 0, current = null, selected = null, currentController = null;
  let startedAt = 0, phaseStartedAt = 0, timerId = null, timerDeadline = 0, timerSeq = 0, timeLeft = 0, finished = false, gameStarted = false;
  let missionQuestionTotal = 0, missionLabTotal = 0, lastDifficultyShown = 0, phaseCompleted = false, phaseProcessing = false, transitionLock = false, activePower = null, securityHandle = null;
  const completedPhaseKeys = new Set();
  const state = {
    player:'', turma:'', mode:null, modeLabel:'', playStyle:'competitivo', playStyleLabel:'Competitivo', competitiveAbandoned:false, competitiveAbandonedReason:'', competitiveScoreBeforeSwitch:0, competitiveFailureReason:'', sessionId:'', score:0, lives:5, maxLives:5, hints:5, combo:0, maxCombo:0, shield:0, power:0, multiplierNext:1, extraCards:1,
    warnings:0, hardWarnings:0, answers:[], events:[], labs:[], powerups:[], stats:{}, difficultyStats:{}, skillStats:{}, hintUsage:{}, bugReports:[], endedBy:'finalizado', lifeVault:null, scoreVault:null, expectedScore:0, powerReadyNotified:false, fullscreenRequested:false, overtime:false, rescuePending:false, integrityIssues:[], pendingProva:{}, pendingDiagnostic:{}, diagnosticPostpones:0, challengeSkips:0, rescueLogs:[], teacherStartIndex:null, moduleFilter:'__all__', moduleLabel:'Desafio geral', xpTimeline:[], xpLedger:null, tokenChecksum:'', lastIntegrityAt:{}
  };

  function isCompetitive(){ return state.mode === 'desafio' && state.playStyle === 'competitivo' && !state.competitiveAbandoned; }
  function isDiagnostic(){ return state.mode === 'desafio' && state.playStyle === 'diagnostico'; }
  function scoringEnabled(){ return !isDiagnostic() && state.mode !== 'professor'; }
  function selectedPlayStyle(){ return document.querySelector('input[name="playStyle"]:checked')?.value || 'competitivo'; }
  function styleLabel(){ return isDiagnostic() ? (state.competitiveAbandoned ? 'Diagnóstico completo • competitivo abandonado' : 'Diagnóstico completo') : state.mode === 'prova' ? 'Modo Prova' : state.mode === 'professor' ? 'Modo Professor' : 'Competitivo'; }
  function questionTimeFor(item){
    if(item?.kind === 'lab') return Number(item.timeLimit || CONFIG.labTimeSeconds || 240);
    const base=Number(CONFIG.questionTimeSeconds)||150;
    const extra=Math.max(0,(A().level(item?.dificuldade||2)-1)*(Number(CONFIG.questionTimePerDifficultySeconds)||15));
    const textBonus=String(item?.enunciado||'').length>260?30:String(item?.enunciado||'').length>150?15:0;
    return Number(item?.timeLimit || (base+extra+textBonus));
  }
  function returnToHub(source='manual'){
    if(gameStarted && !finished && source==='manual' && !confirm('Voltar ao início? A tentativa competitiva atual será encerrada sem gerar resultado.')) return;
    timerSeq++; clearInterval(timerId); gameStarted=false; finished=false; currentController?.cleanup?.(); currentController=null;
    document.body.classList.remove('game-active','details-open','overtime-prova','diagnostic-style','competitive-style');
    [el.game,el.result].forEach(screen=>screen?.classList.remove('active')); el.start?.classList.add('active');
    if(el.competitiveExitModal) el.competitiveExitModal.classList.add('hidden');
    if(el.extraCardModal) el.extraCardModal.classList.add('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function init(){
    installEvents();
    securityHandle = window.DS_Security.installSecurity({maxWarnings:CONFIG.maxSecurityWarnings || 4, shouldBlock:()=>gameStarted && !finished && !state.rescuePending && state.mode !== 'professor', onWarning:securityWarning, onStrike:securityStrike});
    updateClassTheme();
    updateModeUi(null);
    logLocal('Sistema pronto.');
  }

  function installEvents(){
    el.turma?.addEventListener('change', updateClassTheme);
    el.unlockMode?.addEventListener('click', unlockMode);
    el.modePass?.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); unlockMode(); } });
    el.form?.addEventListener('submit', startGame);
    el.moduleSelect?.addEventListener('change', () => { state.moduleFilter = el.moduleSelect.value || '__all__'; state.moduleLabel = el.moduleSelect.selectedOptions?.[0]?.textContent || 'Desafio geral'; });
    $$('input[name="playStyle"]').forEach(input=>input.addEventListener('change',()=>{ $$('[data-style-card]').forEach(card=>card.classList.toggle('selected',card.dataset.styleCard===input.value && input.checked)); }));
    el.check?.addEventListener('click', checkCurrent);
    el.next?.addEventListener('click', nextPhase);
    el.hint?.addEventListener('click', useHint);
    el.skipLab?.addEventListener('click', skipCurrentPhase);
    el.activatePower?.addEventListener('click', activatePower);
    el.extraCard?.addEventListener('click', openExtraCardModal);
    el.xpLedger?.addEventListener('click',()=>window.DS_XPLedger?.open?.(state.xpLedger));
    el.extraCardCancel?.addEventListener('click', ()=>el.extraCardModal?.classList.add('hidden'));
    $$('#extraCardModal [data-card-action]').forEach(btn=>btn.addEventListener('click',()=>useExtraCard(btn.dataset.cardAction)));
    el.continueDiagnostic?.addEventListener('click', continueAsDiagnostic);
    el.endCompetitive?.addEventListener('click', ()=>{ const reason=state.competitiveFailureReason||'sem_vidas'; el.competitiveExitModal?.classList.add('hidden'); finishGame(reason); });
    el.switchExperience?.addEventListener('click', ()=>returnToHub('manual'));
    el.reportBug?.addEventListener('click', openBugModal);
    el.cancelBug?.addEventListener('click', closeBugModal);
    el.saveBug?.addEventListener('click', saveBugReport);
    el.finishBug?.addEventListener('click', finishByBugReport);
    el.confirmRescue?.addEventListener('click', confirmRescue);
    el.forceFinish?.addEventListener('click', () => finishGame('strike_integridade_prova'));
    el.copyToken?.addEventListener('click', copyToken);
    el.download?.addEventListener('click', downloadResult);
    el.printPdf?.addEventListener('click', () => {markResultExported('pdf'); window.print();});
    el.openClassroomResult?.addEventListener('click', openResultClassroom);
    el.resultDeliveryHelp?.addEventListener('click',()=>window.DS_PlatformShell?.open?.('help'));
    el.restart?.addEventListener('click', () => location.reload());
    el.resultHub?.addEventListener('click', ()=>returnToHub('result'));
    el.sideToggle?.addEventListener('click', () => {
      const open = document.body.classList.toggle('details-open');
      el.sideToggle.setAttribute('aria-expanded', String(open));
      el.sideToggle.textContent = open ? 'Ocultar detalhes' : 'Detalhes da missão';
    });
  }

  async function unlockMode(){
    const modeKey=el.modeSelect?.value||'desafio';const turma=el.turma?.value||'1DS';
    const actionId=modeKey==='desafio'?'challenge-start':modeKey==='prova'?'assessment-start':'teacher-audit';
    const subjectId=modeKey==='desafio'?'desafio-ds':modeKey==='prova'?'prova-ds':'auditoria-docente';
    const lessonId=modeKey==='desafio'?'diagnostico-geral':modeKey==='prova'?'prova-geral':'painel-professor';
    setModeMessage('Preparando solicitação EduAuth…','warn');
    try{
      await window.DS_EduAuth.authorize({actionId,classId:turma,subjectId,lessonId,activityId:'modo-inicial',resourceId:modeKey});
      state.mode=modeKey;unlockedPassword=CONFIG.bankContentMaterial;updateModeUi(modeKey);populateModuleSelect(modeKey);setModeMessage(`${MODES[modeKey].label} autorizado temporariamente pelo EduAuth.`,modeKey==='professor'?'warn':'ok');
      if(modeKey==='professor'){
        try{activeBank=await loadBankForMode(modeKey,CONFIG.bankContentMaterial,'__all__');renderTeacherPanel();setModeMessage('Auditoria docente autorizada para esta sessão.','ok');}catch(err){console.warn(err);setModeMessage('Autorização aceita, mas o banco de auditoria não abriu.','bad');}
      }
    }catch(error){state.mode=null;unlockedPassword='';updateModeUi(null);setModeMessage(error?.message||'Autorização não concluída.','bad');}
  }

  function updateModeUi(mode){
    if(el.startBtn) el.startBtn.disabled = !mode;
    if(el.modeBadge){ el.modeBadge.textContent = mode ? MODES[mode].label : 'Modo bloqueado'; el.modeBadge.className = 'mode-badge ' + (mode ? mode : 'locked'); }
    if(el.name){ el.name.required = mode !== 'professor'; if(mode === 'professor' && !el.name.value.trim()) el.name.value = 'Professor/Teste'; }
    if(el.moduleWrap){ el.moduleWrap.classList.toggle('hidden', !mode || mode === 'professor'); }
    if(el.playStyleWrap){ el.playStyleWrap.classList.toggle('hidden', mode !== 'desafio'); }
    if(el.teacherPanel){ el.teacherPanel.classList.toggle('hidden', mode !== 'professor'); if(mode === 'professor' && decryptedBanks.professor) renderTeacherPanel(); }
  }
  function setModeMessage(text, type){ if(el.modeStatus){ el.modeStatus.textContent = text; el.modeStatus.className = 'mode-status ' + (type || ''); } }
  function populateModuleSelect(mode){
    if(!el.moduleSelect) return;
    const areas = getManifestAreas(mode);
    el.moduleSelect.innerHTML = '<option value="__all__">Desafio geral — todas as áreas</option>' + areas.map(a=>`<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
    state.moduleFilter = '__all__';
    state.moduleLabel = 'Desafio geral';
  }
  function getManifestAreas(mode){
    const cfg = MODES[mode] || {};
    const key = cfg.bank || mode;
    const manifest = BANK_MANIFEST[key] || BANK_MANIFEST.desafio || {chunks:[]};
    return (manifest.chunks || []).map(c => c.area).filter(Boolean).sort();
  }

  function renderTeacherPanel(){
    if(!el.teacherPanel) return;
    const bank = getBankForMode('professor');
    if(!bank || !Array.isArray(bank.questions) || !bank.questions.length){
      el.teacherPanel.innerHTML = '<h3>Modo Professor — Testar fases</h3><p>Banco de auditoria ainda não carregado.</p>';
      return;
    }
    const phases = buildMission(bank.questions || [], bank.labs || [], MODES.professor || {shuffleQuestions:false, shuffleLabs:false});
    el.teacherPanel.innerHTML = `<h3>Modo Professor — Testar fases</h3><p>Selecione uma pergunta ou laboratório para abrir diretamente e verificar funcionamento, enunciado e validação.</p><div class="teacher-list">${phases.map((p,i)=>`<button type="button" class="teacher-jump" data-pos="${i}"><span>${i+1}</span><b>${escapeHtml(p.kind === 'lab' ? 'LAB' : 'Q')}</b>${escapeHtml(p.area || '')}<small>${escapeHtml((p.enunciado || p.title || '').slice(0,80))}</small></button>`).join('')}</div>`;
    el.teacherPanel.querySelectorAll('.teacher-jump').forEach(btn=>btn.addEventListener('click', ev=>{ state.teacherStartIndex = Number(ev.currentTarget.dataset.pos) || 0; if(el.name && !el.name.value.trim()) el.name.value = 'Professor/Teste'; startGame({preventDefault(){}}); }));
  }

  function updateClassTheme(){
    const turma = el.turma?.value || '1DS';
    document.body.classList.remove('class-ds1','class-ds2','class-ds3','class-sub','class-night');
    document.body.classList.add(classTheme[turma] || 'class-ds1');
    document.body.dataset.turma = turma.replace(/\s+/g,'-').toLowerCase();
  }

  async function startGame(e){
    e.preventDefault();
    if(!window.DS_Terms?.isAccepted?.()){await window.DS_Terms?.ensureAccepted?.();return;}
    if(!state.mode) return setModeMessage('Solicite a autorização EduAuth antes de iniciar.', 'warn');
    if(state.mode !== 'professor' && !el.name.value.trim()) return el.name.focus();
    if(state.mode === 'professor' && !el.name.value.trim()) el.name.value = 'Professor/Teste';
    const modeConfig = MODES[state.mode];
    state.playStyle = state.mode === 'desafio' ? selectedPlayStyle() : (state.mode === 'prova' ? 'prova' : 'professor');
    state.playStyleLabel = state.playStyle === 'diagnostico' ? 'Diagnóstico completo' : state.playStyle === 'competitivo' ? 'Competitivo' : modeConfig.label;
    state.moduleFilter = (state.mode === 'professor') ? '__all__' : (el.moduleSelect?.value || '__all__');
    state.moduleLabel = (state.mode === 'professor' || state.moduleFilter === '__all__') ? 'Desafio geral' : (el.moduleSelect?.selectedOptions?.[0]?.textContent || state.moduleFilter);
    try{
      activeBank = await loadBankForMode(state.mode, unlockedPassword, state.moduleFilter);
    }catch(err){
      console.warn('Falha ao carregar banco modular:', err);
      return setModeMessage('Não foi possível carregar o banco deste módulo. Verifique se todos os arquivos foram enviados.', 'bad');
    }
    unlockedPassword = '';
    if(el.modePass) el.modePass.value = '';
    if(!activeBank || !Array.isArray(activeBank.questions) || !activeBank.questions.length){ return setModeMessage('Banco protegido ainda não foi carregado. Libere o modo novamente.', 'bad'); }
    state.player = S().name(el.name.value, 80); state.turma = el.turma.value; state.modeLabel = modeConfig.label; state.bankKey = modeConfig.bank || state.mode; state.bankName = activeBank.nome || state.bankKey; state.bankVersion = activeBank.version || 'sem-versao'; state.sessionId = createSessionId();
    state.xpLedger=window.DS_XPLedger?.create?.({profileId:window.DS_ProfileManager?.current?.()?.id||'session',sessionId:state.sessionId,mode:state.playStyle})||null;
    state.score = 0; state.maxLives = isDiagnostic() ? null : modeConfig.maxLives; state.lives = isDiagnostic() ? 999 : (modeConfig.maxLives ?? 999); state.hints = 5; state.combo = 0; state.maxCombo = 0; state.shield = 0; state.power = 0; state.multiplierNext = 1; state.extraCards = isCompetitive() ? 1 : 0;
    state.answers = []; state.events = []; state.labs = []; state.powerups = []; state.stats = {}; state.difficultyStats = {}; state.skillStats = {}; state.hintUsage = {}; state.bugReports = []; state.endedBy = 'finalizado'; state.warnings = 0; state.hardWarnings = 0; state.integrityIssues = []; state.expectedScore = 0; state.scoreVault = null; state.powerReadyNotified = false; state.overtime = false; state.rescuePending = false; state.pendingProva = {}; state.pendingDiagnostic = {}; state.diagnosticPostpones = 0; state.challengeSkips = 0; state.competitiveAbandoned = false; state.competitiveAbandonedReason=''; state.competitiveScoreBeforeSwitch=0; state.competitiveFailureReason=''; state.rescueLogs = []; state.xpTimeline = []; state.tokenChecksum=''; state.lastIntegrityAt={}; activePower = null; completedPhaseKeys.clear(); phaseProcessing = false; transitionLock = false; document.body.classList.remove('power-ready','double-xp-active','overtime-prova','diagnostic-style','competitive-style'); document.body.classList.add(isDiagnostic()?'diagnostic-style':'competitive-style');
    const bankAudit = auditLoadedBank(activeBank);
    if(bankAudit.errors.length){
      console.error('Falhas no banco:', bankAudit.errors);
      return setModeMessage(`O banco apresentou ${bankAudit.errors.length} falha(s) de estrutura. Use o Modo Professor para auditar.`, 'bad');
    }
    mission = buildMissionByModule(activeBank.questions || [], activeBank.labs || [], modeConfig, state.moduleFilter);
    missionQuestionTotal = mission.filter(x => x.kind === 'question').length;
    missionLabTotal = mission.filter(x => x.kind === 'lab').length;
    releaseBankData();
    lastDifficultyShown = 0;
    index = Number.isFinite(state.teacherStartIndex) ? Math.max(0, Math.min(state.teacherStartIndex, mission.length-1)) : 0; state.teacherStartIndex = null; phaseCompleted = false; finished = false; gameStarted = true; startedAt = Date.now(); protectState();
    el.playerHud.textContent = `${state.player} • ${state.turma}`;
    if(el.modeHud) el.modeHud.textContent = `${styleLabel()} • ${state.moduleLabel}`;
    if(el.watermark) el.watermark.textContent = `${state.player} • ${state.turma} • ${state.sessionId}`;
    el.start.classList.remove('active'); el.result.classList.remove('active'); el.game.classList.add('active'); document.body.classList.add('game-active');
    state.fullscreenRequested = false; // tela cheia permanece opcional e não é solicitada sem explicação contextual
    logEvent('inicio', `${styleLabel()} iniciado`); updateHud(); showPhase();
  }

  async function loadBankForMode(mode, password, moduleFilter='__all__'){
    const cfg = MODES[mode] || {};
    const key = cfg.bank || mode;
    const cacheKey = `${mode}|${key}|${moduleFilter || '__all__'}`;
    if(decryptedBanks[cacheKey]) return decryptedBanks[cacheKey];

    const manifest = BANK_MANIFEST[key] || BANK_MANIFEST.desafio;
    if(manifest && Array.isArray(manifest.chunks) && manifest.chunks.length){
      const selectedChunks = (moduleFilter && moduleFilter !== '__all__')
        ? manifest.chunks.filter(c => c.area === moduleFilter)
        : manifest.chunks;
      if(!selectedChunks.length) throw new Error('Módulo sem chunk correspondente.');
      const questions = [], labs = [], loadedAreas = [];
      for(const chunkInfo of selectedChunks){
        await loadBankChunkScript(chunkInfo.file);
        const chunk = (window.DS_BANK_CHUNKS || {})[chunkInfo.id];
        if(!chunk) throw new Error(`Chunk não registrado: ${chunkInfo.id}`);
        const packet = chunk.packets?.core;
        if(!packet) throw new Error(`Pacote ausente no chunk: ${chunkInfo.id}`);
        const part = await C().decryptSecureBank(packet, password);
        questions.push(...(part.questions || []));
        labs.push(...(part.labs || []));
        loadedAreas.push(part.area || chunkInfo.area);
        delete (window.DS_BANK_CHUNKS || {})[chunkInfo.id];
      }
      const bank = {
        secure:true,
        modular:true,
        secureKey:key,
        nome: manifest.nome || `Banco modular ${key}`,
        version: manifest.version || 'v14-modular',
        area: moduleFilter !== '__all__' ? moduleFilter : 'Todas as áreas',
        loadedAreas,
        questions,
        labs,
        manifest
      };
      decryptedBanks[cacheKey] = bank;
      if(moduleFilter === '__all__') decryptedBanks[mode] = bank;
      return bank;
    }

    const packet = SECURE_BANKS[key] || SECURE_BANKS[mode];
    if(packet){
      const bank = await C().decryptSecureBank(packet, password);
      bank.secure = true;
      bank.secureKey = key;
      decryptedBanks[cacheKey] = bank;
      decryptedBanks[mode] = bank;
      return bank;
    }
    const bank = BANKS[key] || window.DS_DATA || {questions:[], labs:[], version:'sem-banco', nome:'Banco não encontrado'};
    decryptedBanks[cacheKey] = bank;
    decryptedBanks[mode] = bank;
    return bank;
  }
  function loadBankChunkScript(file){
    return new Promise((resolve,reject)=>{
      if(!file) return reject(new Error('Arquivo de chunk não informado.'));
      if(bankScriptCache.has(file)) return resolve();
      const script = document.createElement('script');
      script.src = file;
      script.async = false;
      script.onload = () => { bankScriptCache.add(file); resolve(); };
      script.onerror = () => reject(new Error(`Falha ao carregar ${file}`));
      document.head.appendChild(script);
    });
  }
  function getBankForMode(mode){
    const cfg = MODES[mode] || {};
    const key = cfg.bank || mode;
    return decryptedBanks[`${mode}|${key}|${state.moduleFilter || '__all__'}`] || decryptedBanks[mode] || BANKS[key] || window.DS_DATA || {questions:[], labs:[], version:'sem-banco', nome:'Banco protegido ainda não carregado'};
  }
  function releaseBankData(){
    Object.keys(decryptedBanks).forEach(key => delete decryptedBanks[key]);
    if(activeBank){ activeBank.questions = []; activeBank.labs = []; }
    activeBank = {questions:[], labs:[], version:state.bankVersion || 'liberado', nome:state.bankName || 'Banco liberado'};
  }

  function auditLoadedBank(bank){
    const errors=[];
    const warnings=[];
    const ids=new Set();
    (bank?.questions||[]).forEach((question,pos)=>{
      A().validateQuestion(question).forEach(error=>errors.push(`Pergunta ${pos+1}: ${error}`));
      if(ids.has(question.id)) errors.push(`ID duplicado: ${question.id}`);
      ids.add(question.id);
      if(!Array.isArray(question.competencias) || !question.competencias.length) warnings.push(`Pergunta sem competências: ${question.id}`);
    });
    (bank?.labs||[]).forEach((lab,pos)=>{
      A().validateLab(lab).forEach(error=>errors.push(`Laboratório ${pos+1}: ${error}`));
      if(ids.has(lab.id)) errors.push(`ID duplicado: ${lab.id}`);
      ids.add(lab.id);
    });
    if(warnings.length) console.info('Avisos de metadados do banco:', warnings);
    return {errors,warnings};
  }

  function buildMissionByModule(questions, labs, modeConfig={}, moduleFilter='__all__'){
    let qs = questions || [], ls = labs || [];
    if(moduleFilter && moduleFilter !== '__all__'){
      qs = qs.filter(q => q.area === moduleFilter);
      ls = ls.filter(l => l.area === moduleFilter);
      if(!modeConfig.teacherMode && Number(modeConfig.specificQuestionSample) > 0){
        qs = balancedDifficultySample(qs, Number(modeConfig.specificQuestionSample));
      }
      if(!modeConfig.teacherMode && Number(modeConfig.specificLabSample) > 0){
        ls = shuffle(ls).sort((a,b)=>(Number(a.dificuldade||3)-Number(b.dificuldade||3))).slice(0,Number(modeConfig.specificLabSample));
      }
    } else if(!modeConfig.teacherMode){
      if(Number(modeConfig.generalQuestionSamplePerArea) > 0) qs = sampleQuestionsByArea(qs, Number(modeConfig.generalQuestionSamplePerArea));
      if(Number(modeConfig.generalLabSample) > 0) ls = sampleLabsBalanced(ls, Number(modeConfig.generalLabSample));
    }
    const built = buildMission(qs, ls, modeConfig);
    if(!built.length && moduleFilter !== '__all__'){
      logEvent('modulo_vazio', `Módulo sem fases: ${moduleFilter}. Carregando desafio geral.`);
      return buildMission(questions || [], labs || [], modeConfig);
    }
    return built;
  }
  function balancedDifficultySample(list, limit){
    const buckets={1:[],2:[],3:[],4:[],5:[]};
    (list||[]).forEach(item=>buckets[A().level(item.dificuldade)].push(item));
    Object.keys(buckets).forEach(level=>{ buckets[level]=shuffle(buckets[level]); });
    const selected=[];
    const target=[1,2,3,4,5];
    while(selected.length<limit && target.some(level=>buckets[level].length)){
      for(const level of target){
        if(selected.length>=limit) break;
        if(buckets[level].length) selected.push(buckets[level].shift());
      }
    }
    return selected;
  }
  function sampleLabsBalanced(list, limit){
    const shuffled=shuffle(list||[]);
    const selected=[]; const usedAreas=new Set();
    shuffled.sort((a,b)=>Number(a.dificuldade||3)-Number(b.dificuldade||3));
    for(const lab of shuffled){
      if(selected.length>=limit) break;
      if(!usedAreas.has(lab.area)){selected.push(lab);usedAreas.add(lab.area);}
    }
    for(const lab of shuffled){
      if(selected.length>=limit) break;
      if(!selected.includes(lab)) selected.push(lab);
    }
    return selected;
  }

  function sampleQuestionsByArea(list, limit){
    const buckets = {};
    (list || []).forEach(q => (buckets[q.area] ||= []).push(q));
    const selected = [];
    Object.keys(buckets).sort().forEach(area => selected.push(...shuffle([...buckets[area]]).slice(0, limit)));
    return interleaveByArea(selected);
  }

  function buildMission(questions, labs, modeConfig={}){
    const rawQuestions = modeConfig.shuffleQuestions === false ? [...questions] : shuffle([...questions]);
    const rawLabs = modeConfig.shuffleLabs === false ? [...labs] : shuffle([...labs]);
    const questionBuckets = {1:[],2:[],3:[],4:[],5:[]};
    const labBuckets = {1:[],2:[],3:[],4:[],5:[]};
    rawQuestions.forEach(question=>questionBuckets[A().level(question.dificuldade)].push(question));
    rawLabs.forEach(lab=>labBuckets[A().level(lab.dificuldade||4)].push(lab));
    const result=[];
    [1,2,3,4,5].forEach(level=>{
      const levelQuestions=interleaveByArea(shuffle(questionBuckets[level]||[]));
      const levelLabs=interleaveByArea(shuffle(labBuckets[level]||[]));
      const every=Math.max(4,Math.ceil(levelQuestions.length/Math.max(1,levelLabs.length)));
      let labIndex=0;
      levelQuestions.forEach((question,pos)=>{
        result.push({...question,kind:'question'});
        if(levelLabs.length && (pos+1)%every===0 && labIndex<levelLabs.length) result.push({...levelLabs[labIndex++],kind:'lab'});
      });
      while(labIndex<levelLabs.length) result.push({...levelLabs[labIndex++],kind:'lab'});
    });
    return result;
  }
  function interleaveByArea(list){
    const buckets = {};
    list.forEach(q => (buckets[q.area] ||= []).push(q));
    const areas = Object.keys(buckets); const out=[]; let last='';
    while(out.length < list.length){
      areas.sort((a,b)=>buckets[b].length-buckets[a].length);
      const pick = areas.find(a=>buckets[a].length && a!==last) || areas.find(a=>buckets[a].length);
      if(!pick) break; out.push(buckets[pick].shift()); last=pick;
    }
    return out;
  }
  function shuffle(arr){ return R().shuffle(arr); }

  function showPhase(){
    if(finished) return;
    auditLives();
    if(index >= mission.length) return finishGame('finalizado');
    current = mission[index]; selected = null; phaseCompleted = false; phaseProcessing = false; transitionLock = false;
    const currentDifficulty=A().level(current.dificuldade || (current.kind==='lab'?4:2));
    document.body.dataset.difficulty=String(currentDifficulty);
    if(currentDifficulty>lastDifficultyShown){ lastDifficultyShown=currentDifficulty; showLevelTransition(currentDifficulty,current.kind); }

    currentController?.cleanup?.(); currentController = null;
    phaseStartedAt = Date.now(); state.overtime = false; document.body.classList.remove('overtime-prova');
    document.body.classList.remove('phase-enter');
    requestAnimationFrame(()=>document.body.classList.add('phase-enter'));
    applyTheme(current.area); clearFeedback();
    el.next.classList.add('hidden'); el.check.classList.remove('hidden'); el.check.disabled = false;
    el.skipLab.classList.remove('hidden');
    el.skipLab.disabled = false;
    el.skipLab.textContent = current.kind === 'lab' ? 'Pular laboratório' : ((state.mode === 'prova' || isDiagnostic()) ? 'Responder depois' : 'Pular pergunta');
    el.hint.disabled = current.kind === 'lab';
    el.area.textContent = current.area; el.type.textContent = labelType(current.tipo || current.kind);
    const level = Number(current.dificuldade || (current.kind === 'lab' ? 4 : 2));
    if(el.difficulty){ el.difficulty.textContent = `Nível ${level}/5`; el.difficulty.dataset.level = String(level); }
    if(el.skill){ el.skill.textContent = current.habilidade || (current.kind === 'lab' ? 'Prática aplicada' : 'Raciocínio técnico'); el.skill.title = el.skill.textContent; }
    el.title.textContent = current.enunciado || current.title || 'Missão';
    el.desc.textContent = current.desc || (current.kind === 'lab' ? 'Complete o laboratório para registrar a prática. No competitivo, laboratórios também carregam bônus.' : (isDiagnostic() ? 'Responda com calma. O tempo é uma referência e não elimina você do diagnóstico.' : 'Responda com atenção. Você tem 5 vidas, 5 dicas, 5 pulos e uma carta coringa.')); 
    el.areaHint.textContent = areaTip(current.area);
    el.body.innerHTML = '';
    if(el.check){
      el.check.textContent = current.kind === 'lab' ? 'Executar etapa' : 'Confirmar resposta';
      el.check.title = current.kind === 'lab' ? 'Executa ou valida a etapa atual do laboratório.' : 'Valida a resposta atual uma única vez.';
    }
    if(el.timerLabel) el.timerLabel.textContent = isDiagnostic() ? 'Tempo de referência' : 'Tempo competitivo';
    if(current.kind === 'lab') renderLab(); else renderQuestion();
    startTimer(questionTimeFor(current));
    updateHud();
  }

  function renderQuestion(){
    if(current.tipo === 'multipla_escolha') return renderChoice();
    if(['completar_comando','completar_codigo','identificar_saida','completar_frase','terminal','identificar_erro'].includes(current.tipo)) return renderTextQuestion();
    if(current.tipo === 'arrastar_e_soltar') return renderClassifyQuestion();
    if(current.tipo === 'relacionar') return renderMatchQuestion();
    if(current.tipo === 'ordenar_etapas') return renderOrderQuestion();
    renderTextQuestion();
  }
  function renderChoice(){
    const opts = shuffle([...current.alternativas]);
    current._displayOrderTokens = opts.map(option=>option.token);
    const letters = ['A','B','C','D','E','F'];
    el.body.innerHTML = `<div class="choice-grid" role="radiogroup" aria-label="Alternativas">${opts.map((o,pos)=>`<button class="choice" type="button" role="radio" aria-checked="false" data-token="${escapeHtml(o.token)}"><span class="letter">${letters[pos]}</span><span>${escapeHtml(o.texto)}</span></button>`).join('')}</div>`;
    $$('.choice').forEach(btn => btn.addEventListener('click', () => {
      $$('.choice').forEach(other=>{ other.classList.remove('selected'); other.setAttribute('aria-checked','false'); });
      btn.classList.add('selected'); btn.setAttribute('aria-checked','true'); selected = btn.dataset.token; current._selectedPosition = opts.findIndex(option=>option.token===selected)+1;
    }));
  }
  function renderTextQuestion(){
    const terminal = current.tipo === 'terminal' || current.area.includes('CMD');
    const front = current.area.includes('Front-end');
    const python = current.area.includes('Python');
    const inputHtml = terminal ? `<div class="terminal-box"><div class="terminal-history"><span class="terminal-line">C:\\DesafioDS&gt; aguardando comando...</span></div><input id="answerInput" class="terminal-input" spellcheck="false" autocomplete="off" placeholder="Digite aqui"></div>` : `<textarea id="answerInput" class="code-input" spellcheck="false" autocomplete="off" placeholder="Digite sua resposta aqui"></textarea>`;
    const preview = front ? `<div class="preview-card compact-preview"><div id="livePreviewCard" class="fake-card"><h3>Prévia</h3><p>Digite para visualizar</p></div></div>` : python ? `<div class="terminal-box compact-preview"><span class="terminal-line">IDE Python pronta para validar sua resposta.</span></div>` : '';
    el.body.innerHTML = preview ? `<div class="code-preview-layout"><div>${inputHtml}</div>${preview}</div>` : inputHtml;
    const input = $('#answerInput'); input.focus();
    input.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!phaseProcessing && !phaseCompleted) checkCurrent(); } });
    monitorHumanTyping(input);
    if(front) input.addEventListener('input', updateSmallPreview);
  }
  function monitorHumanTyping(input){
    let lastValue = input.value || '';
    let lastTime = Date.now();
    input.addEventListener('drop', e=>{ e.preventDefault(); integrityAlert('arrastar_texto_externo'); feedback('Inserção por arrastar texto foi bloqueada. Digite a resposta manualmente.', 'warn'); }, true);
    input.addEventListener('beforeinput', e=>{ if(e.inputType === 'insertFromDrop' || e.inputType === 'insertFromPaste'){ e.preventDefault(); integrityAlert(e.inputType === 'insertFromDrop' ? 'arrastar_texto_externo' : 'colar_texto'); } });
    input.addEventListener('input', ()=>{
      const now = Date.now();
      const value = input.value || '';
      const added = Math.max(0, value.length - lastValue.length);
      const addedLines = Math.max(0, value.split(/\n/).length - lastValue.split(/\n/).length);
      const elapsed = Math.max(1, now - lastTime);
      const impossible = (added >= 18 && elapsed < 350) || (addedLines >= 2 && elapsed < 1200) || (added >= 45 && elapsed < 1800);
      if(impossible && state.mode !== 'professor'){
        input.value = lastValue;
        integrityAlert('digitacao_humanamente_improvavel');
        feedback('Inserção muito rápida detectada. Digite manualmente para validar a resposta.', 'warn');
        return;
      }
      lastValue = value; lastTime = now;
    });
  }

  function updateSmallPreview(){
    const pv = $('#livePreviewCard'); if(!pv) return;
    const value = $('#answerInput').value;
    pv.innerHTML = `<h3>Prévia</h3><p>${escapeHtml(value || 'A resposta aparecerá aqui')}</p>`;
  }
  function renderClassifyQuestion(){ el.body.innerHTML = window.DS_Labs.classifyHtml(current.items, current.groups); window.DS_Labs.enableDrag(); }
  function renderMatchQuestion(){
    const right = shuffle([...current.right]);
    el.body.innerHTML = `<div class="match-grid">${current.left.map(l=>`<div class="match-row"><strong>${escapeHtml(l)}</strong><select data-left="${escapeHtml(l)}"><option value="">Selecione...</option>${right.map(r=>`<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('')}</select></div>`).join('')}</div>`;
  }
  function renderOrderQuestion(){
    const items = shuffle([...current.items]);
    el.body.innerHTML = `<p class="muted">Arraste os itens para a ordem correta.</p><div class="order-list" id="orderList">${items.map(x=>`<div class="order-item" draggable="true" data-value="${escapeHtml(x)}">${escapeHtml(x)}</div>`).join('')}</div>`;
    enableSortList($('#orderList'));
  }
  function renderLab(){
    try{
      currentController = window.DS_Labs.renderLab(current, {body:el.body,checkBtn:el.check,feedback,completeLab,log:logEvent,integrityAlert});
    }catch(error){
      const message=error?.message||String(error||'erro interno');
      currentController={check(){return false;},cleanup(){}};
      logEvent('erro_render_laboratorio',message);
      el.body.textContent='O laboratório não conseguiu iniciar neste navegador.';
      feedback('Falha controlada ao iniciar o laboratório. Registre o bug ou use “Pular laboratório” para continuar.', 'warn');
      el.skipLab?.classList.remove('hidden');
      if(el.skipLab)el.skipLab.disabled=false;
    }
    const renderedKey = phaseKey();
    setTimeout(()=>{
      if(finished || phaseCompleted || current?.kind !== 'lab' || phaseKey() !== renderedKey) return;
      if(!currentController || typeof currentController.check !== 'function'){
        logEvent('laboratorio_sem_controlador', 'Controlador do laboratório não foi inicializado.');
        feedback('O laboratório não carregou corretamente. Use “Pular laboratório” para continuar sem travar a missão.', 'warn');
        el.skipLab?.classList.remove('hidden');
        if(el.skipLab) el.skipLab.disabled = false;
      }
    }, 1800);
  }

  async function checkCurrent(){
    if(!current || finished || phaseCompleted || phaseProcessing) return;
    auditLives();
    if(current.kind !== 'lab' && state.mode !== 'professor'){
      const elapsedRead = (Date.now()-phaseStartedAt)/1000;
      const minimumRead = A().minimumReadSeconds(current);
      if(elapsedRead < minimumRead){
        feedback(`Leia com atenção antes de confirmar. Esta questão será liberada em ${Math.ceil(minimumRead-elapsedRead)}s.`, 'warn');
        logEvent('resposta_rapida_bloqueada', `Tentativa antes do tempo mínimo de leitura (${minimumRead}s)`);
        return;
      }
    }
    const key = phaseKey();
    if(completedPhaseKeys.has(key)) return;
    if(current.kind === 'lab') {
      current._labAttempts=(current._labAttempts||0)+1;
      phaseProcessing = true;
      el.check.disabled = true;
      try {
        const done = await currentController?.check?.();
        if(done === true || phaseCompleted) { completedPhaseKeys.add(key); return; }
        if(current._labAttempts>=6) feedback('Você já tentou várias vezes. Use a dica do laboratório, registre um bug se algo não responder ou pule para não ficar travado.', 'warn');
      } catch(err) {
        const msg = (err && err.message) ? err.message : String(err || 'erro interno');
        logEvent('erro_laboratorio', `Falha controlada no laboratório: ${msg}`);
        state.integrityIssues.push({reason:'erro_controlado_laboratorio', message:msg, time:new Date().toISOString(), fase:current?.id || null, index:index+1});
        feedback('O laboratório apresentou uma falha controlada. Registre o bug ou pule o laboratório para continuar sem perder o jogo.', 'warn');
      } finally {
        if(!phaseCompleted && !finished){ phaseProcessing = false; el.check.disabled = false; el.skipLab.disabled = false; el.skipLab.classList.remove('hidden'); }
      }
      return;
    }
    phaseProcessing = true;
    el.check.disabled = true;
    try{
      let correct = false;
      if(current.tipo === 'multipla_escolha'){
        if(!selected){ phaseProcessing = false; el.check.disabled = false; return feedback('Selecione uma alternativa antes de confirmar.', 'warn'); }
        correct = await C().verifyAnswer(current, selected);
      } else if(['completar_comando','completar_codigo','identificar_saida','completar_frase','terminal','identificar_erro'].includes(current.tipo)){
        const value = $('#answerInput')?.value || '';
        if(!value.trim()){ phaseProcessing = false; el.check.disabled = false; return feedback('Digite sua resposta antes de confirmar.', 'warn'); }
        correct = await C().verifyAnswer(current, value);
      } else if(current.tipo === 'arrastar_e_soltar') correct = await checkClassify();
      else if(current.tipo === 'relacionar') correct = await checkMatch();
      else if(current.tipo === 'ordenar_etapas') correct = await checkOrder();
      const elapsed = Math.max(0, Math.round((Date.now()-phaseStartedAt)/1000));
      completedPhaseKeys.add(key);
      if(correct) handleCorrect(elapsed); else handleWrong(elapsed);
    } catch(err){
      const msg = (err && err.message) ? err.message : String(err || 'erro interno');
      logEvent('erro_pergunta', `Falha controlada na pergunta: ${msg}`);
      feedback('A pergunta apresentou uma falha controlada. Informe o bug ou avance registrando o problema.', 'warn');
      phaseProcessing = false;
      el.check.disabled = false;
    }
  }
  async function checkClassify(){
    const map = {};
    $$('.drop-zone').forEach(zone=>{ const group=zone.dataset.group; zone.querySelectorAll('.drag-card').forEach(card=>{ map[card.dataset.value] = group; }); });
    return $$('.drop-zone .drag-card').length === current.items.length && C().verifyAnswer(current, map);
  }
  async function checkMatch(){ const map = {}; $$('.match-row select').forEach(sel=>{ map[sel.dataset.left] = sel.value; }); return C().verifyAnswer(current, map); }
  async function checkOrder(){ const chosen = $$('#orderList .order-item').map(x=>x.dataset.value); return C().verifyAnswer(current, chosen); }

  function handleCorrect(elapsed){
    const xp=A().questionXp(current,elapsed,state.combo);
    const multiplier=activeMultiplierValue();
    let gained=scoringEnabled()?Math.round(xp.total*state.multiplierNext*multiplier):0;
    let overtimePenalty=0;
    if(state.overtime && state.mode==='prova' && scoringEnabled()){
      overtimePenalty=Math.max(5,Math.round(gained*.35));
      gained=Math.max(0,gained-overtimePenalty);
    }
    if(scoringEnabled()) changeScore(gained,'acerto');
    if(scoringEnabled()){ state.combo+=1; state.maxCombo=Math.max(state.maxCombo,state.combo); addPower(12+Math.min(12,xp.difficulty*2+xp.paceBonus),'acerto'); } else { state.combo=0; }
    if(state.multiplierNext>1) state.multiplierNext=1;
    recordAnswer(true,elapsed,gained,{fora_do_tempo:state.overtime,desconto_tempo:overtimePenalty,bonus_ritmo:xp.paceBonus,bonus_combo:xp.comboBonus});
    const paceNote=xp.paceBonus?` Ritmo de leitura adequado: +${xp.paceBonus} XP.`:'';
    feedback(isDiagnostic()?`${current.feedback_acerto||'Correto!'} Resposta registrada no diagnóstico.`:`${current.feedback_acerto||'Correto!'} +${gained} XP.${paceNote}${overtimePenalty?` Desconto por tempo: -${overtimePenalty} XP.`:''}`,'ok');
    logEvent('acerto',isDiagnostic()?`Resposta correta • nível ${xp.difficulty}`:`+${gained} XP • nível ${xp.difficulty}`);
    updatePerformanceTheme(); endPhasePause(); updateHud();
  }
  function handleWrong(elapsed, reason='erro'){
    const isLanguageBonus = current.area === 'Inglês Técnico — Bônus' || current.area === 'Espanhol Técnico — Bônus';
    let loss = 0, lostLife = false, shieldUsed = false;
    if(isCompetitive() && !isLanguageBonus){
      if(state.shield > 0){ state.shield--; shieldUsed = true; logEvent('escudo', 'Escudo absorveu um erro'); }
      else { setLives(state.lives - 1); lostLife = true; loss = Math.max(10, Math.round(state.score * 0.06)); changeScore(-loss, 'erro'); }
    }
    state.combo = 0;
    recordAnswer(false, elapsed, -loss, {lostLife, shieldUsed, fora_do_tempo:state.overtime});
    const modeNote = (state.mode === 'prova' || isDiagnostic()) ? ' Diagnóstico: o erro foi registrado sem perder vida.' : '';
    feedback(`${current.feedback_erro || 'Incorreto.'}${loss ? ` -${loss} XP.` : ''}${modeNote}`, 'bad');
    logEvent(reason, loss ? `-${loss} XP` : (shieldUsed ? 'escudo usado' : 'erro registrado'));
    updateHud();
    if(isCompetitive() && state.lives <= 0){ endPhasePause(); return openCompetitiveExit('sem_vidas'); }
    updatePerformanceTheme(); endPhasePause();
  }
  function recordAnswer(correct, elapsed, points, extra={}){
    const area = current.area;
    state.stats[area] ||= {acertos:0, erros:0, total:0, tempoTotal:0};
    state.stats[area].total++; state.stats[area].tempoTotal += elapsed; if(correct) state.stats[area].acertos++; else state.stats[area].erros++;
    const difficulty = Number(current.dificuldade || 2);
    const skill = current.habilidade || 'Raciocínio técnico';
    state.difficultyStats[difficulty] ||= {acertos:0, erros:0, total:0, tempoTotal:0};
    state.difficultyStats[difficulty].total++; state.difficultyStats[difficulty].tempoTotal += elapsed; if(correct) state.difficultyStats[difficulty].acertos++; else state.difficultyStats[difficulty].erros++;
    state.skillStats[skill] ||= {acertos:0, erros:0, total:0, tempoTotal:0};
    state.skillStats[skill].total++; state.skillStats[skill].tempoTotal += elapsed; if(correct) state.skillStats[skill].acertos++; else state.skillStats[skill].erros++;
    state.answers.push({id:current.id, area, tipo:current.tipo, dificuldade:difficulty, nivel_cognitivo:current.nivel_cognitivo || null, habilidade:skill, competencias:[...(current.competencias||[])], tecnologias:[...(current.tecnologias||[])], idiomas:[...(current.idiomas||[])], correto:correct, tempo_segundos:elapsed, pontos:points, fase:index+1, posicao_selecionada:current._selectedPosition||null, ordem_alternativas_hash:current._displayOrderTokens?C().fastIntegrity(current._displayOrderTokens.join('|')):null, ...extra});
    if(state.mode === 'prova' && current?.id) delete state.pendingProva[current.id];
    if(isDiagnostic() && current?.id) delete state.pendingDiagnostic[current.id];
  }
  function endPhasePause(){ phaseCompleted = true; phaseProcessing = true; timerSeq++; clearInterval(timerId); document.body.classList.remove('overtime-prova'); el.check.disabled = true; el.check.classList.add('hidden'); el.hint.disabled = true; el.skipLab.disabled = true; el.skipLab.classList.add('hidden'); el.next.classList.remove('hidden'); updateMissionProgress(); }
  function nextPhase(){ if(transitionLock || finished) return; transitionLock = true; index++; phaseCompleted = false; phaseProcessing = false; if(el.skipLab) el.skipLab.disabled = false; showPhase(); }

  function completeLab(item, info={}){
    if(phaseCompleted || finished || completedPhaseKeys.has(phaseKey())) return true;
    completedPhaseKeys.add(phaseKey()); phaseProcessing = true; clearInterval(timerId);
    const elapsed = Math.round((Date.now()-phaseStartedAt)/1000);
    let points = scoringEnabled() ? Math.round((info.points || item.pontuacao || 50) * activeMultiplierValue()) : 0;
    if(scoringEnabled()){ changeScore(points, 'laboratorio'); addPower(30, 'laboratorio'); applyLabPower(info.power); }
    state.labs.push({id:item.id, area:item.area, dificuldade:A().level(item.dificuldade||4), habilidade:item.habilidade||'Prática aplicada', competencias:[...(item.competencias||[])], tecnologias:[...(item.tecnologias||[])], idiomas:[...(item.idiomas||[])], concluido:true, pulado:false, tempo_segundos:elapsed, pontos:points, power:scoringEnabled()?info.power:null, detail:info.detail || {}, fase:index+1});
    state.stats[item.area] ||= {acertos:0, erros:0, total:0, tempoTotal:0}; state.stats[item.area].total++; state.stats[item.area].tempoTotal += elapsed; state.stats[item.area].acertos++;
    feedback(isDiagnostic()?'Laboratório concluído e registrado no diagnóstico.':`Laboratório concluído! +${points} XP e power-up aplicado.`, 'ok');
    logEvent('laboratorio', `${item.enunciado} concluído`); updatePerformanceTheme(); endPhasePause(); updateHud(); return true;
  }
  function skipCurrentPhase(){
    if(!current || finished || phaseCompleted || completedPhaseKeys.has(phaseKey())) return;
    if(phaseProcessing && current.kind !== 'lab') return;
    if(phaseProcessing && current.kind === 'lab'){ phaseProcessing = false; el.check.disabled = false; }

    if(current.kind === 'question' && (state.mode === 'prova' || isDiagnostic())){
      const diagnostic=isDiagnostic();
      const map=diagnostic?state.pendingDiagnostic:state.pendingProva;
      const count=map[current.id]||0;
      const totalLimit=diagnostic?(CONFIG.diagnosticPostponeLimit||5):Infinity;
      const perQuestionLimit=diagnostic?1:2;
      if(count>=perQuestionLimit || (diagnostic && state.diagnosticPostpones>=totalLimit)){
        feedback(diagnostic?`Você já usou os ${totalLimit} adiamentos ou esta pergunta já voltou. Responda para concluir o diagnóstico.`:'Esta pergunta já foi adiada 2 vezes. Agora responda para continuar a prova.','warn');
        logEvent('adiamento_bloqueado',`Pergunta ${current.id}`); return;
      }
      phaseProcessing=true; clearInterval(timerId); map[current.id]=count+1;
      if(diagnostic) state.diagnosticPostpones++;
      const moved={...current,pending:true,postponedCount:count+1,diagnosticPostponed:diagnostic||current.diagnosticPostponed};
      mission.splice(index,1); mission.push(moved);
      showPowerToast(diagnostic?`Pergunta guardada (${state.diagnosticPostpones}/${totalLimit})`:'Pergunta enviada para pendentes');
      logEvent('pergunta_pendente',diagnostic?`Adiada no diagnóstico (${state.diagnosticPostpones}/${totalLimit})`:`Pergunta adiada para o final (${count+1}/2)`);
      phaseProcessing=false; showPhase(); return;
    }

    if(current.kind === 'question' && isCompetitive()){
      const maxSkips=CONFIG.maxChallengeSkips||5;
      if(state.challengeSkips>=maxSkips){ feedback(`Você já utilizou os ${maxSkips} pulos desta rodada. Responda para continuar.`,'warn'); return; }
    }
    phaseProcessing=true; completedPhaseKeys.add(phaseKey()); clearInterval(timerId);
    const elapsed=Math.max(0,Math.round((Date.now()-phaseStartedAt)/1000));
    if(current.kind==='lab'){
      state.labs.push({id:current.id,area:current.area,dificuldade:A().level(current.dificuldade||4),habilidade:current.habilidade||'Prática aplicada',competencias:[...(current.competencias||[])],tecnologias:[...(current.tecnologias||[])],idiomas:[...(current.idiomas||[])],concluido:false,pulado:true,tempo_segundos:elapsed,pontos:0,fase:index+1});
      state.stats[current.area]||={acertos:0,erros:0,total:0,tempoTotal:0};state.stats[current.area].total++;state.stats[current.area].tempoTotal+=elapsed;state.stats[current.area].erros++;
      feedback('Laboratório pulado. Ele ficará registrado como não concluído.','warn');logEvent('lab_pulado',current.enunciado);
    }else{
      let loss=0,lossPct=0;
      if(isCompetitive()){
        const percents=CONFIG.challengeSkipLossPercents||[10,15,20,25,30];lossPct=percents[Math.min(state.challengeSkips,percents.length-1)]||30;state.challengeSkips++;
        loss=Math.min(state.score,Math.max(10,Math.round(state.score*(lossPct/100))||10));changeScore(-loss,'pulo_pergunta');
      }
      state.combo=0;recordAnswer(false,elapsed,-loss,{pulado:true,perdeu_vida:false,pulo_numero:state.challengeSkips||0,perda_percentual:lossPct});
      feedback(isCompetitive()?`Pergunta pulada. Pulo ${state.challengeSkips}/${CONFIG.maxChallengeSkips||5}. Perda de ${lossPct}% do XP (-${loss}).`:'Pergunta registrada como não respondida.','warn');
      logEvent('pergunta_pulada',isCompetitive()?`-${loss} XP (${lossPct}%)`:'sem XP');
    }
    endPhasePause();updateHud();
  }
  function phaseTimeout(){
    if(!current || finished || phaseCompleted || completedPhaseKeys.has(phaseKey())) return;
    if(phaseProcessing && current.kind !== 'lab') return;
    if(phaseProcessing && current.kind === 'lab'){ phaseProcessing=false;el.check.disabled=false; }
    const elapsed=Math.round((Date.now()-phaseStartedAt)/1000);
    if(isCompetitive() && current.kind==='question'){
      phaseProcessing=true; logEvent('tempo_competitivo_esgotado','Escolha entre diagnóstico completo ou encerramento');
      return openCompetitiveExit('tempo_esgotado');
    }
    if(isDiagnostic()){
      state.overtime=true;document.body.classList.add('overtime-prova');
      feedback('O tempo de referência terminou, mas o diagnóstico continua. Responda com calma para completar a amostra.','warn');
      logEvent('tempo_referencia_esgotado','Diagnóstico continuou sem eliminação');phaseProcessing=false;el.check.disabled=false;el.skipLab.disabled=false;return;
    }
    if(current.kind==='lab'){
      completedPhaseKeys.add(phaseKey());phaseProcessing=true;
      state.labs.push({id:current.id,area:current.area,dificuldade:A().level(current.dificuldade||4),habilidade:current.habilidade||'Prática aplicada',competencias:[...(current.competencias||[])],tecnologias:[...(current.tecnologias||[])],idiomas:[...(current.idiomas||[])],concluido:false,tempo_esgotado:true,tempo_segundos:elapsed,pontos:0,fase:index+1});
      state.stats[current.area]||={acertos:0,erros:0,total:0,tempoTotal:0};state.stats[current.area].total++;state.stats[current.area].erros++;state.stats[current.area].tempoTotal+=elapsed;
      feedback('Tempo do laboratório esgotado. Você avançou sem receber o bônus.','warn');logEvent('lab_tempo',current.enunciado);endPhasePause();updateHud();return;
    }
    state.overtime=true;document.body.classList.add('overtime-prova');
    feedback('Tempo indicado esgotado. Você ainda pode responder, com registro de resposta fora do tempo.','warn');
    logEvent('tempo_extra_prova','Aluno continuou após o tempo indicado');phaseProcessing=false;completedPhaseKeys.delete(phaseKey());el.check.disabled=false;
  }
  function applyLabPower(power){
    if(!scoringEnabled()) return;
    if(power === 'hint') state.hints = Math.min(5, state.hints + 1);
    else if(power === 'shield') state.shield += 1;
    else if(power === 'next2x') state.multiplierNext = 2;
    else if(power === 'points') changeScore(50, 'power_laboratorio');
    else if(power === 'life_or_points') { if(isCompetitive() && state.maxLives && state.lives < state.maxLives) setLives(state.lives + 1); else changeScore(50, 'power_laboratorio'); }
    state.powerups.push({tipo:power, origem:'laboratorio', momento:new Date().toISOString(), fase:index+1});
    showPowerToast(powerLabel(power));
  }

  function getQuestionHints(q){
    if(Array.isArray(q?.hints) && q.hints.length) return q.hints.slice(0,4);
    const area = q?.area || '';
    const tipo = q?.tipo || '';
    const hints = [];
    if(tipo === 'multipla_escolha'){
      hints.push('Leia todas as alternativas antes de escolher. Normalmente há uma opção que troca o conceito principal.');
      hints.push('Elimine alternativas que misturam áreas diferentes ou usam termos fora do contexto da pergunta.');
      hints.push('Procure a alternativa mais completa e coerente com a área indicada no topo da fase.');
    } else if(String(tipo).includes('completar_comando') || area.includes('CMD')){
      hints.push('Pense no comando principal antes do nome da pasta, arquivo ou caminho.');
      hints.push('No terminal, espaços e ordem dos comandos fazem diferença. Digite apenas o trecho solicitado.');
      hints.push('Comandos comuns desta missão: mkdir, cd, dir, ren, cls, tree /f.');
    } else if(String(tipo).includes('codigo') || area.includes('Python') || area.includes('Front-end') || area.includes('SQL')){
      hints.push('Observe a sintaxe: símbolos, parênteses, dois-pontos, ponto, aspas e chaves podem mudar tudo.');
      hints.push('Digite apenas o que completa a lacuna ou responde ao enunciado, sem texto extra.');
      hints.push('Compare mentalmente entrada, processamento e saída esperada antes de confirmar.');
    } else if(tipo === 'arrastar_e_soltar' || tipo === 'relacionar' || tipo === 'ordenar_etapas'){
      hints.push('Organize primeiro os itens mais fáceis e depois resolva os que sobraram.');
      hints.push('Pense na ordem lógica do processo: início, entrada, processamento, decisão, saída e fim.');
      hints.push('Confira se todos os cartões foram posicionados antes de confirmar.');
    } else {
      hints.push('Volte ao conceito principal da área e procure palavras-chave no enunciado.');
      hints.push('Pense em como isso seria usado em uma situação real de Desenvolvimento de Sistemas.');
      hints.push('Elimine respostas que parecem genéricas demais ou que pertencem a outra área.');
    }
    return hints;
  }

  function useHint(){
    if(!current || current.kind === 'lab' || phaseCompleted || phaseProcessing) return;
    const hints = getQuestionHints(current);
    const key = current.id || phaseKey();
    const usedHere = state.hintUsage[key] || 0;
    const maxPerQuestion = Math.min(3, hints.length);
    if(usedHere >= maxPerQuestion){ feedback('Não há mais dicas diferentes para esta pergunta.', 'warn'); return; }
    if(state.hints <= 0){ feedback('Você não tem mais dicas disponíveis neste jogo.', 'warn'); return; }
    const usedTotal = (MODES[state.mode]?.baseHints || 5) - state.hints + 1;
    const cost = Math.min(160, 20 * Math.pow(2, Math.min(usedTotal-1, 3)));
    state.hints--; state.hintUsage[key] = usedHere + 1; if(scoringEnabled()) changeScore(-cost, 'dica');
    feedback(`Dica ${usedHere+1}/${maxPerQuestion}: ${hints[usedHere]}${scoringEnabled()?` (-${cost} XP)`:''}`, 'warn');
    logEvent('dica', `Dica ${usedHere+1}/${maxPerQuestion}${scoringEnabled()?`: -${cost} XP`:''}`); updateHud();
  }
  function addPower(amount, source){
    if(!scoringEnabled()) return;
    if(state.power >= 100) return;
    state.power = Math.min(100, state.power + amount);
    if(state.power >= 100 && !state.powerReadyNotified){
      state.powerReadyNotified = true;
      logEvent('power_pronto', `Power-up carregado por ${source}`);
      document.body.classList.add('power-ready');
      showPowerToast('POWER-UP DISPONÍVEL — CLIQUE EM ATIVAR');
    }
  }
  async function activatePower(){
    if(!scoringEnabled() || state.power < 100 || finished || phaseCompleted || phaseProcessing) return;
    state.power = 0; state.powerReadyNotified = false; document.body.classList.remove('power-ready');
    const options = ['double_xp','shield','tempo','recuperar'];
    if(current?.tipo === 'multipla_escolha' && $$('.choice:not(:disabled)').length >= 3) options.push('eliminar');
    const power = options[Math.floor(Math.random()*options.length)];
    if(power === 'double_xp'){
      activePower = {type:'double_xp', until:Date.now()+10000};
      document.body.classList.add('double-xp-active');
      setTimeout(()=>{ if(activePower?.type === 'double_xp' && Date.now() > activePower.until){ activePower = null; document.body.classList.remove('double-xp-active'); updateHud(); } }, 10100);
      feedback('DOUBLE XP liberado por 10 segundos!', 'ok');
    }
    if(power === 'shield'){
      state.shield++;
      feedback('Escudo ativado. O próximo erro não tira vida no Modo Desafio.', 'ok');
    }
    if(power === 'eliminar'){
      const removed = await eliminateChoicesSafe();
      feedback(removed ? 'Power-up: duas alternativas incorretas foram removidas. A resposta correta foi preservada.' : 'Power-up convertido: não havia alternativas suficientes. +30 segundos nesta fase.', removed ? 'ok' : 'warn');
      if(!removed){ timerDeadline += 30000; timeLeft += 30; updateTimer(); }
    }
    if(power === 'tempo'){
      timerDeadline += 30000; timeLeft += 30; updateTimer();
      feedback('Power-up: +30 segundos nesta fase.', 'ok');
    }
    if(power === 'recuperar'){
      const add = Math.max(30, Math.round(state.score * .12));
      changeScore(add, 'recuperar_xp');
      feedback(`Recuperação parcial: +${add} XP.`, 'ok');
    }
    state.powerups.push({tipo:power, origem:'barra_power', momento:new Date().toISOString(), fase:index+1});
    logEvent('powerup', power); showPowerToast(powerLabel(power)); updateHud();
  }
  function activeMultiplierValue(){ if(activePower?.type === 'double_xp' && Date.now() <= activePower.until) return 2; if(activePower?.type === 'double_xp' && Date.now() > activePower.until){ activePower = null; document.body.classList.remove('double-xp-active'); } return 1; }
  async function eliminateChoicesSafe(){
    if(current?.tipo !== 'multipla_escolha') return false;
    const wrong = [];
    for(const btn of $$('.choice:not(:disabled)')){
      const isRight = await C().verifyAnswer(current, btn.dataset.token);
      if(!isRight) wrong.push(btn);
    }
    const removeCount = Math.min(2, wrong.length);
    if(removeCount <= 0) return false;
    shuffle(wrong).slice(0, removeCount).forEach(btn=>{
      btn.disabled = true;
      btn.classList.add('choice-eliminated');
      btn.style.opacity = .25;
      btn.setAttribute('aria-disabled','true');
    });
    return true;
  }
  function showPowerToast(text){ if(!el.powerToast) return; el.powerToast.textContent = text; el.powerToast.classList.remove('hidden'); setTimeout(()=>el.powerToast.classList.add('hidden'), 1800); }
  function powerLabel(power){ return ({hint:'+1 DICA', shield:'ESCUDO ATIVO', next2x:'2X NA PRÓXIMA', points:'+50 XP', life_or_points:'+VIDA OU +50 XP', double_xp:'DOUBLE XP', eliminar:'ELIMINAR 2 OPÇÕES', tempo:'+30 SEGUNDOS', recuperar:'RECUPERAÇÃO DE XP'})[power] || 'POWER-UP'; }

  function openCompetitiveExit(reason){
    if(!isCompetitive() || finished) return finishGame(reason);
    state.competitiveFailureReason=reason;timerSeq++;clearInterval(timerId);
    if(el.competitiveExitTitle) el.competitiveExitTitle.textContent=reason==='tempo_esgotado'?'O tempo competitivo terminou':'Suas cinco vidas terminaram';
    if(el.competitiveExitMessage) el.competitiveExitMessage.textContent=reason==='tempo_esgotado'
      ? 'Você pode continuar o diagnóstico completo sem XP e sem ranking, ou encerrar esta tentativa competitiva agora.'
      : 'Seu erro já foi registrado. Você pode seguir para as próximas perguntas no diagnóstico completo ou encerrar a rodada competitiva.';
    el.competitiveExitModal?.classList.remove('hidden');
  }
  function continueAsDiagnostic(){
    const reason=state.competitiveFailureReason||'mudanca_manual';
    state.competitiveAbandoned=true;state.competitiveAbandonedReason=reason;state.competitiveScoreBeforeSwitch=state.score;
    state.playStyle='diagnostico';state.playStyleLabel='Diagnóstico completo';if(state.xpLedger)state.xpLedger.status='COMPETITIVE_ABANDONED';state.score=0;state.expectedScore=0;state.maxLives=null;state.lives=999;state.combo=0;state.power=0;state.shield=0;state.multiplierNext=1;state.extraCards=0;activePower=null;state.overtime=false;state.competitiveFailureReason='';
    document.body.classList.remove('competitive-style','power-ready','double-xp-active');document.body.classList.add('diagnostic-style');
    el.competitiveExitModal?.classList.add('hidden');protectState();logEvent('competitivo_abandonado',`Continuação em diagnóstico completo: ${reason}`);updateHud();
    feedback('Modo competitivo desativado. Continue até o final para obter um diagnóstico pedagógico completo.','warn');
    if(phaseCompleted) nextPhase(); else {phaseProcessing=false;completedPhaseKeys.delete(phaseKey());el.check.disabled=false;startTimer(questionTimeFor(current));}
  }
  function openExtraCardModal(){
    if(!isCompetitive()) return feedback('A carta coringa é um recurso exclusivo do modo competitivo.','warn');
    if(state.extraCards<=0) return feedback('A carta coringa desta tentativa já foi utilizada.','warn');
    if(!current || phaseCompleted || finished) return;
    el.extraCardModal?.classList.remove('hidden');
  }
  async function useExtraCard(action){
    if(!isCompetitive() || state.extraCards<=0) return;
    state.extraCards--;el.extraCardModal?.classList.add('hidden');
    let applied=action;
    if(action==='tempo'){timerDeadline+=60000;timeLeft+=60;updateTimer();feedback('Carta coringa: +60 segundos nesta fase.','ok');}
    else if(action==='escudo'){state.shield++;feedback('Carta coringa: escudo ativado para o próximo erro.','ok');}
    else if(action==='eliminar'){
      const removed=await eliminateChoicesSafe();
      if(removed) feedback('Carta coringa: até duas alternativas incorretas foram eliminadas.','ok');
      else {timerDeadline+=60000;timeLeft+=60;updateTimer();applied='tempo_substituto';feedback('Esta questão não permite eliminar opções. A carta foi convertida em +60 segundos.','warn');}
    }
    state.powerups.push({tipo:'carta_'+applied,origem:'carta_extra',momento:new Date().toISOString(),fase:index+1});logEvent('carta_extra',applied);updateHud();
  }

  function startTimer(seconds){
    clearInterval(timerId);
    const seq = ++timerSeq;
    timerDeadline = Date.now() + Math.max(1, Number(seconds || 60)) * 1000;
    const tick = () => {
      if(seq !== timerSeq || finished || phaseCompleted) return;
      timeLeft = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
      updateTimer();
      if(timeLeft <= 0){ clearInterval(timerId); phaseTimeout(); }
    };
    tick();
    timerId = setInterval(tick, 250);
  }
  function updateTimer(){ const m = String(Math.floor(timeLeft/60)).padStart(2,'0'); const s = String(timeLeft%60).padStart(2,'0'); el.timer.textContent = `${m}:${s}`; }

  function showLevelTransition(level,kind){
    if(!el.levelTransition || state.mode==='professor') return;
    const names={1:'Fundamentos',2:'Aplicação',3:'Integração',4:'Análise avançada',5:'Especialista'};
    const messages={1:'Comece com atenção: os fundamentos sustentam todas as próximas fases.',2:'Agora você precisa aplicar os conceitos em situações técnicas.',3:'Os desafios passam a combinar conteúdos e exigir interpretação.',4:'Fase avançada: compare alternativas próximas e justifique decisões.',5:'Nível especialista: arquitetura, segurança, desempenho e análise crítica.'};
    el.levelTransitionKicker.textContent=kind==='lab'?'LABORATÓRIO DESBLOQUEADO':'NOVA FASE';
    el.levelTransitionTitle.textContent=`Nível ${level} — ${names[level]}`;
    el.levelTransitionMessage.textContent=messages[level];
    el.levelTransition.classList.remove('hidden');
    el.levelTransition.dataset.level=String(level);
    setTimeout(()=>el.levelTransition?.classList.add('hidden'),1450);
  }
  function updatePerformanceTheme(){
    const total=state.answers.length;
    const correct=state.answers.filter(item=>item.correto).length;
    const rate=total?correct/total:0;
    document.body.classList.remove('performance-warm','performance-hot','performance-elite');
    if(total>=5 && rate>=.9 && state.combo>=5) document.body.classList.add('performance-elite');
    else if(total>=4 && rate>=.78 && state.combo>=3) document.body.classList.add('performance-hot');
    else if(total>=3 && rate>=.62) document.body.classList.add('performance-warm');
  }

  function updateHud(){
    auditLives(false);auditScore(false);
    document.body.classList.toggle('power-ready', scoringEnabled() && state.power >= 100 && !finished);
    document.body.classList.toggle('diagnostic-style',isDiagnostic());document.body.classList.toggle('competitive-style',isCompetitive());
    if(activeMultiplierValue()===1)document.body.classList.remove('double-xp-active');
    if(el.modeHud)el.modeHud.textContent=`${styleLabel()} • ${state.moduleLabel}`;
    if(el.scoreLabel)el.scoreLabel.textContent=isDiagnostic()?'XP competitivo':'Pontuação XP';
    el.score.textContent=isDiagnostic()?'DESATIVADO':state.score;
    el.scoreBar.style.width=scoringEnabled()?Math.min(100,state.score/10)+'%':'0%';
    if(isDiagnostic())el.lives.innerHTML='<span class="gold-life">SEM ELIMINAÇÃO</span>';
    else if(state.mode==='prova')el.lives.innerHTML='<span class="gold-life">∞ PROVA</span>';
    else if(state.mode==='professor')el.lives.innerHTML='<span class="gold-life">PROFESSOR</span>';
    else el.lives.innerHTML=Array.from({length:state.maxLives||5},(_,i)=>i<state.lives?'<span class="heart alive">♥</span>':'<span class="heart lost">♥</span>').join(' ');
    el.hints.textContent=state.hints;
    if(el.skips){
      const used=isDiagnostic()?state.diagnosticPostpones:state.mode==='prova'?Object.keys(state.pendingProva||{}).length:state.challengeSkips;
      const limit=isDiagnostic()?(CONFIG.diagnosticPostponeLimit||5):state.mode==='prova'?'↻':(CONFIG.maxChallengeSkips||5);
      el.skips.textContent=state.mode==='prova'?`${used} pend.`:`${used}/${limit}`;
    }
    el.combo.textContent=isDiagnostic()?'—':state.combo+'x';
    el.power.style.width=scoringEnabled()?state.power+'%':'0%';el.activatePower.disabled=!scoringEnabled()||state.power<100;el.activatePower.classList.toggle('ready',scoringEnabled()&&state.power>=100);
    if(el.extraCard){el.extraCard.disabled=!isCompetitive()||state.extraCards<=0;el.extraCard.textContent=isCompetitive()?`Carta extra ×${state.extraCards}`:'Carta competitiva';}
    el.powerStatus.textContent=isDiagnostic()?'XP, combo e power-ups desativados no diagnóstico':activePower?.type==='double_xp'?'DOUBLE XP ativo':state.power>=100?'Power-up desbloqueado: clique em ATIVAR':`Carregando ${state.power}%`;
    updateMissionProgress();
  }

  function updateMissionProgress(){
    if(!el.progress || !el.progressText) return;
    const total = mission.length || 0;
    const completed = total ? Math.min(index + (phaseCompleted ? 1 : 0), total) : 0;
    const pct = total ? Math.round(completed / total * 100) : 0;
    const questionsDone = mission.slice(0, Math.min(index, total)).filter(x => x.kind === 'question').length + (current?.kind === 'question' && phaseCompleted ? 1 : 0);
    const labsDone = mission.slice(0, Math.min(index, total)).filter(x => x.kind === 'lab').length + (current?.kind === 'lab' && phaseCompleted ? 1 : 0);
    const currentIsQuestion = current?.kind === 'question' && !phaseCompleted;
    const currentQuestionNumber = mission.slice(0, Math.min(index, total)).filter(x => x.kind === 'question').length + (currentIsQuestion ? 1 : 0);
    const remainingQuestions = Math.max(0, missionQuestionTotal - questionsDone - (currentIsQuestion ? 1 : 0));
    const phaseLabel = total ? `Fase ${Math.min(index + 1, total)}/${total}` : 'Fase 0/0';
    const questionLabel = currentIsQuestion ? `Pergunta ${currentQuestionNumber}/${missionQuestionTotal}` : current?.kind === 'lab' ? `Laboratório ${labsDone + (phaseCompleted ? 0 : 1)}/${missionLabTotal}` : `Perguntas ${questionsDone}/${missionQuestionTotal}`;
    const pendingCount = state.mode === 'prova' ? Object.keys(state.pendingProva || {}).length : isDiagnostic() ? Object.keys(state.pendingDiagnostic || {}).length : 0;
    el.progress.style.width = pct + '%'; el.progress.style.setProperty('--progress-color', progressColor(pct));
    el.progressText.textContent = `${phaseLabel} • ${questionLabel} • faltam ${remainingQuestions} perguntas${pendingCount ? ` • pendentes: ${pendingCount}` : ''} • ${pct}%`; 
  }
  function progressColor(pct){ if(pct >= 92) return '#22e982'; if(pct >= 70) return '#56f39a'; if(pct >= 45) return '#ffd33d'; if(pct >= 20) return '#ff9f2d'; return getComputedStyle(document.body).getPropertyValue('--class-accent').trim() || 'var(--accent)'; }

  function setLives(n){ if(state.mode === 'prova' || isDiagnostic()) return; state.lives = Math.max(0, Math.min(state.maxLives || 5, n)); protectState(); }
  function changeScore(delta, source='ajuste'){
    if(!scoringEnabled()) return;
    if(!window.DS_Terms?.isAccepted?.()){integrityAlert('recompensa_sem_termo');return;}
    const maxSingle = CONFIG.maxSingleXpChange || 800;
    const now = Date.now();
    state.xpTimeline = (state.xpTimeline || []).filter(x => now - x.time < 1200);
    state.xpTimeline.push({time:now, delta, source, fase:index+1});
    const rapidGain = state.xpTimeline.filter(x => x.delta > 0).reduce((a,b)=>a+b.delta,0);
    const suspicious=Math.abs(delta)>maxSingle||rapidGain>maxSingle;
    const status=suspicious?'UNDER_REVIEW':'APPROVED';
    const result=window.DS_XPLedger?.append?.(state.xpLedger,{type:delta>=0?'REWARD':'PENALTY',amount:delta,status,source,sourceId:current?.id||'',metadata:{fase:index+1,area:current?.area||''}});
    if(!result?.ok){integrityAlert('xp_ledger_bloqueado');return;}
    const before=state.expectedScore||0;
    state.expectedScore=Math.max(0,Number(result.balances.available)||0);
    state.score=state.expectedScore;
    state.events.push({type:'xp',message:`${source}: ${delta>=0?'+':''}${delta} XP${status==='UNDER_REVIEW'?' em análise':''}`,time:new Date().toISOString(),fase:current?.id||null,index:index+1,antes:before,depois:state.score,transactionId:result.transaction.id,status});
    if(suspicious)integrityAlert('variacao_xp_suspeita');
    protectState();
  }
  function protectState(){
    state.lifeVault = {value:btoa(String((state.lives || 0) ^ 73)), sig:C().fastIntegrity(`${state.mode}|${state.lives}|${state.expectedScore}|${state.combo}|${state.shield}`)};
    state.scoreVault = {value:btoa(String((state.expectedScore || 0) ^ 131)), sig:C().fastIntegrity(`${state.mode}|${state.expectedScore}|${state.lives}|${state.combo}|${state.shield}`)};
  }
  function auditLives(strict=true){
    if(!state.lifeVault) return;
    const expected = btoa(String((state.lives || 0) ^ 73)); const sig = C().fastIntegrity(`${state.mode}|${state.lives}|${state.expectedScore}|${state.combo}|${state.shield}`);
    if((state.lifeVault.value !== expected || state.lifeVault.sig !== sig) && strict) return integrityAlert('integridade_vida');
    protectState();
  }
  function auditScore(strict=false){
    if(!state.scoreVault)return;
    const ledgerCheck=window.DS_XPLedger?.reconcile?.(state.xpLedger)||{valid:true,balances:{available:state.expectedScore||0},issues:[]};
    const ledgerScore=Math.max(0,Number(ledgerCheck.balances?.available)||0);
    const val=btoa(String(ledgerScore^131));
    const sig=C().fastIntegrity(`${state.mode}|${ledgerScore}|${state.lives}|${state.combo}|${state.shield}`);
    const tampered=state.score!==ledgerScore||state.expectedScore!==ledgerScore||state.scoreVault.value!==val||state.scoreVault.sig!==sig||!ledgerCheck.valid;
    const maxReasonable=Math.max(2500,mission.length*220+state.labs.length*200+1000);
    state.expectedScore=ledgerScore;state.score=ledgerScore;
    if(tampered||ledgerScore>maxReasonable){window.DS_XPLedger?.block?.(state.xpLedger,'xp_suspeito');if(strict||tampered||ledgerScore>maxReasonable)integrityAlert('xp_suspeito');}
    protectState();
  }
  function integrityAlert(reason){
    const now = Date.now();
    state.lastIntegrityAt ||= {};
    if(state.lastIntegrityAt[reason] && now - state.lastIntegrityAt[reason] < 900) return;
    state.lastIntegrityAt[reason] = now;
    const max = CONFIG.maxSecurityWarnings || 4;
    const next = Math.min(max, (state.hardWarnings || 0) + 1);
    securityWarning(reason, (state.warnings || 0) + 1, max, {severity:'hard', hardWarnings:next});
    if(next >= max) securityStrike(reason);
  }

  function securityWarning(reason, warnings, max, meta={severity:'hard'}){
    if(!gameStarted || finished || state.rescuePending) return;
    state.warnings = Math.max(state.warnings || 0, warnings || 1);
    if(meta.severity === 'hard') state.hardWarnings = Math.max(state.hardWarnings || 0, meta.hardWarnings || 1);
    state.integrityIssues.push({reason, severity:meta.severity || 'evidence', warnings:state.warnings, hardWarnings:meta.hardWarnings || null, max, time:new Date().toISOString(), fase:current?.id || null, index:index+1});
    if(meta.severity === 'hard') showIntegrityOverlay(reason, meta.hardWarnings || state.warnings, max);
    logEvent(meta.severity === 'hard' ? 'alerta_integridade' : 'evento_integridade', `${reason} (${meta.severity === 'hard' ? 'crítico' : 'evidência'})`);
  }
  function securityStrike(reason){
    if(!gameStarted || finished) return;
    if(state.mode === 'prova') return openRescueModal(reason);
    finishGame('strike_' + reason);
  }
  let lastSirenAt = 0;
  function playIntegritySiren(){
    const now = Date.now();
    if(now - lastSirenAt < 1200) return;
    lastSirenAt = now;
    try{
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if(!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square'; oscillator.frequency.setValueAtTime(620, context.currentTime);
      gain.gain.setValueAtTime(.045, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .22);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .23);
      oscillator.addEventListener('ended', ()=>context.close());
    }catch(e){}
  }

  function showIntegrityOverlay(reason, warnings, max){
    const overlay = document.getElementById('securityOverlay');
    const countEl = document.getElementById('securityCount');
    const msgEl = document.getElementById('securityMessage');
    playIntegritySiren();
    if(!overlay) return;
    overlay.classList.remove('hidden');
    overlay.classList.add('danger-pulse');
    if(countEl) countEl.textContent = `${warnings}/${max}`;
    if(msgEl) msgEl.textContent = warnings >= max ? 'Limite de alertas atingido.' : `Ação suspeita detectada: ${reason}. Restam ${Math.max(0, max - warnings)} alerta(s).`;
    setTimeout(()=>{ overlay.classList.add('hidden'); overlay.classList.remove('danger-pulse'); }, 1900);
  }

  function applyTheme(area){ document.body.classList.remove(...Object.values(themeByArea)); document.body.classList.add(themeByArea[area] || 'theme-cmd'); }
  function feedback(msg, type){ el.feedback.textContent = msg; el.feedback.className = 'feedback ' + (type || 'warn'); }
  function clearFeedback(){ el.feedback.textContent = ''; el.feedback.className = 'feedback hidden'; }
  function logEvent(type, message){ state.events.push({type, message, time:new Date().toISOString(), fase:current?.id || null, index:index+1}); logLocal(`${type}: ${message}`); }
  function logLocal(text){ if(!el.eventLog) return; const div = document.createElement('div'); div.textContent = text; el.eventLog.prepend(div); while(el.eventLog.children.length > 12) el.eventLog.lastChild.remove(); }

  function openBugModal(){
    if(!gameStarted || finished || !current) return;
    if(el.bugText) el.bugText.value = '';
    if(el.bugType) el.bugType.value = 'erro_pergunta';
    el.bugModal?.classList.remove('hidden');
    setTimeout(()=>el.bugText?.focus(), 50);
  }
  function closeBugModal(){ el.bugModal?.classList.add('hidden'); }
  function saveBugReport(){
    const text = (el.bugText?.value || '').trim();
    if(!text) { if(el.bugText) el.bugText.focus(); return; }
    state.bugReports.push({fase:index+1, id:current?.id || null, area:current?.area || null, tipo:current?.tipo || current?.kind || null, categoria:el.bugType?.value || 'outro', enunciado:current?.enunciado || null, relato:sanitizeText(text,600), time:new Date().toISOString()});
    logEvent('bug_reportado', `Bug informado na fase ${index+1}`);
    closeBugModal();
    feedback('Bug registrado. Ele aparecerá no relatório final.', 'ok');
  }
  function finishByBugReport(){
    const categoria = el.bugType?.value || 'travamento';
    const text = (el.bugText?.value || '').trim() || 'Aluno encerrou por bug/travamento sem descrição detalhada.';
    state.bugReports.push({fase:index+1, id:current?.id || null, area:current?.area || null, tipo:current?.tipo || current?.kind || null, categoria, enunciado:current?.enunciado || null, relato:sanitizeText(text,600), encerramento:true, time:new Date().toISOString()});
    logEvent('encerrado_por_bug', `Aluno encerrou a missão por bug: ${categoria}`);
    closeBugModal();
    finishGame('desistencia_bug');
  }

  function openRescueModal(reason){
    state.rescuePending = true;
    timerSeq++; clearInterval(timerId);
    logEvent('resgate_prova', `Aguardando liberação do professor: ${reason}`);
    if(el.rescueStatus) el.rescueStatus.textContent = '';
    if(el.rescuePassword) el.rescuePassword.value = '';
    if(el.rescueTeacherName) el.rescueTeacherName.value = '';
    if(el.rescueReason) el.rescueReason.value = '';
    el.rescueModal?.classList.remove('hidden');
    setTimeout(()=>el.rescueTeacherName?.focus(), 50);
  }
  async function confirmRescue(){
    const professor=sanitizeText(el.rescueTeacherName?.value||'',80);const justificativa=sanitizeText(el.rescueReason?.value||'',500);
    if(!professor||!justificativa){if(el.rescueStatus){el.rescueStatus.textContent='Informe professor e justificativa.';el.rescueStatus.className='mode-status warn';}return;}
    try{
      await window.DS_EduAuth.authorize({actionId:'prova-rescue',classId:state.turma||'__all__',subjectId:'prova-ds',lessonId:'prova-geral',activityId:'principal',resourceId:current?.id||'prova-geral',teacher:professor,reason:justificativa});
      const log={horario:new Date().toISOString(),professor,justificativa,fase:current?.id||null,index:index+1,mode:'SESSION_SCOPED_PIN'};state.rescueLogs.push(log);state.rescuePending=false;state.warnings=0;state.hardWarnings=0;el.rescueModal?.classList.add('hidden');logEvent('prova_liberada',`Autorização EduAuth individual. Motivo: ${justificativa}`);feedback('Prova liberada pelo professor para esta sessão.','ok');startTimer(Math.max(30,timeLeft||current?.time||60));
    }catch(error){if(el.rescueStatus){el.rescueStatus.textContent=error?.message||'Autorização não confirmada.';el.rescueStatus.className='mode-status bad';}}
  }

  function evaluateSampleQuality(){
    const total=Math.max(0,missionQuestionTotal||0),answered=state.answers.length;
    const percent=total?Math.round(answered/total*100):0;
    const missionAreas=new Set(mission.filter(item=>item.kind==='question').map(item=>item.area).filter(Boolean));
    const answeredAreas=new Set(state.answers.map(item=>item.area).filter(Boolean));
    const coverage=missionAreas.size?Math.round(answeredAreas.size/missionAreas.size*100):0;
    const minAnswered=Math.min(total,Math.max(Number(CONFIG.minimumDiagnosticAnsweredAbsolute)||8,Math.ceil(total*(Number(CONFIG.minimumDiagnosticAnsweredPercent)||60)/100)));
    const minCoverage=Number(CONFIG.minimumAreaCoveragePercent)||50;
    const enough=answered>=minAnswered && coverage>=minCoverage;
    const reasons=[];
    if(answered<minAnswered)reasons.push(`respondeu ${answered} de no mínimo ${minAnswered} perguntas`);
    if(coverage<minCoverage)reasons.push(`cobriu ${coverage}% das áreas; mínimo recomendado ${minCoverage}%`);
    return {enough,answered,total,answeredPercent:percent,answeredAreas:answeredAreas.size,totalAreas:missionAreas.size,coveragePercent:coverage,minAnswered,minCoverage,reasons};
  }

  async function finishGame(reason){
    if(!gameStarted || finished) return; finished=true;timerSeq++;clearInterval(timerId);document.body.classList.remove('game-active');
    state.endedBy=reason||'finalizado';const totalSeconds=Math.round((Date.now()-startedAt)/1000);
    const ledgerIntegrity=window.DS_XPLedger?.reconcile?.(state.xpLedger);if(ledgerIntegrity&&!ledgerIntegrity.valid)state.integrityIssues.push({reason:'xp_ledger_inconsistente',severity:'hard',issues:ledgerIntegrity.issues,time:new Date().toISOString()});
    if(isCompetitive() && state.lives===state.maxLives && reason==='finalizado'){changeScore(120,'bonus_invencibilidade');logEvent('bonus_invencibilidade','+120 XP');}
    const summary=await buildSummary(totalSeconds);summary.payload_checksum=C().fastIntegrity(JSON.stringify(summary));const token=await C().encryptToken(summary);state.tokenChecksum=C().fastIntegrity(token);
    el.game.classList.remove('active');el.start.classList.remove('active');el.result.classList.add('active');
    const status=statusLabel(reason),sample=summary.qualidade_amostra||{};
    if(isDiagnostic()){
      el.resultTitle.textContent=state.competitiveAbandoned?'Diagnóstico concluído — competitivo desativado':'Diagnóstico concluído';
      el.resultMessage.textContent=sample.enough?'Você concluiu o diagnóstico pedagógico. O relatório mostra proficiência e áreas de estudo, sem XP ou classificação competitiva.':summary.mensagem_final;
    }else{el.resultTitle.textContent=status.titulo;el.resultMessage.textContent=`${status.descricao} ${summary.mensagem_final}`;}
    el.finalScore.textContent=isDiagnostic()?'—':state.score;
    if(el.resultModeNotice){
      const modeClass=!sample.enough?'insufficient':isDiagnostic()?'diagnostic':'competitive';
      const title=!sample.enough?'Amostra insuficiente para classificação':isDiagnostic()?(state.competitiveAbandoned?'Modo competitivo desativado durante a tentativa':'Diagnóstico completo sem competição'):'Resultado competitivo';
      const body=!sample.enough?`Foram respondidas ${sample.answered||0}/${sample.total||0} perguntas, com cobertura de ${sample.coveragePercent||0}% das áreas. Não serão indicados cargo, nível profissional ou premiação.`:isDiagnostic()?'O relatório pedagógico é válido, mas XP, ranking, premiação e comparação competitiva não se aplicam.':'Vidas, tempo, XP, pulos e power-ups fizeram parte desta rodada.';
      el.resultModeNotice.className=`result-mode-notice ${modeClass}`;el.resultModeNotice.innerHTML=`<strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p>`;
    }
    el.resultStats.innerHTML=statHtml('Situação',status.situacao)+statHtml('Experiência',styleLabel())+statHtml('Banco',state.bankName)+statHtml('Módulo',state.moduleLabel)+statHtml('Versão',CONFIG.appVersion||'v20')+statHtml('Jogador',state.player)+statHtml('Turma',state.turma)+statHtml('Tempo',formatTime(totalSeconds))+statHtml('Média/pergunta',summary.tempo_medio_pergunta);
    el.resultStats.innerHTML+=statHtml('Perguntas respondidas',`${sample.answered||state.answers.length}/${sample.total||missionQuestionTotal}`)+statHtml('Cobertura de áreas',`${sample.coveragePercent||0}%`)+statHtml('Acertos',summary.acertos)+statHtml('Erros',summary.erros)+statHtml('Precisão bruta',summary.precisao+'%')+statHtml('Proficiência ponderada',sample.enough?summary.proficiencia_geral.indice+'%':'Amostra insuficiente')+statHtml('Nível técnico',summary.proficiencia_geral.nivel)+statHtml('Vidas',summary.vidas_restantes)+statHtml('Dicas restantes',summary.dicas_restantes)+statHtml('Pulos usados',isDiagnostic()?state.diagnosticPostpones:state.challengeSkips);
    if(sample.enough){el.resultStats.innerHTML+=statHtml('Premiação',summary.premiacao)+statHtml('Trilha/cargo indicado',summary.cargo_indicado);}
    if(state.competitiveAbandoned)el.resultStats.innerHTML+=statHtml('XP antes da mudança',state.competitiveScoreBeforeSwitch);
    const xpSnapshot=summary.xp_extrato||{};if(!isDiagnostic()){el.resultStats.innerHTML+=statHtml('XP disponível',xpSnapshot.balances?.available??0)+statHtml('XP em análise',xpSnapshot.balances?.pending??0)+statHtml('XP bloqueado',xpSnapshot.balances?.blocked??0);}
    const weightedAreas=summary.proficiencias?.areas||{};
    el.areaReport.innerHTML=Object.entries(weightedAreas).sort((a,b)=>b[1].percent-a[1].percent).map(([area,item])=>{const enoughArea=Number(item.total||0)>=(Number(CONFIG.minimumAreaQuestionsForProfile)||2);return `<div class="area-row ${enoughArea?'':'area-insufficient'}"><strong>${escapeHtml(area)}</strong><div class="progress-line"><i style="width:${S().safeStylePercent(enoughArea?item.percent:0)}"></i></div><p>${item.correct}/${item.total} acertos • ${enoughArea?`proficiência ${item.percent}% • ${escapeHtml(item.level)}`:'amostra insuficiente nesta área'}</p></div>`;}).join('');
    if(!Object.keys(weightedAreas).length)el.areaReport.innerHTML='<div class="integrity-panel"><h3>Sem dados suficientes</h3><p>Responda mais perguntas para gerar o desempenho por área.</p></div>';
    if(el.proficiencyOverview)el.proficiencyOverview.innerHTML=buildProficiencyOverview(summary);
    if(el.competencyReport)el.competencyReport.innerHTML=buildCompetencyReport(summary);
    if(el.learningReport)el.learningReport.innerHTML=buildLearningReport(summary);
    if(summary.divergencias.length||summary.bugs_reportados.length||summary.alertas_integridade)el.areaReport.innerHTML+=`<div class="integrity-panel"><h3>Integridade e feedback</h3><p>Eventos registrados: ${summary.alertas_integridade}. Alertas críticos: ${summary.alertas_criticos}. Divergências: ${summary.divergencias.length?escapeHtml(summary.divergencias.join(' | ')):'nenhuma'}.</p></div>`;
    if(summary.bugs_reportados.length)el.areaReport.innerHTML+=`<div class="bug-report-list"><h3>Bugs informados pelo aluno</h3>${summary.bugs_reportados.map(b=>`<div class="bug-report-item"><strong>Fase ${b.fase} • ${escapeHtml(b.area||'')}</strong><p>${escapeHtml(b.relato)}</p></div>`).join('')}</div>`;
    el.tokenBox.value=token;if(el.tokenPrint)el.tokenPrint.textContent=token;el.resultStats.innerHTML+=statHtml('Comprovante ID',state.tokenChecksum);logLocal('Resultado gerado. Baixe o comprovante ou o PDF antes de sair.');document.dispatchEvent(new CustomEvent('ds:challenge-result',{detail:{...summary,comprovanteId:state.tokenChecksum}}));window.DS_Schedule?.setActivityContext?.({resultReady:true,exportPending:true,classroomOpened:false});
  }
  async function buildSummary(totalSeconds){
    const answerCorrect = state.answers.filter(a=>a.correto).length;
    const answerWrong = state.answers.filter(a=>!a.correto).length;
    const labCorrect = state.labs.filter(l=>l.concluido).length;
    const labWrong = state.labs.filter(l=>!l.concluido).length;
    const unansweredQuestions = Math.max(0, missionQuestionTotal - state.answers.length);
    const acertosEtapas = answerCorrect + labCorrect;
    const errosEtapas = answerWrong + labWrong;
    const acertos = answerCorrect;
    const totalBasedPrecision = state.mode === 'prova' || isDiagnostic() || String(state.endedBy || '').includes('desistencia') || String(state.endedBy || '').includes('bug');
    const erros = answerWrong + (totalBasedPrecision ? unansweredQuestions : 0);
    const precisionBase = totalBasedPrecision ? missionQuestionTotal : Math.max(1, state.answers.length);
    const totalAnswered = acertos + erros;
    const areas = {};
    Object.entries(state.stats).forEach(([area,s])=>{ const avg = s.total ? Math.round((s.tempoTotal || 0)/s.total) : 0; areas[area] = {acertos:s.acertos, erros:s.erros, total:s.total, percentual:s.total ? Math.round(s.acertos/s.total*100) : 0, tempo_medio:formatTimeShort(avg)}; });
    const dificuldades = {};
    Object.entries(state.difficultyStats).forEach(([level,s])=>{ dificuldades[level] = {acertos:s.acertos, erros:s.erros, total:s.total, percentual:s.total ? Math.round(s.acertos/s.total*100) : 0, tempo_medio_segundos:s.total ? Math.round(s.tempoTotal/s.total) : 0}; });
    const habilidades = {};
    Object.entries(state.skillStats).forEach(([skill,s])=>{ habilidades[skill] = {acertos:s.acertos, erros:s.erros, total:s.total, percentual:s.total ? Math.round(s.acertos/s.total*100) : 0, tempo_medio_segundos:s.total ? Math.round(s.tempoTotal/s.total) : 0}; });
    let bestArea = Object.entries(areas).sort((a,b)=>b[1].percentual-a[1].percentual || b[1].acertos-a[1].acertos)[0]?.[0] || '';
    let msg = 'Você ainda está evoluindo. Revise os conceitos e tente novamente para melhorar sua pontuação.';
    if(bestArea.includes('Python')) msg = 'Você mandou bem em programação! Continue praticando lógica, funções e códigos.';
    else if(bestArea.includes('Banco')) msg = 'Você teve ótimo desempenho em SQL e organização de dados.';
    else if(bestArea.includes('Front')) msg = 'Você se destacou na parte visual e estrutural das páginas.';
    else if(acertos > erros) msg = 'Boa missão! Você demonstrou domínio em várias áreas de Desenvolvimento de Sistemas.';
    const userInfo = await collectClientInfo();
    const precision = precisionBase ? Math.round(acertos/precisionBase*100) : 0;
    const proficiencies=P().aggregate(state.answers,state.labs);
    const overallProficiency=P().overall(state.answers,state.labs,state.warnings,totalSeconds);
    const minimumSessionSeconds=Number(MODES[state.mode]?.minimumSessionSeconds)||0;
    if(state.mode!=='professor' && minimumSessionSeconds>0 && totalSeconds<minimumSessionSeconds){
      const ratio=totalSeconds/minimumSessionSeconds;
      const durationCap=ratio<.35?44:ratio<.65?59:74;
      overallProficiency.index=Math.min(overallProficiency.index,durationCap);
      overallProficiency.caps=[...(overallProficiency.caps||[]),`duração abaixo da referência pedagógica de ${Math.round(minimumSessionSeconds/60)} minutos`];
      overallProficiency.level=P().levelLabel(overallProficiency.index,overallProficiency.total,overallProficiency.advanced);
    }
    const sample=evaluateSampleQuality();
    const partialIndex=overallProficiency.index;
    let careerRecommendations=sample.enough?P().careerRecommendations(proficiencies.competencies):[];
    let awardRank=sample.enough && !isDiagnostic()?P().award(overallProficiency.index,overallProficiency.advanced||0,overallProficiency.breadth,state.warnings):(isDiagnostic()?'Sem classificação competitiva':'Sem classificação');
    let career=sample.enough?(careerRecommendations[0]?.role||'Trilha técnica em desenvolvimento'):'Não indicado — amostra insuficiente';
    if(!sample.enough){
      overallProficiency.index=null;overallProficiency.partialIndex=partialIndex;overallProficiency.level='Amostra insuficiente';
      overallProficiency.caps=[...(overallProficiency.caps||[]),...sample.reasons];
      msg=`Amostra insuficiente para indicar nível, cargo ou trilha profissional. Responda pelo menos ${sample.minAnswered} perguntas e cubra ${sample.minCoverage}% das áreas.`;
    }
    const award={rank:awardRank,level:overallProficiency.level,career};
    return {
      versao:CONFIG.appVersion || 'modular', banco:state.bankKey, banco_nome:state.bankName, banco_versao:state.bankVersion, modulo:state.moduleFilter, modulo_label:state.moduleLabel, modo:state.mode, modo_label:styleLabel(), estilo:state.playStyle, competitivo_abandonado:state.competitiveAbandoned, motivo_abandono_competitivo:state.competitiveAbandonedReason, jogador:state.player, turma:state.turma,
      inicio:new Date(startedAt).toISOString(), fim:new Date().toISOString(), duracao_segundos:totalSeconds, tempo_total:formatTime(totalSeconds), tempo_medio_pergunta:formatTimeShort(avgSeconds(state.answers.map(a=>a.tempo_segundos))), tempo_medio_fase:formatTimeShort(avgSeconds([...state.answers.map(a=>a.tempo_segundos), ...state.labs.map(l=>l.tempo_segundos || 0)])),
      pontuacao:isDiagnostic()?null:state.score, pontuacao_competitiva_antes_da_mudanca:state.competitiveScoreBeforeSwitch||0, vidas_restantes:(state.mode === 'prova' || isDiagnostic()) ? 'não se aplica' : state.lives, dicas_restantes:state.hints, combo_maximo:state.maxCombo, escudos_restantes:state.shield, encerramento:state.endedBy, situacao:statusLabel(state.endedBy).situacao,
      acertos, erros, precisao: precision, premiacao:award.rank, cargo_indicado:award.career, nivel_profissional:award.level, base_precisao: totalBasedPrecision ? 'total de perguntas do módulo/banco' : 'perguntas respondidas até o encerramento', perguntas_corretas:answerCorrect, perguntas_incorretas:answerWrong, perguntas_nao_respondidas:unansweredQuestions, acertos_etapas:acertosEtapas, erros_etapas:errosEtapas, laboratorios_concluidos:labCorrect, laboratorios_nao_concluidos:labWrong, pulos_desafio_usados:state.challengeSkips, perguntas_pendentes_prova:Object.keys(state.pendingProva || {}).length,
      total_fases:mission.length, total_perguntas:missionQuestionTotal, total_laboratorios:missionLabTotal, perguntas_respondidas:state.answers.length, qualidade_amostra:sample, tempo_minimo_referencia_segundos:minimumSessionSeconds, sessao_abaixo_da_referencia:minimumSessionSeconds>0&&totalSeconds<minimumSessionSeconds, divergencias:checkDivergences(acertos, erros, totalAnswered),
      areas, dificuldades, habilidades, proficiencia_geral:{indice:overallProficiency.index,indice_parcial:overallProficiency.partialIndex??overallProficiency.index,nivel:overallProficiency.level,percentual_ponderado:overallProficiency.percent,percentual_avancado:overallProficiency.advanced,cobertura_areas:overallProficiency.breadth,respostas_rapidas_percentual:overallProficiency.fastRatio,limitadores:overallProficiency.caps}, proficiencias:proficiencies, trilhas_indicadas:careerRecommendations, melhor_area:bestArea, mensagem_final:msg, termo_compromisso:window.DS_Terms?.evidence?.()||{status:'não validado'}, permissoes_utilizadas:window.DS_ProfileManager?.getPath?.('permissions.history',[])?.slice(-20)||[], xp_extrato:window.DS_XPLedger?.snapshot?.(state.xpLedger)||null, avaliacao:{metodo:'proficiência e evidências',xpInfluenciaNota:false,moedasInfluenciamNota:false}, respostas:state.answers, laboratorios:state.labs, powerups:state.powerups, bugs_reportados:state.bugReports, eventos:state.events, alertas_integridade:state.warnings, alertas_criticos:state.hardWarnings, detalhes_integridade:state.integrityIssues, liberacoes_professor:state.rescueLogs, modo_professor:state.mode === 'professor', sessao:state.sessionId, cliente:userInfo
    };
  }
  function checkDivergences(acertos, erros, totalAnswered){
    const issues = [];
    if(state.answers.length > missionQuestionTotal) issues.push('Quantidade de respostas maior que o total de perguntas.');
    if(state.mode === 'prova' && state.answers.length < missionQuestionTotal) issues.push('Prova encerrada com pergunta(s) sem resposta registrada.');
    if(acertos > mission.length) issues.push('Quantidade de acertos maior que o total de fases.');
    if(totalAnswered > mission.length) issues.push('Total respondido maior que o total de fases.');
    const answeredXp = state.answers.reduce((sum,item)=>sum+Math.max(0,Number(item.pontos)||0),0);
    const labXp = state.labs.reduce((sum,item)=>sum+Math.max(0,Number(item.pontos)||0),0);
    const maxReasonable = Math.max(5000, answeredXp + labXp + state.powerups.length * 800 + mission.length * 120 + 2500);
    const xpCheck=window.DS_XPLedger?.reconcile?.(state.xpLedger);
    if(state.score > maxReasonable) issues.push('Pontuação acima do limite esperado.');
    if(xpCheck&&!xpCheck.valid)issues.push('Extrato de XP com inconsistência.');
    if(state.hardWarnings >= (CONFIG.maxSecurityWarnings || 4)) issues.push('Limite de alertas críticos de integridade atingido.');
    return issues;
  }

  async function collectClientInfo(){
    return {
      idioma:navigator.language,
      timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewport:{largura:innerWidth, altura:innerHeight},
      online:navigator.onLine,
      fullscreen_solicitado:state.fullscreenRequested,
      privacidade:'Nenhum IP, geolocalização ou organização de rede foi coletado.'
    };
  }


  function statusLabel(reason){
    if(String(reason || '').startsWith('strike')) return {titulo:'Game Over — Strike', situacao:'Encerrado por integridade', descricao:'A missão foi encerrada por ações bloqueadas repetidas.'};
    if(reason === 'sem_vidas') return {titulo:'Game Over', situacao:'Sem vidas', descricao:'Suas vidas acabaram no Modo Desafio.'};
    if(reason === 'tempo_esgotado') return {titulo:'Game Over — Tempo esgotado', situacao:'Tempo esgotado', descricao:'O tempo acabou no Modo Desafio.'};
    if(reason === 'desistencia_bug') return {titulo:'Encerrado por bug', situacao:'Encerrado por desistência/bug', descricao:'O aluno informou problema técnico e encerrou a missão.'};
    if(reason === 'strike_integridade_prova') return {titulo:'Prova encerrada', situacao:'Encerrado por integridade', descricao:'A prova foi encerrada após alertas de integridade.'};
    if(reason === 'integridade_vida') return {titulo:'Game Over — Integridade', situacao:'Alteração suspeita', descricao:'A missão foi encerrada por alteração suspeita no estado do jogo.'};
    if(reason === 'finalizado') return {titulo:'Missão finalizada', situacao:'Finalizado', descricao:'Missão concluída.'};
    return {titulo:'Missão encerrada', situacao:String(reason || 'Encerrado'), descricao:'A missão foi encerrada.'};
  }
  function statHtml(label, value){ return `<div class="stat"><span>${label}</span><b>${escapeHtml(value)}</b></div>`; }
  function buildProficiencyOverview(summary){
    const general=summary.proficiencia_geral||{},careers=summary.trilhas_indicadas||[],sample=summary.qualidade_amostra||{};
    if(!sample.enough){
      return `<div class="sample-insufficient-panel"><span class="terminal-label">AMOSTRA INSUFICIENTE</span><h2>Não há base para indicar nível ou cargo</h2><p>Foram respondidas <strong>${sample.answered||0}</strong> de <strong>${sample.total||0}</strong> perguntas, com cobertura de <strong>${sample.coveragePercent||0}%</strong> das áreas.</p><p>Para gerar uma leitura confiável, responda pelo menos ${sample.minAnswered||0} perguntas e alcance ${sample.minCoverage||0}% de cobertura. O índice parcial não será utilizado para premiação, cargo ou curso indicado.</p></div>`;
    }
    const caps=(general.limitadores||[]).length?`<p class="proficiency-caps"><strong>Limitações aplicadas:</strong> ${escapeHtml(general.limitadores.join(', '))}.</p>`:'';
    const careerHtml=careers.length?`<div class="career-grid">${careers.map((item,pos)=>`<article class="career-card"><span>${pos+1}ª trilha</span><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.role)}</p><b>${item.score}% de aderência observada</b></article>`).join('')}</div>`:'<div class="sample-note">Nenhuma trilha profissional foi indicada nesta tentativa.</div>';
    return `<div class="proficiency-hero"><div class="proficiency-gauge" style="--value:${Math.max(0,Math.min(100,Number(general.indice)||0))}"><span>PROFICIÊNCIA</span><strong>${Number(general.indice)||0}%</strong><small>${escapeHtml(general.nivel||'Não avaliado')}</small></div><div class="proficiency-copy"><span class="terminal-label">PERFIL TÉCNICO</span><h2>Leitura geral do desempenho</h2><p>O índice pondera dificuldade, desempenho avançado, cobertura de áreas, ritmo e integridade. A indicação é educacional e não substitui certificação ou experiência profissional.</p>${caps}</div></div>${careerHtml}`;
  }
  function buildCompetencyReport(summary){
    const profiles=summary.proficiencias||{};
    const note=summary.qualidade_amostra?.enough?'':'<div class="sample-note">Indicadores parciais: a amostra geral não atingiu o mínimo para classificação.</div>';
    return `<div class="report-heading"><div><span class="terminal-label">MAPA DE PROFICIÊNCIAS</span><h2>Competências, tecnologias e idiomas</h2></div><p>Cada indicador usa somente os desafios que realmente avaliaram aquele conteúdo.</p></div>${note}<div class="competency-grid"><section class="learning-card"><h3>Trilhas técnicas</h3>${buildMetricRows(profiles.competencies,14)}</section><section class="learning-card"><h3>Tecnologias e linguagens</h3>${buildMetricRows(profiles.technologies,14)}</section><section class="learning-card"><h3>Idiomas técnicos</h3>${buildMetricRows(profiles.languages,8)}</section></div>`;
  }
  function buildMetricRows(group,limit){
    const entries=Object.entries(group||{}).sort((a,b)=>b[1].total-a[1].total||b[1].percent-a[1].percent).slice(0,limit);
    if(!entries.length)return '<p class="muted">A missão não reuniu amostra suficiente para este indicador.</p>';
    return `<div class="metric-list">${entries.map(([name,item])=>`<div class="metric-row"><div><strong>${escapeHtml(name)}</strong><span>${item.correct}/${item.total} • ${escapeHtml(item.level)}</span></div><div class="metric-row-bar"><i style="width:${S().safeStylePercent(item.percent)}"></i><b>${item.percent}%</b></div></div>`).join('')}</div>`;
  }

  function buildLearningReport(summary){
    const difficultyRows = [1,2,3,4,5].map(level=>{
      const item = summary.dificuldades?.[level] || {acertos:0,erros:0,total:0,percentual:0,tempo_medio_segundos:0};
      const mastery = masteryLabel(item.percentual, item.total);
      return `<div class="difficulty-row" data-level="${level}"><div class="difficulty-name"><b>Nível ${level}</b><span>${mastery}</span></div><div class="dual-metric"><div class="metric-track" aria-label="${item.percentual}% de acerto"><i style="width:${item.percentual}%"></i></div><strong>${item.total ? item.percentual + '%' : '—'}</strong></div><small>${item.total} questão(ões) • média ${item.tempo_medio_segundos}s</small></div>`;
    }).join('');
    const skillRows = Object.entries(summary.habilidades || {}).sort((a,b)=>b[1].total-a[1].total).map(([skill,item])=>`<div class="skill-row"><div><strong>${escapeHtml(skill)}</strong><span>${item.acertos}/${item.total} acertos • ${item.tempo_medio_segundos}s em média</span></div><div class="skill-meter"><i style="width:${item.percentual}%"></i><b>${item.percentual}%</b></div></div>`).join('') || '<p class="muted">Ainda não há respostas suficientes para calcular habilidades.</p>';
    return `<div class="report-heading"><div><span class="terminal-label">LEITURA PEDAGÓGICA</span><h2>Como foi seu desempenho</h2></div><p>Os gráficos consideram acerto, dificuldade e tempo. Eles indicam pontos de estudo; não substituem a avaliação do professor.</p></div><div class="learning-grid"><section class="learning-card"><h3>Domínio por dificuldade</h3><div class="difficulty-chart">${difficultyRows}</div></section><section class="learning-card"><h3>Habilidades avaliadas</h3><div class="skill-chart">${skillRows}</div></section></div>`;
  }
  function masteryLabel(percent, total){
    if(!total) return 'não avaliado';
    if(percent >= 80) return 'domínio consistente';
    if(percent >= 60) return 'em desenvolvimento';
    return 'prioridade de revisão';
  }
  async function copyToken(){
    const token = el.tokenBox.value || '';
    let copied = false;
    try{
      if(navigator.clipboard?.writeText){const result=await window.DS_Permissions?.explain?.('clipboard-write',()=>navigator.clipboard.writeText(token));copied=!!result?.allowed;}
    }catch(e){ copied = false; }
    if(!copied){
      try{ el.tokenBox.focus(); el.tokenBox.select(); document.execCommand('copy'); copied = true; }catch(e2){ copied = false; }
    }
    el.copyToken.textContent = copied ? 'Comprovante copiado' : 'Selecione e copie o comprovante';
    setTimeout(()=>el.copyToken.textContent='Copiar comprovante', 1600);
  }
  function markResultExported(format){
    if(el.resultExportStatus){el.resultExportStatus.textContent=`Resultado exportado (${format})`;el.resultExportStatus.classList.add('done');}
    window.DS_Schedule?.setActivityContext?.({resultReady:true,exportPending:false});
  }
  function openResultClassroom(){
    if(!window.DS_Classroom?.open)return alert('O seletor do Classroom não foi carregado. Atualize a página.');
    window.DS_Classroom.open({source:'resultado-desafio',onOpen:selection=>{
      if(el.resultClassroomStatus){el.resultClassroomStatus.textContent=`Classroom de ${selection.disciplineLabel} aberto — entrega não confirmada`;el.resultClassroomStatus.classList.add('done');}
      window.DS_Schedule?.setActivityContext?.({classroomOpened:true});
    }});
  }
  function downloadResult(){
    const blob = new Blob([el.tokenBox.value], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    const safeName = C().normalizeText(state.player || 'resultado').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'resultado';
    a.href = URL.createObjectURL(blob);
    a.download = `desafio-ds-${state.mode || 'modo'}-${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    markResultExported('TXT');
  }

  function phaseKey(){ return `${index}:${current?.id || 'fase'}:${current?.kind || 'kind'}`; }
  function createSessionId(){
    const bytes = crypto.getRandomValues(new Uint8Array(5));
    return Array.from(bytes, value=>value.toString(16).padStart(2,'0')).join('').toUpperCase();
  }
  function labelType(t){ return String(t).replaceAll('_',' '); }
  function areaTip(area){
    if(area.includes('CMD')) return 'Terminal e infraestrutura: comandos, caminhos, permissões e organização de arquivos.';
    if(area.includes('Python')) return 'Programação: lógica, funções, estruturas de dados, depuração e legibilidade.';
    if(area.includes('SQL') || area.includes('Banco')) return 'Dados: modelagem, integridade, consultas, índices e transações.';
    if(area.includes('Front')) return 'Front-end: HTML semântico, CSS, JavaScript, acessibilidade e desempenho.';
    if(area.includes('Back')) return 'Back-end: APIs, autenticação, contratos, cloud e observabilidade.';
    if(area.includes('Análise')) return 'Análise: requisitos, processos, modelagem, validação e rastreabilidade.';
    if(area.includes('Segurança')) return 'Segurança: validação, codificação de saída, autenticação, criptografia e defesa em profundidade.';
    if(area.includes('Dados')) return 'Ciência de dados: qualidade, preparação, interpretação e visualização responsável.';
    if(area.includes('Hardware')) return 'Hardware: arquitetura, gargalos, memória, armazenamento e diagnóstico técnico.';
    if(area.includes('UX')) return 'UX/UI: hierarquia, acessibilidade, feedback, consistência e usabilidade.';
    if(area.includes('Inglês')) return 'Inglês técnico: tickets, documentação, logs e comunicação profissional.';
    if(area.includes('Espanhol')) return 'Espanhol técnico: incidencias, despliegues, registros y comunicación profesional.';
    if(area.includes('Inovação')) return 'Produto e inovação: problema, hipótese, MVP, evidência e priorização.';
    return 'Missão multidisciplinar aplicada ao Desenvolvimento de Sistemas.';
  }
  function avgSeconds(arr){ const clean = arr.filter(n=>Number.isFinite(n)); return clean.length ? Math.round(clean.reduce((a,b)=>a+b,0)/clean.length) : 0; }
  function formatTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m}min ${String(s).padStart(2,'0')}s`; }
  function formatTimeShort(sec){ return `${sec}s`; }
  function sanitizeText(value, max=600){ return S().text(value,max); }
  function escapeHtml(value){ return S().escapeHtml(value); }
  function enableSortList(list){ let dragged = null; list.querySelectorAll('.order-item').forEach(item=>{ item.addEventListener('dragstart',()=>dragged=item); item.addEventListener('dragover',e=>e.preventDefault()); item.addEventListener('drop',e=>{ e.preventDefault(); if(dragged && dragged!==item){ const rect=item.getBoundingClientRect(); const after=e.clientY > rect.top + rect.height/2; list.insertBefore(dragged, after ? item.nextSibling : item); } }); }); }

  document.addEventListener('DOMContentLoaded', init);
})();
