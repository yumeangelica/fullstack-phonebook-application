
import { Form, Button } from 'react-bootstrap'

// component for adding new person to database
const NewPersonForm = ({ newName, newNumber, addName, handleNameChange, handleNumberChange }) => {
  return (
    <>
      <h2>Add a new</h2>
      <Form onSubmit={addName}>
        <Form.Group>

          <Form.Label>
            name:
          </Form.Label>

          <Form.Control
            type="text"
            name="name"
            value={newName}
            onChange={handleNameChange}
            className="input-width"
          />

          <Form.Label>
            number:
          </Form.Label>

          <Form.Control
            type="text"
            name="number"
            value={newNumber}
            onChange={handleNumberChange}
            className="input-width"
          />

          <Button variant="primary" type="submit" className="submit-btn">add</Button>

        </Form.Group>
      </Form>
    </>
  )
}


export default NewPersonForm