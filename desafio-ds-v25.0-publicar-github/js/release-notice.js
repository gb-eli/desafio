(function(){
  'use strict';
  const RELEASE='25.0.0';
  const KEY='ds_last_seen_release';
  function show(){if(localStorage.getItem(KEY)===RELEASE||document.getElementById('releaseNotice'))return;const node=document.createElement('div');node.id='releaseNotice';node.className='release-notice';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.innerHTML=`<section><span>VERSÃO ${RELEASE}</span><h2>Obrigado por ajudar a melhorar</h2><p>Esta versão recebeu reforços em segurança, termos, privacidade, integridade do XP, acessibilidade e funcionamento offline a partir dos testes e feedbacks dos estudantes.</p><div><button id="releaseSkip" class="btn ghost" type="button">Pular</button><button id="releaseClose" class="btn primary" type="button">Continuar</button></div></section>`;document.body.appendChild(node);const close=()=>{localStorage.setItem(KEY,RELEASE);node.remove();};node.querySelector('#releaseSkip').addEventListener('click',close);node.querySelector('#releaseClose').addEventListener('click',close);setTimeout(()=>node.classList.add('visible'),30);}
  document.addEventListener('ds:terms-accepted',()=>setTimeout(show,250));if(window.DS_Terms?.isAccepted?.())setTimeout(show,400);
})();
