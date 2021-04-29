require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const httpServer = require("http").createServer(app)
const port = process.env.PORT || 3000

const io = require("socket.io")(httpServer, {})

const { create, findAll, findBy, deleteById, saveNumber, updatePositions } = require('./src/cars.js')
const { acceptRace, refuseRace } = require('./src/race.js')

app.use(express.static('public'))
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/images', express.static(__dirname + '/public/images'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('', async (req, res) => {
  let cars = await findAll();

  res.sendFile(__dirname + '/views/index.html')
})

app.post('/cars', async (req, res) => {
  let response = await create(req.body)

  res.json(response)
})

io.on("connection", (socket) => {
  let hashCar = null;

  socket.on('load-cars', async () => {
    let cars = await findAll()
    socket.emit('reload-cars', cars)
  })

  socket.on("created-car", async (arg) => {
    hashCar = arg.hashCar

    let cars = await findAll()

    socket.broadcast.emit('reload-cars', cars)
  });

  socket.on("update-hash-user", async (arg) => {
    let car = await findBy('hashCar', arg.hashCar)

    if(car.status === 404) {
      return;
    }

    hashCar = arg.hashCar;

    socket.emit('car-exists', car.status)
  })

  socket.on("accept-race", async (arg) => {
    let car = await findBy('hashCar', arg.hashCar)

    let response = await acceptRace(car.id)

    if (response.status === 200) {
      let cars = await findAll()
      socket.emit('reload-cars', cars)
      socket.broadcast.emit('reload-cars', cars)
      return;
    }
  })
  
  socket.on("refuse-race", async (arg) => {
    let car = await findBy('hashCar', arg.hashCar)

    let response = await refuseRace(car.id)

    if (response.status === 200) {
      let cars = await findAll()
      socket.emit('reload-cars', cars)
      socket.broadcast.emit('reload-cars', cars)
      return;
    }
  })

  socket.on("save-number", async (arg) => {
    console.log('Server: save-number')

    let response = await saveNumber(arg.id, arg.number)

    if (response.status === 200) {
      let cars = await findAll()
      socket.broadcast.emit('saved-number', cars)
    }
  })

  socket.on("update-positions", async() => {
    console.log('Server: update-positions')

    let response = await updatePositions()

    if (response.status === 200) {
      let cars = await findAll()
      socket.emit('reload-cars-race', cars)
      socket.broadcast.emit('reload-cars-race', cars)
    }
  })

  socket.on('disconnect', async () => {
    if(hashCar) {
      let car = await findBy('hashCar', hashCar)
      let response = await deleteById(car.id)
  
      if (response.status === 200) {
        let cars = await findAll()
  
        socket.broadcast.emit('reload-cars', cars)
      }
    }
  });
});

httpServer.listen(port)
