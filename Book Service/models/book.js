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
    type: String,
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

bookSchema.statics.validateBookId = function (bookId) {
  return mongoose.Types.ObjectId.isValid(bookId);
}

module.exports = mongoose.model('Book', bookSchema);