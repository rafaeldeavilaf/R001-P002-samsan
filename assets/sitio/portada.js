/* ============================================================
   SAMSAN — PORTADA
   La Caverna viva detras del aviso de "en construccion": el
   explorador baja y sube de pie en el montacargas de la mina, para
   entre paradas y a veces celebra. El topo mira desde su hueco. Es
   decoracion: no responde a nada ni pide nada.
   Ningun personaje cuelga de una cuerda (panel de expertos, 27 sep
   2026): los cables van a la plataforma, nunca a la persona.
   Con movimiento reducido se pinta un solo cuadro quieto.
   ============================================================ */
(function () {
  'use strict';
  var M = window.SAMSAN_MUNDO, cv = document.getElementById('mundo');
  if (!M || !cv || !window.SAMSAN_BIOMAS) return;
  /* Primero el arte procesado (si lo hay); si no, todo va por codigo. */
  window.SAMSAN_BIOMAS.caverna.cargar().then(function () {
    var L = M.crearLienzo(cv, { quietoSiReducido: true });
    var cav = window.SAMSAN_BIOMAS.caverna.crear(L, { pos: 0, piel: '#E8B088' });
    var K = cav.constantes, e = cav.explorador;
    /* Baja metro a metro hacia cada parada y vuelve a la superficie. */
    var paradas = [0, -8, -15, -8, 0], i = 0, meta = 0, paso = 0, espera = 3, llego = true;
    L.alActualizar(function (dt) {
      if (e.pos !== meta) {
        paso -= dt;
        if (paso <= 0) { e.pos += e.pos < meta ? 1 : -1; paso = 0.22; }
        return;
      }
      if (!llego) {
        llego = true;
        if (meta === -15) { e.celebrar(); cav.particulas.estallido(K.POZO_X, K.yOf(e.pos) - 50); }
      }
      espera -= dt;
      if (espera <= 0) { i = (i + 1) % paradas.length; meta = paradas[i]; llego = false; espera = 3.5; }
    });
    L.iniciar();
    window.__samsanPortada = { L: L, caverna: cav };
  });
})();
