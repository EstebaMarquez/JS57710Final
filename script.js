const maxIntentos = 6;

let palabras = [];
let palabraElegida = "";
let intentos = maxIntentos;
let letrasAdivinadas = [];
let ganadas = 0;
let perdidas = 0;
let juegoTerminado = false;

const contenedorPalabra = document.getElementById("contenedor-palabra");
const contenedorLetras = document.getElementById("contenedor-letras");
const intentosRestantes = document.getElementById("intentos");
const botonReiniciar = document.getElementById("boton-reiniciar");
const contenedorGanadas = document.getElementById("ganadas");
const contenedorPerdidas = document.getElementById("perdidas");
const botonReiniciarContadores = document.getElementById("boton-reiniciar-contadores");
const modal = document.getElementById("modal");
const mensajeModal = document.getElementById("mensaje-modal");
const imagenModal = document.getElementById("imagen-modal");
const botonCerrarModal = document.getElementById("boton-cerrar-modal");

function obtenerPalabras() {
    return fetch('words.json')
        .then(response => response.json())
        .then(data => {
            palabras = data.palabras;
        })
        .catch(error => console.error('Error al cargar las palabras:', error));
}

function iniciar() {
    if (palabras.length === 0) {
        obtenerPalabras().then(() => {
            palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];
            reiniciarJuego();
        });
    } else {
        palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];
        reiniciarJuego();
    }
}

function reiniciarJuego() {
    intentos = maxIntentos;
    letrasAdivinadas = [];
    juegoTerminado = false;
    actualizarPalabra();
    actualizarIntentos();
    generarBotonesLetras();
    cerrarModal();
}

function actualizarPalabra() {
    contenedorPalabra.innerHTML = palabraElegida.split("").map(letra => letrasAdivinadas.includes(letra) ? letra : "_").join(" ");
}

function actualizarIntentos() {
    intentosRestantes.textContent = intentos;
    if (intentos <= 0) {
        perdidas++;
        actualizarContadores();
        mostrarModal("Has perdido. La palabra era: " + palabraElegida, "/images/triste.png");
        deshabilitarBotonesLetras();
        juegoTerminado = true;
    }
}

function generarBotonesLetras() {
    contenedorLetras.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const boton = document.createElement("button");
        boton.textContent = String.fromCharCode(i);
        boton.addEventListener("click", () => manejarClickLetra(boton));
        contenedorLetras.appendChild(boton);
    }
    deshabilitarLetrasAdivinadas();
}

function manejarClickLetra(boton) {
    if (juegoTerminado) return;
    const letra = boton.textContent.toLowerCase();
    boton.disabled = true;
    letrasAdivinadas.push(letra);
    if (palabraElegida.includes(letra)) {
        boton.classList.add("animate__animated", "animate__bounceIn");
        setTimeout(() => boton.classList.remove("animate__animated", "animate__bounceIn"), 1000);
        actualizarPalabra();
        if (palabraElegida.split("").every(letra => letrasAdivinadas.includes(letra))) {
            ganadas++;
            actualizarContadores();
            mostrarModal("¡Has ganado!", "/images/feliz.png");
            deshabilitarBotonesLetras();
            juegoTerminado = true;
        }
    } else {
        boton.classList.add("animate__animated", "animate__shakeX");
        setTimeout(() => boton.classList.remove("animate__animated", "animate__shakeX"), 1000);
        intentos--;
        actualizarIntentos();
    }
    guardarEstadoJuego();
}

function deshabilitarBotonesLetras() {
    const botones = contenedorLetras.querySelectorAll("button");
    botones.forEach(boton => boton.disabled = true);
}

function deshabilitarLetrasAdivinadas() {
    letrasAdivinadas.forEach(letra => {
        const boton = Array.from(contenedorLetras.children).find(boton => boton.textContent.toLowerCase() === letra);
        if (boton) {
            boton.disabled = true;
        }
    });
}

function guardarEstadoJuego() {
    const estadoJuego = {
        palabraElegida,
        intentos,
        letrasAdivinadas,
        ganadas,
        perdidas,
        juegoTerminado
    };
    localStorage.setItem("estadoJuegoAhorcado", JSON.stringify(estadoJuego));
}

function cargarEstadoJuego() {
    const estadoGuardado = localStorage.getItem("estadoJuegoAhorcado");
    if (estadoGuardado) {
        const { palabraElegida: palabraGuardada, intentos: intentosGuardados, letrasAdivinadas: letrasGuardadas, ganadas: ganadasGuardadas, perdidas: perdidasGuardadas, juegoTerminado: juegoTerminadoGuardado } = JSON.parse(estadoGuardado);
        palabraElegida = palabraGuardada;
        intentos = intentosGuardados;
        letrasAdivinadas = letrasGuardadas;
        ganadas = parseInt(ganadasGuardadas, 10);
        perdidas = parseInt(perdidasGuardadas, 10);
        juegoTerminado = juegoTerminadoGuardado;
        actualizarPalabra();
        actualizarIntentos();
        actualizarContadores();
        if (juegoTerminado) {
            deshabilitarBotonesLetras();
        } else {
            generarBotonesLetras();
        }
    } else {
        iniciar();
    }
}

function actualizarContadores() {
    contenedorGanadas.textContent = ganadas;
    contenedorPerdidas.textContent = perdidas;
}

function reiniciarContadores() {
    ganadas = 0;
    perdidas = 0;
    actualizarContadores();
    guardarEstadoJuego();
}

function mostrarModal(mensaje, imagen) {
    mensajeModal.textContent = mensaje;
    imagenModal.src = imagen;
    modal.style.display = "block";
}

function cerrarModal() {
    modal.style.display = "none";
}

botonReiniciar.addEventListener("click", () => {
    localStorage.removeItem("estadoJuegoAhorcado");
    iniciar();
});

botonReiniciarContadores.addEventListener("click", reiniciarContadores);

botonCerrarModal.addEventListener("click", cerrarModal);

window.addEventListener("load", () => {
    obtenerPalabras().then(cargarEstadoJuego);
});
