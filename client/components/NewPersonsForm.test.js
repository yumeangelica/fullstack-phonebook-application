
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import NewPersonsForm from './NewPersonsForm'

describe('<NewPersonsForm />', () => {

  test('renders NewPersonsFom', () => { // testing to see if NewPersonsForm renders
    const component = render(
      <NewPersonsForm />
    ).container

    expect(component).toHaveTextContent('Add a new') // testing to see if NewPersonsForm renders
    expect(component).toHaveTextContent('name:')
    expect(component).toHaveTextContent('number:')
    expect(component).toHaveTextContent('add')
  })

})

