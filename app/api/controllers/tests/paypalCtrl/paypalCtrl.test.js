const paypalCtrl = require('../../paypalCtrl')

jest.mock('axios')
const axios = require('axios')

describe('paypalCtrl', () => {

  describe('createExperience', () => {
    let requestBodyToSend
    
    beforeEach(() => {
      axios.post = jest.fn((url, options) => new Promise((resolve, reject) => {
        resolve({ data: { name: 'new exp', id: 'newexpid' } })
      }))
      paypalCtrl.getAuthToken = jest.fn(() => new Promise((resolve, reject) => { resolve('Bearer heythisistoken') }))

      requestBodyToSend = {
        name: 'this is the sent name',
        id: 'heyhey'
      }
    })
    
    test('Should call this.getToken', async () => {
      const experience = await paypalCtrl.createExperience(requestBodyToSend)

      expect(paypalCtrl.getAuthToken.mock.calls.length).toBe(1)
    })

    test('Should call axios with correct options and sent body', async () => {
      const expectedOptions = {
        data: requestBodyToSend,
        headers: {
          'Content-Type': 'application/JSON',
          'Authorization': 'Bearer heythisistoken'
        }
      }

      const experience = await paypalCtrl.createExperience(requestBodyToSend)

      const axiosUrl     = axios.post.mock.calls[0][0]
      const axiosOptions = axios.post.mock.calls[0][1]
      expect(axios.post.mock.calls.length).toBe(1)
      expect(axiosUrl).toBe('https://api.sandbox.paypal.com/v1/payment-experience/web-profiles')
      expect(axiosOptions).toEqual(expectedOptions)
    })

    test('Should return the created experience', async () => {
      const expectedExperience = { name: 'new exp', id: 'newexpid' }
      const experience = await paypalCtrl.createExperience(requestBodyToSend)

      expect(experience).toEqual(expectedExperience)
    })

    test('Should throw axios response error', async () => {
      axios.post = jest.fn(() => new Promise((resolve, reject) => {
        const resError = new Error('Faked Error')
        resError.response = {
          data: 'why do you care',
          headers: { 'header1': 'someinfo' },
          status: 500
        }
        reject(resError)
      }))

      try {
        await paypalCtrl.createExperience(requestBodyToSend)
        expect(1).toBe(0)
      } catch (e) {
        expect(e.message).toBe('Response error')
        expect(e.response).toEqual({
          data: 'why do you care',
          headers: { 'header1': 'someinfo' },
          status: 500
        })
      }
    })

    test('Should throw axios request error', async () => {
      axios.post = jest.fn(() => new Promise((resolve, reject) => {
        const resError = new Error('Faked Error')
        resError.request = 'BADBADBAD'
        reject(resError)
      }))

      try {
        await paypalCtrl.createExperience(requestBodyToSend)
        expect(1).toBe(0)
      } catch (e) {
        expect(e.message).toBe('Error on request')
        expect(e.request).toBe('BADBADBAD')
      }
    })

    test('Should throw unexpected eror', async () => {
      axios.post = jest.fn(() => new Promise((resolve, reject) => {
        reject(new Error('Faked Error'))
      }))

      try {
        await paypalCtrl.createExperience(requestBodyToSend)
        expect(1).toBe(0)
      } catch (e) {
        expect(e.message).toBe('Faked Error')
      }
    })

  })
  

  describe('createPayment', () => {

    test('Should call get token')

    test('Should call axios with correct options and sent body')

    test('Should return the created payment')

    test('Should throw axios response error')

    test('Should throw axios request error')

    test('Should throw unexpected error')

  })
  
  describe('getAuthToken', () => {

    test('Should call axios with correct options and auth data')

    test('Should return the token formatted for instant use')

    test('Should send axios response error')

    test('Should send axios request error')

    test('Should send unexpected error')

  })
  
  describe('getRemoteExperiences', () => {
    
    test('Should call getAuthToken')

    test('Should call axios with the right method, headers and auth')

    test('Should return the array of found experiences')

    test('Should return response error')

    test('Should return request error')

    test('Should return unexpected error')

  })

})
