// titulo: Catch basket — make 10
/* ============================================================
   BOCETO GRIS — Atrapa la canasta (Year 2, completar el 10)
   Ficha: docs/temas/maths-y2-sumar-restar.md. Un solo control: mover
   la canasta. Caen frutas con puntos y numero; la canasta trae un
   marco de 10 con algunas casillas llenas y hay que atrapar la fruta
   que lo completa exacto. Sin derrota: la que sobra asoma fuera del
   marco y rebota; la que no cae vuelve a caer desde arriba.
   Ronda 1: parejas (una fruta completa). Ronda 2: dos frutas (la
   canasta guarda lo atrapado mientras no pase de 10).
   Niveles escritos a mano: es un boceto, no datos del juego.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var RONDAS = [
    { nombre: 'Round 1 · Make 10', guarda: false, pasos: [
      { tiene: 9, caen: [1] }, { tiene: 7, caen: [3, 5] }, { tiene: 6, caen: [2, 4, 7] },
      { tiene: 8, caen: [5, 2, 1] }, { tiene: 5, caen: [3, 5, 6] }, { tiene: 3, caen: [4, 7, 2] }] },
    { nombre: 'Round 2 · Two fruits', guarda: true, pasos: [
      { tiene: 5, caen: [2, 3, 6] }, { tiene: 4, caen: [1, 5, 7] }, { tiene: 2, caen: [4, 4, 9] }, { tiene: 3, caen: [2, 5, 8] }] }
  ];
  var CANASTA = 26, FRUTA = 15, ALTO_CANASTA = 84;          // unidades: 0..100 del ancho y alto del campo

  var css = document.createElement('style');
  css.textContent =
    '.cn-cabeza{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.cn-cabeza h2{margin:0;font-size:1.3rem}' +
    '.cn-campo{position:relative;height:min(62vh,460px);margin-top:10px;border:3px solid #1E1426;border-radius:12px;background:#E9E6EF;overflow:hidden;touch-action:none;user-select:none}' +
    '.cn-fruta{position:absolute;width:clamp(62px,13%,96px);aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid #1E1426;border-radius:14px;background:#FFFDF6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}' +
    '.cn-fruta b{font-size:clamp(1.2rem,4vw,1.9rem);line-height:1}' +
    '.cn-puntos{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;width:80%}' +
    '.cn-puntos i{aspect-ratio:1;border-radius:50%;background:#C23B32;border:1px solid #1E1426}' +
    '.cn-fruta.is-rebota{transition:transform .5s ease-in,opacity .5s;opacity:0}' +
    '.cn-canasta{position:absolute;bottom:2%;width:clamp(140px,24%,250px);transform:translateX(-50%);border:3px solid #1E1426;border-radius:0 0 18px 18px;background:#8A5A34;padding:6px}' +
    '.cn-marco,.cn-sobra{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}' +
    '.cn-marco i,.cn-sobra i{aspect-ratio:1;border:2px solid #1E1426;border-radius:4px;background:#FFFDF6}' +
    '.cn-marco i.is-lleno{background:#2F9BB8}' +
    '.cn-marco i.is-nuevo{background:#FFD34D}' +
    '.cn-sobra{position:absolute;left:6px;right:6px;bottom:100%;margin-bottom:4px}' +
    '.cn-sobra i{background:repeating-linear-gradient(45deg,#FF9E8A 0 4px,#FFFDF6 4px 8px);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.8rem}' +
    '.cn-cuenta{text-align:center;font-weight:900;color:#FFFDF6;margin-top:4px;font-size:clamp(.9rem,3vw,1.2rem)}' +
    '.cn-botones{display:flex;gap:12px;margin-top:10px}' +
    '.cn-botones .k-boton{flex:1;min-height:64px;font-size:1.6rem}' +
    '.cn-msg{text-align:center;min-height:1.6em;font-weight:800;margin:6px 0 0}' +
    '@media (prefers-reduced-motion:reduce){.cn-fruta.is-rebota{transition:none}}';
  document.head.appendChild(css);

  var S = null, gemas = 0;

  function puntos(n) { var s = ''; for (var i = 0; i < n; i++) s += '<i></i>'; return '<span class="cn-puntos">' + s + '</span>'; }

  function pintarCanasta(previa) {
    var c = S.canasta, marco = '', sobra = '';
    for (var i = 0; i < 10; i++) {
      var k = i < S.tiene ? 'is-lleno' : (previa && i < S.tiene + previa ? 'is-nuevo' : '');
      marco += '<i class="' + k + '"></i>';
    }
    var extra = previa ? Math.max(0, S.tiene + previa - 10) : 0;
    for (var j = 0; j < extra; j++) sobra += '<i aria-hidden="true">✗</i>';
    c.innerHTML = (extra ? '<div class="cn-sobra">' + sobra + '</div>' : '') + '<div class="cn-marco">' + marco + '</div>' +
      '<div class="cn-cuenta">' + (extra ? (S.tiene + previa) + ' — too many!' : S.tiene + ' / 10') + '</div>';
    c.style.left = S.x + '%';
  }

  function soltar(v, k, total) {
    var el = document.createElement('div');
    el.className = 'cn-fruta';
    el.innerHTML = puntos(v) + '<b>' + v + '</b>';
    el.setAttribute('aria-label', v + ' fruit');
    S.campo.appendChild(el);
    var carril = total === 1 ? 50 : 14 + (72 / (total - 1)) * k;
    return { v: v, x: carril, y: -10 - k * 22, el: el, fuera: false };
  }

  function empezarPaso() {
    var p = S.ronda.pasos[S.paso];
    S.tiene = p.tiene;
    S.frutas.forEach(function (f) { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
    S.frutas = p.caen.map(function (v, k) { return soltar(v, k, p.caen.length); });
    S.vel = 16 + S.paso * 3 + S.r * 4;                       // unidades por segundo; sube con cada paso
    S.listo = false;
    pintarCanasta(0);
    P.$('#cn-msg').textContent = 'Fill the ten!';
  }

  function atrapar(f) {
    f.fuera = true;
    var suma = S.tiene + f.v;
    if (suma === 10) {
      S.tiene = 10; S.listo = true;
      f.el.parentNode.removeChild(f.el);
      pintarCanasta(0);
      P.sonido('gema');
      P.$('#cn-msg').textContent = S.tiene - f.v + ' + ' + f.v + ' = 10';
      setTimeout(siguientePaso, 900);
    } else if (suma > 10 || !S.ronda.guarda) {
      pintarCanasta(f.v);                                      // se ve lo que sobra o lo que falta
      P.sonido('mal');
      P.$('#cn-msg').textContent = suma > 10 ? 'Too many — it does not fit.' : 'Not full yet — try another.';
      f.el.style.transform = 'translate(-50%,-50%) translateY(-120px) rotate(40deg)';
      f.el.classList.add('is-rebota');
      setTimeout(function () { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); relanzar(f); if (!S.listo) pintarCanasta(0); }, 800);
    } else {
      S.tiene = suma;                                          // ronda 2: se queda y falta otra
      f.el.parentNode.removeChild(f.el);
      pintarCanasta(0);
      P.sonido('paso');
      P.$('#cn-msg').textContent = suma + ' — ' + (10 - suma) + ' more to 10.';
      var p = S.ronda.pasos[S.paso];
      if (!S.frutas.some(function (g) { return !g.fuera && S.tiene + g.v <= 10; })) {
        // Si ya no cae ninguna que sirva, vuelve a caer la tanda completa.
        S.frutas.forEach(function (g) { if (!g.fuera && g.el.parentNode) g.el.parentNode.removeChild(g.el); g.fuera = true; });
        S.frutas = S.frutas.concat(p.caen.map(function (v, k) { return soltar(v, k, p.caen.length); }));
      }
    }
  }
  function relanzar(f) {                                       // la fruta vuelve a caer desde arriba (sin derrota)
    var n = soltar(f.v, 0, 1); n.x = f.x; n.y = -12;
    S.frutas.push(n);
  }

  function siguientePaso() {
    S.paso++;
    if (S.paso < S.ronda.pasos.length) { empezarPaso(); return; }
    gemas++; P.$('#gems') && (P.$('#gems').textContent = gemas);
    S.jugando = false;
    P.gemaCentro(S.campo, 'Round done!', function () {
      if (S.r + 1 < RONDAS.length) jugar(S.r + 1);
      else P.final({ rotulo: 'Catch basket', titulo: 'Both rounds done', texto: 'You made 10 every time.', gemas: gemas, otra: function () { gemas = 0; jugar(0); } });
    });
  }

  function cuadro(t) {
    if (!S || !S.jugando) return;
    var dt = Math.min(0.05, (t - (S.t || t)) / 1000); S.t = t;
    medir();
    var mover = (S.teclas.der ? 1 : 0) - (S.teclas.izq ? 1 : 0);
    if (mover) S.x = limitar(S.x + mover * 70 * dt);
    S.canasta.style.left = S.x + '%';
    if (!S.listo) S.frutas.forEach(function (f) {
      if (f.fuera) return;
      f.y += S.vel * dt;
      // Atrapada cuando el borde de abajo de la fruta toca la boca de la canasta.
      if (f.y + S.m.fy >= S.m.boca && f.y < S.m.boca + 6 && Math.abs(f.x - S.x) < S.m.mitad + S.m.fx * 0.5) { atrapar(f); return; }
      if (f.y > 110) f.y = -12;                               // no la atrapaste: vuelve a caer
      f.el.style.left = f.x + '%'; f.el.style.top = f.y + '%';
    });
    requestAnimationFrame(cuadro);
  }

  /* Medidas reales en unidades del campo (0..100); en jsdom no hay tamanos y valen las de respaldo. */
  function medir() {
    var cw = S.campo.clientWidth, ch = S.campo.clientHeight, f = S.frutas[0] && S.frutas[0].el;
    S.m = cw && ch ? { mitad: S.canasta.offsetWidth / cw * 50, boca: S.canasta.offsetTop / ch * 100,
                       fx: (f ? f.offsetWidth : 62) / cw * 50, fy: (f ? f.offsetHeight : 62) / ch * 50 }
                   : { mitad: CANASTA / 2, boca: ALTO_CANASTA, fx: FRUTA / 2, fy: FRUTA / 2 };
  }
  function limitar(x) { var m = S.m ? S.m.mitad : CANASTA / 2; return Math.max(m, Math.min(100 - m, x)); }

  function jugar(r) {
    P.$('#proto').innerHTML =
      '<section class="k-panel">' +
        '<div class="cn-cabeza"><h2>' + RONDAS[r].nombre + '</h2><div class="k-gemas">' + P.gemaSVG(22) + '<span id="gems">' + gemas + '</span></div></div>' +
        '<div class="cn-campo" id="cn-campo"><div class="cn-canasta" id="cn-canasta"></div></div>' +
        '<p class="cn-msg" id="cn-msg" aria-live="polite"></p>' +
        '<div class="cn-botones"><button type="button" class="k-boton" data-d="izq" aria-label="Move left">&#9664;</button>' +
        '<button type="button" class="k-boton" data-d="der" aria-label="Move right">&#9654;</button></div>' +
      '</section>';
    S = { r: r, ronda: RONDAS[r], paso: 0, x: 50, frutas: [], teclas: {}, jugando: true,
          campo: P.$('#cn-campo'), canasta: P.$('#cn-canasta') };
    Array.prototype.forEach.call(document.querySelectorAll('.cn-botones [data-d]'), function (b) {
      var d = b.getAttribute('data-d');
      b.addEventListener('pointerdown', function () { S.teclas[d] = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) { b.addEventListener(e, function () { S.teclas[d] = false; }); });
    });
    function seguir(e) {                                       // arrastrar: la canasta sigue al dedo o al raton
      var r0 = S.campo.getBoundingClientRect();
      if (!r0.width) return;
      S.x = limitar((e.clientX - r0.left) / r0.width * 100);
    }
    S.campo.addEventListener('pointerdown', function (e) { S.arrastra = true; seguir(e); });
    S.campo.addEventListener('pointermove', function (e) { if (S.arrastra || e.pointerType === 'mouse') seguir(e); });
    window.addEventListener('pointerup', function () { if (S) S.arrastra = false; });
    empezarPaso();
    requestAnimationFrame(cuadro);
  }

  document.addEventListener('keydown', function (e) {
    if (!S) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') S.teclas.izq = true;
    if (e.key === 'ArrowRight' || e.key === 'd') S.teclas.der = true;
  });
  document.addEventListener('keyup', function (e) {
    if (!S) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') S.teclas.izq = false;
    if (e.key === 'ArrowRight' || e.key === 'd') S.teclas.der = false;
  });

  window.__canasta = { estado: function () { return S; }, atrapar: function (f) { atrapar(f); } };
  P.inicio({ rotulo: 'Minigame · Year 2', titulo: 'Catch basket', texto: 'Move the basket. Catch the fruit that fills the ten.', alJugar: function () { jugar(0); } });
})();
