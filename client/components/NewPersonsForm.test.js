import { describe, it } from 'node:test';
import assert from 'node:assert';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import NewPersonsForm from './NewPersonsForm';

describe('<NewPersonsForm />', () => {
  it('renders NewPersonsForm', async () => {
    const mockProps = {
      newFirstName: '',
      newLastName: '',
      newNumber: '',
      newCountryCode: '+358',
      addName: () => { },
      handleFirstNameChange: () => { },
      handleLastNameChange: () => { },
      handleNumberChange: () => { },
      handleCountryCodeChange: () => { }
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    let root;

    await act(async () => {
      root = createRoot(container);
      root.render(
        <NewPersonsForm {...mockProps} />
      );
    });

    assert.ok(container.textContent.includes('Add a new contact'));
    assert.ok(container.textContent.includes('First Name:'));
    assert.ok(container.textContent.includes('Last Name:'));
    assert.ok(container.textContent.includes('Country & Number:'));
    assert.ok(container.textContent.includes('Add'));

    // Check that form inputs exist with proper ids
    assert.ok(container.querySelector('#firstName'));
    assert.ok(container.querySelector('#lastName'));
    assert.ok(container.querySelector('#phoneNumber'));
    assert.ok(container.querySelector('#countryCode'));

    await act(() => root.unmount());
    document.body.removeChild(container);
  });
});

