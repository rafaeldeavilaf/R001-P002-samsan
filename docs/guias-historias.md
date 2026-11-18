---
estado: vigente
actualizado: 2026-11-18
descripcion: Historias de usuario de las guías de estudio (v1) y del modo juego (v2) con su criterio de aceptación; cada una tiene su prueba en tools/historias_guias.py o tools/historias_juegos.py, que se corren por guía.
---

# Historias de usuario · Guías de estudio

Personas.
- **Jugador menor** (Year 2, 6 a 7 años). Aprende inglés, lee poco, usa el teléfono de un adulto.
- **Jugador mayor** (Year 6, 11 años). Juega videojuegos y quiere que se sienta como un juego.
- **Adulto que acompaña.** Abre el enlace, revisa el avance y quiere que no se pierda nada.

Cada historia tiene un criterio que se mide en Chrome real con `python3 tools/historias_guias.py <guia>` (por ejemplo `y2-english` o `y6-english`). La prueba corre una guía a la vez y escribe su propio informe.

## Comunes a las dos guías

| ID | Historia | Criterio de aceptación (resultado esperado) |
|---|---|---|
| H01 | Como niño, al abrir la guía quiero ver por dónde empezar | Hay un botón grande que nombra la primera misión. Cuando la misión 1 está completa, el botón nombra la misión 2 |
| H02 | Como niño, quiero leer y oír la lección antes de practicar | Cada misión abre en Aprende. Tocar un ejemplo pide a la voz decir ese texto |
| H03 | Como niño, quiero responder tocando | Tocar una ficha y luego su caja la coloca en la caja |
| H04 | Como niño, quiero responder arrastrando con el dedo | Un arrastre táctil de la ficha a su caja la coloca. Soltar fuera la devuelve sin errores |
| H05 | Como niño, si me equivoco quiero una pista amable y que nada avance | Una ficha en la caja equivocada no entra y aparece «Try again». Al segundo error sale la pista y brilla la caja correcta |
| H06 | Como niño atascado quiero ayuda | La bombilla da la pista, luego señala una jugada y luego la hace. Con solo la bombilla se termina la actividad |
| H07 | Como niño, cada vez que entro quiero ejercicios distintos | Abrir 4 veces la misma actividad da al menos 3 tandas distintas |
| H08 | Como niño, al terminar quiero otra ronda nueva | «New round» abre la misma actividad con una tanda distinta |
| H09 | Como adulto, quiero que el avance se guarde | Tras terminar una actividad y recargar, la estrella o la XP siguen ahí |
| H10 | Como niño en el teléfono, el botón Atrás no me saca de la guía | Atrás retrocede paso a paso dentro de la guía, de la actividad a la lección y de ahí a las misiones |
| H11 | Como niño, quiero música de fondo que pueda apagar | Al primer toque la música suena. El botón la apaga y queda apagada al recargar. Si el primer toque es en el botón, la música arranca (no se apaga) |
| H12 | Como niño, quiero oír bien la voz aunque haya música | Mientras habla la voz, la música baja de volumen y vuelve al terminar |
| H13 | Como adulto, no quiero que la guía use voces por internet | Con una voz de red y una local disponibles, usa la local. Sin voz local no habla |
| H14 | Como niño, quiero usarla en cualquier teléfono o computador | Sin desborde horizontal en 360 × 640, 390 × 844, horizontal 844 × 390 y 1366 × 768. Texto con contraste AA. Botones de al menos 44 px |
| H15 | Como niño, antes del examen quiero un repaso mezclado | Recorriendo el repaso con «Next», cada tarea viene de una misión distinta (al menos 3) y la mezcla cambia al volver a entrar |
| H16 | Como adulto, no quiero que nada salga del navegador | Al usar la guía no hay pedidos de red a otros sitios |
| H17 | Como adulto, no quiero que la guía mida aciertos frente al niño | No hay porcentajes, puntajes ni «primer intento» en ninguna pantalla |
| H18 | Como adulto, quiero poder empezar de cero | «Start again» pide confirmación y deja todo en cero |
| H19 | Como niño, quiero terminar cada actividad de cada misión sin trabarme | Todas las actividades, también las variantes, se terminan sin errores de JavaScript |

## Solo Year 2 (Pip)

| ID | Historia | Criterio de aceptación |
|---|---|---|
| Y2-1 | Como niño que lee poco, quiero que me lean las instrucciones | Al abrir una actividad la voz lee la instrucción sola. Tocar una ficha la lee |
| Y2-2 | Como niño pequeño, quiero fichas fáciles de tocar | Fichas y cajas miden al menos 48 px de alto |
| Y2-3 | Como niño que construye palabras, quiero oír la palabra primero | En «build the word» la voz dice la palabra al aparecer |

## Solo Year 6 (Z1P)

| ID | Historia | Criterio de aceptación |
|---|---|---|
| Y6-1 | Como jugador de 11 años, quiero que se vea como un juego y no como para niños pequeños | Tema oscuro, Z1P, quests con cubos, barra de XP y etiquetas tipo consola |
| Y6-2 | Como jugador, quiero ganar XP y subir de nivel | Cada tarea terminada suma 50 XP, se equivoque o no. Repetirla no da XP doble. Al pasar de 150 XP aparece «Level up» |
| Y6-3 | Como jugador, quiero una insignia por cada quest | Al terminar la última tarea de una quest aparece su insignia |
| Y6-4 | Como jugador mayor, no quiero que me lean todo | La instrucción no se lee sola. El botón del parlante sí la lee |
| Y6-5 | Como jugador en el teléfono, quiero oír la música | La música de Y6 tiene en la banda de un parlante de teléfono (más de 300 Hz) al menos la energía de la de Y2, que sí se oye |

## Resultado del 18 nov 2026

Se corrió cada guía por separado en Chrome real, con los perfiles 390 × 844, 360 × 640, 844 × 390 y 1366 × 768.

| Guía | Historias | Antes de corregir | Después |
|---|---|---|---|
| Year 2 (`y2-english`) | 22 | 22 OK | 22 OK |
| Year 6 (`y6-english`) | 24 | 22 OK, 2 fallan (H14 y H15) | 24 OK |

- **H11, música (las dos guías).** Si el primer toque era el botón de música, la música arrancaba y el mismo toque la apagaba. Con la versión anterior, ese toque daba 0 osciladores en 1,5 s y el botón quedaba apagado. Ahora da 17 y queda encendido. Además, la preferencia de música ahora es de cada guía (antes apagarla en Y2 la apagaba en Y6), arranca con cualquier gesto (tocar, soltar el dedo, clic o tecla) y en iPhone pone la sesión en modo reproducción.
- **H14, Y6 en horizontal.** La palabra «a» medía 23 px de ancho en una frase para tocar. Ahora toda palabra mide al menos 32 px.
- **H15, repaso final.** La falla era de la prueba. Cada recarga arma un repaso nuevo y la prueba abría cada tarea en una página distinta. Ahora lo recorre con «Next» como el niño.
- **Y6-5, volumen en teléfono.** La energía de la música por encima de 300 Hz ya era mayor en Y6 (0,005) que en Y2 (0,0034) antes del cambio. Que no se oyera venía del arranque (H11), no de las frecuencias. Igual se reescribió el estilo `synth` con bajo una octava arriba y melodía en la zona media (0,0055).
- **Controles negativos.** El auditor detectó texto claro sobre blanco, un botón de 20 px y un bloque de 900 px inyectados a propósito.
- **Lo que no se puede probar aquí.** El sonido real en un iPhone con el interruptor de silencio y la voz real de cada teléfono. Se revisan en el equipo.

## v2 · modo juego (Word Quest y Word Drop)

Solo palabras y ubicarlas. Se prueban con `python3 tools/historias_juegos.py <guia>` (`y2-english-v2` o `y6-english-v2`), una guía a la vez.

| ID | Historia | Criterio de aceptación |
|---|---|---|
| J01 | Como niño, quiero saber qué jugar ahora | «Play» nombra la siguiente etapa sin terminar |
| J02 | Como niño, antes de un mundo nuevo quiero un consejo corto | La primera etapa de cada mundo abre un consejo con un ejemplo por zona, que se oye al tocarlo, y no se repite |
| J03 | Como niño, quiero ubicar la palabra con un toque | Tocar la zona ubica la palabra activa y sale la siguiente |
| J04 | Como niño, quiero arrastrarla con el dedo | Arrastrar la palabra a su zona la ubica |
| J05 | Como niño, si me equivoco no quiero perder | La palabra no entra y aparece «Try again». Al segundo error sale la pista y brilla la zona correcta |
| J06 | Como niño atascado, quiero ayuda | La bombilla da la pista, luego hace brillar la zona y luego ubica la palabra |
| J07 | Como niño, quiero que suba la dificultad | Etapa 1 con 2 zonas y 6 palabras, etapa 2 con 3 y 8, etapa 3 con todas y unas 10 |
| J08 | Como niño, quiero palabras distintas cada vez | 4 entradas a la misma etapa dan al menos 3 tandas distintas |
| J09 | Como niño, quiero ganar una gema por etapa | +1 gema al terminar aunque haya errores. Repetirla no suma. Se guarda al recargar |
| J10 | Como niño, quiero desbloquear y ponerle trajes a la mascota | El traje está bloqueado antes de tener las gemas. Al alcanzarlas avisa, se libera, se viste y se recuerda |
| J11 | Como niño, quiero un jefe final | El jefe trae oleadas de mundos distintos, cambian las zonas y da +3 gemas |
| J12 | Como niño en el teléfono, Atrás no me saca | Atrás desde una etapa vuelve al mapa |
| J13 | Como niño, quiero música | Suena al primer toque, también si ese toque es el botón de música |
| J14 | Como niño, quiero usarlo en cualquier pantalla | Sin desborde, con contraste AA y toques de 44 px en 4 perfiles |
| J15 | Como adulto, no quiero red ni puntajes | Sin pedidos de red y sin porcentajes ni puntaje |
| J16 | Como niño, no quiero trabarme | Todas las etapas y el jefe se terminan sin errores de JavaScript |
| J17 | Voz según la edad | Y2 lee cada palabra al aparecer. Y6 no lee sola |
| J18 | Como niño, quiero estudiar el tema que quiera | Sin progreso, cualquier mundo (tocando su tarjeta), cualquier etapa y el jefe se abren desde el mapa. Ningún botón del mapa está deshabilitado |

### Resultado del 18 nov 2026

| Guía | Historias | Primera corrida | Después |
|---|---|---|---|
| Year 2 v2 (`y2-english-v2`) | 17 | 10 OK, la prueba se detuvo en J10 | 17 OK |
| Year 6 v2 (`y6-english-v2`) | 17 | 17 OK | 17 OK |

- **J10, trajes.** Al elegir un traje, la portada se dibujaba dos veces, una debajo de la otra. Ahora la portada se vuelve a armar desde cero.
- **J16, voz y palabra rápida (encontrado por `verify_guias.js`).** En Y2, si el niño ubicaba la palabra antes de 120 ms, la lectura en voz alta lanzaba un error. Ahora la voz solo lee la palabra que sigue activa.
- La v1 se repitió completa después de congelar su motor y sigue pasando sus historias.

- **J18, temas libres (18 nov, tras la prueba de Rafael).** El mapa se veía bloqueado porque solo los círculos de etapa abrían algo y la tarjeta del mundo no respondía. Ahora toda la tarjeta abre el mundo en su siguiente etapa sin terminar, cada mundo muestra ▶ y la etapa siguiente late. Ningún mundo depende de otro.
