"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { login, decodeToken } from "../lib/api" // Asegúrate de que la ruta sea correcta


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()




  const ADMIN_ROLE_ID = process.env.NEXT_PUBLIC_ADMIN_ROLE_ID || ""
  const DOCTOR_ROLE_ID = process.env.NEXT_PUBLIC_DOCTOR_ROLE_ID || ""
  const TECHNICIAN_ROLE_ID = process.env.NEXT_PUBLIC_TECHNICIAN_ROLE_ID || ""


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Realizar login con el backend
      const { access_token } = await login(email, password)

      // 2. Decodificar el token para obtener los roles
      const tokenData = decodeToken(access_token)

      console.log("Token data:", tokenData) // Debug
      console.log("User roles:", tokenData.roles) // Debug

      // 3. Verificar roles usando UUIDs
      const userRoles = tokenData.roles || []

      const hasAdminRole = userRoles.includes(ADMIN_ROLE_ID)
      const hasDoctorRole = userRoles.includes(DOCTOR_ROLE_ID)
      const hasTechnicianRole = userRoles.includes(TECHNICIAN_ROLE_ID)

      console.log("Expected admin role ID:", ADMIN_ROLE_ID) // Debug
      console.log("Expected doctor role ID:", DOCTOR_ROLE_ID) // Debug
      console.log("Has admin role:", hasAdminRole) // Debug
      console.log("Has doctor role:", hasDoctorRole) // Debug
      console.log("Has technician role:", hasTechnicianRole) // Debug

      if (!hasAdminRole && !hasDoctorRole && !hasTechnicianRole) {
        console.error("Role mismatch. User roles:", userRoles) // Debug
        throw new Error(`No tienes los permisos necesarios para acceder al sistema.`)
      }

      // 4. Redirigir según el rol
      if (hasAdminRole) {
        console.log("Redirecting to admin dashboard") // Debug
        router.push("/dashboard/admin")
      } else if (hasDoctorRole) {
        console.log("Redirecting to doctor dashboard") // Debug
        router.push("/dashboard/doctor")
      } else if (hasTechnicianRole) {
        console.log("Redirecting to technician dashboard") // Debug
        router.push("/dashboard/technician")
      }

    } catch (err) {
      console.error("Login error:", err) // Debug
      // Manejo de errores genérico
      setError(err instanceof Error ? err.message : "Credenciales inválidas. Por favor intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }


  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Acceso al sistema</CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder al panel de control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    ¿Olvidó su contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              Este sistema es exclusivo para personal médico y administrativo autorizado.
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
