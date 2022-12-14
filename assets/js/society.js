"use strict";

// Page displays current society member count and active campaigns with ability to view results or redirect to modification

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

$("#campaigns").on("click", ".edit-link", function (e) {
  e.preventDefault();

  if ($(this).data().active == "N") {
    window.location.href = `../pages/edit-campaign.html?campaign_id=${
      $(this).data().campaign
    }`;
  } else {
    alert("This campaign is currently active.");
  }
});

$(document).ready(function () {
  const query = window.location.search;
  const params = new URLSearchParams(query);
  const societyId = params.get("society_id");

  // Get society's member count
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
        <div class="parent notop">
          <div class="child">
            <h3>${element.name}\t| Votes: ${element.vote_count}</h3>
          </div>
          <div class="child">
            <button><a href='./campaign.html?campaign_id=${element.campaign_id}'>
                View Campaign Results
            </a></button>
          </div>
        </div>
          <button data-active="${element.active}" data-campaign='${element.campaign_id}' class="edit-link"><a class="button-link" href='..edit-campaign.html?campaign_id=${element.campaign_id}'>
              Edit campaign        
          </a></button>
        `;

      $("#campaigns").append(campaignDiv);
    });
  });
});
