#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SAMSAN_GEN — libreria comun de los generadores de tema (tools/gen/).

Un tema es una lista de niveles; un nivel, una lista de items en orden
(repaso, tres tramos de sello y jefe); un item, una FAMILIA con varias
variantes numericas. Cada variante declara su solucion (`solucion`) y
la escena la comprueba con la misma regla (`check`) que el generador
valida aqui con `assert`.

Sello de tres pasos (docs/decisiones-vigentes.md §3): cada tramo son
tres items de la misma familia de ideas, en este orden:
  concreto  -> se manipula el instrumento;
  pictorico -> se ve la figura y se toca la respuesta entre cuatro;
  abstracto -> formato del cuaderno, se escribe el numero con el teclado.

Uso minimo:
    from samsan_gen import Tema, Nivel, familia, escribir
    tema = Tema(materia="maths", slug="y6-la-mina", ...)
    ...
    escribir(tema)          # valida todo y escribe temas/<materia>/<tema>/data.js
"""
import json, os, re, random

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MENOS = "−"          # signo menos tipografico: "−15", nunca "-15"
SELLO = ("concreto", "pictorico", "abstracto")


# ---------------------------------------------------------------- formato
def num(n):
    """Entero con signo menos tipografico."""
    assert int(n) == n, n
    n = int(n)
    return (MENOS + str(-n)) if n < 0 else str(n)


def con_signo(n):
    """Cambio con signo explicito: +8, −5 (el cero va sin signo)."""
    return ("+" + str(n)) if n > 0 else num(n)


def suma(a, b, total="[ ]"):
    """Oracion de suma del cuaderno: −15 + 7 = [ ]; con b negativo, −15 + (−7)."""
    bb = num(b) if b >= 0 else "(" + num(b) + ")"
    return "%s + %s = %s" % (num(a), bb, total if isinstance(total, str) else num(total))


# ---------------------------------------------------------------- distractores
def opciones(correcta, distractores, rng, n=4):
    """Cuatro opciones unicas: la correcta mas los distractores en orden de
    prioridad (los de los errores tipicos primero). Devuelve (textos, indice)."""
    vistas, lista = {correcta}, [correcta]
    for d in distractores:
        if d not in vistas and len(lista) < n:
            vistas.add(d); lista.append(d)
    k = 1
    while len(lista) < n:                  # relleno cercano, nunca repetido
        for d in (correcta + k, correcta - k):
            if d not in vistas and len(lista) < n:
                vistas.add(d); lista.append(d)
        k += 1
    rng.shuffle(lista)
    return [num(x) for x in lista], lista.index(correcta)


# ---------------------------------------------------------------- modelo
class Tema(object):
    def __init__(self, materia, slug, year, subject, topic, bioma, jugador, generador, accent="maths", lang="en"):
        self.materia, self.slug, self.year, self.subject, self.topic = materia, slug, year, subject, topic
        self.bioma, self.jugador, self.generador, self.accent, self.lang = bioma, jugador, generador, accent, lang
        self.niveles = []
        # Capa comun: el companero no cuenta aciertos seguidos (regla 4) y
        # habla en tono neutro. Un tema puede ampliar esto.
        self.ui = {"mate": {"start": "Let's go", "turn": "Your turn", "retry": "Another go", "combo": "Your turn",
                            "comboPop": "Nice one", "gemPop": "◆ Gem {n}/{total}",
                            "cheers": ["Nice one", "Got it", "That's it", "Spot on"],
                            "consoles": ["Look again", "Let's see", "Another go"]}}

    def nivel(self, **kw):
        n = Nivel(len(self.niveles) + 1, **kw)
        self.niveles.append(n)
        return n


class Nivel(object):
    """Un nivel con items en orden. `tramos` son grupos de items que dan una
    gema al completarse (el repaso y el jefe forman sus propios tramos)."""
    def __init__(self, id, name, subtitle, skill, briefing, env=None):
        self.id, self.name, self.subtitle, self.skill, self.briefing = id, name, subtitle, skill, briefing
        self.env = env
        self.items = []          # familias en orden de juego
        self.tramos = []         # [(desde, hasta)] indices de items por tramo

    def tramo(self, familias):
        desde = len(self.items)
        self.items.extend(familias)
        self.tramos.append((desde, len(self.items)))


def familia(fid, skill, mech, sello, variantes, pista_grafica=True):
    """Una familia: el mismo item con varias variantes numericas."""
    assert sello in SELLO + ("entrada", "repaso", "jefe"), sello
    return {"id": fid, "skill": skill, "mech": mech, "sello": sello,
            "pistaGrafica": bool(pista_grafica), "variants": variantes}


# ---------------------------------------------------------------- validacion
def escenas_del_motor():
    src = open(os.path.join(ROOT, "assets", "engine.js"), encoding="utf-8").read()
    return set(re.findall(r"\bSCENES\.([A-Za-z_]\w*)\s*=\s*function", src))


def nombres_vigilados():
    """Lista de anonimato (solo en local; en Actions la revisa su propio paso)."""
    f = os.path.join(ROOT, ".anonimato.local")
    if not os.path.exists(f):
        return []
    return [l.strip().lower() for l in open(f, encoding="utf-8") if l.strip() and not l.startswith("#")]


def texto_de(v):
    partes = [v.get("stem") or "", v.get("sub") or "", v.get("hint") or "", v.get("explain") or ""]
    partes += [str(o) for o in v.get("options", [])]
    partes += [str(p) for p in (v.get("pistas") or [])]
    return " ".join(partes)


def validar(tema, checks):
    """Validaciones comunes. `checks[mech](variante)` -> True si la solucion
    declarada satisface la regla de su escena (la misma regla que `check`)."""
    escenas = escenas_del_motor()
    ids, vigilados = set(), nombres_vigilados()
    for nv in tema.niveles:
        assert nv.items, "nivel %d sin items" % nv.id
        assert nv.tramos and nv.tramos[-1][1] == len(nv.items), "nivel %d: tramos no cubren los items" % nv.id
        stems = set()
        for fam in nv.items:
            assert fam["id"] not in ids, "id repetido " + fam["id"]
            ids.add(fam["id"])
            assert fam["mech"] in escenas, "mech %s sin escena en SCENES (regla 7)" % fam["mech"]
            assert len(fam["variants"]) >= 3, "%s: pocas variantes" % fam["id"]
            for v in fam["variants"]:
                assert v["stem"] not in stems, "%s: enunciado repetido: %s" % (fam["id"], v["stem"])
                stems.add(v["stem"])
                assert "solucion" in v, "%s: variante sin solucion declarada" % fam["id"]
                if "pistas" in v:   # escalera de tres peldanos: accion minima, figura, ejemplo resuelto
                    assert len(v["pistas"]) == 3 and all(isinstance(p, str) and p.strip() for p in v["pistas"]), fam["id"]
                assert checks[fam["mech"]](v), "%s: la solucion no cumple la regla: %s" % (fam["id"], v["stem"])
                t = texto_de(v).lower()
                for n in vigilados:
                    assert n not in t, "%s: texto con un nombre vigilado" % fam["id"]
                # Contrato del motor: options/answer siguen existiendo.
                assert isinstance(v.get("options"), list) and len(v["options"]) >= 2, fam["id"]
                assert 0 <= v["answer"] < len(v["options"]), fam["id"]
    return True


# ---------------------------------------------------------------- salida
def escribir(tema, checks):
    validar(tema, checks)
    data = {
        "meta": {"slug": tema.materia + "-" + tema.slug, "materia": tema.materia, "tema": tema.slug,
                 "year": tema.year, "subject": tema.subject, "topic": tema.topic, "bioma": tema.bioma,
                 "accent": tema.accent, "capa": "comun"},
        "levels": [],
    }
    if tema.ui:
        data["ui"] = tema.ui
    for nv in tema.niveles:
        lv = {"id": nv.id, "name": nv.name, "subtitle": nv.subtitle, "skill": nv.skill,
              "briefing": nv.briefing, "sello": True,
              "tramosItems": [[a, b] for a, b in nv.tramos], "tramos": len(nv.tramos),
              "questions": nv.items}
        if nv.env:
            lv["env"] = nv.env
        data["levels"].append(lv)
    carpeta = os.path.join(ROOT, "temas", tema.materia, tema.slug)
    os.makedirs(carpeta, exist_ok=True)
    ruta = os.path.join(carpeta, "data.js")
    with open(ruta, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* GENERADO por %s. No se edita a mano. */\n" % tema.generador)
        fh.write("window.QUIZ_DATA = ")
        fh.write(json.dumps(data, ensure_ascii=False, indent=1))
        fh.write(";\n")
    return ruta, data
