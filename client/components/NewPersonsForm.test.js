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

    await act(async () => {
      createRoot(container).render(
        <NewPersonsForm {...mockProps} />
      );
    });

    assert.ok(container.textContent.includes('Add a new contact'));
    assert.ok(container.textContent.includes('First Name:'));
    assert.ok(container.textContent.includes('Last Name:'));
    assert.ok(container.textContent.includes('Number:'));
    assert.ok(container.textContent.includes('Add'));

    document.body.removeChild(container);
  });
});

