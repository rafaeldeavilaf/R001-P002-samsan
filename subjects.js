/* ============================================================
   REGISTRO DE JUEGOS — SAMSAN
   Un objeto por juego, el mas nuevo primero. `publicar` decide si
   tools/build.py lo pone en la raiz (y Actions lo publica) o solo en
   _local/ para probarlo en este equipo. En la etapa 2 este registro
   pasa a materias.js (materia -> tema).
   Maths y Espanol son los juegos anteriores: no se publican; se
   migran a la base en la etapa 3.
   ============================================================ */
window.SUBJECTS = [
  {
    slug:    "espanol-heliodoro-laberinto",
    subject: "Español",
    topic:   "Elementos de la narración y producción escrita",
    test:    "Cycle Test — Plan lector: Heliodoro y el laberinto secreto",
    accent:  "spanish",
    added:   "2026-09-16",
    blurb:   "Narrador, personajes, tiempo y espacio, estructura, y producción escrita (descripción y diálogo), sobre un mundo propio — El Archivo del Laberinto.",
    levels:  7,
    publicar: false
  },
  {
    slug:    "y6-maths-counting-sequences",
    subject: "Maths",
    topic:   "Counting and Sequences",
    test:    "Cycle Test #1",
    accent:  "maths",
    added:   "2026-09-05",
    blurb:   "Counting on and back with whole numbers, decimals, fractions and negatives, working out the step yourself, and position-to-term rules both ways.",
    levels:  7,
    publicar: false
  }
];
