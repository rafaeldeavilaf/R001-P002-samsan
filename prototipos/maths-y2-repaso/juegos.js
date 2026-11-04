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
    '.mj-panel{max-width:560px;margin:0 auto}',
    '.mj-bienvenida .k-escena{cursor:pointer}',
    '.mj-bienvenida .k-escena canvas{touch-action:manipulation}',
    '.mj-titulo{position:absolute;left:50%;top:6%;transform:translateX(-50%);padding:6px 22px;border:3px solid #1E1426;border-radius:14px;background:#FFF3C4;color:#1E1426;font-weight:900;font-size:clamp(1.5rem,5vw,2.4rem);text-align:center;line-height:1.1;box-shadow:0 5px 0 #1E1426;white-space:nowrap}',
    '.mj-titulo small{display:block;font-size:.55em;color:#5C4A3B}',
    '.mj-start{position:absolute;left:50%;bottom:7%;transform:translateX(-50%);min-width:220px;min-height:68px;font-size:1.6rem;animation:mj-late 1.2s ease-in-out infinite}',
    '@keyframes mj-late{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.06)}}',
    '@media (prefers-reduced-motion:reduce){.mj-start{animation:none}}',
    '@media (max-height:500px) and (orientation:landscape){.mj-bienvenida.k-juego{width:min(100%, calc((100svh - 24px) * 16 / 9))}.mj-titulo{font-size:1.5rem;top:5%}.mj-start{min-height:56px;font-size:1.3rem;bottom:6%}' +
      '.mj-panel{max-width:760px}.mj-lista{grid-template-columns:1fr 1fr}.mj-panel .rp-pj{display:none}}',
    '.mj-lista{display:grid;gap:12px;margin:10px 0 6px}',
    '.mj-tarjeta{display:flex;align-items:center;gap:14px;width:100%;padding:10px 14px;text-align:left;border:3px solid #1E1426;border-radius:14px;background:#FFFDF6;color:#1E1426;box-shadow:0 4px 0 #1E1426;cursor:pointer;font:inherit;touch-action:manipulation}',
    '.mj-tarjeta:hover,.mj-tarjeta:focus-visible{background:#FFF3C4;outline:4px solid #2F9BB8;outline-offset:2px}',
    '.mj-tarjeta:active{transform:translateY(3px);box-shadow:0 1px 0 #1E1426}',
    '.mj-tarjeta svg{flex:0 0 auto;width:72px;height:56px;display:block}',
    '.mj-tarjeta b{display:block;font-size:1.25rem;font-weight:900;line-height:1.2}',
    '.mj-tarjeta small{display:block;font-size:.95rem;font-weight:700;color:#3B2F25}',
    '@media (max-width:600px){.mj-panel .k-piel{width:44px;height:44px}.mj-tarjeta svg{width:56px;height:44px}.mj-tarjeta{padding:8px 10px;gap:10px}}',
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
    if (P.mundo && P.mundo.L && P.mundo.L.detener) { try { P.mundo.L.detener(); } catch (e) { /* nada */ } }
    /* El menu es un panel con los personajes: sin escena grande que no responda al dedo. */
    root.innerHTML = P.marcoMundo(
        '<section class="k-panel rp mj-panel" id="mj">' +
          '<p class="k-rotulo">Year 2 Maths</p><h2>Choose a game</h2>' +
          '<div class="rp-pj" id="mj-pj"></div>' +
          '<div class="mj-lista">' + tarjetas + '</div>' +
        '</section>');
    if (P.personajes) P.personajes($('#mj-pj'));
    Array.prototype.forEach.call(root.querySelectorAll('.mj-tarjeta'), function (b) {
      b.addEventListener('click', function () { abrir(b.getAttribute('data-juego'), ''); });
    });
    P.vozEn('Choose a game.');
  }
  /* Pantalla de bienvenida: la mina viva a toda la escena, el titulo y START.
     Tocar cualquier parte de la escena tambien empieza (el toque siempre hace algo). */
  function mostrarInicio() {
    var root = $('#proto');
    root.innerHTML =
      '<div class="k-juego mj-bienvenida">' +
        '<div class="k-escena" id="mj-escena"><canvas id="mundo" aria-hidden="true"></canvas>' +
          '<div class="mj-titulo"><small>Year 2</small>Maths games</div>' +
          '<button type="button" class="k-boton k-boton--primario mj-start" id="play">START &#9654;</button>' +
        '</div>' +
      '</div>';
    P.mundoEn($('#mundo')).then(function (E) {
      /* el explorador del ascensor queda a media altura */
      if (E && E.L && E.L.fijarCam && E.L.cam) E.L.fijarCam(E.L.cam.y + 40);
    });
    function empezar() { P.sonido('paso'); mostrarMenu(); }
    $('#play').addEventListener('click', function (e) { e.stopPropagation(); empezar(); });
    $('#mj-escena').addEventListener('click', empezar);
    P.vozEn('Welcome! Tap START.');
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
  else if (location.hash === '#menu') mostrarMenu();
  else mostrarInicio();
})();
