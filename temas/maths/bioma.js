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
      var exp = { pos: op.pos == null ? -15 : op.pos, posAnim: 0, anim: M.sprites.animador(), rect: null };
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
          A: A, C: A,
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
          { x: POZO_X + SPR.lampara.x, y: exp.piso() + SPR.lampara.y, r: 85, c: '255,240,200', kind: 'lamp', ph: 0 },
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
        if (op.camaraFija == null) L.seguir(exp.piso() - 30);
      });
      L.capa('mundo', 60, function (bx, camI) {
        var a = exp.anim, img = SPR.codigo ? SPR[(a.alegria > 0 ? 'C' : 'A') + (a.parpadeo > 0 ? 'b' : '')] : SPR[a.alegria > 0 ? 'C' : 'A'];
        var piso = Math.round(exp.piso()) - camI;
        // En la plataforma solo salta hacia arriba (nunca se hunde en el piso).
        var r = M.sprites.dibujar(bx, img, POZO_X - SPR.ax, piso, a.sq, Math.min(0, a.rebote(L.time, L.opts.smooth)));
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
    }
  };
})(window.SAMSAN_BIOMAS = window.SAMSAN_BIOMAS || {});
