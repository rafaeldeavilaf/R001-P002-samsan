/* ============================================================
   SAMSAN — BIOMA DE ESPAÑOL (minimo, sin arte)
   Solo existe para que tools/build.py arme los bocetos de Español
   (exige temas/<materia>/bioma.js). No dibuja nada: los bocetos
   grises usan cajas y colores planos. El arte del area de Español
   del parque llega solo si un boceto pasa la prueba de Rafael
   (docs/temas/espanol-y2-la-r.md, seccion 6).
   ============================================================ */
(function (BIOMAS) {
  'use strict';
  BIOMAS.espanol = {
    nombre: 'Español',
    arte: false,
    cargar: function () { return Promise.resolve(); }
  };
})(window.SAMSAN_BIOMAS = window.SAMSAN_BIOMAS || {});
