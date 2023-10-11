let tasks = {};

let createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  let taskLi = $("<li>").addClass("list-group-item");
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  let taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

let loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

let saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  // tasks is an object.
let text = $(this)
.val()
.trim();

// get the parent ul's id attribute
// tasks[status] returns an array (e.g., toDo).
let status = $(this)
.closest(".list-group")
.attr("id")
.replace("list-", "");

// get the task's position in the list of other li elements
// tasks[status][index] returns the object at the given index in the array.
let index = $(this)
.closest(".list-group-item")
.index();
// tasks[status][index].text returns the text property of the object at the given index.
tasks[status][index].text = text;
saveTasks();

// recreate p element
let taskP = $("<p>")
  .addClass("m-1")
  .text(text);

// replace textarea with p element
$(this).replaceWith(taskP);
});

$(".list-group").on("click", "p", function() {
  let text = $(this).text().trim();
  let textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
  console.log(text);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  let date = $(this)
    .text()
    .trim();

  // create new input element
  let dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  let date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  let index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  let taskText = $("#modalTaskDescription").val();
  let taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (let key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// The jQuery UI method, sortable(), turned every element with the 
// class list-group into a sortable list. The connectWith property then 
// linked these sortable lists with any other lists that have the same class.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  // jQuery to create a copy of the dragged element and move the copy instead of the original. This is necessary to prevent click events from accidentally triggering on the original element.
  helper: "clone",
  // The activate and deactivate events trigger once for all connected lists as soon as dragging starts and stops.
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  // The over and out events trigger when a dragged item enters or leaves a connected list.
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  // The update event triggers when the contents of a list have changed (e.g., the items were re-ordered, an item was removed, or an item was added).
  update: function(event) {
    // array to store the task data in
    let tempArr = [];

    // loop over current set of children in sortable list
    // children() method returns an array of the list element's children (the <li> elements, labeled as li.list-group-item).
    //jQuery's each() method will run a callback function for every item/element in the array. It's another form of looping, 
    //except that a function is now called on each loop iteration. The potentially confusing part of this code is the second use of $(this). Inside the callback function, $(this) actually refers to the child element at that index.
    $(this).children().each(function() {
      // Inside the .each() loop, it selects the <p> element within the current child element, extracts the text content, and removes any leading or trailing whitespace. The result is stored in the text variable.
      let text = $(this)
        .find("p")
        .text()
        .trim();
//Similarly, it selects the <span> element within the current child element, extracts the text content, and trims any leading or trailing whitespace. The result is stored in the date variable.
      let date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      // After extracting both the text and date values from the current child element, it creates an object with these properties and pushes this object into the tempArr array. This effectively constructs an array of objects, where each object contains text and date properties corresponding to the data extracted from child elements.
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    // This line extracts the id attribute of the element referred to by $(this) and then uses .replace("list-", "") to remove the string "list-" from the id. The result is stored in the variable arrName.
    let arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();


