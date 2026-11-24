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

  /* Ladrillo suelto. */
  C.ladrillo = function (o) {
    o = o || {};
    return suelta('ladrillo', o, { forma: F.rect(48, 22), color: o.color || '#B5553C', altura: o.altura || 2, semilla: 81 });
  };
  /* Muro de ladrillos: hiladas trabadas sobre mezcla clara. */
  C.muro = function (o) {
    o = o || {};
    var w = o.ancho || 150, h = o.alto || 84;
    return suelta('muro', o, {
      forma: F.rect(w, h), color: '#D9C4A0', altura: 2, grosor: 3, semilla: 83,
      encima: function (g) {
        g.save(); sombraChica(g); g.fillStyle = o.color || '#B5553C';
        var lh = 14, lw = 30, j = 0;
        for (var y = -h / 2 + 2; y < h / 2 - 2; y += lh, j++) {
          for (var x = -w / 2 + 2 - (j % 2 ? lw / 2 : 0); x < w / 2 - 2; x += lw) {
            var x0 = Math.max(x, -w / 2 + 2), x1 = Math.min(x + lw - 3, w / 2 - 2);
            if (x1 - x0 > 4) g.fillRect(x0, y, x1 - x0, lh - 3);
          }
        }
        g.restore();
      }
    });
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
  /* Techo suelto (triángulo) para armar casas. */
  C.techo = function (o) {
    o = o || {};
    return suelta('techo', o, { forma: [[-46, 18], [0, -24], [46, 18]], color: o.color || '#C2453A', altura: 3, semilla: 97 });
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
    construccion: ['ladrillo', 'muro', 'bloque', 'viga', 'columna', 'arco', 'rampa', 'escalera', 'techo', 'puerta', 'ventanaCasa', 'engranaje', 'tuerca', 'cono', 'andamio', 'grua'],
    aldea: ['casa', 'arbol', 'arbusto', 'nube', 'tabla', 'carrito', 'cerca', 'hojaPasto', 'hojaRio'],
    estacion: ['panel', 'brazo', 'modulo', 'ventana', 'antena', 'nave', 'estrella', 'planeta']
  };
})();
