"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Stethoscope, Wrench, PersonStanding, UserPlus, FileText } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { UsersTable } from "./users_table"
import {
  getUsers,
  getMedicalStudies,
  type User,
  type MedicalStudy,
  createUser,
  type CreateUserRequest,
} from "../../lib/api"
import { useRouter } from "next/navigation"
import CreateUserModal from "./create_user_modal"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import StudyDetailsModal from "../doctor/components/study-details-modal"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [studies, setStudies] = useState<MedicalStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStudies, setLoadingStudies] = useState(true)
  const [error, setError] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError("Error al cargar usuarios")
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudies = async () => {
    try {
      setLoadingStudies(true)
      const data = await getMedicalStudies()
      setStudies(data)
    } catch (err) {
      console.error("Error loading studies:", err)
      toast.error("Error al cargar los estudios")
    } finally {
      setLoadingStudies(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchStudies()
  }, [])

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await createUser(userData)
      // Recargar la lista de usuarios después de crear uno nuevo
      await fetchUsers()
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error creating user:", error)
      throw error // Re-throw para que el modal pueda manejar el error
    }
  }

  const handleUserDeleted = () => {
    fetchUsers()
  }

  const handleViewStudy = (study: MedicalStudy) => {
    setSelectedStudy(study)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudy(null)
  }

  const handleStudyDeleted = () => {
    fetchStudies()
  }

  const filteredStudies = studies.filter(
    (study) =>
      `${study.patient?.name || ""} ${study.patient?.last_name || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (study.patient?.dni || "").includes(searchTerm) ||
      (study.access_code || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completado"
      case "PENDING":
        return "Pendiente"
      default:
        return status
    }
  }

  const getStudyDate = (study: MedicalStudy) => {
    const dateString = study.creation_date || (study as any).created_at

    if (!dateString) {
      return "Fecha no disponible"
    }

    try {
      return new Date(dateString).toLocaleDateString("es-ES")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha inválida"
    }
  }

  if (loading && loadingStudies) {
    return (
      <DashboardLayout>
        <div className="p-6">Cargando...</div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    )
  }

  const stats = {
    totalUsers: users.length,
    doctors: users.filter((u) => u.roles.some((role) => role.name === "DOCTOR")).length,
    patients: users.filter((u) => u.roles.some((role) => role.name === "PATIENT")).length,
    technicians: users.filter((u) => u.roles.some((role) => role.name === "TECHNICIAN")).length,
    totalStudies: studies.length,
    completedStudies: studies.filter((s) => s.status === "COMPLETED").length,
    pendingStudies: studies.filter((s) => s.status === "PENDING").length,
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/doctor">
                <Stethoscope className="h-4 w-4 mr-2" />
                Ver Panel Médico
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/technician">
                <Wrench className="h-4 w-4 mr-2" />
                Ver Panel Técnico
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Médicos</CardTitle>
              <Stethoscope className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.doctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              <PersonStanding className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
              <Wrench className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.technicians}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="studies">Estudios Médicos</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTable users={users} onUserDeleted={handleUserDeleted} />
          </TabsContent>

          <TabsContent value="studies">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CardTitle>Estudios Médicos</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{stats.totalStudies} Total</Badge>
                      <Badge variant="default">{stats.completedStudies} Completados</Badge>
                      <Badge variant="secondary">{stats.pendingStudies} Pendientes</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar estudios..."
                        className="pl-8 w-full sm:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button asChild>
                      <Link href="/dashboard/doctor/studies/new">
                        <FileText className="h-4 w-4 mr-2" />
                        Nuevo Estudio
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingStudies ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            Cargando estudios...
                          </TableCell>
                        </TableRow>
                      ) : filteredStudies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            No se encontraron estudios
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudies.map((study) => (
                          <TableRow key={study.id}>
                            <TableCell className="font-medium">{study.access_code}</TableCell>
                            <TableCell>{`${study.patient?.name || ""} ${study.patient?.last_name || ""}`}</TableCell>
                            <TableCell>{study.patient?.dni || ""}</TableCell>
                            <TableCell>
                              {study.doctor ? `Dr. ${study.doctor.name} ${study.doctor.last_name}` : "No asignado"}
                            </TableCell>
                            <TableCell>{getStudyDate(study)}</TableCell>
                            <TableCell>
                              <Badge variant={study.status === "COMPLETED" ? "default" : "outline"}>
                                {getStatusText(study.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleViewStudy(study)}>
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateUser={handleCreateUser}
        />

        {/* Modal de Detalles del Estudio */}
        <StudyDetailsModal
          study={selectedStudy}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStudyDeleted={handleStudyDeleted}
        />
      </div>
    </DashboardLayout>
  )
}
