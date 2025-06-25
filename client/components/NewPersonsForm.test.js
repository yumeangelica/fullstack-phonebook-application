
import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import NewPersonsForm from './NewPersonsForm'

describe('<NewPersonsForm />', () => {

  test('renders NewPersonsFom', () => { // Testing to see if NewPersonsForm renders
    const mockProps = {
      newFirstName: '',
      newLastName: '',
      newNumber: '',
      addName: jest.fn(),
      handleFirstNameChange: jest.fn(),
      handleLastNameChange: jest.fn(),
      handleNumberChange: jest.fn()
    };

    const component = render(
      <NewPersonsForm {...mockProps} />
    ).container

    expect(component).toHaveTextContent('Add a new contact') // Testing to see if NewPersonsForm renders
    expect(component).toHaveTextContent('First Name:')
    expect(component).toHaveTextContent('Last Name:')
    expect(component).toHaveTextContent('Number:')
    expect(component).toHaveTextContent('Add')
  })

})

