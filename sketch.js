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

function dibujarPanelLateral() {
  // Panel izquierdo
  fill(240);
  stroke(200);
  rect(10, 10, 250, height - 20, 10);
  
  // Título
  fill(0);
  textFont('Verdana');
  textSize(30);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text("¡A Dibujar!", 135, 20);
  
  // Instrucciones
  textSize(14);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  fill(80);
  text("Mantén presionado el botón del mouse y mueve el cursor para dibujar con tus palabras.", 20, 60, 230, 100);
  
  // Recuadro de palabras
  fill(255);
  stroke(200);
  rect(20, 165, 230, 150, 5);
  
  // Mostrar palabras disponibles
  textSize(16);
  textAlign(LEFT, TOP);
  fill(0);
  let y = 175;
  let contador = 0;
  
  for (let palabra of palabrasDisponibles) {
    text(palabra, 30, y);
    y += 25;
    contador++;
    if (contador >= 5) break; // Mostrar solo las primeras 5
  }
  
  if (contador === 0) {
    fill(100);
    text("No hay palabras disponibles", 30, 175);
  }
  
  // Controles de formato
  fill(0);
  textSize(18);
  textAlign(LEFT, CENTER);
  text("Tipografía:", 20, 340);
  
  // Selector de fuente
  fill(255);
  stroke(200);
  rect(120, 330, 130, 30, 5);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(fuentes[fuenteSeleccionada], 185, 345);
  
  // Tamaño de texto
  textAlign(LEFT, CENTER);
  text("Tamaño:", 20, 380);
  
  // Botones de tamaño
  fill(40);
  rect(120, 370, 40, 30, 5); // Botón -
  rect(170, 370, 40, 30, 5); // Botón +
  fill(255);
  textAlign(CENTER, CENTER);
  text("-", 140, 385);
  text("+", 190, 385);
  fill(0);
  text(tamanoTexto, 220, 385);
  
  // Control de densidad de palabras
  textAlign(LEFT, CENTER);
  text("Densidad:", 20, 420);
  fill(40);
  rect(120, 410, 40, 30, 5); // Botón -
  rect(170, 410, 40, 30, 5); // Botón +
  fill(255);
  textAlign(CENTER, CENTER);
  text("-", 140, 425);
  text("+", 190, 425);
  fill(0);
  // Mostrar densidad como valor invertido (mayor número = mayor densidad)
  let densidadMostrada = int(map(distanciaEntrePalabras, 10, 50, 10, 1));
  text(densidadMostrada, 220, 425);
  
  // Color
  textAlign(LEFT, CENTER);
  fill(0);
  text("Color:", 20, 460);
  
  // Muestras de color
  colorMuestra(120, 450, color(0));          // Negro
  colorMuestra(160, 450, color(255, 0, 0));  // Rojo
  colorMuestra(200, 450, color(0, 0, 255));  // Azul
  colorMuestra(120, 490, color(0, 128, 0));  // Verde
  colorMuestra(160, 490, color(128, 0, 128));// Morado
  colorMuestra(200, 490, color(255, 165, 0));// Naranja
  
  // Instrucciones de dibujo
  fill(0);
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text("Cómo usar:", 20, 530);
  textStyle(NORMAL);
  textSize(12);
  text("1. Presiona y arrastra para dibujar con palabras\n2. Ajusta la densidad, estilo y color\n3. Realiza múltiples trazos\n4. Guarda tu creación", 20, 555, 230, 150);
  
  // Botón para guardar
  fill(20);
  rect(20, height - 100, 230, 40, 5);
  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Guardar Mi Creación", 135, height - 80);
  
  // Botón para ocultar controles
  fill(150);
  rect(20, height - 50, 230, 30, 5);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Ocultar Panel", 135, height - 35);
  
  // Flecha indicando ocultar
  fill(255);
  triangle(50, height - 35, 40, height - 40, 40, height - 30);
}

function colorMuestra(x, y, c) {
  stroke(0);
  fill(c);
  rect(x, y, 30, 30, 2);
  
  // Marcar el color actualmente seleccionado
  if (red(c) === red(colorTexto) && 
      green(c) === green(colorTexto) && 
      blue(c) === blue(colorTexto)) {
    noFill();
    stroke(255, 0, 0);
    rect(x-2, y-2, 34, 34, 4);
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

function dibujarPalabra(x, y) {
  // Verificar que tengamos palabras disponibles
  if (palabrasDisponibles.length === 0) {
    prepararPalabras();
    if (palabrasDisponibles.length === 0) return;
  }
  
  // Obtener la siguiente palabra
  palabraActual = (palabraActual + 1) % palabrasDisponibles.length;
  let palabra = palabrasDisponibles[palabraActual];
  
  // Configurar el lienzo para dibujar
  lienzo.push();
  
  // Asignar fuente y estilo
  lienzo.textFont(fuentes[fuenteSeleccionada]);
  lienzo.textSize(tamanoTexto);
  lienzo.textAlign(CENTER, CENTER);
  
  // Asignar color
  lienzo.fill(colorTexto);
  
  // Dibujar palabra en la posición
  lienzo.text(palabra, x, y);
  
  lienzo.pop();
}

function guardarCreacion() {
  saveCanvas(lienzo, 'mi_creacion_reflejo', 'png');
  mensajeSalvado = true;
  tiempoMensaje = 0;
  console.log("Creación guardada como: mi_creacion_reflejo.png");
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
  else if (estadoActual === "RESULTADOS") {
    // Verificar si se hace clic en el panel oculto para mostrarlo
    if (!mostrarControles && mouseX <= 50 && mouseY <= 80) {
      mostrarControles = true;
      return;
    }
    
    // Comenzar a dibujar si está fuera del panel
    if ((mostrarControles && mouseX > 270) || (!mostrarControles && mouseX > 50)) {
      dibujando = true;
      ultimaPosicion = createVector(mouseX, mouseY);
      
      // Dibujar la primera palabra en la posición inicial
      dibujarPalabra(mouseX, mouseY);
      return;
    }
    
    // Interacciones con el panel de control
    if (mostrarControles) {
      // Selector de fuente
      if (mouseX >= 120 && mouseX <= 250 && mouseY >= 330 && mouseY <= 360) {
        fuenteSeleccionada = (fuenteSeleccionada + 1) % fuentes.length;
        return;
      }
      
      // Botones de tamaño
      if (mouseX >= 120 && mouseX <= 160 && mouseY >= 370 && mouseY <= 400) {
        tamanoTexto = max(10, tamanoTexto - 2); // Botón -
        return;
      }
      
      if (mouseX >= 170 && mouseX <= 210 && mouseY >= 370 && mouseY <= 400) {
        tamanoTexto = min(72, tamanoTexto + 2); // Botón +
        return;
      }
      
      // Botones de densidad
      if (mouseX >= 120 && mouseX <= 160 && mouseY >= 410 && mouseY <= 440) {
        distanciaEntrePalabras = min(50, distanciaEntrePalabras + 5); // Botón - (menos densidad)
        return;
      }
      
      if (mouseX >= 170 && mouseX <= 210 && mouseY >= 410 && mouseY <= 440) {
        distanciaEntrePalabras = max(10, distanciaEntrePalabras - 5); // Botón + (más densidad)
        return;
      }
      
      // Selección de color
      if (mouseY >= 450 && mouseY <= 480) {
        if (mouseX >= 120 && mouseX <= 150) colorTexto = color(0);
        if (mouseX >= 160 && mouseX <= 190) colorTexto = color(255, 0, 0);
        if (mouseX >= 200 && mouseX <= 230) colorTexto = color(0, 0, 255);
      }
      
      if (mouseY >= 490 && mouseY <= 520) {
        if (mouseX >= 120 && mouseX <= 150) colorTexto = color(0, 128, 0);
        if (mouseX >= 160 && mouseX <= 190) colorTexto = color(128, 0, 128);
        if (mouseX >= 200 && mouseX <= 230) colorTexto = color(255, 165, 0);
      }
      
      // Botón para guardar
      if (mouseX >= 20 && mouseX <= 250 && mouseY >= height - 100 && mouseY <= height - 60) {
        guardarCreacion();
        return;
      }
      
      // Botón para ocultar/mostrar controles
      if (mouseX >= 20 && mouseX <= 250 && mouseY >= height - 50 && mouseY <= height - 20) {
        mostrarControles = false;
        return;
      }
    }
  }
}

function mouseDragged() {
  if (estadoActual === "RESULTADOS" && dibujando) {
    // Verificar que estamos en una zona válida para dibujar
    let zonaValida = mostrarControles ? mouseX > 270 : mouseX > 50;
    
    if (zonaValida) {
      // Calcular la distancia desde la última posición
      let posActual = createVector(mouseX, mouseY);
      let distancia = p5.Vector.dist(ultimaPosicion, posActual);
      
      // Solo dibujar si hemos recorrido la distancia mínima
      if (distancia >= distanciaEntrePalabras) {
        dibujarPalabra(posActual.x, posActual.y);
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
