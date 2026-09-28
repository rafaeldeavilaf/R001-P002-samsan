// titulo: Grey sketch template
/* ============================================================
   PLANTILLA DE BOCETO GRIS (paso 2 del metodo, docs/decisiones-vigentes.md)
   Copia esta carpeta como prototipos/<materia>-<tema>/ y cambia solo
   el reto. Cajas y colores planos, sin arte ni generador; el nivel se
   escribe a mano aqui mismo. tools/build.py lo construye en
   _local/proto-<carpeta>-<nombre>.html y tools/humo_prototipos.js
   comprueba que carga sin errores de JS.
   Esta plantilla: un cuadro que se mueve con las flechas o los botones
   hasta la meta. Nada mas.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var NIVEL = { inicio: 1, meta: 7, ancho: 9 };           // a mano: es un boceto
  var x;

  function pintar() {
    var celdas = '';
    for (var i = 0; i < NIVEL.ancho; i++) {
      var fondo = i === x ? '#1E1426' : i === NIVEL.meta ? '#FFD34D' : '#D3D0DA';
      celdas += '<div style="flex:1;height:64px;border:2px solid #1E1426;background:' + fondo + '"></div>';
    }
    P.$('#gris-fila').innerHTML = celdas;
    P.$('#gris-msg').textContent = x === NIVEL.meta ? 'Goal!' : 'Reach the yellow box.';
  }
  function mover(d) {
    if (x === NIVEL.meta) return;
    x = Math.max(0, Math.min(NIVEL.ancho - 1, x + d));
    pintar();
    if (x === NIVEL.meta) P.gemaCentro(P.$('#gris-escena'), '+1', fin);
  }
  function fin() {
    P.final({ rotulo: 'Sketch', titulo: 'Done', texto: 'Template finished.', gemas: 1, otra: jugar });
  }
  function jugar() {
    x = NIVEL.inicio;
    P.$('#proto').innerHTML =
      '<section class="k-panel" id="gris-escena" style="position:relative">' +
        '<div id="gris-fila" style="display:flex;gap:4px"></div>' +
        '<p id="gris-msg" aria-live="polite"></p>' +
        '<div class="k-botones">' +
          '<button type="button" class="k-boton" data-d="-1" aria-label="Left">&#9664;</button>' +
          '<button type="button" class="k-boton" data-d="1" aria-label="Right">&#9654;</button>' +
        '</div>' +
      '</section>';
    Array.prototype.forEach.call(document.querySelectorAll('[data-d]'), function (b) {
      b.addEventListener('click', function () { mover(+b.getAttribute('data-d')); });
    });
    pintar();
  }
  document.addEventListener('keydown', function (e) {
    if (!P.$('#gris-fila')) return;
    if (e.key === 'ArrowLeft') mover(-1);
    else if (e.key === 'ArrowRight') mover(1);
  });
  P.inicio({ rotulo: 'Sketch', titulo: 'Grey sketch template', texto: 'Move to the yellow box.', alJugar: jugar });
})();
