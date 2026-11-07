
/* ==========================================
   EXPENOVA - SISTEMA DE EXPEDIENTES
========================================== */


// ==========================================
// CARGAR EXPEDIENTES GUARDADOS
// INTEGRANTE 4: JSON Y CIFRADO
// ==========================================

let expedientes = cargarExpedientesSeguros();

let indiceEditando = -1;


// ==========================================
// ELEMENTOS DEL HTML
// ==========================================

const formulario = document.getElementById("formExpediente");
const codigo = document.getElementById("codigo");
const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const fecha = document.getElementById("fecha");
const descripcion = document.getElementById("descripcion");
const tabla = document.getElementById("tablaExpedientes");
const mensaje = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btnGuardar");
const contador = document.getElementById("contador");
const buscarCodigo = document.getElementById("buscarCodigo");
const btnBuscar = document.getElementById("btnBuscar");
const campoOrdenar = document.getElementById("campoOrdenar");
const btnOrdenar = document.getElementById("btnOrdenar");
const btnCifrar = document.getElementById("btnCifrar");
const btnDescifrar = document.getElementById("btnDescifrar");


// ==========================================
// SOLO LETRAS EN NOMBRE Y APELLIDO
// ==========================================

nombre.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
});

apellido.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
});


// ==========================================
// FORMATO EXP-001 (CÓDIGO Y BUSCAR)
// ==========================================

function formatearCodigoInput() {

    let valor = this.value.toUpperCase();

    valor = valor.replace("EXP-", "");
    valor = valor.replace(/[^0-9]/g, "");
    valor = valor.slice(0, 3);

    if (valor === "") {
        this.value = "";
        return;
    }

    this.value = "EXP-" + valor;
}

codigo.addEventListener("input", formatearCodigoInput);
buscarCodigo.addEventListener("input", formatearCodigoInput);


// ==========================================
// GUARDAR FORMULARIO
// ==========================================

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    guardarExpediente();
});


// ==========================================
// GUARDAR EXPEDIENTE
// INTEGRANTE 4: CIFRAR DESCRIPCIÓN
// ==========================================

function guardarExpediente() {

    const nuevoCodigo = codigo.value.trim();
    const nuevoNombre = nombre.value.trim();
    const nuevoApellido = apellido.value.trim();
    const nuevaFecha = fecha.value;
    const nuevaDescripcion = descripcion.value.trim();

    // CAMPOS VACÍOS
    if (
        nuevoCodigo === "" ||
        nuevoNombre === "" ||
        nuevoApellido === "" ||
        nuevaFecha === "" ||
        nuevaDescripcion === ""
    ) {
        mostrarMensaje("Todos los campos son obligatorios.", "error");
        return;
    }

    // SOLO LETRAS
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

    if (!soloLetras.test(nuevoNombre)) {
        mostrarMensaje("El nombre solo puede contener letras.", "error");
        return;
    }

    if (!soloLetras.test(nuevoApellido)) {
        mostrarMensaje("El apellido solo puede contener letras.", "error");
        return;
    }

    // FORMATO CÓDIGO
    const formatoCodigo = /^EXP-[0-9]{3}$/;

    if (!formatoCodigo.test(nuevoCodigo)) {
        mostrarMensaje("El código debe tener el formato EXP-001.", "error");
        return;
    }

    // NO PERMITIR EXP-000
    const numeroCodigo = parseInt(nuevoCodigo.substring(4));

    if (numeroCodigo === 0) {
        mostrarMensaje("El código debe iniciar desde EXP-001.", "error");
        return;
    }

    // VALIDAR FECHA
    if (!validarFecha()) {
        return;
    }

    // CÓDIGO DUPLICADO
    for (let i = 0; i < expedientes.length; i++) {
        if (expedientes[i].codigo === nuevoCodigo && i !== indiceEditando) {
            mostrarMensaje("Ya existe un expediente con ese código.", "error");
            return;
        }
    }

    // ======================================
    // CIFRADO CÉSAR DE LA DESCRIPCIÓN
    // ======================================

    let descripcionCifrada;
    try {
        descripcionCifrada = cifrarDescripcion(nuevaDescripcion, obtenerDesplazamiento());
    } catch (error) {
        mostrarMensaje(error.message, "error");
        return;
    }

    // CREAR OBJETO
    const expediente = {
        codigo: nuevoCodigo,
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        fecha: nuevaFecha,
        descripcion: descripcionCifrada
    };

    // RESPALDO PARA EVITAR PÉRDIDA DE DATOS
    // SI FALLA EL ALMACENAMIENTO

    const respaldoExpedientes = expedientes.slice();

    const estabaEditando = indiceEditando !== -1;

    if (indiceEditando === -1) {

        // NUEVO
        expedientes.push(expediente);

    } else {

        // EDITAR
        expedientes[indiceEditando] = expediente;

    }

    // GUARDAR EN JSON / LOCALSTORAGE

    if (!guardarDatos()) {

        expedientes = respaldoExpedientes;

        return;
    }

    if (estabaEditando) {

        indiceEditando = -1;
        btnGuardar.textContent = "Guardar expediente";

        mostrarMensaje(
            "Expediente actualizado correctamente.",
            "exito"
        );

    } else {

        mostrarMensaje(
            "Expediente registrado correctamente.",
            "exito"
        );

    }

    formulario.reset();
    mostrarExpedientes();
}


// ==========================================
// VALIDAR FECHA
// ==========================================

function validarFecha() {

    if (fecha.value === "") {
        return false;
    }

    if (!fechaValidaISO(fecha.value)) {
        mostrarMensaje("La fecha debe ser real y el año debe tener 4 dígitos (1000-9999).", "error");
        return false;
    }
    return true;
}


// ==========================================
// MOSTRAR EXPEDIENTES
// ==========================================

function mostrarExpedientes() {
    tabla.replaceChildren();
    expedientes.forEach((expediente, i) => {
        const fila = document.createElement("tr");
        const valores = [
            expediente.codigo, expediente.nombre, expediente.apellido,
            formatearFecha(expediente.fecha), descripcionSinPrefijo(expediente.descripcion)
        ];
        // textContent evita que un JSON importado ejecute código HTML/JS.
        valores.forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });
        const acciones = document.createElement("td");
        const editar = document.createElement("button");
        editar.className = "btn-editar";
        editar.textContent = "Editar";
        editar.type = "button";
        editar.addEventListener("click", () => editarExpediente(i));
        const eliminar = document.createElement("button");
        eliminar.className = "btn-eliminar";
        eliminar.textContent = "Eliminar";
        eliminar.type = "button";
        eliminar.addEventListener("click", () => eliminarExpediente(i));
        acciones.append(editar, eliminar);
        fila.appendChild(acciones);
        tabla.appendChild(fila);
    });
    contador.textContent = expedientes.length + " expediente(s)";
}

// Alias por si otra parte del código usa este nombre
function actualizarTabla() {
    mostrarExpedientes();
}


// ==========================================
// FORMATEAR FECHA
// ==========================================

function formatearFecha(fechaOriginal) {

    const partes = fechaOriginal.split("-");
    const anio = partes[0];
    const mes = partes[1];
    const dia = partes[2];

    return dia + "/" + mes + "/" + anio;
}


// ==========================================
// EDITAR
// INTEGRANTE 4: DESCIFRADO AUTOMÁTICO
// ==========================================

function editarExpediente(indice) {

    const expediente = expedientes[indice];

    codigo.value = expediente.codigo;
    nombre.value = expediente.nombre;
    apellido.value = expediente.apellido;
    fecha.value = expediente.fecha;

    // MOSTRAR EL TEXTO ORIGINAL PARA EDITAR

    descripcion.value = descifrarDescripcion(
        expediente.descripcion
    );

    indiceEditando = indice;
    btnGuardar.textContent = "Actualizar expediente";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// CANCELAR
// ==========================================

function cancelarEdicion() {

    indiceEditando = -1;
    formulario.reset();
    btnGuardar.textContent = "Guardar expediente";
    mostrarMensaje("Edición cancelada.", "normal");
}


// ==========================================
// ELIMINAR
// ==========================================

function eliminarExpediente(indice) {

    const confirmar = confirm("¿Está seguro de eliminar este expediente?");

    if (confirmar) {

        const codigoEliminado = expedientes[indice].codigo;
        const respaldoExpedientes = expedientes.slice();

        expedientes.splice(indice, 1);

        if (!guardarDatos()) {

            expedientes = respaldoExpedientes;

            return;
        }

        if (indiceEditando !== -1) {
            // Evita editar un índice incorrecto después de borrar un registro.
            cancelarEdicion();
        }
        mostrarExpedientes();
        mostrarMensaje("Expediente " + codigoEliminado + " eliminado correctamente.", "exito");
    }
}


// ==========================================
// GUARDAR EN NAVEGADOR
// INTEGRANTE 4: JSON Y MANEJO DE ERRORES
// ==========================================

function guardarDatos() {

    // NO SOBRESCRIBIR DATOS SI HUBO
    // UN ERROR AL LEER EL JSON ORIGINAL

    if (expeErrorCarga) {

        mostrarMensaje(
            "No se puede guardar: existe un error de lectura del almacenamiento.",
            "error"
        );

        return false;
    }

    try {

        const contenidoJSON = JSON.stringify(expedientes);

        localStorage.setItem(
            "expedientes",
            contenidoJSON
        );

        return true;

    } catch (error) {

        console.error(
            "Error al guardar expedientes:",
            error
        );

        mostrarMensaje(
            "No se pudieron guardar los expedientes.",
            "error"
        );

        return false;
    }
}


// ==========================================
// BÚSQUEDA (INTEGRANTE 3)
// SIN MODIFICACIONES
// ==========================================

// Muestra el resultado y las comparaciones de la búsqueda
function mostrarResultadoBusqueda(texto, tipo, comparaciones) {

    const resultado = document.getElementById("resultadoBusqueda");
    const contadorBusq = document.getElementById("contadorBusqueda");

    if (resultado) {
        resultado.textContent = texto;
        resultado.className = tipo;
    }

    if (contadorBusq) {
        contadorBusq.innerHTML =
            "Comparaciones de búsqueda: <strong>" + comparaciones + "</strong>";
    }
}

// Verifica que expedientes esté ordenado por código (requisito de la binaria)
function estaOrdenadoPorCodigo(arr) {

    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].codigo > arr[i + 1].codigo) {
            return false;
        }
    }

    return true;
}

// Búsqueda secuencial: recorre uno por uno (no necesita orden)
// Devuelve { indice, comparaciones }
function busquedaSecuencial(arr, codigoBuscado) {

    let comparaciones = 0;

    for (let i = 0; i < arr.length; i++) {

        comparaciones++;

        if (arr[i].codigo === codigoBuscado) {
            return { indice: i, comparaciones: comparaciones };
        }
    }

    return { indice: -1, comparaciones: comparaciones };
}

// Búsqueda binaria: divide el arreglo a la mitad (requiere orden por código)
// Devuelve { indice, comparaciones }
function busquedaBinaria(arr, codigoBuscado) {

    let inicio = 0;
    let fin = arr.length - 1;
    let comparaciones = 0;

    while (inicio <= fin) {

        let medio = Math.floor((inicio + fin) / 2);

        comparaciones++;

        if (arr[medio].codigo === codigoBuscado) {
            return { indice: medio, comparaciones: comparaciones };
        }

        if (arr[medio].codigo < codigoBuscado) {
            inicio = medio + 1;
        } else {
            fin = medio - 1;
        }
    }

    return { indice: -1, comparaciones: comparaciones };
}

// Botón buscar
btnBuscar.addEventListener("click", function () {

    const selectBusqueda = document.getElementById("tipoBusqueda");
    const algoritmoBusqueda = selectBusqueda ? selectBusqueda.value : "";
    const codigoBuscado = buscarCodigo.value.trim();

    if (algoritmoBusqueda === "") {
        mostrarMensaje("Seleccione un algoritmo de búsqueda.", "error");
        return;
    }

    if (!/^EXP-[0-9]{3}$/.test(codigoBuscado)) {
        mostrarMensaje("Ingrese un código válido con el formato EXP-001.", "error");
        return;
    }

    if (expedientes.length === 0) {
        mostrarMensaje("No hay expedientes registrados para buscar.", "error");
        return;
    }

    // La binaria necesita los datos ordenados por el campo buscado (código)
    if (algoritmoBusqueda === "binaria" && !estaOrdenadoPorCodigo(expedientes)) {
        mostrarMensaje(
            "La búsqueda binaria requiere datos ordenados. Ordene primero por Código.",
            "error"
        );
        return;
    }

    let busqueda;

    if (algoritmoBusqueda === "secuencial") {
        busqueda = busquedaSecuencial(expedientes, codigoBuscado);
    } else {
        busqueda = busquedaBinaria(expedientes, codigoBuscado);
    }

    // Refresca la tabla para quitar resaltados anteriores
    mostrarExpedientes();

    if (busqueda.indice !== -1) {

        const encontrado = expedientes[busqueda.indice];

        mostrarResultadoBusqueda(
            "Encontrado: " + encontrado.codigo + " - " +
            encontrado.nombre + " " + encontrado.apellido +
            " (posición " + (busqueda.indice + 1) + ")",
            "encontrado",
            busqueda.comparaciones
        );

        tabla.rows[busqueda.indice].classList.add("fila-encontrada");

    } else {

        mostrarResultadoBusqueda(
            "No se encontró el expediente " + codigoBuscado,
            "no-encontrado",
            busqueda.comparaciones
        );
    }
});


// ==========================================
// CIFRADO CÉSAR (INTEGRANTE 4)
// ==========================================

// Los eventos de los botones btnCifrar y
// btnDescifrar están implementados en:
//
// CifradoJSON.js
//
// No se agregan aquí para evitar que
// se ejecuten dos veces.


// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    if (tipo === "error") {
        mensaje.style.color = "red";
    } else if (tipo === "exito") {
        mensaje.style.color = "green";
    } else {
        mensaje.style.color = "#555";
    }

    setTimeout(function () {
        mensaje.textContent = "";
    }, 3000);
}


// ==========================================
// ORDENAMIENTO (INTEGRANTE 2)
// SIN MODIFICACIONES
// ==========================================

// Compara dos expedientes según el campo (codigo o nombre)
function comparar(a, b, campo) {
    return String(a[campo]).localeCompare(
        String(b[campo]),
        "es",
        { sensitivity: "base" }
    );
}

// Muestra las comparaciones en el HTML
function mostrarComparaciones(total) {

    const contadorComp = document.getElementById("contadorComparaciones");

    if (contadorComp) {
        contadorComp.innerHTML =
            "Comparaciones realizadas: <strong>" + total + "</strong>";
    }
}

// Burbuja manual (devuelve el arreglo ordenado)
function ordenarBurbuja(arr, campo) {

    let n = arr.length;
    let comparaciones = 0;
    let intercambiado;

    do {
        intercambiado = false;

        for (let i = 0; i < n - 1; i++) {

            comparaciones++;

            if (comparar(arr[i], arr[i + 1], campo) > 0) {
                let temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
                intercambiado = true;
            }
        }

        n--;

    } while (intercambiado);

    mostrarComparaciones(comparaciones);

    return arr;
}

// Selección manual (devuelve el arreglo ordenado)
function ordenarPorSeleccion(arr, campo) {

    let n = arr.length;
    let comparaciones = 0;

    for (let i = 0; i < n - 1; i++) {

        let minIndex = i;

        for (let j = i + 1; j < n; j++) {

            comparaciones++;

            if (comparar(arr[j], arr[minIndex], campo) < 0) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            let temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }

    mostrarComparaciones(comparaciones);

    return arr;
}

// Único listener del botón ordenar
btnOrdenar.addEventListener("click", function () {

    const selectAlgoritmo = document.getElementById("tipoAlgoritmo");
    const algoritmoSeleccionado = selectAlgoritmo ? selectAlgoritmo.value : "";
    const campoSeleccionado = campoOrdenar.value;

    if (algoritmoSeleccionado === "") {
        mostrarMensaje("Seleccione un algoritmo (Burbuja o Selección).", "error");
        return;
    }

    if (campoSeleccionado === "") {
        mostrarMensaje("Seleccione si desea ordenar por código o nombre.", "error");
        return;
    }

    if (expedientes.length === 0) {
        mostrarMensaje("No hay expedientes registrados para ordenar.", "error");
        return;
    }

    // Ejecuta el algoritmo elegido y contabiliza las operaciones
    const respaldoOrden = expedientes.slice();
    if (algoritmoSeleccionado === "burbuja") {
        expedientes = ordenarBurbuja(expedientes, campoSeleccionado);
    } else if (algoritmoSeleccionado === "seleccion") {
        expedientes = ordenarPorSeleccion(expedientes, campoSeleccionado);
    }

    if (!guardarDatos()) {
        expedientes = respaldoOrden;
        mostrarExpedientes();
        return;
    }
    indiceEditando = -1;
    formulario.reset();
    btnGuardar.textContent = "Guardar expediente";
    mostrarExpedientes();
    mostrarMensaje("Expedientes ordenados correctamente.", "exito");
});


// ==========================================
// MOSTRAR DATOS AL INICIAR
// INTEGRANTE 4: MIGRACIÓN DE JSON
// ==========================================

// Convertir registros anteriores al formato
// cifrado, únicamente cuando sea necesario.

if (expeMigracionPendiente && !expeErrorCarga) {

    guardarDatos();

}

// Mostrar expedientes al abrir la aplicación.

mostrarExpedientes();
