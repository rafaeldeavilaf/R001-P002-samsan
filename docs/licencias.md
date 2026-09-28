---
estado: vigente
actualizado: 2026-09-27
descripcion: Cada fuente y dependencia de terceros de SAMSAN, su licencia y la obligación que impone. tools/build.py toma las tablas de este archivo para la sección de licencias de legal.html.
---

# Licencias de terceros — SAMSAN

El código, los textos y el arte dibujado por código de SAMSAN son propios: © 2026 Rafael De Avila Fadul. Todos los derechos reservados.

Este archivo lista lo que viene de terceros. `tools/build.py` publica en `legal.html` cada tabla de este archivo (una sección por encabezado `##`), así que una dependencia nueva se declara aquí en el mismo commit que la trae. Solo se admiten tablas de cuatro columnas en el orden de abajo.

## Incluido en el sitio publicado

| Componente | Dónde se usa | Licencia | Obligación |
|---|---|---|---|
| Press Start 2P, de The Press Start 2P Project Authors (CodeMan38). Subconjunto latino en WOFF2 de Google Fonts, distribuido sin cambios por Fontsource 5.3.0 | Títulos, botones y rótulos. Archivo `assets/fonts/press-start-2p-latin-400.woff2`, incrustado en cada página | SIL Open Font License 1.1 | Conservar el aviso de copyright y la licencia (`assets/fonts/OFL-press-start-2p.txt`) y citarlos en `legal.html`. No vender la fuente por sí sola. "Press Start 2P" es nombre reservado: una versión modificada de la fuente no puede llamarse así |
| Nunito, de The Nunito Project Authors. Pesos 400, 700, 800 y 900, subconjunto latino en WOFF2 de Google Fonts, distribuido sin cambios por Fontsource 5.3.0 | Texto de lectura. Archivos `assets/fonts/nunito-latin-*.woff2`, incrustados en cada página | SIL Open Font License 1.1 | Conservar el aviso de copyright y la licencia (`assets/fonts/OFL-nunito.txt`) y citarlos en `legal.html`. No vender la fuente por sí sola |

## Solo en desarrollo, no se publica

| Componente | Dónde se usa | Licencia | Obligación |
|---|---|---|---|
| jsdom 24 | Pruebas del harness (`tools/harness.js`, `tools/verify_*.js`), instalado con `npm install` | MIT | Ninguna mientras no se redistribuya; si se redistribuye, conservar su aviso de copyright y licencia |
| Dependencias de jsdom (62 paquetes) | Instaladas con jsdom en `node_modules/`, que no se versiona | MIT (55), BSD-2-Clause (2), ISC (2), BSD-3-Clause (1), Apache-2.0 (1), MIT-0 (1) | Ninguna mientras no se redistribuyan. Revisar esta fila si cambia la versión de jsdom |
| Pillow | Pipeline de arte (`tools/arte/`), instalado desde `requirements.txt` | MIT-CMU (HPND) | Ninguna mientras no se redistribuya; si se redistribuye, conservar su aviso |
| Playwright para Python y el Chromium que descarga | Prueba de grises y contraste (`tools/arte/prueba_grises.py`), en local y en Actions | Apache-2.0 (Playwright); Chromium bajo BSD-3-Clause y otras | Ninguna: se ejecutan, no se distribuyen |
| GitHub Actions: `actions/checkout`, `actions/setup-python`, `actions/setup-node`, `actions/upload-pages-artifact`, `actions/deploy-pages` | Verificación y publicación en `.github/workflows/verificar-y-publicar.yml` | MIT | Ninguna: se ejecutan, no se distribuyen |
| Python 3 y Node.js | Generadores, build y pruebas | PSF License 2.0 y MIT | Ninguna: se ejecutan, no se distribuyen |
