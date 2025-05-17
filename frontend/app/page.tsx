import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <span>Purchasing Management</span>
        </Link>
        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/Login" className="text-sm font-medium underline-offset-4 hover:underline">
              Login
            </Link>
            <Link href="/Register" className="text-sm font-medium underline-offset-4 hover:underline">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <section className="text-center">
          <div className="container flex flex-col items-center justify-center px-4 text-center space-y-4 py-12 md:py-24 lg:py-32">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to Purchasing Management.
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Smart Purchasing Management System For Businesses.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/Login">
                <Button>Login</Button>
              </Link>
              <Link href="/Register">
                <Button variant="outline">Register</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
