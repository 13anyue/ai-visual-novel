/* ============================================================
   ai.js - AI调用核心 v8
   OpenAI兼容API | 仿向量化记忆 | 世界书注入 | 预设/面具/正则
   增强：字数控制、文风控制、流式输出、智能召回
   ============================================================ */
const AI={
  audio:null,
  /** 获取API配置 */
  api(t='main'){return Store.state.apis[t]||Store.state.apis.main;},
  /** 测试API连接 */
  async test(t='main'){
    const a=this.api(t);if(!a.url||!a.key)return{ok:false,error:'请配置API'};
    try{const r=await fetch(`${a.url.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${a.key}`},body:JSON.stringify({model:a.model||'gpt-3.5-turbo',messages:[{role:'user',content:'测试'}],max_tokens:10})});if(r.ok){const d=await r.json();return{ok:true,reply:d.choices?.[0]?.message?.content||'成功'};}return{ok:false,error:`HTTP ${r.status}`};}catch(e){return{ok:false,error:e.message};}
  },
  /** 非流式对话（支持预设/世界书/面具/记忆召回/字数控制/文风控制） */
  async chat(msgs,opt={}){
    const a=this.api(opt.apiType||'main');if(!a.url||!a.key)throw new Error('请配置API');
    const m=[...msgs];
    // 预设注入
    const sid=opt.presetId||Store.state.settings.activePreset;
    if(sid){const p=Store.state.presets.find(x=>x.id===sid);if(p)m.unshift({role:'system',content:p.content});}
    // 世界书常驻注入
    const wb=Store.state.worldBook.filter(e=>e.type==='always');if(wb.length)m.unshift({role:'system',content:wb.map(e=>`[${e.name}]\n${e.content}`).join('\n\n')});
    // 关键词世界书
    const q=opt.recallQuery||'';if(q){const kwb=Store.state.worldBook.filter(e=>e.type==='keyword'&&e.keywords);kwb.forEach(e=>{const ks=e.keywords.split(/[,，]/).map(k=>k.trim()).filter(Boolean);if(ks.some(k=>q.includes(k)))m.unshift({role:'system',content:`[${e.name}]\n${e.content}`});});}
    // 面具注入
    if(opt.personaId||Store.state.settings.activePersona){const pid=opt.personaId||Store.state.settings.activePersona;const p=Store.state.personas.find(x=>x.id===pid);if(p)m.unshift({role:'system',content:`扮演设定：\n${p.content}`});}
    // 记忆召回
    if((opt.recallQuery||opt.autoMemory!==false)&&Store.state.memories.length&&Store.state.settings.activeMemory!==false){
      const rc=Memory.recall(opt.recallQuery||msgs[msgs.length-1]?.content||'',5);
      if(rc.length)m.unshift({role:'system',content:`相关记忆：\n${rc.map(x=>`- [${x.category||'其他'}] ${x.content}`).join('\n')}`});
    }
    // 字数控制
    const wl=Store.state.settings.wordLimit;if(wl){m.unshift({role:'system',content:`请控制回复在${wl}字以内。`});}
    // 文风控制
    const ws=Store.state.settings.writingStyle;if(ws){m.unshift({role:'system',content:`文风要求：${ws}`});}
    // API调用
    const r=await fetch(`${a.url.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${a.key}`},body:JSON.stringify({model:a.model||'gpt-3.5-turbo',messages:m,temperature:opt.temperature??Store.state.settings.temperature??0.8,max_tokens:opt.maxTokens??Store.state.settings.maxTokens??2000})});
    if(!r.ok){const t=await r.text();throw new Error(`API错误 ${r.status}: ${t.slice(0,200)}`);}
    const d=await r.json();let c=d.choices?.[0]?.message?.content||'';c=this.regex(c);
    if(opt.autoMemory!==false&&c)this.extractMem(c,opt.recallQuery||'');
    return c;
  },
  /** 流式对话 */
  async chatStream(msgs,opt={},onChunk){
    const a=this.api(opt.apiType||'main');if(!a.url||!a.key)throw new Error('请配置API');
    const m=[...msgs];
    const sid=opt.presetId||Store.state.settings.activePreset;
    if(sid){const p=Store.state.presets.find(x=>x.id===sid);if(p)m.unshift({role:'system',content:p.content});}
    const wb=Store.state.worldBook.filter(e=>e.type==='always');if(wb.length)m.unshift({role:'system',content:wb.map(e=>`[${e.name}]\n${e.content}`).join('\n\n')});
    const q=opt.recallQuery||'';if(q){const kwb=Store.state.worldBook.filter(e=>e.type==='keyword'&&e.keywords);kwb.forEach(e=>{const ks=e.keywords.split(/[,，]/).map(k=>k.trim()).filter(Boolean);if(ks.some(k=>q.includes(k)))m.unshift({role:'system',content:`[${e.name}]\n${e.content}`});});}
    if(opt.personaId||Store.state.settings.activePersona){const pid=opt.personaId||Store.state.settings.activePersona;const p=Store.state.personas.find(x=>x.id===pid);if(p)m.unshift({role:'system',content:`扮演设定：\n${p.content}`});}
    if((opt.recallQuery||opt.autoMemory!==false)&&Store.state.memories.length&&Store.state.settings.activeMemory!==false){
      const rc=Memory.recall(opt.recallQuery||msgs[msgs.length-1]?.content||'',5);
      if(rc.length)m.unshift({role:'system',content:`相关记忆：\n${rc.map(x=>`- [${x.category||'其他'}] ${x.content}`).join('\n')}`});
    }
    const wl=Store.state.settings.wordLimit;if(wl)m.unshift({role:'system',content:`请控制回复在${wl}字以内。`});
    const ws=Store.state.settings.writingStyle;if(ws)m.unshift({role:'system',content:`文风要求：${ws}`});
    const r=await fetch(`${a.url.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${a.key}`},body:JSON.stringify({model:a.model||'gpt-3.5-turbo',messages:m,temperature:opt.temperature??Store.state.settings.temperature??0.8,max_tokens:opt.maxTokens??Store.state.settings.maxTokens??2000,stream:true})});
    if(!r.ok){const t=await r.text();throw new Error(`API错误 ${r.status}: ${t.slice(0,200)}`);}
    const reader=r.body.getReader();const decoder=new TextDecoder();let full='',buf='';
    while(true){const{done,value}=await reader.read();if(done)break;buf+=decoder.decode(value,{stream:true});const lines=buf.split('\n');buf=lines.pop()||'';
      for(const line of lines){const tr=line.trim();if(!tr||!tr.startsWith('data: '))continue;const data=tr.slice(6);if(data==='[DONE]')continue;try{const p=JSON.parse(data);const delta=p.choices?.[0]?.delta?.content;if(delta){full+=delta;if(onChunk)onChunk(delta,full);}}catch(e){}}
    }
    full=this.regex(full);if(opt.autoMemory!==false&&full)this.extractMem(full,opt.recallQuery||'');return full;
  },
  /** 正则过滤 */
  regex(t){if(!t)return'';let r=t;for(const rule of Store.state.regexRules){if(rule.enabled===false)continue;try{const re=new RegExp(rule.pattern,rule.flags||'g');r=r.replace(re,rule.replacement||'');}catch(e){}}return r.trim();},
  /** 自动提取记忆 */
  extractMem(text,ctx){
    const s=text.split(/[。！？\n]/).filter(x=>x.length>10);
    if(s.length){const k=s[Math.floor(s.length/2)];if(k.length>15&&k.length<120)Store.addMem({content:k.slice(0,100),category:'other',source:'auto',context:ctx});}
  },
  /** 通用生成 */
  async gen(prompt,opt={}){
    const m=[...(opt.system?[{role:'system',content:opt.system}]:[]),{role:'user',content:prompt}];
    return await this.chat(m,{apiType:opt.apiType||'assistant',autoMemory:false,maxTokens:opt.maxTokens||2000,temperature:opt.temperature??0.9});
  },
  /** 播放音乐 */
  playMusic(m){this.stopMusic();if(!m||!m.url)return;this.audio=new Audio(m.url);this.audio.loop=true;this.audio.volume=Store.state.settings.bgVolume||0.5;this.audio.play().catch(()=>{});},
  /** 停止音乐 */
  stopMusic(){if(this.audio){this.audio.pause();this.audio=null;}},
  /** 设置音量 */
  setVolume(v){Store.state.settings.bgVolume=v;if(this.audio)this.audio.volume=v;Store.save();},
  /** 读取代码文件内容 */
  async readProjectFile(){return new Promise(r=>{
    const inp=document.createElement('input');inp.type='file';
    inp.onchange=()=>{const f=inp.files[0];if(!f){r(null);return;}const rd=new FileReader();rd.onload=()=>r({name:f.name,content:rd.result,size:f.size});rd.readAsText(f);};
    inp.click();
  });},
};

const Memory={
  /** 记忆召回（文本相似度+时间衰减） */
  recall(q,limit=5){
    if(!q||!Store.state.memories.length)return[];
    const scored=Store.state.memories.map(m=>{
      const sc=Utils.textSimilarity(q,m.content+' '+(m.context||''));
      const age=(Date.now()-(m.timestamp||0))/86400000;
      return{...m,score:sc*Math.max(0.3,1-age/60)};
    });
    scored.sort((a,b)=>b.score-a.score);return scored.filter(m=>m.score>0.005).slice(0,limit);
  },
  /** 添加记忆 */
  add(c,cat='other',ctx=''){return Store.addMem({content:c,category:cat,context:ctx,source:'manual'});},
  /** 删除记忆 */
  del(id){Store.state.memories=Store.state.memories.filter(m=>m.id!==id);Store.save();},
  /** 清空记忆 */
  clear(){Store.state.memories=[];Store.save();},
  /** 按分类获取记忆 */
  getByCategory(cat){return Store.state.memories.filter(m=>m.category===cat).sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));},
  /** 获取全部记忆 */
  getAll(){return [...Store.state.memories].sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));},
  /** AI总结记忆 */
  async summarize(){
    if(!Store.state.memories.length)return'暂无记忆可总结。';
    const mems=Store.state.memories.slice(-30).map((m,i)=>`${i+1}. [${m.category}] ${m.content}`).join('\n');
    const sys='请总结以下记忆内容，提炼关键信息和事件脉络。使用简洁的Markdown格式。';
    return await AI.gen(`请总结以下记忆：\n\n${mems}`,{system:sys,maxTokens:800});
  },
};
