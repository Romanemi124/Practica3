import { MongoClient, ObjectId } from "mongodb";
import { KidModel, LugarModel } from "./types.ts";
import { haversine } from "./utils.ts";
import "https://deno.land/x/dotenv/load.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) {
    Deno.exit(1);
    console.log("El link de mongo no existe");
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Se ha conectado a la base de datos");

const db = client.db("examen");
const ninosCollection = db.collection<KidModel>("niños");
const ubicacionesCollection = db.collection<LugarModel>("ubicacion");

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    if (method === "POST") {

        if (pathname === "/ubicacion") {
            try {
                const { nombre, coordenadas, numeroNinosBuenos } = await req.json();

                if (!nombre || !coordenadas || numeroNinosBuenos < 0) {
                    return new Response(JSON.stringify({ error: "Datos invalidos o faltan datoss" }), { status: 400 });
                }

                const exists = await ubicacionesCollection.findOne({ nombre });
                if (exists) return new Response(JSON.stringify({ error: "La ubicacion ya existe. Son nombres unicos" }), { status: 409 });

                const id = await ubicacionesCollection.insertOne({
                    nombre,
                    coordenadas,
                    numeroNinosBuenos,
                });

                return new Response(JSON.stringify({ mensaje: "Ubicación creada correctamente", id }), { status: 201 });
            } catch (error) {
                console.error("Error en /ubicacion:", error);
                return new Response(JSON.stringify({ error: "Error del servidor" }), { status: 500 });
            }
        }

        else if (pathname === "/ninos") {
            try {
                const { nombre, comportamiento, ubicacion } = await req.json();

                if (!nombre || !comportamiento || !ubicacion || !["bueno", "malo"].includes(comportamiento)) {
                    return new Response(JSON.stringify({ error: "Datos inválidos o faltantes" }), { status: 400 });
                }

                const lugar = await ubicacionesCollection.findOne({ _id: new ObjectId(ubicacion) });
                if (!lugar) return new Response(JSON.stringify({ error: "Ubicacion no encontrada" }), { status: 404 });

                const exists = await ninosCollection.findOne({ nombre });
                if (exists) return new Response(JSON.stringify({ error: "El niño ya existe" }), { status: 409 });

                const id = await ninosCollection.insertOne({ nombre, comportamiento, ubicacion: new ObjectId(ubicacion) });

                if (comportamiento === "bueno") {
                    await ubicacionesCollection.updateOne({ _id: new ObjectId(ubicacion) }, { $inc: { numeroNinosBuenos: 1 } });
                }

                return new Response(JSON.stringify({ mensaje: "Niño creado correctamente", id }), { status: 201 });
            } catch (error) {
                console.error("Error en /ninos:", error);
                return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
            }
        }
    }

    if (method === "GET") {

        if (pathname === "/ninos/buenos") {
            const buenos = await ninosCollection.find({ comportamiento: "bueno" }).toArray();
            return new Response(JSON.stringify(buenos), { status: 200 });
        }

        else if (pathname === "/ninos/malos") {
            const malos = await ninosCollection.find({ comportamiento: "malo" }).toArray();
            return new Response(JSON.stringify(malos), { status: 200 });
        }

        else if (pathname === "/entregas") {
            const entregas = await ubicacionesCollection.find().sort({ numeroNinosBuenos: -1 }).toArray();
            return new Response(JSON.stringify(entregas), { status: 200 });
        }

        else if (pathname === "/ruta") {
            try {
                const ubicaciones = await ubicacionesCollection.find().sort({ numeroNinosBuenos: -1 }).toArray();

                if (ubicaciones.length < 2) {
                    return new Response(JSON.stringify({ distanciaTotal: 0 }), { status: 200 });
                }

                let distanciaTotal = 0;

                for (let i = 0; i < ubicaciones.length - 1; i++) {
                    const { lat: lat1, long: lon1 } = ubicaciones[i].coordenadas;
                    const { lat: lat2, long: lon2 } = ubicaciones[i + 1].coordenadas;

                    distanciaTotal += haversine(lat1, lon1, lat2, lon2);
                }

                return new Response(JSON.stringify({ distanciaTotal }), { status: 200 });
            } catch (error) {
                console.error("Error en /ruta:", error);
                return new Response(JSON.stringify({ error: "Error del servidor" }), { status: 500 });
            }
        }
    }

    return new Response("Not found", { status: 404 });
};

Deno.serve({ port: 6768 }, handler);