#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BUILD — SAMSAN

Inlina el motor compartido (assets/engine.css + fuentes + assets/ui.js +
assets/props.js + assets/engine.js) y el data.js de cada juego en UN .html
autocontenido por juego, y genera las páginas del sitio con el kit nuevo
(assets/kit.css) y la capa del mundo (assets/mundo/): la portada
(index.html), las notas legales (legal.html) y, solo en local, la vitrina
del bioma Caverna (_local/vitrina-caverna.html).

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

# ---------------------------------------------------------------- textos del sitio
# Textos de la portada y de legal.html. Los del pie (credito, derechos, enlace)
# NO van aqui: se leen de `credits` en assets/ui.js, igual que en los juegos.
PORTADA = {
    "descripcion": "SAMSAN: un juego educativo gratuito, un mundo de biomas para aprender jugando.",
    "lema": "Un mundo de biomas para aprender jugando.",
    "escena": "Escena decorativa: un explorador sube y baja por la cuerda de una mina iluminada por antorchas y cristales, junto a un topo minero.",
    "obra_titulo": "El mundo está en construcción",
    "obra_texto": [
        "Estamos construyendo la primera zona del mundo. Cada tema del colegio "
        "se convertirá en un lugar nuevo para explorar.",
        "Vuelve pronto.",
    ],
    "juegos_titulo": "Zonas abiertas",
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
    return ('<footer class="site-foot k-pie">\n'
            '  <p>' + e(credits["designed"]) + '</p>\n'
            '  <p>' + e(credits["copyright"]) + '</p>\n'
            '  <p><a href="' + e(credits["legalHref"]) + '">' + e(credits["legalLink"]) + '</a></p>\n'
            '</footer>\n')


# Estilos propios de las paginas del sitio, encima de assets/kit.css.
SITE_CSS = """
.legal h2 { font-size: 1.2rem; margin-top: 26px; }
.legal section:first-child h2 { margin-top: 0; }
.legal p { max-width: 70ch; }
.lic { margin-top: 12px; display: grid; gap: 12px; }
.lic__item { border: 2px solid #B9A58A; border-radius: 8px; padding: 12px 14px; background: #FFFDF6; }
.lic__item h4 { font-size: 1rem; margin: 0 0 6px; }
.lic__item dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; font-size: .95rem; margin: 0; }
.lic__item dt { color: #5C4A3B; font-weight: 700; }
.lic__item dd { margin: 0; overflow-wrap: anywhere; }
.lic__item code { font-size: .9rem; }
.lic__plegado { margin-top: 18px; }
.lic__plegado summary { cursor: pointer; font-weight: 800; font-size: 1.05rem; padding: 10px 0; }
.back { display: inline-block; margin-top: 22px; font-weight: 800; }
.zonas { display: grid; gap: 12px; margin-top: 18px; }
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
        # Lo que no se publica va plegado: en movil alargaba mucho la pagina.
        plegar = sec["titulo"].startswith("Solo en desarrollo")
        titulo = html.escape(sec["titulo"])
        partes.append(('<details class="lic__plegado"><summary>' + titulo + '</summary>' if plegar
                       else '<h3>' + titulo + '</h3>') + '\n<div class="lic">')
        for f in filas:
            total += 1
            partes.append(
                '<div class="lic__item"><h4>' + md_inline(f[0]) + '</h4><dl>' +
                ''.join('<dt>' + html.escape(cab[i]) + '</dt><dd>' + md_inline(f[i]) + '</dd>' for i in (1, 2, 3)) +
                '</dl></div>')
        partes.append('</div>' + ('</details>' if plegar else ''))
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


def mundo_scripts():
    """Paletas, capa del mundo, arte procesado y bioma Caverna, en orden."""
    paletas = json.loads(read("assets", "paletas.json"))
    partes = ["window.SAMSAN_PALETAS = " + json.dumps({"contorno": paletas["contorno"], "rampas": paletas["rampas"]}) + ";",
              "window.SAMSAN_IMG = " + json.dumps(imagenes()) + ";"]
    for f in MUNDO:
        partes.append(read("assets", "mundo", f))
    partes.append(read("temas", "maths", "bioma.js"))
    return "".join("<script>\n" + p + "\n</script>\n" for p in partes)


# Orden de carga de la capa del mundo.
MUNDO = ["base.js", "lienzo.js", "luz.js", "particulas.js", "capas.js", "sprites.js"]


def imagenes():
    """Arte ya procesado por tools/arte/ (assets/img/ comun y temas/<materia>/img/) como data URI.
    { 'caverna': { 'antorcha': 'data:image/png;base64,...' } }. Ningun PNG crudo."""
    out = {}
    for bioma, carpeta in (("comun", os.path.join(ROOT, "assets", "img")),
                           ("caverna", os.path.join(ROOT, "temas", "maths", "img"))):
        if not os.path.isdir(carpeta):
            continue
        for nombre in sorted(os.listdir(carpeta)):
            if not nombre.endswith(".png"):
                continue
            with open(os.path.join(carpeta, nombre), "rb") as fh:
                b64 = base64.b64encode(fh.read()).decode("ascii")
            out.setdefault(bioma, {})[nombre[:-4]] = "data:image/png;base64," + b64
    return out


def build_portada(kit, brand, credits, publicados):
    e = html.escape
    page = head(brand, e(PORTADA["descripcion"]), kit + SITE_CSS, "maths", "es")
    page += '<div class="k-pagina">\n'
    page += ('<header>\n  <h1 class="k-titulo">' + e(brand) + '</h1>\n'
             '  <p class="k-lema">' + e(PORTADA["lema"]) + '</p>\n</header>\n')
    page += ('<main>\n<div class="k-juego">\n'
             '  <div class="k-escena"><canvas id="mundo" role="img" aria-label="' + e(PORTADA["escena"]) + '"></canvas></div>\n'
             '  <section class="k-panel k-panel--sobre">\n'
             '    <h2>' + e(PORTADA["obra_titulo"]) + '</h2>\n' +
             ''.join('    <p>' + e(t) + '</p>\n' for t in PORTADA["obra_texto"]) +
             '  </section>\n</div>\n')
    # Solo los juegos publicables. Hoy no hay ninguno: la lista no se pinta.
    if publicados:
        page += '<section class="k-panel zonas">\n<h2>' + e(PORTADA["juegos_titulo"]) + '</h2>\n'
        for s_ in publicados:
            page += ('<p><a href="' + e(s_["slug"]) + '.html"><b>' + e(s_["topic"]) + '</b></a> &middot; ' +
                     e(s_["blurb"]) + '</p>\n')
        page += '</section>\n'
    page += '</main>\n' + foot(credits) + '</div>\n'
    page += mundo_scripts()
    page += '<script>\n' + read("assets", "sitio", "portada.js") + '\n</script>\n'
    page += '</body>\n</html>\n'
    return page


def build_legal(kit, brand, credits):
    e = html.escape
    page = head(e(LEGAL["titulo"]) + " — " + e(brand), e(LEGAL["descripcion"]), kit + SITE_CSS, "maths", "es")
    page += '<div class="k-pagina">\n'
    page += ('<header>\n  <h1 class="k-titulo">' + e(brand) + '</h1>\n'
             '  <p class="k-lema">' + e(LEGAL["titulo"]) + '</p>\n</header>\n<main class="k-panel legal">\n')
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


def build_vitrina(kit, ui, brand, credits):
    """Solo local: la muestra aprobada reconstruida sobre assets/mundo/, para
    comparar y decidir la compuerta de la etapa 1. No se publica."""
    page = head("Vitrina Caverna — " + brand, "Vitrina local del bioma Caverna.", kit + SITE_CSS, "maths", "es")
    page += read("assets", "sitio", "vitrina.html")
    page += foot(credits)
    page += '<script>\n' + ui + '\n</script>\n'
    page += mundo_scripts()
    page += '<script>\n' + read("assets", "sitio", "vitrina.js") + '\n</script>\n'
    page += '</body>\n</html>\n'
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

    kit = inline_fonts(read("assets", "kit.css"))
    built.insert(0, ("index.html", write("index.html", build_portada(kit, brand, credits, publicados))))
    legal = build_legal(kit, brand, credits)
    built.insert(1, ("legal.html", write("legal.html", legal)))
    # Copia local para que el enlace del pie funcione al jugar desde _local/.
    write(LOCAL + "/legal.html", legal)
    built.append((LOCAL + "/vitrina-caverna.html", write(LOCAL + "/vitrina-caverna.html", build_vitrina(kit, ui, brand, credits))))

    for rel, _ in built:
        guard(rel)

    print("Paginas construidas:")
    for rel, size in built:
        where = "publica" if "/" not in rel else "local  "
        print("  [%s] %-44s %7.1f KB" % (where, rel, size / 1024))
    print("\nSe publican solo los .html de la raiz. %s/ es para jugar y probar en este equipo." % LOCAL)


if __name__ == "__main__":
    main()
