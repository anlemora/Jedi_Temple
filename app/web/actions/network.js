import axios from 'axios'
import { receiveProducts, requestProducts } from './products'
import { failedRequest } from './ui'

export const requestCollection = (collection) => ({
  type: `REQUEST_${collection.toUpperCase()}`
})

export const receiveCollection = (collection, items) => ({
  type: `RECEIVE_${collection.toUpperCase()}`,
  items
})

export const fetchCollection = (token, collection) => dispatch => {
  let endpoint = collection
  let url = '/api/'

  if (collection === 'customFields') endpoint = 'custom_fields'
  if (collection === 'hmProducts')   endpoint = 'hm_products'
  url += endpoint

  dispatch(requestCollection(collection))
  return axios.get(url, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(
      response => dispatch(receiveCollection(collection, response.data)),
      error => dispatch(failedRequest(error.response.data.message))
    )
}