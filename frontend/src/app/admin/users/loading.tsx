import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    </div>
  )
}