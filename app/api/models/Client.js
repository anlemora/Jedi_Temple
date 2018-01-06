const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AddressSchema = require('./schemas/AddressSchema')
const WishProductSchema = require('./schemas/WishProductSchema')

const ClientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    set(val) {
      // Encript
      return val
    }
  },
  addresses: [AddressSchema],
  orders:[{
    type: Schema.Types.ObjectId,
    rel: 'Order'
  }],
  wishlist: [WishProductSchema],
  created_at: Date,
  updated_at: Date
})

ClientSchema.pre('save', (next) => {
  var currentDate = new Date()

  this.updated_at = currentDate

  if (!this.created_at) 
    this.created_at = currentDate

  next()
})

const Client = mongoose.model('Client', ClientSchema)

module.exports = Client
