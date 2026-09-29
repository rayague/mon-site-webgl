(() => {
  /* ================= Réglages ================= */
  const ONCE_PER_SESSION = false; // false : l'intro des yeux se rejoue à chaque rechargement
  const SPEED = 1;               // 1.2 = 20 % plus rapide
  const MAX_DPR = 2;             // netteté maximale (écrans Retina)

  const intro = document.getElementById('intro');
  const canvas = document.getElementById('gl');
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = ONCE_PER_SESSION && sessionStorage.getItem('introSeen') === '1'; } catch (e) {}

  function showSite() {
    intro.style.display = 'none';
    body.classList.remove('intro-on');
    requestAnimationFrame(() => body.classList.add('site-in'));
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
  }
  if (reduced || seen) { showSite(); return; }

  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) { showSite(); return; }

  /* ================= Programmes ================= */
  const src = id => window.SHADERS[id].trim();
  function compile(type, s) {
    const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  function program(fsId) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, src('vs')));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src(fsId)));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    p.u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); p.u[info.name] = gl.getUniformLocation(p, info.name); }
    return p;
  }
  let P;
  try { P = { scene: program('fsScene'), down: program('fsDown'), up: program('fsUp'), comp: program('fsComp') }; }
  catch (e) { console.error(e); showSite(); return; }
  const vao = gl.createVertexArray();
  const set = (p, name, ...v) => {
    const loc = p.u[name]; if (loc == null) return;
    if (v.length === 1) gl.uniform1f(loc, v[0]); else gl.uniform2f(loc, v[0], v[1]);
  };
  const draw = () => { gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3); };

  /* ================= Cibles de rendu HDR ================= */
  let HDR = !!gl.getExtension('EXT_color_buffer_float');
  function target(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, HDR ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, HDR ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (HDR && gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteTexture(tex); gl.deleteFramebuffer(fb); HDR = false; return target(w, h);
    }
    return { tex, fb, w, h };
  }
  const free = t => { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); } };

  const LEVELS = 6;
  let scene = null, down = [], up = [], quality = 1;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, MAX_DPR) * quality;
    const w = Math.max(2, Math.round(innerWidth * dpr)), h = Math.max(2, Math.round(innerHeight * dpr));
    if (scene && canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    free(scene); down.forEach(free); up.forEach(free);
    scene = target(w, h); down = []; up = [];
    let cw = w, ch = h;
    for (let i = 0; i < LEVELS; i++) { cw = Math.max(1, cw >> 1); ch = Math.max(1, ch >> 1); down.push(target(cw, ch)); }
    for (let i = 0; i < LEVELS - 1; i++) up.push(target(down[i].w, down[i].h));
  }
  addEventListener('resize', resize);
  resize();

  /* ================= Timeline (keyframes + easings) ================= */
  const E = {
    lin: t => t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inCubic: t => t * t * t,
    inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    inOutQuart: t => t < .5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2,
    outBack: t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  function track(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i], [t0, v0] = keys[i - 1];
      if (t <= t1) { const k = (E[e] || E.inOut)((t - t0) / (t1 - t0)); return v0 + (v1 - v0) * k; }
    }
    return keys[keys.length - 1][1];
  }
  const T = {
    light:  [[0, 0], [.3, 0], [1.6, 1, 'outCubic']],
    open:   [[0, 0], [.9, 0], [1.5, .3, 'outCubic'], [1.85, .27], [2.4, 1, 'outBack'], [5.25, 1], [6.45, 0, 'inOut']],
    frown:  [[0, .45], [2.0, .45], [2.6, .78, 'outCubic'], [3.95, .78], [4.25, .9, 'outCubic'], [5.0, .9], [5.9, 1.08]],
    pupil:  [[0, .52], [2.2, .52], [2.8, .3, 'outCubic'], [3.45, .3], [3.8, .14, 'inCubic'], [4.4, .27, 'outCubic'], [5.0, .27], [5.6, .2]],
    glowA:  [[0, 0], [2.3, 0], [2.9, 1], [3.7, 1], [4.3, 0]],
    glowB:  [[0, 0], [3.75, 0], [4.15, 1, 'outCubic'], [5.0, 1], [6.15, 2.1, 'inCubic']],
    morph:  [[0, 0], [3.55, 0], [4.25, 1]],
    spinV:  [[0, .15], [3.1, .15], [3.85, 13, 'inCubic'], [4.9, .35, 'outCubic'], [5.0, .35], [6.1, 2.4, 'inCubic']],
    // la souris est suivie, sauf pendant la transformation et la fermeture : pupilles recentrées
    follow: [[0, 0], [2.45, 0], [2.9, 1], [3.0, 1], [3.3, 0], [4.55, 0], [4.95, 1], [5.05, 1], [5.45, 0]],
    gx:     [[0, -.35], [2.6, -.35], [3.0, 0, 'outCubic']],
    close:  [[0, 0], [5.95, 0], [6.45, 1, 'inCubic']],
    fade:   [[0, 1], [6.55, 1], [6.9, 0]],
    line:   [[0, 0], [6.4, 0], [6.6, 1], [7.15, 1], [7.45, 0]],
    slit:   [[0, 0], [6.5, 0], [7.1, 1, 'inOutQuart']],
    split:  [[0, 0], [7.12, 0], [8.15, 1, 'inCubic']]
  };
  const END = 8.2, SKIP_TO = 5.05, FLASH_T = 3.9, MERGE_T = 7.1;

  /* ================= Interaction ================= */
  const mouse = { x: 0, y: 0 }, gaze = { x: -.35, y: 0 }, sacc = { x: 0, y: 0, next: 0 };
  addEventListener('pointermove', e => {
    mouse.x = Math.max(-1, Math.min(1, (e.clientX / innerWidth - .5) * 2.2));
    mouse.y = Math.max(-1, Math.min(1, -(e.clientY / innerHeight - .5) * 2.2));
  }, { passive: true });

  /* ================= Boucle ================= */
  let t = 0, spin = 0, last = 0, running = false, frames = 0, acc = 0;

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60; last = now;
    t += dt * SPEED;

    // qualité adaptative : si la machine peine, on baisse légèrement la résolution
    acc += dt; frames++;
    if (frames === 40) {
      if (acc / frames > 1 / 40 && quality > .6) { quality = Math.max(.6, quality * .85); resize(); }
      frames = 0; acc = 0;
    }

    const v = k => track(T[k], t);
    const follow = v('follow');
    spin = (spin + v('spinV') * dt * SPEED) % (Math.PI * 2);
    if (t > sacc.next) { sacc.x = (Math.random() - .5) * .08; sacc.y = (Math.random() - .5) * .06; sacc.next = t + .5 + Math.random() * 1.1; }
    const tx = v('gx') * (1 - follow) + (mouse.x * .9 + sacc.x) * follow;
    const ty = (mouse.y * .6 + sacc.y) * follow;
    const kk = 1 - Math.exp(-dt * 16);
    gaze.x += (tx - gaze.x) * kk; gaze.y += (ty - gaze.y) * kk;

    const aspect = canvas.width / canvas.height;
    const S = Math.min(1.12, aspect * .9 / .98);
    const eyesY = .003 * Math.sin(t * .9);
    const flash = Math.exp(-Math.pow((t - FLASH_T) / .05, 2)) * .35 + Math.exp(-Math.pow((t - FLASH_T) / .22, 2)) * .08
                + Math.exp(-Math.pow((t - MERGE_T) / .08, 2)) * .12;
    const glowB = v('glowB'), split = v('split');
    if (split > 0) intro.classList.add('revealing');

    // 1) scène HDR
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fb); gl.viewport(0, 0, scene.w, scene.h);
    gl.useProgram(P.scene);
    set(P.scene, 'uRes', scene.w, scene.h); set(P.scene, 'uTime', t);
    set(P.scene, 'uLight', v('light')); set(P.scene, 'uOpen', v('open')); set(P.scene, 'uPupil', v('pupil'));
    set(P.scene, 'uSpin', spin); set(P.scene, 'uMorph', v('morph'));
    set(P.scene, 'uGlowA', v('glowA')); set(P.scene, 'uGlowB', glowB);
    set(P.scene, 'uEyesY', eyesY); set(P.scene, 'uScale', S); set(P.scene, 'uEyeX', .3);
    set(P.scene, 'uGaze', gaze.x, gaze.y);
    set(P.scene, 'uFrown', v('frown')); set(P.scene, 'uClose', v('close')); set(P.scene, 'uFade', v('fade'));
    draw();

    // 2) bloom : chaîne de réduction
    gl.useProgram(P.down);
    gl.uniform1i(P.down.u.uTex, 0);
    set(P.down, 'uThresh', HDR ? 1.0 : .65); set(P.down, 'uKnee', .45);
    let srcT = scene;
    for (let i = 0; i < LEVELS; i++) {
      const d = down[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, d.fb); gl.viewport(0, 0, d.w, d.h);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcT.tex);
      set(P.down, 'uTexel', 1 / srcT.w, 1 / srcT.h); set(P.down, 'uPrefilter', i === 0 ? 1 : 0);
      draw(); srcT = d;
    }
    // 3) bloom : remontée
    gl.useProgram(P.up);
    gl.uniform1i(P.up.u.uTex, 0); gl.uniform1i(P.up.u.uBase, 1);
    let small = down[LEVELS - 1];
    for (let i = LEVELS - 2; i >= 0; i--) {
      const u = up[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, u.fb); gl.viewport(0, 0, u.w, u.h);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, small.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, down[i].tex);
      set(P.up, 'uTexel', 1 / small.w, 1 / small.h);
      draw(); small = u;
    }
    // 4) composite à l'écran
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(P.comp);
    gl.uniform1i(P.comp.u.uScene, 0); gl.uniform1i(P.comp.u.uBloom, 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, scene.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, small.tex);
    set(P.comp, 'uRes', canvas.width, canvas.height); set(P.comp, 'uAspect', aspect); set(P.comp, 'uTime', t);
    set(P.comp, 'uFlash', flash);
    set(P.comp, 'uCA', .0012 + flash * .012 + Math.min(v('spinV') / 13, 1) * .003);
    set(P.comp, 'uBloomK', (HDR ? .5 : .75) + glowB * .2 + flash * .8);
    set(P.comp, 'uShockT', t > FLASH_T ? t - FLASH_T : -1);
    set(P.comp, 'uExposure', 1.0); set(P.comp, 'uS', S);
    set(P.comp, 'uLine', v('line')); set(P.comp, 'uSlit', v('slit')); set(P.comp, 'uSplit', split);
    set(P.comp, 'uEyeL', -.3 * S, eyesY); set(P.comp, 'uEyeR', .3 * S, eyesY);
    draw();

    if (t >= END) { stop(); return; }
    requestAnimationFrame(frame);
  }

  function start() {
    t = 0; spin = 0; last = 0; gaze.x = -.35; gaze.y = 0;
    intro.style.display = ''; intro.classList.remove('revealing');
    body.classList.add('intro-on'); body.classList.remove('site-in');
    running = true; requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    showSite();
    /* l'intro est finie : on rend la carte graphique au site */
    try { const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } catch (e) {}
  }
  document.getElementById('skip').addEventListener('click', () => { if (t < SKIP_TO) t = SKIP_TO; });
  // bouton facultatif : n'importe quel élément avec id="replay" relance l'intro
  const replay = document.getElementById('replay');
  if (replay) replay.addEventListener('click', start);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); });

  start();
})();
