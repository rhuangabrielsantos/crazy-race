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

        $('#criarCompetidor').addClass('invisible')

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
})

socket.on('car-exists', () => {
  $('#criarCompetidor').addClass('invisible')
})

function reloadCarsView(cars) {
  let carHtml = '<section class="d-flex justify-content-center align-items-center">'

  $(cars).each((index, car) => {
    carHtml += 
      '<section>' +
        `<img src="/images/view/${car.color}-car.svg" class="car" alt="car">` +
        `<h1 class="text-white bangers text-limit">${index + 1} - ${car.racing_driver}</h1>` +
      '</section>';

    if (((index + 1) % 3) === 0) {
      carHtml += '</section><section class="d-flex justify-content-center align-items-center">';
    }    
  })

  carHtml += '</section>';

  $("#cars").html(carHtml);
}
