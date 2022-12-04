"use strict";

// Page will display current results, allow for importation of paper ballots, and allows the user to select a range of ballots via Ballot_ID to view a subset of results

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

// Format placement of questions on the page
function formatQuestions(questions) {
  const sorted = questions.sort((a, b) => {
    if (a.question_placement === b.question_placement) {
      if (a.choice_placement > b.choice_placement) {
        return 1;
      }

      return -1;
    }
    if (a.question_placement > b.question_placement) {
      return 1;
    }

    return -1;
  });
  let formatted = [];

  sorted.forEach((item) => {
    let question = formatted.find((q) => q.question_id === item.question_id);
    const choice = {
      response_id: item.response_id,
      name: item.name,
      title: item.title,
      bio: item.bio,
      image_filepath: item.image_filepath,
      vote_count: item.vote_count,
      choice_placement: item.choice_placement,
    };

    // If the question isn't already in the formatted array, create the question and add it
    if (!question) {
      formatted.push({
        question_id: item.question_id,
        question: item.question,
        question_placement: item.question_placement,
        maximum_selections: item.maximum_selections,
        choices: [],
      });
      question = formatted.find((q) => q.question_id === item.question_id);
    }

    question.choices.push(choice);
  });

  return formatted;
}

// Validation of paper ballots
function validatePaperBallot(formattedBallot, paper) {
  const ballotInts = paper.map((i) => parseInt(i));
  const ballotId = ballotInts.shift();
  const selections = [];
  let numFields = 0;

  // Determine how many fields should be in the csv, throw out any non-compliant rows
  formattedBallot.forEach((b) => {
    numFields += b.choices.length;
  });

  if (ballotInts.length != numFields) {
    return [];
  }

  formattedBallot.forEach((b) => {
    const max = b.maximum_selections;

    const question = ballotInts.splice(0, b.choices.length);
    const checked = question.reduce((a, b) => a + b, 0);

    if (checked <= max) {
      let selectedResponses = [];

      question.forEach((q, index) => {
        if (q === 1) {
          selectedResponses.push({
            question_id: b.question_id,
            response_id: b.choices[index].response_id,
            ballot_id: ballotId,
          });
        }
      });

      if (selectedResponses.length > 0) {
        selections.push(...selectedResponses);
      }
    }
  });

  return selections;
}

// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
  var isCompatible = false;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
  }
  return isCompatible;
}

$(document).ready(function () {
  const query = window.location.search;
  const params = new URLSearchParams(query);
  const campaignId = params.get("campaign_id");

  // Get the campaign information
  xhr("get", `http://localhost:3000/api/campaign/info/${campaignId}`, {}).done(
    function (json) {
      const campaign = json[0];

      const title = `<h2>${campaign.society_name}</h2>`;
      const camp = `<h1>${campaign.name}</h1>`;
      const dates = `
        <h2>Campaign Dates:</h2>
          <p>Start Date: ${campaign.start_time.split("T")[0]}</p>
          <p>End Date: ${campaign.end_time.split("T")[0]}</p>`;

      $("#campaign-div").append(title);
      $("#title-div").append(camp);
      $("#date-div").append(dates);
    }
  );

  // Imports paper ballots, reads, validates, and submits them to API
  function loadBallots(evt, questions) {
    if (!browserSupportFileUpload()) {
      alert("The File APIs are not fully supported in this browser!");
    } else {
      let data;
      let file = evt.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file);

      const selected = [];

      reader.onload = function (event) {
        let csvData = event.target.result;
        data = $.csv.toArrays(csvData);
        if (data.length > 0) {
          data.forEach((i) => {
            const ballot = validatePaperBallot(questions, i);
            if (ballot.length > 0) {
              selected.push(...ballot);
            }
          });

          const body = {
            campaign_id: campaignId,
            selections: selected,
          };

          xhr("post", `http://localhost:3000/api/ballot/import`, body).done(
            function (response) {
              if (confirm(response.message)) {
                window.location.reload();
              }
            }
          );
        }
      };
      reader.onerror = function () {
        alert("Unable to read " + file.fileName);
      };
    }
  }

  // Get the questions
  xhr(
    "get",
    `http://localhost:3000/api/campaign/results/${campaignId}`,
    {}
  ).done(function (json) {
    const formattedQuestions = formatQuestions(json);

    document
      .getElementById("ballots")
      .addEventListener(
        "change",
        (event) => loadBallots(event, formattedQuestions),
        false
      );

    // Create the initial divs for each position/question
    formattedQuestions.forEach((element) => {
      let question = `
        <fieldset class="fieldset-auto-width"><legend>${element.question}</legend>
        <ul id='question-${element.question_id}'>`;

      // Add each candidate
      element.choices.forEach((choice) => {
        question += `<li>${choice.name} - ${choice.title} - Votes: ${choice.vote_count}</li>`;
      });
      question += "</ul></fieldset>";

      $("#results-div").append(question);
    });
  });

  $("#ballot-sample").submit(function (e) {
    e.preventDefault();

    const start = $("#ballot-start").val();
    const end = $("#ballot-end").val();
    let route;

    if (end && end < start) {
      return;
    }
    if (end && end >= start) {
      route = `http://localhost:3000/api/campaign/results/${campaignId}/${start}/${end}`;
    } else {
      route = `http://localhost:3000/api/campaign/results/${campaignId}/${start}`;
    }

    // Get results sample
    xhr("get", route, {}).done(function (response) {
      $("#sample-results").empty();

      const formattedSamples = formatQuestions(response);

      formattedSamples.forEach((element) => {
        let question = `
          <fieldset class="fieldset-auto-width"><legend>${element.question}</legend>
          <ul id='question-${element.question_id}'>`;

        // Add each candidate
        element.choices.forEach((choice) => {
          question += `<li>${choice.name} - Votes: ${choice.vote_count}</li>`;
        });
        question += "</ul></fieldset>";

        $("#sample-results").append(question);
      });

      $("#result-modal").modal();
    });
  });
});
