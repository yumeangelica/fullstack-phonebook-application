import React from 'react';
import { Form } from 'react-bootstrap';

const Filter = ({ handleFilterChange, newFilter }) => {
  const clearFilter = () => {
    handleFilterChange({ target: { value: '' } });
  };

  return (
    <div className="filter-container">
      <div className="filter-content">
        <Form.Group controlId="filterInput">
          <Form.Label className="filter-label">
            Filter contacts
          </Form.Label>
          <div className="filter-input-wrapper">
            <Form.Control
              type="text"
              className="filter-input"
              onChange={handleFilterChange}
              value={newFilter}
              placeholder="Search by name or phone number..."
              aria-describedby="filter-help"
            />
            {newFilter && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={clearFilter}
                aria-label="Clear search filter"
                title="Clear filter"
              >
                ×
              </button>
            )}
          </div>
          <Form.Text id="filter-help" className="text-muted" style={{ fontSize: '13px', marginTop: '8px' }}>
            {newFilter ? `Showing results for "${newFilter}"` : 'Type to search through your contacts'}
          </Form.Text>
        </Form.Group>
      </div>
    </div>
  );
};

export default Filter;