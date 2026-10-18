# Canciones para ti

Mixtape digital de regalo para Bejita. Es una página web hecha solo con HTML, CSS y JavaScript (sin instalar nada ni compilar): se abre un sobre, brota un muro de flores y aparece la página con el casete, la canción, la nota y un panel con la carta, una caja de flores y el reproductor.

---

## 1. Cambiar tu nombre y los textos

Todo lo que se puede editar está en **`js/config.js`**. No hace falta tocar ningún otro archivo.

Lo mínimo que tienes que cambiar es tu nombre:

```js
window.CONFIG = {
  lang: "es",
  to:   "Bejita",
  from: "Tu nombre",   // ← pon aquí tu nombre
  ...
```

Ese nombre aparece solo en la cabecera, la nota, la carta, el ramo y el final.

Otros textos que puedes cambiar en el mismo archivo:

| Campo | Qué es |
|---|---|
| `linerNote` | La nota amarilla (`greeting`, `body`, `closing`) |
| `letter.subtitle` | La frase de la tarjeta "Carta" del panel |
| `letter.body` | La carta completa. Separa los párrafos con una línea en blanco |
| `finale` | Lo que sale al terminar el mixtape |
| `ui` | Todos los textos de botones y etiquetas. `{to}` y `{from}` se reemplazan solos |

Guarda el archivo y recarga la página para ver los cambios.

---

## 2. Cambiar la canción y la portada

1. Copia tu canción (MP3) dentro de la carpeta `musica/`.
2. En `js/config.js`, dentro de `tracks`, cambia `src`, `title` y `artist`:

```js
tracks: [
  {
    n: "01",
    title:  "Dream Girl",
    artist: "Crisaunt",
    src:    "./musica/dream-girl.mp3",
    cover:  "./img/portada.jpg"
  }
],
```

3. La portada es `img/portada.jpg` (300 × 300 px). Puedes reemplazarla por otra imagen con el mismo nombre, o cambiar la ruta en `cover` (con la extensión, por ejemplo `.jpg`).

**Más de una canción:** agrega más bloques `{ ... }` dentro de `tracks` (con `n: "02"`, `"03"`…). La lista, el casete y el reproductor se adaptan solos y pasan a la siguiente al terminar cada una.

---

## 3. Letra en español (subtítulo sincronizado)

Mientras suena la canción, abajo aparece una cinta con el verso que se está cantando, que se va iluminando al ritmo de la voz.

La letra va en **`js/letra.js`** y **ya está lista y sincronizada**: cada verso aparece solo mientras se canta, y los ecos (`eco: true`) salen debajo, más pequeños. En las partes sin voz la cinta se oculta.

Si algún verso aparece un poco antes o después, cambia su `t` (inicio) o `fin` unas décimas de segundo.

**Para volver a sincronizar todo — `sincronizar.html`:** abre ese archivo con doble clic, pega la letra en español (un verso por renglón), pulsa *Empezar* y presiona **Espacio** justo cuando empieza cada verso (**X** marca el final de un verso antes de una parte sin voz, **Z** deshace). Al terminar, pulsa *Descargar letra.js* y reemplaza el archivo de la carpeta `js/`. Esa página es solo una herramienta para ti; puedes borrarla antes de publicar.

Cada renglón de `js/letra.js` tiene esta forma:

```js
{ t:  14.20, fin:  17.85, texto: "aquí va el verso en español" }, // 03 · 0:14
```

- Escribe cada verso entre las comillas de `texto`. Las frases que dejes vacías no se muestran.
- Si un verso sale un poco antes o después, cambia su `t` unas décimas de segundo.
- Si cambias de canción, la clave (`"01"`) es el número de la canción en `config.js`.

---

## 3.1 Secciones de amor

Debajo de la nota hay tres secciones, y sus textos están en `js/config.js`:

| Sección | En `config.js` | Qué hace |
|---|---|---|
| Razones por las que te amo | `razones.lista` | Al tocar el frasco sale una notita volando con una razón distinta |
| Cuánto te quiero | `cuanto` | Corazón que se llena mientras se mantiene presionado; al llenarse lanza corazones |
| Ábrela cuando… | `cartas.lista` | Seis sobres; cada uno abre una carta larga en una hoja de papel (se marcan como leídos) |
| Nuestro cielo | `cielo.estrellas` | Estrellas que se encienden al tocarlas y, juntas, dibujan un corazón |
| Vales de amor | `vales.lista` | Cupones que se canjean con un sello (se recuerdan en su navegador) |
| Nuestro futuro | `futuro.pasos` | Línea del tiempo; el paso con `destacado: true` (Casarme contigo) resalta |
| Una promesa | `promesa.mensaje` | Al tocar la cajita se abre, brilla el anillo y aparece el mensaje |

Puedes agregar o quitar razones y pasos; la página se adapta sola. Si `from` está vacío, la página firma "Con todo mi amor".

---

## 4. Nota de voz o video (opcionales)

En `js/config.js`:

- **`voiceNote`**: copia tu audio a `musica/nota-de-voz.mp3` y escribe `voiceNote: "./musica/nota-de-voz.mp3"`. Mientras suena, la canción baja de volumen. Si lo dejas en `""` (o el archivo no existe), el bloque no aparece.
- **`youtubeId`**: escribe solo el ID del video (lo que va después de `v=` en el link de YouTube). Si le dan play al video, la canción se pausa. Si lo dejas en `""`, no aparece.

---

## 5. Reemplazar las ilustraciones

Las ilustraciones actuales son acuarelas generadas por código. Si quieres ilustraciones pintadas (por ejemplo, generadas con una IA de imágenes usando las descripciones de la especificación), reemplaza cada archivo de `img/` **con el mismo nombre y las mismas medidas**.

Cada imagen va en dos formatos: `.webp` (la que usa el navegador) y `.png` (o `.jpg` para las opacas) de respaldo.

| Archivo | Medidas | Requisitos |
|---|---|---|
| `sobre-cerrado` | 640 px de ancho, proporción 4:3 | Sobre kraft cerrado, fondo transparente |
| `sobre-abierto` | 640 px de ancho, más alto | Solapa levantada, transparente. La base del sobre debe quedar en el mismo lugar que en el cerrado |
| `flores/flor-01` … `flor-20` | 700 × 700 | Cabezas de flor sueltas, transparentes. La 11 y la 12 son las rojas (se reparten como acentos) |
| `fondo-habitacion` | 2560 × 1440 (`.webp` y `.jpg`) | El centro liso, porque ahí va la tarjeta |
| `casete` | 1400 × 1030 | Transparente. Carretes con centro en 33.5 % / 43 % y 66.5 % / 43 % (ancho / alto), diámetro 12.5 % del ancho |
| `carrete` | 175 × 175 | Un carrete suelto, transparente (gira encima del casete) |
| `caja-flores` | 720 × 792 | Caja de flores del panel, transparente |
| `frasco-razones` | 640 de ancho | Frasco de las razones, transparente |
| `anillo-cerrada` / `anillo-abierta` | 640 × 512 | Cajita del anillo cerrada y abierta (mismo encuadre), transparentes |
| `portada` | 300 × 300 (`.jpg` y `.webp`) | Portada de la canción |
| `og-image.jpg` | 1200 × 630 | Vista previa al compartir el link |

---

## 6. Probar en tu computadora

Haz **doble clic en `index.html`**. Hace falta internet para las tipografías; si no hay, la animación igual funciona porque GSAP tiene una copia local en `js/vendor/`.

También puedes usar un servidor local (así se comporta igual que publicada):

1. Abre una terminal en la carpeta `mixtape-bejita`.
2. Ejecuta `python -m http.server 8000`.
3. Abre http://localhost:8000 en el navegador.

Con doble clic los fundidos de volumen usan el volumen del reproductor de audio; publicada (https) usa Web Audio. En iPhone el volumen solo se puede controlar en la versión publicada.

---

## 7. Publicar gratis y compartir por WhatsApp

1. Entra a https://app.netlify.com/drop
2. Arrastra la carpeta **`mixtape-bejita` completa**.
3. Netlify te da un link: ese es el que le mandas a Bejita.

Para que WhatsApp muestre la imagen de vista previa:

1. En `index.html`, cambia la etiqueta `og:image` por la dirección completa, por ejemplo `https://tu-sitio.netlify.app/img/og-image.jpg`.
2. Vuelve a arrastrar la carpeta a Netlify.

El título y la descripción de la vista previa (`og:title`, `og:description`) también están en `index.html`, porque WhatsApp no ejecuta JavaScript.

---

## 8. Notas

- Se puede usar todo con el teclado: **Enter** o **Espacio** abren el sobre y descubren la página, **Esc** cierra la carta y el panel.
- Si el sistema tiene activado "reducir movimiento", las animaciones se reemplazan por fundidos suaves.
- La canción suena una vez (sin bucle). Al terminar, vuelve el muro de flores con "Con amor, …" y se puede escuchar otra vez.
