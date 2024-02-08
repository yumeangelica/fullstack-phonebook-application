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




// import { useState, useEffect } from 'react';
// import Filter from './components/Filter';
// import FilteredPersonsShow from './components/FilteredPersonsShow';
// import NewPersonForm from './components/NewPersonsForm';
// import NotificationMessage from './components/NotificationMessage';
// import apiService from './services/api'; // module that contains axios calls
// import Footer from './components/Footer';

// const App = () => {
//   const [persons, setPersons] = useState([]);
//   const [newFirstName, setNewFirstName] = useState('');
//   const [newLastName, setNewLastName] = useState('');
//   const [newNumber, setNewNumber] = useState('');
//   const [newFilter, setNewFilter] = useState('');
//   const [notificationMessage, setNotificationMessage] = useState(null);
//   const [errorHappened, setErrorHappened] = useState(false);

//   useEffect(() => {
//     apiService.getAllPersons().then(response => {
//       setPersons(response.data);
//     }).catch(error => {
//       console.log('error', error.message);
//     });
//   }, []);

//   const removePerson = (id) => {
//     const person = persons.find(p => p.id === id);
//     const result = window.confirm(`Delete ${person.firstName} ${person.lastName}?`);

//     if (result) {
//       apiService.removePerson(id)
//         .then(() => {
//           setPersons(persons.filter(p => p.id !== id));
//           setNotificationMessage(`Deleted ${person.firstName} ${person.lastName}`);
//           setTimeout(() => {
//             setNotificationMessage(null);
//           }, 3000);
//         })
//         .catch(error => {
//           console.log('error', error.message);
//           setNotificationMessage(`Information of ${person.firstName} ${person.lastName} has already been removed from server`);
//           setErrorHappened(true);
//           setTimeout(() => {
//             setNotificationMessage(null);
//             setErrorHappened(false);
//           }, 3000);
//         });
//     }
//   };

//   const addName = (event) => {
//     event.preventDefault();
//     const nameObject = {
//       firstName: newFirstName,
//       lastName: newLastName,
//       number: newNumber,
//     };

//     const existingPerson = persons.find(person => person.firstName === newFirstName && person.lastName === newLastName);
//     if (existingPerson) {
//       const result = window.confirm(`${newFirstName} ${newLastName} is already added to phonebook, replace the old number with a new one?`);
//       if (result) {
//         apiService.updatePerson(existingPerson.id, nameObject)
//           .then(response => {
//             setPersons(persons.map(person => person.id !== response.data.id ? person : response.data));
//             setNotificationMessage(`Updated ${newFirstName} ${newLastName}'s number`);
//             setTimeout(() => {
//               setNotificationMessage(null);
//             }, 3000);
//           })
//           .catch(error => {
//             setNotificationMessage(error.response.data.error);
//             setErrorHappened(true);
//             setTimeout(() => {
//               setNotificationMessage(null);
//               setErrorHappened(false);
//             }, 3000);
//           });
//       }
//     } else {
//       apiService.createPerson(nameObject)
//         .then(response => {
//           setPersons(persons.concat(response.data));
//           setNotificationMessage(`Added ${newFirstName} ${newLastName}`);
//           setTimeout(() => {
//             setNotificationMessage(null);
//           }, 3000);
//         })
//         .catch(error => {
//           setNotificationMessage(error.response.data.error);
//           setErrorHappened(true);
//           setTimeout(() => {
//             setNotificationMessage(null);
//             setErrorHappened(false);
//           }, 3000);
//         });
//     }
//     setNewFirstName('');
//     setNewLastName('');
//     setNewNumber('');
//   };

//   const filteredPersons = newFilter === '' ? persons : persons.filter(person =>
//     person.firstName.toLowerCase().includes(newFilter.toLowerCase()) ||
//     person.lastName.toLowerCase().includes(newFilter.toLowerCase()) ||
//     person.number.includes(newFilter)
//   );
  
//   const handleFirstNameChange = (event) => {
//     setNewFirstName(event.target.value);
//   };

//   const handleLastNameChange = (event) => {
//     setNewLastName(event.target.value);
//   };

//   const handleNumberChange = (event) => {
//     setNewNumber(event.target.value);
//   };

//   const handleFilterChange = (event) => {
//     setNewFilter(event.target.value);
//   };

//   return (
//     <>
//       <div className="container">
//         <h1 className="text-center">Phonebook</h1>
//         <NotificationMessage notificationMessage={notificationMessage} errorHappened={errorHappened} />
//         <Filter handleFilterChange={handleFilterChange} newFilter={newFilter} />
//         <NewPersonForm
//           newFirstName={newFirstName}
//           newLastName={newLastName}
//           newNumber={newNumber}
//           addName={addName}
//           handleFirstNameChange={handleFirstNameChange}
//           handleLastNameChange={handleLastNameChange}
//           handleNumberChange={handleNumberChange}
//         />
//         <FilteredPersonsShow filteredPersons={filteredPersons} removePerson={removePerson} />
//         <Footer />
//       </div>
//     </>
//   );
// };

// export default App;
