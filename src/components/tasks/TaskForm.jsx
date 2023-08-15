"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { TaskContext } from "../../context/TaskContext"
import {
  X,
  Plus,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  AlignLeft,
  List,
  Paperclip,
} from "react-feather"
import "./TaskForm.css"

const TaskForm = ({ task, onClose, initialDueDate }) => {
  const isEditing = !!task
  const { addTask, updateTask } = useContext(TaskContext)
  const formRef = useRef(null)
  const [activeStep, setActiveStep] = useState(1)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    dueDate: initialDueDate || (task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""),
    dueTime: task?.dueTime || "",
    priority: task?.priority || "medium",
    status: task?.status || "pending",
    estimatedTime: task?.estimatedTime || "",
    tags: task?.tags || [],
    subtasks: task?.subtasks || [],
    attachments: task?.attachments || [],
    reminders: task?.reminders || [],
    notes: task?.notes || "",
    color: task?.color || "#6366f1", // Default to primary color
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newAttachment, setNewAttachment] = useState({ name: "", url: "" })
  const [newReminder, setNewReminder] = useState({ date: "", time: "" })
  const [formHeight, setFormHeight] = useState("auto")

  // Animation refs
  const titleInputRef = useRef(null)

  useEffect(() => {
    // Focus the title input when the form opens
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Adjust form height based on content
    if (formRef.current) {
      setFormHeight(formRef.current.scrollHeight)
    }
  }, [formData, showSubtasks, showAdvanced, activeStep])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleTagInput = (e) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      e.preventDefault()
      if (!formData.tags.includes(newTag.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag.trim()],
        })
      }
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (newSubtask.trim() !== "") {
      const subtask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
      }
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, subtask],
      })
      setNewSubtask("")
    }
  }

  const handleSubtaskChange = (id, completed) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map((subtask) => (subtask.id === id ? { ...subtask, completed } : subtask)),
    })
  }

  const handleSubtaskEdit = (id, title) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map((subtask) => (subtask.id === id ? { ...subtask, title } : subtask)),
    })
  }

  const handleSubtaskDelete = (id) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((subtask) => subtask.id !== id),
    })
  }

  const handleAddAttachment = (e) => {
    e.preventDefault()
    if (newAttachment.name.trim() !== "" && newAttachment.url.trim() !== "") {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, { ...newAttachment, id: Date.now().toString() }],
      })
      setNewAttachment({ name: "", url: "" })
    }
  }

  const handleRemoveAttachment = (id) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((attachment) => attachment.id !== id),
    })
  }

  const handleAddReminder = (e) => {
    e.preventDefault()
    if (newReminder.date.trim() !== "") {
      setFormData({
        ...formData,
        reminders: [...formData.reminders, { ...newReminder, id: Date.now().toString() }],
      })
      setNewReminder({ date: "", time: "" })
    }
  }

  const handleRemoveReminder = (id) => {
    setFormData({
      ...formData,
      reminders: formData.reminders.filter((reminder) => reminder.id !== id),
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.dueDate) newErrors.dueDate = "Due date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    const taskData = {
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
    }

    // Add animation effect
    setTimeout(() => {
      if (isEditing) {
        updateTask(task.id, taskData)
      } else {
        addTask(taskData)
      }

      setIsSubmitting(false)
      onClose()
    }, 500)
  }

  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1)
    }
  }

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        <div className="steps">
          <div
            className={`step ${activeStep >= 1 ? "active" : ""} ${activeStep > 1 ? "completed" : ""}`}
            onClick={() => setActiveStep(1)}
          >
            <div className="step-number">{activeStep > 1 ? <Check size={14} /> : 1}</div>
            <span className="step-label">Basic Info</span>
          </div>
          <div className="step-connector"></div>
          <div
            className={`step ${activeStep >= 2 ? "active" : ""} ${activeStep > 2 ? "completed" : ""}`}
            onClick={() => setActiveStep(2)}
          >
            <div className="step-number">{activeStep > 2 ? <Check size={14} /> : 2}</div>
            <span className="step-label">Details</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${activeStep >= 3 ? "active" : ""}`} onClick={() => setActiveStep(3)}>
            <div className="step-number">3</div>
            <span className="step-label">Subtasks</span>
          </div>
        </div>
      </div>
    )
  }

  const renderBasicInfo = () => {
    return (
      <div className="form-step">
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <div className="input-container">
            <input
              type="text"
              id="title"
              name="title"
              ref={titleInputRef}
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <div className="rich-textarea-container">
            <div className="rich-textarea-toolbar">
              <button type="button" className="toolbar-button" title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" className="toolbar-button" title="Italic">
                <em>I</em>
              </button>
              <button type="button" className="toolbar-button" title="Underline">
                <u>U</u>
              </button>
              <button type="button" className="toolbar-button" title="List">
                <List size={14} />
              </button>
              <button type="button" className="toolbar-button" title="Align">
                <AlignLeft size={14} />
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this task..."
              rows="4"
            ></textarea>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <div className="input-container icon-input">
              <Calendar size={16} className="input-icon" />
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? "error" : ""}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueTime">Due Time</label>
            <div className="input-container icon-input">
              <Clock size={16} className="input-icon" />
              <input type="time" id="dueTime" name="dueTime" value={formData.dueTime} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <div className="priority-selector">
              <div
                className={`priority-option low ${formData.priority === "low" ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, priority: "low" })}
              >
                <div className="priority-dot"></div>
                <span>Low</span>
              </div>
              <div
                className={`priority-option medium ${formData.priority === "medium" ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, priority: "medium" })}
              >
                <div className="priority-dot"></div>
                <span>Medium</span>
              </div>
              <div
                className={`priority-option high ${formData.priority === "high" ? "selected" : ""}`}
                onClick={() => setFormData({ ...formData, priority: "high" })}
              >
                <div className="priority-dot"></div>
                <span>High</span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDetails = () => {
    return (
      <div className="form-step">
        <div className="form-group">
          <label htmlFor="estimatedTime">Estimated Time (minutes)</label>
          <div className="input-container icon-input">
            <Clock size={16} className="input-icon" />
            <input
              type="number"
              id="estimatedTime"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              placeholder="30"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="tags-input-container">
            <div className="tags-container">
              {formData.tags.map((tag, index) => (
                <div key={index} className="tag">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="tag-input-wrapper">
              <Tag size={16} className="input-icon" />
              <input
                type="text"
                id="tags"
                placeholder="Add tags and press Enter"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagInput}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Task Color</label>
          <div className="color-picker">
            {["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"].map((color) => (
              <div
                key={color}
                className={`color-option ${formData.color === color ? "selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color: color })}
              >
                {formData.color === color && <Check size={14} color="white" />}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <button type="button" className="toggle-button" onClick={() => setShowAdvanced(!showAdvanced)}>
            <span>Advanced Options</span>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-options">
            <div className="form-group">
              <label>Attachments</label>
              <div className="attachments-container">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <Paperclip size={14} />
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      {attachment.name}
                    </a>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="add-attachment">
                  <input
                    type="text"
                    placeholder="Attachment name"
                    value={newAttachment.name}
                    onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={newAttachment.url}
                    onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                  />
                  <button type="button" onClick={handleAddAttachment}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Reminders</label>
              <div className="reminders-container">
                {formData.reminders.map((reminder, index) => (
                  <div key={index} className="reminder-item">
                    <Calendar size={14} />
                    <span>
                      {reminder.date} {reminder.time}
                    </span>
                    <button type="button" className="remove-button" onClick={() => handleRemoveReminder(reminder.id)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="add-reminder">
                  <input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  />
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  />
                  <button type="button" onClick={handleAddReminder}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes..."
                rows="3"
              ></textarea>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSubtasks = () => {
    return (
      <div className="form-step">
        <div className="form-group">
          <div className="subtasks-header">
            <label>Subtasks</label>
            <span className="subtask-count">{formData.subtasks.length} subtasks</span>
          </div>
          <div className="subtasks-container">
            <div className="add-subtask">
              <input
                type="text"
                placeholder="Add a subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubtask(e)}
              />
              <button type="button" onClick={handleAddSubtask}>
                <Plus size={16} />
              </button>
            </div>

            {formData.subtasks.length > 0 ? (
              <div className="subtasks-list">
                {formData.subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="subtask-item">
                    <div className="subtask-checkbox">
                      <input
                        type="checkbox"
                        id={`subtask-${subtask.id}`}
                        checked={subtask.completed}
                        onChange={(e) => handleSubtaskChange(subtask.id, e.target.checked)}
                      />
                      <label htmlFor={`subtask-${subtask.id}`} className="checkbox-label">
                        <span className="checkbox-custom"></span>
                      </label>
                    </div>
                    <div className="subtask-content">
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => handleSubtaskEdit(subtask.id, e.target.value)}
                        className={subtask.completed ? "completed" : ""}
                      />
                    </div>
                    <div className="subtask-actions">
                      <button type="button" className="subtask-action" onClick={() => handleSubtaskDelete(subtask.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-subtasks">
                <div className="empty-illustration">
                  <List size={32} />
                </div>
                <p>No subtasks yet. Add some to break down your task.</p>
              </div>
            )}
          </div>
        </div>

        <div className="subtask-tips">
          <AlertCircle size={16} />
          <p>Tip: Breaking tasks into smaller subtasks can make them more manageable.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="task-form" ref={formRef} style={{ height: formHeight }}>
      <div className="form-header">
        <h2>{isEditing ? "Edit Task" : "Create New Task"}</h2>
        <button className="close-button" onClick={onClose} aria-label="Close form">
          <X />
        </button>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          {activeStep === 1 && renderBasicInfo()}
          {activeStep === 2 && renderDetails()}
          {activeStep === 3 && renderSubtasks()}
        </div>

        <div className="form-actions">
          {activeStep > 1 && (
            <button type="button" className="back-button" onClick={prevStep}>
              Back
            </button>
          )}

          {activeStep < 3 ? (
            <button type="button" className="next-button" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading-dots">
                  {isEditing ? "Updating" : "Creating"}
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              ) : isEditing ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default TaskForm

