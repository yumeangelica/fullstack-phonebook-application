// axios calls are in services/api.js

import axios from 'axios'

const api = '/api' // api path, addition to baseurl
const persons = '/persons' // persons path in api, addition to baseUrl + api


const axiosClient = axios.create({ // axios client
  baseURL: api
})

const getAllPersons = () => { // get all persons from database
  return axiosClient.get(persons)
}

const createPerson = (newPerson) => { // create new person
  return axiosClient.post(persons, newPerson)
}

const updatePerson = (id, newNumber) => { // update person's number by id
  return axiosClient.put(`${persons}/${id}`, newNumber)
}

const removePerson = (id) => { // remove person from database by id
  return axiosClient.delete(`${persons}/${id}`)
}

export const apiService = {
  getAllPersons,
  createPerson,
  updatePerson,
  removePerson
}


export default apiService

