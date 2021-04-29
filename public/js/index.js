var myModal = new bootstrap.Modal(document.getElementById('createCar'), {})

const socket = io();

socket.emit("load-cars", '');

if(localStorage.getItem('hashCar')) {
  socket.emit("update-hash-user", {hashCar: localStorage.getItem('hashCar')});
}

$(document).ready(() => {
  var myCarousel = document.querySelector('#carsCarousel')

  var carousel = new bootstrap.Carousel(myCarousel, {
    interval: false
  })

  var forms = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault()

        if (!form.checkValidity()) {
          event.stopPropagation()
          form.classList.add('was-validated')
          return false;
        }

        form.classList.add('was-validated')

        createCar()

        const socket = io();
        socket.emit("created-car", {hashCar: localStorage.getItem('hashCar')});

        $('#criarCompetidor').addClass('disable')
        $('#aceitarCorrida').removeClass('disable')

      }, false)
  })

  function createCar() {
    let data = prepareData()

    $.ajax({
      method: 'POST',
      url: '/cars',
      data: data,
      success: (response) => {
        if (response.status === 201) {
          myModal.hide();

          var success = new bootstrap.Modal(document.getElementById('success'), {})
          success.show();

          localStorage.setItem('hashCar', response.hashCar);
          return;
        }

        $(".error").html(
          '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            'O piloto já existe!' +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
          '</div>'
        )
      } 
    })
  }

  function prepareData() {
    let data = $("#formCreateCar").serializeArray()

    let formattedData = {}

    $(data).each((index, item) => {
      formattedData[item.name] = item.value
    })

    return formattedData
  }
})

function showModalCreateCar() {
  myModal.show();
}

function setColor(action) {
  if(action === 'next') {
    $("#color").val($(".carousel-item.active").data('next-color'))
    return;
  }

  $("#color").val($(".carousel-item.active").data('prev-color'))
}

socket.on('reload-cars', (cars) => {
  if(cars.status === 400) {
    $("#cars").html('');
    return;
  }

  reloadCarsView(cars)

  raceCanStart(cars)
})

socket.on('car-exists', (status) => {
  $('#criarCompetidor').addClass('disable')
  
  if (status === 'pending') {
    $('#aceitarCorrida').removeClass('disable')
    return
  }

  $('#recusarCorrida').removeClass('disable')
})

function reloadCarsView(cars) {
  let carHtml = '<section class="d-flex justify-content-center align-items-center">'

  $(cars).each((index, car) => {
    carHtml += 
      '<section class="d-flex flex-column justify-content-center m-3 align-items-center">' +
        `<img src="/images/race/${car.color}-car.svg" class="car car-race" alt="car">` +

        '<div class="d-flex justify-content-center align-items-center">' +
          `<img src="/images/${car.status}.svg" alt="accepted" class="me-1">` +
          `<h1 class="text-white bangers text-limit m-auto" >${car.racing_driver}</h1>` +
        '<div>' +
      '</section>';

    if (((index + 1) % 3) === 0) {
      carHtml += '</section><section class="d-flex justify-content-center align-items-center">';
    }    
  })

  carHtml += '</section>';

  $("#cars").html(carHtml);
}

function acceptRace() {
  $('#aceitarCorrida').addClass('disable')
  $('#recusarCorrida').removeClass('disable')

  socket.emit('accept-race', {hashCar: localStorage.getItem('hashCar')})
}

function refuseRace() {
  $('#aceitarCorrida').removeClass('disable')
  $('#recusarCorrida').addClass('disable')

  socket.emit('refuse-race', {hashCar: localStorage.getItem('hashCar')})
}

function raceCanStart(cars) {
  if(cars.length === 1) {
    return;
  }

  let canStart = true;

  $(cars).each((index, car) => {
    if(car.status === 'pending') {
      canStart = false
    }
  })

  if (canStart) {
    socket.emit('start-race', {})
  }
}

socket.on('race-was-started', (cars) => {
  startRace(cars)
})

function startRace(cars) {
  hiddenButtons()
  countdown(cars)
}

function hiddenButtons() {
  $('#recusarCorrida').addClass('disable')
}

function countdown(cars) {
  let timer = 3;

  let intervalId = setInterval(() => {
    if(timer === 0) {
      $("#startRace").html('')
      animationStartRace(cars)

      clearInterval(intervalId)
      return;
    }

    let html = `<h1 class="text-white bangers m-auto">A corrida irá iniciar em ${timer}...</h1>`

    $("#startRace").html(html)

    timer--;
  }, 1500)

}

function animationStartRace(cars) {
  $("#cars").html('')

  let carHtml = '<section class="d-flex justify-content-center m-3 align-items-center">'

  $(cars).each((index, car) => {
    let number = car.number === null ? '--' : car.number;

    carHtml += 
      '<section class="d-flex flex-column justify-content-between m-3 align-items-center">' +
        `<img src="/images/race/${car.color}-car.svg" class="car car-race" alt="${car.color}-car">` +
        `<h1 class="text-white bangers text-limit m-auto">${index + 1}° ${car.racing_driver}</h1>` +
        '<div class="d-flex justify-content-center m-3 align-items-center">' +
        `<h1 class="text-white bangers m-auto" style="width: 40px;" id="output-${car.id}">${number}</h1>`

    if (car.hashCar === localStorage.getItem('hashCar')) {
      carHtml +=  `<button class="pushable mt-3 ms-3" onclick="drawNumber(${car.id})">` +
                  '<span class="shadow"></span>' +
                  '<span class="edge green"></span>' +
                  '<span class="front green">' +
                    'Sortear!' +
                  '</span>' +
                '</button>'
    } else {
      carHtml +=  `<button class="pushable mt-3 ms-3">` +
                  '<span class="shadow"></span>' +
                  '<span class="edge gray"></span>' +
                  '<span class="front gray">' +
                    'Sortear!' +
                  '</span>' +
                '</button>'
    }

    carHtml += '</div></section>';
    

    if (((index + 1) % 5) === 0) {
      carHtml += '<section class="d-flex justify-content-center m-3 align-items-center">';
    }    
  })
  
  carHtml += '</section>';

  $("#cars").html(carHtml);
}

function drawNumber(id) {
  let output, started, duration
  
  duration = 5000
  
  output = $('#output-' + id)
  started = new Date().getTime()
  
  animationTimer = setInterval(() => {
    if (new Date().getTime() - started > duration) {
      clearInterval(animationTimer)
      sendNumber(id, output.text())
      return
    }

    output.text(Math.floor(Math.random() * 99))
  }, 100)
}

function sendNumber(id, number) {
  socket.emit('save-number', {id: id, number: number})
}

socket.on('saved-number', (cars) => {
  let canReload = true;

  animationStartRace(cars)

  $(cars).each((index, car) => {
    if(car.number === null) {
      canReload = false
    }
  })

  if(!canReload) {
    return;
  }

  let started = new Date().getTime()

  animationTimer = setInterval(() => {
    if (new Date().getTime() - started > 2000) {
      clearInterval(animationTimer)
      socket.emit('update-positions', {})
    }
  }, 1000)
})

socket.on('reload-cars-race', (cars) => {
  animationStartRace(cars)
})