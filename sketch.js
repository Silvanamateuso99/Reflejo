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
let estadoActual = "INICIO"; // INICIO, ADVERTENCIA, PREGUNTA

// Variables para pantalla de preguntas
let imagenes = [];
let indiceFotoActual = 0;
let palabrasUsuario = [];
let inputActivo = false;
let inputValor = "";
let mensajeError = "";
let mostrarError = false;
let tiempoError = 0;

// Cargar audio e imágenes
function preload() {
  // Precargar imágenes
  for (let i = 1; i <= 12; i++) {
    let nombreArchivo = 'foto' + i + '.jpg';
    try {
      let img = loadImage(nombreArchivo);
      imagenes.push(img);
      console.log('Imagen cargada: ' + nombreArchivo);
    } catch (e) {
      console.error('Error al cargar imagen: ' + nombreArchivo);
    }
  }
}

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
  centroX = width / 2;
  centroY = height / 2;
  cargarAudio();
  textAlign(CENTER, CENTER);
}

function draw() {
  if (estadoActual === "INICIO") {
    dibujarPantallaInicio();
  } else if (estadoActual === "ADVERTENCIA") {
    dibujarPantallaAdvertencia();
  } else if (estadoActual === "PREGUNTA") {
    dibujarPantallaPregunta();
  }
  
  // Manejar temporizador de mensajes de error
  if (mostrarError && millis() > tiempoError + 3000) {
    mostrarError = false;
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
  
  // Dibujar el título con efecto de parpadeo - AJUSTADO MÁS ABAJO
  textSize(80);
  textStyle(BOLD);
  fill(0, alphaAdvertencia);
  text("ADVERTENCIA", centroX, 200); // Ajustado de 150 a 200
  
  // Dibujar el texto principal - TODOS AJUSTADOS MÁS ABAJO
  textSize(32);
  textStyle(NORMAL);
  fill(0);
  
  // Primer párrafo - AJUSTADO
  text("La siguiente será una experiencia que necesita el uso de", centroX, 320); // Ajustado de 250 a 320
  text("todos tus sentidos. Por favor, evita distracciones para vivir", centroX, 370); // Ajustado de 300 a 370 
  text("una interacción totalmente inmersiva.", centroX, 420); // Ajustado de 350 a 420
  
  // Espacio entre párrafos
  
  // Segundo párrafo - AJUSTADO
  text("Recuerda: Las palabras son el reflejo de tus", centroX, 500); // Ajustado de 450 a 500
  text("pensamientos. Úsalas con precaución.", centroX, 550); // Ajustado de 500 a 550
  
  // Dibujar el botón (modo CORNER para precisión) - AJUSTADO MÁS CERCA DEL TEXTO
  rectMode(CORNER);
  
  let botonX = centroX - 100;
  let botonY = 620; // Ajustado de 650 a 620 para estar más cerca del último párrafo
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

function dibujarPantallaPregunta() {
  background(240);
  
  // Verificar si hay imágenes cargadas
  if (imagenes.length > 0 && indiceFotoActual < imagenes.length) {
    // Mostrar la imagen actual
    let img = imagenes[indiceFotoActual];
    if (img && img.width > 0) { // Verificar que la imagen se cargó correctamente
      // Calcular dimensiones manteniendo proporción
      let imgAncho, imgAlto;
      if (img.width > img.height) {
        imgAncho = min(width * 0.7, img.width);
        imgAlto = img.height * (imgAncho / img.width);
      } else {
        imgAlto = min(height * 0.5, img.height);
        imgAncho = img.width * (imgAlto / img.height);
      }
      
      // Mostrar imagen centrada
      imageMode(CENTER);
      image(img, centroX, height * 0.3, imgAncho, imgAlto);
    } else {
      // Mostrar mensaje si la imagen no se cargó
      fill(100);
      textSize(24);
      text("Imagen no disponible", centroX, height * 0.3);
    }
  }
  
  // Título de la pantalla
  textAlign(CENTER, CENTER);
  textSize(36);
  textStyle(BOLD);
  fill(0);
  text("¿Qué palabra viene a tu mente?", centroX, height * 0.6);
  
  // Campo de entrada
  let campoX = centroX;
  let campoY = height * 0.7;
  let campoAncho = 300;
  let campoAlto = 50;
  
  rectMode(CENTER);
  if (inputActivo) {
    fill(255);
    stroke(0, 120, 255);
    strokeWeight(3);
  } else {
    fill(255);
    stroke(180);
    strokeWeight(1);
  }
  rect(campoX, campoY, campoAncho, campoAlto, 8);
  noStroke();
  
  // Texto dentro del campo
  fill(0);
  textSize(24);
  textStyle(NORMAL);
  text(inputValor, campoX, campoY);
  
  // Cursor parpadeante
  if (inputActivo && frameCount % 60 < 30) {
    let cursorX = campoX + textWidth(inputValor) / 2;
    // Limitar posición del cursor
    if (textWidth(inputValor) > campoAncho - 20) {
      cursorX = campoX + (campoAncho / 2) - 10;
    }
    stroke(0);
    strokeWeight(2);
    line(cursorX + 5, campoY - 15, cursorX + 5, campoY + 15);
    noStroke();
  }
  
  // Botón Continuar
  let botonX = centroX - 100;
  let botonY = height * 0.8;
  let botonAncho = 200;
  let botonAlto = 50;
  
  rectMode(CORNER);
  let sobreBotonContinuar = mouseX > botonX && mouseX < botonX + botonAncho && 
                           mouseY > botonY && mouseY < botonY + botonAlto;
  
  fill(sobreBotonContinuar ? 60 : 20);
  rect(botonX, botonY, botonAncho, botonAlto, 10);
  
  fill(255);
  textSize(24);
  textStyle(BOLD);
  text("Continuar", botonX + botonAncho/2, botonY + botonAlto/2);
  
  // Mostrar mensaje de error si existe
  if (mostrarError) {
    fill(200, 30, 30);
    textSize(18);
    textStyle(NORMAL);
    text(mensajeError, centroX, height * 0.75);
  }
  
  // Mostrar contador de imágenes
  fill(100);
  textSize(16);
  text("Imagen " + (indiceFotoActual + 1) + " de " + imagenes.length, centroX, height * 0.15);
  
  // Mostrar contador de palabras ingresadas
  text("Palabras ingresadas: " + palabrasUsuario.length, centroX, height * 0.9);
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
  
  // Manejar las interacciones según el estado actual
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
  else if (estadoActual === "PREGUNTA") {
    // Verificar clic en campo de entrada
    let campoX = centroX;
    let campoY = height * 0.7;
    let campoAncho = 300;
    let campoAlto = 50;
    
    if (mouseX > campoX - campoAncho/2 && mouseX < campoX + campoAncho/2 && 
        mouseY > campoY - campoAlto/2 && mouseY < campoY + campoAlto/2) {
      inputActivo = true;
    } else {
      inputActivo = false;
    }
    
    // Verificar clic en botón Continuar
    let botonX = centroX - 100;
    let botonY = height * 0.8;
    let botonAncho = 200;
    let botonAlto = 50;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      confirmarPalabra();
    }
  }
}

function keyPressed() {
  // Capturar texto en el campo de entrada
  if (estadoActual === "PREGUNTA" && inputActivo) {
    if (keyCode === ENTER || keyCode === RETURN) {
      confirmarPalabra();
    } 
    else if (keyCode === BACKSPACE) {
      if (inputValor.length > 0) {
        inputValor = inputValor.substring(0, inputValor.length - 1);
      }
    } 
    else if (keyCode === 32 || (keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122) || 
            (keyCode >= 48 && keyCode <= 57) || keyCode === 192 || keyCode === 189) {
      // Permitir letras, números, espacio y algunos caracteres especiales
      if (inputValor.length < 20) { // Limitar longitud
        inputValor += key;
      }
    }
  }
}

function confirmarPalabra() {
  // Validar la entrada
  if (inputValor.trim() === "") {
    mostrarError = true;
    mensajeError = "Ingresa una palabra antes de continuar";
    tiempoError = millis();
    return;
  }
  
  // Guardar la palabra y avanzar
  palabrasUsuario.push(inputValor.trim());
  inputValor = "";
  inputActivo = false;
  
  console.log("Palabra guardada: " + palabrasUsuario[palabrasUsuario.length - 1]);
  
  // Avanzar a la siguiente imagen
  indiceFotoActual++;
  
  // Si hemos llegado al final de las imágenes, volver a la primera
  if (indiceFotoActual >= imagenes.length) {
    indiceFotoActual = 0;
    console.log("Volviendo a la primera imagen");
  }
}

function touchStarted() {
  mousePressed();
  return false;
}
