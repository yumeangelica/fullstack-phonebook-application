// axios calls are in services/api.js

import axios from 'axios'

const baseUrl = process.env.REACT_APP_BACKEND_URL // backend baseurl from .env file
const api = '/api' // api path, addition to baseurl
const persons = '/persons' // persons path in api, addition to baseUrl + api

const url = baseUrl + api // url for axios calls

const getAllPersons = () => { // get all persons from database
  return axios.get(`${url}${persons}`)
}

const createPerson = (newPerson) => { // create new person
  return axios.post(url + persons, newPerson)
}

const updatePerson = (id, newNumber) => { // update person's number by id
  return axios.put(`${url}${persons}/${id}`, newNumber)
}

const removePerson = (id) => { // remove person from database by id
  return axios.delete(`${url}${persons}/${id}`)
}

export const apiService = {
  getAllPersons,
  createPerson,
  updatePerson,
  removePerson
}


export default apiService

