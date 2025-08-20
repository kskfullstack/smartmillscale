"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { kendaraanService } from "@/lib/api/services"
import type { Kendaraan, CreateKendaraanDto } from "@/lib/api/types"

function KendaraanPageContent() {
  const [kendaraans, setKendaraans] = useState<Kendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKendaraan, setEditingKendaraan] = useState<Kendaraan | null>(null)
  const [formData, setFormData] = useState<CreateKendaraanDto>({
    nopol: "",
    jenis: "",
    kapasitas: 0,
    merk: "",
    tahun: new Date().getFullYear(),
    status: "aktif"
  })

  useEffect(() => {
    loadKendaraans()
  }, [])

  const loadKendaraans = async () => {
    try {
      setLoading(true)
      const data = await kendaraanService.getAll()
      setKendaraans(data)
    } catch (error) {
      console.error("Failed to load kendaraans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingKendaraan) {
        await kendaraanService.update(editingKendaraan.id, formData)
      } else {
        await kendaraanService.create(formData)
      }
      setDialogOpen(false)
      setEditingKendaraan(null)
      resetForm()
      loadKendaraans()
    } catch (error) {
      console.error("Failed to save kendaraan:", error)
    }
  }

  const handleEdit = (kendaraan: Kendaraan) => {
    setEditingKendaraan(kendaraan)
    setFormData({
      nopol: kendaraan.nopol,
      jenis: kendaraan.jenis,
      kapasitas: kendaraan.kapasitas || 0,
      merk: kendaraan.merk || "",
      tahun: kendaraan.tahun || new Date().getFullYear(),
      status: kendaraan.status
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan kendaraan ini?")) {
      try {
        await kendaraanService.delete(id)
        loadKendaraans()
      } catch (error) {
        console.error("Failed to delete kendaraan:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nopol: "",
      jenis: "",
      kapasitas: 0,
      merk: "",
      tahun: new Date().getFullYear(),
      status: "aktif"
    })
  }

  const openCreateDialog = () => {
    setEditingKendaraan(null)
    resetForm()
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Kendaraan</h1>
          <p className="text-muted-foreground">
            Kelola data kendaraan pengangkut
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Tambah Kendaraan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingKendaraan ? "Edit Kendaraan" : "Tambah Kendaraan"}
                </DialogTitle>
                <DialogDescription>
                  {editingKendaraan ? "Edit data kendaraan" : "Tambah kendaraan baru ke dalam sistem"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nopol" className="text-right">
                    No. Polisi *
                  </Label>
                  <Input
                    id="nopol"
                    value={formData.nopol}
                    onChange={(e) => setFormData({...formData, nopol: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="jenis" className="text-right">
                    Jenis *
                  </Label>
                  <Input
                    id="jenis"
                    value={formData.jenis}
                    onChange={(e) => setFormData({...formData, jenis: e.target.value})}
                    className="col-span-3"
                    placeholder="Truk, Pickup, dll"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kapasitas" className="text-right">
                    Kapasitas (ton)
                  </Label>
                  <Input
                    id="kapasitas"
                    type="number"
                    step="0.1"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({...formData, kapasitas: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="merk" className="text-right">
                    Merk
                  </Label>
                  <Input
                    id="merk"
                    value={formData.merk}
                    onChange={(e) => setFormData({...formData, merk: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tahun" className="text-right">
                    Tahun
                  </Label>
                  <Input
                    id="tahun"
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => setFormData({...formData, tahun: parseInt(e.target.value) || new Date().getFullYear()})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingKendaraan ? "Update" : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kendaraan</CardTitle>
          <CardDescription>
            Total: {kendaraans.length} kendaraan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Polisi</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Merk</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kendaraans.map((kendaraan) => (
                  <TableRow key={kendaraan.id}>
                    <TableCell className="font-medium">{kendaraan.nopol}</TableCell>
                    <TableCell>{kendaraan.jenis}</TableCell>
                    <TableCell>{kendaraan.kapasitas ? `${kendaraan.kapasitas} ton` : "-"}</TableCell>
                    <TableCell>{kendaraan.merk || "-"}</TableCell>
                    <TableCell>{kendaraan.tahun || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        kendaraan.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {kendaraan.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(kendaraan)}
                        >
                          Edit
                        </Button>
                        {kendaraan.status === 'aktif' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(kendaraan.id)}
                          >
                            Nonaktifkan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {kendaraans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Belum ada data kendaraan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function KendaraanPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "supervisor", "operator_timbangan"]}>
      <KendaraanPageContent />
    </ProtectedRoute>
  )
}