(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-0cd9867c"],{"72d2":function(t,n,s){},"9afc":function(t,n,s){"use strict";var e=s("72d2"),a=s.n(e);a.a},a660:function(t,n,s){"use strict";s.r(n);var e=function(){var t=this,n=t.$createElement,s=t._self._c||n;return s("div",{staticClass:"transaction"},[t.transaction?s("div",{staticClass:"table_wrapper"},[s("table",[s("tr",[s("td",[t._v("Description")]),s("td",[t._v(t._s(t.transaction.description))])]),s("tr",[s("td",[t._v("Account")]),s("td",[t._v(t._s(t.transaction.account))])]),s("tr",[s("td",[t._v("Amount")]),s("td",[t._v(t._s(t.transaction.amount))])]),s("tr",[s("td",[t._v("Currency")]),s("td",[t._v(t._s(t.transaction.currency))])]),s("tr",[s("td",[t._v("Date")]),s("td",[t._v(t._s(t.transaction.date))])]),s("tr",[s("td",[t._v("Business expense")]),s("td",[s("input",{directives:[{name:"model",rawName:"v-model",value:t.transaction.business_expense,expression:"transaction.business_expense"}],attrs:{type:"checkbox"},domProps:{checked:Array.isArray(t.transaction.business_expense)?t._i(t.transaction.business_expense,null)>-1:t.transaction.business_expense},on:{change:[function(n){var s=t.transaction.business_expense,e=n.target,a=!!e.checked;if(Array.isArray(s)){var i=null,c=t._i(s,i);e.checked?c<0&&t.$set(t.transaction,"business_expense",s.concat([i])):c>-1&&t.$set(t.transaction,"business_expense",s.slice(0,c).concat(s.slice(c+1)))}else t.$set(t.transaction,"business_expense",a)},function(n){return t.update_transaction()}]}})])])])]):s("div",{},[t._v(" Loading... ")])])},a=[],i={name:"ViewTransaction",data:function(){return{transaction:null}},mounted:function(){var t=this;this.axios.post("https://finances.maximemoreillon.com/get_transaction",{_id:this.$route.query._id}).then((function(n){console.log(n.data),t.transaction=n.data})).catch((function(t){return console.log(t.data)}))},methods:{update_transaction:function(){this.axios.post("https://finances.maximemoreillon.com/update_transaction",this.transaction).then((function(t){console.log(t.data)})).catch((function(t){return console.log(t.data)}))}}},c=i,o=(s("9afc"),s("2877")),r=Object(o["a"])(c,e,a,!1,null,"693f6e9e",null);n["default"]=r.exports}}]);
//# sourceMappingURL=chunk-0cd9867c.cc50cdac.js.map