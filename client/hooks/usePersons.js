import { useCallback, useEffect, useState } from 'react';
import apiService from '../services/api';
import useConfirm from './useConfirm';

const usePersons = (showNotification, user) => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  useEffect(() => {
    if (!user) {
      setPersons([]);
      setLoading(false);
      return;
    }

    // Ignore stale responses if the user logs out or changes mid-request
    let ignore = false;

    const fetchPersons = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllPersons();
        if (!ignore) setPersons(response.data.persons || []);
      } catch (error) {
        if (!ignore) {
          console.error('Error fetching persons:', error.message);
          showNotification('Failed to load contacts', true);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPersons();

    return () => {
      ignore = true;
    };
  }, [user, showNotification]);

  // Resolves to true when a person was saved, false when the user cancelled
  const addPerson = useCallback(
    async (personData) => {
      const { firstName, lastName } = personData;
      // Case-insensitive, consistent with the contact filter
      const existingPerson = persons.find(
        (person) =>
          person.firstName.toLowerCase() === firstName.toLowerCase() &&
          person.lastName.toLowerCase() === lastName.toLowerCase(),
      );

      if (existingPerson) {
        const confirmUpdate = await confirm({
          message: `${firstName} ${lastName} is already added to phonebook, replace the old number with a new one?`,
          confirmLabel: 'Replace',
        });
        if (!confirmUpdate) return false;

        const response = await apiService.updatePerson(
          existingPerson.id,
          personData,
        );
        setPersons((prev) =>
          prev.map((p) => (p.id !== response.data.id ? p : response.data)),
        );
        showNotification(`Updated ${firstName} ${lastName}'s number`, false);
      } else {
        const response = await apiService.createPerson(personData);
        setPersons((prev) => [...prev, response.data]);
        showNotification(`Added ${firstName} ${lastName}`, false);
      }

      return true;
    },
    [persons, showNotification, confirm],
  );

  const removePerson = useCallback(
    async (id) => {
      const person = persons.find((p) => p.id === id);
      if (!person) return;

      const confirmDeletion = await confirm({
        message: `Delete ${person.firstName} ${person.lastName}?`,
        confirmLabel: 'Delete',
      });
      if (!confirmDeletion) return;

      try {
        await apiService.removePerson(id);
        setPersons((prev) => prev.filter((p) => p.id !== id));
        showNotification(
          `Deleted ${person.firstName} ${person.lastName}`,
          false,
        );
      } catch (_error) {
        showNotification(
          `Information of ${person.firstName} ${person.lastName} has already been removed from server`,
          true,
        );
      }
    },
    [persons, showNotification, confirm],
  );

  return { persons, loading, addPerson, removePerson };
};

export default usePersons;
