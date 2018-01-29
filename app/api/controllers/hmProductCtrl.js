const HMProduct = require('../models/HMProduct')

const { sendError } = require('../utils/http')

module.exports = {
  apiAll, 
  apiCreate, 
  apiRead, 
  apiRemove, 
  apiUpdate,

  apiCreateMaterial,
  apiRemoveMaterial,
  apiUpdateMaterial,

  apiCreateModel,
  apiRemoveModel,
  apiUpdateModel
}

async function apiAll(req, res) {
  try {
    let all = await HMProduct.find().exec()
    res.status(200).json(all)
  } catch (e) {
    sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiCreate(req, res) {
  try {
    let newHMProduct = await new HMProduct(req.body).save()
    res.status(200).json(newHMProduct)
  } catch (e) {
    if (e.name === 'ValidationError')
      sendError(403, 'Validation Error', e, res)
    else if (e.code === 11000)
      sendError(409, 'Duplicated Name', e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiRead(req, res) {
  try {
    const foundHMProduct = await HMProduct.findById(req.params.id).exec()
    if (!foundHMProduct) {
      let notFoundError = new Error(`HMProduct ${req.params.id} not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    res.status(200).json(foundHMProduct)
  } catch(e) {
    if (e.name === 'NotFoundError')
      sendError(404, `HMProduct with id: ${req.params.id}, not found`, e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiRemove(req, res) {
  try {
    const removedHMProduct = await HMProduct.findByIdAndRemove(req.params.id).exec()

    if (!removedHMProduct) {
      let notFoundError = new Error(`HMProduct ${req.params.id} not found`)
      notFoundError.name = "NotFoundError"
      throw notFoundError
    }

    res.status(200).json(removedHMProduct)
  } catch (e) {
    if (e.name === 'CastError' || e.name === 'NotFoundError')
      sendError(404, `HMProduct with id: ${req.params.id}, not found`, e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiUpdate(req, res) {
  try {
    const updatedHMProduct = await HMProduct.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec()

    res.status(200).json(updatedHMProduct)
  } catch (e) {
    if (e.name === 'ValidationError')
      sendError(403, 'Validation Error', e, res)
    else if (e.name === 'CastError')
      sendError(404, `HMProduct with id: ${req.params.id}, not found`, e, res)
    else if (e.code === 11000)
      sendError(409, 'Duplicated Name', e, res)
    else
      sendError(500, 'Unexpected Error', e, res)

  }
}

async function apiCreateMaterial(req, res) {
  try {
    const hmProductToUpdate = await HMProduct.findById(req.params.hmproduct_id).exec()

    if (!hmProductToUpdate) {
      let notFoundError = new Error(`HMProduct ${req.params.hmproduct_id} not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    hmProductToUpdate.materials.push(req.body)
    await hmProductToUpdate.save()

    res.status(200).json(hmProductToUpdate)
  } catch (e) {
    if (e.name === 'NotFoundError')
      sendError(404, `HMProduct with id: ${req.params.hmproduct_id}, not found`, e, res)
    else if (e.name === 'ValidationError')
      sendError(403, 'Validation Error', e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiRemoveMaterial(req, res) {
  try {
    const hmProductToUpdate = await HMProduct.findById(req.params.hmproduct_id).exec()

    if (!hmProductToUpdate) {
      let notFoundError = new Error(`HMProduct with id: ${req.params.hmproduct_id}, not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    hmProductToUpdate.materials.pull({ _id: req.params.material_id })
    await hmProductToUpdate.save()

    res.status(200).json(hmProductToUpdate)
    
  } catch(e) {
    if (e.customOrigin === 'Product')
      sendError(500, 'Products Update Error', e, res)
    else if (e.name === 'CastError' || e.name === 'NotFoundError')
      sendError(404, e.message, e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiUpdateMaterial(req, res) {
  try {
    const hmProductToUpdate = await HMProduct.findById(req.params.hmproduct_id).exec()
    if (!hmProductToUpdate) {
      let notFoundError = new Error(`HMProduct with id: ${req.params.hmproduct_id}, not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    const oldMaterial = hmProductToUpdate.materials.id( req.params.material_id )
    if (!oldMaterial) {
      let notFoundError = new Error(`Value with id: ${ req.params.material_id }, not found for HMProduct with id: ${ req.params.hmproduct_id }`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    } else {
      Object.assign(oldMaterial, req.body)
      await hmProductToUpdate.save()
      res.status(200).json(hmProductToUpdate)      
    }
  } catch (e) {
    if (e.customOrigin === 'Product') 
      sendError(500, 'Products Update Error', e, res)
    else if (e.name === 'ValidationError')
      sendError(403, 'Validation Error', e, res)
    else if (e.name === 'NotFoundError')
      sendError(404, e.message, e, res)
    else if (e.name === 'Malformed Request')
      sendError(400, 'Malformed Request', e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}


async function apiCreateModel(req, res) {
  try {
    const hmProductToUpdate = await HMProduct.findById(req.params.hmproduct_id).exec()

    if (!hmProductToUpdate) {
      let notFoundError = new Error(`HMProduct ${req.params.hmproduct_id} not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    hmProductToUpdate.models.push(req.body)
    await hmProductToUpdate.save()

    res.status(200).json(hmProductToUpdate)
  } catch (e) {
    if (e.name === 'NotFoundError')
      sendError(404, `HMProduct with id: ${req.params.hmproduct_id}, not found`, e, res)
    else if (e.name === 'ValidationError')
      sendError(403, 'Validation Error', e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiRemoveModel(req, res) {
  try {
    const hmProductToUpdate = await HMProduct.findById(req.params.hmproduct_id).exec()

    if (!hmProductToUpdate) {
      let notFoundError = new Error(`HMProduct with id: ${req.params.hmproduct_id}, not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    hmProductToUpdate.models.pull({ _id: req.params.model_id })
    await hmProductToUpdate.save()

    res.status(200).json(hmProductToUpdate)
  } catch(e) {
    if (e.customOrigin === 'Product')
      sendError(500, 'Products Update Error', e, res)
    else if (e.name === 'CastError' || e.name === 'NotFoundError')
      sendError(404, e.message, e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}

async function apiUpdateModel(req, res) {
  try {
    const hmProductToUpdate = await HMProduct.findById(req.params.hmproduct_id).exec()
    if (!hmProductToUpdate) {
      let notFoundError = new Error(`HMProduct with id: ${req.params.hmproduct_id}, not found`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    }

    const oldModel = hmProductToUpdate.models.id( req.params.model_id )
    if (!oldModel) {
      let notFoundError = new Error(`Value with id: ${ req.params.model_id }, not found for HMProduct with id: ${ req.params.hmproduct_id }`)
      notFoundError.name = 'NotFoundError'
      throw notFoundError
    } else {
      Object.assign(oldModel, req.body)
      await hmProductToUpdate.save()
      res.status(200).json(hmProductToUpdate)      
    }
  } catch (e) {
    if (e.customOrigin === 'Product') 
      sendError(500, 'Products Update Error', e, res)
    else if (e.name === 'ValidationError')
      sendError(403, 'Validation Error', e, res)
    else if (e.name === 'NotFoundError')
      sendError(404, e.message, e, res)
    else if (e.name === 'Malformed Request')
      sendError(400, 'Malformed Request', e, res)
    else
      sendError(500, 'Unexpected Error', e, res)
  }
}
