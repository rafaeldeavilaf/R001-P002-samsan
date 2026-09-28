/* ============================================================
   SAMSAN — VITRINA DE LA CAVERNA (solo local, _local/)
   El nivel "The Lift" sobre assets/mundo/ y el bioma Caverna: el
   montacargas con regla de profundidad, la bandera de salida, el
   contorno de la plataforma donde debia llegar (en lugar de un
   "fantasma" humano), la gema que vuela, los interruptores de capas
   y los 12 tonos de piel. La escena `line` de verdad es de la etapa 2.
   ============================================================ */
(function () {
  'use strict';
  var M = window.SAMSAN_MUNDO, cv = document.getElementById('mundo');
  var NB = ' ';                              // espacio que no se parte: "6 m" nunca se separa
  /* Primero el arte procesado (si lo hay); si no, todo va por codigo. */
  window.SAMSAN_BIOMAS.caverna.cargar().then(function () {
    var L = M.crearLienzo(cv);
    var cav = window.SAMSAN_BIOMAS.caverna.crear(L, { pos: -15, piel: '#E8B088' });
    var K = cav.constantes, yOf = cav.yOf, X0 = K.POZO_X, RULER_X = 362, DMIN = K.DMIN, DMAX = K.DMAX;
    var exp = cav.explorador, ctx = L.ctx;
    var $ = function (id) { return document.getElementById(id); };
    var ui = { q: $('q'), now: $('now'), fb: $('fb'), up: $('up'), down: $('down'), main: $('main'), gems: $('gems'), hud: $('hud') };
    var fmt = function (n) { return n < 0 ? '−' + Math.abs(n) : String(n); };
    var m = function (n) { return fmt(n) + NB + 'm'; };
    var pr = M.rng(Date.now() & 0xffff), rint = function (a, b) { return a + Math.floor(pr() * (b - a + 1)); };
    var prob = null, state = 'play', wrong = null, gems = 0;

    function newProblem() {
      var st, c, up = pr() < 0.7;
      if (up) { st = rint(-26, -4); c = rint(3, Math.min(20, 9 - st)); }
      else { st = rint(-12, 6); c = rint(3, Math.min(18, st + 29)); }
      var ans = up ? st + c : st - c;
      prob = { st: st, c: c, up: up, ans: ans, eq: fmt(st) + ' ' + (up ? '+' : '−') + ' ' + c + ' = ' + fmt(ans) };
      exp.pos = st; state = 'play'; wrong = null;
      ui.q.textContent = 'Start at ' + m(st) + '. Go ' + (up ? 'up' : 'down') + ' ' + c + NB + 'm.';
      ui.fb.textContent = 'Move with ▲ ▼, then press Check.'; ui.fb.className = 'k-mensaje';
      setMain('Check', 'primario'); refresh();
    }
    function setMain(t, cls) { ui.main.textContent = t; ui.main.className = 'k-boton k-boton--' + cls; }
    function refresh() {
      ui.now.textContent = fmt(exp.pos);
      ui.up.disabled = state !== 'play' || exp.pos >= DMAX;
      ui.down.disabled = state !== 'play' || exp.pos <= DMIN;
    }
    function move(dir) {
      if (state !== 'play') return;
      var np = M.clamp(exp.pos + dir, DMIN, DMAX);
      if (np === exp.pos) return;
      exp.pos = np; refresh();
    }
    function mainAction() {
      if (state === 'play') {
        if (exp.pos === prob.ans) {
          state = 'right'; exp.celebrar();
          ui.fb.textContent = prob.eq + '. Well done!'; ui.fb.className = 'k-mensaje is-bien';
          setMain('Next', 'siguiente');
          var yb = yOf(exp.pos) - 50;
          cav.particulas.estallido(X0, yb);
          cav.particulas.gemaVuela(X0, yb, ui.hud, function () {
            gems++; ui.gems.textContent = gems;
            ui.hud.classList.remove('is-pop'); void ui.hud.offsetWidth; ui.hud.classList.add('is-pop');
          });
        } else {
          /* Tono neutro: describe y senala, no juzga (ni rojo ni "too low"). */
          state = 'wrong'; wrong = { at: exp.pos };
          ui.fb.textContent = 'You stopped at ' + m(exp.pos) + '. The dotted lift shows where ' + (prob.up ? '+' : '−') + prob.c + ' lands.';
          ui.fb.className = 'k-mensaje is-mal'; setMain('Try again', 'reintento');
        }
      } else if (state === 'wrong') {
        state = 'play'; wrong = null; exp.pos = prob.st;
        ui.fb.textContent = 'Back at the flag. Try again.'; ui.fb.className = 'k-mensaje'; setMain('Check', 'primario');
      } else newProblem();
      refresh();
    }

    /* Controles: tocar, mantener para repetir (con calma), teclado. */
    function holdable(btn, dir) {
      var t1 = 0, t2 = 0, usado = false;
      var stop = function () { clearTimeout(t1); clearInterval(t2); };
      btn.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        usado = true; move(dir); stop();
        t1 = setTimeout(function () { t2 = setInterval(function () { move(dir); }, 220); }, 450);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, stop); });
      btn.addEventListener('click', function (e) { if (e.detail === 0 || !usado) move(dir); usado = false; });
    }
    holdable(ui.up, 1); holdable(ui.down, -1);
    ui.main.addEventListener('click', mainAction);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { e.preventDefault(); mainAction(); }
    });

    /* Interruptores de capas y estado del gobernador. */
    var toggles = Array.prototype.slice.call(document.querySelectorAll('#toggles button'));
    function sync() {
      toggles.forEach(function (b) { b.setAttribute('aria-pressed', String(!!L.opts[b.dataset.opt])); });
      $('estado').textContent = L.degradado.length ? 'Rendimiento: se apagó ' + L.degradado.join(' y ') + ' para mantener 60 cuadros por segundo.' : '';
    }
    toggles.forEach(function (b) { b.addEventListener('click', function () { L.opts[b.dataset.opt] = !L.opts[b.dataset.opt]; sync(); }); });
    $('allOn').addEventListener('click', function () { Object.keys(L.opts).forEach(function (k) { if (k !== 'realce') L.opts[k] = true; }); sync(); });
    $('allOff').addEventListener('click', function () { Object.keys(L.opts).forEach(function (k) { if (k !== 'realce') L.opts[k] = false; }); sync(); });
    setInterval(sync, 1000);
    sync();

    /* 12 tonos de piel (assets/ui.js), por intercambio de paleta. */
    var tonos = (window.GAME_UI && window.GAME_UI.armoury && window.GAME_UI.armoury.skins) || [];
    var pieles = $('pieles');
    tonos.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'k-piel'; b.style.background = t.value; b.type = 'button';
      b.setAttribute('aria-label', t.name); b.setAttribute('aria-pressed', String(t.value === '#e8b088'));
      b.addEventListener('click', function () {
        exp.fijarPiel(t.value);
        Array.prototype.forEach.call(pieles.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
      });
      pieles.appendChild(b);
    });

    /* ---------- Instrumento y guias, nitidos sobre todo ----------
       Tamanos minimos en px CSS (x dpr): la regla se lee en un telefono real. */
    function px(n) { return n * L.dpr; }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function label(text, x, y, align, color, bg) {
      var fs = Math.max(px(14), 6.5 * L.s);
      ctx.font = '900 ' + fs + 'px Nunito, ui-rounded, "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = align; ctx.textBaseline = 'middle';
      var w = ctx.measureText(text).width, p = fs * 0.3, bxX = align === 'left' ? x - p : align === 'right' ? x - w - p : x - w / 2 - p;
      ctx.fillStyle = bg; roundRect(bxX, y - fs * 0.62, w + p * 2, fs * 1.24, fs * 0.3); ctx.fill();
      ctx.fillStyle = color; ctx.fillText(text, x, y + fs * 0.04);
      return { x: bxX, w: w + p * 2 };
    }
    /* Bandera de salida: mastil y paño de dos colores (forma, no solo color). */
    function bandera(x, y, u) {
      ctx.fillStyle = '#1E1426'; ctx.fillRect(x - u, y - 12 * u, 2 * u, 14 * u);
      ctx.fillStyle = '#1E1426';
      ctx.beginPath(); ctx.moveTo(x, y - 12.5 * u); ctx.lineTo(x - 11 * u, y - 9 * u); ctx.lineTo(x, y - 5.5 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7FE3F0';
      ctx.beginPath(); ctx.moveTo(x - u, y - 11.5 * u); ctx.lineTo(x - 9 * u, y - 9 * u); ctx.lineTo(x - u, y - 6.5 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#F7EFDD'; ctx.fillRect(x - 4 * u, y - 10 * u, 2 * u, 2 * u);
    }
    L.capa('alta', 50, function () {
      var s = L.s, cam = L.cam.y, X = RULER_X * s, lw = Math.max(px(1.5), s), u = Math.max(px(1.2), s * 0.9);
      ctx.save();
      var y0 = (yOf(DMAX) - cam) * s, y1 = (yOf(DMIN) - cam) * s;
      ctx.fillStyle = 'rgba(20,12,30,0.55)'; ctx.fillRect(X - lw, y0, lw * 3, y1 - y0);
      ctx.fillStyle = '#F7EFDD'; ctx.fillRect(X, y0, lw, y1 - y0);
      for (var d = DMIN; d <= DMAX; d++) {
        var y = (yOf(d) - cam) * s; if (y < -30 || y > cv.height + 30) continue;
        var major = d % 5 === 0, len = (d === 0 ? 12 : major ? 8 : 4) * u;
        ctx.fillStyle = 'rgba(20,12,30,0.8)'; ctx.fillRect(X, y - lw, len + lw, lw * 3);
        ctx.fillStyle = d === 0 ? '#A6E06A' : '#F7EFDD'; ctx.fillRect(X, y - lw / 2, len, lw);
        if (major) label(d === 0 ? '0' + NB + 'm' : m(d), X + len + 4 * u, y, 'left', d === 0 ? '#1F3D2A' : '#2A211A', d === 0 ? 'rgba(166,224,106,0.97)' : 'rgba(247,239,221,0.95)');
      }
      if (prob) bandera(X - 3 * u, (yOf(prob.st) - cam) * s, u * 1.7);
      // Posicion actual: flecha amarilla al nivel del piso de la plataforma.
      var yp = (yOf(exp.posAnim) - cam) * s;
      ctx.fillStyle = '#FFD34D'; ctx.strokeStyle = '#1E1426'; ctx.lineWidth = Math.max(px(1), lw * 0.7);
      ctx.beginPath(); ctx.moveTo(X - 2 * u, yp); ctx.lineTo(X - 12 * u, yp - 6 * u); ctx.lineTo(X - 12 * u, yp + 6 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    });
    /* Error: el contorno punteado de la plataforma vacia donde debia llegar,
       la flecha con el salto y un corchete con la diferencia. Nunca una
       silueta de persona. */
    L.capa('alta', 60, function () {
      if (state !== 'wrong' || !prob) return;
      var s = L.s, cam = L.cam.y, u = Math.max(px(1.2), s * 0.9), P = K.PLAT;
      var pulse = L.opts.smooth ? 0.7 + 0.3 * Math.sin(L.time * 4) : 1;
      var ya = (yOf(prob.st) - cam) * s, yb = (yOf(prob.ans) - cam) * s, x0 = (X0 - P.ancho / 2) * s, w = P.ancho * s;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#7FE3F0'; ctx.lineWidth = Math.max(px(2), 1.4 * s); ctx.setLineDash([4 * u, 3 * u]);
      ctx.strokeRect(x0, yb - P.baranda * s, w, (P.baranda + P.piso) * s);
      ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x0 + w, yb); ctx.stroke();
      ctx.globalAlpha = 1;
      var xa = (X0 - P.ancho / 2 - 14) * s;
      ctx.beginPath(); ctx.moveTo(xa, ya); ctx.quadraticCurveTo(xa - 22 * s, (ya + yb) / 2, xa, yb); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = '#7FE3F0';
      var dir = yb < ya ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(xa, yb); ctx.lineTo(xa - 5 * u, yb - dir * 7 * u); ctx.lineTo(xa + 4 * u, yb - dir * 6 * u); ctx.closePath(); ctx.fill();
      label((prob.up ? '+' : '−') + prob.c + NB + 'm', xa - 16 * s, (ya + yb) / 2, 'right', '#0E2A33', 'rgba(127,227,240,0.97)');
      // Corchete en la regla: cuanto falto o sobro (forma y numero, no solo color).
      var X = RULER_X * s, yw = (yOf(wrong.at) - cam) * s, lo = Math.min(yw, yb), hi = Math.max(yw, yb);
      ctx.strokeStyle = '#FF9E8A'; ctx.lineWidth = Math.max(px(2), s);
      ctx.beginPath(); ctx.moveTo(X - 16 * u, lo); ctx.lineTo(X - 20 * u, lo); ctx.lineTo(X - 20 * u, hi); ctx.lineTo(X - 16 * u, hi); ctx.stroke();
      ctx.restore();
    });

    newProblem();
    exp.posAnim = exp.pos; L.fijarCam(yOf(exp.pos) - 30 - L.H * 0.52);
    L.iniciar();
    window.__samsan = {
      L: L, caverna: cav, move: move, mainAction: mainAction,
      get state() { return state; }, get prob() { return prob; },
      setPos: function (p) { exp.pos = p; refresh(); },
      /* Regiones de pantalla para tools/arte/prueba_grises.py (en px CSS):
         una celda de pared y una de roca visibles y no tapadas por el panel,
         el explorador (con un anillo alrededor) y el panel. */
      regiones: function () {
        var r = cv.getBoundingClientRect(), k = r.width / L.W, cam = L.cam.y, mp = cav.mapa, T = mp.T;
        var p = document.querySelector('.k-panel--sobre').getBoundingClientRect();
        var vh = Math.min(r.bottom, window.innerHeight);
        function rect(x, y, w, h) { return { x: r.left + x * k, y: r.top + (y - cam) * k, w: w * k, h: h * k }; }
        function libre(q) {
          var dentro = q.x >= Math.max(0, r.left) && q.x + q.w <= Math.min(window.innerWidth, r.right) && q.y >= r.top && q.y + q.h <= vh;
          var tapa = q.x < p.right && q.x + q.w > p.left && q.y < p.bottom && q.y + q.h > p.top;
          return dentro && !tapa;
        }
        function celda(prueba) {
          var cx = X0, cy = yOf(exp.posAnim), mejor = null, dmin = Infinity;
          for (var f = 0; f < mp.filas; f++) for (var c = 0; c < mp.columnas; c++) {
            if (!prueba(f, c)) continue;
            var q = rect(c * T + 8, f * T + 8, 16, 16);
            if (!libre(q)) continue;
            var d = Math.hypot(c * T + 16 - cx, f * T + 16 - cy);
            if (d < dmin) { dmin = d; mejor = q; }
          }
          return mejor;
        }
        var e = exp.rect || { x: X0 - 20, y: yOf(exp.posAnim) - 60, w: 40, h: 60 };
        return {
          fondo: celda(mp.pared),
          suelo: celda(function (f, c) { return mp.roca(f, c) && f > 6; }),
          objeto: rect(e.x, e.y, e.w, e.h),
          anillo: rect(e.x - 6, e.y - 6, e.w + 12, e.h + 12),
          panel: { x: p.left, y: p.top, w: p.width, h: p.height }
        };
      }
    };
  });
})();
