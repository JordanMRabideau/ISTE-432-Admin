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
  const campaignId = params.get("campaign_id");

  xhr("get", `http://localhost:3000/api/campaign/info/${campaignId}`, {}).done(
    function (json) {
      const campaign = json[0];

      const title = `<h1>${campaign.name} - ${campaign.society_name}</h1>`;
      const dates = `
      <div>
        <h2>Campaign Dates:</h2>
        <div>
          <p>Start: ${campaign.start_time}</p>
          <p>End: ${campaign.end_time}</p>  
        </div>
      </div`;

      $("#campaign-div").append(title);
      $("#campaign-div").append(dates);
    }
  );
});
