"use strict";

function xhr(getPost, url, data) {
  return $.ajax({
    type: getPost,
    data: data,
    dataType: "json",
    cache: false,
    async: true,
    url: url,
  }).fail(function (err) {
    console.log(err);
  });
}

$(document).ready(function () {
  document.getElementById("members").addEventListener("change", upload, false);

  let members = [];

  // Method that checks that the browser supports the HTML5 File API
  function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      isCompatible = true;
    }
    return isCompatible;
  }

  // Method that reads and processes the selected file
  function upload(evt) {
    if (!browserSupportFileUpload()) {
      alert("The File APIs are not fully supported in this browser!");
    } else {
      var dataMembers = null;
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function (event) {
        var csvData = event.target.result;
        dataMembers = $.csv.toArrays(csvData);
        if (members && dataMembers.length > 0) {
          members = dataMembers;
        }
      };
      reader.onerror = function () {
        alert("Unable to read " + file.fileName);
      };
    }
  }

  $("#society").submit(function (e) {
    console.log("HEYYYYYYY");
    e.preventDefault();

    const data = {
      name: $("#society-name").val(),
      auth1_name: $("#auth1-name").val(),
      auth2_name: $("#auth2-name").val(),
      members,
    };

    xhr("post", "http://localhost:3000/api/society/generate", data).done(
      function (response) {
        console.log(response);
      }
    );
  });
});