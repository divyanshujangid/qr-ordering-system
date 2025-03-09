const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  available: { type: Boolean, default: true },
  popular: { type: Boolean, default: false },
  options: [{
    name: String,
    choices: [{
      name: String,
      price: Number
    }]
  }]
})

module.exports = mongoose.model('MenuItem', menuItemSchema)