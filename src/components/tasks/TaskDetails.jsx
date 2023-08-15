"use client"

import { useContext, useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { TaskContext } from "../../context/TaskContext"
import {
  Calendar,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Circle,
  AlertCircle,
  Tag,
  ChevronRight,
  MoreHorizontal,
  Share2,
  MessageSquare,
  Paperclip,
  Flag,
  Copy,
  Archive,
  Users,
  Link,
} from "react-feather"
import TaskForm from "./TaskForm"
import "./TaskDetails.css"

const TaskDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tasks, getTask, updateTask, deleteTask } = useContext(TaskContext)
  const [task, setTask] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showActions, setShowActions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [newSubtask, setNewSubtask] = useState("")
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [showAttachments, setShowAttachments] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [activityLog, setActivityLog] = useState([])
  const detailsRef = useRef(null)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await getTask(id)
        setTask(taskData)

        // Generate sample comments if none exist
        if (!taskData.comments) {
          const sampleComments = [
            {
              id: "1",
              user: "John Doe",
              avatar: "JD",
              text: "I think we should prioritize this task for the next sprint.",
              timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            },
            {
              id: "2",
              user: "Sarah Smith",
              avatar: "SS",
              text: "I've started working on this. Will update the progress soon.",
              timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            },
          ]
          setComments(sampleComments)
        } else {
          setComments(taskData.comments)
        }

        // Generate sample activity log
        const sampleActivity = [
          {
            id: "1",
            type: "created",
            user: "You",
            timestamp: taskData.createdAt,
          },
          {
            id: "2",
            type: "updated",
            field: "priority",
            oldValue: "medium",
            newValue: taskData.priority,
            user: "You",
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          },
          {
            id: "3",
            type: "added_subtask",
            subtask: "Research competitors",
            user: "You",
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          },
        ]
        setActivityLog(sampleActivity)

        // Calculate completion percentage
        calculateCompletionPercentage(taskData)
      } catch (error) {
        console.error("Error fetching task:", error)
        // Handle task not found
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id, getTask, tasks])

  const calculateCompletionPercentage = (taskData) => {
    if (!taskData.subtasks || taskData.subtasks.length === 0) {
      setCompletionPercentage(taskData.status === "completed" ? 100 : 0)
      return
    }

    const completedSubtasks = taskData.subtasks.filter((subtask) => subtask.completed).length
    const percentage = Math.round((completedSubtasks / taskData.subtasks.length) * 100)
    setCompletionPercentage(percentage)
  }

  const handleStatusToggle = () => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    updateTask(task.id, { ...task, status: newStatus })
    setTask({ ...task, status: newStatus })

    // Update completion percentage
    if (newStatus === "completed") {
      setCompletionPercentage(100)
    } else if (!task.subtasks || task.subtasks.length === 0) {
      setCompletionPercentage(0)
    }
  }

  const handleSubtaskToggle = (subtaskId) => {
    const updatedSubtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    )

    const updatedTask = { ...task, subtasks: updatedSubtasks }
    updateTask(task.id, updatedTask)
    setTask(updatedTask)

    // Update completion percentage
    calculateCompletionPercentage(updatedTask)
  }

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (newSubtask.trim() === "") return

    const newSubtaskItem = {
      id: Date.now().toString(),
      title: newSubtask.trim(),
      completed: false,
    }

    const updatedSubtasks = [...(task.subtasks || []), newSubtaskItem]
    const updatedTask = { ...task, subtasks: updatedSubtasks }

    updateTask(task.id, updatedTask)
    setTask(updatedTask)
    setNewSubtask("")

    // Update completion percentage
    calculateCompletionPercentage(updatedTask)

    // Add to activity log
    const newActivity = {
      id: Date.now().toString(),
      type: "added_subtask",
      subtask: newSubtask.trim(),
      user: "You",
      timestamp: new Date().toISOString(),
    }
    setActivityLog([newActivity, ...activityLog])
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id)
      navigate("/dashboard")
    }
  }

  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (comment.trim() === "") return

    const newComment = {
      id: Date.now().toString(),
      user: "You",
      avatar: "Y",
      text: comment,
      timestamp: new Date().toISOString(),
    }

    setComments([...comments, newComment])
    setComment("")

    // Add to activity log
    const newActivity = {
      id: Date.now().toString(),
      type: "commented",
      user: "You",
      timestamp: new Date().toISOString(),
    }
    setActivityLog([newActivity, ...activityLog])
  }

  // Format due date
  const formatDueDate = (dateString) => {
    const dueDate = new Date(dateString)
    return dueDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  // Check if task is overdue
  const isOverdue = (dateString) => {
    const dueDate = new Date(dateString)
    const today = new Date()
    return dueDate < today && task.status !== "completed"
  }

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
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

  if (loading) {
    return (
      <div className="task-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="task-not-found">
        <h2>Task Not Found</h2>
        <p>The task you're looking for doesn't exist or has been deleted.</p>
        <button onClick={handleBack} className="back-button">
          <ArrowLeft />
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="task-details-container editing">
        <TaskForm task={task} onClose={toggleEditMode} />
      </div>
    )
  }

  return (
    <div className="task-details-container" ref={detailsRef}>
      <div className="task-details-header">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft />
          <span>Back</span>
        </button>

        <div className="task-actions">
          <button onClick={() => setShowActions(!showActions)} className="more-actions-button">
            <MoreHorizontal />
          </button>

          {showActions && (
            <div className="actions-dropdown">
              <button onClick={toggleEditMode} className="action-item">
                <Edit size={16} />
                <span>Edit Task</span>
              </button>
              <button onClick={handleDelete} className="action-item delete">
                <Trash2 size={16} />
                <span>Delete Task</span>
              </button>
              <div className="action-divider"></div>
              <button className="action-item">
                <Share2 size={16} />
                <span>Share Task</span>
              </button>
              <button className="action-item">
                <Copy size={16} />
                <span>Duplicate Task</span>
              </button>
              <button className="action-item">
                <Archive size={16} />
                <span>Archive Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="task-details-content">
        <div className="task-main-content">
          <div className="task-header-section">
            <div className="task-status-badge" data-status={task.status}>
              {task.status === "completed" ? (
                <CheckCircle size={14} />
              ) : task.status === "in-progress" ? (
                <Clock size={14} />
              ) : (
                <Circle size={14} />
              )}
              <span>{task.status.replace("-", " ")}</span>
            </div>

            <div className="task-priority-badge" data-priority={task.priority}>
              <Flag size={14} />
              <span>{task.priority} priority</span>
            </div>

            {task.color && <div className="task-color-indicator" style={{ backgroundColor: task.color }}></div>}
          </div>

          <h1 className="task-title-large">{task.title}</h1>

          <div className="task-progress-section">
            <div className="progress-info">
              <span className="progress-percentage">{completionPercentage}% Complete</span>
              <button className="status-toggle-button" onClick={handleStatusToggle}>
                {task.status === "completed" ? (
                  <>
                    <CheckCircle size={16} className="completed" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle size={16} />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>
            </div>

            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${completionPercentage}%` }}
                data-status={task.status}
              ></div>
            </div>
          </div>

          <div className="task-metadata">
            <div className="metadata-item">
              <Calendar size={16} />
              <span className={isOverdue(task.dueDate) ? "overdue" : ""}>
                Due {formatDueDate(task.dueDate)}
                {isOverdue(task.dueDate) && " (Overdue)"}
              </span>
            </div>

            {task.estimatedTime && (
              <div className="metadata-item">
                <Clock size={16} />
                <span>Estimated: {task.estimatedTime} minutes</span>
              </div>
            )}

            {task.assignee && (
              <div className="metadata-item">
                <Users size={16} />
                <span>Assigned to: {task.assignee}</span>
              </div>
            )}
          </div>

          {task.description && (
            <div className="task-description-section">
              <h3>Description</h3>
              <div className="task-description-large">{task.description}</div>
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="task-subtasks-section">
              <div className="section-header" onClick={() => setShowSubtasks(!showSubtasks)}>
                <h3>
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                </h3>
                <ChevronRight className={`toggle-icon ${showSubtasks ? "open" : ""}`} />
              </div>

              {showSubtasks && (
                <div className="subtasks-list">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="subtask-item">
                      <div className="subtask-checkbox">
                        <input
                          type="checkbox"
                          id={`subtask-${subtask.id}`}
                          checked={subtask.completed}
                          onChange={() => handleSubtaskToggle(subtask.id)}
                        />
                        <label htmlFor={`subtask-${subtask.id}`} className="checkbox-label">
                          <span className="checkbox-custom"></span>
                        </label>
                      </div>
                      <span className={`subtask-title ${subtask.completed ? "completed" : ""}`}>{subtask.title}</span>
                    </div>
                  ))}

                  <form className="add-subtask-form" onSubmit={handleAddSubtask}>
                    <input
                      type="text"
                      placeholder="Add a subtask..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                    />
                    <button type="submit">Add</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="task-tags-section">
              <h3>Tags</h3>
              <div className="tags-container">
                {task.tags.map((tag, index) => (
                  <div key={index} className="tag">
                    <Tag size={14} />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="task-attachments-section">
              <div className="section-header" onClick={() => setShowAttachments(!showAttachments)}>
                <h3>Attachments ({task.attachments.length})</h3>
                <ChevronRight className={`toggle-icon ${showAttachments ? "open" : ""}`} />
              </div>

              {showAttachments && (
                <div className="attachments-list">
                  {task.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <Paperclip size={16} />
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        {attachment.name}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="task-comments-section">
            <div className="section-header" onClick={() => setShowComments(!showComments)}>
              <h3>Comments ({comments.length})</h3>
              <ChevronRight className={`toggle-icon ${showComments ? "open" : ""}`} />
            </div>

            {showComments && (
              <div className="comments-container">
                <form className="comment-form" onSubmit={handleAddComment}>
                  <div className="comment-avatar">Y</div>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button type="submit">Post</button>
                </form>

                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">{comment.avatar}</div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user}</span>
                          <span className="comment-time">{formatTimeAgo(comment.timestamp)}</span>
                        </div>
                        <div className="comment-text">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="task-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="quick-action-button edit" onClick={toggleEditMode}>
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button className="quick-action-button delete" onClick={handleDelete}>
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
              <button className="quick-action-button">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="section-header" onClick={() => setShowActivity(!showActivity)}>
              <h3>Activity</h3>
              <ChevronRight className={`toggle-icon ${showActivity ? "open" : ""}`} />
            </div>

            {showActivity && (
              <div className="activity-timeline">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === "created" && <Plus size={14} />}
                      {activity.type === "updated" && <Edit size={14} />}
                      {activity.type === "commented" && <MessageSquare size={14} />}
                      {activity.type === "added_subtask" && <CheckCircle size={14} />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <span className="activity-user">{activity.user}</span>
                        {activity.type === "created" && " created this task"}
                        {activity.type === "updated" &&
                          ` changed ${activity.field} from ${activity.oldValue} to ${activity.newValue}`}
                        {activity.type === "commented" && " commented on this task"}
                        {activity.type === "added_subtask" && ` added subtask "${activity.subtask}"`}
                      </div>
                      <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Share Task</h3>
            <div className="share-link">
              <input type="text" value={`https://taskmaster.app/task/${task.id}`} readOnly />
              <button className="copy-link-button">
                <Link size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetails

// Helper component for the Plus icon
const Plus = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

