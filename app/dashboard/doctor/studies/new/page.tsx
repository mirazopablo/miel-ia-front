"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import axios from "axios"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Importamos las funciones y tipos desde nuestra API
import { createMedicalStudy, getUsersByRole, type MedicalStudyCreate, type User } from "../../../../lib/api"
import { UUID } from "crypto"

// Función para generar código alfanumérico de 5 dígitos
const generateAccessCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return `MLP_${result}`
}

// Esquema de validación con Zod
const formSchema = z.object({
  doctor_id: z.string().uuid("Debe seleccionar un doctor válido."),
  patient_id: z.string().uuid("Debe seleccionar un paciente válido."),
  technician_id: z
    .string()
    .uuid("Debe ser un UUID válido")
    .optional()
    .or(z.literal(""))
    .transform((val) => val === "" ? undefined : val), // Transformar string vacío a undefined
  clinical_data: z.string().optional(),
})

export default function NewStudyPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<User[]>([])
  const [patients, setPatients] = useState<User[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingTechnicians, setLoadingTechnicians] = useState(true)
  const [openDoctorCombo, setOpenDoctorCombo] = useState(false)
  const [openPatientCombo, setOpenPatientCombo] = useState(false)
  const [openTechnicianCombo, setOpenTechnicianCombo] = useState(false)

  // Configuramos el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctor_id: "",
      patient_id: "",
      technician_id: "",
      clinical_data: "",
    },
  })

  // Cargar usuarios por rol al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Cargar doctores
        setLoadingDoctors(true)
        const doctorRoleId = process.env.NEXT_PUBLIC_DOCTOR_ROLE_ID
        if (doctorRoleId) {
          const doctorsList = await getUsersByRole(doctorRoleId)
          setDoctors(doctorsList)
        } else {
          console.warn("NEXT_PUBLIC_DOCTOR_ROLE_ID no está definido")
        }
        setLoadingDoctors(false)

        // Cargar pacientes
        setLoadingPatients(true)
        const patientRoleId = process.env.NEXT_PUBLIC_PATIENT_ROLE_ID
        if (patientRoleId) {
          const patientsList = await getUsersByRole(patientRoleId)
          setPatients(patientsList)
        } else {
          console.warn("NEXT_PUBLIC_PATIENT_ROLE_ID no está definido")
        }
        setLoadingPatients(false)

        // Cargar técnicos (usando admin role por ahora)
        setLoadingTechnicians(true)
        const technicianRoleId = process.env.NEXT_PUBLIC_TECHNICIAN_ROLE_ID
        if (technicianRoleId) {
          const techniciansList = await getUsersByRole(technicianRoleId)
          setTechnicians(techniciansList)
        } else {
          console.warn("NEXT_PUBLIC_TECHNICIAN_ROLE_ID no está definido")
        }
        setLoadingTechnicians(false)
      } catch (error) {
        console.error("Error cargando usuarios:", error)
        toast.error("Error al cargar las listas de usuarios")
        setLoadingDoctors(false)
        setLoadingPatients(false)
        setLoadingTechnicians(false)
      }
    }

    loadUsers()
  }, [])

  // Tipo inferido del formulario
  type FormData = z.infer<typeof formSchema>

  // Función que se ejecuta al enviar el formulario
  async function onSubmit(values: FormData) {
    try {
      const accessCode = generateAccessCode()

      // Crear payload SIN creation_date (se genera automáticamente en el backend)
      const payload: MedicalStudyCreate = {
        access_code: accessCode,
        doctor_id: values.doctor_id as UUID,
        patient_id: values.patient_id as UUID,
        technician_id: values.technician_id ? (values.technician_id as UUID) : null,
        clinical_data: values.clinical_data || null,
      }

      console.log("Payload a enviar:", payload) // Debug

      await createMedicalStudy(payload)
      toast.success(`¡Estudio médico creado exitosamente! Código: ${accessCode}`)
      router.push("/dashboard/doctor")
    } catch (error) {
      console.error("Error creating study:", error)
      
      // Mejorar el manejo de errores
      let errorMessage = "Hubo un error al crear el estudio. Por favor, inténtelo de nuevo."
      
      if (axios.isAxiosError(error)) {
        const backendError = error.response?.data?.detail || error.response?.data?.message
        if (backendError) {
          errorMessage = `Error: ${backendError}`
        }
        console.error("Backend error details:", error.response?.data)
      }
      
      toast.error(errorMessage)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Crear Nuevo Estudio Médico</CardTitle>
            <p className="text-sm text-muted-foreground">
              El código de acceso se generará automáticamente con el formato MLP_XXXXX
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Campo: Doctor Solicitante */}
                  <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Doctor Solicitante</FormLabel>
                        <Popover open={openDoctorCombo} onOpenChange={setOpenDoctorCombo}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openDoctorCombo}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value
                                  ? (() => {
                                      const selectedDoctor = doctors.find((doctor) => doctor.id === field.value)
                                      return selectedDoctor
                                        ? `Dr. ${selectedDoctor.name} ${selectedDoctor.last_name}`
                                        : "Seleccionar doctor..."
                                    })()
                                  : "Seleccionar doctor..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar por apellido..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingDoctors ? "Cargando doctores..." : "No se encontraron doctores."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {doctors.map((doctor) => (
                                    <CommandItem
                                      key={doctor.id}
                                      value={`${doctor.last_name} ${doctor.name}`}
                                      onSelect={() => {
                                        form.setValue("doctor_id", doctor.id)
                                        setOpenDoctorCombo(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === doctor.id ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          Dr. {doctor.name} {doctor.last_name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          DNI: {doctor.dni} • Email: {doctor.email}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Seleccione el doctor que solicita el estudio. Puede buscar por apellido.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo: Paciente */}
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Paciente</FormLabel>
                        <Popover open={openPatientCombo} onOpenChange={setOpenPatientCombo}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPatientCombo}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                              >
                                {field.value
                                  ? (() => {
                                      const selectedPatient = patients.find((patient) => patient.id === field.value)
                                      return selectedPatient
                                        ? `${selectedPatient.name} ${selectedPatient.last_name}`
                                        : "Seleccionar paciente..."
                                    })()
                                  : "Seleccionar paciente..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar por apellido..." />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingPatients ? "Cargando pacientes..." : "No se encontraron pacientes."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {patients.map((patient) => (
                                    <CommandItem
                                      key={patient.id}
                                      value={`${patient.last_name} ${patient.name}`}
                                      onSelect={() => {
                                        form.setValue("patient_id", patient.id)
                                        setOpenPatientCombo(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === patient.id ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {patient.name} {patient.last_name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          DNI: {patient.dni} • Email: {patient.email}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Seleccione el paciente para el estudio. Puede buscar por apellido.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campo: Técnico (Opcional) */}
                <FormField
                  control={form.control}
                  name="technician_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Técnico (Opcional)</FormLabel>
                      <Popover open={openTechnicianCombo} onOpenChange={setOpenTechnicianCombo}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openTechnicianCombo}
                              className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                              {field.value
                                ? (() => {
                                    const selectedTechnician = technicians.find((tech) => tech.id === field.value)
                                    return selectedTechnician
                                      ? `${selectedTechnician.name} ${selectedTechnician.last_name}`
                                      : "Seleccionar técnico..."
                                  })()
                                : "Seleccionar técnico..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar por apellido..." />
                            <CommandList>
                              <CommandEmpty>
                                {loadingTechnicians ? "Cargando técnicos..." : "No se encontraron técnicos."}
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="ninguno"
                                  onSelect={() => {
                                    form.setValue("technician_id", "")
                                    setOpenTechnicianCombo(false)
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", !field.value ? "opacity-100" : "opacity-0")} />
                                  <span className="text-muted-foreground">Sin técnico asignado</span>
                                </CommandItem>
                                {technicians.map((technician) => (
                                  <CommandItem
                                    key={technician.id}
                                    value={`${technician.last_name} ${technician.name}`}
                                    onSelect={() => {
                                      form.setValue("technician_id", technician.id)
                                      setOpenTechnicianCombo(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === technician.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {technician.name} {technician.last_name}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        DNI: {technician.dni} • Email: {technician.email}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Seleccione un técnico si es necesario para el estudio. Puede buscar por apellido o dejar sin
                        asignar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo: Datos Clínicos (Opcional) */}
                <FormField
                  control={form.control}
                  name="clinical_data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datos Clínicos Iniciales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa cualquier dato clínico relevante..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Información adicional que pueda ser relevante para el estudio</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creando..." : "Crear Estudio"}
                  </Button>

                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/doctor")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}