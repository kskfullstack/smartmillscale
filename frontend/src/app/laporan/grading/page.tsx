"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { gradingService } from "@/lib/api/services"

interface GradingReportData {
  startDate: string
  endDate: string
  summary: {
    totalGrading: number
    averageBuahMatang: number
    averageBuahMentah: number
    averageBuahBusuk: number
    gradingDistribution: {
      A: number
      B: number
      C: number
      D: number
    }
  }
  bySupplier: Array<{
    pemasok: {
      id: string
      nama: string
      kode: string
    }
    totalGrading: number
    averageBuahMatang: number
    gradingDistribution: {
      A: number
      B: number
      C: number
      D: number
    }
  }>
  gradings: any[]
}

function LaporanGradingPageContent() {
  const today = new Date().toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [reportData, setReportData] = useState<GradingReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await gradingService.getReport(startDate, endDate)
      setReportData(data)
    } catch (error) {
      console.error("Failed to load grading report:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatDateRange = (start: string, end: string) => {
    if (start === end) {
      return formatDate(start)
    }
    return `${formatDate(start)} s/d ${formatDate(end)}`
  }

  const getGradingColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan Grading</h1>
          <p className="text-muted-foreground">
            Laporan kualitas dan grading TBS
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih rentang tanggal untuk melihat laporan grading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={today}
              />
            </div>
            <Button onClick={loadReport} disabled={loading}>
              {loading ? "Loading..." : "Tampilkan Laporan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="print:block hidden">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">LAPORAN GRADING & KUALITAS</h1>
              <h2 className="text-lg">PABRIK KELAPA SAWIT</h2>
              <p className="text-sm text-muted-foreground">
                {formatDateRange(reportData.startDate, reportData.endDate)}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ringkasan Grading</CardTitle>
                <CardDescription>
                  {formatDateRange(reportData.startDate, reportData.endDate)}
                </CardDescription>
              </div>
              <Button onClick={printReport} variant="outline" className="print:hidden">
                🖨️ Cetak Laporan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.summary.totalGrading}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Grading</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.averageBuahMatang.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Rata-rata Buah Matang</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {reportData.summary.averageBuahMentah.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Rata-rata Buah Mentah</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.summary.averageBuahBusuk.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Rata-rata Buah Busuk</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Distribusi Nilai Grading</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(reportData.summary.gradingDistribution).map(([grade, count]) => {
                    const percentage = reportData.summary.totalGrading > 0 
                      ? ((count / reportData.summary.totalGrading) * 100).toFixed(1)
                      : "0.0"
                    
                    return (
                      <div key={grade} className="text-center p-4 border rounded-lg">
                        <div className={`inline-block px-3 py-1 rounded-full text-lg font-bold ${getGradingColor(grade)} mb-2`}>
                          {grade}
                        </div>
                        <div className="text-xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">{percentage}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Grading per Pemasok</CardTitle>
              <CardDescription>
                Kualitas TBS dari masing-masing pemasok
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.bySupplier.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Kode Pemasok</TableHead>
                      <TableHead>Nama Pemasok</TableHead>
                      <TableHead className="text-center">Total Grading</TableHead>
                      <TableHead className="text-center">Avg Buah Matang (%)</TableHead>
                      <TableHead className="text-center">A</TableHead>
                      <TableHead className="text-center">B</TableHead>
                      <TableHead className="text-center">C</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">Performa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.bySupplier
                      .sort((a, b) => b.averageBuahMatang - a.averageBuahMatang)
                      .map((supplier, index) => {
                        const gradeA = supplier.gradingDistribution.A
                        const gradeB = supplier.gradingDistribution.B
                        const gradeC = supplier.gradingDistribution.C
                        const gradeD = supplier.gradingDistribution.D
                        const total = gradeA + gradeB + gradeC + gradeD
                        
                        const performance = total > 0 
                          ? ((gradeA + gradeB) / total * 100).toFixed(1)
                          : "0.0"
                        
                        const performanceColor = parseFloat(performance) >= 80 
                          ? 'text-green-600' 
                          : parseFloat(performance) >= 60 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                        
                        return (
                          <TableRow key={supplier.pemasok.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{supplier.pemasok.kode}</TableCell>
                            <TableCell>{supplier.pemasok.nama}</TableCell>
                            <TableCell className="text-center">{supplier.totalGrading}</TableCell>
                            <TableCell className="text-center">{supplier.averageBuahMatang.toFixed(1)}%</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradingColor('A')}`}>
                                {gradeA}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradingColor('B')}`}>
                                {gradeB}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradingColor('C')}`}>
                                {gradeC}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradingColor('D')}`}>
                                {gradeD}
                              </span>
                            </TableCell>
                            <TableCell className={`text-center font-medium ${performanceColor}`}>
                              {performance}%
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data grading pada periode ini
                </div>
              )}
            </CardContent>
          </Card>

          {reportData.bySupplier.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Analisis Kualitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Top 5 Pemasok Terbaik</h4>
                    <div className="space-y-2">
                      {reportData.bySupplier
                        .sort((a, b) => b.averageBuahMatang - a.averageBuahMatang)
                        .slice(0, 5)
                        .map((supplier, index) => (
                          <div key={supplier.pemasok.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{supplier.pemasok.nama}</div>
                                <div className="text-sm text-muted-foreground">{supplier.totalGrading} grading</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-green-600">{supplier.averageBuahMatang.toFixed(1)}%</div>
                              <div className="text-sm text-muted-foreground">buah matang</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Pemasok Perlu Perhatian</h4>
                    <div className="space-y-2">
                      {reportData.bySupplier
                        .filter(s => s.averageBuahMatang < 70)
                        .sort((a, b) => a.averageBuahMatang - b.averageBuahMatang)
                        .slice(0, 5)
                        .map((supplier, index) => (
                          <div key={supplier.pemasok.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                                ⚠️
                              </div>
                              <div>
                                <div className="font-medium">{supplier.pemasok.nama}</div>
                                <div className="text-sm text-muted-foreground">{supplier.totalGrading} grading</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-red-600">{supplier.averageBuahMatang.toFixed(1)}%</div>
                              <div className="text-sm text-muted-foreground">buah matang</div>
                            </div>
                          </div>
                        ))}
                      {reportData.bySupplier.filter(s => s.averageBuahMatang < 70).length === 0 && (
                        <div className="text-center py-4 text-green-600">
                          👍 Semua pemasok memiliki kualitas yang baik!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="print:block hidden mt-8 text-center text-sm text-muted-foreground">
            <p>Dicetak pada: {new Date().toLocaleString("id-ID")}</p>
            <p>Sistem PKS Timbangan & Grading</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function LaporanGradingPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "supervisor", "operator_grading"]}>
      <LaporanGradingPageContent />
    </ProtectedRoute>
  )
}