/* ============================================================
   SAMSAN — PROTOTIPO E: EXCAVAR (solo local)
   Una pared de bloques con numeros con signo. El explorador entra por
   arriba y cava un camino (abajo, izquierda, derecha; sin volver sobre
   sus pasos). Cada bloque roto suma su numero al contador del pico. La
   puerta de la gema abre solo si se llega con el contador igual al
   numero del candado. Sumar con signo ES la jugada: para elegir por
   donde cavar hay que sumar.
   Datos: window.PROTO.excavar (tools/gen/maths_y6_prototipos.py).
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN, $ = P.$, num = P.num, signo = P.signo;
  var juegos = (window.PROTO && window.PROTO.excavar) || [], juego = 0, gemas = 0;
  var S = null;                  // estado del puzzle en curso
  var imgExp = null;

  function empezar() {
    P.explorador(P.piel).then(function (uri) { imgExp = uri; if (S) pintar(); });
    P.partida(juegos[juego % juegos.length], jugar, function () {
      P.final({ rotulo: 'Prototype E · Dig', titulo: 'All four gem doors are open',
        texto: 'Every door opened with the exact number on its lock. Play again for new walls.', gemas: gemas,
        otra: function () { juego++; gemas = 0; empezar(); } });
    });
  }

  function jugar(p, i, total, alGanar) {
    S = { p: p, i: i, total: total, pos: null, camino: [], suma: 0, abierta: false, alGanar: alGanar, dif: null };
    var W = p.ancho, H = p.alto;
    var celdas = '';
    for (var f = 0; f < H; f++) for (var c = 0; c < W; c++) {
      var n = p.bloques[f][c];
      celdas += n === null
        ? '<div class="ex-roca" role="gridcell" aria-label="Rock"></div>'
        : '<button type="button" class="ex-bloque" data-f="' + f + '" data-c="' + c + '" aria-label="Block ' + num(n) + '">' + signo(n) + '</button>';
    }
    $('#proto').innerHTML =
      '<div class="ex">' +
        '<section class="k-panel ex-panel">' +
          '<div class="ex-cabeza"><p class="k-rotulo">Dig ' + (i + 1) + ' of ' + total + '</p>' +
            '<div class="k-gemas" id="hud">' + P.gemaSVG(22) + '<span id="gems">' + gemas + '</span></div></div>' +
          '<h2>The gem door opens at <b class="ex-meta">' + num(p.candado) + '</b>. Each block you dig adds its number to your pickaxe.</h2>' +
          '<div class="ex-marcador"><span class="ex-pico" aria-hidden="true">&#9935;</span>' +
            '<span class="ex-nombre">Pickaxe</span><b class="ex-valor" aria-live="polite">0</b><div class="ex-fichas" aria-hidden="true"></div></div>' +
        '</section>' +
        '<div class="ex-mina" style="--cols:' + W + '">' +
          '<div class="ex-cielo"><div class="ex-entrada" style="grid-column:' + (p.entrada + 1) + '"><img class="ex-exp" alt="Explorer"></div></div>' +
          '<div class="ex-pared" role="grid" aria-label="Wall of blocks">' + celdas + '</div>' +
          '<div class="ex-fondo"><button type="button" class="ex-puerta" style="grid-column:' + (p.puerta + 1) + '" disabled aria-label="Gem door, lock ' + num(p.candado) + '">' +
            '<span class="ex-candado">' + num(p.candado) + '</span>' + P.gemaSVG(26) + '<span class="ex-dif"></span></button></div>' +
        '</div>' +
        '<div class="k-botones ex-botones"><button type="button" class="k-boton" id="deshacer">&#8630; UNDO</button>' +
          '<button type="button" class="k-boton" id="reiniciar">RESTART</button></div>' +
        '<p class="k-mensaje ex-msg" aria-live="polite">Dig down from the start. Arrow keys dig too; Z undoes.</p>' +
      '</div>';
    Array.prototype.forEach.call(document.querySelectorAll('.ex-bloque'), function (b) {
      b.addEventListener('click', function () { cavar(+b.getAttribute('data-f'), +b.getAttribute('data-c')); });
    });
    $('.ex-puerta').addEventListener('click', abrir);
    $('#deshacer').addEventListener('click', deshacer);
    $('#reiniciar').addEventListener('click', function () { while (S.camino.length) deshacer(true); pintar(); });
    pintar();
  }

  function visitada(f, c) { return S.camino.some(function (q) { return q[0] === f && q[1] === c; }); }
  function alcance() {
    var p = S.p, out = [];
    if (!S.pos) return [[0, p.entrada]];
    var f = S.pos[0], c = S.pos[1];
    [[f + 1, c], [f, c - 1], [f, c + 1]].forEach(function (q) {
      if (q[0] < p.alto && q[1] >= 0 && q[1] < p.ancho && p.bloques[q[0]][q[1]] !== null && !visitada(q[0], q[1])) out.push(q);
    });
    return out;
  }
  function puedeAbrir() { return S.pos && S.pos[0] === S.p.alto - 1 && S.pos[1] === S.p.puerta; }

  function cavar(f, c) {
    if (!S || S.abierta) return;
    if (!alcance().some(function (q) { return q[0] === f && q[1] === c; })) {
      $('.ex-msg').textContent = 'You can only dig next to the explorer: down, left or right.';
      return;
    }
    var antes = S.suma;
    S.camino.push([f, c]); S.pos = [f, c]; S.suma += S.p.bloques[f][c]; S.dif = null;
    P.sonido('cavar');
    fichas(antes, S.suma);
    pintar();
    $('.ex-msg').textContent = num(antes) + ' ' + (S.p.bloques[f][c] < 0 ? '+ (' + num(S.p.bloques[f][c]) + ')' : '+ ' + S.p.bloques[f][c]) + ' = ' + num(S.suma) +
      (puedeAbrir() ? '. You are at the door: open it!' : '.');
  }
  function deshacer(silencio) {
    if (!S || S.abierta || !S.camino.length) return;
    var q = S.camino.pop(), antes = S.suma;
    S.suma -= S.p.bloques[q[0]][q[1]]; S.dif = null;
    S.pos = S.camino.length ? S.camino[S.camino.length - 1] : null;
    if (silencio !== true) { fichas(antes, S.suma); pintar(); $('.ex-msg').textContent = 'Undone. Pickaxe: ' + num(S.suma) + '.'; }
  }
  function abrir() {
    if (!S || S.abierta || !puedeAbrir()) return;
    if (S.suma === S.p.candado) {
      S.abierta = true; gemas++;
      pintar();
      $('.ex-msg').textContent = 'The lock reads ' + num(S.p.candado) + ' and so does your pickaxe. The door opens!';
      P.gemaCentro($('.ex-mina'), 'Gem ' + gemas + '!', function () { S.alGanar(); });
      return;
    }
    S.dif = S.p.candado - S.suma;
    P.sonido('mal');
    pintar();
    $('.ex-msg').textContent = 'The lock needs ' + num(S.p.candado) + ' and your pickaxe shows ' + num(S.suma) +
      ': ' + signo(S.dif) + ' away. Undo a few blocks and try another path.';
  }

  /* Fichas del contador: azules (+) y rojas (-). Al sumar un numero de signo
     contrario, las parejas se anulan (se ve el signo, no solo el numero). */
  var fichasGen = 0;
  function fichas(antes, despues) {
    var box = $('.ex-fichas'), gen = ++fichasGen;         // una animacion vieja nunca pinta encima de una nueva
    if (!box) return;
    if (Math.abs(despues) > 30) { box.innerHTML = ''; return; }   // numeros grandes: solo el numero
    if (Math.abs(antes) > 30) antes = 0;                          // venia de un numero grande: sin animacion
    function pinta(n, anula) {
      var h = '';
      for (var k = 0; k < Math.abs(n); k++) h += '<i class="ex-ficha ' + (n > 0 ? 'is-mas' : 'is-menos') + (k >= Math.abs(n) - anula ? ' is-anula' : '') + '"></i>';
      return h;
    }
    if (antes && despues !== antes && (Math.sign(despues - antes) !== Math.sign(antes))) {
      var k = Math.min(Math.abs(antes), Math.abs(despues - antes));
      box.innerHTML = pinta(antes, k) + '<i class="ex-choque"></i>' + pinta(Math.sign(despues - antes) * k, k);
      setTimeout(function () { if (box.isConnected && gen === fichasGen) box.innerHTML = pinta(despues, 0); }, 550);
    } else box.innerHTML = pinta(despues, 0);
  }

  function pintar() {
    if (!S) return;
    var al = alcance();
    Array.prototype.forEach.call(document.querySelectorAll('.ex-bloque'), function (b) {
      var f = +b.getAttribute('data-f'), c = +b.getAttribute('data-c');
      var cav = visitada(f, c), aqui = S.pos && S.pos[0] === f && S.pos[1] === c;
      b.classList.toggle('is-cavado', cav);
      b.classList.toggle('is-aqui', !!aqui);
      b.classList.toggle('is-alcance', !S.abierta && al.some(function (q) { return q[0] === f && q[1] === c; }));
      b.disabled = S.abierta;
    });
    var img = $('.ex-exp');
    if (img) {
      if (imgExp) img.src = imgExp;
      var destino = S.pos ? document.querySelector('.ex-bloque[data-f="' + S.pos[0] + '"][data-c="' + S.pos[1] + '"]') : $('.ex-entrada');
      if (destino && img.parentNode !== destino) destino.appendChild(img);
    }
    $('.ex-valor').textContent = num(S.suma);
    $('.ex-valor').className = 'ex-valor' + (S.suma > 0 ? ' is-mas' : S.suma < 0 ? ' is-menos' : '');
    var pu = $('.ex-puerta');
    pu.disabled = S.abierta || !puedeAbrir();
    pu.classList.toggle('is-lista', puedeAbrir() && !S.abierta);
    pu.classList.toggle('is-abierta', S.abierta);
    $('.ex-dif').textContent = S.dif ? signo(S.dif) : '';
    $('#deshacer').disabled = S.abierta || !S.camino.length;
  }

  /* Teclado: flechas cavan hacia ese lado; Enter abre; Z o Retroceso deshacen. */
  document.addEventListener('keydown', function (e) {
    if (!S || S.abierta || !$('.ex')) return;
    var f = S.pos ? S.pos[0] : -1, c = S.pos ? S.pos[1] : S.p.entrada;
    if (e.key === 'ArrowDown') { e.preventDefault(); cavar(f + 1, c); }
    else if (e.key === 'ArrowLeft' && S.pos) { e.preventDefault(); cavar(f, c - 1); }
    else if (e.key === 'ArrowRight' && S.pos) { e.preventDefault(); cavar(f, c + 1); }
    else if (e.key === 'Enter' && puedeAbrir()) { e.preventDefault(); abrir(); }
    else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') { e.preventDefault(); deshacer(); }
  });

  P.inicio({ rotulo: 'Prototype E', titulo: 'Dig to the gem',
    texto: 'Every block has a number. Dig a path down: each block adds its number to your pickaxe. The gem door opens only with the exact number on its lock.',
    alJugar: empezar });
  window.__protoExcavar = { estado: function () { return S; } };
})();
