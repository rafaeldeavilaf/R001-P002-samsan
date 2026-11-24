#!/usr/bin/env node
/* ============================================================
   VERIFICACION — RB01 «Mirar y probar» (lylo/planes/RB01.md)
   Una o más comprobaciones por criterio de H01 a H04 (M09):
     imprimibles/hoja-observacion.html   H01.1 a H01.4
     imprimibles/prueba-papel.html       H02.1 a H02.3
     maths-estilos-rendimiento.html      H03.1 (cabecera y página), H03.2, H03.3
     _local/proto-maths-estilos-fotogramas.html   H04.1, H04.2
   H03.1 (páginas de antes sin cambios), H03.4 y H04.3 son de cierre y
   se comprueban en local con tools/revisar_rb01.js.

   USO:  python3 tools/build.py && node tools/verify_rb01.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.dirname(__dirname);

let ok = 0; const fallas = [];
function check(n, c, d) { if (c) ok++; else { fallas.push(n + (d ? ' -> ' + d : '')); console.log('  FAIL ' + n + (d ? ' -> ' + d : '')); } }
const espera = ms => new Promise(r => setTimeout(r, ms));
const leer = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/* El mismo guardarraíl de recursos de terceros que tools/build.py (regla 2). */
const EXTERNO = /<(?:link|script|img|iframe|source|audio|video)\b[^>]*\b(?:src|href)\s*=\s*["']?(?:https?:)?\/\/|url\(\s*['"]?(?:https?:)?\/\/|@import/i;

function estatico(rel) { return new JSDOM(leer(rel)).window.document; }
function luminancia(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return 1;
  const c = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
/* Cajas de las caras de la antena (color de la antena en el papel de colores). */
function svgAntena(svgTexto, w) {
  const svg = new w.DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + svgTexto + '</svg>', 'image/svg+xml');
  return [...svg.querySelectorAll('polygon.cara[fill="#C2453A"]')].map(p => {
    const xy = p.getAttribute('points').trim().split(/\s+/).map(s => s.split(',').map(Number));
    const xs = xy.map(q => q[0]), ys = xy.map(q => q[1]);
    return { ancho: Math.round(Math.max(...xs) - Math.min(...xs)), alto: Math.round(Math.max(...ys) - Math.min(...ys)) };
  });
}

/* ---------- H01 · hoja de observación ---------- */
function h01() {
  const rel = 'imprimibles/hoja-observacion.html', html = leer(rel), d = estatico(rel);
  const sesiones = [...d.querySelectorAll('.sesion')];
  const ids = sesiones.map(s => s.getAttribute('data-sesion')).sort().join(',');
  check('H01.1 cuatro sesiones, dos por niño', ids === 'mayor-1,mayor-2,menor-1,menor-2', ids);
  check('H01.1 imprimible: tamaño A4 y una hoja por sesión', /@page\s*\{[^}]*A4/.test(html) && /\.sesion\s*\{[^}]*break-before:\s*page/.test(html));
  check('H01.1 sin scripts ni recursos externos', !/<script/i.test(html) && !EXTERNO.test(html));
  sesiones.forEach(s => {
    const k = s.getAttribute('data-sesion');
    const cab = [...s.querySelectorAll('thead th')].map(t => t.textContent.trim());
    check('H01.2 ' + k + ': columnas «Lo abrió solo» y «Se lo pedí»', cab.includes('Lo abrió solo') && cab.includes('Se lo pedí'), cab.join(' | '));
    const filas = [...s.querySelectorAll('tr[data-item]')];
    check('H01.2 ' + k + ': cada fila de lo publicado se puede marcar en las dos columnas', filas.length >= 4 && filas.every(f => f.querySelectorAll('.caja').length >= 2), filas.length + ' filas');
    check('H01.3 ' + k + ': la sesión nombra solo el rol', /^Jugador (menor|mayor) · sesión [12]$/.test(s.querySelector('h2').textContent.trim()));
  });
  check('H01.3 sin campo de nombre', !/nombre\s*:/i.test(d.body.textContent) && d.querySelectorAll('input').length === 0);
  check('H01.3 solo los roles «jugador menor» y «jugador mayor»', /jugador menor/i.test(d.body.textContent) && /jugador mayor/i.test(d.body.textContent));
  check('H01.4 la hoja dice que la llena se queda en papel', /se queda en papel/i.test(d.body.textContent) && /no se escanea/i.test(d.body.textContent));
  const prohibido = /\.(pdf|png|jpe?g|gif|webp|heic|tiff?)$/i;
  const listar = dir => fs.existsSync(path.join(ROOT, dir)) ? fs.readdirSync(path.join(ROOT, dir), { recursive: true }).map(String) : [];
  const malos = listar('imprimibles').concat(listar(path.join('docs', 'validacion'))).filter(f => prohibido.test(f));
  check('H01.4 sin escaneos, PDF ni imágenes en imprimibles/ ni docs/validacion/', malos.length === 0, malos.join(', '));
  check('H01.4 los resultados privados no se versionan (privado/ en .gitignore)', /^privado\/\s*$/m.test(leer('.gitignore')));
}

/* ---------- H02 · guía de la prueba de papel ---------- */
function h02() {
  const rel = 'imprimibles/prueba-papel.html', html = leer(rel), d = estatico(rel);
  const titulos = [...d.querySelectorAll('h2')].map(h => h.textContent.trim());
  check('H02.1 dice qué materiales usar', titulos.includes('Materiales') && d.querySelectorAll('#materiales ul li').length >= 5);
  check('H02.1 dice qué pasos seguir', !!d.querySelector('#pasos table.agenda') && d.querySelectorAll('tr[data-bloque]').length >= 4);
  check('H02.1 dice qué observar en cada paso y con qué señales', [...d.querySelectorAll('tr[data-bloque]')].every(f => f.cells[3] && f.cells[3].textContent.trim().length > 10) &&
    d.querySelectorAll('tr[data-senal]').length >= 3);
  check('H02.1 imprimible: A4, una hoja por sección, plantillas de recorte', /@page\s*\{[^}]*A4/.test(html) && /\.salto\s*\{[^}]*break-before:\s*page/.test(html) &&
    !!d.querySelector('#plantilla-estacion svg') && !!d.querySelector('#plantilla-aldea svg'));
  check('H02.1 sin scripts ni recursos externos', !/<script/i.test(html) && !EXTERNO.test(html));
  const minutos = [...d.querySelectorAll('tr[data-bloque]')].reduce((a, f) => a + Number(f.getAttribute('data-min')), 0);
  const visibles = [...d.querySelectorAll('tr[data-bloque] td.min')].reduce((a, t) => a + Number(t.textContent), 0);
  check('H02.2 la agenda suma una hora', minutos === 60 && visibles === 60, minutos + ' / ' + visibles);
  const senales = d.querySelector('table.senales thead').textContent;
  check('H02.2 con los dos niños', /jugador menor/i.test(senales) && /jugador mayor/i.test(senales));
  check('H02.3 espacio para anotar a cada niño', d.querySelectorAll('[data-notas]').length >= 2);
  check('H02.3 sin campo de nombre', !/nombre\s*:/i.test(d.body.textContent) && d.querySelectorAll('input').length === 0);
  check('H02 los retos no traen contenido del colegio (sin números para operar)', !/\d+\s*[+\-×x÷]\s*\d+/.test([...d.querySelectorAll('tr[data-bloque]')].map(f => f.textContent).join(' ')));
}

/* ---------- H03 · página de rendimiento ---------- */
function abrirRendimiento(o) {
  const errores = [], llamadas = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented/i.test(m)) errores.push(m); });
  const dom = new JSDOM(leer('maths-estilos-rendimiento.html'), {
    url: 'https://example.test/maths-estilos-rendimiento.html', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      /* Tiempo simulado: cada cuadro avanza o.paso ms. */
      let t = 0;
      Object.defineProperty(w.performance, 'now', { value: () => t, configurable: true });
      w.requestAnimationFrame = f => setTimeout(() => { t += o.paso; f(t); }, 0);
      if (o.memoria) Object.defineProperty(w.performance, 'memory', { value: { usedJSHeapSize: o.memoria * 1048576 }, configurable: true });
      w.RB01_CFG = { calentar: 100, medir: 600 };
      /* Lienzo falso: jsdom no dibuja. */
      w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (obj, k) => (k in obj ? obj[k] : () => {}), set: (obj, k, v) => { obj[k] = v; return true; } });
      /* Trampas de red (H03.3): nada debe salir del navegador. */
      const trampa = nombre => function () { llamadas.push(nombre); throw new Error('red: ' + nombre); };
      w.fetch = trampa('fetch');
      w.XMLHttpRequest = trampa('XMLHttpRequest');
      w.WebSocket = trampa('WebSocket');
      w.EventSource = trampa('EventSource');
      w.Image = trampa('Image');
      Object.defineProperty(w.navigator, 'sendBeacon', { value: trampa('sendBeacon'), configurable: true });
    }
  });
  return { dom, w: dom.window, errores, llamadas };
}
function correrModo(boton, o) {
  return new Promise(resolve => {
    const r = abrirRendimiento(o);
    r.maxPiezas = 0; r.con3d = false;
    const mira = setInterval(() => {
      const ps = r.w.document.querySelectorAll('.rb-pieza');
      r.maxPiezas = Math.max(r.maxPiezas, ps.length);
      if (ps.length && /translate3d\(.*rotate3d\(/.test(ps[0].style.transform)) r.con3d = true;
    }, 5);
    r.dom.window.addEventListener('unload', () => clearInterval(mira));
    const fin = setTimeout(() => resolve(Object.assign(r, { res: null })), 15000);
    r.w.RB01_ALTERMINAR = (modo, res) => { clearTimeout(fin); clearInterval(mira); resolve(Object.assign(r, { modo, res })); };
    setTimeout(() => { const b = r.w.document.querySelector(boton); if (b) b.click(); else { clearTimeout(fin); resolve(Object.assign(r, { res: null })); } }, 50);
  });
}
async function h03() {
  const js = leer('prototipos/maths-estilos/rendimiento.js');
  check('H03.1 cabecera «// publicar: true»', /^\s*\/\/\s*publicar:\s*true\s*$/m.test(js));
  check('H03.1 el build la escribe como página nueva de la raíz', fs.existsSync(path.join(ROOT, 'maths-estilos-rendimiento.html')));
  check('H03.3 la página no pide nada a terceros', !EXTERNO.test(leer('maths-estilos-rendimiento.html')));

  const rapido = await correrModo('#play', { paso: 16.7, memoria: 48 });
  const fc = rapido.res && rapido.res.filas;
  check('H03.2 Canvas: un resultado por escalón (50, 150, 300)', !!fc && fc.map(f => f.piezas).join(',') === '50,150,300', JSON.stringify(rapido.res));
  check('H03.2 Canvas: FPS y FPS p5 medidos', !!fc && fc.every(f => f.fps > 55 && f.fps < 65 && f.fpsP5 > 55 && f.cuadros > 20), fc && fc.map(f => f.fps + '/' + f.fpsP5).join(' '));
  check('H03.2 Canvas: memoria JS aproximada cuando el navegador la da', !!fc && fc.every(f => f.memoriaMB === 48));
  check('H03.2 a 60 FPS se sostiene y el veredicto dice AGUANTA', !!fc && fc.every(f => f.sostiene) &&
    /AGUANTA/.test(rapido.w.document.querySelector('.rb-veredictos').textContent) && !/NO AGUANTA/.test(rapido.w.document.querySelector('.rb-veredictos').textContent));
  const filasCanvas = rapido.w.document.querySelectorAll('#rb-resultados tr[data-modo="canvas"][data-piezas]').length;
  const filasCss = rapido.w.document.querySelectorAll('#rb-resultados tr[data-modo="css3d"][data-piezas]').length;
  check('H03.2 Canvas y CSS 3D por separado: correr Canvas no llena CSS 3D', filasCanvas === 3 && filasCss === 0, filasCanvas + ' / ' + filasCss);
  check('H03.3 resultados en pantalla y en texto para copiar', filasCanvas === 3 && /FPS p5/.test(rapido.w.document.querySelector('#rb-texto').value) &&
    /memoria JS aproximada 48 MB/.test(rapido.w.document.querySelector('#rb-texto').value));
  check('H03.3 Canvas: nada sale del navegador', rapido.llamadas.length === 0, rapido.llamadas.join(', '));
  check('H03 Canvas sin errores de JS', rapido.errores.length === 0, rapido.errores.join(' | '));
  rapido.w.close();

  const lento = await correrModo('#rb-css3d', { paso: 50 });
  const fl = lento.res && lento.res.filas;
  check('H03.2 CSS 3D: un resultado por escalón', !!fl && fl.length === 3, JSON.stringify(lento.res));
  check('H03.2 CSS 3D: dibuja hasta 300 piezas con transformaciones 3D', lento.maxPiezas === 300 && lento.con3d, lento.maxPiezas + ' piezas, 3D ' + lento.con3d);
  check('H03.2 CSS 3D: al terminar quita las piezas', lento.w.document.querySelectorAll('.rb-pieza').length === 0);
  check('H03.2 a 20 FPS no se sostiene y el veredicto dice NO AGUANTA', !!fl && fl.every(f => !f.sostiene && f.fpsP5 < 25) &&
    /CSS 3D:[^·]*ninguno · NO AGUANTA/.test(lento.w.document.querySelector('.rb-veredictos').textContent));
  check('H03.2 sin performance.memory dice «no disponible»', !!fl && fl.every(f => f.memoriaMB === null) && /no disponible/.test(lento.w.document.querySelector('#rb-resultados').textContent));
  check('H03.3 CSS 3D: nada sale del navegador', lento.llamadas.length === 0, lento.llamadas.join(', '));
  check('H03 CSS 3D sin errores de JS', lento.errores.length === 0, lento.errores.join(' | '));
  lento.w.close();

  /* Tercera prueba (24 nov 2026, a pedido de Rafael): papel pre-dibujado, copiado con drawImage. */
  const papel = await correrModo('#rb-imagen', { paso: 16.7 });
  const fp = papel.res && papel.res.filas;
  check('H03 papel pre-dibujado: un resultado por escalón', !!fp && fp.map(f => f.piezas).join(',') === '50,150,300', JSON.stringify(papel.res));
  check('H03 papel pre-dibujado: queda en su propia fila, aparte de Canvas y CSS 3D',
    papel.w.document.querySelectorAll('#rb-resultados tr[data-modo="imagen"][data-piezas]').length === 3 &&
    papel.w.document.querySelectorAll('#rb-resultados tr[data-modo="canvas"][data-piezas]').length === 0);
  check('H03 papel pre-dibujado: el aviso pide la prueba que falta', /Ahora toca «Probar Canvas 2D»/.test(papel.w.document.querySelector('#rb-aviso').textContent));
  check('H03.3 papel pre-dibujado: nada sale del navegador', papel.llamadas.length === 0, papel.llamadas.join(', '));
  check('H03 papel pre-dibujado sin errores de JS', papel.errores.length === 0, papel.errores.join(' | '));
  papel.w.close();

  /* Escalón más alto que se sostiene: el dato para decidir. */
  const R = abrirRendimiento({ paso: 16.7 });
  await espera(50);
  const api = R.w.RB01_REND;
  check('H03.2 escalón más alto que se sostiene', api.escalonSostenido([{ piezas: 50, sostiene: true }, { piezas: 150, sostiene: true }, { piezas: 300, sostiene: false }]) === 150 &&
    api.escalonSostenido([{ piezas: 50, sostiene: false }]) === null);
  const tirones = Array(19).fill(16.7).concat([200]);
  check('H03.2 el percentil 5 castiga los tirones que el promedio esconde', api.resumir(150, tirones, null).fps > 30 && api.resumir(150, Array(40).fill(16.7).concat(Array(4).fill(80)), null).fpsP5 < 30);
  check('H03 umbral fijado antes de medir: 30 FPS con 150 piezas', api.CFG.umbral === 30 && api.CFG.referencia === 150);
  R.w.close();
}

/* ---------- H04 · fotogramas de estilo ---------- */
async function h04() {
  const js = leer('prototipos/maths-estilos/fotogramas.js');
  check('H04 los fotogramas no se publican', !/^\s*\/[/*]\s*publicar:\s*true/m.test(js) && !fs.existsSync(path.join(ROOT, 'maths-estilos-fotogramas.html')));
  const rel = '_local/proto-maths-estilos-fotogramas.html';
  const errores = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented|getContext/i.test(m)) errores.push(m); });
  const dom = new JSDOM(leer(rel), {
    url: 'https://example.test/fotogramas.html', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }); }
  });
  const w = dom.window, d = w.document;
  await espera(150);
  d.querySelector('#play').click();
  const vistos = [];
  for (let i = 0; i < 4; i++) {
    const m = d.querySelector('[data-fotograma]');
    vistos.push(m && m.getAttribute('data-fotograma'));
    if (i === 0) {
      const fondo = m.querySelector('rect.fondo');
      const trazos = new Set([...m.querySelectorAll('polygon[stroke]')].map(p => p.getAttribute('stroke').toUpperCase()));
      const caras = [...m.querySelectorAll('polygon.cara')];
      check('H04.1 papercraft técnico: papel negro sobre tapete oscuro', fondo && luminancia(fondo.getAttribute('fill')) < 0.12 &&
        caras.length >= 8 && caras.every(c => luminancia(c.getAttribute('fill')) < 0.12), fondo && fondo.getAttribute('fill'));
      check('H04.1 papercraft técnico: bordes neón', ['#2FE6FF', '#FF4FD8', '#B6FF3B'].every(c => trazos.has(c)), [...trazos].join(' '));
      check('H04.1 papercraft técnico: origami (facetas plegadas)', m.querySelectorAll('polygon:not([stroke])').length >= 20);
      check('H04.1 papercraft técnico se llama así', /Technical papercraft/.test(m.textContent));
    }
    const panel = m.querySelector('.fs-panel');
    check('H04 panel del reto claro y escena descrita en ' + vistos[i], !!panel && /\.fs-panel\{[^}]*background:#FFFDF6;color:#1E1426/.test(d.head.innerHTML) && !!m.querySelector('svg[role="img"][aria-label]'));
    d.querySelector('#fs-sig').click();
  }
  /* Relieve de los dos fotogramas de papel (decisión de Rafael, RB01): capas a distinta altura. */
  const lista = w.RB01_FOTOGRAMAS.lista;
  [['papercraft-tecnico', 'pc'], ['papel-colores', 'pp']].forEach(([id, pref]) => {
    const F = lista.find(x => x.id === id);
    const svg = new w.DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + F.dibujar() + '</svg>', 'image/svg+xml');
    const amb = h => { const f = svg.getElementById(pref + '-r' + h); const s = f && f.querySelector('.ambiente'); return s ? Number(s.getAttribute('dy')) : 0; };
    check('H04 relieve ' + id + ': un filtro de sombra por altura (1 a 5)', [1, 2, 3, 4, 5].every(h => !!svg.getElementById(pref + '-r' + h)));
    check('H04 relieve ' + id + ': lo más alto proyecta sombra más larga (casco sobre brazos)', amb(4) > amb(2) && amb(2) > 0, amb(4) + ' / ' + amb(2));
    const caras = [...svg.querySelectorAll('polygon.cara')];
    check('H04 relieve ' + id + ': cada cara usa el filtro de su altura', caras.length >= 8 &&
      caras.every(c => c.getAttribute('filter') === 'url(#' + pref + '-r' + c.getAttribute('data-alto') + ')'));
    check('H04 relieve ' + id + ': cada cara tiene debajo su canto de papel', caras.every(c => { const a = c.previousElementSibling; return a && a.getAttribute('class') === 'canto'; }));
    check('H04 relieve ' + id + ': el hueco está hundido (sombra interior)', !!svg.querySelector('clipPath#' + pref + '-hueco') && !!svg.querySelector('polygon.hueco'));
  });
  /* Papel y cartón (estilo elegido por Rafael): material y grosor visibles. */
  {
    const svg = new w.DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + lista.find(x => x.id === 'papel-colores').dibujar() + '</svg>', 'image/svg+xml');
    const f3 = svg.getElementById('pp-r3');
    check('H04 papel: cada pieza lleva fibra y bisel iluminados desde arriba a la izquierda', [1, 2, 3, 4, 5].every(h => {
      const f = svg.getElementById('pp-r' + h);
      const luz = f && f.querySelector('feDiffuseLighting feDistantLight');
      return f && f.querySelector('feTurbulence') && luz && luz.getAttribute('azimuth') === '225';
    }));
    check('H04 papel: tres sombras por altura (contacto, ambiental y lejana)', !!f3 && ['contacto', 'ambiente', 'lejos'].every(c => !!f3.querySelector('.' + c)));
    check('H04 papel: los brazos son de cartón con canto corrugado de 4 capas', [...svg.querySelectorAll('polygon.canto[fill="url(#pp-corrugado)"]')].length === 8 && !!svg.getElementById('pp-corrugado'));
    check('H04 papel: tablero de cartón con textura', /url\(#pp-carton\)/.test(svg.querySelector('rect.fondo').getAttribute('filter') || ''));
  }
  /* Revisión infantil: sin robot y sin antena de palo con cúpula. */
  const fuente = leer('prototipos/maths-estilos/fotogramas.js');
  check('Revisión infantil: no hay robot en la escena', !/rol:\s*'robot'/.test(fuente));
  const antena = svgAntena(lista.find(x => x.id === 'papel-colores').dibujar(), w);
  check('Revisión infantil: ninguna pieza de la antena es un palo (alto ≤ 1,2 × ancho)', antena.length === 2 && antena.every(b => b.alto <= 1.2 * b.ancho), JSON.stringify(antena));
  check('H04.1 tres fotogramas distintos y el cuarto «siguiente» vuelve al primero', new Set(vistos.slice(0, 3)).size === 3 && vistos[3] === vistos[0], vistos.join(', '));
  check('H04.1 el tercero se rotula como imitación del pixel art', /imitation/i.test(w.RB01_FOTOGRAMAS.lista[2].nota));
  const html = leer(rel);
  const svgs = w.RB01_FOTOGRAMAS.lista.map(F => F.dibujar()).join('');
  check('H04.2 dibujados por código: sin imágenes dentro de los fotogramas', !/<image\b/i.test(svgs) && !/href=/i.test(svgs));
  check('H04.2 sin recursos de terceros', !EXTERNO.test(html));
  check('H04.2 sin contenido del colegio en el reto (sin números)', !/\d/.test(d.querySelector('.fs-reto').textContent));
  check('H04 sin errores de JS', errores.length === 0, errores.join(' | '));
  w.close();
}

(async () => {
  console.log('RB01 · H01 hoja de observación'); h01();
  console.log('RB01 · H02 guía de papel'); h02();
  console.log('RB01 · H03 rendimiento'); await h03();
  console.log('RB01 · H04 fotogramas'); await h04();
  console.log(fallas.length ? '\nFALLAN ' + fallas.length + ' (ok ' + ok + ').' : '\nTODO OK — ' + ok + ' comprobaciones de RB01.');
  process.exit(fallas.length ? 1 : 0);
})();
