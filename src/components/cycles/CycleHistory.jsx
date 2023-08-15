"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { CycleContext } from "../../context/CycleContext"
import {
    List,
    Calendar as CalendarIcon,
    Plus,
    ChevronDown,
    X,
    ArrowUp,
    ArrowDown,
} from "react-feather"
import CycleCard from "./CycleCard"
import CycleForm from "./CycleForm"
import "../tasks/MyTasks.css" // Reuse styles

const CycleHistory = () => {
    const { cycles } = useContext(CycleContext)
    const [view, setView] = useState("list") // list, calendar
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [sortOrder, setSortOrder] = useState("desc")

    const [calendarDays, setCalendarDays] = useState([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [animation, setAnimation] = useState("")
    const containerRef = useRef(null)

    const sortedCycles = [...cycles].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    })

    // Generate calendar days
    useEffect(() => {
        if (view === "calendar") {
            const generateCalendarDays = () => {
                const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
                const firstDayOfWeek = firstDayOfMonth.getDay()
                const daysFromPrevMonth = firstDayOfWeek
                const totalDays = daysFromPrevMonth + lastDayOfMonth.getDate()
                const rows = Math.ceil(totalDays / 7)
                const totalCells = rows * 7
                const days = []

                const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate()
                for (let i = 0; i < daysFromPrevMonth; i++) {
                    const day = prevMonthLastDay - daysFromPrevMonth + i + 1
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day)
                    days.push({ date, day, isCurrentMonth: false, isToday: false })
                }

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

                const remainingCells = totalCells - days.length
                for (let i = 1; i <= remainingCells; i++) {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i)
                    days.push({ date, day: i, isCurrentMonth: false, isToday: false })
                }

                setCalendarDays(days)
            }

            generateCalendarDays()
        }
    }, [currentMonth, view])

    const getCyclesForDate = (date) => {
        return cycles.filter((cycle) => {
            const start = new Date(cycle.startDate)
            start.setHours(0, 0, 0, 0)
            const end = cycle.endDate ? new Date(cycle.endDate) : new Date(start) // If no end date, assume 1 day for logic or ongoing? Assuming single day or range.
            // Actually better to check if date falls within range
            end.setHours(23, 59, 59, 999)
            const checkDate = new Date(date)
            checkDate.setHours(12, 0, 0, 0) // Avoid timezone edge cases

            return checkDate >= start && checkDate <= end
        })
    }

    const toggleForm = () => {
        setIsFormOpen(!isFormOpen)
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

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthName = monthNames[currentMonth.getMonth()]
    const year = currentMonth.getFullYear()

    return (
        <div className="my-tasks-container" ref={containerRef}>
            <div className="my-tasks-header">
                <div className="header-title">
                    <h1>Cycle History</h1>
                    <p className="task-count">{cycles.length} logs</p>
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
                            className={`view-button ${view === "calendar" ? "active" : ""}`}
                            onClick={() => setView("calendar")}
                            title="Calendar View"
                        >
                            <CalendarIcon size={18} />
                        </button>
                    </div>

                    <button className="add-task-button" onClick={toggleForm}>
                        <Plus size={16} />
                        <span>Log Period</span>
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <div className="task-form-container">
                    <CycleForm onClose={toggleForm} />
                </div>
            )}

            <div className="tasks-content">
                {view === "list" && (
                    <div className="list-view">
                        {sortedCycles.length > 0 ? (
                            <div className="tasks-list">
                                {sortedCycles.map((cycle, index) => (
                                    <div key={cycle.id} className="task-item-wrapper" style={{ animationDelay: `${index * 0.05}s` }}>
                                        <CycleCard cycle={cycle} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-illustration">
                                    <List size={48} />
                                </div>
                                <h3>No logs found</h3>
                                <p>Track your first period cycle.</p>
                                <button className="create-task-button" onClick={toggleForm}>
                                    <Plus size={16} />
                                    Log Period
                                </button>
                            </div>
                        )}
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
                                    const dayCycles = getCyclesForDate(day.date)

                                    return (
                                        <div
                                            key={index}
                                            className={`day ${!day.isCurrentMonth ? "other-month" : ""} ${day.isToday ? "today" : ""}`}
                                        >
                                            <div className="day-header">
                                                <span className="day-number">{day.day}</span>
                                            </div>

                                            <div className="day-tasks">
                                                {dayCycles.map((cycle, idx) => (
                                                    <div key={idx} className="day-task" style={{ borderLeft: '3px solid var(--primary)', backgroundColor: 'var(--accent)', padding: '2px 4px', fontSize: '0.7rem' }}>
                                                        {cycle.flow}
                                                    </div>
                                                ))}
                                            </div>

                                            {day.isCurrentMonth && (
                                                <button className="add-task-day" onClick={() => { setIsFormOpen(true); /* Pass date */ }}>
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

export default CycleHistory
