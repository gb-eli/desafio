(function(){
  'use strict';
  window.DS_CONFIG = {
    appVersion: 'desafio-ds-v18.1-validacao-seguranca',
    maxSecurityWarnings: 4,
    securityPolicy: 'evidence-first',
    maxChallengeSkips: 3,
    challengeSkipLossPercents: [15, 30, 50],
    maxSingleXpChange: 800,
    rescuePasswordHash: 'c09036c978fa80956da5330751802b6589b987d7ad20e69d24669dfd1ee7d957',
    modes: {
      prova: {
        label: 'Modo Prova',
        passwordHash: '8c7e072c1e05007d4cdbd00843aafdb5976ea7c5687fef24787656607d51bf7e',
        bank: 'prova',
        maxLives: null,
        noLifeLoss: true,
        allowGameOverByLives: false,
        baseHints: 5,
        labEvery: 6,
        generalQuestionSamplePerArea: 4,
        generalLabSample: 6,
        specificLabSample: 2,
        minimumSessionSeconds: 600,
        specificQuestionSample: 8,
        shuffleQuestions: true,
        shuffleLabs: true
      },
      desafio: {
        label: 'Modo Desafio',
        passwordHash: 'd19e8a4a750e9fe5fa18333ed6748474c3d14bc9d4a3d47e852f392253e7be72',
        bank: 'desafio',
        maxLives: 4,
        noLifeLoss: false,
        allowGameOverByLives: true,
        baseHints: 5,
        labEvery: 6,
        generalQuestionSamplePerArea: 8,
        generalLabSample: 9,
        specificLabSample: 2,
        minimumSessionSeconds: 720,
        specificQuestionSample: 18,
        shuffleQuestions: true,
        shuffleLabs: true
      },
      professor: {
        label: 'Modo Professor',
        passwordHash: 'd72a7a5c070a841eb5efe93f6153256a22702b09e42692702fa36c6f94dd0931',
        bank: 'desafio',
        maxLives: null,
        noLifeLoss: true,
        allowGameOverByLives: false,
        baseHints: 99,
        labEvery: 5,
        generalQuestionSamplePerArea: 0,
        generalLabSample: 0,
        specificLabSample: 0,
        minimumSessionSeconds: 0,
        specificQuestionSample: 0,
        shuffleQuestions: false,
        shuffleLabs: false,
        teacherMode: true
      }
    }
  };
})();
