import { useState, useMemo, useCallback } from 'react';
import Filter from './components/Filter';
import FilteredPersonsShow from './components/FilteredPersonsShow';
import NewPersonForm from './components/NewPersonsForm';
import NotificationMessage from './components/NotificationMessage';
import Footer from './components/Footer';
import AuthForm from './components/AuthForm';
import UserHeader from './components/UserHeader';
import usePersons from './hooks/usePersons';
import useNotification from './hooks/useNotification';
import useAuth from './hooks/useAuth';

const App = () => {
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('+358');
  const [newFilter, setNewFilter] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { message, isError, showNotification } = useNotification();
  const { user, loading: authLoading, login, register, logout, deleteAccount } = useAuth();
  const { persons, loading, addPerson, removePerson } = usePersons(showNotification, user);

  const filteredPersons = useMemo(() =>
    persons.filter(person => {
      const filter = newFilter.toLowerCase();
      return (
        person.firstName.toLowerCase().includes(filter) ||
        person.lastName.toLowerCase().includes(filter) ||
        person.number.includes(newFilter)
      );
    }),
    [persons, newFilter]
  );

  const resetForm = useCallback(() => {
    setNewFirstName('');
    setNewLastName('');
    setNewNumber('');
    setNewCountryCode('+358');
  }, []);

  const handleAddName = useCallback(async (event) => {
    event.preventDefault();
    const fullPhoneNumber = `${newCountryCode} ${newNumber}`;
    const nameObject = {
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      number: fullPhoneNumber,
    };

    try {
      await addPerson(nameObject);
    } catch (error) {
      const errorMessage = error.response?.data?.error
        || error.response?.data?.details?.join(', ')
        || error.message
        || 'An unexpected error occurred';
      showNotification(errorMessage, true);
    } finally {
      resetForm();
    }
  }, [newCountryCode, newNumber, newFirstName, newLastName, addPerson, showNotification, resetForm]);

  const handleNumberChange = useCallback((e) => {
    let value = e.target.value;
    // Finnish number normalization: remove leading zero from mobile numbers
    if (newCountryCode === '+358' && /^0[4-5]/.test(value)) {
      value = value.substring(1);
    }
    setNewNumber(value);
  }, [newCountryCode]);

  const handleLogout = useCallback(() => {
    logout();
    showNotification('Signed out successfully', false);
  }, [logout, showNotification]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      await deleteAccount();
      showNotification('Account deleted', false);
    } catch (error) {
      showNotification(error.message || 'Failed to delete account', true);
    }
  }, [deleteAccount, showNotification]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container">
        <h1>Phonebook</h1>
        <p className="auth-loading-text">Loading...</p>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="container">
        <NotificationMessage notificationMessage={message} errorHappened={isError} />
        <AuthForm
          onLogin={login}
          onRegister={register}
          showNotification={showNotification}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Phonebook</h1>
      <UserHeader
        username={user.username}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
      <NotificationMessage notificationMessage={message} errorHappened={isError} />

      <Filter
        newFilter={newFilter}
        onFilterChange={setNewFilter}
      />

      <div className="toggle-form-container">
        <button className="actionbtn" onClick={() => setIsFormVisible(!isFormVisible)}>
          {isFormVisible ? 'Close new person form' : 'Add new person & number'}
        </button>
      </div>

      {isFormVisible && (
        <NewPersonForm
          newFirstName={newFirstName}
          newLastName={newLastName}
          newNumber={newNumber}
          newCountryCode={newCountryCode}
          addName={handleAddName}
          handleFirstNameChange={(e) => setNewFirstName(e.target.value)}
          handleLastNameChange={(e) => setNewLastName(e.target.value)}
          handleNumberChange={handleNumberChange}
          handleCountryCodeChange={(e) => setNewCountryCode(e.target.value)}
        />
      )}

      <FilteredPersonsShow
        filteredPersons={filteredPersons}
        removePerson={removePerson}
        loading={loading}
      />
      <Footer />
    </div>
  );
};

export default App;
