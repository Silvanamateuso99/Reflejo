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

// FUNCIÓN COMPLETAMENTE REDISEÑADA - Panel con posición inferior
function dibujarPanelLateral() {
  // Panel izquierdo - altura reducida y posición ajustada
  fill(240);
  stroke(200);
  rect(10, 60, 250, 470, 10); // Movido hacia abajo y altura reducida
  
  // Título
  fill(0);
  textFont('Verdana');
  textSize(16);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text("¡A Dibujar!", 135, 70);
  
  // Instrucciones
  textSize(10);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  fill(80);
  text("Mantén presionado el botón del mouse y mueve el cursor para dibujar con tus palabras.", 20, 90, 230, 30);
  
  // Recuadro de palabras - más pequeño
  fill(255);
  stroke(200);
  rect(20, 120, 230, 80, 5);
  
  // Mostrar palabras disponibles
  textSize(11);
  textAlign(LEFT, TOP);
  fill(0);
  let y = 125;
  let contador = 0;
  
  for (let palabra of palabrasDisponibles) {
    text(palabra, 30, y);
    y += 15; // Espaciado reducido
    contador++;
    if (contador >= 5) break;
  }
  
  if (contador === 0) {
    fill(100);
    text("No hay palabras disponibles", 30, 140);
  }
  
  // CONTROLES - espacio reducido entre ellos
  let baseY = 205; // Posición base de los controles
  let espaciado = 30; // Espacio entre controles
  
  // Tipografía
  fill(0);
  textSize(11);
  textAlign(LEFT, CENTER);
  text("Tipografía:", 20, baseY);
  
  fill(255);
  stroke(200);
  rect(90, baseY - 10, 150, 20, 5);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(fuentes[fuenteSeleccionada], 165, baseY);
  
  // Tamaño
  baseY += espaciado;
  textAlign(LEFT, CENTER);
  text("Tamaño:", 20, baseY);
  
  fill(40);
  rect(90, baseY - 10, 25, 20, 5); // Botón -
  rect(125, baseY - 10, 25, 20, 5); // Botón +
  fill(255);
  textAlign(CENTER, CENTER);
  text("-", 102, baseY);
  text("+", 137, baseY);
  fill(0);
  text(tamanoTexto, 165, baseY);
  
  // Densidad
  baseY += espaciado;
  textAlign(LEFT, CENTER);
  text("Densidad:", 20, baseY);
  
  fill(40);
  rect(90, baseY - 10, 25, 20, 5); // Botón -
  rect(125, baseY - 10, 25, 20, 5); // Botón +
  fill(255);
  textAlign(CENTER, CENTER);
  text("-", 102, baseY);
  text("+", 137, baseY);
  fill(0);
  let densidadMostrada = int(map(distanciaEntrePalabras, 10, 50, 10, 1));
  text(densidadMostrada, 165, baseY);
  
  // Color
  baseY += espaciado;
  textAlign(LEFT, CENTER);
  fill(0);
  text("Color:", 20, baseY);
  
  // Primera fila de colores
  colorMuestra(90, baseY - 10, color(0));         // Negro
  colorMuestra(125, baseY - 10, color(255, 0, 0)); // Rojo
  colorMuestra(160, baseY - 10, color(0, 0, 255)); // Azul
  
  // Segunda fila de colores - ajustada para estar justo debajo
  colorMuestra(90, baseY + 15, color(0, 128, 0));   // Verde
  colorMuestra(125, baseY + 15, color(128, 0, 128)); // Morado
  colorMuestra(160, baseY + 15, color(255, 165, 0)); // Naranja
  
  // Instrucciones de uso - más compactas
  baseY += espaciado + 25; // Ajuste para que esté después de la segunda fila de colores
  fill(0);
  textAlign(LEFT, TOP);
  textSize(11);
  textStyle(BOLD);
  text("Cómo usar:", 20, baseY);
  textStyle(NORMAL);
  textSize(10);
  text("1. Presiona y arrastra para dibujar\n2. Ajusta densidad, estilo y color\n3. Realiza múltiples trazos\n4. Guarda tu creación", 20, baseY + 20, 230, 60);
  
  // Botones - colocados justo después de las instrucciones
  let botonesY = 435; // Posición Y fija para los botones
  
  // Botón para guardar
  fill(20);
  rect(20, botonesY, 230, 30, 5);
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Guardar Mi Creación", 135, botonesY + 15);
  
  // Botón para ocultar controles - justo debajo del anterior
  fill(150);
  rect(20, botonesY + 35, 230, 25, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Ocultar Panel", 135, botonesY + 35 + 12);
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

function dibujarFlechaPanel() {
  // Fondo para la flecha
  fill(240, 240, 240, 220);
  stroke(200);
  rect(0, 0, 50, 80, 0, 10, 10, 0);
  
  // Dibujar flecha simple
  fill(40);
  noStroke();
  // Triángulo (flecha)
  triangle(15, 20, 35, 40, 15, 60);
  // Rectángulo (base)
  rect(5, 35, 10, 10);
  
  // Texto pequeño debajo
  fill(40);
  textAlign(CENTER);
  textSize(10);
  text("Panel", 25, 75);
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

// FUNCIÓN CORREGIDA para el problema del dibujo
function dibujarPalabra(x, y) {
  // Verificar que tengamos palabras disponibles
  if (palabrasDisponibles.length === 0) {
    prepararPalabras();
    if (palabrasDisponibles.length === 0) return;
  }
  
  // Obtener la siguiente palabra
  palabraActual = (palabraActual + 1) % palabrasDisponibles.length;
  let palabra = palabrasDisponibles[palabraActual];
  
  console.log("Dibujando palabra:", palabra, "en", x, y); // Debug info
  
  // Dibujar en el lienzo principal inmediatamente (para visualización en tiempo real)
  push();
  textFont(fuentes[fuenteSeleccionada]);
  textSize(tamanoTexto);
  textAlign(CENTER, CENTER);
  fill(colorTexto);
  
  // Dibujar directamente en las coordenadas del mouse
  text(palabra, x, y);
  pop();
  
  // Dibujar también en el lienzo secundario permanente (para guardar)
  // Asegurarse de configurar correctamente todas las propiedades
  lienzo.push();
  lienzo.textFont(fuentes[fuenteSeleccionada]);
  lienzo.textSize(tamanoTexto);
  lienzo.textAlign(CENTER, CENTER);
  lienzo.fill(colorTexto);
  
  // Usar las mismas coordenadas exactas para el lienzo secundario
  lienzo.text(palabra, x, y);
  lienzo.pop();
}

function guardarCreacion() {
  saveCanvas(lienzo, 'mi_creacion_reflejo', 'png');
  mensajeSalvado = true;
  tiempoMensaje = 0;
  console.log("Creación guardada como: mi_creacion_reflejo.png");
}

// FUNCIÓN ACTUALIZADA para las interacciones del panel
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
        // Acción del botón Continuar - Cambiar a pantalla RESULTADOS
        estadoActual = "RESULTADOS";
        console.log("Cambiando a pantalla RESULTADOS");
        prepararPalabras(); // Asegurarnos de que las palabras están listas
      } else {
        // Activar área de respuesta
        inputActivo = true;
      }
    } else {
      inputActivo = false;
    }
  }
  // Estado RESULTADOS - Coordenadas actualizadas para el nuevo diseño
  else if (estadoActual === "RESULTADOS") {
    // Verificar si se hace clic en el panel oculto para mostrarlo
    if (!mostrarControles && mouseX <= 50 && mouseY <= 80) {
      mostrarControles = true;
      return;
    }
    
    // Comenzar a dibujar si está fuera del panel
    if ((mostrarControles && mouseX > 270) || (!mostrarControles && mouseX > 50)) {
      dibujando = true;
      
      // Almacenar posición inicial exacta del clic
      ultimaPosicion = createVector(mouseX, mouseY);
      
      // Dibujar la primera palabra en la posición inicial del clic
      dibujarPalabra(mouseX, mouseY);
      return;
    }
    
    // Interacciones con el panel de control (coordenadas actualizadas)
    if (mostrarControles) {
      let baseY = 205; // Debe coincidir con el diseño del panel
      let espaciado = 30;
      
      // Selector de fuente
      if (mouseX >= 90 && mouseX <= 240 && mouseY >= baseY-10 && mouseY <= baseY+10) {
        fuenteSeleccionada = (fuenteSeleccionada + 1) % fuentes.length;
        return;
      }
      
      // Botones de tamaño
      baseY += espaciado;
      if (mouseX >= 90 && mouseX <= 115 && mouseY >= baseY-10 && mouseY <= baseY+10) {
        tamanoTexto = max(10, tamanoTexto - 2); // Botón -
        return;
      }
      
      if (mouseX >= 125 && mouseX <= 150 && mouseY >= baseY-10 && mouseY <= baseY+10) {
        tamanoTexto = min(72, tamanoTexto + 2); // Botón +
        return;
      }
      
      // Botones de densidad
      baseY += espaciado;
      if (mouseX >= 90 && mouseX <= 115 && mouseY >= baseY-10 && mouseY <= baseY+10) {
        distanciaEntrePalabras = min(50, distanciaEntrePalabras + 5); // Botón - (menos densidad)
        return;
      }
      
      if (mouseX >= 125 && mouseX <= 150 && mouseY >= baseY-10 && mouseY <= baseY+10) {
        distanciaEntrePalabras = max(10, distanciaEntrePalabras - 5); // Botón + (más densidad)
        return;
      }
      
      // Selector de color
      baseY += espaciado;
      // Primera fila de colores
      if (mouseY >= baseY-10 && mouseY <= baseY+10) {
        if (mouseX >= 90 && mouseX <= 115) colorTexto = color(0);          // Negro
        if (mouseX >= 125 && mouseX <= 150) colorTexto = color(255, 0, 0);  // Rojo
        if (mouseX >= 160 && mouseX <= 185) colorTexto = color(0, 0, 255);  // Azul
      }
      
      // Segunda fila de colores
      if (mouseY >= baseY+15 && mouseY <= baseY+35) {
        if (mouseX >= 90 && mouseX <= 115) colorTexto = color(0, 128, 0);    // Verde
        if (mouseX >= 125 && mouseX <= 150) colorTexto = color(128, 0, 128);  // Morado
        if (mouseX >= 160 && mouseX <= 185) colorTexto = color(255, 165, 0);  // Naranja
      }
      
      // Posición de los botones (posición Y fija)
      let botonesY = 435;
      
      // Botón para guardar
      if (mouseX >= 20 && mouseX <= 250 && mouseY >= botonesY && mouseY <= botonesY+30) {
        guardarCreacion();
        return;
      }
      
      // Botón para ocultar controles
      if (mouseX >= 20 && mouseX <= 250 && mouseY >= botonesY+35 && mouseY <= botonesY+60) {
        mostrarControles = false;
        return;
      }
    }
  }
}

// FUNCIÓN MODIFICADA para asegurar que las palabras se dibujen donde se arrastra el mouse
function mouseDragged() {
  if (estadoActual === "RESULTADOS" && dibujando) {
    // Verificar que estamos en una zona válida para dibujar
    let zonaValida = mostrarControles ? mouseX > 270 : mouseX > 50;
    
    if (zonaValida) {
      // Calcular la distancia desde la última posición
      let posActual = createVector(mouseX, mouseY);
      let distancia = p5.Vector.dist(ultimaPosicion, posActual);
      
      // Mostrar información de depuración
      console.log("Arrastrando en:", mouseX, mouseY, "Distancia:", distancia);
      
      // Solo agregar una palabra si hemos recorrido la distancia mínima
      if (distancia >= distanciaEntrePalabras) {
        // Dibujar palabra exactamente en la posición actual del mouse
        dibujarPalabra(mouseX, mouseY);
        // Actualizar la última posición para el próximo cálculo de distancia
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
  // Guardar en la pantalla RESULTADOS
  else if (estadoActual === "RESULTADOS" && (key === 's' || key === 'S')) {
    guardarCreacion();
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

function touchMoved() {
  mouseDragged();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}
