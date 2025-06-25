
import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import FilteredPersonsShow from './FilteredPersonsShow'

test('renders persons', () => {
  const persons = [
    {
      firstName: 'miuku',
      lastName: 'miau',
      number: '050-4565789',
      id: '1'
    },
    {
      firstName: 'mauku',
      lastName: 'miauu',
      number: '050-9654321',
      id: '2'
    }
  ]

  const mockRemovePerson = jest.fn(); // Mock function for removePerson

  const component = render( // Render component and pass test data as props
    <FilteredPersonsShow filteredPersons={persons} removePerson={mockRemovePerson} />
  ).container

  expect(component).toHaveTextContent(persons[0].firstName) // Test that persons and numbers are rendered
  expect(component).toHaveTextContent(persons[0].lastName)
  expect(component).toHaveTextContent(persons[0].number)
  expect(component).toHaveTextContent(persons[1].firstName)
  expect(component).toHaveTextContent(persons[1].lastName)
  expect(component).toHaveTextContent(persons[1].number)
  expect(component).toHaveTextContent('delete') // Test that delete button is rendered

})