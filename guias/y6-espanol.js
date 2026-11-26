// titulo: Year 6 Español · Word Drop
// lang: es
/* ============================================================
   WORD DROP — YEAR 6 · ESPAÑOL (modo juego) · jugador mayor
   "Solo palabras y ubicarlas": cada mundo es un tema de la guia de estudio;
   la palabra activa se arrastra o se ubica tocando su zona. 3 etapas por
   mundo, una gema por etapa terminada, trajes de Z1P que se desbloquean con
   gemas y un jefe por oleadas. Estetica de consola (tema y6).
   Misma estructura que y6-english-v2; solo cambian los datos y el idioma.
   Textos propios; del colegio solo salen los objetivos.
   Regla de los sustantivos: cada palabra va a UNA zona. Individual es un solo
   ser u objeto; concreto es materia o fenomeno que se percibe y no se cuenta
   uno a uno; colectivo, un conjunto en singular; abstracto, idea o sentimiento.
   Los espacios __ de "Mayuscula y puntuacion" marcan el signo que falta.
   ============================================================ */
GUIA.iniciar({
  modo: 'juego',
  id: 'y6-espanol',
  lang: 'es-CO',
  tema: 'y6',
  mascota: 'z1p',
  mascotaNombre: 'Z1P el dron',
  titulo: 'Word Drop',
  subtitulo: 'Year 6 Español',
  saludo: 'Z1P en línea. Lleva cada palabra a su zona. Junta *gemas*, desbloquea trajes y vence al jefe.',
  leerFichas: false,
  vozAuto: false,
  velocidad: 0.95,
  musica: 'synth',
  textos: {
    jugar: 'Jugar', mapa: 'MAPA DE MUNDOS', trajes: 'TRAJES', etapa: 'Etapa', etapa_ok: '¡Etapa superada!', jefe_ok: '¡Jefe vencido!',
    nuevo_traje: 'Traje desbloqueado', bravo: ['¡Bien!', '¡Muy bien!', '¡Limpio!'], otra: 'Repetir (palabras nuevas)', listo: 'Entendido',
    reiniciar: 'Borrar progreso', confirmar: '¿Borrar todas las gemas y trajes?', vencido: 'SUPERADO'
  },
  jefe: { titulo: 'Jefe · Mezcla de examen', sub: '4 oleadas · las zonas cambian en cada una', color: '#F87171', claro: '#3B1010', oleadas: 4, palabras: 5 },
  pieles: [
    { id: 'base', nombre: 'Acero', gemas: 0 },
    { id: 'neon', nombre: 'Neón', gemas: 4, colores: { '#CBD5E1': '#D9F99D', '#94A3B8': '#84CC16', '#64748B': '#3F6212', '#22D3EE': '#F0ABFC' } },
    { id: 'magma', nombre: 'Magma', gemas: 8, colores: { '#CBD5E1': '#FECACA', '#94A3B8': '#EF4444', '#64748B': '#991B1B', '#22D3EE': '#FDE047' } },
    { id: 'hielo', nombre: 'Hielo', gemas: 12, colores: { '#CBD5E1': '#F0F9FF', '#94A3B8': '#7DD3FC', '#64748B': '#0369A1', '#22D3EE': '#FFFFFF' } },
    { id: 'vacio', nombre: 'Vacío', gemas: 16, colores: { '#CBD5E1': '#64748B', '#94A3B8': '#334155', '#64748B': '#0F172A', '#22D3EE': '#F472B6' } },
    { id: 'oro', nombre: 'Oro', gemas: 22, colores: { '#CBD5E1': '#FEF3C7', '#94A3B8': '#F59E0B', '#64748B': '#B45309', '#22D3EE': '#22D3EE' } },
    { id: 'holo', nombre: 'Holo', gemas: 28, colores: { '#CBD5E1': '#E9D5FF', '#94A3B8': '#A78BFA', '#64748B': '#5B21B6', '#22D3EE': '#A3E635' } }
  ],
  mundos: [
    {
      id: 'sustantivos', titulo: 'Sustantivos', color: '#22D3EE', claro: '#0C2A33',
      consejo: 'Los sustantivos *abstractos* nombran ideas o sentimientos que no se perciben con los sentidos. Los *colectivos* nombran, en singular, un conjunto. En este juego, *individual* es un solo ser u objeto y *concreto* es la materia o el fenómeno que percibes y no cuentas uno a uno.',
      pista: '¿Se percibe con los sentidos? Si no, es abstracto. ¿Es un conjunto en singular? Colectivo. ¿Es un solo ser u objeto? Individual. ¿Es materia o fenómeno? Concreto.',
      zonas: [
        { id: 'abstracto', t: 'Abstracto', sub: 'idea o sentimiento', ej: 'respeto' },
        { id: 'concreto', t: 'Concreto', sub: 'materia o fenómeno', ej: 'agua' },
        { id: 'individual', t: 'Individual', sub: 'un solo ser u objeto', ej: 'estudiante' },
        { id: 'colectivo', t: 'Colectivo', sub: 'un conjunto, en singular', ej: 'rebaño' }
      ],
      palabras: [
        { t: 'libertad', zona: 'abstracto' }, { t: 'alegría', zona: 'abstracto' }, { t: 'justicia', zona: 'abstracto' }, { t: 'amistad', zona: 'abstracto' },
        { t: 'miedo', zona: 'abstracto' }, { t: 'igualdad', zona: 'abstracto' }, { t: 'paz', zona: 'abstracto' }, { t: 'solidaridad', zona: 'abstracto' },
        { t: 'arena', zona: 'concreto' }, { t: 'humo', zona: 'concreto' }, { t: 'lluvia', zona: 'concreto' }, { t: 'viento', zona: 'concreto' },
        { t: 'nieve', zona: 'concreto' }, { t: 'fuego', zona: 'concreto' }, { t: 'leche', zona: 'concreto' }, { t: 'sal', zona: 'concreto' },
        { t: 'perro', zona: 'individual' }, { t: 'mesa', zona: 'individual' }, { t: 'árbol', zona: 'individual' }, { t: 'lápiz', zona: 'individual' },
        { t: 'maestra', zona: 'individual' }, { t: 'bicicleta', zona: 'individual' }, { t: 'persona', zona: 'individual' }, { t: 'niño', zona: 'individual' },
        { t: 'manada', zona: 'colectivo' }, { t: 'arboleda', zona: 'colectivo' }, { t: 'cardumen', zona: 'colectivo' }, { t: 'enjambre', zona: 'colectivo' },
        { t: 'orquesta', zona: 'colectivo' }, { t: 'comunidad', zona: 'colectivo' }, { t: 'familia', zona: 'colectivo' }, { t: 'flota', zona: 'colectivo' }
      ]
    },
    {
      id: 'adjetivos', titulo: 'Adjetivos', color: '#A3E635', claro: '#1A2E05',
      consejo: 'El *adjetivo calificativo* acompaña al sustantivo y dice cómo es: *casa blanca*. El *sustantivo* nombra personas, lugares, cosas o ideas.',
      pista: '¿Dice cómo es algo? Es adjetivo. ¿Nombra algo? Es sustantivo.',
      zonas: [
        { id: 'adj', t: 'Adjetivo calificativo', sub: 'dice cómo es', ej: 'segura' },
        { id: 'sust', t: 'Sustantivo', sub: 'nombra algo', ej: 'escuela' }
      ],
      palabras: [
        { t: 'grande', zona: 'adj' }, { t: 'diminuto', zona: 'adj' }, { t: 'antiguo', zona: 'adj' }, { t: 'tranquilo', zona: 'adj' }, { t: 'importante', zona: 'adj' }, { t: 'amable', zona: 'adj' },
        { t: 'redondo', zona: 'adj' }, { t: 'oscuro', zona: 'adj' }, { t: 'peligroso', zona: 'adj' }, { t: 'silenciosa', zona: 'adj' }, { t: 'respetuosa', zona: 'adj' }, { t: 'delgada', zona: 'adj' },
        { t: 'familia', zona: 'sust' }, { t: 'mesa', zona: 'sust' }, { t: 'río', zona: 'sust' }, { t: 'niño', zona: 'sust' }, { t: 'ciudad', zona: 'sust' }, { t: 'libro', zona: 'sust' },
        { t: 'montaña', zona: 'sust' }, { t: 'cielo', zona: 'sust' }, { t: 'pelota', zona: 'sust' }, { t: 'comunidad', zona: 'sust' }, { t: 'cuaderno', zona: 'sust' }, { t: 'calle', zona: 'sust' }
      ]
    },
    {
      id: 'verbo', titulo: 'El verbo', color: '#F472B6', claro: '#3B0F24',
      consejo: 'El verbo cambia según *cuándo* ocurre la acción: *saltó* ya pasó, *salta* ocurre ahora y *saltará* ocurrirá después. Fíjate en la terminación y en quién hace la acción (yo, tú, él, nosotros, ustedes, ellos).',
      pista: 'Mira la terminación del verbo. ¿Ya pasó, ocurre ahora o ocurrirá después?',
      zonas: [
        { id: 'pasado', t: 'Pasado', sub: 'ya ocurrió', ej: 'ella cantó' },
        { id: 'presente', t: 'Presente', sub: 'ocurre ahora', ej: 'ella canta' },
        { id: 'futuro', t: 'Futuro', sub: 'ocurrirá después', ej: 'ella cantará' }
      ],
      palabras: [
        { t: 'yo comí', zona: 'pasado' }, { t: 'tú jugaste', zona: 'pasado' }, { t: 'ella bailó', zona: 'pasado' }, { t: 'nosotros comimos', zona: 'pasado' },
        { t: 'ellos corrieron', zona: 'pasado' }, { t: 'ustedes escribieron', zona: 'pasado' }, { t: 'yo nadé', zona: 'pasado' }, { t: 'él llegó', zona: 'pasado' }, { t: 'ustedes leyeron', zona: 'pasado' },
        { t: 'yo como', zona: 'presente' }, { t: 'tú juegas', zona: 'presente' }, { t: 'ella baila', zona: 'presente' }, { t: 'nosotros comemos', zona: 'presente' },
        { t: 'ellos corren', zona: 'presente' }, { t: 'ustedes escriben', zona: 'presente' }, { t: 'yo nado', zona: 'presente' }, { t: 'él llega', zona: 'presente' }, { t: 'ustedes leen', zona: 'presente' },
        { t: 'yo comeré', zona: 'futuro' }, { t: 'tú jugarás', zona: 'futuro' }, { t: 'ella bailará', zona: 'futuro' }, { t: 'nosotros comeremos', zona: 'futuro' },
        { t: 'ellos correrán', zona: 'futuro' }, { t: 'ustedes escribirán', zona: 'futuro' }, { t: 'yo nadaré', zona: 'futuro' }, { t: 'él llegará', zona: 'futuro' }, { t: 'ustedes leerán', zona: 'futuro' }
      ]
    },
    {
      id: 'demostrativos', titulo: 'Demostrativos y posesivos', color: '#FBBF24', claro: '#3A2A05',
      consejo: 'Los *demostrativos* señalan la distancia: *este* (cerca), *ese* (media distancia), *aquel* (lejos). Los *posesivos* dicen a quién pertenece algo: *mío*, *tuyo*, *nuestro*, *mi*, *tu*.',
      pista: '¿Señala qué tan cerca o lejos está algo? Es demostrativo. ¿Dice de quién es? Es posesivo.',
      zonas: [
        { id: 'dem', t: 'Demostrativo', sub: 'señala la distancia', ej: 'aquel' },
        { id: 'pos', t: 'Posesivo', sub: 'dice a quién pertenece', ej: 'tuya' }
      ],
      palabras: [
        { t: 'este', zona: 'dem' }, { t: 'esta', zona: 'dem' }, { t: 'estos', zona: 'dem' }, { t: 'estas', zona: 'dem' }, { t: 'ese', zona: 'dem' },
        { t: 'esa', zona: 'dem' }, { t: 'esos', zona: 'dem' }, { t: 'aquella', zona: 'dem' }, { t: 'aquellos', zona: 'dem' }, { t: 'aquellas', zona: 'dem' },
        { t: 'mío', zona: 'pos' }, { t: 'mía', zona: 'pos' }, { t: 'míos', zona: 'pos' }, { t: 'tuyo', zona: 'pos' }, { t: 'suya', zona: 'pos' },
        { t: 'suyos', zona: 'pos' }, { t: 'nuestro', zona: 'pos' }, { t: 'nuestra', zona: 'pos' }, { t: 'mi', zona: 'pos' }, { t: 'tu', zona: 'pos' }
      ]
    },
    {
      id: 'generos', titulo: 'Cuento, leyenda o mito', color: '#A78BFA', claro: '#221A40',
      consejo: 'El *cuento popular* tiene lugar y tiempo imprecisos, personajes típicos y suele dejar una enseñanza. La *leyenda* ocurre en un lugar real y mezcla lo cotidiano con lo sobrenatural. El *mito* explica el origen del mundo, de los dioses o de la naturaleza.',
      pista: 'Lugar y tiempo imprecisos y personajes típicos, cuento. Lugar real con un ser sobrenatural, leyenda. Dioses y origen de las cosas, mito.',
      zonas: [
        { id: 'cuento', t: 'Cuento popular', sub: 'lugar y tiempo imprecisos', ej: 'Había una vez…' },
        { id: 'leyenda', t: 'Leyenda', sub: 'lugar real y algo sobrenatural', ej: 'La Llorona' },
        { id: 'mito', t: 'Mito', sub: 'origen de lo que existe', ej: 'Los dioses crean el mundo' }
      ],
      palabras: [
        { t: 'Un reino muy lejano', zona: 'cuento' }, { t: 'Un hada madrina con su varita', zona: 'cuento' }, { t: 'Y vivieron felices', zona: 'cuento' }, { t: 'Un rey con tres hijas', zona: 'cuento' },
        { t: 'Un lobo astuto y tres hermanos', zona: 'cuento' }, { t: 'Personajes buenos y malos muy marcados', zona: 'cuento' }, { t: 'Tres pruebas y tres deseos', zona: 'cuento' },
        { t: 'El Hombre Caimán', zona: 'leyenda' }, { t: 'El Mohán', zona: 'leyenda' }, { t: 'Un espanto en el camino del pueblo', zona: 'leyenda' }, { t: 'Dicen que pasó en un lugar que existe de verdad', zona: 'leyenda' },
        { t: 'Una mujer llora junto al río de noche', zona: 'leyenda' }, { t: 'Una persona común ve un espíritu', zona: 'leyenda' }, { t: 'Ocurrió en una vereda que todos conocen', zona: 'leyenda' },
        { t: 'Cómo nació el sol', zona: 'mito' }, { t: 'Por qué hay truenos', zona: 'mito' }, { t: 'El origen de los seres humanos', zona: 'mito' }, { t: 'Dioses y semidioses con poderes', zona: 'mito' },
        { t: 'Ocurre cuando el mundo era nuevo', zona: 'mito' }, { t: 'Un héroe desafía a los dioses', zona: 'mito' }, { t: 'Cómo se repartió la luz entre los dioses', zona: 'mito' }
      ]
    },
    {
      id: 'narracion', titulo: 'Elementos de la narración', color: '#FB923C', claro: '#3A1D08',
      consejo: 'Toda narración tiene un *narrador* (quien cuenta), *personajes* (quienes actúan), *acciones* (lo que ocurre, del inicio al desenlace) y un *marco narrativo* (el tiempo y el lugar).',
      pista: '¿Quién cuenta? Narrador. ¿Quién actúa? Personaje. ¿Qué ocurre? Acción. ¿Cuándo o dónde ocurre? Marco narrativo.',
      zonas: [
        { id: 'narrador', t: 'Narrador', sub: 'quien cuenta', ej: 'La voz que cuenta la historia' },
        { id: 'personaje', t: 'Personaje', sub: 'quien actúa', ej: 'La protagonista' },
        { id: 'accion', t: 'Acción', sub: 'lo que ocurre', ej: 'Pierde el mapa' },
        { id: 'marco', t: 'Marco narrativo', sub: 'cuándo y dónde', ej: 'Al amanecer' }
      ],
      palabras: [
        { t: 'Cuenta en primera persona', zona: 'narrador' }, { t: 'Cuenta en tercera persona', zona: 'narrador' }, { t: 'Narrador omnisciente', zona: 'narrador' },
        { t: 'Quien relata los hechos', zona: 'narrador' }, { t: 'Sabe lo que piensan todos', zona: 'narrador' }, { t: 'Habla desde fuera de la historia', zona: 'narrador' },
        { t: 'El lobo hambriento', zona: 'personaje' }, { t: 'La anciana del bastón', zona: 'personaje' }, { t: 'El antagonista', zona: 'personaje' }, { t: 'Un pescador joven', zona: 'personaje' },
        { t: 'El perro fiel', zona: 'personaje' }, { t: 'Un personaje secundario', zona: 'personaje' },
        { t: 'Cruza el río corriendo', zona: 'accion' }, { t: 'Descubre un secreto', zona: 'accion' }, { t: 'Rescata a su amigo', zona: 'accion' }, { t: 'El tren se detiene de repente', zona: 'accion' },
        { t: 'Encuentran el tesoro', zona: 'accion' }, { t: 'Se escapa del castillo', zona: 'accion' }, { t: 'Vuelven a casa', zona: 'accion' },
        { t: 'Una noche de tormenta', zona: 'marco' }, { t: 'En un pueblo junto al mar', zona: 'marco' }, { t: 'Hace mil años', zona: 'marco' }, { t: 'En la cima de la montaña', zona: 'marco' },
        { t: 'En el patio de la escuela', zona: 'marco' }, { t: 'Durante el invierno', zona: 'marco' }, { t: 'En una cabaña del bosque', zona: 'marco' }
      ]
    },
    {
      id: 'descripcion', titulo: 'Descripción y diálogo', color: '#60A5FA', claro: '#0F2440',
      consejo: 'La *descripción* detalla cómo es algo y usa adjetivos y verbos como *era*, *estaba* o *parecía*. El *diálogo* reproduce lo que dicen los personajes y empieza con la *raya* (—).',
      pista: '¿Tiene raya (—) y habla un personaje? Es diálogo. ¿Dice cómo es algo? Es descripción.',
      zonas: [
        { id: 'desc', t: 'Descripción', sub: 'dice cómo es algo', ej: 'El patio estaba vacío' },
        { id: 'dial', t: 'Diálogo', sub: 'habla un personaje', ej: '—Hola —dijo el vecino' }
      ],
      palabras: [
        { t: 'La casa era vieja y silenciosa', zona: 'desc' }, { t: 'Tenía los ojos verdes', zona: 'desc' }, { t: 'El río estaba frío y claro', zona: 'desc' }, { t: 'El gato era blanco y suave', zona: 'desc' },
        { t: 'La plaza olía a flores', zona: 'desc' }, { t: 'Su voz parecía dulce', zona: 'desc' }, { t: 'El cuarto estaba oscuro', zona: 'desc' }, { t: 'El camino era largo y estrecho', zona: 'desc' },
        { t: '—¿Quieres jugar? —preguntó el niño', zona: 'dial' }, { t: '—No lo sé —dijo la abuela', zona: 'dial' }, { t: '—¡Corre! —gritó el guardia', zona: 'dial' }, { t: '—Buenos días —saludó el vecino', zona: 'dial' },
        { t: '—Tengo hambre —susurró la niña', zona: 'dial' }, { t: '—¡Qué sorpresa! —exclamó el abuelo', zona: 'dial' }, { t: '—¿Dónde está? —dijo el hermano', zona: 'dial' }, { t: '—Gracias —contestó la señora', zona: 'dial' }
      ]
    },
    {
      id: 'noticia', titulo: 'Noticia y afiche', color: '#2DD4BF', claro: '#062B27',
      consejo: 'La *noticia* informa un hecho reciente y tiene titular, entrada y cuerpo; además trae pie de foto (el texto bajo la foto), la firma del periodista y su fuente. El *afiche* anuncia algo o invita a participar, con una imagen llamativa, poco texto y los datos del evento.',
      pista: '¿Informa un hecho que ya pasó? Es de la noticia. ¿Anuncia algo o invita? Es del afiche.',
      zonas: [
        { id: 'noticia', t: 'Noticia', sub: 'informa un hecho', ej: 'Titular' },
        { id: 'afiche', t: 'Afiche', sub: 'anuncia o invita', ej: 'Eslogan' }
      ],
      palabras: [
        { t: 'Entrada que resume lo importante', zona: 'noticia' }, { t: 'Cuerpo con los detalles', zona: 'noticia' }, { t: 'Pie de foto', zona: 'noticia' }, { t: 'Cuenta un hecho reciente', zona: 'noticia' },
        { t: 'Firma del periodista', zona: 'noticia' }, { t: 'Narra lo que ya pasó', zona: 'noticia' }, { t: 'Cita a una persona que vio lo ocurrido', zona: 'noticia' },
        { t: 'Un dibujo grande que invita a venir', zona: 'afiche' }, { t: 'Invita a participar', zona: 'afiche' }, { t: 'Datos de contacto', zona: 'afiche' }, { t: 'Fecha, hora y lugar del evento', zona: 'afiche' },
        { t: 'Letras grandes y poco texto', zona: 'afiche' }, { t: 'Anuncia lo que va a pasar', zona: 'afiche' }, { t: 'Colores fuertes que llaman la atención', zona: 'afiche' }
      ]
    },
    {
      id: 'mayuscula', titulo: 'Mayúscula y puntuación', color: '#E879F9', claro: '#331039',
      consejo: 'Los nombres propios de países, ciudades, ríos y fiestas llevan *mayúscula*. Las preguntas se encierran en *¿ ?* y las exclamaciones en *¡ !*. El *punto* cierra una idea y la *coma* separa elementos de una lista, a quien se llama (*Hola, vecino*) y la palabra *sí* o *no* al inicio de la frase. El espacio __ muestra dónde falta el signo. Si en medio de la frase sigue una palabra con mayúscula, ahí va punto.',
      pista: 'Nombre propio en minúscula, mayúscula. Espacio antes y después de toda la frase, ¿ ? si pregunta y ¡ ! si exclama. Espacio al final, punto. Espacio en medio, coma si sigue minúscula y punto si sigue mayúscula.',
      zonas: [
        { id: 'may', t: 'Mayúscula', sub: 'nombre propio', ej: 'colombia' },
        { id: 'preg', t: '¿ ?', sub: 'pregunta', ej: '__ Cómo te llamas __' },
        { id: 'excl', t: '¡ !', sub: 'exclamación', ej: '__ Qué alegría __' },
        { id: 'punto', t: 'Punto', sub: 'cierra la idea', ej: 'Hoy es lunes __' },
        { id: 'coma', t: 'Coma', sub: 'separa o hace una pausa', ej: 'Pan __ leche y huevos' }
      ],
      palabras: [
        { t: 'bogotá', zona: 'may' }, { t: 'cartagena', zona: 'may' }, { t: 'medellín', zona: 'may' }, { t: 'santa marta', zona: 'may' },
        { t: 'navidad', zona: 'may' }, { t: 'argentina', zona: 'may' }, { t: 'venezuela', zona: 'may' },
        { t: '__ Cuál es tu libro favorito __', zona: 'preg' }, { t: '__ Dónde queda la biblioteca __', zona: 'preg' }, { t: '__ Quién llegó primero __', zona: 'preg' },
        { t: '__ Cuántos años tienes __', zona: 'preg' }, { t: '__ Por qué lloras __', zona: 'preg' }, { t: '__ Cuándo es el examen __', zona: 'preg' }, { t: '__ Qué hora es __', zona: 'preg' },
        { t: '__ Qué susto __', zona: 'excl' }, { t: '__ Cuidado __', zona: 'excl' }, { t: '__ Qué lindo día __', zona: 'excl' }, { t: '__ Qué bonito paisaje __', zona: 'excl' },
        { t: '__ Auxilio __', zona: 'excl' }, { t: '__ Qué golazo __', zona: 'excl' }, { t: '__ Qué emoción __', zona: 'excl' },
        { t: 'Mi hermano juega fútbol __', zona: 'punto' }, { t: 'La luna sale de noche __', zona: 'punto' }, { t: 'Mi abuela vive en el campo __', zona: 'punto' },
        { t: 'Llegamos tarde __ Nos perdimos el inicio', zona: 'punto' }, { t: 'Terminé la tarea __', zona: 'punto' }, { t: 'Mañana viajamos a la costa __', zona: 'punto' }, { t: 'El perro duerme en el patio __', zona: 'punto' },
        { t: 'Compré lápices __ cuadernos y reglas', zona: 'coma' }, { t: 'Gracias __ mamá', zona: 'coma' }, { t: 'Ven aquí __ amigo', zona: 'coma' },
        { t: 'Hay manzanas rojas __ verdes y amarillas', zona: 'coma' }, { t: 'Sí __ ya terminé la tarea', zona: 'coma' }, { t: 'Corro __ salto y nado', zona: 'coma' }, { t: 'Hola __ vecino', zona: 'coma' }
      ]
    }
  ]
});
