#!/usr/bin/env node
/* ============================================================
   VERIFICACION — «Abacus workshop» (Year 2, valor posicional)
   prototipos/maths-y2-abaco/taller.js

   Lo llama tools/verify_repaso_y2.js (que ya recorre todos los verify_*.js en CI).
   1. DATOS: numeros dentro del abaco (0-99), descomposiciones correctas, las sumas
      y restas de la ronda 5 son correctas y la mitad cruza una decena, ningun
      numero del material del colegio (regla 8), sin retos repetidos.
   2. JUEGO: en jsdom resuelve CADA reto con su solucion declarada; antes prueba
      respuestas incorrectas (no ganan, dan el mensaje neutro y suben la pista);
      un reto usa teclado y otro toque simulado; la escalera de pistas llega a 3.
   3. Sin errores de JavaScript.
   ============================================================ */
'use strict';

module.exports = async function verificarAbaco(H) {
  const { cargar, $, $$, tecla, visible, dormir, ok, empezar, escribirNumero, cerrar, finDeRonda } = H;
  const REL = '_local/proto-maths-y2-abaco-taller.html';
  const J = cargar(REL);
  await dormir(200);
  const A = J.w.SAMSAN_ABACO;
  ok(!!A, 'abaco: no expone SAMSAN_ABACO');
  if (!A) return;

  const PROHIBIDOS = [12, 14, 18, 19, 21, 23, 24, 25, 28, 34, 36]; /* numeros de los ejemplos del colegio */
  const vistos = {};
  let cruzan = 0;

  /* ---- 1. datos ---- */
  ok(A.rondas.length === 5, 'abaco: debe haber 5 rondas');
  A.rondas.forEach(r => {
    ok(r.items.length >= 4, 'abaco: ronda ' + r.id + ' con menos de 4 retos');
    ok(!!r.ejemplo && !!r.texto, 'abaco: ronda ' + r.id + ' sin texto o sin ejemplo (peldano 3)');
    r.items.forEach((it, ii) => {
      const id = r.id + '#' + ii;
      const firma = JSON.stringify([it.t, it.n, it.dec, it.uni, it.ini, it.k, it.expr, it.parte]);
      ok(!vistos[firma], 'abaco: reto repetido ' + id); vistos[firma] = 1;
      ok(typeof it.voz === 'string' && it.voz.length > 0, id + ': sin consigna para la voz');
      if (/^tu/.test(it.t)) ok(it.n >= 10 && it.n <= 99 && Math.floor(it.n / 10) <= 9, id + ': n fuera del abaco T y U');
      if (it.t === 'construir' || it.t === 'leer' || it.t === 'descomp') ok(it.n >= 1 && it.n <= 99, id + ': n fuera de 1-99');
      if (it.t === 'construir' && it.simple) ok(it.n >= 1 && it.n <= 10, id + ': simple debe caber en una varilla');
      if (it.t === 'comp') {
        ok(it.dec % 10 === 0 && it.dec >= 10 && it.uni >= 1 && it.uni <= 9, id + ': descomposicion invalida');
        ok(it.n === it.dec + it.uni && it.n <= 99, id + ': n no coincide');
      }
      if (it.t === 'mover') {
        ok(it.n === it.ini + it.k && it.n >= 1 && it.n <= 99, id + ': ini + k no cae en 1-99');
        if (Math.floor(it.ini / 10) !== Math.floor(it.n / 10)) cruzan++;
        ok(Math.abs(it.k) >= 2 && Math.abs(it.k) <= 9, id + ': k fuera de 2-9');
      }
      if (it.t === 'cuaderno') {
        const tok = it.expr.replace(/−/g, '-').split(' ');
        const v = parseInt(tok[0], 10) + (tok[1] === '+' ? 1 : -1) * parseInt(tok[2], 10);
        ok(v === it.resp, id + ': ' + it.expr + ' no da ' + it.resp);
        if (Math.floor(parseInt(tok[0], 10) / 10) !== Math.floor(it.resp / 10)) cruzan++;
      }
      /* regla 8: no copiar los numeros de los ejemplos del colegio */
      [it.n, it.dec, it.uni, it.ini, it.resp].forEach(v => { if (v != null) ok(PROHIBIDOS.indexOf(v) < 0, id + ': usa un numero de los ejemplos del colegio (' + v + ')'); });
    });
  });
  ok(cruzan === 0, 'abaco: la ronda 5 no cruza decenas (como el afiche del colegio), hay ' + cruzan);
  /* modelo */
  ok(A.canon(47).join() === '10,10,10,10,7,0,0,0,0,0', 'abaco: canon(47) mal: ' + A.canon(47).join());
  ok(A.esCanon(A.canon(63)) && !A.esCanon([3, 10, 0, 0, 0, 0, 0, 0, 0, 0]), 'abaco: esCanon mal');
  ok(A.total(A.canon(91)) === 91, 'abaco: total(canon(91)) != 91');

  /* ---- helpers del juego ---- */
  const estado = () => $(J, '.ab').getAttribute('data-c').split(',').map(Number);
  const sig = () => $(J, '#rp-sig');
  const mal = () => !!$(J, '#rp-msg.is-mal');
  const nivel = () => +($(J, '#rp-caja').getAttribute('data-nivel') || 0);
  /* mueve `delta` cuentas en la varilla f usando un toque sobre la cuenta correcta */
  function mover(f, delta) {
    if (delta < 0) {                     /* del lado de conteo, cada toque devuelve una cuenta */
      for (let k = 0; k < -delta; k++) { const c = estado()[f]; const b = $(J, '.ab-b[data-f="' + f + '"][data-p="10"]'); ok(!!b && c > 0, 'abaco: no hay cuenta para devolver en ' + f); if (b) b.click(); }
      return;
    }
    const c = estado()[f], u = 10 - c, p = u - delta + 1;
    if ($(J, '.ab').getAttribute('data-uno')) {          /* ronda 1: cada toque mueve una cuenta */
      for (let k = 0; k < delta; k++) $(J, '.ab-b[data-f="' + f + '"][data-p="1"]').click();
      return;
    }
    const b = $(J, '.ab-b[data-f="' + f + '"][data-p="' + p + '"]');
    ok(!!b, 'abaco: no existe la cuenta ' + f + '/' + p);
    if (b) b.click();
  }
  function llevarA(meta) {
    for (let f = 0; f < 10; f++) { const d = meta[f] - estado()[f]; if (d) mover(f, d); }
  }
  function teclaAb(key) { $(J, '.ab').dispatchEvent(new J.w.KeyboardEvent('keydown', { key, bubbles: true })); }
  function toque(f, delta) {
    if ($(J, '.ab').getAttribute('data-uno')) {
      for (let k = 0; k < delta; k++) { const b1 = $(J, '.ab-b[data-f="' + f + '"][data-p="1"]'); ['pointerdown', 'pointerup', 'click'].forEach(t => b1.dispatchEvent(new J.w.MouseEvent(t, { bubbles: true }))); }
      return;
    }
    const c = estado()[f], u = 10 - c;
    const p = delta > 0 ? u - delta + 1 : 10;
    const b = $(J, '.ab-b[data-f="' + f + '"][data-p="' + p + '"]');
    ['pointerdown', 'pointerup', 'click'].forEach(t => b.dispatchEvent(new J.w.MouseEvent(t, { bubbles: true })));
  }
  const igual = (a, b) => a.join() === b.join();
  const pistaBoton = () => $(J, '#rp-hint').click();

  async function resolver(it, id, ri, ii) {
    if (it.t === 'parte') {
      const malo = { beads: '.ab-marco', rods: '.ab-b', frame: '.ab-b', start: '.ab-b[data-lado="count"]', count: '.ab-b[data-lado="start"]' }[it.parte];
      const bueno = { beads: '.ab-b', rods: '.ab-hueco', frame: '.ab-marco', start: '.ab-b[data-lado="start"]', count: '.ab-b[data-lado="count"]' }[it.parte];
      ok(!!$(J, malo) && !!$(J, bueno), id + ': faltan zonas para tocar');
      ok(!$(J, '.ab-mk'), id + ': no deben quedar marcadores numerados');
      const antes = A.estadoPartes.join();
      $(J, malo).click();
      ok(!visible(sig()), id + ': tocar otra parte no debe ganar');
      ok(mal() && nivel() === 1, id + ': tocar otra parte debe nombrarla y subir la pista a 1');
      ok(!!$(J, '.ab-burbuja[data-tono="mal"]'), id + ': falta la burbuja ✗ junto al toque equivocado');
      ok($(J, '.ab').getAttribute('data-tono') === 'mal', id + ': la parte tocada debe pintarse de coral');
      ok(estado().join() === antes, id + ': tocar en este reto no debe mover cuentas');
      pistaBoton(); ok(nivel() === 2, id + ': HINT debe subir al 2');
      ok($(J, '.ab').getAttribute('data-brillo') === it.parte, id + ': el peldano 2 debe resaltar ' + it.parte);
      pistaBoton(); ok(nivel() === 3, id + ': HINT debe subir al 3');
      $(J, bueno).click();
      ok(!!$(J, '.ab-burbuja[data-tono="bien"]'), id + ': falta la burbuja ✓ del acierto');
      ok($(J, '.ab').getAttribute('data-tono') === 'bien' && $(J, '.ab').getAttribute('data-brillo') === it.parte, id + ': la parte hallada debe pintarse de verde');
      ok(!!$(J, '.ab-peg[data-parte="' + it.parte + '"]'), id + ': falta el rotulo de la parte hallada');
      ok($$(J, '.ab-peg').length === ii + 1, id + ': deben verse los rotulos de las partes ya halladas (' + (ii + 1) + ')');
      return;
    }

    if (it.t === 'construir' || it.t === 'comp' || it.t === 'mover') {
      const meta = A.canon(it.n), inicio = it.t === 'mover' ? A.canon(it.ini) : A.canon(0);
      ok(igual(estado(), inicio), id + ': el abaco debe empezar en ' + (it.ini || 0));
      /* 1. DONE sin tocar nada: no gana y sube la pista */
      $(J, '#rp-ok').click();
      ok(!visible(sig()), id + ': DONE sin mover no debe ganar');
      ok(mal() && nivel() === 1, id + ': DONE sin mover debe dar el mensaje y subir la pista');
      /* 2. pocas cuentas, muchas cuentas, y el numero bien repartido al reves (no esta en orden) */
      llevarA(A.canon(it.n - 1)); $(J, '#rp-ok').click();
      ok(!visible(sig()), id + ': ' + (it.n - 1) + ' no debe ganar');
      ok($$(J, '.ab-tag.is-mal').length >= 1, id + ': DONE equivocado debe marcar con ✗ las varillas que no cuadran');
      llevarA(A.canon(it.n + 1)); $(J, '#rp-ok').click();
      ok(!visible(sig()), id + ': ' + (it.n + 1) + ' no debe ganar');
      ok(nivel() === 3, id + ': tras 3 fallos la pista debe estar en 3, esta en ' + nivel());
      const alReves = A.canon(it.n).slice().reverse();
      llevarA(alReves); $(J, '#rp-ok').click();
      ok(!visible(sig()), id + ': las cuentas fuera de orden no deben ganar');
      /* peldanos 2 y 3 dibujados */
      if (it.t === 'mover') ok($$(J, '.ab-fila.is-cambia').length >= 1, id + ': el peldano 2 debe sombrear las varillas que cambian');
      else { ok($$(J, '.ab-tag').length >= 1, id + ': el peldano 2 debe etiquetar las varillas'); if (!it.simple) ok(!$(J, '#ab-tally').hidden, id + ': falta el recuento del peldano 2'); else ok($(J, '#ab-tally').hidden, id + ': en la ronda 1 no se habla de decenas'); }
      /* START OVER vuelve al principio */
      $(J, '#rp-reset').click();
      ok(igual(estado(), inicio), id + ': START OVER debe volver al inicio');
      /* 3. solucion: toque simulado en el primero, teclado en el segundo, clic en el resto */
      if (ii === 0 && ri !== 4) {
        for (let f = 0; f < 10; f++) { const d = meta[f] - estado()[f]; if (d) toque(f, d); }
      } else if (ii === 1 && ri === 1) {
        for (let f = 0; f < 10; f++) {
          const d = meta[f] - estado()[f];
          for (let k = 0; k < Math.abs(d); k++) teclaAb(d > 0 ? 'ArrowRight' : 'ArrowLeft');
          teclaAb('ArrowDown');
        }
      } else if (ii === 2 || ri === 4) {            /* flechas: tocar la varilla la elige; cada flecha mueve una cuenta */
        ok(!!$(J, '.ab-flechas [data-fl="1"]') && !!$(J, '.ab-flechas [data-fl="-1"]'), id + ': faltan las flechas');
        for (let f = 0; f < 10; f++) {
          const d = meta[f] - estado()[f]; if (!d) continue;
          $(J, '.ab-fila[data-f="' + f + '"] .ab-hueco').click();
          ok(+$(J, '.ab').getAttribute('data-sel') === f, id + ': tocar la varilla ' + f + ' debe elegirla');
          for (let k = 0; k < Math.abs(d); k++) $(J, '.ab-flechas [data-fl="' + (d > 0 ? 1 : -1) + '"]').click();
        }
      } else llevarA(meta);
      ok(igual(estado(), meta), id + ': el abaco debe quedar en ' + it.n + ', esta en ' + estado().join());
      $(J, '#rp-ok').click();
      return;
    }

    if (it.t === 'leer' || it.t === 'descomp') {
      const tL = Math.floor(it.n / 10), u = it.n % 10;
      ok(!$(J, '[data-k="ok"]'), id + ': el teclado no debe salir antes de contar');
      if (it.demo) {
        await dormir(750 * (tL + u) + 700);
        ok(+$(J, '#ab-cuenta').getAttribute('data-total') === it.n, id + ': la demostracion debe contar hasta ' + it.n);
      } else {
        $(J, '.ab-marco').click();
        ok(mal() && nivel() === 1, id + ': tocar el marco al contar debe avisar y subir la pista');
        ok(!!$(J, '.ab-burbuja[data-tono="mal"]'), id + ': falta la burbuja ✗ al contar');
        if (u > 0 && tL > 0) {
          /* en la fase de decenas, una cuenta suelta no es una varilla llena */
          $(J, '.ab-b[data-f="' + tL + '"][data-p="10"]').click();
          ok(nivel() === 2, id + ': tocar la varilla incompleta antes de tiempo debe subir la pista al 2');
          ok($$(J, '.ab-fila.is-cambia').length === tL, id + ': el peldano 2 debe marcar las varillas llenas por contar');
        }
        if (ii === 3 && it.t === 'leer') {          /* teclado: flechas y Enter */
          const ab = $(J, '.ab'), k = key => ab.dispatchEvent(new J.w.KeyboardEvent('keydown', { key, bubbles: true }));
          for (let f = 0; f < tL; f++) { if (f > 0) k('ArrowDown'); k('Enter'); }
          if (u > 0) { k('ArrowDown'); for (let q = 0; q < u; q++) k('Enter'); }
        } else {
          for (let f = 0; f < tL; f++) {
            const h = $(J, '.ab-fila[data-f="' + f + '"] .ab-hueco');
            h.click();
            if (f === 0) { h.click(); ok(!!$(J, '.ab-burbuja[data-tono="bien"]'), id + ': tocar una varilla ya contada debe decir Counted'); }
          }
          if (u > 0) {
            $(J, '.ab-b[data-f="' + tL + '"][data-p="1"]').click();
            ok(!$(J, '[data-k="ok"]'), id + ': una cuenta de la posicion inicial no debe contarse');
            for (let q = 10 - u + 1; q <= 10; q++) $(J, '.ab-b[data-f="' + tL + '"][data-p="' + q + '"]').click();
          }
        }
      }
      ok($(J, '.ab').getAttribute('data-fase') === 'hecho', id + ': el conteo debe terminar');
      ok(!!$(J, '[data-k="ok"]'), id + ': despues de contar debe salir el teclado');
      ok(+$(J, '#ab-cuenta').getAttribute('data-total') === it.n, id + ': el conteo debe sumar ' + it.n);
      ok($(J, '#ab-cuenta').hidden && !$$(J, '.ab-tag').some(t => t.textContent === String(it.n)), id + ': al abrir el teclado el total no debe verse (el nino lo escribe)');
      if (it.t === 'leer') {
        const nivelAntes = nivel();
        escribirNumero(J, it.n + 10 > 99 ? it.n - 10 : it.n + 10);
        ok(!visible(sig()), id + ': un numero equivocado no debe ganar');
        ok(mal() && nivel() >= Math.min(3, nivelAntes + 1), id + ': el fallo debe dar el mensaje y subir la pista');
        const inv = +String(it.n).split('').reverse().join('');
        if (inv !== it.n) { escribirNumero(J, inv); ok(!visible(sig()), id + ': el numero invertido (' + inv + ') no debe ganar'); }
        if (ii % 2 === 0) { tecla(J, '9'); tecla(J, 'Backspace'); }
        escribirNumero(J, it.n);
        return;
      }
      const dec = tL * 10;
      escribirNumero(J, tL === 1 ? 2 : 1);
      ok(!visible(sig()) && mal(), id + ': decenas equivocadas no deben ganar');
      escribirNumero(J, ii % 2 ? tL : dec);              /* "6 tens" o "60": las dos son la respuesta a How many tens? */
      ok($(J, '#ab-s1').textContent === String(dec), id + ': la casilla de decenas debe mostrar ' + dec);
      ok(!visible(sig()), id + ': solo las decenas no debe ganar');
      escribirNumero(J, u === 9 ? 8 : u + 1);
      ok(!visible(sig()), id + ': unidades equivocadas no deben ganar');
      escribirNumero(J, u);
      return;
    }

    if (it.t === 'cuaderno') {
      escribirNumero(J, it.resp + 1);
      ok(!visible(sig()), id + ': una respuesta equivocada no debe ganar');
      ok(mal() && nivel() === 1, id + ': el fallo debe dar el mensaje y subir la pista a 1');
      pistaBoton();
      ok(!!$(J, '.ab'), id + ': la pista 2 debe mostrar el abaco con el primer numero');
      ok(igual(estado(), A.canon(parseInt(it.expr, 10))), id + ': el abaco de la pista debe mostrar ' + parseInt(it.expr, 10));
      if (ii % 2 === 0) { tecla(J, '9'); tecla(J, 'Backspace'); }
      escribirNumero(J, it.resp);
      return;
    }
    if (/^tu/.test(it.t)) {
      const T = Math.floor(it.n / 10), U = it.n % 10;
      const tu = () => $(J, '.tu'), est = () => ({ t: +tu().getAttribute('data-t'), u: +tu().getAttribute('data-u') });
      ok(!!tu() && !!$(J, '.tu-rot[data-col="t"]') && !!$(J, '.tu-rot[data-col="u"]'), id + ': faltan las varillas T y U con su rotulo');
      ok(/tens/.test($(J, '.tu-rot[data-col="t"]').textContent) && /units/.test($(J, '.tu-rot[data-col="u"]').textContent), id + ': los rotulos deben decir tens y units');
      if (it.t === 'tuHacer') {
        ok(est().t === 0 && est().u === 0, id + ': el abaco debe empezar vacio');
        $(J, '#rp-ok').click();
        ok(!visible(sig()) && mal() && nivel() === 1, id + ': DONE vacio no debe ganar y debe subir la pista');
        /* al reves: U cuentas en T y T en U */
        for (let k = 0; k < U; k++) $(J, '[data-tu="t+"]').click();
        for (let k = 0; k < T; k++) $(J, '[data-tu="u+"]').click();
        $(J, '#rp-ok').click();
        ok(!visible(sig()), id + ': el numero al reves no debe ganar');
        if (T !== U) ok(/Swap/.test($(J, '#rp-msg').textContent), id + ': al reves debe decir Swap');
        ok(nivel() === 2 && $$(J, '.tu-fan').length === T + U, id + ': la pista 2 debe mostrar las cuentas fantasma');
        $(J, '#rp-reset').click(); ok(est().t === 0 && est().u === 0, id + ': START OVER debe vaciar el abaco');
        $(J, '[data-tu="u-"]').click(); ok(mal(), id + ': quitar de una varilla vacia debe avisar');
        /* solucion: tocar la varilla T (toque) y + en U; una de mas y menos */
        for (let k = 0; k < T; k++) $(J, '.tu-col[data-col="t"]').click();
        for (let k = 0; k < U + 1; k++) $(J, '[data-tu="u+"]').click();
        $(J, '[data-tu="u-"]').click();
        ok(est().t === T && est().u === U, id + ': el abaco debe quedar en ' + T + ' y ' + U);
        ok($(J, '[data-cnt="t"]').textContent === String(T), id + ': el contador de T debe decir ' + T);
        $(J, '#rp-ok').click();
        ok(/= ?/.test($(J, '#tu-eq').textContent) && $(J, '#tu-eq').textContent.indexOf(String(T * 10)) >= 0, id + ': al ganar debe verse ' + it.n + ' = ' + (T * 10) + ' + ' + U);
        return;
      }
      ok(est().t === T && est().u === U, id + ': el abaco debe mostrar ' + T + ' y ' + U);
      ok(!!$(J, '[data-k="ok"]'), id + ': debe estar el teclado');
      /* contar tocando: la ultima cuenta de T dice T*10 */
      $(J, '.tu-b[data-col="t"][data-i="' + (T - 1) + '"]').click();
      ok($$(J, '.tu-b[data-col="t"]').every(b => b.textContent === '10'), id + ': cada cuenta contada de T debe decir 10 (lo que vale)');
      ok($(J, '[data-tot="t"]').textContent === T + (T === 1 ? ' ten = ' : ' tens = ') + T * 10, id + ': el total de T debe decir ' + T + ' tens = ' + T * 10 + ', dice ' + $(J, '[data-tot="t"]').textContent);
      $(J, '.tu-b[data-col="u"][data-i="' + (U - 1) + '"]') && $(J, '.tu-b[data-col="u"][data-i="' + (U - 1) + '"]').click();
      if (U > 0) ok($$(J, '.tu-b[data-col="u"]').every(b => b.textContent === '1') && $(J, '[data-tot="u"]').textContent === U + (U === 1 ? ' unit = ' : ' units = ') + U, id + ': las unidades contadas deben decir 1 y el total ' + U);
      if (it.t === 'tuLeer') {
        escribirNumero(J, U === T ? T + 1 : U);
        ok(!visible(sig()) && mal(), id + ': decenas equivocadas no deben ganar');
        escribirNumero(J, ii % 2 ? T * 10 : T);
        ok($(J, '#tu-r0').textContent === String(T), id + ': la casilla Tens debe decir ' + T);
        escribirNumero(J, U === 9 ? 8 : U + 1); ok(!visible(sig()), id + ': unidades equivocadas no deben ganar');
        escribirNumero(J, U);
        const inv = U * 10 + T;
        if (inv !== it.n) { escribirNumero(J, inv); ok(!visible(sig()) && /Tens first/.test($(J, '#rp-msg').textContent), id + ': el numero invertido debe decir Tens first'); }
        escribirNumero(J, it.n);
        return;
      }
      escribirNumero(J, T === 1 ? 2 : 1);
      ok(!visible(sig()) && mal(), id + ': decenas equivocadas no deben ganar');
      escribirNumero(J, T);
      ok($(J, '#ab-s1').textContent === String(T * 10), id + ': la casilla de decenas debe mostrar ' + (T * 10));
      escribirNumero(J, U === 9 ? 8 : U + 1); ok(!visible(sig()), id + ': unidades equivocadas no deben ganar');
      escribirNumero(J, U);
      return;
    }
    ok(false, id + ': tipo sin verificador ' + it.t);
  }

  /* ---- 2. juego: cada reto con su solucion ---- */
  await empezar(J);
  for (let ri = 0; ri < A.rondas.length; ri++) {
    ok(!!$(J, '#rp-go'), 'abaco: falta la pantalla de la ronda ' + (ri + 1));
    $(J, '#rp-go').click(); await dormir(30);
    for (let ii = 0; ii < A.rondas[ri].items.length; ii++) {
      const it = A.rondas[ri].items[ii], id = A.rondas[ri].id + '#' + ii;
      const panel = $(J, '#rp');
      ok(panel && panel.getAttribute('data-tipo') === it.t, id + ': el panel no es del tipo ' + it.t);
      await resolver(it, id, ri, ii);
      ok(visible(sig()), id + ': no aparece NEXT despues de resolver');
      if (!visible(sig())) return cerrar(J, REL);
      sig().click(); await dormir(30);
    }
    await finDeRonda(J, ri);
  }
  ok(!!$(J, '.proto-final'), 'abaco: falta la pantalla final');
  ok(J.d.querySelectorAll('.proto-final__gemas .proto-gema__svg').length === A.rondas.length, 'abaco: debe haber una gema por ronda');
  cerrar(J, REL);
};
