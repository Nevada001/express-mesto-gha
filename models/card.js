const mongoose = require('mongoose');


const cardSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectID,
    required: true
  },
  likes: {
    type: Array,
    default: [mongoose.Schema.Types.ObjectId]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("card", cardSchema);
