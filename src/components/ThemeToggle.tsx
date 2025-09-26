import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "dark") return <Moon className="h-4 w-4" />
    if (theme === "light") return <Sun className="h-4 w-4" />
    return <Sun className="h-4 w-4" /> // system default to sun
  }

  const getLabel = () => {
    if (theme === "dark") return "Dark mode"
    if (theme === "light") return "Light mode" 
    return "System mode"
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="bg-background hover:bg-accent"
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  )
}