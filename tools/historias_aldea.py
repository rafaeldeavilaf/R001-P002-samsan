#!/usr/bin/env python3
"""
HISTORIAS DE USUARIO DEL MODO ALDEA (v3, «La aldea de Pip») — en Chrome real.

    python3 tools/build.py
    python3 tools/historias_aldea.py y2-english-v3

Las historias A01-A20 estan en docs/guias-historias.md (seccion v3): las J de
la v2 adaptadas, mas dibujo en cada elemento, etapas de 5, album y pantalla sin
texto para jugar. Reutiliza la voz simulada, los perfiles y la auditoria de
tools/historias_guias.py. Informe en _local/historias-<guia>.json. Sale con
codigo 1 si alguna falla.
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import historias_guias as H
from playwright.async_api import async_playwright

ROOT = H.ROOT
AYUDA = "document.querySelector('.al-bombilla') && document.querySelector('.al-bombilla').click()"


class PruebaAldea(H.Prueba):
    def __init__(self, guia):
        super().__init__(guia)
        self.clave = 'samsan:aldea-' + self.cfg['id']
        self.ms = self.cfg['mundos']
        self.vistos = {m['id']: 1 for m in self.ms}

    async def pagina(self, hash='', perfil='celular', remota=False, ctx=None, estado=None):
        if ctx is None:
            ctx = await self.b.new_context(**H.PERFILES[perfil])
            await ctx.add_init_script(H.VOZ % ('true' if remota else 'false'))
            if estado is not None:
                # una sola vez por pestaña: las recargas conservan el progreso que haga la prueba
                await ctx.add_init_script("if (!sessionStorage.getItem('__ini')) { localStorage.setItem(%r, %r); sessionStorage.setItem('__ini', '1'); }" % (self.clave, json.dumps(estado)))
        pg = await ctx.new_page()
        pg.errores = []; pg.red = []
        pg.on('pageerror', lambda e: pg.errores.append(str(e)))
        pg.on('request', lambda r: pg.red.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
        await pg.goto(self.url + ('#' + hash if hash else ''))
        await pg.wait_for_selector('.g-barra, .al-barra', timeout=8000)
        return ctx, pg

    async def activo(self, pg, espera=4000):
        for _ in range(espera // 100):
            a = await pg.evaluate("GUIA._aldea_etapa && GUIA._aldea_etapa.activo()")
            if a: return a
            await pg.wait_for_timeout(100)
        return None

    async def estrellas(self, pg):
        return await pg.locator('.al-pantalla .al-estrellas').get_attribute('aria-label')

    async def terminar(self, pg, maximo=60):
        for _ in range(maximo):
            if await pg.locator('.al-fin').count(): return True
            if await pg.evaluate("GUIA._aldea_etapa && GUIA._aldea_etapa.activo()"):
                await pg.evaluate(AYUDA); await pg.evaluate(AYUDA); await pg.evaluate(AYUDA)
            await pg.wait_for_timeout(450)
        return await pg.locator('.al-fin').count() > 0

    async def correr(self):
        ms, m0 = self.ms, self.ms[0]
        V = {'vistos': self.vistos}
        async with async_playwright() as p:
            self.b = await p.chromium.launch(executable_path=H.CHROME, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])

            # A01 Play lleva a la siguiente etapa sin terminar
            ctx, pg = await self.pagina()
            t1 = await pg.locator('#play').get_attribute('aria-label')
            await pg.evaluate("(e) => localStorage.setItem(%r, JSON.stringify(e))" % self.clave, {'etapas': {m0['id'] + '-1': 1}, 'vistos': self.vistos})
            await pg.reload(); await pg.wait_for_selector('#play'); t2 = await pg.locator('#play').get_attribute('aria-label')
            self.anotar('A01', m0['titulo'] in t1 and 'Stage 1' in t1 and 'Stage 2' in t2, 'Play lleva a la siguiente etapa sin terminar', [t1, t2])
            await ctx.close()

            # A02 demostracion de Pip la primera vez, con voz; no se repite; ? la repite
            ctx, pg = await self.pagina(m0['id'] + '-1')
            demo = await pg.locator('.al-demo__tapa').count()
            await pg.wait_for_timeout(4200)
            dichos = [d['texto'] for d in await pg.evaluate('window.__dichos')]
            ejs = [z['ejp'].replace('*', '') for z in m0['zonas']]
            dijo_ej = any(any(e in d for e in ejs) for d in dichos)
            await pg.locator('.al-demo__saltar').click(); await pg.wait_for_timeout(200)
            juega = await self.activo(pg) is not None
            await pg.reload(); await pg.wait_for_selector('.al-barra'); await pg.wait_for_timeout(300)
            demo2 = await pg.locator('.al-demo__tapa').count()
            await pg.locator('.al-barra .g-icono').nth(1).click(); await pg.wait_for_timeout(150)
            demo3 = await pg.locator('.al-demo__tapa').count()
            self.anotar('A02', demo == 1 and dijo_ej and juega and demo2 == 0 and demo3 == 1, 'demostracion con voz la primera vez, no se repite, ? la repite',
                        {'demo': demo, 'dice_ejemplo': dijo_ej, 'luego_juega': juega, 'al_volver': demo2, 'con_?': demo3})
            await ctx.close()

            # A03 tocar el lugar; A05 error sin perder; A06 ayuda en tres pasos
            ctx, pg = await self.pagina(m0['id'] + '-3', estado=V)
            a = await self.activo(pg)
            await pg.locator('.al-pantalla [data-lugar="%s"]' % a['zona']).click(); await pg.wait_for_timeout(2300)
            a2 = await self.activo(pg)
            self.anotar('A03', await self.estrellas(pg) == '1 / 5' and a2 and a2['p'] != a['p'], 'tocar el lugar ubica el globo, se llena una estrella y sale otro', {'estrellas': await self.estrellas(pg)})
            mala = pg.locator('.al-pantalla .al-lugar:not([data-lugar="%s"])' % a2['zona']).first
            await pg.evaluate('window.__dichos = []')
            await mala.click(); await pg.wait_for_timeout(60)
            tiembla = await mala.evaluate("e => e.classList.contains('al-tiembla')")
            await mala.click(); await pg.wait_for_timeout(80)
            sigue = (await self.activo(pg))['p'] == a2['p'] and await self.estrellas(pg) == '1 / 5'
            brilla = await pg.locator('.al-pantalla [data-lugar="%s"]' % a2['zona']).evaluate("e => e.classList.contains('al-brilla')")
            voz = [z['voz'] for z in m0['zonas'] if z['id'] == a2['zona']][0]
            dichos = [d['texto'] for d in await pg.evaluate('window.__dichos')]
            self.anotar('A05', tiembla and sigue and brilla and any(voz in d for d in dichos), 'lugar equivocado: tiembla, no entra; al 2.o error Pip da el sonido y brilla el correcto', {'tiembla': tiembla, 'sigue': sigue, 'brilla': brilla, 'dijo': dichos[-1:]})
            await pg.wait_for_timeout(2700)
            b = pg.locator('.al-bombilla')
            # tras 2 errores la bombilla sigue desde ahi: un toque ubica el globo
            await b.click(); await pg.wait_for_timeout(2300)
            un_toque = await self.estrellas(pg) == '2 / 5'
            a2 = await self.activo(pg)
            await pg.evaluate('window.__dichos = []'); await b.click(); await pg.wait_for_timeout(50)
            p1 = [d['texto'] for d in await pg.evaluate('window.__dichos')]
            await b.click(); br = await pg.locator('.al-pantalla [data-lugar="%s"]' % a2['zona']).evaluate("e => e.classList.contains('al-brilla')")
            await b.click(); await pg.wait_for_timeout(2300)
            self.anotar('A06', un_toque and p1 and p1[0] == a2['p'].replace('*', '') and br and await self.estrellas(pg) == '3 / 5', 'bombilla: palabra lenta, brilla el lugar con la pista por ejemplo, luego lo ubica; tras 2 errores sigue desde ahi', {'tras_2_errores_un_toque': un_toque, 'dijo': p1, 'brilla': br, 'estrellas': await self.estrellas(pg)})
            await ctx.close()

            # A04 arrastre tactil del globo
            ctx, pg = await self.pagina(m0['id'] + '-2', estado=V)
            a = await self.activo(pg)
            gb = await pg.locator('.al-globo').bounding_box(); lb = await pg.locator('.al-pantalla [data-lugar="%s"]' % a['zona']).bounding_box()
            await self.arrastre_tactil(pg, gb['x'] + gb['width'] / 2, gb['y'] + gb['height'] * .7, lb['x'] + lb['width'] / 2, lb['y'] + lb['height'] * .7)
            await pg.wait_for_timeout(2200)
            self.anotar('A04', await self.estrellas(pg) == '1 / 5' and not pg.errores, 'arrastrar el globo con el dedo a su lugar lo ubica', {'estrellas': await self.estrellas(pg), 'errores': pg.errores})
            await ctx.close()

            # A07 etapas de 5 globos con 2, 3 y hasta 4 lugares
            datos = []
            for m in ms:
                for e in (1, 2, 3):
                    ctx, pg = await self.pagina('%s-%d' % (m['id'], e), estado=V)
                    datos.append((m['id'], e, await pg.locator('.al-pantalla .al-lugar').count(), await pg.locator('.al-pantalla .al-estrella').count(), min([2, 3, 4][e - 1], len(m['zonas']))))
                    await ctx.close()
            self.anotar('A07', all(d[2] == d[4] and d[3] == 5 for d in datos), 'cada etapa trae 5 globos; 2 lugares, luego 3, luego hasta 4', {'mal': [d for d in datos if d[2] != d[4] or d[3] != 5]})

            # A08 tandas distintas cada vez
            firmas = []
            for _ in range(4):
                ctx, pg = await self.pagina(m0['id'] + '-2', estado=V)
                a = await self.activo(pg)
                z = await pg.evaluate("GUIA._aldea_etapa.zonas.map(z => z.id).join(',')")
                firmas.append(z + '|' + a['p']); await ctx.close()
            self.anotar('A08', len(set(firmas)) >= 3, 'al menos 3 tandas distintas en 4 entradas', {'distintas': len(set(firmas))})

            # A09 calcomania por etapa aunque haya errores; repetir no suma; se guarda y sale en el album; A12 Atras
            ctx, pg = await self.pagina(estado=V)
            await pg.locator('.al-parada').first.click(force=True); await pg.wait_for_selector('.al-globo')
            a = await self.activo(pg)
            await pg.locator('.al-pantalla .al-lugar:not([data-lugar="%s"])' % a['zona']).first.click()
            await self.terminar(pg)
            nueva = await pg.locator('.al-fin .al-calco--nueva').count()
            await pg.locator('.al-fin__botones .g-btn').nth(1).click(); await pg.wait_for_timeout(300)
            await self.terminar(pg)
            await pg.locator('.al-fin__botones .g-btn').nth(0).click(); await pg.wait_for_selector('.al-album')
            await pg.reload(); await pg.wait_for_selector('.al-album')
            titulo = await pg.locator('.al-album').evaluate("e => e.previousElementSibling.textContent")
            tiene = await pg.locator('.al-album .al-calco:not(.al-calco--falta)').count()
            self.anotar('A09', nueva == 1 and ' 1 / 18' in titulo and tiene == 1, 'una calcomania por etapa aunque haya errores; repetir no suma; se guarda y queda en el album', {'album': titulo, 'pegadas': tiene})
            await pg.locator('.al-parada').nth(1).click(force=True); await pg.wait_for_selector('.al-globo')
            await pg.go_back(); await pg.wait_for_timeout(300)
            self.anotar('A12', await pg.locator('.al-mapa').count() == 1 and pg.url.startswith(self.url), 'Atras desde una etapa vuelve al mapa', {'mapa': await pg.locator('.al-mapa').count()})
            await ctx.close()

            # A10 trajes que se liberan con calcomanias
            pieles = self.cfg['pieles']; n = pieles[1]['gemas']
            todas = ['%s-%d' % (m['id'], e) for m in ms for e in (1, 2, 3)]
            etapas = {k: 1 for k in todas[:n - 1]}
            ctx, pg = await self.pagina(estado={'etapas': etapas, 'vistos': self.vistos})
            bloq = await pg.locator('.g-traje').nth(1).is_disabled()
            await pg.goto(self.url + '#' + todas[n - 1]); await pg.reload(); await pg.wait_for_selector('.al-globo')
            await self.terminar(pg)
            aviso = await pg.locator('.al-fin .g-insignia').count()
            await pg.goto(self.url); await pg.reload(); await pg.wait_for_selector('.g-traje'); await pg.wait_for_timeout(300)
            libre = not await pg.locator('.g-traje').nth(1).is_disabled()
            if libre: await pg.locator('.g-traje').nth(1).click(); await pg.wait_for_timeout(200)
            else: print('    estado', await pg.evaluate("localStorage.getItem(%r)" % self.clave), pg.url)
            color = list(pieles[1]['colores'].values())[0]
            svg = await pg.locator('.al-hola .al-pip').evaluate('e => e.outerHTML')
            self.anotar('A10', bloq and aviso == 1 and libre and color in svg, 'bloqueado antes; con las calcomanias avisa, se libera y Pip se lo pone', {'bloqueado_antes': bloq, 'aviso': aviso, 'libre': libre, 'vestido': color in svg})
            await ctx.close()

            # A13 musica al primer toque, tambien si es el boton
            ctx, pg = await self.pagina()
            await pg.locator('.al-hola__pip').click(force=True); await pg.wait_for_timeout(700); e1 = await pg.evaluate('GUIA._musica.estado()'); await ctx.close()
            ctx, pg = await self.pagina()
            await pg.locator('.g-btn-musica').click(); await pg.wait_for_timeout(500); e2 = await pg.evaluate('GUIA._musica.estado()'); await ctx.close()
            self.anotar('A13', e1['sonando'] and e2['sonando'], 'suena al primer toque, tambien si es el boton de musica', {'toque': e1['sonando'], 'boton': e2['sonando']})

            # A14 auditoria en 4 perfiles
            fallas = []
            vistas = [''] + [m['id'] + '-3' for m in ms] + [m0['id'] + '-1']
            if H.AUD_JS:
                for perfil in H.PERFILES:
                    for v in vistas:
                        ctx, pg = await self.pagina(v, perfil=perfil, estado=V); await pg.wait_for_timeout(1000)
                        r = await pg.evaluate(H.AUD_JS, H.PERFILES[perfil]['viewport']['width'])
                        toque = [x for x in r['toque'] if not (x['elemento'].startswith('A.') and x['alto'] >= 16)]
                        fallas += [(perfil, v or 'portada', 'contraste', x) for x in r['contraste']]
                        fallas += [(perfil, v or 'portada', 'toque', x) for x in toque]
                        if r['desborde'] > 0: fallas.append((perfil, v or 'portada', 'desborde', r['desborde']))
                        await ctx.close()
                self.anotar('A14', not fallas, 'sin desborde, contraste AA y toques de 44 px en 4 perfiles', {'vistas': len(vistas) * len(H.PERFILES), 'fallas': fallas[:6], 'total': len(fallas)})
            else:
                self.anotar('A14', False, 'auditoria disponible', 'NO MEDIDO')

            # A15 sin red ni puntajes; A16 todas las etapas; A11 dibujo en cada globo; A17 voz al llegar
            red, puntajes, fallidas, errores, sin_dibujo, sin_voz = [], [], [], [], [], []
            for r in todas:
                ctx, pg = await self.pagina(r, estado=V)
                vistos_g = set()
                for _ in range(60):
                    if await pg.locator('.al-fin').count(): break
                    a = await pg.evaluate("GUIA._aldea_etapa.activo()")
                    if a and a['p'] not in vistos_g:
                        vistos_g.add(a['p'])
                        await pg.wait_for_timeout(750)
                        vacio = await pg.evaluate("() => { const s = document.querySelector('.al-globo:not(.al-globo--demo) .al-carta__dibujo svg'); return !s || !s.children.length; }")
                        if vacio: sin_dibujo.append(r + ':' + a['p'])
                        dichos = [d['texto'] for d in await pg.evaluate('window.__dichos')]
                        if a['p'].replace('*', '') not in dichos: sin_voz.append(r + ':' + a['p'])
                    if a:
                        await pg.evaluate(AYUDA); await pg.evaluate(AYUDA); await pg.evaluate(AYUDA)
                    await pg.wait_for_timeout(450)
                if not await pg.locator('.al-fin').count(): fallidas.append(r)
                txt = await pg.locator('body').inner_text()
                if '%' in txt or 'score' in txt.lower(): puntajes.append(r)
                errores += pg.errores; red += pg.red
                await ctx.close()
            self.anotar('A15', not red and not puntajes, 'sin pedidos de red ni puntajes', {'red': red[:3], 'puntajes': puntajes})
            self.anotar('A16', not fallidas and not errores, 'las 18 etapas se terminan sin errores de JavaScript', {'fallidas': fallidas, 'errores': errores[:3]})
            self.anotar('A11', not sin_dibujo, 'cada globo trae su dibujo', {'sin_dibujo': sin_dibujo[:5]})
            self.anotar('A17', not sin_voz, 'la voz dice cada palabra al llegar el globo', {'sin_voz': sin_voz[:5]})

            # A18 temas libres
            ctx, pg = await self.pagina(estado=V)
            desh = await pg.locator('.al-mapa button:disabled').count()
            await pg.locator('.al-alto__mundo').last.click(); await pg.wait_for_selector('.al-globo')
            ultimo = await pg.locator('.al-escena').get_attribute('data-mundo') == ms[-1]['id']
            await pg.go_back(); await pg.wait_for_selector('.al-mapa')
            await pg.locator('.al-alto').nth(len(ms) // 2).locator('.al-parada').nth(2).click(force=True); await pg.wait_for_selector('.al-globo')
            e3 = await pg.locator('.al-pantalla .al-lugar').count() == min(4, len(ms[len(ms) // 2]['zonas']))
            self.anotar('A18', desh == 0 and ultimo and e3, 'sin progreso, cualquier mundo y etapa se abre desde el mapa', {'deshabilitados': desh, 'ultimo_mundo': ultimo, 'etapa3': e3})
            await ctx.close()

            # A19 jugar sin leer: en la etapa solo hay letreros y la palabra del globo; A20 dibujo de ejemplo en cada lugar
            extra, sin_ej = [], []
            for m in ms:
                ctx, pg = await self.pagina(m['id'] + '-3', estado=V); a = await self.activo(pg)
                lineas = [x.strip() for x in (await pg.locator('.al-pantalla').inner_text()).split('\n') if x.strip()]
                permitido = {z['letrero'] for z in m['zonas']} | {a['p'].replace('*', '')} | set(a['p'].replace('*', '').split())
                extra += [m['id'] + ': ' + x for x in lineas if x not in permitido and x != '?']
                vacios = await pg.evaluate("() => [...document.querySelectorAll('.al-pantalla .al-lugar')].filter(l => { const s = l.querySelector('svg.al-ico'); return !s || !s.children.length; }).map(l => l.dataset.lugar)")
                sin_ej += [m['id'] + ':' + v for v in vacios]
                await ctx.close()
            self.anotar('A19', not extra, 'la etapa se juega sin leer: solo letreros y la palabra del globo', {'texto_extra': extra[:6]})
            self.anotar('A20', not sin_ej, 'cada lugar muestra su letrero y un dibujo de ejemplo', {'sin_ejemplo': sin_ej})
            await self.b.close()


async def main(guia):
    print('HISTORIAS v3 · guia ' + guia)
    pr = PruebaAldea(guia)
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
