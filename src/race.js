const axios = require('axios');

async function acceptRace(id) {
  return axios.put(process.env.API + '/acceptRace/' + id)
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

async function refuseRace(id) {
  return axios.put(process.env.API + '/refuseRace/' + id)
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

async function defineAllPositions() {
  return axios.put(process.env.API + '/defineAllPositions/')
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

async function startRace() {
  return axios.post(process.env.API + '/startRace/')
    .then((response) => {
      return response.data
    }, (error) => {
      console.log(error)
    });
}

module.exports = { acceptRace, refuseRace, defineAllPositions, startRace }