"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { timbanganService, pemasokService, gradingService } from "@/lib/api/services"
import { useRouter } from "next/navigation"
import { UserDebug } from "@/components/common/debug/user-debug"
import { useAuth } from "@/contexts/auth-context"
import { Scale, Target, Users, BarChart3, FileText, Award } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()

  // Main dashboard shows general overview for all roles
  // Role-specific dashboards are now on separate routes

  // Default dashboard for admin, supervisor, and other roles
  return <DefaultDashboard />
}

function DefaultDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalTransaksiHariIni: 0,
    totalBeratNetto: 0,
    averageGrading: 0,
    totalPemasokAktif: 0,
    recentTransactions: [],
    gradingDistribution: { A: 0, B: 0, C: 0, D: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().slice(0, 10)
      
      const [dailyReport, pemasoks, gradings] = await Promise.all([
        timbanganService.getDailyReport(today).catch(() => ({ summary: { totalTransaksi: 0, totalBeratNetto: 0 }, transactions: [] })),
        pemasokService.getActive().catch(() => []),
        gradingService.getReport(today, today).catch(() => ({ summary: { averageBuahMatang: 0, gradingDistribution: { A: 0, B: 0, C: 0, D: 0 } } }))
      ])
      
      setStats({
        totalTransaksiHariIni: dailyReport.summary?.totalTransaksi || 0,
        totalBeratNetto: dailyReport.summary?.totalBeratNetto || 0,
        averageGrading: gradings.summary?.averageBuahMatang || 0,
        totalPemasokAktif: pemasoks.length,
        recentTransactions: dailyReport.transactions?.slice(0, 5) || [],
        gradingDistribution: gradings.summary?.gradingDistribution || { A: 0, B: 0, C: 0, D: 0 }
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatWeight = (weight: number) => `${weight.toLocaleString("id-ID")} kg`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleTimeString("id-ID")
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard SmartMillScale</h1>
        <p className="text-muted-foreground">
          Timbang Otomatis, Proses Sistematis - Sistem Manajemen Timbangan Digital
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transaksi Hari Ini
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalTransaksiHariIni}</div>
            <p className="text-xs text-muted-foreground">
              transaksi hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Berat Netto
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : formatWeight(stats.totalBeratNetto)}</div>
            <p className="text-xs text-muted-foreground">
              Hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grading Rata-rata
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.averageGrading > 0 ? `${stats.averageGrading.toFixed(1)}%` : "-"}</div>
            <p className="text-xs text-muted-foreground">
              Buah matang %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pemasok Aktif
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalPemasokAktif}</div>
            <p className="text-xs text-muted-foreground">
              Total pemasok
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              5 transaksi timbangan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : stats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTransactions.map((transaksi: any, index: number) => (
                  <div key={transaksi.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{transaksi.nomorDo}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaksi.pemasok?.nama} - {formatDate(transaksi.tanggal)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatWeight(transaksi.beratNetto)}</div>
                      {transaksi.grading && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaksi.grading.nilaiGrading === 'A' ? 'bg-green-100 text-green-800' :
                          transaksi.grading.nilaiGrading === 'B' ? 'bg-blue-100 text-blue-800' :
                          transaksi.grading.nilaiGrading === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Grade {transaksi.grading.nilaiGrading}
                        </span>
                      )}
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

        <Card>
          <CardHeader>
            <CardTitle>Status Grading</CardTitle>
            <CardDescription>
              Distribusi nilai grading hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : Object.values(stats.gradingDistribution).some(count => count > 0) ? (
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(stats.gradingDistribution).map(([grade, count]) => (
                  <div key={grade} className="text-center p-3 border rounded-lg">
                    <div className={`text-lg font-bold ${
                      grade === 'A' ? 'text-green-600' :
                      grade === 'B' ? 'text-blue-600' :
                      grade === 'C' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {grade}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data grading hari ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Cepat</CardTitle>
          <CardDescription>
            Akses cepat ke fitur utama sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard-timbangan')}
            >
              <Scale className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Dashboard Timbangan</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push('/dashboard-grading')}
            >
              <Award className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Dashboard Grading</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push('/master/pemasok')}
            >
              <Users className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Data Pemasok</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push('/laporan/harian')}
            >
              <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium">Laporan</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <UserDebug />
    </div>
  )
}