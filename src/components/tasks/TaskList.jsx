import TaskCard from "./TaskCard"
import "./TaskList.css"

const TaskList = ({ title, tasks, emptyMessage }) => {
  return (
    <div className="task-list">
      <h2 className="task-list-title">
        {title} <span className="task-count">{tasks.length}</span>
      </h2>

      {tasks.length === 0 ? (
        <div className="empty-task-list">
          <div className="empty-illustration">
            <div className="empty-circle"></div>
            <div className="empty-line"></div>
            <div className="empty-line short"></div>
          </div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList

