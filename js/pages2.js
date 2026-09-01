/* ============================================================
   pages2.js - 扩展页面 (助手/记忆/世界书/预设/正则/手机/关系/教程)
   ============================================================ */

const Pages2 = {

  /* ===================== AI 助手 ===================== */
  assistant() {
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">AI 助手</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.assistantUploadFile()" title="上传源文件">${Utils.icon('upload')}</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;height:calc(100vh - var(--header-h))">
        <div id="assistant-messages" style="flex:1;overflow-y:auto;padding:16px;padding-bottom:80px">
          <div class="chat-msg">
            <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center">${Utils.icon('bot')}</div>
            <div class="chat-msg-bubble">
              <p>你好！我是万能AI助手。我可以帮你：</p>
              <ul style="padding-left:16px;margin:8px 0">
                <li>制作预设提示词</li>
                <li>制作状态栏配置</li>
                <li>生成角色/世界观</li>
                <li>编写自制App代码</li>
                <li>修改应用功能代码</li>
                <li>导入功能并自动安装</li>
                <li>回答任何问题</li>
              </ul>
              <p class="text-sm text-muted">上传源文件让我读取，或直接输入你的需求。</p>
            </div>
          </div>
        </div>
        <div class="chat-input-bar">
          <input class="input" id="assistant-input" placeholder="输入你的需求..." onkeydown="if(event.key==='Enter')Pages2.assistantSend()">
          <button class="btn btn-primary btn-icon" onclick="Pages2.assistantSend()">${Utils.icon('send')}</button>
        </div>
      </div>
    `);
    // 滚动到底部
    const msgEl = document.getElementById('assistant-messages');
    msgEl.scrollTop = msgEl.scrollHeight;
  },

  _assistantContext: '',

  async assistantUploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json,.csv,.html,.css,.js,.doc';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this._assistantContext = reader.result.substring(0, 5000);
        Utils.toast(`已读取: ${file.name}`);
        const msgEl = document.getElementById('assistant-messages');
        msgEl.insertAdjacentHTML('beforeend', `
          <div class="chat-msg self">
            <div class="chat-msg-bubble">已上传文件: ${Utils.escape(file.name)} (${Math.round(this._assistantContext.length/1024)}KB)</div>
            <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%"></div>
          </div>
        `);
        msgEl.scrollTop = msgEl.scrollHeight;
      };
      reader.readAsText(file);
    };
    input.click();
  },

  async assistantSend() {
    const input = document.getElementById('assistant-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const msgEl = document.getElementById('assistant-messages');
    msgEl.insertAdjacentHTML('beforeend', `
      <div class="chat-msg self">
        <div class="chat-msg-bubble">${Utils.escape(text)}</div>
        <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%"></div>
      </div>
    `);

    const loadingId = 'asst-loading-' + Date.now();
    msgEl.insertAdjacentHTML('beforeend', `
      <div class="chat-msg" id="${loadingId}">
        <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center">${Utils.icon('bot')}</div>
        <div class="chat-msg-bubble"><span class="spinner"></span></div>
      </div>
    `);
    msgEl.scrollTop = msgEl.scrollHeight;

    try {
      const system = `你是一个万能前端开发助手，服务于一个AI视觉小说创作平台。
你可以：
1. 生成自包含HTML/CSS/JS代码片段
2. 制作预设提示词（返回带标题和内容的JSON）
3. 生成角色设定（返回JSON）
4. 生成世界观设定（返回JSON）
5. 修改应用功能代码
6. 创建自制App

要求：
- 如果用户需要代码，返回纯代码（不要markdown包裹）
- 如果用户需要配置数据，返回JSON格式
- 代码使用CSS变量(--gold, --ink, --bg-base等)
- 适配手机竖屏`;

      const fullPrompt = this._assistantContext
        ? `源文件内容：\n${this._assistantContext.substring(0, 3000)}\n\n用户需求：${text}`
        : text;

      const result = await AI.generate(fullPrompt, { system, apiType: 'assistant', maxTokens: 3000 });

      document.getElementById(loadingId).remove();

      // 检测是否是代码
      const isCode = /<[a-z]/.test(result) || /function\s|const\s|var\s/.test(result) || /\.css|\.js/.test(text.toLowerCase());
      const isJson = result.trim().startsWith('{') || result.trim().startsWith('[');

      if (isCode) {
        // 代码预览 + 导入
        msgEl.insertAdjacentHTML('beforeend', `
          <div class="chat-msg">
            <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center">${Utils.icon('bot')}</div>
            <div class="chat-msg-bubble" style="max-width:90%">
              <p class="text-sm mb-1">已生成代码，预览如下：</p>
              <div style="margin:8px 0">
                <iframe srcdoc="${Utils.escape(result).replace(/"/g, '&quot;')}" sandbox="allow-scripts" style="width:100%;height:200px;border:1px solid var(--border);border-radius:6px;background:#fff"></iframe>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-sm btn-primary" onclick='Pages2.importCode(${JSON.stringify(result).replace(/'/g, "&#39;")})'>${Utils.icon('import')} 导入应用</button>
                <button class="btn btn-sm" onclick='Pages2.copyCode(${JSON.stringify(result).replace(/'/g, "&#39;")})'>${Utils.icon('copy')} 复制</button>
              </div>
            </div>
          </div>
        `);
      } else if (isJson) {
        // JSON 数据 - 尝试自动导入
        msgEl.insertAdjacentHTML('beforeend', `
          <div class="chat-msg">
            <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center">${Utils.icon('bot')}</div>
            <div class="chat-msg-bubble" style="max-width:90%">
              ${Utils.markdown(result)}
              <div class="flex gap-1 mt-1">
                <button class="btn btn-sm btn-primary" onclick='Pages2.importJson(${JSON.stringify(result).replace(/'/g, "&#39;")}, ${JSON.stringify(text).replace(/'/g, "&#39;")})'>${Utils.icon('import')} 智能导入</button>
              </div>
            </div>
          </div>
        `);
      } else {
        msgEl.insertAdjacentHTML('beforeend', `
          <div class="chat-msg">
            <div class="chat-msg-avatar" style="background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center">${Utils.icon('bot')}</div>
            <div class="chat-msg-bubble" style="max-width:90%">${Utils.markdown(result)}</div>
          </div>
        `);
      }
      msgEl.scrollTop = msgEl.scrollHeight;
    } catch (e) {
      document.getElementById(loadingId).remove();
      Utils.toast('错误: ' + e.message);
    }
  },

  async importCode(code) {
    const ok = await Utils.confirm('导入代码', '将此代码作为自制App导入到虚拟手机中？', '导入', '取消');
    if (!ok) return;
    const name = await Utils.prompt('App名称', '输入自制App名称', '自制App');
    if (!name) return;
    Store.addCustomApp({ name, code, createdAt: Date.now() });
    Utils.toast('已导入到虚拟手机');
  },

  copyCode(code) {
    navigator.clipboard.writeText(code).then(() => Utils.toast('已复制'));
  },

  async importJson(jsonStr, userRequest) {
    try {
      const data = JSON.parse(jsonStr);
      const type = this._detectType(data, userRequest);
      const ok = await Utils.confirm(
        '智能导入',
        `检测到类型: ${type}\n标题: ${data.name || data.title || '未命名'}\n确认导入？`,
        '导入', '取消'
      );
      if (!ok) return;

      if (type === '角色') {
        Store.addCharacter({ ...data, role: data.role || 'npc' });
        Utils.toast('角色已导入');
      } else if (type === '世界观') {
        if (!Store.state.currentGame) Store.state.currentGame = {};
        Store.state.currentGame.worldview = data;
        Store.save();
        Utils.toast('世界观已导入');
      } else if (type === '预设') {
        Store.addPreset({ name: data.name || data.title || '预设', content: data.content || JSON.stringify(data), type: 'custom' });
        Utils.toast('预设已导入');
      } else if (type === '世界书') {
        Store.addWorldBookEntry({ name: data.name || '条目', content: data.content || JSON.stringify(data), type: 'keyword', keywords: data.keywords || '' });
        Utils.toast('世界书条目已导入');
      } else {
        Utils.toast('已导入（未分类）');
      }
    } catch (e) {
      Utils.toast('解析失败: ' + e.message);
    }
  },

  _detectType(data, request) {
    const req = (request || '').toLowerCase();
    if (data.name && (data.personality || data.age || data.gender)) return '角色';
    if (data.title && (data.setting || data.era)) return '世界观';
    if (data.content && data.name) return '预设';
    if (data.keywords !== undefined) return '世界书';
    if (req.includes('角色') || req.includes('人物')) return '角色';
    if (req.includes('世界') || req.includes('设定')) return '世界观';
    if (req.includes('预设') || req.includes('提示词')) return '预设';
    return '其他';
  },

  /* ===================== 记忆系统 ===================== */
  memory() {
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">记忆库</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.memoryAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.memorySummarize()">${Utils.icon('refresh')}</button>
        </div>
      </div>
      <div class="page">
        <div class="segmented mb-2" id="mem-filter">
          <div class="segmented-item active" onclick="Pages2._memFilter(this,'')">全部</div>
          ${Store.state.memoryCategories.map(c => `
            <div class="segmented-item" onclick="Pages2._memFilter(this,'${c.id}')">${Utils.escape(c.name)}</div>
          `).join('')}
        </div>
        <div id="mem-list">
          ${Pages2._memListHtml('')}
        </div>
      </div>
    `);
  },

  _memListHtml(category) {
    const memories = category ? Memory.getByCategory(category) : Memory.getAll();
    if (memories.length === 0) {
      return `<div class="empty-state">${Utils.icon('brain')}<p>暂无记忆</p></div>`;
    }
    return memories.map(m => {
      const cat = Store.state.memoryCategories.find(c => c.id === m.category);
      return `
        <div class="card">
          <div class="flex justify-between items-center">
            <span class="tag" style="${cat ? `background:${cat.color}20;color:${cat.color};border-color:${cat.color}` : ''}">${Utils.escape(cat?.name || '其他')}</span>
            <span class="text-xs text-muted">${Utils.timeFmt(m.timestamp)}</span>
          </div>
          <p class="text-sm mt-1" style="line-height:1.6">${Utils.escape(m.content)}</p>
          ${m.source === 'ai' ? '<span class="tag tag-gold mt-1">AI提取</span>' : ''}
          <button class="btn btn-sm btn-danger" style="margin-top:8px" onclick="Pages2.memoryDelete('${m.id}')">${Utils.icon('trash')} 删除</button>
        </div>
      `;
    }).join('');
  },

  _memFilter(el, category) {
    el.parentElement.querySelectorAll('.segmented-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('mem-list').innerHTML = this._memListHtml(category);
  },

  async memoryAdd() {
    const categories = Store.state.memoryCategories;
    const form = await Utils.formModal('添加记忆', [
      { key: 'content', label: '记忆内容', type: 'textarea', placeholder: '记忆内容...' },
      { key: 'category', label: '分类', type: 'select', options: categories.map(c => ({ value: c.id, label: c.name })) },
      { key: 'context', label: '上下文', placeholder: '相关上下文（可选）' },
    ]);
    if (!form || !form.content) return;
    Memory.add(form.content, form.category, form.context);
    Utils.toast('已添加');
    this.memory();
  },

  memoryDelete(id) {
    Memory.delete(id);
    this.memory();
  },

  async memorySummarize() {
    Utils.toast('AI 总结中...');
    try {
      const result = await Memory.summarize();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header"><span class="modal-title">记忆总结</span></div>
          <div class="modal-body"><div style="line-height:1.8">${Utils.markdown(result)}</div></div>
          <div class="modal-footer"><button class="btn btn-sm" onclick="this.closest('.modal-overlay').remove()">关闭</button></div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    } catch (e) {
      Utils.toast('错误: ' + e.message);
    }
  },

  /* ===================== 世界书 ===================== */
  worldbook() {
    const entries = Store.state.worldBook;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">世界书</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.wbAdd()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p><strong>常驻注入：</strong>每次对话都会注入</p>
          <p><strong>关键词触发：</strong>匹配关键词时注入</p>
          <p><strong>深度注入：</strong>在对话特定深度位置插入</p>
        </div>
        ${entries.length > 0 ? entries.map(e => `
          <div class="card">
            <div class="flex justify-between items-center">
              <div class="card-title" style="margin:0">${Utils.icon('book')} ${Utils.escape(e.name)}</div>
              <span class="tag ${e.type==='always'?'tag-gold':e.type==='keyword'?'tag-success':'tag-danger'}">
                ${e.type==='always'?'常驻':e.type==='keyword'?'关键词':'深度'}
              </span>
            </div>
            <p class="text-sm mt-1 text-muted" style="line-height:1.6">${Utils.escape(e.content?.substring(0, 80) || '')}...</p>
            ${e.keywords ? `<div class="mt-1">${e.keywords.split(/[,，]/).map(k=>`<span class="tag">${Utils.escape(k.trim())}</span>`).join(' ')}</div>` : ''}
            <div class="flex gap-1 mt-1">
              <button class="btn btn-sm" onclick="Pages2.wbEdit('${e.id}')">${Utils.icon('edit')} 编辑</button>
              <button class="btn btn-sm btn-danger" onclick="Pages2.wbDelete('${e.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('book') + '<p>暂无世界书条目</p></div>'}
      </div>
    `);
  },

  async wbAdd() {
    const form = await Utils.formModal('添加世界书', [
      { key: 'name', label: '条目名称', placeholder: '如：城市背景' },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'always', label: '常驻注入' },
        { value: 'keyword', label: '关键词触发' },
        { value: 'depth', label: '深度注入' },
      ]},
      { key: 'keywords', label: '关键词(逗号分隔)', placeholder: '关键词触发时填写' },
      { key: 'content', label: '内容', type: 'textarea', placeholder: '世界书条目内容...' },
    ]);
    if (!form || !form.name) return;
    Store.addWorldBookEntry(form);
    Utils.toast('已添加');
    this.worldbook();
  },

  async wbEdit(id) {
    const entry = Store.state.worldBook.find(e => e.id === id);
    if (!entry) return;
    const form = await Utils.formModal('编辑条目', [
      { key: 'name', label: '条目名称', placeholder: entry.name },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'always', label: '常驻注入' },
        { value: 'keyword', label: '关键词触发' },
        { value: 'depth', label: '深度注入' },
      ]},
      { key: 'keywords', label: '关键词', placeholder: entry.keywords || '' },
      { key: 'content', label: '内容', type: 'textarea', placeholder: entry.content || '' },
    ], entry);
    if (!form) return;
    Object.assign(entry, form);
    Store.save();
    Utils.toast('已保存');
    this.worldbook();
  },

  wbDelete(id) {
    Store.deleteWorldBookEntry(id);
    this.worldbook();
  },

  /* ===================== 预设提示词 ===================== */
  presets() {
    const presets = Store.state.presets;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">预设提示词</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.presetAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.presetAiGen()">${Utils.icon('bot')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p>预设是对话的系统提示词，可控制AI的文风、角色、行为等。每个功能可选择不同预设。</p>
        </div>
        ${presets.length > 0 ? presets.map(p => `
          <div class="card">
            <div class="flex justify-between items-center">
              <div>
                <div class="card-title" style="margin:0">${Utils.icon('edit')} ${Utils.escape(p.name)}</div>
                ${p.type ? `<span class="tag tag-gold">${Utils.escape(p.type)}</span>` : ''}
              </div>
              <div class="flex gap-1">
                <button class="btn btn-sm" onclick="Pages2.presetEdit('${p.id}')">${Utils.icon('edit')}</button>
                <button class="btn btn-sm btn-danger" onclick="Pages2.presetDelete('${p.id}')">${Utils.icon('trash')}</button>
              </div>
            </div>
            <p class="text-sm mt-1 text-muted" style="line-height:1.6;max-height:60px;overflow:hidden">${Utils.escape(p.content?.substring(0, 100) || '')}...</p>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('edit') + '<p>暂无预设</p><p class="text-xs">点击右上角创建，或让AI帮你生成</p></div>'}
      </div>
    `);
  },

  async presetAdd() {
    const form = await Utils.formModal('创建预设', [
      { key: 'name', label: '预设名称', placeholder: '如：古风叙事' },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'custom', label: '通用预设' },
        { value: 'memory_extract', label: '记忆提取' },
        { value: 'memory_summarize', label: '记忆总结' },
        { value: 'character_gen', label: '角色生成' },
        { value: 'worldview_gen', label: '世界观生成' },
      ]},
      { key: 'content', label: '提示词内容', type: 'textarea', placeholder: '输入系统提示词...' },
    ]);
    if (!form || !form.name) return;
    Store.addPreset(form);
    Utils.toast('已创建');
    this.presets();
  },

  async presetEdit(id) {
    const preset = Store.state.presets.find(p => p.id === id);
    if (!preset) return;
    const form = await Utils.formModal('编辑预设', [
      { key: 'name', label: '预设名称', placeholder: preset.name },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'custom', label: '通用预设' },
        { value: 'memory_extract', label: '记忆提取' },
        { value: 'memory_summarize', label: '记忆总结' },
        { value: 'character_gen', label: '角色生成' },
        { value: 'worldview_gen', label: '世界观生成' },
      ]},
      { key: 'content', label: '提示词内容', type: 'textarea', placeholder: preset.content || '' },
    ], preset);
    if (!form) return;
    Object.assign(preset, form);
    Store.save();
    Utils.toast('已保存');
    this.presets();
  },

  presetDelete(id) {
    Store.deletePreset(id);
    this.presets();
  },

  async presetAiGen() {
    const desc = await Utils.prompt('AI生成预设', '描述你想要的预设效果\n如：让AI用古风文言文风格叙事', '');
    if (!desc) return;
    Utils.toast('AI 生成中...');
    try {
      const system = '你是提示词工程专家。根据用户描述生成一个完整的系统提示词。直接返回提示词内容，不要多余解释。';
      const result = await AI.generate(desc, { system, apiType: 'assistant', maxTokens: 1000 });
      Store.addPreset({ name: desc.substring(0, 20), content: result, type: 'custom' });
      Utils.toast('预设已生成');
      this.presets();
    } catch (e) {
      Utils.toast('错误: ' + e.message);
    }
  },

  /* ===================== 正则规则 ===================== */
  regex() {
    const rules = Store.state.regexRules;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">正则规则</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.regexAdd()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p>正则规则用于过滤AI回复中的八股文、多余标签等。</p>
          <p class="mt-1"><strong>常用示例：</strong></p>
          <p class="text-xs">去除思考标签：模式 <code>\\[思考\\].*?\\[/思考\\]</code> 替换为空</p>
          <p class="text-xs">去除AI套话：模式 <code>作为.{0,10}AI.{0,20}</code> 替换为空</p>
        </div>
        ${rules.length > 0 ? rules.map(r => `
          <div class="card">
            <div class="flex justify-between items-center">
              <div class="card-title" style="margin:0">${Utils.icon('refresh')} ${Utils.escape(r.name)}</div>
              <label class="switch">
                <input type="checkbox" ${r.enabled !== false ? 'checked' : ''} onchange="Pages2.regexToggle('${r.id}')">
                <span class="switch-slider"></span>
              </label>
            </div>
            <div class="text-xs mt-1">
              <div><span class="text-muted">模式：</span><code style="background:var(--bg-deep);padding:2px 6px;border-radius:4px">${Utils.escape(r.pattern)}</code></div>
              <div class="mt-1"><span class="text-muted">替换：</span><code style="background:var(--bg-deep);padding:2px 6px;border-radius:4px">${Utils.escape(r.replacement || '(空)')}</code></div>
              <div class="mt-1"><span class="text-muted">标志：</span>${Utils.escape(r.flags || 'g')}</div>
            </div>
            <div class="flex gap-1 mt-1">
              <button class="btn btn-sm" onclick="Pages2.regexEdit('${r.id}')">${Utils.icon('edit')}</button>
              <button class="btn btn-sm btn-danger" onclick="Pages2.regexDelete('${r.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">${Utils.icon('refresh')}<p>暂无正则规则</p></div>
          <button class="btn btn-sm btn-block" onclick="Pages2.regexAddDefaults()">添加常用规则</button>
        `}
      </div>
    `);
  },

  async regexAdd() {
    const form = await Utils.formModal('添加正则规则', [
      { key: 'name', label: '规则名称', placeholder: '如：去除思考标签' },
      { key: 'pattern', label: '正则模式', placeholder: '\\[思考\\].*?\\[/思考\\]' },
      { key: 'replacement', label: '替换为', placeholder: '留空则删除' },
      { key: 'flags', label: '标志', placeholder: 'g (全局) / gi (全局+忽略大小写)' },
    ]);
    if (!form || !form.pattern) return;
    form.enabled = true;
    Store.addRegexRule(form);
    Utils.toast('已添加');
    this.regex();
  },

  regexAddDefaults() {
    const defaults = [
      { name: '去除思考标签', pattern: '\\[思考\\][\\s\\S]*?\\[/思考\\]', replacement: '', flags: 'g', enabled: true },
      { name: '去除AI套话', pattern: '作为.{0,10}[Aa][Ii].{0,30}[，。]', replacement: '', flags: 'g', enabled: true },
      { name: '去除markdown代码块', pattern: '```[a-z]*\\n([\\s\\S]*?)```', replacement: '$1', flags: 'g', enabled: false },
      { name: '去除多余空行', pattern: '\\n{3,}', replacement: '\\n\\n', flags: 'g', enabled: true },
    ];
    defaults.forEach(r => Store.addRegexRule(r));
    Utils.toast(`已添加 ${defaults.length} 条规则`);
    this.regex();
  },

  async regexEdit(id) {
    const rule = Store.state.regexRules.find(r => r.id === id);
    if (!rule) return;
    const form = await Utils.formModal('编辑规则', [
      { key: 'name', label: '规则名称', placeholder: rule.name },
      { key: 'pattern', label: '正则模式', placeholder: rule.pattern },
      { key: 'replacement', label: '替换为', placeholder: rule.replacement || '' },
      { key: 'flags', label: '标志', placeholder: rule.flags || 'g' },
    ], rule);
    if (!form) return;
    Object.assign(rule, form);
    Store.save();
    Utils.toast('已保存');
    this.regex();
  },

  regexToggle(id) {
    const rule = Store.state.regexRules.find(r => r.id === id);
    if (rule) {
      rule.enabled = !rule.enabled;
      Store.save();
    }
  },

  regexDelete(id) {
    Store.deleteRegexRule(id);
    this.regex();
  },

  /* ===================== 万能导入 ===================== */
  importPage() {
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">万能导入</span>
      </div>
      <div class="page">
        <div class="upload-zone" onclick="Pages2.importFile()">
          ${Utils.icon('upload')}
          <p>点击或拖拽文件到此处</p>
          <p class="text-xs text-muted mt-1">支持 .txt .md .json .csv</p>
        </div>
        <div class="ink-divider"><span>或粘贴文本</span></div>
        <textarea class="textarea" id="import-text" placeholder="粘贴角色卡、世界观、世界书等内容..." style="min-height:150px"></textarea>
        <button class="btn btn-primary btn-block mt-2" onclick="Pages2.importText()">${Utils.icon('import')} 智能扫描导入</button>
        
        <div class="ink-divider"><span>导入历史</span></div>
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p>智能导入会自动扫描内容并分类：</p>
          <ul style="padding-left:16px;margin-top:8px">
            <li>角色信息 → 角色库</li>
            <li>世界观设定 → 当前游戏</li>
            <li>世界书条目 → 世界书</li>
            <li>物品信息 → 背包</li>
            <li>提示词 → 预设库</li>
          </ul>
        </div>
      </div>
    `);
  },

  importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json,.csv';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('import-text').value = reader.result;
        Utils.toast('文件已读取，点击导入');
      };
      reader.readAsText(file);
    };
    input.click();
  },

  async importText() {
    const text = document.getElementById('import-text').value.trim();
    if (!text) { Utils.toast('请输入或上传内容'); return; }

    // 先尝试本地解析
    let items = this._smartParse(text);

    // 如果本地解析不够，尝试AI
    if (items.length === 0 && Store.state.apis.assistant.url) {
      const aiGen = await Utils.confirm('AI辅助', '本地扫描未识别，是否使用AI智能分析？', 'AI分析', '取消');
      if (aiGen) {
        Utils.toast('AI 分析中...');
        try {
          const system = `你是数据分析师。分析用户提供的文本内容，提取出可以导入视觉小说应用的数据。
返回JSON数组，每项包含：
- type: "character" | "worldview" | "worldbook" | "item" | "preset"
- name: 名称
- content: 详细内容
- category: 分类（如果是世界书或记忆）`;
          const result = await AI.generate(`请分析以下内容并提取数据：\n${text.substring(0, 3000)}`, { system, apiType: 'assistant', maxTokens: 1500 });
          const jsonMatch = result.match(/\[[\s\S]*\]/);
          if (jsonMatch) items = JSON.parse(jsonMatch[0]);
        } catch (e) {
          Utils.toast('AI分析失败: ' + e.message);
          return;
        }
      }
    }

    if (items.length === 0) {
      Utils.toast('未识别到可导入内容');
      return;
    }

    // 预览并确认
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header"><span class="modal-title">导入预览 (${items.length}项)</span></div>
        <div class="modal-body">
          ${items.map((item, i) => `
            <div class="list-item">
              <div class="list-item-icon">${Utils.icon(item.type === 'character' ? 'users' : item.type === 'worldview' ? 'globe' : item.type === 'worldbook' ? 'book' : item.type === 'item' ? 'save' : 'edit')}</div>
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escape(item.name || '未命名')}</div>
                <div class="list-item-desc"><span class="tag">${item.type}</span></div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn btn-sm" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button class="btn btn-sm btn-primary" id="import-confirm">导入全部</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#import-confirm').onclick = () => {
      items.forEach(item => {
        if (item.type === 'character') Store.addCharacter({ name: item.name, personality: item.content, role: 'npc' });
        else if (item.type === 'worldview') {
          if (!Store.state.currentGame) Store.state.currentGame = {};
          Store.state.currentGame.worldview = { title: item.name, setting: item.content };
        }
        else if (item.type === 'worldbook') Store.addWorldBookEntry({ name: item.name, content: item.content, type: 'keyword' });
        else if (item.type === 'item') {
          // 添加到第一个角色的背包
          const char = Store.state.characters[0];
          if (char) {
            Store.state.characterInventory[char.id] = Store.state.characterInventory[char.id] || [];
            Store.state.characterInventory[char.id].push({ id: Utils.uid(), name: item.name, count: 1, desc: item.content });
          }
        }
        else if (item.type === 'preset') Store.addPreset({ name: item.name, content: item.content, type: 'custom' });
      });
      Store.save();
      overlay.remove();
      Utils.toast(`成功导入 ${items.length} 项`);
    };
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  },

  _smartParse(text) {
    const items = [];
    // 尝试JSON
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach(d => {
          if (d.name && (d.personality || d.age)) items.push({ type: 'character', ...d });
          else if (d.title && d.setting) items.push({ type: 'worldview', ...d });
          else if (d.name && d.content) items.push({ type: 'worldbook', ...d });
        });
      } else if (typeof data === 'object') {
        if (data.name && (data.personality || data.age)) items.push({ type: 'character', ...data });
        else if (data.title && data.setting) items.push({ type: 'worldview', ...data });
        else if (data.name && data.content) items.push({ type: 'worldbook', ...data });
      }
    } catch (e) {
      // 纯文本，按段落分割
      const lines = text.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        if (line.length > 10 && line.length < 200) {
          // 简单判断是否是角色描述
          if (/角色|人物|名字|姓名/.test(line) && /：|:/.test(line)) {
            items.push({ type: 'character', name: line.split(/[:：]/)[1]?.trim() || '未知', content: line });
          }
        }
      });
    }
    return items;
  },

  /* ===================== 关系图 ===================== */
  relations() {
    const chars = Store.state.characters;
    const rels = Store.state.relations;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">关系图</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.relAdd()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card">
          <div class="card-title">${Utils.icon('users')} 角色关系图谱</div>
          <div id="relation-graph-container"></div>
        </div>
        ${rels.length > 0 ? `
          <div class="ink-divider"><span>关系列表</span></div>
          ${rels.map(r => {
            const c1 = chars.find(c => c.id === r.fromId);
            const c2 = chars.find(c => c.id === r.toId);
            return `
              <div class="list-item">
                <div class="list-item-icon">${Utils.icon('heart')}</div>
                <div class="list-item-content">
                  <div class="list-item-title">${Utils.escape(c1?.name || '?')} → ${Utils.escape(c2?.name || '?')}</div>
                  <div class="list-item-desc">${Utils.escape(r.type || '关系')} · 好感${r.affinity || 0}</div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="Pages2.relDelete('${r.id}')">${Utils.icon('trash')}</button>
              </div>
            `;
          }).join('')}
        ` : ''}
      </div>
    `);

    // 渲染SVG关系图
    this._renderRelationGraph(chars, rels);
  },

  _renderRelationGraph(chars, rels) {
    const container = document.getElementById('relation-graph-container');
    if (!container) return;
    if (chars.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>暂无角色</p></div>';
      return;
    }

    const width = 320;
    const height = 280;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) / 2 - 40;

    // 角色位置 (圆形布局)
    const positions = chars.map((c, i) => {
      const angle = (i / chars.length) * Math.PI * 2 - Math.PI / 2;
      return { id: c.id, name: c.name, x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
    });

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:300px">`;

    // 连线
    rels.forEach(r => {
      const p1 = positions.find(p => p.id === r.fromId);
      const p2 = positions.find(p => p.id === r.toId);
      if (p1 && p2) {
        const color = r.affinity > 50 ? '#C9A227' : r.affinity < 0 ? '#B22222' : '#8B7355';
        svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${Math.abs(r.affinity / 20) + 1}" opacity="0.6"/>`;
        // 关系标签
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        svg += `<text x="${mx}" y="${my}" text-anchor="middle" font-size="10" fill="${color}">${Utils.escape(r.type || '')}</text>`;
      }
    });

    // 节点
    positions.forEach(p => {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="18" fill="var(--gold)" stroke="var(--bg-card)" stroke-width="2"/>`;
      svg += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" fill="#fff" font-weight="bold">${Utils.escape(p.name?.charAt(0) || '?')}</text>`;
      svg += `<text x="${p.x}" y="${p.y + 32}" text-anchor="middle" font-size="9" fill="var(--ink-light)">${Utils.escape(p.name || '')}</text>`;
    });

    svg += '</svg>';
    container.innerHTML = svg;
  },

  async relAdd() {
    const chars = Store.state.characters;
    if (chars.length < 2) { Utils.toast('至少需要2个角色'); return; }
    const form = await Utils.formModal('添加关系', [
      { key: 'fromId', label: '角色1', type: 'select', options: chars.map(c => ({ value: c.id, label: c.name })) },
      { key: 'toId', label: '角色2', type: 'select', options: chars.map(c => ({ value: c.id, label: c.name })) },
      { key: 'type', label: '关系类型', placeholder: '如：朋友、师徒、恋人、仇敌' },
      { key: 'affinity', label: '好感度(-100~100)', placeholder: '0' },
    ]);
    if (!form || !form.fromId || !form.toId) return;
    form.affinity = parseInt(form.affinity) || 0;
    Store.addRelation(form);
    Utils.toast('已添加');
    this.relations();
  },

  relDelete(id) {
    Store.deleteRelation(id);
    this.relations();
  },

  /* ===================== 剧情线 ===================== */
  storyline() {
    const lines = Store.state.storylines;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">剧情线</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.storyAdd()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        ${lines.length > 0 ? lines.map(l => `
          <div class="card">
            <div class="flex justify-between items-center">
              <div>
                <span class="tag ${l.type==='main'?'tag-gold':'tag-success'}">${l.type === 'main' ? '主线' : '支线'}</span>
                <span class="card-title" style="margin:0;display:inline-block;margin-left:8px">${Utils.escape(l.name)}</span>
              </div>
              <button class="btn btn-sm btn-danger" onclick="Pages2.storyDelete('${l.id}')">${Utils.icon('trash')}</button>
            </div>
            <p class="text-sm mt-1 text-muted">${Utils.escape(l.desc || '')}</p>
            ${l.progress ? `<div class="progress-bar mt-1"><div class="progress-fill" style="width:${l.progress}%"></div></div>` : ''}
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('book') + '<p>暂无剧情线</p></div>'}
      </div>
    `);
  },

  async storyAdd() {
    const form = await Utils.formModal('添加剧情线', [
      { key: 'name', label: '剧情名称', placeholder: '如：寻找失落的记忆' },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'main', label: '主线' },
        { value: 'side', label: '支线' },
      ]},
      { key: 'desc', label: '描述', type: 'textarea', placeholder: '剧情描述...' },
      { key: 'progress', label: '进度(%)', placeholder: '0-100' },
    ]);
    if (!form || !form.name) return;
    form.progress = parseInt(form.progress) || 0;
    Store.addStoryline(form);
    Utils.toast('已添加');
    this.storyline();
  },

  storyDelete(id) {
    Store.state.storylines = Store.state.storylines.filter(s => s.id !== id);
    Store.save();
    this.storyline();
  },

  /* ===================== 沉浸式场景 ===================== */
  interactions() {
    const interactions = Store.state.interactions;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">沉浸式场景</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.interactionAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.interactionAiGen()">${Utils.icon('bot')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p>沉浸式场景是自定义的互动场景，由你自己创建或AI生成。不是固定的，可以兼容任何世界观。</p>
        </div>
        ${interactions.length > 0 ? interactions.map(i => `
          <div class="card card-tap" onclick="Pages2.interactionPlay('${i.id}')">
            <div class="card-title">${Utils.icon('star')} ${Utils.escape(i.name)}</div>
            <p class="text-sm text-muted">${Utils.escape(i.desc?.substring(0, 80) || '')}</p>
            <div class="flex gap-1 mt-1">
              <button class="btn btn-sm" onclick="event.stopPropagation();Pages2.interactionEdit('${i.id}')">${Utils.icon('edit')}</button>
              <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();Pages2.interactionDelete('${i.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('star') + '<p>暂无场景</p></div>'}
      </div>
    `);
  },

  async interactionAdd() {
    const form = await Utils.formModal('创建场景', [
      { key: 'name', label: '场景名称', placeholder: '如：月下对弈' },
      { key: 'desc', label: '场景描述', type: 'textarea', placeholder: '描述场景的情境...' },
      { key: 'prompt', label: 'AI提示词', type: 'textarea', placeholder: '告诉AI如何推进这个场景...' },
    ]);
    if (!form || !form.name) return;
    Store.state.interactions.push({ id: Utils.uid(), ...form });
    Store.save();
    Utils.toast('已创建');
    this.interactions();
  },

  async interactionAiGen() {
    const desc = await Utils.prompt('AI生成场景', '描述你想要的场景\n如：一个在雨夜茶馆的密谈场景', '');
    if (!desc) return;
    Utils.toast('AI 生成中...');
    try {
      const system = '你是场景设计师。根据用户描述生成一个沉浸式互动场景。返回JSON：{name, desc, prompt}';
      const result = await AI.generate(desc, { system, apiType: 'assistant', maxTokens: 500 });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        Store.state.interactions.push({ id: Utils.uid(), ...data });
        Store.save();
        Utils.toast('场景已生成');
        this.interactions();
      }
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  interactionPlay(id) {
    const interaction = Store.state.interactions.find(i => i.id === id);
    if (!interaction) return;
    Router.go('/vn');
    setTimeout(() => Pages.vnSend(interaction.prompt || interaction.desc), 300);
  },

  async interactionEdit(id) {
    const interaction = Store.state.interactions.find(i => i.id === id);
    if (!interaction) return;
    const form = await Utils.formModal('编辑场景', [
      { key: 'name', label: '场景名称', placeholder: interaction.name },
      { key: 'desc', label: '场景描述', type: 'textarea', placeholder: interaction.desc || '' },
      { key: 'prompt', label: 'AI提示词', type: 'textarea', placeholder: interaction.prompt || '' },
    ], interaction);
    if (!form) return;
    Object.assign(interaction, form);
    Store.save();
    Utils.toast('已保存');
    this.interactions();
  },

  interactionDelete(id) {
    Store.state.interactions = Store.state.interactions.filter(i => i.id !== id);
    Store.save();
    this.interactions();
  },

  /* ===================== 虚拟手机 ===================== */
  phone() {
    const apps = Store.state.customApps;
    Router.renderWithNav(`
      <div class="topbar">
        <span class="topbar-title">虚拟手机</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.phoneAddApp()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        <!-- 内置App -->
        <div class="ink-divider"><span>内置应用</span></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center">
          <div class="card-tap" onclick="Router.go('/phone/chat')">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#07C160,#06AD56);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;color:#fff">${Utils.icon('chat' in Utils.icons ? 'chat' : 'send')}</div>
            <span class="text-xs">微信</span>
          </div>
          <div class="card-tap" onclick="Router.go('/phone/forum')">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#FF6B35,#F7931E);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;color:#fff">${Utils.icon('users')}</div>
            <span class="text-xs">论坛</span>
          </div>
          <div class="card-tap" onclick="Router.go('/phone/mail')">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#4A90D9,#357ABD);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;color:#fff">${Utils.icon('bell')}</div>
            <span class="text-xs">邮箱</span>
          </div>
          <div class="card-tap" onclick="Router.go('/settings')">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#8B7355,#6B5344);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;color:#fff">${Utils.icon('settings')}</div>
            <span class="text-xs">设置</span>
          </div>
        </div>

        <!-- 自制App -->
        ${apps.length > 0 ? `
          <div class="ink-divider"><span>自制应用</span></div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center">
            ${apps.map(app => `
              <div class="card-tap" onclick="Pages2.phoneRunApp('${app.id}')">
                <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--gold),var(--gold-deep));display:flex;align-items:center;justify-content:center;margin:0 auto 4px;color:#fff">${Utils.icon('play')}</div>
                <span class="text-xs" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${Utils.escape(app.name)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="ink-divider"><span>创建</span></div>
        <div class="flex gap-1">
          <button class="btn btn-sm flex-1" onclick="Pages2.phoneAddApp()">${Utils.icon('plus')} 制作App</button>
          <button class="btn btn-sm flex-1" onclick="Router.go('/assistant')">${Utils.icon('bot')} AI制作</button>
        </div>
      </div>
    `, 'phone');
  },

  async phoneAddApp() {
    const form = await Utils.formModal('制作App', [
      { key: 'name', label: 'App名称', placeholder: '如：计算器' },
      { key: 'code', label: 'HTML/CSS/JS代码', type: 'textarea', placeholder: '<div>你的App内容</div>\n<style>...</style>\n<script>...</script>' },
    ]);
    if (!form || !form.name) return;
    Store.addCustomApp(form);
    Utils.toast('App已创建');
    this.phone();
  },

  phoneRunApp(id) {
    const app = Store.state.customApps.find(a => a.id === id);
    if (!app) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.padding = '0';
    overlay.innerHTML = `
      <div class="modal" style="max-width:420px;width:100%;height:90vh;max-height:90vh;display:flex;flex-direction:column">
        <div class="modal-header">
          <span class="modal-title">${Utils.escape(app.name)}</span>
          <button class="btn btn-icon btn-ghost" onclick="this.closest('.modal-overlay').remove()">${Utils.icon('close')}</button>
        </div>
        <div style="flex:1;overflow:hidden">
          <iframe srcdoc="${Utils.escape(app.code).replace(/"/g, '&quot;')}" sandbox="allow-scripts" style="width:100%;height:100%;border:none;background:#fff"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  },

  /* ===================== 手机-聊天 ===================== */
  phoneChat() {
    const chats = Store.state.phoneChats;
    const chars = Store.state.characters;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">微信</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.phoneChatNew()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page" style="padding-bottom:0">
        ${chats.length > 0 ? chats.map(c => {
          const char = chars.find(ch => ch.id === c.charId);
          return `
            <div class="list-item" onclick="Router.go('/phone/chat/${c.id}')">
              <img class="status-avatar" src="${char?.avatar || char?.portrait || ''}" onerror="this.style.background='var(--bg-deep)'" style="width:40px;height:40px;border-radius:8px">
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escape(char?.name || c.name || '未知')}</div>
                <div class="list-item-desc">${Utils.escape(c.messages?.[c.messages.length-1]?.content?.substring(0,30) || '开始聊天')}</div>
              </div>
              <span class="text-xs text-muted">${Utils.dateShort(c.timestamp)}</span>
            </div>
          `;
        }).join('') : '<div class="empty-state">' + Utils.icon('send') + '<p>暂无对话</p></div>'}
      </div>
    `);
  },

  async phoneChatNew() {
    const chars = Store.state.characters;
    if (chars.length === 0) { Utils.toast('请先添加角色'); return; }
    const form = await Utils.formModal('新建对话', [
      { key: 'charId', label: '选择角色', type: 'select', options: chars.map(c => ({ value: c.id, label: c.name })) },
    ]);
    if (!form) return;
    const chat = { id: Utils.uid(), charId: form.charId, messages: [], timestamp: Date.now() };
    Store.state.phoneChats.push(chat);
    Store.save();
    Router.go('/phone/chat/' + chat.id);
  },

  phoneChatDetail(params) {
    const id = params[0];
    const chat = Store.state.phoneChats.find(c => c.id === id);
    if (!chat) { Router.go('/phone/chat'); return; }
    const char = Store.state.characters.find(c => c.id === chat.charId);

    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone/chat')">${Utils.icon('back')}</button>
        <span class="topbar-title">${Utils.escape(char?.name || '对话')}</span>
      </div>
      <div style="display:flex;flex-direction:column;height:calc(100vh - var(--header-h))">
        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;padding-bottom:80px">
          ${chat.messages.map(m => `
            <div class="chat-msg ${m.role === 'user' ? 'self' : ''}">
              ${m.role !== 'user' ? `<img class="chat-msg-avatar" src="${char?.avatar || ''}" onerror="this.style.display='none'">` : ''}
              <div class="chat-msg-bubble">${Utils.escape(m.content)}</div>
            </div>
          `).join('') || '<div class="empty-state"><p>开始聊天</p></div>'}
        </div>
        <div class="chat-input-bar">
          <input class="input" id="phone-chat-input" placeholder="输入消息..." onkeydown="if(event.key==='Enter')Pages2.phoneChatSend('${id}')">
          <button class="btn btn-primary btn-icon" onclick="Pages2.phoneChatSend('${id}')">${Utils.icon('send')}</button>
        </div>
      </div>
    `);
    const msgEl = document.getElementById('chat-messages');
    msgEl.scrollTop = msgEl.scrollHeight;
  },

  async phoneChatSend(chatId) {
    const chat = Store.state.phoneChats.find(c => c.id === chatId);
    if (!chat) return;
    const input = document.getElementById('phone-chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    chat.messages.push({ role: 'user', content: text });
    chat.timestamp = Date.now();

    const msgEl = document.getElementById('chat-messages');
    const char = Store.state.characters.find(c => c.id === chat.charId);
    msgEl.insertAdjacentHTML('beforeend', `<div class="chat-msg self"><div class="chat-msg-bubble">${Utils.escape(text)}</div></div>`);

    const loadingId = 'pc-loading-' + Date.now();
    msgEl.insertAdjacentHTML('beforeend', `<div class="chat-msg" id="${loadingId}"><img class="chat-msg-avatar" src="${char?.avatar || ''}" onerror="this.style.display='none'"><div class="chat-msg-bubble"><span class="spinner"></span></div></div>`);
    msgEl.scrollTop = msgEl.scrollHeight;

    try {
      const messages = [
        { role: 'system', content: `你是角色"${char?.name || 'NPC'}"，${char?.personality || ''}。你在微信聊天中，请用日常口语回复，不要太长。` },
        ...chat.messages.map(m => ({ role: m.role, content: m.content })),
      ];
      const reply = await AI.chat(messages, { maxTokens: 200 });
      chat.messages.push({ role: 'assistant', content: reply });
      Store.save();
      document.getElementById(loadingId).remove();
      msgEl.insertAdjacentHTML('beforeend', `<div class="chat-msg"><img class="chat-msg-avatar" src="${char?.avatar || ''}" onerror="this.style.display='none'"><div class="chat-msg-bubble">${Utils.escape(reply)}</div></div>`);
      msgEl.scrollTop = msgEl.scrollHeight;
    } catch (e) {
      document.getElementById(loadingId).remove();
      Utils.toast('错误: ' + e.message);
    }
  },

  /* ===================== 手机-论坛 ===================== */
  phoneForum() {
    const posts = Store.state.forumPosts;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">论坛</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.forumNew()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        ${posts.length > 0 ? posts.map(p => `
          <div class="card card-tap" onclick="Router.go('/phone/forum/${p.id}')">
            <div class="card-title">${Utils.icon('users')} ${Utils.escape(p.title)}</div>
            <p class="text-sm text-muted">${Utils.escape(p.content?.substring(0, 60) || '')}...</p>
            <div class="flex justify-between mt-1">
              <span class="tag">${Utils.escape(p.author || '匿名')}</span>
              <span class="text-xs text-muted">${Utils.dateShort(p.timestamp)} · ${p.replies?.length || 0}回复</span>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('users') + '<p>暂无帖子</p></div>'}
      </div>
    `);
  },

  async forumNew() {
    const form = await Utils.formModal('发帖', [
      { key: 'title', label: '标题', placeholder: '帖子标题' },
      { key: 'content', label: '内容', type: 'textarea', placeholder: '帖子内容...' },
      { key: 'author', label: '作者', placeholder: '你的名字' },
    ]);
    if (!form || !form.title) return;
    Store.state.forumPosts.push({ id: Utils.uid(), ...form, replies: [], timestamp: Date.now() });
    Store.save();
    Utils.toast('已发布');
    this.phoneForum();
  },

  /* ===================== 手机-邮箱 ===================== */
  phoneMail() {
    const emails = Store.state.emails;
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">邮箱</span>
      </div>
      <div class="page">
        ${emails.length > 0 ? emails.map(e => `
          <div class="card card-tap">
            <div class="flex justify-between">
              <span class="card-title" style="margin:0">${Utils.icon('bell')} ${Utils.escape(e.subject)}</span>
              ${!e.read ? '<span class="tag tag-gold">新</span>' : ''}
            </div>
            <p class="text-sm text-muted mt-1">来自: ${Utils.escape(e.from || '系统')}</p>
            <p class="text-sm mt-1">${Utils.escape(e.content?.substring(0, 80) || '')}</p>
            <span class="text-xs text-muted">${Utils.timeFmt(e.timestamp)}</span>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('bell') + '<p>收件箱为空</p></div>'}
        <button class="btn btn-sm btn-block mt-2" onclick="Pages2.mailGenerate()">${Utils.icon('bot')} AI生成邮件</button>
      </div>
    `);
  },

  async mailGenerate() {
    if (!Store.state.apis.assistant.url) { Utils.toast('请先配置助手API'); return; }
    Utils.toast('AI 生成中...');
    try {
      const game = Store.state.currentGame;
      const system = `你是邮件生成器。根据游戏世界观生成一封邮件。返回JSON：{from, subject, content}`;
      const result = await AI.generate(`世界观：${game?.worldview?.setting || '现代'}\n请生成一封有趣的邮件。`, { system, maxTokens: 300 });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        Store.state.emails.unshift({ id: Utils.uid(), ...data, read: false, timestamp: Date.now() });
        Store.save();
        Utils.toast('收到新邮件');
        this.phoneMail();
      }
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  /* ===================== 使用教程 ===================== */
  tutorial() {
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/settings')">${Utils.icon('back')}</button>
        <span class="topbar-title">使用教程</span>
      </div>
      <div class="page">
        <div class="card">
          <div class="card-title">${Utils.icon('play')} 快速开始</div>
          <h4 style="margin:12px 0 6px;color:var(--gold)">第一步：配置API</h4>
          <p class="text-sm" style="line-height:1.8">
            1. 进入「设置 → API配置」<br>
            2. 填入API地址（如 OpenAI、DeepSeek、智谱等）<br>
            3. 填入密钥和模型名<br>
            4. 点击「测试连接」确认可用<br>
            <span class="text-muted">提示：助手API可单独配置，用于AI辅助功能</span>
          </p>
          
          <h4 style="margin:16px 0 6px;color:var(--gold)">第二步：创建新游戏</h4>
          <p class="text-sm" style="line-height:1.8">
            1. 回到首页，点击「新游戏」<br>
            2. 输入世界观描述（可简短，AI会帮你扩展）<br>
            3. 选择或创建用户面具（你扮演的角色）<br>
            4. 设置主要角色（可AI辅助生成）
          </p>
          
          <h4 style="margin:16px 0 6px;color:var(--gold)">第三步：添加素材</h4>
          <p class="text-sm" style="line-height:1.8">
            1. 进入「素材库」上传立绘、背景、音乐<br>
            2. 支持URL、文件上传、批量导入<br>
            3. 在视觉小说模式中选择使用
          </p>
          
          <h4 style="margin:16px 0 6px;color:var(--gold)">第四步：开始游戏</h4>
          <p class="text-sm" style="line-height:1.8">
            1. 点击「视觉小说」进入沉浸模式<br>
            2. 选择背景和角色立绘<br>
            3. 发送消息或使用选项推进剧情<br>
            4. 随时存档，支持多存档
          </p>
        </div>

        <div class="card">
          <div class="card-title">${Utils.icon('book')} 功能说明</div>
          <p class="text-sm" style="line-height:1.8">
            <strong>视觉小说模式：</strong>全屏沉浸式，支持立绘、背景、音乐、打字机效果<br><br>
            <strong>闲聊模式：</strong>Markdown渲染，半身立绘，自由对话<br><br>
            <strong>地图系统：</strong>标点地图，可前往地点触发剧情<br><br>
            <strong>角色档案：</strong>百科式信息、关系图、记事册、秘密档案、背包<br><br>
            <strong>记忆系统：</strong>仿向量化召回，按分类管理，AI自动提取<br><br>
            <strong>世界书：</strong>常驻/关键词/深度三种注入模式<br><br>
            <strong>预设提示词：</strong>DIY创建或AI辅助生成<br><br>
            <strong>正则规则：</strong>去八股文、过滤多余内容<br><br>
            <strong>万能导入：</strong>智能扫描分类，自动导入<br><br>
            <strong>虚拟手机：</strong>微信聊天、论坛、邮箱、自制App<br><br>
            <strong>AI助手：</strong>万能助手，可生成代码/预设/角色等
          </p>
        </div>

        <div class="card">
          <div class="card-title">${Utils.icon('upload')} 部署到GitHub Pages</div>
          <p class="text-sm" style="line-height:1.8">
            <strong>方法一：手机部署（推荐）</strong><br>
            1. 在手机浏览器打开 GitHub<br>
            2. 创建新仓库（如 ai-visual-novel）<br>
            3. 上传所有文件（index.html + css/ + js/）<br>
            4. 进入仓库 Settings → Pages<br>
            5. Source 选择 main 分支，保存<br>
            6. 等待几分钟后即可访问<br><br>
            
            <strong>方法二：电脑部署</strong><br>
            1. 下载所有文件到电脑<br>
            2. git init && git add . && git commit<br>
            3. git push 到 GitHub 仓库<br>
            4. 在 Settings → Pages 开启<br><br>
            
            <strong>方法三：直接打开</strong><br>
            1. 将所有文件传到手机<br>
            2. 用浏览器直接打开 index.html<br>
            <span class="text-muted">注意：直接打开时部分功能可能受限</span>
          </p>
        </div>

        <div class="card">
          <div class="card-title">${Utils.icon('edit')} 修改指南</div>
          <p class="text-sm" style="line-height:1.8">
            <strong>修改样式：</strong>编辑 css/style.css 中的CSS变量<br>
            <strong>修改功能：</strong>编辑 js/pages.js 和 js/pages2.js<br>
            <strong>修改AI逻辑：</strong>编辑 js/ai.js<br>
            <strong>修改数据结构：</strong>编辑 js/store.js<br>
            <strong>添加新页面：</strong>在 router.js 注册路由，在 pages.js 添加渲染函数<br><br>
            <span class="text-muted">建议先备份再修改。也可以让AI助手帮你修改代码。</span>
          </p>
        </div>
      </div>
    `);
  },
};

// 合并到 Pages
Object.assign(Pages, Pages2);
