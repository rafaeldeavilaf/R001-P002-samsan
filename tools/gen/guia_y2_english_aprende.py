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

Leccion 3 (Why y because) usa la mecanica «parejas»: el globo es una pregunta
Why con el dibujo de la SITUACION y las casas son tarjetas de RAZON con
«Because ...» y su dibujo. El niño une cada pregunta con su razon. Se juega en
rondas de 3 tarjetas; asserts propios en construir_parejas().

Uso:  python3 tools/gen/guia_y2_english_aprende.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
            {"en": "Where is the cow? On the farm.", "ico": "cow", "zona": "where"},
            {"es": "When sirve para preguntar por un momento, cuándo pasa algo.", "zona": "when"},
            {"en": "When do you sleep? At night.", "ico": "night", "zona": "when"},
            {"es": "Recuerda. Si es un lugar, Where. Si es un momento, When."},
        ],
        "yo": [("at school", "escuela", "where"), ("in the morning", "morning", "when", "El sol sale. Es la mañana.")],
        "juntos": [("at the beach", "beach", "where"), ("on Monday", "monday", "when"), ("at the hospital", "hospital", "where"), ("at 7 o'clock", "seven", "when")],
        "tu": [("at home", "home", "where"), ("in summer", "summer", "when", "Es el verano, una época del año."), ("in the park", "slide", "where"),
               ("on my birthday", "birthday", "when"), ("in the castle", "castle", "where"), ("in winter", "winter", "when", "Es el invierno, la época del frío y la nieve.")],
        "resumen": {"where": [("at school", "escuela"), ("at the beach", "beach")], "when": [("at night", "night"), ("in the morning", "morning")]},
    },
]

# ---------- Leccion 3: Why y because (mecanica «parejas») ----------
# id -> (pregunta Why, dibujo de la situacion, razon Because, dibujo de la razon,
#        pregunta en español, razon en español). El globo muestra la SITUACION
# (lo que se ve) y la tarjeta la RAZON (por que pasa). Nada que asuste: el bebe
# llora porque tiene hambre, nadie se lastima.
PAREJAS = {
    "umbrella":   ("Why is the girl holding an umbrella?", "umbrella", "Because it is raining.", "rain", "¿Por qué la niña tiene un paraguas?", "Porque está lloviendo."),
    "happy":      ("Why is the boy happy?", "happy", "Because it is his birthday.", "birthday", "¿Por qué está feliz el niño?", "Porque es su cumpleaños."),
    "icecream":   ("Why is the ice cream melting?", "melting", "Because it is hot.", "hot", "¿Por qué se derrite el helado?", "Porque hace calor."),
    "kite":       ("Why is the kite flying?", "kite", "Because it is windy.", "windy", "¿Por qué vuela la cometa?", "Porque hace viento."),
    "coat":       ("Why is the girl wearing a coat?", "coat", "Because it is cold.", "cold", "¿Por qué la niña lleva abrigo?", "Porque hace frío."),
    "sleeping":   ("Why is the boy sleeping?", "sleeping", "Because it is night-time.", "night", "¿Por qué duerme el niño?", "Porque es de noche."),
    "cheering":   ("Why are the children cheering?", "cheering", "Because they won the cup.", "trophy", "¿Por qué celebran los niños?", "Porque ganaron la copa."),
    "sunglasses": ("Why is the boy wearing sunglasses?", "sunglasses", "Because it is sunny.", "sunny", "¿Por qué el niño lleva gafas de sol?", "Porque hace sol."),
    "baby":       ("Why is the baby crying?", "babycry", "Because he is hungry.", "bottle", "¿Por qué llora el bebé?", "Porque tiene hambre."),
    "snowman":    ("Why is the girl making a snowman?", "snowman", "Because it is snowing.", "snowing", "¿Por qué la niña hace un muñeco de nieve?", "Porque está nevando."),
    "plant":      ("Why is the plant growing?", "seedling", "Because it gets sun and rain.", "sunrain", "¿Por qué crece la planta?", "Porque recibe sol y lluvia."),
    "bed":        ("Why is the boy going to bed?", "bed", "Because he is tired.", "yawn", "¿Por qué el niño se va a la cama?", "Porque está cansado."),
    "dog":        ("Why is the dog happy?", "puppy", "Because it has got a bone.", "bone", "¿Por qué está feliz el perro?", "Porque tiene un hueso."),
}
# Para cada pregunta, las OTRAS parejas cuya razon tambien serviria (un niño
# podria defenderla: el abrigo tambien sirve si nieva). Nunca van en la misma ronda.
TAMBIEN = {
    "umbrella": {"sunglasses", "snowman"}, "coat": {"snowman", "kite", "umbrella"}, "icecream": {"sunglasses"},
    "sunglasses": {"icecream"}, "kite": {"sunglasses"}, "sleeping": {"bed"}, "bed": {"sleeping"}, "baby": {"bed"},
    "snowman": {"coat"}, "plant": {"umbrella", "sunglasses"}, "happy": {"cheering", "dog"}, "cheering": {"happy"}, "dog": {"happy"},
}

LECCION_PAREJAS = {
    "id": "why-because", "unidad": "wh", "titulo": "Why y because", "en": "Why and because", "calco": "umbrella",
    "mecanica": "parejas", "escena": "habitat", "zonas": ["why"],
    "piensa": "Piensa. ¿Por qué pasa esto? Busca la razón.",
    "textos": {
        "juntos": "Ahora lo hacemos juntos. La razón que brilla es la correcta. Lleva el globo a su razón.",
        "otra": "¡Muy bien! Ahora tres razones nuevas.",
    },
    # Mira: Pip explica con dos modelos; sus tarjetas son las de «modelos»
    "modelos": ["umbrella", "happy"],
    "mira": [
        {"es": "Hoy vas a aprender a preguntar por qué en inglés."},
        {"es": "Why sirve para preguntar por una razón, por qué pasa algo."},
        {"es": "La respuesta empieza con because, que quiere decir porque."},
        {"en": "Why is the girl holding an umbrella?", "ico": "umbrella"},
        {"en": "Because it is raining.", "zona": "rain"},
        {"es": "Tiene un paraguas porque está lloviendo."},
        {"en": "Why is the boy happy?", "ico": "happy"},
        {"en": "Because it is his birthday.", "zona": "birthday"},
        {"es": "Está feliz porque es su cumpleaños."},
        {"es": "Recuerda. Why pregunta por qué. La respuesta empieza con because."},
    ],
    "yo": ["icecream", "kite"],
    "juntos": [["coat", "sleeping", "cheering"]],
    "tu": [["sunglasses", "baby", "snowman"], ["plant", "bed", "dog"]],
    "resumen": ["umbrella", "happy", "kite"],
}

# En Where y When la respuesta es una frase con preposicion (at school, on Monday)
PREPOSICION = ("at ", "in ", "on ")


def item(t):
    # (texto, dibujo, casa[, nota]): la nota es lo que Pip dice de ese ejemplo
    # en vez del «por» general de la casa (p. ej. aclarar que summer es una epoca).
    texto, ico, zona = t[:3]
    d = {"en": texto, "ico": ico, "zona": zona}
    if len(t) > 3:
        d["nota"] = t[3]
    return d


def construir():
    lecciones = []
    for L in LECCIONES:
        assert set(L["zonas"]) <= set(CODIGO), L["id"]
        vistos = set()
        for paso in ("yo", "juntos", "tu"):
            for texto, ico, zona, *_ in L[paso]:
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
            for texto, ico, zona, *_ in L[paso]:
                if zona in ("where", "when"):
                    assert texto.startswith(PREPOSICION), "%s: «%s» debe empezar con at, in u on" % (L["id"], texto)
        lecciones.append({
            "id": L["id"], "unidad": L["unidad"], "titulo": L["titulo"], "en": L["en"], "calco": L["calco"], "escena": L["escena"],
            "zonas": L["zonas"], "por": L["por"], "piensa": L["piensa"], "mira": L["mira"],
            "yo": [item(x) for x in L["yo"]], "juntos": [item(x) for x in L["juntos"]], "tu": [item(x) for x in L["tu"]],
            "resumen": [{"zona": z, "ej": [{"ico": i, "en": texto} for texto, i in L["resumen"][z]]} for z in L["zonas"]],
        })
    return lecciones


def pareja(pid):
    en, ico, razon, ico_razon, es, es_razon = PAREJAS[pid]
    return {"id": pid, "en": en, "ico": ico, "razon": razon, "icoRazon": ico_razon, "es": es, "esRazon": es_razon, "zona": ico_razon}


def construir_parejas(L):
    """Valida y arma una leccion de mecanica «parejas» (Why y because)."""
    k = L["id"]
    for pid, (en, ico, razon, ico_razon, es, es_razon) in PAREJAS.items():
        assert en.startswith("Why ") and en.endswith("?"), "%s: «%s» debe empezar con Why y terminar en ?" % (k, en)
        assert razon.startswith("Because ") and razon.endswith("."), "%s: «%s» debe empezar con Because" % (k, razon)
        assert es.startswith("¿Por qué ") and es_razon.startswith("Porque "), (k, pid)
    rondas = [L["modelos"], L["yo"]] + L["juntos"] + L["tu"]
    usadas = [pid for r in rondas for pid in r]
    assert len(usadas) == len(set(usadas)), "%s: una pareja sale dos veces" % k
    # dibujos: existen en el banco y no se repiten (ni la clave ni el dibujo)
    import iconos_twemoji as IT
    codigo = dict(IT.ICONOS); codigo.update({c: v[0] + "+" + c for c, v in IT.COMPUESTOS.items()}); codigo.update({c: v[0] + "-" + c for c, v in IT.MODIFICADOS.items()})
    dibujos = [d for pid in usadas for d in (PAREJAS[pid][1], PAREJAS[pid][3])]
    for d in dibujos:
        assert d in codigo or d in IT.PROPIOS, "%s: el dibujo %s no esta en el banco" % (k, d)
    assert len(set(dibujos)) == len(dibujos), "%s: un dibujo se repite" % k
    assert len({codigo.get(d, d) for d in dibujos}) == len(dibujos), "%s: dos claves con el mismo dibujo" % k
    # en cada ronda: razones distintas y ninguna razon sirve para dos preguntas
    for r in rondas:
        razones = {PAREJAS[pid][3] for pid in r}
        assert len(razones) == len(r) and len({PAREJAS[pid][2] for pid in r}) == len(r), "%s: razones repetidas en %s" % (k, r)
        for pid in r:
            choca = TAMBIEN.get(pid, set()) & set(r)
            assert not choca, "%s: en la ronda %s la pregunta %s tambien serviria con %s" % (k, r, pid, sorted(choca))
    assert len(L["yo"]) == 2 and len(L["modelos"]) == 2, k
    assert len(L["juntos"]) == 1 and all(len(r) == 3 for r in L["juntos"]), "%s: juntos es 1 ronda de 3" % k
    assert len(L["tu"]) == 2 and all(len(r) == 3 for r in L["tu"]), "%s: tu solo son 2 rondas de 3" % k
    assert set(L["resumen"]) <= set(usadas) and len(L["resumen"]) == 3, k
    # mira: los modelos se dicen y sus razones brillan en su tarjeta
    modelos = {PAREJAS[pid][3] for pid in L["modelos"]}
    for m in L["mira"]:
        assert "zona" not in m or m["zona"] in modelos, (k, m)
        assert "ico" not in m or m["ico"] in {PAREJAS[pid][1] for pid in L["modelos"]}, (k, m)
    for pid in L["modelos"]:
        assert {"en": PAREJAS[pid][0], "ico": PAREJAS[pid][1]} in L["mira"] and {"en": PAREJAS[pid][2], "zona": PAREJAS[pid][3]} in L["mira"], (k, pid)
    assert L["calco"] in codigo and L.get("piensa"), k
    return {
        "id": k, "unidad": L["unidad"], "titulo": L["titulo"], "en": L["en"], "calco": L["calco"], "escena": L["escena"],
        "mecanica": "parejas", "zonas": L["zonas"], "piensa": L["piensa"], "textos": L["textos"], "mira": L["mira"],
        "modelos": [pareja(p) for p in L["modelos"]], "yo": [pareja(p) for p in L["yo"]],
        "juntos": [[pareja(p) for p in r] for r in L["juntos"]], "tu": [[pareja(p) for p in r] for r in L["tu"]],
        "resumen": [pareja(p) for p in L["resumen"]],
    }


def iconos_usados():
    usados = {c["ico"] for c in CODIGO.values()}
    for L in LECCIONES:
        usados.add(L["calco"])
        for paso in ("yo", "juntos", "tu"):
            usados |= {x[1] for x in L[paso]}
        usados |= {m["ico"] for m in L["mira"] if "ico" in m}
        for z in L["resumen"].values():
            usados |= {i for _, i in z}
    L = LECCION_PAREJAS
    usados.add(L["calco"])
    for r in [L["modelos"], L["yo"]] + L["juntos"] + L["tu"]:
        for pid in r:
            usados |= {PAREJAS[pid][1], PAREJAS[pid][3]}
    return usados


def main():
    datos = {
        "modo": "leccion", "id": "y2-english-aprende", "lang": "en-GB", "langExplica": "es-ES", "tema": "y2",
        "mascota": "pip", "mascotaNombre": "Pip", "titulo": "Learn with Pip", "subtitulo": "Aprende inglés con Pip",
        "musica": "alegre", "velocidad": 0.85,
        "unidades": [{"id": "wh", "titulo": "Wh questions", "es": "Preguntas con Wh"}],
        "codigo": CODIGO, "lecciones": construir() + [construir_parejas(LECCION_PAREJAS)],
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
