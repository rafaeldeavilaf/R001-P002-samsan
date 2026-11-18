// titulo: Year 6 English · Study guide
// lang: en
/* ============================================================
   GUIA DE ESTUDIO — YEAR 6 · ENGLISH (jugador mayor)
   Objetivos de la study guide de mitad de año: adverbs and adverbial
   phrases, prepositions and prepositional phrases, simple present and
   present continuous, subject-verb agreement, complex sentences
   (clauses and conjunctions), narrative perspective and inference.
   Textos y ejemplos propios; del colegio solo salen los objetivos.
   Mascota: Zip, el colibri explorador (bitacora de expedicion).
   ============================================================ */
GUIA.iniciar({
  id: 'y6-english',
  lang: 'en-GB',
  tema: 'y6',
  mascota: 'zip',
  mascotaNombre: 'Zip the hummingbird',
  titulo: 'Year 6 English',
  subtitulo: 'Expedition log · Study guide',
  saludo: "I'm Zip. Six missions, one exam. Let's fly through them!",
  leerFichas: false,
  vozAuto: false,
  velocidad: 0.95,
  misiones: [
    {
      id: 'adverbs', titulo: 'Adverbs and adverbial phrases', sub: 'how · when · where · how often',
      color: '#0F766E', claro: '#D5F0EA',
      globo: 'Adverbs add detail to the verb.',
      aprende: [
        { h: 'Adverbs', p: ['An *adverb* tells us more about a verb (or an adjective or another adverb): *how*, *when*, *where* or *how often* something happens.', 'Many adverbs of manner end in *-ly*: quickly, carefully, silently.'],
          ej: [{ t: 'carefully', nota: 'how' }, { t: 'yesterday', nota: 'when' }, { t: 'outside', nota: 'where' }, { t: 'always', nota: 'how often' }] },
        { h: 'Adverbial phrases', p: 'An *adverbial phrase* is a group of words that does the same job.',
          frases: ['The fox ran *through the forest*. (where)', 'We swam *after lunch*. (when)', 'She spoke *very quietly*. (how)', 'We visit our cousins *once a month*. (how often)'] },
        { h: 'Fronted adverbials', p: 'When the adverbial comes *first*, put a *comma* after it.',
          frases: ['*Before sunrise*, the birds started to sing.', '*Without a sound*, the cat crept closer.'] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'What does each adverb or adverbial phrase tell us?',
          pista: 'Ask the question: How? When? Where? How often?',
          cajas: [{ id: 'how', t: 'How?' }, { id: 'when', t: 'When?' }, { id: 'where', t: 'Where?' }, { id: 'often', t: 'How often?' }],
          items: [
            { t: 'quickly', caja: 'how' }, { t: 'carefully', caja: 'how' }, { t: 'with a big smile', caja: 'how' },
            { t: 'yesterday', caja: 'when' }, { t: 'after lunch', caja: 'when' }, { t: 'at midnight', caja: 'when' },
            { t: 'outside', caja: 'where' }, { t: 'under the bridge', caja: 'where' }, { t: 'upstairs', caja: 'where' },
            { t: 'always', caja: 'often' }, { t: 'once a month', caja: 'often' }, { t: 'twice a week', caja: 'often' }
          ] },
        { tipo: 'tocar', orden: 'Tap every adverb or adverbial phrase in the sentence.',
          pista: 'Find the words that say how, when, where or how often the action happens.',
          frases: [
            'The fox moved *silently* *through the forest*.',
            '*Yesterday*, we visited the museum.',
            'She *always* checks her answers *carefully*.',
            '*After the storm*, the river rose *quickly*.',
            'My grandad walks *in the park* *every morning*.'
          ] }
      ]
    },
    {
      id: 'prepositions', titulo: 'Prepositions', sub: 'and prepositional phrases',
      color: '#1E3A8A', claro: '#DCE4F7',
      globo: 'Prepositions show where, when or which way.',
      aprende: [
        { h: 'Prepositions', p: 'A *preposition* links a noun to the rest of the sentence. It often shows *place*, *time* or *direction*.',
          ej: [{ t: 'under', nota: 'place' }, { t: 'between', nota: 'place' }, { t: 'during', nota: 'time' }, { t: 'before', nota: 'time' }, { t: 'across', nota: 'direction' }, { t: 'into', nota: 'direction' }] },
        { h: 'Prepositional phrases', p: 'A *prepositional phrase* = preposition + noun phrase.',
          frases: ['The keys are *under the sofa*.', 'We played football *after school*.', 'The dog jumped *into the river*.', 'We walked *across the road*. (direction)'] }
      ],
      actividades: [
        { tipo: 'tocar', orden: 'Tap every prepositional phrase.',
          pista: 'Start with the preposition (in, on, under, after…) and include the noun that follows.',
          frases: [
            'The keys are *under the sofa*.',
            'We played football *after school*.',
            'The cat jumped *over the wall*.',
            '*During the holidays*, we travelled *to the coast*.',
            'A small boat sailed *across the lake*.'
          ] },
        { tipo: 'clasificar', orden: 'Does each prepositional phrase show place, time or direction?',
          pista: 'Place = where it is. Time = when. Direction = which way it moves.',
          cajas: [{ id: 'place', t: 'Place' }, { id: 'time', t: 'Time' }, { id: 'dir', t: 'Direction' }],
          items: [
            { t: 'under the table', caja: 'place' }, { t: 'between the trees', caja: 'place' }, { t: 'behind the door', caja: 'place' },
            { t: 'before lunch', caja: 'time' }, { t: 'during the film', caja: 'time' }, { t: 'at seven o’clock', caja: 'time' },
            { t: 'onto the stage', caja: 'dir' }, { t: 'into the pool', caja: 'dir' }, { t: 'towards the hill', caja: 'dir' }
          ] }
      ]
    },
    {
      id: 'present', titulo: 'Simple present and present continuous', sub: 'habits and facts · happening now',
      color: '#B4441F', claro: '#FBE3D6',
      globo: 'Is it a habit, or is it happening right now?',
      aprende: [
        { h: 'Simple present', p: ['For *habits*, *routines* and *facts*.', 'He / she / it → add *-s* or *-es*: she plays, he brushes, it rains.', 'Clue words: always, usually, every day, never.'],
          frases: ['She *plays* the piano every day.', 'Water *boils* at 100 °C.'] },
        { h: 'Present continuous', p: ['For actions happening *now* or *around now*.', '*am / is / are* + verb*-ing*.', 'Clue words: now, right now, at the moment, Look!, Listen!'],
          frases: ['She *is playing* the piano now.', 'Look! It *is raining*.'] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Simple present or present continuous?',
          pista: 'Look for am / is / are + -ing. That is the present continuous.',
          cajas: [{ id: 'sp', t: 'Simple present', sub: 'habits and facts' }, { id: 'pc', t: 'Present continuous', sub: 'happening now' }],
          items: [
            { t: 'We go to the market every Saturday.', caja: 'sp' }, { t: 'The sun rises in the east.', caja: 'sp' },
            { t: 'My dad never drinks coffee.', caja: 'sp' }, { t: 'She usually walks to school.', caja: 'sp' },
            { t: 'Listen! The baby is crying.', caja: 'pc' }, { t: 'They are watching a film right now.', caja: 'pc' },
            { t: 'I am reading a great book at the moment.', caja: 'pc' }, { t: 'Look! The dog is chasing a ball.', caja: 'pc' }
          ] },
        { tipo: 'completar', orden: 'Complete each sentence with the right form of the verb.',
          pista: 'Find the clue word first: every day, always… or now, Look!, at the moment…',
          items: [
            { frase: 'Listen! The birds [are singing].', fichas: ['sing', 'are singing'] },
            { frase: 'Water [boils] at 100 °C.', fichas: ['boils', 'is boiling'] },
            { frase: 'Every Saturday we [go] to the market.', fichas: ['go', 'are going'] },
            { frase: 'My brother [is reading] a comic at the moment.', fichas: ['reads', 'is reading'] },
            { frase: 'She always [brushes] her teeth before bed.', fichas: ['brushes', 'is brushing'] },
            { frase: 'Look! It [is raining] again.', fichas: ['rains', 'is raining'] }
          ] }
      ]
    },
    {
      id: 'agreement', titulo: 'Subject-verb agreement', sub: 'singular and plural subjects',
      color: '#6B21A8', claro: '#EFE3F8',
      globo: 'The verb must match its subject.',
      aprende: [
        { h: 'The rule', p: ['One person or thing (*he, she, it*, the dog) → verb with *-s*: the dog *barks*.', '*Plural* subject → verb without -s: the dogs *bark*.', 'Be careful with *is / are* and *has / have*.'] },
        { h: 'Tricky subjects', p: 'Find the *real* subject. Words like "of the…" do not change it.',
          frases: ['The box *of pencils* *is* on the desk. (the box = one)', '*Each* of the students *has* a ticket.', '*Everyone* *is* ready.', 'My cousin *and* I *are* in the same class.'] }
      ],
      actividades: [
        { tipo: 'tocar', orden: 'Each sentence has one wrong verb. Tap it to fix it.',
          pista: 'Find the subject. Is it one (singular) or more than one (plural)?',
          frases: [
            'The dogs *barks|bark* at night.',
            'My sister *play|plays* the guitar.',
            'The children *is|are* in the playground.',
            'Each of the girls *have|has* a ticket.',
            'The box of crayons *are|is* on the desk.',
            'Everyone *want|wants* to win.'
          ] },
        { tipo: 'clasificar', orden: 'Does each subject go with is or are?',
          pista: 'One person or thing → is. More than one → are.',
          cajas: [{ id: 'is', t: '… is', sub: 'singular' }, { id: 'are', t: '… are', sub: 'plural' }],
          items: [
            { t: 'Everybody', caja: 'is' }, { t: 'One of the boys', caja: 'is' }, { t: 'The bag of apples', caja: 'is' }, { t: 'My teacher', caja: 'is' },
            { t: 'My friends', caja: 'are' }, { t: 'The book and the pen', caja: 'are' }, { t: 'The students in my class', caja: 'are' }, { t: 'My cousin and I', caja: 'are' }
          ] }
      ]
    },
    {
      id: 'complex', titulo: 'Complex sentences', sub: 'clauses and conjunctions',
      color: '#4D7C0F', claro: '#E7F2D3',
      globo: 'A main clause can stand alone. A subordinate clause needs it.',
      aprende: [
        { h: 'Two kinds of clause', p: ['A *main clause* makes sense on its own: *we stayed inside*.', 'A *subordinate clause* often starts with a subordinating conjunction and needs the main clause: *because it was raining*.'] },
        { h: 'Subordinating conjunctions', ej: ['because', 'although', 'when', 'if', 'while', 'unless', 'since', 'after', 'before'] },
        { h: 'Where does the comma go?', p: 'If the subordinate clause comes *first*, put a *comma* after it.',
          frases: ['We stayed inside *because it was raining*.', '*Because it was raining*, we stayed inside.'] },
        { h: 'Joining with and, but, or, so', p: 'Coordinating conjunctions join two main clauses: *I was tired, so I went to bed.*' }
      ],
      actividades: [
        { tipo: 'completar', orden: 'Choose the conjunction that makes sense.',
          pista: 'because = reason · although = surprise · unless = only if not · when / while = time · if = condition',
          items: [
            { frase: 'We stayed inside [because] it was raining.', fichas: ['because', 'although', 'unless'] },
            { frase: '[Although] she was tired, she finished her homework.', fichas: ['Although', 'Because', 'If'] },
            { frase: 'You will miss the bus [unless] you hurry.', fichas: ['unless', 'because', 'while'] },
            { frase: '[When] the bell rang, everyone ran outside.', fichas: ['When', 'Unless', 'Although'] },
            { frase: 'I read a book [while] my mum cooked dinner.', fichas: ['while', 'unless', 'although'] },
            { frase: '[If] it is sunny tomorrow, we will go to the beach.', fichas: ['If', 'Although', 'Because'] }
          ] },
        { tipo: 'tocar', orden: 'Tap the subordinate clause in each sentence.',
          pista: 'It starts with a conjunction like because, when, although or if.',
          frases: [
            '*Because it was late*, we took a taxi.',
            'The dog barked *when the post arrived*.',
            '*Although the test was hard*, she smiled.',
            'We will play outside *if the rain stops*.',
            'He brushed his teeth *before he went to bed*.'
          ] },
        { tipo: 'clasificar', orden: 'Main clause or subordinate clause?',
          pista: 'Can it stand alone as a sentence? Then it is a main clause.',
          cajas: [{ id: 'main', t: 'Main clause', sub: 'makes sense alone' }, { id: 'sub', t: 'Subordinate clause', sub: 'needs a main clause' }],
          items: [
            { t: 'we ate pizza', caja: 'main' }, { t: 'the train left', caja: 'main' }, { t: 'she laughed', caja: 'main' }, { t: 'the plant grows', caja: 'main' },
            { t: 'because we were hungry', caja: 'sub' }, { t: 'after the film ended', caja: 'sub' }, { t: 'unless you practise', caja: 'sub' }, { t: 'if you water it', caja: 'sub' }
          ] }
      ]
    },
    {
      id: 'perspective', titulo: 'Narrative perspective and inference', sub: 'who tells the story · reading between the lines',
      color: '#92400E', claro: '#FBEBD3',
      globo: 'Who is telling the story? What clues can you find?',
      aprende: [
        { h: 'Narrative perspective', p: ['*First person*: the narrator is in the story. *I, me, my, we, our*.', '*Second person*: the narrator talks to the reader. *you, your*.', '*Third person*: the narrator is outside the story. *he, she, they*, names.'],
          frases: ['*I* opened the door and *my* heart was pounding. (1st)', '*You* step into the dark cave. (2nd)', '*She* grabbed *her* coat and ran. (3rd)'] },
        { h: 'Inference', p: ['To *infer* is to work something out from *clues* in the text and what you already know.', 'Clue + what I know = inference.'],
          frases: ['Clue: *He kept looking at the clock and tapping his foot.*', 'Inference: he was *impatient* or in a hurry.'] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Which narrative perspective is each extract written in?',
          pista: 'Look at the pronouns: I/we, you, or he/she/they.',
          cajas: [{ id: '1', t: 'First person', sub: 'I, we' }, { id: '2', t: 'Second person', sub: 'you' }, { id: '3', t: 'Third person', sub: 'he, she, they' }],
          items: [
            { t: 'I opened the gate and my dog ran out.', caja: '1' }, { t: 'We laughed until our stomachs hurt.', caja: '1' },
            { t: 'You step into the cave. What will you do?', caja: '2' }, { t: 'You hold your breath and listen.', caja: '2' },
            { t: 'She grabbed her coat and ran into the rain.', caja: '3' }, { t: 'The old man looked at his watch and sighed.', caja: '3' }, { t: 'They whispered so nobody could hear.', caja: '3' }
          ] },
        { tipo: 'emparejar', orden: 'Match each clue with what you can infer.',
          pista: 'Ask yourself: what would make someone act like this?',
          titulos: ['Clue', 'Inference'], largo: true,
          pares: [
            ['Her hands were shaking and she kept looking at the door.', 'She was nervous.'],
            ['He slammed the door and refused to speak.', 'He was angry.'],
            ['Wet umbrellas stood by the door and everyone’s shoes were muddy.', 'It had been raining.'],
            ['The plate was empty and the dog was licking its lips.', 'The dog ate the food.'],
            ['She yawned and her eyes kept closing.', 'She was tired.']
          ] }
      ]
    }
  ]
});
