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
let estadoActual = "INICIO"; // INICIO, ADVERTENCIA, PREGUNTA, RESULTADOS

// Variables para pantalla de preguntas
let imagenes = [];
let indiceFotoActual = 0;
let palabrasUsuario = new Array(12).fill(""); // Array para 12 respuestas
let inputActivo = false;
let inputValor = "";
let todoPreguntado = false;
let cargando = true;
let imagenesListas = 0;

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

function preload() {
  // No precargamos imágenes para mejorar la velocidad inicial
}

function cargarImagenesEnSegundoPlano() {
  // Cargar imágenes una por una en segundo plano
  for (let i = 0; i < 12; i++) {
    imagenes[i] = null; // Inicializar array con nulls
  }
  
  // Empezar a cargar las imágenes de forma asíncrona
  for (let i = 1; i <= 12; i++) {
    let img = loadImage('foto' + i + '.jpg', 
      // Función de éxito
      (imgCargada) => {
        imagenes[i-1] = imgCargada;
        imagenesListas++;
        console.log('Imagen ' + i + ' cargada correctamente');
        
        if (imagenesListas >= 3) { // Solo necesitamos unas pocas para iniciar
          cargando = false;
        }
      },
      // Función de error
      () => {
        console.error('Error al cargar imagen ' + i);
        imagenesListas++;
        
        if (imagenesListas >= 3) {
          cargando = false;
        }
      }
    );
  }
}

function setup() {
  createCanvas(1200, 800);
  centroX = width / 2;
  centroY = height / 2;
  cargarAudio();
  textAlign(CENTER, CENTER);
  cargarImagenesEnSegundoPlano();
}

function draw() {
  if (estadoActual === "INICIO") {
    dibujarPantallaInicio();
  } else if (estadoActual === "ADVERTENCIA") {
    dibujarPantallaAdvertencia();
  } else if (estadoActual === "PREGUNTA") {
    if (cargando && imagenesListas < 3) {
      dibujarPantallaCarga();
    } else {
      dibujarPantallaPregunta();
    }
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
  
  textAlign(CENTER, CENTER);
  
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
    rectMode(CENTER);
    fill(80, 80, 80, 180);
    rect(centroX, centroY + 150, 280, 50, 10);
    textSize(18);
    textStyle(NORMAL);
    fill(255);
    text("Haz clic para iniciar el audio", centroX, centroY + 150);
  }
}

function dibujarPantallaAdvertencia() {
  // Limpiar completamente la pantalla
  background(240);
  
  // Configuración básica de texto
  textAlign(CENTER, CENTER);
  
  // Actualizar efecto de parpadeo para el título
  if (aumentandoAdvertencia) {
    alphaAdvertencia += 5;
    if (alphaAdvertencia >= 255) aumentandoAdvertencia = false;
  } else {
    alphaAdvertencia -= 5;
    if (alphaAdvertencia <= 50) aumentandoAdvertencia = true;
  }
  
  // Dibujar el título con efecto de parpadeo
  textSize(80);
  textStyle(BOLD);
  fill(0, alphaAdvertencia);
  text("ADVERTENCIA", centroX, 200);
  
  // Dibujar el texto principal
  textSize(32);
  textStyle(NORMAL);
  fill(0);
  
  // Primer párrafo
  text("La siguiente será una experiencia que necesita el uso de", centroX, 320);
  text("todos tus sentidos. Por favor, evita distracciones para vivir", centroX, 370);
  text("una interacción totalmente inmersiva.", centroX, 420);
  
  // Segundo párrafo
  text("Recuerda: Las palabras son el reflejo de tus", centroX, 500);
  text("pensamientos. Úsalas con precaución.", centroX, 550);
  
  // Dibujar el botón
  rectMode(CORNER);
  
  let botonX = centroX - 100;
  let botonY = 620;
  let botonAncho = 200;
  let botonAlto = 60;
  
  // Verificar si el mouse está sobre el botón
  sobreBoton = mouseX > botonX && mouseX < botonX + botonAncho && 
               mouseY > botonY && mouseY < botonY + botonAlto;
  
  // Dibujar el botón
  if (sobreBoton) {
    fill(60); // Color más claro cuando el ratón está encima
  } else {
    fill(20); // Color normal
  }
  
  rect(botonX, botonY, botonAncho, botonAlto, 10);
  
  // Texto del botón
  textSize(30);
  textStyle(BOLD);
  fill(255);
  text("Bienvenido", botonX + botonAncho/2, botonY + botonAlto/2);
}

function dibujarPantallaCarga() {
  background(240);
  
  // Texto de carga
  textAlign(CENTER, CENTER);
  textSize(24);
  textStyle(NORMAL);
  fill(0);
  text("Loading...", centroX, centroY);
  
  // Puntos de carga animados
  let numPuntos = (frameCount / 20) % 4;
  let puntos = "";
  for (let i = 0; i < numPuntos; i++) {
    puntos += ".";
  }
  text(puntos, centroX + 80, centroY);
}

function dibujarPantallaPregunta() {
  background(240);
  
  // Cálculo de posiciones basadas en la imagen
  let altoImagen = 400;
  let anchoImagen = 600;
  
  // Posición Y superior de la imagen (considerando que la imagen está centrada)
  let imagenYSuperior = centroY - altoImagen/2;
  // Posición Y inferior de la imagen
  let imagenYInferior = centroY + altoImagen/2;
  
  // Colocar la pregunta justo por encima de la imagen - REAJUSTADO
  let preguntaY = imagenYSuperior - 40; // 40px por encima de la imagen
  
  // Texto de la pregunta en la parte superior
  textAlign(CENTER, CENTER);
  textSize(30);
  textStyle(BOLD);
  fill(0);
  text("¿Qué palabra describe mejor lo que sientes al ver esta fotografía?", centroX, preguntaY);
  
  // Verificar si hay imágenes cargadas
  if (indiceFotoActual < imagenes.length) {
    let img = imagenes[indiceFotoActual];
    if (img && img.width > 0) { // Verificar que la imagen se cargó correctamente
      // Mostrar imagen centrada
      imageMode(CENTER);
      image(img, centroX, centroY, anchoImagen, altoImagen);
    } else {
      // Mostrar mensaje si la imagen no se cargó
      fill(100);
      textSize(24);
      text("Imagen no disponible", centroX, centroY);
    }
  }
  
  // Colocar el campo de respuesta justo debajo de la imagen - REAJUSTADO
  let respuestaY = imagenYInferior + 40; // 40px debajo de la imagen
  
  // Área de respuesta/botón continuar
  let botonX = centroX - 200;
  let botonY = respuestaY;
  let botonAncho = 400;
  let botonAlto = 50;
  
  rectMode(CORNER);
  
  // Cambiar entre área de respuesta y botón continuar
  if (todoPreguntado) {
    // Dibujar el botón Continuar
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      fill(60); // Más claro al pasar el cursor
    } else {
      fill(20); // Color normal
    }
    rect(botonX, botonY, botonAncho, botonAlto, 10);
    
    // Texto del botón
    textSize(20);
    textStyle(BOLD);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Continuar", botonX + botonAncho/2, botonY + botonAlto/2);
  } else {
    // Dibujar el área de respuesta
    fill(255); // Blanco para el área de respuesta
    stroke(200); // Borde gris claro
    strokeWeight(1);
    rect(botonX, botonY, botonAncho, botonAlto, 10);
    noStroke();
    
    // Etiqueta "Respuesta:"
    textSize(20);
    textStyle(NORMAL);
    fill(100);
    textAlign(LEFT, CENTER);
    text("Respuesta:", botonX + 10, botonY + botonAlto/2);
    
    // Texto del usuario
    textSize(20);
    textStyle(NORMAL);
    fill(0);
    textAlign(LEFT, CENTER);
    text(inputValor, botonX + 140, botonY + botonAlto/2);
    
    // Cursor parpadeante
    if (inputActivo && frameCount % 30 < 15) {
      textSize(20);
      text("|", botonX + 140 + textWidth(inputValor), botonY + botonAlto/2);
    }
  }
}

function mousePressed() {
  // Activar audio con el clic
  if (!musicaIniciada) {
    if (audioContext && audioContext.state !== 'running') {
      audioContext.resume().then(() => reproducirAudio());
    } else {
      reproducirAudio();
    }
    return; // No cambiar de pantalla en el primer clic, solo activar audio
  }
  
  // Manejar interacciones según el estado actual
  if (estadoActual === "INICIO") {
    estadoActual = "ADVERTENCIA";
    console.log("Cambiando a pantalla ADVERTENCIA");
  } 
  else if (estadoActual === "ADVERTENCIA") {
    // Verificar clic en botón Bienvenido
    let botonX = centroX - 100;
    let botonY = 620;
    let botonAncho = 200;
    let botonAlto = 60;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      estadoActual = "PREGUNTA";
      console.log("Cambiando a pantalla PREGUNTA");
    }
  }
  else if (estadoActual === "PREGUNTA" && !cargando) {
    // Calcular la posición del botón/campo de respuesta
    let altoImagen = 400;
    let imagenYInferior = centroY + altoImagen/2;
    let respuestaY = imagenYInferior + 40;
    
    // Verificar clic en área de respuesta o botón continuar
    let botonX = centroX - 200;
    let botonY = respuestaY;
    let botonAncho = 400;
    let botonAlto = 50;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      
      if (todoPreguntado) {
        // Acción del botón Continuar
        console.log("Botón Continuar presionado");
        // Aquí iría la transición a RESULTADOS
        console.log("Debería cambiar a pantalla RESULTADOS");
      } else {
        // Activar área de respuesta
        inputActivo = true;
      }
    } else {
      inputActivo = false;
    }
  }
}

function keyPressed() {
  // Capturar texto en la pantalla PREGUNTA
  if (estadoActual === "PREGUNTA" && inputActivo && !todoPreguntado && !cargando) {
    if (keyCode === ENTER || keyCode === RETURN) {
      guardarRespuestaYAvanzar();
    } 
    else if (keyCode === BACKSPACE) {
      if (inputValor.length > 0) {
        inputValor = inputValor.substring(0, inputValor.length - 1);
      }
    } 
    else if (keyCode === 32 || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122) || 
            (keyCode >= 48 && keyCode <= 57) || keyCode === 192 || keyCode === 189) {
      if (inputValor.length < 20) { // Limitar longitud
        inputValor += key;
      }
    }
  }
}

function guardarRespuestaYAvanzar() {
  if (inputValor.trim() !== "") {
    // Guardar respuesta
    palabrasUsuario[indiceFotoActual] = inputValor.trim();
    console.log("Respuesta guardada para foto " + (indiceFotoActual + 1) + ": " + inputValor);
    
    // Limpiar campo
    inputValor = "";
    
    // Avanzar a la siguiente imagen
    indiceFotoActual++;
    
    // Verificar si hemos llegado al final (guardamos la respuesta pero no cambiamos a la siguiente imagen)
    if (indiceFotoActual >= 12) {
      todoPreguntado = true;
      indiceFotoActual = 11; // Mantener en la última imagen
      console.log("Todas las preguntas completadas");
    }
  }
}

function touchStarted() {
  mousePressed();
  return false;
}
