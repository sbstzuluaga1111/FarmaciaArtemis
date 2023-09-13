//requerimos expres para poder empezar a uasar el servidor
const express = require('express');

const cors = require('cors');

const path = require('path');

const dotenv = require('dotenv');

const MongoClient = require('mongodb').MongoClient;

dotenv.config({
    path: './Config.env'
})

const app = express();

const PORT= process.env.PORT || 5000;


const url = process.env.MONGO_URI;

MongoClient.connect(url)
.then(client=>{
    console.log('Connect to Mongo server')
    app.listen(PORT, ()=>console.log('Connected to Mongo server'+PORT))

    const db = client.db('farmacia');

    const medicamentos = db.collection('medicamentos');

app.use(cors())
app.use(express.json());



app.get('/medicamentos',(req,res)=>{
    medicamentos.find({})
    .toArray()
    .then(results=>{
        res.status(200).json({
        success: true,
        data: results,
    })
    }).catch(err=>{
        res.status(500).json({
            success: false,
        })
    });
})

})
.catch((err)=>{
    console.log(err.message);
})