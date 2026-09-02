/* ============================================================
   store.js - 全局状态管理与 localStorage 持久化 v8
   全向沙盒：支持任意世界观、动态功能、自定义配置
   ============================================================ */
const Store={
  KEY:'avn_store_v8',
  state:null,
  def(){
    return{
      version:'v8',
      settings:{
        theme:'dark',bgMusic:null,bgVolume:0.5,textSpeed:40,autoMode:false,
        vnMode:'chat',maxTokens:2000,temperature:0.8,wordLimit:'',
        writingStyle:'',autoSend:true,sendMode:'manual',
        assistantApi:'assistant',activePreset:null,activeWorldBook:[],
        activeMemory:true,activePersona:null,
      },
      apis:{main:{url:'',key:'',model:'',name:'主对话API'},assistant:{url:'',key:'',model:'',name:'万能助手API'}},
      personas:[],presets:[],regexRules:[],
      worldBook:[],saves:[],currentGame:null,
      characters:[],portraits:[],backgrounds:[],scenes:[],musics:[],maps:[],
      memories:[],
      memoryCats:[
        {id:'plot',name:'剧情',color:'#C9A227'},{id:'char',name:'角色',color:'#8B4513'},
        {id:'item',name:'物品',color:'#4A7C59'},{id:'emo',name:'情感',color:'#B22222'},
        {id:'loc',name:'地点',color:'#2C1810'},{id:'lore',name:'设定',color:'#6B4C9A'},
        {id:'other',name:'其他',color:'#8B7355'}
      ],
      chatHistory:[],phoneChats:[],forumPosts:[],emails:[],
      customApps:[],relations:[],storylines:[],interactions:[],
      charNotes:{},charInv:{},charLogs:{},  // charLogs: {charId: [{id, content, type, timestamp}]}
      worldNotes:[],
      statusFields:[
        {key:'world',name:'世界',value:'未命名'},{key:'time',name:'时间',value:'未知'},
        {key:'location',name:'地点',value:'起点'},{key:'hp',name:'生命',value:'100'},
        {key:'mood',name:'心情',value:'平静'},{key:'favor',name:'好感',value:'0'},
      ],
      customThemes:[],uiCustom:{css:'',enabled:false},
      bgCats:[{id:'default',name:'默认',subs:[]},{id:'indoor',name:'室内',subs:[]},{id:'outdoor',name:'室外',subs:[]},{id:'special',name:'特殊',subs:[]}],
      portraitCats:[{id:'default',name:'默认',subs:[]}],
      lastSaved:Date.now(),
    };
  },
  init(){const s=localStorage.getItem(this.KEY);if(s){try{this.state={...this.def(),...JSON.parse(s)};}catch(e){console.error('Store load err',e);this.state=this.def();}}else{this.state=this.def();}return this.state;},
  save(){this.state.lastSaved=Date.now();try{localStorage.setItem(this.KEY,JSON.stringify(this.state));}catch(e){if(e.name==='QuotaExceededError')Utils.toast('存储空间不足，请清理图片');}},
  exportAll(){return JSON.stringify(this.state,null,2);},
  exportFiltered(keys){const o={};keys.forEach(k=>o[k]=this.state[k]);return JSON.stringify(o,null,2);},
  importAll(str){try{const d=JSON.parse(str);if(d.version&&d.version.startsWith('v')){this.state={...this.def(),...d};}else{this.state={...this.def(),...d,version:'v8'};}this.save();return true;}catch(e){console.error(e);return false;}},
  reset(){this.state=this.def();this.save();},
  // 角色
  addChar(c){c.id=c.id||Utils.uid();c.createdAt=Date.now();c.tags=c.tags||[];c.relations=c.relations||[];c.stats=c.stats||{};c.entries=c.entries||[];this.state.characters.push(c);this.save();return c;},
  upChar(id,up){const i=this.state.characters.findIndex(x=>x.id===id);if(i>=0){this.state.characters[i]={...this.state.characters[i],...up};this.save();}},
  delChar(id){this.state.characters=this.state.characters.filter(x=>x.id!==id);delete this.state.charNotes[id];delete this.state.charInv[id];delete this.state.charLogs[id];this.save();},
  getChar(id){return this.state.characters.find(x=>x.id===id);},
  // 素材
  addPortrait(p){p.id=p.id||Utils.uid();p.catId=p.catId||'default';this.state.portraits.push(p);this.save();return p;},
  addBg(b){b.id=b.id||Utils.uid();b.catId=b.catId||'default';this.state.backgrounds.push(b);this.save();return b;},
  addScene(s){s.id=s.id||Utils.uid();this.state.scenes.push(s);this.save();return s;},
  addMusic(m){m.id=m.id||Utils.uid();this.state.musics.push(m);this.save();return m;},
  addMap(m){m.id=m.id||Utils.uid();this.state.maps.push(m);this.save();return m;},
  // 配置
  addPreset(p){p.id=p.id||Utils.uid();this.state.presets.push(p);this.save();return p;},
  addWb(e){e.id=e.id||Utils.uid();this.state.worldBook.push(e);this.save();return e;},
  addMem(m){m.id=m.id||Utils.uid();m.timestamp=Date.now();this.state.memories.push(m);if(this.state.memories.length>800)this.state.memories=this.state.memories.slice(-800);this.save();return m;},
  addRel(r){r.id=r.id||Utils.uid();this.state.relations.push(r);this.save();return r;},
  addApp(a){a.id=a.id||Utils.uid();this.state.customApps.push(a);this.save();return a;},
  addStoryline(s){s.id=s.id||Utils.uid();s.createdAt=Date.now();this.state.storylines.push(s);this.save();return s;},
  addInteraction(i){i.id=i.id||Utils.uid();this.state.interactions.push(i);this.save();return i;},
  // 存档
  createSave(name){
    const save={id:Utils.uid(),name:name||`存档 ${this.state.saves.length+1}`,timestamp:Date.now(),
      game:Utils.deepClone(this.state.currentGame||{}),history:Utils.deepClone(this.state.chatHistory),
      mem:Utils.deepClone(this.state.memories),chars:Utils.deepClone(this.state.characters),
      notes:Utils.deepClone(this.state.charNotes),inv:Utils.deepClone(this.state.charInv),
      logs:Utils.deepClone(this.state.charLogs),relations:Utils.deepClone(this.state.relations),
      storylines:Utils.deepClone(this.state.storylines),worldNotes:Utils.deepClone(this.state.worldNotes)};
    this.state.saves.push(save);this.save();return save;
  },
  loadSave(id){const s=this.state.saves.find(x=>x.id===id);if(s){this.state.currentGame=Utils.deepClone(s.game);this.state.chatHistory=Utils.deepClone(s.history);this.state.memories=Utils.deepClone(s.mem);this.state.characters=Utils.deepClone(s.chars);this.state.charNotes=Utils.deepClone(s.notes||{});this.state.charInv=Utils.deepClone(s.inv||{});this.state.charLogs=Utils.deepClone(s.logs||{});this.state.relations=Utils.deepClone(s.relations||[]);this.state.storylines=Utils.deepClone(s.storylines||[]);this.state.worldNotes=Utils.deepClone(s.worldNotes||[]);this.save();return true;}return false;},
  // 别名兼容
  addCharacter(c){return this.addChar(c);},
  updateCharacter(id,up){return this.upChar(id,up);},
  deleteCharacter(id){return this.delChar(id);},
  deleteRelation(id){this.state.relations=this.state.relations.filter(x=>x.id!==id);this.save();},
  deleteStoryline(id){this.state.storylines=this.state.storylines.filter(x=>x.id!==id);this.save();},
  deleteWorldBookEntry(id){this.state.worldBook=this.state.worldBook.filter(x=>x.id!==id);this.save();},
  deleteRegexRule(id){this.state.regexRules=this.state.regexRules.filter(x=>x.id!==id);this.save();},
  deletePreset(id){this.state.presets=this.state.presets.filter(x=>x.id!==id);this.save();},
  deleteMemory(id){this.state.memories=this.state.memories.filter(x=>x.id!==id);this.save();},
  deletePortrait(id){this.state.portraits=this.state.portraits.filter(x=>x.id!==id);this.save();},
  deleteBackground(id){this.state.backgrounds=this.state.backgrounds.filter(x=>x.id!==id);this.save();},
  deleteMap(id){this.state.maps=this.state.maps.filter(x=>x.id!==id);this.save();},
  deleteMusic(id){this.state.musics=this.state.musics.filter(x=>x.id!==id);this.save();},
  deleteScene(id){this.state.scenes=this.state.scenes.filter(x=>x.id!==id);this.save();},
  deleteCustomApp(id){this.state.customApps=this.state.customApps.filter(x=>x.id!==id);this.save();},
  addCustomApp(a){return this.addApp(a);},
  addRegexRule(r){r.id=r.id||Utils.uid();this.state.regexRules.push(r);this.save();return r;},
  addWorldBookEntry(e){return this.addWb(e);},
};
