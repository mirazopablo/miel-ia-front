"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Calendar, User, Stethoscope, Eye, FileText, Activity, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { searchStudiesByPatientDni, type MedicalStudy } from "../../lib/api"

// Interfaces para los tipos de ML
interface MLResults {
  final_diagnosis?: string
  classification_level?: number
  severity_description?: string
  confidence_percentage?: number
  confidence_score?: number
  details?: {
    binary_model_votes?: Record<string, number>
    binary_ensemble_confidence?: number
    classification_details?: {
      model_votes?: Record<string, number>
      ensemble_confidence?: number
    }
  }
  process_metadata?: {
    models_used?: {
      binary?: string[]
      classification?: string[]
    }
    voting_threshold?: string
    confidence_calculation?: string
  }
}

interface MLResultsDisplayProps {
  mlResults: string | MLResults | null
  patientName?: string
  studyDate?: string
}



// Componente para mostrar resultados ML con diseño mejorado
const MLResultsDisplay = ({
  mlResults,
  patientName = "Paciente",
  studyDate = new Date().toLocaleDateString(),
}: MLResultsDisplayProps) => {
  let results: MLResults | null
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

  const confidencePercentage = results.confidence_percentage || 0
  const classificationLevel = results.classification_level || 0
  const severityColors = getSeverityColor(classificationLevel)

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
            <div className={`text-3xl font-bold ${severityColors.text}`}>{confidencePercentage}%</div>
            <div className="text-sm text-gray-600 font-medium">Confianza</div>
          </div>
        </div>

        <div className="space-y-3">
          <p className={`text-lg font-semibold ${severityColors.text}`}>{results.final_diagnosis}</p>
          <p className="text-gray-700 leading-relaxed">{results.severity_description}</p>
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
              <Progress value={confidencePercentage} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">0%</span>
                <span className="font-bold text-blue-600">{confidencePercentage}%</span>
                <span className="text-gray-500">100%</span>
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

      {/* Detalles del Modelo */}
      {results.details && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Análisis por Modelos de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Votación Binaria */}
              {results.details.binary_model_votes && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <h6 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Detección
                  </h6>
                  <div className="space-y-2">
                    {Object.entries(results.details.binary_model_votes).map(([model, vote]) => (
                      <div key={model} className="flex justify-between items-center py-1">
                        <span className="capitalize text-gray-700 font-medium">{model.replace("_", " ")}:</span>
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
                      {((results.details.binary_ensemble_confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Clasificación por Severidad */}
              {results.details.classification_details && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <h6 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Severidad
                  </h6>
                  <div className="space-y-2">
                    {Object.entries(results.details.classification_details.model_votes || {}).map(([model, vote]) => (
                      <div key={model} className="flex justify-between items-center py-1">
                        <span className="capitalize text-gray-700 font-medium">{model.replace("_", " ")}:</span>
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
                      {((results.details.classification_details.ensemble_confidence || 0) * 100).toFixed(1)}%
                    </span>
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

// Componente para mostrar un estudio individual con diseño mejorado
const StudyCard = ({
  study,
  onViewDetailed,
}: { study: MedicalStudy; onViewDetailed: (study: MedicalStudy) => void }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      
    } catch {
      return "Fecha no disponible"
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
    <Card className="w-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      {/* Header del Estudio - Mejorado */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-slate-200 pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-1">Estudio Médico</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Código de acceso:{" "}
                  <span className="font-mono font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-md ml-1">
                    {study.access_code}
                  </span>
                </CardDescription>
              </div>
            </div>
          </div>
          <Badge variant={getStatusColor(study.status)} className="text-sm px-4 py-2 font-semibold">
            {getStatusText(study.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-8">
        {/* Información del Paciente - Mejorado */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Información del Paciente</h4>
          </div>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Nombre completo</span>
                  <p className="text-lg font-bold text-slate-800">
                    {study.patient.name} {study.patient.last_name}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">DNI</span>
                  <p className="text-lg font-mono font-bold text-slate-800 bg-white px-3 py-2 rounded-md border">
                    {study.patient.dni}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Doctor - Mejorado */}
        {study.doctor && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Doctor Solicitante</h4>
            </div>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                      Nombre completo
                    </span>
                    <p className="text-lg font-bold text-slate-800">
                      Dr. {study.doctor.name} {study.doctor.last_name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Email</span>
                    <p className="text-lg font-semibold text-slate-800 bg-white px-3 py-2 rounded-md border">
                      {study.doctor.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fecha de Creación - Mejorado */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Fecha de Creación</h4>
          </div>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 shadow-sm">
            <CardContent className="p-6">
              <p className="text-lg font-bold text-slate-800">{formatDate(study.created_at)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Datos Clínicos - Mejorado */}
        {study.clinical_data && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Datos Clínicos</h4>
            </div>
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-100 shadow-sm">
              <CardContent className="p-6">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">{study.clinical_data}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator className="my-8 border-slate-200" />

        {/* Resultados ML - Mejorado */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800">Resultados del Análisis</h4>
          </div>
          {study.ml_results ? (
            <MLResultsDisplay
              mlResults={study.ml_results}
              patientName={`${study.patient.name} ${study.patient.last_name}`}
              studyDate={formatDate(study.created_at)}
            />
          ) : (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-sm">
              <CardContent className="text-center py-12">
                <Loader2 className="h-16 w-16 text-amber-500 mx-auto mb-6 animate-spin" />
                <p className="text-amber-700 font-bold text-lg mb-3">
                  Los resultados del análisis aún no están disponibles.
                </p>
                <Badge variant="outline" className="bg-white px-4 py-2 text-base font-semibold">
                  Procesando...
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>

      {study.ml_results && (
        <CardFooter className="bg-gradient-to-r from-slate-50 to-gray-50 border-t-2 border-slate-200 p-6">
          <Button
            onClick={() => onViewDetailed(study)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Eye className="mr-3 h-6 w-6" />
            Ver Resultado Detallado
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default function ConsultaEstudio() {
  const [dni, setDni] = useState("")
  const [accessCodeInput, setAccessCodeInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [studies, setStudies] = useState<MedicalStudy[] | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setStudies(null)

    try {
      if (!dni.trim() || !accessCodeInput.trim()) {
        throw new Error("Por favor complete todos los campos")
      }

      // Fusionar MLP_ con lo que ingresó el usuario
      const fullAccessCode = `MLP_${accessCodeInput.trim()}`

      const foundStudies = await searchStudiesByPatientDni(dni.trim(), fullAccessCode)

      if (foundStudies.length === 0) {
        throw new Error("No se encontraron estudios con los datos proporcionados")
      }

      setStudies(foundStudies)
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("Los datos ingresados no son válidos. Verifique e intente nuevamente.")
      } else if (err.response?.status === 404) {
        setError("No se encontraron estudios con los datos proporcionados. Verifique su DNI y código de acceso.")
      } else if (err.response?.status === 429) {
        setError("Demasiados intentos. Por favor espere unos minutos antes de intentar nuevamente.")
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Error al consultar el estudio. Intente nuevamente más tarde.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStudies(null)
    setError("")
  }

  const handleViewDetailed = (study: MedicalStudy) => {
    if (!study.ml_results) return

    try {
      const results = typeof study.ml_results === "string" ? JSON.parse(study.ml_results) : study.ml_results
      const jsonWindow = window.open("", "_blank")

      if (!jsonWindow) {
        setError("No se pudo abrir la ventana. Verifica que no esté bloqueada por el navegador.")
        return
      }

      jsonWindow.document.write(`
        <html>
          <head>
            <title>Resultados Detallados - ${study.access_code}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                padding: 20px; 
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
                margin: 0;
                line-height: 1.6;
              }
              .header {
                background: white;
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border-left: 4px solid #3b82f6;
              }
              .json-container {
                background: white; 
                padding: 30px; 
                border-radius: 12px; 
                overflow: auto;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
              }
              pre {
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.5;
                margin: 0;
                color: #1e293b;
              }
              .patient-info {
                color: #64748b;
                font-size: 15px;
                background: #f1f5f9;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
              }
              h1 {
                color: #1e293b;
                margin-bottom: 10px;
                font-size: 28px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Resultados Completos del Modelo ML</h1>
              <div class="patient-info">
                <strong>👤 Paciente:</strong> ${study.patient.name} ${study.patient.last_name}<br>
                <strong>🆔 DNI:</strong> ${study.patient.dni}<br>
                <strong>🔑 Código de Acceso:</strong> ${study.access_code}<br>
                <strong>📅 Fecha:</strong> ${new Date(study.created_at).toLocaleDateString("es-ES")}
              </div>
            </div>
            <div class="json-container">
              <pre>${JSON.stringify(results, null, 2)}</pre>
            </div>
          </body>
        </html>
      `)
    } catch (error) {
      setError("Error al abrir los resultados detallados")
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Consulta de Resultados de Estudios</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Acceda de forma segura a los resultados de sus estudios médicos utilizando su DNI y código de acceso
            </p>
          </div>

          {!studies ? (
            <div className="max-w-md mx-auto">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800">Ingrese sus datos</CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    Para acceder a los resultados de su estudio, ingrese su DNI y el código de acceso proporcionado por
                    su médico.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="dni" className="text-sm font-semibold text-gray-700">
                      DNI
                    </Label>
                    <Input
                      id="dni"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="Ingrese su DNI (sin puntos ni guiones)"
                      maxLength={8}
                      className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-sm font-semibold text-gray-700">
                      Código de acceso
                    </Label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 h-12 flex items-center text-gray-700 font-mono font-semibold">
                        MLP_
                      </span>
                      <Input
                        id="accessCode"
                        value={accessCodeInput}
                        onChange={(e) => setAccessCodeInput(e.target.value)}
                        placeholder="Ingrese el código"
                        className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-l-none"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Buscando estudio...
                      </>
                    ) : (
                      "Consultar estudio"
                    )}
                  </Button>
                </CardContent>
                <CardFooter className="text-center bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                  <p className="text-sm text-gray-600 mx-auto">
                    Si no tiene un código de acceso, contacte a su médico tratante.
                  </p>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header con botón de volver */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Resultados Encontrados</h2>
                  {studies.length > 1 && (
                    <p className="text-gray-600 text-lg">
                      Se encontraron {studies.length} estudios asociados a su DNI.
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-gray-300 hover:bg-gray-50 font-semibold px-6 py-2 bg-transparent"
                >
                  ← Volver a buscar
                </Button>
              </div>

              {/* Lista de estudios */}
              <div className="space-y-8">
                {studies.map((study) => (
                  <StudyCard key={study.id} study={study} onViewDetailed={handleViewDetailed} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}