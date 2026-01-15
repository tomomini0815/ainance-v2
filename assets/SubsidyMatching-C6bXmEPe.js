import{c as ce,a as le,o as de,f as ue,r as _,j as o,L as fe,i as he,T as me,F as ge,S as pe}from"./index-Bk0qIUw9.js";import{A as xe}from"./arrow-left-BVrre4MH.js";import{D as M}from"./download-D03Lf0K_.js";import{C as be}from"./circle-alert-CBIrWFLn.js";import{C as ye}from"./clock-yfNqUd6J.js";import{C as Ce}from"./circle-check-big-DV4FML3H.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]],ve=ce("dollar-sign",Ee);var L;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(L||(L={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var G;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(G||(G={}));var U;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(U||(U={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k=["user","model","function","system"];var $;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})($||($={}));var F;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(F||(F={}));var H;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(H||(H={}));var Y;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(Y||(Y={}));var O;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"})(O||(O={}));var q;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(q||(q={}));var K;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(K||(K={}));var B;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(B||(B={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class p extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class R extends p{constructor(t,s){super(t),this.response=s}}class ee extends p{constructor(t,s,n,i){super(t),this.status=s,this.statusText=n,this.errorDetails=i}}class v extends p{}class te extends p{}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ne="https://generativelanguage.googleapis.com",_e="v1beta",Re="0.24.1",Ie="genai-js";var N;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(N||(N={}));class Oe{constructor(t,s,n,i,a){this.model=t,this.task=s,this.apiKey=n,this.stream=i,this.requestOptions=a}toString(){var t,s;const n=((t=this.requestOptions)===null||t===void 0?void 0:t.apiVersion)||_e;let a=`${((s=this.requestOptions)===null||s===void 0?void 0:s.baseUrl)||Ne}/${n}/${this.model}:${this.task}`;return this.stream&&(a+="?alt=sse"),a}}function Se(e){const t=[];return e!=null&&e.apiClient&&t.push(e.apiClient),t.push(`${Ie}/${Re}`),t.join(" ")}async function je(e){var t;const s=new Headers;s.append("Content-Type","application/json"),s.append("x-goog-api-client",Se(e.requestOptions)),s.append("x-goog-api-key",e.apiKey);let n=(t=e.requestOptions)===null||t===void 0?void 0:t.customHeaders;if(n){if(!(n instanceof Headers))try{n=new Headers(n)}catch(i){throw new v(`unable to convert customHeaders value ${JSON.stringify(n)} to Headers: ${i.message}`)}for(const[i,a]of n.entries()){if(i==="x-goog-api-key")throw new v(`Cannot set reserved header name ${i}`);if(i==="x-goog-api-client")throw new v(`Header name ${i} can only be set using the apiClient field`);s.append(i,a)}}return s}async function we(e,t,s,n,i,a){const r=new Oe(e,t,s,n,a);return{url:r.toString(),fetchOptions:Object.assign(Object.assign({},Me(a)),{method:"POST",headers:await je(r),body:i})}}async function w(e,t,s,n,i,a={},r=fetch){const{url:c,fetchOptions:d}=await we(e,t,s,n,i,a);return Ae(c,d,r)}async function Ae(e,t,s=fetch){let n;try{n=await s(e,t)}catch(i){Te(i,e)}return n.ok||await De(n,e),n}function Te(e,t){let s=e;throw s.name==="AbortError"?(s=new te(`Request aborted when fetching ${t.toString()}: ${e.message}`),s.stack=e.stack):e instanceof ee||e instanceof v||(s=new p(`Error fetching from ${t.toString()}: ${e.message}`),s.stack=e.stack),s}async function De(e,t){let s="",n;try{const i=await e.json();s=i.error.message,i.error.details&&(s+=` ${JSON.stringify(i.error.details)}`,n=i.error.details)}catch{}throw new ee(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${s}`,e.status,e.statusText,n)}function Me(e){const t={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const s=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>s.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{s.abort()}),t.signal=s.signal}return t}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),A(e.candidates[0]))throw new R(`${E(e)}`,e);return Le(e)}else if(e.promptFeedback)throw new R(`Text not available. ${E(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),A(e.candidates[0]))throw new R(`${E(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),P(e)[0]}else if(e.promptFeedback)throw new R(`Function call not available. ${E(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),A(e.candidates[0]))throw new R(`${E(e)}`,e);return P(e)}else if(e.promptFeedback)throw new R(`Function call not available. ${E(e)}`,e)},e}function Le(e){var t,s,n,i;const a=[];if(!((s=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||s===void 0)&&s.parts)for(const r of(i=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||i===void 0?void 0:i.parts)r.text&&a.push(r.text),r.executableCode&&a.push("\n```"+r.executableCode.language+`
`+r.executableCode.code+"\n```\n"),r.codeExecutionResult&&a.push("\n```\n"+r.codeExecutionResult.output+"\n```\n");return a.length>0?a.join(""):""}function P(e){var t,s,n,i;const a=[];if(!((s=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||s===void 0)&&s.parts)for(const r of(i=(n=e.candidates)===null||n===void 0?void 0:n[0].content)===null||i===void 0?void 0:i.parts)r.functionCall&&a.push(r.functionCall);if(a.length>0)return a}const Ge=[O.RECITATION,O.SAFETY,O.LANGUAGE];function A(e){return!!e.finishReason&&Ge.includes(e.finishReason)}function E(e){var t,s,n;let i="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)i+="Response was blocked",!((t=e.promptFeedback)===null||t===void 0)&&t.blockReason&&(i+=` due to ${e.promptFeedback.blockReason}`),!((s=e.promptFeedback)===null||s===void 0)&&s.blockReasonMessage&&(i+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((n=e.candidates)===null||n===void 0)&&n[0]){const a=e.candidates[0];A(a)&&(i+=`Candidate was blocked due to ${a.finishReason}`,a.finishMessage&&(i+=`: ${a.finishMessage}`))}return i}function S(e){return this instanceof S?(this.v=e,this):new S(e)}function Ue(e,t,s){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var n=s.apply(e,t||[]),i,a=[];return i={},r("next"),r("throw"),r("return"),i[Symbol.asyncIterator]=function(){return this},i;function r(f){n[f]&&(i[f]=function(u){return new Promise(function(g,C){a.push([f,u,g,C])>1||c(f,u)})})}function c(f,u){try{d(n[f](u))}catch(g){y(a[0][3],g)}}function d(f){f.value instanceof S?Promise.resolve(f.value.v).then(h,x):y(a[0][2],f)}function h(f){c("next",f)}function x(f){c("throw",f)}function y(f,u){f(u),a.shift(),a.length&&c(a[0][0],a[0][1])}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function ke(e){const t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),s=He(t),[n,i]=s.tee();return{stream:Fe(n),response:$e(i)}}async function $e(e){const t=[],s=e.getReader();for(;;){const{done:n,value:i}=await s.read();if(n)return D(Ye(t));t.push(i)}}function Fe(e){return Ue(this,arguments,function*(){const s=e.getReader();for(;;){const{value:n,done:i}=yield S(s.read());if(i)break;yield yield S(D(n))}})}function He(e){const t=e.getReader();return new ReadableStream({start(n){let i="";return a();function a(){return t.read().then(({value:r,done:c})=>{if(c){if(i.trim()){n.error(new p("Failed to parse stream"));return}n.close();return}i+=r;let d=i.match(V),h;for(;d;){try{h=JSON.parse(d[1])}catch{n.error(new p(`Error parsing JSON response: "${d[1]}"`));return}n.enqueue(h),i=i.substring(d[0].length),d=i.match(V)}return a()}).catch(r=>{let c=r;throw c.stack=r.stack,c.name==="AbortError"?c=new te("Request aborted when reading from the stream"):c=new p("Error reading from the stream"),c})}}})}function Ye(e){const t=e[e.length-1],s={promptFeedback:t==null?void 0:t.promptFeedback};for(const n of e){if(n.candidates){let i=0;for(const a of n.candidates)if(s.candidates||(s.candidates=[]),s.candidates[i]||(s.candidates[i]={index:i}),s.candidates[i].citationMetadata=a.citationMetadata,s.candidates[i].groundingMetadata=a.groundingMetadata,s.candidates[i].finishReason=a.finishReason,s.candidates[i].finishMessage=a.finishMessage,s.candidates[i].safetyRatings=a.safetyRatings,a.content&&a.content.parts){s.candidates[i].content||(s.candidates[i].content={role:a.content.role||"user",parts:[]});const r={};for(const c of a.content.parts)c.text&&(r.text=c.text),c.functionCall&&(r.functionCall=c.functionCall),c.executableCode&&(r.executableCode=c.executableCode),c.codeExecutionResult&&(r.codeExecutionResult=c.codeExecutionResult),Object.keys(r).length===0&&(r.text=""),s.candidates[i].content.parts.push(r)}i++}n.usageMetadata&&(s.usageMetadata=n.usageMetadata)}return s}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ne(e,t,s,n){const i=await w(t,N.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(s),n);return ke(i)}async function se(e,t,s,n){const a=await(await w(t,N.GENERATE_CONTENT,e,!1,JSON.stringify(s),n)).json();return{response:D(a)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ie(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function j(e){let t=[];if(typeof e=="string")t=[{text:e}];else for(const s of e)typeof s=="string"?t.push({text:s}):t.push(s);return qe(t)}function qe(e){const t={role:"user",parts:[]},s={role:"function",parts:[]};let n=!1,i=!1;for(const a of e)"functionResponse"in a?(s.parts.push(a),i=!0):(t.parts.push(a),n=!0);if(n&&i)throw new p("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!n&&!i)throw new p("No content is provided for sending chat message.");return n?t:s}function Ke(e,t){var s;let n={model:t==null?void 0:t.model,generationConfig:t==null?void 0:t.generationConfig,safetySettings:t==null?void 0:t.safetySettings,tools:t==null?void 0:t.tools,toolConfig:t==null?void 0:t.toolConfig,systemInstruction:t==null?void 0:t.systemInstruction,cachedContent:(s=t==null?void 0:t.cachedContent)===null||s===void 0?void 0:s.name,contents:[]};const i=e.generateContentRequest!=null;if(e.contents){if(i)throw new v("CountTokensRequest must have one of contents or generateContentRequest, not both.");n.contents=e.contents}else if(i)n=Object.assign(Object.assign({},n),e.generateContentRequest);else{const a=j(e);n.contents=[a]}return{generateContentRequest:n}}function J(e){let t;return e.contents?t=e:t={contents:[j(e)]},e.systemInstruction&&(t.systemInstruction=ie(e.systemInstruction)),t}function Be(e){return typeof e=="string"||Array.isArray(e)?{content:j(e)}:e}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const W=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],Pe={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function Ve(e){let t=!1;for(const s of e){const{role:n,parts:i}=s;if(!t&&n!=="user")throw new p(`First content should be with role 'user', got ${n}`);if(!k.includes(n))throw new p(`Each item should include role field. Got ${n} but valid roles are: ${JSON.stringify(k)}`);if(!Array.isArray(i))throw new p("Content should have 'parts' property with an array of Parts");if(i.length===0)throw new p("Each Content should have at least one part");const a={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const c of i)for(const d of W)d in c&&(a[d]+=1);const r=Pe[n];for(const c of W)if(!r.includes(c)&&a[c]>0)throw new p(`Content with role '${n}' can't contain '${c}' part`);t=!0}}function X(e){var t;if(e.candidates===void 0||e.candidates.length===0)return!1;const s=(t=e.candidates[0])===null||t===void 0?void 0:t.content;if(s===void 0||s.parts===void 0||s.parts.length===0)return!1;for(const n of s.parts)if(n===void 0||Object.keys(n).length===0||n.text!==void 0&&n.text==="")return!1;return!0}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const z="SILENT_ERROR";class Je{constructor(t,s,n,i={}){this.model=s,this.params=n,this._requestOptions=i,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,n!=null&&n.history&&(Ve(n.history),this._history=n.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t,s={}){var n,i,a,r,c,d;await this._sendPromise;const h=j(t),x={safetySettings:(n=this.params)===null||n===void 0?void 0:n.safetySettings,generationConfig:(i=this.params)===null||i===void 0?void 0:i.generationConfig,tools:(a=this.params)===null||a===void 0?void 0:a.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(c=this.params)===null||c===void 0?void 0:c.systemInstruction,cachedContent:(d=this.params)===null||d===void 0?void 0:d.cachedContent,contents:[...this._history,h]},y=Object.assign(Object.assign({},this._requestOptions),s);let f;return this._sendPromise=this._sendPromise.then(()=>se(this._apiKey,this.model,x,y)).then(u=>{var g;if(X(u.response)){this._history.push(h);const C=Object.assign({parts:[],role:"model"},(g=u.response.candidates)===null||g===void 0?void 0:g[0].content);this._history.push(C)}else{const C=E(u.response);C&&console.warn(`sendMessage() was unsuccessful. ${C}. Inspect response object for details.`)}f=u}).catch(u=>{throw this._sendPromise=Promise.resolve(),u}),await this._sendPromise,f}async sendMessageStream(t,s={}){var n,i,a,r,c,d;await this._sendPromise;const h=j(t),x={safetySettings:(n=this.params)===null||n===void 0?void 0:n.safetySettings,generationConfig:(i=this.params)===null||i===void 0?void 0:i.generationConfig,tools:(a=this.params)===null||a===void 0?void 0:a.tools,toolConfig:(r=this.params)===null||r===void 0?void 0:r.toolConfig,systemInstruction:(c=this.params)===null||c===void 0?void 0:c.systemInstruction,cachedContent:(d=this.params)===null||d===void 0?void 0:d.cachedContent,contents:[...this._history,h]},y=Object.assign(Object.assign({},this._requestOptions),s),f=ne(this._apiKey,this.model,x,y);return this._sendPromise=this._sendPromise.then(()=>f).catch(u=>{throw new Error(z)}).then(u=>u.response).then(u=>{if(X(u)){this._history.push(h);const g=Object.assign({},u.candidates[0].content);g.role||(g.role="model"),this._history.push(g)}else{const g=E(u);g&&console.warn(`sendMessageStream() was unsuccessful. ${g}. Inspect response object for details.`)}}).catch(u=>{u.message!==z&&console.error(u)}),f}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function We(e,t,s,n){return(await w(t,N.COUNT_TOKENS,e,!1,JSON.stringify(s),n)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xe(e,t,s,n){return(await w(t,N.EMBED_CONTENT,e,!1,JSON.stringify(s),n)).json()}async function ze(e,t,s,n){const i=s.requests.map(r=>Object.assign(Object.assign({},r),{model:t}));return(await w(t,N.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:i}),n)).json()}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q{constructor(t,s,n={}){this.apiKey=t,this._requestOptions=n,s.model.includes("/")?this.model=s.model:this.model=`models/${s.model}`,this.generationConfig=s.generationConfig||{},this.safetySettings=s.safetySettings||[],this.tools=s.tools,this.toolConfig=s.toolConfig,this.systemInstruction=ie(s.systemInstruction),this.cachedContent=s.cachedContent}async generateContent(t,s={}){var n;const i=J(t),a=Object.assign(Object.assign({},this._requestOptions),s);return se(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},i),a)}async generateContentStream(t,s={}){var n;const i=J(t),a=Object.assign(Object.assign({},this._requestOptions),s);return ne(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},i),a)}startChat(t){var s;return new Je(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(s=this.cachedContent)===null||s===void 0?void 0:s.name},t),this._requestOptions)}async countTokens(t,s={}){const n=Ke(t,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),i=Object.assign(Object.assign({},this._requestOptions),s);return We(this.apiKey,this.model,n,i)}async embedContent(t,s={}){const n=Be(t),i=Object.assign(Object.assign({},this._requestOptions),s);return Xe(this.apiKey,this.model,n,i)}async batchEmbedContents(t,s={}){const n=Object.assign(Object.assign({},this._requestOptions),s);return ze(this.apiKey,this.model,t,n)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(t){this.apiKey=t}getGenerativeModel(t,s){if(!t.model)throw new p("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new Q(this.apiKey,t,s)}getGenerativeModelFromCachedContent(t,s,n){if(!t.name)throw new v("Cached content must contain a `name` field.");if(!t.model)throw new v("Cached content must contain a `model` field.");const i=["model","systemInstruction"];for(const r of i)if(s!=null&&s[r]&&t[r]&&(s==null?void 0:s[r])!==t[r]){if(r==="model"){const c=s.model.startsWith("models/")?s.model.replace("models/",""):s.model,d=t.model.startsWith("models/")?t.model.replace("models/",""):t.model;if(c===d)continue}throw new v(`Different value for "${r}" specified in modelParams (${s[r]}) and cachedContent (${t[r]})`)}const a=Object.assign(Object.assign({},s),{model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t});return new Q(this.apiKey,a,n)}}const Ze=new Qe(""),et=[{id:"1",name:"ものづくり補助金",description:"中小企業・小規模事業者等が今後複数年にわたり相次いで直面する制度変更等に対応するため、中小企業・小規模事業者等が取り組む革新的サービス開発・試作品開発・生産プロセスの改善を行うための設備投資等を支援",eligibilityCriteria:{businessTypes:["corporation","sole_proprietor"],maxRevenue:1e9,employeeCount:{max:300},industries:["製造業","IT","サービス業"]},amountRange:{min:1e6,max:5e7,type:"variable"},deadline:"2026-03-31",category:"設備投資",applicationUrl:"https://portal.monodukuri-hojo.jp/",requiredDocuments:["事業計画書","経費明細書","決算書"],processingTime:"約6ヶ月",successRate:45},{id:"2",name:"IT導入補助金",description:"中小企業・小規模事業者等のITツール導入による業務効率化・売上アップをサポート",eligibilityCriteria:{businessTypes:["corporation","sole_proprietor"],maxRevenue:5e8,employeeCount:{max:100}},amountRange:{min:5e5,max:45e5,type:"percentage"},deadline:"2026-02-28",category:"IT・デジタル化",applicationUrl:"https://www.it-hojo.jp/",requiredDocuments:["ITツール導入計画書","見積書"],processingTime:"約3ヶ月",successRate:65},{id:"3",name:"小規模事業者持続化補助金",description:"小規模事業者が経営計画を作成し、販路開拓等に取り組む費用を支援",eligibilityCriteria:{businessTypes:["sole_proprietor","corporation"],employeeCount:{max:20}},amountRange:{min:5e5,max:2e6,type:"fixed"},deadline:"2026-01-31",category:"販路開拓",applicationUrl:"https://r3.jizokukahojokin.info/",requiredDocuments:["経営計画書","補助事業計画書"],processingTime:"約4ヶ月",successRate:70},{id:"4",name:"事業再構築補助金",description:"ポストコロナ・ウィズコロナ時代の経済社会の変化に対応するため、中小企業等の思い切った事業再構築を支援",eligibilityCriteria:{businessTypes:["corporation"],minRevenue:1e7,employeeCount:{max:500}},amountRange:{min:1e6,max:1e8,type:"variable"},deadline:"2026-04-30",category:"事業転換",applicationUrl:"https://jigyou-saikouchiku.go.jp/",requiredDocuments:["事業計画書","決算書（3期分）","認定支援機関の確認書"],processingTime:"約8ヶ月",successRate:40},{id:"5",name:"創業補助金",description:"新たに創業する者に対して、創業等に要する経費の一部を助成",eligibilityCriteria:{businessTypes:["sole_proprietor","corporation"],industries:["全業種"]},amountRange:{min:5e5,max:3e6,type:"percentage"},deadline:"2026-06-30",category:"創業支援",applicationUrl:"https://www.chusho.meti.go.jp/keiei/sogyo/",requiredDocuments:["創業計画書","資金計画書"],processingTime:"約5ヶ月",successRate:55}],tt=async()=>et,nt=async(e,t)=>{const s=[];for(const n of t){let i=0;const a=[];if(n.eligibilityCriteria.businessTypes.includes(e.businessType))i+=20,a.push("事業形態が適合しています");else continue;if(n.eligibilityCriteria.minRevenue&&e.revenue<n.eligibilityCriteria.minRevenue||n.eligibilityCriteria.maxRevenue&&e.revenue>n.eligibilityCriteria.maxRevenue)continue;(n.eligibilityCriteria.minRevenue||n.eligibilityCriteria.maxRevenue)&&(i+=20,a.push("売上規模が適合しています"));const r=n.eligibilityCriteria.employeeCount;if(r){if(r.min&&e.employeeCount<r.min||r.max&&e.employeeCount>r.max)continue;i+=15,a.push("従業員数が適合しています")}n.eligibilityCriteria.industries&&(n.eligibilityCriteria.industries.includes(e.industry)||n.eligibilityCriteria.industries.includes("全業種")?(i+=25,a.push("業種が適合しています")):i-=10),n.eligibilityCriteria.regions&&n.eligibilityCriteria.regions.includes(e.region)&&(i+=10,a.push("対象地域に該当します"));const c=new Date().getFullYear()-e.establishedYear;n.category==="創業支援"&&c<=3&&(i+=20,a.push("創業間もない企業向けの補助金です"));let d=n.amountRange.min;n.amountRange.type==="percentage"?d=Math.min(e.revenue*.1,n.amountRange.max):n.amountRange.type==="variable"&&(d=(n.amountRange.min+n.amountRange.max)/2);let h="medium";n.requiredDocuments.length<=2?h="easy":n.requiredDocuments.length>=4&&(h="hard");const x=Math.min(100,(n.successRate||50)*(i/100));s.push({subsidy:n,matchScore:Math.max(0,Math.min(100,i)),matchReasons:a,estimatedAmount:d,applicationDifficulty:h,adoptionProbability:x})}return s.sort((n,i)=>i.matchScore-n.matchScore)},st=async(e,t)=>{try{const s=Ze.getGenerativeModel({model:"gemini-pro"}),n=`
あなたは日本の補助金申請の専門家です。以下の情報を基に、補助金申請書類の下書きを作成してください。

【補助金情報】
- 名称: ${e.name}
- 説明: ${e.description}
- カテゴリ: ${e.category}
- 必要書類: ${e.requiredDocuments.join(", ")}

【事業者情報】
- 事業形態: ${t.businessType==="sole_proprietor"?"個人事業主":"法人"}
- 業種: ${t.industry}
- 年間売上: ¥${t.revenue.toLocaleString()}
- 従業員数: ${t.employeeCount}名
- 設立年: ${t.establishedYear}年

【タスク】
申請書類の各セクションについて、具体的な記載例と記入のコツを提供してください。

以下のJSON形式で回答してください：
{
  "sections": [
    {
      "title": "セクション名",
      "content": "記載例（具体的な文章）",
      "tips": ["記入のコツ1", "記入のコツ2"]
    }
  ],
  "checklist": ["確認事項1", "確認事項2"],
  "estimatedCompletionTime": "所要時間の目安"
}
`,c=(await(await s.generateContent(n)).response).text().match(/\{[\s\S]*\}/);if(c){const d=JSON.parse(c[0]);return{subsidyId:e.id,subsidyName:e.name,...d}}return Z(e,t)}catch(s){return console.error("申請書類下書き生成エラー:",s),Z(e,t)}},Z=(e,t)=>({subsidyId:e.id,subsidyName:e.name,sections:[{title:"事業概要",content:`当社は${t.industry}を主な事業としており、${new Date().getFullYear()-t.establishedYear}年の実績があります。年間売上は約${(t.revenue/1e4).toFixed(0)}万円、従業員${t.employeeCount}名で事業を展開しております。`,tips:["事業の特徴や強みを具体的に記載してください","数値データを用いて客観性を持たせましょう"]},{title:"補助事業の目的",content:`本補助金を活用し、${e.category}に取り組むことで、事業の競争力強化と持続的な成長を実現します。`,tips:["補助金の趣旨に沿った目的を明確に記載してください","具体的な成果目標を数値で示すと効果的です"]},{title:"事業計画",content:`【記載例】
1. 現状分析
2. 課題の特定
3. 解決策の提案
4. 実施スケジュール
5. 期待される効果`,tips:["実現可能性の高い計画を立ててください","スケジュールは具体的な日程で記載しましょう"]}],checklist:["必要書類がすべて揃っているか確認","数値データに誤りがないか確認","申請期限を確認","認定支援機関の確認書（必要な場合）"],estimatedCompletionTime:"約3-5時間"}),oe=e=>{const t=new Date(e),s=new Date,n=t.getTime()-s.getTime();return Math.ceil(n/(1e3*60*60*24))},it=e=>{const t=oe(e);return t<=7?"urgent":t<=30?"soon":"normal"},ut=()=>{const{user:e}=le(),{currentBusinessType:t}=de(e==null?void 0:e.id),{transactions:s}=ue(e==null?void 0:e.id,t==null?void 0:t.business_type),[n,i]=_.useState([]),[a,r]=_.useState(!1),[c,d]=_.useState(null),[h,x]=_.useState(null),[y,f]=_.useState(!1),u=()=>{const l=s.filter(m=>m.type==="income").reduce((m,b)=>m+(typeof b.amount=="number"?b.amount:0),0);return{businessType:(t==null?void 0:t.business_type)==="corporation"?"corporation":"sole_proprietor",industry:"IT",revenue:l,employeeCount:5,region:"東京都",establishedYear:2020}};_.useEffect(()=>{g()},[]);const g=async()=>{r(!0);try{const l=await tt(),m=u(),b=await nt(m,l);i(b)}catch(l){console.error("補助金データ読み込みエラー:",l)}finally{r(!1)}},C=async l=>{f(!0);try{const m=u(),b=await st(l.subsidy,m);x(b),d(l)}catch(m){console.error("申請書下書き生成エラー:",m)}finally{f(!1)}},ae=l=>{switch(l){case"urgent":return"text-red-500 bg-red-500/10 border-red-500/20";case"soon":return"text-orange-500 bg-orange-500/10 border-orange-500/20";default:return"text-green-500 bg-green-500/10 border-green-500/20"}},re=l=>{switch(l){case"easy":return"text-green-500 bg-green-500/10";case"medium":return"text-yellow-500 bg-yellow-500/10";case"hard":return"text-red-500 bg-red-500/10"}};return o.jsx("div",{className:"min-h-screen bg-background",children:o.jsxs("main",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",children:[o.jsxs("div",{className:"flex items-center mb-6",children:[o.jsx(fe,{to:"/dashboard",className:"mr-4",children:o.jsx(xe,{className:"w-6 h-6 text-text-muted hover:text-text-main"})}),o.jsxs("div",{children:[o.jsx("h1",{className:"text-2xl font-bold text-text-main",children:"補助金マッチング"}),o.jsx("p",{className:"text-text-muted",children:"あなたに最適な補助金をAIが提案"})]})]}),a?o.jsx("div",{className:"flex items-center justify-center py-20",children:o.jsxs("div",{className:"text-center",children:[o.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"}),o.jsx("p",{className:"text-text-muted",children:"補助金を検索中..."})]})}):o.jsxs(o.Fragment,{children:[o.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",children:[o.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20",children:[o.jsxs("div",{className:"flex items-center justify-between mb-2",children:[o.jsx("span",{className:"text-sm font-medium text-text-muted",children:"マッチした補助金"}),o.jsx(he,{className:"w-5 h-5 text-blue-500"})]}),o.jsx("p",{className:"text-3xl font-bold text-text-main",children:n.length}),o.jsx("p",{className:"text-xs text-text-muted mt-1",children:"件"})]}),o.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20",children:[o.jsxs("div",{className:"flex items-center justify-between mb-2",children:[o.jsx("span",{className:"text-sm font-medium text-text-muted",children:"推定受給額"}),o.jsx(ve,{className:"w-5 h-5 text-green-500"})]}),o.jsxs("p",{className:"text-3xl font-bold text-text-main",children:["¥",n.reduce((l,m)=>l+m.estimatedAmount,0).toLocaleString()]}),o.jsx("p",{className:"text-xs text-text-muted mt-1",children:"合計"})]}),o.jsxs("div",{className:"bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20",children:[o.jsxs("div",{className:"flex items-center justify-between mb-2",children:[o.jsx("span",{className:"text-sm font-medium text-text-muted",children:"高マッチ度"}),o.jsx(me,{className:"w-5 h-5 text-purple-500"})]}),o.jsx("p",{className:"text-3xl font-bold text-text-main",children:n.filter(l=>l.matchScore>=70).length}),o.jsx("p",{className:"text-xs text-text-muted mt-1",children:"件（70%以上）"})]})]}),o.jsx("div",{className:"space-y-4",children:n.map(l=>{const m=oe(l.subsidy.deadline),b=it(l.subsidy.deadline);return o.jsxs("div",{className:"bg-surface rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all",children:[o.jsx("div",{className:"flex items-start justify-between mb-4",children:o.jsxs("div",{className:"flex-1",children:[o.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[o.jsx("h3",{className:"text-lg font-bold text-text-main",children:l.subsidy.name}),o.jsxs("span",{className:`px-3 py-1 rounded-full text-xs font-bold ${l.matchScore>=80?"bg-green-500/20 text-green-500":l.matchScore>=60?"bg-blue-500/20 text-blue-500":"bg-gray-500/20 text-gray-500"}`,children:["マッチ度 ",l.matchScore,"%"]})]}),o.jsx("p",{className:"text-sm text-text-muted mb-3",children:l.subsidy.description}),o.jsx("div",{className:"flex flex-wrap gap-2 mb-3",children:l.matchReasons.map((I,T)=>o.jsxs("span",{className:"px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg",children:["✓ ",I]},T))}),o.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-4",children:[o.jsxs("div",{children:[o.jsx("p",{className:"text-xs text-text-muted mb-1",children:"推定受給額"}),o.jsxs("p",{className:"text-sm font-bold text-green-500",children:["¥",l.estimatedAmount.toLocaleString()]})]}),o.jsxs("div",{children:[o.jsx("p",{className:"text-xs text-text-muted mb-1",children:"申請難易度"}),o.jsx("p",{className:`text-sm font-bold px-2 py-1 rounded inline-block ${re(l.applicationDifficulty)}`,children:l.applicationDifficulty==="easy"?"易":l.applicationDifficulty==="medium"?"中":"難"})]}),o.jsxs("div",{children:[o.jsx("p",{className:"text-xs text-text-muted mb-1",children:"採択確率"}),o.jsxs("p",{className:"text-sm font-bold text-purple-500",children:[l.adoptionProbability.toFixed(0),"%"]})]}),o.jsxs("div",{children:[o.jsx("p",{className:"text-xs text-text-muted mb-1",children:"申請期限"}),o.jsxs("p",{className:`text-sm font-bold px-2 py-1 rounded inline-block border ${ae(b)}`,children:["残り",m,"日"]})]})]}),o.jsxs("div",{className:"mb-4",children:[o.jsx("p",{className:"text-xs text-text-muted mb-2",children:"必要書類:"}),o.jsx("div",{className:"flex flex-wrap gap-2",children:l.subsidy.requiredDocuments.map((I,T)=>o.jsxs("span",{className:"px-2 py-1 bg-surface-highlight text-text-main text-xs rounded border border-border",children:[o.jsx(ge,{className:"w-3 h-3 inline mr-1"}),I]},T))})]})]})}),o.jsxs("div",{className:"flex gap-3",children:[o.jsxs("button",{onClick:()=>C(l),disabled:y,className:"btn-primary flex items-center gap-2",children:[o.jsx(pe,{className:"w-4 h-4"}),"AI申請書下書き生成"]}),o.jsxs("a",{href:l.subsidy.applicationUrl,target:"_blank",rel:"noopener noreferrer",className:"btn-ghost flex items-center gap-2",children:[o.jsx(M,{className:"w-4 h-4"}),"公式サイト"]})]})]},l.subsidy.id)})}),h&&c&&o.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50",children:o.jsx("div",{className:"bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto",children:o.jsxs("div",{className:"p-6",children:[o.jsxs("div",{className:"flex items-center justify-between mb-6",children:[o.jsxs("div",{children:[o.jsx("h2",{className:"text-2xl font-bold text-text-main",children:"AI申請書下書き"}),o.jsx("p",{className:"text-text-muted mt-1",children:h.subsidyName})]}),o.jsx("button",{onClick:()=>{x(null),d(null)},className:"p-2 rounded-lg hover:bg-surface-highlight transition-colors",children:o.jsx(be,{className:"w-5 h-5 text-text-muted"})})]}),o.jsx("div",{className:"bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6",children:o.jsxs("div",{className:"flex items-center gap-2",children:[o.jsx(ye,{className:"w-5 h-5 text-blue-500"}),o.jsxs("span",{className:"text-sm font-medium text-text-main",children:["推定作成時間: ",h.estimatedCompletionTime]})]})}),o.jsx("div",{className:"space-y-6 mb-6",children:h.sections.map((l,m)=>o.jsxs("div",{className:"border border-border rounded-lg p-4",children:[o.jsx("h3",{className:"text-lg font-bold text-text-main mb-3",children:l.title}),o.jsx("div",{className:"bg-surface-highlight rounded-lg p-4 mb-3",children:o.jsx("p",{className:"text-sm text-text-main whitespace-pre-wrap",children:l.content})}),l.tips.length>0&&o.jsxs("div",{className:"space-y-2",children:[o.jsx("p",{className:"text-xs font-medium text-text-muted",children:"💡 記入のコツ:"}),o.jsx("ul",{className:"space-y-1",children:l.tips.map((b,I)=>o.jsxs("li",{className:"text-xs text-text-muted flex items-start gap-2",children:[o.jsx("span",{className:"text-primary mt-1",children:"•"}),o.jsx("span",{children:b})]},I))})]})]},m))}),o.jsxs("div",{className:"border border-border rounded-lg p-4 mb-6",children:[o.jsx("h3",{className:"text-lg font-bold text-text-main mb-3",children:"提出前チェックリスト"}),o.jsx("ul",{className:"space-y-2",children:h.checklist.map((l,m)=>o.jsxs("li",{className:"flex items-start gap-2 text-sm text-text-muted",children:[o.jsx(Ce,{className:"w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"}),o.jsx("span",{children:l})]},m))})]}),o.jsxs("div",{className:"flex gap-3",children:[o.jsxs("button",{onClick:()=>{alert("PDF出力機能は開発中です")},className:"btn-primary flex items-center gap-2",children:[o.jsx(M,{className:"w-4 h-4"}),"PDFで保存"]}),o.jsx("button",{onClick:()=>{x(null),d(null)},className:"btn-ghost",children:"閉じる"})]})]})})})]})]})})};export{ut as default};
