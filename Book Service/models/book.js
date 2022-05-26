const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  publicationYear: {
    type: Number,
    required: true
  },
  authors: {
    type: Object,
    required: true
  },
  genres: {
    type: Object,
    required: true
  },
  awardsWon: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model('Book', bookSchema);