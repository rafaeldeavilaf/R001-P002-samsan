// titulo: Boceto · La aldea de Pip · Calle de long i
/* ============================================================
   BOCETO — LA ALDEA DE PIP, CALLE DE LONG I (solo _local/, no se publica)
   Para que Rafael apruebe el kit de escenarios y la jugada antes de
   construir el «modo aldea» en el motor (paso 3 de la propuesta v3).

   Jugada: Pip llega volando con un globo que trae un dibujo grande y su
   palabra con las letras clave resaltadas; la voz la dice. Se arrastra el
   globo a su casa o se toca la casa.
     Acierto   la puerta se abre, se asoma un vecino, el dibujo sube con
               confeti y queda en la ventana; Pip da una voltereta; +1 estrella.
     Error     la casa tiembla suave. 1.º error: Pip repite la palabra lento.
               2.º error: Pip dice las letras del sonido y brilla la casa.
     Bombilla  1) palabra lenta  2) brilla la casa  3) la ubica.
   Etapa de 5 globos; el panel de abajo (para el adulto) cambia 2, 3 o 4
   casas y muestra los otros escenarios del kit.
   ============================================================ */
(function () {
  'use strict';
  var A = window.ALDEA, I = window.ICONOS || {};
  var raiz = document.getElementById('boceto');

  var CASAS = [
    { id: 'ie_', letrero: 'i_e', ej: 'kite', color: '#2563EB', letras: 'i and magic e' },
    { id: 'igh', letrero: 'igh', ej: 'night', color: '#EA580C', letras: 'i, g, h' },
    { id: 'y', letrero: 'y', ej: 'fly', color: '#16A34A', letras: 'y at the end' },
    { id: 'ie', letrero: 'ie', ej: 'pie', color: '#9333EA', letras: 'i, e' }
  ];
  /* *letras* = las que hacen el sonido long i (se resaltan en el globo) */
  var BANCO = [
    { p: 'b*i*k*e*', ico: 'bike', z: 'ie_' }, { p: 'd*i*c*e*', ico: 'dice', z: 'ie_' }, { p: '*i*c*e*', ico: 'ice', z: 'ie_' },
    { p: 'sl*i*d*e*', ico: 'slide', z: 'ie_' }, { p: 'r*i*c*e*', ico: 'rice', z: 'ie_' }, { p: 'm*i*c*e*', ico: 'mice', z: 'ie_' },
    { p: 'n*i*n*e*', ico: 'nine', z: 'ie_' }, { p: 'sm*i*l*e*', ico: 'smile', z: 'ie_' },
    { p: 'l*igh*t', ico: 'light', z: 'igh' }, { p: 'fl*igh*t', ico: 'flight', z: 'igh' }, { p: 'l*igh*tning', ico: 'lightning', z: 'igh' },
    { p: 'r*igh*t', ico: 'right', z: 'igh' }, { p: 'midn*igh*t', ico: 'midnight', z: 'igh' },
    { p: 'sp*y*', ico: 'spy', z: 'y' }, { p: 'wh*y*', ico: 'why', z: 'y' }, { p: 'butterfl*y*', ico: 'butterfly', z: 'y' }, { p: 'cr*y*', ico: 'cry', z: 'y' },
    { p: 't*ie*', ico: 'tie', z: 'ie' }, { p: 'fr*ie*s', ico: 'fries', z: 'ie' }, { p: 'fr*ie*d', ico: 'fried', z: 'ie' }
  ];
  var N_ETAPA = 5;
  var nCasas = 4;

  /* ---------- voz (solo voces locales) y sonidos (WebAudio, sin archivos) ---------- */
  var voces = [];
  function cargarVoces() { try { voces = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { voces = []; } }
  cargarVoces();
  if (window.speechSynthesis && 'onvoiceschanged' in speechSynthesis) speechSynthesis.onvoiceschanged = cargarVoces;
  function voz() {
    var loc = voces.filter(function (v) { return v.localService === true && /^en/i.test(v.lang); });
    return loc.filter(function (v) { return /en[-_]GB/i.test(v.lang); })[0] || loc[0] || null;
  }
  function hablar(texto, lento) {
    var v = voz(); if (!v || !texto) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(texto); u.voice = v; u.lang = v.lang; u.rate = lento ? 0.55 : 0.85; speechSynthesis.speak(u); } catch (e) { /* nada */ }
  }
  var ac = null;
  function tono(f, t0, dur, vol, tipo) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
      o.type = tipo || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* sin audio */ }
  }
  function sonido(tipo) {
    if (tipo === 'ok') { tono(660, 0, 0.14); tono(990, 0.09, 0.22); }
    else if (tipo === 'mal') { tono(220, 0, 0.18, 0.06, 'triangle'); tono(196, 0.12, 0.22, 0.05, 'triangle'); }
    else if (tipo === 'puerta') { tono(392, 0, 0.08, 0.05, 'square'); tono(523, 0.07, 0.1, 0.05, 'square'); }
    else if (tipo === 'fin') { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tono(f, i * 0.11, 0.26); }); }
  }

  function mezclar(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function plano(p) { return p.replace(/\*/g, ''); }
  function boton(cls, html, etq) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = html; if (etq) b.setAttribute('aria-label', etq); return b; }
  var ICO_BOMBILLA = '<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24"><path d="M9 18 H15 M10 21 H14 M12 3 A6 6 0 0 0 8 13.5 C9 14.5 9 15.5 9 16 H15 C15 15.5 15 14.5 16 13.5 A6 6 0 0 0 12 3 Z" fill="#FDE047" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  var ICO_ATRAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICO_OTRA = '<svg viewBox="0 0 24 24" aria-hidden="true" width="30" height="30"><path d="M20 12 A8 8 0 1 1 17.7 6.3 M20 4 V8 H16" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- etapa ---------- */
  var pant = null;
  function etapa() {
    raiz.querySelectorAll('.al-pantalla').forEach(function (n) { n.remove(); });
    var casas = CASAS.slice(0, nCasas);
    /* 5 globos repartidos entre las casas, al menos uno por casa */
    var ids = casas.map(function (c) { return c.id; }), cola = [];
    ids.forEach(function (id) { cola.push(mezclar(BANCO.filter(function (b) { return b.z === id; }))[0]); });
    var resto = mezclar(BANCO.filter(function (b) { return ids.indexOf(b.z) >= 0 && cola.indexOf(b) < 0; }));
    cola = mezclar(cola.concat(resto.slice(0, N_ETAPA - cola.length)));

    var p = document.createElement('section'); p.className = 'al-pantalla'; pant = p;
    var barra = document.createElement('div'); barra.className = 'al-barra';
    var bAtras = boton('g-icono', ICO_ATRAS, 'Back'); bAtras.addEventListener('click', function () { etapa(); });
    var est = A.estrellas(N_ETAPA);
    var bAyuda = boton('g-icono', ICO_BOMBILLA, 'Help');
    barra.appendChild(bAtras); barra.appendChild(est); barra.appendChild(bAyuda);
    p.appendChild(barra);

    var esc = A.escena('calle'); esc.nodo.setAttribute('data-n', String(casas.length));
    var porId = {};
    casas.forEach(function (c) {
      var l = A.lugar({ id: c.id, tipo: 'casa', color: c.color, letrero: c.letrero, ejemplo: I[c.ej], etiqueta: c.letrero + ' house' });
      l.addEventListener('click', function () { soltar(l); });
      porId[c.id] = { casa: c, nodo: l };
      esc.lugares.appendChild(l);
    });
    var vuelo = document.createElement('div'); vuelo.className = 'al-vuelo';
    var pipCaja = document.createElement('div'); pipCaja.className = 'al-pip-caja'; pipCaja.innerHTML = A.pip('Pip the owl');
    vuelo.appendChild(pipCaja);
    esc.cielo.appendChild(vuelo);
    p.appendChild(esc.nodo);
    raiz.insertBefore(p, raiz.firstChild);

    var activo = null, globo = null, errores = 0, peldano = 0, ocupado = false;
    pipCaja.addEventListener('click', function () { if (activo) hablar(plano(activo.p)); });

    function siguiente() {
      if (globo) { globo.remove(); globo = null; }
      if (!cola.length) return fin();
      activo = cola.shift(); errores = 0; peldano = 0; ocupado = false;
      globo = A.globo({ palabra: activo.p, icono: I[activo.ico], indice: N_ETAPA - cola.length });
      A.arrastre(globo, { alSoltar: function (l) { soltar(l); }, alTocar: function () { hablar(plano(activo.p)); } });
      vuelo.appendChild(globo);
      A.entrar(vuelo);
      var este = activo;
      setTimeout(function () { if (activo === este) hablar(plano(este.p)); }, 650);
    }
    function volverGlobo() {
      if (!globo) return;
      globo.style.transition = 'transform .3s ease'; globo.style.transform = '';
      setTimeout(function () { if (globo) globo.style.transition = ''; }, 320);
    }
    function soltar(l) {
      if (!activo || ocupado) return;
      var id = l.getAttribute('data-lugar');
      if (id === activo.z) {
        ocupado = true;
        var g = globo, a = activo; activo = null; globo = null; g.disabled = true;
        A.volar(g, l, function () {
          g.remove(); sonido('puerta');
          A.abrir(l, I[a.ico], function () { siguiente(); });
          setTimeout(function () { sonido('ok'); A.celebrar(pipCaja.querySelector('.al-pip')); A.llenarEstrella(est); }, 260);
        });
      } else {
        errores++; sonido('mal'); A.temblar(l); volverGlobo();
        var c = porId[activo.z].casa;
        if (errores === 1) hablar(plano(activo.p), true);
        else { hablar(plano(activo.p) + '. ' + c.letras + '.'); A.brillar(porId[activo.z].nodo); }
      }
    }
    bAyuda.addEventListener('click', function () {
      if (!activo || ocupado) return;
      peldano++;
      if (peldano === 1) hablar(plano(activo.p), true);
      else if (peldano === 2) { A.brillar(porId[activo.z].nodo); hablar(porId[activo.z].casa.letras); }
      else soltar(porId[activo.z].nodo);
    });
    function fin() {
      sonido('fin'); hablar('Well done!');
      var capa = document.createElement('div'); capa.className = 'g-capa'; capa.setAttribute('role', 'dialog'); capa.setAttribute('aria-label', 'Stage clear');
      var box = document.createElement('div'); box.className = 'g-logro al-fin';
      box.innerHTML = '<div class="al-fin__pip">' + A.pip('Pip the owl') + '</div>';
      var e2 = A.estrellas(N_ETAPA); for (var i = 0; i < N_ETAPA; i++) A.llenarEstrella(e2);
      box.appendChild(e2);
      box.appendChild(Object.assign(document.createElement('div'), { className: 'al-calco', innerHTML: A.icono(I.kite, 'al-ico') }));
      var otra = boton('g-btn', ICO_OTRA, 'Play again'); otra.id = 'otra';
      otra.addEventListener('click', function () { capa.remove(); etapa(); });
      box.appendChild(otra);
      capa.appendChild(box); document.body.appendChild(capa);
      A.celebrar(box.querySelector('.al-pip'));
      A.confeti(window.innerWidth / 2, window.innerHeight / 2, 40);
      setTimeout(function () { otra.focus(); }, 60);
    }
    siguiente();
  }

  /* ---------- panel del adulto (no lo ve el niño durante el juego) ---------- */
  function panel() {
    var s = document.createElement('section'); s.className = 'al-panel';
    s.innerHTML = '<h2>Boceto para aprobar · Calle de long i</h2>' +
      '<p>Etapa de 5 globos. Arrastra el globo a su casa o toca la casa. Íconos de Twemoji provisionales (CC BY 4.0).</p>';
    var fila = document.createElement('div'); fila.className = 'al-panel__fila';
    [2, 3, 4].forEach(function (n) {
      var b = boton('g-btn g-btn--suave', n + ' casas'); b.setAttribute('aria-pressed', String(n === nCasas));
      b.addEventListener('click', function () { nCasas = n; fila.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); etapa(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      fila.appendChild(b);
    });
    s.appendChild(fila);
    s.appendChild(Object.assign(document.createElement('h2'), { textContent: 'Los otros escenarios del kit' }));
    s.appendChild(Object.assign(document.createElement('p'), { textContent: 'Toca un lugar para ver su animación de acierto. Las palabras y los dibujos definitivos van en el paso 2.' }));
    var GAL = [
      { escena: 'estanque', nombre: 'Estanque · blends', lugares: [{ tipo: 'hoja', letrero: 'l', color: '#0EA5E9', ej: 'flag' }, { tipo: 'hoja', letrero: 'r', color: '#EC4899', ej: 'frog' }, { tipo: 'hoja', letrero: 's', color: '#F59E0B', ej: 'star' }] },
      { escena: 'plaza', nombre: 'Plaza · preguntas Wh', lugares: [{ tipo: 'puesto', letrero: 'Who?', color: '#16A34A', ej: 'grandma' }, { tipo: 'puesto', letrero: 'What?', color: '#2563EB', ej: 'banana' }, { tipo: 'puesto', letrero: 'Where?', color: '#DC2626', ej: 'beach' }, { tipo: 'puesto', letrero: 'When?', color: '#9333EA', ej: 'calendar' }] },
      { escena: 'habitat', nombre: 'Bosque, río y jardín · hábitats', lugares: [{ tipo: 'arbol', color: '#16A34A', ej: 'monkey', etq: 'trees' }, { tipo: 'agua', color: '#2563EB', ej: 'fish', etq: 'water' }, { tipo: 'flores', color: '#DB2777', ej: 'bee', etq: 'flowers' }] },
      { escena: 'barrio', nombre: 'Barrio · comunidad', lugares: [{ tipo: 'edificio', variante: 'panaderia', color: '#D97706', ej: 'bread', etq: 'bakery' }, { tipo: 'edificio', variante: 'colegio', color: '#DC2626', ej: 'book', etq: 'school' }, { tipo: 'edificio', variante: 'hospital', color: '#0EA5E9', ej: 'doctor', etq: 'hospital' }, { tipo: 'edificio', variante: 'parque', color: '#16A34A', ej: 'kite', etq: 'park' }] },
      { escena: 'granja', nombre: 'Granja · ciclos de vida', lugares: [{ tipo: 'flores', color: '#A855F7', ej: 'caterpillar', etq: 'butterfly' }, { tipo: 'agua', color: '#16A34A', ej: 'frog', etq: 'frog' }, { tipo: 'gallinero', color: '#DC2626', ej: 'chick', etq: 'chicken' }] }
    ];
    var grid = document.createElement('div'); grid.className = 'al-galeria';
    GAL.forEach(function (g) {
      var tarjeta = document.createElement('figure'); tarjeta.className = 'al-galeria__item';
      var e = A.escena(g.escena); e.nodo.setAttribute('data-n', String(g.lugares.length));
      g.lugares.forEach(function (x, i) {
        var l = A.lugar({ id: g.escena + i, tipo: x.tipo, variante: x.variante, color: x.color, letrero: x.letrero, ejemplo: I[x.ej], etiqueta: x.letrero || x.etq });
        l.addEventListener('click', function () { sonido('puerta'); A.abrir(l, I[x.ej]); setTimeout(function () { sonido('ok'); }, 260); });
        e.lugares.appendChild(l);
      });
      tarjeta.appendChild(e.nodo);
      tarjeta.appendChild(Object.assign(document.createElement('figcaption'), { textContent: g.nombre }));
      grid.appendChild(tarjeta);
    });
    s.appendChild(grid);
    return s;
  }

  /* ---------- arranque: un toque para que suenen voz y audio ---------- */
  var css = document.createElement('style');
  css.textContent = '.al-boceto{padding-bottom:20px}.al-inicio{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:linear-gradient(#BAE6FD,#F0F9FF)}' +
    '.al-inicio .al-pip{width:min(46vw,220px)}#play{width:min(70vw,260px);min-height:84px;font-size:2rem}' +
    '.al-panel{max-width:1100px;margin:18px auto 0;padding:0 14px}.al-panel h2{font-size:1.15rem;margin:18px 0 6px}.al-panel p{margin:4px 0 10px;color:#4B5563}' +
    '.al-panel__fila{display:flex;gap:10px;flex-wrap:wrap}.al-panel__fila [aria-pressed="true"]{background:#1D4ED8;color:#fff}' +
    '.al-galeria{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:14px}.al-galeria__item{margin:0}.al-galeria__item .al-escena{height:min(70vw,380px);flex:none}' +
    '.al-galeria__item figcaption{font-weight:800;margin-top:6px}.al-fin{display:flex;flex-direction:column;align-items:center;gap:14px}.al-fin__pip .al-pip{width:150px}' +
    '.al-calco{width:110px;height:110px;padding:10px;background:#fff;border:4px dashed #9CA3AF;border-radius:24px;animation:al-pop .5s cubic-bezier(.3,1.6,.5,1) .3s both}';
  document.head.appendChild(css);
  var inicio = document.createElement('div'); inicio.className = 'al-inicio';
  inicio.innerHTML = '<div class="al-pip-caja">' + A.pip('Pip the owl') + '</div>';
  var play = boton('g-btn', '▶', 'Play'); play.id = 'play';
  play.addEventListener('click', function () { inicio.remove(); tono(1, 0, 0.01, 0.0002); etapa(); });
  inicio.appendChild(play);
  raiz.appendChild(panel());
  document.body.appendChild(inicio);
})();
