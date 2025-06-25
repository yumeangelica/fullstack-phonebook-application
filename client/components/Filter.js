import React from 'react';
import { Form } from 'react-bootstrap';

const Filter = ({ handleFilterChange, newFilter }) => {
  const clearFilter = () => {
    handleFilterChange({ target: { value: '' } });
  };

  return (
    <div className="filter-container">
      <div className="filter-content">
        <Form.Group>
          <Form.Label className="filter-label">Filter shown with</Form.Label>
          <div className="filter-input-wrapper">
            <Form.Control
              id="filterInput"
              type="text"
              className="filter-input"
              onChange={handleFilterChange}
              value={newFilter}
              placeholder="Enter name or number"
            />
            {newFilter && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={clearFilter}
                aria-label="Clear filter"
              >
                ×
              </button>
            )}
          </div>
        </Form.Group>
      </div>
    </div>
  );
};

export default Filter;