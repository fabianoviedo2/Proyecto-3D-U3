// sketch.js

// VARIABLES
let video;
let clasificador;

let etiqueta = "Esperando dispositivo...";
let confianza = 0;

let textoInformacion;

let input;
let botonBuscar;
let botonCamara;

let camaraActiva = true;

// API WIKIPEDIA
let searchUrl =
  "https://es.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&titles=";


// TRADUCCIONES
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


// PRELOAD
function preload() {

  clasificador = ml5.imageClassifier("MobileNet");

}


// SETUP
function setup() {

  createCanvas(1300, 650);

  // CÁMARA
  video = createCapture(VIDEO);

  video.size(640, 480);

  video.hide();

  // INPUT
  input = createInput("");

  input.position(880, 80);

  input.size(250);

  // BOTÓN BUSCAR
  botonBuscar = createButton("Buscar información");

  botonBuscar.position(880, 120);

  botonBuscar.mousePressed(buscarWikipedia);

  // BOTÓN CÁMARA
  botonCamara = createButton("Desactivar cámara");

  botonCamara.position(1040, 120);

  botonCamara.mousePressed(toggleCamara);

  // TEXTO INFORMACIÓN
  textoInformacion = createP(
    "Muestra un dispositivo electrónico a la cámara o escribe uno manualmente."
  );

  textoInformacion.position(880, 170);

  textoInformacion.size(340, 420);

  textoInformacion.style("color", "white");

  textoInformacion.style("font-size", "17px");

  textoInformacion.style("line-height", "26px");

  // PANEL CON SCROLL
  textoInformacion.style("overflow-y", "scroll");

  textoInformacion.style("background-color", "#2b2b2b");

  textoInformacion.style("padding", "15px");

  textoInformacion.style("border-radius", "10px");

  // INICIAR IA
  clasificarVideo();

}


// ACTIVAR / DESACTIVAR CÁMARA
function toggleCamara() {

  if (camaraActiva) {

    video.stop();

    camaraActiva = false;

    botonCamara.html("Activar cámara");

    etiqueta = "Cámara desactivada";

  } else {

    video = createCapture(VIDEO);

    video.size(640, 480);

    video.hide();

    camaraActiva = true;

    botonCamara.html("Desactivar cámara");

    clasificarVideo();

  }

}


// BUSCAR EN WIKIPEDIA
function buscarWikipedia() {

  let topico = input.value();

  if (topico != "") {

    let url = searchUrl + topico;

    loadJSON(url, mostrarResumen);

  }

}


// MOSTRAR RESUMEN
function mostrarResumen(data) {

  let pages = data.query.pages;

  let pageId = Object.keys(pages)[0];

  let extract =
    pages[pageId].extract ||
    "No se encontró información sobre este dispositivo.";

  textoInformacion.html(
    "<b>" + etiqueta + "</b><br><br>" + extract
  );

}


// CLASIFICAR VIDEO
function clasificarVideo() {

  if (camaraActiva) {

    clasificador.classify(video, gotResult);

  }

}


// RESULTADOS IA
function gotResult(resultados) {

  if (!camaraActiva) return;

  let objetoDetectado = resultados[0].label;

  objetoDetectado = objetoDetectado.split(",")[0];

  confianza = resultados[0].confidence;

  // SOLO actualizar si encuentra un objeto electrónico
  if (traducciones[objetoDetectado]) {

    etiqueta = traducciones[objetoDetectado];

    // MOSTRAR EN INPUT
    input.value(etiqueta);

    // BUSCAR INFORMACIÓN
    if (confianza > 0.70) {

      buscarWikipedia();

    }

  }

  // REPETIR
  setTimeout(clasificarVideo, 1500);

}


// DRAW
function draw() {

  background(25);

  // TÍTULO
  fill(255);

  textSize(30);

  text("Aprendiendo Electrónica con IA", 20, 40);

  // VIDEO
  if (camaraActiva) {

    image(video, 20, 80, 640, 480);

  } else {

    fill(60);

    rect(20, 80, 640, 480);

    fill(255);

    textSize(32);

    text("Cámara desactivada", 180, 330);

  }

  // MARCO
  noFill();

  stroke(255);

  strokeWeight(3);

  rect(20, 80, 640, 480);

  // DISPOSITIVO
  noStroke();

  fill(0, 255, 0);

  textSize(24);

  text("Dispositivo:", 20, 600);

  fill(255);

  text(etiqueta, 190, 600);

  // CONFIANZA
  fill(0, 200, 255);

  text(
    "Confianza: " +
    nf(confianza * 100, 2, 1) +
    "%",
    450,
    600
  );

}