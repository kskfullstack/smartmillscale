"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { gradingService, pemasokService, timbanganService } from "@/lib/api/services"
import { useRouter } from "next/navigation"
import { Award, Target, Users, TrendingUp, BarChart3, FileText, AlertTriangle, CheckCircle, Clock, Activity, Zap, Star, Eye, ThumbsUp, ThumbsDown } from "lucide-react"

export function GradingDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalGradingHariIni: 0,
    averageBuahMatang: 0,
    averageBuahMentah: 0,
    averageBuahBusuk: 0,
    totalPemasokAktif: 0,
    gradingDistribution: { A: 0, B: 0, C: 0, D: 0 },
    recentGradings: [],
    pendingAssessments: 0,
    qualityTrend: 'stable', // 'improving', 'stable', 'declining'
    topSuppliers: [],
    qualityAlerts: [],
    avgGradingPerHour: 0,
    qualityScore: 0
  })
  const [assessmentStatus, setAssessmentStatus] = useState({
    activeAssessment: null,
    pendingCount: 0,
    completedToday: 0,
    qualityStatus: 'good' // 'good', 'warning', 'critical'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGradingData()
    const interval = setInterval(loadGradingData, 45000) // Refresh every 45 seconds
    return () => clearInterval(interval)
  }, [])

  const loadGradingData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().slice(0, 10)
      
      const [gradingReport, pemasoks, dailyTransactions] = await Promise.all([
        gradingService.getReport(today, today).catch(() => ({ 
          summary: { 
            totalGrading: 0, 
            averageBuahMatang: 0, 
            averageBuahMentah: 0, 
            averageBuahBusuk: 0, 
            gradingDistribution: { A: 0, B: 0, C: 0, D: 0 } 
          }, 
          gradings: [],
          bySupplier: []
        })),
        pemasokService.getActive().catch(() => []),
        timbanganService.getDailyReport(today).catch(() => ({ summary: { totalTransaksi: 0 }, transactions: [] }))
      ])
      
      // Calculate quality metrics
      const totalGrading = gradingReport.summary?.totalGrading || 0
      const avgMatang = gradingReport.summary?.averageBuahMatang || 0
      const qualityScore = totalGrading > 0 ? 
        ((gradingReport.summary?.gradingDistribution?.A || 0) + (gradingReport.summary?.gradingDistribution?.B || 0)) / totalGrading * 100 : 0

      // Calculate pending assessments (transactions without grading)
      const totalTransactions = dailyTransactions.summary?.totalTransaksi || 0
      const pendingAssessments = Math.max(0, totalTransactions - totalGrading)

      // Calculate hourly rate
      const currentHour = new Date().getHours()
      const workingHours = Math.max(currentHour - 7, 1) // Assuming work starts at 7 AM
      const avgPerHour = workingHours > 0 ? totalGrading / workingHours : 0

      // Determine quality status
      let qualityStatus = 'good'
      if (avgMatang < 60) qualityStatus = 'critical'
      else if (avgMatang < 75) qualityStatus = 'warning'

      // Quality trend simulation (in real app, this would compare with previous periods)
      const qualityTrend = avgMatang > 80 ? 'improving' : avgMatang > 65 ? 'stable' : 'declining'

      // Quality alerts
      const qualityAlerts = []
      if (avgMatang < 70) qualityAlerts.push({ type: 'warning', message: 'Kualitas buah matang dibawah standar' })
      if (pendingAssessments > 5) qualityAlerts.push({ type: 'info', message: `${pendingAssessments} transaksi menunggu grading` })
      if (gradingReport.bySupplier?.some((s: any) => s.averageBuahMatang < 60)) {
        qualityAlerts.push({ type: 'error', message: 'Beberapa pemasok memiliki kualitas rendah' })
      }

      setStats({
        totalGradingHariIni: totalGrading,
        averageBuahMatang: avgMatang,
        averageBuahMentah: gradingReport.summary?.averageBuahMentah || 0,
        averageBuahBusuk: gradingReport.summary?.averageBuahBusuk || 0,
        totalPemasokAktif: pemasoks.length,
        gradingDistribution: gradingReport.summary?.gradingDistribution || { A: 0, B: 0, C: 0, D: 0 },
        recentGradings: gradingReport.gradings?.slice(0, 6) || [],
        pendingAssessments,
        qualityTrend,
        topSuppliers: gradingReport.bySupplier?.slice(0, 3) || [],
        qualityAlerts,
        avgGradingPerHour: Math.round(avgPerHour * 100) / 100,
        qualityScore: Math.round(qualityScore)
      })

      setAssessmentStatus({
        activeAssessment: null, // Would be set if there's an active assessment
        pendingCount: pendingAssessments,
        completedToday: totalGrading,
        qualityStatus
      })
    } catch (error) {
      console.error("Failed to load grading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleTimeString("id-ID")

  const getGradingColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200'
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'D': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Quality Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operator Grading</h1>
          <p className="text-muted-foreground">
            Sistem Penilaian Kualitas - Monitor dan Analisis Quality TBS
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getQualityColor(assessmentStatus.qualityStatus)} variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            Quality: {assessmentStatus.qualityStatus === 'good' ? 'Baik' : 
                     assessmentStatus.qualityStatus === 'warning' ? 'Perhatian' : 'Kritis'}
          </Badge>
          {stats.qualityAlerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {stats.qualityAlerts.length} Alert
            </Badge>
          )}
        </div>
      </div>

      {/* Quality Status Panel */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status Kualitas Real-time</CardTitle>
            <div className="flex items-center space-x-2">
              {getTrendIcon(stats.qualityTrend)}
              <span className="text-sm font-medium capitalize">{stats.qualityTrend}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.qualityScore}%
              </div>
              <p className="text-sm text-muted-foreground">Quality Score (A+B)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.averageBuahMatang.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Avg Buah Matang</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {assessmentStatus.pendingCount}
              </div>
              <p className="text-sm text-muted-foreground">Pending Assessment</p>
            </div>
            <div className="text-center">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => router.push('/grading')}
              >
                <Award className="h-5 w-5 mr-2" />
                Mulai Grading
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Alerts */}
      {stats.qualityAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Quality Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.qualityAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="text-sm">{alert.message}</span>
                  <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                    {alert.type === 'error' ? 'Critical' : alert.type === 'warning' ? 'Warning' : 'Info'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grading Hari Ini</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalGradingHariIni}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgGradingPerHour} penilaian/jam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efisiensi Assessment</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgGradingPerHour > 4 ? "Tinggi" : stats.avgGradingPerHour > 2 ? "Sedang" : "Rendah"}
            </div>
            <p className="text-xs text-muted-foreground">
              Berdasarkan target 3/jam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buah Busuk</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.averageBuahBusuk.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageBuahBusuk < 5 ? "Dalam batas normal" : "Perlu perhatian"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-4 w-4 ${star <= (stats.qualityScore / 20) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Analytics & Assessment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Grade</CardTitle>
            <CardDescription>Sebaran kualitas hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : Object.values(stats.gradingDistribution).some(count => count > 0) ? (
              <div className="space-y-3">
                {Object.entries(stats.gradingDistribution).map(([grade, count]) => {
                  const percentage = stats.totalGradingHariIni > 0 ? 
                    Math.round((count / stats.totalGradingHariIni) * 100) : 0
                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getGradingColor(grade)} variant="outline">
                          Grade {grade}
                        </Badge>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada grading hari ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assessment Terbaru</CardTitle>
                <CardDescription>Pipeline penilaian kualitas</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/grading')}>
                <Clock className="h-4 w-4 mr-1" />
                Lihat Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : stats.recentGradings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentGradings.map((grading: any, index: number) => (
                  <div key={grading.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">{grading.transaksiTimbang?.nomorDo}</div>
                        <div className="text-xs text-muted-foreground">
                          {grading.transaksiTimbang?.pemasok?.nama}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Matang: {grading.buahMatang}% • Busuk: {grading.buahBusuk}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getGradingColor(grading.nilaiGrading)} variant="outline">
                        {grading.nilaiGrading}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(grading.tanggal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada assessment hari ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Operasi grading utama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                className="w-full justify-start h-12" 
                size="lg"
                onClick={() => router.push('/grading')}
              >
                <Award className="h-5 w-5 mr-3" />
                Input Grading Baru
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => router.push('/laporan/grading')}
              >
                <FileText className="h-5 w-5 mr-3" />
                Laporan Grading
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => router.push('/timbangan')}
              >
                <Eye className="h-5 w-5 mr-3" />
                Lihat Transaksi
              </Button>
              {stats.pendingAssessments > 0 && (
                <Button 
                  variant="secondary"
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/grading')}
                >
                  <Clock className="h-5 w-5 mr-3" />
                  {stats.pendingAssessments} Pending Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Supplier Performance</CardTitle>
          <CardDescription>Pemasok dengan kualitas terbaik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topSuppliers.length > 0 ? (
              stats.topSuppliers.map((supplier: any, index: number) => (
                <div key={supplier.pemasok.id} className="p-4 border rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-green-700 bg-white">
                      #{index + 1}
                    </Badge>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= (supplier.averageBuahMatang / 20) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="font-medium">{supplier.pemasok.nama}</div>
                  <div className="text-sm text-muted-foreground mb-2">{supplier.totalGrading} assessments</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Buah Matang:</span>
                    <span className="font-medium text-green-600">{supplier.averageBuahMatang.toFixed(1)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                Belum ada data supplier hari ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}