/* ============================================================
   SAMSAN — PORTADA
   La Caverna viva detras del aviso de "en construccion": el
   explorador espera de pie en la superficie, junto a la boca de la
   mina, y de vez en cuando da un saltito de alegria. El topo mira
   desde su hueco. Es decoracion: no responde a nada ni pide nada.
   Sin cuerda ni marco de polea (panel de expertos, 27 sep 2026):
   una persona colgando se lee mal para un nino.
   Con movimiento reducido se pinta un solo cuadro quieto.
   ============================================================ */
(function () {
  'use strict';
  var M = window.SAMSAN_MUNDO, cv = document.getElementById('mundo');
  if (!M || !cv || !window.SAMSAN_BIOMAS) return;
  /* Primero el arte procesado (si lo hay); si no, todo va por codigo. */
  window.SAMSAN_BIOMAS.caverna.cargar().then(function () {
    var L = M.crearLienzo(cv, { quietoSiReducido: true });
    var K = window.SAMSAN_BIOMAS.caverna.constantes;
    var cav = window.SAMSAN_BIOMAS.caverna.crear(L, {
      cuerda: false, suelo: { x: 212, pies: K.SURF }, cam: K.SURF - 150, piel: '#E8B088'
    });
    var espera = 5;
    L.alActualizar(function (dt) {
      espera -= dt;
      if (espera <= 0) {
        espera = 7;
        cav.explorador.celebrar();
        cav.particulas.estallido(212, K.SURF - 50);
      }
    });
    L.iniciar();
    window.__samsanPortada = { L: L, caverna: cav };
  });
})();
