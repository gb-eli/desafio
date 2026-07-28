(function(){
  'use strict';
  const DIFFICULTY_WEIGHTS = Object.freeze({1:1,2:1.25,3:1.65,4:2.2,5:3});
  const COGNITIVE_BONUS = Object.freeze({lembrar:0,compreender:2,aplicar:5,analisar:9,avaliar:12,criar:16});
  function level(value){ return Math.max(1,Math.min(5,Number(value)||2)); }
  function weight(value){ return DIFFICULTY_WEIGHTS[level(value)] || 1; }
  function minimumReadSeconds(question){
    const difficulty=level(question?.dificuldade);
    const chars=String(question?.enunciado||'').length + (question?.alternativas||[]).reduce((sum,item)=>sum+String(item?.texto||'').length,0);
    const reading=Math.ceil(chars/85);
    return Math.max(5,Math.min(16,4+difficulty+reading));
  }
  function normalPaceRange(question){
    const difficulty=level(question?.dificuldade);
    const estimate=Math.max(25,Number(question?.tempo_estimado)||45+difficulty*10);
    return {min:minimumReadSeconds(question), idealMin:Math.max(8,Math.round(estimate*.18)), idealMax:Math.max(25,Math.round(estimate*.95)), estimate};
  }
  function questionXp(question, elapsed, combo=0){
    const difficulty=level(question?.dificuldade);
    const cognitive=String(question?.nivel_cognitivo||'aplicar').toLowerCase();
    const base=Math.round(18*weight(difficulty) + (COGNITIVE_BONUS[cognitive]||4));
    const pace=normalPaceRange(question);
    const paceBonus=elapsed>=pace.idealMin && elapsed<=pace.idealMax ? 6+difficulty*2 : 0;
    const comboBonus=Math.min(18,Math.max(0,Number(combo)||0)*2);
    return {base,paceBonus,comboBonus,total:base+paceBonus+comboBonus,difficulty,pace};
  }
  function validateQuestion(question){
    const errors=[];
    if(!question?.id) errors.push('id ausente');
    if(!question?.area) errors.push('área ausente');
    if(!question?.tipo) errors.push('tipo ausente');
    if(!question?.enunciado) errors.push('enunciado ausente');
    if(question?.tipo==='multipla_escolha' && (!Array.isArray(question.alternativas)||question.alternativas.length<3)) errors.push('alternativas insuficientes');
    if(!question?.answerProof && !Array.isArray(question?.answerProofs)) errors.push('prova de resposta ausente');
    return errors;
  }
  function validateLab(lab){
    const errors=[];
    if(!lab?.id) errors.push('id ausente');
    if(!lab?.area) errors.push('área ausente');
    if(!lab?.lab) errors.push('controlador ausente');
    return errors;
  }
  window.DS_Assessment=Object.freeze({DIFFICULTY_WEIGHTS,level,weight,minimumReadSeconds,normalPaceRange,questionXp,validateQuestion,validateLab});
})();
