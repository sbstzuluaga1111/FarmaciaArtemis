
const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config()

const bases = process.env.MONGO_URI;

const nombreBases = "farmaciaCampus";
const monguito = require('mongodb').MongoClient


router.get('/', (req, res)=> {
    try {
        res.json("Somos CL")
    } catch (e) {
        res.status(500).json("estoy mal")
    }
});


///// Obtener todos los medicamentos con menos de 50 unidades en stock.

router.get('/ejercicio1', async (req, res)=> {
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db(nombreBases);
        const colection = db.collection('medicamentos')
        const result = await colection.find({"stock":{'$lt':50}}).toArray()
        res.json(result);
        client.close();
        
    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
        
    }
});

///// Listar los proveedores con su información de contacto en medicamentos.

router.get('/ejercicio2', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db(nombreBases);
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Medicamentos comprados al ‘Proveedor A’.

router.get('/ejercicio3', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombreBases);
        const medicaColletion = db.collection('medicamentos');
        const comprasCollection = db.collection('compras');
       
        const medicamentosProveedorA = await medicaColletion.find({
            "proveedor.nombre": "ProveedorA"
        }).toArray();

        const nombresMedicamentos = medicamentosProveedorA.map(med => med.nombre);

        const comprasProveedorA = await comprasCollection.find({
            "medicamentosComprados.nombreMedicamento": { $in: nombresMedicamentos }
        }).toArray();

        res.json(comprasProveedorA);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Obtener ventas médicas emitidas después del 1 de enero de 2023.

router.get('/ejercicio4', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombreBases);
        const ventasCollection = db.collection('ventas');

        const result = await ventasCollection.find({
            fechaVenta: { $gt: new Date('2023-01-01') }
        }).toArray();
        res.json(result);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Total de ventas del medicamento ‘Paracetamol’.

router.get('/ejercicio5', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const ventasCollection = db.collection('ventas');

        const ventasParacetamol = await ventasCollection.find({
            "medicamentosVendidos.nombreMedicamento": "Paracetamol"
        }).toArray();

        let totalVentasParacetamol = 0;
        ventasParacetamol.forEach(venta => {
            venta.medicamentosVendidos.forEach(med => {
                if (med.nombreMedicamento === "Paracetamol") {
                    totalVentasParacetamol += med.cantidadVendida;
                }
            });
        });

        res.json({ totalVentasParacetamol });
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Medicamentos que caducan antes del 1 de enero de 2024.

router.get('/ejercicio6', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const medicaColletion = db.collection('medicamentos');

        const fechaLimite = new Date("2024-01-01T00:00:00Z");

        const result = await medicaColletion.find({
            "fechaExpiracion": { $lt: fechaLimite }
        }).toArray();

        res.json(result);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("Error en el servidor");
    }
});

///// Total de medicamentos vendidos por cada proveedor.

router.get('/ejercicio7', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const ventasCollection = db.collection('ventas');

        const total = [
            {
                $unwind: "$medicamentosVendidos"
            },
            {
                $group: {
                    _id: "$medicamentosVendidos.proveedor.nombre",
                    totalMedicamentosVendidos: { $sum: "$medicamentosVendidos.cantidadVendida" }
                }
            }
        ];

        const result = await ventasCollection.aggregate(total).toArray();

        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Cantidad total de dinero recaudado por las ventas de medicamentos.

router.get('/ejercicio8', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const ventasCollection = db.collection('ventas');

        const ventas = await ventasCollection.find().toArray();
        let totalDineroRecaudado = 0;

        ventas.forEach((venta) => {
            venta.medicamentosVendidos.forEach((medicamento) => {
                totalDineroRecaudado += medicamento.cantidadVendida * medicamento.precio;
            });
        });

        res.json({ totalDineroRecaudado });
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Medicamentos que no han sido vendidos.

router.get('/ejercicio9', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const medicaColletion = db.collection('medicamentos');
        const ventasCollection = db.collection('ventas');

        const medicamentosVendidos = await ventasCollection.distinct('medicamentosVendidos.nombreMedicamento');

        const medicamentosNoVendidos = await medicaColletion.find({
            nombre: { $nin: medicamentosVendidos }
        }).toArray();

        res.json(medicamentosNoVendidos);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Obtener el medicamento más caro.

router.get('/ejercicio10', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const medicaColletion = db.collection('medicamentos');

        const medicamentoMasCaro = await medicaColletion.find()
            .sort({ precio: -1 })
            .limit(1)
            .toArray();

        res.json(medicamentoMasCaro);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Número de medicamentos por proveedor.

router.get('/ejercicio11', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const medicaColletion = db.collection('medicamentos');

        const numeroMedicamentosPorProveedor = await medicaColletion.aggregate([
            {
                $group: {
                    _id: "$proveedor.nombre",
                    totalMedicamentos: { $sum: 1 }
                }
            }
        ]).toArray();
        res.json(numeroMedicamentosPorProveedor);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Pacientes que han comprado Paracetamol.

router.get('/ejercicio12', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const ventasCollection = db.collection('ventas');

        const ventasConParacetamol = await ventasCollection.find({
            "medicamentosVendidos.nombreMedicamento": "Paracetamol"
        }).toArray();

        const pacientesConParacetamol = ventasConParacetamol.map((venta) => venta.paciente);

        res.json(pacientesConParacetamol);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("Error en el servidor");
    }
});

///// Proveedores que no han vendido medicamentos en el último año.

router.get('/ejercicio13', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db('farmaciaCampus');
        const medicamentosCollection = db.collection('medicamentos');
        const ventasCollection = db.collection('ventas');

        const fechaHaceUnAnio = new Date();
        fechaHaceUnAnio.setFullYear(fechaHaceUnAnio.getFullYear() - 1);

        const proveedoresNoVendieron = await medicamentosCollection.distinct("proveedor.nombre", {
            "fechaVenta": { $lt: fechaHaceUnAnio }
        });

        res.json(proveedoresNoVendieron);
        client.close();
    } catch (e) {
        console.error(e);
        res.status(500).json("nada :c");
    }
});

///// Obtener el total de medicamentos vendidos en marzo de 2023.

router.get('/ejercicio14', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Obtener el medicamento menos vendido en 2023.

router.get('/ejercicio15', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Ganancia total por proveedor en 2023 (asumiendo un campo precioCompra en Compras).

router.get('/ejercicio16', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Promedio de medicamentos comprados por venta.

router.get('/ejercicio17', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Cantidad de ventas realizadas por cada empleado en 2023.

router.get('/ejercicio18', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Obtener todos los medicamentos que expiren en 2024.

router.get('/ejercicio19', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Empleados que hayan hecho más de 5 ventas en total.

router.get('/ejercicio20', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Medicamentos que no han sido vendidos nunca.

router.get('/ejercicio21', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Paciente que ha gastado más dinero en 2023.

router.get('/ejercicio22', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Empleados que no han realizado ninguna venta en 2023.

router.get('/ejercicio23', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Proveedor que ha suministrado más medicamentos en 2023.

router.get('/ejercicio24', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Pacientes que compraron el medicamento “Paracetamol” en 2023.

router.get('/ejercicio25', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Total de medicamentos vendidos por mes en 2023.

router.get('/ejercicio26', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Empleados con menos de 5 ventas en 2023.

router.get('/ejercicio27', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Número total de proveedores que suministraron medicamentos en 2023.

router.get('/ejercicio28', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Proveedores de los medicamentos con menos de 50 unidades en stock.

router.get('/ejercicio29', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Pacientes que no han comprado ningún medicamento en 2023.

router.get('/ejercicio30', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Medicamentos que han sido vendidos cada mes del año 2023.

router.get('/ejercicio31', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Empleado que ha vendido la mayor cantidad de medicamentos distintos en 2023.

router.get('/ejercicio32', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Total gastado por cada paciente en 2023.

router.get('/ejercicio33', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Medicamentos que no han sido vendidos en 2023.

router.get('/ejercicio34', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Proveedores que han suministrado al menos 5 medicamentos diferentes en 2023.

router.get('/ejercicio35', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Total de medicamentos vendidos en el primer trimestre de 2023.

router.get('/ejercicio36', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Empleados que no realizaron ventas en abril de 2023.

router.get('/ejercicio37', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const result = await colection.distinct("proveedor")
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})

///// Medicamentos con un precio mayor a 50 y un stock menor a 100.

router.get('/ejercicio38', async (req,res)=>{
    try {
        const client = new MongoClient(bases)
        await client.connect();
        const db = client.db('farmaciaCampus');
        const colection = db.collection('medicamentos')

        const x = Number

        const result = await colection.find({"stock":{'$lt':100}}).toArray()
        
        res.json(result);
        client.close();

    } catch (e) {
        console.log(e)
        res.status(404).json("nada :c")
    }
})


module.exports = router;