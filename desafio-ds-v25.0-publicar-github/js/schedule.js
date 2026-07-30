(function(){
  'use strict';
  const TIMEZONE='America/Sao_Paulo';
  const SHIFTS={
    morning:{label:'Período da manhã',periods:[
      {type:'class',number:1,start:'07:30',end:'08:20'},{type:'class',number:2,start:'08:20',end:'09:10'},{type:'class',number:3,start:'09:10',end:'10:00'},
      {type:'break',label:'Intervalo',start:'10:00',end:'10:20'},{type:'class',number:4,start:'10:20',end:'11:10'},{type:'class',number:5,start:'11:10',end:'12:00'},{type:'class',number:6,start:'12:00',end:'12:50'}]},
    night:{label:'Período da noite',periods:[
      {type:'class',number:1,start:'18:50',end:'19:30'},{type:'class',number:2,start:'19:30',end:'20:15'},{type:'class',number:3,start:'20:15',end:'21:00'},
      {type:'break',label:'Intervalo',start:'21:00',end:'21:15'},{type:'class',number:4,start:'21:15',end:'22:00'},{type:'class',number:5,start:'22:00',end:'22:40'}]}
  };
  let activityContext={exportPending:false,resultReady:false,classroomOpened:false};
  let lastStateKey='';
  const toMinutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m;};
  function zonedNow(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));return {...parts,totalMinutes:Number(parts.hour)*60+Number(parts.minute)};}
  function selectedClass(){const profile=window.DS_ProfileManager?.current?.();if(profile?.identity?.classKey)return profile.identity.classKey;return document.getElementById('guidedPlayerClass')?.value||document.getElementById('playerClass')?.value||'';}
  function shiftForClass(value){return String(value).toLowerCase().includes('noite')?'night':'morning';}
  function calculate(classKey=selectedClass()){
    const now=zonedNow(),shiftKey=shiftForClass(classKey),shift=SHIFTS[shiftKey],minute=now.totalMinutes;
    const first=toMinutes(shift.periods[0].start),last=toMinutes(shift.periods.at(-1).end);
    const period=shift.periods.find(item=>minute>=toMinutes(item.start)&&minute<toMinutes(item.end));
    if(period){const remaining=toMinutes(period.end)-minute;return {state:period.type,shiftKey,shift,period,remainingMinutes:remaining,now,classKey};}
    if(minute<first)return {state:'before',shiftKey,shift,remainingMinutes:first-minute,now,classKey};
    if(minute>=last)return {state:'after',shiftKey,shift,remainingMinutes:0,now,classKey};
    return {state:'between',shiftKey,shift,remainingMinutes:0,now,classKey};
  }
  function label(info){if(info.state==='class')return `${info.period.number}ª aula · termina ${info.period.end}`;if(info.state==='break')return `Intervalo · volta ${info.period.end}`;if(info.state==='before')return `Antes do turno · inicia ${info.shift.periods[0].start}`;if(info.state==='after')return 'Fora do horário da turma';return 'Entre períodos';}
  function detail(info){
    if(info.state==='class'){
      if(info.remainingMinutes<=5)return `Últimos ${info.remainingMinutes} minutos. Salve, exporte e confira a entrega.`;
      if(info.remainingMinutes<=10)return `Restam cerca de ${info.remainingMinutes} minutos. Confira o que ainda falta.`;
      if(info.remainingMinutes<=20)return `Restam cerca de ${info.remainingMinutes} minutos nesta aula.`;
      return `Você está na ${info.period.number}ª aula. Continue com calma.`;
    }
    if(info.state==='break')return `Intervalo de ${info.shiftKey==='night'?15:20} minutos. Seu progresso pode continuar salvo.`;
    if(info.state==='before')return `Sua turma começa às ${info.shift.periods[0].start}. Você pode adiantar a atividade.`;
    if(info.state==='after')return `Você está estudando fora do horário da turma. Confira apenas o prazo da atividade.`;
    return 'O período anterior terminou. Continue quando estiver pronto.';
  }
  function ensureUi(){if(document.getElementById('schoolScheduleBadge'))return;const badge=document.createElement('button');badge.id='schoolScheduleBadge';badge.className='school-schedule-badge';badge.type='button';badge.setAttribute('aria-expanded','false');badge.innerHTML='<span>Horário escolar</span><strong>Calculando…</strong>';document.body.appendChild(badge);const panel=document.createElement('section');panel.id='schoolSchedulePanel';panel.className='school-schedule-panel hidden';panel.setAttribute('aria-live','polite');document.body.appendChild(panel);badge.addEventListener('click',()=>{const open=panel.classList.toggle('hidden')===false;badge.setAttribute('aria-expanded',String(open));});document.addEventListener('click',event=>{if(!panel.contains(event.target)&&!badge.contains(event.target)){panel.classList.add('hidden');badge.setAttribute('aria-expanded','false');}});}
  function render(){ensureUi();const info=calculate(),badge=document.getElementById('schoolScheduleBadge'),panel=document.getElementById('schoolSchedulePanel');badge.querySelector('strong').textContent=label(info);panel.innerHTML=`<span class="schedule-kicker">HORÁRIO INSTITUCIONAL</span><h3>${label(info)}</h3><p>${detail(info)}</p><dl><div><dt>Turno</dt><dd>${info.shift.label}</dd></div><div><dt>Fuso</dt><dd>${TIMEZONE}</dd></div>${info.state==='class'?`<div><dt>Tempo restante</dt><dd>${info.remainingMinutes} min</dd></div>`:''}</dl><small>O horário orienta a organização. Ele não bloqueia a atividade nem confirma presença física.</small>`;const key=`${info.now.year}-${info.now.month}-${info.now.day}:${info.state}:${info.period?.number||''}:${info.remainingMinutes<=5?'5':info.remainingMinutes<=10?'10':info.remainingMinutes<=15?'15':'normal'}`;if(key!==lastStateKey){lastStateKey=key;maybeNotify(info,key);}return info;}
  function maybeNotify(info,key){if(sessionStorage.getItem(`ds-schedule-${key}`))return;let text='';if(info.state==='break')text='Agora é o intervalo. Seu progresso permanece disponível.';else if(info.state==='class'&&info.remainingMinutes===15)text='Restam aproximadamente 15 minutos. Confira o que ainda falta.';else if(info.state==='class'&&info.remainingMinutes===5)text=activityContext.resultReady&&!activityContext.classroomOpened?'Seu resultado está pronto. Exporte e abra o Classroom antes de sair.':'Últimos minutos: salve e prepare sua entrega.';else if(info.state==='after')text='O turno já terminou. Você pode continuar normalmente e conferir o prazo no Classroom.';if(!text)return;sessionStorage.setItem(`ds-schedule-${key}`,'1');toast(text);}
  function toast(text){let node=document.getElementById('scheduleToast');if(!node){node=document.createElement('div');node.id='scheduleToast';node.className='schedule-toast';node.innerHTML='<p></p><button type="button" aria-label="Fechar lembrete">×</button>';document.body.appendChild(node);node.querySelector('button').addEventListener('click',()=>node.classList.remove('show'));}node.querySelector('p').textContent=text;node.classList.add('show');setTimeout(()=>node.classList.remove('show'),9000);}
  function setActivityContext(next){activityContext={...activityContext,...next};render();}
  function init(){ensureUi();render();setInterval(render,60000);['playerClass','guidedPlayerClass'].forEach(id=>document.getElementById(id)?.addEventListener('change',render));document.addEventListener('ds:profile-unlocked',render);document.addEventListener('ds:profile-temporary',render);}
  window.DS_Schedule={calculate,render,setActivityContext,timezone:TIMEZONE,shifts:SHIFTS};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
