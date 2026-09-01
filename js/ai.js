/* ============================================================
   ai.js - AI调用核心 + 仿向量化记忆 + 世界书
   支持 OpenAI 兼容流式 API，正则过滤，记忆召回
   ============================================================ */
const AI={
  audio:null,
  api(t='main'){return Store.state.apis[t]||Store.state.apis.main;},
  async test(t='main'){
    const a=this.api(t);if(!a.url||!a.key)return{ok:false,error:'请配置API'};
    try{const r=await fetch(`${a.url.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${a.key}`},body:JSON.stringify({model:a.model||'gpt-3.5-turbo',messages:[{role:'user',content:'测试'}],max_tokens:10})});if(r.ok){const d=await r.json();return{ok:true,reply:d.choices?.[0]?.message?.content||'成功'};}return{ok:false,error:`HTTP ${r.status}`};}catch(e){return{ok:false,error:e.message};}
  },
  async chat(msgs,opt={}){
    const a=this.api(opt.apiType||'main');if(!a.url||!a.key)throw new Error('请配置API');
    const m=[...msgs];
    if(opt.presetId){const p=Store.state.presets.find(x=>x.id===opt.presetId);if(p)m.unshift({role:'system',content:p.content});}
    const wb=Store.state.worldBook.filter(e=>e.type==='always');if(wb.length)m.unshift({role:'system',content:wb.map(e=>`[${e.name}]\n${e.content}`).join('\n\n')});
    if(opt.personaId){const p=Store.state.personas.find(x=>x.id===opt.personaId);if(p)m.unshift({role:'system',content:`用户面具：\n${p.content}`});}
    if(opt.recallQuery&&Store.state.memories.length){const rc=Memory.recall(opt.recallQuery,5);if(rc.length)m.unshift({role:'system',content:`相关记忆：\n${rc.map(x=>`- [${x.category||'其他'}] ${x.content}`).join('\n')}`});}
    const r=await fetch(`${a.url.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${a.key}`},body:JSON.stringify({model:a.model||'gpt-3.5-turbo',messages:m,temperature:opt.temperature??0.8,max_tokens:opt.maxTokens??2000})});
    if(!r.ok){const t=await r.text();throw new Error(`API错误 ${r.status}: ${t.slice(0,200)}`);}
    const d=await r.json();let c=d.choices?.[0]?.message?.content||'';c=this.regex(c);if(opt.autoMemory!==false&&c)this.extractMem(c,opt.recallQuery||'');return c;
  },
  async chatStream(msgs,opt={},onChunk){
    const a=this.api(opt.apiType||'main');if(!a.url||!a.key)throw new Error('请配置API');
    const m=[...msgs];
    if(opt.presetId){const p=Store.state.presets.find(x=>x.id===opt.presetId);if(p)m.unshift({role:'system',content:p.content});}
    const wb=Store.state.worldBook.filter(e=>e.type==='always');if(wb.length)m.unshift({role:'system',content:wb.map(e=>`[${e.name}]\n${e.content}`).join('\n\n')});
    if(opt.personaId){const p=Store.state.personas.find(x=>x.id===opt.personaId);if(p)m.unshift({role:'system',content:`用户面具：\n${p.content}`});}
    if(opt.recallQuery&&Store.state.memories.length){const rc=Memory.recall(opt.recallQuery,5);if(rc.length)m.unshift({role:'system',content:`相关记忆：\n${rc.map(x=>`- [${x.category||'其他'}] ${x.content}`).join('\n')}`});}
    const r=await fetch(`${a.url.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${a.key}`},body:JSON.stringify({model:a.model||'gpt-3.5-turbo',messages:m,temperature:opt.temperature??0.8,max_tokens:opt.maxTokens??2000,stream:true})});
    if(!r.ok){const t=await r.text();throw new Error(`API错误 ${r.status}: ${t.slice(0,200)}`);}
    const reader=r.body.getReader();const decoder=new TextDecoder();let full='',buf='';
    while(true){const{done,value}=await reader.read();if(done)break;buf+=decoder.decode(value,{stream:true});const lines=buf.split('\n');buf=lines.pop()||'';
      for(const line of lines){const tr=line.trim();if(!tr||!tr.startsWith('data: '))continue;const data=tr.slice(6);if(data==='[DONE]')continue;try{const p=JSON.parse(data);const delta=p.choices?.[0]?.delta?.content;if(delta){full+=delta;if(onChunk)onChunk(delta,full);}}catch(e){}}
    }
    full=this.regex(full);if(opt.autoMemory!==false&&full)this.extractMem(full,opt.recallQuery||'');return full;
  },
  regex(t){if(!t)return'';let r=t;for(const rule of Store.state.regexRules){if(!rule.enabled)continue;try{const re=new RegExp(rule.pattern,rule.flags||'g');r=r.replace(re,rule.replacement||'');}catch(e){}}return r.trim();},
  extractMem(text,ctx){
    const s=text.split(/[。！？\n]/).filter(x=>x.length>10);
    if(s.length){const k=s[Math.floor(s.length/2)];if(k.length>15&&k.length<100)Store.addMem({content:k.slice(0,80),category:'other',source:'auto',context:ctx});}
  },
  async gen(prompt,opt={}){
    const m=[...(opt.system?[{role:'system',content:opt.system}]:[]),{role:'user',content:prompt}];
    return await this.chat(m,{apiType:opt.apiType||'assistant',autoMemory:false,maxTokens:opt.maxTokens||2000,temperature:opt.temperature??0.9});
  },
  playMusic(m){this.stopMusic();if(!m||!m.url)return;this.audio=new Audio(m.url);this.audio.loop=true;this.audio.volume=Store.state.settings.bgVolume||0.5;this.audio.play().catch(()=>{});},
  stopMusic(){if(this.audio){this.audio.pause();this.audio=null;}},
  setVolume(v){Store.state.settings.bgVolume=v;if(this.audio)this.audio.volume=v;Store.save();},
};

const Memory={
  recall(q,limit=5){
    if(!q||!Store.state.memories.length)return[];
    const scored=Store.state.memories.map(m=>{
      const sc=Utils.textSimilarity(q,m.content+' '+(m.context||''));
      const age=(Date.now()-(m.timestamp||0))/86400000;
      return{...m,score:sc*Math.max(0.5,1-age/30)};
    });
    scored.sort((a,b)=>b.score-a.score);return scored.filter(m=>m.score>0.01).slice(0,limit);
  },
  add(c,cat='other',ctx=''){return Store.addMem({content:c,category:cat,context:ctx,source:'manual'});},
  del(id){Store.state.memories=Store.state.memories.filter(m=>m.id!==id);Store.save();},
  clear(){Store.state.memories=[];Store.save();},
};
