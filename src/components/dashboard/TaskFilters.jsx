"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ArrowUp, ArrowDown, X, Sliders, Calendar, Flag } from "lucide-react"
import "./TaskFilters.css"

const TaskFilters = ({ filters, onFilterChange }) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)
  const filterRef = useRef(null)
  const searchInputRef = useRef(null)

  // Calculate active filters count
  useEffect(() => {
    let count = 0
    if (filters.status !== "all") count++
    if (filters.priority !== "all") count++
    if (filters.search) count++
    setActiveFilters(count)
  }, [filters])

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value })
  }

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value })
  }

  const handlePriorityChange = (e) => {
    onFilterChange({ priority: e.target.value })
  }

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value })
  }

  const toggleSortOrder = () => {
    onFilterChange({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })
  }

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen)
  }

  const clearFilters = () => {
    onFilterChange({
      status: "all",
      priority: "all",
      search: "",
      sortBy: "dueDate",
      sortOrder: "asc",
    })

    // Focus search input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  const clearSearch = () => {
    onFilterChange({ search: "" })
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  return (
    <div className="filters-container" ref={filterRef}>
      <div className={`search-container ${isSearchFocused ? "focused" : ""}`}>
        <Search className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="search-input"
        />
        {filters.search && (
          <button className="clear-search-button" onClick={clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-controls">
        <button
          className={`filter-button ${isFilterMenuOpen ? "active" : ""} ${activeFilters > 0 ? "has-filters" : ""}`}
          onClick={toggleFilterMenu}
        >
          <Sliders className="filter-icon" />
          <span>Filter</span>
          {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
        </button>

        <div className="sort-controls">
          <div className="sort-select-wrapper">
            <select value={filters.sortBy} onChange={handleSortChange} className="sort-select">
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          <button
            className="sort-order-button"
            onClick={toggleSortOrder}
            aria-label={filters.sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
          >
            {filters.sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />}
          </button>
        </div>
      </div>

      {isFilterMenuOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h3>Filter Tasks</h3>
            <button className="close-filter-button" onClick={toggleFilterMenu}>
              <X size={16} />
            </button>
          </div>

          <div className="filter-body">
            <div className="filter-group">
              <div className="filter-group-header">
                <Calendar size={16} />
                <label>Status</label>
              </div>
              <select value={filters.status} onChange={handleStatusChange} className="filter-select">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <div className="filter-group-header">
                <Flag size={16} />
                <label>Priority</label>
              </div>
              <select value={filters.priority} onChange={handlePriorityChange} className="filter-select">
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-tags">
              {filters.status !== "all" && (
                <div className="filter-tag">
                  <span>Status: {filters.status}</span>
                  <button onClick={() => onFilterChange({ status: "all" })}>
                    <X size={12} />
                  </button>
                </div>
              )}

              {filters.priority !== "all" && (
                <div className="filter-tag">
                  <span>Priority: {filters.priority}</span>
                  <button onClick={() => onFilterChange({ priority: "all" })}>
                    <X size={12} />
                  </button>
                </div>
              )}

              {filters.search && (
                <div className="filter-tag">
                  <span>Search: {filters.search}</span>
                  <button onClick={clearSearch}>
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="filter-footer">
            <button className="clear-filters-button" onClick={clearFilters}>
              <X size={14} />
              <span>Clear All Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskFilters

