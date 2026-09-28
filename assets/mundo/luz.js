/* ============================================================
   SAMSAN — MUNDO / LUZ.JS
   Luz dinamica por codigo (docs/direccion-grafica.md §6, capas 3,
   4 y 6): mapa de luz a media resolucion que se multiplica sobre
   la escena, resplandor aditivo en cada fuente, rayos desde la boca
   del pozo, halo del sol, tono de color y vineta.

   Configuracion (la declara el bioma):
     ambiente    color de la luz ambiente bajo tierra
     superficie  y del mundo donde empieza la superficie (arriba luz de dia)
     pozo        { x, w, alto }  boca del pozo: haz de luz hacia abajo
     rayos       { x, n, paso }  rayos inclinados desde la superficie
     sol         { x, y, factor }
     tono        [colorArriba, colorAbajo]  (soft-light)
     vineta      alfa de la vineta
   Fuentes: { x, y, r, c: 'r,g,b', kind: torch|crystal|lantern|lamp|gold, ph }
   ============================================================ */
(function (M) {
  'use strict';

  M.parpadeo = function (kind, ph, time) {
    if (kind === 'torch') return 0.86 + 0.1 * Math.sin(time * 13 + ph) + 0.06 * Math.sin(time * 29 + ph * 2);
    if (kind === 'crystal') return 0.82 + 0.18 * Math.sin(time * 1.6 + ph);
    if (kind === 'lantern') return 0.95 + 0.04 * Math.sin(time * 5 + ph);
    return 1;
  };

  M.crearLuz = function (L, cfg) {
    cfg = cfg || {};
    var LW = L.W / 2, LH = L.H / 2 + 2;
    var lc = document.createElement('canvas'); lc.width = LW; lc.height = LH;
    var lx = lc.getContext('2d');
    var luz = {
      cfg: cfg,
      fuentes: [],             // fijas del escenario
      brillos: [],             // puntos de oro: { x, y }
      dinamicas: function () { return []; }   // p. ej. la lampara del casco
    };
    function todas() { return luz.fuentes.concat(luz.dinamicas() || []); }
    luz.todas = todas;

    /* Mapa de luz a media resolucion, suavizado al escalar. */
    function mapa(ctx) {
      var cam = L.cam.y, time = L.time, s = L.s;
      lx.globalCompositeOperation = 'source-over';
      lx.fillStyle = cfg.ambiente || '#342D52'; lx.fillRect(0, 0, LW, LH);
      var sy = cfg.superficie != null ? (cfg.superficie - cam) / 2 : -1;
      if (sy > 0) { lx.fillStyle = '#FFFFFF'; lx.fillRect(0, 0, LW, sy + 2); }
      lx.globalCompositeOperation = 'lighter';
      if (cfg.pozo && sy > -cfg.pozo.alto / 2) {
        var g = lx.createLinearGradient(0, sy, 0, sy + cfg.pozo.alto / 2);
        g.addColorStop(0, 'rgba(255,240,215,0.95)'); g.addColorStop(1, 'rgba(255,240,215,0)');
        lx.fillStyle = g; lx.fillRect(cfg.pozo.x / 2, sy, cfg.pozo.w / 2, cfg.pozo.alto / 2);
      }
      todas().forEach(function (F) {
        var k = M.parpadeo(F.kind, F.ph || 0, time), x = F.x / 2, y = (F.y - cam) / 2, r = F.r / 2 * k;
        if (y < -r || y > LH + r) return;
        var gr = lx.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, 'rgba(' + F.c + ',0.95)'); gr.addColorStop(0.45, 'rgba(' + F.c + ',0.38)'); gr.addColorStop(1, 'rgba(' + F.c + ',0)');
        lx.fillStyle = gr; lx.fillRect(x - r, y - r, r * 2, r * 2);
      });
      luz.brillos.forEach(function (b) {
        var y = (b.y - cam) / 2; if (y < -4 || y > LH + 4) return;
        var gr = lx.createRadialGradient(b.x / 2, y, 0, b.x / 2, y, 5);
        gr.addColorStop(0, 'rgba(255,211,77,0.5)'); gr.addColorStop(1, 'rgba(255,211,77,0)');
        lx.fillStyle = gr; lx.fillRect(b.x / 2 - 5, y - 5, 10, 10);
      });
      ctx.save();
      ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(lc, 0, 0, LW, LH, 0, 0, LW * 2 * s, LH * 2 * s);
      ctx.restore();
    }

    /* Resplandor aditivo, rayos y halo del sol. Es lo primero que apaga el
       gobernador de rendimiento. */
    function resplandor(ctx) {
      var cam = L.cam.y, time = L.time, s = L.s, cv = L.canvas;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      todas().forEach(function (F) {
        var k = M.parpadeo(F.kind, F.ph || 0, time), x = F.x * s, y = (F.y - cam) * s, r = F.r * 0.42 * k * s;
        if (y < -r || y > cv.height + r) return;
        var gr = ctx.createRadialGradient(x, y, 0, x, y, r), a = F.kind === 'lamp' ? 0.16 : 0.3;
        gr.addColorStop(0, 'rgba(' + F.c + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + F.c + ',0)');
        ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      });
      if (cfg.rayos && cfg.superficie != null) {
        var sy2 = (cfg.superficie - cam) * s, R = cfg.rayos;
        if (sy2 > -210 * s && sy2 < cv.height) {
          for (var i = 0; i < R.n; i++) {
            var x0 = (R.x + i * R.paso) * s, sh = 0.5 + 0.5 * Math.sin(time * 0.6 + i * 1.7);
            var gg = ctx.createLinearGradient(0, sy2, 0, sy2 + 210 * s);
            gg.addColorStop(0, 'rgba(255,236,200,' + (0.07 + 0.04 * sh) + ')'); gg.addColorStop(1, 'rgba(255,236,200,0)');
            ctx.fillStyle = gg; ctx.beginPath();
            ctx.moveTo(x0, sy2); ctx.lineTo(x0 + 12 * s, sy2);
            ctx.lineTo(x0 - 38 * s, sy2 + 210 * s); ctx.lineTo(x0 - 58 * s, sy2 + 210 * s); ctx.closePath(); ctx.fill();
          }
        }
      }
      if (cfg.sol) {
        var sunY = (cfg.sol.y - cam * (L.opts.depth ? cfg.sol.factor : 1)) * s;
        var sg = ctx.createRadialGradient(cfg.sol.x * s, sunY, 0, cfg.sol.x * s, sunY, 70 * s);
        sg.addColorStop(0, 'rgba(255,230,170,0.35)'); sg.addColorStop(1, 'rgba(255,230,170,0)');
        ctx.fillStyle = sg; ctx.fillRect((cfg.sol.x - 70) * s, sunY - 70 * s, 140 * s, 140 * s);
      }
      ctx.restore();
    }

    /* Tono de color (calido arriba, frio abajo) y vineta. */
    function tono(ctx) {
      var cv = L.canvas, t = cfg.tono || ['rgba(255,196,140,0.45)', 'rgba(90,110,255,0.4)'];
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      var g = ctx.createLinearGradient(0, 0, 0, cv.height);
      g.addColorStop(0, t[0]); g.addColorStop(1, t[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'source-over';
      var v = ctx.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * 0.35, cv.width / 2, cv.height / 2, cv.width * 0.62);
      v.addColorStop(0, 'rgba(12,6,24,0)'); v.addColorStop(1, 'rgba(12,6,24,' + (cfg.vineta == null ? 0.55 : cfg.vineta) + ')');
      ctx.fillStyle = v; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.restore();
    }

    L.capa('alta', 10, function (ctx) { if (L.opts.light) mapa(ctx); });
    L.capa('alta', 20, function (ctx) { if (L.opts.light && L.opts.glow) resplandor(ctx); });
    L.capa('alta', 40, function (ctx) { if (L.opts.light) tono(ctx); });
    return luz;
  };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
