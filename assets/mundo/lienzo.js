/* ============================================================
   SAMSAN — MUNDO / LIENZO.JS
   Lienzo logico de 640 x 360, escalado con vecino mas cercano,
   camara en subpixel, bucle con dt y gobernador de rendimiento.

   Dos pasadas por cuadro:
     1. mundo: se dibuja en resolucion de pixel en `bx` (base de
        640 x 362) con la camara en entero; luego se escala a la
        pantalla desplazando la fraccion, para que el movimiento sea
        suave sin perder el pixel.
     2. alta: luz, particulas, tono e instrumentos se dibujan en
        `ctx`, a resolucion de pantalla, en coordenadas de mundo * s.

   Uso:
     var L = SAMSAN_MUNDO.crearLienzo(canvas, { altoMundo: 640 });
     L.capa('mundo', 10, function (bx, camI, L) { ... });
     L.capa('alta', 50, function (ctx, L) { ... });
     L.alActualizar(function (dt, L) { ... });
     L.iniciar();
   ============================================================ */
(function (M) {
  'use strict';

  var LENTO_MS = 20;      // un cuadro mas lento que esto cuenta como lento
  var LENTO_SEG = 2;      // ...durante este tiempo seguido, se degrada

  M.crearLienzo = function (canvas, cfg) {
    cfg = cfg || {};
    var W = M.W, H = M.H;
    var L = {
      W: W, H: H,
      canvas: canvas,
      ctx: canvas.getContext('2d'),
      base: document.createElement('canvas'),
      altoMundo: cfg.altoMundo || H,
      opts: cfg.opts || M.opcionesIniciales(),
      s: 2, dpr: 1,
      cam: { y: 0, objetivo: 0 },
      time: 0,
      lento: 0,
      degradado: [],        // en orden: 'glow', 'particles'
      corriendo: false
    };
    L.base.width = W; L.base.height = H + 2;
    L.bx = L.base.getContext('2d');
    if (L.bx) L.bx.imageSmoothingEnabled = false;

    var capas = { mundo: [], alta: [] }, actualizadores = [];
    L.capa = function (tipo, orden, fn) {
      capas[tipo].push({ orden: orden, fn: fn });
      capas[tipo].sort(function (a, b) { return a.orden - b.orden; });
      return fn;
    };
    L.alActualizar = function (fn) { actualizadores.push(fn); return fn; };

    /* Escala: el lienzo real sigue al tamano CSS por devicePixelRatio,
       con tope de x2 en el dpr (docs/direccion-grafica.md §6). */
    L.redimensionar = function () {
      var r = canvas.getBoundingClientRect();
      L.dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round((r.width || W) * L.dpr));
      canvas.height = Math.max(1, Math.round((r.height || H) * L.dpr));
      L.s = canvas.width / W;
    };
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(L.redimensionar).observe(canvas);
    L.redimensionar();

    /* Camara: sigue un objetivo en el eje vertical del mundo. Con
       movimiento suave apagado (o movimiento reducido), salta. */
    L.limiteCam = function (y) { return M.clamp(y, 0, Math.max(0, L.altoMundo - H)); };
    L.seguir = function (yMundo, fraccion) {
      L.cam.objetivo = L.limiteCam(yMundo - H * (fraccion == null ? 0.52 : fraccion));
    };
    L.fijarCam = function (y) { L.cam.y = L.cam.objetivo = L.limiteCam(y); };

    /* Gobernador: si durante LENTO_SEG cada cuadro tarda mas de LENTO_MS,
       apaga primero el resplandor y despues las particulas. Sin avisar. */
    L.medir = function (ms) {
      if (ms > LENTO_MS) L.lento += ms / 1000; else L.lento = 0;
      if (L.lento < LENTO_SEG) return null;
      L.lento = 0;
      if (L.opts.glow) { L.opts.glow = false; L.degradado.push('glow'); return 'glow'; }
      if (L.opts.particles) { L.opts.particles = false; L.degradado.push('particles'); return 'particles'; }
      return null;
    };

    /* Un cuadro completo. `dt` en segundos. Se expone para las pruebas. */
    L.cuadro = function (dt) {
      L.time += dt;
      for (var i = 0; i < actualizadores.length; i++) actualizadores[i](dt, L);
      if (L.opts.smooth) L.cam.y += (L.cam.objetivo - L.cam.y) * Math.min(1, dt * 4.5);
      else L.cam.y = Math.round(L.cam.objetivo);
      L.dibujar();
    };

    L.dibujar = function () {
      var ctx = L.ctx, bx = L.bx;
      if (!ctx || !bx) return;
      var camI = Math.floor(L.cam.y), frac = L.cam.y - camI, s = L.s;
      bx.clearRect(0, 0, W, H + 2);
      capas.mundo.forEach(function (c) { c.fn(bx, camI, L); });
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(L.base, 0, 0, W, H + 2, 0, -frac * s, W * s, (H + 2) * s);
      ctx.restore();
      capas.alta.forEach(function (c) { c.fn(ctx, L); });
    };

    /* Bucle con requestAnimationFrame. Se pausa si la pestana no se ve o
       si el lienzo sale de la pantalla (la portada no gasta bateria). */
    var ultimo = 0, rafId = 0, visible = true;
    function bucle(t) {
      rafId = 0;
      if (!L.corriendo) return;
      var ms = ultimo ? t - ultimo : 16.7;
      ultimo = t;
      L.medir(ms);
      L.cuadro(Math.min(0.05, ms / 1000));
      if (visible && !document.hidden) rafId = requestAnimationFrame(bucle);
    }
    function reanudar() {
      if (L.corriendo && !rafId && visible && !document.hidden) { ultimo = 0; rafId = requestAnimationFrame(bucle); }
    }
    document.addEventListener('visibilitychange', reanudar);
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; reanudar(); }).observe(canvas);
    }
    L.iniciar = function () {
      L.corriendo = true;
      L.cam.y = L.cam.objetivo;
      /* Con movimiento reducido se dibuja un cuadro quieto y se para:
         nada se mueve si nadie lo pide. */
      if (cfg.quietoSiReducido && M.movimientoReducido()) { L.cuadro(0); L.corriendo = false; return L; }
      reanudar();
      return L;
    };
    L.detener = function () { L.corriendo = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; };
    return L;
  };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
