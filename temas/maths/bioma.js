/* ============================================================
   SAMSAN — BIOMA CAVERNA (materia Maths)
   Lo que el motor del mundo dibuja para la Caverna: el pozo de la
   mina con su castillete y su montacargas, la pared de pizarra, la
   roca calida que se pisa, cristales, antorchas y faroles, la
   superficie con cielo, el explorador de pie en la plataforma y el
   topo minero (compañero del bioma) en su hueco.

   Decision del 27 sep 2026 (panel de expertos): ningun personaje
   cuelga de una cuerda; se leia como una horca. El explorador viaja
   de pie en un montacargas abierto (plataforma con barandilla baja)
   y los cables van a la plataforma, nunca a la persona. La posicion
   en metros es el PISO de la plataforma.

   El motor (assets/mundo/) no conoce nada de esto: este archivo lo
   declara. Si llega arte procesado por tools/arte/ (window.SAMSAN_IMG),
   se usa; si no, todo se dibuja por codigo.

   Uso:
     SAMSAN_BIOMAS.caverna.cargar().then(function () {
       var cav = SAMSAN_BIOMAS.caverna.crear(L, { piel: '#E8B088', pos: -15 });
       cav.explorador.pos = -9;   // metros; la plataforma baja y la camara la sigue
     });
   ============================================================ */
(function (BIOMAS) {
  'use strict';
  var M = window.SAMSAN_MUNDO;

  var T = 32, COLS = 20, ROWS = 20, WH = ROWS * T;
  var MET = 12, SURF = 192;                   // px por metro; y del suelo (0 m)
  var POZO_X = 320, DMIN = -30, DMAX = 10;    // eje del pozo y del montacargas
  var yOf = function (d) { return SURF - d * MET; };
  /* Cabeza de la mascota de PixelLab (assets/img/mascota-*.png): centro en x
     y fila de la frente, donde se apoya el ala de un sombrero. */
  var CABEZA = { cx: 17.5, frente: 14 };
  /* Montacargas: plataforma de 52 px con barandilla baja de 16 px. */
  var PLAT = { ancho: 52, baranda: 16, piso: 4 };

  /* ---------- Mapa: el pozo y tres huecos laterales ---------- */
  function mapa() {
    var solid = [];
    for (var r = 0; r < ROWS; r++) { solid[r] = []; for (var c = 0; c < COLS; c++) solid[r][c] = r >= 6 && !(c >= 8 && c <= 11); }
    for (c = 8; c <= 11; c++) solid[19][c] = true;
    function carve(r0, r1, c0, c1) { for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) solid[r][c] = false; }
    carve(9, 11, 3, 7); carve(10, 10, 2, 2);
    carve(13, 15, 12, 16); carve(14, 14, 17, 17);
    carve(16, 17, 3, 7); carve(17, 17, 2, 2);
    return solid;
  }

  /* Piedras redondeadas repartidas por TODO el mapa (no por tile): las que
     cruzan el borde de una celda siguen en la vecina, asi no hay costuras.
     `dentro(x, y)` dice si el pixel pertenece a la capa. */
  function piedras(buf, dentro, semilla, dens, colores) {
    var r = M.rng(semilla), n = Math.round(buf.w * buf.h / (T * T) * dens);
    for (var k = 0; k < n; k++) {
      var cx = r() * buf.w, cy = r() * buf.h, rx = 7 + r() * 6, ry = 6 + r() * 5;
      for (var y = Math.max(0, cy - ry | 0); y < Math.min(buf.h, cy + ry + 1); y++) {
        for (var x = Math.max(0, cx - rx | 0); x < Math.min(buf.w, cx + rx + 1); x++) {
          if (!dentro(x, y)) continue;
          var nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, q = nx * nx + ny * ny;
          if (q > 1) continue;
          buf.set(x, y, colores(q, -(nx * 0.75 + ny * 0.9), r));
        }
      }
    }
  }

  /* ---------- Roca que se pisa (calida, saturada, mas clara) ---------- */
  function rocaGlobal(buf, solid, oros) {
    var C = M.PAL.roca, r = M.rng(77);
    var roca = function (x, y) { var f = solid[y / T | 0]; return !!(f && f[x / T | 0]); };
    for (var y = 0; y < buf.h; y++) for (var x = 0; x < buf.w; x++) if (roca(x, y)) buf.set(x, y, r() < 0.03 ? C[1] : C[2]);
    piedras(buf, roca, 91, 5.5, function (q, v, rn) {
      if (q > 0.8) return C[1];
      var col = v > 0.5 ? C[4] : v > -0.45 ? C[3] : C[2];
      return (v > 0.8 && rn() < 0.3) ? C[5] : col;
    });
    var g = M.rng(13);
    for (var k = 0; k < 60; k++) {                         // grietas
      var gx = g() * buf.w | 0, gy = g() * buf.h | 0, len = 5 + (g() * 6 | 0);
      for (var i = 0; i < len; i++) {
        if (roca(gx, gy)) buf.set(gx, gy, C[0]);
        gx += g() < 0.5 ? 1 : (g() < 0.5 ? -1 : 0); gy += g() < 0.6 ? 1 : 0;
      }
    }
    for (var rr = 0; rr < ROWS; rr++) for (var c = 0; c < COLS; c++) {
      if (solid[rr][c]) pepita(buf, c * T, rr * T, M.rng(rr * 97 + c * 13 + 5), oros);
    }
  }
  /* Pepita de oro incrustada (brilla con la luz): una de cada cuatro celdas. */
  function pepita(buf, ox, oy, r, oros) {
    if (r() >= 0.24) return;
    var px = 5 + (r() * 20 | 0), py = 5 + (r() * 20 | 0), G = M.PAL.oro;
    if (buf.a(ox + px + 1, oy + py + 1) === 0) return;
    [[0, 0, 1], [1, 0, 2], [2, 0, 3], [0, 1, 1], [1, 1, 2], [2, 1, 1], [1, 2, 0], [-1, 1, 0], [3, 1, 0]]
      .forEach(function (q) { buf.set(ox + px + q[0], oy + py + q[1], G[q[2]]); });
    oros.push({ x: ox + px + 1, y: oy + py });
  }

  /* Hoja de tiles de tools/arte/tiles.py: 16 mascaras x 4 variantes de 32 px.
     Mascara: 1 arriba, 2 derecha, 4 abajo, 8 izquierda (lados expuestos). */
  function pintorTiles(hoja) {
    var x = hoja.getContext('2d'), d = x ? x.getImageData(0, 0, hoja.width, hoja.height).data : null;
    var variantes = Math.max(1, Math.floor(hoja.height / T));
    return {
      pintar: function (buf, ox, oy, mascara, seed, oros) {
        if (!d) return;
        var v = seed % variantes;
        for (var y = 0; y < T; y++) for (var xx = 0; xx < T; xx++) {
          var i = ((v * T + y) * hoja.width + mascara * T + xx) * 4;
          if (!d[i + 3]) continue;
          var j = ((oy + y) * buf.w + ox + xx) * 4;
          buf.d[j] = d[i]; buf.d[j + 1] = d[i + 1]; buf.d[j + 2] = d[i + 2]; buf.d[j + 3] = 255;
        }
        pepita(buf, ox, oy, M.rng(seed), oros);
      }
    };
  }

  var ESQUINA = [4, 2, 1, 1];
  function terreno(solid, oros, tiles) {
    var buf = new M.Buf(M.W, WH);
    var isSolid = function (r, c) { return r < 0 ? false : (r >= ROWS || c < 0 || c >= COLS) ? true : solid[r][c]; };
    if (!tiles) rocaGlobal(buf, solid, oros);
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (!solid[r][c]) continue;
      var ox = c * T, oy = r * T;
      var t = !isSolid(r - 1, c), b = !isSolid(r + 1, c), l = !isSolid(r, c - 1), rr = !isSolid(r, c + 1);
      if (tiles) { tiles.pintar(buf, ox, oy, (t ? 1 : 0) | (rr ? 2 : 0) | (b ? 4 : 0) | (l ? 8 : 0), r * 97 + c * 13 + 5, oros); continue; }
      for (var y = 0; y < 4; y++) for (var x = 0; x < ESQUINA[y]; x++) {
        if (t && l) buf.clear(ox + x, oy + y);
        if (t && rr) buf.clear(ox + T - 1 - x, oy + y);
        if (b && l) buf.clear(ox + x, oy + T - 1 - y);
        if (b && rr) buf.clear(ox + T - 1 - x, oy + T - 1 - y);
      }
    }
    if (!tiles) M.outlinePass(buf, M.PAL.roca[5], M.PAL.roca[0], M.PAL.roca[4]);
    var rnd = M.rng(42), P = M.PAL.pasto;
    for (c = 0; c < COLS; c++) {                               // pasto de la superficie
      if (!solid[6][c]) continue;
      ox = c * T; oy = 6 * T;
      for (x = 0; x < T; x++) {
        if (!buf.a(ox + x, oy + 1)) continue;
        buf.set(ox + x, oy, P[3]); buf.set(ox + x, oy + 1, P[2]); buf.set(ox + x, oy + 2, P[2]);
        buf.set(ox + x, oy + 3, P[1]); buf.set(ox + x, oy + 4, rnd() < 0.5 ? P[1] : P[0]);
        if (rnd() < 0.5) buf.set(ox + x, oy + 5, P[0]);
        if (rnd() < 0.35) { var h = 1 + (rnd() * 4 | 0); for (var k = 1; k <= h; k++) buf.set(ox + x, oy - k, k === h ? P[3] : P[2]); }
        if (rnd() < 0.03) { buf.set(ox + x, oy - 3, rnd() < 0.5 ? '#FF8FB1' : '#FFE066'); buf.set(ox + x, oy - 2, P[1]); buf.set(ox + x, oy - 1, P[1]); }
      }
    }
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {       // goteras
      if (!solid[r][c] || isSolid(r + 1, c)) continue;
      var n = 2 + (rnd() * 3 | 0);
      for (k = 0; k < n; k++) {
        var gx = c * T + 4 + (rnd() * 24 | 0), gy = r * T + T, len = 1 + (rnd() * 3 | 0);
        if (!buf.a(gx, gy - 1)) continue;
        for (var j = 0; j < len; j++) buf.set(gx, gy + j, j === len - 1 ? M.PAL.roca[0] : M.PAL.roca[1]);
      }
    }
    return buf.canvas();
  }

  /* ---------- Pared del fondo (fria, oscura, sin numeros) ----------
     Sin numeros ni signos grabados: en un juego de numeros compiten con los
     instrumentos. Baja por todo el pozo (sin corte recto que parezca piso). */
  function pared(solid) {
    var buf = new M.Buf(M.W, WH), S = M.PAL.pizarra, r = M.rng(55);
    var muro = function (x, y) { var f = y / T | 0, c = x / T | 0; return f >= 6 && f < ROWS && !solid[f][c]; };
    for (var y = 0; y < buf.h; y++) for (var x = 0; x < buf.w; x++) if (muro(x, y)) buf.set(x, y, r() < 0.1 ? S[0] : S[1]);
    piedras(buf, muro, 57, 4.5, function (q, v) { return q > 0.82 ? S[0] : v > 0.55 ? S[3] : S[2]; });
    M.outlinePass(buf, S[3], S[0], null);
    return buf.canvas();
  }

  /* ---------- Props: castillete, cristales, antorchas, faroles ---------- */
  function cristal(buf, x, yb, pal, seed) {
    var r = M.rng(seed);
    [[0, 13, 4], [-5, 8, 3], [5, 9, 3], [-9, 5, 2]].forEach(function (q) {
      var hh = q[1] + (r() * 3 | 0);
      for (var j = 0; j < hh; j++) {
        var ww = Math.min(q[2], 1 + j);
        for (var i = 0; i < ww; i++) buf.set(x + q[0] + i - (ww >> 1), yb - hh + j, i === 0 ? pal[3] : i === ww - 1 ? pal[1] : pal[2]);
      }
    });
  }
  /* Linea gruesa de madera con luz a la izquierda y sombra a la derecha. */
  function viga(buf, x0, y0, x1, y1, Wd) {
    M.drawLine(buf, x0, y0, x1, y1, Wd[1], 3);
    M.drawLine(buf, x0, y0, x1, y1, Wd[2], 2);
    M.drawLine(buf, x0, y0, x1, y1, Wd[3], 1);
  }
  /* Castillete de mina en A: patas abiertas, travesaños bajos, guias del
     montacargas, techo a dos aguas con banderin y una rueda grande en el
     vertice. Es alto (sube por el cielo, sobre y = 0) para que el montacargas
     llegue a +10 m sin tocar la rueda. A la derecha, el torno con su cable.
     Se dibuja en su propio buffer desplazado CAST_OY px hacia arriba. */
  var CAST_OY = 140, APEX = -86;
  var RUEDA = { x: POZO_X, y: APEX + 12, r: 13 }, TORNO = { x: 452, y: 178 };
  function castillete() {
    var buf = new M.Buf(M.W, SURF + CAST_OY), Y = function (y) { return y + CAST_OY; };
    var Wd = M.PAL.madera, Lm = M.PAL.llama;
    viga(buf, 236, Y(SURF), 308, Y(APEX + 4), Wd); viga(buf, 404, Y(SURF), 332, Y(APEX + 4), Wd);
    var guiaIzq = POZO_X - PLAT.ancho / 2 - 6, guiaDer = POZO_X + PLAT.ancho / 2 + 5;
    var ancho = function (y) { return Math.round((SURF - y) * 72 / (SURF - APEX - 4)); };
    [0, 60, 120, 160].forEach(function (y) {                          // travesaños, fuera del recorrido
      var dx = ancho(y);
      buf.rect(236 + dx, Y(y), guiaIzq - (236 + dx), 3, Wd[2]); buf.rect(236 + dx, Y(y), guiaIzq - (236 + dx), 1, Wd[3]);
      buf.rect(guiaDer, Y(y), (404 - dx) - guiaDer, 3, Wd[2]); buf.rect(guiaDer, Y(y), (404 - dx) - guiaDer, 1, Wd[3]);
    });
    buf.rect(guiaIzq - 1, Y(RUEDA.y + RUEDA.r + 2), 2, SURF - RUEDA.y - RUEDA.r - 2, Wd[1]);   // guias
    buf.rect(guiaDer, Y(RUEDA.y + RUEDA.r + 2), 2, SURF - RUEDA.y - RUEDA.r - 2, Wd[1]);
    for (var j = 0; j < 12; j++) {                                    // techo a dos aguas
      buf.rect(POZO_X - 6 - j * 2, Y(APEX - 22 + j), 12 + j * 4, 1, j === 0 ? Wd[3] : (j % 3 === 0 ? Wd[1] : '#9A3B2C'));
    }
    buf.rect(POZO_X - 30, Y(APEX - 10), 60, 2, Wd[0]);
    buf.rect(POZO_X, Y(APEX - 38), 1, 16, '#5B5B6E');                  // mastil y banderin
    for (var f = 0; f < 6; f++) buf.rect(POZO_X + 1, Y(APEX - 37 + f), 10 - f * 1.6 | 0, 1, f < 2 ? Lm[3] : Lm[2]);
    for (var y = -RUEDA.r; y <= RUEDA.r; y++) for (var x = -RUEDA.r; x <= RUEDA.r; x++) {   // rueda
      var d = Math.hypot(x, y);
      if (d <= RUEDA.r && d > RUEDA.r - 2.6) buf.set(RUEDA.x + x, Y(RUEDA.y + y), d > RUEDA.r - 0.8 ? Wd[0] : (x + y < 0 ? Wd[3] : Wd[2]));
      else if (d <= RUEDA.r - 2.6 && (Math.abs(x) < 1 || Math.abs(y) < 1 || Math.abs(x - y) < 1 || Math.abs(x + y) < 1)) buf.set(RUEDA.x + x, Y(RUEDA.y + y), Wd[1]);
    }
    buf.rect(RUEDA.x - 2, Y(RUEDA.y - 2), 4, 4, '#8C8C9C');
    M.drawLine(buf, RUEDA.x + RUEDA.r - 1, Y(RUEDA.y), TORNO.x, Y(TORNO.y - 4), M.PAL.cuerda[1], 1);
    buf.rect(TORNO.x - 12, Y(TORNO.y - 2), 3, SURF - TORNO.y + 2, Wd[1]); buf.rect(TORNO.x + 10, Y(TORNO.y - 2), 3, SURF - TORNO.y + 2, Wd[1]);
    for (y = -6; y <= 6; y++) for (x = -9; x <= 9; x++) buf.set(TORNO.x + x, Y(TORNO.y + y), Math.abs(y) > 4 ? Wd[0] : (y < -1 ? Wd[3] : Wd[2]));
    buf.rect(TORNO.x + 13, Y(TORNO.y - 1), 6, 2, '#5B5B6E'); buf.rect(TORNO.x + 18, Y(TORNO.y - 1), 2, 7, '#5B5B6E');
    M.silhouetteOutline(buf, M.PAL.contorno);
    return buf.canvas();
  }
  function props(fuentes, img) {
    var buf = new M.Buf(M.W, WH), Wd = M.PAL.madera;
    cristal(buf, 182, 384, M.PAL.cian, 1); fuentes.push({ x: 182, y: 374, r: 70, c: '127,227,240', kind: 'crystal', ph: 0 });
    cristal(buf, 470, 512, M.PAL.magenta, 2); fuentes.push({ x: 470, y: 502, r: 70, c: '240,139,234', kind: 'crystal', ph: 2 });
    cristal(buf, 528, 512, M.PAL.cian, 3); fuentes.push({ x: 528, y: 504, r: 55, c: '127,227,240', kind: 'crystal', ph: 4 });
    cristal(buf, 112, 576, M.PAL.magenta, 4); fuentes.push({ x: 112, y: 566, r: 65, c: '240,139,234', kind: 'crystal', ph: 1 });
    // Mas cristales hacia lo hondo: lo profundo es mas valioso, no mas oscuro.
    cristal(buf, 300, 606, M.PAL.cian, 5); fuentes.push({ x: 300, y: 596, r: 60, c: '127,227,240', kind: 'crystal', ph: 3 });
    cristal(buf, 350, 606, M.PAL.magenta, 6); fuentes.push({ x: 350, y: 596, r: 60, c: '240,139,234', kind: 'crystal', ph: 5 });
    [[102, 318], [500, 452], [182, 542]].forEach(function (q) {   // la del hueco del topo, lejos de su cabeza
      if (!img.antorcha) { buf.rect(q[0] - 1, q[1], 3, 12, Wd[1]); buf.set(q[0] - 1, q[1], Wd[3]); buf.rect(q[0] - 3, q[1] + 11, 7, 2, '#5B5B6E'); }
      fuentes.push({ x: q[0], y: q[1] - 4, r: 100, c: '255,176,90', kind: 'torch', ph: q[0] });
    });
    // Faroles del pozo, con el soporte apoyado en la roca (x 255 | 384).
    [[256, 262, 1], [383, 336, -1], [256, 470, 1]].forEach(function (q) {
      buf.rect(q[2] > 0 ? q[0] : q[0] - 8, q[1] - 12, 9, 2, '#5B5B6E'); buf.rect(q[0] + q[2] * 7, q[1] - 12, 1, 4, '#5B5B6E');
      fuentes.push({ x: q[0] + q[2] * 7, y: q[1] - 1, r: 80, c: '255,200,112', kind: 'lantern', ph: q[1] });
    });
    M.silhouetteOutline(buf, M.PAL.contorno);
    return buf.canvas();
  }

  /* Plataforma del montacargas: piso de tablones y barandilla baja. Se
     dibuja una vez en un canvas (y delante del explorador, con realce).
     `PLAT_Y` = fila del piso dentro de ese canvas. */
  var PLAT_Y = PLAT.baranda + 1;
  function imagenPlataforma() {
    var Wd = M.PAL.madera, a = PLAT.ancho, h = PLAT.baranda;
    var b = new M.Buf(a + 2, h + PLAT.piso + 3), x0 = 1, piso = PLAT_Y;
    b.rect(x0, piso, a, PLAT.piso, Wd[2]); b.rect(x0, piso, a, 1, Wd[3]);
    for (var i = 6; i < a; i += 8) b.rect(x0 + i, piso + 1, 1, PLAT.piso - 1, Wd[1]);
    b.rect(x0, piso - h, 2, h, Wd[2]); b.rect(x0 + a - 2, piso - h, 2, h, Wd[2]);
    b.rect(x0, piso - h, a, 1, Wd[3]); b.rect(x0, piso - (h >> 1), a, 1, Wd[2]);
    M.silhouetteOutline(b, M.PAL.contorno);
    return b.canvas();
  }

  BIOMAS.caverna = {
    nombre: 'caverna',
    constantes: { T: T, MET: MET, SURF: SURF, POZO_X: POZO_X, DMIN: DMIN, DMAX: DMAX, altoMundo: WH, yOf: yOf, PLAT: PLAT },

    /* Carga el arte procesado (window.SAMSAN_IMG, data URIs que incrusta
       tools/build.py). Sin arte, resuelve al instante y todo se dibuja por
       codigo. Se llama antes de crear(). */
    cargar: function () {
      var I = window.SAMSAN_IMG || {}, src = {}, listo = {};
      [I.comun || {}, I.caverna || {}].forEach(function (o) { Object.keys(o).forEach(function (k) { src[k] = o[k]; }); });
      return Promise.all(Object.keys(src).map(function (k) {
        return M.sprites.cargar(src[k]).then(function (c) { listo[k] = c; }, function () { /* se dibuja por codigo */ });
      })).then(function () { BIOMAS.caverna.arte = listo; return listo; });
    },
    arte: {},

    crear: function (L, op) {
      op = op || {};
      var IMG = BIOMAS.caverna.arte || {};
      if (!op.tiles && IMG['tiles-roca']) op.tiles = pintorTiles(IMG['tiles-roca']);
      L.altoMundo = WH;
      L.camMin = -CAST_OY + 20;                  // se ve el cielo sobre la torre
      var solid = mapa(), oros = [], fuentes = [];

      M.capas.lejano(L, { fondo: ['#15142B', '#221F44'], colorA: '#2E3262', planoA: '#1B1C38', colorB: '#1C1D3E', planoB: '#141429',
        brillo: '127,227,240', brillosY: 380, ancla: 250, suelo: 600, techo: 376 });
      M.capas.superficie(L, { superficie: SURF, cielo: ['#5FA8F5', '#A9D8FF', '#FFDDB0'], sol: { x: 520, y: 58, factor: 0.12 } });
      M.capas.niebla(L, { color: '120,104,190', alfa: 0.07, velo: 0.06, desde: SURF + 60, hasta: WH, bandas: 5 });
      M.capas.imagen(L, 30, pared(solid));
      M.capas.imagen(L, 40, terreno(solid, oros, op.tiles || null));
      var CAST = castillete();
      L.capa('mundo', 32, function (bx, camI) { bx.drawImage(CAST, 0, -CAST_OY - camI); });
      M.capas.imagen(L, 45, props(fuentes, IMG));
      var decorado = [['cofre', 226, 384]].filter(function (d) { return IMG[d[0]]; });
      L.capa('mundo', 46, function (bx, camI) {
        decorado.forEach(function (d) {
          var im = IMG[d[0]], y = d[2] - im.height - camI;
          if (y > L.H || y + im.height < 0) return;
          bx.drawImage(im, Math.round(d[1] - im.width / 2), Math.round(y));
        });
      });
      L.capa('mundo', 50, function (bx, camI) {                   // llamas y faroles animados
        var F = M.PAL.llama;
        fuentes.forEach(function (Q) {
          var sy = Math.round(Q.y - camI); if (sy < -20 || sy > L.H + 20) return;
          if (Q.kind === 'torch') {
            var fr = (L.time * 10 + Q.ph) | 0, sway = L.opts.smooth ? [0, 1, 0, -1][fr % 4] : 0;
            [[1, 0], [3, 1], [3, 1], [5, 2], [5, 2], [5, 3], [3, 3]].forEach(function (w, j) {
              var yy = sy - 7 + j, xx = Q.x - (w[0] >> 1) + (j < 3 ? sway : 0);
              bx.fillStyle = F[0]; bx.fillRect(xx, yy, w[0], 1);
              if (w[0] > 2) { bx.fillStyle = F[Math.max(1, 3 - Math.min(2, w[1]))]; bx.fillRect(xx + 1, yy, w[0] - 2, 1); }
              if (w[0] > 4) { bx.fillStyle = F[j > 4 ? 2 : 3]; bx.fillRect(xx + 2, yy, 1, 1); }
            });
          } else if (Q.kind === 'lantern') {
            var x = Math.round(Q.x) - 3;
            bx.fillStyle = M.PAL.contorno; bx.fillRect(x - 1, sy - 6, 8, 12);
            bx.fillStyle = '#3B2F2F'; bx.fillRect(x, sy - 5, 6, 10);
            bx.fillStyle = '#FFD98A'; bx.fillRect(x + 1, sy - 3, 4, 6);
            bx.fillStyle = '#FFF4CF'; bx.fillRect(x + 2, sy - 2, 1, 3);
            bx.fillStyle = '#5B5B6E'; bx.fillRect(x + 2, sy - 9, 2, 3);
          }
        });
      });

      /* ---------- Explorador en el montacargas ---------- */
      /* `dx`, `dy`: desplazamiento del explorador respecto al centro de la
         plataforma (salta a una compuerta); `mira` < 0 lo voltea. */
      var exp = { pos: op.pos == null ? -15 : op.pos, posAnim: 0, anim: M.sprites.animador(), rect: null, dx: 0, dy: 0, mira: 1 };
      exp.posAnim = exp.pos;
      /* Con arte de PixelLab (assets/img/mascota-base.png, ya procesado): de
         frente, con el casco de minero de la Caverna. Sin arte: el explorador
         provisional por codigo. `lampara`: la luz del casco respecto a los pies. */
      function juego(tono) {
        if (!IMG['mascota-base']) {
          var j = M.sprites.juegoExplorador(tono);
          j.ax = 17; j.lampara = { x: -4, y: -42 }; j.codigo = true;
          return j;
        }
        var base = IMG['mascota-base'];
        if (tono) base = M.sprites.conPiel(base, tono);
        var casco = IMG['sombrero-minero'];
        var A = casco ? M.sprites.conSombrero(base, casco, CABEZA) : base;
        return {
          A: A, C: A, Aesp: M.sprites.espejo(A),
          ax: Math.round(base.width / 2) + (A.izq || 0),
          /* La lampara va 3,5 px a la derecha del centro de la cabeza. */
          lampara: { x: casco ? CABEZA.cx - base.width / 2 + 3.5 : 0, y: -A.height + (casco ? 8 : 6) }
        };
      }
      var SPR = juego(op.piel), PLATAFORMA = imagenPlataforma();
      exp.fijarPiel = function (tono) { SPR = juego(tono); };
      exp.sprites = function () { return SPR; };
      exp.celebrar = function () { exp.anim.celebrar(); };
      /* Piso de la plataforma en el mundo: la posicion que marca la regla. */
      exp.piso = function () { return yOf(exp.posAnim); };
      function alto() { return SPR.A.height; }
      function gancho() { return exp.piso() - alto() - 14; }

      /* Cable principal: de la rueda del castillete al gancho, sobre la cabeza. */
      L.capa('mundo', 35, function (bx, camI) {
        var R = M.PAL.cuerda, fin = Math.round(gancho());
        for (var y = RUEDA.y + RUEDA.r; y < fin; y++) {
          var sy = y - camI; if (sy < -2 || sy > L.H + 2) continue;
          var t = (y + Math.floor(y / 3)) % 3;
          bx.fillStyle = t === 0 ? R[0] : R[1]; bx.fillRect(POZO_X - 1, sy, 1, 1);
          bx.fillStyle = t === 1 ? R[0] : R[2]; bx.fillRect(POZO_X, sy, 1, 1);
        }
      });
      /* Cables en V del gancho a las esquinas de la barandilla, y el gancho. */
      L.capa('mundo', 58, function (bx, camI) {
        var g = Math.round(gancho()) - camI, p = Math.round(exp.piso()) - camI - PLAT.baranda, a = PLAT.ancho / 2 - 1;
        bx.fillStyle = M.PAL.cuerda[0];
        [-1, 1].forEach(function (lado) {
          var n = Math.max(1, p - g);
          for (var i = 0; i <= n; i++) bx.fillRect(Math.round(POZO_X + lado * a * i / n), g + i, 1, 1);
        });
        bx.fillStyle = M.PAL.contorno; bx.fillRect(POZO_X - 3, g - 3, 6, 5);
        bx.fillStyle = '#8C8C9C'; bx.fillRect(POZO_X - 2, g - 2, 4, 3);
        bx.fillStyle = '#E8E8F4'; bx.fillRect(POZO_X - 2, g - 2, 2, 1);
      });

      /* Topo minero, compañero de la Caverna. `lampara`: respecto a (x, pies). */
      var topoArte = IMG['companero-topo'];
      var topo = topoArte
        ? { x: 136, pies: 384, anim: M.sprites.animador(), img: topoArte, imgB: topoArte,
            lampara: { x: 32 - topoArte.width / 2, y: 6 - topoArte.height } }
        : { x: 140, pies: 384, anim: M.sprites.animador(), img: M.sprites.topo(false).canvas(), imgB: M.sprites.topo(true).canvas(),
            lampara: { x: M.sprites.TOPO.lamparaX - 13, y: -19 } };

      var luz = M.crearLuz(L, { ambiente: '#3A3358', superficie: SURF, pozo: { x: 252, w: 136, alto: 240 },
        rayos: { x: 262, n: 4, paso: 30 }, sol: { x: 520, y: 58, factor: 0.12 } });
      luz.fuentes = fuentes; luz.brillos = oros;
      luz.dinamicas = function () {
        return [
          { x: POZO_X + exp.dx + SPR.lampara.x * exp.mira, y: exp.piso() - exp.dy + SPR.lampara.y, r: 85, c: '255,240,200', kind: 'lamp', ph: 0 },
          { x: topo.x + topo.lampara.x, y: topo.pies + topo.lampara.y, r: 48, c: '255,240,200', kind: 'lamp', ph: 0 }
        ];
      };
      var part = M.crearParticulas(L, { semilla: 11 });
      part.ambientes.push(function (dt, P, pr) {
        if (pr() < dt * 9) P.emitir({ x: 262 + pr() * 116, y: SURF + pr() * 190, vx: (pr() - 0.5) * 4, vy: (pr() - 0.5) * 3, max: 4 + pr() * 4, c: '255,242,208', twinkle: pr() * 6 });
        fuentes.forEach(function (F) {
          if (F.kind === 'torch' && pr() < dt * 7) P.emitir({ x: F.x + (pr() - 0.5) * 3, y: F.y - 4, vx: (pr() - 0.5) * 8, vy: -18 - pr() * 16, g: -4, max: 0.8 + pr() * 0.8, c: '255,180,90', glow: true });
        });
        if (pr() < dt * 5) P.emitir({ x: 262 + pr() * 116, y: 400 + pr() * 170, vx: (pr() - 0.5) * 5, vy: -4 - pr() * 5, max: 3 + pr() * 3, c: '127,227,240', glow: true, twinkle: pr() * 6 });
      });

      L.alActualizar(function (dt) {
        var suave = L.opts.smooth;
        if (suave) exp.posAnim += (exp.pos - exp.posAnim) * Math.min(1, dt * 6); else exp.posAnim = exp.pos;
        if (Math.abs(exp.pos - exp.posAnim) < 0.01) exp.posAnim = exp.pos;
        var moviendo = Math.abs(exp.pos - exp.posAnim) > 0.06;
        exp.anim.actualizar(dt, moviendo, suave, function () { part.polvo(POZO_X - 20, exp.piso()); part.polvo(POZO_X + 20, exp.piso()); });
        topo.anim.actualizar(dt, false, suave);
        /* `enfoque` (opcional) encuadra otra cosa que el explorador, p. ej. todo un salto. */
        if (op.camaraFija == null) L.seguir(exp.enfoque ? exp.enfoque() : exp.piso() - 30);
      });
      /* Sombra en la pared detras del explorador (la proyecta su propia
         lampara): lo despega del cono de luz del pozo, tambien en grises
         (regla 9; tools/arte/prueba_grises.py). */
      L.capa('mundo', 59, function (bx, camI) {
        // Solo bajo tierra: contra el cielo claro, la sombra restaria contraste.
        var fondo = M.clamp((exp.piso() - SURF - 20) / 50, 0, 1);
        if (!fondo) return;
        var cx = POZO_X + exp.dx, cy = Math.round(exp.piso()) - camI - exp.dy - 38;
        var g = bx.createRadialGradient(cx, cy, 12, cx, cy, 58);
        g.addColorStop(0, 'rgba(8,5,18,' + (0.8 * fondo).toFixed(2) + ')'); g.addColorStop(1, 'rgba(8,5,18,0)');
        bx.fillStyle = g; bx.fillRect(cx - 58, cy - 58, 116, 116);
      });
      L.capa('mundo', 60, function (bx, camI) {
        var a = exp.anim, img = SPR.codigo ? SPR[(a.alegria > 0 ? 'C' : 'A') + (a.parpadeo > 0 ? 'b' : '')] : SPR[a.alegria > 0 ? 'C' : 'A'];
        if (exp.mira < 0 && SPR.Aesp) img = SPR.Aesp;
        var piso = Math.round(exp.piso()) - camI;
        var ax = exp.mira < 0 && SPR.Aesp ? img.width - SPR.ax : SPR.ax;
        // En la plataforma solo salta hacia arriba (nunca se hunde en el piso).
        var r = M.sprites.dibujar(bx, img, Math.round(POZO_X + exp.dx) - ax, piso, a.sq, Math.min(0, a.rebote(L.time, L.opts.smooth)) - Math.round(exp.dy));
        L.realzar(img, r);
        exp.rect = { x: r.x, y: r.y + camI, w: r.w, h: r.h };
        var ti = topo.anim.parpadeo > 0 ? topo.imgB : topo.img;
        L.realzar(ti, M.sprites.dibujar(bx, ti, topo.x - ti.width / 2, topo.pies - camI, 0, Math.min(0, topo.anim.rebote(L.time + 1.3, L.opts.smooth))));
        var px = POZO_X - Math.round(PLATAFORMA.width / 2), py = piso - PLAT_Y;
        bx.drawImage(PLATAFORMA, px, py);
        L.realzar(PLATAFORMA, { x: px, y: py, w: PLATAFORMA.width, h: PLATAFORMA.height });
      });
      M.capas.primerPlano(L, { color: '#0C0812', desde: SURF + 30 });

      if (op.camaraFija != null) L.fijarCam(op.camaraFija);
      else L.fijarCam(yOf(exp.pos) - 30 - L.H * 0.52);
      var mapaInfo = {
        T: T, filas: ROWS, columnas: COLS,
        roca: function (r, c) { return !!(solid[r] && solid[r][c]); },
        /* Pared de pizarra visible fuera del pozo abierto. */
        pared: function (r, c) { return r >= 6 && r < ROWS && !solid[r][c] && !(c >= 8 && c <= 11); }
      };
      return { L: L, luz: luz, particulas: part, explorador: exp, topo: topo, yOf: yOf, mapa: mapaInfo,
               plataforma: function () { return PLATAFORMA; }, PLAT_Y: PLAT_Y, constantes: this.constantes };
    },

    /* ---------- Escenario de la escena `line` (etapa 2) ----------
       El motor pide un escenario al bioma de la materia y solo toca su
       estado y su API; aqui se decide como se ve la mision en la mina:
       el montacargas es el valor, la regla va junto al pozo y cada
       respuesta se EJECUTA en el mundo (docs/temas/maths-y6-la-mina.md §3):
         viajar({ desde, hasta, alLlegar })  la plataforma hace el viaje;
         resultado({ correcto, llego, debia, tramoCerrado, topoCerca, hud })
           acierto: se abre una compuerta con un cristal, el explorador
           salta, lo recoge y lo guarda en el saco; al cerrar el tramo, el
           saco se vuelve la gema del contador. Error: contorno punteado de
           la plataforma y compuerta cerrada donde debia llegar.
         cavar(bandera)       el topo cava un tunel hacia la bandera;
         profundidad(n)       la luz baja con el tramo (n = tramos cerrados);
         nuevoNivel()         cierra las compuertas del nivel anterior.
       estado = { valor, fisica, bandera, error: { llego, debia }, ver }. */
    escenario: function (canvas) {
      var M = window.SAMSAN_MUNDO, I = M.inst, BI = BIOMAS.caverna;
      return BI.cargar().then(function () {
        var L = M.crearLienzo(canvas, { quietoSiReducido: false });
        var cav = BI.crear(L, { pos: -12 });
        var exp = cav.explorador, ctx = L.ctx, K = BI.constantes, IMG = BI.arte || {}, RULER_X = 362;
        var cfg = null, st = { valor: 0, fisica: 0, bandera: null, error: null, ver: true };
        var puertas = [], saco = 0, tunel = null, viaje = null, salto = null, rebote = 0;
        var AMB = ['#3A3358', '#332D4E', '#2C2744'];              // la luz baja por tramo (piso: prueba de grises)
        var suave = function () { return L.opts.smooth; };

        /* ---------- Compuertas (por codigo) ----------
           En la pared del fondo del pozo, a la izquierda de la plataforma,
           con el piso a la profundidad del cristal. */
        var PUERTA = { x: 257, w: 28, h: 34 };
        function lienzoPuerta(abierta) {
          var Wd = M.PAL.madera, b = new M.Buf(PUERTA.w, PUERTA.h), w = PUERTA.w, h = PUERTA.h;
          b.rect(0, 0, w, h, Wd[0]);
          if (abierta) {
            b.rect(3, 3, w - 6, h - 3, '#120D1C');
            b.rect(3, 3, 3, h - 3, Wd[2]); b.rect(3, 3, 1, h - 3, Wd[3]);          // la hoja abierta, de canto
          } else {
            for (var i = 0; i < 3; i++) { b.rect(3 + i * 7 + (i ? 1 : 0), 3, 6, h - 3, Wd[2]); b.rect(3 + i * 7 + (i ? 1 : 0), 3, 1, h - 3, Wd[3]); }
            b.rect(3, 9, w - 6, 3, '#5B5B6E'); b.rect(3, h - 11, w - 6, 3, '#5B5B6E');
            b.set(w - 7, h / 2 | 0, '#FFD34D');
          }
          b.rect(0, 0, w, 3, Wd[1]); b.rect(0, 0, 3, h, Wd[1]); b.rect(w - 3, 0, 3, h, Wd[1]);   // marco
          M.silhouetteOutline(b, M.PAL.contorno);
          return b.canvas();
        }
        var P_CERRADA = lienzoPuerta(false), P_ABIERTA = lienzoPuerta(true);
        var CRISTAL = (function () { var b = new M.Buf(22, 18); cristal(b, 11, 17, M.PAL.cian, 7); M.silhouetteOutline(b, M.PAL.contorno); return b.canvas(); })();
        /* Saco de la plataforma: crece con los cristales del tramo. */
        function dibujarSaco(bx, x, yPiso, n) {
          if (!n) return;
          var Wd = M.PAL.madera, w = 8 + n * 2, h = 7 + n * 2, x0 = Math.round(x - w / 2), y0 = Math.round(yPiso - h);
          bx.fillStyle = M.PAL.contorno; bx.fillRect(x0 - 1, y0 + 1, w + 2, h);
          bx.fillStyle = Wd[2]; bx.fillRect(x0, y0 + 2, w, h - 2);
          bx.fillStyle = Wd[3]; bx.fillRect(x0 + 1, y0 + 2, 2, h - 4);
          bx.fillStyle = Wd[1]; bx.fillRect(x0 + (w >> 1) - 2, y0, 4, 3);
          for (var i = 0; i < n; i++) { bx.fillStyle = '#7FE3F0'; bx.fillRect(x0 + 2 + i * 3, y0 + 1, 2, 2); }
        }

        /* Capa de compuertas y tunel del topo: detras del explorador. */
        L.capa('mundo', 47, function (bx, camI) {
          if (tunel) {                                      // tunel punteado desde la galeria del topo
            var n = Math.round(40 * Math.min(1, tunel.t));
            var x0 = 150, y0 = 372, x1 = 256, y1 = yOf(tunel.hasta) - 6;
            for (var i = 0; i < n; i++) {
              var f = i / 40, x = Math.round(x0 + (x1 - x0) * f), y = Math.round(y0 + (y1 - y0) * f + Math.sin(f * 9) * 3) - camI;
              bx.fillStyle = M.PAL.roca[0]; bx.fillRect(x - 1, y - 1, 3, 3);
              bx.fillStyle = M.PAL.roca[4]; bx.fillRect(x - 1, y - 1, 1, 1);
            }
          }
          puertas.forEach(function (P) {
            var y = Math.round(yOf(P.d)) - PUERTA.h - camI;
            if (y > L.H || y + PUERTA.h < 0) return;
            bx.drawImage(P.abierta ? P_ABIERTA : P_CERRADA, PUERTA.x, y);
            if (!P.abierta) return;
            if (P.cristal) bx.drawImage(CRISTAL, PUERTA.x + 4, y + PUERTA.h - CRISTAL.height);
            if (P.topo && IMG['companero-topo']) {          // el topo asomado: solo la cabeza, dentro del marco
              var T = IMG['companero-topo'];
              bx.save(); bx.beginPath(); bx.rect(PUERTA.x + 3, y + 3, PUERTA.w - 6, PUERTA.h - 3); bx.clip();
              bx.drawImage(T, PUERTA.x + PUERTA.w / 2 - T.width / 2 + 2, y + 6);
              bx.restore();
            }
          });
        });
        /* Saco, delante de la plataforma. */
        L.capa('mundo', 61, function (bx, camI) { dibujarSaco(bx, POZO_X + 16, Math.round(exp.piso()) - camI - 1, saco); });

        /* Luz de los cristales de las compuertas abiertas. */
        var dinBase = cav.luz.dinamicas;
        cav.luz.dinamicas = function () {
          var out = dinBase();
          puertas.forEach(function (P) { if (P.abierta && P.cristal) out.push({ x: PUERTA.x + 15, y: yOf(P.d) - 10, r: 46, c: '127,227,240', kind: 'crystal', ph: P.d }); });
          return out;
        };

        /* Camara: si caben, encuadra juntos la plataforma, la salida, el
           destino y el error; si no, sigue a la plataforma. */
        exp.enfoque = function () {
          if (bal) return L.altoMundo - L.H + L.H * 0.52;             // balanza: el fondo del pozo
          if (!cfg) return exp.piso() - 30;
          var P = cfg.pinta || {}, vals = [exp.posAnim];
          [P.inicio, P.anillo, st.bandera, st.error && st.error.debia].forEach(function (v) { if (v != null) vals.push(M.clamp(v, K.DMIN, K.DMAX)); });
          if (P.salto) vals.push(P.salto.desde, M.clamp(P.salto.hasta, K.DMIN, K.DMAX));
          if (P.tapa) vals.push(P.tapa.desde, P.tapa.hasta);
          var arriba = Math.min.apply(null, vals.map(yOf)) - 86, abajo = Math.max.apply(null, vals.map(yOf)) + 24;
          if (abajo - arriba > L.H - 10) return exp.piso() - 30;
          return (arriba + abajo) / 2 + L.H * 0.02;
        };

        L.alActualizar(function (dt) {
          if (!cfg) return;
          exp.pos = M.clamp(st.fisica, K.DMIN, K.DMAX);
          if (tunel && tunel.t < 1) tunel.t = suave() ? tunel.t + dt / 1.2 : 1;
          if (viaje) {                                       // el viaje termina cuando la plataforma llega
            viaje.t += dt;
            if (viaje.fase === 0 && (viaje.t > 0.35 || !suave())) { viaje.fase = 1; st.fisica = viaje.hasta; }
            if (viaje.fase === 1 && Math.abs(exp.posAnim - exp.pos) < 0.02) terminarViaje();
          }
          if (salto) {                                       // salto a la compuerta y regreso
            salto.t += suave() ? dt : 10;
            var ida = Math.min(1, salto.t / 0.35), vuelta = Math.max(0, Math.min(1, (salto.t - 0.9) / 0.35));
            var k = salto.t < 0.9 ? ida : 1 - vuelta, arco = salto.t < 0.9 ? ida : vuelta;
            exp.dx = salto.dx * k; exp.dy = Math.sin(Math.PI * arco) * 14; exp.mira = salto.t < 0.9 ? -1 : 1;
            if (!salto.recogido && salto.t >= 0.55) {
              salto.recogido = true; salto.puerta.cristal = false;
              cav.particulas.estallido(PUERTA.x + 15, yOf(salto.puerta.d) - 12);
            }
            if (salto.t >= 1.25) { exp.dx = 0; exp.dy = 0; exp.mira = 1; var fin = salto.fin; salto = null; if (fin) fin(); }
          }
          if (rebote > 0) { rebote -= dt; exp.dy = Math.max(0, Math.sin(rebote * 9) * 6 * rebote); if (rebote <= 0) exp.dy = 0; }
        });
        function terminarViaje() {
          var v = viaje; viaje = null;
          if (v.hasta > K.DMAX && suave()) { rebote = 0.8; cav.particulas.polvo(POZO_X, exp.piso()); }   // E1: tope del castillete
          if (v.alLlegar) v.alLlegar();
        }

        /* ---------- Instrumento: regla, marcas y pictorico tapado ---------- */
        function yDe(v) { return (yOf(v) - L.cam.y) * L.s; }
        L.capa('alta', 50, function () {
          if (!cfg || !st.ver || bal) return;
          var u = I.u(L), s = L.s, xR = RULER_X * s, xS = (POZO_X - PLAT.ancho / 2 - 14) * s, xB = xR - 16 * u;
          I.regla(ctx, L, { x: xR, yDe: yDe, min: cfg.min, max: cfg.max, unidad: cfg.unidad, cadaEtiqueta: 5, soloDecenas: cfg.soloDecenas });
          var P = cfg.pinta || {};
          if (P.inicio != null) I.bandera(ctx, xB, yDe(P.inicio) + 9 * u * 1.7, u * 1.7);
          if (P.anillo != null) I.anillo(ctx, xB - 14 * u, yDe(P.anillo), u);
          var ya = P.salto && yDe(P.salto.desde), yb = P.salto && yDe(M.clamp(P.salto.hasta, cfg.min, cfg.max));
          if (P.salto) I.salto(ctx, L, xS, ya, yb, P.tapa ? null : P.salto.texto, { punteado: P.salto.punteado });
          /* Pictorico: la franja del dato que falta queda en sombra (marcas y
             numeros) y una tarjeta "?" tapa la punta de la flecha. La franja
             no esta centrada en la respuesta: hay que sumar, no leer. */
          if (P.tapa) {
            var y0 = yDe(P.tapa.hasta), y1 = yDe(P.tapa.desde);
            ctx.save();
            ctx.fillStyle = 'rgba(18,12,28,0.94)';
            ctx.fillRect(xR - 2 * u, y0, 70 * u, y1 - y0);
            ctx.fillStyle = 'rgba(247,239,221,0.97)'; ctx.strokeStyle = I.colores.tinta; ctx.lineWidth = 2 * u;
            I.roundRect(ctx, xS - 12 * s, y0, 22 * s, y1 - y0, 6 * u); ctx.fill(); ctx.stroke();
            ctx.restore();
            I.pregunta(ctx, L, xS - 1 * s, (y0 + y1) / 2, 'center');
            // La etiqueta del salto va encima de todo y fuera de la franja: es el dato.
            if (P.salto && P.salto.texto) {
              var ym = (ya + yb) / 2;
              if (ym > y0 - 10 * u && ym < y1 + 10 * u) ym = Math.abs(ya - y0) > Math.abs(ya - y1) ? y0 - 12 * u : y1 + 12 * u;
              I.etiqueta(ctx, L, P.salto.texto, xS - 16 * s, ym, 'right', '#0E2A33', 'rgba(127,227,240,0.97)');
            }
          }
          if (st.bandera != null) I.estimacion(ctx, xB + 4 * u, yDe(st.bandera) + 10.5 * u * 1.5, u * 1.5);
          I.marcador(ctx, xR, yDe(M.clamp(exp.posAnim, cfg.min, cfg.max)), u);
        });
        /* Error visible: contorno punteado de la plataforma donde debia
           llegar y corchete con la diferencia. Nunca una silueta de persona. */
        L.capa('alta', 60, function () {
          if (!cfg || !st.ver || !st.error || bal) return;
          var u = I.u(L), s = L.s, E = st.error;
          var pulso = suave() ? 0.7 + 0.3 * Math.sin(L.time * 4) : 1;
          var yd = yDe(M.clamp(E.debia, cfg.min, cfg.max)), yl = yDe(M.clamp(E.llego, cfg.min, cfg.max));
          ctx.save(); ctx.globalAlpha = pulso;
          ctx.strokeStyle = I.colores.cian; ctx.lineWidth = Math.max(2 * L.dpr, 1.4 * s); ctx.setLineDash([4 * u, 3 * u]);
          var x0 = (POZO_X - PLAT.ancho / 2) * s, w = PLAT.ancho * s;
          ctx.strokeRect(x0, yd - PLAT.baranda * s, w, (PLAT.baranda + PLAT.piso) * s);
          ctx.beginPath(); ctx.moveTo(x0, yd); ctx.lineTo(x0 + w, yd); ctx.stroke();
          ctx.restore();
          var dif = E.debia - E.llego;
          if (dif) I.corchete(ctx, L, RULER_X * s - 20 * u, yl, yd, I.conSigno(dif) + ' ' + cfg.unidad);
        });

        /* El cristal va al saco de la plataforma; al cerrar un tramo, el saco
           se vuelve la gema del contador (una gema por tramo). */
        function guardarEnSaco(o) {
          saco++;
          if (o.tramoCerrado && o.hud) {
            var ys = yOf(exp.pos) - 8;
            cav.particulas.estallido(POZO_X + 16, ys);
            cav.particulas.gemaVuela(POZO_X + 16, ys, o.hud, function () {});
            saco = 0;
          }
        }
        /* ---------- Balanza del mercader (escena `fill`, modo balanza) ----------
           Por codigo, en el fondo del pozo y en la franja que se ve en un
           telefono (x 185 a 455). Modelo de la incognita que falta: el
           saco "?" espera al lado; el nino pone pesas en su lugar hasta que
           el brazo queda horizontal. Si acierta, el saco vuelve al plato y
           la balanza sigue nivelada: c + fijas = total.
           bal = { letra, fijas: [..], total, unidad, pesas: {10: n, 1: m},
                   figura: 'balanza' | 'barra', ver, mostrarDif, saco: bool } */
        var bal = null, angulo = 0;
        function sumaPesas() { return bal ? (bal.pesas[100] || 0) * 100 + (bal.pesas[10] || 0) * 10 + (bal.pesas[1] || 0) : 0; }
        function izquierda() { return bal.fijas.reduce(function (a, b) { return a + b; }, 0) + (bal.saco ? bal.valorSaco : sumaPesas()); }
        L.alActualizar(function (dt) {
          if (!bal) return;
          var dif = izquierda() - bal.total, obj = dif === 0 ? 0 : (dif > 0 ? 1 : -1) * Math.min(0.16, 0.05 + Math.abs(dif) * 0.004);
          if (bal.ciego && !bal.mostrarDif && !bal.saco) obj = 0;      // sin pista grafica: el brazo no avisa hasta confirmar
          angulo = suave() ? angulo + (obj - angulo) * Math.min(1, dt * 5) : obj;
        });
        function bloque(x, yb, w, h, fondo, borde, texto, L_, escala) {
          ctx.fillStyle = fondo; ctx.strokeStyle = borde; ctx.lineWidth = Math.max(1.5, I.u(L_));
          I.roundRect(ctx, x - w / 2, yb - h, w, h, Math.min(6, h / 4)); ctx.fill(); ctx.stroke();
          if (texto) I.etiqueta(ctx, L_, texto, x, yb - h / 2, 'center', '#2A211A', 'rgba(247,239,221,0.97)', escala || 0.85);
        }
        L.capa('alta', 55, function () {
          if (!bal || !bal.ver) return;
          var s = L.s, u = I.u(L), H = L.canvas.height, cx = POZO_X * s, un = ' ' + bal.unidad;
          if (bal.figura === 'barra') {                       // pictorico: modelo de barra
            var x0 = 200 * s, w = 240 * s, y0 = H * 0.46, alto = Math.max(30 * L.dpr, 26 * s);
            var conocido = bal.fijas.reduce(function (a, b) { return a + b; }, 0), wc = w * conocido / bal.total;
            ctx.save();
            ctx.fillStyle = 'rgba(247,239,221,0.97)'; ctx.strokeStyle = I.colores.tinta; ctx.lineWidth = 2 * u;
            I.roundRect(ctx, x0 - 10 * u, y0 - alto - 22 * u, w + 20 * u, alto * 2 + 36 * u, 8 * u); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#D19A5E'; ctx.fillRect(x0, y0 - alto - 12 * u, w, alto); ctx.strokeRect(x0, y0 - alto - 12 * u, w, alto);
            ctx.fillStyle = '#A6E06A'; ctx.fillRect(x0, y0, wc, alto); ctx.strokeRect(x0, y0, wc, alto);
            ctx.fillStyle = '#5C4A3B'; ctx.fillRect(x0 + wc, y0, w - wc, alto); ctx.strokeRect(x0 + wc, y0, w - wc, alto);
            ctx.restore();
            I.etiqueta(ctx, L, I.num(bal.total) + un, x0 + w / 2, y0 - alto / 2 - 12 * u, 'center', '#2A211A', 'rgba(247,239,221,0.97)');
            I.etiqueta(ctx, L, bal.fijas.map(I.num).join(' + ') + un, x0 + wc / 2, y0 + alto / 2, 'center', '#1F3D2A', 'rgba(247,239,221,0.97)', 0.85);
            I.pregunta(ctx, L, x0 + wc + (w - wc) / 2, y0 + alto / 2, 'center');
            return;
          }
          var piv = H * 0.40, base = H - 8 * u, med = 95 * s, cuelga = 44 * s, wp = 80 * s;
          var dx = Math.cos(angulo) * med, dy = Math.sin(angulo) * med;
          ctx.save();
          ctx.fillStyle = '#6B3D22'; ctx.strokeStyle = I.colores.tinta; ctx.lineWidth = 2 * u;
          ctx.fillRect(cx - 5 * u, piv, 10 * u, base - piv); ctx.strokeRect(cx - 5 * u, piv, 10 * u, base - piv);     // poste
          ctx.fillRect(cx - 30 * u, base - 6 * u, 60 * u, 6 * u); ctx.strokeRect(cx - 30 * u, base - 6 * u, 60 * u, 6 * u);
          ctx.beginPath(); ctx.moveTo(cx - dx, piv + dy); ctx.lineTo(cx + dx, piv - dy);                             // brazo
          ctx.lineWidth = 7 * u; ctx.strokeStyle = I.colores.tinta; ctx.stroke();
          ctx.lineWidth = 4 * u; ctx.strokeStyle = '#A0643A'; ctx.stroke();
          ctx.fillStyle = '#FFD34D'; ctx.beginPath(); ctx.arc(cx, piv, 6 * u, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2 * u; ctx.strokeStyle = I.colores.tinta; ctx.stroke();
          // Fiel: una aguja vertical; si el brazo esta horizontal, apunta a la marca del centro (forma, no color).
          ctx.beginPath(); ctx.moveTo(cx, piv); ctx.lineTo(cx + Math.sin(angulo) * 26 * u, piv - Math.cos(angulo) * 26 * u); ctx.lineWidth = 3 * u; ctx.stroke();
          ctx.fillStyle = I.colores.tinta; ctx.fillRect(cx - 1 * u, piv - 32 * u, 2 * u, 5 * u);
          ctx.restore();
          var platos = [{ x: cx - dx, y: piv + dy + cuelga }, { x: cx + dx, y: piv - dy + cuelga }];
          platos.forEach(function (p, i) {
            var ex = i ? cx + dx : cx - dx, ey = i ? piv - dy : piv + dy;
            ctx.save(); ctx.strokeStyle = '#5B5B6E'; ctx.lineWidth = 1.5 * u;
            ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(p.x - wp / 2 + 6 * u, p.y); ctx.moveTo(ex, ey); ctx.lineTo(p.x + wp / 2 - 6 * u, p.y); ctx.stroke();
            ctx.fillStyle = '#8C8C9C'; ctx.strokeStyle = I.colores.tinta; ctx.lineWidth = 2 * u;
            ctx.beginPath(); ctx.moveTo(p.x - wp / 2, p.y); ctx.lineTo(p.x + wp / 2, p.y); ctx.lineTo(p.x + wp / 2 - 8 * u, p.y + 7 * u); ctx.lineTo(p.x - wp / 2 + 8 * u, p.y + 7 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
          });
          // Derecha: el cajon con el total.
          bloque(platos[1].x, platos[1].y, 46 * s, 30 * s, '#A0643A', I.colores.tinta, I.num(bal.total) + un, L);
          // Izquierda: pesas fijas, y el saco o las pesas del nino en su lugar.
          var L0 = platos[0], xi = L0.x - wp / 2 + 4 * u;
          bal.fijas.forEach(function (f) { var w = 26 * s; bloque(xi + w / 2, L0.y, w, 18 * s, '#8C8C9C', I.colores.tinta, I.num(f), L, 0.75); xi += w + 3 * u; });
          if (bal.saco) bloque(xi + 14 * s, L0.y, 26 * s, 22 * s, '#D19A5E', I.colores.tinta, bal.letra, L, 0.9);
          else {
            var n100 = bal.pesas[100] || 0, n10 = bal.pesas[10] || 0, n1 = bal.pesas[1] || 0, fila = L0.y;
            if (n100) {                                        // pesas de 100: bloques grandes con su numero
              for (var c = 0; c < n100; c++) bloque(xi + 9 * s + (c % 3) * 19 * s, fila - Math.floor(c / 3) * 13 * s, 17 * s, 12 * s, '#3B3B4E', I.colores.tinta, c === 0 ? '100' : null, L, 0.6);
              fila -= Math.ceil(n100 / 3) * 13 * s;
            }
            for (var k = 0; k < n10; k++) { ctx.fillStyle = '#5B5B6E'; ctx.strokeStyle = I.colores.tinta; ctx.lineWidth = 1.5 * u;
              ctx.fillRect(xi + (k % 5) * 7 * s, fila - 14 * s - Math.floor(k / 5) * 15 * s, 6 * s, 14 * s);
              ctx.strokeRect(xi + (k % 5) * 7 * s, fila - 14 * s - Math.floor(k / 5) * 15 * s, 6 * s, 14 * s); }
            var xo = xi + Math.min(5, Math.max(1, n10)) * 7 * s + 2 * u;
            for (k = 0; k < n1; k++) { ctx.fillStyle = '#C0C0CC'; ctx.strokeStyle = I.colores.tinta; ctx.lineWidth = 1.2 * u;
              ctx.fillRect(xo + (k % 3) * 5 * s, fila - 5 * s - Math.floor(k / 3) * 6 * s, 4 * s, 5 * s);
              ctx.strokeRect(xo + (k % 3) * 5 * s, fila - 5 * s - Math.floor(k / 3) * 6 * s, 4 * s, 5 * s); }
            // El saco espera al lado, en el suelo, con su "?".
            bloque(cx - 150 * s, base, 26 * s, 22 * s, '#D19A5E', I.colores.tinta, bal.letra, L, 0.9);
          }
          if (bal.mostrarDif) {                               // al confirmar: cuanto sobra o falta (E4)
            var dif = izquierda() - bal.total;
            if (dif) I.etiqueta(ctx, L, I.conSigno(dif) + un, L0.x, L0.y + 20 * u, 'center', '#3A1410', 'rgba(255,158,138,0.97)');
          }
        });

        cav.L = L;
        var E = {
          L: L, cav: cav, estado: st,
          /* Configura el instrumento para una variante. */
          configurar: function (c) {
            cfg = c; bal = null;
            st.bandera = null; st.error = null; st.ver = c.ver !== false;
            st.valor = c.valor; st.fisica = c.fisica;
            viaje = null; tunel = null; rebote = 0;
            if (salto) { salto.puerta.cristal = false; if (salto.fin) salto.fin(); } salto = null; exp.dx = exp.dy = 0; exp.mira = 1;
            puertas = puertas.filter(function (P) { return P.abierta; });   // la compuerta del error se va
            exp.pos = exp.posAnim = M.clamp(c.fisica, K.DMIN, K.DMAX);
            L.fijarCam(yOf(exp.pos) - 30 - L.H * 0.52);
            if (!L.corriendo && L.iniciado) L.dibujar();
          },
          /* Marcas fijas: inicio (bandera), anillo, salto, tapa. La primera
             vez tras configurar, la camara salta al encuadre (sin paneo). */
          pintar: function (p) {
            if (!cfg) return;
            var primera = !cfg.pinta; cfg.pinta = p;
            if (primera) L.fijarCam(exp.enfoque() - L.H * 0.52);
          },
          viajar: function (o) {
            viaje = { desde: o.desde, hasta: o.hasta, alLlegar: o.alLlegar, t: 0, fase: 0 };
            st.fisica = o.desde;
            if (!suave()) { exp.pos = exp.posAnim = M.clamp(o.desde, K.DMIN, K.DMAX); }
          },
          resultado: function (o) {
            if (!o.correcto) {
              st.error = { llego: o.llego, debia: o.debia };
              puertas.push({ d: o.debia, abierta: false });
              return;
            }
            var P = { d: o.llego, abierta: true, cristal: true, topo: !!o.topoCerca };
            puertas = puertas.filter(function (Q) { return Math.abs(Q.d - P.d) >= 3; });
            puertas.push(P);
            exp.celebrar();
            var guardar = function () { guardarEnSaco(o); };
            if (suave()) salto = { t: 0, dx: PUERTA.x + PUERTA.w / 2 - POZO_X, puerta: P, recogido: false, fin: guardar };
            else { P.cristal = false; guardar(); }
          },
          /* Balanza (escena `fill`). c = { letra, fijas, total, unidad,
             figura: 'balanza'|'barra', ver, pesas }. */
          configurarBalanza: function (c) {
            cfg = { min: K.DMIN, max: K.DMAX, unidad: c.unidad, pinta: {} };
            bal = { letra: c.letra, fijas: c.fijas, total: c.total, unidad: c.unidad, pesas: c.pesas || { 10: 0, 1: 0 },
                    figura: c.figura || 'balanza', ver: c.ver !== false, mostrarDif: false, saco: false, valorSaco: 0, ciego: !!c.ciego };
            st.error = null; viaje = null; tunel = null; salto = null; exp.dx = exp.dy = 0; exp.mira = 1;
            st.fisica = -12; exp.pos = exp.posAnim = -12;
            angulo = 0;
            L.fijarCam(exp.enfoque() - L.H * 0.52);
            if (!L.corriendo && L.iniciado) L.dibujar();
          },
          pesas: function (p) { if (bal) { bal.pesas = p; bal.figura = 'balanza'; bal.ver = true; } },
          resultadoBalanza: function (o) {
            if (!bal) return;
            if (!o.correcto) { bal.mostrarDif = true; return; }
            bal.saco = true; bal.valorSaco = o.valor;                       // el saco vuelve y la balanza sigue nivelada
            exp.celebrar();
            cav.particulas.estallido(POZO_X - 95, yOf(exp.pos) + 120);
            guardarEnSaco(o);
          },
          cavar: function (bandera) { tunel = { hasta: M.clamp(bandera, K.DMIN, -2), t: 0 }; },
          profundidad: function (n) { cav.luz.cfg.ambiente = AMB[Math.max(0, Math.min(AMB.length - 1, n - 1))]; },   // n = tramos ya cerrados
          nuevoNivel: function () { puertas = []; saco = 0; tunel = null; cav.luz.cfg.ambiente = AMB[0]; },
          /* Remate del tema: el gran cristal del fondo ilumina toda la mina;
             todas las compuertas del pozo se abren con su cristal. */
          granCristal: function () {
            for (var d = -3; d >= -28; d -= 5) {
              var Q = puertas.filter(function (P) { return Math.abs(P.d - d) < 3; })[0];
              if (Q) { Q.abierta = true; Q.cristal = true; } else puertas.push({ d: d, abierta: true, cristal: true });
            }
            cav.luz.cfg.ambiente = '#7466A8';
            for (var k = 0; k < 6; k++) cav.particulas.estallido(POZO_X + (k - 3) * 28, yOf(-24 + k * 3));
            exp.celebrar();
          },
          dibujar: function () { L.dibujar(); }
        };
        /* Para tools/arte/prueba_grises.py: regiones de la escena en px CSS. */
        window.__samsanMina = {
          E: E,
          regiones: function () {
            var r = canvas.getBoundingClientRect(), k = r.width / L.W, cam = L.cam.y, e = exp.rect || { x: POZO_X - 20, y: yOf(exp.posAnim) - 60, w: 40, h: 60 };
            function rect(x, y, w, h) { return { x: r.left + x * k, y: r.top + (y - cam) * k, w: w * k, h: h * k }; }
            return { objeto: rect(e.x, e.y, e.w, e.h), anillo: rect(e.x - 6, e.y - 6, e.w + 12, e.h + 12) };
          }
        };
        return E;
      });
    }
  };
})(window.SAMSAN_BIOMAS = window.SAMSAN_BIOMAS || {});
