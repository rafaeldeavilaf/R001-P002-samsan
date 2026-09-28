#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRUEBA DE GRISES Y CONTRASTE — docs/direccion-grafica.md §4 y regla 9.

En un navegador real (Playwright, Chromium), en 1366 x 768 y 390 x 844:
  1. Vitrina de la Caverna (_local/vitrina-caverna.html): captura en escala de
     grises y comprueba que fondo (pared), suelo (roca), objeto interactivo
     (explorador) y panel se distinguen por luminancia, no solo por color.
  2. Portada e index/legal: todo texto dentro de un panel cumple contraste AA
     (4,5:1; 3:1 si es texto grande), y el pie también sobre la página.
  3. Mide el tiempo por cuadro durante 2 s en la vitrina y en la portada.
  4. Con movimiento reducido, la portada no anima y la vitrina apaga
     particulas, parallax y cámara suave.

Deja las capturas en _local/capturas/ para revisarlas a ojo.
Requiere haber corrido antes: python3 tools/build.py
"""
import functools, http.server, io, os, socketserver, statistics, sys, threading

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paletas import ROOT, contraste  # noqa: E402

try:
    from PIL import Image
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("Faltan dependencias: pip install -r requirements.txt && python -m playwright install chromium")

TAMANOS = [(1366, 768), (390, 844)]
DIF_GRIS = 18                 # diferencia mínima de luminancia media (0..255) entre capas
MS_MAX = 50                   # un cuadro medio más lento que esto es un fallo (el gobernador ya actúa a 20 ms)
# En Actions no hay GPU: el tiempo por cuadro ahí no representa el computador de
# un niño. Se mide y se informa, pero solo falla en local.
EN_CI = os.environ.get("CI") == "true"
SALIDA = os.path.join(ROOT, "_local", "capturas")

ok, fallos, avisos = 0, [], []


def check(nombre, cond, detalle=""):
    global ok
    if cond:
        ok += 1
        print("  ok   " + nombre)
    else:
        fallos.append(nombre + (" -> " + str(detalle) if detalle else ""))
        print("  FAIL " + nombre + (" -> " + str(detalle) if detalle else ""))


class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def servidor():
    handler = functools.partial(_Silencioso, directory=ROOT)
    srv = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/" % srv.server_address[1]


def navegador(p):
    try:
        return p.chromium.launch()
    except Exception:
        for canal in ("chrome", "msedge"):          # en local, el navegador instalado
            try:
                return p.chromium.launch(channel=canal)
            except Exception:
                pass
        raise SystemExit("No hay Chromium para Playwright: python -m playwright install chromium")


def media_anillo(img, fuera, dentro):
    """Luminancia media del borde entre dos rectángulos (lo que rodea a un objeto)."""
    def suma(r):
        x0, y0 = max(0, int(r["x"])), max(0, int(r["y"]))
        x1, y1 = min(img.width, int(r["x"] + r["w"])), min(img.height, int(r["y"] + r["h"]))
        if x1 <= x0 or y1 <= y0:
            return 0, 0
        b = img.crop((x0, y0, x1, y1)).tobytes()
        return sum(b), len(b)
    so, no = suma(fuera)
    si, ni = suma(dentro)
    return (so - si) / float(no - ni) if no > ni else None


def media_gris(img, r):
    x0, y0 = max(0, int(r["x"])), max(0, int(r["y"]))
    x1, y1 = min(img.width, int(r["x"] + r["w"])), min(img.height, int(r["y"] + r["h"]))
    if x1 <= x0 or y1 <= y0:
        return None
    zona = img.crop((x0, y0, x1, y1))
    datos = zona.tobytes()
    return sum(datos) / float(len(datos))


# Contraste de cada texto visible dentro de un contenedor, contra el fondo opaco
# más cercano. Devuelve la lista de fallos.
JS_CONTRASTE = """
(sel) => {
  const rgb = s => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    const p = m[1].split(',').map(parseFloat); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const v = c.map(x => { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const fondo = el => { for (let e = el; e; e = e.parentElement) { const b = rgb(getComputedStyle(e).backgroundColor);
      if (b && b.a >= 0.99) return b.c; } return [255, 255, 255]; };
  const out = [];
  document.querySelectorAll(sel).forEach(root => {
    root.querySelectorAll('*').forEach(el => {
      const txt = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (!txt) return;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return;
      const f = rgb(cs.color).c, b = fondo(el);
      const la = lum(f) + 0.05, lb = lum(b) + 0.05, ratio = Math.max(la, lb) / Math.min(la, lb);
      const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
      out.push({ t: txt.slice(0, 40), ratio: Math.round(ratio * 100) / 100, min: grande ? 3 : 4.5 });
    });
  });
  return out;
}
"""

JS_CUADROS = """
() => new Promise(ok => { const d = []; let t0 = performance.now(), fin = t0 + 2000;
  function f(t) { d.push(t - t0); t0 = t; if (t < fin) requestAnimationFrame(f); else ok(d.slice(3)); }
  requestAnimationFrame(f); })
"""


def main():
    os.makedirs(SALIDA, exist_ok=True)
    for f in ("index.html", "legal.html", os.path.join("_local", "vitrina-caverna.html")):
        if not os.path.exists(os.path.join(ROOT, f)):
            sys.exit("Falta %s: corre antes python3 tools/build.py" % f)
    srv, base = servidor()
    try:
        with sync_playwright() as p:
            nav = navegador(p)
            for (w, h) in TAMANOS:
                print("\n== %d x %d" % (w, h))
                ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
                pg = ctx.new_page()
                errores = []
                pg.on("pageerror", lambda e: errores.append(str(e)))

                # 1. Vitrina: grises por capas
                pg.goto(base + "_local/vitrina-caverna.html")
                pg.wait_for_timeout(1500)
                pg.evaluate("() => { window.__samsan.L.opts.particles = false; }")   # capturas estables
                pg.wait_for_timeout(300)
                reg = pg.evaluate("() => window.__samsan.regiones()")
                png = pg.screenshot()
                gris = Image.open(io.BytesIO(png)).convert("L")
                gris.save(os.path.join(SALIDA, "grises-vitrina-%dx%d.png" % (w, h)))
                anillo = reg.pop("anillo", None)
                medias = {k: media_gris(gris, r) for k, r in reg.items()}
                print("       luminancia media: " + ", ".join("%s %.0f" % (k, v or -1) for k, v in medias.items()))
                visibles = {k: v for k, v in medias.items() if v is not None}
                check("vitrina: las cuatro capas están en pantalla", len(visibles) == 4, medias)
                # Dos planos (pared/roca) y panel contra todo, por media. El objeto
                # interactivo se mide contra lo que lo rodea en pantalla: así lee
                # el niño un personaje (docs/direccion-grafica.md §4).
                pares = [("fondo", "suelo"), ("fondo", "panel"), ("suelo", "panel"), ("objeto", "panel")]
                if anillo and medias.get("objeto") is not None:
                    alrededor = media_anillo(gris, anillo, reg["objeto"])
                    print("       objeto %.0f contra su entorno %.0f" % (medias["objeto"], alrededor))
                    check("vitrina: en grises el explorador se distingue de lo que lo rodea",
                          abs(medias["objeto"] - alrededor) >= DIF_GRIS, "%.0f vs %.0f" % (medias["objeto"], alrededor))
                for a, b in pares:
                    if a in visibles and b in visibles:
                        check("vitrina: en grises se distinguen %s y %s" % (a, b), abs(visibles[a] - visibles[b]) >= DIF_GRIS,
                              "%.0f vs %.0f" % (visibles[a], visibles[b]))
                cuadros = pg.evaluate("() => { window.__samsan.L.opts.particles = true; return null; }") or pg.evaluate(JS_CUADROS)
                med = statistics.median(cuadros) if cuadros else 0
                print("       cuadro medio en la vitrina: %.1f ms (p95 %.1f ms)" % (med, sorted(cuadros)[int(len(cuadros) * 0.95)] if cuadros else 0))
                check("vitrina: el cuadro medio baja de %d ms" % MS_MAX, med < MS_MAX or EN_CI, "%.1f ms" % med)
                if med > 20:
                    avisos.append("%dx%d: cuadro medio %.1f ms en la vitrina (el gobernador degrada a partir de 20 ms)" % (w, h, med))
                fallos_c = [c for c in pg.evaluate(JS_CONTRASTE, ".k-panel") if c["ratio"] < c["min"]]
                check("vitrina: todo texto de los paneles cumple AA", not fallos_c, fallos_c[:3])

                # 2. Portada y legal: contraste
                for pagina in ("index.html", "legal.html"):
                    pg.goto(base + pagina)
                    pg.wait_for_timeout(1200)
                    pg.screenshot(path=os.path.join(SALIDA, "%s-%dx%d.png" % (pagina[:-5], w, h)))
                    res = pg.evaluate(JS_CONTRASTE, ".k-panel, .k-pie, header")
                    malos = [c for c in res if c["ratio"] < c["min"]]
                    check("%s: todo texto cumple AA (%d textos)" % (pagina, len(res)), res and not malos, malos[:3])
                    ancho = pg.evaluate("() => document.documentElement.scrollWidth")
                    check("%s: sin desborde horizontal" % pagina, ancho <= w, ancho)
                cuadros = pg.goto(base + "index.html") and pg.evaluate(JS_CUADROS)
                med = statistics.median(cuadros) if cuadros else 0
                print("       cuadro medio en la portada: %.1f ms" % med)
                check("portada: el cuadro medio baja de %d ms" % MS_MAX, med < MS_MAX or EN_CI, "%.1f ms" % med)
                check("sin errores de JavaScript", not errores, errores[:2])
                ctx.close()

            # 3. Movimiento reducido
            print("\n== movimiento reducido")
            ctx = nav.new_context(viewport={"width": 1366, "height": 768}, reduced_motion="reduce")
            pg = ctx.new_page()
            pg.goto(base + "index.html")
            pg.wait_for_timeout(800)
            check("portada: con movimiento reducido no anima", pg.evaluate("() => window.__samsanPortada.L.corriendo") is False)
            pg.goto(base + "_local/vitrina-caverna.html")
            pg.wait_for_timeout(800)
            o = pg.evaluate("() => window.__samsan.L.opts")
            check("vitrina: sin partículas, parallax ni cámara suave", not o["particles"] and not o["depth"] and not o["smooth"], o)
            ctx.close()
            nav.close()
    finally:
        srv.shutdown()

    for a in avisos:
        print("  AVISO " + a)
    print("\nRESULTADO\n%d comprobaciones pasadas, %d fallidas. Capturas en %s" % (ok, len(fallos), os.path.relpath(SALIDA, ROOT)))
    if fallos:
        print("Fallos:\n  - " + "\n  - ".join(fallos))
        sys.exit(1)


if __name__ == "__main__":
    main()
