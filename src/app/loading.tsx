export default function Loading() {
  return <div role="status" aria-busy="true" className="flex items-center justify-center min-h-screen"><div className="motion-safe:animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>;
}
