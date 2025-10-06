"use client"

import { useState, useEffect } from "react"
import { getMedicalStudies, type MedicalStudy } from "../../lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileIcon, SearchIcon, PlusIcon, UserIcon, ClipboardListIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import StudyDetailsModal from "../doctor/components/study-details-modal"
import { toast } from "sonner"

export default function TechnicianDashboard() {
  const [studies, setStudies] = useState<MedicalStudy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const fetchedStudies = await getMedicalStudies()
      setStudies(fetchedStudies)
    } catch (error) {
      console.error("Error loading studies:", error)
      toast.error("Error al cargar los estudios")
    } finally {
      setLoading(false)
    }
  }

  const filteredStudies = studies.filter(
    (study) =>
      `${study.patient.name} ${study.patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.patient.dni.includes(searchTerm) ||
      study.access_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    total: studies.length,
    completed: studies.filter((s) => s.status === "COMPLETED").length,
    pending: studies.filter((s) => s.status === "PENDING").length,
  }

  const handleViewStudy = (study: MedicalStudy) => {
    setSelectedStudy(study)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudy(null)
  }

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

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Panel de Control - Técnico</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Estudios</CardTitle>
              <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <FileIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="studies" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="studies">Estudios</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
          </TabsList>

          <TabsContent value="studies">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Estudios Médicos</CardTitle>
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
                        <PlusIcon className="h-4 w-4 mr-2" />
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
                      {loading ? (
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
                            <TableCell>{`${study.patient.name} ${study.patient.last_name}`}</TableCell>
                            <TableCell>{study.patient.dni}</TableCell>
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

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aquí podrá gestionar los pacientes asociados a los estudios médicos.
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/dashboard/admin">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Crear Nuevo Paciente
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalles del Estudio - Sin opción de eliminar */}
        <StudyDetailsModal study={selectedStudy} isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </DashboardLayout>
  )
}
