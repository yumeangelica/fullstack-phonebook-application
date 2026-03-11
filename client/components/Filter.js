const Filter = ({ newFilter, onFilterChange }) => {
  return (
    <div className="filter-container">
      <div className="filter-content">
        <div>
          <label htmlFor="filterInput" className="filter-label">
            Filter contacts
          </label>
          <div className="filter-input-wrapper">
            <input
              id="filterInput"
              type="text"
              className="filter-input"
              onChange={(e) => onFilterChange(e.target.value)}
              value={newFilter}
              placeholder="Search by name or phone number..."
              aria-describedby="filter-help"
            />
            {newFilter && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => onFilterChange('')}
                aria-label="Clear search filter"
                title="Clear filter"
              >
                ×
              </button>
            )}
          </div>
          <small id="filter-help" className="filter-help-text">
            {newFilter ? `Showing results for "${newFilter}"` : 'Type to search through your contacts'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default Filter;