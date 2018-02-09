const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Store = require('./Store')

const AddressSchema = require('./schemas/AddressSchema')

const uModels = require('../utils/models')

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
  store: {
    type: String,
    required: true
  },
  password: { 
    type: String,
    required: true
  },
  salt: String,
  addresses: [AddressSchema],
  orders:[{
    type: Schema.Types.ObjectId,
    rel: 'Order',
    default: []
  }],
  reservations: [{
    type: Schema.Types.ObjectId,
    rel: 'Reservation',
    default: []
  }],
  wishlist: [{
    type: Schema.Types.ObjectId,
    rel: 'Product',
    default: []
  }],
  created_at: Date,
  updated_at: Date
})

ClientSchema._middlewareFuncs = {
  preSave(next) {
    const self = this
    const currentDate = new Date()

    self.updated_at = currentDate
    if (!self.created_at) self.created_at = currentDate

    if (self.isNew && !self.password) {
      const e = new Error('Password Required')
      e.name = 'ValidationError'
      return next(e)
    }

    handlePassword(self)
    .then(hashed => { 
      if (hashed && hashed.hasOwnProperty('hash') && hashed.hasOwnProperty('salt')) {
        self.password = hashed.hash
        self.salt = hashed.salt
      }
      return next() 
    })
    .catch(err => next(err))
    
  },
  preUpdate(next) {
    const self = this
    self._update.updated_at = new Date()

    handlePassword(self._update)
    .then(hashed => {
      if (hashed && hashed.hasOwnProperty('hash') && hashed.hasOwnProperty('salt')) {
        self._update.password = hashed.hash
        self._update.salt = hashed.salt
      }
      return next()
    })
    .catch(err => next(err))
  }
}

ClientSchema.pre('save', ClientSchema._middlewareFuncs.preSave)
ClientSchema.pre('udpate', ClientSchema._middlewareFuncs.preUpdate)
ClientSchema.pre('findOneAndUpdate', ClientSchema._middlewareFuncs.preUpdate)

const Client = mongoose.model('Client', ClientSchema)

module.exports = Client

async function handlePassword(context) {
  if (!context.password)
    return false

  const hashed = await uModels.hashPassword(context.password)
    .catch(err => { throw err })

  return hashed
}
