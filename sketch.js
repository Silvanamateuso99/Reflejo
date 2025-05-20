// Variables globales
let musicaFondo;
let musicaIniciada = false;
let alpha = 0;
let aumentando = true;
let sombraOffsetX = 6, sombraOffsetY = -12;
let centroX, centroY;

// Estado actual de la aplicación - Comenzar con una pantalla de bienvenida
let estadoActual = "BIENVENIDA"; // BIENVENIDA, INICIO, ADVERTENCIA, PREGUNTA, RESULTADOS

// Variables para la pantalla de advertencia
let alphaAdvertencia = 0;
let aumentandoAdvertencia = true;
let sobreBoton = false;

// Precargar recursos
function preload() {
  // Intentar cargar el audio (requiere interacción del usuario en muchos navegadores)
  soundFormats('mp3');
  try {
    musicaFondo = loadSound('goldenratio.mp3');
    console.log('Audio precargado correctamente');
  } catch (e) {
    console.log('Error al cargar audio: ' + e.message);
  }
}

function setup() {
  // Crear lienzo de 1200x800 como en tu versión original
  createCanvas(1200, 800);
  
  // Definir el centro de la pantalla
  centroX = width / 2;
  centroY = height / 2;
  
  // Configuración de texto
  textAlign(CENTER, CENTER);
  
  // Iniciar en pantalla de bienvenida
  estadoActual = "BIENVENIDA";
  console.log("Iniciando en pantalla BIENVENIDA");
}

function draw() {
  // Determinar qué pantalla mostrar según el estado actual
  if (estadoActual === "BIENVENIDA") {
    dibujarPantallaBienvenida();
  } else if (estadoActual === "INICIO") {
    dibujarPantallaInicio();
  } else if (estadoActual === "ADVERTENCIA") {
    dibujarPantallaAdvertencia();
  }
  
  // Debug en consola (solo la primera vez)
  if (frameCount === 1) {
    console.log("Estado actual: " + estadoActual);
  }
}

function dibujarPantallaBienvenida() {
  background(20); // Fondo oscuro para la pantalla de bienvenida
  
  // Título
  textSize(100);
  textStyle(BOLD);
  fill(255);
  text("REFLEJO", centroX, centroY - 150);
  
  // Instrucciones
  textSize(24);
  textStyle(NORMAL);
  fill(220);
  text("Esta obra utiliza audio como parte de la experiencia", centroX, centroY - 20);
  
  // Instrucción específica de audio
  textSize(28);
  textStyle(BOLD);
  fill(255, 200, 100);
  text("HAGA CLIC AQUÍ PARA COMENZAR LA EXPERIENCIA", centroX, centroY + 50);
  
  // Nota adicional
  textSize(18);
  fill(180);
  text("(Al hacer clic, permitirá la reproducción de audio)", centroX, centroY + 100);
  
  // Efecto de parpadeo para el botón
  if (frameCount % 60 < 30) {
    stroke(255);
    strokeWeight(3);
    noFill();
    ellipse(centroX, centroY + 50, 450, 70);
    noStroke();
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

// Manejar clic del mouse para transiciones entre pantallas
function mousePressed() {
  if (estadoActual === "BIENVENIDA") {
    // Intentar iniciar el audio con la interacción del usuario
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume().then(() => {
        console.log("AudioContext reanudado después de interacción");
      });
    }
    
    // Intentar reproducir música
    if (musicaFondo && !musicaIniciada) {
      try {
        musicaFondo.play();
        musicaFondo.loop();
        musicaIniciada = true;
        console.log("🎵 Música iniciada con interacción del usuario");
      } catch (e) {
        console.error("Error al iniciar música:", e);
      }
    }
    
    // Transición a la pantalla INICIO
    estadoActual = "INICIO";
    console.log("Cambiando a pantalla INICIO (REFLEJO)");
  }
  else if (estadoActual === "INICIO") {
    // Transición a pantalla de advertencia
    estadoActual = "ADVERTENCIA";
    console.log("Cambiando a pantalla de ADVERTENCIA");
  } 
  else if (estadoActual === "ADVERTENCIA" && sobreBoton) {
    // En una versión completa, aquí iría la transición a la siguiente pantalla
    console.log("Botón BIENVENIDO presionado");
    // Podríamos implementar más pantallas gradualmente
  }
}

// Función adicional para garantizar que el audio pueda reproducirse en dispositivos móviles
function touchStarted() {
  if (estadoActual === "BIENVENIDA") {
    // Reanudar contexto de audio tras interacción táctil
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
      console.log("AudioContext reanudado después de interacción táctil");
    }
    
    if (musicaFondo && !musicaIniciada) {
      try {
        musicaFondo.play();
        musicaFondo.loop();
        musicaIniciada = true;
        console.log("🎵 Música iniciada con interacción táctil");
      } catch (e) {
        console.error("Error al iniciar música (táctil):", e);
      }
    }
  }
  return false; // Prevenir acciones por defecto del navegador
}
