import { Form, Button } from 'react-bootstrap'

const NewPersonForm = ({ newName, newNumber, addName, handleNameChange, handleNumberChange }) => {
  return (
    <div className="form-container">
      <div className="form-content">
        <h2 className="form-title">Add a new contact</h2>
        <Form onSubmit={addName} className="new-person-form">
          <Form.Group>

            <Form.Label className="form-label">
              Name:
            </Form.Label>

            <Form.Control
              type="text"
              name="name"
              value={newName}
              onChange={handleNameChange}
              className="form-input"
            />

            <Form.Label className="form-label">
              Number:
            </Form.Label>

            <Form.Control
              type="text"
              name="number"
              value={newNumber}
              onChange={handleNumberChange}
              className="form-input"
            />

            <Button variant="primary" type="submit" className="submit-btn">Add</Button>

          </Form.Group>
        </Form>
      </div>
    </div>
  )
}

export default NewPersonForm