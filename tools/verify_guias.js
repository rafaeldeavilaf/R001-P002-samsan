#!/usr/bin/env node
/* ============================================================
   VERIFICACION — GUIAS DE ESTUDIO (guias/<nombre>.js -> guia-<nombre>.html)

   1) Datos: cada actividad se puede resolver (cajas que existen, respuestas
      que estan entre las fichas, frases con objetivo, pares sin repetidos).
   2) Partida: abre cada actividad del .html ya construido en jsdom, hace una
      jugada equivocada (no debe avanzar) y la termina solo con el boton de
      ayuda (peldaño 3 = una jugada). Debe aparecer la capa de logro y quedar
      la estrella guardada.
   3) Ninguna actividad usa opcion multiple ni muestra puntaje.

   USO:  python3 tools/build.py && node tools/verify_guias.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.dirname(__dirname);
const DIR = path.join(ROOT, 'guias');

let ok = 0; const fallas = [];
function check(n, c, d) { if (c) ok++; else { fallas.push(n + (d ? ' -> ' + d : '')); console.log('  FAIL ' + n + (d ? ' -> ' + d : '')); } }
const espera = ms => new Promise(r => setTimeout(r, ms));
const TIPOS = ['clasificar', 'ordenar', 'emparejar', 'tocar', 'completar'];
const txt = x => (typeof x === 'string' ? x : x.t);

function leerConfig(nombre) {
  let cfg = null;
  const ctx = { GUIA: { iniciar: c => { cfg = c; } } };
  new Function('GUIA', fs.readFileSync(path.join(DIR, nombre + '.js'), 'utf8'))(ctx.GUIA);
  return cfg;
}

function validarDatos(nombre, cfg) {
  check(nombre + ': id y lang', cfg.id === nombre && /^(en|es)-/.test(cfg.lang), cfg.id + ' ' + cfg.lang);
  const ids = new Set();
  cfg.misiones.forEach(m => {
    const k = nombre + '/' + m.id;
    check(k + ': id unico', !ids.has(m.id)); ids.add(m.id);
    check(k + ': tiene Aprende', Array.isArray(m.aprende) && m.aprende.length > 0);
    check(k + ': color y claro', /^#[0-9A-F]{6}$/i.test(m.color) && /^#[0-9A-F]{6}$/i.test(m.claro));
    m.actividades.forEach((a0, i) => (a0.variantes ? a0.variantes.map(v => Object.assign({}, a0, v)) : [a0]).forEach((a, vi) => {
      const q = k + '-' + (i + 1) + (a0.variantes ? '/v' + (vi + 1) : '') + ' (' + a.tipo + ')';
      check(q + ': tipo conocido', TIPOS.includes(a.tipo), a.tipo);
      check(q + ': orden y pista', !!a.orden && !!a.pista);
      if (a.tipo === 'clasificar') {
        const cajas = new Set(a.cajas.map(c => c.id));
        check(q + ': cada ficha va a una caja que existe', a.items.every(x => cajas.has(x.caja)));
        check(q + ': cada caja recibe algo', a.cajas.every(c => a.items.some(x => x.caja === c.id)));
        check(q + ': fichas sin repetir', new Set(a.items.map(txt)).size === a.items.length);
        if (a.muestra) { const por = Math.floor(a.muestra / a.cajas.length); check(q + ': banco alcanza para la muestra (' + por + ' por caja)', a.cajas.every(c => a.items.filter(x => x.caja === c.id).length >= por)); }
      }
      const banco = a.tipo === 'emparejar' ? a.pares : a.tipo === 'tocar' ? a.frases : a.items;
      if (a.muestra) check(q + ': muestra menor o igual al banco', a.muestra <= banco.length, a.muestra + ' / ' + banco.length);
      if (a.tipo === 'ordenar') check(q + ': al menos 3 pasos distintos', a.items.length >= 3 && new Set(a.items.map(txt)).size === a.items.length);
      if (a.tipo === 'emparejar') {
        check(q + ': izquierdas distintas', new Set(a.pares.map(p => txt(p[0]))).size === a.pares.length);
        check(q + ': derechas distintas', new Set(a.pares.map(p => txt(p[1]))).size === a.pares.length);
      }
      if (a.tipo === 'tocar') a.frases.forEach(f => check(q + ': objetivo en "' + f + '"', /\*[^*]+\*/.test(f) && (f.match(/\*/g).length % 2 === 0)));
      if (a.tipo === 'completar') a.items.forEach(it => {
        const resp = (it.frase.match(/\[([^\]]+)\]/g) || []).map(s => s.slice(1, -1));
        const bolsa = it.fichas.map(txt);
        const usar = bolsa.slice();
        const cabe = resp.length > 0 && resp.every(r => { const j = usar.findIndex(u => r.split('|').includes(u)); if (j < 0) return false; usar.splice(j, 1); return true; });
        check(q + ': respuestas entre las fichas en "' + it.frase + '"', cabe, resp.join(',') + ' / ' + bolsa.join(','));
        check(q + ': hay al menos una ficha que sobra (no se regala)', bolsa.length > resp.length || resp.length >= 4);
      });
    }));
  });
}

async function abrir(file, hash) {
  const errores = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented/i.test(m)) errores.push(m); });
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: 'https://example.test/' + path.basename(file) + (hash ? '#' + hash : ''),
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc
  });
  await espera(30);
  return { dom, w: dom.window, d: dom.window.document, errores };
}

async function jugar(nombre, cfg) {
  const file = path.join(ROOT, 'guia-' + nombre + '.html');
  check(nombre + ': existe ' + path.basename(file), fs.existsSync(file));
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, 'utf8');
  check(nombre + ': sin pedir nada a terceros', !/(src|href)\s*=\s*["']https?:/i.test(html) && !/url\(\s*['"]?https?:/i.test(html));

  /* portada */
  const p = await abrir(file);
  check(nombre + ': portada con #play', !!p.d.querySelector('#play'));
  check(nombre + ': una tarjeta por mision', p.d.querySelectorAll('.g-mision').length === cfg.misiones.length + (cfg.jefe ? 1 : 0));
  check(nombre + ': portada sin errores', p.errores.length === 0, p.errores.join(' | '));
  p.d.querySelector('#play').click(); await espera(10);
  check(nombre + ': START abre Aprende de la primera mision', !!p.d.querySelector('.g-tarjeta') && !!p.d.querySelector('.g-mision-pant'));
  p.w.close();

  /* el Boss round se arma al cargar: una actividad al azar de cada mision */
  const lista = cfg.misiones.slice();
  if (cfg.jefe) {
    const n = Math.min(cfg.misiones.length, cfg.jefe.max || 6);
    const p2 = await abrir(file);
    check(nombre + ': portada muestra el Boss round', p2.d.querySelectorAll('.g-mision').length === cfg.misiones.length + 1);
    p2.w.close();
    lista.push({ id: 'boss', jefe: true, actividades: Array.from({ length: n }, () => null) });
  }
  for (const m of lista) {
    for (let i = 0; i < m.actividades.length; i++) {
      const a = m.actividades[i], q = nombre + '/' + m.id + '-' + (i + 1);
      const s = await abrir(file, m.id + '-' + (i + 1));
      const { d, w } = s;
      check(q + ': abre la actividad', !!d.querySelector('.g-orden'), d.body.textContent.slice(0, 80));
      check(q + ': sin opcion multiple ni puntaje', !d.querySelector('input[type=radio]') && !/\bscore\s*:|puntaje|\d+\s*%/i.test(d.querySelector('.g-zona').textContent));
      /* una jugada equivocada no avanza */
      if (d.querySelector('.g-caja')) {
        const f = d.querySelector('.g-pool .g-ficha'); f.click();
        const malCaja = [...d.querySelectorAll('.g-caja')].find(c => c.getAttribute('data-destino') !== f._x.caja);
        malCaja.click();
        check(q + ': caja equivocada no recibe la ficha', f.isConnected && malCaja.querySelectorAll('.g-chip').length === 0);
      }
      if (d.querySelector('.g-frase')) {
        const mala = [...d.querySelectorAll('.g-palabra')].find(b => !b._g);
        if (mala) { mala.click(); check(q + ': palabra que no es objetivo no se marca', !mala.classList.contains('ok')); }
      }
      if (d.querySelector('.g-blanco')) {
        const resp = d.querySelector('.g-blanco')._r;
        const mala = [...d.querySelectorAll('.g-pool .g-ficha')].find(f => !resp.includes(f.textContent.trim()));
        if (mala) { mala.click(); check(q + ': ficha equivocada no llena el espacio', d.querySelector('.g-blanco').textContent === ''); }
      }
      /* terminar solo con la ayuda */
      const ayuda = [...d.querySelectorAll('.g-ayuda-fila .g-btn')][0];
      let n = 0;
      while (!d.querySelector('.g-capa') && n < 600) { ayuda.click(); n++; if (n % 3 === 0) await espera(5); }
      for (let k = 0; k < 40 && !d.querySelector('.g-capa'); k++) { ayuda.click(); await espera(400); }
      check(q + ': se termina con la ayuda', !!d.querySelector('.g-capa'), 'clics ' + n);
      let guardado = {};
      try { guardado = JSON.parse(w.localStorage.getItem('samsan:guia-' + cfg.id) || '{}'); } catch (e) { /* nada */ }
      check(q + ': queda la estrella', guardado[m.id + '-' + (i + 1)] === 1);
      const otra = [...d.querySelectorAll('.g-capa .g-btn')][1];
      check(q + ': la capa ofrece otra ronda', !!otra);
      const sig = d.querySelector('.g-capa .g-btn');
      if (sig) { sig.click(); await espera(10); check(q + ': el boton de la capa navega', !d.querySelector('.g-capa')); }
      check(q + ': sin errores de JS', s.errores.length === 0, s.errores.join(' | '));
      w.close();
    }
  }
}

(async () => {
  if (!fs.existsSync(DIR)) { console.log('OMITIDO: no hay guias/'); return; }
  const nombres = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
  for (const n of nombres) {
    console.log('\n== guia ' + n);
    const cfg = leerConfig(n);
    validarDatos(n, cfg);
    await jugar(n, cfg);
  }
  console.log(fallas.length ? '\nFALLAN ' + fallas.length + ' (ok ' + ok + ')' : '\nTODO OK — ' + ok + ' comprobaciones en ' + nombres.length + ' guias.');
  process.exit(fallas.length ? 1 : 0);
})();
