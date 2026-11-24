// titulo: Paper pieces catalogue
// usa: papel
/* ============================================================
   HOJA DEL CATÁLOGO DE PIEZAS DE PAPEL (solo _local/, no se publica)
   Todas las piezas de prototipos/comun/papel-piezas.js, por categoría,
   numeradas y con su nombre, sobre el tablero de cartón. Sirve también
   como hoja para la revisión de contenido infantil.
   Para sumar una pieza: agrégala al catálogo y a C.categorias, y aquí
   en MUESTRA con su escala.
   ============================================================ */
(function () {
  'use strict';
  var P = window.PROTO_COMUN, PP = window.SAMSAN_PAPEL, C = PP && PP.catalogo;
  var W = 960, CEL = 160, COLS = 6, CAB = 46;

  var TITULOS = { mateNumeros: 'Matemáticas · números y signos', mateInstrumentos: 'Matemáticas · instrumentos', mateConteo: 'Matemáticas · conteo y valor posicional', mateFiguras: 'Matemáticas · figuras 2D', mateSolidos: 'Matemáticas · sólidos 3D', mateDesarrollos: 'Matemáticas · desarrollos de los sólidos', mateDatos: 'Matemáticas · fracciones y gráficas', construccion: 'Construcción', materiales: 'Construcción · materiales de muro', techos: 'Construcción · techos (forma y material)', aberturas: 'Construcción · puertas y ventanas', detalles: 'Construcción · detalles de fachada', suelos: 'Construcción · suelos y caminos', obra: 'Construcción · obra', vehiculos: 'Vehículos', aldea: 'Aldea (Year 2)', estacion: 'Estación (Year 6)' };
  var CORTO = { dosAguas: '2 aguas', dosAguasLado: 'lado', unaAgua: '1 agua', plano: 'plano', conico: 'cónico', cupula: 'cúpula' };
  /* «muro:adobe» o «techo:conico:pizarra»: variantes que se arman solas. */
  function variante(nombre) {
    var p = nombre.split(':');
    if (p[0] === 'muro') return [function (ctx) { C.muro({ material: p[1], ancho: 124, alto: 96 }).dibujar(ctx, 0, 0); }, 0.95, p[1]];
    if (p[0] === 'suelo') return [function (ctx) { C.suelo({ material: p[1], ancho: 128, alto: 80 }).dibujar(ctx, 0, 0); }, 0.95, p[1]];
    if (p[0] === 'techo') return [function (ctx) { C.techo({ forma: p[1], material: p[2] }).dibujar(ctx, 0, 6); }, 1.25, (CORTO[p[1]] || p[1]) + ' · ' + p[2]];
    /* Resto: C.<pieza>({ valor }) con su escala. */
    var ESC = { solido: 1.35, desarrollo: 0.95, numero: 1, simbolo: 1.2, dado: 1.5, moneda: 1.7, figura: 1.3, fraccion: 1.4, base10: p[1] === 'centena' ? 0.85 : p[1] === 'decena' ? 0.95 : 2.2 };
    if (p.length > 1 && C[p[0]]) return [function (ctx) { C[p[0]]({ valor: p[1] }).dibujar(ctx, 0, 0); }, ESC[p[0]] || 1, p[0] + ' ' + p[1]];
    return null;
  }
  /* Cómo mostrar cada pieza en su celda: [función que dibuja en (0,0), escala]. Las anchas van aparte. */
  function una(fn) { return function (ctx) { fn().dibujar(ctx, 0, 0); }; }
  var MUESTRA = {
    tarjeta: [function (ctx) { C.tarjeta({ texto: '47' }).dibujar(ctx, -46, 0); C.tarjeta({ texto: '3/4' }).dibujar(ctx, 30, 0); }, 0.8, 'tarjeta 47 / 3/4'],
    marcador: [una(function () { return C.marcador(); }), 1],
    cuenta: [function (ctx) { ['u', 'd', 'c'].forEach(function (v, i) { C.cuenta({ valor: v }).dibujar(ctx, -30 + i * 30, 0); }); }, 1, 'cuenta u / d / c'],
    varilla: [function (ctx) { C.varilla({ largo: 120 }).dibujar(ctx, 0, 0); [-40, -12, 16].forEach(function (y) { C.cuenta({ valor: 'd' }).dibujar(ctx, 0, y); }); }, 1, 'varilla con cuentas'],
    marco10: [una(function () { return C.marco10({ llenos: 7 }); }), 0.85, 'marco10 (7)'],
    gema: [una(function () { return C.gema(); }), 1.4],
    solidosOcultas: [function (ctx) { C.solido({ valor: 'cubo', aristasOcultas: true }).dibujar(ctx, -34, 0); C.solido({ valor: 'cono', aristasOcultas: true }).dibujar(ctx, 34, 0); }, 1, 'aristas ocultas (opción)'],
    calculadora: [una(function () { return C.calculadora(); }), 0.72],
    regla: [una(function () { return C.regla(); }), 0.72],
    transportador: [una(function () { return C.transportador(); }), 0.95],
    escuadra: [una(function () { return C.escuadra(); }), 1.05],
    reloj: [una(function () { return C.reloj({ hora: 3, minuto: 0 }); }), 1.35, 'reloj (3:00)'],
    balanza: [una(function () { return C.balanza(); }), 0.75],
    pizarra: [una(function () { return C.pizarra(); }), 0.85],
    ficha: [function (ctx) { C.ficha({ valor: 'roja' }).dibujar(ctx, -20, 0); C.ficha({ valor: 'amarilla' }).dibujar(ctx, 20, 0); }, 1.5, 'fichas'],
    grafica: [una(function () { return C.grafica(); }), 0.85, 'gráfica de barras'],
    ladrillo: [una(function () { return C.ladrillo(); }), 1.5],
    muro: [una(function () { return C.muro(); }), 0.85],
    bloque: [function (ctx) { C.bloque({ color: '#E07A3F' }).dibujar(ctx, -28, 10); C.bloque({ color: '#3E8E7E' }).dibujar(ctx, 28, 10); C.bloque({ color: '#F2C14E' }).dibujar(ctx, 0, -40); }, 0.85],
    viga: [una(function () { return C.viga(); }), 0.85],
    columna: [una(function () { return C.columna(); }), 1.1],
    columnaPiedra: [una(function () { return C.columnaPiedra(); }), 1.3],
    arco: [una(function () { return C.arco(); }), 1],
    rampa: [una(function () { return C.rampa(); }), 1.1],
    escalera: [una(function () { return C.escalera(); }), 1.1],
    techo: [una(function () { return C.techo(); }), 1.2],
    puerta: [una(function () { return C.puerta(); }), 1.4],
    ventanaCasa: [una(function () { return C.ventanaCasa(); }), 1.5, 'ventanaCasa'],
    engranaje: [function (ctx) { C.engranaje().dibujar(ctx, -18, -6); C.engranaje({ r: 20, color: '#C2453A' }).dibujar(ctx, 30, 22); }, 1],
    tuerca: [una(function () { return C.tuerca(); }), 1.6],
    cono: [una(function () { return C.cono(); }), 1.3],
    andamio: [una(function () { return C.andamio(); }), 0.85],
    grua: [una(function () { return C.grua(); }), 0.85],
    ventanaArco: [una(function () { return C.ventanaArco(); }), 1.5],
    ventanaRedonda: [una(function () { return C.ventanaRedonda(); }), 1.7],
    ventanaPostigos: [una(function () { return C.ventanaPostigos(); }), 1.4],
    puertaDoble: [una(function () { return C.puertaDoble(); }), 1.3],
    porton: [una(function () { return C.porton(); }), 1.2],
    reja: [una(function () { return C.reja(); }), 1.3],
    vitral: [una(function () { return C.vitral(); }), 1.35],
    chimenea: [una(function () { return C.chimenea(); }), 1.5],
    balcon: [una(function () { return C.balcon(); }), 1.1],
    toldo: [una(function () { return C.toldo(); }), 1.1],
    escaleraExterior: [una(function () { return C.escaleraExterior(); }), 1.05, 'escalera exterior'],
    torre: [una(function () { return C.torre(); }), 0.62],
    almenas: [una(function () { return C.almenas(); }), 1],
    puente: [una(function () { return C.puente(); }), 0.75],
    farol: [una(function () { return C.farol(); }), 1.8],
    pilaLadrillos: [una(function () { return C.pilaLadrillos(); }), 1.1, 'pila de ladrillos'],
    tablonesApilados: [una(function () { return C.tablonesApilados(); }), 1, 'tablones apilados'],
    saco: [una(function () { return C.saco(); }), 1.5, 'saco de cemento'],
    balde: [una(function () { return C.balde(); }), 1.6],
    carretilla: [una(function () { return C.carretilla(); }), 1.35],
    furgoneta: [una(function () { return C.furgoneta(); }), 1.05],
    cupe: [una(function () { return C.cupe(); }), 1.1],
    sedanLargo: [una(function () { return C.sedanLargo(); }), 1],
    mini: [una(function () { return C.mini(); }), 1.2],
    sedan: [una(function () { return C.sedan(); }), 1.05],
    camioneta: [una(function () { return C.camioneta(); }), 1.1],
    compacto: [una(function () { return C.compacto(); }), 1.1],
    deportivo: [una(function () { return C.deportivo(); }), 1.05],
    casa: [function (ctx) { C.casa().dibujar(ctx, -36, 0); C.casa({ techo: '#3E8E7E', color: '#F1E4C6' }).dibujar(ctx, 40, 0); }, 0.85],
    arbol: [una(function () { return C.arbol(); }), 1.3],
    arbusto: [una(function () { return C.arbusto(); }), 1.4],
    nube: [una(function () { return C.nube(); }), 1.3],
    tabla: [una(function () { return C.tabla(); }), 1.2],
    carrito: [una(function () { return C.carrito(); }), 1.4, 'carro'],
    cerca: [una(function () { return C.cerca(); }), 1.2],
    panel: [una(function () { return C.panel(); }), 0.75],
    brazo: [una(function () { return C.brazo(); }), 0.9],
    modulo: [function (ctx) { C.modulo().dibujar(ctx, 0, 0); C.ventana().dibujar(ctx, 0, 0); }, 0.62, 'modulo + ventana'],
    antena: [una(function () { return C.antena(); }), 1.1],
    nave: [una(function () { return C.nave(); }), 1.1],
    estrella: [una(function () { return C.estrella({ r: 14 }); }), 1.6],
    planeta: [una(function () { return C.planeta({ r: 230 }); }), 0.24]
  };
  /* Piezas anchas: [nombre, alto, función(ctx, y)]. */
  var ANCHAS = {
    digitos: [110, function (ctx, y, n) {
      for (var d = 0; d <= 9; d++) C.numero({ valor: d }).dibujar(ctx, 66 + d * 92, y + 48);
      etiqueta(ctx, n, 'numero 0-9 (recortados)', W / 2, y + 96, C.nombreIngles('digitos'));
    }],
    recta: [110, function (ctx, y, n) {
      var r1 = C.recta({ inicio: 0, fin: 100, paso: 10, largo: 400 });
      r1.dibujar(ctx, 240, y + 40);
      C.marcador().dibujar(ctx, 240 + r1.xDe(70), y + 32 - C.marcador().punta);
      etiqueta(ctx, n, 'recta 0-100 + marcador', 240, y + 86, 'number line + pointer');
      C.recta({ inicio: 0, fin: 1, paso: 0.1, largo: 400 }).dibujar(ctx, 720, y + 40);
      etiqueta(ctx, n + 0.5, 'recta 0-1 (decimales)', 720, y + 86, 'number line (decimals)');
    }],
    portal: [250, function (ctx, y, n) {
      ctx.save(); ctx.translate(W / 2, y + 128); ctx.scale(0.72, 0.72);
      C.portal().dibujar(ctx, 0, 0);
      ctx.restore();
      etiqueta(ctx, n, 'portal (castillo)', W / 2, y + 234, C.nombreIngles('portal'));
    }],
    hojaRio: [90, function (ctx, y, n) {
      C.hojaRio({ ancho: W, y: y + 40 }).dibujar(ctx, 0, 0);
      etiqueta(ctx, n, 'hojaRio', W / 2, y + 40, C.nombreIngles('hojaRio'));
    }],
    hojaPasto: [150, function (ctx, y, n) {
      C.hojaPasto({ ancho: W, alto: y + 150, borde: y + 30 }).dibujar(ctx, 0, 0);
      C.tabla().dibujar(ctx, 120, y + 92); C.casa().dibujar(ctx, 300, y + 74);
      C.arbol().dibujar(ctx, 420, y + 76); C.cerca().dibujar(ctx, 560, y + 86);
      C.carrito().dibujar(ctx, 700, y + 86); C.arbusto().dibujar(ctx, 840, y + 100);
      etiqueta(ctx, n, 'hojaPasto con aldea', W / 2, y + 128, 'grass sheet with village');
    }]
  };

  /* Etiqueta: número y nombre en español; debajo, el nombre en inglés si lo hay. */
  function etiqueta(ctx, n, nombre, x, y, ingles) {
    var t = (n % 1 ? '' : n + '  ') + nombre;
    ctx.save();
    ctx.font = '800 13px Nunito, system-ui, sans-serif';
    var w = ctx.measureText ? ctx.measureText(t).width + 14 : 120;
    if (ingles) {
      ctx.font = 'italic 700 12px Nunito, system-ui, sans-serif';
      w = Math.max(w, (ctx.measureText ? ctx.measureText(ingles).width : 100) + 14);
    }
    var alto = ingles ? 34 : 20, y0 = ingles ? y - 7 : y;
    ctx.fillStyle = '#FFF6DC'; ctx.shadowColor = 'rgba(42,30,20,.3)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    ctx.fillRect(x - w / 2, y0 - 10, w, alto);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#1E1426'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 13px Nunito, system-ui, sans-serif'; ctx.fillText(t, x, y0 + 1);
    if (ingles) { ctx.fillStyle = '#4A3B5C'; ctx.font = 'italic 700 12px Nunito, system-ui, sans-serif'; ctx.fillText(ingles, x, y0 + 15); }
    ctx.restore();
  }
  function cabecera(ctx, titulo, cuantas, y) {
    ctx.save();
    ctx.fillStyle = 'rgba(30,20,38,.82)'; ctx.fillRect(0, y, W, CAB - 10);
    ctx.fillStyle = '#FFF6DC'; ctx.font = '900 20px Nunito, system-ui, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText(titulo + '  ·  ' + cuantas + ' piezas', 16, y + (CAB - 10) / 2 + 1);
    ctx.restore();
  }

  /* Distribución: por categoría, una cabecera, la grilla y las piezas anchas. */
  function plano() {
    var bloques = [], y = 10;
    Object.keys(C.categorias).forEach(function (cat) {
      var nombres = C.categorias[cat], celdas = nombres.filter(function (n) { return MUESTRA[n] || variante(n); }), anchas = nombres.filter(function (n) { return ANCHAS[n]; });
      var b = { cat: cat, y: y, celdas: celdas, anchas: anchas, total: nombres.length };
      y += CAB + Math.ceil(celdas.length / COLS) * CEL;
      b.yAnchas = y;
      anchas.forEach(function (n) { y += ANCHAS[n][0]; });
      y += 14;
      bloques.push(b);
    });
    return { bloques: bloques, alto: y };
  }

  /* Los números y signos usan la letra Nunito: se dibujan cuando la fuente ya cargó. */
  function mostrar() {
    var listo = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    listo.then(dibujarHoja, dibujarHoja);
  }
  function dibujarHoja() {
    P.$('#proto').innerHTML =
      '<section class="pc-marco"><canvas id="pc-lienzo" role="img" aria-label="Catalogue of paper pieces by category"></canvas>' +
      '<div class="k-panel pc-panel"><p class="k-rotulo">Paper pieces</p><p id="pc-info" aria-live="polite"></p></div></section>';
    var c = P.$('#pc-lienzo'), ctx = c.getContext ? c.getContext('2d') : null;
    if (!ctx || !C) { P.$('#pc-info').textContent = 'Canvas no disponible.'; return; }
    var pl = plano(), H = pl.alto, dpr = PP.dpr();
    c.width = W * dpr; c.height = H * dpr; c.style.aspectRatio = W + ' / ' + H;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var t0 = performance.now();
    ctx.drawImage(PP.tablero(W, H).lienzo, 0, 0, W, H);
    var n = 0, faltan = [];
    pl.bloques.forEach(function (b) {
      cabecera(ctx, TITULOS[b.cat] || b.cat, b.total, b.y);
      b.celdas.forEach(function (nombre, i) {
        var m = MUESTRA[nombre] || variante(nombre), cx = (i % COLS) * CEL + CEL / 2, cy = b.y + CAB + Math.floor(i / COLS) * CEL + CEL / 2 - 10;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(m[1], m[1]);
        try { m[0](ctx); } catch (e) { faltan.push(nombre); }
        ctx.restore();
        etiqueta(ctx, ++n, m[2] || nombre, cx, cy + CEL / 2 - 8, C.nombreIngles(nombre));
      });
      var y = b.yAnchas;
      b.anchas.forEach(function (nombre) { ANCHAS[nombre][1](ctx, y, ++n); y += ANCHAS[nombre][0]; });
    });
    P.$('#pc-info').textContent = n + ' piezas en ' + pl.bloques.length + ' categorías · todo dibujado en ' + Math.round(performance.now() - t0) + ' ms' + (faltan.length ? ' · fallaron: ' + faltan.join(', ') : '');
    window.PAPEL_CATALOGO = { piezas: n, categorias: pl.bloques.length, faltan: faltan };
  }

  var css = document.createElement('style');
  css.textContent = [
    '.pc-marco{max-width:980px;margin:0 auto}',
    '#pc-lienzo{display:block;width:100%;height:auto;border:3px solid #1E1426;border-radius:12px}',
    '.pc-panel{margin-top:10px;background:#FFFDF6;color:#1E1426}'
  ].join('\n');
  document.head.appendChild(css);

  P.$('#proto').innerHTML =
    '<section class="k-panel pc-panel"><p class="k-rotulo">Paper pieces</p><h2>Catalogue</h2>' +
    '<p>Every reusable paper piece, by category.</p>' +
    '<div class="k-botones"><button type="button" class="k-boton k-boton--primario" id="play">SEE PIECES</button></div></section>';
  P.$('#play').addEventListener('click', function () { P.sonido('paso'); mostrar(); });
})();
