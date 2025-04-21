// src/hooks/useRole.tsx
import { useEffect, useState } from "react"

export function useRole() {
    const [role, setRole] = useState(localStorage.getItem("role"))

    useEffect(() => {
        const handleStorageChange = () => {
            setRole(localStorage.getItem("role"))
        }

        window.addEventListener("storage", handleStorageChange)
        return () => {
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [])

    return role
}
