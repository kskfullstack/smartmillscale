"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { timbanganService } from "@/lib/api/services"

interface MonthlyReportData {
  year: number
  month: number
  summary: {
    totalTransaksi: number
    totalBeratNetto: number
  }
  bySupplier: Array<{
    pemasok: {
      id: string
      nama: string
      kode: string
    }
    totalTransaksi: number
    totalBeratNetto: number
  }>
  transactions: any[]
}

function LaporanBulananPageContent() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await timbanganService.getMonthlyReport(selectedYear, selectedMonth)
      setReportData(data)
    } catch (error) {
      console.error("Failed to load monthly report:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatWeight = (weight: number) => {
    return `${weight.toLocaleString("id-ID")} kg`
  }

  const formatMonthYear = (month: number, year: number) => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    return `${monthNames[month - 1]} ${year}`
  }

  const printReport = () => {
    window.print()
  }

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan Bulanan</h1>
          <p className="text-muted-foreground">
            Laporan transaksi timbangan per bulan
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih bulan dan tahun untuk melihat laporan bulanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="month">Bulan</Label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Tahun</Label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
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
              <h1 className="text-2xl font-bold">LAPORAN BULANAN TIMBANGAN</h1>
              <h2 className="text-lg">PABRIK KELAPA SAWIT</h2>
              <p className="text-sm text-muted-foreground">
                {formatMonthYear(reportData.month, reportData.year)}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ringkasan Laporan</CardTitle>
                <CardDescription>
                  {formatMonthYear(reportData.month, reportData.year)}
                </CardDescription>
              </div>
              <Button onClick={printReport} variant="outline" className="print:hidden">
                🖨️ Cetak Laporan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {reportData.summary.totalTransaksi}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Transaksi</div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {formatWeight(reportData.summary.totalBeratNetto)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Berat Netto</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rekapitulasi per Pemasok</CardTitle>
              <CardDescription>
                Performance pemasok selama {formatMonthYear(reportData.month, reportData.year)}
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
                      <TableHead className="text-center">Jumlah Transaksi</TableHead>
                      <TableHead className="text-right">Total Berat Netto (kg)</TableHead>
                      <TableHead className="text-right">Rata-rata per Transaksi (kg)</TableHead>
                      <TableHead className="text-right">Persentase (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.bySupplier
                      .sort((a, b) => b.totalBeratNetto - a.totalBeratNetto)
                      .map((supplier, index) => {
                        const percentage = ((supplier.totalBeratNetto / reportData.summary.totalBeratNetto) * 100)
                        const avgPerTransaction = supplier.totalBeratNetto / supplier.totalTransaksi
                        
                        return (
                          <TableRow key={supplier.pemasok.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{supplier.pemasok.kode}</TableCell>
                            <TableCell>{supplier.pemasok.nama}</TableCell>
                            <TableCell className="text-center">{supplier.totalTransaksi}</TableCell>
                            <TableCell className="text-right">{supplier.totalBeratNetto.toLocaleString("id-ID")}</TableCell>
                            <TableCell className="text-right">{avgPerTransaction.toLocaleString("id-ID")}</TableCell>
                            <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada data transaksi pada periode ini
                </div>
              )}
            </CardContent>
          </Card>

          {reportData.bySupplier.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Analisis Kinerja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {reportData.bySupplier.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Jumlah Pemasok Aktif</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {formatWeight(reportData.summary.totalBeratNetto / reportData.summary.totalTransaksi)}
                    </div>
                    <div className="text-sm text-muted-foreground">Rata-rata per Transaksi</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(reportData.summary.totalTransaksi / 30)} per hari
                    </div>
                    <div className="text-sm text-muted-foreground">Rata-rata Transaksi/Hari</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Top 5 Pemasok</h4>
                  <div className="space-y-2">
                    {reportData.bySupplier
                      .sort((a, b) => b.totalBeratNetto - a.totalBeratNetto)
                      .slice(0, 5)
                      .map((supplier, index) => {
                        const percentage = ((supplier.totalBeratNetto / reportData.summary.totalBeratNetto) * 100)
                        return (
                          <div key={supplier.pemasok.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{supplier.pemasok.nama}</div>
                                <div className="text-sm text-muted-foreground">{supplier.totalTransaksi} transaksi</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatWeight(supplier.totalBeratNetto)}</div>
                              <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        )
                      })}
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

export default function LaporanBulananPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "supervisor", "operator_timbangan"]}>
      <LaporanBulananPageContent />
    </ProtectedRoute>
  )
}