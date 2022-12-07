const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let imagesSchema = new Schema({
    buffer: Buffer,
    mimetype: String,
    name: String,
    encoding: String
})
module.exports = mongoose.model("Images",imagesSchema);
