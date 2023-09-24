
// component for the filter input
const Filter = ({ handleFilterChange, newFilter }) => {
  return (
    <>
      <label className="filter-label">Filter shown with</label>
      <input className="filter-input" onChange={handleFilterChange} value={newFilter} />
    </>
  )
}

export default Filter