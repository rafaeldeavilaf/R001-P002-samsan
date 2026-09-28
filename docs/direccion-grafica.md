---
estado: vigente
actualizado: 2026-09-27
descripcion: Dirección gráfica de SAMSAN (pixel art moderno). Capas de render, luz, movimiento, paletas, pipeline, reglas de legibilidad y lista de generaciones de PixelLab con sus prompts.
---

# Dirección gráfica — SAMSAN

## 1. La idea

Pixel art moderno, no retro. Un explorador pequeño y cabezón recorre un mundo de biomas conectados, uno por materia. Cada tema del colegio es una zona nueva dentro de su bioma. Lo moderno no sale de quitar los pixeles sino de seis cosas: más resolución, color con cambio de tono, luz dinámica, movimiento fluido, partículas y profundidad. No se copia ningún personaje, tile ni pantalla de ningún juego existente, y el nombre de ningún juego aparece en los prompts de generación.

**Referencia aprobada.** `docs/referencia/muestra-estilo.html`, aprobada por Rafael el 27 de septiembre de 2026. Es el piso de calidad: la versión con arte definitivo debe igualarla o superarla. Su código de luz, partículas, parallax, cámara y regla de profundidad es el punto de partida de la etapa 1.

## 2. Tres reglas que ganan sobre la estética

1. **Legibilidad primero.** Todo panel con texto, pregunta o respuesta tiene fondo claro y texto oscuro con contraste AA o mejor, en todos los biomas. La oscuridad y la luz de antorcha son del paisaje, nunca del panel.
2. **Los instrumentos pedagógicos se dibujan con código.** Termómetro, cuerda con profundidades, recta numérica, balanza, cajón de diez, taller de ecuaciones. Deben ser exactos al píxel y cambiar con los datos; un generador de imágenes no garantiza que la marca del −7 esté donde va.
3. **Ningún significado depende solo del color.** Acierto y error se distinguen también por forma, ícono y movimiento.

## 3. Especificación técnica

| Elemento | Valor |
|---|---|
| Lienzo lógico | 640 × 360 px, escalado con vecino más cercano (`image-rendering: pixelated`). ×2 es 1280 × 720 y ×3 es 1920 × 1080 |
| Tile | 32 × 32 px |
| Mascota | unos 44 a 48 px de alto en el mundo, cabeza grande; retrato de 64 px para la interfaz |
| Contorno | 1 px `#1E1426` alrededor de personajes y props; en el terreno, borde superior claro y bordes laterales e inferior oscuros, aplicados por código |
| Luz | por código, nunca pedida al generador (ver sección 6) |
| Tipografía | Nunito en alta resolución para todo texto, local, licencia OFL. Sin fuentes pixeladas en textos que el niño debe leer |
| Cuadros por segundo | 60, con cámara en subpíxel |
| Tamaño mínimo tocable | 64 × 64 px en pantalla |
| Movimiento reducido | con `prefers-reduced-motion`, sin parallax, sin rebotes ni cámara suave; partículas apagadas |

## 4. Paletas

Rampas con cambio de tono: las sombras tiran a morado o azul y las luces a amarillo, en vez de solo oscurecer. Nada de negro puro. Estas son las de la muestra aprobada; cada bioma nuevo agrega las suyas aquí.

| Rampa | Tonos, de oscuro a claro |
|---|---|
| Roca de Caverna (primer plano) | `#2A1024` `#5B1F2A` `#9A3B2C` `#D0652F` `#F0A04B` `#FFD27A` |
| Pared de fondo, pizarra | `#0E0F20` `#1A1C36` `#262B4C` `#34406A` `#4E5F92` |
| Oro | `#7A4A10` `#C98A1C` `#FFD34D` `#FFF3B0` |
| Cristal cian | `#1D4E6B` `#2F9BB8` `#7FE3F0` `#E8FEFF` |
| Cristal magenta | `#4A1B52` `#9C3FA8` `#F08BEA` `#FFE3FB` |
| Pasto | `#1F3D2A` `#2F6B3A` `#58A64A` `#A6E06A` |
| Madera | `#3B2215` `#6B3D22` `#A0643A` `#D19A5E` |
| Cuerda | `#5A3E24` `#A8814F` `#D8B680` |
| Llama | `#C2410C` `#F59E0B` `#FCD34D` `#FFF7D6` |
| Interfaz, papel | `#2A211A` `#5C4A3B` `#B9A58A` `#EADCC0` `#F7EFDD` |
| Contorno | `#1E1426` |

Tonos de piel del avatar, por intercambio de paleta en código: cuatro rampas elegibles en el selector de perfil.

**Regla de dos planos.** El terreno que se pisa es cálido y saturado; la pared del fondo es el mismo tipo de patrón, oscuro y frío. El niño siempre distingue dónde se puede estar.

**Prueba de grises.** En cada bioma, una captura en escala de grises debe distinguir fondo, suelo, objetos interactivos y panel. Si dos capas se confunden, se ajusta la luminancia de la rampa, no el color.

## 5. Qué hace el código y qué hace PixelLab

| Pieza | Quién la hace | Por qué |
|---|---|---|
| Instrumentos pedagógicos | Código, en alta resolución sobre la escena | Exactitud y datos variables |
| Tiles de suelo, pared y bordes redondeados | Código a partir de una textura gris de 64 × 64 | Un generador no hace coincidir bordes al píxel |
| Contorno, borde de luz y cuantización a la paleta | Código, sobre todo lo generado | Unidad de estilo entre generaciones distintas |
| Luz, resplandor, tono de color, viñeta | Código | Es lo que más moderniza y no gasta generaciones |
| Partículas, cámara, parallax, estirar y aplastar, parpadeo, rebote | Código | Movimiento fluido sin cuadros de animación |
| Kit de interfaz (paneles, botones, sello, contador de gemas, perfiles) | Código (CSS y SVG) | Debe escalar y ser accesible |
| Mascota, sombreros, props decorativos, texturas base | PixelLab, siempre en poses quietas | Es lo que el código no dibuja bien. Las herramientas de animación de PixelLab exigen plan pago; el movimiento se hace por código |

## 6. Capas de render

El mundo se dibuja en Canvas; los paneles, textos y botones siguen en HTML encima. Sin librerías externas.

1. **Escena en resolución de pixel** (640 × 362, cámara entera): caverna lejana (parallax 0,45 y 0,7, con brillos), cielo con nubes (0,15), montañas (0,35) y colinas (0,62), pared del fondo con huecos, cuerda y props, terreno, llamas y faroles animados, mascota, primer plano oscuro en los bordes (1,25).
2. **Escalado** a la pantalla con vecino más cercano y desplazamiento de la fracción de cámara, para que el movimiento sea suave.
3. **Mapa de luz** a media resolución, suavizado: luz ambiente oscura en la caverna, luz de día en la superficie y en la boca del pozo, fuentes radiales (antorchas con titileo, cristales que laten, faroles, lámpara del casco, brillos del oro). Se multiplica sobre la escena.
4. **Resplandor** aditivo en cada fuente, rayos de luz desde la boca del pozo y halo del sol.
5. **Partículas** en subpíxel: polvo en la luz, chispas de antorchas, esporas en la caverna profunda, destellos al acertar, polvo al frenar.
6. **Tono de color** (luz suave: cálido arriba, frío abajo) y viñeta.
7. **Instrumentos y guías** nítidos encima de todo: regla de profundidad, bandera de inicio, fantasma y flecha del error, gema que vuela al contador.

**Rendimiento.** Objetivo de 60 cuadros por segundo con resolución de pantalla limitada a ×2. Si durante dos segundos un cuadro tarda más de 20 ms, el juego apaga primero el resplandor y después las partículas, sin avisar al niño.

## 7. Pipeline de arte

Todo PNG generado pasa por `tools/arte/` antes de entrar al juego. Nadie mete un PNG crudo.

1. `procesar.py` — quita fondo, recorta, cuantiza a la paleta del bioma, aplica contorno y bisel, y guarda en `assets/img/` (compartido) o `temas/<materia>/img/` (del bioma).
2. `tiles.py` — convierte una textura gris de 64 × 64 en tiles de 32 × 32 con variantes, les aplica la rampa del bioma, redondea las esquinas expuestas y agrega el borde de luz arriba y el oscuro en los otros lados.
3. `prueba_grises.py` — toma capturas de cada bioma con Playwright, las pasa a grises y comprueba contraste AA de los paneles. Actions lo corre.
4. `build.py` inlina las imágenes como data URI. Presupuesto: cada `.html` bajo 1,5 MB.

`docs/licencias.md` registra cada fuente, generación y dependencia con su licencia y su obligación (RC-09).

## 8. Generaciones de PixelLab

Plan de prueba, 40 generaciones. Se planean 24 y quedan 16 de reserva para reintentos. El costo en generaciones cambia según el tamaño: después de la primera (la mascota), revisar cuánto bajó el contador y ajustar esta lista antes de seguir. Se generan a mano en la web de PixelLab, nunca por API, y nunca se sube una foto de una persona. Cada PNG se descarga apenas sale, con el nombre de la tabla.

**Prompt base**, se agrega a todos: `modern hi-bit pixel art, side view, clean readable silhouette, 1px dark outline, hue-shifted palette with purple shadows and warm highlights, flat even lighting, transparent background, no text`.

La primera generación (la mascota base) es la referencia de estilo; en las demás se usa como imagen de referencia si la herramienta lo permite.

| # | Etapa | Herramienta | Archivo | Prompt específico |
|---|---|---|---|---|
| 1 | 1 | Character Creator, 64 × 64 | `mascota-base.png` | small cheerful cave explorer kid, big round head, teal vest over cream shirt, backpack, boots, no hat, standing idle, gender neutral |
| 2 | 1 | Character Creator | `mascota-feliz.png` | same explorer jumping with arms up, happy |
| 3 | 1 | Character Creator | `mascota-piensa.png` | same explorer, hand on chin, thinking |
| 4 | 1 | Object Creator | `sombrero-minero.png` | miner helmet with small head lamp, fits a small round head |
| 5 | 1 | Object Creator | `textura-roca.png` | seamless cave rock texture of rounded stone chunks with cracks, grayscale, 64x64 |
| 6 | 1 | Object Creator | `antorcha.png` | wall torch with wooden handle, flame |
| 7 | 1 | Object Creator | `cofre.png` | small wooden treasure chest, closed |
| 8 | 1 | Object Creator | `gema.png` | faceted gem, single object |
| 9 | 1 | Object Creator | `carretilla.png` | small mine cart on rails |
| 10 | 1 | Object Creator | `farol.png` | hanging oil lantern |
| 11 | 3 | Object Creator | `textura-jungla.png` | seamless jungle soil and moss texture, grayscale, 64x64 |
| 12 | 3 | Object Creator | `sombrero-constructor.png` | builder hard hat, fits a small round head |
| 13 | 3 | Object Creator | `casa-arbol.png` | small wooden treehouse with ladder, daytime |
| 14 | 3 | Object Creator | `ladrillo.png` | single clay brick, front view |
| 15 | 3 | Object Creator | `textura-biblioteca.png` | seamless old stone library wall texture, grayscale, 64x64 |
| 16 | 3 | Object Creator | `sombrero-archivista.png` | hooded cloak hood, fits a small round head |
| 17 | 3 | Object Creator | `estante.png` | tall bookshelf with old books |
| 18 | 3 | Object Creator | `vela.png` | candle on brass holder |
| 19 | Inglés | Object Creator | `textura-escenario.png` | seamless wooden stage floor texture, grayscale, 64x64 |
| 20 | Inglés | Object Creator | `sombrero-teatro.png` | feathered theatre hat, fits a small round head |
| 21 | 4 | Object Creator | `sombrero-premio-1.png` | explorer wide brim hat |
| 22 | 4 | Object Creator | `sombrero-premio-2.png` | crown made of crystals |
| 23 | 4 | Object Creator | `sombrero-premio-3.png` | pirate tricorn hat |
| 24 | 4 | Object Creator | `portal-bioma.png` | stone archway portal with glowing runes |

Las filas marcadas "Inglés" se generan cuando el colegio ponga el primer tema de Inglés. Science recibe su textura, sombrero (gafas de laboratorio) y props cuando llegue su primer tema, con la reserva.

## 9. Entregables gráficos por etapa

| Etapa | Qué queda hecho |
|---|---|
| 1 | Capa de render en Canvas con cámara, luz, resplandor, partículas, parallax y tono de color; pipeline de arte a 32 px; kit de interfaz; mascota con poses y tonos de piel; bioma Caverna completo. Iguala o supera `docs/referencia/muestra-estilo.html` |
| 2 | Arte de los instrumentos de La Mina: termómetro, cuerda con profundidades, balanza, taller de ecuaciones, cajas del sello |
| 3 | Biomas Jungla de día (Year 2) y Biblioteca (Español); instrumentos de Colocar |
| 4 | Mapa del mundo con biomas, portales, piezas instaladas, sombreros de premio |
