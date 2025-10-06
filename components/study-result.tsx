// /src/components/study-result.tsx - COMPLETO Y CORREGIDO

"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getUserById } from "../app/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  CheckCircle,
  AlertCircle,
  Download,
  ArrowLeft
} from "lucide-react"

interface StudyResultProps {
  study: {
    id: string
    patientName: string // Este ya viene listo desde el componente padre
    patientDni: string
    creationDate: string
    status: string
    mlResults: {
      prediction: string
      confidence: number
      details: string
      recommendations: string
    } | null
    doctorName: string | null // Lo usamos como fallback
    doctorId: number          // Lo usamos para el fetch
  }
  onBack: () => void
}

export default function StudyResult({ study, onBack }: StudyResultProps) {
  const isPositive = study.mlResults?.prediction === "Positivo"
  const [doctorFullName, setDoctorFullName] = useState<string | null>(null)

  useEffect(() => {
    // Log para ver con qué datos se renderiza este componente.

    const fetchDoctor = async () => {
      // Log para verificar el ID del doctor antes de hacer la llamada.

      if (study.doctorId === -1) {
        setDoctorFullName(study.doctorName ?? "Desconocido")
        return;
      }
      
      try {
        const doctor = await getUserById(study.doctorId)
        setDoctorFullName(`${doctor.name} ${doctor.last_name ?? ""}`.trim())
      } catch (error) {
        // Log para ver el error completo en la consola del navegador.
        setDoctorFullName(study.doctorName ?? "Desconocido")
      }
    }

    fetchDoctor()
  }, [study.doctorId, study.doctorName, study]) // Agregué `study` para que los logs se ejecuten si el objeto cambia.

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Resultado del Estudio</CardTitle>
            <CardDescription>Código: #{study.id}</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Información del paciente */}
        <div className="space-y-2">
            <h3 className="text-lg font-medium">Información del Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{study.patientName}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">DNI</p>
                    <p className="font-medium">{study.patientDni}</p>
                </div>
            </div>
        </div>

        {/* Información del estudio */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Información del Estudio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de creación</p>
              <p className="font-medium">{study.creationDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-medium">{study.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Médico responsable</p>
              <p className="font-medium">{doctorFullName ?? "Cargando..."}</p>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resultados del Modelo</h3>

          {study.mlResults ? (
            <>
              <div className="flex items-center p-4 rounded-lg bg-muted">
                {isPositive ? (
                  <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                )}
                <div>
                  <p className="font-bold text-lg">Predicción: {study.mlResults.prediction}</p>
                  <p className="text-sm text-muted-foreground">
                    Confianza: {(study.mlResults.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Detalles</h4>
                <p className="text-muted-foreground">{study.mlResults.details}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recomendaciones</h4>
                <p className="text-muted-foreground">{study.mlResults.recommendations}</p>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-lg bg-muted text-center text-muted-foreground">
              No hay resultados de modelo disponibles para este estudio.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Descargar informe
        </Button>
      </CardFooter>
    </Card>
  )
}