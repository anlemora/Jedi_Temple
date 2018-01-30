const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const uCommons = require('../utils')

const Client = require('./Client')
const Store = require('./Store')

const CustomSchema = require('./schemas/CustomSchema')
const ImageSchema = require('./schemas/ImageSchema')

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  description: String,
  images: [ImageSchema],
  customs: [CustomSchema],
  created_at: Date,
  updated_at: Date
})

ProductSchema._middlewareFuncs = {
  preSave(next) {
    const self = this

    if (this.isModified('slug')) {
      const err = new Error('Slug is read-only')
      err.name = 'ValidationError'
      return next(err)
    }

    self.slug = uCommons.slugify(self.name)
    const currentDate = new Date()
    self.updated_at = currentDate
    if (!self.created_at) self.created_at = currentDate

    return next()
  },
  preUpdate(next) {
    const self = this

    if (self._update.slug) {
      const err = new Error('Slug is read-only')
      err.name = 'ValidationError'
      return next(err)
    }

    if (self._update.name) 
      self._update.slug = uCommons.slugify(self._update.name)

    self._update.updated_at = new Date()

    return next()
  },
  preRemove(next) {
    const self = this
    const findPromises = [
      Client.find({ wishlist: self._conditions._id }).exec(),
      Store.find({ products: self._conditions._id }).exec()
    ]

    Promise.all(findPromises)
    .then(objectsToModify => {
      const clientsToModify = objectsToModify[0]
      const storesToModify  = objectsToModify[1]
      const saves = []

      for (const client of clientsToModify) {
        client.wishlist.pull(self._conditions._id)
        saves.push(client.save())
      }

      for (const store of storesToModify) {
        store.products.pull(self._conditions._id)
        saves.push(store.save())
      }

      return Promise.all(saves)
    })
    .then(savedStuff => next())
    .catch(err => next(err))
  }
}

ProductSchema.pre('save', ProductSchema._middlewareFuncs.preSave)
ProductSchema.pre('update', ProductSchema._middlewareFuncs.preUpdate)
ProductSchema.pre('findOneAndUpdate', ProductSchema._middlewareFuncs.preUpdate)
ProductSchema.pre('remove', ProductSchema._middlewareFuncs.preRemove)
ProductSchema.pre('findOneAndRemove', ProductSchema._middlewareFuncs.preRemove)

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product
