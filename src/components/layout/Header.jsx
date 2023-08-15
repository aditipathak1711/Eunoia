"use client"

import { useContext } from "react"
import { Menu, Sun, Moon } from "react-feather"
import { ThemeContext } from "../../context/ThemeContext"

import "./Header.css"

const Header = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext)


  return (
    <header className="app-header">
      <button className="menu-button" onClick={toggleSidebar} aria-label="Toggle menu">
        <Menu />
      </button>

      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
      </div>
    </header>
  )
}

export default Header

