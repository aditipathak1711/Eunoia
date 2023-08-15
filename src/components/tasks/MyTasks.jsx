"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { TaskContext } from "../../context/TaskContext"
import {
  List,
  Grid,
  Calendar as CalendarIcon,
  Filter,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  ArrowUp,
  ArrowDown,
} from "react-feather"
import TaskCard from "./TaskCard"
import TaskForm from "./TaskForm"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import "./MyTasks.css"

const MyTasks = () => {
  const { tasks, updateTask, deleteTask } = useContext(TaskContext)
  const [view, setView] = useState("list") // list, board, calendar
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
    sortBy: "dueDate",
    sortOrder: "asc",
    tags: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [groupBy, setGroupBy] = useState("status") // status, priority, dueDate, none
  const [availableTags, setAvailableTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [columns, setColumns] = useState({})
  const [calendarDays, setCalendarDays] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [animation, setAnimation] = useState("")
  const containerRef = useRef(null)

  // Extract all unique tags from tasks
  useEffect(() => {
    const tags = new Set()
    tasks.forEach((task) => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach((tag) => tags.add(tag))
      }
    })
    setAvailableTags(Array.from(tags))
  }, [tasks])

  // Filter and sort tasks
  const getFilteredTasks = () => {
    return tasks
      .filter((task) => {
        // Filter by status
        if (filters.status !== "all" && task.status !== filters.status) {
          return false
        }

        // Filter by priority
        if (filters.priority !== "all" && task.priority !== filters.priority) {
          return false
        }

        // Filter by search term
        if (
          filters.search &&
          !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !task.description.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false
        }

        // Filter by selected tags
        if (selectedTags.length > 0) {
          if (!task.tags || task.tags.length === 0) {
            return false
          }

          const hasSelectedTag = selectedTags.some((tag) => task.tags.includes(tag))

          if (!hasSelectedTag) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        let comparison = 0

        if (filters.sortBy === "dueDate") {
          comparison = new Date(a.dueDate) - new Date(b.dueDate)
        } else if (filters.sortBy === "priority") {
          const priorityValues = { high: 3, medium: 2, low: 1 }
          comparison = priorityValues[b.priority] - priorityValues[a.priority]
        } else if (filters.sortBy === "title") {
          comparison = a.title.localeCompare(b.title)
        } else if (filters.sortBy === "createdAt") {
          comparison = new Date(b.createdAt) - new Date(a.createdAt)
        }

        return filters.sortOrder === "asc" ? comparison : -comparison
      })
  }

  const filteredTasks = getFilteredTasks()

  // Group tasks for board view
  useEffect(() => {
    if (view === "board") {
      const grouped = {}

      if (groupBy === "status") {
        grouped.pending = {
          id: "pending",
          title: "Pending",
          tasks: filteredTasks.filter((task) => task.status === "pending"),
        }

        grouped["in-progress"] = {
          id: "in-progress",
          title: "In Progress",
          tasks: filteredTasks.filter((task) => task.status === "in-progress"),
        }

        grouped.completed = {
          id: "completed",
          title: "Completed",
          tasks: filteredTasks.filter((task) => task.status === "completed"),
        }
      } else if (groupBy === "priority") {
        grouped.high = {
          id: "high",
          title: "High Priority",
          tasks: filteredTasks.filter((task) => task.priority === "high"),
        }

        grouped.medium = {
          id: "medium",
          title: "Medium Priority",
          tasks: filteredTasks.filter((task) => task.priority === "medium"),
        }

        grouped.low = {
          id: "low",
          title: "Low Priority",
          tasks: filteredTasks.filter((task) => task.priority === "low"),
        }
      } else if (groupBy === "dueDate") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)

        grouped.overdue = {
          id: "overdue",
          title: "Overdue",
          tasks: filteredTasks.filter((task) => {
            const dueDate = new Date(task.dueDate)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate < today && task.status !== "completed"
          }),
        }

        grouped.today = {
          id: "today",
          title: "Today",
          tasks: filteredTasks.filter((task) => {
            const dueDate = new Date(task.dueDate)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate.getTime() === today.getTime()
          }),
        }

        grouped.upcoming = {
          id: "upcoming",
          title: "Upcoming",
          tasks: filteredTasks.filter((task) => {
            const dueDate = new Date(task.dueDate)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate > today
          }),
        }
      } else {
        // No grouping
        grouped.all = {
          id: "all",
          title: "All Tasks",
          tasks: filteredTasks,
        }
      }

      setColumns(grouped)
    }
  }, [filteredTasks, groupBy, view])

  // Generate calendar days
  useEffect(() => {
    if (view === "calendar") {
      const generateCalendarDays = () => {
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
        const firstDayOfWeek = firstDayOfMonth.getDay()

        // Calculate days from previous month to show
        const daysFromPrevMonth = firstDayOfWeek

        // Calculate total days to show (previous month days + current month days)
        const totalDays = daysFromPrevMonth + lastDayOfMonth.getDate()

        // Calculate rows needed (7 days per row)
        const rows = Math.ceil(totalDays / 7)

        // Calculate total cells needed (rows * 7)
        const totalCells = rows * 7

        // Generate calendar days
        const days = []

        // Add days from previous month
        const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate()
        for (let i = 0; i < daysFromPrevMonth; i++) {
          const day = prevMonthLastDay - daysFromPrevMonth + i + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day)
          days.push({
            date,
            day,
            isCurrentMonth: false,
            isToday: false,
          })
        }

        // Add days from current month
        const today = new Date()
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
          days.push({
            date,
            day: i,
            isCurrentMonth: true,
            isToday:
              today.getDate() === i &&
              today.getMonth() === currentMonth.getMonth() &&
              today.getFullYear() === currentMonth.getFullYear(),
          })
        }

        // Add days from next month
        const remainingCells = totalCells - days.length
        for (let i = 1; i <= remainingCells; i++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i)
          days.push({
            date,
            day: i,
            isCurrentMonth: false,
            isToday: false,
          })
        }

        setCalendarDays(days)
      }

      generateCalendarDays()
    }
  }, [currentMonth, view])

  // Get tasks for a specific date (calendar view)
  const getTasksForDate = (date) => {
    return filteredTasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Handle drag and drop for board view
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) {
      return
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const sourceColumn = columns[source.droppableId]
    const destColumn = columns[destination.droppableId]

    if (sourceColumn === destColumn) {
      // Reordering within the same column
      const newTasks = Array.from(sourceColumn.tasks)
      const [movedTask] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, movedTask)

      const newColumn = {
        ...sourceColumn,
        tasks: newTasks,
      }

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      })
    } else {
      // Moving from one column to another
      const sourceTasks = Array.from(sourceColumn.tasks)
      const destTasks = Array.from(destColumn.tasks)
      const [movedTask] = sourceTasks.splice(source.index, 1)

      // Update task status if grouping by status
      if (groupBy === "status") {
        updateTask(movedTask.id, { ...movedTask, status: destination.droppableId })
      }

      // Update task priority if grouping by priority
      if (groupBy === "priority") {
        updateTask(movedTask.id, { ...movedTask, priority: destination.droppableId })
      }

      destTasks.splice(destination.index, 0, movedTask)

      const newSourceColumn = {
        ...sourceColumn,
        tasks: sourceTasks,
      }

      const newDestColumn = {
        ...destColumn,
        tasks: destTasks,
      }

      setColumns({
        ...columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestColumn.id]: newDestColumn,
      })
    }
  }

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen)
    setSelectedTask(null)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const toggleTagSelection = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      priority: "all",
      search: "",
      sortBy: "dueDate",
      sortOrder: "asc",
    })
    setSelectedTags([])
  }

  const toggleSortOrder = () => {
    setFilters({
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    })
  }

  const goToPreviousMonth = () => {
    setAnimation("slide-right")
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
      setAnimation("")
    }, 300)
  }

  const goToNextMonth = () => {
    setAnimation("slide-left")
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
      setAnimation("")
    }, 300)
  }

  const goToToday = () => {
    setAnimation("fade")
    setTimeout(() => {
      setCurrentMonth(new Date())
      setAnimation("")
    }, 300)
  }

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get month and year for calendar header
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const monthName = monthNames[currentMonth.getMonth()]
  const year = currentMonth.getFullYear()

  return (
    <div className="my-tasks-container" ref={containerRef}>
      <div className="my-tasks-header">
        <div className="header-title">
          <h1>My Tasks</h1>
          <p className="task-count">{filteredTasks.length} tasks</p>
        </div>

        <div className="view-controls">
          <div className="view-selector">
            <button
              className={`view-button ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              className={`view-button ${view === "board" ? "active" : ""}`}
              onClick={() => setView("board")}
              title="Board View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-button ${view === "calendar" ? "active" : ""}`}
              onClick={() => setView("calendar")}
              title="Calendar View"
            >
              <CalendarIcon size={18} />
            </button>
          </div>

          <button
            className={`filter-button ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span>Filter</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <button className="add-task-button" onClick={toggleForm}>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="search-input"
            />
            {filters.search && (
              <button className="clear-search" onClick={() => handleFilterChange("search", "")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)}>
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <div className="sort-controls">
                <select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)}>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                  <option value="createdAt">Created Date</option>
                </select>

                <button
                  className="sort-order-button"
                  onClick={toggleSortOrder}
                  aria-label={filters.sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
                >
                  {filters.sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>
            </div>

            {view === "board" && (
              <div className="filter-group">
                <label>Group By</label>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                  <option value="none">No Grouping</option>
                </select>
              </div>
            )}
          </div>

          {availableTags.length > 0 && (
            <div className="tags-filter">
              <label>Filter by Tags</label>
              <div className="tags-list">
                {availableTags.map((tag) => (
                  <div
                    key={tag}
                    className={`filter-tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTagSelection(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && <Check size={12} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="filter-actions">
            <button className="clear-filters-button" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="task-form-container">
          <TaskForm task={selectedTask} onClose={toggleForm} />
        </div>
      )}

      <div className="tasks-content">
        {view === "list" && (
          <div className="list-view">
            {filteredTasks.length > 0 ? (
              <div className="tasks-list">
                {filteredTasks.map((task, index) => (
                  <div key={task.id} className="task-item-wrapper" style={{ animationDelay: `${index * 0.05}s` }}>
                    <TaskCard task={task} onEdit={() => handleEditTask(task)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-illustration">
                  <List size={48} />
                </div>
                <h3>No tasks found</h3>
                <p>Try adjusting your filters or create a new task</p>
                <button className="create-task-button" onClick={toggleForm}>
                  <Plus size={16} />
                  Create Task
                </button>
              </div>
            )}
          </div>
        )}

        {view === "board" && (
          <div className="board-view">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="board-columns">
                {Object.values(columns).map((column) => (
                  <div key={column.id} className="board-column">
                    <div className={`column-header ${column.id}`}>
                      <h3>{column.title}</h3>
                      <span className="column-count">{column.tasks.length}</span>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          className={`column-tasks ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {column.tasks.length > 0 ? (
                            column.tasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`board-task ${snapshot.isDragging ? "dragging" : ""}`}
                                    style={{
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <TaskCard task={task} onEdit={() => handleEditTask(task)} compact={true} />
                                  </div>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <div className="empty-column">
                              <p>No tasks</p>
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <button className="add-column-task" onClick={toggleForm}>
                      <Plus size={14} />
                      <span>Add Task</span>
                    </button>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        )}

        {view === "calendar" && (
          <div className="calendar-view">
            <div className="calendar-header">
              <div className="month-navigation">
                <button className="nav-button" onClick={goToPreviousMonth}>
                  <ChevronDown className="rotate-90" />
                </button>
                <h2 className="current-month">
                  {monthName} {year}
                </h2>
                <button className="nav-button" onClick={goToNextMonth}>
                  <ChevronDown className="rotate-270" />
                </button>
              </div>

              <button className="today-button" onClick={goToToday}>
                Today
              </button>
            </div>

            <div className={`calendar-grid ${animation}`}>
              <div className="weekdays">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
              </div>

              <div className="days">
                {calendarDays.map((day, index) => {
                  const dayTasks = getTasksForDate(day.date)
                  const hasHighPriority = dayTasks.some((task) => task.priority === "high")
                  const hasOverdue = dayTasks.some((task) => {
                    const dueDate = new Date(task.dueDate)
                    const today = new Date()
                    return dueDate < today && task.status !== "completed"
                  })

                  return (
                    <div
                      key={index}
                      className={`day ${!day.isCurrentMonth ? "other-month" : ""} ${day.isToday ? "today" : ""}`}
                    >
                      <div className="day-header">
                        <span className="day-number">{day.day}</span>
                        {dayTasks.length > 0 && (
                          <span
                            className={`task-indicator ${hasHighPriority ? "high-priority" : ""} ${hasOverdue ? "overdue" : ""}`}
                          >
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      <div className="day-tasks">
                        {dayTasks.slice(0, 3).map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className={`day-task ${task.priority} ${task.status === "completed" ? "completed" : ""}`}
                            onClick={() => handleEditTask(task)}
                          >
                            <div className="task-dot"></div>
                            <span className="task-title">{task.title}</span>
                          </div>
                        ))}

                        {dayTasks.length > 3 && <div className="more-tasks">+{dayTasks.length - 3} more</div>}
                      </div>

                      {day.isCurrentMonth && (
                        <button className="add-task-day" onClick={toggleForm}>
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTasks

