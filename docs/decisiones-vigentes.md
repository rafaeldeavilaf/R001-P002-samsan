---
estado: vigente
actualizado: 2026-09-28
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

El sitio anterior (`Cycle_test`) está apagado y su repo quedó privado el 27 de septiembre de 2026. SAMSAN vive en https://rafaeldeavilaf.github.io/R001-P002-samsan/ y publica solo la portada "en construcción" y las notas legales hasta que La Mina esté lista. Desde el cierre de la etapa 1, las dos usan el kit de interfaz nuevo y la portada lleva de fondo la Caverna viva (decorativa).

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

**Recompensa y meta.** Gemas por tramo completado, sin importar intentos, que se gastan en sombreros y en piezas para la base. Temática: **constructor de mundo** (decidido el 27 sep 2026). Cada jugador tiene una base propia que crece con lo que aprende: cada nivel superado instala una pieza permanente, y cada bioma aporta un compañero que se muda a la base cuando el jugador completa su primera zona (Caverna: un topo minero con casco y lámpara). Los biomas se recorren desde la base por portales. Sala secreta opcional por nivel. Cofre del día con tres ítems de repaso, sin castigo si no se abre. Sin rachas, sin porcentajes, sin comparar partidas.

**Dos jugadores, un computador.** Selector de perfil con avatar y tono de piel, sin nombres. Al elegir perfil, una pantalla de asentimiento en lenguaje para niños explica que lo que hacen se queda en ese computador, con opción de no continuar (RC-07). Regalo de una gema al bioma del otro jugador. Exportar e importar progreso a un archivo.

**Créditos y notas legales.** El juego muestra "Diseñado por Rafael De Avila Fadul" en la pantalla de créditos y en el pie del sitio, con aviso de derechos de autor y una página de notas legales: uso educativo gratuito, sin afiliación con ningún colegio, privacidad y licencias de terceros. Es la única excepción al control de anonimato, declarada en `.anonimato.permitidos`.

**Entrada y voz.** Tocar para tomar y tocar para soltar; arrastre opcional. Flechas y Enter en todo. Objetivos de 64 px o más. `SpeechSynthesis` solo con voces locales; sin voz local, texto con ícono.

**Cómo entra un tema nuevo.** Guía o fotos del colegio → ficha de tema en el proyecto de Claude (`docs/temas/<materia>-<tema>.md`) → Claude Code con la skill `nuevo-tema` → Actions publica si todo pasa. Costo objetivo: 3 a 4 h para un tema de números, 5 a 6 h para uno de lenguaje o ciencias, más unas 4 h de arte si es la primera zona de una materia sin bioma.

## 4. Dirección gráfica

**Estado al cierre de la etapa 1 (28 sep 2026).** La capa del mundo vive en `assets/mundo/` (lienzo, luz, partículas, parallax con niebla, sprites con 12 tonos de piel, gobernador de rendimiento) y el bioma Caverna en `temas/maths/bioma.js`. El kit de interfaz es `assets/kit.css`. El pipeline de arte es `tools/arte/` (`procesar.py`, `tiles.py`, `prueba_pipeline.py`, `prueba_grises.py`), con las paletas en `assets/paletas.json` como fuente única. Arte de PixelLab en uso: el explorador neutro y sonriente (de frente, 61 px de alto), el casco de minero anclado a la cabeza medida, el cofre de perfil y el topo minero. Los personajes se realzan sobre el mapa de luz para leerse en la penumbra. **Decisión del 27 sep: ningún personaje cuelga de una cuerda** (se lee como una horca); el pozo usa un montacargas abierto con barandilla baja, cables a la plataforma y castillete con rueda, y el error se marca con el contorno de la plataforma vacía, nunca con una silueta humana. Por código: roca, pared, antorchas, faroles, llamas, cristales y las poses de alegría y trepar. Pendiente para etapas 3 y 4: corona de cristales y capucha, que no funcionan puestas sobre la cabeza y se regeneran; una carretilla de perfil; el ladrillo, por código.

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
| 0 | Repo SAMSAN nuevo y anónimo, hook y Actions, defectos corregidos, portada con créditos y notas legales, documentos y skill instalados. **Cerrada el 27 sep 2026 con 0,6 h reales de trabajo** (2,6 h de reloj contando una pausa); compuerta verificada (run de Actions en verde y portada publicada), confirmada por Rafael | 13 | 15 | Actions en verde y la portada de SAMSAN arriba |
| 1 | Sistema gráfico moderno, partiendo de la muestra aprobada: capa de render en Canvas, cámara y escalado 6 h; luz, resplandor y tono por bioma 6 h; partículas y animación por código 6 h; parallax de cinco capas con niebla 3 h; pipeline de arte a 32 px con cambio de tono y bordes automáticos 8 h; kit de interfaz en alta resolución 6 h; mascota y bioma Caverna con PixelLab y retoque 5 h | 40 | 46 | El bioma Caverna con arte definitivo iguala o supera la muestra aprobada y pasa la prueba de grises. Compuerta aprobada el 27 sep 2026 con 1,9 h de reloj y **reabierta el mismo día** tras un panel de cuatro expertos (arte, UX infantil, psicología infantil, QA): la escena de la cuerda se leía como una horca. Se publicó un parche (portada sin cuerda ni polea, movimiento reducido arreglado, pared sin números) y queda una ronda de corrección: montacargas abierto en lugar de la cuerda, contorno de plataforma en lugar del fantasma, regla legible en móvil, encaje en el alto de un portátil, encuadre vertical en móvil, roca sin costuras, textos del prototipo, y explorador y cofre regenerados. **Cerrada el 28 sep 2026** tras la ronda de corrección, compuerta confirmada por Rafael; unas 4 h de reloj en total según los commits (1,9 h hasta la primera aprobación, 0,7 h la noche del 27 y unas 1,5 h el 28), sin horas propias reportadas aparte |
| 2 | Base y primer tema: jerarquía materia y tema 4 h, capa común 12 h, `line` 10 h, `fill` 7 h, regla `ecuacion` y modo `pasos` en `forge` 5 h, librería de generadores 3 h, arte de instrumentos 4 h, generador de La Mina 5 h, pruebas 4 h | 54 | 60 | El jugador mayor abre La Mina solo dos veces en siete días |
| 3 | Escena `place` 14 h, Maths y Español migrados a la base 6 h, biomas Biblioteca y Jungla 8 h, tema de sumas Year 2 4 h, pruebas 3 h | 35 | 40 | El jugador menor abre su tema solo dos veces en siete días |
| 4 | Mundo: base propia de cada jugador con piezas instaladas, compañeros por bioma, portales a los biomas, sombreros de premio, sala secreta, cofre, regalo | 12 | 14 | Los dos jugadores ven su base con sus piezas y compañeros |

Total 154 h, USD 0 al mes. Etapa en curso: **2** (tope 60 h), iniciada el 28 sep 2026 con la confirmación de Rafael.

**Cierre de la ronda de corrección (28 sep 2026).** Publicado: montacargas abierto (castillete en A con rueda, plataforma con barandilla, contorno punteado para el error), regla legible en móvil, escena que cabe en portátil y encuadre alto en móvil, roca y pared sin costuras, textos de "The Lift", explorador neutro y sonriente (vista "south" de PixelLab, pelo a media longitud, sin sombrero; `CABEZA` medida de nuevo en `{ cx: 17.5, frente: 14 }` y luz del casco calculada desde ella; los 12 tonos de piel solo cambian cara y manos), cofre de perfil y la sección "Solo en desarrollo" de `legal.html` plegada en un `<details>` (la página pasa de 4971 a 2982 px de alto en 390 px). El topo queda aprobado por Rafael tal como está, aunque el panel dijo que parece un ratón. Pendientes menores para etapas siguientes: corona de cristales y capucha, que no sirven puestas sobre la cabeza (regenerarlas en la etapa 3 o 4); carretilla de perfil (la de PixelLab está en tres cuartos y parece flotar); ladrillo por código cuando se necesite; faroles, cristales y postes por código con menos detalle que el arte de PixelLab; el chaleco del explorador sale azul marino tras la cuantización porque la paleta `mascota` no tiene rampa verde azulado oscuro; `mascota-lado.png` y `mascota-espalda.png` son del explorador anterior y el juego no las usa. Horas antes de la primera validación con un niño: 107 (etapas 0 a 2). Desde la etapa 4, modo operación: un tema por cada tema nuevo del colegio.

**Avance de la etapa 2 (28 sep 2026).** Hecho y verificado, sin publicar (La Mina está en `materias.js` con `publicar: false` y se construye solo en `_local/`):

- Jerarquía materia → tema: `materias.js`, `temas/maths/y6-la-mina/data.js` generado por `tools/gen/maths_y6_la_mina.py` sobre la librería `tools/gen/samsan_gen.py` (familias, sello, distractores de los errores típicos, escalera de pistas, validación con `assert`). `tools/build.py` construye cada tema con el motor, la capa del mundo y el bioma de su materia, y aplica la regla 7 también a los temas.
- Escena `line` en `engine.js`, agregada sin tocar `doors`, `forge`, `Runner` ni `answer()`: vertical, piel `montacargas` sobre la Caverna (el bioma da un `escenario`), dato faltante (`final`, `cambio`, `inicio`), bandera de estimación a la decena, primer ítem medio resuelto, `check(estado)` y error visible. Sello dentro de la escena: concreto, pictórico (cuatro opciones con E1 y E2) y abstracto (teclado en pantalla con signo menos). Instrumentos por código en `assets/mundo/instrumentos.js`.
- `RunnerSello`, agregado al lado del `Runner`: orden fijo (entrada o repaso, tres tramos de sello, jefe), reintento inmediato con otra variante y una gema al cerrar cada tramo.
- Capa común visual: `assets/comun.css` viste el shell del motor con `kit.css` en las páginas de tema (`data-capa="comun"`): paneles de papel, Nunito, botones de 64 px, escena que cabe en 1366 × 768, sin XP ni combo a la vista y compañero en tono neutro.
- `tools/verify_maths_y6_la_mina.js` resuelve cada variante con su solución y la falla con una incorrecta, con ratón, táctil simulado y teclado.

**Rediseño tras el panel del 28 sep 2026.** Un panel de expertos y gamers midió en navegador real los niveles 1 y 2 del primer bloque: coherencia 5/10 y diversión 4/10 (el termómetro no movía el mundo, la meta vivía en un contador, dos protagonistas, pictórico que se resolvía leyendo la regla, hasta 22 toques por ítem). Rafael aprobó un plan con meta de diversión ≥ 8 y objetivos académicos ≥ 8, y quitó la temperatura del juego. **Hecho el mismo día (fases A a G del plan), sin publicar:**

- Cada ítem es una misión que el mundo ejecuta: la respuesta llega al motor cuando el montacargas termina el viaje; al acertar se abre una compuerta con un cristal que el explorador guarda en el saco (el saco se vuelve la gema al cerrar el tramo); al fallar, compuerta cerrada, contorno punteado y corchete. Palancas ±10 y ±1 (AvPág/RePág y Mayús + flechas para 10). Pictórico con la punta de la flecha tapada y la franja de la regla en sombra. El topo cava hacia la bandera de estimación y se asoma si redondea bien. La luz baja por tramo. Un solo protagonista: el héroe SVG del motor viejo no aparece en los temas.
- Escalera de pistas de tres peldaños (acción mínima, figura, ejemplo resuelto): sube con cada fallo, con 20 s sin acción o al pulsar HINT con la pista abierta.
- Escena `fill`, modo `balanza` (el saco se aparta, las pesas ocupan su lugar; sin pista gráfica el brazo no avisa hasta confirmar), y regla `ecuacion` de `forge` como envoltorio (cualquier oración equivalente; el mundo ejecuta el valor que implica la oración del niño y se narra el absurdo).
- La Mina completa: 1 The Lift, 2 The Deep Galleries (jefe: el encargo del pozo con fichas), 3 The Merchant's Scales, 4 The Blacksmith's Workshop (12 encargos originales), 5 The Bottom of the Mine (tres cifras; remate: el gran cristal abre todas las compuertas e ilumina la mina). 60 ítems y 360 variantes.
- El resultado y NEXT van en una franja fija abajo: el mundo que ejecuta la respuesta se ve junto a NEXT, sin que la página salte.
- Verificación: `tools/verify_maths_y6_la_mina.js` (2898 comprobaciones: cada variante bien y mal, ratón, táctil simulado y teclado, escalera de pistas con reloj simulado), sección 13 del harness, La Mina en `prueba_grises.py` en su luz más oscura (el explorador queda a 19 de diferencia en 1366 × 768, con 18 de mínimo: margen justo) y `tools/panel_la_mina.py`, que mide lo que evalúa el panel. Medido el 28 sep en 1366 × 768 y 390 × 844: toques por ítem concreto, mediana 14 → 7; NEXT a la vista, 38 → 60 de 60 ítems en PC; el mundo cambia al tocar una palanca en todos los concretos; ocho interacciones distintas; 0 errores de JavaScript.

Tiempo de la etapa 2 hasta aquí: unas 3,3 h de reloj (tope 60 h).

**Prueba de Rafael y prototipos (28 sep 2026).** Rafael jugó La Mina y se aburrió en un minuto: cada pantalla era una sola decisión obvia (calcular y llevar el marcador), se contaban marcas porque la regla solo rotula múltiplos de 5, la recompensa no se entendía y la pantalla inicial mostraba los personajes del motor viejo. El panel simulado había proyectado 8/10 de diversión y se equivocó: midió coherencia y toques, no ganas de seguir jugando. **Regla desde ahora: la diversión la juzga Rafael jugando, nunca una proyección.** Un panel de gamers comparó seis núcleos y Rafael aprobó prototipar dos, solo locales y sin tocar el motor:

- **E. Excavar** (retirado; en 489c87e): pared de bloques con números con signo; se cava un camino y cada bloque suma al contador del pico; la puerta de la gema abre solo con el número exacto del candado. Fichas azules (+) y rojas (−) que se anulan.
- **A. Cartas de salto** (retirado; en 489c87e): el pozo con vetas a distintas profundidades, franjas de roca y una mano de cartas con signo; hay que recoger todas las vetas.
- Los dos: pantalla inicial con el explorador de PixelLab y sus 12 tonos, gema grande en el centro al completar, deshacer siempre. Datos de `tools/gen/maths_y6_prototipos.py` (tres juegos de cuatro puzzles, validados con un buscador); `tools/verify_prototipos.js` los juega todos (179 comprobaciones).
- Pendiente conocido: entre −3 y −8 m la cabeza del explorador queda en la línea del suelo y en grises se confunde con el entorno; en la luz más oscura (−12 a −27 m) la diferencia es 23 a 30. Arreglo propuesto: un borde claro alrededor del explorador, después de elegir el núcleo.

**Veredicto sobre E y A (28 sep 2026): 2/10, aburridos.** Rafael: siguen siendo "bajar desde un punto y encontrar algo"; eso se hace igual en papel. Pide un juego con reto e interacción donde se aprenda jugando. Decisiones: **sin derrota** (no se pierde; chocar solo detiene), y se diseña pensando en los juegos del jugador mayor: Minecraft, Fortnite y Rocket League. Tras una segunda ronda de ideas de dos equipos (gamers y creadores de videojuegos), Rafael eligió prototipar:

- **Globo minero** (retirado; en 990c766): se pilota en tiempo real una canasta por una caverna lateral. La velocidad vertical es la suma con signo de la carga: globos (−) tiran hacia arriba, sacos y gemas recogidas (+) hacia abajo, y las corrientes de aire suman ±. El niño enciende y apaga globos y sacos para subir, bajar o flotar, esquiva techo y piso, recoge todas las gemas y atraca en el muelle con carga exactamente 0. Barra de suma siempre visible ("▲ −2 sube", "▬ 0 flota"). Tres cavernas con datos del mismo generador (valida que el muelle es alcanzable y que el estante puede dejar la carga en 0); `tools/verify_prototipos.js` las completa con un piloto automático con la física real (192 comprobaciones en total).

**Veredicto sobre el Globo (28 sep 2026): confuso.** Rafael se confundió al "explotar globos y poner pesos". Causas:
- el mismo botón servía para dos acciones opuestas;
- el signo iba al revés de la intuición y de la profundidad de La Mina (− subía);
- había demasiadas cosas a la vez (seis botones, movimiento lateral, corrientes y gemas que cambian la carga).

Los tres prototipos rechazados salieron del árbol y siguen en la historia de git: E y A en 489c87e, el Globo en 990c766.

**Decisión: seguir con el motor, cambiar el método de diseño (28 sep 2026).** Rafael mantiene la visión de la base (un bioma por materia, un tema por zona). Los cinco rechazos tuvieron la misma causa: se construía todo (arte, física, generador, cientos de comprobaciones) antes de que él jugara. Método para cada zona, empezando por La Mina:

1. **Ficha de juego en papel, sin código.** Contiene:
   - el verbo;
   - qué hace difícil el reto además de la cuenta;
   - cómo son los primeros 30 segundos;
   - por qué se repite;
   - dónde la matemática es la mecánica;
   - un juego de referencia del jugador mayor.

   Rafael la aprueba o la corta.
2. **Un boceto gris** en `prototipos/<materia>-<tema>/`:
   - sin arte ni generador; nivel a mano;
   - tope de 1 h;
   - solo la prueba de humo `tools/humo_prototipos.js`.
3. **Prueba de Rafael,** y si puede del jugador mayor: 3 minutos. ¿Se entiende sin leer? ¿Pide otra ronda? Si no pasa, una corrección o se descarta.
4. **Solo si pasa:** arte, niveles y generador, escena aditiva del motor, pruebas completas y definición de terminado.

Reglas de diseño aprendidas:
- arriba es + y abajo es −;
- un tipo de botón hace una sola acción;
- la matemática está en el reto, no escondida en los controles;
- sin derrota;
- ningún panel simulado decide la diversión.

Para ahorrar tokens: sin agentes múltiples, y capturas solo cuando Rafael las pida.

**Carpetas según el método.**
- `assets/` es el motor.
- `temas/` guarda solo lo que pasó la prueba de Rafael.
- `prototipos/` guarda los bocetos: `comun/` tiene el inicio con 12 tonos, la gema y el sonido, y `maths-plantilla/gris.js` es el punto de partida. `tools/build.py` los construye solo en `_local/` y nunca se publican.
- `docs/referencia/` reúne los documentos en estado referencia.

**Parque de minijuegos (28 sep 2026).** Rafael cambia a algo más sencillo: un parque donde cada jugador elige su personaje y el minijuego que quiera, cada uno con un tema del colegio. El motor se mantiene. Cada materia es un área del parque y cada tema es un puesto con su minijuego. La visión de biomas en CLAUDE.md y en §1 se actualiza solo cuando un boceto pase la prueba de Rafael.

**Primer minijuego:** para el jugador menor (Year 2), «Atrapa la canasta».
- Completa el 10 atrapando la fruta justa: parejas y luego tríos.
- Ficha en `docs/temas/maths-y2-sumar-restar.md`.
- Boceto gris en `prototipos/maths-y2-canasta/atrapa.js`, con rondas 1 y 2.

La ficha de juego de La Mina queda en espera.

Pendiente en la etapa 2: Rafael (y si puede el jugador menor) juega el boceto 3 minutos. Si pasa, siguen las rondas 3 y 4, el parque con sus puestos y un minijuego para el jugador mayor. Nada se sube ni se publica hasta que Rafael lo pida. La fase H (dos jugadores) queda para la etapa 3.

## 8. Preguntas abiertas

- Ninguna. La temática del mundo se decidió el 27 sep 2026: constructor de mundo con base propia y compañeros por bioma (ver §3).

## 9. Documentos reemplazados

- Del repo anterior: `PROJECT_INSTRUCTIONS.md`, `PROMPT.md`, `PROMPT-FASE.md`, `PROMPT-PLAN-MEJORA.md` y `PRIMEROS-PASOS.md`, reemplazados por `CLAUDE.md` y la skill `nuevo-tema`.
- Del proyecto de Claude: la copia de las instrucciones, el documento técnico del repo, y los planes y bancos de Español e Inglés.
- La evaluación con tres rondas de panel vive en el Doc "Evaluación de niveles — panel de expertos (sept 2026)" del proyecto de Claude.
