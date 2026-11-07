# ExpeNova — Proyecto final de Algoritmos

Universidad Mariano Gálvez de Guatemala — Sistema web de expedientes ficticios.

## Cómo ejecutar

1. Descomprimir el ZIP completo en una carpeta, **sin cambiar los nombres** de los archivos.
2. Abrir `index.html` en Chrome o Edge, o con la extensión Live Server de VS Code (recomendado).
3. Registrar un expediente con código `EXP-001` hasta `EXP-999`, nombre, apellido, fecha y descripción.
4. En **Cifrado César**, elegir un desplazamiento entero entre **1 y 25**. Al guardar, el expediente queda cifrado usando ese desplazamiento. El botón **Cifrar descripción** vuelve a cifrar las descripciones existentes con el desplazamiento elegido; **Descifrar descripción** las muestra en texto legible temporalmente en pantalla.
5. Elegir **Burbuja** o **Selección** y ordenar por **Código** o **Nombre** para ver las comparaciones.
6. Para búsqueda **Binaria**, ordenar primero por **Código**. La **Secuencial** no necesita orden previo.
7. Usar **Descargar JSON** para crear un respaldo e importar el archivo `expedientes_ejemplo.json` para probar la aplicación.

## Persistencia y limitaciones

Los registros se guardan como JSON en `localStorage` del navegador; sobreviven a recargar y cerrar la pestaña. **No** se sincronizan entre navegadores, perfiles ni computadoras. No usar modo incógnito para pruebas de persistencia. Antes de limpiar los datos del navegador, descargar un JSON de respaldo. Importar sustituye los registros locales después de confirmar.

El Cifrado César se implementa manualmente con desplazamientos y es **educativo, NO proporciona confidencialidad real**. No ingresar datos personales reales. Las letras A-Z se desplazan y se conservan acentos y signos; los cambios de desplazamiento respetan el que tenía originalmente cada registro.

## Archivos

- `index.html`: interfaz web.
- `Estilos.css`: presentación.
- `App.js`: operaciones CRUD, búsquedas, algoritmos de ordenamiento y métricas.
- `CifradoJSON.js`: César configurable, validación JSON, importación y exportación.
- `Logo.png`: identidad gráfica.
- `expedientes_ejemplo.json`: datos completamente ficticios.

## Pruebas recomendadas para la exposición

- Registrar EXP-003, EXP-001, EXP-002; comprobar ordenamientos y número de comparaciones.
- Buscar EXP-002 y EXP-999 con búsqueda secuencial y con binaria luego de ordenar por código.
- Intentar registrar EXP-001 dos veces; dejar campos vacíos; probar EXP-000 y fechas inválidas.
- Cifrar con +3 (`HOLA` → `KROD`), cambiar a +5 y luego descifrar.
- Refrescar el navegador y comprobar que persisten los registros.
- Exportar JSON, importar el archivo de ejemplo y comprobar edición y borrado.
- Probar un archivo JSON inválido y confirmar que los datos guardados no se pierden.

## Documentación que todavía debe entregar el grupo

La consigna solicita además una **foto grupal**, una **propuesta de valor**, **evidencias con capturas de pruebas de calidad**, explicación de las decisiones y algoritmos, y una demostración oral. Estos materiales no son reemplazables por el código.

## Modo claro y oscuro

En la esquina superior derecha hay un botón con luna o sol. Presionarlo cambia la apariencia de la aplicación y guarda la elección para la próxima vez que se abra en ese navegador. El archivo `Tema.js` controla esta función; no afecta los expedientes guardados.


## Panel Dashboard
El panel izquierdo muestra el número real de expedientes guardados y el uso de los cuatro algoritmos. El total se actualiza cuando se crean, eliminan o importan expedientes. El conteo de algoritmos empieza en cero desde la instalación de esta versión, se guarda en localStorage y es local a cada navegador. No representa el historial anterior. No necesita instalación adicional.
