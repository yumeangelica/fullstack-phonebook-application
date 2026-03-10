import { describe, it } from 'node:test';
import assert from 'node:assert';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import FilteredPersonsShow from './FilteredPersonsShow';

describe('<FilteredPersonsShow />', () => {
  it('renders persons', async () => {
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
    ];

    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      createRoot(container).render(
        <FilteredPersonsShow filteredPersons={persons} removePerson={() => { }} />
      );
    });

    assert.ok(container.textContent.includes(persons[0].firstName));
    assert.ok(container.textContent.includes(persons[0].lastName));
    assert.ok(container.textContent.includes(persons[0].number));
    assert.ok(container.textContent.includes(persons[1].firstName));
    assert.ok(container.textContent.includes(persons[1].lastName));
    assert.ok(container.textContent.includes(persons[1].number));
    assert.ok(container.textContent.includes('delete'));

    document.body.removeChild(container);
  });
});