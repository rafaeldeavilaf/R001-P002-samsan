/* ============================================================
   SAMSAN — PROTOTIPO: GLOBO MINERO (solo local)
   Pilotas una capsula por cavernas. Con las flechas la impulsas hacia
   los lados (con inercia). Subir y bajar solo se puede con la CARGA:
   globos (negativos: tiran hacia arriba) y sacos de lastre (positivos:
   tiran hacia abajo). La carga neta es una suma con signo y decide la
   velocidad vertical: + baja, - sube, 0 flota. Las gemas pesan (+) y
   las corrientes de aire empujan con signo. Para terminar una caverna
   hay que recoger sus gemas y atracar en el muelle flotando en 0.
   Chocar solo detiene: no hay derrota.
   Datos: window.PROTO.globo (tools/gen/maths_y6_prototipos.py).
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN, $ = P.$, num = P.num, signo = P.signo;
  var M = window.SAMSAN_MUNDO;
  var cuevas = (window.PROTO && window.PROTO.globo) || [], gemasGanadas = 0;
  var S = null, L = null, part = null, imgExp = null, terreno = null, lienzoListo = false;
  var VEL = 18;                 // px/s de velocidad vertical por cada unidad de carga
  var ALTO_ARRIBA = 112, ALTO_ABAJO = 4, ALTO_SACOS = 20;  // caja de la capsula respecto a la base de la cesta

  /* ---------- Cueva: techo y piso interpolados ---------- */
  function borde(arr, x) {
    var p = S.c.paso, i = Math.max(0, Math.min(arr.length - 2, Math.floor(x / p))), f = Math.max(0, Math.min(1, x / p - i));
    var a = arr[i], b = arr[i + 1];
    return a + (b - a) * (f * f * (3 - 2 * f));
  }
  function techo(x) { return borde(S.c.techo, x); }
  function piso(x) { return borde(S.c.piso, x); }

  /* ---------- Carga ---------- */
  function corriente() {
    var c = null;
    S.c.corrientes.forEach(function (z) { if (S.x >= z.desde && S.x <= z.hasta) c = z; });
    return c;
  }
  function carga() {
    var n = 0;
    S.c.rack.forEach(function (v, i) { if (S.activo[i]) n += v; });
    S.gemas.forEach(function (g) { if (g.aBordo) n += g.valor; });
    var z = corriente();
    return n + (z ? z.empuje : 0);
  }
  function sacosActivos() { return S.c.rack.some(function (v, i) { return v > 0 && S.activo[i]; }); }
  function caja() {
    return { arriba: S.y - ALTO_ARRIBA, abajo: S.y + (sacosActivos() ? ALTO_SACOS : ALTO_ABAJO), izq: S.x - 22, der: S.x + 22 };
  }

  /* ---------- Fisica: un paso de dt segundos ---------- */
  function paso(dt) {
    if (!S || S.atracado) return;
    var n = carga();
    S.vx += S.empuje * 150 * dt;
    S.vx *= 1 - Math.min(1, dt * 1.4);
    S.vx = Math.max(-120, Math.min(120, S.vx));
    S.vy += (n * VEL - S.vy) * Math.min(1, dt * 1.6);
    S.x = Math.max(24, Math.min(S.c.largo - 24, S.x + S.vx * dt));
    S.y += S.vy * dt;
    // Choques con techo y piso: se detiene, sin dano.
    var t = Math.max(techo(S.x - 18), techo(S.x), techo(S.x + 18)), q = Math.min(piso(S.x - 18), piso(S.x), piso(S.x + 18));
    var k = caja();
    if (k.arriba < t) { S.y += t - k.arriba; if (S.vy < 0) { if (S.vy < -12) golpe(S.x, t); S.vy = 0; } }
    k = caja();
    if (k.abajo > q) { S.y -= k.abajo - q; if (S.vy > 0) { if (S.vy > 12) golpe(S.x, q); S.vy = 0; } }
    // Gemas: se recogen al tocarlas y pesan.
    k = caja();
    S.gemas.forEach(function (g) {
      if (g.aBordo || Math.abs(g.x - S.x) > 26 || g.y < k.arriba - 6 || g.y > k.abajo + 6) return;
      g.aBordo = true;
      P.sonido('veta');
      if (part) { var q = aLienzo(g.x, g.y); part.estallido(q.x, q.y); }
      aviso('Gem +' + g.valor + ' on board: the load is now ' + signo(carga()) + '.');
      pintarHud();
    });
    // Muelle: flotando en 0, quieto y dentro del muelle, con todas las gemas.
    var mu = S.c.muelle, enMuelle = Math.abs(S.x - mu.x) < mu.ancho / 2 && Math.abs(k.abajo - mu.y) < 16;
    if (enMuelle && S.gemas.every(function (g) { return g.aBordo; }) && carga() === 0 && Math.abs(S.vy) < 8 && Math.abs(S.vx) < 30) {
      S.quieto += dt;
      if (S.quieto > 0.8) atracar();
    } else S.quieto = 0;
    if (enMuelle && !S.avisoMuelle) {
      S.avisoMuelle = true;
      if (!S.gemas.every(function (g) { return g.aBordo; })) aviso('The dock is here, but you still need every gem.');
      else if (carga() !== 0) aviso('At the dock the load must be 0. Now it is ' + signo(carga()) + ': change balloons or sacks.');
    }
    if (!enMuelle) S.avisoMuelle = false;
    var cc = corriente();
    if (cc !== S.ultimaCorriente) { S.ultimaCorriente = cc; if (cc) aviso('Air current ' + signo(cc.empuje) + ': it joins your load.'); pintarHud(); }
    if (n !== S.ultimaCarga) { S.ultimaCarga = n; pintarHud(); }
  }
  function golpe(x, y) {
    var ahora = Date.now();
    if (ahora - (S.ultimoGolpe || 0) < 250) return;
    S.ultimoGolpe = ahora;
    P.sonido('cavar');
    if (part) { var q = aLienzo(x, y); part.polvo(q.x, q.y); }
  }
  function atracar() {
    S.atracado = true; gemasGanadas++;
    aviso('Docked at 0. Every gem delivered!');
    P.gemaCentro($('.gl-escena'), 'Gem ' + gemasGanadas + '!', function () { S.alGanar(); });
    pintarHud();
  }

  /* ---------- Controles ---------- */
  function alternar(i) {
    if (!S || S.atracado) return;
    S.activo[i] = !S.activo[i];
    P.sonido('paso');
    var v = S.c.rack[i];
    aviso((v < 0 ? (S.activo[i] ? 'Balloon ' + num(v) + ' up.' : 'Balloon ' + num(v) + ' down.') : (S.activo[i] ? 'Sack ' + signo(v) + ' hung.' : 'Sack ' + signo(v) + ' lifted.')) +
      ' Load: ' + signo(carga()) + '.');
    pintarHud();
  }
  var teclas = {};
  function leerEmpuje() { S && (S.empuje = (teclas.der ? 1 : 0) - (teclas.izq ? 1 : 0)); }
  document.addEventListener('keydown', function (e) {
    if (!S || !$('.gl')) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { teclas.izq = true; leerEmpuje(); e.preventDefault(); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { teclas.der = true; leerEmpuje(); e.preventDefault(); }
    else if (/^[1-9]$/.test(e.key) && !e.repeat) { var i = parseInt(e.key, 10) - 1; if (i < S.c.rack.length) { alternar(i); e.preventDefault(); } }
  });
  document.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { teclas.izq = false; leerEmpuje(); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { teclas.der = false; leerEmpuje(); }
  });

  /* ---------- HUD: la suma, siempre a la vista ---------- */
  function aviso(t) { var m = $('.gl-msg'); if (m) m.textContent = t; }
  function pintarHud() {
    if (!S || !$('.gl')) return;
    var terminos = [];
    S.c.rack.forEach(function (v, i) { if (S.activo[i]) terminos.push('<span class="gl-t ' + (v < 0 ? 'is-globo' : 'is-saco') + '">' + (v < 0 ? '(' + num(v) + ')' : signo(v)) + '</span>'); });
    S.gemas.forEach(function (g) { if (g.aBordo) terminos.push('<span class="gl-t is-gema">' + signo(g.valor) + '</span>'); });
    var z = corriente();
    if (z) terminos.push('<span class="gl-t is-aire">' + (z.empuje < 0 ? '(' + num(z.empuje) + ')' : signo(z.empuje)) + '</span>');
    var n = carga();
    var efecto = n > 0 ? '<b class="gl-efecto is-baja">&#9660; ' + signo(n) + ' sinks</b>' : n < 0 ? '<b class="gl-efecto is-sube">&#9650; ' + num(n) + ' rises</b>' : '<b class="gl-efecto is-flota">&#9644; 0 floats</b>';
    $('.gl-suma').innerHTML = '<span class="gl-rotulo">Load</span>' + (terminos.length ? terminos.join('<i> + </i>') : '<span class="gl-t">0</span>') + '<i> = </i>' + efecto;
    Array.prototype.forEach.call(document.querySelectorAll('.gl-item'), function (b) {
      var i = +b.getAttribute('data-i');
      b.setAttribute('aria-pressed', String(!!S.activo[i]));
      b.disabled = S.atracado;
    });
    var ab = S.gemas.filter(function (g) { return g.aBordo; }).length;
    $('.gl-gemas').textContent = ab + ' / ' + S.gemas.length;
  }

  /* ---------- Dibujo ---------- */
  /* Camara en zoom que sigue a la capsula en los dos ejes (coordenadas de la cueva). */
  var ZOOM = 1.5;
  function cam() {
    if (!S) return { x: 0, y: 0 };
    var w = M.W / ZOOM, h = M.H / ZOOM;
    return { x: Math.max(0, Math.min(S.c.largo - w, S.x - w * 0.4)), y: Math.max(0, Math.min(S.c.alto - h, S.y - 40 - h * 0.5)) };
  }
  /* Punto de la cueva en px del lienzo logico (para particulas). */
  function aLienzo(x, y) { var c = cam(); return { x: (x - c.x) * ZOOM, y: (y - c.y) * ZOOM }; }
  function crearTerreno(c) {
    var W = c.largo, H = c.alto, roca = new M.Buf(W, H), pared = new M.Buf(W, H), R = M.PAL.roca, Pz = M.PAL.pizarra, r = M.rng(c.largo);
    var t = [], p = [];
    for (var x = 0; x < W; x++) { t[x] = Math.round(borde(c.techo, x) + (r() - 0.5) * 3); p[x] = Math.round(borde(c.piso, x) + (r() - 0.5) * 3); }
    for (x = 0; x < W; x++) for (var y = 0; y < H; y++) {
      if (y < t[x] || y > p[x]) roca.set(x, y, r() < 0.04 ? R[1] : R[2]);
      else pared.set(x, y, r() < 0.12 ? Pz[0] : Pz[1]);
    }
    var n = Math.round(W * H / 1100);                       // piedras redondeadas
    for (var k = 0; k < n; k++) {
      var cx = r() * W, cy = r() * H, rx = 6 + r() * 7, ry = 5 + r() * 5, esRoca = cy < t[cx | 0] || cy > p[cx | 0];
      var buf = esRoca ? roca : pared;
      for (y = Math.max(0, cy - ry | 0); y < Math.min(H, cy + ry + 1); y++) for (x = Math.max(0, cx - rx | 0); x < Math.min(W, cx + rx + 1); x++) {
        if (!buf.a(x, y)) continue;
        var nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, q = nx * nx + ny * ny;
        if (q > 1) continue;
        var v = -(nx * 0.75 + ny * 0.9);
        buf.set(x, y, esRoca ? (q > 0.8 ? R[1] : v > 0.5 ? R[4] : v > -0.4 ? R[3] : R[2]) : (q > 0.82 ? Pz[0] : v > 0.5 ? Pz[3] : Pz[2]));
      }
    }
    M.outlinePass(roca, R[5], R[0], R[4]);
    var c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
    var x2 = c2.getContext && c2.getContext('2d');
    if (x2) { x2.drawImage(pared.canvas(), 0, 0); x2.drawImage(roca.canvas(), 0, 0); }
    return c2;
  }

  function dibujarCapsula(bx, cx, base) {
    var Wd = M.PAL.madera, k = 0;
    // Globos activos arriba (inflados, con su cuerda); inactivos, plegados en el borde.
    var globos = [];
    S.c.rack.forEach(function (v, i) { if (v < 0) globos.push({ v: v, activo: S.activo[i], i: i }); });
    var activos = globos.filter(function (g) { return g.activo; });
    activos.forEach(function (g, j) {
      var r = 7 + Math.abs(g.v) * 1.6, gx = cx + (j - (activos.length - 1) / 2) * 16, gy = base - 74 - r - (j % 2) * 6;
      bx.strokeStyle = '#D8B680'; bx.lineWidth = 1; bx.beginPath(); bx.moveTo(gx, gy + r); bx.lineTo(cx, base - 58); bx.stroke();
      bx.fillStyle = '#1E1426'; bx.beginPath(); bx.arc(gx, gy, r + 1, 0, Math.PI * 2); bx.fill();
      bx.fillStyle = '#2F9BB8'; bx.beginPath(); bx.arc(gx, gy, r, 0, Math.PI * 2); bx.fill();
      bx.fillStyle = '#7FE3F0'; bx.beginPath(); bx.arc(gx - r / 3, gy - r / 3, r / 3, 0, Math.PI * 2); bx.fill();
      g.pos = { x: gx, y: gy };
    });
    globos.forEach(function (g) { if (!g.activo) { bx.fillStyle = '#1D4E6B'; bx.fillRect(cx - 18 + (k++) * 5, base - 22, 4, 5); } });
    S._globos = activos;
    // Explorador de pie en la cesta.
    if (imgExp) bx.drawImage(imgExp, Math.round(cx - imgExp.width / 2), Math.round(base - imgExp.height - 2));
    // Cesta.
    bx.fillStyle = '#1E1426'; bx.fillRect(cx - 21, base - 22, 42, 23);
    bx.fillStyle = Wd[2]; bx.fillRect(cx - 20, base - 21, 40, 21);
    for (var s = -16; s < 20; s += 6) { bx.fillStyle = Wd[1]; bx.fillRect(cx + s, base - 21, 1, 21); }
    bx.fillStyle = Wd[3]; bx.fillRect(cx - 20, base - 21, 40, 2);
    // Gemas a bordo, en la cesta.
    var ab = S.gemas.filter(function (g) { return g.aBordo; });
    ab.forEach(function (g, j) { bx.fillStyle = '#1E1426'; bx.fillRect(cx - 16 + j * 8, base - 28, 7, 7); bx.fillStyle = '#7FE3F0'; bx.fillRect(cx - 15 + j * 8, base - 27, 5, 5); });
    // Sacos activos colgando debajo.
    var sacos = [];
    S.c.rack.forEach(function (v, i) { if (v > 0 && S.activo[i]) sacos.push(v); });
    sacos.forEach(function (v, j) {
      var sx = cx - 12 + j * 20, w = 8 + v * 2, h = 8 + v * 2;
      bx.strokeStyle = '#D8B680'; bx.beginPath(); bx.moveTo(sx, base); bx.lineTo(sx, base + 6); bx.stroke();
      bx.fillStyle = '#1E1426'; bx.fillRect(sx - w / 2 - 1, base + 5, w + 2, h + 2);
      bx.fillStyle = Wd[1]; bx.fillRect(sx - w / 2, base + 6, w, h);
      bx.fillStyle = Wd[2]; bx.fillRect(sx - w / 2 + 1, base + 7, 2, h - 2);
    });
    S._sacos = sacos;
  }

  function prepararLienzo() {
    if (lienzoListo) return;
    lienzoListo = true;
    var cv = $('#glMundo');
    L = M.crearLienzo(cv, { altoMundo: M.H });
    part = M.crearParticulas(L, { semilla: 7 });
    var I = M.inst;
    /* Todo lo del mundo se dibuja en coordenadas de la cueva con la camara
       en zoom (ZOOM): la capsula y las gemas se ven grandes. */
    function enMundo(bx, fn) {
      var c = cam();
      bx.save(); bx.setTransform(ZOOM, 0, 0, ZOOM, -Math.round(c.x * ZOOM), -Math.round(c.y * ZOOM));
      fn(bx); bx.restore();
    }
    L.capa('mundo', 10, function (bx) {                    // fondo lejano con brillos, con paralaje
      if (!S) return;
      var g = bx.createLinearGradient(0, 0, 0, M.H); g.addColorStop(0, '#15142B'); g.addColorStop(1, '#221F44');
      bx.fillStyle = g; bx.fillRect(0, 0, M.W, M.H);
      var o = cam().x * 0.35, rr = M.rng(3);
      for (var k = 0; k < 50; k++) { var x = ((rr() * 2400 - o) % 2400 + 2400) % 2400 - 200, y = 20 + rr() * 320; bx.fillStyle = 'rgba(127,227,240,0.35)'; bx.fillRect(x, y, 2, 2); }
    });
    L.capa('mundo', 20, function (bx) { if (S && terreno) enMundo(bx, function (b) { b.drawImage(terreno, 0, 0); }); });
    L.capa('mundo', 30, function (bx) {                    // corrientes, gemas y muelle
      if (!S) return;
      enMundo(bx, function (b) {
        S.c.corrientes.forEach(function (z) {
          var w = z.hasta - z.desde;
          b.fillStyle = z.empuje < 0 ? 'rgba(127,227,240,0.12)' : 'rgba(255,158,138,0.12)'; b.fillRect(z.desde, 0, w, M.H);
          for (var k = 0; k < 18; k++) {                    // rayas que se mueven en la direccion del empuje
            var fx = z.desde + (k * 37) % w, fy = ((L.time * 60 * (z.empuje < 0 ? -1 : 1) + k * 53) % M.H + M.H) % M.H;
            b.fillStyle = z.empuje < 0 ? 'rgba(200,245,255,0.6)' : 'rgba(255,210,200,0.6)'; b.fillRect(fx, fy, 1, 10);
          }
        });
        S.gemas.forEach(function (g) {
          if (g.aBordo) return;
          var x = Math.round(g.x), y = Math.round(g.y + Math.sin(L.time * 3 + g.x) * 2);
          b.fillStyle = '#1E1426'; b.fillRect(x - 7, y - 9, 14, 16);
          b.fillStyle = '#2F9BB8'; b.fillRect(x - 6, y - 8, 12, 14);
          b.fillStyle = '#7FE3F0'; b.fillRect(x - 5, y - 7, 5, 6);
          b.fillStyle = '#E8FEFF'; b.fillRect(x - 4, y - 6, 2, 2);
        });
        var mu = S.c.muelle;
        b.fillStyle = '#1E1426'; b.fillRect(mu.x - mu.ancho / 2 - 1, mu.y, mu.ancho + 2, 8);
        b.fillStyle = M.PAL.madera[2]; b.fillRect(mu.x - mu.ancho / 2, mu.y + 1, mu.ancho, 6);
        b.fillStyle = M.PAL.madera[3]; b.fillRect(mu.x - mu.ancho / 2, mu.y + 1, mu.ancho, 1);
        b.fillStyle = M.PAL.madera[1]; b.fillRect(mu.x - mu.ancho / 2 + 6, mu.y + 7, 4, M.H - mu.y); b.fillRect(mu.x + mu.ancho / 2 - 10, mu.y + 7, 4, M.H - mu.y);
        b.fillStyle = '#5B5B6E'; b.fillRect(mu.x + mu.ancho / 2 - 8, mu.y - 34, 3, 34);                 // farol del muelle
        b.fillStyle = '#FFD98A'; b.fillRect(mu.x + mu.ancho / 2 - 11, mu.y - 42, 9, 9);
      });
    });
    L.capa('mundo', 40, function (bx) { if (S) enMundo(bx, function (b) { dibujarCapsula(b, Math.round(S.x), Math.round(S.y)); }); });
    L.capa('alta', 50, function (ctx) {                    // numeros nitidos encima
      if (!S) return;
      var s = L.s, c = cam(), k = ZOOM * s;
      var X = function (x) { return (x - c.x) * k; }, Y = function (y) { return (y - c.y) * k; };
      S.gemas.forEach(function (g) { if (!g.aBordo) I.etiqueta(ctx, L, signo(g.valor), X(g.x), Y(g.y - 20), 'center', '#0E2A33', 'rgba(127,227,240,0.97)'); });
      S.c.corrientes.forEach(function (z) {
        var yz = Math.max(c.y + 16, 16);
        I.etiqueta(ctx, L, (z.empuje < 0 ? '▲ AIR ' : '▼ AIR ') + signo(z.empuje), X((z.desde + z.hasta) / 2), Y(yz), 'center', '#2A211A', 'rgba(247,239,221,0.95)');
      });
      var mu = S.c.muelle;
      I.etiqueta(ctx, L, 'DOCK: LOAD 0', X(mu.x), Y(mu.y + 22), 'center', '#1F3D2A', 'rgba(166,224,106,0.97)');
      (S._globos || []).forEach(function (g) { if (g.pos) I.etiqueta(ctx, L, num(g.v), X(g.pos.x), Y(g.pos.y), 'center', '#0E2A33', 'rgba(232,254,255,0.95)', 0.8); });
      (S._sacos || []).forEach(function (v, j) { I.etiqueta(ctx, L, signo(v), X(S.x - 12 + j * 20), Y(S.y + 13 + v), 'center', '#2A211A', 'rgba(247,239,221,0.95)', 0.8); });
      var g = ctx.createRadialGradient(X(S.x), Y(S.y - 40), 30 * k, X(S.x), Y(S.y - 40), 230 * k);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,5,18,0.5)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, L.canvas.width, L.canvas.height);
    });
    L.alActualizar(function (dt) { paso(dt); });
    L.iniciar();
  }

  /* ---------- Partida ---------- */
  function jugar(c, i, total, alGanar) {
    S = { c: c, i: i, x: c.salida.x, y: c.salida.y, vx: 0, vy: 0, empuje: 0, quieto: 0, atracado: false, alGanar: alGanar,
          activo: c.rack.map(function (_, k) { return c.activos.indexOf(k) >= 0; }),
          gemas: c.gemas.map(function (g) { return { x: g.x, y: g.y, valor: g.valor, aBordo: false }; }) };
    var nombres = ['First flight', 'Heavy gold', 'The chimney'];
    if (!$('.gl')) {
      $('#proto').innerHTML =
        '<div class="gl">' +
          '<section class="k-panel gl-panel">' +
            '<div class="ex-cabeza"><p class="k-rotulo gl-nombre"></p>' +
              '<div class="gl-meta"><span>Gems on board</span> <b class="gl-gemas"></b>' +
              '<div class="k-gemas" id="hud">' + P.gemaSVG(22) + '<span id="gems">0</span></div></div></div>' +
            '<p class="gl-objetivo">Collect every gem, then float at <b>0</b> on the dock. Balloons pull up (&minus;), sacks and gems pull down (+).</p>' +
            '<div class="gl-suma" aria-live="polite"></div>' +
          '</section>' +
          '<div class="k-escena gl-escena"><canvas id="glMundo" aria-label="Cave with the balloon capsule"></canvas></div>' +
          '<div class="gl-mando">' +
            '<button type="button" class="k-boton gl-mover" data-d="-1" aria-label="Push left">&#9664;</button>' +
            '<div class="gl-rack" role="group" aria-label="Balloons and sacks"></div>' +
            '<button type="button" class="k-boton gl-mover" data-d="1" aria-label="Push right">&#9654;</button>' +
          '</div>' +
          '<p class="k-mensaje gl-msg" aria-live="polite"></p>' +
        '</div>';
      Array.prototype.forEach.call(document.querySelectorAll('.gl-mover'), function (b) {
        var d = +b.getAttribute('data-d');
        var on = function (e) { e.preventDefault(); if (d < 0) teclas.izq = true; else teclas.der = true; leerEmpuje(); };
        var off = function () { if (d < 0) teclas.izq = false; else teclas.der = false; leerEmpuje(); };
        b.addEventListener('pointerdown', on);
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, off); });
      });
      prepararLienzo();
    }
    $('.gl-nombre').textContent = 'Cave ' + (i + 1) + ' of ' + total + ' · ' + (nombres[i] || '');
    $('#gems').textContent = gemasGanadas;
    var rack = $('.gl-rack');
    rack.innerHTML = c.rack.map(function (v, k) {
      return '<button type="button" class="gl-item ' + (v < 0 ? 'is-globo' : 'is-saco') + '" data-i="' + k + '" aria-pressed="false" aria-label="' +
        (v < 0 ? 'Balloon ' + num(v) : 'Sack ' + signo(v)) + '"><span class="gl-icono" aria-hidden="true"></span><b>' + (v < 0 ? num(v) : signo(v)) + '</b><span class="ca-tecla">' + (k + 1) + '</span></button>';
    }).join('');
    Array.prototype.forEach.call(rack.querySelectorAll('.gl-item'), function (b) { b.addEventListener('click', function () { alternar(+b.getAttribute('data-i')); }); });
    terreno = crearTerreno(c);
    aviso('Hold ◀ ▶ (or the arrow keys) to push sideways. Tap balloons and sacks (or keys 1 to ' + c.rack.length + ') to rise and sink.');
    if (L) L.redimensionar();
    pintarHud();
  }

  function empezar() {
    gemasGanadas = 0;
    if (P.mundo) P.mundo.L.detener();
    lienzoListo = false;
    P.explorador(P.piel).then(function (uri) { if (uri) M.sprites.cargar(uri).then(function (c) { imgExp = c; }); });
    P.partida(cuevas, jugar, function () {
      S = null;
      if (L) L.detener();
      P.final({ rotulo: 'Balloon miner', titulo: 'Every cave explored',
        texto: 'You balanced balloons, sacks and gems to fly the caves and docked at 0 every time.', gemas: gemasGanadas,
        otra: function () { empezar(); } });
    });
  }

  P.inicio({ rotulo: 'Prototype', titulo: 'Balloon miner',
    texto: 'Fly a balloon capsule through the caves. Balloons pull up (−), sacks and gems pull down (+). Your load decides if you rise, sink or float.',
    alJugar: empezar });
  window.__protoGlobo = { estado: function () { return S; }, paso: paso, carga: function () { return S ? carga() : null; }, alternar: alternar };
})();
