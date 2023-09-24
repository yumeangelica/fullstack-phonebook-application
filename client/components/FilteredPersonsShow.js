
// component that renders filtered persons
import { Button, Table } from 'react-bootstrap'

const FilteredPersonsShow = ({ filteredPersons, removePerson }) => {
  return (
    <>
      <h2>Numbers</h2>
      <Table hover>
        <thead>
          <tr>
            <th style={{ width: '40%', borderBottom: '0px'  }}>Name</th>
            <th style={{ width: '20%', borderBottom: '0px'  }}>Number</th>
            <th style={{ width: '10%', borderBottom: '0px'  }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredPersons.map(person =>
            <tr key={String(person.id)}>
              <td  className="tableTdBottomBorder">{person.name}</td>
              <td  className="tableTdBottomBorder">{person.number}</td>
              <td ><Button className="deletebtn" onClick={() => removePerson(person.id)}>delete</Button></td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  )
}

export default FilteredPersonsShow