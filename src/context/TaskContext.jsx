"use client"

import { createContext, useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

export const TaskContext = createContext()

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load tasks from localStorage
    const loadTasks = () => {
      try {
        const storedTasks = localStorage.getItem("tasks")
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        } else {
          // Set some demo tasks if none exist
          const demoTasks = [
            {
              id: uuidv4(),
              title: "Complete project proposal",
              description: "Finish the project proposal document and send it to the client for review.",
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
              priority: "high",
              status: "in-progress",
              estimatedTime: 120,
              tags: ["work", "client"],
            },
            {
              id: uuidv4(),
              title: "Buy groceries",
              description: "Get milk, eggs, bread, and vegetables from the store.",
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
              priority: "medium",
              status: "pending",
              estimatedTime: 30,
              tags: ["personal", "shopping"],
            },
            {
              id: uuidv4(),
              title: "Schedule team meeting",
              description: "Organize a team meeting to discuss the upcoming sprint goals.",
              dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
              priority: "medium",
              status: "pending",
              estimatedTime: 15,
              tags: ["work", "team"],
            },
          ]
          setTasks(demoTasks)
          localStorage.setItem("tasks", JSON.stringify(demoTasks))
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const fetchTasks = useCallback(() => {
    // In a real app, this would make an API call
    // For demo purposes, we're using localStorage
    return tasks
  }, [tasks])

  const getTask = useCallback(
    (id) => {
      // In a real app, this might make an API call for a single task
      const task = tasks.find((task) => task.id === id)
      if (!task) {
        throw new Error("Task not found")
      }
      return task
    },
    [tasks],
  )

  const addTask = (taskData) => {
    const newTask = {
      id: uuidv4(),
      ...taskData,
      createdAt: new Date().toISOString(),
    }

    setTasks((prevTasks) => [...prevTasks, newTask])
    return newTask
  }

  const updateTask = (id, taskData) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, ...taskData, updatedAt: new Date().toISOString() } : task)),
    )
  }

  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        fetchTasks,
        getTask,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

