const moment = require('moment')

const Client = require('../Client')

jest.mock('../Store')
const Store = require('../Store')

const models = require('../../utils/models')
const uCommon = require('../../utils')
const uValid = require('../../utils/validators')
const uSchemas = require('../../utils/validSchemas')

describe('Client model', () => {
  let validClient

  beforeEach(() => { validClient = uSchemas.getValidClient() })

  test('Should be valid', () => {
    const m = new Client(validClient)
    const v = m.validateSync()

    expect(v).toBeFalsy()
  })

  test('Should be invalid if missing: name, email', () => {
    const m = new Client( Object.assign(validClient, { name: undefined, email: undefined, password: undefined }) )
    const v = m.validateSync()

    expect(uCommon.howManyKeys(v.errors)).toBe(2)
    expect(v.errors.name).toBeTruthy()
    expect(v.errors.email).toBeTruthy()
  })

  test('Should be invalid if Wishlist Product id is empty', () => {
    const m = new Client( Object.assign(validClient, { wishlist: [ '' ] }) )
    const v = m.validateSync()

    expect(uCommon.howManyKeys(v.errors)).toBe(1)
    expect(v.errors['wishlist']).toBeTruthy()
  })
  
  test('Should be invalid if Wishlist Product id is wrong', () => {
    const m = new Client( Object.assign(validClient, { wishlist: [ 'somewrongid' ] }) )
    const v = m.validateSync()

    expect(uCommon.howManyKeys(v.errors)).toBe(1)
    expect(v.errors['wishlist']).toBeTruthy()
  })

  test('Should be invalid if address is malformed', () => {
    const m = new Client( Object.assign(validClient, { addresses: [ 'supbabe' ] }) )
    const v = m.validateSync()

    expect(uCommon.howManyKeys(v.errors)).toBe(1)
    expect(v.errors.addresses).toBeTruthy()
  })

  test('Should be invalid if order id is empty', () => {
    const m = new Client( Object.assign(validClient, { orders: [ '' ] }) )
    const v = m.validateSync()

    expect(uCommon.howManyKeys(v.errors)).toBe(1)
    expect(v.errors.orders).toBeTruthy()
  })

  test('Should be invalid if order id is malformed', () => {
    const m = new Client( Object.assign(validClient, { orders: [ 'supbabe' ] }) )
    const v = m.validateSync()

    expect(uCommon.howManyKeys(v.errors)).toBe(1)
    expect(v.errors.orders).toBeTruthy()
  })

  describe('preSave Middleware', () => {
    const bindMiddleware = context => 
      Client.schema._middlewareFuncs.preSave.bind(context)

    test('Should call next', done => {
      const context = validClient

      const boundMiddleware = bindMiddleware(context)
      const next = err => {
        expect(err).toBeFalsy()
        done()
      }

      boundMiddleware(next)
    })

    test('Should add created_at and updated_at', done => {
      const context = validClient

      const boundMiddleware = bindMiddleware(context)
      const next = err => {
        expect(err).toBeFalsy()        
        expect( uValid.isThisMinute(validClient.created_at) ).toBeTruthy()
        expect( uValid.isThisMinute(validClient.updated_at) ).toBeTruthy()
        done()
      }

      boundMiddleware(next)
    })

    test('Should modify updated_at but not created_at', done => {
      const creationDate = moment().subtract(1, 'weeks').toDate()
      Object.assign( validClient, { created_at: creationDate, updated_at: creationDate } )
      const context = validClient

      const boundMiddleware = bindMiddleware(context)
      const next = err => {
        expect(err).toBeFalsy()
        expect( validClient.created_at ).toBe(creationDate)
        expect( uValid.isThisMinute(validClient.updated_at) ).toBeTruthy()
        done()
      }

      boundMiddleware(next)
    })

    test('Should encrypt password before saving it', done => {
      hashSpy = jest.spyOn(models, 'hashPassword')

      const context = validClient

      const boundMiddleware = bindMiddleware(context)
      const next = err => {
        expect(err).toBeFalsy()
        expect( hashSpy ).toHaveBeenCalled()
        expect( context.password ).toBeTruthy()
        expect( context.salt ).toBeTruthy()
        models.hashPassword.mockRestore()      
        done()
      }

      boundMiddleware(next)
    })

    test('Shoul call next with no password error', done => {
      delete validClient.password
      const context = validClient
      context.isNew = true

      const boundMiddleware = bindMiddleware(context)
      const next = err => {        
        expect(err.message).toBe('Password Required')
        expect(err.name).toBe('ValidationError')
        done()
      }

      boundMiddleware(next)
    })

    test('Should call next with encryption error', done => {
      const oldHashPswd = models.hashPassword
      const context = validClient
      models.hashPassword = jest.fn( () => new Promise((resolve, reject) => { reject(new Error('hola_amigo')) }) )

      const boundMiddleware = bindMiddleware(context)
      const next = err => {
        expect( err.message ).toBe('hola_amigo')
        models.hashPassword = oldHashPswd
        done()
      }

      boundMiddleware(next)
    })

  })

  describe('preUpdate Middleware', () => {
    const bindMiddleware = context => 
      Client.schema._middlewareFuncs.preUpdate.bind(context)

    test('Should call next', done => {
      const boundMiddleware = bindMiddleware({ _update: validClient })
      const next = err => {
        expect(err).toBeFalsy()
        done()
      }

      boundMiddleware(next)
    })

    test('Should update updated_at date', done => {
      const creationDate = moment().subtract(1, 'weeks').toDate()
      Object.assign( validClient, { created_at: creationDate, updated_at: creationDate } )

      const updateObj = validClient

      const boundMiddleware = bindMiddleware({ _update: updateObj })
      const next = err => {
        expect(err).toBeFalsy()
        expect( validClient.created_at ).toBe(creationDate)
        expect( uValid.isThisMinute(validClient.updated_at) ).toBeTruthy()
        done()
      }

      boundMiddleware(next)
    })  

    test('Should encrypt password before saving', done => {
      hashSpy = jest.spyOn(models, 'hashPassword')

      const context = { password: 'newpas' }

      const boundMiddleware = bindMiddleware({ _update: context })
      const next = err => {
        expect(err).toBeFalsy()
        expect( hashSpy ).toHaveBeenCalled()
        expect( context.password ).toBeTruthy()
        expect( context.salt ).toBeTruthy()
        models.hashPassword.mockRestore()
        done()
      }

      boundMiddleware(next)
    })

    test('Should call next with encryption error', done => {
      const oldHashPswd = models.hashPassword
      const context = { password: 'newpas' }
      models.hashPassword = jest.fn(() => new Promise((resolve, reject) => { reject(new Error('hola_amigo')) }))

      const boundMiddleware = bindMiddleware({ _update: context })
      const next = err => {
        expect( err.message ).toBe('hola_amigo')
        models.hashPassword = oldHashPswd
        done()
      }

      boundMiddleware(next)
    })

  })

  describe('preRemove Middleware', () => {

    beforeEach(() => {
      Store.find = jest.fn(() => ({
        exec: () => new Promise((resolve, reject) => { resolve([]) })
      }))
    })

    const bindMiddleware = context => 
      Client.schema._middlewareFuncs.preRemove.bind(context)

    test('Should call next', done => {
      const _conditions = { _id: 'jarrito_loco' }
      const boundMiddleware = bindMiddleware({ _conditions })
      const next = err => {
        expect(err).toBeFalsy()
        done()
      }

      boundMiddleware(next)
    })

    test('Should call Store.find with the client id', done => {
      const _conditions = { _id: 'jarrito_loco' }
      const boundMiddleware = bindMiddleware({ _conditions })
      const expectedQuery = { clients: 'jarrito_loco' }
      const next = err => {
        expect(err).toBeFalsy()
        expect( Store.find.mock.calls.length ).toBe(1)
        expect( Store.find.mock.calls[0][0] ).toEqual(expectedQuery)
        done()
      }

      boundMiddleware(next)      
    })

    test('Should update and save found stores', done => {
      const _conditions = { _id: 'jarrito_loco' }
      const boundMiddleware = bindMiddleware({ _conditions })
      const foundStores = [{
        clients: ['jarrito_loco'],
        save: jest.fn(() => new Promise((resolve, reject) => { resolve() }))
      },{
        clients: ['a_client', 'jarrito_loco'],
        save: jest.fn(() => new Promise((resolve, reject) => { resolve() }))
      }]
      foundStores[0].clients.pull = jest.fn(() => { foundStores[0].clients.pop() })
      foundStores[1].clients.pull = jest.fn(() => { foundStores[1].clients.pop() })

      Store.find = jest.fn(() => ({
        exec: () => new Promise((resolve, reject) => { resolve(foundStores) })
      }))
      const next = err => {
        expect( foundStores[0].clients.length ).toBe(0)
        expect( foundStores[0].clients.pull.mock.calls.length ).toBe(1)
        expect( foundStores[0].clients.pull.mock.calls[0][0] ).toBe('jarrito_loco')
        expect( foundStores[0].save.mock.calls.length ).toBe(1)

        expect( foundStores[1].clients.length ).toBe(1)
        expect( foundStores[1].clients.pull.mock.calls.length ).toBe(1)
        expect( foundStores[1].clients.pull.mock.calls[0][0] ).toBe('jarrito_loco')
        expect( foundStores[1].save.mock.calls.length ).toBe(1)
        done()
      }

      boundMiddleware(next)
    })

    test('Should call next with store find error', done => {
      const _conditions = { _id: 'jarrito_loco' }
      const boundMiddleware = bindMiddleware({ _conditions })

      Store.find = jest.fn(() => ({
        exec: () => new Promise((resolve, reject) => { reject(new Error('Test store find error')) })
      }))
      const next = err => {
        expect(err.message).toBe('Test store find error')
        done()
      }

      boundMiddleware(next)
    })

    test('Should call next with store update error', done => {
      const _conditions = { _id: 'jarrito_loco' }
      const boundMiddleware = bindMiddleware({ _conditions })
      const foundStores = [{
        clients: ['jarrito_loco'],
        save: jest.fn(() => { throw new Error('Se rompio el jarrito :c') })
      },{
        clients: ['a_client', 'jarrito_loco'],
        save: jest.fn(() => { throw new Error('Se rompio el jarrito :c') })
      }]
      foundStores[0].clients.pull = jest.fn(() => { foundStores[0].clients.pop() })
      foundStores[1].clients.pull = jest.fn(() => { foundStores[1].clients.pop() })

      Store.find = jest.fn(() => ({
        exec: () => new Promise((resolve, reject) => { resolve(foundStores) })
      }))
      const next = err => {
        expect(err.message).toBe('Se rompio el jarrito :c')
        done()
      }

      boundMiddleware(next)
    })

  })

})