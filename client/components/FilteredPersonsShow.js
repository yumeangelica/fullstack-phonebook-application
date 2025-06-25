import React from 'react'
import { Button, Table } from 'react-bootstrap'

const FilteredPersonsShow = ({ filteredPersons, removePerson }) => {
  return (
    <div className="table-container">
      <h2 className="table-title">Contacts</h2>
      <Table hover className="custom-table">
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
            <tr key={String(person.id)}>
              <td data-label="First name">{person.firstName}</td>
              <td data-label="Last name">{person.lastName}</td>
              <td data-label="Number">{person.number}</td>
              <td data-label="Action"><Button className="actionbtn" onClick={() => removePerson(person.id)}>delete</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default FilteredPersonsShow