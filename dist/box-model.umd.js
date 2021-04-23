!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t||self).boxModel={})}(this,function(t){function e(t,e,r,n){for(var o=t.length,i=n(t,e),u=new Array(o),a=r/2,f=r/6,s=e+a,p=0;p<o;p+=1)u[p]=t[p]+a*i[p];for(var c=n(u,s),d=0;d<o;d+=1)u[d]=t[d]+a*c[d];for(var l=n(u,s),h=0;h<o;h+=1)u[h]=t[h]+r*l[h],l[h]+=c[h];return c=n(u,e+r),t.map(function(e,r){return t[r]+f*(i[r]+c[r]+2*l[r])})}t.BoxModelEngine=function(){function t(t,r){void 0===r&&(r={integrator:e}),this.model=t,this.integrator=r.integrator}t.createIdToIdxMap=function(t){return t.reduce(function(t,e,r){return t[e.id]=r,t},{})};var r=t.prototype;return r.evaluateGraph=function(e,r){var n,o,i=t.createIdToIdxMap(this.model.stocks),u=function(t){return e[i[t]]},a=t.createIdToIdxMap(this.model.parameters),f=this.model.parameters.map(function(t){return t.value}),s=function(t){return f[a[t]]},p=function(e){var i=t.createIdToIdxMap(e),a=e.map(function(){return!1}),f=function(t){var f=i[t];if("boolean"==typeof a[f]){if(a[f])throw new Error("Evaluation cycle detected starting at: "+t);return a[f]=!0,a[f]=e[f].formula(u,n,o,s,r),a[f]}return a[f]};return f.data=a,f};return o=p(this.model.variables),n=p(this.model.flows),this.model.variables.forEach(function(t){return o(t.id)}),this.model.flows.forEach(function(t){return n(t.id)}),{stocks:e,flows:n.data,variables:o.data,parameters:f,t:r}},r.step=function(t,e,r,n){if("number"==typeof e)return this.step3(t,e,r);if(void 0!==n)return this.step4(t,e,r,n);throw new TypeError},r.step3=function(t,e,r){var n=this;return this.stepImpl(t,function(t,e){return n.evaluateGraph(t,e).flows},e,r)},r.step4=function(t,e,r,n){var o=this;return this.stepImpl(t,function(t,n){return n===r?e:o.evaluateGraph(t,n).flows},r,n)},r.stepImpl=function(e,r,n,o){var i=this,u=t.createIdToIdxMap(this.model.flows);return this.integrator(e,n,o,function(t,e){var n=r(t,e),o=function(t){return n[u[t]]},a=function(t){return t.map(o).reduce(function(t,e){return t+e},0)};return i.model.stocks.map(function(t){return a(t.in)-a(t.out)})})},r.stepExt=function(t,e,r,n){if("number"==typeof e)return this.stepExt3(t,e,r);if(void 0!==n)return this.stepExt4(t,e,r,n);throw new TypeError},r.stepExt3=function(t,e,r){var n=this.step(t,e,r);return this.evaluateGraph(n,e+r)},r.stepExt4=function(t,e,r,n){var o=this.step(t,e,r,n);return this.evaluateGraph(o,r+n)},t}(),t.euler=function(t,e,r,n){var o=n(t,e);return t.map(function(t,e){return t+r*o[e]})},t.rk4=e});
//# sourceMappingURL=box-model.umd.js.map
