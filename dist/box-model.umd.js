!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports):"function"==typeof define&&define.amd?define(["exports"],r):r((t||self).boxModel={})}(this,function(t){function r(t,r,e,n){for(var o=t.length,a=n(t,r),i=new Array(o),u=e/2,s=e/6,f=r+u,c=0;c<o;c+=1)i[c]=t[c]+u*a[c];for(var l=n(i,f),p=0;p<o;p+=1)i[p]=t[p]+u*l[p];for(var h=n(i,f),v=0;v<o;v+=1)i[v]=t[v]+e*h[v],h[v]+=l[v];return l=n(i,r+e),t.map(function(r,e){return t[e]+s*(a[e]+l[e]+2*h[e])})}var e=Object.prototype.hasOwnProperty;function n(t,r){return e.call(t,r)}function o(t,r){throw new Error("Value of unknown "+t+" requested: "+r+". Check your box model definition.")}t.BoxModelEngine=/*#__PURE__*/function(){function t(t,e){void 0===e&&(e={integrator:r}),this.model=void 0,this.integrator=void 0,this.model=t,this.integrator=e.integrator}t.createIdToIdxMap=function(t){return t.reduce(function(t,r,e){return t[r.id]=e,t},{})};var e=t.prototype;return e.createGraphEvaluator=function(){var r,e=this,a=this.model,i=a.stocks,u=a.flows,s=a.variables,f=a.parameters,c=t.createIdToIdxMap(i),l=t.createIdToIdxMap(u),p=t.createIdToIdxMap(s),h=t.createIdToIdxMap(f),v={t:0,stocks:new Array(i.length),flows:new Array(u.length),variables:new Array(s.length),parameters:new Array(f.length)},d=new Array(u.length),w=new Array(s.length),m=function(t){return n(c,t)||o("stock",t),v.stocks[c[t]]},y=function(t){return n(h,t)||o("parameter",t),v.parameters[h[t]]},g=function t(e){n(l,e)||o("variable",e);var a=l[e];if(void 0===v.flows[a]){if(d[a])throw new Error("Evaluation cycle detected starting at: flow "+e);d[a]=!0,v.flows[a]=u[a].formula({s:m,f:t,v:r,p:y,t:v.t})}return v.flows[a]};return r=function(t){n(p,t)||o("variable",t);var e=p[t];if(void 0===v.variables[e]){if(w[e])throw new Error("Evaluation cycle detected starting at: variable "+t);w[e]=!0,v.variables[e]=s[e].formula({s:m,f:g,v:r,p:y,t:v.t})}return v.variables[e]},function(t,n){return v={t:n,stocks:t,flows:new Array(u.length),variables:new Array(s.length),parameters:f.map(function(t){return t.value})},d.fill(!1),w.fill(!1),e.model.variables.forEach(function(t){return r(t.id)}),e.model.flows.forEach(function(t){return g(t.id)}),v}},e.evaluateGraph=function(t,r){return this.createGraphEvaluator()(t,r)},e.step=function(t,r,e,n){if("number"==typeof r)return this.step3(t,r,e);if(void 0!==n)return this.step4(t,r,e,n);throw new TypeError},e.step3=function(t,r,e){var n=this.createGraphEvaluator();return this.stepImpl(t,function(t,r){return n(t,r).flows},r,e)},e.step4=function(t,r,e,n){var o=this.createGraphEvaluator();return this.stepImpl(t,function(t,n){return n===e?r:o(t,n).flows},e,n)},e.stepImpl=function(r,e,n,o){var a=this,i=t.createIdToIdxMap(this.model.flows);return this.integrator(r,n,o,function(t,r){var n=e(t,r),o=function(t){return n[i[t]]},u=function(t){return t.map(o).reduce(function(t,r){return t+r},0)};return a.model.stocks.map(function(t){return u(t.in)-u(t.out)})})},e.stepExt=function(t,r,e,n){if("number"==typeof r)return this.stepExt3(t,r,e);if(void 0!==n)return this.stepExt4(t,r,e,n);throw new TypeError},e.stepExt3=function(t,r,e){var n=this.step(t,r,e);return this.evaluateGraph(n,r+e)},e.stepExt4=function(t,r,e,n){var o=this.step(t,r,e,n);return this.evaluateGraph(o,e+n)},e.converge=function(t,r,e,n){return this.convergeExt(t,r,e,n).stocks},e.convergeExt=function(t,r,e,n){for(var o=this.createGraphEvaluator(),a=o(t,r),i=function(t,r){return r===a.t?a.flows:o(t,r).flows},u=0,s=!1;!s;u+=1){var f=this.stepImpl(a.stocks,i,a.t,e),c=o(f,r+u*e);s=n(c,a,u,this),a=c}return a},t}(),t.euler=function(t,r,e,n){var o=n(t,r);return t.map(function(t,r){return t+e*o[r]})},t.rk4=r});
//# sourceMappingURL=box-model.umd.js.map
