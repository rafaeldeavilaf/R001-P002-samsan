#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BIBLIOTECA — enlace entre tools/arte/ y la biblioteca de arte R001-P003.

El original de cada sprite vive en el repositorio privado R001-P003, con su
exportación de PixelLab y su ficha en catalogo.json. SAMSAN solo recibe la
copia procesada. Este módulo:

  1. ubica la biblioteca (argumento --biblioteca, variable SAMSAN_BIBLIOTECA
     o la carpeta hermana ../R001-P003-biblioteca-arte, en ese orden);
  2. convierte la ruta de un PNG en su ruta dentro de la biblioteca, la misma
     forma que usa el campo `archivos` del catálogo;
  3. exige que el PNG tenga entrada en el catálogo (un PNG sin entrada no existe);
  4. anota el destino en `usado_en` y pasa la pieza de `crudo` a `procesado`.

Actions no tiene acceso a la biblioteca, que es privada: el procesado de arte
se hace siempre en el equipo de Rafael.
"""
import datetime, json, os

from paletas import ROOT

NOMBRE = "R001-P003-biblioteca-arte"
PROYECTO = "R001-P002"
CATALOGO = "catalogo.json"


class ErrorBiblioteca(Exception):
    pass


def ubicar(ruta=None):
    """Devuelve la ruta absoluta de la biblioteca o lanza ErrorBiblioteca."""
    explicitas = [("--biblioteca", ruta), ("SAMSAN_BIBLIOTECA", os.environ.get("SAMSAN_BIBLIOTECA"))]
    for origen, c in explicitas:
        if c:
            c = os.path.abspath(os.path.expanduser(c))
            if not os.path.isfile(os.path.join(c, CATALOGO)):
                raise ErrorBiblioteca("%s apunta a %s, pero ahí no hay %s." % (origen, c, CATALOGO))
            return c
    hermana = os.path.join(os.path.dirname(ROOT), NOMBRE)
    if os.path.isfile(os.path.join(hermana, CATALOGO)):
        return hermana
    raise ErrorBiblioteca(
        "No encuentro la biblioteca de arte. Clona %s junto a SAMSAN (%s) "
        "o indica su ruta con --biblioteca o la variable SAMSAN_BIBLIOTECA." % (NOMBRE, hermana))


def cargar(bib):
    with open(os.path.join(bib, CATALOGO), encoding="utf-8") as f:
        return json.load(f)


def guardar(bib, cat):
    # Mismo formato que el archivo versionado: 2 espacios, UTF-8 sin escapar, salto final.
    texto = json.dumps(cat, ensure_ascii=False, indent=2) + "\n"
    with open(os.path.join(bib, CATALOGO), "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


def resolver(png, bib):
    """Acepta la ruta tal como aparece en el catálogo (relativa a la biblioteca)
    o cualquier ruta que apunte a un archivo dentro de ella.
    Devuelve (ruta absoluta, ruta relativa con barras /)."""
    candidatos = [png] if os.path.isabs(png) else [os.path.join(bib, png), os.path.abspath(png)]
    raiz = os.path.realpath(bib)
    for c in candidatos:
        if os.path.isfile(c):
            rel = os.path.relpath(os.path.realpath(c), raiz)
            if rel == os.pardir or rel.startswith(os.pardir + os.sep):
                continue
            return os.path.abspath(c), rel.replace(os.sep, "/")
    raise ErrorBiblioteca(
        "%s no es un archivo de la biblioteca (%s). El arte se procesa desde ahí; "
        "si es una exportación nueva, impórtala primero con herramientas/importar.py." % (png, bib))


def pieza_de(cat, rel):
    piezas = [p for p in cat.get("piezas", []) if rel in p.get("archivos", [])]
    if not piezas:
        raise ErrorBiblioteca("%s no tiene entrada en %s. Un PNG sin entrada no existe: regístralo antes de procesarlo." % (rel, CATALOGO))
    if len(piezas) > 1:
        raise ErrorBiblioteca("%s aparece en varias piezas (%s); corrige el catálogo." % (rel, ", ".join(p["id"] for p in piezas)))
    return piezas[0]


def texto_uso(pieza, rel, destino_rel):
    uso = "%s %s" % (PROYECTO, destino_rel)
    if len(pieza.get("archivos", [])) > 1:
        carpeta, archivo = os.path.split(rel)
        stem = os.path.splitext(archivo)[0]
        uso += " (vista %s)" % stem if os.path.basename(carpeta) == "rotations" else " (desde %s)" % archivo
    return uso


def registrar_uso(bib, rel, destino_rel, hoy=None):
    """Anota el destino en usado_en y pasa crudo a procesado.
    Devuelve (id, mensaje). No duplica un destino ya anotado."""
    cat = cargar(bib)
    pieza = pieza_de(cat, rel)
    uso = texto_uso(pieza, rel, destino_rel)
    destino = "%s %s" % (PROYECTO, destino_rel)
    usado = pieza.setdefault("usado_en", [])
    avisos = []
    if pieza.get("estado") in ("reemplazado", "descartado"):
        avisos.append("ojo: %s está en estado %s" % (pieza["id"], pieza["estado"]))
    ya = any(u == destino or u.startswith(destino + " ") for u in usado)
    if not ya:
        usado.append(uso)
    cambio_estado = pieza.get("estado") == "crudo"
    if cambio_estado:
        pieza["estado"] = "procesado"
    if ya and not cambio_estado:
        return pieza["id"], "; ".join(avisos + ["%s ya tenía anotado %s, catálogo sin cambios" % (pieza["id"], destino)])
    cat["actualizado"] = (hoy or datetime.date.today()).isoformat()
    guardar(bib, cat)
    partes = ["%s: usado_en += %s" % (pieza["id"], uso)] if not ya else ["%s" % pieza["id"]]
    if cambio_estado:
        partes.append("estado crudo -> procesado")
    return pieza["id"], "; ".join(avisos + partes)


def recordatorio(bib):
    return "Recuerda hacer commit y push en la biblioteca: git -C \"%s\" add catalogo.json && git -C \"%s\" commit -m \"...\"" % (bib, bib)
