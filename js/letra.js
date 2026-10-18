/*
 * LETRA EN ESPAÑOL, sincronizada con la canción.
 *
 *   t   = segundo en que empieza a cantarse el verso
 *   fin = segundo en que termina (después, si no hay voz, la cinta se oculta)
 *   eco = coro o eco: se muestra debajo del verso principal, más pequeño
 *   w   = segundo en que se canta cada palabra (el verso se ilumina al ritmo de la voz)
 *
 * Si un verso aparece un poco antes o después, cambia su `t` unas décimas.
 */
window.LETRAS = {
  "01": [
    { t:  32.20, fin:  34.66, texto: "Viviendo en un sueño", w: [32.20, 33.36, 33.92, 34.18] }, // 0:32
    { t:  34.66, fin:  35.68, texto: "Un sueño", w: [34.66, 35.28] }, // 0:34
    { t:  35.68, fin:  37.26, texto: "Cuando estoy contigo", w: [35.68, 36.18, 36.42, 36.82] }, // 0:35
    { t:  37.26, fin:  39.24, texto: "(Cuando estoy contigo)", eco: true, w: [37.26, 38.18, 38.48, 38.80] }, // 0:37
    { t:  40.25, fin:  42.97, texto: "No sé cómo pensar", w: [40.25, 40.85, 41.07, 41.39, 41.93, 42.31] }, // 0:40
    { t:  42.97, fin:  45.33, texto: "Cuando te beso", w: [42.97, 44.15, 44.43, 44.83] }, // 0:42
    { t:  45.33, fin:  47.23, texto: "(Cuando te beso)", eco: true, w: [45.33, 46.29, 46.53, 46.83] }, // 0:45
    { t:  48.25, fin:  50.89, texto: "Acabas de colgar el teléfono", w: [48.25, 48.63, 49.09, 49.57, 50.09, 50.37] }, // 0:48
    { t:  50.89, fin:  51.91, texto: "El teléfono", w: [50.89, 51.29] }, // 0:50
    { t:  51.91, fin:  53.43, texto: "Pero te extraño", w: [51.91, 52.29, 52.47, 52.95] }, // 0:51
    { t:  53.43, fin:  55.35, texto: "(Pero te extraño)", eco: true, w: [53.43, 54.35, 54.49, 55.01] }, // 0:53
    { t:  56.10, fin:  59.18, texto: "Soy adicto a tu amor", w: [56.10, 56.62, 57.32, 58.14, 58.54] }, // 0:56
    { t:  59.18, fin:  59.90, texto: "Tu amor", w: [59.18, 59.56] }, // 0:59
    { t:  59.90, fin:  61.24, texto: "Eso es un problema", w: [59.90, 60.34, 60.56] }, // 0:59
    { t:  61.24, fin:  63.14, texto: "(Eso es un problema)", eco: true, w: [61.24, 62.36, 62.56] }, // 1:01
    { t:  67.65, fin:  70.51, texto: "Eres la chica de mis sueños", w: [67.65, 68.43, 68.83, 69.69] }, // 1:07
    { t:  83.85, fin:  86.63, texto: "Eres la chica de mis sueños", w: [83.85, 84.47, 84.95, 85.73] }, // 1:23
    { t:  97.00, fin:  99.98, texto: "Chica, solo te veo a ti", w: [97.00, 97.62, 98.04, 98.78, 99.36] }, // 1:37
    { t:  99.98, fin: 101.68, texto: "Cuando estoy durmiendo", w: [99.98, 100.84, 101.06] }, // 1:39
    { t: 101.68, fin: 103.50, texto: "(Cuando estoy durmiendo)", eco: true, w: [101.68, 102.74, 103.00] }, // 1:41
    { t: 104.80, fin: 107.74, texto: "Me despierto cada mañana", w: [104.80, 105.26, 105.78, 106.28, 106.88] }, // 1:44
    { t: 107.74, fin: 109.62, texto: "Sigues huyendo", w: [107.74, 108.48, 108.96] }, // 1:47
    { t: 109.62, fin: 111.58, texto: "(Sigues huyendo)", eco: true, w: [109.62, 110.52, 110.92] }, // 1:49
    { t: 112.75, fin: 115.71, texto: "Estoy enamorado de aquel rostro", w: [112.75, 113.39, 113.73, 114.29, 114.65, 114.95] }, // 1:52
    { t: 115.71, fin: 117.71, texto: "Es todo lo que veo", w: [115.71, 116.47, 116.71, 116.97] }, // 1:55
    { t: 117.71, fin: 119.59, texto: "(Es todo lo que veo)", eco: true, w: [117.71, 118.49, 118.75, 118.97] }, // 1:57
    { t: 121.05, fin: 123.71, texto: "Simplemente no puedo explicarlo", w: [121.05, 121.53, 121.87, 122.29, 122.87] }, // 2:01
    { t: 123.71, fin: 125.89, texto: "Esta sensación confusa", w: [123.71, 124.41, 125.03] }, // 2:03
    { t: 125.89, fin: 126.89, texto: "(Esta sensación confusa)", eco: true, w: [125.89, 126.53, 126.89] }, // 2:05
    { t: 126.89, fin: 127.87, texto: "(Esta sensación confusa)", eco: true, w: [126.89, 126.89, 127.05] }, // 2:06
    { t: 132.30, fin: 135.14, texto: "Eres la chica de mis sueños", w: [132.30, 132.98, 133.48, 134.24] }, // 2:12
    { t: 148.50, fin: 151.34, texto: "Eres la chica de mis sueños", w: [148.50, 149.12, 149.62, 150.36] }, // 2:28
  ]
};

/* Tramos con voz (medidos del audio): fuera de ellos la cinta no se muestra. */
window.LETRAS_VOZ = {
  "01": [[32.45, 39.5], [40.5, 47.55], [48.5, 55.55], [56.35, 63.65], [67.9, 71.6], [84.1, 87.75], [97.25, 104.1], [105.05, 112.05], [113.0, 120.05], [121.3, 128.15], [132.55, 136.35], [148.75, 152.4]]
};
