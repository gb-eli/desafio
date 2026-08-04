(function(){
  'use strict';
  const A=()=>window.DS_Assessment;
  const CAREERS=[
    {key:'frontend',label:'Desenvolvimento Front-end',role:'Desenvolvedor Front-end Júnior',needs:['Front-end','UX/UI','JavaScript']},
    {key:'backend',label:'Desenvolvimento Back-end e APIs',role:'Desenvolvedor Back-end / APIs Júnior',needs:['Back-end','Programação','Banco de Dados']},
    {key:'software',label:'Engenharia de Software',role:'Assistente de Engenharia de Software',needs:['Engenharia de Software','Análise de Sistemas','Programação']},
    {key:'software-analysis',label:'Análise de Software',role:'Analista de Software Júnior',needs:['Engenharia de Software','Requisitos','Testes','Programação']},
    {key:'analysis',label:'Análise de Sistemas',role:'Analista de Sistemas Júnior',needs:['Análise de Sistemas','Requisitos','Modelagem']},
    {key:'database',label:'Banco de Dados',role:'Analista de Banco de Dados Júnior',needs:['Banco de Dados','SQL','Dados']},
    {key:'data',label:'Dados e BI',role:'Assistente de Dados / BI',needs:['Ciência de Dados','Dados','SQL']},
    {key:'security',label:'Segurança de Aplicações',role:'Assistente de Segurança de Aplicações',needs:['Segurança','Criptografia','Testes']},
    {key:'infra',label:'Infraestrutura e Cloud',role:'Técnico de Infraestrutura / Cloud Júnior',needs:['Infraestrutura','Cloud','Hardware','Terminal']},
    {key:'ux',label:'UX/UI e Computação Gráfica',role:'Designer de Interfaces / UX Júnior',needs:['UX/UI','Computação Gráfica','Front-end']},
    {key:'product',label:'Produto e Inovação',role:'Assistente de Produto e Inovação',needs:['Produto','Inovação','Empreendedorismo']},
    {key:'qa',label:'Qualidade e Testes',role:'Analista de QA Júnior',needs:['Testes','Engenharia de Software','Segurança']}
  ];
  function blank(){return {correct:0,total:0,weightedCorrect:0,weightedTotal:0,time:0,advancedCorrect:0,advancedTotal:0};}
  function add(bucket,correct,difficulty,time){
    const weight=A().weight(difficulty);
    bucket.total++; bucket.weightedTotal+=weight; bucket.time+=Number(time)||0;
    if(correct){bucket.correct++;bucket.weightedCorrect+=weight;}
    if(Number(difficulty)>=4){bucket.advancedTotal++;if(correct)bucket.advancedCorrect++;}
  }
  function finalize(bucket){
    const percent=bucket.weightedTotal?Math.round(bucket.weightedCorrect/bucket.weightedTotal*100):0;
    const raw=bucket.total?Math.round(bucket.correct/bucket.total*100):0;
    const advanced=bucket.advancedTotal?Math.round(bucket.advancedCorrect/bucket.advancedTotal*100):null;
    return {...bucket,percent,raw,advanced,averageTime:bucket.total?Math.round(bucket.time/bucket.total):0,level:levelLabel(percent,bucket.total,advanced)};
  }
  function levelLabel(percent,total,advanced){
    if(!total)return 'Não avaliado';
    if(total<2)return 'Amostra insuficiente';
    if(percent<25)return 'Iniciante I';
    if(percent<38)return 'Iniciante II';
    if(percent<50)return 'Básico I';
    if(percent<60)return 'Básico II';
    if(percent<70)return 'Intermediário I';
    if(percent<79)return 'Intermediário II';
    if(percent<87)return 'Avançado I';
    if(percent<93 || (advanced!==null&&advanced<70))return 'Avançado II';
    return 'Especialista';
  }
  function aggregate(answers,labs){
    const groups={areas:{},competencies:{},technologies:{},languages:{}};
    (answers||[]).forEach(record=>{
      const difficulty=record.dificuldade||2;
      const names={areas:[record.area],competencies:record.competencias||[],technologies:record.tecnologias||[],languages:record.idiomas||[]};
      Object.entries(names).forEach(([group,list])=>[...new Set((list||[]).filter(Boolean))].forEach(name=>{groups[group][name]||=blank();add(groups[group][name],!!record.correto,difficulty,record.tempo_segundos);}));
    });
    (labs||[]).filter(l=>l.concluido||l.pulado).forEach(record=>{
      const difficulty=record.dificuldade||4;
      const correct=!!record.concluido;
      const names={areas:[record.area],competencies:record.competencias||[],technologies:record.tecnologias||[],languages:record.idiomas||[]};
      Object.entries(names).forEach(([group,list])=>[...new Set((list||[]).filter(Boolean))].forEach(name=>{groups[group][name]||=blank();add(groups[group][name],correct,difficulty,record.tempo_segundos);}));
    });
    Object.keys(groups).forEach(group=>Object.keys(groups[group]).forEach(name=>groups[group][name]=finalize(groups[group][name])));
    return groups;
  }
  function careerRecommendations(competencies){
    const normalized=competencies||{};
    const scored=CAREERS.map(profile=>{
      const found=profile.needs.map(name=>normalized[name]).filter(Boolean);
      const score=found.length?Math.round(found.reduce((sum,item)=>sum+item.percent,0)/found.length * Math.min(1,found.length/2)):0;
      const coverage=found.reduce((sum,item)=>sum+item.total,0);
      return {...profile,score,coverage};
    }).sort((a,b)=>b.score-a.score||b.coverage-a.coverage);
    return scored.slice(0,3);
  }
  function overall(answers,labs,integrityWarnings=0,duration=0){
    const all=blank();
    (answers||[]).forEach(r=>add(all,!!r.correto,r.dificuldade||2,r.tempo_segundos));
    (labs||[]).forEach(r=>add(all,!!r.concluido,r.dificuldade||4,r.tempo_segundos));
    const result=finalize(all);
    const breadth=new Set((answers||[]).map(r=>r.area).filter(Boolean)).size;
    const fastRatio=(answers||[]).length?((answers||[]).filter(r=>r.tempo_segundos<(5+(r.dificuldade||2))).length/(answers||[]).length):0;
    let index=Math.round(result.percent*.72 + (result.advanced??result.percent)*.18 + Math.min(100,breadth*8)*.10);
    const caps=[];
    if(breadth<5){index=Math.min(index,69);caps.push('cobertura limitada de áreas');}
    if(result.advancedTotal<5){index=Math.min(index,79);caps.push('poucas questões avançadas');}
    if(fastRatio>.35){index=Math.min(index,59);caps.push('muitas respostas rápidas');}
    if(Number(duration)>0 && Number(duration)<300){index=Math.min(index,49);caps.push('duração muito curta');}
    if(integrityWarnings>=3){index=Math.min(index,54);caps.push('alertas de integridade');}
    return {...result,index,level:levelLabel(index,result.total,result.advanced),breadth,fastRatio:Math.round(fastRatio*100),caps};
  }
  function award(index,advanced,coverage,integrityWarnings){
    let value=Math.max(0,Math.min(100,Number(index)||0));
    if(integrityWarnings>=3)value=Math.min(value,59);
    if(coverage<5)value=Math.min(value,69);
    if(value>=98 && advanced>=92)return 'Titã';
    if(value>=96 && advanced>=88)return 'Mítico';
    if(value>=93 && advanced>=82)return 'Épico';
    if(value>=89 && advanced>=76)return 'Lendário';
    if(value>=84)return 'Mestre';
    if(value>=78)return 'Diamante';
    if(value>=70)return 'Platina';
    if(value>=61)return 'Ouro';
    if(value>=50)return 'Prata';
    if(value>=35)return 'Bronze';
    return 'Madeira';
  }
  window.DS_Proficiency=Object.freeze({aggregate,overall,award,levelLabel,careerRecommendations,CAREERS});
})();
