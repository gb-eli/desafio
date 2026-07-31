(function(){
  'use strict';
  window.DS_CONFIG = {
    appVersion: 'desafio-ds-v26.0-guided-cyber-analysis',
    bankContentMaterial: "BANK-CONTENT-tQI4FUS4FVVfcK9WcdT4ynz5yCRpxWPn",
    maxSecurityWarnings: 4,
    securityPolicy: 'evidence-first',
    maxChallengeSkips: 5,
    challengeSkipLossPercents: [10,15,20,25,30],
    maxSingleXpChange: 800,
    questionTimeSeconds: 150,
    questionTimePerDifficultySeconds: 15,
    labTimeSeconds: 240,
    diagnosticPostponeLimit: 5,
    minimumDiagnosticAnsweredPercent: 60,
    minimumDiagnosticAnsweredAbsolute: 8,
    minimumAreaQuestionsForProfile: 2,
    minimumAreaCoveragePercent: 50,
    modes: {
      prova: {label:'Modo Prova',bank:'prova',maxLives:null,noLifeLoss:true,allowGameOverByLives:false,baseHints:5,labEvery:6,generalQuestionSamplePerArea:4,generalLabSample:6,specificLabSample:2,minimumSessionSeconds:600,specificQuestionSample:8,shuffleQuestions:true,shuffleLabs:true},
      desafio: {label:'Modo Desafio',bank:'desafio',maxLives:5,noLifeLoss:false,allowGameOverByLives:true,baseHints:5,labEvery:6,generalQuestionSamplePerArea:8,generalLabSample:9,specificLabSample:2,minimumSessionSeconds:720,specificQuestionSample:18,shuffleQuestions:true,shuffleLabs:true},
      professor: {label:'Modo Professor',bank:'desafio',maxLives:null,noLifeLoss:true,allowGameOverByLives:false,baseHints:99,labEvery:5,generalQuestionSamplePerArea:0,generalLabSample:0,specificLabSample:0,minimumSessionSeconds:0,specificQuestionSample:0,shuffleQuestions:false,shuffleLabs:false,teacherMode:true}
    }
  };
})();
