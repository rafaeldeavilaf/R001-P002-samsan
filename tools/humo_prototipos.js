#!/usr/bin/env node
/* ============================================================
   HUMO — bocetos de prototipos/ (solo local)
   Abre en jsdom cada pagina que tools/build.py dejo en
   _local/prototipos.json, pulsa PLAY y falla si hay errores de JS.
   Es la unica prueba de un boceto: la diversion la juzga Rafael
   jugando, no una suite (docs/decisiones-vigentes.md).

   USO:  python3 tools/build.py && node tools/humo_prototipos.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.dirname(__dirname);

const lista = process.env.HUMO_LISTA || path.join(ROOT, '_local', 'prototipos.json');   // HUMO_LISTA: control negativo
if (!fs.existsSync(lista)) { console.error('Falta ' + lista + '. Corre antes: python3 tools/build.py'); process.exit(1); }
const paginas = JSON.parse(fs.readFileSync(lista, 'utf8'));

async function probar(rel) {
  const errores = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented|getContext/i.test(m)) errores.push(m); });
  const dom = new JSDOM(fs.readFileSync(path.resolve(ROOT, rel), 'utf8'), {
    url: 'https://example.test/' + path.basename(rel), runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    }
  });
  const w = dom.window;
  await new Promise(r => setTimeout(r, 200));
  const play = w.document.querySelector('#play');
  if (!play) errores.push('no hay boton PLAY (#play)');
  else { play.click(); await new Promise(r => setTimeout(r, 200)); }
  w.close();
  return errores;
}

(async () => {
  let fallos = 0;
  for (const rel of paginas) {
    const errores = await probar(rel);
    console.log((errores.length ? '  FAIL ' : '  ok   ') + rel + (errores.length ? ' -> ' + errores.join(' | ') : ''));
    fallos += errores.length ? 1 : 0;
  }
  console.log(fallos ? '\nFALLAN ' + fallos + ' de ' + paginas.length + ' bocetos.' : '\nTODO OK — ' + paginas.length + ' bocetos.');
  process.exit(fallos ? 1 : 0);
})();
