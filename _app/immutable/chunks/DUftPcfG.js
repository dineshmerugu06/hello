let s;function f(){return s===void 0&&(s=typeof Intl<"u"&&"Segmenter"in Intl?new Intl.Segmenter("fr",{granularity:"grapheme"}):null),s}function g(t){const n=f();if(!n)return Array.from(t);const e=[];for(const r of n.segment(t))e.push(r.segment);return e}function m(t){const n=f();if(!n)return Array.from(t).length;let e=0;for(const r of n.segment(t))e++;return e}const h={ticketTitle:45,ticketSummary:65,requestTitle:45,requestDetails:2e3,message:4e3},l=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;function d(t,n={}){let e=t.normalize("NFC");return n.multiline?(e=e.replace(/\r\n?/g,`
`).replace(l,""),e=e.split(`
`).map(r=>r.replace(/\s+$/u,"")).join(`
`),e.replace(/\n{4,}/g,`


`).trim()):(e=e.replace(l,""),e=e.replace(/\s+/gu,r=>r===" "||r===" "?r:" "),e.trim())}const i="…";function p(t,n){if(n<=0)return"";const e=g(t);return e.length<=n?t:n===1?i:e.slice(0,n-1).join("")+i}function I(t,n){if(n<=0)return"";const e=g(t);if(e.length<=n)return t;if(n===1)return i;const r=n-1,o=e.lastIndexOf("."),a=o>0?e.length-o:0,u=Math.max(a,Math.floor(r/2)),c=r-u;return c<1?p(t,n):e.slice(0,c).join("")+i+e.slice(e.length-u).join("")}export{h as L,m as c,g,I as m,d as n};
