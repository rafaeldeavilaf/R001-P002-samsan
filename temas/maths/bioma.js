/* ============================================================
   SAMSAN — BIOMA CAVERNA (materia Maths)
   Lo que el motor del mundo dibuja para la Caverna: el pozo de la
   mina con su cuerda, la pared de pizarra con fosiles numericos,
   la roca calida que se pisa, cristales, antorchas y faroles, la
   superficie con cielo, el explorador en la cuerda y el topo minero
   (compañero del bioma) en su hueco.

   El motor (assets/mundo/) no conoce nada de esto: este archivo lo
   declara. Si llega arte procesado por tools/arte/ (window.SAMSAN_IMG),
   se usa; si no, todo se dibuja por codigo como en la muestra aprobada
   (docs/referencia/muestra-estilo.html).

   Uso:
     var cav = SAMSAN_BIOMAS.caverna.crear(L, { piel: '#E8B088' });
     cav.explorador.pos = -15;   // metros; la camara lo sigue
   ============================================================ */
(function (BIOMAS) {
  'use strict';
  var M = window.SAMSAN_MUNDO;

  var T = 32, COLS = 20, ROWS = 20, WH = ROWS * T;
  var MET = 12, SURF = 192;                   // px por metro; y del suelo (0 m)
  var ROPE_X = 320, DMIN = -30, DMAX = 10;
  var yOf = function (d) { return SURF - d * MET; };

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

  /* ---------- Roca que se pisa (calida, saturada) ----------
     Provisional por codigo. Con arte, cada tile sale de tools/arte/tiles.py. */
  function rocaTile(buf, ox, oy, seed, oros) {
    var r = M.rng(seed), C = M.PAL.roca;
    for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) buf.set(ox + x, oy + y, r() < 0.1 ? C[1] : C[2]);
    var n = 3 + (r() * 2 | 0);
    for (var k = 0; k < n; k++) {
      var cx = r() * T, cy = r() * T, rx = 7 + r() * 6, ry = 6 + r() * 5;
      for (y = Math.max(0, cy - ry | 0); y < Math.min(T, cy + ry + 1); y++) {
        for (x = Math.max(0, cx - rx | 0); x < Math.min(T, cx + rx + 1); x++) {
          var nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, q = nx * nx + ny * ny;
          if (q > 1) continue;
          var col;
          if (q > 0.8) col = C[1];
          else {
            var v = -(nx * 0.75 + ny * 0.9);
            col = v > 0.55 ? C[4] : v > -0.35 ? C[3] : C[2];
            if (v > 0.8 && r() < 0.3) col = C[5];
          }
          buf.set(ox + x, oy + y, col);
        }
      }
    }
    var grietas = 1 + (r() * 2 | 0);
    for (k = 0; k < grietas; k++) {
      var gx = r() * T | 0, gy = r() * T | 0, len = 5 + (r() * 6 | 0);
      for (var i = 0; i < len; i++) {
        buf.set(ox + gx, oy + gy, C[0]);
        gx += r() < 0.5 ? 1 : (r() < 0.5 ? -1 : 0); gy += r() < 0.6 ? 1 : 0;
        if (gx < 0 || gx >= T || gy >= T) break;
      }
    }
    pepita(buf, ox, oy, r, oros);
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
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (!solid[r][c]) continue;
      var ox = c * T, oy = r * T;
      var t = !isSolid(r - 1, c), b = !isSolid(r + 1, c), l = !isSolid(r, c - 1), rr = !isSolid(r, c + 1);
      if (tiles) { tiles.pintar(buf, ox, oy, (t ? 1 : 0) | (rr ? 2 : 0) | (b ? 4 : 0) | (l ? 8 : 0), r * 97 + c * 13 + 5, oros); continue; }
      rocaTile(buf, ox, oy, r * 97 + c * 13 + 5, oros);
      for (var y = 0; y < 4; y++) for (var x = 0; x < ESQUINA[y]; x++) {
        if (t && l) buf.clear(ox + x, oy + y);
        if (t && rr) buf.clear(ox + T - 1 - x, oy + y);
        if (b && l) buf.clear(ox + x, oy + T - 1 - y);
        if (b && rr) buf.clear(ox + T - 1 - x, oy + T - 1 - y);
      }
    }
    if (!tiles) M.outlinePass(buf, M.PAL.roca[5], M.PAL.roca[0], M.PAL.roca[4]);
    var rnd = M.rng(42), P = M.PAL.pasto;
    for (c = 0; c < COLS; c++) {
      if (!solid[6][c]) continue;
      ox = c * T; oy = 6 * T;
      for (x = 0; x < T; x++) {
        if (!buf.a(ox + x, oy + 1)) continue;
        buf.set(ox + x, oy, P[3]); buf.set(ox + x, oy + 1, P[2]); buf.set(ox + x, oy + 2, P[1]);
        if (rnd() < 0.5) buf.set(ox + x, oy + 3, P[1]);
        if (rnd() < 0.2) buf.set(ox + x, oy + 4, P[0]);
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

  /* ---------- Pared del fondo (fria, oscura) con fosiles numericos ---------- */
  var GLIFOS = {
    '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'],
    '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
    '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'], '8': ['111', '101', '111', '101', '111'],
    '9': ['111', '101', '111', '001', '111'], '+': ['000', '010', '111', '010', '000'], '-': ['000', '000', '111', '000', '000'],
    '=': ['000', '111', '000', '111', '000'], 'tri': ['00100', '01010', '10001', '11111', '00000'], 'sq': ['1111', '1001', '1001', '1111', '0000']
  };
  function glifo(buf, ch, x, y, col, sombra) {
    GLIFOS[ch].forEach(function (row, j) {
      row.split('').forEach(function (v, i) {
        if (v !== '1') return;
        buf.rect(x + i * 2 + 1, y + j * 2 + 1, 2, 2, sombra);
        buf.rect(x + i * 2, y + j * 2, 2, 2, col);
      });
    });
  }
  function pared(solid) {
    var buf = new M.Buf(M.W, WH), S = M.PAL.pizarra, keys = Object.keys(GLIFOS);
    var hueco = function (r, c) { return c >= 8 && c <= 11 && r >= 12 && r <= 17; };
    for (var r = 6; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (solid[r][c] || hueco(r, c)) continue;
      var ox = c * T, oy = r * T, rr = M.rng(r * 131 + c * 17);
      for (var y = 0; y < T; y++) for (var x = 0; x < T; x++) buf.set(ox + x, oy + y, rr() < 0.12 ? S[0] : S[1]);
      var n = 3 + (rr() * 2 | 0);
      for (var k = 0; k < n; k++) {
        var cx = rr() * T, cy = rr() * T, rx = 7 + rr() * 6, ry = 5 + rr() * 5;
        for (y = Math.max(0, cy - ry | 0); y < Math.min(T, cy + ry + 1); y++) for (x = Math.max(0, cx - rx | 0); x < Math.min(T, cx + rx + 1); x++) {
          var nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, q = nx * nx + ny * ny;
          if (q > 1) continue;
          var v = -(nx * 0.75 + ny * 0.9);
          buf.set(ox + x, oy + y, q > 0.82 ? S[0] : v > 0.55 ? S[3] : S[2]);
        }
      }
      if (rr() < 0.22) glifo(buf, keys[rr() * keys.length | 0], ox + 6 + (rr() * 10 | 0), oy + 6 + (rr() * 10 | 0), S[4], S[0]);
    }
    M.outlinePass(buf, S[3], S[0], null);
    return buf.canvas();
  }

  /* ---------- Props: polea, cristales, antorchas, faroles ---------- */
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
  function props(fuentes, img) {
    var buf = new M.Buf(M.W, WH), Wd = M.PAL.madera;
    buf.rect(248, 36, 6, 158, Wd[1]); buf.rect(248, 36, 2, 158, Wd[2]);
    buf.rect(386, 36, 6, 158, Wd[1]); buf.rect(386, 36, 2, 158, Wd[2]);
    buf.rect(242, 32, 156, 7, Wd[2]); buf.rect(242, 32, 156, 2, Wd[3]); buf.rect(242, 37, 156, 2, Wd[1]);
    for (var i = 0; i < 26; i++) { buf.set(254 + i, 70 - i, Wd[1]); buf.set(255 + i, 70 - i, Wd[2]); buf.set(386 - i, 70 - i, Wd[1]); buf.set(385 - i, 70 - i, Wd[2]); }
    for (var y = -10; y <= 10; y++) for (var x = -10; x <= 10; x++) {
      var d = Math.hypot(x, y);
      if (d <= 10 && d > 7.5) buf.set(ROPE_X + x, 50 + y, d > 9.2 ? Wd[0] : (x + y < 0 ? Wd[3] : Wd[2]));
      else if (d <= 7.5 && (Math.abs(x) < 1 || Math.abs(y) < 1 || Math.abs(x - y) < 1 || Math.abs(x + y) < 1)) buf.set(ROPE_X + x, 50 + y, Wd[1]);
    }
    buf.rect(ROPE_X - 2, 48, 4, 4, '#8C8C9C');
    cristal(buf, 182, 384, M.PAL.cian, 1); fuentes.push({ x: 182, y: 374, r: 70, c: '127,227,240', kind: 'crystal', ph: 0 });
    cristal(buf, 470, 512, M.PAL.magenta, 2); fuentes.push({ x: 470, y: 502, r: 70, c: '240,139,234', kind: 'crystal', ph: 2 });
    cristal(buf, 528, 512, M.PAL.cian, 3); fuentes.push({ x: 528, y: 504, r: 55, c: '127,227,240', kind: 'crystal', ph: 4 });
    cristal(buf, 112, 576, M.PAL.magenta, 4); fuentes.push({ x: 112, y: 566, r: 65, c: '240,139,234', kind: 'crystal', ph: 1 });
    [[130, 322], [500, 452], [182, 542]].forEach(function (q) {
      if (!img.antorcha) { buf.rect(q[0] - 1, q[1], 3, 12, Wd[1]); buf.set(q[0] - 1, q[1], Wd[3]); buf.rect(q[0] - 3, q[1] + 11, 7, 2, '#5B5B6E'); }
      fuentes.push({ x: q[0], y: q[1] - 4, r: 100, c: '255,176,90', kind: 'torch', ph: q[0] });
    });
    [[258, 262, 1], [382, 336, -1], [258, 470, 1]].forEach(function (q) {
      buf.rect(q[2] > 0 ? q[0] : q[0] - 8, q[1] - 12, 9, 2, '#5B5B6E'); buf.rect(q[0] + q[2] * 7, q[1] - 12, 1, 4, '#5B5B6E');
      fuentes.push({ x: q[0] + q[2] * 7, y: q[1] - 1, r: 80, c: '255,200,112', kind: 'lantern', ph: q[1] });
    });
    M.silhouetteOutline(buf, M.PAL.contorno);
    return buf.canvas();
  }

  BIOMAS.caverna = {
    nombre: 'caverna',
    constantes: { T: T, MET: MET, SURF: SURF, ROPE_X: ROPE_X, DMIN: DMIN, DMAX: DMAX, altoMundo: WH, yOf: yOf },

    /* Carga el arte procesado (window.SAMSAN_IMG.caverna, data URIs que
       incrusta tools/build.py). Sin arte, resuelve al instante y todo se
       dibuja por codigo. Se llama antes de crear(). */
    cargar: function () {
      var I = window.SAMSAN_IMG || {}, src = {}, listo = {};
      [I.comun || {}, I.caverna || {}].forEach(function (o) { Object.keys(o).forEach(function (k) { src[k] = o[k]; }); });
      var claves = Object.keys(src);
      return Promise.all(claves.map(function (k) {
        return M.sprites.cargar(src[k]).then(function (c) { listo[k] = c; }, function () { /* se dibuja por codigo */ });
      })).then(function () { BIOMAS.caverna.arte = listo; return listo; });
    },
    arte: {},

    crear: function (L, op) {
      op = op || {};
      var IMG = BIOMAS.caverna.arte || {};
      if (!op.tiles && IMG['tiles-roca']) op.tiles = pintorTiles(IMG['tiles-roca']);
      L.altoMundo = WH;
      var solid = mapa(), oros = [], fuentes = [];

      M.capas.lejano(L, { fondo: ['#15142B', '#221F44'], colorA: '#2E3262', planoA: '#1B1C38', colorB: '#1C1D3E', planoB: '#141429',
        brillo: '127,227,240', brillosY: 380, ancla: 250, suelo: 600, techo: 376 });
      M.capas.superficie(L, { superficie: SURF, cielo: ['#5FA8F5', '#A9D8FF', '#FFDDB0'], sol: { x: 520, y: 58, factor: 0.12 } });
      M.capas.niebla(L, { color: '120,104,190', alfa: 0.09, velo: 0.1, desde: SURF + 60, hasta: WH, bandas: 5 });
      M.capas.imagen(L, 30, pared(solid));
      L.capa('mundo', 35, function (bx, camI) {                   // cuerda
        var R = M.PAL.cuerda;
        for (var y = 59; y < 608; y++) {
          var sy = y - camI; if (sy < -2 || sy > L.H + 2) continue;
          var t = (y + Math.floor(y / 3)) % 3;
          bx.fillStyle = t === 0 ? R[0] : R[1]; bx.fillRect(ROPE_X - 1, sy, 1, 1);
          bx.fillStyle = t === 1 ? R[0] : R[2]; bx.fillRect(ROPE_X, sy, 1, 1);
        }
      });
      M.capas.imagen(L, 40, terreno(solid, oros, op.tiles || null));
      M.capas.imagen(L, 45, props(fuentes, IMG));
      var decorado = [['carretilla', 150, SURF], ['cofre', 226, 384]].filter(function (d) { return IMG[d[0]]; });
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

      /* ---------- Personajes ---------- */
      var exp = { pos: op.pos == null ? -15 : op.pos, posAnim: 0, trepa: 0, ultimo: 0, anim: M.sprites.animador() };
      exp.posAnim = exp.ultimo = exp.pos;
      /* Con arte de PixelLab (assets/img/mascota-*.png, ya procesado): pose de
         frente en reposo y al celebrar, de espalda al trepar (volteada cada
         medio metro: mano sobre mano), con el casco de minero de la Caverna.
         Sin arte: el explorador provisional por codigo. */
      function juego(tono) {
        if (!IMG['mascota-base']) {
          var j = M.sprites.juegoExplorador(tono), E = M.sprites.EXPLORADOR;
          j.ax = E.manoX + 1; j.cy = E.cinturaY + 1; j.lampara = { x: -10, y: -26 }; j.codigo = true;
          return j;
        }
        var base = IMG['mascota-base'], esp = IMG['mascota-espalda'] || base;
        if (tono) { base = M.sprites.conPiel(base, tono); esp = M.sprites.conPiel(esp, tono); }
        var casco = IMG['sombrero-minero'];
        var A = casco ? M.sprites.conSombrero(base, M.sprites.espejo(casco), -1, -0.35) : base;
        var B = casco ? M.sprites.conSombrero(esp, casco, -1, -0.35) : esp;
        var arriba = A.arriba || 0;
        return {
          A: A, B: B, B2: M.sprites.espejo(B), C: A,
          fantasma: M.sprites.silueta(A, [127, 227, 240]),
          ax: Math.round(A.width / 2), cy: 38 + arriba,              // la cuerda pasa por el centro; cinturon a 38 px
          lampara: { x: -9, y: -38 - arriba + (casco ? 10 : 6) }     // lampara del casco, respecto al cinturon
        };
      }
      var SPR = juego(op.piel);
      exp.fijarPiel = function (tono) { SPR = juego(tono); };
      exp.sprites = function () { return SPR; };
      exp.celebrar = function () { exp.anim.celebrar(); };
      exp.cinturaY = function () { return yOf(exp.posAnim); };
      var A = M.sprites.EXPLORADOR;

      var topo = { x: 140, pies: 384, anim: M.sprites.animador(), img: M.sprites.topo(false).canvas(), imgB: M.sprites.topo(true).canvas() };

      var luz = M.crearLuz(L, { ambiente: '#342D52', superficie: SURF, pozo: { x: 252, w: 136, alto: 240 },
        rayos: { x: 262, n: 4, paso: 30 }, sol: { x: 520, y: 58, factor: 0.12 } });
      luz.fuentes = fuentes; luz.brillos = oros;
      luz.dinamicas = function () {
        return [
          { x: ROPE_X + SPR.lampara.x, y: yOf(exp.posAnim) + SPR.lampara.y, r: 85, c: '255,240,200', kind: 'lamp', ph: 0 },
          { x: topo.x + M.sprites.TOPO.lamparaX - 13, y: topo.pies - 19, r: 48, c: '255,240,200', kind: 'lamp', ph: 0 }
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
        if (suave) exp.posAnim += (exp.pos - exp.posAnim) * Math.min(1, dt * 9); else exp.posAnim = exp.pos;
        if (Math.abs(exp.pos - exp.posAnim) < 0.01) exp.posAnim = exp.pos;
        var moviendo = Math.abs(exp.pos - exp.posAnim) > 0.06;
        exp.trepa += Math.abs(exp.posAnim - exp.ultimo) * 1.6; exp.ultimo = exp.posAnim;
        exp.anim.actualizar(dt, moviendo, suave, function () { part.polvo(ROPE_X - 6, yOf(exp.posAnim) + 12); });
        topo.anim.actualizar(dt, false, suave);
        L.seguir(yOf(exp.posAnim));
      });
      L.capa('mundo', 60, function (bx, camI) {
        var a = exp.anim, par = (exp.trepa | 0) % 2, key;
        if (SPR.codigo) {
          key = a.alegria > 0 ? 'C' : (a.moviendo ? (par ? 'B' : 'A') : 'A');
          if (a.parpadeo > 0) key += 'b';
        } else key = a.alegria > 0 ? 'C' : (a.moviendo ? (par ? 'B' : 'B2') : 'A');
        var img = SPR[key];
        var pies = yOf(exp.posAnim) - SPR.cy - camI + img.height;
        M.sprites.dibujar(bx, img, ROPE_X - SPR.ax, pies, a.sq, a.rebote(L.time, L.opts.smooth));
        var ti = topo.anim.parpadeo > 0 ? topo.imgB : topo.img;
        M.sprites.dibujar(bx, ti, topo.x - ti.width / 2, topo.pies - camI, 0, topo.anim.rebote(L.time + 1.3, L.opts.smooth));
      });
      M.capas.primerPlano(L, { color: '#0C0812', desde: SURF + 30 });

      L.fijarCam(yOf(exp.pos) - L.H * 0.52);
      var mapaInfo = {
        T: T, filas: ROWS, columnas: COLS,
        roca: function (r, c) { return !!(solid[r] && solid[r][c]); },
        /* Pared de pizarra visible: no es roca, esta bajo la superficie y no es el pozo abierto. */
        pared: function (r, c) { return r >= 6 && r < ROWS && !solid[r][c] && !(c >= 8 && c <= 11 && r >= 12 && r <= 17) && !(c >= 8 && c <= 11); }
      };
      return { L: L, luz: luz, particulas: part, explorador: exp, topo: topo, yOf: yOf, mapa: mapaInfo, constantes: this.constantes };
    }
  };
})(window.SAMSAN_BIOMAS = window.SAMSAN_BIOMAS || {});
