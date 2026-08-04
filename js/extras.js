(function(){
  'use strict';
  const root=document.documentElement;
  const R=()=>window.DS_Random;
  const S=()=>window.DS_Sanitize;
  let activeCleanup=null;

  function applyTheme(theme){
    const allowed=new Set(['dark','light','system']);
    const safe=allowed.has(theme)?theme:'system';
    root.dataset.theme=safe;
    root.style.colorScheme=safe==='system'?'light dark':safe;
    localStorage.setItem('ds-theme',safe);
    document.querySelectorAll('.theme-btn[data-theme]').forEach(button=>{
      const active=button.dataset.theme===safe;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function applyContrast(enabled){
    root.classList.toggle('high-contrast',enabled);
    localStorage.setItem('ds-contrast',enabled?'1':'0');
    const button=document.getElementById('contrastToggle');
    if(button){button.classList.toggle('active',enabled);button.setAttribute('aria-pressed',String(enabled));}
  }
  function initTheme(){
    applyTheme(localStorage.getItem('ds-theme')||'dark');
    applyContrast(localStorage.getItem('ds-contrast')==='1');
    document.querySelectorAll('.theme-btn[data-theme]').forEach(button=>button.addEventListener('click',()=>applyTheme(button.dataset.theme)));
    document.getElementById('contrastToggle')?.addEventListener('click',()=>applyContrast(!root.classList.contains('high-contrast')));
  }

  function renderReward(){
    const panel=document.getElementById('achievementPanel');
    const games=document.getElementById('rewardGames');
    if(!panel||!games||panel.dataset.ready==='1') return;
    panel.dataset.ready='1';
    const score=Number((document.getElementById('finalScore')?.textContent||'0').replace(/\D/g,''));
    const stats=Array.from(document.querySelectorAll('#resultStats .stat')).reduce((output,node)=>{
      const key=node.querySelector('span')?.textContent;
      const value=node.querySelector('b')?.textContent;
      if(key)output[key]=value;
      return output;
    },{});
    const rank=stats['Premiação']||'Madeira';
    const career=stats['Cargo indicado']||'Estagiário de Desenvolvimento de Sistemas';
    panel.replaceChildren(buildAward(rank,career));
    const unlockRanks=new Set(['Ouro','Platina','Diamante','Mestre','Lendário','Épico','Mítico','Titã']);
    if(unlockRanks.has(rank)||score>=1200) renderArcade(games);
    else {
      games.classList.remove('hidden');
      games.innerHTML='<div class="reward-locked"><strong>Arcade DS bloqueado</strong><p>Alcance Ouro ou uma pontuação elevada em uma tentativa íntegra para liberar os jogos.</p></div>';
    }
  }
  function buildAward(rank,career){
    const wrapper=document.createElement('div');
    wrapper.className='achievement-content';
    const orb=document.createElement('div');
    orb.className=`award-orb rank-${slug(rank)}`;
    const label=document.createElement('span'); label.textContent='PREMIAÇÃO';
    const strong=document.createElement('strong'); strong.textContent=rank;
    const small=document.createElement('small'); small.textContent=career;
    orb.append(label,strong,small);
    const copy=document.createElement('div');
    const title=document.createElement('h2'); title.textContent='Missão técnica concluída';
    const paragraph=document.createElement('p'); paragraph.textContent='O resultado considera dificuldade, cobertura, XP, ritmo, laboratórios e integridade da tentativa.';
    copy.append(title,paragraph);
    wrapper.append(orb,copy);
    return wrapper;
  }
  function renderArcade(games){
    games.classList.remove('hidden');
    games.innerHTML='<div class="reward-head"><div><span class="terminal-label">RECOMPENSA DESBLOQUEADA</span><h2>Arcade DS</h2><p>Escolha um desafio rápido. Os jogos não alteram o resultado da missão.</p></div><div class="game-tabs"><button data-game="snake" class="btn secondary">Cobrinha</button><button data-game="guess" class="btn secondary">Adivinhação</button><button data-game="hang" class="btn secondary">Forca Tech</button><button data-game="memory" class="btn secondary">Memória lógica</button></div></div><div id="gameStage" class="game-stage"><p>Selecione um jogo.</p></div>';
    games.querySelectorAll('[data-game]').forEach(button=>button.addEventListener('click',()=>startGame(button.dataset.game)));
  }
  function slug(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');}
  function cleanupGame(){try{activeCleanup?.();}catch(_error){}activeCleanup=null;}
  function startGame(type){
    cleanupGame();
    const stage=document.getElementById('gameStage');
    if(!stage)return;
    stage.replaceChildren();
    if(type==='guess') activeCleanup=guess(stage);
    else if(type==='hang') activeCleanup=hang(stage);
    else if(type==='memory') activeCleanup=memory(stage);
    else activeCleanup=snake(stage);
  }
  function randomInt(max){return R()?.int?.(max) ?? Math.floor(Math.random()*max);}
  function shuffle(items){return R()?.shuffle?.(items) ?? [...items].sort(()=>Math.random()-.5);}

  function guess(stage){
    const number=randomInt(100)+1;
    let tries=0;
    stage.innerHTML='<h3>Adivinhação binária</h3><p>Descubra um número entre 1 e 100 usando as pistas. Tente reduzir o intervalo pela metade a cada jogada.</p><div class="mini-row"><input id="guessInput" type="number" min="1" max="100" inputmode="numeric"><button id="guessBtn" class="btn primary">Testar</button></div><p id="guessMsg" class="game-message">Intervalo atual: 1–100</p>';
    const input=stage.querySelector('#guessInput');
    const message=stage.querySelector('#guessMsg');
    let lower=1,upper=100;
    const submit=()=>{
      const value=Number(input.value);
      if(!Number.isInteger(value)||value<1||value>100){message.textContent='Digite um número inteiro entre 1 e 100.';return;}
      tries++;
      if(value===number){message.textContent=`Acertou em ${tries} tentativa(s)!`;input.disabled=true;stage.querySelector('#guessBtn').disabled=true;return;}
      if(value<number)lower=Math.max(lower,value+1);else upper=Math.min(upper,value-1);
      message.textContent=`O número é ${value<number?'maior':'menor'}. Intervalo atual: ${lower}–${upper}.`;
      input.select();
    };
    stage.querySelector('#guessBtn').addEventListener('click',submit);
    input.addEventListener('keydown',event=>{if(event.key==='Enter')submit();});
    input.focus();
    return ()=>{};
  }

  function hang(stage){
    const entries=[
      ['ALGORITMO','Sequência finita de passos para resolver um problema.'],
      ['DATABASE','Palavra inglesa frequentemente usada para banco de dados.'],
      ['FRONTEND','Camada da aplicação visível e interativa para o usuário.'],
      ['PYTHON','Linguagem conhecida por sintaxe legível.'],
      ['SERVIDOR','Processa solicitações e fornece recursos em uma rede.'],
      ['VARIAVEL','Identificador que referencia um valor.'],
      ['INTERFACE','Ponto de interação entre usuário, sistema ou componentes.'],
      ['CRIPTOGRAFIA','Protege confidencialidade e/ou autenticidade por técnicas matemáticas.']
    ];
    const [word,hint]=entries[randomInt(entries.length)];
    const used=new Set();
    let errors=0,ended=false;
    stage.innerHTML='<h3>Forca Tech</h3><p id="hangHint"></p><p id="hangWord" class="hang-word"></p><div id="hangKeys" class="key-grid"></div><p id="hangMsg" class="game-message">Erros: 0/6</p>';
    stage.querySelector('#hangHint').textContent=`Dica: ${hint}`;
    const message=stage.querySelector('#hangMsg');
    const draw=()=>{
      stage.querySelector('#hangWord').textContent=[...word].map(character=>used.has(character)?character:'_').join(' ');
      if([...word].every(character=>used.has(character))){ended=true;message.textContent='Palavra concluída!';}
    };
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter=>{
      const button=document.createElement('button');
      button.textContent=letter;button.className='key-btn';
      button.addEventListener('click',()=>{
        if(ended)return;
        button.disabled=true;used.add(letter);
        if(!word.includes(letter))errors++;
        draw();
        if(errors>=6){ended=true;message.textContent=`Fim de jogo. Palavra: ${word}`;stage.querySelectorAll('.key-btn').forEach(item=>item.disabled=true);}
        else if(!ended)message.textContent=`Erros: ${errors}/6`;
      });
      stage.querySelector('#hangKeys').appendChild(button);
    });
    draw();
    return ()=>{};
  }

  function memory(stage){
    const pairs=shuffle(['HTML','CSS','JS','SQL','API','GIT']);
    const cards=shuffle([...pairs,...pairs]).map((value,index)=>({value,index,open:false,matched:false}));
    let first=null,locked=false,moves=0,timer=null;
    stage.innerHTML='<h3>Memória lógica</h3><p>Encontre os pares de tecnologias com o menor número de jogadas.</p><div id="memoryGrid" class="memory-grid"></div><p id="memoryMsg" class="game-message">Jogadas: 0</p>';
    const grid=stage.querySelector('#memoryGrid');
    const message=stage.querySelector('#memoryMsg');
    const render=()=>{
      grid.replaceChildren(...cards.map(card=>{
        const button=document.createElement('button');
        button.className=`memory-card${card.open||card.matched?' open':''}${card.matched?' matched':''}`;
        button.type='button';button.dataset.index=String(card.index);
        button.textContent=card.open||card.matched?card.value:'?';button.disabled=card.matched||locked;
        button.addEventListener('click',()=>flip(card));
        return button;
      }));
    };
    const flip=card=>{
      if(locked||card.open||card.matched)return;
      card.open=true;render();
      if(!first){first=card;return;}
      moves++;message.textContent=`Jogadas: ${moves}`;
      if(first.value===card.value){first.matched=card.matched=true;first=null;render();if(cards.every(item=>item.matched))message.textContent=`Todos os pares encontrados em ${moves} jogadas!`;return;}
      locked=true;
      const previous=first;first=null;
      timer=setTimeout(()=>{previous.open=false;card.open=false;locked=false;render();},650);
    };
    render();
    return ()=>clearTimeout(timer);
  }

  function snake(stage){
    stage.innerHTML='<h3>Cobrinha de Bits</h3><p>Use as setas, WASD ou deslize no campo.</p><canvas id="snakeCanvas" width="360" height="260" tabindex="0" aria-label="Jogo da cobrinha"></canvas><div class="snake-controls" aria-label="Controles de toque"><button data-dir="up" aria-label="Cima">▲</button><button data-dir="left" aria-label="Esquerda">◀</button><button data-dir="down" aria-label="Baixo">▼</button><button data-dir="right" aria-label="Direita">▶</button></div><p id="snakeScore" class="game-message">Pontos: 0</p>';
    const canvas=stage.querySelector('canvas');
    const context=canvas.getContext('2d');
    const size=20,columns=18,rows=13;
    let snake=[{x:5,y:5}],direction={x:1,y:0},queued={x:1,y:0},food=createFood(),score=0,over=false,timer=null,startTouch=null;
    function createFood(){
      let point;
      do{point={x:randomInt(columns),y:randomInt(rows)};}while(snake?.some?.(part=>part.x===point.x&&part.y===point.y));
      return point;
    }
    function setDirection(next){if(next.x===-direction.x&&next.y===-direction.y)return;queued=next;}
    function keyHandler(event){
      const map={ArrowUp:{x:0,y:-1},w:{x:0,y:-1},W:{x:0,y:-1},ArrowDown:{x:0,y:1},s:{x:0,y:1},S:{x:0,y:1},ArrowLeft:{x:-1,y:0},a:{x:-1,y:0},A:{x:-1,y:0},ArrowRight:{x:1,y:0},d:{x:1,y:0},D:{x:1,y:0}};
      const next=map[event.key];if(next){event.preventDefault();setDirection(next);}
    }
    function draw(){
      context.clearRect(0,0,canvas.width,canvas.height);
      context.fillStyle=getComputedStyle(root).getPropertyValue('--surface-2')||'#101827';context.fillRect(0,0,canvas.width,canvas.height);
      context.strokeStyle='rgba(148,163,184,.16)';
      for(let x=0;x<=columns;x++){context.beginPath();context.moveTo(x*size,0);context.lineTo(x*size,canvas.height);context.stroke();}
      for(let y=0;y<=rows;y++){context.beginPath();context.moveTo(0,y*size);context.lineTo(canvas.width,y*size);context.stroke();}
      context.fillStyle=getComputedStyle(root).getPropertyValue('--accent')||'#22d3ee';snake.forEach((part,index)=>{context.globalAlpha=index===0?1:.82;context.fillRect(part.x*size+2,part.y*size+2,size-4,size-4);});context.globalAlpha=1;
      context.fillStyle=getComputedStyle(root).getPropertyValue('--bad')||'#fb7185';context.beginPath();context.arc(food.x*size+size/2,food.y*size+size/2,size*.34,0,Math.PI*2);context.fill();
    }
    function loop(){
      if(over)return;
      direction=queued;
      const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
      if(head.x<0||head.y<0||head.x>=columns||head.y>=rows||snake.some(part=>part.x===head.x&&part.y===head.y)){
        over=true;stage.querySelector('#snakeScore').textContent=`Fim de jogo • ${score} pontos`;return;
      }
      snake.unshift(head);
      if(head.x===food.x&&head.y===food.y){score++;food=createFood();}else snake.pop();
      draw();stage.querySelector('#snakeScore').textContent=`Pontos: ${score}`;
      timer=setTimeout(loop,Math.max(70,125-score*3));
    }
    document.addEventListener('keydown',keyHandler,{passive:false});
    stage.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('click',()=>setDirection({up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[button.dataset.dir])));
    canvas.addEventListener('touchstart',event=>{const touch=event.changedTouches[0];startTouch={x:touch.clientX,y:touch.clientY};},{passive:true});
    canvas.addEventListener('touchend',event=>{if(!startTouch)return;const touch=event.changedTouches[0],dx=touch.clientX-startTouch.x,dy=touch.clientY-startTouch.y;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;setDirection(Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)});startTouch=null;},{passive:true});
    draw();canvas.focus();timer=setTimeout(loop,350);
    return ()=>{over=true;clearTimeout(timer);document.removeEventListener('keydown',keyHandler);};
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initTheme();
    const result=document.getElementById('resultScreen');
    if(result){
      const observer=new MutationObserver(()=>{if(result.classList.contains('active'))renderReward();else cleanupGame();});
      observer.observe(result,{attributes:true,attributeFilter:['class']});
    }
  });
})();
