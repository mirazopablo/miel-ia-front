"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LayoutDashboard, FileText, LogOut, Menu, X, User, Stethoscope, Wrench, ArrowLeft } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname?.startsWith(path) || false
  }

  // Determinar el rol del usuario basado en la ruta
  const isAdmin = pathname?.includes("/admin") || false
  const isDoctor = pathname?.includes("/doctor") || false
  const isTechnician = pathname?.includes("/technician") || false

  // Determinar el título según el rol
  const getDashboardTitle = () => {
    if (isAdmin) return "Panel de Administración"
    if (isDoctor) return "Panel Médico"
    if (isTechnician) return "Panel Técnico"
    return "Dashboard"
  }

  // Función para volver atrás
  const handleGoBack = () => {
    router.back()
  }

  // Para admin, mantener siempre el sidebar de admin
  const getAdminSidebar = () => (
    <>
      <Link
        href="/dashboard/admin"
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          pathname === "/dashboard/admin"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        <LayoutDashboard className="mr-3 h-5 w-5" />
        Dashboard Admin
      </Link>
      <Link
        href="/dashboard/doctor"
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          pathname?.startsWith("/dashboard/doctor")
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        <Stethoscope className="mr-3 h-5 w-5" />
        Panel Médico
      </Link>
      <Link
        href="/dashboard/technician"
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          pathname?.startsWith("/dashboard/technician")
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        <Wrench className="mr-3 h-5 w-5" />
        Panel Técnico
      </Link>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-background pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/" className="text-xl font-bold">
              Miel-IA
            </Link>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {/* Para admin, mostrar siempre el sidebar de admin */}
              {isAdmin ? (
                getAdminSidebar()
              ) : (
                <>
                  {/* Elementos para doctores */}
                  {isDoctor && (
                    <>
                      <Link
                        href="/dashboard/doctor"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === "/dashboard/doctor"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/doctor/studies"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive("/dashboard/doctor/studies")
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <FileText className="mr-3 h-5 w-5" />
                        Estudios
                      </Link>
                    </>
                  )}

                  {/* Elementos para técnicos */}
                  {isTechnician && (
                    <>
                      <Link
                        href="/dashboard/technician"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          pathname === "/dashboard/technician"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/technician/studies"
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive("/dashboard/technician/studies")
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <FileText className="mr-3 h-5 w-5" />
                        Estudios
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                Miel-IA
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-5">
              <nav className="space-y-1">
                {/* Para admin, mostrar siempre el sidebar de admin */}
                {isAdmin ? (
                  <>
                    <Link
                      href="/dashboard/admin"
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname === "/dashboard/admin"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <LayoutDashboard className="mr-3 h-5 w-5" />
                      Dashboard Admin
                    </Link>
                    <Link
                      href="/dashboard/doctor"
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname?.startsWith("/dashboard/doctor")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Stethoscope className="mr-3 h-5 w-5" />
                      Panel Médico
                    </Link>
                    <Link
                      href="/dashboard/technician"
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname?.startsWith("/dashboard/technician")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Wrench className="mr-3 h-5 w-5" />
                      Panel Técnico
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Elementos para doctores */}
                    {isDoctor && (
                      <>
                        <Link
                          href="/dashboard/doctor"
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            pathname === "/dashboard/doctor"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/doctor/studies"
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive("/dashboard/doctor/studies")
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FileText className="mr-3 h-5 w-5" />
                          Estudios
                        </Link>
                      </>
                    )}

                    {/* Elementos para técnicos */}
                    {isTechnician && (
                      <>
                        <Link
                          href="/dashboard/technician"
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            pathname === "/dashboard/technician"
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/technician/studies"
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive("/dashboard/technician/studies")
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <FileText className="mr-3 h-5 w-5" />
                          Estudios
                        </Link>
                      </>
                    )}
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-background border-b">
          <button type="button" className="px-4 md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold hidden md:block">{getDashboardTitle()}</h1>
              {/* Botón de volver atrás */}
              <Button variant="ghost" size="sm" onClick={handleGoBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-2">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {isAdmin ? "Admin" : isDoctor ? "Dr. Juan Pérez" : "Téc. Carlos Gómez"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isAdmin
                          ? "admin@hospital.com"
                          : isDoctor
                            ? "juan.perez@hospital.com"
                            : "carlos.gomez@hospital.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-muted/40">{children}</main>
      </div>
    </div>
  )
}
