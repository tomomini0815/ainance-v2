import{r as N,j as s,S as F,X as ye,d as X,J as Te,C as Ae,_ as De,a as Me,e as Le,l as $e,L as ke,i as Q,T as Ge,F as Ue}from"./index-C8W6MraP.js";import{g as Fe}from"./pdfJapaneseService-DKF38fEE.js";import{g as J}from"./motion-DyBA9AKK.js";import{A as qe}from"./index-RYpQHxZL.js";import{I as V}from"./info-DXXnz00J.js";import{A as He}from"./arrow-left-fE9IanCp.js";import{J as Pe}from"./japanese-yen-De-3m8I3.js";import{D as Z}from"./download-Dqr9MOs_.js";import{C as Ye}from"./clock-150h8Ybv.js";import{T as Be}from"./trophy-B7aI_pFt.js";import{L as Ke}from"./lightbulb-BBxUkh6x.js";import{C as Je}from"./circle-check-big-CIiSfE0f.js";import"./pdfAutoFillService-Dbgeiub2.js";var ee;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(ee||(ee={}));/**
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
 */var te;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(te||(te={}));var se;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(se||(se={}));/**
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
 */const ne=["user","model","function","system"];var ie;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(ie||(ie={}));var re;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(re||(re={}));var ae;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(ae||(ae={}));var oe;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(oe||(oe={}));var D;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"})(D||(D={}));var ce;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(ce||(ce={}));var le;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(le||(le={}));var de;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(de||(de={}));/**
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
 */class C extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class O extends C{constructor(t,n){super(t),this.response=n}}class ve extends C{constructor(t,n,i,r){super(t),this.status=n,this.statusText=i,this.errorDetails=r}}class S extends C{}class Ne extends C{}/**
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
 */const Ve="https://generativelanguage.googleapis.com",We="v1beta",ze="0.24.1",Xe="genai-js";var R;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(R||(R={}));class Qe{constructor(t,n,i,r,a){this.model=t,this.task=n,this.apiKey=i,this.stream=r,this.requestOptions=a}toString(){var t,n;const i=((t=this.requestOptions)===null||t===void 0?void 0:t.apiVersion)||We;let a=`${((n=this.requestOptions)===null||n===void 0?void 0:n.baseUrl)||Ve}/${i}/${this.model}:${this.task}`;return this.stream&&(a+="?alt=sse"),a}}function Ze(e){const t=[];return e!=null&&e.apiClient&&t.push(e.apiClient),t.push(`${Xe}/${ze}`),t.join(" ")}async function et(e){var t;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",Ze(e.requestOptions)),n.append("x-goog-api-key",e.apiKey);let i=(t=e.requestOptions)===null||t===void 0?void 0:t.customHeaders;if(i){if(!(i instanceof Headers))try{i=new Headers(i)}catch(r){throw new S(`unable to convert customHeaders value ${JSON.stringify(i)} to Headers: ${r.message}`)}for(const[r,a]of i.entries()){if(r==="x-goog-api-key")throw new S(`Cannot set reserved header name ${r}`);if(r==="x-goog-api-client")throw new S(`Header name ${r} can only be set using the apiClient field`);n.append(r,a)}}return n}async function tt(e,t,n,i,r,a){const o=new Qe(e,t,n,i,a);return{url:o.toString(),fetchOptions:Object.assign(Object.assign({},rt(a)),{method:"POST",headers:await et(o),body:r})}}async function $(e,t,n,i,r,a={},o=fetch){const{url:l,fetchOptions:u}=await tt(e,t,n,i,r,a);return st(l,u,o)}async function st(e,t,n=fetch){let i;try{i=await n(e,t)}catch(r){nt(r,e)}return i.ok||await it(i,e),i}function nt(e,t){let n=e;throw n.name==="AbortError"?(n=new Ne(`Request aborted when fetching ${t.toString()}: ${e.message}`),n.stack=e.stack):e instanceof ve||e instanceof S||(n=new C(`Error fetching from ${t.toString()}: ${e.message}`),n.stack=e.stack),n}async function it(e,t){let n="",i;try{const r=await e.json();n=r.error.message,r.error.details&&(n+=` ${JSON.stringify(r.error.details)}`,i=r.error.details)}catch{}throw new ve(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${n}`,e.status,e.statusText,i)}function rt(e){const t={};if((e==null?void 0:e.signal)!==void 0||(e==null?void 0:e.timeout)>=0){const n=new AbortController;(e==null?void 0:e.timeout)>=0&&setTimeout(()=>n.abort(),e.timeout),e!=null&&e.signal&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}/**
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
 */function W(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),U(e.candidates[0]))throw new O(`${_(e)}`,e);return at(e)}else if(e.promptFeedback)throw new O(`Text not available. ${_(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),U(e.candidates[0]))throw new O(`${_(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),ue(e)[0]}else if(e.promptFeedback)throw new O(`Function call not available. ${_(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),U(e.candidates[0]))throw new O(`${_(e)}`,e);return ue(e)}else if(e.promptFeedback)throw new O(`Function call not available. ${_(e)}`,e)},e}function at(e){var t,n,i,r;const a=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const o of(r=(i=e.candidates)===null||i===void 0?void 0:i[0].content)===null||r===void 0?void 0:r.parts)o.text&&a.push(o.text),o.executableCode&&a.push("\n```"+o.executableCode.language+`
`+o.executableCode.code+"\n```\n"),o.codeExecutionResult&&a.push("\n```\n"+o.codeExecutionResult.output+"\n```\n");return a.length>0?a.join(""):""}function ue(e){var t,n,i,r;const a=[];if(!((n=(t=e.candidates)===null||t===void 0?void 0:t[0].content)===null||n===void 0)&&n.parts)for(const o of(r=(i=e.candidates)===null||i===void 0?void 0:i[0].content)===null||r===void 0?void 0:r.parts)o.functionCall&&a.push(o.functionCall);if(a.length>0)return a}const ot=[D.RECITATION,D.SAFETY,D.LANGUAGE];function U(e){return!!e.finishReason&&ot.includes(e.finishReason)}function _(e){var t,n,i;let r="";if((!e.candidates||e.candidates.length===0)&&e.promptFeedback)r+="Response was blocked",!((t=e.promptFeedback)===null||t===void 0)&&t.blockReason&&(r+=` due to ${e.promptFeedback.blockReason}`),!((n=e.promptFeedback)===null||n===void 0)&&n.blockReasonMessage&&(r+=`: ${e.promptFeedback.blockReasonMessage}`);else if(!((i=e.candidates)===null||i===void 0)&&i[0]){const a=e.candidates[0];U(a)&&(r+=`Candidate was blocked due to ${a.finishReason}`,a.finishMessage&&(r+=`: ${a.finishMessage}`))}return r}function M(e){return this instanceof M?(this.v=e,this):new M(e)}function ct(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=n.apply(e,t||[]),r,a=[];return r={},o("next"),o("throw"),o("return"),r[Symbol.asyncIterator]=function(){return this},r;function o(x){i[x]&&(r[x]=function(h){return new Promise(function(b,j){a.push([x,h,b,j])>1||l(x,h)})})}function l(x,h){try{u(i[x](h))}catch(b){v(a[0][3],b)}}function u(x){x.value instanceof M?Promise.resolve(x.value.v).then(f,m):v(a[0][2],x)}function f(x){l("next",x)}function m(x){l("throw",x)}function v(x,h){x(h),a.shift(),a.length&&l(a[0][0],a[0][1])}}/**
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
 */const me=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function lt(e){const t=e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0})),n=mt(t),[i,r]=n.tee();return{stream:ut(i),response:dt(r)}}async function dt(e){const t=[],n=e.getReader();for(;;){const{done:i,value:r}=await n.read();if(i)return W(ht(t));t.push(r)}}function ut(e){return ct(this,arguments,function*(){const n=e.getReader();for(;;){const{value:i,done:r}=yield M(n.read());if(r)break;yield yield M(W(i))}})}function mt(e){const t=e.getReader();return new ReadableStream({start(i){let r="";return a();function a(){return t.read().then(({value:o,done:l})=>{if(l){if(r.trim()){i.error(new C("Failed to parse stream"));return}i.close();return}r+=o;let u=r.match(me),f;for(;u;){try{f=JSON.parse(u[1])}catch{i.error(new C(`Error parsing JSON response: "${u[1]}"`));return}i.enqueue(f),r=r.substring(u[0].length),u=r.match(me)}return a()}).catch(o=>{let l=o;throw l.stack=o.stack,l.name==="AbortError"?l=new Ne("Request aborted when reading from the stream"):l=new C("Error reading from the stream"),l})}}})}function ht(e){const t=e[e.length-1],n={promptFeedback:t==null?void 0:t.promptFeedback};for(const i of e){if(i.candidates){let r=0;for(const a of i.candidates)if(n.candidates||(n.candidates=[]),n.candidates[r]||(n.candidates[r]={index:r}),n.candidates[r].citationMetadata=a.citationMetadata,n.candidates[r].groundingMetadata=a.groundingMetadata,n.candidates[r].finishReason=a.finishReason,n.candidates[r].finishMessage=a.finishMessage,n.candidates[r].safetyRatings=a.safetyRatings,a.content&&a.content.parts){n.candidates[r].content||(n.candidates[r].content={role:a.content.role||"user",parts:[]});const o={};for(const l of a.content.parts)l.text&&(o.text=l.text),l.functionCall&&(o.functionCall=l.functionCall),l.executableCode&&(o.executableCode=l.executableCode),l.codeExecutionResult&&(o.codeExecutionResult=l.codeExecutionResult),Object.keys(o).length===0&&(o.text=""),n.candidates[r].content.parts.push(o)}r++}i.usageMetadata&&(n.usageMetadata=i.usageMetadata)}return n}/**
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
 */async function Ce(e,t,n,i){const r=await $(t,R.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),i);return lt(r)}async function je(e,t,n,i){const a=await(await $(t,R.GENERATE_CONTENT,e,!1,JSON.stringify(n),i)).json();return{response:W(a)}}/**
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
 */function we(e){if(e!=null){if(typeof e=="string")return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function L(e){let t=[];if(typeof e=="string")t=[{text:e}];else for(const n of e)typeof n=="string"?t.push({text:n}):t.push(n);return xt(t)}function xt(e){const t={role:"user",parts:[]},n={role:"function",parts:[]};let i=!1,r=!1;for(const a of e)"functionResponse"in a?(n.parts.push(a),r=!0):(t.parts.push(a),i=!0);if(i&&r)throw new C("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!i&&!r)throw new C("No content is provided for sending chat message.");return i?t:n}function ft(e,t){var n;let i={model:t==null?void 0:t.model,generationConfig:t==null?void 0:t.generationConfig,safetySettings:t==null?void 0:t.safetySettings,tools:t==null?void 0:t.tools,toolConfig:t==null?void 0:t.toolConfig,systemInstruction:t==null?void 0:t.systemInstruction,cachedContent:(n=t==null?void 0:t.cachedContent)===null||n===void 0?void 0:n.name,contents:[]};const r=e.generateContentRequest!=null;if(e.contents){if(r)throw new S("CountTokensRequest must have one of contents or generateContentRequest, not both.");i.contents=e.contents}else if(r)i=Object.assign(Object.assign({},i),e.generateContentRequest);else{const a=L(e);i.contents=[a]}return{generateContentRequest:i}}function he(e){let t;return e.contents?t=e:t={contents:[L(e)]},e.systemInstruction&&(t.systemInstruction=we(e.systemInstruction)),t}function pt(e){return typeof e=="string"||Array.isArray(e)?{content:L(e)}:e}/**
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
 */const xe=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],gt={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function bt(e){let t=!1;for(const n of e){const{role:i,parts:r}=n;if(!t&&i!=="user")throw new C(`First content should be with role 'user', got ${i}`);if(!ne.includes(i))throw new C(`Each item should include role field. Got ${i} but valid roles are: ${JSON.stringify(ne)}`);if(!Array.isArray(r))throw new C("Content should have 'parts' property with an array of Parts");if(r.length===0)throw new C("Each Content should have at least one part");const a={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const l of r)for(const u of xe)u in l&&(a[u]+=1);const o=gt[i];for(const l of xe)if(!o.includes(l)&&a[l]>0)throw new C(`Content with role '${i}' can't contain '${l}' part`);t=!0}}function fe(e){var t;if(e.candidates===void 0||e.candidates.length===0)return!1;const n=(t=e.candidates[0])===null||t===void 0?void 0:t.content;if(n===void 0||n.parts===void 0||n.parts.length===0)return!1;for(const i of n.parts)if(i===void 0||Object.keys(i).length===0||i.text!==void 0&&i.text==="")return!1;return!0}/**
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
 */const pe="SILENT_ERROR";class yt{constructor(t,n,i,r={}){this.model=n,this.params=i,this._requestOptions=r,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,i!=null&&i.history&&(bt(i.history),this._history=i.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t,n={}){var i,r,a,o,l,u;await this._sendPromise;const f=L(t),m={safetySettings:(i=this.params)===null||i===void 0?void 0:i.safetySettings,generationConfig:(r=this.params)===null||r===void 0?void 0:r.generationConfig,tools:(a=this.params)===null||a===void 0?void 0:a.tools,toolConfig:(o=this.params)===null||o===void 0?void 0:o.toolConfig,systemInstruction:(l=this.params)===null||l===void 0?void 0:l.systemInstruction,cachedContent:(u=this.params)===null||u===void 0?void 0:u.cachedContent,contents:[...this._history,f]},v=Object.assign(Object.assign({},this._requestOptions),n);let x;return this._sendPromise=this._sendPromise.then(()=>je(this._apiKey,this.model,m,v)).then(h=>{var b;if(fe(h.response)){this._history.push(f);const j=Object.assign({parts:[],role:"model"},(b=h.response.candidates)===null||b===void 0?void 0:b[0].content);this._history.push(j)}else{const j=_(h.response);j&&console.warn(`sendMessage() was unsuccessful. ${j}. Inspect response object for details.`)}x=h}).catch(h=>{throw this._sendPromise=Promise.resolve(),h}),await this._sendPromise,x}async sendMessageStream(t,n={}){var i,r,a,o,l,u;await this._sendPromise;const f=L(t),m={safetySettings:(i=this.params)===null||i===void 0?void 0:i.safetySettings,generationConfig:(r=this.params)===null||r===void 0?void 0:r.generationConfig,tools:(a=this.params)===null||a===void 0?void 0:a.tools,toolConfig:(o=this.params)===null||o===void 0?void 0:o.toolConfig,systemInstruction:(l=this.params)===null||l===void 0?void 0:l.systemInstruction,cachedContent:(u=this.params)===null||u===void 0?void 0:u.cachedContent,contents:[...this._history,f]},v=Object.assign(Object.assign({},this._requestOptions),n),x=Ce(this._apiKey,this.model,m,v);return this._sendPromise=this._sendPromise.then(()=>x).catch(h=>{throw new Error(pe)}).then(h=>h.response).then(h=>{if(fe(h)){this._history.push(f);const b=Object.assign({},h.candidates[0].content);b.role||(b.role="model"),this._history.push(b)}else{const b=_(h);b&&console.warn(`sendMessageStream() was unsuccessful. ${b}. Inspect response object for details.`)}}).catch(h=>{h.message!==pe&&console.error(h)}),x}}/**
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
 */async function vt(e,t,n,i){return(await $(t,R.COUNT_TOKENS,e,!1,JSON.stringify(n),i)).json()}/**
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
 */async function Nt(e,t,n,i){return(await $(t,R.EMBED_CONTENT,e,!1,JSON.stringify(n),i)).json()}async function Ct(e,t,n,i){const r=n.requests.map(o=>Object.assign(Object.assign({},o),{model:t}));return(await $(t,R.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:r}),i)).json()}/**
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
 */class ge{constructor(t,n,i={}){this.apiKey=t,this._requestOptions=i,n.model.includes("/")?this.model=n.model:this.model=`models/${n.model}`,this.generationConfig=n.generationConfig||{},this.safetySettings=n.safetySettings||[],this.tools=n.tools,this.toolConfig=n.toolConfig,this.systemInstruction=we(n.systemInstruction),this.cachedContent=n.cachedContent}async generateContent(t,n={}){var i;const r=he(t),a=Object.assign(Object.assign({},this._requestOptions),n);return je(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(i=this.cachedContent)===null||i===void 0?void 0:i.name},r),a)}async generateContentStream(t,n={}){var i;const r=he(t),a=Object.assign(Object.assign({},this._requestOptions),n);return Ce(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(i=this.cachedContent)===null||i===void 0?void 0:i.name},r),a)}startChat(t){var n;return new yt(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:(n=this.cachedContent)===null||n===void 0?void 0:n.name},t),this._requestOptions)}async countTokens(t,n={}){const i=ft(t,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),r=Object.assign(Object.assign({},this._requestOptions),n);return vt(this.apiKey,this.model,i,r)}async embedContent(t,n={}){const i=pt(t),r=Object.assign(Object.assign({},this._requestOptions),n);return Nt(this.apiKey,this.model,i,r)}async batchEmbedContents(t,n={}){const i=Object.assign(Object.assign({},this._requestOptions),n);return Ct(this.apiKey,this.model,t,i)}}/**
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
 */class jt{constructor(t){this.apiKey=t}getGenerativeModel(t,n){if(!t.model)throw new C("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new ge(this.apiKey,t,n)}getGenerativeModelFromCachedContent(t,n,i){if(!t.name)throw new S("Cached content must contain a `name` field.");if(!t.model)throw new S("Cached content must contain a `model` field.");const r=["model","systemInstruction"];for(const o of r)if(n!=null&&n[o]&&t[o]&&(n==null?void 0:n[o])!==t[o]){if(o==="model"){const l=n.model.startsWith("models/")?n.model.replace("models/",""):n.model,u=t.model.startsWith("models/")?t.model.replace("models/",""):t.model;if(l===u)continue}throw new S(`Different value for "${o}" specified in modelParams (${n[o]}) and cachedContent (${t[o]})`)}const a=Object.assign(Object.assign({},n),{model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t});return new ge(this.apiKey,a,i)}}const H=new jt("AIzaSyCf0pSoeaNdpufVKw3mNeNU66oIeCTmqkQ"),wt=[{id:"1",name:"ものづくり補助金",description:"中小企業・小規模事業者等が取り組む革新的サービス開発・試作品開発・生産プロセスの改善を行うための設備投資等を支援。",eligibilityCriteria:{businessTypes:["corporation","sole_proprietor"],maxRevenue:1e9,employeeCount:{max:300},industries:["製造業","IT","サービス業"]},amountRange:{min:1e6,max:5e7,type:"variable"},deadline:"2026-03-31",category:"設備投資",applicationUrl:"https://portal.monodukuri-hojo.jp/",requiredDocuments:["事業計画書","経費明細書","決算書"],processingTime:"約6ヶ月",successRate:45},{id:"2",name:"IT導入補助金（通常枠）",description:"中小企業・小規模事業者等のITツール導入による業務効率化・売上アップを支援。ソフトウェアやクラウド利用料が対象。",eligibilityCriteria:{businessTypes:["corporation","sole_proprietor"],maxRevenue:5e8,employeeCount:{max:100}},amountRange:{min:5e5,max:45e5,type:"percentage"},deadline:"2026-02-28",category:"IT・デジタル化",applicationUrl:"https://www.it-hojo.jp/",requiredDocuments:["ITツール導入計画書","見積書","納税証明書"],processingTime:"約3ヶ月",successRate:65},{id:"3",name:"小規模事業者持続化補助金（一般枠）",description:"販路開拓や業務効率化に取り組む小規模事業者を支援。個人事業主の採択実績が非常に豊富。",eligibilityCriteria:{businessTypes:["sole_proprietor","corporation"],employeeCount:{max:20}},amountRange:{min:5e5,max:2e6,type:"fixed"},deadline:"2026-01-31",category:"販路開拓",applicationUrl:"https://r3.jizokukahojokin.info/",requiredDocuments:["経営計画書","補助事業計画書"],processingTime:"約4ヶ月",successRate:70},{id:"4",name:"事業再構築補助金",description:"新分野展開、業態転換、事業・業種転換など、思い切った事業の再構築を支援（大規模投資向け）。",eligibilityCriteria:{businessTypes:["corporation"],minRevenue:1e7,employeeCount:{max:500}},amountRange:{min:1e6,max:1e8,type:"variable"},deadline:"2026-04-30",category:"事業転換",applicationUrl:"https://jigyou-saikouchiku.go.jp/",requiredDocuments:["事業計画書","決算書（3期分）","認定支援機関の確認書"],processingTime:"約8ヶ月",successRate:40},{id:"5",name:"東京都 創業助成金",description:"都内で創業予定または創業後5年未満の方を対象。賃借料、広告費、人件費等を幅広く支援。",eligibilityCriteria:{businessTypes:["sole_proprietor","corporation"],regions:["東京都"]},amountRange:{min:1e6,max:4e6,type:"percentage"},deadline:"2026-06-30",category:"創業支援",applicationUrl:"https://www.startup-station.jp/",requiredDocuments:["創業計画書","資金計画書","履歴事項全部証明書"],processingTime:"約5ヶ月",successRate:55},{id:"6",name:"フリーランス・個人事業主活動支援給付",description:"デジタルスキルの習得や機材導入を行う個人事業主・フリーランスを支援。申請が非常に簡略化されています。",eligibilityCriteria:{businessTypes:["sole_proprietor"],maxRevenue:1e7},amountRange:{min:1e5,max:5e5,type:"fixed"},deadline:"2026-05-15",category:"活動支援",applicationUrl:"https://www.example.go.jp/freelance-support",requiredDocuments:["活動報告書","身分証明書"],processingTime:"約1ヶ月",successRate:85}],Ee=async()=>wt,_e=async(e,t)=>{const n=[];for(const i of t){let r=0;const a=[];if(i.eligibilityCriteria.businessTypes.includes(e.businessType))r+=30,e.businessType==="sole_proprietor"?a.push("個人事業主でも申請可能な枠です"):a.push("法人格を活かした申請が可能です");else continue;if(i.eligibilityCriteria.minRevenue&&e.revenue<i.eligibilityCriteria.minRevenue||i.eligibilityCriteria.maxRevenue&&e.revenue>i.eligibilityCriteria.maxRevenue)continue;(i.eligibilityCriteria.minRevenue||i.eligibilityCriteria.maxRevenue)&&(r+=15,a.push("売上規模が要件に適合しています"));const o=i.eligibilityCriteria.employeeCount;if(o){if(o.min&&e.employeeCount<o.min||o.max&&e.employeeCount>o.max)continue;r+=15,a.push("従業員数が規模に適合しています")}i.eligibilityCriteria.industries?(i.eligibilityCriteria.industries.includes(e.industry)||i.eligibilityCriteria.industries.includes("全業種")||i.eligibilityCriteria.industries.includes("IT"))&&(r+=25,a.push("業種が重点対象に該当します")):r+=10,i.eligibilityCriteria.regions&&i.eligibilityCriteria.regions.includes(e.region)&&(r+=15,a.push("対象地域（"+e.region+"）の公募です"));const l=new Date().getFullYear()-e.establishedYear;i.category==="創業支援"&&l<=5&&(r+=20,a.push("創業初期の支援が手厚い補助金です"));let u=i.amountRange.min;i.amountRange.type==="percentage"?u=Math.min(e.revenue*.15,i.amountRange.max):i.amountRange.type==="variable"&&(u=(i.amountRange.min+i.amountRange.max)/3);let f="medium";i.requiredDocuments.length<=2?f="easy":i.requiredDocuments.length>=5&&(f="hard");const m=Math.min(95,(i.successRate||50)*(r/80));n.push({subsidy:i,matchScore:Math.max(0,Math.min(100,r)),matchReasons:a,estimatedAmount:u,applicationDifficulty:f,adoptionProbability:m})}return n.sort((i,r)=>r.matchScore-i.matchScore)},Se=async(e,t)=>{try{const n=H.getGenerativeModel({model:"gemini-pro"}),i=`
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
`,l=(await(await n.generateContent(i)).response).text().match(/\{[\s\S]*\}/);if(l)try{const u=JSON.parse(l[0]);return{subsidyId:e.id,subsidyName:e.name,...u}}catch(u){console.error("Draft generation JSON error:",u)}return q(e,t)}catch(n){return console.error("申請書類下書き生成エラー:",n),q(e,t)}},q=(e,t)=>({subsidyId:e.id,subsidyName:e.name,sections:[{title:"事業概要",content:`当社は${t.industry}を主な事業としており、${new Date().getFullYear()-t.establishedYear}年の実績があります。年間売上は約${(t.revenue/1e4).toFixed(0)}万円、従業員${t.employeeCount}名で事業を展開しております。`,tips:["事業の特徴や強みを具体的に記載してください","数値データを用いて客観性を持たせましょう"]},{title:"補助事業の目的",content:`本補助金を活用し、${e.category}に取り組むことで、事業の競争力強化と持続的な成長を実現します。`,tips:["補助金の趣旨に沿った目的を明確に記載してください","具体的な成果目標を数値で示すと効果的です"]},{title:"事業計画",content:`【記載例】
1. 現状分析
2. 課題の特定
3. 解決策の提案
4. 実施スケジュール
5. 期待される効果`,tips:["実現可能性の高い計画を立ててください","スケジュールは具体的な日程で記載しましょう"]}],checklist:["必要書類がすべて揃っているか確認","数値データに誤りがないか確認","申請期限を確認","認定支援機関の確認書（必要な場合）"],estimatedCompletionTime:"約3-5時間"}),z=e=>{const t=new Date(e),n=new Date,i=t.getTime()-n.getTime();return Math.ceil(i/(1e3*60*60*24))},Ie=e=>{const t=z(e);return t<=7?"urgent":t<=30?"soon":"normal"},be=[{id:"step1",title:"事業計画の骨子",sectionTitle:"１．事業計画の概要と目的",question:"今回の補助事業で解決したい具体的な経営課題と、達成したい数値目標は何ですか？",options:[{id:"1",label:"生産性向上（労働時間削減）",description:"IT導入によるルーチン業務の自動化"},{id:"2",label:"新市場開拓（売上成長）",description:"ECサイト展開による全国への販路拡大"},{id:"3",label:"コスト最適化",description:"新設備導入による原材料ロスの低減"}],allowCustom:!0},{id:"step2",title:"市場のニーズと強み",sectionTitle:"２．市場の状況と自社の優位性",question:"ターゲットとする市場のニーズと、競合他社に対する貴社の独自の強みは何ですか？",options:[{id:"1",label:"独自の技術力・ノウハウ",description:"長年培った専門的な製造技術"},{id:"2",label:"地域密着のネットワーク",description:"既存顧客との強い信頼関係"},{id:"3",label:"高品質・高付加価値",description:"他社にはない独自のデザインや機能"}],allowCustom:!0},{id:"step3",title:"期待される成果",sectionTitle:"３．補助事業の成果と波及効果",question:"事業実施後、3〜5年でどのような定量的な成果（利益率、付加価値額など）を見込んでいますか？",options:[{id:"1",label:"付加価値額の年率3%以上向上",description:"生産性アップによる収益性改善"},{id:"2",label:"新規顧客数の大幅増加",description:"認知度向上による継続的な集客"},{id:"3",label:"地域雇用の創出",description:"事業拡大に伴う新規採用の計画"}],allowCustom:!0}],Re=async(e,t)=>{try{const n=H.getGenerativeModel({model:"gemini-pro"}),i=`
あなたは日本国内の補助金申請（再構築補助金、ものづくり補助金、IT導入補助金、持続化補助金など）の採択を熟知した専門家です。
「${e.name}」への申請を検討している事業者（${t.industry}、売上¥${t.revenue.toLocaleString()}）に対して、
採択率を最大化するための申請書類を作成するための「戦略的な質問」を3つ作成してください。

質問を作成する際の重要ポイント：
1. 定量的な目標（KPI）: 「売上○%アップ」「コスト○時間削減」などを引き出す質問。
2. 政策目的への合致: この補助金の趣旨（例：デジタルトランスフォーメーション、地域活性化など）を意識させる質問。
3. 競合優位性: なぜ「自社」でなければならないのか、独自の強みを具体化する質問。

以下のJSON形式で回答してください：
[
  {
    "id": "step1",
    "title": "事業計画の骨子",
    "sectionTitle": "１．補助事業の目的と具体的な課題",
    "question": "（ここに戦略的な質問：例 解決したい課題と具体的な数値目標は何ですか？）",
    "options": [
      { "id": "opt1", "label": "...", "description": "...", "suggestedContent": "..." }
    ],
    "allowCustom": true
  }
]
`,l=(await(await n.generateContent(i)).response).text().match(/\[[\s\S]*\]/);if(l){const u=JSON.parse(l[0]);if(Array.isArray(u)&&u.length>0)return u}return console.warn("ウィザード生成: JSONパース失敗または空配列のためフォールバックを使用します"),be}catch(n){return console.error("ウィザードステップ生成エラー:",n),be}},Et=async(e,t,n,i)=>{var r,a;try{const o=H.getGenerativeModel({model:"gemini-pro"}),l=`
あなたは補助金採択の審査員を納得させる申請書作成のプロフェッショナルです。
補助金「${e.name}」の「${n.sectionTitle}」セクションを、以下のユーザー回答に基づき「採択されるレベル」まで昇華させて作成してください。

【制約条件】
1. Before/Afterの明確化: 現状の課題と、実施後の改善効果を対比させてください。
2. 数値的根拠: 可能な限り「労働時間20%削減」「売上15%向上」といった具体的な数値を含めてください。
3. 説得力のある文体: 専門用語は適切に使いつつ、第三者が読んでも分かりやすい論理的な文章（です・ます調）にしてください。
4. 政策 alignment: 地域経済への波及効果や、業界全体のDX推進など、社会的な意義にも触れてください。

【事業者情報】
業種: ${t.industry}
売上: ${t.revenue}円

【質問】
${n.question}

【ユーザー回答】
${i}

出力は作成した文章のみを返してください。挨拶や説明は不要です。
        `;return(await o.generateContent(l)).response.text().trim()}catch(o){return(r=o.message)!=null&&r.includes("API key not valid")||(a=o.message)!=null&&a.includes("400")?(console.warn("APIキーが無効なため、モックデータを使用します"),_t(n,i)):(console.error("セクション下書き生成エラー詳細:",{message:o.message,code:o.code,details:o.details,stepId:n.id,sectionTitle:n.sectionTitle}),`（${n.sectionTitle}の生成に失敗しました。詳細を手動で入力してください。）

【エラー原因】
${o.message||"不明なエラー"}

【元の回答】
${i}`)}},_t=(e,t)=>{switch(e.id){case"step1":return`【現状と目的】
現在、${t}という課題に直面しており、業務効率の停滞が顕著となっています。本事業を実施することで、IT導入により手作業を自動化し、月間労働時間を約25%削減（推定15時間）することを目指します。これにより、付加価値の高い業務へリソースを集中させ、持続的な成長基盤を構築します。`;case"step2":return`【市場分析と独自性】
市場環境を分析した結果、${t}に対する需要が高まっています。近隣他社との差別化要因として、当社の強みである専門的ノウハウを最大限活用し、独自のサービス提供モデルを確立します。これは顧客満足度の向上と、リピート率10%改善に直結する戦略的な取り組みです。`;case"step3":return`【事業成果の見込み】
本事業の実施により、${t}という具体的な波及効果を期待しています。3年後には営業利益率を現在の水準から5%ポイント向上させる計画であり、これは地域経済への雇用創出や、業界におけるデジタルトランスフォーメーションのモデルケースとなることを確信しております。`;default:return`${t}に関する具体的な実行計画を策定します。現状の課題解決、目標数値の達成、そして将来の事業拡大という一貫したストーリーに基づき、実効性の高いプロジェクトを推進いたします。`}},Oe=async(e,t,n,i)=>{if(i)return{subsidyId:e.id,subsidyName:e.name,sections:Object.values(i).map(r=>({title:r.title,content:r.content,tips:["採択率を高めるために、具体的な数値目標が含まれていることを確認してください"]})),strategicSummary:"本計画は「生産性の向上」と「市場優位性の確立」に重点を置いて構成されています。Before/Afterの数値対比により、審査員に事業の実効性を強くアピールします。",strategicAdvice:["数値目標の根拠（見積書や市場データ）を準備しておきましょう","地域経済への貢献（雇用創出など）を追記するとさらなる加点が期待できます","既存事業とのシナジー（相乗効果）を強調してください"],checklist:["誤字脱字がないか確認","具体的な数値が入っているか確認"],estimatedCompletionTime:"作成済み"};try{const r=H.getGenerativeModel({model:"gemini-pro"}),a=`
補助金「${e.name}」の申請書類を、以下のユーザーの回答に基づいて作成してください。

【ユーザーの回答】
${Object.entries(n).map(([m,v])=>`- ${m}: ${v}`).join(`
`)}

【事業者情報】
- 業種: ${t.industry}
- 規模: 従業員${t.employeeCount}名

以下のJSON形式で回答してください：
{
  "sections": [
    {
      "title": "セクション名",
      "content": "回答を反映した具体的な文章",
      "tips": ["コツ"]
    }
  ],
  "checklist": ["確認事項"],
  "estimatedCompletionTime": "約X時間",
  "strategicSummary": "全体的な戦略の要約（採択のポイント）",
  "strategicAdvice": ["改善のための具体的なアドバイス1", "アドバイス2"]
}
`,f=(await(await r.generateContent(a)).response).text().match(/\{[\s\S]*\}/);if(f)try{const m=JSON.parse(f[0]);return{subsidyId:e.id,subsidyName:e.name,...m}}catch(m){console.error("Wizard draft generation JSON error:",m)}return q(e,t)}catch(r){return console.error("ウィザードからの下書き生成エラー:",r),q(e,t)}},St=Object.freeze(Object.defineProperty({__proto__:null,fetchSubsidies:Ee,generateApplicationDraft:Se,generateDraftFromWizard:Oe,generateSectionDraft:Et,generateWizardSteps:Re,getDaysUntilDeadline:z,getDeadlineUrgency:Ie,matchSubsidies:_e},Symbol.toStringTag,{value:"Module"})),It=({match:e,profile:t,onClose:n,onComplete:i})=>{var G,c;const[r,a]=N.useState([]),[o,l]=N.useState(0),[u,f]=N.useState({}),[m,v]=N.useState({}),[x,h]=N.useState("question"),[b,j]=N.useState(!0),[w,E]=N.useState(!1);N.useEffect(()=>{(async()=>{j(!0);const p=await Re(e.subsidy,t);a(p),j(!1)})()},[e,t]);const I=(d,p)=>{f(g=>({...g,[d]:p}))},k=async()=>{const d=r[o],p=u[d.id];if(p){E(!0);try{const{generateSectionDraft:g}=await De(async()=>{const{generateSectionDraft:K}=await Promise.resolve().then(()=>St);return{generateSectionDraft:K}},void 0);if(m[d.id]){h("draft_preview"),E(!1);return}const A=await g(e.subsidy,t,d,p);v(K=>({...K,[d.id]:{title:d.sectionTitle||d.title,content:A}})),h("draft_preview")}catch(g){console.error("セクション生成エラー:",g)}finally{E(!1)}}},T=()=>{o<r.length-1?(l(d=>d+1),h("question")):Y()},P=()=>{if(x==="draft_preview"){h("question");return}o>0&&(l(d=>d-1),h("question"))},Y=async()=>{E(!0);const d=await Oe(e.subsidy,t,u,m);E(!1),i(d)},y=r[o],B=r.length>0?(o+1)/r.length*100:0;return s.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50",children:s.jsxs(J.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},className:"bg-surface border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl",children:[s.jsxs("div",{className:"p-6 border-b border-border flex items-center justify-between bg-surface-highlight/30",children:[s.jsxs("div",{children:[s.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[s.jsx(F,{className:"w-5 h-5 text-primary"}),s.jsx("h2",{className:"text-xl font-bold text-text-main",children:"AI申請ガイド"})]}),s.jsx("p",{className:"text-sm text-text-muted",children:e.subsidy.name})]}),s.jsx("button",{onClick:n,className:"p-2 rounded-lg hover:bg-surface-highlight transition-colors text-text-muted",children:s.jsx(ye,{className:"w-5 h-5"})})]}),s.jsx("div",{className:"h-1 bg-border w-full",children:s.jsx(J.div,{className:"h-full bg-primary",initial:{width:0},animate:{width:`${B}%`}})}),s.jsx("div",{className:"p-8",children:b?s.jsxs("div",{className:"py-20 text-center",children:[s.jsx("div",{className:"animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"}),s.jsx("p",{className:"text-text-muted",children:"あなたに合わせた質問を作成中..."})]}):s.jsx(qe,{mode:"wait",children:s.jsx(J.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},exit:{opacity:0,x:-20},className:"min-h-[300px]",children:r.length>0?s.jsxs(s.Fragment,{children:[s.jsxs("div",{className:"mb-6",children:[s.jsxs("span",{className:"text-xs font-bold text-primary tracking-wider uppercase mb-2 block",children:["Step ",o+1," / ",r.length]}),s.jsx("h3",{className:"text-2xl font-bold text-text-main",children:x==="question"?y.question:y.sectionTitle||y.title})]}),x==="question"?s.jsxs("div",{className:"space-y-3",children:[y.options.map(d=>s.jsxs("button",{onClick:()=>I(y.id,d.label),className:`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group ${u[y.id]===d.label?"border-primary bg-primary/5 shadow-md":"border-border hover:border-primary/50 hover:bg-surface-highlight"}`,children:[s.jsx("div",{className:`mt-0.5 rounded-full p-1 flex-shrink-0 border ${u[y.id]===d.label?"bg-primary border-primary text-white":"bg-background border-border text-transparent group-hover:border-primary/50"}`,children:s.jsx(X,{className:"w-3 h-3",strokeWidth:3})}),s.jsxs("div",{children:[s.jsx("div",{className:"font-bold text-text-main mb-1 group-hover:text-primary transition-colors",children:d.label}),d.description&&s.jsx("p",{className:"text-sm text-text-muted leading-relaxed",children:d.description})]})]},d.id)),y.allowCustom&&s.jsxs("div",{className:"mt-4 pt-4 border-t border-border",children:[s.jsx("label",{className:"block text-sm font-medium text-text-muted mb-2",children:"その他（自由入力）"}),s.jsx("textarea",{className:"w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-main text-sm",placeholder:"具体的な内容を記入してください",rows:2,value:(G=u[y.id])!=null&&G.startsWith("CUSTOM:")?u[y.id].replace("CUSTOM:",""):"",onChange:d=>I(y.id,`CUSTOM:${d.target.value}`)})]})]}):s.jsxs("div",{className:"bg-surface-highlight rounded-xl p-4 border border-border animate-in fade-in slide-in-from-bottom-2",children:[s.jsxs("div",{className:"flex items-center justify-between mb-3 text-sm text-text-muted",children:[s.jsx("span",{children:"AI生成ドラフト"}),s.jsx("span",{className:"text-xs bg-primary/10 text-primary px-2 py-0.5 rounded",children:"編集可能"})]}),s.jsx("textarea",{className:"w-full bg-transparent border-none p-0 text-text-main leading-relaxed focus:ring-0 resize-none min-h-[200px]",value:((c=m[y.id])==null?void 0:c.content)||"",onChange:d=>{const p=d.target.value;v(g=>({...g,[y.id]:{...g[y.id],content:p}}))}})]})]}):s.jsx("div",{className:"py-20 text-center",children:s.jsx("p",{className:"text-text-muted",children:"質問を読み込めませんでした。もう一度お試しください。"})})},o)})}),s.jsxs("div",{className:"p-6 bg-surface-highlight/30 border-t border-border flex items-center justify-between",children:[s.jsxs("button",{onClick:P,disabled:o===0||w,className:"flex items-center gap-2 px-4 py-2 text-text-muted hover:text-text-main disabled:opacity-30 transition-colors font-medium",children:[s.jsx(Te,{className:"w-5 h-5"}),"戻る"]}),s.jsxs("div",{className:"flex items-center gap-4",children:[s.jsxs("div",{className:"hidden sm:flex items-center gap-1.5 text-text-muted",children:[s.jsx(V,{className:"w-4 h-4"}),s.jsx("span",{className:"text-xs",children:x==="question"?"回答を選ぶと下書きが生成されます":"内容は自由に編集できます"})]}),x==="question"?s.jsx("button",{onClick:k,disabled:!u[y==null?void 0:y.id]||w,className:"bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95",children:w?s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white"}),"生成中..."]}):s.jsxs(s.Fragment,{children:["ドラフトを作成",s.jsx(F,{className:"w-5 h-5"})]})}):s.jsx("button",{onClick:T,disabled:w,className:"bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95",children:w?s.jsxs(s.Fragment,{children:[s.jsx("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white"}),"処理中..."]}):o===r.length-1?s.jsxs(s.Fragment,{children:[s.jsx(X,{className:"w-5 h-5"}),"完了する"]}):s.jsxs(s.Fragment,{children:["次の項目へ",s.jsx(Ae,{className:"w-5 h-5"})]})})]})]})]})})},Ht=()=>{const{user:e}=Me(),t=e==null?void 0:e.id,{currentBusinessType:n}=Le(),{transactions:i}=$e(e==null?void 0:e.id,n==null?void 0:n.business_type),[r,a]=N.useState([]),[o,l]=N.useState(!1),[u,f]=N.useState(null),[m,v]=N.useState(null),[x,h]=N.useState(!1),[b,j]=N.useState(null),[w,E]=N.useState(!1),[I,k]=N.useState(!1),T=()=>{const c=i.filter(d=>d.type==="income").reduce((d,p)=>d+(typeof p.amount=="number"?p.amount:0),0);return{businessType:(n==null?void 0:n.business_type)==="corporation"?"corporation":"sole_proprietor",industry:"IT",revenue:c,employeeCount:5,region:"東京都",establishedYear:2020}};N.useEffect(()=>{n&&P()},[n==null?void 0:n.business_type,t]);const P=async()=>{if(!o){l(!0),console.log("SubsidyMatching: 補助金データの読み込みを開始します...");try{const c=await Ee();console.log("SubsidyMatching: 取得した補助金データ:",c.length,"件");const d=T();console.log("SubsidyMatching: 生成したビジネスプロフィール:",d);const p=await _e(d,c);console.log("SubsidyMatching: マッチング結果:",p.length,"件"),a(p)}catch(c){console.error("SubsidyMatching: 補助金データ読み込みエラー:",c)}finally{l(!1)}}},Y=async c=>{E(!0),f(c),k(!1);try{const d=await Se(c.subsidy,T());v(d)}catch(d){console.error("ガイド生成エラー:",d)}finally{E(!1)}},y=async()=>{if(m)try{const c=await Fe(m),d=new Blob([c],{type:"application/pdf"}),p=URL.createObjectURL(d),g=document.createElement("a");g.href=p,g.download=`補助金申請書_${m.subsidyName}.pdf`,document.body.appendChild(g),g.click(),document.body.removeChild(g),URL.revokeObjectURL(p)}catch(c){console.error("PDF生成エラー:",c),alert("PDFの生成中にエラーが発生しました。")}},B=c=>{switch(c){case"urgent":return"text-red-500 bg-red-500/10 border-red-500/20";case"soon":return"text-orange-500 bg-orange-500/10 border-orange-500/20";default:return"text-green-500 bg-green-500/10 border-green-500/20"}},G=c=>{switch(c){case"easy":return"text-green-500 bg-green-500/10";case"medium":return"text-yellow-500 bg-yellow-500/10";case"hard":return"text-red-500 bg-red-500/10"}};return s.jsx("div",{className:"bg-background min-h-full p-4 sm:p-0",children:s.jsxs("div",{className:"mx-auto",children:[s.jsxs("div",{className:"flex items-center mb-6",children:[s.jsx(ke,{to:"/dashboard",className:"mr-4",children:s.jsx(He,{className:"w-6 h-6 text-text-muted hover:text-text-main"})}),s.jsxs("div",{children:[s.jsx("h1",{className:"text-2xl font-bold text-text-main",children:"補助金マッチング"}),s.jsx("p",{className:"text-text-muted",children:"あなたに最適な補助金をAIが提案"})]})]}),o?s.jsx("div",{className:"flex items-center justify-center py-20",children:s.jsxs("div",{className:"text-center",children:[s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"}),s.jsx("p",{className:"text-text-muted",children:"補助金を検索中..."})]})}):s.jsxs(s.Fragment,{children:[s.jsxs("div",{className:"grid grid-cols-3 gap-3 sm:gap-4 mb-5",children:[s.jsxs("div",{className:"bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-2.5 sm:p-4 border border-blue-500/20",children:[s.jsxs("div",{className:"flex items-center justify-between mb-0.5",children:[s.jsx("span",{className:"text-[10px] sm:text-xs font-medium text-text-muted",children:"マッチ"}),s.jsx(Q,{className:"w-3.5 h-3.5 sm:w-4 h-4 text-blue-500"})]}),s.jsxs("div",{className:"flex items-baseline gap-1",children:[s.jsx("p",{className:"text-lg sm:text-2xl font-bold text-text-main",children:r.length}),s.jsx("span",{className:"text-[9px] sm:text-xs text-text-muted",children:"件"})]})]}),s.jsxs("div",{className:"bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-2.5 sm:p-4 border border-green-500/20",children:[s.jsxs("div",{className:"flex items-center justify-between mb-0.5",children:[s.jsx("span",{className:"text-[10px] sm:text-xs font-medium text-text-muted",children:"推定総額"}),s.jsx(Pe,{className:"w-3.5 h-3.5 sm:w-4 h-4 text-green-500"})]}),s.jsxs("div",{className:"flex items-baseline gap-1",children:[s.jsxs("p",{className:"text-lg sm:text-2xl font-bold text-text-main",children:["¥",Math.round(r.reduce((c,d)=>c+d.estimatedAmount,0)/1e4).toLocaleString()]}),s.jsx("span",{className:"text-[9px] sm:text-xs text-text-muted",children:"万円相当"})]})]}),s.jsxs("div",{className:"bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-2.5 sm:p-4 border border-purple-500/20",children:[s.jsxs("div",{className:"flex items-center justify-between mb-0.5",children:[s.jsx("span",{className:"text-[10px] sm:text-xs font-medium text-text-muted",children:"高マッチ"}),s.jsx(Ge,{className:"w-3.5 h-3.5 sm:w-4 h-4 text-purple-500"})]}),s.jsxs("div",{className:"flex items-baseline gap-1",children:[s.jsx("p",{className:"text-lg sm:text-2xl font-bold text-text-main",children:r.filter(c=>c.matchScore>=70).length}),s.jsx("span",{className:"text-[9px] sm:text-xs text-text-muted",children:"件"})]})]})]}),s.jsxs("div",{className:"space-y-4",children:[r.map(c=>{const d=z(c.subsidy.deadline),p=Ie(c.subsidy.deadline);return s.jsxs("div",{className:"bg-surface rounded-xl shadow-sm border border-border p-3 sm:p-6 hover:shadow-md transition-all",children:[s.jsx("div",{className:"flex items-start justify-between mb-4",children:s.jsxs("div",{className:"flex-1",children:[s.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[s.jsx("h3",{className:"text-lg font-bold text-text-main",children:c.subsidy.name}),s.jsxs("span",{className:`px-3 py-1 rounded-full text-xs font-bold ${c.matchScore>=80?"bg-green-500/20 text-green-500":c.matchScore>=60?"bg-blue-500/20 text-blue-500":"bg-gray-500/20 text-gray-500"}`,children:["マッチ度 ",c.matchScore,"%"]})]}),s.jsx("p",{className:"text-sm text-text-muted mb-3",children:c.subsidy.description}),s.jsx("div",{className:"flex flex-wrap gap-2 mb-3",children:c.matchReasons.map((g,A)=>s.jsxs("span",{className:"px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg",children:["✓ ",g]},A))}),s.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 mb-4",children:[s.jsxs("div",{children:[s.jsx("p",{className:"text-xs text-text-muted mb-1",children:"推定受給額"}),s.jsxs("p",{className:"text-sm font-bold text-green-500",children:["¥",c.estimatedAmount.toLocaleString()]})]}),s.jsxs("div",{children:[s.jsx("p",{className:"text-xs text-text-muted mb-1",children:"申請難易度"}),s.jsx("p",{className:`text-sm font-bold px-2 py-1 rounded inline-block ${G(c.applicationDifficulty)}`,children:c.applicationDifficulty==="easy"?"易":c.applicationDifficulty==="medium"?"中":"難"})]}),s.jsxs("div",{children:[s.jsx("p",{className:"text-xs text-text-muted mb-1",children:"採択確率"}),s.jsxs("p",{className:"text-sm font-bold text-purple-500",children:[c.adoptionProbability.toFixed(0),"%"]})]}),s.jsxs("div",{children:[s.jsx("p",{className:"text-xs text-text-muted mb-1",children:"申請期限"}),s.jsxs("p",{className:`text-sm font-bold px-2 py-1 rounded inline-block border ${B(p)}`,children:["残り",d,"日"]})]})]}),s.jsxs("div",{className:"mb-4",children:[s.jsx("p",{className:"text-xs text-text-muted mb-2",children:"必要書類:"}),s.jsx("div",{className:"flex flex-wrap gap-2",children:c.subsidy.requiredDocuments.map((g,A)=>s.jsxs("span",{className:"px-2 py-1 bg-surface-highlight text-text-main text-xs rounded border border-border",children:[s.jsx(Ue,{className:"w-3 h-3 inline mr-1"}),g]},A))})]})]})}),s.jsxs("div",{className:"flex flex-wrap gap-2 sm:gap-3",children:[s.jsxs("button",{onClick:()=>{j(c),h(!0)},className:"btn-primary flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-1.5 sm:py-2.5 whitespace-nowrap",children:[s.jsx(F,{className:"w-3 h-3 sm:w-4 h-4"}),"申請書作成"]}),s.jsxs("button",{onClick:()=>Y(c),disabled:w,className:"btn-ghost flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-1.5 sm:py-2.5 whitespace-nowrap border-primary/30 text-primary hover:bg-primary/5",children:[w&&(u==null?void 0:u.subsidy.id)===c.subsidy.id?s.jsx("div",{className:"animate-spin rounded-full h-3 w-3 border-b-2 border-primary"}):s.jsx(V,{className:"w-3 h-3 sm:w-4 h-4"}),"申請ガイド"]}),s.jsxs("a",{href:c.subsidy.applicationUrl,target:"_blank",rel:"noopener noreferrer",className:"btn-ghost flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-1.5 sm:py-2.5 whitespace-nowrap border-border text-text-muted hover:text-text-main border",children:[s.jsx(Z,{className:"w-3 h-3 sm:w-4 h-4"}),"公式サイト"]})]})]},c.subsidy.id)}),r.length===0&&!o&&s.jsxs("div",{className:"text-center py-20 bg-surface rounded-2xl border border-border border-dashed",children:[s.jsx("div",{className:"bg-surface-highlight w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",children:s.jsx(Q,{className:"w-8 h-8 text-text-muted opacity-20"})}),s.jsx("h3",{className:"text-lg font-bold text-text-main mb-2",children:"該当する補助金が見つかりませんでした"}),s.jsx("p",{className:"text-sm text-text-muted",children:"条件を変更して再度お試しください"})]})]}),m&&u&&s.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50",children:s.jsx("div",{className:"bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto",children:s.jsxs("div",{className:"p-6",children:[s.jsxs("div",{className:"flex items-center justify-between mb-6",children:[s.jsxs("div",{children:[s.jsx("h2",{className:"text-2xl font-bold text-text-main",children:I?"AI申請書下書き":"AI申請概要ガイド"}),s.jsx("p",{className:"text-text-muted mt-1",children:m.subsidyName})]}),s.jsx("button",{onClick:()=>{v(null),f(null)},className:"p-2 rounded-lg hover:bg-surface-highlight transition-colors text-text-muted",children:s.jsx(ye,{className:"w-5 h-5"})})]}),s.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[s.jsx("div",{className:"bg-blue-500/10 border border-blue-500/20 rounded-lg p-4",children:s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx(Ye,{className:"w-5 h-5 text-blue-500"}),s.jsxs("span",{className:"text-sm font-medium text-text-main",children:["推定作成時間: ",m.estimatedCompletionTime]})]})}),m.strategicSummary&&s.jsxs("div",{className:"bg-amber-500/10 border border-amber-500/20 rounded-lg p-4",children:[s.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[s.jsx(Be,{className:"w-5 h-5 text-amber-500"}),s.jsx("span",{className:"text-sm font-bold text-amber-700",children:"採択率向上の戦略ポイント"})]}),s.jsx("p",{className:"text-[11px] text-amber-800 leading-tight",children:m.strategicSummary})]})]}),m.strategicAdvice&&m.strategicAdvice.length>0&&s.jsxs("div",{className:"border border-amber-200 bg-amber-50/50 rounded-lg p-4 mb-6",children:[s.jsxs("h4",{className:"text-xs font-bold text-amber-900 mb-2 flex items-center gap-1",children:[s.jsx(Ke,{className:"w-3 h-3"}),"さらに採択率を上げるためのアドバイス"]}),s.jsx("ul",{className:"grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1",children:m.strategicAdvice.map((c,d)=>s.jsxs("li",{className:"text-[11px] text-amber-800 flex items-start gap-2",children:[s.jsx("span",{className:"text-amber-500 mt-1",children:"★"}),s.jsx("span",{children:c})]},d))})]}),s.jsx("div",{className:"space-y-6 mb-6",children:m.sections.map((c,d)=>s.jsxs("div",{className:"border border-border rounded-lg p-4 bg-background",children:[s.jsxs("div",{className:"flex items-center justify-between mb-3",children:[s.jsx("h3",{className:"text-lg font-bold text-text-main",children:c.title}),s.jsx(F,{className:`w-4 h-4 ${I?"text-primary":"text-blue-500"} opacity-50`})]}),s.jsx("div",{className:`rounded-lg p-4 mb-3 border ${I?"bg-surface-highlight border-border/50":"bg-blue-500/5 border-blue-500/10"}`,children:I?s.jsx("textarea",{className:"w-full bg-transparent text-sm text-text-main leading-relaxed border-none focus:ring-0 p-0 resize-none overflow-hidden",value:c.content,rows:Math.max(3,c.content.split(`
`).length),onChange:p=>{if(!m)return;const g=[...m.sections];g[d]={...c,content:p.target.value},v({...m,sections:g})}}):s.jsx("p",{className:"text-sm text-text-main whitespace-pre-wrap leading-relaxed",children:c.content})}),c.tips.length>0&&s.jsxs("div",{className:"space-y-2 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10",children:[s.jsxs("p",{className:"text-xs font-medium text-blue-500 flex items-center gap-1",children:[s.jsx(V,{className:"w-3 h-3"}),"記入のアドバイス:"]}),s.jsx("ul",{className:"space-y-1",children:c.tips.map((p,g)=>s.jsxs("li",{className:"text-[11px] text-text-muted flex items-start gap-2",children:[s.jsx("span",{className:"text-primary mt-1",children:"•"}),s.jsx("span",{children:p})]},g))})]})]},d))}),s.jsxs("div",{className:"border border-border rounded-lg p-4 mb-6",children:[s.jsx("h3",{className:"text-lg font-bold text-text-main mb-3",children:"提出前チェックリスト"}),s.jsx("ul",{className:"space-y-2",children:m.checklist.map((c,d)=>s.jsxs("li",{className:"flex items-start gap-2 text-sm text-text-muted",children:[s.jsx(Je,{className:"w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"}),s.jsx("span",{children:c})]},d))})]}),s.jsxs("div",{className:"flex gap-3",children:[s.jsxs("button",{onClick:y,className:"btn-primary flex items-center gap-2",children:[s.jsx(Z,{className:"w-4 h-4"}),"PDFで保存"]}),s.jsx("button",{onClick:()=>{v(null),f(null)},className:"btn-ghost",children:"閉じる"})]})]})})}),x&&b&&s.jsx(It,{match:b,profile:T(),onClose:()=>{h(!1),j(null)},onComplete:c=>{v(c),f(b),k(!0),h(!1),j(null)}})]})]})})};export{Ht as default};
