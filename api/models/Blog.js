var mongoose = require('mongoose');

var blogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Blog', blogSchema);
