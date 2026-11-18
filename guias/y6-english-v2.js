// titulo: Year 6 English · Word Drop
// lang: en
/* ============================================================
   WORD DROP — YEAR 6 · ENGLISH (v2, modo juego) · jugador mayor
   "Solo palabras y ubicarlas": cada mundo es un tema de la study guide;
   la palabra activa se arrastra o se ubica tocando su zona. 3 etapas por
   mundo, una gema por etapa terminada, skins de Z1P que se desbloquean con
   gemas y un Boss por oleadas. Estetica de consola (tema y6).
   Textos propios; del colegio solo salen los objetivos.
   La v1 (guia-y6-english) sigue publicada y congelada.
   ============================================================ */
GUIA.iniciar({
  modo: 'juego',
  id: 'y6-english-v2',
  lang: 'en-GB',
  tema: 'y6',
  mascota: 'z1p',
  mascotaNombre: 'Z1P the drone',
  titulo: 'Word Drop',
  subtitulo: 'Year 6 English',
  saludo: 'Z1P online. Drop each word in the right zone. Collect *gems*, unlock skins, beat the boss.',
  leerFichas: false,
  vozAuto: false,
  velocidad: 0.95,
  musica: 'synth',
  textos: {
    jugar: 'Play', mapa: 'WORLD MAP', trajes: 'SKINS', etapa: 'Stage', etapa_ok: 'Stage clear!', jefe_ok: 'Boss down!',
    nuevo_traje: 'Skin unlocked', bravo: ['Nice!', 'GG!', 'Clean!'], otra: 'Replay (new words)', listo: 'Got it',
    reiniciar: 'Reset progress', confirmar: 'Reset all gems and skins?', vencido: 'CLEARED'
  },
  jefe: { titulo: 'Boss · Exam mix', sub: '4 waves · zones change every wave', color: '#F87171', claro: '#3B1010', oleadas: 4, palabras: 5 },
  pieles: [
    { id: 'base', nombre: 'Steel', gemas: 0 },
    { id: 'neon', nombre: 'Neon', gemas: 3, colores: { '#CBD5E1': '#D9F99D', '#94A3B8': '#84CC16', '#64748B': '#3F6212', '#22D3EE': '#F0ABFC' } },
    { id: 'magma', nombre: 'Magma', gemas: 6, colores: { '#CBD5E1': '#FECACA', '#94A3B8': '#EF4444', '#64748B': '#991B1B', '#22D3EE': '#FDE047' } },
    { id: 'hielo', nombre: 'Frost', gemas: 9, colores: { '#CBD5E1': '#F0F9FF', '#94A3B8': '#7DD3FC', '#64748B': '#0369A1', '#22D3EE': '#FFFFFF' } },
    { id: 'vacio', nombre: 'Void', gemas: 12, colores: { '#CBD5E1': '#64748B', '#94A3B8': '#334155', '#64748B': '#0F172A', '#22D3EE': '#F472B6' } },
    { id: 'oro', nombre: 'Gold', gemas: 15, colores: { '#CBD5E1': '#FEF3C7', '#94A3B8': '#F59E0B', '#64748B': '#B45309', '#22D3EE': '#22D3EE' } },
    { id: 'holo', nombre: 'Holo', gemas: 21, colores: { '#CBD5E1': '#E9D5FF', '#94A3B8': '#A78BFA', '#64748B': '#5B21B6', '#22D3EE': '#A3E635' } }
  ],
  mundos: [
    {
      id: 'adverbs', titulo: 'Adverbs', color: '#22D3EE', claro: '#0C2A33',
      consejo: 'An adverb or adverbial phrase tells us *how*, *when*, *where* or *how often*.',
      pista: 'Ask the question: How? When? Where? How often?',
      zonas: [
        { id: 'how', t: 'How?', ej: 'carefully' }, { id: 'when', t: 'When?', ej: 'after lunch' },
        { id: 'where', t: 'Where?', ej: 'under the bridge' }, { id: 'often', t: 'How often?', ej: 'twice a week' }
      ],
      palabras: [
        { t: 'quickly', zona: 'how' }, { t: 'carefully', zona: 'how' }, { t: 'with a big smile', zona: 'how' }, { t: 'loudly', zona: 'how' }, { t: 'gently', zona: 'how' }, { t: 'in silence', zona: 'how' },
        { t: 'yesterday', zona: 'when' }, { t: 'after lunch', zona: 'when' }, { t: 'at midnight', zona: 'when' }, { t: 'tomorrow', zona: 'when' }, { t: 'last week', zona: 'when' }, { t: 'soon', zona: 'when' },
        { t: 'outside', zona: 'where' }, { t: 'under the bridge', zona: 'where' }, { t: 'upstairs', zona: 'where' }, { t: 'everywhere', zona: 'where' }, { t: 'at the station', zona: 'where' }, { t: 'nearby', zona: 'where' },
        { t: 'always', zona: 'often' }, { t: 'once a month', zona: 'often' }, { t: 'twice a week', zona: 'often' }, { t: 'rarely', zona: 'often' }, { t: 'never', zona: 'often' }, { t: 'sometimes', zona: 'often' }
      ]
    },
    {
      id: 'prepositions', titulo: 'Prepositional phrases', color: '#A3E635', claro: '#1A2E05',
      consejo: 'A prepositional phrase can show *place*, *time* or *direction* (which way something moves).',
      pista: 'Place = where it is. Time = when. Direction = which way it moves.',
      zonas: [
        { id: 'place', t: 'Place', ej: 'behind the door' }, { id: 'time', t: 'Time', ej: 'before lunch' }, { id: 'dir', t: 'Direction', ej: 'into the pool' }
      ],
      palabras: [
        { t: 'under the table', zona: 'place' }, { t: 'between the trees', zona: 'place' }, { t: 'behind the door', zona: 'place' },
        { t: 'next to the window', zona: 'place' }, { t: 'inside the box', zona: 'place' }, { t: 'beside the river', zona: 'place' },
        { t: 'before lunch', zona: 'time' }, { t: 'during the film', zona: 'time' }, { t: 'at seven o’clock', zona: 'time' },
        { t: 'after school', zona: 'time' }, { t: 'on Monday', zona: 'time' }, { t: 'in the morning', zona: 'time' },
        { t: 'onto the stage', zona: 'dir' }, { t: 'into the pool', zona: 'dir' }, { t: 'towards the hill', zona: 'dir' },
        { t: 'out of the house', zona: 'dir' }, { t: 'through the tunnel', zona: 'dir' }, { t: 'down the slide', zona: 'dir' }
      ]
    },
    {
      id: 'verbs', titulo: 'Verb forms', color: '#F472B6', claro: '#3B0F24',
      consejo: 'Present simple: *plays*, *goes*. Present continuous: *am / is / are* + verb*-ing*.',
      pista: 'Is there am, is or are with an -ing verb? Then it is the present continuous.',
      zonas: [
        { id: 'sp', t: 'Present simple', sub: 'habits and facts', ej: 'she plays' }, { id: 'pc', t: 'Present continuous', sub: 'happening now', ej: 'she is playing' }
      ],
      palabras: [
        { t: 'he plays', zona: 'sp' }, { t: 'she goes', zona: 'sp' }, { t: 'it rains', zona: 'sp' }, { t: 'they swim', zona: 'sp' }, { t: 'we eat', zona: 'sp' },
        { t: 'water boils', zona: 'sp' }, { t: 'the sun rises', zona: 'sp' }, { t: 'she reads', zona: 'sp' },
        { t: 'he is playing', zona: 'pc' }, { t: 'they are running', zona: 'pc' }, { t: 'I am reading', zona: 'pc' }, { t: 'it is raining', zona: 'pc' },
        { t: 'we are sleeping', zona: 'pc' }, { t: 'she is singing', zona: 'pc' }, { t: 'you are watching', zona: 'pc' }, { t: 'the baby is crying', zona: 'pc' }
      ]
    },
    {
      id: 'agreement', titulo: 'Is or are?', color: '#FBBF24', claro: '#3A2A05',
      consejo: 'One person or thing → *is*. More than one → *are*. Find the real subject: "the box *of pencils*" is one box.',
      pista: 'One person or thing → is. More than one → are.',
      zonas: [
        { id: 'is', t: '… is', sub: 'singular', ej: 'Everybody' }, { id: 'are', t: '… are', sub: 'plural', ej: 'My friends' }
      ],
      palabras: [
        { t: 'Everybody', zona: 'is' }, { t: 'One of the boys', zona: 'is' }, { t: 'The bag of apples', zona: 'is' }, { t: 'My teacher', zona: 'is' },
        { t: 'Nobody', zona: 'is' }, { t: 'The list of names', zona: 'is' }, { t: 'Each student', zona: 'is' }, { t: 'The news', zona: 'is' },
        { t: 'My friends', zona: 'are' }, { t: 'The book and the pen', zona: 'are' }, { t: 'The students in my class', zona: 'are' }, { t: 'My cousin and I', zona: 'are' },
        { t: 'The players', zona: 'are' }, { t: 'The cat and the dog', zona: 'are' }, { t: 'Both of my sisters', zona: 'are' }, { t: 'The shoes under the bed', zona: 'are' }
      ]
    },
    {
      id: 'conjunctions', titulo: 'Conjunctions', color: '#A78BFA', claro: '#221A40',
      consejo: '*Coordinating* conjunctions join two equal parts, like two main clauses. *Subordinating* conjunctions start a subordinate clause.',
      pista: 'and, but, or, so, yet join equals. because, although, if, when… start a subordinate clause.',
      zonas: [
        { id: 'coord', t: 'Coordinating', sub: 'joins two equal parts', ej: 'but' }, { id: 'sub', t: 'Subordinating', sub: 'starts a subordinate clause', ej: 'because' }
      ],
      palabras: [
        { t: 'and', zona: 'coord' }, { t: 'but', zona: 'coord' }, { t: 'or', zona: 'coord' }, { t: 'so', zona: 'coord' }, { t: 'yet', zona: 'coord' },
        { t: 'because', zona: 'sub' }, { t: 'although', zona: 'sub' }, { t: 'unless', zona: 'sub' }, { t: 'if', zona: 'sub' },
        { t: 'while', zona: 'sub' }, { t: 'when', zona: 'sub' }, { t: 'until', zona: 'sub' }
      ]
    },
    {
      id: 'clauses', titulo: 'Main or subordinate?', color: '#FB923C', claro: '#3A1D08',
      consejo: 'A *main clause* makes sense on its own. A *subordinate clause* needs a main clause.',
      pista: 'Can it stand alone as a sentence? Then it is a main clause.',
      zonas: [
        { id: 'main', t: 'Main clause', sub: 'makes sense alone', ej: 'we ate pizza' }, { id: 'sub', t: 'Subordinate clause', sub: 'needs a main clause', ej: 'because we were hungry' }
      ],
      palabras: [
        { t: 'we ate pizza', zona: 'main' }, { t: 'the train left', zona: 'main' }, { t: 'she laughed', zona: 'main' }, { t: 'the plant grows', zona: 'main' },
        { t: 'the bus was late', zona: 'main' }, { t: 'we went to the beach', zona: 'main' }, { t: 'my dog barked', zona: 'main' }, { t: 'the sun came out', zona: 'main' },
        { t: 'because we were hungry', zona: 'sub' }, { t: 'after the film ended', zona: 'sub' }, { t: 'unless you practise', zona: 'sub' }, { t: 'if you water it', zona: 'sub' },
        { t: 'although it was cold', zona: 'sub' }, { t: 'when the bell rang', zona: 'sub' }, { t: 'because she was tired', zona: 'sub' }, { t: 'while we waited', zona: 'sub' }
      ]
    },
    {
      id: 'perspective', titulo: 'Narrative perspective', color: '#60A5FA', claro: '#0F2440',
      consejo: 'The pronouns show who tells the story and who it is told to: *I/we* (1st), *you* (2nd), *he/she/they* (3rd).',
      pista: 'I, me, my, we, our → first. You, your → second. He, she, they, his, her, their → third.',
      zonas: [
        { id: '1', t: '1st person', ej: 'I, we' }, { id: '2', t: '2nd person', ej: 'you' }, { id: '3', t: '3rd person', ej: 'he, she, they' }
      ],
      palabras: [
        { t: 'I', zona: '1' }, { t: 'me', zona: '1' }, { t: 'my', zona: '1' }, { t: 'we', zona: '1' }, { t: 'us', zona: '1' }, { t: 'our', zona: '1' },
        { t: 'you', zona: '2' }, { t: 'your', zona: '2' }, { t: 'yours', zona: '2' }, { t: 'yourself', zona: '2' },
        { t: 'he', zona: '3' }, { t: 'she', zona: '3' }, { t: 'they', zona: '3' }, { t: 'his', zona: '3' }, { t: 'her', zona: '3' }, { t: 'their', zona: '3' }, { t: 'them', zona: '3' }
      ]
    }
  ]
});
