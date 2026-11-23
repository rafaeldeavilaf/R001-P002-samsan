#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GUIA_Y2_ENGLISH_APRENDE — «Learn with Pip», Y2 English para APRENDER
(plan aprobado por Rafael el 23 nov 2026, foco en las Wh questions).
Escribe guias/y2-english-aprende.js y le dice a tools/gen/iconos_twemoji.py
que dibujos incrustar.

Cada leccion tiene 5 pasos: mira (Pip explica en español y el ejemplo va en
ingles), yo (Pip resuelve 2 y dice por que), juntos (la ayuda esta a la vista),
tu (la ayuda se retira; si se equivoca, Pip vuelve a explicar y el ejemplo
regresa al final) y aprendi (resumen con ejemplos que se oyen y calcomania).

Codigo fijo de las preguntas: cada una tiene siempre el mismo color, icono y
traduccion en toda la app.

Reglas (se validan con assert):
- Cada ejemplo va a una sola casa, sin ambiguedad para un niño de 6 a 7 años:
  en Who solo personas; en What solo cosas (sin animales, que se discuten);
  en Where solo lugares claros; en When solo momentos claros (los dos con
  at, in u on).
- Todo ejemplo tiene dibujo y no se repite dentro de la leccion.
- Solo objetivos de la guia total; nada copiado del material del colegio.

Uso:  python3 tools/gen/guia_y2_english_aprende.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(ROOT, "guias", "y2-english-aprende.js")

# Codigo fijo: id -> pregunta, traduccion, icono, color, lo que pide, frase modelo
CODIGO = {
    "who":   {"t": "Who",   "es": "¿Quién?",   "ico": "persona", "color": "#2563EB", "pide": "una persona",  "regla": "Para preguntar por una persona usamos Who.", "q": "Who is this?"},
    "what":  {"t": "What",  "es": "¿Qué?",     "ico": "caja",    "color": "#EA580C", "pide": "una cosa",     "regla": "Para preguntar por una cosa usamos What.",   "q": "What is this?"},
    "where": {"t": "Where", "es": "¿Dónde?",   "ico": "lugar",   "color": "#16A34A", "pide": "un lugar",     "regla": "Para preguntar por un lugar usamos Where.",  "q": "Where is it?"},
    "when":  {"t": "When",  "es": "¿Cuándo?",  "ico": "clock",   "color": "#9333EA", "pide": "un momento",   "regla": "Para preguntar por un momento usamos When.", "q": "When is it?"},
    "why":   {"t": "Why",   "es": "¿Por qué?", "ico": "pensar",  "color": "#DB2777", "pide": "una razón",    "regla": "Para preguntar por una razón usamos Why, y la respuesta empieza con because.", "q": "Why?"},
}

# Leccion: (texto en ingles del ejemplo, dibujo, casa)
LECCIONES = [
    {
        "id": "who-what", "unidad": "wh", "titulo": "Who y What", "en": "Who and What", "calco": "farmer",
        "escena": "calle", "zonas": ["who", "what"],
        "por": {"who": "Es una persona.", "what": "Es una cosa."},
        "piensa": "Piensa. ¿Es una persona o una cosa?",
        "mira": [
            {"es": "Hoy vas a aprender dos palabras para preguntar en inglés."},
            {"es": "Who sirve para preguntar por una persona.", "zona": "who"},
            {"en": "Who is this? A farmer.", "ico": "farmer", "zona": "who"},
            {"es": "What sirve para preguntar por una cosa.", "zona": "what"},
            {"en": "What is this? A tractor.", "ico": "tractor", "zona": "what"},
            {"es": "Recuerda. Si es una persona, Who. Si es una cosa, What."},
        ],
        "yo": [("a teacher", "teacher", "who"), ("a ball", "ball", "what")],
        "juntos": [("a grandma", "grandma", "who"), ("an apple", "apple", "what"), ("a doctor", "doctor", "who"), ("a book", "book", "what")],
        "tu": [("a baby", "baby", "who"), ("a kite", "kite", "what"), ("a firefighter", "firefighter", "who"),
               ("a bike", "bike", "what"), ("a cook", "baker", "who"), ("a sandwich", "sandwich", "what")],
        "resumen": {"who": [("a farmer", "farmer"), ("a teacher", "teacher")], "what": [("a tractor", "tractor"), ("a ball", "ball")]},
    },
    {
        # Leccion 2: Where (lugares) y When (momentos). Solo lugares que un niño
        # de 6 a 7 años reconoce como sitio, y solo momentos claros del dia, la
        # semana o el año. Nada que pueda ser las dos cosas (p. ej. «at lunch»,
        # «in bed»), ni dibujos de personas, que en la leccion 1 fueron Who.
        "id": "where-when", "unidad": "wh", "titulo": "Where y When", "en": "Where and When", "calco": "cow",
        "escena": "plaza", "zonas": ["where", "when"],
        "por": {"where": "Es un lugar.", "when": "Es un momento."},
        "piensa": "Piensa. ¿Es un lugar o un momento?",
        "mira": [
            {"es": "Hoy vas a aprender dos palabras más para preguntar en inglés."},
            {"es": "Where sirve para preguntar por un lugar.", "zona": "where"},
            {"en": "Where is the cow? At the farm.", "ico": "cow", "zona": "where"},
            {"es": "When sirve para preguntar por un momento, cuándo pasa algo.", "zona": "when"},
            {"en": "When do you sleep? At night.", "ico": "night", "zona": "when"},
            {"es": "Recuerda. Si es un lugar, Where. Si es un momento, When."},
        ],
        "yo": [("at school", "school", "where"), ("in the morning", "morning", "when")],
        "juntos": [("at the beach", "beach", "where"), ("on Monday", "monday", "when"), ("at the hospital", "hospital", "where"), ("at 7 o'clock", "seven", "when")],
        "tu": [("at home", "home", "where"), ("in summer", "summer", "when"), ("in the park", "park", "where"),
               ("on my birthday", "birthday", "when"), ("in the castle", "castle", "where"), ("in winter", "winter", "when")],
        "resumen": {"where": [("at the farm", "cow"), ("at school", "school")], "when": [("at night", "night"), ("in the morning", "morning")]},
    },
]

# En Where y When la respuesta es una frase con preposicion (at school, on Monday)
PREPOSICION = ("at ", "in ", "on ")


def item(t):
    texto, ico, zona = t
    return {"en": texto, "ico": ico, "zona": zona}


def construir():
    lecciones = []
    for L in LECCIONES:
        assert set(L["zonas"]) <= set(CODIGO), L["id"]
        vistos = set()
        for paso in ("yo", "juntos", "tu"):
            for texto, ico, zona in L[paso]:
                assert zona in L["zonas"], (L["id"], texto, zona)
                assert ico not in vistos, "%s: el dibujo %s se repite" % (L["id"], ico)
                vistos.add(ico)
        assert len(L["yo"]) == 2 and len(L["juntos"]) >= 4 and len(L["tu"]) >= 6, L["id"]
        for z in L["zonas"]:
            assert sum(1 for x in L["tu"] if x[2] == z) >= 2, "%s: en tu solo faltan ejemplos de %s" % (L["id"], z)
            assert z in L["por"] and z in L["resumen"] and L["resumen"][z], (L["id"], z)
        assert L.get("piensa"), "%s: falta la pregunta para pensar" % L["id"]
        # los dibujos de mira son solo de mira: no vuelven como ejemplo a resolver
        for m in L["mira"]:
            assert m.get("ico") not in vistos, "%s: el dibujo %s de mira se repite en un ejemplo" % (L["id"], m.get("ico"))
            assert "zona" not in m or m["zona"] in L["zonas"], (L["id"], m)
        for paso in ("yo", "juntos", "tu"):
            for texto, ico, zona in L[paso]:
                if zona in ("where", "when"):
                    assert texto.startswith(PREPOSICION), "%s: «%s» debe empezar con at, in u on" % (L["id"], texto)
        lecciones.append({
            "id": L["id"], "unidad": L["unidad"], "titulo": L["titulo"], "en": L["en"], "calco": L["calco"], "escena": L["escena"],
            "zonas": L["zonas"], "por": L["por"], "piensa": L["piensa"], "mira": L["mira"],
            "yo": [item(x) for x in L["yo"]], "juntos": [item(x) for x in L["juntos"]], "tu": [item(x) for x in L["tu"]],
            "resumen": [{"zona": z, "ej": [{"ico": i, "en": texto} for texto, i in L["resumen"][z]]} for z in L["zonas"]],
        })
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
        "modo": "leccion", "id": "y2-english-aprende", "lang": "en-GB", "langExplica": "es-ES", "tema": "y2",
        "mascota": "pip", "mascotaNombre": "Pip", "titulo": "Learn with Pip", "subtitulo": "Aprende inglés con Pip",
        "musica": "alegre", "velocidad": 0.85,
        "unidades": [{"id": "wh", "titulo": "Wh questions", "es": "Preguntas con Wh"}],
        "codigo": CODIGO, "lecciones": construir(),
    }
    js = ("// titulo: Learn with Pip · Year 2 English\n// lang: en\n// usa: aldea\n"
          "/* ============================================================\n"
          "   LEARN WITH PIP — Y2 English para aprender (generado por\n"
          "   tools/gen/guia_y2_english_aprende.py; no se edita a mano).\n"
          "   Pip explica en español; lo que se aprende va en ingles.\n"
          "   ============================================================ */\n"
          "GUIA.iniciar(" + json.dumps(datos, ensure_ascii=False, indent=1) + ");\n")
    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write(js)
    print("guias/y2-english-aprende.js: %d lecciones" % len(datos["lecciones"]))


if __name__ == "__main__":
    main()
