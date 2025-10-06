export default function Loading() {
  // Puedes añadir cualquier UI de carga aquí, como un Skeleton.
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    </div>
  )
}