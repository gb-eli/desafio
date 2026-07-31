(function(){
  'use strict';

  function installSecurity(callbacks){
    let events = 0;
    let hardWarnings = 0;
    let lastWarningAt = 0;
    let lastReason = '';
    const maxWarnings = callbacks?.maxWarnings || 4;
    const overlay = document.getElementById('securityOverlay');
    const countEl = document.getElementById('securityCount');
    const msgEl = document.getElementById('securityMessage');

    function shouldMonitor(){ return callbacks?.shouldBlock ? callbacks.shouldBlock() : true; }
    function report(reason, severity='evidence'){
      if(!shouldMonitor()) return;
      const now = Date.now();
      if(reason === lastReason && now - lastWarningAt < 900) return;
      if(now - lastWarningAt < 300) return;
      lastWarningAt = now;
      lastReason = reason;
      events += 1;
      if(severity === 'hard') hardWarnings += 1;
      callbacks?.onWarning?.(reason, events, maxWarnings, {severity, hardWarnings});

      if(severity === 'hard' && overlay){
        overlay.classList.remove('hidden');
        overlay.classList.add('danger-pulse');
        if(countEl) countEl.textContent = `${hardWarnings}/${maxWarnings}`;
        if(msgEl) msgEl.textContent = hardWarnings >= maxWarnings
          ? 'Limite de ações bloqueadas atingido. Solicite o professor.'
          : `Ação bloqueada e registrada. Restam ${Math.max(0, maxWarnings-hardWarnings)} alerta(s) críticos.`;
        setTimeout(()=>{
          overlay.classList.add('hidden');
          overlay.classList.remove('danger-pulse');
        }, 1900);
      }
      if(hardWarnings >= maxWarnings) callbacks?.onStrike?.(reason, hardWarnings);
    }

    document.addEventListener('contextmenu', event => {
      if(!shouldMonitor()) return;
      report('botao_direito', 'evidence');
    });
    ['copy','cut','paste'].forEach(type => {
      document.addEventListener(type, event => {
        if(!shouldMonitor()) return;
        report(type, 'evidence');
      }, true);
    });
    document.addEventListener('keydown', event => {
      const key = String(event.key).toUpperCase();
      const inspection = event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && ['I','J','C'].includes(key)) ||
        (event.ctrlKey && ['U','S'].includes(key));
      if(inspection && shouldMonitor()){
        event.preventDefault();
        event.stopPropagation();
        report('atalho_inspecao', 'hard');
      }
    }, true);
    document.addEventListener('visibilitychange', () => {
      if(shouldMonitor() && document.hidden) report('aba_oculta_ou_alt_tab', 'evidence');
    });
    window.addEventListener('blur', () => {
      if(shouldMonitor()) report('janela_sem_foco', 'evidence');
    });
    document.addEventListener('fullscreenchange', () => {
      if(shouldMonitor() && !document.fullscreenElement) report('saiu_da_tela_cheia', 'evidence');
    });

    return {
      getWarnings:()=>events,
      getHardWarnings:()=>hardWarnings,
      reset:()=>{ events=0; hardWarnings=0; lastWarningAt=0; lastReason=''; }
    };
  }

  window.DS_Security = {installSecurity};
})();
