"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
    const [username, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false) // 👈 State loading
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp.")
            return
        }

        setIsLoading(true) // 👈 Bắt đầu loading

        try {
            const res = await fetch("http://localhost:5190/api/Account/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword,
                }),
            })

            if (res.ok) {
                toast.success("Đăng ký thành công!")
                router.push("/Login")
            } else {
                const error = await res.text()
                toast.error("Đăng ký thất bại: " + error)
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi đăng ký.")
        } finally {
            setIsLoading(false) // 👈 Dừng loading
        }
    }
    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Đang tải thông tin...</p>
            </div>
          </div>
        )
      }
    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Enter your details below to create your account
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">User Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
                <Button variant="outline" className="w-full" disabled={isLoading}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                            fill="currentColor"
                        />
                    </svg>
                    Register with GitHub
                </Button>
            </div>
            <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/Login" className="underline underline-offset-4">
                    Sign in
                </a>
            </div>
        </form>
    )
}
