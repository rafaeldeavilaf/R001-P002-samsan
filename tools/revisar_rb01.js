#!/usr/bin/env node
/* ============================================================
   REVISION DE CIERRE — RB01 (solo local, fuera de Actions)
   Lo que tools/verify_rb01.js no puede comprobar en Actions:
   - H03.1: las páginas publicadas antes de RB01 siguen idénticas.
     Huellas sha256 tomadas del commit de inicio de la rebanada (9fe2df2).
     Vale solo mientras dure RB01: en RB02 esas páginas pueden cambiar
     con razón, por eso este archivo no se llama verify_*.js.
   - H03.4 y H04.3: privado/rb01-resultados.md (ignorado por git) tiene
     los resultados de los dos teléfonos y la elección del mayor.

   USO:  python3 tools/build.py && node tools/revisar_rb01.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.dirname(__dirname);

let ok = 0; const fallas = [];
function check(n, c, d) { if (c) { ok++; console.log('  ok   ' + n); } else { fallas.push(n); console.log('  FAIL ' + n + (d ? ' -> ' + d : '')); } }

const HUELLAS = {
  'index.html': '568671dc1eeaf621e19c0085023b760aa535d1cb0f068a21802c280e7ade1729',
  'legal.html': '9c3d9a304ab60f115647e2ab30294e2142b8c33c6e52add954a345385c2f5e4a',
  'guia-y2-english.html': 'ab65579cd59f012ff8e0e24b290e1ca9f52e7c9a1e0361b8372e04bc6baa17e9',
  'guia-y2-english-v2.html': 'c0602318abf8464e8b29587af40f715a66f8e44106683ccb62745478bb6af92e',
  'guia-y2-english-v3.html': '42141f890340aa4666145deef46640f8c9f6aaca2a13b18a2a52e6ed02ef7dfe',
  'guia-y6-english.html': '1d404db27c67cae0bb04ee0edc8441bbdac3f40a5a94c94a2df6e714889f1b6b',
  'guia-y6-english-v2.html': '97b5c38bae57515416452967f42229f44ec288644e909cae360c2d9714746272',
  'maths-y2-repaso-juegos.html': '19d529c80ba4d492b72ab182889bfe69ff50fcbf45ef2f738628c46e49de6c08'
};

console.log('H03.1 · páginas publicadas de antes');
Object.keys(HUELLAS).forEach(f => {
  const ruta = path.join(ROOT, f);
  const h = fs.existsSync(ruta) ? crypto.createHash('sha256').update(fs.readFileSync(ruta)).digest('hex') : 'no existe';
  check(f + ' sin cambios', h === HUELLAS[f], h.slice(0, 12));
});
const raiz = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
const nuevas = raiz.filter(f => !HUELLAS[f]);
check('la única página nueva de la raíz es maths-estilos-rendimiento.html', nuevas.join(',') === 'maths-estilos-rendimiento.html', nuevas.join(', '));

console.log('H03.4 y H04.3 · resultados anotados');
const res = path.join(ROOT, 'privado', 'rb01-resultados.md');
if (!fs.existsSync(res)) {
  check('privado/rb01-resultados.md existe', false, 'falta: llénalo con lo que dicte Rafael');
} else {
  const t = fs.readFileSync(res, 'utf8');
  const valor = etiqueta => { const m = t.match(new RegExp('^-\\s*' + etiqueta + ':[ \\t]*(.*)$', 'mi')); return m ? m[1].trim() : ''; };
  const lleno = v => v && !/_{3,}|pendiente/i.test(v);
  ['Jugador menor · teléfono', 'Jugador menor · Canvas', 'Jugador menor · CSS 3D',
    'Jugador mayor · teléfono', 'Jugador mayor · Canvas', 'Jugador mayor · CSS 3D'].forEach(e => check('H03.4 ' + e, lleno(valor(e)), valor(e) || 'vacío'));
  check('H04.3 elección del jugador mayor', lleno(valor('Elección del jugador mayor')), valor('Elección del jugador mayor') || 'vacío');
  check('H04.3 comentario del jugador mayor', lleno(valor('Comentario del jugador mayor')), valor('Comentario del jugador mayor') || 'vacío');
  check('privado/ está ignorado por git', /^privado\/\s*$/m.test(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8')));
}

console.log(fallas.length ? '\nFALTAN ' + fallas.length + ' (ok ' + ok + ').' : '\nTODO OK — RB01 lista para cerrar (' + ok + ').');
process.exit(fallas.length ? 1 : 0);
