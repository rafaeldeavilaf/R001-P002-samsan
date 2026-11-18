#!/usr/bin/env python3
"""
HISTORIAS DE USUARIO — una guia a la vez, en Chrome real (Playwright).

    python3 tools/build.py
    python3 tools/historias_guias.py y2-english
    python3 tools/historias_guias.py y6-english

Cada historia de docs/guias-historias.md tiene aqui su prueba con el
resultado esperado escrito antes de correr. La voz del telefono se simula
(una voz local y una de red) para saber que se dijo y con que voz; la musica
se mide con el propio motor (GUIA._musica.estado y medir). El informe queda en
_local/historias-<guia>.json y la salida dice OK / FALLA por historia.

H14 usa la auditoria de la skill webapp-verificacion (contraste, toques de
44 px, desborde contra el ancho real del dispositivo) si esta instalada.
Sale con codigo 1 si alguna historia falla.
"""
import asyncio, glob, json, os, subprocess, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')

# auditoria de la skill (opcional)
AUD_JS = None
for d in glob.glob('/root/.claude/skills/**/webapp-verificacion/scripts', recursive=True) + [os.environ.get('VERIF_SCRIPTS', '')]:
    if d and os.path.exists(os.path.join(d, 'auditoria.py')):
        sys.path.insert(0, d)
        try:
            import auditoria
            AUD_JS = auditoria.JS
        except Exception:
            AUD_JS = None
        break

PERFILES = {
    'celular': dict(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    'android': dict(viewport={'width': 360, 'height': 640}, device_scale_factor=2, is_mobile=True, has_touch=True),
    'horizontal': dict(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True),
    'pc': dict(viewport={'width': 1366, 'height': 768}),
}

VOZ = r"""
(() => {
  const remota = %s;
  const voces = [{ name: 'Google UK English Female', lang: 'en-GB', localService: false },
                 { name: 'Google español', lang: 'es-ES', localService: false }];
  if (!remota) voces.push({ name: 'Daniel', lang: 'en-GB', localService: true }, { name: 'Monica', lang: 'es-ES', localService: true });
  window.__dichos = [];
  const ss = { speaking: false, getVoices: () => voces, cancel() {}, onvoiceschanged: null,
    speak(u) { window.__dichos.push({ texto: u.text, voz: u.voice && u.voice.name });
      setTimeout(() => { u.onstart && u.onstart(); }, 20); setTimeout(() => { u.onend && u.onend(); }, 600); } };
  Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  window.__osc = 0;
  const C = window.AudioContext;
  if (C) { const o = C.prototype.createOscillator; C.prototype.createOscillator = function () { window.__osc++; return o.call(this); }; }
})();
"""


def config(guia):
    js = "const G={iniciar:c=>{process.stdout.write(JSON.stringify(c))}};new Function('GUIA',require('fs').readFileSync(%r,'utf8'))(G)" % os.path.join(ROOT, 'guias', guia + '.js')
    return json.loads(subprocess.check_output(['node', '-e', js]))


class Prueba:
    def __init__(self, guia):
        self.guia = guia
        self.cfg = config(guia)
        self.url = 'file://' + os.path.join(ROOT, 'guia-' + guia + '.html')
        self.res = []
        self.y6 = self.cfg.get('tema') == 'y6'

    def anotar(self, hid, ok, esperado, obtenido):
        self.res.append({'id': hid, 'ok': bool(ok), 'esperado': esperado, 'obtenido': obtenido})
        print(('  OK    ' if ok else '  FALLA ') + hid + ' · ' + str(obtenido)[:150])

    async def pagina(self, hash='', perfil='celular', remota=False, ctx=None):
        if ctx is None:
            ctx = await self.b.new_context(**PERFILES[perfil])
            await ctx.add_init_script(VOZ % ('true' if remota else 'false'))
        pg = await ctx.new_page()
        pg.errores = []
        pg.red = []
        pg.on('pageerror', lambda e: pg.errores.append(str(e)))
        pg.on('request', lambda r: pg.red.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
        await pg.goto(self.url + ('#' + hash if hash else ''))
        await pg.wait_for_selector('.g-barra', timeout=8000)
        return ctx, pg

    def act(self, tipo):
        """primera actividad de ese tipo: (id mision, numero, actividad)"""
        for m in self.cfg['misiones']:
            for i, a in enumerate(m['actividades']):
                if a['tipo'] == tipo:
                    return m['id'], i + 1, a
        return None

    async def ayuda_hasta_fin(self, pg, maximo=400):
        for _ in range(maximo):
            if await pg.locator('.g-capa').count():
                return True
            await pg.evaluate("document.querySelector('.g-ayuda-fila .g-btn') && document.querySelector('.g-ayuda-fila .g-btn').click()")
            await pg.wait_for_timeout(15)
        for _ in range(30):
            if await pg.locator('.g-capa').count():
                return True
            await pg.evaluate("document.querySelector('.g-ayuda-fila .g-btn') && document.querySelector('.g-ayuda-fila .g-btn').click()")
            await pg.wait_for_timeout(350)
        return await pg.locator('.g-capa').count() > 0

    async def fichas(self, pg):
        return sorted(await pg.eval_on_selector_all('.g-pool .g-ficha', 'n => n.map(x => x.textContent.trim())'))

    async def toque(self, pg, x, y):
        await pg.mouse.click(x, y)

    async def arrastre_tactil(self, pg, x0, y0, x1, y1):
        cdp = await pg.context.new_cdp_session(pg)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
        for i in range(1, 13):
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / 12, 'y': y0 + (y1 - y0) * i / 12}]})
            await pg.wait_for_timeout(16)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        await pg.wait_for_timeout(200)

    # ------------------------------------------------------------ historias
    async def correr(self):
        ms = self.cfg['misiones']
        async with async_playwright() as p:
            self.b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])

            # H01 empezar
            ctx, pg = await self.pagina()
            t1 = await pg.locator('#play').inner_text()
            ids = {ms[0]['id'] + '-' + str(i + 1): 1 for i in range(len(ms[0]['actividades']))}
            await pg.evaluate("(h) => localStorage.setItem('samsan:guia-%s', JSON.stringify(h))" % self.cfg['id'], ids)
            await pg.reload(); await pg.wait_for_selector('#play')
            t2 = await pg.locator('#play').inner_text()
            self.anotar('H01', ms[0]['titulo'] in t1 and ms[1]['titulo'] in t2,
                        'START nombra la mision 1 y, completa esa, la 2', [t1, t2])
            await ctx.close()

            # H02 leccion y voz
            ctx, pg = await self.pagina(ms[0]['id'])
            ej = pg.locator('.g-ej, .g-frase-ej').first
            texto = (await ej.inner_text()).replace('\n', ' ')
            antes = await pg.evaluate('window.__dichos.length')
            await ej.click(); await pg.wait_for_timeout(100)
            dichos = await pg.evaluate('window.__dichos')
            self.anotar('H02', await pg.locator('.g-tarjeta').count() > 0 and len(dichos) > antes,
                        'Aprende visible; tocar un ejemplo lo dice', {'tarjetas': await pg.locator('.g-tarjeta').count(), 'dijo': dichos[-1] if dichos else None, 'ejemplo': texto[:40]})
            await ctx.close()

            mid, n, cl = self.act('clasificar')
            # H03 tocar ficha y caja
            ctx, pg = await self.pagina('%s-%d' % (mid, n))
            f = pg.locator('.g-pool .g-ficha').first
            caja = await f.evaluate('e => e._x.caja')
            await f.click(); await pg.locator('.g-caja[data-destino="%s"]' % caja).click(); await pg.wait_for_timeout(100)
            chips = await pg.locator('.g-caja[data-destino="%s"] .g-chip' % caja).count()
            self.anotar('H03', chips == 1, 'la ficha entra en su caja al tocar ficha y caja', {'chips': chips})

            # H05 error: no entra, Try again; segundo error: pista y brillo
            f = pg.locator('.g-pool .g-ficha').first
            caja = await f.evaluate('e => e._x.caja')
            mala = [c['id'] for c in cl['cajas'] if c['id'] != caja][0]
            await f.click(); await pg.locator('.g-caja[data-destino="%s"]' % mala).click(); await pg.wait_for_timeout(80)
            p1 = await pg.locator('.g-pista').inner_text()
            sigue = await f.evaluate('e => e.isConnected')
            await pg.locator('.g-caja[data-destino="%s"]' % mala).click(); await pg.wait_for_timeout(80)
            p2 = await pg.locator('.g-pista').inner_text()
            brilla = await pg.locator('.g-caja[data-destino="%s"]' % caja).evaluate("e => e.classList.contains('brilla')")
            self.anotar('H05', sigue and ('again' in p1.lower() or 'otra vez' in p1.lower()) and p2.strip() == cl['pista'] and brilla,
                        'no entra; «Try again»; al 2.º error la pista y brilla la caja correcta', {'sigue': sigue, 'p1': p1, 'p2': p2[:50], 'brilla': brilla})
            await ctx.close()

            # H04 arrastre tactil (CDP) y soltar fuera
            ctx, pg = await self.pagina('%s-%d' % (mid, n))
            f = pg.locator('.g-pool .g-ficha').first
            caja = await f.evaluate('e => e._x.caja')
            fb = await f.bounding_box(); cb = await pg.locator('.g-caja[data-destino="%s"]' % caja).bounding_box()
            await self.arrastre_tactil(pg, fb['x'] + fb['width'] / 2, fb['y'] + fb['height'] / 2, cb['x'] + cb['width'] / 2, cb['y'] + cb['height'] / 2)
            chips = await pg.locator('.g-caja[data-destino="%s"] .g-chip' % caja).count()
            g = pg.locator('.g-pool .g-ficha').first
            gb = await g.bounding_box(); ob = await pg.locator('.g-orden').bounding_box()
            await self.arrastre_tactil(pg, gb['x'] + gb['width'] / 2, gb['y'] + gb['height'] / 2, ob['x'] + 20, ob['y'] + 10)
            vuelve = await g.evaluate('e => e.isConnected && !e.classList.contains("g-origen")')
            fantasmas = await pg.locator('.g-fantasma').count()
            self.anotar('H04', chips == 1 and vuelve and fantasmas == 0 and not pg.errores,
                        'arrastre tactil coloca la ficha; soltar fuera la devuelve', {'chips': chips, 'devuelta': vuelve, 'fantasmas': fantasmas, 'errores': pg.errores})
            await ctx.close()

            # H06 bombilla en 3 peldaños
            ctx, pg = await self.pagina('%s-%d' % (mid, n))
            antes = len(await self.fichas(pg))
            b = pg.locator('.g-ayuda-fila .g-btn')
            await b.click(); p1 = await pg.locator('.g-pista').inner_text()
            await b.click(); br = await pg.locator('.brilla').count()
            await b.click(); await pg.wait_for_timeout(50); despues = len(await self.fichas(pg))
            self.anotar('H06', p1.strip() == cl['pista'] and br > 0 and despues == antes - 1,
                        'pista, luego brillo, luego una jugada hecha', {'pista': bool(p1), 'brillos': br, 'fichas': [antes, despues]})
            await ctx.close()

            # H07 cuatro entradas, al menos 3 tandas distintas
            tandas = []
            for _ in range(4):
                ctx, pg = await self.pagina('%s-%d' % (mid, n))
                tandas.append(tuple(await self.fichas(pg))); await ctx.close()
            self.anotar('H07', len(set(tandas)) >= 3, 'al menos 3 tandas distintas en 4 entradas', {'distintas': len(set(tandas))})

            # H08 New round + H09 se guarda
            ctx, pg = await self.pagina('%s-%d' % (mid, n))
            t0 = tuple(await self.fichas(pg))
            fin = await self.ayuda_hasta_fin(pg)
            otra = pg.locator('.g-capa .g-btn').nth(1)
            await otra.click(); await pg.wait_for_timeout(150)
            t1 = tuple(await self.fichas(pg))
            self.anotar('H08', fin and t1 != t0 and len(t1) > 0, 'New round trae otra tanda', {'termino': fin, 'igual': t1 == t0})
            await pg.goto(self.url); await pg.reload(); await pg.wait_for_selector('.g-mision')
            idx = [m['id'] for m in ms].index(mid)
            tarjeta = pg.locator('.g-mision').nth(idx)
            if self.y6:
                tag = await tarjeta.locator('.g-tag').inner_text(); xp = await pg.locator('.g-xp__fila').inner_text()
                ok = '+50' in tag and '50' in xp
                obt = {'etiqueta': tag, 'xp': xp}
            else:
                est = await tarjeta.locator('.g-estrellas').get_attribute('aria-label')
                ok = est.startswith('1 /'); obt = {'estrellas': est}
            self.anotar('H09', ok, 'tras recargar sigue la estrella o la XP', obt)

            # H10 Atras
            await pg.locator('.g-mision').first.click(); await pg.wait_for_selector('.g-tarjeta')
            await pg.locator('.g-btn--grande').click(); await pg.wait_for_selector('.g-orden')
            await pg.go_back(); await pg.wait_for_timeout(150)
            paso1 = await pg.locator('.g-tarjeta').count() > 0 and await pg.locator('.g-orden').count() == 0
            await pg.go_back(); await pg.wait_for_timeout(150)
            paso2 = await pg.locator('.g-portada').count() > 0
            self.anotar('H10', paso1 and paso2 and pg.url.startswith(self.url.split('#')[0]),
                        'Atras: actividad → leccion → misiones, sin salir', {'a_leccion': paso1, 'a_misiones': paso2})
            await ctx.close()

            # H11 musica: primer toque, apagar, recordar; primer toque en el boton
            ctx, pg = await self.pagina()
            e0 = await pg.evaluate('GUIA._musica.estado()')
            await pg.locator('.g-hola').click(); await pg.wait_for_timeout(900)
            e1 = await pg.evaluate('GUIA._musica.estado()'); osc = await pg.evaluate('window.__osc')
            await pg.locator('.g-btn-musica').click(); await pg.wait_for_timeout(100)
            e2 = await pg.evaluate('GUIA._musica.estado()')
            await pg.reload(); await pg.wait_for_selector('.g-barra'); await pg.locator('.g-hola').click(); await pg.wait_for_timeout(300)
            e3 = await pg.evaluate('GUIA._musica.estado()')
            await ctx.close()
            ctx, pg = await self.pagina()
            await pg.locator('.g-btn-musica').click(); await pg.wait_for_timeout(500)
            e4 = await pg.evaluate('GUIA._musica.estado()')
            await ctx.close()
            self.anotar('H11', (not e0['sonando']) and e1['sonando'] and e1['ctx'] == 'running' and osc > 0 and not e2['sonando'] and not e3['sonando'] and not e3['on'] and e4['sonando'],
                        'suena al 1.er toque; el boton apaga y se recuerda; 1.er toque en el boton la arranca',
                        {'antes': e0['sonando'], 'tras_toque': e1, 'osciladores': osc, 'apagada': e2['sonando'], 'tras_recargar': e3, 'primer_toque_boton': e4['sonando']})

            # H12 la musica baja con la voz
            ctx, pg = await self.pagina(ms[0]['id'])
            await pg.locator('.g-hola').click(); await pg.wait_for_timeout(200)
            await pg.locator('.g-ej, .g-frase-ej').first.click(); await pg.wait_for_timeout(200)
            durante = await pg.evaluate('GUIA._musica.estado().bajo')
            await pg.wait_for_timeout(800)
            despues = await pg.evaluate('GUIA._musica.estado().bajo')
            self.anotar('H12', durante and not despues, 'baja mientras habla y vuelve', {'durante': durante, 'despues': despues})
            await ctx.close()

            # H13 solo voces locales
            ctx, pg = await self.pagina(ms[0]['id'])
            await pg.locator('.g-ej, .g-frase-ej').first.click(); await pg.wait_for_timeout(80)
            d1 = await pg.evaluate('window.__dichos')
            await ctx.close()
            ctx, pg = await self.pagina(ms[0]['id'], remota=True)
            await pg.locator('.g-ej, .g-frase-ej').first.click(); await pg.wait_for_timeout(80)
            d2 = await pg.evaluate('window.__dichos')
            await ctx.close()
            locales = {'Daniel', 'Monica'}
            self.anotar('H13', d1 and all(x['voz'] in locales for x in d1) and not d2,
                        'usa la voz local; sin voz local no habla', {'voces_usadas': sorted({x['voz'] for x in d1}), 'con_solo_red': len(d2)})

            # H14 perfiles: desborde, contraste, toques
            vistas = ['', ms[0]['id']] + ['%s-%d' % (m['id'], i + 1) for m in ms for i in range(len(m['actividades']))][:99]
            fallas = []
            if AUD_JS:
                for perfil in PERFILES:
                    ctx = await self.b.new_context(**PERFILES[perfil]); await ctx.add_init_script(VOZ % 'false')
                    for v in vistas:
                        pg = await ctx.new_page(); await pg.goto(self.url + ('#' + v if v else '')); await pg.wait_for_selector('.g-barra'); await pg.wait_for_timeout(250)
                        r = await pg.evaluate(AUD_JS, PERFILES[perfil]['viewport']['width'])
                        toque = [x for x in r['toque'] if not (x['elemento'].startswith('A.') and x['alto'] >= 16)]   # enlace del pie, en texto
                        toque = [x for x in toque if not (x['elemento'].startswith('BUTTON.g-palabra') and x['alto'] >= 44 and x['ancho'] >= 24)]   # palabras cortas en una frase: alto 44, ancho minimo 24 (WCAG 2.5.8)
                        for c in ('contraste',):
                            fallas += [(perfil, v or 'portada', c, x) for x in r[c]]
                        fallas += [(perfil, v or 'portada', 'toque', x) for x in toque]
                        if r['desborde'] > 0: fallas.append((perfil, v or 'portada', 'desborde', r['desborde']))
                        await pg.close()
                    await ctx.close()
                self.anotar('H14', not fallas, 'sin desborde, contraste AA y toques de 44 px en 4 perfiles',
                            {'vistas': len(vistas) * len(PERFILES), 'fallas': fallas[:8], 'total_fallas': len(fallas)})
            else:
                self.anotar('H14', False, 'auditoria disponible', 'NO MEDIDO: falta la skill webapp-verificacion')

            # H15 repaso final mezclado: se recorre como el nino, con Next en la misma pagina
            if self.cfg.get('jefe'):
                n = min(len(ms), self.cfg['jefe'].get('max', 6))
                corridas = []
                for _ in range(2):
                    ctx, pg = await self.pagina('boss')
                    await pg.locator('.g-btn--grande').click(); await pg.wait_for_selector('.g-orden')
                    subs = []
                    for i in range(n):
                        subs.append((await pg.locator('.g-barra small').inner_text()).split('·')[-1].strip().lower())
                        await self.ayuda_hasta_fin(pg)
                        await pg.locator('.g-capa .g-btn').first.click(); await pg.wait_for_timeout(120)
                    corridas.append(subs); await ctx.close()
                distintas = [len(set(c)) for c in corridas]
                self.anotar('H15', all(d >= min(3, n) and d == len(c) for d, c in zip(distintas, corridas)) and corridas[0] != corridas[1],
                            'cada tarea del repaso viene de una mision distinta (al menos 3) y la mezcla cambia al volver a entrar', {'corridas': corridas})
            else:
                self.anotar('H15', False, 'hay repaso final', 'la guia no declara jefe')

            # H19 cada actividad (y variantes al azar) se termina sin errores; H16 y H17 se miden en el camino
            red, puntajes, fallidas, errores = [], [], [], []
            ctx = await self.b.new_context(**PERFILES['celular']); await ctx.add_init_script(VOZ % 'false')
            for m in ms + ([{'id': 'boss', 'actividades': [None] * min(len(ms), self.cfg['jefe'].get('max', 6))}] if self.cfg.get('jefe') else []):
                for i, a in enumerate(m['actividades']):
                    vueltas = len(a['variantes']) * 2 if a and a.get('variantes') else 1
                    for _ in range(vueltas):
                        pg = await ctx.new_page(); pg.errores = []
                        pg.on('pageerror', lambda e, pg=pg: pg.errores.append(str(e)))
                        pg.on('request', lambda r: red.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
                        await pg.goto(self.url + '#%s-%d' % (m['id'], i + 1)); await pg.wait_for_selector('.g-orden')
                        txt = await pg.locator('body').inner_text()
                        if '%' in txt or 'score:' in txt.lower() or 'first try' in txt.lower(): puntajes.append(m['id'])
                        if not await self.ayuda_hasta_fin(pg): fallidas.append('%s-%d' % (m['id'], i + 1))
                        txt = await pg.locator('.g-capa').inner_text() if await pg.locator('.g-capa').count() else ''
                        if '%' in txt: puntajes.append(m['id'] + ' (capa)')
                        errores += pg.errores
                        await pg.close()
            await ctx.close()
            self.anotar('H19', not fallidas and not errores, 'todas las actividades y variantes se terminan sin errores', {'fallidas': fallidas, 'errores': errores[:3]})
            self.anotar('H16', not red, 'sin pedidos de red', {'pedidos': red[:5]})
            self.anotar('H17', not puntajes, 'sin porcentajes ni puntajes', {'pantallas_con_puntaje': puntajes})

            # H18 empezar de cero
            ctx, pg = await self.pagina()
            await pg.evaluate("localStorage.setItem('samsan:guia-%s', JSON.stringify({'%s-1': 1}))" % (self.cfg['id'], ms[0]['id']))
            await pg.reload(); await pg.wait_for_selector('.g-pie-portada button')
            pg.once('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
            await pg.locator('.g-pie-portada button').click(); await pg.wait_for_timeout(150)
            sigue = await pg.evaluate("localStorage.getItem('samsan:guia-%s')" % self.cfg['id'])
            pg.once('dialog', lambda d: asyncio.ensure_future(d.accept()))
            await pg.locator('.g-pie-portada button').click(); await pg.wait_for_timeout(150)
            queda = await pg.evaluate("localStorage.getItem('samsan:guia-%s')" % self.cfg['id'])
            self.anotar('H18', sigue and '1' in sigue and queda == '{}', 'pide confirmacion; al aceptar queda en cero', {'cancelar_conserva': bool(sigue), 'aceptar': queda})
            await ctx.close()

            # especificas
            if self.y6:
                await self.y6_propias()
            else:
                await self.y2_propias()
            await self.b.close()

    async def y2_propias(self):
        mid, n, a = self.act('clasificar')
        ctx, pg = await self.pagina('%s-%d' % (mid, n))
        await pg.wait_for_timeout(600)
        d0 = await pg.evaluate('window.__dichos')
        await pg.locator('.g-pool .g-ficha').first.click(); await pg.wait_for_timeout(80)
        d1 = await pg.evaluate('window.__dichos')
        self.anotar('Y2-1', d0 and d0[0]['texto'] == a['orden'] and len(d1) > len(d0), 'lee la instruccion sola y lee la ficha al tocarla', {'primero': d0[0]['texto'] if d0 else None, 'tras_ficha': len(d1) - len(d0)})
        alturas = await pg.eval_on_selector_all('.g-ficha, .g-caja', 'n => n.map(x => Math.round(x.getBoundingClientRect().height))')
        self.anotar('Y2-2', min(alturas) >= 48, 'fichas y cajas de al menos 48 px', {'minimo_px': min(alturas)})
        await ctx.close()
        for m in self.cfg['misiones']:
            for i, x in enumerate(m['actividades']):
                if x['tipo'] == 'completar' and any('decir' in it for it in x['items']):
                    ctx, pg = await self.pagina('%s-%d' % (m['id'], i + 1)); await pg.wait_for_timeout(700)
                    d = [y['texto'] for y in await pg.evaluate('window.__dichos')]
                    palabras = {it['decir'] for it in x['items'] if 'decir' in it}
                    self.anotar('Y2-3', any(t in palabras for t in d), 'dice la palabra al aparecer', {'dijo': d[:3]})
                    await ctx.close()
                    return

    async def y6_propias(self):
        ctx, pg = await self.pagina()
        tema = await pg.evaluate("document.documentElement.getAttribute('data-tema')")
        fondo = await pg.evaluate("getComputedStyle(document.body).backgroundColor")
        cubos = await pg.locator('.g-cubo').count(); dron = await pg.locator('.g-dron').count(); xp = await pg.locator('.g-xp').count()
        fuente = await pg.evaluate("getComputedStyle(document.querySelector('.g-seccion')).fontFamily")
        self.anotar('Y6-1', tema == 'y6' and fondo in ('rgb(11, 17, 32)',) and cubos == len(self.cfg['misiones']) + 1 and dron == 1 and xp == 1 and 'Press Start' in fuente,
                    'tema oscuro, Z1P, cubos, XP y etiquetas de consola', {'fondo': fondo, 'cubos': cubos, 'dron': dron, 'xp': xp, 'fuente': fuente[:30]})
        await ctx.close()
        # XP: errores no restan, repetir no suma, Level up al pasar 150
        ms = self.cfg['misiones']
        ctx = await self.b.new_context(**PERFILES['celular']); await ctx.add_init_script(VOZ % 'false')
        xps, subio, insignia = [], False, None
        for i in range(len(ms[0]['actividades'])):
            pg = await ctx.new_page(); await pg.goto(self.url + '#%s-%d' % (ms[0]['id'], i + 1)); await pg.wait_for_selector('.g-orden')
            await self.ayuda_hasta_fin(pg)
            capa = await pg.locator('.g-capa').inner_text()
            if i == len(ms[0]['actividades']) - 1: insignia = ms[0].get('insignia') in capa
            await pg.close()
        pg = await ctx.new_page(); await pg.goto(self.url + '#%s-1' % ms[0]['id']); await pg.wait_for_selector('.g-orden')
        await self.ayuda_hasta_fin(pg); repetida = await pg.locator('.g-xp-gana').inner_text(); await pg.close()
        pg = await ctx.new_page(); await pg.goto(self.url); await pg.wait_for_selector('.g-xp__fila'); xp1 = await pg.locator('.g-xp__fila').inner_text(); await pg.close()
        pg = await ctx.new_page(); await pg.goto(self.url + '#%s-1' % ms[1]['id']); await pg.wait_for_selector('.g-orden')
        # equivocarse a proposito antes de terminar
        if await pg.locator('.g-caja').count():
            f = pg.locator('.g-pool .g-ficha').first; caja = await f.evaluate('e => e._x.caja')
            mala = pg.locator('.g-caja:not([data-destino="%s"])' % caja).first
            await f.click(); await mala.click(); await mala.click()
        elif await pg.locator('.g-palabra').count():
            for b in await pg.locator('.g-palabra').all():
                if not await b.evaluate('e => !!e._g'): await b.click(); break
        await self.ayuda_hasta_fin(pg)
        capa = await pg.locator('.g-capa').inner_text(); subio = 'level up' in capa.lower()
        await pg.close()
        pg = await ctx.new_page(); await pg.goto(self.url); await pg.wait_for_selector('.g-xp__fila'); xp2 = await pg.locator('.g-xp__fila').inner_text(); await pg.close()
        await ctx.close()
        n0 = len(ms[0]['actividades']) * 50
        self.anotar('Y6-2', (str(n0) + ' /') in xp1 and repetida.strip() == '✓' and str(n0 + 50) in xp2 and (subio == (n0 < 150 <= n0 + 50)),
                    '50 XP por tarea, con o sin errores; repetir no suma; Level up al cruzar 150',
                    {'xp_tras_quest1': xp1, 'repetir': repetida, 'xp_tras_error': xp2, 'level_up': subio})
        self.anotar('Y6-3', insignia, 'insignia al cerrar la quest', {'insignia': ms[0].get('insignia'), 'vista': insignia})
        ctx, pg = await self.pagina('%s-1' % ms[0]['id']); await pg.wait_for_timeout(600)
        d0 = await pg.evaluate('window.__dichos.length')
        await pg.locator('.g-orden .g-icono').click(); await pg.wait_for_timeout(80)
        d1 = await pg.evaluate('window.__dichos')
        self.anotar('Y6-4', d0 == 0 and len(d1) == 1, 'no lee sola; el parlante si lee', {'sola': d0, 'con_boton': len(d1)})
        r6 = await pg.evaluate("GUIA._musica.medir('synth', 8)"); r2 = await pg.evaluate("GUIA._musica.medir('alegre', 8)")
        self.anotar('Y6-5', r6['rmsTelefono'] >= r2['rmsTelefono'], 'energia audible en telefono de Y6 >= Y2',
                    {'y6': round(r6['rmsTelefono'], 4), 'y2': round(r2['rmsTelefono'], 4)})
        await ctx.close()


async def main(guia):
    print('HISTORIAS · guia ' + guia)
    pr = Prueba(guia)
    await pr.correr()
    os.makedirs(os.path.join(ROOT, '_local'), exist_ok=True)
    json.dump(pr.res, open(os.path.join(ROOT, '_local', 'historias-%s.json' % guia), 'w'), ensure_ascii=False, indent=1)
    malas = [r['id'] for r in pr.res if not r['ok']]
    print('\n%d historias · %d OK · %d FALLAN %s' % (len(pr.res), len(pr.res) - len(malas), len(malas), malas))
    return 1 if malas else 0

if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sys.exit(asyncio.run(main(sys.argv[1])))
