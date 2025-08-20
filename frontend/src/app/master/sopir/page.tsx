"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { sopirService } from "@/lib/api/services"
import type { Sopir, CreateSopirDto } from "@/lib/api/types"

function SopirPageContent() {
  const [sopirs, setSopirs] = useState<Sopir[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSopir, setEditingSopir] = useState<Sopir | null>(null)
  const [formData, setFormData] = useState<CreateSopirDto>({
    nama: "",
    noKtp: "",
    noSim: "",
    telepon: "",
    alamat: "",
    status: "aktif"
  })

  useEffect(() => {
    loadSopirs()
  }, [])

  const loadSopirs = async () => {
    try {
      setLoading(true)
      const data = await sopirService.getAll()
      setSopirs(data)
    } catch (error) {
      console.error("Failed to load sopirs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSopir) {
        await sopirService.update(editingSopir.id, formData)
      } else {
        await sopirService.create(formData)
      }
      setDialogOpen(false)
      setEditingSopir(null)
      resetForm()
      loadSopirs()
    } catch (error) {
      console.error("Failed to save sopir:", error)
    }
  }

  const handleEdit = (sopir: Sopir) => {
    setEditingSopir(sopir)
    setFormData({
      nama: sopir.nama,
      noKtp: sopir.noKtp,
      noSim: sopir.noSim || "",
      telepon: sopir.telepon || "",
      alamat: sopir.alamat || "",
      status: sopir.status
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan sopir ini?")) {
      try {
        await sopirService.delete(id)
        loadSopirs()
      } catch (error) {
        console.error("Failed to delete sopir:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nama: "",
      noKtp: "",
      noSim: "",
      telepon: "",
      alamat: "",
      status: "aktif"
    })
  }

  const openCreateDialog = () => {
    setEditingSopir(null)
    resetForm()
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Sopir</h1>
          <p className="text-muted-foreground">
            Kelola data sopir kendaraan
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Tambah Sopir</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSopir ? "Edit Sopir" : "Tambah Sopir"}
                </DialogTitle>
                <DialogDescription>
                  {editingSopir ? "Edit data sopir" : "Tambah sopir baru ke dalam sistem"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama" className="text-right">
                    Nama *
                  </Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="noKtp" className="text-right">
                    No. KTP *
                  </Label>
                  <Input
                    id="noKtp"
                    value={formData.noKtp}
                    onChange={(e) => setFormData({...formData, noKtp: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="noSim" className="text-right">
                    No. SIM
                  </Label>
                  <Input
                    id="noSim"
                    value={formData.noSim}
                    onChange={(e) => setFormData({...formData, noSim: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telepon" className="text-right">
                    Telepon
                  </Label>
                  <Input
                    id="telepon"
                    value={formData.telepon}
                    onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alamat" className="text-right">
                    Alamat
                  </Label>
                  <Input
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingSopir ? "Update" : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Sopir</CardTitle>
          <CardDescription>
            Total: {sopirs.length} sopir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>No. KTP</TableHead>
                  <TableHead>No. SIM</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sopirs.map((sopir) => (
                  <TableRow key={sopir.id}>
                    <TableCell className="font-medium">{sopir.nama}</TableCell>
                    <TableCell>{sopir.noKtp}</TableCell>
                    <TableCell>{sopir.noSim || "-"}</TableCell>
                    <TableCell>{sopir.telepon || "-"}</TableCell>
                    <TableCell>{sopir.alamat || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sopir.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sopir.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(sopir)}
                        >
                          Edit
                        </Button>
                        {sopir.status === 'aktif' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(sopir.id)}
                          >
                            Nonaktifkan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sopirs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Belum ada data sopir
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

export default function SopirPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "supervisor", "operator_timbangan"]}>
      <SopirPageContent />
    </ProtectedRoute>
  )
}