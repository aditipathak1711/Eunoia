"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css"

// Components
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Dashboard from "./components/dashboard/Dashboard"
import TaskDetails from "./components/tasks/TaskDetails" // Keeping for verifying before full removal, but effectively replaced
import Calendar from "./components/calendar/Calendar"
// import Settings from "./components/settings/Settings"
// import Profile from "./components/profile/Profile"
import NotFound from "./components/common/NotFound"
import ProtectedRoute from "./components/common/ProtectedRoute"
import Sidebar from "./components/layout/Sidebar"
import Header from "./components/layout/Header"
import { AuthProvider } from "./context/AuthContext"
import { CycleProvider } from "./context/CycleContext"
import { ThemeProvider } from "./context/ThemeContext"
import { NotificationProvider } from "./context/NotificationContext"
import Analytics from "./components/analytics/Analytics"
import CycleHistory from "./components/cycles/CycleHistory"
import CycleDetails from "./components/cycles/CycleDetails"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CycleProvider>
            <NotificationProvider>
              <div className="app-container">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <div className={`app-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
                          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                          <div className="main-content">
                            <Header toggleSidebar={toggleSidebar} />
                            <div className="content-wrapper">
                              <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/Calendar" element={<Calendar />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/task/:id" element={<CycleDetails />} />
                                <Route path="/tasks" element={<CycleHistory />} />
                                {/* <Route path="/settings" element={<Settings />} /> */}
                                {/* <Route path="/profile" element={<Profile />} /> */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </div>
                          </div>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </NotificationProvider>
          </CycleProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App

