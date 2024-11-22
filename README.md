1. Configuración inicial del proyecto
Crea un nuevo proyecto en Dino, abriendo un APIrest en el puerto 6768
Conecta el proyecto a una base de datos MongoDB
Crea un esquema para almacenar información de los niños:
nombre (string, único, obligatorio)
comportamiento (enum: 'bueno', 'malo')
ubicacion (ID).
Crea un esquema para almacenar información de los lugares:
nombre (string, único, obligatorio)
coordenadas (enum: 'bueno', 'malo')
Número de niños buenos

Tarea: Escribe el código base para inicializar el servidor, conectar a MongoDB y definir los esquemas.
(Todos los niños deben tener obligatoriamente los tres variables rellenas, nombre, comportamiento y ubicación)
(La ubicación del niño debe existir antes del niño)

2. Funcionalidades del API REST
Implementa los siguientes endpoints:
POST /ubicacion: Agregar lugar
Confirmar que las coordenadas son reales y no se repite el nombre
POST /ninos: Agrega un nuevo niño.
Valida que el nombre sea único y el comportamiento esté entre 'bueno' o 'malo'.
GET /ninos/buenos: Devuelve una lista de niños con comportamiento 'bueno'.
GET /ninos/malos: Devuelve una lista de niños con comportamiento 'malo'.
Tarea: Escribe los controladores para cada uno de los endpoints y valida las entradas correctamente.

3. Orden de entrega por lugares
Implementa un endpoint:
GET /entregas: Devuelve las ubicaciones ordenadas de mayor a menor por cantidad de niños buenos.
Tarea:
Implementa una función que calcule la cantidad de niños buenos por ubicación al hacer la petición.
Configura la ruta para devolver los datos ordenados.

4. Cálculo de distancias entre ubicaciones
GET /ruta: Devuelve la distancia total a recorrer por Santa Claus.
Calcula las distancias entre las ubicaciones ordenadas de mayor a menor cantidad de niños buenos.
Usa la fórmula de Haversine para calcular las distancias entre cada par de ubicaciones.
Devuelve la distancia total en kilómetros.



Coff coff:

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const toRad = (deg) => (deg * Math.PI) / 180; // Conversión a radianes

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a = Math.sin(dLat / 2) ** 2 +
       Math.cos(lat1Rad) * Math.cos(lat2Rad) *
       Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en km
}




--------------------------------------------
