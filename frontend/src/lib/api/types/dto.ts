export interface CreatePemasokDto {
  kode: string
  nama: string
  alamat?: string
  telepon?: string
  email?: string
  kontak?: string
  status?: string
}

export interface CreateSopirDto {
  nama: string
  noKtp: string
  noSim?: string
  telepon?: string
  alamat?: string
  status?: string
}

export interface CreateKendaraanDto {
  nopol: string
  jenis: string
  kapasitas?: number
  merk?: string
  tahun?: number
  sopirId?: string
  status?: string
}

export interface CreateBlokDto {
  kode: string
  nama: string
  luasHektar?: number
  jumlahPohon?: number
  tahunTanam?: number
  status?: string
}

export interface CreateTransaksiTimbangDto {
  nomorDo: string
  tanggal?: string
  pemasokId: string
  sopirId: string
  kendaraanId: string
  jenisBarang: string
  beratBruto: number
  beratTara: number
  keterangan?: string
  userId?: string
}

export interface CreateGradingDto {
  transaksiTimbangId: string
  totalSample: number
  buahMatang: number
  buahMentah: number
  buahBusuk: number
  brondolan: number
  sampah: number
  air: number
  keterangan?: string
  userId?: string
}

export interface CreatePendingTimbangDto {
  nomorDo: string
  tanggal?: string
  pemasokId: string
  sopirId: string
  kendaraanId: string
  jenisBarang: string
  beratBruto: number
  keterangan?: string
  userId?: string
}

export interface CreateCompanyDto {
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
  isActive?: boolean
}

export interface UpdateCompanyDto {
  companyCode?: string
  name?: string
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
  isActive?: boolean
}