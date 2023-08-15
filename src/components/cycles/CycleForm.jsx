"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { CycleContext } from "../../context/CycleContext"
import {
    X,
    Calendar,
    Check,
    AlignLeft,
    Activity,
    Smile,
    Droplet
} from "react-feather"
import "../tasks/TaskForm.css" // Reusing TaskForm CSS

const CycleForm = ({ cycle, onClose, initialDate }) => {
    const isEditing = !!cycle
    const { addCycle, updateCycle } = useContext(CycleContext)
    const formRef = useRef(null)

    const [formData, setFormData] = useState({
        startDate: initialDate || (cycle?.startDate ? new Date(cycle.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
        endDate: cycle?.endDate ? new Date(cycle.endDate).toISOString().split("T")[0] : "",
        flow: cycle?.flow || "medium",
        symptoms: cycle?.symptoms || [],
        mood: cycle?.mood || "neutral",
        notes: cycle?.notes || "",
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newSymptom, setNewSymptom] = useState("")

    const commonSymptoms = ["Cramps", "Headache", "Fatigue", "Bloating", "Acne", "Backache"]
    const moods = ["Happy", "Sad", "Irritable", "Anxious", "Neutral", "Energetic"]
    const flows = ["Light", "Medium", "Heavy", "Spotting"]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const toggleSymptom = (symptom) => {
        if (formData.symptoms.includes(symptom)) {
            setFormData({
                ...formData,
                symptoms: formData.symptoms.filter((s) => s !== symptom),
            })
        } else {
            setFormData({
                ...formData,
                symptoms: [...formData.symptoms, symptom],
            })
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.startDate) newErrors.startDate = "Start date is required"
        if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            newErrors.endDate = "End date cannot be before start date"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!validate()) return

        setIsSubmitting(true)

        const cycleData = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        }

        setTimeout(() => {
            if (isEditing) {
                updateCycle(cycle.id, cycleData)
            } else {
                addCycle(cycleData)
            }

            setIsSubmitting(false)
            onClose()
        }, 500)
    }

    return (
        <div className="task-form" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-header">
                <h2>{isEditing ? "Edit Cycle" : "Log Period"}</h2>
                <button className="close-button" onClick={onClose} aria-label="Close form">
                    <X />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-content" style={{ padding: '20px' }}>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date *</label>
                            <div className="input-container icon-input">
                                <Calendar size={16} className="input-icon" />
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className={errors.startDate ? "error" : ""}
                                />
                            </div>
                            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">End Date</label>
                            <div className="input-container icon-input">
                                <Calendar size={16} className="input-icon" />
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className={errors.endDate ? "error" : ""}
                                />
                            </div>
                            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Flow Intensity</label>
                        <div className="priority-selector">
                            {flows.map(f => (
                                <div
                                    key={f}
                                    className={`priority-option ${formData.flow === f.toLowerCase() ? "selected" : ""}`}
                                    onClick={() => setFormData({ ...formData, flow: f.toLowerCase() })}
                                    style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: formData.flow === f.toLowerCase() ? 'var(--primary)' : 'var(--card)', color: formData.flow === f.toLowerCase() ? 'white' : 'var(--foreground)' }}
                                >
                                    <Droplet size={14} style={{ marginRight: '5px' }} />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mood</label>
                        <div className="priority-selector" style={{ flexWrap: 'wrap' }}>
                            {moods.map(m => (
                                <div
                                    key={m}
                                    className={`priority-option ${formData.mood === m.toLowerCase() ? "selected" : ""}`}
                                    onClick={() => setFormData({ ...formData, mood: m.toLowerCase() })}
                                    style={{ padding: '8px 12px', margin: '5px', borderRadius: '15px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: formData.mood === m.toLowerCase() ? 'var(--secondary)' : 'var(--card)' }}
                                >
                                    <Smile size={14} style={{ marginRight: '5px' }} />
                                    <span>{m}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Symptoms</label>
                        <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {commonSymptoms.map(s => (
                                <div
                                    key={s}
                                    className={`tag ${formData.symptoms.includes(s) ? "selected" : ""}`}
                                    onClick={() => toggleSymptom(s)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.symptoms.includes(s) ? 'var(--destructive)' : 'var(--muted)',
                                        color: formData.symptoms.includes(s) ? 'white' : 'var(--foreground)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <div className="input-container">
                            <AlignLeft size={16} className="input-icon" style={{ top: '15px' }} />
                            <textarea
                                id="notes"
                                name="notes"
                                rows="3"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any usage notes..."
                                style={{ paddingLeft: '40px', width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '10px 40px' }}
                            />
                        </div>
                    </div>

                </div>

                <div className="form-actions" style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
                    <button type="submit" className="submit-button" disabled={isSubmitting} style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: 'var(--radius)', fontWeight: '600' }}>
                        {isSubmitting ? "Saving..." : (isEditing ? "Update Log" : "Save Log")}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CycleForm
