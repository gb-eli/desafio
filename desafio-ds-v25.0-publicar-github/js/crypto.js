(function(){
  'use strict';
  const TOKEN_MATERIAL = [83,82,68,86,81,94,88,72,83,68,72,91,88,84,86,91,72,69,82,68,66,91,67,86,83,88,72,37,39,37,33,72,97,47];
  function normalizeText(value){
    return String(value ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .trim().toLowerCase().replace(/\s+/g,' ')
      .replace(/\s*;\s*/g,';')
      .replace(/\s*,\s*/g,',')
      .replace(/\s*\(\s*/g,'(')
      .replace(/\s*\)\s*/g,')')
      .replace(/\s*=\s*/g,'=');
  }
  async function sha256Hex(text){
    const data = new TextEncoder().encode(normalizeText(text));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function answerProof(questionId, value, salt){
    const canonical = Array.isArray(value)
      ? JSON.stringify(value)
      : (value && typeof value === 'object')
        ? JSON.stringify(Object.keys(value).sort().map(key => [key, value[key]]))
        : String(value ?? '');
    const material = `${normalizeText(canonical)}|${questionId}|${salt}|DDS_PROOF_V16`;
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function verifyAnswer(question, value){
    if(!question?.id || !question?.answerSalt) return false;
    const candidate = await answerProof(question.id, value, question.answerSalt);
    if(Array.isArray(question.answerProofs)) return question.answerProofs.includes(candidate);
    return candidate === question.answerProof;
  }
  function base64UrlFromBytes(bytes){
    let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
    return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function bytesFromBase64Url(str){
    str = str.replace(/-/g,'+').replace(/_/g,'/');
    while(str.length % 4) str += '=';
    const bin = atob(str);
    return Uint8Array.from(bin, c=>c.charCodeAt(0));
  }
  async function tokenKey(){
    const localMaterial = String.fromCharCode(...TOKEN_MATERIAL.map(value=>value ^ 23));
    const data = new TextEncoder().encode(localMaterial);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt','decrypt']);
  }
  async function encryptToken(payload){
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await tokenKey();
    const plain = new TextEncoder().encode(JSON.stringify(payload));
    const cipher = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, plain));
    const out = new Uint8Array(iv.length + cipher.length);
    out.set(iv,0); out.set(cipher,iv.length);
    return 'DDS8.' + base64UrlFromBytes(out);
  }
  async function decryptToken(token){
    token = String(token || '').replace(/\s+/g,'').trim();
    if(!token.startsWith('DDS8.')) throw new Error('Comprovante inválido ou de versão antiga. Gere novamente e copie/baixe o conteúdo completo.');
    const raw = bytesFromBase64Url(token.slice(5));
    const iv = raw.slice(0,12); const cipher = raw.slice(12);
    const key = await tokenKey();
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, cipher);
    return JSON.parse(new TextDecoder().decode(plain));
  }
  function encodeSpec(obj){
    const text = JSON.stringify(obj);
    let out='';
    for(let i=0;i<text.length;i++) out += String.fromCharCode(text.charCodeAt(i) ^ (37 + (i%11)*13));
    return btoa(unescape(encodeURIComponent(out)));
  }
  function decodeSpec(str){
    let raw = decodeURIComponent(escape(atob(str)));
    let out='';
    for(let i=0;i<raw.length;i++) out += String.fromCharCode(raw.charCodeAt(i) ^ (37 + (i%11)*13));
    return JSON.parse(out);
  }

  async function secureBankKey(password, salt){
    const material = normalizeText(password) + '|' + salt + '|DDS_BANK_V12';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));
    return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt']);
  }
  async function decryptSecureBank(packet, password){
    if(!packet || !packet.salt || !packet.iv || !packet.data) throw new Error('Banco protegido indisponível.');
    const key = await secureBankKey(password, packet.salt);
    const iv = bytesFromBase64Url(packet.iv);
    const cipher = bytesFromBase64Url(packet.data);
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, cipher);
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function fastIntegrity(value){
    let h = 2166136261;
    const s = String(value) + '|DDS|guard';
    for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); }
    return (h>>>0).toString(36);
  }
  window.DS_Crypto = {normalizeText, sha256Hex, answerProof, verifyAnswer, encryptToken, decryptToken, decryptSecureBank, encodeSpec, decodeSpec, fastIntegrity};
})();
