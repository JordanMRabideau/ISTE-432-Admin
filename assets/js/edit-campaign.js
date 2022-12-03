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

function formatQuestions(questions) {
  const sorted = questions.sort((a, b) => {
    if (a.question_placement === b.question_placement) {
      if (a.choice_placement > b.choice_placement) {
        return 1;
      }

      return 1;
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
    };
    // If the question isn't already in the formatted array, create the question and add it
    if (!question) {
      formatted.push({
        question_id: item.question_id,
        question: item.question,
        maximum_selections: item.maximum_selections,
        choices: [],
      });
      question = formatted.find((q) => q.question_id === item.question_id);
    }

    question.choices.push(choice);
  });

  console.log(formatted);

  return formatted;
}

$(document).ready(function () {
  let questions = [];
  const query = window.location.search;
  const params = new URLSearchParams(query);
  const campaignId = params.get("campaign_id");

  console.log(campaignId);
  $("#questions").sortable();

  xhr(
    "get",
    `http://localhost:3000/api/campaign/results/${campaignId}`,
    {}
  ).done(function (json) {
    const questions = formatQuestions(json);
    console.log(questions);
    questions.forEach((element, index) => {
      console.log(element);
      const qNumber = index + 1;
      let question = `
        <div class="question" id='question-${qNumber}'>
          <label for="question-${qNumber}-title">Title<span class="required">*</span></label>
          <input required name="question-${qNumber}-title" data-type="title" id="question-${qNumber}-title" type="text" />
  
          <label for="question-${qNumber}-limit">Maximum Selections</label>
          <select name="question-${qNumber}-limit" data-type="limit" id="question-${qNumber}-limit">
            <option value="1">1</choice>
          </select>
  
          <div class="choices" id="question-${qNumber}-choices">
            <div class="choice">
              <label for="question-${qNumber}-choice-1-name">choice<span class="required">*</span></label>
              <input required name="question-${qNumber}-choice-1-name" data-type="name" id="question-${qNumber}-choice-1-name" type="text" />
  
              <label for="question-${qNumber}-choice-1-image">Image</label>
              <input name="question-${qNumber}-choice-1-image" data-type="image" id="question-${qNumber}-choice-1-image" type="file" />
  
              <label for="question-${qNumber}-choice-1-info">choice Information</label>
              <textarea name="question-${qNumber}-choice-1-info" data-type="info" id="question-${qNumber}-choice-1-info"></textarea>
            </div>
          </div>
  
          <button type="button" class="add-choice" data-question="${qNumber}">Add choice</button>
        </div>`;
      $("#questions").append(question);
    });
  });
});
