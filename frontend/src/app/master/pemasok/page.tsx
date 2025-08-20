"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { pemasokService } from "@/lib/api/services"
import type { Pemasok, CreatePemasokDto } from "@/lib/api/types"

function PemasokPageContent() {
  const [pemasoks, setPemasoks] = useState<Pemasok[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPemasok, setEditingPemasok] = useState<Pemasok | null>(null)
  const [formData, setFormData] = useState<CreatePemasokDto>({
    kode: "",
    nama: "",
    alamat: "",
    telepon: "",
    email: "",
    kontak: "",
    status: "aktif"
  })

  useEffect(() => {
    loadPemasoks()
  }, [])

  const loadPemasoks = async () => {
    try {
      setLoading(true)
      const data = await pemasokService.getAll()
      setPemasoks(data)
    } catch (error) {
      console.error("Failed to load pemasoks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPemasok) {
        await pemasokService.update(editingPemasok.id, formData)
      } else {
        await pemasokService.create(formData)
      }
      setDialogOpen(false)
      setEditingPemasok(null)
      resetForm()
      loadPemasoks()
    } catch (error) {
      console.error("Failed to save pemasok:", error)
    }
  }

  const handleEdit = (pemasok: Pemasok) => {
    setEditingPemasok(pemasok)
    setFormData({
      kode: pemasok.kode,
      nama: pemasok.nama,
      alamat: pemasok.alamat || "",
      telepon: pemasok.telepon || "",
      email: pemasok.email || "",
      kontak: pemasok.kontak || "",
      status: pemasok.status
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan pemasok ini?")) {
      try {
        await pemasokService.delete(id)
        loadPemasoks()
      } catch (error) {
        console.error("Failed to delete pemasok:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      kode: "",
      nama: "",
      alamat: "",
      telepon: "",
      email: "",
      kontak: "",
      status: "aktif"
    })
  }

  const openCreateDialog = () => {
    setEditingPemasok(null)
    resetForm()
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Pemasok</h1>
          <p className="text-muted-foreground">
            Kelola data pemasok kelapa sawit
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Tambah Pemasok</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingPemasok ? "Edit Pemasok" : "Tambah Pemasok"}
                </DialogTitle>
                <DialogDescription>
                  {editingPemasok ? "Edit data pemasok" : "Tambah pemasok baru ke dalam sistem"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode" className="text-right">
                    Kode *
                  </Label>
                  <Input
                    id="kode"
                    value={formData.kode}
                    onChange={(e) => setFormData({...formData, kode: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
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
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kontak" className="text-right">
                    Kontak Person
                  </Label>
                  <Input
                    id="kontak"
                    value={formData.kontak}
                    onChange={(e) => setFormData({...formData, kontak: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingPemasok ? "Update" : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pemasok</CardTitle>
          <CardDescription>
            Total: {pemasoks.length} pemasok
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pemasoks.map((pemasok) => (
                  <TableRow key={pemasok.id}>
                    <TableCell className="font-medium">{pemasok.kode}</TableCell>
                    <TableCell>{pemasok.nama}</TableCell>
                    <TableCell>{pemasok.alamat || "-"}</TableCell>
                    <TableCell>{pemasok.telepon || "-"}</TableCell>
                    <TableCell>{pemasok.kontak || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        pemasok.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pemasok.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pemasok)}
                        >
                          Edit
                        </Button>
                        {pemasok.status === 'aktif' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(pemasok.id)}
                          >
                            Nonaktifkan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pemasoks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Belum ada data pemasok
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

export default function PemasokPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "supervisor", "operator_timbangan"]}>
      <PemasokPageContent />
    </ProtectedRoute>
  )
}