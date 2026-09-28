---
estado: vigente
actualizado: 2026-09-27
descripcion: Estado real, decisiones y plan por etapas de SAMSAN. Gana sobre cualquier otro documento. Lo leen el proyecto de Claude (integración de GitHub) y Claude Code.
---

# Decisiones vigentes — SAMSAN

Si otro documento contradice este, gana este. Si este contradice el código, gana el código y este se corrige en el mismo commit.

Este archivo es público. Nunca lleva nombres reales; los jugadores son "jugador mayor" (Year 6, 10 a 12 años) y "jugador menor" (Year 2, 6 a 7 años).

## 1. Qué es SAMSAN

Un juego educativo que es una base, no un juego por examen. Un mundo de biomas, uno por materia (Maths, Science, English, Español y las que vengan). Cada tema que el colegio pone se construye como una zona nueva dentro de su bioma, con una ficha de tema y un generador corto, usando escenas y una capa común que ya existen. El mundo crece a medida que llegan temas. No hay fechas de examen en el plan.

Jerarquía: materia (bioma) → tema (zona) → nivel → tramo → ítem.

## 2. Estado real de lo que existe hoy

| Juego | Estado real | Nota de diseño |
|---|---|---|
| Maths, Counting and Sequences (Year 6) | Despublicado el 27 sep 2026; su código vive en SAMSAN como punto de partida, con `publicar: false` (se construye solo en `_local/`). Sus siete mecánicas pensadas no tienen escena: desde la etapa 0 el generador las mapea a `doors` y las guarda en `mechPlan` para reasignarlas en la etapa 3 | 2 de 10 |
| Español, El Archivo del Laberinto (Year 6) | Despublicado el 27 sep 2026; vive en SAMSAN con `publicar: false` y su contenido se migra en la etapa 3. 58 ítems de puertas y 22 de construcción por piezas | 2 a 5 de 10 |
| Inglés, The Travelling Playhouse (Year 6) | Construido fuera del repo, no publicado. Se rehace como tema cuando el colegio ponga uno de Inglés | 2 de 10 |

Defectos del juego anterior, **resueltos en la etapa 0** (27 sep 2026):

- Nombres reales en sitio, claves, identificadores y documentos: fuera. Marca SAMSAN; claves `samsan:<slug>` y `samsan:hero`, sin migración. Lo vigilan el hook y Actions; solo se permiten el crédito del autor y el usuario de GitHub `rafaeldeavilaf` (`.anonimato.permitidos`).
- Estrellas por porcentaje y victoria que comparaba intentos (RC-02): reemplazadas por gemas, una por tramo completado sin importar intentos (tres tramos por nivel mientras los datos no declaren otros). La victoria, el mapa y el perfil ya no muestran primer intento, fallos, historial ni récords. Los colores de armadura se desbloquean con gemas (uno cada tres).
- Fuentes desde Google Fonts (RC-04): Press Start 2P y Nunito locales en `assets/fonts/` (OFL), incrustadas por `tools/build.py`. Ninguna página pide nada a terceros; el build lo verifica.
- Mecánicas declaradas sin escena que caían a `doors` sin error: ahora `tools/build.py` falla con un mensaje claro (regla 7) y el motor ya no cae en silencio.
- Prototipo y documentos de trabajo publicados en la raíz: la raíz publica solo `index.html` (portada) y `legal.html`; `build.py` decide qué se publica según `publicar` en `subjects.js`.

El sitio anterior (`Cycle_test`) está apagado y su repo quedó privado el 27 de septiembre de 2026. SAMSAN vive en https://rafaeldeavilaf.github.io/R001-P002-samsan/ y publica solo la portada "en construcción" y las notas legales hasta que La Mina esté lista.

## 3. Decisiones de diseño de la base

**Cinco verbos pedagógicos, cuatro escenas técnicas.** Cubren Maths, Science, English y Español sin escenas nuevas.

| Verbo | Qué hace el niño | Escena | Error visible |
|---|---|---|---|
| Llenar | Pone unidades hasta completar o equilibrar | `fill` (modos `conteo` y `balanza`) | Lo que sobra cae; la balanza se inclina y muestra la diferencia |
| Mover en la recta | Mueve un instrumento sobre una escala y se detiene | `line` (vertical u horizontal, con elemento faltante y bandera de estimación) | Un salto fantasma marca cuánto faltó o sobró |
| Ordenar | Pone piezas en secuencia; el mundo corre si está bien | `place`, modo secuencia | El mundo corre hasta la pieza equivocada y se detiene |
| Asignar | Suelta una ficha sobre algo que reacciona (incluye clasificar en grupos y rotular partes) | `place`, modo destinos | El objeto reacciona según la ficha y se ve el absurdo |
| Construir | Arma con piezas bajo una regla, incluidas ecuaciones y cadenas de pasos | `forge` (reglas `categorias` y `ecuacion`, modo `pasos`) | La máquina o la historia corre con lo que el niño armó |

**Estructura de nivel.** Year 2 con 8 ítems, Year 6 con 12. Tres tramos y un jefe. Cada tramo es un sello de tres ítems de la misma familia: concreto (se manipula), pictórico (se ve la figura y se toca la respuesta), abstracto (formato del cuaderno del colegio, con teclado numérico en pantalla). Dos verbos por nivel. Dos ítems de repaso del nivel anterior. La pista gráfica desaparece en el tercer tramo. El jefe combina verbos ya vistos. El primer ítem llega medio resuelto y la regla se nombra después de hacerla.

**Pistas.** Escalera de tres peldaños que avanza con cada fallo o con 20 segundos sin acción: acción mínima, figura, ejemplo resuelto parecido.

**Recompensa y meta.** Gemas por tramo completado, sin importar intentos, que se gastan en sombreros. Mapa de biomas donde cada nivel instala una pieza permanente. Sala secreta opcional por nivel. Cofre del día con tres ítems de repaso, sin castigo si no se abre. Sin rachas, sin porcentajes, sin comparar partidas.

**Dos jugadores, un computador.** Selector de perfil con avatar y tono de piel, sin nombres. Al elegir perfil, una pantalla de asentimiento en lenguaje para niños explica que lo que hacen se queda en ese computador, con opción de no continuar (RC-07). Regalo de una gema al bioma del otro jugador. Exportar e importar progreso a un archivo.

**Créditos y notas legales.** El juego muestra "Diseñado por Rafael De Avila Fadul" en la pantalla de créditos y en el pie del sitio, con aviso de derechos de autor y una página de notas legales: uso educativo gratuito, sin afiliación con ningún colegio, privacidad y licencias de terceros. Es la única excepción al control de anonimato, declarada en `.anonimato.permitidos`.

**Entrada y voz.** Tocar para tomar y tocar para soltar; arrastre opcional. Flechas y Enter en todo. Objetivos de 64 px o más. `SpeechSynthesis` solo con voces locales; sin voz local, texto con ícono.

**Cómo entra un tema nuevo.** Guía o fotos del colegio → ficha de tema en el proyecto de Claude (`docs/temas/<materia>-<tema>.md`) → Claude Code con la skill `nuevo-tema` → Actions publica si todo pasa. Costo objetivo: 3 a 4 h para un tema de números, 5 a 6 h para uno de lenguaje o ciencias, más unas 4 h de arte si es la primera zona de una materia sin bioma.

## 4. Dirección gráfica

Pixel art moderno, no retro. Detalle completo en `docs/direccion-grafica.md`. Lienzo de 640 × 360, tiles de 32 px, mascota de unos 48 px. El mundo se dibuja en Canvas con luz dinámica, resplandor, partículas, cinco capas de parallax, cámara suave y tono de color por bioma; los textos y paneles, en HTML nítido encima. Instrumentos pedagógicos, tiles, luz y movimiento por código; mascota, sombreros, props y texturas base por PixelLab en poses quietas (plan de prueba, 24 generaciones planeadas de 40). Paneles de texto siempre claros.

Referencia aprobada el 27 de septiembre de 2026: `docs/referencia/muestra-estilo.html`. Es el piso de calidad de todo lo gráfico.

## 5. Primer tema

`docs/temas/maths-y6-la-mina.md`: Maths Year 6, sumar positivos y negativos, valores desconocidos en sumas y problemas en palabras. Bioma Caverna, zona La Mina, cinco niveles. Segundo tema: sumas hasta 20 de Year 2, bioma Jungla de día, que reutiliza `fill` y `line`.

## 6. Infraestructura

- SAMSAN es el proyecto R001-P002 de la línea R001 (juegos educativos). Un juego nuevo para los niños entra primero como materia o tema dentro de SAMSAN; solo se abre un R001-P003 si no cabe en la base, y en ese caso copia lo que necesite de SAMSAN. No hay librería compartida entre proyectos hasta que tres proyectos activos usen la misma pieza.

- Repo público `rafaeldeavilaf/R001-P002-samsan`, con carpeta local del mismo nombre, separado de R001-P001 (Underworks, privado, que nombra a los niños), con historial limpio desde el primer commit (27 sep 2026). Sitio en https://rafaeldeavilaf.github.io/R001-P002-samsan/. El sitio anterior (`Cycle_test`) está apagado. Los commits de este repo usan como autor el crédito y el correo noreply de GitHub. Publicación por GitHub Actions: cada push regenera datos, construye, corre pruebas, anonimato y prueba de grises, y solo publica si todo pasa.
- Lista de nombres a vigilar fuera del repo: `.anonimato.local` (ignorado) y secreto `ANONIMATO_NOMBRES`. Solo nombres completos y apodos exactos; nunca fragmentos cortos que choquen con "SAMSAN".
- USD 0 al mes.

## 7. Plan por etapas

| Etapa | Qué entrega | Horas | Tope | Compuerta |
|---|---|---|---|---|
| 0 | Repo SAMSAN nuevo y anónimo, hook y Actions, defectos corregidos, portada con créditos y notas legales, documentos y skill instalados. **Cerrada el 27 sep 2026 con 0,6 h reales de trabajo** (2,6 h de reloj contando una pausa); compuerta verificada (run de Actions en verde y portada publicada), pendiente de la confirmación de Rafael | 13 | 15 | Actions en verde y la portada de SAMSAN arriba |
| 1 | Sistema gráfico moderno, partiendo de la muestra aprobada: capa de render en Canvas, cámara y escalado 6 h; luz, resplandor y tono por bioma 6 h; partículas y animación por código 6 h; parallax de cinco capas con niebla 3 h; pipeline de arte a 32 px con cambio de tono y bordes automáticos 8 h; kit de interfaz en alta resolución 6 h; mascota y bioma Caverna con PixelLab y retoque 5 h | 40 | 46 | El bioma Caverna con arte definitivo iguala o supera la muestra aprobada y pasa la prueba de grises |
| 2 | Base y primer tema: jerarquía materia y tema 4 h, capa común 12 h, `line` 10 h, `fill` 7 h, regla `ecuacion` y modo `pasos` en `forge` 5 h, librería de generadores 3 h, arte de instrumentos 4 h, generador de La Mina 5 h, pruebas 4 h | 54 | 60 | El jugador mayor abre La Mina solo dos veces en siete días |
| 3 | Escena `place` 14 h, Maths y Español migrados a la base 6 h, biomas Biblioteca y Jungla 8 h, tema de sumas Year 2 4 h, pruebas 3 h | 35 | 40 | El jugador menor abre su tema solo dos veces en siete días |
| 4 | Mundo: mapa de biomas, portales, piezas instaladas, sombreros de premio, sala secreta, cofre, regalo | 12 | 14 | Los dos jugadores ven el mapa con sus zonas |

Total 154 h, USD 0 al mes. Etapa en curso: ninguna; la etapa 1 empieza cuando Rafael confirme la compuerta de la etapa 0. Horas antes de la primera validación con un niño: 107 (etapas 0 a 2). Desde la etapa 4, modo operación: un tema por cada tema nuevo del colegio.

## 8. Preguntas abiertas

- Temática del mundo: explorador de biomas (actual) o constructor de mundo con base propia y compañeros por bioma, recomendado por el panel de jugadores del 27 de septiembre. Se decide antes de la etapa 1, porque cambia la lista de PixelLab y la etapa 4.

## 9. Documentos reemplazados

- Del repo anterior: `PROJECT_INSTRUCTIONS.md`, `PROMPT.md`, `PROMPT-FASE.md`, `PROMPT-PLAN-MEJORA.md` y `PRIMEROS-PASOS.md`, reemplazados por `CLAUDE.md` y la skill `nuevo-tema`.
- Del proyecto de Claude: la copia de las instrucciones, el documento técnico del repo, y los planes y bancos de Español e Inglés.
- La evaluación con tres rondas de panel vive en el Doc "Evaluación de niveles — panel de expertos (sept 2026)" del proyecto de Claude.
