/* ============================================================
   router.js - 前端路由 (基于 hash)
   注册所有页面路径并管理页面切换
   ============================================================ */
const Router={
  routes:{},cur:null,
  init(){window.addEventListener('hashchange',()=>this.handle());this.handle();},
  reg(path,handler){this.routes[path]=handler;},
  go(path){window.location.hash=path;},
  handle(){
    const hash=window.location.hash.slice(1)||'/';const parts=hash.split('/').filter(Boolean);
    let handler=this.routes[hash]||this.routes['/'];
    if(!handler){
      for(const k of Object.keys(this.routes)){if(k==='/')continue;
        const kp=k.split('/'),hp=hash.split('/');
        if(kp.length===hp.length){let m=true;for(let i=0;i<kp.length;i++)if(!kp[i].startsWith(':')&&kp[i]!==hp[i]){m=false;break;}if(m){handler=this.routes[k];break;}}
      }
    }
    if(handler){this.cur=hash;document.getElementById('app').innerHTML='';handler(document.getElementById('app'),parts);window.scrollTo(0,0);}else this.go('/');
  },
  nav(content,active='home'){
    const items=[{p:'/',i:'home',l:'主页',k:'home'},{p:'/chars',i:'users',l:'角色',k:'chars'},{p:'/assets',i:'image',l:'素材',k:'assets'},{p:'/phone',i:'phone',l:'手机',k:'phone'},{p:'/settings',i:'settings',l:'设置',k:'settings'}];
    document.getElementById('app').innerHTML=`<div id="page-content">${content}</div><nav class="bottom-nav">${items.map(it=>`<a class="nav-item ${it.k===active?'active':''}" href="#${it.p}">${Utils.icon(it.i)}<span>${it.l}</span></a>`).join('')}</nav>`;
  },
  full(html){document.getElementById('app').innerHTML=`<div class="page-full">${html}</div>`;},
  renderFullscreen(html){this.full(html);},
  renderWithNav(html,active='home'){this.nav(html,active);},
};
