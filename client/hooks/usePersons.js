import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const usePersons = (showNotification, user) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPersons([]);
      setLoading(false);
      return;
    }

    const fetchPersons = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllPersons();
        setPersons(response.data.persons || []);
      } catch (error) {
        console.error('Error fetching persons:', error.message);
        showNotification('Failed to load contacts', true);
      } finally {
        setLoading(false);
      }
    };
    fetchPersons();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPerson = useCallback(async (personData) => {
    const { firstName, lastName } = personData;
    const existingPerson = persons.find(
      person => person.firstName === firstName && person.lastName === lastName
    );

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${firstName} ${lastName} is already added to phonebook, replace the old number with a new one?`
      );
      if (!confirmUpdate) return;

      const response = await apiService.updatePerson(existingPerson.id, personData);
      setPersons(prev => prev.map(p => p.id !== response.data.id ? p : response.data));
      showNotification(`Updated ${firstName} ${lastName}'s number`, false);
    } else {
      const response = await apiService.createPerson(personData);
      setPersons(prev => [...prev, response.data]);
      showNotification(`Added ${firstName} ${lastName}`, false);
    }
  }, [persons, showNotification]);

  const removePerson = useCallback(async (id) => {
    const person = persons.find(p => p.id === id);
    if (!person) return;

    const confirmDeletion = window.confirm(`Delete ${person.firstName} ${person.lastName}?`);
    if (!confirmDeletion) return;

    try {
      await apiService.removePerson(id);
      setPersons(prev => prev.filter(p => p.id !== id));
      showNotification(`Deleted ${person.firstName} ${person.lastName}`, false);
    } catch (_error) {
      showNotification(
        `Information of ${person.firstName} ${person.lastName} has already been removed from server`,
        true
      );
    }
  }, [persons, showNotification]);

  return { persons, loading, addPerson, removePerson };
};

export default usePersons;
