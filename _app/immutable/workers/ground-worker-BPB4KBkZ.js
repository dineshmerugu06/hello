(function(){"use strict";const Z=`#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_rotation;
uniform vec2 u_offset;
uniform vec2 u_travel;
out vec2 v_objectUV;
out vec2 v_lensUV;
out vec2 v_grainUV;
out vec2 v_tileUV;
void main() {
gl_Position = vec4(a_position, 0., 1.);
v_tileUV = a_position * .5 + .5;
vec2 uv = a_position * .5;
uv *= u_resolution / min(u_resolution.x, u_resolution.y);
uv += vec2(-u_offset.x, u_offset.y);
float r = radians(u_rotation);
mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));
v_objectUV = turn * ((uv - vec2(0., u_travel.x)) / u_scale);
v_lensUV = turn * (uv / u_scale);
v_grainUV = turn * ((uv - vec2(0., u_travel.y)) / u_scale);
}`,J=`#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float u_time;
uniform vec4 u_colours[4];
uniform float u_colourCount;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_grainScale;
uniform float u_phase;
uniform vec3 u_tile;
uniform vec2 u_spotOffsets[4];
uniform vec2 u_eddies;
uniform vec4 u_screen;
uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_rotation;
uniform sampler2D u_wakeFlow;
uniform sampler2D u_wakeDrift;
uniform vec4 u_wake;
uniform vec4 u_wake2;
uniform vec3 u_wakeTint;
in vec2 v_objectUV;
in vec2 v_lensUV;
in vec2 v_grainUV;
in vec2 v_tileUV;
out vec4 fragColour;
vec2 rotate(vec2 uv, float th) {
return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
vec2 current(vec2 uv, vec2 centre, float strength) {
vec2 delta = uv - centre;
float falloff = exp(-dot(delta, delta) * 3.8);
return centre + rotate(delta, strength * falloff);
}
float hash21(vec2 p) {
p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
p += dot(p, p + 19.19);
return fract(p.x * p.y);
}
float valueNoise(vec2 st) {
vec2 i = floor(st);
vec2 f = fract(st);
float a = hash21(i);
float b = hash21(i + vec2(1.0, 0.0));
float c = hash21(i + vec2(0.0, 1.0));
float d = hash21(i + vec2(1.0, 1.0));
vec2 u = f * f * (3.0 - 2.0 * f);
return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void blend(vec2 offset, vec4 tint, inout vec3 colour, inout float opacity, inout float total) {
float weight = 1. / (pow(length(offset), 3.5) + 1e-3);
colour += tint.rgb * tint.a * weight;
opacity += tint.a * weight;
total += weight;
}
vec2 spot(int i, float t) {
float a = float(i) * .37;
float b = .6 + fract(float(i) / 3.) * .9;
float c = .8 + fract(float(i + 1) / 4.);
return .5 + .5 * vec2(sin(t * b + a), cos(t * c + a * 1.5));
}
void main() {
vec2 objectUV = v_objectUV;
vec2 lensUV = v_lensUV;
float wakeMark = 0.;
float wakeSpeed = 0.;
if (u_wake.x > .5) {
vec2 s = gl_FragCoord.xy / u_resolution;
vec4 w = texture(u_wakeDrift, s);
vec2 d = w.xy * u_wake.y;
float m = length(d);
if (m > u_wake2.z) d *= u_wake2.z / m;
float r = radians(u_rotation);
mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));
vec2 step = turn * (d / u_scale);
objectUV += step;
lensUV += step;
wakeMark = clamp(w.z, 0., 1.) * u_wake2.w;
wakeSpeed = length(texture(u_wakeFlow, s).xy);
}
vec2 uv = objectUV + .5;
vec2 grainUV = (v_grainUV + .5) * u_grainScale;
float mixerGrain = 0.;
if (u_grainMixer > 0.) {
mixerGrain = .4 * u_grainMixer * (valueNoise(grainUV) - .5);
}
float t = .5 * (u_time + u_phase);
vec2 lens = lensUV + .5;
vec2 shift = objectUV - lensUV;
float radius = smoothstep(0., 1., length(lens - .5));
float centre = 1. - radius;
vec2 warp = lens;
for (float i = 1.; i <= 2.; i++) {
warp.x += u_distortion * centre / i * sin(t + i * .4 * smoothstep(.0, 1., warp.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., warp.y));
warp.y += u_distortion * centre / i * cos(t + i * 2. * smoothstep(.0, 1., warp.x));
}
uv += warp - lens;
vec2 eye = .5 + shift;
vec2 swirled = rotate(uv - eye, -3. * u_swirl * radius) + eye;
if (dot(abs(u_eddies), vec2(1.)) > 0.00001) {
swirled = current(swirled, eye + vec2(-.28, -.08), u_eddies.x);
swirled = current(swirled, eye + vec2(.3, .12), u_eddies.y);
}
vec3 colour = vec3(0.);
float opacity = 0.;
float total = 0.;
for (int i = 0; i < 4; i++) {
if (i >= int(u_colourCount)) break;
vec2 pos = spot(i, t) + mixerGrain + u_spotOffsets[i];
if (u_tile.z > 0.) {
vec2 step = u_tile.xy * u_tile.z;
float n = floor(dot(swirled - pos, u_tile.xy) / u_tile.z);
blend(swirled - pos - n * step, u_colours[i], colour, opacity, total);
blend(swirled - pos - (n + 1.) * step, u_colours[i], colour, opacity, total);
} else {
blend(swirled - pos, u_colours[i], colour, opacity, total);
}
}
colour /= max(1e-4, total);
opacity /= max(1e-4, total);
if (u_wake.x > .5) {
colour = mix(colour, u_wakeTint, wakeMark * clamp(u_wake.w, 0., 1.));
float glint = u_wake2.x * smoothstep(0., max(1e-3, u_wake2.y), wakeSpeed) * u_wake2.w;
float lift = clamp(wakeMark * abs(u_wake.z) + glint, 0., 1.);
colour = mix(colour, u_wake.z < 0. ? vec3(0.) : vec3(1.), lift);
}
if (u_grainOverlay > 0.) {
float g = valueNoise(rotate(grainUV, 1.) + vec2(3.));
g = mix(g, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
g = pow(g, 1.3);
float v = g * 2. - 1.;
float strength = pow(u_grainOverlay * abs(v), .8);
colour = mix(colour, vec3(step(0., v)), .35 * strength);
opacity += .5 * strength;
}
if (u_screen.x > 0. && u_screen.y > 0.) {
vec2 p = vec2(v_tileUV.x, 1. - v_tileUV.y) * u_resolution;
vec2 q = mod(p, u_screen.x) - .5 * u_screen.x;
float d = length(q) - u_screen.y;
float ink = (1. - smoothstep(-u_screen.w, u_screen.w, d)) * u_screen.z;
colour = mix(colour, vec3(1.), ink);
}
fragColour = vec4(colour, clamp(opacity, 0., 1.));
}`,Q=["u_resolution","u_scale","u_rotation","u_offset","u_travel","u_time","u_colours[0]","u_colourCount","u_distortion","u_swirl","u_grainMixer","u_grainOverlay","u_grainScale","u_phase","u_tile","u_spotOffsets[0]","u_eddies","u_screen","u_wakeFlow","u_wakeDrift","u_wake","u_wake2","u_wakeTint"],j=new Float32Array(8),ee=new Float32Array(2);function te(e,E={}){const a=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:"low-power"});if(!a)return null;let k=E.parallel?a.getExtension("KHR_parallel_shader_compile"):null,n=null,s=null,A=null,b=null,o={},_=!1,I=!1,d=0,h=0;const T=()=>{const f=a.createShader(a.VERTEX_SHADER);a.shaderSource(f,Z),a.compileShader(f);const x=a.createShader(a.FRAGMENT_SHADER);a.shaderSource(x,J),a.compileShader(x);const p=a.createProgram();return a.attachShader(p,f),a.attachShader(p,x),a.linkProgram(p),{p,v:f,f:x}},P=()=>(n=T(),k?!1:C()),C=()=>{if(!n)return!1;const{p:f,v:x,f:p}=n;n=null;const l=a.getProgramParameter(f,a.LINK_STATUS);if(!l){for(const c of[x,p])a.getShaderParameter(c,a.COMPILE_STATUS)||console.error("[ground]",a.getShaderInfoLog(c));console.error("[ground]",a.getProgramInfoLog(f))}return a.deleteShader(x),a.deleteShader(p),l?(s=f,o=Object.fromEntries(Q.map(c=>[c,a.getUniformLocation(f,c)])),b=a.createVertexArray(),a.bindVertexArray(b),A=a.createBuffer(),a.bindBuffer(a.ARRAY_BUFFER,A),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.useProgram(s),d&&h&&(a.viewport(0,0,d,h),a.uniform2f(o.u_resolution,d,h)),a.uniform1i(o.u_wakeFlow,3),a.uniform1i(o.u_wakeDrift,4),a.uniform4f(o.u_wake,0,0,0,0),!0):(a.deleteProgram(f),!1)},L=f=>{f.preventDefault(),_=!1,s=null},N=()=>{I||(E.parallel&&(k=a.getExtension("KHR_parallel_shader_compile")),_=P())};return e.addEventListener("webglcontextlost",L),e.addEventListener("webglcontextrestored",N),_=P(),!_&&!n?(e.removeEventListener("webglcontextlost",L),e.removeEventListener("webglcontextrestored",N),null):{get gl(){return a},get ok(){return _},poll(){return _||!n?_:k&&!a.getProgramParameter(n.p,k.COMPLETION_STATUS_KHR)?!1:(_=C(),_)},get width(){return d},get height(){return h},resize(f,x,p){const l=Math.max(1,Math.round(f*p)),c=Math.max(1,Math.round(x*p));l===d&&c===h||(d=l,h=c,e.width=l,e.height=c,!(!_||!s)&&(a.useProgram(s),a.viewport(0,0,l,c),a.uniform2f(o.u_resolution,l,c)))},render(f,x,p,l,c,v,r){if(!_||!s)return;a.useProgram(s);const t=v?Math.min(d,Math.max(1,Math.round(v[0]))):d,i=v?Math.min(h,Math.max(1,Math.round(v[1]))):h;a.viewport(0,v?.[2]??0,t,i),a.uniform2f(o.u_resolution,t,i),a.bindVertexArray(b),a.uniform1f(o.u_time,f),a.uniform4fv(o["u_colours[0]"],x),a.uniform1f(o.u_colourCount,p),a.uniform1f(o.u_distortion,l.distortion),a.uniform1f(o.u_swirl,l.swirl),a.uniform1f(o.u_grainMixer,l.grainMixer),a.uniform1f(o.u_grainOverlay,l.grainOverlay),a.uniform1f(o.u_grainScale,l.grainScale),a.uniform1f(o.u_phase,l.phase);const u=l.rotation*Math.PI/180;a.uniform3f(o.u_tile,Math.sin(u),-Math.cos(u),l.tile),a.uniform1f(o.u_scale,l.scale),a.uniform1f(o.u_rotation,l.rotation),a.uniform2f(o.u_offset,l.offsetX,l.offsetY),a.uniform2f(o.u_travel,c[0],c[1]),a.uniform2fv(o["u_spotOffsets[0]"],l.spotOffsets??j),a.uniform2fv(o.u_eddies,l.eddies??ee),l.screen?a.uniform4f(o.u_screen,...l.screen):a.uniform4f(o.u_screen,0,0,0,0),r&&r.flow&&r.drift&&!v?(a.activeTexture(a.TEXTURE3),a.bindTexture(a.TEXTURE_2D,r.flow),a.activeTexture(a.TEXTURE4),a.bindTexture(a.TEXTURE_2D,r.drift),a.activeTexture(a.TEXTURE0),a.uniform4f(o.u_wake,1,r.displace,r.light,r.tint),a.uniform4f(o.u_wake2,r.glint,r.glintRef,r.cap,r.fade),a.uniform3f(o.u_wakeTint,r.tintColour[0],r.tintColour[1],r.tintColour[2])):a.uniform4f(o.u_wake,0,0,0,0),a.drawArrays(a.TRIANGLES,0,3)},sample(){if(!_||!d||!h)return null;const f=new Uint8Array(d*4);let x=0,p=0,l=0,c=0;for(let v=1;v<=5;v++){a.readPixels(0,Math.round(h*v/6),d,1,a.RGBA,a.UNSIGNED_BYTE,f);for(let r=0;r<d;r++)x+=f[r*4],p+=f[r*4+1],l+=f[r*4+2],c++}return c?[x/c,p/c,l/c]:null},row(f){if(!_||!d||!h)return null;const x=Math.min(h-1,Math.max(0,Math.round((1-f)*(h-1)))),p=new Uint8Array(d*4);a.readPixels(0,x,d,1,a.RGBA,a.UNSIGNED_BYTE,p);const l=[],c=Math.max(1,Math.floor(d/96));for(let v=0;v<d;v+=c)l.push(.2126*p[v*4]+.7152*p[v*4+1]+.0722*p[v*4+2]);return l},band(f,x,p,l){if(!_||!d||!h)return null;const c=Math.min(h-1,Math.max(0,Math.round((1-f)*(h-1)))),v=Math.min(d-1,Math.max(0,Math.round(p))),r=Math.min(d-v,Math.max(1,Math.round(l))),t=Math.min(c+1,Math.max(1,Math.round(x))),i=new Uint8Array(r*t*4);a.readPixels(v,c+1-t,r,t,a.RGBA,a.UNSIGNED_BYTE,i);const u=[];for(let m=t-1;m>=0;m--){const R=[];for(let S=0;S<r;S++){const U=(m*r+S)*4;R.push(.2126*i[U]+.7152*i[U+1]+.0722*i[U+2])}u.push(R)}return u},dispose(){I=!0,_=!1,n&&(a.deleteShader(n.v),a.deleteShader(n.f),a.deleteProgram(n.p),n=null),e.removeEventListener("webglcontextlost",L),e.removeEventListener("webglcontextrestored",N),a.deleteBuffer(A),a.deleteVertexArray(b),a.deleteProgram(s),s=null}}}const ae=`uniform vec4 u_art;
uniform vec2 u_artPointer;
uniform sampler2D u_letter;
const float ART_ENVELOPE = 0.35;
const float ART_LETTER_FIT = 0.796 / (ART_ENVELOPE * 2.0);
float radarSweep(vec2 q, float radius, float phase) {
float r = length(q);
float disc = 1.0 - smoothstep(radius - 0.45, radius + 0.45, r);
float angle = atan(q.y, q.x + 0.00001);
float age = mod(phase - angle + 6.2831853, 6.2831853);
float t = age / ${(Math.PI*2).toFixed(7)};
float trail = pow(max(0.0, 1.0 - t), 0.85);
return disc * trail * (1.0 - smoothstep(0.97, 1.0, t));
}
float optionAt(vec2 c, float aa) {
float side = min(u_rect.z, u_rect.w);
float cells = side / u_cell;
vec2 q = (c - u_rect.zw * 0.5) / u_cell;
q -= u_artPointer * 0.008 * cells;
q /= 1.0 + u_art.z * 0.018 - u_art.w * 0.025;
if (u_art.x < 0.5) {
vec2 uv = q * ART_LETTER_FIT / cells + 0.5;
if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
float lod = max(0.0, log2(256.0 * ART_LETTER_FIT / max(1.0, cells)));
float cov = textureLod(u_letter, uv, lod).r;
return clamp(lumOfArea(cov * dotOf(1.0) * dotOf(1.0)), 0.0, 1.0);
}
if (u_art.x < 1.5) {
vec2 uv = (c - u_rect.zw * 0.5) / side + 0.5;
if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
float lod = max(0.0, log2(256.0 / max(1.0, cells)));
float coverage = textureLod(u_letter, uv, lod).r;
coverage = min(1.0, coverage * (1.0 + 2.0 * smoothstep(0.035, 0.25, coverage)));
return clamp(lumOfArea(coverage * dotOf(1.0) * dotOf(1.0)), 0.0, 1.0);
}
float radius = cells * ART_ENVELOPE;
float phase = mod(u_art.y / ${4.32.toFixed(2)}, 1.0) * 6.2831853 - 1.5707963;
float cov = 0.0;
for (int y = 0; y < 2; y++) {
for (int x = 0; x < 2; x++) {
vec2 offset = (vec2(float(x), float(y)) - 0.5) * 0.5;
cov += radarSweep(q + offset, radius, phase) * 0.25;
}
}
float restTone = max(u_grid.x, 1.5 / 255.0);
float restRadius = mix(u_sweep.y, u_sweep.z, restTone * u_grid.z);
float peakRadius = max(restRadius, dotOf(1.0) * 0.90);
float inkRadius = mix(restRadius, peakRadius, cov);
return clamp(lumOfArea(inkRadius * inkRadius), 0.0, 1.0);
}`,H=32,F=8,O={sphere:0,chart:1,dart:2,ruler:3,grid:4,option:5},oe=`#version 300 es
void main() {
vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,W=`#version 300 es
precision highp float;
uniform vec4  u_rect;
uniform float u_cell;
uniform vec2  u_phase;
uniform int   u_source;
uniform float u_time;
float hash(vec2 p) {
p = fract(p * vec2(123.34, 456.21));
p += dot(p, p + 45.32);
return fract(p.x * p.y);
}
float smin(float a, float b, float k) {
if (k <= 0.0) return min(a, b);
float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
return mix(b, a, h) - k * h * (1.0 - h);
}
float band(float c, float e, float lo, float hi) {
if (e <= 0.0) return (c >= lo && c <= hi) ? 1.0 : 0.0;
return clamp((min(c + e, hi) - max(c - e, lo)) / (2.0 * e), 0.0, 1.0);
}
float capsule(vec2 p, vec2 a, vec2 b, float r) {
vec2 pa = p - a, ba = b - a;
float h = clamp(dot(pa, ba) / max(1e-6, dot(ba, ba)), 0.0, 1.0);
return length(pa - ba * h) - r;
}
float box(vec2 p, vec2 half_, float r) {
vec2 d = abs(p) - half_ + r;
return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}`,re=`${W}
uniform vec2  u_field;
uniform vec4  u_tone;
uniform vec2  u_ink;
uniform vec4  u_grid;
uniform sampler2D u_sheet;
uniform vec4  u_sheetGrid;
uniform vec4  u_sphere;
uniform vec4  u_mask;
uniform vec4  u_maskSoft;
uniform vec4  u_holes[${F}];
uniform float u_holeFade[${F}];
uniform float u_holeR[${F}];
uniform vec2  u_hole;
uniform float u_flip;
uniform vec4  u_bars[${H/4}];
uniform vec4  u_inks[${H/4}];
uniform vec4  u_chart;
uniform vec4  u_geom;
uniform vec4  u_rail;
uniform vec4  u_sweep;
uniform vec4  u_dart;
uniform vec4  u_rule;
uniform vec4  u_thick;
uniform vec4  u_hot;
uniform vec4  u_rule2;
uniform vec4  u_len2;
uniform vec4  u_road2;
uniform vec4  u_trail;
uniform vec4  u_shut;
uniform vec4  u_slat;
uniform vec4  u_drum;
uniform vec4  u_set;
uniform vec4  u_deep;
uniform vec4  u_rank;
uniform vec4  u_road;
uniform vec4  u_blind;
uniform vec4  u_cam;
uniform vec4  u_eye;
uniform vec2  u_pp;
uniform vec4  u_shade;
out vec4 fragColour;
float barAt(int i) {
vec4 v = u_bars[i >> 2];
int k = i & 3;
return k == 0 ? v.x : k == 1 ? v.y : k == 2 ? v.z : v.w;
}
float inkAt(int i) {
vec4 v = u_inks[i >> 2];
int k = i & 3;
return k == 0 ? v.x : k == 1 ? v.y : k == 2 ? v.z : v.w;
}
float sheetTap(float frame, vec2 uv) {
float cols = u_sheetGrid.x;
float f    = mod(frame, u_sheetGrid.z);
float col  = mod(f, cols);
float row  = floor(f / cols);
vec2 t = (vec2(col, row) + clamp(uv, u_sheetGrid.w, 1.0 - u_sheetGrid.w))
/ vec2(cols, u_sheetGrid.y);
return texture(u_sheet, t).r;
}
float sphereAt(vec2 c) {
vec2 uv = (c - u_sphere.xy) / u_sphere.z * 0.5 + 0.5;
uv.x = mix(uv.x, 1.0 - uv.x, u_flip);
if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
float f = u_sphere.w;
float a = floor(f);
float b = mod(a + 1.0, u_sheetGrid.z);
return mix(sheetTap(a, uv), sheetTap(b, uv), fract(f));
}
float maskAt(vec2 c) {
vec4 s = max(vec4(1.0), u_maskSoft);
return smoothstep(u_mask.x, u_mask.x + s.x, c.x)
* (1.0 - smoothstep(u_mask.y - s.y, u_mask.y, c.x))
* smoothstep(u_mask.z, u_mask.z + s.z, c.y)
* (1.0 - smoothstep(u_mask.w - s.w, u_mask.w, c.y));
}
vec2 onPage(vec2 c) {
int n = int(u_hole.x + 0.5);
if (n <= 0) return vec2(1.0);
vec2 keep = vec2(1.0);
vec2 p = c + u_rect.xy;
float fade = max(1e-3, u_hole.y * u_cell);
for (int i = 0; i < ${F}; i++) {
if (i >= n) break;
float sd = box(p - u_holes[i].xy, u_holes[i].zw, u_holeR[i]);
float coverage = smoothstep(-max(fade, u_holeFade[i]), 0.0, sd);
if (u_holeFade[i] > 0.0) keep.y = min(keep.y, coverage);
else keep.x = min(keep.x, coverage);
}
return keep;
}
float rail(float x, float ph) {
return (floor((x + ph) / u_cell) + 0.5) * u_cell - ph;
}
int imod(int a, int n) {
int r = a - (a / n) * n;
return r < 0 ? r + n : r;
}
float chance(int idx, int row) {
return hash(vec2(float(idx) * 1.37 + 7.1, float(row) * 2.11 + 3.7));
}
int rowsIn(float share, int total) {
int r = max(1, int(share * float(total) + 0.5));
return min(total, r + imod(total - r, 2));
}
float ramp2(float x) { x = max(0.0, x); return x * x; }
float shut(float d, float w, float s) {
float a = (1.0 + w) * 0.5, b = abs(1.0 - w) * 0.5;
if (s < 1e-4) return clamp(a - abs(d), 0.0, min(1.0, w));
float h = s * 0.5, x1 = d + h, x0 = d - h;
float F1 = ramp2(x1 + a) - ramp2(x1 + b) - ramp2(x1 - b) + ramp2(x1 - a);
float F0 = ramp2(x0 + a) - ramp2(x0 + b) - ramp2(x0 - b) + ramp2(x0 - a);
return clamp((F1 - F0) * 0.5 / s, 0.0, 1.0);
}
float dotOf(float level) {
float t = pow(clamp((level - u_tone.x) / max(1e-4, u_tone.y - u_tone.x), 0.0, 1.0), u_tone.z);
return mix(u_sweep.y, u_sweep.z, t * u_grid.z);
}
float inkOf(float level) { float r = dotOf(level); return r * r; }
float lumOfArea(float area) {
float r = sqrt(max(0.0, area));
float t = (r - u_sweep.y) / max(1e-4, (u_sweep.z - u_sweep.y) * max(1e-4, u_grid.z));
if (t <= 0.0) return 0.0;
return u_tone.x + (u_tone.y - u_tone.x) * pow(min(1.0, t), 1.0 / max(0.05, u_tone.z));
}
float settle(float x) { x = clamp(x, 0.0, 1.0); float y = 1.0 - x; return 1.0 - y * y * y; }
${ae}
float chartAt(vec2 c, float aa) {
vec2 s = u_rect.zw;
int kind = int(u_chart.x);
float grow = clamp(u_chart.y, 0.0, 1.0);
int ring = max(1, int(u_chart.w));
float area = 0.0;
float pad = u_shade.w * min(s.x, s.y);
vec4 b = vec4(pad, pad, max(1.0, s.x - 2.0 * pad), max(1.0, s.y - 2.0 * pad));
int pitch = max(1, int(u_rail.z + 0.5));
int cols  = max(1, int(u_rail.w + 0.5));
int wide  = kind == 3 ? max(1, min(pitch, int(u_geom.y + 0.5))) : 1;
float bx0 = b.x;
float bx1 = b.x + b.z;
float travel = kind == 2 ? 0.0 : max(0.0, u_chart.z);
float here   = (c.x - u_rail.x) / u_cell + travel;
float mid = float(wide - 1) * 0.5;
float gk  = floor((here - mid) / float(pitch) + 0.5);
int   idx = int(gk + 1024.0) - 1024;
float m0  = gk * float(pitch);
float cov = shut(here - (m0 + mid), float(wide), max(0.0, u_sweep.x)) * band(c.x, aa, bx0, bx1);
float lid = u_rail.y - u_cell * 0.5;
float sit = lid + max(1.0, floor((b.y + b.w - lid) / u_cell + 1e-3)) * u_cell;
float H   = max(u_cell, sit - lid);
float at = clamp((c.x - b.x) / b.z, 0.0, 1.0);
float rise = smoothstep(0.0, 0.45, grow);
float across = (c.x - bx0) / u_cell;
float arrive = clamp(grow * ((bx1 - bx0) / u_cell + 6.0) - 2.0 - across, 0.0, 1.0);
float void_ = u_shade.x * rise;
float ink   = mix(void_, 1.0, arrive);
if (kind == 0) {
float foot = u_geom.x, climb = u_geom.y, amp = u_geom.z;
if (cov > 0.0) {
float v = barAt(imod(idx, ring));
float h = clamp(foot + climb * at + amp * (v * 2.0 - 1.0), 0.06, 1.0);
float bI = band(c.y, aa, sit - h * H, sit);
float bV = band(c.y, aa, lid, sit);
area = max(area, cov * (bI * inkOf(ink) + max(0.0, bV - bI) * inkOf(void_)));
}
} else if (kind == 1) {
float level = u_geom.x, amp = u_geom.y, roofv = u_geom.z;
if (cov > 0.0) {
float v = barAt(imod(idx, ring));
float e = clamp(roofv + amp * (v * 2.0 - 1.0), level + 0.1, 1.0);
float bI = band(c.y, aa, sit - level * H, sit);
float bV = band(c.y, aa, sit - e * H, sit);
area = max(area, cov * (bI * inkOf(ink) + max(0.0, bV - bI) * inkOf(void_)));
}
} else if (kind == 2) {
float paid = u_geom.x, owned = u_geom.y;
int cursor = min(cols - 1, int(u_geom.z + 0.5));
float mm = mod(u_chart.z, float(ring));
float span = max(0.2, u_sweep.w);
float offRing = 1.0 - smoothstep(float(ring) - 1.0, float(ring) - 0.1, mm);
int total = max(1, int(H / u_cell + 0.5));
float rV = dotOf(void_), rI = dotOf(ink);
int col = idx >= 0 && idx < cols ? idx : -1;
if (col >= 0 && col != cursor && cov > 0.0) {
int barR  = rowsIn(paid, total);
float top = lid + float((total - barR) / 2) * u_cell;
float bot = top + float(barR) * u_cell;
float fade = col > cursor
? mix(1.0, 0.55, smoothstep(0.0, 1.0, float(col - cursor) / max(1.0, float(cols - 1 - cursor))))
: 1.0;
float on = col < cursor ? settle((mm - float(col)) / span) * offRing : 0.0;
float rl = mix(rV, rI, on);
area = max(area, band(c.y, aa, top, bot) * cov * rl * rl * fade);
}
float lit13 = settle((mm - float(cursor)) / span) * offRing;
float half13 = 0.5 + 0.5 * max(0.0, u_geom.w) * lit13;
float cut = u_rail.x + float(cursor * pitch) * u_cell;
float curs = band(c.x, aa, max(cut - half13 * u_cell, bx0), min(cut + half13 * u_cell, bx1));
if (curs > 0.0) {
int barR  = rowsIn(owned, total);
float top = lid + float((total - barR) / 2) * u_cell;
float bot = top + float(barR) * u_cell;
float rl = mix(rV, rI, lit13);
area = max(area, band(c.y, aa, top, bot) * curs * rl * rl);
}
} else {
int rows = max(1, int(u_geom.z + 0.5));
int step = max(1, int(u_geom.w + 0.5));
int high = wide;
int n = int(floor((c.y - u_rail.y) / u_cell + 0.5));
int row = n >= 0 && n < (rows - 1) * step + high ? n / step : -1;
if (row >= 0 && n - row * step >= high) row = -1;
if (cov > 0.0 && row >= 0) {
float a2 = chance(imod(idx, ring), row) < u_geom.x ? ink : void_;
area = max(area, cov * inkOf(a2));
}
}
return clamp(lumOfArea(area), 0.0, 1.0);
}
const vec2 DART[4] = vec2[4](
vec2(2.6, 1.4), vec2(16.8, 12.0), vec2(2.6, 22.6), vec2(7.4, 12.0)
);
float dartAt(vec2 c, float aa, out float ink) {
vec2 s = u_rect.zw;
float k = min(s.x / 18.0, s.y / 24.0) * 0.82;
vec2 p = (c - s * 0.5) / k + vec2(9.0, 12.0);
p.x -= u_dart.z;
float d = 1e9;
float sgn = 1.0;
for (int i = 0; i < 4; i++) {
vec2 a = DART[i], b = DART[(i + 1) & 3];
vec2 e = b - a, w = p - a;
vec2 q = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
d = min(d, dot(q, q));
bvec3 cnd = bvec3(p.y >= a.y, p.y < b.y, e.x * w.y > e.y * w.x);
if (all(cnd) || all(not(cnd))) sgn = -sgn;
}
float sd = (sgn * sqrt(d) - 0.75) * k;
ink = 1.0;
float cov = 1.0 - smoothstep(-aa * 0.7, aa * 0.7, sd);
float tail = smoothstep(9.5, 3.0, p.x);
float wave = sin(p.x * u_dart.y - u_time) * 0.5 + 0.5;
float level = 1.32 - u_dart.x * tail * (1.0 - wave) + u_dart.w;
return cov * max(level, 0.0);
}
float rulerAt(vec2 c, out float ink, out float depth) {
float f = max(1.0, u_cam.x);
vec2 o = u_cam.yz;
float kap = max(0.0, u_drum.x);
float phx = clamp(u_drum.y, 0.0, 2.5);
float sF = u_drum.w;
float R1 = max(1.0, u_eye.x);
float th = clamp(u_eye.y, 0.05, 1.5708);
float Lr = max(0.0, u_eye.z);
float R2 = max(1.0, u_eye.w);
float st = sin(th), ct = cos(th);
float sx = sin(phx), cx = cos(phx);
float Sx = u_set.x;
vec2 E = u_set.yz;
vec2 nE = vec2(-sx, cx);
vec2 C1 = E + R1 * nE;
vec2 nrm = vec2(st, ct);
vec2 P1 = C1 - R1 * nrm;
vec2 dir = vec2(-ct, st);
vec2 P2 = P1 + Lr * dir;
vec2 C2 = P2 - R2 * nrm;
vec2 P3 = C2 + vec2(0.0, R2);
float S1 = Sx + R1 * (th + phx);
float S2 = S1 + Lr;
float S3 = S2 + R2 * th;
float dx = c.x - u_pp.x;
float dy = u_pp.y - c.y;
vec2 d = vec2(dy, -f);
float qa = max(1e-8, dot(d, d));
vec2 oF = vec2(o.x + sF, o.y);
float A = kap * qa;
float B = 2.0 * (kap * dot(oF, d) + d.y);
float Cc = kap * dot(oF, oF) + 2.0 * oF.y;
float discD = B * B - 4.0 * A * Cc;
float kD = 2.0 * Cc / max(1e-6, -B + sqrt(max(discD, 0.0)));
vec2 pD = oF + kD * d;
float xa = -pD.x * kap;
float xb = 1.0 + pD.y * kap;
float xr = xa / max(1e-6, xb);
float x2 = xr * xr;
float phS = xr * (1.0 - x2 * (1.0 / 3.0 - x2 * (0.2 - x2 * (1.0 / 7.0 - x2 * (1.0 / 9.0 - x2 / 11.0)))));
float phD = abs(xr) < 0.5 ? phS : atan(xa, xb);
float arcF = kap > 1e-12 ? phD / kap : -pD.x;
float sW = sF + arcF;
float okD = step(0.0, discD) * step(1e-4, kD) * step(sW, Sx + 0.5);
vec2 oc1 = o - C1;
float qb1 = 2.0 * dot(oc1, d);
float qc1 = dot(oc1, oc1) - R1 * R1;
float disc1 = qb1 * qb1 - 4.0 * qa * qc1;
float sq1 = sqrt(max(disc1, 0.0));
float k1a = (-qb1 - sq1) / (2.0 * qa);
float k1b = (-qb1 + sq1) / (2.0 * qa);
vec2 p1a = oc1 + k1a * d;
vec2 p1b = oc1 + k1b * d;
float al1a = atan(-p1a.x, -p1a.y);
float al1b = atan(-p1b.x, -p1b.y);
float on1 = step(0.0, disc1);
float ok1a = on1 * step(1e-4, k1a) * step(-phx - 1e-4, al1a) * step(al1a, th + 1e-4);
float ok1b = on1 * step(1e-4, k1b) * step(-phx - 1e-4, al1b) * step(al1b, th + 1e-4);
float kC1 = ok1a > 0.5 ? k1a : (ok1b > 0.5 ? k1b : 1e6);
float alC1 = ok1a > 0.5 ? al1a : al1b;
float okC1 = max(ok1a, ok1b);
float dn = dot(d, nrm);
float dnSafe = abs(dn) < 1e-6 ? 1e-6 : dn;
float kR = dot(P1 - o, nrm) / dnSafe;
vec2 pR = o + kR * d;
float uR = dot(pR - P1, dir);
float okR = step(1e-4, kR) * step(1e-6, abs(dn)) * step(0.0, uR) * step(uR, Lr);
vec2 oc2 = o - C2;
float qb2 = 2.0 * dot(oc2, d);
float qc2 = dot(oc2, oc2) - R2 * R2;
float disc2 = qb2 * qb2 - 4.0 * qa * qc2;
float sq2 = sqrt(max(disc2, 0.0));
float k2a = (-qb2 - sq2) / (2.0 * qa);
float k2b = (-qb2 + sq2) / (2.0 * qa);
vec2 p2a = oc2 + k2a * d;
vec2 p2b = oc2 + k2b * d;
float ph2a = atan(p2a.x, p2a.y);
float ph2b = atan(p2b.x, p2b.y);
float on2 = step(0.0, disc2);
float ok2a = on2 * step(1e-4, k2a) * step(0.0, p2a.x) * step(0.0, p2a.y) * step(ph2a, th + 1e-4);
float ok2b = on2 * step(1e-4, k2b) * step(0.0, p2b.x) * step(0.0, p2b.y) * step(ph2b, th + 1e-4);
float kC2 = ok2a > 0.5 ? k2a : (ok2b > 0.5 ? k2b : 1e6);
float phC2 = ok2a > 0.5 ? ph2a : ph2b;
float okC2 = max(ok2a, ok2b);
float kN = (o.y - P3.y) / max(1e-6, -d.y);
float yN = o.x + kN * d.x;
float okN = step(1e-4, kN) * step(yN, P3.x);
float kw = okD > 0.5 ? kD : 1e6;
float kc1 = okC1 > 0.5 ? kC1 : 1e6;
float kr = okR > 0.5 ? kR : 1e6;
float kc2 = okC2 > 0.5 ? kC2 : 1e6;
float kn = okN > 0.5 ? kN : 1e6;
float k = min(min(kw, kc1), min(kr, min(kc2, kn)));
float hit = step(k, 1e5);
float sC1 = Sx + R1 * (alC1 + phx);
float sR = S1 + uR;
float sC2 = S2 + R2 * (th - phC2);
float sN = S3 + (P3.x - yN);
float s = k == kn ? sN : (k == kc2 ? sC2 : (k == kr ? sR : (k == kc1 ? sC1 : sW)));
float t = u_rule.y + (s - u_cam.w) / u_rule.x;
float u = u_pp.x + k * dx;
depth = k;
float dsW = fwidth(sW);
float dsC1a = fwidth(Sx + R1 * (al1a + phx));
float dsC1b = fwidth(Sx + R1 * (al1b + phx));
float dsR = fwidth(sR);
float dsC2a = fwidth(S2 + R2 * (th - ph2a));
float dsC2b = fwidth(S2 + R2 * (th - ph2b));
float dsN = fwidth(sN);
float duW = fwidth(kD * dx);
float duC1a = fwidth(k1a * dx);
float duC1b = fwidth(k1b * dx);
float duR = fwidth(kR * dx);
float duC2a = fwidth(k2a * dx);
float duC2b = fwidth(k2b * dx);
float duN = fwidth(kN * dx);
float ds = k == kn ? dsN : (k == kc2 ? (ok2a > 0.5 ? dsC2a : dsC2b) : (k == kr ? dsR : (k == kc1 ? (ok1a > 0.5 ? dsC1a : dsC1b) : dsW)));
float du = k == kn ? duN : (k == kc2 ? (ok2a > 0.5 ? duC2a : duC2b) : (k == kr ? duR : (k == kc1 ? (ok1a > 0.5 ? duC1a : duC1b) : duW)));
float et = ds / max(1e-6, u_rule.x) * 0.5;
float eu = du * 0.5;
float n = floor(t + 0.5);
float isDay = step(mod(abs(n), max(1.0, u_rank.x)), 0.5);
float isKey = step(mod(n - u_rank.z, max(1.0, u_rank.y)), 0.5) * step(u_rank.z - 0.5, n);
float w = (1.0 - smoothstep(0.0, max(0.05, u_rule.z), abs(n - u_rule.y))) * u_hot.w;
float behind = u_trail.x - n;
float dT = mix(abs(behind), max(0.0, behind), clamp(u_trail.z, 0.0, 1.0));
float wT = 1.0 - smoothstep(0.0, max(0.05, u_trail.y), dT);
float al = clamp(u_rule2.w, 0.0, 1.0);
float lay = smoothstep(0.0, S1, s);
float lenF = mix(mix(u_rule2.x, u_rule2.y, isDay), mix(u_rule2.y, u_rule2.z, w), isKey);
float mb = clamp(u_slat.z, 0.0, 1.0);
float isSlat = step(mod(n - u_slat.y, max(1.0, u_slat.x)), 0.5);
lenF = mix(lenF, u_slat.w, mb);
float Lw = lenF * u_shade.w;
float face = smoothstep(S2, S3, s);
float lo = mix(u_shade.x - al * Lw, u_road2.z, face);
float hi = mix(u_shade.x + (1.0 - al) * Lw, u_road2.w, face);
float fw = max(1.0, u_rect.z);
float ppx = clamp(u_pp.x, 1.0, fw - 1.0);
float reach = min((ppx - lo) / ppx, (hi - ppx) / (fw - ppx)) / max(1e-4, k);
float swell = smoothstep(1.0, 1.0 + max(0.02, u_road2.x), reach);
float halfR = mix(mix(u_thick.x, u_thick.y, isDay), u_thick.z, isKey);
float halfT = mix(halfR, u_thick.x + (halfR - u_thick.x) * clamp(u_len2.w, 0.0, 1.0), lay);
float halfH = min(mix(mix(u_hot.x, u_hot.y, isDay), u_hot.z, isKey), max(0.01, u_road2.y));
halfT = mix(halfT, halfH, wT);
float halfW = halfT;
float halfC = mix(u_shut.z, u_shut.w, smoothstep(0.0, 1.0, (n - u_shut.x) / max(0.05, u_shut.y)));
halfC = max(halfC, .5 * u_slat.x * smoothstep(.40 * u_slat.x, .46 * u_slat.x, halfC));
halfT = max(halfT, halfC * isSlat);
halfT = max(halfT, 0.5 * u_blind.w * k / u_rule.x);
float cov = band(t, et, n - halfT, n + halfT) * max(band(u, eu, lo, hi), swell);
cov *= 1.0 - mb * (1.0 - isSlat);
float per = max(1.0, u_slat.x);
float nS = u_slat.y + per * floor((t - u_slat.y) / per);
float leftHalf = mix(u_shut.z, u_shut.w, smoothstep(0.0, 1.0, (nS - u_shut.x) / max(0.05, u_shut.y)));
float rightHalf = mix(u_shut.z, u_shut.w, smoothstep(0.0, 1.0, (nS + per - u_shut.x) / max(0.05, u_shut.y)));
float strokeFloor = max(u_thick.x, 0.5 * u_blind.w * k / u_rule.x);
leftHalf = max(leftHalf, strokeFloor);
rightHalf = max(rightHalf, strokeFloor);
float gap = max(0.0, per - leftHalf - rightHalf);
float centre = nS + (per + leftHalf - rightHalf) * .5;
float gapT = gap * smoothstep(.08 * per, .20 * per, gap);
float halfGap = .5 * gapT;
float covW = band(t, et, n - halfW, n + halfW) * isSlat;
float unresolved = smoothstep(0.25, 0.5, eu / max(1.0, hi - lo)) * smoothstep(0.15 * per, 0.35 * per, et);
float across = max(band(u, eu, lo, hi), swell) * (1.0 - unresolved);
float covS = max(1.0 - band(t, et, centre - halfGap, centre + halfGap), covW) * across;
cov = mix(cov, covS, mb);
float near = exp(-abs(t - u_rule.y) / max(0.5, u_shade.y));
float attn = mix(u_shade.z, u_rank.w, near);
attn = mix(attn, u_rule.w, w);
float onRoad = clamp(u_road.w, 0.0, 1.0);
ink = mix(attn, clamp(u_road.z, 0.0, 1.0), onRoad);
ink = mix(ink, 1.0, clamp(u_blind.x, 0.0, 1.0));
float dist = k * sqrt(dx * dx + qa) / f;
float fog = 1.0 - smoothstep(u_road.x, max(u_road.x + 0.05, u_road.y), dist);
float deep = (k - 1.0) * f;
float dm = clamp((deep - u_deep.x) / max(1.0, u_deep.y - u_deep.x), 0.0, 1.0);
float veilD = pow(1.0 - smoothstep(0.0, 1.0, dm), max(0.05, u_deep.z));
float haze = mix(veilD, fog, clamp(u_deep.w, 0.0, 1.0));
return cov * haze * hit * step(1e-4, k);
}
void main() {
vec2 g = vec2(gl_FragCoord.x, u_field.y - gl_FragCoord.y);
vec2 c = (g - 1.0) * u_cell - u_phase;
float aa = u_cell * 0.5;
float lum = 0.0;
float ink = 1.0;
SYBIOSME_SOURCE_DISPATCH
float tone = clamp((lum - u_tone.x) / max(1e-4, u_tone.y - u_tone.x), 0.0, 1.0);
tone = pow(tone, u_tone.z) * maskAt(c);
tone += (hash(g + u_time * 0.017) - 0.5) * u_tone.w * 4.0 * tone * (1.0 - tone);
tone = clamp(tone, 0.0, 1.0);
vec2 keep = onPage(c);
tone *= keep.y;
float rest = u_grid.w * max(u_grid.x, 1.5 / 255.0);
tone = mix(rest, max(tone, rest), u_grid.z);
float lit = u_grid.w > 0.5
? smoothstep(0.0, 0.06, tone - rest)
: smoothstep(0.0, 1e-4, tone);
ink = mix(u_grid.y, max(ink, u_grid.y), lit);
fragColour = vec4(tone, clamp(ink * u_ink.y + u_ink.x, 0.0, 1.0), 1.0 - lit, keep.x);
}`,ue=`${W}
uniform sampler2D u_fieldTex;
uniform ivec2 u_fieldSize;
uniform vec4  u_disc;
uniform vec4  u_paint;
uniform vec4  u_screen;
uniform vec4  u_paper;
out vec4 fragColour;
void main() {
vec2 p = vec2(gl_FragCoord.x - u_rect.x, u_rect.y + u_rect.w - gl_FragCoord.y);
vec2 q = (p + u_phase) / u_cell;
ivec2 k = ivec2(floor(q));
float d = 1e9;
float ink = 0.0;
float bare = 0.0;
float best = 1e9;
float keep = 1.0;
float soft = u_disc.z * u_cell;
for (int j = -1; j <= 1; j++) {
for (int i = -1; i <= 1; i++) {
ivec2 c = k + ivec2(i, j) + ivec2(1);
c = clamp(c, ivec2(0), u_fieldSize - 1);
vec4 f = texelFetch(u_fieldTex, ivec2(c.x, u_fieldSize.y - 1 - c.y), 0);
if (f.r <= 0.0) continue;
vec2 ctr = (vec2(k + ivec2(i, j)) + 0.5) * u_cell - u_phase;
float rf = mix(u_disc.x, u_disc.y, f.r) * u_cell;
float r = mix(u_screen.a, max(rf, u_screen.a), 1.0 - f.b) * f.a;
float dd = length(p - ctr) - r;
if (dd < best) { best = dd; ink = f.g; bare = f.b; keep = f.a; }
if (f.a <= 0.0) continue;
d = smin(d, dd, soft);
}
}
float aa = u_disc.w;
float a = 1.0 - smoothstep(-aa, aa, d);
float out_ = a * clamp(ink, 0.0, 1.0) * u_paint.a;
vec3 rgb = mix(u_paint.rgb, u_screen.rgb, bare);
vec2 corner = floor((p + u_phase) / u_cell + 0.5) * u_cell - u_phase;
float dp = length(p - corner) - u_paper.y;
float ap = (1.0 - smoothstep(-aa, aa, dp)) * clamp(u_paper.x, 0.0, 1.0) * keep;
fragColour = vec4(rgb * out_ * (1.0 - ap), out_ * (1.0 - ap) + ap);
}`,ie=["u_rect","u_cell","u_phase","u_source","u_time","u_field","u_tone","u_ink","u_grid","u_sheet","u_sheetGrid","u_sphere","u_mask","u_maskSoft","u_flip","u_hole","u_holes[0]","u_holeR[0]","u_holeFade[0]","u_bars[0]","u_inks[0]","u_chart","u_geom","u_rail","u_sweep","u_dart","u_rule","u_thick","u_hot","u_rule2","u_len2","u_road2","u_rank","u_road","u_blind","u_cam","u_eye","u_pp","u_shade","u_trail","u_shut","u_slat","u_drum","u_deep","u_set","u_art","u_artPointer","u_letter"],le=["u_rect","u_cell","u_phase","u_source","u_time","u_fieldTex","u_fieldSize","u_disc","u_paint","u_screen","u_paper"],ne=[0,0,0,0],fe=[-1e6,1e6,-1e6,1e6],se=[1,1,1,1],ce=[-1e6,1,0,0],_e=[1e6,1,0,0],$=[0,.1,.8,1],me=[1,0,0,0],de=[0,0,1e6,0],pe=[1e6,-1e6,0,0],he=[0,1e6,1,0],xe=new Float32Array(F),ve={sphere:"lum = sphereAt(c);",chart:"lum = chartAt(c, aa);",dart:"lum = dartAt(c, aa, ink);",ruler:"float depth; lum = rulerAt(c, ink, depth);",grid:"",option:"lum = optionAt(c, aa);"};function ke(e=Object.keys(O)){const E=e.filter(a=>a!=="grid").map(a=>`if (u_source == ${O[a]}) { ${ve[a]} }`).join(" else ");return re.replace("SYBIOSME_SOURCE_DISPATCH",E)}function Te(e,E,a={}){let k=a.parallel?e.getExtension("KHR_parallel_shader_compile"):null,n=null,s=!1,A=null,b=null,o={},_={},I=null,d=null,h=null,T=null,P=0,C=0,L=0,N=0,f=[8,8,63,0];const x=t=>{const i=e.createShader(e.VERTEX_SHADER);e.shaderSource(i,oe),e.compileShader(i);const u=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(u,t),e.compileShader(u);const m=e.createProgram();return e.attachShader(m,i),e.attachShader(m,u),e.linkProgram(m),{p:m,v:i,f:u}},p=(t,i)=>{const{p:u,v:m,f:R}=t,S=e.getProgramParameter(u,e.LINK_STATUS);if(!S){for(const D of[m,R])e.getShaderParameter(D,e.COMPILE_STATUS)||console.error(`[halftone:${E}]`,e.getShaderInfoLog(D));console.error(`[halftone:${E}]`,e.getProgramInfoLog(u))}if(e.deleteShader(m),e.deleteShader(R),!S)return e.deleteProgram(u),null;const U={};for(const D of i)U[D]=e.getUniformLocation(u,D);return{p:u,at:U}},l=()=>{if(!n)return!1;const{a:t,b:i}=n;n=null;const u=p(t,ie),m=p(i,le);return!u||!m?!1:(A=u.p,o=u.at,b=m.p,_=m.at,I=e.createVertexArray(),d=e.createFramebuffer(),h=e.createTexture(),e.bindTexture(e.TEXTURE_2D,h),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),!0)},c=()=>(n={a:x(ke(a.sources)),b:x(ue)},k?!1:l());s=c();const v=(t,i)=>{t<=P&&i<=C||(P=Math.max(P,t,4),C=Math.max(C,i,4),e.bindTexture(e.TEXTURE_2D,h),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,P,C,0,e.RGBA,e.UNSIGNED_BYTE,null))},r=(t,i)=>{const u=i??ne;e.uniform4f(t,u[0],u[1],u[2],u[3])};return{get ok(){return s},get pending(){return!!n},poll(){return s||!n?s:k&&!(e.getProgramParameter(n.a.p,k.COMPLETION_STATUS_KHR)&&e.getProgramParameter(n.b.p,k.COMPLETION_STATUS_KHR))?!1:(s=l(),s)},rebuild(){return a.parallel&&(k=e.getExtension("KHR_parallel_shader_compile")),s=c(),P=0,C=0,s},setSheet(t,i,u,m){s&&(T||(T=e.createTexture(),e.bindTexture(e.TEXTURE_2D,T),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)),e.bindTexture(e.TEXTURE_2D,T),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.R8,e.RED,e.UNSIGNED_BYTE,t),f=[i,u,m,.5/(t.width/i)])},async setSheetInBands(t,i,u,m,R,S=4){if(!s)return!1;const U=t.width,D=t.height,g=e.createTexture();if(!g)return!1;e.bindTexture(e.TEXTURE_2D,g),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texStorage2D(e.TEXTURE_2D,1,e.R8,U,D);const K=Math.ceil(D/Math.max(1,S));for(let X=0;X<D;X+=K){const B=await createImageBitmap(t,0,X,U,Math.min(K,D-X));if(await R(),!s||e.isContextLost())return B.close(),e.deleteTexture(g),!1;e.bindTexture(e.TEXTURE_2D,g),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texSubImage2D(e.TEXTURE_2D,0,0,X,e.RED,e.UNSIGNED_BYTE,B),B.close()}return T&&e.deleteTexture(T),T=g,f=[i,u,m,.5/(U/i)],!0},get hasSheet(){return!!T},draw(t,i){this.field(t)&&this.meta(t,i)},field(t){if(!s||!A||!b)return!1;const i=Math.max(1,t.cell),u=Math.ceil(t.rect.w/i)+2,m=Math.ceil(t.rect.h/i)+2;v(u,m),L=u,N=m,e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,null),e.bindFramebuffer(e.FRAMEBUFFER,d),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,h,0),e.viewport(0,0,u,m),e.disable(e.BLEND),e.useProgram(A),e.bindVertexArray(I),e.uniform4f(o.u_rect,t.rect.x,t.rect.y,t.rect.w,t.rect.h),e.uniform1f(o.u_cell,i),e.uniform2f(o.u_phase,t.phaseX,t.phaseY),e.uniform1i(o.u_source,t.source),e.uniform1f(o.u_time,t.time),e.uniform2f(o.u_field,u,m),r(o.u_tone,t.tone),e.uniform2f(o.u_ink,t.ink[0],t.ink[1]),e.uniform4f(o.u_grid,t.grid?.[0]??0,t.grid?.[1]??0,t.grid?.[2]??1,t.grid?.[3]??0),r(o.u_mask,t.mask??fe),r(o.u_maskSoft,t.maskSoft??se);const R=Math.min(F,t.hole?.[0]??0);return e.uniform2f(o.u_hole,R,t.hole?.[1]??1),R>0&&(e.uniform4fv(o["u_holes[0]"],t.holes),e.uniform1fv(o["u_holeR[0]"],t.holeR),e.uniform1fv(o["u_holeFade[0]"],t.holeFade??xe)),t.source===O.sphere?(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,T),e.uniform1i(o.u_sheet,0),r(o.u_sheetGrid,f),r(o.u_sphere,t.sphere),e.uniform1f(o.u_flip,t.flip??0)):t.source===O.option?(r(o.u_art,t.art),r(o.u_sweep,t.sweep??$),e.uniform2f(o.u_artPointer,t.artPointer?.[0]??0,t.artPointer?.[1]??0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,t.letter??null),e.uniform1i(o.u_letter,1),e.activeTexture(e.TEXTURE0)):t.source===O.chart?(r(o.u_chart,t.chart),r(o.u_geom,t.geom),r(o.u_rail,t.rail),r(o.u_sweep,t.sweep??$),e.uniform4fv(o["u_bars[0]"],t.bars),e.uniform4fv(o["u_inks[0]"],t.inks),r(o.u_shade,t.shade)):t.source===O.dart?r(o.u_dart,t.dart):t.source===O.ruler&&(r(o.u_rule,t.rule),r(o.u_thick,t.thick),r(o.u_hot,t.hot),r(o.u_rule2,t.rule2),r(o.u_len2,t.len2),r(o.u_road2,t.road2),r(o.u_rank,t.rank),r(o.u_road,t.road),r(o.u_blind,t.blind),r(o.u_trail,t.trail??ce),r(o.u_shut,t.shut??_e),r(o.u_slat,t.slat??me),r(o.u_drum,t.drum??de),r(o.u_deep,t.deep??he),r(o.u_set,t.set??pe),r(o.u_shade,t.shade),r(o.u_cam,t.cam),r(o.u_eye,t.eye),e.uniform2f(o.u_pp,t.pp?.[0]??0,t.pp?.[1]??0)),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),!0},meta(t,i){if(!s||!A||!b)return;const u=Math.max(1,t.cell),m=L,R=N;e.bindFramebuffer(e.FRAMEBUFFER,null);const S=i-t.rect.y-t.rect.h;e.viewport(t.rect.x,S,t.rect.w,t.rect.h),e.useProgram(b),e.uniform4f(_.u_rect,t.rect.x,S,t.rect.w,t.rect.h),e.uniform1f(_.u_cell,u),e.uniform2f(_.u_phase,t.phaseX,t.phaseY),e.uniform1f(_.u_time,t.time),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,h),e.uniform1i(_.u_fieldTex,0),e.uniform2i(_.u_fieldSize,m,R),r(_.u_disc,t.disc),r(_.u_paint,t.paint),r(_.u_screen,t.screen??[t.paint[0],t.paint[1],t.paint[2],0]),r(_.u_paper,t.paper??[0,0,0,0]),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.drawArrays(e.TRIANGLES,0,3),e.disable(e.BLEND)},readField(t,i){if(!s)return null;e.bindFramebuffer(e.FRAMEBUFFER,d),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,h,0);const u=new Uint8Array(t*i*4);return e.readPixels(0,0,t,i,e.RGBA,e.UNSIGNED_BYTE,u),e.bindFramebuffer(e.FRAMEBUFFER,null),u},dispose(){if(s=!1,n){for(const t of[n.a,n.b])e.deleteShader(t.v),e.deleteShader(t.f),e.deleteProgram(t.p);n=null}e.deleteProgram(A),e.deleteProgram(b),e.deleteVertexArray(I),e.deleteFramebuffer(d),e.deleteTexture(h),T&&e.deleteTexture(T),A=b=null,T=null,P=C=0}}}const M=self;let G,y=null,w=null,V=!1,z=!1,q=null;function Y(e){if(!y||!w||!z)return;y.resize(e.width,e.height,1);const E=e.job?w.field(e.job):!1;y.render(e.time,e.colours,e.count,e.uniforms,e.travel),e.job&&E&&w.meta(e.job,y.height);const a=E&&e.job?.source===0&&w.hasSheet,k=y.gl,n=k.fenceSync(k.SYNC_GPU_COMMANDS_COMPLETE,0);k.flush();const s=()=>{if(V||!z){n&&k.deleteSync(n);return}if(n&&k.clientWaitSync(n,0,0)===k.TIMEOUT_EXPIRED){setTimeout(s,1);return}n&&k.deleteSync(n),M.postMessage({type:"frame",sphere:a,y:e.y,width:e.width,height:e.height})};s()}async function we(){if(!y||!w){M.postMessage({type:"failed"});return}for(;!V&&(!y.poll()||!w.poll());){if(!w.pending&&!w.ok){M.postMessage({type:"failed"});return}await new Promise(e=>setTimeout(e,16))}if(!V&&(z=!0,M.postMessage({type:"ready"}),q)){const e=q;q=null,Y(e)}}M.onmessage=({data:e})=>{try{if(e.type==="init")G=e.canvas,y=te(G,{parallel:!0}),w=y?Te(y.gl,"ground-worker",{parallel:!0,sources:["sphere","ruler","grid"]}):null,G.addEventListener("webglcontextlost",E=>{E.preventDefault(),z=!1,M.postMessage({type:"lost"})}),we().catch(()=>M.postMessage({type:"failed"}));else if(e.type==="frame")z?Y(e.frame):q=e.frame;else if(e.type==="sheet"){if(!w){e.bitmap.close();return}w.setSheet(e.bitmap,e.cols,e.rows,e.frames),e.bitmap.close(),M.postMessage({type:"sheet",ok:w.hasSheet})}else e.type==="dispose"&&(V=!0,w?.dispose(),y?.dispose())}catch{M.postMessage({type:"failed"})}}})();
