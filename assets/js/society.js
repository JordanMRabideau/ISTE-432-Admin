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
      const info = `<p>Active members: ${society.member_count}</p>`;

      $("#society-div").append(name);
      $("#society-div").append(info);
    }
  );

  xhr(
    "get",
    `http://localhost:3000/api/societies/campaigns/${societyId}`,
    {}
  ).done(function (json) {
    json.forEach((element) => {
      let campaignDiv = `
        <a href='./pages/campaign.html?campaign_id=${element.campaign_id}'>
            <p>${element.name}\tVotes: ${element.vote_count}</p>
        </a>
        <a class="button-link" href='../pages/edit-campaign.html?campaign_id=${element.campaign_id}'>
            Edit campaign        
        </a>
        `;

      $("#campaigns").append(campaignDiv);
    });
  });
});
