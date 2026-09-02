/* ============================================================
   app.js - 应用入口
   初始化存储、主题、注册所有路由、启动
   ============================================================ */
function initApp(){
  Store.init();
  const th=Store.state.settings.theme||'light';
  document.documentElement.setAttribute('data-theme',th);
  // 注册路由
  Router.reg('/',()=>Pages.home());
  Router.reg('/vn',()=>Pages.vn());
  Router.reg('/chat',()=>Pages.chat());
  Router.reg('/map',()=>Pages.map());
  Router.reg('/chars',()=>Pages.chars());
  Router.reg('/char/:id',(el,params)=>Pages.charDetail(params[1]));
  Router.reg('/assets',()=>Pages.assets());
  Router.reg('/settings',()=>Pages.settings());
  Router.reg('/assistant',()=>Pages2.assistant());
  Router.reg('/memory',()=>Pages2.memory());
  Router.reg('/worldbook',()=>Pages2.worldbook());
  Router.reg('/presets',()=>Pages2.presets());
  Router.reg('/regex',()=>Pages2.regex());
  Router.reg('/import',()=>Pages2.importPage());
  Router.reg('/relations',()=>Pages2.relations());
  Router.reg('/storyline',()=>Pages2.storyline());
  Router.reg('/interactions',()=>Pages2.interactions());
  Router.reg('/tutorial',()=>Pages2.tutorial());
  Router.reg('/phone',()=>Pages2.phone());
  Router.reg('/phone/chat',()=>Pages2.phoneChat());
  Router.reg('/phone/chat/:id',(el,p)=>Pages2.phoneChatDetail(p[1]));
  Router.reg('/phone/forum',()=>Pages2.phoneForum());
  Router.reg('/phone/mail',()=>Pages2.phoneMail());
  Router.reg('/worldNotes',()=>Pages2.worldNotes());
  Router.reg('/customUI',()=>Pages2.customUI());
  Router.init();
  if(!Store.state.currentGame&&(window.location.hash===''||window.location.hash==='#/'))Pages.splash();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initApp);else initApp();
window.addEventListener('beforeunload',()=>Store.save());
