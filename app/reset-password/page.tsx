"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { resetPassword } from "../lib/api"

function ResetPasswordForm() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    useEffect(() => {
        if (!token) {
            setError("Token inválido o faltante. Por favor verifique el enlace de recuperación.")
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            setError("Token inválido o faltante.")
            return
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.")
            return
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.")
            return
        }

        setLoading(true)
        setError("")
        setSuccess(false)

        try {
            await resetPassword(token, password)
            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error al restablecer la contraseña.")
        } finally {
            setLoading(false)
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-green-600">¡Contraseña actualizada!</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-700 dark:text-green-400">
                            Su contraseña ha sido actualizada exitosamente. Será redirigido al inicio de sesión en unos segundos.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button>Ir al inicio de sesión ahora</Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Restablecer contraseña</CardTitle>
                <CardDescription className="text-center">
                    Ingrese su nueva contraseña a continuación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password">Nueva contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={!token}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={toggleShowPassword}
                                disabled={!token}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={!token}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !token}>
                        {loading ? "Actualizando..." : "Actualizar contraseña"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                </Link>
            </CardFooter>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <Suspense fallback={<div>Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </main>
            <Footer />
        </div>
    )
}
