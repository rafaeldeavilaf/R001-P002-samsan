---
estado: vigente
actualizado: 2026-11-04
descripcion: Ficha del tema Maths Y2 (suma y resta con la recta numérica) y de su juego de repaso "Hop along the number line". Boceto publicado por excepción, pendiente de la prueba de Rafael.
materia: maths
tema: y2-recta-numerica
jugador: menor (Year 2, 6 a 7 años)
---

# Ficha de tema — Maths Y2 · Suma y resta con la recta numérica

Regla 8: de los documentos del colegio solo salen objetivos. Los números, los personajes y los contextos del juego son propios, y no se copió ningún ejercicio. Los materiales del colegio no entran al repo.

## 1. Objetivos de aprendizaje

1. Ubicar un número en una recta de 0 a 100.
2. Sumar contando hacia adelante y restar contando hacia atrás, de uno en uno.
3. Usar saltos de diez y saltos de uno para llegar a una meta con pocos saltos.
4. Pasar por el diez: partir un salto para pisar la decena y seguir con el resto.
5. Seguir una cuenta escrita (`33 + 6 − 4`) dibujando sus saltos en una recta vacía.

## 2. Errores típicos

- Contar el número de partida como si fuera el primer salto (eje). La recta mueve al explorador un salto a la vez y numera cada llegada.
- Saltar hacia el lado contrario al signo.
- Cruzar la decena sin pisarla y perder la cuenta. En la ronda 4 la puerta la bloquea.

## 3. Ficha de juego (boceto publicado por excepción)

| Campo | Contenido |
|---|---|
| Verbo | Mover en la recta, con presupuesto de saltos y teclado de cuaderno al final de cada ronda |
| Qué hace difícil el reto | Pocas botas: el mínimo de saltos obliga a planear decenas primero. La bandera imposible exige notar la paridad |
| Primeros 30 segundos | Poner una bandera en 33 sobre la recta 0 a 100; luego saltar de 9 a 13 con dos botones |
| Por qué se repite | Cada ronda cierra con una gema y cambia la regla: unos, decenas, puerta, botas limitadas |
| La matemática es la mecánica | Cada salto es el signo y el tamaño de la operación; no hay respuesta que se pueda adivinar con cuatro botones |
| Juego de referencia | Rocket League (planear la trayectoria con recursos limitados) |

Cinco rondas: ubicar, saltar, decenas, puerta y botas del topo. En «Gem hunt» (ubicar) el niño va primero a la decena con −10 y +10 y cava; luego la recta se acerca a esa decena, con sus 11 números rotulados, y se mueve de uno en uno hasta el número exacto. Una flecha bajo los pies del explorador marca siempre su número. Dos páginas de cuaderno por ronda, salvo la primera. Cada reto tiene escalera de pistas de tres peldaños (acción mínima, figura, ejemplo resuelto), que sube con cada fallo, con 20 s sin acción o con el botón HINT. Sin derrota: chocar o quedarse sin botas devuelve al inicio.

## 4. Validación

`tools/verify_repaso_y2.js` calcula con un solucionador (BFS) el mínimo de saltos de cada reto y exige que el presupuesto sea ese mínimo, que cada bandera de "dos formas" tenga al menos dos y que la imposible no tenga ninguna. Juega todos los retos con ratón, un reto de cada tipo con teclado y con toque simulado, y verifica las pistas.

## 5. Deuda técnica

- Los niveles están escritos a mano en `prototipos/maths-y2-recta/salto.js`, no salen de un generador. Al migrarlo a `temas/` (etapa 3) hay que pasarlos a `tools/gen/maths_y2_recta_numerica.py`, con la escena `line` horizontal (14 h de la etapa 3).
- Se publica en la raíz por la excepción `// publicar: true` (ver `decisiones-vigentes.md` §6). Si el jugador menor lo abre solo dos veces en siete días, se rehace sobre la base.

## 6. Lista de arte

| Pieza | Dónde se usa | Decisión | Herramienta | Tamaño | Prompt | Referencia de estilo |
|---|---|---|---|---|---|---|
| Explorador | personaje de la recta, `assets/img/mascota-base.png` | reutilizar `pl-003` | — | — | — | — |
| Topo compañero | ronda 5, `SAMSAN_IMG.caverna['companero-topo']` | reutilizar `pl-002` | — | — | — | — |
| Gema | contador y gema de cada ronda, `temas/maths/img/gema.png` | reutilizar `pl-012` | — | — | — | — |

Cero generaciones nuevas de PixelLab. La recta (en forma de riel), las banderas, las puertas y los arcos de salto se dibujan por código, sobre el marco de pizarra de la Caverna.
