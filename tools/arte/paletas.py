#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Paletas de SAMSAN para el pipeline de arte.

Fuente única: assets/paletas.json (la misma que usa el juego). Aquí solo se
lee y se ofrecen utilidades: color más cercano dentro de la paleta de un
bioma y un paso más claro u oscuro dentro de la rampa de un color.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DATA = json.load(open(os.path.join(ROOT, "assets", "paletas.json"), encoding="utf-8"))


def hex2rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


CONTORNO = hex2rgb(_DATA["contorno"])
RAMPAS = {k: [hex2rgb(c) for c in v] for k, v in _DATA["rampas"].items()}
BIOMAS = dict(_DATA["biomas"])


def luminancia(rgb):
    """Luminancia relativa WCAG (0..1)."""
    def lin(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = luminancia(a) + 0.05, luminancia(b) + 0.05
    return max(la, lb) / min(la, lb)


class Paleta:
    """Colores permitidos de un bioma: cada color sabe a qué rampa y paso pertenece."""

    def __init__(self, bioma):
        if bioma not in BIOMAS:
            raise SystemExit("Paleta desconocida '%s'. Opciones: %s" % (bioma, ", ".join(sorted(BIOMAS))))
        self.nombre = bioma
        self.colores = []            # (rgb, rampa, paso)
        for rampa in BIOMAS[bioma]:
            for i, c in enumerate(RAMPAS[rampa]):
                self.colores.append((c, rampa, i))
        self._cache = {}

    @staticmethod
    def _dist(a, b):
        # Distancia "redmean": barata y más cercana a la percepción que la euclídea.
        rm = (a[0] + b[0]) / 2.0
        dr, dg, db = a[0] - b[0], a[1] - b[1], a[2] - b[2]
        return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db

    def cercano(self, rgb):
        rgb = tuple(rgb[:3])
        hit = self._cache.get(rgb)
        if hit is None:
            hit = min(self.colores, key=lambda c: self._dist(rgb, c[0]))
            self._cache[rgb] = hit
        return hit

    def paso(self, rgb, delta):
        """El color `delta` pasos más claro (+) u oscuro (-) en su rampa."""
        for c, rampa, i in self.colores:
            if c == tuple(rgb[:3]):
                r = RAMPAS[rampa]
                return r[max(0, min(len(r) - 1, i + delta))]
        return tuple(rgb[:3])


if __name__ == "__main__":
    for k, v in RAMPAS.items():
        print("%-8s %s" % (k, " ".join("#%02X%02X%02X" % c for c in v)))
