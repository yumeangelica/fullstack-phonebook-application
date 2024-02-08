const Filter = ({ handleFilterChange, newFilter }) => {
  return (
    <div className="filter-container">
      <div className="filter-content">
        <label htmlFor="filterInput" className="filter-label">Filter shown with</label>
        <input
          id="filterInput"
          type="text"
          className="filter-input"
          onChange={handleFilterChange}
          value={newFilter}
          placeholder="Enter name or number"
        />
      </div>
    </div>
  );
};

export default Filter;