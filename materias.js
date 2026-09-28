/* ============================================================
   REGISTRO DE MATERIAS Y TEMAS — SAMSAN
   Materia = bioma; tema = zona dentro del bioma. Un tema nuevo es una
   entrada en `temas` (skill `nuevo-tema`). Sus datos salen de
   tools/gen/<materia>_<tema>.py hacia temas/<materia>/<tema>/data.js.

   `publicar` decide si tools/build.py pone el tema en la raiz (y
   Actions lo publica) o solo en _local/ para probarlo en este equipo.
   El arte del bioma vive en temas/<materia>/ (bioma.js e img/).

   Los juegos viejos siguen en subjects.js hasta que se migren en la
   etapa 3.
   ============================================================ */
window.MATERIAS = [
  {
    slug:   "maths",
    nombre: "Maths",
    bioma:  "caverna",
    accent: "maths",
    temas: [
      {
        slug:     "y6-la-mina",
        nombre:   "La Mina",
        topic:    "Adding positive and negative numbers",
        year:     "Year 6",
        jugador:  "mayor",
        added:    "2026-09-28",
        blurb:    "Thermometers and a mine lift: add across zero, and find the missing start, change or end.",
        publicar: false
      }
    ]
  }
];
