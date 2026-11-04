---
estado: vigente
actualizado: 2026-11-04
descripcion: Ficha del tema Maths Y2 (valor posicional, decenas y unidades, con el ábaco) y de su juego de repaso "Abacus workshop". Boceto publicado por excepción, pendiente de la prueba de Rafael.
materia: maths
tema: y2-abaco
jugador: menor (Year 2, 6 a 7 años)
---

# Ficha de tema — Maths Y2 · Valor posicional con el ábaco

Regla 8: de los documentos del colegio solo salen objetivos. Los números del juego son propios y evitan los de los ejemplos del colegio (la verificación lo comprueba). No se copió ningún texto ni ejercicio.

## 1. Supuesto declarado

El ábaco es de varillas horizontales, 10 varillas de 10 cuentas. Una varilla llena vale una decena; las cuentas sueltas de la varilla siguiente son las unidades. Las cuentas empiezan en la posición inicial (izquierda) y se mueven al espacio de conteo (derecha). **Pendiente de confirmar por Rafael** con la herramienta del colegio: si el ábaco del salón es otro (por ejemplo, dos varillas), cambia el modelo de `canon()` y de `Abaco()` en `taller.js`.

## 2. Objetivos de aprendizaje

1. Nombrar las partes: marco, varillas, cuentas, posición inicial y espacio de conteo.
2. Construir un número llenando varillas enteras (decenas) y luego cuentas sueltas (unidades).
3. Leer el número que muestra un ábaco.
4. Componer y descomponer: `50 + 2 = 52` y `63 = 60 + 3`.
5. Sumar y quitar moviendo cuentas, incluso cuando se llena una varilla o hay que bajar de decena.

## 3. Errores típicos

- Leer las cifras al revés, 31 como 13 (eje). El verificador prueba el número invertido como respuesta equivocada de cada reto de lectura.
- Escribir las decenas como número de varillas (6 en vez de 60).
- Repartir las cuentas sin llenar cada varilla antes de pasar a la siguiente. El mensaje del juego dice que el número de cuentas es correcto y que hay que llenar primero cada varilla entera.

## 4. Ficha de juego (boceto publicado por excepción)

| Campo | Contenido |
|---|---|
| Verbo | Construir (cuentas) y Asignar (tocar la parte que se nombra), con teclado de cuaderno |
| Qué hace difícil el reto | Mover cuentas con el límite de la varilla: llenar una decena antes de seguir |
| Primeros 30 segundos | "Tap the BEADS": tocar una cuenta; luego varillas, marco, posición inicial y espacio de conteo, una parte por reto |
| Por qué se repite | Cada ronda cierra con una gema y sube de lo concreto (construir) a lo pictórico (leer) y a lo abstracto (separar, sumar) |
| La matemática es la mecánica | La cantidad es lo que se ve en el ábaco; el número solo se escribe después de contar varillas y cuentas |
| Juego de referencia | Minecraft (construir con bloques por cantidades) |

Cinco rondas: conocer, construir, leer, separar y sumar. En «Read it» y «Take it apart» el niño primero cuenta tocando: cada varilla llena (se pinta de verde y dice 10, 20, 30) y luego cada unidad; solo entonces aparece el teclado. El primer reto de lectura es una demostración animada, los dos siguientes muestran el total acumulado y los dos últimos solo un 10 por varilla. En «Build it», un DONE equivocado marca con ✗ las varillas que no cuadran. En la ronda 1 se nombra una sola parte por reto y el niño la toca directamente en el ábaco; si toca otra, el juego dice qué tocó. La primera versión (elegir un nombre y luego un marcador numerado) se descartó en la prueba de Rafael del 4 nov 2026: dos pasos sin relación visible y un número sin contraste. Del lado inicial, tocar una cuenta la mueve junto con las que están entre ella y el hueco (llenar una varilla es un toque); del lado de conteo, cada toque devuelve una sola cuenta (quitar de a una, como espera un niño). Con teclado: Arriba y Abajo cambian de varilla, Derecha e Izquierda mueven una cuenta. Escalera de pistas de tres peldaños en cada reto: acción mínima, figura (varillas etiquetadas o sombreadas) y ejemplo resuelto. Sin derrota.

## 5. Validación

`tools/verify_abaco_y2.js` (lo corre `tools/verify_repaso_y2.js`) valida los datos, comprueba que ningún número sea de los ejemplos del colegio, y juega todos los retos: una respuesta con pocas cuentas, con muchas y con las cuentas fuera de orden no gana; la solución gana con toque simulado, teclado o clic.

## 6. Deuda técnica

- Niveles escritos a mano en `prototipos/maths-y2-abaco/taller.js`. Al migrar a `temas/` pasan a un generador y a la escena `place` (modo destinos) para la ronda de partes.
- Publicado en la raíz por la excepción `// publicar: true`.

## 7. Lista de arte

| Pieza | Dónde se usa | Decisión | Herramienta | Tamaño | Prompt | Referencia de estilo |
|---|---|---|---|---|---|---|
| Topo compañero | cliente que pide las cuentas y pantallas de ronda, `SAMSAN_IMG.caverna['companero-topo']` | reutilizar `pl-002` | — | — | — | — |
| Explorador | pantallas de ronda, `assets/img/mascota-base.png` | reutilizar `pl-003` | — | — | — | — |
| Gema | contador y gema de cada ronda, `temas/maths/img/gema.png` | reutilizar `pl-012` (procesada el 4 nov 2026 con `procesar.py`, bioma caverna) | — | — | — | — |

Cero generaciones nuevas de PixelLab. El ábaco se dibuja por código en pixel art (lienzo lógico de 132 × 134 escalado en enteros, paleta `madera`, `papel`, `oro` y `cian`, cuentas con sombra y brillo que se deslizan animadas). El marco de pizarra de las rondas también es por código (paleta `pizarra`).
