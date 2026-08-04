(function(){
  'use strict';

  const PLATFORM_ID='desafio-ds';
  const PLATFORM_VERSION='29.1.0';
  const TERMS_ID='desafio-ds-termo-geral';
  const TERMS_VERSION='1.3.0';
  const SESSION_KEY='ds_terms_acceptance_v25';
  const encoder=new TextEncoder();
  let termsHash='';
  let currentRecord=null;
  let modal=null;

  const SECTIONS=[
    ['Finalidade educacional','Esta plataforma é utilizada exclusivamente para aprendizagem, prática, diagnóstico, revisão, recuperação, experimentação, simulação e produção de evidências escolares.'],
    ['Compromisso com as atividades','Realize pessoalmente as etapas, siga as orientações do professor, respeite a sequência pedagógica, dedique o tempo solicitado, entregue a evidência no formato indicado e informe dificuldades técnicas de forma verdadeira.'],
    ['Integridade acadêmica','Não copie respostas sem autorização, não entregue atividade de outra pessoa e não altere respostas, tempo, vidas, XP, resultados, histórico, evidências, arquivos exportados ou armazenamento para obter vantagem.'],
    ['Código e ferramentas de desenvolvimento','Não altere DOM, variáveis, objetos globais, localStorage, IndexedDB, Cache API, parâmetros de URL ou arquivos exportados para trapacear. Ferramentas de desenvolvimento só podem ser usadas quando fizerem parte da atividade ou houver autorização.'],
    ['Uso responsável de dispositivos e laboratórios','Utilize celular, Chromebook, notebook, computador e demais recursos conforme as normas da escola. Não acesse contas de outras pessoas, não apague arquivos de colegas e encerre a sessão ao terminar.'],
    ['Segurança e cibersegurança','Use técnicas somente em ambientes simulados, locais ou expressamente autorizados. Não tente acessar redes, contas, dispositivos, sites ou dados reais sem autorização.'],
    ['Cenários e informações fictícias','Empresas, personagens, redes, incidentes, mensagens, credenciais, moedas, transações, notícias, missões e sistemas podem ser fictícios ou adaptados exclusivamente para aprendizagem.'],
    ['Colaboração e feedback','Relate erros com clareza, sem dados pessoais desnecessários. Encontrar uma falha não autoriza explorá-la; interrompa a exploração e comunique o professor.'],
    ['XP e gamificação','XP, vidas, cartas, emblemas e recompensas são virtuais, não possuem valor financeiro, não podem ser vendidos e não determinam a nota.'],
    ['Registro de progresso e auditoria','A plataforma pode registrar localmente progresso, etapas, tentativas, tempo ativo, exportações, autorizações, aceite dos termos e eventos de integridade necessários ao funcionamento e à conferência pedagógica.'],
    ['Dados pessoais e privacidade','O aceite não autoriza coleta ilimitada, venda de dados, publicidade direcionada, publicação automática do nome, uso de imagem ou monitoramento invasivo.'],
    ['Créditos e reconhecimento','Contribuições podem ser reconhecidas por turma ou de forma reduzida. Nomes individuais só devem ser publicados conforme autorização e configuração do professor e da escola.'],
    ['Consequências pedagógicas e técnicas','Quando houver inconsistência, o progresso ou o XP pode ficar em análise e o professor pode solicitar nova execução. Nenhuma punição definitiva deve ser aplicada sem possibilidade de revisão humana.'],
    ['Dificuldades, acessibilidade e apoio','Dificuldades técnicas, adaptações e necessidades de acessibilidade não são tratadas como trapaça. O estudante pode solicitar ajuda, recurso alternativo e revisão do professor.'],
    ['Atualizações do termo','Alterações relevantes nas regras, privacidade, segurança, gamificação ou integrações exigirão novo aceite. Os registros anteriores permanecem no histórico do perfil.'],
    ['Declaração final','Ao aceitar, declaro que tive acesso ao resumo, pude abrir o texto completo e a política de privacidade, compreendi a finalidade educacional e comprometo-me a utilizar a plataforma de forma responsável.']
  ];

  const FULL_TEXT=`TERMO DE CIÊNCIA, USO RESPONSÁVEL E COMPROMISSO PEDAGÓGICO\n\n${SECTIONS.map((item,index)=>`${index+1}. ${item[0]}\n${item[1]}`).join('\n\n')}\n\nAo aceitar, declaro que tive acesso ao resumo, pude consultar o texto completo e a política de privacidade, compreendi a finalidade educacional e comprometo-me a utilizar a plataforma de forma responsável.`;

  const PRIVACY_TEXT=`POLÍTICA DE PRIVACIDADE EM LINGUAGEM SIMPLES\n\nA plataforma utiliza somente dados necessários para identificar a atividade, preservar o progresso, gerar evidências e registrar eventos técnicos. Perfis protegidos são criptografados no navegador com Web Crypto API e salvos em IndexedDB. Senhas não são armazenadas em texto puro. A aplicação não coleta endereço IP por código próprio, localização precisa, câmera, microfone, biometria ou histórico externo. Os dados podem ser exportados e excluídos pelo aluno. O navegador e a política do equipamento podem apagar os dados locais; por isso, backups são recomendados. Abrir o Google Classroom não confirma a entrega sem integração oficial. O responsável pedagógico e pela validação é o Professor Gabriel.`;

  const SIMULATION_TEXT=`AVISO SOBRE CENÁRIOS EDUCACIONAIS E SIMULAÇÕES FICTÍCIAS\n\nNomes, empresas, redes, incidentes, mensagens, credenciais, moedas, transações, notícias, personagens e sistemas podem ser fictícios, simulados ou adaptados para aprendizagem. Conteúdos de segurança devem ser utilizados somente em ambientes autorizados, controlados ou preparados para ensino. O objetivo é compreender riscos, prevenção e proteção, nunca incentivar dano ou acesso não autorizado.`;

  const uuid=()=>crypto.randomUUID?.()||`accept-${Date.now().toString(36)}-${Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('')}`;
  async function sha256(value){
    const text=String(value);
    if(globalThis.crypto?.subtle?.digest){
      const digest=await globalThis.crypto.subtle.digest('SHA-256',encoder.encode(text));
      return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    // Fallback de compatibilidade para contextos não seguros (ex.: arquivo local).
    // No GitHub Pages, o navegador utiliza SHA-256 pela Web Crypto API.
    let h1=0x811c9dc5,h2=0x9e3779b9;
    for(let i=0;i<text.length;i+=1){
      const c=text.charCodeAt(i);
      h1=Math.imul(h1^c,0x01000193)>>>0;
      h2=Math.imul(h2^(c+i),0x85ebca6b)>>>0;
    }
    const seed=(h1.toString(16).padStart(8,'0')+h2.toString(16).padStart(8,'0'));
    return seed.repeat(4).slice(0,64);
  }
  function readSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');}catch(_){return null;}}
  function profileRecord(){return window.DS_ProfileManager?.getPath?.(`acceptances.terms.${TERMS_ID}`,null)||null;}
  function valid(record){return !!record&&record.termsId===TERMS_ID&&record.termsVersion===TERMS_VERSION&&record.termsHash===termsHash&&record.status==='ACCEPTED';}
  function isAccepted(){return valid(profileRecord())||valid(currentRecord)||valid(readSession());}
  function evidence(){const record=profileRecord()||currentRecord||readSession();return valid(record)?{status:'aceito',termsId:record.termsId,termsVersion:record.termsVersion,acceptedAt:record.acceptedAt,acceptanceId:String(record.acceptanceId||'').slice(0,12),integrity:'verificada',platformVersion:record.platformVersion}:{status:'não validado',termsVersion:TERMS_VERSION,integrity:'pendente'};}

  function persist(record){
    currentRecord=record;
    sessionStorage.setItem(SESSION_KEY,JSON.stringify(record));
    if(window.DS_ProfileManager?.hasSession?.()){
      window.DS_ProfileManager.setPath(`acceptances.terms.${TERMS_ID}`,record);
      window.DS_ProfileManager.recordAudit?.('terms_accepted',{termsId:TERMS_ID,termsVersion:TERMS_VERSION,termsHash:termsHash.slice(0,16)});
      window.DS_ProfileManager.saveNow?.();
    }
  }

  function inject(){
    if(document.getElementById('termsModal'))return;
    modal=document.createElement('div');
    modal.id='termsModal';
    modal.className='terms-overlay hidden';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','termsTitle');
    modal.innerHTML=`<section class="terms-card">
      <header class="terms-head"><div><span class="modal-kicker">USO RESPONSÁVEL</span><h1 id="termsTitle">Termo de ciência e compromisso pedagógico</h1><p>Versão ${TERMS_VERSION} · Desafio DS v${PLATFORM_VERSION}</p></div><button id="termsAccessibility" class="btn ghost" type="button">Leitura facilitada</button></header>
      <div class="terms-summary"><strong>Resumo</strong><p>Use a plataforma para aprender, siga as orientações do professor e não altere código, armazenamento, XP, respostas ou evidências para obter vantagem. Cenários e incidentes podem ser fictícios. XP e recompensas não possuem valor financeiro nem determinam a nota.</p></div>
      <div class="terms-links"><button type="button" data-terms-view="full">Ver termo completo</button><button type="button" data-terms-view="privacy">Política de privacidade</button><button type="button" data-terms-view="simulation">Simulações fictícias</button><button id="termsDownload" type="button">Baixar uma cópia</button></div>
      <article id="termsDocument" class="terms-document" tabindex="0" aria-live="polite"><h2>Antes de continuar</h2><p>Abra os documentos acima quando precisar consultar os detalhes. Nenhuma caixa está marcada previamente.</p></article>
      <div class="terms-confirmations">
        <label><input id="termsRead" type="checkbox"> Li e compreendi o resumo e tive acesso ao termo completo.</label>
        <label><input id="termsResponsible" type="checkbox"> Concordo em utilizar a plataforma de forma responsável e exclusivamente educacional.</label>
      </div>
      <p id="termsMessage" class="mode-status" aria-live="polite"></p>
      <footer class="terms-actions"><button id="termsDecline" class="btn ghost" type="button">Não aceitar</button><button id="termsProfile" class="btn secondary" type="button">Perfis e backup</button><button id="termsAccept" class="btn primary" type="button" disabled>Aceitar e continuar</button></footer>
    </section>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-terms-view]').forEach(button=>button.addEventListener('click',()=>showDocument(button.dataset.termsView)));
    modal.querySelector('#termsDownload').addEventListener('click',downloadCopy);
    modal.querySelector('#termsAccessibility').addEventListener('click',()=>modal.classList.toggle('terms-simple'));
    modal.querySelector('#termsRead').addEventListener('change',updateButton);
    modal.querySelector('#termsResponsible').addEventListener('change',updateButton);
    modal.querySelector('#termsAccept').addEventListener('click',accept);
    modal.querySelector('#termsDecline').addEventListener('click',decline);
    modal.querySelector('#termsProfile').addEventListener('click',()=>document.getElementById('profileOpenBtn')?.click());
  }

  function showDocument(type){
    const node=modal.querySelector('#termsDocument');
    node.replaceChildren();
    const title=document.createElement('h2');
    const pre=document.createElement('pre');
    if(type==='privacy'){title.textContent='Política de privacidade';pre.textContent=PRIVACY_TEXT;}
    else if(type==='simulation'){title.textContent='Aviso sobre simulações';pre.textContent=SIMULATION_TEXT;}
    else{title.textContent='Termo completo';pre.textContent=FULL_TEXT;}
    node.append(title,pre);node.focus();
  }
  function updateButton(){modal.querySelector('#termsAccept').disabled=!(modal.querySelector('#termsRead').checked&&modal.querySelector('#termsResponsible').checked);}
  async function accept(){
    const read=modal.querySelector('#termsRead').checked,responsible=modal.querySelector('#termsResponsible').checked;
    if(!read||!responsible)return;
    const previous=profileRecord()||readSession();
    const record={acceptanceId:uuid(),profileId:window.DS_ProfileManager?.current?.()?.id||'session',termsId:TERMS_ID,termsVersion:TERMS_VERSION,termsHash,platformId:PLATFORM_ID,platformVersion:PLATFORM_VERSION,activityId:'platform-general',activityTermsVersion:'1.0.0',classId:window.DS_ProfileManager?.current?.()?.identity?.classKey||'',acceptedAt:new Date().toISOString(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Sao_Paulo',acceptanceMethod:'checkbox-explicit',readConfirmation:true,responsibleUseConfirmation:true,privacyNoticeViewed:modal.querySelector('#termsDocument')?.textContent?.includes('PRIVACIDADE')||false,fullTermsOpened:modal.querySelector('#termsDocument')?.textContent?.includes('TERMO DE CIÊNCIA')||false,deviceSessionId:sessionStorage.getItem('ds_eduauth_session_id')||'',appSchemaVersion:'2.0.0',status:'ACCEPTED',previousAcceptanceId:previous?.acceptanceId||null,integrityTag:(await sha256(`${termsHash}|${Date.now()}|${PLATFORM_ID}`)).slice(0,32)};
    persist(record);hide();document.dispatchEvent(new CustomEvent('ds:terms-accepted',{detail:{record:evidence()}}));
  }
  function decline(){const msg=modal.querySelector('#termsMessage');msg.textContent='Sem o aceite, novas atividades permanecem bloqueadas. Você ainda pode abrir Perfis e backup para exportar seus dados.';msg.className='mode-status warn';}
  function open(){inject();modal.classList.remove('hidden');document.body.classList.add('terms-blocked','modal-open');setTimeout(()=>modal.querySelector('#termsRead')?.focus(),30);}
  function hide(){modal?.classList.add('hidden');document.body.classList.remove('terms-blocked','modal-open');}
  async function ensureAccepted(){if(!termsHash)termsHash=await sha256(FULL_TEXT);if(isAccepted())return true;open();return false;}
  function downloadCopy(){const content=`${FULL_TEXT}\n\n${PRIVACY_TEXT}\n\n${SIMULATION_TEXT}\n\nVersão do termo: ${TERMS_VERSION}\nPlataforma: ${PLATFORM_VERSION}`;const blob=new Blob([content],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`DESAFIO_DS_TERMOS_${TERMS_VERSION}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  async function syncProfile(){if(!termsHash)termsHash=await sha256(FULL_TEXT);const stored=profileRecord();if(valid(stored)){currentRecord=stored;sessionStorage.setItem(SESSION_KEY,JSON.stringify(stored));hide();return;}const session=readSession();if(valid(session)&&window.DS_ProfileManager?.hasSession?.()&&!valid(stored)){persist({...session,profileId:window.DS_ProfileManager.current()?.id||session.profileId});hide();}}
  async function init(){termsHash=await sha256(FULL_TEXT);inject();currentRecord=readSession();document.addEventListener('ds:profile-unlocked',syncProfile);document.addEventListener('ds:profile-temporary',syncProfile);await ensureAccepted();}

  window.DS_Terms=Object.freeze({init,isAccepted,ensureAccepted,open,evidence,version:TERMS_VERSION,termsId:TERMS_ID,hash:()=>termsHash,fullText:FULL_TEXT,privacyText:PRIVACY_TEXT,simulationText:SIMULATION_TEXT});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
