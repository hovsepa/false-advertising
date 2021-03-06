// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true,
    unique: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  imgURL: {
    type: String
  },
  nouns: {
    type: Array
  },
  date: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  comment: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
