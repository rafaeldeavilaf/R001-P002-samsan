#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ICONOS_TWEMOJI — incrusta los dibujos de Twemoji que usa la aldea de Pip
(propuesta Y2 English v3, 18 nov 2026) en guias/comun/iconos.js.

Por que incrustados: los emoji del sistema cambian entre iPhone y Android;
con el SVG dentro de la pagina el dibujo es el mismo en todo telefono y no
se pide nada a terceros en tiempo de juego (regla 2 del repo).

Licencia de los graficos: Twemoji, CC BY 4.0 (Twitter, Inc. y otros
colaboradores; mantenido en github.com/jdecked/twemoji). El credito va en
legal.html y docs/licencias.md.

Fuente: una carpeta con los SVG de Twemoji nombrados por su codigo
(paquete npm @twemoji/svg o assets/svg de jdecked/twemoji). No se versiona:

    npm pack @twemoji/svg && tar xzf twemoji-svg-*.tgz   # en una carpeta aparte
    python3 tools/gen/iconos_twemoji.py --fuente <carpeta>/package

Valida con assert que cada icono exista, no traiga ids ni <defs> (chocarian
al repetirse en la pagina) y quede bajo el tope de peso.
"""
import argparse, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(ROOT, "guias", "comun", "iconos.js")
TOPE_KB = 260

# nombre -> codigo de Twemoji. El banco de palabras de cada mundo nombra sus
# dibujos con estas claves. Lista provisional del boceto de la calle de long i
# y la galeria del kit; el banco definitivo se revisa en el paso 2.
ICONOS = {
    # long i, i_e
    "kite": "1fa81", "bike": "1f6b2", "dice": "1f3b2", "ice": "1f9ca", "slide": "1f6dd",
    "rice": "1f35a", "mice": "1f401", "nine": "39-20e3", "smile": "1f60a",
    # long i, igh
    "night": "1f319", "light": "1f4a1", "flight": "2708", "lightning": "26a1", "right": "27a1", "midnight": "1f55b",
    # long i, y al final
    "fly": "1fab0", "spy": "1f575", "why": "2753", "butterfly": "1f98b", "cry": "1f622",
    # long i, ie
    "pie": "1f967", "tie": "1f454", "fries": "1f35f", "fried": "1f373",
    # ejemplos de la galeria de escenarios
    "frog": "1f438", "star": "2b50", "flag": "1f6a9",
    "grandma": "1f475", "banana": "1f34c", "beach": "1f3d6", "calendar": "1f4c5",
    "monkey": "1f412", "fish": "1f41f", "bee": "1f41d",
    "bread": "1f35e", "book": "1f4d6", "doctor": "1f9d1-200d-2695-fe0f", "chick": "1f425", "caterpillar": "1f41b",
}

SVG_RE = re.compile(r"^\s*<svg[^>]*viewBox=\"0 0 36 36\"[^>]*>(.*)</svg>\s*$", re.S)


def leer(fuente, codigo):
    for nombre in (codigo, codigo.replace("-fe0f", "")):
        ruta = os.path.join(fuente, nombre + ".svg")
        if os.path.exists(ruta):
            return open(ruta, encoding="utf-8").read()
    raise AssertionError("No esta el icono %s en %s" % (codigo, fuente))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fuente", required=True, help="carpeta con los SVG de Twemoji")
    a = ap.parse_args()
    salida = {}
    for clave, codigo in sorted(ICONOS.items()):
        svg = leer(a.fuente, codigo)
        m = SVG_RE.match(svg)
        assert m, "%s (%s): no es un SVG de 36 x 36" % (clave, codigo)
        dentro = m.group(1)
        assert not re.search(r"\bid=|<defs|url\(#|<script|<image|href=", dentro), "%s (%s): trae ids, defs o enlaces" % (clave, codigo)
        salida[clave] = dentro
    cuerpo = json.dumps(salida, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    texto = ("/* ============================================================\n"
             "   ICONOS DE LA ALDEA (generado por tools/gen/iconos_twemoji.py; no se edita a mano)\n"
             "   Graficos: Twemoji, CC BY 4.0, (c) Twitter, Inc. y otros colaboradores.\n"
             "   https://github.com/jdecked/twemoji · https://creativecommons.org/licenses/by/4.0/\n"
             "   Cada valor es el interior de un SVG de 36 x 36 (ALDEA.icono lo envuelve).\n"
             "   ============================================================ */\n"
             "window.ICONOS = " + cuerpo + ";\n")
    kb = len(texto.encode("utf-8")) / 1024
    assert kb < TOPE_KB, "iconos.js pesa %.1f KB (tope %d KB)" % (kb, TOPE_KB)
    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write(texto)
    print("guias/comun/iconos.js: %d iconos, %.1f KB" % (len(salida), kb))


if __name__ == "__main__":
    main()
