const mongoose = require('mongoose');

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
    required: true,
  },
  status: {
    type: String,
    default: 'active'
  },
  favourites: [
    {
      productId: { type: Schema.Types.ObjectId, required: true }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);