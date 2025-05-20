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
let palabrasUsuario = [];
let inputActivo = false;
let inputValor = "";
let mensajeError = "";
let mostrarError = false;
let tiempoError = 0;

// Variables para pantalla de resultados
let palabrasVisuales = [];
let coloresPalabras = [];
let tamanosPalabras = [];
let posicionesPalabras = [];
let rotacionesPalabras = [];
let arrastrando = false;
let indicePalabraArrastrada = -1;
let offsetArrastreX = 0;
let offsetArrastreY = 0;

// Cargar audio e imágenes
function preload() {
  // Precargar imágenes
  for (let i = 1; i <= 12; i++) {
    let nombreArchivo = 'foto' + i + '.jpg';
    imagenes.push(loadImage(nombreArchivo));
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
  
  // Generar colores aleatorios para las palabras visuales
  colorMode(HSB, 100);
}

function draw() {
  if (estadoActual === "INICIO") {
    dibujarPantallaInicio();
  } else if (estadoActual === "ADVERTENCIA") {
    dibujarPantallaAdvertencia();
  } else if (estadoActual === "PREGUNTA") {
    dibujarPantallaPregunta();
  } else if (estadoActual === "RESULTADOS") {
    dibujarPantallaResultados();
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
  
  // Mostrar la imagen actual
  if (imagenes.length > 0 && indiceFotoActual < imagenes.length) {
    // Calcular dimensiones para mantener la proporción pero que quepa en el canvas
    let img = imagenes[indiceFotoActual];
    let proporcion = min(600 / img.width, 400 / img.height);
    let imgAncho = img.width * proporcion;
    let imgAlto = img.height * proporcion;
    
    // Mostrar imagen centrada en la parte superior
    imageMode(CENTER);
    image(img, centroX, 250, imgAncho, imgAlto);
    
    // Mostrar número de imagen
    textSize(16);
    textStyle(NORMAL);
    fill(100);
    text("Imagen " + (indiceFotoActual + 1) + " de " + imagenes.length, centroX, 50);
  }
  
  // Instrucciones
  textSize(24);
  textStyle(NORMAL);
  fill(0);
  text("¿Qué palabra viene a tu mente al ver esta imagen?", centroX, 500);
  
  // Campo de entrada
  rectMode(CENTER);
  if (inputActivo) {
    fill(255); // Blanco cuando está activo
    stroke(0, 150, 255);
    strokeWeight(3);
  } else {
    fill(240);
    stroke(180);
    strokeWeight(1);
  }
  rect(centroX, 550, 300, 50, 5);
  noStroke();
  
  // Texto del campo de entrada
  textSize(20);
  textAlign(CENTER, CENTER);
  fill(0);
  text(inputValor, centroX, 550);
  
  // Cursor de texto (parpadea)
  if (inputActivo && (frameCount % 60 < 30)) {
    let textPosX = centroX + textWidth(inputValor) / 2;
    if (textWidth(inputValor) > 250) textPosX = centroX + 125; // Limitar posición
    stroke(0);
    strokeWeight(2);
    line(textPosX + 5, 540, textPosX + 5, 560);
    noStroke();
  }
  
  // Botón Continuar
  rectMode(CORNER);
  let botonX = centroX - 100;
  let botonY = 620;
  let botonAncho = 200;
  let botonAlto = 50;
  
  let sobreBotonContinuar = mouseX > botonX && mouseX < botonX + botonAncho && 
                     mouseY > botonY && mouseY < botonY + botonAlto;
  
  if (sobreBotonContinuar) {
    fill(60);
  } else {
    fill(20);
  }
  rect(botonX, botonY, botonAncho, botonAlto, 10);
  
  textSize(24);
  textStyle(BOLD);
  fill(255);
  text("Continuar", botonX + botonAncho/2, botonY + botonAlto/2);
  
  // Mostrar mensaje de error si corresponde
  if (mostrarError) {
    textSize(18);
    fill(255, 0, 0);
    text(mensajeError, centroX, 590);
  }
  
  // Mostrar palabras ingresadas
  textSize(16);
  textStyle(ITALIC);
  fill(80);
  let textoIngresado = "Palabras ingresadas: ";
  if (palabrasUsuario.length > 0) {
    textoIngresado += palabrasUsuario.join(", ");
  } else {
    textoIngresado += "ninguna aún";
  }
  text(textoIngresado, centroX, 680);
  
  // Botón para avanzar a resultados (solo visible cuando se han ingresado suficientes palabras)
  if (palabrasUsuario.length >= 4) {
    let botonResultadosX = centroX - 150;
    let botonResultadosY = 720;
    let botonResultadosAncho = 300;
    let botonResultadosAlto = 50;
    
    let sobreBotonResultados = mouseX > botonResultadosX && mouseX < botonResultadosX + botonResultadosAncho && 
                      mouseY > botonResultadosY && mouseY < botonResultadosY + botonResultadosAlto;
    
    if (sobreBotonResultados) {
      fill(0, 120, 60);
    } else {
      fill(0, 100, 40);
    }
    rect(botonResultadosX, botonResultadosY, botonResultadosAncho, botonResultadosAlto, 10);
    
    textSize(20);
    textStyle(BOLD);
    fill(255);
    text("Ver Resultado Final", botonResultadosX + botonResultadosAncho/2, botonResultadosY + botonResultadosAlto/2);
  }
}

function dibujarPantallaResultados() {
  // Fondo del canvas para dibujar
  background(20);
  
  // Dibujar todas las palabras visuales
  for (let i = 0; i < palabrasVisuales.length; i++) {
    // Usar modo de color HSB
    colorMode(HSB, 100);
    
    // Establecer color y estilo para cada palabra
    fill(coloresPalabras[i]);
    textSize(tamanosPalabras[i]);
    textStyle(NORMAL);
    
    // Aplicar rotación
    push();
    translate(posicionesPalabras[i].x, posicionesPalabras[i].y);
    rotate(rotacionesPalabras[i]);
    
    // Dibujar la palabra
    text(palabrasVisuales[i], 0, 0);
    pop();
  }
  
  // Instrucciones
  rectMode(CORNER);
  fill(0, 0, 0, 180);
  rect(0, height - 100, width, 100);
  
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(255);
  text("Haz clic y arrastra las palabras para crear tu composición visual", centroX, height - 70);
  text("Presiona 'S' para guardar tu creación", centroX, height - 40);
  
  // Mostrar botón para volver a inicio
  let botonX = 20;
  let botonY = 20;
  let botonAncho = 180;
  let botonAlto = 40;
  
  let sobreBotonInicio = mouseX > botonX && mouseX < botonX + botonAncho && 
                  mouseY > botonY && mouseY < botonY + botonAlto;
  
  if (sobreBotonInicio) {
    fill(60);
  } else {
    fill(40);
  }
  rect(botonX, botonY, botonAncho, botonAlto, 10);
  
  textSize(18);
  fill(255);
  text("Reiniciar REFLEJO", botonX + botonAncho/2, botonY + botonAlto/2);
}

function keyPressed() {
  // Para la pantalla de preguntas
  if (estadoActual === "PREGUNTA" && inputActivo) {
    if (keyCode === ENTER) {
      confirmarPalabra();
    } else if (keyCode === BACKSPACE) {
      if (inputValor.length > 0) {
        inputValor = inputValor.substring(0, inputValor.length - 1);
      }
    } else if (keyCode >= 32 && keyCode <= 126) { // Caracteres imprimibles
      if (inputValor.length < 20) { // Limitar longitud
        inputValor += key;
      }
    }
  }
  
  // Para la pantalla de resultados
  if (estadoActual === "RESULTADOS" && key === 's') {
    saveCanvas('REFLEJO_' + year() + month() + day() + '_' + hour() + minute() + second(), 'png');
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
  
  // Si ya está reproduciendo música, manejar transiciones de pantallas
  if (estadoActual === "INICIO") {
    estadoActual = "ADVERTENCIA";
    console.log("Cambiando a pantalla ADVERTENCIA");
  } 
  else if (estadoActual === "ADVERTENCIA") {
    // Verificar si se hizo clic en el botón Bienvenido
    let botonX = centroX - 100;
    let botonY = 620;
    let botonAncho = 200;
    let botonAlto = 60;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      // Cambiar a pantalla de pregunta
      estadoActual = "PREGUNTA";
      console.log("Cambiando a pantalla PREGUNTA");
    }
  }
  else if (estadoActual === "PREGUNTA") {
    // Verificar si se hizo clic en el campo de entrada
    if (mouseX > centroX - 150 && mouseX < centroX + 150 && 
        mouseY > 525 && mouseY < 575) {
      inputActivo = true;
    } else {
      inputActivo = false;
    }
    
    // Verificar si se hizo clic en el botón Continuar
    let botonX = centroX - 100;
    let botonY = 620;
    let botonAncho = 200;
    let botonAlto = 50;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      confirmarPalabra();
    }
    
    // Verificar si se hizo clic en el botón de Resultados (si es visible)
    if (palabrasUsuario.length >= 4) {
      let botonResultadosX = centroX - 150;
      let botonResultadosY = 720;
      let botonResultadosAncho = 300;
      let botonResultadosAlto = 50;
      
      if (mouseX > botonResultadosX && mouseX < botonResultadosX + botonResultadosAncho && 
          mouseY > botonResultadosY && mouseY < botonResultadosY + botonResultadosAlto) {
        // Cambiar a pantalla de resultados
        prepararPantallaResultados();
        estadoActual = "RESULTADOS";
        console.log("Cambiando a pantalla RESULTADOS");
      }
    }
  }
  else if (estadoActual === "RESULTADOS") {
    // Verificar si se hizo clic en el botón para regresar al inicio
    let botonX = 20;
    let botonY = 20;
    let botonAncho = 180;
    let botonAlto = 40;
    
    if (mouseX > botonX && mouseX < botonX + botonAncho && 
        mouseY > botonY && mouseY < botonY + botonAlto) {
      // Reiniciar la aplicación
      resetearAplicacion();
      estadoActual = "INICIO";
      console.log("Reiniciando aplicación");
    }
    
    // Verificar si se hizo clic en alguna palabra para arrastrar
    for (let i = palabrasVisuales.length - 1; i >= 0; i--) {
      let d = dist(mouseX, mouseY, posicionesPalabras[i].x, posicionesPalabras[i].y);
      if (d < tamanosPalabras[i] / 2) {
        arrastrando = true;
        indicePalabraArrastrada = i;
        offsetArrastreX = posicionesPalabras[i].x - mouseX;
        offsetArrastreY = posicionesPalabras[i].y - mouseY;
        break;
      }
    }
  }
}

function mouseDragged() {
  if (estadoActual === "RESULTADOS" && arrastrando && indicePalabraArrastrada >= 0) {
    posicionesPalabras[indicePalabraArrastrada].x = mouseX + offsetArrastreX;
    posicionesPalabras[indicePalabraArrastrada].y = mouseY + offsetArrastreY;
  }
}

function mouseReleased() {
  if (estadoActual === "RESULTADOS") {
    arrastrando = false;
    indicePalabraArrastrada = -1;
  }
}

function confirmarPalabra() {
  if (inputValor.trim() === "") {
    mostrarError = true;
    mensajeError = "Por favor, ingresa una palabra";
    tiempoError = millis();
    return;
  }
  
  // Añadir palabra y avanzar a la siguiente imagen
  palabrasUsuario.push(inputValor.trim());
  inputValor = "";
  
  // Avanzar a la siguiente imagen o volver a la primera si ya se vieron todas
  indiceFotoActual = (indiceFotoActual + 1) % imagenes.length;
  
  console.log("Palabra añadida. Total:", palabrasUsuario.length);
}

function prepararPantallaResultados() {
  // Copiar las palabras ingresadas como palabras visuales
  palabrasVisuales = [...palabrasUsuario];
  
  // Crear propiedades visuales para cada palabra
  for (let i = 0; i < palabrasVisuales.length; i++) {
    // Color aleatorio (en modo HSB)
    coloresPalabras.push(color(random(100), 80, 90));
    
    // Tamaño aleatorio entre 30 y 80
    tamanosPalabras.push(random(30, 80));
    
    // Posición aleatoria en el canvas (evitando los bordes)
    posicionesPalabras.push(createVector(
      random(100, width - 100),
      random(100, height - 150)
    ));
    
    // Rotación aleatoria entre -PI/6 y PI/6 radianes
    rotacionesPalabras.push(random(-PI/6, PI/6));
  }
  
  console.log("Pantalla de resultados preparada con", palabrasVisuales.length, "palabras");
}

function resetearAplicacion() {
  // Reiniciar todas las variables necesarias
  indiceFotoActual = 0;
  palabrasUsuario = [];
  inputValor = "";
  palabrasVisuales = [];
  coloresPalabras = [];
  tamanosPalabras = [];
  posicionesPalabras = [];
  rotacionesPalabras = [];
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
