---
name: nuevo-tema
description: Construye un tema del colegio sobre la base de SAMSAN, desde la ficha del tema hasta el enlace publicado, en cualquier materia (Maths, Science, English, Español u otra). Úsala siempre que Rafael traiga una guía, un correo del colegio, fotos de tareas o una ficha en docs/temas/, pida niveles para un tema nuevo, o pida migrar un juego viejo a la base, aunque no diga "tema" ni "skill".
---

# Nuevo tema

Un tema es una ficha en `docs/temas/`, un generador en `tools/gen/`, sus datos generados, una entrada en `materias.js` y, si es la primera zona de su materia, el arte del bioma. El motor no se toca salvo para agregar una configuración genérica a una escena.

Sigue los pasos en orden. No saltes los pasos 4 y 5: sin ellos se vuelve a construir un examen con dibujitos. Cinco núcleos de La Mina se rechazaron por construir primero y probar después.

## 1. Partir de la ficha

Si existe `docs/temas/<materia>-<tema>.md`, léela completa y úsala como contrato. Si no existe, escríbela primero con el formato de `docs/temas/maths-y6-la-mina.md` y pídele a Rafael que la apruebe antes de escribir código. La ficha termina con la lista de arte del paso 7, que se llena cuando el boceto pasa la prueba.

Del material del colegio solo salen objetivos de aprendizaje. No copies enunciados, ejercicios, contextos, nombres ni respuestas. Las fotos de tareas nunca entran al repo; si traen respuestas de un niño, pueden estar mal y nunca se usan como correctas.

## 2. Errores típicos

Uno o dos por objetivo, propios del tema. Marca uno como eje. De ellos salen los distractores del ítem pictórico y el error visible.

## 3. Jugador

Year 1 a 3: 8 ítems por nivel, instrucciones con voz, respuesta sin depender de leer. Year 4 a 6: 12 ítems por nivel.

## 4. Reto de juego y boceto (con compuertas de Rafael)

Antes de escenas, generador o arte:

1. **Ficha de juego, sin código.** Una sección al principio de la ficha del tema:
   - el verbo;
   - qué hace difícil el reto además de la cuenta (tiempo, espacio, elegir bajo presión);
   - cómo son los primeros 30 segundos;
   - por qué se repite;
   - dónde la matemática es la mecánica y no un control escondido;
   - un juego de referencia del jugador (el mayor juega Minecraft, Fortnite y Rocket League).

   **Compuerta:** Rafael la aprueba o la corta.
2. **Un boceto gris.** Copia `prototipos/maths-plantilla/` como `prototipos/<materia>-<tema>/`:
   - cajas y colores planos, sin arte ni generador;
   - el nivel escrito a mano;
   - tope de 1 h.

   Prueba única: `python3 tools/build.py && node tools/humo_prototipos.js`.
3. **Prueba de Rafael.** Él (y si puede, el jugador) lo juega 3 minutos:
   - ¿se entiende sin leer instrucciones?
   - ¿pide otra ronda?

   **Compuerta:** si no pasa, una corrección o se descarta. Nada se pule antes.

Reglas de diseño aprendidas:
- Arriba es + y abajo es − (también la profundidad).
- Un tipo de botón hace una sola acción.
- Sin derrota: chocar o fallar detiene, no castiga.
- Nunca un panel simulado decide si algo es divertido.

## 5. Verbo de cada nivel

| Escena | Úsala cuando el niño debe | Ejemplos |
|---|---|---|
| `fill` modo `conteo` | completar una cantidad | cajón de diez, llenar un recipiente hasta una medida |
| `fill` modo `balanza` | encontrar lo que falta para igualar | incógnita en una suma |
| `line` | ubicar o mover un valor en una escala | termómetro, profundidad, regla, recta numérica |
| `place` modo `secuencia` | poner cosas en orden | ciclo del agua, pasos de un relato, orden de una oración |
| `place` modo `destinos` | emparejar, clasificar o rotular | seres vivos por grupo, partes de una planta, adverbio sobre el actor |
| `forge` | producir bajo una regla | ecuación y pasos, circuito, diálogo, descripción |

Prueba: si el nivel se puede jugar igual con cuatro botones, el verbo está mal. `doors` solo como recurso ocasional.

Si ninguna escena sirve, no inventes una en silencio: detente y explícale a Rafael qué verbo falta, con horas estimadas.

## 6. Estructura del nivel

- Tres tramos y un jefe que combina verbos ya vistos.
- Cada tramo es un sello de tres ítems de la misma familia: concreto (manipula), pictórico (ve la figura y toca la respuesta), abstracto (formato del cuaderno del colegio, con teclado numérico en pantalla cuando aplica).
- Primer ítem medio resuelto con una sola acción posible; la regla se nombra después.
- Dos ítems de repaso del nivel anterior.
- La pista gráfica desaparece en el tercer tramo.
- Error visible definido para cada verbo usado.

## 7. Mundo y arte

La zona vive en el bioma de su materia. Contextos, personajes y textos originales, escritos en el generador, nunca en el motor. Instrumentos pedagógicos siempre por código.

El original de todo sprite vive en la biblioteca privada R001-P003 (`../R001-P003-biblioteca-arte`, con su `README.md` y `catalogo.json`). A SAMSAN, que es público, solo llega la copia procesada por `tools/arte/`.

### Lista de arte (en la ficha, antes de generar)

Solo cuando el boceto pasó la prueba de Rafael. Agrega a la ficha una sección "Lista de arte" con una fila por pieza:

| Pieza | Dónde se usa | Decisión | Herramienta | Tamaño | Prompt | Referencia de estilo |
|---|---|---|---|---|---|---|
| Vela | prop del fondo, `temas/espanol/img/vela.png` | reutilizar `pl-019` | — | — | — | — |
| Compañero de la Jungla | base y zona, `temas/science/img/companero.png` | nueva | Create Character v3, 8 direcciones | 64 × 64 | prompt específico + prompt base | `pl-003` (vista south) |

1. **Reutiliza primero.** Busca en `catalogo.json` por nombre, prompt y categoría. Sirve una pieza en estado `crudo` o `procesado`; una `reemplazado` solo si la fila explica por qué; una `descartado`, nunca. Reutilizar escribe el id (`pl-0NN` o `cod-0NN`) y deja vacías herramienta, tamaño y prompt.
2. **Una pieza nueva lleva todo.** Herramienta y opciones de PixelLab, tamaño, y el prompt completo en inglés: el prompt específico seguido del prompt base de `docs/direccion-grafica.md` §8 copiado literal. Ningún nombre de juego, persona ni colegio en el prompt. La referencia de estilo es un id del catálogo, por defecto `pl-003` (vista south).
3. **Cuenta las generaciones.** Suma las piezas nuevas y compáralas con las que le quedan al plan de PixelLab. Si no alcanzan, dilo y propone cuáles se dibujan por código.
4. **Compuerta:** Rafael aprueba la lista antes de gastar generaciones.

### De la lista al juego

1. Rafael genera cada pieza nueva en la web de PixelLab y descarga la exportación completa (zip con `metadata.json`), nunca solo el PNG.
2. Se importa en la biblioteca, desde su raíz, y se sube allí:
   `python3 herramientas/importar.py <zip> --carpeta <personajes|mundo|interfaz|efectos>/<nombre> --herramienta "<herramienta>" --nombre "<nombre en español>" --referencia "<id>"`
3. Se procesa desde SAMSAN, con la ruta tal como figura en `archivos` del catálogo:
   `python3 tools/arte/procesar.py <ruta en la biblioteca> --bioma <bioma> --destino temas/<materia>/img --nombre <archivo.png>`
   Las texturas grises pasan por `tools/arte/tiles.py`. Cada corrida anota el destino en `usado_en` y pasa la pieza a `procesado`: hay que hacer commit en la biblioteca además del de SAMSAN.
4. Si la materia no tiene bioma, define también su paleta en `docs/direccion-grafica.md` y `assets/paletas.json`, y corre `tools/arte/prueba_grises.py`.
5. Nunca se copia a SAMSAN un PNG crudo, una exportación ni un `metadata.json`.

## 8. Generador

Escribe `tools/gen/<materia>_<tema>.py` sobre `tools/gen/samsan_gen.py`. Valida con `assert`:

- ids y enunciados únicos;
- cada variante declara su solución y esa solución satisface la regla de su escena;
- una sola respuesta correcta donde aplica;
- los distractores incluyen el error eje donde aplica;
- ningún valor sale del rango del instrumento;
- cada `mech` existe en `SCENES`;
- ningún texto coincide con la lista de anonimato.

Registra el tema en `materias.js`.

## 9. Construir y verificar

Corre la definición de terminado de `CLAUDE.md`. Escribe `tools/verify_<materia>_<tema>.js`: juega cada nivel con la solución declarada y con una incorrecta, con ratón, táctil simulado y teclado, y toma capturas en 1366×768 y 390×844.

## 10. Entregar

Resume a Rafael en español, sin tecnicismos innecesarios:

- niveles construidos y verbo de cada uno;
- piezas de arte usadas, con su id del catálogo, y generaciones gastadas;
- horas usadas contra la estimación de la ficha;
- lo que no se pudo hacer y por qué;
- las tres señales para observar al niño: vuelve solo dos veces en siete días, dónde deja de jugar, y si puede inventar un reto parecido y resolverlo.

Actualiza `docs/decisiones-vigentes.md` en el mismo commit. Publica solo si Rafael lo confirma.
