"use client"

import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { CycleContext } from "../../context/CycleContext"
import { Calendar, MoreVertical, Edit, Trash2, Droplet, Smile } from "react-feather"
import "../tasks/TaskCard.css" // Reuse styles

const CycleCard = ({ cycle }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const { deleteCycle } = useContext(CycleContext)

    const toggleMenu = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuOpen(!menuOpen)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (window.confirm("Are you sure you want to delete this log?")) {
            deleteCycle(cycle.id)
        }

        setMenuOpen(false)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const getFlowColor = (flow) => {
        switch (flow) {
            case 'heavy': return '#be123c'; // red-700
            case 'medium': return '#ec4899'; // pink-500
            case 'light': return '#f472b6'; // pink-400
            case 'spotting': return '#fbcfe8'; // pink-200
            default: return '#ec4899';
        }
    }

    return (
        <Link to={`/task/${cycle.id}`} className="task-card-link">
            {/* Kept route as /task/:id for now or should I change to /cycle/:id? App.js still has /task/:id. I will change App.js later. */}
            <div className={`task-card`} style={{ borderLeft: `4px solid ${getFlowColor(cycle.flow)}` }}>
                <div className="task-header">
                    <div className="task-priority">
                        <Droplet size={14} color={getFlowColor(cycle.flow)} fill={getFlowColor(cycle.flow)} />
                        <span className={`priority-label`} style={{ color: getFlowColor(cycle.flow) }}>{cycle.flow}</span>
                    </div>

                    <div className="task-menu-container">
                        <button className="task-menu-button" onClick={toggleMenu} aria-label="Menu">
                            <MoreVertical />
                        </button>

                        {menuOpen && (
                            <div className="task-menu">
                                <button className="menu-item delete" onClick={handleDelete}>
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="task-content">
                    <h3 className="task-title">Period Log</h3>
                    <p className="task-description">
                        {cycle.symptoms && cycle.symptoms.join(", ")}
                    </p>
                </div>

                <div className="task-footer">
                    <div className="due-date">
                        <Calendar size={14} />
                        <span>{formatDate(cycle.startDate)} {cycle.endDate ? `- ${formatDate(cycle.endDate)}` : "(Ongoing)"}</span>
                    </div>
                    {cycle.mood && (
                        <div className="estimated-time">
                            <Smile size={14} />
                            <span style={{ textTransform: 'capitalize' }}>{cycle.mood}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default CycleCard
