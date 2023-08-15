"use client"

import { Clock, AlertTriangle, BarChart2, Award, TrendingUp } from "lucide-react"
import { useEffect, useRef } from "react"
import "./TaskStats.css"

const TaskStats = ({ stats }) => {
  const { total, completed, inProgress, pending, highPriority, dueSoon } = stats
  const chartRefs = useRef([])

  // Calculate completion percentage
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  // Animation for status bars
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".status-bar, .circle")
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  // Animate numbers
  useEffect(() => {
    chartRefs.current.forEach((el) => {
      if (!el) return

      const targetValue = Number.parseInt(el.getAttribute("data-value"))
      const duration = 1500
      const startTime = Date.now()
      const startValue = 0

      const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime

        if (elapsed < duration) {
          const value = Math.round(easeOutQuart(elapsed, startValue, targetValue, duration))
          el.textContent = value
          requestAnimationFrame(animate)
        } else {
          el.textContent = targetValue
        }
      }

      animate()
    })
  }, [completionPercentage, stats])

  // Easing function for smooth animation
  const easeOutQuart = (t, b, c, d) => {
    t /= d
    t--
    return -c * (t * t * t * t - 1) + b
  }

  return (
    <div className="stats-container">
      <div className="stats-card completion">
        <div className="stats-icon">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${completionPercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text
                x="18"
                y="20.35"
                className="percentage"
                ref={(el) => (chartRefs.current[0] = el)}
                data-value={completionPercentage}
              >
                0%
              </text>
            </svg>
          </div>
        </div>
        <div className="stats-info">
          <h3>Task Completion</h3>
          <p>
            <span className="highlight-text" ref={(el) => (chartRefs.current[1] = el)} data-value={completed}>
              0
            </span>{" "}
            of <span className="highlight-text">{total}</span> tasks completed
          </p>
          <div className="completion-badges">
            {completionPercentage >= 75 && (
              <div className="badge excellent">
                <Award size={14} />
                <span>Excellent</span>
              </div>
            )}
            {completionPercentage >= 50 && completionPercentage < 75 && (
              <div className="badge good">
                <TrendingUp size={14} />
                <span>Good Progress</span>
              </div>
            )}
            {completionPercentage < 50 && (
              <div className="badge needs-work">
                <AlertTriangle size={14} />
                <span>Needs Work</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-card status">
        <div className="stats-icon">
          <BarChart2 />
        </div>
        <div className="stats-info">
          <h3>Task Status</h3>
          <div className="status-bars">
            <div className="status-item">
              <div className="status-label">
                <span className="status-dot completed"></span>
                <span>Completed</span>
              </div>
              <div className="status-bar-container">
                <div
                  className="status-bar completed"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="status-count" ref={(el) => (chartRefs.current[2] = el)} data-value={completed}>
                0
              </span>
            </div>

            <div className="status-item">
              <div className="status-label">
                <span className="status-dot in-progress"></span>
                <span>In Progress</span>
              </div>
              <div className="status-bar-container">
                <div
                  className="status-bar in-progress"
                  style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="status-count" ref={(el) => (chartRefs.current[3] = el)} data-value={inProgress}>
                0
              </span>
            </div>

            <div className="status-item">
              <div className="status-label">
                <span className="status-dot pending"></span>
                <span>Pending</span>
              </div>
              <div className="status-bar-container">
                <div
                  className="status-bar pending"
                  style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="status-count" ref={(el) => (chartRefs.current[4] = el)} data-value={pending}>
                0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-card mini">
        <div className="stats-icon high-priority">
          <AlertTriangle />
          <div className="pulse-ring"></div>
        </div>
        <div className="stats-info">
          <p>High Priority</p>
          <h3 className="counter" ref={(el) => (chartRefs.current[5] = el)} data-value={highPriority}>
            0
          </h3>
          <div className="mini-progress">
            <div
              className="mini-progress-bar high-priority"
              style={{ width: `${total > 0 ? (highPriority / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="stats-card mini">
        <div className="stats-icon due-soon">
          <Clock />
          <div className="pulse-ring"></div>
        </div>
        <div className="stats-info">
          <p>Due Soon</p>
          <h3 className="counter" ref={(el) => (chartRefs.current[6] = el)} data-value={dueSoon}>
            0
          </h3>
          <div className="mini-progress">
            <div
              className="mini-progress-bar due-soon"
              style={{ width: `${total > 0 ? (dueSoon / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskStats

