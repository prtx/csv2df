var file = null;

function bs_input_file() {
  $(".input-file").before(
    function () {
      if (!$(this).prev().hasClass('input-ghost')) {
        var element = $("<input type='file' class='input-ghost' style='visibility:hidden; height:0'>");
        element.attr("name", $(this).attr("name"));
        element.change(function () {
          element.next(element).find('input').val((element.val()).split('\\').pop());
          file = element.get(0).files[0]
        });
        $(this).find("button.btn-choose").click(function () {
          element.click();
        });
        $(this).find('input').css("cursor", "pointer");
        $(this).find('input').mousedown(function () {
          $(this).parents('.input-file').prev().click();
          return false;
        });
        return element;
      }
    }
  );
}
$(function () {
  bs_input_file();
});

document.getElementById("upload-btn").addEventListener("click", upload);

function upload() {
  if (!file) {
    alert('Please select a file');
  }
  var xhr = new XMLHttpRequest();
  var FD = new FormData();
  FD.append('csv', file, file.name);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      var response = JSON.parse(xhr.response);
      createTable(response);
    } else {
      alert('The request failed!');
    }
  };

  xhr.open('POST', 'http://localhost:8181/uploader');
  xhr.send(FD);
}

function createTable(response) {
  var { data } = response;
  var headers = Object.keys(data[0]);
  var tableElement = document.getElementById('data');

  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild);
  }

  var thead = document.createElement('thead');
  thead.classList.add("thead-dark");

  var tr = document.createElement('tr');
  headers.forEach(head => {
    var th = document.createElement('th');
    th.setAttribute('scope', 'col');
    var text = document.createTextNode(head);
    th.appendChild(text);
    tr.appendChild(th);
  });

  thead.append(tr);
  tableElement.appendChild(thead);

  var tbdy = document.createElement('tbody');

  data.forEach(element => {
    var tr = document.createElement('tr');

    Object.keys(element).forEach(key => {
      var td = document.createElement('td');
      var text = document.createTextNode(element[key]);
      td.appendChild(text);
      tr.appendChild(td);
    });
    tbdy.appendChild(tr);
  });


  tableElement.appendChild(tbdy);
}

