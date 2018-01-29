const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = new Schema({
  material_name: {
    type: String,
    required: true
  },
  material_price: {
    type: Number,
    required: true
  }
})
