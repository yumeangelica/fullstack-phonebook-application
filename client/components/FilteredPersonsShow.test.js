
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import FilteredPersonsShow from './FilteredPersonsShow'

test('renders persons', () => {
  const persons = [ // test data
    {
      name: 'miuku',
      number: '050-4565789',
      id: '1'
    },
    {
      name: 'mauku',
      number: '050-9654321',
      id: '2'
    }
  ]

  const component = render( // render component and pass test data as props
    <FilteredPersonsShow filteredPersons={persons} key={persons.id}/>
  ).container

  expect(component).toHaveTextContent(persons[0].name) // test that persons and numbers are rendered
  expect(component).toHaveTextContent(persons[0].number)
  expect(component).toHaveTextContent(persons[1].name)
  expect(component).toHaveTextContent(persons[1].number)

})