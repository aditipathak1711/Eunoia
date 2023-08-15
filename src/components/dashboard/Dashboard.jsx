"use client"

import { useState, useEffect, useContext } from "react"
import { CycleContext } from "../../context/CycleContext"
import { AuthContext } from "../../context/AuthContext"
import { ThemeContext } from "../../context/ThemeContext"
import { Link } from "react-router-dom"
import {
  Sun,
  Moon,
  Droplet,
  Activity,
  Plus,
  ChevronRight,
  Heart
} from "react-feather"
import CycleForm from "../cycles/CycleForm"
import "./Dashboard.css"

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const { cycles, predictNextPeriod } = useContext(CycleContext)
  const { theme } = useContext(ThemeContext)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [prediction, setPrediction] = useState(null)
  const [currentPhase] = useState("Follicular") // Mock phase for now

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    let greetingText = ""

    if (hour < 12) {
      greetingText = "Good morning"
    } else if (hour < 18) {
      greetingText = "Good afternoon"
    } else {
      greetingText = "Good evening"
    }

    setGreeting(greetingText)
  }, [])

  useEffect(() => {
    const pred = predictNextPeriod()
    setPrediction(pred)
  }, [cycles, predictNextPeriod])

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysUntil = (dateString) => {
    if (!dateString) return 0
    const target = new Date(dateString)
    const today = new Date()
    // Reset hours to compare dates only
    target.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilNext = prediction ? getDaysUntil(prediction.nextDate) : 0

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="greeting-container">
            <h1>
              {greeting}, {user?.name || "User"}
            </h1>
            <p className="date-display">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="header-icon">
            {theme === "light" ? <Sun size={32} /> : <Moon size={32} />}
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Prediction Card */}
        <div className="prediction-card" style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '200px'
        }}>
          {cycles.length > 0 ? (
            <>
              <h2 style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '10px' }}>Next Period Prediction</h2>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {daysUntilNext > 0 ? `${daysUntilNext} Days` : daysUntilNext === 0 ? "Today" : "Late"}
              </div>
              <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                {prediction ? formatDate(prediction.nextDate) : "Insufficient data"}
              </p>
              <div style={{ marginTop: '20px', padding: '5px 15px', background: 'rgba(255,255,255,0.2)', borderRadius: '15px', fontSize: '0.9rem' }}>
                Average Cycle: {prediction ? prediction.avgLength : 28} Days
              </div>
            </>
          ) : (
            <>
              <h2>Welcome to Eunoia</h2>
              <p>Log your first period to get predictions.</p>
              <button onClick={toggleForm} style={{ marginTop: '15px', background: 'var(--card)', color: 'var(--primary)', padding: '10px 20px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Log Period
              </button>
            </>
          )}
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div className="stat-card" style={{ background: 'var(--card)', padding: '20px', borderRadius: '15px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Droplet size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '10px' }}>Current Phase</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{currentPhase}</p>
          </div>
          <div className="stat-card" style={{ background: 'var(--card)', padding: '20px', borderRadius: '15px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Activity size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '10px' }}>Logged Cycles</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{cycles.length}</p>
          </div>
          <div className="stat-card" style={{ background: 'var(--card)', padding: '20px', borderRadius: '15px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Heart size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '10px' }}>Health Tracking</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Active</p>
          </div>
        </div>

        <div className="quick-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          {!isFormOpen && (
            <button onClick={toggleForm} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary)', color: 'white', padding: '15px 30px', borderRadius: '30px', border: 'none', fontSize: '1rem', fontWeight: 'bold', boxShadow: 'var(--shadow-lg)', cursor: 'pointer' }}>
              <Plus />
              <span>Log Period</span>
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="task-form-container">
            <CycleForm onClose={toggleForm} />
          </div>
        )}

        <div className="recent-history">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Recent Logs</h3>
            <Link to="/tasks" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="recent-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cycles.slice(0, 3).map(cycle => (
              <div key={cycle.id} style={{ background: 'var(--card)', padding: '15px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid', borderLeftColor: cycle.flow === 'heavy' ? '#be123c' : '#ec4899' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{formatDate(cycle.startDate)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{cycle.flow} flow • {cycle.mood}</div>
                </div>
                <Link to={`/task/${cycle.id}`} style={{ padding: '5px 10px', background: 'var(--muted)', borderRadius: '10px', fontSize: '0.8rem' }}>
                  Details
                </Link>
              </div>
            ))}
            {cycles.length === 0 && <p style={{ color: 'var(--muted-foreground)', textAlign: 'center' }}>No logs yet.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
