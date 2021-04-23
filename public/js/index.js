var myModal = new bootstrap.Modal(document.getElementById('createCar'), {})

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