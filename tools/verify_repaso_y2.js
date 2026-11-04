#!/usr/bin/env node
/* ============================================================
   VERIFICACION — juegos de repaso de Year 2 (Maths)
   prototipos/maths-y2-recta/salto.js   «Hop along the number line»
   prototipos/maths-y2-abaco/taller.js  «Abacus workshop»

   Para cada juego:
   1. DATOS: cada reto tiene solucion, el presupuesto es el minimo (BFS),
      las cuentas del cuaderno son correctas, no hay retos repetidos.
   2. JUEGO: en jsdom resuelve CADA reto con su solucion declarada
      (raton), y ademas un reto de cada tipo con teclado y con toque
      simulado; una accion incorrecta no gana, y la escalera de pistas
      sube de 1 a 3 con cada fallo y con el boton HINT.
   3. Sin peticiones a terceros y sin errores de JavaScript.

   USO:  python3 tools/build.py && node tools/verify_repaso_y2.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.dirname(__dirname);

let comprobaciones = 0;
const fallas = [];
function ok(cond, msg) { comprobaciones++; if (!cond) fallas.push(msg); }
const dormir = ms => new Promise(r => setTimeout(r, ms));

function cargar(rel) {
  const errores = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e && e.message); if (!/Not implemented|getContext/i.test(m)) errores.push(m); });
  const dom = new JSDOM(fs.readFileSync(path.resolve(ROOT, rel), 'utf8'), {
    url: 'https://example.test/' + path.basename(rel), runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    }
  });
  return { w: dom.window, d: dom.window.document, errores, dom };
}
const $ = (J, s) => J.d.querySelector(s);
const $$ = (J, s) => Array.from(J.d.querySelectorAll(s));
function tecla(J, key, extra) { J.d.dispatchEvent(new J.w.KeyboardEvent('keydown', Object.assign({ key, bubbles: true }, extra || {}))); }
function visible(el) { return el && !el.hidden; }
async function empezar(J) {
  await dormir(150);
  $(J, '#play').click(); await dormir(100);
}
async function irARonda(J, ri) {
  /* recorre las rondas hasta la ronda `ri` solo para poder probarla: no, se juega cada una en orden. */
}
/* Pantalla de ronda hecha: gema grande y boton para seguir (el nino decide cuando). */
async function finDeRonda(J, ri) {
  ok(!!$(J, '.rp-hecha') && !!$(J, '.rp-gema-grande .proto-gema__svg'), 'ronda ' + (ri + 1) + ': falta la pantalla de ronda hecha con la gema');
  const b = $(J, '#rp-seguir');
  ok(!!b, 'ronda ' + (ri + 1) + ': falta el boton para seguir');
  if (b) b.click();
  await dormir(30);
}
function escribirNumero(J, n) {
  String(n).split('').forEach(c => $(J, '[data-k="' + c + '"]').click());
  $(J, '[data-k="ok"]').click();
}

/* ========================= JUEGO 1: RECTA ========================= */
async function verificarRecta() {
  const REL = '_local/proto-maths-y2-recta-salto.html';
  const J = cargar(REL);
  await dormir(200);
  const R = J.w.SAMSAN_REPASO;
  ok(!!R, 'recta: no expone SAMSAN_REPASO');
  if (!R) return;

  /* ---- 1. datos ---- */
  const vistos = {};
  R.rondas.forEach((r, ri) => {
    ok(r.items.length >= 5, 'recta: ronda ' + r.id + ' con menos de 5 items');
    r.items.forEach((it, ii) => {
      const id = r.id + '#' + ii;
      const firma = JSON.stringify([it.t, it.ini, it.meta, it.n, it.expr, it.pasos]);
      ok(!vistos[firma], 'recta: reto repetido ' + id); vistos[firma] = 1;
      if (it.t === 'ubicar') ok(it.n >= 0 && it.n <= 100, id + ': n fuera de 0-100');
      if (it.t === 'saltar') {
        const m = R.minimo(it);
        ok(m > 0, id + ': sin solucion');
        if (it.presupuesto) ok(m === it.presupuesto, id + ': presupuesto ' + it.presupuesto + ' != minimo ' + m);
        if (it.modo === 'decenas') {
          const dif = Math.abs(it.meta - it.ini);
          ok(Math.floor(dif / 10) + (dif % 10) === m, id + ': el minimo no es el plan natural (decenas y luego unidades)');
        }
      }
      if (it.t === 'seguir') {
        const v = R.ventana(it); let p = it.ini;
        it.pasos.forEach(s => { p += s; ok(p >= v.lo && p <= v.hi, id + ': se sale de la ventana'); });
      }
      if (it.t === 'puente') {
        ok(R.minimo(it) === 2, id + ': el minimo no es 2');
        const dif = Math.abs(it.meta - it.ini);
        ok(dif >= 2 && dif <= 9, id + ': diferencia fuera de 2-9');
      }
      if (it.t === 'botas') {
        const f = R.formas(it, R.maxBotas);
        if (it.imposible) {
          ok(f.length === 0, id + ': la bandera imposible tiene solucion');
          ok(((it.meta - it.ini) % 2) !== 0, id + ': la bandera imposible no tiene paridad distinta');
        } else {
          ok(f.length >= 2, id + ': menos de dos formas distintas (' + f.length + ')');
          /* cada forma debe poder hacerse sin pisar la bandera antes del final ni salirse de la ventana */
          const vv = R.ventana(it);
          f.forEach(k => {
            const [ga, gb] = k.split(',').map(Number); let p = it.ini, premat = false, fuera = false, n = 0;
            const orden = []; for (let q = 0; q < ga; q++) orden.push(10); for (let q = 0; q < gb; q++) orden.push(-2);
            orden.forEach(s => { p += s; n++; if (p < vv.lo || p > vv.hi) fuera = true; if (p === it.meta && n < orden.length) premat = true; });
            ok(!premat && !fuera, id + ': la forma ' + k + ' pisa la bandera antes de tiempo o sale de la ventana');
          });
        }
      }
      if (it.t === 'cuaderno') {
        const tok = it.expr.replace(/−/g, '-').split(' ');
        let v = parseInt(tok[0], 10);
        for (let k = 1; k < tok.length; k += 2) v += (tok[k] === '+' ? 1 : -1) * parseInt(tok[k + 1], 10);
        ok(v === it.resp, id + ': ' + it.expr + ' no da ' + it.resp);
        ok(R.cadena(it.expr, it.resp).fin === it.resp, id + ': la cadena de saltos no termina en ' + it.resp);
      }
    });
  });

  /* ---- 2. juego: pistas (unidad) ---- */
  {
    const P = J.w.PROTO_COMUN, caja = J.d.createElement('div'); J.d.body.appendChild(caja);
    let subidas = 0;
    const L = P.pistas({ caja, ocioMs: 60, peldanos: [{ texto: 'a', visual() { subidas++; } }, { texto: 'b', visual() { subidas++; } }, { texto: 'c', visual() { subidas++; } }] });
    ok(caja.hidden === true, 'pistas: la caja debe empezar oculta');
    await dormir(200);
    ok(caja.getAttribute('data-nivel') === '3', 'pistas: con 20 s sin accion (60 ms de prueba) debe llegar al peldano 3, esta en ' + caja.getAttribute('data-nivel'));
    L.parar();
    const L2 = P.pistas({ caja, ocioMs: 100000, peldanos: [{ texto: 'a' }, { texto: 'b' }, { texto: 'c' }] });
    L2.fallo(); ok(caja.getAttribute('data-nivel') === '1', 'pistas: un fallo sube al peldano 1');
    L2.fallo(); L2.pedir(); ok(caja.getAttribute('data-nivel') === '3', 'pistas: fallo + pedir llegan al 3');
    L2.pedir(); ok(caja.getAttribute('data-nivel') === '3', 'pistas: no pasa de 3');
    L2.parar();
  }

  /* ---- 3. juego: resolver cada reto ---- */
  await empezar(J);
  for (let ri = 0; ri < R.rondas.length; ri++) {
    ok(!!$(J, '#rp-go'), 'recta: falta la pantalla de la ronda ' + (ri + 1));
    $(J, '#rp-go').click(); await dormir(30);
    for (let ii = 0; ii < R.rondas[ri].items.length; ii++) {
      const it = R.rondas[ri].items[ii], id = R.rondas[ri].id + '#' + ii;
      const panel = $(J, '#rp');
      ok(panel && panel.getAttribute('data-tipo') === it.t, id + ': el panel no es del tipo ' + it.t);
      const mal = await resolver(J, R, it, id, ri, ii);
      const sig = $(J, '#rp-sig');
      ok(visible(sig), id + ': no aparece NEXT despues de resolver');
      if (!visible(sig)) return cerrar(J, REL);
      sig.click(); await dormir(30);
    }
    await finDeRonda(J, ri);
  }
  ok(!!$(J, '.proto-final'), 'recta: falta la pantalla final');
  ok(J.d.querySelectorAll('.proto-final__gemas .proto-gema__svg').length === R.rondas.length, 'recta: debe haber una gema por ronda, hay ' + J.d.querySelectorAll('.proto-final__gemas .proto-gema__svg').length);
  cerrar(J, REL);
}

function cerrar(J, rel) {
  ok(J.errores.length === 0, rel + ': errores de JS: ' + J.errores.slice(0, 3).join(' | '));
  J.w.close();
}

/* BFS que devuelve la lista de saltos de la solucion. */
function camino(R, it) {
  const v = R.ventana(it); let d = it.saltos || [];
  if (it.t === 'puente') { d = []; for (let k = 1; k <= 9; k++) d.push(it.dir * k); }
  const prev = {}; prev[it.ini] = null; const cola = [it.ini];
  while (cola.length) {
    const p = cola.shift();
    if (p === it.meta) break;
    for (const s of d) {
      const r = R.regla(it, v, p, s);
      if (r.ok && !(r.nuevo in prev)) { prev[r.nuevo] = [p, s]; cola.push(r.nuevo); }
    }
  }
  const out = []; let c = it.meta;
  while (prev[c]) { out.unshift(prev[c][1]); c = prev[c][0]; }
  return out;
}
function hacerSaltos(J, lista) { lista.forEach(s => $(J, 'button[data-d="' + s + '"]').click()); }

async function resolver(J, R, it, id, ri, ii) {
  const sig = () => $(J, '#rp-sig');
  const mensajeMal = () => !!$(J, '#rp-msg.is-mal');
  const nivel = () => +($(J, '#rp-caja').getAttribute('data-nivel') || 0);

  if (it.t === 'ubicar') {
    const dec = Math.floor(it.n / 10) * 10;
    const fase = () => $(J, '.rp-recta').getAttribute('data-fase');
    ok(fase() === 'decena', id + ': debe empezar en el paso de la decena');
    ok(!$(J, '[data-m="1"]') && !!$(J, '[data-m="10"]'), id + ': en el paso de la decena solo hay saltos de 10');
    /* 1. decena equivocada: roca, mensaje, pista */
    const lejos = dec >= 50 ? dec - 30 : dec + 30;
    ajustarUbicar(J, lejos); $(J, '#rp-ok').click();
    ok(!visible(sig()) && fase() === 'decena', id + ': cavar en otra decena no debe avanzar');
    ok(mensajeMal() && nivel() === 1, id + ': falta el mensaje del error o la pista');
    ok(!!$(J, '.rp-num.is-clave[data-n="' + lejos + '"]'), id + ': debe marcarse donde quedo el explorador');
    await dormir(760);
    ok(!!$(J, '.rp-obj[data-obj="roca"]'), id + ': cavar en el lugar equivocado debe sacar una roca');
    $(J, '#rp-hint').click(); ok(nivel() === 2 && !!$(J, '.rp-llave'), id + ': el peldano 2 debe mostrar la parte de la recta');
    /* 2. decena correcta (o la siguiente): zoom */
    ajustarUbicar(J, ii % 2 ? dec + 10 : dec); $(J, '#rp-ok').click();
    ok(fase() === 'unidad', id + ': la decena correcta debe hacer zoom');
    ok($$(J, '.rp-recta .rp-num').length >= 11, id + ': en el zoom deben verse los 11 numeros de la decena');
    ok(!!$(J, '[data-m="1"]') && !$(J, '[data-m="10"]'), id + ': en el zoom se camina de 1 en 1');
    /* 3. numero equivocado y luego el correcto (toque simulado, teclado o botones) */
    const casi = it.n === dec ? dec + 1 : it.n - 1;
    ajustarUbicar(J, casi); $(J, '#rp-ok').click();
    ok(!visible(sig()) && mensajeMal(), id + ': cavar en ' + casi + ' no debe ganar');
    if (ii === 0) {
      const v = $(J, '.rp-v'); v.getBoundingClientRect = () => ({ left: 0, width: 1000, top: 0, height: 200 });
      v.dispatchEvent(new J.w.MouseEvent('pointerdown', { clientX: (it.n - dec) * 100, bubbles: true }));
      J.w.dispatchEvent(new J.w.MouseEvent('pointerup', { bubbles: true }));
      ok(+$(J, '.rp-recta').getAttribute('data-val') === it.n, id + ': el toque debe llevar al explorador a ' + it.n);
      $(J, '#rp-ok').click();
    } else if (ii === 2) {
      let val = +$(J, '.rp-recta').getAttribute('data-val'), g = 0;
      while (val !== it.n && g++ < 20) { tecla(J, it.n > val ? 'ArrowRight' : 'ArrowLeft'); val = +$(J, '.rp-recta').getAttribute('data-val'); }
      tecla(J, 'Enter');
    } else { ajustarUbicar(J, it.n); $(J, '#rp-ok').click(); }
    ok(visible(sig()), id + ': cavar en ' + it.n + ' debe ganar');
    await dormir(760);
    ok(!!$(J, '.rp-obj[data-obj="estrella"]'), id + ': al cavar en el lugar correcto debe salir la estrella');
    return;
  }

  if (it.t === 'saltar') {
    const sol = camino(R, it);
    /* mal: un salto en la direccion contraria al principio y deshacer; despues, gastar las botas sin llegar */
    const contra = it.meta > it.ini ? -1 : 1;
    $(J, 'button[data-d="' + contra + '"]').click();
    $(J, '#rp-undo').click();
    ok(+$(J, '#rp-cuerpo').getAttribute('data-pos') === it.ini, id + ': UNDO debe volver a ' + it.ini);
    if (it.presupuesto) {
      for (let k = 0; k < it.presupuesto; k++) $(J, 'button[data-d="' + contra + '"]').click();
      ok(!visible(sig()), id + ': gastar las botas sin llegar no debe ganar');
      ok(mensajeMal(), id + ': falta el mensaje al quedarse sin botas');
      ok(nivel() >= 1, id + ': quedarse sin botas debe subir la pista');
      await dormir(1250);
      ok(+$(J, '#rp-cuerpo').getAttribute('data-pos') === it.ini, id + ': sin botas debe volver al inicio');
    }
    $(J, '#rp-hint').click();
    ok(nivel() >= 1, id + ': HINT debe mostrar una pista');
    if (ii === 1) {
      /* teclado */
      sol.forEach(s => {
        const k = Math.abs(s) === 10 ? { key: s > 0 ? 'ArrowRight' : 'ArrowLeft', shiftKey: true } : { key: s > 0 ? 'ArrowRight' : 'ArrowLeft', shiftKey: false };
        tecla(J, k.key, { shiftKey: k.shiftKey });
      });
    } else hacerSaltos(J, sol);
    ok(+$(J, '#rp-cuerpo').getAttribute('data-pos') === it.meta, id + ': debe terminar en ' + it.meta);
    return;
  }

  if (it.t === 'seguir') {
    /* botones del sentido contrario estan deshabilitados */
    const primero = it.pasos[0] > 0 ? 1 : -1;
    ok($(J, 'button[data-d="' + (-primero) + '"]').disabled, id + ': el boton del sentido contrario debe estar bloqueado');
    for (const p of it.pasos) {
      const s = p > 0 ? 1 : -1;
      for (let k = 0; k < Math.abs(p); k++) $(J, 'button[data-d="' + s + '"]').click();
    }
    const fin = it.pasos.reduce((a, b) => a + b, it.ini);
    ok(!!$(J, '[data-k="ok"]'), id + ': tras los saltos debe aparecer el teclado');
    escribirNumero(J, fin + 1);
    ok(!visible(sig()), id + ': un numero equivocado no debe ganar');
    ok(mensajeMal(), id + ': falta el mensaje del numero equivocado');
    ok(nivel() >= 1, id + ': el fallo debe subir la pista');
    escribirNumero(J, fin);
    return;
  }

  if (it.t === 'puente') {
    const t = Math.round((it.ini + it.meta) / 2);
    const sol = camino(R, it);
    /* mal: saltar de una vez hasta la meta cruza la puerta */
    $(J, 'button[data-d="' + (it.meta - it.ini) + '"]').click();
    ok(mensajeMal(), id + ': saltar sobre la puerta debe dar el mensaje de puerta');
    ok(+$(J, '#rp-cuerpo').getAttribute('data-pos') === it.ini, id + ': la puerta cerrada no debe mover al explorador');
    ok(nivel() >= 1, id + ': chocar con la puerta debe subir la pista');
    if (ii === 1) { sol.forEach(s => tecla(J, String(Math.abs(s)))); } else hacerSaltos(J, sol);
    ok(+$(J, '#rp-cuerpo').getAttribute('data-pos') === it.meta, id + ': debe terminar en ' + it.meta);
    return;
  }

  if (it.t === 'botas') {
    if (it.imposible) {
      ok($(J, '#rp-noway').hidden, id + ': NO WAY no debe estar visible al inicio');
      for (let k = 0; k < 8; k++) $(J, 'button[data-d="' + (k % 2 === 0 ? 10 : -2) + '"]').click();
      ok(!$(J, '#rp-noway').hidden, id + ': NO WAY debe aparecer tras 8 saltos');
      ok(!visible(sig()), id + ': intentar no debe ganar');
      $(J, '#rp-noway').click();
      return;
    }
    const fs_ = R.formas(it, R.maxBotas).map(k => k.split(',').map(Number)).sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    /* primera forma: grandes primero, luego pequenas */
    const primera = fs_[0], segunda = fs_[1];
    function ejecutar(f) {
      for (let k = 0; k < f[0]; k++) $(J, 'button[data-d="10"]').click();
      for (let k = 0; k < f[1]; k++) $(J, 'button[data-d="-2"]').click();
    }
    ejecutar(primera);
    ok(!visible(sig()), id + ': una sola forma no debe ganar');
    await dormir(1500);
    ok(+$(J, '#rp-cuerpo').getAttribute('data-pos') === it.ini, id + ': tras la forma 1 vuelve al inicio');
    ejecutar(primera);                                /* la misma forma otra vez: no cuenta */
    ok(!visible(sig()), id + ': repetir la misma forma no debe ganar');
    ok(mensajeMal(), id + ': falta el mensaje de la misma forma');
    await dormir(1200);
    if (ii === 0) { /* teclado */
      for (let k = 0; k < segunda[0]; k++) tecla(J, 'ArrowRight');
      for (let k = 0; k < segunda[1]; k++) tecla(J, 'ArrowLeft');
    } else ejecutar(segunda);
    ok($$(J, '.rp-formas li').length === 2, id + ': deben quedar dos formas anotadas');
    return;
  }

  if (it.t === 'cuaderno') {
    escribirNumero(J, it.resp + 1);
    ok(!visible(sig()), id + ': una respuesta equivocada no debe ganar');
    ok(mensajeMal(), id + ': falta el mensaje de respuesta equivocada');
    ok(nivel() === 1, id + ': el fallo debe subir la pista al 1');
    $(J, '#rp-hint').click();
    ok(!!$(J, '.rp-recta.is-vacia'), id + ': la pista 2 debe mostrar la recta vacia');
    if (ii % 2 === 0) { tecla(J, '9'); tecla(J, 'Backspace'); }          /* teclado fisico: escribir y borrar */
    escribirNumero(J, it.resp);
    return;
  }
  ok(false, id + ': tipo sin verificador ' + it.t);
}
function ajustarUbicar(J, objetivo) {
  let val = +$(J, '.rp-recta').getAttribute('data-val'), guard = 0;
  const paso = $(J, '[data-m="10"]') ? 10 : 1;
  while (val !== objetivo && guard++ < 40) {
    $(J, '[data-m="' + (objetivo > val ? paso : -paso) + '"]').click();
    val = +$(J, '.rp-recta').getAttribute('data-val');
  }
}

/* ========================= JUEGO 2: ABACO ========================= */
async function verificarAbaco() {
  const rel = 'maths-y2-abaco-taller.html';
  if (!fs.existsSync(path.join(ROOT, '_local', 'proto-maths-y2-abaco-taller.html'))) { console.log('  (abaco: aun no existe, se omite)'); return; }
  const mod = require('./verify_abaco_y2.js');
  await mod({ cargar, $, $$, tecla, visible, dormir, ok, empezar, escribirNumero, cerrar, finDeRonda });
}

/* ========================= MENU (una sola app) ========================= */
async function verificarMenu() {
  const REL = '_local/proto-maths-y2-repaso-juegos.html';
  if (!fs.existsSync(path.join(ROOT, REL))) { ok(false, 'menu: falta ' + REL); return; }
  const J = cargar(REL);
  await dormir(250);
  ok(!!$(J, '.mj-bienvenida #play') && !!$(J, '.mj-titulo'), 'menu: falta la pantalla de bienvenida con START');
  ok($$(J, '.mj-tarjeta').length === 0, 'menu: la bienvenida va antes de las tarjetas');
  $(J, '#mj-escena').click(); await dormir(40);
  ok($$(J, '.mj-tarjeta').length === 2, 'menu: tocar la escena de bienvenida debe abrir las tarjetas de juego');
  ok(!$(J, '#mundo'), 'menu: el menu no debe tener la escena grande');
  ok(!!$(J, '.mj-tarjeta[data-juego="recta"]') && !!$(J, '.mj-tarjeta[data-juego="abaco"]'), 'menu: faltan las tarjetas recta y abaco');
  ok($$(J, '#pieles .k-piel').length >= 6, 'menu: faltan los tonos de piel del explorador');
  for (const id of ['recta', 'abaco']) {
    $(J, '.mj-tarjeta[data-juego="' + id + '"]').click(); await dormir(40);
    ok(!!$(J, '#rp-go'), 'menu: ' + id + ' debe abrir la ronda 1');
    ok(!!$(J, '#rp-menu'), 'menu: ' + id + ' debe tener boton MENU en la ronda');
    $(J, '#rp-go').click(); await dormir(40);
    ok(!!$(J, '#rp[data-tipo]') && !!$(J, '#rp-menu') && !!$(J, '#rp-oir'), 'menu: ' + id + ' debe mostrar el reto con MENU y el boton de oir otra vez');
    $(J, '#rp-menu').click(); await dormir(40);
    ok($$(J, '.mj-tarjeta').length === 2, 'menu: MENU debe volver a la pantalla principal desde ' + id);
  }
  cerrar(J, REL);
}

/* ========================= SIN TERCEROS ========================= */
function verificarPaginas() {
  ['_local/proto-maths-y2-recta-salto.html', '_local/proto-maths-y2-abaco-taller.html', '_local/proto-maths-y2-repaso-juegos.html', 'maths-y2-repaso-juegos.html'].forEach(rel => {
    const f = path.join(ROOT, rel);
    if (!fs.existsSync(f)) return;
    const t = fs.readFileSync(f, 'utf8');
    ok(!/<(?:link|script|img|iframe|source|audio|video)\b[^>]*\b(?:src|href)\s*=\s*["']?(?:https?:)?\/\//i.test(t), rel + ': pide un recurso a un tercero');
    ok(!/url\(\s*['"]?(?:https?:)?\/\//i.test(t), rel + ': url() externo');
    ok(Buffer.byteLength(t) < 1.5 * 1024 * 1024, rel + ': pesa mas de 1,5 MB');
    ok(/Diseñado por/.test(t) && /legal\.html/.test(t), rel + ': faltan los creditos y el enlace a las notas legales (regla 10)');
  });
}

(async () => {
  console.log('Verificando juegos de repaso Year 2...');
  await verificarRecta();
  await verificarAbaco();
  await verificarMenu();
  verificarPaginas();
  ok(fs.existsSync(path.join(ROOT, 'maths-y2-repaso-juegos.html')), 'menu: la pagina publicada maths-y2-repaso-juegos.html no existe');
  ok(!fs.existsSync(path.join(ROOT, 'maths-y2-recta-salto.html')) && !fs.existsSync(path.join(ROOT, 'maths-y2-abaco-taller.html')), 'solo se publica el menu, no los juegos sueltos');
  if (fallas.length) {
    console.error('\nFALLAS (' + fallas.length + ' de ' + comprobaciones + ' comprobaciones):');
    fallas.forEach(f => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('TODO OK — ' + comprobaciones + ' comprobaciones.');
})().catch(e => { console.error(e); process.exit(1); });
