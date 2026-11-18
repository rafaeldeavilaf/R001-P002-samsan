#!/usr/bin/env python3
"""
HISTORIAS DE USUARIO DEL MODO JUEGO (v2) — una guia a la vez, en Chrome real.

    python3 tools/build.py
    python3 tools/historias_juegos.py y2-english-v2
    python3 tools/historias_juegos.py y6-english-v2

Las historias J01-J17 estan en docs/guias-historias.md (seccion v2). Reutiliza
la voz simulada, los perfiles y la auditoria de tools/historias_guias.py.
Informe en _local/historias-<guia>.json. Sale con codigo 1 si alguna falla.
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import historias_guias as H
from playwright.async_api import async_playwright

ROOT = H.ROOT
AYUDA = "document.querySelector('.g-ayuda-fila .g-btn') && document.querySelector('.g-ayuda-fila .g-btn').click()"


class PruebaJuego(H.Prueba):
    def __init__(self, guia):
        super().__init__(guia)
        self.clave = 'samsan:juego-' + self.cfg['id']
        self.ms = self.cfg['mundos']

    async def sin_consejo(self, pg):
        if await pg.locator('.g-consejo').count():
            await pg.locator('.g-consejo .g-btn').click(); await pg.wait_for_timeout(80)

    async def activa(self, pg):
        return (await pg.locator('.g-dock__activa .g-ficha--grande').inner_text()).strip()

    def zona_de(self, mundo, texto):
        return [p['zona'] for p in mundo['palabras'] if p['t'] == texto][0]

    async def terminar(self, pg, maximo=200):
        for _ in range(maximo):
            if await pg.locator('.g-capa').count() and not await pg.locator('.g-consejo').count():
                return True
            await self.sin_consejo(pg)
            await pg.evaluate(AYUDA); await pg.evaluate(AYUDA); await pg.evaluate(AYUDA)
            await pg.wait_for_timeout(300)
        return False

    async def con_estado(self, ctx, estado):
        await ctx.add_init_script("localStorage.setItem(%r, %r)" % (self.clave, json.dumps(estado)))

    async def correr(self):
        ms = self.ms
        m0 = ms[0]
        todos_vistos = {m['id']: 1 for m in ms}
        async with async_playwright() as p:
            self.b = await p.chromium.launch(executable_path=H.CHROME, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])

            # J01 Play lleva a la siguiente etapa sin terminar
            ctx, pg = await self.pagina()
            t1 = await pg.locator('#play').inner_text()
            await pg.evaluate("(e) => localStorage.setItem(%r, JSON.stringify(e))" % self.clave, {'etapas': {m0['id'] + '-1': 1}, 'vistos': todos_vistos})
            await pg.reload(); await pg.wait_for_selector('#play'); t2 = await pg.locator('#play').inner_text()
            self.anotar('J01', m0['titulo'] in t1 and 'Stage 1' in t1 and 'Stage 2' in t2, 'Play nombra la siguiente etapa sin terminar', [t1, t2])
            await ctx.close()

            # J02 consejo en la primera etapa de cada mundo, con ejemplo por zona, y no se repite
            ctx, pg = await self.pagina(m0['id'] + '-1')
            c1 = await pg.locator('.g-consejo').count(); zonas = await pg.locator('.g-consejo__zona').count()
            antes = await pg.evaluate('window.__dichos.length')
            await pg.locator('.g-consejo__zona').first.click(); await pg.wait_for_timeout(60)
            dijo = await pg.evaluate('window.__dichos.length') > antes
            await self.sin_consejo(pg)
            await pg.reload(); await pg.wait_for_selector('.g-barra'); await pg.wait_for_timeout(100)
            c2 = await pg.locator('.g-consejo').count()
            self.anotar('J02', c1 == 1 and zonas == len(m0['zonas']) and dijo and c2 == 0, 'consejo con un ejemplo por zona, se oye y no se repite', {'consejo': c1, 'zonas': zonas, 'se_oye': dijo, 'al_volver': c2})

            # J03 ubicar tocando la zona; J05 error
            texto = await self.activa(pg); zona = self.zona_de(m0, texto)
            await pg.locator('.g-zona-u[data-destino="%s"]' % zona).click(); await pg.wait_for_timeout(400)
            chips = await pg.locator('.g-zona-u[data-destino="%s"] .g-chip' % zona).count(); siguiente = await self.activa(pg)
            self.anotar('J03', chips == 1 and siguiente != texto, 'tocar la zona ubica la palabra y sale la siguiente', {'chips': chips, 'siguiente': siguiente})
            texto = await self.activa(pg); zona = self.zona_de(m0, texto)
            mala = pg.locator('.g-zona-u:not([data-destino="%s"])' % zona).first
            await mala.click(); p1 = await pg.locator('.g-pista').inner_text(); await mala.click(); await pg.wait_for_timeout(60)
            p2 = await pg.locator('.g-pista').inner_text(); sigue = await self.activa(pg)
            brilla = await pg.locator('.g-zona-u[data-destino="%s"]' % zona).evaluate("e => e.classList.contains('brilla')")
            self.anotar('J05', sigue == texto and 'again' in p1.lower() and p2 == m0['pista'] and brilla, 'zona equivocada: no entra, «Try again», luego pista y brillo', {'p1': p1, 'p2': p2[:40], 'brilla': brilla})
            await ctx.close()

            # J04 arrastre tactil
            ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false'); await self.con_estado(ctx, {'vistos': todos_vistos})
            ctx, pg = await self.pagina(m0['id'] + '-2', ctx=ctx)
            texto = await self.activa(pg); zona = self.zona_de(m0, texto)
            fb = await pg.locator('.g-ficha--grande').bounding_box(); zb = await pg.locator('.g-zona-u[data-destino="%s"]' % zona).bounding_box()
            await self.arrastre_tactil(pg, fb['x'] + fb['width'] / 2, fb['y'] + fb['height'] / 2, zb['x'] + zb['width'] / 2, zb['y'] + zb['height'] / 2)
            await pg.wait_for_timeout(350)
            chips = await pg.locator('.g-zona-u[data-destino="%s"] .g-chip' % zona).count()
            self.anotar('J04', chips == 1 and not pg.errores, 'arrastrar con el dedo a la zona la ubica', {'chips': chips, 'errores': pg.errores})

            # J06 ayuda en 3 peldaños
            texto = await self.activa(pg); zona = self.zona_de(m0, texto)
            b = pg.locator('.g-ayuda-fila .g-btn')
            await b.click(); p1 = await pg.locator('.g-pista').inner_text()
            await b.click(); br = await pg.locator('.g-zona-u[data-destino="%s"]' % zona).evaluate("e => e.classList.contains('brilla')")
            await b.click(); await pg.wait_for_timeout(400); nueva = await self.activa(pg)
            self.anotar('J06', p1 == m0['pista'] and br and nueva != texto, 'pista, brilla la zona, luego la ubica', {'pista': bool(p1), 'brilla': br})
            await ctx.close()

            # J07 las etapas crecen
            datos = []
            for e in (1, 2, 3):
                ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false'); await self.con_estado(ctx, {'vistos': todos_vistos})
                ctx, pg = await self.pagina(m0['id'] + '-%d' % e, ctx=ctx)
                datos.append((await pg.locator('.g-zona-u').count(), await pg.locator('.g-progreso span').count())); await ctx.close()
            nz = len(m0['zonas'])
            esperado = [(min(2, nz), 6), (min(3, nz), 8), (nz, 10)]
            self.anotar('J07', all(d[0] == x[0] and abs(d[1] - x[1]) <= 1 for d, x in zip(datos, esperado)), 'etapa 1: 2 zonas y 6 palabras; 2: 3 y 8; 3: todas y ~10', {'obtenido': datos, 'esperado': esperado})

            # J08 palabras distintas cada vez (firma: palabra activa + 2 proximas)
            firmas = []
            for _ in range(4):
                ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false'); await self.con_estado(ctx, {'vistos': todos_vistos})
                ctx, pg = await self.pagina(m0['id'] + '-3', ctx=ctx)
                firmas.append((await self.activa(pg),) + tuple(await pg.eval_on_selector_all('.g-prox', 'n => n.map(x => x.textContent)'))); await ctx.close()
            self.anotar('J08', len(set(firmas)) >= 3, 'al menos 3 tandas distintas en 4 entradas', {'distintas': len(set(firmas))})

            # J09 gema por etapa terminada, con errores incluidos; repetir no suma; se guarda; J12 Atras
            ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false')
            pg = await ctx.new_page(); pg.errores = []; pg.red = []
            await pg.goto(self.url); await pg.wait_for_selector('#play')
            await pg.evaluate("(e) => localStorage.setItem(%r, JSON.stringify(e))" % self.clave, {'vistos': todos_vistos})
            await pg.reload(); await pg.wait_for_selector('#play')
            await pg.locator('.g-etapa').first.click(); await pg.wait_for_selector('.g-ficha--grande')
            texto = await self.activa(pg); zona = self.zona_de(m0, texto)
            await pg.locator('.g-zona-u:not([data-destino="%s"])' % zona).first.click()   # error a proposito
            await self.terminar(pg)
            g1 = await pg.locator('.g-gana').inner_text()
            await pg.locator('.g-capa .g-btn').nth(1).click(); await pg.wait_for_timeout(200)   # otra ronda
            await self.terminar(pg)
            g2 = await pg.locator('.g-gana').inner_text()
            await pg.locator('.g-capa .g-btn').nth(2).click(); await pg.wait_for_selector('.g-portada')
            await pg.reload(); await pg.wait_for_selector('.g-contador-gemas')
            cont = await pg.locator('.g-contador-gemas').inner_text()
            self.anotar('J09', '+1' in g1 and '1 gem' in g1 and '✓' in g2 and cont.strip() == '1', 'una gema por etapa aunque haya errores; repetir no suma; se guarda', {'primera': g1, 'repetida': g2, 'contador': cont})
            await pg.locator('.g-etapa').nth(1).click(); await pg.wait_for_selector('.g-ficha--grande')
            await pg.go_back(); await pg.wait_for_timeout(200)
            self.anotar('J12', await pg.locator('.g-portada').count() == 1 and pg.url.startswith(self.url), 'Atras desde una etapa vuelve al mapa', {'mapa': await pg.locator('.g-portada').count()})
            await ctx.close()

            # J10 trajes: se desbloquean con gemas y se visten
            pieles = self.cfg['pieles']
            n = pieles[1]['gemas']
            etapas = {}
            for m in ms:
                for e in (1, 2, 3):
                    if len(etapas) < n - 1: etapas[m['id'] + '-%d' % e] = 1
            ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false')
            pg = await ctx.new_page(); await pg.goto(self.url); await pg.wait_for_selector('#play')
            await pg.evaluate("(e) => localStorage.setItem(%r, JSON.stringify(e))" % self.clave, {'etapas': etapas, 'vistos': todos_vistos})
            await pg.reload(); await pg.wait_for_selector('.g-traje')
            bloq = await pg.locator('.g-traje').nth(1).is_disabled()
            falta = [m['id'] + '-%d' % e for m in ms for e in (1, 2, 3) if m['id'] + '-%d' % e not in etapas][0]
            mundo, etapa = falta.rsplit('-', 1)
            await pg.goto(self.url + '#' + falta); await pg.reload(); await pg.wait_for_selector('.g-ficha--grande')
            await self.terminar(pg)
            aviso = await pg.locator('.g-capa .g-insignia').count()
            await pg.goto(self.url); await pg.reload(); await pg.wait_for_selector('.g-traje')
            libre = not await pg.locator('.g-traje').nth(1).is_disabled()
            await pg.locator('.g-traje').nth(1).click(); await pg.wait_for_timeout(150)
            puesta = await pg.locator('.g-traje').nth(1).get_attribute('aria-pressed')
            color = list(pieles[1]['colores'].values())[0]
            svg = await pg.locator('.g-hola .g-mascota').first.evaluate('e => e.outerHTML')
            await pg.reload(); await pg.wait_for_selector('.g-traje')
            sigue = await pg.locator('.g-traje').nth(1).get_attribute('aria-pressed')
            self.anotar('J10', bloq and aviso == 1 and libre and puesta == 'true' and color in svg and sigue == 'true',
                        'bloqueado antes; al llegar a las gemas avisa, se libera, se viste y se recuerda', {'bloqueado_antes': bloq, 'aviso': aviso, 'libre': libre, 'vestido': color in svg, 'recordado': sigue})
            await ctx.close()

            # J11 jefe por oleadas
            ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false')
            ctx, pg = await self.pagina('jefe', ctx=ctx)
            olas, zonas_ola = [], []
            for _ in range(60):
                if await pg.locator('.g-capa').count(): break
                sub = await pg.locator('.g-barra small').inner_text()
                if not olas or olas[-1] != sub:
                    olas.append(sub); zonas_ola.append(tuple(sorted(await pg.eval_on_selector_all('.g-zona-u', 'n => n.map(x => x.getAttribute("data-destino"))'))))
                await pg.evaluate(AYUDA); await pg.evaluate(AYUDA); await pg.evaluate(AYUDA); await pg.wait_for_timeout(300)
            fin = await pg.locator('.g-capa').inner_text() if await pg.locator('.g-capa').count() else ''
            mundos = {o.split('·')[-1].strip().lower() for o in olas}
            want = self.cfg['jefe'].get('oleadas', 3)
            self.anotar('J11', len(olas) == want and len(mundos) == want and len(set(zonas_ola)) >= 2 and '+3' in fin, 'oleadas de mundos distintos, cambian las zonas, +3 gemas', {'oleadas': olas, 'fin': fin[:60]})
            await ctx.close()

            # J13 musica: primer toque en pantalla y en el boton
            ctx, pg = await self.pagina()
            await pg.locator('.g-hola').click(); await pg.wait_for_timeout(700); e1 = await pg.evaluate('GUIA._musica.estado()')
            await ctx.close()
            ctx, pg = await self.pagina()
            await pg.locator('.g-btn-musica').click(); await pg.wait_for_timeout(500); e2 = await pg.evaluate('GUIA._musica.estado()')
            await ctx.close()
            self.anotar('J13', e1['sonando'] and e2['sonando'], 'suena al primer toque, tambien si es el boton de musica', {'toque': e1['sonando'], 'boton': e2['sonando']})

            # J14 auditoria en 4 perfiles
            fallas = []
            vistas = [''] + [m['id'] + '-3' for m in ms] + ['jefe']
            if H.AUD_JS:
                for perfil in H.PERFILES:
                    ctx = await self.b.new_context(**H.PERFILES[perfil]); await ctx.add_init_script(H.VOZ % 'false'); await self.con_estado(ctx, {'vistos': todos_vistos})
                    for v in vistas:
                        pg = await ctx.new_page(); await pg.goto(self.url + ('#' + v if v else '')); await pg.wait_for_selector('.g-barra'); await pg.wait_for_timeout(450)
                        r = await pg.evaluate(H.AUD_JS, H.PERFILES[perfil]['viewport']['width'])
                        toque = [x for x in r['toque'] if not (x['elemento'].startswith('A.') and x['alto'] >= 16)]
                        fallas += [(perfil, v or 'portada', 'contraste', x) for x in r['contraste']]
                        fallas += [(perfil, v or 'portada', 'toque', x) for x in toque]
                        if r['desborde'] > 0: fallas.append((perfil, v or 'portada', 'desborde', r['desborde']))
                        await pg.close()
                    await ctx.close()
                self.anotar('J14', not fallas, 'sin desborde, contraste AA y toques de 44 px en 4 perfiles', {'vistas': len(vistas) * len(H.PERFILES), 'fallas': fallas[:6], 'total': len(fallas)})
            else:
                self.anotar('J14', False, 'auditoria disponible', 'NO MEDIDO')

            # J15 sin red ni puntajes; J16 todas las etapas sin errores
            red, puntajes, fallidas, errores = [], [], [], []
            ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false'); await self.con_estado(ctx, {'vistos': todos_vistos})
            for r in [m['id'] + '-%d' % e for m in ms for e in (1, 2, 3)] + ['jefe']:
                pg = await ctx.new_page(); pg.errores = []
                pg.on('pageerror', lambda e, pg=pg: pg.errores.append(str(e)))
                pg.on('request', lambda q: red.append(q.url) if not q.url.startswith(('file:', 'data:', 'blob:')) else None)
                await pg.goto(self.url + '#' + r); await pg.wait_for_selector('.g-barra')
                if not await self.terminar(pg): fallidas.append(r)
                txt = await pg.locator('body').inner_text()
                if '%' in txt or 'score' in txt.lower(): puntajes.append(r)
                errores += pg.errores; await pg.close()
            await ctx.close()
            self.anotar('J15', not red and not puntajes, 'sin pedidos de red ni puntajes', {'red': red[:3], 'puntajes': puntajes})
            self.anotar('J16', not fallidas and not errores, 'todas las etapas y el jefe se terminan sin errores', {'fallidas': fallidas, 'errores': errores[:3]})

            # J17 voz segun la edad
            ctx = await self.b.new_context(**H.PERFILES['celular']); await ctx.add_init_script(H.VOZ % 'false'); await self.con_estado(ctx, {'vistos': todos_vistos})
            ctx, pg = await self.pagina(m0['id'] + '-2', ctx=ctx)
            await pg.wait_for_timeout(500)
            dichos = [d['texto'] for d in await pg.evaluate('window.__dichos')]
            act = await self.activa(pg)
            if self.cfg.get('leerFichas'):
                self.anotar('J17', act in dichos or any(d in [w['t'] for w in m0['palabras']] for d in dichos), 'Y2: la voz lee cada palabra al aparecer', {'dijo': dichos[:3]})
            else:
                self.anotar('J17', not dichos, 'Y6: la voz no lee sola', {'dijo': dichos[:3]})
            await ctx.close()
            await self.b.close()


async def main(guia):
    print('HISTORIAS v2 · guia ' + guia)
    pr = PruebaJuego(guia)
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
