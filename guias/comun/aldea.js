/* ============================================================
   SAMSAN — KIT DE LA ALDEA DE PIP (guias/comun/aldea.js)

   Capa visual del «modo aldea» (Y2 English v3, propuesta del 18 nov 2026).
   Solo dibuja y anima; no lleva reglas de juego, voz ni textos visibles.
   Todo es vector por codigo (sin pixel art y sin archivos): los fondos se
   arman con capas que se estiran bien en vertical y en horizontal, y cada
   lugar es un boton con su propio SVG que se ajusta al alto disponible
   (container queries sobre .al-escena).

   Escenarios (A.escena):
     calle      casas            long i
     estanque   hojas            blends
     plaza      puestos          preguntas Wh
     habitat    arbol, agua, flores
     barrio     edificios        comunidad (panaderia, colegio, hospital, parque)
     granja     gallinero, agua, flores   ciclos de vida

   Lugares (A.lugar): casa, hoja, puesto, arbol, agua, flores, edificio
   (variantes panaderia, colegio, hospital, parque) y gallinero.

   Animaciones:
     A.abrir(lugar, icono)    se abre la puerta, sale el vecino, el dibujo
                              sube con confeti y queda en la ventana
     A.temblar(lugar)         error: tiembla suave, nunca se pierde nada
     A.brillar(lugar)         pista: brilla el lugar correcto
     A.entrar(globo)          Pip llega volando con el globo
     A.volar(globo, lugar)    el globo vuela a la puerta y se encoge
     A.celebrar(pip)          Pip da una voltereta
     A.confeti(x, y, n)       confeti desde un punto de la pantalla
     A.arrastre(nodo, op)     arrastre con el dedo o el raton, y toque

   Los colores base de Pip son los mismos del motor (#4A90D9, #2F6FA8,
   #CFE6FA), asi que los trajes (pieles) funcionan igual.
   ============================================================ */
(function () {
  'use strict';
  var A = window.ALDEA = {};
  var K = '#1F2937';
  var uid = 0;
  var MENOS_MOV = false;
  try { MENOS_MOV = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* nada */ }
  A.menosMovimiento = function () { return MENOS_MOV; };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function marcas(s) { return esc(s).replace(/\*([^*]+)\*/g, '<mark>$1</mark>'); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; }
  A.marcas = marcas;

  /* Un icono (Twemoji u otro de 36 x 36) dentro de un SVG: interior sin la etiqueta <svg>. */
  function anidar(icono, x, y, lado, cls) {
    if (!icono) return '';
    return '<svg class="' + (cls || 'al-ico') + '" x="' + x + '" y="' + y + '" width="' + lado + '" height="' + lado + '" viewBox="0 0 36 36" aria-hidden="true">' + icono + '</svg>';
  }
  A.icono = function (icono, cls) { return '<svg class="' + (cls || 'al-ico') + '" viewBox="0 0 36 36" aria-hidden="true">' + (icono || '') + '</svg>'; };

  /* ---------- colores ---------- */
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function mezcla(c, con, t) {
    var a = hex(c), b = hex(con);
    return '#' + a.map(function (v, i) { var x = Math.round(v + (b[i] - v) * t); return (x < 16 ? '0' : '') + x.toString(16); }).join('').toUpperCase();
  }
  A.tonos = function (c) { return { c: c, oscuro: mezcla(c, '#000000', 0.32), claro: mezcla(c, '#FFFFFF', 0.78), medio: mezcla(c, '#FFFFFF', 0.45) }; };

  /* ============================================================
     PIP VOLANDO (mismos colores base que el Pip del motor)
     ============================================================ */
  A.pip = function (etq) {
    return '<svg class="al-pip" viewBox="0 0 150 128" role="img" aria-label="' + esc(etq || 'Pip') + '">' +
      '<g class="al-ala al-ala-i"><ellipse cx="26" cy="58" rx="13" ry="30" transform="rotate(-48 26 58)" fill="#2F6FA8" stroke="' + K + '" stroke-width="2.5"/></g>' +
      '<g class="al-ala al-ala-d"><ellipse cx="124" cy="58" rx="13" ry="30" transform="rotate(48 124 58)" fill="#2F6FA8" stroke="' + K + '" stroke-width="2.5"/></g>' +
      '<path d="M44 40 L48 14 L64 32 Z" fill="#2F6FA8" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M106 40 L102 14 L86 32 Z" fill="#2F6FA8" stroke="' + K + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<ellipse cx="75" cy="68" rx="40" ry="42" fill="#4A90D9" stroke="' + K + '" stroke-width="2.5"/>' +
      '<ellipse cx="75" cy="87" rx="24" ry="19" fill="#CFE6FA"/>' +
      '<path d="M63 82 Q67 87 71 82 M79 82 Q83 87 87 82 M71 94 Q75 99 79 94" fill="none" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="59" cy="54" r="14.5" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.5"/><circle cx="91" cy="54" r="14.5" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.5"/>' +
      '<g class="al-ojos"><circle cx="61" cy="56" r="6.5" fill="' + K + '"/><circle cx="63" cy="53" r="2.4" fill="#FFFFFF"/>' +
      '<circle cx="93" cy="56" r="6.5" fill="' + K + '"/><circle cx="95" cy="53" r="2.4" fill="#FFFFFF"/></g>' +
      '<path d="M69 66 L81 66 L75 76 Z" fill="#F59E0B" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<g class="al-pip__boca"><path d="M68 79 Q75 85 82 79" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round" opacity="0"/></g>' +
      '<ellipse cx="66" cy="110" rx="7" ry="4" fill="#F59E0B" stroke="' + K + '" stroke-width="2"/><ellipse cx="84" cy="110" rx="7" ry="4" fill="#F59E0B" stroke="' + K + '" stroke-width="2"/>' +
      '</svg>';
  };

  /* ============================================================
     VECINOS: lo que se asoma por la puerta al acertar
     ============================================================ */
  function vecino(color, tipo) {
    var t = A.tonos(color), s = '';
    if (tipo === 'rana') {
      s = '<ellipse cx="20" cy="32" rx="17" ry="13" fill="#4ADE80" stroke="' + K + '" stroke-width="2"/>' +
        '<circle cx="12" cy="18" r="6.5" fill="#4ADE80" stroke="' + K + '" stroke-width="2"/><circle cx="28" cy="18" r="6.5" fill="#4ADE80" stroke="' + K + '" stroke-width="2"/>' +
        '<circle cx="12" cy="18" r="3" fill="' + K + '"/><circle cx="28" cy="18" r="3" fill="' + K + '"/>' +
        '<path d="M11 33 Q20 40 29 33" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>';
    } else if (tipo === 'pollito') {
      s = '<ellipse cx="20" cy="28" rx="15" ry="15" fill="#FDE047" stroke="' + K + '" stroke-width="2"/>' +
        '<circle cx="15" cy="24" r="2.6" fill="' + K + '"/><circle cx="25" cy="24" r="2.6" fill="' + K + '"/>' +
        '<path d="M16 29 L24 29 L20 35 Z" fill="#F59E0B" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M18 13 Q20 7 23 12" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>';
    } else if (tipo === 'pez') {
      s = '<path d="M33 28 L40 21 L40 35 Z" fill="' + t.c + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<ellipse cx="20" cy="28" rx="15" ry="11" fill="' + t.medio + '" stroke="' + K + '" stroke-width="2"/>' +
        '<circle cx="12" cy="25" r="2.6" fill="' + K + '"/><path d="M8 31 Q11 33 14 31" fill="none" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round"/>';
    } else if (tipo === 'abeja') {
      s = '<ellipse cx="13" cy="15" rx="7" ry="5" fill="#FFFFFF" stroke="' + K + '" stroke-width="1.6"/><ellipse cx="27" cy="15" rx="7" ry="5" fill="#FFFFFF" stroke="' + K + '" stroke-width="1.6"/>' +
        '<ellipse cx="20" cy="28" rx="14" ry="12" fill="#FACC15" stroke="' + K + '" stroke-width="2"/>' +
        '<path d="M12 22 Q20 20 28 22 M10 30 Q20 28 30 30" fill="none" stroke="' + K + '" stroke-width="3"/>' +
        '<circle cx="15" cy="26" r="2.2" fill="' + K + '"/><circle cx="25" cy="26" r="2.2" fill="' + K + '"/>';
    } else {
      /* vecino de la aldea: una gota redonda que saluda */
      s = '<g class="al-brazo"><path d="M33 26 Q41 18 38 10" fill="none" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/><path d="M33 26 Q41 18 38 10" fill="none" stroke="' + t.medio + '" stroke-width="2.6" stroke-linecap="round"/></g>' +
        '<path d="M6 44 C4 22 10 10 20 10 C30 10 36 22 34 44 Z" fill="' + t.medio + '" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="15" cy="23" r="3" fill="' + K + '"/><circle cx="25" cy="23" r="3" fill="' + K + '"/><circle cx="16" cy="22" r="1" fill="#FFFFFF"/><circle cx="26" cy="22" r="1" fill="#FFFFFF"/>' +
        '<path d="M14 30 Q20 35 26 30" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="10" cy="29" r="2.4" fill="#F9A8D4" opacity=".8"/><circle cx="30" cy="29" r="2.4" fill="#F9A8D4" opacity=".8"/>';
    }
    return s;
  }
  /* el vecino dentro de un recuadro (x, y, ancho, alto) del lugar, recortado por esa abertura */
  function asomar(color, tipo, x, y, w, h, clip) {
    var id = 'al-clip-' + (++uid), esc2 = Math.min(w / 40, h / 44);
    var dx = x + (w - 40 * esc2) / 2, dy = y + h - 44 * esc2;
    return '<clipPath id="' + id + '"><path d="' + clip + '"/></clipPath>' +
      '<g clip-path="url(#' + id + ')"><g class="al-vecino"><g transform="translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ') scale(' + esc2.toFixed(3) + ')">' + vecino(color, tipo) + '</g></g></g>';
  }

  /* ============================================================
     LUGARES (viewBox 0 0 120 150; la base queda en y = 150)
     Cada dibujo marca:
       .al-puerta   lo que se abre al acertar
       .al-vecino   lo que se asoma (va recortado por la abertura)
       .al-ventana  donde queda el ultimo dibujo ubicado
     ============================================================ */
  var DIBUJOS = {
    casa: function (t, ej) {
      return '<rect x="84" y="16" width="13" height="30" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="3"/>' +
        '<rect x="14" y="58" width="92" height="92" fill="' + t.claro + '" stroke="' + K + '" stroke-width="3"/>' +
        '<polygon points="4,64 60,10 116,64" fill="' + t.c + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="60" cy="44" r="18.5" fill="#FFFFFF" stroke="' + K + '" stroke-width="3"/>' + anidar(ej, 45, 29, 30) +
        '<rect x="24" y="98" width="34" height="52" fill="#3B2A20"/>' +
        asomar(t.c, 'gente', 24, 98, 34, 52, 'M24 98 H58 V150 H24 Z') +
        '<g class="al-puerta"><rect x="24" y="98" width="34" height="52" rx="2" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="3"/>' +
        '<rect x="30" y="105" width="22" height="16" rx="2" fill="none" stroke="' + K + '" stroke-width="1.6" opacity=".45"/><circle cx="51" cy="128" r="3" fill="#FDE047" stroke="' + K + '" stroke-width="1.6"/></g>' +
        '<rect x="24" y="98" width="34" height="52" fill="none" stroke="' + K + '" stroke-width="3"/>' +
        '<rect x="66" y="88" width="32" height="30" rx="3" fill="#FEF3C7" stroke="' + K + '" stroke-width="3"/>' +
        '<g class="al-ventana" data-x="68" data-y="89" data-l="28"></g>' +
        '<rect x="63" y="118" width="38" height="8" rx="2" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.4"/>' +
        '<circle cx="70" cy="116" r="3.4" fill="#F472B6" stroke="' + K + '" stroke-width="1.4"/><circle cx="82" cy="115" r="3.4" fill="#FDE047" stroke="' + K + '" stroke-width="1.4"/><circle cx="94" cy="116" r="3.4" fill="#F472B6" stroke="' + K + '" stroke-width="1.4"/>';
    },
    hoja: function (t, ej) {
      return '<ellipse cx="60" cy="136" rx="58" ry="14" fill="#1D4ED8" opacity=".18"/>' +
        '<path d="M60 130 L60 112 M60 130 L92 122" stroke="none"/>' +
        '<path d="M6 126 A54 20 0 1 0 60 110 L60 126 Z" fill="#4ADE80" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M60 110 A54 20 0 0 1 114 126 L60 126 Z" fill="#22C55E" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M60 126 L28 118 M60 126 L92 132 M60 126 L40 140" stroke="#15803D" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="22" cy="122" r="12" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 13, 113, 18) +
        '<g class="al-ventana" data-x="80" data-y="104" data-l="24"></g>' +
        asomar(t.c, 'gente', 42, 64, 36, 56, 'M30 30 H90 V122 H30 Z') +
        '<g class="al-puerta al-puerta--flor">' +
        '<path d="M60 120 C40 116 36 92 44 76 C52 88 56 100 60 120 Z" fill="' + t.medio + '" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 120 C80 116 84 92 76 76 C68 88 64 100 60 120 Z" fill="' + t.medio + '" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 120 C50 104 52 80 60 66 C68 80 70 104 60 120 Z" fill="' + t.c + '" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/></g>';
    },
    puesto: function (t, ej) {
      var franjas = '';
      for (var i = 0; i < 6; i++) franjas += '<path d="M' + (8 + i * 17.3) + ' 30 h17.3 v22 a8.65 8.65 0 0 1 -17.3 0 Z" fill="' + (i % 2 ? '#FFFFFF' : t.c) + '" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/>';
      return '<rect x="13" y="40" width="6" height="110" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.4"/><rect x="101" y="40" width="6" height="110" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.4"/>' +
        '<rect x="19" y="54" width="82" height="44" fill="#3B2A20"/>' +
        asomar(t.c, 'gente', 30, 58, 60, 40, 'M19 54 H101 V98 H19 Z') +
        '<g class="al-puerta al-puerta--persiana"><rect x="19" y="54" width="82" height="44" fill="' + t.claro + '" stroke="' + K + '" stroke-width="2.4"/>' +
        '<path d="M19 63 H101 M19 72 H101 M19 81 H101 M19 90 H101" stroke="' + K + '" stroke-width="1.4" opacity=".35"/></g>' +
        '<path d="M4 30 L60 12 L116 30 Z" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/>' + franjas +
        '<rect x="8" y="98" width="104" height="52" rx="3" fill="' + t.c + '" stroke="' + K + '" stroke-width="3"/>' +
        '<rect x="4" y="94" width="112" height="9" rx="3" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.6"/>' +
        '<circle cx="34" cy="126" r="14" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 24, 116, 20) +
        '<rect x="58" y="112" width="44" height="28" rx="4" fill="#FEF3C7" stroke="' + K + '" stroke-width="2.4"/>' +
        '<g class="al-ventana" data-x="67" data-y="113" data-l="26"></g>';
    },
    arbol: function (t, ej) {
      return '<ellipse cx="60" cy="146" rx="40" ry="6" fill="#15803D" opacity=".3"/>' +
        '<path d="M48 150 L52 86 L68 86 L72 150 Z" fill="#92400E" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="34" cy="62" r="26" fill="#22C55E" stroke="' + K + '" stroke-width="3"/><circle cx="86" cy="62" r="26" fill="#22C55E" stroke="' + K + '" stroke-width="3"/>' +
        '<circle cx="60" cy="40" r="32" fill="#4ADE80" stroke="' + K + '" stroke-width="3"/><circle cx="60" cy="76" r="22" fill="#22C55E"/>' +
        '<path d="M40 88 Q60 96 80 88" fill="none" stroke="' + K + '" stroke-width="3"/>' +
        '<circle cx="32" cy="58" r="13" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 23, 49, 18) +
        '<g class="al-ventana" data-x="74" data-y="44" data-l="26"></g>' +
        '<ellipse cx="60" cy="116" rx="9" ry="13" fill="#3B2A20"/>' +
        asomar(t.c, 'gente', 50, 100, 20, 30, 'M51 103 A9 13 0 1 0 69 116 A9 13 0 0 0 51 116 Z') +
        '<g class="al-puerta al-puerta--hueco"><ellipse cx="60" cy="116" rx="9" ry="13" fill="#78350F" stroke="' + K + '" stroke-width="2.4"/></g>' +
        '<path d="M50 140 Q56 128 52 118 M70 140 Q64 132 68 122" fill="none" stroke="#78350F" stroke-width="2" stroke-linecap="round"/>';
    },
    agua: function (t, ej) {
      return '<ellipse cx="60" cy="126" rx="58" ry="24" fill="#60A5FA" stroke="' + K + '" stroke-width="3"/>' +
        '<ellipse cx="60" cy="122" rx="44" ry="15" fill="#93C5FD"/>' +
        '<path class="al-ola" d="M24 122 q6 -5 12 0 t12 0 M66 128 q6 -5 12 0 t12 0" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M6 104 C6 94 26 92 30 102 L30 118 L6 118 Z" fill="#9CA3AF" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M100 120 L102 82 M106 120 L110 90 M94 120 L94 92" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="102" cy="80" rx="3" ry="8" fill="#92400E" stroke="' + K + '" stroke-width="1.6"/>' +
        '<circle cx="20" cy="84" r="13" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 11, 75, 18) +
        '<g class="al-ventana" data-x="68" data-y="98" data-l="24"></g>' +
        asomar(t.c, 'pez', 38, 62, 44, 54, 'M20 20 H100 V120 H20 Z') +
        '<g class="al-puerta al-puerta--ola"><path d="M36 118 q8 -12 16 0 q8 -12 16 0 q8 -12 16 0" fill="#93C5FD" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/></g>';
    },
    flores: function (t, ej) {
      function flor(x, y, c, r) {
        var p = '';
        for (var i = 0; i < 5; i++) { var a = i * 72 * Math.PI / 180; p += '<circle cx="' + (x + Math.cos(a) * r).toFixed(1) + '" cy="' + (y + Math.sin(a) * r).toFixed(1) + '" r="' + (r * 0.75).toFixed(1) + '" fill="' + c + '" stroke="' + K + '" stroke-width="2"/>'; }
        return p + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.62).toFixed(1) + '" fill="#FDE047" stroke="' + K + '" stroke-width="2"/>';
      }
      return '<path d="M4 150 C10 126 110 126 116 150 Z" fill="#92400E" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M26 134 L26 92 M94 134 L94 96 M60 134 L60 84" stroke="#15803D" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M26 118 q-12 -6 -14 -16 q12 2 14 16 M94 120 q12 -6 14 -16 q-12 2 -14 16" fill="#4ADE80" stroke="' + K + '" stroke-width="2"/>' +
        flor(26, 86, '#F472B6', 10) + flor(94, 90, '#A78BFA', 10) +
        '<circle cx="24" cy="44" r="13" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 15, 35, 18) +
        '<g class="al-ventana" data-x="82" data-y="34" data-l="26"></g>' +
        asomar(t.c, 'abeja', 40, 20, 40, 44, 'M20 0 H100 V72 H20 Z') +
        '<g class="al-puerta al-puerta--flor">' + flor(60, 72, t.c, 13) + '</g>';
    },
    gallinero: function (t, ej) {
      return '<rect x="18" y="66" width="84" height="76" fill="' + t.c + '" stroke="' + K + '" stroke-width="3"/>' +
        '<path d="M18 80 H102 M18 96 H102 M18 112 H102 M18 128 H102" stroke="' + K + '" stroke-width="1.4" opacity=".3"/>' +
        '<polygon points="8,70 60,26 112,70" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<circle cx="60" cy="52" r="12" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 51, 43, 18) +
        '<rect x="22" y="142" width="8" height="8" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2"/><rect x="90" y="142" width="8" height="8" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2"/>' +
        '<path d="M44 142 A16 18 0 0 1 76 142 Z" fill="#3B2A20"/>' +
        asomar(t.c, 'pollito', 46, 116, 28, 26, 'M44 142 A16 18 0 0 1 76 142 Z') +
        '<g class="al-puerta"><path d="M44 142 A16 18 0 0 1 76 142 Z" fill="#FEF3C7" stroke="' + K + '" stroke-width="2.6" stroke-linejoin="round"/></g>' +
        '<path d="M76 142 L104 150 L76 150 Z" fill="#D97706" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<rect x="74" y="84" width="22" height="20" rx="3" fill="#FEF3C7" stroke="' + K + '" stroke-width="2.4"/>' +
        '<g class="al-ventana" data-x="75" data-y="84" data-l="20"></g>' +
        '<ellipse cx="34" cy="96" rx="6" ry="7.5" fill="#FFFFFF" stroke="' + K + '" stroke-width="2"/>';
    },
    edificio: function (t, ej, variante) {
      var extra = '', techo = '';
      if (variante === 'parque') return DIBUJOS.parque(t, ej);
      if (variante === 'colegio') techo = '<polygon points="34,32 60,8 86,32" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/><path d="M60 8 V-6" stroke="' + K + '" stroke-width="2.4"/><path d="M60 -6 L76 -1 L60 4 Z" fill="#FDE047" stroke="' + K + '" stroke-width="2" stroke-linejoin="round"/>';
      if (variante === 'hospital') techo = '<circle cx="60" cy="22" r="13" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.6"/><path d="M54 15 V29 M66 15 V29 M54 22 H66" stroke="#1D4ED8" stroke-width="3.6" stroke-linecap="round"/>';
      if (variante === 'panaderia') extra = '<path d="M36 100 L84 100 L90 112 L30 112 Z" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M42 100 L40 112 M54 100 L54 112 M66 100 L66 112 M78 100 L80 112" stroke="' + t.c + '" stroke-width="4"/>';
      return techo +
        '<rect x="14" y="30" width="92" height="120" fill="' + t.claro + '" stroke="' + K + '" stroke-width="3"/>' +
        '<rect x="10" y="28" width="100" height="10" rx="2" fill="' + t.c + '" stroke="' + K + '" stroke-width="3"/>' +
        '<circle cx="34" cy="64" r="14" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.6"/>' + anidar(ej, 24, 54, 20) +
        '<rect x="62" y="50" width="34" height="30" rx="3" fill="#FEF3C7" stroke="' + K + '" stroke-width="2.6"/>' +
        '<g class="al-ventana" data-x="65" data-y="51" data-l="28"></g>' +
        '<rect x="42" y="112" width="36" height="38" fill="#3B2A20"/>' +
        asomar(t.c, 'gente', 42, 112, 36, 38, 'M42 112 H78 V150 H42 Z') +
        '<g class="al-puerta"><rect x="42" y="112" width="36" height="38" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.6"/><circle cx="72" cy="132" r="2.6" fill="#FDE047" stroke="' + K + '" stroke-width="1.4"/></g>' +
        '<rect x="42" y="112" width="36" height="38" fill="none" stroke="' + K + '" stroke-width="3"/>' + extra;
    },
    parque: function (t, ej) {
      return '<path d="M4 150 C14 136 106 136 116 150 Z" fill="#4ADE80" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M22 140 L22 100 M98 140 L98 100" stroke="#92400E" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="22" cy="86" r="18" fill="#22C55E" stroke="' + K + '" stroke-width="3"/><circle cx="98" cy="86" r="18" fill="#22C55E" stroke="' + K + '" stroke-width="3"/>' +
        '<path d="M34 64 A26 26 0 0 1 86 64" fill="none" stroke="' + t.oscuro + '" stroke-width="7" stroke-linecap="round"/><path d="M34 64 A26 26 0 0 1 86 64" fill="none" stroke="' + K + '" stroke-width="2" stroke-linecap="round" opacity=".5"/>' +
        '<rect x="30" y="62" width="8" height="80" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.4"/><rect x="82" y="62" width="8" height="80" fill="' + t.oscuro + '" stroke="' + K + '" stroke-width="2.4"/>' +
        '<circle cx="60" cy="42" r="12" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/>' + anidar(ej, 51, 33, 18) +
        '<g class="al-ventana" data-x="100" data-y="110" data-l="20"></g>' +
        asomar(t.c, 'gente', 40, 92, 40, 50, 'M38 70 H82 V142 H38 Z') +
        '<g class="al-puerta al-puerta--reja"><rect x="38" y="92" width="44" height="50" fill="none"/>' +
        '<path d="M38 96 H82 M38 136 H82 M44 92 V142 M52 92 V142 M60 92 V142 M68 92 V142 M76 92 V142" stroke="' + t.c + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M38 96 H82 M38 136 H82" stroke="' + K + '" stroke-width="1.4" opacity=".6"/></g>';
    }
  };

  /* Un lugar: boton con letrero grande arriba y su dibujo.
     op = { id, tipo, variante, color, letrero, ejemplo (icono), etiqueta } */
  A.lugar = function (op) {
    var t = A.tonos(op.color || '#1D4ED8');
    var dib = DIBUJOS[op.tipo] || DIBUJOS.casa;
    var b = el('button', 'al-lugar al-lugar--' + (op.tipo || 'casa') + (op.variante ? ' al-lugar--' + op.variante : ''));
    b.type = 'button';
    b.setAttribute('data-lugar', op.id);
    b.setAttribute('aria-label', op.etiqueta || op.letrero || op.id);
    b.style.setProperty('--c', t.c); b.style.setProperty('--c-oscuro', t.oscuro); b.style.setProperty('--c-claro', t.claro);
    /* recorte de arriba de cada dibujo, para que el letrero quede pegado a el */
    var TOPE = { casa: 8, hoja: 56, puesto: 10, arbol: 6, agua: 58, flores: 18, gallinero: 24, edificio: 26 };
    var VAR = { colegio: -10, hospital: 6, panaderia: 26, parque: 28 };
    var top = op.variante in VAR ? VAR[op.variante] : (TOPE[op.tipo] || 0);
    var largo = (String(op.letrero || '').replace(/\*/g, '').length || 1) + (op.ejemplo ? 1.3 : 0);
    b.style.setProperty('--letrero-k', Math.min(0.25, 0.95 / largo).toFixed(3));
    b.style.setProperty('--letrero-k2', Math.min(0.25, 0.92 / (String(op.letrero || '').replace(/\*/g, '').length || 1)).toFixed(3));
    b.innerHTML = (op.letrero ? '<span class="al-letrero" aria-hidden="true">' + (op.ejemplo ? A.icono(op.ejemplo, 'al-ico al-letrero__ico') : '') + '<span>' + marcas(op.letrero) + '</span></span>' : '') +
      '<svg class="al-dibujo-lugar" viewBox="0 ' + top + ' 120 ' + (150 - top) + '" aria-hidden="true">' + dib(t, op.ejemplo, op.variante) + '</svg>';
    return b;
  };

  /* ============================================================
     ESCENARIOS: capas de fondo que se estiran bien en cualquier pantalla
     ============================================================ */
  function nube(cls) {
    return '<svg class="al-nube ' + cls + '" viewBox="0 0 120 60" aria-hidden="true"><path d="M20 52 C4 52 4 30 22 30 C24 12 50 8 58 24 C66 10 92 14 92 32 C112 30 116 52 100 52 Z" fill="#FFFFFF" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/></svg>';
  }
  var SOL = '<svg class="al-sol" viewBox="0 0 80 80" aria-hidden="true"><g class="al-sol__rayos" stroke="#F59E0B" stroke-width="5" stroke-linecap="round">' +
    '<path d="M40 4 V14 M40 66 V76 M4 40 H14 M66 40 H76 M14.5 14.5 L21.6 21.6 M58.4 58.4 L65.5 65.5 M14.5 65.5 L21.6 58.4 M58.4 21.6 L65.5 14.5"/></g>' +
    '<circle cx="40" cy="40" r="20" fill="#FDE047" stroke="' + K + '" stroke-width="3"/><circle cx="33" cy="38" r="2.5" fill="' + K + '"/><circle cx="47" cy="38" r="2.5" fill="' + K + '"/><path d="M33 46 Q40 51 47 46" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/></svg>';
  function colinas(c1, c2) {
    return '<svg class="al-lejos" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 50 C60 10 110 20 170 44 C230 14 300 6 400 40 V80 H0 Z" fill="' + c1 + '" stroke="' + K + '" stroke-width="2.5" vector-effect="non-scaling-stroke"/>' +
      '<path d="M0 66 C80 40 150 48 220 62 C290 42 350 46 400 58 V80 H0 Z" fill="' + c2 + '" stroke="' + K + '" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>';
  }
  function ciudad(c) {
    var s = '', x = 0, alturas = [44, 62, 36, 70, 50, 30, 58, 40, 66, 46];
    alturas.forEach(function (h, i) { var w = 40; s += '<rect x="' + x + '" y="' + (80 - h) + '" width="' + w + '" height="' + h + '" fill="' + (i % 2 ? c : mezcla(c, '#FFFFFF', 0.25)) + '" stroke="' + K + '" stroke-width="2.5" vector-effect="non-scaling-stroke"/>'; x += w; });
    return '<svg class="al-lejos al-lejos--ciudad" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">' + s + '</svg>';
  }
  function decor(tipo, lado) {
    var s = '';
    if (tipo === 'farol') s = '<svg class="al-decor al-decor--' + lado + '" viewBox="0 0 30 120" aria-hidden="true"><rect x="12" y="30" width="6" height="90" fill="#374151" stroke="' + K + '" stroke-width="2"/><path d="M6 30 L24 30 L20 14 L10 14 Z" fill="#FDE047" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/><rect x="8" y="8" width="14" height="6" rx="2" fill="#374151" stroke="' + K + '" stroke-width="2"/></svg>';
    else if (tipo === 'arbolito') s = '<svg class="al-decor al-decor--' + lado + '" viewBox="0 0 60 120" aria-hidden="true"><rect x="26" y="70" width="8" height="50" fill="#92400E" stroke="' + K + '" stroke-width="2.4"/><circle cx="30" cy="50" r="26" fill="#22C55E" stroke="' + K + '" stroke-width="3"/><circle cx="22" cy="44" r="5" fill="#86EFAC"/></svg>';
    else if (tipo === 'juncos') s = '<svg class="al-decor al-decor--' + lado + '" viewBox="0 0 60 120" aria-hidden="true"><path d="M14 120 L12 50 M30 120 L32 30 M46 120 L50 56" stroke="#15803D" stroke-width="4" stroke-linecap="round"/><ellipse cx="12" cy="46" rx="4" ry="11" fill="#92400E" stroke="' + K + '" stroke-width="2"/><ellipse cx="32" cy="26" rx="4" ry="11" fill="#92400E" stroke="' + K + '" stroke-width="2"/></svg>';
    else if (tipo === 'fuente') s = '<svg class="al-decor al-decor--centro" viewBox="0 0 120 80" aria-hidden="true"><path class="al-chorro" d="M60 40 Q50 10 34 30 M60 40 Q70 10 86 30 M60 40 V12" fill="none" stroke="#60A5FA" stroke-width="4" stroke-linecap="round"/><ellipse cx="60" cy="60" rx="50" ry="14" fill="#93C5FD" stroke="' + K + '" stroke-width="3"/><path d="M10 60 V68 A50 14 0 0 0 110 68 V60" fill="#D6D3D1" stroke="' + K + '" stroke-width="3"/></svg>';
    else if (tipo === 'granero') s = '<svg class="al-decor al-decor--' + lado + ' al-decor--granero" viewBox="0 0 90 90" aria-hidden="true"><rect x="10" y="38" width="70" height="52" fill="#DC2626" stroke="' + K + '" stroke-width="3"/><polygon points="4,42 45,8 86,42" fill="#991B1B" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/><rect x="32" y="58" width="26" height="32" fill="#FFFFFF" stroke="' + K + '" stroke-width="2.4"/><path d="M32 58 L58 90 M58 58 L32 90" stroke="#DC2626" stroke-width="3"/></svg>';
    else if (tipo === 'valla') s = '<svg class="al-valla" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 H400 M0 22 H400" stroke="#92400E" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>';
    return s;
  }

  var ESCENAS = {
    calle:    { cielo: ['#BAE6FD', '#F0F9FF'], lejos: colinas('#86EFAC', '#4ADE80'), suelo: 'acera', decor: decor('arbolito', 'i') + decor('farol', 'd'), base: 16 },
    estanque: { cielo: ['#BFDBFE', '#ECFEFF'], lejos: colinas('#A7F3D0', '#6EE7B7'), suelo: 'estanque', decor: decor('juncos', 'i') + decor('juncos', 'd'), base: 7 },
    plaza:    { cielo: ['#FDE68A', '#FFFBEB'], lejos: ciudad('#FDBA74'), suelo: 'plaza', decor: decor('fuente', 'c'), base: 12 },
    habitat:  { cielo: ['#BAE6FD', '#ECFDF5'], lejos: colinas('#BBF7D0', '#86EFAC'), suelo: 'prado', decor: '', base: 9 },
    barrio:   { cielo: ['#C7D2FE', '#EEF2FF'], lejos: ciudad('#A5B4FC'), suelo: 'acera', decor: decor('farol', 'i') + decor('arbolito', 'd'), base: 16 },
    granja:   { cielo: ['#BAE6FD', '#FEFCE8'], lejos: colinas('#D9F99D', '#BEF264'), suelo: 'campo', decor: decor('granero', 'i') + decor('valla', 'c'), base: 9 }
  };
  A.escenas = Object.keys(ESCENAS);

  /* Devuelve { nodo, lugares, cielo } con las capas armadas; los lugares se agregan a `lugares`. */
  A.escena = function (tipo) {
    var e = ESCENAS[tipo] || ESCENAS.calle;
    var n = el('div', 'al-escena al-escena--' + tipo);
    n.setAttribute('data-escena', tipo);
    n.style.setProperty('--cielo-1', e.cielo[0]); n.style.setProperty('--cielo-2', e.cielo[1]); n.style.setProperty('--base', e.base + '%');
    n.innerHTML = '<div class="al-fondo" aria-hidden="true">' + SOL + nube('al-nube--1') + nube('al-nube--2') + nube('al-nube--3') +
      e.lejos + '<div class="al-suelo al-suelo--' + e.suelo + '"></div>' + e.decor + '</div>';
    var cielo = el('div', 'al-cielo');
    var lugares = el('div', 'al-lugares');
    n.appendChild(cielo); n.appendChild(lugares);
    return { nodo: n, cielo: cielo, lugares: lugares };
  };

  /* ============================================================
     GLOBO con el dibujo grande y la palabra
     ============================================================ */
  var COLORES_GLOBO = ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#0EA5E9'];
  A.globo = function (op) {
    var color = op.color || COLORES_GLOBO[(op.indice || 0) % COLORES_GLOBO.length];
    var b = el('button', 'al-globo');
    b.type = 'button';
    var plano = op.palabra.replace(/\*/g, ''), largo = Math.max.apply(null, plano.split(' ').map(function (w) { return w.length; }));
    var L = plano.indexOf(' ') >= 0 ? Math.max(largo, Math.ceil(plano.length / 2)) : plano.length;
    b.style.setProperty('--pal', (100 / Math.max(L, 4)).toFixed(2));
    b.setAttribute('aria-label', op.etiqueta || plano);
    b.innerHTML = '<svg class="al-globo__bola" viewBox="0 0 60 92" aria-hidden="true">' +
      '<path d="M30 58 C30 70 22 76 30 92" fill="none" stroke="' + K + '" stroke-width="2"/>' +
      '<ellipse cx="30" cy="28" rx="24" ry="27" fill="' + color + '" stroke="' + K + '" stroke-width="3"/>' +
      '<path d="M26 55 L34 55 L30 61 Z" fill="' + color + '" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<ellipse cx="21" cy="17" rx="5" ry="8" transform="rotate(25 21 17)" fill="#FFFFFF" opacity=".55"/></svg>' +
      '<span class="al-carta"><span class="al-carta__dibujo">' + A.icono(op.icono, 'al-ico al-ico--grande') + '</span>' +
      '<span class="al-carta__palabra" lang="en">' + marcas(op.palabra) + '</span></span>';
    return b;
  };

  /* ============================================================
     ESTRELLAS de la etapa
     ============================================================ */
  function estrella(llena) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 L15.1 8.2 L22.4 9 L17 14 L18.5 21.3 L12 17.6 L5.5 21.3 L7 14 L1.6 9 L8.9 8.2 Z" fill="' +
      (llena ? '#FBBF24' : '#FFFFFF') + '" stroke="' + K + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  /* Mano que muestra el arrastre en la demostracion de Pip. */
  A.mano = function () {
    var m = el('span', 'al-mano');
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<svg viewBox="0 0 40 48"><path d="M14 22 V6 a4 4 0 0 1 8 0 V20 l2-1 a4 4 0 0 1 5 3 l1-.5 a4 4 0 0 1 5 3 V34 c0 7-5 12-12 12 h-2 c-5 0-8-2-11-6 L4 32 a3.6 3.6 0 0 1 5-5 l5 5 Z" fill="#FFFFFF" stroke="' + K + '" stroke-width="3" stroke-linejoin="round"/></svg>';
    return m;
  };
  A.estrellas = function (n) {
    var c = el('div', 'al-estrellas');
    c.setAttribute('role', 'img');
    for (var i = 0; i < n; i++) { var s = el('span', 'al-estrella', estrella(false)); c.appendChild(s); }
    c._n = 0;
    c.setAttribute('aria-label', '0 / ' + n);
    return c;
  };
  A.llenarEstrella = function (c) {
    var s = c.children[c._n]; if (!s) return;
    s.innerHTML = estrella(true); s.classList.add('al-estrella--llena');
    c._n++; c.setAttribute('aria-label', c._n + ' / ' + c.children.length);
  };

  /* ============================================================
     ANIMACIONES
     ============================================================ */
  function reiniciarClase(n, cls) { n.classList.remove(cls); void n.getBoundingClientRect(); n.classList.add(cls); }
  function centro(n) { var r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r }; }

  A.temblar = function (lugar) { reiniciarClase(lugar, 'al-tiembla'); setTimeout(function () { lugar.classList.remove('al-tiembla'); }, 620); };
  A.brillar = function (lugar) { reiniciarClase(lugar, 'al-brilla'); setTimeout(function () { lugar.classList.remove('al-brilla'); }, 2600); };
  A.celebrar = function (pip) { if (pip) { reiniciarClase(pip, 'al-pip--fiesta'); setTimeout(function () { pip.classList.remove('al-pip--fiesta'); }, 1000); } };

  A.confeti = function (x, y, n) {
    if (MENOS_MOV) n = Math.min(n || 18, 8);
    var colores = ['#EF4444', '#F59E0B', '#FDE047', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    for (var i = 0; i < (n || 18); i++) {
      var p = el('span', 'al-confeti');
      var ang = (-90 + (Math.random() - 0.5) * 150) * Math.PI / 180, dist = 70 + Math.random() * 110;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = colores[i % colores.length];
      p.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(0) + 'px');
      p.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(0) + 'px');
      p.style.setProperty('--giro', ((Math.random() - 0.5) * 720).toFixed(0) + 'deg');
      if (i % 3 === 0) p.style.borderRadius = '50%';
      document.body.appendChild(p);
      setTimeout(function (q) { return function () { q.remove(); }; }(p), 1300);
    }
  };

  /* Pip y el globo llegan volando desde un costado */
  A.entrar = function (nodo) { reiniciarClase(nodo, 'al-entra'); setTimeout(function () { nodo.classList.remove('al-entra'); }, 900); };

  /* El globo vuela a la puerta del lugar y se encoge; luego se quita. */
  /* op.lento (demostracion): viaja despacio a tamaño casi normal, como arrastrado, y se encoge al llegar */
  A.volar = function (globo, lugar, alLlegar, op) {
    var g = centro(globo), d = centro(lugar.querySelector('.al-puerta') || lugar);
    var dx = d.x - g.x, dy = d.y - g.y, base = globo.style.transform || '';
    globo.style.animation = 'none';
    void globo.offsetWidth;   /* reflujo: sin esto el navegador no anima el viaje y el globo salta */
    if (op && op.lento && !MENOS_MOV) {
      globo.style.transition = 'transform 1.25s cubic-bezier(.45,.05,.55,.95)';
      globo.style.transform = base + ' translate(' + dx + 'px,' + (dy - g.r.height * 0.25) + 'px) scale(.75)';
      setTimeout(function () {
        globo.style.transition = 'transform .28s ease-in, opacity .28s';
        globo.style.transform = base + ' translate(' + dx + 'px,' + dy + 'px) scale(.2)'; globo.style.opacity = '0';
      }, 1250);
      setTimeout(function () { alLlegar && alLlegar(); }, 1530);
      return;
    }
    globo.style.transition = MENOS_MOV ? 'opacity .2s' : 'transform .42s cubic-bezier(.4,.1,.6,1), opacity .42s';
    globo.style.transform = base + ' translate(' + dx + 'px,' + dy + 'px) scale(.2)';
    globo.style.opacity = '0';
    setTimeout(function () { alLlegar && alLlegar(); }, MENOS_MOV ? 200 : 420);
  };

  /* Acierto: se abre la puerta, se asoma el vecino, el dibujo sube con confeti
     y queda en la ventana. La puerta se cierra sola. */
  A.abrir = function (lugar, icono, alTerminar) {
    reiniciarClase(lugar, 'al-abierta');
    var p = centro(lugar.querySelector('.al-puerta') || lugar);
    var sube = el('span', 'al-sube', A.icono(icono, 'al-ico'));
    sube.style.left = p.x + 'px'; sube.style.top = p.y + 'px';
    document.body.appendChild(sube);
    A.confeti(p.x, p.r.top, 22);
    var v = lugar.querySelector('.al-ventana');
    setTimeout(function () {
      sube.remove();
      if (v) {
        var x = +v.getAttribute('data-x'), y = +v.getAttribute('data-y'), l = +v.getAttribute('data-l');
        v.innerHTML = '<g class="al-ventana__pon">' + anidar(icono, x, y, l) + '</g>';
      }
    }, MENOS_MOV ? 500 : 1050);
    setTimeout(function () { lugar.classList.remove('al-abierta'); alTerminar && alTerminar(); }, MENOS_MOV ? 700 : 1500);
  };

  /* ============================================================
     ARRASTRE con el dedo o el raton, y toque
     op = { alSoltar(lugarNodo), alTocar(), selector }
     ============================================================ */
  A.arrastre = function (nodo, op) {
    var sel = op.selector || '[data-lugar]', ini = null, sobre = null, movido = false;
    function lugarEn(x, y) {
      nodo.style.visibility = 'hidden';
      var d = document.elementFromPoint(x, y);
      nodo.style.visibility = '';
      return d && d.closest ? d.closest(sel) : null;
    }
    function marcar(l) { if (sobre === l) return; if (sobre) sobre.classList.remove('al-sobre'); sobre = l; if (sobre) sobre.classList.add('al-sobre'); }
    nodo.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || nodo.disabled) return;
      ini = { x: e.clientX, y: e.clientY, id: e.pointerId }; movido = false;
      try { nodo.setPointerCapture(e.pointerId); } catch (er) { /* nada */ }
    });
    nodo.addEventListener('pointermove', function (e) {
      if (!ini || e.pointerId !== ini.id) return;
      var dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      if (!movido && Math.abs(dx) + Math.abs(dy) < 8) return;
      if (!movido) {
        movido = true;
        /* se encoge alrededor del dedo para que se vean los lugares */
        Array.prototype.forEach.call(nodo.children, function (h) { var r = h.getBoundingClientRect(); h.style.transformOrigin = (ini.x - r.left) + 'px ' + (ini.y - r.top) + 'px'; });
        nodo.classList.add('al-arrastrando');
      }
      nodo.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      nodo.style.setProperty('--inclina', Math.max(-12, Math.min(12, dx / 14)).toFixed(1) + 'deg');
      marcar(lugarEn(e.clientX, e.clientY));
      e.preventDefault();
    });
    function fin(e, vale) {
      if (!ini || e.pointerId !== ini.id) return;
      var l = vale && movido ? lugarEn(e.clientX, e.clientY) : null, eraMov = movido;
      ini = null; marcar(null); nodo.classList.remove('al-arrastrando');
      if (eraMov) {
        nodo._sinClick = true; setTimeout(function () { nodo._sinClick = false; }, 60);
        if (l) { op.alSoltar && op.alSoltar(l); }
        else { nodo.style.transition = 'transform .25s ease'; nodo.style.transform = ''; setTimeout(function () { nodo.style.transition = ''; }, 260); }
      }
    }
    nodo.addEventListener('pointerup', function (e) { fin(e, true); });
    nodo.addEventListener('pointercancel', function (e) { fin(e, false); });
    nodo.addEventListener('click', function (e) { if (nodo._sinClick) { e.preventDefault(); return; } op.alTocar && op.alTocar(); });
  };
})();
