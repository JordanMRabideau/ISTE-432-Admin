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
  // Test the endpoint
  xhr("get", "http://localhost:3000/api/campaigns/Y", {}).done(function (json) {
    let campaignDiv = "<div>";

    json.forEach((element) => {
      campaignDiv += `<p>${element.name}\tVotes: ${element.vote_count}</p>`;
    });
    campaignDiv += "</div>";

    $("#campaign-list").append(campaignDiv);
  });
});
