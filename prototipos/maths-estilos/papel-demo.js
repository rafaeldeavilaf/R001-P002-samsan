// titulo: Paper library demo
// usa: papel
/* ============================================================
   DEMO DE LA BIBLIOTECA DE PAPEL (solo _local/, no se publica)
   La misma estación del fotograma aprobado, pero hecha con
   prototipos/comun/papel.js en Canvas: cada pieza se dibuja una vez
   y en cada cuadro solo se copia. La nave flota y el panel de repuesto
   se arrastra al hueco, para ver que se mueve sin costo.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN, PP = window.SAMSAN_PAPEL;
  var W = 800, H = 450;

  /* Todas las piezas salen del catálogo (prototipos/comun/papel-piezas.js). */
  function armar() {
    var C = PP.catalogo;
    return {
      cielo: PP.hoja(W, 300, { clave: 'demo-cielo' }),
      planeta: C.planeta(), brazo: C.brazo(), panel: C.panel(), repuesto: C.panel({ semilla: 9 }),
      antena: C.antena(), casco: C.modulo(), ventana: C.ventana(), nave: C.nave(), estrella: C.estrella()
    };
  }

  var ESTRELLAS = [[60, 40], [250, 30], [330, 70], [520, 50], [610, 90], [700, 40], [760, 130], [480, 120], [280, 300], [760, 260], [520, 400], [40, 200]];
  var HUECO = { x: 585, y: 140, w: 120, h: 140 };

  function jugar() {
    P.$('#proto').innerHTML =
      '<section class="pd-marco">' +
        '<canvas id="pd-lienzo" role="img" aria-label="Paper space station drawn with the paper library"></canvas>' +
        '<div class="k-panel pd-panel"><p class="k-rotulo">Paper library</p>' +
        '<p class="pd-reto"><b>Station task:</b> drag the spare panel into the empty slot.</p>' +
        '<p id="pd-fps" aria-live="polite"></p></div>' +
      '</section>';
    var c = P.$('#pd-lienzo'), ctx = c.getContext ? c.getContext('2d') : null;
    if (!ctx) { P.$('#pd-fps').textContent = 'Canvas no disponible en este navegador.'; return; }
    var dpr = PP.dpr();
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var t0 = performance.now();
    var A = armar(), fondo = PP.tablero(W, H);
    var listo = Math.round(performance.now() - t0);

    var rep = { x: 676, y: 362, a: 0.12, arrastrando: false, puesto: false };
    function aLienzo(e) {
      var r = c.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
    }
    c.addEventListener('pointerdown', function (e) {
      var q = aLienzo(e);
      if (!rep.puesto && Math.abs(q[0] - rep.x) < 70 && Math.abs(q[1] - rep.y) < 65) { rep.arrastrando = true; c.setPointerCapture && c.setPointerCapture(e.pointerId); }
    });
    c.addEventListener('pointermove', function (e) { if (rep.arrastrando) { var q = aLienzo(e); rep.x = q[0]; rep.y = q[1]; rep.a = 0; } });
    c.addEventListener('pointerup', function () {
      if (!rep.arrastrando) return;
      rep.arrastrando = false;
      var cx = HUECO.x + HUECO.w / 2, cy = HUECO.y + HUECO.h / 2;
      if (Math.abs(rep.x - cx) < 40 && Math.abs(rep.y - cy) < 40) { rep.x = cx; rep.y = cy; rep.puesto = true; P.sonido('gema'); }
      else P.sonido('paso');
    });

    var cuadros = 0, ultimo = performance.now();
    function cuadro(t) {
      if (!document.body.contains(c)) return;
      ctx.drawImage(fondo.lienzo, 0, 0, W, H);
      PP.dibujar(ctx, A.cielo, 0, 0);
      PP.cinta(ctx, 70, 18, -0.24); PP.cinta(ctx, 730, 18, 0.21);
      ESTRELLAS.forEach(function (e, i) { PP.dibujar(ctx, A.estrella, e[0], e[1] + Math.sin(t / 900 + i) * 1.5); });
      PP.dibujar(ctx, A.planeta, 110, 560);
      if (!rep.puesto) PP.hueco(ctx, HUECO.x, HUECO.y, HUECO.w, HUECO.h);
      PP.dibujar(ctx, A.brazo, 275, 211); PP.dibujar(ctx, A.brazo, 525, 211);
      PP.dibujar(ctx, A.panel, 155, 210);
      A.antena.dibujar(ctx, 400, 110);
      PP.dibujar(ctx, A.casco, 400, 212); PP.dibujar(ctx, A.ventana, 400, 212);
      PP.dibujar(ctx, A.nave, 160 + Math.sin(t / 1400) * 18, 88 + Math.sin(t / 700) * 6, Math.sin(t / 1400) * 0.08);
      PP.dibujar(ctx, A.repuesto, rep.x, rep.y, rep.a);
      cuadros++;
      if (t - ultimo > 1000) {
        P.$('#pd-fps').textContent = 'Pieces drawn once in ' + listo + ' ms · ' + Math.round(cuadros * 1000 / (t - ultimo)) + ' FPS';
        cuadros = 0; ultimo = t;
      }
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
  }

  var css = document.createElement('style');
  css.textContent = [
    '.pd-marco{max-width:980px;margin:0 auto}',
    '#pd-lienzo{display:block;width:100%;height:auto;aspect-ratio:16/9;border:3px solid #1E1426;border-radius:12px;touch-action:none}',
    '.pd-panel{margin-top:10px;background:#FFFDF6;color:#1E1426}',
    '.pd-reto{padding:8px 10px;border:2px dashed #1E1426;border-radius:8px;background:#FFF3C4}'
  ].join('\n');
  document.head.appendChild(css);

  P.$('#proto').innerHTML =
    '<section class="k-panel pd-panel"><p class="k-rotulo">Paper library</p><h2>Paper station</h2>' +
    '<p>The approved paper style, drawn once per piece and copied each frame.</p>' +
    '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="play">SEE IT</button></div></section>';
  P.$('#play').addEventListener('click', function () { P.sonido('paso'); jugar(); });
})();
