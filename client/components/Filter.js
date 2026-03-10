const Filter = ({ handleFilterChange, newFilter }) => {
  const clearFilter = () => {
    handleFilterChange({ target: { value: '' } });
  };

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
          <small id="filter-help" style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-gray)' }}>
            {newFilter ? `Showing results for "${newFilter}"` : 'Type to search through your contacts'}
          </small>
        </div>
      </div>
    </div>
  );
};

export default Filter;