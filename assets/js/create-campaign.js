"use strict";

// Page allows the user to create a new campaign for a society, add questions and candidates for each, and when the campaign will be available

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

  // initialize the questions as a sortable div for drag/drop
  $("#questions").sortable();

  // Get the initial list of societies
  xhr("get", "http://localhost:3000/api/societies", {}).done(function (json) {
    json.forEach((society) => {
      const choice = `<option value='${society.society_id}'>${society.name}</option>`;

      $("#society-select").append(choice);
    });
  });

  // Add a new question to the questions div
  $("#add-question").click(function () {
    const qNumber = questions.length + 1;
    questions.push(qNumber);

    const newQ = `
      <div class="question" id='question-${qNumber}'>
        <label for="question-${qNumber}-title"><span class="required">*</span>Title: </label>
        <input required name="question-${qNumber}-title" data-type="title" id="question-${qNumber}-title" type="text" />&emsp;&emsp;

        <label for="question-${qNumber}-limit">Maximum Selections: </label>
        <select name="question-${qNumber}-limit" data-type="limit" id="question-${qNumber}-limit">
          <option value="1">1</choice>
        </select>

        <div class="choices" id="question-${qNumber}-choices">
          <div class="choice">
            <label for="question-${qNumber}-choice-1-name"><span class="required">*</span>Choice: </label>
            <input required name="question-${qNumber}-choice-1-name" data-type="name" id="question-${qNumber}-choice-1-name" type="text" />&emsp;&emsp;

            <label for="question-${qNumber}-choice-1-image">Image: </label>
            <input name="question-${qNumber}-choice-1-image" data-type="image" id="question-${qNumber}-choice-1-image" type="file" />&emsp;&emsp;

            <label for="question-${qNumber}-choice-1-info">Choice Info/Bio: </label>
            <textarea name="question-${qNumber}-choice-1-info" data-type="info" id="question-${qNumber}-choice-1-info"></textarea>
          </div>
        </div>

        <br><button type="button" class="add-choice" data-question="${qNumber}">Add Choice</button><br><br><br>
      </div>`;

    $("#questions").append(newQ);

    // initialize the choices as a sortable div for drag/drop
    $(".choices").sortable();
  });

  // Adds a new choice to the current question
  $("#questions").on("click", ".add-choice", function () {
    const questionId = $(this).attr("data-question");
    const numchoices = $(`#question-${questionId}-limit option`).length;
    const choiceId = numchoices + 1;
    let newchoice = `
      <div class="choice">
        <label for="question-${questionId}-choice-${choiceId}"><span class="required">*</span>Choice: </label>
        <input required name="question-${questionId}-choice-${choiceId}" data-type="name" id="question-${questionId}-choice-${choiceId}" type="text" />&emsp;&emsp;

        <label for="question-${questionId}-choice-${choiceId}-image">Image: </label>
        <input name="question-${questionId}-choice-${choiceId}-image" data-type="image" id="question-${questionId}-choice-${choiceId}-image" type="file" />&emsp;&emsp;

        <label for="question-${questionId}-choice-${choiceId}-info">Choice Info/Bio: </label>
        <textarea name="question-${questionId}-choice-${choiceId}-info" data-type="info" id="question-${questionId}-choice-${choiceId}"></textarea>
      </div>
    `;

    // Add the choice to the question
    $(`#question-${questionId}-choices`).append(newchoice);

    // Add another choice to max selections for that question
    $(`#question-${questionId}-limit`).append(
      `<option value="${numchoices + 1}">${numchoices + 1}</option>`
    );
  });

  $("#questions").submit(function(e) {
    e.preventDefault()

    const data = {
      society_id: Number($("#society-select").val()),
      name: $("#campaign-name").val(),
      start_time: $("#start-time").val(),
      end_time: $("#end-time").val(),
      questions: getInputs()
    };

    xhr("post", "http://localhost:3000/api/campaign/generate", data).done(function (
      response
    ) {
      console.log(response);
    });
  })
});
