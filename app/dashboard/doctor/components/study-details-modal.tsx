"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Calendar,
  PersonStanding,
  Stethoscope,
  Wrench,
  FileText,
  Eye,
  Trash,
  Activity,
  AlertCircle,
  TrendingUp,
  BrainIcon,
} from "lucide-react"
import { deleteMedicalStudy, getStudyById, type MedicalStudy, type User } from "../../../lib/api"
import { toast } from "sonner"
import { usePathname } from "next/navigation"

interface StudyDetailsModalProps {
  study: MedicalStudy | null
  isOpen: boolean
  onClose: () => void
  onStudyDeleted?: () => void // Callback para refrescar la lista después de eliminar
}

// Interfaces actualizadas para el nuevo formato ML
interface NewMLResults {
  final_diagnosis?: string
  classification_level?: number
  details?: {
    binary_model_votes?: {
      predictions?: Record<string, number>
      probabilities?: Record<string, number[]>
      ensemble_confidence?: number
    }
    classification_details?: {
      was_classified?: boolean
      model_votes?: {
        predictions?: Record<string, number>
        probabilities?: Record<string, number[][]>
        predicted_class?: number
        ensemble_confidence?: number
      }
      final_level_assigned?: number
    }
  }
  explanations?: {
    binary_decision_factors?: any[]
    classification_factors?: any[]
    summary_insights?: {
      most_influential_features?: Array<{
        feature: string
        electrode: string
        metric: string
        status: string
        actual_value: number
        mentions_across_models: number
      }>
      clinical_insights?: string[]
      electrode_analysis?: {
        total_electrodes_affected: number
        electrodes_with_anomalies: string[]
        electrode_anomaly_details: Record<string, any>
      }
      statistical_summary?: {
        total_features_analyzed: number
        features_with_high_impact: number
        features_outside_normal: number
        average_z_score_magnitude: number
      }
      models_agreement?: any
    }
    metadata?: {
      explanation_method?: string
      explanation_timestamp?: string
      models_explained?: number
      interpretation_notes?: Record<string, string>
    }
  }
}

interface MLResultsDisplayProps {
  mlResults: string | NewMLResults | null
  patientName?: string
  studyDate?: string
}

// Componente mejorado para mostrar resultados ML - ACTUALIZADO PARA NUEVO FORMATO
const MLResultsDisplay = ({
  mlResults,
  patientName = "Paciente",
  studyDate = new Date().toLocaleDateString(),
}: MLResultsDisplayProps) => {
  if (!mlResults) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Cargando resultados de ML...</p>
        <p className="text-sm text-gray-500 mt-1">Obteniendo datos desencriptados</p>
      </div>
    )
  }

  // Si mlResults es string, parsearlo
  let results: NewMLResults | null
  try {
    results = typeof mlResults === "string" ? JSON.parse(mlResults) : mlResults
  } catch (error) {
    console.error("Error parsing ML results:", error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Error al interpretar los resultados del ML</p>
        <p className="text-sm text-red-600 mt-2">Formato de datos inválido</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border border-gray-200">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No hay resultados de ML disponibles</p>
        <p className="text-sm text-gray-500 mt-1">Los análisis están siendo procesados</p>
      </div>
    )
  }

  // Función para obtener el color según el nivel de severidad
  const getSeverityColor = (level: number): { bg: string; text: string; border: string } => {
    switch (level) {
      case 0:
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" }
      case 1:
        return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" }
      case 2:
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" }
      case 3:
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" }
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    }
  }

  // Función para obtener el ícono según el diagnóstico
  const getDiagnosisIcon = (diagnosis?: string): React.ReactNode => {
    if (diagnosis?.toLowerCase().includes("positivo")) {
      return <AlertCircle className="h-6 w-6 text-orange-600" />
    } else if (diagnosis?.toLowerCase().includes("negativo")) {
      return <Activity className="h-6 w-6 text-green-600" />
    }
    return <TrendingUp className="h-6 w-6 text-blue-600" />
  }

  // ADAPTACIÓN AL NUEVO FORMATO
  const classificationLevel = results.classification_level || 0
  const severityColors = getSeverityColor(classificationLevel)

  // Calcular confianza desde el nuevo formato
  const binaryConfidence = results.details?.binary_model_votes?.ensemble_confidence || 0
  const classifyConfidence = results.details?.classification_details?.model_votes?.ensemble_confidence || 0
  const overallConfidence = Math.round(((binaryConfidence + classifyConfidence) / 2) * 100)

  // Descripción de severidad basada en el nivel
  const getSeverityDescription = (level: number): string => {
    switch (level) {
      case 0:
        return "No se detectaron alteraciones significativas en la actividad electromiográfica."
      case 1:
        return "Se detectaron alteraciones leves que sugieren cambios iniciales en la actividad neuromuscular."
      case 2:
        return "Se identificaron alteraciones moderadas que indican posibles cambios patológicos en el sistema neuromuscular."
      case 3:
        return "Se encontraron alteraciones severas que sugieren patología neuromuscular significativa."
      default:
        return "Análisis completado con clasificación automática."
    }
  }

  return (
    <div className="space-y-6">


      {/* Diagnóstico Principal */}
      <div className={`${severityColors.bg} ${severityColors.border} border-2 rounded-xl p-6 shadow-sm`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getDiagnosisIcon(results.final_diagnosis)}
            <h4 className={`text-xl font-bold ${severityColors.text}`}>Diagnóstico Final</h4>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${severityColors.text}`}>{overallConfidence}%</div>
            <div className="text-sm text-gray-600 font-medium">Confianza</div>
          </div>
        </div>

        <div className="space-y-3">
          <p className={`text-lg font-semibold ${severityColors.text}`}>{results.final_diagnosis}</p>
          <p className="text-gray-700 leading-relaxed">{getSeverityDescription(classificationLevel)}</p>
        </div>
      </div>

      {/* Métricas de Confianza */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Barra de Confianza */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nivel de Confianza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overallConfidence}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">0%</span>
                <span className="font-bold text-blue-600">{overallConfidence}%</span>
                <span className="text-gray-500">100%</span>
              </div>
              {/* Mostrar confianzas separadas */}
              <div className="text-xs text-gray-600 space-y-1">
                <div>Detección: {Math.round(binaryConfidence * 100)}%</div>
                {classifyConfidence > 0 && (
                  <div>Clasificación: {Math.round(classifyConfidence * 100)}%</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clasificación */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Nivel de Clasificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div
                className={`${severityColors.bg} ${severityColors.text} ${severityColors.border} border-2 text-4xl font-bold px-6 py-4 rounded-2xl`}
              >
                {classificationLevel}
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-3 font-medium">Rango: 0 (Normal) - 3 (Severo)</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalles del Modelo - ADAPTADO AL NUEVO FORMATO */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Análisis por Modelos de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Votación Binaria - NUEVO FORMATO */}
            {results.details?.binary_model_votes?.predictions && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h6 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Detección
                </h6>
                <div className="space-y-2">
                  {Object.entries(results.details.binary_model_votes.predictions).map(([model, vote]) => (
                    <div key={model} className="flex justify-between items-center py-1">
                      <span className="capitalize text-gray-700 font-medium">
                        {model.replace(/_/g, " ")}:
                      </span>
                      <Badge variant={Number(vote) === 1 ? "destructive" : "default"} className="font-medium">
                        {Number(vote) === 1 ? "Positivo" : "Negativo"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Confianza:</span>
                  <span className="font-bold text-blue-600">
                    {Math.round(binaryConfidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Clasificación por Severidad - NUEVO FORMATO */}
            {results.details?.classification_details?.model_votes?.predictions && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                <h6 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Severidad
                </h6>
                <div className="space-y-2">
                  {Object.entries(results.details.classification_details.model_votes.predictions).map(([model, vote]) => (
                    <div key={model} className="flex justify-between items-center py-1">
                      <span className="capitalize text-gray-700 font-medium">
                        {model.replace(/_/g, " ")}:
                      </span>
                      <Badge variant="outline" className={`font-medium ${getSeverityColor(Number(vote)).text}`}>
                        Nivel {vote}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Confianza:</span>
                  <span className="font-bold text-purple-600">
                    {Math.round(classifyConfidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Explicaciones SHAP (si están disponibles) */}
      {results.explanations && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BrainIcon className="h-5 w-5" />
              Explicabilidad del Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Insights Clínicos */}
              {results.explanations.summary_insights?.clinical_insights?.length && results.explanations.summary_insights.clinical_insights.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <h6 className="font-semibold text-gray-800 mb-3">Interpretación Clínica</h6>
                  <ul className="space-y-2">
                    {results.explanations.summary_insights.clinical_insights.map((insight: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Características Más Influyentes */}
              {results.explanations.summary_insights?.most_influential_features?.length && results.explanations.summary_insights.most_influential_features.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100">
                  <h6 className="font-semibold text-gray-800 mb-3">Características Clave</h6>
                  <div className="space-y-2">
                    {results.explanations.summary_insights.most_influential_features.slice(0, 5).map((feature: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          {feature.metric} ({feature.electrode})
                        </span>
                        <Badge variant={feature.status === 'normal' ? 'default' : 'destructive'} className="text-xs">
                          {feature.status === 'normal' ? 'Normal' : 'Anómalo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Electrodos Afectados */}
              {results.explanations.summary_insights?.electrode_analysis?.electrodes_with_anomalies?.length && results.explanations.summary_insights.electrode_analysis.electrodes_with_anomalies.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                  <h6 className="font-semibold text-gray-800 mb-3">Electrodos con Anomalías</h6>
                  <div className="flex flex-wrap gap-2">
                    {results.explanations.summary_insights.electrode_analysis.electrodes_with_anomalies.map((electrode: string) => (
                      <Badge key={electrode} variant="destructive" className="text-xs">
                        {electrode}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Total de electrodos afectados: {results.explanations.summary_insights.electrode_analysis.total_electrodes_affected}
                  </p>
                </div>
              )}

              {/* Si no hay explicaciones disponibles */}
              {(!results.explanations.summary_insights?.clinical_insights?.length &&
                !results.explanations.summary_insights?.most_influential_features?.length &&
                !results.explanations.summary_insights?.electrode_analysis?.electrodes_with_anomalies?.length) && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                    <BrainIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Las explicaciones del modelo están siendo procesadas.
                    </p>
                  </div>
                )}

              {/* Metadatos del Análisis */}
              {results.explanations.metadata && (
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Método:</strong> {results.explanations.metadata.explanation_method || 'SHAP'}</div>
                    <div><strong>Timestamp:</strong> {results.explanations.metadata.explanation_timestamp ? new Date(results.explanations.metadata.explanation_timestamp).toLocaleString('es-ES') : 'No disponible'}</div>
                    <div><strong>Modelos analizados:</strong> {results.explanations.metadata.models_explained || 0}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function StudyDetailsModal({ study, isOpen, onClose, onStudyDeleted }: StudyDetailsModalProps) {
  const [doctor, setDoctor] = useState<User | null>(null)
  const [patient, setPatient] = useState<User | null>(null)
  const [technician, setTechnician] = useState<User | null>(null)
  const [detailedStudy, setDetailedStudy] = useState<MedicalStudy | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showRawResults, setShowRawResults] = useState(false)
  const pathname = usePathname()

  // Determinar el rol del usuario basado en la ruta
  const isAdmin = pathname.includes("/admin")
  const isDoctor = pathname.includes("/doctor")
  const isTechnician = pathname.includes("/technician")

  // Cargar datos completos de los usuarios cuando se abre el modal
  useEffect(() => {
    if (study && isOpen) {
      loadUserDetails()
    }
  }, [study, isOpen])

  const loadUserDetails = async () => {
    if (!study) return

    setLoading(true)
    try {

      try {
        const fullStudy = await getStudyById(study.id)
        setDetailedStudy(fullStudy)
        if (fullStudy.doctor) setDoctor(fullStudy.doctor as User)
        else if (study.doctor) setDoctor(study.doctor as User)

        if (fullStudy.patient) setPatient(fullStudy.patient as User)
        else if (study.patient) setPatient(study.patient as User)

        if (fullStudy.technician) setTechnician(fullStudy.technician as User)
        else if (study.technician) setTechnician(study.technician as User)
        else setTechnician(null)

      } catch (err) {
        console.error("Error fetching full study details:", err)
        if (study.doctor) setDoctor(study.doctor as User)
        if (study.patient) setPatient(study.patient as User)
        if (study.technician) setTechnician(study.technician as User)
      }
    } catch (error) {
      console.error("Error setting user data:", error)
      toast.error("Error al cargar los detalles del estudio")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!study) return

    setDeleting(true)
    try {
      await deleteMedicalStudy(study.id)
      toast.success("Estudio médico eliminado exitosamente")

      // Llamar al callback para refrescar la lista
      if (onStudyDeleted) {
        onStudyDeleted()
      }

      // Cerrar el modal
      handleClose()
    } catch (error) {
      console.error("Error eliminando estudio:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el estudio")
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setDoctor(null)
    setPatient(null)
    setTechnician(null)
    setDetailedStudy(null)
    setShowRawResults(false)
    onClose()
  }

  const handleViewDetailedResults = () => {
    if (!study) return
    if (!study.ml_results && !detailedStudy?.ml_results) return

    try {
      let results = detailedStudy?.ml_results

      if (typeof results === "string") {
        try {
          results = JSON.parse(results)
        } catch (e) {
          console.error("Error parsing detailed results:", e)
        }
      }

      if (!results && study.ml_results) {
        results = typeof study.ml_results === "string" ? JSON.parse(study.ml_results) : study.ml_results
      }

      const jsonWindow = window.open("", "_blank")

      if (!jsonWindow) {
        toast.error("No se pudo abrir la ventana. Verifica que no esté bloqueada por el navegador.")
        return
      }

      jsonWindow.document.write(`
        <html>
          <head>
            <title>Resultados Detallados ML - ${study.access_code}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                padding: 20px; 
                background: #f8fafc; 
                margin: 0;
              }
              .header {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .json-container {
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                overflow: auto;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              pre {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                line-height: 1.4;
                margin: 0;
              }
              .patient-info {
                color: #64748b;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Resultados Completos del Modelo ML</h1>
              <div class="patient-info">
                <strong>Paciente:</strong> ${study.patient?.name} ${study.patient?.last_name}<br>
                <strong>Código de Acceso:</strong> ${study.access_code}<br>
                <strong>Fecha:</strong> ${new Date(study.created_at || study.created_at).toLocaleDateString("es-ES")}
              </div>
            </div>
            <div class="json-container">
              <pre>${JSON.stringify(results, null, 2)}</pre>
            </div>
          </body>
        </html>
      `)
    } catch (error) {
      toast.error("Error al abrir los resultados detallados")
    }
  }

  if (!study) return null

  const getCreationDate = () => {
    return study.created_at || (study as any).creation_date || null
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === null || dateString === undefined || dateString === "") {
      return "Fecha no disponible"
    }

    try {
      const date = new Date(dateString)

      if (isNaN(date.getTime())) {
        return "Fecha inválida"
      }

      if (date.getTime() < 946684800000) {
        return "Fecha incorrecta"
      }

      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Error en fecha"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default"
      case "PENDING":
        return "outline"
      default:
        return "secondary"
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detalles del Estudio Médico</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando detalles del estudio...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Código de Acceso</p>
                    <p className="text-lg font-mono font-bold">{study.access_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge variant={getStatusColor(study.status)} className="mt-1">
                      {getStatusText(study.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(getCreationDate())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID del Estudio</p>
                    <p className="font-mono text-sm">{study.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PersonStanding className="h-5 w-5" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                    <p className="text-lg font-medium">
                      {patient?.name || study.patient?.name} {patient?.last_name || study.patient?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">DNI</p>
                    <p className="font-mono">{patient?.dni || study.patient?.dni || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{patient?.email || study.patient?.email || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID del Paciente</p>
                    <p className="font-mono text-sm">{patient?.id || study.patient?.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Doctor */}
            {(doctor || study.doctor) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Doctor Solicitante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                      <p className="text-lg font-medium">
                        Dr. {doctor?.name || study.doctor?.name} {doctor?.last_name || study.doctor?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">DNI</p>
                      <p className="font-mono">{doctor?.dni || study.doctor?.dni || "No disponible"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{doctor?.email || study.doctor?.email || "No disponible"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID del Doctor</p>
                      <p className="font-mono text-sm">{doctor?.id || study.doctor?.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del Técnico */}
            {technician || study.technician ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Técnico Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                      <p className="text-lg font-medium">
                        {technician?.name || study.technician?.name}{" "}
                        {technician?.last_name || study.technician?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">DNI</p>
                      <p className="font-mono">{technician?.dni || study.technician?.dni || "No disponible"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{technician?.email || study.technician?.email || "No disponible"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID del Técnico</p>
                      <p className="font-mono text-sm">{technician?.id || study.technician?.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Técnico Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No hay técnico asignado para este estudio.</p>
                </CardContent>
              </Card>
            )}

            {/* Datos Clínicos */}
            <Card>
              <CardHeader>
                <CardTitle>Datos Clínicos</CardTitle>
              </CardHeader>
              <CardContent>
                {study.clinical_data ? (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{study.clinical_data}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No se han registrado datos clínicos para este estudio.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Resultados del Modelo ML
                  {study.ml_results && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleViewDetailedResults}>
                        <Eye className="mr-2 h-4 w-4" />
                        Abrir Detallado
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {study.ml_results ? (
                  (
                    // Vista interpretada con nuestro componente mejorado
                    <MLResultsDisplay
                      mlResults={detailedStudy?.ml_results || null}
                      patientName={`${study.patient?.name} ${study.patient?.last_name}`}
                      studyDate={formatDate(getCreationDate())}
                    />
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Los resultados del modelo ML aún no están disponibles.</p>
                    <Badge variant="outline">Procesando...</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Botones de Acción */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={deleting}>
                  Cerrar
                </Button>
              </div>

              {/* Botón de Eliminar con Confirmación - Solo para administradores */}
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      <Trash className="mr-2 h-4 w-4" />
                      {deleting ? "Eliminando..." : "Eliminar Estudio"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente el estudio médico con código{" "}
                        <strong>{study?.access_code}</strong>. Esta acción no se puede deshacer.
                        <br />
                        <br />
                        <strong>Paciente:</strong> {study?.patient.name} {study?.patient.last_name}
                        <br />
                        <strong>DNI:</strong> {study?.patient.dni}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}