/* ============================================================
   SAMSAN — MUNDO / CAPAS.JS
   Parallax de cinco capas con niebla (docs/direccion-grafica.md §6):
     lejano (0,45 y 0,7) · superficie: nubes 0,15, montanas 0,35,
     colinas 0,62 · pared del fondo (1) · terreno y props (1) ·
     primer plano oscuro (1,25). La niebla va entre lo lejano y la
     pared y se espesa con la profundidad.

   Con opts.depth apagado (o movimiento reducido) todo se mueve con
   factor 1: queda el aspecto plano, sin parallax.

   Orden de capas de mundo (las usa tambien el bioma):
     10 lejano · 20 superficie · 25 niebla · 30 pared · 35 cuerda ·
     40 terreno · 45 props · 50 llamas · 60 personajes · 80 primer plano
   ============================================================ */
(function (M) {
  'use strict';
  var C = M.capas = {};

  function f(L, factor) { return L.opts.depth ? factor : 1; }

  /* Caverna lejana: dos pasadas de estalactitas y estalagmitas a 0,45 y
     0,7, con brillos que laten entre ellas. */
  C.lejano = function (L, cfg) {
    var W = L.W, H = L.H, r = M.rng(cfg.semilla || 9);
    function forma(n) {
      return Array.from({ length: n }, function () { return { x: r() * W, w: 10 + r() * 26, h: 30 + r() * 70, up: r() < 0.5 }; });
    }
    var A = forma(16), B = forma(12).map(function (o) { o.w += 4; o.h += 10; return o; });
    var brillos = Array.from({ length: 30 }, function () { return { x: r() * W, y: cfg.brillosY + r() * 220, ph: r() * 6 }; });
    var ancla = cfg.ancla || 250, suelo = cfg.suelo || 600, techo = cfg.techo || 376;
    function pasada(bx, camI, arr, factor, col) {
      var k = f(L, factor), off = L.opts.depth ? camI * k + ancla * (1 - k) : camI;
      bx.fillStyle = col;
      arr.forEach(function (o) {
        for (var i = 0; i < o.w; i++) {
          var kk = 1 - Math.abs(i - o.w / 2) / (o.w / 2), hgt = Math.round(o.h * Math.pow(kk, 0.8));
          var x = Math.round(o.x + i) % W;
          if (o.up) bx.fillRect(x, Math.round(suelo - hgt - off), 1, hgt + 60);
          else bx.fillRect(x, Math.round(techo - off) - 40, 1, hgt + 40);
        }
      });
    }
    L.capa('mundo', 10, function (bx, camI) {
      var g = bx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, cfg.fondo[0]); g.addColorStop(1, cfg.fondo[1]);
      bx.fillStyle = g; bx.fillRect(0, 0, W, H + 2);
      pasada(bx, camI, A, 0.45, L.opts.depth ? cfg.colorA : cfg.planoA);
      if (L.opts.depth) {
        brillos.forEach(function (p) {
          var a = 0.35 + 0.35 * Math.sin(L.time * 1.3 + p.ph);
          bx.fillStyle = 'rgba(' + cfg.brillo + ',' + a + ')';
          bx.fillRect(Math.round(p.x), Math.round(p.y - (camI * 0.45 + ancla * 0.55)), 1, 1);
        });
      }
      pasada(bx, camI, B, 0.7, L.opts.depth ? cfg.colorB : cfg.planoB);
    });
  };

  /* Superficie: cielo, sol, nubes, montanas y colinas por encima de
     `superficie` (y del mundo). */
  C.superficie = function (L, cfg) {
    var W = L.W, r = M.rng(cfg.semilla || 9), SURF = cfg.superficie;
    var montes = [], colinas = [];
    for (var x = 0; x < W; x++) {
      montes[x] = 58 + Math.sin(x * 0.012 + 1) * 26 + Math.sin(x * 0.041) * 10 + Math.sin(x * 0.11) * 3;
      colinas[x] = 24 + Math.sin(x * 0.02 + 3) * 10 + Math.sin(x * 0.07) * 4;
    }
    var nubes = Array.from({ length: 5 }, function (_, i) { return { x: i * 150 + r() * 60, y: 26 + r() * 50, w: 36 + r() * 30, sp: 3 + r() * 4 }; });
    function perfil(bx, camI, arr, factor, top, body, surfY) {
      var baseY = SURF - camI * f(L, factor);
      for (var x = 0; x < W; x++) {
        var y0 = Math.round(baseY - arr[x]), y1 = Math.min(Math.round(baseY) + 40, surfY + 4);
        if (y1 <= y0) continue;
        bx.fillStyle = top; bx.fillRect(x, y0, 1, 2);
        bx.fillStyle = body; bx.fillRect(x, y0 + 2, 1, y1 - y0 - 2);
      }
    }
    L.capa('mundo', 20, function (bx, camI) {
      var surfY = SURF - camI; if (surfY <= 0) return;
      var g = bx.createLinearGradient(0, -camI * 0.1, 0, surfY);
      g.addColorStop(0, cfg.cielo[0]); g.addColorStop(0.55, cfg.cielo[1]); g.addColorStop(1, cfg.cielo[2]);
      bx.fillStyle = g; bx.fillRect(0, 0, W, surfY + 2);
      var sunY = Math.round(cfg.sol.y - camI * f(L, cfg.sol.factor));
      for (var y = -11; y <= 11; y++) for (var xx = -11; xx <= 11; xx++) {
        var d = Math.hypot(xx, y);
        if (d <= 11) { bx.fillStyle = d > 9 ? '#FFE9A8' : '#FFF6D6'; bx.fillRect(cfg.sol.x + xx, sunY + y, 1, 1); }
      }
      var fc = f(L, 0.15);
      nubes.forEach(function (c) {
        var x = ((c.x + L.time * c.sp) % (W + 120)) - 60, yy = Math.round(c.y - camI * fc);
        [[0, 0, 1], [c.w * 0.3, -7, 0.8], [c.w * 0.6, -3, 0.9]].forEach(function (q) {
          var rw = c.w * 0.4 * q[2], rh = 7 * q[2];
          for (var j = -rh; j <= rh; j++) {
            var hw = Math.sqrt(Math.max(0, 1 - (j * j) / (rh * rh))) * rw;
            bx.fillStyle = j > rh * 0.35 ? '#DCEAFF' : '#FFFFFF';
            bx.fillRect(Math.round(x + q[0] - hw), Math.round(yy + q[1] + j), Math.round(hw * 2), 1);
          }
        });
      });
      perfil(bx, camI, montes, 0.35, L.opts.depth ? '#D3DCF7' : '#8E9CC8', L.opts.depth ? '#A6B4E4' : '#6E7BA6', surfY);
      perfil(bx, camI, colinas, 0.62, '#86C49A', '#4E8A6E', surfY);
    });
  };

  /* Niebla: bandas translucidas que derivan despacio a 0,55 y un velo que
     se espesa con la profundidad. Separa lo lejano de la pared. */
  C.niebla = function (L, cfg) {
    var W = L.W, H = L.H, r = M.rng(cfg.semilla || 21);
    var bandas = Array.from({ length: cfg.bandas || 5 }, function () {
      return { y: cfg.desde + r() * (cfg.hasta - cfg.desde), h: 10 + r() * 16, sp: 2 + r() * 3, ph: r() * W };
    });
    L.capa('mundo', 25, function (bx, camI) {
      if (!L.opts.depth) return;
      var k = 0.55;
      bandas.forEach(function (b) {
        var y = Math.round(b.y - camI * k - 120 * (1 - k)); if (y < -b.h || y > H + b.h) return;
        var x0 = ((b.ph + L.time * b.sp) % (W + 200)) - 200;
        for (var j = 0; j < b.h; j++) {
          var a = cfg.alfa * Math.sin(Math.PI * j / b.h);
          bx.fillStyle = 'rgba(' + cfg.color + ',' + a.toFixed(3) + ')';
          bx.fillRect(Math.round(x0), y + j, 200 + W, 1);
        }
      });
      // Velo de profundidad: mas denso cuanto mas abajo mira la camara.
      var prof = M.clamp((camI + H / 2 - cfg.desde) / Math.max(1, cfg.hasta - cfg.desde), 0, 1);
      if (prof > 0) {
        bx.fillStyle = 'rgba(' + cfg.color + ',' + (cfg.velo * prof).toFixed(3) + ')';
        bx.fillRect(0, Math.max(0, cfg.desde - camI), W, H + 2);
      }
    });
  };

  /* Una imagen del tamano del mundo que se mueve con la camara (pared,
     terreno, props). */
  C.imagen = function (L, orden, img) {
    L.capa('mundo', orden, function (bx, camI) { bx.drawImage(img, 0, -camI); });
  };

  /* Primer plano oscuro en los bordes, a 1,25: se mueve mas rapido que la
     camara y da profundidad. */
  C.primerPlano = function (L, cfg) {
    var izq = [], der = [], alto = L.altoMundo + 200;
    for (var y = 0; y < alto; y++) {
      izq[y] = Math.max(0, 16 + Math.sin(y * 0.03) * 14 + Math.sin(y * 0.11) * 5);
      der[y] = Math.max(0, 14 + Math.sin(y * 0.025 + 2) * 13 + Math.sin(y * 0.13) * 5);
    }
    L.capa('mundo', 80, function (bx, camI) {
      if (!L.opts.depth) return;
      var k = 1.25, off = camI * k - 140 * (k - 1);
      bx.fillStyle = cfg.color || '#0C0812';
      for (var sy = 0; sy < L.H + 2; sy++) {
        var wy = Math.round(sy + off); if (wy < cfg.desde || wy >= izq.length) continue;
        bx.fillRect(0, sy, Math.round(izq[wy]), 1);
        bx.fillRect(L.W - Math.round(der[wy]), sy, Math.round(der[wy]), 1);
      }
    });
  };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
