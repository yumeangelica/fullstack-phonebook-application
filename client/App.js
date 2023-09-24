
import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import FilteredPersonsShow from './components/FilteredPersonsShow'
import NewPersonForm from './components/NewPersonsForm'
import NotificationMessage from './components/NotificationMessage'
import apiService from './services/api' // module that contains axios calls
import Footer from './components/Footer'


const App = () => {

  const [persons, setPersons] = useState([]) // persons state variable that contains all persons in list

  const [newName, setNewName] = useState('') // controls input field for name
  const [newNumber, setNewNumber] = useState('') // controls input field for number
  const [newFilter, setNewFilter] = useState('') // controls input field for filter

  const [notificationMessage, setNotificationMessage] = useState(null) // controls notification message
  const [errorHappened, setErrorHappened] = useState(false) // boolean - controls message color if error happened


  useEffect(() => { // getting all persons from database
    apiService
      .getAllPersons() // returns all data from database
      .then(response => {
        setPersons(response.data)
      }).
      catch(error => {
        console.log('error', error.message)
      })
  }, [])


  // removing person from database by id
  const removePerson = (id) => {
    const person = persons.find(p => p.id === id)
    const result = window.confirm(`Delete ${person.name}?`) // asking user if he/she is sure about deleting person

    if (result) { // if user is sure, then delete person
      apiService
        .removePerson(id)
        .then(response => {
          setPersons(persons.filter(p => p.id !== id))

          setNotificationMessage( // setting notification message when person is deleted
            `Deleted ${person.name}`
          )
          setTimeout(() => { // setting notification message visible for 3 seconds
            setNotificationMessage(null)
          }, 3000)

        })
        .catch(error => {
          console.log('error', error.message)

          setNotificationMessage( // setting notification message when person is not found
            `Information of ${person.name} has already been removed from server`
          )
          setErrorHappened(true)
          setTimeout(() => { // setting notification message visible for 3 seconds
            setNotificationMessage(null); setErrorHappened(false)
          }, 3000)

        })
    }
  }


  // adding new person to database
  const addName = (event) => {
    event.preventDefault()

    const nameObject = { // new person object
      name: newName,
      number: newNumber
    }

    if (persons.some(person => person.name === newName)) { // checking if name already exists in persons array

      if (persons.some(person => person.number !== newNumber)) { // checking if number is different than the one in persons array

        const result = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`) // asking user if he/she is sure about updating number

        if (result) { // if user is sure(window.confirm returns true), then update number
          apiService
            .updatePerson(persons.find(person => person.name === newName).id, nameObject)
            .then(response => {
              setPersons(persons.map(person => person.id !== response.data.id ? person : response.data))

              setNotificationMessage( // setting notification message when person's number is updated
                `Updated ${nameObject.name}'s number`
              )
              setTimeout(() => {  // setting notification message visible for 3 seconds
                setNotificationMessage(null)
              }, 3000)

            }
            )
            .catch(error => { // if update fails, catch error

              setNotificationMessage( // setting notification message when person's number is not updated
                error.response.data.error
              )
              setErrorHappened(true)
              setTimeout(() => { // setting notification message visible for 3 seconds
                setNotificationMessage(null); setErrorHappened(false)
              }, 3000)

            }

            )
        }
      }
    }

    else { // if name doesn't exist in persons array, then add new person, HTTP POST

      apiService
        .createPerson(nameObject) // creating new person with nameObject
        .then(response => {
          setPersons(persons.concat(response.data)) // adding new person to persons array in state, using response data so that id is included

          setNotificationMessage( // set notification message when person is added
            `Added ${nameObject.name}`
          )
          setTimeout(() => { // setting notification message visible for 3 seconds
            setNotificationMessage(null)
          }, 3000)

        })
        .catch(error => { // if adding person fails, catch error

          setNotificationMessage( // setting notification message when person is not added
            error.response.data.error
          )
          setErrorHappened(true)
          setTimeout(() => { // setting notification message visible for 3 seconds
            setNotificationMessage(null); setErrorHappened(false)
          }, 3000)

        }
        )
    }
    setNewName('') // make input field empty after submit
    setNewNumber('')
  }


  const filteredPersons = newFilter === '' ? persons : persons.filter(person => person.name.toLowerCase().includes(newFilter.toLowerCase())) // filters persons array based on newFilter state variable

  const handleNameChange = (event) => { // event handler for name input field
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => { // event handler for number input field
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => { // event handler for filter input field
    setNewFilter(event.target.value)
  }


  return (
    <>
      <div className="container"> {/* container on bootstrapin luokka, joka keskittää sivun sisällön */}

        <h1>Phonebook</h1>

        <NotificationMessage notificationMessage={notificationMessage} errorHappened={errorHappened} />

        <Filter handleFilterChange={handleFilterChange} newFilter={newFilter} />

        <NewPersonForm newName={newName} newNumber={newNumber} addName={addName} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange} />

        <FilteredPersonsShow filteredPersons={filteredPersons} removePerson={removePerson} />

        <Footer />
      </div>

    </>
  )

}

export default App