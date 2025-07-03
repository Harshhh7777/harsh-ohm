const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('Comment', commentSchema);
