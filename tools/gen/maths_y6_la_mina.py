#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del tema Maths Y6 "La Mina" (docs/temas/maths-y6-la-mina.md).

Bioma Caverna. El nivel del suelo es el cero: bajo tierra es negativo y el
castillete del pozo sube en positivo. Sin temperatura (decision de Rafael,
28 sep 2026). Cada item es una mision: el dato llega en numeros y el mundo
ejecuta la respuesta (se abre una compuerta de cristal o no).

Todo numero sale de aqui con aritmetica exacta y cada variante declara su
solucion; `CHECKS` es la misma regla que aplica la escena.

Niveles 1 (The Lift) y 2 (The Deep Galleries), escena `line`. Los niveles
3 a 5 llegan con `fill` y la regla `ecuacion` de `forge`.

Salida: temas/maths/y6-la-mina/data.js
"""
import os, sys, random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from samsan_gen import Tema, familia, escribir, opciones, num, con_signo, suma, MENOS  # noqa: E402

rng = random.Random(20260928)
NV = 6                       # variantes por familia
NB = " "                # "6 m" nunca se parte
R = rng.randint


def met(n):
    return num(n) + NB + "m"


def redondeo10(n):
    """A la decena mas cercana; los 5 van hacia arriba (hacia +)."""
    return int((n + 5) // 10 * 10)


# ---------------------------------------------------------------- escena line
LIFT = {"piel": "montacargas", "unidad": "m", "min": -30, "max": 10}


def linea(inicio, cambio, faltante, modo, **extra):
    L = dict(LIFT)
    L.update({"inicio": inicio, "cambio": cambio, "final": inicio + cambio, "faltante": faltante, "modo": modo})
    L.update(extra)
    return L


def variante(stem, L, solucion, pistas, explain, opts=None, sub=None):
    """options/answer cumplen el contrato del motor; en concreto y abstracto
    no se muestran (la escena decide con `check`)."""
    if opts is None:
        opts, ans = [num(solucion), "?"], 0
    else:
        opts, ans = opts
    assert len(pistas) == 3
    v = {"stem": stem, "options": opts, "answer": ans, "solucion": solucion, "line": L,
         "hint": pistas[0], "pistas": pistas, "explain": explain}
    if sub:
        v["sub"] = sub
    return v


def check_line(v):
    L = v["line"]
    assert L["inicio"] + L["cambio"] == L["final"], v["stem"]
    for k in ("inicio", "final"):
        assert L["min"] <= L[k] <= L["max"], "%s fuera del pozo: %s" % (k, v["stem"])
    if L.get("valor") is not None:
        assert L["min"] <= L["valor"] <= L["max"]
    sol = L[L["faltante"]]
    if v["solucion"] != sol:
        return False
    if L["modo"] == "pictorico":
        fmt = con_signo if L["faltante"] == "cambio" else num
        return v["options"][v["answer"]] == fmt(sol) and len(set(v["options"])) == 4
    return True


CHECKS = {"line": check_line}


# ---------------------------------------------------------------- distractores
def distractores(L):
    """Errores tipicos de la ficha: E1 (ignora el signo) primero, luego E2
    (por uno al cruzar el cero) y el signo cambiado."""
    a, c, f = L["inicio"], L["cambio"], L["final"]
    if L["faltante"] == "final":
        e1 = abs(a) + abs(c)
        return [e1, f + 1, f - 1, -f, -e1]
    if L["faltante"] == "cambio":
        return [abs(f) - abs(a), c + 1, c - 1, -c]
    return [f + c, abs(f) - abs(c), a + 1, a - 1, -a]          # inicio


def pictorico(L):
    sol = L[L["faltante"]]
    textos, idx = opciones(sol, distractores(L), rng)
    if L["faltante"] == "cambio":
        textos = [con_signo(int(t.replace(MENOS, "-"))) for t in textos]
    return textos, idx


# ---------------------------------------------------------------- pistas
def partes(n):
    """Decenas y unidades de un salto: 23 -> (20, 3)."""
    n = abs(n)
    return n // 10 * 10, n % 10


def dir_de(n):
    return "up" if n > 0 else "down"


def pistas_final(a, b):
    d = dir_de(b)
    dec, uni = partes(b)
    cruza = (a > 0 > a + b) or (a < 0 < a + b)
    p1 = "Start at the flag: %s. Each press of the 1 lever is 1 m %s." % (met(a), d)
    if dec:
        p2 = "Split the trip: %d = %d + %d. Use the 10 lever first, then the 1 lever." % (abs(b), dec, uni)
    else:
        p2 = "Count %d marks %s from %s." % (abs(b), d, met(a))
    if cruza:
        p2 += " Crossing 0 m counts like any other mark."
    ea, eb = (-4, -13) if b < 0 else (-18, 13)
    ef = ea + eb
    p3 = "Example: from %s, %d m %s: %s, then %d more, is %s." % (
        met(ea), abs(eb), dir_de(eb), met(ea + (10 if eb > 0 else -10)), abs(eb) - 10, met(ef))
    return [p1, p2, p3]


def pistas_cambio(a, f):
    p1 = "Stretch the jump from %s until its tip reaches the ring at %s." % (met(a), met(f))
    if (a < 0 < f) or (f < 0 < a):
        p2 = "From %s to 0 m is %d m; from 0 m to %s is %d m. Add them." % (met(a), abs(a), met(f), abs(f))
    else:
        p2 = "Count the metres between %s and %s. Up is +, down is %s." % (met(a), met(f), MENOS)
    p3 = "Example: from %s to %s is a jump of %s." % (met(-3), met(-15), con_signo(-12) + NB + "m")
    return [p1, p2, p3]


def pistas_inicio(a, b):
    f = a + b
    atras = "down" if b > 0 else "up"
    p1 = "Undo the trip: start at %s and go %s %d m." % (met(f), atras, abs(b))
    p2 = "The start is %s %s (%s)." % (num(f), MENOS if b > 0 else "+", num(abs(b)))
    p3 = "Example: 'went down 5 m, stopped at %s' means it started 5 m higher, at %s." % (met(-12), met(-7))
    return [p1, p2, p3]


# ---------------------------------------------------------------- items
def item_final(a, b, modo, bandera=False, valor=None, pista=True):
    L = linea(a, b, "final", modo, bandera=bandera, pistaGrafica=pista)
    if valor is not None:
        L["valor"] = valor
    f, sub = a + b, None
    lado = "above" if b > 0 else "below"
    if modo == "concreto":
        stem = "A crystal gate is %s %s the flag at %s. Take the lift there." % (met(abs(b)), lado, met(a))
        if bandera:
            stem += " Guess first: plant your flag."
    elif modo == "pictorico":
        stem = "The winch board shows a trip %s %s from %s. Where is the gate?" % (dir_de(b), met(abs(b)), met(a))
    else:
        stem, sub = suma(a, b), "Write where the gate is."
    explain = "%s: the gate is at %s." % (suma(a, b, f), met(f))
    return variante(stem, L, f, pistas_final(a, b), explain, pictorico(L) if modo == "pictorico" else None, sub)


def item_cambio(a, f, modo, pista=True):
    b = f - a
    L = linea(a, b, "cambio", modo, pistaGrafica=pista)
    sub = None
    if modo == "concreto":
        stem = "The mole is signalling from %s and you are at %s. Set the jump, then press Check." % (met(f), met(a))
    elif modo == "pictorico":
        stem = "The trip went from %s to the mole at %s. How long was the jump?" % (met(a), met(f))
    else:
        stem, sub = "%s + [ ] = %s" % (num(a), num(f)), "Write the jump. Use %s for down." % MENOS
    explain = "%s + (%s) = %s: the jump is %s." % (num(a), con_signo(b), num(f), con_signo(b) + NB + "m")
    return variante(stem, L, b, pistas_cambio(a, f), explain, pictorico(L) if modo == "pictorico" else None, sub)


def item_inicio(a, b, modo, pista=True):
    f = a + b
    L = linea(a, b, "inicio", modo, pistaGrafica=pista, valor=0)
    sub = None
    d = dir_de(b)
    if modo == "concreto":
        stem = "The last shift wrote: 'Went %s %d m, stopped at %s.' Put the lift where they started: it will repeat the trip." % (d, abs(b), met(f))
    elif modo == "pictorico":
        stem = "The notebook says: went %s %d m, stopped at %s. Where did the trip start?" % (d, abs(b), met(f))
    else:
        bb = num(b) if b >= 0 else "(" + num(b) + ")"
        stem, sub = "[ ] + %s = %s" % (bb, num(f)), "Write where the trip started."
    explain = "%s: the trip started at %s." % (suma(a, b, f), met(a))
    return variante(stem, L, a, pistas_inicio(a, b), explain, pictorico(L) if modo == "pictorico" else None, sub)


# ---------------------------------------------------------------- muestreo
def unicos(gen, n=NV, ok=lambda t: True):
    """n variantes distintas de `gen()` (tuplas de numeros) que cumplen `ok`."""
    vistos, out, guard = set(), [], 0
    while len(out) < n:
        guard += 1
        assert guard < 20000, "no hay variantes suficientes"
        t = gen()
        if t in vistos or not ok(t):
            continue
        vistos.add(t)
        out.append(t)
    return out


def en(lo, hi):
    return lambda x: lo <= x <= hi


# Nivel 1: el final (profundidad) por tramos, cada tramo mas hondo.
def n1_entrada():                     # bajar poco, sin cruzar el suelo
    a = R(-6, -2)
    return (a, -R(3, 5))


def n1_entrada2():
    a = R(-9, -4)
    return (a, R(2, 3))


def n1_t1():                          # tramo 1: sin cruzar el suelo, final en [-12, -1]
    a = R(-12, -2)
    return (a, R(3, 9) * (1 if rng.random() < 0.5 else -1))


def n1_t2():                          # tramo 2: desde el castillete, cruzando el 0, final en [-22, -8]
    a = R(1, 10)
    return (a, -R(a + 8, a + 22))


def n1_t3():                          # tramo 3: dos cifras y estimacion, final en [-30, -18]
    a = R(-10, 10)
    return (a, -R(11, 29))


def n1_jefe():                        # el fondo: saltos grandes desde el castillete
    a = R(5, 10)
    return (a, -R(25, 39))


def lift_final(t):
    return -12 <= t[0] + t[1] <= -1 and not (t[0] < 0 < t[0] + t[1])


def fam(fid, skill, sello, items, pista=True):
    return familia(fid, skill, "line", sello, items, pista)


tema = Tema(materia="maths", slug="y6-la-mina", year="Year 6", subject="Maths",
            topic="La Mina: adding positive and negative numbers", bioma="caverna",
            jugador="mayor", generador="tools/gen/maths_y6_la_mina.py")

# ---- Nivel 1 — The Lift: abrir las compuertas del pozo
n1 = tema.nivel(name="THE LIFT", subtitle="Open the crystal gates of the shaft",
                skill="add across zero",
                briefing=["<p>The old mine is open again. The ground is <b>0&nbsp;m</b>: below it the numbers are negative.</p>",
                          "<p>Each clue tells you where a crystal gate is. Take the lift there and the gate opens.</p>",
                          "<p>Use the <b>10</b> lever for big steps and the <b>1</b> lever for small ones.</p>"])
medio = unicos(n1_entrada, ok=lambda t: t[0] + t[1] >= -12)
n1.tramo([
    fam("MY6-1-E1", "move the lift", "entrada", [item_final(a, b, "concreto", valor=a + b + 1) for a, b in medio]),
    fam("MY6-1-E2", "move the lift", "entrada", [item_final(a, b, "concreto") for a, b in unicos(n1_entrada2)]),
])
for t, gen, ok, bandera, pista in ((1, n1_t1, lift_final, False, True),
                                   (2, n1_t2, lambda t: -22 <= t[0] + t[1] <= -8, False, True),
                                   (3, n1_t3, lambda t: -30 <= t[0] + t[1] <= -18, True, False)):
    trios = unicos(gen, NV * 3, ok)
    n1.tramo([
        fam("MY6-1-T%dC" % t, "add on a scale", "concreto", [item_final(a, b, "concreto", bandera=bandera, pista=pista) for a, b in trios[:NV]], pista),
        fam("MY6-1-T%dP" % t, "add on a scale", "pictorico", [item_final(a, b, "pictorico", pista=pista) for a, b in trios[NV:2 * NV]], pista),
        fam("MY6-1-T%dA" % t, "add on a scale", "abstracto", [item_final(a, b, "abstracto", pista=pista) for a, b in trios[2 * NV:]], pista),
    ])
n1.tramo([fam("MY6-1-J", "add across zero", "jefe",
              [item_final(a, b, "concreto", bandera=True, pista=False) for a, b in unicos(n1_jefe, ok=lambda t: -30 <= t[0] + t[1] <= -20)],
              pista=False)])

# ---- Nivel 2 — The Deep Galleries: el dato que falta
n2 = tema.nivel(name="THE DEEP GALLERIES", subtitle="Start, change, end: find the missing one",
                skill="find the missing number",
                briefing=["<p>Every trip has a <b>start</b>, a <b>change</b> and an <b>end</b>. Up is +, down is %s.</p>" % MENOS,
                          "<p>The mole signals from the galleries and the last shift left notes. One number is always missing: find it and the lift will prove it.</p>"])
n2.tramo([
    fam("MY6-2-R1", "add on a scale", "repaso", [item_final(a, b, "concreto") for a, b in unicos(n1_t2, ok=lambda t: -22 <= t[0] + t[1] <= -8)]),
    fam("MY6-2-R2", "add on a scale", "repaso", [item_final(a, b, "abstracto") for a, b in unicos(n1_t1, ok=lift_final)]),
])


def cambio_gen(lo, hi):
    def g():
        a, f = R(lo, 10), R(lo, hi)
        return (a, f)
    return g


def inicio_gen(lo, hi):
    def g():
        f = R(lo, hi)
        return (f - (b := R(5, 18) * (1 if rng.random() < 0.5 else -1)), b)
    return g


ok_cambio = lambda lo, hi: (lambda t: abs(t[1] - t[0]) >= 5 and lo <= t[1] <= hi and -30 <= t[0] <= 10)
ok_inicio = lambda lo, hi: (lambda t: -30 <= t[0] <= 10 and lo <= t[0] + t[1] <= hi)

# Tramo 1: la senal del topo (falta el cambio), hasta -12 m.
tr = unicos(cambio_gen(-12, 10), NV * 3, ok_cambio(-12, 6))
n2.tramo([
    fam("MY6-2-T1C", "find the change", "concreto", [item_cambio(a, f, "concreto") for a, f in tr[:NV]]),
    fam("MY6-2-T1P", "find the change", "pictorico", [item_cambio(a, f, "pictorico") for a, f in tr[NV:2 * NV]]),
    fam("MY6-2-T1A", "find the change", "abstracto", [item_cambio(a, f, "abstracto") for a, f in tr[2 * NV:]]),
])
# Tramo 2: el cuaderno del turno anterior (falta el inicio), hasta -22 m.
tr = unicos(inicio_gen(-22, -8), NV * 3, ok_inicio(-22, -8))
n2.tramo([
    fam("MY6-2-T2C", "find the start", "concreto", [item_inicio(a, b, "concreto") for a, b in tr[:NV]]),
    fam("MY6-2-T2P", "find the start", "pictorico", [item_inicio(a, b, "pictorico") for a, b in tr[NV:2 * NV]]),
    fam("MY6-2-T2A", "find the start", "abstracto", [item_inicio(a, b, "abstracto") for a, b in tr[2 * NV:]]),
])
# Tramo 3: mezcla, hasta -30 m, sin pista grafica.
mc = unicos(cambio_gen(-30, -18), NV * 3, ok_cambio(-30, -18))
mi = unicos(inicio_gen(-30, -18), NV * 3, ok_inicio(-30, -18))


def mezcla(modo, k):
    out = []
    for i in range(NV):
        if i % 2 == 0:
            a, f = mc[k * NV + i]
            out.append(item_cambio(a, f, modo, False))
        else:
            a, b = mi[k * NV + i]
            out.append(item_inicio(a, b, modo, False))
    return out


n2.tramo([
    fam("MY6-2-T3C", "find the missing number", "concreto", mezcla("concreto", 0), False),
    fam("MY6-2-T3P", "find the missing number", "pictorico", mezcla("pictorico", 1), False),
    fam("MY6-2-T3A", "find the missing number", "abstracto", mezcla("abstracto", 2), False),
])
n2.tramo([fam("MY6-2-J", "find the missing number", "jefe",
              [item_cambio(a, f, "concreto", False) for a, f in unicos(lambda: (R(1, 10), R(-30, -20)), ok=ok_cambio(-30, -20))],
              pista=False)])


# ---------------------------------------------------------------- validacion propia
def finales(fam_):
    return [v["line"]["final"] for v in fam_["variants"]]


for nv in tema.niveles:
    assert len(nv.items) == 12, "nivel %d: Year 6 lleva 12 items" % nv.id
    # Cada tramo de sello baja mas que el anterior (el descenso de la historia).
    hondo = [min(x for f in nv.items[a:b] for x in finales(f)) for a, b in nv.tramos[1:4]]
    assert hondo[0] > hondo[1] > hondo[2], "nivel %d: los tramos no bajan: %s" % (nv.id, hondo)
    for fam_ in nv.items:
        for v in fam_["variants"]:
            L = v["line"]
            # E1 fuera del pozo en pictorico: el montacargas sale disparado.
            if L["modo"] == "pictorico" and L["faltante"] == "final":
                assert num(abs(L["inicio"]) + abs(L["cambio"])) in v["options"], "falta E1: " + v["stem"]
            # La bandera solo tiene sentido cuando falta el final.
            assert not L.get("bandera") or L["faltante"] == "final"
            assert len(v["stem"].split()) <= 25, "enunciado largo: " + v["stem"]

if __name__ == "__main__":
    ruta, data = escribir(tema, CHECKS)
    n = sum(len(f["variants"]) for lv in data["levels"] for f in lv["questions"])
    print("OK -> %s" % ruta)
    print("niveles=%d items=%d variantes=%d" % (len(data["levels"]), sum(len(lv["questions"]) for lv in data["levels"]), n))
