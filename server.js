/* Showing Mongoose's "Populated" Method
 * =============================================== */

// Dependencies
const express = require("express"),
  bodyParser = require("body-parser"),
  logger = require("morgan"),
  mongoose = require("mongoose"),
  app = express(),
  Comment = require("./models/Comment.js"),
  Article = require("./models/Article.js"),
  // Scraping tools
  request = require("request"),
  rp = require('request-promise'),
  cheerio = require("cheerio"),
  WordPOS = require('wordpos'),
  wordpos = new WordPOS();

// Set mongoose to leverage built in JS Promises
mongoose.Promise = Promise;

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose

var db = mongoose.connection;
var MONGODB_URI = "mongodb://heroku_r0r26ccv:pe1jec0io6nvs4tmjvs3gen7sq@ds135234.mlab.com:35234/heroku_r0r26ccv";
// mongoose.connect(process.env.MONGODB_URI);

mongoose.connect("mongodb://localhost/falseadvertising");
// Show any mongoose errors
db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function () {
  console.log("Mongoose connection successful.");
});

// Routes
// ======
// A GET request to scrape the echojs website
// var allResults = [];
app.get("/scrape", function (req, res) {
  // Grab the body of the html with request

  rp("https://news.ycombinator.com/", function (error, response, html) {
    // Load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // console.log(html)
    $(".storylink").slice(0, 25).each(function (i, element) {
      // Save an empty result object
      var result = {};
      // console.log(element)

      result.title = $(this).text().trim();
      // result.title = $(this, 'a.result-title.hdrlnk').html();
      result.link = $(this).attr("href");
      // result.nouns = wordpos.getNouns(result.title);
      result.nouns = wordpos.getNouns(result.title).then(function (theNouns) {
        // result.imgSearch = "https://www.pexels.com/search/" + result.nouns[0];
        console.log(theNouns)
        if (theNouns.length === 0) {
          // console.log(result.title)
          result.nouns = ["empty"];
        } else {
          result.nouns = theNouns;
        }

      }).then(function () {
        var options = {
          uri: 'https://www.pexels.com/search/' + result.nouns[0],
          transform: function (body) {
            return cheerio.load(body);
          }
        };

        rp(options).then(function ($) {
          if ($("img.photo-item__img").attr('src') === undefined) {
            result.imgURL = "https://images.pexels.com/photos/6069/grass-lawn-green-wooden-6069.jpg?h=350&auto=compress&cs=tinysrgb";
          } else {
            // console.log($("img.photo-item__img").attr('src'));
            // result.imgURL = $("img.photo-item__img").attr('src').split('?h')[0];
            result.imgURL = $("img.photo-item__img").attr('src');
          }
          // console.log(result);
        }).then(function () {
          var entry = new Article(result);

          // Now, save that entry to the db
          entry.save(function (err, doc) {
            // Log any errors
            if (err) {
              console.log(err);
            }
            // Or log the doc
            else {
              console.log(doc);
            }
          });
        }).then(function(){
          res.redirect("/")
        })
      })
    });
  });
  // res.send("Scrape complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function (req, res) {
  // Grab every doc in the Articles array
  Article.find({}).sort({
    date: -1
  }).exec(function (err, docs) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(docs);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({
      "_id": req.params.id
    })
    // ..and populate all of the notes associated with it
    .populate("comment")
    // now, execute our query
    .exec(function (error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  var newComment = new Comment(req.body);

  // And save the new note the db
  newComment.save(function (error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({
          "_id": req.params.id
        }, {
          $push: {
            "comment": doc._id
          }
        })
        // Execute the above query
        .exec(function (err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          } else {
            // Or send the document to the browser
            res.send(doc);
          }
        });
    }
  });
});

app.delete("/comments/delete/:id", function (req, res) {
  Comment.findOneAndRemove({
    _id: req.params.id
  }, function (err, comment) {
    if (!err) {
      console.log(comment);
    } else {
      console.log(err);
    }
  });
});

// Listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log("App running on port 3000!");
});