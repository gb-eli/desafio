(function(){
  'use strict';
  const CONTROL_AND_BIDI = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;
  const ALLOWED_PREVIEW_TAGS = new Set(['MAIN','SECTION','ARTICLE','DIV','HEADER','FOOTER','NAV','H1','H2','H3','H4','H5','H6','P','SPAN','STRONG','EM','B','I','SMALL','UL','OL','LI','BUTTON','LABEL','INPUT','TEXTAREA','SELECT','OPTION','TABLE','THEAD','TBODY','TR','TH','TD','HR','BR']);
  const ALLOWED_ATTRS = new Set(['class','id','role','aria-label','aria-labelledby','aria-describedby','type','placeholder','value','name','for','disabled','checked','selected','rows','cols']);

  function text(value, max=1200){
    return String(value ?? '')
      .normalize('NFC')
      .replace(CONTROL_AND_BIDI,' ')
      .replace(/\s+/g,' ')
      .slice(0, Math.max(0, Number(max)||0))
      .trim();
  }
  function multiline(value, max=4000){
    return String(value ?? '')
      .normalize('NFC')
      .replace(CONTROL_AND_BIDI,' ')
      .replace(/\r\n?/g,'\n')
      .slice(0, Math.max(0, Number(max)||0))
      .trim();
  }
  function name(value, max=80){
    const clean = text(value,max)
      .replace(/[^\p{L}\p{M}\p{N} .,'’_-]/gu,'')
      .replace(/\s{2,}/g,' ')
      .replace(/^[\s.,'’_-]+|[\s.,'’_-]+$/g,'');
    return clean || 'Aluno';
  }
  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }
  function sanitizePreviewHtml(source){
    const input = multiline(source,12000);
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${input}</body>`,'text/html');
    Array.from(doc.body.querySelectorAll('*')).forEach(element=>{
      if(!ALLOWED_PREVIEW_TAGS.has(element.tagName)){
        element.remove();
        return;
      }
      Array.from(element.attributes).forEach(attr=>{
        const attrName=attr.name.toLowerCase();
        if(!ALLOWED_ATTRS.has(attrName) || attrName.startsWith('on')) element.removeAttribute(attr.name);
      });
      if(element.tagName==='BUTTON') element.setAttribute('type','button');
      if(element.tagName==='INPUT'){
        const type=(element.getAttribute('type')||'text').toLowerCase();
        if(!['text','number','email','date','checkbox','radio','button'].includes(type)) element.setAttribute('type','text');
      }
    });
    return doc.body.innerHTML;
  }
  function sanitizePreviewCss(source){
    let css = multiline(source,12000);
    css = css
      .replace(/@(?:import|charset|namespace|supports|document)[^;{]*(?:;|\{[\s\S]*?\})/gi,'')
      .replace(/url\s*\((?:[^)(]+|\([^)(]*\))*\)/gi,'none')
      .replace(/expression\s*\([^)]*\)/gi,'')
      .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi,'')
      .replace(/-moz-binding\s*:[^;]+;?/gi,'')
      .replace(/behavior\s*:[^;]+;?/gi,'')
      .replace(/position\s*:\s*fixed/gi,'position: absolute')
      .replace(/<\/style/gi,'<\\/style');
    return css;
  }
  function safeStylePercent(value){
    const n=Math.max(0,Math.min(100,Number(value)||0));
    return `${n.toFixed(0)}%`;
  }
  window.DS_Sanitize = Object.freeze({text,multiline,name,escapeHtml,sanitizePreviewHtml,sanitizePreviewCss,safeStylePercent});
})();
