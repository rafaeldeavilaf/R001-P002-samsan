// titulo: Year 2 English · Study guide
// lang: en
/* ============================================================
   GUIA DE ESTUDIO — YEAR 2 · ENGLISH (jugador menor)
   Objetivos de la study guide de mitad de año: long i, consonant blends,
   'Wh' questions, non-fiction (animales locales y comunidad) y escribir
   sobre ciclos de vida. Textos y ejemplos propios; del colegio solo salen
   los objetivos. Ingles simple para ninos que aprenden ingles.
   Mascota: Pip, el buho de la guia de Maths de Year 2.
   ============================================================ */
GUIA.iniciar({
  id: 'y2-english',
  lang: 'en-GB',
  tema: 'y2',
  mascota: 'pip',
  mascotaNombre: 'Pip the owl',
  titulo: 'Year 2 English',
  subtitulo: 'Study guide',
  saludo: "Hi! I am Pip the owl. Let's practise English!",
  leerFichas: true,
  vozAuto: true,
  velocidad: 0.85,
  misiones: [
    {
      id: 'long-i', titulo: 'Long i sound', sub: 'i_e · igh · y · ie',
      color: '#1D4ED8', claro: '#DBEAFE',
      globo: 'Long i says its name: i, like in kite!',
      aprende: [
        { h: 'The long i sound', p: ['Long i says its name: *i*, like in *kite*.', 'We can write it in *4 ways*. Tap each word to hear it.'] },
        { h: 'i_e (magic e)', p: 'The *e* at the end is quiet. It makes the i say its name.',
          ej: [{ t: 'k*i*t*e*', img: '🪁', voz: 'kite' }, { t: 'b*i*k*e*', img: '🚲', voz: 'bike' }, { t: 'f*i*v*e*', img: '🖐️', voz: 'five' }, { t: 'sm*i*l*e*', img: '😊', voz: 'smile' }] },
        { h: 'igh', p: 'Three letters, one sound.',
          ej: [{ t: 'n*igh*t', img: '🌙', voz: 'night' }, { t: 'l*igh*t', img: '💡', voz: 'light' }, { t: 'h*igh*', voz: 'high' }, { t: 'br*igh*t', img: '☀️', voz: 'bright' }] },
        { h: 'y at the end', p: 'At the end of a short word, *y* can say i.',
          ej: [{ t: 'fl*y*', img: '🪰', voz: 'fly' }, { t: 'cr*y*', img: '😢', voz: 'cry' }, { t: 'sk*y*', voz: 'sky' }, { t: 'm*y*', voz: 'my' }] },
        { h: 'ie', ej: [{ t: 'p*ie*', img: '🥧', voz: 'pie' }, { t: 't*ie*', img: '👔', voz: 'tie' }] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Put each word in its long i house.',
          pista: 'Find the letters that say i: is it i and e, igh, y or ie?',
          cajas: [{ id: 'ie_', t: 'i_e', sub: 'magic e' }, { id: 'igh', t: 'igh' }, { id: 'y', t: 'y', sub: 'at the end' }, { id: 'ie', t: 'ie' }],
          items: [
            { t: 'bike', caja: 'ie_' }, { t: 'five', caja: 'ie_' }, { t: 'smile', caja: 'ie_' }, { t: 'time', caja: 'ie_' },
            { t: 'night', caja: 'igh' }, { t: 'light', caja: 'igh' }, { t: 'high', caja: 'igh' }, { t: 'bright', caja: 'igh' },
            { t: 'sky', caja: 'y' }, { t: 'cry', caja: 'y' }, { t: 'fly', caja: 'y' }, { t: 'my', caja: 'y' },
            { t: 'pie', caja: 'ie' }, { t: 'tie', caja: 'ie' }
          ] },
        { tipo: 'completar', orden: 'Listen and build the word. Tap the letters that say i.',
          pista: 'Say the word slowly. Which letters make the i sound?',
          items: [
            { frase: 'k[i]t[e]', fichas: ['i', 'e', 'igh', 'y'], img: '🪁', decir: 'kite' },
            { frase: 'n[igh]t', fichas: ['igh', 'ie', 'y'], img: '🌙', decir: 'night' },
            { frase: 'fl[y]', fichas: ['y', 'igh', 'ie'], img: '🪰', decir: 'fly' },
            { frase: 'p[ie]', fichas: ['ie', 'y', 'igh'], img: '🥧', decir: 'pie' },
            { frase: 'b[i]k[e]', fichas: ['i', 'e', 'y', 'igh'], img: '🚲', decir: 'bike' },
            { frase: 'l[igh]t', fichas: ['igh', 'ie', 'y'], img: '💡', decir: 'light' },
            { frase: 'cr[y]', fichas: ['y', 'ie', 'igh'], img: '😢', decir: 'cry' },
            { frase: 't[ie]', fichas: ['ie', 'y', 'igh'], img: '👔', decir: 'tie' }
          ] },
        { tipo: 'tocar', orden: 'Tap every word with the long i sound.',
          pista: 'Read each word out loud. Do you hear i, like in kite?',
          frases: [
            'The *night* is *bright*.',
            'A *white* *kite* can *fly* *high*.',
            'We eat *pie* at *nine*.',
            'Look at the *sky*!',
            '*Ride* your *bike* to the park.',
            'The baby can *cry* at *night*.'
          ] }
      ]
    },
    {
      id: 'blends', titulo: 'Consonant blends', sub: 'fr · st · cl · tr',
      color: '#C2410C', claro: '#FFEDD5',
      globo: 'Two letters, two sounds. Say them fast!',
      aprende: [
        { h: 'What is a blend?', p: ['A blend is *two or three consonants* together, and you hear *each* sound: f + r = *fr*, like in *frog*.', 'sh, ch and th are *not* blends: they make one sound.'],
          ej: [{ t: '*fr*og', img: '🐸', voz: 'frog' }, { t: '*tr*ee', img: '🌳', voz: 'tree' }, { t: '*st*ar', img: '⭐', voz: 'star' }, { t: '*sn*ail', img: '🐌', voz: 'snail' }, { t: '*fl*ag', img: '🚩', voz: 'flag' }, { t: '*cl*ock', img: '🕐', voz: 'clock' }] },
        { h: 'Three blend families', p: ['*l* blends: bl, cl, fl, gl, pl', '*r* blends: br, cr, dr, fr, gr, tr', '*s* blends: sk, sn, sp, st, sw'] }
      ],
      actividades: [
        { tipo: 'completar', orden: 'Look at the picture. Tap the blend that starts the word.',
          pista: 'Say the word. Listen to the first two sounds.',
          items: [
            { frase: '[fr]og', fichas: ['fr', 'fl', 'tr'], img: '🐸', decir: 'frog' },
            { frase: '[tr]ee', fichas: ['tr', 'dr', 'cr'], img: '🌳', decir: 'tree' },
            { frase: '[st]ar', fichas: ['st', 'sp', 'sn'], img: '⭐', decir: 'star' },
            { frase: '[sn]ail', fichas: ['sn', 'sm', 'st'], img: '🐌', decir: 'snail' },
            { frase: '[cr]ab', fichas: ['cr', 'gr', 'br'], img: '🦀', decir: 'crab' },
            { frase: '[dr]um', fichas: ['dr', 'tr', 'br'], img: '🥁', decir: 'drum' },
            { frase: '[fl]ag', fichas: ['fl', 'pl', 'cl'], img: '🚩', decir: 'flag' },
            { frase: '[pl]ane', fichas: ['pl', 'bl', 'fl'], img: '✈️', decir: 'plane' },
            { frase: '[gr]apes', fichas: ['gr', 'cr', 'dr'], img: '🍇', decir: 'grapes' },
            { frase: '[sp]oon', fichas: ['sp', 'st', 'sk'], img: '🥄', decir: 'spoon' }
          ] },
        { tipo: 'clasificar', orden: 'Is it an l blend, an r blend or an s blend?',
          pista: 'Look at the second letter of the blend. Is it l or r? Or does the word start with s?',
          cajas: [{ id: 'l', t: 'l blends', sub: 'bl cl fl gl pl' }, { id: 'r', t: 'r blends', sub: 'br cr dr fr gr tr' }, { id: 's', t: 's blends', sub: 'sk sn sp st sw' }],
          items: [
            { t: 'flag', caja: 'l' }, { t: 'clock', caja: 'l' }, { t: 'plane', caja: 'l' }, { t: 'glue', caja: 'l' }, { t: 'black', caja: 'l' },
            { t: 'frog', caja: 'r' }, { t: 'tree', caja: 'r' }, { t: 'crab', caja: 'r' }, { t: 'drum', caja: 'r' }, { t: 'grass', caja: 'r' },
            { t: 'star', caja: 's' }, { t: 'snail', caja: 's' }, { t: 'spoon', caja: 's' }, { t: 'swim', caja: 's' }, { t: 'skip', caja: 's' }
          ] },
        { tipo: 'tocar', orden: 'Tap the words that start with a blend.',
          pista: 'Say the word. Can you hear two consonant sounds at the start?',
          frases: [
            'The *frog* sat on a *stone*.',
            'A *crab* is on the sand.',
            '*Black* *clouds* are in the *sky*.',
            'We *swim* in the *green* sea.',
            'Put the *flag* on the *tree*.'
          ] }
      ]
    },
    {
      id: 'wh', titulo: "'Wh' questions", sub: 'Who · What · Where · When · Why',
      color: '#15803D', claro: '#DCFCE7',
      globo: 'Question words help us ask. A question ends with ?',
      aprende: [
        { h: 'Question words', p: 'Each word asks for something different. Tap to hear.',
          ej: [{ t: 'Who?', nota: 'a person or animal' }, { t: 'What?', nota: 'a thing' }, { t: 'Where?', nota: 'a place' }, { t: 'When?', nota: 'a time' }, { t: 'Why?', nota: 'a reason: because…' }] },
        { h: 'Questions and answers',
          frases: ['*Who* is at the door? My grandma.', '*What* is in the box? A ball.', '*Where* is the cat? Under the bed.', '*When* do you eat lunch? At 12 o’clock.', '*Why* are you happy? Because it is my birthday.'] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Which question word goes with each answer?',
          pista: 'A person is Who. A thing is What. A place is Where. A time is When. Because is Why.',
          cajas: [{ id: 'who', t: 'Who?', sub: 'person' }, { id: 'what', t: 'What?', sub: 'thing' }, { id: 'where', t: 'Where?', sub: 'place' }, { id: 'when', t: 'When?', sub: 'time' }, { id: 'why', t: 'Why?', sub: 'reason' }],
          items: [
            { t: 'my grandma', caja: 'who' }, { t: 'a firefighter', caja: 'who' },
            { t: 'a red ball', caja: 'what' }, { t: 'a banana', caja: 'what' },
            { t: 'at the park', caja: 'where' }, { t: 'in the kitchen', caja: 'where' },
            { t: 'on Monday', caja: 'when' }, { t: 'at night', caja: 'when' },
            { t: 'because it is hot', caja: 'why' }, { t: 'because I am hungry', caja: 'why' }
          ] },
        { tipo: 'emparejar', orden: 'Read the story. Match each question with its answer.',
          pista: 'Read the story again. Find the words that answer the question.',
          lectura: { h: 'Toby the Turtle', p: ['Toby is a sea turtle.', 'He lives in the warm sea.', 'Every morning, he swims near the coral.', 'He eats sea grass.', 'He is happy because the water is warm.'] },
          titulos: ['Question', 'Answer'], largo: true,
          pares: [
            ['Who lives in the warm sea?', 'Toby the turtle'],
            ['Where does Toby live?', 'in the warm sea'],
            ['When does he swim?', 'every morning'],
            ['What does he eat?', 'sea grass'],
            ['Why is Toby happy?', 'because the water is warm']
          ] },
        { tipo: 'completar', orden: 'Read the answer. Tap the question word.',
          pista: 'Look at the answer: is it a person, a thing, a place, a time or a reason?',
          items: [
            { frase: '[Where] is the cat? Under the bed.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Who] is at the door? My uncle.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[What] is in your bag? A book.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[When] is your birthday? In May.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Why] are you wet? Because it is raining.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] }
          ] }
      ]
    },
    {
      id: 'non-fiction', titulo: 'Non-fiction', sub: 'Local animals and our community',
      color: '#7E22CE', claro: '#F3E8FF',
      globo: 'Non-fiction tells us true facts!',
      aprende: [
        { h: 'Fiction or non-fiction?', p: ['*Non-fiction* tells us *true facts*.', '*Fiction* is a *made-up* story.'],
          frases: ['Non-fiction: *Iguanas eat leaves and fruit.*', 'Fiction: *The iguana went to a party.*'] },
        { h: 'A fact page has…', p: 'a *title*, *headings*, *pictures*, *captions* and *facts*.',
          frases: ['*Title*: All About Iguanas', '*Heading*: Where do they live?', '*Fact*: Iguanas live in trees near rivers.', '*Caption*: An iguana on a branch.'] },
        { h: 'Our community', p: 'A community is a place where people *live*, *work* and *help each other*.',
          ej: [{ t: 'doctor', img: '🩺' }, { t: 'teacher', img: '📚' }, { t: 'firefighter', img: '🚒' }, { t: 'baker', img: '🍞' }, { t: 'farmer', img: '🌽' }, { t: 'bus driver', img: '🚌' }] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Is it a true fact or a made-up story?',
          pista: 'Is it a true fact? Then it is non-fiction.',
          cajas: [{ id: 'nf', t: 'Non-fiction', sub: 'true facts' }, { id: 'f', t: 'Fiction', sub: 'made-up story' }],
          items: [
            { t: 'Iguanas eat leaves and fruit.', caja: 'nf' }, { t: 'The iguana wore a party hat.', caja: 'f' },
            { t: 'Manatees live in rivers and swamps.', caja: 'nf' }, { t: 'The monkey drove a red car.', caja: 'f' },
            { t: 'Hummingbirds drink nectar from flowers.', caja: 'nf' }, { t: 'The turtle sang a song to the moon.', caja: 'f' },
            { t: 'Bakers make bread.', caja: 'nf' }, { t: 'A dragon helped the farmer.', caja: 'f' },
            { t: 'Firefighters put out fires.', caja: 'nf' }, { t: 'The fish rode a bike.', caja: 'f' }
          ] },
        { tipo: 'emparejar', orden: 'Match each part of the fact page with its name.',
          pista: 'The title is the name of the page. A caption tells us about the picture.',
          titulos: ['Part', 'On the page'], largo: true,
          pares: [
            ['Title', 'All About Sea Turtles'],
            ['Heading', 'Where do they lay eggs?'],
            ['Fact', 'Sea turtles lay eggs on the beach.'],
            ['Picture', { t: 'a photo', img: '🐢' }],
            ['Caption', 'This turtle is swimming.']
          ] },
        { tipo: 'emparejar', orden: 'Who helps our community? Match each person with their job.',
          pista: 'Think: where does this person work? What do they do there?',
          titulos: ['Person', 'Job'],
          pares: [
            [{ t: 'doctor', img: '🩺' }, 'helps sick people'],
            [{ t: 'teacher', img: '📚' }, 'helps children learn'],
            [{ t: 'firefighter', img: '🚒' }, 'puts out fires'],
            [{ t: 'baker', img: '🍞' }, 'makes bread'],
            [{ t: 'farmer', img: '🌽' }, 'grows food'],
            [{ t: 'bus driver', img: '🚌' }, 'takes people to places']
          ] }
      ]
    },
    {
      id: 'life-cycles', titulo: 'Animal life cycles', sub: 'and how to write about them',
      color: '#BE185D', claro: '#FCE7F3',
      globo: 'Animals grow and change. Round and round!',
      aprende: [
        { h: 'Butterfly', p: 'A *life cycle* goes round and round.',
          ej: [{ t: 'egg', img: '🥚', nota: '1' }, { t: 'caterpillar', img: '🐛', nota: '2' }, { t: 'chrysalis', nota: '3' }, { t: 'butterfly', img: '🦋', nota: '4' }] },
        { h: 'Frog', ej: [{ t: 'egg', img: '🥚', nota: '1' }, { t: 'tadpole', nota: '2' }, { t: 'froglet', nota: '3' }, { t: 'frog', img: '🐸', nota: '4' }] },
        { h: 'Chicken', ej: [{ t: 'egg', img: '🥚', nota: '1' }, { t: 'chick', img: '🐣', nota: '2' }, { t: 'hen or rooster', img: '🐔', nota: '3' }] },
        { h: 'Writing about a life cycle', p: 'Use these words to show the order: *First*, *Next*, *Then*, *Finally*.',
          frases: ['*First*, the butterfly lays eggs.', '*Next*, a caterpillar comes out.', '*Then*, it turns into a chrysalis.', '*Finally*, a butterfly comes out!'] }
      ],
      actividades: [
        { tipo: 'ordenar', orden: 'Put the butterfly life cycle in order.',
          pista: 'It starts with a tiny egg on a leaf.',
          items: [{ t: 'egg', img: '🥚' }, { t: 'caterpillar', img: '🐛' }, { t: 'chrysalis' }, { t: 'butterfly', img: '🦋' }],
          final: '↻ Then the butterfly lays eggs again!' },
        { tipo: 'ordenar', orden: 'Put the frog life cycle in order.',
          pista: 'Egg, then a baby with a tail that swims. Then it grows legs.',
          items: [{ t: 'egg', img: '🥚' }, { t: 'tadpole' }, { t: 'froglet' }, { t: 'frog', img: '🐸' }],
          final: '↻ Then the frog lays eggs again!' },
        { tipo: 'completar', orden: 'Write about the life cycle. Tap the order words.',
          pista: 'Start with First and end with Finally. Next and Then go in the middle.',
          items: [
            { frase: '[First], the frog lays eggs. [Next|Then], a tadpole comes out. [Next|Then], it grows legs. [Finally], it is a frog!', fichas: ['First', 'Next', 'Then', 'Finally'], img: '🐸' },
            { frase: '[First], the hen lays an egg. [Next|Then], a chick comes out. [Next|Then], the chick grows. [Finally], it is a grown-up chicken!', fichas: ['First', 'Next', 'Then', 'Finally'], img: '🐔' }
          ] }
      ]
    }
  ]
});
