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

// Need to make a method that adds another possible position when a choice/question is added...

$(document).ready(function () {
  let questions = [];

  $("#questions").sortable();
  $(".choices").sortable();

  // Get the initial list of societies
  xhr("get", "http://localhost:3000/api/societies", {}).done(function (json) {
    json.forEach((society) => {
      const choice = `<choice value='${society.society_id}'>${society.name}</choice>`;

      $("#society-select").append(choice);
    });
  });

  // Add a new question to the questions div
  $("#add-question").click(function () {
    const qNumber = questions.length + 1;
    questions.push(qNumber);

    const newQ = `
      <div class="question" id='question-${qNumber}'>
        <label for="question-${qNumber}-title">Title<span class="required">*</span></label>
        <input name="question-${qNumber}-title" id="question-${qNumber}-title" type="text" />

        <label for="question-${qNumber}-choice-limit">Maximum Selections</label>
        <select name="question-${qNumber}-choice-limit" id="question-${qNumber}-choice-limit">
          <option value="1">1</choice>
        </select>

        <div class="choices" id="question-${qNumber}-choices">
          <div class="choice">
            <label for="question-${qNumber}-choice-1">choice<span class="required">*</span></label>
            <input name="question-${qNumber}-choice-1" id="question-${qNumber}-choice-1" type="text" />

            <label for="question-${qNumber}-choice-1-image">Image</label>
            <input name="question-${qNumber}-choice-1-image" id="question-${qNumber}-choice-1-image" type="file" />

            <label for="question-${qNumber}-choice-1-info">choice Information</label>
            <textarea name="question-${qNumber}-choice-1-info" id="question-${qNumber}-choice-1"></textarea>
          </div>
        </div>

        <button class="add-choice" data-question="${qNumber}">Add choice</button>
      </div>`;

    $("#questions").append(newQ);
  });

  // Adds a new choice to the current question
  $("#questions").on("click", ".add-choice", function () {
    const questionId = $(this).attr("data-question");
    const numchoices = $(`#question-${questionId}-choice-limit choice`).length;
    console.log(numchoices);
    const choiceId = numchoices + 1;
    let newchoice = `
      <div class="choice">
        <label for="question-${questionId}-choice-${choiceId}">choice<span class="required">*</span></label>
        <input name="question-${questionId}-choice-${choiceId}" id="question-${questionId}-choice-${choiceId}" type="text" />

        <label for="question-${questionId}-choice-${choiceId}-image">Image</label>
        <input name="question-${questionId}-choice-${choiceId}-image" id="question-${questionId}-choice-${choiceId}-image" type="file" />

        <label for="question-${questionId}-choice-${choiceId}-info">choice Information</label>
        <textarea name="question-${questionId}-choice-${choiceId}-info" id="question-${questionId}-choice-${choiceId}"></textarea>

        <label for="question-${questionId}-choice-${choiceId}-position">Choice Position</label>
        <select name="question-${questionId}-choice-${choiceId}-position" id="question-${questionId}-choice-${choiceId}-position">
          <option value="1">1</choice>
    `;

    // add an option for all possible positions
    for (let i = 0; i < numchoices; i++) {
      newchoice += `<option value="${i + 1}">${i + 1}</option>`;
    }

    // Close off the choice div
    newchoice += `</select>
    </div>`;

    // Add the choice to the question
    // $(newchoice).insertBefore(`#question-${questionId} > div:last`);
    $(`#question-${questionId}-choices`).append(newchoice);

    // Add another choice to max selections for that question
    $(`#question-${questionId}-choice-limit`).append(
      `<choice value="${numchoices + 1}">${numchoices + 1}</choice>`
    );
  });

  // Create the new campaign when you hit the button
  $("#create").click(function () {
    const data = {
      society_id: $("#society-select").val(),
      name: $("#campaign-name").val(),
      start_time: $("#start-time").val(),
      end_time: $("#end-time").val(),
    };

    console.log(data);
    xhr("post", "http://localhost:3000/api/campaign", data).done(function (
      response
    ) {
      console.log(response);
    });
  });
});
