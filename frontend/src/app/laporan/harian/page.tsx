"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { timbanganService } from "@/lib/api/services"
import type { TransaksiTimbang } from "@/lib/api/types"

interface DailyReportData {
  date: string
  summary: {
    totalTransaksi: number
    totalBeratBruto: number
    totalBeratTara: number
    totalBeratNetto: number
  }
  transactions: TransaksiTimbang[]
}

function LaporanHarianPageContent() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [reportData, setReportData] = useState<DailyReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await timbanganService.getDailyReport(selectedDate)
      setReportData(data)
    } catch (error) {
      console.error("Failed to load daily report:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatWeight = (weight: number) => {
    return `${weight.toLocaleString("id-ID")} kg`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
  }

  const formatDateLabel = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan Harian</h1>
          <p className="text-muted-foreground">
            Laporan transaksi timbangan per hari
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>
            Pilih tanggal untuk melihat laporan harian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
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
              <h1 className="text-2xl font-bold">LAPORAN HARIAN TIMBANGAN</h1>
              <h2 className="text-lg">PABRIK KELAPA SAWIT</h2>
              <p className="text-sm text-muted-foreground">
                {formatDateLabel(reportData.date)}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ringkasan Laporan</CardTitle>
                <CardDescription>
                  {formatDateLabel(reportData.date)}
                </CardDescription>
              </div>
              <Button onClick={printReport} variant="outline" className="print:hidden">
                🖨️ Cetak Laporan
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.summary.totalTransaksi}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Transaksi</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatWeight(reportData.summary.totalBeratBruto)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Bruto</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatWeight(reportData.summary.totalBeratTara)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tara</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatWeight(reportData.summary.totalBeratNetto)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Netto</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
              <CardDescription>
                Daftar semua transaksi pada {formatDateLabel(reportData.date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>No. DO</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Pemasok</TableHead>
                      <TableHead>Sopir</TableHead>
                      <TableHead>Nopol</TableHead>
                      <TableHead className="text-right">Bruto (kg)</TableHead>
                      <TableHead className="text-right">Tara (kg)</TableHead>
                      <TableHead className="text-right">Netto (kg)</TableHead>
                      <TableHead>Grading</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.transactions.map((transaksi, index) => (
                      <TableRow key={transaksi.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{transaksi.nomorDo}</TableCell>
                        <TableCell>{formatDate(transaksi.tanggal)}</TableCell>
                        <TableCell>{transaksi.pemasok?.nama || "-"}</TableCell>
                        <TableCell>{transaksi.sopir?.nama || "-"}</TableCell>
                        <TableCell>{transaksi.kendaraan?.nopol || "-"}</TableCell>
                        <TableCell className="text-right">{transaksi.beratBruto.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right">{transaksi.beratTara.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right font-medium">{transaksi.beratNetto.toLocaleString("id-ID")}</TableCell>
                        <TableCell>
                          {transaksi.grading ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaksi.grading.nilaiGrading === 'A' ? 'bg-green-100 text-green-800' :
                              transaksi.grading.nilaiGrading === 'B' ? 'bg-blue-100 text-blue-800' :
                              transaksi.grading.nilaiGrading === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaksi.grading.nilaiGrading}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Belum</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada transaksi pada tanggal ini
                </div>
              )}
            </CardContent>
          </Card>

          {reportData.transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rekapitulasi per Pemasok</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pemasok</TableHead>
                      <TableHead className="text-center">Jumlah Transaksi</TableHead>
                      <TableHead className="text-right">Total Netto (kg)</TableHead>
                      <TableHead className="text-right">Rata-rata per Transaksi (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(
                      reportData.transactions.reduce((acc, t) => {
                        const pemasokId = t.pemasokId
                        if (!acc[pemasokId]) {
                          acc[pemasokId] = {
                            nama: t.pemasok?.nama || 'Unknown',
                            jumlah: 0,
                            totalNetto: 0
                          }
                        }
                        acc[pemasokId].jumlah++
                        acc[pemasokId].totalNetto += t.beratNetto
                        return acc
                      }, {} as Record<string, { nama: string; jumlah: number; totalNetto: number }>)
                    ).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell className="text-center">{item.jumlah}</TableCell>
                        <TableCell className="text-right">{item.totalNetto.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right">{(item.totalNetto / item.jumlah).toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

export default function LaporanHarianPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "supervisor", "operator_timbangan"]}>
      <LaporanHarianPageContent />
    </ProtectedRoute>
  )
}