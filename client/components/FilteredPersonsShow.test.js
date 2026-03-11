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
    let root;

    await act(async () => {
      root = createRoot(container);
      root.render(
        <FilteredPersonsShow filteredPersons={persons} removePerson={() => { }} loading={false} />
      );
    });

    assert.ok(container.textContent.includes(persons[0].firstName));
    assert.ok(container.textContent.includes(persons[0].lastName));
    assert.ok(container.textContent.includes(persons[0].number));
    assert.ok(container.textContent.includes(persons[1].firstName));
    assert.ok(container.textContent.includes(persons[1].lastName));
    assert.ok(container.textContent.includes(persons[1].number));
    assert.ok(container.textContent.includes('delete'));

    // Check accessible delete button labels
    const deleteButtons = container.querySelectorAll('button[aria-label]');
    assert.strictEqual(deleteButtons.length, 2);
    assert.ok(deleteButtons[0].getAttribute('aria-label').includes('miuku'));

    await act(() => root.unmount());
    document.body.removeChild(container);
  });

  it('renders empty state when no persons', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root;

    await act(async () => {
      root = createRoot(container);
      root.render(
        <FilteredPersonsShow filteredPersons={[]} removePerson={() => { }} loading={false} />
      );
    });

    assert.ok(container.textContent.includes('No contacts found'));

    await act(() => root.unmount());
    document.body.removeChild(container);
  });

  it('renders loading state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root;

    await act(async () => {
      root = createRoot(container);
      root.render(
        <FilteredPersonsShow filteredPersons={[]} removePerson={() => { }} loading={true} />
      );
    });

    assert.ok(container.textContent.includes('Loading contacts'));

    await act(() => root.unmount());
    document.body.removeChild(container);
  });
});