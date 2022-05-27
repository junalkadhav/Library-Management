const mongoose = require('mongoose');

const Roles = require('./roles');
const Status = require('./status');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: Roles.user
  },
  status: {
    type: String,
    default: Status.active
  },
  favourites: [
    {
      bookId: { type: Schema.Types.ObjectId, required: true }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);