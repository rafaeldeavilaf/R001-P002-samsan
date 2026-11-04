/* ============================================================
   SAMSAN — LO COMUN DE LOS JUEGOS DE REPASO (prototipos/comun/)
   Se incluye solo en los bocetos que declaran `// usa: repaso`.
   Agrega a PROTO_COMUN, sin tocar lo que ya hay:
     P.vozEn      voz en ingles, solo voces locales (regla 2)
     P.pistas     escalera de tres peldanos: sube con cada fallo, con
                  20 s sin accion o al pulsar HINT (decisiones-vigentes §3)
     P.teclado    teclado numerico en pantalla (formato de cuaderno)
     P.repaso     secuencia de rondas: inicio, rondas, gema por ronda, final
   Los textos viven en cada juego, no aqui, salvo los rotulos de la interfaz.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN;
  if (!P) return;
  var $ = P.$;
  var MENOS = '−';

  /* ---------- Estilos ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.rp{position:relative;max-width:760px;margin:0 auto}',
    '.rp-cab{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}',
    '.rp-cab h2{margin:0;font-size:1.2rem}',
    '.rp-der{display:flex;align-items:center;gap:8px}',
    '.rp-gemas{display:inline-flex;align-items:center;gap:6px;padding:2px 12px 2px 6px;border:3px solid #1E1426;border-radius:999px;background:#FFFDF6;font-weight:900}',
    '.rp-gemas svg{width:22px;height:22px;display:block}',
    '.rp-voz{min-width:48px;min-height:48px;padding:0;font-size:1rem}',
    '.rp-voz svg{width:26px;height:26px;display:block;margin:auto}',
    '.rp-menu{min-height:48px;padding:0 14px;font-size:1rem}',
    /* Barra fija abajo: HINT, DONE y NEXT siempre a la vista (telefono y portatil). */
    '.rp .rp-pie .k-mensaje{flex:1 1 100%;margin:0 0 6px;min-height:0}',
    '.rp-pie .k-mensaje:empty{display:none}',
    '.rp-tec{scroll-margin-bottom:var(--rp-barra,180px)}',
    '@media (max-width:600px) and (max-height:760px){.rp-tec{gap:6px}.rp-tec output{min-height:44px;font-size:1.4rem;padding:4px}.rp-tec__k{gap:6px}.rp-tec__k .k-boton{min-height:46px}}',
    '.rp-pie{position:sticky;bottom:0;z-index:20;margin:10px -12px -12px;padding:8px 12px;background:var(--panel,#F7EFDD);border-top:3px solid #1E1426;border-radius:0 0 10px 10px}',
    '@media (max-width:600px){' +
      '.k-pagina{padding:8px 8px 24px}.k-pagina > header .k-titulo{font-size:1.3rem;margin:0}.k-pagina > header .k-lema{display:none}' +
      '.rp-mundo{padding:6px 4px;border-radius:10px}.rp-mundo > .k-panel{padding:10px}' +
      '.rp-cab .k-rotulo{display:none}.rp-cab{align-items:center}.rp-pips{margin:4px 0 0}' +
      '.es-actor.dice-izq-movil .es-dice{bottom:auto;top:0;left:auto;right:100%;transform:none;margin:0 8px 0 0;animation:none}.es-actor.dice-izq-movil .es-dice::after{display:none}' +
      '.rp-pie{flex-wrap:wrap}' +
      '.rp-cab h2{font-size:1.05rem}.rp-der{gap:6px;flex-wrap:wrap}.rp-oir span{display:none}.rp-voz{min-width:44px;min-height:44px}.rp-menu{min-height:44px;padding:0 10px;font-size:.9rem}' +
      '.rp-consigna{font-size:1.15rem;margin:4px 0}.rp-pie{margin:8px -10px -10px;padding:8px 10px}.rp-pie .k-boton{min-height:52px}' +
      '.es{height:84px!important;margin:4px 0 6px}.es-actor img{height:48px!important}.es-luz{top:6px}' +
    '}',
    '.rp-oir{display:inline-flex;align-items:center;gap:4px;padding:0 10px;font-size:.85rem;font-weight:900}',
    '.rp-oir svg{margin:0}',
    '.rp-gema-grande{display:flex;justify-content:center;margin:6px 0}',
    '.rp-gema-grande img{animation:rp-brilla 1.2s ease-in-out infinite alternate}',
    '@keyframes rp-brilla{0%{transform:scale(1)}100%{transform:scale(1.12)}}',
    '@media (prefers-reduced-motion:reduce){.rp-gema-grande img{animation:none}}',
    '.rp-pips{display:flex;gap:8px;margin:8px 0 2px;align-items:center}',
    '.rp-pips i{width:16px;height:16px;border:3px solid #1E1426;border-radius:50%;background:#FFFDF6;display:block}',
    '.rp-pips i.is-hecho{background:#2F9BB8}',
    '.rp-pips i.is-ahora{border-radius:4px;background:#F2B73A;transform:scale(1.15)}',
    '.rp-consigna{font-size:clamp(1.2rem,4.4vw,1.65rem);font-weight:900;margin:8px 0 2px;line-height:1.25}',
    '.rp-eq{min-height:2.2em;font-size:clamp(1.3rem,5vw,2rem);font-weight:900;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}',
    '.rp-eq span{padding:0 8px;border:3px solid #1E1426;border-radius:10px;background:#FFFDF6;min-width:1.6em;text-align:center}',
    '.rp-eq span.is-base{background:#D8F6FA}',
    '.rp-eq span.is-hueco{border-style:dashed;color:#5C4A3B}',
    '.rp-eq span.is-bien{background:#D8F0C8}',
    '.rp-eq em{font-style:normal}',
    '.rp .k-mensaje{min-height:2.6em}',
    '.rp-pie{margin-top:10px}',
    '.rp-pie .k-boton{min-height:56px}',
    '.rp-hint{background:#FFF3C4}',
    '.rp-caja{margin-top:10px;padding:10px 14px;border:3px dashed #8A6A1E;border-radius:10px;background:#FFF3C4;font-weight:800}',
    '.rp-caja b{display:inline-block;margin-right:6px;padding:0 8px;border-radius:999px;background:#1E1426;color:#FFF3C4}',
    '.rp-tec{display:grid;gap:8px;max-width:330px;margin:10px auto 0}',
    '.rp-tec output{display:block;min-height:64px;padding:8px;border:3px solid #1E1426;border-radius:10px;background:#FFFDF6;font-size:2rem;font-weight:900;text-align:center;letter-spacing:.1em}',
    '.rp-tec__k{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
    '.rp-tec__k .k-boton{padding:0}',
    '.rp-tec__k .k-boton.is-ok{background:#9BE07A}',
    '@media (max-height:800px){.rp-tec output{min-height:52px;font-size:1.6rem}.rp-tec__k .k-boton{min-height:56px}}',
    '.rp-mundo{position:relative;max-width:820px;margin:0 auto;padding:18px;border:3px solid #1E1426;border-radius:14px;background-color:#1A1C36;background-size:144px 144px;image-rendering:pixelated;box-shadow:0 6px 0 #1E1426}',
    '.rp-mundo::before,.rp-mundo::after{content:"";position:absolute;top:6px;width:10px;height:16px;border:2px solid #1E1426;border-radius:3px;background:linear-gradient(#FFF7D6 0 30%,#FCD34D 30% 70%,#F59E0B 70%);box-shadow:0 0 14px 4px rgba(252,211,77,.55)}',
    '.rp-mundo::before{left:2px}.rp-mundo::after{right:2px}',
    '.rp-mundo > .k-panel{position:relative;z-index:1}',
    '@media (max-width:520px){.rp-mundo{padding:10px 8px;border-radius:10px}.rp-mundo::before,.rp-mundo::after{display:none}}',
    '.rp-pj{display:flex;justify-content:center;align-items:flex-end;gap:18px;min-height:76px;margin:6px 0 4px}',
    '.rp-pj img{height:72px;width:auto;image-rendering:pixelated;display:block;animation:rp-bob 1s steps(2) infinite}',
    '.rp-pj img + img{animation-delay:.5s}',
    '@keyframes rp-bob{0%{transform:translateY(0)}100%{transform:translateY(-3px)}}',
    'img.proto-gema__svg{image-rendering:pixelated;display:inline-block;object-fit:contain}',
    '@media (prefers-reduced-motion:reduce){.rp-pj img{animation:none}}',
    '.rp-intro{text-align:center}',
    '.rp-intro .k-botones{justify-content:center}',
    '@media (prefers-reduced-motion:reduce){.rp-pips i.is-ahora{transform:none}}'
  ].join('');
  document.head.appendChild(css);

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  P.esc = esc;

  /* ---------- Pixel art comun ----------
     Textura de pizarra de la Caverna (por codigo, paleta del juego) para el marco
     de las rondas, y la gema de PixelLab (pl-012, procesada con tools/arte/). */
  var TEXTURA = null;
  P.texturaRoca = function () {
    if (TEXTURA !== null) return TEXTURA;
    TEXTURA = '';
    try {
      var PAL = (window.SAMSAN_MUNDO && window.SAMSAN_MUNDO.PAL) || {};
      var R = PAL.pizarra || ['#0E0F20', '#1A1C36', '#262B4C', '#34406A', '#4E5F92'];
      var N = 48, cv = document.createElement('canvas'); cv.width = N; cv.height = N;
      var g = cv.getContext && cv.getContext('2d'); if (!g) return TEXTURA;
      var semilla = 7, rnd = function () { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
      var pts = []; for (var i = 0; i < 11; i++) pts.push([rnd() * N, rnd() * N, 1 + Math.floor(rnd() * 3)]);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var d1 = 1e9, d2 = 1e9, k1 = 0, dx1 = 0, dy1 = 0;
        for (var k = 0; k < pts.length; k++) for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
          var dx = x - (pts[k][0] + ox * N), dy = y - (pts[k][1] + oy * N), d = Math.sqrt(dx * dx + dy * dy);
          if (d < d1) { d2 = d1; d1 = d; k1 = k; dx1 = dx; dy1 = dy; } else if (d < d2) d2 = d;
        }
        var col = R[pts[k1][2]];
        if (d2 - d1 < 1.6) col = R[0];
        else if (dx1 < -2 && dy1 < -2 && d1 > 3) col = R[Math.min(4, pts[k1][2] + 1)];
        else if (dx1 > 2 && dy1 > 2) col = R[Math.max(1, pts[k1][2] - 1)];
        g.fillStyle = col; g.fillRect(x, y, 1, 1);
      }
      TEXTURA = cv.toDataURL();
    } catch (e) { TEXTURA = ''; }
    return TEXTURA;
  };
  var GEMA = ((window.SAMSAN_IMG || {}).caverna || {}).gema;
  if (GEMA) {
    P.gemaSVG = function (px) {
      return '<img class="proto-gema__svg" alt="" src="' + GEMA + '" width="' + px + '" height="' + Math.round(px * 38 / 46) + '">';
    };
  }
  function marcoMundo(html) {
    var t = P.texturaRoca();
    return '<div class="rp-mundo"' + (t ? ' style="background-image:url(' + t + ')"' : '') + '>' + html + '</div>';
  }
  P.marcoMundo = marcoMundo;
  /* Explorador y topo para las pantallas de ronda. */
  function personajes(host) {
    if (!host) return;
    var topo = ((window.SAMSAN_IMG || {}).caverna || {})['companero-topo'];
    host.innerHTML = topo ? '<img alt="" data-pj="topo" src="' + topo + '">' : '';
    if (P.explorador) P.explorador(P.piel).then(function (u) {
      if (!u || !host.isConnected) return;
      var im = document.createElement('img'); im.alt = ''; im.src = u; im.setAttribute('data-pj', 'ex');
      host.insertBefore(im, host.firstChild);
    });
  }


  /* ---------- Escena viva (pixel art, por codigo) ----------
     Una franja de caverna con personajes que reaccionan a lo que hace el nino.
       var E = P.escena(host, { alto: 120, mostrador: true });
       E.actor('topo', { img: 'topo' | 'ex', x: 22, abajo: 14 })   x en % del ancho
       E.mover(id, x, ms)  E.animar(id, 'salta'|'niega'|'asiente'|'feliz'|'cava')
       E.decir(id, texto)  E.premio(x)  (gema que salta con chispas)
     Las burbujas son paneles claros con texto oscuro (regla 9). */
  var EXP = null;
  P.urlExplorador = function () {
    if (!EXP) EXP = P.explorador ? P.explorador(P.piel) : Promise.resolve(null);
    return EXP;
  };
  P.reiniciarExplorador = function () { EXP = null; };
  var cssEs = document.createElement('style');
  cssEs.textContent = [
    '.es{position:relative;overflow:hidden;margin:6px 0 8px;border:3px solid #1E1426;border-radius:10px;background-color:#1A1C36;background-size:144px 144px;image-rendering:pixelated}',
    '.es-suelo{position:absolute;left:0;right:0;bottom:0;height:14px;background:linear-gradient(#9A3B2C 0 3px,#5B1F2A 3px 9px,#2A1024 9px);border-top:2px solid #1E1426}',
    '.es-luz{position:absolute;top:10px;width:10px;height:16px;border:2px solid #1E1426;border-radius:3px;background:linear-gradient(#FFF7D6 0 30%,#FCD34D 30% 70%,#F59E0B 70%);box-shadow:0 0 18px 8px rgba(252,211,77,.45);animation:es-llama 1.6s steps(3) infinite}',
    '@keyframes es-llama{0%{box-shadow:0 0 18px 8px rgba(252,211,77,.45)}50%{box-shadow:0 0 12px 5px rgba(252,211,77,.30)}100%{box-shadow:0 0 20px 9px rgba(252,211,77,.50)}}',
    '.es-cristal{position:absolute;bottom:14px;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:14px solid #7FE3F0;filter:drop-shadow(0 0 4px #7FE3F0)}',
    '.es-mostrador{position:absolute;bottom:14px;height:30px;z-index:3;background:linear-gradient(#D19A5E 0 4px,#A0643A 4px 22px,#6B3D22 22px);border:3px solid #1E1426;border-bottom:0;box-sizing:border-box}',
    '.es-mostrador::after{content:"BEADS";position:absolute;left:50%;top:7px;transform:translateX(-50%);padding:0 6px;border:2px solid #1E1426;border-radius:4px;background:#FFF3C4;color:#1E1426;font-weight:900;font-size:.72rem;letter-spacing:.08em}',
    '.es-actor{position:absolute;z-index:2;transform:translateX(-50%);transition:left .9s linear}',
    '.es-actor.is-frente{z-index:4}',
    '.es-actor img{display:block;height:64px;width:auto;image-rendering:pixelated;animation:es-bob 1s steps(2) infinite}',
    '.es-actor.is-camina img{animation:es-paso .25s steps(2) infinite}',
    '.es-actor.is-salta img{animation:es-salta .45s ease-out 2}',
    '.es-actor.is-feliz img{animation:es-salta .4s ease-out 3}',
    '.es-actor.is-niega img{animation:es-niega .45s ease-in-out 2}',
    '.es-actor.is-asiente img{animation:es-asiente .35s ease-in-out 2}',
    '.es-actor.is-cava img{animation:es-cava .2s steps(2) 4}',
    '@keyframes es-bob{0%{transform:translateY(0)}100%{transform:translateY(-2px)}}',
    '@keyframes es-paso{0%{transform:translateY(0)}100%{transform:translateY(-4px)}}',
    '@keyframes es-salta{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}',
    '@keyframes es-niega{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}',
    '@keyframes es-asiente{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}',
    '@keyframes es-cava{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(5px) rotate(6deg)}}',
    '.es-dice{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:4px;padding:2px 10px;border:3px solid #1E1426;border-radius:12px;background:#FFFDF6;color:#1E1426;font-weight:900;font-size:.95rem;white-space:nowrap;box-shadow:0 3px 0 #1E1426;animation:es-pop .2s ease-out}',
    '.es-dice::after{content:"";position:absolute;left:50%;top:100%;margin-left:-6px;border:6px solid transparent;border-top-color:#1E1426}',
    '.es-actor.dice-lado .es-dice{bottom:auto;top:2px;left:100%;transform:none;margin:0 0 0 8px;animation:none}',
    '.es-actor.dice-lado .es-dice::after{left:auto;right:100%;top:8px;margin:0;border-top-color:transparent;border-right-color:#1E1426}',
    '.es-premio{position:absolute;z-index:5;transform:translateX(-50%);animation:es-gema 1.4s ease-out forwards;pointer-events:none}',
    '.es-premio svg{display:block;filter:drop-shadow(0 0 6px #FFD34D)}',
    '@keyframes es-gema{0%{transform:translate(-50%,10px) scale(.4);opacity:0}25%{transform:translate(-50%,-26px) scale(1.15);opacity:1}70%{transform:translate(-50%,-30px) scale(1);opacity:1}100%{transform:translate(-50%,-44px) scale(.8);opacity:0}}',
    '.es-chispa{position:absolute;z-index:5;width:6px;height:6px;background:#FFF3B0;box-shadow:0 0 6px #FFD34D;pointer-events:none;animation:es-chispa .7s ease-out forwards}',
    '@keyframes es-chispa{0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--dx),var(--dy));opacity:0}}',
    '@keyframes es-pop{0%{transform:translateX(-50%) scale(.6)}100%{transform:translateX(-50%) scale(1)}}',
    '@media (max-width:520px){.es-actor img{height:52px}.es-dice{font-size:.85rem}}',
    '@media (prefers-reduced-motion:reduce){.es-luz,.es-actor img,.es-premio,.es-chispa,.es-dice{animation:none!important}.es-actor{transition:none}}'
  ].join('');
  document.head.appendChild(cssEs);

  /* Chispas y gema que salta, en cualquier contenedor con position:relative. */
  P.chispas = function (cont, xPx, yPx) {
    if (!cont) return;
    for (var i = 0; i < 8; i++) {
      var c = document.createElement('i'); c.className = 'es-chispa';
      var a = i / 8 * Math.PI * 2;
      c.style.left = xPx + 'px'; c.style.top = yPx + 'px';
      c.style.setProperty('--dx', Math.round(Math.cos(a) * 30) + 'px'); c.style.setProperty('--dy', Math.round(Math.sin(a) * 30) + 'px');
      cont.appendChild(c);
      (function (c) { setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 800); })(c);
    }
  };
  /* Estrella por reto resuelto (la gema es de la ronda completa: regla 4). */
  P.estrellaSVG = function (px) {
    return '<svg class="es-estrella" width="' + px + '" height="' + px + '" viewBox="0 0 9 9" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="4" y="0" width="1" height="2" fill="#1E1426"/><rect x="3" y="2" width="3" height="1" fill="#1E1426"/><rect x="0" y="3" width="9" height="1" fill="#1E1426"/>' +
      '<rect x="1" y="4" width="7" height="1" fill="#1E1426"/><rect x="2" y="5" width="5" height="1" fill="#1E1426"/><rect x="1" y="6" width="7" height="2" fill="#1E1426"/><rect x="0" y="8" width="3" height="1" fill="#1E1426"/><rect x="6" y="8" width="3" height="1" fill="#1E1426"/>' +
      '<rect x="4" y="1" width="1" height="2" fill="#FFD34D"/><rect x="1" y="3" width="7" height="1" fill="#FFD34D"/><rect x="2" y="4" width="5" height="2" fill="#FFD34D"/>' +
      '<rect x="3" y="3" width="1" height="1" fill="#FFF3B0"/><rect x="2" y="6" width="2" height="1" fill="#C98A1C"/><rect x="5" y="6" width="2" height="1" fill="#C98A1C"/><rect x="1" y="7" width="1" height="1" fill="#C98A1C"/><rect x="7" y="7" width="1" height="1" fill="#C98A1C"/></svg>';
  };
  P.premio = function (cont, xCss, bottomPx) {
    if (!cont) return;
    var d = document.createElement('div'); d.className = 'es-premio';
    d.style.left = xCss; d.style.bottom = (bottomPx || 20) + 'px';
    d.innerHTML = P.estrellaSVG(34);
    cont.appendChild(d);
    P.sonido('veta');
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1500);
  };

  P.escena = function (host, o) {
    o = o || {};
    var alto = o.alto || 120, actores = {}, timers = [];
    var el = document.createElement('div');
    el.className = 'es'; el.style.height = alto + 'px';
    var t = P.texturaRoca(); if (t) el.style.backgroundImage = 'url(' + t + ')';
    el.innerHTML = '<div class="es-suelo"></div><i class="es-luz" style="left:6%"></i><i class="es-luz" style="left:92%;animation-delay:.5s"></i>' +
      '<i class="es-cristal" style="left:3%"></i><i class="es-cristal" style="left:97%"></i>' +
      (o.mostrador ? '<div class="es-mostrador" style="left:' + (o.mostrador.de || 8) + '%;width:' + (o.mostrador.ancho || 46) + '%"></div>' : '');
    host.appendChild(el);
    function fuente(img, cb) {
      if (img === 'ex') { P.urlExplorador().then(function (u) { cb(u || ''); }); return; }
      if (img === 'topo') { cb(((window.SAMSAN_IMG || {}).caverna || {})['companero-topo'] || ''); return; }
      cb(img || '');
    }
    var E = {
      el: el,
      actor: function (id, a) {
        var d = document.createElement('div');
        d.className = 'es-actor' + (a.frente ? ' is-frente' : '') + (a.diceLado ? ' dice-lado' : '') + (a.diceIzq ? ' dice-izq-movil' : ''); d.setAttribute('data-actor', id);
        d.style.left = (a.x != null ? a.x : 50) + '%'; d.style.bottom = (a.abajo != null ? a.abajo : 14) + 'px';
        if (a.sinTransicion) d.style.transition = 'none';
        el.appendChild(d); actores[id] = d;
        fuente(a.img, function (src) {
          if (!d.isConnected && !el.isConnected) return;
          d.insertAdjacentHTML('afterbegin', src ? '<img alt="" src="' + src + '">' : '');
        });
        return d;
      },
      mover: function (id, x, alLlegar) {
        var d = actores[id]; if (!d) return;
        d.classList.add('is-camina'); d.style.left = x + '%';
        timers.push(setTimeout(function () { d.classList.remove('is-camina'); if (alLlegar) alLlegar(); }, 950));
      },
      animar: function (id, como) {
        var d = actores[id]; if (!d) return;
        d.classList.remove('is-salta', 'is-feliz', 'is-niega', 'is-asiente', 'is-cava'); void d.offsetWidth;
        d.classList.add('is-' + como); d.setAttribute('data-anim', como);
        timers.push(setTimeout(function () { d.classList.remove('is-' + como); }, 1400));
      },
      decir: function (id, texto, ms) {
        var d = actores[id]; if (!d) return;
        var b = d.querySelector('.es-dice');
        if (!texto) { if (b) b.parentNode.removeChild(b); return; }
        if (!b) { b = document.createElement('div'); b.className = 'es-dice'; d.appendChild(b); }
        b.textContent = texto; d.setAttribute('data-dice', texto);
        b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
        if (ms) timers.push(setTimeout(function () { if (b.parentNode && b.textContent === texto) b.parentNode.removeChild(b); }, ms));
      },
      premio: function (x) {
        P.premio(el, x + '%', 30);
        var w = el.clientWidth || 300;
        P.chispas(el, Math.round(w * x / 100), Math.max(10, alto - 60));
      },
      destruir: function () { timers.forEach(clearTimeout); if (el.parentNode) el.parentNode.removeChild(el); }
    };
    return E;
  };

  /* ---------- Voz en ingles: solo voces locales (regla 2) ---------- */
  var vozEn = null, vozOn = true;
  function buscarVozEn() {
    try {
      if (!window.speechSynthesis) return null;
      var vs = window.speechSynthesis.getVoices() || [], en = [];
      for (var i = 0; i < vs.length; i++) if (vs[i].localService === true && /^en/i.test(vs[i].lang || '')) en.push(vs[i]);
      var pref = ['en-GB', 'en-US', 'en-AU', 'en-IE', 'en-CA'];
      en.sort(function (a, b) {
        var ia = pref.indexOf((a.lang || '').replace('_', '-')), ib = pref.indexOf((b.lang || '').replace('_', '-'));
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      vozEn = en[0] || null;
    } catch (e) { vozEn = null; }
    return vozEn;
  }
  try {
    if (window.speechSynthesis) {
      buscarVozEn();
      if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', buscarVozEn);
      else window.speechSynthesis.onvoiceschanged = buscarVozEn;
    }
  } catch (e) { /* sin voz */ }
  /* Devuelve true si hablo. Sin voz local no hace nada: queda el texto. */
  P.vozEn = function (texto) {
    try {
      if (!vozOn) return false;
      if (!vozEn) buscarVozEn();
      if (!vozEn || !window.SpeechSynthesisUtterance) return false;
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(String(texto).replace(/−/g, 'minus '));
      u.voice = vozEn; u.lang = vozEn.lang; u.rate = 0.85; u.pitch = 1.05;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  };
  P.vozAlterna = function () {
    vozOn = !vozOn;
    if (!vozOn) { try { window.speechSynthesis.cancel(); } catch (e) { /* nada */ } }
    return vozOn;
  };
  P.vozActiva = function () { return vozOn; };
  var ICONO_OIR = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#1E1426" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 9v6h4l5 4V5L7 9H3z" fill="#7FE3F0"/><path d="M20 8a5 5 0 1 0 1 5"/><path d="M21 4v4h-4"/></svg>';
  var ICONO_VOZ = function (on) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#1E1426" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 9v6h4l5 4V5L7 9H3z" fill="#FFD34D"/>' +
      (on ? '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>' : '<path d="M16 9l5 6M21 9l-5 6"/>') + '</svg>';
  };

  /* Pone un elemento a la vista, por encima de la barra fija de abajo (telefono). */
  P.aLaVista = function (el) {
    if (!el) return;
    setTimeout(function () {
      try {
        var barra = document.querySelector('.rp-pie'), hb = barra ? barra.offsetHeight : 0, h = window.innerHeight || 0;
        document.documentElement.style.setProperty('--rp-barra', (hb + 12) + 'px');
        el.style.scrollMarginBottom = (hb + 12) + 'px';
        var r = el.getBoundingClientRect();
        if (h && (r.bottom > h - hb || r.top < 0)) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch (e) { /* nada */ }
    }, 80);
  };

  /* ---------- Escalera de pistas ----------
     o.caja       elemento donde se escribe la pista
     o.peldanos   [{ texto, visual() }, ...] (tres): accion minima, figura, ejemplo resuelto parecido
     o.ocioMs     20000 por defecto
     Devuelve { fallo, accion, pedir, parar, nivel }. Sube con fallo(), con ocio o con pedir(). */
  P.pistas = function (o) {
    var caja = o.caja, pel = o.peldanos || [], nivel = 0, t = null, vivo = true, ms = o.ocioMs || 20000;
    function mostrar() {
      var p = pel[nivel - 1];
      if (!p || !caja) return;
      caja.hidden = false;
      caja.setAttribute('data-nivel', String(nivel));
      caja.innerHTML = '<b>HINT ' + nivel + '/' + pel.length + '</b>' + esc(p.texto);
      if (p.visual) p.visual();
      P.vozEn(p.texto);
    }
    function subir() { if (!vivo || !pel.length) return false; if (nivel < pel.length) { nivel++; mostrar(); return true; } return false; }
    function armar() {
      clearTimeout(t);
      if (!vivo) return;
      t = setTimeout(function () { if (subir()) armar(); }, ms);
    }
    if (caja) { caja.hidden = true; caja.removeAttribute('data-nivel'); caja.innerHTML = ''; }
    armar();
    return {
      fallo: function () { subir(); armar(); },
      accion: function () { armar(); },
      pedir: function () { if (!subir()) mostrar(); armar(); },
      parar: function () { vivo = false; clearTimeout(t); },
      nivel: function () { return nivel; }
    };
  };

  /* ---------- Teclado numerico en pantalla ----------
     o.max       cifras maximas (3 por defecto)
     o.alEnviar  function (numero) llamada con OK o Enter
     Teclado fisico: digitos, Retroceso y Enter. */
  P.teclado = function (host, o) {
    var val = '', max = o.max || 3, vivo = true;
    var orden = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'del', '0', 'ok'], teclas = '';
    orden.forEach(function (k) {
      var txt = k === 'del' ? '&#9003;' : k === 'ok' ? 'OK' : k;
      var lab = k === 'del' ? 'Delete' : k === 'ok' ? 'Send answer' : k;
      teclas += '<button type="button" class="k-boton' + (k === 'ok' ? ' is-ok' : '') + '" data-k="' + k + '" aria-label="' + lab + '">' + txt + '</button>';
    });
    host.innerHTML = '<div class="rp-tec"><output aria-live="polite" id="rp-tec-v">&nbsp;</output><div class="rp-tec__k">' + teclas + '</div></div>';
    var out = host.querySelector('#rp-tec-v');
    P.aLaVista(host.querySelector('.rp-tec'));
    function pintar() { out.innerHTML = val === '' ? '&nbsp;' : esc(val); out.setAttribute('data-val', val); }
    function tecla(k) {
      if (!vivo) return;
      if (k === 'del') val = val.slice(0, -1);
      else if (k === 'ok') { if (val !== '') o.alEnviar(parseInt(val, 10)); return; }
      else if (val.length < max) val += k;
      pintar();
      if (o.alTecla) o.alTecla();
    }
    function onKey(e) {
      if (/^[0-9]$/.test(e.key)) tecla(e.key);
      else if (e.key === 'Backspace') { e.preventDefault(); tecla('del'); }
      else if (e.key === 'Enter') { e.preventDefault(); tecla('ok'); }
    }
    Array.prototype.forEach.call(host.querySelectorAll('[data-k]'), function (b) {
      b.addEventListener('click', function () { tecla(b.getAttribute('data-k')); });
    });
    document.addEventListener('keydown', onKey);
    pintar();
    return {
      limpiar: function () { val = ''; pintar(); },
      valor: function () { return val; },
      destruir: function () { vivo = false; document.removeEventListener('keydown', onKey); host.innerHTML = ''; }
    };
  };

  /* ---------- Secuencia de rondas ----------
     o = {
       rotulo, titulo, texto            pantalla inicial
       finTitulo, finTexto              pantalla final
       rondas: [{ nombre, texto, items: [...] }]
       montar(item, ctx, ronda) -> { destruir() }   monta un reto en ctx.host
     }
     ctx = { host, gemas, mensaje(txt, 'bien'|'mal'), peldanos([...]), accion(), fallo(txt), listo(txt), extra }
     Una gema por ronda completada, sin importar los intentos (regla 4). */
  P.repaso = function (o) {
    var gemas = 0, ri = 0, ii = 0, montado = null, ladder = null, parado = false;

    function root() { return $('#proto'); }

    /* Atajo para probar: la direccion termina en #r3 (ronda 3) o #r3i2 (ronda 3, reto 2). */
    /* Progreso: la ronda en la que va el nino (sin aciertos ni intentos: regla 4). */
    var CLAVE = 'samsan:proto-repaso-' + (o.id || 'juego');
    function guardar(n) { try { if (n > 0 && n < o.rondas.length) localStorage.setItem(CLAVE, String(n)); else localStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ } }
    function guardada() { try { var n = parseInt(localStorage.getItem(CLAVE), 10); return n > 0 && n < o.rondas.length ? n : 0; } catch (e) { return 0; } }
    function empezar(atajo) {
      gemas = 0; ri = 0; ii = 0;
      if (!atajo && !(location.hash && !window.SAMSAN_MENU)) { ri = guardada(); gemas = ri; }
      var m = /^#r(\d+)(?:i(\d+))?$/.exec(typeof atajo === 'string' ? atajo : (window.SAMSAN_MENU ? '' : location.hash || ''));
      if (m && +m[1] >= 1 && +m[1] <= o.rondas.length) {
        ri = +m[1] - 1;
        if (m[2] !== undefined && +m[2] < o.rondas[ri].items.length) { ii = +m[2]; pantallaItem(); return; }
      }
      introRonda();
    }

    function introRonda() {
      var r = o.rondas[ri];
      guardar(ri);
      root().innerHTML = marcoMundo(
        '<section class="k-panel rp rp-intro" id="rp"><p class="k-rotulo">Round ' + (ri + 1) + ' of ' + o.rondas.length + '</p>' +
        '<h2>' + esc(r.nombre) + '</h2><div class="rp-pj" id="rp-pj"></div><p class="rp-consigna">' + esc(r.texto) + '</p>' +
        '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="rp-go">GO</button>' + botonMenu() + '</div></section>');
      personajes($('#rp-pj'));
      atarMenu();
      P.vozEn(r.texto);
      $('#rp-go').addEventListener('click', function () { P.sonido('paso'); ii = 0; pantallaItem(); });
    }

    function pips() {
      var r = o.rondas[ri], h = '';
      for (var k = 0; k < r.items.length; k++) h += '<i class="' + (k < ii ? 'is-hecho' : k === ii ? 'is-ahora' : '') + '"></i>';
      return '<div class="rp-pips" role="img" aria-label="Puzzle ' + (ii + 1) + ' of ' + r.items.length + '">' + h + '</div>';
    }

    function pantallaItem() {
      var r = o.rondas[ri], item = r.items[ii];
      parado = false;
      root().innerHTML = marcoMundo(
        '<section class="k-panel rp" id="rp" data-ronda="' + ri + '" data-item="' + ii + '" data-tipo="' + esc(item.t) + '">' +
          '<div class="rp-cab"><div><p class="k-rotulo">Round ' + (ri + 1) + ' of ' + o.rondas.length + '</p><h2>' + esc(r.nombre) + '</h2></div>' +
            '<div class="rp-der"><span class="rp-gemas" aria-label="Gems">' + P.gemaSVG(22) + '<b id="rp-g">' + gemas + '</b></span>' +
            '<button type="button" class="k-boton rp-voz rp-oir" id="rp-oir" aria-label="Say it again">' + ICONO_OIR + '<span>AGAIN</span></button>' +
            '<button type="button" class="k-boton rp-voz" id="rp-voz" aria-label="Voice on or off" aria-pressed="' + P.vozActiva() + '">' + ICONO_VOZ(P.vozActiva()) + '</button>' + botonMenu() + '</div></div>' +
          pips() +
          '<div id="rp-cuerpo"></div>' +
          '<div class="rp-caja" id="rp-caja" hidden></div>' +
          '<div class="k-botones rp-pie"><p class="k-mensaje" id="rp-msg" aria-live="polite"></p><button type="button" class="k-boton rp-hint" id="rp-hint">HINT</button><span id="rp-extra" class="k-botones"></span>' +
            '<button type="button" class="k-boton k-boton--siguiente" id="rp-sig" hidden>NEXT &#9654;</button></div>' +
        '</section>');
      var msg = $('#rp-msg'), sig = $('#rp-sig');
      atarMenu();
      /* El mensaje de respuesta siempre queda a la vista (no debajo de la pantalla). */
      function aLaVista(el) {
        try {
          var r = el.getBoundingClientRect(), h = window.innerHeight || 0;
          if (h && (r.bottom > h || r.top < 0)) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) { /* nada */ }
      }
      function decirConsigna() {
        var c = $('#rp-cuerpo .rp-consigna');
        P.vozEn(item.voz || (c ? c.textContent : ''));
      }
      $('#rp-oir').addEventListener('click', function () { var on = P.vozActiva(); if (!on) P.vozAlterna(); decirConsigna(); if (!on) P.vozAlterna(); });
      $('#rp-voz').addEventListener('click', function () {
        var on = P.vozAlterna(); this.setAttribute('aria-pressed', String(on)); this.innerHTML = ICONO_VOZ(on);
      });
      ladder = P.pistas({ caja: $('#rp-caja'), peldanos: [] });
      $('#rp-hint').addEventListener('click', function () { if (ladder) ladder.pedir(); });
      var ctx = {
        host: $('#rp-cuerpo'), extra: $('#rp-extra'), gemas: gemas,
        mensaje: function (txt, tipo) { msg.className = 'k-mensaje' + (tipo ? ' is-' + tipo : ''); msg.textContent = txt || ''; },
        peldanos: function (arr) { if (ladder) ladder.parar(); ladder = P.pistas({ caja: $('#rp-caja'), peldanos: arr }); },
        accion: function () { if (ladder && !parado) ladder.accion(); },
        fallo: function (txt) { if (txt) ctx.mensaje(txt, 'mal'); if (ladder && !parado) ladder.fallo(); aLaVista(msg); },
        listo: function (txt) {
          parado = true; if (ladder) ladder.parar();
          ctx.mensaje(txt, 'bien'); P.sonido('veta');
          sig.hidden = false; sig.focus();
        }
      };
      sig.addEventListener('click', function () {
        if (montado) { montado.destruir(); montado = null; }
        ii++;
        if (ii >= r.items.length) finRonda(); else pantallaItem();
      });
      montado = o.montar(item, ctx, r);
      decirConsigna();
    }

    function finRonda() {
      gemas++;
      var ultima = ri + 1 >= o.rondas.length;
      guardar(ultima ? 0 : ri + 1);
      /* Pantalla de ronda hecha: la gema se ve grande y el nino decide cuando seguir. */
      root().innerHTML = marcoMundo(
        '<section class="k-panel rp rp-intro rp-hecha" id="rp"><p class="k-rotulo">Round ' + (ri + 1) + ' of ' + o.rondas.length + '</p>' +
        '<h2>Round done!</h2><div class="rp-gema-grande">' + P.gemaSVG(96) + '</div>' +
        '<p class="rp-consigna">+1 gem. You have ' + gemas + '.</p><div class="rp-pj" id="rp-pj"></div>' +
        '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="rp-seguir">' + (ultima ? 'FINISH' : 'NEXT ROUND') + ' &#9654;</button>' + botonMenu() + '</div></section>');
      personajes($('#rp-pj'));
      atarMenu();
      P.sonido('gema');
      P.vozEn('Round done! Great!');
      var b = $('#rp-seguir'); b.focus();
      b.addEventListener('click', function () {
        P.sonido('paso');
        ri++;
        if (ri >= o.rondas.length) {
          P.final({ rotulo: o.finRotulo || 'Done', titulo: o.finTitulo, texto: o.finTexto, gemas: gemas, otra: function () { empezar('#r1'); } });
          var bs = document.querySelector('.proto-final .k-botones');
          if (bs && window.SAMSAN_MENU) { bs.insertAdjacentHTML('beforeend', botonMenu()); atarMenu(); }
        } else introRonda();
      });
    }

    /* MENU: vuelve a la pantalla principal (solo dentro del menu de juegos). */
    function botonMenu() { return window.SAMSAN_MENU ? '<button type="button" class="k-boton rp-menu" id="rp-menu" aria-label="Back to the games">MENU</button>' : ''; }
    function salir() {
      if (ladder) ladder.parar(); ladder = null;
      if (montado) { try { montado.destruir(); } catch (e) { /* nada */ } montado = null; }
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* nada */ }
      if (P.irMenu) P.irMenu();
    }
    function atarMenu() { var b = $('#rp-menu'); if (b) b.addEventListener('click', function () { P.sonido('paso'); salir(); }); }

    if (window.SAMSAN_MENU) {
      (P.juegosMenu = P.juegosMenu || []).push({ id: o.id, titulo: o.titulo, texto: o.texto, icono: o.icono, rondas: o.rondas.length, empezar: empezar, salir: salir });
      return;
    }
    P.inicio({ rotulo: o.rotulo, titulo: o.titulo, texto: o.texto, alJugar: function () { empezar(); } });
  };
})();
