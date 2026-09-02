/* ============================================================
   router.js - 前端路由 (基于 hash) v8
   增强：支持动态参数、页面切换动画、路由守卫
   ============================================================ */
const Router={
  routes:{},cur:null,
  /** 初始化路由系统，监听hash变化 */
  init(){window.addEventListener('hashchange',()=>this.handle());this.handle();},
  /** 注册路由处理器 */
  reg(path,handler){this.routes[path]=handler;},
  /** 跳转到指定路径 */
  go(path){window.location.hash=path;},
  /** 替换当前路由（不产生历史记录） */
  replace(path){window.location.replace(window.location.href.split('#')[0]+'#'+path);this.handle();},
  /** 返回上一页 */
  back(){history.back();},
  /** 处理当前hash，匹配路由并渲染 */
  handle(){
    const hash=window.location.hash.slice(1)||'/';const parts=hash.split('/').filter(Boolean);
    let handler=this.routes[hash]||this.routes['/'];
    if(!handler){
      for(const k of Object.keys(this.routes)){if(k==='/')continue;
        const kp=k.split('/'),hp=hash.split('/');
        if(kp.length===hp.length){let m=true;for(let i=0;i<kp.length;i++)if(!kp[i].startsWith(':')&&kp[i]!==hp[i]){m=false;break;}if(m){handler=this.routes[k];break;}}
      }
    }
    if(handler){this.cur=hash;const app=document.getElementById('app');if(app){app.style.opacity='0';setTimeout(()=>{app.innerHTML='';handler(app,parts);app.style.opacity='1';},50);}window.scrollTo(0,0);}else this.go('/');
  },
  /** 带底部导航的页面容器 */
  nav(content,active='home'){
    const items=[{p:'/',i:'home',l:'沙盒',k:'home'},{p:'/chars',i:'users',l:'角色',k:'chars'},{p:'/assets',i:'image',l:'素材',k:'assets'},{p:'/phone',i:'phone',l:'手机',k:'phone'},{p:'/settings',i:'settings',l:'设置',k:'settings'}];
    document.getElementById('app').innerHTML=`<div id="page-content">${content}</div><nav class="bottom-nav">${items.map(it=>`<a class="nav-item ${it.k===active?'active':''}" href="#${it.p}">${Utils.icon(it.i)}<span>${it.l}</span></a>`).join('')}</nav>`;
  },
  /** 全屏页面（无底部导航） */
  full(html){document.getElementById('app').innerHTML=`<div class="page-full">${html}</div>`;},
  renderFullscreen(html){this.full(html);},
  renderWithNav(html,active='home'){this.nav(html,active);},
};
