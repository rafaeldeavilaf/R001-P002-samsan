// titulo: Year 2 English · Study guide
// lang: en
// motor: v1
/* ============================================================
   GUIA DE ESTUDIO — YEAR 2 · ENGLISH (jugador menor)
   Objetivos de la study guide de mitad de año: long i, consonant blends,
   'Wh' questions, non-fiction (animales locales y comunidad) y escribir
   sobre ciclos de vida. Textos y ejemplos propios; del colegio solo salen
   los objetivos. Ingles simple para ninos que aprenden ingles.
   Cada actividad trae un banco: `muestra` dice cuantos salen por vuelta
   y `variantes` cambia el cuento o el ciclo de vida.
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
  musica: 'alegre',
  jefe: { titulo: "Pip's big review", sub: 'A new mix every time', letra: '★', color: '#A16207', claro: '#FEF9C3', globo: 'Questions from every mission. Let’s go!', max: 5 },
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
        { h: 'ie', ej: [{ t: 'p*ie*', img: '🥧', voz: 'pie' }, { t: 't*ie*', img: '👔', voz: 'tie' }, { t: 'fr*ie*s', img: '🍟', voz: 'fries' }] }
      ],
      actividades: [
        { tipo: 'clasificar', orden: 'Put each word in its long i house.', muestra: 12,
          pista: 'Find the letters that say i: is it i and e, igh, y or ie?',
          cajas: [{ id: 'ie_', t: 'i_e', sub: 'magic e' }, { id: 'igh', t: 'igh' }, { id: 'y', t: 'y', sub: 'at the end' }, { id: 'ie', t: 'ie' }],
          items: [
            { t: 'bike', caja: 'ie_' }, { t: 'five', caja: 'ie_' }, { t: 'smile', caja: 'ie_' }, { t: 'time', caja: 'ie_' }, { t: 'kite', caja: 'ie_' },
            { t: 'line', caja: 'ie_' }, { t: 'ride', caja: 'ie_' }, { t: 'white', caja: 'ie_' }, { t: 'nine', caja: 'ie_' }, { t: 'hide', caja: 'ie_' },
            { t: 'night', caja: 'igh' }, { t: 'light', caja: 'igh' }, { t: 'high', caja: 'igh' }, { t: 'bright', caja: 'igh' },
            { t: 'right', caja: 'igh' }, { t: 'sight', caja: 'igh' }, { t: 'tight', caja: 'igh' }, { t: 'flight', caja: 'igh' },
            { t: 'sky', caja: 'y' }, { t: 'cry', caja: 'y' }, { t: 'fly', caja: 'y' }, { t: 'my', caja: 'y' },
            { t: 'dry', caja: 'y' }, { t: 'try', caja: 'y' }, { t: 'shy', caja: 'y' }, { t: 'why', caja: 'y' },
            { t: 'pie', caja: 'ie' }, { t: 'tie', caja: 'ie' }, { t: 'lie', caja: 'ie' }, { t: 'cried', caja: 'ie' },
            { t: 'tried', caja: 'ie' }, { t: 'dried', caja: 'ie' }, { t: 'fries', caja: 'ie' }
          ] },
        { tipo: 'completar', orden: 'Listen and build the word. Tap the letters that say i.', muestra: 8,
          pista: 'Say the word slowly. Which letters make the i sound?',
          items: [
            { frase: 'k[i]t[e]', fichas: ['i', 'e', 'igh', 'y'], img: '🪁', decir: 'kite' },
            { frase: 'n[igh]t', fichas: ['igh', 'ie', 'y'], img: '🌙', decir: 'night' },
            { frase: 'fl[y]', fichas: ['y', 'igh', 'ie'], img: '🪰', decir: 'fly' },
            { frase: 'p[ie]', fichas: ['ie', 'y', 'igh'], img: '🥧', decir: 'pie' },
            { frase: 'b[i]k[e]', fichas: ['i', 'e', 'y', 'igh'], img: '🚲', decir: 'bike' },
            { frase: 'l[igh]t', fichas: ['igh', 'ie', 'y'], img: '💡', decir: 'light' },
            { frase: 'cr[y]', fichas: ['y', 'ie', 'igh'], img: '😢', decir: 'cry' },
            { frase: 't[ie]', fichas: ['ie', 'y', 'igh'], img: '👔', decir: 'tie' },
            { frase: 'f[i]v[e]', fichas: ['i', 'e', 'igh', 'y'], img: '🖐️', decir: 'five' },
            { frase: 'sm[i]l[e]', fichas: ['i', 'e', 'igh', 'y'], img: '😊', decir: 'smile' },
            { frase: 'n[i]n[e]', fichas: ['i', 'e', 'igh', 'ie'], img: '9️⃣', decir: 'nine' },
            { frase: 'fr[ie]s', fichas: ['ie', 'igh', 'y'], img: '🍟', decir: 'fries' },
            { frase: 'br[igh]t', fichas: ['igh', 'ie', 'y'], img: '☀️', decir: 'bright' },
            { frase: 'sk[y]', fichas: ['y', 'igh', 'ie'], img: '🌌', decir: 'sky' },
            { frase: 'fl[igh]t', fichas: ['igh', 'y', 'ie'], img: '✈️', decir: 'flight' },
            { frase: 'wh[i]t[e]', fichas: ['i', 'e', 'igh', 'y'], img: '🏳️', decir: 'white' }
          ] },
        { tipo: 'tocar', orden: 'Tap every word with the long i sound.', muestra: 6,
          pista: 'Read each word out loud. Do you hear i, like in kite?',
          frases: [
            'The *night* is *bright*.',
            'A *white* *kite* can *fly* *high*.',
            'We eat *pie* at *nine*.',
            'Look at the *sky*!',
            '*Ride* your *bike* to the park.',
            'The baby can *cry* at *night*.',
            'Turn on the *light*.',
            'Dad has a red *tie*.',
            'The cat is *shy*.',
            'We had *fries* for lunch.',
            'Can you see the *kite* in the *sky*?',
            'Count to *five* and *smile*!'
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
        { h: 'Three blend families', p: ['*l* blends: bl, cl, fl, gl, pl, sl', '*r* blends: br, cr, dr, fr, gr, pr, tr', '*s* blends: sk, sm, sn, sp, st, sw'] }
      ],
      actividades: [
        { tipo: 'completar', orden: 'Look at the picture. Tap the blend that starts the word.', muestra: 8,
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
            { frase: '[sp]oon', fichas: ['sp', 'st', 'sk'], img: '🥄', decir: 'spoon' },
            { frase: '[cl]ock', fichas: ['cl', 'sn', 'gr'], img: '🕐', decir: 'clock' },
            { frase: '[br]ick', fichas: ['br', 'gr', 'dr'], img: '🧱', decir: 'brick' },
            { frase: '[sw]an', fichas: ['sw', 'sn', 'st'], img: '🦢', decir: 'swan' },
            { frase: '[gl]ove', fichas: ['gl', 'fl', 'pl'], img: '🧤', decir: 'glove' },
            { frase: '[sn]ake', fichas: ['sn', 'sm', 'sp'], img: '🐍', decir: 'snake' },
            { frase: '[tr]ain', fichas: ['tr', 'sk', 'fl'], img: '🚂', decir: 'train' },
            { frase: '[pr]esent', fichas: ['pr', 'br', 'tr'], img: '🎁', decir: 'present' }
          ] },
        { tipo: 'clasificar', orden: 'Is it an l blend, an r blend or an s blend?', muestra: 12,
          pista: 'Look at the second letter of the blend. Is it l or r? Or does the word start with s?',
          cajas: [{ id: 'l', t: 'l blends', sub: 'bl cl fl gl pl sl' }, { id: 'r', t: 'r blends', sub: 'br cr dr fr gr pr tr' }, { id: 's', t: 's blends', sub: 'sk sm sn sp st sw' }],
          items: [
            { t: 'flag', caja: 'l' }, { t: 'clock', caja: 'l' }, { t: 'plane', caja: 'l' }, { t: 'glue', caja: 'l' }, { t: 'black', caja: 'l' },
            { t: 'blue', caja: 'l' }, { t: 'clap', caja: 'l' }, { t: 'flower', caja: 'l' }, { t: 'glass', caja: 'l' }, { t: 'plum', caja: 'l' },
            { t: 'frog', caja: 'r' }, { t: 'tree', caja: 'r' }, { t: 'crab', caja: 'r' }, { t: 'drum', caja: 'r' }, { t: 'grass', caja: 'r' },
            { t: 'bread', caja: 'r' }, { t: 'prize', caja: 'r' }, { t: 'brown', caja: 'r' }, { t: 'green', caja: 'r' }, { t: 'train', caja: 'r' },
            { t: 'star', caja: 's' }, { t: 'snail', caja: 's' }, { t: 'spoon', caja: 's' }, { t: 'swim', caja: 's' }, { t: 'skip', caja: 's' },
            { t: 'snake', caja: 's' }, { t: 'smile', caja: 's' }, { t: 'stop', caja: 's' }, { t: 'sky', caja: 's' }, { t: 'swing', caja: 's' }
          ] },
        { tipo: 'tocar', orden: 'Tap the words that start with a blend.', muestra: 5,
          pista: 'Say the word. Can you hear two consonant sounds at the start?',
          frases: [
            'The *frog* sat on a *stone*.',
            'A *crab* is on the sand.',
            '*Black* *clouds* are in the *sky*.',
            'We *swim* in the *green* sea.',
            'Put the *flag* on the *tree*.',
            'A *black* *crow* is on the *branch*.',
            '*Grandma* made *bread*.',
            'The *snail* is so *slow*.',
            'We *play* on the *grass*.',
            'I can *skip* and *clap*.'
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
        { tipo: 'clasificar', orden: 'Which question word goes with each answer?', muestra: 10,
          pista: 'A person is Who. A thing is What. A place is Where. A time is When. Because is Why.',
          cajas: [{ id: 'who', t: 'Who?', sub: 'person' }, { id: 'what', t: 'What?', sub: 'thing' }, { id: 'where', t: 'Where?', sub: 'place' }, { id: 'when', t: 'When?', sub: 'time' }, { id: 'why', t: 'Why?', sub: 'reason' }],
          items: [
            { t: 'my grandma', caja: 'who' }, { t: 'a firefighter', caja: 'who' }, { t: 'my teacher', caja: 'who' }, { t: 'the baby', caja: 'who' }, { t: 'a doctor', caja: 'who' },
            { t: 'a red ball', caja: 'what' }, { t: 'a banana', caja: 'what' }, { t: 'a sandwich', caja: 'what' }, { t: 'a toy car', caja: 'what' }, { t: 'a book', caja: 'what' },
            { t: 'at the park', caja: 'where' }, { t: 'in the kitchen', caja: 'where' }, { t: 'at school', caja: 'where' }, { t: 'under the table', caja: 'where' }, { t: 'at the beach', caja: 'where' },
            { t: 'on Monday', caja: 'when' }, { t: 'at night', caja: 'when' }, { t: 'in the morning', caja: 'when' }, { t: 'after lunch', caja: 'when' }, { t: 'on my birthday', caja: 'when' },
            { t: 'because it is hot', caja: 'why' }, { t: 'because I am hungry', caja: 'why' }, { t: 'because I am tired', caja: 'why' }, { t: 'because it is raining', caja: 'why' }, { t: 'because I like it', caja: 'why' }
          ] },
        { tipo: 'emparejar', orden: 'Read the story. Match each question with its answer.',
          pista: 'Read the story again. Find the words that answer the question.',
          titulos: ['Question', 'Answer'], largo: true,
          variantes: [
            { lectura: { h: 'Toby the Turtle', p: ['Toby is a sea turtle.', 'He lives in the warm sea.', 'Every morning, he swims near the coral.', 'He eats sea grass.', 'He is happy because the water is warm.'] },
              pares: [
                ['Who lives in the warm sea?', 'Toby the turtle'],
                ['Where does Toby live?', 'in the warm sea'],
                ['When does he swim near the coral?', 'every morning'],
                ['What does he eat?', 'sea grass'],
                ['Why is Toby happy?', 'because the water is warm']
              ] },
            { lectura: { h: 'Iggy the Iguana', p: ['Iggy is a green iguana.', 'He lives in a tall tree near the river.', 'Every afternoon, he sits in the sun.', 'He eats leaves and flowers.', 'He likes the sun because it keeps him warm.'] },
              pares: [
                ['Who lives in a tall tree?', 'Iggy the iguana'],
                ['Where does Iggy live?', 'in a tall tree near the river'],
                ['When does he sit in the sun?', 'every afternoon'],
                ['What does he eat?', 'leaves and flowers'],
                ['Why does he like the sun?', 'because it keeps him warm']
              ] },
            { lectura: { h: 'Pico the Hummingbird', p: ['Pico is a tiny hummingbird.', 'She lives in a garden full of flowers.', 'Every morning, she drinks nectar.', 'She also eats tiny insects.', 'She can stay still in the air because her wings beat very fast.'] },
              pares: [
                ['Who lives in the garden?', 'Pico the hummingbird'],
                ['Where does Pico live?', 'in a garden full of flowers'],
                ['When does she drink nectar?', 'every morning'],
                ['What else does she eat?', 'tiny insects'],
                ['Why can she stay still in the air?', 'because her wings beat very fast']
              ] }
          ] },
        { tipo: 'completar', orden: 'Read the answer. Tap the question word.', muestra: 5,
          pista: 'Look at the answer: is it a person, a thing, a place, a time or a reason?',
          items: [
            { frase: '[Where] is the cat? Under the bed.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Who] is at the door? My uncle.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[What] is in your bag? A book.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[When] is your birthday? In May.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Why] are you wet? Because it is raining.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Who] made this cake? My dad.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[What] do you want to eat? A pizza.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Where] do fish live? In the water.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[When] do we go home? At 3 o’clock.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Why] is the baby crying? Because she is hungry.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[Where] is my bag? On the chair.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] },
            { frase: '[What] colour is the sky? Blue.', fichas: ['Who', 'What', 'Where', 'When', 'Why'] }
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
        { tipo: 'clasificar', orden: 'Is it a true fact or a made-up story?', muestra: 8,
          pista: 'Is it a true fact? Then it is non-fiction.',
          cajas: [{ id: 'nf', t: 'Non-fiction', sub: 'true facts' }, { id: 'f', t: 'Fiction', sub: 'made-up story' }],
          items: [
            { t: 'Iguanas eat leaves and fruit.', caja: 'nf' }, { t: 'Manatees live in rivers and swamps.', caja: 'nf' },
            { t: 'Hummingbirds drink nectar from flowers.', caja: 'nf' }, { t: 'Bakers make bread.', caja: 'nf' },
            { t: 'Firefighters put out fires.', caja: 'nf' }, { t: 'Turtles lay eggs in the sand.', caja: 'nf' },
            { t: 'Doctors help sick people.', caja: 'nf' }, { t: 'Honeybees make honey.', caja: 'nf' },
            { t: 'Monkeys can climb trees.', caja: 'nf' }, { t: 'Some frogs live in trees.', caja: 'nf' },
            { t: 'The iguana wore a party hat.', caja: 'f' }, { t: 'The monkey drove a red car.', caja: 'f' },
            { t: 'The turtle sang a song to the moon.', caja: 'f' }, { t: 'A dragon helped the farmer.', caja: 'f' },
            { t: 'The fish rode a bike.', caja: 'f' }, { t: 'The bus could talk.', caja: 'f' },
            { t: 'A cloud ate my ice cream.', caja: 'f' }, { t: 'The cat drove to school.', caja: 'f' },
            { t: 'The tree danced all night.', caja: 'f' }, { t: 'The pig flew a plane.', caja: 'f' }
          ] },
        { tipo: 'emparejar', orden: 'Match each part of the fact page with its name.',
          pista: 'The title is the name of the page. A caption tells us about the picture.',
          titulos: ['Part', 'On the page'], largo: true,
          variantes: [
            { pares: [['Title', 'All About Sea Turtles'], ['Heading', 'Where do they lay eggs?'], ['Fact', 'Sea turtles lay eggs on the beach.'], ['Picture', { t: 'a photo', img: '🐢' }], ['Caption', 'This turtle is swimming.']] },
            { pares: [['Title', 'All About Iguanas'], ['Heading', 'What do they eat?'], ['Fact', 'Iguanas eat leaves and fruit.'], ['Picture', { t: 'a photo', img: '🦎' }], ['Caption', 'This iguana is on a branch.']] },
            { pares: [['Title', 'All About Hummingbirds'], ['Heading', 'How do they fly?'], ['Fact', 'Hummingbirds can fly backwards.'], ['Picture', { t: 'a photo', img: '🐦' }], ['Caption', 'This hummingbird is drinking nectar.']] }
          ] },
        { tipo: 'emparejar', orden: 'Who helps our community? Match each person with their job.', muestra: 6,
          pista: 'Think: where does this person work? What do they do there?',
          titulos: ['Person', 'Job'],
          pares: [
            [{ t: 'doctor', img: '🩺' }, 'helps sick people'],
            [{ t: 'teacher', img: '📚' }, 'helps children learn'],
            [{ t: 'firefighter', img: '🚒' }, 'puts out fires'],
            [{ t: 'baker', img: '🍞' }, 'makes bread'],
            [{ t: 'farmer', img: '🌽' }, 'grows food'],
            [{ t: 'bus driver', img: '🚌' }, 'takes people to places'],
            [{ t: 'police officer', img: '👮' }, 'makes sure people follow the law'],
            [{ t: 'vet', img: '🐶' }, 'helps sick animals'],
            [{ t: 'dentist', img: '🦷' }, 'looks after our teeth'],
            [{ t: 'chef', img: '🍳' }, 'cooks food in a restaurant']
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
        { h: 'Sea turtle', ej: [{ t: 'egg', img: '🥚', nota: '1' }, { t: 'hatchling', nota: '2' }, { t: 'young turtle', nota: '3' }, { t: 'adult turtle', img: '🐢', nota: '4' }] },
        { h: 'Writing about a life cycle', p: 'Use these words to show the order: *First*, *Next*, *Then*, *Finally*.',
          frases: ['*First*, the butterfly lays eggs.', '*Next*, a caterpillar comes out.', '*Then*, it turns into a chrysalis.', '*Finally*, a butterfly comes out!'] }
      ],
      actividades: [
        { tipo: 'ordenar', orden: 'Put the life cycle in order.',
          pista: 'It always starts with an egg.',
          variantes: [
            { titulo: 'Butterfly', items: [{ t: 'egg', img: '🥚' }, { t: 'caterpillar', img: '🐛' }, { t: 'chrysalis' }, { t: 'butterfly', img: '🦋' }], final: '↻ Then the butterfly lays eggs again!' },
            { titulo: 'Sea turtle', items: [{ t: 'egg', img: '🥚' }, { t: 'hatchling' }, { t: 'young turtle' }, { t: 'adult turtle', img: '🐢' }], final: '↻ Then the turtle lays eggs again!' }
          ] },
        { tipo: 'ordenar', orden: 'Put the life cycle in order.',
          pista: 'Start with the egg. What comes out of it?',
          variantes: [
            { titulo: 'Frog', items: [{ t: 'egg', img: '🥚' }, { t: 'tadpole' }, { t: 'froglet' }, { t: 'frog', img: '🐸' }], final: '↻ Then the frog lays eggs again!' },
            { titulo: 'Chicken', items: [{ t: 'egg', img: '🥚' }, { t: 'chick', img: '🐣' }, { t: 'hen or rooster', img: '🐔' }], final: '↻ Then the hen lays eggs again!' }
          ] },
        { tipo: 'completar', orden: 'Write about the life cycle. Tap the order words.', muestra: 2,
          pista: 'Start with First and end with Finally. Next and Then go in the middle.',
          items: [
            { frase: '[First], the frog lays eggs. [Next|Then], a tadpole comes out. [Next|Then], it grows legs. [Finally], it is a frog!', fichas: ['First', 'Next', 'Then', 'Finally'], img: '🐸' },
            { frase: '[First], the hen lays an egg. [Next|Then], a chick comes out. [Next|Then], the chick grows. [Finally], it is a grown-up chicken!', fichas: ['First', 'Next', 'Then', 'Finally'], img: '🐔' },
            { frase: '[First], the butterfly lays eggs. [Next|Then], a caterpillar comes out. [Next|Then], it turns into a chrysalis. [Finally], a butterfly comes out!', fichas: ['First', 'Next', 'Then', 'Finally'], img: '🦋' },
            { frase: '[First], the turtle lays eggs in the sand. [Next|Then], the baby turtles come out. [Next|Then], they go to the sea. [Finally], they grow into big turtles!', fichas: ['First', 'Next', 'Then', 'Finally'], img: '🐢' }
          ] }
      ]
    }
  ]
});
