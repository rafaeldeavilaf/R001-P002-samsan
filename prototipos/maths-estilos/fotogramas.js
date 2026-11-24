// titulo: Station styles
/* ============================================================
   RB01 · H04 — TRES FOTOGRAMAS DE ESTILO (solo _local/, no se publica)
   La misma escena de la estación espacial en tres estilos, dibujada por
   código en SVG, para que el jugador mayor elija cómo se ve su parte:
     1. Papercraft técnico: papel negro, bordes neón, origami mecánico.
     2. Papel recortado de colores cálidos, con capas y sombras.
     3. Pixel art de hoy, IMITADO POR CÓDIGO (no es el arte de PixelLab).
   Sin contenido del colegio: el reto es encajar el panel solar que
   falta (Maths 1 y Maths 2 se miden en RB02). Sin personajes ni marcas
   de terceros. El panel del reto es siempre claro (regla 9, AA).
   La elección se anota en papel; la página no guarda nada.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var $ = P.$;
  var W = 800, H = 450;

  /* ---------- La escena: primitivas en orden de dibujo ---------- */
  function rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  function ngon(cx, cy, r, n, giro) {
    var pts = [];
    for (var k = 0; k < n; k++) { var a = (giro || 0) + k * 2 * Math.PI / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  }
  function arco(cx, cy, r, desde, hasta, pasos) {
    var pts = [];
    for (var k = 0; k <= pasos; k++) { var a = desde + (hasta - desde) * k / pasos; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  }
  /* Plato parabólico de lado: un cuenco con el borde plano mirando al cielo, sobre
     un pie bajo y ancho (revisión infantil: reemplaza la cúpula sobre un palo). Es grueso
     para que no se pierda en el pixel. */
  function plato(cx, cy, r, abre) {
    return arco(cx, cy, r, abre + Math.PI / 2, abre + 3 * Math.PI / 2, 16);
  }
  /* alto: capa del diorama (0 fondo … 5 lo más cerca). La luz viene de arriba a la izquierda. */
  var ESCENA = [
    { rol: 'planeta', alto: 1, circ: [110, 560, 230] },
    { rol: 'brazo', alto: 2, pts: rect(215, 196, 120, 30) },
    { rol: 'brazo', alto: 2, pts: rect(465, 196, 120, 30) },
    { rol: 'panel', alto: 3, pts: rect(95, 140, 120, 140), rejilla: true },
    { rol: 'hueco', alto: 0, pts: rect(585, 140, 120, 140) },
    { rol: 'antena', alto: 3, pts: [[376, 146], [424, 146], [410, 126], [390, 126]] },
    { rol: 'antena', alto: 3, pts: plato(400, 98, 36, -Math.PI / 2) },
    { rol: 'casco', alto: 4, pts: ngon(400, 212, 78, 8, Math.PI / 8) },
    { rol: 'ventana', alto: 5, circ: [400, 212, 26] },
    { rol: 'nave', alto: 3, pts: [[120, 70], [205, 88], [120, 106], [138, 88]] },
    { rol: 'repuesto', alto: 3, pts: [[610, 330], [722, 312], [742, 418], [630, 436]], rejilla: true }
  ];
  function contorno(p) { return p.circ ? ngon(p.circ[0], p.circ[1], p.circ[2], 48) : p.pts; }
  function mover(pts, dx, dy) { return pts.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }
  /* Sombra de dos capas por altura: contacto (pega la pieza) y ambiental (la despega). */
  function filtrosRelieve(pref, color, contacto, ambiente) {
    var s = '';
    for (var h = 1; h <= 5; h++) {
      s += '<filter id="' + pref + '-r' + h + '" data-alto="' + h + '" x="-30%" y="-30%" width="175%" height="175%">' +
        '<feDropShadow class="contacto" dx="' + (0.6 * h).toFixed(1) + '" dy="' + (0.8 * h).toFixed(1) + '" stdDeviation="0.7" flood-color="' + color + '" flood-opacity="' + contacto + '"/>' +
        '<feDropShadow class="ambiente" dx="' + (2 * h) + '" dy="' + (3 * h) + '" stdDeviation="' + (1.8 * h).toFixed(1) + '" flood-color="' + color + '" flood-opacity="' + ambiente + '"/>' +
        '</filter>';
    }
    return s;
  }
  /* Hueco hundido: sombra interior arriba a la izquierda, recortada al hueco. */
  function hundido(pref, pts, fondo, sombra, opacidad) {
    return '<clipPath id="' + pref + '-hueco"><polygon points="' + ptsStr(pts) + '"/></clipPath>' +
      '<polygon class="hueco" points="' + ptsStr(pts) + '" fill="' + fondo + '"/>' +
      '<g clip-path="url(#' + pref + '-hueco)"><polygon points="' + ptsStr(mover(pts, 5, 6)) + '" fill="none" stroke="' + sombra + '" stroke-width="14" opacity="' + opacidad + '" filter="url(#' + pref + '-difuso)"/></g>';
  }
  var ESTRELLAS = [[60, 40], [250, 30], [330, 70], [520, 50], [610, 90], [700, 40], [760, 130], [480, 120], [280, 300], [760, 260], [520, 400], [40, 200]];

  function centro(pts) { var x = 0, y = 0; pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
  function ptsStr(pts) { return pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function rejilla(pts, trazo, ancho) {
    /* Líneas de celdas solares dentro de un cuadrilátero (pts en orden). */
    var s = '', a = pts[0], b = pts[1], c = pts[2], d = pts[3];
    function lerp(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
    for (var k = 1; k < 4; k++) {
      var t = k / 4, p1 = lerp(a, b, t), p2 = lerp(d, c, t), q1 = lerp(a, d, t), q2 = lerp(b, c, t);
      s += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="' + trazo + '" stroke-width="' + ancho + '"/>';
      s += '<line x1="' + q1[0].toFixed(1) + '" y1="' + q1[1].toFixed(1) + '" x2="' + q2[0].toFixed(1) + '" y2="' + q2[1].toFixed(1) + '" stroke="' + trazo + '" stroke-width="' + ancho + '"/>';
    }
    return s;
  }

  /* ---------- 1. Papercraft técnico ---------- */
  var NEON = { casco: '#2FE6FF', brazo: '#2FE6FF', panel: '#B6FF3B', hueco: '#2FE6FF', antena: '#FF4FD8', ventana: '#FF4FD8', nave: '#FFD23F', repuesto: '#B6FF3B', planeta: '#7A5CFF' };
  function papercraft() {
    var s = '<defs>' +
      '<filter id="pc-brillo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="pc-reflejo" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<filter id="pc-difuso" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>' +
      filtrosRelieve('pc', '#000000', 0.9, 0.75) + '</defs>';
    /* Tapete de corte grafito con rejilla grabada: sobre él la sombra negra se ve. */
    s += '<rect class="fondo" width="' + W + '" height="' + H + '" fill="#16161F"/>';
    for (var gx = 40; gx < W; gx += 40) s += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + H + '" stroke="#20202C" stroke-width="1"/>';
    for (var gy = 40; gy < H; gy += 40) s += '<line x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '" stroke="#20202C" stroke-width="1"/>';
    ESTRELLAS.forEach(function (e) { s += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="1.6" fill="#2FE6FF" opacity=".8"/>'; });
    ESCENA.forEach(function (p) {
      var neon = NEON[p.rol], pts = contorno(p);
      if (p.rol === 'hueco') {
        s += hundido('pc', pts, '#0F0F16', '#000000', 0.9);
        s += '<polygon points="' + ptsStr(pts) + '" fill="none" stroke="' + neon + '" stroke-width="2.5" stroke-dasharray="9 6" filter="url(#pc-brillo)"/>';
        return;
      }
      var c = centro(pts);
      /* Reflejo del neón sobre el tapete, debajo de la pieza. */
      s += '<polygon points="' + ptsStr(mover(pts, 2 * p.alto, 3 * p.alto)) + '" fill="' + neon + '" opacity=".16" filter="url(#pc-reflejo)"/>';
      /* Cara con sombra de su altura, y canto del papel debajo. */
      s += '<polygon class="canto" points="' + ptsStr(mover(pts, 1.5, 1.5)) + '" fill="#07070B"/>';
      s += '<polygon class="cara" data-alto="' + p.alto + '" points="' + ptsStr(pts) + '" fill="#161622" filter="url(#pc-r' + p.alto + ')"/>';
      /* Facetas plegadas: cada lado con el centro, en dos tonos, como origami. */
      if (!p.circ) {
        for (var k = 0; k < pts.length; k++) {
          var a = pts[k], b = pts[(k + 1) % pts.length];
          s += '<polygon points="' + ptsStr([a, b, c]) + '" fill="' + (k % 2 ? '#1E1E30' : '#13131D') + '"/>';
          s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + c[0].toFixed(1) + '" y2="' + c[1].toFixed(1) + '" stroke="' + neon + '" stroke-width=".8" stroke-dasharray="4 4" opacity=".55"/>';
        }
      }
      s += '<polygon points="' + ptsStr(pts) + '" fill="none" stroke="' + neon + '" stroke-width="2.5" stroke-linejoin="round" filter="url(#pc-brillo)"/>';
      if (p.rejilla) s += rejilla(pts, neon, 1.2);
    });
    return s;
  }

  /* ---------- 2. Papel y cartón recortado (el estilo elegido por Rafael) ----------
     Diorama de caja: un tablero de cartón kraft, una hoja de cielo pegada con
     cinta, y piezas de cartulina y cartón a distintas alturas. Cada pieza tiene:
     - material: fibra del papel y bisel del borde, con luz de arriba a la izquierda;
     - grosor: el canto visible abajo a la derecha (cartón corrugado en los brazos);
     - tres sombras: contacto, ambiental y lejana, más largas cuanto más alta. */
  var COLOR = { planeta: '#7FB069', brazo: '#C89B62', panel: '#3E8E7E', antena: '#C2453A', casco: '#E07A3F', ventana: '#FFF3C4', nave: '#F2C14E', repuesto: '#3E8E7E' };
  /* Canto: el mismo papel, más oscuro; en el cartón, las ondas del corrugado. */
  var CANTO = { planeta: '#4F7340', brazo: 'url(#pp-corrugado)', panel: '#22564B', antena: '#7E2620', casco: '#9A4A1F', ventana: '#C2A96E', nave: '#AE8026', repuesto: '#22564B' };
  /* Grosor en px: cartulina 2, cartón 4. */
  var GROSOR = { brazo: 4, casco: 3, planeta: 3 };
  var SOMBRA = '#2A1E14';
  function sombraF(clase, dx, dy, blur, op, res) {
    return '<feGaussianBlur in="SourceAlpha" stdDeviation="' + blur + '"/>' +
      '<feOffset class="' + clase + '" dx="' + dx + '" dy="' + dy + '" result="' + res + 'a"/>' +
      '<feFlood flood-color="' + SOMBRA + '" flood-opacity="' + op + '"/>' +
      '<feComposite in2="' + res + 'a" operator="in" result="' + res + '"/>';
  }
  function filtroPapel(id, h) {
    return '<filter id="' + id + '" data-alto="' + h + '" x="-40%" y="-40%" width="200%" height="200%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="bisel"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="' + (5 + h) + '" result="ruido"/>' +
      '<feComposite in="bisel" in2="ruido" operator="arithmetic" k2="1" k3=".22" result="altura"/>' +
      '<feDiffuseLighting in="altura" surfaceScale="2.6" diffuseConstant="1" lighting-color="#FFFFFF" result="luz"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>' +
      '<feComposite in="SourceGraphic" in2="luz" operator="arithmetic" k1="1.2" result="iluminada"/>' +
      '<feComposite in="iluminada" in2="SourceAlpha" operator="in" result="cara"/>' +
      sombraF('lejos', 3 * h, 5 * h, (3.2 * h).toFixed(1), 0.2, 'sl') +
      sombraF('ambiente', (1.8 * h).toFixed(1), (2.6 * h).toFixed(1), (1.3 * h).toFixed(1), 0.44, 'sa') +
      sombraF('contacto', (0.5 * h).toFixed(1), (0.7 * h).toFixed(1), 0.6, 0.55, 'sc') +
      '<feMerge><feMergeNode in="sl"/><feMergeNode in="sa"/><feMergeNode in="sc"/><feMergeNode in="cara"/></feMerge></filter>';
  }
  /* Celdas de un panel solar: cuadritos de papel pegados sobre la pieza. */
  function celdas(q, n, m) {
    function lerp(p, r, t) { return [p[0] + (r[0] - p[0]) * t, p[1] + (r[1] - p[1]) * t]; }
    function en(u, v) { return lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v); }
    var out = [];
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var u0 = i / n + m, u1 = (i + 1) / n - m, v0 = j / n + m, v1 = (j + 1) / n - m;
      out.push([en(u0, v0), en(u1, v0), en(u1, v1), en(u0, v1)]);
    }
    return out;
  }
  /* Borde rasgado para la hoja de cielo. */
  function rasgado(y0, semilla) {
    var pts = [[-20, -20], [W + 20, -20]], s = semilla;
    function azar() { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }
    for (var x = W + 20; x >= -20; x -= 14) pts.push([x, y0 + Math.sin(x / 47) * 6 + azar() * 5]);
    return pts;
  }
  function temblar(pts, semilla) {
    /* Bordes de tijera: un punto intermedio por lado, movido un poco. */
    var out = [], s = semilla;
    function azar() { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }
    for (var k = 0; k < pts.length; k++) {
      var a = pts[k], b = pts[(k + 1) % pts.length];
      /* En curvas (lados cortos) la tijera tiembla menos: si no, el borde queda dentado. */
      var f = Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1]) / 30);
      out.push([a[0] + azar() * 2.4 * f, a[1] + azar() * 2.4 * f]);
      out.push([(a[0] + b[0]) / 2 + azar() * 3.2 * f, (a[1] + b[1]) / 2 + azar() * 3.2 * f]);
    }
    return out;
  }
  function papelColores() {
    var s = '<defs>';
    for (var h = 1; h <= 5; h++) s += filtroPapel('pp-r' + h, h);
    s += '<filter id="pp-difuso" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>' +
      /* Cartón kraft: fibra gruesa, iluminada. */
      '<filter id="pp-carton" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".7 .35" numOctaves="4" seed="2" result="r"/>' +
        '<feDiffuseLighting in="r" surfaceScale=".8" lighting-color="#FFFFFF" result="l"><feDistantLight azimuth="225" elevation="64"/></feDiffuseLighting>' +
        '<feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.12" result="c"/>' +
        '<feComposite in="c" in2="SourceAlpha" operator="in"/></filter>' +
      '<filter id="pp-cinta" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="1" dy="1.5" stdDeviation="1" flood-color="' + SOMBRA + '" flood-opacity=".25"/></filter>' +
      '<pattern id="pp-corrugado" width="3.2" height="6" patternUnits="userSpaceOnUse"><rect width="3.2" height="6" fill="#B48853"/><rect width="1.3" height="6" fill="#7A5630"/></pattern>' +
      '<radialGradient id="pp-vineta" cx="50%" cy="45%" r="70%"><stop offset="60%" stop-color="#2A1E14" stop-opacity="0"/><stop offset="100%" stop-color="#2A1E14" stop-opacity=".28"/></radialGradient>' +
      '</defs>';
    /* Tablero de cartón kraft. */
    s += '<rect class="fondo" width="' + W + '" height="' + H + '" fill="#C9A570" filter="url(#pp-carton)"/>';
    /* Hoja de cielo con borde rasgado, pegada con cinta. */
    var cielo = rasgado(300, 21);
    s += '<polygon class="canto" points="' + ptsStr(mover(cielo, 0.8, 1)) + '" fill="#D4C29A"/>';
    s += '<polygon class="cara" data-alto="1" points="' + ptsStr(cielo) + '" fill="#F1E4C6" filter="url(#pp-r1)"/>';
    [[70, 18, -14], [730, 18, 12]].forEach(function (c) {
      s += '<rect x="' + (c[0] - 32) + '" y="' + (c[1] - 9) + '" width="64" height="18" fill="#EDE0B4" opacity=".82" transform="rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')" filter="url(#pp-cinta)"/>';
    });
    ESTRELLAS.forEach(function (e, i) {
      var pts = ngon(e[0], e[1], 6, 5, i);
      s += '<polygon class="canto" points="' + ptsStr(mover(pts, 0.8, 1)) + '" fill="#A87A26"/>';
      s += '<polygon class="cara" data-alto="1" points="' + ptsStr(pts) + '" fill="#E9B44C" filter="url(#pp-r1)"/>';
    });
    ESCENA.forEach(function (p, i) {
      var color = COLOR[p.rol];
      if (p.rol === 'hueco') {
        /* Ranura cortada en la hoja de cielo: se ve el cartón de abajo, en sombra. */
        s += hundido('pp', p.pts, '#A88355', SOMBRA, 0.6);
        s += '<polygon points="' + ptsStr(p.pts) + '" fill="none" stroke="#6E5233" stroke-width="1.5" stroke-dasharray="7 6"/>';
        return;
      }
      var pts = temblar(contorno(p), (p.circ ? 11 : 3) + i), g = GROSOR[p.rol] || 2;
      for (var k = g; k >= 1; k--) s += '<polygon class="canto" points="' + ptsStr(mover(pts, k * 0.8, k * 0.95)) + '" fill="' + CANTO[p.rol] + '"/>';
      s += '<polygon class="cara" data-alto="' + p.alto + '" points="' + ptsStr(pts) + '" fill="' + color + '" filter="url(#pp-r' + p.alto + ')"/>';
      if (p.rejilla) celdas(p.pts, 4, 0.045).forEach(function (q) {
        s += '<polygon points="' + ptsStr(q) + '" fill="#5DB09C" filter="url(#pp-r1)"/>';
      });
    });
    /* Luz de lámpara: las esquinas de la caja más oscuras. */
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#pp-vineta)"/>';
    return s;
  }

  /* ---------- 3. Pixel art de hoy, imitado por código ---------- */
  var PIXEL = { planeta: '#4F7A3A', brazo: '#8C8FA8', panel: '#3B6FB6', antena: '#C94F4F', casco: '#B8BCCF', ventana: '#FFD34D', nave: '#E8A33D', repuesto: '#3B6FB6' };
  function dentro(p, x, y) {
    if (p.circ) { var dx = x - p.circ[0], dy = y - p.circ[1]; return dx * dx + dy * dy <= p.circ[2] * p.circ[2]; }
    var pts = p.pts, ok = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i][1] > y) !== (pts[j][1] > y) && x < (pts[j][0] - pts[i][0]) * (y - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) ok = !ok;
    }
    return ok;
  }
  function pixel() {
    var T = 10, cols = W / T, filas = H / T, celda = [], s = '';
    for (var f = 0; f < filas; f++) {
      celda.push([]);
      for (var c = 0; c < cols; c++) {
        var x = c * T + T / 2, y = f * T + T / 2, quien = -1;
        for (var k = 0; k < ESCENA.length; k++) if (dentro(ESCENA[k], x, y)) quien = k;
        celda[f].push(quien);
      }
    }
    function colorDe(f, c) {
      var k = celda[f][c];
      var vecino = function (ff, cc) { return ff < 0 || cc < 0 || ff >= filas || cc >= cols ? -1 : celda[ff][cc]; };
      var solido = function (kk) { return kk >= 0 && ESCENA[kk].rol !== 'hueco'; };
      if (k < 0 || !solido(k)) {
        /* Contorno por fuera, como el pixel art de hoy: las piezas finas no se pierden. */
        if (solido(vecino(f - 1, c)) || solido(vecino(f + 1, c)) || solido(vecino(f, c - 1)) || solido(vecino(f, c + 1))) return '#1E1426';
        return k >= 0 && (f + c) % 2 ? '#3D3478' : null;
      }
      var p = ESCENA[k];
      if (vecino(f - 1, c) !== k) return '#FFFFFF';
      if (p.rejilla && (c % 3 === 0 || f % 3 === 0)) return '#24497F';
      return PIXEL[p.rol];
    }
    s += '<rect class="fondo" width="' + W + '" height="' + H + '" fill="#2B2560"/>';
    ESTRELLAS.forEach(function (e) { s += '<rect x="' + (Math.floor(e[0] / T) * T) + '" y="' + (Math.floor(e[1] / T) * T) + '" width="' + T + '" height="' + T + '" fill="#FFF3C4"/>'; });
    for (var ff = 0; ff < filas; ff++) {
      var c0 = 0;
      while (c0 < cols) {
        var col = colorDe(ff, c0), c1 = c0 + 1;
        while (c1 < cols && colorDe(ff, c1) === col) c1++;
        if (col) s += '<rect x="' + c0 * T + '" y="' + ff * T + '" width="' + (c1 - c0) * T + '" height="' + T + '" fill="' + col + '"/>';
        c0 = c1;
      }
    }
    return s;
  }

  var FOTOGRAMAS = [
    { id: 'papercraft-tecnico', nombre: 'Technical papercraft', nota: 'Black paper, neon edges, folded like mechanical origami.', borde: '#2FE6FF', dibujar: papercraft,
      alt: 'Space station made of black folded paper with glowing neon edges' },
    { id: 'papel-colores', nombre: 'Cut paper', nota: 'Cut paper and card in layers, like a diorama in a box.', borde: '#E07A3F', dibujar: papelColores,
      alt: 'Space station made of warm coloured cut paper with soft shadows' },
    { id: 'pixel-imitacion', nombre: 'Pixel (like today)', nota: 'A code-made imitation of the pixel style the games use today.', borde: '#1E1426', dibujar: pixel,
      alt: 'Space station in chunky pixel squares with dark outlines' }
  ];
  var actual = 0;

  function ver(i) {
    actual = (i + FOTOGRAMAS.length) % FOTOGRAMAS.length;
    var F = FOTOGRAMAS[actual];
    $('#proto').innerHTML =
      '<section class="fs-marco" data-fotograma="' + F.id + '">' +
        '<svg class="fs-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + F.alt + '"' + (F.id === 'pixel-imitacion' ? ' shape-rendering="crispEdges"' : '') + '>' + F.dibujar() + '</svg>' +
        '<div class="k-panel fs-panel" style="border-color:' + F.borde + '">' +
          '<p class="k-rotulo">Style ' + (actual + 1) + ' of ' + FOTOGRAMAS.length + '</p>' +
          '<h2>' + F.nombre + '</h2>' +
          '<p>' + F.nota + '</p>' +
          '<p class="fs-reto"><b>Station task:</b> the right solar panel is missing. Drag the spare panel into the empty slot.</p>' +
          '<div class="k-botones fs-nav">' +
            '<button type="button" class="k-boton" id="fs-ant" aria-label="Previous style">&#9664; Back</button>' +
            '<button type="button" class="k-boton k-boton--primario" id="fs-sig" aria-label="Next style">Next &#9654;</button>' +
          '</div>' +
        '</div>' +
      '</section>';
    $('#fs-ant').addEventListener('click', function () { P.sonido('paso'); ver(actual - 1); });
    $('#fs-sig').addEventListener('click', function () { P.sonido('paso'); ver(actual + 1); });
  }

  var css = document.createElement('style');
  css.textContent = [
    '.fs-marco{max-width:980px;margin:0 auto}',
    '.fs-svg{display:block;width:100%;height:auto;border:3px solid #1E1426;border-radius:12px}',
    '.fs-panel{margin-top:10px;border-width:4px;background:#FFFDF6;color:#1E1426}',
    '.fs-reto{padding:8px 10px;border:2px dashed #1E1426;border-radius:8px;background:#FFF3C4}',
    '.fs-nav .k-boton{min-width:140px;min-height:56px;font-size:1.15rem}',
    '@media (max-width:600px){.fs-nav .k-boton{min-width:0;flex:1}}'
  ].join('\n');
  document.head.appendChild(css);

  document.addEventListener('keydown', function (e) {
    if (!$('.fs-marco')) return;
    if (e.key === 'ArrowLeft') ver(actual - 1);
    else if (e.key === 'ArrowRight') ver(actual + 1);
  });

  $('#proto').innerHTML =
    '<section class="k-panel fs-panel fs-inicio">' +
      '<p class="k-rotulo">Style test</p><h2>Which look do you like for your station?</h2>' +
      '<p>Three styles of the same space station. Look at each one, then say which you like best and why.</p>' +
      '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="play">SEE STYLES</button></div>' +
    '</section>';
  $('#play').addEventListener('click', function () { P.sonido('paso'); ver(0); });

  window.RB01_FOTOGRAMAS = { lista: FOTOGRAMAS, ver: ver };
})();
