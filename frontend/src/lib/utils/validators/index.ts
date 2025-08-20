import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
})

export const pemasokSchema = z.object({
  kode: z.string().min(1, 'Kode harus diisi'),
  nama: z.string().min(1, 'Nama harus diisi'),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  kontak: z.string().optional(),
  status: z.string().default('aktif'),
})

export const sopirSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  noKtp: z.string().min(1, 'Nomor KTP harus diisi'),
  noSim: z.string().optional(),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
  status: z.string().default('aktif'),
})

export const kendaraanSchema = z.object({
  nopol: z.string().min(1, 'Nomor polisi harus diisi'),
  jenis: z.string().min(1, 'Jenis kendaraan harus diisi'),
  kapasitas: z.number().optional(),
  merk: z.string().optional(),
  tahun: z.number().optional(),
  sopirId: z.string().optional(),
  status: z.string().default('aktif'),
})

export const transaksiTimbangSchema = z.object({
  nomorDo: z.string().min(1, 'Nomor DO harus diisi'),
  tanggal: z.string().optional(),
  pemasokId: z.string().min(1, 'Pemasok harus dipilih'),
  sopirId: z.string().min(1, 'Sopir harus dipilih'),
  kendaraanId: z.string().min(1, 'Kendaraan harus dipilih'),
  jenisBarang: z.string().min(1, 'Jenis barang harus diisi'),
  beratBruto: z.number().min(0, 'Berat bruto harus lebih dari 0'),
  beratTara: z.number().min(0, 'Berat tara harus lebih dari 0'),
  keterangan: z.string().optional(),
})

export const gradingSchema = z.object({
  transaksiTimbangId: z.string().min(1, 'Transaksi timbang harus dipilih'),
  totalSample: z.number().min(1, 'Total sample harus lebih dari 0'),
  buahMatang: z.number().min(0, 'Buah matang tidak boleh negatif'),
  buahMentah: z.number().min(0, 'Buah mentah tidak boleh negatif'),
  buahBusuk: z.number().min(0, 'Buah busuk tidak boleh negatif'),
  brondolan: z.number().min(0, 'Brondolan tidak boleh negatif'),
  sampah: z.number().min(0, 'Sampah tidak boleh negatif'),
  air: z.number().min(0, 'Air tidak boleh negatif'),
  keterangan: z.string().optional(),
})