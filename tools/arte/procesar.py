#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROCESAR — pasa un PNG generado (PixelLab) al estilo de SAMSAN.

Ningún PNG entra al juego sin pasar por aquí (docs/direccion-grafica.md §7):
  1. quita el fondo (si no viene transparente) y binariza el alfa;
  2. recorta a la silueta;
  3. cuantiza cada píxel a la paleta del bioma (assets/paletas.json);
  4. bisel: borde de arriba un paso más claro, abajo y derecha un paso más oscuro;
  5. contorno de 1 px #1E1426 alrededor de la silueta. Si el PNG ya trae un
     contorno oscuro (el prompt lo pide), se recolorea en vez de duplicarlo.

Uso:
  python3 tools/arte/procesar.py arte/crudo/antorcha.png --bioma caverna --destino temas/maths/img
  python3 tools/arte/procesar.py arte/crudo/mascota-base.png --bioma mascota --destino assets/img --alto 44
"""
import argparse, os, sys
from collections import deque

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paletas import Paleta, CONTORNO, luminancia, ROOT  # noqa: E402

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow: pip install -r requirements.txt")


def quitar_fondo(img, tolerancia=28):
    """Si las esquinas no son transparentes, rellena desde ellas el color de
    fondo (con tolerancia) y lo vuelve transparente."""
    w, h = img.size
    px = img.load()
    esquinas = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    if all(px[x, y][3] < 128 for x, y in esquinas):
        return 0
    fondo = px[0, 0][:3]
    cerca = lambda c: sum((a - b) ** 2 for a, b in zip(c[:3], fondo)) <= tolerancia ** 2 * 3
    vistos, cola, n = set(), deque(e for e in esquinas if cerca(px[e[0], e[1]])), 0
    while cola:
        x, y = cola.popleft()
        if (x, y) in vistos or not (0 <= x < w and 0 <= y < h):
            continue
        vistos.add((x, y))
        if not cerca(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        n += 1
        cola.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return n


def procesar(ruta, bioma="comun", alto=None, bisel=True, contorno=True):
    pal = Paleta(bioma)
    img = Image.open(ruta).convert("RGBA")
    quitado = quitar_fondo(img)
    if alto:
        # Solo reducir con vecino más cercano: el pixel art no se interpola.
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        k = alto / float(img.size[1])
        img = img.resize((max(1, round(img.size[0] * k)), alto), Image.NEAREST)
    w, h = img.size
    src = img.load()
    # Alfa binario y recorte con 1 px de margen para el contorno.
    solido = [[src[x, y][3] >= 128 for x in range(w)] for y in range(h)]
    xs = [x for y in range(h) for x in range(w) if solido[y][x]]
    ys = [y for y in range(h) for x in range(w) if solido[y][x]]
    if not xs:
        raise SystemExit("%s: la imagen quedó vacía después de quitar el fondo." % ruta)
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    W, H = x1 - x0 + 3, y1 - y0 + 3
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    o = out.load()
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if solido[y][x]:
                o[x - x0 + 1, y - y0 + 1] = pal.cercano(src[x, y])[0] + (255,)

    op = lambda x, y: 0 <= x < W and 0 <= y < H and o[x, y][3] == 255
    borde = [(x, y) for y in range(H) for x in range(W)
             if op(x, y) and not (op(x - 1, y) and op(x + 1, y) and op(x, y - 1) and op(x, y + 1))]
    # ¿El borde ya es un contorno oscuro? Entonces se recolorea y no se duplica.
    oscuros = sum(1 for x, y in borde if luminancia(o[x, y][:3]) < 0.035)
    ya_contorneado = borde and oscuros / float(len(borde)) >= 0.6

    if bisel:
        cambios = []
        for x, y in borde:
            c = o[x, y][:3]
            if ya_contorneado and luminancia(c) < 0.035:
                continue
            if not op(x, y - 1):
                cambios.append((x, y, pal.paso(c, +1)))
            elif not op(x, y + 1) or not op(x + 1, y):
                cambios.append((x, y, pal.paso(c, -1)))
        for x, y, c in cambios:
            o[x, y] = c + (255,)
    if contorno:
        if ya_contorneado:
            for x, y in borde:
                if luminancia(o[x, y][:3]) < 0.035:
                    o[x, y] = CONTORNO + (255,)
        else:
            fuera = [(x, y) for y in range(H) for x in range(W)
                     if not op(x, y) and (op(x - 1, y) or op(x + 1, y) or op(x, y - 1) or op(x, y + 1))]
            for x, y in fuera:
                o[x, y] = CONTORNO + (255,)
    # Si no se agregó contorno por fuera, sobra el margen.
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    return out, {"fondo_quitado": quitado, "ya_contorneado": bool(ya_contorneado),
                 "colores": len({c for c in out.getdata() if c[3]}), "tamano": out.size}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("png")
    ap.add_argument("--bioma", default="comun", help="paleta de assets/paletas.json (caverna, mascota, comun)")
    ap.add_argument("--destino", default="assets/img", help="carpeta de salida, relativa al repo")
    ap.add_argument("--nombre", help="nombre del archivo de salida (por defecto, el mismo)")
    ap.add_argument("--alto", type=int, help="alto final en px (reduce con vecino más cercano)")
    ap.add_argument("--sin-bisel", action="store_true")
    ap.add_argument("--sin-contorno", action="store_true")
    a = ap.parse_args()
    out, info = procesar(a.png, a.bioma, a.alto, not a.sin_bisel, not a.sin_contorno)
    dest = os.path.join(ROOT, a.destino)
    os.makedirs(dest, exist_ok=True)
    ruta = os.path.join(dest, a.nombre or os.path.basename(a.png))
    out.save(ruta, optimize=True)
    print("OK -> %s  %dx%d, %d colores, fondo quitado: %d px, contorno previo: %s" % (
        os.path.relpath(ruta, ROOT), info["tamano"][0], info["tamano"][1], info["colores"],
        info["fondo_quitado"], "sí" if info["ya_contorneado"] else "no"))


if __name__ == "__main__":
    main()
