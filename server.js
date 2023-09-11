//requerimos expres para poder empezar a uasar el servidor
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const app = express();

const port = 30000; 


app.get('/', async (req, res) => {
    res.send('Welcome to the server');
})

//llamamos servidor para que de una repuesta
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});