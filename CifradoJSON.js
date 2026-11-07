
/* ==========================================
   EXPENOVA
   INTEGRANTE 4: ALMACENAMIENTO Y CIFRADO
========================================== */

const EXPE_CLAVE = "expedientes";
let expeErrorCarga = false;
let expeMigracionPendiente = false;

// Los expedientes guardan el desplazamiento en su prefijo: CESAR3:, CESAR5:, etc.
// Esto permite recuperar registros antiguos aun si el usuario cambia el valor.
function obtenerDesplazamiento() {
    const entrada = document.getElementById("desplazamientoCesar");
    const valor = Number(entrada ? entrada.value : 3);
    if (!Number.isInteger(valor) || valor < 1 || valor > 25) {
        throw new Error("El desplazamiento César debe ser un entero entre 1 y 25.");
    }
    return valor;
}
function obtenerPrefijoCesar(texto) {
    const coincidencia = /^CESAR([1-9]|1[0-9]|2[0-5]):/.exec(String(texto));
    return coincidencia ? { prefijo: coincidencia[0], desplazamiento: Number(coincidencia[1]) } : null;
}
function transformarCesar(texto, desplazamiento) {
    let resultado = "";
    for (let i = 0; i < texto.length; i++) {
        const codigo = texto.charCodeAt(i);
        if (codigo >= 65 && codigo <= 90) {
            resultado += String.fromCharCode(((codigo - 65 + desplazamiento % 26 + 26) % 26) + 65);
        } else if (codigo >= 97 && codigo <= 122) {
            resultado += String.fromCharCode(((codigo - 97 + desplazamiento % 26 + 26) % 26) + 97);
        } else {
            // Acentos, espacios y signos se conservan.
            resultado += texto[i];
        }
    }
    return resultado;
}
function cifrarDescripcion(texto, desplazamiento = 3, conservarCifrado = false) {
    texto = String(texto);
    if (conservarCifrado && obtenerPrefijoCesar(texto)) return texto;
    if (!Number.isInteger(desplazamiento) || desplazamiento < 1 || desplazamiento > 25) {
        throw new Error("Desplazamiento inválido.");
    }
    return `CESAR${desplazamiento}:` + transformarCesar(texto, desplazamiento);
}
function descifrarDescripcion(texto) {
    texto = String(texto);
    const datos = obtenerPrefijoCesar(texto);
    return datos ? transformarCesar(texto.slice(datos.prefijo.length), -datos.desplazamiento) : texto;
}
function descripcionSinPrefijo(texto) {
    const datos = obtenerPrefijoCesar(texto);
    return datos ? String(texto).slice(datos.prefijo.length) : String(texto);
}
function fechaValidaISO(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const [anio, mes, dia] = fecha.split("-").map(Number);
    if (anio < 1000 || anio > 9999 || mes < 1 || mes > 12 || dia < 1) return false;
    const diasMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
    return dia <= diasMes;
}

function cargarExpedientesSeguros() {

    try {

        const contenido = localStorage.getItem(EXPE_CLAVE);

        if (contenido === null) {
            return [];
        }

        const datos = JSON.parse(contenido);

        if (!Array.isArray(datos)) {

            throw new Error(
                "El almacenamiento no contiene una lista JSON."
            );
        }

        return datos.map(function (item) {

            if (
                !item ||
                typeof item !== "object" ||
                typeof item.codigo !== "string" ||
                typeof item.nombre !== "string" ||
                typeof item.apellido !== "string" ||
                typeof item.fecha !== "string" ||
                typeof item.descripcion !== "string"
            ) {

                throw new Error(
                    "Se encontró un expediente inválido."
                );
            }

            if (!obtenerPrefijoCesar(item.descripcion)) {
                expeMigracionPendiente = true;
            }

            return {
                ...item,
                descripcion: cifrarDescripcion(item.descripcion, 3, true)
            };

        });

    } catch (error) {

        console.error(
            "Error al cargar expedientes:",
            error
        );

        expeErrorCarga = true;

        alert(
            "No se pudieron cargar los expedientes guardados. " +
            "Los datos originales no serán sobrescritos. " +
            "Revisa la consola del navegador."
        );

        return [];
    }
}


/* ==========================================
   5. VALIDAR EXPEDIENTES DEL JSON IMPORTADO
========================================== */

function validarExpedientesJSON(datos) {

    if (!Array.isArray(datos)) {

        throw new Error(
            "El archivo debe contener una lista JSON."
        );
    }

    const codigos = new Set();

    return datos.map(function (item) {

        if (
            !item ||
            typeof item !== "object" ||
            typeof item.codigo !== "string" ||
            typeof item.nombre !== "string" ||
            typeof item.apellido !== "string" ||
            typeof item.fecha !== "string" ||
            typeof item.descripcion !== "string"
        ) {

            throw new Error(
                "Un expediente tiene campos inválidos."
            );
        }

        if (
            !/^EXP-[0-9]{3}$/.test(item.codigo) ||
            item.codigo === "EXP-000"
        ) {

            throw new Error(
                "Código inválido: " + item.codigo
            );
        }

        const soloLetras =
            /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

        if (
            !soloLetras.test(item.nombre.trim()) ||
            !soloLetras.test(item.apellido.trim())
        ) {

            throw new Error(
                "Nombre o apellido inválido."
            );
        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(item.fecha) ||
            !fechaValidaISO(item.fecha)
        ) {

            throw new Error(
                "Fecha inválida en el archivo."
            );
        }

        if (item.descripcion.trim() === "") {

            throw new Error(
                "La descripción no puede estar vacía."
            );
        }

        if (codigos.has(item.codigo)) {

            throw new Error(
                "Existen códigos duplicados en el archivo."
            );
        }

        codigos.add(item.codigo);

        return {
            ...item,
            descripcion: cifrarDescripcion(item.descripcion, 3, true)
        };

    });
}



    
/* ==========================================
   6. MOSTRAR DESCRIPCIONES EN LA TABLA
========================================== */

// Reaplica el desplazamiento elegido a los expedientes existentes.
function actualizarCifradoCesar() {
    if (expedientes.length === 0) {
        mostrarMensaje("No hay expedientes registrados.", "error");
        return;
    }
    let desplazamiento;
    try {
        desplazamiento = obtenerDesplazamiento();
    } catch (error) {
        mostrarMensaje(error.message, "error");
        return;
    }
    const respaldo = expedientes.slice();
    expedientes = expedientes.map(item => ({
        ...item,
        descripcion: cifrarDescripcion(descifrarDescripcion(item.descripcion), desplazamiento)
    }));
    if (!guardarDatos()) {
        expedientes = respaldo;
        return;
    }
    mostrarExpedientes();
    mostrarDescripcionesCesar(false);
}

function mostrarDescripcionesCesar(descifradas) {

    if (expedientes.length === 0) {

        mostrarMensaje(
            "No hay expedientes registrados.",
            "error"
        );

        return;
    }

    const filas = tabla.querySelectorAll("tr");

    filas.forEach(function (fila, indice) {

        const celdaDescripcion = fila.cells[4];

        if (!celdaDescripcion || !expedientes[indice]) {
            return;
        }

        const texto = expedientes[indice].descripcion;

        // Mostrar únicamente el contenido cifrado,
        // sin el prefijo CESAR3:
        celdaDescripcion.textContent = descifradas
            ? descifrarDescripcion(texto)
            : descripcionSinPrefijo(texto);
    });

    mostrarMensaje(
        descifradas
            ? "Descripciones descifradas correctamente."
            : "Descripciones mostradas en formato cifrado.",
        "exito"
    );
}



/* ==========================================
   7. EXPORTAR EXPEDIENTES A JSON
========================================== */

function exportarExpedientesJSON() {

    if (expedientes.length === 0) {

        mostrarMensaje(
            "No hay expedientes para exportar.",
            "error"
        );

        return;
    }

    try {

        const contenido = JSON.stringify(
            expedientes,
            null,
            4
        );

        const archivo = new Blob(
            [contenido],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(archivo);

        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = "ExpeNova_Expedientes.json";

        document.body.appendChild(enlace);

        enlace.click();
        enlace.remove();

        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 1000);

        mostrarMensaje(
            "Archivo JSON descargado correctamente.",
            "exito"
        );

    } catch (error) {

        console.error(
            "Error al exportar JSON:",
            error
        );

        mostrarMensaje(
            "No se pudo generar el archivo JSON.",
            "error"
        );
    }
}


/* ==========================================
   8. IMPORTAR EXPEDIENTES DESDE JSON
========================================== */

async function importarExpedientesJSON(archivo) {

    if (!archivo) {
        return;
    }

    try {

        // Límite de 2 MB para archivos de prueba
        if (archivo.size > 2 * 1024 * 1024) {

            throw new Error(
                "El archivo supera el límite de 2 MB."
            );
        }

        const contenido = await archivo.text();

        const datos = JSON.parse(contenido);

        const nuevosExpedientes =
            validarExpedientesJSON(datos);

        const confirmar = confirm(
            "La importación reemplazará los expedientes " +
            "actuales. ¿Deseas continuar?"
        );

        if (!confirmar) {
            return;
        }

        const respaldo = expedientes;

        const errorAnterior = expeErrorCarga;

        expedientes = nuevosExpedientes;

        // Solo permite la recuperación de datos válidos
        // después de un error de carga previo.
        expeErrorCarga = false;

        if (!guardarDatos()) {

            expedientes = respaldo;
            expeErrorCarga = errorAnterior;

            throw new Error(
                "No se pudo guardar el archivo importado."
            );
        }

        indiceEditando = -1;

        formulario.reset();

        btnGuardar.textContent = "Guardar expediente";

        mostrarExpedientes();

        mostrarMensaje(
            "Expedientes importados correctamente.",
            "exito"
        );

    } catch (error) {

        console.error(
            "Error al importar JSON:",
            error
        );

        mostrarMensaje(
            "Error al importar: " + error.message,
            "error"
        );
    }
}


/* ==========================================
   9. CONECTAR BOTONES DEL HTML
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const botonCifrar =
        document.getElementById("btnCifrar");

    const botonDescifrar =
        document.getElementById("btnDescifrar");

    const botonExportar =
        document.getElementById("btnExportarJSON");

    const archivoImportar =
        document.getElementById("archivoJSON");


    // CIFRAR
    if (botonCifrar) {

        botonCifrar.addEventListener("click", function () {

            actualizarCifradoCesar();

        });
    }


    // DESCIFRAR
    if (botonDescifrar) {

        botonDescifrar.addEventListener("click", function () {

            mostrarDescripcionesCesar(true);

        });
    }


    // EXPORTAR JSON
    if (botonExportar) {

        botonExportar.addEventListener(
            "click",
            exportarExpedientesJSON
        );
    }


    // IMPORTAR JSON
    if (archivoImportar) {

        archivoImportar.addEventListener(
            "change",
            async function () {

                const archivo = this.files[0];

                await importarExpedientesJSON(archivo);

                this.value = "";
            }
        );
    }

}
);
