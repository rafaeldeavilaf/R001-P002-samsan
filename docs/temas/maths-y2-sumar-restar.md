---
estado: vigente
actualizado: 2026-09-28
descripcion: Ficha del tema Maths Y2 (sumar y restar hasta 20) y de su primer minijuego del parque, "Atrapa la canasta". Boceto gris pendiente de la prueba de Rafael.
materia: maths
tema: y2-sumar-restar
jugador: menor (Year 2, 6 a 7 años)
---

# Ficha de tema — Maths Y2 · Sumar y restar hasta 20

Regla 8: de las tareas del colegio (unidades de sumar y de restar, septiembre de 2026) solo salen objetivos. No se copian ejercicios, números, personajes ni contextos, y las fotos no entran al repo.

## 1. Objetivos de aprendizaje

1. Parejas y tríos que suman 10.
2. Formar un número objetivo (6 a 15) con varias cantidades distintas.
3. Igualdad: dos sumas distintas valen lo mismo.
4. Restar como lo inverso de sumar (parte, parte, todo).
5. Comparar dos restas: si quitas más, queda menos.

## 2. Errores típicos

- Contar todo desde 1 en vez de seguir desde el número mayor (eje). El marco de 10 siempre visible lo evita.
- Creer que quitar más deja más.
- Usar dos veces la misma cantidad cuando no se puede.

## 3. Ficha de juego: «Atrapa la canasta» (primer minijuego del parque)

| Campo | Contenido |
|---|---|
| Verbo | Atrapar. Mover la canasta a izquierda y derecha es el único control: flechas, arrastrar o dos botones grandes. |
| Qué pasa | Caen frutas con puntos y su número. La canasta lleva un marco de 10 con algunas casillas llenas. Se atrapa la fruta que lo completa exacto. |
| Qué lo hace difícil | Caen varias frutas a la vez, cada vez más rápido. Hay que ver rápido cuál completa el marco. |
| Si te equivocas | Sin derrota. La fruta que sobra asoma fuera del marco con casillas rayadas y ✗, y rebota. La que no alcanza deja casillas vacías visibles. La fruta que no se atrapa vuelve a caer. |
| Primeros 30 segundos | 1. La canasta tiene 9 de 10 y cae una sola fruta de 1. 2. Caen 2 frutas y solo una sirve. 3. Caen 3. |
| Por qué se repite | Ritmo rápido y rondas de 1 minuto. La canasta se llena ante los ojos. Sin puntaje ni comparaciones (regla 4). |

Progresión:

1. **Completa el 10:** parejas.
2. **Dos frutas:** tríos; la canasta guarda lo atrapado mientras no pase de 10.
3. **Metas de 11 a 15:** dos marcos de 10.
4. **Resta:** bichos que se comen frutas; se atrapa el que deja la meta justa.

La igualdad y la comparación de restas quedan para un segundo minijuego.

**La operación siempre a la vista** (pedido de Rafael: en Year 2 se aprende el signo + y −):
- bajo la canasta se lee `7 + ? = 10`;
- al atrapar la fruta justa queda `7 + 3 = 10 ✓`;
- con la que sobra se ve `7 + 5 = 12 ✗`, rayado;
- en la ronda 2 la cadena crece: `5 + 2 + ? = 10`;
- cada fruta lleva su signo (`+3`); en la ronda de resta los bichos llevarán `−3` y la operación será `12 − 3 = 9`.

Year 2:
- no se depende de leer;
- puntos y número grande;
- botones de 64 px;
- voz solo local.

## 4. Estado

Boceto gris de las rondas 1 y 2 en `prototipos/maths-y2-canasta/atrapa.js`, que se construye en `_local/proto-maths-y2-canasta-atrapa.html`. Pendiente la prueba de Rafael: ¿se entiende sin leer y pide otra ronda?
