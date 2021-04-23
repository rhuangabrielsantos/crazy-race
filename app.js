require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const httpServer = require("http").createServer(app);
const port = process.env.PORT || 3000;

const io = require("socket.io")(httpServer, {});

const { create, findAll } = require('./src/cars.js');

const axios = require('axios');

app.use(express.static('public'))
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/images', express.static(__dirname + '/public/images'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', async (req, res) => {
  let cars = await findAll();

  res.render('index', {'cars': cars})
})

app.get('/about', (req, res) => {
  res.render('about');
})

app.post('/cars', async (req, res) => {
  let response = await create(req.body);

  res.json(response)
})

io.on("connection", (socket) => {
  socket.on("created-car", async (arg) => {
    let cars = await findAll()

    socket.broadcast.emit('reload-cars', cars)
  });
});

httpServer.listen(port)
