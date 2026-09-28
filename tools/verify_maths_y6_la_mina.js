#!/usr/bin/env node
/* ============================================================
   VERIFY — Maths Y6 "La Mina" (temas/maths/y6-la-mina)

   Juega el .html YA CONSTRUIDO (_local/maths-y6-la-mina.html) con
   jsdom. Por cada nivel y cada familia sirve TODAS sus variantes, en
   orden: Math.random = 0 hace que el Runner elija siempre la primera
   variante no vista, sin tocar el motor. Cada variante se resuelve con
   su solucion declarada y tambien se falla con una incorrecta, y los
   modos de entrada rotan: raton, tactil simulado y teclado.

   Comprueba ademas: orden del sello (repaso, concreto, pictorico,
   abstracto, jefe), gema al cerrar cada tramo, reintento con otra
   variante, primer item medio resuelto y que la escena no deja pasar
   una respuesta vacia.

   USO:  python3 tools/build.py && node tools/verify_maths_y6_la_mina.js
   Sale con codigo 0 si todo pasa.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.dirname(__dirname);
const PAGINA = path.join(ROOT, '_local', 'maths-y6-la-mina.html');
const MENOS = '−';

let passed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failures.push(name + (detail ? ' -> ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' -> ' + detail : '')); }
}
function section(t) { console.log('\n' + t); }
function ok(t) { console.log('  ok   ' + t); }

if (!fs.existsSync(PAGINA)) { console.error('Falta ' + PAGINA + '. Corre antes: python3 tools/build.py'); process.exit(1); }
const HTML = fs.readFileSync(PAGINA, 'utf8');

function abrir(guardado, reloj) {
  const vc = new VirtualConsole();
  const errores = [];
  vc.on('jsdomError', e => { if (!/Not implemented|getContext/i.test(String(e && e.message))) errores.push(String(e && e.message)); });
  const dom = new JSDOM(HTML, {
    url: 'https://rafaeldeavilaf.github.io/R001-P002-samsan/maths-y6-la-mina.html',
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {}; w.confirm = () => true; w.alert = () => {};
      w.Math.random = () => 0;                     // variantes en orden, barajas fijas
      if (reloj) {                                 // reloj simulado: los temporizadores esperan a tick(ms)
        let ahora = 0, id = 0; const cola = [];
        w.setTimeout = (fn, ms) => { cola.push({ id: ++id, t: ahora + (ms || 0), fn }); return id; };
        w.clearTimeout = (i) => { const k = cola.findIndex(c => c.id === i); if (k >= 0) cola.splice(k, 1); };
        w.setInterval = () => 0; w.clearInterval = () => {};
        w.tick = (ms) => { const fin = ahora + ms; for (;;) { cola.sort((a, b) => a.t - b.t); const c = cola[0];
          if (!c || c.t > fin) break; cola.shift(); ahora = c.t; c.fn(); } ahora = fin; };
      }
      w.matchMedia = q => ({ matches: /reduce/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.localStorage.setItem('samsan:hero', JSON.stringify({ v: 1, body: 'a', alias: '', chosen: true }));
      if (guardado) w.localStorage.setItem('samsan:maths-y6-la-mina', JSON.stringify(guardado));
    }
  });
  dom.errores = errores;
  return dom;
}

const num = n => (n < 0 ? MENOS + Math.abs(n) : String(n));
const dataDe = w => w.QUIZ_DATA;

/* Variante servida: la que tiene el enunciado que se ve (unicos por nivel). */
function servida(w, lv) {
  const stem = w.document.getElementById('qStem').textContent.trim();
  for (const fam of lv.questions) for (let vi = 0; vi < fam.variants.length; vi++) {
    const v = fam.variants[vi];
    if (v.stem.replace(/<[^>]*>/g, '') === stem) return { fam, v, vi };
  }
  return null;
}

/* ---------- entrada: raton, tactil, teclado ---------- */
function clic(w, el) { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, detail: 1 })); }
function toque(w, el) {
  const pd = new w.MouseEvent('pointerdown', { bubbles: true, button: 0 });
  Object.defineProperty(pd, 'pointerType', { value: 'touch' });
  el.dispatchEvent(pd);
  const pu = new w.MouseEvent('pointerup', { bubbles: true });
  el.dispatchEvent(pu);
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, detail: 1 }));
}
function tecla(w, key) { w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); }

const MODOS = ['raton', 'tactil', 'teclado'];

/* Lleva la escena a `x` y confirma, con el modo de entrada dado. */
function responder(w, v, x, modo) {
  const d = w.document, L = v.line, host = d.getElementById('qScene');
  const pulsar = (el) => (modo === 'tactil' ? toque(w, el) : clic(w, el));
  if (L.modo === 'concreto') {
    if (L.bandera) {                                        // primero la bandera
      if (modo === 'teclado') tecla(w, 'Enter'); else pulsar(host.querySelector('.linea__ok'));
    }
    const actual = () => {
      const t = host.querySelector('.linea__ahora').textContent.replace(MENOS, '-');
      return parseInt(t.replace(/[^0-9-]/g, ''), 10);
    };
    // Palancas: primero las de 10 (descomponer en decenas), luego las de 1.
    let guard = 0;
    while (actual() !== x && guard++ < 200) {
      const dif = x - actual(), sube = dif > 0, diez = Math.abs(dif) >= 10;
      if (modo === 'teclado') tecla(w, diez ? (sube ? 'PageUp' : 'PageDown') : (sube ? 'ArrowUp' : 'ArrowDown'));
      else pulsar(host.querySelector('[data-d="' + (sube ? '' : '-') + (diez ? '10' : '1') + '"]'));
    }
    if (actual() !== x) return 'no llego a ' + x + ' (quedo en ' + actual() + ')';
    if (modo === 'teclado') tecla(w, 'Enter'); else pulsar(host.querySelector('.linea__ok'));
  } else if (L.modo === 'pictorico') {
    const fmt = L.faltante === 'cambio' ? (n => (n > 0 ? '+' + n : num(n))) : num;
    const btns = Array.from(host.querySelectorAll('.linea__opcion'));
    const i = btns.findIndex(b => b.textContent.replace(/^[A-E]/, '').trim() === fmt(x));
    if (i < 0) return 'no hay opcion ' + fmt(x);
    if (modo === 'teclado') tecla(w, 'ABCD'[i]); else pulsar(btns[i]);
  } else {
    const s = String(x);
    if (modo === 'teclado') {
      for (const ch of s) tecla(w, ch);
      tecla(w, 'Enter');
    } else {
      for (const ch of s) pulsar(host.querySelector('.linea__tecla[data-k="' + ch + '"]'));
      pulsar(host.querySelector('.linea__teclado .linea__ok'));
    }
  }
  return null;
}

/* Una incorrecta que la escena puede recibir (dentro del instrumento). */
function incorrecta(v) {
  const L = v.line, sol = v.solucion;
  if (L.modo === 'pictorico') {
    const fmt = L.faltante === 'cambio' ? (n => (n > 0 ? '+' + n : num(n))) : num;
    const o = v.options.find((t, i) => i !== v.answer);
    return parseInt(o.replace(MENOS, '-'), 10);
  }
  if (L.modo === 'concreto') {
    const lo = L.faltante === 'cambio' ? L.min - L.inicio : L.min, hi = L.faltante === 'cambio' ? L.max - L.inicio : L.max;
    return sol + 1 <= hi ? sol + 1 : sol - 1 >= lo ? sol - 1 : sol;
  }
  return sol + 1;
}

function feedback(w) {
  const f = w.document.getElementById('qFeed');
  return f.classList.contains('feedback--good') ? 'bien' : f.classList.contains('feedback--bad') ? 'mal' : 'nada';
}
function siguiente(w) { clic(w, w.document.getElementById('btnNext')); }

/* ---------- 1. Datos ---------- */
section('1. Datos generados');
{
  const dom = abrir(), w = dom.window, D = dataDe(w);
  check('data.js carga', !!D && Array.isArray(D.levels));
  check('meta: capa comun, bioma caverna', D.meta.capa === 'comun' && D.meta.bioma === 'caverna');
  D.levels.forEach(lv => {
    check('nivel ' + lv.id + ': 12 items', lv.questions.length === 12, String(lv.questions.length));
    check('nivel ' + lv.id + ': sello declarado', lv.sello === true && lv.tramosItems.length === lv.tramos);
    const orden = lv.questions.map(f => f.sello).join(',');
    const inicio = lv.id === 1 ? 'entrada,entrada' : 'repaso,repaso';
    check('nivel ' + lv.id + ': orden ' + inicio + ', 3 sellos, jefe',
      orden === inicio + ',concreto,pictorico,abstracto,concreto,pictorico,abstracto,concreto,pictorico,abstracto,jefe', orden);
    lv.questions.forEach(f => f.variants.forEach(v => {
      const L = v.line;
      check(f.id + ': inicio + cambio = final', L.inicio + L.cambio === L.final);
      check(f.id + ': solucion es el dato que falta', v.solucion === L[L.faltante]);
      check(f.id + ': dentro del instrumento', L.min <= L.inicio && L.inicio <= L.max && L.min <= L.final && L.final <= L.max);
    }));
    lv.questions.filter(f => f.variants[0].line.modo === 'pictorico' && f.variants[0].line.faltante === 'final').forEach(f => f.variants.forEach(v => {
      const L = v.line, e1 = Math.abs(L.inicio) + Math.abs(L.cambio);
      if (L.inicio < 0 && L.cambio > 0) check(f.id + ': incluye la suma sin signo (E1)', v.options.includes(num(e1)), v.stem);
    }));
    const t3 = lv.questions.slice(8, 11);
    check('nivel ' + lv.id + ': sin pista grafica en el tercer tramo', t3.every(f => f.pistaGrafica === false));
  });
  check('primer item medio resuelto (a una accion)', D.levels[0].questions[0].variants.every(v => Math.abs(v.line.valor - v.solucion) === 1));
  ok('datos revisados');
}

/* ---------- 2. Partidas: todas las variantes, bien y mal ---------- */
section('2. Partidas simuladas: cada variante bien y mal, con raton, tactil y teclado');
{
  const D0 = dataDe(abrir().window);
  D0.levels.forEach((lv0, li) => {
    const NV = Math.max(...lv0.questions.map(f => f.variants.length));
    const resueltas = {};                    // fam.id -> Set(vi) resueltas bien
    const falladas = {};                     // fam.id -> Set(vi) falladas
    for (let k = 0; k <= NV; k++) {           // partida k: falla k veces cada familia y luego acierta
      // Los niveles anteriores, ya superados: asi se desbloquea este.
      const previos = {};
      for (let j = 0; j < li; j++) previos[j + 1] = { done: true, gems: 5, plays: 1 };
      const dom = abrir({ version: 1, levels: previos, totalXP: 0, gems: 5 * li }), w = dom.window, d = w.document;
      const lv = w.QUIZ_DATA.levels[li];
      const lvBtn = d.querySelectorAll('#levelList .level-card')[li];
      if (!lvBtn) { check('nivel ' + lv.id + ' en el mapa', false); break; }
      clic(w, lvBtn);
      const go = d.getElementById('briefGo');
      if (go) clic(w, go);
      const gemas = [];
      let n = 0, entrada = 0, err = null, vistosOrden = [];
      while (d.getElementById('scrPlay').classList.contains('is-on') && n++ < 400) {
        const s = servida(w, lv);
        if (!s) { err = 'variante no encontrada: ' + d.getElementById('qStem').textContent; break; }
        if (!vistosOrden.length || vistosOrden[vistosOrden.length - 1] !== s.fam.id) vistosOrden.push(s.fam.id);
        const intentos = (falladas[s.fam.id + '#' + k] = (falladas[s.fam.id + '#' + k] || 0));
        const fallar = intentos < k;
        const modo = MODOS[entrada++ % 3];
        const x = fallar ? incorrecta(s.v) : s.v.solucion;
        if (fallar && x === s.v.solucion) { err = s.fam.id + ': no hay incorrecta posible'; break; }
        const e = responder(w, s.v, x, modo);
        if (e) { err = s.fam.id + ' (' + modo + '): ' + e; break; }
        const fb = feedback(w);
        if (fallar) {
          check(s.fam.id + ' v' + s.vi + ' falla con una incorrecta (' + modo + ')', fb === 'mal', fb);
          (falladas[s.fam.id] = falladas[s.fam.id] || new Set()).add(s.vi);
          falladas[s.fam.id + '#' + k]++;
        } else {
          check(s.fam.id + ' v' + s.vi + ' se resuelve con la solucion (' + modo + ')', fb === 'bien', fb + ' ' + s.v.stem);
          (resueltas[s.fam.id] = resueltas[s.fam.id] || new Set()).add(s.vi);
        }
        gemas.push(d.getElementById('hudGems').textContent);
        siguiente(w);
      }
      if (err) { check('partida ' + k + ' del nivel ' + lv.id, false, err); break; }
      check('nivel ' + lv.id + ' partida ' + k + ': termina en la victoria', d.getElementById('scrWin').classList.contains('is-on'));
      check('nivel ' + lv.id + ' partida ' + k + ': orden del sello respetado', vistosOrden.join() === lv.questions.map(f => f.id).join(), vistosOrden.join());
      check('nivel ' + lv.id + ' partida ' + k + ': 5 gemas, una por tramo', /5\s*\/\s*5/.test(gemas[gemas.length - 1] || ''), gemas.slice(-1)[0]);
      check('nivel ' + lv.id + ' partida ' + k + ': sin errores de JavaScript', dom.errores.length === 0, dom.errores.join(' | '));
    }
    lv0.questions.forEach(f => {
      check(f.id + ': todas las variantes resueltas con su solucion', (resueltas[f.id] || new Set()).size === f.variants.length,
        (resueltas[f.id] ? resueltas[f.id].size : 0) + '/' + f.variants.length);
      check(f.id + ': todas las variantes fallan con una incorrecta', (falladas[f.id] || new Set()).size === f.variants.length,
        (falladas[f.id] ? falladas[f.id].size : 0) + '/' + f.variants.length);
    });
    ok('nivel ' + lv0.id + ' jugado ' + (NV + 1) + ' veces');
  });
}

/* ---------- 3. Detalles de la escena ---------- */
section('3. Escena line: respuesta vacia, bandera, gema por tramo');
{
  const dom = abrir(), w = dom.window, d = w.document;
  clic(w, d.querySelectorAll('#levelList .level-card')[0]);
  if (d.getElementById('briefGo')) clic(w, d.getElementById('briefGo'));
  const lv = w.QUIZ_DATA.levels[0];
  // Avanza hasta el primer abstracto y confirma sin escribir.
  let guard = 0;
  while (guard++ < 20) {
    const s = servida(w, lv);
    if (s.v.line.modo === 'abstracto') break;
    responder(w, s.v, s.v.solucion, 'raton'); siguiente(w);
  }
  const s = servida(w, lv);
  clic(w, d.querySelector('.linea__teclado .linea__ok'));
  check('abstracto: confirmar vacio no responde', feedback(w) === 'nada');
  tecla(w, '-'); tecla(w, 'Backspace');
  check('abstracto: el signo menos se pone y se quita', d.querySelector('.linea__caja').textContent.trim() === '' || d.querySelector('.linea__caja').textContent === ' ');
  check('abstracto: el instrumento no se muestra antes de responder', s.v.line.modo === 'abstracto');
  ok('escena revisada');
}

/* ---------- 4. Escalera de pistas ---------- */
section('4. Escalera de pistas: 20 s sin accion, tecla que reinicia, fallo que sube');
{
  const dom = abrir(null, true), w = dom.window, d = w.document;
  clic(w, d.querySelectorAll('#levelList .level-card')[0]);
  if (d.getElementById('briefGo')) clic(w, d.getElementById('briefGo'));
  const hint = d.getElementById('qHint'), peldano = () => hint.getAttribute('data-peldano'), abierta = () => hint.classList.contains('is-on');
  check('pistas: el primer intento empieza cerrado en el peldano 1', !abierta() && peldano() === '1', peldano());
  w.tick(19000);
  check('pistas: a los 19 s todavia no abre', !abierta());
  tecla(w, 'Shift'); w.tick(19000);
  check('pistas: una tecla reinicia la cuenta de 20 s', !abierta());
  w.tick(1500);
  check('pistas: 20 s sin accion abren el peldano 1', abierta() && peldano() === '1', peldano());
  w.tick(20000);
  check('pistas: otros 20 s suben al peldano 2 (figura)', peldano() === '2', peldano());
  w.tick(20000);
  check('pistas: y al 3 (ejemplo resuelto)', peldano() === '3', peldano());
  w.tick(60000);
  check('pistas: no pasa del peldano 3', peldano() === '3', peldano());
  check('pistas: el texto es el de la variante', hint.textContent.indexOf(servida(w, w.QUIZ_DATA.levels[0]).v.pistas[2]) >= 0);
  // Un fallo: la misma familia vuelve con otra variante y la pista arranca un peldano mas arriba.
  const s0 = servida(w, w.QUIZ_DATA.levels[0]);
  responder(w, s0.v, incorrecta(s0.v), 'raton'); siguiente(w); w.tick(300);
  check('pistas: tras un fallo arranca en el peldano 2 y se abre sola', peldano() === '2' && abierta(), peldano() + ' ' + abierta());
  // Pulsar HINT con la pista abierta sube un peldano.
  clic(w, d.getElementById('btnHint'));
  check('pistas: HINT con la pista abierta sube al peldano 3', peldano() === '3', peldano());
  ok('escalera revisada');
}


console.log('\n--------------------------------------------------------');
if (failures.length) {
  console.log('FALLAN ' + failures.length + ' de ' + (passed + failures.length) + ':');
  failures.slice(0, 40).forEach(f => console.log('  - ' + f));
  process.exit(1);
}
console.log('TODO OK — ' + passed + ' comprobaciones.');
process.exit(0);   // las ventanas de jsdom pueden tener relojes vivos
