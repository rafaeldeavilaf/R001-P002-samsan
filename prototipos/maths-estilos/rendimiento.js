// titulo: Prueba de rendimiento del teléfono
// publicar: true
/* ============================================================
   RB01 · H03 — PRUEBA DE RENDIMIENTO (página para el padre)
   Mide si el teléfono aguanta el estilo de papel antes de construirlo:
   una prueba con Canvas 2D y otra con CSS 3D, cada una en escalones de
   50, 150 y 300 piezas de papel negro con borde neón.

   - Cada prueba arranca con la página recién cargada: si ya corrió una
     en esta carga, el botón recarga la página y la prueba sigue sola.
   - Dato para decidir: el escalón más alto que se sostiene, es decir,
     con el percentil 5 de FPS en el umbral o por encima. El umbral se
     fijó antes de medir (lylo/planes/RB01.md): 30 FPS con 150 piezas.
   - Memoria: solo la de JavaScript, aproximada (performance.memory, en
     Chrome). No cuenta la del procesador gráfico.
   - Si la pestaña se recarga o se cierra en plena prueba, lo dice al
     volver a abrirla.
   Nada sale del navegador: los resultados viven en sessionStorage de
   esta pestaña y se copian a mano con el botón «Copiar resultados».
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  var $ = P.$;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CFG = Object.assign({ pasos: [50, 150, 300], calentar: 2000, medir: 8000, umbral: 30, referencia: 150 }, window.RB01_CFG || {});
  var CLAVE = 'samsan:rb01-rendimiento';
  /* imagen: papel pre-dibujado (24 nov 2026, a pedido de Rafael). Cada pieza se dibuja UNA vez,
     con su sombra, canto, bisel y fibra, y en cada cuadro solo se copia con drawImage. */
  var MODOS = { canvas: 'Canvas 2D', css3d: 'CSS 3D', imagen: 'Papel pre-dibujado' };
  var PAPEL = [['#E07A3F', '#9A4A1F'], ['#3E8E7E', '#22564B'], ['#F2C14E', '#AE8026'], ['#C2453A', '#7E2620'], ['#7FB069', '#4F7340']];
  var NEON = ['#2FE6FF', '#FF4FD8', '#B6FF3B'];
  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) { return setTimeout(f, 16); };
  var yaCorrio = false;
  var corriendo = false;

  /* ---------- Estado de la pestaña (sessionStorage; nunca sale de aquí) ---------- */
  function leer() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; }
  }
  function guardar(s) {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) { /* sin almacenamiento: los resultados quedan solo en pantalla */ }
  }
  var estado = leer();
  estado.resultados = estado.resultados || {};

  /* ---------- Cálculo ---------- */
  function resumir(piezas, deltas, memoria) {
    var n = deltas.length;
    var total = deltas.reduce(function (a, b) { return a + b; }, 0);
    var orden = deltas.slice().sort(function (a, b) { return a - b; });
    var p95 = n ? orden[Math.floor(0.95 * (n - 1))] : 0;
    var prom = total > 0 ? n * 1000 / total : 0;
    var p5 = p95 > 0 ? 1000 / p95 : 0;
    return {
      piezas: piezas,
      cuadros: n,
      fps: Math.round(prom * 10) / 10,
      fpsP5: Math.round(p5 * 10) / 10,
      sostiene: p5 >= CFG.umbral,
      memoriaMB: memoria
    };
  }
  function escalonSostenido(filas) {
    var alto = null;
    (filas || []).forEach(function (f) { if (f.sostiene && (alto === null || f.piezas > alto)) alto = f.piezas; });
    return alto;
  }
  function memoria() {
    var m = window.performance && window.performance.memory;
    return m && m.usedJSHeapSize ? Math.round(m.usedJSHeapSize / 1048576) : null;
  }
  function ahora() { return window.performance && window.performance.now ? window.performance.now() : Date.now(); }

  /* ---------- Piezas de papel: el mismo movimiento en las dos escenas ---------- */
  function piezas(n, ancho, alto) {
    var semilla = 7, lista = [];
    function azar() { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; }
    for (var i = 0; i < n; i++) {
      lista.push({
        x: azar() * ancho, y: azar() * alto, z: (azar() - 0.5) * 200,
        vx: (azar() - 0.5) * 1.6, vy: (azar() - 0.5) * 1.6,
        a: azar() * 360, va: (azar() - 0.5) * 4, lado: 18 + azar() * 16, color: NEON[i % NEON.length]
      });
    }
    return lista;
  }
  function mover(lista, ancho, alto) {
    lista.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.a += p.va;
      if (p.x < 0 || p.x > ancho) p.vx = -p.vx;
      if (p.y < 0 || p.y > alto) p.vy = -p.vy;
    });
  }

  function escenaCanvas(host) {
    var c = document.createElement('canvas');
    c.className = 'rb-lienzo';
    host.appendChild(c);
    var ctx = c.getContext ? c.getContext('2d') : null;
    var ancho = host.clientWidth || 360, alto = 420, dpr = window.devicePixelRatio || 1, lista = [];
    if (!ctx) return null;
    c.width = Math.round(ancho * dpr); c.height = Math.round(alto * dpr);
    c.style.width = ancho + 'px'; c.style.height = alto + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {
      poner: function (n) { lista = piezas(n, ancho, alto); },
      animar: function () {
        mover(lista, ancho, alto);
        ctx.fillStyle = '#0B0B12'; ctx.fillRect(0, 0, ancho, alto);
        lista.forEach(function (p) {
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.a * Math.PI / 180);
          ctx.beginPath();
          for (var k = 0; k < 6; k++) {
            var ang = k * Math.PI / 3, r = k % 2 ? p.lado * 0.7 : p.lado;
            ctx[k ? 'lineTo' : 'moveTo'](Math.cos(ang) * r, Math.sin(ang) * r);
          }
          ctx.closePath();
          ctx.fillStyle = '#1B1B28'; ctx.fill();
          ctx.shadowColor = p.color; ctx.shadowBlur = 8;
          ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
        });
      },
      quitar: function () { c.remove(); }
    };
  }

  function escenaCSS(host) {
    var cont = document.createElement('div');
    cont.className = 'rb-css3d';
    host.appendChild(cont);
    var ancho = host.clientWidth || 360, alto = 420, lista = [], nodos = [];
    return {
      poner: function (n) {
        cont.innerHTML = '';
        lista = piezas(n, ancho, alto);
        nodos = lista.map(function (p) {
          var d = document.createElement('div');
          d.className = 'rb-pieza';
          d.style.width = d.style.height = Math.round(p.lado * 1.6) + 'px';
          d.style.borderColor = p.color;
          d.style.boxShadow = '0 0 8px ' + p.color;
          cont.appendChild(d);
          return d;
        });
      },
      animar: function () {
        mover(lista, ancho, alto);
        for (var i = 0; i < lista.length; i++) {
          var p = lista[i];
          nodos[i].style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,' + p.z.toFixed(1) + 'px) rotate3d(1,1,0,' + p.a.toFixed(1) + 'deg)';
        }
      },
      quitar: function () { cont.remove(); }
    };
  }

  /* Una pieza de papel, dibujada una sola vez en su propio lienzo. */
  function hojaDePapel(lado, colores, dpr, semilla) {
    var m = 14, t = Math.ceil((lado * 2 + m * 2) * dpr);
    var c = document.createElement('canvas');
    c.width = c.height = t;
    var g = c.getContext ? c.getContext('2d') : null;
    if (!g) return null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cx = lado + m, cy = lado + m, s = semilla;
    function azar() { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }
    var pts = [];
    for (var k = 0; k < 12; k++) {
      var ang = k * Math.PI / 6, r = (k % 2 ? lado * 0.78 : lado) + azar() * 1.6;
      pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
    }
    function forma(dx, dy) {
      g.beginPath();
      pts.forEach(function (q, i) { g[i ? 'lineTo' : 'moveTo'](q[0] + dx, q[1] + dy); });
      g.closePath();
    }
    /* Sombra ambiental y canto del papel. */
    g.save();
    g.shadowColor = 'rgba(42,30,20,.42)'; g.shadowBlur = 7; g.shadowOffsetX = 4; g.shadowOffsetY = 6;
    forma(1.6, 1.9); g.fillStyle = colores[1]; g.fill();
    g.restore();
    /* Cara con luz de arriba a la izquierda. */
    forma(0, 0);
    var grad = g.createLinearGradient ? g.createLinearGradient(cx - lado, cy - lado, cx + lado, cy + lado) : null;
    if (grad && grad.addColorStop) {
      grad.addColorStop(0, 'rgba(255,255,255,.18)'); grad.addColorStop(0.5, 'rgba(255,255,255,0)'); grad.addColorStop(1, 'rgba(0,0,0,.12)');
    }
    g.fillStyle = colores[0]; g.fill();
    if (grad && grad.addColorStop) { g.fillStyle = grad; g.fill(); }
    /* Bisel: borde claro arriba a la izquierda, oscuro abajo a la derecha. */
    g.save(); forma(0, 0); g.clip();
    g.lineWidth = 2.4;
    forma(-1, -1); g.strokeStyle = 'rgba(0,0,0,.22)'; g.stroke();
    forma(1, 1); g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke();
    g.restore();
    /* Fibra del papel: ruido fino, solo sobre la cara. */
    var img = g.getImageData ? g.getImageData(0, 0, t, t) : null;
    if (img && img.data) {
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 200) { var n = (Math.random() - 0.5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      }
      g.putImageData(img, 0, 0);
    }
    return { lienzo: c, mitad: t / dpr / 2 };
  }

  function escenaImagen(host) {
    var c = document.createElement('canvas');
    c.className = 'rb-lienzo';
    host.appendChild(c);
    var ctx = c.getContext ? c.getContext('2d') : null;
    var ancho = host.clientWidth || 360, alto = 420, dpr = window.devicePixelRatio || 1, lista = [], hojas = [];
    if (!ctx) return null;
    c.width = Math.round(ancho * dpr); c.height = Math.round(alto * dpr);
    c.style.width = ancho + 'px'; c.style.height = alto + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* Antes de medir: 5 colores × 3 tamaños, dibujados una vez. */
    PAPEL.forEach(function (col, i) { [18, 24, 30].forEach(function (lado, j) { var h = hojaDePapel(lado, col, dpr, 11 + i * 3 + j); if (h) hojas.push(h); }); });
    return {
      hojas: hojas.length,
      poner: function (n) { lista = piezas(n, ancho, alto); },
      animar: function () {
        mover(lista, ancho, alto);
        ctx.fillStyle = '#E6CFA2'; ctx.fillRect(0, 0, ancho, alto);
        for (var i = 0; i < lista.length; i++) {
          var p = lista[i], h = hojas[i % hojas.length];
          if (!h) continue;
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.a * Math.PI / 180);
          ctx.drawImage(h.lienzo, -h.mitad, -h.mitad, h.mitad * 2, h.mitad * 2);
          ctx.restore();
        }
      },
      quitar: function () { c.remove(); }
    };
  }

  /* ---------- Una prueba completa: todos los escalones de un modo ---------- */
  function correr(modo, alTerminar) {
    var host = $('#rb-escena');
    var escena = modo === 'canvas' ? escenaCanvas(host) : modo === 'imagen' ? escenaImagen(host) : escenaCSS(host);
    if (!escena) { alTerminar(null); return; }
    var filas = [], i = 0;
    function paso() {
      if (i >= CFG.pasos.length) { escena.quitar(); alTerminar(filas); return; }
      var n = CFG.pasos[i];
      escena.poner(n);
      aviso('Midiendo ' + MODOS[modo] + ' con ' + n + ' piezas… (' + (i + 1) + ' de ' + CFG.pasos.length + ')');
      var t0 = null, previo = null, deltas = [];
      function cuadro() {
        var t = ahora();
        if (t0 === null) { t0 = previo = t; raf(cuadro); return; }
        escena.animar(t);
        if (t - t0 > CFG.calentar) deltas.push(t - previo);
        previo = t;
        if (t - t0 < CFG.calentar + CFG.medir) raf(cuadro);
        else { filas.push(resumir(n, deltas, memoria())); i++; setTimeout(paso, 300); }
      }
      raf(cuadro);
    }
    paso();
  }

  /* ---------- Pantalla ---------- */
  function aviso(t) { var a = $('#rb-aviso'); if (a) a.textContent = t; }

  function equipo() {
    var n = navigator || {};
    return [
      ['Pantalla (CSS)', (window.innerWidth || 0) + ' × ' + (window.innerHeight || 0)],
      ['Densidad (devicePixelRatio)', String(window.devicePixelRatio || 1)],
      ['Núcleos (hardwareConcurrency)', n.hardwareConcurrency ? String(n.hardwareConcurrency) : 'no disponible'],
      ['Memoria del equipo (deviceMemory)', n.deviceMemory ? n.deviceMemory + ' GB' : 'no disponible'],
      ['Navegador', (n.userAgent || '').replace(/\s+/g, ' ').slice(0, 160) || 'no disponible']
    ];
  }

  function textoResultados() {
    var l = ['SAMSAN · prueba de rendimiento (RB01)', 'Umbral: percentil 5 de FPS ≥ ' + CFG.umbral + ' con ' + CFG.referencia + ' piezas.'];
    equipo().forEach(function (f) { l.push(f[0] + ': ' + f[1]); });
    Object.keys(MODOS).forEach(function (m) {
      var r = estado.resultados[m];
      l.push('');
      l.push(MODOS[m] + ': ' + veredicto(r));
      if (r && r.filas) r.filas.forEach(function (f) {
        l.push('  ' + f.piezas + ' piezas · FPS ' + f.fps + ' · FPS p5 ' + f.fpsP5 + ' · ' + (f.sostiene ? 'se sostiene' : 'no se sostiene') +
          ' · memoria JS aproximada ' + (f.memoriaMB === null ? 'no disponible' : f.memoriaMB + ' MB'));
      });
    });
    return l.join('\n');
  }

  function veredicto(r) {
    if (!r) return 'sin correr';
    if (r.interrumpida) return 'se interrumpió: la pestaña se recargó, se cerró o se apagó la pantalla';
    if (!r.filas) return 'no disponible en este navegador';
    var alto = escalonSostenido(r.filas);
    var ref = r.filas.filter(function (f) { return f.piezas === CFG.referencia; })[0];
    return 'escalón más alto que se sostiene: ' + (alto === null ? 'ninguno' : alto + ' piezas') +
      ' · ' + (ref && ref.sostiene ? 'AGUANTA' : 'NO AGUANTA') + ' según el umbral';
  }

  function tabla() {
    var h = '<table class="rb-tabla"><thead><tr><th>Prueba</th><th>Piezas</th><th>FPS</th><th>FPS p5</th><th>¿Aguanta?</th><th>Memoria JS</th></tr></thead><tbody>';
    Object.keys(MODOS).forEach(function (m) {
      var r = estado.resultados[m];
      if (!r || !r.filas) {
        h += '<tr data-modo="' + m + '"><td>' + MODOS[m] + '</td><td colspan="5">' + esc(veredicto(r)) + '</td></tr>';
        return;
      }
      r.filas.forEach(function (f) {
        h += '<tr data-modo="' + m + '" data-piezas="' + f.piezas + '"><td>' + MODOS[m] + '</td><td>' + f.piezas + '</td><td>' + f.fps + '</td><td>' + f.fpsP5 + '</td>' +
          '<td>' + (f.sostiene ? '✓ sí' : '✗ no') + '</td><td>' + (f.memoriaMB === null ? 'no disponible' : f.memoriaMB + ' MB') + '</td></tr>';
      });
    });
    return h + '</tbody></table>';
  }

  function pintar() {
    var eq = equipo().map(function (f) { return '<tr><th scope="row">' + f[0] + '</th><td>' + esc(f[1]) + '</td></tr>'; }).join('');
    $('#proto').innerHTML =
      '<section class="k-panel rb-panel">' +
        '<p class="k-rotulo">RB01 · para el padre</p>' +
        '<h2>¿Aguanta este teléfono el estilo de papel?</h2>' +
        '<p>Antes de empezar: teléfono cargado o conectado, <b>ahorro de batería apagado</b>, sin otras apps abiertas. Cada prueba dura unos 30 segundos; no toques la pantalla mientras corre.</p>' +
        '<p class="rb-umbral">Umbral fijado antes de medir: aguanta si el <b>percentil 5 de FPS es de ' + CFG.umbral + ' o más con ' + CFG.referencia + ' piezas</b>.</p>' +
        '<div class="k-botones">' +
          '<button type="button" class="k-boton k-boton--primario" id="play" data-modo="canvas">Probar Canvas</button>' +
          '<button type="button" class="k-boton" id="rb-css3d" data-modo="css3d">Probar CSS 3D</button>' +
          '<button type="button" class="k-boton" id="rb-imagen" data-modo="imagen">Probar papel pre-dibujado</button>' +
        '</div>' +
        '<p id="rb-aviso" aria-live="polite"></p>' +
        '<div id="rb-escena" class="rb-escena"></div>' +
        '<h3>Resultados</h3>' +
        '<div id="rb-resultados">' + tabla() + '</div>' +
        '<ul class="rb-veredictos">' + Object.keys(MODOS).map(function (m) { return '<li><b>' + MODOS[m] + ':</b> ' + esc(veredicto(estado.resultados[m])) + '</li>'; }).join('') + '</ul>' +
        '<div class="k-botones">' +
          '<button type="button" class="k-boton" id="rb-copiar">Copiar resultados</button>' +
          '<button type="button" class="k-boton" id="rb-borrar">Borrar resultados</button>' +
        '</div>' +
        '<textarea id="rb-texto" class="rb-texto" readonly aria-label="Resultados en texto"></textarea>' +
        '<h3>Este equipo</h3><table class="rb-tabla rb-equipo"><tbody>' + eq + '</tbody></table>' +
        '<p class="rb-nota">La memoria es solo la de JavaScript y aproximada; no cuenta la del procesador gráfico. Nada de esta página sale del teléfono.</p>' +
      '</section>';
    $('#rb-texto').value = textoResultados();
    Array.prototype.forEach.call(document.querySelectorAll('[data-modo]'), function (b) {
      if (b.tagName === 'BUTTON') b.addEventListener('click', function () { empezar(b.getAttribute('data-modo')); });
    });
    $('#rb-copiar').addEventListener('click', copiar);
    $('#rb-borrar').addEventListener('click', function () { estado = { resultados: {} }; guardar(estado); pintar(); });
  }

  function copiar() {
    var texto = textoResultados(), area = $('#rb-texto');
    area.value = texto;
    function aMano() { area.focus(); area.select(); try { document.execCommand('copy'); aviso('Copiado. Pégalo en tus notas.'); } catch (e) { aviso('Selecciona el texto de abajo y cópialo.'); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { aviso('Copiado. Pégalo en tus notas.'); }, aMano);
    else aMano();
  }

  function empezar(modo) {
    if (corriendo) return;
    if (yaCorrio) {
      /* Cada prueba con la página recién cargada, para que la anterior no caliente ni ensucie la medición. */
      estado.pendiente = modo; guardar(estado);
      try { window.location.reload(); } catch (e) { /* sin recarga posible */ }
      return;
    }
    yaCorrio = corriendo = true;
    estado.enCurso = modo; guardar(estado);
    Array.prototype.forEach.call(document.querySelectorAll('button'), function (b) { b.disabled = true; });
    var oculta = false;
    function alOcultar() { if (document.hidden) oculta = true; }
    document.addEventListener('visibilitychange', alOcultar);
    correr(modo, function (filas) {
      document.removeEventListener('visibilitychange', alOcultar);
      corriendo = false;
      delete estado.enCurso;
      estado.resultados[modo] = oculta ? { interrumpida: true } : { filas: filas, fecha: new Date().toISOString().slice(0, 10) };
      guardar(estado);
      pintar();
      var falta = Object.keys(MODOS).filter(function (m) { return !estado.resultados[m]; })[0];
      aviso(MODOS[modo] + ' terminado. ' + (falta ? 'Ahora toca «Probar ' + MODOS[falta] + '».' : 'Ya están las tres pruebas: toca «Copiar resultados».'));
      if (window.RB01_ALTERMINAR) window.RB01_ALTERMINAR(modo, estado.resultados[modo]);
    });
  }

  /* Estilos propios de esta página (panel claro, texto oscuro: contraste AA). */
  var css = document.createElement('style');
  css.textContent = [
    '.rb-panel{max-width:760px;margin:0 auto}',
    '.rb-umbral{padding:8px 12px;border:3px solid #1E1426;border-radius:10px;background:#FFF3C4;color:#1E1426}',
    '.rb-escena{position:relative;margin:10px 0;min-height:0;overflow:hidden;border-radius:10px}',
    '.rb-escena:not(:empty){min-height:420px;background:#0B0B12}',
    '.rb-lienzo{display:block}',
    '.rb-css3d{position:absolute;inset:0;perspective:600px;transform-style:preserve-3d}',
    '.rb-pieza{position:absolute;left:0;top:0;background:#1B1B28;border:2px solid;border-radius:3px;transform-style:preserve-3d;will-change:transform}',
    '.rb-tabla{width:100%;border-collapse:collapse;margin:6px 0 10px;font-size:.95rem;color:#1E1426;background:#FFFDF6}',
    '.rb-tabla th,.rb-tabla td{border:2px solid #1E1426;padding:4px 6px;text-align:left;vertical-align:top}',
    '.rb-equipo td{overflow-wrap:anywhere}',
    '.rb-tabla thead th{background:#FFF3C4}',
    '.rb-veredictos{padding-left:18px}',
    '.rb-texto{width:100%;min-height:120px;font:.85rem/1.3 ui-monospace,monospace;color:#1E1426;background:#FFFDF6;border:2px solid #1E1426;border-radius:8px;padding:6px}',
    '.rb-nota{font-size:.9rem}',
    '@media (max-width:600px){.rb-tabla{font-size:.78rem}.rb-tabla th,.rb-tabla td{padding:3px}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Arranque ---------- */
  if (estado.enCurso && !estado.pendiente) {
    /* La prueba anterior no terminó: la pestaña se recargó o se cerró sola. */
    estado.resultados[estado.enCurso] = { interrumpida: true };
    delete estado.enCurso;
    guardar(estado);
  }
  pintar();
  if (estado.pendiente) {
    var modo = estado.pendiente;
    delete estado.pendiente; delete estado.enCurso;
    guardar(estado);
    empezar(modo);
  }

  window.RB01_REND = { resumir: resumir, escalonSostenido: escalonSostenido, veredicto: veredicto, CFG: CFG, estado: function () { return estado; } };
})();
