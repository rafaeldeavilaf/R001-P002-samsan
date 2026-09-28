/* ============================================================
   SAMSAN — PORTADA
   La Caverna viva detras del aviso de "en construccion": el
   explorador sube y baja por la cuerda entre paradas, y a veces
   celebra. Es decoracion: no responde a nada ni pide nada.
   Con movimiento reducido se pinta un solo cuadro quieto.
   ============================================================ */
(function () {
  'use strict';
  var M = window.SAMSAN_MUNDO, cv = document.getElementById('mundo');
  if (!M || !cv || !window.SAMSAN_BIOMAS) return;
  /* Primero el arte procesado (si lo hay); si no, todo va por codigo. */
  window.SAMSAN_BIOMAS.caverna.cargar().then(function () {
    var L = M.crearLienzo(cv, { quietoSiReducido: true });
    var cav = window.SAMSAN_BIOMAS.caverna.crear(L, { pos: -6, piel: '#E8B088' });
    /* Trepa metro a metro hacia cada parada, como lo haria el nino. */
    var paradas = [-6, -14, -21, -9, -25, -3], i = 0, meta = -6, paso = 0, espera = 3, llego = true;
    L.alActualizar(function (dt) {
      var e = cav.explorador;
      if (e.pos !== meta) {
        paso -= dt;
        if (paso <= 0) { e.pos += e.pos < meta ? 1 : -1; paso = 0.2; }
        return;
      }
      if (!llego) {
        llego = true;
        if (i % 3 === 2) { e.celebrar(); cav.particulas.estallido(cav.constantes.ROPE_X - 10, cav.yOf(e.pos) - 16); }
      }
      espera -= dt;
      if (espera <= 0) { i = (i + 1) % paradas.length; meta = paradas[i]; llego = false; espera = 3.5; }
    });
    L.iniciar();
    window.__samsanPortada = { L: L, caverna: cav };
  });
})();
