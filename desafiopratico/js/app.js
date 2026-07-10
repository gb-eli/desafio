(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const C = () => window.DS_Crypto;
  const CONFIG = window.DS_CONFIG || {appVersion:'sem-config', maxSecurityWarnings:4, modes:{}};
  const MODES = CONFIG.modes || {};
  const BANKS = window.DS_BANKS || {};
  const SECURE_BANKS = window.DS_SECURE_BANKS || {};
  const BANK_MANIFEST = window.DS_BANK_MANIFEST || {};
  const bankScriptCache = new Set();
  const decryptedBanks = {};
  let unlockedPassword = '';
  let activeBank = {questions:[], labs:[], version:'sem-banco', nome:'Banco não carregado'};

  const el = {
    start: $('#startScreen'), game: $('#gameScreen'), result: $('#resultScreen'), form: $('#startForm'), name: $('#playerName'), turma: $('#playerClass'),
    modePass: $('#modePassword'), unlockMode: $('#unlockModeBtn'), modeStatus: $('#modeUnlockStatus'), modeBadge: $('#modeBadge'), startBtn: $('#startBtn'), moduleWrap: $('#moduleSelectWrap'), moduleSelect: $('#moduleSelect'),
    playerHud: $('#playerHud'), modeHud: $('#modeHud'), score: $('#scoreHud'), scoreBar: $('#scoreBar'), lives: $('#livesHud'), hints: $('#hintsHud'), combo: $('#comboHud'), power: $('#powerBar'), powerStatus: $('#powerStatus'), activatePower: $('#activatePowerBtn'),
    area: $('#areaTag'), type: $('#typeTag'), title: $('#questionTitle'), desc: $('#questionDesc'), timer: $('#timerHud'), body: $('#questionBody'), feedback: $('#feedback'),
    check: $('#checkBtn'), next: $('#nextBtn'), hint: $('#hintBtn'), skipLab: $('#skipLabBtn'), progress: $('#missionProgress'), progressText: $('#progressText'), eventLog: $('#eventLog'), areaHint: $('#areaHint'),
    resultTitle: $('#resultTitle'), resultMessage: $('#resultMessage'), finalScore: $('#finalScore'), resultStats: $('#resultStats'), areaReport: $('#areaReport'), tokenBox: $('#tokenBox'), tokenPrint: $('#tokenPrintBox'), copyToken: $('#copyTokenBtn'), download: $('#downloadResultBtn'), printPdf: $('#printResultBtn'), restart: $('#restartBtn'), powerToast: $('#powerToast'),
    reportBug: $('#reportBugBtn'), bugModal: $('#bugModal'), bugText: $('#bugText'), bugType: $('#bugType'), saveBug: $('#saveBugBtn'), cancelBug: $('#cancelBugBtn'), finishBug: $('#finishByBugBtn'), rescueModal: $('#rescueModal'), rescuePassword: $('#rescuePassword'), rescueStatus: $('#rescueStatus'), confirmRescue: $('#confirmRescueBtn'), forceFinish: $('#forceFinishBtn'), teacherPanel: $('#teacherPanel'), rescueTeacherName: $('#rescueTeacherName'), rescueReason: $('#rescueReason')
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
    'Inglês Técnico — Bônus':'theme-english'
  };
  const classTheme = {'1DS':'class-ds1','2DS':'class-ds2','3DS':'class-ds3','1DS Sub':'class-sub'};

  let mission = [], index = 0, current = null, selected = null, currentController = null;
  let startedAt = 0, phaseStartedAt = 0, timerId = null, timerDeadline = 0, timerSeq = 0, timeLeft = 0, finished = false, gameStarted = false;
  let missionQuestionTotal = 0, missionLabTotal = 0, phaseCompleted = false, phaseProcessing = false, transitionLock = false, activePower = null, securityHandle = null;
  const completedPhaseKeys = new Set();
  const state = {
    player:'', turma:'', mode:null, modeLabel:'', score:0, lives:4, maxLives:4, hints:10, combo:0, maxCombo:0, shield:0, power:0, multiplierNext:1,
    warnings:0, answers:[], events:[], labs:[], powerups:[], stats:{}, hintUsage:{}, bugReports:[], endedBy:'finalizado', lifeVault:null, scoreVault:null, expectedScore:0, powerReadyNotified:false, fullscreenRequested:false, overtime:false, rescuePending:false, integrityIssues:[], pendingProva:{}, challengeSkips:0, rescueLogs:[], teacherStartIndex:null, moduleFilter:'__all__', moduleLabel:'Desafio geral', xpTimeline:[], tokenChecksum:'', lastIntegrityAt:{}
  };

  function init(){
    installEvents();
    securityHandle = window.DS_Security.installSecurity({maxWarnings:CONFIG.maxSecurityWarnings || 4, shouldBlock:()=>!finished && !state.rescuePending && state.mode !== 'professor', onWarning:securityWarning, onStrike:securityStrike});
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
    el.check?.addEventListener('click', checkCurrent);
    el.next?.addEventListener('click', nextPhase);
    el.hint?.addEventListener('click', useHint);
    el.skipLab?.addEventListener('click', skipCurrentPhase);
    el.activatePower?.addEventListener('click', activatePower);
    el.reportBug?.addEventListener('click', openBugModal);
    el.cancelBug?.addEventListener('click', closeBugModal);
    el.saveBug?.addEventListener('click', saveBugReport);
    el.finishBug?.addEventListener('click', finishByBugReport);
    el.confirmRescue?.addEventListener('click', confirmRescue);
    el.forceFinish?.addEventListener('click', () => finishGame('strike_integridade_prova'));
    el.copyToken?.addEventListener('click', copyToken);
    el.download?.addEventListener('click', downloadResult);
    el.printPdf?.addEventListener('click', () => window.print());
    el.restart?.addEventListener('click', () => location.reload());
  }

  async function unlockMode(){
    const pass = el.modePass?.value || '';
    if(!pass.trim()) return setModeMessage('Digite a senha da missão.', 'warn');
    const hash = await C().sha256Hex(pass);
    const found = Object.entries(MODES).find(([, cfg]) => cfg.passwordHash === hash);
    if(found){
      const modeKey = found[0];
      const cfg = found[1];
      state.mode = modeKey;
      unlockedPassword = pass;
      activeBank = {questions:[], labs:[], version:'aguardando-carregamento', nome:'Banco será carregado ao iniciar'};
      updateModeUi(state.mode);
      populateModuleSelect(state.mode);
      setModeMessage(`${cfg.label} liberado. Escolha o módulo e inicie a missão.`, 'ok');
      if(modeKey === 'professor'){
        try{
          setModeMessage('Modo Professor liberado. Carregando banco de auditoria...', 'warn');
          activeBank = await loadBankForMode(modeKey, pass, '__all__');
          renderTeacherPanel();
          setModeMessage('Modo Professor liberado. Banco de auditoria carregado.', 'ok');
        }catch(err){
          console.warn('Falha ao abrir banco do professor:', err);
          setModeMessage('Senha aceita, mas o banco do professor não abriu. Confira os arquivos de chunks.', 'bad');
        }
      }
      return;
    }
    state.mode = null; unlockedPassword = ''; updateModeUi(null); setModeMessage('Senha inválida. Verifique e tente novamente.', 'bad');
  }

  function updateModeUi(mode){
    if(el.startBtn) el.startBtn.disabled = !mode;
    if(el.modeBadge){ el.modeBadge.textContent = mode ? MODES[mode].label : 'Modo bloqueado'; el.modeBadge.className = 'mode-badge ' + (mode ? mode : 'locked'); }
    if(el.name){ el.name.required = mode !== 'professor'; if(mode === 'professor' && !el.name.value.trim()) el.name.value = 'Professor/Teste'; }
    if(el.moduleWrap){ el.moduleWrap.classList.toggle('hidden', !mode || mode === 'professor'); }
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
    document.body.classList.remove('class-ds1','class-ds2','class-ds3','class-sub');
    document.body.classList.add(classTheme[turma] || 'class-ds1');
    document.body.dataset.turma = turma.replace(/\s+/g,'-').toLowerCase();
  }

  async function startGame(e){
    e.preventDefault();
    if(!state.mode) return setModeMessage('Libere o modo com a senha antes de iniciar.', 'warn');
    if(state.mode !== 'professor' && !el.name.value.trim()) return el.name.focus();
    if(state.mode === 'professor' && !el.name.value.trim()) el.name.value = 'Professor/Teste';
    const modeConfig = MODES[state.mode];
    state.moduleFilter = (state.mode === 'professor') ? '__all__' : (el.moduleSelect?.value || '__all__');
    state.moduleLabel = (state.mode === 'professor' || state.moduleFilter === '__all__') ? 'Desafio geral' : (el.moduleSelect?.selectedOptions?.[0]?.textContent || state.moduleFilter);
    try{
      activeBank = await loadBankForMode(state.mode, unlockedPassword, state.moduleFilter);
    }catch(err){
      console.warn('Falha ao carregar banco modular:', err);
      return setModeMessage('Não foi possível carregar o banco deste módulo. Verifique se todos os arquivos foram enviados.', 'bad');
    }
    if(!activeBank || !Array.isArray(activeBank.questions) || !activeBank.questions.length){ return setModeMessage('Banco protegido ainda não foi carregado. Libere o modo novamente.', 'bad'); }
    state.player = sanitizeText(el.name.value.trim(), 80); state.turma = el.turma.value; state.modeLabel = modeConfig.label; state.bankKey = modeConfig.bank || state.mode; state.bankName = activeBank.nome || state.bankKey; state.bankVersion = activeBank.version || 'sem-versao';
    state.score = 0; state.maxLives = modeConfig.maxLives; state.lives = modeConfig.maxLives ?? 999; state.hints = modeConfig.baseHints; state.combo = 0; state.maxCombo = 0; state.shield = 0; state.power = 0; state.multiplierNext = 1;
    state.answers = []; state.events = []; state.labs = []; state.powerups = []; state.stats = {}; state.hintUsage = {}; state.bugReports = []; state.endedBy = 'finalizado'; state.warnings = 0; state.integrityIssues = []; state.expectedScore = 0; state.scoreVault = null; state.powerReadyNotified = false; state.overtime = false; state.rescuePending = false; state.pendingProva = {}; state.challengeSkips = 0; state.rescueLogs = []; state.xpTimeline = []; state.tokenChecksum=''; state.lastIntegrityAt={}; activePower = null; completedPhaseKeys.clear(); phaseProcessing = false; transitionLock = false; document.body.classList.remove('power-ready','double-xp-active','overtime-prova');
    mission = buildMissionByModule(activeBank.questions || [], activeBank.labs || [], modeConfig, state.moduleFilter);
    missionQuestionTotal = mission.filter(x => x.kind === 'question').length;
    missionLabTotal = mission.filter(x => x.kind === 'lab').length;
    index = Number.isFinite(state.teacherStartIndex) ? Math.max(0, Math.min(state.teacherStartIndex, mission.length-1)) : 0; state.teacherStartIndex = null; phaseCompleted = false; finished = false; gameStarted = true; startedAt = Date.now(); protectState();
    el.playerHud.textContent = `${state.player} • ${state.turma}`;
    if(el.modeHud) el.modeHud.textContent = `${modeConfig.label} • ${state.moduleLabel}`;
    el.start.classList.remove('active'); el.result.classList.remove('active'); el.game.classList.add('active'); document.body.classList.add('game-active');
    try { await document.documentElement.requestFullscreen?.(); state.fullscreenRequested = !!document.fullscreenElement; } catch(e2) { state.fullscreenRequested = false; }
    logEvent('inicio', `${modeConfig.label} iniciado`); updateHud(); showPhase();
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
        const packetKey = mode === 'professor' ? 'professor' : key;
        const packet = chunk.packets?.[packetKey] || chunk.packets?.[mode] || chunk.packets?.desafio;
        if(!packet) throw new Error(`Pacote ausente no chunk: ${chunkInfo.id}`);
        const part = await C().decryptSecureBank(packet, password);
        questions.push(...(part.questions || []));
        labs.push(...(part.labs || []));
        loadedAreas.push(part.area || chunkInfo.area);
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

  function buildMissionByModule(questions, labs, modeConfig={}, moduleFilter='__all__'){
    let qs = questions || [], ls = labs || [];
    if(moduleFilter && moduleFilter !== '__all__'){
      qs = qs.filter(q => q.area === moduleFilter);
      ls = ls.filter(l => l.area === moduleFilter);
      if(!modeConfig.teacherMode && Number(modeConfig.specificQuestionSample) > 0){
        qs = shuffle([...qs]).slice(0, Number(modeConfig.specificQuestionSample));
      }
    } else if(!modeConfig.teacherMode && Number(modeConfig.generalQuestionSamplePerArea) > 0){
      qs = sampleQuestionsByArea(qs, Number(modeConfig.generalQuestionSamplePerArea));
    }
    const built = buildMission(qs, ls, modeConfig);
    if(!built.length && moduleFilter !== '__all__'){
      logEvent('modulo_vazio', `Módulo sem fases: ${moduleFilter}. Carregando desafio geral.`);
      return buildMission(questions || [], labs || [], modeConfig);
    }
    return built;
  }
  function sampleQuestionsByArea(list, limit){
    const buckets = {};
    (list || []).forEach(q => (buckets[q.area] ||= []).push(q));
    const selected = [];
    Object.keys(buckets).sort().forEach(area => selected.push(...shuffle([...buckets[area]]).slice(0, limit)));
    return interleaveByArea(selected);
  }

  function buildMission(questions, labs, modeConfig={}){
    const sourceQuestions = modeConfig.shuffleQuestions === false ? [...questions] : interleaveByArea(shuffle([...questions]));
    const normal = Number(modeConfig.questionLimit) > 0 ? sourceQuestions.slice(0, Number(modeConfig.questionLimit)) : sourceQuestions;
    const labList = modeConfig.shuffleLabs === false ? [...labs] : shuffle([...labs]);
    const result = [];
    const every = Math.max(1, Number(modeConfig.labEvery || 6));
    let labAt = Math.min(4, every), labIndex = 0;
    normal.forEach((q,i)=>{
      result.push({...q, kind:'question'});
      if(i+1 === labAt && labIndex < labList.length){ result.push({...labList[labIndex++], kind:'lab'}); labAt += every; }
    });
    while(labIndex < labList.length) result.push({...labList[labIndex++], kind:'lab'});
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
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

  function showPhase(){
    if(finished) return;
    auditLives();
    if(index >= mission.length) return finishGame('finalizado');
    current = mission[index]; selected = null; phaseCompleted = false; phaseProcessing = false; transitionLock = false;
    currentController?.cleanup?.(); currentController = null;
    phaseStartedAt = Date.now(); state.overtime = false; document.body.classList.remove('overtime-prova');
    applyTheme(current.area); clearFeedback();
    el.next.classList.add('hidden'); el.check.classList.remove('hidden'); el.check.disabled = false;
    el.skipLab.classList.remove('hidden');
    el.skipLab.disabled = false;
    el.skipLab.textContent = current.kind === 'lab' ? 'Pular laboratório' : (state.mode === 'prova' ? 'Responder depois' : 'Pular pergunta');
    el.hint.disabled = current.kind === 'lab';
    el.area.textContent = current.area; el.type.textContent = labelType(current.tipo || current.kind);
    el.title.textContent = current.enunciado || current.title || 'Missão';
    el.desc.textContent = current.desc || (current.kind === 'lab' ? 'Complete o laboratório para ganhar bônus. Você pode pular, mas não receberá power-up.' : 'Responda com atenção. Acertos rápidos carregam o power-up.');
    el.areaHint.textContent = areaTip(current.area);
    el.body.innerHTML = '';
    if(el.check){
      el.check.textContent = current.kind === 'lab' ? 'Executar etapa' : 'Confirmar resposta';
      el.check.title = current.kind === 'lab' ? 'Executa ou valida a etapa atual do laboratório.' : 'Valida a resposta atual uma única vez.';
    }
    if(current.kind === 'lab') renderLab(); else renderQuestion();
    startTimer(current.kind === 'lab' ? (current.timeLimit || 180) : 90);
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
    el.body.innerHTML = `<div class="choice-grid">${opts.map(o=>`<button class="choice" type="button" data-id="${o.id}"><span class="letter">${o.id}</span><span>${escapeHtml(o.texto)}</span></button>`).join('')}</div>`;
    $$('.choice').forEach(btn => btn.addEventListener('click', () => { $$('.choice').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); selected = btn.dataset.id; }));
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
    currentController = window.DS_Labs.renderLab(current, {body: el.body, checkBtn: el.check, feedback, completeLab, log: logEvent, integrityAlert});
  }

  async function checkCurrent(){
    if(!current || finished || phaseCompleted || phaseProcessing) return;
    auditLives();
    const key = phaseKey();
    if(completedPhaseKeys.has(key)) return;
    if(current.kind === 'lab') {
      phaseProcessing = true;
      el.check.disabled = true;
      try {
        const done = await currentController?.check?.();
        if(done === true || phaseCompleted) { completedPhaseKeys.add(key); return; }
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
        correct = await hashCompare(selected, current.correctHash);
      } else if(['completar_comando','completar_codigo','identificar_saida','completar_frase','terminal','identificar_erro'].includes(current.tipo)){
        const value = $('#answerInput')?.value || '';
        if(!value.trim()){ phaseProcessing = false; el.check.disabled = false; return feedback('Digite sua resposta antes de confirmar.', 'warn'); }
        correct = await anyHash(value, current.answerHashes || []);
      } else if(current.tipo === 'arrastar_e_soltar') correct = checkClassify();
      else if(current.tipo === 'relacionar') correct = checkMatch();
      else if(current.tipo === 'ordenar_etapas') correct = checkOrder();
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
  async function hashCompare(value, hash){ return (await C().sha256Hex(value)) === hash; }
  async function anyHash(value, hashes){ const h = await C().sha256Hex(value); return hashes.includes(h); }
  function checkClassify(){
    const map = C().decodeSpec(current.locked); let ok = true;
    $$('.drop-zone').forEach(z=>{ const g=z.dataset.group; z.querySelectorAll('.drag-card').forEach(c=>{ if(map[c.dataset.value] !== g) ok=false; }); });
    return ok && $$('.drop-zone .drag-card').length === current.items.length;
  }
  function checkMatch(){ const map = C().decodeSpec(current.locked); let ok = true; $$('.match-row select').forEach(sel=>{ if(map[sel.dataset.left] !== sel.value) ok = false; }); return ok; }
  function checkOrder(){ const correct = C().decodeSpec(current.locked); const chosen = $$('#orderList .order-item').map(x=>x.dataset.value); return JSON.stringify(chosen) === JSON.stringify(correct); }

  function handleCorrect(elapsed){
    const base = current.pontuacao || (String(current.tipo).includes('codigo') || String(current.tipo).includes('comando') ? 15 : 10);
    const speedBonus = elapsed <= 10 ? 15 : elapsed <= 20 ? 10 : elapsed <= 35 ? 5 : 0;
    const comboBonus = Math.min(30, state.combo * 3);
    const multiplier = activeMultiplierValue();
    let gained = Math.round((base + speedBonus + comboBonus) * state.multiplierNext * multiplier);
    let overtimePenalty = 0;
    if(state.overtime && state.mode === 'prova'){
      overtimePenalty = Math.max(5, Math.round(gained * 0.35));
      gained = Math.max(0, gained - overtimePenalty);
    }
    changeScore(gained, 'acerto'); state.combo += 1; state.maxCombo = Math.max(state.maxCombo, state.combo);
    addPower(14 + speedBonus, 'acerto');
    if(state.multiplierNext > 1) state.multiplierNext = 1;
    recordAnswer(true, elapsed, gained, {fora_do_tempo:state.overtime, desconto_tempo:overtimePenalty});
    feedback(`${current.feedback_acerto || 'Correto!'} +${gained} XP.${overtimePenalty ? ` Desconto por tempo: -${overtimePenalty} XP.` : ''}`, 'ok');
    logEvent('acerto', `+${gained} XP${overtimePenalty ? ' fora do tempo' : ''}`);
    endPhasePause(); updateHud();
  }
  function handleWrong(elapsed, reason='erro'){
    const isEnglish = current.area === 'Inglês Técnico — Bônus';
    let loss = 0, lostLife = false, shieldUsed = false;
    if(state.mode === 'desafio' && !isEnglish){
      if(state.shield > 0){ state.shield--; shieldUsed = true; logEvent('escudo', 'Escudo absorveu um erro'); }
      else { setLives(state.lives - 1); lostLife = true; loss = Math.max(10, Math.round(state.score * 0.06)); changeScore(-loss, 'erro'); }
    }
    state.combo = 0;
    recordAnswer(false, elapsed, -loss, {lostLife, shieldUsed, fora_do_tempo:state.overtime});
    const modeNote = state.mode === 'prova' ? ' Modo Prova: você avança sem perder vida.' : '';
    feedback(`${current.feedback_erro || 'Incorreto.'}${loss ? ` -${loss} XP.` : ''}${modeNote}`, 'bad');
    logEvent(reason, loss ? `-${loss} XP` : (shieldUsed ? 'escudo usado' : 'erro registrado'));
    updateHud();
    if(state.mode === 'desafio' && state.lives <= 0) return finishGame('sem_vidas');
    endPhasePause();
  }
  function recordAnswer(correct, elapsed, points, extra={}){
    const area = current.area;
    state.stats[area] ||= {acertos:0, erros:0, total:0, tempoTotal:0};
    state.stats[area].total++; state.stats[area].tempoTotal += elapsed; if(correct) state.stats[area].acertos++; else state.stats[area].erros++;
    state.answers.push({id:current.id, area, tipo:current.tipo, correto:correct, tempo_segundos:elapsed, pontos:points, fase:index+1, ...extra});
    if(state.mode === 'prova' && current?.id) delete state.pendingProva[current.id];
  }
  function endPhasePause(){ phaseCompleted = true; phaseProcessing = true; timerSeq++; clearInterval(timerId); document.body.classList.remove('overtime-prova'); el.check.disabled = true; el.check.classList.add('hidden'); el.hint.disabled = true; el.skipLab.disabled = true; el.skipLab.classList.add('hidden'); el.next.classList.remove('hidden'); updateMissionProgress(); }
  function nextPhase(){ if(transitionLock || finished) return; transitionLock = true; index++; phaseCompleted = false; phaseProcessing = false; if(el.skipLab) el.skipLab.disabled = false; showPhase(); }

  function completeLab(item, info){
    if(phaseCompleted || finished || completedPhaseKeys.has(phaseKey())) return true;
    completedPhaseKeys.add(phaseKey());
    phaseProcessing = true;
    clearInterval(timerId);
    const elapsed = Math.round((Date.now()-phaseStartedAt)/1000);
    let points = info.points || item.pontuacao || 50;
    points = Math.round(points * activeMultiplierValue());
    changeScore(points, 'laboratorio'); addPower(30, 'laboratorio'); applyLabPower(info.power);
    state.labs.push({id:item.id, area:item.area, concluido:true, pulado:false, tempo_segundos:elapsed, pontos:points, power:info.power, detail:info.detail || {}, fase:index+1});
    state.stats[item.area] ||= {acertos:0, erros:0, total:0, tempoTotal:0}; state.stats[item.area].total++; state.stats[item.area].tempoTotal += elapsed; state.stats[item.area].acertos++;
    feedback(`Laboratório concluído! +${points} XP e power-up aplicado.`, 'ok');
    logEvent('laboratorio', `${item.enunciado} concluído`);
    endPhasePause(); updateHud();
  }
  function skipCurrentPhase(){
    if(!current || finished || phaseCompleted || completedPhaseKeys.has(phaseKey())) return;
    if(phaseProcessing && current.kind !== 'lab') return;
    if(phaseProcessing && current.kind === 'lab'){ phaseProcessing = false; el.check.disabled = false; }
    if(current.kind === 'question' && state.mode === 'prova'){
      const count = state.pendingProva[current.id] || 0;
      if(count >= 2){
        feedback('Esta pergunta já foi adiada 2 vezes. Agora responda para continuar a prova.', 'warn');
        logEvent('adiamento_bloqueado', `Pergunta ${current.id} já foi adiada 2 vezes`);
        return;
      }
      phaseProcessing = true;
      clearInterval(timerId);
      state.pendingProva[current.id] = count + 1;
      const moved = {...current, pending:true, postponedCount:count+1};
      mission.splice(index, 1);
      mission.push(moved);
      showPowerToast('Pergunta enviada para pendentes');
      logEvent('pergunta_pendente', `Pergunta adiada para o final (${count+1}/2)`);
      phaseProcessing = false;
      showPhase();
      return;
    }
    if(current.kind === 'question' && state.mode === 'desafio'){
      const maxSkips = CONFIG.maxChallengeSkips || 3;
      if(state.challengeSkips >= maxSkips){
        feedback(`Limite de pulos atingido (${maxSkips}). Responda para continuar.`, 'warn');
        return;
      }
    }
    phaseProcessing = true; completedPhaseKeys.add(phaseKey()); clearInterval(timerId);
    const elapsed = Math.max(0, Math.round((Date.now()-phaseStartedAt)/1000));
    if(current.kind === 'lab'){
      state.labs.push({id:current.id, area:current.area, concluido:false, pulado:true, tempo_segundos:elapsed, pontos:0, fase:index+1});
      state.stats[current.area] ||= {acertos:0, erros:0, total:0, tempoTotal:0}; state.stats[current.area].total++; state.stats[current.area].tempoTotal += elapsed; state.stats[current.area].erros++;
      feedback('Laboratório pulado. Você avançou, mas não recebeu bônus nem power-up.', 'warn');
      logEvent('lab_pulado', current.enunciado);
    } else {
      let loss = 0, lossPct = 0;
      if(state.mode === 'desafio'){
        const percents = CONFIG.challengeSkipLossPercents || [15,30,50];
        lossPct = percents[Math.min(state.challengeSkips, percents.length-1)] || 50;
        state.challengeSkips++;
        loss = Math.min(state.score, Math.max(10, Math.round(state.score * (lossPct/100)) || 10));
      } else {
        loss = Math.min(state.score, Math.max(10, Math.round(state.score * 0.03) || 10));
      }
      changeScore(-loss, 'pulo_pergunta');
      state.combo = 0;
      recordAnswer(false, elapsed, -loss, {pulado:true, perdeu_vida:false, pulo_numero:state.challengeSkips || 0, perda_percentual:lossPct});
      feedback(state.mode === 'desafio' ? `Pergunta pulada. Pulo ${state.challengeSkips}/${CONFIG.maxChallengeSkips || 3}. Perda: ${lossPct}% do XP (-${loss}).` : `Pergunta pulada. Você perdeu ${loss} XP, mas não perdeu vida.`, 'warn');
      logEvent('pergunta_pulada', `-${loss} XP${lossPct ? ` (${lossPct}%)` : ''}`);
    }
    endPhasePause(); updateHud();
  }
  function phaseTimeout(){
    if(!current || finished || phaseCompleted || completedPhaseKeys.has(phaseKey())) return;
    if(phaseProcessing && current.kind !== 'lab') return;
    if(phaseProcessing && current.kind === 'lab'){ phaseProcessing = false; el.check.disabled = false; }
    phaseProcessing = true; completedPhaseKeys.add(phaseKey());
    if(current?.kind === 'lab'){
      state.labs.push({id:current.id, area:current.area, concluido:false, tempo_esgotado:true, tempo_segundos:Math.round((Date.now()-phaseStartedAt)/1000), pontos:0, fase:index+1});
      state.stats[current.area] ||= {acertos:0, erros:0, total:0, tempoTotal:0}; state.stats[current.area].total++; state.stats[current.area].erros++; state.stats[current.area].tempoTotal += Math.round((Date.now()-phaseStartedAt)/1000);
      feedback('Tempo do laboratório esgotado. Você avançou sem receber o bônus.', 'warn');
      logEvent('lab_tempo', current.enunciado);
      endPhasePause(); updateHud();
    } else {
      const elapsed = Math.round((Date.now()-phaseStartedAt)/1000);
      if(state.mode === 'desafio'){
        recordAnswer(false, elapsed, 0, {tempo_esgotado:true, game_over:true});
        logEvent('tempo_esgotado', 'Tempo esgotado no Modo Desafio');
        return finishGame('tempo_esgotado');
      }
      state.overtime = true;
      document.body.classList.add('overtime-prova');
      feedback('Tempo indicado esgotado. No Modo Prova você ainda pode responder, mas receberá desconto de XP por resposta fora do tempo.', 'warn');
      logEvent('tempo_extra_prova', 'Aluno continuou respondendo após o tempo indicado');
      phaseProcessing = false;
      completedPhaseKeys.delete(phaseKey());
      el.check.disabled = false;
      return;
    }
  }
  function applyLabPower(power){
    if(power === 'hint') state.hints = Math.min(10, state.hints + 1);
    else if(power === 'shield') state.shield += 1;
    else if(power === 'next2x') state.multiplierNext = 2;
    else if(power === 'points') changeScore(50, 'power_laboratorio');
    else if(power === 'life_or_points') { if(state.mode === 'desafio' && state.maxLives && state.lives < state.maxLives) setLives(state.lives + 1); else changeScore(50, 'power_laboratorio'); }
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
    state.hints--; state.hintUsage[key] = usedHere + 1; changeScore(-cost, 'dica');
    feedback(`Dica ${usedHere+1}/${maxPerQuestion}: ${hints[usedHere]} (-${cost} XP)`, 'warn');
    logEvent('dica', `Dica ${usedHere+1}/${maxPerQuestion}: -${cost} XP`); updateHud();
  }
  function addPower(amount, source){
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
    if(state.power < 100 || finished || phaseCompleted || phaseProcessing) return;
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
      const isRight = await hashCompare(btn.dataset.id, current.correctHash);
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

  function updateHud(){
    auditLives(false);
    auditScore(false);
    document.body.classList.toggle('power-ready', state.power >= 100 && !finished);
    if(activeMultiplierValue() === 1) document.body.classList.remove('double-xp-active');
    el.score.textContent = state.score;
    el.scoreBar.style.width = Math.min(100, state.score / 10) + '%';
    if(state.mode === 'prova') el.lives.innerHTML = '<span class="gold-life">∞ PROVA</span>';
    else if(state.mode === 'professor') el.lives.innerHTML = '<span class="gold-life">MODO PROFESSOR</span>';
    else el.lives.innerHTML = Array.from({length:state.maxLives || 4},(_,i)=> i<state.lives ? '<span class="heart alive">♥</span>' : '<span class="heart lost">♥</span>').join(' ');
    el.hints.textContent = state.hints; el.combo.textContent = state.combo + 'x';
    el.power.style.width = state.power + '%'; el.activatePower.disabled = state.power < 100;
    el.activatePower.classList.toggle('ready', state.power >= 100);
    el.powerStatus.textContent = activePower?.type === 'double_xp' ? 'DOUBLE XP ativo' : state.power >= 100 ? 'Power-up desbloqueado: clique em ATIVAR' : `Carregando ${state.power}%`;
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
    const pendingCount = state.mode === 'prova' ? Object.keys(state.pendingProva || {}).length : 0;
    el.progress.style.width = pct + '%'; el.progress.style.setProperty('--progress-color', progressColor(pct));
    el.progressText.textContent = `${phaseLabel} • ${questionLabel} • faltam ${remainingQuestions} perguntas${pendingCount ? ` • pendentes: ${pendingCount}` : ''} • ${pct}%`; 
  }
  function progressColor(pct){ if(pct >= 92) return '#22e982'; if(pct >= 70) return '#56f39a'; if(pct >= 45) return '#ffd33d'; if(pct >= 20) return '#ff9f2d'; return getComputedStyle(document.body).getPropertyValue('--class-accent').trim() || 'var(--accent)'; }

  function setLives(n){ if(state.mode === 'prova') return; state.lives = Math.max(0, Math.min(state.maxLives || 4, n)); protectState(); }
  function changeScore(delta, source='ajuste'){
    const before = state.score;
    const maxSingle = CONFIG.maxSingleXpChange || 800;
    const now = Date.now();
    state.xpTimeline = (state.xpTimeline || []).filter(x => now - x.time < 1200);
    state.xpTimeline.push({time:now, delta, source, fase:index+1});
    const rapidGain = state.xpTimeline.filter(x => x.delta > 0).reduce((a,b)=>a+b.delta,0);
    if(Math.abs(delta) > maxSingle || rapidGain > maxSingle){
      integrityAlert('variacao_xp_suspeita');
    }
    state.expectedScore = Math.max(0, Math.round((state.expectedScore || 0) + delta));
    state.score = state.expectedScore;
    state.events.push({type:'xp', message:`${source}: ${delta >= 0 ? '+' : ''}${delta} XP`, time:new Date().toISOString(), fase:current?.id || null, index:index+1, antes:before, depois:state.score});
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
    if(!state.scoreVault) return;
    const val = btoa(String((state.expectedScore || 0) ^ 131));
    const sig = C().fastIntegrity(`${state.mode}|${state.expectedScore}|${state.lives}|${state.combo}|${state.shield}`);
    const tampered = state.score !== state.expectedScore || state.scoreVault.value !== val || state.scoreVault.sig !== sig;
    const maxReasonable = Math.max(2500, mission.length * 220 + state.labs.length * 200 + 1000);
    if(tampered || state.score > maxReasonable){
      state.score = state.expectedScore;
      if(strict || tampered || state.score > maxReasonable) integrityAlert('xp_suspeito');
    }
    protectState();
  }
  function integrityAlert(reason){
    const now = Date.now();
    state.lastIntegrityAt ||= {};
    if(state.lastIntegrityAt[reason] && now - state.lastIntegrityAt[reason] < 900) return;
    state.lastIntegrityAt[reason] = now;
    const max = CONFIG.maxSecurityWarnings || 4;
    const next = Math.min(max, (state.warnings || 0) + 1);
    securityWarning(reason, next, max);
    if(next >= max) securityStrike(reason);
  }

  function securityWarning(reason, warnings, max){
    if(!gameStarted || finished || state.rescuePending) return;
    state.warnings = Math.max(state.warnings || 0, warnings || 1);
    state.integrityIssues.push({reason, warnings:state.warnings, max, time:new Date().toISOString(), fase:current?.id || null, index:index+1});
    showIntegrityOverlay(reason, state.warnings, max);
    logEvent('alerta_integridade', `${reason} (${state.warnings}/${max})`);
  }
  function securityStrike(reason){
    if(!gameStarted || finished) return;
    if(state.mode === 'prova') return openRescueModal(reason);
    finishGame('strike_' + reason);
  }
  let lastSirenAt = 0;
  let integrityAudioInstance = null;
  function playIntegritySiren(){
    const now = Date.now();
    if(now - lastSirenAt < 1200) return;
    lastSirenAt = now;
    try{
      const src = CONFIG.integrityAudioSrc || 'alerta.aac';
      const audio = document.getElementById('integrityAudio') || integrityAudioInstance || new Audio(src);
      integrityAudioInstance = audio;
      if(!audio.getAttribute?.('src') && audio.src !== src) audio.src = src;
      audio.volume = 0.9;
      audio.currentTime = 0;
      const p = audio.play();
      if(p && typeof p.catch === 'function') p.catch(()=>{});
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
    setTimeout(()=>el.rescuePassword?.focus(), 50);
  }
  async function confirmRescue(){
    const pass = el.rescuePassword?.value || '';
    const professor = sanitizeText(el.rescueTeacherName?.value || 'Professor não informado', 80);
    const justificativa = sanitizeText(el.rescueReason?.value || '', 500);
    if(justificativa.length < 8){
      if(el.rescueStatus){ el.rescueStatus.textContent = 'Informe uma justificativa para registrar a liberação.'; el.rescueStatus.className = 'mode-status warn'; }
      return;
    }
    const hash = await C().sha256Hex(pass);
    if(hash !== CONFIG.rescuePasswordHash){
      if(el.rescueStatus){ el.rescueStatus.textContent = 'Senha de recuperação inválida.'; el.rescueStatus.className = 'mode-status bad'; }
      return;
    }
    const max = CONFIG.maxSecurityWarnings || 4;
    const log = {professor, justificativa, horario:new Date().toISOString(), fase:current?.id || null, index:index+1, alertas_antes:state.warnings, modo:state.modeLabel};
    state.rescueLogs.push(log);
    state.rescuePending = false;
    securityHandle?.reset?.();
    state.warnings = 0;
    state.integrityIssues.push({reason:'prova_liberada_professor', warnings:state.warnings, max, time:log.horario, fase:current?.id || null, index:index+1, professor, justificativa});
    logEvent('prova_liberada', `Professor liberou a continuação da prova. Motivo: ${justificativa}`);
    el.rescueModal?.classList.add('hidden');
    feedback('Prova liberada pelo professor. Continue a missão com atenção.', 'ok');
    startTimer(Math.max(30, timeLeft || current?.time || 60));
  }

  async function finishGame(reason){
    if(!gameStarted || finished) return; finished = true; timerSeq++; clearInterval(timerId); document.body.classList.remove('game-active');
    state.endedBy = reason || 'finalizado';
    const totalSeconds = Math.round((Date.now()-startedAt)/1000);
    if(state.mode === 'desafio' && state.lives === state.maxLives && reason === 'finalizado') { changeScore(120, 'bonus_invencibilidade'); logEvent('bonus_invencibilidade', '+120 XP'); }
    const summary = await buildSummary(totalSeconds);
    summary.payload_checksum = C().fastIntegrity(JSON.stringify(summary));
    const token = await C().encryptToken(summary);
    state.tokenChecksum = C().fastIntegrity(token);
    el.game.classList.remove('active'); el.start.classList.remove('active'); el.result.classList.add('active');
    const status = statusLabel(reason);
    el.resultTitle.textContent = status.titulo;
    el.resultMessage.textContent = `${status.descricao} ${summary.mensagem_final}`;
    el.finalScore.textContent = state.score;
    el.resultStats.innerHTML = statHtml('Situação', status.situacao) + statHtml('Modo', state.modeLabel) + statHtml('Banco', state.bankName) + statHtml('Módulo', state.moduleLabel) + statHtml('Versão', CONFIG.appVersion || 'v10') + statHtml('Jogador', state.player) + statHtml('Turma', state.turma) + statHtml('Tempo', formatTime(totalSeconds)) + statHtml('Média/pergunta', summary.tempo_medio_pergunta);
    el.resultStats.innerHTML += statHtml('Acertos', summary.acertos) + statHtml('Erros', summary.erros) + statHtml('Precisão', summary.precisao + '%') + statHtml('Power-ups', state.powerups.length) + statHtml('Alertas', state.warnings) + statHtml('Vidas', summary.vidas_restantes);
    el.areaReport.innerHTML = Object.entries(summary.areas).map(([area,s])=>`<div class="area-row"><strong>${escapeHtml(area)}</strong><div class="progress-line"><i style="width:${s.percentual}%"></i></div><p>${s.acertos} acertos • ${s.erros} erros • ${s.percentual}% • média ${s.tempo_medio}</p></div>`).join('');
    if(summary.divergencias.length || summary.bugs_reportados.length || summary.alertas_integridade){
      el.areaReport.innerHTML += `<div class="integrity-panel"><h3>Integridade e feedback</h3><p>Alertas: ${summary.alertas_integridade}. Divergências: ${summary.divergencias.length ? escapeHtml(summary.divergencias.join(' | ')) : 'nenhuma'}.</p></div>`;
    }
    if(summary.bugs_reportados.length){
      el.areaReport.innerHTML += `<div class="bug-report-list"><h3>Bugs informados pelo aluno</h3>${summary.bugs_reportados.map(b=>`<div class="bug-report-item"><strong>Fase ${b.fase} • ${escapeHtml(b.area || '')}</strong><p>${escapeHtml(b.relato)}</p></div>`).join('')}</div>`;
    }
    el.tokenBox.value = token;
    if(el.tokenPrint) el.tokenPrint.textContent = token;
    el.resultStats.innerHTML += statHtml('Token ID', state.tokenChecksum);
    logLocal('Resultado gerado. Baixe o token ou o PDF antes de sair.');
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
    const totalBasedPrecision = state.mode === 'prova' || String(state.endedBy || '').includes('desistencia') || String(state.endedBy || '').includes('bug');
    const erros = answerWrong + (totalBasedPrecision ? unansweredQuestions : 0);
    const precisionBase = totalBasedPrecision ? missionQuestionTotal : Math.max(1, state.answers.length);
    const totalAnswered = acertos + erros;
    const areas = {};
    Object.entries(state.stats).forEach(([area,s])=>{ const avg = s.total ? Math.round((s.tempoTotal || 0)/s.total) : 0; areas[area] = {acertos:s.acertos, erros:s.erros, total:s.total, percentual:s.total ? Math.round(s.acertos/s.total*100) : 0, tempo_medio:formatTimeShort(avg)}; });
    let bestArea = Object.entries(areas).sort((a,b)=>b[1].percentual-a[1].percentual || b[1].acertos-a[1].acertos)[0]?.[0] || '';
    let msg = 'Você ainda está evoluindo. Revise os conceitos e tente novamente para melhorar sua pontuação.';
    if(bestArea.includes('Python')) msg = 'Você mandou bem em programação! Continue praticando lógica, funções e códigos.';
    else if(bestArea.includes('Banco')) msg = 'Você teve ótimo desempenho em SQL e organização de dados.';
    else if(bestArea.includes('Front')) msg = 'Você se destacou na parte visual e estrutural das páginas.';
    else if(acertos > erros) msg = 'Boa missão! Você demonstrou domínio em várias áreas de Desenvolvimento de Sistemas.';
    const userInfo = await collectClientInfo();
    return {
      versao:CONFIG.appVersion || 'modular', banco:state.bankKey, banco_nome:state.bankName, banco_versao:state.bankVersion, modulo:state.moduleFilter, modulo_label:state.moduleLabel, modo:state.mode, modo_label:state.modeLabel, jogador:state.player, turma:state.turma,
      inicio:new Date(startedAt).toISOString(), fim:new Date().toISOString(), duracao_segundos:totalSeconds, tempo_total:formatTime(totalSeconds), tempo_medio_pergunta:formatTimeShort(avgSeconds(state.answers.map(a=>a.tempo_segundos))), tempo_medio_fase:formatTimeShort(avgSeconds([...state.answers.map(a=>a.tempo_segundos), ...state.labs.map(l=>l.tempo_segundos || 0)])),
      pontuacao:state.score, vidas_restantes:state.mode === 'prova' ? 'sem limite' : state.lives, dicas_restantes:state.hints, combo_maximo:state.maxCombo, escudos_restantes:state.shield, encerramento:state.endedBy, situacao:statusLabel(state.endedBy).situacao,
      acertos, erros, precisao: precisionBase ? Math.round(acertos/precisionBase*100) : 0, base_precisao: totalBasedPrecision ? 'total de perguntas do módulo/banco' : 'perguntas respondidas até o encerramento', perguntas_corretas:answerCorrect, perguntas_incorretas:answerWrong, perguntas_nao_respondidas:unansweredQuestions, acertos_etapas:acertosEtapas, erros_etapas:errosEtapas, laboratorios_concluidos:labCorrect, laboratorios_nao_concluidos:labWrong, pulos_desafio_usados:state.challengeSkips, perguntas_pendentes_prova:Object.keys(state.pendingProva || {}).length,
      total_fases:mission.length, total_perguntas:missionQuestionTotal, total_laboratorios:missionLabTotal, perguntas_respondidas:state.answers.length, divergencias:checkDivergences(acertos, erros, totalAnswered),
      areas, melhor_area:bestArea, mensagem_final:msg, respostas:state.answers, laboratorios:state.labs, powerups:state.powerups, bugs_reportados:state.bugReports, eventos:state.events, alertas_integridade:state.warnings, detalhes_integridade:state.integrityIssues, liberacoes_professor:state.rescueLogs, modo_professor:state.mode === 'professor', cliente:userInfo
    };
  }
  function checkDivergences(acertos, erros, totalAnswered){
    const issues = [];
    if(state.answers.length > missionQuestionTotal) issues.push('Quantidade de respostas maior que o total de perguntas.');
    if(state.mode === 'prova' && state.answers.length < missionQuestionTotal) issues.push('Prova encerrada com pergunta(s) sem resposta registrada.');
    if(acertos > mission.length) issues.push('Quantidade de acertos maior que o total de fases.');
    if(totalAnswered > mission.length) issues.push('Total respondido maior que o total de fases.');
    const maxReasonable = Math.max(2500, mission.length * 220 + state.powerups.length * 250 + 1200);
    if(state.score > maxReasonable) issues.push('Pontuação acima do limite esperado.');
    if(state.warnings >= (CONFIG.maxSecurityWarnings || 4)) issues.push('Limite de alertas de integridade atingido.');
    return issues;
  }

  async function collectClientInfo(){
    const base = {
      user_agent:navigator.userAgent, plataforma:navigator.platform, idioma:navigator.language, idiomas:navigator.languages, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      tela:{largura:screen.width, altura:screen.height, cor:screen.colorDepth, pixel_ratio:window.devicePixelRatio}, viewport:{largura:innerWidth, altura:innerHeight},
      recursos:{cpu_logica:navigator.hardwareConcurrency || null, memoria_gb:navigator.deviceMemory || null, online:navigator.onLine}, fullscreen_solicitado:state.fullscreenRequested,
      conexao:navigator.connection ? {tipo:navigator.connection.effectiveType, downlink:navigator.connection.downlink, rtt:navigator.connection.rtt} : null,
      observacao_ip_local:'Navegadores modernos não permitem coletar o IP local da máquina com segurança em HTML/JS puro.'
    };
    const withTimeout = (promise, ms=2200) => Promise.race([promise, new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), ms))]);
    try{
      const r = await withTimeout(fetch('https://ipapi.co/json/', {cache:'no-store'}));
      if(r.ok){
        const j = await r.json();
        base.rede_publica = {ip:j.ip || null, cidade:j.city || null, regiao:j.region || null, pais:j.country_name || null, org:j.org || null, asn:j.asn || null, latitude:j.latitude || null, longitude:j.longitude || null, timezone:j.timezone || null, fonte:'ipapi.co'};
        return base;
      }
    }catch(e){ base.rede_publica_erro = 'Não foi possível consultar IP público em ipapi.co: ' + e.message; }
    try{
      const r2 = await withTimeout(fetch('https://api.ipify.org?format=json', {cache:'no-store'}));
      if(r2.ok){ const j2 = await r2.json(); base.rede_publica = {ip:j2.ip || null, fonte:'api.ipify.org'}; }
    }catch(e2){ base.rede_publica_erro2 = 'Não foi possível consultar IP público em ipify: ' + e2.message; }
    return base;
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
  async function copyToken(){
    const token = el.tokenBox.value || '';
    let copied = false;
    try{
      if(navigator.clipboard?.writeText){ await navigator.clipboard.writeText(token); copied = true; }
    }catch(e){ copied = false; }
    if(!copied){
      try{ el.tokenBox.focus(); el.tokenBox.select(); document.execCommand('copy'); copied = true; }catch(e2){ copied = false; }
    }
    el.copyToken.textContent = copied ? 'Token copiado' : 'Selecione e copie o token';
    setTimeout(()=>el.copyToken.textContent='Copiar token', 1600);
  }
  function downloadResult(){
    const blob = new Blob([el.tokenBox.value], {type:'text/plain;charset=utf-8'});
    const a = document.createElement('a');
    const safeName = C().normalizeText(state.player || 'resultado').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'resultado';
    a.href = URL.createObjectURL(blob);
    a.download = `desafio-ds-${state.mode || 'modo'}-${safeName}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function phaseKey(){ return `${index}:${current?.id || 'fase'}:${current?.kind || 'kind'}`; }
  function labelType(t){ return String(t).replaceAll('_',' '); }
  function areaTip(area){
    if(area.includes('CMD')) return 'Tema terminal: comandos, pastas e organização de arquivos.';
    if(area.includes('Python')) return 'Tema IDE: lógica, entrada, função, erro e saída.';
    if(area.includes('SQL')) return 'Tema dados: tabela, consulta e filtro.';
    if(area.includes('Front')) return 'Tema web: estrutura, estilo e interação visual.';
    if(area.includes('Análise')) return 'Tema análise: requisitos, fluxos, protótipos e planejamento.';
    return 'Missão de tecnologia aplicada ao Desenvolvimento de Sistemas.';
  }
  function avgSeconds(arr){ const clean = arr.filter(n=>Number.isFinite(n)); return clean.length ? Math.round(clean.reduce((a,b)=>a+b,0)/clean.length) : 0; }
  function formatTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m}min ${String(s).padStart(2,'0')}s`; }
  function formatTimeShort(sec){ return `${sec}s`; }
  function sanitizeText(value, max=600){ return String(value || '').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/<\/?script[^>]*>/gi,'').slice(0,max).trim(); }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  function enableSortList(list){ let dragged = null; list.querySelectorAll('.order-item').forEach(item=>{ item.addEventListener('dragstart',()=>dragged=item); item.addEventListener('dragover',e=>e.preventDefault()); item.addEventListener('drop',e=>{ e.preventDefault(); if(dragged && dragged!==item){ const rect=item.getBoundingClientRect(); const after=e.clientY > rect.top + rect.height/2; list.insertBefore(dragged, after ? item.nextSibling : item); } }); }); }

  document.addEventListener('DOMContentLoaded', init);
})();
