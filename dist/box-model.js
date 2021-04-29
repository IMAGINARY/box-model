function t(t,r,e,n){for(var o=t.length,a=n(t,r),u=new Array(o),i=e/2,s=e/6,f=r+i,c=0;c<o;c+=1)u[c]=t[c]+i*a[c];for(var p=n(u,f),l=0;l<o;l+=1)u[l]=t[l]+i*p[l];for(var h=n(u,f),d=0;d<o;d+=1)u[d]=t[d]+e*h[d],h[d]+=p[d];return p=n(u,r+e),t.map(function(r,e){return t[e]+s*(a[e]+p[e]+2*h[e])})}var r=Object.prototype.hasOwnProperty;function e(t,e){return r.call(t,e)}function n(t,r){throw new Error("Value of unknown "+t+" requested: "+r+". Check your box model definition.")}exports.BoxModelEngine=function(){function r(r,e){void 0===e&&(e={integrator:t}),this.model=r,this.integrator=e.integrator}r.createIdToIdxMap=function(t){return t.reduce(function(t,r,e){return t[r.id]=e,t},{})};var o=r.prototype;return o.evaluateGraph=function(t,o){var a,u,i=r.createIdToIdxMap(this.model.stocks),s=function(r){return e(i,r)||n("stock",r),t[i[r]]},f=r.createIdToIdxMap(this.model.parameters),c=this.model.parameters.map(function(t){return t.value}),p=function(t){return e(f,t)||n("parameter",t),c[f[t]]},l=function(t,i){var f=r.createIdToIdxMap(t),c=t.map(function(){return!1}),l=function(r){e(f,r)||n(i,r);var l=f[r];if("boolean"==typeof c[l]){if(c[l])throw new Error("Evaluation cycle detected starting at: "+r);return c[l]=!0,c[l]=t[l].formula(s,a,u,p,o),c[l]}return c[l]};return l.data=c,l};return u=l(this.model.variables,"variable"),a=l(this.model.flows,"flow"),this.model.variables.forEach(function(t){return u(t.id)}),this.model.flows.forEach(function(t){return a(t.id)}),{stocks:t,flows:a.data,variables:u.data,parameters:c,t:o}},o.step=function(t,r,e,n){if("number"==typeof r)return this.step3(t,r,e);if(void 0!==n)return this.step4(t,r,e,n);throw new TypeError},o.step3=function(t,r,e){var n=this;return this.stepImpl(t,function(t,r){return n.evaluateGraph(t,r).flows},r,e)},o.step4=function(t,r,e,n){var o=this;return this.stepImpl(t,function(t,n){return n===e?r:o.evaluateGraph(t,n).flows},e,n)},o.stepImpl=function(t,e,n,o){var a=this,u=r.createIdToIdxMap(this.model.flows);return this.integrator(t,n,o,function(t,r){var n=e(t,r),o=function(t){return n[u[t]]},i=function(t){return t.map(o).reduce(function(t,r){return t+r},0)};return a.model.stocks.map(function(t){return i(t.in)-i(t.out)})})},o.stepExt=function(t,r,e,n){if("number"==typeof r)return this.stepExt3(t,r,e);if(void 0!==n)return this.stepExt4(t,r,e,n);throw new TypeError},o.stepExt3=function(t,r,e){var n=this.step(t,r,e);return this.evaluateGraph(n,r+e)},o.stepExt4=function(t,r,e,n){var o=this.step(t,r,e,n);return this.evaluateGraph(o,e+n)},r}(),exports.euler=function(t,r,e,n){var o=n(t,r);return t.map(function(t,r){return t+e*o[r]})},exports.rk4=t;
//# sourceMappingURL=box-model.js.map
