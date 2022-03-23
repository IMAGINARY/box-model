function t(t,e,r,s){const o=s(t,e);return t.map((t,e)=>t+r*o[e])}function e(t,e,r,s){const o=t.length,a=s(t,e),n=new Array(o),i=r/2,p=r/6,l=e+i;for(let e=0;e<o;e+=1)n[e]=t[e]+i*a[e];let h=s(n,l);for(let e=0;e<o;e+=1)n[e]=t[e]+i*h[e];const c=s(n,l);for(let e=0;e<o;e+=1)n[e]=t[e]+r*c[e],c[e]+=h[e];return h=s(n,e+r),t.map((e,r)=>t[r]+p*(a[r]+h[r]+2*c[r]))}const r=Object.prototype.hasOwnProperty;function s(t,e){return r.call(t,e)}function o(t,e){throw new Error(`Value of unknown ${t} requested: ${e}. Check your box model definition.`)}class a{constructor(t,r={integrator:e}){this.model=void 0,this.integrator=void 0,this.model=t,this.integrator=r.integrator}static createIdToIdxMap(t){return t.reduce((t,{id:e},r)=>(t[e]=r,t),{})}evaluateGraph(t,e){const r=a.createIdToIdxMap(this.model.stocks),n=e=>(s(r,e)||o("stock",e),t[r[e]]),i=a.createIdToIdxMap(this.model.parameters),p=this.model.parameters.map(({value:t})=>t),l=t=>(s(i,t)||o("parameter",t),p[i[t]]),[h,c]=[{items:this.model.flows,name:"flow"},{items:this.model.variables,name:"variable"}].map(({items:t,name:r})=>{const i=a.createIdToIdxMap(t),p=t.map(()=>!1),u=a=>{s(i,a)||o(r,a);const u=i[a];if("boolean"==typeof p[u]){if(p[u])throw new Error(`Evaluation cycle detected starting at: ${a}`);return p[u]=!0,p[u]=t[u].formula({s:n,f:h,v:c,p:l,t:e}),p[u]}return p[u]};return u.data=p,u});return this.model.variables.forEach(({id:t})=>c(t)),this.model.flows.forEach(({id:t})=>h(t)),{stocks:t,flows:h.data,variables:c.data,parameters:p,t:e}}step(t,e,r,s){if("number"==typeof e)return this.step3(t,e,r);if(void 0!==s)return this.step4(t,e,r,s);throw new TypeError}step3(t,e,r){return this.stepImpl(t,(t,e)=>this.evaluateGraph(t,e).flows,e,r)}step4(t,e,r,s){return this.stepImpl(t,(t,s)=>s===r?e:this.evaluateGraph(t,s).flows,r,s)}stepImpl(t,e,r,s){const o=a.createIdToIdxMap(this.model.flows);return this.integrator(t,r,s,(t,r)=>{const s=e(t,r),a=t=>s[o[t]],n=t=>t.map(a).reduce((t,e)=>t+e,0);return this.model.stocks.map(t=>n(t.in)-n(t.out))})}stepExt(t,e,r,s){if("number"==typeof e)return this.stepExt3(t,e,r);if(void 0!==s)return this.stepExt4(t,e,r,s);throw new TypeError}stepExt3(t,e,r){const s=this.step(t,e,r);return this.evaluateGraph(s,e+r)}stepExt4(t,e,r,s){const o=this.step(t,e,r,s);return this.evaluateGraph(o,r+s)}converge(t,e,r,s){return this.convergeExt(t,e,r,s).stocks}convergeExt(t,e,r,s){let o=this.evaluateGraph(t,e);const a=(t,e)=>e===o.t?o.flows:this.evaluateGraph(t,e).flows;for(let t=0,n=!1;!n;t+=1){const i=this.stepImpl(o.stocks,a,o.t,r),p=this.evaluateGraph(i,e+t*r);n=s(p,o,t,this),o=p}return o}}export{a as BoxModelEngine,t as euler,e as rk4};
//# sourceMappingURL=box-model.modern.js.map
