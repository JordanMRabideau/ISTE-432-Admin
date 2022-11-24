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
  const query = window.location.search;
  const params = new URLSearchParams(query);
  const societyId = params.get("society_id");

  xhr("get", `http://localhost:3000/api/societies/${societyId}`, {}).done(
    function (json) {
      const society = json[0];

      const name = `<h1>${society.name}</h1>`;

      $("#society-div").append(name);
    }
  );
});
