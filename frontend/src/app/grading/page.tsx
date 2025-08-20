"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { gradingService, timbanganService } from "@/lib/api/services"
import type { Grading, CreateGradingDto, TransaksiTimbang, PaginationResponse } from "@/lib/api/types"

function GradingPageContent() {
  const [gradings, setGradings] = useState<Grading[]>([])
  const [availableTransaksis, setAvailableTransaksis] = useState<TransaksiTimbang[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGrading, setEditingGrading] = useState<Grading | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [formData, setFormData] = useState<CreateGradingDto>({
    transaksiTimbangId: "",
    totalSample: 100,
    buahMatang: 80,
    buahMentah: 15,
    buahBusuk: 2,
    brondolan: 2,
    sampah: 0.5,
    air: 0.5,
    keterangan: "",
    userId: "admin"
  })

  useEffect(() => {
    loadData()
  }, [pagination.page])

  const loadData = async () => {
    try {
      setLoading(true)
      const [gradingData, transaksiData] = await Promise.all([
        gradingService.getAll(pagination.page, pagination.limit),
        timbanganService.getAll(1, 100, 'aktif') // Get all active transactions
      ])
      
      setGradings(gradingData.data)
      setPagination(prev => ({ ...prev, ...gradingData.meta }))
      
      // Filter transactions that don't have grading yet
      const transaksisWithoutGrading = transaksiData.data.filter(
        t => !t.grading && t.status === 'aktif'
      )
      setAvailableTransaksis(transaksisWithoutGrading)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const validatePercentages = () => {
    const total = formData.buahMatang + formData.buahMentah + formData.buahBusuk + 
                  formData.brondolan + formData.sampah + formData.air
    return Math.abs(total - 100) < 0.01
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePercentages()) {
      alert("Total persentase harus sama dengan 100%")
      return
    }

    try {
      if (editingGrading) {
        await gradingService.update(editingGrading.id, formData)
      } else {
        await gradingService.create(formData)
      }
      setDialogOpen(false)
      setEditingGrading(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Failed to save grading:", error)
      alert("Gagal menyimpan data grading")
    }
  }

  const handleEdit = (grading: Grading) => {
    setEditingGrading(grading)
    setFormData({
      transaksiTimbangId: grading.transaksiTimbangId,
      totalSample: grading.totalSample,
      buahMatang: grading.buahMatang,
      buahMentah: grading.buahMentah,
      buahBusuk: grading.buahBusuk,
      brondolan: grading.brondolan,
      sampah: grading.sampah,
      air: grading.air,
      keterangan: grading.keterangan || "",
      userId: grading.userId || "admin"
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data grading ini?")) {
      try {
        await gradingService.delete(id)
        loadData()
      } catch (error) {
        console.error("Failed to delete grading:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      transaksiTimbangId: "",
      totalSample: 100,
      buahMatang: 80,
      buahMentah: 15,
      buahBusuk: 2,
      brondolan: 2,
      sampah: 0.5,
      air: 0.5,
      keterangan: "",
      userId: "admin"
    })
  }

  const openCreateDialog = () => {
    setEditingGrading(null)
    resetForm()
    setDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
  }

  const getGradingColor = (nilai: string) => {
    switch (nilai) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPercentage = formData.buahMatang + formData.buahMentah + formData.buahBusuk + 
                          formData.brondolan + formData.sampah + formData.air

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grading & Sortasi</h1>
          <p className="text-muted-foreground">
            Kelola data grading kualitas TBS (Tandan Buah Segar)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} disabled={availableTransaksis.length === 0}>
              Input Grading
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingGrading ? "Edit Grading" : "Input Grading Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingGrading ? "Edit data grading sortasi" : "Input hasil grading/sortasi kualitas TBS"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transaksiTimbangId" className="text-right">
                    Transaksi *
                  </Label>
                  <Select 
                    value={formData.transaksiTimbangId} 
                    onValueChange={(value) => setFormData({...formData, transaksiTimbangId: value})}
                    disabled={!!editingGrading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih transaksi timbangan" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingGrading ? (
                        <SelectItem value={editingGrading.transaksiTimbangId}>
                          {editingGrading.transaksiTimbang?.nomorDo} - {editingGrading.transaksiTimbang?.pemasok?.nama}
                        </SelectItem>
                      ) : (
                        availableTransaksis.map((transaksi) => (
                          <SelectItem key={transaksi.id} value={transaksi.id}>
                            {transaksi.nomorDo} - {transaksi.pemasok?.nama} ({transaksi.beratNetto.toLocaleString()} kg)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalSample" className="text-right">
                    Total Sample (kg) *
                  </Label>
                  <Input
                    id="totalSample"
                    type="number"
                    step="0.01"
                    value={formData.totalSample}
                    onChange={(e) => setFormData({...formData, totalSample: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Komposisi Grading (%)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buahMatang">Buah Matang (%)</Label>
                      <Input
                        id="buahMatang"
                        type="number"
                        step="0.1"
                        value={formData.buahMatang}
                        onChange={(e) => setFormData({...formData, buahMatang: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="buahMentah">Buah Mentah (%)</Label>
                      <Input
                        id="buahMentah"
                        type="number"
                        step="0.1"
                        value={formData.buahMentah}
                        onChange={(e) => setFormData({...formData, buahMentah: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="buahBusuk">Buah Busuk (%)</Label>
                      <Input
                        id="buahBusuk"
                        type="number"
                        step="0.1"
                        value={formData.buahBusuk}
                        onChange={(e) => setFormData({...formData, buahBusuk: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brondolan">Brondolan (%)</Label>
                      <Input
                        id="brondolan"
                        type="number"
                        step="0.1"
                        value={formData.brondolan}
                        onChange={(e) => setFormData({...formData, brondolan: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sampah">Sampah (%)</Label>
                      <Input
                        id="sampah"
                        type="number"
                        step="0.1"
                        value={formData.sampah}
                        onChange={(e) => setFormData({...formData, sampah: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="air">Air (%)</Label>
                      <Input
                        id="air"
                        type="number"
                        step="0.1"
                        value={formData.air}
                        onChange={(e) => setFormData({...formData, air: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                  </div>
                  <div className={`mt-3 p-2 rounded ${totalPercentage === 100 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    Total: {totalPercentage.toFixed(1)}% {totalPercentage !== 100 && '(Harus 100%)'}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="keterangan" className="text-right">
                    Keterangan
                  </Label>
                  <Input
                    id="keterangan"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={totalPercentage !== 100}>
                  {editingGrading ? "Update" : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Grading</CardTitle>
          <CardDescription>
            Total: {pagination.total} grading | Halaman {pagination.page} dari {pagination.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. DO</TableHead>
                    <TableHead>Pemasok</TableHead>
                    <TableHead>Sample</TableHead>
                    <TableHead>Buah Matang</TableHead>
                    <TableHead>Buah Mentah</TableHead>
                    <TableHead>Buah Busuk</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradings.map((grading) => (
                    <TableRow key={grading.id}>
                      <TableCell className="font-medium">
                        {grading.transaksiTimbang?.nomorDo || "-"}
                      </TableCell>
                      <TableCell>{grading.transaksiTimbang?.pemasok?.nama || "-"}</TableCell>
                      <TableCell>{grading.totalSample.toLocaleString()} kg</TableCell>
                      <TableCell>{grading.buahMatang.toFixed(1)}%</TableCell>
                      <TableCell>{grading.buahMentah.toFixed(1)}%</TableCell>
                      <TableCell>{grading.buahBusuk.toFixed(1)}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradingColor(grading.nilaiGrading || '')}`}>
                          {grading.nilaiGrading || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(grading.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(grading)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(grading.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {gradings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        Belum ada data grading
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {availableTransaksis.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Tidak ada transaksi timbangan yang belum di-grading.
              <br />
              Silakan tambah transaksi timbangan terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function GradingPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "operator_grading", "supervisor"]}>
      <GradingPageContent />
    </ProtectedRoute>
  )
}