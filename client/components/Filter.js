const Filter = ({ handleFilterChange, newFilter }) => {
  return (
    <div className="filter-container">
      <div className="filter-content">
        <label className="filter-label">Filter shown with</label>
        <input className="filter-input" onChange={handleFilterChange} value={newFilter} />
      </div>
    </div>
  )
}

export default Filter