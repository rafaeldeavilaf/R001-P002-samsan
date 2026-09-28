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

(async () => {
  await probarExcavar();
  await probarCartas();
  console.log('\n--------------------------------------------------------');
  if (failures.length) {
    console.log('FALLAN ' + failures.length + ' de ' + (passed + failures.length) + ':');
    failures.slice(0, 30).forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('TODO OK — ' + passed + ' comprobaciones.');
  process.exit(0);
})();
