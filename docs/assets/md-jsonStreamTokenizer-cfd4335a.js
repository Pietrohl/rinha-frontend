(function(){"use strict";let p=[0],s="",t=0,n=[],o=[],i=[];function r(){return o.slice(-1)[0]}function u(){const e=n.pop();if(e===void 0)throw new Error("No array index found");return n.push(e+1),e}function l(e){i.push(e)}function k(e){i=[];for(let f of e)y(f);l.length>0&&self.postMessage(i)}function y(e){switch(p[p.length-1]){case 5:if(/[0-9.]/.test(e))s+=e;else{p.pop();const f=Number(s);s="",o.length>0?l({type:"NUMBER",value:f,depth:t,key:o.pop()}):l({type:"NUMBER",value:f,depth:t-1,key:r()}),y(e)}break;case 0:if(e==="{")p.pop(),p.push(1),l({type:"BEGIN_OBJECT",depth:t}),t++;else if(e==="[")p.pop(),p.push(7),n.push(0),o.push(u()),l({type:"BEGIN_ARRAY",depth:t}),t++;else if(e!==""&&e!=="]"&&e!=="}")throw new Error("Unexpected character at start");break;case 1:if(e==="}")p.pop(),t--,l({type:"END_OBJECT",depth:t});else if(e==='"')p.push(9),s="";else if(e==="]")throw new Error("Unexpected character");break;case 9:if(e==='"'){p.pop(),p.push(2);const f=s;s="",o.push(f)}else s+=e;break;case 2:e===":"&&(p.pop(),p.push(3));break;case 3:e==="{"?(p.pop(),p.push(1),l({type:"BEGIN_OBJECT",depth:t,key:o.pop()}),t++,p[p.length-2]===7&&o.push(u())):e==="["?(p.pop(),p.push(7),l({type:"BEGIN_ARRAY",depth:t,key:o.pop()}),p[p.length-2]===7&&o.push(u()),n.push(0),o.push(u()),t++):e==='"'?(p.pop(),p.push(4),s=""):/[0-9-]/.test(e)?(p.pop(),p.push(5),s=e):e==="t"?(p.pop(),p.push(11),s=e):e==="f"?(p.pop(),p.push(10),s=e):e==="n"&&(p.pop(),p.push(12),s=e);break;case 11:if(s+=e,"true".includes(s))s==="true"&&(p.pop(),l({type:"BOOLEAN",value:!0,depth:t,key:o.pop()}));else throw new Error("Unexpected character");break;case 10:if(s+=e,"false".includes(s))s==="false"&&(p.pop(),l({type:"BOOLEAN",value:!1,depth:t,key:o.pop()}));else throw new Error("Unexpected character");break;case 12:if(s+=e,"null".includes(s))s==="null"&&(p.pop(),l({type:"NULL",value:null,depth:t,key:o.pop()}));else throw new Error("Unexpected character");break;case 4:if(e==="\\")p.push(6);else if(e==='"'){p.pop();const f=s;s="",o.length>0?l({type:"STRING",value:f,depth:t,key:o.pop()}):l({type:"STRING",value:f,depth:t-1,key:r()})}else s+=e;break;case 6:s+=e,p.pop();break;case 7:if(e==="]")o.pop(),n.pop(),p.pop(),l({type:"END_ARRAY",depth:--t});else if(e==="{")p.push(1),l({type:"BEGIN_OBJECT",depth:t,key:o.pop()}),t++;else if(e==="[")p.push(7),l({type:"BEGIN_ARRAY",depth:t,key:o.pop()}),n.push(0),o.push(u()),t++;else if(e==='"')p.push(4),s="";else if(/[0-9-]/.test(e))p.push(5),s=e;else if(e==="t")p.push(4),s="true";else if(e==="f")p.push(4),s="false";else if(e==="n")p.push(4),s="null";else if(e===",")o.push(u());else if(e==="}")throw new Error("Unexpected character in array");break}}self.onmessage=({data:e})=>{if(e.type==="end"){if(p.length>0||t>0)throw new Error("Unexpected end of file");self.postMessage([{type:"end"}]);return}e.type==="chunk"&&k(e.data)},self.onerror=function(e){self.postMessage([{type:"error",value:e}])}})();
