# GDD — Cheto Blaster

**Título provisional:** Cheto Blaster
**Género:** Shoot 'em up de arena (top-down)
**Plataforma:** Web (PC)
**Stack técnico:** Node.js + Vite + Phaser 3 + JavaScript (ESModules)

---

## 1. Concepto

El jugador controla una nave en un pequeño escenario cerrado. Deben eliminar
enemigos disparando para sumar puntos. Al alcanzar cierta cantidad de puntos aparece
un jefe final; eliminarlo gana la partida. El jugador tiene 3 vidas; si las pierde,
pierde la partida. En ambos casos se puede reiniciar en cualquier momento.

El arte es 100% procedural: todas las texturas se generan en tiempo de ejecución,
sin archivos de imagen externos.

---

## 2. Mecánica principal

**Eliminar enemigos disparando.**

- El jugador dispara con el botón del mouse (clic) hacia donde apunta el cursor.
- Cada bala es un proyectil de un solo disparo que se destruye al salir del escenario.
- Al hacer blanco, el enemigo pierde vida según el daño de la bala.
- Eliminar enemigos otorga puntos.

### Controles

| Acción      | Tecla / Input              |
|-------------|----------------------------|
| Moverse     | WASD o flechas del teclado |
| Apuntar     | Mouse (cursor)             |
| Disparar    | Clic izquierdo (mantener dispara en ráfaga) |
| Reiniciar   | Tecla `R`                  |

---

## 3. Jugador

- **Vida:** 3 vidas. Perder una vida al tocar a cualquier enemigo o al recibir una
  bala enemiga.
- **Inmunidad:** 1 segundo de invulnerabilidad después de recibir daño (parpadea).
- **Velocidad:** movimiento fluido en 8 direcciones con velocidad normalizada.
- **Cadencia:** recarga de disparo de ~0,18 s.

---

## 4. Enemigos

| Enemigo | Velocidad | Vida | Puntos | Comportamiento                          |
|---------|-----------|------|--------|-----------------------------------------|
| Grunt   | Media     | 1    | 100    | Persigue al jugador lentamente.         |
| Chaser  | Alta      | 1    | 150    | Persigue más rápido por trayectoria curva. |

- Se generan periódicamente desde los bordes del escenario.
- Se preocupan por ir hacia la posición del jugador.
- Tocar al jugador hace daño y el enemigo se destruye en el impacto.

---

## 5. Jefe final

- **Aparece** al llegar a **2000 puntos** (los enemigos normales dejan de salir).
- **Vida:** 20 HP con barra visible en la parte superior.
- **Movimiento:** patrulla de lado a lado de la pantalla.
- **Ataques:** dispara ráfagas de proyectiles apuntando al jugador.
- **Al ser derrotado:** el jugador **gana la partida**.

---

## 6. Puntuación

- Grunt: **100 puntos**
- Chaser: **150 puntos**
- El puntaje actual siempre se muestra en pantalla (arriba a la izquierda).
- No hay puntaje máximo: se acumula desde 0.

---

## 7. Condiciones de partida

- **Victoria:** eliminar al jefe final.
- **Derrota:** quedarse sin vidas.
- Ambas pantallas muestran el resultado y el puntaje final, y ofrecen:
  - Tecla `R` para **reiniciar la partida** de inmediato.

---

## 8. Estados del juego

1. **Jugando:** se mueve, dispara, aparecen enemigos y se acumula puntaje.
2. **Jefe:** al superar 2000 pts aparece el jefe; es la fase final.
3. **Victoria / Derrota:** pausa el juego, muestra texto y cordial `R` para reiniciar.
4. **Reinicio:** tecla `R` resetea todo (puntaje, vidas, enemigos, jefe).

---

## 9. Interfaz (HUD)

- Puntaje (arriba a la izquierda).
- Vidas restantes (arriba a la derecha).
- Barra de vida del jefe (arriba al centro, solo durante la fase jefe).
- Mensajes de fase: "¡APARECE EL JEFE!" y resultados de victoria/derrota.

---

## 10. Alcance técnico

- Escena `BootScene`: genera todas las texturas con `CanvasTexture`/`Graphics`.
- Escena `GameScene`: gameplay, spawns, colisiones, HUD, jefe, estados finales.
- Sin assets externos, sin servidor de assets: `vite` sirve solo el bundle.
- Proyectiles, pool de enemigos y límites del escenario manejados en código.