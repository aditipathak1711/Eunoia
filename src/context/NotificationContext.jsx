"use client"

import { createContext, useState, useEffect } from "react"
import { Bell, Calendar, AlertTriangle } from "react-feather"

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Load notifications from localStorage
    const loadNotifications = () => {
      try {
        const storedNotifications = localStorage.getItem("notifications")
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications))
        } else {
          // Set some demo notifications
          const demoNotifications = [
            {
              id: "1",
              message: 'Task "Complete project proposal" is due tomorrow',
              time: "1 hour ago",
              read: false,
              icon: <Calendar className="notification-bell" />,
            },
            {
              id: "2",
              message: "You have 3 overdue tasks",
              time: "3 hours ago",
              read: false,
              icon: <AlertTriangle className="notification-bell" />,
            },
            {
              id: "3",
              message: "Welcome to TaskMaster! Get started by creating your first task.",
              time: "1 day ago",
              read: true,
              icon: <Bell className="notification-bell" />,
            },
          ]
          setNotifications(demoNotifications)
          localStorage.setItem("notifications", JSON.stringify(demoNotifications))
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
        setNotifications([])
      }
    }

    loadNotifications()
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      read: false,
      time: "Just now",
      ...notification,
    }

    setNotifications((prevNotifications) => [newNotification, ...prevNotifications])
    return newNotification
  }

  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prevNotifications) => prevNotifications.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

