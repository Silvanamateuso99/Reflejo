// Variables globales
let alpha = 0;
let aumentando = true;
let sombraOffsetX = 6, sombraOffsetY = -12;
let centroX, centroY;

// Estado actual de la aplicación
let estadoActual = "ACTIVACION"; // ACTIVACION, INICIO, ADVERTENCIA, PREGUNTA, RESULTADOS

// Variables para la pantalla de advertencia
let alphaAdvertencia = 0;
let aumentandoAdvertencia = true;
let sobreBoton = false;

// Variables para instrucciones de activación
let alphaActivacion = 0;
let mostrarInstruccionesActivacion = true;

// Variables para audio
let audioContext;
let audioBuffer;
let audioSource;
let musicaIniciada = false;

// Cargar audio usando Fetch API y Web Audio API
function cargarAudio() {
  // Crear contexto de audio si aún no existe
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Obtener el archivo de audio usando fetch
  fetch('goldenratio.mp3')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el audio');
      }
      return response.arrayBuffer();
    })
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(buffer => {
      audioBuffer = buffer;
      console.log('✅ Audio cargado correctamente');
    })
    .catch(error => {
      console.error('❌ Error al cargar audio:', error);
    });
}

// Reproducir audio
function reproducirAudio() {
  if (audioContext && audioBuffer && !musicaIniciada) {
    // Crear fuente de audio
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.loop = true;
    audioSource.connect(audioContext.destination);
    
    // Iniciar reproducción
    audioSource.start(0);
    musicaIniciada = true;
    console.log('🎵 Música iniciada correctamente');
  }
}

function setup() {
  // Crear lienzo
  createCanvas(1200, 800);
  
  // Definir el centro de la pantalla
  centroX = width / 2;
  centroY = height / 2;
  
  // Configuración de texto
  textAlign(CENTER, CENTER);
  
  // Cargar audio al inicio
  cargarAudio();
  
  // Iniciar en pantalla de activación que se superpone a la pantalla INICIO
  estadoActual = "ACTIVACION";
  console.log("Iniciando en pantalla ACTIVACION sobre INICIO");
}

function draw() {
  // Primero dibujar la pantalla INICIO como fondo
  dibujarPantallaInicio();
  
  // Determinar si se deben mostrar instrucciones de activación o el resto de estados
  if (estadoActual === "ACTIVACION" && mostrarInstruccionesActivacion) {
    mostrarInstruccionesActivacion();
  } else if (estadoActual === "ADVERTENCIA") {
    dibujarPantallaAdvertencia();
  }
  // Futuros estados se agregarían aquí
}

function mostrarInstruccionesActivacion() {
  // Efecto de parpadeo suave para las instrucciones
  alphaActivacion = 127 + 127 * sin(frameCount * 0.05);
  
  // Panel semi-transparente para instrucciones (sutil)
  noStroke();
  fill(255, 200); // Blanco semi-transparente
  rectMode(CENTER);
  rect(centroX, centroY, 600, 150, 15); // Panel redondeado
  
  // Instrucciones para hacer clic
  textSize(28);
  textStyle(BOLD);
  fill(20, 20, 100, alphaActivacion); // Azul oscuro con efecto de parpadeo
  text("HAGA CLIC PARA INICIAR LA EXPERIENCIA", centroX, centroY - 15);
  
  // Nota sobre audio
  textSize(16);
  textStyle(NORMAL);
  fill(80, 80, 80);
  text("(Se activará el audio como parte de la experiencia)", centroX, centroY + 25);
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
  
  // Configurar texto para "REFLEJO"
  textSize(150);
  textStyle(BOLD);
  
  // Sombras dinámicas sutiles
  for (let i = 5; i > 0; i--) {
    fill(50 + i * 30, alpha - i * 25);
    text("REFLEJO", centroX - i * sombraOffsetX, centroY - i * sombraOffsetY);
  }
  
  // Texto principal con efecto de desvanecimiento
  fill(0, alpha);
  text("REFLEJO", centroX, centroY);
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
  
  // Mostrar título con efecto de desvanecimiento
  textSize(80);
  textStyle(BOLD);
  fill(0, alphaAdvertencia);
  text("ADVERTENCIA", width / 2, height / 4);
  
  // Texto principal
  textSize(32);
  textStyle(NORMAL);
  
  // Texto principal alineado
  fill(0);
  textAlign(CENTER, TOP);
  text("La siguiente será una experiencia que necesita el uso de todos tus sentidos. Por favor, evita distracciones para vivir una interacción totalmente inmersiva.\n\nRecuerda: Las palabras son el reflejo de tus pensamientos. Úsalas con precaución.", 
       width * 0.15, height / 2.5, width * 0.7, height / 3);
  
  // Crear botón "Bienvenido"
  let botonX = width / 2 - 100;
  let botonY = height * 0.8;
  let botonAncho = 200;
  let botonAlto = 60;
  
  // Detectar si el mouse está sobre el botón
  sobreBoton = mouseX > botonX && mouseX < botonX + botonAncho && 
               mouseY > botonY && mouseY < botonY + botonAlto;
  
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

function mousePressed() {
  if (estadoActual === "ACTIVACION" && mostrarInstruccionesActivacion) {
    // Iniciar contexto de audio y reproducir música
    if (audioContext && audioContext.state !== 'running') {
      audioContext.resume()
        .then(() => {
          console.log('AudioContext reanudado');
          reproducirAudio(); 
        })
        .catch(error => console.error('Error al reanudar AudioContext:', error));
    } else {
      reproducirAudio();
    }
    
    // Ocultar instrucciones de activación y permitir la transición al siguiente estado
    mostrarInstruccionesActivacion = false;
    console.log("Instrucciones de activación ocultadas, mostrando INICIO (REFLEJO)");
  }
  else if (estadoActual === "ACTIVACION" && !mostrarInstruccionesActivacion) {
    // Transición a pantalla de advertencia
    estadoActual = "ADVERTENCIA";
    console.log("Cambiando a pantalla de ADVERTENCIA");
  } 
  else if (estadoActual === "ADVERTENCIA" && sobreBoton) {
    // En una versión completa, aquí iría la transición a la siguiente pantalla
    console.log("Botón BIENVENIDO presionado");
  }
}

function touchStarted() {
  // Asegurar que el audio funcione en dispositivos móviles también
  mousePressed();
  return false; // Prevenir acciones por defecto del navegador
}
