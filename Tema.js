/* ==========================================
   EXPENOVA - CAMBIO DE APARIENCIA
   MODO CLARO Y OSCURO
========================================== */

const botonTema = document.getElementById("btnTema");
const textoTema = botonTema.querySelector(".texto-tema");
const CLAVE_TEMA = "expenova_tema";

// Cambiar los colores y el ícono del botón.
function aplicarTema(tema) {
    const oscuro = tema === "oscuro";
    document.body.classList.toggle("modo-oscuro", oscuro);
    textoTema.textContent = oscuro ? "Claro" : "Oscuro";
    botonTema.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
    botonTema.setAttribute("aria-pressed", String(oscuro));
    botonTema.title = oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
}

// Cargar la preferencia de la última vez.
try {
    aplicarTema(localStorage.getItem(CLAVE_TEMA) === "oscuro" ? "oscuro" : "claro");
} catch (error) {
    // Si el navegador bloquea el almacenamiento, el botón funciona igual.
    aplicarTema("claro");
}

// Un clic alterna entre los dos modos.
botonTema.addEventListener("click", function () {
    const temaNuevo = document.body.classList.contains("modo-oscuro") ? "claro" : "oscuro";
    aplicarTema(temaNuevo);

    try {
        localStorage.setItem(CLAVE_TEMA, temaNuevo);
    } catch (error) {
        console.warn("No se pudo guardar la preferencia de apariencia.");
    }
});
