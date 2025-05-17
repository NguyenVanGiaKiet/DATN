import { GalleryVerticalEnd } from "lucide-react"

import { RegisterForm } from "../../components/register-form"

export default function RegisterPage() {
    
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Purchasing Management.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:flex items-center justify-center">
        <img
          src="/undraw_sign-up_qamz.svg"
          alt="Image"
          className="max-h-[500px] max-w-[500px] object-contain"
        />
      </div>
    </div>
  )
}
