"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Shield, Stethoscope, UserIcon, Activity } from "lucide-react"
import { CreateUserRequest, getRoles, RoleResponseDTO } from "../../lib/api"
import { Card, CardContent } from "@/components/ui/card"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (userData: CreateUserRequest) => Promise<void>
}

// Mapeo amigable para los roles en español
const ROLE_UI_MAP: Record<string, { label: string, icon: React.ReactNode, description: string }> = {
  admin: { label: "Administrador", icon: <Shield className="h-6 w-6 mb-2" />, description: "Acceso total al sistema" },
  doctor: { label: "Médico", icon: <Stethoscope className="h-6 w-6 mb-2" />, description: "Gestión de diagnósticos y pacientes" },
  patient: { label: "Paciente", icon: <UserIcon className="h-6 w-6 mb-2" />, description: "Acceso a sus propios estudios" },
  technician: { label: "Técnico", icon: <Activity className="h-6 w-6 mb-2" />, description: "Carga de estudios médicos" },
}

export default function CreateUserModal({ isOpen, onClose, onCreateUser }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    email: "",
    password: "",
    dni: "",
    last_name: "",
    role_id: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [roles, setRoles] = useState<RoleResponseDTO[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRoles()
    }
  }, [isOpen])

  const loadRoles = async () => {
    try {
      setRolesLoading(true)
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      console.error("Error cargando roles", err)
      setError("No se pudieron cargar los roles disponibles.")
    } finally {
      setRolesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.role_id) {
      setError("Debe seleccionar un rol para el usuario.")
      return
    }
    setLoading(true)
    setError("")

    try {
      await onCreateUser(formData)
      handleClose()
    } catch (err: any) {
      setError(err.message || "Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      dni: "",
      last_name: "",
      role_id: "",
    })
    setError("")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Crear Nuevo Usuario</SheetTitle>
          <SheetDescription>Complete los datos para crear un nuevo usuario en el sistema.</SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
                maxLength={50}
                pattern="^[a-zA-Z0-9 ]+$"
                title="El nombre debe contener solo letras, números y espacios"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
                minLength={8}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                maxLength={100}
                title="La contraseña debe tener al menos 8 caracteres"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Seleccionar Rol *</Label>
            {rolesLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Cargando roles...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => {
                  const normalizedName = role.name.toLowerCase()
                  const uiData = ROLE_UI_MAP[normalizedName] || { 
                    label: role.name, 
                    icon: <UserIcon className="h-6 w-6 mb-2" />, 
                    description: "Rol del sistema"
                  }
                  
                  return (
                    <Card 
                      key={role.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${formData.role_id === role.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => setFormData({ ...formData, role_id: role.id })}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className={formData.role_id === role.id ? 'text-primary' : 'text-muted-foreground'}>
                          {uiData.icon}
                        </div>
                        <div className="font-semibold text-sm">{uiData.label}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{uiData.description}</div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <SheetFooter className="mt-8">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || rolesLoading}>
              {loading ? "Creando..." : "Crear Usuario"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
