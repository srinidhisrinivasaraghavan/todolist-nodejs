// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var folderSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  created: { type: String, required: true },
  tasks: [{ _id:false, tname: {type: String}}]
});


// the schema is useless so far
// we need to create a model using it
var Folder = mongoose.model('Folder', folderSchema);

// make this available to our users in our Node applications
module.exports = Folder;