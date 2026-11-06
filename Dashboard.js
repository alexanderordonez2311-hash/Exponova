/* ==========================================
   EXPENOVA - DASHBOARD
   Muestra datos reales sin modificar App.js.
========================================== */

const CLAVE_ESTADISTICAS = "expenova_uso_algoritmos";
const nombresAlgoritmos = ["burbuja", "seleccion", "secuencial", "binaria"];
let usoAlgoritmos = { burbuja: 0, seleccion: 0, secuencial: 0, binaria: 0 };

// Recuperamos las ejecuciones registradas en este navegador.
try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ESTADISTICAS) || "{}");
    for (const nombre of nombresAlgoritmos) {
        if (Number.isSafeInteger(guardado[nombre]) && guardado[nombre] >= 0) {
            usoAlgoritmos[nombre] = guardado[nombre];
        }
    }
} catch (error) {
    console.warn("No se pudieron leer las estadísticas anteriores.");
}

function actualizarDashboard() {
    // Esta variable ya pertenece a App.js y contiene los expedientes actuales.
    const total = expedientes.length;
    document.getElementById("dashboardTotal").textContent = total;
    document.getElementById("dashboardTotalDetalle").textContent = total;

    // El círculo es decorativo, no representa un porcentaje falso.
    document.querySelector(".anillo-expedientes").style.background =
        total > 0
            ? "conic-gradient(#1097dd 0 76%, #dcebf5 76% 100%)"
            : "conic-gradient(#dcebf5 0 100%)";

    let suma = 0;
    for (const nombre of nombresAlgoritmos) {
        const cantidad = usoAlgoritmos[nombre];
        suma += cantidad;
        document.getElementById("dashboard" + nombre[0].toUpperCase() + nombre.slice(1)).textContent = cantidad;
    }
    document.getElementById("dashboardOperaciones").textContent = suma;

    const colores = {burbuja:"#1685ec", seleccion:"#16c8de", secuencial:"#986af4", binaria:"#60a5fa"};
    let inicio = 0;
    const partes = [];
    if (suma > 0) {
        for (const nombre of nombresAlgoritmos) {
            const final = inicio + usoAlgoritmos[nombre] / suma * 100;
            partes.push(`${colores[nombre]} ${inicio}% ${final}%`);
            inicio = final;
        }
    }
    document.getElementById("dashboardGrafico").style.background =
        suma > 0 ? `conic-gradient(${partes.join(", ")})` : "conic-gradient(#dcebf5 0 100%)";
}

function registrarUso(nombre) {
    usoAlgoritmos[nombre] += 1;
    try {
        localStorage.setItem(CLAVE_ESTADISTICAS, JSON.stringify(usoAlgoritmos));
    } catch (error) {
        console.warn("No fue posible guardar el contador de algoritmos.");
    }
    actualizarDashboard();
}

// Al terminar las funciones originales, actualizamos los datos visibles.
// No tocamos los algoritmos ni cambiamos su resultado.
const mostrarExpedientesOriginal = mostrarExpedientes;
mostrarExpedientes = function () {
    mostrarExpedientesOriginal();
    actualizarDashboard();
};

// Contamos ordenamientos cuando el algoritmo y campo fueron seleccionados
// y el sistema tenía expedientes para ordenar.
document.getElementById("btnOrdenar").addEventListener("click", function () {
    const nombre = document.getElementById("tipoAlgoritmo").value;
    const campo = document.getElementById("campoOrdenar").value;
    if (expedientes.length > 0 && ["burbuja", "seleccion"].includes(nombre) && ["codigo", "nombre"].includes(campo) && !expeErrorCarga) {
        registrarUso(nombre);
    }
});

// Contamos búsquedas que sí cumplen las condiciones del algoritmo.
document.getElementById("btnBuscar").addEventListener("click", function () {
    const nombre = document.getElementById("tipoBusqueda").value;
    const buscado = document.getElementById("buscarCodigo").value.trim();
    if (!["secuencial", "binaria"].includes(nombre) || !/^EXP-[0-9]{3}$/.test(buscado) || !expedientes.length) return;
    if (nombre === "binaria" && !estaOrdenadoPorCodigo(expedientes)) return;
    registrarUso(nombre);
});

actualizarDashboard();
