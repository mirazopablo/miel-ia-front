// api.ts - Versión corregida
import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
})

// Función para manejar el almacenamiento seguro en el cliente
const storage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
  },
  setToken: (token: string, remember = false): void => {
    if (typeof window === "undefined") return
    const storageType = remember ? localStorage : sessionStorage
    storageType.setItem("access_token", token)
  },
  clearToken: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem("access_token")
    sessionStorage.removeItem("access_token")
  },
}

// Interceptor para añadir el token
// api.ts - Interceptor corregido
apiClient.interceptors.request.use((config) => {
  const publicEndpoints = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/medical_studies/public-search/"
  ]

  // Verificación más robusta que maneja slashes finales
  const isPublicEndpoint = publicEndpoints.some((endpoint) => {
    const url = config.url || ""
    return url.includes(endpoint) || url.replace(/\/$/, "").includes(endpoint)
  })

  if (!isPublicEndpoint) {
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn("Token no encontrado para endpoint privado:", config.url)
      if (typeof window !== "undefined") {
        window.location.href = "/login?error=session_expired"
      }
      return Promise.reject(new Error("Authentication required"))
    }
  } else {
    // Endpoint público detectado
  }

  return config
})

// --- Tipos y Interfaces ---
export interface User {
  id: number
  dni: string
  name: string
  email: string
  last_name: string | null
  roles: { id: number; name: string }[]
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  dni: string
  last_name: string
  role_id: string
}

export interface MedicalStudyCreate {
  access_code: string
  doctor_id: number
  patient_id: number
  technician_id?: number | null
  clinical_data?: string | null
}

export interface MedicalStudy {
  id: number
  access_code: string
  status: "COMPLETED" | "PENDING" | string
  created_at: string
  ml_results: string | null
  clinical_data?: string | null
  patient: {
    id: number
    name: string
    last_name: string
    dni: string
    email?: string
  }
  doctor?: {
    id: number
    name: string
    last_name: string
    email?: string
    dni?: string
  }
  technician?: {
    id: number
    name: string
    last_name: string
    email?: string
    dni?: string
  } | null
}

export enum MedicalStudySearchType {
  ALL = "all",
  ID = "id",
  PATIENT_DNI = "patient_dni",
  PATIENT_NAME = "patient_name",
}

export enum UserSearchType {
  ALL = "all",
  ID = "id",
  NAME = "name",
  DNI = "dni",
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserTokenData {
  sub: string
  user_id: string
  roles: string[]
  exp: number
}

// --- Funciones de la API ---

// Autenticación
// Función de login actualizada
export const login = async (email: string, password: string, remember = false): Promise<LoginResponse> => {
  try {
    const formData = new FormData()
    formData.append("username", email)
    formData.append("password", password)

    const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    if (response.data.access_token) {
      storage.setToken(response.data.access_token, remember)
    }

    return response.data
  } catch (error) {
    storage.clearToken()
    throw error
  }
}

// Función de logout
export const logout = () => {
  storage.clearToken()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

export const decodeToken = (token: string): UserTokenData => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding token:", error)
    throw new Error("Invalid token")
  }
}

// Usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>("/api/v1/users/")
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Redirigir a login si no está autenticado
        if (typeof window !== "undefined") {
          window.location.href = "/login?error=auth_required"
        }
      }
      throw new Error(error.response?.data?.message || "Error al obtener usuarios")
    }
    throw new Error("Error desconocido al obtener usuarios")
  }
}

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  try {
    const response = await apiClient.post<User>("/api/v1/users/", userData)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al crear usuario")
    }
    throw new Error("Error desconocido al crear usuario")
  }
}

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/users/${userId}`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al eliminar usuario")
    }
    throw new Error("Error desconocido al eliminar usuario")
  }
}

export const getUsersByRole = async (roleId: string): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>(`/api/v1/users/by-role/${roleId}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al obtener usuarios por rol")
    }
    throw new Error("Error desconocido al obtener usuarios por rol")
  }
}

export const getUserByIdUUID = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/api/v1/users/${userId}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error al obtener usuario")
    }
    throw new Error("Error desconocido al obtener usuario")
  }
}

export const getUserById = async (userId: number): Promise<User> => {
  try {
    const response = await apiClient.get<User[]>("/api/v1/users/search", {
      params: {
        search_type: UserSearchType.ID,
        user_id: userId,
      },
    })

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0]
    }
    throw new Error(`User with ID ${userId} not found`)
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

// Estudios Médicos
export const getMedicalStudies = async (): Promise<MedicalStudy[]> => {
  try {
    const response = await apiClient.get<MedicalStudy[]>("medical_studies/search/", {
      params: { search_type: MedicalStudySearchType.ALL },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching medical studies:", error)
    return []
  }
}

export const searchStudiesByPatientDni = async (dni: string, accessCode: string): Promise<MedicalStudy[]> => {
  try {
    const response = await apiClient.get<MedicalStudy[]>("/medical_studies/public-search/", {
      params: {
        patient_dni: dni,
        access_code: accessCode,
      },
    })
    return response.data
  } catch (error) {
    console.log("Error searching studies by patient DNI:", error)
    console.error("Error searching studies:", error)
    throw error
  }
}

export const getStudyById = async (studyId: number): Promise<MedicalStudy> => {
  try {
    const response = await apiClient.get<MedicalStudy>("/medical_studies/search/", {
      params: {
        search_type: MedicalStudySearchType.ID,
        study_id: studyId,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching study:", error)
    throw error
  }
}

export const searchStudiesByPatientName = async (name: string): Promise<MedicalStudy[]> => {
  try {
    const response = await apiClient.get<MedicalStudy[]>("/medical_studies/search/", {
      params: {
        search_type: MedicalStudySearchType.PATIENT_NAME,
        patient_name: name,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error searching studies:", error)
    throw error
  }
}

export const createMedicalStudy = async (studyData: MedicalStudyCreate): Promise<MedicalStudy> => {
  try {
    const response = await apiClient.post<MedicalStudy>("/medical_studies/", studyData)
    return response.data
  } catch (error) {
    console.error("Error creating study:", error)
    throw error
  }
}

export const deleteMedicalStudy = async (studyId: number): Promise<void> => {
  try {
    await apiClient.delete(`/medical_studies/${studyId}`)
  } catch (error) {
    console.error("Error deleting study:", error)
    throw error
  }
}

export const performDiagnosis = async (studyId: number, formData: FormData): Promise<any> => {
  try {
    const response = await apiClient.post(`/diagnose/${studyId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error performing diagnosis:", error)
    throw error
  }
}
