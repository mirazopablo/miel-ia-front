# Documentación del Frontend: Sistema Miel-IA
## Contexto, Arquitectura y Flujos para la Presentación de Tesis de Grado

Este documento ha sido diseñado como material de apoyo y contexto técnico para la defensa de la tesis de grado del proyecto **Miel-IA**. Se enfoca exclusivamente en la arquitectura, decisiones de diseño, pila tecnológica, flujos de usuario e integración con los modelos de inteligencia artificial desde la perspectiva de la interfaz de usuario (Frontend).

---

## 1. Resumen Ejecutivo del Frontend

El frontend de **Miel-IA** es una aplicación web de nivel profesional orientada al ámbito de la salud digital. Su principal objetivo es proporcionar una interfaz intuitiva, accesible y de alta fidelidad para la gestión de estudios electromiográficos (EMG) y la visualización interactiva de predicciones diagnósticas generadas por modelos de Machine Learning (ML).

La interfaz actúa como un puente entre la complejidad matemática de los modelos de IA (incluyendo la explicabilidad de los mismos a través de valores SHAP) y los usuarios del sistema, que se dividen en profesionales médicos, técnicos de laboratorio, administradores de sistemas y pacientes.

---

## 2. Arquitectura del Sistema Frontend

La aplicación está construida sobre el framework **Next.js 16**, utilizando la estructura moderna de **App Router** (`/app`). 

### Decisiones de Arquitectura Clave:
*   **Paradigma Híbrido (Server/Client Components):** Se aprovecha la estructura de Next.js para renderizar componentes estáticos del lado del servidor (como páginas de inicio) y componentes interactivos del lado del cliente (`"use client"`) para formularios, tablas dinámicas, modales de detalle y el procesamiento interactivo de archivos CSV.
*   **Diseño Modular por Roles (RBAC - Role-Based Access Control):** La estructura de carpetas bajo `/app/dashboard` está organizada físicamente según el rol del usuario (`admin`, `doctor`, `technician`), asegurando un aislamiento limpio de las responsabilidades y vistas de cada actor.
*   **Manejo de Estado del Cliente:** El estado se maneja de forma local y reactiva mediante hooks de React (`useState`, `useEffect`) y hooks especializados de formularios (`react-hook-form`), lo que minimiza la sobrecarga de memoria y optimiza el rendimiento en dispositivos de recursos limitados.

---

## 3. Pila Tecnológica (Tech Stack) y Justificación

El frontend utiliza tecnologías modernas y estándares de la industria para garantizar escalabilidad, mantenibilidad y una experiencia de usuario premium:

| Tecnología | Rol en el Proyecto | Justificación Técnica |
| :--- | :--- | :--- |
| **Next.js 16 / React 19** | Framework Base | Proporciona routing avanzado basado en archivos, optimización automática de imágenes y scripts, y soporte nativo para TypeScript. |
| **TypeScript** | Lenguaje de Programación | Aporta tipado estático estricto, reduciendo drásticamente errores en tiempo de ejecución, facilitando la autocompletación y documentando los contratos de la API en el propio código. |
| **Tailwind CSS** | Framework de Estilos | Permite un desarrollo ágil de interfaces mediante clases utilitarias altamente optimizadas, garantizando un diseño responsivo móvil-primero. |
| **shadcn/ui (Radix UI)** | Biblioteca de Componentes | Ofrece componentes accesibles (cumplimiento de estándares WAI-ARIA) y sin estilos forzados, construidos sobre Radix UI Primitives (Accordion, Dialog, Tabs, Table, etc.). |
| **Axios** | Cliente HTTP | Facilita la comunicación con la API REST mediante una API limpia, soporte para FormData y la capacidad de inyectar interceptores de peticiones. |
| **Zod** | Validación de Esquemas | Permite declarar esquemas de datos del lado del cliente y validar formularios en tiempo real antes de enviar peticiones al backend. |
| **React Hook Form** | Gestión de Formularios | Optimiza el rendimiento de formularios complejos al evitar renderizados innecesarios en cada pulsación de tecla, integrándose perfectamente con Zod. |
| **Lucide React** | Iconografía | Proporciona un conjunto consistente y estético de iconos vectoriales ligeros. |
| **Sonner** | Notificaciones (Toasts) | Sistema de notificaciones no intrusivo y altamente estético para informar del éxito o fallo de acciones clave (ej. "Estudio creado"). |
| **Next-Themes** | Gestión de Temas | Soporte nativo para cambio dinámico entre modo claro (light) y oscuro (dark) con persistencia en preferencias de usuario. |

---

## 4. Flujo de Autenticación, Autorización y Seguridad

La seguridad y privacidad son críticas al tratar con datos de salud. El frontend implementa las siguientes medidas:

### A. Autenticación Basada en JSON Web Tokens (JWT)
El acceso al sistema está restringido a usuarios registrados. El flujo se detalla a continuación:
1. El usuario envía sus credenciales (email y contraseña) mediante el formulario en `/login`.
2. El backend responde con un token de acceso (`access_token`).
3. El frontend almacena de forma segura el token en `localStorage` (si el usuario selecciona "Recordar sesión") o en `sessionStorage` (sesión temporal).

### B. Decodificación y Verificación del Token (JWT Decode)
El frontend no almacena contraseñas ni roles en texto plano. En su lugar, utiliza una función personalizada `decodeToken()` en `app/lib/api.ts` para extraer la carga útil (payload) del JWT, la cual contiene:
*   `user_id`: Identificador único del usuario.
*   `roles`: Lista de UUIDs de roles asignados.
*   `exp`: Tiempo de expiración del token.

### C. Redirección Basada en Roles (RBAC)
En la página de login, tras obtener y decodificar el token, se comparan los IDs de los roles devueltos con las variables de entorno configuradas:
*   `NEXT_PUBLIC_ADMIN_ROLE_ID` $\rightarrow$ Redirección a `/dashboard/admin`
*   `NEXT_PUBLIC_DOCTOR_ROLE_ID` $\rightarrow$ Redirección a `/dashboard/doctor`
*   `NEXT_PUBLIC_TECHNICIAN_ROLE_ID` $\rightarrow$ Redirección a `/dashboard/technician`

Si el usuario no tiene ninguno de los roles autorizados, el frontend deniega el acceso lanzando un mensaje de error controlado.

### D. Interceptor de Axios para Seguridad Activa
El archivo [api.ts](file:///mnt/GitHub/miel-ia-front/app/lib/api.ts) configura un interceptor que actúa como un guardián de red:
*   **Endpoints Públicos Excluidos:** Rutas como `/login`, `/forgot-password`, `/reset-password` y la búsqueda pública de estudios `/medical_studies/public-search/` no requieren autorización y se envían sin cabeceras adicionales.
*   **Inyección Automática de Token:** Para cualquier otra ruta, el interceptor recupera el token del almacenamiento y añade la cabecera `Authorization: Bearer <token>`.
*   **Manejo de Sesión Expirada:** Si no se encuentra un token al intentar acceder a un recurso privado, el interceptor aborta la petición y redirige inmediatamente al usuario a `/login?error=session_expired`, garantizando que ninguna pantalla privada sea accesible sin sesión activa.

---

## 5. Estructura de Páginas y Rutas (Routing)

A continuación se analizan en detalle las vistas clave implementadas en el frontend de la aplicación:

### A. Inicio / Landing Page (`/app/page.tsx`)
Página de bienvenida de cara al público general.
*   **Diseño Visual:** Sección Hero con gradientes suaves y adaptativos (modos claro y oscuro). Tarjetas explicativas de las ventajas del sistema (Análisis Preciso, Seguridad Garantizada, Acceso Personalizado).
*   **Acciones:** Dos botones principales que dirigen al paciente a consultar su estudio o al profesional a iniciar sesión.

### B. Consulta Pública de Estudios (`/app/studies/search/page.tsx`)
Permite a los pacientes acceder a sus resultados sin necesidad de crear una cuenta en el sistema, protegiendo su identidad.
*   **Mecanismo de Seguridad:** Requiere ingresar el DNI del paciente y un código de acceso único generado por el sistema. El código tiene el formato prefijado `MLP_XXXXX` (donde `XXXXX` es un código alfanumérico aleatorio de 5 dígitos).
*   **Visualización Dinámica:**
    *   Si el estudio está en estado `PENDING` (pendiente de diagnóstico), muestra un indicador de carga asíncrono informando que los resultados se están procesando.
    *   Si el estudio está en estado `COMPLETED`, renderiza la tarjeta del estudio (`StudyCard`) y el bloque detallado de análisis de Machine Learning (`MLResultsDisplay`).
    *   Proporciona un botón para **"Ver Resultado Detallado"** que abre una pestaña nueva en el navegador con un informe estructurado que renderiza el payload JSON completo con alta legibilidad.

### C. Dashboard de Administración (`/app/dashboard/admin/page.tsx`)
Panel centralizado para el control del sistema.
*   **Métricas en Tiempo Real:** Muestra tarjetas estadísticas del total de usuarios registrados, doctores, técnicos y pacientes en el sistema.
*   **Pestañas de Gestión:**
    *   **Pestaña de Usuarios:** Muestra la lista de personal registrado con su rol. Integra el modal de creación de usuarios `CreateUserModal` para dar de alta doctores, técnicos y pacientes validados.
    *   **Pestaña de Estudios:** Lista todos los estudios médicos creados en el hospital, con su estado de procesamiento (Completado/Pendiente), fecha de creación e información del paciente.
*   **Integración Inter-Dashboard:** Cuenta con enlaces directos para saltar rápidamente a las vistas de médico o técnico, facilitando la depuración e inspección del administrador.

### D. Dashboard del Médico (`/app/dashboard/doctor/page.tsx`)
La herramienta principal del profesional de la salud.
*   **Métricas Diagnósticas:** Resumen visual del total de estudios, cuántos están completados, cuántos están pendientes de análisis y el volumen de resultados positivos para patología.
*   **Tabla de Estudios Médicos:**
    *   Para estudios **Pendientes**: Muestra un botón interactivo para **"Diagnosticar"** que despliega el modal para subir el archivo electromiográfico.
    *   Para estudios **Completados**: Muestra un botón para **"Ver"** que despliega el modal detallado con la explicación de la IA.
    *   Permite la eliminación controlada de estudios mediante diálogos de confirmación (`AlertDialog`) integrando notificaciones Toast para el feedback.
*   **Creación de Estudios (`/app/dashboard/doctor/studies/new/page.tsx`):**
    *   Implementa formularios inteligentes usando popovers de búsqueda (`Combobox` con filtrado predictivo por apellido) para la asignación rápida de Doctores, Pacientes y Técnicos (opcional).
    *   Permite agregar texto enriquecido para los datos clínicos iniciales del paciente.

### E. Dashboard del Técnico (`/app/dashboard/technician/page.tsx`)
Orientado al personal de laboratorio encargado de registrar estudios pero que no posee permisos para realizar diagnósticos o ver explicabilidades avanzadas de IA.
*   Muestra la lista de estudios y estadísticas simplificadas.
*   Permite visualizar detalles básicos del estudio pero no ejecutar el motor de diagnóstico de IA.

---

## 6. Integración con Machine Learning e Interpretación de Resultados

La joya de la corona del frontend de **Miel-IA** es la manera en que procesa, envía e interpreta los resultados del motor de Inteligencia Artificial.

### A. Envío de Datos Electromiográficos (EMG)
Cuando un médico hace clic en "Diagnosticar", el frontend abre un modal que solicita un archivo en formato **CSV**. 
*   **Validación de Tipo:** El frontend valida que el archivo tenga la extensión `.csv` o el tipo MIME `text/csv`.
*   **Advertencia Clínica:** Se notifica visualmente al médico que el archivo CSV debe contener exactamente las **72 características de EMG** requeridas por el modelo.
*   **Envío de Datos:** El archivo se empaqueta en un objeto de tipo `FormData` y se envía mediante una petición `POST` al endpoint `/diagnose/{study_id}` a través de la función `performDiagnosis()`.

### B. Renderizado Inteligente de Resultados (`MLResultsDisplay`)
Una vez procesado el diagnóstico, el backend almacena los resultados en formato JSON dentro de la columna `ml_results` del estudio. El frontend analiza este JSON de forma dinámica y lo divide en tres secciones altamente visuales:

#### 1. Diagnóstico Principal y Confianza
*   **Visualización de Diagnóstico:** Muestra el diagnóstico final (ej. "Positivo" o "Negativo") con colores adaptativos basados en el nivel de severidad.
*   **Confianza de Votación (Ensemble):** Muestra el porcentaje de confianza global calculado a partir de la media de confianza del modelo de detección y del modelo de clasificación.
*   **Severidad:** Clasifica la patología en un rango del `0` (Normal) al `3` (Severo) usando badges y alertas con código de colores:
    *   **Nivel 0 (Normal):** Verde (ej. "No se detectaron alteraciones significativas").
    *   **Nivel 1 (Leve):** Amarillo.
    *   **Nivel 2 (Moderado):** Naranja.
    *   **Nivel 3 (Severo):** Rojo (ej. "Alteraciones severas detectadas").

#### 2. Desglose del Ensamble de Modelos (Detección y Severidad)
*   **Detección:** Muestra la votación binaria individual de cada modelo matemático configurado en el backend (ej. XGBoost, Random Forest, SVM) y el consenso final con su porcentaje de confianza.
*   **Severidad:** Desglosa de igual forma la predicción de nivel de cada clasificador y la coincidencia general.

#### 3. Explicabilidad del Modelo (SHAP Explainers)
Para evitar el efecto de "caja negra" de la IA y aportar valor en una tesis médica, el frontend renderiza explicaciones comprensibles extraídas del objeto `explanations` del JSON:
*   **Interpretación Clínica:** Listado de viñetas con observaciones y sugerencias automáticas para el médico derivadas del análisis estadístico de los datos (ej. "Se detectó fatiga muscular temprana en el canal X").
*   **Características Clave de Mayor Impacto:** Una lista con las características del electromiograma que tuvieron mayor peso e influencia en la toma de decisión del algoritmo, indicando si el valor medido está dentro de rangos normales o anómalos.
*   **Análisis de Electrodos:** Muestra dinámicamente qué electrodos del EMG presentaron anomalías, destacando visualmente los nombres de los canales afectados (ej. "Ch1", "Ch4").
*   **Resumen Estadístico y Metadatos:** Indica el método de explicabilidad utilizado (ej. SHAP), marcas de tiempo del análisis y número de variables fuera del rango normal.

---

## 7. Componentes Clave de UI y Experiencia de Usuario (UX)

El diseño visual está alineado con las mejores prácticas de desarrollo web moderno:

1.  **Dashboard Shell (`DashboardLayout`):**
    *   **Navegación Fluida:** Proporciona un menú lateral persistente en pantallas grandes y un menú tipo *drawer* lateral en dispositivos móviles accionado por un botón menú hamburguesa.
    *   **Tematización:** Integra el componente `ModeToggle` que conmuta suavemente entre el tema claro y oscuro a través de variables CSS globales mapeadas por Tailwind.
    *   **Contexto de Perfil:** Un menú desplegable en la esquina superior derecha muestra el nombre del profesional logueado y su correo electrónico institucional.
    *   **Historial de Navegación:** Incluye un botón universal de "Volver" (`router.back()`) en la cabecera del dashboard para facilitar el retorno en flujos de creación de registros.
2.  **Visualizador de Reportes JSON detallados:**
    *   Evita saturar la pantalla principal de consulta con datos crudos pero proporciona la capacidad de abrir una ventana limpia con estilos de impresión CSS optimizados para visualizar el árbol de datos JSON completo.
3.  **Diálogos de Confirmación (`AlertDialog` y `Dialog`):**
    *   Los procesos destructivos como la eliminación de estudios y los procesos críticos como la subida de electromiogramas se protegen detrás de modales de confirmación con estados de carga animados (`Loader2` en rotación continua) para evitar clics dobles y operaciones erróneas.

---

## 8. Configuración y Despliegue (Variables de Entorno)

La aplicación es completamente configurable para entornos de desarrollo y producción utilizando variables de entorno declaradas en el archivo `.env` o en la consola del servidor de despliegue:

```bash
# URL de conexión al servidor Backend (API Gateway / FastAPI)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Identificadores Únicos (UUIDs) de Roles en la Base de Datos para Control de Flujo en Cliente
NEXT_PUBLIC_ADMIN_ROLE_ID=a8f9c15d-5b23-4e8f-bc6a-0123456789ab
NEXT_PUBLIC_DOCTOR_ROLE_ID=b7e8d04c-4a12-3f7e-ab5c-1234567890cd
NEXT_PUBLIC_PATIENT_ROLE_ID=c6d7c93b-3f01-2e6d-9a4b-2345678901ef
NEXT_PUBLIC_TECHNICIAN_ROLE_ID=d5c6b82a-2e90-1d5c-8b3a-3456789012gh

# Nombres de Roles para Etiquetas y Comparaciones
NEXT_PUBLIC_ADMIN_ROLE_NAME=Admin
NEXT_PUBLIC_DOCTOR_ROLE_NAME=Doctor
NEXT_PUBLIC_PATIENT_ROLE_NAME=Patient
NEXT_PUBLIC_TECHNICIAN_ROLE_NAME=Technician
```

---

## 9. Puntos Clave para la Defensa de la Tesis (Resumen para Exposición)

Al realizar la presentación oral frente al jurado evaluador, se sugiere destacar los siguientes puntos técnicos del Frontend:

1.  **Enfoque Médico-Centrista:** El sistema no solo arroja un diagnóstico "positivo" o "negativo", sino que se diseñaron componentes dedicados a la **explicabilidad médica (SHAP)**. Esto demuestra un entendimiento profundo del problema de la "caja negra" en IA aplicada a la medicina.
2.  **Seguridad y Privacidad por Diseño:** El acceso público del paciente no requiere credenciales comprometidas (contraseñas), sino un esquema seguro de token único combinando DNI y el código de acceso dinámico `MLP_XXXXX`, limitando la superficie de ataque del sistema.
3.  **Aislamiento de Responsabilidades (RBAC):** Se puede demostrar cómo un administrador gestiona usuarios de forma segregada, mientras que el médico es el único con facultades diagnósticas y el técnico actúa como operador de carga, todo controlado desde el frontend validando la firma del token JWT de manera robusta.
4.  **Optimización y Rendimiento:** La elección de Next.js y Tailwind CSS garantiza que el panel de control médico cargue instantáneamente y sea utilizable en computadoras de consultorios u hospitales que pueden no tener las últimas especificaciones de hardware.

---

## 10. Paleta de Colores y Guía de Estilos de Presentación

Para garantizar una consistencia visual perfecta entre la aplicación web y las diapositivas de la defensa de la tesis, se define la siguiente paleta cromática basada en el diseño y los tokens del frontend:

### A. Colores de Identidad (Logo y Banner)
*   **Azul Marino Acero (Primario):** `#1B4567` (con variaciones cromáticas en el logo como `#1E4767` y `#204461`).
*   **Azul Hielo / Pastel (Contraste):** `#E2ECF2`.
*   **Blanco Off-White:** `#FEFEFE` (o `#FFFFFF`).

### B. Colores del Sistema (Componentes UI - Light / Dark Theme)
#### Modo Claro (Light Mode)
*   **Azul Médico Activo (Primary):** `#2563EB` (HSL `221.2 83.2% 53.3%`).
*   **Negro Pizarra (Foreground):** `#020817` (HSL `222.2 84% 4.9%`).
*   **Gris Neutro / Slate (Muted Foreground):** `#64748B` (HSL `215.4 16.3% 46.9%`).
*   **Gris Claro de Limpieza (Borders / Inputs):** `#E2E8F0` (HSL `214.3 31.8% 91.4%`).

#### Modo Oscuro (Dark Mode)
*   **Azul Eléctrico (Primary Dark):** `#3B82F6` (HSL `217.2 91.2% 59.8%`).
*   **Gris Carbón Oscuro (Borders/Secondary Dark):** `#1E293B` (HSL `217.2 32.6% 17.5%`).

### C. Colores Semánticos de Diagnóstico (Inteligencia Artificial)
*   **Normal (Nivel 0):** `#15803D` (Verde Esmeralda) - Representa ausencia de patologías.
*   **Leve (Nivel 1):** `#A16207` (Amarillo Mostaza/Dorado) - Alteraciones mínimas detectadas.
*   **Moderado (Nivel 2):** `#C2410C` (Naranja Óxido) - Anomalías moderadas que requieren seguimiento.
*   **Severo (Nivel 3):** `#B91C1C` (Rojo Carmesí) - Anomalías graves o resultado positivo crítico.

### Guía de Uso en las Diapositivas
*   **Fondo y Títulos:** Utilizar fondos limpios en blanco (`#FFFFFF`) o azul hielo (`#E2ECF2`) y títulos principales en **Azul Marino Acero (`#1B4567`)** para transmitir rigor académico y clínico.
*   **Énfasis:** Utilizar el **Azul Médico Activo (`#2563EB`)** para resaltar palabras clave en párrafos o viñetas.
*   **Resultados de ML:** Al ilustrar diagramas de predicción de severidad del algoritmo, utilizar la codificación semántica (Verde, Amarillo, Naranja, Rojo) para que el jurado relacione visualmente los gráficos de la exposición con las capturas de la aplicación.

