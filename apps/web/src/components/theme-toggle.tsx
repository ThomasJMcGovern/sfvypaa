"use client"

export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", next)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next ? "#0D0B09" : "#F2EDE1")
    try {
      localStorage.setItem("sfv-theme", next ? "dark" : "light")
    } catch {
      // private mode — theme just won't persist
    }
  }

  return (
    <button
      aria-label="Toggle night mode"
      className="border-2 border-border px-2.5 py-1.5 font-mono text-xs font-bold tracking-wider text-foreground uppercase transition-colors hover:bg-foreground/10"
      onClick={toggle}
      type="button"
    >
      <span className="dark:hidden">☾ Night</span>
      <span className="hidden dark:inline">☀ Day</span>
    </button>
  )
}
