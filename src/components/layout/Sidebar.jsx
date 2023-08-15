"use client"

import { useContext, useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Home, Calendar, BarChart2, LogOut, X, List } from "react-feather"
import "./Sidebar.css"

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useContext(AuthContext)
  const [animateItems, setAnimateItems] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Trigger animation for menu items when sidebar opens
      setAnimateItems(true)
    } else {
      setAnimateItems(false)
    }
  }, [isOpen])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout()
    }
  }

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <span className="check-mark"></span>
          </div>
          <h1>Eunoia</h1>
        </div>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <X />
        </button>
      </div>

      <div className="user-info">
        <div className="user-avatar">{user?.name?.charAt(0) || "U"}</div>
        <div className="user-details">
          <h3>{user?.name || "User"}</h3>
          <p>{user?.email || "user@example.com"}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className={animateItems ? "animate" : ""}>
          <li style={{ animationDelay: "0.1s" }}>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              <Home />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li style={{ animationDelay: "0.2s" }}>
            <NavLink to="/tasks" className={({ isActive }) => (isActive ? "active" : "")}>
              <List />
              <span>Cycle History</span>
            </NavLink>
          </li>
          <li style={{ animationDelay: "0.3s" }}>
            <NavLink to="/calendar" className={({ isActive }) => (isActive ? "active" : "")}>
              <Calendar />
              <span>Calendar</span>
            </NavLink>
          </li>
          <li style={{ animationDelay: "0.4s" }}>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
              <BarChart2 />
              <span>Analytics</span>
            </NavLink>
          </li>

        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul className={animateItems ? "animate" : ""}>

          <li style={{ animationDelay: "0.9s" }}>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar

