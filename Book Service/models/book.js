const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

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

bookSchema.statics.validateObjectId = function (id) {
  if (ObjectId.isValid(id))
    if ((String)(new ObjectId(id)) === id)
      return true;
  return false;
}

module.exports = mongoose.model('Book', bookSchema);