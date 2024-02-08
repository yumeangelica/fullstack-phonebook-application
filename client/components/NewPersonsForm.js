import { Form, Button } from 'react-bootstrap';

const NewPersonForm = ({ newFirstName, newLastName, newNumber, addName, handleFirstNameChange, handleLastNameChange, handleNumberChange }) => {
  return (
    <div className="form-container">
      <div className="form-content">
        <h2 className="form-title">Add a new contact</h2>
        <Form onSubmit={addName} className="new-person-form">
          <Form.Group>

            <Form.Label className="form-label">First Name:</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={newFirstName}
              onChange={handleFirstNameChange}
              className="form-input"
            />

            <Form.Label className="form-label">Last Name:</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={newLastName}
              onChange={handleLastNameChange}
              className="form-input"
            />

            <Form.Label className="form-label">Number:</Form.Label>
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
  );
};

export default NewPersonForm;
