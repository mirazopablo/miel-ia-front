import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MicroscopeIcon, ShieldCheckIcon, UserIcon } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Predicción Médica con Inteligencia Artificial</h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              Plataforma avanzada para la predicción de resultados médicos mediante modelos de Machine Learning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/studies/search">
                <Button size="lg" className="text-lg px-8">
                  Consultar mi estudio
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Acceso profesionales
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <MicroscopeIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Análisis Preciso</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Nuestros modelos de ML ofrecen predicciones con alta precisión basadas en datos clínicos validados.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ShieldCheckIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Seguridad Garantizada</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Todos los datos están protegidos con los más altos estándares de seguridad y privacidad.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <UserIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Acceso Personalizado</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Cada paciente puede acceder a sus resultados con un código único y su DNI de forma segura.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6">Sobre el proyecto</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Este proyecto de tesis implementa modelos avanzados de Machine Learning para predecir resultados de
                  estudios médicos, ayudando a profesionales de la salud a tomar decisiones más informadas y precisas.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  La plataforma permite a médicos y administradores gestionar estudios, mientras que los pacientes
                  pueden acceder a sus resultados de forma segura y confidencial.
                </p>
                <Link href="/about">
                  <Button variant="outline">Conocer más</Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.webp?height=400&width=600"
                    alt="Visualización de datos médicos"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
