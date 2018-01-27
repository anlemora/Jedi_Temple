const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const clientCtrl = require('../../clientCtrl')

jest.mock('../../../models/Client')
let Client = require('../../../models/Client')

const uSchemas = require('../../../utils/validSchemas')

describe('clientCtrl -> create', () => {
  let clientToSend, savedClient

  beforeEach(() => {
    clientToSend = uSchemas.getValidClient()
    savedClient  = uSchemas.getValidClient()

    Client.prototype.save = jest.fn(() => new Promise((resolve, reject) => { resolve(savedClient) }))
  })

  test('Should instantiate new Client with received body', async () => {
    await clientCtrl.create(clientToSend)

    expect(Client.mock.calls.length).toBe(1)
    expect(Client.mock.calls[0][0]).toBe(clientToSend)
  })

  test('Should call save on the new Client', async () => {
    await clientCtrl.create(clientToSend)
    expect(Client.prototype.save.mock.calls.length).toBe(1)
  })

  test('Should return the new Client after saved', async () => {
    const received = await clientCtrl.create(clientToSend)

    expect(received).toBe(savedClient)
  })

  test('Should throw a ValidationError', done => {
    Client.prototype.save = jest.fn(() => new Promise((resolve, reject) => {
      const err = new Error('Faked Error')
      err.name = 'ValidationError'
      reject(err)
    }))

    clientCtrl.create(clientToSend).then(() => { expect(1).toBe(0) })
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('ValidationError')
      expect(err.customMessage).toBe('Validation Error')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw a DuplicatedError', done => {
    Client.prototype.save = jest.fn(() => new Promise((resolve, reject) => {
      const err = new Error('Faked Error')
      err.code = 11000
      reject(err)
    }))

    clientCtrl.create(clientToSend).then(() => { expect(1).toBe(0) })
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('DuplicationError')
      expect(err.customMessage).toBe('Duplicated Email')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw a UnexpectedError with diferent customOrigin', done => { 
    Client.prototype.save = jest.fn(() => new Promise((resolve, reject) => {
      const err = new Error('Faked Error')
      err.name = 'FakedErrorName'
      reject(err)
    }))

    clientCtrl.create(clientToSend).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('FakedErrorName')
      expect(err.customMessage).toBe('Unexpected Error')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw am error with diferent customOrigin', done => { 
    Client.prototype.save = jest.fn(() => new Promise((resolve, reject) => {
      const err = new Error('Faked Error')
      err.name = 'FakedErrorName'
      err.customOrigin = 'CustomOrigin12342'
      err.customMessage = 'HAHAHAYOUFOOLasd'
      reject(err)
    }))

    clientCtrl.create(clientToSend).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('FakedErrorName')
      expect(err.customMessage).toBe('HAHAHAYOUFOOLasd')
      expect(err.customOrigin).toBe('CustomOrigin12342')
      done()
    })
  })

})

describe('clientCtrl -> remove', () => {
  let idToSend = new ObjectId('fafafafafafafafafafafafa')
  let clientToReturn = uSchemas.getValidClient()
  
  beforeEach(() => {
    Client.findByIdAndRemove = jest.fn(() => ({
      exec: () =>  new Promise((resolve, reject) => { resolve(clientToReturn) })
    }))
  })
  
  test('Should call Client.findByIdAndRemove', async () => {
    await clientCtrl.remove(idToSend)

    expect(Client.findByIdAndRemove.mock.calls.length).toBe(1)
    expect(Client.findByIdAndRemove.mock.calls[0][0]).toBe(idToSend)
  })

  test('Should return the deleted Client', async () => {
    const returnedClient = await clientCtrl.remove(idToSend)
    expect(returnedClient).toBe(clientToReturn)
  })

  test('Should throw a NotFoundError', done => {
    Client.findByIdAndRemove = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'CastError'
        reject(err)
      })
    }))

    clientCtrl.remove(idToSend).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('CastError')
      expect(err.customMessage).toBe(`Client with id: ${idToSend}, not found`)
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw a UnexpectedError with diferent customOrigin', done => { 
    Client.findByIdAndRemove = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'FakedErrorName'
        reject(err)
      })
    }))

    clientCtrl.remove(idToSend).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('FakedErrorName')
      expect(err.customMessage).toBe('Unexpected Error')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw am error with diferent customOrigin', done => { 
    Client.findByIdAndRemove = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'FakedErrorName'
        err.customOrigin = 'CustomOrigin12342'
        err.customMessage = 'HAHAHAYOUFOOLasd'
        reject(err)
      })
    }))

    clientCtrl.remove(idToSend).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('FakedErrorName')
      expect(err.customMessage).toBe('HAHAHAYOUFOOLasd')
      expect(err.customOrigin).toBe('CustomOrigin12342')
      done()
    })
  })

})

describe('clientCtrl -> update', () => {
  let idToSend, update, foundClient, updated

  beforeEach(() => {
    idToSend = new ObjectId('aaffaaffaaffaaffaaffaaff')
    update = { name: 'John Doe' }
    foundClient = uSchemas.getValidClient()
    updated = Object.assign({}, foundClient, {
      name: 'John Doe'
    })
    Client.findByIdAndUpdate = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        resolve(updated)
      })
    }))
  })

  test('Should call Client.findByIdAndUpdate', async () => {
    const expectedOptions = {new: true}

    await clientCtrl.update(idToSend, update)

    expect(Client.findByIdAndUpdate.mock.calls.length).toBe(1)
    expect(Client.findByIdAndUpdate.mock.calls[0][0]).toBe(idToSend)
    expect(Client.findByIdAndUpdate.mock.calls[0][1]).toBe(update)
    expect(Client.findByIdAndUpdate.mock.calls[0][2]).toEqual(expectedOptions)
  })

  test('Should form the updated object return it', async () => {
    const returnedClient = await clientCtrl.update(idToSend, update)
    expect(returnedClient).toBe(updated)
  })

  test('Should throw a ValidationError', done => {
    Client.findByIdAndUpdate = (() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'ValidationError'
        reject(err)
      })
    }))

    clientCtrl.update(idToSend, update).then(() => {expect(1).toBe(0)}) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('ValidationError')
      expect(err.customMessage).toBe('Validation Error')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw a DuplicatedError', done => {
    Client.findByIdAndUpdate = (() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.code = 11000
        err.name = 'SomeWeirdName'
        reject(err)
      })
    }))

    clientCtrl.update(idToSend, update).then(() => {expect(1).toBe(0)}) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.code).toBe(11000)
      expect(err.name).toBe('DuplicationError')
      expect(err.customMessage).toBe('Duplicated Email')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })
  
  test('Should throw a NotFoundError', done => {
    Client.findByIdAndUpdate = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'CastError'
        reject(err)
      })
    }))

    clientCtrl.update(idToSend, update).then(() => {expect(1).toBe(0)})
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.customMessage).toBe(`Client with id: ${idToSend}, not found`)
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw a UnexpectedError with diferent customOrigin', done => { 
    Client.findByIdAndUpdate = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'FakedErrorName'
        reject(err)
      })
    }))

    clientCtrl.update(idToSend, update).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('FakedErrorName')
      expect(err.customMessage).toBe('Unexpected Error')
      expect(err.customOrigin).toBe('Client')
      done()
    })
  })

  test('Should throw am error with diferent customOrigin', done => { 
    Client.findByIdAndUpdate = jest.fn(() => ({
      exec: () => new Promise((resolve, reject) => {
        const err = new Error('Faked Error')
        err.name = 'FakedErrorName'
        err.customOrigin = 'CustomOrigin12342'
        err.customMessage = 'HAHAHAYOUFOOLasd'
        reject(err)
      })
    }))

    clientCtrl.update(idToSend, update).then(() => { expect(1).toBe(0) }) // <- Failing test
    .catch(err => {
      expect(err.message).toBe('Faked Error')
      expect(err.name).toBe('FakedErrorName')
      expect(err.customMessage).toBe('HAHAHAYOUFOOLasd')
      expect(err.customOrigin).toBe('CustomOrigin12342')
      done()
    })
  })

})
