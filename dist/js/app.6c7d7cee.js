(function(n){function t(t){for(var a,o,c=t[0],u=t[1],l=t[2],s=0,p=[];s<c.length;s++)o=c[s],Object.prototype.hasOwnProperty.call(r,o)&&r[o]&&p.push(r[o][0]),r[o]=0;for(a in u)Object.prototype.hasOwnProperty.call(u,a)&&(n[a]=u[a]);d&&d(t);while(p.length)p.shift()();return i.push.apply(i,l||[]),e()}function e(){for(var n,t=0;t<i.length;t++){for(var e=i[t],a=!0,o=1;o<e.length;o++){var c=e[o];0!==r[c]&&(a=!1)}a&&(i.splice(t--,1),n=u(u.s=e[0]))}return n}var a={},o={app:0},r={app:0},i=[];function c(n){return u.p+"js/"+({}[n]||n)+"."+{"chunk-46474474":"c7855e4f","chunk-72ca703d":"1d974708","chunk-e0f83e0a":"7fd3f27a","chunk-2d0b20f7":"bd0a515c","chunk-2d0d03e7":"319165a4"}[n]+".js"}function u(t){if(a[t])return a[t].exports;var e=a[t]={i:t,l:!1,exports:{}};return n[t].call(e.exports,e,e.exports,u),e.l=!0,e.exports}u.e=function(n){var t=[],e={"chunk-46474474":1,"chunk-72ca703d":1,"chunk-e0f83e0a":1};o[n]?t.push(o[n]):0!==o[n]&&e[n]&&t.push(o[n]=new Promise((function(t,e){for(var a="css/"+({}[n]||n)+"."+{"chunk-46474474":"0a41c947","chunk-72ca703d":"4bbd6d16","chunk-e0f83e0a":"1396ae0b","chunk-2d0b20f7":"31d6cfe0","chunk-2d0d03e7":"31d6cfe0"}[n]+".css",r=u.p+a,i=document.getElementsByTagName("link"),c=0;c<i.length;c++){var l=i[c],s=l.getAttribute("data-href")||l.getAttribute("href");if("stylesheet"===l.rel&&(s===a||s===r))return t()}var p=document.getElementsByTagName("style");for(c=0;c<p.length;c++){l=p[c],s=l.getAttribute("data-href");if(s===a||s===r)return t()}var d=document.createElement("link");d.rel="stylesheet",d.type="text/css",d.onload=t,d.onerror=function(t){var a=t&&t.target&&t.target.src||r,i=new Error("Loading CSS chunk "+n+" failed.\n("+a+")");i.code="CSS_CHUNK_LOAD_FAILED",i.request=a,delete o[n],d.parentNode.removeChild(d),e(i)},d.href=r;var f=document.getElementsByTagName("head")[0];f.appendChild(d)})).then((function(){o[n]=0})));var a=r[n];if(0!==a)if(a)t.push(a[2]);else{var i=new Promise((function(t,e){a=r[n]=[t,e]}));t.push(a[2]=i);var l,s=document.createElement("script");s.charset="utf-8",s.timeout=120,u.nc&&s.setAttribute("nonce",u.nc),s.src=c(n);var p=new Error;l=function(t){s.onerror=s.onload=null,clearTimeout(d);var e=r[n];if(0!==e){if(e){var a=t&&("load"===t.type?"missing":t.type),o=t&&t.target&&t.target.src;p.message="Loading chunk "+n+" failed.\n("+a+": "+o+")",p.name="ChunkLoadError",p.type=a,p.request=o,e[1](p)}r[n]=void 0}};var d=setTimeout((function(){l({type:"timeout",target:s})}),12e4);s.onerror=s.onload=l,document.head.appendChild(s)}return Promise.all(t)},u.m=n,u.c=a,u.d=function(n,t,e){u.o(n,t)||Object.defineProperty(n,t,{enumerable:!0,get:e})},u.r=function(n){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},u.t=function(n,t){if(1&t&&(n=u(n)),8&t)return n;if(4&t&&"object"===typeof n&&n&&n.__esModule)return n;var e=Object.create(null);if(u.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var a in n)u.d(e,a,function(t){return n[t]}.bind(null,a));return e},u.n=function(n){var t=n&&n.__esModule?function(){return n["default"]}:function(){return n};return u.d(t,"a",t),t},u.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},u.p="/",u.oe=function(n){throw console.error(n),n};var l=window["webpackJsonp"]=window["webpackJsonp"]||[],s=l.push.bind(l);l.push=t,l=l.slice();for(var p=0;p<l.length;p++)t(l[p]);var d=s;i.push([0,"chunk-vendors"]),e()})({0:function(n,t,e){n.exports=e("56d7")},2128:function(n,t,e){},"2e26":function(n,t,e){"use strict";var a=e("2128"),o=e.n(a);o.a},"56d7":function(n,t,e){"use strict";e.r(t);e("e260"),e("e6cf"),e("cca6"),e("a79d");var a=e("2b0e"),o=function(){var n=this,t=n.$createElement,e=n._self._c||t;return e("div",{attrs:{id:"app"}},[e("AppTemplate",{attrs:{navigation:n.navigation,applicationName:"Finances"}})],1)},r=[],i=function(){var n=this,t=n.$createElement,e=n._self._c||t;return e("div",{staticClass:"application_wrapper"},[e("header",[n.navigation.length>0?e("span",{staticClass:"mdi navigation_control button",class:n.navigation_control_icon,on:{click:function(t){return n.toggle_navigation()}}}):n._e(),e("img",{staticClass:"rotating_logo",attrs:{src:"https://cdn.maximemoreillon.com/logo/thick/logo.svg",alt:""}}),e("span",{staticClass:"application_name"},[n._v(n._s(n.applicationName))]),n.noLoginControls?n._e():e("span",{staticClass:"mdi mdi-logout aligned_right button",on:{click:function(t){return n.logout()}}})]),n.navigation.length>0?e("nav",{class:{open:n.navigation_open}},n._l(n.navigation,(function(t,a){return e("router-link",{key:a,attrs:{to:t.route}},[e("span",{staticClass:"mdi",class:"mdi-"+t.icon,on:{click:function(t){return n.close_navigation()}}},[n._v(" "+n._s(t.label)+" ")])])})),1):n._e(),e("div",{staticClass:"nav_background",class:{visible:n.navigation_open},on:{click:function(t){return n.close_navigation()}}}),e("main",[e("router-view",{staticClass:"router_view"}),e("footer",[e("img",{staticClass:"rotating_logo",attrs:{src:"https://cdn.maximemoreillon.com/logo/thick/logo.svg",alt:""}}),e("div",{staticClass:"application_info"},[e("div",{staticClass:"application_name"},[n._v(n._s(n.applicationName))]),e("div",{staticClass:"author_name"},[n._v("Maxime MOREILLON")])])])],1)])},c=[],u={name:"AppTemplate",props:{applicationName:{type:String},navigation:{type:Array,default:function(){return[]}},slotted:{type:Boolean,default:function(){return!1}},noLoginControls:{type:Boolean,default:function(){return!1}}},data:function(){return{navigation_open:!1}},methods:{toggle_navigation:function(){this.navigation_open=!this.navigation_open},close_navigation:function(){this.navigation_open=!1},logout:function(){this.axios.post("https://authentication.maximemoreillon.com/logout").then((function(){return location.reload()})).catch((function(n){return console.log(n)}))}},computed:{navigation_control_icon:function(){return this.navigation_open?"mdi-backburger":"mdi-menu"}}},l=u,s=(e("2e26"),e("2877")),p=Object(s["a"])(l,i,c,!1,null,null,null),d=p.exports,f={name:"app",components:{AppTemplate:d},data:function(){return{navigation:[{route:"/",icon:"chart-line",label:"Balance"},{route:"/credit_card_transactions",icon:"chart-donut",label:"Credit card"},{route:"/bank_account_transactions",icon:"chart-donut",label:"Bank"}]}}},h=f,m=Object(s["a"])(h,o,r,!1,null,null,null),g=m.exports,v=(e("d3b7"),e("8c4f"));a["a"].use(v["a"]);var _=[{path:"/",name:"balance",component:function(){return Promise.all([e.e("chunk-46474474"),e.e("chunk-72ca703d")]).then(e.bind(null,"a824"))}},{path:"/credit_card_transactions",name:"credit_card_transactions",component:function(){return Promise.all([e.e("chunk-46474474"),e.e("chunk-e0f83e0a"),e.e("chunk-2d0b20f7")]).then(e.bind(null,"2300"))}},{path:"/bank_account_transactions",name:"bank_account_transactions",component:function(){return Promise.all([e.e("chunk-46474474"),e.e("chunk-e0f83e0a"),e.e("chunk-2d0d03e7")]).then(e.bind(null,"66c4"))}}],b=new v["a"]({mode:"history",base:"/",routes:_}),k=b,y=e("2f62");a["a"].use(y["a"]);var w=new y["a"].Store({state:{},mutations:{},actions:{},modules:{}}),C=e("bc3a"),x=e.n(C),O=e("a7fe"),j=e.n(O);e("5363");x.a.defaults.withCredentials=!0,x.a.defaults.crossDomain=!0,a["a"].use(j.a,x.a),a["a"].config.productionTip=!1,k.beforeEach((function(n,t,e){x.a.post("https://authentication.maximemoreillon.com/status").then((function(n){n.data.logged_in?e():window.location.href="https://authentication.maximemoreillon.com/"})).catch((function(n){return console.log(n)}))})),new a["a"]({router:k,store:w,render:function(n){return n(g)}}).$mount("#app")}});
//# sourceMappingURL=app.6c7d7cee.js.map