/* ============================================================
   SAMSAN — MUNDO / SPRITES.JS
   Personajes: carga de PNG (data URI), intercambio de paleta para
   los 12 tonos de piel, y animacion por codigo sin cuadros extra:
   estirar y aplastar, rebote en reposo, salto de alegria, parpadeo.

   Mientras no llega el arte de PixelLab, el explorador y el topo se
   dibujan por codigo (provisionales de la muestra aprobada). Usan la
   rampa `piel` de referencia, igual que la mascota procesada, asi que
   el intercambio de paleta sirve para los dos.
   ============================================================ */
(function (M) {
  'use strict';
  var S = M.sprites = {};

  /* Canvas desde un Buf o un PNG ya cargado. */
  function aCanvas(src) {
    if (src instanceof M.Buf) return src.canvas();
    var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    var x = c.getContext('2d'); if (x) { x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0); }
    return c;
  }
  S.aCanvas = aCanvas;

  /* PNG en data URI -> Promise<canvas>. */
  S.cargar = function (uri) {
    return new Promise(function (ok, mal) {
      var img = new Image();
      img.onload = function () { ok(aCanvas(img)); };
      img.onerror = mal;
      img.src = uri;
    });
  };

  /* Copia de un canvas con colores cambiados (intercambio de paleta). */
  S.recolorear = function (canvas, mapa) {
    var c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
    var x = c.getContext('2d'); if (!x) return c;
    x.drawImage(canvas, 0, 0);
    var id = x.getImageData(0, 0, c.width, c.height);
    M.cambiarColores(id.data, mapa);
    x.putImageData(id, 0, 0);
    return c;
  };
  /* El mismo sprite con la piel de un tono (assets/ui.js, armoury.skins). */
  S.conPiel = function (canvas, tono) { return S.recolorear(canvas, M.mapaPiel(tono)); };

  /* Espejo horizontal. */
  S.espejo = function (canvas) {
    var c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
    var x = c.getContext('2d'); if (!x) return c;
    x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(canvas, 0, 0);
    return c;
  };

  /* Pone un sombrero sobre un personaje. `dx` corre el sombrero en x respecto
     al centro; `dyFrac` es cuanto sobresale hacia arriba, en fraccion de su
     alto (negativo = arriba). El canvas crece hacia arriba lo necesario y
     guarda en `.arriba` cuanto crecio, para corregir los anclajes. */
  S.conSombrero = function (cuerpo, sombrero, dx, dyFrac) {
    var arriba = Math.max(0, -Math.round(sombrero.height * dyFrac));
    var sx = Math.round(cuerpo.width / 2 - sombrero.width / 2 + (dx || 0));
    var izq = Math.max(0, -sx), der = Math.max(0, sx + sombrero.width - cuerpo.width);
    var c = document.createElement('canvas'); c.width = cuerpo.width + izq + der; c.height = cuerpo.height + arriba;
    var x = c.getContext('2d');
    if (x) { x.imageSmoothingEnabled = false; x.drawImage(cuerpo, izq, arriba); x.drawImage(sombrero, izq + sx, 0); }
    c.arriba = arriba;
    return c;
  };

  /* Silueta en un color (el fantasma del error). */
  S.silueta = function (canvas, rgb) {
    var c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
    var x = c.getContext('2d'); if (!x) return c;
    x.drawImage(canvas, 0, 0);
    var id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (var i = 0; i < d.length; i += 4) if (d[i + 3]) { d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; }
    x.putImageData(id, 0, 0);
    return c;
  };

  /* Dibuja apoyado en los pies, con estirar y aplastar: `sq` > 0 estira
     hacia arriba, < 0 aplasta. `dy` suma rebote o salto. */
  S.dibujar = function (bx, img, x, yPies, sq, dy) {
    sq = sq || 0;
    var sy = 1 + sq, sx = 1 - sq * 0.6, w = img.width * sx, h = img.height * sy;
    bx.drawImage(img, Math.round(x + img.width / 2 - w / 2), Math.round(yPies - h + (dy || 0)), Math.round(w), Math.round(h));
  };

  /* Animador por codigo de un personaje quieto: parpadeo, rebote y salto. */
  S.animador = function () {
    var a = { parpadeoT: 3, parpadeo: 0, alegria: 0, sq: 0, moviendo: false };
    a.actualizar = function (dt, moviendo, suave, alFrenar) {
      a.parpadeoT -= dt; if (a.parpadeoT <= 0) { a.parpadeo = 0.13; a.parpadeoT = 2.5 + Math.random() * 3; }
      if (a.parpadeo > 0) a.parpadeo -= dt;
      if (a.alegria > 0) a.alegria -= dt;
      if (suave) {
        if (moviendo) a.sq += (0.07 - a.sq) * Math.min(1, dt * 12);
        else if (a.moviendo) { a.sq = -0.13; if (alFrenar) alFrenar(); }
        else a.sq += (0 - a.sq) * Math.min(1, dt * 9);
      } else a.sq = 0;
      a.moviendo = moviendo;
    };
    a.rebote = function (time, suave) {
      if (!suave) return 0;
      if (a.alegria > 0) return Math.round(-Math.abs(Math.sin(a.alegria * 7)) * 5);
      return a.moviendo ? 0 : Math.round(Math.sin(time * 2.2) * 0.6);
    };
    a.celebrar = function () { a.alegria = 1.2; };
    return a;
  };

  /* ---------- Provisionales por codigo (muestra aprobada) ---------- */
  var PIEL = function () { return (M.PAL.piel || ['#B8735A', '#D8966F', '#F2B98F', '#FCD9B8']); };

  /* Explorador: A quieto, B trepando, C celebrando; `blink` cierra los ojos. */
  S.explorador = function (pose, blink) {
    var b = new M.Buf(34, 46), ox = 1, oy = 1, P = PIEL();
    var set = function (x, y, c) { b.set(x + ox, y + oy, c); }, R = function (x, y, w, h, c) { b.rect(x + ox, y + oy, w, h, c); };
    var skin = P[2], skinS = P[1], vest = '#2E8B85', vestH = '#4FB7A8', vestS = '#1F5F60';
    R(1, 21, 5, 9, '#8A5A34'); R(5, 21, 1, 9, '#6B3D22'); R(1, 21, 5, 1, '#B07A48');
    var legUp = pose === 'B' ? 3 : 0;
    R(7, 31, 4, 7, '#3B3F6B'); R(10, 31, 1, 7, '#2A2D52');
    R(13, 31, 4, 7 - legUp, '#3B3F6B'); R(16, 31, 1, 7 - legUp, '#2A2D52');
    R(6, 38, 5, 3, '#5A3222'); R(6, 38, 5, 1, '#8A5A34'); R(6, 41, 5, 1, '#2A1A18');
    R(13, 38 - legUp, 5, 3, '#5A3222'); R(13, 38 - legUp, 5, 1, '#8A5A34'); R(13, 41 - legUp, 5, 1, '#2A1A18');
    R(6, 21, 13, 8, vest); R(6, 21, 2, 8, vestH); R(17, 21, 2, 8, vestS);
    R(11, 21, 3, 8, '#EFE2C4'); R(13, 21, 1, 8, '#D6C49E');
    R(6, 29, 13, 2, '#6B3D22'); R(11, 29, 3, 2, '#FFD34D');
    if (pose === 'C') { M.drawLine(b, 6 + ox, 22 + oy, 2 + ox, 12 + oy, '#EFE2C4', 2); R(1, 9, 3, 3, skin); }
    else { M.drawLine(b, 5 + ox, 22 + oy, 4 + ox, 27 + oy, '#EFE2C4', 2); R(3, 28, 3, 3, skin); }
    var hy = pose === 'B' ? 23 : 18;
    M.drawLine(b, 17 + ox, 22 + oy, 20 + ox, hy + 1 + oy, '#EFE2C4', 2);
    R(20, hy, 3, 3, skin); R(20, hy + 2, 3, 1, skinS);
    for (var y = 11; y <= 20; y++) for (var x = 5; x <= 19; x++) {
      var corner = (y === 11 || y === 20) && (x === 5 || x === 19);
      if (!corner) set(x, y, x >= 18 || y === 20 ? skinS : skin);
    }
    R(4, 11, 2, 3, '#5A3222'); R(19, 11, 2, 2, '#5A3222');
    if (blink) { R(13, 15, 2, 1, '#2A1A2E'); R(17, 15, 2, 1, '#2A1A2E'); }
    else { R(13, 14, 2, 2, '#2A1A2E'); set(13, 14, '#FFFFFF'); R(17, 14, 2, 2, '#2A1A2E'); set(17, 14, '#FFFFFF'); }
    set(11, 17, '#F29A9A'); set(10, 17, '#F29A9A'); set(19, 17, '#F29A9A');
    set(14, 17, '#8A3B3B'); set(15, 18, '#8A3B3B'); set(16, 18, '#8A3B3B'); set(17, 17, '#8A3B3B');
    for (y = 1; y <= 8; y++) for (x = 3; x <= 21; x++) {
      var nx = (x + 0.5 - 12) / 9, ny = (y + 0.5 - 9) / 8;
      if (nx * nx + ny * ny > 1) continue;
      var v = -(nx * 0.7 + ny * 0.8);
      set(x, y, v > 0.75 ? '#FFF1B8' : v > 0.2 ? '#F7D774' : v > -0.4 ? '#E3B33A' : '#A8741C');
    }
    R(2, 9, 21, 1, '#F0C24A'); R(2, 10, 21, 1, '#A8741C');
    R(11, 3, 3, 3, '#FFF8D6'); set(11, 3, '#FFFFFF'); R(10, 3, 1, 3, '#B8862A'); R(14, 3, 1, 3, '#B8862A');
    M.silhouetteOutline(b, M.PAL.contorno);
    return b;
  };
  /* Anclajes del explorador provisional: la mano en la cuerda y el cinturon. */
  S.EXPLORADOR = { manoX: 22, cinturaY: 30, lamparaX: 12, lamparaY: 4 };

  /* Juego de poses listo para dibujar, con la piel de un tono. */
  S.juegoExplorador = function (tono) {
    var out = {};
    ['A', 'B', 'C'].forEach(function (p) {
      out[p] = S.explorador(p, false).canvas();
      out[p + 'b'] = S.explorador(p, true).canvas();
      if (tono) { out[p] = S.conPiel(out[p], tono); out[p + 'b'] = S.conPiel(out[p + 'b'], tono); }
    });
    out.fantasma = S.silueta(out.A, [127, 227, 240]);
    return out;
  };

  /* Topo minero provisional (compañero de la Caverna). */
  S.topo = function (blink) {
    var b = new M.Buf(26, 22);
    var pelo = '#6B4A3A', peloS = '#4A3128', peloH = '#8C6A55', nariz = '#F29A9A', garra = '#EFE2C4';
    for (var y = 6; y < 21; y++) for (var x = 3; x < 23; x++) {
      var nx = (x + 0.5 - 13) / 10, ny = (y + 0.5 - 14) / 7.5;
      if (nx * nx + ny * ny > 1) continue;
      b.set(x, y, ny > 0.55 || nx > 0.7 ? peloS : (nx < -0.3 && ny < -0.2 ? peloH : pelo));
    }
    b.rect(19, 13, 5, 3, '#C98A8A'); b.rect(23, 13, 2, 2, nariz);      // hocico
    if (blink) b.rect(17, 11, 2, 1, '#1E1426'); else { b.rect(17, 10, 2, 2, '#1E1426'); b.set(17, 10, '#FFFFFF'); }
    b.rect(6, 19, 4, 2, garra); b.rect(15, 19, 4, 2, garra);             // patas
    for (y = 1; y <= 7; y++) for (x = 6; x <= 20; x++) {                   // casco
      var cx = (x + 0.5 - 13) / 7.5, cy = (y + 0.5 - 7) / 6;
      if (cx * cx + cy * cy > 1) continue;
      var v = -(cx * 0.7 + cy * 0.8);
      b.set(x, y, v > 0.7 ? '#FFF1B8' : v > 0.1 ? '#F7D774' : '#C98A1C');
    }
    b.rect(5, 7, 17, 1, '#A8741C');
    b.rect(16, 2, 3, 3, '#FFF8D6');                                        // lampara
    M.silhouetteOutline(b, M.PAL.contorno);
    return b;
  };
  S.TOPO = { lamparaX: 17, lamparaY: 3 };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
