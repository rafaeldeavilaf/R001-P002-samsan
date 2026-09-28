#!/usr/bin/env node
/* ============================================================
   VERIFICACION — capa del mundo (assets/mundo/) y bioma Caverna

   jsdom no dibuja en canvas, asi que aqui se prueba la LOGICA con un
   contexto 2D simulado: paletas, rampas de piel de los 12 tonos,
   intercambio de paleta, camara, movimiento reducido, gobernador de
   rendimiento, pool de particulas y que el bioma corra cientos de
   cuadros sin romperse. Lo visual (grises, contraste, tiempo por
   cuadro) lo prueba tools/arte/prueba_grises.py en un navegador real.

   Sale con codigo 0 si todo pasa, 1 si algo falla.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.dirname(__dirname);
let passed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; console.log('  ok   ' + name); }
  else { failures.push(name + (detail ? ' -> ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' -> ' + detail : '')); }
}
function section(t) { console.log('\n' + t); }
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

/* Contexto 2D simulado: cualquier metodo existe y no hace nada; los que
   devuelven objetos devuelven stubs utiles. Cuenta las llamadas. */
function ctxStub(canvas) {
  const calls = {};
  const grad = { addColorStop() {} };
  const target = {
    canvas, calls,
    createLinearGradient: () => grad, createRadialGradient: () => grad,
    measureText: t => ({ width: String(t).length * 6 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
  };
  return new Proxy(target, {
    get(t, k) {
      if (k in t) return t[k];
      return function () { calls[k] = (calls[k] || 0) + 1; };
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}

function mundo(opts) {
  opts = opts || {};
  const dom = new JSDOM('<!doctype html><body><canvas id="c" style="width:1280px;height:720px"></canvas></body>', {
    runScripts: 'outside-only', pretendToBeVisual: true,
    beforeParse(w) {
      w.matchMedia = q => ({ matches: !!opts.reducido && /reduce/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.HTMLCanvasElement.prototype.getContext = function () { return this.__ctx || (this.__ctx = ctxStub(this)); };
      if (!w.ImageData) w.ImageData = function (d, wd, h) { this.data = d; this.width = wd; this.height = h; };
    }
  });
  const w = dom.window;
  const pal = JSON.parse(read('assets', 'paletas.json'));
  w.SAMSAN_PALETAS = { contorno: pal.contorno, rampas: pal.rampas };
  ['base.js', 'lienzo.js', 'luz.js', 'particulas.js', 'capas.js', 'sprites.js'].forEach(f => w.eval(read('assets', 'mundo', f)));
  w.eval(read('temas', 'maths', 'bioma.js'));
  w.eval(read('assets', 'ui.js'));
  return { dom, w, M: w.SAMSAN_MUNDO, pal };
}

section('1. Paletas: una sola fuente');
const A = mundo();
const M = A.M;
check('las rampas del juego son las de assets/paletas.json',
  Object.keys(A.pal.rampas).every(k => JSON.stringify(M.PAL[k]) === JSON.stringify(A.pal.rampas[k])));
check('cada rampa va de oscuro a claro',
  Object.keys(A.pal.rampas).every(k => A.pal.rampas[k].every((c, i, r) => i === 0 || M.luminancia(c) > M.luminancia(r[i - 1]))),
  Object.keys(A.pal.rampas).filter(k => !A.pal.rampas[k].every((c, i, r) => i === 0 || M.luminancia(c) > M.luminancia(r[i - 1]))).join(','));
const dg = read('docs', 'direccion-grafica.md');
check('las rampas de docs/direccion-grafica.md §4 estan en paletas.json',
  ['roca', 'pizarra', 'oro', 'cian', 'magenta', 'pasto', 'madera', 'cuerda', 'llama', 'papel'].every(k =>
    A.pal.rampas[k].every(c => dg.indexOf('`' + c + '`') !== -1)));

section('2. Piel: 12 tonos por intercambio de paleta');
const tonos = A.w.GAME_UI.armoury.skins;
check('hay 12 tonos', tonos.length === 12, tonos.length);
const rampas = tonos.map(t => M.rampaPiel(t.value));
check('cada tono da una rampa de 4, de oscuro a claro',
  rampas.every(r => r.length === 4 && r.every((c, i) => i === 0 || M.luminancia(c) > M.luminancia(r[i - 1]))),
  tonos.filter((t, i) => !rampas[i].every((c, k) => k === 0 || M.luminancia(c) > M.luminancia(rampas[i][k - 1]))).map(t => t.name).join(','));
check('el tono base queda intacto en la rampa', rampas.every((r, i) => r[2] === tonos[i].value.toUpperCase()));
check('las sombras giran de tono (no solo oscurecen)',
  rampas.every(r => Math.abs(M.toHsl(r[1])[0] - M.toHsl(r[2])[0]) >= 4 || M.toHsl(r[2])[1] < 0.05));
check('los 12 tonos dan 12 rampas distintas', new Set(rampas.map(r => r.join())).size === 12);
const exp = M.sprites.explorador('A', false);
const ref = M.PAL.piel.map(c => c.toUpperCase());
function colores(buf) {
  const s = new Set();
  for (let i = 0; i < buf.d.length; i += 4) if (buf.d[i + 3]) s.add(M.hex(buf.d[i], buf.d[i + 1], buf.d[i + 2]));
  return s;
}
check('el explorador provisional usa la rampa de piel de referencia', ref.some(c => colores(exp).has(c)));
let intercambioOk = true;
tonos.forEach(t => {
  const b = M.sprites.explorador('A', false);
  const n = M.cambiarColores(b.d, M.mapaPiel(t.value));
  const cs = colores(b);
  if (n === 0 || ref.some(c => cs.has(c) && M.rampaPiel(t.value).indexOf(c) === -1) || !cs.has(t.value.toUpperCase())) intercambioOk = false;
});
check('con cada tono no queda ni un pixel de la piel de referencia', intercambioOk);
const antes = Array.from(exp.d).filter((v, i) => i % 4 === 3 && v).length;
M.cambiarColores(exp.d, M.mapaPiel(tonos[11].value));
check('el intercambio no cambia la silueta (mismos pixeles opacos)', Array.from(exp.d).filter((v, i) => i % 4 === 3 && v).length === antes);

section('3. Lienzo: camara, escala y movimiento reducido');
const cv = A.w.document.getElementById('c');
const L = M.crearLienzo(cv);
check('lienzo logico de 640 x 360', L.W === 640 && L.H === 360 && L.base.width === 640 && L.base.height === 362);
check('con movimiento normal hay particulas, parallax y camara suave', L.opts.particles && L.opts.depth && L.opts.smooth);
L.altoMundo = 640; L.seguir(500); L.cuadro(0.016);
check('la camara suave se acerca sin saltar', L.cam.y > 0 && L.cam.y < L.cam.objetivo, L.cam.y + ' -> ' + L.cam.objetivo);
check('la camara nunca sale del mundo', (L.seguir(10000), L.cam.objetivo === 640 - 360) && (L.seguir(-500), L.cam.objetivo === 0));
const R = mundo({ reducido: true });
const LR = R.M.crearLienzo(R.w.document.getElementById('c'));
check('con movimiento reducido: sin particulas, sin parallax, sin camara suave',
  !LR.opts.particles && !LR.opts.depth && !LR.opts.smooth && LR.opts.light);
LR.altoMundo = 640; LR.seguir(500); LR.cuadro(0.016);
check('con movimiento reducido la camara salta al objetivo', LR.cam.y === Math.round(LR.cam.objetivo));
const LQ = R.M.crearLienzo(R.w.document.getElementById('c'), { quietoSiReducido: true });
LQ.iniciar();
check('la portada con movimiento reducido pinta un cuadro y se queda quieta', LQ.corriendo === false);

section('4. Gobernador de rendimiento');
const G = M.crearLienzo(A.w.document.getElementById('c'));
let r1 = null;
for (let t = 0; t < 1.9; t += 0.025) r1 = G.medir(25) || r1;
check('menos de 2 s lento no apaga nada', r1 === null && G.opts.glow && G.opts.particles);
G.medir(16); for (let t = 0; t < 2.05; t += 0.025) r1 = G.medir(25) || r1;
check('2 s seguidos por encima de 20 ms apagan primero el resplandor', r1 === 'glow' && !G.opts.glow && G.opts.particles);
let r2 = null; for (let t = 0; t < 2.05; t += 0.025) r2 = G.medir(25) || r2;
check('si sigue lento, despues apaga las particulas', r2 === 'particles' && !G.opts.particles);
check('la luz no se apaga nunca por rendimiento', G.opts.light && G.degradado.join() === 'glow,particles');

section('5. Particulas: pool fijo');
const LP = M.crearLienzo(A.w.document.getElementById('c'));
const P = M.crearParticulas(LP, { max: 50 });
for (let i = 0; i < 400; i++) P.emitir({ x: 0, y: 0, max: 5 });
check('el pool nunca pasa de su maximo', P.vivas() === 50, P.vivas());
LP.opts.particles = false; LP.cuadro(0.016);
check('al apagar las particulas se retiran las ambientales', P.vivas() === 0, P.vivas());
check('con particulas apagadas no se emite polvo', P.emitir({ x: 0, y: 0 }) === false);
P.estallido(10, 10);
check('los destellos de acierto salen igual (confirman lo que paso)', P.vivas() > 0);

section('6. Bioma Caverna: cientos de cuadros sin romperse');
const LB = M.crearLienzo(A.w.document.getElementById('c'));
let err = null, cav = null;
try {
  cav = A.w.SAMSAN_BIOMAS.caverna.crear(LB, { pos: -15, piel: tonos[5].value });
  for (let i = 0; i < 300; i++) { if (i === 60) cav.explorador.pos = -3; if (i === 120) cav.explorador.celebrar(); LB.cuadro(1 / 60); }
} catch (e) { err = e; }
check('el bioma se crea y corre 300 cuadros', !err, err && err.stack.split('\n').slice(0, 2).join(' '));
check('el explorador llega a su nueva profundidad', cav && Math.abs(cav.explorador.posAnim + 3) < 0.05, cav && cav.explorador.posAnim);
check('la camara sigue al explorador', cav && Math.abs(LB.cam.y - LB.cam.objetivo) < 2 && LB.cam.objetivo === LB.limiteCam(cav.yOf(-3) - 30 - 360 * 0.52));
/* Decision del 27 sep: nadie cuelga de una cuerda. El explorador esta de pie
   en el piso de la plataforma y la posicion en metros es ese piso. */
check('el explorador esta de pie en la plataforma (pies sobre el piso)',
  cav && cav.explorador.rect && Math.abs(cav.explorador.rect.y + cav.explorador.rect.h - cav.yOf(-3)) <= 1,
  cav && cav.explorador.rect && (cav.explorador.rect.y + cav.explorador.rect.h) + ' vs ' + cav.yOf(-3));
check('la posicion en metros es el piso de la plataforma', cav && cav.explorador.piso() === cav.yOf(cav.explorador.posAnim));
const biomaSrc = read('temas', 'maths', 'bioma.js').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
check('el bioma no tiene cuerda al cuerpo, arnes ni mosqueton', !/MOSQUETON|HEBILLA|cinturon\(\)|arnes/i.test(biomaSrc));
check('hay fuentes de luz del escenario y dinamicas (casco y topo)', cav && cav.luz.fuentes.length >= 10 && cav.luz.dinamicas().length === 2);
check('el mundo dibuja todas sus capas en orden', LB.bx.calls && LB.bx.calls.drawImage > 0 && LB.ctx.calls.drawImage > 0);
check('el topo (compañero de la Caverna) esta en su hueco, con la luz de su lampara', cav && cav.topo && cav.topo.pies === 384 && cav.topo.lampara && cav.luz.dinamicas()[1].y < 384);
const motor = read('assets', 'mundo', 'base.js') + read('assets', 'mundo', 'lienzo.js') + read('assets', 'mundo', 'capas.js') + read('assets', 'mundo', 'luz.js');
check('el motor del mundo no conoce el bioma (sin cuerda, topo ni caverna)', !/\b(cuerda|topo|caverna|mina)\b/i.test(motor.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')));

section('RESULTADO');
console.log('\n' + passed + ' comprobaciones pasadas, ' + failures.length + ' fallidas.');
if (failures.length) { console.log('\nFallos:\n  - ' + failures.join('\n  - ')); process.exit(1); }
process.exit(0);
