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

// Variables para pantalla de resultados/dibujo
let palabrasDisponibles = [];
let palabraActual = 0;
let distanciaEntrePalabras = 30; // Controla qué tan juntas aparecen las palabras
let ultimaPosicion;
let dibujando = false;
let lienzo; // Canvas para dibujar y guardar

// Opciones de personalización
let fuentes = ["Verdana", "Georgia", "Times New Roman", "Arial", "Courier New"];
let fuenteSeleccionada = 0;
let tamanoTexto = 24;
let colorTexto;
let mostrarControles = true;
let mensajeSalvado = false;
let tiempoMensaje = 0;

// SISTEMA SIMPLIFICADO - Variables para debug desactivado
let modoDebug = false; // DESACTIVADO para quitar los círculos rojos
let offsetX = 0;
let offsetY = 0;

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
  
  // Inicializar variables para la pantalla de resultados
  colorTexto = color(0); // Negro por defecto
  ultimaPosicion = createVector(0, 0);
  
  // Crear lienzo para dibujo
  lienzo = createGraphics(width, height);
  lienzo.background(255);
  
  // Palabras de prueba si no tenemos ninguna
  if (palabrasUsuario.every(p => p === "")) {
    palabrasUsuario[0] = "Reflejo";
    palabrasUsuario[1] = "Arte";
    palabrasUsuario[2] = "Digital";
    palabrasUsuario[3] = "Interactivo";
  }
  
  // Inicializar palabras disponibles
  prepararPalabras();
}

function prepararPalabras() {
  palabrasDisponibles = [];
  
  // Filtrar palabras no vacías
  for (let palabra of palabrasUsuario) {
    if (palabra !== null && palabra.trim() !== "") {
      palabrasDisponibles.push(palabra);
    }
  }
  
  // Si no hay palabras, añadir palabra por defecto
  if (palabrasDisponibles.length === 0) {
    palabrasDisponibles.push("Reflejo");
  }
  
  console.log("Palabras disponibles:", palabrasDisponibles);
}

// FUNCIÓN - Verificar si el canvas está escalado
function verificarCanvas() {
  let canvas = document.querySelector('canvas');
  if (canvas) {
    let rect = canvas.getBoundingClientRect();
    console.log("Canvas info:", {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      displayWidth: rect.width,
      displayHeight: rect.height,
      scaleX: canvas.width / rect.width,
      scaleY: canvas.height / rect.height,
      offsetLeft: rect.left,
      offsetTop: rect.top
    });
  }
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
  } else if (estadoActual === "RESULTADOS") {
    dibujarPantallaResultados();
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
  
  // Colocar la pregunta justo por encima de la imagen
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
  
  // Colocar el campo de respuesta justo debajo de la imagen
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

function dibujarPantallaResultados() {
  background(255);
  
  // Mostrar el lienzo con las palabras dibujadas
  image(lienzo, 0, 0);
  
  // Panel lateral si está visible
  if (mostrarControles) {
    dibujarPanelLateral();
  } else {
    dibujarFlechaPanel();
  }
  
  // Mensaje de guardado si está activo
  if (mensajeSalvado) {
    mostrarMensajeGuardado();
  }
}

// FUNCIÓN COMPLETAMENTE REDISEÑADA - Panel más bajo con mejor espaciado
function dibujarPanelLateral() {
  // Panel izquierdo - movido más abajo
  fill(240);
  stroke(200);
  rect(10, 100, 250, 650, 10); // Posición más baja y altura aumentada
  
  // Título - asegurando que esté visible desde el inicio
  fill(0);
  textFont('Verdana');
  textSize(18);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text("¡A Dibujar!", 135, 115);
  
  // Instrucciones - con más espacio
  textSize(11);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  fill(80);
  text("Mantén presionado el botón del mouse y mueve el cursor para dibujar con tus palabras.", 20, 145, 230, 40);
  
  // Recuadro de palabras - más espaciado
  fill(255);
  stroke(200);
  rect(20, 195, 230, 90, 5);
  
  // Mostrar palabras disponibles
  textSize(12);
  textAlign(LEFT, TOP);
  fill(0);
  let y = 205;
  let contador = 0;
  
  for (let palabra of palabrasDisponibles) {
    text(palabra, 30, y);
    y += 17; // Más espacio entre palabras
    contador++;
    if (contador >= 5) break;
  }
  
  if (contador === 0) {
    fill(100);
    text("No hay palabras disponibles", 30, 220);
  }
  
  // CONTROLES - con más espaciado
  let baseY = 310; // Posición base de los controles
  let espaciado = 45; // Más espacio entre controles
  
  // Tipografía
  fill(0);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Tipografía:", 20, baseY);
  
  fill(255);
  stroke(200);
  rect(90, baseY - 12, 150, 24, 5);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(fuentes[fuenteSeleccionada], 165, baseY);
  
  // Tamaño
  baseY += espaciado;
  textAlign(LEFT, CENTER);
  text("Tamaño:", 20, baseY);
  
  fill(40);
  rect(90, baseY - 12, 25, 24, 5); // Botón -
  rect(125, baseY - 12, 25, 24, 5); // Botón +
  fill(255);
  textAlign(CENTER, CENTER);
  text("-", 102, baseY);
  text("+", 137, baseY);
  fill(0);
  text(tamanoTexto, 180, baseY);
  
  // Densidad
  baseY += espaciado;
  textAlign(LEFT, CENTER);
  text("Densidad:", 20, baseY);
  
  fill(40);
  rect(90, baseY - 12, 25, 24, 5); // Botón -
  rect(125, baseY - 12, 25, 24, 5); // Botón +
  fill(255);
  textAlign(CENTER, CENTER);
  text("-", 102, baseY);
  text("+", 137, baseY);
  fill(0);
  let densidadMostrada = int(map(distanciaEntrePalabras, 10, 50, 10, 1));
  text(densidadMostrada, 180, baseY);
  
  // Color
  baseY += espaciado;
  textAlign(LEFT, CENTER);
  fill(0);
  text("Color:", 20, baseY);
  
  // Primera fila de colores
  colorMuestra(90, baseY - 12, color(0));         // Negro
  colorMuestra(130, baseY - 12, color(255, 0, 0)); // Rojo
  colorMuestra(170, baseY - 12, color(0, 0, 255)); // Azul
  
  // Segunda fila de colores - ajustada para estar justo debajo
  colorMuestra(90, baseY + 18, color(0, 128, 0));   // Verde
  colorMuestra(130, baseY + 18, color(128, 0, 128)); // Morado
  colorMuestra(170, baseY + 18, color(255, 165, 0)); // Naranja
  
  // Instrucciones de uso - más espaciadas
  baseY += espaciado + 30; // Más espacio después de los colores
  fill(0);
  textAlign(LEFT, TOP);
  textSize(12);
  textStyle(BOLD);
  text("Cómo usar:", 20, baseY);
  textStyle(NORMAL);
  textSize(11);
  text("1. Presiona y arrastra para dibujar\n2. Ajusta densidad, estilo y color\n3. Realiza múltiples trazos\n4. Guarda tu creación", 20, baseY + 25, 230, 80);
  
  // Botones - posicionados con mayor espaciado
  let guardarY = 610; // Posición Y para el botón guardar, asegurando espacio
  
  // Botón para guardar
  fill(20);
  rect(20, guardarY, 230, 35, 5);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Guardar Mi Creación", 135, guardarY + 17);
  
  // Botón para ocultar controles - justo debajo del anterior
  fill(150);
  rect(20, guardarY + 45, 230, 25, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Ocultar Panel", 135, guardarY + 45 + 12);
}

// FUNCIÓN MODIFICADA para el tamaño del color
function colorMuestra(x, y, c) {
  stroke(0);
  fill(c);
  rect(x, y, 25, 20); // Tamaño reducido
  if (red(c) === red(colorTexto) && 
      green(c) === green(colorTexto) && 
      blue(c) === blue(colorTexto)) {
    noFill();
    stroke(255, 0, 0);
    rect(x-2, y-2, 29, 24);
  }
}

// FUNCIÓN CORREGIDA para mostrar la flecha del panel a la misma altura que el panel
function dibujarFlechaPanel() {
  // Fondo para la flecha - ahora a la misma altura que el panel principal
  fill(240);
  stroke(200);
  rect(0, 100, 50, 80, 0, 10, 10, 0); // Y=100 para que coincida con el panel
  
  // Dibujar flecha simple
  fill(40);
  noStroke();
  // Triángulo (flecha)
  triangle(15, 120, 35, 140, 15, 160); // Ajustado en Y
  // Rectángulo (base)
  rect(5, 135, 10, 10); // Ajustado en Y
  
  // Texto pequeño debajo
  fill(40);
  textAlign(CENTER);
  textSize(10);
  text("Panel", 25, 175); // Ajustado en Y
}

function mostrarMensajeGuardado() {
  tiempoMensaje++;
  
  if (tiempoMensaje > 90) { // 3 segundos a 30 fps
    mensajeSalvado = false;
    tiempoMensaje = 0;
    return;
  }
  
  // Mensaje de guardado exitoso
  fill(0, 150, 0, 200);
  noStroke();
  rect(width/2 - 150, height/2 - 50, 300, 100, 10);
  fill(255);
  textSize(30);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("¡Creación guardada!", width/2, height/2);
}

// FUNCIÓN COMPLETAMENTE NUEVA - Sin círculos verdes, con enfoque directo
function dibujarPalabra(x, y) {
  // Verificar que tengamos palabras disponibles
  if (palabrasDisponibles.length === 0) {
    prepararPalabras();
    if (palabrasDisponibles.length === 0) return;
  }
  
  // Obtener la siguiente palabra
  palabraActual = (palabraActual + 1) % palabrasDisponibles.length;
  let palabra = palabrasDisponibles[palabraActual];
  
  // SIN CÍRCULOS DEBUG
  
  // Configuración para dibujar texto
  textSize(tamanoTexto);
  textFont(fuentes[fuenteSeleccionada]);
  fill(colorTexto);
  textAlign(CENTER, CENTER);
  
  // Dibujar en el canvas principal
  text(palabra, x, y);
  
  // Dibujar en el lienzo secundario
  lienzo.textSize(tamanoTexto);
  lienzo.textFont(fuentes[fuenteSeleccionada]);
  lienzo.fill(colorTexto);
  lienzo.textAlign(CENTER, CENTER);
  lienzo.text(palabra, x, y);
  
  console.log("Palabra dibujada:", palabra, "en coordenadas:", x, y);
}

function guardarCreacion() {
  saveCanvas(lienzo, 'mi_creacion_reflejo', 'png');
  mensajeSalvado = true;
  tiempoMensaje = 0;
  console.log("Creación guardada como: mi_creacion_reflejo.png");
}

// FUNCIÓN SIMPLIFICADA - Área dibujable más amplia
function estaEnAreaDibujable(x, y) {
  let minX = mostrarControles ? 280 : 70;
  let maxX = width - 20;
  let minY = 20;
  let maxY = height - 20;
  
  let resultado = (x > minX && x < maxX && y > minY && y < maxY);
  
  console.log("Área dibujable check:", {
    x: x,
    y: y,
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    resultado: resultado
  });
  
  return resultado;
}

// FUNCIÓN MOUSEPRESSED SIMPLIFICADA - Usar mouseX y mouseY directamente
function mousePressed() {
  // Audio y estados anteriores (sin cambios)
  if (!musicaIniciada) {
    if (audioContext && audioContext.state !== 'running') {
      audioContext.resume().then(() => reproducirAudio());
    } else {
      reproducirAudio();
    }
    return;
  }
  
  if (estadoActual === "INICIO") {
    estadoActual = "ADVERTENCIA";
    console.log("Cambiando a pantalla ADVERTENCIA");
  } 
  else if (estadoActual === "ADVERTENCIA") {
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
    let altoImagen = 400;
    let imagenYInferior = centroY + altoImagen/2;
    let respuestaY = imagenYInferior + 40;
    
    let botonX = centroX - 200;
    let botonY = respuestaY;
    let botonAncho = 400;
    let botonAlto = 50;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      
      if (todoPreguntado) {
        estadoActual = "RESULTADOS";
        console.log("Cambiando a pantalla RESULTADOS");
        prepararPalabras();
        lienzo.background(255);
      } else {
        inputActivo = true;
      }
    } else {
      inputActivo = false;
    }
  }
  // Estado RESULTADOS - USAR DIRECTAMENTE mouseX y mouseY
  else if (estadoActual === "RESULTADOS") {
    console.log("=== MOUSE PRESS DIRECTO ===");
    console.log("Mouse directo:", mouseX, mouseY);
    
    // Verificar panel oculto
    if (!mostrarControles && mouseX <= 50 && mouseY >= 100 && mouseY <= 180) {
      mostrarControles = true;
      return;
    }
    
    // DIBUJO DIRECTO - Sin correcciones
    if (mouseX > 280) {
      console.log("*** DIBUJANDO DIRECTO ***");
      dibujando = true;
      ultimaPosicion = createVector(mouseX, mouseY);
      dibujarPalabra(mouseX, mouseY);
      return;
    }
    
    // Interacciones con el panel
    if (mostrarControles && mouseX < 270) {
      let baseY = 310;
      let espaciado = 45;
      
      // Selector de fuente
      if (mouseX >= 90 && mouseX <= 240 && mouseY >= baseY-12 && mouseY <= baseY+12) {
        fuenteSeleccionada = (fuenteSeleccionada + 1) % fuentes.length;
        return;
      }
      
      // Botones de tamaño
      baseY += espaciado;
      if (mouseX >= 90 && mouseX <= 115 && mouseY >= baseY-12 && mouseY <= baseY+12) {
        tamanoTexto = max(10, tamanoTexto - 2);
        return;
      }
      if (mouseX >= 125 && mouseX <= 150 && mouseY >= baseY-12 && mouseY <= baseY+12) {
        tamanoTexto = min(72, tamanoTexto + 2);
        return;
      }
      
      // Botones de densidad
      baseY += espaciado;
      if (mouseX >= 90 && mouseX <= 115 && mouseY >= baseY-12 && mouseY <= baseY+12) {
        distanciaEntrePalabras = min(50, distanciaEntrePalabras + 5);
        return;
      }
      if (mouseX >= 125 && mouseX <= 150 && mouseY >= baseY-12 && mouseY <= baseY+12) {
        distanciaEntrePalabras = max(10, distanciaEntrePalabras - 5);
        return;
      }
      
      // Colores
      baseY += espaciado;
      if (mouseY >= baseY-12 && mouseY <= baseY+12) {
        if (mouseX >= 90 && mouseX <= 115) colorTexto = color(0);
        if (mouseX >= 130 && mouseX <= 155) colorTexto = color(255, 0, 0);
        if (mouseX >= 170 && mouseX <= 195) colorTexto = color(0, 0, 255);
      }
      if (mouseY >= baseY+18 && mouseY <= baseY+42) {
        if (mouseX >= 90 && mouseX <= 115) colorTexto = color(0, 128, 0);
        if (mouseX >= 130 && mouseX <= 155) colorTexto = color(128, 0, 128);
        if (mouseX >= 170 && mouseX <= 195) colorTexto = color(255, 165, 0);
      }
      
      // Botones
      let guardarY = 610;
      if (mouseX >= 20 && mouseX <= 250 && mouseY >= guardarY && mouseY <= guardarY+35) {
        guardarCreacion();
        return;
      }
      if (mouseX >= 20 && mouseX <= 250 && mouseY >= guardarY+45 && mouseY <= guardarY+70) {
        mostrarControles = false;
        return;
      }
    }
  }
}

// FUNCIÓN MOUSEDRAGGED SIMPLIFICADA - Usar mouseX y mouseY directamente
function mouseDragged() {
  if (estadoActual === "RESULTADOS" && dibujando) {
    console.log("=== MOUSE DRAG DIRECTO ===");
    console.log("Mouse directo:", mouseX, mouseY);
    
    // USAR DIRECTAMENTE mouseX y mouseY
    if (mouseX > 280) {
      let posActual = createVector(mouseX, mouseY);
      let distancia = p5.Vector.dist(ultimaPosicion, posActual);
      
      if (distancia >= distanciaEntrePalabras) {
        console.log("*** DIBUJANDO AL ARRASTRAR DIRECTO ***");
        dibujarPalabra(mouseX, mouseY);
        ultimaPosicion = posActual.copy();
      }
    }
  }
}

function mouseReleased() {
  if (estadoActual === "RESULTADOS") {
    dibujando = false;
  }
}

// FUNCIÓN KEYPRESSED SIMPLIFICADA - Debug directo
function keyPressed() {
  // Capturar texto en pantalla PREGUNTA (sin cambios)
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
      if (inputValor.length < 20) {
        inputValor += key;
      }
    }
  }
  // Guardar en pantalla RESULTADOS
  else if (estadoActual === "RESULTADOS" && (key === 's' || key === 'S')) {
    guardarCreacion();
  }
  
  // DEBUG DIRECTO: Información con tecla D
  if (key === 'd' || key === 'D') {
    console.log("=== DEBUG DIRECTO ===");
    console.log("Estado actual:", estadoActual);
    console.log("Mouse directo:", mouseX, mouseY);
    console.log("Canvas size:", width, height);
    console.log("Panel visible:", mostrarControles);
    
    // FORZAR DIBUJO DIRECTO PARA PRUEBA
    if (estadoActual === "RESULTADOS") {
      console.log("*** FORZANDO DIBUJO DIRECTO ***");
      dibujarPalabra(mouseX, mouseY); // Usar posición actual del mouse
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

// Función para reiniciar el lienzo de dibujo
function reiniciarLienzo() {
  lienzo.background(255);
  console.log("Lienzo reiniciado");
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchMoved() {
  mouseDragged();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}
