/* ============================================================
   SAMSAN — UI.JS
   Capa de CHROME compartido.

   Aqui vive TODO el texto de interfaz que es identico para
   cualquier materia: botones, HUD, titulos de pantalla, mensajes
   genericos del companero. `engine.js` no contiene ni un solo
   texto visible; lo lee de aqui.

   Tres capas (PLAN-V2.md §0.2):
     data.js  -> contenido de la materia (mundos, jefes, preguntas)
     ui.js    -> chrome compartido            <- ESTE ARCHIVO
     engine.js-> logica, cero texto visible

   Cualquier materia puede sobreescribir cualquier clave de aqui
   declarando `DATA.ui = { ... }` en su data.js. La mezcla es
   profunda: solo se pisa lo que se declara.

   Placeholders: {n}, {total}, {xp}... se sustituyen con UI.fmt().
   Se editan a mano, casi nunca. Un nombre de jefe NO va aqui:
   va en data.js. (Regla grep del proyecto.)
   ============================================================ */
window.GAME_UI = {

  /* ---------- MARCA ----------
     `brand` lo lee tambien tools/build.py para el <title>, la portada y
     legal.html. Si se renombra, cambiarlo AQUI y en ningun otro sitio.
     Las claves de localStorage no dependen de esto. */
  brand:   'SAMSAN',

  /* ---------- CREDITOS (regla 10 de CLAUDE.md) ----------
     Pie de cada juego, de la portada y de legal.html. tools/build.py lee
     estas claves para las paginas del sitio: un solo texto para todo.
     El credito nunca va en el titulo, en claves ni en nombres de archivo. */
  credits: {
    designed:  'Diseñado por Rafael De Avila Fadul',
    copyright: '© 2026 Rafael De Avila Fadul. Todos los derechos reservados.',
    legalLink: 'Notas legales',
    legalHref: 'legal.html'
  },

  /* ---------- ERRORES ---------- */
  err: {
    noData: 'Missing QUIZ_DATA.'
  },

  /* ---------- MAPA ---------- */
  map: {
    statXP:      'XP',
    statGems:    'GEMS',
    statLevels:  'LEVELS',
    btnMusicOn:  'MUSIC: ON',
    btnMusicOff: 'MUSIC: OFF',
    btnSoundOn:  'SOUND: ON',
    btnSoundOff: 'SOUND: OFF',
    btnReset:    'RESET',
    btnAulaOn:   'CLASSROOM MODE: ON',
    btnAulaOff:  'CLASSROOM MODE: OFF',
    intro:       'Clear a level to unlock the next one. Play as many as you want, whenever you want.',
    cardMeta:    'LEVEL {n} &middot; {count} challenges',
    gemsAria:    '{n} of {total} gems',
    lockIcon:    '&#128274;',
    allDone:     '&#127942; ALL LEVELS CLEARED',
    allDoneBody: 'Every level cleared. Replay any level whenever you like: each stretch you finish earns a gem.',
    confirmReset:'Reset all progress for {topic}?'
  },

  /* ---------- BRIEFING ---------- */
  brief: {
    tag:   'LEVEL {n} &middot; BRIEFING',
    back:  '&lt; MAP',
    start: 'START LEVEL &gt;'
  },

  /* ---------- PARTIDA ---------- */
  play: {
    levelTag:    'LV {n}',
    statXP:      'XP',
    statGems:    'GEMS',
    statCombo:   'COMBO',
    optionsLabel:'Answer options',
    btnHint:     'HINT',
    btnMusic:    'MUSIC: {state}',
    stateOn:     'ON',
    stateOff:    'OFF',
    btnQuit:     'QUIT',
    btnNext:     'NEXT &gt;',
    btnFinish:   'FINISH LEVEL &gt;',
    hintLabel:   '<b>Hint:</b> ',
    hintRetry:   '<b>You saw this one before &mdash; here is the method:</b> ',
    hintFallback:'Look at the size of each jump.',
    goodTitle:   '&#10003; CORRECT',
    badTitle:    '&#10007; NOT YET',
    badNote:     '<b>This challenge comes back later with different numbers</b> &mdash; so work out the method, not the answer.',
    confirmQuit: 'Leave this level? Progress in this level is not saved.'
  },

  /* ---------- HEROE Y ARMERIA ----------
     El motor solo conoce cuerpos 'a' y 'b'. Como se llamen y como se
     describan se decide aqui. Las etiquetas describen el PELO, no un genero:
     es lo que de verdad cambia entre las dos siluetas. */
  /* El personaje NO tiene nombre: ni real ni alias. Es un avatar neutro que el
     nino viste. Todo el contenido le habla de "you". */
  hero: {
    title:        'CHOOSE YOUR HERO',
    intro:        'Pick a look. You can change it any time, and it follows you into every game.',
    bodyA:        'SHORT HAIR',
    bodyB:        'LONG HAIR',
    pickAria:     'Choose the {name} hero',
    you:          'you',
    btnStart:     'START &gt;',
    btnArmoury:   'CUSTOMIZE',
    btnHero:      'HERO',
    btnBack:      '&lt; MAP'
  },

  armoury: {
    title:      'CHARACTER CUSTOMIZATION',
    intro:      'Make this hero yours. Choose a skin tone, then paint the armour.',
    pieceSkin:  'SKIN',
    /* Es una cinta/visor sobre la frente, no un casco: en dorado se leia como
       pelo rubio y el nino no entendia que estaba pintando. */
    pieceHelm:  'HEADBAND',
    pieceBody:  'BODY',
    pieceGlove: 'GLOVES',
    pieceBoot:  'BOOTS',
    swatchAria: '{piece}: {colour}',
    /* 4 colores de salida y uno mas por cada {per} gemas. Las gemas salen de
       completar tramos, sin importar intentos: coleccionar ligado a avanzar,
       no a acertar a la primera ni a compararse con nadie. */
    lockedAria: '{piece}: {colour} — locked. Earn {n} more gem{s} to unlock.',
    unlockLine: '{have} of {total} colours unlocked. Every {per} gems unlock the next one.',
    unlockAll:  'All {total} colours unlocked.',
    preview:    'PREVIEW',
    btnDone:    'DONE &gt;',
    /* Ocho colores fijos. Todos verificados con contraste >= 5:1 sobre
       --bg-1; el navy de las piernas de v1 (#1c2555) daba 1.16:1 y por eso
       no esta aqui. Si se cambia alguno, hay que volver a medir. */
    colours: [
      { name: 'CYAN',   value: '#7ee8fa' },
      { name: 'SKY',    value: '#5b8cff' },
      { name: 'PURPLE', value: '#c77dff' },
      { name: 'ROSE',   value: '#ff4d6d' },
      { name: 'ORANGE', value: '#ff9e64' },
      { name: 'GOLD',   value: '#ffd93d' },
      { name: 'LIME',   value: '#a0ff5c' },
      { name: 'GREEN',  value: '#3ce88a' }
    ],

    /* PIEL: doce tonos, y NUNCA se bloquean. Los colores de armadura se ganan
       jugando; el tono de piel no es un premio, es reconocerse. Un nino que no
       encuentra el suyo el primer dia no vuelve.

       Cada tono trae sus propios rasgos porque unos ojos oscuros sobre piel
       oscura dan 1.55:1 y la cara desaparece: `eye` es el blanco del ojo,
       `ink` la pupila y `mouth` la boca, elegidos para que en los doce tonos
       el ojo separe >= 3:1 y la boca >= 2.2:1. En los tonos claros lo que se
       ve es la pupila; en los oscuros, el blanco. Si se anade un tono nuevo,
       hay que volver a medirlo. */
    skins: [
      { name: 'PORCELAIN',  value: '#f6dcc8', eye: '#fdf0e3', ink: '#2f241e', mouth: '#63544a' },
      { name: 'IVORY',      value: '#f0cfae', eye: '#fceede', ink: '#2e231b', mouth: '#615041' },
      { name: 'SAND',       value: '#e8b088', eye: '#fae8d6', ink: '#2d1f16', mouth: '#5e4534' },
      { name: 'HONEY',      value: '#dda06a', eye: '#f8e4d0', ink: '#2c1d12', mouth: '#5a3f29' },
      { name: 'GOLDEN',     value: '#c98c58', eye: '#f4e0cc', ink: '#291b10', mouth: '#533823' },
      { name: 'CARAMEL',    value: '#b87a4a', eye: '#f0ddca', ink: '#27190f', mouth: '#4d321e' },
      { name: 'AMBER',      value: '#a86a3e', eye: '#eddac7', ink: '#25170d', mouth: '#472c1a' },
      { name: 'TERRACOTTA', value: '#965c34', eye: '#ead7c5', ink: '#23150c', mouth: '#dac0aa' },
      { name: 'CHESTNUT',   value: '#82502e', eye: '#e6d4c4', ink: '#21140b', mouth: '#d3bba8' },
      { name: 'COCOA',      value: '#6e4326', eye: '#e2d2c2', ink: '#1e120a', mouth: '#ccb7a5' },
      { name: 'ESPRESSO',   value: '#5c3821', eye: '#ded0c1', ink: '#1c110a', mouth: '#c5b3a3' },
      { name: 'EBONY',      value: '#4a2d1b', eye: '#dacdc0', ink: '#1a0f09', mouth: '#bfafa1' }
    ]
  },

  /* ---------- ESCENAS (v2: moverse es responder) ----------
     Textos de la capa de movimiento. `doors` es la escena canonica y
     el fallback de cualquier familia sin `mech`. */
  scene: {
    groupLabel:  'Walk to your answer',
    /* Las flechas van en <kbd>, no en <b>: la fuente de pixel no tiene glifo de
       flecha y caia a una fuente de respaldo que se veia apagada y mas pequena. */
    help:        '<kbd>&larr; &rarr;</kbd> move &nbsp;·&nbsp; <b>Enter</b> go through the door &nbsp;·&nbsp; or press <b>A B C D</b>',
    helpStacked: '<kbd>&uarr; &darr;</kbd> move &nbsp;·&nbsp; <b>Enter</b> go through the door &nbsp;·&nbsp; or press <b>A B C D</b>',
    helpTouch:   'Tap a door to walk through it.',
    startLabel:  'START',
    startAria:   'Start of the corridor',
    doorAria:    'Door {key}: {value}',
    sayStart:    'Back at the start of the corridor.',
    sayOn:       'Standing at door {key}. It says {value}.',
    sayNeedMove: 'Step onto a door first: use the left and right arrows.',
    sayRight:    'Correct. The door opens.',
    sayWrong:    'Wrong door. Back to the start.',

    /* ---------- FORGE (mech: "forge") ----------
       Construction mechanic: tap pieces from a palette to build an answer,
       then confirm. Generic chrome only — no subject content here. */
    forgeHelp:      'Tap pieces to add them. Tap an added piece to remove it. Press <b>Confirm</b> when ready.',
    forgeConfirm:   'CONFIRM',
    forgePreview:   'Your answer so far',
    forgePaletteAria: 'Available pieces',
    sayForgeAdd:    'Added: {value}.',
    sayForgeRemove: 'Removed: {value}.',
    sayForgeEmpty:  'Add at least one piece before confirming.',
    sayForgeGood:   'That satisfies the rule.',
    sayForgeBad:    'Not yet — check the rule and try again.'
  },

  /* ---------- COMPANERO DE PANTALLA ----------
     Genericos: nunca nombran a nadie. Una materia puede sustituirlos
     desde data.js con `meta.mate` o `ui.mate`. */
  mate: {
    start:   'LET\'S GO',
    turn:    'YOUR TURN',
    retry:   'ROUND TWO',
    combo:   'COMBO x{n}',
    comboPop:'COMBO x{n}!',
    gemPop:  '◆ GEM {n}/{total}!',   // texto plano: el aviso usa textContent
    cheers:   ['NICE ONE!', 'GOT IT!', 'YES!', 'SHARP!', 'CLEAN WORK!', 'THAT\'S IT!'],
    consoles: ['NOT YET...', 'ALMOST!', 'TRY AGAIN', 'KEEP GOING', 'SHAKE IT OFF']
  },

  /* ---------- VICTORIA ----------
     Sin "primer intento", sin fallos y sin comparar con otra partida. */
  win: {
    title:      'LEVEL {n} CLEARED',
    gemsLine:   '+{n} gem{s}: one for every stretch you finished.',
    statXP:     'XP',
    statCombo:  'BEST COMBO',
    verdict:    'Play it again whenever you like &mdash; the questions come back with new numbers.',
    skillsNew:  'NEW SKILLS',
    skillsMore: '+{n} more',
    colourNew:  '&#127912; NEW ARMOUR COLOUR UNLOCKED: {colour}',
    unlocked:   '&#128275; UNLOCKED: LEVEL {n} &mdash; {name}',
    btnReplay:  'REPLAY',
    btnMap:     'BACK TO MAP &gt;'
  },

  /* ---------- PERFIL ---------- */
  score: {
    btnProfile:   'PROFILE',
    title:        'YOUR RECORD',
    progressLabel:'SKILLS LEARNED',
    progressBar:  '{done} of {total} question types',
    gemsLine:     'GEMS',
    noPlays:      'Nothing played yet. Clear a level and your record shows up here.',
    skillsTitle:  'SKILLS',
    skillsHelp:   'Every question type you have solved at least once.',
    skillsLocked: '{n} more question types still to discover.',
    btnBack:      '&lt; MAP'
  }
};
