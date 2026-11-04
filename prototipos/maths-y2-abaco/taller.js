// titulo: Abacus workshop
// usa: repaso
/* ============================================================
   TALLER DEL ABACO (Year 2, valor posicional: decenas y unidades)
   Cinco rondas, un verbo por ronda, sin opcion multiple y sin derrota:
     1 Conocer   Tocar la parte que se nombra y mover cuentas al espacio de conteo
     2 Construir Llenar varillas enteras (decenas) y luego cuentas sueltas (unidades)
     3 Leer      Contar varillas llenas y cuentas sueltas, y escribir el numero
     4 Separar   Componer y descomponer: 50 + 2 = 52 y 63 = 60 + 3
     5 Sumar     Mover cuentas para sumar y quitar, cruzando una decena; paginas de cuaderno
   Modelo del abaco (supuesto declarado): 10 varillas de 10 cuentas.
   Una varilla llena vale una decena; las cuentas sueltas de la siguiente son las unidades.
   El abaco es un instrumento pedagogico: se dibuja por codigo (regla 9), en pixel art
   con la paleta del juego, y las cuentas se deslizan animadas.
   Pistas en tres peldanos en cada reto: accion minima, figura, ejemplo resuelto.
   Los numeros son propios: el material del colegio es temario (regla 8).
   Niveles escritos a mano, validados por tools/verify_abaco_y2.js.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var $ = P.$, esc = P.esc, MENOS = '−';
  var FILAS = 10, CUENTAS = 10;

  /* ====================== MODELO ====================== */
  /* Estado: arreglo de 10 numeros; estado[f] = cuentas movidas al espacio de conteo en la varilla f. */
  function canon(n) {
    var c = [], r = n;
    for (var f = 0; f < FILAS; f++) { var v = Math.min(CUENTAS, r); c.push(v); r -= v; }
    return c;
  }
  function total(c) { var s = 0; for (var i = 0; i < c.length; i++) s += c[i]; return s; }
  function igual(a, b) { for (var i = 0; i < FILAS; i++) if ((a[i] || 0) !== (b[i] || 0)) return false; return true; }
  function esCanon(c) { return igual(c, canon(total(c))); }
  function filasQueCambian(a, b) { var r = []; for (var i = 0; i < FILAS; i++) if ((a[i] || 0) !== (b[i] || 0)) r.push(i); return r; }
  function etiquetasDe(c) { var t = {}; for (var i = 0; i < FILAS; i++) if (c[i] > 0) t[i] = String(c[i]); return t; }

  /* ====================== PARTES DEL ABACO ====================== */
  var PARTES = {
    beads: { nombre: 'beads', rotulo: 'Beads', def: 'Beads are the round pieces. We move them.',
             ej: 'Beads are round. Tap one bead.', es: 'That is a bead.' },
    rods: { nombre: 'rods', rotulo: 'Rods', def: 'Rods are the long bars. The beads are on the rods.',
            ej: 'Look between the beads. The thin bar is a rod.', es: 'That is a rod.' },
    frame: { nombre: 'frame', rotulo: 'Frame', def: 'The frame is the wood around the abacus.',
             ej: 'The frame goes all around, like a picture frame.', es: 'That is the frame.' },
    start: { nombre: 'starting position', rotulo: 'Starting position', def: 'The starting position is the left side. The beads start here.',
             ej: 'Look at the left side. The beads wait here.', es: 'That is the starting position.' },
    count: { nombre: 'counting space', rotulo: 'Counting space', def: 'The counting space is the right side. We count the beads here.',
             ej: 'Look at the right side. Move beads here to count.', es: 'That is the counting space.' }
  };
  var ESTADO_PARTES = [3, 6, 2, 0, 0, 0, 0, 0, 0, 0];

  /* ====================== DATOS (a mano) ======================
     Ingles para ninos que estan aprendiendo ingles: frases cortas, presente,
     siempre las mismas palabras (tap, move, count, full rod, units, type). */
  var RONDAS = [
    { id: 'conocer', nombre: 'Meet the abacus',
      texto: 'Find the parts. Then move some beads.',
      ejemplo: 'Example: tap a bead. It moves to the right. Count them: 1, 2, 3.',
      items: [
        { t: 'parte', parte: 'beads' }, { t: 'parte', parte: 'rods' }, { t: 'parte', parte: 'frame' },
        { t: 'parte', parte: 'start' }, { t: 'parte', parte: 'count' },
        { t: 'construir', n: 4, simple: true },
        { t: 'construir', n: 7, simple: true },
        { t: 'construir', n: 10, simple: true }] },

    { id: 'construir', nombre: 'Build it',
      texto: 'A full rod is 10. Fill full rods first. Then add the units.',
      ejemplo: 'Example: 31 is 3 full rods and 1 more bead.',
      items: [
        { t: 'construir', n: 13 }, { t: 'construir', n: 30 }, { t: 'construir', n: 42 },
        { t: 'construir', n: 57 }, { t: 'construir', n: 65 }] },

    { id: 'leer', nombre: 'Read it',
      texto: 'Tap and count. Full rods first: 10, 20, 30. Then the units.',
      ejemplo: 'Example: 2 full rods and 6 beads. 20 and 6 is 26.',
      items: [
        { t: 'leer', n: 31, demo: true, guia: true }, { t: 'leer', n: 52, guia: true }, { t: 'leer', n: 40, guia: true },
        { t: 'leer', n: 68 }, { t: 'leer', n: 85 }] },

    { id: 'separar', nombre: 'Take it apart',
      texto: 'Split the number. Tens first, then units.',
      ejemplo: 'Example: 58 = 50 + 8. 5 full rods is 50. 8 beads is 8.',
      items: [
        { t: 'comp', dec: 50, uni: 2 },
        { t: 'descomp', n: 63 },
        { t: 'comp', dec: 70, uni: 8 },
        { t: 'descomp', n: 47 },
        { t: 'descomp', n: 91 }] },

    { id: 'sumar', nombre: 'Add and take away',
      texto: 'Add: move beads to the right. Take away: move beads to the left.',
      ejemplo: 'Example: 29 + 3. Add 1 bead. The rod is full: 30. Add 2 more: 32.',
      ejemploMenos: 'Example: 42 ' + MENOS + ' 5. Take away 2 beads: 40. Take 3 more from the full rod: 37.',
      items: [
        { t: 'mover', ini: 41, k: 6 },
        { t: 'mover', ini: 38, k: 5 },
        { t: 'mover', ini: 57, k: -4 },
        { t: 'mover', ini: 62, k: -5 },
        { t: 'cuaderno', expr: '45 + 7', resp: 52, ej: 'Example: 27 + 6. Add 3: the rod is full, 30. Add 3 more: 33.' },
        { t: 'cuaderno', expr: '71 ' + MENOS + ' 6', resp: 65, ej: 'Example: 53 ' + MENOS + ' 5. Take away 3: 50. Take away 2 more: 48.' }] }
  ];

  /* Texto de la consigna (tambien se dice en voz alta). */
  function consigna(it) {
    if (it.t === 'parte') return 'Tap the ' + PARTES[it.parte].nombre + '.';
    if (it.t === 'construir') return it.simple ? 'Move ' + it.n + ' beads on the top rod.' : 'Build ' + it.n + '.';
    if (it.t === 'comp') return 'Build ' + it.dec + ' + ' + it.uni + '.';
    if (it.t === 'leer') return 'What number is this?';
    if (it.t === 'descomp') return 'How many tens? How many units?';
    if (it.t === 'mover') return it.k > 0 ? 'Add ' + it.k + ' beads.' : 'Take away ' + (-it.k) + ' beads.';
    if (it.t === 'cuaderno') return 'Do the sum.';
    return '';
  }
  RONDAS.forEach(function (r) {
    r.items.forEach(function (it) {
      if (it.t === 'comp') it.n = it.dec + it.uni;
      if (it.t === 'mover') it.n = it.ini + it.k;
      it.voz = consigna(it);
    });
  });
  window.SAMSAN_ABACO = { rondas: RONDAS, canon: canon, total: total, esCanon: esCanon, filas: FILAS, cuentas: CUENTAS, partes: PARTES, estadoPartes: ESTADO_PARTES };

  /* ====================== ESTILOS ====================== */
  var css = document.createElement('style');
  css.textContent = [
    '.ab{--s:3;position:relative;margin:8px auto 0;user-select:none;touch-action:manipulation;width:calc(132px * var(--s));height:calc(134px * var(--s));border-radius:4px}',
    '.ab:focus{outline:4px solid #2F9BB8;outline-offset:4px}',
    '.ab-marco{position:absolute;inset:0}',
    '.ab.is-partes::before{content:"";position:absolute;inset:-14px;border-radius:10px}',
    '.ab-marco canvas{display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}',
    '.ab:not(.is-lienzo) .ab-marco{background:#A0643A;border:3px solid #1E1426;box-sizing:border-box}',
    '.ab-filas{position:absolute;left:calc(6px * var(--s));top:calc(7px * var(--s));width:calc(120px * var(--s));height:calc(120px * var(--s))}',
    '.ab:not(.is-lienzo) .ab-filas{background:#F7EFDD}',
    '.ab-fila{position:relative;height:calc(12px * var(--s));display:flex;align-items:center}',
    '.ab:focus .ab-fila.is-sel{box-shadow:inset 0 0 0 3px #2F9BB8}',
    '.ab-fila.is-cambia{box-shadow:inset 0 0 0 3px #1D4E6B,0 0 0 2px #7FE3F0;border-radius:4px}',
    '.ab-b{position:relative;z-index:1;flex:0 0 8.3333%;height:100%;box-sizing:border-box;border:0;padding:0;margin:0;background:transparent;cursor:pointer;touch-action:manipulation}',
    '.ab:not(.is-lienzo) .ab-b{height:80%;border:2px solid #1E1426;border-radius:40%;background:#C8382F}',
    '.ab.is-estatico .ab-b{cursor:default}',
    '.ab-hueco{flex:1;position:relative;z-index:2;display:flex;justify-content:center;align-items:center;min-width:0;height:100%}',
    '.ab-tag{padding:0 5px;border:2px solid #1D4E6B;border-radius:6px;background:#E8FEFF;color:#1E1426;font-weight:900;font-size:.85rem;line-height:1.25;white-space:nowrap}',
    '.ab-zona{position:absolute;top:0;bottom:0;width:50%;pointer-events:none;border:3px dashed #1D4E6B;border-radius:6px;background:rgba(127,227,240,.35);display:none;z-index:3}',
    '.ab-zona[data-z="start"]{left:0}',
    '.ab.tono-bien .ab-zona{border-color:#1F3D2A;background:rgba(88,192,74,.35)}',
    '.ab.tono-mal .ab-zona{border-color:#7A1E1E;background:rgba(255,107,74,.30)}',
    '.ab-tag.is-bien{border-color:#1F3D2A;background:#D8F0C8}',
    '.ab-tag.is-mal{border-color:#7A1E1E;background:#FFE0D8}',
    '.ab-burbuja{position:absolute;z-index:6;transform:translate(-50%,-130%);padding:4px 12px;border:3px solid #1E1426;border-radius:12px;font-weight:900;font-size:1.05rem;white-space:nowrap;pointer-events:none;color:#1E1426;box-shadow:0 3px 0 #1E1426;animation:ab-pop .25s ease-out}',
    '.ab-burbuja.is-bien{background:#D8F0C8}',
    '.ab-burbuja.is-mal{background:#FFE0D8}',
    '.ab-burbuja b{font-size:1.25rem}',
    '@keyframes ab-pop{0%{transform:translate(-50%,-100%) scale(.6)}100%{transform:translate(-50%,-130%) scale(1)}}',
    '.ab-zona[data-z="count"]{right:0}',
    '.ab.pista-start .ab-zona[data-z="start"],.ab.pista-count .ab-zona[data-z="count"]{display:block}',
    '.ab-peg{position:absolute;z-index:4;transform:translate(-50%,-50%);padding:1px 8px;border:3px solid #1E1426;border-radius:8px;background:#FFFDF6;color:#1E1426;font-weight:900;font-size:.95rem;white-space:nowrap;pointer-events:none;box-shadow:0 3px 0 #1E1426}',
    '.ab.is-mal{animation:ab-no .3s ease-in-out}',
    '@keyframes ab-no{0%,100%{transform:translateX(0)}30%{transform:translateX(-6px)}70%{transform:translateX(5px)}}',
    '.ab-palabra{display:inline-block;padding:0 10px;border:3px solid #1E1426;border-radius:10px;background:#FFF3C4;color:#1E1426;letter-spacing:.04em}',
    '.ab-tally{max-width:400px;margin:8px auto 0;padding:6px 12px;border:3px solid #1D4E6B;border-radius:10px;background:#E8FEFF;color:#1E1426;font-weight:800;text-align:center}',
    '.ab-escena-lado{flex:1 1 300px;max-width:420px;min-width:0;align-self:center}',
    '.ab-escena-lado .es{margin:0}',
    '.ab-eq-activo{outline:4px solid #2F9BB8;outline-offset:2px}',
    '.ab-par{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;align-items:flex-start}',
    '.ab-col{flex:0 1 auto;min-width:0}',
    '.ab-col .ab-tally{margin-top:8px}',
    '.ab-par #rp-tz{flex:1 1 260px;max-width:300px}',
    '.ab-par .rp-tec{margin-top:8px}',
    '.ab-cuenta{display:inline-flex;align-items:center;gap:6px;margin-left:12px;padding:0 14px;border:3px solid #1F3D2A;border-radius:12px;background:#D8F0C8;color:#1E1426;font-size:1.6rem;font-weight:900}',
    '.ab-cuenta[hidden]{display:none}',
    '.rp-eq .ab-cuenta .ab-cuenta__n{border:0;padding:0;background:transparent;min-width:0}',
    '@media (prefers-reduced-motion:reduce){.ab.is-mal,.ab-burbuja{animation:none}}'
  ].join('');
  document.head.appendChild(css);

  function fuenteTopo() { var I = window.SAMSAN_IMG || {}; return (I.caverna || {})['companero-topo'] || ''; }
  function reducido() { try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  /* ====================== PIXEL ART DEL ABACO ======================
     Lienzo logico de 132 x 134: marco de 6 px a los lados y 7 arriba y abajo,
     10 varillas de 12 px, cuentas de 10 x 10. Se escala en enteros (x2 o x3). */
  var PAL = (window.SAMSAN_MUNDO && window.SAMSAN_MUNDO.PAL) || {};
  var TINTA = PAL.contorno || '#1E1426';
  var MAD = PAL.madera || ['#3B2215', '#6B3D22', '#A0643A', '#D19A5E'];
  var PAPEL = PAL.papel || ['#2A211A', '#5C4A3B', '#B9A58A', '#EADCC0', '#F7EFDD'];
  var ORO = PAL.oro || ['#7A4A10', '#C98A1C', '#FFD34D', '#FFF3B0'];
  var CIAN = PAL.cian || ['#1D4E6B', '#2F9BB8', '#7FE3F0', '#E8FEFF'];
  /* rampas de las cuentas: oscuro, base, claro, brillo (una por varilla, se repiten cada 5) */
  var RAMPAS = [
    ['#7A1E1E', '#C8382F', '#EE6A55', '#FFC2B0'],
    ['#163A73', '#2F6FD0', '#5FA0F0', '#CFE6FF'],
    ['#8A5A08', '#D9A21C', '#FFD34D', '#FFF3B0'],
    ['#4A1B52', '#9C3FA8', '#D27BDB', '#FFE3FB'],
    ['#1F3D2A', '#2F8A3A', '#58C04A', '#C8F29A']
  ];
  var MASK = ['..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', '.XXXXXXXX.', '..XXXXXX..'];
  var SPRITES = null;
  function enMask(x, y) { return y >= 0 && y < 10 && x >= 0 && x < 10 && MASK[y][x] === 'X'; }
  /* Anillo de color alrededor de la cuenta: pista (cian), bien (verde), mal (coral). */
  var ANILLO = { pista: '#7FE3F0', bien: '#58C04A', mal: '#FF6B4A' };
  var MAR = { pista: CIAN, bien: ['#1F3D2A', '#2F8A3A', '#58C04A', '#C8F29A'], mal: ['#7A1E1E', '#E0463C', '#FF8A6B', '#FFE0D8'] };
  function spriteCuenta(r, anillo) {
    var c = document.createElement('canvas'); c.width = 12; c.height = 12;
    var g = c.getContext && c.getContext('2d'); if (!g) return null;
    for (var y = 0; y < 12; y++) for (var x = 0; x < 12; x++) {
      var mx = x - 1, my = y - 1;
      if (!enMask(mx, my)) {
        if (anillo && (enMask(mx - 1, my) || enMask(mx + 1, my) || enMask(mx, my - 1) || enMask(mx, my + 1))) { g.fillStyle = anillo; g.fillRect(x, y, 1, 1); }
        continue;
      }
      var borde = !enMask(mx - 1, my) || !enMask(mx + 1, my) || !enMask(mx, my - 1) || !enMask(mx, my + 1);
      var col = r[1];
      if (borde) col = TINTA;
      else if (my <= 2) col = r[2];
      else if (my >= 7 || mx >= 8) col = r[0];
      if (!borde && (my === 2 || my === 3) && (mx === 2 || mx === 3)) col = r[3];
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
    return c;
  }
  function sprites() {
    if (SPRITES) return SPRITES;
    SPRITES = { n: RAMPAS.map(function (r) { return spriteCuenta(r, null); }) };
    Object.keys(ANILLO).forEach(function (k) { SPRITES[k] = RAMPAS.map(function (r) { return spriteCuenta(r, ANILLO[k]); }); });
    return SPRITES;
  }
  function pintarMarco(g, tono) {
    var W = 132, H = 134, M = tono ? MAR[tono] : MAD;
    /* fondo del abaco: papel claro, con sombra bajo la viga de arriba */
    g.fillStyle = PAPEL[4]; g.fillRect(6, 7, 120, 120);
    g.fillStyle = PAPEL[3]; g.fillRect(6, 7, 120, 2);
    for (var k = 0; k < 120; k += 4) g.fillRect(6 + k, 126, 2, 1);
    /* vigas de arriba y abajo */
    [[0, 0], [0, H - 7]].forEach(function (v) {
      var y = v[1];
      g.fillStyle = TINTA; g.fillRect(0, y, W, 7);
      g.fillStyle = M[2]; g.fillRect(1, y + 1, W - 2, 5);
      g.fillStyle = M[3]; g.fillRect(1, y + 1, W - 2, 1);
      g.fillStyle = M[1]; g.fillRect(1, y + 5, W - 2, 1);
      g.fillStyle = M[1]; for (var x = 8; x < W - 8; x += 13) g.fillRect(x, y + 3, 5, 1);
    });
    /* postes de los lados */
    [0, W - 6].forEach(function (x) {
      g.fillStyle = TINTA; g.fillRect(x, 0, 6, H);
      g.fillStyle = M[2]; g.fillRect(x + 1, 1, 4, H - 2);
      g.fillStyle = M[3]; g.fillRect(x + 1, 1, 1, H - 2);
      g.fillStyle = M[1]; g.fillRect(x + 4, 1, 1, H - 2);
      g.fillStyle = M[1]; for (var y = 12; y < H - 10; y += 17) g.fillRect(x + 2, y, 1, 5);
    });
    /* clavos dorados en las esquinas */
    [[2, 2], [W - 4, 2], [2, H - 4], [W - 4, H - 4]].forEach(function (p) {
      g.fillStyle = ORO[1]; g.fillRect(p[0], p[1], 2, 2); g.fillStyle = ORO[3]; g.fillRect(p[0], p[1], 1, 1);
    });
  }
  function pintarVarilla(g, f, tono) {
    var y = 7 + f * 12 + 5, M = tono ? MAR[tono] : null;
    g.fillStyle = M ? M[2] : '#C9CED6'; g.fillRect(6, y, 120, 1);
    g.fillStyle = M ? M[0] : '#5B5B6E'; g.fillRect(6, y + 1, 120, 1);
    if (M) { g.fillStyle = M[1]; g.fillRect(6, y - 1, 120, 1); g.fillRect(6, y + 2, 120, 1); }
  }

  /* ====================== EL ABACO (dibujo e interaccion) ======================
     Cada varilla tiene 10 cuentas. Las movidas quedan a la derecha (espacio de conteo);
     las que no, a la izquierda (posicion inicial). Tocar una cuenta la mueve junto con
     las que estorban: la que esta junto al hueco mueve una sola.
     Encima del lienzo hay botones transparentes (uno por cuenta) para el toque y las pruebas. */
  function xDe(p, u) { return p <= u ? 6 + (p - 1) * 10 : 26 + (p - 1) * 10; }
  function Abaco(host, o) {
    var c = (o.estado || []).slice(), sel = 0, activo = !!o.activo, tags = {}, cambia = {}, brillo = { parte: null, tono: null }, filasOk = {}, marcas = {};
    while (c.length < FILAS) c.push(0);
    var el = document.createElement('div');
    el.className = 'ab' + (activo ? '' : ' is-estatico');
    el.setAttribute('role', 'group');
    el.tabIndex = activo || o.alTocarParte ? 0 : -1;
    el.innerHTML = '<div class="ab-marco"><canvas width="132" height="134" aria-hidden="true"></canvas></div><div class="ab-filas"><div class="ab-zona" data-z="start"></div><div class="ab-zona" data-z="count"></div><div class="ab-rows"></div></div>';
    host.appendChild(el);
    var filas = el.querySelector('.ab-rows'), cv = el.querySelector('canvas');
    var g = null;
    try { g = cv.getContext && cv.getContext('2d'); } catch (e) { g = null; }
    if (g) { g.imageSmoothingEnabled = false; el.classList.add('is-lienzo'); }
    if (o.alTocarParte) el.classList.add('is-partes');
    if (o.deAUno) el.setAttribute('data-uno', '1');

    /* posiciones animadas de las cuentas (en pixeles logicos) */
    var X = [], raf = null, vivo = true;
    for (var f0 = 0; f0 < FILAS; f0++) { X.push([]); for (var p0 = 1; p0 <= CUENTAS; p0++) X[f0].push(xDe(p0, CUENTAS - c[f0])); }

    function dibujar() {
      if (!g) return;
      var S = sprites();
      g.clearRect(0, 0, 132, 134);
      pintarMarco(g, brillo.parte === 'frame' ? brillo.tono : null);
      for (var f = 0; f < FILAS; f++) {
        pintarVarilla(g, f, filasOk[f] ? 'bien' : brillo.parte === 'rods' ? brillo.tono : null);
        var y = 7 + f * 12 + 1, r = f % 5;
        for (var p = 0; p < CUENTAS; p++) {
          var t = marcas[f + ',' + (p + 1)] || (filasOk[f] && (p + 1) > CUENTAS - c[f] ? 'bien' : null) || (brillo.parte === 'beads' ? brillo.tono : null);
          var img = (t ? S[t] : S.n)[r];
          if (img) g.drawImage(img, Math.round(X[f][p]) - 1, y - 1);
        }
      }
    }
    function animar() {
      var t0 = null, quieto = reducido();
      function paso(ts) {
        if (!vivo) return;
        if (t0 == null) t0 = ts;
        var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
        var mov = false;
        for (var f = 0; f < FILAS; f++) {
          var u = CUENTAS - c[f];
          for (var p = 1; p <= CUENTAS; p++) {
            var meta = xDe(p, u), x = X[f][p - 1];
            if (quieto || Math.abs(meta - x) < 0.4) X[f][p - 1] = meta;
            else { X[f][p - 1] = x + (meta - x) * Math.min(1, dt * 16); mov = true; }
          }
        }
        dibujar();
        raf = mov && window.requestAnimationFrame ? window.requestAnimationFrame(paso) : null;
      }
      if (!g) return;
      if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
      if (window.requestAnimationFrame && !quieto) raf = window.requestAnimationFrame(paso);
      else paso(0);
    }

    function pintar() {
      var h = '';
      for (var f = 0; f < FILAS; f++) {
        var u = CUENTAS - c[f], b = '';
        var tg = tags[f], tt = tg == null ? null : typeof tg === 'object' ? tg : { txt: tg };
        var hueco = '<div class="ab-hueco" data-f="' + f + '">' + (tt ? '<span class="ab-tag' + (tt.tono ? ' is-' + tt.tono : '') + '">' + esc(tt.txt) + '</span>' : '') + '</div>';
        for (var p = 1; p <= CUENTAS; p++) {
          b += '<button type="button" class="ab-b" tabindex="-1" aria-hidden="true" data-f="' + f + '" data-p="' + p + '" data-lado="' + (p <= u ? 'start' : 'count') + '"></button>';
          if (p === u) b += hueco;                 /* el hueco queda entre las cuentas sin mover y las movidas */
        }
        if (u === 0) b = hueco + b;
        h += '<div class="ab-fila' + (f === sel && (activo || o.alTocarParte) ? ' is-sel' : '') + (cambia[f] ? ' is-cambia' : '') + '" data-f="' + f + '">' + b + '</div>';
      }
      filas.innerHTML = h;
      el.setAttribute('data-c', c.join(','));
      el.setAttribute('data-total', String(total(c)));
      el.setAttribute('aria-label', 'Abacus with ' + total(c) + ' beads in the counting space');
      animar();
    }
    function avisar() { pintar(); P.sonido('paso'); if (o.alCambiar) o.alCambiar(c.slice()); }

    function tocar(f, p) {
      if (!activo) return;
      var u = CUENTAS - c[f];
      if (p <= u) c[f] = o.deAUno ? c[f] + 1 : CUENTAS - (p - 1);   /* mueve esa cuenta y las que estan entre ella y el hueco (en la ronda 1, una sola) */
      else c[f] = c[f] - 1;                      /* del lado de conteo, cada toque devuelve una cuenta (quitar de a una) */
      sel = f; avisar();
    }
    el.addEventListener('click', function (e) {
      var t = e.target, b = t.closest ? t.closest('.ab-b') : null;
      if (o.alTocarParte) { o.alTocarParte(parteDe(t, b, e)); return; }
      if (!b || !el.contains(b)) return;
      tocar(+b.getAttribute('data-f'), +b.getAttribute('data-p'));
    });
    /* Que parte se toco: cuenta, varilla, marco o lado (inicial o de conteo). */
    function parteDe(t, b, e) {
      var fila = t.closest ? t.closest('.ab-fila') : null, lado = null;
      var r = filas.getBoundingClientRect();
      if (fila && r.width) lado = (e.clientX - r.left) < r.width / 2 ? 'start' : 'count';
      var pos = posEn(e);
      if (b) return { que: 'beads', lado: lado || b.getAttribute('data-lado'), f: +b.getAttribute('data-f'), p: +b.getAttribute('data-p'), x: pos.x, y: pos.y };
      if (fila) return { que: 'rods', lado: lado, f: +fila.getAttribute('data-f'), p: null, x: pos.x, y: pos.y };
      return { que: 'frame', lado: null, f: null, p: null, x: pos.x, y: pos.y };
    }
    function posEn(e) {
      var r = el.getBoundingClientRect();
      if (!r.width || e.clientX == null) return { x: el.offsetWidth / 2 || 100, y: el.offsetHeight / 2 || 100 };
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    el.addEventListener('keydown', function (e) {
      var k = e.key;
      if (!activo && o.alTocarParte) {
        if (k === 'ArrowUp') { sel = Math.max(0, sel - 1); pintar(); }
        else if (k === 'ArrowDown') { sel = Math.min(FILAS - 1, sel + 1); pintar(); }
        else if (k === 'Enter' || k === ' ') o.alTocarParte({ que: 'rods', lado: null, f: sel, p: null, teclado: true, x: el.offsetWidth / 2, y: (7 + sel * 12 + 6) * escala() });
        else return;
        e.preventDefault(); return;
      }
      if (!activo) return;
      if (k === 'ArrowUp') { sel = Math.max(0, sel - 1); pintar(); }
      else if (k === 'ArrowDown') { sel = Math.min(FILAS - 1, sel + 1); pintar(); }
      else if (k === 'ArrowRight') { c[sel] = Math.min(CUENTAS, c[sel] + 1); avisar(); }
      else if (k === 'ArrowLeft') { c[sel] = Math.max(0, c[sel] - 1); avisar(); }
      else return;
      e.preventDefault();
    });

    /* Escala entera segun el ancho disponible: x2 en movil, x3 en pantallas grandes. */
    function escala() { return +(getComputedStyle(el).getPropertyValue('--s') || 2) || 2; }
    function ajustar() {
      var ref = (host.closest && host.closest('#rp-cuerpo')) || host;
      var w = (ref.clientWidth || 0) - (o.reserva || 0), s = Math.max(2, Math.min(3, Math.floor(w / 132) || 2));
      if ((window.innerHeight || 0) < 880) s = 2;          /* en un portatil (768 de alto) todo cabe sin bajar */
      el.style.setProperty('--s', String(s));
    }
    ajustar();
    var ro = null;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(ajustar); ro.observe((host.closest && host.closest('#rp-cuerpo')) || host); }
    pintar();
    return {
      el: el, filas: filas,
      leer: function () { return c.slice(); },
      poner: function (e) { c = e.slice(); while (c.length < FILAS) c.push(0); sel = 0; avisar(); },
      activar: function (si) { activo = !!si; el.classList.toggle('is-estatico', !activo); el.tabIndex = activo ? 0 : -1; pintar(); },
      etiquetar: function (t) { tags = t || {}; pintar(); },
      marcar: function (lista) { cambia = {}; (lista || []).forEach(function (f) { cambia[f] = true; }); pintar(); },
      /* resalta una parte: beads, rods, frame (en el lienzo) o start, count (zonas) */
      resaltar: function (parte, tono) {
        tono = tono || 'pista';
        brillo = { parte: parte, tono: parte ? tono : null };
        el.classList.remove('pista-start', 'pista-count', 'tono-pista', 'tono-bien', 'tono-mal');
        if (parte === 'start' || parte === 'count') el.classList.add('pista-' + parte, 'tono-' + tono);
        el.setAttribute('data-brillo', parte || ''); el.setAttribute('data-tono', parte ? tono : ''); dibujar();
      },
      /* Conteo: una varilla contada (verde) o una cuenta marcada con un tono. */
      contarFila: function (f) { filasOk[f] = true; dibujar(); },
      marcarCuenta: function (f, p, tono) { if (tono) marcas[f + ',' + p] = tono; else delete marcas[f + ',' + p]; dibujar(); },
      limpiarConteo: function () { filasOk = {}; marcas = {}; dibujar(); },
      /* Burbuja junto al toque: ✓ o ✗ y un texto corto (el simbolo no depende del color). */
      burbuja: function (pos, texto, tono) {
        var d = document.createElement('div');
        d.className = 'ab-burbuja is-' + tono; d.setAttribute('data-tono', tono);
        d.innerHTML = '<b aria-hidden="true">' + (tono === 'bien' ? '✓' : '✗') + '</b> ' + esc(texto);
        d.style.left = Math.round(pos && pos.x != null ? pos.x : el.offsetWidth / 2) + 'px';
        d.style.top = Math.round(pos && pos.y != null ? pos.y : el.offsetHeight / 2) + 'px';
        Array.prototype.forEach.call(el.querySelectorAll('.ab-burbuja'), function (x) { x.parentNode.removeChild(x); });
        el.appendChild(d);
        setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1600);
      },
      sacudir: function () { el.classList.remove('is-mal'); void el.offsetWidth; el.classList.add('is-mal'); },
      destruir: function () { vivo = false; if (ro) ro.disconnect(); if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf); if (el.parentNode) el.parentNode.removeChild(el); }
    };
  }

  function tallyHtml(n) {
    var t = Math.floor(n / 10), u = n % 10;
    return 'Full rods: ' + t + ' (tens). Other beads: ' + u + ' (units).';
  }
  function eqHtml(partes, fin, estado) {
    var h = '';
    partes.forEach(function (p) { h += p.op ? '<em>' + p.txt + '</em>' : '<span' + (p.base ? ' class="is-base"' : '') + '>' + esc(p.txt) + '</span>'; });
    h += '<em>=</em><span id="ab-r" class="' + (estado === 'bien' ? 'is-bien' : 'is-hueco') + '">' + (fin == null ? '?' : fin) + '</span>';
    return h;
  }


  /* ====================== LA TIENDA DE CUENTAS DEL TOPO ======================
     El topo atiende detras del mostrador; el explorador llega como cliente y pide.
     Cada respuesta tiene un efecto en la escena: el topo asiente o niega, el
     cliente celebra, sale una gema con chispas y el cliente se va. */
  function tienda(o) {
    var host = $('#ab-escena'); if (!host) return null;
    var E = P.escena(host, { alto: 116, mostrador: { de: 4, ancho: 50 } });
    E.el.setAttribute('data-escena', 'tienda');
    E.actor('topo', { img: 'topo', x: 18, abajo: 28, diceLado: true });
    if (o.topoDice) E.decir('topo', o.topoDice);
    if (o.pide) {
      E.actor('ex', { img: 'ex', x: 108, frente: true, sinTransicion: true });
      setTimeout(function () {
        var d = E.el.querySelector('[data-actor="ex"]'); if (d) d.style.transition = '';
        E.mover('ex', 76, function () { E.decir('ex', o.pide); });
      }, 60);
      E.el.querySelector('[data-actor="ex"]').setAttribute('data-pide', o.pide);
    }
    E.bien = function (texto) {
      E.animar('topo', 'asiente');
      if (o.pide) { E.animar('ex', 'feliz'); E.decir('ex', texto || 'Thank you!'); E.premio(76); setTimeout(function () { E.decir('ex', ''); E.mover('ex', 112); }, 1800); }
      else { E.animar('topo', 'feliz'); E.decir('topo', texto || 'Yes!'); E.premio(18); }
    };
    E.mal = function (texto) { E.animar('topo', 'niega'); E.decir('topo', texto || 'Not yet!', 1800); };
    return E;
  }

  /* ====================== RETO: TOCAR UNA PARTE ======================
     Una parte por reto. El nino toca la parte en el abaco: zonas grandes, una sola accion.
     Cada toque responde: la parte tocada se pinta (verde si es, coral si no) y una
     burbuja dice que es, con ✓ o ✗. Las partes ya halladas quedan rotuladas. */
  var HALLADAS = [];
  function pegatina(ab, parte) {
    var pos = { beads: ['30%', '25%'], rods: ['50%', '6%'], frame: ['50%', '2.6%'], start: ['25%', '97.4%'], count: ['75%', '97.4%'] }[parte];
    var d = document.createElement('div');
    d.className = 'ab-peg'; d.setAttribute('data-parte', parte); d.textContent = PARTES[parte].rotulo;
    d.style.left = pos[0]; d.style.top = pos[1];
    if (parte === 'beads') { d.style.top = 'calc(7px * var(--s) + 12px * 2.5 * var(--s))'; d.style.left = 'calc(6px * var(--s) + 25px * var(--s))'; }
    if (parte === 'rods') { d.style.top = 'calc(13px * var(--s))'; d.style.left = 'calc(86px * var(--s))'; }   /* hueco de la varilla 1 (3 cuentas movidas) */
    ab.el.appendChild(d);
  }
  function montarParte(it, ctx, ronda) {
    var meta = it.parte, def = PARTES[meta], listo = false, nivel = 0, t0 = null;
    if (ronda && ronda.items[0] === it) HALLADAS = [];
    ctx.host.innerHTML = '<p class="rp-consigna">Tap the <span class="ab-palabra">' + esc(def.nombre.toUpperCase()) + '</span></p><div id="ab-escena"></div><div id="ab-ab"></div>';
    function volver() { if (!listo) ab.resaltar(nivel >= 2 ? meta : null, 'pista'); }
    var E = tienda({ topoDice: 'Tap the ' + def.nombre + '!' });
    var ab = Abaco($('#ab-ab'), {
      estado: ESTADO_PARTES, activo: false,
      alTocarParte: function (t) {
        if (listo) return;
        var bien = t.que === meta || ((meta === 'start' || meta === 'count') && t.lado === meta);
        clearTimeout(t0);
        if (bien) {
          listo = true; ab.resaltar(meta, 'bien'); ab.burbuja(t, def.rotulo + '!', 'bien'); pegatina(ab, meta);
          if (E) E.bien('Yes! ' + def.rotulo + '!');
          if (HALLADAS.indexOf(meta) < 0) HALLADAS.push(meta);
          ctx.listo('Yes! ' + def.def);
          P.vozEn('Yes! ' + def.def);
          return;
        }
        var cual = (t.que === 'beads' || t.que === 'rods') && (meta === 'start' || meta === 'count') && t.lado ? t.lado : t.que;
        ab.resaltar(cual, 'mal'); ab.burbuja(t, PARTES[cual].es, 'mal'); ab.sacudir(); P.sonido('mal');
        if (E) E.mal(PARTES[cual].es);
        ctx.fallo(PARTES[cual].es + ' Find the ' + def.nombre + '.');
        t0 = setTimeout(volver, 1300);
      }
    });
    ab.el.setAttribute('data-meta', meta);
    HALLADAS.forEach(function (h) { if (h !== meta) pegatina(ab, h); });
    ctx.peldanos([
      { texto: def.def, visual: function () { nivel = 1; } },
      { texto: 'Look at the blue part. Tap it.', visual: function () { nivel = 2; ab.resaltar(meta, 'pista'); } },
      { texto: 'Example: ' + def.ej, visual: function () { nivel = 3; ab.resaltar(meta, 'pista'); } }
    ]);
    ctx.mensaje('Tap it on the abacus.', '');
    return { destruir: function () { clearTimeout(t0); ab.destruir(); if (E) E.destruir(); } };
  }

  /* ====================== RETO: CONSTRUIR / COMPONER / MOVER ====================== */
  function montarConstruir(it, ctx, ronda) {
    var meta = canon(it.n), mover = it.t === 'mover', inicio = mover ? canon(it.ini) : canon(0), nivel = 0, listo = false, marcado = false;
    var partes, simple = !!it.simple;
    if (mover) partes = [{ txt: it.ini, base: true }, { txt: it.k > 0 ? '+' : MENOS, op: true }, { txt: Math.abs(it.k) }];
    else if (it.t === 'comp') partes = [{ txt: it.dec, base: true }, { txt: '+', op: true }, { txt: it.uni }];
    else partes = null;
    ctx.host.innerHTML = '<p class="rp-consigna">' + esc(consigna(it)) + '</p>' +
      (partes ? '<div class="rp-eq">' + eqHtml(partes, null) + '</div>' : '') + '<div class="ab-par"><div id="ab-escena" class="ab-escena-lado"></div><div class="ab-col"><div id="ab-ab"></div><div class="ab-tally" id="ab-tally" hidden></div></div></div>';
    var pide = mover ? (it.k > 0 ? 'Add ' + it.k + ', please!' : 'Take away ' + (-it.k) + ', please!')
      : it.t === 'comp' ? it.dec + ' + ' + it.uni + ', please!' : simple ? 'I want ' + it.n + ' beads!' : 'I want ' + it.n + ', please!';
    var E = tienda({ pide: pide });
    function etiquetasPista() { return nivel >= 2 && !mover ? etiquetasDe(meta) : {}; }
    var ab = Abaco($('#ab-ab'), { estado: inicio, activo: true, deAUno: simple, alCambiar: function (c) {
      ctx.accion();
      if (marcado) { marcado = false; ab.etiquetar(etiquetasPista()); }
      if (simple) { ab.etiquetar(c[0] ? { 0: { txt: String(c[0]), tono: 'bien' } } : {}); P.vozEn(String(c[0])); }
    } });
    ctx.extra.innerHTML = '<button type="button" class="k-boton k-boton--primario" id="rp-ok">DONE</button><button type="button" class="k-boton" id="rp-reset">START OVER</button>';
    $('#rp-reset').addEventListener('click', function () { if (!listo) { ab.poner(inicio); ctx.accion(); ctx.mensaje('', ''); } });
    $('#rp-ok').addEventListener('click', function () {
      if (listo) return;
      var c = ab.leer();
      if (igual(c, meta)) {
        listo = true; ab.activar(false); ab.marcar([]);
        var tg = etiquetasDe(meta); Object.keys(tg).forEach(function (f) { tg[f] = { txt: tg[f], tono: 'bien' }; }); ab.etiquetar(tg);
        var r = $('#ab-r'); if (r) { r.textContent = it.n; r.className = 'is-bien'; }
        if (E) E.bien('Thank you!');
        ctx.listo('Yes! ' + it.n + '!');
        return;
      }
      ab.sacudir(); if (E) E.mal('Not yet!');
      /* las varillas que no cuadran se marcan con ✗ (simbolo, no solo color) */
      var t = total(c), tm = total(meta);
      var otras = 0; for (var q = 1; q < FILAS; q++) otras += c[q];
      if (igual(c, inicio)) ctx.fallo('Move some beads first.');
      else if (simple && otras > 0) ctx.fallo('Use only the top rod.');
      else if (t === tm) ctx.fallo('Good number of beads! But fill each rod first. Look at the ✗.');
      else if (t < tm) ctx.fallo('Not yet. You need more beads. Look at the ✗.');
      else ctx.fallo('Too many beads. Move some back. Look at the ✗.');
      /* despues del fallo (la pista puede haber puesto etiquetas): ✗ en lo que no cuadra */
      var tg2 = etiquetasPista();
      for (var f = 0; f < FILAS; f++) if (c[f] !== meta[f]) tg2[f] = { txt: '✗', tono: 'mal' };
      ab.etiquetar(tg2); marcado = true;
    });
    function ayuda() {
      var tal = $('#ab-tally');
      if (nivel >= 2) {
        if (mover) { ab.marcar(filasQueCambian(inicio, meta)); tal.hidden = true; }
        else { ab.etiquetar(etiquetasDe(meta)); tal.hidden = simple; tal.textContent = tallyHtml(it.n); }
      }
    }
    var p1 = simple ? 'Tap a bead. It moves to the right. Count the beads.'
      : mover ? (it.k > 0 ? 'Add: move beads to the right. Fill the rod. Then use the next rod.' : 'Take away: move beads to the left. Start with the last rod.')
      : 'A full rod is 10. Fill full rods first. Then add the units.';
    var p2 = mover ? 'Look at the marked rods. Change only those rods.'
      : simple ? 'Look at the label. Move that many beads.' : 'Look at the labels. 10 is a full rod. The other number is the units.';
    ctx.peldanos([
      { texto: p1, visual: function () { nivel = 1; } },
      { texto: p2, visual: function () { nivel = 2; ayuda(); } },
      { texto: (mover && it.k < 0 && ronda && ronda.ejemploMenos) || (ronda && ronda.ejemplo) || '', visual: function () { nivel = 3; ayuda(); } }
    ]);
    ctx.mensaje('Tap the beads. Then tap DONE.', '');
    return { destruir: function () { ab.destruir(); if (E) E.destruir(); } };
  }

  /* ====================== CONTAR TOCANDO ======================
     Leer es una accion: el nino toca cada varilla llena (10, 20, 30...) y luego cada
     cuenta suelta. Cada toque se pinta de verde y se dice en voz alta. Con `guia`
     se ve la cuenta que se acumula; sin ella, cada varilla dice 10 y el nino suma.
     Con `demo`, el juego cuenta solo, paso a paso, y el nino mira. */
  function Conteo(ab, n, ctx, o) {
    var tLlenas = Math.floor(n / 10), u = n % 10, fila = tLlenas, guia = !!o.guia;
    var orden = [], sueltas = [], fase = tLlenas > 0 ? 'decenas' : 'unidades', timer = null, vivo = true;
    var caja = o.caja;
    function ahora() { return orden.length * 10 + sueltas.length; }
    function pintar() {
      var tg = {};
      orden.forEach(function (f, k) { tg[f] = { txt: guia ? String((k + 1) * 10) : '10', tono: 'bien' }; });
      if (sueltas.length) tg[fila] = { txt: guia ? String(ahora()) : String(sueltas.length), tono: 'bien' };
      ab.etiquetar(tg);
      if (caja) {
        caja.hidden = !guia || ahora() === 0;
        caja.innerHTML = '<span class="ab-cuenta__n">' + ahora() + '</span>';
        caja.setAttribute('data-total', String(ahora()));
      }
      ab.el.setAttribute('data-fase', fase);
      pendientes();
    }
    function pendientes() {
      if (fase === 'decenas' && o.nivel && o.nivel() >= 2) {
        var l = []; for (var f = 0; f < tLlenas; f++) if (orden.indexOf(f) < 0) l.push(f); ab.marcar(l);
      } else if (fase === 'unidades' && o.nivel && o.nivel() >= 2) ab.marcar([fila]);
      else ab.marcar([]);
    }
    function decir(x) { P.vozEn(String(x)); }
    function siguienteFase() {
      if (fase === 'decenas' && orden.length === tLlenas) {
        fase = u > 0 ? 'unidades' : 'hecho';
        if (fase === 'unidades') ctx.mensaje(o.demo ? 'Now the units.' : 'Now tap each unit bead.', 'bien');
      }
      if (fase === 'unidades' && sueltas.length === u) fase = 'hecho';
      pintar();
      if (fase === 'hecho') { ab.marcar([]); guia = false; pintar(); if (caja) caja.hidden = true; if (o.alTerminar) o.alTerminar(); }
    }
    function contarFila(f, pos) {
      orden.push(f); ab.contarFila(f); P.sonido('paso'); if (o.alContar) o.alContar(ahora(), guia);
      ab.burbuja(pos, guia ? String(ahora()) : '10', 'bien'); decir(guia ? ahora() : 10);
      siguienteFase();
    }
    function contarCuenta(p, pos) {
      sueltas.push(p); ab.marcarCuenta(fila, p, 'bien'); P.sonido('paso'); if (o.alContar) o.alContar(ahora(), guia);
      ab.burbuja(pos, guia ? String(ahora()) : String(sueltas.length), 'bien'); decir(guia ? ahora() : sueltas.length);
      siguienteFase();
    }
    function proximaSuelta() { for (var p = CUENTAS - u + 1; p <= CUENTAS; p++) if (sueltas.indexOf(p) < 0) return p; return null; }
    function tocar(t) {
      if (!vivo || o.demo || fase === 'hecho') return;
      ctx.accion();
      if (fase === 'decenas') {
        if (t.f != null && t.f < tLlenas) {
          if (orden.indexOf(t.f) >= 0) { ab.burbuja(t, 'Counted!', 'bien'); return; }
          contarFila(t.f, t); return;
        }
        ab.burbuja(t, t.f == null ? 'Tap a rod' : 'Not full', 'mal'); ab.sacudir();
        ctx.fallo('Tap a full rod. A full rod has 10 beads.');
        return;
      }
      /* unidades */
      if (t.f === fila) {
        if (t.p != null && t.p <= CUENTAS - u) { ab.burbuja(t, 'Not here', 'mal'); ctx.fallo('Count the beads on the right side.'); return; }
        var p = t.p != null && sueltas.indexOf(t.p) < 0 ? t.p : proximaSuelta();
        if (p == null) return;
        contarCuenta(p, t); return;
      }
      if (t.f != null && t.f < tLlenas) { ab.burbuja(t, 'Counted!', 'bien'); return; }
      ab.burbuja(t, 'No units here', 'mal'); ab.sacudir();
      ctx.fallo('The units are on the next rod, on the right side.');
    }
    function demo() {
      var pasos = [];
      for (var f = 0; f < tLlenas; f++) pasos.push(['f', f]);
      for (var p = CUENTAS - u + 1; p <= CUENTAS; p++) pasos.push(['c', p]);
      ctx.mensaje('Watch me count.', '');
      var k = 0;
      function sig() {
        if (!vivo) return;
        if (k >= pasos.length) return;
        var s = pasos[k++], s2 = ab.el.offsetWidth || 200;
        var pos = { x: s2 * 0.5, y: (7 + (s[0] === 'f' ? s[1] : fila) * 12 + 6) * (+(getComputedStyle(ab.el).getPropertyValue('--s')) || 2) };
        if (s[0] === 'f') contarFila(s[1], pos); else contarCuenta(s[1], pos);
        if (fase !== 'hecho') timer = setTimeout(sig, o.pasoMs || 750);
      }
      timer = setTimeout(sig, o.pasoMs || 750);
    }
    pintar();
    if (o.demo) demo();
    else ctx.mensaje(fase === 'decenas' ? 'Tap each full rod.' : 'Tap each unit bead.', '');
    return {
      tocar: tocar, fase: function () { return fase; }, total: ahora,
      guia: function () { guia = true; pintar(); },
      repintar: pintar,
      parar: function () { vivo = false; clearTimeout(timer); }
    };
  }

  /* ====================== RETO: LEER ====================== */
  function montarLeer(it, ctx, ronda) {
    var listo = false, nivel = 0, tec = null, cont = null;
    ctx.host.innerHTML = '<p class="rp-consigna">' + esc(consigna(it)) + '</p><div id="ab-escena"></div><div class="rp-eq"><span class="is-hueco" id="ab-r">?</span><span class="ab-cuenta" id="ab-cuenta" hidden></span></div>' +
      '<div class="ab-par"><div class="ab-col"><div id="ab-ab"></div><div class="ab-tally" id="ab-tally" hidden></div></div><div id="rp-tz"></div></div>';
    var E = tienda({ pide: 'How many beads?' });
    var ab = Abaco($('#ab-ab'), { estado: canon(it.n), activo: false, reserva: 316, alTocarParte: function (t) { if (cont) cont.tocar(t); } });
    function teclado() {
      ctx.mensaje('Now type the number. Then tap OK.', 'bien');
      if (E) E.decir('topo', 'Type it!');
      tec = P.teclado($('#rp-tz'), {
        max: 2, alTecla: function () { ctx.accion(); },
        alEnviar: function (n) {
          if (listo) return;
          if (n === it.n) {
            listo = true; tec.destruir(); $('#ab-r').textContent = n; $('#ab-r').className = 'is-bien';
            if (E) E.bien(n + ' beads. Thank you!');
            ctx.listo('Yes! The number is ' + n + '.');
            return;
          }
          tec.limpiar(); ab.sacudir(); if (E) E.mal('Look again!');
          var t = Math.floor(n / 10), u = n % 10;
          var T = Math.floor(it.n / 10);
          ctx.fallo('You typed ' + n + ': ' + t + ' ten' + (t === 1 ? '' : 's') + ' and ' + u + ' unit' + (u === 1 ? '' : 's') + '. Look again: ' + T + ' full rod' + (T === 1 ? '' : 's') + '.');
        }
      });
    }
    cont = Conteo(ab, it.n, ctx, { guia: it.guia, demo: it.demo, caja: $('#ab-cuenta'), alTerminar: teclado, nivel: function () { return nivel; },
      alContar: function (n, g) { if (E && g) E.decir('topo', String(n)); else if (E) E.animar('topo', 'asiente'); } });
    if (E) E.decir('topo', it.demo ? 'Watch me!' : 'Count with me!');
    function ayuda() {
      if (nivel >= 2) { cont.guia(); var t = $('#ab-tally'); t.hidden = false; t.textContent = tallyHtml(it.n); }
    }
    ctx.peldanos([
      { texto: 'Full rods first. Each full rod is 10. Then count the units.', visual: function () { nivel = 1; } },
      { texto: 'Tap the marked rods. Count with me.', visual: function () { nivel = 2; ayuda(); } },
      { texto: (ronda && ronda.ejemplo) || '', visual: function () { nivel = 3; ayuda(); } }
    ]);
    return { destruir: function () { cont.parar(); if (tec) tec.destruir(); ab.destruir(); if (E) E.destruir(); } };
  }

  /* ====================== RETO: DESCOMPONER (n = decenas + unidades) ====================== */
  function montarDescomp(it, ctx, ronda) {
    var dec = Math.floor(it.n / 10) * 10, uni = it.n % 10, paso = 0, listo = false, nivel = 0, tec = null, cont = null;
    ctx.host.innerHTML = '<p class="rp-consigna">' + esc(consigna(it)) + '</p><div id="ab-escena"></div>' +
      '<div class="rp-eq"><span class="is-base">' + it.n + '</span><em>=</em><span class="is-hueco" id="ab-s1">?</span><em>+</em><span class="is-hueco" id="ab-s2">?</span><span class="ab-cuenta" id="ab-cuenta" hidden></span></div>' +
      '<div class="ab-par"><div class="ab-col"><div id="ab-ab"></div><div class="ab-tally" id="ab-tally" hidden></div></div><div id="rp-tz"></div></div>';
    var E = tienda({ pide: 'Tens and units?' });
    if (E) E.decir('topo', 'Count with me!');
    var ab = Abaco($('#ab-ab'), { estado: canon(it.n), activo: false, reserva: 316, alTocarParte: function (t) { if (cont) cont.tocar(t); } });
    function activo() { $('#ab-s1').classList.toggle('ab-eq-activo', paso === 0 && !!tec); $('#ab-s2').classList.toggle('ab-eq-activo', paso === 1); }
    function teclado() {
      ctx.mensaje('Now type the tens. Then tap OK.', 'bien');
      tec = P.teclado($('#rp-tz'), {
        max: 2, alTecla: function () { ctx.accion(); },
        alEnviar: function (n) {
          if (listo) return;
          var esperado = paso === 0 ? dec : uni;
          var seisDecenas = paso === 0 && n === dec / 10 && dec > 0;
          if (n === esperado || seisDecenas) {
            var s = $(paso === 0 ? '#ab-s1' : '#ab-s2'); s.textContent = esperado; s.className = 'is-bien';
            if (seisDecenas) { ctx.mensaje('Yes! ' + n + ' tens = ' + dec + '. Now type the units.', 'bien'); P.vozEn(n + ' tens is ' + dec); }
            tec.limpiar(); paso++;
            if (paso === 2) { listo = true; tec.destruir(); activo(); if (E) E.bien('Thank you!'); ctx.listo('Yes! ' + it.n + ' = ' + dec + ' + ' + uni + '.'); }
            else { activo(); if (!seisDecenas) ctx.mensaje('Now type the units. Then tap OK.', 'bien'); }
          } else {
            tec.limpiar(); ab.sacudir(); if (E) E.mal('Look again!');
            ctx.fallo(paso === 0 ? (n === dec / 10 ? 'Almost! ' + n + ' full rods is ' + dec + '. Type ' + dec + '.' : 'Not yet. Tens: count the full rods. 10, 20, 30...') : 'Not yet. Units: count the beads on the last rod.');
          }
        }
      });
      activo();
    }
    cont = Conteo(ab, it.n, ctx, { guia: false, caja: $('#ab-cuenta'), alTerminar: teclado, nivel: function () { return nivel; },
      alContar: function (n, g) { if (E && g) E.decir('topo', String(n)); else if (E) E.animar('topo', 'asiente'); } });
    function ayuda() {
      if (nivel >= 2) { cont.guia(); var t = $('#ab-tally'); t.hidden = false; t.textContent = tallyHtml(it.n); }
    }
    ctx.peldanos([
      { texto: 'Count the full rods for the tens. The other beads are the units.', visual: function () { nivel = 1; } },
      { texto: 'Tap the marked rods. Count with me.', visual: function () { nivel = 2; ayuda(); } },
      { texto: (ronda && ronda.ejemplo) || '', visual: function () { nivel = 3; ayuda(); } }
    ]);
    return { destruir: function () { cont.parar(); if (tec) tec.destruir(); ab.destruir(); if (E) E.destruir(); } };
  }

  /* ====================== RETO: CUADERNO (cuenta escrita) ====================== */
  function montarCuaderno(it, ctx, ronda) {
    var tok = it.expr.split(' '), ini = parseInt(tok[0], 10), listo = false, nivel = 0;
    ctx.host.innerHTML = '<p class="rp-consigna">' + esc(consigna(it)) + '</p><div id="ab-escena"></div><div class="rp-eq"><span class="is-base">' + esc(it.expr) + '</span><em>=</em><span class="is-hueco" id="ab-r">?</span></div><div class="ab-par"><div class="ab-col"><div id="ab-ab"></div></div><div id="rp-tz"></div></div>';
    var ab = null, cont = $('#ab-ab'), E = tienda({ topoDice: it.expr + ' = ?' });
    var tec = P.teclado($('#rp-tz'), {
      max: 2, alTecla: function () { ctx.accion(); },
      alEnviar: function (n) {
        if (listo) return;
        if (n === it.resp) {
          listo = true; tec.destruir(); $('#ab-r').textContent = n; $('#ab-r').className = 'is-bien';
          nivel = 3; ayuda();
          if (E) E.bien('Yes! ' + n + '!');
          ctx.listo('Yes! ' + it.expr + ' = ' + n + '.');
        } else {
          tec.limpiar(); if (E) E.mal('Not yet!');
          ctx.fallo('Not yet. Tap HINT to see the abacus.');
        }
      }
    });
    function ayuda() {
      if (ab) { ab.destruir(); ab = null; }
      if (nivel < 2) return;
      ab = Abaco(cont, { estado: canon(ini), activo: false, reserva: 316 });
      if (nivel >= 3) ab.marcar(filasQueCambian(canon(ini), canon(it.resp)));
    }
    ctx.peldanos([
      { texto: 'Plus: add beads. Minus: take beads away.', visual: function () { nivel = 1; } },
      { texto: 'This is the first number on the abacus. Now add or take away.', visual: function () { nivel = 2; ayuda(); } },
      { texto: (it.ej || (ronda && ronda.ejemplo) || '') + ' The marked rods change.', visual: function () { nivel = 3; ayuda(); } }
    ]);
    ctx.mensaje('Type the answer. Then tap OK.', '');
    return { destruir: function () { tec.destruir(); if (ab) ab.destruir(); if (E) E.destruir(); } };
  }

  /* ====================== ARRANQUE ====================== */
  P.repaso({
    id: 'abaco',
    rotulo: 'Year 2 Maths', titulo: 'Abacus workshop',
    texto: 'Build and read numbers. Tens and units. Five rounds.',
    finTitulo: 'You did it!', finTexto: 'You know tens and units. Play again any time.',
    rondas: RONDAS,
    montar: function (item, ctx, ronda) {
      if (item.t === 'parte') return montarParte(item, ctx, ronda);
      if (item.t === 'leer') return montarLeer(item, ctx, ronda);
      if (item.t === 'descomp') return montarDescomp(item, ctx, ronda);
      if (item.t === 'cuaderno') return montarCuaderno(item, ctx, ronda);
      return montarConstruir(item, ctx, ronda);
    }
  });
})();
