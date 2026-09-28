---
name: nuevo-tema
description: Construye un tema del colegio sobre la base de SAMSAN, desde la ficha del tema hasta el enlace publicado, en cualquier materia (Maths, Science, English, Español u otra). Úsala siempre que Rafael traiga una guía, un correo del colegio, fotos de tareas o una ficha en docs/temas/, pida niveles para un tema nuevo, o pida migrar un juego viejo a la base, aunque no diga "tema" ni "skill".
---

# Nuevo tema

Un tema es una ficha en `docs/temas/`, un generador en `tools/gen/`, sus datos generados, una entrada en `materias.js` y, si es la primera zona de su materia, el arte del bioma. El motor no se toca salvo para agregar una configuración genérica a una escena.

Sigue los pasos en orden. No saltes el paso 4: sin él se vuelve a construir un examen con dibujitos.

## 1. Partir de la ficha

Si existe `docs/temas/<materia>-<tema>.md`, léela completa y úsala como contrato. Si no existe, escríbela primero con el formato de `docs/temas/maths-y6-la-mina.md` y pídele a Rafael que la apruebe antes de escribir código.

Del material del colegio solo salen objetivos de aprendizaje. No copies enunciados, ejercicios, contextos, nombres ni respuestas. Las fotos de tareas nunca entran al repo; si traen respuestas de un niño, pueden estar mal y nunca se usan como correctas.

## 2. Errores típicos

Uno o dos por objetivo, propios del tema. Marca uno como eje. De ellos salen los distractores del ítem pictórico y el error visible.

## 3. Jugador

Year 1 a 3: 8 ítems por nivel, instrucciones con voz, respuesta sin depender de leer. Year 4 a 6: 12 ítems por nivel.

## 4. Verbo de cada nivel

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

## 5. Estructura del nivel

- Tres tramos y un jefe que combina verbos ya vistos.
- Cada tramo es un sello de tres ítems de la misma familia: concreto (manipula), pictórico (ve la figura y toca la respuesta), abstracto (formato del cuaderno del colegio, con teclado numérico en pantalla cuando aplica).
- Primer ítem medio resuelto con una sola acción posible; la regla se nombra después.
- Dos ítems de repaso del nivel anterior.
- La pista gráfica desaparece en el tercer tramo.
- Error visible definido para cada verbo usado.

## 6. Mundo y arte

La zona vive en el bioma de su materia. Contextos, personajes y textos originales, escritos en el generador, nunca en el motor.

Si la materia no tiene bioma, sigue `docs/direccion-grafica.md`: define su paleta, pide a Rafael las generaciones de PixelLab de la tabla, pasa cada PNG por `tools/arte/procesar.py`, deriva los tiles con `tools/arte/tiles.py` y corre `tools/arte/prueba_grises.py`. Instrumentos pedagógicos siempre por código.

## 7. Generador

Escribe `tools/gen/<materia>_<tema>.py` sobre `tools/gen/samsan_gen.py`. Valida con `assert`:

- ids y enunciados únicos;
- cada variante declara su solución y esa solución satisface la regla de su escena;
- una sola respuesta correcta donde aplica;
- los distractores incluyen el error eje donde aplica;
- ningún valor sale del rango del instrumento;
- cada `mech` existe en `SCENES`;
- ningún texto coincide con la lista de anonimato.

Registra el tema en `materias.js`.

## 8. Construir y verificar

Corre la definición de terminado de `CLAUDE.md`. Escribe `tools/verify_<materia>_<tema>.js`: juega cada nivel con la solución declarada y con una incorrecta, con ratón, táctil simulado y teclado, y toma capturas en 1366×768 y 390×844.

## 9. Entregar

Resume a Rafael en español, sin tecnicismos innecesarios:

- niveles construidos y verbo de cada uno;
- horas usadas contra la estimación de la ficha;
- lo que no se pudo hacer y por qué;
- las tres señales para observar al niño: vuelve solo dos veces en siete días, dónde deja de jugar, y si puede inventar un reto parecido y resolverlo.

Actualiza `docs/decisiones-vigentes.md` en el mismo commit. Publica solo si Rafael lo confirma.
