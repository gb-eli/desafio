(function(){
  'use strict';
  const C = () => window.DS_Crypto;

  function renderLab(item, api){
    const lab = item.lab;
    if(lab === 'vm') return labVM(item, api);
    if(lab === 'sql') return labSQL(item, api);
    if(lab === 'cmd') return labCMD(item, api);
    if(lab === 'requirements') return labRequirements(item, api);
    if(lab === 'frontend') return labFrontend(item, api);
    if(lab === 'python') return labPython(item, api);
    if(lab === 'flowchart') return labFlowchart(item, api);
    api.body.innerHTML = '<p>Laboratório não encontrado.</p>';
    return {check(){return false}, cleanup(){}};
  }

  function labVM(item, api){
    api.checkBtn.textContent = 'Iniciar máquina';
    api.body.innerHTML = `
      <div class="lab-shell">
        <div class="lab-main">
          <div class="lab-toolbar"><strong>Configure a VM</strong><span class="tag">equilíbrio de recursos</span></div>
          <div class="lab-grid">
            <div class="lab-field"><label>Sistema operacional</label><select id="vmOs"><option>Linux</option><option>Windows</option><option>macOS</option></select></div>
            <div class="lab-field"><label>Processador</label><select id="vmCpu"><option value="1">1 núcleo</option><option value="2">2 núcleos</option><option value="4">4 núcleos</option><option value="8">8 núcleos</option></select></div>
            <div class="lab-field"><label>Memória RAM: <span id="ramVal" class="range-value">4 GB</span></label><input id="vmRam" type="range" min="1" max="32" value="4"></div>
            <div class="lab-field"><label>Armazenamento: <span id="diskVal" class="range-value">64 GB</span></label><input id="vmDisk" type="range" min="20" max="500" value="64"></div>
            <div class="lab-field"><label>Placa de vídeo</label><select id="vmGpu"><option>básica</option><option>intermediária</option><option>avançada</option></select></div>
            <div class="lab-field"><label>Placa de áudio</label><select id="vmAudio"><option>ativada</option><option>desativada</option></select></div>
            <div class="lab-field"><label>Placa de rede</label><select id="vmNet"><option>NAT</option><option>Bridge</option><option>desativada</option></select></div>
          </div>
          <div class="indicators"><div class="indicator">Desempenho<b id="perfInd">--</b></div><div class="indicator">Compatibilidade<b id="compInd">--</b></div><div class="indicator">Custo<b id="costInd">--</b></div></div>
        </div>
        <div class="lab-preview vm-preview-panel"><h3>Computador virtual</h3><div class="virtual-monitor"><div id="vmScreen" class="vm-computer">VM desligada.</div></div><div id="vmOsBadge" class="vm-os-badge">Sistema aguardando boot</div></div>
      </div>`;
    const ram = document.getElementById('vmRam'), disk = document.getElementById('vmDisk');
    const update = () => {
      const r = +ram.value, d = +disk.value, cpu = +document.getElementById('vmCpu').value;
      document.getElementById('ramVal').textContent = r + ' GB';
      document.getElementById('diskVal').textContent = d + ' GB';
      document.getElementById('perfInd').textContent = Math.min(100, Math.round((r*2 + cpu*9 + d/18))) + '%';
      document.getElementById('costInd').textContent = Math.min(100, Math.round((r*2.2 + cpu*8 + d/10))) + '%';
      document.getElementById('compInd').textContent = 'verificar';
    };
    ram.oninput = update; disk.oninput = update; document.getElementById('vmCpu').onchange = update; update();
    async function boot(){
      const os = document.getElementById('vmOs').value;
      const r = +ram.value, d = +disk.value, cpu = +document.getElementById('vmCpu').value, net = document.getElementById('vmNet').value;
      const min = os === 'Linux' ? {ram:2,disk:20,cpu:1} : os === 'Windows' ? {ram:4,disk:64,cpu:2} : {ram:8,disk:80,cpu:2};
      const problems=[];
      if(r < min.ram) problems.push('Pouca memória RAM. O sistema pode travar ou nem iniciar.');
      if(d < min.disk) problems.push('Armazenamento insuficiente para instalar esse sistema.');
      if(cpu < min.cpu) problems.push('Processador abaixo do mínimo recomendado.');
      if(net === 'desativada') problems.push('A máquina pode iniciar, mas ficará sem acesso à rede.');
      const screen = document.getElementById('vmScreen');
      screen.textContent = '';
      const osLines = os === 'Linux'
        ? ['Ligando máquina virtual...','Carregando BIOS/UEFI...','Verificando memória RAM...','Detectando disco virtual...','Inicializando kernel Linux...','Abrindo terminal do sistema...']
        : os === 'Windows'
          ? ['Ligando máquina virtual...','Carregando BIOS/UEFI...','Verificando memória RAM...','Detectando disco virtual...','Preparando instalação do Windows...','Abrindo área de trabalho simulada...']
          : ['Ligando máquina virtual...','Carregando BIOS/UEFI...','Verificando memória RAM...','Detectando disco virtual...','Inicializando ambiente macOS...','Abrindo tela inicial simulada...'];
      for(const line of osLines){
        screen.textContent += line + '\n';
        const badge = document.getElementById('vmOsBadge');
        if(badge) badge.textContent = line;
        await sleep(320);
      }
      if(problems.length && problems.some(p=>!p.includes('rede'))){
        screen.textContent += '\nALERTA:\n- ' + problems.join('\n- ');
        api.feedback(problems.join(' '), 'warn');
        return false;
      }
      screen.textContent += '\nSistema iniciado com sucesso!\n\n' + (os === 'Linux' ? '[ Linux ] usuário@vm:~$' : os === 'Windows' ? '[ Windows ] Área de trabalho pronta' : '[ macOS ] Tela inicial pronta');
      const badgeOk = document.getElementById('vmOsBadge');
      if(badgeOk) badgeOk.textContent = os + ' iniciado com sucesso';
      api.completeLab(item, {points:50, power:'life_or_points', detail:{os, ram:r, disk:d, cpu, net}});
      return true;
    }
    return {check:boot, cleanup(){}};
  }

  function labSQL(item, api){
    api.checkBtn.textContent = 'Executar etapa';
    const steps = [
      {
        label:'1. Crie a tabela chamada alunos com as colunas id, nome e turma.',
        help:'Use CREATE TABLE alunos (...) e inclua id INT, nome VARCHAR(100) e turma VARCHAR(20).',
        test:sql => hasAll(sql, ['create table alunos','id int','nome varchar','turma varchar']),
        visual:'created'
      },
      {
        label:"2. Insira um registro para Ana da turma 3DS.",
        help:"Use INSERT INTO alunos (...) VALUES (1, 'Ana', '3DS');",
        test:sql => hasAll(sql, ['insert into alunos','values']) && /ana/i.test(sql) && /3ds/i.test(sql),
        visual:'row'
      },
      {
        label:'3. Consulte todos os dados da tabela alunos.',
        help:'Use SELECT * FROM alunos;',
        test:sql => /^select\s*\*\s*from\s*alunos\s*;?$/i.test(sql.trim()),
        visual:'all'
      },
      {
        label:"4. Filtre apenas alunos da turma 3DS usando WHERE.",
        help:"Use SELECT * FROM alunos WHERE turma = '3DS';",
        test:sql => /^select\s*\*\s*from\s*alunos\s*where\s*turma\s*=\s*['\"]?3ds['\"]?\s*;?$/i.test(sql.trim()),
        visual:'filter'
      }
    ];
    let step = 0, rows=[], tableCreated=false, lastFilter=false, busy=false;
    api.body.innerHTML = `
      <div class="sql-layout rich-lab">
        <div class="lab-main">
          <div class="lab-toolbar"><span class="tag">SQL • Etapa <b id="sqlStep">1</b>/4</span><strong id="sqlInstruction"></strong></div>
          <p id="sqlHelp" class="muted"></p>
          <div class="terminal-box"><div id="sqlHistory" class="terminal-history">SQL conectado. Execute uma etapa por vez.</div><textarea id="sqlInput" class="code-input" spellcheck="false" placeholder="Digite o comando SQL da etapa atual..."></textarea></div>
          <div class="lab-mini-actions"><button id="sqlExampleBtn" class="btn tiny" type="button">Ver estrutura esperada</button></div>
        </div>
        <div class="lab-preview sql-preview-panel"><h3>Prévia do banco</h3><div id="sqlVisual"></div><div id="sqlResult" class="terminal-box mini-terminal-output">Aguardando comando...</div></div>
      </div>`;
    const inst = document.getElementById('sqlInstruction'), stepEl = document.getElementById('sqlStep'), help = document.getElementById('sqlHelp'), hist = document.getElementById('sqlHistory'), input = document.getElementById('sqlInput'), visual = document.getElementById('sqlVisual'), result = document.getElementById('sqlResult');
    document.getElementById('sqlExampleBtn').addEventListener('click',()=>{
      const samples = [
        'CREATE TABLE alunos ( id INT, nome VARCHAR(100), turma VARCHAR(20) );',
        "INSERT INTO alunos (id, nome, turma) VALUES (1, 'Ana', '3DS');",
        'SELECT * FROM alunos;',
        "SELECT * FROM alunos WHERE turma = '3DS';"
      ];
      api.feedback(`Estrutura esperada da etapa ${step+1}: ${samples[step] || 'laboratório concluído'}`, 'warn');
    });
    function draw(){
      inst.textContent = steps[step]?.label || 'Laboratório concluído.';
      help.textContent = steps[step]?.help || 'Todas as etapas foram concluídas.';
      stepEl.textContent = Math.min(step+1,4);
      let viewRows = lastFilter ? rows.filter(r=>String(r.turma).toLowerCase()==='3ds') : rows;
      let body = '<table class="sql-table"><thead><tr><th>id</th><th>nome</th><th>turma</th></tr></thead><tbody>';
      if(tableCreated && viewRows.length){ viewRows.forEach(r=> body += `<tr><td>${r.id}</td><td>${escapeHtml(r.nome)}</td><td>${escapeHtml(r.turma)}</td></tr>`); }
      else if(tableCreated) body += '<tr><td colspan="3">Tabela criada, mas ainda sem registros.</td></tr>';
      else body += '<tr><td colspan="3">A tabela alunos ainda não foi criada.</td></tr>';
      body += '</tbody></table>';
      visual.innerHTML = body;
    }
    draw();
    async function run(){
      if(busy || step >= steps.length) return false;
      const raw = input.value.trim();
      if(!raw){ api.feedback('Digite o comando SQL da etapa atual antes de executar.', 'warn'); return false; }
      busy = true;
      const sql = cleanSql(raw);
      hist.textContent += '\nSQL> ' + raw;
      await sleep(220);
      if(steps[step].test(sql)){
        hist.textContent += '\n✓ Comando aceito.';
        if(steps[step].visual === 'created'){ tableCreated = true; lastFilter = false; result.textContent = 'Tabela alunos criada com as colunas id, nome e turma.'; }
        if(steps[step].visual === 'row'){
          const parsed = parseInsert(raw) || {id:1,nome:'Ana',turma:'3DS'};
          rows = [parsed]; lastFilter = false; result.textContent = `1 linha inserida: ${parsed.id} | ${parsed.nome} | ${parsed.turma}`;
        }
        if(steps[step].visual === 'all'){ lastFilter = false; result.textContent = 'Consulta executada: todos os registros da tabela alunos.'; }
        if(steps[step].visual === 'filter'){ lastFilter = true; result.textContent = 'Consulta com WHERE executada: exibindo turma 3DS.'; }
        step++; input.value=''; draw(); busy = false;
        if(step >= steps.length){ api.completeLab(item, {points:70, power:'next2x', detail:{steps:4, rows:rows.length, tableCreated:true}}); return true; }
        api.feedback('Etapa correta. Continue para a próxima instrução do laboratório SQL.', 'ok');
        return true;
      }
      hist.textContent += '\n✗ Ainda não atende à etapa atual.';
      result.textContent = 'Resultado: comando não aplicado. Confira a instrução e execute novamente.';
      api.feedback('O SQL não precisa ficar idêntico ao exemplo, mas precisa usar o comando correto da etapa atual.', 'warn');
      busy = false;
      return false;
    }
    input.addEventListener('keydown', e=>{ if(e.key==='Enter' && (e.ctrlKey || e.shiftKey)){ e.preventDefault(); api.checkBtn.click(); } });
    return {check:run, cleanup(){ busy=false; }};
  }

  function labCMD(item, api){
    api.checkBtn.textContent = 'Executar etapa';
    const labels = [
      'Criar a pasta ProjetoDS',
      'Entrar na pasta ProjetoDS',
      'Criar a subpasta frontend',
      'Criar a subpasta backend',
      'Criar a subpasta banco',
      'Listar o diretório atual',
      'Renomear banco para database'
    ];
    let step=0, path='C:\\Users\\Aluno', folders=[], projectCreated=false, insideProject=false, done=false, busy=false;
    api.body.innerHTML = `<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">CMD</span><strong id="cmdInstruction"></strong></div><p class="muted">Execute um comando por etapa. O terminal aceita variações comuns como <b>mkdir</b>/<b>md</b>, maiúsculas/minúsculas e espaços extras.</p><div class="terminal-box"><div id="cmdHistory" class="terminal-history">Microsoft Windows [versão laboratório]\n${path}&gt;</div><input id="cmdInput" class="terminal-input" placeholder="Digite o comando da etapa atual" spellcheck="false" autocomplete="off"></div></div><div class="lab-preview"><h3>Prévia da estrutura</h3><div id="cmdTree" class="terminal-box"></div></div></div>`;
    const inst=document.getElementById('cmdInstruction'), hist=document.getElementById('cmdHistory'), input=document.getElementById('cmdInput'), tree=document.getElementById('cmdTree');
    function clean(v){ return C().normalizeText(v).replace(/\\/g,'/').replace(/^\.\//,'').replace(/\s+/g,' ').trim(); }
    function folderName(cmd){ return (cmd.split(' ')[1] || '').replace(/[^a-z0-9_-]/g,''); }
    function accepts(cmd){
      const c = clean(cmd);
      const parts = c.split(' ');
      const op = parts[0];
      if(step===0) return (op==='mkdir' || op==='md') && folderName(c)==='projetods';
      if(step===1) return op==='cd' && ['projetods','./projetods','./projetods/'].includes(parts[1] || '');
      if(step===2) return (op==='mkdir' || op==='md') && folderName(c)==='frontend';
      if(step===3) return (op==='mkdir' || op==='md') && folderName(c)==='backend';
      if(step===4) return (op==='mkdir' || op==='md') && folderName(c)==='banco';
      if(step===5) return c==='dir' || c==='tree' || c==='tree /f';
      if(step===6) return (op==='ren' || op==='rename') && parts[1]==='banco' && parts[2]==='database';
      return false;
    }
    function draw(){
      inst.textContent = step < labels.length ? `${step+1}/7 — ${labels[step]}` : 'Laboratório concluído';
      if(!projectCreated){ tree.textContent = 'Nenhuma pasta criada ainda.'; return; }
      const children = folders.length ? folders.map((f,i)=>`${i === folders.length-1 ? '  └─ ' : '  ├─ '}${f}`).join('\n') : '  (sem subpastas ainda)';
      tree.textContent = `ProjetoDS\n${children}`;
    }
    function applyStep(){
      if(step===0){ projectCreated=true; folders=[]; }
      if(step===1){ insideProject=true; path = 'C:\\Users\\Aluno\\ProjetoDS'; }
      if(step===2 && !folders.includes('frontend')) folders.push('frontend');
      if(step===3 && !folders.includes('backend')) folders.push('backend');
      if(step===4 && !folders.includes('banco')) folders.push('banco');
      if(step===6) folders = folders.map(f=>f==='banco'?'database':f);
    }
    draw();
    function run(){
      if(done || busy) return done;
      const raw=input.value.trim();
      if(!raw){ api.feedback('Digite o comando da etapa atual antes de executar.', 'warn'); return false; }
      busy = true;
      try{
        hist.textContent += raw + '\n';
        if(accepts(raw)){
          applyStep();
          hist.textContent += '✓ Comando executado.\n' + path + '>';
          input.value=''; step++; draw();
          if(step >= labels.length){ done=true; api.completeLab(item, {points:55, power:'hint', detail:{commands:labels.length, projectCreated, folders:[...folders]}}); return true; }
          api.feedback('Comando aceito. A prévia foi atualizada. Continue para a próxima etapa.', 'ok');
          return true;
        }
        hist.textContent += 'Comando não reconhecido ou usado fora de ordem.\n' + path + '>';
        api.feedback('Comando não reconhecido ou usado fora de ordem. Confira a etapa atual e tente novamente.', 'warn');
        return false;
      } finally { busy = false; }
    }
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); api.checkBtn.click(); } });
    return {check:run, cleanup(){ done=true; busy=false; }};
  }

  function labRequirements(item, api){
    api.checkBtn.textContent = 'Validar requisitos';
    const items = ['O sistema deve permitir login do usuário.','O sistema deve carregar em até 3 segundos.','O usuário deve conseguir cadastrar produtos.','O sistema deve ser seguro.','O sistema deve gerar relatório de vendas.','O sistema deve funcionar em celulares e computadores.'];
    const map = {'O sistema deve permitir login do usuário.':'Funcional','O usuário deve conseguir cadastrar produtos.':'Funcional','O sistema deve gerar relatório de vendas.':'Funcional','O sistema deve carregar em até 3 segundos.':'Não funcional','O sistema deve ser seguro.':'Não funcional','O sistema deve funcionar em celulares e computadores.':'Não funcional'};
    api.body.innerHTML = classifyHtml(items, ['Funcional','Não funcional']);
    enableDrag();
    function check(){
      let score=0; document.querySelectorAll('.drop-zone').forEach(z=>{ const g=z.dataset.group; z.querySelectorAll('.drag-card').forEach(c=>{ if(map[c.dataset.value]===g) score++; }); });
      if(score >= 5){ api.completeLab(item, {points:50, power:'points', detail:{correct:score,total:6}}); return true; }
      api.feedback(`Você classificou ${score}/6 corretamente. Precisa acertar pelo menos 5.`, 'warn'); return false;
    }
    return {check, cleanup(){}};
  }

  function labFrontend(item, api){
    api.checkBtn.textContent = 'Concluir laboratório';
    api.body.innerHTML = `
      <div class="lab-shell rich-lab">
        <div class="lab-main">
          <div class="lab-toolbar"><span class="tag">HTML/CSS</span><strong>Monte um card e veja o resultado na prévia</strong></div>
          <p class="muted">Complete o HTML e o CSS. A prévia deve mostrar o card renderizado, não o texto do código.</p>
          <label class="lab-code-label">HTML</label>
          <textarea id="frontHtml" class="code-input html-editor" spellcheck="false"><main>
  <section class="card">
    <h1>Desafio DS</h1>
    <p>Aprendendo tecnologia na prática.</p>
    <button>Iniciar</button>
  </section>
</main></textarea>
          <label class="lab-code-label">CSS</label>
          <textarea id="frontCss" class="code-input css-editor" spellcheck="false">.card {
  background-color: #111;
  color: white;
  padding: 20px;
  border-radius: 12px;
}</textarea>
        </div>
        <div class="lab-preview web-preview-panel">
          <h3>Prévia renderizada</h3>
          <iframe id="frontPreview" class="front-preview-frame" sandbox=""></iframe>
          <div id="frontChecklist" class="checklist"></div>
        </div>
      </div>`;
    const html=document.getElementById('frontHtml'), css=document.getElementById('frontCss'), frame=document.getElementById('frontPreview'), checklist=document.getElementById('frontChecklist');
    function checks(){
      const h = C().normalizeText(html.value);
      const c = C().normalizeText(css.value);
      return [
        {label:'usa a tag main', ok:/<main[\s>]/i.test(html.value)},
        {label:'usa section com class="card"', ok:/<section[^>]*class=["']card["'][^>]*>/i.test(html.value)},
        {label:'usa h1, p e button', ok:/<h1[\s>]/i.test(html.value) && /<p[\s>]/i.test(html.value) && /<button[\s>]/i.test(html.value)},
        {label:'estiliza a classe .card', ok:/\.card\s*\{/i.test(css.value)},
        {label:'define fundo, cor, padding e borda arredondada', ok:c.includes('background-color') && c.includes('color') && c.includes('padding') && c.includes('border-radius')}
      ];
    }
    function renderPreview(){
      const safeHtml = sanitizeHtmlForPreview(html.value);
      const safeCss = String(css.value || '').replace(/<\/style/gi,'<\\/style');
      frame.srcdoc = `<!doctype html><html><head><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1020;font-family:Arial,sans-serif}.card button{cursor:pointer}${safeCss}</style></head><body>${safeHtml}</body></html>`;
      const items = checks();
      checklist.innerHTML = items.map(x=>`<div class="check-item ${x.ok?'ok':'bad'}">${x.ok?'✓':'•'} ${escapeHtml(x.label)}</div>`).join('');
    }
    html.addEventListener('input', renderPreview); css.addEventListener('input', renderPreview); renderPreview();
    function check(){
      const items = checks();
      const ok = items.every(x=>x.ok);
      if(ok){ api.completeLab(item, {points:60, power:'shield', detail:{card:true, checks:items.length}}); return true; }
      api.feedback('A prévia já mostra o resultado, mas ainda falta cumprir algum item da checklist.', 'warn'); return false;
    }
    return {check, cleanup(){}};
  }

  function labPython(item, api){
    api.checkBtn.textContent = 'Validar código';
    const blanks = ['input','int','if','print','else'];
    api.body.innerHTML = `<div class="lab-shell"><div class="lab-main"><p>Complete os blocos do mini sistema:</p><pre class="terminal-box">nome = <input class="pyBlank" data-answer="input" placeholder="____">("Digite seu nome: ")\nidade = <input class="pyBlank" data-answer="int" placeholder="___">(<input class="pyBlank" data-answer="input" placeholder="____">("Digite sua idade: "))\n\n<input class="pyBlank" data-answer="if" placeholder="__"> idade >= 18:\n    <input class="pyBlank" data-answer="print" placeholder="_____">("Maior de idade")\n<input class="pyBlank" data-answer="else" placeholder="____">:\n    print("Menor de idade")</pre></div><div class="lab-preview"><h3>Função de cada termo</h3><ul><li>input recebe dados.</li><li>int converte para inteiro.</li><li>if cria condição.</li><li>else indica caso contrário.</li><li>print exibe mensagem.</li></ul></div></div>`;
    document.querySelectorAll('.pyBlank').forEach(i=>{ i.style.width='86px'; i.style.padding='4px'; i.style.borderRadius='8px'; });
    function check(){
      let ok=true; document.querySelectorAll('.pyBlank').forEach(i=>{ if(C().normalizeText(i.value)!==i.dataset.answer) ok=false; });
      if(ok){ api.completeLab(item, {points:50, power:'points', detail:{python:true}}); return true; }
      api.feedback('Algum comando está incorreto. Verifique input, int, if, else e print.', 'warn'); return false;
    }
    return {check, cleanup(){}};
  }

  function labFlowchart(item, api){
    api.checkBtn.textContent = 'Validar fluxo';
    const blocks=['Início','Ler nota','Nota >= 60?','Mostrar “Aprovado”','Mostrar “Reprovado”','Fim'];
    const correct=[...blocks];
    api.body.innerHTML = `<div class="lab-shell"><div class="lab-main"><p>Monte o fluxo na ordem correta. Você pode clicar para adicionar, arrastar para reorganizar, ou remover itens se errar.</p><div id="flowPool" class="cards-pool">${blocks.map(b=>`<button class="flow-block" type="button" data-value="${escapeHtml(b)}">${b}</button>`).join('')}</div><div class="lab-toolbar"><h3>Fluxo montado</h3><button id="flowReset" class="btn tiny" type="button">Limpar ordem</button></div><div id="flowOrder" class="order-list flow-order"></div><p class="muted">Dica visual: depois de adicionar, arraste os blocos montados para trocar a posição.</p></div><div class="lab-preview"><h3>Símbolos</h3><p>Início/Fim: oval</p><p>Entrada: paralelogramo</p><p>Decisão: losango</p><p>Saída/processo: retângulo</p></div></div>`;
    const chosen=[]; const order=document.getElementById('flowOrder');
    function render(){
      order.innerHTML=chosen.map((x,i)=>`<div class="order-item" draggable="true" data-index="${i}" data-value="${escapeHtml(x)}"><span>${i+1}. ${x}</span><button class="remove-flow" type="button" data-index="${i}" title="Remover">×</button></div>`).join('') || '<p class="muted">Nenhum bloco adicionado ainda.</p>';
      document.querySelectorAll('.flow-block').forEach(btn=>{ btn.disabled = chosen.includes(btn.dataset.value); });
      let dragged=null;
      order.querySelectorAll('.order-item').forEach(item=>{
        item.addEventListener('dragstart',()=>{ dragged=item; });
        item.addEventListener('dragover',e=>e.preventDefault());
        item.addEventListener('drop',e=>{
          e.preventDefault();
          if(!dragged || dragged===item) return;
          const from=Number(dragged.dataset.index), to=Number(item.dataset.index);
          const [moved]=chosen.splice(from,1); chosen.splice(to,0,moved); render();
        });
      });
      order.querySelectorAll('.remove-flow').forEach(btn=>btn.addEventListener('click',e=>{ e.stopPropagation(); chosen.splice(Number(btn.dataset.index),1); render(); }));
    }
    document.querySelectorAll('.flow-block').forEach(btn=>btn.onclick=()=>{ if(chosen.includes(btn.dataset.value)) return; chosen.push(btn.dataset.value); render(); });
    document.getElementById('flowReset').addEventListener('click',()=>{ chosen.splice(0, chosen.length); render(); api.feedback('Fluxo limpo. Monte novamente na ordem correta.', 'warn'); });
    render();
    function check(){
      const ok = JSON.stringify(chosen) === JSON.stringify(correct);
      if(ok){ api.completeLab(item, {points:50, power:'hint', detail:{flow:true}}); return true; }
      api.feedback('A sequência ainda não representa o fluxo correto. Você pode arrastar para reorganizar ou remover blocos.', 'warn'); return false;
    }
    return {check, cleanup(){}};
  }

  function classifyHtml(items, groups){
    return `<div class="classify-wrap"><div class="cards-pool">${items.map(x=>`<div class="drag-card" draggable="true" data-value="${escapeHtml(x)}">${x}</div>`).join('')}</div>${groups.map(g=>`<div class="drop-zone" data-group="${escapeHtml(g)}"><h4>${g}</h4></div>`).join('')}</div>`;
  }
  function enableDrag(){
    let dragged=null;
    document.querySelectorAll('.drag-card').forEach(card=>{
      card.addEventListener('dragstart',()=>{dragged=card});
      card.addEventListener('click',()=>{ card.classList.toggle('selected'); });
    });
    document.querySelectorAll('.drop-zone,.cards-pool').forEach(zone=>{
      zone.addEventListener('dragover',e=>{e.preventDefault(); zone.classList.add('over');});
      zone.addEventListener('dragleave',()=>zone.classList.remove('over'));
      zone.addEventListener('drop',e=>{e.preventDefault(); zone.classList.remove('over'); if(dragged) zone.appendChild(dragged); dragged=null;});
      zone.addEventListener('click',()=>{ const selected=document.querySelector('.drag-card.selected'); if(selected && zone.classList.contains('drop-zone')){ selected.classList.remove('selected'); zone.appendChild(selected); }});
    });
  }
  function cleanSql(sql){
    return String(sql || '')
      .replace(/--.*$/gm,'')
      .replace(/\/\*[\s\S]*?\*\//g,'')
      .trim();
  }
  function hasAll(sql, parts){
    const flat = C().normalizeText(cleanSql(sql)).replace(/\s+/g,' ');
    return parts.every(part => flat.includes(C().normalizeText(part)) || flat.replace(/\s+/g,'').includes(C().normalizeText(part).replace(/\s+/g,'')));
  }
  function parseInsert(raw){
    const match = String(raw || '').match(/values\s*\(\s*(\d+)\s*,\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/i);
    if(!match) return null;
    return {id:Number(match[1]), nome:match[2], turma:match[3]};
  }
  function sanitizeHtmlForPreview(html){
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi,'')
      .replace(/\son\w+\s*=\s*(['\"]).*?\1/gi,'')
      .replace(/javascript:/gi,'');
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  window.DS_Labs = {renderLab, classifyHtml, enableDrag};
})();
