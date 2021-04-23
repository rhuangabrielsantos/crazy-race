const axios = require('axios');

async function findAll() { 
  return axios.get(process.env.API + '/cars')
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

async function findBy(column, value) { 
  return axios.get(process.env.API + '/cars/' + column + '/' + value)
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

async function create(car) {
  return axios.post(process.env.API + '/cars', car)
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

async function deleteById(id) {
  return axios.delete(process.env.API + '/cars/' + id)
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

module.exports = { create, findAll, findBy, deleteById }