/* ============================================================
   pages2.js - 扩展页面 v7
   页面：assistant/memory/worldbook/presets/regex/import/relations/
         storyline/interactions/tutorial/phone/customUI
   核心：AI助手增强、关系图、虚拟手机、万能导入、世界记事
   ============================================================ */

const Pages2 = {

  /* ===================== AI 助手 (增强版) ===================== */
  assistant() {
    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">AI 助手</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.assistantUploadFile()" title="上传源文件">${Utils.icon('upload')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.assistantSettings()" title="助手设置">${Utils.icon('settings')}</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;height:calc(100vh - var(--header-h))">
        <div id="assistant-messages" style="flex:1;overflow-y:auto;padding:16px;padding-bottom:80px">
          <div class="chat-msg">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px">${Utils.icon('bot')}</div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;max-width:85%;font-size:0.85rem;line-height:1.6">
              <p>你好！我是万能AI助手。我可以帮你：</p>
              <ul style="padding-left:20px;margin:8px 0">
                <li>上传源代码文件并读取修改</li>
                <li>根据描述生成新功能/新页面代码</li>
                <li>制作预设提示词和正则规则</li>
                <li>生成角色/世界观/场景</li>
                <li>分析项目结构并给出建议</li>
                <li>自动修改代码并导入应用</li>
              </ul>
              <p class="text-sm text-muted">上传源文件让我读取，或直接输入你的需求。</p>
            </div>
          </div>
        </div>
        <div class="chat-input-bar">
          <input class="input" id="assistant-input" placeholder="输入你的需求..." style="flex:1" onkeydown="if(event.key==='Enter')Pages2.assistantSend()">
          <button class="btn btn-primary btn-icon" onclick="Pages2.assistantSend()">${Utils.icon('send')}</button>
        </div>
      </div>
    `);
    const msgEl = document.getElementById('assistant-messages');
    if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;
  },

  _assistantContext: '',
  _assistantFiles: [],

  async assistantUploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json,.csv,.html,.css,.js,.doc,.docx';
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result.substring(0, 8000);
          this._assistantFiles.push({ name: file.name, content, size: file.size });
          this._assistantContext = this._assistantFiles.map(f => `--- ${f.name} ---\n${f.content.substring(0, 3000)}`).join('\n\n');
          Utils.toast(`已读取: ${file.name}`);
          const msgEl = document.getElementById('assistant-messages');
          if (msgEl) {
            msgEl.insertAdjacentHTML('beforeend', `
              <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
                <div style="background:linear-gradient(135deg,var(--gold),var(--gold-deep));color:#fff;border-radius:var(--radius-md);padding:8px 12px;font-size:0.8rem;max-width:80%">
                  已上传: ${Utils.escape(file.name)} (${Math.round(file.size / 1024)}KB)
                </div>
              </div>
            `);
            msgEl.scrollTop = msgEl.scrollHeight;
          }
        };
        reader.readAsText(file);
      });
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
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <div style="background:linear-gradient(135deg,var(--gold),var(--gold-deep));color:#fff;border-radius:var(--radius-md);padding:8px 12px;font-size:0.8rem;max-width:80%;word-break:break-word">
          ${Utils.escape(text)}
        </div>
      </div>
    `);

    const loadingId = 'asst-loading-' + Date.now();
    msgEl.insertAdjacentHTML('beforeend', `
      <div style="display:flex;margin-bottom:8px" id="${loadingId}">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px">${Utils.icon('bot')}</div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px">
          <span class="spinner"></span>
        </div>
      </div>
    `);
    msgEl.scrollTop = msgEl.scrollHeight;

    try {
      const system = `你是万能前端开发助手，服务于AI视觉小说沙盒平台。你的任务：
1. 分析用户提供的源代码，给出修改建议
2. 根据需求生成完整的HTML/CSS/JS代码片段
3. 制作预设提示词（返回JSON格式）
4. 生成角色/世界观/场景（返回JSON格式）
5. 当用户要求修改代码时，返回修改后的完整代码
6. 使用CSS变量(--gold, --ink, --bg-base等)
7. 适配手机竖屏，宽度480px
8. 所有交互用onclick内联事件

如果返回代码，直接给出代码，不要用markdown包裹。
如果返回JSON，直接给出JSON，不要多余解释。`;

      const fullPrompt = this._assistantContext
        ? `项目文件内容：\n${this._assistantContext.substring(0, 4000)}\n\n用户需求：${text}\n\n当前项目结构：${JSON.stringify(Utils.summarizeProject())}`
        : text + '\n\n当前项目结构：' + JSON.stringify(Utils.summarizeProject());

      const result = await AI.gen(fullPrompt, { system, apiType: 'assistant', maxTokens: 4000, temperature: 0.7 });

      document.getElementById(loadingId).remove();

      // 检测类型
      const isHtml = /<[a-z][\s\S]*>/i.test(result) && result.includes('<');
      const isJs = /function\s|const\s|var\s|let\s/.test(result);
      const isCss = /\{[\s\S]*?\}/.test(result) && /[:;]/.test(result) && !isHtml;
      const isJson = (result.trim().startsWith('{') || result.trim().startsWith('[')) && !isHtml;

      if (isHtml || isJs || isCss) {
        // 代码 - 显示预览并询问导入
        const codeType = isHtml ? 'HTML' : isJs ? 'JavaScript' : 'CSS';
        msgEl.insertAdjacentHTML('beforeend', `
          <div style="display:flex;margin-bottom:8px">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px">${Utils.icon('bot')}</div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;max-width:90%;font-size:0.8rem;line-height:1.6">
              <p class="mb-2">已生成${codeType}代码，预览如下：</p>
              <textarea class="code-area" style="min-height:120px;margin-bottom:8px" readonly>${Utils.escape(result)}</textarea>
              <div class="flex gap-1">
                <button class="btn btn-sm btn-primary" onclick="Pages2.importAssistantCode(${JSON.stringify(result).replace(/'/g, "&#39;")})">${Utils.icon('import')} 导入应用</button>
                <button class="btn btn-sm" onclick="Pages2.applyCodeDirectly(${JSON.stringify(result).replace(/'/g, "&#39;")})">${Utils.icon('zap')} 直接应用</button>
                <button class="btn btn-sm" onclick="Utils.copyToClipboard(${JSON.stringify(result).replace(/'/g, "&#39;")})">${Utils.icon('copy')} 复制</button>
              </div>
            </div>
          </div>
        `);
      } else if (isJson) {
        msgEl.insertAdjacentHTML('beforeend', `
          <div style="display:flex;margin-bottom:8px">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px">${Utils.icon('bot')}</div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;max-width:90%;font-size:0.8rem;line-height:1.6">
              ${Utils.markdown(result)}
              <div class="flex gap-1 mt-2">
                <button class="btn btn-sm btn-primary" onclick="Pages2.importAssistantJson(${JSON.stringify(result).replace(/'/g, "&#39;")})">${Utils.icon('import')} 智能导入</button>
              </div>
            </div>
          </div>
        `);
      } else {
        msgEl.insertAdjacentHTML('beforeend', `
          <div style="display:flex;margin-bottom:8px">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:8px">${Utils.icon('bot')}</div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px;max-width:90%;font-size:0.85rem;line-height:1.6">
              ${Utils.markdown(result)}
            </div>
          </div>
        `);
      }
      msgEl.scrollTop = msgEl.scrollHeight;
    } catch (e) {
      document.getElementById(loadingId).remove();
      Utils.toast('错误: ' + e.message);
    }
  },

  async importAssistantCode(code) {
    const ok = await Utils.confirm('导入代码', '将此代码作为自制App导入到虚拟手机中？', '导入', '取消');
    if (!ok) return;
    const name = await Utils.prompt('App名称', '输入自制App名称', '自制App');
    if (!name) return;
    Store.addCustomApp({ name, code, createdAt: Date.now() });
    Utils.toast('已导入到虚拟手机');
  },

  async applyCodeDirectly(code) {
    const ok = await Utils.confirm('直接应用', '将代码直接插入到当前页面？这可能会影响现有功能。', '应用', '取消');
    if (!ok) return;
    // 将代码包装为自制App并执行
    const div = document.createElement('div');
    div.innerHTML = code;
    document.getElementById('app').appendChild(div);
    Utils.toast('代码已应用');
  },

  async importAssistantJson(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data)) {
        data.forEach(item => Pages2._autoImportData(item));
      } else {
        Pages2._autoImportData(data);
      }
      Utils.toast('导入完成');
    } catch (e) {
      Utils.toast('解析失败: ' + e.message);
    }
  },

  _autoImportData(data) {
    if (!data) return;
    if (data.name && (data.personality || data.age || data.gender)) {
      Store.addCharacter({ ...data, role: data.role || 'npc' });
      Utils.toast('角色已导入: ' + data.name);
    } else if (data.title && data.setting) {
      if (!Store.state.currentGame) Store.state.currentGame = {};
      Store.state.currentGame.worldview = data;
      Store.save();
      Utils.toast('世界观已导入');
    } else if (data.content && (data.type === 'always' || data.type === 'keyword' || data.type === 'depth')) {
      Store.addWorldBookEntry(data);
      Utils.toast('世界书已导入');
    } else if (data.content && data.name) {
      Store.addPreset({ name: data.name, content: data.content, type: data.presetType || 'custom' });
      Utils.toast('预设已导入');
    } else {
      Utils.toast('未识别的数据类型');
    }
  },

  assistantSettings() {
    const a = Store.state.apis.assistant;
    Utils.drawer('助手API设置', `
      <div class="field"><label class="label">API地址</label><input class="input" id="asst-url" value="${a.url || ''}" placeholder="https://api.openai.com/v1"></div>
      <div class="field"><label class="label">密钥</label><input class="input" id="asst-key" type="password" value="${a.key || ''}" placeholder="sk-..."></div>
      <div class="field"><label class="label">模型</label><input class="input" id="asst-model" value="${a.model || ''}" placeholder="gpt-3.5-turbo"></div>
      <button class="btn btn-primary btn-block" onclick="Pages2.saveAssistantSettings()">保存</button>
    `);
  },

  saveAssistantSettings() {
    Store.state.apis.assistant.url = document.getElementById('asst-url').value;
    Store.state.apis.assistant.key = document.getElementById('asst-key').value;
    Store.state.apis.assistant.model = document.getElementById('asst-model').value;
    Store.save();
    Utils.toast('助手API已保存');
    document.querySelectorAll('.drawer-overlay').forEach(d => d.remove());
  },

  /* ===================== 记忆系统 ===================== */
  memory() {
    const cat = Store.state._memFilter || '';
    const memories = cat ? Store.state.memories.filter(m => m.category === cat) : Store.state.memories;
    const cats = Store.state.memoryCats;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">记忆库</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.memoryAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.memorySummarize()">${Utils.icon('refresh')}</button>
        </div>
      </div>
      <div class="page">
        <div class="segmented mb-2">
          <div class="segmented-item ${!cat ? 'active' : ''}" onclick="Pages2._memFilter('')">全部</div>
          ${cats.map(c => `<div class="segmented-item ${cat === c.id ? 'active' : ''}" onclick="Pages2._memFilter('${c.id}')">${Utils.escape(c.name)}</div>`).join('')}
        </div>
        <div id="mem-list">
          ${Pages2._memListHtml(memories)}
        </div>
      </div>
    `, 'home');
  },

  _memListHtml(memories) {
    if (!memories.length) return `<div class="empty-state">${Utils.icon('brain')}<p>暂无记忆</p></div>`;
    return memories.map(m => {
      const cat = Store.state.memoryCats.find(c => c.id === m.category);
      return `
        <div class="card">
          <div class="flex justify-between items-center">
            <span class="tag" style="${cat ? `background:${cat.color}20;color:${cat.color};border-color:${cat.color}` : ''}">${Utils.escape(cat?.name || '其他')}</span>
            <span class="text-xs text-muted">${Utils.timeFmt(m.timestamp)}</span>
          </div>
          <p class="text-sm mt-1" style="line-height:1.6">${Utils.escape(m.content)}</p>
          ${m.source === 'ai' ? '<span class="tag tag-gold mt-1">AI提取</span>' : ''}
          <div class="flex gap-1 mt-2">
            <button class="btn btn-sm" onclick="Pages2.memoryEdit('${m.id}')">${Utils.icon('edit')}</button>
            <button class="btn btn-sm btn-danger" onclick="Pages2.memoryDelete('${m.id}')">${Utils.icon('trash')}</button>
          </div>
        </div>
      `;
    }).join('');
  },

  _memFilter(category) {
    Store.state._memFilter = category;
    Store.save();
    this.memory();
  },

  async memoryAdd() {
    const cats = Store.state.memoryCats;
    const form = await Utils.formModal('添加记忆', [
      { key: 'content', label: '记忆内容', type: 'textarea', placeholder: '记忆内容...' },
      { key: 'category', label: '分类', type: 'select', options: cats.map(c => ({ value: c.id, label: c.name })) },
      { key: 'context', label: '上下文', placeholder: '相关上下文（可选）' },
    ]);
    if (!form || !form.content) return;
    Store.addMem({ content: form.content, category: form.category, context: form.context, source: 'manual' });
    Utils.toast('已添加');
    this.memory();
  },

  async memoryEdit(id) {
    const m = Store.state.memories.find(x => x.id === id);
    if (!m) return;
    const cats = Store.state.memoryCats;
    const form = await Utils.formModal('编辑记忆', [
      { key: 'content', label: '记忆内容', type: 'textarea', placeholder: m.content },
      { key: 'category', label: '分类', type: 'select', options: cats.map(c => ({ value: c.id, label: c.name })) },
    ], m);
    if (!form) return;
    Object.assign(m, form);
    Store.save();
    Utils.toast('已保存');
    this.memory();
  },

  memoryDelete(id) {
    Store.state.memories = Store.state.memories.filter(m => m.id !== id);
    Store.save();
    this.memory();
  },

  async memorySummarize() {
    Utils.toast('AI 总结中...');
    try {
      const result = await Memory.summarize();
      Utils.drawer('记忆总结', `<div style="line-height:1.8">${Utils.markdown(result)}</div>`);
    } catch (e) {
      Utils.toast('错误: ' + e.message);
    }
  },

  /* ===================== 世界书 ===================== */
  worldbook() {
    const entries = Store.state.worldBook;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">世界书</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.wbAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.wbImport()">${Utils.icon('upload')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p><strong>常驻注入：</strong>每次对话都会注入系统提示</p>
          <p><strong>关键词触发：</strong>用户输入匹配关键词时注入</p>
          <p><strong>深度注入：</strong>在对话特定深度位置插入</p>
        </div>
        ${entries.length > 0 ? entries.map(e => `
          <div class="card">
            <div class="flex justify-between items-center">
              <div class="card-title" style="margin:0">${Utils.icon('book')} ${Utils.escape(e.name)}</div>
              <span class="tag ${e.type === 'always' ? 'tag-gold' : e.type === 'keyword' ? 'tag-success' : 'tag-danger'}">
                ${e.type === 'always' ? '常驻' : e.type === 'keyword' ? '关键词' : '深度'}
              </span>
            </div>
            <p class="text-sm mt-1 text-muted" style="line-height:1.6">${Utils.escape(e.content?.substring(0, 100) || '')}...</p>
            ${e.keywords ? `<div class="mt-1">${e.keywords.split(/[,，]/).map(k => `<span class="tag">${Utils.escape(k.trim())}</span>`).join(' ')}</div>` : ''}
            <div class="flex gap-1 mt-2">
              <button class="btn btn-sm" onclick="Pages2.wbEdit('${e.id}')">${Utils.icon('edit')}</button>
              <button class="btn btn-sm" onclick="Pages2.wbBind('${e.id}')">${Utils.icon('link')} 绑定</button>
              <button class="btn btn-sm btn-danger" onclick="Pages2.wbDelete('${e.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('book') + '<p>暂无世界书条目</p></div>'}
      </div>
    `, 'home');
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
      { key: 'depth', label: '深度(0-10)', placeholder: '0', type: 'number' },
    ]);
    if (!form || !form.name) return;
    Store.addWb(form);
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
      { key: 'depth', label: '深度(0-10)', placeholder: String(entry.depth || 0), type: 'number' },
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

  async wbBind(id) {
    const entry = Store.state.worldBook.find(e => e.id === id);
    if (!entry) return;
    const ok = await Utils.confirm('绑定到对话', `将"${entry.name}"绑定到当前对话？每次对话会自动注入此条目。`, '绑定', '取消');
    if (!ok) return;
    Store.state.settings.activeWorldBook = Store.state.settings.activeWorldBook || [];
    if (!Store.state.settings.activeWorldBook.includes(id)) {
      Store.state.settings.activeWorldBook.push(id);
      Store.save();
    }
    Utils.toast('已绑定');
  },

  async wbImport() {
    const text = await Utils.prompt('导入世界书', '粘贴酒馆AI格式的世界书JSON或文本', '');
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach(item => Store.addWb({ name: item.name || '条目', content: item.content || item.entry || '', type: item.type || 'keyword', keywords: item.keywords || '' }));
        Utils.toast(`导入 ${data.length} 条世界书`);
      } else if (data.entries) {
        data.entries.forEach(item => Store.addWb({ name: item.name || '条目', content: item.content || '', type: item.type || 'keyword', keywords: item.keywords || '' }));
        Utils.toast(`导入 ${data.entries.length} 条世界书`);
      }
      this.worldbook();
    } catch (e) {
      Utils.toast('解析失败，请检查格式');
    }
  },

  /* ===================== 预设提示词 ===================== */
  presets() {
    const presets = Store.state.presets;
    const cats = ['custom', 'memory_extract', 'memory_summarize', 'character_gen', 'worldview_gen', 'regex_gen'];
    const catNames = { custom: '通用', memory_extract: '记忆提取', memory_summarize: '记忆总结', character_gen: '角色生成', worldview_gen: '世界观生成', regex_gen: '正则生成' };
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">预设提示词</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.presetAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.presetAiGen()">${Utils.icon('bot')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.presetImport()">${Utils.icon('upload')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p>预设是对话的系统提示词，可控制AI的文风、角色、行为等。激活的预设会自动注入到每次对话中。</p>
        </div>
        ${cats.map(cat => {
          const catPresets = presets.filter(p => p.type === cat);
          if (!catPresets.length) return '';
          return `
            <div class="ink-divider"><span>${catNames[cat] || cat}</span></div>
            ${catPresets.map(p => `
              <div class="card">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="card-title" style="margin:0">${Utils.icon('edit')} ${Utils.escape(p.name)}</div>
                    ${p.autoImport ? '<span class="tag tag-gold">自动导入</span>' : ''}
                  </div>
                  <div class="flex gap-1">
                    <button class="btn btn-sm ${Store.state.settings.activePreset === p.id ? 'btn-primary' : ''}" onclick="Pages2.presetActivate('${p.id}')">${Store.state.settings.activePreset === p.id ? '已激活' : '激活'}</button>
                    <button class="btn btn-sm" onclick="Pages2.presetEdit('${p.id}')">${Utils.icon('edit')}</button>
                    <button class="btn btn-sm btn-danger" onclick="Pages2.presetDelete('${p.id}')">${Utils.icon('trash')}</button>
                  </div>
                </div>
                <p class="text-sm mt-1 text-muted" style="line-height:1.6;max-height:60px;overflow:hidden">${Utils.escape(p.content?.substring(0, 120) || '')}...</p>
              </div>
            `).join('')}
          `;
        }).join('')}
        ${!presets.length ? '<div class="empty-state">' + Utils.icon('edit') + '<p>暂无预设</p><p class="text-xs">点击右上角创建，或让AI帮你生成</p></div>' : ''}
      </div>
    `, 'home');
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
        { value: 'regex_gen', label: '正则生成' },
      ]},
      { key: 'content', label: '提示词内容', type: 'textarea', placeholder: '输入系统提示词...' },
      { key: 'autoImport', label: '自动导入', type: 'checkbox' },
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
        { value: 'regex_gen', label: '正则生成' },
      ]},
      { key: 'content', label: '提示词内容', type: 'textarea', placeholder: preset.content || '' },
      { key: 'autoImport', label: '自动导入', type: 'checkbox' },
    ], preset);
    if (!form) return;
    Object.assign(preset, form);
    Store.save();
    Utils.toast('已保存');
    this.presets();
  },

  presetDelete(id) {
    Store.deletePreset(id);
    if (Store.state.settings.activePreset === id) Store.state.settings.activePreset = null;
    this.presets();
  },

  presetActivate(id) {
    Store.state.settings.activePreset = Store.state.settings.activePreset === id ? null : id;
    Store.save();
    Utils.toast(Store.state.settings.activePreset === id ? '预设已激活' : '预设已取消激活');
    this.presets();
  },

  async presetAiGen() {
    const desc = await Utils.prompt('AI生成预设', '描述你想要的预设效果\n如：让AI用古风文言文风格叙事', '');
    if (!desc) return;
    Utils.toast('AI 生成中...');
    try {
      const system = '你是提示词工程专家。根据用户描述生成一个完整的系统提示词。直接返回提示词内容，不要多余解释。';
      const result = await AI.gen(desc, { system, apiType: 'assistant', maxTokens: 1500 });
      Store.addPreset({ name: desc.substring(0, 20), content: result, type: 'custom' });
      Utils.toast('预设已生成');
      this.presets();
    } catch (e) {
      Utils.toast('错误: ' + e.message);
    }
  },

  async presetImport() {
    const text = await Utils.prompt('导入预设', '粘贴酒馆AI格式的预设JSON', '');
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        data.forEach(p => Store.addPreset({ name: p.name || '预设', content: p.content || p.prompt || '', type: p.type || 'custom' }));
        Utils.toast(`导入 ${data.length} 个预设`);
      } else {
        Store.addPreset({ name: data.name || '预设', content: data.content || data.prompt || '', type: data.type || 'custom' });
        Utils.toast('预设已导入');
      }
      this.presets();
    } catch (e) {
      Utils.toast('解析失败');
    }
  },

  /* ===================== 正则规则 ===================== */
  regex() {
    const rules = Store.state.regexRules;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">正则规则</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.regexAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.regexAddDefaults()">${Utils.icon('zap')}</button>
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
            <div class="flex gap-1 mt-2">
              <button class="btn btn-sm" onclick="Pages2.regexEdit('${r.id}')">${Utils.icon('edit')}</button>
              <button class="btn btn-sm btn-danger" onclick="Pages2.regexDelete('${r.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">${Utils.icon('refresh')}<p>暂无正则规则</p></div>
          <button class="btn btn-sm btn-block" onclick="Pages2.regexAddDefaults()">一键添加常用规则</button>
        `}
      </div>
    `, 'home');
  },

  async regexAdd() {
    const form = await Utils.formModal('添加正则规则', [
      { key: 'name', label: '规则名称', placeholder: '如：去除思考标签' },
      { key: 'pattern', label: '正则模式', placeholder: '\\[思考\\].[\\s\\S]*?\\[/思考\\]' },
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
      { name: '去除markdown代码块标记', pattern: '```[a-z]*\\n', replacement: '', flags: 'g', enabled: false },
      { name: '去除多余空行', pattern: '\\n{3,}', replacement: '\\n\\n', flags: 'g', enabled: true },
      { name: '去除HTML标签', pattern: '<[^>]+>', replacement: '', flags: 'g', enabled: false },
      { name: '去除URL', pattern: 'https?://[^\\s]+', replacement: '[链接]', flags: 'g', enabled: false },
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
    if (rule) { rule.enabled = !rule.enabled; Store.save(); }
  },

  regexDelete(id) {
    Store.deleteRegexRule(id);
    this.regex();
  },

  /* ===================== 万能导入 ===================== */
  importPage() {
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">万能导入</span>
      </div>
      <div class="page">
        <div class="upload-zone" onclick="Pages2.importFile()">
          ${Utils.icon('upload')}
          <p>点击或拖拽文件到此处</p>
          <p class="text-xs text-muted mt-1">支持 .txt .md .json .csv .doc .docx</p>
        </div>
        <div class="ink-divider"><span>或粘贴文本</span></div>
        <textarea class="textarea" id="import-text" placeholder="粘贴角色卡、世界观、世界书等内容..." style="min-height:150px"></textarea>
        <button class="btn btn-primary btn-block mt-2" onclick="Pages2.importText()">${Utils.icon('import')} 智能扫描导入</button>
        
        <div class="ink-divider"><span>导入说明</span></div>
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
    `, 'home');
  },

  importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json,.csv,.doc,.docx';
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

    let items = this._smartParse(text);

    // AI辅助分析
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
          const result = await AI.gen(`请分析以下内容并提取数据：\n${text.substring(0, 3000)}`, { system, apiType: 'assistant', maxTokens: 2000 });
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
                <div class="list-item-desc"><span class="tag">${item.type}</span> ${Utils.escape(item.content?.substring(0, 50) || '')}</div>
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
      items.forEach(item => this._importItem(item));
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
          else if (d.content && d.name && d.type) items.push({ type: 'preset', ...d });
        });
      } else if (typeof data === 'object') {
        if (data.name && (data.personality || data.age)) items.push({ type: 'character', ...data });
        else if (data.title && data.setting) items.push({ type: 'worldview', ...data });
        else if (data.name && data.content) items.push({ type: 'worldbook', ...data });
        else if (data.entries && Array.isArray(data.entries)) {
          data.entries.forEach(e => items.push({ type: 'worldbook', ...e }));
        }
      }
    } catch (e) {
      // 纯文本解析
      const lines = text.split('\n').filter(l => l.trim());
      let currentItem = null;
      lines.forEach(line => {
        const trimmed = line.trim();
        // 角色检测
        if (/^角色[\s：:]|^姓名[\s：:]|^名字[\s：:]|^Name[\s：:]/i.test(trimmed)) {
          if (currentItem) items.push(currentItem);
          currentItem = { type: 'character', name: trimmed.split(/[:：]/)[1]?.trim() || '未知', content: '' };
        }
        // 世界观检测
        else if (/^世界观[\s：:]|^设定[\s：:]|^World[\s：:]/i.test(trimmed)) {
          if (currentItem) items.push(currentItem);
          currentItem = { type: 'worldview', title: trimmed.split(/[:：]/)[1]?.trim() || '世界观', setting: '' };
        }
        // 添加到当前
        else if (currentItem) {
          if (currentItem.type === 'character') currentItem.content += line + '\n';
          else if (currentItem.type === 'worldview') currentItem.setting += line + '\n';
        }
      });
      if (currentItem) items.push(currentItem);
    }
    return items;
  },

  _importItem(item) {
    if (!item) return;
    switch (item.type) {
      case 'character':
        Store.addCharacter({ ...item, role: item.role || 'npc' });
        break;
      case 'worldview':
        if (!Store.state.currentGame) Store.state.currentGame = {};
        Store.state.currentGame.worldview = { title: item.name || item.title || '世界观', setting: item.content || item.setting || '' };
        break;
      case 'worldbook':
        Store.addWorldBookEntry({ name: item.name || '条目', content: item.content || '', type: 'keyword', keywords: item.keywords || '' });
        break;
      case 'item': {
        const char = Store.state.characters[0];
        if (char) {
          Store.state.charInv[char.id] = Store.state.charInv[char.id] || [];
          Store.state.charInv[char.id].push({ id: Utils.uid(), name: item.name, count: item.count || 1, desc: item.content || '' });
        }
        break;
      }
      case 'preset':
        Store.addPreset({ name: item.name, content: item.content || '', type: 'custom' });
        break;
    }
  },

  /* ===================== 关系图 ===================== */
  relations() {
    const chars = Store.state.characters;
    const rels = Store.state.relations;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">关系图</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.relAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.relAiGen()">${Utils.icon('bot')}</button>
        </div>
      </div>
      <div class="page">
        <div class="card">
          <div class="card-title">${Utils.icon('users')} 角色关系图谱</div>
          <div id="relation-graph-container" style="margin-top:8px"></div>
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
    `, 'home');
    this._renderRelationGraph(chars, rels);
  },

  _renderRelationGraph(chars, rels) {
    const container = document.getElementById('relation-graph-container');
    if (!container) return;
    if (chars.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>暂无角色</p></div>';
      return;
    }

    const width = container.clientWidth || 320;
    const height = Math.min(350, width * 0.9);
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) / 2 - 50;

    // 角色位置 (圆形布局)
    const positions = chars.map((c, i) => {
      const angle = (i / chars.length) * Math.PI * 2 - Math.PI / 2;
      return { id: c.id, name: c.name, x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
    });

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:${height}px;cursor:grab">`;

    // 连线
    rels.forEach(r => {
      const p1 = positions.find(p => p.id === r.fromId);
      const p2 = positions.find(p => p.id === r.toId);
      if (p1 && p2) {
        const color = r.affinity > 50 ? '#C9A227' : r.affinity < 0 ? '#B22222' : '#8B7355';
        const strokeWidth = Math.max(1, Math.abs(r.affinity || 0) / 20);
        svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" opacity="0.5"/>`;
        // 关系标签
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        svg += `<rect x="${mx - 20}" y="${my - 8}" width="40" height="16" rx="4" fill="var(--bg-card)" opacity="0.9"/>`;
        svg += `<text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="9" fill="${color}">${Utils.escape(r.type || '')}</text>`;
      }
    });

    // 节点
    positions.forEach(p => {
      const char = chars.find(c => c.id === p.id);
      const avatar = char?.avatar || char?.portrait || '';
      svg += `<g class="relation-node" onclick="Router.go('/char/${p.id}')">`;
      svg += `<circle cx="${p.x}" cy="${p.y}" r="22" fill="var(--bg-card)" stroke="var(--gold)" stroke-width="2"/>`;
      if (avatar) {
        svg += `<image href="${avatar}" x="${p.x - 18}" y="${p.y - 18}" width="36" height="36" clip-path="circle(18px at 18px 18px)" preserveAspectRatio="xMidYMid slice"/>`;
      } else {
        svg += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="14" fill="var(--gold)" font-weight="bold">${Utils.escape(p.name?.charAt(0) || '?')}</text>`;
      }
      svg += `<text x="${p.x}" y="${p.y + 36}" text-anchor="middle" font-size="10" fill="var(--ink-light)">${Utils.escape(p.name || '')}</text>`;
      svg += `</g>`;
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
      { key: 'affinity', label: '好感度(-100~100)', placeholder: '0', type: 'number' },
    ]);
    if (!form || !form.fromId || !form.toId) return;
    form.affinity = parseInt(form.affinity) || 0;
    Store.addRelation(form);
    Utils.toast('已添加');
    this.relations();
  },

  async relAiGen() {
    const chars = Store.state.characters;
    if (chars.length < 2) { Utils.toast('至少需要2个角色'); return; }
    Utils.toast('AI分析关系中...');
    try {
      const system = '你是关系分析专家。根据提供的角色列表，分析他们之间的关系。返回JSON数组：[{fromId,toId,type,affinity}]，type是关系描述，affinity是-100到100的好感度。';
      const charData = chars.map(c => ({ id: c.id, name: c.name, personality: c.personality, backstory: c.backstory }));
      const result = await AI.gen(`角色列表：\n${JSON.stringify(charData)}`, { system, apiType: 'assistant', maxTokens: 1000 });
      const match = result.match(/\[[\s\S]*\]/);
      if (match) {
        const rels = JSON.parse(match[0]);
        rels.forEach(r => {
          if (r.fromId && r.toId && r.type) Store.addRelation(r);
        });
        Utils.toast(`生成 ${rels.length} 条关系`);
        this.relations();
      }
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  relDelete(id) {
    Store.deleteRelation(id);
    this.relations();
  },

  /* ===================== 剧情线 ===================== */
  storyline() {
    const lines = Store.state.storylines;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">剧情线</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.storyAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.storyAiGen()">${Utils.icon('bot')}</button>
        </div>
      </div>
      <div class="page">
        ${lines.length > 0 ? lines.map(l => `
          <div class="story-card">
            <span class="tag ${l.type === 'main' ? 'tag-gold' : 'tag-success'} story-type-tag">${l.type === 'main' ? '主线' : '支线'}</span>
            <div class="card-title" style="margin-top:8px">${Utils.escape(l.name)}</div>
            <p class="text-sm mt-1 text-muted">${Utils.escape(l.desc || '')}</p>
            <div class="story-progress-label">
              <span>进度</span>
              <span>${l.progress || 0}%</span>
            </div>
            <div class="progress-bar mt-1"><div class="progress-fill" style="width:${l.progress || 0}%"></div></div>
            <div class="flex gap-1 mt-2">
              <button class="btn btn-sm" onclick="Pages2.storyEdit('${l.id}')">${Utils.icon('edit')}</button>
              <button class="btn btn-sm btn-danger" onclick="Pages2.storyDelete('${l.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('book') + '<p>暂无剧情线</p></div>'}
      </div>
    `, 'home');
  },

  async storyAdd() {
    const form = await Utils.formModal('添加剧情线', [
      { key: 'name', label: '剧情名称', placeholder: '如：寻找失落的记忆' },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'main', label: '主线' },
        { value: 'side', label: '支线' },
      ]},
      { key: 'desc', label: '描述', type: 'textarea', placeholder: '剧情描述...' },
      { key: 'progress', label: '进度(%)', placeholder: '0-100', type: 'number' },
    ]);
    if (!form || !form.name) return;
    form.progress = Math.min(100, Math.max(0, parseInt(form.progress) || 0));
    Store.addStoryline(form);
    Utils.toast('已添加');
    this.storyline();
  },

  async storyEdit(id) {
    const line = Store.state.storylines.find(s => s.id === id);
    if (!line) return;
    const form = await Utils.formModal('编辑剧情线', [
      { key: 'name', label: '剧情名称', placeholder: line.name },
      { key: 'type', label: '类型', type: 'select', options: [
        { value: 'main', label: '主线' },
        { value: 'side', label: '支线' },
      ]},
      { key: 'desc', label: '描述', type: 'textarea', placeholder: line.desc || '' },
      { key: 'progress', label: '进度(%)', placeholder: String(line.progress || 0), type: 'number' },
    ], line);
    if (!form) return;
    form.progress = Math.min(100, Math.max(0, parseInt(form.progress) || 0));
    Object.assign(line, form);
    Store.save();
    Utils.toast('已保存');
    this.storyline();
  },

  async storyAiGen() {
    const desc = await Utils.prompt('AI生成剧情线', '描述你想要的剧情主题', '');
    if (!desc) return;
    Utils.toast('AI生成中...');
    try {
      const system = '你是剧情设计专家。根据描述生成剧情线JSON：{name,type(main/side),desc,progress}。不要限定任何世界观。';
      const result = await AI.gen(desc, { system, apiType: 'assistant', maxTokens: 600 });
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        data.progress = data.progress || 0;
        Store.addStoryline(data);
        Utils.toast('剧情线已生成');
        this.storyline();
      }
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  storyDelete(id) {
    Store.deleteStoryline(id);
    this.storyline();
  },

  /* ===================== 沉浸式场景 ===================== */
  interactions() {
    const interactions = Store.state.interactions;
    Router.nav(`
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
          <p>沉浸式场景是自定义的互动场景，由你自己创建或AI生成。点击场景即可进入视觉小说模式。</p>
        </div>
        ${interactions.length > 0 ? interactions.map(i => `
          <div class="card card-tap" onclick="Pages2.interactionPlay('${i.id}')">
            <div class="card-title">${Utils.icon('star')} ${Utils.escape(i.name)}</div>
            <p class="text-sm text-muted">${Utils.escape(i.desc?.substring(0, 80) || '')}</p>
            <div class="flex gap-1 mt-2">
              <button class="btn btn-sm" onclick="event.stopPropagation();Pages2.interactionEdit('${i.id}')">${Utils.icon('edit')}</button>
              <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();Pages2.interactionDelete('${i.id}')">${Utils.icon('trash')}</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('star') + '<p>暂无场景</p></div>'}
      </div>
    `, 'home');
  },

  async interactionAdd() {
    const form = await Utils.formModal('创建场景', [
      { key: 'name', label: '场景名称', placeholder: '如：月下对弈' },
      { key: 'desc', label: '场景描述', type: 'textarea', placeholder: '描述场景的情境...' },
      { key: 'prompt', label: 'AI提示词', type: 'textarea', placeholder: '告诉AI如何推进这个场景...' },
    ]);
    if (!form || !form.name) return;
    Store.state.interactions.push({ id: Utils.uid(), ...form, createdAt: Date.now() });
    Store.save();
    Utils.toast('已创建');
    this.interactions();
  },

  async interactionAiGen() {
    const desc = await Utils.prompt('AI生成场景', '描述你想要的场景\n如：一个在雨夜的密谈场景', '');
    if (!desc) return;
    Utils.toast('AI生成中...');
    try {
      const system = '你是场景设计师。根据用户描述生成沉浸式互动场景JSON：{name,desc,prompt}。不要限定任何世界观。';
      const result = await AI.gen(desc, { system, apiType: 'assistant', maxTokens: 600 });
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        Store.state.interactions.push({ id: Utils.uid(), ...data, createdAt: Date.now() });
        Store.save();
        Utils.toast('场景已生成');
        this.interactions();
      }
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  interactionPlay(id) {
    const interaction = Store.state.interactions.find(i => i.id === id);
    if (!interaction) return;
    Pages._vnCurrentChar = Store.state.characters[0];
    Router.go('/vn');
    setTimeout(() => {
      const inp = document.getElementById('vn-input');
      if (inp) {
        inp.value = interaction.prompt || interaction.desc || '';
        Pages.vnSend();
      }
    }, 600);
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
    Router.nav(`
      <div class="topbar">
        <span class="topbar-title">虚拟手机</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.phoneAddApp()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        <div class="ink-divider"><span>内置应用</span></div>
        <div class="phone-app-grid">
          <div class="card-tap" onclick="Router.go('/phone/chat')">
            <div class="phone-app-icon" style="background:linear-gradient(135deg,#07C160,#06AD56)">${Utils.icon('chat')}</div>
            <span class="phone-app-name">聊天</span>
          </div>
          <div class="card-tap" onclick="Router.go('/phone/forum')">
            <div class="phone-app-icon" style="background:linear-gradient(135deg,#FF6B35,#F7931E)">${Utils.icon('users')}</div>
            <span class="phone-app-name">论坛</span>
          </div>
          <div class="card-tap" onclick="Router.go('/phone/mail')">
            <div class="phone-app-icon" style="background:linear-gradient(135deg,#4A90D9,#357ABD)">${Utils.icon('mail')}</div>
            <span class="phone-app-name">邮箱</span>
          </div>
          <div class="card-tap" onclick="Router.go('/phone/baike')">
            <div class="phone-app-icon" style="background:linear-gradient(135deg,#8B4513,#A0522D)">${Utils.icon('book')}</div>
            <span class="phone-app-name">百科</span>
          </div>
          <div class="card-tap" onclick="Router.go('/settings')">
            <div class="phone-app-icon" style="background:linear-gradient(135deg,#8B7355,#6B5344)">${Utils.icon('settings')}</div>
            <span class="phone-app-name">设置</span>
          </div>
          <div class="card-tap" onclick="Router.go('/assistant')">
            <div class="phone-app-icon" style="background:linear-gradient(135deg,var(--gold),var(--gold-deep))">${Utils.icon('bot')}</div>
            <span class="phone-app-name">AI助手</span>
          </div>
        </div>

        ${apps.length > 0 ? `
          <div class="ink-divider"><span>自制应用</span></div>
          <div class="phone-app-grid">
            ${apps.map(app => `
              <div class="card-tap" onclick="Pages2.phoneRunApp('${app.id}')">
                <div class="phone-app-icon" style="background:linear-gradient(135deg,${Utils.randomColor()},${Utils.randomColor()})">${Utils.icon('play')}</div>
                <span class="phone-app-name">${Utils.escape(app.name)}</span>
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
          <iframe srcdoc="${Utils.escape(app.code).replace(/"/g, '&quot;')}" sandbox="allow-scripts allow-same-origin" style="width:100%;height:100%;border:none;background:#fff"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  },

  /* ===================== 手机-聊天(微信风格) ===================== */
  phoneChat() {
    const chats = Store.state.phoneChats;
    const chars = Store.state.characters;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">聊天</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.phoneChatNew()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page" style="padding-bottom:0">
        ${chats.length > 0 ? chats.map(c => {
          const char = chars.find(ch => ch.id === c.charId);
          return `
            <div class="list-item" onclick="Router.go('/phone/chat/${c.id}')">
              <img src="${char?.avatar || char?.portrait || ''}" onerror="this.style.background='var(--bg-deep)'" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0">
              <div class="list-item-content">
                <div class="list-item-title">${Utils.escape(char?.name || c.name || '未知')}</div>
                <div class="list-item-desc">${Utils.escape(c.messages?.[c.messages.length - 1]?.content?.substring(0, 30) || '开始聊天')}</div>
              </div>
              <span class="text-xs text-muted">${Utils.dateShort(c.timestamp)}</span>
            </div>
          `;
        }).join('') : '<div class="empty-state">' + Utils.icon('chat') + '<p>暂无对话</p></div>'}
      </div>
    `, 'phone');
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
    const id = params[0] || params;
    const chat = Store.state.phoneChats.find(c => c.id === id);
    if (!chat) { Router.go('/phone/chat'); return; }
    const char = Store.state.characters.find(c => c.id === chat.charId);

    Router.renderFullscreen(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone/chat')">${Utils.icon('back')}</button>
        <span class="topbar-title">${Utils.escape(char?.name || '对话')}</span>
      </div>
      <div style="display:flex;flex-direction:column;height:calc(100vh - var(--header-h));background:var(--bg-base)">
        <div id="phone-chat-messages" style="flex:1;overflow-y:auto;padding:16px;padding-bottom:80px">
          ${chat.messages.length > 0 ? chat.messages.map(m => `
            <div style="display:flex;${m.role === 'user' ? 'justify-content:flex-end' : 'justify-content:flex-start'};margin-bottom:10px">
              ${m.role !== 'user' ? `<img src="${char?.avatar || ''}" onerror="this.style.display='none'" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-right:8px;flex-shrink:0">` : ''}
              <div class="wechat-bubble ${m.role === 'user' ? 'right' : 'left'}">
                ${Utils.escape(m.content)}
              </div>
            </div>
          `).join('') : '<div class="empty-state"><p>开始聊天</p></div>'}
        </div>
        <div class="chat-input-bar">
          <input class="input" id="phone-chat-input" placeholder="输入消息..." style="flex:1" onkeydown="if(event.key==='Enter')Pages2.phoneChatSend('${id}')">
          <button class="btn btn-primary btn-icon" onclick="Pages2.phoneChatSend('${id}')">${Utils.icon('send')}</button>
        </div>
      </div>
    `);
    const msgEl = document.getElementById('phone-chat-messages');
    if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;
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

    const msgEl = document.getElementById('phone-chat-messages');
    const char = Store.state.characters.find(c => c.id === chat.charId);
    msgEl.insertAdjacentHTML('beforeend', `
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
        <div class="wechat-bubble right">${Utils.escape(text)}</div>
      </div>
    `);

    const loadingId = 'pc-loading-' + Date.now();
    msgEl.insertAdjacentHTML('beforeend', `
      <div style="display:flex;justify-content:flex-start;margin-bottom:10px" id="${loadingId}">
        <img src="${char?.avatar || ''}" onerror="this.style.display='none'" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-right:8px;flex-shrink:0">
        <div class="wechat-bubble left"><span class="spinner"></span></div>
      </div>
    `);
    msgEl.scrollTop = msgEl.scrollHeight;

    try {
      const messages = [
        { role: 'system', content: `你是角色"${char?.name || 'NPC'}"，${char?.personality || ''}。你在即时聊天中，请用日常口语回复，不要太长。` },
        ...chat.messages.map(m => ({ role: m.role, content: m.content })),
      ];
      const reply = await AI.chat(messages, { maxTokens: 300 });
      chat.messages.push({ role: 'assistant', content: reply });
      Store.save();
      document.getElementById(loadingId).remove();
      msgEl.insertAdjacentHTML('beforeend', `
        <div style="display:flex;justify-content:flex-start;margin-bottom:10px">
          <img src="${char?.avatar || ''}" onerror="this.style.display='none'" style="width:36px;height:36px;border-radius:6px;object-fit:cover;margin-right:8px;flex-shrink:0">
          <div class="wechat-bubble left">${Utils.escape(reply)}</div>
        </div>
      `);
      msgEl.scrollTop = msgEl.scrollHeight;
    } catch (e) {
      document.getElementById(loadingId).remove();
      Utils.toast('错误: ' + e.message);
    }
  },

  /* ===================== 手机-论坛 ===================== */
  phoneForum() {
    const posts = Store.state.forumPosts;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">论坛</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.forumNew()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        ${posts.length > 0 ? posts.map(p => `
          <div class="forum-post card-tap" onclick="Pages2.forumDetail('${p.id}')">
            <div class="forum-post-title">${Utils.escape(p.title)}</div>
            <p class="text-sm text-muted">${Utils.escape(p.content?.substring(0, 60) || '')}...</p>
            <div class="forum-post-meta">
              <span class="tag">${Utils.escape(p.author || '匿名')}</span>
              <span>${Utils.dateShort(p.timestamp)} · ${p.replies?.length || 0}回复</span>
            </div>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('users') + '<p>暂无帖子</p></div>'}
      </div>
    `, 'phone');
  },

  forumDetail(postId) {
    const post = Store.state.forumPosts.find(p => p.id === postId);
    if (!post) return;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone/forum')">${Utils.icon('back')}</button>
        <span class="topbar-title">帖子详情</span>
      </div>
      <div class="page">
        <div class="forum-post">
          <div class="forum-post-title">${Utils.escape(post.title)}</div>
          <div class="forum-post-meta">
            <span class="tag">${Utils.escape(post.author || '匿名')}</span>
            <span>${Utils.timeFmt(post.timestamp)}</span>
          </div>
          <p class="text-sm mt-2" style="line-height:1.8">${Utils.escape(post.content)}</p>
        </div>
        <div class="ink-divider"><span>回复 (${post.replies?.length || 0})</span></div>
        ${(post.replies || []).map(r => `
          <div class="forum-reply">
            <div class="flex justify-between">
              <span class="text-sm font-bold">${Utils.escape(r.author || '匿名')}</span>
              <span class="text-xs text-muted">${Utils.dateShort(r.timestamp)}</span>
            </div>
            <p class="text-sm mt-1">${Utils.escape(r.content)}</p>
          </div>
        `).join('')}
        <div class="flex gap-1 mt-2">
          <input class="input" id="forum-reply-input" placeholder="输入回复..." style="flex:1" onkeydown="if(event.key==='Enter')Pages2.forumReply('${postId}')">
          <button class="btn btn-primary btn-icon" onclick="Pages2.forumReply('${postId}')">${Utils.icon('send')}</button>
        </div>
      </div>
    `, 'phone');
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

  forumReply(postId) {
    const input = document.getElementById('forum-reply-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    const post = Store.state.forumPosts.find(p => p.id === postId);
    if (!post) return;
    post.replies = post.replies || [];
    post.replies.push({ id: Utils.uid(), content: text, author: '我', timestamp: Date.now() });
    Store.save();
    this.forumDetail(postId);
  },

  /* ===================== 手机-邮箱 ===================== */
  phoneMail() {
    const emails = Store.state.emails;
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">邮箱</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.mailCompose()">${Utils.icon('plus')}</button>
        </div>
      </div>
      <div class="page">
        ${emails.length > 0 ? emails.map(e => `
          <div class="email-item ${!e.read ? '' : 'opacity-70'}" onclick="Pages2.mailRead('${e.id}')">
            ${!e.read ? '<div class="email-unread"></div>' : '<div style="width:8px;flex-shrink:0"></div>'}
            <div class="email-content">
              <div class="email-subject">${Utils.escape(e.subject)}</div>
              <div class="email-from">来自: ${Utils.escape(e.from || '系统')}</div>
              <div class="email-preview">${Utils.escape(e.content?.substring(0, 50) || '')}</div>
            </div>
            <span class="text-xs text-muted">${Utils.dateShort(e.timestamp)}</span>
          </div>
        `).join('') : '<div class="empty-state">' + Utils.icon('mail') + '<p>收件箱为空</p></div>'}
        <button class="btn btn-sm btn-block mt-2" onclick="Pages2.mailGenerate()">${Utils.icon('bot')} AI生成邮件</button>
      </div>
    `, 'phone');
  },

  mailRead(id) {
    const e = Store.state.emails.find(em => em.id === id);
    if (e) e.read = true;
    Store.save();
    Utils.drawer(e.subject, `
      <div class="text-sm text-muted mb-2">来自: ${Utils.escape(e.from || '系统')} · ${Utils.timeFmt(e.timestamp)}</div>
      <p style="line-height:1.8;font-size:0.85rem">${Utils.escape(e.content)}</p>
    `);
  },

  async mailCompose() {
    const form = await Utils.formModal('写邮件', [
      { key: 'to', label: '收件人', placeholder: '收件人' },
      { key: 'subject', label: '主题', placeholder: '邮件主题' },
      { key: 'content', label: '内容', type: 'textarea', placeholder: '邮件内容...' },
    ]);
    if (!form || !form.subject) return;
    Store.state.emails.unshift({ id: Utils.uid(), ...form, from: '我', read: true, timestamp: Date.now() });
    Store.save();
    Utils.toast('邮件已发送');
    this.phoneMail();
  },

  async mailGenerate() {
    if (!Store.state.apis.assistant.url) { Utils.toast('请先配置助手API'); return; }
    Utils.toast('AI 生成中...');
    try {
      const game = Store.state.currentGame;
      const system = '你是邮件生成器。根据游戏世界观生成一封有趣的邮件。返回JSON：{from, subject, content}。不要有特定世界观限制。';
      const result = await AI.gen(`世界观：${game?.worldview?.setting || '沙盒世界'}\n请生成一封有趣的邮件。`, { system, maxTokens: 600 });
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        Store.state.emails.unshift({ id: Utils.uid(), ...data, read: false, timestamp: Date.now() });
        Store.save();
        Utils.toast('收到新邮件');
        this.phoneMail();
      }
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  /* ===================== 手机-百科 ===================== */
  phoneBaike() {
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/phone')">${Utils.icon('back')}</button>
        <span class="topbar-title">百科</span>
      </div>
      <div class="page">
        <div class="card text-sm" style="background:var(--bg-deep)">
          <p>百科功能连接到百度百科，可以查询各种知识。</p>
        </div>
        <div class="field">
          <label class="label">搜索词条</label>
          <div class="flex gap-1">
            <input class="input" id="baike-input" placeholder="输入要查询的词条..." onkeydown="if(event.key==='Enter')Pages2.baikeSearch()">
            <button class="btn btn-primary" onclick="Pages2.baikeSearch()">${Utils.icon('search')}</button>
          </div>
        </div>
        <div id="baike-result"></div>
      </div>
    `, 'phone');
  },

  async baikeSearch() {
    const query = document.getElementById('baike-input').value.trim();
    if (!query) return;
    const resultEl = document.getElementById('baike-result');
    resultEl.innerHTML = '<div style="text-align:center;padding:20px"><span class="spinner spinner-lg"></span><p class="text-sm text-muted mt-2">查询中...</p></div>';
    try {
      // 使用百度搜索获取百科摘要
      const response = await fetch(`https://baike.baidu.com/item/${encodeURIComponent(query)}`);
      const html = await response.text();
      // 简单提取描述
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
      const desc = descMatch ? descMatch[1] : '暂无详细描述';
      resultEl.innerHTML = `
        <div class="card">
          <div class="card-title">${Utils.escape(query)}</div>
          <p class="text-sm" style="line-height:1.8">${Utils.escape(desc)}</p>
          <a href="https://baike.baidu.com/item/${encodeURIComponent(query)}" target="_blank" class="btn btn-sm btn-block mt-2">${Utils.icon('globe')} 查看完整百科</a>
        </div>
      `;
    } catch (e) {
      resultEl.innerHTML = `
        <div class="card">
          <p class="text-sm text-muted">查询失败，请直接访问百度百科。</p>
          <a href="https://baike.baidu.com/item/${encodeURIComponent(query)}" target="_blank" class="btn btn-sm btn-block mt-2">${Utils.icon('globe')} 访问百度百科</a>
        </div>
      `;
    }
  },

  /* ===================== 世界记事 ===================== */
  worldNotes() {
    const notes = Store.state.worldNotes || [];
    const cat = Store.state._worldNoteFilter || '';
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">世界记事</span>
        <div class="topbar-actions">
          <button class="btn btn-icon btn-ghost" onclick="Pages2.worldNoteAdd()">${Utils.icon('plus')}</button>
          <button class="btn btn-icon btn-ghost" onclick="Pages2.worldNoteAiSummarize()">${Utils.icon('refresh')}</button>
        </div>
      </div>
      <div class="page">
        <div class="segmented mb-2">
          <div class="segmented-item ${!cat ? 'active' : ''}" onclick="Pages2._worldNoteFilter('')">全部</div>
          <div class="segmented-item ${cat === 'event' ? 'active' : ''}" onclick="Pages2._worldNoteFilter('event')">事件</div>
          <div class="segmented-item ${cat === 'lore' ? 'active' : ''}" onclick="Pages2._worldNoteFilter('lore')">设定</div>
          <div class="segmented-item ${cat === 'plot' ? 'active' : ''}" onclick="Pages2._worldNoteFilter('plot')">剧情</div>
        </div>
        <div id="world-note-list">
          ${Pages2._worldNoteListHtml(notes, cat)}
        </div>
      </div>
    `, 'home');
  },

  _worldNoteListHtml(notes, cat) {
    const filtered = cat ? notes.filter(n => n.category === cat) : notes;
    if (!filtered.length) return '<div class="empty-state">' + Utils.icon('book') + '<p>暂无记事</p></div>';
    return filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map(n => `
      <div class="card">
        <div class="flex justify-between items-center">
          <span class="tag ${n.category === 'event' ? 'tag-gold' : n.category === 'lore' ? 'tag-success' : 'tag-info'}">${n.category === 'event' ? '事件' : n.category === 'lore' ? '设定' : '剧情'}</span>
          <span class="text-xs text-muted">${Utils.timeFmt(n.timestamp)}</span>
        </div>
        <p class="text-sm mt-1" style="line-height:1.6">${Utils.escape(n.content)}</p>
        <div class="flex gap-1 mt-2">
          <button class="btn btn-sm" onclick="Pages2.worldNoteEdit('${n.id}')">${Utils.icon('edit')}</button>
          <button class="btn btn-sm btn-danger" onclick="Pages2.worldNoteDelete('${n.id}')">${Utils.icon('trash')}</button>
        </div>
      </div>
    `).join('');
  },

  _worldNoteFilter(cat) {
    Store.state._worldNoteFilter = cat;
    Store.save();
    this.worldNotes();
  },

  async worldNoteAdd() {
    const form = await Utils.formModal('添加记事', [
      { key: 'content', label: '内容', type: 'textarea', placeholder: '记事内容...' },
      { key: 'category', label: '分类', type: 'select', options: [
        { value: 'event', label: '事件' },
        { value: 'lore', label: '设定' },
        { value: 'plot', label: '剧情' },
      ]},
    ]);
    if (!form || !form.content) return;
    Store.state.worldNotes = Store.state.worldNotes || [];
    Store.state.worldNotes.push({ id: Utils.uid(), ...form, timestamp: Date.now() });
    Store.save();
    Utils.toast('已添加');
    this.worldNotes();
  },

  async worldNoteEdit(id) {
    const note = (Store.state.worldNotes || []).find(n => n.id === id);
    if (!note) return;
    const form = await Utils.formModal('编辑记事', [
      { key: 'content', label: '内容', type: 'textarea', placeholder: note.content },
      { key: 'category', label: '分类', type: 'select', options: [
        { value: 'event', label: '事件' },
        { value: 'lore', label: '设定' },
        { value: 'plot', label: '剧情' },
      ]},
    ], note);
    if (!form) return;
    Object.assign(note, form);
    Store.save();
    Utils.toast('已保存');
    this.worldNotes();
  },

  worldNoteDelete(id) {
    Store.state.worldNotes = (Store.state.worldNotes || []).filter(n => n.id !== id);
    Store.save();
    this.worldNotes();
  },

  async worldNoteAiSummarize() {
    const notes = Store.state.worldNotes || [];
    if (!notes.length) { Utils.toast('暂无记事可总结'); return; }
    Utils.toast('AI总结中...');
    try {
      const content = notes.map(n => n.content).join('\n');
      const system = '请总结以下世界记事，提炼关键事件和设定。用简洁的Markdown格式。';
      const result = await AI.gen(content.substring(0, 2000), { system, maxTokens: 800 });
      Utils.drawer('世界记事总结', `<div style="line-height:1.8">${Utils.markdown(result)}</div>`);
    } catch (e) { Utils.toast('错误: ' + e.message); }
  },

  /* ===================== 自定义UI ===================== */
  customUI() {
    Router.nav(`
      <div class="topbar">
        <button class="btn btn-icon btn-ghost" onclick="Router.go('/')">${Utils.icon('back')}</button>
        <span class="topbar-title">自定义UI</span>
      </div>
      <div class="page">
        <div class="card">
          <div class="card-title">${Utils.icon('code')} 自定义CSS</div>
          <p class="text-sm text-muted mb-2">输入CSS代码自定义界面样式。支持CSS变量。</p>
          <textarea class="css-editor" id="custom-css-editor" placeholder="/* 自定义样式 */\n:root {\n  --gold: #ffaa00;\n}">${Utils.escape(Store.state.uiCustom.css || '')}</textarea>
          <div class="flex gap-1 mt-2">
            <button class="btn btn-primary flex-1" onclick="Pages2.applyCustomUI()">应用CSS</button>
            <button class="btn flex-1" onclick="Pages2.resetCustomUI()">重置</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title">${Utils.icon('palette')} 快速主题</div>
          <div class="flex gap-1 flex-wrap">
            <button class="btn btn-sm" onclick="Pages2.quickTheme('light')">古风墨境</button>
            <button class="btn btn-sm" onclick="Pages2.quickTheme('dark')">暗夜墨色</button>
            <button class="btn btn-sm" onclick="Pages2.quickTheme('neon')">赛博霓虹</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title">${Utils.icon('bot')} AI辅助设计</div>
          <p class="text-sm text-muted">让AI助手帮你设计UI并自动导入。</p>
          <button class="btn btn-sm btn-block" onclick="Router.go('/assistant')">前往AI助手</button>
        </div>
      </div>
    `, 'home');
  },

  applyCustomUI() {
    const css = document.getElementById('custom-css-editor').value;
    Store.state.uiCustom.css = css;
    Store.state.uiCustom.enabled = true;
    Store.save();
    let style = document.getElementById('custom-style');
    if (!style) { style = document.createElement('style'); style.id = 'custom-style'; document.head.appendChild(style); }
    style.textContent = css;
    Utils.toast('自定义CSS已应用');
  },

  resetCustomUI() {
    Store.state.uiCustom.css = '';
    Store.state.uiCustom.enabled = false;
    Store.save();
    const style = document.getElementById('custom-style');
    if (style) style.textContent = '';
    document.getElementById('custom-css-editor').value = '';
    Utils.toast('已重置');
  },

  quickTheme(theme) {
    Store.state.settings.theme = theme;
    Store.save();
    document.documentElement.setAttribute('data-theme', theme);
    Utils.toast('主题已切换');
  },

  /* ===================== 使用教程 ===================== */
  tutorial() {
    Router.nav(`
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
            3. 支持分类管理（室内/室外/特殊等）<br>
            4. 立绘支持透明/不透明模式
          </p>
          
          <h4 style="margin:16px 0 6px;color:var(--gold)">第四步：开始游戏</h4>
          <p class="text-sm" style="line-height:1.8">
            1. 点击「视觉小说」进入沉浸模式<br>
            2. 支持两种模式切换：沉浸式VN + Markdown聊天<br>
            3. 发送消息或使用选项推进剧情<br>
            4. 支持打字机效果和字数限制<br>
            5. 随时存档，支持多存档线
          </p>
        </div>

        <div class="card">
          <div class="card-title">${Utils.icon('book')} 功能说明</div>
          <p class="text-sm" style="line-height:1.8">
            <strong>视觉小说模式：</strong>全屏沉浸式，支持立绘、背景、音乐、打字机效果<br><br>
            <strong>Markdown聊天：</strong>左侧立绘+右侧对话面板，支持Markdown渲染<br><br>
            <strong>地图系统：</strong>标点地图，可前往地点触发剧情<br><br>
            <strong>角色档案：</strong>百科式信息、关系图、记事册、秘密档案、背包<br><br>
            <strong>记忆系统：</strong>仿向量化召回，按分类管理，AI自动提取<br><br>
            <strong>世界书：</strong>常驻/关键词/深度三种注入模式<br><br>
            <strong>预设提示词：</strong>DIY创建或AI辅助生成，支持酒馆AI格式导入<br><br>
            <strong>正则规则：</strong>去八股文、过滤多余内容，一键添加常用规则<br><br>
            <strong>万能导入：</strong>智能扫描分类，AI辅助分析，导入前预览<br><br>
            <strong>虚拟手机：</strong>聊天、论坛、邮箱、百科、自制App<br><br>
            <strong>AI助手：</strong>上传代码、生成代码、自动导入、项目分析
          </p>
        </div>

        <div class="card">
          <div class="card-title">${Utils.icon('upload')} 部署指南</div>
          <p class="text-sm" style="line-height:1.8">
            <strong>方法一：GitHub Pages（推荐）</strong><br>
            1. 创建GitHub仓库（如 ai-visual-novel）<br>
            2. 上传所有文件（index.html + css/ + js/）<br>
            3. 仓库 Settings → Pages → Source 选 main<br>
            4. 等待几分钟即可访问<br><br>
            
            <strong>方法二：本地打开</strong><br>
            1. 将所有文件传到手机或电脑<br>
            2. 用浏览器直接打开 index.html<br>
            <span class="text-muted">注意：直接打开时API调用可能受限</span><br><br>
            
            <strong>方法三：Netlify/Vercel</strong><br>
            1. 将文件打包为ZIP<br>
            2. 上传到Netlify或Vercel<br>
            3. 自动获得在线访问链接
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
            <span class="text-muted">建议先备份再修改。也可以让AI助手帮你修改代码并自动导入。</span>
          </p>
        </div>
      </div>
    `, 'home');
  },
};

// 合并到 Pages 命名空间
Object.assign(Pages, Pages2);
