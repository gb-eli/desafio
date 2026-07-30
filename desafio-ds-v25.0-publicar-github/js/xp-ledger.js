(function(){
  'use strict';
  const SCHEMA='1.0.0';
  const CURRENCY='XP';
  const uuid=()=>crypto.randomUUID?.()||`tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  function canonical(value){if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;return JSON.stringify(value);}
  function digest(value){return window.DS_Crypto?.fastIntegrity?.(canonical(value))||String(value).length.toString(16);}
  function create({profileId='session',sessionId='',mode='desafio'}={}){return {schemaVersion:SCHEMA,walletId:uuid(),profileId,currency:CURRENCY,mode,sessionId,createdAt:new Date().toISOString(),status:'ACTIVE',transactions:[],headHash:'GENESIS',issues:[]};}
  function balances(ledger){return (ledger.transactions||[]).reduce((acc,tx)=>{if(tx.status==='APPROVED')acc.available+=tx.amount;if(tx.status==='UNDER_REVIEW'||tx.status==='PENDING')acc.pending+=tx.amount;if(tx.status==='BLOCKED')acc.blocked+=tx.amount;return acc;},{available:0,pending:0,blocked:0});}
  function append(ledger,{type='REWARD',amount=0,status='APPROVED',source='atividade',sourceId='',metadata={}}={}){
    if(!ledger||ledger.status==='BLOCKED')return {ok:false,reason:'ledger_blocked',balances:balances(ledger||{transactions:[]})};
    let value=Math.round(Number(amount)||0);const before=balances(ledger);
    if(status==='APPROVED'&&before.available+value<0)value=-before.available;
    const sequence=ledger.transactions.length+1,nonce=uuid(),previousHash=ledger.headHash||'GENESIS';
    const provisional={id:uuid(),sequence,schemaVersion:SCHEMA,profileId:ledger.profileId,walletId:ledger.walletId,currency:CURRENCY,type,status,amount:value,createdAt:new Date().toISOString(),source,sourceId,appVersion:'25.0.0',deviceSessionId:ledger.sessionId,nonce,previousHash,metadata:Object.freeze({...metadata})};
    const after={available:before.available+(status==='APPROVED'?value:0),pending:before.pending+(['PENDING','UNDER_REVIEW'].includes(status)?value:0),blocked:before.blocked+(status==='BLOCKED'?value:0)};
    const tx=Object.freeze({...provisional,availableBefore:before.available,availableAfter:after.available,pendingBefore:before.pending,pendingAfter:after.pending,blockedBefore:before.blocked,blockedAfter:after.blocked,hash:digest({...provisional,availableBefore:before.available,availableAfter:after.available,pendingBefore:before.pending,pendingAfter:after.pending,blockedBefore:before.blocked,blockedAfter:after.blocked}),integrityTag:digest(`${previousHash}|${nonce}|${value}|${source}`)});
    ledger.transactions.push(tx);ledger.headHash=tx.hash;return {ok:true,transaction:tx,balances:after};
  }
  function reconcile(ledger){
    const issues=[],ids=new Set(),nonces=new Set();let previousHash='GENESIS',computed={available:0,pending:0,blocked:0};
    for(let index=0;index<(ledger?.transactions||[]).length;index++){
      const tx=ledger.transactions[index];if(!tx||tx.sequence!==index+1)issues.push('sequencia_invalida');if(ids.has(tx?.id))issues.push('id_duplicado');ids.add(tx?.id);if(nonces.has(tx?.nonce))issues.push('nonce_duplicado');nonces.add(tx?.nonce);if(tx?.previousHash!==previousHash)issues.push('cadeia_quebrada');
      if(tx?.availableBefore!==computed.available||tx?.pendingBefore!==computed.pending||tx?.blockedBefore!==computed.blocked)issues.push('saldo_anterior_divergente');
      if(tx?.status==='APPROVED')computed.available+=Number(tx.amount)||0;if(tx?.status==='PENDING'||tx?.status==='UNDER_REVIEW')computed.pending+=Number(tx.amount)||0;if(tx?.status==='BLOCKED')computed.blocked+=Number(tx.amount)||0;
      if(computed.available<0)issues.push('saldo_disponivel_negativo');if(tx?.availableAfter!==computed.available||tx?.pendingAfter!==computed.pending||tx?.blockedAfter!==computed.blocked)issues.push('saldo_posterior_divergente');
      const {hash,integrityTag,...base}=tx;const expected=digest(base);if(hash!==expected)issues.push('hash_divergente');previousHash=hash;
    }
    if(ledger?.headHash!==previousHash)issues.push('cabeca_divergente');ledger.issues=[...new Set(issues)];if(issues.length)ledger.status='BLOCKED';return {valid:issues.length===0,issues:ledger.issues,balances:computed,status:ledger.status};
  }
  function block(ledger,reason='inconsistencia'){const current=balances(ledger);if(current.available>0){append(ledger,{type:'REVERSAL',amount:-current.available,status:'APPROVED',source:`${reason}:transferencia`});append(ledger,{type:'BLOCK',amount:current.available,status:'BLOCKED',source:reason});}ledger.status='BLOCKED';ledger.issues=[...(ledger.issues||[]),reason];return reconcile(ledger);}

  function open(ledger){
    let modal=document.getElementById('xpLedgerModal');
    if(!modal){
      modal=document.createElement('div');modal.id='xpLedgerModal';modal.className='modal-overlay hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.innerHTML='<section class="modal-card xp-ledger-card"><div class="platform-shell-head"><div><span class="modal-kicker">EXTRATO EDUCACIONAL</span><h2>XP e recompensas</h2></div><button id="xpLedgerClose" class="btn ghost" type="button">Fechar</button></div><p class="xp-ledger-note">O XP é virtual, não possui valor financeiro e não determina a nota.</p><div id="xpLedgerSummary" class="xp-ledger-summary"></div><div id="xpLedgerList" class="xp-ledger-list"></div></section>';document.body.appendChild(modal);modal.querySelector('#xpLedgerClose').addEventListener('click',()=>{modal.classList.add('hidden');document.body.classList.remove('modal-open');});
    }
    const snap=snapshot(ledger||create());
    const summary=modal.querySelector('#xpLedgerSummary');summary.replaceChildren();
    [['Disponível',snap.balances.available],['Em análise',snap.balances.pending],['Bloqueado',snap.balances.blocked]].forEach(([label,value])=>{const box=document.createElement('div'),span=document.createElement('span'),strong=document.createElement('strong');span.textContent=label;strong.textContent=`${value} XP`;box.append(span,strong);summary.appendChild(box);});
    const list=modal.querySelector('#xpLedgerList');list.replaceChildren();
    if(!snap.transactions.length){const p=document.createElement('p');p.textContent='Nenhuma transação de XP registrada nesta tentativa.';list.appendChild(p);}else snap.transactions.slice().reverse().forEach(tx=>{const row=document.createElement('article'),head=document.createElement('div'),title=document.createElement('strong'),amount=document.createElement('b'),meta=document.createElement('small');title.textContent=tx.source||tx.type;amount.textContent=`${tx.amount>=0?'+':''}${tx.amount} XP`;meta.textContent=`${new Date(tx.createdAt).toLocaleTimeString('pt-BR')} · ${tx.status} · sequência ${tx.sequence}`;head.append(title,amount);row.append(head,meta);list.appendChild(row);});
    if(snap.issues.length){const warning=document.createElement('p');warning.className='mode-status bad';warning.textContent='A carteira de XP está bloqueada para conferência devido a uma inconsistência local.';list.prepend(warning);}
    modal.classList.remove('hidden');document.body.classList.add('modal-open');
  }

  function snapshot(ledger){const check=reconcile(ledger);return {schemaVersion:ledger.schemaVersion,walletId:ledger.walletId,currency:ledger.currency,status:ledger.status,balances:check.balances,transactionCount:ledger.transactions.length,headHash:String(ledger.headHash).slice(0,16),issues:[...check.issues],transactions:ledger.transactions.map(tx=>({...tx,hash:String(tx.hash).slice(0,16),integrityTag:String(tx.integrityTag).slice(0,16)}))};}
  window.DS_XPLedger=Object.freeze({create,append,reconcile,block,balances,snapshot,open,SCHEMA});
})();
