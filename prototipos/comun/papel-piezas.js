/* ============================================================
   SAMSAN — CATÁLOGO DE PIEZAS DE PAPEL (sobre papel.js)
   Piezas con nombre, listas para cualquier pantalla. Cada llamada con
   las mismas opciones devuelve la misma pieza ya dibujada (caché).
   Todas devuelven un objeto con .dibujar(ctx, x, y, angulo).
     var C = window.SAMSAN_PAPEL.catalogo;
     C.tarjeta({ texto: '47' }).dibujar(ctx, 120, 80);
   Grupos: A instrumentos de Maths, B aldea (Y2), D construcción, C estación (Y6).
   C.categorias lista los nombres por categoría.
   Sin personajes ni caras. Los números son de ejemplo.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.SAMSAN_PAPEL;
  if (!PP) return;
  var F = PP.formas;
  var C = PP.catalogo = {};
  var TINTA = '#1E1426';
  var FUENTE = "'Nunito', system-ui, sans-serif";

  function clave(nombre, o) { return 'cat:' + nombre + ':' + JSON.stringify(o || {}); }
  /* Una pieza suelta que también sabe dibujarse. */
  function suelta(nombre, o, opciones) {
    opciones.clave = clave(nombre, o);
    var p = PP.pieza(opciones);
    if (p && !p.dibujar) p.dibujar = function (ctx, x, y, a) { PP.dibujar(ctx, p, x, y, a); };
    return p || { dibujar: function () {} };
  }
  /* Varias piezas juntas: [[pieza, dx, dy], ...]. */
  function grupo(partes) {
    return {
      partes: partes,
      dibujar: function (ctx, x, y, a) {
        if (!ctx) return;
        ctx.save(); ctx.translate(x, y); if (a) ctx.rotate(a);
        partes.forEach(function (q) { PP.dibujar(ctx, q[0], q[1], q[2]); });
        ctx.restore();
      }
    };
  }
  function texto(g, t, x, y, tam, color) {
    if (!g.fillText) return;
    g.save(); g.fillStyle = color || TINTA; g.font = '900 ' + tam + 'px ' + FUENTE;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x, y); g.restore();
  }
  /* Contorno de varios círculos unidos (copas, nubes, arbustos): rayos desde el centro. */
  function union(circulos, n) {
    var cx = 0, cy = 0;
    circulos.forEach(function (c) { cx += c[0]; cy += c[1]; });
    cx /= circulos.length; cy /= circulos.length;
    var pts = [];
    for (var k = 0; k < (n || 64); k++) {
      var a = k * 2 * Math.PI / (n || 64), dx = Math.cos(a), dy = Math.sin(a), lejos = 0;
      circulos.forEach(function (c) {
        var ox = cx - c[0], oy = cy - c[1], b = ox * dx + oy * dy, d = b * b - (ox * ox + oy * oy - c[2] * c[2]);
        if (d >= 0) lejos = Math.max(lejos, -b + Math.sqrt(d));
      });
      pts.push([cx + dx * lejos, cy + dy * lejos]);
    }
    return pts;
  }
  C.union = union;
  function celdas(ancho, alto, n, m) {
    return function (g) {
      var cw = ancho / n, ch = alto / n;
      g.save();
      g.fillStyle = '#5DB09C';
      g.shadowColor = 'rgba(42,30,20,.4)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 1.4;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) g.fillRect(-ancho / 2 + i * cw + m, -alto / 2 + j * ch + m, cw - 2 * m, ch - 2 * m);
      g.restore();
    };
  }

  /* ================= A. Instrumentos de Maths ================= */

  /* 1. Tarjeta de número: entero, decimal o fracción («3/4»). */
  C.tarjeta = function (o) {
    o = o || {};
    var t = String(o.texto === undefined ? '0' : o.texto), w = o.ancho || 64, h = o.alto || 80;
    var fr = /^(\d+)\s*\/\s*(\d+)$/.exec(t);
    return suelta('tarjeta', o, {
      forma: F.rect(w, h), color: o.color || '#FFF6DC', altura: o.altura || 2, semilla: 31,
      encima: function (g) {
        if (fr) {
          texto(g, fr[1], 0, -17, 26);
          g.fillStyle = TINTA; g.fillRect(-w * 0.28, -2, w * 0.56, 3.5);
          texto(g, fr[2], 0, 20, 26);
        } else texto(g, t, 0, 2, t.length <= 2 ? 36 : t.length === 3 ? 28 : 21);
      }
    });
  };

  /* 2. Recta numérica de cartón. p.xDe(v) da la x local de un valor. */
  C.recta = function (o) {
    o = o || {};
    var ini = o.inicio === undefined ? 0 : o.inicio, fin = o.fin === undefined ? 10 : o.fin, paso = o.paso || 1;
    var L = o.largo || 600, grandes = o.grandes || Math.max(paso, (fin - ini) / 10), conNumeros = o.numeros !== false;
    function xDe(v) { return -L / 2 + (v - ini) / (fin - ini) * L; }
    function fmt(v) { return String(+v.toFixed(3)); }
    var p = suelta('recta', o, {
      forma: F.rect(L + 44, 50), color: o.color || '#E2C495', altura: o.altura || 1, grosor: 3, carton: true, semilla: 33,
      encima: function (g) {
        g.save(); g.strokeStyle = TINTA; g.lineCap = 'round';
        g.lineWidth = 3; g.beginPath(); g.moveTo(-L / 2, -8); g.lineTo(L / 2, -8); g.stroke();
        var n = Math.round((fin - ini) / paso);
        for (var k = 0; k <= n; k++) {
          var v = ini + k * paso, x = xDe(v), grande = Math.abs(((v - ini) / grandes) - Math.round((v - ini) / grandes)) < 1e-6;
          g.lineWidth = grande ? 3 : 1.6;
          g.beginPath(); g.moveTo(x, grande ? -18 : -14); g.lineTo(x, grande ? 2 : -2); g.stroke();
          if (grande && conNumeros) texto(g, fmt(v), x, 14, 13);
        }
        g.restore();
      }
    });
    p.xDe = xDe;
    return p;
  };

  /* 3. Marcador: flecha que señala hacia abajo, con pie ancho. La punta queda en y = +20. */
  C.marcador = function (o) {
    o = o || {};
    var p = suelta('marcador', o, {
      forma: [[-12, -26], [12, -26], [12, -4], [22, -4], [0, 20], [-22, -4], [-12, -4]],
      color: o.color || '#C2453A', altura: o.altura || 3, semilla: 35
    });
    p.punta = 20;
    return p;
  };

  /* 4. Cuenta de ábaco: u (unidad), d (decena), c (centena). */
  var CUENTA = { u: '#E07A3F', d: '#3E8E7E', c: '#7A5CA8' };
  C.cuenta = function (o) {
    o = o || {};
    var r = o.r || 14;
    return suelta('cuenta', o, {
      forma: F.circulo(r), color: CUENTA[o.valor || 'u'] || o.valor, altura: o.altura || 2, semilla: 37,
      encima: function (g) { g.fillStyle = 'rgba(30,20,38,.55)'; g.beginPath(); g.arc(0, 0, r * 0.22, 0, Math.PI * 2); g.fill(); }
    });
  };

  /* 5. Varilla del ábaco (vertical). */
  C.varilla = function (o) {
    o = o || {};
    return suelta('varilla', o, { forma: F.rect(10, o.largo || 160), color: '#B88A4E', altura: 1, grosor: 2, semilla: 39 });
  };

  /* 6. Marco de 10 con «llenos» puntos (fila de arriba primero). */
  C.marco10 = function (o) {
    o = o || {};
    var llenos = Math.max(0, Math.min(10, o.llenos || 0));
    return suelta('marco10', o, {
      forma: F.rect(160, 72), color: '#FFF6DC', altura: 2, semilla: 41,
      encima: function (g) {
        g.save(); g.strokeStyle = TINTA; g.lineWidth = 2;
        for (var i = 0; i < 10; i++) {
          var x = -72 + (i % 5) * 29, y = -31 + Math.floor(i / 5) * 32;
          g.strokeRect(x, y, 28, 30);
          if (i < llenos) {
            g.save(); g.shadowColor = 'rgba(42,30,20,.45)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 1.5;
            g.fillStyle = '#C2453A'; g.beginPath(); g.arc(x + 14, y + 15, 9, 0, Math.PI * 2); g.fill(); g.restore();
          }
        }
        g.restore();
      }
    });
  };

  /* 7. Gema de papel: rombo con facetas en dos tonos. */
  C.gema = function (o) {
    o = o || {};
    var col = o.color || '#3FA7C9';
    return suelta('gema', o, {
      forma: [[0, -24], [20, -6], [0, 26], [-20, -6]], color: col, altura: o.altura || 3, semilla: 43, recto: true,
      encima: function (g) {
        g.fillStyle = 'rgba(255,255,255,.28)';
        g.beginPath(); g.moveTo(0, -24); g.lineTo(-20, -6); g.lineTo(0, 26); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.22)';
        g.beginPath(); g.moveTo(-20, -6); g.lineTo(0, -24); g.lineTo(20, -6); g.lineTo(0, -1); g.closePath(); g.fill();
      }
    });
  };

  /* ================= B. Aldea (Y2) ================= */

  /* 8. Casa: muro con techo, puerta y ventana pegadas. */
  C.casa = function (o) {
    o = o || {};
    var techo = o.techo || '#C2453A';
    return suelta('casa', o, {
      forma: [[-34, -6], [0, -42], [34, -6], [34, 40], [-34, 40]], color: o.color || '#F2C14E', altura: 2, semilla: 45,
      encima: function (g) {
        g.fillStyle = techo; g.beginPath(); g.moveTo(-40, -2); g.lineTo(0, -46); g.lineTo(40, -2); g.closePath(); g.fill();
        g.save(); g.shadowColor = 'rgba(42,30,20,.45)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 1.5;
        g.fillStyle = '#7E4A2A'; g.fillRect(-20, 12, 16, 28);
        g.fillStyle = '#FFF3C4'; g.fillRect(6, 6, 16, 16);
        g.restore();
      }
    });
  };
  /* 9. Árbol: copa de tres círculos sobre tronco corto y ancho (forma aprobada). */
  C.arbol = function (o) {
    o = o || {};
    var tronco = PP.pieza({ forma: F.rect(20, 26), color: '#8A5A32', altura: 2, semilla: 47, clave: clave('tronco', o) });
    var copa = PP.pieza({ forma: union([[-17, 0, 19], [17, 0, 19], [0, -16, 22]]), recto: true, color: o.color || '#5E9E55', altura: 3, semilla: 49, clave: clave('copa', o) });
    return grupo([[tronco, 0, 26], [copa, 0, -2]]);
  };
  /* 10. Arbusto. */
  C.arbusto = function (o) {
    o = o || {};
    return suelta('arbusto', o, { forma: union([[-16, 4, 13], [0, -3, 15], [16, 4, 13]]), recto: true, color: o.color || '#4F8A4A', altura: 2, semilla: 51 });
  };
  /* 11. Nube (flota alto). */
  C.nube = function (o) {
    o = o || {};
    return suelta('nube', o, { forma: union([[-26, 6, 15], [-8, -6, 19], [12, -4, 17], [28, 7, 13]]), recto: true, color: '#FBF7EE', altura: 4, semilla: 53 });
  };
  /* 12. Tabla del puente. */
  C.tabla = function (o) {
    o = o || {};
    return suelta('tabla', o, {
      forma: F.rect(o.largo || 80, 18), color: '#A8743F', altura: 2, grosor: 3, semilla: 55,
      encima: function (g) {
        g.strokeStyle = 'rgba(70,40,20,.35)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(-30, -3); g.lineTo(30, -4); g.moveTo(-34, 4); g.lineTo(26, 3); g.stroke();
      }
    });
  };
  /* 13. Carro: carrocería con cabina y dos ventanas, y dos ruedas. */
  C.carrito = function (o) {
    o = o || {};
    var cuerpo = PP.pieza({
      forma: [[-38, -2], [-24, -26], [20, -26], [34, -2], [38, -2], [38, 20], [-38, 20]],
      color: o.color || '#5B7DB1', altura: 2, semilla: 57, clave: clave('carro', o),
      encima: function (g) {
        g.save();
        g.shadowColor = 'rgba(42,30,20,.45)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 1.5;
        g.fillStyle = '#CFE8F2';
        g.beginPath(); g.moveTo(-20, -21); g.lineTo(-3, -21); g.lineTo(-3, -5); g.lineTo(-29, -5); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(3, -21); g.lineTo(17, -21); g.lineTo(27, -5); g.lineTo(3, -5); g.closePath(); g.fill();
        g.fillStyle = '#FFF3C4'; g.fillRect(30, 3, 6, 6);
        g.restore();
      }
    });
    var rueda = PP.pieza({
      forma: F.circulo(12), color: '#3B2F25', altura: 3, semilla: 59, clave: clave('rueda', o),
      encima: function (g) { g.fillStyle = '#B8BCCF'; g.beginPath(); g.arc(0, 0, 4.5, 0, Math.PI * 2); g.fill(); }
    });
    return grupo([[cuerpo, 0, 0], [rueda, -22, 20], [rueda, 22, 20]]);
  };
  /* 14. Cerca: tres listones y un travesaño. */
  C.cerca = function (o) {
    o = o || {};
    var liston = PP.pieza({ forma: [[-6, -24], [0, -30], [6, -24], [6, 28], [-6, 28]], color: '#E9D3A8', altura: 2, semilla: 61, clave: clave('liston', o) });
    var trav = PP.pieza({ forma: F.rect(92, 10), color: '#D9BE8C', altura: 3, semilla: 63, clave: clave('travesano', o) });
    return grupo([[liston, -32, 0], [liston, 0, 0], [liston, 32, 0], [trav, 0, -4]]);
  };
  /* 15. Hojas grandes: pasto (borde rasgado arriba) y río (orillas onduladas). */
  C.hojaPasto = function (o) {
    o = o || {};
    var w = o.ancho || 800, h = o.alto || 450, y0 = o.borde || 330, s = 71;
    function azar() { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }
    var pts = [[w + 20, h + 20], [-20, h + 20]];
    for (var x = -20; x <= w + 20; x += 14) pts.push([x, y0 + Math.sin(x / 53) * 7 + azar() * 5]);
    return suelta('hojaPasto', o, { forma: pts, recto: true, color: o.color || '#8DBA6A', altura: 1, grosor: 2, semilla: 65 });
  };
  C.hojaRio = function (o) {
    o = o || {};
    var w = o.ancho || 800, y = o.y || 0, a = o.anchoRio || 46, pts = [];
    for (var x = -20; x <= w + 20; x += 16) pts.push([x, y - a / 2 + Math.sin(x / 61) * 8]);
    for (var x2 = w + 20; x2 >= -20; x2 -= 16) pts.push([x2, y + a / 2 + Math.sin(x2 / 61 + 1) * 8]);
    return suelta('hojaRio', o, { forma: pts, recto: true, color: o.color || '#5DA9C9', altura: 1, grosor: 1, semilla: 67 });
  };

  /* ================= D. Construcción (piezas para que la base crezca) ================= */
  function sombraChica(g) { g.shadowColor = 'rgba(42,30,20,.45)'; g.shadowBlur = 2; g.shadowOffsetX = 1; g.shadowOffsetY = 1.4; }

  /* ---------- Materiales con textura ----------
     Cada material sabe pintar un rectángulo (x0, y0, x1, y1) dentro de una pieza ya
     recortada a su forma. Las piezas sueltas (ladrillos, piedras, tejas) llevan su
     propia sombrita, como papelitos pegados. Todo es determinista (semilla fija). */
  function variar(hex, rnd, cuanto) { return PP.oscurecer(hex, 1 + (rnd() * 2) * (cuanto || 0.08)); }
  function poli(g, pts) { g.beginPath(); pts.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.closePath(); }
  function hiladas(g, x0, y0, x1, y1, o) {
    /* Bloques trabados (ladrillo, adobe, sillar, tablillas): o.alto, o.largo, o.junta, o.colores. */
    var rnd = azar(o.semilla || 1), j = 0;
    g.save(); sombraChica(g);
    for (var y = y0 + o.junta; y < y1; y += o.alto, j++) {
      for (var x = x0 - (j % 2 ? o.largo / 2 : 0); x < x1; x += o.largo) {
        g.fillStyle = variar(o.colores[Math.floor((rnd() + 0.5) * o.colores.length) % o.colores.length], rnd, o.var);
        var bx = Math.max(x, x0 + o.junta), bw = Math.min(x + o.largo - o.junta, x1 - o.junta) - bx;
        if (bw > 3) { if (o.redondo) { g.beginPath(); redondeado(g, bx, y, bw, o.alto - o.junta, o.redondo); g.fill(); } else g.fillRect(bx, y, bw, o.alto - o.junta); }
        if (o.grieta && rnd() > 0.55) {
          g.save(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(60,35,20,.45)'; g.lineWidth = 1;
          var cx = bx + bw * (0.3 + (rnd() + 0.5) * 0.4); g.beginPath(); g.moveTo(cx, y + 1); g.lineTo(cx + 3, y + (o.alto - o.junta) * 0.5); g.lineTo(cx - 1, y + o.alto - o.junta - 1); g.stroke(); g.restore();
        }
      }
    }
    g.restore();
  }
  function redondeado(g, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, 0); g.lineTo(x + w, y + h - r);
    g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); g.lineTo(x + r, y + h); g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); g.closePath();
  }
  function azar(semilla) { var s = semilla || 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }; }
  function vetas(g, x0, x1, y, alto, rnd, color) {
    g.save(); g.strokeStyle = color; g.lineWidth = 0.8;
    for (var k = 0; k < 2; k++) {
      var yy = y + alto * (0.3 + k * 0.35) + rnd() * 2;
      g.beginPath(); g.moveTo(x0, yy);
      for (var x = x0; x <= x1; x += 12) g.lineTo(x, yy + Math.sin(x / 9 + k * 2) * 1.2 + rnd() * 0.8);
      g.stroke();
    }
    g.restore();
  }
  function ondas(g, x0, y0, x1, y1, color, paso) {
    /* Lámina corrugada: bandas verticales con luz y sombra. */
    for (var x = x0; x < x1; x += paso) {
      var gr = g.createLinearGradient ? g.createLinearGradient(x, 0, x + paso, 0) : null;
      if (gr && gr.addColorStop) {
        gr.addColorStop(0, PP.oscurecer(color, 1.18)); gr.addColorStop(0.5, color); gr.addColorStop(1, PP.oscurecer(color, 0.72));
        g.fillStyle = gr;
      } else g.fillStyle = color;
      g.fillRect(x, y0, paso, y1 - y0);
    }
  }
  function escamas(g, x0, y0, x1, y1, o) {
    /* Tejas, pizarra y tablillas de techo: filas que se montan, la de arriba proyecta sombra. */
    var rnd = azar(o.semilla || 3), j = 0;
    for (var y = y0 - 4; y < y1; y += o.alto, j++) {
      g.save(); g.shadowColor = 'rgba(42,30,20,.5)'; g.shadowBlur = 2.5; g.shadowOffsetY = 2;
      for (var x = x0 - o.ancho - (j % 2 ? o.ancho / 2 : 0); x < x1 + o.ancho; x += o.ancho) {
        g.fillStyle = variar(o.color, rnd, o.var || 0.07);
        g.beginPath();
        if (o.tipo === 'curva') { g.moveTo(x, y); g.lineTo(x + o.ancho, y); g.lineTo(x + o.ancho, y + o.alto * 0.55); g.arc(x + o.ancho / 2, y + o.alto * 0.55, o.ancho / 2, 0, Math.PI); g.closePath(); }
        else if (o.tipo === 'escama') { g.moveTo(x, y); g.lineTo(x + o.ancho, y); g.lineTo(x + o.ancho, y + o.alto * 0.5); g.arc(x + o.ancho / 2, y + o.alto * 0.5, o.ancho / 2, 0, Math.PI); g.closePath(); }
        else { g.rect(x + 0.5, y, o.ancho - 1, o.alto + 3); }
        g.fill();
        if (o.tipo === 'curva') {
          g.save(); g.shadowColor = 'transparent'; g.fillStyle = 'rgba(255,255,255,.22)';
          g.fillRect(x + o.ancho * 0.18, y, o.ancho * 0.16, o.alto * 0.7); g.restore();
        }
      }
      g.restore();
    }
  }
  var MAT = {
    ladrillo: { base: '#D9C4A0', pintar: function (g, a, b, c, d) { hiladas(g, a, b, c, d, { alto: 14, largo: 30, junta: 3, colores: ['#B5553C', '#A84C35', '#C0603F'], semilla: 11 }); } },
    ladrilloClaro: { base: '#7A5C40', pintar: function (g, a, b, c, d) { hiladas(g, a, b, c, d, { alto: 14, largo: 30, junta: 3, colores: ['#E2C27A', '#D6B062', '#EACF8F'], semilla: 12 }); } },
    adobe: { base: '#9C6A40', pintar: function (g, a, b, c, d) { hiladas(g, a, b, c, d, { alto: 22, largo: 46, junta: 3, colores: ['#C89060', '#BD8455', '#D29A6A'], semilla: 13, grieta: true, var: 0.06 }); } },
    piedra: { base: '#5E5A66', pintar: function (g, a, b, c, d) {
      var rnd = azar(14);
      g.save(); sombraChica(g);
      for (var y = b + 2; y < d; y += 20 + rnd() * 6) {
        for (var x = a - 10 * (rnd() + 0.5); x < c;) {
          var w = 22 + (rnd() + 0.5) * 20, h = 17 + rnd() * 5;
          g.fillStyle = variar(['#A2A3AD', '#8E8F98', '#B4B4BC', '#9A9488'][Math.floor((rnd() + 0.5) * 4) % 4], rnd, 0.06);
          poli(g, [[x + 3 + rnd() * 3, y + rnd() * 3], [x + w - 2 + rnd() * 3, y + 1 + rnd() * 3], [x + w + rnd() * 2, y + h * 0.5], [x + w - 3 + rnd() * 3, y + h + rnd() * 2], [x + 4 + rnd() * 3, y + h + rnd() * 2], [x + rnd() * 2, y + h * 0.5]]);
          g.fill(); x += w + 3;
        }
      }
      g.restore();
    } },
    sillar: { base: '#8A8272', pintar: function (g, a, b, c, d) { hiladas(g, a, b, c, d, { alto: 22, largo: 44, junta: 2, colores: ['#CFC7B4', '#C4BBA6', '#D8D0BE'], semilla: 15, var: 0.05 }); } },
    madera: { base: '#6E4A2A', pintar: function (g, a, b, c, d) {
      var rnd = azar(16);
      g.save(); sombraChica(g);
      for (var y = b + 1; y < d; y += 14) {
        g.fillStyle = variar('#A8743F', rnd, 0.08); g.fillRect(a, y, c - a, 12);
        g.save(); g.shadowColor = 'transparent'; vetas(g, a, c, y, 12, rnd, 'rgba(70,40,20,.35)');
        g.fillStyle = 'rgba(60,40,25,.7)'; g.fillRect(a + 6, y + 5, 2, 2); g.fillRect(c - 8, y + 5, 2, 2); g.restore();
      }
      g.restore();
    } },
    troncos: { base: '#5A3A20', pintar: function (g, a, b, c, d) {
      var rnd = azar(17);
      g.save(); sombraChica(g);
      for (var y = b + 1; y < d; y += 18) {
        var col = variar('#9C6B3C', rnd, 0.07);
        var gr = g.createLinearGradient ? g.createLinearGradient(0, y, 0, y + 16) : null;
        if (gr && gr.addColorStop) { gr.addColorStop(0, PP.oscurecer(col, 1.2)); gr.addColorStop(0.45, col); gr.addColorStop(1, PP.oscurecer(col, 0.7)); g.fillStyle = gr; } else g.fillStyle = col;
        g.beginPath(); redondeado(g, a - 4, y, c - a + 8, 16, 8); g.fill();
        g.save(); g.shadowColor = 'transparent'; vetas(g, a, c, y, 16, rnd, 'rgba(60,35,20,.3)'); g.restore();
      }
      g.restore();
    } },
    guadua: { base: '#6E6A3A', pintar: function (g, a, b, c, d) {
      var rnd = azar(18);
      g.save(); sombraChica(g);
      for (var x = a + 1; x < c; x += 15) {
        var col = variar('#BBA75C', rnd, 0.06);
        var gr = g.createLinearGradient ? g.createLinearGradient(x, 0, x + 13, 0) : null;
        if (gr && gr.addColorStop) { gr.addColorStop(0, PP.oscurecer(col, 1.15)); gr.addColorStop(0.4, col); gr.addColorStop(1, PP.oscurecer(col, 0.75)); g.fillStyle = gr; } else g.fillStyle = col;
        g.fillRect(x, b, 13, d - b);
        g.save(); g.shadowColor = 'transparent';
        for (var y = b + 18 + rnd() * 20; y < d; y += 38 + rnd() * 8) {
          g.fillStyle = 'rgba(80,70,30,.6)'; g.fillRect(x, y, 13, 3);
          g.fillStyle = 'rgba(255,250,220,.45)'; g.fillRect(x, y + 3, 13, 1.2);
        }
        g.restore();
      }
      g.restore();
    } },
    bahareque: { base: '#EFE8D8', pintar: function (g, a, b, c, d) {
      var rnd = azar(19);
      g.save();
      for (var k = 0; k < 140; k++) { g.fillStyle = 'rgba(120,100,70,' + (0.05 + (rnd() + 0.5) * 0.08) + ')'; g.fillRect(a + (rnd() + 0.5) * (c - a), b + (rnd() + 0.5) * (d - b), 2, 2); }
      /* Un desconchado: se ve la caña del bahareque. */
      var cx = a + (c - a) * 0.62, cy = b + (d - b) * 0.6, rx = Math.min(40, (c - a) * 0.3), ry = Math.min(26, (d - b) * 0.28);
      var hueco = []; for (var t = 0; t < 18; t++) { var ang = t * Math.PI / 9; var f = 0.6 + (rnd() + 0.5) * 0.6; hueco.push([cx + Math.cos(ang) * rx * f, cy + Math.sin(ang) * ry * f]); }
      g.fillStyle = '#B89A6A'; poli(g, hueco); g.fill();
      g.save(); poli(g, hueco); g.clip();
      g.strokeStyle = '#7E5A30'; g.lineWidth = 3;
      for (var x = cx - rx - 10; x < cx + rx + 10; x += 8) { g.beginPath(); g.moveTo(x, cy - ry - 4); g.lineTo(x, cy + ry + 4); g.stroke(); }
      g.strokeStyle = '#94703F'; g.lineWidth = 2;
      for (var y = cy - ry; y < cy + ry; y += 9) { g.beginPath(); g.moveTo(cx - rx - 4, y); g.lineTo(cx + rx + 4, y + 2); g.stroke(); }
      g.restore();
      g.shadowColor = 'rgba(42,30,20,.35)'; g.shadowBlur = 2; g.shadowOffsetX = -1; g.shadowOffsetY = -1;
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.5; poli(g, hueco); g.stroke();
      g.restore();
    } },
    concreto: { base: '#A9A9A6', pintar: function (g, a, b, c, d) {
      var rnd = azar(20);
      g.save();
      g.strokeStyle = 'rgba(60,60,60,.25)'; g.lineWidth = 1;
      for (var y = b + 28; y < d; y += 28) { g.beginPath(); g.moveTo(a, y); g.lineTo(c, y); g.stroke(); }
      for (var y2 = b + 14; y2 < d; y2 += 28) for (var x = a + 20; x < c; x += 40) { g.fillStyle = 'rgba(50,50,50,.4)'; g.beginPath(); g.arc(x, y2, 1.8, 0, Math.PI * 2); g.fill(); }
      for (var k = 0; k < 90; k++) { g.fillStyle = 'rgba(70,70,70,' + (0.12 + (rnd() + 0.5) * 0.15) + ')'; g.beginPath(); g.arc(a + (rnd() + 0.5) * (c - a), b + (rnd() + 0.5) * (d - b), 0.6 + (rnd() + 0.5), 0, Math.PI * 2); g.fill(); }
      g.restore();
    } },
    corrugado: { base: '#9EA7B3', pintar: function (g, a, b, c, d) { ondas(g, a, b, c, d, '#9EA7B3', 8); } },
    vidrio: { base: '#5E6B78', pintar: function (g, a, b, c, d) {
      g.save();
      for (var y = b + 3; y < d; y += 46) for (var x = a + 3; x < c; x += 38) {
        var w = Math.min(34, c - x - 3), h = Math.min(42, d - y - 3);
        if (w < 6 || h < 6) continue;
        var gr = g.createLinearGradient ? g.createLinearGradient(x, y, x + w, y + h) : null;
        if (gr && gr.addColorStop) { gr.addColorStop(0, '#DDF0F5'); gr.addColorStop(0.5, '#AFD6E2'); gr.addColorStop(1, '#8EC0D2'); g.fillStyle = gr; } else g.fillStyle = '#BFE0EA';
        g.fillRect(x, y, w, h);
        g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
        g.fillStyle = 'rgba(255,255,255,.55)';
        g.beginPath(); g.moveTo(x + w * 0.2, y); g.lineTo(x + w * 0.42, y); g.lineTo(x, y + h * 0.5); g.lineTo(x, y + h * 0.28); g.closePath(); g.fill();
        g.restore();
      }
      g.restore();
    } },
    /* Solo techos */
    tejas: { base: '#7A2E22', techo: true, pintar: function (g, a, b, c, d) { escamas(g, a, b, c, d, { tipo: 'curva', ancho: 14, alto: 12, color: '#B5553C', semilla: 21 }); } },
    pizarra: { base: '#3E4250', techo: true, pintar: function (g, a, b, c, d) { escamas(g, a, b, c, d, { tipo: 'escama', ancho: 13, alto: 10, color: '#6E7280', semilla: 22 }); } },
    paja: { base: '#A9853E', techo: true, pintar: function (g, a, b, c, d) {
      var rnd = azar(23);
      g.save(); g.lineWidth = 1.3;
      for (var y = b - 6; y < d; y += 9) {
        g.save(); g.shadowColor = 'rgba(60,40,10,.45)'; g.shadowBlur = 2; g.shadowOffsetY = 2;
        g.fillStyle = variar('#D9B56A', rnd, 0.05); g.fillRect(a, y, c - a, 10); g.restore();
        for (var x = a; x < c; x += 2.2) {
          g.strokeStyle = ['#C49A45', '#E6C77E', '#B88C3C'][Math.floor((rnd() + 0.5) * 3) % 3];
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd() * 1.5, y + 9 + rnd() * 3); g.stroke();
        }
      }
      g.restore();
    } },
    zinc: { base: '#8C96A3', techo: true, pintar: function (g, a, b, c, d) { ondas(g, a, b, c, d, '#A6AFBA', 7); } },
    tablillas: { base: '#6E4A2A', techo: true, pintar: function (g, a, b, c, d) { escamas(g, a, b, c, d, { tipo: 'tabla', ancho: 16, alto: 11, color: '#A8743F', semilla: 24, var: 0.1 }); } },
    tejaVerde: { base: '#1F4E45', techo: true, pintar: function (g, a, b, c, d) { escamas(g, a, b, c, d, { tipo: 'curva', ancho: 14, alto: 12, color: '#3E8E7E', semilla: 25 }); } }
  };
  C.materialesMuro = ['ladrillo', 'ladrilloClaro', 'adobe', 'piedra', 'sillar', 'madera', 'troncos', 'guadua', 'bahareque', 'concreto', 'corrugado', 'vidrio'];
  C.materialesTecho = ['tejas', 'pizarra', 'paja', 'zinc', 'tablillas', 'tejaVerde'];
  function caja(pts) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
  }
  /* Una pieza de cualquier forma, rellena con un material. */
  function conMaterial(nombre, o, forma, material, extra) {
    var m = MAT[material] || MAT.ladrillo, bb = caja(forma);
    return suelta(nombre, o, Object.assign({
      forma: forma, recto: true, color: m.base, altura: o.altura || 2, grosor: o.grosor || 3, semilla: 83,
      encima: function (g) { m.pintar(g, bb[0], bb[1], bb[2], bb[3]); }
    }, extra || {}));
  }
  C.material = function (nombre) { return MAT[nombre] || null; };

  /* Ladrillo (o bloque) suelto de un material. */
  var BLOQUE = { ladrillo: '#B5553C', ladrilloClaro: '#E2C27A', adobe: '#C89060', sillar: '#CFC7B4', concreto: '#A9A9A6', piedra: '#9A9AA4' };
  C.ladrillo = function (o) {
    o = o || {};
    var m = o.material || 'ladrillo', tam = m === 'adobe' || m === 'sillar' ? [56, 28] : [48, 22];
    return suelta('ladrillo', o, { forma: F.rect(tam[0], tam[1]), color: o.color || BLOQUE[m] || BLOQUE.ladrillo, altura: o.altura || 2, semilla: 81 });
  };
  /* Muro de cualquier material (por defecto ladrillo). */
  C.muro = function (o) {
    o = o || {};
    var w = o.ancho || 150, h = o.alto || 84;
    return conMaterial('muro', o, F.rect(w, h), o.material || 'ladrillo');
  };
  /* Bloque de juguete: cuadrado con un recuadro en relieve. */
  C.bloque = function (o) {
    o = o || {};
    var t = o.lado || 50;
    return suelta('bloque', o, {
      forma: F.rect(t, t), color: o.color || '#E07A3F', altura: o.altura || 2, grosor: 3, semilla: 85,
      encima: function (g) {
        g.save(); g.lineWidth = 3;
        g.strokeStyle = 'rgba(255,255,255,.45)'; g.strokeRect(-t / 2 + 7, -t / 2 + 7, t - 14, t - 14);
        g.strokeStyle = 'rgba(0,0,0,.18)'; g.strokeRect(-t / 2 + 9, -t / 2 + 9, t - 14, t - 14);
        g.restore();
      }
    });
  };
  /* Viga de cartón con agujeros (horizontal). */
  C.viga = function (o) {
    o = o || {};
    var L = o.largo || 160;
    return suelta('viga', o, {
      forma: F.rect(L, 22), color: '#C89B62', altura: o.altura || 2, carton: true, semilla: 87,
      encima: function (g) {
        g.fillStyle = 'rgba(42,30,20,.6)';
        for (var x = -L / 2 + 14; x <= L / 2 - 14; x += 22) { g.beginPath(); g.arc(x, 0, 4.5, 0, Math.PI * 2); g.fill(); }
      }
    });
  };
  /* Columna corta con capitel y base anchos. */
  C.columna = function (o) {
    o = o || {};
    return suelta('columna', o, {
      forma: [[-27, -46], [27, -46], [27, -36], [17, -36], [17, 36], [27, 36], [27, 46], [-27, 46], [-27, 36], [-17, 36], [-17, -36], [-27, -36]],
      color: o.color || '#E9DCC0', altura: 2, grosor: 3, recto: true, semilla: 89,
      encima: function (g) {
        g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2;
        [-8, 0, 8].forEach(function (x) { g.beginPath(); g.moveTo(x, -32); g.lineTo(x, 32); g.stroke(); });
      }
    });
  };
  /* Columna de piedra gris: más corta y ancha, con estrías marcadas (variante de la columna). */
  C.columnaPiedra = function (o) {
    o = o || {};
    return suelta('columnaPiedra', o, {
      forma: [[-34, -36], [34, -36], [34, -26], [24, -26], [24, 26], [34, 26], [34, 36], [-34, 36], [-34, 26], [-24, 26], [-24, -26], [-34, -26]],
      color: o.color || '#9A9CA8', altura: 2, grosor: 3, recto: true, semilla: 90,
      encima: function (g) {
        g.save(); g.lineWidth = 3;
        [-14, -5, 4, 13].forEach(function (x) {
          g.strokeStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.moveTo(x, -24); g.lineTo(x, 24); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(x + 2, -24); g.lineTo(x + 2, 24); g.stroke();
        });
        g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-34, -36, 68, 4);
        g.restore();
      }
    });
  };
  /* Arco de puente: medio anillo con patas. */
  C.arco = function (o) {
    o = o || {};
    var R = 56, r = 30, pts = [];
    for (var k = 0; k <= 18; k++) { var a = Math.PI + k * Math.PI / 18; pts.push([R * Math.cos(a), R * Math.sin(a) + 14]); }
    pts.push([R, 34]); pts.push([r, 34]);
    for (var k2 = 18; k2 >= 0; k2--) { var a2 = Math.PI + k2 * Math.PI / 18; pts.push([r * Math.cos(a2), r * Math.sin(a2) + 14]); }
    pts.push([-r, 34]); pts.push([-R, 34]);
    return suelta('arco', o, { forma: pts, recto: true, color: o.color || '#C9A570', altura: 2, grosor: 3, carton: !!o.carton, semilla: 91 });
  };
  /* Rampa (cuña). */
  C.rampa = function (o) {
    o = o || {};
    return suelta('rampa', o, { forma: [[-52, 24], [52, 24], [52, -24]], color: o.color || '#3E8E7E', altura: 2, grosor: 3, semilla: 93 });
  };
  /* Escalera de tres escalones. */
  C.escalera = function (o) {
    o = o || {};
    return suelta('escalera', o, {
      forma: [[-45, 30], [45, 30], [45, -30], [15, -30], [15, -10], [-15, -10], [-15, 10], [-45, 10]],
      color: o.color || '#D9A441', altura: 2, grosor: 3, recto: true, semilla: 95
    });
  };
  /* Techos: 6 formas × cualquier material. Sin material, el triángulo liso de siempre. */
  var FORMA_TECHO = {
    dosAguas: [[-50, 20], [0, -26], [50, 20]],
    dosAguasLado: [[-62, 20], [-38, -22], [38, -22], [62, 20]],
    unaAgua: [[-50, 20], [-50, -4], [50, -24], [50, 20]],
    plano: [[-56, 10], [-56, -4], [-50, -10], [50, -10], [56, -4], [56, 10]],
    conico: [[-28, 30], [0, -46], [28, 30]],
    cupula: (function () { var p = [[-46, 22]]; for (var k = 0; k <= 20; k++) { var a = Math.PI + k * Math.PI / 20; p.push([46 * Math.cos(a), 22 + 44 * Math.sin(a)]); } p.push([46, 22]); return p; })()
  };
  C.formasTecho = Object.keys(FORMA_TECHO);
  C.techo = function (o) {
    o = o || {};
    var forma = FORMA_TECHO[o.forma] || FORMA_TECHO.dosAguas;
    if (!o.material) return suelta('techo', o, { forma: forma.map(function (p) { return [p[0] * 0.92, p[1] * 0.92]; }), color: o.color || '#C2453A', altura: 3, semilla: 97 });
    return conMaterial('techo', o, forma, o.material, { altura: o.altura || 3 });
  };
  /* Puerta suelta con picaporte. */
  C.puerta = function (o) {
    o = o || {};
    return suelta('puerta', o, {
      forma: [[-16, 28], [-16, -18], [-10, -26], [10, -26], [16, -18], [16, 28]], color: o.color || '#7E4A2A', altura: 2, semilla: 99,
      encima: function (g) { g.fillStyle = '#E9B44C'; g.beginPath(); g.arc(9, 4, 3, 0, Math.PI * 2); g.fill(); }
    });
  };
  /* Ventana suelta con marco y cruz. */
  C.ventanaCasa = function (o) {
    o = o || {};
    return suelta('ventanaCasa', o, {
      forma: F.rect(36, 36), color: o.color || '#F1E4C6', altura: 2, semilla: 101,
      encima: function (g) {
        g.fillStyle = '#CFE8F2'; g.fillRect(-13, -13, 26, 26);
        g.fillStyle = o.color || '#F1E4C6'; g.fillRect(-2, -13, 4, 26); g.fillRect(-13, -2, 26, 4);
      }
    });
  };
  /* Engranaje de 10 dientes con agujero. */
  C.engranaje = function (o) {
    o = o || {};
    var R = o.r || 30, d = 10, pts = [];
    for (var k = 0; k < d * 4; k++) {
      var a = k * Math.PI * 2 / (d * 4), rr = (k % 4 === 0 || k % 4 === 1) ? R : R * 0.78;
      pts.push([rr * Math.cos(a), rr * Math.sin(a)]);
    }
    return suelta('engranaje', o, {
      forma: pts, recto: true, color: o.color || '#8C8FA8', altura: 2, grosor: 3, semilla: 103,
      encima: function (g) { g.fillStyle = 'rgba(42,30,20,.65)'; g.beginPath(); g.arc(0, 0, R * 0.28, 0, Math.PI * 2); g.fill(); }
    });
  };
  /* Tuerca: hexágono con agujero. */
  C.tuerca = function (o) {
    o = o || {};
    return suelta('tuerca', o, {
      forma: F.poligono(6, o.r || 18, 0), recto: true, color: '#B8BCCF', altura: 2, semilla: 105,
      encima: function (g) { g.fillStyle = 'rgba(42,30,20,.65)'; g.beginPath(); g.arc(0, 0, (o.r || 18) * 0.42, 0, Math.PI * 2); g.fill(); }
    });
  };
  /* Cono de obra: naranja con franja blanca, sobre base cuadrada. */
  C.cono = function (o) {
    o = o || {};
    var base = PP.pieza({ forma: F.rect(48, 10), color: '#E07A3F', altura: 2, semilla: 107, clave: clave('cono-base', o) });
    var cuerpo = PP.pieza({
      forma: [[-20, 18], [-6, -26], [6, -26], [20, 18]], color: '#F08A3C', altura: 3, semilla: 109, clave: clave('cono', o),
      encima: function (g) { g.fillStyle = '#FFF6DC'; g.beginPath(); g.moveTo(-13, -4); g.lineTo(13, -4); g.lineTo(16, 6); g.lineTo(-16, 6); g.closePath(); g.fill(); }
    });
    return grupo([[base, 0, 22], [cuerpo, 0, 0]]);
  };
  /* Andamio: tres parantes y tres travesaños de cartón. */
  C.andamio = function (o) {
    o = o || {};
    var parante = PP.pieza({ forma: F.rect(10, 110), color: '#C89B62', altura: 2, semilla: 111, clave: clave('andamio-p', o) });
    var trav = PP.pieza({ forma: F.rect(110, 10), color: '#B48853', altura: 3, semilla: 113, clave: clave('andamio-t', o) });
    return grupo([[parante, -50, 0], [parante, 0, 0], [parante, 50, 0], [trav, 0, -40], [trav, 0, 0], [trav, 0, 40]]);
  };
  /* Grúa: torre, pluma, contrapeso y gancho. */
  C.grua = function (o) {
    o = o || {};
    var col = o.color || '#F2C14E';
    var torre = PP.pieza({
      forma: F.rect(20, 120), color: col, altura: 2, semilla: 115, clave: clave('grua-torre', o),
      encima: function (g) {
        g.strokeStyle = 'rgba(42,30,20,.45)'; g.lineWidth = 2;
        for (var y = -56; y < 56; y += 16) { g.beginPath(); g.moveTo(-8, y); g.lineTo(8, y + 16); g.stroke(); }
      }
    });
    var pluma = PP.pieza({ forma: F.rect(140, 14), color: col, altura: 3, semilla: 117, clave: clave('grua-pluma', o) });
    var peso = PP.pieza({ forma: F.rect(24, 20), color: '#8C8FA8', altura: 3, semilla: 119, clave: clave('grua-peso', o) });
    var gancho = PP.pieza({ forma: [[-8, -6], [8, -6], [8, 6], [0, 12], [-8, 6]], color: '#3B2F25', altura: 3, recto: true, semilla: 121, clave: clave('grua-gancho', o) });
    var g = grupo([[torre, 0, 0], [pluma, 40, -62], [peso, -18, -50], [gancho, 92, -10]]);
    var dib = g.dibujar;
    g.dibujar = function (ctx, x, y, a) {
      if (!ctx) return;
      ctx.save(); ctx.strokeStyle = '#3B2F25'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + 92, y - 56); ctx.lineTo(x + 92, y - 16); ctx.stroke(); ctx.restore();
      dib(ctx, x, y, a);
    };
    return g;
  };

  /* Portal de castillo de ladrillo: dos torres con chapiteles, muro almenado con arco y reja.
     Genérico: sin escudos, sin letrero y sin nombres. Mide unos 300 × 300 (base en y = 130). */
  function ladrillos(x0, y0, x1, y1) {
    return function (g) {
      g.save(); g.strokeStyle = 'rgba(233,220,192,.55)'; g.lineWidth = 1.2;
      for (var y = y0, j = 0; y < y1; y += 11, j++) {
        g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
        for (var x = x0 + (j % 2 ? 11 : 0); x < x1; x += 22) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 11); g.stroke(); }
      }
      g.restore();
    };
  }
  function almenas(x0, x1, y, alto, paso) {
    var pts = [], arriba = false;
    for (var x = x0; x < x1; x += paso) {
      var x2 = Math.min(x + paso, x1);
      pts.push([x, arriba ? y - alto : y]); pts.push([x2, arriba ? y - alto : y]);
      arriba = !arriba;
    }
    return pts;
  }
  C.portal = function (o) {
    o = o || {};
    var LAD = o.color || '#B5553C', TEJA = o.techo || '#9E3B2E', CORNISA = '#E9DCC0';
    function arcoPts(cx, cy, r, desde, hasta, n) { var p = []; for (var k = 0; k <= n; k++) { var a = desde + (hasta - desde) * k / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; }
    /* Reja dentro del arco, con el jardín detrás. */
    var hueco = [[-58, 130], [-58, 40]].concat(arcoPts(0, 40, 58, Math.PI, 2 * Math.PI, 20)).concat([[58, 40], [58, 130]]);
    var reja = PP.pieza({
      forma: hueco, recto: true, color: '#9DBF8A', altura: 1, grosor: 1, clave: clave('portal-reja', o),
      encima: function (g) {
        g.fillStyle = '#2E2A36';
        for (var x = -54; x <= 54; x += 9) g.fillRect(x - 1.5, -20, 3, 150);
        g.fillRect(-58, 62, 116, 4); g.fillRect(-58, 110, 116, 4);
      }
    });
    /* Muro con arco y almenas arriba. */
    var muro = [[-87, 130], [-87, -45]].concat(almenas(-87, 87, -45, 12, 14)).concat([[87, -45], [87, 130], [58, 130], [58, 40]])
      .concat(arcoPts(0, 40, 58, 2 * Math.PI, Math.PI, 20)).concat([[-58, 40], [-58, 130]]);
    var pared = PP.pieza({ forma: muro, recto: true, color: LAD, altura: 2, grosor: 3, semilla: 131, clave: clave('portal-muro', o), encima: ladrillos(-87, -45, 87, 130) });
    /* Torre: cuerpo de ladrillo con dos ventanas angostas y una cornisa. */
    var torre = PP.pieza({
      forma: [[-28, 130], [-28, -70], [28, -70], [28, 130]], recto: true, color: LAD, altura: 3, grosor: 3, semilla: 133, clave: clave('portal-torre', o),
      encima: function (g) {
        ladrillos(-28, -70, 28, 130)(g);
        g.fillStyle = '#2E2A36'; g.fillRect(-6, -40, 12, 22); g.fillRect(-6, 60, 12, 26);
        g.fillStyle = CORNISA; g.fillRect(-28, -70, 56, 6);
      }
    });
    var capitel = PP.pieza({
      forma: [[-36, -68], [-36, -86]].concat(almenas(-36, 36, -86, 8, 12)).concat([[36, -86], [36, -68]]),
      recto: true, color: LAD, altura: 4, grosor: 2, semilla: 135, clave: clave('portal-capitel', o),
      encima: function (g) { g.fillStyle = CORNISA; g.fillRect(-36, -72, 72, 4); }
    });
    var chapitel = PP.pieza({ forma: [[-26, -88], [0, -160], [26, -88]], recto: true, color: TEJA, altura: 4, semilla: 137, clave: clave('portal-chapitel', o) });
    var torrecilla = PP.pieza({ forma: [[-9, -86], [-9, -98], [0, -116], [9, -98], [9, -86]], recto: true, color: TEJA, altura: 5, grosor: 1, semilla: 139, clave: clave('portal-torrecilla', o) });
    var partes = [[reja, 0, 0], [pared, 0, 0]];
    [-115, 115].forEach(function (x) {
      partes.push([torre, x, 0], [capitel, x, 0], [chapitel, x, 0], [torrecilla, x - 30, 0], [torrecilla, x + 30, 0]);
    });
    return grupo(partes);
  };

  /* ================= D2. Aberturas: puertas y ventanas ================= */
  var MARCO = '#F1E4C6', VIDRIO = '#CFE8F2';
  function arcoArriba(w, h, n) {
    /* Rectángulo con arco de medio punto arriba; base en y = h/2. */
    var r = w / 2, p = [[-r, h / 2], [-r, -h / 2 + r]];
    for (var k = 0; k <= (n || 16); k++) { var a = Math.PI + k * Math.PI / (n || 16); p.push([r * Math.cos(a), -h / 2 + r + r * Math.sin(a)]); }
    p.push([r, -h / 2 + r]); p.push([r, h / 2]);
    return p;
  }
  C.ventanaArco = function (o) {
    o = o || {};
    return suelta('ventanaArco', o, {
      forma: arcoArriba(40, 60), recto: true, color: o.color || MARCO, altura: 2, semilla: 161,
      encima: function (g) {
        g.fillStyle = VIDRIO; poli(g, arcoArriba(28, 48)); g.fill();
        g.fillStyle = o.color || MARCO; g.fillRect(-2, -24, 4, 48); g.fillRect(-14, 2, 28, 4);
      }
    });
  };
  C.ventanaRedonda = function (o) {
    o = o || {};
    return suelta('ventanaRedonda', o, {
      forma: F.circulo(22), color: o.color || MARCO, altura: 2, semilla: 163,
      encima: function (g) {
        g.fillStyle = VIDRIO; g.beginPath(); g.arc(0, 0, 15, 0, Math.PI * 2); g.fill();
        g.fillStyle = o.color || MARCO; g.fillRect(-2, -15, 4, 30); g.fillRect(-15, -2, 30, 4);
      }
    });
  };
  C.ventanaPostigos = function (o) {
    o = o || {};
    var col = o.postigo || '#3E8E7E';
    var postigo = PP.pieza({
      forma: F.rect(18, 40), color: col, altura: 3, semilla: 165, clave: clave('postigo', o),
      encima: function (g) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; for (var y = -16; y <= 16; y += 5) { g.beginPath(); g.moveTo(-6, y); g.lineTo(6, y + 2); g.stroke(); } }
    });
    return grupo([[C.ventanaCasa(), 0, 0], [postigo, -29, 0], [postigo, 29, 0]]);
  };
  C.puertaDoble = function (o) {
    o = o || {};
    return suelta('puertaDoble', o, {
      forma: arcoArriba(56, 76), recto: true, color: o.color || '#8A5A32', altura: 2, semilla: 167,
      encima: function (g) {
        var rnd = azar(168);
        for (var x = -26; x < 26; x += 8.6) { g.fillStyle = variar(o.color || '#8A5A32', rnd, 0.06); g.fillRect(x, -40, 8, 80); }
        g.fillStyle = 'rgba(40,25,15,.6)'; g.fillRect(-1, -40, 2, 80);
        g.fillStyle = '#E9B44C'; g.beginPath(); g.arc(-6, 8, 2.6, 0, Math.PI * 2); g.arc(6, 8, 2.6, 0, Math.PI * 2); g.fill();
      }
    });
  };
  C.porton = function (o) {
    o = o || {};
    return suelta('porton', o, {
      forma: F.rect(92, 64), color: o.color || '#C9CDD8', altura: 2, grosor: 3, semilla: 169,
      encima: function (g) {
        for (var y = -32; y < 32; y += 13) {
          g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-46, y, 92, 2);
          g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-46, y + 11, 92, 2);
        }
        g.fillStyle = '#6E6A78'; g.fillRect(-10, 22, 20, 3);
      }
    });
  };
  C.reja = function (o) {
    o = o || {};
    var col = o.color || '#2E2A36';
    var barra = PP.pieza({ forma: [[-2.5, 30], [-2.5, -26], [0, -32], [2.5, -26], [2.5, 30]], recto: true, color: col, altura: 2, grosor: 1, semilla: 171, clave: clave('reja-barra', o) });
    var riel = PP.pieza({ forma: F.rect(84, 5), color: col, altura: 3, grosor: 1, semilla: 173, clave: clave('reja-riel', o) });
    var partes = [];
    for (var x = -36; x <= 36; x += 12) partes.push([barra, x, 0]);
    partes.push([riel, 0, -14], [riel, 0, 18]);
    return grupo(partes);
  };
  C.vitral = function (o) {
    o = o || {};
    return suelta('vitral', o, {
      forma: arcoArriba(46, 70), recto: true, color: '#3B3542', altura: 2, semilla: 175,
      encima: function (g) {
        var cols = ['#E05A3A', '#F2C14E', '#3F7CC2', '#3E8E7E', '#7A5CA8', '#EFA0B0'], rnd = azar(176), k = 0;
        g.save(); poli(g, arcoArriba(38, 62)); g.clip();
        for (var y = -31; y < 31; y += 12) for (var x = -19; x < 19; x += 12.7) {
          g.fillStyle = cols[(k++ + Math.floor((rnd() + 0.5) * 3)) % cols.length];
          poli(g, [[x + 1, y + 1], [x + 12, y + 1 + rnd() * 3], [x + 11.5, y + 11], [x + 1 + rnd() * 2, y + 11]]); g.fill();
        }
        g.restore();
        g.fillStyle = 'rgba(255,255,255,.18)'; poli(g, [[-19, 10], [-19, -6], [4, -31], [16, -31]]); g.fill();
      }
    });
  };

  /* ================= D3. Detalles de fachada ================= */
  C.chimenea = function (o) {
    o = o || {};
    return conMaterial('chimenea', o, [[-14, 30], [-14, -22], [-18, -22], [-18, -32], [18, -32], [18, -22], [14, -22], [14, 30]], o.material || 'ladrillo');
  };
  C.balcon = function (o) {
    o = o || {};
    var col = o.color || '#E9DCC0';
    var losa = PP.pieza({ forma: F.rect(104, 10), color: col, altura: 2, grosor: 3, semilla: 177, clave: clave('balcon-losa', o) });
    var pasamanos = PP.pieza({ forma: F.rect(104, 6), color: col, altura: 3, grosor: 2, semilla: 179, clave: clave('balcon-pasa', o) });
    var poste = PP.pieza({ forma: F.rect(6, 26), color: PP.oscurecer(col, 0.85), altura: 2, grosor: 1, semilla: 181, clave: clave('balcon-poste', o) });
    var partes = [];
    for (var x = -46; x <= 46; x += 11.5) partes.push([poste, x, -4]);
    partes.push([losa, 0, 12], [pasamanos, 0, -18]);
    return grupo(partes);
  };
  C.toldo = function (o) {
    o = o || {};
    var pts = [[-50, -16], [50, -16], [58, 10]];
    for (var k = 0; k <= 8; k++) { var x = 58 - k * 14.5; pts.push([x, 10]); pts.push([x - 7.25, 17]); }
    pts.pop(); pts.push([-58, 10]);
    var a = o.color || '#C2453A';
    return suelta('toldo', o, {
      forma: pts, recto: true, color: '#FFF6DC', altura: 3, semilla: 183,
      encima: function (g) {
        g.fillStyle = a;
        for (var i = 0; i < 8; i += 2) { var x0 = -58 + i * 14.5, x1 = x0 + 14.5; poli(g, [[x0 + 8 - i * 1.0, -16], [x1 + 8 - (i + 1) * 1.0, -16], [x1, 20], [x0, 20]]); g.fill(); }
        g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-58, 6, 116, 4);
      }
    });
  };
  C.escaleraExterior = function (o) {
    o = o || {};
    var escalones = conMaterial('escaleraExterior', o, [[-50, 34], [50, 34], [50, -34], [26, -34], [26, -17], [0, -17], [0, 0], [-25, 0], [-25, 17], [-50, 17]], o.material || 'sillar');
    var baranda = PP.pieza({ forma: [[-52, 4], [44, -58], [48, -52], [-48, 10]], recto: true, color: '#3B3542', altura: 4, grosor: 1, semilla: 185, clave: clave('escalera-baranda', o) });
    var poste = PP.pieza({ forma: F.rect(5, 26), color: '#3B3542', altura: 3, grosor: 1, semilla: 187, clave: clave('escalera-poste', o) });
    return grupo([[escalones, 0, 0], [poste, -37, 6], [poste, -12, -11], [poste, 13, -28], [poste, 38, -45], [baranda, 0, 0]]);
  };
  C.torre = function (o) {
    o = o || {};
    var cuerpo = conMaterial('torre', o, F.rect(56, 120), o.material || 'piedra', { altura: 3 });
    var corona = conMaterial('torre-corona', o, [[-34, 8], [-34, -6]].concat(almenas(-34, 34, -6, 10, 11)).concat([[34, -6], [34, 8]]), o.material || 'piedra', { altura: 4 });
    var punta = C.techo({ forma: 'conico', material: o.techo || 'pizarra', altura: 4 });
    return grupo([[cuerpo, 0, 30], [corona, 0, -36], [punta, 0, -80]]);
  };
  C.almenas = function (o) {
    o = o || {};
    return conMaterial('almenas', o, [[-62, 14], [-62, -6]].concat(almenas(-62, 62, -6, 12, 13)).concat([[62, -6], [62, 14]]), o.material || 'piedra');
  };
  C.puente = function (o) {
    o = o || {};
    var tablero = conMaterial('puente-tablero', o, F.rect(170, 14), 'madera', { altura: 2 });
    var poste = PP.pieza({ forma: F.rect(12, 44), color: '#8A5A32', altura: 3, grosor: 2, semilla: 189, clave: clave('puente-poste', o) });
    var g = grupo([[tablero, 0, 0], [poste, -80, -14], [poste, 80, -14], [poste, 0, -14]]);
    var dib = g.dibujar;
    g.dibujar = function (ctx, x, y, a) {
      dib(ctx, x, y, a);
      if (!ctx) return;
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = '#B8935A'; ctx.lineWidth = 2.5;
      [-28, -18].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(-80, yy); ctx.quadraticCurveTo(-40, yy + 8, 0, yy); ctx.quadraticCurveTo(40, yy + 8, 80, yy); ctx.stroke(); });
      ctx.restore();
    };
    return g;
  };
  /* Farol de pared (no de poste): soporte corto y farol con luz cálida. */
  C.farol = function (o) {
    o = o || {};
    var soporte = PP.pieza({ forma: [[-22, -16], [-4, -16], [-4, -12], [-18, -12], [-18, 4], [-22, 4]], recto: true, color: '#3B3542', altura: 2, grosor: 1, semilla: 191, clave: clave('farol-soporte', o) });
    var farol = PP.pieza({
      forma: [[-10, 18], [-12, -6], [-6, -16], [6, -16], [12, -6], [10, 18]], recto: true, color: '#3B3542', altura: 3, semilla: 193, clave: clave('farol', o),
      encima: function (g) { g.fillStyle = '#FFD86B'; g.fillRect(-7, -6, 14, 20); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(-5, -4, 3, 15); }
    });
    return grupo([[soporte, 0, 0], [farol, 6, 0]]);
  };

  /* ================= D4. Suelos y caminos (con material) ================= */
  Object.assign(MAT, {
    baldosa: { base: '#9A8F80', suelo: true, pintar: function (g, a, b, c, d) {
      for (var y = b, j = 0; y < d; y += 16, j++) for (var x = a, i = 0; x < c; x += 16, i++) { g.fillStyle = (i + j) % 2 ? '#3B3542' : '#EFE8D8'; g.fillRect(x + 1, y + 1, 14, 14); }
    } },
    adoquin: { base: '#5E5246', suelo: true, pintar: function (g, a, b, c, d) { hiladas(g, a, b, c, d, { alto: 13, largo: 19, junta: 2.5, colores: ['#8E7F70', '#9C8C7A', '#7E7062'], semilla: 31, redondo: 4 }); } },
    tablones: { base: '#6E4A2A', suelo: true, pintar: function (g, a, b, c, d) { hiladas(g, a, b, c, d, { alto: 13, largo: 70, junta: 1.5, colores: ['#C8955A', '#B98549', '#D3A066'], semilla: 32, var: 0.05 }); } },
    grava: { base: '#B8A88E', suelo: true, pintar: function (g, a, b, c, d) {
      var rnd = azar(33);
      g.save(); g.shadowColor = 'rgba(42,30,20,.4)'; g.shadowBlur = 1; g.shadowOffsetX = 0.6; g.shadowOffsetY = 0.8;
      for (var k = 0; k < (c - a) * (d - b) / 14; k++) {
        g.fillStyle = ['#8E8F98', '#A79A86', '#C9BFAE', '#7E7268'][Math.floor((rnd() + 0.5) * 4) % 4];
        g.beginPath(); g.ellipse ? g.ellipse(a + (rnd() + 0.5) * (c - a), b + (rnd() + 0.5) * (d - b), 2 + (rnd() + 0.5) * 2, 1.5 + (rnd() + 0.5) * 1.5, rnd() * 3, 0, Math.PI * 2) : g.rect(a, b, 2, 2); g.fill();
      }
      g.restore();
    } },
    caminoPiedras: { base: '#8DBA6A', suelo: true, pintar: function (g, a, b, c, d) {
      var rnd = azar(34), cy = (b + d) / 2;
      g.save(); sombraChica(g);
      for (var x = a + 14; x < c - 6; x += 30) {
        var y = cy + Math.sin(x / 25) * 8, r = 11 + (rnd() + 0.5) * 3, p = [];
        for (var t = 0; t < 9; t++) { var an = t * Math.PI * 2 / 9; p.push([x + Math.cos(an) * r * (0.8 + (rnd() + 0.5) * 0.3), y + Math.sin(an) * r * 0.7 * (0.8 + (rnd() + 0.5) * 0.3)]); }
        g.fillStyle = variar('#B4B4BC', rnd, 0.06); poli(g, p); g.fill();
      }
      g.restore();
    } },
    asfalto: { base: '#4A4A52', suelo: true, pintar: function (g, a, b, c, d) {
      var rnd = azar(35);
      for (var k = 0; k < (c - a) * (d - b) / 18; k++) { g.fillStyle = 'rgba(' + (rnd() > 0 ? '255,255,255,.12' : '0,0,0,.2') + ')'; g.fillRect(a + (rnd() + 0.5) * (c - a), b + (rnd() + 0.5) * (d - b), 1.5, 1.5); }
      g.fillStyle = '#F2C14E'; for (var x = a + 6; x < c; x += 30) g.fillRect(x, (b + d) / 2 - 2, 16, 4);
    } }
  });
  C.materialesSuelo = ['baldosa', 'adoquin', 'tablones', 'grava', 'caminoPiedras', 'asfalto'];
  C.suelo = function (o) {
    o = o || {};
    return conMaterial('suelo', o, F.rect(o.ancho || 130, o.alto || 70), o.material || 'baldosa', { altura: 1, grosor: 2 });
  };

  /* ================= D5. Obra ================= */
  C.pilaLadrillos = function (o) {
    o = o || {};
    var l = C.ladrillo({ material: o.material || 'ladrillo' }), partes = [];
    [[-50, 18], [0, 18], [50, 18], [-25, -6], [25, -6], [0, -30]].forEach(function (p) { partes.push([l, p[0] * 0.98, p[1]]); });
    return grupo(partes);
  };
  C.tablonesApilados = function (o) {
    o = o || {};
    var t = C.tabla({ largo: 110 });
    return grupo([[t, -4, 18], [t, 6, 0], [t, -2, -18]]);
  };
  C.saco = function (o) {
    o = o || {};
    return suelta('saco', o, {
      forma: [[-26, 30], [-30, 0], [-26, -26], [-18, -32], [18, -32], [26, -26], [30, 0], [26, 30]], recto: true, color: o.color || '#E6D8B8', altura: 2, semilla: 195,
      encima: function (g) {
        g.fillStyle = '#8C8FA8'; g.fillRect(-30, -6, 60, 16);
        g.strokeStyle = 'rgba(90,70,40,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-18, -32); g.lineTo(-14, -22); g.lineTo(18, -22); g.lineTo(18, -32); g.stroke();
      }
    });
  };
  C.balde = function (o) {
    o = o || {};
    var cuerpo = PP.pieza({
      forma: [[-18, 22], [-22, -18], [22, -18], [18, 22]], recto: true, color: o.color || '#8C96A3', altura: 2, semilla: 197, clave: clave('balde', o),
      encima: function (g) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-22, -18, 44, 4); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-21, 4, 42, 3); }
    });
    var g = grupo([[cuerpo, 0, 0]]);
    var dib = g.dibujar;
    g.dibujar = function (ctx, x, y, a) {
      if (ctx) { ctx.save(); ctx.strokeStyle = '#3B3542'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y - 16, 20, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); ctx.restore(); }
      dib(ctx, x, y, a);
    };
    return g;
  };
  C.carretilla = function (o) {
    o = o || {};
    var col = o.color || '#3F7CC2';
    var bandeja = PP.pieza({ forma: [[-34, -16], [30, -16], [20, 10], [-26, 10]], recto: true, color: col, altura: 3, semilla: 199, clave: clave('carretilla', o) });
    var mango = PP.pieza({ forma: [[24, -6], [52, 2], [50, 9], [20, 2]], recto: true, color: '#8A5A32', altura: 2, grosor: 2, semilla: 201, clave: clave('carretilla-mango', o) });
    var pata = PP.pieza({ forma: F.rect(6, 18), color: '#3B3542', altura: 2, grosor: 1, semilla: 203, clave: clave('carretilla-pata', o) });
    var rueda = PP.pieza({
      forma: F.circulo(13), color: '#2B2530', altura: 3, semilla: 59, clave: clave('auto-rueda', { r: 13 }),
      encima: function (g) { g.fillStyle = '#B8BCCF'; g.beginPath(); g.arc(0, 0, 6.8, 0, Math.PI * 2); g.fill(); }
    });
    return grupo([[mango, 0, 0], [pata, 18, 18], [bandeja, 0, 0], [rueda, -30, 18]]);
  };

  /* ================= E. Vehículos (vista de lado, el frente a la izquierda) =================
     Autos genéricos, sin marcas. Cada uno: carrocería con ventanas, puertas y luces,
     y dos ruedas con su rin. El suelo queda en y ≈ 31. */
  function auto(nombre, o, d) {
    var r = d.r || 13;
    var cuerpo = PP.pieza({
      forma: d.cuerpo, color: o.color || d.color, altura: 2, grosor: 3, semilla: d.semilla, clave: clave(nombre, o),
      encima: function (g) {
        g.save(); sombraChica(g); g.fillStyle = '#CFE8F2';
        d.ventanas.forEach(function (v) { g.beginPath(); v.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); g.closePath(); g.fill(); });
        g.restore();
        g.strokeStyle = 'rgba(30,20,38,.35)'; g.lineWidth = 1.5;
        (d.puertas || []).forEach(function (x) { g.beginPath(); g.moveTo(x, d.altoPuerta || -14); g.lineTo(x, 12); g.stroke(); });
        g.fillStyle = '#FFF3C4'; g.fillRect(d.faro[0], d.faro[1], 6, 5);
        g.fillStyle = '#C2453A'; g.fillRect(d.cola[0], d.cola[1], 4, 6);
        if (d.extra) d.extra(g);
      }
    });
    var rueda = PP.pieza({
      forma: F.circulo(r), color: '#2B2530', altura: 3, semilla: 59, clave: clave('auto-rueda', { r: r }),
      encima: function (g) {
        g.fillStyle = '#B8BCCF'; g.beginPath(); g.arc(0, 0, r * 0.52, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#6E6A78'; g.beginPath(); g.arc(0, 0, r * 0.18, 0, Math.PI * 2); g.fill();
      }
    });
    return grupo([[cuerpo, 0, 0]].concat(d.ruedas.map(function (x) { return [rueda, x, 18]; })));
  }
  /* Furgoneta alta de pasajeros. */
  C.furgoneta = function (o) {
    o = o || {};
    return auto('furgoneta', o, {
      color: '#F2C14E', semilla: 141, ruedas: [-40, 40],
      cuerpo: [[-64, 16], [-64, 0], [-60, -10], [-50, -46], [-44, -50], [58, -50], [63, -45], [64, 16]],
      ventanas: [[[-48, -42], [-36, -44], [-36, -24], [-54, -24]], [[-30, -44], [-6, -44], [-6, -24], [-30, -24]], [[0, -44], [24, -44], [24, -24], [0, -24]], [[30, -44], [56, -44], [56, -24], [30, -24]]],
      puertas: [-33, 27], altoPuerta: -22, faro: [-63, -6], cola: [60, -18]
    });
  };
  /* Cupé descapotable, pequeño y bajo. */
  C.cupe = function (o) {
    o = o || {};
    return auto('cupe', o, {
      color: '#D9453A', semilla: 143, ruedas: [-34, 34],
      cuerpo: [[-55, 16], [-55, -2], [-48, -10], [-26, -14], [-12, -28], [14, -30], [30, -14], [53, -11], [55, 16]],
      ventanas: [[[-9, -25], [12, -27], [24, -15], [-20, -14]]],
      puertas: [-12, 24], faro: [-54, -4], cola: [50, -8]
    });
  };
  /* Sedán largo y elegante. */
  C.sedanLargo = function (o) {
    o = o || {};
    return auto('sedanLargo', o, {
      color: '#2E2A36', semilla: 145, ruedas: [-46, 46],
      cuerpo: [[-70, 16], [-70, -4], [-62, -10], [-36, -14], [-20, -32], [30, -33], [42, -15], [68, -12], [70, 16]],
      ventanas: [[[-17, -29], [4, -30], [4, -17], [-30, -16]], [[9, -30], [27, -30], [37, -17], [9, -17]]],
      puertas: [-20, 6, 38], faro: [-69, -6], cola: [66, -9],
      extra: function (g) { g.fillStyle = 'rgba(233,236,242,.7)'; g.fillRect(-66, 2, 132, 2.5); }
    });
  };
  /* Auto pequeño de ciudad, alto y corto. */
  C.mini = function (o) {
    o = o || {};
    return auto('mini', o, {
      color: '#8DB84A', semilla: 147, ruedas: [-30, 30], r: 12,
      cuerpo: [[-50, 16], [-50, -4], [-44, -14], [-30, -20], [-14, -44], [34, -46], [44, -40], [50, -10], [50, 16]],
      ventanas: [[[-12, -40], [14, -41], [14, -20], [-27, -19]], [[19, -41], [33, -42], [40, -22], [19, -21]]],
      puertas: [16], altoPuerta: -18, faro: [-49, -9], cola: [46, -16]
    });
  };
  /* Sedán familiar de cuatro puertas. */
  C.sedan = function (o) {
    o = o || {};
    return auto('sedan', o, {
      color: '#E05A3A', semilla: 149, ruedas: [-40, 40],
      cuerpo: [[-65, 16], [-65, -2], [-56, -10], [-32, -14], [-14, -33], [26, -34], [42, -16], [63, -12], [65, 16]],
      ventanas: [[[-11, -30], [4, -31], [4, -17], [-26, -16]], [[9, -31], [24, -31], [35, -17], [9, -17]]],
      puertas: [-14, 6, 34], faro: [-64, -5], cola: [61, -8]
    });
  };
  /* Camioneta compacta, techo alto y recto. */
  C.camioneta = function (o) {
    o = o || {};
    return auto('camioneta', o, {
      color: '#3F7CC2', semilla: 151, ruedas: [-36, 36],
      cuerpo: [[-60, 16], [-60, -4], [-54, -14], [-38, -18], [-26, -42], [50, -44], [58, -40], [60, 16]],
      ventanas: [[[-23, -38], [-2, -39], [-2, -20], [-34, -19]], [[3, -39], [26, -39], [26, -20], [3, -20]], [[31, -39], [52, -40], [54, -22], [31, -21]]],
      puertas: [0, 29], altoPuerta: -18, faro: [-59, -10], cola: [56, -14],
      extra: function (g) { g.fillStyle = 'rgba(30,20,38,.28)'; g.fillRect(-56, 0, 114, 3); }
    });
  };
  /* Compacto de cinco puertas (hatchback). */
  C.compacto = function (o) {
    o = o || {};
    return auto('compacto', o, {
      color: '#C9CDD8', semilla: 153, ruedas: [-36, 36],
      cuerpo: [[-59, 16], [-59, -2], [-52, -10], [-34, -16], [-12, -38], [34, -40], [50, -26], [57, -14], [59, 16]],
      ventanas: [[[-9, -34], [9, -36], [9, -19], [-28, -18]], [[14, -36], [32, -36], [45, -22], [14, -20]]],
      puertas: [-12, 11], altoPuerta: -18, faro: [-58, -6], cola: [54, -12]
    });
  };
  /* Deportivo bajo con alerón. */
  C.deportivo = function (o) {
    o = o || {};
    return auto('deportivo', o, {
      color: '#F08A3C', semilla: 155, ruedas: [-40, 40],
      cuerpo: [[-65, 16], [-66, 4], [-54, -4], [-22, -10], [-8, -24], [18, -25], [32, -12], [54, -10], [56, -22], [68, -24], [67, -17], [62, -8], [66, 16]],
      ventanas: [[[-5, -21], [16, -22], [26, -12], [-16, -10]]],
      puertas: [-14, 26], altoPuerta: -9, faro: [-64, -1], cola: [62, -4]
    });
  };

  /* ================= C. Estación (Y6) ================= */
  C.panel = function (o) {
    o = o || {};
    return suelta('panel', o, { forma: F.rect(120, 140), color: '#3E8E7E', altura: o.altura || 3, semilla: o.semilla || 6, encima: celdas(112, 132, 4, 4) });
  };
  C.brazo = function (o) {
    o = o || {};
    return suelta('brazo', o, { forma: F.rect(o.largo || 120, 30), color: '#C89B62', altura: 2, carton: true, semilla: 4 });
  };
  C.modulo = function (o) {
    o = o || {};
    return suelta('modulo', o, { forma: F.poligono(8, o.r || 78), color: o.color || '#E07A3F', altura: 4, grosor: 3, semilla: 12 });
  };
  C.ventana = function (o) {
    o = o || {};
    return suelta('ventana', o, { forma: F.circulo(o.r || 26), color: '#FFF3C4', altura: 5, semilla: 13 });
  };
  /* Antena: cuenco mirando al cielo sobre un pie corto y ancho (forma ya revisada). */
  C.antena = function (o) {
    o = o || {};
    var pie = PP.pieza({ forma: [[-24, 11], [24, 11], [10, -11], [-10, -11]], color: '#C2453A', altura: 3, semilla: 8, clave: clave('antena-pie', o) });
    var cuenco = PP.pieza({ forma: F.cuenco(36), color: '#C2453A', altura: 3, semilla: 10, clave: clave('antena-cuenco', o) });
    return grupo([[pie, 0, 25], [cuenco, 0, 0]]);
  };
  C.nave = function (o) {
    o = o || {};
    return suelta('nave', o, { forma: [[-42, -18], [43, 0], [-42, 18], [-24, 0]], color: '#F2C14E', altura: 3, semilla: 14 });
  };
  C.estrella = function (o) {
    o = o || {};
    return suelta('estrella', o, { forma: F.estrella(o.r || 7), color: '#E9B44C', altura: 1, grosor: 1, recto: true });
  };
  C.planeta = function (o) {
    o = o || {};
    return suelta('planeta', o, { forma: F.circulo(o.r || 230), color: o.color || '#7FB069', altura: 1, grosor: 3, semilla: 11 });
  };

  /* Índice por categoría: la hoja del catálogo y quien busque piezas lo usan. */
  C.categorias = {
    matematicas: ['tarjeta', 'recta', 'marcador', 'cuenta', 'varilla', 'marco10', 'gema'],
    construccion: ['ladrillo', 'muro', 'bloque', 'viga', 'columna', 'columnaPiedra', 'arco', 'rampa', 'escalera', 'techo', 'puerta', 'ventanaCasa', 'engranaje', 'tuerca', 'cono', 'andamio', 'grua', 'portal'],
    /* Variantes «pieza:opción» (muro de cada material, techo forma:material). */
    materiales: ['muro:ladrillo', 'muro:ladrilloClaro', 'muro:adobe', 'muro:piedra', 'muro:sillar', 'muro:madera', 'muro:troncos', 'muro:guadua', 'muro:bahareque', 'muro:concreto', 'muro:corrugado', 'muro:vidrio'],
    techos: ['techo:dosAguas:tejas', 'techo:dosAguas:paja', 'techo:dosAguasLado:pizarra', 'techo:dosAguasLado:tejaVerde', 'techo:unaAgua:zinc', 'techo:unaAgua:tablillas',
      'techo:plano:concreto', 'techo:plano:madera', 'techo:conico:pizarra', 'techo:conico:tejas', 'techo:cupula:tejaVerde', 'techo:cupula:zinc'],
    aberturas: ['ventanaArco', 'ventanaRedonda', 'ventanaPostigos', 'puertaDoble', 'porton', 'reja', 'vitral'],
    detalles: ['chimenea', 'balcon', 'toldo', 'escaleraExterior', 'torre', 'almenas', 'puente', 'farol'],
    suelos: ['suelo:baldosa', 'suelo:adoquin', 'suelo:tablones', 'suelo:grava', 'suelo:caminoPiedras', 'suelo:asfalto'],
    obra: ['pilaLadrillos', 'tablonesApilados', 'saco', 'balde', 'carretilla'],
    vehiculos: ['furgoneta', 'cupe', 'sedanLargo', 'mini', 'sedan', 'camioneta', 'compacto', 'deportivo'],
    aldea: ['casa', 'arbol', 'arbusto', 'nube', 'tabla', 'carrito', 'cerca', 'hojaPasto', 'hojaRio'],
    estacion: ['panel', 'brazo', 'modulo', 'ventana', 'antena', 'nave', 'estrella', 'planeta']
  };
})();
