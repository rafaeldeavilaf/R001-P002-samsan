# CLAUDE.md — SAMSAN

Juego educativo web y estático para niños de 6 a 12 años. Es una base: un mundo de biomas, uno por materia, donde cada tema del colegio se construye como una zona nueva con una ficha y un generador corto. El repo es público.

Antes de cualquier tarea, lee `docs/decisiones-vigentes.md`. Es la fuente única de verdad: estado, diseño, plan por etapas y la etapa en curso.

## Comandos

```bash
npm install                            # una vez; dependencias de prueba
git config core.hooksPath .githooks    # una vez por clon; activa el control de anonimato
python3 tools/gen/<materia>_<tema>.py  # regenera los datos de un tema con validación
python3 tools/build.py                 # inlina motor, datos e imágenes en los .html de la raíz
node tools/harness.js                  # regresión completa; debe salir con código 0
node tools/verify_<materia>_<tema>.js  # verificación propia de un tema
python3 tools/arte/procesar.py <png>   # pasa un PNG generado por el pipeline de arte
python3 tools/arte/prueba_grises.py    # capturas en grises y contraste de paneles
git add -A && git commit -m "..." && git push   # Actions verifica y publica
```

Publicar es hacer push a `main`. `.github/workflows/verificar-y-publicar.yml` regenera, construye, prueba, revisa anonimato y documentos, y solo publica en GitHub Pages si todo pasa.

## Arquitectura

La estructura de abajo es el objetivo de la etapa 2. Hasta entonces, los juegos viven en `subjects/<slug>/` con un generador por materia en `tools/gen_<slug>.py`.

- `assets/` — motor compartido (`engine.js`, `engine.css`, `ui.js`, `props.js`), fuentes locales en `assets/fonts/` y arte compartido en `assets/img/`.
- `materias.js` — registro de materias (biomas) y sus temas. Un tema nuevo es una entrada aquí.
- `temas/<materia>/<tema>/data.js` — contenido de un tema. **Nunca se escribe a mano**; sale de su generador, que valida con `assert`.
- `temas/<materia>/img/` — arte del bioma de esa materia.
- `tools/gen/<materia>_<tema>.py` — generador de un tema, apoyado en `tools/gen/samsan_gen.py` (familias, variantes, sello de tres pasos, distractores, validaciones comunes).
- `tools/arte/` — pipeline de arte. Ningún PNG entra al juego sin pasar por aquí. Sus dependencias de Python van en `requirements.txt`.
- `docs/decisiones-vigentes.md` — fuente única de verdad.
- `docs/direccion-grafica.md` — reglas gráficas, paletas, pipeline y lista de generaciones de PixelLab.
- `docs/temas/<materia>-<tema>.md` — ficha de cada tema: objetivos, errores típicos, niveles, contratos.
- Cada documento de `docs/` abre con `estado:` (`vigente`, `referencia` o `reemplazado`) y `actualizado:`. Actions falla si falta.

### Escenas

Contrato en `engine.js`: `SCENES[mech]()` devuelve `mount`, `move`, `jump`, `confirm`, `markResult`, `destroy`; las escenas nuevas además `check(estado)`. Cada variante de datos declara su solución.

| Escena | Verbo | Configuración | Estado |
|---|---|---|---|
| `doors` | elegir | opciones | existe; solo como recurso ocasional |
| `forge` | Construir | reglas `categorias` y `ecuacion`, modo `pasos` | `categorias` existe; `ecuacion` y `pasos` en etapa 2 |
| `line` | Mover en la recta | vertical u horizontal, elemento faltante, bandera de estimación, piel del instrumento | etapa 2 |
| `fill` | Llenar | modos `conteo` y `balanza` | etapa 2 |
| `place` | Ordenar y Asignar | modos `secuencia` y `destinos` | etapa 3 |

Las mecánicas `bridge`, `ruler`, `planks`, `lift`, `rule`, `machine` y `smash` de los datos viejos de Maths no existen en el motor. Se mapean a `doors` en la etapa 0 y se reasignan al migrar en la etapa 3.

## Reglas que no se rompen

1. **Anonimato.** Ningún nombre real de niños, profesores ni colegio en código, textos, títulos, claves de `localStorage`, nombres de archivo, mensajes de commit ni documentos. Los jugadores son "jugador mayor" y "jugador menor". La lista vive solo en `.anonimato.local` (ignorado) y en el secreto `ANONIMATO_NOMBRES`; nunca la copies a un archivo versionado ni a un mensaje. El hook y Actions bloquean coincidencias. Las únicas excepciones son el crédito exacto del autor y el usuario de GitHub `rafaeldeavilaf`, declarados en `.anonimato.permitidos`; no agregues nada más a ese archivo sin que Rafael lo pida.
2. **Cero peticiones a terceros en tiempo de juego.** Fuentes, scripts e imágenes salen del propio repo. Voz solo con voces `localService === true`.
3. **Nada sale del navegador.** Sin backend, cuentas, analítica ni cookies. Progreso en `localStorage` y en el archivo que el usuario exporta.
4. **Nada mide aciertos frente al niño.** Sin porcentajes, sin "primer intento", sin comparar partidas. Gemas por tramo completado.
5. **Aprender es la mecánica.** Un nivel que se pueda jugar igual con cuatro botones está mal. `doors` nunca es verbo principal.
6. **El motor cambia solo de forma aditiva y genérica.** Ninguna escena nueva modifica `doors`, `forge` existente, `Runner` ni `answer()`. Ningún texto visible vive en el motor.
7. **Una mecánica declarada en datos sin escena es error de build.**
8. **El material del colegio es temario.** Nunca se copia texto, ejercicios, contextos ni respuestas de libros, guías o tareas. Nunca entran fotos de tareas al repo.
9. **Legibilidad gráfica.** Paneles con texto siempre claros con contraste AA; instrumentos pedagógicos dibujados por código; ningún significado solo por color. Detalle en `docs/direccion-grafica.md`.
10. **Créditos y notas legales.** Todo juego muestra, en la pantalla de créditos y en el pie del sitio, "Diseñado por Rafael De Avila Fadul", el aviso de derechos de autor y un enlace a la página de notas legales (`legal.html`): uso educativo gratuito, sin afiliación con ningún colegio, privacidad (nada sale del navegador, sin cookies ni analítica) y licencias de terceros según `docs/licencias.md`. El crédito nunca va en el título, en claves de almacenamiento ni en nombres de archivo.

## Definición de terminado

- [ ] Generadores corren sin errores de `assert`.
- [ ] `python3 tools/build.py` termina sin error y cada `.html` pesa menos de 1,5 MB.
- [ ] `node tools/harness.js` sale con código 0.
- [ ] Cada escena tocada tiene prueba que resuelve todas sus variantes con la solución declarada y falla con una incorrecta, con ratón, táctil simulado y teclado.
- [ ] `tools/arte/prueba_grises.py` pasa si se tocó arte o interfaz.
- [ ] Capturas de la pantalla cambiada en 1366×768 y 390×844, revisadas.
- [ ] El commit pasa el hook de anonimato y Actions queda en verde.
- [ ] Horas usadas comparadas contra el tope de la etapa en curso.
- [ ] `docs/decisiones-vigentes.md` actualizado en el mismo commit si cambió un estado, una decisión o el avance del plan.

No se declara nada terminado leyendo el código. Se verifica corriendo.

## Skills del repo

- `nuevo-tema` — construir un tema del colegio sobre la base, desde la ficha hasta el enlace publicado. Úsala para todo tema nuevo y para migrar los juegos viejos.

No empieces una etapa sin que Rafael confirme que la anterior pasó su compuerta.
