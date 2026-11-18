// titulo: Year 2 English · Word Quest
// lang: en
/* ============================================================
   WORD QUEST — YEAR 2 · ENGLISH (v2, modo juego) · jugador menor
   "Solo palabras y ubicarlas": cada mundo es un tema de la study guide;
   la palabra activa se arrastra o se ubica tocando su zona. 3 etapas por
   mundo (2 zonas y 6 palabras, 3 y 8, todas y 10), una gema por etapa
   terminada, trajes de Pip que se desbloquean con gemas y un repaso final
   por oleadas. Textos propios; del colegio solo salen los objetivos.
   La v1 (guia-y2-english) sigue publicada y congelada.
   ============================================================ */
GUIA.iniciar({
  modo: 'juego',
  id: 'y2-english-v2',
  lang: 'en-GB',
  tema: 'y2',
  mascota: 'pip',
  mascotaNombre: 'Pip the owl',
  titulo: 'Word Quest',
  subtitulo: 'Year 2 English',
  saludo: "Hi! I'm Pip. Put every word in its place and collect *gems*!",
  leerFichas: true,
  vozAuto: true,
  velocidad: 0.85,
  musica: 'alegre',
  textos: { jefe_ok: 'Big review done!' },
  jefe: { titulo: "Pip's big review", sub: '3 waves · words from every world', color: '#A16207', claro: '#FEF9C3', oleadas: 3, palabras: 4 },
  pieles: [
    { id: 'base', nombre: 'Classic', gemas: 0 },
    { id: 'bosque', nombre: 'Forest', gemas: 3, colores: { '#4A90D9': '#3FA34D', '#2F6FA8': '#2E7D32', '#CFE6FA': '#D7F2D9' } },
    { id: 'naranja', nombre: 'Sunset', gemas: 6, colores: { '#4A90D9': '#F28C28', '#2F6FA8': '#C2410C', '#CFE6FA': '#FFE3C2' } },
    { id: 'mora', nombre: 'Berry', gemas: 9, colores: { '#4A90D9': '#A855F7', '#2F6FA8': '#7E22CE', '#CFE6FA': '#EBDDFB' } },
    { id: 'rosa', nombre: 'Rose', gemas: 12, colores: { '#4A90D9': '#EC4899', '#2F6FA8': '#BE185D', '#CFE6FA': '#FCE0EF' } },
    { id: 'oro', nombre: 'Gold', gemas: 15, colores: { '#4A90D9': '#EAB308', '#2F6FA8': '#A16207', '#CFE6FA': '#FEF3C2' } },
    { id: 'noche', nombre: 'Night', gemas: 18, colores: { '#4A90D9': '#334155', '#2F6FA8': '#1E293B', '#CFE6FA': '#CBD5E1' } }
  ],
  mundos: [
    {
      id: 'long-i', titulo: 'Long i houses', color: '#1D4ED8', claro: '#DBEAFE',
      consejo: 'Long i says its name: *i*, like in kite. Which letters make the sound?',
      pista: 'Find the letters that say i: i and e, igh, y or ie?',
      zonas: [
        { id: 'ie_', t: 'i_e', sub: 'magic e', ej: 'k*i*t*e*' }, { id: 'igh', t: 'igh', ej: 'n*igh*t' },
        { id: 'y', t: 'y', sub: 'at the end', ej: 'fl*y*' }, { id: 'ie', t: 'ie', ej: 'p*ie*' }
      ],
      palabras: [
        { t: 'bike', zona: 'ie_' }, { t: 'five', zona: 'ie_' }, { t: 'smile', zona: 'ie_' }, { t: 'time', zona: 'ie_' }, { t: 'kite', zona: 'ie_' },
        { t: 'line', zona: 'ie_' }, { t: 'ride', zona: 'ie_' }, { t: 'white', zona: 'ie_' }, { t: 'nine', zona: 'ie_' }, { t: 'hide', zona: 'ie_' },
        { t: 'night', zona: 'igh' }, { t: 'light', zona: 'igh' }, { t: 'high', zona: 'igh' }, { t: 'bright', zona: 'igh' },
        { t: 'right', zona: 'igh' }, { t: 'sight', zona: 'igh' }, { t: 'tight', zona: 'igh' }, { t: 'flight', zona: 'igh' },
        { t: 'sky', zona: 'y' }, { t: 'cry', zona: 'y' }, { t: 'fly', zona: 'y' }, { t: 'my', zona: 'y' },
        { t: 'dry', zona: 'y' }, { t: 'try', zona: 'y' }, { t: 'shy', zona: 'y' }, { t: 'why', zona: 'y' },
        { t: 'pie', zona: 'ie' }, { t: 'tie', zona: 'ie' }, { t: 'lie', zona: 'ie' }, { t: 'cried', zona: 'ie' },
        { t: 'tried', zona: 'ie' }, { t: 'dried', zona: 'ie' }, { t: 'fries', zona: 'ie' }
      ]
    },
    {
      id: 'blends', titulo: 'Blend families', color: '#C2410C', claro: '#FFEDD5',
      consejo: 'A blend is two consonants together. You hear *both* sounds: f + r = fr.',
      pista: 'Look at the first two letters. Is the second one l or r? Or does it start with s?',
      zonas: [
        { id: 'l', t: 'l blends', sub: 'bl cl fl gl pl sl', ej: '*fl*ag' },
        { id: 'r', t: 'r blends', sub: 'br cr dr fr gr pr tr', ej: '*fr*og' },
        { id: 's', t: 's blends', sub: 'sk sm sn sp st sw', ej: '*st*ar' }
      ],
      palabras: [
        { t: 'flag', zona: 'l' }, { t: 'clock', zona: 'l' }, { t: 'plane', zona: 'l' }, { t: 'glue', zona: 'l' }, { t: 'black', zona: 'l' },
        { t: 'blue', zona: 'l' }, { t: 'clap', zona: 'l' }, { t: 'flower', zona: 'l' }, { t: 'glass', zona: 'l' }, { t: 'plum', zona: 'l' },
        { t: 'frog', zona: 'r' }, { t: 'tree', zona: 'r' }, { t: 'crab', zona: 'r' }, { t: 'drum', zona: 'r' }, { t: 'grass', zona: 'r' },
        { t: 'bread', zona: 'r' }, { t: 'prize', zona: 'r' }, { t: 'brown', zona: 'r' }, { t: 'green', zona: 'r' }, { t: 'train', zona: 'r' },
        { t: 'star', zona: 's' }, { t: 'snail', zona: 's' }, { t: 'spoon', zona: 's' }, { t: 'swim', zona: 's' }, { t: 'skip', zona: 's' },
        { t: 'snake', zona: 's' }, { t: 'smile', zona: 's' }, { t: 'stop', zona: 's' }, { t: 'sky', zona: 's' }, { t: 'swing', zona: 's' }
      ]
    },
    {
      id: 'wh', titulo: 'Question words', color: '#15803D', claro: '#DCFCE7',
      consejo: 'Which question does each answer go with?',
      pista: 'A person is Who. A thing is What. A place is Where. A time is When. Because is Why.',
      zonas: [
        { id: 'who', t: 'Who?', sub: 'person', ej: 'my grandma' }, { id: 'what', t: 'What?', sub: 'thing', ej: 'a red ball' },
        { id: 'where', t: 'Where?', sub: 'place', ej: 'at the park' }, { id: 'when', t: 'When?', sub: 'time', ej: 'on Monday' },
        { id: 'why', t: 'Why?', sub: 'reason', ej: 'because it is hot' }
      ],
      palabras: [
        { t: 'my grandma', zona: 'who' }, { t: 'a firefighter', zona: 'who' }, { t: 'my teacher', zona: 'who' }, { t: 'the baby', zona: 'who' }, { t: 'a doctor', zona: 'who' },
        { t: 'a red ball', zona: 'what' }, { t: 'a banana', zona: 'what' }, { t: 'a sandwich', zona: 'what' }, { t: 'a toy car', zona: 'what' }, { t: 'a book', zona: 'what' },
        { t: 'at the park', zona: 'where' }, { t: 'in the kitchen', zona: 'where' }, { t: 'at school', zona: 'where' }, { t: 'under the table', zona: 'where' }, { t: 'at the beach', zona: 'where' },
        { t: 'on Monday', zona: 'when' }, { t: 'at night', zona: 'when' }, { t: 'in the morning', zona: 'when' }, { t: 'after lunch', zona: 'when' }, { t: 'on my birthday', zona: 'when' },
        { t: 'because it is hot', zona: 'why' }, { t: 'because I am hungry', zona: 'why' }, { t: 'because I am tired', zona: 'why' }, { t: 'because it is raining', zona: 'why' }, { t: 'because I like it', zona: 'why' }
      ]
    },
    {
      id: 'habitats', titulo: 'Where do animals live?', color: '#7E22CE', claro: '#F3E8FF',
      consejo: 'True facts about our local animals: where does each one live?',
      pista: 'Where does it find its food: up a tree, in the water or in flowers?',
      zonas: [
        { id: 'arbol', t: 'in the trees', ej: 'a monkey' },
        { id: 'agua', t: 'in the water', ej: 'a manatee' },
        { id: 'flores', t: 'near flowers', ej: 'a bee' }
      ],
      palabras: [
        { t: 'a monkey', zona: 'arbol' }, { t: 'a sloth', zona: 'arbol' }, { t: 'a parrot', zona: 'arbol' }, { t: 'a toucan', zona: 'arbol' }, { t: 'an owl', zona: 'arbol' },
        { t: 'a manatee', zona: 'agua' }, { t: 'a fish', zona: 'agua' }, { t: 'a dolphin', zona: 'agua' }, { t: 'a sea turtle', zona: 'agua' }, { t: 'a starfish', zona: 'agua' },
        { t: 'a bee', zona: 'flores' }, { t: 'a hummingbird', zona: 'flores' }, { t: 'a butterfly', zona: 'flores' }
      ]
    },
    {
      id: 'community', titulo: 'Our community', color: '#0F766E', claro: '#CCFBF1',
      consejo: 'A community has places where people live, work and help each other.',
      pista: 'Think: where do you go to do this? Who works there?',
      zonas: [
        { id: 'panaderia', t: 'bakery', ej: 'buy bread' }, { id: 'colegio', t: 'school', ej: 'learn to read' },
        { id: 'hospital', t: 'hospital', ej: 'the doctor' }, { id: 'parque', t: 'park', ej: 'play on the swings' }
      ],
      palabras: [
        { t: 'buy bread', zona: 'panaderia' }, { t: 'buy a cake', zona: 'panaderia' }, { t: 'the baker', zona: 'panaderia' },
        { t: 'learn to read', zona: 'colegio' }, { t: 'the teacher', zona: 'colegio' }, { t: 'meet my class', zona: 'colegio' },
        { t: 'the doctor', zona: 'hospital' }, { t: 'visit the sick children', zona: 'hospital' }, { t: 'see the doctor when I am ill', zona: 'hospital' },
        { t: 'play on the swings', zona: 'parque' }, { t: 'fly a kite', zona: 'parque' }, { t: 'have a picnic', zona: 'parque' }
      ]
    },
    {
      id: 'life-cycles', titulo: 'Life cycles', color: '#BE185D', claro: '#FCE7F3',
      consejo: 'Animals grow and change. Which life cycle does each stage belong to?',
      pista: 'A tadpole is a baby frog. A caterpillar becomes a butterfly. A chick becomes a hen or a rooster.',
      zonas: [
        { id: 'mariposa', t: 'butterfly', ej: 'caterpillar' }, { id: 'rana', t: 'frog', ej: 'tadpole' }, { id: 'gallina', t: 'chicken', ej: 'chick' }
      ],
      palabras: [
        { t: 'caterpillar', zona: 'mariposa' }, { t: 'chrysalis', zona: 'mariposa' }, { t: 'butterfly egg on a leaf', zona: 'mariposa' },
        { t: 'tadpole', zona: 'rana' }, { t: 'froglet', zona: 'rana' }, { t: 'adult frog', zona: 'rana' }, { t: 'frogspawn', zona: 'rana' },
        { t: 'chick', zona: 'gallina' }, { t: 'hen', zona: 'gallina' }, { t: 'rooster', zona: 'gallina' }
      ]
    }
  ]
});
