"use client"

import { createContext, useState, useEffect, useCallback, useContext } from "react"
import { v4 as uuidv4 } from "uuid"
import { AuthContext } from "./AuthContext"
import { db } from "../firebase"
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot
} from "firebase/firestore"

export const CycleContext = createContext()

export const CycleProvider = ({ children }) => {
    const { user } = useContext(AuthContext)
    const [cycles, setCycles] = useState([])
    const [loading, setLoading] = useState(true)

    // Real-time listener for cycles from Firestore
    useEffect(() => {
        let unsubscribe = () => { }

        if (user) {
            setLoading(true)
            const q = query(
                collection(db, "users", user.id, "cycles"),
                orderBy("startDate", "desc")
            )

            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const loadedCycles = []
                querySnapshot.forEach((doc) => {
                    loadedCycles.push({ id: doc.id, ...doc.data() })
                })
                setCycles(loadedCycles)
                setLoading(false)
            }, (error) => {
                console.error("Error listening to cycles:", error)
                setLoading(false)
            })
        } else {
            setCycles([])
            setLoading(false)
        }

        return () => unsubscribe()
    }, [user])

    // Helper to add cycle
    const addCycle = async (cycleData) => {
        if (!user) return

        try {
            const newCycleData = {
                ...cycleData,
                createdAt: new Date().toISOString()
            }
            await addDoc(collection(db, "users", user.id, "cycles"), newCycleData)
        } catch (error) {
            console.error("Error adding cycle: ", error)
            throw error;
        }
    }

    // Helper to update cycle
    const updateCycle = async (id, cycleData) => {
        if (!user) return

        try {
            const cycleRef = doc(db, "users", user.id, "cycles", id)
            await updateDoc(cycleRef, {
                ...cycleData,
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error("Error updating cycle: ", error)
            throw error;
        }
    }

    // Helper to delete cycle
    const deleteCycle = async (id) => {
        if (!user) return

        try {
            await deleteDoc(doc(db, "users", user.id, "cycles", id))
        } catch (error) {
            console.error("Error deleting cycle: ", error)
            throw error;
        }
    }

    const getCycle = useCallback(
        (id) => {
            const cycle = cycles.find((c) => c.id === id)
            if (!cycle) {
                // In a real app we might fetch the single doc here, but for now we rely on the list
                throw new Error("Cycle log not found in local state")
            }
            return cycle
        },
        [cycles],
    )

    // Helper to predict next period based on average cycle length
    const predictNextPeriod = useCallback(() => {
        if (cycles.length < 2) return null

        // Cycles are already sorted by startDate desc from Firestore query
        const lastCycle = cycles[0]

        // Calculate average cycle length (simplified)
        let totalDays = 0
        let count = 0

        for (let i = 0; i < cycles.length - 1; i++) {
            const currentStart = new Date(cycles[i].startDate)
            const prevStart = new Date(cycles[i + 1].startDate)
            const diffTime = Math.abs(currentStart - prevStart)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            // Filter out outliers (e.g. missed months)
            if (diffDays > 20 && diffDays < 40) {
                totalDays += diffDays
                count++
            }
        }

        const avgLength = count > 0 ? Math.round(totalDays / count) : 28
        const nextDate = new Date(new Date(lastCycle.startDate).getTime() + avgLength * 24 * 60 * 60 * 1000)

        // Find recent average flow intensity for prediction? (Simpler to just return date + length)

        return {
            nextDate: nextDate.toISOString(),
            avgLength
        }

    }, [cycles])

    return (
        <CycleContext.Provider
            value={{
                cycles,
                loading,
                getCycle,
                addCycle,
                updateCycle,
                deleteCycle,
                predictNextPeriod
            }}
        >
            {children}
        </CycleContext.Provider>
    )
}
