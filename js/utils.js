/* ============================================================
   utils.js - 通用工具函数库
   提供：弹窗/提示/MD渲染/分词/防抖/文件处理/SVG图标
   ============================================================ */
const Utils={
  toast(msg,dur=2500){
    const e=document.querySelector('.toast');if(e)e.remove();
    const d=document.createElement('div');d.className='toast';d.textContent=msg;document.body.appendChild(d);
    setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity 0.3s';setTimeout(()=>d.remove(),300);},dur);
  },
  confirm(title,msg,ok='确认',cancel='取消'){
    return new Promise(r=>{
      const o=document.createElement('div');o.className='modal-overlay';
      o.innerHTML=`<div class="modal"><div class="modal-header"><span class="modal-title">${this.escape(title)}</span></div><div class="modal-body"><p class="text-sm">${this.escape(msg)}</p></div><div class="modal-footer"><button class="btn btn-sm" id="cf-cancel">${cancel}</button><button class="btn btn-sm btn-primary" id="cf-ok">${ok}</button></div></div>`;
      document.body.appendChild(o);
      o.querySelector('#cf-ok').onclick=()=>{o.remove();r(true);};
      o.querySelector('#cf-cancel').onclick=()=>{o.remove();r(false);};
      o.addEventListener('click',e=>{if(e.target===o){o.remove();r(false);}});
    });
  },
  prompt(title,ph='',def=''){
    return new Promise(r=>{
      const o=document.createElement('div');o.className='modal-overlay';
      o.innerHTML=`<div class="modal"><div class="modal-header"><span class="modal-title">${this.escape(title)}</span></div><div class="modal-body"><input class="input" id="pr-in" placeholder="${this.escape(ph)}" value="${this.escape(def)}"></div><div class="modal-footer"><button class="btn btn-sm" id="pr-cancel">取消</button><button class="btn btn-sm btn-primary" id="pr-ok">确认</button></div></div>`;
      document.body.appendChild(o);const inp=o.querySelector('#pr-in');inp.focus();
      const close=v=>{o.remove();r(v);};
      o.querySelector('#pr-ok').onclick=()=>close(inp.value);
      o.querySelector('#pr-cancel').onclick=()=>close(null);
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')close(inp.value);if(e.key==='Escape')close(null);});
      o.addEventListener('click',e=>{if(e.target===o)close(null);});
    });
  },
  formModal(title,fields,vals={}){
    return new Promise(r=>{
      const o=document.createElement('div');o.className='modal-overlay';
      const fh=fields.map(f=>{
        const v=vals[f.key]||'';
        if(f.type==='textarea')return`<div class="field"><label class="label">${f.label}</label><textarea class="textarea" id="f_${f.key}" placeholder="${f.placeholder||''}">${this.escape(v)}</textarea></div>`;
        if(f.type==='select'){const opts=(f.options||[]).map(op=>`<option value="${op.value}" ${v==op.value?'selected':''}>${op.label}</option>`).join('');return`<div class="field"><label class="label">${f.label}</label><select class="select" id="f_${f.key}">${opts}</select></div>`;}
        return`<div class="field"><label class="label">${f.label}</label><input class="input" id="f_${f.key}" placeholder="${f.placeholder||''}" value="${this.escape(v)}"></div>`;
      }).join('');
      o.innerHTML=`<div class="modal"><div class="modal-header"><span class="modal-title">${this.escape(title)}</span></div><div class="modal-body">${fh}</div><div class="modal-footer"><button class="btn btn-sm" id="fm-cancel">取消</button><button class="btn btn-sm btn-primary" id="fm-ok">确认</button></div></div>`;
      document.body.appendChild(o);
      const collect=()=>{const res={};fields.forEach(f=>{res[f.key]=o.querySelector(`#f_${f.key}`).value;});return res;};
      o.querySelector('#fm-ok').onclick=()=>{const d=collect();o.remove();r(d);};
      o.querySelector('#fm-cancel').onclick=()=>{o.remove();r(null);};
      o.addEventListener('click',e=>{if(e.target===o){o.remove();r(null);}});
    });
  },
  escape(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');},
  markdown(t){
    if(!t)return'';
    let h=this.escape(t);
    h=h.replace(/```([\s\S]*?)```/g,'<pre style="background:var(--bg-deep);padding:8px;border-radius:4px;overflow-x:auto;font-size:0.75rem;margin:6px 0"><code>$1</code></pre>');
    h=h.replace(/`([^`]+)`/g,'<code style="background:var(--bg-deep);padding:1px 4px;border-radius:3px;font-size:0.8rem">$1</code>');
    h=h.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');h=h.replace(/\*([^*]+)\*/g,'<em>$1</em>');
    h=h.replace(/^- (.+)$/gm,'<li>$1</li>');h=h.replace(/(<li>.*<\/li>\n?)+/g,m=>'<ul style="padding-left:16px;margin:4px 0">'+m+'</ul>');
    h=h.replace(/^> (.+)$/gm,'<blockquote style="border-left:2px solid var(--gold);padding-left:8px;margin:6px 0;color:var(--ink-light)">$1</blockquote>');
    h=h.split('\n\n').map(p=>{if(p.startsWith('<'))return p;return'<p style="margin:4px 0">'+p.replace(/\n/g,'<br>')+'</p>';}).join('\n');
    return h;
  },
  uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);},
  timeFmt(ts){const d=new Date(ts||Date.now());const p=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;},
  dateShort(ts){const d=new Date(ts||Date.now());return`${d.getMonth()+1}月${d.getDate()}日`;},
  compressImage(file,maxW=800,q=0.85){
    return new Promise(r=>{
      const rd=new FileReader();rd.onload=e=>{const img=new Image();img.onload=()=>{let{w,h}=img;if(w>maxW){h=h*(maxW/w);w=maxW;}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);r(c.toDataURL('image/jpeg',q));};img.src=e.target.result;};rd.readAsDataURL(file);
    });
  },
  debounce(fn,d=300){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),d);}},
  deepClone(o){return JSON.parse(JSON.stringify(o));},
  download(fn,ct,tp='text/plain'){const b=new Blob([ct],{type:tp});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=fn;a.click();URL.revokeObjectURL(u);},
  icons:{
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    music:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    brain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    chevronDown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
    send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    location:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    bot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    import:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 17 0z"/></svg>',
    gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    crown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/></svg>',
    shopping:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    task:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>',
    grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    backpack:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  },
  icon(n){return this.icons[n]||'';},
  tokenize(t){if(!t)return[];const c=t.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g,' ');const r=[];const s=c.split(/\s+/).filter(x=>x.length>0).join('');for(let i=0;i<s.length-1;i++)r.push(s.substring(i,i+2));for(let x of s)r.push(x);c.split(/\s+/).forEach(w=>{if(w.length>=2&&/^[a-z0-9]+$/.test(w))r.push(w);});return r;},
  textSimilarity(a,b){const ta=this.tokenize(a),tb=this.tokenize(b);if(!ta.length||!tb.length)return 0;const sa=new Set(ta),sb=new Set(tb);const inter=[...sa].filter(x=>sb.has(x));const un=new Set([...sa,...sb]);return inter.length/un.size;},
  isChinese(t){return/[\u4e00-\u9fff]/.test(t||'')},
  capitalize(s){return String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1)},
  slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')},
};
