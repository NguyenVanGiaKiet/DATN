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
import { useRouter } from "next/navigation" // thêm dòng này
import { useEffect, useState } from "react"  // thêm dòng này

export function UserNav()  {
  const [user, setUser] = useState<{ username: string, email: string } | null>(null) // state để lưu thông tin người dùng
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token") // lấy token từ localStorage
      if (!token) {
        router.push("/Login")
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
          setUser(data) // Lưu thông tin người dùng vào state
        } else {
          router.push("/Login") // Nếu không có dữ liệu người dùng, điều hướng đến đăng nhập
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/Login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem("token")
    router.push("/Login")
  }
  
  if (loading) return <div>Loading...</div> // Nếu đang tải, hiển thị loading
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
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
        <DropdownMenuItem asChild>
            <Link href="/Login" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/>
              <span>Log out</span>
            </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

