(function(){
  'use strict';
  function installSecurity(callbacks){
    let warnings = 0;
    let lastWarningAt = 0;
    let lastReason = '';
    const maxWarnings = callbacks?.maxWarnings || 4;
    const overlay = document.getElementById('securityOverlay');
    const countEl = document.getElementById('securityCount');
    const msgEl = document.getElementById('securityMessage');
    function shouldBlock(){ return callbacks?.shouldBlock ? callbacks.shouldBlock() : true; }
    function warn(reason){
      if(!shouldBlock()) return;
      const now = Date.now();
      if(reason === lastReason && now - lastWarningAt < 700) return;
      if(now - lastWarningAt < 350) return;
      lastWarningAt = now; lastReason = reason;
      warnings += 1;
      callbacks?.onWarning?.(reason, warnings, maxWarnings);
      if(overlay){
        overlay.classList.remove('hidden');
        overlay.classList.add('danger-pulse');
        if(countEl) countEl.textContent = `${warnings}/${maxWarnings}`;
        if(msgEl) msgEl.textContent = warnings >= maxWarnings ? 'Missão encerrada por integridade.' : `Ação bloqueada. Restam ${Math.max(0, maxWarnings - warnings)} alerta(s) antes do strike.`;
        setTimeout(()=>{
          overlay.classList.add('hidden');
          overlay.classList.remove('danger-pulse');
        }, 1900);
      }
      if(warnings >= maxWarnings) callbacks?.onStrike?.(reason, warnings);
    }
    document.addEventListener('contextmenu', e => { if(shouldBlock()){ e.preventDefault(); warn('botao_direito'); } });
    ['copy','cut','paste'].forEach(evt => {
      document.addEventListener(evt, e => { if(shouldBlock()){ e.preventDefault(); warn(evt); } }, true);
    });
    document.addEventListener('keydown', e => {
      const k = String(e.key).toUpperCase();
      const blocked = e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(k)) ||
        (e.ctrlKey && ['U','S','P'].includes(k));
      if(blocked && shouldBlock()){
        e.preventDefault(); e.stopPropagation(); warn('atalho_inspecao');
      }
    }, true);
    document.addEventListener('visibilitychange', () => {
      if(shouldBlock() && document.hidden) warn('aba_oculta_ou_alt_tab');
    });
    window.addEventListener('blur', () => {
      if(shouldBlock()) warn('janela_sem_foco');
    });
    document.addEventListener('fullscreenchange', () => {
      if(shouldBlock() && !document.fullscreenElement) warn('saiu_da_tela_cheia');
    });
    let lastOuter = {w: window.outerWidth, h: window.outerHeight};
    setInterval(()=>{
      if(!shouldBlock()) return;
      const dw = Math.abs(window.outerWidth - window.innerWidth);
      const dh = Math.abs(window.outerHeight - window.innerHeight);
      const changed = Math.abs(lastOuter.w - window.outerWidth) > 260 || Math.abs(lastOuter.h - window.outerHeight) > 260;
      lastOuter = {w: window.outerWidth, h: window.outerHeight};
      if((dw > 320 || dh > 320) && changed) warn('possivel_devtools');
    }, 3200);
    return { getWarnings:()=>warnings, reset:()=>{warnings=0; lastWarningAt=0; lastReason='';} };
  }
  window.DS_Security = {installSecurity};
})();
