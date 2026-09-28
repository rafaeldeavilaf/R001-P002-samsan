#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRUEBA DEL PIPELINE — procesar.py y tiles.py sobre PNG sintéticos.

No necesita arte real: fabrica una imagen de prueba en una carpeta temporal y
comprueba que la salida cumpla las reglas de docs/direccion-grafica.md.
Sale con código 0 si todo pasa.
"""
import os, sys, tempfile, random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image  # noqa: E402
from paletas import Paleta, RAMPAS, CONTORNO, BIOMAS  # noqa: E402
import procesar, tiles  # noqa: E402

ok, fallos = 0, []


def check(nombre, cond, detalle=""):
    global ok
    if cond:
        ok += 1
        print("  ok   " + nombre)
    else:
        fallos.append(nombre + (" -> " + str(detalle) if detalle else ""))
        print("  FAIL " + nombre + (" -> " + str(detalle) if detalle else ""))


tmp = tempfile.mkdtemp(prefix="samsan-arte-")

print("\n1. procesar.py: objeto con fondo sólido y colores fuera de paleta")
img = Image.new("RGBA", (40, 40), (250, 250, 250, 255))          # fondo blanco, no transparente
px = img.load()
for y in range(8, 32):
    for x in range(12, 28):
        px[x, y] = (200 + (x % 3) * 7, 90 + y, 40, 255)             # naranja con ruido
ruta = os.path.join(tmp, "objeto.png")
img.save(ruta)
out, info = procesar.procesar(ruta, "caverna")
o = out.load()
W, H = out.size
pal = {c for c, _, _ in Paleta("caverna").colores} | {CONTORNO}
usados = {o[x, y][:3] for y in range(H) for x in range(W) if o[x, y][3]}
check("quita el fondo sólido", info["fondo_quitado"] > 0, info)
check("recorta a la silueta + 1 px de contorno", (W, H) == (18, 26), (W, H))
check("todos los colores están en la paleta del bioma", usados <= pal, usados - pal)
check("alfa binario (0 o 255)", all(o[x, y][3] in (0, 255) for y in range(H) for x in range(W)))
check("contorno de 1 px #1E1426 alrededor",
      all(o[x, 0][:3] == CONTORNO for x in range(1, W - 1) if o[x, 0][3]) and o[W // 2, 0][:3] == CONTORNO)
check("sin contorno doble: la segunda fila no es contorno", o[W // 2, 1][:3] != CONTORNO)
check("bisel: el borde de arriba es más claro que el interior",
      sum(o[W // 2, 1][:3]) > sum(o[W // 2, H // 2][:3]), (o[W // 2, 1], o[W // 2, H // 2]))

print("\n2. procesar.py: un PNG que ya trae contorno oscuro no se duplica")
img2 = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
p2 = img2.load()
for y in range(4, 16):
    for x in range(4, 16):
        borde = x in (4, 15) or y in (4, 15)
        p2[x, y] = (12, 8, 18, 255) if borde else (80, 160, 190, 255)
r2 = os.path.join(tmp, "contorneado.png")
img2.save(r2)
out2, info2 = procesar.procesar(r2, "caverna")
check("detecta el contorno previo", info2["ya_contorneado"], info2)
check("no agrega un segundo contorno (mismo tamaño)", out2.size == (12, 12), out2.size)
check("el contorno previo pasa a #1E1426", out2.load()[0, 6][:3] == CONTORNO)

print("\n3. procesar.py: la mascota usa la rampa de piel de referencia")
img3 = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
p3 = img3.load()
for y in range(3, 13):
    for x in range(3, 13):
        p3[x, y] = (240, 186, 146, 255)                               # tono piel
r3 = os.path.join(tmp, "cara.png")
img3.save(r3)
out3, _ = procesar.procesar(r3, "mascota")
check("la piel cae en la rampa `piel` (para el intercambio de 12 tonos)",
      out3.load()[6, 6][:3] in RAMPAS["piel"], out3.load()[6, 6])
check("la paleta mascota incluye la rampa de piel", "piel" in BIOMAS["mascota"])

print("\n4. tiles.py: textura gris a hoja de 16 máscaras x 4 variantes")
rnd = random.Random(3)
tex = Image.new("L", (64, 64))
tp = tex.load()
for y in range(64):
    for x in range(64):
        tp[x, y] = int(128 + 60 * ((x * 7 + y * 3) % 17 - 8) / 8 + rnd.randint(-20, 20))
rt = os.path.join(tmp, "textura.png")
tex.save(rt)
hoja = tiles.generar(rt, "roca")
h = hoja.load()
R = RAMPAS["roca"]
check("la hoja mide 512 x 128", hoja.size == (512, 128), hoja.size)
cell = lambda v, m, x, y: h[m * 32 + x, v * 32 + y]
check("todos los píxeles opacos están en la rampa",
      all(h[x, y][:3] in R for y in range(128) for x in range(512) if h[x, y][3]))
check("máscara 0 (rodeado): tile lleno", all(cell(0, 0, x, y)[3] == 255 for y in range(32) for x in range(32)))
check("máscara 1 (arriba expuesto): fila superior con luz", all(cell(1, 1, x, 0)[:3] == R[-1] for x in range(32)))
check("máscara 1: segunda fila con el segundo tono de luz o borde", all(cell(1, 1, x, 1)[:3] in (R[-2], R[-1], R[0]) for x in range(32)))
check("máscara 4 (abajo expuesto): fila inferior oscura", all(cell(2, 4, x, 31)[:3] == R[0] for x in range(32)))
check("máscara 9 (arriba e izquierda): esquina redondeada",
      cell(0, 9, 0, 0)[3] == 0 and cell(0, 9, 3, 0)[3] == 0 and cell(0, 9, 4, 0)[3] == 255 and cell(0, 9, 0, 4)[3] == 255)
# Costura: el borde derecho de la variante 0 continúa en el izquierdo de la variante 1
# exactamente como en la textura original (no se inventan bordes en lados no expuestos).
paso = tiles.rampa_por_cuantiles([tp[x, y] for y in range(64) for x in range(64)], R)
check("sin bordes en lados no expuestos: el interior es la textura tal cual",
      all(cell(0, 0, x, y)[:3] == R[paso(tp[x, y])] for y in range(32) for x in range(32)))
check("dos tiles vecinos rodeados continúan la textura al píxel",
      all(cell(0, 0, 31, y)[:3] == R[paso(tp[31, y])] and cell(1, 0, 0, y)[:3] == R[paso(tp[32, y])] for y in range(32)))

print("\nRESULTADO\n%d comprobaciones pasadas, %d fallidas." % (ok, len(fallos)))
if fallos:
    print("Fallos:\n  - " + "\n  - ".join(fallos))
    sys.exit(1)
