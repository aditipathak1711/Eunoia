"use client"

import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CycleContext } from "../../context/CycleContext"
import {
    Calendar,
    Edit,
    Trash2,
    ArrowLeft,
    Droplet,
    Smile,
    Activity,
    AlignLeft,
    MoreHorizontal
} from "react-feather"
import CycleForm from "./CycleForm"
import "../tasks/TaskDetails.css" // Reuse styles

const CycleDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getCycle, deleteCycle, loading: contextLoading } = useContext(CycleContext)
    const [cycle, setCycle] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showActions, setShowActions] = useState(false)

    useEffect(() => {
        // Wait for context to finish loading data from Firestore
        if (contextLoading) return

        try {
            if (id) {
                const cycleData = getCycle(id)
                setCycle(cycleData)
            }
        } catch (error) {
            console.error("Error fetching cycle:", error)
            setCycle(null)
        } finally {
            setLoading(false)
        }
    }, [id, getCycle, isEditing, contextLoading]) // Re-fetch on edit close or when context loads

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            deleteCycle(cycle.id)
            navigate("/tasks") // Redirect to history
        }
    }

    const toggleEditMode = () => {
        setIsEditing(!isEditing)
        // Refetching happens via dependency on isEditing if strictly needed, but state update is usually enough
    }

    const handleBack = () => {
        navigate(-1)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getFlowColor = (flow) => {
        switch (flow) {
            case 'heavy': return '#be123c';
            case 'medium': return '#ec4899';
            case 'light': return '#f472b6';
            case 'spotting': return '#fbcfe8';
            default: return '#ec4899';
        }
    }

    if (loading || contextLoading) {
        return <div className="task-details-loading">Loading...</div>
    }

    if (!cycle) {
        return (
            <div className="task-not-found">
                <h2>Log Not Found</h2>
                <button onClick={handleBack} className="back-button">Back to History</button>
            </div>
        )
    }

    if (isEditing) {
        return (
            <div className="task-details-container editing">
                <CycleForm cycle={cycle} onClose={toggleEditMode} />
            </div>
        )
    }

    return (
        <div className="task-details-container">
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
                                <span>Edit</span>
                            </button>
                            <button onClick={handleDelete} className="action-item delete">
                                <Trash2 size={16} />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="task-details-content">
                <div className="task-main-content">

                    <h1 className="task-title-large">Period Log</h1>

                    <div className="task-metadata">
                        <div className="metadata-item">
                            <Calendar size={16} />
                            <span>{formatDate(cycle.startDate)} {cycle.endDate && `- ${formatDate(cycle.endDate)}`}</span>
                        </div>
                    </div>

                    <div className="task-description-section" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '20px', backgroundColor: 'var(--muted)', color: getFlowColor(cycle.flow) }}>
                            <Droplet size={20} fill={getFlowColor(cycle.flow)} />
                            <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{cycle.flow} Flow</span>
                        </div>
                        {cycle.mood && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '20px', backgroundColor: 'var(--muted)' }}>
                                <Smile size={20} />
                                <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{cycle.mood}</span>
                            </div>
                        )}
                    </div>

                    {cycle.symptoms && cycle.symptoms.length > 0 && (
                        <div className="task-tags-section">
                            <h3>Symptoms</h3>
                            <div className="tags-container">
                                {cycle.symptoms.map((tag, index) => (
                                    <div key={index} className="tag" style={{ backgroundColor: 'var(--destructive)', color: 'white' }}>
                                        <Activity size={14} />
                                        <span>{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {cycle.notes && (
                        <div className="task-description-section">
                            <h3>Notes</h3>
                            <div className="metadata-item" style={{ alignItems: 'flex-start' }}>
                                <AlignLeft size={16} style={{ marginTop: '4px' }} />
                                <p>{cycle.notes}</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default CycleDetails
