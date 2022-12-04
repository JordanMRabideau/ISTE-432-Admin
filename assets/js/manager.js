"use strict";

// Page allows users to view societies and campaigns, toggle whether the campaign is active, and create new societies or campaigns

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

// Return list of societies
$(document).ready(function () {
  xhr("get", "http://localhost:3000/api/societies", {}).done(function (json) {
    let societyDiv = "<div><h2>Active Societies</h2>";

    json.forEach((element) => {
      societyDiv += `
        <button><a href='./society.html?society_id=${element.society_id}'>
          ${element.name}
        </a></button><br>
      `;
    });

    societyDiv += "</div>";

    $("#society-list").append(societyDiv);
  });

  // Return list of campaigns
  xhr("get", "http://localhost:3000/api/campaigns", {}).done(function (json) {
    let campaignDiv = "<div><h2>Campaign List</h2>";

    json.forEach((element) => {
      campaignDiv += `
        <div class="campaign">
          <button><a href='./campaign.html?campaign_id=${element.campaign_id}'>
            ${element.society_name} - ${element.name}\tVotes: ${element.vote_count}
          </a></button><br>`;
      if (element.active === "Y") {
        campaignDiv += `
          <label class="switch">
            <input checked type="checkbox" data-campaign="${element.campaign_id}">
            <span class="slider"></span>
          </label>
        </div>`;
      } else {
        campaignDiv += `
          <label class="switch">
            <input type="checkbox" data-campaign="${element.campaign_id}">
            <span class="slider"></span>
          </label>
        </div>`;
      }
    });
    campaignDiv += "</div>";

    $("#campaign-list").append(campaignDiv);
  });

  // Add listener to toggle
  $("#campaign-list").on("click", "input", function () {
    const enable = $(this).is(":checked");
    let data = {
      campaign_id: $(this).data().campaign,
      enable: enable,
    };

    xhr("put", "http://localhost:3000/api/activate", data).done(function (
      response
    ) {});
  });
});
