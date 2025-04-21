"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

type User = {
  email: string
  role: "User" | "Admin"
}

type AuthContextType = {
  user: User | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        setUser({ email, role })
      } catch (error) {
        console.error("Invalid token", error)
        localStorage.removeItem("token")
      }
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem("token", token)
    const decoded: any = jwtDecode(token)
    const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    setUser({ email, role })
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/Login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
