!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t||self).boxModel={})}(this,function(t){function n(){return(n=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var r=arguments[n];for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e])}return t}).apply(this,arguments)}function r(t,n,r,e){for(var o=t.length,i=e(t,n),a=Array(o),s=r/2,u=r/6,c=n+s,f=0;f<o;f+=1)a[f]=t[f]+s*i[f];for(var p=e(a,c),h=0;h<o;h+=1)a[h]=t[h]+s*p[h];for(var d=e(a,c),l=0;l<o;l+=1)a[l]=t[l]+r*d[l],d[l]+=p[l];return p=e(a,n+r),t.map(function(n,r){return t[r]+u*(i[r]+p[r]+2*d[r])})}t.BoxModel=function(){function t(e,o){var i=e.stocks,a=e.flows,s=e.variables,u=e.constants;void 0===o&&(o=r),this.stocks=i,this.flows=a,this.variables=s,this.constants=u,this.integrator=o,this.ensureUniqueIds(),this.idToIdx=n({},t.createIdToIdxMap(i),t.createIdToIdxMap(s),t.createIdToIdxMap(u),t.createIdToIdxMap(a))}var e=t.prototype;return e.ensureUniqueIds=function(){var t=[].concat(this.stocks,this.variables,this.constants,this.flows).map(function(t){return t.id}).reduce(function(t,n,r,e){return e.lastIndexOf(n)!==r&&e.push(n),t},[]);if(t.length>0)throw new Error("Duplicate ids found: "+t)},t.createIdToIdxMap=function(t){var n={};return t.forEach(function(t,r){return n[t.id]=r}),n},e.evaluateGraph=function(t,n){var r=this,e=function(n){return t[r.idToIdx[n]]},o=this.constants.map(function(t){return t.value}),i=function(t){return o[r.idToIdx[t]]},a=function(t){var o=new Array(t.length);return{evaluator:function(a){var s=r.idToIdx[a];if(null===o[s])throw new Error("Evaluation cycle detected starting at: ${id}");return void 0===o[s]&&(o[s]=null,o[s]=t[s].equation(e,p,u,i,n)),o[s]},data:o}},s=a(this.variables),u=s.evaluator,c=s.data,f=a(this.flows),p=f.evaluator,h=f.data;return this.variables.forEach(function(t){return u(t.id)}),this.flows.forEach(function(t){return p(t.id)}),{stocks:t,flows:h,variables:c,constants:o,t:n}},e.step=function(t,n,r,e){return"number"==typeof n?this.step3(t,n,r):this.step4(t,n,r,e)},e.step3=function(t,n,r){var e=this;return this.stepImpl(t,function(t,n){return e.evaluateGraph(t,n).flows},n,r)},e.step4=function(t,n,r,e){var o=this;return this.stepImpl(t,function(t,e){return e===r?n:o.evaluateGraph(t,e).flows},r,e)},e.stepImpl=function(t,n,r,e){var o=this;return this.integrator(t,r,e,function(t,r){var e=n(t,r),i=function(t){return e[o.idToIdx[t]]},a=function(t){return t.map(i).reduce(function(t,n){return t+n},0)};return o.stocks.map(function(t){return a(t.in)-a(t.out)})})},e.stepExt=function(t,n,r,e){return"number"==typeof n?this.stepExt3(t,n,r):this.stepExt4(t,n,r,e)},e.stepExt3=function(t,r,e){var o=this.step(t,r,e);return n({stocks:o},this.evaluateGraph(o,r+e))},e.stepExt4=function(t,r,e,o){var i=this.step(t,r,e,o);return n({stocks:i},this.evaluateGraph(i,e+o))},t}(),t.euler=function(t,n,r,e){var o=e(t,n);return t.map(function(n,e){return t[e]+r*o[e]})},t.rk4=r});
//# sourceMappingURL=box-model.umd.js.map
