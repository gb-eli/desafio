(function(){
  'use strict';

  const DB_NAME='desafio_ds_profiles';
  const DB_VERSION=1;
  const PROFILE_STORE='profiles';
  const SETTINGS_STORE='settings';
  const PROFILE_FORMAT='edu-profile-1';
  const PROFILE_SCHEMA='2.0.0';
  const EXPIRATION_DAYS=6;
  const PBKDF2_ITERATIONS=210000;
  const AUTO_LOCK_MS=10*60*1000;
  const encoder=new TextEncoder();
  const decoder=new TextDecoder();
  let dbPromise=null;
  let currentSession=null;
  let saveTimer=null;
  let lockTimer=null;

  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const nowIso=()=>new Date().toISOString();
  const addDays=(iso,days)=>new Date(new Date(iso).getTime()+days*86400000).toISOString();
  const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const fromB64=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
  const randomBytes=n=>crypto.getRandomValues(new Uint8Array(n));
  const uuid=()=>crypto.randomUUID?.()||`p-${Date.now().toString(36)}-${b64(randomBytes(8)).replace(/[^a-z0-9]/gi,'').slice(0,12)}`;
  const safeText=(value,max=120)=>String(value||'').replace(/[<>\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const publicName=name=>{const parts=safeText(name,80).split(/\s+/).filter(Boolean);return parts.length>1?`${parts[0]} ${parts.at(-1).charAt(0).toUpperCase()}.`:parts[0]||'Perfil';};

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!('indexedDB'in window))return reject(new Error('IndexedDB indisponível'));
      const request=indexedDB.open(DB_NAME,DB_VERSION);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(PROFILE_STORE))db.createObjectStore(PROFILE_STORE,{keyPath:'id'});
        if(!db.objectStoreNames.contains(SETTINGS_STORE))db.createObjectStore(SETTINGS_STORE,{keyPath:'key'});
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Falha ao abrir armazenamento'));
    });
    return dbPromise;
  }
  async function storeGet(store,key){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const req=tx.objectStore(store).get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}
  async function storeAll(store){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const req=tx.objectStore(store).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});}
  async function storePut(store,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);});}
  async function storeDelete(store,key){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}

  async function sha256(value){const digest=await crypto.subtle.digest('SHA-256',typeof value==='string'?encoder.encode(value):value);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
  async function derivePasswordKey(password,salt,iterations=PBKDF2_ITERATIONS){
    const material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function importDataKey(raw,usages=['encrypt','decrypt']){return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,usages);}
  async function aesEncrypt(key,value,aad=''){
    const iv=randomBytes(12);const data=typeof value==='string'?encoder.encode(value):value;
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(aad)},key,data);
    return {iv:b64(iv),cipher:b64(cipher)};
  }
  async function aesDecrypt(key,wrapped,aad=''){
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(wrapped.iv),additionalData:encoder.encode(aad)},key,fromB64(wrapped.cipher));
    return new Uint8Array(plain);
  }
  async function encryptPayload(dek,payload,id){return aesEncrypt(await importDataKey(dek),JSON.stringify(payload),`profile:${id}`);}
  async function decryptPayload(dek,record){return JSON.parse(decoder.decode(await aesDecrypt(await importDataKey(dek),record.payload,`profile:${record.id}`)));}
  async function wrapDekWithPassword(dek,password,id,salt=randomBytes(16),iterations=PBKDF2_ITERATIONS){
    const kek=await derivePasswordKey(password,salt,iterations);const wrapped=await aesEncrypt(kek,dek,`student-wrap:${id}`);
    return {kdf:'PBKDF2-HMAC-SHA-256',iterations,salt:b64(salt),...wrapped};
  }
  async function unwrapDekWithPassword(wrap,password,id){const kek=await derivePasswordKey(password,fromB64(wrap.salt),wrap.iterations);return aesDecrypt(kek,wrap,`student-wrap:${id}`);}

  async function appendAudit(data,type,details={}){
    data.audit=Array.isArray(data.audit)?data.audit:[];
    const previous=data.audit.at(-1)?.hash||'GENESIS';
    const event={id:uuid(),type,at:nowIso(),platform:'desafio-ds',version:'21.0.0',details:clone(details),previousHash:previous};
    event.hash=await sha256(JSON.stringify(event));data.audit.push(event);
    if(data.audit.length>600)data.audit=data.audit.slice(-600);
  }
  async function recordAudit(type,details={}){
    if(!currentSession)return false;
    await appendAudit(currentSession.data,safeText(type,80),details&&typeof details==='object'?details:{});
    queueSave(20);return true;
  }
  function newData(identity){return {schemaVersion:PROFILE_SCHEMA,identity:{name:safeText(identity.name,80),publicName:publicName(identity.name),classKey:safeText(identity.classKey,40),createdAt:nowIso(),originId:uuid()},preferences:{},platforms:{},exports:[],imports:[],migrations:[],audit:[]};}

  async function getRecoveryPublicKey(){return (await storeGet(SETTINGS_STORE,'teacherRecoveryPublicKey'))?.value||null;}
  async function teacherWrapDek(dek,publicJwk,id){
    if(!publicJwk)return null;
    const key=await crypto.subtle.importKey('jwk',publicJwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
    const cipher=await crypto.subtle.encrypt({name:'RSA-OAEP',label:encoder.encode(`profile:${id}`)},key,dek);
    return {alg:'RSA-OAEP-256',cipher:b64(cipher),keyId:await sha256(JSON.stringify(publicJwk))};
  }

  async function createProfile({name,classKey,password,nickname}){
    if(String(password||'').length<6)throw new Error('Use uma senha local com pelo menos 6 caracteres.');
    const id=uuid(),created=nowIso(),dek=randomBytes(32),data=newData({name,classKey});
    await appendAudit(data,'profile_created',{classKey:safeText(classKey,40)});
    const publicKey=await getRecoveryPublicKey();
    const record={id,format:PROFILE_FORMAT,schemaVersion:PROFILE_SCHEMA,displayName:safeText(nickname,30)||publicName(name),classKey:safeText(classKey,40),createdAt:created,updatedAt:created,expiresAt:addDays(created,EXPIRATION_DAYS),studentWrap:await wrapDekWithPassword(dek,password,id),teacherWrap:await teacherWrapDek(dek,publicKey,id),payload:await encryptPayload(dek,data,id)};
    await storePut(PROFILE_STORE,record);await unlockRecord(record,password,'profile_created');return record;
  }
  async function unlockRecord(record,password,eventType='profile_unlocked'){
    if(new Date(record.expiresAt).getTime()<Date.now()){await storeDelete(PROFILE_STORE,record.id);throw new Error('Este perfil expirou e foi removido deste dispositivo.');}
    const dek=await unwrapDekWithPassword(record.studentWrap,password,record.id);
    const data=await decryptPayload(dek,record);
    currentSession={type:'profile',id:record.id,record,dek,data,dirty:false};
    await appendAudit(data,eventType,{});queueSave(30);resetLockTimer();broadcast('unlocked');return clone(data);
  }
  async function unlockProfile(id,password){const record=await storeGet(PROFILE_STORE,id);if(!record)throw new Error('Perfil não encontrado.');try{return await unlockRecord(record,password);}catch(error){throw new Error('Senha incorreta ou perfil danificado.');}}
  function startTemporary(identity={}){currentSession={type:'temporary',id:`temp-${uuid()}`,data:newData({name:identity.name||'',classKey:identity.classKey||''}),dirty:false};sessionStorage.setItem('ds-temp-profile','1');broadcast('temporary');return clone(currentSession.data);}
  function hasSession(){return !!currentSession;}
  function isUnlocked(){return currentSession?.type==='profile';}
  function isTemporary(){return currentSession?.type==='temporary';}
  function current(){return currentSession?{type:currentSession.type,id:currentSession.id,identity:clone(currentSession.data.identity),expiresAt:currentSession.record?.expiresAt||null}:null;}
  function getPlatformData(platform,fallback={}){return clone(currentSession?.data?.platforms?.[platform]??fallback);}
  function setPlatformData(platform,value){if(!currentSession)return false;currentSession.data.platforms=currentSession.data.platforms||{};currentSession.data.platforms[platform]=clone(value);currentSession.dirty=true;queueSave();return true;}
  function getPath(path,fallback=null){if(!currentSession)return clone(fallback);const parts=String(path).split('.');let value=currentSession.data;for(const part of parts){if(value==null||typeof value!=='object'||!(part in value))return clone(fallback);value=value[part];}return clone(value);}
  function setPath(path,value){if(!currentSession)return false;const parts=String(path).split('.');let target=currentSession.data;parts.slice(0,-1).forEach(part=>{if(!target[part]||typeof target[part]!=='object')target[part]={};target=target[part];});target[parts.at(-1)]=clone(value);currentSession.dirty=true;queueSave();return true;}
  async function saveNow(){
    clearTimeout(saveTimer);saveTimer=null;
    if(!currentSession||currentSession.type!=='profile'||!currentSession.dirty)return;
    const record=await storeGet(PROFILE_STORE,currentSession.id);if(!record)return;
    const now=nowIso();record.updatedAt=now;record.expiresAt=addDays(now,EXPIRATION_DAYS);record.classKey=currentSession.data.identity.classKey||record.classKey;record.payload=await encryptPayload(currentSession.dek,currentSession.data,record.id);
    await storePut(PROFILE_STORE,record);currentSession.record=record;currentSession.dirty=false;broadcast('saved');
  }
  function queueSave(delay=500){if(currentSession?.type!=='profile')return;currentSession.dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveNow().catch(console.error),delay);}
  async function lock(reason='manual'){if(currentSession?.type==='profile'){await appendAudit(currentSession.data,'profile_locked',{reason});await saveNow();}currentSession=null;clearTimeout(lockTimer);broadcast('locked',{reason});}
  function resetLockTimer(){if(!isUnlocked())return;clearTimeout(lockTimer);lockTimer=setTimeout(()=>lock('inactivity'),AUTO_LOCK_MS);}
  function broadcast(type,detail={}){document.dispatchEvent(new CustomEvent(`ds:profile-${type}`,{detail:{...detail,profile:current()}}));renderProfileStatus();}

  async function listProfiles(){const rows=await storeAll(PROFILE_STORE);const now=Date.now();for(const row of rows){if(new Date(row.expiresAt).getTime()<now)await storeDelete(PROFILE_STORE,row.id);}return (await storeAll(PROFILE_STORE)).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).map(row=>({id:row.id,displayName:row.displayName,classKey:row.classKey,updatedAt:row.updatedAt,expiresAt:row.expiresAt,hasRecovery:!!row.teacherWrap}));}
  async function deleteProfile(id,password){if(currentSession?.id===id){const record=await storeGet(PROFILE_STORE,id);await unwrapDekWithPassword(record.studentWrap,password,id);await lock('deleted');}else{const record=await storeGet(PROFILE_STORE,id);if(!record)throw new Error('Perfil não encontrado.');await unwrapDekWithPassword(record.studentWrap,password,id);}await storeDelete(PROFILE_STORE,id);broadcast('deleted',{id});}
  async function exportProfile(id=currentSession?.id){const record=await storeGet(PROFILE_STORE,id);if(!record)throw new Error('Perfil não encontrado.');const packageData={format:PROFILE_FORMAT,exportedAt:nowIso(),record};downloadJson(packageData,`perfil-educacional-${record.id.slice(0,8)}.edu-profile`);if(currentSession?.id===id){currentSession.data.exports.push({id:uuid(),at:nowIso(),hash:await sha256(JSON.stringify(record))});await appendAudit(currentSession.data,'profile_exported',{});queueSave(20);}return packageData;}
  async function importProfileFile(file){
    if(!file||file.size>6_000_000)throw new Error('Arquivo ausente ou maior que 6 MB.');
    const text=await file.text();let parsed;
    try{parsed=window.DS_Sanitize?.parseJsonSafe?window.DS_Sanitize.parseJsonSafe(text,{maxChars:6_000_000,maxDepth:20,maxKeys:12000}):JSON.parse(text);}catch(_){throw new Error('Arquivo de perfil inválido ou com estrutura não permitida.');}
    if(parsed?.format!==PROFILE_FORMAT||!parsed.record?.id||!parsed.record?.payload)throw new Error('Formato de perfil incompatível.');
    const existing=await storeGet(PROFILE_STORE,parsed.record.id);if(existing)throw new Error('Já existe um perfil com este identificador. Exclua o perfil local ou importe como cópia em outra versão.');
    parsed.record.updatedAt=nowIso();parsed.record.expiresAt=addDays(nowIso(),EXPIRATION_DAYS);await storePut(PROFILE_STORE,parsed.record);broadcast('imported',{id:parsed.record.id});return parsed.record;
  }

  async function createRecoveryKit(masterPassword){
    if(String(masterPassword||'').length<10)throw new Error('Use uma frase-senha administrativa com pelo menos 10 caracteres.');
    const pair=await crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:3072,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
    const publicJwk=await crypto.subtle.exportKey('jwk',pair.publicKey);const privateJwk=await crypto.subtle.exportKey('jwk',pair.privateKey);const salt=randomBytes(16),key=await derivePasswordKey(masterPassword,salt,PBKDF2_ITERATIONS);const privateWrap=await aesEncrypt(key,JSON.stringify(privateJwk),'teacher-recovery-kit');
    const keyId=(await sha256(JSON.stringify(publicJwk))).slice(0,16).toUpperCase();const kit={format:'ds-teacher-recovery-1',keyId,createdAt:nowIso(),publicJwk,privateWrap:{kdf:'PBKDF2-HMAC-SHA-256',iterations:PBKDF2_ITERATIONS,salt:b64(salt),...privateWrap}};
    await storePut(SETTINGS_STORE,{key:'teacherRecoveryPublicKey',value:publicJwk,keyId,updatedAt:nowIso()});downloadJson(kit,`chave-recuperacao-professor-${keyId}.ds-recovery-key`);broadcast('recovery-configured',{keyId});return kit;
  }
  async function recoverProfile({profileId,file,masterPassword,newPassword}){
    if(String(newPassword||'').length<6)throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
    const kit=window.DS_Sanitize?.parseJsonSafe?window.DS_Sanitize.parseJsonSafe(await file.text(),{maxChars:2_000_000,maxDepth:16,maxKeys:5000}):JSON.parse(await file.text());if(kit?.format!=='ds-teacher-recovery-1')throw new Error('Arquivo administrativo incompatível.');
    const wrap=kit.privateWrap;const kek=await derivePasswordKey(masterPassword,fromB64(wrap.salt),wrap.iterations);let privateJwk;try{privateJwk=JSON.parse(decoder.decode(await aesDecrypt(kek,wrap,'teacher-recovery-kit')));}catch(_){throw new Error('Senha mestre ou arquivo administrativo incorreto.');}
    const record=await storeGet(PROFILE_STORE,profileId);if(!record?.teacherWrap)throw new Error('Este perfil não possui envelope de recuperação administrativa.');
    const privateKey=await crypto.subtle.importKey('jwk',privateJwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);
    let dek;try{dek=new Uint8Array(await crypto.subtle.decrypt({name:'RSA-OAEP',label:encoder.encode(`profile:${record.id}`)},privateKey,fromB64(record.teacherWrap.cipher)));}catch(_){throw new Error('A chave administrativa não corresponde a este perfil.');}
    const data=await decryptPayload(dek,record);await appendAudit(data,'administrative_password_reset',{progressPreserved:true,identityChanged:false,keyId:kit.keyId});record.studentWrap=await wrapDekWithPassword(dek,newPassword,record.id);record.payload=await encryptPayload(dek,data,record.id);record.updatedAt=nowIso();record.expiresAt=addDays(nowIso(),EXPIRATION_DAYS);await storePut(PROFILE_STORE,record);broadcast('recovered',{id:record.id});return true;
  }
  async function attachRecoveryToCurrent(){if(!isUnlocked())throw new Error('Desbloqueie um perfil primeiro.');const publicKey=await getRecoveryPublicKey();if(!publicKey)throw new Error('Configure primeiro a chave de recuperação do professor.');const record=await storeGet(PROFILE_STORE,currentSession.id);record.teacherWrap=await teacherWrapDek(currentSession.dek,publicKey,record.id);await appendAudit(currentSession.data,'recovery_envelope_added',{keyId:record.teacherWrap.keyId});record.payload=await encryptPayload(currentSession.dek,currentSession.data,record.id);await storePut(PROFILE_STORE,record);currentSession.record=record;broadcast('recovery-attached',{id:record.id});}

  function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function formatDate(value){return new Date(value).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});}

  let modal,profileList,statusNode,recoveryAuthorizedUntil=0;
  function injectUi(){
    const card=document.querySelector('.start-card');if(!card||document.getElementById('profileAccessPanel'))return;
    const panel=document.createElement('section');panel.id='profileAccessPanel';panel.className='profile-access-panel';panel.innerHTML=`<div><span class="profile-kicker">CONTINUIDADE</span><strong id="profileStatusText">Sessão temporária</strong><small id="profileStatusDetail">Crie um perfil protegido para continuar neste dispositivo.</small></div><div class="profile-access-actions"><button id="profileOpenBtn" class="btn secondary" type="button">Perfis locais</button><button id="profileTempBtn" class="btn ghost" type="button">Continuar sem salvar</button></div>`;
    card.insertBefore(panel,card.firstChild);statusNode=panel;
    modal=document.createElement('div');modal.id='profileManagerModal';modal.className='modal-overlay hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','profileManagerTitle');modal.innerHTML=`<div class="modal-card profile-manager-card"><div class="profile-modal-head"><div><span class="modal-kicker">PERFIL LOCAL PROTEGIDO</span><h2 id="profileManagerTitle">Continuidade neste dispositivo</h2></div><button id="profileCloseBtn" class="btn ghost" type="button">Fechar</button></div><p class="profile-privacy-note">A senha protege somente este perfil local. Não use a senha do Google, Classroom, e-mail ou GitHub.</p><div class="profile-tabs" role="tablist"><button class="active" data-profile-tab="profiles" type="button">Perfis</button><button data-profile-tab="create" type="button">Criar</button><button data-profile-tab="import" type="button">Importar</button><button data-profile-tab="recovery" type="button">Recuperação</button></div><div id="profileTabContent"></div><p id="profileManagerMessage" class="mode-status" aria-live="polite"></p></div>`;document.body.appendChild(modal);
    panel.querySelector('#profileOpenBtn').addEventListener('click',()=>openManager('profiles'));
    panel.querySelector('#profileTempBtn').addEventListener('click',()=>{startTemporary(readIdentityFromForms());fillFormsFromSession();renderProfileStatus();showToast('Sessão temporária iniciada. Exporte seus resultados antes de fechar.');});
    modal.querySelector('#profileCloseBtn').addEventListener('click',closeManager);
    modal.addEventListener('click',event=>{if(event.target===modal)closeManager();});
    modal.querySelectorAll('[data-profile-tab]').forEach(button=>button.addEventListener('click',()=>openManager(button.dataset.profileTab)));
    ['startForm','guidedStartForm'].forEach(id=>document.getElementById(id)?.addEventListener('submit',()=>{if(!hasSession())startTemporary(readIdentityFromForms());}));
    document.addEventListener('ds:challenge-result',event=>{if(!hasSession())return;const history=getPlatformData('desafio',{history:[]});history.history=Array.isArray(history.history)?history.history:[];history.history.unshift(event.detail);history.history=history.history.slice(0,20);setPlatformData('desafio',history);});
    ['pointerdown','keydown','touchstart'].forEach(type=>document.addEventListener(type,resetLockTimer,{passive:true}));
  }
  function readIdentityFromForms(){return {name:document.getElementById('guidedPlayerName')?.value||document.getElementById('playerName')?.value||'',classKey:document.getElementById('guidedPlayerClass')?.value||document.getElementById('playerClass')?.value||''};}
  function fillFormsFromSession(){const identity=currentSession?.data?.identity;if(!identity)return;['playerName','guidedPlayerName'].forEach(id=>{const node=document.getElementById(id);if(node&&!node.value)node.value=identity.name||'';});['playerClass','guidedPlayerClass'].forEach(id=>{const node=document.getElementById(id);if(node&&[...node.options].some(o=>o.value===identity.classKey))node.value=identity.classKey;node?.dispatchEvent(new Event('change'));});}
  function openManager(tab='profiles'){modal?.classList.remove('hidden');document.body.classList.add('modal-open');modal?.querySelectorAll('[data-profile-tab]').forEach(b=>b.classList.toggle('active',b.dataset.profileTab===tab));renderTab(tab).catch(error=>message(error.message,'error'));}
  function closeManager(){modal?.classList.add('hidden');document.body.classList.remove('modal-open');}
  function message(text,type=''){const node=document.getElementById('profileManagerMessage');if(node){node.textContent=text;node.className=`mode-status ${type}`;}}
  async function renderTab(tab){const content=document.getElementById('profileTabContent');message('');if(tab==='create')return renderCreate(content);if(tab==='import')return renderImport(content);if(tab==='recovery')return renderRecovery(content);return renderProfiles(content);}
  async function renderProfiles(content){const rows=await listProfiles();profileList=rows;content.innerHTML=`<div class="profile-list">${rows.length?rows.map(row=>`<article class="profile-row"><div><strong>${escapeHtml(row.displayName)}</strong><span>${escapeHtml(row.classKey||'Turma não definida')} • expira ${formatDate(row.expiresAt)}</span><small>${row.hasRecovery?'Recuperação administrativa configurada':'Sem recuperação administrativa'}</small></div><div><button class="btn tiny primary" data-unlock="${row.id}" type="button">Desbloquear</button><button class="btn tiny ghost" data-export="${row.id}" type="button">Backup</button><button class="btn tiny danger" data-delete="${row.id}" type="button">Excluir</button></div></article>`).join(''):'<div class="profile-empty"><strong>Nenhum perfil neste computador</strong><p>Crie um perfil protegido ou continue em sessão temporária.</p></div>'}</div><div class="profile-current-actions">${isUnlocked()?'<button id="profileLockNow" class="btn secondary" type="button">Sair e bloquear</button><button id="profileProtectStorage" class="btn ghost" type="button">Proteger armazenamento</button><button id="profileAttachRecovery" class="btn ghost" type="button">Vincular recuperação administrativa</button>':''}</div>`;
    content.querySelectorAll('[data-unlock]').forEach(button=>button.addEventListener('click',async()=>{const password=prompt('Digite a senha local deste perfil:');if(password==null)return;try{await unlockProfile(button.dataset.unlock,password);fillFormsFromSession();message('Perfil desbloqueado. O progresso será salvo de forma criptografada.','ok');setTimeout(closeManager,700);}catch(error){message(error.message,'error');}}));
    content.querySelectorAll('[data-export]').forEach(button=>button.addEventListener('click',()=>exportProfile(button.dataset.export).then(()=>message('Backup criptografado gerado.','ok')).catch(error=>message(error.message,'error'))));
    content.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',async()=>{const password=prompt('Confirme a senha local para excluir este perfil do computador:');if(password==null)return;if(!confirm('Excluir este perfil deste computador? Exporte um backup antes, se necessário.'))return;try{await deleteProfile(button.dataset.delete,password);message('Perfil removido deste computador.','ok');renderProfiles(content);}catch(error){message(error.message,'error');}}));
    content.querySelector('#profileLockNow')?.addEventListener('click',()=>lock('manual').then(()=>{message('Perfil bloqueado.','ok');renderProfiles(content);}));
    content.querySelector('#profileProtectStorage')?.addEventListener('click',async()=>{const result=await window.DS_Permissions?.requestPersistentStorage?.();message(result?.allowed&&result?.value?'O navegador aceitou preservar o armazenamento.':'A preservação não foi garantida. Mantenha backups do perfil.','ok');});
    content.querySelector('#profileAttachRecovery')?.addEventListener('click',()=>attachRecoveryToCurrent().then(()=>message('Envelope de recuperação vinculado.','ok')).catch(error=>message(error.message,'error')));
  }
  function renderCreate(content){content.innerHTML=`<form id="profileCreateForm" class="profile-form"><label>Nome do aluno<input name="name" maxlength="80" required></label><label>Turma<select name="classKey"><option value="1DS">1º DS — Manhã</option><option value="2DS">2º DS — Manhã</option><option value="3DS">3º DS — Manhã</option><option value="2DS Noite">Subsequente — Noite</option></select></label><label>Apelido visual opcional<input name="nickname" maxlength="30" placeholder="Ex.: Gabriel A."></label><label>Senha local<input name="password" type="password" minlength="6" required autocomplete="new-password"></label><label>Confirmar senha<input name="confirm" type="password" minlength="6" required autocomplete="new-password"></label><button class="btn primary full" type="submit">Criar perfil protegido</button></form>`;content.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));if(data.password!==data.confirm)return message('As senhas não coincidem.','error');try{await createProfile(data);fillFormsFromSession();message('Perfil criado e desbloqueado.','ok');setTimeout(closeManager,700);}catch(error){message(error.message,'error');}});}
  function renderImport(content){content.innerHTML=`<form id="profileImportForm" class="profile-form"><p>Selecione um arquivo <code>.edu-profile</code>. O pacote continuará criptografado e exigirá a senha original para ser aberto.</p><label>Arquivo de backup<input name="file" type="file" accept=".edu-profile,application/json" required></label><button class="btn primary full" type="submit">Importar perfil</button></form>`;content.querySelector('form').addEventListener('submit',async event=>{event.preventDefault();const file=event.currentTarget.elements.file.files[0];try{await importProfileFile(file);message('Perfil importado. Abra a aba Perfis para desbloquear.','ok');}catch(error){message(error.message,'error');}});}
  async function authorizeRecovery(){
    if(Date.now()<recoveryAuthorizedUntil)return true;
    const currentClass=currentSession?.data?.identity?.classKey||currentSession?.record?.classKey||'__all__';
    try{await window.DS_EduAuth.authorize({actionId:'profile-recovery',classId:window.DS_EDUAUTH_CONFIG?.registries?.classes?.[currentClass]?currentClass:'__all__',subjectId:'auditoria-docente',lessonId:'perfil-local',activityId:'perfil',resourceId:currentSession?.id||'profile-manager',reason:'Acesso à recuperação administrativa'});recoveryAuthorizedUntil=Date.now()+5*60*1000;return true;}catch(error){message(error?.message||'Recuperação não autorizada.','error');return false;}
  }

  async function renderRecovery(content){
    content.innerHTML='<div class="profile-empty"><strong>Validando acesso administrativo…</strong></div>';
    if(!(await authorizeRecovery())){content.innerHTML='<div class="profile-empty"><strong>Acesso cancelado</strong><p>A recuperação administrativa não foi aberta.</p></div>';return;}
    content.innerHTML=`<details open><summary>Configurar recuperação do professor</summary><p>Gere uma chave administrativa em um computador seguro. A chave privada será baixada e nunca ficará no site público.</p><form id="recoverySetupForm" class="profile-form"><label>Frase-senha mestre<input name="master" type="password" minlength="10" required autocomplete="new-password"></label><button class="btn secondary full" type="submit">Gerar arquivo administrativo</button></form></details><details><summary>Redefinir senha de um aluno</summary><form id="recoveryResetForm" class="profile-form"><label>Perfil<select name="profileId"></select></label><label>Arquivo administrativo<input name="file" type="file" accept=".ds-recovery-key,application/json" required></label><label>Frase-senha mestre<input name="masterPassword" type="password" required></label><label>Nova senha local<input name="newPassword" type="password" minlength="6" required></label><button class="btn primary full" type="submit">Redefinir senha preservando o progresso</button></form></details>`;
    const select=content.querySelector('[name="profileId"]');listProfiles().then(rows=>select.innerHTML=rows.map(row=>`<option value="${row.id}">${escapeHtml(row.displayName)} — ${escapeHtml(row.classKey)}</option>`).join(''));
    content.querySelector('#recoverySetupForm').addEventListener('submit',async event=>{event.preventDefault();try{await createRecoveryKit(event.currentTarget.elements.master.value);message('Arquivo administrativo gerado. Guarde-o fora do GitHub e faça backup.','ok');}catch(error){message(error.message,'error');}});
    content.querySelector('#recoveryResetForm').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;try{await window.DS_EduAuth.authorize({actionId:'profile-recovery-reset',classId:'__all__',subjectId:'auditoria-docente',lessonId:'perfil-local',activityId:'perfil',resourceId:form.elements.profileId.value,reason:'Redefinição de senha preservando progresso'});await recoverProfile({profileId:form.elements.profileId.value,file:form.elements.file.files[0],masterPassword:form.elements.masterPassword.value,newPassword:form.elements.newPassword.value});message('Senha redefinida com autorização administrativa. O progresso foi preservado.','ok');}catch(error){message(error.message,'error');}});
  }
  function renderProfileStatus(){if(!statusNode)return;const title=statusNode.querySelector('#profileStatusText'),detail=statusNode.querySelector('#profileStatusDetail');if(isUnlocked()){title.textContent=`Perfil desbloqueado: ${currentSession.record?.displayName||currentSession.data.identity.publicName}`;detail.textContent=`Progresso criptografado • expira ${formatDate(currentSession.record.expiresAt)}`;}else if(isTemporary()){title.textContent='Sessão temporária';detail.textContent='O progresso não será mantido após fechar. Exporte seus resultados.';}else{title.textContent='Sem perfil ativo';detail.textContent='Crie ou desbloqueie um perfil, ou continue sem salvar.';}}
  function showToast(text){let node=document.getElementById('profileToast');if(!node){node=document.createElement('div');node.id='profileToast';node.className='profile-toast';document.body.appendChild(node);}node.textContent=text;node.classList.add('show');setTimeout(()=>node.classList.remove('show'),4200);}

  async function migrateLegacyIfPossible(){if(!isUnlocked())return;const oldProfile=localStorage.getItem('desafio_ds_guided_profile_v19'),oldProgress=localStorage.getItem('desafio_ds_guided_v19');if(!oldProfile&&!oldProgress)return;const existing=getPath('platforms.guided.legacyImportedAt',null);if(existing)return;let profileData=null,progressData=null;try{profileData=oldProfile?JSON.parse(oldProfile):null;}catch(_){}try{progressData=oldProgress?JSON.parse(oldProgress):null;}catch(_){}setPath('platforms.guided.legacy',{profile:profileData,progress:progressData,legacyImportedAt:nowIso()});await appendAudit(currentSession.data,'legacy_localstorage_migrated',{guided:!!oldProgress});localStorage.removeItem('desafio_ds_guided_profile_v19');localStorage.removeItem('desafio_ds_guided_v19');localStorage.removeItem('desafio_ds_guided_support_v19');queueSave(20);}

  async function init(){
    try{await openDb();}catch(error){console.warn(error);}
    injectUi();renderProfileStatus();
    document.addEventListener('ds:profile-unlocked',migrateLegacyIfPossible,{once:false});
    window.addEventListener('beforeunload',()=>{if(currentSession?.type==='profile'&&currentSession.dirty)saveNow();});
  }

  window.DS_ProfileManager={init,createProfile,unlockProfile,startTemporary,hasSession,isUnlocked,isTemporary,current,listProfiles,lock,saveNow,getPlatformData,setPlatformData,getPath,setPath,exportProfile,importProfileFile,deleteProfile,createRecoveryKit,recoverProfile,attachRecoveryToCurrent,recordAudit,EXPIRATION_DAYS};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
