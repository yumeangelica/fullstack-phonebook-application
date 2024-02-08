import { useState, useEffect } from 'react';
import Filter from './components/Filter';
import FilteredPersonsShow from './components/FilteredPersonsShow';
import NewPersonForm from './components/NewPersonsForm';
import NotificationMessage from './components/NotificationMessage';
import apiService from './services/api';
import Footer from './components/Footer';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newFilter, setNewFilter] = useState('');
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [errorHappened, setErrorHappened] = useState(false);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await apiService.getAllPersons();
        setPersons(response.data);
      } catch (error) {
        console.log('Error fetching persons:', error.message);
      }
    };
    fetchPersons();
  }, []);

  const handleRemovePerson = async (id) => {
    const person = persons.find(p => p.id === id);
    const confirmDeletion = window.confirm(`Delete ${person.firstName} ${person.lastName}?`);
    if (!confirmDeletion) return;

    try {
      await apiService.removePerson(id);
      setPersons(persons.filter(p => p.id !== id));
      showNotification(`Deleted ${person.firstName} ${person.lastName}`, false);
    } catch (error) {
      console.log('Error deleting person:', error.message);
      showNotification(`Information of ${person.firstName} ${person.lastName} has already been removed from server`, true);
    }
  };

  const handleAddName = async (event) => {
    event.preventDefault();
    const nameObject = { firstName: newFirstName, lastName: newLastName, number: newNumber };
    const existingPerson = persons.find(person => person.firstName === newFirstName && person.lastName === newLastName);
    
    try {
      if (existingPerson) {
        const confirmUpdate = window.confirm(`${newFirstName} ${newLastName} is already added to phonebook, replace the old number with a new one?`);
        if (!confirmUpdate) return;

        const response = await apiService.updatePerson(existingPerson.id, nameObject);
        setPersons(persons.map(person => person.id !== response.data.id ? person : response.data));
        showNotification(`Updated ${newFirstName} ${newLastName}'s number`, false);
      } else {
        const response = await apiService.createPerson(nameObject);
        setPersons([...persons, response.data]);
        showNotification(`Added ${newFirstName} ${newLastName}`, false);
      }
    } catch (error) {
      showNotification(error.response.data.error, true);
    } finally {
      setNewFirstName('');
      setNewLastName('');
      setNewNumber('');
    }
  };

  const showNotification = (message, isError) => {
    setNotificationMessage(message);
    setErrorHappened(isError);
    setTimeout(() => {
      setNotificationMessage(null);
      setErrorHappened(false);
    }, 3000);
  };

  const filteredPersons = persons.filter(person =>
    person.firstName.toLowerCase().includes(newFilter.toLowerCase()) ||
    person.lastName.toLowerCase().includes(newFilter.toLowerCase()) ||
    person.number.includes(newFilter)
  );

  return (
    <>
      <div className="container">
        <h1 className="text-center">Phonebook</h1>
        <NotificationMessage notificationMessage={notificationMessage} errorHappened={errorHappened} />
        <Filter handleFilterChange={(e) => setNewFilter(e.target.value)} newFilter={newFilter} />
        <NewPersonForm
          newFirstName={newFirstName}
          newLastName={newLastName}
          newNumber={newNumber}
          addName={handleAddName}
          handleFirstNameChange={(e) => setNewFirstName(e.target.value)}
          handleLastNameChange={(e) => setNewLastName(e.target.value)}
          handleNumberChange={(e) => setNewNumber(e.target.value)}
        />
        <FilteredPersonsShow filteredPersons={filteredPersons} removePerson={handleRemovePerson} />
        <Footer />
      </div>
    </>
  );
};

export default App;