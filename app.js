require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000;

const axios = require('axios');

app.use(express.static('public'))
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/images', express.static(__dirname + '/public/images'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
  axios.get(process.env.API + '/cars')
    .then((response) => {
      res.render('index', {'cars': response.data})
    }, (error) => {
      console.log(error);
    });

})

app.post('/cars', (req, res) => {
  axios.post(process.env.API + '/cars', req.body)
    .then((response) => {
      res.json(response.data)
    }, (error) => {
      console.log(error);
    });
})

app.listen(port)