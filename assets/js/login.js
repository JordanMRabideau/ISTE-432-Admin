"use strict";

// Page authenticates admin users logging in

function xhr(getPost, url, data) {
  return $.ajax({
    type: getPost,
    data: data,
    dataType: "json",
    cache: false,
    async: true,
    url: url,
    success: function (data) {
      window.localStorage.setItem("user", data.user);
      window.location.href = "./pages/manager.html";
    },
    error: function (err, exception) {
      if (err.status === 401) {
        alert("Invalid login credentials");
      } else if (err.status === 502) {
        alert("Bad gateway");
      } else {
        alert("Uncaught exception");
      }
    },
  }).fail(function (err) {
    console.log(err);
  });
}

$(document).ready(function () {
  window.localStorage.setItem("society", 1); // The society is hardcoded for each site

  $("#login-form").submit(function (e) {
    e.preventDefault();
    const data = {
      auth1: $("#auth1").val(),
      auth2: $("#auth2").val(),
    };

    xhr("post", "http://localhost:3000/api/admin", data);
  });
});
