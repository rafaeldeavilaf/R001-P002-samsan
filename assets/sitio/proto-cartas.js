/* ============================================================
   SAMSAN — PROTOTIPO A: CARTAS DE SALTO (solo local)
   El pozo del bioma con el montacargas, dos o tres vetas de cristal a
   distintas profundidades, franjas de roca donde no se puede parar y
   una mano de cartas con numeros con signo. Cada carta mueve el
   montacargas ese numero de metros. Caer exacto en una veta la recoge;
   caer en roca rebota y la carta vuelve a la mano. Meta: recoger todas
   las vetas. Para planear el orden de las cartas hay que sumar con signo.
   Datos: window.PROTO.cartas (tools/gen/maths_y6_prototipos.py).
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN, $ = P.$, num = P.num, signo = P.signo;
  var juegos = (window.PROTO && window.PROTO.cartas) || [], juego = 0, gemas = 0;
  var S = null, capas = false, NB = ' ';
  var DMIN = -30, DMAX = 10;

  function E() { return P.mundo; }
  function enRoca(x) { return S.p.rocas.some(function (r) { return x >= r[0] && x <= r[1]; }); }
  function m(n) { return num(n) + NB + 'm'; }

  function empezar() {
    P.partida(juegos[juego % juegos.length], jugar, function () {
      P.final({ rotulo: 'Prototype A · Jump cards', titulo: 'Every crystal vein collected',
        texto: 'You planned the jumps and reached every vein. Play again for new hands.', gemas: gemas,
        otra: function () { juego++; gemas = 0; empezar(); } });
    });
  }

  /* Vetas, rocas y la profundidad actual, dibujadas encima del pozo. */
  function registrarCapas() {
    var W = E();
    if (!W || capas) return;
    capas = true;
    var M = window.SAMSAN_MUNDO, I = M.inst, L = W.L, ctx = L.ctx, yOf = W.cav.yOf;
    L.capa('alta', 52, function () {
      if (!S) return;
      var s = L.s, u = I.u(L), cam = L.cam.y, y = function (d) { return (yOf(d) - cam) * s; };
      S.p.rocas.forEach(function (r) {                       // roca: rayada (forma, no solo color)
        var y0 = y(r[1] + 0.5), y1 = y(r[0] - 0.5), x0 = 258 * s, x1 = 382 * s;
        ctx.save();
        ctx.fillStyle = 'rgba(60,34,20,0.88)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        ctx.strokeStyle = 'rgba(208,101,47,0.9)'; ctx.lineWidth = 2 * u;
        ctx.beginPath();
        for (var k = -(y1 - y0); k < x1 - x0; k += 10 * u) { ctx.moveTo(x0 + k, y1); ctx.lineTo(x0 + k + (y1 - y0), y0); }
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
        ctx.beginPath();
        for (k = -(y1 - y0); k < x1 - x0; k += 10 * u) { ctx.moveTo(x0 + k, y1); ctx.lineTo(x0 + k + (y1 - y0), y0); }
        ctx.stroke(); ctx.restore();
        ctx.strokeStyle = '#1E1426'; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        ctx.restore();
        I.etiqueta(L.ctx, L, 'ROCK ' + num(r[1]) + ' to ' + num(r[0]) + ' m', x0 + 4 * u, (y0 + y1) / 2, 'left', '#FFF4E0', 'rgba(60,34,20,0.95)', 0.8);
      });
      S.p.vetas.forEach(function (v, k) {                   // vetas: cristal en la pared y su profundidad
        if (S.recogidas[k]) return;
        var yv = y(v), x = 268 * s, brillo = 0.75 + 0.25 * Math.sin(L.time * 3 + k);
        ctx.save(); ctx.globalAlpha = brillo;
        ctx.fillStyle = '#7FE3F0'; ctx.strokeStyle = '#1E1426'; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(x, yv - 16 * u); ctx.lineTo(x + 8 * u, yv - 4 * u); ctx.lineTo(x, yv); ctx.lineTo(x - 8 * u, yv - 4 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
        I.etiqueta(ctx, L, '◆ ' + m(v), x - 12 * u, yv - 8 * u, 'right', '#0E2A33', 'rgba(127,227,240,0.97)');
      });
      // Donde esta el montacargas ahora, en numeros: no hace falta contar marcas.
      I.etiqueta(ctx, L, m(S.pos), 400 * s, y(W.cav.explorador.posAnim), 'left', '#2A211A', 'rgba(255,211,77,0.98)');
    });
  }

  function jugar(p, i, total, alGanar) {
    S = { p: p, pos: p.salida, usadas: p.cartas.map(function () { return false; }), recogidas: p.vetas.map(function () { return false; }),
          hist: [], ocupado: false, ganado: false, alGanar: alGanar };
    var canvas = (E() && E().L.canvas) || document.createElement('canvas');
    $('#proto').innerHTML =
      '<div class="ca">' +
        '<section class="k-panel ca-panel">' +
          '<div class="ex-cabeza"><p class="k-rotulo">Cards ' + (i + 1) + ' of ' + total + '</p>' +
            '<div class="k-gemas" id="hud">' + P.gemaSVG(22) + '<span id="gems">' + gemas + '</span></div></div>' +
          '<h2>Collect every crystal vein. Each card moves the lift: + goes up, ' + '−' + ' goes down. The lift cannot stop in rock.</h2>' +
          '<p class="ca-estado" aria-live="polite"></p>' +
        '</section>' +
        '<div class="k-escena ca-escena"></div>' +
        '<div class="ca-mano" role="group" aria-label="Your cards"></div>' +
        '<div class="k-botones ex-botones"><button type="button" class="k-boton" id="deshacer">&#8630; UNDO</button>' +
          '<button type="button" class="k-boton" id="reiniciar">RESTART</button></div>' +
        '<p class="k-mensaje ca-msg" aria-live="polite">Plan first: which card reaches a vein?</p>' +
      '</div>';
    $('.ca-escena').appendChild(canvas);
    var mano = $('.ca-mano');
    p.cartas.forEach(function (c, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ca-carta ' + (c > 0 ? 'is-sube' : 'is-baja'); b.setAttribute('data-i', k);
      b.setAttribute('aria-label', 'Card ' + signo(c) + ' metres');
      b.innerHTML = '<span class="ca-flecha" aria-hidden="true">' + (c > 0 ? '&#9650;' : '&#9660;') + '</span><b>' + signo(c) + '</b><span class="ca-tecla" aria-hidden="true">' + (k + 1) + '</span>';
      b.addEventListener('click', function () { jugarCarta(k); });
      mano.appendChild(b);
    });
    $('#deshacer').addEventListener('click', deshacer);
    $('#reiniciar').addEventListener('click', function () { while (S.hist.length) deshacer(true); pintar(); });
    if (E()) {
      E().L.redimensionar();
      E().nuevoNivel();
      E().configurar({ piel: 'montacargas', unidad: 'm', min: DMIN, max: DMAX, valor: p.salida, fisica: p.salida, soloDecenas: false, ver: true });
      E().pintar({ inicio: p.salida });
      registrarCapas();
    }
    pintar();
  }

  function jugarCarta(k) {
    if (!S || S.ocupado || S.ganado || S.usadas[k]) return;
    var c = S.p.cartas[k], desde = S.pos, x = desde + c;
    if (x < DMIN || x > DMAX || enRoca(x)) {                 // rebota: la carta vuelve a la mano
      P.sonido('mal');
      $('.ca-msg').textContent = num(desde) + ' ' + (c < 0 ? '+ (' + num(c) + ')' : '+ ' + c) + ' = ' + num(x) +
        (x < DMIN || x > DMAX ? ': that is outside the shaft.' : ': there is rock at ' + m(x) + '. The lift bounces back.');
      if (E()) { S.ocupado = true; E().viajar({ desde: desde, hasta: Math.max(DMIN, Math.min(DMAX, x)), alLlegar: function () {
        E().viajar({ desde: Math.max(DMIN, Math.min(DMAX, x)), hasta: desde, alLlegar: function () { S.ocupado = false; pintar(); } }); } }); }
      return;
    }
    var veta = S.p.vetas.indexOf(x);
    if (veta >= 0 && S.recogidas[veta]) veta = -1;
    S.usadas[k] = true; S.pos = x; S.hist.push({ k: k, desde: desde, veta: veta });
    if (veta >= 0) S.recogidas[veta] = true;
    P.sonido('paso');
    var fin = S.recogidas.every(Boolean);
    $('.ca-msg').textContent = num(desde) + ' ' + (c < 0 ? '+ (' + num(c) + ')' : '+ ' + c) + ' = ' + num(x) +
      (veta >= 0 ? ': a crystal vein!' : S.usadas.every(Boolean) && !fin ? '. No cards left: undo or restart.' : '.');
    var llegar = function () {
      S.ocupado = false;
      if (veta >= 0) { P.sonido('veta'); if (E()) E().resultado({ correcto: true, llego: x, debia: x }); }
      if (fin) ganar();
      pintar();
    };
    if (E()) { S.ocupado = true; E().viajar({ desde: desde, hasta: x, alLlegar: llegar }); setTimeout(function () { if (S.ocupado) llegar(); }, 2600); }
    else llegar();
    pintar();
  }

  function deshacer(silencio) {
    if (!S || S.ocupado || S.ganado || !S.hist.length) return;
    var h = S.hist.pop(), de = S.pos;
    S.usadas[h.k] = false; S.pos = h.desde;
    if (h.veta >= 0) { S.recogidas[h.veta] = false; if (E()) E().quitarPuerta(de); }
    if (E()) E().viajar({ desde: de, hasta: h.desde, alLlegar: function () {} });
    if (silencio !== true) { $('.ca-msg').textContent = 'Card back in your hand. The lift is at ' + m(S.pos) + '.'; pintar(); }
  }

  function ganar() {
    if (S.ganado) return;
    S.ganado = true; gemas++;
    $('.ca-msg').textContent = 'Every vein collected!';
    P.gemaCentro($('.ca-escena'), 'Gem ' + gemas + '!', function () { S.alGanar(); });
    if (E()) E().cav.particulas.estallido(320, E().cav.yOf(S.pos) - 40);
  }

  function pintar() {
    if (!S || !$('.ca')) return;
    Array.prototype.forEach.call(document.querySelectorAll('.ca-carta'), function (b) {
      var k = +b.getAttribute('data-i');
      b.disabled = S.usadas[k] || S.ganado;
      b.classList.toggle('is-usada', S.usadas[k]);
    });
    $('.ca-estado').innerHTML = 'Lift at <b>' + m(S.pos) + '</b> &middot; Veins: ' + S.p.vetas.map(function (v, k) {
      return '<span class="ca-veta' + (S.recogidas[k] ? ' is-hecha' : '') + '">◆ ' + m(v) + (S.recogidas[k] ? ' ✔︎' : '') + '</span>';
    }).join(' ');
    $('#deshacer').disabled = S.ganado || !S.hist.length;
  }

  /* Teclado: 1 a 6 juegan la carta; Z o Retroceso deshacen. */
  document.addEventListener('keydown', function (e) {
    if (!S || !$('.ca')) return;
    if (/^[1-9]$/.test(e.key)) { e.preventDefault(); jugarCarta(parseInt(e.key, 10) - 1); }
    else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') { e.preventDefault(); deshacer(); }
  });

  P.inicio({ rotulo: 'Prototype A', titulo: 'Jump cards',
    texto: 'Your hand has cards with numbers: + takes the lift up, − takes it down. Plan the order of your cards to land exactly on every crystal vein.',
    alJugar: empezar });
  window.__protoCartas = { estado: function () { return S; } };
})();
