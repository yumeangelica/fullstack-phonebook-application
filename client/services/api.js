import axios from 'axios';

const baseURL = '/api';
const personsEndpoint = '/persons';

const axiosClient = axios.create({
  baseURL: baseURL,
});

const getAllPersons = async () => {
  try {
    const response = await axiosClient.get(personsEndpoint);
    return response;
  } catch (error) {
    throw error;
  }
};

const createPerson = async (newPerson) => {
  try {
    const response = await axiosClient.post(personsEndpoint, newPerson);
    return response;
  } catch (error) {
    throw error;
  }
};

const updatePerson = async (id, updatedDetails) => {
  try {
    const response = await axiosClient.put(`${personsEndpoint}/${id}`, updatedDetails);
    return response;
  } catch (error) {
    throw error;
  }
};

const removePerson = async (id) => {
  try {
    const response = await axiosClient.delete(`${personsEndpoint}/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllPersons,
  createPerson,
  updatePerson,
  removePerson,
};

