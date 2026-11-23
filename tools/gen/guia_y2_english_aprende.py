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

Leccion 5 (hacer la pregunta) usa la mecanica «fichas»: el niño ve una
respuesta con su dibujo y arma la pregunta con 3 o 4 fichas en orden (la
primera siempre es la Wh). Asserts propios en construir_fichas().

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
    "umbrella":   ("Why is the girl holding an umbrella?", "umbrella", "Because it is raining.", "rain", "¿Por qué la niña tiene una sombrilla?", "Porque está lloviendo."),
    "happy":      ("Why is the boy happy?", "happy", "Because it is his birthday.", "birthday", "¿Por qué está feliz el niño?", "Porque es su cumpleaños."),
    "icecream":   ("Why is the ice cream melting?", "melting", "Because it is hot.", "hot", "¿Por qué se derrite el helado?", "Porque hace calor."),
    "kite":       ("Why is the kite flying?", "kite", "Because it is windy.", "windy", "¿Por qué vuela la cometa?", "Porque hace viento."),
    "coat":       ("Why is the girl wearing a coat?", "coat", "Because it is cold.", "cold", "¿Por qué la niña lleva chaqueta?", "Porque hace frío."),
    "sleeping":   ("Why is the boy sleeping?", "sleeping", "Because it is night-time.", "night", "¿Por qué duerme el niño?", "Porque es de noche."),
    "cheering":   ("Why are the children cheering?", "cheering", "Because they won the cup.", "trophy", "¿Por qué celebran los niños?", "Porque ganaron la copa."),
    "sunglasses": ("Why is the boy wearing sunglasses?", "sunglasses", "Because it is sunny.", "sunny", "¿Por qué el niño lleva gafas de sol?", "Porque hace sol."),
    "baby":       ("Why is the baby crying?", "babycry", "Because he is hungry.", "bottle", "¿Por qué llora el bebé?", "Porque tiene hambre."),
    "snowman":    ("Why is the girl making a snowman?", "snowman", "Because it is snowing.", "snowing", "¿Por qué la niña hace un muñeco de nieve?", "Porque está nevando. La nieve es hielo blandito que cae del cielo cuando hace mucho frío."),
    "plant":      ("Why is the plant growing?", "seedling", "Because it gets sun and rain.", "sunrain", "¿Por qué crece la planta?", "Porque recibe sol y lluvia."),
    "bed":        ("Why is the boy going to bed?", "bed", "Because he is tired.", "yawn", "¿Por qué el niño se va a la cama?", "Porque está cansado."),
    "dog":        ("Why is the dog happy?", "puppy", "Because it has got a bone.", "bone", "¿Por qué está feliz el perro?", "Porque tiene un hueso."),
}
# Para cada pregunta, las OTRAS parejas cuya razon tambien serviria (un niño
# podria defenderla: la chaqueta tambien sirve si nieva). Nunca van en la misma ronda.
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
        {"es": "Tiene una sombrilla porque está lloviendo."},
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

# ---------- Lecciones 4 y 6: responder desde un cuento (mecanica «cuento») ----------
# Un cuento es una escena ilustrada y 3 o 4 frases cortas de Year 2. Tiene UNA
# parte por pregunta (who, what, where, when, why): un dibujo tocable y el
# trozo de texto que responde. Tocar el dibujo o el trozo cuenta igual. Con una
# sola parte por pregunta, ninguna pregunta tiene dos respuestas en el cuento.
# Las personas son genericas (Mia, Sam, Grandpa, Grandma); animales y lugares
# del Caribe colombiano. Twemoji no tiene iguana: el lagarto 1f98e se llama
# «iguana» (verde y de cola larga, como las de los parques de la costa).
# partes: zona -> (trozo exacto del texto, dibujo, x %, y %)
# preguntas: zona -> [(pregunta en ingles, traduccion), variante opcional]
# deco: dibujos de adorno que no se tocan (nunca un lugar, un momento ni una persona)
CUENTOS = {
    "playa": {
        "titulo": "Mia at the beach", "fondo": "playa",
        "frases": ["Mia goes to the beach.", "She goes in the morning.", "She finds a big shell.", "She is happy because she sees a turtle."],
        "partes": {"who": ("Mia", "girl", 20, 68), "where": ("to the beach", "beach", 50, 27), "when": ("in the morning", "morning", 15, 24),
                   "what": ("a big shell", "shell", 49, 76), "why": ("because she sees a turtle", "turtle", 80, 70)},
        "deco": [("palm", 86, 24, 13)],
        "preguntas": {
            "who": [("Who goes to the beach?", "¿Quién va a la playa?"), ("Who finds a big shell?", "¿Quién encuentra una concha grande?", 2, "«She» es Mia. Mia encuentra la concha.")],
            "where": [("Where does Mia go?", "¿A dónde va Mia?"), ("Where does Mia go in the morning?", "¿A dónde va Mia por la mañana?")],
            "when": [("When does Mia go to the beach?", "¿Cuándo va Mia a la playa?")],
            "what": [("What does Mia find?", "¿Qué encuentra Mia?")],
            "why": [("Why is Mia happy?", "¿Por qué está feliz Mia?")],
        },
    },
    "isla": {
        "titulo": "Grandpa and the crabs", "fondo": "isla",
        "frases": ["Grandpa goes to the island.", "He goes at six o'clock.", "He takes a bucket because he wants to look for crabs."],
        "partes": {"who": ("Grandpa", "grandpa", 22, 70), "where": ("to the island", "island", 74, 28), "when": ("at six o'clock", "six", 17, 24),
                   "what": ("a bucket", "bucket", 50, 76), "why": ("because he wants to look for crabs", "crab", 81, 76)},
        "deco": [("dolphin", 44, 38, 11)],
        "preguntas": {
            "who": [("Who goes to the island?", "¿Quién va a la isla?"), ("Who takes a bucket?", "¿Quién lleva un balde?", 2, "«He» es el abuelo. El abuelo lleva el balde.")],
            "where": [("Where does Grandpa go?", "¿A dónde va el abuelo?"), ("Where does Grandpa go at six o'clock?", "¿A dónde va el abuelo a las seis?")],
            "when": [("When does Grandpa go to the island?", "¿Cuándo va el abuelo a la isla?")],
            "what": [("What does Grandpa take?", "¿Qué lleva el abuelo?")],
            "why": [("Why does Grandpa take a bucket?", "¿Por qué lleva el abuelo un balde?")],
        },
    },
    "mercado": {
        "titulo": "Grandma at the market", "fondo": "mercado",
        "frases": ["Grandma goes to the market.", "She goes in the morning.", "She buys some mangoes because she wants to make juice."],
        "partes": {"who": ("Grandma", "grandma", 55, 70), "where": ("to the market", "market", 26, 30), "when": ("in the morning", "morning", 78, 26),
                   "what": ("some mangoes", "mango", 17, 76), "why": ("because she wants to make juice", "juice", 85, 72)},
        "deco": [],
        "preguntas": {
            "who": [("Who goes to the market?", "¿Quién va al mercado?"), ("Who buys some mangoes?", "¿Quién compra mangos?", 2, "«She» es la abuela. La abuela compra los mangos.")],
            "where": [("Where does Grandma go?", "¿A dónde va la abuela?"), ("Where does Grandma go in the morning?", "¿A dónde va la abuela por la mañana?")],
            "when": [("When does Grandma go to the market?", "¿Cuándo va la abuela al mercado?")],
            "what": [("What does Grandma buy?", "¿Qué compra la abuela?")],
            "why": [("Why does Grandma buy some mangoes?", "¿Por qué compra mangos la abuela?")],
        },
    },
    "parque": {
        "titulo": "Sam in the park", "fondo": "parque",
        "frases": ["Sam goes to the park.", "He goes on Sunday.", "He takes a camera because he wants to take a photo of an iguana."],
        "partes": {"who": ("Sam", "boy", 50, 70), "where": ("to the park", "slide", 80, 30), "when": ("on Sunday", "sunday", 18, 25),
                   "what": ("a camera", "camera", 19, 76), "why": ("because he wants to take a photo of an iguana", "iguana", 82, 77)},
        "deco": [("tree", 50, 27, 13)],
        "preguntas": {
            "who": [("Who goes to the park?", "¿Quién va al parque?"), ("Who takes a camera?", "¿Quién lleva una cámara?", 2, "«He» es Sam. Sam lleva la cámara.")],
            "where": [("Where does Sam go?", "¿A dónde va Sam?"), ("Where does Sam go on Sunday?", "¿A dónde va Sam el domingo?")],
            "when": [("When does Sam go to the park?", "¿Cuándo va Sam al parque?")],
            "what": [("What does Sam take?", "¿Qué lleva Sam?")],
            "why": [("Why does Sam take a camera?", "¿Por qué lleva Sam una cámara?")],
        },
    },
}
WH_ES = {"who": "¿Quién", "what": "¿Qué", "where": "¿A dónde", "when": "¿Cuándo", "why": "¿Por qué"}
# lo que un niño podria tomar por otra respuesta: cada cuento tiene UNA persona,
# UN lugar y UN momento (se cuentan en todo el texto, no solo en las partes)
PERSONAS = ("Mia", "Sam", "Tom", "Grandpa", "Grandma", "Mum", "Dad", "teacher", "boy", "girl")
MOMENTOS = ("morning", "afternoon", "evening", "night", "o'clock", "birthday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
            "Saturday", "Sunday", "summer", "winter", "today", "tomorrow")
LUGARES = ("beach", "island", "market", "park", "school", "home", "farm", "sea", "river", "shop", "garden", "tree", "sand", "house")

# preguntas por paso: (cuento, zona, variante)
LECCION_CUENTO = {
    "id": "cuento", "unidad": "wh", "titulo": "Responde con el cuento", "en": "Answer from a story", "calco": "turtle",
    "mecanica": "cuento", "zonas": ["who", "what", "where", "when", "why"], "inicio": "playa",
    "piensa": "Piensa. ¿Qué busca la pregunta? Una persona, una cosa, un lugar, un momento o una razón.",
    "textos": {
        "juntos": "Ahora lo hacemos juntos. Cada respuesta tiene el color de su pregunta. La que brilla es la correcta. Tócala.",
        "tu": "Ahora tú solo. Los colores se van.",
    },
    "mira": [
        {"es": "Hoy vas a escuchar un cuento y a buscar respuestas en él."},
        {"en": "Mia goes to the beach.", "frase": 0}, {"en": "She goes in the morning.", "frase": 1},
        {"en": "She finds a big shell.", "frase": 2}, {"en": "She is happy because she sees a turtle.", "frase": 3},
        {"es": "Ahora vamos a buscar respuestas en el cuento."},
        {"es": "Who busca una persona.", "parte": "who"}, {"es": "What busca una cosa.", "parte": "what"},
        {"es": "Where busca un lugar. Con «go» decimos «to»: «to the beach».", "parte": "where"}, {"es": "When busca un momento.", "parte": "when"},
        {"es": "Why busca una razón, con because.", "parte": "why"},
        {"es": "Pip pregunta y tú tocas la respuesta, en el dibujo o en las palabras."},
    ],
    "yo": [("playa", "who", 0), ("playa", "where", 0)],
    "juntos": [("playa", "what", 0), ("playa", "when", 0), ("playa", "why", 0)],
    "tu": [{"cuento": "playa", "preguntas": [("playa", "who", 1), ("playa", "where", 1), ("playa", "when", 0), ("playa", "what", 0), ("playa", "why", 0)]}],
    "resumen": [("playa", "who", 0), ("playa", "where", 0), ("playa", "why", 0)],
}
LECCION_REPASO = {
    "id": "repaso", "unidad": "wh", "titulo": "Repaso mezclado", "en": "Mixed review", "calco": "iguana",
    "mecanica": "cuento", "zonas": ["who", "what", "where", "when", "why"], "inicio": "isla",
    "piensa": "Piensa. ¿Qué busca la pregunta? Una persona, una cosa, un lugar, un momento o una razón.",
    "textos": {
        "juntos": "Ahora lo hacemos juntos. Cada respuesta tiene el color de su pregunta. La que brilla es la correcta. Tócala.",
        "tu": "Ahora tú solo, con cuentos nuevos. Los colores se van.",
    },
    "mira": [
        {"es": "Hoy repasamos las cinco preguntas: Who, What, Where, When y Why."},
        {"es": "Escucha el cuento."},
        {"en": "Grandpa goes to the island.", "frase": 0}, {"en": "He goes at six o'clock.", "frase": 1},
        {"en": "He takes a bucket because he wants to look for crabs.", "frase": 2},
        {"es": "Recuerda. Who, una persona. What, una cosa. Where, un lugar. When, un momento. Why, una razón."},
        {"es": "Pip pregunta y tú tocas la respuesta, en el dibujo o en las palabras."},
    ],
    "yo": [("isla", "who", 0), ("isla", "where", 0)],
    "juntos": [("isla", "what", 0), ("isla", "when", 0), ("isla", "why", 0)],
    "tu": [{"cuento": c, "preguntas": [(c, z, 0) for z in ("who", "what", "where", "when", "why")]} for c in ("mercado", "parque")],
    "resumen": [("isla", "who", 0), ("mercado", "what", 0), ("parque", "where", 0), ("isla", "when", 0), ("mercado", "why", 0)],
}

# ---------- Leccion 5: hacer la pregunta (mecanica «fichas») ----------
# El niño ve una RESPUESTA con su dibujo y arma la PREGUNTA con fichas en
# orden. Todas siguen el mismo molde de Year 2: palabra Wh + is + el resto,
# para que haya una sola forma correcta de ordenarlas. La ultima ficha lleva
# el signo de pregunta. Nombres genericos (Mia, Sam, Grandma, Grandpa).
# id -> (zona, fichas, respuesta, dibujo de la respuesta, pregunta en español, respuesta en español)
PREGUNTAS = {
    "perro":    ("where", ["Where", "is", "the dog?"], "In the park.", "slide", "¿Dónde está el perro?", "En el parque."),
    "puerta":   ("who", ["Who", "is", "at", "the door?"], "Grandma.", "grandma", "¿Quién está en la puerta?", "La abuela."),
    "caja":     ("what", ["What", "is", "in", "the box?"], "A ball.", "ball", "¿Qué hay en la caja?", "Una pelota."),
    "fiesta":   ("when", ["When", "is", "the party?"], "On Saturday.", "saturday", "¿Cuándo es la fiesta?", "El sábado."),
    "mojado":   ("why", ["Why", "is", "the boy", "wet?"], "Because it is raining.", "rain", "¿Por qué está mojado el niño?", "Porque está lloviendo."),
    "gato":     ("where", ["Where", "is", "the cat?"], "On the bed.", "bed", "¿Dónde está el gato?", "En la cama."),
    "cocina":   ("who", ["Who", "is", "in", "the kitchen?"], "The cook.", "baker", "¿Quién está en la cocina?", "El cocinero."),
    "bici":     ("who", ["Who", "is", "on", "the bike?"], "Sam.", "biker", "¿Quién va en la bicicleta?", "Sam."),
    "comiendo": ("what", ["What", "is", "Mia", "eating?"], "An apple.", "apple", "¿Qué está comiendo Mia?", "Una manzana."),
    "abuelo":   ("where", ["Where", "is", "Grandpa?"], "At the beach.", "beach", "¿Dónde está el abuelo?", "En la playa."),
    "desayuno": ("when", ["When", "is", "breakfast?"], "In the morning.", "morning", "¿Cuándo es el desayuno?", "Por la mañana.", "El sol sale. Es la mañana."),
    "frio":     ("why", ["Why", "is", "the girl", "cold?"], "Because it is snowing.", "snowing", "¿Por qué tiene frío la niña?", "Porque está nevando.", "La nieve es hielo blandito que cae del cielo cuando hace mucho frío."),
}
WH_PREGUNTA_ES = {"who": "¿Quién ", "what": "¿Qué ", "where": "¿Dónde ", "when": "¿Cuándo ", "why": "¿Por qué "}

LECCION_FICHAS = {
    "id": "pregunta", "unidad": "wh", "titulo": "Arma la pregunta", "en": "Make the question", "calco": "parrot",
    "mecanica": "fichas", "zonas": ["who", "what", "where", "when", "why"],
    "piensa": "Piensa. En estas preguntas va primero la palabra que pregunta y después «is».",
    "textos": {
        "juntos": "Ahora lo hacemos juntos. La ficha que brilla es la siguiente. Arrástrala al hueco o tócala.",
        "tu": "Ahora tú solo. Mira la respuesta y arma la pregunta.",
    },
    "mira": [
        {"es": "Hoy vas a armar preguntas en inglés."},
        {"es": "Estas preguntas en inglés empiezan con la palabra que pregunta: Who, What, Where, When o Why."},
        {"es": "Mira. Esta es la respuesta. Las fichas se ponen solas."},
    ],
    "modelos": ["perro", "puerta"],
    "cierre": [{"es": "Recuerda. En estas preguntas va primero la palabra que pregunta, después «is», y al final la ficha con el signo de pregunta. En inglés el signo solo va al final."}],
    "yo": ["caja", "fiesta"],
    "juntos": ["mojado", "gato", "cocina"],
    "tu": ["bici", "comiendo", "abuelo", "desayuno", "frio"],
    "resumen": ["perro", "puerta", "mojado"],
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
    codigo = dict(IT.ICONOS); codigo.update({c: v[0] + "+" + c for c, v in IT.COMPUESTOS.items()}); codigo.update({c: v[0] + "-" + c for c, v in IT.MODIFICADOS.items()}); codigo.update({c: v[0] + "~" + c for c, v in IT.RECOLOR.items()})
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


def cuento(cid):
    """Valida un cuento y lo arma: frases partidas en trozos [texto, zona|null]."""
    import iconos_twemoji as IT
    C = CUENTOS[cid]
    banco = set(IT.ICONOS) | set(IT.PROPIOS) | set(IT.MODIFICADOS) | set(IT.COMPUESTOS) | set(IT.RECOLOR)
    texto = " ".join(C["frases"])
    assert 3 <= len(C["frases"]) <= 4, "%s: 3 o 4 frases" % cid
    for f in C["frases"]:
        assert f[0].isupper() and f.endswith(".") and len(f.split()) <= 14, "%s: frase corta de Year 2: «%s»" % (cid, f)
    assert set(C["partes"]) == set(CODIGO), "%s: una parte por cada pregunta (who, what, where, when, why)" % cid
    spans = []
    for z, (trozo, ico, x, y) in C["partes"].items():
        assert texto.count(trozo) == 1, "%s: «%s» debe salir una sola vez en el cuento" % (cid, trozo)
        assert ico in banco, "%s: el dibujo %s no esta en el banco" % (cid, ico)
        assert 8 <= x <= 92 and 15 <= y <= 85, "%s: %s fuera de la escena" % (cid, z)
        i = texto.index(trozo); spans.append((i, i + len(trozo), z))
    spans.sort()
    for a, b in zip(spans, spans[1:]):
        assert a[1] <= b[0], "%s: los trozos %s y %s se pisan" % (cid, a[2], b[2])
    p = C["partes"]
    assert p["who"][0] in PERSONAS, "%s: who es una persona" % cid
    assert p["what"][0].startswith(("a ", "an ", "some ")), "%s: what es una cosa (a, an, some)" % cid
    assert p["where"][0].startswith(("to ", "at ", "in ", "on ")), "%s: where empieza con to, at, in u on" % cid
    assert p["when"][0].startswith(PREPOSICION), "%s: when empieza con at, in u on" % cid
    assert p["why"][0].startswith("because "), "%s: why empieza con because" % cid
    # sin ambiguedad: una sola persona, un solo lugar y un solo momento en todo el texto
    import re
    palabras = re.findall(r"[A-Za-z']+", texto)
    assert len({w for w in palabras if w in PERSONAS}) == 1, "%s: el cuento nombra mas de una persona" % cid
    assert sum(1 for w in palabras if w in MOMENTOS) == 1, "%s: el cuento tiene mas de un momento" % cid
    assert sum(1 for w in palabras if w in LUGARES) == 1, "%s: el cuento tiene mas de un lugar" % cid
    # los dibujos no se repiten y el adorno nunca es una parte
    dib = [v[1] for v in p.values()]
    assert len(set(dib)) == 5, cid
    for ico, x, y, s in C["deco"]:
        assert ico in banco and ico not in dib, "%s: adorno %s" % (cid, ico)
    for z, lista in C["preguntas"].items():
        assert z in CODIGO and 1 <= len(lista) <= 2, (cid, z)
        for en, es, *extra in lista:
            assert en.split()[0] == CODIGO[z]["t"] and en.endswith("?"), "%s: «%s» debe empezar con %s" % (cid, en, CODIGO[z]["t"])
            if extra:
                # la pregunta usa lo que dice OTRA frase, con un pronombre (She finds a big shell):
                # Pip lee esa frase y la nota en español dice a quien se refiere el pronombre
                fi, nota = extra
                f = C["frases"][fi]
                assert f.split()[0] in ("She", "He") and " ".join(en.rstrip("?").split()[1:]) in f, "%s: «%s» no sale de la frase %d" % (cid, en, fi)
                assert nota.startswith("«" + f.split()[0] + "» es ") and nota.endswith("."), "%s: la nota de «%s» dice a quien se refiere %s" % (cid, en, f.split()[0])
            assert es.startswith(WH_ES[z]) and es.endswith("?"), "%s: «%s» debe empezar con %s" % (cid, es, WH_ES[z])
            assert p[z][0].lower() not in en.lower(), "%s: la pregunta «%s» trae su respuesta" % (cid, en)
    frases, base = [], 0
    for f in C["frases"]:
        trozos, i = [], 0
        for a, b, z in spans:
            if a >= base and b <= base + len(f):
                if a - base > i:
                    trozos.append([f[i:a - base], None])
                trozos.append([f[a - base:b - base], z]); i = b - base
            else:
                assert b <= base or a >= base + len(f), "%s: un trozo cruza dos frases" % cid
        if i < len(f):
            trozos.append([f[i:], None])
        assert "".join(t for t, _ in trozos) == f
        frases.append(trozos); base += len(f) + 1
    return {"id": cid, "titulo": C["titulo"], "fondo": C["fondo"], "frases": frases,
            "partes": [{"zona": z, "txt": t, "ico": i, "x": x, "y": y} for z, (t, i, x, y) in C["partes"].items()],
            "deco": [{"ico": i, "x": x, "y": y, "s": s} for i, x, y, s in C["deco"]]}


def pregunta(cid, z, v):
    C = CUENTOS[cid]
    en, es, *extra = C["preguntas"][z][v]
    trozo, ico = C["partes"][z][:2]
    frase = next(i for i, f in enumerate(C["frases"]) if trozo in f)
    d = {"id": "%s:%s:%d" % (cid, z, v), "cuento": cid, "zona": z, "en": en, "es": es, "resp": trozo, "ico": ico}
    if extra:
        # pronombre: Pip lee la frase de la que sale la pregunta y dice la nota
        frase, d["nota"] = extra
    d["frase"] = frase; d["dice"] = C["frases"][frase]
    return d


def construir_cuento(L):
    """Valida y arma una leccion de mecanica «cuento» (lecciones 4 y 6)."""
    k = L["id"]
    assert L["zonas"] == list(CODIGO), k
    ids = {L["inicio"]} | {q[0] for q in L["yo"] + L["juntos"]} | {r["cuento"] for r in L["tu"]}
    cuentos = {c: cuento(c) for c in sorted(ids)}
    for q in L["yo"] + L["juntos"] + L["resumen"] + [q for r in L["tu"] for q in r["preguntas"]]:
        assert q[0] in CUENTOS and q[2] < len(CUENTOS[q[0]]["preguntas"][q[1]]), (k, q)
    assert len(L["yo"]) >= 2 and len(L["juntos"]) >= 3, "%s: 2 en yo y 3 en juntos" % k
    assert all(q[0] == L["inicio"] for q in L["yo"] + L["juntos"]), "%s: yo y juntos usan el cuento de mira" % k
    for r in L["tu"]:
        assert all(q[0] == r["cuento"] for q in r["preguntas"]), (k, r["cuento"])
        assert {q[1] for q in r["preguntas"]} == set(CODIGO) and len(r["preguntas"]) == 5, "%s: tu solo pregunta las cinco en %s" % (k, r["cuento"])
    assert len({r["cuento"] for r in L["tu"]}) == len(L["tu"]), "%s: un cuento por ronda" % k
    # mira: las frases que se leen son las del cuento, en orden, y las partes existen
    fr = [m for m in L["mira"] if "frase" in m]
    assert [m["en"] for m in fr] == CUENTOS[L["inicio"]]["frases"] and [m["frase"] for m in fr] == list(range(len(fr))), "%s: mira lee el cuento entero" % k
    assert all(m.get("parte", "who") in CODIGO for m in L["mira"]), k
    # dibujos: dentro de la leccion ninguno se repite entre cuentos (ni la clave ni el dibujo)
    import iconos_twemoji as IT
    codigo = dict(IT.ICONOS); codigo.update({c: v[0] + "+" + c for c, v in IT.COMPUESTOS.items()}); codigo.update({c: v[0] + "-" + c for c, v in IT.MODIFICADOS.items()}); codigo.update({c: v[0] + "~" + c for c, v in IT.RECOLOR.items()})
    dib = [p["ico"] for c in cuentos.values() for p in c["partes"]]
    assert len({codigo.get(d, d) for d in dib}) == len(dib), "%s: un dibujo se repite entre cuentos" % k
    assert L["calco"] in codigo or L["calco"] in IT.PROPIOS, k
    # lo que le costo vuelve mas: cada ronda de tu solo trae una pregunta de repuesto por zona
    tu = []
    for r in L["tu"]:
        pre = CUENTOS[r["cuento"]]["preguntas"]
        extra = {z: pregunta(r["cuento"], z, len(pre[z]) - 1) for z in CODIGO}
        tu.append({"cuento": r["cuento"], "preguntas": [pregunta(*q) for q in r["preguntas"]], "extra": extra})
    return {
        "id": k, "unidad": L["unidad"], "titulo": L["titulo"], "en": L["en"], "calco": L["calco"], "mecanica": "cuento",
        "zonas": L["zonas"], "piensa": L["piensa"], "textos": L["textos"], "mira": L["mira"], "inicio": L["inicio"], "cuentos": cuentos,
        "yo": [pregunta(*q) for q in L["yo"]], "juntos": [pregunta(*q) for q in L["juntos"]], "tu": tu,
        "resumen": [pregunta(*q) for q in L["resumen"]],
    }


def ficha(pid):
    # (zona, fichas, respuesta, dibujo, pregunta es, respuesta es[, nota]): la nota
    # es lo que Pip aclara del dibujo (p. ej. que el sol sobre el mar es la mañana)
    zona, fichas, resp, ico, es, es_resp = PREGUNTAS[pid][:6]
    d = {"id": pid, "zona": zona, "fichas": fichas, "en": " ".join(fichas), "resp": resp, "ico": ico, "es": es, "esResp": es_resp}
    if len(PREGUNTAS[pid]) > 6:
        d["nota"] = PREGUNTAS[pid][6]
    return d


def construir_fichas(L):
    """Valida y arma una leccion de mecanica «fichas» (leccion 5, hacer la pregunta)."""
    import iconos_twemoji as IT, re
    k = L["id"]
    whs = {c["t"] for c in CODIGO.values()}
    for pid, (zona, fichas, resp, ico, es, es_resp, *_) in PREGUNTAS.items():
        q = " ".join(fichas)
        assert zona in CODIGO, (k, pid)
        assert 3 <= len(fichas) <= 4, "%s: %s debe tener 3 o 4 fichas" % (k, pid)
        # la primera ficha es la palabra Wh de su zona y ninguna otra ficha es una Wh
        assert fichas[0] == CODIGO[zona]["t"], "%s: «%s» debe empezar con %s" % (k, q, CODIGO[zona]["t"])
        assert not any(f.rstrip("?") in whs for f in fichas[1:]), "%s: «%s» tiene dos palabras Wh" % (k, q)
        # molde unico de Year 2: Wh + is + el resto; solo la ultima ficha lleva ?
        assert fichas[1] == "is", "%s: en «%s» la segunda ficha es is" % (k, q)
        assert all(f.endswith("?") == (i == len(fichas) - 1) for i, f in enumerate(fichas)) and q.count("?") == 1, "%s: solo la ultima ficha lleva ?: %s" % (k, fichas)
        assert len(set(f.lower() for f in fichas)) == len(fichas), "%s: fichas repetidas en %s (dos ordenes posibles)" % (k, fichas)
        assert all(f.strip() == f and f for f in fichas) and len(q.split()) <= 6, "%s: pregunta corta: «%s»" % (k, q)
        # las fichas unidas forman la pregunta
        assert ficha(pid)["en"] == q and q == "%s?" % q[:-1], (k, pid)
        # respuesta coherente con su pregunta
        assert resp[0].isupper() and resp.endswith(".") and len(resp.split()) <= 5, "%s: respuesta corta: «%s»" % (k, resp)
        if zona in ("where", "when"):
            assert resp.lower().startswith(PREPOSICION), "%s: «%s» debe empezar con at, in u on" % (k, resp)
        if zona == "why":
            assert resp.startswith("Because "), "%s: «%s» debe empezar con Because" % (k, resp)
        if zona in ("who", "what"):
            assert not resp.lower().startswith(PREPOSICION) and not resp.startswith("Because"), "%s: %s responde con una persona o una cosa" % (k, pid)
        if zona == "what":
            assert resp.startswith(("A ", "An ", "Some ")), "%s: what es una cosa (a, an, some)" % k
        palabras_q = set(re.findall(r"[a-z']+", q.lower())) - {"the", "a", "an", "is", "it", "at", "in", "on"}
        assert not palabras_q & set(re.findall(r"[a-z']+", resp.lower())), "%s: la respuesta «%s» repite la pregunta «%s»" % (k, resp, q)
        assert es.startswith(WH_PREGUNTA_ES[zona]) and es.endswith("?") and es_resp.endswith("."), "%s: traduccion de %s" % (k, pid)
    pasos = [L["modelos"], L["yo"], L["juntos"], L["tu"]]
    usadas = [pid for r in pasos for pid in r]
    assert len(usadas) == len(set(usadas)), "%s: una pregunta sale dos veces" % k
    assert set(usadas) == set(PREGUNTAS), "%s: preguntas sin usar: %s" % (k, set(PREGUNTAS) - set(usadas))
    assert 1 <= len(L["modelos"]) <= 2 and len(L["yo"]) == 2 and len(L["juntos"]) == 3 and len(L["tu"]) == 5, "%s: 1 o 2 en mira, 2 en yo, 3 en juntos y 5 en tu" % k
    assert sorted(PREGUNTAS[p][0] for p in L["tu"]) == sorted(CODIGO), "%s: tu solo cubre Who, What, Where, When y Why" % k
    assert len(L["resumen"]) == 3 and set(L["resumen"]) <= set(usadas), k
    # dibujos: existen en el banco y no se repiten (ni la clave ni el dibujo)
    codigo = dict(IT.ICONOS); codigo.update({c: v[0] + "+" + c for c, v in IT.COMPUESTOS.items()}); codigo.update({c: v[0] + "-" + c for c, v in IT.MODIFICADOS.items()}); codigo.update({c: v[0] + "~" + c for c, v in IT.RECOLOR.items()})
    dib = [PREGUNTAS[p][3] for p in usadas]
    for d in dib + [L["calco"]]:
        assert d in codigo or d in IT.PROPIOS, "%s: el dibujo %s no esta en el banco" % (k, d)
    assert len({codigo.get(d, d) for d in dib}) == len(dib), "%s: un dibujo se repite" % k
    assert L.get("piensa") and L["textos"].get("juntos") and L["textos"].get("tu"), k
    return {
        "id": k, "unidad": L["unidad"], "titulo": L["titulo"], "en": L["en"], "calco": L["calco"], "mecanica": "fichas",
        "zonas": L["zonas"], "piensa": L["piensa"], "textos": L["textos"], "mira": L["mira"], "cierre": L["cierre"],
        "modelos": [ficha(p) for p in L["modelos"]], "yo": [ficha(p) for p in L["yo"]], "juntos": [ficha(p) for p in L["juntos"]],
        "tu": [ficha(p) for p in L["tu"]], "resumen": [ficha(p) for p in L["resumen"]],
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
    for L in (LECCION_CUENTO, LECCION_REPASO):
        usados.add(L["calco"])
        cids = {L["inicio"]} | {q[0] for q in L["yo"] + L["juntos"] + L["resumen"]} | {r["cuento"] for r in L["tu"]}
        for c in cids:
            usados |= {v[1] for v in CUENTOS[c]["partes"].values()} | {d[0] for d in CUENTOS[c]["deco"]}
    L = LECCION_FICHAS
    usados.add(L["calco"])
    for r in (L["modelos"], L["yo"], L["juntos"], L["tu"], L["resumen"]):
        usados |= {PREGUNTAS[pid][3] for pid in r}
    return usados


def main():
    datos = {
        "modo": "leccion", "id": "y2-english-aprende", "lang": "en-GB", "langExplica": "es-ES", "tema": "y2",
        "mascota": "pip", "mascotaNombre": "Pip", "titulo": "Learn with Pip", "subtitulo": "Aprende inglés con Pip",
        "musica": "alegre", "velocidad": 0.85,
        "unidades": [{"id": "wh", "titulo": "Wh questions", "es": "Preguntas con Wh"}],
        "codigo": CODIGO,
        # orden del plan: 1 who-what, 2 where-when, 3 why, 4 cuento, 5 hacer la pregunta, 6 repaso
        "lecciones": construir() + [construir_parejas(LECCION_PAREJAS), construir_cuento(LECCION_CUENTO), construir_fichas(LECCION_FICHAS), construir_cuento(LECCION_REPASO)],
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
