// titulo: Year 6 English · Exam prep
// lang: en
/* ============================================================
   GUIA DE ESTUDIO — YEAR 6 · ENGLISH (jugador mayor)
   Objetivos de la study guide de mitad de año: adverbs and adverbial
   phrases, prepositions and prepositional phrases, simple present and
   present continuous, subject-verb agreement, complex sentences
   (clauses and conjunctions), narrative perspective and inference.
   Textos y ejemplos propios; del colegio solo salen los objetivos.
   Estetica de consola de juego para 11 años (18 nov 2026): modo oscuro,
   quests con XP por actividad terminada, insignias y Boss round.
   Mascota: Z1P, un dron cubo dibujado por codigo (diseño propio).
   ============================================================ */
GUIA.iniciar({
  id: 'y6-english',
  lang: 'en-GB',
  tema: 'y6',
  mascota: 'z1p',
  mascotaNombre: 'Z1P the drone',
  titulo: 'Year 6 English',
  subtitulo: 'Exam prep · Quest log',
  saludo: 'Z1P online. *6 quests* and a boss to clear before the exam. Ready?',
  leerFichas: false,
  vozAuto: false,
  velocidad: 0.95,
  musica: 'synth',
  xp: { niveles: [[0, 'Rookie'], [150, 'Grammar Scout'], [300, 'Word Explorer'], [450, 'Sentence Builder'], [650, 'Story Detective'], [850, 'Language Legend']] },
  textos: {
    misiones: 'QUESTS', empezar: 'Start', seguir: 'Continue', mision_ok: 'Quest cleared!', volver: 'Quests',
    actividad: 'Task', aprende: 'Briefing', practicar: 'Start quest', tareas: 'tasks', limpia: 'CLEARED',
    bravo: ['Nice!', 'GG!', 'Clean run!', 'Too easy!', 'Locked in!'], otra: 'New round', todo_ok: 'Replay',
    jefe_intro: 'Random tasks from every quest, mixed up. A new mix every time you enter.',
    aprendido: 'Tap any example to hear it.', reiniciar: 'Reset progress', confirmar: 'Reset all XP and quests?'
  },
  jefe: { titulo: 'Boss round · Exam mix', sub: 'random tasks from every quest', letra: '⚑', color: '#F87171', claro: '#3B1010', insignia: 'Exam Ready', globo: 'Boss incoming. Everything you trained, mixed.', max: 6 },
  misiones: [
    {
      id: 'adverbs', titulo: 'Adverbs and adverbial phrases', insignia: 'Adverb Ace',
      color: '#22D3EE', claro: '#0C2A33',
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
        { tipo: 'clasificar', orden: 'What does each adverb or adverbial phrase tell us?', muestra: 12,
          pista: 'Ask the question: How? When? Where? How often?',
          cajas: [{ id: 'how', t: 'How?' }, { id: 'when', t: 'When?' }, { id: 'where', t: 'Where?' }, { id: 'often', t: 'How often?' }],
          items: [
            { t: 'quickly', caja: 'how' }, { t: 'carefully', caja: 'how' }, { t: 'with a big smile', caja: 'how' }, { t: 'loudly', caja: 'how' }, { t: 'gently', caja: 'how' }, { t: 'in silence', caja: 'how' },
            { t: 'yesterday', caja: 'when' }, { t: 'after lunch', caja: 'when' }, { t: 'at midnight', caja: 'when' }, { t: 'tomorrow', caja: 'when' }, { t: 'last week', caja: 'when' }, { t: 'soon', caja: 'when' },
            { t: 'outside', caja: 'where' }, { t: 'under the bridge', caja: 'where' }, { t: 'upstairs', caja: 'where' }, { t: 'everywhere', caja: 'where' }, { t: 'at the station', caja: 'where' }, { t: 'nearby', caja: 'where' },
            { t: 'always', caja: 'often' }, { t: 'once a month', caja: 'often' }, { t: 'twice a week', caja: 'often' }, { t: 'rarely', caja: 'often' }, { t: 'never', caja: 'often' }, { t: 'sometimes', caja: 'often' }
          ] },
        { tipo: 'tocar', orden: 'Tap every adverb or adverbial phrase in the sentence.', muestra: 5,
          pista: 'Find the words that say how, when, where or how often the action happens.',
          frases: [
            'The fox moved *silently* *through the forest*.',
            '*Yesterday*, we visited the museum.',
            'She *always* checks her answers *carefully*.',
            '*After the storm*, the river rose *quickly*.',
            'My grandad walks *in the park* *every morning*.',
            'The baby slept *peacefully* *all night*.',
            '*Suddenly*, a loud noise came *from the kitchen*.',
            'We *often* eat pizza *on Fridays*.',
            'The children waited *patiently* *outside the classroom*.',
            'She sings *beautifully*.'
          ] }
      ]
    },
    {
      id: 'prepositions', titulo: 'Prepositions and prepositional phrases', insignia: 'Preposition Pro',
      color: '#A3E635', claro: '#1A2E05',
      globo: 'Prepositions show where, when or which way.',
      aprende: [
        { h: 'Prepositions', p: 'A *preposition* links a noun to the rest of the sentence. It often shows *place*, *time* or *direction*.',
          ej: [{ t: 'under', nota: 'place' }, { t: 'between', nota: 'place' }, { t: 'during', nota: 'time' }, { t: 'before', nota: 'time' }, { t: 'across', nota: 'direction' }, { t: 'into', nota: 'direction' }] },
        { h: 'Prepositional phrases', p: 'A *prepositional phrase* = preposition + noun phrase.',
          frases: ['The keys are *under the sofa*.', 'We played football *after school*.', 'The dog jumped *into the river*.', 'We walked *across the road*. (direction)'] }
      ],
      actividades: [
        { tipo: 'tocar', orden: 'Tap every prepositional phrase.', muestra: 5,
          pista: 'Start with the preposition (in, on, under, after…) and include the noun that follows.',
          frases: [
            'The keys are *under the sofa*.',
            'We played football *after school*.',
            'The cat jumped *over the wall*.',
            '*During the holidays*, we travelled *to the coast*.',
            'A small boat sailed *across the lake*.',
            'The book is *on the shelf*.',
            'We met *at the park* *after lunch*.',
            'The ball rolled *under the car*.',
            'My house is *between the bakery and the library*.',
            'The bird flew *over the trees*.'
          ] },
        { tipo: 'clasificar', orden: 'Does each prepositional phrase show place, time or direction?', muestra: 9,
          pista: 'Place = where it is. Time = when. Direction = which way it moves.',
          cajas: [{ id: 'place', t: 'Place' }, { id: 'time', t: 'Time' }, { id: 'dir', t: 'Direction' }],
          items: [
            { t: 'under the table', caja: 'place' }, { t: 'between the trees', caja: 'place' }, { t: 'behind the door', caja: 'place' },
            { t: 'next to the window', caja: 'place' }, { t: 'inside the box', caja: 'place' }, { t: 'beside the river', caja: 'place' },
            { t: 'before lunch', caja: 'time' }, { t: 'during the film', caja: 'time' }, { t: 'at seven o’clock', caja: 'time' },
            { t: 'after school', caja: 'time' }, { t: 'on Monday', caja: 'time' }, { t: 'in the morning', caja: 'time' },
            { t: 'onto the stage', caja: 'dir' }, { t: 'into the pool', caja: 'dir' }, { t: 'towards the hill', caja: 'dir' },
            { t: 'out of the house', caja: 'dir' }, { t: 'through the tunnel', caja: 'dir' }, { t: 'up the stairs', caja: 'dir' }
          ] }
      ]
    },
    {
      id: 'present', titulo: 'Present simple vs present continuous', insignia: 'Tense Tracker',
      color: '#F472B6', claro: '#3B0F24',
      globo: 'Is it a habit, or is it happening right now?',
      aprende: [
        { h: 'Simple present', p: ['For *habits*, *routines* and *facts*.', 'He / she / it → add *-s* or *-es*: she plays, he brushes, it rains.', 'Clue words: always, usually, every day, never.'],
          frases: ['She *plays* the piano every day.', 'Water *boils* at 100 °C.'] },
        { h: 'Present continuous', p: ['For actions happening *now* or *around now*.', '*am / is / are* + verb*-ing*.', 'Clue words: now, right now, at the moment, Look!, Listen!'],
          frases: ['She *is playing* the piano now.', 'Look! It *is raining*.'] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Simple present or present continuous?', muestra: 8,
          pista: 'Look for am / is / are + -ing. That is the present continuous.',
          cajas: [{ id: 'sp', t: 'Simple present', sub: 'habits and facts' }, { id: 'pc', t: 'Present continuous', sub: 'happening now' }],
          items: [
            { t: 'We go to the market every Saturday.', caja: 'sp' }, { t: 'The sun rises in the east.', caja: 'sp' },
            { t: 'My dad never drinks coffee.', caja: 'sp' }, { t: 'She usually walks to school.', caja: 'sp' },
            { t: 'Cats sleep a lot.', caja: 'sp' }, { t: 'He plays football on Tuesdays.', caja: 'sp' },
            { t: 'The shop opens at nine.', caja: 'sp' }, { t: 'I never eat mushrooms.', caja: 'sp' },
            { t: 'Listen! The baby is crying.', caja: 'pc' }, { t: 'They are watching a film right now.', caja: 'pc' },
            { t: 'I am reading a great book at the moment.', caja: 'pc' }, { t: 'Look! The dog is chasing a ball.', caja: 'pc' },
            { t: 'Shh! Grandma is sleeping.', caja: 'pc' }, { t: 'We are having lunch now.', caja: 'pc' },
            { t: 'Right now, she is doing her homework.', caja: 'pc' }, { t: 'Look! It is snowing in the mountains.', caja: 'pc' }
          ] },
        { tipo: 'completar', orden: 'Complete each sentence with the right form of the verb.', muestra: 6,
          pista: 'Find the clue word first: every day, always… or now, Look!, at the moment…',
          items: [
            { frase: 'Listen! The birds [are singing].', fichas: ['sing', 'are singing'] },
            { frase: 'Water [boils] at 100 °C.', fichas: ['boils', 'is boiling'] },
            { frase: 'Every Saturday we [go] to the market.', fichas: ['go', 'are going'] },
            { frase: 'My brother [is reading] a comic at the moment.', fichas: ['reads', 'is reading'] },
            { frase: 'She always [brushes] her teeth before bed.', fichas: ['brushes', 'is brushing'] },
            { frase: 'Look! It [is raining] again.', fichas: ['rains', 'is raining'] },
            { frase: 'Be quiet! The baby [is sleeping].', fichas: ['sleeps', 'is sleeping'] },
            { frase: 'My cousins usually [visit] us in December.', fichas: ['visit', 'are visiting'] },
            { frase: 'Right now, I [am wearing] my school uniform.', fichas: ['wear', 'am wearing'] },
            { frase: 'Bees [make] honey.', fichas: ['make', 'are making'] },
            { frase: 'Hurry up! Everyone [is waiting] for you.', fichas: ['waits', 'is waiting'] },
            { frase: 'He never [watches] TV in the morning.', fichas: ['watches', 'is watching'] }
          ] }
      ]
    },
    {
      id: 'agreement', titulo: 'Subject-verb agreement', insignia: 'Agreement Agent',
      color: '#FBBF24', claro: '#3A2A05',
      globo: 'The verb must match its subject.',
      aprende: [
        { h: 'The rule', p: ['One person or thing (*he, she, it*, the dog) → verb with *-s*: the dog *barks*.', '*Plural* subject → verb without -s: the dogs *bark*.', 'Be careful with *is / are* and *has / have*.'] },
        { h: 'Tricky subjects', p: 'Find the *real* subject. Words like "of the…" do not change it.',
          frases: ['The box *of pencils* *is* on the desk. (the box = one)', '*Each* of the students *has* a ticket.', '*Everyone* *is* ready.', 'My cousin *and* I *are* in the same class.'] }
      ],
      actividades: [
        { tipo: 'tocar', orden: 'Each sentence has one wrong verb. Tap it to fix it.', muestra: 6,
          pista: 'Find the subject. Is it one (singular) or more than one (plural)?',
          frases: [
            'The dogs *barks|bark* at night.',
            'My sister *play|plays* the guitar.',
            'The children *is|are* in the playground.',
            'Each of the girls *have|has* a ticket.',
            'The box of crayons *are|is* on the desk.',
            'Everyone *want|wants* to win.',
            'The flowers in the garden *smells|smell* lovely.',
            'My friends *was|were* late for school.',
            'Mathematics *are|is* my favourite subject.',
            'The teacher *give|gives* us homework every day.',
            'Each of the boys *bring|brings* a snack.',
            'The birds *sings|sing* in the morning.'
          ] },
        { tipo: 'clasificar', orden: 'Does each subject go with is or are?', muestra: 8,
          pista: 'One person or thing → is. More than one → are.',
          cajas: [{ id: 'is', t: '… is', sub: 'singular' }, { id: 'are', t: '… are', sub: 'plural' }],
          items: [
            { t: 'Everybody', caja: 'is' }, { t: 'One of the boys', caja: 'is' }, { t: 'The bag of apples', caja: 'is' }, { t: 'My teacher', caja: 'is' },
            { t: 'Nobody', caja: 'is' }, { t: 'The list of names', caja: 'is' }, { t: 'Each student', caja: 'is' }, { t: 'The news', caja: 'is' },
            { t: 'My friends', caja: 'are' }, { t: 'The book and the pen', caja: 'are' }, { t: 'The students in my class', caja: 'are' }, { t: 'My cousin and I', caja: 'are' },
            { t: 'The players', caja: 'are' }, { t: 'The cat and the dog', caja: 'are' }, { t: 'Both of my sisters', caja: 'are' }, { t: 'The shoes under the bed', caja: 'are' }
          ] }
      ]
    },
    {
      id: 'complex', titulo: 'Complex sentences', insignia: 'Clause Crafter',
      color: '#A78BFA', claro: '#221A40',
      globo: 'A main clause can stand alone. A subordinate clause needs it.',
      aprende: [
        { h: 'Two kinds of clause', p: ['A *main clause* makes sense on its own: *we stayed inside*.', 'A *subordinate clause* often starts with a subordinating conjunction and needs the main clause: *because it was raining*.'] },
        { h: 'Subordinating conjunctions', ej: ['because', 'although', 'when', 'if', 'while', 'unless', 'since', 'after', 'before', 'until'] },
        { h: 'Where does the comma go?', p: 'If the subordinate clause comes *first*, put a *comma* after it.',
          frases: ['We stayed inside *because it was raining*.', '*Because it was raining*, we stayed inside.'] },
        { h: 'Joining with and, but, or, so', p: 'Coordinating conjunctions join two main clauses: *I was tired, so I went to bed.*' }
      ],
      actividades: [
        { tipo: 'completar', orden: 'Choose the conjunction that makes sense.', muestra: 6,
          pista: 'because = reason · although = surprise · unless = only if not · when / while = time · if = condition',
          items: [
            { frase: 'We stayed inside [because] it was raining.', fichas: ['because', 'although', 'unless'] },
            { frase: '[Although] she was tired, she finished her homework.', fichas: ['Although', 'Because', 'If'] },
            { frase: 'You will miss the bus [unless] you hurry.', fichas: ['unless', 'because', 'while'] },
            { frase: '[When] the bell rang, everyone ran outside.', fichas: ['When', 'Unless', 'Although'] },
            { frase: 'I read a book [while] my mum cooked dinner.', fichas: ['while', 'unless', 'although'] },
            { frase: '[If] it is sunny tomorrow, we will go to the beach.', fichas: ['If', 'Although', 'Because'] },
            { frase: 'I wore a coat [because] it was cold.', fichas: ['because', 'although', 'unless'] },
            { frase: '[Although] it was sunny, the water was cold.', fichas: ['Although', 'Because', 'Unless'] },
            { frase: 'We cannot go out [unless] we finish our work.', fichas: ['unless', 'because', 'although'] },
            { frase: '[While] we were walking, it started to rain.', fichas: ['While', 'Unless', 'Although'] },
            { frase: 'Call me [when] you get home.', fichas: ['when', 'although', 'unless'] },
            { frase: 'You can play [if] you tidy your room.', fichas: ['if', 'although', 'unless'] }
          ] },
        { tipo: 'tocar', orden: 'Tap the subordinate clause in each sentence.', muestra: 5,
          pista: 'It starts with a conjunction like because, when, although or if.',
          frases: [
            '*Because it was late*, we took a taxi.',
            'The dog barked *when the post arrived*.',
            '*Although the test was hard*, she smiled.',
            'We will play outside *if the rain stops*.',
            'He brushed his teeth *before he went to bed*.',
            '*When the film ended*, we went home.',
            'I like reading *because it helps me relax*.',
            '*If you practise every day*, you will improve.',
            'She waited *until the rain stopped*.',
            '*After we ate dinner*, we played a game.'
          ] },
        { tipo: 'clasificar', orden: 'Main clause or subordinate clause?', muestra: 8,
          pista: 'Can it stand alone as a sentence? Then it is a main clause.',
          cajas: [{ id: 'main', t: 'Main clause', sub: 'makes sense alone' }, { id: 'sub', t: 'Subordinate clause', sub: 'needs a main clause' }],
          items: [
            { t: 'we ate pizza', caja: 'main' }, { t: 'the train left', caja: 'main' }, { t: 'she laughed', caja: 'main' }, { t: 'the plant grows', caja: 'main' },
            { t: 'the bus was late', caja: 'main' }, { t: 'we went to the beach', caja: 'main' }, { t: 'my dog barked', caja: 'main' }, { t: 'the sun came out', caja: 'main' },
            { t: 'because we were hungry', caja: 'sub' }, { t: 'after the film ended', caja: 'sub' }, { t: 'unless you practise', caja: 'sub' }, { t: 'if you water it', caja: 'sub' },
            { t: 'although it was cold', caja: 'sub' }, { t: 'when the bell rang', caja: 'sub' }, { t: 'because she was tired', caja: 'sub' }, { t: 'while we waited', caja: 'sub' }
          ] }
      ]
    },
    {
      id: 'perspective', titulo: 'Narrative perspective and inference', insignia: 'Inference Investigator',
      color: '#FB923C', claro: '#3A1D08',
      globo: 'Who is telling the story? What clues can you find?',
      aprende: [
        { h: 'Narrative perspective', p: ['*First person*: the narrator is in the story. *I, me, my, we, our*.', '*Second person*: the narrator talks to the reader. *you, your*.', '*Third person*: the narrator is outside the story. *he, she, they*, names.'],
          frases: ['*I* opened the door and *my* heart was pounding. (1st)', '*You* step into the dark cave. (2nd)', '*She* grabbed *her* coat and ran. (3rd)'] },
        { h: 'Inference', p: ['To *infer* is to work something out from *clues* in the text and what you already know.', 'Clue + what I know = inference.'],
          frases: ['Clue: *He kept looking at the clock and tapping his foot.*', 'Inference: he was *impatient* or in a hurry.'] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Which narrative perspective is each extract written in?', muestra: 9,
          pista: 'Look at the pronouns: I/we, you, or he/she/they.',
          cajas: [{ id: '1', t: 'First person', sub: 'I, we' }, { id: '2', t: 'Second person', sub: 'you' }, { id: '3', t: 'Third person', sub: 'he, she, they' }],
          items: [
            { t: 'I opened the gate and my dog ran out.', caja: '1' }, { t: 'We laughed until our stomachs hurt.', caja: '1' },
            { t: 'My brother and I built a treehouse.', caja: '1' }, { t: 'I could not believe my eyes.', caja: '1' }, { t: 'Our team scored in the last minute.', caja: '1' },
            { t: 'You step into the cave. What will you do?', caja: '2' }, { t: 'You hold your breath and listen.', caja: '2' },
            { t: 'You open the old box carefully.', caja: '2' }, { t: 'You can hear footsteps behind you.', caja: '2' }, { t: 'You turn left at the end of the tunnel.', caja: '2' },
            { t: 'She grabbed her coat and ran into the rain.', caja: '3' }, { t: 'The old man looked at his watch and sighed.', caja: '3' },
            { t: 'They whispered so nobody could hear.', caja: '3' }, { t: 'The girl climbed to the top of the hill.', caja: '3' }, { t: 'He hid the letter under his bed.', caja: '3' }
          ] },
        { tipo: 'emparejar', orden: 'Match each clue with what you can infer.', muestra: 5,
          pista: 'Ask yourself: what would make someone act like this?',
          titulos: ['Clue', 'Inference'], largo: true,
          pares: [
            ['Her hands were shaking and she kept checking the clock before the test.', 'She was nervous.'],
            ['He slammed the door and refused to speak.', 'He was angry.'],
            ['Wet umbrellas stood by the door and everyone’s shoes were muddy.', 'It had been raining.'],
            ['The plate was empty and the dog was licking its lips.', 'The dog ate the food.'],
            ['She yawned and her eyes kept closing.', 'She was tired.'],
            ['He smiled from ear to ear when he opened the present.', 'He was happy.'],
            ['She wrapped her scarf tighter and her teeth were chattering.', 'She was cold.'],
            ['The boy hid behind his mum and would not say hello.', 'He was shy.'],
            ['The street lights came on and the sky turned dark.', 'It was evening.'],
            ['His stomach rumbled and he kept looking at the kitchen.', 'He was hungry.']
          ] }
      ]
    }
  ]
});
