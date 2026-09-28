#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BUILD — SAMSAN

Inlina el motor compartido (assets/engine.css + fuentes + assets/ui.js +
assets/props.js + assets/engine.js) y el data.js de cada juego en UN .html
autocontenido por juego, y genera las páginas del sitio: la portada
(index.html) y las notas legales (legal.html).

Qué se publica lo decide `subjects.js`: solo los juegos con `publicar: true`
van a la raíz, que es lo único que Actions sube a GitHub Pages. Los demás se
construyen en `_local/` (ignorado por git) para jugarlos y probarlos en este
equipo sin publicarlos.

Falla con un mensaje claro si:
  - un `mech` de algún data.js no tiene escena en SCENES (regla 7);
  - una página referencia assets/ o pide algo a un tercero (regla 2);
  - una página pesa 1,5 MB o más.

Uso:
    python3 tools/build.py
"""
import base64, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL = "_local"
MAX_BYTES = 1.5 * 1024 * 1024


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as fh:
        return fh.read()


def write(rel, text):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    return len(text.encode("utf-8"))


def fail(msg):
    sys.exit("ERROR DE BUILD: " + msg)


FAVICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' "
           "viewBox='0 0 16 16'><text y='14' font-size='14'>%F0%9F%8E%AE</text></svg>")

# Mismo sprite que dibuja engine.js (cuerpo 'a', colores por defecto). Si
# cambia el heroe en engine.js, cambia aqui tambien.
SPRITE = """<svg class="avatar avatar--lg avatar--bob" viewBox="0 0 17 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
      <path fill="#8a5a30" d="M4 1h9v2H4z M3 2h1v3H3z M13 2h1v3h-1z M4 2h9v2H4z"/>
      <path fill="#3f2a18" d="M4 1h9v1H4z M3 2h1v1H3z M13 2h1v1h-1z"/>
      <path fill="#e8b088" d="M4 4h9v8H4z"/>
      <path fill="#fae8d6" d="M5 6h2v2H5z M10 6h2v2h-2z"/>
      <path fill="#2d1f16" d="M6 6h1v2H6z M10 6h1v2h-1z"/>
      <path fill="#5e4534" d="M7 10h3v1H7z"/>
      <path fill="#7ee8fa" d="M3 5h1v3H3z M13 5h1v3h-1z M3 4h11v1H3z"/>
      <path fill="#c77dff" d="M5 12h7v6H5z M3 13h2v2H3z M12 13h2v2h-2z"/>
      <path fill="#c77dff" d="M3 15h2v2H3z M12 15h2v2h-2z"/>
      <path fill="rgba(0,0,0,.22)" d="M10 12h2v6h-2z"/>
      <path fill="#5b8cff" d="M5 18h3v2H5z M9 18h3v2H9z"/>
    </svg>"""

# ---------------------------------------------------------------- textos del sitio
# Textos de la portada y de legal.html. Los del pie (credito, derechos, enlace)
# NO van aqui: se leen de `credits` en assets/ui.js, igual que en los juegos.
PORTADA = {
    "descripcion": "SAMSAN: un juego educativo gratuito, un mundo de biomas para aprender jugando.",
    "lema": "Un mundo de biomas para aprender jugando.",
    "obra_titulo": "EL MUNDO ESTÁ EN CONSTRUCCIÓN",
    "obra_texto": [
        "Estamos construyendo la primera zona del mundo. Cada tema del colegio "
        "se convertirá en un lugar nuevo para explorar.",
        "Vuelve pronto.",
    ],
    "juegos_titulo": "ZONAS ABIERTAS",
}

LEGAL = {
    "titulo": "Notas legales",
    "descripcion": "Notas legales de SAMSAN: uso educativo, afiliación, privacidad y licencias de terceros.",
    "volver": "Volver a la portada",
    "secciones": [
        ("Uso educativo gratuito", [
            "SAMSAN es un juego educativo gratuito, hecho para uso personal y educativo "
            "y sin fines comerciales. No tiene publicidad, compras, suscripciones ni cuentas.",
        ]),
        ("Sin afiliación con ningún colegio", [
            "SAMSAN no está afiliado a ningún colegio ni institución educativa, y ninguno "
            "lo patrocina ni lo respalda. Los temas siguen objetivos de aprendizaje "
            "generales; los textos, ejercicios, contextos y personajes son originales.",
        ]),
        ("Privacidad", [
            "El juego no recoge datos personales, no usa cookies ni analítica y no envía "
            "nada a ningún servidor. No pide nombres: el personaje es un avatar sin nombre.",
            "El progreso se guarda solo en el navegador de este equipo (almacenamiento "
            "local) o en el archivo que la familia decida exportar. Borrar los datos del "
            "sitio en el navegador borra el progreso.",
            "Las fuentes, el código y las imágenes van dentro de cada página, así que "
            "jugar no hace peticiones a terceros. El sitio se aloja en GitHub Pages, que "
            "como cualquier servidor web puede registrar datos técnicos de la conexión "
            "según su propia política de privacidad.",
        ]),
        ("Licencias de terceros", None),   # None = se genera desde docs/licencias.md
    ],
    "licencias_intro": "Componentes de terceros, su licencia y la obligación que cumple este sitio:",
}


def ui_value(ui_src, key):
    m = re.search(r"\b" + key + r"""\s*:\s*(['"])(.+?)\1""", ui_src)
    if not m:
        fail("assets/ui.js: no encuentro la clave `%s`." % key)
    return m.group(2)


def brand_from_ui(ui_src):
    """El nombre del juego vive en un solo sitio: assets/ui.js."""
    return ui_value(ui_src, "brand")


def credits_from_ui(ui_src):
    m = re.search(r"credits\s*:\s*\{(.*?)\}", ui_src, re.S)
    if not m:
        fail("assets/ui.js: falta el bloque `credits` (regla 10).")
    block = m.group(1)
    return {k: ui_value(block, k) for k in ("designed", "copyright", "legalLink", "legalHref")}


def inline_fonts(css):
    """Cambia url('fonts/x.woff2') por un data: URI. Asi cada .html lleva sus
    fuentes y no pide nada a nadie (regla 2)."""
    def sub(m):
        rel = m.group(1)
        path = os.path.join(ROOT, "assets", rel)
        if not os.path.exists(path):
            fail("engine.css pide %s y no existe en assets/." % rel)
        with open(path, "rb") as fh:
            b64 = base64.b64encode(fh.read()).decode("ascii")
        return "url('data:font/woff2;base64,%s')" % b64
    out, n = re.subn(r"""url\(\s*['"]?(fonts/[^'")]+\.woff2)['"]?\s*\)""", sub, css)
    if n == 0:
        fail("engine.css no declara ninguna fuente local en fonts/.")
    if "@import" in out:
        fail("engine.css todavia tiene un @import: las fuentes deben ser locales.")
    return out


def load_registry():
    src = read("subjects.js")
    m = re.search(r"window\.SUBJECTS\s*=\s*(\[.*?\]);", src, re.S)
    if not m:
        fail("no puedo leer subjects.js")
    js = re.sub(r"//.*", "", m.group(1))
    js = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', js)
    js = re.sub(r",(\s*[}\]])", r"\1", js)
    subs = json.loads(js)
    for s in subs:
        if not isinstance(s.get("publicar"), bool):
            fail("subjects.js: '%s' debe declarar `publicar: true` o `publicar: false`." % s.get("slug"))
    return subs


def check_mechs(subjects, engine):
    """Regla 7: una mecanica declarada en datos sin escena es error de build."""
    scenes = set(re.findall(r"\bSCENES\.([A-Za-z_]\w*)\s*=\s*function", engine))
    if not scenes:
        fail("no encuentro ninguna escena `SCENES.<nombre> = function` en engine.js.")
    errores = []
    for sub in subjects:
        data = read("subjects", sub["slug"], "data.js")
        usados = {}
        for mech in re.findall(r"""["']?\bmech["']?\s*:\s*["']([^"']*)["']""", data):
            usados[mech] = usados.get(mech, 0) + 1
        for mech, n in sorted(usados.items()):
            if mech not in scenes:
                errores.append("  subjects/%s/data.js declara mech \"%s\" (%d veces)" % (sub["slug"], mech, n))
    if errores:
        fail("hay mecanicas sin escena en SCENES (regla 7 de CLAUDE.md):\n" + "\n".join(errores) +
             "\n  Escenas que existen en assets/engine.js: " + ", ".join(sorted(scenes)) +
             "\n  Corrige el generador del tema y vuelve a generar su data.js.")
    return scenes


def head(title, description, css, accent, lang):
    return (
        '<!DOCTYPE html>\n'
        '<html lang="' + lang + '" data-accent="' + accent + '">\n'
        '<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>' + title + '</title>\n'
        '<meta name="description" content="' + description + '">\n'
        '<link rel="icon" href="' + FAVICON + '">\n'
        '<style>\n' + css + '\n</style>\n'
        '</head>\n<body>\n'
    )


def foot(credits):
    e = html.escape
    return ('<footer class="site-foot">\n'
            '  <p>' + e(credits["designed"]) + '</p>\n'
            '  <p>' + e(credits["copyright"]) + '</p>\n'
            '  <p><a href="' + e(credits["legalHref"]) + '">' + e(credits["legalLink"]) + '</a></p>\n'
            '</footer>\n')


# Estilos propios de las paginas del sitio (portada y legal). Son pocos: todo
# lo demas sale de engine.css para que el sitio y los juegos se vean iguales.
SITE_CSS = """
.site-page { max-width: 760px; }
.site-page .brief p { margin-top: 12px; }
.site-page .brief h2 { line-height: 1.6; }
.legal h2 { font-size: 13px; margin-top: 30px; line-height: 1.6; color: var(--accent); }
.legal h3 { font-size: 11px; margin-top: 22px; color: var(--ink-dim); }
.legal p { margin-top: 10px; line-height: 1.6; }
.lic { margin-top: 14px; display: grid; gap: 14px; }
.lic__item { border: var(--px) solid var(--line); padding: 14px; background: var(--bg-0); }
.lic__item h4 { font-size: 15px; margin-bottom: 6px; }
.lic__item dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; font-size: 14px; }
.lic__item dt { color: var(--ink-dim); }
.lic__item dd { margin: 0; overflow-wrap: anywhere; }
.lic__item code { font-size: 13px; }
.back { display: inline-block; margin-top: 24px; color: var(--accent); }
@media (max-width: 520px) { .lic__item dl { grid-template-columns: 1fr; } .lic__item dt { margin-top: 6px; } }
"""


def md_inline(text):
    """Markdown en linea minimo para las celdas de docs/licencias.md: `codigo`."""
    out = html.escape(text, quote=False)
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", out)


def licencias_html():
    src = read("docs", "licencias.md")
    secciones, actual = [], None
    for line in src.splitlines():
        if line.startswith("## "):
            actual = {"titulo": line[3:].strip(), "filas": []}
            secciones.append(actual)
            continue
        if actual is None or not line.startswith("|"):
            continue
        celdas = [c.strip() for c in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{3,}:?", c) for c in celdas):
            continue
        actual["filas"].append(celdas)
    partes = ['<p>' + html.escape(LEGAL["licencias_intro"]) + '</p>']
    total = 0
    for sec in secciones:
        if len(sec["filas"]) < 2:
            continue
        cab, filas = sec["filas"][0], sec["filas"][1:]
        if len(cab) != 4 or any(len(f) != 4 for f in filas):
            fail("docs/licencias.md: la tabla de '%s' debe tener 4 columnas." % sec["titulo"])
        partes.append('<h3>' + html.escape(sec["titulo"]) + '</h3>\n<div class="lic">')
        for f in filas:
            total += 1
            partes.append(
                '<div class="lic__item"><h4>' + md_inline(f[0]) + '</h4><dl>' +
                ''.join('<dt>' + html.escape(cab[i]) + '</dt><dd>' + md_inline(f[i]) + '</dd>' for i in (1, 2, 3)) +
                '</dl></div>')
        partes.append('</div>')
    if total == 0:
        fail("docs/licencias.md no tiene ninguna tabla de licencias.")
    return "\n".join(partes)


def build_game(sub, css, ui, props, engine, brand, credits):
    data = read("subjects", sub["slug"], "data.js")
    title = brand + " — " + sub["topic"]
    desc = sub["blurb"].replace('"', "&quot;")
    page = head(title, desc, css, sub.get("accent", "maths"), "en")
    page += '<div id="app"></div>\n'
    page += '<script>\n' + ui + '\n</script>\n'
    page += '<script>\n' + props + '\n</script>\n'
    page += '<script>\n' + data + '\n</script>\n'
    page += '<script>\n' + engine + '\n</script>\n'
    page += '</body>\n</html>\n'
    return page


def build_portada(css, ui, brand, credits, publicados):
    e = html.escape
    page = head(brand, e(PORTADA["descripcion"]), css + SITE_CSS, "maths", "es")
    page += '<div class="wrap site-page">\n'
    page += ('<header class="site-head">\n    ' + SPRITE + '\n    <div>\n'
             '      <h1>' + e(brand) + '</h1>\n'
             '      <p>' + e(PORTADA["lema"]) + '</p>\n'
             '    </div>\n</header>\n')
    page += ('<main>\n<section class="pixel-box brief">\n'
             '  <h2>' + e(PORTADA["obra_titulo"]) + '</h2>\n' +
             ''.join('  <p>' + e(t) + '</p>\n' for t in PORTADA["obra_texto"]) +
             '</section>\n')
    # Solo los juegos publicables. Hoy no hay ninguno: la lista no se pinta.
    if publicados:
        page += '<h2 class="mt-lg">' + e(PORTADA["juegos_titulo"]) + '</h2>\n<div class="levels">\n'
        for s in publicados:
            page += ('<a class="pixel-box level-card" data-accent="' + e(s.get("accent", "maths")) +
                     '" href="' + e(s["slug"]) + '.html" style="text-decoration:none;color:inherit">'
                     '<div class="level-card__num" style="font-size:11px">' + e(s["subject"][:4].upper()) + '</div>'
                     '<div><div class="level-card__name">' + e(s["topic"]) + '</div>'
                     '<div class="level-card__sub">' + e(s["blurb"]) + '</div></div></a>\n')
        page += '</div>\n'
    page += '</main>\n' + foot(credits) + '</div>\n</body>\n</html>\n'
    return page


def build_legal(css, brand, credits):
    e = html.escape
    page = head(e(LEGAL["titulo"]) + " — " + e(brand), e(LEGAL["descripcion"]), css + SITE_CSS, "maths", "es")
    page += '<div class="wrap site-page">\n'
    page += ('<header class="site-head"><div>\n'
             '  <h1>' + e(brand) + '</h1>\n'
             '  <p>' + e(LEGAL["titulo"]) + '</p>\n'
             '</div></header>\n<main class="pixel-box brief legal">\n')
    for i, (titulo, parrafos) in enumerate(LEGAL["secciones"], 1):
        page += '<section>\n<h2>' + str(i) + '. ' + e(titulo) + '</h2>\n'
        if parrafos is None:
            page += licencias_html() + '\n'
        else:
            page += ''.join('<p>' + e(t) + '</p>\n' for t in parrafos)
        page += '</section>\n'
    page += '<a class="back" href="index.html">' + e(LEGAL["volver"]) + '</a>\n</main>\n'
    page += foot(credits) + '</div>\n</body>\n</html>\n'
    return page


# Guardarrailes sobre cada pagina escrita.
ASSETS_RE = re.compile(r"""(src|href)\s*=\s*["'][^"']*assets/""")
EXTERNAL_RE = re.compile(
    r"""<(?:link|script|img|iframe|source|audio|video)\b[^>]*\b(?:src|href)\s*=\s*["']?(?:https?:)?//"""
    r"""|url\(\s*['"]?(?:https?:)?//|@import""", re.I)


def guard(rel):
    text = read(rel)
    if ASSETS_RE.search(text):
        fail("%s referencia assets/ en vez de llevarlo inline." % rel)
    m = EXTERNAL_RE.search(text)
    if m:
        fail("%s pide un recurso a un tercero (regla 2): %s" % (rel, m.group(0)[:80]))
    size = len(text.encode("utf-8"))
    if size >= MAX_BYTES:
        fail("%s pesa %.2f MB; el maximo es 1,5 MB." % (rel, size / 1024 / 1024))


def main():
    css = inline_fonts(read("assets", "engine.css"))
    ui = read("assets", "ui.js")
    props = read("assets", "props.js")
    engine = read("assets", "engine.js")
    brand = brand_from_ui(ui)
    credits = credits_from_ui(ui)

    subjects = load_registry()
    check_mechs(subjects, engine)

    built = []
    publicados = []
    for sub in subjects:
        page = build_game(sub, css, ui, props, engine, brand, credits)
        name = sub["slug"] + ".html"
        if sub["publicar"]:
            publicados.append(sub)
            rel = name
        else:
            rel = LOCAL + "/" + name
            # Un .html viejo de un juego no publicable en la raiz se publicaria
            # por error: se borra.
            stale = os.path.join(ROOT, name)
            if os.path.exists(stale):
                os.remove(stale)
        built.append((rel, write(rel, page)))

    built.insert(0, ("index.html", write("index.html", build_portada(css, ui, brand, credits, publicados))))
    legal = build_legal(css, brand, credits)
    built.insert(1, ("legal.html", write("legal.html", legal)))
    # Copia local para que el enlace del pie funcione al jugar desde _local/.
    write(LOCAL + "/legal.html", legal)

    for rel, _ in built:
        guard(rel)

    print("Paginas construidas:")
    for rel, size in built:
        where = "publica" if "/" not in rel else "local  "
        print("  [%s] %-44s %7.1f KB" % (where, rel, size / 1024))
    print("\nSe publican solo los .html de la raiz. %s/ es para jugar y probar en este equipo." % LOCAL)


if __name__ == "__main__":
    main()
