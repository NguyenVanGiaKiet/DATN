"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation" 
import { useEffect, useState } from "react"  
import { useAuth } from "@/context/auth-context"

export function UserNav() {
  const [user, setUser] = useState<{ username: string, email: string, avatar: string } | null>(null) 
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { logout } = useAuth()

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token") 
      console.log("[UserNav] fetchUser", { token, pathname: window.location.pathname });
      if (!token) {
        if (window.location.pathname !== "/Login") {
          console.log("[UserNav] No token, redirecting to /Login");
          router.push("/Login")
        }
        setLoading(false)
        return
      }

      try {
        const response = await fetch("http://localhost:5190/api/account/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data) 
          console.log("[UserNav] User fetched", data)
        } else {
          if (window.location.pathname !== "/Login") {
            console.log("[UserNav] Invalid token, redirecting to /Login")
            router.push("/Login")
          }
        }
      } catch (error) {
        console.error("[UserNav] Failed to fetch user:", error)
        if (window.location.pathname !== "/Login") {
          router.push("/Login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    logout()
  }

  if (loading) return <div>Loading...</div> 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.avatar || "/placeholder-user.jpg"}
              alt={user?.username || "User"}
            />
            <AvatarFallback>
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              <span >Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/setting">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
