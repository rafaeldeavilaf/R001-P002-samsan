#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PANEL — mide en un navegador real lo que el panel de expertos y gamers
evalua de La Mina (docs/decisiones-vigentes.md, rediseno del 28 sep 2026).

Juega los cinco niveles una vez, en 1366 x 768 y 390 x 844, con la solucion
declarada y como lo haria un nino (toques en las palancas, las opciones y
el teclado en pantalla). Por item mide:
  - toques hasta responder (F1) y palabras a leer (F2);
  - si el boton que importa y NEXT se ven sin scroll (F8-F10);
  - si el mundo cambia al tocar una palanca en los concretos (C1, C3): se
    compara el lienzo antes y despues, contra el ruido de dos capturas sin
    accion;
  - errores de JavaScript.
Deja el detalle en _local/capturas/panel-la-mina.json y un resumen en pantalla.
No es una prueba de CI: es la evidencia del panel. Requiere build.py antes.

Uso:  python3 tools/panel_la_mina.py
"""
import functools, http.server, io, json, os, statistics, sys, threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    from PIL import Image, ImageChops
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("Faltan dependencias: pip install -r requirements.txt && python -m playwright install chromium")

SALIDA = os.path.join(ROOT, "_local", "capturas")
ACT = "#qScene .scene-slot:not(.is-out)"
MENOS = "−"
SERV = """(li) => { const lv = QUIZ_DATA.levels[li]; const st = document.getElementById('qStem').textContent.trim();
  for (const f of lv.questions) for (const v of f.variants) if (v.stem.replace(/<[^>]*>/g,'') === st) return {id: f.id, sello: f.sello, mech: f.mech, v}; return null; }"""
VISTA = """(s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
  return r.bottom <= innerHeight && r.top >= 0; }"""


class _Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def num(n):
    return (MENOS + str(-n)) if n < 0 else str(n)


def lienzo(pg):
    return Image.open(io.BytesIO(pg.locator(ACT + " canvas").screenshot())).convert("RGB")


def cambio(a, b):
    d = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 40 else 0)
    return sum(1 for v in d.getdata() if v)


def clic(pg, sel):
    pg.locator(sel).first.click()
    return 1


def responder(pg, s, medir):
    """Devuelve (toques, cambio_en_el_mundo o None)."""
    v, toques, mundo = s["v"], 0, None
    if v.get("rule") and v["rule"]["tipo"] == "ecuacion":
        R = v["rule"]
        if R["sello"] == "pictorico":
            b = pg.locator(ACT + " .linea__opcion")
            for i in range(b.count()):
                if b.nth(i).inner_text().split("\n")[-1].strip() == v["options"][v["answer"]]:
                    b.nth(i).click()
                    return 1, None
        for t in R["esperada"]:
            fichas = pg.locator(ACT + " .ecuacion__fichas .forge__piece:not([disabled])")
            for i in range(fichas.count()):
                if fichas.nth(i).inner_text().strip() == t:
                    fichas.nth(i).click()
                    toques += 1
                    break
        return toques + clic(pg, ACT + " .linea__ok"), None
    x = v["solucion"]
    if v.get("fill"):
        F = v["fill"]
        if F["sello"] == "concreto":
            if medir:
                a = lienzo(pg); ruido = cambio(a, lienzo(pg))
                pg.locator(ACT + ' [data-d="10"]').click(); pg.wait_for_timeout(700)
                mundo = max(0, cambio(a, lienzo(pg)) - ruido)
                pg.locator(ACT + ' [data-d="-10"]').click(); pg.wait_for_timeout(200)
            for p, n in ((100, x // 100), (10, x % 100 // 10), (1, x % 10)):
                for _ in range(n):
                    toques += clic(pg, ACT + ' [data-d="%d"]' % p)
            return toques + clic(pg, ACT + " .linea__ok"), mundo
    else:
        L = v["line"]
        if L["modo"] == "concreto":
            if L.get("bandera"):
                toques += clic(pg, ACT + " .linea__ok")
            if medir:
                a = lienzo(pg); ruido = cambio(a, lienzo(pg))
                pg.locator(ACT + ' [data-d="1"]').click(); pg.wait_for_timeout(700)
                mundo = max(0, cambio(a, lienzo(pg)) - ruido)
                pg.locator(ACT + ' [data-d="-1"]').click(); pg.wait_for_timeout(200)
            act = lambda: int(pg.locator(ACT + " .linea__ahora").inner_text().replace(MENOS, "-").split(":")[1].split()[0])
            g = 0
            while act() != x and g < 80:
                d = x - act()
                toques += clic(pg, ACT + ' [data-d="%s%s"]' % ("" if d > 0 else "-", "10" if abs(d) >= 10 else "1"))
                g += 1
            return toques + clic(pg, ACT + " .linea__ok"), mundo
    sello = v["fill"]["sello"] if v.get("fill") else v["line"]["modo"]
    if sello == "pictorico":
        cambio_ = v.get("line") and v["line"]["faltante"] == "cambio"
        t = ("+" + str(x)) if (cambio_ and x > 0) else num(x)
        b = pg.locator(ACT + " .linea__opcion")
        for i in range(b.count()):
            if b.nth(i).inner_text().split("\n")[-1].strip() == t:
                b.nth(i).click()
                return 1, None
        return 0, None
    for ch in str(x):
        toques += clic(pg, ACT + ' .linea__tecla[data-k="%s"]' % ch)
    return toques + clic(pg, ACT + " .linea__teclado .linea__ok"), None


def main():
    os.makedirs(SALIDA, exist_ok=True)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(_Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = "http://127.0.0.1:%d/_local/maths-y6-la-mina.html" % srv.server_address[1]
    res = {}
    with sync_playwright() as p:
        try:
            nav = p.chromium.launch()
        except Exception:
            nav = p.chromium.launch(channel="msedge")
        for perfil, (w, h) in (("pc", (1366, 768)), ("celular", (390, 844))):
            ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, reduced_motion="reduce",
                                  is_mobile=perfil == "celular", has_touch=perfil == "celular")
            ctx.add_init_script("Math.random = () => 0; localStorage.setItem('samsan:hero', JSON.stringify({v:1,body:'a',alias:'',chosen:true}));"
                                "localStorage.setItem('samsan:maths-y6-la-mina', JSON.stringify({version:1,levels:{},totalXP:0,gems:0,music:false,sound:false}));")
            pg = ctx.new_page()
            errores = []
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.goto(url)
            pg.wait_for_timeout(500)
            items = []
            for li in range(5):
                pg.locator("#levelList .level-card").nth(li).click()
                pg.locator("#briefGo").click()
                pg.wait_for_timeout(700)
                for k in range(12):
                    s = pg.evaluate(SERV, li)
                    v = s["v"]
                    sello = v["fill"]["sello"] if v.get("fill") else v["rule"]["sello"] if v.get("rule") else v["line"]["modo"]
                    it = {"nivel": li + 1, "id": s["id"], "mech": s["mech"], "sello": sello,
                          "palabras": len((v["stem"] + " " + (v.get("sub") or "")).split()),
                          "check_visible": pg.evaluate(VISTA, ACT + (" .linea__opcion" if sello == "pictorico" else " .linea__ok"))}
                    it["toques"], it["mundo"] = responder(pg, s, medir=sello == "concreto" and s["mech"] in ("line", "fill"))
                    pg.wait_for_timeout(300)
                    it["bien"] = "feedback--good" in (pg.locator("#qFeed").get_attribute("class") or "")
                    it["next_visible"] = pg.evaluate(VISTA, "#btnNext")
                    items.append(it)
                    pg.locator("#btnNext").click()
                    pg.wait_for_timeout(350)
                    if pg.locator("#scrWin").is_visible():
                        break
                pg.locator("#winMap").click()
                pg.wait_for_timeout(300)
            res[perfil] = {"items": items, "errores": errores}
            ctx.close()
        nav.close()
    srv.shutdown()
    json.dump(res, open(os.path.join(SALIDA, "panel-la-mina.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    for perfil, r in res.items():
        its = r["items"]
        conc = [i["toques"] for i in its if i["sello"] in ("concreto", "entrada", "repaso", "jefe") and i["mech"] in ("line", "fill")]
        mundo = [i for i in its if i["mundo"] is not None]
        print("\n== %s: %d items, %d aceptados con la solucion, errores JS: %d" % (perfil, len(its), sum(i["bien"] for i in its), len(r["errores"])))
        print("  F1 toques por item concreto (line y fill): mediana %s, maximo %s" % (statistics.median(conc) if conc else "-", max(conc) if conc else "-"))
        print("  F2 palabras por item: mediana %s, maximo %s" % (statistics.median(i["palabras"] for i in its), max(i["palabras"] for i in its)))
        print("  F8-F10 boton y NEXT visibles sin scroll: %d/%d y %d/%d" % (sum(1 for i in its if i["check_visible"]), len(its),
                                                                        sum(1 for i in its if i["next_visible"]), len(its)))
        print("  C1/C3 el mundo cambia al tocar una palanca: %d/%d concretos medidos (pixeles: %s)" % (
            sum(1 for i in mundo if i["mundo"] > 50), len(mundo), [i["mundo"] for i in mundo]))
        verbos = sorted(set((i["mech"], i["sello"]) for i in its))
        print("  F12 interacciones distintas: %d %s" % (len(verbos), verbos))
    print("\nDetalle en %s" % os.path.relpath(os.path.join(SALIDA, "panel-la-mina.json"), ROOT))


if __name__ == "__main__":
    main()
