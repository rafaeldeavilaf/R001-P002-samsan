/* ============================================================
   SAMSAN — MUNDO / PARTICULAS.JS
   Particulas en subpixel con un pool fijo (nunca crece): polvo en
   la luz, chispas de antorchas, esporas, destellos al acertar y
   polvo al frenar. Y la gema que vuela al contador.

   Con opts.particles apagado (movimiento reducido o gobernador),
   no se emite nada y las vivas se retiran; los destellos de acierto
   y la gema que vuela siguen, porque confirman lo que paso.
   ============================================================ */
(function (M) {
  'use strict';

  M.crearParticulas = function (L, cfg) {
    cfg = cfg || {};
    var MAX = cfg.max || 320;
    var pool = [], vivas = 0, voladoras = [];
    for (var i = 0; i < MAX; i++) pool.push({ vivo: false });
    var pr = M.rng(cfg.semilla || 7);

    var P = {
      max: MAX,
      vivas: function () { return vivas; },
      /* `esencial`: se dibuja aunque las particulas esten apagadas. */
      emitir: function (o) {
        if (!L.opts.particles && !o.esencial) return false;
        for (var i = 0; i < MAX; i++) {
          if (pool[i].vivo) continue;
          var p = pool[i];
          p.vivo = true; p.x = o.x; p.y = o.y; p.vx = o.vx || 0; p.vy = o.vy || 0; p.g = o.g || 0;
          p.life = 0; p.max = o.max || 1; p.c = o.c || '255,255,255'; p.size = o.size || 1;
          p.glow = !!o.glow; p.fade = o.fade || 0; p.twinkle = o.twinkle == null ? null : o.twinkle;
          p.esencial = !!o.esencial;
          vivas++;
          return true;
        }
        return false;     // pool lleno: se descarta, nunca se reserva mas
      },
      /* Destellos al acertar. */
      estallido: function (x, y) {
        var cols = ['255,211,77', '127,227,240', '255,255,255', '240,139,234'];
        for (var i = 0; i < 46; i++) {
          var a = pr() * Math.PI * 2, v = 40 + pr() * 110;
          P.emitir({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 120, max: 0.7 + pr() * 0.6,
            c: cols[i % 4], size: pr() < 0.3 ? 2 : 1, glow: true, esencial: true });
        }
      },
      /* Polvo al frenar. */
      polvo: function (x, y) {
        for (var i = 0; i < 7; i++) P.emitir({ x: x + (pr() - 0.5) * 10, y: y, vx: (pr() - 0.5) * 20, vy: -6 - pr() * 10,
          max: 0.5 + pr() * 0.4, c: '201,179,154', size: 2, fade: 0.55 });
      },
      /* Emisores ambientales que declara el bioma: fn(dt, P, rnd). */
      ambientes: [],
      /* La gema vuela del mundo al contador (un elemento del HUD). */
      gemaVuela: function (xMundo, yMundo, destino, alLlegar) {
        var hr = destino.getBoundingClientRect(), vr = L.canvas.getBoundingClientRect();
        /* Termina en el icono del contador (en px del lienzo). */
        voladoras.push({ t: 0, x0: xMundo * L.s, y0: (yMundo - L.cam.y) * L.s,
          tx: (hr.left - vr.left + Math.min(28, hr.width / 3)) * L.dpr, ty: (hr.top - vr.top + hr.height / 2) * L.dpr, fin: alLlegar });
      },
      volando: function () { return voladoras.length; }
    };

    L.alActualizar(function (dt) {
      if (L.opts.particles) P.ambientes.forEach(function (fn) { fn(dt, P, pr); });
      for (var i = 0; i < MAX; i++) {
        var p = pool[i];
        if (!p.vivo) continue;
        p.life += dt;
        if (p.life > p.max || (!L.opts.particles && !p.esencial)) { p.vivo = false; vivas--; continue; }
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      }
      for (var j = voladoras.length - 1; j >= 0; j--) {
        var f = voladoras[j]; f.t += dt / 0.75;
        if (f.t >= 1) { voladoras.splice(j, 1); if (f.fin) f.fin(); }
      }
    });

    L.capa('alta', 30, function (ctx) {
      var s = L.s, cam = L.cam.y, time = L.time;
      ctx.save();
      for (var i = 0; i < MAX; i++) {
        var p = pool[i];
        if (!p.vivo) continue;
        var k = 1 - p.life / p.max;
        var a = p.fade ? p.fade * k : Math.min(1, k * 1.4);
        if (p.twinkle != null) a *= 0.45 + 0.55 * Math.abs(Math.sin(time * 2 + p.twinkle));
        var x = p.x * s, y = (p.y - cam) * s, sz = p.size * s * (p.fade ? (1 + (1 - k) * 1.5) : 1);
        if (p.glow && L.opts.light && L.opts.glow) {
          ctx.globalCompositeOperation = 'lighter';
          var r = sz * 3.2, g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, 'rgba(' + p.c + ',' + (0.45 * a) + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
          ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(' + p.c + ',' + a + ')'; ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
      ctx.restore();
    });

    /* La gema en vuelo va encima de todo, con los instrumentos. */
    var GEMA = [[2, 0, '#1E1426'], [3, 0, '#1E1426'], [4, 0, '#1E1426'], [1, 1, '#7FE3F0'], [2, 1, '#E8FEFF'], [3, 1, '#7FE3F0'], [4, 1, '#7FE3F0'], [5, 1, '#1E1426'],
      [0, 2, '#2F9BB8'], [1, 2, '#2F9BB8'], [2, 2, '#7FE3F0'], [3, 2, '#2F9BB8'], [4, 2, '#2F9BB8'], [5, 2, '#2F9BB8'], [6, 2, '#1D4E6B'],
      [1, 3, '#2F9BB8'], [2, 3, '#2F9BB8'], [3, 3, '#1D4E6B'], [4, 3, '#1D4E6B'], [5, 3, '#1D4E6B'], [2, 4, '#1D4E6B'], [3, 4, '#1D4E6B'], [4, 4, '#1D4E6B'], [3, 5, '#1D4E6B']];
    L.capa('alta', 90, function (ctx) {
      var s = L.s, dpr = L.dpr;
      voladoras.forEach(function (f) {
        var t = f.t, e = 1 - Math.pow(1 - t, 3);
        // El arco no sale del lienzo: la gema se ve todo el viaje.
        var cx = (f.x0 + f.tx) / 2, cy = Math.max(24 * dpr, Math.min(f.y0, f.ty) - 120 * dpr);
        var x = (1 - e) * (1 - e) * f.x0 + 2 * (1 - e) * e * cx + e * e * f.tx;
        var y = (1 - e) * (1 - e) * f.y0 + 2 * (1 - e) * e * cy + e * e * f.ty;
        var z = Math.max(2, s * 1.4) * (1 + Math.sin(t * Math.PI) * 0.6);
        ctx.save();
        if (L.opts.light && L.opts.glow) {
          ctx.globalCompositeOperation = 'lighter';
          var gr = ctx.createRadialGradient(x, y, 0, x, y, z * 9);
          gr.addColorStop(0, 'rgba(127,227,240,0.5)'); gr.addColorStop(1, 'rgba(127,227,240,0)');
          ctx.fillStyle = gr; ctx.fillRect(x - z * 9, y - z * 9, z * 18, z * 18);
        }
        ctx.globalCompositeOperation = 'source-over';
        GEMA.forEach(function (q) { ctx.fillStyle = q[2]; ctx.fillRect(x + (q[0] - 3.5) * z, y + (q[1] - 3) * z, Math.ceil(z), Math.ceil(z)); });
        ctx.restore();
      });
    });
    return P;
  };
})(window.SAMSAN_MUNDO = window.SAMSAN_MUNDO || {});
