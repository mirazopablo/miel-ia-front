"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getMedicalStudies, performDiagnosis, deleteMedicalStudy, type MedicalStudy } from "../../lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  FileIcon,
  SearchIcon,
  UserIcon,
  ClipboardListIcon,
  BarChart3Icon,
  UploadIcon,
  BrainIcon,
  Loader2Icon,
  PlusIcon,
  Eye,
  Trash,
  AlertCircle,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import StudyDetailsModal from "./components/study-details-modal"
import { toast } from "sonner"

export default function DoctorDashboard() {
  const [studies, setStudies] = useState<MedicalStudy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedStudy, setSelectedStudy] = useState<MedicalStudy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false)
  const [diagnosisStudy, setDiagnosisStudy] = useState<MedicalStudy | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [diagnosing, setDiagnosing] = useState(false)

  const [studyToDelete, setStudyToDelete] = useState<MedicalStudy | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

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

  useEffect(() => {
    loadData()
  }, [])

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
    positive: studies.filter((s) => {
      if (!s.ml_results) return false
      try {
        const parsed = JSON.parse(s.ml_results)
        return parsed.final_diagnosis?.includes("Positivo")
      } catch {
        return s.ml_results.includes("Positivo")
      }
    }).length,
  }

  const handleViewStudy = (study: MedicalStudy) => {
    setSelectedStudy(study)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudy(null)
  }

  // Funciones para eliminar
  const handleDeleteClick = (study: MedicalStudy) => {
    setStudyToDelete(study)
  }

  const handleConfirmDelete = async () => {
    if (!studyToDelete) return

    setDeleting(true)
    try {
      await deleteMedicalStudy(studyToDelete.id)
      toast.success("Estudio médico eliminado exitosamente")

      // Actualizar la lista localmente
      setStudies(studies.filter((s) => s.id !== studyToDelete.id))
      setStudyToDelete(null)
    } catch (error: any) {
      console.error("Error deleting study:", error)

      // Si el error es 401, lo dejamos pasar (el interceptor o la lógica de sesión lo manejará)
      if (error.response?.status === 401) {
        return
      }

      // Para cualquier otro error, mostramos el modal
      const message = error.response?.data?.detail || error.message || "Ha ocurrido un error inesperado al eliminar el estudio."
      setErrorMessage(message)
      setStudyToDelete(null) // Cerramos el modal de confirmación
      setErrorModalOpen(true)
    } finally {
      setDeleting(false)
    }
  }

  // Funciones para el diagnóstico
  const handleDiagnoseStudy = (study: MedicalStudy) => {
    setDiagnosisStudy(study)
    setIsDiagnosisModalOpen(true)
  }

  const handleCloseDiagnosisModal = () => {
    setIsDiagnosisModalOpen(false)
    setDiagnosisStudy(null)
    setCsvFile(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setCsvFile(file)
      } else {
        toast.error("Por favor seleccione un archivo CSV válido")
        event.target.value = ""
      }
    }
  }

  const handleSubmitDiagnosis = async () => {
    if (!diagnosisStudy || !csvFile) {
      toast.error("Por favor seleccione un archivo CSV")
      return
    }

    setDiagnosing(true)
    try {
      const formData = new FormData()
      formData.append("file", csvFile)
      formData.append("user_id", "a4dc7d7c-1e21-4ebc-ae4f-97db47c6a09f") // TODO: Obtener del usuario actual logueado

      await performDiagnosis(diagnosisStudy.id, formData)

      toast.success("Diagnóstico realizado exitosamente")
      handleCloseDiagnosisModal()
      loadData() // Recargar datos para mostrar el resultado
    } catch (error: any) {
      console.error("Error performing diagnosis:", error)
      const status = error.response?.status
      const message = error.response?.data?.detail || error.message

      if (status === 400) {
        toast.error(`Archivo CSV inválido: ${message}`)
      } else if (status === 404) {
        toast.error("Estudio no encontrado")
      } else if (status === 409) {
        toast.error("El estudio ya ha sido completado")
      } else if (status === 422) {
        toast.error("Datos del formulario incorrectos. Verifique el archivo CSV.")
      } else {
        toast.error(`Error al realizar el diagnóstico: ${message}`)
      }
    } finally {
      setDiagnosing(false)
    }
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
    const dateString = study.created_at || (study as any).created_at

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
        <h1 className="text-3xl font-bold mb-6">Panel de Control - Médico</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resultados Positivos</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.positive}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="studies" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="studies">Mis Estudios</TabsTrigger>
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
                    {/* Button for creating a new study */}
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
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <Loader2Icon className="h-4 w-4 animate-spin mx-auto mb-2" />
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
                            <TableCell>{getStudyDate(study)}</TableCell>
                            <TableCell>
                              <Badge variant={study.status === "COMPLETED" ? "default" : "outline"}>
                                {getStatusText(study.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {study.status === "PENDING" ? (
                                  <Button variant="secondary" size="sm" onClick={() => handleDiagnoseStudy(study)}>
                                    <BrainIcon className="h-4 w-4 mr-1" />
                                    Diagnosticar
                                  </Button>
                                ) : (
                                  <Button size="sm" onClick={() => handleViewStudy(study)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteClick(study)}
                                  className="bg-red-500 hover:bg-red-600 border-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Eliminar
                                </Button>
                              </div>
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
                  Aquí podrá gestionar los pacientes asociados a sus estudios médicos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Confirmación de Eliminación */}
        <AlertDialog open={!!studyToDelete} onOpenChange={(open) => !open && setStudyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar este estudio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el estudio del paciente{" "}
                <strong>{studyToDelete?.patient.name} {studyToDelete?.patient.last_name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirmDelete()
                }}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Detalles del Estudio - Sin opción de eliminar */}
        <StudyDetailsModal study={selectedStudy} isOpen={isModalOpen} onClose={handleCloseModal} />

        {/* Modal de Diagnóstico */}
        <Dialog open={isDiagnosisModalOpen} onOpenChange={handleCloseDiagnosisModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BrainIcon className="h-5 w-5" />
                Realizar Diagnóstico
              </DialogTitle>
              <DialogDescription>
                Seleccione el archivo CSV con los datos del electromiograma para realizar el diagnóstico automático.
              </DialogDescription>
            </DialogHeader>

            {diagnosisStudy && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Estudio a diagnosticar:</p>
                  <p className="text-sm text-muted-foreground">
                    {diagnosisStudy.access_code} - {diagnosisStudy.patient.name} {diagnosisStudy.patient.last_name}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csv-file">Archivo CSV</Label>
                  <div className="flex items-center gap-2">
                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={diagnosing} />
                    <UploadIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {csvFile && (
                    <p className="text-xs text-muted-foreground">
                      Archivo seleccionado: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Importante:</strong> El archivo CSV debe contener las 72 características de EMG esperadas
                    por el modelo. El proceso puede tardar algunos segundos.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleCloseDiagnosisModal} disabled={diagnosing}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitDiagnosis} disabled={!csvFile || diagnosing}>
                {diagnosing ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <BrainIcon className="mr-2 h-4 w-4" />
                    Realizar Diagnóstico
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Modal de Error */}
        <AlertDialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error al Eliminar
              </AlertDialogTitle>
              <AlertDialogDescription>
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorModalOpen(false)}>
                Entendido
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </DashboardLayout>
  )
}
