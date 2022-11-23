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
  xhr("get", "http://localhost:3000/api/campaigns", {}).done(function (json) {
    let campaignDiv = "<div>";

    console.log(json);

    json.forEach((element) => {
      campaignDiv += `
        <a href='./pages/campaign.html?campaign_id=${element.campaign_id}'>
          <p>${element.society_name} - ${element.name}\tVotes: ${element.vote_count}</p>
        </a>`;
    });
    campaignDiv += "</div>";

    $("#campaign-list").append(campaignDiv);
  });
});
