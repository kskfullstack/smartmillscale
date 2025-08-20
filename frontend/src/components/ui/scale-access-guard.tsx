"use client"

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useScaleAccess } from "@/hooks/useScaleAccess"
import { 
  Scale, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Monitor, 
  RefreshCw,
  Shield,
  MapPin,
  Settings
} from "lucide-react"

interface ScaleAccessGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireActiveConnection?: boolean
}

export function ScaleAccessGuard({ 
  children, 
  fallback,
  requireActiveConnection = true 
}: ScaleAccessGuardProps) {
  const { 
    hasScaleAccess, 
    scaleStatus, 
    computerInfo, 
    checkScaleConnection, 
    isLoading,
    error 
  } = useScaleAccess()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'checking': return 'bg-yellow-500 animate-pulse'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Terhubung'
      case 'checking': return 'Memeriksa...'
      case 'disconnected': return 'Terputus'
      default: return 'Tidak Diketahui'
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
          <CardTitle>Memeriksa Akses Timbangan</CardTitle>
          <CardDescription>
            Memverifikasi koneksi komputer dengan sistem timbangan...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Show access denied if no scale access
  if (!hasScaleAccess) {
    return fallback || (
      <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-red-700">Akses Timbangan Terbatas</CardTitle>
          <CardDescription>
            Fitur live timbangan hanya tersedia dari komputer yang terhubung langsung dengan perangkat timbangan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Informasi Komputer Saat Ini
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hostname:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {computerInfo.hostname || 'Unknown'}
                </code>
              </div>
              {computerInfo.localIP && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {computerInfo.localIP}
                  </code>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Browser:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs max-w-xs truncate">
                  {computerInfo.userAgent.split(' ')[0] || 'Unknown'}
                </code>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Untuk Menggunakan Live Timbangan:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Gunakan komputer yang terhubung langsung dengan timbangan</li>
              <li>• Pastikan driver dan konfigurasi hardware sudah benar</li>
              <li>• Hubungi administrator sistem untuk registrasi komputer baru</li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mr-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Kembali
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show connection status if required and not connected
  if (requireActiveConnection && scaleStatus !== 'connected') {
    return (
      <Card className="w-full max-w-2xl mx-auto border-yellow-200 bg-yellow-50/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Scale className="h-12 w-12 text-yellow-600" />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(scaleStatus)}`} />
            </div>
          </div>
          <CardTitle className="text-yellow-700">Koneksi Timbangan</CardTitle>
          <CardDescription>
            Status koneksi dengan perangkat timbangan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge 
              variant={scaleStatus === 'connected' ? 'default' : 'secondary'}
              className="px-4 py-2"
            >
              {scaleStatus === 'connected' ? (
                <Wifi className="h-4 w-4 mr-2" />
              ) : (
                <WifiOff className="h-4 w-4 mr-2" />
              )}
              {getStatusText(scaleStatus)}
            </Badge>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center text-red-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Diagnostik Koneksi
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Komputer Terdaftar:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  ✓ Ya
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Hardware Timbangan:</span>
                <Badge 
                  variant="outline" 
                  className={
                    scaleStatus === 'connected' 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }
                >
                  {scaleStatus === 'connected' ? '✓ Terhubung' : '✗ Terputus'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-center space-x-3">
            <Button 
              onClick={checkScaleConnection}
              disabled={scaleStatus === 'checking'}
            >
              {scaleStatus === 'checking' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Test Koneksi
            </Button>
            
            {scaleStatus === 'connected' && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Lanjutkan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}