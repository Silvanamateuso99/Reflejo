// Variables globales
let alpha = 0;
let aumentando = true;
let sombraOffsetX = 6, sombraOffsetY = -12;
let centroX, centroY;

// Variables para la pantalla de advertencia
let alphaAdvertencia = 0;
let aumentandoAdvertencia = true;
let sobreBoton = false;

// Variables para audio
let audioContext;
let audioBuffer;
let audioSource;
let musicaIniciada = false;

// Estado actual de la aplicación
let estadoActual = "INICIO"; // INICIO, ADVERTENCIA

// Cargar audio
function cargarAudio() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    fetch('goldenratio.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(buffer => {
        audioBuffer = buffer;
        console.log('Audio cargado correctamente');
      })
      .catch(error => {
        console.error('Error al cargar audio:', error);
      });
  } catch (e) {
    console.error('Error al configurar audio:', e);
  }
}

// Intentar reproducir audio
function reproducirAudio() {
  if (audioContext && audioBuffer && !musicaIniciada) {
    try {
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.loop = true;
      audioSource.connect(audioContext.destination);
      audioSource.start(0);
      musicaIniciada = true;
      console.log('Música iniciada correctamente');
    } catch (e) {
      console.error('Error al reproducir audio:', e);
    }
  }
}

function setup() {
  createCanvas(1200, 800);
  textAlign(CENTER, CENTER);
  centroX = width / 2;
  centroY = height / 2;
  cargarAudio();
}

function draw() {
  if (estadoActual === "INICIO") {
    dibujarPantallaInicio();
  } else if (estadoActual === "ADVERTENCIA") {
    dibujarPantallaAdvertencia();
  }
}

function dibujarPantallaInicio() {
  background(240);
  
  // Ajustar la opacidad para el efecto de desvanecimiento
  if (aumentando) {
    alpha += 5;
    if (alpha >= 255) aumentando = false;
  } else {
    alpha -= 5;
    if (alpha <= 50) aumentando = true;
  }
  
  // Texto "REFLEJO" con efectos
  textSize(150);
  textStyle(BOLD);
  
  // Sombras
  for (let i = 5; i > 0; i--) {
    fill(50 + i * 30, alpha - i * 25);
    text("REFLEJO", centroX - i * sombraOffsetX, centroY - i * sombraOffsetY);
  }
  
  // Texto principal
  fill(0, alpha);
  text("REFLEJO", centroX, centroY);
  
  // Mensaje para activar audio (más pequeño como solicitaste)
  if (!musicaIniciada) {
    textSize(18);  // Tamaño de texto más pequeño
    textStyle(NORMAL);
    fill(80, 80, 80, 180);  // Color más suave y semi-transparente
    rectMode(CENTER);
    rect(centroX, centroY + 150, 280, 50, 10);  // Botón más pequeño
    fill(255);
    text("Haz clic para iniciar el audio", centroX, centroY + 150);
  }
}

function dibujarPantallaAdvertencia() {
  background(240);
  
  // Efecto de desvanecimiento en "ADVERTENCIA"
  if (aumentandoAdvertencia) {
    alphaAdvertencia += 5;
    if (alphaAdvertencia >= 255) aumentandoAdvertencia = false;
  } else {
    alphaAdvertencia -= 5;
    if (alphaAdvertencia <= 50) aumentandoAdvertencia = true;
  }
  
  // Asegurar que el texto esté centrado
  textAlign(CENTER, CENTER);
  
  // Mostrar título con efecto de desvanecimiento
  textSize(80);
  textStyle(BOLD);
  fill(0, alphaAdvertencia);
  text("ADVERTENCIA", centroX, height * 0.2); // Ajuste de posición del título
  
  // Texto principal
  textSize(32);
  textStyle(NORMAL);
  fill(0);
  
  // Texto principal alineado y ajustado en posición
  let textoExplicativo = "La siguiente será una experiencia que necesita el uso de todos tus sentidos. Por favor, evita distracciones para vivir una interacción totalmente inmersiva.\n\nRecuerda: Las palabras son el reflejo de tus pensamientos. Úsalas con precaución.";
  
  // Dibujar el texto con posición ajustada
  text(textoExplicativo, centroX, height * 0.45, width * 0.8, height * 0.3);
  
  // Crear botón "Bienvenido"
  let botonX = centroX - 100; // Usar centroX para centrar mejor
  let botonY = height * 0.8;
  let botonAncho = 200;
  let botonAlto = 60;
  
  // Detectar si el mouse está sobre el botón
  sobreBoton = mouseX > botonX && mouseX < botonX + botonAncho && 
               mouseY > botonY && mouseY < botonY + botonAlto;
  
  // Restablecer el modo de rectángulo
  rectMode(CORNER);
  
  // Dibujar botón con efecto de aclarado al pasar el mouse
  if (sobreBoton) {
    fill(60); // Color más claro cuando el cursor está encima
  } else {
    fill(20); // Color base del botón
  }
  rect(botonX, botonY, botonAncho, botonAlto, 10);
  
  // Texto del botón
  textSize(30);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(255);
  text("Bienvenido", botonX + botonAncho / 2, botonY + botonAlto / 2);
}
