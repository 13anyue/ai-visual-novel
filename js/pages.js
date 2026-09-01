/* ============================================================
   pages.js - 页面渲染逻辑（匹配参考图古风布局）
   ============================================================ */
const Pages={

/* ====== 启动页 (参考图4：竹林毛玻璃风格) ====== */
splash(){
  const bg=Store.state.backgrounds[0];
  Router.full(`
    <div class="splash" id="splash-bg" style="${bg?'background-image:url('+bg.url+')':'background:linear-gradient(135deg,#1a3a1a,#2d5a2d,#4a7a4a)'}">
      <div class="splash-content">
        <div class="splash-title">三国</div>
        <div class="splash-subtitle">Story World</div>
        <div class="splash-cards">
          <a class="splash-card" href="#/vn">
            <div class="splash-card-icon">${Utils.icon('play')}</div>
            <div>
              <div class="splash-card-title">开始冒险</div>
              <div class="splash-card-desc">继续最近的故事</div>
            </div>
            <span style="margin-left:auto;font-size:1.2rem;color:rgba(245,230,211,0.5)">&rarr;</span>
          </a>
          <a class="splash-card" onclick="Pages.loadGameList()">
            <div class="splash-card-icon">${Utils.icon('globe')}</div>
            <div>
              <div class="splash-card-title">选择世界</div>
              <div class="splash-card-desc">切换或管理存档</div>
            </div>
            <span style="margin-left:auto;font-size:1.2rem;color:rgba(245,230,211,0.5)">&rarr;</span>
          </a>
          <a class="splash-card" href="#/chars">
            <div class="splash-card-icon">${Utils.icon('users')}</div>
            <div>
              <div class="splash-card-title">我的角色</div>
              <div class="splash-card-desc">管理玩家化身与收录角色卡</div>
            </div>
            <span style="margin-left:auto;font-size:1.2rem;color:rgba(245,230,211,0.5)">&rarr;</span>
          </a>
          <a class="splash-card" href="#/settings">
            <div class="splash-card-icon">${Utils.icon('settings')}</div>
            <div>
              <div class="splash-card-title">设置</div>
              <div class="splash-card-desc">API & 主题</div>
            </div>
            <span style="margin-left:auto;font-size:1.2rem;color:rgba(245,230,211,0.5)">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  `);
},

/* ====== 主页/主操作面板 (参考图5：左侧菜单+中间内容+右侧面板+底部回府) ====== */
home(){
  const game=Store.state.currentGame;
  if(!game){this.splash();return;}
  const bg=Store.state.backgrounds[0];
  const chars=Store.state.characters;
  const mainChar=chars.find(c=>c.role==='main');
  const fields=Store.state.statusFields;
  const leftMenu=[
    {k:'activity',i:'star',l:'活动'},{k:'gift',i:'gift',l:'福利'},{k:'vip',i:'crown',l:'首充'},
    {k:'follower',i:'users',l:'随从'},{k:'wardrobe',i:'image',l:'衣橱'},{k:'shop',i:'shopping',l:'商城'},
    {k:'task',i:'task',l:'任务'},{k:'achievement',i:'trophy',l:'成就'},{k:'gallery',i:'grid',l:'图鉴'},
    {k:'mail',i:'mail',l:'信件'},{k:'backpack',i:'backpack',l:'背包'},
  ];
  const infoBarHtml=`
    <div class="info-bar">
      <img class="info-avatar" src="${mainChar?.avatar||mainChar?.portrait||''}" onerror="this.style.background='var(--bg-deep)'" alt="">
      <div class="info-content">
        <div class="info-name">${Utils.escape(mainChar?.name||'未命名')}</div>
        <div class="info-stats">
          ${fields.map(f=>`<span class="info-stat">${Utils.escape(f.name)}: ${Utils.escape(f.value)}</span>`).join('')}
        </div>
      </div>
      <div class="info-actions">
        <button class="btn btn-icon btn-ghost" onclick="Pages.quickSave()">${Utils.icon('save')}</button>
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/settings')">${Utils.icon('settings')}</button>
      </div>
    </div>
  `;
  const leftHtml=leftMenu.map(m=>`
    <a class="panel-left-btn" href="#/${m.k==='activity'?'interactions':m.k==='mail'?'phone/mail':m.k==='backpack'?'chars':'assets'}">
      ${Utils.icon(m.i)}<span>${m.l}</span>
    </a>
  `).join('');
  const rightHtml=`
    <a class="panel-right-card" href="#/vn">
      <div style="width:100%;height:60px;background:linear-gradient(135deg,var(--gold),var(--gold-deep));border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem">剧情</div>
      <div class="panel-right-card-title">主线剧情</div>
    </a>
    <a class="panel-right-card" href="#/interactions">
      <div style="width:100%;height:60px;background:linear-gradient(135deg,var(--success),#3a6a49);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem">日常</div>
      <div class="panel-right-card-title">日常任务</div>
    </a>
  `;
  const charCards=chars.filter(c=>c.role==='main').map(c=>`
    <div class="char-flip-card" onclick="Pages.vnSelectCharById('${c.id}')">
      <img class="char-flip-card-img" src="${c.portrait||c.avatar||''}" onerror="this.style.display='none';this.parentElement.style.background='var(--bg-deep)'" alt="${Utils.escape(c.name)}">
      <div class="char-flip-card-info">
        <div class="char-flip-card-name">${Utils.escape(c.name)}</div>
        <div class="char-flip-card-role">${Utils.escape(c.occupation||'')}</div>
      </div>
    </div>
  `).join('');
  Router.full(`
    <div class="main-panel" style="${bg?'background-image:url('+bg.url+')':''}">
      ${infoBarHtml}
      <div class="panel-left">${leftHtml}</div>
      <div class="panel-main">
        <div style="text-align:center;margin-bottom:10px">
          <span class="tag tag-gold">${Utils.escape(game.worldview?.title||'自由世界')}</span>
        </div>
        <div class="cards-scroll" id="home-char-scroll">
          ${charCards||'<div class="empty-state" style="padding:20px"><p class="text-xs">暂无角色</p></div>'}
        </div>
        <div class="ink-divider"><span>快捷功能</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="btn btn-sm btn-primary" onclick="Router.go('/vn')">${Utils.icon('play')} 视觉小说</button>
          <button class="btn btn-sm" onclick="Router.go('/map')">${Utils.icon('map')} 地图</button>
          <button class="btn btn-sm" onclick="Router.go('/chat')">${Utils.icon('users')} 闲聊</button>
          <button class="btn btn-sm" onclick="Router.go('/memory')">${Utils.icon('brain')} 记忆</button>
        </div>
        <div class="ink-divider"><span>系统</span></div>
        <div class="list-item" onclick="Router.go('/worldbook')">
          <div class="list-item-icon">${Utils.icon('book')}</div>
          <div class="list-item-content"><div class="list-item-title">世界书</div></div>
        </div>
        <div class="list-item" onclick="Router.go('/presets')">
          <div class="list-item-icon">${Utils.icon('edit')}</div>
          <div class="list-item-content"><div class="list-item-title">预设提示词</div></div>
        </div>
        <div class="list-item" onclick="Router.go('/regex')">
          <div class="list-item-icon">${Utils.icon('refresh')}</div>
          <div class="list-item-content"><div class="list-item-title">正则规则</div></div>
        </div>
        <div class="list-item" onclick="Router.go('/assistant')">
          <div class="list-item-icon">${Utils.icon('bot')}</div>
          <div class="list-item-content"><div class="list-item-title">AI 助手</div></div>
        </div>
      </div>
      <div class="panel-right">${rightHtml}</div>
      <button class="home-btn" onclick="Pages.splash()">${Utils.icon('back')} 回府</button>
      <nav class="bottom-nav" style="position:fixed;bottom:0;left:0;right:0">
        <a class="nav-item active" href="#/">${Utils.icon('home')}<span>主页</span></a>
        <a class="nav-item" href="#/chars">${Utils.icon('users')}<span>角色</span></a>
        <a class="nav-item" href="#/assets">${Utils.icon('image')}<span>素材</span></a>
        <a class="nav-item" href="#/phone">${Utils.icon('phone')}<span>手机</span></a>
        <a class="nav-item" href="#/settings">${Utils.icon('settings')}<span>设置</span></a>
      </nav>
    </div>
  `);
},

renderStatusBar(ch){
  if(!ch)return'';
  return`<div class="status-bar">
    <img class="status-avatar" src="${ch.avatar||ch.portrait||''}" onerror="this.style.background='var(--bg-deep)'" alt="">
    <div class="status-info">
      <div class="status-name">${Utils.escape(ch.name)}</div>
      <div class="status-meta">${Utils.escape(ch.occupation||'')}</div>
    </div>
    <div class="status-stats">
      <span class="stat-chip">${Utils.icon('heart')} ${ch.hp||100}</span>
      <span class="stat-chip">${Utils.icon('star')} ${ch.mood||80}</span>
    </div>
  </div>`;
},

quickSave(){if(!Store.state.currentGame){Utils.toast('请先创建游戏');return;}Store.createSave(`存档 ${new Date().toLocaleString('zh-CN')}`);Utils.toast('存档成功');},

/* ====== 视觉小说模式 (支持翻牌/对话两种模式切换) ====== */
vn(){
  const mode=Store.state.settings.vnMode||'cards';
  if(mode==='cards')this.vnCards();else this.vnChat();
},

/* 翻牌卡片模式 (参考图1) */
vnCards(){
  const chars=Store.state.characters;
  const bg=Store.state.backgrounds[0];
  Router.full(`
    <div class="vn-cards-stage" style="${bg?'background-image:url('+bg.url+')':'background:linear-gradient(135deg,#2C1810,#5C4033)'}">
      <div class="vn-cards-content">
        <div class="topbar" style="position:relative;background:transparent;border:none;padding:8px 12px">
          <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
          <span class="topbar-title">翻牌子</span>
          <div class="topbar-actions">
            <button class="btn btn-sm btn-ghost" onclick="Pages.toggleVnMode()">${Utils.icon('users')} 切换对话</button>
          </div>
        </div>
        <div style="text-align:center;margin:8px 0">
          <span class="tag tag-gold" style="font-size:0.75rem">选择一位角色开始剧情</span>
        </div>
        <div class="cards-scroll" style="padding:0 12px">
          ${chars.map(c=>`
            <div class="char-flip-card" onclick="Pages.vnSelectCharById('${c.id}');Router.go('/chat');">
              <span class="char-flip-card-tag">${c.role==='main'?'主':'NPC'}</span>
              <img class="char-flip-card-img" src="${c.portrait||c.avatar||''}" onerror="this.style.display='none';this.parentElement.style.background='var(--bg-deep)'" alt="">
              <div class="char-flip-card-info">
                <div class="char-flip-card-name">${Utils.escape(c.name)}</div>
                <div class="char-flip-card-role">${Utils.escape(c.occupation||c.personality?.slice(0,12)||'')}</div>
              </div>
            </div>
          `).join('')||'<div style="text-align:center;padding:40px;color:rgba(245,230,211,0.5)"><p>暂无角色</p></div>'}
        </div>
        <div style="text-align:center;margin-top:12px">
          <button class="btn btn-gold" onclick="Pages.randomChar()">${Utils.icon('refresh')} 随机翻牌</button>
        </div>
      </div>
    </div>
  `);
},

/* 对话模式 (参考图3：左侧立绘+右侧面板) */
vnChat(){
  const bg=Store.state.backgrounds[0];
  const char=this._vnCurrentChar||Store.state.characters[0];
  Router.full(`
    <div class="chat-stage" style="${bg?'background-image:url('+bg.url+')':'background:linear-gradient(135deg,#2C1810,#5C4033)'}">
      <div class="chat-content">
        <div class="chat-left">
          <img class="chat-portrait" src="${char?.portrait||char?.avatar||''}" onerror="this.style.display='none'" alt="${Utils.escape(char?.name||'')}">
        </div>
        <div class="chat-right">
          <div class="chat-panel">
            <div class="chat-header">
              <span class="chat-header-title">${Utils.escape(char?.name||'对话')}</span>
              <div class="flex gap-1">
                <button class="btn btn-sm btn-ghost" onclick="Pages.toggleVnMode()" style="color:var(--gold);font-size:0.65rem">${Utils.icon('image')} 翻牌</button>
                <button class="btn btn-icon btn-ghost" onclick="Router.go('/')" style="width:26px;height:26px">${Utils.icon('close')}</button>
              </div>
            </div>
            <div class="chat-messages" id="chat-messages">
              ${Store.state.chatHistory.length>0?Store.state.chatHistory.map(m=>`
                <div class="chat-msg ${m.role==='user'?'user':'ai'}">${Utils.escape(m.content)}</div>
              `).join(''):'<div style="text-align:center;padding:20px;color:rgba(245,230,211,0.4)"><p>点击输入框开始聊天</p></div>'}
            </div>
            <div class="chat-input-area">
              <input class="chat-input" id="vn-chat-input" placeholder="点击此处开始闲聊..." onkeydown="if(event.key==='Enter')Pages.vnChatSend()">
              <button class="btn btn-primary btn-icon" onclick="Pages.vnChatSend()">${Utils.icon('send')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  const el=document.getElementById('chat-messages');if(el)el.scrollTop=el.scrollHeight;
},

async toggleVnMode(){
  Store.state.settings.vnMode=Store.state.settings.vnMode==='cards'?'chat':'cards';
  Store.save();
  this.vn();
},

randomChar(){
  const chars=Store.state.characters;if(!chars.length){Utils.toast('暂无角色');return;}
  const c=chars[Math.floor(Math.random()*chars.length)];this.vnSelectCharById(c.id);Utils.toast('已选择: '+c.name);
  setTimeout(()=>Router.go('/chat'),300);
},

vnSelectCharById(id){
  const c=Store.state.characters.find(x=>x.id===id);if(c)this._vnCurrentChar=c;
},

async vnChatSend(){
  const inp=document.getElementById('vn-chat-input');const text=inp.value.trim();if(!text)return;inp.value='';
  Store.state.chatHistory.push({role:'user',content:text});Store.save();
  const el=document.getElementById('chat-messages');
  el.insertAdjacentHTML('beforeend',`<div class="chat-msg user">${Utils.escape(text)}</div>`);
  const lid='l-'+Date.now();el.insertAdjacentHTML('beforeend',`<div class="chat-msg ai" id="${lid}"><span class="spinner"></span></div>`);el.scrollTop=el.scrollHeight;
  try{
    const msgs=Store.state.chatHistory.map(m=>({role:m.role==='user'?'user':'assistant',content:m.content}));
    const g=Store.state.currentGame;let sys='你是一个视觉小说AI。用古风口吻回复。';
    if(g?.worldview)sys+=`世界观：${g.worldview.setting||''}`;
    if(this._vnCurrentChar)sys+=`当前角色：${this._vnCurrentChar.name}，${this._vnCurrentChar.personality||''}`;
    msgs.unshift({role:'system',content:sys});
    const reply=await AI.chat(msgs,{recallQuery:text,personaId:g?.personaId});
    Store.state.chatHistory.push({role:'assistant',content:reply,speaker:this._vnCurrentChar?.name||'AI'});Store.save();
    document.getElementById(lid).innerHTML=Utils.escape(reply).replace(/\n/g,'<br>');el.scrollTop=el.scrollHeight;
  }catch(e){document.getElementById(lid).innerHTML=`<span style="color:var(--danger)">错误: ${Utils.escape(e.message)}</span>`;}
},

/* ====== 闲聊模式（支持Markdown/沉浸式切换） ====== */
chat(){
  const bg=Store.state.backgrounds[0];
  const char=this._vnCurrentChar||Store.state.characters[0];
  Router.full(`
    <div class="chat-stage" style="${bg?'background-image:url('+bg.url+')':'background:linear-gradient(135deg,#2C1810,#5C4033)'}">
      <div class="topbar" style="position:relative;background:transparent;border:none">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">闲聊</span>
        <div class="topbar-actions">
          <button class="btn btn-sm btn-ghost" onclick="Pages.toggleChatMode()" style="color:var(--gold);font-size:0.65rem">切换模式</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages.chatClear()">${Utils.icon('trash')}</button>
        </div>
      </div>
      <div class="chat-content" style="padding-top:0">
        <div class="chat-left">
          <img class="chat-portrait" src="${char?.portrait||char?.avatar||''}" onerror="this.style.display='none'" alt="">
        </div>
        <div class="chat-right">
          <div class="chat-panel">
            <div class="chat-header">
              <span class="chat-header-title">${Utils.escape(char?.name||'闲聊')}</span>
              <span class="text-xs text-muted">Markdown</span>
            </div>
            <div class="chat-messages" id="chat-messages">
              ${Store.state.chatHistory.length>0?Store.state.chatHistory.map(m=>Pages._chatBubble(m)).join(''):'<div style="text-align:center;padding:20px;color:rgba(245,230,211,0.4)"><p>开始对话吧</p></div>'}
            </div>
            <div class="chat-input-area">
              <input class="chat-input" id="chat-input" placeholder="输入消息..." onkeydown="if(event.key==='Enter')Pages.chatSend()">
              <button class="btn btn-primary btn-icon" onclick="Pages.chatSend()">${Utils.icon('send')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  const el=document.getElementById('chat-messages');if(el)el.scrollTop=el.scrollHeight;
},

_chatBubble(m){
  const isUser=m.role==='user';
  const char=Store.state.characters.find(c=>c.name===m.speaker);
  const avatar=isUser?'':(char?.avatar||char?.portrait||'');
  return`<div class="chat-msg ${isUser?'user':'ai'}">
    ${!isUser&&avatar?`<img src="${avatar}" style="width:28px;height:28px;border-radius:4px;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'">`:''}
    <div style="max-width:85%;font-size:0.8rem;line-height:1.5">${isUser?Utils.escape(m.content):Utils.markdown(m.content)}</div>
  </div>`;
},

async chatSend(){
  const inp=document.getElementById('chat-input');const text=inp.value.trim();if(!text)return;inp.value='';
  Store.state.chatHistory.push({role:'user',content:text});Store.save();
  const el=document.getElementById('chat-messages');
  el.insertAdjacentHTML('beforeend',this._chatBubble({role:'user',content:text}));
  const lid='l-'+Date.now();el.insertAdjacentHTML('beforeend',`<div class="chat-msg ai" id="${lid}"><span class="spinner"></span></div>`);el.scrollTop=el.scrollHeight;
  try{
    const msgs=Store.state.chatHistory.map(m=>({role:m.role==='user'?'user':'assistant',content:m.content}));
    const g=Store.state.currentGame;let sys='你是一个视觉小说AI。使用Markdown语法回复。';
    if(g?.worldview)sys+=`世界观：${g.worldview.setting}`;
    msgs.unshift({role:'system',content:sys});
    const reply=await AI.chat(msgs,{recallQuery:text,personaId:g?.personaId});
    Store.state.chatHistory.push({role:'assistant',content:reply,speaker:'AI'});Store.save();
    document.getElementById(lid).innerHTML=Utils.markdown(reply);el.scrollTop=el.scrollHeight;
  }catch(e){document.getElementById(lid).innerHTML=`<span style="color:var(--danger)">错误: ${Utils.escape(e.message)}</span>`;}
},

toggleChatMode(){this.vnChat();},

async chatClear(){
  const ok=await Utils.confirm('清空对话','确定清空所有对话记录吗？','清空','取消');
  if(ok){Store.state.chatHistory=[];Store.save();this.chat();}
},

/* ====== 地图 (参考图2：古风地图+地点气泡+右侧按钮) ====== */
map(){
  const mapData=Store.state.maps[0];
  if(!mapData){
    Router.nav(`
      <div class="topbar"><span class="topbar-title">地图</span></div>
      <div class="page">
        <div class="empty-state">${Utils.icon('map')}<p>暂无地图</p>
        <button class="btn btn-primary mt-1" onclick="Pages.createMap()">${Utils.icon('plus')} 创建地图</button></div>
      </div>
    `,'home');return;
  }
  Router.full(`
    <div class="map-stage" style="${mapData.bgUrl?'background-image:url('+mapData.bgUrl+')':'background:linear-gradient(135deg,#3a5a3a,#5a8a5a)'}">
      <div class="map-content">
        <div class="map-area">
          ${(mapData.pins||[]).map((p,i)=>`
            <div class="map-bubble" style="left:${p.x||15+(i%3)*30}%;top:${p.y||20+Math.floor(i/3)*25}%" onclick="Pages.visitPin('${p.id}')">
              <div class="map-bubble-inner">
                <div class="map-bubble-name">${Utils.escape(p.name)}</div>
                <div class="map-bubble-desc">${Utils.escape(p.desc?.slice(0,12)||'')}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="map-sidebar">
          <button class="map-sidebar-btn" onclick="Pages.mapRandomExplore()">${Utils.icon('search')} 随意逛逛</button>
          <button class="map-sidebar-btn" onclick="Pages.mapFilter('girl')">${Utils.icon('users')} 乡村女子</button>
          <button class="map-sidebar-btn" onclick="Pages.mapFilter('scholar')">${Utils.icon('book')} 乡村才子</button>
          <button class="map-sidebar-btn" onclick="Pages.mapFilter('reset')">${Utils.icon('refresh')} 重置农户</button>
          <button class="map-sidebar-btn" onclick="Router.go('/')">${Utils.icon('back')} 返回郊外</button>
        </div>
      </div>
      <div class="topbar" style="position:absolute;top:0;left:0;right:0;background:rgba(0,0,0,0.5)">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">${Utils.escape(mapData.name||'地图')}</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages.createMapPin()">${Utils.icon('plus')}</button>
        </div>
      </div>
    </div>
  `);
},

async createMap(){
  const form=await Utils.formModal('创建地图',[
    {key:'name',label:'地图名称',placeholder:'如：乡野地图'},
    {key:'bgUrl',label:'背景图URL',placeholder:'https://...'},
  ]);
  if(!form||!form.name)return;
  const m={name:form.name,bgUrl:form.bgUrl||'',pins:[
    {id:Utils.uid(),name:'林狗妮家',desc:'温柔体贴',x:20,y:30},
    {id:Utils.uid(),name:'刘春菊家',desc:'沉默寡言',x:50,y:40},
    {id:Utils.uid(),name:'王二狗家',desc:'朴实憨厚',x:75,y:35},
    {id:Utils.uid(),name:'张二狗家',desc:'天真烂漫',x:15,y:70},
    {id:Utils.uid(),name:'林大草家',desc:'温柔体贴',x:60,y:75},
  ]};
  Store.addMap(m);Utils.toast('地图创建成功');this.map();
},

async createMapPin(){
  const map=Store.state.maps[0];if(!map)return;
  const form=await Utils.formModal('添加地点',[
    {key:'name',label:'地点名',placeholder:'如：茶馆'},
    {key:'desc',label:'描述',type:'textarea',placeholder:''},
    {key:'x',label:'X(%)',placeholder:'0-100'},{key:'y',label:'Y(%)',placeholder:'0-100'},
  ]);
  if(!form||!form.name)return;
  map.pins.push({id:Utils.uid(),name:form.name,desc:form.desc,x:parseFloat(form.x)||50,y:parseFloat(form.y)||50});
  Store.save();this.map();
},

visitPin(id){
  const map=Store.state.maps[0];const pin=map?.pins?.find(p=>p.id===id);if(!pin)return;
  const o=document.createElement('div');o.className='drawer-overlay';
  o.innerHTML=`<div class="drawer"><div class="drawer-handle"></div><div style="padding:14px">
    <h3 style="color:var(--gold);margin-bottom:6px">${Utils.escape(pin.name)}</h3>
    <p class="text-sm text-muted mb-2">${Utils.escape(pin.desc||'')}</p>
    <div class="flex gap-1"><button class="btn btn-sm btn-primary" onclick="Pages.goToLocation('${pin.id}')">${Utils.icon('location')} 前往</button>
    <button class="btn btn-sm" onclick="Pages.interactAtLocation('${pin.id}')">${Utils.icon('star')} 探索</button>
    <button class="btn btn-sm" onclick="this.closest('.drawer-overlay').remove()">关闭</button></div>
  </div></div>`;
  document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o)o.remove();});
},

goToLocation(id){
  const map=Store.state.maps[0];const pin=map?.pins?.find(p=>p.id===id);
  if(pin&&Store.state.currentGame){Store.state.currentGame.location=pin;Store.save();}
  document.querySelectorAll('.drawer-overlay').forEach(d=>d.remove());
  Utils.toast('已前往: '+pin?.name);Router.go('/chat');
},
interactAtLocation(id){
  const map=Store.state.maps[0];const pin=map?.pins?.find(p=>p.id===id);if(!pin)return;
  document.querySelectorAll('.drawer-overlay').forEach(d=>d.remove());Router.go('/chat');
  setTimeout(()=>{const inp=document.getElementById('chat-input');if(inp){inp.value=`我来到了${pin.name}。${pin.desc||''} 请描述这里的见闻。`;Pages.chatSend();}},500);
},
mapRandomExplore(){Utils.toast('正在随机探索...');},
mapFilter(type){Utils.toast('筛选: '+type);},

/* ====== 角色管理 ====== */
chars(){
  const chars=Store.state.characters;
  Router.nav(`
    <div class="topbar"><span class="topbar-title">角色</span>
      <div class="topbar-actions">
        <button class="btn btn-icon btn-ghost" onclick="Pages.addCharacter()">${Utils.icon('plus')}</button>
      </div>
    </div>
    <div class="page">
      <div class="segmented mb-1">
        <div class="segmented-item active" onclick="Pages._filterChars(this,'all')">全部</div>
        <div class="segmented-item" onclick="Pages._filterChars(this,'main')">主要</div>
        <div class="segmented-item" onclick="Pages._filterChars(this,'npc')">NPC</div>
      </div>
      <div class="char-grid" id="char-grid">${chars.map(c=>this._charCard(c)).join('')||'<div class="empty-state"><p>暂无角色</p></div>'}</div>
      <div class="ink-divider"><span>批量</span></div>
      <button class="btn btn-sm btn-block mb-1" onclick="Pages.batchUploadPortraits()">${Utils.icon('upload')} 批量上传立绘</button>
      <button class="btn btn-sm btn-block" onclick="Pages.aiGenChar()">${Utils.icon('bot')} AI生成角色</button>
    </div>
  `,'chars');
},

_charCard(c){return`
  <div class="char-card" onclick="Router.go('/char/${c.id}')">
    <div class="char-card-img" style="background-image:url(${c.portrait||c.avatar||''});background-size:cover;background-position:center;background-color:var(--bg-deep)"></div>
    <div class="char-card-info"><div class="char-card-name">${Utils.escape(c.name)}</div><div class="char-card-role">${Utils.escape(c.occupation||c.role||'')}</div></div>
  </div>`;},

_filterChars(el,role){
  el.parentElement.querySelectorAll('.segmented-item').forEach(i=>i.classList.remove('active'));el.classList.add('active');
  const chars=role==='all'?Store.state.characters:Store.state.characters.filter(c=>c.role===role);
  document.getElementById('char-grid').innerHTML=chars.map(c=>this._charCard(c)).join('')||'<div class="empty-state"><p>暂无角色</p></div>';
},

async addCharacter(){
  const form=await Utils.formModal('添加角色',[
    {key:'name',label:'角色名',placeholder:'角色名称'},
    {key:'age',label:'年龄',placeholder:'18'},{key:'gender',label:'性别',type:'select',options:[{value:'male',label:'男'},{value:'female',label:'女'}]},
    {key:'occupation',label:'职业',placeholder:'如：剑客'},{key:'role',label:'类型',type:'select',options:[{value:'main',label:'主要'},{value:'npc',label:'NPC'}]},
    {key:'personality',label:'性格',type:'textarea',placeholder:'描述角色性格...'},
  ]);
  if(!form||!form.name)return;
  Store.addChar(form);Utils.toast('角色添加成功');this.chars();
},

async aiGenChar(){
  const desc=await Utils.prompt('AI生成角色','输入描述或关键词...','');if(!desc)return;
  Utils.toast('AI生成中...');try{
    const sys='你是角色设计专家。根据描述生成JSON角色信息：{name,age,gender,occupation,personality,appearance,backstory}';
    const r=await AI.gen(desc,{system:sys,maxTokens:800});
    const m=r.match(/\{[\s\S]*\}/);if(m){const d=JSON.parse(m[0]);d.role='npc';Store.addChar(d);Utils.toast('角色生成成功');this.chars();}
    else Utils.toast('解析失败');
  }catch(e){Utils.toast('错误: '+e.message);}
},

async batchUploadPortraits(){
  const inp=document.createElement('input');inp.type='file';inp.multiple=true;inp.accept='image/*';
  inp.onchange=async()=>{const files=Array.from(inp.files);for(const f of files){const d=await Utils.compressImage(f);Store.addPortrait({name:f.name.replace(/\.[^.]+$/,''),url:d});}Utils.toast('导入了'+files.length+'张立绘');this.chars();};
  inp.click();
},

/* ====== 角色详情 ====== */
charDetail(id){
  const ch=Store.getChar(id);if(!ch){Router.go('/chars');return;}
  const notes=Store.state.charNotes[id]||[];const inv=Store.state.charInv[id]||[];
  Router.nav(`
    <div class="topbar"><button class="btn btn-icon btn-ghost" onclick="Router.go('/chars')">${Utils.icon('back')}</button>
      <span class="topbar-title">${Utils.escape(ch.name)}</span>
      <div class="topbar-actions"><button class="btn btn-icon btn-ghost" onclick="Pages.editChar('${id}')">${Utils.icon('edit')}</button></div>
    </div>
    <div class="page">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="aspect-ratio:3/4;background-image:url(${ch.portrait||ch.avatar||''});background-size:cover;background-position:center;background-color:var(--bg-deep);min-height:200px"></div>
        <div style="padding:10px;display:flex;gap:6px;justify-content:center">
          <button class="btn btn-sm" onclick="Pages.uploadCharImg('${id}','portrait')">${Utils.icon('upload')} 立绘</button>
          <button class="btn btn-sm" onclick="Pages.uploadCharImg('${id}','avatar')">${Utils.icon('image')} 头像</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">${Utils.icon('users')} 角色档案</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.75rem">
          <div><span class="text-muted">姓名:</span>${Utils.escape(ch.name)}</div>
          <div><span class="text-muted">年龄:</span>${Utils.escape(ch.age||'未知')}</div>
          <div><span class="text-muted">性别:</span>${Utils.escape(ch.gender==='male'?'男':ch.gender==='female'?'女':'未知')}</div>
          <div><span class="text-muted">职业:</span>${Utils.escape(ch.occupation||'未知')}</div>
        </div>
      </div>
      ${ch.personality?`<div class="card"><div class="card-title">${Utils.icon('book')} 性格</div><p class="text-sm">${Utils.escape(ch.personality)}</p></div>`:''}
      ${ch.backstory?`<div class="card"><div class="card-title">${Utils.icon('book')} 背景</div><p class="text-sm">${Utils.escape(ch.backstory)}</p></div>`:''}
      ${ch.secret?`<div class="card" style="border-color:var(--danger)"><div class="card-title" style="color:var(--danger)">${Utils.icon('eye')} 秘密</div><p class="text-sm">${Utils.escape(ch.secret)}</p></div>`:''}
      <div class="card"><div class="card-title">${Utils.icon('book')} 记事册</div>
        ${notes.length?notes.map(n=>`<div class="list-item" style="margin-bottom:3px"><div class="list-item-content"><div class="list-item-title text-sm">${Utils.escape(n.content)}</div><div class="list-item-desc">${Utils.timeFmt(n.timestamp)}</div></div><button class="btn btn-sm btn-ghost" onclick="Pages.delNote('${id}','${n.id}')">${Utils.icon('trash')}</button></div>`).join(''):'<p class="text-muted text-sm">暂无记事</p>'}
        <button class="btn btn-sm btn-block mt-1" onclick="Pages.addNote('${id}')">${Utils.icon('plus')} 添加记事</button>
      </div>
      <div class="card"><div class="card-title">${Utils.icon('backpack')} 背包</div>
        ${inv.length?inv.map(it=>`<div class="list-item" style="margin-bottom:3px"><div class="list-item-content"><div class="list-item-title text-sm">${Utils.escape(it.name)} ${it.count>1?'x'+it.count:''}</div></div><button class="btn btn-sm btn-ghost" onclick="Pages.delItem('${id}','${it.id}')">${Utils.icon('trash')}</button></div>`).join(''):'<p class="text-muted text-sm">背包为空</p>'}
        <button class="btn btn-sm btn-block mt-1" onclick="Pages.addItem('${id}')">${Utils.icon('plus')} 添加物品</button>
      </div>
    </div>
  `,'chars');
},

async uploadCharImg(id,type){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.onchange=async()=>{const f=inp.files[0];if(!f)return;const d=await Utils.compressImage(f);Store.upChar(id,{[type]:d});Utils.toast('上传成功');this.charDetail(id);};
  inp.click();
},
async editChar(id){
  const ch=Store.getChar(id);
  const form=await Utils.formModal('编辑角色',[
    {key:'name',label:'姓名',placeholder:ch.name},{key:'age',label:'年龄',placeholder:ch.age||''},
    {key:'gender',label:'性别',type:'select',options:[{value:'male',label:'男'},{value:'female',label:'女'}]},
    {key:'occupation',label:'职业',placeholder:ch.occupation||''},
    {key:'personality',label:'性格',type:'textarea',placeholder:ch.personality||''},
    {key:'backstory',label:'背景',type:'textarea',placeholder:ch.backstory||''},
    {key:'secret',label:'秘密',type:'textarea',placeholder:ch.secret||''},
  ],ch);
  if(!form)return;Store.upChar(id,form);Utils.toast('已保存');this.charDetail(id);
},
async addNote(id){
  const form=await Utils.formModal('添加记事',[{key:'content',label:'内容',type:'textarea',placeholder:'记事内容...'}]);
  if(!form||!form.content)return;
  Store.state.charNotes[id]=Store.state.charNotes[id]||[];Store.state.charNotes[id].push({id:Utils.uid(),content:form.content,timestamp:Date.now()});Store.save();Utils.toast('已添加');this.charDetail(id);
},
delNote(cid,nid){Store.state.charNotes[cid]=(Store.state.charNotes[cid]||[]).filter(n=>n.id!==nid);Store.save();this.charDetail(cid);},
async addItem(id){
  const form=await Utils.formModal('添加物品',[{key:'name',label:'物品名',placeholder:'如：钥匙'},{key:'count',label:'数量',placeholder:'1'},{key:'desc',label:'描述',type:'textarea',placeholder:''}]);
  if(!form||!form.name)return;
  Store.state.charInv[id]=Store.state.charInv[id]||[];Store.state.charInv[id].push({id:Utils.uid(),name:form.name,count:parseInt(form.count)||1,desc:form.desc});Store.save();Utils.toast('已添加');this.charDetail(id);
},
delItem(cid,iid){Store.state.charInv[cid]=(Store.state.charInv[cid]||[]).filter(i=>i.id!==iid);Store.save();this.charDetail(cid);},

/* ====== 素材库 ====== */
assets(){
  const tab=Store.state._assetTab||'portraits';
  Router.nav(`
    <div class="topbar"><span class="topbar-title">素材库</span></div>
    <div class="page">
      <div class="segmented mb-1">
        <div class="segmented-item ${tab==='portraits'?'active':''}" onclick="Pages._assetTab('portraits')">立绘</div>
        <div class="segmented-item ${tab==='backgrounds'?'active':''}" onclick="Pages._assetTab('backgrounds')">背景</div>
        <div class="segmented-item ${tab==='musics'?'active':''}" onclick="Pages._assetTab('musics')">音乐</div>
      </div>
      <div id="asset-content"></div>
    </div>
  `,'assets');
  this._renderAssets(tab);
},
_assetTab(tab){Store.state._assetTab=tab;this.assets();},
_renderAssets(tab){
  const items=Store.state[tab]||[];
  const el=document.getElementById('asset-content');if(!el)return;
  el.innerHTML=`<div class="flex gap-1 mb-1">
    <button class="btn btn-sm btn-primary" onclick="Pages.uploadAsset('${tab}')">${Utils.icon('upload')} 上传</button>
    <button class="btn btn-sm" onclick="Pages.batchUpload('${tab}')">${Utils.icon('plus')} 批量</button>
  </div>`+(items.length?items.map(it=>`
    <div class="list-item">
      ${tab!=='musics'?`<div style="width:40px;height:40px;border-radius:4px;background-image:url(${it.url||''});background-size:cover;background-position:center;background-color:var(--bg-deep);flex-shrink:0"></div>`:`<div class="list-item-icon">${Utils.icon('music')}</div>`}
      <div class="list-item-content"><div class="list-item-title">${Utils.escape(it.name||'未命名')}</div></div>
      <button class="btn btn-sm btn-danger" onclick="Pages.delAsset('${tab}','${it.id}')">${Utils.icon('trash')}</button>
    </div>
  `).join(''):'<div class="empty-state"><p>暂无素材</p></div>');
},
uploadAsset(tab){
  const inp=document.createElement('input');inp.type='file';inp.accept=tab==='musics'?'audio/*':'image/*';
  inp.onchange=async()=>{const f=inp.files[0];if(!f)return;Utils.toast('上传中...');
    if(tab==='musics'){const r=new FileReader();r.onload=()=>{Store.addMusic({name:f.name.replace(/\.[^.]+$/,''),url:r.result});Utils.toast('上传成功');this.assets();};r.readAsDataURL(f);}
    else{const d=await Utils.compressImage(f);Store[tab==='portraits'?'addPortrait':tab==='backgrounds'?'addBg':'addScene']({name:f.name.replace(/\.[^.]+$/,''),url:d});Utils.toast('上传成功');this.assets();}
  };inp.click();
},
batchUpload(tab){
  const inp=document.createElement('input');inp.type='file';inp.multiple=true;inp.accept=tab==='musics'?'audio/*':'image/*';
  inp.onchange=async()=>{const files=Array.from(inp.files);Utils.toast('正在上传'+files.length+'个文件...');
    for(const f of files){if(tab==='musics'){const r=new FileReader();await new Promise(res=>{r.onload=()=>{Store.addMusic({name:f.name.replace(/\.[^.]+$/,''),url:r.result});res();};r.readAsDataURL(f);});}
    else{const d=await Utils.compressImage(f);Store[tab==='portraits'?'addPortrait':tab==='backgrounds'?'addBg':'addScene']({name:f.name.replace(/\.[^.]+$/,''),url:d});}}
    Utils.toast('批量上传完成');this.assets();
  };inp.click();
},
delAsset(tab,id){Store.state[tab]=Store.state[tab].filter(i=>i.id!==id);Store.save();this.assets();},

/* ====== 设置 ====== */
settings(){
  const s=Store.state.settings;const a=Store.state.apis;
  Router.nav(`
    <div class="topbar"><span class="topbar-title">设置</span></div>
    <div class="page">
      <div class="collapse open">
        <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('settings')} 主题 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
        <div class="collapse-body"><div class="collapse-body-inner">
          <div class="field"><label class="label">主题</label>
            <div class="segmented"><div class="segmented-item ${s.theme==='light'?'active':''}" onclick="Pages.setTheme('light')">古风墨境</div>
            <div class="segmented-item ${s.theme==='dark'?'active':''}" onclick="Pages.setTheme('dark')">暗夜墨色</div>
            <div class="segmented-item ${s.theme==='neon'?'active':''}" onclick="Pages.setTheme('neon')">赛博霓虹</div></div>
          </div>
          <div class="field"><label class="label">打字速度: ${s.textSpeed}ms</label><input type="range" class="w-full" min="10" max="200" value="${s.textSpeed}" oninput="Store.state.settings.textSpeed=parseInt(this.value);Store.save();this.previousElementSibling.textContent='打字速度: '+this.value+'ms'"></div>
          <div class="field"><label class="label">音量: ${Math.round(s.bgVolume*100)}%</label><input type="range" class="w-full" min="0" max="100" value="${s.bgVolume*100}" oninput="AI.setVolume(parseInt(this.value)/100);this.previousElementSibling.textContent='音量: '+this.value+'%'"></div>
        </div></div>
      </div>
      <div class="collapse open">
        <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('bot')} API配置 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
        <div class="collapse-body"><div class="collapse-body-inner">
          <div class="card-title text-sm">主API</div>
          <div class="field"><label class="label">API地址</label><input class="input" value="${a.main.url||''}" placeholder="https://api.openai.com/v1" onchange="Store.state.apis.main.url=this.value;Store.save()"></div>
          <div class="field"><label class="label">密钥</label><input class="input" type="password" value="${a.main.key||''}" placeholder="sk-..." onchange="Store.state.apis.main.key=this.value;Store.save()"></div>
          <div class="field"><label class="label">模型</label><input class="input" value="${a.main.model||''}" placeholder="gpt-3.5-turbo" onchange="Store.state.apis.main.model=this.value;Store.save()"></div>
          <button class="btn btn-sm btn-block" onclick="Pages.testApi('main')">测试连接</button>
          <div class="ink-divider"><span>助手API</span></div>
          <div class="field"><label class="label">API地址</label><input class="input" value="${a.assistant.url||''}" placeholder="同主API或独立" onchange="Store.state.apis.assistant.url=this.value;Store.save()"></div>
          <div class="field"><label class="label">密钥</label><input class="input" type="password" value="${a.assistant.key||''}" onchange="Store.state.apis.assistant.key=this.value;Store.save()"></div>
          <div class="field"><label class="label">模型</label><input class="input" value="${a.assistant.model||''}" placeholder="可选" onchange="Store.state.apis.assistant.model=this.value;Store.save()"></div>
          <button class="btn btn-sm btn-block" onclick="Pages.testApi('assistant')">测试连接</button>
        </div></div>
      </div>
      <div class="collapse">
        <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('save')} 数据管理 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
        <div class="collapse-body"><div class="collapse-body-inner">
          <button class="btn btn-sm btn-block mb-1" onclick="Pages.exportData()">${Utils.icon('download')} 导出数据</button>
          <button class="btn btn-sm btn-block mb-1" onclick="Pages.importData()">${Utils.icon('upload')} 导入数据</button>
          <button class="btn btn-sm btn-block btn-danger" onclick="Pages.resetData()">${Utils.icon('trash')} 清空全部</button>
        </div></div>
      </div>
      <div class="list-item card-tap" onclick="Router.go('/tutorial')">
        <div class="list-item-icon">${Utils.icon('book')}</div>
        <div class="list-item-content"><div class="list-item-title">使用教程</div><div class="list-item-desc">小白快速上手指南</div></div>
      </div>
      <div class="list-item card-tap" onclick="Router.go('/assistant')">
        <div class="list-item-icon">${Utils.icon('bot')}</div>
        <div class="list-item-content"><div class="list-item-title">AI 助手</div><div class="list-item-desc">万能助手帮你完成一切</div></div>
      </div>
    </div>
  `,'settings');
},

setTheme(t){Store.state.settings.theme=t;Store.save();document.documentElement.setAttribute('data-theme',t);this.settings();},
async testApi(t){Utils.toast('测试中...');const r=await AI.test(t);if(r.ok)Utils.toast('连接成功: '+r.reply.slice(0,20));else Utils.toast('失败: '+r.error);},
exportData(){Utils.download('avn-backup.json',Store.exportAll(),'application/json');Utils.toast('已导出');},
importData(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{if(Store.importAll(r.result)){Utils.toast('导入成功');Router.go('/');}else Utils.toast('导入失败');};r.readAsText(f);};
  inp.click();
},
async resetData(){const ok=await Utils.confirm('清空数据','确定清空所有数据吗？此操作不可撤销！','确定清空','取消');if(ok){Store.reset();Utils.toast('已清空');Router.go('/');}},

/* ====== 存档 ====== */
async loadGameList(){
  const saves=Store.state.saves;
  if(!saves.length){Utils.toast('暂无存档');return;}
  const o=document.createElement('div');o.className='modal-overlay';
  o.innerHTML=`<div class="modal"><div class="modal-header"><span class="modal-title">读取存档</span></div>
    <div class="modal-body">${saves.sort((a,b)=>b.timestamp-a.timestamp).map(s=>`
      <div class="list-item" onclick="Pages.loadSave('${s.id}')">
        <div class="list-item-icon">${Utils.icon('save')}</div>
        <div class="list-item-content"><div class="list-item-title">${Utils.escape(s.name)}</div><div class="list-item-desc">${Utils.timeFmt(s.timestamp)}</div></div>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();Pages.delSave('${s.id}')">${Utils.icon('trash')}</button>
      </div>
    `).join('')}</div>
    <div class="modal-footer"><button class="btn btn-sm" onclick="this.closest('.modal-overlay').remove()">关闭</button></div>
  </div>`;
  document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o)o.remove();});
},
loadSave(id){if(Store.loadSave(id)){document.querySelectorAll('.modal-overlay').forEach(m=>m.remove());Utils.toast('存档已加载');Router.go('/');}else Utils.toast('加载失败');},
async delSave(id){const ok=await Utils.confirm('删除存档','确定删除？','删除','取消');if(ok){Store.state.saves=Store.state.saves.filter(s=>s.id!==id);Store.save();Utils.toast('已删除');this.loadGameList();}},

/* ====== 新游戏 ====== */
async newGame(){
  const ok=await Utils.confirm('创建新游戏','开始新游戏向导？','开始','取消');if(!ok)return;
  const wv=await Utils.prompt('世界观设定','输入世界观描述，或留空使用默认值','');if(wv===null)return;
  let wd={title:wv?wv.slice(0,20):'自由世界',setting:wv||'一个开放的视觉小说世界。',locations:[]};
  if(wv&&wv.length<50&&Store.state.apis.assistant.url){
    Utils.toast('AI生成世界观...');try{
      const sys='生成世界观JSON：{title,setting,locations:[{name,desc,type}]}';
      const r=await AI.gen(wv,{system:sys,maxTokens:600});const m=r.match(/\{[\s\S]*\}/);if(m)wd=JSON.parse(m[0]);
    }catch(e){}
  }
  Store.state.currentGame={id:Utils.uid(),worldview:wd,createdAt:Date.now(),location:null};
  Store.state.chatHistory=[];Store.save();
  if(wd.locations?.length){const m={id:Utils.uid(),name:wd.title+'-地图',bgUrl:'',pins:wd.locations.map((l,i)=>({id:Utils.uid(),name:l.name,desc:l.desc||'',x:15+(i%3)*30,y:20+Math.floor(i/3)*25}))};Store.addMap(m);}
  Utils.toast('游戏创建成功！');Router.go('/');
},

/* ====== 状态栏字段自定义 ====== */
async customStatusFields(){
  const fields=Store.state.statusFields;
  // 简单展示当前字段，可以后续扩展编辑
  Router.nav(`
    <div class="topbar"><button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button><span class="topbar-title">状态栏字段</span></div>
    <div class="page">
      <p class="text-sm text-muted mb-2">以下字段会显示在顶部信息栏：</p>
      ${fields.map(f=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px">
          <span class="text-sm">${Utils.escape(f.name)}: ${Utils.escape(f.value)}</span>
          <button class="btn btn-sm" onclick="Pages.editStatusField('${f.key}')">${Utils.icon('edit')}</button>
        </div>
      `).join('')}
      <button class="btn btn-primary btn-block mt-2" onclick="Pages.addStatusField()">${Utils.icon('plus')} 添加字段</button>
    </div>
  `,'home');
},
async editStatusField(key){
  const f=Store.state.statusFields.find(x=>x.key===key);if(!f)return;
  const form=await Utils.formModal('编辑字段',[{key:'name',label:'字段名',placeholder:f.name},{key:'value',label:'值',placeholder:f.value}]);
  if(!form)return;Object.assign(f,form);Store.save();this.customStatusFields();
},
async addStatusField(){
  const form=await Utils.formModal('添加字段',[{key:'key',label:'键(英文)',placeholder:'如:strength'},{key:'name',label:'显示名',placeholder:'如:武力'},{key:'value',label:'默认值',placeholder:'0'}]);
  if(!form||!form.key)return;
  Store.state.statusFields.push({key:form.key,name:form.name,value:form.value});Store.save();Utils.toast('已添加');this.customStatusFields();
},
};
