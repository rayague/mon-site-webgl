// Shaders GLSL (WebGL2) — chargés par intro.js
window.SHADERS = {
  vs: `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0);
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`,

  fsScene: `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;
uniform float uTime, uLight, uOpen, uPupil, uSpin, uMorph, uGlowA, uGlowB, uEyesY, uScale, uEyeX, uFrown, uClose, uFade;
uniform vec2 uGaze;
#define PI 3.14159265359
#define TAU 6.28318530718

float W, HT, HB, S;

float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y);
}
// bruit périodique en x : coordonnées angulaires sans couture
float pnoise(vec2 p, float per){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  float x0 = mod(i.x, per), x1 = mod(i.x + 1., per);
  return mix(mix(hash12(vec2(x0, i.y)), hash12(vec2(x1, i.y)), u.x),
             mix(hash12(vec2(x0, i.y+1.)), hash12(vec2(x1, i.y+1.)), u.x), u.y);
}
float pfbm(vec2 p, float per){
  float s = 0., a = .5;
  for(int k = 0; k < 5; k++){ s += a * pnoise(p, per); p *= 2.; per *= 2.; a *= .5; }
  return s / .96875;
}
// SDF d'étoile régulière (Inigo Quilez) : m = n → polygone, m petit → étoile pointue
float sdStar(vec2 p, float r, float n, float m){
  float an = PI / n, en = PI / m;
  vec2 acs = vec2(cos(an), sin(an)), ecs = vec2(cos(en), sin(en));
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
  return length(p) * sign(p.x);
}
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.) / k; return min(a, b) - h * h * k * .25; }
// paupière supérieure : courbe naturelle coupée par une droite qui plonge vers le nez (froncement)
float topC(float x){
  float xn = clamp(x / W, -1., 1.), k = max(1. - xn*xn, 0.);
  float closed = -0.14 * HT * k, op = HT * pow(k, .72) * (1. + .12 * xn);
  float yl = HT * (mix(1.3, .95, uFrown) - mix(.3, 1.05, uFrown) * (xn * .5 + .5));
  op = smin(op, yl, .25 * HT);
  return mix(closed, op, uOpen) - 0.10 * HT * xn;
}
float botC(float x){
  float xn = clamp(x / W, -1., 1.), k = max(1. - xn*xn, 0.);
  float closed = -0.14 * HT * k, op = -HB * pow(k, .95) * (1. - .1 * xn) * (1. - .3 * uFrown);
  return mix(closed, op, min(uOpen * 1.1, 1.)) - 0.10 * HT * xn;
}
float browY(float x){
  float xn = x / W, k = max(1. - xn*xn, 0.);
  return HT * (1.6 + .3 * k) - uFrown * HT * .95 * (xn * .5 + .5) - .1 * HT * xn;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float px = 1.0 / uRes.y;
  S = uScale; W = 0.19 * S; HT = 0.086 * S; HB = 0.064 * S;
  float Ri = 0.082 * S;

  float side = uv.x < 0. ? -1. : 1.;
  vec2 c = vec2(side * uEyeX * S, uEyesY);
  vec2 p = uv - c;
  vec2 lp = vec2(-side * p.x, p.y);          // repère local : +x = coin interne (nez)
  vec2 g = vec2(-side * uGaze.x, uGaze.y);
  float xn = lp.x / W;

  float T = topC(lp.x), B = botC(lp.x);
  float dEdge = max(lp.y - T, B - lp.y);
  if(abs(lp.x) > W) dEdge = length(vec2(abs(lp.x) - W, lp.y + 0.10 * HT * sign(xn)));
  float aw = max(fwidth(dEdge), px * .5);
  float inside = 1. - smoothstep(-aw, aw, dEdge);

  float L = uLight;
  float mm = smoothstep(0., 1., uMorph);
  vec3 tint = mix(vec3(.25, .6, 1.), vec3(1., .45, .08), mm);
  float over = max(uGlowB - 1., 0.);
  float lit = uGlowA * .35 + min(uGlowB, 1.) * .8 + over * 1.1;

  // ------- Tout est noir hors des yeux : seuls les bords et les sourcils captent la lueur -------
  vec3 outC = vec3(0.);
  float od = max(dEdge, 0.);
  outC += tint * lit * (.35 * exp(-pow(od / (.0025 * S), 2.)) + .1 * exp(-od / (.02 * S))) * smoothstep(1.02, .7, abs(xn));

  // sourcils froncés, éclairés par en dessous
  float bx = lp.x / W;
  if(bx > -1.2 && bx < 1.1){
    float by = browY(lp.x);
    float th = (.0065 + .0075 * clamp((bx + 1.1) / 1.9, 0., 1.)) * S;
    float dy = lp.y - by;
    float ends = smoothstep(-1.2, -1.0, bx) * smoothstep(1.1, .98, bx);
    float body = (1. - smoothstep(th * .8, th * 1.05, abs(dy))) * ends;
    float slope = (browY(lp.x + .002 * S) - browY(lp.x - .002 * S)) / (.004 * S);
    vec2 hd = normalize(vec2(1., slope + .25));
    vec2 hp = vec2(dot(lp, hd), dot(lp, vec2(-hd.y, hd.x)));
    float hair = smoothstep(.4, .9, vnoise(vec2(hp.x * 70. / S, hp.y * 1100. / S)));
    float under = exp(-pow((dy + th * .75) / (th * .3), 2.)) * ends;
    outC += tint * lit * (body * (.04 + .3 * hair) + under * (.6 + .6 * hair));
  }

  // ------- Globe oculaire -------
  vec2 q = lp / (W * 1.05);
  float z = sqrt(max(1. - dot(q, q), 0.));
  vec3 scl = vec3(.62, .58, .55);
  float cornerT = smoothstep(.45, 1., abs(xn));
  scl = mix(scl, vec3(.45, .22, .19), cornerT * .6);
  float vn = vnoise(lp * vec2(70., 110.) / S + 3.1) * .6 + vnoise(lp * vec2(170., 250.) / S) * .4;
  float vein = pow(1. - abs(2. * vn - 1.), 16.) * cornerT;
  scl = mix(scl, vec3(.55, .05, .04), vein * .55);
  float car = exp(-pow((lp.x - .93 * W) / (.035 * S), 2.) - pow((lp.y + .1 * HT) / (.02 * S), 2.));
  scl = mix(scl, vec3(.45, .12, .1), car * .9);
  float shade = .25 + .75 * pow(z, .8);
  float lidShadow = smoothstep(0., .05 * S, T - lp.y);
  float lowShadow = smoothstep(0., .02 * S, lp.y - B);
  float occl = mix(.06, 1., pow(lidShadow, .8)) * mix(.5, 1., lowShadow);

  // ------- Iris -------
  vec2 ic = g * vec2(.45 * W, .42 * HT);
  vec2 ip = lp - ic;
  ip.x /= (1. - .2 * abs(g.x));
  ip.y /= (1. - .18 * abs(g.y));
  float r = length(ip) / Ri;
  float aR = px / Ri * 1.2;
  vec3 irisDiff = vec3(0.), irisEm = vec3(0.);
  float irisMask = 0.;
  if(r < 1.3){
    float a = atan(ip.y, ip.x);
    float as_ = a + uSpin;
    float aN = as_ / TAU;
    float pr = uPupil;
    float rr = clamp((r - pr) / (1. - pr), 0., 1.);
    float f1 = pfbm(vec2(aN * 40., rr * 2.5), 40.);
    float f2 = pnoise(vec2(aN * 180., rr * 1.4 + f1 * .6), 180.);
    float fib = pow(f2, 2.5);
    float crypt = smoothstep(.6, .8, pfbm(vec2(aN * 14., rr * 5. + 3.), 14.));
    float coll = exp(-pow((rr - .28 - .025 * sin(as_ * 18.)) / .05, 2.));
    vec2 rp = r * vec2(cos(as_), sin(as_));

    float sd = sdStar(rp, mix(.64, .9, mm), 8., mix(8., 3., mm));
    float lw = mix(.014, .026, mm);
    float starLine = 1. - smoothstep(lw - aR, lw + aR, abs(sd));

    float sector = TAU / 4.;
    float a2 = mod(as_ + PI / 4. + sector * .5, sector) - sector * .5;
    vec2 lq = r * vec2(cos(a2), sin(a2)) - vec2(.64, 0.);
    float runeD = (abs(lq.x) / .12 + abs(lq.y) / .055 - 1.) * .045;
    float runesVis = clamp(1. - uMorph * 2.2, 0., 1.);
    float rune = (1. - smoothstep(-aR, aR, runeD)) * runesVis;
    float runeEdge = exp(-abs(runeD) * 90.) * runesVis;

    vec3 colA = mix(vec3(.012, .01, .06), vec3(.05, .12, .48), f1);
    colA += vec3(.22, .55, .95) * fib * .6;
    colA *= 1. - .5 * crypt;
    colA += vec3(.3, .75, 1.) * coll * .3;
    colA = mix(colA, vec3(.004), rune);
    vec3 emA = vec3(.35, .85, 1.25) * (fib * .45 + coll * 1.1 + exp(-pow(rr / .12, 2.)) * .25 + starLine * 1.6 + exp(-abs(sd) * 18.) * .25 + runeEdge * 1.2);
    emA *= uGlowA;

    vec3 colB = mix(vec3(.16, .025, .0), vec3(.9, .36, .04), f1);
    colB += vec3(1., .62, .18) * fib * .55;
    colB *= 1. - .35 * crypt;
    float core = exp(-pow(rr / .35, 2.));
    float ring2 = 1. - smoothstep(.011 - aR, .011 + aR, abs(r - .36));
    float etched = max(starLine, ring2 * mm);
    vec3 emB = (colB * .6 + vec3(1.3, .6, .12) * core * .45) * .9;
    colB = mix(colB, vec3(.02, .005, 0.), etched);
    emB *= 1. - etched * .96;
    emB += vec3(1.6, .65, .12) * exp(-abs(sd) * 60.) * (1. - etched) * .7;
    emB *= uGlowB;

    float mw = smoothstep(r - .3, r, uMorph * 1.3);
    irisDiff = mix(colA, colB, mw);
    irisEm = mix(emA, emB, mw);

    float limb = smoothstep(.74, 1., r);
    irisDiff *= 1. - .88 * limb;
    irisEm *= 1. - .92 * limb;
    float pm = 1. - smoothstep(pr - aR, pr + aR * 1.5, r);
    irisDiff = mix(irisDiff, vec3(.003), pm);
    irisEm *= 1. - pm;
    irisMask = 1. - smoothstep(.985 - aR, 1.02 + aR, r);
  }

  // ------- Cornée : reflets -------
  vec2 hp = lp - (ic * .55 + vec2(side * .30, .30) * Ri);
  vec2 hb = abs(hp) - vec2(.12, .065) * Ri;
  float hd = length(max(hb, 0.)) + min(max(hb.x, hb.y), 0.) - .035 * Ri;
  float spec = (1. - smoothstep(-px * 1.5, px * 1.5 + .006 * S, hd)) * .85;
  vec2 hp2 = lp - (ic * .6 + vec2(-side * .22, -.28) * Ri);
  spec += .5 * exp(-dot(hp2, hp2) / pow(.045 * Ri, 2.));
  spec *= 1. - smoothstep(1.02, 1.12, r);

  vec3 sclC = scl * shade * occl * L * .55;
  vec3 irisC = irisDiff * (.35 + .65 * z) * occl * L * .9 + irisEm * mix(.45, 1., occl);
  vec3 eyeCol = mix(sclC, irisC, irisMask);
  eyeCol += vec3(1.) * spec * (.2 + 1.4 * L) * mix(.25, 1., lidShadow);
  eyeCol += vec3(.9, .8, .8) * exp(-pow((lp.y - B - .0025 * S) / (.0012 * S), 2.)) * .3 * L * smoothstep(1., .7, abs(xn));
  eyeCol += tint * lit * .12 * exp(-max(r - 1., 0.) * 3.) * (1. - irisMask) * occl;

  vec3 col = mix(outC, eyeCol, inside);

  // fente lumineuse quand les paupières se ferment
  float cl = exp(-pow(dEdge / (.0022 * S), 2.)) * uClose * smoothstep(1., .5, abs(xn));
  col += vec3(2.2, 1., .25) * cl * (1. + over) + vec3(1., .45, .1) * uClose * exp(-abs(dEdge) / (.012 * S)) * .35 * smoothstep(1., .5, abs(xn));

  o = vec4(max(col, 0.) * uFade, 1.);
}`,

  fsDown: `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform float uPrefilter, uThresh, uKnee;
vec3 pf(vec3 c){
  c = min(c, vec3(30.));
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - uThresh + uKnee, 0., 2. * uKnee);
  soft = soft * soft / (4. * uKnee + 1e-4);
  return c * max(soft, br - uThresh) / max(br, 1e-4);
}
void main(){
  vec2 h = uTexel;
  vec3 s = texture(uTex, vUv).rgb * 4.;
  s += texture(uTex, vUv - h).rgb + texture(uTex, vUv + h).rgb;
  s += texture(uTex, vUv + vec2(h.x, -h.y)).rgb + texture(uTex, vUv - vec2(h.x, -h.y)).rgb;
  s /= 8.;
  if(uPrefilter > .5) s = pf(s);
  o = vec4(s, 1.);
}`,

  fsUp: `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uTex, uBase; uniform vec2 uTexel;
void main(){
  vec2 h = uTexel; vec3 s = vec3(0.);
  s += texture(uTex, vUv + vec2(-h.x * 2., 0.)).rgb;
  s += texture(uTex, vUv + vec2(-h.x, h.y)).rgb * 2.;
  s += texture(uTex, vUv + vec2(0., h.y * 2.)).rgb;
  s += texture(uTex, vUv + vec2(h.x, h.y)).rgb * 2.;
  s += texture(uTex, vUv + vec2(h.x * 2., 0.)).rgb;
  s += texture(uTex, vUv + vec2(h.x, -h.y)).rgb * 2.;
  s += texture(uTex, vUv + vec2(0., -h.y * 2.)).rgb;
  s += texture(uTex, vUv + vec2(-h.x, -h.y)).rgb * 2.;
  o = vec4(texture(uBase, vUv).rgb + s / 12., 1.);
}`,

  fsComp: `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uScene, uBloom;
uniform vec2 uRes, uEyeL, uEyeR;
uniform float uTime, uFlash, uCA, uBloomK, uShockT, uExposure, uAspect, uS, uLine, uSlit, uSplit;
#define PI 3.14159265359
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec2 uv = vUv;
  vec2 sp = (uv - .5) * vec2(uAspect, 1.);
  if(uShockT > 0.){
    float R = uShockT * .95, fade = exp(-uShockT * 2.2);
    vec2 off = vec2(0.);
    vec2 d1 = sp - uEyeL, d2 = sp - uEyeR;
    float l1 = length(d1), l2 = length(d2);
    off += d1 / max(l1, 1e-4) * exp(-pow((l1 - R) / .035, 2.));
    off += d2 / max(l2, 1e-4) * exp(-pow((l2 - R) / .035, 2.));
    uv -= off * .028 * fade / vec2(uAspect, 1.);
  }
  vec2 dv = uv - .5;
  vec3 col;
  col.r = texture(uScene, uv + dv * uCA).r;
  col.g = texture(uScene, uv).g;
  col.b = texture(uScene, uv - dv * uCA).b;
  col += texture(uBloom, uv).rgb * uBloomK;
  float near = exp(-pow(min(length(sp - uEyeL), length(sp - uEyeR)) / .22, 2.));
  col += uFlash * vec3(1.3, .9, .5) * (.1 + 1.6 * near);
  col = aces(col * uExposure);
  col = pow(col, vec3(1. / 2.2));
  col += (hash12(gl_FragCoord.xy + fract(uTime * 37.) * vec2(113., 71.)) - .5) * .02;

  float px = 1. / uRes.y;
  float dy = sp.y - uEyeL.y, ax = abs(sp.x);

  // 1) les deux fentes s'étirent et fusionnent en une ligne qui traverse l'écran
  float halfLen = mix(.49 * uS, .5 * uAspect + .08, uSlit);
  float gap = mix(.11 * uS, 0., uSlit);
  float seg = smoothstep(halfLen, halfLen - .08, ax) * smoothstep(gap, gap + .04, ax);
  float lineCore = exp(-pow(dy / .0016, 2.)) * seg * uLine;
  float lineHalo = (.45 * exp(-pow(dy / .016, 2.)) + .15 * exp(-pow(dy / .07, 2.))) * seg * uLine;

  // 2) la ligne s'ouvre comme une paupière et révèle le site
  float hw = .62 * uAspect;
  float fx = max(1. - pow(sp.x / hw, 2.), 0.);
  float h = uSplit * (.5 / (1. - pow(.5 / .62, 2.))) * 1.08 * fx;
  float a = uSplit > 0. ? smoothstep(h - px, h + px, abs(dy)) : 1.;
  float on = smoothstep(0., .03, uSplit) * smoothstep(1., .85, uSplit);
  float e = abs(abs(dy) - h);
  float edge = (exp(-pow(e / .0022, 2.)) + .4 * exp(-pow(e / .02, 2.))) * on * step(0., fx - 1e-4);

  vec3 gcol = vec3(1., .96, .82) * lineCore + vec3(1., .6, .18) * lineHalo + vec3(1., .72, .3) * edge;
  float alpha = clamp(max(a, max(lineCore, edge)), 0., 1.);
  o = vec4(min(max(col, 0.) * a + gcol, vec3(alpha)), alpha);
}`
};
