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

/* ---------- modo juego (v2): mundos, etapas, jefe, gemas y trajes ---------- */
function validarJuego(nombre, cfg) {
  check(nombre + ': id y lang', cfg.id === nombre && /^(en|es)-/.test(cfg.lang), cfg.id + ' ' + cfg.lang);
  const ids = new Set();
  cfg.mundos.forEach(m => {
    const k = nombre + '/' + m.id;
    check(k + ': id unico', !ids.has(m.id)); ids.add(m.id);
    check(k + ': consejo y pista', !!m.consejo && !!m.pista);
    check(k + ': al menos 2 zonas', m.zonas.length >= 2);
    const zs = new Set(m.zonas.map(z => z.id));
    check(k + ': cada palabra va a una zona que existe', m.palabras.every(p => zs.has(p.zona)), m.palabras.filter(p => !zs.has(p.zona)).map(p => p.t).join(','));
    check(k + ': cada zona tiene al menos 3 palabras', m.zonas.every(z => m.palabras.filter(p => p.zona === z.id).length >= 3), m.zonas.map(z => z.id + ':' + m.palabras.filter(p => p.zona === z.id).length).join(' '));
    check(k + ': cada zona trae su ejemplo', m.zonas.every(z => !!z.ej));
    check(k + ': palabras sin repetir', new Set(m.palabras.map(p => p.t.toLowerCase())).size === m.palabras.length);
    check(k + ': color y claro', /^#[0-9A-F]{6}$/i.test(m.color) && /^#[0-9A-F]{6}$/i.test(m.claro));
  });
  const max = cfg.mundos.length * 3 + (cfg.jefe ? 3 : 0), ps = cfg.pieles || [];
  check(nombre + ': trajes en orden y alcanzables', ps.length > 0 && ps[0].gemas === 0 && ps.every((p, i) => i === 0 || p.gemas > ps[i - 1].gemas) && ps[ps.length - 1].gemas <= max, ps.map(p => p.gemas).join(',') + ' / max ' + max);
}

async function jugarJuego(nombre, cfg) {
  const file = path.join(ROOT, 'guia-' + nombre + '.html');
  check(nombre + ': existe ' + path.basename(file), fs.existsSync(file));
  const html = fs.readFileSync(file, 'utf8');
  check(nombre + ': sin pedir nada a terceros', !/(src|href)\s*=\s*["']https?:/i.test(html) && !/url\(\s*['"]?https?:/i.test(html));
  const p = await abrir(file);
  check(nombre + ': portada con #play, mapa y trajes', !!p.d.querySelector('#play') && p.d.querySelectorAll('.g-mundo').length === cfg.mundos.length + (cfg.jefe ? 1 : 0) && p.d.querySelectorAll('.g-traje').length === (cfg.pieles || []).length);
  check(nombre + ': trajes bloqueados al empezar', [...p.d.querySelectorAll('.g-traje')].slice(1).every(b => b.disabled));
  check(nombre + ': portada sin errores', p.errores.length === 0, p.errores.join(' | '));
  p.w.close();
  let guardado = {};
  const rutas = [];
  cfg.mundos.forEach(m => { for (let e = 1; e <= 3; e++) rutas.push(m.id + '-' + e); });
  if (cfg.jefe) rutas.push('jefe');
  /* una sola "sesion": el progreso se pasa de pagina en pagina */
  let progreso = null;
  for (const r of rutas) {
    const s = await abrir(file, r);
    if (progreso) { s.w.localStorage.setItem('samsan:juego-' + cfg.id, progreso); }
    const d = s.d;
    if (r !== 'jefe' && r.endsWith('-1')) check(nombre + '/' + r + ': la primera etapa del mundo muestra el consejo', !!d.querySelector('.g-consejo'));
    const capa0 = d.querySelector('.g-consejo'); if (capa0) capa0.closest('.g-capa').querySelector('.g-btn').click();
    check(nombre + '/' + r + ': palabra activa y zonas', !!d.querySelector('.g-ficha--grande') && d.querySelectorAll('.g-zona-u').length >= 2);
    const llenasAntes = d.querySelectorAll('.g-progreso .lleno').length;
    let n = 0;
    while (!d.querySelector('.g-capa') && n < 900) { const b = d.querySelector('.g-ayuda-fila .g-btn'); if (b) b.click(); n++; if (n % 3 === 0) await espera(270); }
    check(nombre + '/' + r + ': se termina con la ayuda', !!d.querySelector('.g-capa'), 'clics ' + n + ' ' + llenasAntes);
    progreso = s.w.localStorage.getItem('samsan:juego-' + cfg.id);
    try { guardado = JSON.parse(progreso || '{}'); } catch (e) { guardado = {}; }
    check(nombre + '/' + r + ': queda la gema', guardado.etapas && guardado.etapas[r] === 1, progreso);
    check(nombre + '/' + r + ': sin errores de JS', s.errores.length === 0, s.errores.join(' | '));
    s.w.close();
  }
  /* el desbloqueo de trajes con gemas se prueba en Chrome real (tools/historias_juegos.py) */
}

/* error controlado en el modo juego: zona equivocada no recibe la palabra */
async function errorJuego(nombre, cfg) {
  const file = path.join(ROOT, 'guia-' + nombre + '.html');
  const s = await abrir(file, cfg.mundos[0].id + '-3');
  const d = s.d;
  const capa0 = d.querySelector('.g-consejo'); if (capa0) capa0.closest('.g-capa').querySelector('.g-btn').click();
  const texto = d.querySelector('.g-ficha--grande').textContent.trim();
  const zona = cfg.mundos[0].palabras.find(p => p.t === texto).zona;
  const mala = [...d.querySelectorAll('.g-zona-u')].find(z => z.getAttribute('data-destino') !== zona);
  mala.click(); mala.click();
  check(nombre + ': zona equivocada no recibe la palabra', mala.querySelectorAll('.g-chip').length === 0 && d.querySelector('.g-ficha--grande').textContent.trim() === texto);
  check(nombre + ': al 2.o error sale la pista y brilla la zona correcta', d.querySelector('.g-pista').textContent === cfg.mundos[0].pista && d.querySelector('.g-zona-u[data-destino="' + zona + '"]').classList.contains('brilla'));
  check(nombre + ': sin puntaje ni porcentajes', !/\d+\s*%|score\s*:/i.test(d.body.textContent));
  s.w.close();
}


/* ---------- modo aldea (Y2 English v3, «La aldea de Pip») ---------- */
function validarAldea(nombre, cfg) {
  const iconos = fs.readFileSync(path.join(DIR, 'comun', 'iconos.js'), 'utf8');
  const ICONOS = JSON.parse(iconos.slice(iconos.indexOf('window.ICONOS = ') + 16, iconos.lastIndexOf(';')));
  check(nombre + ': id y lang', cfg.id === nombre && /^(en|es)-/.test(cfg.lang));
  check(nombre + ': etapas de 5 con 2, 3 y hasta 4 lugares', cfg.porEtapa === 5 && JSON.stringify(cfg.etapas) === '[2,3,4]');
  cfg.mundos.forEach(m => {
    const k = nombre + '/' + m.id, zonas = new Set(m.zonas.map(z => z.id));
    check(k + ': escena del kit', ['calle', 'estanque', 'plaza', 'habitat', 'barrio', 'granja'].includes(m.escena), m.escena);
    check(k + ': cada palabra va a una zona que existe', m.palabras.every(p => zonas.has(p.zona)));
    check(k + ': cada palabra, ejemplo y calcomania tiene dibujo', m.palabras.every(p => ICONOS[p.ico]) && m.zonas.every(z => ICONOS[z.ej]) && m.calcos.every(c => ICONOS[c]),
      [].concat(m.palabras.map(p => p.ico), m.zonas.map(z => z.ej), m.calcos).filter(x => !ICONOS[x]).join(','));
    check(k + ': cada zona alcanza para 3 globos', m.zonas.every(z => m.palabras.filter(p => p.zona === z.id).length >= 3));
    check(k + ': sin palabras repetidas', new Set(m.palabras.map(p => p.p)).size === m.palabras.length);
  });
}
async function abrirAldea(file, hash, vistos) {
  const errores = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented/i.test(m)) errores.push(m); });
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: 'https://example.test/' + path.basename(file) + (hash ? '#' + hash : ''),
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { if (vistos) w.localStorage.setItem('samsan:aldea-y2-english-v3', JSON.stringify({ etapas: {}, vistos })); }
  });
  await espera(40);
  return { dom, w: dom.window, d: dom.window.document, errores };
}
async function jugarAldea(nombre, cfg) {
  const file = path.join(ROOT, 'guia-' + nombre + '.html');
  const vistos = {}; cfg.mundos.forEach(m => { vistos[m.id] = 1; });
  /* error: el globo no entra en el lugar equivocado y al 2.o error brilla el correcto */
  let s = await abrirAldea(file, cfg.mundos[0].id + '-3', vistos);
  let d = s.d, et = s.w.GUIA._aldea_etapa;
  const activo = et.activo(), mala = [...d.querySelectorAll('.al-pantalla .al-lugar')].find(l => l.dataset.lugar !== activo.zona);
  mala.click(); mala.click();
  check(nombre + ': lugar equivocado no recibe el globo', et.activo() === activo && d.querySelector('.al-estrellas').getAttribute('aria-label') === '0 / 5');
  check(nombre + ': al 2.o error brilla el lugar correcto', d.querySelector('.al-pantalla [data-lugar="' + activo.zona + '"]').classList.contains('al-brilla'));
  const visible = d.body.cloneNode(true); visible.querySelectorAll('script, style').forEach(n => n.remove());
  check(nombre + ': sin puntaje ni porcentajes', !/\d+\s*%|score\s*:/i.test(visible.textContent));
  s.w.close();
  /* cada mundo en su etapa mas grande, solo con la bombilla (3 toques = una jugada) */
  for (const m of cfg.mundos) {
    s = await abrirAldea(file, m.id + '-3', vistos); d = s.d; et = s.w.GUIA._aldea_etapa;
    const n = Math.min(4, m.zonas.length);
    check(nombre + '/' + m.id + ': etapa 3 con ' + n + ' lugares', d.querySelectorAll('.al-pantalla .al-lugar').length === n);
    const vistas = [];
    for (let i = 0; i < 5; i++) {
      for (let k = 0; k < 40 && !et.activo(); k++) await espera(100);
      if (!et.activo()) break;
      vistas.push(et.activo().zona);
      const b = d.querySelector('.al-bombilla'); b.click(); b.click(); b.click();
      await espera(2100);
    }
    for (let k = 0; k < 20 && !d.querySelector('.al-fin'); k++) await espera(100);
    check(nombre + '/' + m.id + ': 5 globos, todos los lugares reciben', vistas.length === 5 && new Set(vistas).size === n, vistas.join(','));
    check(nombre + '/' + m.id + ': termina con calcomania', !!d.querySelector('.al-fin .al-calco--nueva'));
    const guardado = JSON.parse(s.w.localStorage.getItem('samsan:aldea-y2-english-v3') || '{}');
    check(nombre + '/' + m.id + ': la etapa queda guardada', !!(guardado.etapas || {})[m.id + '-3']);
    check(nombre + '/' + m.id + ': sin errores de JavaScript', s.errores.length === 0, s.errores.join(' | '));
    s.w.close();
  }
  /* la primera entrada a un mundo abre la demostracion de Pip y despues deja jugar */
  s = await abrirAldea(file, cfg.mundos[0].id + '-1', null); d = s.d; et = s.w.GUIA._aldea_etapa;
  check(nombre + ': primera entrada abre la demostracion', et.enDemo() && !!d.querySelector('.al-demo__tapa'));
  d.querySelector('.al-demo__saltar').click(); await espera(50);
  check(nombre + ': al saltar la demostracion sale el primer globo', !et.enDemo() && !!et.activo());
  s.w.close();
}

/* ---------- modo leccion («Learn with Pip», Y2 English para aprender) ---------- */
function validarLeccion(nombre, cfg) {
  const iconos = fs.readFileSync(path.join(DIR, 'comun', 'iconos.js'), 'utf8');
  const ICONOS = JSON.parse(iconos.slice(iconos.indexOf('window.ICONOS = ') + 16, iconos.lastIndexOf(';')));
  check(nombre + ': id, idioma y idioma de explicacion', cfg.id === nombre && /^(en|es)-/.test(cfg.lang) && /^es-/.test(cfg.langExplica));   /* Y2 Español: lang es-CO */
  check(nombre + ': codigo fijo con color, icono y traduccion', Object.values(cfg.codigo).every(c => /^#[0-9A-F]{6}$/i.test(c.color) && ICONOS[c.ico] && /^¿.+\?$/.test(c.es)));
  cfg.lecciones.forEach(L => {
    if (L.mecanica === 'parejas') { validarParejas(nombre, L, ICONOS); return; }
    if (L.mecanica === 'cuento') { validarCuento(nombre, L, ICONOS, cfg.codigo); return; }
    if (L.mecanica === 'fichas') { validarFichas(nombre, L, ICONOS, cfg.codigo); return; }
    const k = nombre + '/' + L.id, items = [].concat(L.yo, L.juntos, L.tu);
    check(k + ': 2 en yo, 4+ en juntos, 6+ en tu', L.yo.length === 2 && L.juntos.length >= 4 && L.tu.length >= 6);
    check(k + ': cada ejemplo va a una casa de la leccion', items.every(i => L.zonas.includes(i.zona)));
    check(k + ': cada ejemplo, la calcomania y el resumen tienen dibujo', items.every(i => ICONOS[i.ico]) && ICONOS[L.calco] && L.resumen.every(r => r.ej.every(e => ICONOS[e.ico])));
    check(k + ': ningun dibujo se repite', new Set(items.map(i => i.ico)).size === items.length);
    check(k + ': cada casa tiene su por que', L.zonas.every(z => L.por[z]));
    check(k + ': mira tiene dibujos que existen y la leccion su pregunta para pensar', L.mira.every(m => !m.ico || ICONOS[m.ico]) && !!L.piensa);
  });
}
/* mecanica «parejas» (leccion 3, Why y because): pregunta Why -> tarjeta Because */
function validarParejas(nombre, L, ICONOS) {
  const k = nombre + '/' + L.id, rondas = [L.modelos, L.yo].concat(L.juntos, L.tu), pares = [].concat(...rondas);
  check(k + ': 2 modelos, 2 en yo, 1 ronda de 3 en juntos y 2 rondas de 3 en tu', L.modelos.length === 2 && L.yo.length === 2 &&
    L.juntos.length === 1 && L.tu.length === 2 && L.juntos.concat(L.tu).every(r => r.length === 3));
  check(k + ': cada pregunta empieza con Why y cada razon con Because', pares.every(p => /^Why .+\?$/.test(p.en) && /^Because .+\.$/.test(p.razon) && /^¿Por qué /.test(p.es) && /^Porque /.test(p.esRazon)));
  check(k + ': cada tarjeta es su razon', pares.every(p => p.zona === p.icoRazon));
  const dib = [].concat(...pares.map(p => [p.ico, p.icoRazon]));
  check(k + ': dibujos que existen y no se repiten', dib.every(d => ICONOS[d]) && new Set(dib).size === dib.length && new Set(dib.map(d => ICONOS[d])).size === dib.length);
  check(k + ': en cada ronda las razones son distintas', rondas.every(r => new Set(r.map(p => p.razon)).size === r.length));
  check(k + ': ninguna pareja se repite', new Set(pares.map(p => p.id)).size === pares.length);
  check(k + ': resumen de 3 parejas con dibujo y calcomania', L.resumen.length === 3 && L.resumen.every(p => ICONOS[p.ico] && ICONOS[p.icoRazon]) && !!ICONOS[L.calco]);
  check(k + ': mira usa los modelos y la leccion su pregunta para pensar', L.mira.every(m => (!m.ico || ICONOS[m.ico]) && (!m.zona || L.modelos.some(p => p.zona === m.zona))) && !!L.piensa);
}
/* mecanica «cuento» (lecciones 4 y 6): preguntas Wh que se responden tocando el cuento */
function validarCuento(nombre, L, ICONOS, COD) {
  const k = nombre + '/' + L.id, cuentos = Object.values(L.cuentos);
  const qs = [].concat(L.yo, L.juntos, ...L.tu.map(r => r.preguntas.concat(Object.values(r.extra))), L.resumen);
  check(k + ': cada cuento tiene una parte por pregunta, con dibujo que existe', cuentos.every(c => c.partes.length === 5 && new Set(c.partes.map(p => p.zona)).size === 5 && c.partes.every(p => ICONOS[p.ico]) && c.deco.every(d => ICONOS[d.ico])));
  check(k + ': cada trozo que responde sale una vez en el texto', cuentos.every(c => c.partes.every(p => [].concat(...c.frases).filter(t => t[1] === p.zona).length === 1 && [].concat(...c.frases).some(t => t[0] === p.txt && t[1] === p.zona))));
  check(k + ': cada pregunta empieza con su Wh y tiene traduccion', qs.every(q => q.en.split(' ')[0] === COD[q.zona].t && /\?$/.test(q.en) && /^¿.+\?$/.test(q.es)));
  check(k + ': la respuesta de cada pregunta esta en su cuento (dibujo y trozo)', qs.every(q => { const c = L.cuentos[q.cuento]; const p = c && c.partes.find(x => x.zona === q.zona); return p && p.txt === q.resp && p.ico === q.ico && c.frases[q.frase].map(t => t[0]).join('') === q.dice; }));
  check(k + ': con pronombre, Pip lee la frase de la pregunta y dice a quien se refiere', qs.filter(q => q.nota).length >= 1 && qs.filter(q => q.nota).every(q => /^(She|He) /.test(q.dice) && q.dice.indexOf(q.en.split(' ').slice(1).join(' ').replace('?', '')) >= 0 && q.nota.indexOf('«' + q.dice.split(' ')[0] + '»') === 0), qs.filter(q => q.nota).map(q => q.id).join(','));
  check(k + ': ninguna pregunta trae su respuesta', qs.every(q => q.en.toLowerCase().indexOf(q.resp.toLowerCase()) < 0));
  check(k + ': 2+ en yo, 3+ en juntos y tu solo pregunta las cinco en cada cuento', L.yo.length >= 2 && L.juntos.length >= 3 && L.tu.every(r => new Set(r.preguntas.map(q => q.zona)).size === 5 && r.preguntas.every(q => q.cuento === r.cuento)));
  const dib = [].concat(...cuentos.map(c => c.partes.map(p => p.ico)));
  check(k + ': los dibujos de las partes no se repiten en la leccion', new Set(dib.map(d => ICONOS[d])).size === dib.length);
  check(k + ': resumen con dibujo, calcomania y pregunta para pensar', L.resumen.length >= 3 && !!ICONOS[L.calco] && !!L.piensa);
}
/* mecanica «fichas» (leccion 5, hacer la pregunta): la respuesta a la vista y la pregunta en fichas */
function validarFichas(nombre, L, ICONOS, COD) {
  const k = nombre + '/' + L.id, qs = [].concat(L.modelos, L.yo, L.juntos, L.tu), todas = qs.concat(L.resumen);
  check(k + ': 1 o 2 en mira, 2 en yo, 3 en juntos y 5 en tu', L.modelos.length >= 1 && L.modelos.length <= 2 && L.yo.length === 2 && L.juntos.length === 3 && L.tu.length === 5);
  check(k + ': tu solo cubre Who, What, Where, When y Why', L.tu.map(q => q.zona).sort().join() === Object.keys(COD).sort().join());
  check(k + ': 3 o 4 fichas y la primera es la Wh de su zona', todas.every(q => q.fichas.length >= 3 && q.fichas.length <= 4 && q.fichas[0] === COD[q.zona].t));
  check(k + ': las fichas unidas forman la pregunta y solo la ultima lleva ?', todas.every(q => q.fichas.join(' ') === q.en && q.fichas.every((f, i) => f.endsWith('?') === (i === q.fichas.length - 1))));
  check(k + ': fichas sin repetir (una sola forma de ordenarlas)', todas.every(q => new Set(q.fichas.map(f => f.toLowerCase())).size === q.fichas.length));
  check(k + ': respuesta y traducciones', todas.every(q => /\.$/.test(q.resp) && /^¿.+\?$/.test(q.es) && /\.$/.test(q.esResp)));
  check(k + ': dibujos que existen y no se repiten', qs.every(q => ICONOS[q.ico]) && new Set(qs.map(q => ICONOS[q.ico])).size === qs.length && !!ICONOS[L.calco]);
  check(k + ': ninguna pregunta sale dos veces', new Set(qs.map(q => q.id)).size === qs.length);
  check(k + ': resumen de 3 preguntas ya vistas', L.resumen.length === 3 && L.resumen.every(r => qs.some(q => q.id === r.id)) && !!L.piensa);
}
async function jugarLeccion(nombre, cfg) {
  const file = path.join(ROOT, 'guia-' + nombre + '.html');
  for (const L of cfg.lecciones) {
    const errores = [];
    const vc = new VirtualConsole();
    vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented/i.test(m)) errores.push(m); });
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
      url: 'https://example.test/' + path.basename(file) + '#' + L.id,
      runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(w) { w.__SAMSAN_RAPIDO = true; }
    });
    await espera(60);
    const w = dom.window, d = w.document, P = () => w.GUIA._leccion_pantalla;
    const pasos = [], tu = [], PAR = L.mecanica === 'parejas', CUE = L.mecanica === 'cuento', FIC = L.mecanica === 'fichas', juegos = { tu: new Set(), juntos: new Set() }; let fallo = false, fuera = 0, ultimo = null;
    const colores = { juntos: new Set(), tu: new Set() };
    /* «Otra vez» tocado mientras Pip habla, en medio de cada paso: la leccion debe seguir hasta el final */
    const otraEn = new Set();
    const otraVez = () => { const pa = P() && P().paso(); if (pa && pa !== 'aprendi' && !otraEn.has(pa) && P().hablando()) { P().otra(); otraEn.add(pa); } };
    const fic = { brillaJuntos: 0, brillaTuAntes: 0, devuelta: null, explica: '', hueco0: null };
    for (let k = 0; k < 1500 && P() && P().paso() !== 'aprendi'; k++) {
      await espera(40);
      otraVez();
      const paso = P().paso(); if (pasos[pasos.length - 1] !== paso) pasos.push(paso);
      const seg = !d.querySelector('.le-seguir').disabled, a = P().activo();
      if (seg) { P().seguir(); otraVez(); continue; }
      if (FIC) {
        if (!a || P().ocupado()) continue;
        const h = P().puestas().indexOf(null); if (h < 0) continue;
        const guia = d.querySelector('.le-ficha.le-guia');
        if (paso === 'juntos' && guia && guia.getAttribute('aria-label') === a.fichas[h]) fic.brillaJuntos++;
        if (paso === 'tu' && !fallo && guia) fic.brillaTuAntes++;
        if (paso === 'tu' && !fallo) {
          /* error a proposito: una ficha que no va en el siguiente hueco */
          fallo = true; tu.push(a.id);
          const mala = a.fichas.find((f, i) => i !== h && P().fichas().includes(f));
          P().soltar(mala); await espera(5);
          fic.devuelta = P().puestas()[h] === null && P().fichas().includes(mala);
          fic.explica = d.querySelector('.le-dialogo__texto').textContent; fic.hueco0 = h;
          continue;
        }
        P().soltar(a.fichas[h]);
        continue;
      }
      if (!a || d.querySelector('.al-volando') || a === ultimo) continue;
      const razones = PAR || CUE ? P().razones() : L.zonas;
      if (PAR) { juegos[paso] && juegos[paso].add(razones.slice().sort().join('+')); if (!razones.includes(a.zona)) fuera++; }
      if (CUE) { if (P().cuento() !== a.cuento || !razones.includes(a.zona)) fuera++; if (colores[paso]) colores[paso].add(P().color()); if (juegos[paso]) juegos[paso].add(P().cuento()); }
      if (paso === 'tu' && !fallo) { fallo = true; tu.push(CUE ? a.id : a.ico); P().soltar(razones.find(z => z !== a.zona)); await espera(30); continue; }
      ultimo = a; P().soltar(a.zona);
    }
    if (P()) pasos.push(P().paso());
    const salieron = P().salieron.filter(x => /^tu:/.test(x)).map(x => x.slice(3));
    check(nombre + '/' + L.id + ': recorre los 5 pasos en orden', pasos.join(',') === 'mira,yo,juntos,tu,aprendi', pasos.join(','));
    check(nombre + '/' + L.id + ': «Otra vez» en medio de cada paso no deja la leccion parada', ['mira', 'yo', 'juntos', 'tu'].every(x => otraEn.has(x)) && P().paso() === 'aprendi', [...otraEn].join(',') + ' -> ' + P().paso());
    if (FIC) {
      check(nombre + '/' + L.id + ': la ficha mal puesta vuelve a su sitio y Pip re-explica', fic.devuelta === true && /Mira otra vez/.test(fic.explica) && (fic.hueco0 !== 0 || /palabra que pregunta/.test(fic.explica)), fic.explica);
      check(nombre + '/' + L.id + ': la pregunta fallada vuelve al final una vez', salieron.length === L.tu.length + 1 && salieron[salieron.length - 1] === tu[0], salieron.join(',') + ' fallo ' + tu[0]);
      check(nombre + '/' + L.id + ': en juntos brilla la ficha siguiente y en tu solo no', fic.brillaJuntos >= L.juntos.reduce((t, q) => t + q.fichas.length, 0) && fic.brillaTuAntes === 0, fic.brillaJuntos + ' / ' + fic.brillaTuAntes);
      check(nombre + '/' + L.id + ': el resumen trae 3 preguntas con su respuesta que suenan', d.querySelectorAll('.le-resumen .le-par--fichas').length === L.resumen.length);
    } else if (CUE) {
      /* el fallado vuelve al final de su cuento y lo que le costo vuelve en el cuento siguiente */
      const n1 = L.tu[0].preguntas.length, zona = id => id.split(':')[1];
      check(nombre + '/' + L.id + ': la pregunta fallada vuelve al final de su cuento', salieron[n1] === tu[0] && salieron.slice(0, n1).includes(tu[0]), salieron.join(',') + ' fallo ' + tu[0]);
      if (L.tu.length > 1) {
        const r2 = salieron.slice(n1 + 1, n1 + 1 + 6);
        check(nombre + '/' + L.id + ': lo que le costo vuelve en el cuento siguiente', salieron.length === L.tu.reduce((t, r) => t + r.preguntas.length, 0) + 2 && r2.filter(x => zona(x) === zona(tu[0])).length === 2 && r2[5] && zona(r2[5]) === zona(tu[0]), salieron.join(','));
      } else check(nombre + '/' + L.id + ': tu solo pregunta las cinco y la fallada una vez mas', salieron.length === n1 + 1);
      check(nombre + '/' + L.id + ': cada pregunta se responde en el cuento a la vista', fuera === 0 && juegos.tu.size === L.tu.length, 'fuera ' + fuera);
      check(nombre + '/' + L.id + ': con colores en juntos y sin colores en tu solo', [...colores.juntos].join() === 'true' && [...colores.tu].join() === 'false', [...colores.juntos] + ' / ' + [...colores.tu]);
      check(nombre + '/' + L.id + ': el resumen trae las preguntas con su respuesta que suenan', d.querySelectorAll('.le-resumen .le-par--cuento').length === L.resumen.length);
    } else if (PAR) {
      /* el fallado vuelve al final de SU ronda (la primera de tu solo), no al final de todo */
      const n1 = L.tu[0].length, total = L.tu.reduce((t, r) => t + r.length, 0);
      check(nombre + '/' + L.id + ': el fallado vuelve al final de su ronda', salieron.length === total + 1 && salieron[n1] === tu[0] && salieron.slice(0, n1).includes(tu[0]), salieron.join(',') + ' fallo ' + tu[0]);
      check(nombre + '/' + L.id + ': cada pregunta tiene su razon en la ronda y llegan tarjetas nuevas', fuera === 0 && juegos.tu.size === L.tu.length && juegos.juntos.size === L.juntos.length, 'fuera ' + fuera + ' rondas tu ' + juegos.tu.size);
      check(nombre + '/' + L.id + ': el resumen trae 3 parejas que suenan', d.querySelectorAll('.le-resumen .le-par').length === 3);
    } else
    check(nombre + '/' + L.id + ': el ejemplo fallado vuelve al final', salieron.length === L.tu.length + 1 && salieron[salieron.length - 1] === tu[0], salieron.join(',') + ' fallo ' + tu[0]);
    check(nombre + '/' + L.id + ': termina con resumen y calcomania', !!d.querySelector('.le-resumen .le-calco'));
    const visible = d.body.cloneNode(true); visible.querySelectorAll('script, style').forEach(n => n.remove());
    check(nombre + '/' + L.id + ': no muestra puntajes ni porcentajes', !/\d+\s*%|score|puntos|aciertos/i.test(visible.textContent), (visible.textContent.match(/\d+\s*%|score|puntos|aciertos/i) || [''])[0]);
    check(nombre + '/' + L.id + ': queda guardada', !!(JSON.parse(w.localStorage.getItem('samsan:leccion-' + cfg.id) || '{}').hechas || {})[L.id]);
    check(nombre + '/' + L.id + ': sin errores de JavaScript', errores.length === 0, errores.join(' | '));
    w.close();
  }
}

/* voz de Pip: en español prefiere una voz local latinoamericana (es-US, es-419, es-MX, es-CO);
   si no hay, cualquier voz es- local; nunca una voz por red */
async function probarVoz(nombre, cfg) {
  const file = path.join(ROOT, 'guia-' + nombre + '.html');
  async function usadas(voces) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
      url: 'https://example.test/' + path.basename(file) + '#' + cfg.lecciones[0].id, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: new VirtualConsole(),
      beforeParse(w) {
        w.__SAMSAN_RAPIDO = true; w.__dichos = [];
        w.speechSynthesis = { getVoices: () => voces, cancel() {}, speak(u) { w.__dichos.push({ t: u.text, voz: u.voice && u.voice.name, lang: u.lang }); setTimeout(() => u.onend && u.onend(), 5); } };
        w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      }
    });
    await espera(400);
    const r = dom.window.__dichos.slice(); dom.window.close(); return r;
  }
  const base = [{ name: 'Daniel', lang: 'en-GB', localService: true }, { name: 'Monica', lang: 'es-ES', localService: true }, { name: 'Google español de Estados Unidos', lang: 'es-US', localService: false }];
  const d1 = await usadas(base.concat([{ name: 'Sofia', lang: 'es-US', localService: true }]));
  const es1 = d1.filter(x => /^es/.test(x.lang)), en1 = d1.filter(x => /^en/.test(x.lang));
  check(nombre + ': Pip habla español con la voz local es-US si el telefono la tiene', es1.length > 0 && es1.every(x => x.voz === 'Sofia') && en1.every(x => x.voz === 'Daniel'), [...new Set(d1.map(x => x.voz))].join(','));
  const d2 = await usadas(base);
  const es2 = d2.filter(x => /^es/.test(x.lang));
  check(nombre + ': sin voz latinoamericana local usa la es-ES local, nunca la de red', es2.length > 0 && es2.every(x => x.voz === 'Monica'), [...new Set(d2.map(x => x.voz))].join(','));
}

(async () => {
  if (!fs.existsSync(DIR)) { console.log('OMITIDO: no hay guias/'); return; }
  const nombres = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).filter(n => !process.env.SOLO || n === process.env.SOLO);   /* SOLO=<guia> para probar una */
  for (const n of nombres) {
    console.log('\n== guia ' + n);
    const cfg = leerConfig(n);
    if (cfg.modo === 'leccion') { validarLeccion(n, cfg); await probarVoz(n, cfg); await jugarLeccion(n, cfg); continue; }
    if (cfg.modo === 'aldea') { validarAldea(n, cfg); await jugarAldea(n, cfg); continue; }
    if (cfg.modo === 'juego') { validarJuego(n, cfg); await errorJuego(n, cfg); await jugarJuego(n, cfg); continue; }
    validarDatos(n, cfg);
    await jugar(n, cfg);
  }
  console.log(fallas.length ? '\nFALLAN ' + fallas.length + ' (ok ' + ok + ')' : '\nTODO OK — ' + ok + ' comprobaciones en ' + nombres.length + ' guias.');
  process.exit(fallas.length ? 1 : 0);
})();
