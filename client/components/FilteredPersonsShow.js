import { Button, Table } from 'react-bootstrap'

const FilteredPersonsShow = ({ filteredPersons, removePerson }) => {
  return (
    <div className="table-container">
      <h2 className="table-title">Contacts</h2>
      <Table hover className="custom-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPersons.map(person => (
            <tr key={String(person.id)}>
              <td>{person.name}</td>
              <td>{person.number}</td>
              <td><Button className="deletebtn" onClick={() => removePerson(person.id)}>delete</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default FilteredPersonsShow