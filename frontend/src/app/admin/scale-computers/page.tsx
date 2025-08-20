"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { scaleComputerService } from "@/lib/api/services/scale-computer"
import type { ScaleComputer, CreateScaleComputerDto } from "@/lib/api/types/scale-computer"
import { 
  Plus, 
  Search, 
  Monitor, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff, 
  TestTube,
  RefreshCw,
  Shield,
  Activity
} from "lucide-react"
import { toast } from "sonner"

export default function ScaleComputersPage() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <ScaleComputersContent />
    </ProtectedRoute>
  )
}

function ScaleComputersContent() {
  const [computers, setComputers] = useState<ScaleComputer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingComputer, setEditingComputer] = useState<ScaleComputer | null>(null)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateScaleComputerDto>({
    name: "",
    allowedHostnames: [],
    allowedIPs: [],
    location: "",
    isActive: true
  })

  useEffect(() => {
    loadComputers()
  }, [])

  const loadComputers = async () => {
    try {
      setLoading(true)
      const data = await scaleComputerService.getAll()
      setComputers(data)
    } catch (error) {
      console.error("Failed to load scale computers:", error)
      toast.error("Gagal memuat data komputer timbangan")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await scaleComputerService.create(formData)
      toast.success("Komputer timbangan berhasil ditambahkan")
      setIsCreateDialogOpen(false)
      resetForm()
      loadComputers()
    } catch (error) {
      console.error("Failed to create scale computer:", error)
      toast.error("Gagal menambahkan komputer timbangan")
    }
  }

  const handleEdit = async () => {
    if (!editingComputer) return
    
    try {
      await scaleComputerService.update(editingComputer.id, formData)
      toast.success("Komputer timbangan berhasil diupdate")
      setIsEditDialogOpen(false)
      setEditingComputer(null)
      resetForm()
      loadComputers()
    } catch (error) {
      console.error("Failed to update scale computer:", error)
      toast.error("Gagal mengupdate komputer timbangan")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komputer "${name}"?`)) return
    
    try {
      await scaleComputerService.delete(id)
      toast.success("Komputer timbangan berhasil dihapus")
      loadComputers()
    } catch (error) {
      console.error("Failed to delete scale computer:", error)
      toast.error("Gagal menghapus komputer timbangan")
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await scaleComputerService.toggleActive(id)
      toast.success("Status komputer berhasil diubah")
      loadComputers()
    } catch (error) {
      console.error("Failed to toggle computer status:", error)
      toast.error("Gagal mengubah status komputer")
    }
  }

  const handleTestConnection = async (id: string, name: string) => {
    try {
      setTestingConnection(id)
      const result = await scaleComputerService.testConnection(id)
      
      if (result.success) {
        toast.success(`Koneksi ke "${name}" berhasil`)
      } else {
        toast.error(`Koneksi ke "${name}" gagal: ${result.message}`)
      }
    } catch (error) {
      console.error("Failed to test connection:", error)
      toast.error("Gagal menguji koneksi")
    } finally {
      setTestingConnection(null)
    }
  }

  const openEditDialog = (computer: ScaleComputer) => {
    setEditingComputer(computer)
    setFormData({
      name: computer.name,
      allowedHostnames: computer.allowedHostnames,
      allowedIPs: computer.allowedIPs,
      location: computer.location,
      isActive: computer.isActive
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      allowedHostnames: [],
      allowedIPs: [],
      location: "",
      isActive: true
    })
  }

  const filteredComputers = computers.filter(computer =>
    computer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    computer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    computer.allowedIPs.some(ip => ip.includes(searchTerm))
  )

  const getStatusBadge = (computer: ScaleComputer) => {
    if (!computer.isActive) {
      return <Badge variant="secondary"><PowerOff className="h-3 w-3 mr-1" />Nonaktif</Badge>
    }
    
    // In production, this would check actual status
    const isOnline = Math.random() > 0.3 // Mock 70% online rate
    return (
      <Badge variant={isOnline ? "default" : "destructive"}>
        {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
        {isOnline ? "Online" : "Offline"}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Komputer Timbangan</h1>
          <p className="text-muted-foreground">
            Kelola komputer yang diizinkan mengakses sistem timbangan
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadComputers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Komputer
              </Button>
            </DialogTrigger>
            <CreateEditDialog
              isEdit={false}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama, lokasi, atau IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Computers List */}
      <div className="grid gap-6">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : filteredComputers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm ? "Tidak ada komputer yang sesuai dengan pencarian" : "Belum ada komputer timbangan yang terdaftar"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComputers.map((computer) => (
            <Card key={computer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{computer.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {computer.location}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(computer)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Allowed Hostnames</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {computer.allowedHostnames.map((hostname, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hostname}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Allowed IP Addresses</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {computer.allowedIPs.map((ip, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-mono">
                          {ip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>ID: {computer.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(computer.id, computer.name)}
                      disabled={testingConnection === computer.id}
                    >
                      {testingConnection === computer.id ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-1" />
                      )}
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(computer.id)}
                    >
                      {computer.isActive ? (
                        <PowerOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Power className="h-4 w-4 mr-1" />
                      )}
                      {computer.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(computer)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(computer.id, computer.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <CreateEditDialog
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditDialogOpen(false)
            setEditingComputer(null)
            resetForm()
          }}
        />
      </Dialog>
    </div>
  )
}

interface CreateEditDialogProps {
  isEdit: boolean
  formData: CreateScaleComputerDto
  setFormData: React.Dispatch<React.SetStateAction<CreateScaleComputerDto>>
  onSubmit: () => void
  onCancel: () => void
}

function CreateEditDialog({ isEdit, formData, setFormData, onSubmit, onCancel }: CreateEditDialogProps) {
  const [hostnameInput, setHostnameInput] = useState("")
  const [ipInput, setIpInput] = useState("")

  const addHostname = () => {
    if (hostnameInput.trim() && !formData.allowedHostnames.includes(hostnameInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allowedHostnames: [...prev.allowedHostnames, hostnameInput.trim()]
      }))
      setHostnameInput("")
    }
  }

  const removeHostname = (hostname: string) => {
    setFormData(prev => ({
      ...prev,
      allowedHostnames: prev.allowedHostnames.filter(h => h !== hostname)
    }))
  }

  const addIP = () => {
    if (ipInput.trim() && !formData.allowedIPs.includes(ipInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allowedIPs: [...prev.allowedIPs, ipInput.trim()]
      }))
      setIpInput("")
    }
  }

  const removeIP = (ip: string) => {
    setFormData(prev => ({
      ...prev,
      allowedIPs: prev.allowedIPs.filter(i => i !== ip)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Edit Komputer Timbangan" : "Tambah Komputer Timbangan"}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? "Update informasi komputer timbangan" : "Daftarkan komputer baru yang diizinkan mengakses sistem timbangan"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nama Komputer *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Timbangan Station 1"
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Lokasi *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Gudang Utama"
              required
            />
          </div>
        </div>

        <div>
          <Label>Allowed Hostnames</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              value={hostnameInput}
              onChange={(e) => setHostnameInput(e.target.value)}
              placeholder="e.g., timbangan-1.local"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHostname())}
            />
            <Button type="button" onClick={addHostname} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.allowedHostnames.map((hostname, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeHostname(hostname)}>
                {hostname} ×
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Allowed IP Addresses</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g., 192.168.1.100"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIP())}
            />
            <Button type="button" onClick={addIP} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.allowedIPs.map((ip, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer font-mono" onClick={() => removeIP(ip)}>
                {ip} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Aktifkan komputer ini</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {isEdit ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}