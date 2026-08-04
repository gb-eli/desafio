(function(){
  'use strict';
  const C = () => window.DS_Crypto;
  const S = () => window.DS_Sanitize;

  function renderLab(item, api){
    const lab = item.lab;
    if(lab === 'vm') return labVM(item, api);
    if(lab === 'sql') return labSQL(item, api);
    if(lab === 'cmd') return labCMD(item, api);
    if(lab === 'requirements') return labRequirements(item, api);
    if(lab === 'frontend') return labFrontend(item, api);
    if(lab === 'python') return labPython(item, api);
    if(lab === 'flowchart') return labFlowchart(item, api);
    if(lab === 'security') return labSecurity(item, api);
    if(lab === 'data') return labData(item, api);
    if(lab === 'hardware') return labHardware(item, api);
    if(lab === 'ux') return labUx(item, api);
    if(lab === 'api') return labApi(item, api);
    if(lab === 'innovation') return labInnovation(item, api);
    if(lab === 'language') return labLanguage(item, api);
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
      const safeHtml = S().sanitizePreviewHtml(html.value);
      const safeCss = S().sanitizePreviewCss(css.value);
      frame.srcdoc = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1020;color:#f8fafc;font-family:Arial,sans-serif}.card button{cursor:pointer}${safeCss}</style></head><body>${safeHtml}</body></html>`;
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
    const proofs = ['c96c6d5be8d08a12e7b5cdc1b207fa6b2430974c86803d8891675e76fd992c20','6da88c34ba124c41f977db66a4fc5c1a951708d285c81bb0d47c3206f4c27ca8','c96c6d5be8d08a12e7b5cdc1b207fa6b2430974c86803d8891675e76fd992c20','935f68319d4f227e02bfd54a0ddf85b8a242e42a4277aa5ef5eaab691710924e','ce953a0eb08246617b7f849486c4b26a7af37e9d2e8f0e13b3ae1bf0da8a70a2','7dd530c4d36da47cd33396718ef1fa1e8c0f7d91ee551d7fdc1c73aa65edb454'];
    api.body.innerHTML = `<div class="lab-shell"><div class="lab-main"><p>Complete os blocos do mini sistema:</p><pre class="terminal-box">nome = <input class="pyBlank" placeholder="____">("Digite seu nome: ")\nidade = <input class="pyBlank" placeholder="___">(<input class="pyBlank" placeholder="____">("Digite sua idade: "))\n\n<input class="pyBlank" placeholder="__"> idade >= 18:\n    <input class="pyBlank" placeholder="_____">("Maior de idade")\n<input class="pyBlank" placeholder="____">:\n    print("Menor de idade")</pre></div><div class="lab-preview"><h3>Função de cada termo</h3><ul><li>Receber dados.</li><li>Converter para inteiro.</li><li>Criar uma condição.</li><li>Definir o caso contrário.</li><li>Exibir uma mensagem.</li></ul></div></div>`;
    document.querySelectorAll('.pyBlank').forEach(i=>{ i.style.width='86px'; i.style.padding='4px'; i.style.borderRadius='8px'; });
    async function check(){
      let ok=true;
      const inputs = Array.from(document.querySelectorAll('.pyBlank'));
      for(let index=0; index<inputs.length; index++){
        if(await C().sha256Hex(inputs[index].value) !== proofs[index]) ok=false;
      }
      if(ok){ api.completeLab(item, {points:50, power:'points', detail:{python:true}}); return true; }
      api.feedback('Algum comando está incorreto. Verifique input, int, if, else e print.', 'warn'); return false;
    }
    return {check, cleanup(){}};
  }

  function labFlowchart(item, api){
    api.checkBtn.textContent = 'Validar fluxo';
    const blocks=['Início','Ler nota','Nota >= 60?','Mostrar “Aprovado”','Mostrar “Reprovado”','Fim'];
    const correct=[...blocks];
    api.body.innerHTML = `<div class="lab-shell"><div class="lab-main"><p>Monte o fluxo na ordem correta. Você pode clicar para adicionar, arrastar para reorganizar, ou remover itens se errar.</p><div id="flowPool" class="cards-pool">${blocks.map(b=>`<button class="flow-block" type="button" data-value="${escapeHtml(b)}">${escapeHtml(b)}</button>`).join('')}</div><div class="lab-toolbar"><h3>Fluxo montado</h3><button id="flowReset" class="btn tiny" type="button">Limpar ordem</button></div><div id="flowOrder" class="order-list flow-order"></div><p class="muted">Dica visual: depois de adicionar, arraste os blocos montados para trocar a posição.</p></div><div class="lab-preview"><h3>Símbolos</h3><p>Início/Fim: oval</p><p>Entrada: paralelogramo</p><p>Decisão: losango</p><p>Saída/processo: retângulo</p></div></div>`;
    const chosen=[]; const order=document.getElementById('flowOrder');
    function render(){
      order.innerHTML=chosen.map((x,i)=>`<div class="order-item" draggable="true" data-index="${i}" data-value="${escapeHtml(x)}"><span>${i+1}. ${escapeHtml(x)}</span><button class="remove-flow" type="button" data-index="${i}" title="Remover">×</button></div>`).join('') || '<p class="muted">Nenhum bloco adicionado ainda.</p>';
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

  function labSecurity(item, api){
    api.checkBtn.textContent='Validar auditoria';
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">SEGURANÇA • XSS</span><strong>Audite uma renderização de comentário</strong></div><p class="muted">O texto abaixo é entrada do usuário. Analise como exibi-lo sem transformá-lo em HTML executável.</p><pre id="xssPayload" class="terminal-box"></pre><div class="lab-grid"><div class="lab-field"><label>Método de saída</label><select id="xssSink"><option value="">Selecione...</option><option value="innerHTML">innerHTML após validação somente no servidor</option><option value="insertAdjacentHTML">insertAdjacentHTML após remover a palavra script</option><option value="textContent">textContent para conteúdo exclusivamente textual</option><option value="documentWrite">document.write com CSP restritiva</option></select></div><div class="lab-field"><label>Política adicional</label><select id="xssPolicy"><option value="">Selecione...</option><option value="escape-only">Codificação genérica única para qualquer contexto</option><option value="csp">CSP restritiva, validação e codificação contextual de saída</option><option value="disable-css">Sanitização apenas no cliente e CSP permissiva</option><option value="rename">Validação por expressão regular e innerHTML</option></select></div></div><label class="lab-code-label">API segura para texto</label><input id="xssTyped" class="code-input" spellcheck="false" autocomplete="off" placeholder="Digite a propriedade segura"><div class="safe-preview"><h3>Prévia segura</h3><p id="xssPreview"></p></div></div><div class="lab-preview"><h3>Checklist</h3><div class="checklist"><div class="check-item">1. Não interpretar entrada como marcação.</div><div class="check-item">2. Aplicar defesa em profundidade.</div><div class="check-item">3. Explicar a API usada.</div></div><p class="muted">Este laboratório não executa o código informado: a prévia usa saída textual e iframe isolado.</p></div></div>`;
    const payload='<img src=x onerror="alert(1)">';
    document.getElementById('xssPayload').textContent=payload;
    document.getElementById('xssPreview').textContent=payload;
    let done=false;
    function check(){
      if(done)return true;
      const sink=document.getElementById('xssSink').value;
      const policy=document.getElementById('xssPolicy').value;
      const typed=C().normalizeText(document.getElementById('xssTyped').value).replace(/\s/g,'');
      const typedOk=['textcontent','innertext'].includes(typed);
      if(sink==='textContent'&&policy==='csp'&&typedOk){done=true;api.completeLab(item,{points:105,power:'shield',detail:{sink,policy,typed}});return true;}
      const issues=[];
      if(sink!=='textContent')issues.push('a saída ainda interpreta ou injeta marcação');
      if(policy!=='csp')issues.push('falta defesa em profundidade');
      if(!typedOk)issues.push('a API textual não foi identificada');
      api.feedback(`Auditoria incompleta: ${issues.join('; ')}.`, 'warn'); return false;
    }
    return {check,cleanup(){done=true;}};
  }

  function labData(item, api){
    api.checkBtn.textContent='Aplicar tratamento';
    const rows=[['A-01','Teclado','120'],['A-02','Mouse',''],['A-02','Mouse','85'],['A-03','Monitor','1.250'],['','Webcam','210']];
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">DADOS</span><strong>Prepare dados para um dashboard</strong></div><div id="dataTable"></div><div class="lab-grid"><div class="lab-field"><label>Primeira ação</label><select id="dataFirst"><option value="">Selecione...</option><option value="chart">Gerar uma visualização exploratória e corrigir somente os pontos visíveis</option><option value="clean">Definir regras, tratar ausências, duplicatas e tipos antes da análise</option><option value="average">Imputar médias em todos os campos numéricos antes de validar o domínio</option><option value="delete">Eliminar linhas incompletas sem registrar a regra aplicada</option></select></div><div class="lab-field"><label>Chave para duplicidade</label><select id="dataKey"><option value="">Selecione...</option><option value="name">Nome normalizado do produto, assumindo que nunca muda</option><option value="code">Código estável do produto, validado como identificador</option><option value="price">Combinação de preço e posição atual da linha</option><option value="row">Número visual da linha exportada</option></select></div><div class="lab-field"><label>Preço do monitor</label><select id="dataType"><option value="">Selecione...</option><option value="text">Manter como texto e ordenar lexicograficamente</option><option value="number">Interpretar a localidade e converter para número 1250</option><option value="boolean">Converter em indicador de preço alto/baixo</option><option value="date">Interpretar 1.250 como número serial de data</option></select></div><div class="lab-field"><label>Registro sem código</label><select id="dataMissing"><option value="">Selecione...</option><option value="invent">Gerar identificador temporário sem registrar a origem</option><option value="validate">Validar na fonte e, sem confirmação, marcar o registro como pendente</option><option value="duplicate">Reutilizar o último código válido por proximidade</option><option value="ignore">Importar o registro e tratar somente se o dashboard falhar</option></select></div></div></div><div class="lab-preview"><h3>Objetivo</h3><p>Produzir uma base confiável antes de filtrar, agregar e visualizar.</p><div id="dataStatus" class="terminal-box">Aguardando decisões...</div></div></div>`;
    document.getElementById('dataTable').innerHTML=`<table class="sql-table"><thead><tr><th>Código</th><th>Produto</th><th>Preço</th></tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${escapeHtml(cell||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    let done=false;
    function check(){
      if(done)return true;
      const answers=[document.getElementById('dataFirst').value,document.getElementById('dataKey').value,document.getElementById('dataType').value,document.getElementById('dataMissing').value];
      const correct=['clean','code','number','validate'];
      const score=answers.filter((value,index)=>value===correct[index]).length;
      document.getElementById('dataStatus').textContent=`Decisões corretas: ${score}/4`;
      if(score===4){done=true;api.completeLab(item,{points:100,power:'next2x',detail:{decisions:4}});return true;}
      api.feedback(`Você acertou ${score}/4 decisões. Revise a ordem entre limpeza, validação, tipagem e visualização.`, 'warn');return false;
    }
    return {check,cleanup(){done=true;}};
  }

  function labHardware(item, api){
    api.checkBtn.textContent='Emitir diagnóstico';
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">HARDWARE</span><strong>Diagnóstico de gargalo</strong></div><div class="terminal-box">Cenário: IDE, navegador e máquina virtual abertos. CPU 48%, RAM 96%, SSD 35%, GPU 12%. O sistema começa a usar arquivo de paginação e alternar janelas fica lento.</div><div class="lab-grid"><div class="lab-field"><label>Gargalo principal</label><select id="hwBottle"><option value="">Selecione...</option><option value="cpu">CPU</option><option value="ram">RAM</option><option value="ssd">SSD</option><option value="gpu">GPU</option></select></div><div class="lab-field"><label>Ação prioritária</label><select id="hwAction"><option value="">Selecione...</option><option value="gpu">Reduzir aceleração gráfica e atualizar o driver da GPU</option><option value="ram">Reduzir processos concorrentes, ajustar a VM e avaliar ampliação da RAM</option><option value="format">Reinstalar o sistema para eliminar possíveis serviços em segundo plano</option><option value="monitor">Migrar os arquivos da VM para um SSD mais rápido</option></select></div><div class="lab-field"><label>Confirmação</label><select id="hwConfirm"><option value="">Selecione...</option><option value="memory">Correlacionar memória comprometida, paginação e faltas de página</option><option value="fps">Correlacionar FPS, uso de GPU e tempo de quadro</option><option value="ping">Correlacionar latência de rede e perda de pacotes</option><option value="brightness">Comparar temperatura, clock e limitação térmica da CPU</option></select></div></div></div><div class="lab-preview"><h3>Indicadores</h3><div class="indicator">CPU<b>48%</b></div><div class="indicator danger-indicator">RAM<b>96%</b></div><div class="indicator">SSD<b>35%</b></div><div class="indicator">GPU<b>12%</b></div></div></div>`;
    let done=false;
    function check(){if(done)return true;const ok=document.getElementById('hwBottle').value==='ram'&&document.getElementById('hwAction').value==='ram'&&document.getElementById('hwConfirm').value==='memory';if(ok){done=true;api.completeLab(item,{points:95,power:'life_or_points',detail:{diagnosis:'RAM'}});return true;}api.feedback('O diagnóstico precisa relacionar o sintoma com a métrica saturada e escolher uma ação verificável.', 'warn');return false;}
    return {check,cleanup(){done=true;}};
  }

  function labUx(item, api){
    api.checkBtn.textContent='Validar interface';
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">UX/UI</span><strong>Auditoria de acessibilidade</strong></div><div class="ux-bad-card"><span class="ux-tiny">STATUS DO PEDIDO</span><button class="ux-low-button">CONFIRMAR</button><p>Erro indicado somente por cor.</p></div><div class="lab-grid"><div class="lab-field"><label>Contraste</label><select id="uxContrast"><option value="">Selecione...</option><option value="brand">Preservar as cores da marca e aumentar apenas o peso da fonte</option><option value="ratio">Medir a relação de contraste e ajustar texto ou fundo</option><option value="shadow">Adicionar contorno e sombra sem alterar as cores-base</option><option value="opacity">Aumentar a opacidade dos dois elementos na mesma proporção</option></select></div><div class="lab-field"><label>Mensagem de erro</label><select id="uxError"><option value="">Selecione...</option><option value="red">Usar cor e mensagem geral no topo da página</option><option value="text">Associar texto e ícone ao campo, mantendo a cor como pista complementar</option><option value="blink">Usar animação curta e aria-live sem indicar o campo</option><option value="hide">Mostrar o erro somente depois de uma segunda tentativa</option></select></div><div class="lab-field"><label>Navegação</label><select id="uxNav"><option value="">Selecione...</option><option value="mouse">Oferecer atalhos, mantendo ações críticas exclusivas do mouse</option><option value="keyboard">Garantir ordem de foco lógica, operação por teclado e foco visível</option><option value="timeout">Usar foco automático e fechar o aviso após três segundos</option><option value="captcha">Inserir confirmação adicional antes de cada ação crítica</option></select></div></div></div><div class="lab-preview"><h3>Critérios</h3><p>Perceptível • Operável • Compreensível • Robusto</p></div></div>`;
    let done=false;function check(){if(done)return true;const ok=document.getElementById('uxContrast').value==='ratio'&&document.getElementById('uxError').value==='text'&&document.getElementById('uxNav').value==='keyboard';if(ok){done=true;api.completeLab(item,{points:95,power:'hint',detail:{audit:3}});return true;}api.feedback('A interface ainda depende de pistas frágeis. Pense em contraste medido, múltiplas pistas e navegação por teclado.', 'warn');return false;}return {check,cleanup(){done=true;}};
  }

  function labApi(item, api){
    api.checkBtn.textContent='Enviar requisição';
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">API</span><strong>Monte uma criação de usuário</strong></div><div class="lab-grid"><div class="lab-field"><label>Método</label><select id="apiMethod"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select></div><div class="lab-field"><label>Endpoint</label><select id="apiPath"><option>/api/users/42</option><option>/api/users</option><option>/assets/users.css</option><option>/login.html</option></select></div><div class="lab-field"><label>Content-Type</label><select id="apiContent"><option>text/plain</option><option>application/json</option><option>image/png</option><option>multipart/mixed</option></select></div><div class="lab-field"><label>Status esperado</label><select id="apiStatus"><option>200 OK</option><option>201 Created</option><option>304 Not Modified</option><option>404 Not Found</option></select></div></div><label class="lab-code-label">Corpo JSON</label><textarea id="apiBody" class="code-input" spellcheck="false">{"name":"Ana","email":"ana@example.com"}</textarea></div><div class="lab-preview"><h3>Resposta simulada</h3><pre id="apiResponse" class="terminal-box">Aguardando...</pre></div></div>`;
    let done=false;function check(){if(done)return true;let parsed=null;try{parsed=JSON.parse(document.getElementById('apiBody').value);}catch(e){}const ok=document.getElementById('apiMethod').value==='POST'&&document.getElementById('apiPath').value==='/api/users'&&document.getElementById('apiContent').value==='application/json'&&document.getElementById('apiStatus').value==='201 Created'&&parsed?.name&&parsed?.email;document.getElementById('apiResponse').textContent=ok?'HTTP/1.1 201 Created\n{"id":42,"status":"created"}':'400/415 — revise método, rota, mídia, status ou JSON.';if(ok){done=true;api.completeLab(item,{points:110,power:'next2x',detail:{method:'POST',status:201}});return true;}api.feedback('A requisição não representa corretamente a criação de um recurso REST com JSON.', 'warn');return false;}return {check,cleanup(){done=true;}};
  }

  function labInnovation(item, api){
    api.checkBtn.textContent='Validar escopo';
    const items=['Login básico','Cadastro do problema principal','Relatório com 12 temas de cor','Integração com rede social ainda não validada','Teste com 5 usuários','Correção do fluxo crítico'];
    const groups=['MVP','Depois do MVP'];
    const map={'Login básico':'MVP','Cadastro do problema principal':'MVP','Teste com 5 usuários':'MVP','Correção do fluxo crítico':'MVP','Relatório com 12 temas de cor':'Depois do MVP','Integração com rede social ainda não validada':'Depois do MVP'};
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">PRODUTO</span><strong>Priorize um MVP testável</strong></div>${classifyHtml(items,groups)}</div><div class="lab-preview"><h3>Regra</h3><p>O MVP deve testar a hipótese central com o menor escopo que ainda entregue valor e aprendizado.</p></div></div>`;enableDrag();let done=false;function check(){if(done)return true;let score=0;document.querySelectorAll('.drop-zone').forEach(zone=>zone.querySelectorAll('.drag-card').forEach(card=>{if(map[card.dataset.value]===zone.dataset.group)score++;}));if(score===items.length){done=true;api.completeLab(item,{points:95,power:'points',detail:{priorities:score}});return true;}api.feedback(`Você classificou ${score}/${items.length}. Diferencie hipótese central de funcionalidades desejáveis.`, 'warn');return false;}return {check,cleanup(){done=true;}};
  }

  function labLanguage(item, api){
    api.checkBtn.textContent='Concluir análise';
    const spanish=item.idiomas?.includes('Espanhol técnico');
    const ticket=spanish?'El despliegue falló porque la variable de entorno no estaba definida. Restaure la versión estable y revise los registros.':'The deployment failed because the environment variable was undefined. Roll back to the stable release and inspect the logs.';
    api.body.innerHTML=`<div class="lab-shell rich-lab"><div class="lab-main"><div class="lab-toolbar"><span class="tag">${spanish?'ES':'EN'} • TICKET</span><strong>Interprete uma ocorrência técnica</strong></div><blockquote id="langTicket" class="terminal-box"></blockquote><div class="lab-grid"><div class="lab-field"><label>Causa</label><select id="langCause"><option value="">Selecione...</option><option value="env">Variável de ambiente ausente/indefinida</option><option value="screen">Incompatibilidade de resolução no ambiente de produção</option><option value="mouse">Dependência nativa ausente no agente de implantação</option><option value="font">Arquivo estático não encontrado durante o build</option></select></div><div class="lab-field"><label>Ação imediata</label><select id="langAction"><option value="">Selecione...</option><option value="rollback">Restaurar a versão estável</option><option value="delete">Recriar o banco a partir do último backup antes de analisar</option><option value="ignore">Executar novamente o mesmo deploy sem alterar o ambiente</option><option value="rename">Corrigir diretamente a variável em produção sem rollback</option></select></div><div class="lab-field"><label>Evidência a consultar</label><select id="langEvidence"><option value="">Selecione...</option><option value="logs">Logs/registros da implantação</option><option value="colors">Diff dos arquivos estáticos publicados</option><option value="wallpaper">Histórico de alterações da interface</option><option value="keyboard">Configuração local do desenvolvedor que iniciou o deploy</option></select></div></div></div><div class="lab-preview"><h3>Vocabulário-chave</h3><p>${spanish?'despliegue • variable de entorno • restaurar • registros':'deployment • environment variable • roll back • logs'}</p></div></div>`;
    document.getElementById('langTicket').textContent=ticket;let done=false;function check(){if(done)return true;const ok=document.getElementById('langCause').value==='env'&&document.getElementById('langAction').value==='rollback'&&document.getElementById('langEvidence').value==='logs';if(ok){done=true;api.completeLab(item,{points:90,power:'hint',detail:{language:spanish?'es':'en'}});return true;}api.feedback('Leia o ticket procurando causa, ação imediata e evidência técnica.', 'warn');return false;}return {check,cleanup(){done=true;}};
  }

  function classifyHtml(items, groups){
    return `<div class="classify-wrap"><div class="cards-pool">${items.map(x=>`<div class="drag-card" draggable="true" data-value="${escapeHtml(x)}">${escapeHtml(x)}</div>`).join('')}</div>${groups.map(g=>`<div class="drop-zone" data-group="${escapeHtml(g)}"><h4>${escapeHtml(g)}</h4></div>`).join('')}</div>`;
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
  function sanitizeHtmlForPreview(html){ return S().sanitizePreviewHtml(html); }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  window.DS_Labs = {renderLab, classifyHtml, enableDrag};
})();
