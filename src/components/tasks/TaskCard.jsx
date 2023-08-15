"use client"

import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { TaskContext } from "../../context/TaskContext"
import { Clock, Calendar, MoreVertical, Edit, Trash2, CheckCircle, Circle, AlertCircle } from "react-feather"
import "./TaskCard.css"

const TaskCard = ({ task }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { updateTask, deleteTask } = useContext(TaskContext)

  const toggleMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const handleStatusToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const newStatus = task.status === "completed" ? "pending" : "completed"
    updateTask(task.id, { ...task, status: newStatus })
  }

  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Navigate to edit page or open edit modal
    setMenuOpen(false)
  }

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
    }

    setMenuOpen(false)
  }

  // Format due date
  const formatDueDate = () => {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dueDate.toDateString() === today.toDateString()) {
      return "Today"
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  // Check if task is overdue
  const isOverdue = () => {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    return dueDate < today && task.status !== "completed"
  }

  // Get priority icon
  const getPriorityIcon = () => {
    switch (task.priority) {
      case "high":
        return <AlertCircle className="priority-icon high" />
      case "medium":
        return <AlertCircle className="priority-icon medium" />
      case "low":
        return <AlertCircle className="priority-icon low" />
      default:
        return null
    }
  }

  return (
    <Link to={`/task/${task.id}`} className="task-card-link">
      <div className={`task-card ${task.status} ${isOverdue() ? "overdue" : ""}`}>
        <div className="task-header">
          <button
            className="status-toggle"
            onClick={handleStatusToggle}
            aria-label={`Mark as ${task.status === "completed" ? "incomplete" : "complete"}`}
          >
            {task.status === "completed" ? (
              <CheckCircle className="status-icon completed" />
            ) : (
              <Circle className="status-icon" />
            )}
          </button>

          <div className="task-priority">
            {getPriorityIcon()}
            <span className={`priority-label ${task.priority}`}>{task.priority}</span>
          </div>

          <div className="task-menu-container">
            <button className="task-menu-button" onClick={toggleMenu} aria-label="Task menu">
              <MoreVertical />
            </button>

            {menuOpen && (
              <div className="task-menu">
                <button className="menu-item" onClick={handleEdit}>
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button className="menu-item delete" onClick={handleDelete}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          <p className="task-description">{task.description}</p>
        </div>

        <div className="task-footer">
          <div className="due-date">
            <Calendar size={14} />
            <span className={isOverdue() ? "overdue" : ""}>{formatDueDate()}</span>
          </div>

          {task.estimatedTime && (
            <div className="estimated-time">
              <Clock size={14} />
              <span>{task.estimatedTime} min</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default TaskCard

