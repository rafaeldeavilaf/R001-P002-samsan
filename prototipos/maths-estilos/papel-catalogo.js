// titulo: Paper pieces catalogue
// usa: papel
/* ============================================================
   HOJA DEL CATÁLOGO DE PIEZAS DE PAPEL (solo _local/, no se publica)
   Todas las piezas de prototipos/comun/papel-piezas.js, numeradas y con
   su nombre, sobre el tablero de cartón. Sirve también como hoja para
   la revisión de contenido infantil.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN, PP = window.SAMSAN_PAPEL, C = PP && PP.catalogo;
  var W = 960, CEL = 160, COLS = 6;

  /* [nombre, fábrica, escala] */
  var LISTA = [
    ['tarjeta 47', function () { return C.tarjeta({ texto: '47' }); }, 1],
    ['tarjeta 0.25', function () { return C.tarjeta({ texto: '0.25' }); }, 1],
    ['tarjeta 3/4', function () { return C.tarjeta({ texto: '3/4' }); }, 1],
    ['marcador', function () { return C.marcador(); }, 1],
    ['cuenta u / d / c', null, 1],
    ['varilla', function () { return C.varilla({ largo: 120 }); }, 1],
    ['marco10 (7)', function () { return C.marco10({ llenos: 7 }); }, 0.85],
    ['gema', function () { return C.gema(); }, 1.4],
    ['casa', function () { return C.casa(); }, 1.3],
    ['casa (techo verde)', function () { return C.casa({ techo: '#3E8E7E', color: '#F1E4C6' }); }, 1.3],
    ['arbol', function () { return C.arbol(); }, 1.3],
    ['arbusto', function () { return C.arbusto(); }, 1.4],
    ['nube', function () { return C.nube(); }, 1.3],
    ['tabla', function () { return C.tabla(); }, 1.2],
    ['carrito', function () { return C.carrito(); }, 1.3],
    ['cerca', function () { return C.cerca(); }, 1.2],
    ['panel', function () { return C.panel(); }, 0.75],
    ['brazo', function () { return C.brazo(); }, 0.9],
    ['modulo + ventana', null, 0.62],
    ['antena', function () { return C.antena(); }, 1.1],
    ['nave', function () { return C.nave(); }, 1.1],
    ['estrella', function () { return C.estrella({ r: 14 }); }, 1.6],
    ['planeta', function () { return C.planeta({ r: 230 }); }, 0.24]
  ];

  function etiqueta(ctx, n, nombre, x, y) {
    var t = n + '  ' + nombre;
    ctx.save();
    ctx.font = '800 13px Nunito, system-ui, sans-serif';
    var w = ctx.measureText ? ctx.measureText(t).width + 14 : 120;
    ctx.fillStyle = '#FFF6DC'; ctx.shadowColor = 'rgba(42,30,20,.3)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    ctx.fillRect(x - w / 2, y - 10, w, 20);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#1E1426'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t, x, y + 1);
    ctx.restore();
  }

  function mostrar() {
    P.$('#proto').innerHTML =
      '<section class="pc-marco"><canvas id="pc-lienzo" role="img" aria-label="Catalogue of paper pieces"></canvas>' +
      '<div class="k-panel pc-panel"><p class="k-rotulo">Paper pieces</p><p id="pc-info" aria-live="polite"></p></div></section>';
    var filas = Math.ceil(LISTA.length / COLS), H = filas * CEL + 330;
    var c = P.$('#pc-lienzo'), ctx = c.getContext ? c.getContext('2d') : null;
    if (!ctx || !C) { P.$('#pc-info').textContent = 'Canvas no disponible.'; return; }
    var dpr = PP.dpr();
    c.width = W * dpr; c.height = H * dpr; c.style.aspectRatio = W + ' / ' + H;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var t0 = performance.now();
    var fondo = PP.tablero(W, H);
    ctx.drawImage(fondo.lienzo, 0, 0, W, H);

    LISTA.forEach(function (e, i) {
      var cx = (i % COLS) * CEL + CEL / 2, cy = Math.floor(i / COLS) * CEL + CEL / 2 - 6;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(e[2], e[2]);
      if (e[0] === 'cuenta u / d / c') { C.cuenta({ valor: 'u' }).dibujar(ctx, -30, 0); C.cuenta({ valor: 'd' }).dibujar(ctx, 0, 0); C.cuenta({ valor: 'c' }).dibujar(ctx, 30, 0); }
      else if (e[0] === 'modulo + ventana') { C.modulo().dibujar(ctx, 0, 0); C.ventana().dibujar(ctx, 0, 0); }
      else e[1]().dibujar(ctx, 0, 0);
      ctx.restore();
      etiqueta(ctx, i + 1, e[0], cx, cy + CEL / 2 - 8);
    });

    /* Piezas anchas en su propia fila. */
    var y0 = filas * CEL + 20, n = LISTA.length;
    var r1 = C.recta({ inicio: 0, fin: 100, paso: 10, largo: 400 });
    r1.dibujar(ctx, 240, y0 + 40);
    C.marcador().dibujar(ctx, 240 + r1.xDe(70), y0 + 40 - 8 - C.marcador().punta);
    etiqueta(ctx, n + 1, 'recta 0-100 + marcador', 240, y0 + 86);
    var r2 = C.recta({ inicio: 0, fin: 1, paso: 0.1, largo: 400 });
    r2.dibujar(ctx, 720, y0 + 40);
    etiqueta(ctx, n + 2, 'recta 0-1 (decimales)', 720, y0 + 86);
    C.hojaRio({ ancho: W, y: y0 + 140 }).dibujar(ctx, 0, 0);
    etiqueta(ctx, n + 3, 'hojaRio', W / 2, y0 + 140);
    C.hojaPasto({ ancho: W, alto: H, borde: y0 + 210 }).dibujar(ctx, 0, 0);
    C.tabla().dibujar(ctx, 120, y0 + 262); C.casa().dibujar(ctx, 300, y0 + 244);
    C.arbol().dibujar(ctx, 420, y0 + 246); C.cerca().dibujar(ctx, 560, y0 + 256);
    C.carrito().dibujar(ctx, 700, y0 + 256); C.arbusto().dibujar(ctx, 840, y0 + 270);
    etiqueta(ctx, n + 4, 'hojaPasto con aldea', W / 2, H - 18);

    P.$('#pc-info').textContent = (n + 4) + ' entradas · todo dibujado en ' + Math.round(performance.now() - t0) + ' ms';
  }

  var css = document.createElement('style');
  css.textContent = [
    '.pc-marco{max-width:980px;margin:0 auto}',
    '#pc-lienzo{display:block;width:100%;height:auto;border:3px solid #1E1426;border-radius:12px}',
    '.pc-panel{margin-top:10px;background:#FFFDF6;color:#1E1426}'
  ].join('\n');
  document.head.appendChild(css);

  P.$('#proto').innerHTML =
    '<section class="k-panel pc-panel"><p class="k-rotulo">Paper pieces</p><h2>Catalogue</h2>' +
    '<p>Every reusable paper piece, numbered.</p>' +
    '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="play">SEE PIECES</button></div></section>';
  P.$('#play').addEventListener('click', function () { P.sonido('paso'); mostrar(); });
})();
