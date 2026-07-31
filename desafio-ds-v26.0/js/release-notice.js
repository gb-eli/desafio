(function(){
  'use strict';
  const RELEASE='26.0.0';
  const KEY='ds_last_seen_release';
  function show(){if(localStorage.getItem(KEY)===RELEASE||document.getElementById('releaseNotice'))return;const node=document.createElement('div');node.id='releaseNotice';node.className='release-notice';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.innerHTML=`<section><span>VERSÃO ${RELEASE}</span><h2>Obrigado por ajudar a melhorar</h2><p>Esta versão preserva as 88 aulas anteriores e acrescenta 21 aulas integradas de Cyber Segurança, análise de sistemas, MVP, validação e feedback, com mini laboratórios simulados.</p><div><button id="releaseSkip" class="btn ghost" type="button">Pular</button><button id="releaseClose" class="btn primary" type="button">Continuar</button></div></section>`;document.body.appendChild(node);const close=()=>{localStorage.setItem(KEY,RELEASE);node.remove();};node.querySelector('#releaseSkip').addEventListener('click',close);node.querySelector('#releaseClose').addEventListener('click',close);setTimeout(()=>node.classList.add('visible'),30);}
  document.addEventListener('ds:terms-accepted',()=>setTimeout(show,250));if(window.DS_Terms?.isAccepted?.())setTimeout(show,400);
})();
