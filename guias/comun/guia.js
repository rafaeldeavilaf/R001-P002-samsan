/* ============================================================
   SAMSAN — MOTOR DE LAS GUIAS DE ESTUDIO (guias/comun/guia.js)

   Una guia es una lista de misiones (un tema del colegio cada una).
   Cada mision tiene una tarjeta "Aprende" y varias actividades de accion:
     clasificar  llevar cada ficha a su caja
     ordenar     poner las fichas en su orden
     emparejar   unir cada ficha de la izquierda con su pareja
     tocar       tocar en la frase las palabras que se piden (o la que esta mal, para arreglarla)
     completar   llenar los espacios de una frase con fichas
   No hay opcion multiple ni puntaje frente al nino: solo se guarda
   que actividades se terminaron (estrella), en este navegador.

   Ayuda en tres peldaños (boton de la bombilla, o solo tras dos errores):
     1) la pista escrita  2) brilla una jugada correcta  3) se hace una jugada.

   Marcas en los textos:
     *texto*          resaltado en Aprende; objetivo en `tocar`
     *mal|bien*       en `tocar`: palabra equivocada que se arregla al tocarla
     [respuesta]      en `completar`: un espacio a llenar; [a|b] acepta a o b

   Uso:  GUIA.iniciar({ id, lang, tema, mascota, titulo, subtitulo, saludo, textos, misiones })
   ============================================================ */
(function () {
  'use strict';
  var G = window.GUIA = {};
  var cfg = null, raiz = null, hechas = {}, vozOn = true, voces = [];

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { if (h) n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); });
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function marcas(s) { return esc(s).replace(/\*([^*]+)\*/g, '<mark>$1</mark>'); }
  function plano(s) { return String(s).replace(/[*\[\]]/g, '').replace(/\|[^\s*]*/g, ''); }
  function mezclar(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* Mezcla que no deja el orden correcto a la vista (ordenar). */
  function desordenar(a) {
    if (a.length < 2) return a.slice();
    var b; do { b = mezclar(a); } while (b.every(function (x, i) { return x === a[i]; }));
    return b;
  }
  function t(k) { return (cfg.textos && cfg.textos[k]) || TEXTOS[cfg.idioma][k] || TEXTOS.en[k]; }
  var TEXTOS = {
    en: {
      empezar: 'Start here', seguir: 'Keep going', misiones: 'My missions', aprende: "Let's learn!",
      practicar: "Let's practise", siguiente: 'Next', volver: 'Missions', mision_ok: 'Mission complete!',
      todo_ok: 'You finished every mission!', ayuda: 'Help', reiniciar: 'Start again from zero',
      confirmar: 'Clear the stars and start again?', primero: 'First, tap a card.', intenta: 'Try again!',
      bravo: ['Great job!', 'Well done!', 'Super!', 'Brilliant!', 'You did it!'], escucha: 'Listen',
      atras: 'Back', actividad: 'Activity', de: 'of', aprendido: 'Tap the examples to hear them.',
      repasar: 'Read the lesson again', pista_def: 'Look again carefully. You can do it!', izquierda: 'Tap one', derecha: 'then its partner'
    },
    es: {
      empezar: 'Empezar aquí', seguir: 'Continuar', misiones: 'Mis misiones', aprende: '¡Vamos a aprender!',
      practicar: 'A practicar', siguiente: 'Siguiente', volver: 'Misiones', mision_ok: '¡Misión cumplida!',
      todo_ok: '¡Terminaste todas las misiones!', ayuda: 'Ayuda', reiniciar: 'Empezar de cero',
      confirmar: '¿Borrar las estrellas y empezar de nuevo?', primero: 'Primero toca una ficha.', intenta: '¡Intenta otra vez!',
      bravo: ['¡Muy bien!', '¡Excelente!', '¡Lo lograste!', '¡Genial!', '¡Bravo!'], escucha: 'Escuchar',
      atras: 'Atrás', actividad: 'Actividad', de: 'de', aprendido: 'Toca los ejemplos para escucharlos.',
      repasar: 'Volver a leer la lección', pista_def: 'Mira otra vez con calma. ¡Tú puedes!', izquierda: 'Toca una', derecha: 'y luego su pareja'
    }
  };

  /* ---------- iconos (trazo, sin emoji) ---------- */
  var ICO = {
    atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    voz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 8.5 Q19 12 16 15.5 M18.5 6 Q23 12 18.5 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    bombilla: '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path d="M9 18 H15 M10 21 H14 M12 3 A6 6 0 0 0 8 13.5 C9 14.5 9 15.5 9 16 H15 C15 15.5 15 14.5 16 13.5 A6 6 0 0 0 12 3 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    estrella: function (llena) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 L15.1 8.2 L22.4 9 L17 14 L18.5 21.3 L12 17.6 L5.5 21.3 L7 14 L1.6 9 L8.9 8.2 Z" fill="' +
        (llena ? '#FBBF24' : '#FFFFFF') + '" stroke="#1F2937" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    }
  };

  /* ---------- mascotas (vector plano) ---------- */
  var MASCOTAS = {
    /* Pip, el buho de la guia de Maths de Year 2 (canvas del 5 nov 2026). */
    pip: function (etq) {
      return '<svg class="g-mascota" viewBox="0 0 120 124" role="img" aria-label="' + esc(etq) + '">' +
        '<path d="M30 40 L34 14 L50 32 Z" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M90 40 L86 14 L70 32 Z" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<ellipse cx="104" cy="58" rx="11" ry="22" transform="rotate(35 104 58)" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5"/>' +
        '<ellipse cx="20" cy="80" rx="11" ry="24" transform="rotate(12 20 80)" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5"/>' +
        '<ellipse cx="60" cy="70" rx="42" ry="44" fill="#4A90D9" stroke="#1F2937" stroke-width="2.5"/>' +
        '<ellipse cx="60" cy="90" rx="25" ry="20" fill="#CFE6FA"/>' +
        '<path d="M48 84 Q52 89 56 84 M64 84 Q68 89 72 84 M56 96 Q60 101 64 96" fill="none" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="44" cy="56" r="15" fill="#FFFFFF" stroke="#1F2937" stroke-width="2.5"/><circle cx="46" cy="58" r="7" fill="#1F2937"/><circle cx="48" cy="55" r="2.5" fill="#FFFFFF"/>' +
        '<circle cx="76" cy="56" r="15" fill="#FFFFFF" stroke="#1F2937" stroke-width="2.5"/><circle cx="78" cy="58" r="7" fill="#1F2937"/><circle cx="80" cy="55" r="2.5" fill="#FFFFFF"/>' +
        '<path d="M54 68 L66 68 L60 78 Z" fill="#F59E0B" stroke="#1F2937" stroke-width="2" stroke-linejoin="round"/>' +
        '<ellipse cx="48" cy="114" rx="8" ry="4" fill="#F59E0B" stroke="#1F2937" stroke-width="2"/><ellipse cx="72" cy="114" rx="8" ry="4" fill="#F59E0B" stroke="#1F2937" stroke-width="2"/>' +
        '</svg>';
    },
    /* Zip, el colibri explorador de Year 6 (definido el 18 nov 2026). */
    zip: function (etq) {
      var k = '#14213D';
      return '<svg class="g-mascota" viewBox="0 0 150 124" role="img" aria-label="' + esc(etq) + '">' +
        '<path d="M44 80 L12 98 L26 101 L18 116 L52 92 Z" fill="#0B6E62" stroke="' + k + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<g class="ala"><path d="M62 58 C48 30 46 12 58 4 C70 14 74 36 72 58 Z" fill="#8ED9C8" stroke="' + k + '" stroke-width="2.5" stroke-linejoin="round"/></g>' +
        '<ellipse cx="66" cy="72" rx="30" ry="19" transform="rotate(-28 66 72)" fill="#12A389" stroke="' + k + '" stroke-width="2.5"/>' +
        '<ellipse cx="70" cy="80" rx="17" ry="8" transform="rotate(-28 70 80)" fill="#E3F6F0"/>' +
        '<circle cx="92" cy="48" r="17" fill="#12A389" stroke="' + k + '" stroke-width="2.5"/>' +
        '<path d="M80 60 Q91 70 104 57 Q99 67 86 69 Z" fill="#E4572E" stroke="' + k + '" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M107 45 L146 40 L107 51 Z" fill="' + k + '" stroke="' + k + '" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<circle cx="96" cy="44" r="6.5" fill="#FFFFFF" stroke="' + k + '" stroke-width="2"/><circle cx="97.5" cy="44.5" r="3.2" fill="' + k + '"/><circle cx="98.6" cy="43" r="1.1" fill="#FFFFFF"/>' +
        '<g class="ala"><path d="M58 66 C36 52 26 36 30 24 C46 28 62 44 68 62 Z" fill="#BDEBDF" stroke="' + k + '" stroke-width="2.5" stroke-linejoin="round"/></g>' +
        '</svg>';
    }
  };
  function mascota(chica) {
    var s = MASCOTAS[cfg.mascota](cfg.mascotaNombre || '');
    return chica ? s.replace('class="g-mascota"', 'class="g-mascota g-mascota--chica"') : s;
  }

  /* ---------- sonido corto (WebAudio, sin archivos) ---------- */
  var ac = null;
  function tono(f, t0, dur, vol) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended' && ac.resume) ac.resume();
      var o = ac.createOscillator(), g = ac.createGain(), ti = ac.currentTime + t0;
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.08, ti); g.gain.exponentialRampToValueAtTime(0.0001, ti + dur);
      o.connect(g); g.connect(ac.destination); o.start(ti); o.stop(ti + dur);
    } catch (e) { /* sin audio */ }
  }
  function sonido(tipo) {
    if (tipo === 'ok') { tono(660, 0, 0.12); tono(880, 0.08, 0.16); }
    else if (tipo === 'mal') { tono(240, 0, 0.16, 0.06); }
    else if (tipo === 'fin') { [523, 659, 784, 1047].forEach(function (f, i) { tono(f, i * 0.1, 0.22); }); }
    else if (tipo === 'toc') { tono(520, 0, 0.05, 0.04); }
  }

  /* ---------- voz del telefono (sin enviar nada fuera) ---------- */
  function cargarVoces() { try { voces = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { voces = []; } }
  function mejorVoz() {
    var lang = cfg.lang.toLowerCase(), base = lang.slice(0, 2), mejor = null, top = -1;
    voces.forEach(function (v) {
      var l = (v.lang || '').replace('_', '-').toLowerCase();
      /* Regla 2 del repo: solo voces del propio telefono (localService), nada por red. */
      if (l.slice(0, 2) !== base || v.localService !== true) return;
      var p = (l === lang ? 4 : 0) + (/natural|premium|enhanced|neural|siri/i.test(v.name) ? 5 : 0);
      if (p > top) { top = p; mejor = v; }
    });
    return mejor;
  }
  function hablar(texto) {
    if (!vozOn || !window.speechSynthesis || !texto) return;
    try {
      speechSynthesis.cancel();
      var limpio = plano(texto).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/_+/g, ' ').trim();
      if (!limpio) return;
      if (!voces.length) cargarVoces();
      var v = mejorVoz();
      if (!v) return;   /* sin voz local no habla: queda el texto (regla 2) */
      var u = new SpeechSynthesisUtterance(limpio);
      u.voice = v; u.lang = v.lang;
      u.rate = cfg.velocidad || 0.9;
      speechSynthesis.speak(u);
    } catch (e) { /* sin voz */ }
  }
  G.hablar = function (s) { hablar(s); };

  /* ---------- progreso (solo que se termino) ---------- */
  function clave() { return 'samsan:guia-' + cfg.id; }
  function cargar() { try { hechas = JSON.parse(localStorage.getItem(clave()) || '{}') || {}; } catch (e) { hechas = {}; } }
  function guardar() { try { localStorage.setItem(clave(), JSON.stringify(hechas)); } catch (e) { /* sin almacenamiento */ } }
  function idAct(mi, ai) { return cfg.misiones[mi].id + '-' + (ai + 1); }
  function nHechas(mi) { return cfg.misiones[mi].actividades.filter(function (a, ai) { return hechas[idAct(mi, ai)]; }).length; }
  function siguienteMision() {
    for (var i = 0; i < cfg.misiones.length; i++) if (nHechas(i) < cfg.misiones[i].actividades.length) return i;
    return -1;
  }

  /* ---------- navegacion con el boton Atras del telefono ---------- */
  function ir(estado, reemplazar) {
    try { history[reemplazar ? 'replaceState' : 'pushState'](estado, '', '#' + (estado.m === undefined ? '' : (cfg.misiones[estado.m].id + (estado.p ? '-' + estado.p : '')))); } catch (e) { /* file:// sin historial */ }
    pintar(estado);
  }
  window.addEventListener('popstate', function (ev) { if (cfg) pintar(ev.state || {}); });

  function barra(titulo, sub, alVolver) {
    var b = el('header', { class: 'g-barra' });
    if (alVolver) b.appendChild(el('button', { class: 'g-icono', 'aria-label': t('atras'), html: ICO.atras, onclick: alVolver }));
    b.appendChild(el('h1', { html: esc(titulo) + (sub ? '<small>' + esc(sub) + '</small>' : '') }));
    var bv = el('button', { class: 'g-icono', 'aria-label': t('escucha'), 'aria-pressed': String(vozOn), html: ICO.voz });
    bv.addEventListener('click', function () {
      vozOn = !vozOn; bv.setAttribute('aria-pressed', String(vozOn));
      try { if (!vozOn) speechSynthesis.cancel(); localStorage.setItem('samsan:guia-voz', vozOn ? '1' : '0'); } catch (e) { /* nada */ }
    });
    b.appendChild(bv);
    return b;
  }
  function estrellas(mi) {
    var m = cfg.misiones[mi], s = '';
    m.actividades.forEach(function (a, ai) { s += ICO.estrella(!!hechas[idAct(mi, ai)]); });
    return el('span', { class: 'g-estrellas', 'aria-label': nHechas(mi) + ' / ' + m.actividades.length, html: s });
  }
  function colorear(nodo, m) {
    nodo.style.setProperty('--c', m.color);
    nodo.style.setProperty('--c2', m.claro);
    nodo.style.setProperty('--c-osc', m.oscuro || m.color);
  }

  /* ---------- pantallas ---------- */
  function pintar(estado) {
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* nada */ }
    raiz.innerHTML = '';
    var cap = document.querySelector('.g-capa'); if (cap) cap.remove();
    if (estado.m === undefined) portada();
    else mision(estado.m, estado.p || 0);
    window.scrollTo(0, 0);
  }

  function portada() {
    var s = el('section', { class: 'g-portada' });
    s.appendChild(barra(cfg.titulo, cfg.subtitulo));
    var hola = el('div', { class: 'g-hola', html: mascota() });
    hola.appendChild(el('p', { class: 'g-globo', text: cfg.saludo }));
    hola.addEventListener('click', function () { hablar(cfg.saludo); });
    s.appendChild(hola);
    var sig = siguienteMision();
    var hayAvance = Object.keys(hechas).length > 0;
    var play = el('button', { id: 'play', class: 'g-btn g-btn--grande', html: esc(sig < 0 ? t('todo_ok') : (hayAvance ? t('seguir') : t('empezar')) + ' · ' + cfg.misiones[sig].titulo) });
    play.addEventListener('click', function () { if (sig >= 0) ir({ m: sig, p: 0 }); else ir({ m: 0, p: 0 }); });
    s.appendChild(play);
    s.appendChild(el('h2', { text: t('misiones'), style: 'margin-top:20px' }));
    var ol = el('ol', { class: 'g-misiones' });
    cfg.misiones.forEach(function (m, mi) {
      var b = el('button', { class: 'g-mision' });
      colorear(b, m);
      b.appendChild(el('span', { class: 'g-letra', text: m.letra || String.fromCharCode(65 + mi), 'aria-hidden': 'true' }));
      b.appendChild(el('span', { class: 'g-mision__txt', html: esc(m.titulo) + (m.sub ? '<small>' + esc(m.sub) + '</small>' : '') }));
      b.appendChild(estrellas(mi));
      b.addEventListener('click', function () { ir({ m: mi, p: 0 }); });
      ol.appendChild(el('li', null, [b]));
    });
    s.appendChild(ol);
    if (hayAvance) {
      var pie = el('div', { class: 'g-pie-portada' });
      pie.appendChild(el('button', { text: t('reiniciar'), onclick: function () {
        if (window.confirm(t('confirmar'))) { hechas = {}; guardar(); pintar({}); }
      } }));
      s.appendChild(pie);
    }
    raiz.appendChild(s);
    if (cfg.alEntrar) cfg.alEntrar();
  }

  function pasos(mi, p) {
    var m = cfg.misiones[mi], d = el('div', { class: 'g-pasos', 'aria-hidden': 'true' });
    for (var i = 0; i <= m.actividades.length; i++) {
      var hecho = i === 0 ? p > 0 : !!hechas[idAct(mi, i - 1)];
      d.appendChild(el('span', { class: 'g-paso' + (i === p ? ' ahora' : (hecho ? ' hecho' : '')) }));
    }
    return d;
  }

  function mision(mi, p) {
    var m = cfg.misiones[mi];
    var s = el('section', { class: 'g-mision-pant' });
    colorear(s, m);
    s.appendChild(barra(m.titulo, p === 0 ? t('aprende') : t('actividad') + ' ' + p + ' ' + t('de') + ' ' + m.actividades.length, function () { ir({}); }));
    s.appendChild(pasos(mi, p));
    raiz.appendChild(s);
    if (p === 0) aprende(s, mi);
    else actividad(s, mi, p - 1);
  }

  function aprende(s, mi) {
    var m = cfg.misiones[mi];
    var hola = el('div', { class: 'g-hola', html: mascota(true) });
    hola.appendChild(el('p', { class: 'g-globo', text: m.globo || t('aprende') }));
    s.appendChild(hola);
    m.aprende.forEach(function (b) {
      var c = el('div', { class: 'g-tarjeta' });
      if (b.h) c.appendChild(el('h3', { html: marcas(b.h) }));
      (b.p ? [].concat(b.p) : []).forEach(function (par) { c.appendChild(el('p', { html: marcas(par) })); });
      if (b.ej) {
        var e = el('div', { class: 'g-ejemplos' });
        b.ej.forEach(function (x) {
          x = typeof x === 'string' ? { t: x } : x;
          var bt = el('button', { class: 'g-ej', html: (x.img ? '<span class="g-img" aria-hidden="true">' + x.img + '</span>' : '') + '<span>' + marcas(x.t) + '</span>' + (x.nota ? '<small>' + esc(x.nota) + '</small>' : '') });
          bt.addEventListener('click', function () { hablar(x.voz || x.t); });
          e.appendChild(bt);
        });
        c.appendChild(e);
      }
      if (b.frases) b.frases.forEach(function (f) {
        var bt = el('button', { class: 'g-frase-ej', html: marcas(f) });
        bt.addEventListener('click', function () { hablar(f); });
        c.appendChild(bt);
      });
      s.appendChild(c);
    });
    s.appendChild(el('p', { class: 'g-contador', text: t('aprendido'), style: 'text-align:center' }));
    var go = el('button', { class: 'g-btn g-btn--grande', text: t('practicar') + ' ▶' });
    go.addEventListener('click', function () { ir({ m: mi, p: 1 }); });
    s.appendChild(go);
    if (cfg.vozAuto) setTimeout(function () { hablar(m.globo || ''); }, 300);
  }

  /* ---------- actividad: marco comun ---------- */
  function actividad(s, mi, ai) {
    var m = cfg.misiones[mi], a = m.actividades[ai];
    var orden = el('div', { class: 'g-orden' });
    orden.appendChild(el('p', { html: marcas(a.orden) }));
    orden.appendChild(el('button', { class: 'g-icono', 'aria-label': t('escucha'), html: ICO.voz, onclick: function () { hablar(a.orden); } }));
    s.appendChild(orden);
    if (a.lectura) {
      var lec = el('div', { class: 'g-tarjeta g-lectura' });
      if (a.lectura.h) lec.appendChild(el('h3', { text: a.lectura.h }));
      [].concat(a.lectura.p).forEach(function (par) {
        var bt = el('button', { class: 'g-frase-ej', html: marcas(par) });
        bt.addEventListener('click', function () { hablar(par); });
        lec.appendChild(bt);
      });
      s.appendChild(lec);
    }
    var zona = el('div', { class: 'g-zona' });
    s.appendChild(zona);
    var pista = el('p', { class: 'g-pista', role: 'status' });
    var peldano = 0;
    var ctx = {
      zona: zona,
      decir: function (txt) { pista.textContent = txt; },
      mal: function (nodo, intentos, alBrillar) {
        sonido('mal');
        if (nodo) { nodo.classList.remove('sacude'); void nodo.offsetWidth; nodo.classList.add('sacude'); }
        pista.textContent = intentos >= 2 ? (a.pista || t('pista_def')) : t('intenta');
        if (intentos >= 2 && alBrillar) alBrillar();
      },
      ok: function () { sonido('ok'); pista.textContent = ''; peldano = 0; },
      brillar: function (nodo) { if (!nodo) return; nodo.classList.remove('brilla'); void nodo.offsetWidth; nodo.classList.add('brilla'); nodo.scrollIntoView && nodo.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); },
      fin: function () { terminar(mi, ai); }
    };
    var api = TIPOS[a.tipo](a, ctx);
    var fila = el('div', { class: 'g-ayuda-fila' });
    fila.appendChild(el('button', { class: 'g-btn g-btn--suave', html: ICO.bombilla + ' ' + esc(t('ayuda')), onclick: function () {
      peldano++;
      if (peldano === 1) { pista.textContent = a.pista || t('pista_def'); hablar(a.pista || ''); }
      else if (peldano === 2) { api.ayuda(); }
      else { api.resolverUno(); peldano = 0; }
    } }));
    s.appendChild(fila);
    s.appendChild(pista);
    if (cfg.vozAuto) setTimeout(function () { hablar(a.orden); }, 300);
  }

  function terminar(mi, ai) {
    var m = cfg.misiones[mi];
    hechas[idAct(mi, ai)] = 1; guardar();
    sonido('fin');
    var ultima = ai === m.actividades.length - 1;
    var bravo = t('bravo')[Math.floor(Math.random() * t('bravo').length)];
    var capa = el('div', { class: 'g-capa', role: 'dialog', 'aria-modal': 'true', 'aria-label': bravo });
    var box = el('div', { class: 'g-logro', html: mascota() });
    $('.g-mascota', box).classList.add('salta');
    box.appendChild(el('h3', { text: ultima ? t('mision_ok') : bravo }));
    box.appendChild(el('div', { class: 'g-estrellas', html: ICO.estrella(true) + ICO.estrella(true) + ICO.estrella(true), style: 'justify-content:center;display:flex' }));
    var sig = el('button', { class: 'g-btn', text: (ultima ? t('volver') : t('siguiente')) + ' ▶' });
    sig.addEventListener('click', function () { capa.remove(); if (ultima) ir({}); else ir({ m: mi, p: ai + 2 }); });
    box.appendChild(sig);
    if (!ultima) box.appendChild(el('button', { class: 'g-btn g-btn--suave', text: t('volver'), onclick: function () { capa.remove(); ir({}); } }));
    capa.appendChild(box);
    document.body.appendChild(capa);
    hablar(ultima ? t('mision_ok') : bravo);
    setTimeout(function () { sig.focus(); }, 50);
  }

  function ficha(x, extra) {
    x = typeof x === 'string' ? { t: x } : x;
    return el('button', { class: 'g-ficha' + (extra ? ' ' + extra : ''), 'aria-pressed': 'false',
      html: (x.img ? '<span class="g-img" aria-hidden="true">' + x.img + '</span>' : '') + '<span>' + esc(x.t) + '</span>' });
  }
  function norm(x) { return typeof x === 'string' ? { t: x } : x; }

  /* ---------- tipos de actividad ---------- */
  var TIPOS = {};

  /* clasificar: { cajas: [{id, t, sub}], items: [{t, caja, img}] } */
  TIPOS.clasificar = function (a, ctx) {
    var sel = null, quedan = a.items.length;
    var pool = el('div', { class: 'g-pool' }), cajas = el('div', { class: 'g-cajas' });
    var porCaja = {};
    a.cajas.forEach(function (c) {
      var b = el('button', { class: 'g-caja', html: '<span class="g-caja__nombre">' + esc(c.t) + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</span>' });
      var dentro = el('span', { class: 'g-dentro' }); b.appendChild(dentro);
      porCaja[c.id] = { boton: b, dentro: dentro };
      b.addEventListener('click', function () { soltar(c.id); });
      cajas.appendChild(b);
    });
    var fichas = mezclar(a.items.map(norm)).map(function (x) {
      var f = ficha(x); f._x = x; f._err = 0;
      f.addEventListener('click', function () {
        if (sel) sel.setAttribute('aria-pressed', 'false');
        sel = sel === f ? null : f;
        if (sel) { sel.setAttribute('aria-pressed', 'true'); sonido('toc'); if (cfg.leerFichas) hablar(x.voz || x.t); }
      });
      pool.appendChild(f);
      return f;
    });
    function colocar(f) {
      var c = porCaja[f._x.caja];
      c.dentro.appendChild(el('span', { class: 'g-chip', text: f._x.t }));
      f.remove(); quedan--; if (sel === f) sel = null;
      ctx.ok();
      if (!quedan) { pool.classList.add('g-pool--vacia'); setTimeout(ctx.fin, 500); }
    }
    function soltar(id) {
      if (!sel) { ctx.decir(t('primero')); return; }
      if (sel._x.caja === id) colocar(sel);
      else { var f = sel; f._err++; ctx.mal(porCaja[id].boton, f._err, function () { ctx.brillar(porCaja[f._x.caja].boton); }); }
    }
    ctx.zona.appendChild(pool); ctx.zona.appendChild(cajas);
    function primera() { return sel && sel.isConnected ? sel : fichas.filter(function (f) { return f.isConnected; })[0]; }
    return {
      ayuda: function () { var f = primera(); if (!f) return; if (sel !== f) f.click(); ctx.brillar(porCaja[f._x.caja].boton); },
      resolverUno: function () { var f = primera(); if (f) colocar(f); }
    };
  };

  /* ordenar: { items: [{t, img}] en el orden correcto, flechas: true } */
  TIPOS.ordenar = function (a, ctx) {
    var items = a.items.map(norm), n = 0;
    var ol = el('ol', { class: 'g-huecos' }), pool = el('div', { class: 'g-pool' });
    var huecos = items.map(function (x, i) {
      var h = el('li', { class: 'g-hueco', html: '<span class="g-hueco__n">' + (i + 1) + '</span><span class="g-hueco__t"></span>' });
      ol.appendChild(h);
      return h;
    });
    var fichas = desordenar(items).map(function (x) {
      var f = ficha(x); f._x = x; f._err = 0;
      f.addEventListener('click', function () {
        if (x === items[n]) poner(f);
        else { f._err++; ctx.mal(f, f._err, function () { ctx.brillar(fichaDe(items[n])); }); }
      });
      pool.appendChild(f);
      return f;
    });
    function fichaDe(x) { return fichas.filter(function (f) { return f._x === x; })[0]; }
    function poner(f) {
      var h = huecos[n];
      $('.g-hueco__t', h).innerHTML = (f._x.img ? '<span class="g-img" aria-hidden="true">' + f._x.img + '</span> ' : '') + esc(f._x.t);
      h.classList.add('lleno'); f.remove(); n++;
      ctx.ok(); if (cfg.leerFichas) hablar(f._x.voz || f._x.t);
      if (n === items.length) { pool.classList.add('g-pool--vacia'); setTimeout(ctx.fin, 700); }
    }
    ctx.zona.appendChild(pool); ctx.zona.appendChild(ol);
    if (a.final) ctx.zona.appendChild(el('p', { class: 'g-flecha', text: a.final }));
    return {
      ayuda: function () { ctx.brillar(fichaDe(items[n])); },
      resolverUno: function () { var f = fichaDe(items[n]); if (f) poner(f); }
    };
  };

  /* emparejar: { pares: [[izq, der], ...], titulos: ['', ''], largo: true } */
  TIPOS.emparejar = function (a, ctx) {
    var sel = null, quedan = a.pares.length, num = 0;
    var cont = el('div', { class: 'g-pares' + (a.largo ? ' g-pares--largo' : '') });
    var ci = el('div', { class: 'g-col' }), cd = el('div', { class: 'g-col' });
    if (a.titulos) { ci.appendChild(el('h4', { text: a.titulos[0] })); cd.appendChild(el('h4', { text: a.titulos[1] })); }
    cont.appendChild(ci); cont.appendChild(cd);
    function crear(x, lado, i) {
      var f = ficha(x); f._lado = lado; f._i = i; f._err = 0; f._x = norm(x);
      f.addEventListener('click', function () { tocar(f); });
      return f;
    }
    var izq = mezclar(a.pares.map(function (p, i) { return crear(p[0], 0, i); }));
    var der = mezclar(a.pares.map(function (p, i) { return crear(p[1], 1, i); }));
    izq.forEach(function (f) { ci.appendChild(f); });
    der.forEach(function (f) { cd.appendChild(f); });
    function tocar(f) {
      if (f.classList.contains('par')) return;
      if (cfg.leerFichas) hablar(f._x.voz || f._x.t);
      if (!sel || sel._lado === f._lado) {
        if (sel) sel.setAttribute('aria-pressed', 'false');
        sel = sel === f ? null : f;
        if (sel) { sel.setAttribute('aria-pressed', 'true'); sonido('toc'); }
        return;
      }
      if (sel._i === f._i) unir(sel, f);
      else {
        var s0 = sel; s0._err++;
        ctx.mal(f, s0._err, function () { ctx.brillar(pareja(s0)); });
      }
    }
    function pareja(f) { return (f._lado ? izq : der).filter(function (g) { return g._i === f._i; })[0]; }
    function unir(x, y) {
      num++;
      [x, y].forEach(function (g) {
        g.classList.add('par'); g.setAttribute('aria-pressed', 'false'); g.disabled = true;
        g.appendChild(el('span', { class: 'g-num', text: String(num), 'aria-hidden': 'true' }));
      });
      sel = null; quedan--; ctx.ok();
      if (!quedan) setTimeout(ctx.fin, 600);
    }
    ctx.zona.appendChild(cont);
    function libre() { return sel || izq.filter(function (g) { return !g.classList.contains('par'); })[0]; }
    return {
      ayuda: function () { var f = libre(); if (!f) return; if (sel !== f) tocar(f); ctx.brillar(pareja(f)); },
      resolverUno: function () { var f = libre(); if (f) unir(f, pareja(f)); }
    };
  };

  /* tocar: { frases: ['The *night* is *bright*.', 'The dogs *barks|bark*.'] } */
  var PALABRA = /([A-Za-zÀ-ÖØ-öø-ÿ0-9'’°-]+)/;
  TIPOS.tocar = function (a, ctx) {
    var fi = 0, grupos = [], botones = [];
    var cuenta = el('p', { class: 'g-contador' }), caja = el('div', { class: 'g-frase' });
    ctx.zona.appendChild(cuenta); ctx.zona.appendChild(caja);
    function pintarFrase() {
      caja.innerHTML = ''; grupos = []; botones = [];
      cuenta.textContent = (fi + 1) + ' / ' + a.frases.length;
      var partes = a.frases[fi].split(/(\*[^*]+\*)/);
      partes.forEach(function (parte) {
        if (!parte) return;
        var meta = /^\*([^*]+)\*$/.exec(parte), g = null;
        if (meta) {
          var dos = meta[1].split('|');
          g = { encontrado: false, nodos: [], bien: dos[1] || null };
          grupos.push(g);
          parte = dos[0];
        }
        parte.split(PALABRA).forEach(function (pz, k) {
          if (!pz) return;
          if (k % 2 === 1) {
            var b = el('button', { class: 'g-palabra', text: pz });
            b._g = g; b._err = 0;
            b.addEventListener('click', function () { toque(b); });
            if (g) g.nodos.push(b);
            botones.push(b);
            caja.appendChild(b);
          } else caja.appendChild(document.createTextNode(pz));
        });
      });
    }
    function marcar(g) {
      g.encontrado = true;
      if (g.bien) { g.nodos[0].textContent = g.bien; for (var i = 1; i < g.nodos.length; i++) g.nodos[i].remove(); g.nodos[0].classList.add('arreglada'); }
      g.nodos.forEach(function (n) { n.classList.add('ok'); n.disabled = true; });
      ctx.ok();
      if (grupos.every(function (x) { return x.encontrado; })) {
        setTimeout(function () {
          if (cfg.leerFichas) hablar(caja.textContent);
          fi++;
          if (fi < a.frases.length) setTimeout(pintarFrase, 500); else setTimeout(ctx.fin, 700);
        }, 300);
      }
    }
    function toque(b) {
      if (b._g && !b._g.encontrado) marcar(b._g);
      else if (!b._g) { b._err++; ctx.mal(b, b._err, function () { var g = libre(); if (g) ctx.brillar(g.nodos[0]); }); }
    }
    function libre() { return grupos.filter(function (g) { return !g.encontrado; })[0]; }
    pintarFrase();
    return {
      ayuda: function () { var g = libre(); if (g) ctx.brillar(g.nodos[0]); },
      resolverUno: function () { var g = libre(); if (g) marcar(g); }
    };
  };

  /* completar: { items: [{ frase: 'n[igh]t', fichas: ['igh','ie','y'], img, voz }] } */
  TIPOS.completar = function (a, ctx) {
    var ii = 0, blancos = [], k = 0, fichas = [];
    var cuenta = el('p', { class: 'g-contador' }), reto = el('div', { class: 'g-reto' }), pool = el('div', { class: 'g-pool' });
    ctx.zona.appendChild(cuenta); ctx.zona.appendChild(reto); ctx.zona.appendChild(pool);
    function pintarItem() {
      var it = a.items[ii]; reto.innerHTML = ''; pool.innerHTML = ''; blancos = []; k = 0;
      cuenta.textContent = (ii + 1) + ' / ' + a.items.length;
      if (it.img) reto.appendChild(el('span', { class: 'g-img', 'aria-hidden': 'true', text: it.img }));
      var linea = el('div', { class: 'g-linea' });
      it.frase.split(/(\[[^\]]+\])/).forEach(function (pz) {
        if (!pz) return;
        var m = /^\[([^\]]+)\]$/.exec(pz);
        if (m) { var b = el('span', { class: 'g-blanco', 'aria-label': '___' }); b._r = m[1].split('|'); blancos.push(b); linea.appendChild(b); }
        else linea.appendChild(document.createTextNode(pz));
      });
      reto.appendChild(linea);
      if (it.voz || it.decir) {
        var oir = el('button', { class: 'g-icono', 'aria-label': t('escucha'), html: ICO.voz, style: 'margin-top:6px' });
        oir.addEventListener('click', function () { hablar(it.decir || it.voz); });
        reto.appendChild(oir);
      }
      fichas = mezclar(it.fichas).map(function (x) {
        var f = ficha(x); f._x = norm(x); f._err = 0;
        f.addEventListener('click', function () { tomar(f); });
        pool.appendChild(f);
        return f;
      });
      marcarActual();
      if (cfg.leerFichas && it.decir) setTimeout(function () { hablar(it.decir); }, 250);
    }
    function linea() { return reto.querySelector('.g-linea'); }
    function marcarActual() { blancos.forEach(function (b, i) { b.classList.toggle('ahora', i === k); }); }
    function tomar(f) {
      if (blancos[k]._r.indexOf(f._x.t) >= 0) poner(f);
      else { f._err++; ctx.mal(f, f._err, function () { ctx.brillar(correcta()); }); }
    }
    function correcta() { return fichas.filter(function (f) { return !f.disabled && blancos[k]._r.indexOf(f._x.t) >= 0; })[0]; }
    function poner(f) {
      var b = blancos[k]; b.textContent = f._x.t; b.classList.add('lleno'); b.removeAttribute('aria-label');
      f.disabled = true; k++; marcarActual(); ctx.ok();
      if (k === blancos.length) {
        var it = a.items[ii];
        hablar(it.voz || linea().textContent);
        fichas.forEach(function (g) { g.disabled = true; });
        ii++;
        setTimeout(function () { if (ii < a.items.length) pintarItem(); else ctx.fin(); }, 1100);
      }
    }
    pintarItem();
    return {
      ayuda: function () { ctx.brillar(correcta()); },
      resolverUno: function () { var f = correcta(); if (f) poner(f); }
    };
  };

  /* ---------- arranque ---------- */
  G.iniciar = function (c) {
    cfg = c;
    cfg.idioma = cfg.idioma || (cfg.lang.slice(0, 2) === 'es' ? 'es' : 'en');
    document.documentElement.setAttribute('data-tema', cfg.tema || 'y2');
    raiz = document.getElementById('guia');
    try { vozOn = localStorage.getItem('samsan:guia-voz') !== '0'; } catch (e) { vozOn = true; }
    cargar(); cargarVoces();
    if (window.speechSynthesis && 'onvoiceschanged' in speechSynthesis) speechSynthesis.onvoiceschanged = cargarVoces;
    /* entrada directa por #id-mision o #id-mision-N */
    var h = (location.hash || '').slice(1), estado = {};
    cfg.misiones.forEach(function (m, mi) {
      if (h === m.id) estado = { m: mi, p: 0 };
      var mm = new RegExp('^' + m.id + '-(\\d+)$').exec(h);
      if (mm && +mm[1] <= m.actividades.length) estado = { m: mi, p: +mm[1] };
    });
    if (estado.m !== undefined) { try { history.replaceState({}, '', location.pathname); } catch (e) { /* nada */ } ir(estado); }
    else ir({}, true);
  };
  G._TIPOS = TIPOS;
})();
