"use strict";

// Page allows the user to modify values of a given campaign, and the availability of the campaign

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

// Format questions by placement
function formatQuestions(questions) {
  const sorted = questions.sort((a, b) => {
    if (a.question_placement === b.question_placement) {
      if (Number(a.choice_placement) > Number(b.choice_placement)) {
        return 1;
      }

      return -1;
    }
    if (Number(a.question_placement) > Number(b.question_placement)) {
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

  return formatted;
}

function getInputs() {
  const inputs = $("#questions :input:not(:button)")
  const qRegex = new RegExp("(question-\\d*)")
  const cRegex = new RegExp("(choice-\\d*)")

  // Get all of the input into object form for easier manipulation
  const inputObjects = $.makeArray(inputs).map((input) => {
    const question = input.id.match(qRegex)
    const choice = input.id.match(cRegex)
    const type = $(input).data().type
    const obj = {
      questionNum: Number(question[0].replace("question-", "")),
      value: input.value,
      type
    }

    if (choice != null) {
      obj.choiceNum = Number(choice[0].replace("choice-", ""))
    }
    
    return obj
  })

  let formattedQuestions = []

  inputObjects.forEach((obj) => {
    // Attempt to locate the question in the formatted list
    let existingQuestion = formattedQuestions.find((question) => question.questionNum === obj.questionNum)

    // If the question doesnt already exist, make it
    if (!existingQuestion) {
      const newPosition = formattedQuestions.push({
        questionNum: obj.questionNum,
        title: "",
        limit: -1,
        choices: []
      })

      existingQuestion = formattedQuestions.find((question) => question.questionNum === obj.questionNum)

      // Set the position value to the position of the new object in the array (1 indexed)
      existingQuestion.position = newPosition
    }

    // If the object is a choice, add that choice to the question
    if (obj.hasOwnProperty('choiceNum')) {
      let existingChoice = existingQuestion.choices.find((choice) => choice.choiceNum === obj.choiceNum)

      if (!existingChoice) {
        const newChoicePosition = existingQuestion.choices.push({
          choiceNum: obj.choiceNum,
          name: "",
          image: "",
          info: "",
        })

        existingChoice = existingQuestion.choices.find((choice) => choice.choiceNum === obj.choiceNum)
        existingChoice.position = newChoicePosition
      }

      switch (obj.type) {
        case 'name':
          if (obj.value === '') {
            return "error"
          }
          existingChoice.name = obj.value
          break
        case 'image':
          existingChoice.image = obj.value
          break
        case 'info':
          existingChoice.info = obj.value
          break
        default:
          break
      }
    }

    else {
      switch (obj.type) {
        case 'title':
          if (obj.value === '') {
            return "error"
          }
          existingQuestion.title = obj.value
          break
        case 'limit':
          existingQuestion.limit = Number(obj.value)
      }
    }
  })

  return formattedQuestions
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

    // set the campaign values
    $(`#campaign-name`).val(json[0].campaign_name)
    $(`#start-time`).val(json[0].start_time.split("T")[0])
    $(`#end-time`).val(json[0].end_time.split("T")[0])

    questions.forEach((element) => {
      const question_id = element.question_id

      // Create the initial divs and fields and add them to the div
      let question = `
        <div class="question" data-question="${question_id}" id='question-${question_id}'>
          <label for="question-${question_id}-title">Title<span class="required">*</span></label>
          <input required name="question-${question_id}-title" data-type="title" id="question-${question_id}-title" type="text" />
  
          <label for="question-${question_id}-limit">Maximum Selections</label>
          <select name="question-${question_id}-limit" data-type="limit" id="question-${question_id}-limit">
          </select>
  
          <div class="choices" id="question-${question_id}-choices">
          </div>
        </div>
        <br/>`;
      $("#questions").append(question);

      // Populate the question information   
      $(`#question-${question_id}-title`).val(element.question)

      // loop over choices for each question
      element.choices.forEach((choice, index) => {
        const response_id = choice.response_id
        const option = `
          <div data-response=${response_id} class="choice">
            <label for="question-${question_id}-choice-${response_id}-name">choice<span class="required">*</span></label>
            <input value="${choice.name}" required name="question-${question_id}-choice-${response_id}-name" data-type="name" id="question-${question_id}-choice-${response_id}-name" type="text" />

            <label for="question-${question_id}-choice-${response_id}-image">Image</label>
            <input value="${choice.image_filepath}" name="question-${question_id}-choice-${response_id}-image" data-type="image" id="question-${question_id}-choice-${response_id}-image" type="file" />

            <label for="question-${question_id}-choice-${response_id}-info">choice Information</label>
            <textarea name="question-${question_id}-choice-${response_id}-info" data-type="info" id="question-${question_id}-choice-${response_id}-info"></textarea>
          </div>
        `

        const optionVal = `
          <option value="${index + 1}">${index + 1}</option>
        `

        $(`#question-${question_id}-choices`).append(option)
        $(`#question-${question_id}-limit`).append(optionVal)

        // set the inner text of the text area
        $(`#question-${question_id}-choice-${response_id}-info`).val(choice.bio)
      })

      // Set the dropdown value
      $(`#question-${question_id}-limit`).val(element.maximum_selections)

    });

    $(".choices").sortable()
  });

  $("#questions").submit(function(e) {
    e.preventDefault()

    const data = {
      campaign_id: campaignId,
      name: $("#campaign-name").val(),
      start_time: $("#start-time").val(),
      end_time: $("#end-time").val(),
      questions: getInputs()
    }

    xhr("put", `http://localhost:3000/api/campaign/edit`, data).done(function(result) {
      alert(result.message)
    })

    // console.log(data)
  })
});
