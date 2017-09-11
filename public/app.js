// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(
      "<div class='col-md-6 entry' data-id='" +
      data[i]._id + "'>" +
      "<div>" +
      "<img src='" + data[i].imgURL + "' class='pexelImg' />" +
      "</div>" +
      "<div>" +
      "<a href='" + data[i].link + "'>" + toTitleCase(data[i].title) + "</a?" +
      "</div>" +
      "</div>");
  }
});

// Whenever someone clicks a p tag
$(document).on("click", ".entry", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    .done(function (data) {
      console.log(data);

      $("#notes").append(
        "<h2>" + data.title + "</h2>");
      // Past notes

      if (data.comment.length === 0) {
        $("#notes").append("<h4>" + "No Comments Yet" + "</h4>");
      } else {
        $("#notes").append("<h4>" + "Past Comments" + "</h4>");
        for (var i = 0; i < data.comment.length; i++) {
          $("#notes").append("<div class='past-comment'>" +
            // "<span class='comment-past-title''>" + 
            // data.comment[i].title + " | " + "</span>" +
            data.comment[i].body + "<span data-id='" + data.comment[i]._id + "' id='deletenote' class='glyphicon glyphicon-remove' aria-hidden='true'></span></>" +
            "<p class='past-comment-date'>" + moment(data.comment[i].date).format("LLLL") + "</p>" +
            "</div>");
        }
      }

      // An input to enter a new title
      // $("#notes").append("<input id='titleinput' name='title' class='form-control' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' class='form-control'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-success'>Save Note</button>");
      $("#notes").append("<button data-id='" + data._id + "' id='done' class='btn btn-default'>Done</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        // title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .done(function (data) {
      // Log the response
      console.log(data);
      $.ajax({
          method: "GET",
          url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .done(function (data) {
          console.log(data);
          // The title of the article
          $("#notes").empty();

          $("#notes").append(
            "<h2>" + data.title + "</h2>");
          // Past notes

          if (data.comment.length === 0) {
            $("#notes").append("<h4>" + "No Comments Yet" + "</h4>");
          } else {
            $("#notes").append("<h4>" + "Past Comments" + "</h4>");
            for (var i = 0; i < data.comment.length; i++) {
              $("#notes").append("<div class='past-comment'>" +
                // "<span class='comment-past-title''>" + 
                // data.comment[i].title + " | " + "</span>" +
                data.comment[i].body + "<span data-id='" + data.comment[i]._id + "' id='deletenote' class='glyphicon glyphicon-remove' aria-hidden='true'></span></>" +
                "<p class='past-comment-date'>" + moment(data.comment[i].date).format("LLLL") + "</p>" +
                "</div>");
            }
          }

          // An input to enter a new title
          // $("#notes").append("<input id='titleinput' name='title' class='form-control' >");
          // A textarea to add a new note body
          $("#notes").append("<textarea id='bodyinput' name='body' class='form-control'></textarea>");
          // A button to submit a new note, with the id of the article saved to it
          $("#notes").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-success'>Save Note</button>");
          $("#notes").append("<button data-id='" + data._id + "' id='done' class='btn btn-default'>Done</button>");

          // If there's a note in the article
          if (data.note) {
            // Place the title of the note in the title input
            $("#titleinput").val(data.note.title);
            // Place the body of the note in the body textarea
            $("#bodyinput").val(data.note.body);
          }
        });
      // Empty the notes section
      // $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#done", function () {
  $("#notes").empty();
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#deletenote", function () {
  var thisId = $(this).attr("data-id");
  $(this).parent().empty();
  console.log(thisId);
  $.ajax({
    method: "DELETE",
    url: "/comments/delete/" + thisId
  }).done(function (result) {
    console.log($("button#savenote").attr("data-id"));
    console.log("done");
  });

});

$(document).on("click", "#scrape", function () {
  location.href = "/scrape";
});

var toTitleCase = function (str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}