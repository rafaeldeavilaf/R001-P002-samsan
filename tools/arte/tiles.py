#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TILES — convierte una textura gris de 64 x 64 en la hoja de tiles de un bioma.

  1. aplica la rampa del bioma por cuantiles de gris (cambio de tono incluido,
     porque la rampa ya lo trae);
  2. corta la textura en 4 variantes de 32 x 32;
  3. para cada variante genera las 16 combinaciones de lados expuestos
     (bits: 1 arriba, 2 derecha, 4 abajo, 8 izquierda): redondea las esquinas
     expuestas, pone borde de luz arriba (dos líneas) y borde oscuro en los
     otros lados expuestos. Los lados no expuestos quedan sin borde, así que
     dos tiles vecinos continúan la textura sin costura.

Salida: una hoja PNG de 16 columnas (máscara) x 4 filas (variante), 512 x 128.
El bioma la lee en el navegador y pinta cada celda del mapa con su máscara.

Uso:
  python3 tools/arte/tiles.py arte/crudo/textura-roca.png --rampa roca --salida temas/maths/img/tiles-roca.png
"""
import argparse, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paletas import RAMPAS, ROOT  # noqa: E402

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow: pip install -r requirements.txt")

T = 32
ESQUINA = [4, 2, 1, 1]          # píxeles recortados por fila en una esquina expuesta
ARRIBA, DERECHA, ABAJO, IZQUIERDA = 1, 2, 4, 8


def rampa_por_cuantiles(gris, rampa):
    """Asigna a cada gris un paso de la rampa según su cuantil. El paso más
    oscuro queda para grietas (6 %), el más claro para brillos (4 %)."""
    n = len(rampa)
    valores = sorted(gris)
    corte_bajo, corte_alto = 0.06, 0.96
    cortes = [corte_bajo] + [corte_bajo + (corte_alto - corte_bajo) * k / (n - 2) for k in range(1, n - 2)] + [corte_alto]
    umbrales = [valores[min(len(valores) - 1, int(c * len(valores)))] for c in cortes]

    def paso(g):
        for i, u in enumerate(umbrales):
            if g < u:
                return i
        return n - 1
    return paso


def tile_con_mascara(base, mascara, rampa):
    """base: lista 32x32 de índices de rampa. Devuelve lista de (rgb|None)."""
    t = [[base[y][x] for x in range(T)] for y in range(T)]
    vacio = [[False] * T for _ in range(T)]
    exp = lambda b: bool(mascara & b)
    for y in range(4):
        for x in range(ESQUINA[y]):
            if exp(ARRIBA) and exp(IZQUIERDA): vacio[y][x] = True
            if exp(ARRIBA) and exp(DERECHA): vacio[y][T - 1 - x] = True
            if exp(ABAJO) and exp(IZQUIERDA): vacio[T - 1 - y][x] = True
            if exp(ABAJO) and exp(DERECHA): vacio[T - 1 - y][T - 1 - x] = True

    def fuera(x, y):
        """¿El vecino (x, y) es aire? Fuera del tile, depende de si ese lado está expuesto."""
        if 0 <= x < T and 0 <= y < T:
            return vacio[y][x]
        if y < 0: return exp(ARRIBA)
        if y >= T: return exp(ABAJO)
        if x < 0: return exp(IZQUIERDA)
        return exp(DERECHA)

    n = len(rampa)
    luz1, luz2, oscuro = n - 1, n - 2, 0
    idx = [[None if vacio[y][x] else t[y][x] for x in range(T)] for y in range(T)]
    segunda = []
    for y in range(T):
        for x in range(T):
            if vacio[y][x]:
                continue
            if fuera(x, y - 1):
                idx[y][x] = luz1
                if 0 <= y + 1 < T and not vacio[y + 1][x]:
                    segunda.append((x, y + 1))
            elif fuera(x, y + 1) or fuera(x - 1, y) or fuera(x + 1, y):
                idx[y][x] = oscuro
    for x, y in segunda:
        if idx[y][x] not in (luz1, oscuro):
            idx[y][x] = luz2
    return [[None if i is None else rampa[i] for i in fila] for fila in idx]


def generar(textura, rampa_nombre):
    rampa = RAMPAS[rampa_nombre]
    img = Image.open(textura).convert("L")
    if img.size != (64, 64):
        img = img.resize((64, 64), Image.NEAREST)
    g = img.load()
    paso = rampa_por_cuantiles([g[x, y] for y in range(64) for x in range(64)], rampa)
    base = [[paso(g[x, y]) for x in range(64)] for y in range(64)]
    variantes = [[fila[ox:ox + T] for fila in base[oy:oy + T]] for oy in (0, T) for ox in (0, T)]
    hoja = Image.new("RGBA", (16 * T, len(variantes) * T), (0, 0, 0, 0))
    h = hoja.load()
    for v, var in enumerate(variantes):
        for m in range(16):
            celdas = tile_con_mascara(var, m, rampa)
            for y in range(T):
                for x in range(T):
                    if celdas[y][x] is not None:
                        h[m * T + x, v * T + y] = celdas[y][x] + (255,)
    return hoja


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("textura")
    ap.add_argument("--rampa", default="roca")
    ap.add_argument("--salida", required=True, help="PNG de salida, relativo al repo")
    a = ap.parse_args()
    hoja = generar(a.textura, a.rampa)
    ruta = os.path.join(ROOT, a.salida)
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    hoja.save(ruta, optimize=True)
    print("OK -> %s  %dx%d (16 máscaras x 4 variantes)" % (os.path.relpath(ruta, ROOT), hoja.size[0], hoja.size[1]))


if __name__ == "__main__":
    main()
