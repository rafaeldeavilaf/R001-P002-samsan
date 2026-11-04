// titulo: Year 2 Maths games
// publicar: true
// usa: repaso
// incluye: maths-y2-recta/salto.js maths-y2-abaco/taller.js
/* ============================================================
   MENU DE LOS JUEGOS DE REPASO (Year 2, Maths)
   Una sola pagina: la pantalla principal con la Caverna viva, el explorador
   (con su tono de piel) y una tarjeta por juego. Cada juego tiene un boton MENU
   para volver. Los juegos se registran en P.juegosMenu (prototipos/comun/repaso.js)
   porque build.py marca la pagina con window.SAMSAN_MENU antes de incluirlos.
   Atajos para probar: #recta, #abaco, #abaco-r3 o #abaco-r3i2.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var $ = P.$, esc = P.esc;
  var JUEGOS = P.juegosMenu || [];

  var css = document.createElement('style');
  css.textContent = [
    '.mj-panel h2{margin:0 0 4px}',
    '.mj-lista{display:grid;gap:12px;margin:10px 0 6px}',
    '.mj-tarjeta{display:flex;align-items:center;gap:14px;width:100%;padding:10px 14px;text-align:left;border:3px solid #1E1426;border-radius:14px;background:#FFFDF6;color:#1E1426;box-shadow:0 4px 0 #1E1426;cursor:pointer;font:inherit;touch-action:manipulation}',
    '.mj-tarjeta:hover,.mj-tarjeta:focus-visible{background:#FFF3C4;outline:4px solid #2F9BB8;outline-offset:2px}',
    '.mj-tarjeta:active{transform:translateY(3px);box-shadow:0 1px 0 #1E1426}',
    '.mj-tarjeta svg{flex:0 0 auto;width:72px;height:56px;display:block}',
    '.mj-tarjeta b{display:block;font-size:1.25rem;font-weight:900;line-height:1.2}',
    '.mj-tarjeta small{display:block;font-size:.95rem;font-weight:700;color:#3B2F25}',
    '.mj-tarjeta .mj-ir{margin-left:auto;padding:6px 12px;border:3px solid #1E1426;border-radius:10px;background:#F2B73A;font-weight:900;font-size:1rem;white-space:nowrap}'
  ].join('');
  document.head.appendChild(css);

  /* Iconos por codigo, en pixel: la recta con un salto y un abaco pequeno. */
  var ICONOS = {
    recta: '<svg viewBox="0 0 36 28" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="1" y="19" width="34" height="3" fill="#1E1426"/><rect x="2" y="20" width="32" height="1" fill="#C9CED6"/>' +
      '<rect x="4" y="22" width="2" height="3" fill="#1E1426"/><rect x="17" y="22" width="2" height="4" fill="#6B3D22"/><rect x="30" y="22" width="2" height="3" fill="#1E1426"/>' +
      '<rect x="6" y="11" width="2" height="2" fill="#2F9BB8"/><rect x="8" y="8" width="3" height="2" fill="#2F9BB8"/><rect x="11" y="6" width="6" height="2" fill="#2F9BB8"/>' +
      '<rect x="17" y="8" width="3" height="2" fill="#2F9BB8"/><rect x="20" y="11" width="2" height="2" fill="#2F9BB8"/>' +
      '<rect x="27" y="7" width="2" height="12" fill="#6B3D22"/><rect x="29" y="7" width="6" height="5" fill="#FFD34D"/><rect x="29" y="7" width="6" height="1" fill="#1E1426"/></svg>',
    abaco: '<svg viewBox="0 0 36 28" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="0" y="0" width="36" height="28" fill="#1E1426"/><rect x="1" y="1" width="34" height="26" fill="#A0643A"/><rect x="3" y="3" width="30" height="22" fill="#F7EFDD"/>' +
      '<rect x="3" y="7" width="30" height="1" fill="#5B5B6E"/><rect x="3" y="14" width="30" height="1" fill="#5B5B6E"/><rect x="3" y="21" width="30" height="1" fill="#5B5B6E"/>' +
      '<rect x="4" y="5" width="4" height="5" fill="#C8382F"/><rect x="9" y="5" width="4" height="5" fill="#C8382F"/><rect x="24" y="5" width="4" height="5" fill="#C8382F"/><rect x="29" y="5" width="4" height="5" fill="#C8382F"/>' +
      '<rect x="4" y="12" width="4" height="5" fill="#2F6FD0"/><rect x="19" y="12" width="4" height="5" fill="#2F6FD0"/><rect x="24" y="12" width="4" height="5" fill="#2F6FD0"/><rect x="29" y="12" width="4" height="5" fill="#2F6FD0"/>' +
      '<rect x="4" y="19" width="4" height="5" fill="#D9A21C"/><rect x="9" y="19" width="4" height="5" fill="#D9A21C"/><rect x="14" y="19" width="4" height="5" fill="#D9A21C"/><rect x="29" y="19" width="4" height="5" fill="#D9A21C"/></svg>'
  };
  var TEXTOS = {
    recta: { titulo: 'Number line', sub: 'Add and take away. Hop!' },
    abaco: { titulo: 'Abacus', sub: 'Tens and units. Build and count!' }
  };

  function mostrarMenu() {
    var root = $('#proto');
    var tarjetas = '';
    JUEGOS.forEach(function (j) {
      var t = TEXTOS[j.id] || { titulo: j.titulo, sub: j.texto }, va = 0;
      try { va = parseInt(localStorage.getItem('samsan:proto-repaso-' + j.id), 10) || 0; } catch (e) { va = 0; }
      var sub = va > 0 ? 'Go on: round ' + (va + 1) + ' of ' + j.rondas : t.sub;
      tarjetas += '<button type="button" class="mj-tarjeta" data-juego="' + esc(j.id) + '" aria-label="Play ' + esc(t.titulo) + '">' +
        (ICONOS[j.id] || '') + '<span><b>' + esc(t.titulo) + '</b><small>' + esc(sub) + '</small></span><span class="mj-ir">PLAY &#9654;</span></button>';
    });
    root.innerHTML =
      '<div class="k-juego">' +
        '<div class="k-escena"><canvas id="mundo" aria-hidden="true"></canvas></div>' +
        '<section class="k-panel k-panel--sobre proto-inicio mj-panel" id="mj">' +
          '<p class="k-rotulo">Year 2 Maths</p><h2>Choose a game</h2>' +
          '<div class="mj-lista">' + tarjetas + '</div>' +
          '<p class="k-suave proto-piel-rotulo">Your explorer</p><div class="k-chips proto-pieles" id="pieles"></div>' +
        '</section>' +
      '</div>';
    pieles($('#pieles'));
    P.mundoEn($('#mundo'));
    Array.prototype.forEach.call(root.querySelectorAll('.mj-tarjeta'), function (b) {
      b.addEventListener('click', function () { abrir(b.getAttribute('data-juego'), ''); });
    });
    P.vozEn('Choose a game.');
  }
  function pieles(host) {
    var tonos = (window.GAME_UI && window.GAME_UI.armoury && window.GAME_UI.armoury.skins) || [];
    tonos.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'k-piel'; b.style.background = t.value;
      b.setAttribute('aria-label', t.name); b.setAttribute('aria-pressed', String(t.value === P.piel));
      b.addEventListener('click', function () {
        P.piel = t.value;
        try { localStorage.setItem('samsan:proto-piel', t.value); } catch (e) { /* nada */ }
        Array.prototype.forEach.call(host.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        if (P.mundo && P.mundo.cav) P.mundo.cav.explorador.fijarPiel(t.value);
      });
      host.appendChild(b);
    });
  }
  function abrir(id, atajo) {
    var j = JUEGOS.filter(function (x) { return x.id === id; })[0];
    if (!j) return mostrarMenu();
    if (P.mundo && P.mundo.L && P.mundo.L.detener) { try { P.mundo.L.detener(); } catch (e) { /* nada */ } }
    P.sonido('paso');
    j.empezar(atajo || '');
  }
  P.irMenu = mostrarMenu;

  var m = /^#(recta|abaco)(?:-(r\d+(?:i\d+)?))?$/.exec(location.hash || '');
  if (m) abrir(m[1], m[2] ? '#' + m[2] : '');
  else mostrarMenu();
})();
