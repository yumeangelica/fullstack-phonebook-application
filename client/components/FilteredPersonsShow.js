const FilteredPersonsShow = ({ filteredPersons, removePerson, loading }) => {
  return (
    <div className="table-container">
      <h2 className="table-title">Contacts</h2>
      {loading ? (
        <p className="table-status-message">Loading contacts...</p>
      ) : filteredPersons.length === 0 ? (
        <p className="table-status-message">No contacts found.</p>
      ) : (
        <table className="custom-table">
          <caption className="sr-only">List of phonebook contacts</caption>
          <thead>
            <tr>
              <th>First name</th>
              <th>Last name</th>
              <th>Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPersons.map(person => (
              <tr key={person.id}>
                <td data-label="First name">{person.firstName}</td>
                <td data-label="Last name">{person.lastName}</td>
                <td data-label="Number">{person.number}</td>
                <td data-label="Action">
                  <button
                    className="actionbtn"
                    onClick={() => removePerson(person.id)}
                    aria-label={`Delete ${person.firstName} ${person.lastName}`}
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FilteredPersonsShow;