===============================================
  CHETO BLASTER - README / GUIA PARA JUGAR
===============================================

Juego simple tipo "top-down shooter" hecho con
Node.js + Vite + Phaser 3 + JavaScript.
Todos los gráficos se generan en código (sin imagenes).

-----------------------------------------------
1) REQUISITOS
-----------------------------------------------
- Node.js (version 18 o superior)
- npm (viene incluido con Node)

-----------------------------------------------
2) COMO LEVANTAR EL JUEGO
-----------------------------------------------
1. Abrir una terminal en esta carpeta.
2. Ejecutar:       npm install
3. Ejecutar:       npm run dev
4. Entrar al juego desde el navegador en:
   http://localhost:5173

Otros comandos utiles:
- npm run build    => genera la version de produccion en /dist
- npm run preview  => sirve la version compilada de /dist

-----------------------------------------------
3) CONTROLES
-----------------------------------------------
- Moverse:            WASD o flechas del teclado
- Apuntar:            mover el mouse
- Disparar:           clic izquierdo (mantenerlo presionado
                      dispara en rafaga)
- Reiniciar partida:  tecla R (en pantalla de victoria o derrota)

-----------------------------------------------
4) OBJETIVO
-----------------------------------------------
Eliminar enemigos disparandoles para sumar puntos y
llegar al JEFE FINAL. Al alcanzar 2000 puntos aparece
el jefe; eliminarlo para GANAR la partida.

El jugador tiene 3 VIDAS. Si un enemigo o una bala
enemiga te toca, perdes una vida. A 0 vidas se pierde
la partida (GAME OVER).

-----------------------------------------------
5) ENEMIGOS
-----------------------------------------------
- Grunt (rojo):    lento. Vale 100 puntos.
- Chaser (violeta): rapido. Vale 150 puntos.
- Jefe (grande):   aparecen con 2000 puntos, tiene
                   barra de vida arriba de la pantalla
                   y dispara rafagas de proyectiles.
                   Eliminarlo = VICTORIA.

-----------------------------------------------
6) PUNTUACION
-----------------------------------------------
- Grunt  = 100 puntos
- Chaser = 150 puntos
- El puntaje se acumula de 0 y se muestra arriba a la izquierda.

-----------------------------------------------
7) ESTRUCTURA DE ARCHIVOS
-----------------------------------------------
- index.html            => pagina principal
- package.json          => dependencias y scripts
- src/main.js           => configuracion del juego (Phaser)
- src/scenes/BootScene.js => genera las texturas del juego
- src/scenes/GameScene.js => logica completa del juego
- GDD.md                => documento de diseno del juego

-----------------------------------------------
8) REGLAS RESUMIDAS
-----------------------------------------------
- 3 vidas por partida.
- Tocar enemigo o bala enemiga = -1 vida + 1 seg de invulnerabilidad.
- 2000 puntos = aparece el jefe (dejan de salir enemigos normales).
- Matar al jefe = GANAS. Quedarte sin vidas = PERDES.
- En ambos casos, presionar R reinicia la partida desde cero.