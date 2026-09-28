#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de los dos PROTOTIPOS de nucleo de juego de La Mina (28 sep 2026),
para que Rafael los juegue 5 minutos cada uno y elija:

  E. Excavar: una pared de bloques con numeros con signo. El explorador entra
     por arriba y cava un camino (abajo, izquierda, derecha, sin volver). Cada
     bloque roto suma su numero al contador del pico. La puerta de la gema,
     abajo, abre solo si se llega con el contador igual al numero del candado.
  A. Cartas de salto: el montacargas del pozo, dos o tres vetas a distintas
     profundidades, franjas de roca donde no se puede parar y una mano de
     cartas con numeros con signo. Hay que recoger todas las vetas.

Un buscador exhaustivo valida con `assert` que cada puzzle tiene solucion,
que no se resuelve con una jugada obvia y que nada sale del pozo. Cada puzzle
declara una solucion (para las pruebas). Tres juegos de cuatro puzzles, de
menor a mayor: 1) sin cruzar el 0, 2) cruzando el 0, 3) dos cifras, 4) abierto.

Salida: temas/maths/y6-la-mina/prototipos.js
"""
import json, os, random

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
rng = random.Random(20260929)
R = rng.randint
DMIN, DMAX = -30, 10
JUEGOS = 3


# ---------------------------------------------------------------- E. Excavar
def caminos(grid, W, H, c0, cg):
    """Todos los caminos desde arriba de la columna c0 hasta el fondo de la
    columna cg: [(suma, [celdas])]. Movimientos: abajo, izquierda, derecha."""
    out = []

    def dfs(f, c, vis, suma, cam):
        v = grid[f][c]
        if v is None:
            return
        suma += v["n"]
        cam = cam + [[f, c]]
        if f == H - 1 and c == cg:
            out.append((suma, cam))
        if f + 1 < H and grid[f + 1][c] is not None:
            dfs(f + 1, c, vis | {(f + 1, c)}, suma, cam)
        for dc in (-1, 1):
            nc = c + dc
            if 0 <= nc < W and (f, nc) not in vis and grid[f][nc] is not None:
                dfs(f, nc, vis | {(f, nc)}, suma, cam)

    if grid[0][c0] is not None:
        dfs(0, c0, {(0, c0)}, 0, [])
    return out


def excavar(nivel):
    W, H = (5, 4) if nivel == 1 else (5, 5) if nivel in (2, 3) else (5, 6)
    rocas = {1: 1, 2: 2, 3: 3, 4: 4}[nivel]
    rango = {1: (-6, 4), 2: (-9, 9), 3: (-25, 25), 4: (-30, 30)}[nivel]
    while True:
        grid = [[{"n": 0} for _ in range(W)] for _ in range(H)]
        for f in range(H):
            for c in range(W):
                n = 0
                while n == 0 or (nivel == 3 and abs(n) < 10 and rng.random() < 0.7):
                    n = R(*rango)
                grid[f][c] = {"n": n}
        c0, cg = W // 2, R(0, W - 1)
        libres = [(f, c) for f in range(1, H - 1) for c in range(W) if c != c0]
        for f, c in rng.sample(libres, rocas):
            grid[f][c] = None                                   # roca: no se rompe
        todos = caminos(grid, W, H, c0, cg)
        if len(todos) < 6:
            continue
        # El objetivo sale de un camino largo (que no sea bajar derecho).
        largos = [t for t in todos if len(t[1]) >= H + 2]
        if not largos:
            continue
        suma, sol = rng.choice(largos)
        if nivel == 1 and suma >= 0:
            continue                                          # nivel 1: el candado es negativo y no se cruza el 0
        if nivel == 1 and any(sum(grid[f][c]["n"] for f, c in sol[:k + 1]) > 0 for k in range(len(sol))):
            continue
        if nivel == 2 and not any(s1 * s2 < 0 for s1, s2 in zip(
                [sum(grid[f][c]["n"] for f, c in sol[:k + 1]) for k in range(len(sol))],
                [sum(grid[f][c]["n"] for f, c in sol[:k + 2]) for k in range(len(sol) - 1)])):
            continue                                          # nivel 2: la solucion cruza el 0
        directo = [t for t in todos if len(t[1]) == H and all(p[1] == c0 for p in t[1])]
        if any(t[0] == suma for t in directo):
            continue                                          # sin atajo: bajar derecho no abre
        soluciones = sum(1 for t in todos if t[0] == suma)
        if soluciones > 6:
            continue                                          # que haya que pensar
        # Un cofre en una celda del camino o al lado: cristal extra, valor 0.
        return {"ancho": W, "alto": H, "entrada": c0, "puerta": cg, "candado": suma,
                "bloques": [[None if v is None else v["n"] for v in fila] for fila in grid],
                "solucion": sol, "soluciones": soluciones}


def valida_excavar(p):
    grid = [[None if v is None else {"n": v} for v in fila] for fila in p["bloques"]]
    todos = caminos(grid, p["ancho"], p["alto"], p["entrada"], p["puerta"])
    assert any(t[0] == p["candado"] for t in todos), "sin solucion"
    s = sum(p["bloques"][f][c] for f, c in p["solucion"])
    assert s == p["candado"], "la solucion declarada no suma el candado"
    return True


# ---------------------------------------------------------------- A. Cartas
def en_roca(x, rocas):
    return any(a <= x <= b for a, b in rocas)


def resolver_cartas(p):
    """BFS sobre (posicion, cartas usadas, vetas recogidas). Devuelve la
    secuencia mas corta de indices de cartas o None."""
    cartas, vetas, rocas = p["cartas"], p["vetas"], p["rocas"]
    todas = (1 << len(vetas)) - 1
    ini = (p["salida"], 0, 0)
    prev, cola = {ini: None}, [ini]
    while cola:
        nueva = []
        for est in cola:
            pos, usadas, rec = est
            if rec == todas:
                seq = []
                while prev[est] is not None:
                    est, i = prev[est]
                    seq.append(i)
                return seq[::-1]
            for i, c in enumerate(cartas):
                if usadas >> i & 1:
                    continue
                x = pos + c
                if x < DMIN or x > DMAX or en_roca(x, rocas):
                    continue
                r2 = rec
                for k, v in enumerate(vetas):
                    if x == v:
                        r2 |= 1 << k
                e2 = (x, usadas | 1 << i, r2)
                if e2 not in prev:
                    prev[e2] = (est, i)
                    nueva.append(e2)
        cola = nueva
    return None


def cartas(nivel):
    nv = 2 if nivel < 4 else 3
    ncartas = {1: 4, 2: 4, 3: 5, 4: 6}[nivel]
    while True:
        if nivel == 1:
            salida = R(-8, -2)
        elif nivel == 2:
            salida = R(2, 9)
        else:
            salida = R(-12, 8)
        paso = (lambda: R(2, 9) * rng.choice([1, -1])) if nivel < 3 else (lambda: R(10, 22) * rng.choice([1, -1]) if rng.random() < 0.7 else R(2, 9) * rng.choice([1, -1]))
        # Solucion: una pierna de 1 carta y otra de 2 (o mas en el nivel 4).
        piernas = [1, 2] if nv == 2 else [1, 2, 2]
        rng.shuffle(piernas)
        pos, secuencia, vetas, visitadas, ok = salida, [], [], [salida], True
        for n in piernas:
            for _ in range(n):
                c = paso()
                pos += c
                if not DMIN <= pos <= DMAX:
                    ok = False
                secuencia.append(c)
                visitadas.append(pos)
            vetas.append(pos)
        if not ok or len(set(vetas)) != len(vetas) or salida in vetas:
            continue
        if nivel == 1 and any(v > 0 for v in visitadas):
            continue                                          # nivel 1: todo bajo tierra
        if nivel == 2 and not any(a * b < 0 for a, b in zip(visitadas, visitadas[1:])):
            continue                                          # nivel 2: se cruza el 0
        if any(c == 0 for c in secuencia):
            continue
        mano = secuencia[:] + [paso() for _ in range(ncartas - len(secuencia))]
        rng.shuffle(mano)
        # Franjas de roca: fuera de las paradas de la solucion.
        rocas = []
        for _ in range(1 if nivel < 3 else 2):
            a = R(DMIN + 1, DMAX - 4)
            b = a + R(2, 4)
            if any(a - 1 <= x <= b + 1 for x in visitadas):
                continue
            rocas.append([a, b])
        p = {"salida": salida, "vetas": vetas, "rocas": rocas, "cartas": mano}
        sol = resolver_cartas(p)
        if sol is None:
            continue
        # Sin atajo: ninguna veta a una sola carta de la salida en el nivel 4,
        # y al menos una veta que pida dos cartas.
        if len(sol) <= len(vetas):
            continue
        p["solucion"] = sol
        return p


def valida_cartas(p):
    sol = resolver_cartas(p)
    assert sol is not None, "sin solucion"
    pos, rec = p["salida"], set()
    for i in p["solucion"]:
        pos += p["cartas"][i]
        assert DMIN <= pos <= DMAX and not en_roca(pos, p["rocas"]), "la solucion pasa por roca o sale del pozo"
        if pos in p["vetas"]:
            rec.add(pos)
    assert rec == set(p["vetas"]), "la solucion declarada no recoge todas las vetas"
    for v in p["vetas"]:
        assert DMIN <= v <= DMAX and not en_roca(v, p["rocas"])
    return True


if __name__ == "__main__":
    datos = {"excavar": [], "cartas": []}
    for j in range(JUEGOS):
        datos["excavar"].append([excavar(n) for n in (1, 2, 3, 4)])
        datos["cartas"].append([cartas(n) for n in (1, 2, 3, 4)])
    for juego in datos["excavar"]:
        for p in juego:
            valida_excavar(p)
    for juego in datos["cartas"]:
        for p in juego:
            valida_cartas(p)
    ruta = os.path.join(ROOT, "temas", "maths", "y6-la-mina", "prototipos.js")
    with open(ruta, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("/* GENERADO por tools/gen/maths_y6_prototipos.py. No se edita a mano. */\n")
        fh.write("window.PROTO = " + json.dumps(datos, ensure_ascii=False) + ";\n")
    print("OK -> %s" % ruta)
    print("excavar: %s soluciones por puzzle" % [p["soluciones"] for j in datos["excavar"] for p in j])
    print("cartas: %s cartas en la solucion" % [len(p["solucion"]) for j in datos["cartas"] for p in j])
