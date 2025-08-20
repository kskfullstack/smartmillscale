"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSocket, ScaleData } from "@/hooks/useSocket"
import { timbanganService, pemasokService, sopirService, kendaraanService } from "@/lib/api/services"
import { downloadWeighingReceipt } from "@/lib/pdf-generator"
import type { CreateTransaksiTimbangDto, CreatePendingTimbangDto, PendingTimbang, Pemasok, Sopir, Kendaraan, Blok } from "@/lib/api/types"
import { Scale, Wifi, WifiOff, Play, Square, RotateCcw, Save, AlertTriangle, CheckCircle, ArrowRight, CheckSquare, Truck, FileText, Calculator, Home } from "lucide-react"
import { toast } from "sonner"

interface TBSDetailBlok {
  blokId: string
  jumlahJanjang: number
  brodolan: number
  bjr: number
}

interface WeighingTransaction {
  nomorTiket: string
  tanggal: string
  produkId: string
  kendaraanNopol: string
  sopirId?: string
  sopirManual?: string
  pemasokId: string
  beratMasuk?: number
  beratKeluar?: number
  waktuMasuk?: string
  waktuKeluar?: string
  tbsDetail?: TBSDetailBlok[]
  keterangan: string
  status: 'pending' | 'completed'
}

function TimbanganPageContent() {
  const { isConnected, scaleData, startWeighing, stopWeighing, tareScale } = useSocket()
  
  // Master Data
  const [pemasoks, setPemasoks] = useState<Pemasok[]>([])
  const [sopirs, setSopirs] = useState<Sopir[]>([])
  const [kendaraans, setKendaraans] = useState<Kendaraan[]>([])
  const [bloks, setBloks] = useState<Blok[]>([])
  const [loading, setLoading] = useState(true)
  
  // Weighing State
  const [isWeighing, setIsWeighing] = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number | null>(null)
  const [weighingMode, setWeighingMode] = useState<'masuk' | 'keluar'>('masuk')
  
  // Transaction State
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk')
  const [pendingTransactions, setPendingTransactions] = useState<WeighingTransaction[]>([])
  const [selectedPendingId, setSelectedPendingId] = useState<string>('')
  
  // Form Data for Masuk
  const [masukFormData, setMasukFormData] = useState({
    produkId: 'TBS',
    kendaraanNopol: '',
    sopirId: '',
    sopirManual: '',
    pemasokId: '',
    keterangan: '',
    tbsDetail: [] as TBSDetailBlok[]
  })
  
  // TBS Detail State
  const [showTBSDetail, setShowTBSDetail] = useState(false)
  const [tbsDetailForm, setTbsDetailForm] = useState<TBSDetailBlok>({
    blokId: '',
    jumlahJanjang: 0,
    brodolan: 0,
    bjr: 0
  })

  const productOptions = [
    { value: 'TBS', label: '🌴 TBS (Tandan Buah Segar)', color: 'bg-green-100 text-green-800', requiresBlok: true },
    { value: 'CPO', label: '🛢️ CPO (Crude Palm Oil)', color: 'bg-orange-100 text-orange-800', requiresBlok: false },
    { value: 'Kernel', label: '🥥 Kernel (Inti Sawit)', color: 'bg-brown-100 text-brown-800', requiresBlok: false },
    { value: 'PKE', label: '🌰 PKE (Palm Kernel Expeller)', color: 'bg-yellow-100 text-yellow-800', requiresBlok: false },
    { value: 'Cangkang', label: '🥚 Cangkang (Shell)', color: 'bg-gray-100 text-gray-800', requiresBlok: false },
    { value: 'Serat', label: '🧵 Serat (Fiber)', color: 'bg-blue-100 text-blue-800', requiresBlok: false },
  ]

  useEffect(() => {
    // Set demo data FIRST before attempting API calls
    // Add 5 demo pemasok data for testing
    setPemasoks([
      { id: '1', kode: 'PS001', nama: 'PT Sawit Jaya Makmur', alamat: 'Jl. Raya Pekanbaru KM 15, Riau', telepon: '0761-234567', email: 'info@sawitjaya.co.id', kontak: 'Budi Santoso', status: 'active', createdAt: '', updatedAt: '' },
      { id: '2', kode: 'PS002', nama: 'CV Kebun Hijau Sejahtera', alamat: 'Jl. Lintas Sumatra No. 45, Medan', telepon: '061-987654', email: 'admin@kebunhijau.com', kontak: 'Sari Dewi', status: 'active', createdAt: '', updatedAt: '' },
      { id: '3', kode: 'PS003', nama: 'PT Agro Prima Nusantara', alamat: 'Jl. Sudirman No. 123, Jambi', telepon: '0741-456789', email: 'contact@agroprima.id', kontak: 'Andi Wijaya', status: 'active', createdAt: '', updatedAt: '' },
      { id: '4', kode: 'PS004', nama: 'Koperasi Tani Mandiri', alamat: 'Jl. Gotong Royong No. 88, Palembang', telepon: '0711-333222', email: 'koperasi@tanimandiri.org', kontak: 'Hendra Kurnia', status: 'active', createdAt: '', updatedAt: '' },
      { id: '5', kode: 'PS005', nama: 'PT Perkebunan Nusa Indah', alamat: 'Jl. Industri Raya No. 77, Batam', telepon: '0778-888999', email: 'sales@nusaindah.co.id', kontak: 'Maya Sari', status: 'active', createdAt: '', updatedAt: '' }
    ])
    setSopirs([
      { id: '1', nama: 'Ahmad Supardi', noKtp: '1471082505890001', noSim: 'A1234567890', telepon: '0812-3456-7890', alamat: 'Jl. Kartini No. 15, Pekanbaru', status: 'active', createdAt: '', updatedAt: '' },
      { id: '2', nama: 'Budi Rahardjo', noKtp: '1471082505890002', noSim: 'A1234567891', telepon: '0813-4567-8901', alamat: 'Jl. Merdeka No. 22, Medan', status: 'active', createdAt: '', updatedAt: '' },
      { id: '3', nama: 'Candra Wijaya', noKtp: '1471082505890003', noSim: 'A1234567892', telepon: '0814-5678-9012', alamat: 'Jl. Diponegoro No. 33, Jambi', status: 'active', createdAt: '', updatedAt: '' },
      { id: '4', nama: 'Dedi Kurniawan', noKtp: '1471082505890004', noSim: 'A1234567893', telepon: '0815-6789-0123', alamat: 'Jl. Sudirman No. 44, Palembang', status: 'active', createdAt: '', updatedAt: '' },
      { id: '5', nama: 'Eko Prasetyo', noKtp: '1471082505890005', noSim: 'A1234567894', telepon: '0816-7890-1234', alamat: 'Jl. Ahmad Yani No. 55, Batam', status: 'active', createdAt: '', updatedAt: '' }
    ])
    // Add 5 demo kendaraan data with realistic details
    setKendaraans([
      { id: '1', nopol: 'BM 1234 XYZ', jenis: 'Truck Fuso', kapasitas: 10000, merk: 'Mitsubishi Fuso', tahun: 2020, sopirId: '1', status: 'active', createdAt: '', updatedAt: '' },
      { id: '2', nopol: 'BM 5678 ABC', jenis: 'Truck Ranger', kapasitas: 12000, merk: 'Hino Ranger', tahun: 2021, sopirId: '2', status: 'active', createdAt: '', updatedAt: '' },
      { id: '3', nopol: 'BM 9012 DEF', jenis: 'Truck Giga', kapasitas: 8000, merk: 'Isuzu Giga', tahun: 2019, sopirId: '3', status: 'active', createdAt: '', updatedAt: '' },
      { id: '4', nopol: 'BM 3456 GHI', jenis: 'Truck Canter', kapasitas: 15000, merk: 'Mitsubishi Canter', tahun: 2022, sopirId: '4', status: 'active', createdAt: '', updatedAt: '' },
      { id: '5', nopol: 'BM 7890 JKL', jenis: 'Pickup Hilux', kapasitas: 5000, merk: 'Toyota Hilux', tahun: 2020, sopirId: '5', status: 'active', createdAt: '', updatedAt: '' }
    ])
    // Add 5 demo blok data with detailed information
    setBloks([
      { id: '1', kode: 'BLK-A01', nama: 'Blok Afdeling A Area 1', luasHektar: 12.5, jumlahPohon: 1450, tahunTanam: 2015, status: 'active', createdAt: '', updatedAt: '' },
      { id: '2', kode: 'BLK-A02', nama: 'Blok Afdeling A Area 2', luasHektar: 10.8, jumlahPohon: 1296, tahunTanam: 2016, status: 'active', createdAt: '', updatedAt: '' },
      { id: '3', kode: 'BLK-B01', nama: 'Blok Afdeling B Area 1', luasHektar: 15.2, jumlahPohon: 1824, tahunTanam: 2014, status: 'active', createdAt: '', updatedAt: '' },
      { id: '4', kode: 'BLK-B02', nama: 'Blok Afdeling B Area 2', luasHektar: 9.7, jumlahPohon: 1164, tahunTanam: 2017, status: 'active', createdAt: '', updatedAt: '' },
      { id: '5', kode: 'BLK-C01', nama: 'Blok Afdeling C Area 1', luasHektar: 13.3, jumlahPohon: 1596, tahunTanam: 2013, status: 'active', createdAt: '', updatedAt: '' }
    ])

    // Then try to load from API (will only override if API has data)
    loadMasterData()
    loadPendingTransactions()

    // Add 5 mock pending transactions with 2-decimal weights
    const mockPendingTransactions: WeighingTransaction[] = [
      {
        nomorTiket: 'TKT241217080530',
        tanggal: new Date().toISOString(),
        produkId: 'TBS',
        kendaraanNopol: 'BM 1234 XYZ',
        sopirId: '1',
        pemasokId: '1',
        beratMasuk: 15750.75,
        waktuMasuk: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        tbsDetail: [
          { blokId: '1', jumlahJanjang: 280, brodolan: 15, bjr: 0 },
          { blokId: '2', jumlahJanjang: 150, brodolan: 8, bjr: 0 }
        ],
        keterangan: 'TBS Grade A dari Blok A1-A2',
        status: 'pending'
      },
      {
        nomorTiket: 'TKT241217083215',
        tanggal: new Date().toISOString(),
        produkId: 'TBS',
        kendaraanNopol: 'BM 5678 ABC',
        sopirId: '2',
        pemasokId: '2',
        beratMasuk: 18250.25,
        waktuMasuk: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        tbsDetail: [
          { blokId: '3', jumlahJanjang: 320, brodolan: 12, bjr: 0 }
        ],
        keterangan: 'TBS segar pagi hari',
        status: 'pending'
      },
      {
        nomorTiket: 'TKT241217085745',
        tanggal: new Date().toISOString(),
        produkId: 'CPO',
        kendaraanNopol: 'BM 9012 DEF',
        sopirId: '3',
        pemasokId: '1',
        beratMasuk: 22100.50,
        waktuMasuk: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
        keterangan: 'CPO Grade Premium',
        status: 'pending'
      },
      {
        nomorTiket: 'TKT241217091030',
        tanggal: new Date().toISOString(),
        produkId: 'TBS',
        kendaraanNopol: 'BM 3456 GHI',
        sopirId: '4',
        pemasokId: '3',
        beratMasuk: 16890.85,
        waktuMasuk: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        tbsDetail: [
          { blokId: '1', jumlahJanjang: 195, brodolan: 10, bjr: 0 },
          { blokId: '4', jumlahJanjang: 165, brodolan: 5, bjr: 0 },
          { blokId: '5', jumlahJanjang: 140, brodolan: 8, bjr: 0 }
        ],
        keterangan: 'TBS campuran 3 blok',
        status: 'pending'
      },
      {
        nomorTiket: 'TKT241217092500',
        tanggal: new Date().toISOString(),
        produkId: 'Kernel',
        kendaraanNopol: 'BM 7890 JKL',
        sopirId: '5',
        pemasokId: '4',
        beratMasuk: 8750.15,
        waktuMasuk: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        keterangan: 'Kernel kering siap ekspor',
        status: 'pending'
      }
    ]

    setPendingTransactions(mockPendingTransactions)
  }, [])

  useEffect(() => {
    if (masukFormData.produkId === 'TBS') {
      setShowTBSDetail(true)
    } else {
      setShowTBSDetail(false)
      setMasukFormData(prev => ({ ...prev, tbsDetail: [] }))
    }
  }, [masukFormData.produkId])

  useEffect(() => {
    if (masukFormData.kendaraanNopol) {
      const selectedKendaraan = kendaraans.find(k => k.nopol === masukFormData.kendaraanNopol)
      if (selectedKendaraan?.sopirId) {
        const sopir = sopirs.find(s => s.id === selectedKendaraan.sopirId)
        if (sopir && !masukFormData.sopirManual) {
          // Only auto-populate if manual field is empty
          setMasukFormData(prev => ({ 
            ...prev, 
            sopirId: selectedKendaraan.sopirId,
            sopirManual: sopir.nama
          }))
        }
      }
    }
  }, [masukFormData.kendaraanNopol, kendaraans, sopirs, masukFormData.sopirManual])

  const loadMasterData = async () => {
    try {
      setLoading(true)
      // Try to load from API but always use demo data as fallback
      try {
        const [pemasokData, sopirData, kendaraanData] = await Promise.all([
          pemasokService.getActive().catch(() => []),
          sopirService.getActive().catch(() => []),
          kendaraanService.getActive().catch(() => [])
        ])
        
        // Only use API data if it has content, otherwise keep demo data
        if (pemasokData && pemasokData.length > 0) {
          setPemasoks(pemasokData)
        }
        if (sopirData && sopirData.length > 0) {
          setSopirs(sopirData)
        }
        if (kendaraanData && kendaraanData.length > 0) {
          setKendaraans(kendaraanData)
        }
      } catch (apiError) {
        console.log("API not available, using demo data for master data")
      }
    } catch (error) {
      console.error("Failed to load master data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPendingTransactions = async () => {
    try {
      // Try to load from API, but use demo data as fallback
      const pendingData = await timbanganService.getPending()
      console.log("Loaded pending transactions from API:", pendingData)
      
      // If API returns empty or null, keep demo data
      if (pendingData && Array.isArray(pendingData) && pendingData.length > 0) {
        setPendingTransactions(pendingData)
      }
    } catch (error) {
      console.log("API not available, using demo data for pending transactions")
      // Demo data will be set in useEffect, so no need to set empty array
    }
  }

  // Ticket numbers are now generated by the backend API

  const handleStartWeighing = () => {
    setIsWeighing(true)
    startWeighing()
  }

  const handleStopWeighing = () => {
    setIsWeighing(false)
    stopWeighing()
  }

  const handleTareScale = () => {
    tareScale()
  }

  const isWeightStable = () => {
    return scaleData?.status === 'stable'
  }

  const handleAmbilBeratMasuk = async () => {
    console.log("handleAmbilBeratMasuk called")
    console.log("Scale data:", scaleData)
    console.log("Weight stable:", isWeightStable())
    
    if (!isWeightStable() || !scaleData) {
      toast.error("Berat tidak stabil!", {
        description: "Tunggu hingga status STABLE untuk mengambil berat."
      })
      return
    }

    if (!validateMasukForm()) {
      console.log("Form validation failed")
      return
    }

    try {
      // Find kendaraan ID from nopol
      const selectedKendaraan = kendaraans.find(k => k.nopol === masukFormData.kendaraanNopol)
      if (!selectedKendaraan) {
        toast.error("Kendaraan tidak ditemukan!", {
          description: "Pilih kendaraan yang valid dari master data."
        })
        return
      }

      // Prepare data for backend API
      const createData: CreateTransaksiTimbangDto = {
        nomorDo: `DO${Date.now()}`, // Generate DO number
        pemasokId: masukFormData.pemasokId,
        sopirId: masukFormData.sopirId || selectedKendaraan.sopirId, // Use sopir from form or kendaraan
        kendaraanId: selectedKendaraan.id, // Use actual kendaraan ID
        jenisBarang: masukFormData.produkId, // Add the missing jenisBarang field
        beratBruto: scaleData.weight,
        beratTara: 0, // Will be set when completing the transaction
        keterangan: masukFormData.keterangan
      }

      // Call backend API to create transaction
      console.log("Creating transaction via API:", createData)
      const createdTransaction = await timbanganService.create(createData)
      
      // Add the response (with generated nomorTiket) to local state
      setPendingTransactions(prev => [...prev, {
        ...createdTransaction,
        status: 'pending'
      } as WeighingTransaction])
      
      resetMasukForm()
      
      toast.success("Timbangan Masuk berhasil!", {
        description: `Tiket: ${createdTransaction.nomorTiket} • Berat: ${formatWeight(scaleData.weight)} kg`
      })
    } catch (error) {
      console.error("Failed to save masuk transaction:", error)
      toast.error("Gagal menyimpan transaksi masuk!", {
        description: "Silakan coba lagi atau hubungi administrator."
      })
    }
  }

  const handleAmbilBeratKeluar = async () => {
    if (!isWeightStable() || !scaleData) {
      toast.error("Berat tidak stabil!", {
        description: "Tunggu hingga status STABLE untuk mengambil berat."
      })
      return
    }

    if (!selectedPendingId) {
      toast.error("Pilih transaksi pending!", {
        description: "Pilih transaksi dari daftar antrian pending terlebih dahulu."
      })
      return
    }

    try {
      const selectedTransaction = pendingTransactions.find(t => t.nomorTiket === selectedPendingId)
      if (!selectedTransaction) {
        toast.error("Transaksi tidak ditemukan!", {
          description: "Transaksi yang dipilih tidak tersedia."
        })
        return
      }

      const beratNetto = (selectedTransaction.beratMasuk || 0) - scaleData.weight
      
      const updatedTransaction = {
        ...selectedTransaction,
        beratKeluar: scaleData.weight,
        waktuKeluar: new Date().toISOString(),
        status: 'completed' as const
      }

      if (selectedTransaction.produkId === 'TBS' && selectedTransaction.tbsDetail) {
        updatedTransaction.tbsDetail = calculateBJR(selectedTransaction.tbsDetail, beratNetto)
      }

      // For demo purposes, simulate completion
      console.log("Completing transaction:", updatedTransaction)
      
      // Remove from pending list
      setPendingTransactions(prev => prev.filter(t => t.nomorTiket !== selectedPendingId))
      setSelectedPendingId('')
      
      // Simulate receipt download
      console.log("Downloading receipt for:", selectedTransaction.nomorTiket)
      
      toast.success("Timbangan Keluar berhasil!", {
        description: `${selectedTransaction.nomorTiket} • Netto: ${formatWeight(beratNetto)} kg • Receipt didownload`
      })
    } catch (error) {
      console.error("Failed to complete transaction:", error)
      toast.error("Gagal menyelesaikan transaksi!", {
        description: "Silakan coba lagi atau hubungi administrator."
      })
    }
  }

  const validateMasukForm = () => {
    console.log("Validating form data:", masukFormData)
    
    if (!masukFormData.produkId) {
      toast.error("Produk wajib dipilih!", {
        description: "Silakan pilih jenis produk dari dropdown."
      })
      return false
    }
    if (!masukFormData.kendaraanNopol) {
      toast.error("Kendaraan wajib diisi!", {
        description: "Input nomor polisi kendaraan."
      })
      return false
    }
    if (!masukFormData.sopirManual) {
      toast.error("Sopir wajib diisi!", {
        description: "Input nama sopir."
      })
      return false
    }
    if (!masukFormData.pemasokId) {
      toast.error("Pemasok wajib dipilih!", {
        description: "Silakan pilih pemasok dari master data."
      })
      return false
    }
    if (masukFormData.produkId === 'TBS' && masukFormData.tbsDetail.length === 0) {
      toast.error("Detail blok TBS wajib diisi!", {
        description: "Tambahkan minimal satu detail blok untuk produk TBS."
      })
      return false
    }
    console.log("Form validation passed!")
    return true
  }

  const calculateBJR = (tbsDetail: TBSDetailBlok[], beratNetto: number): TBSDetailBlok[] => {
    return tbsDetail.map(detail => ({
      ...detail,
      bjr: beratNetto / (detail.jumlahJanjang || 1)
    }))
  }

  const addTBSDetail = () => {
    if (!tbsDetailForm.blokId || tbsDetailForm.jumlahJanjang <= 0) {
      toast.error("Data blok belum lengkap!", {
        description: "Pilih blok dan input jumlah janjang yang valid."
      })
      return
    }

    setMasukFormData(prev => ({
      ...prev,
      tbsDetail: [...prev.tbsDetail, { ...tbsDetailForm }]
    }))

    setTbsDetailForm({
      blokId: '',
      jumlahJanjang: 0,
      brodolan: 0,
      bjr: 0
    })

    toast.success("Detail blok ditambahkan!", {
      description: `Blok ${bloks.find(b => b.id === tbsDetailForm.blokId)?.kode} berhasil ditambahkan.`
    })
  }

  const removeTBSDetail = (index: number) => {
    setMasukFormData(prev => ({
      ...prev,
      tbsDetail: prev.tbsDetail.filter((_, i) => i !== index)
    }))
  }

  const resetMasukForm = () => {
    setMasukFormData({
      produkId: 'TBS',
      kendaraanNopol: '',
      sopirId: '',
      sopirManual: '',
      pemasokId: '',
      keterangan: '',
      tbsDetail: []
    })
    setTbsDetailForm({
      blokId: '',
      jumlahJanjang: 0,
      brodolan: 0,
      bjr: 0
    })
  }

  const formatWeight = (weight: number) => {
    return weight.toLocaleString("id-ID", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'stable': return 'text-green-600'
      case 'unstable': return 'text-yellow-600'
      case 'overload': return 'text-red-600'
      case 'underload': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'stable': return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'unstable': return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'overload': return <AlertTriangle className="h-6 w-6 text-red-600" />
      case 'underload': return <AlertTriangle className="h-6 w-6 text-orange-600" />
      default: return <Scale className="h-6 w-6 text-gray-600" />
    }
  }

  const getSelectedKendaraan = () => {
    return kendaraans.find(k => k.nopol === masukFormData.kendaraanNopol)
  }

  const getSelectedSopir = () => {
    if (masukFormData.sopirId) {
      return sopirs.find(s => s.id === masukFormData.sopirId)
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p className="text-lg">Loading master data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 font-['Inter']">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SmartMillScale</h1>
              <p className="text-gray-600 text-sm">Timbang Otomatis, Proses Sistematis</p>
            </div>
          </div>

          {/* Navigation Menu in Header */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-4 w-4" />
                <span className="font-semibold">Home</span>
              </Button>
            </div>

            <div className="flex items-center space-x-6 border-l border-gray-200 pl-6">
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">Tanggal Hari Ini</div>
                <div className="text-sm font-semibold text-gray-900">
                  {new Date().toLocaleDateString("id-ID", { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">Status Koneksi</div>
                <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  <span className="font-semibold text-sm">{isConnected ? 'Terhubung' : 'Terputus'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full p-4 space-y-4">
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          {/* Weight Display Panel - Left Side */}
          <div className="flex flex-col">
            <Card className="bg-white shadow-xl border-0 rounded-3xl overflow-hidden flex-1">
              <CardContent className="p-6 h-full flex flex-col">
                {/* Current Transaction Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Transaksi Aktif</h3>
                      <p className="text-gray-500">
                        {activeTab === 'masuk' ? 'Timbangan Masuk' : 'Timbangan Keluar'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Nomor Tiket</div>
                    <div className="text-xl font-bold text-gray-900 font-mono">
                      {selectedPendingId || 'AUTO-GENERATE'}
                    </div>
                  </div>
                </div>

                {/* Digital Weight Display */}
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className={`bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-3xl p-8 shadow-2xl border-4 ${
                    isWeightStable() ? 'border-green-400 shadow-green-500/20' : 'border-gray-600'
                  }`}>
                    <div className="flex items-center justify-center space-x-6 mb-6">
                      <div className={`p-3 rounded-2xl ${
                        isWeightStable() 
                          ? 'bg-green-500/20 text-green-400 animate-pulse' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {getStatusIcon(scaleData?.status)}
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold mb-1 ${getStatusColor(scaleData?.status)}`}>
                          {scaleData?.status?.toUpperCase() || 'WAITING'}
                        </div>
                        <div className="text-green-300 text-xs">
                          {scaleData?.timestamp ? 
                            new Date(scaleData.timestamp).toLocaleTimeString("id-ID") : 
                            'Tidak ada data'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-6xl font-bold font-mono mb-4 tracking-wider ${
                      isWeightStable() 
                        ? 'text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]' 
                        : 'text-amber-400'
                    }`}>
                      {scaleData ? formatWeight(scaleData.weight) : '0.00'}
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3">
                      <div className="text-2xl text-green-300 font-bold">
                        {scaleData?.unit || 'KG'}
                      </div>
                      {isWeightStable() && (
                        <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 font-semibold text-sm">STABLE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modern Control Buttons */}
                <div className="flex justify-center space-x-3 mt-4">
                  <Button
                    onClick={handleStartWeighing}
                    disabled={!isConnected || isWeighing}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-2xl shadow-lg transition-all duration-300 ${
                      isWeighing 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    <Play className="h-4 w-4" />
                    <span className="font-semibold">Start</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleStopWeighing}
                    disabled={!isConnected || !isWeighing}
                    className="flex items-center space-x-2 px-4 py-2 rounded-2xl border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Square className="h-4 w-4" />
                    <span className="font-semibold">Stop</span>
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleTareScale}
                    disabled={!isConnected}
                    className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-lg transition-all duration-300"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-semibold">Tare</span>
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Transaction Forms - Right Side */}
          <div className="flex flex-col">
            <Card className="bg-white shadow-xl border-0 rounded-3xl overflow-hidden flex-1">
              <CardContent className="p-4 h-full flex flex-col">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'masuk' | 'keluar')} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-2xl mb-4">
                    <TabsTrigger 
                      value="masuk" 
                      className="flex items-center space-x-2 text-sm py-2 px-3 rounded-xl data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                    >
                      <Truck className="h-4 w-4" />
                      <span className="font-semibold">Masuk</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="keluar" 
                      className="flex items-center space-x-2 text-sm py-2 px-3 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold">Keluar</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Modern Timbangan Masuk Tab */}
                  <TabsContent value="masuk" className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Form Timbangan Masuk</h3>
                        <p className="text-gray-500 text-sm">Lengkapi data untuk proses timbangan masuk</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {/* Product Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-900 flex items-center">
                            <div className="p-1 bg-blue-100 rounded-lg mr-2">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            </div>
                            Produk <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select value={masukFormData.produkId} onValueChange={(value) => 
                            setMasukFormData(prev => ({ ...prev, produkId: value }))
                          }>
                            <SelectTrigger className="h-10 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors">
                              <SelectValue placeholder="Pilih jenis produk" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white border-2 border-gray-200">
                              {productOptions.map((product) => (
                                <SelectItem key={product.value} value={product.value} className="rounded-lg bg-white hover:bg-gray-100">
                                  <span className="text-sm">{product.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Vehicle Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-900 flex items-center">
                            <div className="p-1 bg-green-100 rounded-lg mr-2">
                              <Truck className="w-3 h-3 text-green-600" />
                            </div>
                            Nomor Polisi Kendaraan <span className="text-red-500 ml-1">*</span>
                          </Label>
                          
                          <div className="relative">
                            <Input
                              value={masukFormData.kendaraanNopol}
                              onChange={(e) => setMasukFormData(prev => ({ ...prev, kendaraanNopol: e.target.value.toUpperCase() }))}
                              placeholder="Input nomor polisi (contoh: BM 1234 ABC)"
                              className="h-10 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors"
                              list="kendaraan-suggestions"
                            />
                            <datalist id="kendaraan-suggestions">
                              {kendaraans.map((kendaraan) => (
                                <option key={kendaraan.id} value={kendaraan.nopol}>
                                  {kendaraan.nopol} - {kendaraan.jenis}
                                </option>
                              ))}
                            </datalist>
                            {getSelectedKendaraan() && (
                              <div className="mt-1 text-xs text-green-600 font-semibold">
                                ✓ {getSelectedKendaraan()?.jenis} (dari database)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Driver Selection/Input */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-900 flex items-center">
                            <div className="p-1 bg-orange-100 rounded-lg mr-2">
                              <ArrowRight className="w-3 h-3 text-orange-600" />
                            </div>
                            Nama Sopir <span className="text-red-500 ml-1">*</span>
                          </Label>
                          
                          <div className="relative">
                            <Input
                              value={masukFormData.sopirManual}
                              onChange={(e) => setMasukFormData(prev => ({ 
                                ...prev, 
                                sopirManual: e.target.value,
                                sopirId: '' // Clear sopirId when manually editing
                              }))}
                              placeholder="Input nama sopir"
                              className="h-10 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors"
                              list="sopir-suggestions"
                            />
                            <datalist id="sopir-suggestions">
                              {sopirs.map((sopir) => (
                                <option key={sopir.id} value={sopir.nama}>
                                  {sopir.nama} - {sopir.noKtp}
                                </option>
                              ))}
                            </datalist>
                            {getSelectedKendaraan()?.sopirId && masukFormData.sopirId && (
                              <div className="mt-1 text-xs text-green-600 font-semibold">
                                ✓ Sopir tetap dari database kendaraan
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Supplier Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-900 flex items-center">
                            <div className="p-1 bg-purple-100 rounded-lg mr-2">
                              <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            </div>
                            Pemasok <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select value={masukFormData.pemasokId} onValueChange={(value) => 
                            setMasukFormData(prev => ({ ...prev, pemasokId: value }))
                          }>
                            <SelectTrigger className="h-10 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors">
                              <SelectValue placeholder="Pilih pemasok" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white border-2 border-gray-200">
                              {pemasoks.map((pemasok) => (
                                <SelectItem key={pemasok.id} value={pemasok.id} className="rounded-lg bg-white hover:bg-gray-100">
                                  <div className="text-sm">
                                    <div className="font-semibold">{pemasok.kode}</div>
                                    <div className="text-xs text-gray-500">{pemasok.nama}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                {/* TBS Detail Block - Only show if product is TBS */}
                {showTBSDetail && (
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Calculator className="h-6 w-6 text-green-600" />
                      </div>
                      Detail Blok TBS <span className="text-red-500 ml-1">*</span>
                    </h4>
                    
                    {/* TBS Detail Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
                      <Select value={tbsDetailForm.blokId} onValueChange={(value) => 
                        setTbsDetailForm(prev => ({ ...prev, blokId: value }))
                      }>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-green-200 bg-white">
                          <SelectValue placeholder="Pilih Blok" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-2 border-green-200">
                          {bloks.map((blok) => (
                            <SelectItem key={blok.id} value={blok.id} className="rounded-lg bg-white hover:bg-green-50">
                              <div className="py-1">
                                <div className="font-semibold">{blok.kode}</div>
                                <div className="text-xs text-gray-500">{blok.nama}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="number"
                        placeholder="Jumlah Janjang"
                        value={tbsDetailForm.jumlahJanjang || ''}
                        onChange={(e) => setTbsDetailForm(prev => ({ 
                          ...prev, 
                          jumlahJanjang: parseInt(e.target.value) || 0 
                        }))}
                        className="h-12 rounded-xl border-2 border-green-200"
                      />
                      
                      <Input
                        type="number"
                        placeholder="Brodolan"
                        value={tbsDetailForm.brodolan || ''}
                        onChange={(e) => setTbsDetailForm(prev => ({ 
                          ...prev, 
                          brodolan: parseInt(e.target.value) || 0 
                        }))}
                        className="h-12 rounded-xl border-2 border-green-200"
                      />
                      
                      <div className="h-12 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600">
                        BJR: Auto
                      </div>
                      
                      <Button
                        type="button"
                        onClick={addTBSDetail}
                        disabled={!tbsDetailForm.blokId || tbsDetailForm.jumlahJanjang <= 0}
                        className="h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <span className="font-semibold">Tambah</span>
                      </Button>
                    </div>

                    {/* TBS Detail List */}
                    {masukFormData.tbsDetail.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-700">Data yang telah ditambahkan:</h5>
                        {masukFormData.tbsDetail.map((detail, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white border-2 border-green-100 rounded-2xl shadow-sm">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CheckSquare className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {bloks.find(b => b.id === detail.blokId)?.kode}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {detail.jumlahJanjang} janjang, {detail.brodolan} brodolan
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeTBSDetail(index)}
                              className="rounded-xl"
                            >
                              Hapus
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="mt-8 space-y-3">
                  <Label className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    Keterangan
                  </Label>
                  <Input
                    value={masukFormData.keterangan}
                    onChange={(e) => setMasukFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                    placeholder="Catatan tambahan (opsional)"
                    className="h-14 rounded-2xl border-2 border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors px-4"
                  />
                </div>

                        {/* Action Button */}
                        <div className="text-center pt-4">
                          <Button
                            onClick={handleAmbilBeratMasuk}
                            disabled={!isWeightStable()}
                            className={`px-8 py-3 text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                              isWeightStable() 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Save className="h-5 w-5 mr-2" />
                            AMBIL BERAT MASUK
                          </Button>
                          <div className="mt-3 text-xl font-mono font-bold text-gray-700">
                            {scaleData ? formatWeight(scaleData.weight) : '0.00'} kg
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Modern Timbangan Keluar Tab */}
                  <TabsContent value="keluar" className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Form Timbangan Keluar</h3>
                        <p className="text-gray-500 text-sm">Pilih transaksi pending dan ambil berat kosong</p>
                      </div>
                
                      {/* Pending Transactions List */}
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-gray-900 flex items-center">
                          <div className="p-1 bg-blue-100 rounded-lg mr-2">
                            <FileText className="h-3 w-3 text-blue-600" />
                          </div>
                          Antrian Pending ({pendingTransactions.length})
                        </Label>
                        
                        {pendingTransactions.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {pendingTransactions.map((transaction) => (
                              <div 
                                key={transaction.nomorTiket} 
                                className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                                  selectedPendingId === transaction.nomorTiket 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-200 bg-white hover:border-blue-200'
                                }`}
                                onClick={() => setSelectedPendingId(transaction.nomorTiket)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-lg ${
                                      selectedPendingId === transaction.nomorTiket 
                                        ? 'bg-blue-200' 
                                        : 'bg-gray-100'
                                    }`}>
                                      <Truck className={`h-4 w-4 ${
                                        selectedPendingId === transaction.nomorTiket 
                                          ? 'text-blue-600' 
                                          : 'text-gray-600'
                                      }`} />
                                    </div>
                                    <div>
                                      <div className="font-bold text-sm text-gray-900 font-mono">
                                        {transaction.nomorTiket}
                                      </div>
                                      <div className="text-sm text-gray-700 font-semibold">
                                        {transaction.kendaraanNopol}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {transaction.produkId} • {formatWeight(transaction.beratMasuk || 0)} kg
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    {selectedPendingId === transaction.nomorTiket ? (
                                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs rounded-lg">
                                        ✓ Dipilih
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="px-2 py-1 text-xs rounded-lg bg-amber-100 text-amber-800">
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                            <div className="text-2xl mb-2">📭</div>
                            <p className="text-sm font-bold text-gray-600">Tidak ada transaksi pending</p>
                          </div>
                        )}
                      </div>

                {/* Selected Transaction Details */}
                {selectedPendingId && (
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6">
                    {(() => {
                      const selectedTransaction = pendingTransactions.find(t => t.nomorTiket === selectedPendingId)
                      if (!selectedTransaction) return null
                      
                      return (
                        <div className="space-y-6">
                          <h4 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <CheckCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            Detail Transaksi Terpilih
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-4 border border-blue-100">
                              <div className="text-sm text-gray-500">Nomor Tiket</div>
                              <div className="text-lg font-bold font-mono text-gray-900">{selectedTransaction.nomorTiket}</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-blue-100">
                              <div className="text-sm text-gray-500">Produk</div>
                              <div className="text-lg font-semibold text-gray-900">{selectedTransaction.produkId}</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-blue-100">
                              <div className="text-sm text-gray-500">Kendaraan</div>
                              <div className="text-lg font-semibold text-gray-900">{selectedTransaction.kendaraanNopol}</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 border border-blue-100">
                              <div className="text-sm text-gray-500">Berat Masuk</div>
                              <div className="text-lg font-bold font-mono text-gray-900">{formatWeight(selectedTransaction.beratMasuk || 0)} kg</div>
                            </div>
                          </div>
                          {selectedTransaction.tbsDetail && selectedTransaction.tbsDetail.length > 0 && (
                            <div className="bg-white rounded-2xl p-4 border border-green-100">
                              <div className="text-sm text-gray-500 mb-3">Detail TBS</div>
                              <div className="space-y-2">
                                {selectedTransaction.tbsDetail.map((detail, index) => (
                                  <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                      </div>
                                      <span className="font-semibold">{bloks.find(b => b.id === detail.blokId)?.kode}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {detail.jumlahJanjang} janjang, {detail.brodolan} brodolan
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                      {/* Action Button */}
                      <div className="text-center pt-4">
                        <Button
                          onClick={handleAmbilBeratKeluar}
                          disabled={!isWeightStable() || !selectedPendingId}
                          className={`px-8 py-3 text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                            isWeightStable() && selectedPendingId
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Save className="h-5 w-5 mr-2" />
                          AMBIL BERAT KELUAR
                        </Button>
                        <div className="mt-3 text-xl font-mono font-bold text-gray-700">
                          {scaleData ? formatWeight(scaleData.weight) : '0.00'} kg
                        </div>
                        {!selectedPendingId && (
                          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2">
                            <p className="text-amber-800 font-semibold text-xs">
                              ⚠️ Pilih transaksi pending
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TimbanganPage() {
  return (
    <ProtectedRoute requiredRoles={["admin", "operator_timbangan", "supervisor"]}>
      <TimbanganPageContent />
    </ProtectedRoute>
  )
}