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
import argparse, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(ROOT, "guias", "comun", "iconos.js")
TOPE_KB = 260

# nombre -> codigo de Twemoji. El banco de cada guia (tools/gen/guia_*.py)
# nombra sus dibujos con estas claves; solo se incrustan los que usa.
ICONOS = {
    "kite": "1fa81", "bike": "1f6b2", "dice": "1f3b2", "ice": "1f9ca", "rice": "1f35a", "nine": "39-20e3", "five": "35-20e3",
    "smile": "1f60a", "slide": "1f6dd", "night": "1f319", "light": "1f4a1", "flight": "2708", "lightning": "26a1", "right": "27a1",
    "midnight": "1f55b", "fly": "1fab0", "spy": "1f575", "why": "2753", "shy": "1f633", "butterfly": "1f98b", "sky": "1f324",
    "pie": "1f967", "tie": "1f454", "fries": "1f35f", "fried": "1f373", "cried": "1f62d",
    "flag": "1f6a9", "frog": "1f438", "star": "2b50", "clock": "23f0", "plane": "2708", "clap": "1f44f", "flower": "1f338",
    "glove": "1f9e4", "globe": "1f30e", "plate": "1f37d", "tree": "1f333", "crab": "1f980", "drum": "1f941", "grapes": "1f347",
    "bread": "1f35e", "train": "1f682", "crown": "1f451", "dragon": "1f409", "truck": "1f69a", "snail": "1f40c", "spoon": "1f944",
    "swim": "1f3ca", "snake": "1f40d", "skate": "26f8", "ski": "1f3bf", "snowman": "26c4", "sponge": "1f9fd", "stop": "1f6d1",
    "grandma": "1f475", "banana": "1f34c", "beach": "1f3d6", "calendar": "1f4c5", "raining": "2614", "firefighter": "1f9d1-200d-1f692",
    "baby": "1f476", "doctor": "1f9d1-200d-2695-fe0f", "teacher": "1f9d1-200d-1f3eb", "farmer": "1f9d1-200d-1f33e", "ball": "26bd",
    "sandwich": "1f96a", "car": "1f697", "book": "1f4d6", "apple": "1f34e", "park": "1f3de", "school": "1f3eb", "home": "1f3e0",
    "morning": "1f305", "birthday": "1f382", "bed": "1f6cf", "hot": "1f975", "tired": "1f634", "happy": "1f604",
    "cold": "1f976", "monkey": "1f412", "fish": "1f41f", "bee": "1f41d", "sloth": "1f9a5", "parrot": "1f99c", "owl": "1f989",
    "squirrel": "1f43f", "dolphin": "1f42c", "octopus": "1f419", "whale": "1f40b", "shark": "1f988", "ladybird": "1f41e",
    "baker": "1f9d1-200d-1f373", "croissant": "1f950", "cookie": "1f36a", "backpack": "1f392", "pencil": "270f", "books": "1f4da",
    "ambulance": "1f691", "bandage": "1fa79", "ill": "1f912", "picnic": "1f9fa", "duck": "1f986",
    "persona": "1f464", "caja": "1f4e6", "lugar": "1f4cd", "pensar": "1f914",
    "hen": "1f414", "tractor": "1f69c", "evening": "1f306", "doughnut": "1f369", "dog": "1f415", "hatching": "1f423", "caterpillar": "1f41b", "egg": "1f95a", "chick": "1f425", "rooster": "1f413",
    "cow": "1f404", "monday": "1f5d3", "hospital": "1f3e5", "seven": "1f556", "summer": "2600", "castle": "1f3f0", "winter": "2744",
    # leccion 3 de Learn with Pip (Why y because): situacion -> razon
    "umbrella": "2602", "rain": "1f327", "windy": "1f32c", "coat": "1f9e5", "sleeping": "1f634", "cheering": "1f64c", "trophy": "1f3c6",
    "sunglasses": "1f60e", "sunny": "2600", "bottle": "1f37c", "snowing": "1f328", "seedling": "1f331", "sunrain": "1f326",
    "yawn": "1f971", "puppy": "1f436", "bone": "1f9b4",
}

# Dibujos propios por codigo (36 x 36, colores planos al estilo Twemoji) para
# lo que no tiene emoji. Son de SAMSAN, no de Twemoji.
PROPIOS = {
    "tadpole": '<path d="M19 18c5-5 9 4 15-2" fill="none" stroke="#3E721D" stroke-width="3.4" stroke-linecap="round"/>'
               '<ellipse cx="12" cy="18" rx="9" ry="7.6" fill="#3E721D"/><ellipse cx="12" cy="21" rx="6" ry="3.4" fill="#77B255"/>'
               '<circle cx="8.6" cy="15.4" r="2.3" fill="#FFF"/><circle cx="8.2" cy="15.6" r="1.2" fill="#292F33"/>',
    "froglet": '<path d="M24 23c5 1 8-1 10-4" fill="none" stroke="#5C913B" stroke-width="2.8" stroke-linecap="round"/>'
               '<path d="M7 26l-4 4h6M23 26l3 4h-6" fill="none" stroke="#3E721D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
               '<ellipse cx="15" cy="22" rx="11" ry="7" fill="#77B255"/><circle cx="9.5" cy="14.5" r="4" fill="#77B255"/><circle cx="19.5" cy="14.5" r="4" fill="#77B255"/>'
               '<circle cx="9.5" cy="14" r="2.2" fill="#FFF"/><circle cx="9.5" cy="14" r="1.1" fill="#292F33"/><circle cx="19.5" cy="14" r="2.2" fill="#FFF"/><circle cx="19.5" cy="14" r="1.1" fill="#292F33"/>'
               '<path d="M11 24q4 3 8 0" fill="none" stroke="#3E721D" stroke-width="1.6" stroke-linecap="round"/>',
    "frogspawn": '<ellipse cx="18" cy="24" rx="16" ry="9" fill="#55ACEE" opacity=".45"/>'
                 + "".join('<circle cx="%s" cy="%s" r="4.6" fill="#E1E8ED" stroke="#99AAB5" stroke-width=".8"/><circle cx="%s" cy="%s" r="1.7" fill="#292F33"/>' % (x, y, x, y)
                           for x, y in ((9, 22), (18, 20), (27, 22), (13, 28), (23, 28), (13, 15), (23, 15), (18, 26))),
    "chrysalis": '<path d="M4 6h28" stroke="#8B5E3C" stroke-width="3" stroke-linecap="round"/><path d="M18 6v4" stroke="#5C913B" stroke-width="2"/>'
                 '<path d="M18 9c-7 3-8 12-5 18 2 4 8 4 10 0 3-6 2-15-5-18z" fill="#A6D388"/>'
                 '<path d="M13 16h10M12.6 21h10.8M14 26h8" fill="none" stroke="#5C913B" stroke-width="1.4" stroke-linecap="round"/>'
                 '<circle cx="15" cy="13" r="1" fill="#FFCC4D"/><circle cx="21" cy="13" r="1" fill="#FFCC4D"/>',
    "leafegg": '<path d="M4 30C6 12 20 4 33 4c0 13-9 27-27 27z" fill="#77B255"/><path d="M7 28C14 20 21 13 30 7" fill="none" stroke="#3E721D" stroke-width="1.6" stroke-linecap="round"/>'
               '<ellipse cx="19" cy="20" rx="3" ry="3.8" fill="#FFF8DC" stroke="#C1A256" stroke-width="1"/>',
    "hummingbird": '<path d="M2 16.5l10 1" stroke="#292F33" stroke-width="1.6" stroke-linecap="round"/>'
                   '<path d="M23 21l10 6-1.6 1.4-9.4-5z" fill="#3E721D"/><path d="M23 22l7 9-2 .6-6.6-7.6z" fill="#5C913B"/>'
                   '<ellipse cx="19" cy="20.5" rx="7.5" ry="5" fill="#5DADEC"/><circle cx="13.5" cy="17" r="4" fill="#3B88C3"/>'
                   '<circle cx="12.6" cy="16.3" r="1.1" fill="#292F33"/><path d="M14 20.6c1.5 1.5 4 1.5 6 .4" fill="none" stroke="#DD2E44" stroke-width="2.2" stroke-linecap="round"/>'
                   '<path d="M18 17c1-7 6-12 13-13-1 6-5 11-13 13z" fill="#BBDDF5"/><path d="M20 15l7-8M19.5 16.2l9.5-5.2" stroke="#88C9F9" stroke-width="1.1" stroke-linecap="round"/>',
    "bumblebee": '<ellipse cx="13" cy="9" rx="6" ry="4.5" fill="#CCD6DD"/><ellipse cx="23" cy="8.5" rx="6" ry="4.5" fill="#CCD6DD"/>'
                 '<ellipse cx="19" cy="21" rx="12" ry="10" fill="#292F33"/>'
                 '<rect x="10" y="14.6" width="19" height="3.6" rx="1.8" fill="#FFCC4D"/><rect x="7.5" y="20" width="23" height="4" rx="2" fill="#FFCC4D"/><rect x="10" y="26" width="18" height="3.2" rx="1.6" fill="#FFCC4D"/>'
                 '<circle cx="7" cy="20" r="5" fill="#292F33"/><circle cx="5.4" cy="18.6" r="1.4" fill="#FFF"/>',
    "nestegg": '<ellipse cx="13.5" cy="13.5" rx="4.8" ry="6.4" fill="#FFFFFF" stroke="#C1A256" stroke-width="1.2"/><ellipse cx="22.5" cy="14" rx="4.8" ry="6.4" fill="#FFF3D6" stroke="#C1A256" stroke-width="1.2"/>'
               '<path d="M3 19c0 8 7 13 15 13s15-5 15-13z" fill="#A0522D"/>'
               '<path d="M4 21c6 3 22 3 28 0M5 25c6 3 20 3 26 0M8 29c5 2 15 2 20 0" fill="none" stroke="#6B3A1E" stroke-width="1.3" stroke-linecap="round"/>',
    "hospital": '<rect x="3" y="7" width="30" height="4" rx="1" fill="#99AAB5"/><rect x="4" y="10" width="28" height="24" fill="#E1E8ED"/>'
                '<rect x="7" y="13" width="4.5" height="4.5" fill="#55ACEE"/><rect x="24.5" y="13" width="4.5" height="4.5" fill="#55ACEE"/>'
                '<rect x="7" y="21" width="4.5" height="4.5" fill="#55ACEE"/><rect x="24.5" y="21" width="4.5" height="4.5" fill="#55ACEE"/>'
                '<circle cx="18" cy="17" r="5.6" fill="#FFF" stroke="#1D4ED8" stroke-width="1.2"/><path d="M15.6 14v6M20.4 14v6M15.6 17h4.8" stroke="#1D4ED8" stroke-width="1.9" stroke-linecap="round"/>'
                '<rect x="14.5" y="25" width="7" height="9" fill="#3B88C3"/>',
}

SVG_RE = re.compile(r"^\s*<svg[^>]*viewBox=\"0 0 36 36\"[^>]*>(.*)</svg>\s*$", re.S)


# Dibujos de Twemoji con un cambio (CC BY 4.0 lo permite si se indica):
# clave -> (codigo, [fragmentos que se quitan]).
# escuela: el colegio 1f3eb sin el reloj de la torre, que se confundia con el
# despertador de la casa When (revision de exactitud, 23 nov 2026).
MODIFICADOS = {
    "escuela": ("1f3eb", ['<circle cx="14" cy="9" r="6" fill="#A7A9AC"/>', '<circle cx="14" cy="9" r="4" fill="#E6E7E8"/>',
                          '<path fill="#A0041E" d="M17 10h-3a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v4h2a1 1 0 0 1 0 2z"/>']),
}


# Dibujos de Twemoji con algo agregado encima (tambien permitido por CC BY 4.0
# indicandolo): clave -> (codigo, dibujo propio que se suma). Lo agregado es de
# SAMSAN. Sirven para una SITUACION que ningun emoji muestra (leccion 3, Why).
_GOTAS = ((10.3, 18.6, 3.4, 7.2), (17.6, 20.4, 3.0, 4.2), (23.2, 18.8, 3.4, 9.4))
COMPUESTOS = {
    # el bebe llora: cejas tristes suaves y dos lagrimas (nada de llanto fuerte)
    "babycry": ("1f476", '<path fill="none" stroke="#662214" stroke-width="1.6" stroke-linecap="round" d="M9.6 14.6l4.6-1.8M26.4 14.6l-4.6-1.8"/>'
                         '<path fill="#5DADEC" d="M11.6 21.2c-.9 1.8-2.1 3.3-2.1 4.7a2.1 2.1 0 0 0 4.2 0c0-1.4-1.2-2.9-2.1-4.7z"/>'
                         '<path fill="#5DADEC" d="M24.4 21.2c-.9 1.8-2.1 3.3-2.1 4.7a2.1 2.1 0 0 0 4.2 0c0-1.4-1.2-2.9-2.1-4.7z"/>'),
    # el helado se derrite: chorreones de crema sobre el cono y una gota que cae
    "melting": ("1f366", "".join('<path fill="#FFE8B6" d="M%s %sh%sv%sa%s %s 0 0 1-%s 0z"/>'
                                 '<path fill="none" stroke="#E8B04B" stroke-width=".6" stroke-linecap="round" d="M%s %sv%sa%s %s 0 0 0 %s 0v-%s"/>'
                                 % (x, y, w, h, w / 2, w / 2, w, x, y + 1.2, h - 1.2, w / 2, w / 2, w, h - 1.2) for x, y, w, h in _GOTAS)
                + '<path fill="#FFE8B6" stroke="#E8B04B" stroke-width=".6" d="M30 27.6c-.9 1.7-2 3-2 4.2a2 2 0 0 0 4 0c0-1.2-1.1-2.5-2-4.2z"/>'),
}


def leer(fuente, codigo):
    for nombre in (codigo, codigo.replace("-fe0f", "")):
        ruta = os.path.join(fuente, nombre + ".svg")
        if os.path.exists(ruta):
            return open(ruta, encoding="utf-8").read()
    raise AssertionError("No esta el icono %s en %s" % (codigo, fuente))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fuente", help="carpeta con los SVG de Twemoji; sin ella solo valida guias/comun/iconos.js")
    a = ap.parse_args()
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from guia_y2_english_v3 import iconos_usados
    from guia_y2_english_aprende import iconos_usados as usados_aprende
    usados = iconos_usados() | usados_aprende()
    if not a.fuente:
        # Actions corre cada generador sin argumentos: ahi se comprueba que el
        # archivo versionado tenga justo los dibujos que usa el banco.
        texto = open(SALIDA, encoding="utf-8").read()
        hechos = set(json.loads(texto[texto.index("window.ICONOS = ") + 16:texto.rindex(";")]))
        assert hechos == usados, "iconos.js no coincide con el banco: faltan %s, sobran %s (regenerar con --fuente)" % (sorted(usados - hechos), sorted(hechos - usados))
        assert "CC BY 4.0" in texto, "iconos.js perdio el credito de Twemoji"
        print("guias/comun/iconos.js: %d iconos, coincide con el banco" % len(hechos))
        return
    salida = {}
    for clave in sorted(usados & set(PROPIOS)):
        salida[clave] = PROPIOS[clave]
    for clave, codigo in sorted(list(ICONOS.items()) + [(k, v[0]) for k, v in MODIFICADOS.items()] + [(k, v[0]) for k, v in COMPUESTOS.items()]):
        if clave not in usados:
            continue
        svg = leer(a.fuente, codigo)
        for quitar in MODIFICADOS.get(clave, (None, []))[1]:
            assert quitar in svg, "%s: no encuentro %s" % (clave, quitar)
            svg = svg.replace(quitar, "")
        m = SVG_RE.match(svg)
        assert m, "%s (%s): no es un SVG de 36 x 36" % (clave, codigo)
        dentro = m.group(1) + (COMPUESTOS[clave][1] if clave in COMPUESTOS else "")
        assert not re.search(r"\bid=|<defs|url\(#|<script|<image|href=", dentro), "%s (%s): trae ids, defs o enlaces" % (clave, codigo)
        salida[clave] = dentro
    cuerpo = json.dumps(dict(sorted(salida.items())), ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    texto = ("/* ============================================================\n"
             "   ICONOS DE LA ALDEA (generado por tools/gen/iconos_twemoji.py; no se edita a mano)\n"
             "   Graficos: Twemoji, CC BY 4.0, (c) Twitter, Inc. y otros colaboradores, sin cambios en el dibujo\n"
             "   salvo: " + ", ".join("%s (%s sin el reloj)" % (k, v[0]) for k, v in sorted(MODIFICADOS.items()) if k in usados) + ".\n"
             "   con algo agregado por SAMSAN: " + ", ".join("%s (%s)" % (k, v[0]) for k, v in sorted(COMPUESTOS.items()) if k in usados) + ".\n"
             "   Propios de SAMSAN (dibujados por codigo): " + ", ".join(sorted(usados & set(PROPIOS))) + ".\n"
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
