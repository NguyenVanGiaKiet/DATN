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
  isAuthenticated: boolean
  isInitialized: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    console.log("[AuthContext] useEffect", { token })
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        const now = Date.now() / 1000
        if (decoded.exp && decoded.exp < now) {
          localStorage.removeItem("token")
          console.log("[AuthContext] Token expired, removed")
        } else {
          const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
          const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
          setUser({ email, role })
          console.log("[AuthContext] Set user", { email, role })
        }
      } catch (error) {
        console.error("[AuthContext] Invalid token", error)
        localStorage.removeItem("token")
      }
    }
    setIsInitialized(true)
    console.log("[AuthContext] isInitialized set true")
  }, [])

  const login = (token: string) => {
    try {
      const decoded: any = jwtDecode(token)
      const now = Date.now() / 1000
      if (decoded.exp && decoded.exp < now) {
        console.warn("Token expired.")
        return
      }
      const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      localStorage.setItem("token", token)
      setUser({ email, role })
    } catch (error) {
      console.error("Login failed: invalid token", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    // Không redirect ở đây, để cho các component tự xử lý nếu cần
  }

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
