// titulo: Hop along the number line
// usa: repaso
/* ============================================================
   SALTO EN LA RECTA (Year 2, suma y resta con la recta numerica)
   Cinco rondas, un verbo por ronda, sin opcion multiple y sin derrota:
     1 Ubicar   Asignar un numero a su lugar en la recta 0-100
     2 Saltar   Contar hacia adelante y hacia atras (saltos de 1)
     3 Decenas  Saltos grandes y chicos con botas limitadas
     4 Puerta   Partir un salto para pisar el diez (pasar por el diez)
     5 Botas    Saltos limitados (+10 y -2): dos formas distintas y la bandera imposible
   Cada ronda cierra con paginas de cuaderno (teclado numerico).
   Pistas en tres peldanos en cada reto: accion minima, figura, ejemplo resuelto.
   Los numeros son propios: el material del colegio es temario (regla 8).
   Niveles escritos a mano, validados por tools/verify_repaso_y2.js con un
   solucionador (BFS): cada reto tiene solucion y el presupuesto es el minimo.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var $ = P.$, esc = P.esc, MENOS = '−';

  /* ====================== DATOS (a mano) ====================== */
  var RONDAS = [
    { id: 'ubicar', nombre: 'Gem hunt',
      texto: 'Walk to the number on the line. Then dig for the star!',
      items: [{ t: 'ubicar', n: 18 }, { t: 'ubicar', n: 33 }, { t: 'ubicar', n: 57 }, { t: 'ubicar', n: 76 }, { t: 'ubicar', n: 94 }] },

    { id: 'saltar', nombre: 'Hop to the flag',
      texto: 'Add: hop right. Take away: hop left. Count the hops!',
      ejemplo: 'Example: start on 5. Hop right 3 times: 6, 7, 8. You are on 8.',
      items: [
        { t: 'saltar', ini: 9, meta: 13, saltos: [-1, 1], modo: 'unos' },
        { t: 'saltar', ini: 16, meta: 12, saltos: [-1, 1], modo: 'unos' },
        { t: 'saltar', ini: 21, meta: 26, saltos: [-1, 1], modo: 'unos' },
        { t: 'seguir', ini: 31, pasos: [6, -3], saltos: [-1, 1] },
        { t: 'seguir', ini: 44, pasos: [-5, 2], saltos: [-1, 1] }],
      cuaderno: [{ expr: '27 + 5', resp: 32, ej: 'Example: 18 + 4. Hop 2 to 20. Hop 2 more: 22.' }, { expr: '43 ' + MENOS + ' 5', resp: 38, ej: 'Example: 52 ' + MENOS + ' 4. Hop back 2 to 50. Hop back 2 more: 48.' }] },

    { id: 'decenas', nombre: 'Big hops, small hops',
      texto: 'Big hop: 10. Small hop: 1. You have only a few hops!',
      ejemplo: 'Example: 31 to 43. One big hop (+10): 41. Two small hops (+1): 42, 43.',
      items: [
        { t: 'saltar', ini: 23, meta: 35, saltos: [-10, -1, 1, 10], modo: 'decenas', presupuesto: 3 },
        { t: 'saltar', ini: 47, meta: 35, saltos: [-10, -1, 1, 10], modo: 'decenas', presupuesto: 3 },
        { t: 'saltar', ini: 36, meta: 58, saltos: [-10, -1, 1, 10], modo: 'decenas', presupuesto: 4 },
        { t: 'saltar', ini: 82, meta: 61, saltos: [-10, -1, 1, 10], modo: 'decenas', presupuesto: 3, vacia: true },
        { t: 'saltar', ini: 68, meta: 47, saltos: [-10, -1, 1, 10], modo: 'decenas', presupuesto: 3, vacia: true }],
      cuaderno: [{ expr: '35 + 20', resp: 55, ej: 'Example: 41 + 20. Big hop: 51. Big hop: 61.' }, { expr: '72 ' + MENOS + ' 31', resp: 41, ej: 'Example: 65 ' + MENOS + ' 21. Back 10: 55. Back 10: 45. Back 1: 44.' }] },

    { id: 'puerta', nombre: 'The ten gate',
      texto: 'There is a gate on the ten. Hop to the ten first. Then hop again. Two hops.',
      ejemplo: 'Example: 9 + 4. Hop 1 to 10. Then hop 3 to 13.',
      items: [
        { t: 'puente', ini: 6, meta: 13, dir: 1 },
        { t: 'puente', ini: 9, meta: 15, dir: 1 },
        { t: 'puente', ini: 14, meta: 8, dir: -1 },
        { t: 'puente', ini: 17, meta: 9, dir: -1 },
        { t: 'puente', ini: 7, meta: 15, dir: 1 }],
      cuaderno: [{ expr: '9 + 7', resp: 16, ej: 'Example: 8 + 5. Hop 2 to 10. Hop 3 more: 13.' }, { expr: '16 ' + MENOS + ' 8', resp: 8, ej: 'Example: 15 ' + MENOS + ' 7. Hop back 5 to 10. Hop back 2 more: 8.' }] },

    { id: 'botas', nombre: 'Mole hops',
      texto: 'The mole hops +10 or ' + MENOS + '2. Find two ways to the flag!',
      ejemplo: 'Example: 12 to 20. Hop +10: 22. Hop ' + MENOS + '2: 20.',
      items: [
        { t: 'botas', ini: 15, meta: 31, lo: 3, hi: 47, dos: true },
        { t: 'botas', ini: 9, meta: 27, lo: 1, hi: 41, dos: true },
        { t: 'botas', ini: 18, meta: 32, lo: 6, hi: 52, dos: true },
        { t: 'botas', ini: 24, meta: 37, lo: 10, hi: 60, imposible: true }],
      cuaderno: [{ expr: '33 + 6 ' + MENOS + ' 4', resp: 35, ej: 'Example: 21 + 5 ' + MENOS + ' 3. Hop right 5: 26. Hop left 3: 23.' }, { expr: '58 + 10 ' + MENOS + ' 5', resp: 63, ej: 'Example: 47 + 10 ' + MENOS + ' 4. Big hop: 57. Back 4: 53.' }] }
  ];
  var MAX_BOTAS = 12;

  /* Cada ronda termina con sus paginas de cuaderno. */
  RONDAS.forEach(function (r) {
    (r.cuaderno || []).forEach(function (c) { r.items.push({ t: 'cuaderno', expr: c.expr, resp: c.resp, ej: c.ej }); });
  });

  /* ====================== SOLUCIONADOR ====================== */
  function enRango(v, lo, hi) { return v >= lo && v <= hi; }
  /* Decena estrictamente entre a y b (la que bloquea la puerta), o null. */
  function decenaEntre(a, b) {
    var lo = Math.min(a, b), hi = Math.max(a, b);
    for (var t = Math.ceil((lo + 1) / 10) * 10; t < hi; t += 10) if (t > lo && t < hi) return t;
    return null;
  }
  /* Ventana de la recta de un reto. */
  function ventana(it) {
    var lo, hi, a, b;
    if (it.t === 'botas') return { lo: it.lo, hi: it.hi };
    if (it.t === 'seguir') {
      var p = it.ini, xs = [p];
      it.pasos.forEach(function (s) { p += s; xs.push(p); });
      a = Math.min.apply(null, xs); b = Math.max.apply(null, xs);
      lo = a - 3; hi = b + 3;
    } else {
      a = Math.min(it.ini, it.meta); b = Math.max(it.ini, it.meta);
      var pad = it.modo === 'decenas' ? 12 : it.t === 'puente' ? 2 : 3;
      lo = a - pad; hi = b + pad;
    }
    var min = it.modo === 'decenas' ? 24 : 12;
    while (hi - lo < min) { lo--; hi++; }
    return { lo: Math.max(0, lo), hi: Math.min(100, hi) };
  }
  /* Regla de un salto d desde pos. Devuelve { ok, nuevo, motivo }. */
  function regla(it, vent, pos, d) {
    var nuevo = pos + d;
    if (it.t === 'puente' && decenaEntre(pos, nuevo) !== null) return { ok: false, motivo: 'puerta', puerta: decenaEntre(pos, nuevo) };
    if (!enRango(nuevo, vent.lo, vent.hi)) return { ok: false, motivo: 'borde' };
    return { ok: true, nuevo: nuevo };
  }
  /* Minimo de saltos para saltar/puente (BFS sobre la posicion). -1 si no se llega. */
  function minimo(it) {
    var v = ventana(it), d = it.saltos || [], vistos = {}, cola = [[it.ini, 0]];
    if (it.t === 'puente') { d = []; for (var k = 1; k <= 9; k++) d.push(it.dir * k); }
    vistos[it.ini] = true;
    while (cola.length) {
      var c = cola.shift();
      if (c[0] === it.meta) return c[1];
      for (var i = 0; i < d.length; i++) {
        var r = regla(it, v, c[0], d[i]);
        if (r.ok && !vistos[r.nuevo]) { vistos[r.nuevo] = true; cola.push([r.nuevo, c[1] + 1]); }
      }
    }
    return -1;
  }
  /* Todas las formas (a saltos +10, b saltos -2) que llegan a la meta en <= max saltos, dentro de la ventana. */
  function formas(it, max) {
    var v = ventana(it), vistos = {}, cola = [[it.ini, 0, 0]], res = {};
    vistos[it.ini + ',0,0'] = true;
    while (cola.length) {
      var c = cola.shift();
      if (c[0] === it.meta && (c[1] + c[2]) > 0) res[c[1] + ',' + c[2]] = true;
      if (c[1] + c[2] >= max) continue;
      [[10, 1, 0], [-2, 0, 1]].forEach(function (m) {
        var n = c[0] + m[0], k = n + ',' + (c[1] + m[1]) + ',' + (c[2] + m[2]);
        if (enRango(n, v.lo, v.hi) && !vistos[k]) { vistos[k] = true; cola.push([n, c[1] + m[1], c[2] + m[2]]); }
      });
    }
    return Object.keys(res);
  }
  /* Descompone una cuenta del cuaderno en saltos para dibujarla: decenas primero,
     y puentea el diez cuando el salto de unidades lo cruza. */
  function cadena(expr, resp) {
    var tok = expr.split(' '), pos = parseInt(tok[0], 10), arcos = [];
    for (var i = 1; i < tok.length; i += 2) {
      var sg = tok[i] === '+' ? 1 : -1, m = parseInt(tok[i + 1], 10);
      while (m >= 10) { arcos.push([pos, pos + sg * 10]); pos += sg * 10; m -= 10; }
      if (m > 0) {
        var t = decenaEntre(pos, pos + sg * m);
        if (t !== null) { arcos.push([pos, t]); m -= Math.abs(t - pos); pos = t; }
        if (m > 0) { arcos.push([pos, pos + sg * m]); pos += sg * m; }
      }
    }
    return { arcos: arcos, fin: pos };
  }
  window.SAMSAN_REPASO = { rondas: RONDAS, ventana: ventana, regla: regla, minimo: minimo, formas: formas, cadena: cadena, maxBotas: MAX_BOTAS };

  /* ====================== RECTA (dibujo) ====================== */
  var css = document.createElement('style');
  css.textContent = [
    '.rp-recta{margin:6px 0 0}',
    '.rp-v{position:relative;height:200px;margin:0 5%;user-select:none;touch-action:none}',
    '.rp-linea{position:absolute;left:-3%;right:-3%;top:138px;height:10px;background:linear-gradient(#1E1426 0 2px,#E8ECF2 2px 4px,#9AA1AE 4px 6px,#5B5B6E 6px 8px,#1E1426 8px)}',
    '.rp-linea::before,.rp-linea::after{content:"";position:absolute;top:-4px;width:8px;height:18px;background:#6B3D22;border:2px solid #1E1426;box-sizing:border-box}',
    '.rp-linea::before{left:0}.rp-linea::after{right:0}',
    '.rp-tick{position:absolute;top:146px;width:4px;margin-left:-2px;background:#1E1426;height:8px}',
    '.rp-tick.m5{height:14px;background:#6B3D22;box-shadow:0 0 0 1px #1E1426}',
    '.rp-tick.m10{height:20px;width:6px;margin-left:-3px;background:#A0643A;box-shadow:0 0 0 2px #1E1426}',
    '.rp-num{position:absolute;top:168px;transform:translateX(-50%);font-weight:800;font-size:.85rem;color:#2A211A}',
    '.rp-num.m10{font-size:1rem;font-weight:900}',
    '.rp-num.is-clave{background:#FFD34D;border:2px solid #1E1426;border-radius:6px;padding:0 5px;font-size:1rem;font-weight:900;top:166px}',
    '.rp-ban{position:absolute;bottom:60px;width:0;z-index:2;transition:left .12s}',
    '.rp-ban__m{position:absolute;left:-2px;bottom:0;width:4px;height:50px;background:#6B3D22;box-shadow:0 0 0 1px #1E1426}',
    '.rp-ban__n{position:absolute;left:0;bottom:46px;transform:translateX(-50%);min-width:48px;padding:2px 8px;border:3px solid #1E1426;border-radius:8px;background:#FFD34D;font-weight:900;font-size:1.15rem;text-align:center;white-space:nowrap}',
    '.rp-ban.is-mov .rp-ban__n{background:#7FE3F0;font-size:1.35rem;cursor:grab}',
    '.rp-ban.is-fantasma .rp-ban__n{background:#FFFDF6;border-style:dashed}',
    '.rp-ban.is-fantasma .rp-ban__m{background:repeating-linear-gradient(#1E1426 0 4px,transparent 4px 8px)}',
    '.rp-arco{position:absolute;bottom:60px;border:3px solid #1E1426;border-bottom:0;border-radius:999px 999px 0 0;z-index:1}',
    '.rp-arco span{position:absolute;left:50%;top:-1.5em;transform:translateX(-50%);font-weight:900;font-size:.95rem;background:#F7EFDD;padding:0 4px;white-space:nowrap;border-radius:6px}',
    '.rp-arco.is-fantasma{border-style:dashed;border-color:#2F9BB8}',
    '.rp-arco.is-fantasma span{color:#1D4E6B}',
    '.rp-llave{position:absolute;top:128px;height:8px;border:3px solid #2F9BB8;border-top:0;border-radius:0 0 8px 8px;background:rgba(127,227,240,.35)}',
    '.rp-llave span{position:absolute;left:50%;top:-1.9em;transform:translateX(-50%);font-weight:900;font-size:.9rem;background:#D8F6FA;border:2px solid #2F9BB8;border-radius:6px;padding:0 6px;white-space:nowrap}',
    '.rp-puerta{position:absolute;bottom:60px;width:0;z-index:2}',
    '.rp-puerta i{position:absolute;left:-14px;bottom:0;width:28px;height:42px;border:3px solid #1E1426;border-radius:6px 6px 0 0;background:repeating-linear-gradient(90deg,#8A5A34 0 5px,#B78450 5px 10px)}',
    '.rp-puerta.is-abierta i{opacity:.35;border-style:dashed}',
    '.rp-ex{position:absolute;bottom:60px;width:0;z-index:3;transition:left .26s ease-out}',
    '.rp-ex__in{position:absolute;left:-30px;bottom:-4px;width:60px;height:60px;display:flex;align-items:flex-end;justify-content:center}',
    '.rp-ex__in img{width:auto;height:60px;image-rendering:pixelated;display:block}',
    '.rp-ex__fig{width:26px;height:50px;border:3px solid #1E1426;border-radius:12px 12px 4px 4px;background:#2F9BB8}',
    '.rp-ex__in.is-salto{animation:rp-salto .26s ease-out}',
    '.rp-ex__in.is-choque{animation:rp-choque .35s ease-in-out}',
    '.rp-bub{position:absolute;left:0;bottom:62px;transform:translateX(-50%);min-width:42px;padding:0 8px;border:3px solid #1E1426;border-radius:999px;background:#FFFDF6;font-weight:900;font-size:1.1rem;text-align:center;white-space:nowrap}',
    '.rp-bub.is-oculto{background:#EADCC0;color:#5C4A3B}',
    '.rp-recta{position:relative}',
    '.rp-cueva{position:absolute;left:0;right:0;top:0;height:154px;border:3px solid #1E1426;border-bottom:0;border-radius:10px 10px 0 0;background-color:#1A1C36;background-size:144px 144px;image-rendering:pixelated;overflow:hidden}',
    '.rp-recta.is-cueva .rp-v{z-index:1}',
    '.rp-recta.is-cueva .rp-arco{border-color:#FFD34D}',
    '.rp-recta.is-cueva .rp-arco.is-fantasma{border-color:#7FE3F0}',
    '.rp-recta.is-cueva .rp-ban__m{background:#D19A5E}',
    '.rp-objs{position:absolute;inset:0;pointer-events:none;z-index:4}',
    '.rp-obj{position:absolute;bottom:60px;transform:translateX(-50%);animation:rp-sale .5s ease-out}',
    '.rp-obj.is-estrella{bottom:64px;margin-left:22px}',
    '.rp-obj.is-roca{margin-left:22px}',
    '.rp-obj.is-roca i{display:block;width:22px;height:14px;border:3px solid #1E1426;border-radius:8px 10px 4px 4px;background:linear-gradient(#9AA1AE 0 40%,#5B5B6E 40%)}',
    '@keyframes rp-sale{0%{transform:translate(-50%,12px) scale(.3);opacity:0}100%{transform:translate(-50%,0) scale(1);opacity:1}}',
    '.rp-ex__in.is-cava img{animation:es-cava .18s steps(2) 4}',
    '.rp-ex__in.is-feliz img{animation:es-salta .4s ease-out 3}',
    '@media (prefers-reduced-motion:reduce){.rp-obj,.rp-ex__in.is-cava img,.rp-ex__in.is-feliz img{animation:none}}',
    '.rp-recta.is-vacia .rp-linea{background:repeating-linear-gradient(90deg,#1E1426 0 10px,transparent 10px 14px);height:6px;top:140px}',
    '.rp-recta.is-vacia .rp-linea::before,.rp-recta.is-vacia .rp-linea::after{display:none}',
    '@keyframes rp-salto{0%{transform:translateY(0)}50%{transform:translateY(-34px)}100%{transform:translateY(0)}}',
    '@keyframes rp-choque{0%,100%{transform:translateX(0)}25%{transform:translateX(-12px)}75%{transform:translateX(10px)}}',
    '.rp-ctl{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px}',
    '.rp-ctl .k-boton{min-width:72px;font-size:1.3rem}',
    '.rp-ctl .k-boton.is-pista{outline:4px solid #2F9BB8;outline-offset:2px;background:#D8F6FA}',
    '.rp-botas{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:6px;min-height:22px;font-weight:800;align-items:center}',
    '.rp-botas i{width:16px;height:16px;border:3px solid #1E1426;border-radius:4px;background:#F2B73A;display:block}',
    '.rp-botas i.is-gastada{background:#FFFDF6;border-style:dashed}',
    '.rp-formas{margin:6px 0 0;padding:0;list-style:none;font-weight:800}',
    '.rp-formas li{padding:4px 10px;border:3px solid #1E1426;border-radius:10px;background:#D8F0C8;margin-top:6px}',
    '.rp-noway{background:#FFE0D8}',
    '.rp-ej{padding:6px 12px;border:3px solid #2F9BB8;border-radius:10px;background:#D8F6FA;font-weight:800;margin-top:8px}',
    '@media (prefers-reduced-motion:reduce){.rp-ex,.rp-ban{transition:none}.rp-ex__in.is-salto,.rp-ex__in.is-choque{animation:none}}'
  ].join('');
  document.head.appendChild(css);

  var IMG = { ex: null };
  function cargarExplorador() {
    if (IMG.ex !== null) return;
    IMG.ex = '';
    P.explorador(P.piel).then(function (u) {
      IMG.ex = u || '';
      Array.prototype.forEach.call(document.querySelectorAll('.rp-ex[data-quien="ex"] .rp-ex__in'), function (el) { rellenar(el, 'ex'); });
    });
  }
  function fuenteTopo() { var I = window.SAMSAN_IMG || {}; return (I.caverna || {})['companero-topo'] || ''; }
  function rellenar(el, quien) {
    var src = quien === 'topo' ? fuenteTopo() : IMG.ex;
    el.innerHTML = src ? '<img alt="" src="' + src + '">' : '<div class="rp-ex__fig"></div>';
  }

  /* Recta: ticks y numeros estaticos; capa dinamica con bandera, arcos, llaves y puertas;
     un personaje persistente que se mueve con transicion CSS. */
  function Recta(host, o) {
    var lo = o.lo, hi = o.hi, span = hi - lo, vacia = !!o.vacia;
    var el = document.createElement('div');
    var cueva = !vacia && o.cueva !== false;
    el.className = 'rp-recta' + (vacia ? ' is-vacia' : '') + (cueva ? ' is-cueva' : '');
    var tex = cueva && P.texturaRoca ? P.texturaRoca() : '';
    el.innerHTML = (cueva ? '<div class="rp-cueva"' + (tex ? ' style="background-image:url(' + tex + ')"' : '') + '><i class="es-luz" style="left:4%"></i><i class="es-luz" style="left:94%;animation-delay:.6s"></i><i class="es-cristal" style="left:2%"></i><i class="es-cristal" style="left:98%"></i></div>' : '') +
      '<div class="rp-v"><div class="rp-linea"></div><div class="rp-est"></div><div class="rp-din"></div><div class="rp-objs"></div>' +
      '<div class="rp-ex" data-quien="' + (o.quien || 'ex') + '"><div class="rp-bub"></div><div class="rp-ex__in"></div></div></div>';
    host.appendChild(el);
    var v = el.querySelector('.rp-v'), est = el.querySelector('.rp-est'), din = el.querySelector('.rp-din');
    var ex = el.querySelector('.rp-ex'), exIn = el.querySelector('.rp-ex__in'), bub = el.querySelector('.rp-bub');
    rellenar(exIn, o.quien || 'ex');
    function pct(x) { return ((x - lo) / span * 100).toFixed(3) + '%'; }
    function a(c, x, y) { return '<div class="' + c + '" style="left:' + pct(x) + '"' + (y || '') + '></div>'; }

    /* Ticks y numeros */
    (function () {
      var h = '', paso = span <= 16 ? 1 : span <= 36 ? 5 : 10, x;
      if (!vacia) {
        var finos = span <= 60 ? 1 : 5;
        for (x = Math.ceil(lo); x <= Math.floor(hi); x++) {
          if (x % 10 === 0) h += a('rp-tick m10', x); else if (x % 5 === 0) h += a('rp-tick m5', x); else if (x % finos === 0 && finos === 1) h += a('rp-tick', x);
        }
        for (x = Math.ceil(lo); x <= Math.floor(hi); x++) {
          if (x % paso === 0) h += '<span class="rp-num' + (x % 10 === 0 ? ' m10' : '') + '" data-n="' + x + '" style="left:' + pct(x) + '">' + x + '</span>';
        }
      }
      est.innerHTML = h;
    })();

    function pintar(d) {
      d = d || {};
      var h = '', i;
      (d.puertas || []).forEach(function (t) { h += '<div class="rp-puerta' + (d.abiertas && d.abiertas.indexOf(t) >= 0 ? ' is-abierta' : '') + '" data-puerta="' + t + '" style="left:' + pct(t) + '"><i></i></div>'; });
      (d.arcos || []).forEach(function (c) { h += arco(c, false); });
      (d.fantasmas || []).forEach(function (c) { h += arco(c, true); });
      (d.llaves || []).forEach(function (l) {
        var x0 = Math.min(l.a, l.b), x1 = Math.max(l.a, l.b);
        h += '<div class="rp-llave" style="left:' + pct(x0) + ';width:' + ((x1 - x0) / span * 100).toFixed(3) + '%"><span>' + esc(l.txt || '') + '</span></div>';
      });
      (d.banderas || []).forEach(function (b) {
        h += '<div class="rp-ban' + (b.mov ? ' is-mov' : '') + (b.fantasma ? ' is-fantasma' : '') + '" data-val="' + b.v + '" style="left:' + pct(b.v) + '"><div class="rp-ban__n">' + esc(b.txt != null ? b.txt : b.v) + '</div><div class="rp-ban__m"></div></div>';
      });
      din.innerHTML = h;
      /* numeros clave en recta vacia o resaltados */
      if (vacia || d.claves) {
        var claves = (d.claves || []).slice();
        Array.prototype.forEach.call(est.querySelectorAll('.rp-num.is-clave'), function (n) { n.parentNode.removeChild(n); });
        claves.forEach(function (x) {
          var s = document.createElement('span'); s.className = 'rp-num is-clave'; s.style.left = pct(x); s.textContent = x; s.setAttribute('data-n', x); est.appendChild(s);
        });
      }
    }
    function arco(c, fant) {
      var x0 = Math.min(c[0], c[1]), x1 = Math.max(c[0], c[1]), dist = x1 - x0;
      var alto = 22 + Math.min(dist, 12) * 2.5;
      var txt = c[2] != null ? c[2] : ((c[1] > c[0] ? '+' : MENOS) + dist);
      return '<div class="rp-arco' + (fant ? ' is-fantasma' : '') + '" style="left:' + pct(x0) + ';width:' + (dist / span * 100).toFixed(3) + '%;height:' + alto.toFixed(0) + 'px"><span>' + esc(txt) + '</span></div>';
    }
    function mover(x, oculto) {
      ex.style.left = pct(x);
      ex.setAttribute('data-pos', String(x));
      bub.textContent = oculto ? '?' : String(x);
      bub.className = 'rp-bub' + (oculto ? ' is-oculto' : '');
    }
    function salto() { exIn.classList.remove('is-salto'); void exIn.offsetWidth; exIn.classList.add('is-salto'); }
    function choque() { exIn.classList.remove('is-choque'); void exIn.offsetWidth; exIn.classList.add('is-choque'); }
    /* Convierte una coordenada de pantalla al valor de la recta. */
    function valorEn(clientX) {
      var r = v.getBoundingClientRect();
      if (!r.width) return null;
      return lo + (clientX - r.left) / r.width * span;
    }
    var objs = el.querySelector('.rp-objs');
    /* El mundo reacciona: cavar, una gema o una roca en el suelo, chispas, celebrar. */
    function cavar(cb) {
      exIn.classList.remove('is-cava'); void exIn.offsetWidth; exIn.classList.add('is-cava');
      P.sonido('cavar');
      setTimeout(function () { exIn.classList.remove('is-cava'); if (cb) cb(); }, 700);
    }
    function objeto(x, tipo) {
      var d = document.createElement('div');
      d.className = 'rp-obj is-' + tipo; d.setAttribute('data-obj', tipo); d.setAttribute('data-x', String(x));
      d.style.left = pct(x);
      d.innerHTML = tipo === 'estrella' ? P.estrellaSVG(30) : '<i></i>';
      objs.appendChild(d);
      if (tipo === 'roca') setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2600);
    }
    function premio(x) {
      if (P.premio) P.premio(v, pct(x), 64);
      if (P.chispas) P.chispas(v, Math.round((v.clientWidth || 600) * (x - lo) / span), 70);
    }
    function celebrar() { exIn.classList.remove('is-feliz'); void exIn.offsetWidth; exIn.classList.add('is-feliz'); }
    return { el: el, v: v, pintar: pintar, mover: mover, salto: salto, choque: choque, valorEn: valorEn, ex: ex,
             cavar: cavar, objeto: objeto, premio: premio, celebrar: celebrar,
             ocultarPersonaje: function (si) { ex.style.display = si ? 'none' : ''; },
             destruir: function () { if (el.parentNode) el.parentNode.removeChild(el); } };
  }

  /* ====================== EQUACION QUE SE ESCRIBE SOLA ====================== */
  function ecuacionHtml(ini, saltos, fin, estado) {
    var h = '<span class="is-base">' + ini + '</span>';
    saltos.forEach(function (d) { h += '<em>' + (d > 0 ? '+' : MENOS) + '</em><span>' + Math.abs(d) + '</span>'; });
    h += '<em>=</em><span class="' + (estado === 'bien' ? 'is-bien' : 'is-hueco') + '">' + (fin == null ? '?' : fin) + '</span>';
    return h;
  }

  /* Junta los saltos de un mismo tamano y sentido, y quita los que se anulan: 9 - 1 + 1 + 1 -> 9 + 1 + 1. */
  function limpio(h) {
    var neto = {}; h.forEach(function (d) { var k = Math.abs(d); neto[k] = (neto[k] || 0) + (d > 0 ? 1 : -1); });
    var out = [];
    Object.keys(neto).map(Number).sort(function (a, b) { return b - a; }).forEach(function (k) {
      var v = neto[k]; for (var i = 0; i < Math.abs(v); i++) out.push(v > 0 ? k : -k);
    });
    return out;
  }

  /* ====================== RETOS ====================== */
  function claveTexto(d) { return (d > 0 ? '+' : MENOS) + Math.abs(d); }
  function dirLabel(d) { return d > 0 ? 'right' : 'left'; }

  /* --- 1. Ubicar ----------------------------------------------- */
  function montarUbicar(it, ctx) {
    var n = it.n, val = 50, listo = false, nivelPista = 0, leido = null;
    ctx.host.innerHTML = '<p class="rp-consigna">A star is on <b>' + n + '</b>. Take the explorer there and dig!</p>';
    var recta = Recta(ctx.host, { lo: 0, hi: 100, cueva: true });
    cargarExplorador();
    var botones = document.createElement('div');
    botones.className = 'rp-ctl';
    botones.innerHTML =
      '<button type="button" class="k-boton" data-m="-10" aria-label="Walk left ten">' + MENOS + '10</button>' +
      '<button type="button" class="k-boton" data-m="-1" aria-label="Walk left one">' + MENOS + '1</button>' +
      '<button type="button" class="k-boton" data-m="1" aria-label="Walk right one">+1</button>' +
      '<button type="button" class="k-boton" data-m="10" aria-label="Walk right ten">+10</button>' +
      '<button type="button" class="k-boton k-boton--primario" id="rp-ok" aria-label="Dig here">DIG &#9935;</button>';
    ctx.host.appendChild(botones);

    function pintar(extra) {
      var d = { banderas: [] };
      d.claves = leido != null && leido === val ? [val] : [];
      if (nivelPista >= 2) {
        var a = Math.floor(n / 10) * 10;
        d.llaves = [{ a: a, b: a + 10, txt: a + ' to ' + (a + 10) }];
      }
      if (extra) for (var k in extra) d[k] = extra[k];
      recta.pintar(d);
      recta.mover(val, true);
      recta.el.setAttribute('data-val', String(val));
      recta.el.setAttribute('data-n', String(n));
    }
    function nudge(m) { if (listo) return; val = Math.max(0, Math.min(100, val + m)); ctx.accion(); pintar(); }
    Array.prototype.forEach.call(botones.querySelectorAll('[data-m]'), function (b) { b.addEventListener('click', function () { nudge(+b.getAttribute('data-m')); }); });
    function confirmar() {
      if (listo) return;
      if (val === n) {
        listo = true; val = n; pintar({ llaves: [] });
        recta.mover(n, false);
        recta.cavar(function () { recta.objeto(n, 'estrella'); recta.premio(n); recta.celebrar(); });
        P.vozEn('Yes! ' + n);
        ctx.listo('Yes! You found the star on ' + n + '!');
      } else {
        var aqui = val;
        leido = val; pintar();
        recta.cavar(function () { recta.objeto(aqui, 'roca'); });
        ctx.fallo('Not here! You are on ' + val + '. Go ' + (val > n ? 'left' : 'right') + '.');
      }
    }
    $('#rp-ok').addEventListener('click', confirmar);
    /* Arrastrar con raton o dedo sobre la recta. */
    var arrastrando = false;
    function sigue(e) {
      if (!arrastrando || listo) return;
      var x = recta.valorEn(e.clientX);
      if (x == null) return;
      val = Math.max(0, Math.min(100, Math.round(x)));
      ctx.accion(); pintar();
    }
    function suelta() { arrastrando = false; }
    recta.v.addEventListener('pointerdown', function (e) { arrastrando = true; sigue(e); });
    recta.v.addEventListener('pointermove', sigue);
    window.addEventListener('pointerup', suelta);
    function tecla(e) {
      if (e.key === 'ArrowLeft') nudge(e.shiftKey ? -10 : -1);
      else if (e.key === 'ArrowRight') nudge(e.shiftKey ? 10 : 1);
      else if (e.key === 'Enter' && document.activeElement && document.activeElement.id !== 'rp-sig') { e.preventDefault(); confirmar(); }
    }
    document.addEventListener('keydown', tecla);

    var dec = Math.floor(n / 10) * 10, ej = dec === 60 ? 34 : 64;
    ctx.peldanos([
      { texto: 'Look at the tens: 10, 20, 30... Find ' + (Math.floor(n / 10) * 10) + ' first.', visual: function () { nivelPista = 1; pintar(); } },
      { texto: n + ' is between ' + dec + ' and ' + (dec + 10) + '. Look at the blue part.', visual: function () { nivelPista = 2; pintar(); } },
      { texto: 'Example: ' + ej + ' is after ' + (Math.floor(ej / 10) * 10) + ' and before ' + (Math.floor(ej / 10) * 10 + 10) + '.',
        visual: function () { nivelPista = 3; pintar({ banderas: [{ v: ej, txt: ej, fantasma: true }] }); } }
    ]);
    ctx.mensaje('Walk with the buttons, or tap the line.', '');
    pintar();
    return { destruir: function () { document.removeEventListener('keydown', tecla); window.removeEventListener('pointerup', suelta); recta.destruir(); } };
  }

  /* --- 2 a 5. Saltar, seguir, puente y botas -------------------- */
  function montarSaltar(it, ctx, ronda) {
    var vent = ventana(it), pos = it.ini, hist = [], bloqueado = false, nivelPista = 0, quien = it.t === 'botas' ? 'topo' : 'ex';
    var puente = it.t === 'puente', seguir = it.t === 'seguir', botas = it.t === 'botas';
    var presupuesto = botas ? MAX_BOTAS : puente ? 2 : it.presupuesto || null;
    var saltos = it.saltos;
    if (puente) { saltos = []; for (var k = 1; k <= 9; k++) saltos.push(it.dir * k); }
    if (botas) saltos = [-2, 10];
    var etapa = 0, hechoEtapa = 0;        // solo para `seguir`
    var formasHechas = [], totalSaltos = 0, resuelto = false, esperaNumero = false;
    var teclado = null;

    var consigna = '';
    if (seguir) consigna = 'Start on ' + it.ini + '. ' + it.pasos.map(function (s) { return (s > 0 ? 'right ' : 'left ') + Math.abs(s); }).map(function (t, i) { return (i ? 'Then hop ' : 'Hop ') + t; }).join('. ') + '. Where are you?';
    else if (puente) consigna = 'Go from ' + it.ini + ' to ' + it.meta + '. Two hops. Stop on the ten first!';
    else if (botas) consigna = it.imposible ? 'Can the mole go from ' + it.ini + ' to ' + it.meta + '? Try!' : 'Go from ' + it.ini + ' to ' + it.meta + '. Find two ways.';
    else consigna = 'Go from ' + it.ini + ' to the flag on ' + it.meta + '.' + (presupuesto ? ' You have ' + presupuesto + ' hops.' : '');
    ctx.host.innerHTML = '<p class="rp-consigna">' + esc(consigna) + '</p><div class="rp-eq" id="rp-eq" aria-live="polite"></div>';
    var recta = Recta(ctx.host, { lo: vent.lo, hi: vent.hi, vacia: !!it.vacia, quien: quien });
    var botasEl = document.createElement('div'); botasEl.className = 'rp-botas'; ctx.host.appendChild(botasEl);
    var panelFormas = document.createElement('ul'); panelFormas.className = 'rp-formas'; ctx.host.appendChild(panelFormas);
    var ctl = document.createElement('div'); ctl.className = 'rp-ctl'; ctx.host.appendChild(ctl);
    var zonaTec = document.createElement('div'); ctx.host.appendChild(zonaTec);
    if (quien === 'ex') cargarExplorador();

    /* Botones de salto: en orden de izquierda a derecha */
    var ordenados = puente ? saltos.slice() : saltos.slice().sort(function (a, b) { return a - b; });
    ordenados.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'k-boton'; b.setAttribute('data-d', String(d));
      b.setAttribute('aria-label', 'Hop ' + Math.abs(d) + ' ' + dirLabel(d));
      b.innerHTML = d > 0 ? '+' + d + ' &#9654;' : '&#9664; ' + MENOS + Math.abs(d);
      b.addEventListener('click', function () { saltar(d); });
      ctl.appendChild(b);
    });
    var deshacer = document.createElement('button');
    deshacer.type = 'button'; deshacer.className = 'k-boton'; deshacer.id = 'rp-undo'; deshacer.setAttribute('aria-label', 'Undo last hop');
    deshacer.innerHTML = '&#8630; UNDO';
    deshacer.addEventListener('click', function () { atras(); });
    ctx.extra.appendChild(deshacer);
    var noway = null;
    if (it.imposible) {
      noway = document.createElement('button');
      noway.type = 'button'; noway.className = 'k-boton rp-noway'; noway.id = 'rp-noway'; noway.hidden = true; noway.textContent = 'NO WAY!';
      noway.setAttribute('aria-label', 'The mole cannot get there');
      noway.addEventListener('click', function () { rendirse(); });
      ctx.extra.appendChild(noway);
    }

    /* ---- pintar ---- */
    function ecuacion() {
      var el = $('#rp-eq');
      if (!el) return;
      if (botas) {
        var g = hist.filter(function (d) { return d === 10; }).length, p = hist.filter(function (d) { return d === -2; }).length;
        el.innerHTML = '<span class="is-base">' + it.ini + '</span><em>+10: ' + g + '</em><em>' + MENOS + '2: ' + p + '</em><em>&#8594;</em><span class="' + (pos === it.meta ? 'is-bien' : 'is-hueco') + '">' + pos + '</span>';
        return;
      }
      if (seguir) { el.innerHTML = ecuacionHtml(it.ini, hist, null, ''); return; }
      if (resuelto && it.t === 'saltar') { el.innerHTML = ecuacionHtml(it.ini, limpio(hist), pos, 'bien'); return; }
      el.innerHTML = ecuacionHtml(it.ini, hist, hist.length ? pos : null, resuelto ? 'bien' : '');
    }
    function pintar(extra) {
      var d = { arcos: [], banderas: [], puertas: [], claves: [] };
      var cur = it.ini;
      hist.forEach(function (s) { d.arcos.push([cur, cur + s, (s > 0 ? '+' : MENOS) + Math.abs(s)]); cur += s; });
      if (!seguir) d.banderas.push({ v: it.meta, txt: it.meta });
      if (it.vacia) { d.claves.push(it.ini); if (!seguir) d.claves.push(it.meta); if (hist.length) d.claves.push(pos); }
      if (puente) {
        var t = decenaEntre(it.ini, it.meta);
        if (t !== null) { d.puertas.push(t); if (pos === t || (it.dir > 0 ? pos > t : pos < t)) d.abiertas = [t]; }
      }
      /* pistas visuales */
      if (nivelPista >= 2 && it.t === 'saltar') {
        var plan = planNatural(it);
        var c2 = pos, fant = [];
        plan.slice(0, 1).forEach(function (s) { fant.push([c2, c2 + s]); c2 += s; });
        if (pos === it.ini) d.fantasmas = fant;
      }
      if (nivelPista >= 2 && puente && pos === it.ini) {
        var tt = decenaEntre(it.ini, it.meta);
        d.fantasmas = [[it.ini, tt]];
        d.llaves = [{ a: Math.min(it.ini, tt), b: Math.max(it.ini, tt), txt: Math.abs(tt - it.ini) + ' hops' }];
      }
      if (extra) for (var kx in extra) d[kx] = extra[kx];
      recta.pintar(d);
      recta.mover(pos, seguir && !resuelto && nivelPista < 2);
      ecuacion();
      pintarBotas();
      /* botones: marca de pista y bloqueo por etapa */
      Array.prototype.forEach.call(ctl.querySelectorAll('[data-d]'), function (b) {
        var dd = +b.getAttribute('data-d');
        b.classList.toggle('is-pista', nivelPista >= 3 && !resuelto && dd === pistaBoton());
        b.disabled = bloqueado || esperaNumero || (seguir && etapa < it.pasos.length && (dd > 0) !== (it.pasos[etapa] > 0));
      });
      deshacer.disabled = bloqueado || !hist.length || esperaNumero;
      document.getElementById('rp-cuerpo').setAttribute('data-pos', String(pos));
    }
    function pintarBotas() {
      if (!presupuesto) { botasEl.innerHTML = seguir && etapa < it.pasos.length ? '<b>Hop ' + hechoEtapa + ' of ' + Math.abs(it.pasos[etapa]) + '</b>' : ''; return; }
      var h = '<b>Hops left</b> ';
      for (var i = 0; i < presupuesto; i++) h += '<i class="' + (i < hist.length ? 'is-gastada' : '') + '"></i>';
      botasEl.innerHTML = h;
    }
    function pistaBoton() {
      if (puente) {
        var t10 = decenaEntre(it.ini, it.meta);
        var antes = it.dir > 0 ? pos < t10 : pos > t10;
        return antes ? t10 - pos : it.meta - pos;
      }
      if (seguir) return it.pasos[Math.min(etapa, it.pasos.length - 1)] > 0 ? 1 : -1;
      if (botas) return it.meta > pos ? 10 : -2;
      var dif = it.meta - pos;
      if (it.modo === 'decenas') return Math.abs(dif) >= 10 ? (dif > 0 ? 10 : -10) : (dif > 0 ? 1 : -1);
      return dif > 0 ? 1 : -1;
    }
    /* Plan natural: decenas primero, luego unidades. */
    function planNatural(x) {
      var dif = x.meta - x.ini, s = dif > 0 ? 1 : -1, r = Math.abs(dif), pl = [], u = x.modo === 'decenas' ? 10 : 1;
      if (x.modo === 'decenas') { while (r >= 10) { pl.push(s * 10); r -= 10; } }
      while (r > 0) { pl.push(s); r--; }
      return pl;
    }

    /* ---- reglas del juego ---- */
    function reiniciar(motivo) {
      bloqueado = true;
      ctx.fallo(motivo);
      pintar();
      setTimeout(function () {
        pos = it.ini; hist = []; etapa = 0; hechoEtapa = 0; bloqueado = false; nivelPista = Math.min(nivelPista, 1);
        recta.mover(pos, seguir); pintar();
      }, 1100);
    }
    function atras() {
      if (bloqueado || !hist.length || resuelto) return;
      var s = hist.pop(); pos -= s; ctx.accion();
      if (seguir) { if (hechoEtapa > 0) hechoEtapa--; else if (etapa > 0) { etapa--; hechoEtapa = Math.abs(it.pasos[etapa]) - 1; } }
      ctx.mensaje('', ''); pintar();
    }
    function saltar(d) {
      if (bloqueado || resuelto || esperaNumero) return;
      var r = regla(it, vent, pos, d);
      if (!r.ok) {
        recta.choque();
        if (r.motivo === 'puerta') ctx.fallo('Stop! The gate is on ' + r.puerta + '. Hop to ' + r.puerta + ' first.');
        else ctx.fallo('That is off the line. Try another hop.');
        pintar();
        return;
      }
      hist.push(d); pos = r.nuevo; totalSaltos++;
      if (noway && totalSaltos >= 8) noway.hidden = false;
      recta.salto(); ctx.accion(); P.sonido('paso'); P.vozEn(String(pos));
      if (seguir) {
        hechoEtapa++;
        if (hechoEtapa >= Math.abs(it.pasos[etapa])) { etapa++; hechoEtapa = 0; }
        if (etapa >= it.pasos.length) { esperaNumero = true; pintar(); pedirNumero(); return; }
        ctx.mensaje('', ''); pintar(); return;
      }
      if (botas) { llegadaBotas(); return; }
      if (pos === it.meta) { resuelto = true; pintar(); recta.premio(it.meta); recta.celebrar(); ctx.listo(textoBien()); return; }
      if (presupuesto && hist.length >= presupuesto) { reiniciar('No more hops. Try again!'); return; }
      if (Math.abs(it.meta - pos) > Math.abs(it.meta - (pos - d))) ctx.mensaje('Oops! The flag is to the ' + (it.meta > pos ? 'right' : 'left') + '.', 'mal');
      else ctx.mensaje('', '');
      pintar();
    }
    function textoBien() {
      if (puente) return 'Yes! ' + it.ini + ' ' + hist.map(function (s) { return (s > 0 ? '+ ' : MENOS + ' ') + Math.abs(s); }).join(' ') + ' = ' + it.meta + '.';
      return 'Yes! You are on ' + it.meta + '!';
    }
    function llegadaBotas() {
      if (pos === it.meta) {
        var a = hist.filter(function (d) { return d === 10; }).length, b = hist.filter(function (d) { return d === -2; }).length, key = a + ',' + b;
        if (formasHechas.indexOf(key) >= 0) { reiniciar('Same way again. Find a new way!'); return; }
        formasHechas.push(key);
        var li = document.createElement('li');
        li.textContent = 'Way ' + formasHechas.length + ': ' + a + ' big hop' + (a === 1 ? '' : 's') + ' (+10) and ' + b + ' small hop' + (b === 1 ? '' : 's') + ' (' + MENOS + '2).';
        panelFormas.appendChild(li);
        if (formasHechas.length >= 2) { resuelto = true; pintar(); recta.premio(it.meta); recta.celebrar(); ctx.listo('Yes! Two ways! Great!'); return; }
        bloqueado = true; recta.celebrar(); ctx.mensaje('Way 1! Now find a new way.', 'bien'); pintar();
        setTimeout(function () { pos = it.ini; hist = []; bloqueado = false; recta.mover(pos); pintar(); }, 1400);
        return;
      }
      if (hist.length >= MAX_BOTAS) {
        reiniciar('No more hops. Try a new way!');
        return;
      }
      ctx.mensaje('', ''); pintar();
    }
    function rendirse() {
      if (resuelto) return;
      resuelto = true; bloqueado = true; noway.disabled = true;
      pintar(); recta.celebrar();
      ctx.listo('Yes! The mole can\'t go there. Good thinking!');
    }
    /* `seguir`: tras las instrucciones, el nino escribe donde cayo. */
    function pedirNumero() {
      ctx.mensaje('Where are you? Type the number.', '');
      zonaTec.innerHTML = '';
      setTimeout(function () { try { zonaTec.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* nada */ } }, 60);
      teclado = P.teclado(zonaTec, {
        max: 3, alTecla: function () { ctx.accion(); },
        alEnviar: function (n) {
          if (n === pos) {
            resuelto = true; esperaNumero = false;
            teclado.destruir(); teclado = null;
            var el = $('#rp-eq'); if (el) el.innerHTML = ecuacionHtml(it.ini, hist, pos, 'bien');
            pintar(); recta.premio(pos); recta.celebrar();
            ctx.listo('Yes! ' + it.ini + ' ' + hist.map(function (s) { return (s > 0 ? '+ ' : MENOS + ' ') + Math.abs(s); }).join(' ') + ' = ' + pos + '.');
          } else {
            teclado.limpiar();
            ctx.fallo('Not yet. Look at the line. Count again.');
          }
        }
      });
    }

    /* ---- teclado fisico ---- */
    function tecla(e) {
      if (esperaNumero) return;
      if (e.key === 'Backspace') { e.preventDefault(); atras(); return; }
      var d = null;
      if (puente) {
        if (/^[1-9]$/.test(e.key)) d = it.dir * parseInt(e.key, 10);
      } else if (botas) {
        if (e.key === 'ArrowRight') d = 10; else if (e.key === 'ArrowLeft') d = -2;
      } else if (it.modo === 'decenas') {
        if (e.key === 'ArrowRight') d = e.shiftKey ? 10 : 1; else if (e.key === 'ArrowLeft') d = e.shiftKey ? -10 : -1;
      } else {
        if (e.key === 'ArrowRight') d = 1; else if (e.key === 'ArrowLeft') d = -1;
      }
      if (d !== null && saltos.indexOf(d) >= 0) { e.preventDefault(); saltar(d); }
    }
    document.addEventListener('keydown', tecla);

    /* ---- pistas ---- */
    function ejemploTexto() { return (ronda && ronda.ejemplo) || ''; }
    var textos = pistasDe(it, ejemploTexto);
    ctx.peldanos(textos.map(function (t, i) {
      return { texto: t, visual: function () { nivelPista = i + 1; pintar(); } };
    }));
    ctx.mensaje(seguir ? 'Tap the buttons to hop. Count each hop.' : 'Tap the buttons to hop.', '');
    pintar();
    return { destruir: function () { document.removeEventListener('keydown', tecla); if (teclado) teclado.destruir(); recta.destruir(); } };
  }

  /* Textos de las tres pistas de cada tipo de reto. */
  function pistasDe(it, ejemplo) {
    var ej = ejemplo() + ' The blue button shows the next hop.';
    if (it.t === 'seguir') return [
      'Right: bigger numbers. Left: smaller numbers.',
      'Hop one time. Say the number. Look at the hop counter.',
      ej];
    if (it.t === 'puente') {
      var t = decenaEntre(it.ini, it.meta), d = Math.abs(t - it.ini);
      return [
        'Find the gate. Hop to ' + t + ' first.',
        'From ' + it.ini + ' to ' + t + ' is ' + d + '.',
        ej];
    }
    if (it.t === 'botas') {
      if (it.imposible) return [
        'Try some hops. The mole has only +10 and ' + MENOS + '2.',
        'Look where the mole lands. Odd or even?',
        'Example: start on 14. +10 and ' + MENOS + '2 give 24, 22, 20... always even.'];
      return [
        'Big hop: +10. Small hop: ' + MENOS + '2. Try big hops first.',
        'Go past the flag with +10. Then come back with ' + MENOS + '2.',
        ej];
    }
    if (it.modo === 'decenas') {
      var dif = Math.abs(it.meta - it.ini), g = Math.floor(dif / 10), p = dif % 10;
      return [
        'Big hops (10) first. Then small hops (1).',
        'You need ' + g + ' big hop' + (g === 1 ? '' : 's') + ' and ' + p + ' small hop' + (p === 1 ? '' : 's') + '.',
        ej];
    }
    return [
      'Add: hop right. Take away: hop left.',
      'You need ' + Math.abs(it.meta - it.ini) + ' hops. Follow the dotted arrows.',
      ej];
  }

  /* Peldano 2 del cuaderno segun la cuenta: decenas primero, o ir al diez. */
  function segundaPista(expr) {
    var tok = expr.split(' '), b = parseInt(tok[2], 10);
    if (tok.length > 3) return 'Do one hop at a time. Look at the first hop.';
    if (b >= 10) return 'Big hops (10) first. Then small hops. Look at the first hop.';
    return 'Hop to the next ten first. Look at the first hop.';
  }

  /* --- Cuaderno: la cuenta escrita, con teclado ------------------- */
  function montarCuaderno(it, ctx, ronda) {
    var ch = cadena(it.expr, it.resp), nivelPista = 0, listo = false;
    ctx.host.innerHTML = '<p class="rp-consigna">Do the sum.</p><div class="rp-eq"><span class="is-base">' + esc(it.expr) + '</span><em>=</em><span class="is-hueco" id="rp-r">?</span></div><div id="rp-tz"></div>';
    var cont = document.createElement('div'); ctx.host.appendChild(cont);
    var recta = null;
    function ayuda() {
      if (recta) { recta.destruir(); recta = null; }
      if (nivelPista < 2) return;
      var xs = [parseInt(it.expr.split(' ')[0], 10)];
      ch.arcos.forEach(function (c) { xs.push(c[0], c[1]); });
      var lo = Math.max(0, Math.min.apply(null, xs) - 2), hi = Math.min(100, Math.max.apply(null, xs) + 2);
      while (hi - lo < 12) { lo = Math.max(0, lo - 1); hi = Math.min(100, hi + 1); }
      recta = Recta(cont, { lo: lo, hi: hi, vacia: true, quien: 'ex' });
      recta.ocultarPersonaje(true);
      var mostrar = nivelPista >= 3 ? ch.arcos : ch.arcos.slice(0, 1);
      recta.pintar({ arcos: mostrar.map(function (c) { return [c[0], c[1]]; }), claves: [xs[0]].concat(listo ? [ch.fin] : []) });
    }
    var tec = P.teclado($('#rp-tz'), {
      max: 3, alTecla: function () { ctx.accion(); },
      alEnviar: function (n) {
        if (listo) return;
        if (n === it.resp) {
          listo = true; tec.destruir(); $('#rp-r').textContent = n; $('#rp-r').className = 'is-bien';
          nivelPista = 3; ayuda();
          ctx.listo('Yes! ' + it.expr + ' = ' + n + '.');
        } else {
          tec.limpiar();
          ctx.fallo('Not yet. Plus: hop right. Minus: hop left.');
        }
      }
    });
    ctx.peldanos([
      { texto: 'Start on the first number. Plus: hop right. Minus: hop left.', visual: function () { nivelPista = 1; ayuda(); } },
      { texto: segundaPista(it.expr), visual: function () { nivelPista = 2; ayuda(); } },
      { texto: (it.ej || (ronda && ronda.ejemplo) || '') + ' Look at all the hops.', visual: function () { nivelPista = 3; ayuda(); } }
    ]);
    ctx.mensaje('Type the answer. Then tap OK.', '');
    return { destruir: function () { tec.destruir(); if (recta) recta.destruir(); } };
  }

  /* ====================== ARRANQUE ====================== */
  P.repaso({
    id: 'recta',
    rotulo: 'Year 2 Maths', titulo: 'Hop along the number line',
    texto: 'Hop and count on the number line. Five rounds.',
    finTitulo: 'You did it!', finTexto: 'You can add and take away on the number line. Play again any time.',
    rondas: RONDAS,
    montar: function (item, ctx, ronda) {
      if (item.t === 'ubicar') return montarUbicar(item, ctx);
      if (item.t === 'cuaderno') return montarCuaderno(item, ctx, ronda);
      return montarSaltar(item, ctx, ronda);
    }
  });
})();
