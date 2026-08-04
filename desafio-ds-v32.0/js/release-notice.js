(function(){
  'use strict';
  const RELEASE='29.1.0',KEY='ds_last_seen_release';
  const read=()=>{try{return localStorage.getItem(KEY);}catch(_){return null;}};
  const write=()=>{try{localStorage.setItem(KEY,RELEASE);}catch(_){}};
  function show(){if(read()===RELEASE||document.getElementById('releaseNotice'))return;const node=document.createElement('div');node.id='releaseNotice';node.className='release-notice';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.innerHTML=`<section><span>VERSÃO ${RELEASE}</span><h2>Classroom organizado por disciplina</h2><p>Agora o botão Abrir Classroom mostra somente as disciplinas da turma do perfil. Escolha a disciplina correta antes de acessar a sala e anexar sua atividade.</p><div><button id="releaseSkip" class="btn ghost" type="button">Pular</button><button id="releaseClose" class="btn primary" type="button">Continuar</button></div></section>`;document.body.appendChild(node);const close=()=>{write();node.remove();};node.querySelector('#releaseSkip').addEventListener('click',close);node.querySelector('#releaseClose').addEventListener('click',close);setTimeout(()=>node.classList.add('visible'),30);}
  document.addEventListener('ds:terms-accepted',()=>setTimeout(show,250));if(window.DS_Terms?.isAccepted?.())setTimeout(show,400);
})();
