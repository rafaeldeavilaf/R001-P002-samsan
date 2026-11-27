#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GUIA_Y2_ESPANOL_APRENDE — «Aprende con Pip», Y2 Español para APRENDER
(plan aprobado por Rafael, 26 nov 2026; examen de Español el 27 nov).
Escribe guias/y2-espanol-aprende.js y le dice a tools/gen/iconos_twemoji.py
que dibujos incrustar. Usa el motor de lecciones de guias/comun/guia.js SIN
tocarlo (modo «leccion», mecanica «casas», lang es).

CORTE A (este archivo): lecciones 1, 2 y 3.
  1  La c suena k (ca, co, cu) o s (ce, ci)
  2  La r suave entre vocales y la rr fuerte
  3  Sílabas: palabras de una, dos y tres sílabas (casas por golpes de voz)
El corte B (cuento, mayuscula y repaso) llega en otro commit.

Cada leccion tiene 5 pasos: mira (Pip explica y el ejemplo se oye), yo (Pip
resuelve 2 y dice por que), juntos (la casa correcta brilla), tu (sin ayuda;
si se equivoca, Pip vuelve a explicar y el ejemplo regresa al final) y aprendi
(resumen con ejemplos que se oyen y calcomania).

Reglas de contenido (se validan con assert):
- Cada ejemplo va a UNA sola casa y no se repite en otra leccion.
- Leccion 1: solo ca, co, cu y ce, ci. Cada palabra tiene una sola c y ninguna
  letra que se confunda con las casas (sin s, z, x ni q; nada de ch, que, qui,
  ga, go, gu, za, zo, zu).
- Leccion 2: r entre dos vocales (pera, loro) y rr (perro, carro). Nada con r
  inicial (rana, rosa) ni tras n, l o s, porque suenan fuertes y confunden la regla.
- Leccion 3: palabras sin diptongo ni hiato (sol, pan, casa, banana). Nada
  como pie, ciudad o leon. Cada silaba lleva una sola vocal.
- Nombres propios: ninguno de personas. Anonimato estricto.
- La voz dice SIEMPRE la palabra completa (una silaba suelta la pronuncia mal);
  las silabas se ven en pantalla, resaltadas con *...* en el texto de Pip, que
  la voz lee sin los asteriscos.
- Todo ejemplo tiene dibujo y no se repite dentro de la leccion. Los dibujos
  de mira no vuelven como ejemplo.
- Sin «» en ningun texto: el motor los lee con voz inglesa.
- Ejemplos propios. Del colegio solo salen los objetivos de la guia total.

Uso:  python3 tools/gen/guia_y2_espanol_aprende.py
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(ROOT, "guias", "y2-espanol-aprende.js")

VOCALES = "aeiouáéíóú"
BASE = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u"}

# Codigo fijo: id -> casa de la leccion. t es el letrero («t?»), es la traduccion
# que se ve encima, pide lo que se mira, regla lo que Pip dice al tocar la
# tarjeta y q lo que Pip dice antes de la palabra («q Palabra.»).
CODIGO = {
    "k":      {"t": "k", "es": "¿Suena como kilo?", "ico": "letra_k", "color": "#2563EB", "pide": "ca, co, cu",
               "regla": "Cuando la c va con la a, la o o la u, suena como la k de kilo.", "q": "Suena como kilo."},
    "s":      {"t": "s", "es": "¿Suena como sol?", "ico": "letra_s", "color": "#C2410C", "pide": "ce, ci",
               "regla": "Cuando la c va con la e o la i, suena como la s de sol.", "q": "Suena como sol."},
    "suave":  {"t": "r suave", "es": "¿Suena suave, como pera?", "ico": "letra_r", "color": "#15803D", "pide": "una r",
               "regla": "Una sola r entre dos vocales suena suave.", "q": "Una r, suena suave."},
    "fuerte": {"t": "rr fuerte", "es": "¿Suena fuerte, como perro?", "ico": "letra_rr", "color": "#9333EA", "pide": "rr",
               "regla": "Dos erres juntas, rr, suenan fuerte.", "q": "Dos erres, suena fuerte."},
    "mono":   {"t": "un golpe", "es": "¿Una sílaba?", "ico": "golpe1", "color": "#DB2777", "pide": "1 sílaba",
               "regla": "Una palabra con un solo golpe de voz tiene una sílaba. Se llama monosílaba.", "q": "Un golpe."},
    "bi":     {"t": "dos golpes", "es": "¿Dos sílabas?", "ico": "golpe2", "color": "#0F766E", "pide": "2 sílabas",
               "regla": "Una palabra con dos golpes de voz tiene dos sílabas. Se llama bisílaba.", "q": "Dos golpes."},
    "tri":    {"t": "tres golpes", "es": "¿Tres sílabas?", "ico": "golpe3", "color": "#B45309", "pide": "3 sílabas",
               "regla": "Una palabra con tres golpes de voz tiene tres sílabas. Se llama trisílaba.", "q": "Tres golpes."},
}

# Leccion: ejemplos (palabra, dibujo, casa). La nota (lo que Pip dice de cada
# palabra, con la parte que importa resaltada) se arma sola con notar_*() y se
# valida; asi ninguna palabra puede ir a una casa que no le toca.
LECCIONES = [
    {
        "id": "ce-ci", "unidad": "leer", "titulo": "La c: k y s", "en": "ca co cu · ce ci", "calco": "flag",
        "escena": "calle", "zonas": ["k", "s"], "tipo": "c",
        "por": {"k": "La c va con la a, la o o la u.", "s": "La c va con la e o la i."},
        "piensa": "Piensa. Mira la letra que viene después de la c.",
        "mira": [
            {"es": "Hoy vas a aprender que la letra c se escribe igual, pero suena de dos maneras."},
            {"es": "Cuando la c va con la a, la o o la u, suena como la k de kilo.", "zona": "k"},
            {"en": "vaca", "ico": "cow", "zona": "k"},
            {"nota": "vaca", "zona": "k"},
            {"es": "Cuando la c va con la e o la i, suena como la s de sol.", "zona": "s"},
            {"en": "cerdo", "ico": "pig", "zona": "s"},
            {"nota": "cerdo", "zona": "s"},
            {"es": "Recuerda. Mira la letra que viene después de la c. Si es la a, la o o la u, suena como kilo. Si es la e o la i, suena como sol."},
        ],
        "yo": [("cama", "bed", "k"), ("cine", "cinema", "s")],
        "juntos": [("cometa", "kite", "k"), ("cebolla", "onion", "s"), ("mico", "monkey", "k"), ("celular", "phone", "s")],
        "tu": [("copa", "trophy", "k"), ("cebra", "zebra", "s"), ("culebra", "snake", "k"),
               ("cepillo", "toothbrush", "s"), ("cangrejo", "crab", "k"), ("cerebro", "brain", "s")],
        "resumen": {"k": [("vaca", "cow"), ("cama", "bed")], "s": [("cerdo", "pig"), ("cine", "cinema")]},
    },
    {
        "id": "r-rr", "unidad": "leer", "titulo": "La r y la rr", "en": "r suave · rr fuerte", "calco": "star",
        "escena": "plaza", "zonas": ["suave", "fuerte"], "tipo": "r",
        "por": {"suave": "Tiene una sola r entre dos vocales.", "fuerte": "Tiene dos erres juntas."},
        "piensa": "Piensa. ¿Hay una sola r o hay dos erres juntas?",
        "mira": [
            {"es": "Hoy vas a aprender los dos sonidos de la r."},
            {"es": "Una sola r entre dos vocales suena suave, como en pera.", "zona": "suave"},
            {"en": "pera", "ico": "pear", "zona": "suave"},
            {"nota": "pera", "zona": "suave"},
            {"es": "Dos erres juntas, rr, suenan fuerte, como en perro.", "zona": "fuerte"},
            {"en": "perro", "ico": "dog", "zona": "fuerte"},
            {"nota": "perro", "zona": "fuerte"},
            {"es": "Recuerda. Una sola r entre vocales suena suave. Dos erres juntas suenan fuerte."},
        ],
        "yo": [("loro", "parrot", "suave"), ("carro", "car", "fuerte")],
        "juntos": [("tijera", "scissors", "suave"), ("zorro", "fox", "fuerte"), ("corona", "crown", "suave"), ("torre", "tower", "fuerte")],
        "tu": [("mariposa", "butterfly", "suave"), ("arroz", "rice", "fuerte"), ("naranja", "orange", "suave"),
               ("gorra", "cap", "fuerte"), ("cámara", "camera", "suave"), ("carrito", "cart", "fuerte")],
        "resumen": {"suave": [("loro", "parrot"), ("pera", "pear")], "fuerte": [("perro", "dog"), ("carro", "car")]},
    },
    {
        "id": "silabas", "unidad": "leer", "titulo": "Las sílabas", "en": "1, 2 y 3 sílabas", "calco": "clap",
        "escena": "habitat", "zonas": ["mono", "bi", "tri"], "tipo": "s",
        "por": {"mono": "Tiene un solo golpe de voz.", "bi": "Tiene dos golpes de voz.", "tri": "Tiene tres golpes de voz."},
        "piensa": "Piensa. Di la palabra y da una palmada por cada golpe de voz.",
        "mira": [
            {"es": "Hoy vas a aprender a partir las palabras en pedacitos. Cada pedacito es una sílaba."},
            {"es": "Di la palabra y da una palmada por cada golpe de voz. Cada golpe es una sílaba."},
            {"es": "Yo marco cada pedacito con amarillo y sin color, uno tras otro, para que veas dónde se parte la palabra."},
            {"es": "Una palabra con un solo golpe de voz tiene una sílaba. Se llama monosílaba.", "zona": "mono"},
            {"en": "sol", "ico": "sunny", "zona": "mono"},
            {"nota": "sol", "zona": "mono"},
            {"es": "Con dos golpes de voz tiene dos sílabas. Se llama bisílaba.", "zona": "bi"},
            {"en": "gato", "ico": "cat", "zona": "bi"},
            {"nota": "gato", "zona": "bi"},
            {"es": "Con tres golpes de voz tiene tres sílabas. Se llama trisílaba.", "zona": "tri"},
            {"en": "banana", "ico": "banana", "zona": "tri"},
            {"nota": "banana", "zona": "tri"},
            {"es": "Recuerda. Cada golpe de voz es una sílaba. Hoy practicamos palabras de una, dos o tres sílabas."},
        ],
        "yo": [("pan", "bread", "mono"), ("luna", "night", "bi")],
        "juntos": [("tren", "train", "mono"), ("pato", "duck", "bi"), ("tomate", "tomato", "tri"), ("flor", "flower", "mono")],
        "tu": [("pez", "fish", "mono"), ("libro", "book", "bi"), ("tortuga", "turtle", "tri"),
               ("sal", "salt", "mono"), ("nube", "cloud", "bi"), ("manzana", "apple", "tri")],
        "resumen": {"mono": [("sol", "sunny"), ("pan", "bread")], "bi": [("gato", "cat"), ("luna", "night")],
                    "tri": [("banana", "banana"), ("tomate", "tomato")]},
    },
]

# Silabas de cada palabra de la leccion 3 (una sola vocal por silaba, sin
# diptongo ni hiato). La suma de las silabas es la palabra.
SILABAS = {
    "sol": ["sol"], "pan": ["pan"], "tren": ["tren"], "flor": ["flor"], "pez": ["pez"], "sal": ["sal"],
    "gato": ["ga", "to"], "luna": ["lu", "na"], "pato": ["pa", "to"], "libro": ["li", "bro"], "nube": ["nu", "be"],
    "banana": ["ba", "na", "na"], "tomate": ["to", "ma", "te"], "tortuga": ["tor", "tu", "ga"], "manzana": ["man", "za", "na"],
}
NUMERO = {"mono": 1, "bi": 2, "tri": 3}
GOLPES = {1: "un solo golpe de voz", 2: "dos golpes de voz", 3: "tres golpes de voz"}


def vocal(ch):
    return BASE.get(ch, ch)


def notar_c(palabra):
    """Leccion 1: la c y la letra que la sigue, resaltadas; dice a que casa va."""
    assert palabra.count("c") == 1, "%s: una sola c" % palabra
    assert not re.search(r"[szxq]", palabra), "%s: sin s, z, x ni q (se confunde con las casas)" % palabra
    assert "ch" not in palabra and "cc" not in palabra, palabra
    i = palabra.index("c")
    assert i + 1 < len(palabra) and palabra[i + 1] in "aeiou", "%s: la c va con una vocal" % palabra
    v = palabra[i + 1]
    zona = "k" if v in "aou" else "s"
    resaltada = palabra[:i] + "*" + palabra[i:i + 2] + "*" + palabra[i + 2:]
    return zona, "En %s, la c va con la %s. Por eso suena como %s." % (resaltada, v, "kilo" if zona == "k" else "sol")


def notar_r(palabra):
    """Leccion 2: la r (o rr) entre vocales, resaltada; dice a que casa va."""
    assert not palabra.startswith("r"), "%s: sin r inicial" % palabra
    grupos = re.findall(r"r+", palabra)
    assert len(grupos) == 1 and len(grupos[0]) in (1, 2), "%s: un solo grupo de r (una o dos)" % palabra
    i = palabra.index(grupos[0]); j = i + len(grupos[0])
    assert i > 0 and j < len(palabra), palabra
    antes, despues = vocal(palabra[i - 1]), vocal(palabra[j])
    assert antes in "aeiou" and despues in "aeiou", "%s: la r va entre dos vocales (no tras n, l ni s)" % palabra
    resaltada = palabra[:i] + "*" + grupos[0] + "*" + palabra[j:]
    if len(grupos[0]) == 1:
        return "suave", "En %s, la r está entre la %s y la %s. Es una sola r. Por eso suena suave." % (resaltada, antes, despues)
    return "fuerte", "En %s, las dos erres están entre la %s y la %s. Por eso suena fuerte." % (resaltada, antes, despues)


def notar_s(palabra):
    """Leccion 3: las silabas, alternadas con *...* para que se vea donde se parte."""
    sil = SILABAS[palabra]
    assert "".join(sil) == palabra, "%s: las silabas no suman la palabra" % palabra
    for s in sil:
        assert sum(1 for ch in s if ch in VOCALES) == 1, "%s: la silaba «%s» debe tener una sola vocal" % (palabra, s)
    # sin diptongo ni hiato: dos vocales seguidas dentro de la palabra no se admiten
    assert not re.search("[%s]{2}" % VOCALES, palabra), "%s: sin diptongo ni hiato" % palabra
    n = len(sil)
    assert n in (1, 2, 3), palabra
    resaltada = "".join(("*%s*" % s) if k % 2 == 0 else s for k, s in enumerate(sil))
    zona = {1: "mono", 2: "bi", 3: "tri"}[n]
    return zona, "En %s hay %s." % (resaltada, GOLPES[n])


def item(t, notar):
    palabra, ico, zona = t[:3]
    z, nota = notar(palabra)
    assert z == zona, "%s: va a la casa %s, no a %s" % (palabra, z, zona)
    return {"en": palabra, "ico": ico, "zona": zona, "nota": nota}


def banco_iconos():
    import iconos_twemoji as IT
    return set(IT.ICONOS) | set(IT.PROPIOS) | set(IT.MODIFICADOS) | set(IT.COMPUESTOS) | set(IT.RECOLOR)


def construir():
    banco = banco_iconos()
    notar = {"c": notar_c, "r": notar_r, "s": notar_s}
    lecciones, palabras_todas = [], []
    for L in LECCIONES:
        k = L["id"]
        assert set(L["zonas"]) <= set(CODIGO), k
        n = notar[L["tipo"]]
        vistos, palabras = set(), set()
        for paso in ("yo", "juntos", "tu"):
            for texto, ico, zona in L[paso]:
                assert zona in L["zonas"], (k, texto, zona)
                assert ico not in vistos, "%s: el dibujo %s se repite" % (k, ico)
                assert ico in banco, "%s: el dibujo %s no esta en el banco" % (k, ico)
                assert texto not in palabras and texto not in palabras_todas, "%s: la palabra %s se repite" % (k, texto)
                assert texto == texto.lower() and re.fullmatch(r"[a-záéíóúñ]+", texto), "%s: palabra en minuscula, sin nombres propios: %s" % (k, texto)
                vistos.add(ico); palabras.add(texto)
        assert len(L["yo"]) == 2 and len(L["juntos"]) >= 4 and len(L["tu"]) >= 6, k
        for z in L["zonas"]:
            assert sum(1 for x in L["tu"] if x[2] == z) >= 2, "%s: en tu solo faltan ejemplos de %s" % (k, z)
            assert sum(1 for x in L["juntos"] if x[2] == z) >= 1, "%s: en juntos falta %s" % (k, z)
            assert z in L["por"] and L["resumen"].get(z), (k, z)
        assert L.get("piensa"), "%s: falta la pregunta para pensar" % k
        # mira: dibujos que existen y no vuelven como ejemplo; sus palabras tambien siguen la regla
        mira, dichas = [], []
        for m in L["mira"]:
            assert m.get("ico") not in vistos, "%s: el dibujo %s de mira se repite en un ejemplo" % (k, m.get("ico"))
            assert "ico" not in m or m["ico"] in banco, (k, m)
            assert "zona" not in m or m["zona"] in L["zonas"], (k, m)
            m = dict(m)
            if "en" in m:
                z, _ = n(m["en"])
                assert z == m["zona"], "%s: mira «%s» va a %s" % (k, m["en"], z)
                assert m["en"] not in palabras and m["en"] not in palabras_todas, "%s: mira repite %s" % (k, m["en"])
                palabras.add(m["en"]); dichas.append(m["en"])
            if "nota" in m:
                # la explicacion de una palabra de mira la arma la misma funcion que arma las notas
                assert m.pop("nota") == dichas[-1], "%s: la nota de mira va despues de su palabra" % k
                z, m["es"] = n(dichas[-1])
                assert z == m["zona"], (k, m)
            assert "«" not in m.get("es", "") and "»" not in m.get("es", ""), "%s: sin «» (el motor los lee con voz inglesa)" % k
            mira.append(m)
        assert len(dichas) == len(L["zonas"]) and {n(w)[0] for w in dichas} == set(L["zonas"]), "%s: mira muestra una palabra por casa" % k
        for z in L["zonas"]:
            for texto, ico in L["resumen"][z]:
                assert texto in palabras, "%s: el resumen usa %s, que no se vio en la leccion" % (k, texto)
                assert n(texto)[0] == z, (k, texto)
        for t in L["yo"] + L["juntos"] + L["tu"]:
            assert "*" in n(t[0])[1]
        palabras_todas += list(palabras)
        for c in (L["calco"],):
            assert c in banco, "%s: calcomania %s" % (k, c)
        lecciones.append({
            "id": k, "unidad": L["unidad"], "titulo": L["titulo"], "en": L["en"], "calco": L["calco"], "escena": L["escena"],
            "zonas": L["zonas"], "por": L["por"], "piensa": L["piensa"], "mira": mira,
            "yo": [item(x, n) for x in L["yo"]], "juntos": [item(x, n) for x in L["juntos"]], "tu": [item(x, n) for x in L["tu"]],
            "resumen": [{"zona": z, "ej": [{"ico": i, "en": texto} for texto, i in L["resumen"][z]]} for z in L["zonas"]],
        })
    # codigo fijo: iconos que existen y cada casa en alguna leccion
    for z, c in CODIGO.items():
        assert c["ico"] in banco and re.fullmatch(r"#[0-9A-Fa-f]{6}", c["color"]) and re.fullmatch(r"¿.+\?", c["es"]), z
        assert c["t"] and c["q"].endswith(".") and c["regla"].endswith("."), z
        assert "«" not in c["regla"] + c["q"], z
    assert set(CODIGO) == {z for L in LECCIONES for z in L["zonas"]}, "el codigo trae casas sin leccion"
    return lecciones


def iconos_usados():
    usados = {c["ico"] for c in CODIGO.values()}
    for L in LECCIONES:
        usados.add(L["calco"])
        for paso in ("yo", "juntos", "tu"):
            usados |= {x[1] for x in L[paso]}
        usados |= {m["ico"] for m in L["mira"] if "ico" in m}
        for z in L["resumen"].values():
            usados |= {i for _, i in z}
    return usados


def main():
    datos = {
        "modo": "leccion", "id": "y2-espanol-aprende", "lang": "es-CO", "langExplica": "es-CO", "tema": "y2",
        "mascota": "pip", "mascotaNombre": "Pip", "titulo": "Aprende con Pip", "subtitulo": "Español · Year 2",
        "musica": "alegre", "velocidad": 0.85,
        "unidades": [{"id": "leer", "titulo": "Leer palabras", "es": "Sonidos y sílabas"}],
        "codigo": CODIGO,
        # corte A: 1 la c, 2 la r y la rr, 3 las silabas (el corte B suma 4 a 7)
        "lecciones": construir(),
    }
    js = ("// titulo: Aprende con Pip · Year 2 Español\n// lang: es\n// usa: aldea\n"
          "/* ============================================================\n"
          "   APRENDE CON PIP — Y2 Español para aprender (generado por\n"
          "   tools/gen/guia_y2_espanol_aprende.py; no se edita a mano).\n"
          "   Pip explica y la voz dice siempre la palabra completa.\n"
          "   ============================================================ */\n"
          "GUIA.iniciar(" + json.dumps(datos, ensure_ascii=False, indent=1) + ");\n")
    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write(js)
    print("guias/y2-espanol-aprende.js: %d lecciones" % len(datos["lecciones"]))


if __name__ == "__main__":
    main()
