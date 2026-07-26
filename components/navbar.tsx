"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X } from "lucide-react"
import { LogoMielIA } from "./ui/logo"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-32 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            {/* Usamos la versión mono para que herede el color del texto o blanco */}
            <LogoMielIA 
              variant="mono" 
              className="h-28 w-auto text-foreground hover:text-primary transition-colors" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className={`text-lg font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/studies/search"
            className={`text-lg font-medium transition-colors hover:text-primary ${
              isActive("/studies/search") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Consultar Estudio
          </Link>
          {/* <Link
            href="/about"
            className={`text-lg font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Acerca de
          </Link> */}
          <Link href="/login">
            <Button variant="outline" size="lg">
              Acceso
            </Button>
          </Link>
          <ModeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container flex flex-col space-y-3 py-4">
            <Link
              href="/"
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/estudios/consulta"
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive("/estudios/consulta") ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Consultar Estudio
            </Link>
            <Link
              href="/about"
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive("/about") ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Acerca de
            </Link>
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" size="lg" className="w-full">
                Acceso
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}