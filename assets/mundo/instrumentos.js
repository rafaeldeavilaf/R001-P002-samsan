/* ============================================================
   SAMSAN — MUNDO / INSTRUMENTOS.JS
   Instrumentos pedagogicos dibujados por codigo (regla 9): regla
   vertical, termometro, bandera de salida, marcador de posicion,
   salto con flecha, anillo de destino y corchete de diferencia.

   Se dibujan en la pasada 'alta' (resolucion de pantalla), nitidos
   sobre el mundo. Todo en px de pantalla: `u` es la unidad de trazo
   (px CSS x dpr, con un minimo para que se lea en un telefono).
   Aqui no hay texto: solo numeros y la unidad que llega de los datos.
   ============================================================ */
(function (M) {
  'use strict';
  var I = M.inst = {};
  var TINTA = '#1E1426', PAPEL = '#F7EFDD', PAPEL_OSC = '#2A211A';
  var CIAN = '#7FE3F0', CIAN_OSC = '#0E2A33', CORAL = '#FF9E8A', ORO = '#FFD34D', PASTO = '#A6E06A';
  I.colores = { tinta: TINTA, papel: PAPEL, cian: CIAN, coral: CORAL, oro: ORO, pasto: PASTO };

  /* Numero con signo menos tipografico. */
  I.num = function (n) { return n < 0 ? '−' + Math.abs(n) : String(n); };
  I.conSigno = function (n) { return n > 0 ? '+' + n : I.num(n); };
  var NB = ' ';

  /* Unidad de trazo: 1,2 px CSS como minimo, o proporcional a la escala. */
  I.u = function (L) { return Math.max(1.2 * L.dpr, L.s * 0.9); };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  I.roundRect = roundRect;

  /* Etiqueta: texto en una pastilla. Tamano minimo 14 px CSS. */
  I.etiqueta = function (ctx, L, texto, x, y, align, color, fondo, escala) {
    var fs = Math.max(14 * L.dpr, 6.5 * L.s) * (escala || 1);
    ctx.font = '900 ' + fs + 'px Nunito, ui-rounded, "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    var w = ctx.measureText(texto).width, p = fs * 0.3;
    var bx = align === 'left' ? x - p : align === 'right' ? x - w - p : x - w / 2 - p;
    ctx.fillStyle = fondo; roundRect(ctx, bx, y - fs * 0.62, w + p * 2, fs * 1.24, fs * 0.3); ctx.fill();
    ctx.fillStyle = color; ctx.fillText(texto, x, y + fs * 0.04);
    return { x: bx, w: w + p * 2, h: fs * 1.24 };
  };

  /* Regla vertical. g = { x, yDe(v) -> y en pantalla, min, max, unidad,
     cadaEtiqueta (5 o 10), soloDecenas (sin pista grafica), alto, bajo }.
     Marca el cero con verde y forma (tick mas largo). */
  I.regla = function (ctx, L, g) {
    var u = I.u(L), lw = Math.max(1.5 * L.dpr, L.s), X = g.x;
    var y0 = g.yDe(g.max), y1 = g.yDe(g.min), cada = g.cadaEtiqueta || 5;
    ctx.save();
    ctx.fillStyle = 'rgba(20,12,30,0.55)'; ctx.fillRect(X - lw, y0, lw * 3, y1 - y0);
    ctx.fillStyle = PAPEL; ctx.fillRect(X, y0, lw, y1 - y0);
    for (var d = g.min; d <= g.max; d++) {
      var y = g.yDe(d); if (y < -30 || y > L.canvas.height + 30) continue;
      var mayor = d % cada === 0, decena = d % 10 === 0;
      if (g.soloDecenas && !decena && d !== 0) { if (!mayor) continue; }
      var len = (d === 0 ? 12 : mayor ? 8 : 4) * u;
      ctx.fillStyle = 'rgba(20,12,30,0.8)'; ctx.fillRect(X, y - lw, len + lw, lw * 3);
      ctx.fillStyle = d === 0 ? PASTO : PAPEL; ctx.fillRect(X, y - lw / 2, len, lw);
      var rotula = g.soloDecenas ? (decena || d === 0) : mayor;
      if (rotula) I.etiqueta(ctx, L, I.num(d) + NB + g.unidad, X + len + 4 * u, y, 'left',
        d === 0 ? '#1F3D2A' : PAPEL_OSC, d === 0 ? 'rgba(166,224,106,0.97)' : 'rgba(247,239,221,0.95)');
    }
    ctx.restore();
  };

  /* Termometro de pared: panel claro (contraste AA), tubo, bulbo y
     liquido hasta `valor`. g = { x, y, w, h (px pantalla), min, max,
     unidad, cadaEtiqueta, soloDecenas }. Devuelve yDe(v) para las marcas. */
  I.termoGeo = function (L, g) {
    var u = I.u(L), tubo = 9 * u, bulbo = 13 * u;
    var top = g.y + 16 * u, bottom = g.y + g.h - bulbo * 2 - 6 * u, cx = g.x + 30 * u;
    return { u: u, tubo: tubo, bulbo: bulbo, top: top, bottom: bottom, x: cx, xEscala: cx + tubo / 2 + 3 * u,
             yDe: function (v) { return bottom - (v - g.min) / (g.max - g.min) * (bottom - top); } };
  };
  I.termometro = function (ctx, L, g, valor) {
    var G = I.termoGeo(L, g), u = G.u, tubo = G.tubo, bulbo = G.bulbo, top = G.top, bottom = G.bottom, cx = G.x, yDe = G.yDe;
    ctx.save();
    ctx.fillStyle = 'rgba(247,239,221,0.96)'; ctx.strokeStyle = TINTA; ctx.lineWidth = 2 * u;
    roundRect(ctx, g.x, g.y, g.w, g.h, 8 * u); ctx.fill(); ctx.stroke();
    // Tubo de vidrio y bulbo.
    ctx.fillStyle = '#E4ECF4'; ctx.strokeStyle = TINTA; ctx.lineWidth = 1.6 * u;
    roundRect(ctx, cx - tubo / 2, top - 8 * u, tubo, bottom - top + 16 * u + bulbo, tubo / 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, bottom + bulbo + 4 * u, bulbo, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Liquido: rojo oscuro (contraste con el panel) hasta el valor.
    var yv = yDe(M.clamp(valor, g.min, g.max));
    ctx.fillStyle = '#C23B32';
    ctx.beginPath(); ctx.arc(cx, bottom + bulbo + 4 * u, bulbo - 3 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - tubo / 2 + 2.5 * u, yv, tubo - 5 * u, bottom + bulbo - yv);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(cx - tubo / 2 + 3 * u, yv, 1.5 * u, bottom + bulbo - yv);
    // Escala a la derecha del tubo, con marcas y numeros oscuros sobre papel.
    var cada = g.cadaEtiqueta || 5, X = cx + tubo / 2 + 3 * u;
    for (var d = g.min; d <= g.max; d++) {
      var y = yDe(d), mayor = d % cada === 0, decena = d % 10 === 0;
      var len = (d === 0 ? 12 : mayor ? 8 : 4) * u;
      if (g.soloDecenas && !decena && d !== 0 && !mayor) continue;
      ctx.fillStyle = d === 0 ? '#1F6B3A' : TINTA; ctx.fillRect(X, y - 0.75 * u, len, (d === 0 ? 2.2 : 1.5) * u);
      var rotula = g.soloDecenas ? (decena || d === 0) : mayor;
      if (rotula) {
        var fs = Math.max(14 * L.dpr, 6.5 * L.s);
        ctx.font = '900 ' + fs + 'px Nunito, ui-rounded, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = d === 0 ? '#1F6B3A' : PAPEL_OSC;
        ctx.fillText(I.num(d) + NB + g.unidad, X + len + 3 * u, y + fs * 0.04);
      }
    }
    ctx.restore();
    return G;
  };

  /* Bandera de salida: mastil y pano de dos colores (forma, no solo color). */
  I.bandera = function (ctx, x, y, u) {
    ctx.save();
    ctx.fillStyle = TINTA; ctx.fillRect(x - u, y - 12 * u, 2 * u, 14 * u);
    ctx.beginPath(); ctx.moveTo(x, y - 12.5 * u); ctx.lineTo(x - 11 * u, y - 9 * u); ctx.lineTo(x, y - 5.5 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = CIAN;
    ctx.beginPath(); ctx.moveTo(x - u, y - 11.5 * u); ctx.lineTo(x - 9 * u, y - 9 * u); ctx.lineTo(x - u, y - 6.5 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAPEL; ctx.fillRect(x - 4 * u, y - 10 * u, 2 * u, 2 * u);
    ctx.restore();
  };

  /* Bandera de estimacion: triangulo naranja con borde (distinta de la de salida). */
  I.estimacion = function (ctx, x, y, u) {
    ctx.save();
    ctx.fillStyle = TINTA; ctx.fillRect(x - u, y - 14 * u, 2 * u, 16 * u);
    ctx.beginPath(); ctx.moveTo(x + u, y - 14.5 * u); ctx.lineTo(x + 13 * u, y - 10.5 * u); ctx.lineTo(x + u, y - 6.5 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.moveTo(x + 2 * u, y - 13.3 * u); ctx.lineTo(x + 10.5 * u, y - 10.5 * u); ctx.lineTo(x + 2 * u, y - 7.7 * u); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  /* Marcador de la posicion actual: flecha amarilla que apunta a la escala. */
  I.marcador = function (ctx, x, y, u, lado) {
    var k = lado === 'izq' ? -1 : 1;
    ctx.save();
    ctx.fillStyle = ORO; ctx.strokeStyle = TINTA; ctx.lineWidth = Math.max(1, u * 0.8);
    ctx.beginPath(); ctx.moveTo(x - 2 * u * k, y); ctx.lineTo(x - 12 * u * k, y - 6 * u); ctx.lineTo(x - 12 * u * k, y + 6 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  /* Salto: arco con punta desde ya hasta yb a la izquierda de x, con su
     etiqueta (+8 m). `punteado` para la pista y el error. */
  I.salto = function (ctx, L, x, ya, yb, texto, opt) {
    opt = opt || {};
    var u = I.u(L), s = L.s, color = opt.color || CIAN;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(2 * L.dpr, 1.4 * s);
    if (opt.punteado) ctx.setLineDash([4 * u, 3 * u]);
    ctx.beginPath(); ctx.moveTo(x, ya); ctx.quadraticCurveTo(x - 22 * s, (ya + yb) / 2, x, yb); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = color;
    var dir = yb < ya ? -1 : 1;
    if (Math.abs(yb - ya) > 2) {
      ctx.beginPath(); ctx.moveTo(x, yb); ctx.lineTo(x - 5 * u, yb - dir * 7 * u); ctx.lineTo(x + 4 * u, yb - dir * 6 * u); ctx.closePath(); ctx.fill();
    }
    if (texto) I.etiqueta(ctx, L, texto, x - 16 * s, (ya + yb) / 2, 'right', CIAN_OSC, 'rgba(127,227,240,0.97)');
    ctx.restore();
  };

  /* Anillo de destino (donde hay que llegar), con cruz en el centro: forma. */
  I.anillo = function (ctx, x, y, u) {
    ctx.save();
    ctx.strokeStyle = TINTA; ctx.lineWidth = 4 * u;
    ctx.beginPath(); ctx.arc(x, y, 7 * u, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = PASTO; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.arc(x, y, 7 * u, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = PASTO; ctx.fillRect(x - 1.5 * u, y - 1.5 * u, 3 * u, 3 * u);
    ctx.restore();
  };

  /* Signo de pregunta en una pastilla: el dato que falta. */
  I.pregunta = function (ctx, L, x, y, align) {
    return I.etiqueta(ctx, L, '?', x, y, align || 'center', PAPEL_OSC, 'rgba(255,211,77,0.98)', 1.15);
  };

  /* Corchete de diferencia: cuanto falto o sobro (forma y numero, no solo color). */
  I.corchete = function (ctx, L, x, ya, yb, texto) {
    var u = I.u(L), lo = Math.min(ya, yb), hi = Math.max(ya, yb);
    ctx.save();
    ctx.strokeStyle = CORAL; ctx.lineWidth = Math.max(2 * L.dpr, L.s);
    ctx.beginPath(); ctx.moveTo(x + 4 * u, lo); ctx.lineTo(x, lo); ctx.lineTo(x, hi); ctx.lineTo(x + 4 * u, hi); ctx.stroke();
    if (texto) I.etiqueta(ctx, L, texto, x - 4 * u, (lo + hi) / 2, 'right', '#3A1410', 'rgba(255,158,138,0.97)', 0.9);
    ctx.restore();
  };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
