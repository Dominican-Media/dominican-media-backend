const mongoose = require("mongoose");

const ServicesSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model("Sercices", ServicesSchema);
