"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { timbanganService, pemasokService } from "@/lib/api/services"
import { useRouter } from "next/navigation"
import { Scale, Users, TrendingUp, BarChart3, FileText, Truck, Car, Clock, CheckCircle, AlertTriangle, Activity, Zap, Target } from "lucide-react"
import { useScaleAccess } from "@/hooks/useScaleAccess"

export function TimbanganDashboard() {
  const router = useRouter()
  const { hasScaleAccess, scaleStatus } = useScaleAccess()
  const [stats, setStats] = useState({
    totalTransaksiHariIni: 0,
    totalBeratNetto: 0,
    totalPemasokAktif: 0,
    recentTransactions: [],
    totalBeratBulan: 0,
    avgTransaksiPerJam: 0,
    targetHarian: 50000,
    efficiencyRate: 0
  })
  const [localScaleStatus, setLocalScaleStatus] = useState({
    isOnline: true,
    currentWeight: 0,
    calibrationStatus: 'ok', // 'ok', 'warning', 'error'
    lastCalibration: new Date().toISOString(),
    activeTransaction: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimbanganData()
    const interval = setInterval(loadTimbanganData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadTimbanganData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().slice(0, 10)
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      
      const [dailyReport, pemasoks, monthlyReport] = await Promise.all([
        timbanganService.getDailyReport(today).catch(() => ({ summary: { totalTransaksi: 0, totalBeratNetto: 0 }, transactions: [] })),
        pemasokService.getActive().catch(() => []),
        timbanganService.getMonthlyReport(currentYear, currentMonth).catch(() => ({ summary: { totalBeratNetto: 0 } }))
      ])
      
      const currentHour = new Date().getHours()
      const workingHours = Math.max(currentHour - 7, 1) // Assuming work starts at 7 AM
      const avgPerHour = workingHours > 0 ? (dailyReport.summary?.totalTransaksi || 0) / workingHours : 0
      const efficiency = ((dailyReport.summary?.totalBeratNetto || 0) / 50000) * 100

      setStats({
        totalTransaksiHariIni: dailyReport.summary?.totalTransaksi || 0,
        totalBeratNetto: dailyReport.summary?.totalBeratNetto || 0,
        totalPemasokAktif: pemasoks.length,
        recentTransactions: dailyReport.transactions?.slice(0, 6) || [],
        totalBeratBulan: monthlyReport.summary?.totalBeratNetto || 0,
        avgTransaksiPerJam: Math.round(avgPerHour * 100) / 100,
        targetHarian: 50000,
        efficiencyRate: Math.min(efficiency, 100)
      })

      // Simulate scale status (in real implementation, this would come from hardware API)
      setLocalScaleStatus(prev => ({
        ...prev,
        currentWeight: Math.random() * 100, // Simulated current weight
        isOnline: Math.random() > 0.1, // 90% uptime simulation
      }))
    } catch (error) {
      console.error("Failed to load timbangan data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatWeight = (weight: number) => `${weight.toLocaleString("id-ID")} kg`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleTimeString("id-ID")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operator Timbangan</h1>
          <p className="text-muted-foreground">
            Sistem Penimbangan Real-time - Kontrol dan Monitor Operasi
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant={hasScaleAccess && scaleStatus === 'connected' ? "default" : "destructive"} 
            className="px-3 py-1"
          >
            <Activity className="h-3 w-3 mr-1" />
            {!hasScaleAccess ? "Akses Terbatas" : 
             scaleStatus === 'connected' ? "Scale Online" : 
             scaleStatus === 'checking' ? "Memeriksa..." : "Scale Offline"}
          </Badge>
        </div>
      </div>

      {/* Scale Status Panel */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status Timbangan Real-time</CardTitle>
            <Badge className={getStatusColor(localScaleStatus.calibrationStatus)}>
              {getStatusIcon(localScaleStatus.calibrationStatus)}
              {localScaleStatus.calibrationStatus === 'ok' ? 'Kalibrasi OK' : 'Perlu Kalibrasi'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatWeight(localScaleStatus.currentWeight)}
              </div>
              <p className="text-sm text-muted-foreground">Berat Saat Ini</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                hasScaleAccess && scaleStatus === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {!hasScaleAccess ? "RESTRICTED" : 
                 scaleStatus === 'connected' ? "READY" : 
                 scaleStatus === 'checking' ? "CHECKING" : "OFFLINE"}
              </div>
              <p className="text-sm text-muted-foreground">
                {!hasScaleAccess ? "Komputer tidak terdaftar" : "Status Sistem"}
              </p>
            </div>
            <div className="text-center">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => router.push('/timbangan')}
                disabled={!hasScaleAccess || scaleStatus !== 'connected'}
              >
                <Scale className="h-5 w-5 mr-2" />
                {!hasScaleAccess ? 'Akses Terbatas' : scaleStatus !== 'connected' ? 'Timbangan Offline' : 'Mulai Timbangan Baru'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Harian</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.efficiencyRate)}%</div>
            <Progress value={stats.efficiencyRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatWeight(stats.totalBeratNetto)} / {formatWeight(stats.targetHarian)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalTransaksiHariIni}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgTransaksiPerJam} transaksi/jam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efisiensi</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.avgTransaksiPerJam > 5 ? "Tinggi" : stats.avgTransaksiPerJam > 3 ? "Sedang" : "Rendah"}
            </div>
            <p className="text-xs text-muted-foreground">
              Berdasarkan rata-rata per jam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berat Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : formatWeight(stats.totalBeratBulan)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPemasokAktif} pemasok aktif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Pipeline & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaksi Terbaru</CardTitle>
                <CardDescription>Pipeline transaksi penimbangan</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/timbangan')}>
                <Clock className="h-4 w-4 mr-1" />
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : stats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTransactions.map((transaksi: any, index: number) => (
                  <div key={transaksi.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">{transaksi.nomorDo}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaksi.pemasok?.nama}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaksi.sopir?.nama} • {transaksi.kendaraan?.nomorPolisi}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatWeight(transaksi.beratNetto)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(transaksi.tanggal)}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selesai
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada transaksi hari ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Operasi timbangan utama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full justify-start h-12" 
                size="lg"
                onClick={() => router.push('/timbangan')}
              >
                <Scale className="h-5 w-5 mr-3" />
                Timbangan Baru
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => router.push('/master/pemasok')}
              >
                <Users className="h-5 w-5 mr-3" />
                Kelola Pemasok
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => router.push('/laporan/harian')}
              >
                <FileText className="h-5 w-5 mr-3" />
                Laporan Harian
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => router.push('/laporan/bulanan')}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Laporan Bulanan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Data Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Master Data</CardTitle>
          <CardDescription>Akses cepat ke data master untuk operasi timbangan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:border-primary group"
              onClick={() => router.push('/master/pemasok')}
            >
              <Users className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-medium text-center">Pemasok</span>
              <span className="text-xs text-muted-foreground">{stats.totalPemasokAktif} aktif</span>
            </div>
            <div 
              className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:border-primary group"
              onClick={() => router.push('/master/sopir')}
            >
              <Truck className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-medium text-center">Sopir</span>
              <span className="text-xs text-muted-foreground">Data sopir</span>
            </div>
            <div 
              className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:border-primary group"
              onClick={() => router.push('/master/kendaraan')}
            >
              <Car className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-medium text-center">Kendaraan</span>
              <span className="text-xs text-muted-foreground">Data kendaraan</span>
            </div>
            <div 
              className="flex flex-col items-center p-6 border rounded-lg hover:bg-accent cursor-pointer transition-all hover:border-primary group"
              onClick={() => window.location.reload()}
            >
              <Activity className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-medium text-center">Refresh Data</span>
              <span className="text-xs text-muted-foreground">Update real-time</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}