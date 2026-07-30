(function(){
  'use strict';
  function randomUint32(){
    if(globalThis.crypto?.getRandomValues){
      const value = new Uint32Array(1);
      globalThis.crypto.getRandomValues(value);
      return value[0];
    }
    return Math.floor(Math.random() * 0x100000000);
  }
  function int(max){
    max = Math.floor(Number(max));
    if(!Number.isFinite(max) || max <= 1) return 0;
    const limit = Math.floor(0x100000000 / max) * max;
    let value;
    do { value = randomUint32(); } while(value >= limit);
    return value % max;
  }
  function shuffle(input){
    const array = Array.from(input || []);
    for(let i=array.length-1;i>0;i--){
      const j = int(i+1);
      [array[i],array[j]] = [array[j],array[i]];
    }
    return array;
  }
  function token(bytes=8){
    const raw = new Uint8Array(Math.max(4, Number(bytes)||8));
    if(globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(raw);
    else for(let i=0;i<raw.length;i++) raw[i]=int(256);
    return Array.from(raw, value=>value.toString(16).padStart(2,'0')).join('');
  }
  window.DS_Random = Object.freeze({int, shuffle, token});
})();
