"use client"

import { useState, useEffect, useContext } from "react"
import { CycleContext } from "../../context/CycleContext"
import { BarChart2, PieChart, Activity, Droplet } from "react-feather"
import "./Analytics.css"

const Analytics = () => {
  const { cycles } = useContext(CycleContext)
  const [stats, setStats] = useState({
    totalCycles: 0,
    avgLength: 0,
    shortestCycle: 0,
    longestCycle: 0
  })

  const [symptomData, setSymptomData] = useState([])
  const [moodData, setMoodData] = useState([])
  const [cycleHistory, setCycleHistory] = useState([])

  useEffect(() => {
    if (cycles.length === 0) return

    // Basic Stats
    const sortedCycles = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

    let totalLength = 0
    let count = 0
    let lengths = []

    const historyData = []

    for (let i = 0; i < sortedCycles.length - 1; i++) {
      const currentStart = new Date(sortedCycles[i].startDate)
      const nextStart = new Date(sortedCycles[i + 1].startDate)
      const diffTime = Math.abs(nextStart - currentStart)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 0 && diffDays < 100) { // Filter distinct anomalies
        totalLength += diffDays
        count++
        lengths.push(diffDays)

        historyData.push({
          date: new Date(sortedCycles[i + 1].startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          length: diffDays
        })
      }
    }

    setCycleHistory(historyData)

    const avgLength = count > 0 ? Math.round(totalLength / count) : 0
    const shortest = lengths.length > 0 ? Math.min(...lengths) : 0
    const longest = lengths.length > 0 ? Math.max(...lengths) : 0

    setStats({
      totalCycles: cycles.length,
      avgLength,
      shortestCycle: shortest,
      longestCycle: longest
    })

    // Symptom Data
    const symptomCounts = {}
    cycles.forEach(cycle => {
      if (cycle.symptoms) {
        cycle.symptoms.forEach(s => {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1
        })
      }
    })

    const sData = Object.keys(symptomCounts).map(key => ({
      name: key,
      value: symptomCounts[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5)
    setSymptomData(sData)

    // Mood Data
    const moodCounts = {}
    cycles.forEach(cycle => {
      if (cycle.mood) {
        moodCounts[cycle.mood] = (moodCounts[cycle.mood] || 0) + 1
      }
    })

    const mData = Object.keys(moodCounts).map(key => ({
      name: key,
      value: moodCounts[key],
      color: getColorForMood(key)
    }))
    setMoodData(mData)

  }, [cycles])

  const getColorForMood = (mood) => {
    const colors = {
      happy: '#10b981',
      sad: '#6b7280',
      irritable: '#ef4444',
      anxious: '#f59e0b',
      neutral: '#6366f1',
      energetic: '#ec4899'
    }
    return colors[mood] || '#cbd5e1'
  }

  // Reuse chart rendering logic but adapted
  const renderBarChart = (data, title, icon) => {
    if (data.length === 0) return <div className="chart-container empty">No Data</div>

    const maxValue = Math.max(...data.map((d) => d.value), 1)

    return (
      <div className="chart-container">
        <h3 className="chart-title">
          {icon}
          {title}
        </h3>

        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${(item.value / maxValue) * 100}%`, backgroundColor: 'var(--primary)' }}
                >
                  {item.value > 0 && <span className="bar-value">{item.value}</span>}
                </div>
              </div>
              <div className="bar-label">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderCycleHistoryChart = () => {
    if (cycleHistory.length === 0) return <div className="chart-container empty">Not enough data for cycle history</div>
    const maxLen = Math.max(...cycleHistory.map(c => c.length), 35)

    return (
      <div className="chart-container">
        <h3 className="chart-title">
          <Activity className="chart-icon" />
          Cycle Length History
        </h3>
        <div className="bar-chart">
          {cycleHistory.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-container">
                <div
                  className="bar"
                  style={{ height: `${(item.length / maxLen) * 100}%`, backgroundColor: 'var(--secondary)' }}
                >
                  <span className="bar-value">{item.length}d</span>
                </div>
              </div>
              <div className="bar-label">{item.date}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = (data, title, icon) => {
    if (data.length === 0) return <div className="chart-container empty">No Data</div>
    const total = data.reduce((sum, item) => sum + item.value, 0)

    let currentAngle = 0
    const chartData = data.map((item) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0
      const startAngle = currentAngle
      const angle = (percentage / 100) * 360
      currentAngle += angle

      return { ...item, percentage, startAngle, angle }
    })

    return (
      <div className="chart-container">
        <h3 className="chart-title"> {icon} {title} </h3>
        <div className="pie-chart-container">
          <div className="pie-chart">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="pie-slice"
                style={{
                  backgroundColor: item.color,
                  transform: `rotate(${item.startAngle}deg)`,
                  clipPath: item.angle >= 180
                    ? "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)"
                    : "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 0%)",
                }}
              ></div>
            ))}
            {/* Overlay for >180 deg slices if needed, but keeping simple for now */}
          </div>
          <div className="pie-legend">
            {chartData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <div className="legend-label">{item.name}</div>
                <div className="legend-value">{Math.round(item.percentage)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="analytics-title">
          <h1>Cycle Analytics</h1>
          <p className="analytics-subtitle">Insights into your well-being</p>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <Activity />
          </div>
          <div className="summary-content">
            <h3>Avg Cycle Length</h3>
            <div className="summary-value">{stats.avgLength} days</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)' }}>
            <Droplet />
          </div>
          <div className="summary-content">
            <h3>Total Cycles</h3>
            <div className="summary-value">{stats.totalCycles}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <h3>Shortest</h3>
            <div className="summary-value">{stats.shortestCycle}d</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <h3>Longest</h3>
            <div className="summary-value">{stats.longestCycle}d</div>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-row">
          {renderCycleHistoryChart()}
        </div>
        <div className="chart-row">
          {renderBarChart(symptomData, "Top Symptoms", <Activity className="chart-icon" />)}
          {renderPieChart(moodData, "Mood Distribution", <PieChart className="chart-icon" />)}
        </div>
      </div>
    </div>
  )
}

export default Analytics
