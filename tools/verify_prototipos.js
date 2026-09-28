#!/usr/bin/env node
/* ============================================================
   VERIFY — prototipos de nucleo de La Mina (solo local)
   _local/proto-excavar.html y _local/proto-cartas.html, con jsdom.

   Juega cada puzzle de los tres juegos con la solucion que declara
   tools/gen/maths_y6_prototipos.py, rotando raton, tactil simulado y
   teclado, y comprueba lo que NO debe pasar: un camino con otra suma no
   abre la puerta (y se ve la diferencia), una carta que cae en roca o
   fuera del pozo rebota y vuelve a la mano, y deshacer vuelve atras.
   Los temporizadores van acelerados (las animaciones no se esperan).

   USO:  python3 tools/build.py && node tools/verify_prototipos.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.dirname(__dirname);
const MENOS = '−';

let passed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) passed++;
  else { failures.push(name + (detail ? ' -> ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' -> ' + detail : '')); }
}
function section(t) { console.log('\n' + t); }

function abrir(archivo) {
  const f = path.join(ROOT, '_local', archivo);
  if (!fs.existsSync(f)) { console.error('Falta ' + f + '. Corre antes: python3 tools/build.py'); process.exit(1); }
  const vc = new VirtualConsole();
  const errores = [];
  vc.on('jsdomError', e => { if (!/Not implemented|getContext/i.test(String(e && e.message))) errores.push(String(e && e.message)); });
  const dom = new JSDOM(fs.readFileSync(f, 'utf8'), {
    url: 'https://example.test/' + archivo, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      const orig = w.setTimeout.bind(w);
      w.setTimeout = (fn, ms) => orig(fn, Math.min(ms || 0, 2));      // animaciones aceleradas
      w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    }
  });
  dom.errores = errores;
  return dom;
}
const esperar = ms => new Promise(r => setTimeout(r, ms));
function clic(w, el) { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, detail: 1 })); }
function toque(w, el) {
  const pd = new w.MouseEvent('pointerdown', { bubbles: true }); Object.defineProperty(pd, 'pointerType', { value: 'touch' });
  el.dispatchEvent(pd); el.dispatchEvent(new w.MouseEvent('pointerup', { bubbles: true }));
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, detail: 1 }));
}
function tecla(w, key) { w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); }
const MODOS = ['raton', 'tactil', 'teclado'];
const num = n => (n < 0 ? MENOS + Math.abs(n) : String(n));

/* ---------- E. Excavar ---------- */
function caminos(p) {                                // todos los caminos a la puerta: [{suma, cam}]
  const out = [];
  function dfs(f, c, vis, suma, cam) {
    const v = p.bloques[f][c];
    if (v === null) return;
    suma += v; cam = cam.concat([[f, c]]);
    if (f === p.alto - 1 && c === p.puerta) out.push({ suma, cam });
    if (f + 1 < p.alto && p.bloques[f + 1][c] !== null) dfs(f + 1, c, vis.concat([f + 1 + ',' + c]), suma, cam);
    [-1, 1].forEach(dc => { const nc = c + dc; if (nc >= 0 && nc < p.ancho && vis.indexOf(f + ',' + nc) < 0 && p.bloques[f][nc] !== null) dfs(f, nc, vis.concat([f + ',' + nc]), suma, cam); });
  }
  dfs(0, p.entrada, ['0,' + p.entrada], 0, []);
  return out;
}
function cavarCamino(w, cam, modo, entrada) {
  const d = w.document;
  let prev = null;
  cam.forEach(([f, c]) => {
    if (modo === 'teclado') {
      const key = !prev ? 'ArrowDown' : f > prev[0] ? 'ArrowDown' : c < prev[1] ? 'ArrowLeft' : 'ArrowRight';
      tecla(w, key);
    } else {
      const b = d.querySelector('.ex-bloque[data-f="' + f + '"][data-c="' + c + '"]');
      (modo === 'tactil' ? toque : clic)(w, b);
    }
    prev = [f, c];
  });
}

async function probarExcavar() {
  section('E. Excavar: cada puzzle de los tres juegos');
  for (let j = 0; j < 3; j++) {
    const dom = abrir('proto-excavar.html'), w = dom.window, d = w.document;
    const set = w.PROTO.excavar[j];
    for (let k = 0; k < j; k++) { /* el juego j se alcanza con PLAY AGAIN */ }
    clic(w, d.getElementById('play'));
    // Para llegar al juego j, se juegan los anteriores enteros.
    for (let jj = 0; jj <= j; jj++) {
      const lista = w.PROTO.excavar[jj];
      for (let i = 0; i < lista.length; i++) {
        const p = lista[i], modo = MODOS[(i + jj) % 3];
        const S = () => w.__protoExcavar.estado();
        if (jj === j) {
          // Un camino con otra suma: la puerta no abre y se ve la diferencia.
          const otro = caminos(p).find(t => t.suma !== p.candado);
          if (otro) {
            cavarCamino(w, otro.cam, modo, p.entrada);
            if (modo === 'teclado') tecla(w, 'Enter'); else clic(w, d.querySelector('.ex-puerta'));
            check('E' + (j + 1) + '.' + (i + 1) + ' (' + modo + '): otra suma no abre la puerta', !S().abierta);
            check('E' + (j + 1) + '.' + (i + 1) + ': el candado muestra la diferencia', d.querySelector('.ex-dif').textContent === (p.candado - otro.suma > 0 ? '+' + (p.candado - otro.suma) : num(p.candado - otro.suma)),
                  d.querySelector('.ex-dif').textContent);
            // Deshacer vuelve atras, uno por uno.
            const antes = S().suma, ultimo = otro.cam[otro.cam.length - 1];
            if (modo === 'teclado') tecla(w, 'z'); else clic(w, d.getElementById('deshacer'));
            check('E' + (j + 1) + '.' + (i + 1) + ': deshacer resta el ultimo bloque', S().suma === antes - p.bloques[ultimo[0]][ultimo[1]]);
            clic(w, d.getElementById('reiniciar'));
            check('E' + (j + 1) + '.' + (i + 1) + ': reiniciar deja el pico en 0', S().suma === 0 && S().camino.length === 0);
          }
        }
        cavarCamino(w, p.solucion, modo, p.entrada);
        await esperar(15);
        const suma = S().suma;
        if (Math.abs(suma) <= 30) check('E' + (jj + 1) + '.' + (i + 1) + ': las fichas del contador son ' + Math.abs(suma), d.querySelectorAll('.ex-ficha').length === Math.abs(suma),
                                        d.querySelectorAll('.ex-ficha').length + '');
        check('E' + (jj + 1) + '.' + (i + 1) + ': la solucion llega a la puerta con el candado', suma === p.candado && d.querySelector('.ex-puerta').disabled === false, suma + ' vs ' + p.candado);
        if (modo === 'teclado') tecla(w, 'Enter'); else clic(w, d.querySelector('.ex-puerta'));
        check('E' + (jj + 1) + '.' + (i + 1) + ' (' + modo + '): la puerta abre', S().abierta);
        await esperar(30);
      }
      if (jj < j) { clic(w, d.getElementById('otra')); }
    }
    check('E juego ' + (j + 1) + ': termina en la pantalla final con 4 gemas', !!d.querySelector('.proto-final') && d.querySelectorAll('.proto-final__gemas svg').length === 4);
    check('E juego ' + (j + 1) + ': sin errores de JavaScript', dom.errores.length === 0, dom.errores.join(' | '));
    w.close();
  }
}

/* ---------- A. Cartas ---------- */
async function probarCartas() {
  section('A. Cartas de salto: cada puzzle de los tres juegos');
  for (let j = 0; j < 3; j++) {
    const dom = abrir('proto-cartas.html'), w = dom.window, d = w.document;
    clic(w, d.getElementById('play'));
    for (let jj = 0; jj <= j; jj++) {
      const lista = w.PROTO.cartas[jj];
      for (let i = 0; i < lista.length; i++) {
        const p = lista[i], modo = MODOS[(i + jj) % 3], S = () => w.__protoCartas.estado();
        const jugar = k => (modo === 'teclado' ? tecla(w, String(k + 1)) : (modo === 'tactil' ? toque : clic)(w, d.querySelector('.ca-carta[data-i="' + k + '"]')));
        if (jj === j) {
          // Una carta que cae en roca o fuera del pozo rebota y vuelve a la mano.
          const mala = p.cartas.findIndex(c => { const x = p.salida + c; return x < -30 || x > 10 || p.rocas.some(r => x >= r[0] && x <= r[1]); });
          if (mala >= 0) {
            jugar(mala); await esperar(10);
            check('A' + (j + 1) + '.' + (i + 1) + ': la carta que cae en roca rebota', S().pos === p.salida && !S().usadas[mala]);
          }
          // Una jugada que no cae en veta: no recoge nada; deshacer la devuelve.
          const k0 = p.cartas.findIndex((c, k) => { const x = p.salida + c; return k !== mala && x >= -30 && x <= 10 && !p.rocas.some(r => x >= r[0] && x <= r[1]) && p.vetas.indexOf(x) < 0; });
          if (k0 >= 0) {
            jugar(k0); await esperar(10);
            check('A' + (j + 1) + '.' + (i + 1) + ': una jugada fuera de veta no recoge nada', S().recogidas.every(r => !r) && S().pos === p.salida + p.cartas[k0]);
            if (modo === 'teclado') tecla(w, 'z'); else clic(w, d.getElementById('deshacer'));
            await esperar(10);
            check('A' + (j + 1) + '.' + (i + 1) + ': deshacer devuelve la carta y el montacargas', S().pos === p.salida && !S().usadas[k0]);
          }
        }
        for (const k of p.solucion) jugar(k);            // sin esperar: al ganar, el juego pasa al siguiente puzzle
        check('A' + (jj + 1) + '.' + (i + 1) + ' (' + modo + '): la solucion recoge todas las vetas', S().recogidas.every(Boolean) && S().ganado,
              JSON.stringify(S().recogidas));
        await esperar(30);
      }
      if (jj < j) clic(w, d.getElementById('otra'));
    }
    check('A juego ' + (j + 1) + ': termina en la pantalla final con 4 gemas', !!d.querySelector('.proto-final') && d.querySelectorAll('.proto-final__gemas svg').length === 4);
    check('A juego ' + (j + 1) + ': sin errores de JavaScript', dom.errores.length === 0, dom.errores.join(' | '));
    w.close();
  }
}

/* ---------- Globo minero ---------- */
function mascaraPara(rack, objetivo) {             // subconjunto de la cesta que suma lo mas cerca de `objetivo`
  let mejor = 0, dmin = Infinity;
  for (let m = 0; m < 1 << rack.length; m++) {
    let s = 0; for (let i = 0; i < rack.length; i++) if (m >> i & 1) s += rack[i];
    const d = Math.abs(s - objetivo) + (s === objetivo ? 0 : 0.5);
    if (d < dmin) { dmin = d; mejor = m; }
  }
  return mejor;
}
/* Piloto automatico: vuela la caverna con la fisica real (paso de 1/60 s),
   recoge cada gema y atraca en 0. Demuestra que la caverna se puede terminar. */
function pilotar(w) {
  const G = w.__protoGlobo;
  for (let t = 0; t < 60 * 300; t++) {
    const S = G.estado();
    if (!S || S.atracado) return { ok: true, segundos: t / 60 };
    const rack = S.c.rack, sumaRack = rack.reduce((a, v, i) => a + (S.activo[i] ? v : 0), 0), base = G.carga() - sumaRack;
    const pend = S.gemas.find(g => !g.aBordo), mu = S.c.muelle;
    const sacos = rack.some((v, i) => v > 0 && S.activo[i]);
    const obj = pend ? { x: pend.x, y: pend.y + 50 } : { x: mu.x, y: mu.y - (sacos ? 20 : 4) };
    if (t % 6 === 0) {
      const dy = obj.y - S.y, cerca = Math.abs(obj.x - S.x) < 60;
      let quiero = Math.max(-4, Math.min(4, Math.round(dy / 18)));
      if (!pend && cerca && Math.abs(dy) < 6) quiero = 0;
      const m = mascaraPara(rack, quiero - base);
      rack.forEach((v, i) => { if (!!(m >> i & 1) !== !!S.activo[i]) G.alternar(i); });
      const dx = obj.x - S.x;
      S.empuje = Math.abs(dx) < 6 ? (Math.abs(S.vx) > 5 ? -Math.sign(S.vx) : 0) : (Math.abs(dx) < 50 && Math.sign(S.vx) === Math.sign(dx) && Math.abs(S.vx) > 25 ? -Math.sign(dx) : Math.sign(dx));
    }
    G.paso(1 / 60);
  }
  return { ok: false };
}
async function probarGlobo() {
  section('Globo minero: carga con signo, fisica, muelle en 0 y las tres cavernas completas');
  const dom = abrir('proto-globo.html'), w = dom.window, d = w.document, G = () => w.__protoGlobo;
  clic(w, d.getElementById('play'));
  await esperar(5);
  let S = G().estado();
  check('Globo: la salida flota en 0', G().carga() === 0);
  const i0 = S.c.rack.findIndex(v => v < 0);
  const antes = G().carga();
  clic(w, d.querySelector('.gl-item[data-i="' + i0 + '"]'));
  check('Globo: activar un globo resta su valor a la carga', G().carga() === antes + (S.activo[i0] ? S.c.rack[i0] : -S.c.rack[i0]));
  tecla(w, String(i0 + 1));
  check('Globo: la tecla del globo lo vuelve a quitar (teclado)', G().carga() === antes);
  check('Globo: la suma se ve en pantalla', /=/.test(d.querySelector('.gl-suma').textContent));
  // Fisica: + baja, - sube, 0 flota.
  const soloEsto = objetivo => { const m = mascaraPara(S.c.rack, objetivo); S.c.rack.forEach((v, i) => { if (!!(m >> i & 1) !== !!S.activo[i]) G().alternar(i); }); };
  S.x = S.c.salida.x; S.y = 190; S.vy = 0; S.vx = 0; S.empuje = 0;
  soloEsto(2); let y0 = S.y; for (let k = 0; k < 40; k++) G().paso(1 / 60);
  check('Globo: con carga +2 la capsula baja', S.y > y0 + 5, (S.y - y0).toFixed(1));
  soloEsto(-2); y0 = S.y; for (let k = 0; k < 60; k++) G().paso(1 / 60);
  check('Globo: con carga -2 la capsula sube', S.y < y0 - 5, (S.y - y0).toFixed(1));
  soloEsto(0); for (let k = 0; k < 120; k++) G().paso(1 / 60);
  check('Globo: con carga 0 queda flotando', Math.abs(S.vy) < 1, S.vy.toFixed(2));
  // Muelle: con todas las gemas pero la carga en +2, no atraca.
  S.gemas.forEach(g => { g.aBordo = true; });
  const tot = S.gemas.reduce((a, g) => a + g.valor, 0);
  soloEsto(2 - tot); S.x = S.c.muelle.x; S.y = S.c.muelle.y - 4; S.vy = 0;
  for (let k = 0; k < 90; k++) G().paso(1 / 60);
  check('Globo: en el muelle con carga distinta de 0 no atraca', !S.atracado && G().carga() !== 0, 'carga ' + G().carga());
  S.gemas.forEach(g => { g.aBordo = false; });
  S.x = S.c.salida.x; S.y = S.c.salida.y; S.vx = S.vy = 0; soloEsto(0);
  // Las tres cavernas, con el piloto automatico.
  for (let c = 0; c < 3; c++) {
    const r = pilotar(w);
    check('Globo: la caverna ' + (c + 1) + ' se completa (gemas y muelle en 0)', r.ok, JSON.stringify(G().estado() && { x: G().estado().x, y: G().estado().y, carga: G().carga() }));
    if (r.ok) console.log('  ok   caverna ' + (c + 1) + ' completada por el piloto en ' + r.segundos.toFixed(0) + ' s de juego');
    await esperar(30);
  }
  check('Globo: termina en la pantalla final con 3 gemas', !!d.querySelector('.proto-final') && d.querySelectorAll('.proto-final__gemas svg').length === 3);
  check('Globo: sin errores de JavaScript', dom.errores.length === 0, dom.errores.join(' | '));
  w.close();
}

(async () => {
  await probarExcavar();
  await probarCartas();
  await probarGlobo();
  console.log('\n--------------------------------------------------------');
  if (failures.length) {
    console.log('FALLAN ' + failures.length + ' de ' + (passed + failures.length) + ':');
    failures.slice(0, 30).forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('TODO OK — ' + passed + ' comprobaciones.');
  process.exit(0);
})();
