/* ============================================================
   pages.js - 主页面渲染逻辑 v8
   页面：splash/home/vn/chat/map/chars/charDetail/assets/settings/customStatusFields
   核心：沉浸式VN + Markdown聊天 + 状态栏 + 无硬编码内容
   角色详情页(charDetail)基于参考图片全新设计
   ============================================================ */

const Pages = {

  /* ====== 启动页 ====== */
  splash() {
    const bg = Store.state.backgrounds[0];
    Router.full(`
      <div class="splash" id="splash-bg" style="${bg ? 'background-image:url(' + bg.url + ')' : 'background:linear-gradient(135deg,#1a3a1a,#2d5a2d,#4a7a4a)'}">
        <div class="splash-content">
          <div class="splash-title">墨境</div>
          <div class="splash-subtitle">AI视觉小说沙盒模拟器</div>
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
                <div class="splash-card-desc">API & 主题 & 数据</div>
              </div>
              <span style="margin-left:auto;font-size:1.2rem;color:rgba(245,230,211,0.5)">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    `);
  },

  /* ====== 主页/主操作面板 ====== */
  home() {
    const game = Store.state.currentGame;
    if (!game) { this.splash(); return; }
    const bg = Store.state.backgrounds[0];
    const chars = Store.state.characters;
    const mainChar = chars.find(c => c.role === 'main');
    const fields = Store.state.statusFields;

    const leftMenu = [
      { k: 'activity', i: 'star', l: '活动', href: '/interactions' },
      { k: 'gift', i: 'gift', l: '福利', href: '/interactions' },
      { k: 'vip', i: 'crown', l: '特权', href: '/settings' },
      { k: 'follower', i: 'users', l: '随从', href: '/chars' },
      { k: 'wardrobe', i: 'image', l: '衣橱', href: '/assets' },
      { k: 'shop', i: 'shopping', l: '商城', href: '/assets' },
      { k: 'task', i: 'task', l: '任务', href: '/storyline' },
      { k: 'achievement', i: 'trophy', l: '成就', href: '/storyline' },
      { k: 'gallery', i: 'grid', l: '图鉴', href: '/assets' },
      { k: 'mail', i: 'mail', l: '信件', href: '/phone/mail' },
      { k: 'backpack', i: 'backpack', l: '背包', href: '/chars' },
    ];

    const infoBarHtml = `
      <div class="info-bar">
        <img class="info-avatar" src="${mainChar?.avatar || mainChar?.portrait || ''}" onerror="this.style.display='none'" alt="">
        <div class="info-content">
          <div class="info-name">${Utils.escape(mainChar?.name || '未命名')}</div>
          <div class="info-stats">
            ${fields.map(f => `<span class="info-stat">${Utils.escape(f.name)}: ${Utils.escape(f.value)}</span>`).join('')}
          </div>
        </div>
        <div class="info-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages.quickSave()" title="快速存档">${Utils.icon('save')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Router.go('/settings')" title="设置">${Utils.icon('settings')}</button>
        </div>
      </div>
    `;

    const leftHtml = leftMenu.map(m => `
      <a class="panel-left-btn" href="#${m.href}">
        ${Utils.icon(m.i)}<span>${m.l}</span>
      </a>
    `).join('');

    const rightHtml = `
      <a class="panel-right-card" href="#/vn">
        <div style="width:100%;height:60px;background:linear-gradient(135deg,var(--gold),var(--gold-deep));border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem">剧情</div>
        <div class="panel-right-card-title">主线剧情</div>
      </a>
      <a class="panel-right-card" href="#/interactions">
        <div style="width:100%;height:60px;background:linear-gradient(135deg,var(--success),#3a6a49);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem">互动</div>
        <div class="panel-right-card-title">场景互动</div>
      </a>
      <a class="panel-right-card" href="#/storyline">
        <div style="width:100%;height:60px;background:linear-gradient(135deg,var(--info),#2a5a8a);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7rem">进度</div>
        <div class="panel-right-card-title">剧情线</div>
      </a>
    `;

    const charCards = chars.map(c => `
      <div class="char-flip-card" onclick="Pages.vnSelectCharById('${c.id}');Router.go('/vn');">
        <span class="char-flip-card-tag">${c.role === 'main' ? '主' : 'NPC'}</span>
        <img class="char-flip-card-img" src="${c.portrait || c.avatar || ''}" onerror="this.style.display='none';this.parentElement.style.background='var(--bg-deep)'" alt="">
        <div class="char-flip-card-info">
          <div class="char-flip-card-name">${Utils.escape(c.name)}</div>
          <div class="char-flip-card-role">${Utils.escape(c.occupation || c.personality?.slice(0, 12) || '')}</div>
        </div>
      </div>
    `).join('');

    Router.full(`
      <div class="main-panel" style="${bg ? 'background-image:url(' + bg.url + ')' : ''}">
        ${infoBarHtml}
        <div class="panel-left">${leftHtml}</div>
        <div class="panel-main">
          <div style="text-align:center;margin-bottom:10px">
            <span class="tag tag-gold">${Utils.escape(game.worldview?.title || '自由世界')}</span>
          </div>
          <div class="cards-scroll" id="home-char-scroll">
            ${charCards || '<div class="empty-state" style="padding:20px"><p class="text-xs">暂无角色</p></div>'}
          </div>
          <div class="ink-divider"><span>快捷功能</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <button class="btn btn-sm btn-primary" onclick="Router.go('/vn')">${Utils.icon('play')} 视觉小说</button>
            <button class="btn btn-sm" onclick="Router.go('/map')">${Utils.icon('map')} 地图</button>
            <button class="btn btn-sm" onclick="Router.go('/chat')">${Utils.icon('chat')} 闲聊</button>
            <button class="btn btn-sm" onclick="Router.go('/memory')">${Utils.icon('brain')} 记忆</button>
          </div>
          <div class="ink-divider"><span>系统</span></div>
          <div class="list-item" onclick="Router.go('/worldbook')">
            <div class="list-item-icon">${Utils.icon('book')}</div>
            <div class="list-item-content"><div class="list-item-title">世界书</div><div class="list-item-desc">管理世界观知识库</div></div>
          </div>
          <div class="list-item" onclick="Router.go('/presets')">
            <div class="list-item-icon">${Utils.icon('edit')}</div>
            <div class="list-item-content"><div class="list-item-title">预设提示词</div><div class="list-item-desc">控制AI行为与文风</div></div>
          </div>
          <div class="list-item" onclick="Router.go('/regex')">
            <div class="list-item-icon">${Utils.icon('refresh')}</div>
            <div class="list-item-content"><div class="list-item-title">正则规则</div><div class="list-item-desc">过滤AI多余输出</div></div>
          </div>
          <div class="list-item" onclick="Router.go('/assistant')">
            <div class="list-item-icon">${Utils.icon('bot')}</div>
            <div class="list-item-content"><div class="list-item-title">AI 助手</div><div class="list-item-desc">万能助手，帮你完成一切</div></div>
          </div>
          <div class="list-item" onclick="Router.go('/relations')">
            <div class="list-item-icon">${Utils.icon('heart')}</div>
            <div class="list-item-content"><div class="list-item-title">关系图</div><div class="list-item-desc">角色关系可视化</div></div>
          </div>
        </div>
        <div class="panel-right">${rightHtml}</div>
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

  /* ====== 快速存档 ====== */
  quickSave() {
    if (!Store.state.currentGame) { Utils.toast('请先创建游戏'); return; }
    Store.createSave(`存档 ${new Date().toLocaleString('zh-CN')}`);
    Utils.toast('存档成功');
  },

  /* ====== 存档列表 ====== */
  loadGameList() {
    const saves = Store.state.saves;
    const content = saves.length > 0 ? saves.map((s, i) => `
      <div class="save-slot" onclick="Pages.loadSave('${s.id}')">
        <div class="save-slot-icon">${Utils.icon('save')}</div>
        <div class="save-slot-info">
          <div class="save-slot-name">${Utils.escape(s.name || `存档 ${i + 1}`)}</div>
          <div class="save-slot-time">${Utils.timeFmt(s.timestamp)}</div>
        </div>
        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();Pages.delSave('${s.id}')">${Utils.icon('trash')}</button>
      </div>
    `).join('') : '<div class="empty-state">暂无存档</div>';
    Utils.drawer('存档列表', `
      <div style="max-height:60vh;overflow-y:auto">${content}</div>
      <button class="btn btn-primary btn-block mt-2" onclick="Pages.createNewGame()">${Utils.icon('plus')} 新建游戏</button>
    `);
  },

  loadSave(id) {
    if (Store.loadSave(id)) {
      Utils.toast('存档已加载');
      document.querySelectorAll('.drawer-overlay').forEach(d => d.remove());
      Router.go('/');
    }
  },

  delSave(id) {
    Store.state.saves = Store.state.saves.filter(s => s.id !== id);
    Store.save();
    this.loadGameList();
  },

  async createNewGame() {
    const name = await Utils.prompt('新建游戏', '输入世界名称', '未命名世界');
    if (!name) return;
    Store.state.currentGame = { name, worldview: { title: name, setting: '' }, createdAt: Date.now() };
    Store.state.statusFields[0].value = name;
    Store.save();
    Utils.toast('游戏已创建');
    document.querySelectorAll('.drawer-overlay').forEach(d => d.remove());
    Router.go('/');
  },

  /* ====== 视觉小说模式（沉浸式VN + Markdown聊天） ====== */
  vn() {
    const mode = Store.state.settings.vnMode || 'immersive';
    if (mode === 'immersive') this.vnImmersive();
    else this.vnChat();
  },

  /* 沉浸式VN模式：全屏背景 + 角色立绘 + 底部对话框 */
  vnImmersive() {
    const bg = Store.state.backgrounds[0];
    const char = this._vnCurrentChar || Store.state.characters[0];
    const history = Store.state.chatHistory;
    const lastMsg = history.filter(m => m.role === 'assistant').pop();
    const lastText = lastMsg ? lastMsg.content : '';

    Router.full(`
      <div class="vn-stage" style="${bg ? 'background-image:url(' + bg.url + ')' : 'background:linear-gradient(135deg,#2C1810,#5C4033)'}">
        <!-- 顶部栏 -->
        <div class="topbar" style="position:relative;background:rgba(0,0,0,0.4);border:none">
          <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
          <span class="topbar-title">${Utils.escape(char?.name || '视觉小说')}</span>
          <div class="topbar-actions">
            <button class="btn btn-sm btn-ghost" onclick="Pages.toggleVnMode()" style="color:var(--gold);font-size:0.65rem">${Utils.icon('chat')} 切换聊天</button>
            <button class="btn btn-icon btn-ghost" onclick="Pages.vnOptions()">${Utils.icon('settings')}</button>
          </div>
        </div>

        <!-- 角色立绘层 -->
        <div class="vn-char-layer" id="vn-char-layer">
          ${this._vnCharLayerHtml()}
        </div>

        <!-- 底部对话框 -->
        <div class="vn-content">
          <div class="vn-dialog-box">
            <div class="vn-dialog-name" id="vn-speaker">${Utils.escape(char?.name || '')}</div>
            <div class="vn-dialog-text" id="vn-text">${lastText ? Utils.escape(lastText) : '点击下方按钮开始对话...'}</div>
            <div class="typing-cursor" id="vn-cursor" style="display:none"></div>
          </div>

          <!-- 选项按钮（AI生成） -->
          <div class="vn-choices" id="vn-choices"></div>

          <!-- 输入区域 -->
          <div class="chat-input-area" style="background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);border-radius:var(--radius-md);border:1px solid rgba(201,162,39,0.3)">
            <input class="chat-input" id="vn-input" placeholder="输入内容发送给AI..." onkeydown="if(event.key==='Enter')Pages.vnSend()">
            <button class="btn btn-primary btn-icon" onclick="Pages.vnSend()">${Utils.icon('send')}</button>
            <button class="btn btn-icon btn-ghost" onclick="Pages.vnQuickOptions()">${Utils.icon('zap')}</button>
          </div>
        </div>
      </div>
    `);

    if (lastText && !lastMsg._typed) {
      this._typewriterEffect('vn-text', lastText, () => { lastMsg._typed = true; });
    }
  },

  _vnCharLayerHtml() {
    const chars = Store.state.characters;
    const active = this._vnCurrentChar;
    if (!chars.length) return '';
    if (active) {
      return `<img class="vn-char-img" src="${active.portrait || active.avatar || ''}" onerror="this.style.display='none'" alt="${Utils.escape(active.name)}">`;
    }
    const displayChars = chars.slice(0, 3);
    return displayChars.map(c => `
      <img class="vn-char-img" src="${c.portrait || c.avatar || ''}" onerror="this.style.display='none'" alt="${Utils.escape(c.name)}"
        onclick="Pages.vnSelectCharById('${c.id}')" style="cursor:pointer;max-width:${displayChars.length > 1 ? '30vw' : '45vw'}">
    `).join('');
  },

  /* Markdown聊天模式：左侧立绘 + 右侧对话面板 */
  vnChat() {
    const bg = Store.state.backgrounds[0];
    const char = this._vnCurrentChar || Store.state.characters[0];
    Router.full(`
      <div class="chat-stage" style="${bg ? 'background-image:url(' + bg.url + ')' : 'background:linear-gradient(135deg,#2C1810,#5C4033)'}">
        <div class="topbar" style="position:relative;background:rgba(0,0,0,0.4);border:none">
          <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
          <span class="topbar-title">${Utils.escape(char?.name || '对话')}</span>
          <div class="topbar-actions">
            <button class="btn btn-sm btn-ghost" onclick="Pages.toggleVnMode()" style="color:var(--gold);font-size:0.65rem">${Utils.icon('play')} 切换沉浸</button>
            <button class="btn btn-icon btn-ghost" onclick="Pages.chatClear()">${Utils.icon('trash')}</button>
          </div>
        </div>
        <div class="chat-content" style="padding-top:0">
          <div class="chat-left">
            <img class="chat-portrait" src="${char?.portrait || char?.avatar || ''}" onerror="this.style.display='none'" alt="${Utils.escape(char?.name || '')}">
          </div>
          <div class="chat-right">
            <div class="chat-panel">
              <div class="chat-header">
                <span class="chat-header-title">${Utils.escape(char?.name || '闲聊')}</span>
                <span class="text-xs text-muted">Markdown</span>
              </div>
              <div class="chat-messages custom-scroll" id="chat-messages">
                ${Store.state.chatHistory.length > 0 ? Store.state.chatHistory.map(m => this._chatBubble(m)).join('') : '<div style="text-align:center;padding:20px;color:rgba(245,230,211,0.4)"><p>开始对话吧</p></div>'}
              </div>
              <div class="chat-input-area">
                <input class="chat-input" id="vn-chat-input" placeholder="输入消息..." onkeydown="if(event.key==='Enter')Pages.vnChatSend()">
                <button class="btn btn-primary btn-icon" onclick="Pages.vnChatSend()">${Utils.icon('send')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  },

  _chatBubble(m) {
    const isUser = m.role === 'user';
    const char = Store.state.characters.find(c => c.name === m.speaker);
    const avatar = isUser ? '' : (char?.avatar || char?.portrait || '');
    return `<div class="chat-msg ${isUser ? 'user' : 'ai'}">
      ${!isUser && avatar ? `<img src="${avatar}" class="msg-avatar" onerror="this.style.display='none'">` : ''}
      <div style="max-width:85%;font-size:0.8rem;line-height:1.6">${isUser ? Utils.escape(m.content) : Utils.markdown(m.content)}</div>
    </div>`;
  },

  async toggleVnMode() {
    Store.state.settings.vnMode = Store.state.settings.vnMode === 'immersive' ? 'chat' : 'immersive';
    Store.save();
    this.vn();
  },

  vnSelectCharById(id) {
    const c = Store.state.characters.find(x => x.id === id);
    if (c) this._vnCurrentChar = c;
  },

  async vnSend() {
    const inp = document.getElementById('vn-input');
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';

    Store.state.chatHistory.push({ role: 'user', content: text, timestamp: Date.now() });
    Store.save();

    const cursorEl = document.getElementById('vn-cursor');
    const textEl = document.getElementById('vn-text');
    const speakerEl = document.getElementById('vn-speaker');
    const choicesEl = document.getElementById('vn-choices');
    if (cursorEl) cursorEl.style.display = 'inline-block';
    if (textEl) textEl.innerHTML = '<span class="spinner"></span>';
    if (choicesEl) choicesEl.innerHTML = '';

    try {
      const msgs = Store.state.chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      const g = Store.state.currentGame;
      let sys = '你是一个视觉小说AI。';
      if (Store.state.settings.writingStyle) sys += `文风要求：${Store.state.settings.writingStyle}。`;
      if (g?.worldview) sys += `世界观：${g.worldview.setting || ''}`;
      if (this._vnCurrentChar) sys += `当前角色：${this._vnCurrentChar.name}，${this._vnCurrentChar.personality || ''}`;
      msgs.unshift({ role: 'system', content: sys });

      const reply = await AI.chat(msgs, { recallQuery: text, personaId: g?.personaId });
      Store.state.chatHistory.push({ role: 'assistant', content: reply, speaker: this._vnCurrentChar?.name || 'AI', timestamp: Date.now() });
      Store.save();

      if (textEl && speakerEl) {
        speakerEl.textContent = this._vnCurrentChar?.name || 'AI';
        this._typewriterEffect('vn-text', reply, () => { this._generateOptions(reply); });
      }
    } catch (e) {
      if (textEl) textEl.innerHTML = `<span style="color:var(--danger)">错误: ${Utils.escape(e.message)}</span>`;
      if (cursorEl) cursorEl.style.display = 'none';
    }
  },

  async vnChatSend() {
    const inp = document.getElementById('vn-chat-input');
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';

    Store.state.chatHistory.push({ role: 'user', content: text, timestamp: Date.now() });
    Store.save();

    const el = document.getElementById('chat-messages');
    el.insertAdjacentHTML('beforeend', this._chatBubble({ role: 'user', content: text }));
    const lid = 'l-' + Date.now();
    el.insertAdjacentHTML('beforeend', `<div class="chat-msg ai" id="${lid}"><span class="spinner"></span></div>`);
    el.scrollTop = el.scrollHeight;

    try {
      const msgs = Store.state.chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      const g = Store.state.currentGame;
      let sys = '你是一个视觉小说AI。使用Markdown语法回复。';
      if (Store.state.settings.writingStyle) sys += `文风要求：${Store.state.settings.writingStyle}。`;
      if (g?.worldview) sys += `世界观：${g.worldview.setting || ''}`;
      if (this._vnCurrentChar) sys += `当前角色：${this._vnCurrentChar.name}，${this._vnCurrentChar.personality || ''}`;
      msgs.unshift({ role: 'system', content: sys });

      const reply = await AI.chat(msgs, { recallQuery: text, personaId: g?.personaId });
      Store.state.chatHistory.push({ role: 'assistant', content: reply, speaker: 'AI', timestamp: Date.now() });
      Store.save();
      document.getElementById(lid).innerHTML = Utils.markdown(reply);
      el.scrollTop = el.scrollHeight;
    } catch (e) {
      document.getElementById(lid).innerHTML = `<span style="color:var(--danger)">错误: ${Utils.escape(e.message)}</span>`;
    }
  },

  _typewriterEffect(elementId, text, onComplete) {
    const el = document.getElementById(elementId);
    const cursor = document.getElementById('vn-cursor');
    if (!el) return;
    if (cursor) cursor.style.display = 'inline-block';
    el.innerHTML = '';
    let i = 0;
    const speed = Store.state.settings.textSpeed || 40;

    const type = () => {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        if (cursor) cursor.style.display = 'none';
        el.innerHTML = Utils.markdown(text);
        if (onComplete) onComplete();
      }
    };
    type();
  },

  _generateOptions(reply) {
    const choicesEl = document.getElementById('vn-choices');
    if (!choicesEl) return;
    const choices = this._extractChoices(reply);
    if (choices.length > 0) {
      choicesEl.innerHTML = choices.map(c => `
        <button class="choice-btn" onclick="Pages.vnChooseOption(this)">${Utils.escape(c)}</button>
      `).join('');
    }
  },

  _extractChoices(text) {
    const choices = [];
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      if (/^[\d一二三四五六七八九十][.、\.]/.test(line.trim())) {
        choices.push(line.trim().replace(/^[\d一二三四五六七八九十][.、\.]\s*/, ''));
      }
    });
    if (choices.length === 0) {
      choices.push('继续对话');
      if (text.includes('?') || text.includes('？')) {
        choices.push('回答"是"');
        choices.push('回答"否"');
      }
    }
    return choices.slice(0, 4);
  },

  vnChooseOption(btn) {
    const text = btn.textContent;
    const inp = document.getElementById('vn-input');
    if (inp) { inp.value = text; this.vnSend(); }
  },

  vnQuickOptions() {
    const choices = ['观察周围', '询问信息', '表达感受', '采取行动'];
    const choicesEl = document.getElementById('vn-choices');
    if (choicesEl) {
      choicesEl.innerHTML = choices.map(c => `
        <button class="choice-btn" onclick="Pages.vnChooseOption(this)">${Utils.escape(c)}</button>
      `).join('');
    }
  },

  async vnOptions() {
    const s = Store.state.settings;
    const form = await Utils.formModal('视觉小说设置', [
      { key: 'wordLimit', label: '字数限制(0为不限制)', placeholder: s.wordLimit || '', type: 'number' },
      { key: 'writingStyle', label: '文风设定', placeholder: s.writingStyle || '如：古风、现代、悬疑' },
      { key: 'textSpeed', label: '打字速度(ms)', placeholder: String(s.textSpeed || 40), type: 'number' },
      { key: 'autoSend', label: '自动发送模式', type: 'checkbox' },
    ]);
    if (!form) return;
    s.wordLimit = form.wordLimit || '';
    s.writingStyle = form.writingStyle || '';
    s.textSpeed = parseInt(form.textSpeed) || 40;
    s.autoSend = form.autoSend;
    Store.save();
    Utils.toast('设置已保存');
  },

  async chatClear() {
    const ok = await Utils.confirm('清空对话', '确定清空所有对话记录吗？', '清空', '取消');
    if (ok) {
      Store.state.chatHistory = [];
      Store.save();
      this.vnChat();
    }
  },

  chat() { this.vnChat(); },

  /* ====== 地图 ====== */
  map() {
    const mapData = Store.state.maps[0];
    if (!mapData) {
      Router.nav(`
        <div class="topbar"><span class="topbar-title">地图</span></div>
        <div class="page">
          <div class="empty-state">${Utils.icon('map')}<p>暂无地图</p>
          <button class="btn btn-primary mt-2" onclick="Pages.createMap()">${Utils.icon('plus')} 创建地图</button></div>
        </div>
      `, 'home');
      return;
    }
    Router.full(`
      <div class="map-stage" style="${mapData.bgUrl ? 'background-image:url(' + mapData.bgUrl + ')' : 'background:linear-gradient(135deg,#3a5a3a,#5a8a5a)'}">
        <div class="map-content">
          <div class="map-area">
            ${(mapData.pins || []).map((p, i) => `
              <div class="map-location" style="left:${p.x || 15 + (i % 3) * 30}%;top:${p.y || 20 + Math.floor(i / 3) * 25}%" onclick="Pages.visitPin('${p.id}')">
                <div class="map-location-inner">
                  <div class="map-location-name">${Utils.escape(p.name)}</div>
                  <div class="map-location-desc">${Utils.escape(p.desc?.slice(0, 12) || '')}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="map-sidebar">
            <button class="map-sidebar-btn" onclick="Pages.mapRandomExplore()">${Utils.icon('search')} 随意逛逛</button>
            <button class="map-sidebar-btn" onclick="Pages.mapFilter('all')">${Utils.icon('globe')} 全部地点</button>
            <button class="map-sidebar-btn" onclick="Pages.mapFilter('indoor')">${Utils.icon('home')} 室内</button>
            <button class="map-sidebar-btn" onclick="Pages.mapFilter('outdoor')">${Utils.icon('map')} 室外</button>
            <button class="map-sidebar-btn" onclick="Router.go('/')">${Utils.icon('back')} 返回</button>
          </div>
        </div>
        <div class="topbar" style="position:absolute;top:0;left:0;right:0;background:rgba(0,0,0,0.5)">
          <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
          <span class="topbar-title">${Utils.escape(mapData.name || '地图')}</span>
          <div class="topbar-actions">
            <button class="btn btn-icon btn-ghost" onclick="Pages.createMapPin()">${Utils.icon('plus')}</button>
          </div>
        </div>
      </div>
    `);
  },

  async createMap() {
    const form = await Utils.formModal('创建地图', [
      { key: 'name', label: '地图名称', placeholder: '如：世界地图' },
      { key: 'bgUrl', label: '背景图URL', placeholder: 'https://...' },
    ]);
    if (!form || !form.name) return;
    const m = {
      name: form.name,
      bgUrl: form.bgUrl || '',
      pins: [
        { id: Utils.uid(), name: '起点', desc: '旅程开始的地方', x: 50, y: 50 },
        { id: Utils.uid(), name: '村落', desc: '宁静的居民区', x: 25, y: 30 },
        { id: Utils.uid(), name: '森林', desc: '茂密的树林', x: 75, y: 35 },
        { id: Utils.uid(), name: '山峰', desc: '高耸入云', x: 15, y: 70 },
        { id: Utils.uid(), name: '湖泊', desc: '碧波荡漾', x: 60, y: 75 },
      ]
    };
    Store.addMap(m);
    Utils.toast('地图创建成功');
    this.map();
  },

  async createMapPin() {
    const map = Store.state.maps[0];
    if (!map) return;
    const form = await Utils.formModal('添加地点', [
      { key: 'name', label: '地点名', placeholder: '如：酒馆' },
      { key: 'desc', label: '描述', type: 'textarea', placeholder: '' },
      { key: 'x', label: 'X(%)', placeholder: '0-100' },
      { key: 'y', label: 'Y(%)', placeholder: '0-100' },
    ]);
    if (!form || !form.name) return;
    map.pins.push({ id: Utils.uid(), name: form.name, desc: form.desc, x: parseFloat(form.x) || 50, y: parseFloat(form.y) || 50 });
    Store.save();
    this.map();
  },

  visitPin(id) {
    const map = Store.state.maps[0];
    const pin = map?.pins?.find(p => p.id === id);
    if (!pin) return;
    Utils.drawer(pin.name, `
      <p class="text-sm text-muted mb-2">${Utils.escape(pin.desc || '')}</p>
      <div class="flex gap-1">
        <button class="btn btn-sm btn-primary" onclick="Pages.goToLocation('${pin.id}')">${Utils.icon('location')} 前往</button>
        <button class="btn btn-sm" onclick="Pages.interactAtLocation('${pin.id}')">${Utils.icon('star')} 探索</button>
      </div>
    `);
  },

  goToLocation(id) {
    const map = Store.state.maps[0];
    const pin = map?.pins?.find(p => p.id === id);
    if (pin && Store.state.currentGame) {
      Store.state.currentGame.location = pin;
      Store.save();
    }
    document.querySelectorAll('.drawer-overlay').forEach(d => d.remove());
    Utils.toast('已前往: ' + pin?.name);
    Router.go('/vn');
  },

  interactAtLocation(id) {
    const map = Store.state.maps[0];
    const pin = map?.pins?.find(p => p.id === id);
    if (!pin) return;
    document.querySelectorAll('.drawer-overlay').forEach(d => d.remove());
    Router.go('/vn');
    setTimeout(() => {
      const inp = document.getElementById('vn-input');
      if (inp) {
        inp.value = `我来到了${pin.name}。${pin.desc || ''} 请描述这里的见闻。`;
        this.vnSend();
      }
    }, 500);
  },

  mapRandomExplore() { Utils.toast('正在随机探索...'); },
  mapFilter(type) { Utils.toast('筛选: ' + type); },

  /* ====== 角色管理 ====== */
  chars() {
    const chars = Store.state.characters;
    Router.nav(`
      <div class="topbar">
        <span class="topbar-title">角色</span>
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
        <div class="char-grid" id="char-grid">${chars.map(c => this._charCard(c)).join('') || '<div class="empty-state"><p>暂无角色</p></div>'}</div>
        <div class="ink-divider"><span>批量</span></div>
        <button class="btn btn-sm btn-block mb-1" onclick="Pages.batchUploadPortraits()">${Utils.icon('upload')} 批量上传立绘</button>
        <button class="btn btn-sm btn-block" onclick="Pages.aiGenChar()">${Utils.icon('bot')} AI生成角色</button>
      </div>
    `, 'chars');
  },

  _charCard(c) {
    return `
      <div class="char-card" onclick="Router.go('/char/${c.id}')">
        <div class="char-card-img" style="background-image:url(${c.portrait || c.avatar || ''});background-size:cover;background-position:center;background-color:var(--bg-deep)"></div>
        <div class="char-card-info">
          <div class="char-card-name">${Utils.escape(c.name)}</div>
          <div class="char-card-role">${Utils.escape(c.occupation || c.role || '')}</div>
        </div>
      </div>`;
  },

  _filterChars(el, role) {
    el.parentElement.querySelectorAll('.segmented-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    const chars = role === 'all' ? Store.state.characters : Store.state.characters.filter(c => c.role === role);
    document.getElementById('char-grid').innerHTML = chars.map(c => this._charCard(c)).join('') || '<div class="empty-state"><p>暂无角色</p></div>';
  },

  async addCharacter() {
    const form = await Utils.formModal('添加角色', [
      { key: 'name', label: '角色名', placeholder: '角色名称' },
      { key: 'age', label: '年龄', placeholder: '18', type: 'number' },
      { key: 'gender', label: '性别', type: 'select', options: [{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'other', label: '其他' }] },
      { key: 'occupation', label: '职业', placeholder: '如：冒险者' },
      { key: 'role', label: '类型', type: 'select', options: [{ value: 'main', label: '主要' }, { value: 'npc', label: 'NPC' }] },
      { key: 'personality', label: '性格', type: 'textarea', placeholder: '描述角色性格...' },
      { key: 'appearance', label: '外貌', type: 'textarea', placeholder: '描述角色外貌...' },
      { key: 'backstory', label: '背景', type: 'textarea', placeholder: '角色背景故事...' },
      { key: 'secret', label: '秘密', type: 'textarea', placeholder: '角色的秘密...' },
      { key: 'tags', label: '标签(逗号分隔)', placeholder: '标签1,标签2' },
    ]);
    if (!form || !form.name) return;
    form.tags = form.tags ? form.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
    Store.addChar(form);
    Utils.toast('角色添加成功');
    this.chars();
  },

  async aiGenChar() {
    const desc = await Utils.prompt('AI生成角色', '输入描述或关键词...', '');
    if (!desc) return;
    Utils.toast('AI生成中...');
    try {
      const sys = '你是角色设计专家。根据描述生成JSON角色信息：{name,age,gender,occupation,personality,appearance,backstory,secret,tags}。gender只能是male/female/other。';
      const r = await AI.gen(desc, { system: sys, maxTokens: 1200 });
      const m = r.match(/\{[\s\S]*\}/);
      if (m) {
        const d = JSON.parse(m[0]);
        d.role = 'npc';
        d.tags = Array.isArray(d.tags) ? d.tags : (d.tags ? d.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : []);
        Store.addChar(d);
        Utils.toast('角色生成成功');
        this.chars();
      } else Utils.toast('解析失败');
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  async batchUploadPortraits() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = 'image/*';
    inp.onchange = async () => {
      const files = Array.from(inp.files);
      for (const f of files) {
        const d = await Utils.compressImage(f);
        Store.addPortrait({ name: f.name.replace(/\.[^.]+$/, ''), url: d });
      }
      Utils.toast('导入了' + files.length + '张立绘');
      this.chars();
    };
    inp.click();
  },

  /* ====== 角色详情（核心页面，基于参考图片） ====== */
  charDetail(id) {
    const ch = Store.getChar(id);
    if (!ch) { Router.go('/chars'); return; }
    // 确保角色有stats和entries
    if (!ch.stats) ch.stats = {};
    if (!ch.entries) ch.entries = [];
    const charLogs = Store.state.charLogs[id] || [];
    const relations = Store.state.relations.filter(r => r.fromId === id || r.toId === id);

    // 构建左侧立绘区
    const portraitHtml = `
      <div class="char-portrait-area">
        <div class="char-portrait-frame">
          <img src="${ch.portrait || ch.avatar || ''}" onerror="this.style.display='none';this.parentElement.style.background='var(--bg-deep)'" alt="${Utils.escape(ch.name)}">
          <div class="char-portrait-name">${Utils.escape(ch.name)}</div>
          <div class="char-portrait-actions">
            <button class="btn btn-icon btn-sm" onclick="Pages.editChar('${id}')" title="编辑">${Utils.icon('edit')}</button>
            <button class="btn btn-icon btn-sm" onclick="Pages.toggleCharFav('${id}')" title="收藏">${ch.fav ? Utils.icon('heart') : Utils.icon('star')}</button>
          </div>
        </div>
      </div>
    `;

    // 构建右侧属性面板 - 顶部信息
    const topInfoHtml = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <span style="font-size:1.4rem;font-weight:900;color:var(--gold);font-family:var(--font-title);letter-spacing:2px">${Utils.escape(ch.name)}</span>
        <button class="btn btn-icon btn-sm" onclick="Pages.editChar('${id}')" style="background:var(--bg-deep)">${Utils.icon('edit')}</button>
        ${ch.age ? `<span class="tag tag-gold">年龄 ${ch.age} ${ch.ageUnit || '岁'}</span>` : ''}
        ${ch.birthDate ? `<span class="tag">${Utils.escape(ch.birthDate)}</span>` : ''}
      </div>
    `;

    // 信息标签行1：身份/身高/外貌
    const infoRow1Html = `
      <div class="info-tag-row">
        ${ch.identity ? `<div class="tag-pill"><span class="tag-label">身份</span><span class="tag-value">${Utils.escape(ch.identity)}</span></div>` : ''}
        ${ch.height ? `<div class="tag-pill"><span class="tag-label">身高</span><span class="tag-value">${Utils.escape(ch.height)}</span></div>` : ''}
        ${ch.appearance ? `<div class="tag-pill"><span class="tag-label">外貌</span><span class="tag-value">${Utils.escape(ch.appearance.slice(0, 20))}${ch.appearance.length > 20 ? '...' : ''}</span></div>` : ''}
      </div>
    `;

    // 简介文本
    const bioHtml = ch.bio || ch.backstory ? `
      <div class="scroll-bg" style="padding:10px;margin:8px 0;font-size:0.8rem;line-height:1.6;color:var(--ink-light)">
        ${Utils.escape(ch.bio || ch.backstory)}
      </div>
    ` : '';

    // 信息标签行2：体质/健康值/性格/状态
    const infoRow2Html = `
      <div class="info-tag-row">
        ${ch.constitution ? `<div class="tag-pill" style="background:rgba(201,162,39,0.1)"><span class="tag-label">体质</span><span class="tag-value">${Utils.escape(ch.constitution)}</span></div>` : ''}
        ${ch.health ? `<div class="tag-pill" style="background:rgba(74,124,89,0.1)"><span class="tag-label">健康</span><span class="tag-value">${Utils.escape(ch.health)}</span></div>` : ''}
        ${ch.personality ? `<div class="tag-pill" style="background:rgba(107,75,154,0.1)"><span class="tag-label">性格</span><span class="tag-value">${Utils.escape(ch.personality.slice(0, 12))}</span></div>` : ''}
        ${ch.status ? `<div class="tag-pill" style="background:rgba(178,34,34,0.1)"><span class="tag-label">状态</span><span class="tag-value">${Utils.escape(ch.status)}</span></div>` : ''}
      </div>
    `;

    // 信息标签行3：籍贯/婚姻/现居地/喜好
    const infoRow3Html = `
      <div class="info-tag-row">
        ${ch.hometown ? `<div class="tag-pill"><span class="tag-label">籍贯</span><span class="tag-value">${Utils.escape(ch.hometown)}</span></div>` : ''}
        ${ch.marriage ? `<div class="tag-pill"><span class="tag-label">婚姻</span><span class="tag-value">${Utils.escape(ch.marriage)}</span></div>` : ''}
        ${ch.currentLocation ? `<div class="tag-pill"><span class="tag-label">现居</span><span class="tag-value">${Utils.escape(ch.currentLocation)}</span></div>` : ''}
        ${ch.hobby ? `<div class="tag-pill"><span class="tag-label">喜好</span><span class="tag-value">${Utils.escape(ch.hobby)}</span></div>` : ''}
      </div>
    `;

    // 属性网格（5行3列）
    const defaultStats = [
      {key:'talent',name:'天资'},{key:'favor',name:'好感'},{key:'affection',name:'宠爱'},
      {key:'beauty',name:'容貌'},{key:'wisdom',name:'智慧'},{key:'literature',name:'文学'},
      {key:'strength',name:'武力'},{key:'art',name:'才艺'},{key:'politics',name:'政治'},
      {key:'military',name:'军事'},{key:'morality',name:'道德'},{key:'loyalty',name:'忠诚'},
      {key:'ambition',name:'野心'},{key:'power',name:'权势'},{key:'prestige',name:'声望'},
    ];
    const stats = ch.stats || {};
    const statGridHtml = `
      <div class="stat-grid">
        ${defaultStats.map(s => `
          <div class="stat-grid-item">
            <div class="stat-grid-label">${s.name}</div>
            <div class="stat-grid-value">${stats[s.key] ?? '88'}</div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:6px">
        <button class="btn btn-sm btn-ghost" onclick="Pages.editCharStats('${id}')">${Utils.icon('edit')} 编辑属性</button>
        <button class="btn btn-sm btn-ghost" onclick="Pages.aiGenStats('${id}')">${Utils.icon('bot')} AI生成</button>
      </div>
    `;

    // 词条标签（彩色胶囊）
    const entriesHtml = ch.entries.length > 0 ? `
      <div style="margin-top:10px">
        <div style="font-size:0.75rem;color:var(--ink-muted);margin-bottom:4px">词条</div>
        <div>
          ${ch.entries.map((e, i) => `
            <span class="tag-pill" style="background:${Utils.randomColor()}15;color:${Utils.randomColor()};border:1px solid ${Utils.randomColor()}40">
              ${Utils.escape(e)}
              <span style="cursor:pointer;margin-left:2px" onclick="Pages.removeCharEntry('${id}',${i})">×</span>
            </span>
          `).join('')}
        </div>
      </div>
    ` : '';

    // 底部Tab
    const tabHtml = `
      <div class="char-tabs">
        <div class="tab-btn active" onclick="Pages.switchCharTab(this,'notes')">记事</div>
        <div class="tab-btn" onclick="Pages.switchCharTab(this,'relations')">亲眷</div>
        <div class="tab-btn" onclick="Pages.switchCharTab(this,'children')">儿女</div>
        <div class="tab-btn" onclick="Pages.switchCharTab(this,'servants')">侍从</div>
      </div>
      <div id="char-tab-content" style="margin-top:8px">
        ${this._charNotesTab(id, charLogs)}
      </div>
    `;

    Router.full(`
      <div class="char-detail-layout">
        <div class="char-detail-left">
          ${portraitHtml}
          <button class="btn btn-sm btn-block" style="margin-top:10px;width:90%" onclick="Pages.uploadCharImg('${id}','portrait')">${Utils.icon('upload')} 更换立绘</button>
        </div>
        <div class="char-detail-right">
          ${topInfoHtml}
          ${infoRow1Html}
          ${bioHtml}
          ${infoRow2Html}
          ${infoRow3Html}
          ${statGridHtml}
          ${entriesHtml}
          <div style="margin-top:8px">
            <button class="btn btn-sm" onclick="Pages.addCharEntry('${id}')">${Utils.icon('plus')} 添加词条</button>
          </div>
          ${tabHtml}
        </div>
      </div>
      <div class="topbar" style="position:absolute;top:0;left:0;right:0">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/chars')">${Utils.icon('back')}</button>
        <span class="topbar-title">${Utils.escape(ch.name)}</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost btn-danger" onclick="Pages.delChar('${id}')">${Utils.icon('trash')}</button>
        </div>
      </div>
    `);
  },

  /* 角色详情Tab内容 */
  _charNotesTab(id, logs) {
    const charLogs = logs || [];
    return `
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <button class="btn btn-sm ${!Store.state._charLogFilter ? 'btn-primary' : ''}" onclick="Pages.filterCharLogs('${id}','')">全部</button>
        <button class="btn btn-sm ${Store.state._charLogFilter === 'event' ? 'btn-primary' : ''}" onclick="Pages.filterCharLogs('${id}','event')">事件</button>
        <button class="btn btn-sm ${Store.state._charLogFilter === 'relation' ? 'btn-primary' : ''}" onclick="Pages.filterCharLogs('${id}','relation')">关系</button>
        <button class="btn btn-sm ${Store.state._charLogFilter === 'daily' ? 'btn-primary' : ''}" onclick="Pages.filterCharLogs('${id}','daily')">日常</button>
      </div>
      <div class="char-log-timeline">
        ${charLogs.length > 0 ? charLogs.filter(l => !Store.state._charLogFilter || l.type === Store.state._charLogFilter).map(log => `
          <div class="char-log-timeline-item">
            <div class="char-log-dot"></div>
            <div class="char-log-time">${Utils.timeFmt(log.timestamp)}</div>
            <div class="char-log-content">${Utils.escape(log.content)} ${log.type ? `<span class="tag tag-sm">${log.type}</span>` : ''}</div>
          </div>
        `).join('') : '<p class="text-muted text-sm">暂无记事</p>'}
      </div>
      <button class="btn btn-sm btn-block mt-2" onclick="Pages.addCharLog('${id}')">${Utils.icon('plus')} 添加日志</button>
      <button class="btn btn-sm btn-ghost btn-block" onclick="Pages.aiSummarizeLogs('${id}')">${Utils.icon('bot')} AI总结</button>
    `;
  },

  _charRelationsTab(id) {
    const rels = Store.state.relations.filter(r => r.fromId === id || r.toId === id);
    const chars = Store.state.characters;
    return `
      <div style="margin-bottom:8px">
        <button class="btn btn-sm btn-primary" onclick="Pages.addCharRelation('${id}')">${Utils.icon('plus')} 添加关系</button>
        <button class="btn btn-sm btn-ghost" onclick="Router.go('/relations')">${Utils.icon('heart')} 查看完整关系图</button>
      </div>
      ${rels.length > 0 ? rels.map(r => {
        const otherId = r.fromId === id ? r.toId : r.fromId;
        const other = chars.find(c => c.id === otherId);
        return `
          <div class="list-item">
            <div class="list-item-icon">${Utils.icon('heart')}</div>
            <div class="list-item-content">
              <div class="list-item-title">${Utils.escape(other?.name || '未知')}</div>
              <div class="list-item-desc">${Utils.escape(r.type || '关系')} · 好感${r.affinity || 0}</div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="Pages.delCharRelation('${r.id}')">${Utils.icon('trash')}</button>
          </div>
        `;
      }).join('') : '<p class="text-muted text-sm">暂无亲眷关系</p>'}
    `;
  },

  _charChildrenTab(id) {
    // 简化为子角色列表（通过relations中type为parent/child的关联）
    const childRels = Store.state.relations.filter(r => (r.fromId === id || r.toId === id) && (r.type === 'parent' || r.type === 'child'));
    const chars = Store.state.characters;
    return `
      <div style="margin-bottom:8px">
        <button class="btn btn-sm btn-primary" onclick="Pages.addCharChild('${id}')">${Utils.icon('plus')} 添加儿女</button>
      </div>
      ${childRels.length > 0 ? childRels.map(r => {
        const childId = r.fromId === id ? r.toId : r.fromId;
        const child = chars.find(c => c.id === childId);
        return `
          <div class="list-item" onclick="Router.go('/char/${childId}')">
            <div class="list-item-icon">${Utils.icon('users')}</div>
            <div class="list-item-content">
              <div class="list-item-title">${Utils.escape(child?.name || '未知')}</div>
              <div class="list-item-desc">${Utils.escape(child?.occupation || '')} · ${child?.age || '?'}岁</div>
            </div>
          </div>
        `;
      }).join('') : '<p class="text-muted text-sm">暂无儿女</p>'}
    `;
  },

  _charServantsTab(id) {
    const servantRels = Store.state.relations.filter(r => (r.fromId === id || r.toId === id) && r.type === 'servant');
    const chars = Store.state.characters;
    return `
      <div style="margin-bottom:8px">
        <button class="btn btn-sm btn-primary" onclick="Pages.addCharServant('${id}')">${Utils.icon('plus')} 添加侍从</button>
      </div>
      ${servantRels.length > 0 ? servantRels.map(r => {
        const sid = r.fromId === id ? r.toId : r.fromId;
        const s = chars.find(c => c.id === sid);
        return `
          <div class="list-item" onclick="Router.go('/char/${sid}')">
            <div class="list-item-icon">${Utils.icon('users')}</div>
            <div class="list-item-content">
              <div class="list-item-title">${Utils.escape(s?.name || '未知')}</div>
              <div class="list-item-desc">${Utils.escape(s?.occupation || '侍从')}</div>
            </div>
          </div>
        `;
      }).join('') : '<p class="text-muted text-sm">暂无侍从</p>'}
    `;
  },

  switchCharTab(el, tab) {
    document.querySelectorAll('.char-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    const id = Router.cur.match(/\/char\/(.+)/)?.[1];
    if (!id) return;
    const container = document.getElementById('char-tab-content');
    if (!container) return;
    const logs = Store.state.charLogs[id] || [];
    switch(tab) {
      case 'notes': container.innerHTML = this._charNotesTab(id, logs); break;
      case 'relations': container.innerHTML = this._charRelationsTab(id); break;
      case 'children': container.innerHTML = this._charChildrenTab(id); break;
      case 'servants': container.innerHTML = this._charServantsTab(id); break;
    }
  },

  filterCharLogs(id, type) {
    Store.state._charLogFilter = type;
    const container = document.getElementById('char-tab-content');
    if (container) container.innerHTML = this._charNotesTab(id, Store.state.charLogs[id] || []);
  },

  async addCharLog(id) {
    const form = await Utils.formModal('添加日志', [
      { key: 'content', label: '内容', type: 'textarea', placeholder: '记录事件...' },
      { key: 'type', label: '类型', type: 'select', options: [{ value: 'event', label: '事件' }, { value: 'achievement', label: '成就' }, { value: 'relation', label: '关系' }, { value: 'daily', label: '日常' }] },
    ]);
    if (!form || !form.content) return;
    Store.state.charLogs[id] = Store.state.charLogs[id] || [];
    Store.state.charLogs[id].push({ id: Utils.uid(), content: form.content, type: form.type || 'event', timestamp: Date.now() });
    Store.save();
    Utils.toast('已添加');
    this.switchCharTab(document.querySelector('.char-tabs .tab-btn.active'), 'notes');
  },

  async aiSummarizeLogs(id) {
    const logs = Store.state.charLogs[id] || [];
    if (!logs.length) { Utils.toast('暂无日志'); return; }
    Utils.toast('AI总结中...');
    const text = logs.map(l => l.content).join('\n');
    try {
      const result = await AI.gen(`请总结以下角色日志，提炼关键事件和人物关系：\n${text.slice(0, 1500)}`, { maxTokens: 600 });
      Utils.drawer('AI总结', `<div class="md-render">${Utils.markdown(result)}</div>`);
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  async addCharRelation(id) {
    const chars = Store.state.characters.filter(c => c.id !== id);
    if (!chars.length) { Utils.toast('暂无其他角色'); return; }
    const form = await Utils.formModal('添加关系', [
      { key: 'toId', label: '关联角色', type: 'select', options: chars.map(c => ({ value: c.id, label: c.name })) },
      { key: 'type', label: '关系类型', placeholder: '如：朋友、师徒、恋人、仇敌' },
      { key: 'affinity', label: '好感度(-100~100)', placeholder: '0', type: 'number' },
    ]);
    if (!form || !form.toId) return;
    Store.addRel({ fromId: id, toId: form.toId, type: form.type || '关系', affinity: parseInt(form.affinity) || 0 });
    Utils.toast('关系已添加');
    this.switchCharTab(document.querySelector('.char-tabs .tab-btn.active'), 'relations');
  },

  delCharRelation(relId) {
    Store.deleteRelation(relId);
    this.switchCharTab(document.querySelector('.char-tabs .tab-btn.active'), 'relations');
  },

  async addCharChild(id) {
    const form = await Utils.formModal('添加儿女', [
      { key: 'name', label: '名字', placeholder: '儿女姓名' },
      { key: 'age', label: '年龄', placeholder: '0', type: 'number' },
      { key: 'gender', label: '性别', type: 'select', options: [{ value: 'male', label: '男' }, { value: 'female', label: '女' }] },
    ]);
    if (!form || !form.name) return;
    const child = Store.addChar({ name: form.name, age: form.age, gender: form.gender, role: 'npc' });
    Store.addRel({ fromId: id, toId: child.id, type: 'parent', affinity: 100 });
    Utils.toast('儿女已添加');
    this.switchCharTab(document.querySelector('.char-tabs .tab-btn.active'), 'children');
  },

  async addCharServant(id) {
    const form = await Utils.formModal('添加侍从', [
      { key: 'name', label: '名字', placeholder: '侍从姓名' },
      { key: 'occupation', label: '职责', placeholder: '如：管家、丫鬟' },
    ]);
    if (!form || !form.name) return;
    const servant = Store.addChar({ name: form.name, occupation: form.occupation, role: 'npc' });
    Store.addRel({ fromId: id, toId: servant.id, type: 'servant', affinity: 50 });
    Utils.toast('侍从已添加');
    this.switchCharTab(document.querySelector('.char-tabs .tab-btn.active'), 'servants');
  },

  async editCharStats(id) {
    const ch = Store.getChar(id);
    const stats = ch.stats || {};
    const statNames = [
      {key:'talent',name:'天资'},{key:'favor',name:'好感'},{key:'affection',name:'宠爱'},
      {key:'beauty',name:'容貌'},{key:'wisdom',name:'智慧'},{key:'literature',name:'文学'},
      {key:'strength',name:'武力'},{key:'art',name:'才艺'},{key:'politics',name:'政治'},
      {key:'military',name:'军事'},{key:'morality',name:'道德'},{key:'loyalty',name:'忠诚'},
      {key:'ambition',name:'野心'},{key:'power',name:'权势'},{key:'prestige',name:'声望'},
    ];
    const fields = statNames.map(s => ({
      key: s.key, label: s.name, type: 'number', placeholder: String(stats[s.key] ?? '88')
    }));
    const form = await Utils.formModal('编辑属性', fields, stats);
    if (!form) return;
    ch.stats = { ...stats, ...form };
    Store.save();
    Utils.toast('属性已保存');
    this.charDetail(id);
  },

  async aiGenStats(id) {
    const ch = Store.getChar(id);
    Utils.toast('AI生成属性中...');
    try {
      const prompt = `为角色"${ch.name}"生成15个属性数值（0-100），返回JSON对象：{talent,favor,affection,beauty,wisdom,literature,strength,art,politics,military,morality,loyalty,ambition,power,prestige}。角色简介：${ch.personality || ''} ${ch.backstory || ''}`;
      const result = await AI.gen(prompt, { maxTokens: 500 });
      const m = result.match(/\{[\s\S]*\}/);
      if (m) {
        ch.stats = { ...ch.stats, ...JSON.parse(m[0]) };
        Store.save();
        Utils.toast('属性已生成');
        this.charDetail(id);
      } else Utils.toast('解析失败');
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  async addCharEntry(id) {
    const text = await Utils.prompt('添加词条', '输入词条名称', '');
    if (!text) return;
    const ch = Store.getChar(id);
    if (!ch.entries) ch.entries = [];
    ch.entries.push(text);
    Store.save();
    Utils.toast('词条已添加');
    this.charDetail(id);
  },

  removeCharEntry(id, index) {
    const ch = Store.getChar(id);
    if (ch.entries) ch.entries.splice(index, 1);
    Store.save();
    this.charDetail(id);
  },

  toggleCharFav(id) {
    const ch = Store.getChar(id);
    ch.fav = !ch.fav;
    Store.save();
    Utils.toast(ch.fav ? '已收藏' : '已取消收藏');
    this.charDetail(id);
  },

  async uploadCharImg(id, type) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = async () => {
      const f = inp.files[0];
      if (!f) return;
      const d = await Utils.compressImage(f);
      Store.upChar(id, { [type]: d });
      Utils.toast('上传成功');
      this.charDetail(id);
    };
    inp.click();
  },

  async editChar(id) {
    const ch = Store.getChar(id);
    const form = await Utils.formModal('编辑角色', [
      { key: 'name', label: '姓名', placeholder: ch.name },
      { key: 'age', label: '年龄', placeholder: ch.age || '', type: 'number' },
      { key: 'gender', label: '性别', type: 'select', options: [{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'other', label: '其他' }] },
      { key: 'occupation', label: '职业', placeholder: ch.occupation || '' },
      { key: 'personality', label: '性格', type: 'textarea', placeholder: ch.personality || '' },
      { key: 'appearance', label: '外貌', type: 'textarea', placeholder: ch.appearance || '' },
      { key: 'backstory', label: '背景', type: 'textarea', placeholder: ch.backstory || '' },
      { key: 'secret', label: '秘密', type: 'textarea', placeholder: ch.secret || '' },
      { key: 'identity', label: '身份', placeholder: ch.identity || '' },
      { key: 'height', label: '身高', placeholder: ch.height || '' },
      { key: 'constitution', label: '体质', placeholder: ch.constitution || '' },
      { key: 'health', label: '健康值', placeholder: ch.health || '' },
      { key: 'status', label: '状态', placeholder: ch.status || '' },
      { key: 'hometown', label: '籍贯', placeholder: ch.hometown || '' },
      { key: 'marriage', label: '婚姻', placeholder: ch.marriage || '' },
      { key: 'currentLocation', label: '现居地', placeholder: ch.currentLocation || '' },
      { key: 'hobby', label: '喜好', placeholder: ch.hobby || '' },
      { key: 'bio', label: '简介', type: 'textarea', placeholder: ch.bio || '' },
      { key: 'tags', label: '标签(逗号分隔)', placeholder: (ch.tags || []).join(',') },
    ], ch);
    if (!form) return;
    form.tags = form.tags ? form.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
    Store.upChar(id, form);
    Utils.toast('已保存');
    this.charDetail(id);
  },

  async delChar(id) {
    const ok = await Utils.confirm('删除角色', '确定删除此角色吗？相关数据也会删除。', '删除', '取消');
    if (ok) {
      Store.delChar(id);
      Utils.toast('已删除');
      Router.go('/chars');
    }
  },

  /* ====== 素材库 ====== */
  assets() {
    const tab = Store.state._assetTab || 'portraits';
    Router.nav(`
      <div class="topbar"><span class="topbar-title">素材库</span></div>
      <div class="page">
        <div class="segmented mb-1">
          <div class="segmented-item ${tab === 'portraits' ? 'active' : ''}" onclick="Pages._assetTab('portraits')">立绘</div>
          <div class="segmented-item ${tab === 'backgrounds' ? 'active' : ''}" onclick="Pages._assetTab('backgrounds')">背景</div>
          <div class="segmented-item ${tab === 'scenes' ? 'active' : ''}" onclick="Pages._assetTab('scenes')">场景</div>
          <div class="segmented-item ${tab === 'musics' ? 'active' : ''}" onclick="Pages._assetTab('musics')">音乐</div>
        </div>
        <div id="asset-content"></div>
      </div>
    `, 'assets');
    this._renderAssets(tab);
  },

  _assetTab(tab) { Store.state._assetTab = tab; Store.save(); this.assets(); },

  _renderAssets(tab) {
    const items = Store.state[tab] || [];
    const cats = tab === 'portraits' ? Store.state.portraitCats : tab === 'backgrounds' ? Store.state.bgCats : [];
    const el = document.getElementById('asset-content');
    if (!el) return;

    let catHtml = '';
    if (cats.length > 0) {
      const currentCat = Store.state._assetCat || 'default';
      catHtml = `<div class="asset-cat">
        <button class="asset-cat-btn ${currentCat === 'all' ? 'active' : ''}" onclick="Pages._filterAssets('${tab}','all')">全部</button>
        ${cats.map(c => `<button class="asset-cat-btn ${currentCat === c.id ? 'active' : ''}" onclick="Pages._filterAssets('${tab}','${c.id}')">${Utils.escape(c.name)}</button>`).join('')}
        <button class="btn btn-sm" onclick="Pages.addAssetCat('${tab}')">${Utils.icon('plus')}</button>
      </div>`;
    }

    const filtered = cats.length > 0 && (Store.state._assetCat || 'all') !== 'all'
      ? items.filter(it => it.catId === Store.state._assetCat)
      : items;

    el.innerHTML = catHtml + `<div class="flex gap-1 mb-1">
      <button class="btn btn-sm btn-primary" onclick="Pages.uploadAsset('${tab}')">${Utils.icon('upload')} 上传</button>
      <button class="btn btn-sm" onclick="Pages.batchUpload('${tab}')">${Utils.icon('plus')} 批量</button>
    </div>` + (filtered.length ? filtered.map(it => `
      <div class="list-item">
        ${tab !== 'musics' ? `<div style="width:50px;height:50px;border-radius:6px;background-image:url(${it.url || ''});background-size:cover;background-position:center;background-color:var(--bg-deep);flex-shrink:0;border:1px solid var(--border)"></div>` : `<div class="list-item-icon">${Utils.icon('music')}</div>`}
        <div class="list-item-content">
          <div class="list-item-title">${Utils.escape(it.name || '未命名')}</div>
          <div class="list-item-desc">${tab !== 'musics' ? (it.transparent ? '透明' : '不透明') : ''}</div>
        </div>
        <button class="btn btn-sm btn-danger" onclick="Pages.delAsset('${tab}','${it.id}')">${Utils.icon('trash')}</button>
      </div>
    `).join('') : '<div class="empty-state"><p>暂无素材</p></div>');
  },

  _filterAssets(tab, catId) {
    Store.state._assetCat = catId;
    Store.save();
    this._renderAssets(tab);
  },

  async addAssetCat(tab) {
    const name = await Utils.prompt('新建分类', '输入分类名称', '');
    if (!name) return;
    const cats = tab === 'portraits' ? Store.state.portraitCats : Store.state.bgCats;
    cats.push({ id: Utils.uid(), name, subs: [] });
    Store.save();
    this._renderAssets(tab);
  },

  uploadAsset(tab) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = tab === 'musics' ? 'audio/*' : 'image/*';
    inp.onchange = async () => {
      const f = inp.files[0];
      if (!f) return;
      Utils.toast('上传中...');
      if (tab === 'musics') {
        const r = new FileReader();
        r.onload = () => { Store.addMusic({ name: f.name.replace(/\.[^.]+$/, ''), url: r.result }); Utils.toast('上传成功'); this.assets(); };
        r.readAsDataURL(f);
      } else {
        const d = await Utils.compressImage(f);
        const isTransparent = f.name.toLowerCase().includes('transparent') || f.name.toLowerCase().includes('透明');
        const item = { name: f.name.replace(/\.[^.]+$/, ''), url: d, catId: Store.state._assetCat || 'default' };
        if (tab === 'portraits') item.transparent = isTransparent;
        Store[tab === 'portraits' ? 'addPortrait' : tab === 'backgrounds' ? 'addBg' : 'addScene'](item);
        Utils.toast('上传成功');
        this.assets();
      }
    };
    inp.click();
  },

  batchUpload(tab) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = tab === 'musics' ? 'audio/*' : 'image/*';
    inp.onchange = async () => {
      const files = Array.from(inp.files);
      Utils.toast('正在上传' + files.length + '个文件...');
      for (const f of files) {
        if (tab === 'musics') {
          await new Promise(res => {
            const r = new FileReader();
            r.onload = () => { Store.addMusic({ name: f.name.replace(/\.[^.]+$/, ''), url: r.result }); res(); };
            r.readAsDataURL(f);
          });
        } else {
          const d = await Utils.compressImage(f);
          const item = { name: f.name.replace(/\.[^.]+$/, ''), url: d, catId: Store.state._assetCat || 'default' };
          if (tab === 'portraits') item.transparent = f.name.toLowerCase().includes('transparent');
          Store[tab === 'portraits' ? 'addPortrait' : tab === 'backgrounds' ? 'addBg' : 'addScene'](item);
        }
      }
      Utils.toast('批量上传完成');
      this.assets();
    };
    inp.click();
  },

  delAsset(tab, id) {
    Store.state[tab] = Store.state[tab].filter(i => i.id !== id);
    Store.save();
    this.assets();
  },

  /* ====== 设置 ====== */
  settings() {
    const s = Store.state.settings;
    const a = Store.state.apis;
    Router.nav(`
      <div class="topbar"><span class="topbar-title">设置</span></div>
      <div class="page">
        <!-- 主题 -->
        <div class="collapse open">
          <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('sun')} 主题 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
          <div class="collapse-body"><div class="collapse-body-inner">
            <div class="field">
              <label class="label">主题</label>
              <div class="segmented">
                <div class="segmented-item ${s.theme === 'light' ? 'active' : ''}" onclick="Pages.setTheme('light')">古风墨境</div>
                <div class="segmented-item ${s.theme === 'dark' ? 'active' : ''}" onclick="Pages.setTheme('dark')">暗夜墨色</div>
                <div class="segmented-item ${s.theme === 'neon' ? 'active' : ''}" onclick="Pages.setTheme('neon')">赛博霓虹</div>
              </div>
            </div>
            <div class="field">
              <label class="label">打字速度: ${s.textSpeed}ms</label>
              <input type="range" class="w-full" min="10" max="200" value="${s.textSpeed}" oninput="Store.state.settings.textSpeed=parseInt(this.value);Store.save();this.previousElementSibling.textContent='打字速度: '+this.value+'ms'">
            </div>
            <div class="field">
              <label class="label">音量: ${Math.round(s.bgVolume * 100)}%</label>
              <input type="range" class="w-full" min="0" max="100" value="${s.bgVolume * 100}" oninput="AI.setVolume(parseInt(this.value)/100);this.previousElementSibling.textContent='音量: '+this.value+'%'">
            </div>
            <div class="field">
              <label class="label">发送模式</label>
              <div class="segmented">
                <div class="segmented-item ${s.sendMode === 'manual' ? 'active' : ''}" onclick="Pages.setSendMode('manual')">手动</div>
                <div class="segmented-item ${s.sendMode === 'auto' ? 'active' : ''}" onclick="Pages.setSendMode('auto')">自动</div>
              </div>
            </div>
          </div></div>
        </div>

        <!-- API设置 -->
        <div class="collapse">
          <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('globe')} API设置 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
          <div class="collapse-body"><div class="collapse-body-inner">
            <div class="field"><label class="label">API地址</label><input class="input" id="api-url" value="${a.main.url || ''}" placeholder="https://api.openai.com/v1"></div>
            <div class="field"><label class="label">密钥</label><input class="input" id="api-key" type="password" value="${a.main.key || ''}" placeholder="sk-..."></div>
            <div class="field"><label class="label">模型</label><input class="input" id="api-model" value="${a.main.model || ''}" placeholder="gpt-3.5-turbo"></div>
            <div class="flex gap-1">
              <button class="btn btn-sm btn-primary" onclick="Pages.saveApi()">保存</button>
              <button class="btn btn-sm" onclick="Pages.testApi()">测试连接</button>
            </div>
          </div></div>
        </div>

        <!-- 数据管理 -->
        <div class="collapse">
          <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('database')} 数据管理 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
          <div class="collapse-body"><div class="collapse-body-inner">
            <button class="btn btn-sm btn-block mb-1" onclick="Pages.exportData()">${Utils.icon('download')} 导出全部数据</button>
            <button class="btn btn-sm btn-block mb-1" onclick="Pages.importData()">${Utils.icon('upload')} 导入数据</button>
            <button class="btn btn-sm btn-block btn-danger" onclick="Pages.resetData()">${Utils.icon('trash')} 重置所有数据</button>
          </div></div>
        </div>

        <!-- 自定义状态字段 -->
        <div class="collapse">
          <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('grid')} 自定义状态 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
          <div class="collapse-body"><div class="collapse-body-inner">
            <div id="custom-status-list">
              ${Store.state.statusFields.map((f, i) => `
                <div class="settings-row">
                  <div>
                    <div class="settings-label">${Utils.escape(f.name)}</div>
                    <div class="settings-desc">当前值: ${Utils.escape(f.value)}</div>
                  </div>
                  <div class="flex gap-1">
                    <button class="btn btn-sm" onclick="Pages.editStatusField(${i})">${Utils.icon('edit')}</button>
                    <button class="btn btn-sm btn-danger" onclick="Pages.delStatusField(${i})">${Utils.icon('trash')}</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-sm btn-block mt-2" onclick="Pages.addStatusField()">${Utils.icon('plus')} 添加状态字段</button>
          </div></div>
        </div>

        <!-- 自定义主题 -->
        <div class="collapse">
          <div class="collapse-header" onclick="this.parentElement.classList.toggle('open')">${Utils.icon('palette')} 自定义主题 <span style="margin-left:auto">${Utils.icon('chevronDown')}</span></div>
          <div class="collapse-body"><div class="collapse-body-inner">
            <div class="field">
              <label class="switch">
                <input type="checkbox" ${Store.state.uiCustom.enabled ? 'checked' : ''} onchange="Store.state.uiCustom.enabled=this.checked;Store.save();Pages.applyCustomCSS()">
                <span class="switch-slider"></span>
              </label>
              <span style="margin-left:8px;font-size:0.8rem">启用自定义CSS</span>
            </div>
            <textarea class="css-editor" id="custom-css-editor" placeholder="输入自定义CSS...">${Utils.escape(Store.state.uiCustom.css || '')}</textarea>
            <button class="btn btn-sm btn-block mt-1" onclick="Pages.saveCustomCSS()">保存CSS</button>
          </div></div>
        </div>

        <div class="text-center mt-2 text-xs text-muted">墨境 v8</div>
      </div>
    `, 'settings');
  },

  setTheme(t) {
    Store.state.settings.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    Store.save();
    Utils.toast('主题已切换');
  },

  setSendMode(m) {
    Store.state.settings.sendMode = m;
    Store.save();
    this.settings();
  },

  saveApi() {
    Store.state.apis.main.url = document.getElementById('api-url').value;
    Store.state.apis.main.key = document.getElementById('api-key').value;
    Store.state.apis.main.model = document.getElementById('api-model').value;
    Store.save();
    Utils.toast('API已保存');
  },

  async testApi() {
    Utils.toast('测试连接中...');
    const r = await AI.test('main');
    Utils.toast(r.ok ? '连接成功: ' + r.reply : '连接失败: ' + r.error);
  },

  exportData() {
    const data = Store.exportAll();
    Utils.download('墨境v8_backup_' + Utils.timeFmt(Date.now()).replace(/[:\s]/g, '_') + '.json', data, 'application/json');
    Utils.toast('数据已导出');
  },

  async importData() {
    const text = await Utils.prompt('导入数据', '粘贴JSON数据', '');
    if (!text) return;
    if (Store.importAll(text)) {
      Utils.toast('导入成功，请刷新页面');
    } else {
      Utils.toast('导入失败，请检查数据格式');
    }
  },

  async resetData() {
    const ok = await Utils.confirm('重置数据', '确定清除所有数据吗？此操作不可恢复！', '重置', '取消');
    if (ok) {
      Store.reset();
      Utils.toast('数据已重置');
      Router.go('/');
    }
  },

  async addStatusField() {
    const form = await Utils.formModal('添加状态字段', [
      { key: 'key', label: '字段键（英文）', placeholder: '如：mana' },
      { key: 'name', label: '显示名称', placeholder: '如：法力' },
      { key: 'value', label: '默认值', placeholder: '100' },
    ]);
    if (!form || !form.key || !form.name) return;
    Store.state.statusFields.push({ key: form.key, name: form.name, value: form.value || '0' });
    Store.save();
    this.settings();
  },

  async editStatusField(index) {
    const f = Store.state.statusFields[index];
    const form = await Utils.formModal('编辑状态字段', [
      { key: 'name', label: '显示名称', placeholder: f.name },
      { key: 'value', label: '当前值', placeholder: f.value },
    ], f);
    if (!form) return;
    Object.assign(f, form);
    Store.save();
    this.settings();
  },

  delStatusField(index) {
    Store.state.statusFields.splice(index, 1);
    Store.save();
    this.settings();
  },

  saveCustomCSS() {
    const css = document.getElementById('custom-css-editor').value;
    Store.state.uiCustom.css = css;
    Store.save();
    this.applyCustomCSS();
    Utils.toast('CSS已保存');
  },

  applyCustomCSS() {
    let style = document.getElementById('custom-theme-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'custom-theme-style';
      document.head.appendChild(style);
    }
    style.textContent = Store.state.uiCustom.enabled ? (Store.state.uiCustom.css || '') : '';
  },

  /* ====== 自定义状态字段页面 ====== */
  customStatusFields() {
    this.settings();
  },
};
