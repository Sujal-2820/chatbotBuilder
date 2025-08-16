"use client"

const ThemeToggle = ({ currentTheme, onToggle }) => {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
    >
      <span className="theme-icon">{currentTheme === "light" ? "🌙" : "☀️"}</span>
      <span className="theme-label">{currentTheme === "light" ? "Dark" : "Light"}</span>
    </button>
  )
}

export default ThemeToggle
