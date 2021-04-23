require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const httpServer = require("http").createServer(app);
const port = process.env.PORT || 3000;

const io = require("socket.io")(httpServer, {});

const { create, findAll, findBy, deleteById } = require('./src/cars.js');

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
  let hashCar = null;

  socket.on("created-car", async (arg) => {
    hashCar = arg.hashCar

    let cars = await findAll()

    socket.broadcast.emit('reload-cars', cars)
  });

  socket.on('disconnect', async () => {
    if(hashCar) {
      let car = await findBy('hashCar', hashCar)
      let response = await deleteById(car.id)
  
      if (response.status === 200) {
        let cars = await findAll();
  
        socket.broadcast.emit('reload-cars', cars);
      }
    }
  });
});

httpServer.listen(port)
