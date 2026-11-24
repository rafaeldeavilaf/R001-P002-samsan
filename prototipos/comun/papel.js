/* ============================================================
   SAMSAN — PAPEL Y CARTÓN EN CANVAS (biblioteca reutilizable)
   Estilo elegido por Rafael el 24 nov 2026. Cada pieza se dibuja UNA vez
   en su propio lienzo (fibra, bisel, canto y tres sombras) y en el juego
   solo se copia con drawImage: en un teléfono real eso aguantó 300 piezas
   a casi 60 FPS (RB01). Nada de filtros SVG ni sombras por cuadro.

   Uso:
     var PP = window.SAMSAN_PAPEL;
     var pieza = PP.pieza({ forma: PP.formas.poligono(8, 60), color: '#E07A3F', altura: 4 });
     PP.dibujar(ctx, pieza, x, y, angulo);
     var fondo = PP.tablero(ancho, alto);  ctx.drawImage(fondo.lienzo, 0, 0, ancho, alto);

   Luz siempre de arriba a la izquierda. Altura 1 (pegado) a 5 (lo más alto).
   Si el navegador no tiene Canvas, pieza() devuelve null y dibujar() no hace nada.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.SAMSAN_PAPEL = {};
  var SOMBRA = '42,30,20';
  var LEJOS = 100000;          /* truco: se dibuja la forma lejos y solo cae su sombra en el lienzo */
  var cache = {};

  function lienzo(w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    var g = c.getContext ? c.getContext('2d') : null;
    return g ? { c: c, g: g } : null;
  }
  PP.dpr = function () { return Math.min(3, window.devicePixelRatio || 1); };

  /* ---------- Color ---------- */
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  PP.oscurecer = function (hex, f) {
    var c = rgb(hex).map(function (v) { return Math.max(0, Math.min(255, Math.round(v * f))); });
    return '#' + c.map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  };

  /* ---------- Formas (puntos locales, centrados en 0,0) ---------- */
  function azarCon(semilla) { var s = semilla || 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }; }
  PP.formas = {
    rect: function (w, h) { return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]; },
    poligono: function (n, r, giro) {
      var p = [];
      for (var k = 0; k < n; k++) { var a = (giro === undefined ? Math.PI / n : giro) + k * 2 * Math.PI / n; p.push([r * Math.cos(a), r * Math.sin(a)]); }
      return p;
    },
    circulo: function (r) { return PP.formas.poligono(Math.max(24, Math.round(r)), r, 0); },
    estrella: function (r, puntas) {
      var p = [], n = (puntas || 5) * 2;
      for (var k = 0; k < n; k++) { var a = -Math.PI / 2 + k * Math.PI / (n / 2), rr = k % 2 ? r * 0.45 : r; p.push([rr * Math.cos(a), rr * Math.sin(a)]); }
      return p;
    },
    /* Cuenco mirando al cielo (la antena de la estación). */
    cuenco: function (r) {
      var p = [];
      for (var k = 0; k <= 16; k++) { var a = k * Math.PI / 16; p.push([r * Math.cos(a), r * Math.sin(a) * 0.9 - r * 0.35]); }
      return p;
    }
  };
  /* Borde de tijera: tiembla menos en lados cortos (curvas). */
  PP.temblar = function (pts, semilla, fuerza) {
    var azar = azarCon(semilla), out = [], f0 = fuerza === undefined ? 1 : fuerza;
    for (var k = 0; k < pts.length; k++) {
      var a = pts[k], b = pts[(k + 1) % pts.length];
      var f = f0 * Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1]) / 30);
      out.push([a[0] + azar() * 2.4 * f, a[1] + azar() * 2.4 * f]);
      out.push([(a[0] + b[0]) / 2 + azar() * 3.2 * f, (a[1] + b[1]) / 2 + azar() * 3.2 * f]);
    }
    return out;
  };

  /* ---------- Texturas compartidas (se hacen una vez) ---------- */
  function ruido(tam, fuerza, semilla) {
    var clave = 'ruido:' + tam + ':' + fuerza + ':' + semilla;
    if (cache[clave] !== undefined) return cache[clave];
    var l = lienzo(tam, tam);
    if (!l || !l.g.createImageData) return (cache[clave] = null);
    var img = l.g.createImageData(tam, tam);
    if (!img || !img.data) return (cache[clave] = null);
    var azar = azarCon(semilla), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = 128 + azar() * fuerza * 2;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    l.g.putImageData(img, 0, 0);
    return (cache[clave] = l.c);
  }
  function corrugado(dpr) {
    var clave = 'corrugado:' + dpr;
    if (cache[clave] !== undefined) return cache[clave];
    var l = lienzo(3.2 * dpr, 6 * dpr);
    if (!l) return (cache[clave] = null);
    l.g.fillStyle = '#B48853'; l.g.fillRect(0, 0, l.c.width, l.c.height);
    l.g.fillStyle = '#7A5630'; l.g.fillRect(0, 0, 1.3 * dpr, l.c.height);
    return (cache[clave] = l.c);
  }

  function trazar(g, pts, dx, dy) {
    g.beginPath();
    for (var i = 0; i < pts.length; i++) g[i ? 'lineTo' : 'moveTo'](pts[i][0] + dx, pts[i][1] + dy);
    g.closePath();
  }
  function sombra(g, pts, dx, dy, blur, alfa, dpr) {
    g.save();
    g.shadowColor = 'rgba(' + SOMBRA + ',' + alfa + ')';
    g.shadowBlur = blur * dpr;
    g.shadowOffsetX = (dx + LEJOS) * dpr; g.shadowOffsetY = dy * dpr;
    trazar(g, pts, -LEJOS, 0);
    g.fillStyle = '#000'; g.fill();
    g.restore();
  }

  /* ---------- Una pieza de papel o cartón, dibujada una vez ----------
     o.forma     puntos locales (PP.formas.*); se le pasa la tijera salvo o.recto
     o.color     color de la cara
     o.altura    1 a 5 (largo de las sombras)
     o.grosor    px del canto (2 cartulina, 4 cartón)
     o.carton    canto corrugado
     o.fibra     0 a 1 (por defecto .5)
     o.semilla   para que el temblor sea siempre el mismo
     o.encima    función(g) para dibujar detalles sobre la cara (en coordenadas locales)
     o.clave     si se da, la pieza se guarda y se reutiliza */
  PP.pieza = function (o) {
    if (o.clave && cache['pieza:' + o.clave]) return cache['pieza:' + o.clave];
    var dpr = o.dpr || PP.dpr(), h = o.altura || 2, grosor = o.grosor || (o.carton ? 4 : 2);
    var pts = o.recto ? o.forma : PP.temblar(o.forma, o.semilla || 3);
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var margen = 8 + h * 9 + grosor;
    var ox = -minX + margen, oy = -minY + margen;
    var w = maxX - minX + margen * 2, alto = maxY - minY + margen * 2;
    var l = lienzo(w * dpr, alto * dpr);
    if (!l) return null;
    var g = l.g;
    g.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);

    /* 1. Tres sombras: lejana, ambiental y de contacto. */
    sombra(g, pts, 3 * h, 5 * h, 6.4 * h, 0.2, dpr);
    sombra(g, pts, 1.8 * h, 2.6 * h, 2.6 * h, 0.44, dpr);
    sombra(g, pts, 0.5 * h, 0.7 * h, 1.2, 0.55, dpr);

    /* 2. Canto: el grosor del papel abajo a la derecha. */
    var canto = o.canto || PP.oscurecer(o.color, 0.66);
    var onda = o.carton ? corrugado(dpr) : null;
    var patron = onda && g.createPattern ? g.createPattern(onda, 'repeat') : null;
    if (patron && patron.setTransform && window.DOMMatrix) patron.setTransform(new DOMMatrix().scale(1 / dpr));
    for (var k = grosor; k >= 1; k--) { trazar(g, pts, k * 0.8, k * 0.95); g.fillStyle = patron || canto; g.fill(); }

    /* 3. Cara, luz y fibra, recortadas a la forma. */
    trazar(g, pts, 0, 0); g.fillStyle = o.color; g.fill();
    g.save();
    trazar(g, pts, 0, 0); g.clip();
    var grad = g.createLinearGradient ? g.createLinearGradient(minX, minY, maxX, maxY) : null;
    if (grad && grad.addColorStop) {
      grad.addColorStop(0, 'rgba(255,255,255,.16)'); grad.addColorStop(0.55, 'rgba(255,255,255,0)'); grad.addColorStop(1, 'rgba(0,0,0,.10)');
      g.fillStyle = grad; g.fillRect(minX, minY, maxX - minX, maxY - minY);
    }
    var tex = ruido(96, 22, 5);
    var pt = tex && g.createPattern ? g.createPattern(tex, 'repeat') : null;
    if (pt) {
      g.globalAlpha = o.fibra === undefined ? 0.5 : o.fibra;
      g.globalCompositeOperation = 'overlay';
      g.fillStyle = pt; g.fillRect(minX, minY, maxX - minX, maxY - minY);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
    if (o.encima) o.encima(g);
    /* 4. Bisel: claro arriba a la izquierda, oscuro abajo a la derecha. */
    g.lineWidth = 2.6; g.lineJoin = 'round';
    trazar(g, pts, -1.1, -1.1); g.strokeStyle = 'rgba(0,0,0,.20)'; g.stroke();
    trazar(g, pts, 1.1, 1.1); g.strokeStyle = 'rgba(255,255,255,.38)'; g.stroke();
    g.restore();

    var p = { lienzo: l.c, ox: ox, oy: oy, ancho: w, alto: alto, altura: h };
    if (o.clave) cache['pieza:' + o.clave] = p;
    return p;
  };

  /* Copia una pieza ya dibujada. (x, y) es el origen de su forma. */
  PP.dibujar = function (ctx, p, x, y, angulo) {
    if (!ctx || !p) return;
    if (angulo) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angulo);
      ctx.drawImage(p.lienzo, -p.ox, -p.oy, p.ancho, p.alto);
      ctx.restore();
    } else ctx.drawImage(p.lienzo, x - p.ox, y - p.oy, p.ancho, p.alto);
  };

  /* ---------- Fondo: tablero de cartón kraft con viñeta ---------- */
  PP.tablero = function (w, h, o) {
    o = o || {};
    var dpr = o.dpr || PP.dpr(), l = lienzo(w * dpr, h * dpr);
    if (!l) return null;
    var g = l.g;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = o.color || '#C9A570'; g.fillRect(0, 0, w, h);
    var tex = ruido(128, 30, 9);
    if (tex) {
      /* Fibra alargada: el ruido estirado a lo ancho. */
      g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.55;
      for (var y = 0; y < h; y += 64) for (var x = 0; x < w; x += 256) g.drawImage(tex, x, y, 256, 64);
      g.restore();
    }
    var vin = g.createRadialGradient ? g.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h * 0.45, Math.max(w, h) * 0.75) : null;
    if (vin && vin.addColorStop) {
      vin.addColorStop(0, 'rgba(' + SOMBRA + ',0)'); vin.addColorStop(1, 'rgba(' + SOMBRA + ',.28)');
      g.fillStyle = vin; g.fillRect(0, 0, w, h);
    }
    return { lienzo: l.c, ancho: w, alto: h };
  };

  /* Hoja grande con borde rasgado abajo (cielo, mar, pasto...). Devuelve una pieza. */
  PP.hoja = function (w, yBorde, o) {
    o = o || {};
    var azar = azarCon(o.semilla || 21), pts = [[-20, -20], [w + 20, -20]];
    for (var x = w + 20; x >= -20; x -= 14) pts.push([x, yBorde + Math.sin(x / 47) * 6 + azar() * 5]);
    return PP.pieza({ forma: pts, recto: true, color: o.color || '#F1E4C6', altura: o.altura || 1, grosor: 1, fibra: 0.45, clave: o.clave });
  };

  /* Cinta de papel (masking) para pegar hojas. */
  PP.cinta = function (ctx, x, y, angulo) {
    if (!ctx) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angulo || 0);
    ctx.shadowColor = 'rgba(' + SOMBRA + ',.25)'; ctx.shadowBlur = 2; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1.5;
    ctx.fillStyle = 'rgba(237,224,180,.85)'; ctx.fillRect(-32, -9, 64, 18);
    ctx.restore();
  };

  /* Hueco cortado: sombra interior arriba a la izquierda. Se dibuja directo (es plano). */
  PP.hueco = function (ctx, x, y, w, h, o) {
    if (!ctx) return;
    o = o || {};
    ctx.save();
    ctx.fillStyle = o.fondo || '#A88355'; ctx.fillRect(x, y, w, h);
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.shadowColor = 'rgba(' + SOMBRA + ',.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 6;
    ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
    ctx.restore();
    ctx.save(); ctx.setLineDash([7, 6]); ctx.lineWidth = 1.5; ctx.strokeStyle = o.borde || '#6E5233';
    ctx.strokeRect(x, y, w, h); ctx.restore();
  };

  PP.limpiar = function () { cache = {}; };
})();
