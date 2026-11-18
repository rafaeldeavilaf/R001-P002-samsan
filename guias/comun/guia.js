/* ============================================================
   SAMSAN — MOTOR DE LAS GUIAS DE ESTUDIO (guias/comun/guia.js)

   Una guia es una lista de misiones (un tema del colegio cada una).
   Cada mision tiene una tarjeta "Aprende" y varias actividades de accion:
     clasificar  llevar cada ficha a su caja
     ordenar     poner las fichas en su orden
     emparejar   unir cada ficha de la izquierda con su pareja
     tocar       tocar en la frase las palabras que se piden (o la que esta mal, para arreglarla)
     completar   llenar los espacios de una frase con fichas
   Las fichas se tocan o se arrastran. No hay opcion multiple ni puntaje
   frente al nino: solo se guarda que actividades se terminaron.

   Variedad (18 nov 2026): cada actividad trae un banco y `muestra` dice
   cuantos salen por vuelta (en clasificar, repartidos por caja); `variantes`
   elige una version al azar (otro cuento, otro ciclo de vida). Al terminar,
   "New round" saca otra tanda. `jefe` arma una mision final con una
   actividad al azar de cada mision (Boss round / repaso final).

   XP (opcional, `xp`): 50 por actividad terminada, sin importar errores ni
   intentos (regla 4 del repo). Niveles e insignias salen de eso.

   Musica de fondo por codigo (WebAudio), sin archivos: estilos `alegre` y
   `synth`. Arranca con el primer toque, baja cuando habla la voz y se apaga
   con su boton (se recuerda).

   Ayuda en tres peldaños (boton de la bombilla, o solo tras dos errores):
     1) la pista escrita  2) brilla una jugada correcta  3) se hace una jugada.

   Marcas en los textos:
     *texto*          resaltado en Aprende; objetivo en `tocar`
     *mal|bien*       en `tocar`: palabra equivocada que se arregla al tocarla
     [respuesta]      en `completar`: un espacio a llenar; [a|b] acepta a o b

   Uso:  GUIA.iniciar({ id, lang, tema, mascota, titulo, subtitulo, saludo, textos, misiones, jefe, xp, musica })
   ============================================================ */
(function () {
  'use strict';
  var G = window.GUIA = {};
  var cfg = null, raiz = null, hechas = {}, vozOn = true, musicaOn = true, voces = [], racha = 0;
  var MENOS_MOV = false;
  try { MENOS_MOV = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* nada */ }

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
  function desordenar(a) {
    if (a.length < 2) return a.slice();
    var b; do { b = mezclar(a); } while (b.every(function (x, i) { return x === a[i]; }));
    return b;
  }
  function copiar(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
  function t(k) { return (cfg.textos && cfg.textos[k]) || TEXTOS[cfg.idioma][k] || TEXTOS.en[k]; }
  var TEXTOS = {
    en: {
      empezar: 'Start here', seguir: 'Keep going', misiones: 'My missions', aprende: "Let's learn!",
      practicar: "Let's practise", siguiente: 'Next', volver: 'Missions', mision_ok: 'Mission complete!',
      todo_ok: 'Play again', ayuda: 'Help', reiniciar: 'Start again from zero',
      confirmar: 'Clear the stars and start again?', primero: 'First, tap a card.', intenta: 'Try again!',
      bravo: ['Great job!', 'Well done!', 'Super!', 'Brilliant!', 'You did it!'], escucha: 'Listen', musica: 'Music',
      atras: 'Back', actividad: 'Activity', de: 'of', aprendido: 'Tap the examples to hear them.',
      pista_def: 'Look again carefully. You can do it!', otra: 'New round', tareas: 'tasks', insignia: 'Badge unlocked',
      nivel: 'Level up!', jefe_intro: 'Questions from every mission, mixed up. A new mix every time!'
    },
    es: {
      empezar: 'Empezar aquí', seguir: 'Continuar', misiones: 'Mis misiones', aprende: '¡Vamos a aprender!',
      practicar: 'A practicar', siguiente: 'Siguiente', volver: 'Misiones', mision_ok: '¡Misión cumplida!',
      todo_ok: 'Jugar otra vez', ayuda: 'Ayuda', reiniciar: 'Empezar de cero',
      confirmar: '¿Borrar las estrellas y empezar de nuevo?', primero: 'Primero toca una ficha.', intenta: '¡Intenta otra vez!',
      bravo: ['¡Muy bien!', '¡Excelente!', '¡Lo lograste!', '¡Genial!', '¡Bravo!'], escucha: 'Escuchar', musica: 'Música',
      atras: 'Atrás', actividad: 'Actividad', de: 'de', aprendido: 'Toca los ejemplos para escucharlos.',
      pista_def: 'Mira otra vez con calma. ¡Tú puedes!', otra: 'Otra ronda', tareas: 'tareas', insignia: 'Insignia nueva',
      nivel: '¡Subiste de nivel!', jefe_intro: 'Preguntas de todas las misiones, mezcladas. ¡Cada vez una mezcla nueva!'
    }
  };

  /* ---------- iconos (trazo, sin emoji) ---------- */
  var ICO = {
    atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    voz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 8.5 Q19 12 16 15.5 M18.5 6 Q23 12 18.5 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    musica: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18 V6 L20 4 V16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="3" fill="currentColor"/><circle cx="17.5" cy="16" r="3" fill="currentColor"/></svg>',
    bombilla: '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path d="M9 18 H15 M10 21 H14 M12 3 A6 6 0 0 0 8 13.5 C9 14.5 9 15.5 9 16 H15 C15 15.5 15 14.5 16 13.5 A6 6 0 0 0 12 3 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    otra: '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path d="M20 12 A8 8 0 1 1 17.7 6.3 M20 4 V8 H16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    estrella: function (llena) {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 L15.1 8.2 L22.4 9 L17 14 L18.5 21.3 L12 17.6 L5.5 21.3 L7 14 L1.6 9 L8.9 8.2 Z" fill="' +
        (llena ? '#FBBF24' : 'var(--estrella-vacia, #FFFFFF)') + '" stroke="var(--linea, #1F2937)" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    },
    /* cubo isometrico con la letra de la mision (tema y6) */
    cubo: function (color, letra) {
      return '<svg class="g-cubo" viewBox="0 0 40 40" aria-hidden="true">' +
        '<polygon points="20,3 37,11.5 20,20 3,11.5" fill="' + color + '"/>' +
        '<polygon points="3,11.5 20,20 20,37 3,28.5" fill="' + color + '" style="filter:brightness(.62)"/>' +
        '<polygon points="20,20 37,11.5 37,28.5 20,37" fill="' + color + '" style="filter:brightness(.38)"/>' +
        '<polygon points="20,3 37,11.5 20,20 3,11.5 M3,11.5 20,20 20,37 3,28.5" fill="none" stroke="#0B1120" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="11.5" y="31" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF" font-family="Nunito, sans-serif">' + esc(letra) + '</text></svg>';
    }
  };

  /* ---------- mascotas (vector plano, por codigo) ---------- */
  var MASCOTAS = {
    /* Pip, el buho de la guia de Maths de Year 2 (canvas del 5 nov 2026). */
    pip: function (etq) {
      return '<svg class="g-mascota" viewBox="0 0 120 124" role="img" aria-label="' + esc(etq) + '">' +
        '<path d="M30 40 L34 14 L50 32 Z" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M90 40 L86 14 L70 32 Z" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<g class="g-ala-d"><ellipse cx="104" cy="58" rx="11" ry="22" transform="rotate(35 104 58)" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5"/></g>' +
        '<ellipse cx="20" cy="80" rx="11" ry="24" transform="rotate(12 20 80)" fill="#2F6FA8" stroke="#1F2937" stroke-width="2.5"/>' +
        '<ellipse cx="60" cy="70" rx="42" ry="44" fill="#4A90D9" stroke="#1F2937" stroke-width="2.5"/>' +
        '<ellipse cx="60" cy="90" rx="25" ry="20" fill="#CFE6FA"/>' +
        '<path d="M48 84 Q52 89 56 84 M64 84 Q68 89 72 84 M56 96 Q60 101 64 96" fill="none" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="44" cy="56" r="15" fill="#FFFFFF" stroke="#1F2937" stroke-width="2.5"/><circle cx="76" cy="56" r="15" fill="#FFFFFF" stroke="#1F2937" stroke-width="2.5"/>' +
        '<g class="g-ojos"><circle cx="46" cy="58" r="7" fill="#1F2937"/><circle cx="48" cy="55" r="2.5" fill="#FFFFFF"/>' +
        '<circle cx="78" cy="58" r="7" fill="#1F2937"/><circle cx="80" cy="55" r="2.5" fill="#FFFFFF"/></g>' +
        '<path d="M54 68 L66 68 L60 78 Z" fill="#F59E0B" stroke="#1F2937" stroke-width="2" stroke-linejoin="round"/>' +
        '<ellipse cx="48" cy="114" rx="8" ry="4" fill="#F59E0B" stroke="#1F2937" stroke-width="2"/><ellipse cx="72" cy="114" rx="8" ry="4" fill="#F59E0B" stroke="#1F2937" stroke-width="2"/>' +
        '</svg>';
    },
    /* Z1P, el dron cubo de Year 6 (18 nov 2026). Diseño propio, sin
       elementos de juegos comerciales. */
    z1p: function (etq) {
      var k = '#0B1120';
      return '<svg class="g-mascota g-dron" viewBox="0 0 140 140" role="img" aria-label="' + esc(etq) + '">' +
        '<ellipse class="g-propulsor" cx="70" cy="128" rx="28" ry="6" fill="#22D3EE" opacity=".35"/>' +
        '<g class="g-cuerpo">' +
        '<line x1="70" y1="40" x2="70" y2="10" stroke="' + k + '" stroke-width="6"/><line x1="70" y1="40" x2="70" y2="10" stroke="#94A3B8" stroke-width="3"/>' +
        '<circle class="g-antena" cx="70" cy="9" r="6" fill="#A3E635" stroke="' + k + '" stroke-width="2.5"/>' +
        '<polygon points="70,20 110,40 70,60 30,40" fill="#CBD5E1" stroke="' + k + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<polygon points="30,40 70,60 70,108 30,88" fill="#94A3B8" stroke="' + k + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<polygon points="70,60 110,40 110,88 70,108" fill="#64748B" stroke="' + k + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<polygon points="36,52 64,66 64,92 36,78" fill="' + k + '"/>' +
        '<g class="g-ojos"><polygon points="41,62 49,66 49,75 41,71" fill="#22D3EE"/><polygon points="53,68 61,72 61,81 53,77" fill="#22D3EE"/></g>' +
        '<line x1="80" y1="62" x2="100" y2="52" stroke="#475569" stroke-width="3"/><line x1="80" y1="70" x2="100" y2="60" stroke="#475569" stroke-width="3"/><line x1="80" y1="78" x2="100" y2="68" stroke="#475569" stroke-width="3"/>' +
        '<circle cx="92" cy="86" r="3.5" fill="#A3E635"/>' +
        '<polygon points="20,52 30,57 30,72 20,67" fill="#334155" stroke="' + k + '" stroke-width="2"/>' +
        '<polygon points="110,57 120,52 120,67 110,72" fill="#334155" stroke="' + k + '" stroke-width="2"/>' +
        '</g></svg>';
    }
  };
  /* Traje: cambia los colores base de la mascota (modo juego, se desbloquean con gemas). */
  var pielActual = null;
  function vestir(s, piel) {
    if (!piel || !piel.colores) return s;
    Object.keys(piel.colores).forEach(function (de) { s = s.split(de).join(piel.colores[de]); });
    return s;
  }
  function mascota(chica, piel) {
    var s = vestir(MASCOTAS[cfg.mascota](cfg.mascotaNombre || ''), piel || pielActual);
    return chica ? s.replace('class="g-mascota', 'class="g-mascota g-mascota--chica') : s;
  }

  /* ---------- audio: efectos y musica (WebAudio, sin archivos) ---------- */
  var ac = null;
  function audio() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended' && ac.resume) ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function tono(f, t0, dur, vol, tipo, destino) {
    var c = audio(); if (!c) return;
    try {
      var o = c.createOscillator(), g = c.createGain(), ti = c.currentTime + t0;
      o.type = tipo || 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.08, ti); g.gain.exponentialRampToValueAtTime(0.0001, ti + dur);
      o.connect(g); g.connect(destino || c.destination); o.start(ti); o.stop(ti + dur + 0.02);
    } catch (e) { /* sin audio */ }
  }
  function sonido(tipo) {
    var r = 1 + Math.min(racha, 8) * 0.06;
    if (tipo === 'ok') { tono(660 * r, 0, 0.12); tono(880 * r, 0.07, 0.16); }
    else if (tipo === 'mal') { tono(240, 0, 0.16, 0.06); }
    else if (tipo === 'fin') { [523, 659, 784, 1047].forEach(function (f, i) { tono(f, i * 0.1, 0.22); }); }
    else if (tipo === 'nivel') { [523, 784, 1047, 1319, 1568].forEach(function (f, i) { tono(f, i * 0.08, 0.25, 0.07, 'square'); }); }
    else if (tipo === 'toc') { tono(520, 0, 0.05, 0.04); }
  }

  var Musica = (function () {
    var master = null, timer = null, paso = 0, prox = 0, est = null, sonando = false, ruidos = new WeakMap();
    var VOL = 0.32, VOL_BAJO = 0.08;
    var mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
    /* Cada voz recibe el contexto (c) y el destino (d): asi la misma partitura
       suena en vivo y se mide en un OfflineAudioContext (prueba de volumen). */
    function nota(c, d, m, t0, dur, vol, tipo, corte) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = tipo; o.frequency.value = mtof(m);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      if (corte) { var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = corte; o.connect(f); f.connect(g); }
      else o.connect(g);
      g.connect(d); o.start(t0); o.stop(t0 + dur + 0.05);
    }
    function ruido(c) {
      if (!ruidos.has(c)) { var b = c.createBuffer(1, Math.floor(c.sampleRate * 0.1), c.sampleRate), x = b.getChannelData(0); for (var i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; ruidos.set(c, b); }
      return ruidos.get(c);
    }
    function golpe(c, d, t0, vol, filtro, frec, dur) {
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = ruido(c); f.type = filtro; f.frequency.value = frec;
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(d); s.start(t0); s.stop(t0 + dur + 0.02);
    }
    /* Bombo con "clic" en frecuencias medias: el golpe grave no suena en un
       parlante de telefono (menos de ~200 Hz), el clic si. */
    function bombo(c, d, t0) {
      var o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(70, t0 + 0.12);
      g.gain.setValueAtTime(0.35, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.connect(g); g.connect(d); o.start(t0); o.stop(t0 + 0.2);
      golpe(c, d, t0, 0.12, 'bandpass', 1800, 0.03);
    }
    var ESTILOS = {
      /* Year 2: alegre, en Do mayor (C G Am F), corcheas */
      alegre: {
        bpm: 112, acordes: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
        melodia: [72, -1, 74, 76, -1, 74, 72, -1, 71, -1, 72, 74, -1, -1, 71, -1, 72, -1, 76, -1, 79, 76, -1, 74, 72, -1, 69, 72, -1, -1, -1, -1],
        tocar: function (c, d, t0, p, ch, dt) {
          var i = p % 8;
          if (i === 0 || i === 4) nota(c, d, ch[0] - 24, t0, dt * 1.8, 0.16, 'sine');
          nota(c, d, ch[[0, 1, 2, 1, 0, 1, 2, 1][i]] + 12, t0, dt * 0.9, 0.035, 'triangle');
          var m = this.melodia[p % 32]; if (m > 0) nota(c, d, m, t0, dt * 1.6, 0.05, 'sine');
        }
      },
      /* Year 6: synth de videojuego en La menor (Am F C G). Todo lo que tiene
         que oirse vive por encima de 200 Hz: bajo una octava arriba con brillo,
         arpegio y melodia en la zona media, platillo y clic del bombo. */
      synth: {
        bpm: 104, acordes: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
        melodia: [76, -1, -1, 74, 72, -1, 71, -1, 72, -1, -1, 69, 67, -1, 69, -1, 67, -1, -1, 64, 67, -1, 72, -1, 71, -1, 74, -1, 71, -1, -1, -1],
        tocar: function (c, d, t0, p, ch, dt) {
          var i = p % 8;
          if (i === 0 || i === 4) bombo(c, d, t0);
          if (i % 2 === 1) golpe(c, d, t0, 0.07, 'highpass', 6500, 0.04);
          if ([0, 3, 4, 6].indexOf(i) >= 0) nota(c, d, ch[0] - 12, t0, dt * 0.85, 0.09, 'sawtooth', 1400);
          if (i === 0) ch.forEach(function (m) { nota(c, d, m, t0, dt * 7.5, 0.022, 'triangle'); });
          nota(c, d, ch[[0, 1, 2, 1][p % 4]] + 12, t0, dt * 0.6, 0.035, 'square', 2600);
          var m = this.melodia[p % 32]; if (m > 0) nota(c, d, m, t0, dt * 1.8, 0.05, 'triangle');
        }
      }
    };
    function programar() {
      var dt = 60 / est.bpm / 2;
      while (prox < ac.currentTime + 0.15) {
        var ch = est.acordes[Math.floor(paso / 8) % est.acordes.length];
        try { est.tocar(ac, master, prox, paso, ch, dt); } catch (e) { /* nada */ }
        prox += dt; paso++;
      }
    }
    /* iPhone con el interruptor de silencio: un <audio> local en bucle (silencio,
       data: URI, nada sale del navegador) pone la sesion en modo reproduccion. */
    var mudo = null;
    function desbloquear() {
      try {
        if (!mudo) { mudo = new Audio('data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='); mudo.loop = true; mudo.setAttribute('playsinline', ''); }
        var pr = mudo.play(); if (pr && pr.catch) pr.catch(function () { /* nada */ });
      } catch (e) { /* nada */ }
    }
    function empezar() {
      if (sonando && ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) { /* nada */ } }
      if (sonando || !musicaOn || !cfg || !cfg.musica || document.hidden) return;
      desbloquear();
      /* iPhone: con el interruptor de silencio, Web Audio calla salvo que la
         sesion de audio sea de reproduccion (Safari 17+). */
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* nada */ }
      if (!audio()) return;
      try {
        est = ESTILOS[cfg.musica]; if (!est) return;
        if (!master) { master = ac.createGain(); master.gain.value = VOL; master.connect(ac.destination); }
        prox = ac.currentTime + 0.1; sonando = true;
        timer = setInterval(programar, 30);
      } catch (e) { sonando = false; }
    }
    function parar() { if (timer) clearInterval(timer); timer = null; sonando = false; try { if (mudo) mudo.pause(); } catch (e) { /* nada */ } }
    var bajo = false;
    function bajar(si) { bajo = si; try { if (master) master.gain.setTargetAtTime(si ? VOL_BAJO : VOL, ac.currentTime, 0.12); } catch (e) { /* nada */ } }
    /* Prueba: renderiza la partitura sin sonar y mide energia total y audible en telefono. */
    function medir(estilo, segundos) {
      var sr = 44100, c = new OfflineAudioContext(1, sr * segundos, sr), g = c.createGain();
      g.gain.value = VOL; g.connect(c.destination);
      var e = ESTILOS[estilo], dt = 60 / e.bpm / 2, tt = 0.05, pp = 0;
      while (tt < segundos - 0.3) { e.tocar(c, g, tt, pp, e.acordes[Math.floor(pp / 8) % e.acordes.length], dt); tt += dt; pp++; }
      /* filtro paso alto a 300 Hz en paralelo: lo que un parlante de telefono reproduce */
      return c.startRendering().then(function (buf) {
        var x = buf.getChannelData(0), n = x.length, tot = 0, alto = 0, y = 0, prev = 0, a = 1 / (1 + 2 * Math.PI * 300 / sr);
        for (var i = 0; i < n; i++) { tot += x[i] * x[i]; y = a * (y + x[i] - prev); prev = x[i]; alto += y * y; }
        return { rms: Math.sqrt(tot / n), rmsTelefono: Math.sqrt(alto / n) };
      });
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else empezar(); });
    return { empezar: empezar, parar: parar, bajar: bajar, medir: medir, estado: function () { return { sonando: sonando, on: musicaOn, bajo: bajo, ctx: ac ? ac.state : 'none' }; } };
  })();

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
  /* op (opcional, modo aldea): { lento: palabra despacio como pista, cola: no corta lo que se esta diciendo } */
  function hablar(texto, op) {
    if (!vozOn || !window.speechSynthesis || !texto) return;
    op = op || {};
    try {
      if (!op.cola) speechSynthesis.cancel();
      var limpio = plano(texto).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/_+/g, ' ').trim();
      if (!limpio) return;
      if (!voces.length) cargarVoces();
      var v = mejorVoz();
      if (!v) return;   /* sin voz local no habla: queda el texto (regla 2) */
      var u = new SpeechSynthesisUtterance(limpio);
      u.voice = v; u.lang = v.lang;
      u.rate = op.lento ? 0.55 : (cfg.velocidad || 0.9);
      u.onstart = function () { Musica.bajar(true); };
      u.onend = u.onerror = function () { Musica.bajar(false); };
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
  function completa(mi) { return nHechas(mi) === cfg.misiones[mi].actividades.length; }
  function siguienteMision() {
    for (var i = 0; i < cfg.misiones.length; i++) if (!completa(i)) return i;
    return -1;
  }
  /* XP: 50 por actividad terminada (no por aciertos). */
  var XP_ACT = 50;
  function xpTotal() {
    var n = 0;
    cfg.misiones.forEach(function (m, mi) { n += nHechas(mi); });
    return n * XP_ACT;
  }
  function nivel(xp) {
    var ns = cfg.xp.niveles, i = 0;
    while (i + 1 < ns.length && xp >= ns[i + 1][0]) i++;
    return { i: i, nombre: ns[i][1], desde: ns[i][0], hasta: ns[i + 1] ? ns[i + 1][0] : null };
  }

  /* ---------- variedad: banco, muestra y variantes ---------- */
  function preparar(a0, chica) {
    var a = copiar(a0);
    if (a.variantes) {
      var v = a.variantes[Math.floor(Math.random() * a.variantes.length)];
      Object.keys(v).forEach(function (k) { a[k] = v[k]; });
    }
    var n = chica ? (a.muestraJefe || Math.min(a.muestra || 99, 4)) : a.muestra;
    if (a.tipo === 'clasificar') {
      var porCaja = n ? Math.max(1, Math.floor(n / a.cajas.length)) : 99, elegidos = [];
      a.cajas.forEach(function (c) { elegidos = elegidos.concat(mezclar(a.items.filter(function (x) { return x.caja === c.id; })).slice(0, porCaja)); });
      a.items = elegidos;
    }
    else if (a.tipo === 'emparejar' && n) a.pares = mezclar(a.pares).slice(0, n);
    else if (a.tipo === 'tocar') a.frases = mezclar(a.frases).slice(0, n || a.frases.length);
    else if (a.tipo === 'completar') a.items = mezclar(a.items).slice(0, n || a.items.length);
    return a;
  }
  /* Mision final: una actividad al azar de cada mision, con muestra corta. */
  function armarJefe() {
    if (!cfg.jefe) return;
    var acts = mezclar(cfg.misiones.slice()).slice(0, cfg.jefe.max || 6).map(function (m) {
      var a = copiar(m.actividades[Math.floor(Math.random() * m.actividades.length)]);
      a.deMision = m.titulo; a.jefe = true;
      return a;
    });
    cfg.misiones.push({
      id: 'boss', jefe: true, letra: cfg.jefe.letra || '★', titulo: cfg.jefe.titulo, sub: cfg.jefe.sub,
      color: cfg.jefe.color, claro: cfg.jefe.claro, insignia: cfg.jefe.insignia, globo: cfg.jefe.globo,
      aprende: [{ h: cfg.jefe.titulo, p: t('jefe_intro') }], actividades: acts
    });
  }

  /* ---------- navegacion con el boton Atras del telefono ---------- */
  function ir(estado, reemplazar) {
    var h = cfg.modo === 'aldea' ? AL.hash(estado) : cfg.modo === 'juego' ? J.hash(estado) : (estado.m === undefined ? '' : (cfg.misiones[estado.m].id + (estado.p ? '-' + estado.p : '')));
    try { history[reemplazar ? 'replaceState' : 'pushState'](estado, '', '#' + h); } catch (e) { /* file:// sin historial */ }
    pintar(estado);
  }
  window.addEventListener('popstate', function (ev) { if (cfg) pintar(ev.state || (cfg.modo === 'aldea' ? AL.desdeHash(location.hash.slice(1)) : {})); });

  function barra(titulo, sub, alVolver) {
    var b = el('header', { class: 'g-barra' });
    if (alVolver) b.appendChild(el('button', { class: 'g-icono', 'aria-label': t('atras'), html: ICO.atras, onclick: alVolver }));
    b.appendChild(el('h1', { html: esc(titulo) + (sub ? '<small>' + esc(sub) + '</small>' : '') }));
    if (cfg.musica) {
      var bm = el('button', { class: 'g-icono g-btn-musica', 'aria-label': t('musica'), 'aria-pressed': String(musicaOn), html: ICO.musica });
      bm.addEventListener('click', function () {
        /* Encendida pero aun sin sonar (falta el primer toque): este toque la arranca, no la apaga. */
        if (musicaOn && !Musica.estado().sonando) { Musica.empezar(); return; }
        musicaOn = !musicaOn; bm.setAttribute('aria-pressed', String(musicaOn));
        try { localStorage.setItem('samsan:guia-musica-' + cfg.id, musicaOn ? '1' : '0'); } catch (e) { /* nada */ }
        if (musicaOn) Musica.empezar(); else Musica.parar();
      });
      b.appendChild(bm);
    }
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
    if (cfg.modo === 'aldea') AL.pintar(estado);
    else if (cfg.modo === 'juego') J.pintar(estado);
    else if (estado.m === undefined) portada();
    else mision(estado.m, estado.p || 0);
    try { window.scrollTo(0, 0); } catch (e) { /* nada */ }
  }

  function barraXP() {
    var xp = xpTotal(), nv = nivel(xp);
    var pct = nv.hasta ? Math.round((xp - nv.desde) / (nv.hasta - nv.desde) * 100) : 100;
    var c = el('div', { class: 'g-xp' });
    c.appendChild(el('div', { class: 'g-xp__fila', html: '<span>LVL ' + (nv.i + 1) + ' · ' + esc(nv.nombre) + '</span><b>' + xp + (nv.hasta ? ' / ' + nv.hasta : '') + ' XP</b>' }));
    c.appendChild(el('div', { class: 'g-xp__barra', role: 'img', 'aria-label': xp + ' XP', html: '<i style="width:' + pct + '%"></i>' }));
    return c;
  }

  function portada() {
    var s = el('section', { class: 'g-portada' });
    s.appendChild(barra(cfg.titulo, cfg.subtitulo));
    var hola = el('div', { class: 'g-hola', html: mascota() });
    hola.appendChild(el('p', { class: 'g-globo', html: marcas(cfg.saludo) }));
    hola.addEventListener('click', function () { hablar(cfg.saludo); });
    s.appendChild(hola);
    if (cfg.xp) s.appendChild(barraXP());
    var sig = siguienteMision();
    var hayAvance = Object.keys(hechas).length > 0;
    var play = el('button', { id: 'play', class: 'g-btn g-btn--grande', html: '▶ ' + esc(sig < 0 ? t('todo_ok') + ' · ' + cfg.misiones[cfg.misiones.length - 1].titulo : (hayAvance ? t('seguir') : t('empezar')) + ' · ' + cfg.misiones[sig].titulo) });
    play.addEventListener('click', function () { ir({ m: sig >= 0 ? sig : cfg.misiones.length - 1, p: 0 }); });
    s.appendChild(play);
    s.appendChild(el('h2', { class: 'g-seccion', text: t('misiones') }));
    var ol = el('ol', { class: 'g-misiones' });
    cfg.misiones.forEach(function (m, mi) {
      var b = el('button', { class: 'g-mision' + (m.jefe ? ' g-mision--jefe' : '') });
      colorear(b, m);
      var letra = m.letra || String.fromCharCode(65 + mi);
      b.appendChild(cfg.xp ? el('span', { html: ICO.cubo(m.color, letra) }) : el('span', { class: 'g-letra', text: letra, 'aria-hidden': 'true' }));
      var sub = m.sub || '';
      if (cfg.xp) sub = (nHechas(mi) ? nHechas(mi) + ' ' + t('de') + ' ' : '') + m.actividades.length + ' ' + t('tareas') + ' · +' + m.actividades.length * XP_ACT + ' XP';
      b.appendChild(el('span', { class: 'g-mision__txt', html: esc(m.titulo) + (sub ? '<small>' + esc(sub) + '</small>' : '') }));
      if (cfg.xp) {
        var n = nHechas(mi), tot = m.actividades.length;
        b.appendChild(el('span', { class: 'g-tag' + (n === tot ? ' g-tag--ok' : ''), text: n === tot ? (cfg.textos.limpia || 'CLEARED') : (m.jefe ? 'BOSS' : (n ? '+' + n * XP_ACT + ' XP' : 'NEW')) }));
      } else b.appendChild(estrellas(mi));
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
    var sub = p === 0 ? t('aprende') : t('actividad') + ' ' + p + ' ' + t('de') + ' ' + m.actividades.length;
    if (p > 0 && m.actividades[p - 1].deMision) sub += ' · ' + m.actividades[p - 1].deMision;
    s.appendChild(barra(m.titulo, sub, function () { ir({}); }));
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
    if (!m.jefe) s.appendChild(el('p', { class: 'g-contador', text: t('aprendido'), style: 'text-align:center' }));
    var go = el('button', { class: 'g-btn g-btn--grande', text: t('practicar') + ' ▶' });
    go.addEventListener('click', function () { ir({ m: mi, p: 1 }); });
    s.appendChild(go);
    if (cfg.vozAuto) setTimeout(function () { hablar(m.globo || ''); }, 300);
  }

  /* ---------- efectos: vuelo de la ficha y chispas ---------- */
  function centro(n) { var r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r }; }
  function volar(desde, hasta) {
    if (MENOS_MOV || !desde || !hasta) return;
    try {
      var a = centro(desde), b = centro(hasta);
      if (!a.r.width) return;
      var c = desde.cloneNode(true);
      c.classList.add('g-vuelo'); c.removeAttribute('id');
      c.style.left = a.r.left + 'px'; c.style.top = a.r.top + 'px'; c.style.width = a.r.width + 'px';
      document.body.appendChild(c);
      requestAnimationFrame(function () {
        c.style.transform = 'translate(' + (b.x - a.x) + 'px,' + (b.y - a.y) + 'px) scale(.55)'; c.style.opacity = '0.2';
      });
      setTimeout(function () { c.remove(); }, 420);
    } catch (e) { /* nada */ }
  }
  function chispas(n) {
    if (MENOS_MOV || !n) return;
    try {
      var p = centro(n); if (!p.r.width) return;
      for (var i = 0; i < 10; i++) {
        var ang = (i / 10) * Math.PI * 2, d = 26 + Math.random() * 22;
        var s = el('span', { class: 'g-chispa', 'aria-hidden': 'true' });
        s.style.left = p.x + 'px'; s.style.top = p.y + 'px';
        s.style.setProperty('--dx', Math.cos(ang) * d + 'px'); s.style.setProperty('--dy', Math.sin(ang) * d + 'px');
        document.body.appendChild(s);
        setTimeout(function (x) { return function () { x.remove(); }; }(s), 650);
      }
    } catch (e) { /* nada */ }
  }

  /* ---------- arrastrar y soltar (ademas de tocar) ---------- */
  function arrastrable(f, alSoltar) {
    var ini = null, fant = null, movio = false, sobre = null;
    f.classList.add('g-arrastra');
    f.addEventListener('click', function (e) { if (f._sinClick) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    function destinoEn(x, y) {
      var bajo = document.elementFromPoint && document.elementFromPoint(x, y);
      return bajo && bajo.closest ? bajo.closest('[data-destino]') : null;
    }
    /* el movimiento se sigue en la ventana: el dedo sale de la ficha enseguida */
    function mover(e) {
      if (!ini || e.pointerId !== ini.id) return;
      if (!movio && Math.abs(e.clientX - ini.x) + Math.abs(e.clientY - ini.y) < 12) return;
      if (!movio) {
        movio = true;
        var r = f.getBoundingClientRect();
        fant = f.cloneNode(true); fant.classList.add('g-fantasma'); fant.removeAttribute('id');
        fant.style.width = r.width + 'px'; fant._dx = ini.x - r.left; fant._dy = ini.y - r.top;
        document.body.appendChild(fant); f.classList.add('g-origen');
      }
      if (e.cancelable) e.preventDefault();
      fant.style.left = (e.clientX - fant._dx) + 'px'; fant.style.top = (e.clientY - fant._dy) + 'px';
      var d = destinoEn(e.clientX, e.clientY);
      if (d !== sobre) { if (sobre) sobre.classList.remove('g-sobre'); sobre = d; if (sobre) sobre.classList.add('g-sobre'); }
    }
    function soltarAqui(e) { if (ini && e.pointerId === ini.id) fin(e, true); }
    function cancelar(e) { if (ini && e.pointerId === ini.id) fin(e, false); }
    function quitar() {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltarAqui);
      window.removeEventListener('pointercancel', cancelar);
    }
    f.addEventListener('pointerdown', function (e) {
      if (f.disabled || (e.button && e.button > 0)) return;
      ini = { x: e.clientX, y: e.clientY, id: e.pointerId }; movio = false;
      window.addEventListener('pointermove', mover, { passive: false });
      window.addEventListener('pointerup', soltarAqui);
      window.addEventListener('pointercancel', cancelar);
    });
    function fin(e, soltar) {
      quitar();
      if (!ini) return;
      var era = movio; ini = null; movio = false;
      if (!era) return;
      if (fant) fant.remove(); fant = null; f.classList.remove('g-origen');
      if (sobre) sobre.classList.remove('g-sobre'); sobre = null;
      f._sinClick = true; setTimeout(function () { f._sinClick = false; }, 60);
      var d = soltar ? destinoEn(e.clientX, e.clientY) : null;
      if (d) alSoltar(d);
    }
  }

  /* ---------- actividad: marco comun ---------- */
  function actividad(s, mi, ai) {
    var m = cfg.misiones[mi], a = preparar(m.actividades[ai], !!m.jefe);
    racha = 0;
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
        racha = 0; sonido('mal');
        if (nodo) { nodo.classList.remove('sacude'); void nodo.offsetWidth; nodo.classList.add('sacude'); }
        pista.textContent = intentos >= 2 ? (a.pista || t('pista_def')) : t('intenta');
        if (intentos >= 2 && alBrillar) alBrillar();
      },
      ok: function (nodo) { sonido('ok'); racha++; chispas(nodo); pista.textContent = ''; peldano = 0; },
      brillar: function (nodo) { if (!nodo) return; nodo.classList.remove('brilla'); void nodo.offsetWidth; nodo.classList.add('brilla'); try { nodo.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* nada */ } },
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
    var antes = cfg.xp ? nivel(xpTotal()).i : 0, nueva = !hechas[idAct(mi, ai)], estabaCompleta = completa(mi);
    hechas[idAct(mi, ai)] = 1; guardar();
    var subio = cfg.xp && nivel(xpTotal()).i > antes;
    sonido(subio ? 'nivel' : 'fin');
    var ultima = ai === m.actividades.length - 1;
    var bravo = t('bravo')[Math.floor(Math.random() * t('bravo').length)];
    var capa = el('div', { class: 'g-capa', role: 'dialog', 'aria-modal': 'true', 'aria-label': bravo });
    var box = el('div', { class: 'g-logro', html: mascota() });
    $('.g-mascota', box).classList.add('salta');
    box.appendChild(el('h3', { text: ultima && completa(mi) ? t('mision_ok') : bravo }));
    if (cfg.xp) {
      box.appendChild(el('p', { class: 'g-xp-gana', text: nueva ? '+' + XP_ACT + ' XP' : '✓' }));
      if (subio) box.appendChild(el('p', { class: 'g-subio', text: t('nivel') + ' LVL ' + (nivel(xpTotal()).i + 1) + ' · ' + nivel(xpTotal()).nombre }));
      if (!estabaCompleta && completa(mi) && m.insignia) box.appendChild(el('p', { class: 'g-insignia', html: '<small>' + esc(t('insignia')) + '</small>' + esc(m.insignia) }));
      box.appendChild(barraXP());
    } else {
      box.appendChild(el('div', { class: 'g-estrellas', html: ICO.estrella(true) + ICO.estrella(true) + ICO.estrella(true), style: 'justify-content:center;display:flex' }));
    }
    var sig = el('button', { class: 'g-btn', text: (ultima ? t('volver') : t('siguiente')) + ' ▶' });
    sig.addEventListener('click', function () { capa.remove(); if (ultima) ir({}); else ir({ m: mi, p: ai + 2 }); });
    box.appendChild(sig);
    box.appendChild(el('button', { class: 'g-btn g-btn--suave', html: ICO.otra + ' ' + esc(t('otra')), onclick: function () { capa.remove(); ir({ m: mi, p: ai + 1 }, true); } }));
    capa.appendChild(box);
    document.body.appendChild(capa);
    hablar(ultima && completa(mi) ? t('mision_ok') : bravo);
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

  /* clasificar: { cajas: [{id, t, sub}], items: [{t, caja, img}], muestra } */
  TIPOS.clasificar = function (a, ctx) {
    var sel = null, quedan = a.items.length;
    var pool = el('div', { class: 'g-pool' }), cajas = el('div', { class: 'g-cajas' });
    var porCaja = {};
    a.cajas.forEach(function (c) {
      var b = el('button', { class: 'g-caja', 'data-destino': c.id, html: '<span class="g-caja__nombre">' + esc(c.t) + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') + '</span>' });
      var dentro = el('span', { class: 'g-dentro' }); b.appendChild(dentro);
      porCaja[c.id] = { boton: b, dentro: dentro };
      b.addEventListener('click', function () { soltar(c.id); });
      cajas.appendChild(b);
    });
    function elegir(f) {
      if (sel) sel.setAttribute('aria-pressed', 'false');
      sel = sel === f ? null : f;
      if (sel) { sel.setAttribute('aria-pressed', 'true'); sonido('toc'); if (cfg.leerFichas) hablar(f._x.voz || f._x.t); }
    }
    var fichas = mezclar(a.items.map(norm)).map(function (x) {
      var f = ficha(x); f._x = x; f._err = 0;
      f.addEventListener('click', function () { elegir(f); });
      arrastrable(f, function (d) { if (sel !== f) elegir(f); soltar(d.getAttribute('data-destino')); });
      pool.appendChild(f);
      return f;
    });
    function colocar(f) {
      var c = porCaja[f._x.caja];
      volar(f, c.boton);
      var chip = el('span', { class: 'g-chip', text: f._x.t });
      c.dentro.appendChild(chip);
      f.remove(); quedan--; if (sel === f) sel = null;
      ctx.ok(c.boton);
      if (!quedan) { pool.classList.add('g-pool--vacia'); setTimeout(ctx.fin, 550); }
    }
    function soltar(id) {
      if (!sel) { ctx.decir(t('primero')); return; }
      if (sel._x.caja === id) colocar(sel);
      else { var f = sel; f._err++; ctx.mal(porCaja[id].boton, f._err, function () { ctx.brillar(porCaja[f._x.caja].boton); }); }
    }
    ctx.zona.appendChild(pool); ctx.zona.appendChild(cajas);
    function primera() { return sel && sel.isConnected ? sel : fichas.filter(function (f) { return f.isConnected; })[0]; }
    return {
      ayuda: function () { var f = primera(); if (!f) return; if (sel !== f) elegir(f); ctx.brillar(porCaja[f._x.caja].boton); },
      resolverUno: function () { var f = primera(); if (f) colocar(f); }
    };
  };

  /* ordenar: { items: [{t, img}] en el orden correcto, final, variantes } */
  TIPOS.ordenar = function (a, ctx) {
    var items = a.items.map(norm), n = 0;
    var ol = el('ol', { class: 'g-huecos', 'data-destino': 'lista' }), pool = el('div', { class: 'g-pool' });
    if (a.titulo) ctx.zona.appendChild(el('h3', { class: 'g-sub-titulo', text: a.titulo }));
    var huecos = items.map(function (x, i) {
      var h = el('li', { class: 'g-hueco', html: '<span class="g-hueco__n">' + (i + 1) + '</span><span class="g-hueco__t"></span>' });
      ol.appendChild(h);
      return h;
    });
    function probar(f) {
      if (f._x === items[n]) poner(f);
      else { f._err++; ctx.mal(f, f._err, function () { ctx.brillar(fichaDe(items[n])); }); }
    }
    var fichas = desordenar(items).map(function (x) {
      var f = ficha(x); f._x = x; f._err = 0;
      f.addEventListener('click', function () { probar(f); });
      arrastrable(f, function () { probar(f); });
      pool.appendChild(f);
      return f;
    });
    function fichaDe(x) { return fichas.filter(function (f) { return f._x === x; })[0]; }
    function poner(f) {
      var h = huecos[n];
      volar(f, h);
      $('.g-hueco__t', h).innerHTML = (f._x.img ? '<span class="g-img" aria-hidden="true">' + f._x.img + '</span> ' : '') + esc(f._x.t);
      h.classList.add('lleno'); f.remove(); n++;
      ctx.ok(h); if (cfg.leerFichas) hablar(f._x.voz || f._x.t);
      if (n === items.length) { pool.classList.add('g-pool--vacia'); setTimeout(ctx.fin, 700); }
    }
    ctx.zona.appendChild(pool); ctx.zona.appendChild(ol);
    if (a.final) ctx.zona.appendChild(el('p', { class: 'g-flecha', text: a.final }));
    return {
      ayuda: function () { ctx.brillar(fichaDe(items[n])); },
      resolverUno: function () { var f = fichaDe(items[n]); if (f) poner(f); }
    };
  };

  /* emparejar: { pares: [[izq, der], ...], titulos, largo, muestra, variantes } */
  TIPOS.emparejar = function (a, ctx) {
    var sel = null, quedan = a.pares.length, num = 0;
    var cont = el('div', { class: 'g-pares' + (a.largo ? ' g-pares--largo' : '') });
    var ci = el('div', { class: 'g-col' }), cd = el('div', { class: 'g-col' });
    if (a.titulos) { ci.appendChild(el('h4', { text: a.titulos[0] })); cd.appendChild(el('h4', { text: a.titulos[1] })); }
    cont.appendChild(ci); cont.appendChild(cd);
    var todas = [];
    function crear(x, lado, i) {
      var f = ficha(x); f._lado = lado; f._i = i; f._err = 0; f._x = norm(x);
      f.setAttribute('data-destino', lado + '-' + i);
      f.addEventListener('click', function () { tocar(f); });
      arrastrable(f, function (d) {
        var g = todas.filter(function (h) { return h === d; })[0];
        if (!g || g._lado === f._lado) return;
        if (sel !== f) { if (sel) sel.setAttribute('aria-pressed', 'false'); sel = f; f.setAttribute('aria-pressed', 'true'); }
        tocar(g);
      });
      todas.push(f);
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
        g.classList.add('par'); g.setAttribute('aria-pressed', 'false'); g.disabled = true; g.removeAttribute('data-destino');
        g.appendChild(el('span', { class: 'g-num', text: String(num), 'aria-hidden': 'true' }));
      });
      sel = null; quedan--; ctx.ok(y);
      if (!quedan) setTimeout(ctx.fin, 600);
    }
    ctx.zona.appendChild(cont);
    function libre() { return sel || izq.filter(function (g) { return !g.classList.contains('par'); })[0]; }
    return {
      ayuda: function () { var f = libre(); if (!f) return; if (sel !== f) tocar(f); ctx.brillar(pareja(f)); },
      resolverUno: function () { var f = libre(); if (f) unir(f, pareja(f)); }
    };
  };

  /* tocar: { frases: ['The *night* is *bright*.', 'The dogs *barks|bark*.'], muestra } */
  var PALABRA = /([A-Za-zÀ-ÖØ-öø-ÿ0-9'’°-]+)/;
  TIPOS.tocar = function (a, ctx) {
    var fi = 0, grupos = [];
    var cuenta = el('p', { class: 'g-contador' }), caja = el('div', { class: 'g-frase' });
    ctx.zona.appendChild(cuenta); ctx.zona.appendChild(caja);
    function pintarFrase() {
      caja.innerHTML = ''; grupos = [];
      cuenta.textContent = (fi + 1) + ' / ' + a.frases.length;
      a.frases[fi].split(/(\*[^*]+\*)/).forEach(function (parte) {
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
            caja.appendChild(b);
          } else caja.appendChild(document.createTextNode(pz));
        });
      });
    }
    function marcar(g) {
      g.encontrado = true;
      if (g.bien) { g.nodos[0].textContent = g.bien; for (var i = 1; i < g.nodos.length; i++) g.nodos[i].remove(); g.nodos[0].classList.add('arreglada'); }
      g.nodos.forEach(function (n) { n.classList.add('ok'); n.disabled = true; });
      ctx.ok(g.nodos[0]);
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

  /* completar: { items: [{ frase: 'n[igh]t', fichas: ['igh','ie','y'], img, decir, voz }], muestra } */
  TIPOS.completar = function (a, ctx) {
    var ii = 0, blancos = [], k = 0, fichas = [];
    var cuenta = el('p', { class: 'g-contador' }), reto = el('div', { class: 'g-reto', 'data-destino': 'reto' }), pool = el('div', { class: 'g-pool' });
    ctx.zona.appendChild(cuenta); ctx.zona.appendChild(reto); ctx.zona.appendChild(pool);
    function linea() { return reto.querySelector('.g-linea'); }
    function pintarItem() {
      var it = a.items[ii]; reto.innerHTML = ''; pool.innerHTML = ''; blancos = []; k = 0;
      cuenta.textContent = (ii + 1) + ' / ' + a.items.length;
      if (it.img) reto.appendChild(el('span', { class: 'g-img', 'aria-hidden': 'true', text: it.img }));
      var ln = el('div', { class: 'g-linea' });
      it.frase.split(/(\[[^\]]+\])/).forEach(function (pz) {
        if (!pz) return;
        var m = /^\[([^\]]+)\]$/.exec(pz);
        if (m) { var b = el('span', { class: 'g-blanco', 'aria-label': '___' }); b._r = m[1].split('|'); blancos.push(b); ln.appendChild(b); }
        else ln.appendChild(document.createTextNode(pz));
      });
      reto.appendChild(ln);
      if (it.voz || it.decir) {
        var oir = el('button', { class: 'g-icono', 'aria-label': t('escucha'), html: ICO.voz, style: 'margin-top:6px' });
        oir.addEventListener('click', function () { hablar(it.decir || it.voz); });
        reto.appendChild(oir);
      }
      fichas = mezclar(it.fichas).map(function (x) {
        var f = ficha(x); f._x = norm(x); f._err = 0;
        f.addEventListener('click', function () { tomar(f); });
        arrastrable(f, function () { tomar(f); });
        pool.appendChild(f);
        return f;
      });
      marcarActual();
      if (cfg.leerFichas && it.decir) setTimeout(function () { hablar(it.decir); }, 250);
    }
    function marcarActual() { blancos.forEach(function (b, i) { b.classList.toggle('ahora', i === k); }); }
    function tomar(f) {
      if (f.disabled || k >= blancos.length) return;
      if (blancos[k]._r.indexOf(f._x.t) >= 0) poner(f);
      else { f._err++; ctx.mal(f, f._err, function () { ctx.brillar(correcta()); }); }
    }
    function correcta() { return fichas.filter(function (f) { return !f.disabled && blancos[k] && blancos[k]._r.indexOf(f._x.t) >= 0; })[0]; }
    function poner(f) {
      var b = blancos[k];
      volar(f, b);
      b.textContent = f._x.t; b.classList.add('lleno'); b.removeAttribute('aria-label');
      f.disabled = true; k++; marcarActual(); ctx.ok(b);
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


  /* ============================================================
     MODO JUEGO (v2, 18 nov 2026): "solo palabras y ubicarlas".
     Mapa de mundos (un tema cada uno) con 3 etapas que crecen en zonas y
     palabras; una palabra activa a la vez que se arrastra o se ubica tocando
     su zona; gemas por etapa terminada (nunca por aciertos) que desbloquean
     trajes de la mascota; jefe final por oleadas que mezcla mundos.
     Datos: { modo: 'juego', mundos: [{ id, titulo, color, claro, pista,
       consejo, zonas: [{id, t, sub, ej}], palabras: [{t, zona, voz}] }],
       etapas: [{zonas, palabras}], jefe: {titulo, oleadas, palabras},
       pieles: [{id, nombre, gemas, colores: {'#viejo': '#nuevo'}}] }
     ============================================================ */
  var J = (function () {
    var st = { etapas: {}, piel: null, vistos: {} };
    var ETAPAS = [{ zonas: 2, palabras: 6 }, { zonas: 3, palabras: 8 }, { zonas: 99, palabras: 10 }];
    var ICO_GEMA = '<svg class="g-gema" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3 H18 L22 9 L12 21 L2 9 Z" fill="#22D3EE" stroke="#0B1120" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 9 H22 M8 3 L12 9 L16 3 M12 9 L12 21" fill="none" stroke="#0B1120" stroke-width="1.2" opacity=".55"/></svg>';
    var ICO_CANDADO = '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10 V7 A4 4 0 0 1 16 7 V10" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';
    function clave() { return 'samsan:juego-' + cfg.id; }
    function cargar() { try { var x = JSON.parse(localStorage.getItem(clave()) || '{}'); st.etapas = x.etapas || {}; st.piel = x.piel || null; st.vistos = x.vistos || {}; } catch (e) { /* nada */ } }
    function guardar() { try { localStorage.setItem(clave(), JSON.stringify(st)); } catch (e) { /* nada */ } }
    function etapas() { return cfg.etapas || ETAPAS; }
    function idEtapa(wi, e) { return cfg.mundos[wi].id + '-' + e; }
    function gemas() { var n = 0; Object.keys(st.etapas).forEach(function (k) { n += k === 'jefe' ? 3 : 1; }); return n; }
    function hechasMundo(wi) { var n = 0; for (var e = 1; e <= etapas().length; e++) if (st.etapas[idEtapa(wi, e)]) n++; return n; }
    function pieles() { return cfg.pieles || [{ id: 'base', nombre: 'Classic', gemas: 0 }]; }
    function piel() { var ps = pieles(), id = st.piel; return ps.filter(function (p) { return p.id === id && gemas() >= p.gemas; })[0] || ps[0]; }
    function siguiente() {
      for (var wi = 0; wi < cfg.mundos.length; wi++) for (var e = 1; e <= etapas().length; e++) if (!st.etapas[idEtapa(wi, e)]) return { w: wi, e: e };
      return st.etapas.jefe ? { w: 0, e: 1 } : { jefe: true };
    }
    function hash(x) { return x.jefe ? 'jefe' : (x.w === undefined ? '' : cfg.mundos[x.w].id + '-' + x.e); }
    function desdeHash(h) {
      if (h === 'jefe') return { jefe: true };
      var r = {};
      cfg.mundos.forEach(function (m, wi) { var mm = new RegExp('^' + m.id + '-(\\d)$').exec(h); if (mm && +mm[1] >= 1 && +mm[1] <= etapas().length) r = { w: wi, e: +mm[1] }; });
      return r;
    }

    function pintar(x) {
      pielActual = piel();
      if (x.jefe) etapa(null, 0, true);
      else if (x.w !== undefined) etapa(x.w, x.e, false);
      else portada();
    }

    function contadorGemas() { return el('span', { class: 'g-contador-gemas', 'aria-label': gemas() + ' ' + t('gemas'), html: ICO_GEMA + '<b>' + gemas() + '</b>' }); }

    function portada() {
      var s = el('section', { class: 'g-portada g-juego' });
      var b = barra(cfg.titulo, cfg.subtitulo);
      b.insertBefore(contadorGemas(), b.children[1]);
      s.appendChild(b);
      var hola = el('div', { class: 'g-hola', html: mascota() });
      hola.appendChild(el('p', { class: 'g-globo', html: marcas(cfg.saludo) }));
      hola.addEventListener('click', function () { hablar(cfg.saludo); });
      s.appendChild(hola);
      var sig = siguiente();
      var nombreSig = sig.jefe ? cfg.jefe.titulo : cfg.mundos[sig.w].titulo + ' · ' + t('etapa') + ' ' + sig.e;
      var play = el('button', { id: 'play', class: 'g-btn g-btn--grande', html: '▶ ' + esc(t('jugar')) + ' · ' + esc(nombreSig) });
      play.addEventListener('click', function () { ir(sig); });
      s.appendChild(play);
      /* trajes */
      s.appendChild(el('h2', { class: 'g-seccion', text: t('trajes') }));
      var tr = el('div', { class: 'g-trajes' });
      pieles().forEach(function (p) {
        var libre = gemas() >= p.gemas, puesto = piel().id === p.id;
        var bt = el('button', { class: 'g-traje' + (puesto ? ' g-traje--puesto' : ''), 'aria-pressed': String(puesto), 'aria-label': p.nombre + (libre ? '' : ' · ' + p.gemas + ' ' + t('gemas')), disabled: libre ? null : 'disabled',
          html: mascota(true, p) + '<span>' + esc(p.nombre) + '</span>' + (libre ? '' : '<small>' + ICO_CANDADO + p.gemas + '</small>') });
        if (libre) bt.addEventListener('click', function () { st.piel = p.id; guardar(); sonido('toc'); ir({}, true); });
        tr.appendChild(bt);
      });
      s.appendChild(tr);
      /* mapa */
      s.appendChild(el('h2', { class: 'g-seccion', text: t('mapa') }));
      var mapa = el('ol', { class: 'g-mapa' });
      cfg.mundos.forEach(function (m, wi) {
        var li = el('li', { class: 'g-mundo' });
        colorear(li, m);
        /* Todos los mundos y etapas estan abiertos (decision del 18 nov 2026):
           el niño estudia el tema que quiera. Toda la tarjeta abre el mundo en
           su siguiente etapa sin terminar. */
        var primera = 1; while (primera < etapas().length && st.etapas[idEtapa(wi, primera)]) primera++;
        var cab = el('button', { class: 'g-mundo__cab g-mundo__abrir', 'aria-label': m.titulo + ' · ' + t('jugar') });
        cab.appendChild(cfg.tema === 'y6' ? el('span', { html: ICO.cubo(m.color, String(wi + 1)) }) : el('span', { class: 'g-letra', text: String(wi + 1), 'aria-hidden': 'true' }));
        cab.appendChild(el('span', { class: 'g-mision__txt', html: esc(m.titulo) + '<small>' + esc(m.zonas.map(function (z) { return z.t; }).join(' · ')) + '</small>' }));
        cab.appendChild(el('span', { class: 'g-mundo__jugar', 'aria-hidden': 'true', text: '▶' }));
        cab.addEventListener('click', function () { ir({ w: wi, e: primera }); });
        li.appendChild(cab);
        var fila = el('div', { class: 'g-etapas' });
        for (var e = 1; e <= etapas().length; e++) (function (e) {
          var hecho = !!st.etapas[idEtapa(wi, e)], aqui = !hecho && e === primera;
          var bt = el('button', { class: 'g-etapa' + (hecho ? ' g-etapa--hecha' : '') + (aqui ? ' g-etapa--aqui' : ''), 'aria-label': m.titulo + ' · ' + t('etapa') + ' ' + e + (hecho ? ' ✓' : ''),
            html: hecho ? ICO_GEMA : '<b>' + e + '</b>' });
          bt.addEventListener('click', function () { ir({ w: wi, e: e }); });
          fila.appendChild(bt);
        })(e);
        li.appendChild(fila);
        mapa.appendChild(li);
      });
      if (cfg.jefe) {
        var lj = el('li', { class: 'g-mundo g-mundo--jefe' });
        colorear(lj, cfg.jefe);
        var bj = el('button', { class: 'g-mundo__cab g-jefe-btn', html: (cfg.tema === 'y6' ? ICO.cubo(cfg.jefe.color, '!') : '<span class="g-letra" aria-hidden="true">★</span>') +
          '<span class="g-mision__txt">' + esc(cfg.jefe.titulo) + '<small>' + esc(cfg.jefe.sub || '') + '</small></span>' + (st.etapas.jefe ? '<span class="g-tag g-tag--ok">' + esc(t('vencido')) + '</span>' : '') });
        bj.addEventListener('click', function () { ir({ jefe: true }); });
        lj.appendChild(bj);
        mapa.appendChild(lj);
      }
      s.appendChild(mapa);
      if (Object.keys(st.etapas).length) {
        var pie = el('div', { class: 'g-pie-portada' });
        pie.appendChild(el('button', { text: t('reiniciar'), onclick: function () { if (window.confirm(t('confirmar'))) { st = { etapas: {}, piel: null, vistos: {} }; guardar(); ir({}, true); } } }));
        s.appendChild(pie);
      }
      raiz.appendChild(s);
    }

    /* reparte `n` palabras entre las zonas elegidas, al menos una por zona */
    function muestra(m, zonas, n) {
      var porZona = Math.max(1, Math.floor(n / zonas.length)), sobra = n - porZona * zonas.length, out = [];
      mezclar(zonas).forEach(function (z, i) {
        out = out.concat(mezclar(m.palabras.filter(function (p) { return p.zona === z.id; })).slice(0, porZona + (i < sobra ? 1 : 0)));
      });
      return mezclar(out);
    }
    function oleadas(esJefe, wi, e) {
      if (!esJefe) {
        var m = cfg.mundos[wi], cfgE = etapas()[e - 1];
        var zonas = mezclar(m.zonas).slice(0, Math.min(cfgE.zonas, m.zonas.length));
        zonas = m.zonas.filter(function (z) { return zonas.indexOf(z) >= 0; });
        return [{ mundo: m, zonas: zonas, palabras: muestra(m, zonas, cfgE.palabras) }];
      }
      return mezclar(cfg.mundos.slice()).slice(0, cfg.jefe.oleadas || 3).map(function (m) {
        var elegidas = mezclar(m.zonas).slice(0, 3);
        var zonas = m.zonas.filter(function (z) { return elegidas.indexOf(z) >= 0; });
        if (zonas.length < 2) zonas = m.zonas.slice(0, 2);
        return { mundo: m, zonas: zonas, palabras: muestra(m, zonas, cfg.jefe.palabras || 4) };
      });
    }

    function consejo(m, alCerrar) {
      var capa = el('div', { class: 'g-capa', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('consejo') });
      var box = el('div', { class: 'g-logro g-consejo', html: mascota(true) });
      colorear(box, m);
      box.appendChild(el('h3', { text: m.titulo }));
      if (m.consejo) box.appendChild(el('p', { html: marcas(m.consejo) }));
      var lista = el('div', { class: 'g-consejo__zonas' });
      m.zonas.forEach(function (z) {
        var bt = el('button', { class: 'g-consejo__zona', html: '<b>' + esc(z.t) + '</b>' + (z.ej ? '<span>' + marcas(z.ej) + '</span>' : '') });
        bt.addEventListener('click', function () { hablar(z.t + '. ' + (z.ej || '')); });
        lista.appendChild(bt);
      });
      box.appendChild(lista);
      var go = el('button', { class: 'g-btn', text: t('listo') + ' ▶' });
      go.addEventListener('click', function () { capa.remove(); alCerrar && alCerrar(); });
      box.appendChild(go);
      capa.appendChild(box); document.body.appendChild(capa);
      setTimeout(function () { go.focus(); }, 30);
      if (cfg.vozAuto) hablar(m.consejo || m.titulo);
    }

    function etapa(wi, e, esJefe) {
      var olas = oleadas(esJefe, wi, e), oi = 0;
      var m0 = esJefe ? cfg.jefe : cfg.mundos[wi];
      var s = el('section', { class: 'g-etapa-pant' });
      colorear(s, olas[0].mundo);
      var b = barra(esJefe ? cfg.jefe.titulo : m0.titulo, esJefe ? t('oleada') + ' 1 / ' + olas.length : t('etapa') + ' ' + e + ' / ' + etapas().length, function () { ir({}); });
      if (!esJefe) b.insertBefore(el('button', { class: 'g-icono', 'aria-label': t('consejo'), html: '<b aria-hidden="true">?</b>', onclick: function () { consejo(m0); } }), b.children[2]);
      s.appendChild(b);
      var total = olas.reduce(function (a, o) { return a + o.palabras.length; }, 0), hechas = 0;
      var barraG = el('div', { class: 'g-progreso', 'aria-hidden': 'true' });
      for (var i = 0; i < total; i++) barraG.appendChild(el('span'));
      s.appendChild(barraG);
      var anuncio = el('p', { class: 'g-oleada', role: 'status' });
      s.appendChild(anuncio);
      var dock = el('div', { class: 'g-dock' });
      var lado = el('div', { class: 'g-dock__mascota', html: mascota(true) });
      var activaBox = el('div', { class: 'g-dock__activa' });
      var prox = el('div', { class: 'g-dock__prox', 'aria-hidden': 'true' });
      dock.appendChild(lado); dock.appendChild(activaBox); dock.appendChild(prox);
      s.appendChild(dock);
      var zonasBox = el('div', { class: 'g-cajas g-zonas' });
      s.appendChild(zonasBox);
      var pista = el('p', { class: 'g-pista', role: 'status' });
      var fila = el('div', { class: 'g-ayuda-fila' });
      s.appendChild(fila); s.appendChild(pista);
      raiz.appendChild(s);

      var cola = [], activa = null, carta = null, porZona = {}, peldano = 0, ola = null;
      function zonaDe(id) { return porZona[id]; }
      function montarOla() {
        ola = olas[oi]; cola = ola.palabras.slice(); porZona = {}; zonasBox.innerHTML = '';
        colorear(s, ola.mundo);
        if (esJefe) {
          $('.g-barra small', s).textContent = t('oleada') + ' ' + (oi + 1) + ' / ' + olas.length + ' · ' + ola.mundo.titulo;
          anuncio.textContent = t('oleada') + ' ' + (oi + 1) + ' · ' + ola.mundo.titulo;
          anuncio.classList.remove('g-oleada--ve'); void anuncio.offsetWidth; anuncio.classList.add('g-oleada--ve');
        }
        ola.zonas.forEach(function (z) {
          var bt = el('button', { class: 'g-caja g-zona-u', 'data-destino': z.id, html: '<span class="g-caja__nombre">' + esc(z.t) + (z.sub ? '<small>' + esc(z.sub) + '</small>' : '') + '</span><span class="g-cuenta" aria-hidden="true">0</span>' });
          var dentro = el('span', { class: 'g-dentro' }); bt.appendChild(dentro);
          bt.addEventListener('click', function () { ubicar(z.id); });
          porZona[z.id] = { boton: bt, dentro: dentro, n: 0 };
          zonasBox.appendChild(bt);
        });
        sacar();
      }
      function pintarProx() {
        prox.innerHTML = '';
        cola.slice(0, 2).forEach(function (p) { prox.appendChild(el('span', { class: 'g-prox', text: p.t })); });
      }
      function sacar() {
        activaBox.innerHTML = '';
        if (!cola.length) {
          oi++;
          if (oi < olas.length) { setTimeout(montarOla, 350); return; }
          return setTimeout(fin, 450);
        }
        activa = cola.shift(); activa._err = 0;
        carta = el('button', { class: 'g-ficha g-ficha--grande', 'aria-label': activa.t, html: '<span>' + esc(activa.t) + '</span>' });
        carta.addEventListener('click', function () { if (activa) hablar(activa.voz || activa.t); });
        arrastrable(carta, function (d) { ubicar(d.getAttribute('data-destino')); });
        activaBox.appendChild(carta);
        pintarProx();
        var esta = activa;   /* el nino puede ubicarla antes de que hable la voz */
        if (cfg.leerFichas) setTimeout(function () { if (activa === esta) hablar(esta.voz || esta.t); }, 120);
      }
      function ubicar(id) {
        if (!activa || !zonaDe(id)) return;
        var z = zonaDe(id);
        if (activa.zona === id) {
          volar(carta, z.boton);
          z.n++; $('.g-cuenta', z.boton).textContent = String(z.n);
          z.dentro.appendChild(el('span', { class: 'g-chip', text: activa.t }));
          barraG.children[hechas].classList.add('lleno'); hechas++;
          sonido('ok'); racha++; chispas(z.boton); pista.textContent = ''; peldano = 0;
          var mz = $('.g-mascota', lado); if (mz) { mz.classList.remove('salta'); void mz.offsetWidth; mz.classList.add('salta'); }
          activa = null; carta.disabled = true;
          setTimeout(sacar, 260);
        } else {
          activa._err++; racha = 0; sonido('mal');
          [carta, z.boton].forEach(function (n) { n.classList.remove('sacude'); void n.offsetWidth; n.classList.add('sacude'); });
          pista.textContent = activa._err >= 2 ? (ola.mundo.pista || t('pista_def')) : t('intenta');
          if (activa._err >= 2) brillar(zonaDe(activa.zona).boton);
        }
      }
      function brillar(n) { n.classList.remove('brilla'); void n.offsetWidth; n.classList.add('brilla'); }
      fila.appendChild(el('button', { class: 'g-btn g-btn--suave', html: ICO.bombilla + ' ' + esc(t('ayuda')), onclick: function () {
        if (!activa) return;
        peldano++;
        if (peldano === 1) { pista.textContent = ola.mundo.pista || t('pista_def'); hablar(ola.mundo.pista || ''); }
        else if (peldano === 2) brillar(zonaDe(activa.zona).boton);
        else { peldano = 0; ubicar(activa.zona); }
      } }));
      function fin() {
        var clave2 = esJefe ? 'jefe' : idEtapa(wi, e), nueva = !st.etapas[clave2], antes = gemas();
        st.etapas[clave2] = 1; guardar();
        var desbloqueo = pieles().filter(function (p) { return p.gemas > antes && p.gemas <= gemas(); })[0];
        sonido(desbloqueo ? 'nivel' : 'fin');
        var capa = el('div', { class: 'g-capa', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('etapa_ok') });
        var box = el('div', { class: 'g-logro', html: mascota() });
        $('.g-mascota', box).classList.add('salta');
        box.appendChild(el('h3', { text: esJefe ? t('jefe_ok') : t('etapa_ok') }));
        box.appendChild(el('p', { class: 'g-gana', html: ICO_GEMA + (nueva ? ' +' + (esJefe ? 3 : 1) : ' ✓') + ' · ' + gemas() + ' ' + esc(gemas() === 1 ? t('gema') : t('gemas')) }));
        if (desbloqueo) box.appendChild(el('p', { class: 'g-insignia', html: '<small>' + esc(t('nuevo_traje')) + '</small>' + mascota(true, desbloqueo) + esc(desbloqueo.nombre) }));
        var sigE = !esJefe && e < etapas().length ? { w: wi, e: e + 1 } : siguiente();
        var bSig = el('button', { class: 'g-btn', text: (sigE.jefe ? cfg.jefe.titulo : (sigE.w === wi && !esJefe ? t('siguiente_etapa') : t('siguiente'))) + ' ▶' });
        bSig.addEventListener('click', function () { capa.remove(); ir(sigE); });
        box.appendChild(bSig);
        box.appendChild(el('button', { class: 'g-btn g-btn--suave', html: ICO.otra + ' ' + esc(t('otra')), onclick: function () { capa.remove(); ir(esJefe ? { jefe: true } : { w: wi, e: e }, true); } }));
        box.appendChild(el('button', { class: 'g-btn g-btn--suave', text: t('mapa'), onclick: function () { capa.remove(); ir({}); } }));
        capa.appendChild(box); document.body.appendChild(capa);
        hablar(esJefe ? t('jefe_ok') : t('etapa_ok'));
        setTimeout(function () { bSig.focus(); }, 50);
      }
      montarOla();
      if (!esJefe && !st.vistos[cfg.mundos[wi].id]) { st.vistos[cfg.mundos[wi].id] = 1; guardar(); consejo(cfg.mundos[wi]); }
    }
    return { cargar: cargar, pintar: pintar, hash: hash, desdeHash: desdeHash, gemas: gemas };
  })();
  /* ============================================================
     MODO ALDEA (Y2 English v3, «La aldea de Pip», 18 nov 2026)
     Usa el kit visual de guias/comun/aldea.js (window.ALDEA) y los dibujos
     de guias/comun/iconos.js (window.ICONOS); build.py los incluye cuando
     la guia declara `// usa: aldea`.
       Mapa en camino por la aldea, con Pip parado en su etapa. Todo abierto.
       Etapa: 5 globos; 2, 3 y hasta 4 lugares (cfg.etapas). Pip llega con un
       globo (dibujo grande y palabra) y el niño lo lleva a su lugar.
       Demostracion de Pip la primera vez que se entra a un mundo (y con ?).
       Una calcomania por etapa terminada, nunca por aciertos (regla 4); van
       al album de la portada y liberan los trajes de Pip.
     Datos: { modo: 'aldea', porEtapa, etapas: [2,3,4], pieles, mundos: [{ id,
       titulo, escena, calcos: [3 dibujos], zonas: [{id, letrero, lugar,
       variante, color, ej, ejp, voz}], palabras: [{p, ico, zona}] }] }
     ============================================================ */
  var AL = (function () {
    var st = { etapas: {}, piel: null, vistos: {} }, pintado = null;
    /* un cambio de #mundo-etapa a mano (o un enlace) tambien cambia de pantalla */
    window.addEventListener('hashchange', function () { if (cfg && cfg.modo === 'aldea' && location.hash !== pintado) pintar(desdeHash(location.hash.slice(1))); });
    var ICONOS = function (k) { return (window.ICONOS || {})[k] || ''; };
    function K() { return window.ALDEA; }
    function clave() { return 'samsan:aldea-' + cfg.id; }
    function cargar() { try { var x = JSON.parse(localStorage.getItem(clave()) || '{}'); st.etapas = x.etapas || {}; st.piel = x.piel || null; st.vistos = x.vistos || {}; } catch (e) { /* nada */ } }
    function guardar() { try { localStorage.setItem(clave(), JSON.stringify(st)); } catch (e) { /* nada */ } }
    function etapas() { return cfg.etapas || [2, 3, 4]; }
    function idEtapa(wi, e) { return cfg.mundos[wi].id + '-' + e; }
    function calcos() { return Object.keys(st.etapas).length; }
    function pieles() { return cfg.pieles || [{ id: 'base', nombre: 'Classic', gemas: 0 }]; }
    function piel() { var ps = pieles(), id = st.piel; return ps.filter(function (p) { return p.id === id && calcos() >= p.gemas; })[0] || ps[0]; }
    function siguiente() {
      for (var wi = 0; wi < cfg.mundos.length; wi++) for (var e = 1; e <= etapas().length; e++) if (!st.etapas[idEtapa(wi, e)]) return { w: wi, e: e };
      return { w: 0, e: 1 };
    }
    function hash(x) { return x.w === undefined ? '' : cfg.mundos[x.w].id + '-' + x.e; }
    function desdeHash(h) {
      var r = {};
      cfg.mundos.forEach(function (m, wi) { var mm = new RegExp('^' + m.id + '-(\\d)$').exec(h); if (mm && +mm[1] >= 1 && +mm[1] <= etapas().length) r = { w: wi, e: +mm[1] }; });
      return r;
    }
    function pintar(x) {
      pielActual = piel();
      raiz.classList.toggle('g-raiz--aldea', x.w !== undefined);
      document.body.classList.toggle('al-jugando', x.w !== undefined);
      pintado = location.hash;
      if (x.w !== undefined) etapa(x.w, x.e); else portada();
    }
    function pipVolando(chico) {
      var s = vestir(K().pip(cfg.mascotaNombre || 'Pip'), pielActual);
      return chico ? s.replace('class="al-pip"', 'class="al-pip al-pip--chico"') : s;
    }

    /* ---------- portada: Pip, Play, mapa en camino, album y trajes ---------- */
    function portada() {
      var s = el('section', { class: 'g-portada al-portada' });
      s.appendChild(barra(cfg.titulo, cfg.subtitulo));
      var sig = siguiente(), mSig = cfg.mundos[sig.w];
      var hola = el('div', { class: 'al-hola' });
      var pc = el('button', { class: 'al-pip-caja al-hola__pip', 'aria-label': cfg.mascotaNombre || 'Pip', html: pipVolando() });
      pc.addEventListener('click', function () { hablar(t('aldea_hola')); K().celebrar(pc.querySelector('.al-pip')); });
      hola.appendChild(pc);
      var play = el('button', { id: 'play', class: 'g-btn g-btn--grande al-play', 'aria-label': t('jugar') + ' · ' + mSig.titulo + ' · ' + t('etapa') + ' ' + sig.e,
        html: '<span class="al-play__ico">' + K().icono(ICONOS(mSig.calcos[sig.e - 1]), 'al-ico') + '</span>▶ ' + esc(t('jugar')) });
      play.addEventListener('click', function () { ir(sig); });
      hola.appendChild(play);
      s.appendChild(hola);

      /* mapa: un camino que zigzaguea por la aldea, un alto por mundo */
      s.appendChild(el('h2', { class: 'g-seccion', text: t('mapa') }));
      var mapa = el('div', { class: 'al-mapa' });
      var n = cfg.mundos.length, alto = 150, d = '';
      for (var i = 0; i < n; i++) {
        var x = i % 2 ? 72 : 28, y = i * alto + alto / 2;
        if (!i) d = 'M' + x + ' ' + y; else { var x0 = (i - 1) % 2 ? 72 : 28, y0 = (i - 1) * alto + alto / 2; d += ' C' + x0 + ' ' + (y0 + alto * 0.55) + ' ' + x + ' ' + (y - alto * 0.55) + ' ' + x + ' ' + y; }
      }
      mapa.innerHTML = '<svg class="al-mapa__camino" viewBox="0 0 100 ' + n * alto + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="' + d + '" fill="none" stroke="#D6B07A" stroke-width="26" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
        '<path d="' + d + '" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".85"/></svg>';
      mapa.style.setProperty('--filas', String(n));
      cfg.mundos.forEach(function (m, wi) {
        var alto2 = el('div', { class: 'al-alto' + (wi % 2 ? ' al-alto--d' : '') });
        var primera = 1; while (primera < etapas().length && st.etapas[idEtapa(wi, primera)]) primera++;
        var z0 = m.zonas[0];
        var tile = el('button', { class: 'al-alto__mundo', 'aria-label': m.titulo + ' · ' + t('jugar'),
          html: '<span class="al-alto__ico">' + K().icono(ICONOS(m.calcos[0]), 'al-ico') + '</span><span class="al-alto__nombre">' + esc(m.titulo) + '</span>' });
        tile.style.setProperty('--c', z0.color);
        tile.addEventListener('click', function () { ir({ w: wi, e: primera }); });
        alto2.appendChild(tile);
        var fila = el('div', { class: 'al-alto__etapas' });
        for (var e = 1; e <= etapas().length; e++) (function (e) {
          var hecho = !!st.etapas[idEtapa(wi, e)], aqui = sig.w === wi && sig.e === e;
          var bt = el('button', { class: 'al-parada' + (hecho ? ' al-parada--hecha' : '') + (aqui ? ' al-parada--aqui' : ''), 'aria-label': m.titulo + ' · ' + t('etapa') + ' ' + e + (hecho ? ' ✓' : ''),
            html: hecho ? K().icono(ICONOS(m.calcos[e - 1]), 'al-ico') : '<b>' + e + '</b>' });
          bt.addEventListener('click', function () { ir({ w: wi, e: e }); });
          if (aqui) bt.appendChild(el('span', { class: 'al-parada__pip', 'aria-hidden': 'true', html: pipVolando(true) }));
          fila.appendChild(bt);
        })(e);
        alto2.appendChild(fila);
        mapa.appendChild(alto2);
      });
      s.appendChild(mapa);

      /* album de calcomanias: una por etapa; las que faltan se ven en gris */
      s.appendChild(el('h2', { class: 'g-seccion', text: t('album') + ' · ' + calcos() + ' / ' + cfg.mundos.length * etapas().length }));
      var album = el('div', { class: 'al-album', role: 'list' });
      cfg.mundos.forEach(function (m, wi) {
        m.calcos.forEach(function (c, ci) {
          var tiene = !!st.etapas[idEtapa(wi, ci + 1)];
          var ca = el(tiene ? 'button' : 'span', { class: 'al-calco' + (tiene ? '' : ' al-calco--falta'), role: 'listitem', 'aria-label': m.titulo + ' · ' + (ci + 1) + (tiene ? ' ✓' : ''), html: K().icono(ICONOS(c), 'al-ico') });
          if (tiene) ca.addEventListener('click', function () { hablar(NOMBRE_CALCO[c] || c); ca.classList.remove('al-salta'); void ca.offsetWidth; ca.classList.add('al-salta'); });
          album.appendChild(ca);
        });
      });
      s.appendChild(album);

      /* trajes de Pip, que se liberan con calcomanias */
      s.appendChild(el('h2', { class: 'g-seccion', text: t('trajes') }));
      var tr = el('div', { class: 'g-trajes' });
      pieles().forEach(function (p) {
        var libre = calcos() >= p.gemas, puesto = piel().id === p.id;
        var bt = el('button', { class: 'g-traje' + (puesto ? ' g-traje--puesto' : ''), 'aria-pressed': String(puesto), 'aria-label': p.nombre + (libre ? '' : ' · ' + p.gemas + ' ' + t('calcos')), disabled: libre ? null : 'disabled',
          html: mascota(true, p) + '<span>' + esc(p.nombre) + '</span>' + (libre ? '' : '<small>' + ICO_CANDADO_A + p.gemas + '</small>') });
        if (libre) bt.addEventListener('click', function () { st.piel = p.id; guardar(); sonido('toc'); ir({}, true); });
        tr.appendChild(bt);
      });
      s.appendChild(tr);
      if (Object.keys(st.etapas).length) {
        /* lejos del dedo del niño: dentro de «For grown-ups» y con confirmacion */
        var pie = el('details', { class: 'g-pie-portada al-adultos' });
        pie.appendChild(el('summary', { text: t('adultos') }));
        pie.appendChild(el('button', { text: t('reiniciar'), onclick: function () { if (window.confirm(t('confirmar'))) { st = { etapas: {}, piel: null, vistos: {} }; guardar(); ir({}, true); } } }));
        s.appendChild(pie);
      }
      raiz.appendChild(s);
    }
    var NOMBRE_CALCO = { birthday: 'birthday cake', nestegg: 'egg' };
    var ICO_CANDADO_A = '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10 V7 A4 4 0 0 1 16 7 V10" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';

    /* 5 palabras repartidas entre las zonas de la etapa, al menos una por zona */
    function tanda(m, zonas) {
      var n = cfg.porEtapa || 5, porZona = Math.floor(n / zonas.length), sobra = n - porZona * zonas.length, out = [];
      mezclar(zonas).forEach(function (z, i) {
        out = out.concat(mezclar(m.palabras.filter(function (p) { return p.zona === z.id; })).slice(0, porZona + (i < sobra ? 1 : 0)));
      });
      return mezclar(out);
    }

    /* ---------- etapa ---------- */
    function etapa(wi, e) {
      var A = K(), m = cfg.mundos[wi];
      var elegidas = mezclar(m.zonas).slice(0, Math.min(etapas()[e - 1] || 2, m.zonas.length));
      var zonas = m.zonas.filter(function (z) { return elegidas.indexOf(z) >= 0; });
      var cola = tanda(m, zonas), N = cola.length;
      var p = el('section', { class: 'al-pantalla g-etapa-pant' });
      var bar = el('div', { class: 'al-barra' });
      bar.appendChild(el('button', { class: 'g-icono', 'aria-label': t('atras'), html: ICO.atras, onclick: function () { ir({}); } }));
      var est = A.estrellas(N); bar.appendChild(est);
      var bDemo = el('button', { class: 'g-icono', 'aria-label': t('consejo'), html: '<b aria-hidden="true">?</b>' });
      var bAyuda = el('button', { class: 'g-icono al-bombilla', 'aria-label': t('ayuda'), html: ICO.bombilla });
      bar.appendChild(bDemo); bar.appendChild(bAyuda);
      p.appendChild(bar);
      var esc2 = A.escena(m.escena); esc2.nodo.setAttribute('data-n', String(zonas.length));
      esc2.nodo.setAttribute('data-mundo', m.id);
      var porId = {};
      zonas.forEach(function (z) {
        var l = A.lugar({ id: z.id, tipo: z.lugar, variante: z.variante, color: z.color, letrero: z.letrero, ejemplo: ICONOS(z.ej), etiqueta: z.letrero });
        l.addEventListener('click', function (ev) {
          if (ev.target && ev.target.closest && ev.target.closest('.al-letrero')) { hablar(decirLugar(z)); return; }
          soltar(l);
        });
        porId[z.id] = { zona: z, nodo: l };
        esc2.lugares.appendChild(l);
      });
      var vuelo = el('div', { class: 'al-vuelo' });
      var colaVista = el('div', { class: 'al-cola', 'aria-hidden': 'true' });
      esc2.cielo.appendChild(colaVista);
      function pintarCola() {
        colaVista.innerHTML = '';
        cola.slice(0, 2).forEach(function (w, i) { colaVista.appendChild(el('span', { class: 'al-cola__globo al-cola__globo--' + i, html: A.icono(ICONOS(w.ico), 'al-ico') })); });
      }
      var pipCaja = el('div', { class: 'al-pip-caja', html: pipVolando() });
      vuelo.appendChild(pipCaja);
      esc2.cielo.appendChild(vuelo);
      p.appendChild(esc2.nodo);
      var estado = el('p', { class: 'al-oculto', role: 'status' });
      p.appendChild(estado);
      raiz.appendChild(p);

      var activo = null, globo = null, peldano = 0, ocupado = false, enDemo = false, timers = [];
      var fonetica = /\*/.test(zonas[0].ejp);
      function plano2(x) { return String(x).replace(/\*/g, ''); }
      /* el nombre del lugar con su ejemplo */
      var preguntas = /\?$/.test(zonas[0].letrero);
      function decirLugar(z) {
        if (fonetica) return plano2(z.ejp) + '. ' + z.voz + '.';
        if (preguntas) return z.letrero + ' ' + plano2(z.ejp) + '.';
        return z.letrero + '! ' + (plano2(z.ejp) === z.letrero ? '' : plano2(z.ejp) + '. ') + z.voz + '.';
      }
      /* pista por ejemplo y no por regla: el ejemplo del lugar y la palabra juntos */
      function pistaPorEjemplo(z, palabra) {
        var w = plano2(palabra), e = plano2(z.ejp);
        if (fonetica) return e + '. ' + w + '. ' + z.voz + '.';
        if (preguntas) return z.letrero + ' ' + e + '. ' + z.letrero + ' ' + w + '.';
        return (e === z.letrero ? '' : e + '. ') + w + '. ' + z.voz + '.';
      }
      function despues(f, ms) { timers.push(setTimeout(function () { if (p.isConnected) f(); }, ms)); }
      pipCaja.addEventListener('click', function () { if (activo) hablar(activo.p); });

      function nuevoGlobo(texto, ico, i) {
        var g = A.globo({ palabra: texto, icono: ICONOS(ico), indice: i });
        vuelo.appendChild(g); A.entrar(vuelo);
        return g;
      }
      var trasDemo = false;   /* la primera palabra despues de la demo no corta «Your turn!» */
      function sacar() {
        if (globo) { globo.remove(); globo = null; }
        if (!cola.length) return despues(fin, 350);
        activo = cola.shift(); activo._err = 0; peldano = 0; ocupado = false;
        pintarCola();
        globo = nuevoGlobo(activo.p, activo.ico, N - cola.length);
        A.arrastre(globo, { alSoltar: function (l) { soltar(l); }, alTocar: function () { if (activo) hablar(activo.p); } });
        var este = activo;
        trasDemo = false;
        /* en cola: no corta el animo del acierto anterior ni «Your turn!» */
        if (cfg.leerFichas) despues(function () { if (activo === este) hablar(este.p, { cola: true }); }, 650);
      }
      function volverGlobo() {
        if (!globo) return;
        globo.style.transition = 'transform .3s ease'; globo.style.transform = '';
        var g = globo; setTimeout(function () { g.style.transition = ''; }, 320);
      }
      function acertar(l, ico, alFin) {
        var g = globo; globo = null; g.disabled = true;
        A.volar(g, l, function () {
          g.remove(); sonido('toc');
          A.abrir(l, ICONOS(ico), alFin);
          despues(function () { sonAcierto(m.escena); racha++; A.celebrar(pipCaja.querySelector('.al-pip')); }, 260);
        });
      }
      function soltar(l) {
        if (!activo || ocupado || enDemo) return;
        var id = l.getAttribute('data-lugar'), z = porId[activo.zona];
        if (id === activo.zona) {
          ocupado = true;
          var a = activo; activo = null;
          estado.textContent = a.p.replace(/\*/g, '') + ' ✓';
          var bravo = t('bravo'); hablar(bravo[Math.floor(Math.random() * bravo.length)] + ' ' + plano2(a.p) + '!');
          acertar(l, a.ico, function () { sacar(); });
          despues(function () { A.llenarEstrella(est); }, 300);
        } else {
          activo._err++; racha = 0; sonido('mal'); A.temblar(l); volverGlobo();
          if (activo._err === 1) hablar(activo.p, { lento: true });
          else { hablar(pistaPorEjemplo(z.zona, activo.p)); A.brillar(z.nodo); }
        }
      }
      bAyuda.addEventListener('click', function () {
        if (!activo || ocupado || enDemo) return;
        var z = porId[activo.zona];
        peldano = Math.max(peldano, activo._err) + 1;
        if (peldano === 1) hablar(activo.p, { lento: true });
        else if (peldano === 2) { A.brillar(z.nodo); hablar(pistaPorEjemplo(z.zona, activo.p)); }
        else soltar(z.nodo);
      });

      /* demostracion de Pip: lleva el ejemplo de cada lugar a su sitio (unos 10 s) */
      function demo(alTerminar) {
        enDemo = true; p.classList.add('al-demo');
        var guardado = globo; if (guardado) guardado.style.display = 'none';
        var tapa = el('div', { class: 'al-demo__tapa' });
        var saltar = el('button', { class: 'g-icono al-demo__saltar', 'aria-label': t('saltar'), html: ICO_SALTAR });
        tapa.appendChild(saltar);
        esc2.nodo.appendChild(tapa);
        var lista = zonas.slice(0, Math.min(zonas.length, 2)), k = 0, cerrado = false;
        function cerrar() {
          if (cerrado) return; cerrado = true;
          tapa.remove(); p.classList.remove('al-demo'); enDemo = false;
          vuelo.querySelectorAll('.al-globo--demo').forEach(function (g) { g.remove(); });
          if (guardado) guardado.style.display = '';
          hablar(t('aldea_turno'));
          trasDemo = true;
          alTerminar && alTerminar();
        }
        saltar.addEventListener('click', function () { try { speechSynthesis.cancel(); } catch (er) { /* nada */ } cerrar(); });
        hablar(m.titulo + '! ' + t('aldea_mira'));
        function uno() {
          if (cerrado) return;
          if (k >= lista.length) return despues(cerrar, 500);
          var z = lista[k++];
          var g = nuevoGlobo(z.ejp, z.ej, k); g.classList.add('al-globo--demo'); g.disabled = true;
          g.appendChild(A.mano());
          despues(function () { if (!cerrado) hablar(z.ejp, { cola: true }); }, 500);
          despues(function () {
            if (cerrado) return;
            A.volar(g, porId[z.id].nodo, function () {
              g.remove();
              if (cerrado) return;
              /* (la demostracion vuela despacio para que se vea el arrastre) */   /* saltaron la demostracion mientras el globo volaba */
              sonido('toc');
              A.abrir(porId[z.id].nodo, ICONOS(z.ej));
              hablar(z.ejp + '. ' + z.voz + '.', { cola: true });
              despues(uno, 2600);
            }, { lento: true });
          }, 1300);
        }
        despues(uno, 900);
      }
      bDemo.addEventListener('click', function () { if (!ocupado && !enDemo) demo(function () { trasDemo = false; if (activo) hablar(activo.p, { cola: true }); }); });

      function fin() {
        var id = idEtapa(wi, e), nueva = !st.etapas[id], antes = calcos();
        st.etapas[id] = 1; guardar();
        var desbloqueo = pieles().filter(function (pp) { return pp.gemas > antes && pp.gemas <= calcos(); })[0];
        sonido(desbloqueo ? 'nivel' : 'fin');
        var capa = el('div', { class: 'g-capa', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('etapa_ok') });
        var box = el('div', { class: 'g-logro al-fin', html: '<div class="al-fin__pip">' + pipVolando() + '</div>' });
        var e2 = A.estrellas(N); for (var i = 0; i < N; i++) A.llenarEstrella(e2);
        box.appendChild(e2);
        box.appendChild(el('div', { class: 'al-calco al-calco--nueva', 'aria-label': t('calco_nueva'), html: A.icono(ICONOS(m.calcos[e - 1]), 'al-ico') }));
        if (desbloqueo) {
          /* el traje nuevo se pone solo; se cambia en la portada */
          st.piel = desbloqueo.id; guardar(); pielActual = desbloqueo;
          box.querySelector('.al-fin__pip').innerHTML = pipVolando();
          box.appendChild(el('p', { class: 'g-insignia al-insignia', html: '<small>' + esc(t('nuevo_traje')) + '</small>' + pipVolando(true) + esc(desbloqueo.nombre) }));
        }
        var sigE = e < etapas().length ? { w: wi, e: e + 1 } : siguiente();
        var fila = el('div', { class: 'al-fin__botones' });
        var bMapa = el('button', { class: 'g-btn g-btn--suave', 'aria-label': t('mapa'), html: ICO_MAPA });
        bMapa.addEventListener('click', function () { capa.remove(); ir({}); });
        var bOtra = el('button', { class: 'g-btn g-btn--suave', 'aria-label': t('otra'), html: ICO.otra });
        bOtra.addEventListener('click', function () { capa.remove(); ir({ w: wi, e: e }, true); });
        var bSig = el('button', { id: 'siguiente', class: 'g-btn', 'aria-label': t('siguiente_etapa'), html: '▶' });
        bSig.addEventListener('click', function () { capa.remove(); ir(sigE); });
        fila.appendChild(bMapa); fila.appendChild(bOtra); fila.appendChild(bSig);
        box.appendChild(fila);
        capa.appendChild(box); document.body.appendChild(capa);
        A.celebrar(box.querySelector('.al-pip'));
        try { var r = box.getBoundingClientRect(); A.confeti(r.left + r.width / 2, r.top + 60, 36); } catch (er) { /* nada */ }
        hablar(nueva ? t('aldea_calco') : t('etapa_ok'), { cola: true });
        if (desbloqueo) hablar(t('aldea_traje'), { cola: true });
        setTimeout(function () { bSig.focus(); }, 50);
      }

      if (!st.vistos[m.id]) { st.vistos[m.id] = 1; guardar(); pintarCola(); demo(sacar); }
      else sacar();
      G._aldea_etapa = { zonas: zonas, activo: function () { return activo; }, enDemo: function () { return enDemo; } };   /* solo para pruebas */
    }
    var ICO_SALTAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5 L12 12 L3 19 Z M12 5 L21 12 L12 19 Z" fill="currentColor"/></svg>';
    /* cada mundo suena distinto al acertar */
    function sonAcierto(escena) {
      var N = { calle: [660, 880, 990], estanque: [392, 523, 784], plaza: [587, 740, 880], habitat: [523, 659, 1047], barrio: [784, 659, 988], granja: [440, 554, 659] }[escena] || [660, 880];
      var r = 1 + Math.min(racha, 6) * 0.04;
      N.forEach(function (f, i) { tono(f * r, i * 0.07, 0.16); });
    }
    var ICO_MAPA = '<svg viewBox="0 0 24 24" aria-hidden="true" width="28" height="28"><path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z M9 4 V18 M15 6 V20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>';
    return { cargar: cargar, pintar: pintar, hash: hash, desdeHash: desdeHash, calcos: calcos, estado: function () { return st; } };
  })();
  TEXTOS.en.album = 'My stickers'; TEXTOS.en.calcos = 'stickers'; TEXTOS.en.aldea_hola = "Hi! I'm Pip. Help me take everything to its place in the village!";
  TEXTOS.en.aldea_mira = 'Watch me!'; TEXTOS.en.aldea_turno = 'Your turn!'; TEXTOS.en.aldea_calco = 'Well done! You got a new sticker!';
  TEXTOS.en.calco_nueva = 'New sticker'; TEXTOS.en.saltar = 'Skip'; TEXTOS.en.aldea_traje = 'Pip has a new outfit!'; TEXTOS.en.adultos = 'For grown-ups';
  TEXTOS.es.album = 'Mis calcomanías'; TEXTOS.es.calcos = 'calcomanías'; TEXTOS.es.aldea_hola = '¡Hola! Soy Pip. ¡Ayúdame a llevar cada cosa a su lugar en la aldea!';
  TEXTOS.es.aldea_mira = '¡Mira cómo lo hago!'; TEXTOS.es.aldea_turno = '¡Ahora tú!'; TEXTOS.es.aldea_calco = '¡Muy bien! ¡Ganaste una calcomanía!';
  TEXTOS.es.calco_nueva = 'Calcomanía nueva'; TEXTOS.es.saltar = 'Saltar'; TEXTOS.es.aldea_traje = '¡Pip tiene un traje nuevo!'; TEXTOS.es.adultos = 'Para adultos';
  TEXTOS.en.jugar = 'Play'; TEXTOS.en.mapa = 'World map'; TEXTOS.en.etapa = 'Stage'; TEXTOS.en.gemas = 'gems'; TEXTOS.en.gema = 'gem';
  TEXTOS.en.etapa_ok = 'Stage clear!'; TEXTOS.en.jefe_ok = 'Boss defeated!'; TEXTOS.en.trajes = 'Outfits'; TEXTOS.en.nuevo_traje = 'New outfit unlocked';
  TEXTOS.en.oleada = 'Wave'; TEXTOS.en.consejo = 'Tip'; TEXTOS.en.listo = "I'm ready"; TEXTOS.en.siguiente_etapa = 'Next stage'; TEXTOS.en.vencido = 'DONE';
  TEXTOS.es.jugar = 'Jugar'; TEXTOS.es.mapa = 'Mapa'; TEXTOS.es.etapa = 'Etapa'; TEXTOS.es.gemas = 'gemas'; TEXTOS.es.gema = 'gema';
  TEXTOS.es.etapa_ok = '¡Etapa superada!'; TEXTOS.es.jefe_ok = '¡Jefe vencido!'; TEXTOS.es.trajes = 'Trajes'; TEXTOS.es.nuevo_traje = 'Traje nuevo';
  TEXTOS.es.oleada = 'Oleada'; TEXTOS.es.consejo = 'Consejo'; TEXTOS.es.listo = '¡Listo!'; TEXTOS.es.siguiente_etapa = 'Siguiente etapa'; TEXTOS.es.vencido = 'HECHO';

  /* ---------- arranque ---------- */
  G.iniciar = function (c) {
    cfg = c;
    cfg.idioma = cfg.idioma || (cfg.lang.slice(0, 2) === 'es' ? 'es' : 'en');
    cfg.textos = cfg.textos || {};
    document.documentElement.setAttribute('data-tema', cfg.tema || 'y2');
    raiz = document.getElementById('guia');
    try { vozOn = localStorage.getItem('samsan:guia-voz') !== '0'; musicaOn = localStorage.getItem('samsan:guia-musica-' + cfg.id) !== '0'; } catch (e) { vozOn = true; musicaOn = true; }
    if (cfg.modo === 'aldea') { cfg.misiones = []; AL.cargar(); }
    else if (cfg.modo === 'juego') { cfg.misiones = []; J.cargar(); } else armarJefe();
    cargar(); cargarVoces();
    if (window.speechSynthesis && 'onvoiceschanged' in speechSynthesis) speechSynthesis.onvoiceschanged = cargarVoces;
    /* la musica necesita un primer toque (regla de los navegadores) */
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (tipo) {
      document.addEventListener(tipo, function (e) { if (!(e.target && e.target.closest && e.target.closest('.g-btn-musica'))) Musica.empezar(); }, true);
    });
    /* entrada directa por #id-mision o #id-mision-N (modo juego: #mundo-etapa o #jefe) */
    var h = (location.hash || '').slice(1), estado = {};
    if (cfg.modo === 'juego' || cfg.modo === 'aldea') {
      estado = (cfg.modo === 'aldea' ? AL : J).desdeHash(h);
      if (estado.w !== undefined || estado.jefe) { try { history.replaceState({}, '', location.pathname); } catch (e) { /* nada */ } ir(estado); }
      else ir({}, true);
      return;
    }
    cfg.misiones.forEach(function (m, mi) {
      if (h === m.id) estado = { m: mi, p: 0 };
      var mm = new RegExp('^' + m.id + '-(\\d+)$').exec(h);
      if (mm && +mm[1] <= m.actividades.length) estado = { m: mi, p: +mm[1] };
    });
    if (estado.m !== undefined) { try { history.replaceState({}, '', location.pathname); } catch (e) { /* nada */ } ir(estado); }
    else ir({}, true);
  };
  G._TIPOS = TIPOS;
  G._musica = Musica;
  G._juego = J;   /* solo para pruebas: estado() y medir(estilo, segundos) */
  G._aldea = AL;  /* solo para pruebas */
})();
