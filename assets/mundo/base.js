/* ============================================================
   SAMSAN — MUNDO / BASE.JS
   Capa de render del mundo (etapa 1). Utilidades compartidas por
   todos los modulos de assets/mundo/: numeros, color, paletas,
   buffer de pixeles y contornos.

   Todos los modulos cuelgan de window.SAMSAN_MUNDO (M). Ninguno
   tiene texto visible ni conoce un tema: lo que se dibuja lo
   declara el bioma (temas/<materia>/bioma.js).
   Punto de partida: docs/referencia/muestra-estilo.html.
   ============================================================ */
(function (M) {
  'use strict';

  M.W = 640;        // lienzo logico
  M.H = 360;
  M.T = 32;         // tile

  M.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* Generador pseudoaleatorio con semilla: el mismo nivel se dibuja
     siempre igual. */
  M.rng = function (seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  var HC = {};
  M.hx = function (h) {
    var v = HC[h];
    if (!v) { v = HC[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
    return v;
  };
  M.rgba = function (h, a) { var c = M.hx(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  M.hex = function (r, g, b) {
    return '#' + [r, g, b].map(function (v) { v = M.clamp(Math.round(v), 0, 255); return (v < 16 ? '0' : '') + v.toString(16); }).join('').toUpperCase();
  };

  /* ---------- Paletas ----------
     Vienen de assets/paletas.json (build.py las incrusta como
     window.SAMSAN_PALETAS). Una sola fuente para el juego y el pipeline. */
  var SRC = window.SAMSAN_PALETAS || { contorno: '#1E1426', rampas: {} };
  M.PAL = {};
  Object.keys(SRC.rampas).forEach(function (k) { M.PAL[k] = SRC.rampas[k].slice(); });
  M.PAL.contorno = SRC.contorno;

  /* ---------- Color en HSL, para el cambio de tono ---------- */
  M.toHsl = function (h) {
    var c = M.hx(h), r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, hh = 0, d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      hh *= 60;
    }
    return [hh, s, l];
  };
  M.fromHsl = function (hh, s, l) {
    hh = ((hh % 360) + 360) % 360; s = M.clamp(s, 0, 1); l = M.clamp(l, 0, 1);
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function f(t) {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var k = hh / 360;
    return M.hex(f(k + 1 / 3) * 255, f(k) * 255, f(k - 1 / 3) * 255);
  };
  /* Luminancia relativa (WCAG), para pruebas de contraste. */
  M.luminancia = function (h) {
    var c = M.hx(h).map(function (v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  /* Rampa de piel de cuatro tonos (de oscuro a claro, como la rampa
     `piel` de referencia) desde un tono base: las sombras giran hacia el
     morado y la luz hacia el amarillo (cambio de tono, no solo oscurecer). */
  M.rampaPiel = function (base) {
    var t = M.toHsl(base);
    return [
      M.fromHsl(t[0] - 14, t[1] * 0.7 + 0.05, t[2] * 0.62),
      M.fromHsl(t[0] - 12, t[1] * 0.9 + 0.04, t[2] * 0.8),
      base.toUpperCase(),
      M.fromHsl(t[0] + 8, t[1] * 0.95, Math.min(0.94, t[2] + (1 - t[2]) * 0.3))
    ];
  };
  /* Mapa para cambiar la rampa de piel de referencia (3 tonos: profunda,
     sombra, base) por la de un tono. La luz de la rampa del tono se usa en
     sprites dibujados por codigo, no en el arte procesado. */
  M.mapaPiel = function (base) {
    var ref = M.PAL.piel || [], dest = M.rampaPiel(base), mapa = {};
    ref.forEach(function (c, i) { mapa[c] = dest[i]; });
    return mapa;
  };

  /* Cambia colores exactos en un arreglo RGBA. `mapa` es { '#ORIGEN': '#DESTINO' }.
     Es la base del intercambio de paleta (12 tonos de piel). */
  M.cambiarColores = function (data, mapa) {
    var pares = Object.keys(mapa).map(function (k) { return [M.hx(k.toUpperCase()), M.hx(mapa[k].toUpperCase())]; });
    var n = 0;
    for (var i = 0; i < data.length; i += 4) {
      if (!data[i + 3]) continue;
      for (var j = 0; j < pares.length; j++) {
        var a = pares[j][0];
        if (data[i] === a[0] && data[i + 1] === a[1] && data[i + 2] === a[2]) {
          var b = pares[j][1];
          data[i] = b[0]; data[i + 1] = b[1]; data[i + 2] = b[2]; n++;
          break;
        }
      }
    }
    return n;
  };

  /* ---------- Buffer de pixeles ---------- */
  function Buf(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  Buf.prototype.set = function (x, y, c, a) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    var i = (y * this.w + x) * 4, k = M.hx(c);
    this.d[i] = k[0]; this.d[i + 1] = k[1]; this.d[i + 2] = k[2]; this.d[i + 3] = a == null ? 255 : a;
  };
  Buf.prototype.clear = function (x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[(y * this.w + x) * 4 + 3] = 0; };
  Buf.prototype.a = function (x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[(y * this.w + x) * 4 + 3]; };
  Buf.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };
  Buf.prototype.canvas = function () {
    var c = document.createElement('canvas'); c.width = this.w; c.height = this.h;
    var x = c.getContext('2d');
    if (x) x.putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return c;
  };
  M.Buf = Buf;

  /* Borde de luz arriba (y segunda linea opcional) y borde oscuro en los
     otros lados: la regla de terreno de docs/direccion-grafica.md §3. */
  M.outlinePass = function (buf, top, side, second) {
    var out = [];
    for (var y = 0; y < buf.h; y++) for (var x = 0; x < buf.w; x++) {
      if (!buf.a(x, y)) continue;
      var up = y > 0 && !buf.a(x, y - 1), dn = y < buf.h - 1 && !buf.a(x, y + 1);
      var lf = x > 0 && !buf.a(x - 1, y), rt = x < buf.w - 1 && !buf.a(x + 1, y);
      if (up) { out.push([x, y, top]); if (second && buf.a(x, y + 1)) out.push([x, y + 1, second]); }
      else if (dn || lf || rt) out.push([x, y, side]);
    }
    out.forEach(function (o) { if (o[2] === second) buf.set(o[0], o[1], o[2]); });
    out.forEach(function (o) { if (o[2] !== second) buf.set(o[0], o[1], o[2]); });
  };
  /* Contorno de 1 px por fuera de la silueta (personajes y props). */
  M.silhouetteOutline = function (buf, color) {
    var out = [];
    for (var y = 0; y < buf.h; y++) for (var x = 0; x < buf.w; x++) {
      if (buf.a(x, y)) continue;
      if (buf.a(x - 1, y) || buf.a(x + 1, y) || buf.a(x, y - 1) || buf.a(x, y + 1)) out.push([x, y]);
    }
    out.forEach(function (o) { buf.set(o[0], o[1], color); });
  };
  M.drawLine = function (buf, x0, y0, x1, y1, c, w) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (var i = 0; i <= n; i++) buf.rect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w, c);
  };

  /* ---------- Movimiento reducido ---------- */
  M.movimientoReducido = function () {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (e) { return false; }
  };
  /* Opciones de render. `glow` va aparte de `light` para que el gobernador
     de rendimiento pueda apagar primero el resplandor. */
  M.opcionesIniciales = function () {
    var rm = M.movimientoReducido();
    return { light: true, glow: true, particles: !rm, depth: !rm, smooth: !rm };
  };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
