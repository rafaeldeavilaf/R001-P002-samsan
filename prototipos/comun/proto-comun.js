/* ============================================================
   SAMSAN — LO COMUN DE LOS BOCETOS (solo local, _local/proto-*.html)
   Pantalla inicial con el explorador de PixelLab en el mundo y sus 12
   tonos de piel, sonidos cortos, la gema grande en el centro al
   completar un reto y una secuencia de retos con "play again".
   Los textos viven aqui y en cada boceto: no es el motor
   (assets/engine.js no se toca hasta que un boceto pasa la prueba).
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN = {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  P.$ = $;
  P.num = function (n) { return n < 0 ? '−' + Math.abs(n) : String(n); };
  P.signo = function (n) { return n > 0 ? '+' + n : P.num(n); };

  /* Piel elegida: se recuerda en este navegador (conveniencia, no progreso). */
  P.piel = '#e8b088';
  try { P.piel = localStorage.getItem('samsan:proto-piel') || P.piel; } catch (e) { /* sin almacenamiento */ }

  /* ---------- Sonido: WebAudio, sin archivos ---------- */
  var ac = null;
  function tono(f, t0, dur, tipo, vol) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
      o.type = tipo || 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
    } catch (e) { /* sin audio */ }
  }
  P.sonido = function (tipo) {
    if (tipo === 'cavar') { tono(180, 0, 0.08, 'triangle', 0.08); tono(120, 0.05, 0.08, 'triangle', 0.06); }
    else if (tipo === 'paso') tono(520, 0, 0.06, 'square', 0.03);
    else if (tipo === 'mal') { tono(220, 0, 0.12, 'square', 0.04); tono(196, 0.1, 0.16, 'square', 0.04); }
    else if (tipo === 'veta') { tono(660, 0, 0.1); tono(880, 0.08, 0.14); }
    else if (tipo === 'gema') { [523, 659, 784, 1047].forEach(function (f, i) { tono(f, i * 0.09, 0.2, 'square', 0.05); }); }
  };

  /* ---------- Gema grande en el centro: se lee que paso ---------- */
  P.gemaCentro = function (host, texto, alTerminar) {
    var d = document.createElement('div');
    d.className = 'proto-gema';
    d.innerHTML = '<div class="proto-gema__brillo"></div>' + P.gemaSVG(96) + '<p>' + texto + '</p>';
    host.appendChild(d);
    P.sonido('gema');
    setTimeout(function () { d.classList.add('is-vuela'); }, 1300);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); if (alTerminar) alTerminar(); }, 1900);
  };
  P.gemaSVG = function (px) {
    return '<svg class="proto-gema__svg" width="' + px + '" height="' + px + '" viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="2" y="0" width="3" height="1" fill="#1E1426"/><rect x="1" y="1" width="5" height="1" fill="#1E1426"/>' +
      '<rect x="0" y="2" width="7" height="2" fill="#1E1426"/><rect x="1" y="4" width="5" height="1" fill="#1E1426"/>' +
      '<rect x="2" y="5" width="3" height="1" fill="#1E1426"/><rect x="3" y="6" width="1" height="1" fill="#1E1426"/>' +
      '<rect x="2" y="1" width="3" height="1" fill="#7FE3F0"/><rect x="1" y="2" width="5" height="2" fill="#2F9BB8"/>' +
      '<rect x="2" y="2" width="1" height="1" fill="#E8FEFF"/><rect x="2" y="4" width="3" height="1" fill="#1D4E6B"/>' +
      '<rect x="3" y="5" width="1" height="1" fill="#1D4E6B"/></svg>';
  };

  /* ---------- Explorador de PixelLab con casco y piel, como imagen ---------- */
  P.explorador = function (tono) {
    var M = window.SAMSAN_MUNDO, I = window.SAMSAN_IMG || {}, src = (I.comun || {})['mascota-base'], casco = (I.caverna || {})['sombrero-minero'];
    if (!M || !src || !M.sprites) return Promise.resolve(null);
    return Promise.all([M.sprites.cargar(src), casco ? M.sprites.cargar(casco) : Promise.resolve(null)]).then(function (r) {
      var base = tono ? M.sprites.conPiel(r[0], tono) : r[0];
      var c = r[1] ? M.sprites.conSombrero(base, r[1], { cx: 17.5, frente: 14 }) : base;
      return c.toDataURL ? c.toDataURL() : null;
    }, function () { return null; });
  };

  /* ---------- Pantalla inicial: el mundo, el explorador, la piel y PLAY ---------- */
  P.inicio = function (o) {
    var root = $('#proto');
    root.innerHTML =
      '<div class="k-juego">' +
        '<div class="k-escena"><canvas id="mundo" aria-hidden="true"></canvas>' +
          '<div class="k-gemas" id="hud" aria-label="Gems">' + P.gemaSVG(22) + '<span id="gems">0</span></div></div>' +
        '<section class="k-panel k-panel--sobre proto-inicio">' +
          '<p class="k-rotulo">' + o.rotulo + '</p><h2>' + o.titulo + '</h2><p>' + o.texto + '</p>' +
          '<p class="k-suave proto-piel-rotulo">Your explorer</p><div class="k-chips proto-pieles" id="pieles"></div>' +
          '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="play">PLAY</button></div>' +
        '</section>' +
      '</div>';
    var tonos = (window.GAME_UI && window.GAME_UI.armoury && window.GAME_UI.armoury.skins) || [];
    var pieles = $('#pieles');
    tonos.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'k-piel'; b.style.background = t.value;
      b.setAttribute('aria-label', t.name); b.setAttribute('aria-pressed', String(t.value === P.piel));
      b.addEventListener('click', function () {
        P.piel = t.value;
        try { localStorage.setItem('samsan:proto-piel', t.value); } catch (e) { /* nada */ }
        Array.prototype.forEach.call(pieles.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        if (P.mundo && P.mundo.cav) P.mundo.cav.explorador.fijarPiel(t.value);
      });
      pieles.appendChild(b);
    });
    P.mundoEn($('#mundo'));
    $('#play').addEventListener('click', function () { P.sonido('paso'); o.alJugar(); });
  };

  /* El mundo del bioma (escenario del montacargas) en un lienzo. */
  P.mundo = null;
  P.mundoEn = function (canvas) {
    var B = window.SAMSAN_BIOMAS && window.SAMSAN_BIOMAS.caverna;
    if (!B || !B.escenario || !canvas || !canvas.getContext || !canvas.getContext('2d')) return Promise.resolve(null);
    return B.escenario(canvas).then(function (E) {
      P.mundo = E;
      E.cav.explorador.fijarPiel(P.piel);
      E.L.iniciar();
      return E;
    }, function () { return null; });
  };

  /* ---------- Secuencia de puzzles ---------- */
  P.partida = function (lista, jugar, alFinal) {
    var i = 0;
    function siguiente() {
      if (i >= lista.length) { alFinal(); return; }
      jugar(lista[i], i, lista.length, function () { i++; siguiente(); });
    }
    siguiente();
  };
  P.final = function (o) {
    var root = $('#proto');
    var g = '';
    for (var k = 0; k < o.gemas; k++) g += P.gemaSVG(40);
    root.innerHTML = '<section class="k-panel proto-final"><p class="k-rotulo">' + o.rotulo + '</p><h2>' + o.titulo + '</h2>' +
      '<div class="proto-final__gemas">' + g + '</div><p>' + o.texto + '</p>' +
      '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="otra">PLAY AGAIN</button></div></section>';
    $('#otra').addEventListener('click', o.otra);
  };
})();
