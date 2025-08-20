export interface Pemasok {
  id: string
  kode: string
  nama: string
  alamat?: string
  telepon?: string
  email?: string
  kontak?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Sopir {
  id: string
  nama: string
  noKtp: string
  noSim?: string
  telepon?: string
  alamat?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Kendaraan {
  id: string
  nopol: string
  jenis: string
  kapasitas?: number
  merk?: string
  tahun?: number
  sopirId?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Blok {
  id: string
  kode: string
  nama: string
  luasHektar?: number
  jumlahPohon?: number
  tahunTanam?: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface TransaksiTimbang {
  id: string
  nomorDo: string
  tanggal: string
  companyCode: string
  pemasokId: string
  sopirId: string
  kendaraanId: string
  jenisBarang: string
  beratBruto: number
  beratTara: number
  beratNetto: number
  keterangan?: string
  status: string
  userId?: string
  createdAt: string
  updatedAt: string
  pemasok?: Pemasok
  sopir?: Sopir
  kendaraan?: Kendaraan
  grading?: Grading
}

export interface Grading {
  id: string
  transaksiTimbangId: string
  companyCode: string
  totalSample: number
  buahMatang: number
  buahMentah: number
  buahBusuk: number
  brondolan: number
  sampah: number
  air: number
  nilaiGrading?: string
  keterangan?: string
  userId?: string
  createdAt: string
  updatedAt: string
  transaksiTimbang?: TransaksiTimbang
}

export interface PendingTimbang {
  id: string
  nomorDo: string
  tanggal: string
  companyCode: string
  pemasokId: string
  sopirId: string
  kendaraanId: string
  jenisBarang: string
  beratBruto: number
  beratTara?: number
  keterangan?: string
  status: string // masuk, keluar, selesai
  userId?: string
  createdAt: string
  updatedAt: string
  pemasok?: Pemasok
  sopir?: Sopir
  kendaraan?: Kendaraan
}

export interface Company {
  id: string
  companyCode: string
  name: string
  businessName?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  taxId?: string
  businessLicense?: string
  industry?: string
  established?: string
  description?: string
  logo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}