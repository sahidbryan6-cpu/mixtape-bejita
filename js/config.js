/*
 * ÚNICO lugar con textos, nombres y rutas editables.
 * Cambia "from" por tu nombre, ajusta la carta y listo.
 */
window.CONFIG = {
  lang: "es",
  to:   "Bejita",
  from: "",   // vacío: la página firma "Con todo mi amor" en lugar de un nombre

  tracks: [
    {
      n: "01",
      title:  "Dream Girl",
      artist: "Crisaunt",
      src:    "./musica/dream-girl.mp3",
      cover:  "./img/portada.jpg"
    }
  ],

  linerNote: {
    greeting: "Bejita:",
    body: "Este casete tiene una sola canción, pero la elegí con todo el corazón. La escuché tantas veces pensando en ti que ya no sé si es de ella o es nuestra. Cada vez que suene, quiero que sepas que en algún lugar alguien está pensando en ti y sonriendo sin poder evitarlo.",
    closing: "Súbele el volumen y quédate un ratito aquí conmigo."
  },

  letter: {
    subtitle: "Lo que a veces no me sale decirte en voz alta.",
    body: `Bejita:

Llevo días pensando cómo escribirte esto sin que suene a tarjeta de regalo, y creo que lo más honesto es decirlo tal cual: te quiero muchísimo. Más de lo que sé explicar, más de lo que cabe en cualquier carta, más de lo que alguna vez pensé que se podía querer a alguien.

No hay un solo día en el que no piense en ti. Te pienso en las mañanas, cuando todavía no termino de despertar. Te pienso a mitad del día, cuando algo cualquiera me recuerda tu risa. Y te pienso en las noches, antes de dormir, dando gracias en silencio porque existes y porque, de todas las personas del mundo, me tocó encontrarte a ti.

Me gusta cómo se siente la vida desde que estás en ella. Las cosas pequeñas se volvieron mis favoritas: un mensaje tuyo a mitad del día, tu risa cuando algo te da gracia de verdad, tu voz cuando me cuentas cómo te fue, la calma enorme que me da saber que estás. Contigo aprendí que la felicidad no siempre hace ruido; a veces es solo estar a tu lado y no necesitar nada más.

Eres la persona más bonita que conozco, por dentro y por fuera. Admiro tu corazón, tu forma de ver el mundo, lo fuerte que eres aunque a veces no lo notes. Me haces querer ser mejor, no por obligación, sino porque mereces a alguien que te cuide como lo que eres: lo más valioso que tengo.

No te prometo que todo vaya a ser perfecto. Sí te prometo que voy a estar. Que te voy a escuchar, que voy a cuidar lo nuestro y que te voy a seguir eligiendo incluso en los días difíciles, sobre todo en esos. Que cuando el mundo te pese, vas a tener en mí un lugar donde descansar.

A veces me descubro imaginando un futuro contigo: una casa con música, plantas que se nos olvida regar, mañanas lentas con café y tú ahí, a mi lado, con el cabello despeinado y esa sonrisa que me desarma. Y algún día, si tú también lo quieres, me encantaría casarme contigo. Verte llegar y saber, sin ninguna duda, que es contigo con quien quiero pasar el resto de mi vida.

Si alguna vez te sientes insegura, cansada o triste, vuelve a esta carta y léela despacio. Aquí está escrito algo que no va a cambiar: te quiero, te admiro y me haces inmensamente feliz.

Gracias por quedarte. Gracias por quererme como me quieres. Gracias por ser tú.

Esta canción es tuya. Y yo también, por completo.`
  },

  voiceNote: "",   // "./musica/nota-de-voz.mp3" o "" para ocultar
  youtubeId: "",   // ID de YouTube o "" para ocultar
  finale: { line1: "Te quiero, Bejita", line2: "Toca para escucharla otra vez" },

  /* ---------- Secciones de amor (debajo de la nota) ---------- */
  razones: {
    etiqueta: "UN FRASCO LLENO DE TI",
    titulo:   "Razones por las que te amo",
    pista:    "Saca una notita del frasco",
    boton:    "Otra más",
    lista: [
      "Porque cuando te ríes, a mí se me arregla el día entero. No importa lo pesado que haya estado todo: escucho tu risa y de pronto el mundo vuelve a tener sentido.",
      "Porque contigo puedo ser yo, sin fingir nada. No tengo que aparentar ni tener todo resuelto; me basta con ser yo, y aun así me quieres. Eso no tiene precio.",
      "Por cómo me escuchas, como si lo que digo de verdad importara. Nunca nadie me había escuchado así: con paciencia, con cariño y con esos ojos que lo entienden todo.",
      "Porque contigo hasta el silencio se siente cómodo. Podemos no decir nada durante un rato largo y aun así siento que me estás diciendo todo lo que necesito escuchar.",
      "Porque me haces sentir en casa, estemos donde estemos. Mi lugar favorito del mundo no es una ciudad ni un rincón: eres tú, y a donde tú vas, ahí quiero estar.",
      "Por la forma tan bonita en que cuidas a las personas que quieres. Tienes un corazón enorme, y me siento la persona con más suerte del mundo por tener un pedacito de él.",
      "Porque desde que llegaste, todo tiene más color. Las mañanas, las canciones, hasta los días grises: todo se ve más bonito desde que existes en mi vida.",
      "Porque eres lo primero que quiero contarle a alguien cuando algo bueno me pasa, y lo primero que busco cuando algo sale mal. Eres mi persona, en todos los sentidos.",
      "Porque crees en mí incluso en los días en que yo no puedo. Tu forma de mirarme me recuerda quién soy cuando se me olvida, y me dan ganas de estar a la altura de lo que ves en mí.",
      "Porque de repente todas las canciones de amor empezaron a hablar de ti. Ya no puedo escuchar una sola sin pensar en tu sonrisa, en tu voz, en ti.",
      "Porque cuando pienso en mi futuro, ya no sé imaginarlo sin ti. Cada plan, cada sueño y cada «algún día» que me imagino ahora tiene tu nombre escrito.",
      "Porque eres tú. No existe una razón más grande que esa. Te quiero entera: con tus días buenos, con tus días difíciles, con tus manías y con todo lo que eres y todavía vas a ser."
    ]
  },
  cuanto: {
    etiqueta: "CUÁNTO TE QUIERO",
    titulo:   "Mantén presionado el corazón",
    pista:    "Deja el dedo sobre el corazón y no lo sueltes",
    pasos:    ["Mucho…", "Muchísimo…", "Más que a nada en este mundo…", "Más que a todo…"],
    final:    "Más de lo que cabe en esta página. Más de lo que cabe en el mundo. Y aun así, cada día te quiero un poquito más que ayer."
  },
  cartas: {
    etiqueta: "PARA CUANDO LAS NECESITES",
    titulo:   "Ábrela cuando…",
    pista:    "Elige un sobre y léelo despacio",
    leida:    "Leída",
    lista: [
      { cuando: "me extrañes", texto: `Mi amor:

Si estás leyendo esto, es porque me extrañas… y quiero que sepas que yo también te estoy extrañando, seguramente justo en este momento.

Cierra los ojos un segundo. Imagina que estoy ahí, abrazándote fuerte, de esos abrazos largos en los que no hace falta decir nada. Eso es exactamente lo que te estoy mandando con esta carta.

La distancia, el tiempo o lo que sea que nos separe ahora no cambia nada de lo que siento. Te llevo conmigo a todos lados: en las canciones, en las cosas bonitas que veo y quiero enseñarte, en cada momento en que pienso «esto le encantaría».

Ya falta menos para vernos. Y cuando por fin te tenga enfrente, te voy a abrazar como si fuera la primera vez, y no te voy a soltar en un buen rato.` },
      { cuando: "tengas un mal día", texto: `Mi amor:

Si hoy fue un día difícil, primero que nada: respira. Lo que sea que haya pasado no define lo increíble que eres.

Quiero que sepas que estoy de tu lado. Siempre. Para escucharte, para abrazarte o simplemente para quedarme en silencio junto a ti mientras se te pasa. No tienes que cargar con todo sola.

Eres más fuerte de lo que crees. Te he visto levantarte de cosas que a cualquiera le habrían pesado muchísimo, y siempre lo haces con una valentía que admiro con todo mi corazón.

Hoy date permiso de descansar. Come algo rico, ponte cómoda, mira algo que te haga reír. Mañana es otro día. Y en todos esos días, los buenos y los malos, yo te voy a seguir queriendo exactamente igual.` },
      { cuando: "no puedas dormir", texto: `Mi amor:

Si es tarde y no puedes dormir, aquí estoy, haciéndote compañía.

Apaga las luces y deja que esta carta sea como mi voz bajita al oído. Piensa en algo bonito: en nosotros dos en una tarde tranquila, sin prisa, con música de fondo y tu cabeza recargada en mi hombro.

No tienes que resolver nada esta noche. Todo lo que te preocupa puede esperar a mañana; ahorita solo te toca descansar. Yo te estoy cuidando desde donde estoy.

Respira despacio conmigo. Uno… dos… tres… Te quiero en cada respiración.

Que descanses, mi vida. Que sueñes bonito, y si se puede, que sueñes conmigo.` },
      { cuando: "dudes de lo mucho que te quiero", texto: `Mi amor:

Si alguna vez llegas a dudar de lo que siento por ti, lee esto despacio, las veces que haga falta.

Te quiero. No a medias, no a ratos, no solo cuando es fácil. Te quiero completa, con todo lo que eres y con todo lo que todavía vas a ser.

Te quiero cuando te ríes y cuando lloras. Cuando estás de buenas y cuando el mundo te pesa. Te quiero en tus días seguros y en los días en que no te sientes suficiente, porque para mí siempre lo eres, y de sobra.

Si alguna vez no te lo digo lo suficiente, perdóname: a veces me faltan palabras para algo tan grande. Pero no lo dudes nunca. Eres lo más bonito que me ha pasado en la vida, y no pienso soltarte.` },
      { cuando: "necesites sonreír", texto: `Mi amor:

Esta carta tiene una sola misión: sacarte una sonrisa.

Tienes la sonrisa más bonita que he visto en mi vida. Cuando te ríes de verdad, de esas risas que no puedes controlar, me dan ganas de detener el tiempo para quedarme a vivir ahí.

Quiero que te acuerdes de lo increíble que eres, de lo mucho que iluminas cualquier lugar al que llegas, y de que hay alguien que sonríe solo de pensar en ti. Incluso ahora, mientras escribe esto.

¿Ya sonreíste? Si no, vuelve a leer desde el principio. Si sí, misión cumplida. Y que sepas que esa sonrisa es mi cosa favorita en todo el mundo.` },
      { cuando: "pienses en nuestro futuro", texto: `Mi amor:

Si estás pensando en lo que viene, déjame contarte cómo lo veo yo.

Te veo a ti. En todos mis planes, en todos mis sueños, en cada «algún día» que me imagino. Veo una casa con nuestras cosas revueltas, mañanas lentas, viajes que planeamos durante meses y risas en la cocina a medianoche.

Y te veo caminando hacia mí, algún día, con el corazón latiéndome tan fuerte que no voy a poder ni hablar. Quiero casarme contigo. Quiero construir una vida a tu lado, paso a paso, sin prisa pero sin soltarnos nunca de la mano.

No sé exactamente cómo va a ser todo, pero sí sé con quién lo quiero vivir. Contigo. Siempre contigo.` }
    ]
  },
  cielo: {
    etiqueta: "NUESTRO CIELO",
    titulo:   "Une las estrellas",
    nombre:   "Constelación Bejita",
    pista:    "Toca cada estrella para encenderla",
    estrellas: [
      "Esta estrella es el día en que llegaste a mi vida.",
      "Esta es por cada vez que me has hecho reír sin querer.",
      "Esta brilla por todas las pláticas que no queríamos terminar.",
      "Esta es la calma que siento cuando estás cerca.",
      "Esta es por cada abrazo tuyo que me ha arreglado el día.",
      "Esta guarda todos los planes que todavía nos faltan por cumplir.",
      "Esta es el miedo que se me quita cuando me tomas de la mano.",
      "Esta es la casa que algún día vamos a tener.",
      "Y esta, la más brillante, es el día en que te diga «sí, para siempre»."
    ],
    final: "¿Ves? Todas juntas forman un corazón. Así es mi cielo desde que estás tú: lleno de luz y con tu forma en todas partes. Si alguna vez te sientes perdida, mira hacia arriba; ahí voy a estar, uniendo estrellas para llegar a ti."
  },
  vales: {
    etiqueta: "VALES DE AMOR",
    titulo:   "Canjéalos cuando quieras",
    pista:    "No tienen fecha de vencimiento",
    valePor:  "VALE POR",
    boton:    "Canjear",
    sello:    "CANJEADO",
    lista: [
      { icono: "abrazo",   titulo: "Un abrazo largo",          texto: "De esos que duran más de un minuto y arreglan cualquier cosa." },
      { icono: "cita",     titulo: "Una cita sorpresa",        texto: "Yo planeo todo; tú solo te arreglas y te dejas llevar." },
      { icono: "corona",   titulo: "Un día de consentirte",    texto: "Todo el día a tus órdenes: antojos, mimos y cero preocupaciones." },
      { icono: "taza",     titulo: "Tu comida favorita",       texto: "Hecha o conseguida por mí, con todo el amor del mundo." },
      { icono: "pelicula", titulo: "Noche de películas",       texto: "Tú eliges la película; yo pongo las palomitas y las cobijas." },
      { icono: "beso",     titulo: "Un beso donde tú quieras", texto: "Cuando quieras, donde quieras, las veces que quieras." }
    ]
  },
  futuro: {
    etiqueta: "LO QUE SUEÑO CONTIGO",
    titulo:   "Nuestro futuro",
    pasos: [
      { cuando: "Hoy",          titulo: "Te elijo",                icono: "corazon",  texto: "Hoy, mañana y todos los días que me dejes estar a tu lado. Te elijo cuando todo está bien y también cuando no lo está. Te elijo sin dudarlo, una y otra vez." },
      { cuando: "Pronto",       titulo: "Llenarnos de recuerdos",  icono: "avion",    texto: "Viajes, desveladas, comidas improvisadas y fotos borrosas que solo nosotros vamos a entender. Quiero perderme contigo en lugares nuevos y reírnos de todo lo que salga mal." },
      { cuando: "Después",      titulo: "Un lugar nuestro",        icono: "casa",     texto: "Una casa con plantas que se nos olvide regar, música en la cocina y tus cosas revueltas con las mías. Un lugar al que llegar después de un día largo y encontrarte ahí." },
      { cuando: "Algún día",    titulo: "Casarme contigo",         icono: "anillos",  texto: "Verte llegar, que se me olvide respirar un segundo y prometerte frente a todos lo que hoy ya te prometo en silencio. Tomarte de las manos, mirarte a los ojos y decirte que sí, que para siempre, que contigo. Ese va a ser el día más feliz de mi vida.", destacado: true },
      { cuando: "Para siempre", titulo: "Envejecer a tu lado",     icono: "infinito", texto: "Seguir tomándote de la mano cuando ya no nos acordemos de cuántos años llevamos juntos. Seguir haciéndote reír, seguir cuidándote y seguir enamorándome de ti igual que hoy." }
    ]
  },
  promesa: {
    etiqueta: "UNA PROMESA",
    titulo:   "Algún día…",
    pista:    "Ábrela",
    mensaje:  "Todavía no es un anillo de verdad. Es una promesa, y te la hago con todo lo que soy: que te voy a seguir eligiendo todos los días, en los buenos y en los difíciles. Que voy a cuidar tu corazón como lo más valioso que tengo, porque lo es. Que voy a trabajar cada día para construir contigo una vida bonita, tranquila y llena de amor. Y que algún día, con un anillo de verdad y el corazón en la mano, te voy a mirar a los ojos y te voy a preguntar si quieres pasar el resto de tu vida conmigo.",
    nota:     "Guárdala hasta ese día. Yo ya la estoy cumpliendo."
  },

  /* Textos de la interfaz. {to} y {from} se reemplazan solos. */
  ui: {
    pageTitle:   "Canciones para ti",
    eyebrow:     "PARA {to}",
    firma:       "Con todo mi amor",
    tapToOpen:   "Toca para abrir",
    tapToReveal: "Toca para descubrir",
    moreHere:    "Hay más aquí",
    help:        "Ayuda",
    helpText:    "Toca el sobre y luego las flores. Sube el volumen.",
    linerNoteLabel: "NOTA DEL CASETE",
    status: {
      idle:    "Empieza",
      playing: "Sonando",
      paused:  "En pausa",
      loading: "Cargando la canción…",
      error:   "No se pudo cargar la canción"
    },
    letterLabel:  "CARTA",
    letterTitle:  "Una carta para ti",
    letterFrom:   "Con todo mi amor",
    voiceTitle:   "Una nota para ti",
    voiceHint:    "toca para escuchar",
    bouquetTitle: "Tu caja de flores",
    bouquetFrom:  "CON TODO MI AMOR",
    finish:       "TERMINAR MIXTAPE",
    aria: {
      envelope:   "Abrir el sobre",
      wall:       "Descubrir la página",
      wallEnd:    "Escuchar otra vez",
      play:       "Reproducir {title}",
      pause:      "Pausar {title}",
      cassette:   "Reproducir o pausar el casete",
      openMore:   "Abrir más",
      panel:      "Hay más aquí",
      letter:     "Abrir la carta",
      close:      "Cerrar",
      voicePlay:  "Escuchar la nota de voz",
      voicePause: "Pausar la nota de voz",
      seek:       "Posición de la canción",
      player:     "Reproductor",
      lyrics:     "Letra en español",
      jar:        "Sacar una razón del frasco",
      ring:       "Abrir la cajita del anillo",
      star:       "Estrella {n}",
      openWhen:   "Ábrela cuando",
      video:      "Video"
    }
  },

  /* Rutas de las ilustraciones (sin extensión: se usa .webp y, si el navegador no lo soporta, .png/.jpg).
     version: cámbiala cada vez que cambies una imagen, así los teléfonos descargan la nueva y no muestran
     la que tenían guardada (usa el mismo valor en los ?v= de index.html). */
  images: {
    version:        "6",
    dir:            "./img/",
    envelopeClosed: "sobre-cerrado",
    envelopeOpen:   "sobre-abierto",
    cassette:       "casete",
    cassetteInside: "casete-interior",  // lo que se ve por la ventana, detrás de los carretes
    reel:           "carrete",
    bouquet:        "caja-flores",
    jar:            "frasco-razones",
    ringClosed:     "anillo-cerrada",
    ringOpen:       "anillo-abierta",
    miniEnvelopes:  ["sobre-mini-1", "sobre-mini-2", "sobre-mini-3"],
    background:     "fondo-habitacion",
    flowers:        "flores/flor-",   // flor-01 … flor-20
    flowerCount:    20,
    redFlowers:     [11, 12]          // rosas color vino: se reparten como acentos
  }
};
