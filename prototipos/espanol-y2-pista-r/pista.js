// titulo: La Pista de la R
/* ============================================================
   BOCETO GRIS — La Pista de la R (Español Year 2, r y rr)
   Ficha: docs/temas/espanol-y2-la-r.md (secciones 3 y 4).
   Verbo: llenar. El niño carga el motor de un carrito con piezas R
   (una o dos) y el carrito salta el hueco de la palabra con esa fuerza.
   Un boton, una accion: «R» agrega una pieza (maximo 2; la tercera se
   cae), tocar el motor lo vacia, «¡Arranca!» sale, 🔊 repite la palabra.
   Entre vocales el hueco es un salto: grande solo con rr, pequeño con r.
   Al inicio la salida tiene turbo: con una pieza ya ruge fuerte.
   Sin derrota: con poca fuerza cae al charco y una grua lo devuelve
   (y se despeja la niebla de ese hueco); con fuerza de mas cae en el
   pasto pasado de la meta; con dos piezas al inicio patina con humo.
   Ronda 1: una palabra por pista; primer item medio resuelto; niebla
   desde el tercero. Ronda 2: dos o tres palabras por pista sin detener
   el carrito. Gema por ronda. Cajas y colores planos; emoji como dibujo.
   Teclado: ↑ o R carga, ↓ vacia, ← → mueven el foco, Enter arranca.
   Niveles escritos a mano: es un boceto, no datos del juego.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var B = 56, VEL = 1.5, PISO = 16, ALTO = 250, CARRO_ALTO = 34;   // B: px por celda; VEL: celdas por segundo

  function pal(w, e, g, extra) { var o = { w: w, e: e, g: g }; for (var k in (extra || {})) o[k] = extra[k]; return o; }
  var RONDAS = [
    { nombre: 'Ronda 1 · En medio de la palabra', nieblaDesde: 2, pistas: [
      [pal('perro', '🐶', 'grande', { medio: true })],
      [pal('loro', '🦜', 'pequeno')],
      [pal('carro', '🚗', 'grande', { mal: { w: 'caro', e: '🏷️' } })],
      [pal('toro', '🐂', 'pequeno')],
      [pal('zorro', '🦊', 'grande')],
      [pal('cara', '🙂', 'pequeno')],
      [pal('gorra', '🧢', 'grande')],
      [pal('pirata', '🏴‍☠️', 'pequeno')]
    ] },
    { nombre: 'Ronda 2 · La salida con turbo', nieblaDesde: 0, pistas: [
      [pal('rana', '🐸', 'inicio'), pal('regalo', '🎁', 'inicio'), pal('torre', '🏰', 'grande')],
      [pal('ratón', '🐭', 'inicio'), pal('tiburón', '🦈', 'pequeno')],
      [pal('rey', '👑', 'inicio'), pal('guitarra', '🎸', 'grande'), pal('reloj', '⏰', 'inicio')]
    ] }
  ];
  var PIEZAS = { inicio: 1, grande: 2, pequeno: 1 };

  var css = document.createElement('style');
  css.textContent =
    '.proto-piel-rotulo,.proto-pieles{display:none}' +
    '.pr-portada{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#DCE9F2}' +
    '.pr-portada__fila{display:flex;gap:4px}' +
    '.pr-portada__fila span{width:48px;height:48px;border:3px solid #1E1426;background:#FFFDF6;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.6rem}' +
    '.pr-portada__fila span.h{background:#2F6FB8;border-style:dashed}' +
    '.pr-portada__carro{width:64px;height:38px;background:#C23B32;border:3px solid #1E1426;border-radius:8px 16px 4px 4px}' +
    '.pr-cabeza{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.pr-cabeza h2{margin:0;font-size:1.3rem}' +
    '.pr-paso{font-weight:800;color:#5C4A3B}' +
    '.pr-cartel{display:flex;align-items:center;justify-content:center;gap:16px;margin:10px 0 6px;min-height:88px;flex-wrap:wrap}' +
    '.pr-dibujo{font-size:clamp(3rem,10vw,4.5rem);line-height:1}' +
    '.pr-palabra{display:flex;gap:4px}' +
    '.pr-palabra span{min-width:1.1em;padding:0 6px;text-align:center;font-weight:900;font-size:clamp(2rem,8vw,3rem);line-height:1.3;border:3px solid #1E1426;border-radius:10px;background:#FFFDF6}' +
    '.pr-palabra span.is-hueco{border-style:dashed;color:#5C4A3B;background:#E9E6EF}' +
    '.pr-palabra span.is-r{background:#FFD34D}' +
    '.pr-palabra span.is-mal{background:repeating-linear-gradient(45deg,#FF9E8A 0 6px,#FFFDF6 6px 12px)}' +
    '.pr-pista{position:relative;height:' + ALTO + 'px;border:3px solid #1E1426;border-radius:12px;background:#DCE9F2;overflow:hidden;user-select:none}' +
    '.pr-mundo{position:absolute;left:0;top:0;bottom:0;will-change:transform}' +
    '.pr-tierra{position:absolute;left:0;right:0;bottom:0;height:' + PISO + 'px;background:#5C4A3B}' +
    '.pr-celda{position:absolute;bottom:' + PISO + 'px;width:' + B + 'px;height:' + B + 'px;box-sizing:border-box;border:2px solid #1E1426;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.9rem;color:#1E1426}' +
    '.pr-celda.suelo{background:#9A97A3}' +
    '.pr-celda.letra{background:#FFFDF6}' +
    '.pr-celda.base{background:#D3D0DA}' +
    '.pr-celda.pad{background:#FFF3C4;border-style:dashed}' +
    '.pr-celda.meta{background:repeating-conic-gradient(#1E1426 0 25%,#FFFDF6 0 50%) 0 0/14px 14px}' +
    '.pr-celda.pasto{background:#7BBF5A}' +
    '.pr-celda.pozo{border:none;background:transparent}' +
    '.pr-celda.is-r{background:#FFD34D;border:2px solid #1E1426}' +
    '.pr-agua{position:absolute;bottom:' + PISO + 'px;width:' + B + 'px;height:22px;box-sizing:border-box;background:#2F6FB8;border:2px solid #1E1426}' +
    '.pr-agua.is-splash{animation:pr-splash .6s}' +
    '.pr-niebla{position:absolute;bottom:6px;height:150px;box-sizing:border-box;border-radius:30px;background:rgba(240,240,246,.97);border:3px dashed #8A879A;display:flex;align-items:center;justify-content:center;font-size:2.2rem;transition:opacity .5s;z-index:3}' +
    '.pr-niebla.is-fuera{opacity:0}' +
    '.pr-carro{position:absolute;width:52px;height:' + CARRO_ALTO + 'px;margin-left:2px;z-index:2}' +
    '.pr-carro b{position:absolute;left:0;right:0;top:0;bottom:8px;background:#C23B32;border:3px solid #1E1426;border-radius:8px 14px 4px 4px}' +
    '.pr-carro i{position:absolute;bottom:0;width:16px;height:16px;border-radius:50%;background:#1E1426}' +
    '.pr-carro i.r1{left:5px}.pr-carro i.r2{right:5px}' +
    '.pr-carga{position:absolute;top:-14px;left:8px;display:flex;gap:3px}' +
    '.pr-carga u{display:block;width:12px;height:12px;background:#FFD34D;border:2px solid #1E1426;text-decoration:none}' +
    '.pr-carro.is-turbo::after{content:"";position:absolute;right:100%;top:6px;width:44px;height:16px;border-radius:8px;background:linear-gradient(90deg,transparent,#FFB020,#FF5A1F)}' +
    '.pr-carro.is-patina{animation:pr-tiembla .12s infinite}' +
    '.pr-humo{position:absolute;width:26px;height:26px;border-radius:50%;background:#B9B6C2;z-index:2;animation:pr-humo 1s ease-out forwards}' +
    '.pr-grua{position:absolute;top:0;width:4px;margin-left:26px;background:#1E1426;z-index:2}' +
    '.pr-grua::after{content:"";position:absolute;left:-10px;bottom:-8px;width:24px;height:12px;box-sizing:border-box;border:4px solid #1E1426;border-top:none;border-radius:0 0 12px 12px}' +
    '.pr-grua[hidden]{display:none}' +
    '.pr-msg{text-align:center;min-height:1.6em;font-weight:800;font-size:1.2rem;margin:6px 0 0}' +
    '.pr-ctrl{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap}' +
    '.pr-ctrl .k-boton{min-height:64px;min-width:64px;font-size:1.6rem}' +
    '.pr-ctrl .k-boton[disabled]{opacity:.35;cursor:not-allowed}' +
    '.pr-btn-r{flex:1;background:#FFD34D;font-weight:900}' +
    '.pr-motor{flex:1;position:relative;display:flex;gap:8px;align-items:center;justify-content:center}' +
    '.pr-motor u{display:block;width:40px;height:40px;box-sizing:border-box;border:3px dashed #1E1426;border-radius:6px;text-decoration:none;font-weight:900;font-size:1.3rem;line-height:34px;text-align:center}' +
    '.pr-motor u.is-lleno{border-style:solid;background:#FFD34D}' +
    '.pr-motor u.pr-cae{position:absolute;left:50%;top:8px;margin-left:-20px;border-style:solid;background:#FFD34D;animation:pr-cae .7s ease-in forwards;pointer-events:none}' +
    '.pr-arranca{flex:1.4}' +
    '.pr-voz{font-size:.95rem}' +
    '@keyframes pr-splash{0%{transform:scaleY(1)}40%{transform:scaleY(2.4)}100%{transform:scaleY(1)}}' +
    '@keyframes pr-tiembla{0%{transform:translateX(-3px)}50%{transform:translateX(3px)}100%{transform:translateX(-3px)}}' +
    '@keyframes pr-humo{from{transform:scale(.5);opacity:.9}to{transform:translate(-30px,-40px) scale(1.6);opacity:0}}' +
    '@keyframes pr-cae{to{transform:translateY(90px) rotate(80deg);opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){.pr-carro.is-patina,.pr-humo,.pr-agua.is-splash,.pr-motor u.pr-cae{animation:none}}';
  document.head.appendChild(css);

  var S = null, gemas = 0, vuelta = 0;
  var cada = function (txt, f) { Array.prototype.forEach.call(txt, f); };

  /* La palabra partida en antes, hueco y despues. */
  function partir(p) {
    var w = p.w, i;
    if (p.g === 'inicio') return { pre: '', hueco: w.charAt(0), post: w.slice(1) };
    if (p.g === 'grande') { i = w.indexOf('rr'); return { pre: w.slice(0, i), hueco: 'rr', post: w.slice(i + 2) }; }
    i = w.indexOf('r'); return { pre: w.slice(0, i), hueco: 'r', post: w.slice(i + 1) };
  }

  /* Celdas de la pista: salida, y por palabra sus letras con el hueco
     (zona de 2 celdas entre vocales: pozo de 2 para rr, pozo de 1 y suelo
     para r; 1 celda de turbo al inicio), la meta y tres de pasto. */
  function armar(lista) {
    var c = [{ t: 'suelo' }, { t: 'suelo' }], tramos = [];
    lista.forEach(function (p, k) {
      var q = partir(p), z = { p: p, q: q, k: k, ini: c.length, hecho: false };
      cada(q.pre, function (l) { c.push({ t: 'letra', l: l }); });
      z.hueco = c.length;
      if (p.g === 'inicio') c.push({ t: 'pad' });
      else { c.push({ t: 'pozo' }); c.push(p.g === 'grande' ? { t: 'pozo' } : { t: 'base' }); }
      cada(q.post, function (l) { c.push({ t: 'letra', l: l }); });
      z.meta = c.length; c.push({ t: 'meta' });
      c.push({ t: 'pasto' }, { t: 'pasto' }, { t: 'pasto' });
      tramos.push(z);
    });
    return { celdas: c, tramos: tramos };
  }

  function pintarPista() {
    var html = '';
    S.celdas.forEach(function (c, i) {
      var x = 'left:' + (i * B) + 'px';
      if (c.t === 'pozo') html += '<div class="pr-agua" id="pr-agua-' + i + '" style="' + x + '"></div><div class="pr-celda pozo" id="pr-c-' + i + '" style="' + x + '"></div>';
      else html += '<div class="pr-celda ' + c.t + '" id="pr-c-' + i + '" style="' + x + '">' + (c.l || (c.t === 'pad' ? '_' : '')) + '</div>';
    });
    S.tramos.forEach(function (z) {
      z.niebla = z.p.g !== 'inicio' && S.ip >= S.ronda.nieblaDesde;
      if (z.niebla) html += '<div class="pr-niebla" id="pr-niebla-' + z.k + '" style="left:' + (z.hueco * B - 8) + 'px;width:' + (2 * B + 16) + 'px" aria-hidden="true">☁️</div>';
    });
    html += '<div class="pr-carro" id="pr-carro" aria-hidden="true"><b></b><i class="r1"></i><i class="r2"></i><span class="pr-carga" id="pr-carga"></span></div>' +
            '<div class="pr-grua" id="pr-grua" hidden></div>';
    S.el.mundo.style.width = (S.celdas.length * B) + 'px';
    S.el.mundo.innerHTML = html;
    S.el.carro = P.$('#pr-carro'); S.el.grua = P.$('#pr-grua'); S.el.carga = P.$('#pr-carga');
  }

  function pintarCarro() {
    if (!S || !S.el.carro) return;
    var c = S.el.carro, base = PISO + B + S.y * B;
    c.style.left = (S.x * B) + 'px';
    c.style.bottom = base + 'px';
    c.classList.toggle('is-turbo', S.turbo > 0);
    var vw = S.el.pista.clientWidth || 0, total = S.celdas.length * B;
    var cam = Math.max(0, Math.min(Math.max(0, total - vw), S.x * B - vw * 0.3));
    S.el.mundo.style.transform = 'translateX(' + (-cam) + 'px)';
    if (S.grua) {
      var alto = (S.el.pista.clientHeight || ALTO) - base - CARRO_ALTO;
      S.el.grua.style.left = (S.x * B) + 'px';
      S.el.grua.style.height = Math.max(0, alto * S.grua.k) + 'px';
    }
  }

  function pintarCarga() {
    var s = '';
    for (var i = 0; i < S.n; i++) s += '<u></u>';
    if (S.el.carga) S.el.carga.innerHTML = s;
    var slots = S.el.motor.querySelectorAll('u.pr-slot');
    Array.prototype.forEach.call(slots, function (u, i) { u.className = 'pr-slot' + (i < S.n ? ' is-lleno' : ''); u.textContent = i < S.n ? 'R' : ''; });
    S.el.motor.setAttribute('aria-label', 'Motor con ' + S.n + (S.n === 1 ? ' pieza' : ' piezas') + '. Tócalo para vaciarlo');
  }

  function cartel(z, modo) {
    var q = z.q, letras = [], dib = z.p.e, nombre = z.p.w;
    function sp(t, cls) { letras.push('<span' + (cls ? ' class="' + cls + '"' : '') + '>' + t + '</span>'); }
    if (modo === 'mal') {
      dib = z.p.mal.e; nombre = z.p.mal.w;
      cada(nombre, function (l, i) { sp(l, i === q.pre.length ? 'is-mal' : ''); });
    } else {
      cada(q.pre, function (l) { sp(l); });
      if (modo === 'lleno') cada(q.hueco, function (l) { sp(l, 'is-r'); }); else sp('_', 'is-hueco');
      cada(q.post, function (l) { sp(l); });
    }
    S.el.cartel.innerHTML = '<span class="pr-dibujo" aria-hidden="true">' + dib + '</span>' +
      '<span class="pr-palabra" aria-label="' + (modo === 'hueco' ? 'Palabra con un hueco' : nombre) + '">' + letras.join('') + '</span>';
  }

  function msg(t) { S.el.msg.textContent = t; }
  function objetivo() { return S.tramos[S.obj] || S.tramos[S.tramos.length - 1]; }
  function decir() { P.voz(objetivo().p.w); }

  function controles() {
    var libre = S.fase === 'espera' || S.fase === 'rueda';
    S.el.r.disabled = !libre || (S.medio && S.n >= 2);
    S.el.motor.disabled = !libre || S.medio || S.n === 0;
    S.el.arranca.disabled = S.fase !== 'espera' || (S.medio && S.n < 2);
    pintarCarga();
  }

  /* ---------- Acciones: un boton, una accion ---------- */
  function caePieza() {
    var u = document.createElement('u');
    u.className = 'pr-cae'; u.textContent = 'R';
    S.el.motor.appendChild(u);
    setTimeout(function () { if (u.parentNode) u.parentNode.removeChild(u); }, 750);
  }
  function cargar() {
    if (!S || S.el.r.disabled) return;
    if (S.n >= 2) { caePieza(); P.sonido('cavar'); return; }    // la tercera se cae
    S.n++;
    P.sonido(S.n === 1 ? 'motor-corto' : 'motor-largo');
    controles();
  }
  function vaciar() {
    if (!S || S.el.motor.disabled) return;
    for (var i = 0; i < S.n; i++) caePieza();
    S.n = 0; P.sonido('paso'); controles();
  }
  function arrancar() {
    if (!S || S.el.arranca.disabled) return;
    if (S.n === 0) { P.sonido('mal'); msg('Carga el motor con R.'); decir(); return; }
    if (objetivo().p.g !== 'inicio') P.sonido(S.n === 1 ? 'motor-corto' : 'motor-largo');
    S.fase = 'rueda'; msg(''); controles();
  }

  /* ---------- Movimiento: un solo tween a la vez ---------- */
  function tw(d, f, fin) { S.tw = { d: d, e: 0, f: f || function () {}, fin: fin }; }
  function actualizar(dt) {
    if (!S || !S.tramos) return;
    if (S.turbo > 0) S.turbo -= dt;
    if (S.tw) {
      var t = S.tw; t.e += dt;
      var k = Math.min(1, t.e / t.d); t.f(k);
      if (k >= 1 && S.tw === t) { S.tw = null; if (t.fin) t.fin(); }
      return;
    }
    if (S.fase !== 'rueda') return;
    S.x += VEL * (S.turbo > 0 ? 2.6 : 1) * dt;
    var z = S.tramos[S.obj];
    if (z) {
      if (z.p.g === 'inicio') { if (S.x >= z.hueco - 0.5) { S.x = z.hueco - 0.5; decidirInicio(z); } }
      else if (S.x + 1 >= z.hueco) { S.x = z.hueco - 1; decidirSalto(z); }
    } else {
      var meta = S.tramos[S.tramos.length - 1].meta;
      if (S.x >= meta) { S.x = meta; terminarPista(); }
    }
  }

  /* R al inicio: una pieza = turbo; dos = patina (E2); cero = se apaga. */
  function decidirInicio(z) {
    if (S.n === 1) {
      S.n = 0; S.turbo = 0.9; P.sonido('motor-largo');
      llenar(z); avanzar(); controles();
      return;
    }
    if (S.n === 0) {
      S.fase = 'espera'; S.x = z.hueco - 1; P.sonido('mal');
      msg('¡Sin piezas! Carga el motor con R.'); decir(); controles();
      return;
    }
    S.fase = 'error'; controles();
    P.sonido('motor-largo');
    msg('¡Patina! La R del principio ya ruge sola.');
    P.voz('La R del principio ya ruge sola.');
    S.el.carro.classList.add('is-patina');
    var humo = 0;
    tw(1.6, function (k) { while (humo < k * 8) { humo++; soltarHumo(); } }, function () {
      S.el.carro.classList.remove('is-patina');
      for (var i = 0; i < S.n; i++) caePieza();
      S.n = 0; S.x = z.hueco - 1; S.fase = 'espera'; controles();
    });
  }
  function soltarHumo() {
    var h = document.createElement('span');
    h.className = 'pr-humo';
    h.style.left = (S.x * B - 14 + Math.random() * 10) + 'px';
    h.style.bottom = (PISO + B + Math.random() * 10) + 'px';
    S.el.mundo.appendChild(h);
    setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 1000);
  }

  /* Hueco entre vocales: la fuerza del motor decide el salto. */
  function decidirSalto(z) {
    var falta = PIEZAS[z.p.g], n = S.n, x0 = S.x, grande = z.p.g === 'grande';
    S.n = 0; S.fase = 'salto'; controles();
    if (n) P.sonido(n === 1 ? 'motor-corto' : 'motor-largo');
    if (n === falta) {
      var x1 = z.hueco + (grande ? 2 : 1), h = grande ? 1.4 : 0.8;
      tw(grande ? 0.85 : 0.6, function (k) { S.x = x0 + (x1 - x0) * k; S.y = h * 4 * k * (1 - k); }, function () {
        S.y = 0; S.fase = 'rueda'; llenar(z); avanzar(); controles();
      });
    } else if (n < falta) {                                   // E1: corto, al charco
      var dx = grande ? 1.5 : 1, hop = n ? 0.5 : 0;
      tw(0.6, function (k) { S.x = x0 + dx * k; S.y = hop * 4 * k * (1 - k) - 0.75 * k * k; }, function () { charco(z); });
    } else {                                                  // E3: largo, al pasto
      var x2 = z.meta + 1.2;
      tw(1.1, function (k) { S.x = x0 + (x2 - x0) * k; S.y = 2 * 4 * k * (1 - k); }, function () { S.y = 0; pasto(z); });
    }
  }
  function charco(z) {
    S.fase = 'error'; controles(); P.sonido('mal');
    var a = P.$('#pr-agua-' + z.hueco);
    if (a) { a.classList.remove('is-splash'); void a.offsetWidth; a.classList.add('is-splash'); }
    msg('¡Al charco! Le faltó fuerza.');
    var nb = P.$('#pr-niebla-' + z.k); if (nb) nb.classList.add('is-fuera');   // se despeja la niebla de ese hueco
    if (z.p.mal) { cartel(z, 'mal'); P.voz(z.p.mal.w); }                      // «caro»: la etiqueta de precio
    tw(1.4, null, function () {
      if (z.p.mal) cartel(z, 'hueco');
      grua(z.ini - 1, function () { msg('Otra vez.'); decir(); });
    });
  }
  function pasto(z) {
    S.fase = 'error'; controles(); P.sonido('mal');
    msg('¡Uy! Saltó de más y cayó en el pasto.');
    tw(1.0, null, function () { grua(z.ini - 1, function () { msg('Otra vez.'); decir(); }); });
  }
  function grua(dest, fin) {
    S.fase = 'error'; S.grua = { k: 0 }; S.el.grua.hidden = false; controles();
    var y0 = S.y, x0 = S.x;
    tw(0.45, function (k) { S.grua.k = k; }, function () {
      tw(0.4, function (k) { S.y = y0 + (1.6 - y0) * k; }, function () {
        tw(0.9, function (k) { S.x = x0 + (dest - x0) * k; }, function () {
          tw(0.35, function (k) { S.y = 1.6 * (1 - k); }, function () {
            S.y = 0; S.grua = null; S.el.grua.hidden = true; S.fase = 'espera'; controles();
            if (fin) fin();
          });
        });
      });
    });
  }

  function marcar(i, l) { var c = P.$('#pr-c-' + i); if (c) { c.className = 'pr-celda is-r'; c.textContent = l; } }
  function llenar(z) {
    z.hecho = true;
    marcar(z.hueco, 'r');
    if (z.p.g === 'grande') marcar(z.hueco + 1, 'r');
    var nb = P.$('#pr-niebla-' + z.k); if (nb) nb.classList.add('is-fuera');
    cartel(z, 'lleno'); P.sonido('veta');
  }
  /* La siguiente palabra se anuncia mientras el carrito sigue. */
  function avanzar() {
    S.obj++;
    var z = S.tramos[S.obj], yo = S;
    if (!z) return;
    setTimeout(function () {
      if (S !== yo || S.tramos[S.obj] !== z) return;
      cartel(z, 'hueco'); P.voz(z.p.w);
    }, 700);
  }

  function terminarPista() {
    S.fase = 'fin'; controles();
    var regla = 'Suena fuerte en medio: dos erres.';
    if (S.medio) { msg(regla); P.voz(regla); } else msg('¡Bien!');
    tw(S.medio ? 2.6 : 1.1, null, function () {
      if (S.ip + 1 < S.ronda.pistas.length) cargarPista(S.ip + 1);
      else finRonda();
    });
  }
  function finRonda() {
    gemas++;
    var g = P.$('#gems'); if (g) g.textContent = gemas;
    var r = S.r; S.fase = 'gema'; controles();
    P.gemaCentro(S.el.pista, '¡Ronda lista!', function () {
      if (r + 1 < RONDAS.length) jugar(r + 1);
      else {
        S = null;
        P.final({ rotulo: 'La Pista de la R', titulo: '¡Las dos rondas!', texto: 'Saltaste con r y con rr.', gemas: gemas,
                  otra: function () { gemas = 0; jugar(0); } });
      }
    });
  }

  function cargarPista(ip) {
    var lista = S.ronda.pistas[ip], a = armar(lista);
    S.ip = ip; S.celdas = a.celdas; S.tramos = a.tramos; S.obj = 0;
    S.x = a.tramos[0].ini - 1; S.y = 0; S.turbo = 0; S.grua = null; S.tw = null;
    S.medio = !!lista[0].medio; S.n = S.medio ? 1 : 0; S.fase = 'espera';   // medio resuelto: una pieza ya cargada
    pintarPista(); cartel(a.tramos[0], 'hueco');
    msg(S.medio ? 'Toca R.' : '');
    P.$('#pr-paso').textContent = (ip + 1) + ' / ' + S.ronda.pistas.length;
    controles(); pintarCarro();
    P.voz(lista[0].w);
  }

  function jugar(r) {
    P.$('#proto').innerHTML =
      '<section class="k-panel">' +
        '<div class="pr-cabeza"><h2>' + RONDAS[r].nombre + '</h2><span class="pr-paso" id="pr-paso"></span>' +
          '<div class="k-gemas">' + P.gemaSVG(22) + '<span id="gems">' + gemas + '</span></div></div>' +
        '<div class="pr-cartel" id="pr-cartel" aria-live="polite"></div>' +
        '<div class="pr-pista" id="pr-pista"><div class="pr-tierra"></div><div class="pr-mundo" id="pr-mundo"></div></div>' +
        '<p class="pr-msg" id="pr-msg" aria-live="polite"></p>' +
        '<div class="pr-ctrl" id="pr-ctrl">' +
          '<button type="button" class="k-boton pr-btn-r" id="pr-r" aria-label="Agregar una pieza R">R</button>' +
          '<button type="button" class="k-boton pr-motor" id="pr-motor"><u class="pr-slot"></u><u class="pr-slot"></u></button>' +
          '<button type="button" class="k-boton k-boton--primario pr-arranca" id="pr-arranca">¡Arranca!</button>' +
          '<button type="button" class="k-boton pr-oir" id="pr-oir" aria-label="Oír la palabra">🔊</button>' +
        '</div>' +
      '</section>';
    S = { id: ++vuelta, r: r, ronda: RONDAS[r], n: 0, x: 0, y: 0, turbo: 0, fase: 'espera',
          el: { pista: P.$('#pr-pista'), mundo: P.$('#pr-mundo'), cartel: P.$('#pr-cartel'), msg: P.$('#pr-msg'),
                r: P.$('#pr-r'), motor: P.$('#pr-motor'), arranca: P.$('#pr-arranca'), oir: P.$('#pr-oir') } };
    S.el.r.addEventListener('click', cargar);
    S.el.motor.addEventListener('click', vaciar);
    S.el.arranca.addEventListener('click', arrancar);
    S.el.oir.addEventListener('click', function () { if (S) decir(); });
    cargarPista(0);
    var id = S.id, t0 = null;
    function cuadro(t) {
      if (!S || S.id !== id) return;
      var dt = t0 === null ? 0 : Math.min(0.05, (t - t0) / 1000); t0 = t;
      actualizar(dt); pintarCarro();
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
  }

  /* Teclado: arriba suma una pieza, abajo vacia; izquierda y derecha
     mueven el foco; Enter hace la accion del boton enfocado o arranca. */
  document.addEventListener('keydown', function (e) {
    if (!S || !P.$('#pr-ctrl')) return;
    var k = e.key;
    if (k === 'ArrowUp' || k === 'r' || k === 'R') { e.preventDefault(); cargar(); }
    else if (k === 'ArrowDown' || k === 'Backspace') { e.preventDefault(); vaciar(); }
    else if (k === 'ArrowLeft' || k === 'ArrowRight') {
      e.preventDefault();
      var bs = Array.prototype.filter.call(document.querySelectorAll('#pr-ctrl button'), function (b) { return !b.disabled; });
      if (!bs.length) return;
      var i = bs.indexOf(document.activeElement);
      i = i < 0 ? 0 : (i + (k === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length;
      bs[i].focus();
    } else if (k === 'Enter') {
      var a = document.activeElement;
      if (a && a.tagName === 'BUTTON' && a.closest && a.closest('#pr-ctrl')) return;
      e.preventDefault(); arrancar();
    }
  });

  /* Gancho para probar el boceto paso a paso (solo local). */
  window.__pista = { estado: function () { return S; }, paso: function (dt) { actualizar(dt); pintarCarro(); },
                     cargar: cargar, vaciar: vaciar, arrancar: arrancar };

  P.inicio({ rotulo: 'Minijuego · Year 2', titulo: 'La Pista de la R', texto: 'Oye la palabra, carga el motor con R y salta el hueco.',
             alJugar: function () { jugar(0); } });
  var esc = P.$('.k-escena');
  if (esc) esc.innerHTML = '<div class="pr-portada" aria-hidden="true"><div class="pr-portada__fila"><span>p</span><span>e</span>' +
    '<span class="h"></span><span class="h"></span><span>o</span></div><div class="pr-portada__carro"></div></div>';
  var vl = document.createElement('p');
  vl.className = 'k-suave pr-voz';
  var botones = P.$('.proto-inicio .k-botones');
  if (botones) botones.parentNode.insertBefore(vl, botones);
  function estadoVoz() {
    var v = P.vozLocal();
    vl.textContent = v ? 'Voz: ' + v.nombre + ' (' + v.lang + ')' : 'Sin voz local en español: se juega con los dibujos.';
  }
  estadoVoz();
  setTimeout(estadoVoz, 800);
  try { if (window.speechSynthesis && window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', estadoVoz); } catch (e) { /* sin voz */ }
})();
