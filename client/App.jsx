import { useCallback, useMemo, useState } from 'react';
import AuthForm from './components/AuthForm';
import Filter from './components/Filter';
import FilteredPersonsShow from './components/FilteredPersonsShow';
import Footer from './components/Footer';
import NewPersonForm from './components/NewPersonsForm';
import NotificationMessage from './components/NotificationMessage';
import UserHeader from './components/UserHeader';
import useAuth from './hooks/useAuth';
import useNotification from './hooks/useNotification';
import usePersons from './hooks/usePersons';
import { getErrorMessage } from './utils/errors';
import { stripFinnishLeadingZero } from './utils/validation';

const App = () => {
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('+358');
  const [newFilter, setNewFilter] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { message, isError, showNotification } = useNotification();
  const {
    user,
    loading: authLoading,
    login,
    register,
    logout,
    deleteAccount,
  } = useAuth();
  const { persons, loading, addPerson, removePerson } = usePersons(
    showNotification,
    user,
  );

  const filteredPersons = useMemo(
    () =>
      persons.filter((person) => {
        const filter = newFilter.toLowerCase();
        return (
          person.firstName.toLowerCase().includes(filter) ||
          person.lastName.toLowerCase().includes(filter) ||
          person.number.includes(newFilter)
        );
      }),
    [persons, newFilter],
  );

  const resetForm = useCallback(() => {
    setNewFirstName('');
    setNewLastName('');
    setNewNumber('');
    setNewCountryCode('+358');
  }, []);

  const handleAddName = useCallback(
    async (event) => {
      event.preventDefault();
      const localNumber = stripFinnishLeadingZero(
        newNumber.trim(),
        newCountryCode,
      );
      const nameObject = {
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        number: `${newCountryCode} ${localNumber}`,
      };

      try {
        // Keep the input intact when the request fails or the user cancels
        const added = await addPerson(nameObject);
        if (added) resetForm();
      } catch (error) {
        showNotification(getErrorMessage(error), true);
      }
    },
    [
      newCountryCode,
      newNumber,
      newFirstName,
      newLastName,
      addPerson,
      showNotification,
      resetForm,
    ],
  );

  const handleNumberChange = useCallback(
    (e) => {
      setNewNumber(stripFinnishLeadingZero(e.target.value, newCountryCode));
    },
    [newCountryCode],
  );

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
        <main>
          <p className="auth-loading-text">Loading...</p>
        </main>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <div className="container">
        <NotificationMessage
          notificationMessage={message}
          errorHappened={isError}
        />
        <main>
          <AuthForm
            onLogin={login}
            onRegister={register}
            showNotification={showNotification}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <h1>Phonebook</h1>
      <UserHeader
        username={user.username}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
      <NotificationMessage
        notificationMessage={message}
        errorHappened={isError}
      />

      <main id="main-content">
        <Filter newFilter={newFilter} onFilterChange={setNewFilter} />

        <div className="toggle-form-container">
          <button
            type="button"
            className="actionbtn"
            onClick={() => setIsFormVisible(!isFormVisible)}
            aria-expanded={isFormVisible}
          >
            {isFormVisible
              ? 'Close new person form'
              : 'Add new person & number'}
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
      </main>
      <Footer />
    </div>
  );
};

export default App;
