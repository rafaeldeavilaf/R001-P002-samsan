#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GUIA_Y2_ENGLISH_V3 — banco de palabras con dibujo de «La aldea de Pip»
(Y2 English v3, propuesta aprobada el 18 nov 2026). Escribe
guias/y2-english-v3.js y le dice a tools/gen/iconos_twemoji.py que dibujos
incrustar.

Reglas del banco (se validan con assert):
- Toda palabra tiene un dibujo (Twemoji o uno propio dibujado por codigo).
- Cada palabra va a una sola zona, sin ambiguedad: cualquier palabra del mundo
  puede salir con cualquier combinacion de zonas.
- Cada zona tiene al menos 3 palabras ademas de su ejemplo, porque una etapa de
  5 globos con 2 zonas reparte 3 y 2.
- En long i y en blends, las letras marcadas con *...* son las de la zona
  (i_e, igh, y al final, ie; l, r o s en el inicio).
- Sin palabras sl (es s y es l a la vez para un niño de 6 años).
- Solo objetivos de la guia total; nada copiado del material del colegio.

Uso:  python3 tools/gen/guia_y2_english_v3.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(ROOT, "guias", "y2-english-v3.js")

# Cada mundo: escena del kit, zonas (letrero, lugar, ejemplo y lo que Pip dice
# como pista) y palabras como (texto con *marcas*, dibujo, zona).
MUNDOS = [
    {
        "id": "long-i", "titulo": "Long i street", "escena": "calle", "calcos": ["kite", "bike", "lightning"],
        "zonas": [
            {"id": "ie_", "letrero": "i_e", "lugar": "casa", "color": "#2563EB", "ej": "kite", "ejp": "k*i*t*e*", "voz": "i, one letter, then magic e"},
            {"id": "igh", "letrero": "igh", "lugar": "casa", "color": "#EA580C", "ej": "night", "ejp": "n*igh*t", "voz": "i, g, h"},
            {"id": "y", "letrero": "y", "lugar": "casa", "color": "#16A34A", "ej": "fly", "ejp": "fl*y*", "voz": "y at the end"},
            {"id": "ie", "letrero": "ie", "lugar": "casa", "color": "#9333EA", "ej": "pie", "ejp": "p*ie*", "voz": "i and e side by side"},
        ],
        "palabras": [
            ("b*i*k*e*", "bike", "ie_"), ("d*i*c*e*", "dice", "ie_"), ("*i*c*e*", "ice", "ie_"), ("r*i*c*e*", "rice", "ie_"),
            ("n*i*n*e*", "nine", "ie_"), ("f*i*v*e*", "five", "ie_"), ("sm*i*l*e*", "smile", "ie_"), ("sl*i*d*e*", "slide", "ie_"),
            ("l*igh*t", "light", "igh"), ("fl*igh*t", "flight", "igh"), ("l*igh*tning", "lightning", "igh"),
            ("r*igh*t", "right", "igh"),
            ("sp*y*", "spy", "y"), ("wh*y*", "why", "y"), ("sh*y*", "shy", "y"), ("butterfl*y*", "butterfly", "y"), ("sk*y*", "sky", "y"),
            ("t*ie*", "tie", "ie"), ("fr*ie*s", "fries", "ie"), ("fr*ie*d", "fried", "ie"), ("cr*ie*d", "cried", "ie"),
        ],
    },
    {
        "id": "blends", "titulo": "Blend pond", "escena": "estanque", "calcos": ["frog", "snail", "dragon"],
        "zonas": [
            {"id": "l", "letrero": "l", "lugar": "hoja", "color": "#0EA5E9", "ej": "flag", "ejp": "*fl*ag", "voz": "the second letter is l"},
            {"id": "r", "letrero": "r", "lugar": "hoja", "color": "#DB2777", "ej": "frog", "ejp": "*fr*og", "voz": "the second letter is r"},
            {"id": "s", "letrero": "s", "lugar": "hoja", "color": "#F59E0B", "ej": "star", "ejp": "*st*ar", "voz": "s comes first"},
        ],
        "palabras": [
            ("*cl*ock", "clock", "l"), ("*pl*ane", "plane", "l"), ("*cl*ap", "clap", "l"), ("*fl*ower", "flower", "l"),
            ("*gl*oves", "glove", "l"), ("*gl*obe", "globe", "l"), ("*pl*ate", "plate", "l"),
            ("*tr*ee", "tree", "r"), ("*cr*ab", "crab", "r"), ("*dr*um", "drum", "r"), ("*gr*apes", "grapes", "r"),
            ("*br*ead", "bread", "r"), ("*tr*ain", "train", "r"), ("*cr*own", "crown", "r"), ("*dr*agon", "dragon", "r"), ("*tr*actor", "tractor", "r"),
            ("*sn*ail", "snail", "s"), ("*sp*oon", "spoon", "s"), ("*sw*im", "swim", "s"), ("*sn*ake", "snake", "s"),
            ("*sk*ate", "skate", "s"), ("*sk*i", "ski", "s"), ("*sn*owman", "snowman", "s"), ("*sp*onge", "sponge", "s"),
        ],
    },
    {
        "id": "wh", "titulo": "Question square", "escena": "plaza", "calcos": ["firefighter", "apple", "birthday"],
        "zonas": [
            {"id": "who", "letrero": "Who?", "lugar": "puesto", "color": "#16A34A", "ej": "grandma", "ejp": "my grandma", "voz": "a person"},
            {"id": "what", "letrero": "What?", "lugar": "puesto", "color": "#2563EB", "ej": "banana", "ejp": "a banana", "voz": "a thing"},
            {"id": "where", "letrero": "Where?", "lugar": "puesto", "color": "#DC2626", "ej": "home", "ejp": "at home", "voz": "a place"},
            {"id": "when", "letrero": "When?", "lugar": "puesto", "color": "#9333EA", "ej": "calendar", "ejp": "on Monday", "voz": "a time"},
            {"id": "why", "letrero": "Why?", "lugar": "puesto", "color": "#B45309", "ej": "raining", "ejp": "because it is raining", "voz": "because"},
        ],
        "palabras": [
            ("a firefighter", "firefighter", "who"), ("the baby", "baby", "who"), ("a doctor", "doctor", "who"), ("my teacher", "teacher", "who"), ("a farmer", "farmer", "who"),
            ("a ball", "ball", "what"), ("a sandwich", "sandwich", "what"), ("a car", "car", "what"), ("a book", "book", "what"), ("an apple", "apple", "what"),
            ("at the park", "slide", "where"), ("at school", "school", "where"), ("at the beach", "beach", "where"), ("at the hospital", "hospital", "where"),
            ("at night", "night", "when"), ("in the morning", "morning", "when"), ("on my birthday", "birthday", "when"), ("in the evening", "evening", "when"),
            ("because it is hot", "hot", "why"), ("because I am tired", "tired", "why"), ("because I am happy", "happy", "why"), ("because it is cold", "cold", "why"),
        ],
    },
    {
        "id": "habitats", "titulo": "Where do animals live?", "escena": "habitat", "calcos": ["sloth", "parrot", "dolphin"],
        "zonas": [
            {"id": "arbol", "letrero": "trees", "lugar": "arbol", "color": "#16A34A", "ej": "monkey", "ejp": "a monkey", "voz": "it lives up in the trees"},
            {"id": "agua", "letrero": "water", "lugar": "agua", "color": "#2563EB", "ej": "fish", "ejp": "a fish", "voz": "it swims and lives in the water"},
            {"id": "flores", "letrero": "flowers", "lugar": "flores", "color": "#DB2777", "ej": "bee", "ejp": "a bee", "voz": "it visits flowers"},
        ],
        "palabras": [
            ("a sloth", "sloth", "arbol"), ("a parrot", "parrot", "arbol"), ("an owl", "owl", "arbol"),
            ("a dolphin", "dolphin", "agua"), ("an octopus", "octopus", "agua"), ("a whale", "whale", "agua"), ("a shark", "shark", "agua"),
            ("a butterfly", "butterfly", "flores"), ("a bumblebee", "bumblebee", "flores"), ("a hummingbird", "hummingbird", "flores"),
        ],
    },
    {
        "id": "community", "titulo": "Our community", "escena": "barrio", "calcos": ["doughnut", "ambulance", "duck"],
        "zonas": [
            {"id": "panaderia", "letrero": "bakery", "lugar": "edificio", "variante": "panaderia", "color": "#D97706", "ej": "bread", "ejp": "buy bread", "voz": "we buy bread and cakes there"},
            {"id": "colegio", "letrero": "school", "lugar": "edificio", "variante": "colegio", "color": "#DC2626", "ej": "book", "ejp": "read a book", "voz": "we learn there"},
            {"id": "hospital", "letrero": "hospital", "lugar": "edificio", "variante": "hospital", "color": "#0EA5E9", "ej": "doctor", "ejp": "the doctor", "voz": "doctors help sick people there"},
            {"id": "parque", "letrero": "park", "lugar": "edificio", "variante": "parque", "color": "#16A34A", "ej": "kite", "ejp": "fly a kite", "voz": "we play outside there"},
        ],
        "palabras": [
            ("buy a cake", "birthday", "panaderia"), ("buy doughnuts", "doughnut", "panaderia"), ("buy croissants", "croissant", "panaderia"), ("buy cookies", "cookie", "panaderia"),
            ("the teacher", "teacher", "colegio"), ("my school bag", "backpack", "colegio"), ("a pencil", "pencil", "colegio"), ("learn to read", "books", "colegio"),
            ("an ambulance", "ambulance", "hospital"), ("a plaster", "bandage", "hospital"), ("feel ill", "ill", "hospital"),
            ("ride my bike", "bike", "parque"), ("feed the ducks", "duck", "parque"), ("walk the dog", "dog", "parque"),
        ],
    },
    {
        "id": "life-cycles", "titulo": "Life cycle farm", "escena": "granja", "calcos": ["chick", "caterpillar", "tadpole"],
        "zonas": [
            {"id": "mariposa", "letrero": "butterfly", "lugar": "flores", "color": "#A855F7", "ej": "butterfly", "ejp": "butterfly", "voz": "it grows into a butterfly"},
            {"id": "rana", "letrero": "frog", "lugar": "agua", "color": "#16A34A", "ej": "frog", "ejp": "frog", "voz": "it grows into a frog"},
            {"id": "gallina", "letrero": "chicken", "lugar": "gallinero", "color": "#DC2626", "ej": "hen", "ejp": "hen", "voz": "it grows into a chicken"},
        ],
        "palabras": [
            ("egg on a leaf", "leafegg", "mariposa"), ("caterpillar", "caterpillar", "mariposa"), ("chrysalis", "chrysalis", "mariposa"),
            ("frogspawn", "frogspawn", "rana"), ("tadpole", "tadpole", "rana"), ("froglet", "froglet", "rana"),
            ("egg in a nest", "nestegg", "gallina"), ("chick", "chick", "gallina"), ("hatching chick", "hatching", "gallina"),
        ],
    },
]

# Patron de las letras marcadas por zona.
PATRON = {
    "long-i": {"ie_": r"^[a-z]*\*i\*[a-z]\*e\*$", "igh": r"\*igh\*", "y": r"\*y\*$", "ie": r"\*ie\*"},
    "blends": {"l": r"^\*[bcfgp]l\*", "r": r"^\*[bcdfgpt]r\*", "s": r"^\*s[kmnptw]\*"},
}


def iconos_usados():
    usados = set()
    for m in MUNDOS:
        usados.update(m["calcos"])
        for z in m["zonas"]:
            usados.add(z["ej"])
        for _, ico, _ in m["palabras"]:
            usados.add(ico)
    return usados


def validar():
    from iconos_twemoji import ICONOS, PROPIOS
    disponibles = set(ICONOS) | set(PROPIOS)
    faltan = sorted(iconos_usados() - disponibles)
    assert not faltan, "Dibujos sin icono: %s" % ", ".join(faltan)
    ids = [m["id"] for m in MUNDOS]
    assert len(ids) == len(set(ids)), "mundos repetidos"
    for m in MUNDOS:
        zonas = {z["id"]: z for z in m["zonas"]}
        assert 2 <= len(zonas) <= 5, m["id"]
        assert len(m["calcos"]) == 3, "%s: una calcomania por etapa" % m["id"]
        vistos = set()
        for texto, ico, zona in m["palabras"]:
            plano = texto.replace("*", "")
            assert zona in zonas, "%s: zona %s" % (texto, zona)
            assert plano not in vistos, "%s: repetida en %s" % (plano, m["id"])
            vistos.add(plano)
            assert ico != zonas[zona]["ej"], "%s: usa el mismo dibujo del ejemplo de su zona" % plano
            if m["id"] == "blends":
                assert not plano.startswith("sl"), "%s: las palabras sl son ambiguas" % plano
            if m["id"] in PATRON:
                for zid, pat in PATRON[m["id"]].items():
                    pega = re.search(pat, texto) is not None
                    assert pega == (zid == zona), "%s: sus marcas %s la zona %s" % (texto, "encajan en" if pega else "no encajan en", zid)
            else:
                assert "*" not in texto, "%s: sin marcas fuera de long i y blends" % texto
        for zid, z in zonas.items():
            assert z.get("ejp"), "%s/%s: falta el texto del ejemplo (ejp)" % (m["id"], zid)
            if m["id"] in PATRON:
                for zz, pat in PATRON[m["id"]].items():
                    assert (re.search(pat, z["ejp"]) is not None) == (zz == zid), "%s: ejemplo %s mal marcado" % (m["id"], z["ejp"])
            n = sum(1 for _, _, z in m["palabras"] if z == zid)
            assert n >= 3, "%s/%s: solo %d palabras" % (m["id"], zid, n)
        dibujos = [ico for _, ico, _ in m["palabras"]] + [z["ej"] for z in m["zonas"]]
        assert len(dibujos) == len(set(dibujos)), "%s: un dibujo se repite dentro del mundo" % m["id"]


def main():
    validar()
    datos = []
    for m in MUNDOS:
        datos.append({
            "id": m["id"], "titulo": m["titulo"], "escena": m["escena"], "calcos": m["calcos"],
            "zonas": m["zonas"],
            "palabras": [{"p": t, "ico": i, "zona": z} for t, i, z in m["palabras"]],
        })
    js = ("// titulo: Year 2 English · Pip's village\n"
          "// lang: en\n"
          "// usa: aldea\n"
          "/* Generado por tools/gen/guia_y2_english_v3.py; no se edita a mano.\n"
          "   LA ALDEA DE PIP — YEAR 2 · ENGLISH (v3) · jugador menor. Textos propios;\n"
          "   del colegio solo salen los objetivos. La v2 sigue publicada. */\n"
          "GUIA.iniciar(" + json.dumps({
              "modo": "aldea", "id": "y2-english-v3", "lang": "en-GB", "tema": "y2", "mascota": "pip",
              "mascotaNombre": "Pip the owl", "titulo": "Pip's village", "subtitulo": "Year 2 English",
              "leerFichas": True, "vozAuto": True, "velocidad": 0.85, "musica": "alegre",
              "porEtapa": 5, "etapas": [2, 3, 4],
              "pieles": [
                  {"id": "base", "nombre": "Classic", "gemas": 0},
                  {"id": "bosque", "nombre": "Forest", "gemas": 3, "colores": {"#4A90D9": "#3FA34D", "#2F6FA8": "#2E7D32", "#CFE6FA": "#D7F2D9"}},
                  {"id": "naranja", "nombre": "Sunset", "gemas": 6, "colores": {"#4A90D9": "#F28C28", "#2F6FA8": "#C2410C", "#CFE6FA": "#FFE3C2"}},
                  {"id": "mora", "nombre": "Berry", "gemas": 9, "colores": {"#4A90D9": "#A855F7", "#2F6FA8": "#7E22CE", "#CFE6FA": "#EBDDFB"}},
                  {"id": "rosa", "nombre": "Rose", "gemas": 12, "colores": {"#4A90D9": "#EC4899", "#2F6FA8": "#BE185D", "#CFE6FA": "#FCE0EF"}},
                  {"id": "oro", "nombre": "Gold", "gemas": 15, "colores": {"#4A90D9": "#EAB308", "#2F6FA8": "#A16207", "#CFE6FA": "#FEF3C2"}},
              ],
              "mundos": datos}, ensure_ascii=False, indent=1) + ");\n")
    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write(js)
    n = sum(len(m["palabras"]) for m in MUNDOS)
    print("guias/y2-english-v3.js: %d mundos, %d palabras, %d dibujos" % (len(MUNDOS), n, len(iconos_usados())))


if __name__ == "__main__":
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    main()
