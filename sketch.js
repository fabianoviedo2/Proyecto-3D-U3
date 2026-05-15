let video;
let clasificador;

let etiqueta = "Esperando dispositivo...";
let confianza = 0;

let textoInformacion;
let textoCategoria;
let textoDato;
let textoHistorial;

let input;
let botonBuscar;
let botonCamara;
let botonVoz;

let camaraActiva = true;

let historial = [];

let searchUrl =
  "https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&redirects=1&titles=";

let traducciones = {

  "laptop": "Laptop",
  "notebook": "Laptop",
  "desktop computer": "Computadora",

  "monitor": "Monitor",
  "screen": "Pantalla",
  "television": "Televisión",

  "cellular telephone": "Teléfono móvil",
  "cell phone": "Teléfono móvil",
  "smartphone": "Teléfono inteligente",

  "computer keyboard": "Teclado",
  "keyboard": "Teclado",

  "mouse": "Mouse",
  "computer mouse": "Mouse",

  "remote control": "Control remoto",

  "printer": "Impresora",

  "speaker": "Altavoz",
  "microphone": "Micrófono",

  "camera": "Cámara",
  "webcam": "Cámara web",

  "router": "Router",
  "modem": "Módem",

  "power supply": "Fuente de alimentación",

  "hard disk": "Disco duro",
  "usb": "Memoria USB",

  "headphones": "Audífonos",
  "earphones": "Audífonos",

  "calculator": "Calculadora",

  "battery": "Batería",

  "electric fan": "Ventilador"

};

let wikipediaTitulos = {

  "Laptop": "Computadora portátil",
  "Computadora": "Computadora",
  "Monitor": "Monitor de computadora",
  "Pantalla": "Pantalla",
  "Televisión": "Televisor",
  "Teléfono móvil": "Teléfono móvil",
  "Teléfono inteligente": "Teléfono inteligente",
  "Teclado": "Teclado (informática)",
  "Mouse": "Ratón (informática)",
  "Control remoto": "Control remoto",
  "Impresora": "Impresora",
  "Altavoz": "Altavoz",
  "Micrófono": "Micrófono",
  "Cámara": "Cámara digital",
  "Cámara web": "Cámara web",
  "Router": "Router",
  "Módem": "Módem",
  "Fuente de alimentación": "Fuente de alimentación",
  "Disco duro": "Unidad de disco duro",
  "Memoria USB": "Memoria USB",
  "Audífonos": "Auricular",
  "Calculadora": "Calculadora",
  "Batería": "Batería eléctrica",
  "Ventilador": "Ventilador"

};

let categorias = {

  "Teclado": "Dispositivo de entrada",
  "Mouse": "Dispositivo de entrada",
  "Micrófono": "Dispositivo de entrada",
  "Cámara": "Dispositivo de entrada",

  "Monitor": "Dispositivo de salida",
  "Altavoz": "Dispositivo de salida",
  "Impresora": "Dispositivo de salida",

  "Disco duro": "Almacenamiento",
  "Memoria USB": "Almacenamiento",

  "Router": "Comunicación",
  "Módem": "Comunicación",

  "Laptop": "Computadora portátil",

  "Batería": "Fuente de energía"

};

let datosCuriosos = {

  "Teclado":
    "El teclado QWERTY fue diseñado para evitar que las teclas se atoraran.",

  "Mouse":
    "El primer mouse de computadora estaba hecho de madera.",

  "Laptop":
    "Las primeras laptops pesaban más de 10 kilogramos.",

  "Router":
    "Los routers permiten conectar muchos dispositivos a internet.",

  "Monitor":
    "Los primeros monitores eran monocromáticos."

};

function preload() {

  clasificador = ml5.imageClassifier("MobileNet");

}

function setup() {

  createCanvas(1500, 850);

  video = createCapture(VIDEO);

  video.size(640, 480);

  video.hide();

  input = createInput("");

  input.position(880, 80);

  input.size(250);

  botonBuscar = createButton("Buscar información");

  botonBuscar.position(880, 120);

  botonBuscar.mousePressed(buscarWikipedia);

  botonCamara = createButton("Desactivar cámara");

  botonCamara.position(1050, 120);

  botonCamara.mousePressed(toggleCamara);

  botonVoz = createButton("Leer información");

  botonVoz.position(1210, 120);

  botonVoz.mousePressed(leerTexto);

  textoInformacion = createP(
    "Muestra un dispositivo electrónico."
  );

  textoInformacion.position(880, 170);

  textoInformacion.size(520, 260);

  estiloPanel(textoInformacion);

  textoCategoria = createP("Categoría: ---");

  textoCategoria.position(880, 450);

  textoCategoria.size(520, 50);

  estiloPanel(textoCategoria);

  textoDato = createP("Dato curioso: ---");

  textoDato.position(880, 530);

  textoDato.size(520, 100);

  estiloPanel(textoDato);

  textoHistorial = createP("Historial: ---");

  textoHistorial.position(20, 680);

  textoHistorial.size(640, 120);

  estiloPanel(textoHistorial);

  clasificarVideo();

}

function estiloPanel(elemento) {

  elemento.style("color", "white");

  elemento.style("font-size", "16px");

  elemento.style("line-height", "24px");

  elemento.style("overflow-y", "scroll");

  elemento.style("background-color", "#2b2b2b");

  elemento.style("padding", "15px");

  elemento.style("border-radius", "10px");

}

function leerTexto() {

  speechSynthesis.cancel();

  let texto = textoInformacion.elt.innerText;

  let mensaje = new SpeechSynthesisUtterance(texto);

  mensaje.lang = "es-ES";

  mensaje.rate = 1;

  mensaje.pitch = 1;

  speechSynthesis.speak(mensaje);

}

function toggleCamara() {

  if (camaraActiva) {

    video.stop();

    camaraActiva = false;

    botonCamara.html("Activar cámara");

  } else {

    video = createCapture(VIDEO);

    video.size(640, 480);

    video.hide();

    camaraActiva = true;

    botonCamara.html("Desactivar cámara");

    clasificarVideo();

  }

}

function buscarWikipedia() {

  let topico = input.value();

  if (topico != "") {

    let tituloWikipedia =
      wikipediaTitulos[topico] || topico;

    let url = searchUrl + tituloWikipedia;

    loadJSON(url, mostrarResumen);

  }

}

function mostrarResumen(data) {

  let pages = data.query.pages;

  let pageId = Object.keys(pages)[0];

  let extract =
    pages[pageId].extract ||
    "No se encontró información.";

  textoInformacion.html(
    "<b>" + etiqueta + "</b><br><br>" + extract
  );

  let categoria =
    categorias[etiqueta] || "Tecnología";

  textoCategoria.html(
    "<b>Categoría:</b> " + categoria
  );

  let dato =
    datosCuriosos[etiqueta] ||
    "La tecnología cambia constantemente.";

  textoDato.html(
    "<b>Dato curioso:</b><br><br>" + dato
  );

}

function clasificarVideo() {

  if (camaraActiva) {

    clasificador.classify(video, gotResult);

  }

}


// RESULTADO
function gotResult(resultados) {

  if (!camaraActiva) return;

  let objetoDetectado = resultados[0].label;

  objetoDetectado = objetoDetectado.split(",")[0];

  confianza = resultados[0].confidence;

  if (traducciones[objetoDetectado]) {

    let nuevaEtiqueta =
      traducciones[objetoDetectado];

    if (nuevaEtiqueta != etiqueta) {

      etiqueta = nuevaEtiqueta;

      input.value(etiqueta);

      historial.unshift(etiqueta);

      historial = historial.slice(0, 5);

      textoHistorial.html(
        "<b>Historial:</b><br><br>" +
        historial.join("<br>")
      );

      if (confianza > 0.70) {

        buscarWikipedia();

      }

    }

  }

  setTimeout(clasificarVideo, 1500);

}


function draw() {

  background(25);

  // TÍTULO
  fill(255);

  textSize(34);

  text(
    "¡APRENDE SOBRE LOS APARATOS ELECTRONICOS!",
    20,
    40
  );

  textSize(18);

  fill(180);

  text(
    "Reconocimiento inteligente de dispositivos electrónicos.",
    20,
    70
  );

  if (camaraActiva) {

    image(video, 20, 100, 640, 480);

  } else {

    fill(60);

    rect(20, 100, 640, 480);

    fill(255);

    textSize(32);

    text("Cámara desactivada", 180, 350);

  }

  noFill();

  stroke(255);

  strokeWeight(3);

  rect(20, 100, 640, 480);

  noStroke();

  fill(0, 255, 0);

  textSize(24);

  text("Dispositivo:", 20, 620);

  fill(255);

  text(etiqueta, 190, 620);
                        
  fill(0, 200, 255);

  text(
    "Confianza: " +
    nf(confianza * 100, 2, 1) +
    "%",
    450,
    620
  );

  fill(255, 200, 0);

  textSize(18);

  text(
    "IA analizando dispositivos electrónicos...",
    20,
    650
  );

}