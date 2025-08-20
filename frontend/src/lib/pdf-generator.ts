import { jsPDF } from 'jspdf'
import type { TransaksiTimbang } from './api/types'

export function generateWeighingReceipt(transaksi: TransaksiTimbang) {
  const doc = new jsPDF()
  
  // Company Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('SMARTMILLSCALE', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('BUKTI TIMBANGAN DIGITAL', 105, 30, { align: 'center' })
  doc.text('Timbang Otomatis, Proses Sistematis', 105, 37, { align: 'center' })
  
  // Line separator
  doc.line(20, 45, 190, 45)
  
  // Document Info
  doc.setFontSize(10)
  doc.text(`No. DO/SPB: ${transaksi.nomorDo}`, 20, 55)
  doc.text(`Tanggal: ${new Date(transaksi.tanggal).toLocaleDateString('id-ID')}`, 20, 62)
  doc.text(`Waktu: ${new Date(transaksi.tanggal).toLocaleTimeString('id-ID')}`, 20, 69)
  
  // Supplier Information
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMASI PEMASOK', 20, 85)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Kode Pemasok: ${transaksi.pemasok?.kode || '-'}`, 20, 95)
  doc.text(`Nama Pemasok: ${transaksi.pemasok?.nama || '-'}`, 20, 102)
  doc.text(`Alamat: ${transaksi.pemasok?.alamat || '-'}`, 20, 109)
  doc.text(`Telepon: ${transaksi.pemasok?.telepon || '-'}`, 20, 116)
  
  // Driver & Vehicle Information
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMASI SOPIR & KENDARAAN', 20, 135)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nama Sopir: ${transaksi.sopir?.nama || '-'}`, 20, 145)
  doc.text(`No. KTP: ${transaksi.sopir?.noKtp || '-'}`, 20, 152)
  doc.text(`No. Polisi: ${transaksi.kendaraan?.nopol || '-'}`, 120, 145)
  doc.text(`Jenis Kendaraan: ${transaksi.kendaraan?.jenis || '-'}`, 120, 152)
  
  // Weight Information (Main Section)
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 165, 170, 60, 'F')
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('HASIL TIMBANGAN', 105, 175, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  // Weight table
  const weights = [
    ['Berat Bruto:', `${transaksi.beratBruto.toLocaleString('id-ID')} kg`],
    ['Berat Tara:', `${transaksi.beratTara.toLocaleString('id-ID')} kg`],
    ['Berat Netto:', `${transaksi.beratNetto.toLocaleString('id-ID')} kg`]
  ]
  
  let yPos = 185
  weights.forEach(([label, value]) => {
    doc.text(label, 30, yPos)
    doc.setFont('helvetica', 'bold')
    doc.text(value, 120, yPos)
    doc.setFont('helvetica', 'normal')
    yPos += 10
  })
  
  // Grading Information (if available)
  if (transaksi.grading) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('HASIL GRADING', 20, 245)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nilai Grading: ${transaksi.grading.nilaiGrading || '-'}`, 20, 255)
    doc.text(`Buah Matang: ${transaksi.grading.buahMatang.toFixed(1)}%`, 20, 262)
    doc.text(`Buah Mentah: ${transaksi.grading.buahMentah.toFixed(1)}%`, 80, 262)
    doc.text(`Buah Busuk: ${transaksi.grading.buahBusuk.toFixed(1)}%`, 140, 262)
    doc.text(`Total Sample: ${transaksi.grading.totalSample.toLocaleString('id-ID')} kg`, 20, 269)
  }
  
  // Notes
  if (transaksi.keterangan) {
    const notesY = transaksi.grading ? 285 : 245
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Keterangan:', 20, notesY)
    doc.setFont('helvetica', 'normal')
    doc.text(transaksi.keterangan, 20, notesY + 7)
  }
  
  // Footer
  const footerY = 270
  doc.line(20, footerY, 190, footerY)
  
  doc.setFontSize(8)
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 20, footerY + 10)
  doc.text('Sistem PKS Timbangan & Grading', 105, footerY + 10, { align: 'center' })
  doc.text(`ID Transaksi: ${transaksi.id}`, 190, footerY + 10, { align: 'right' })
  
  // Signature areas
  doc.text('Petugas Timbang', 30, footerY + 25)
  doc.text('Sopir', 105, footerY + 25, { align: 'center' })
  doc.text('Penerima', 160, footerY + 25, { align: 'center' })
  
  doc.line(20, footerY + 40, 60, footerY + 40)  // Petugas signature line
  doc.line(85, footerY + 40, 125, footerY + 40) // Sopir signature line  
  doc.line(140, footerY + 40, 180, footerY + 40) // Penerima signature line
  
  return doc
}

export function downloadWeighingReceipt(transaksi: TransaksiTimbang) {
  const doc = generateWeighingReceipt(transaksi)
  const filename = `Bukti_Timbang_${transaksi.nomorDo}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

export function printWeighingReceipt(transaksi: TransaksiTimbang) {
  const doc = generateWeighingReceipt(transaksi)
  const pdfOutput = doc.output('bloburl')
  
  // Open in new window for printing
  const printWindow = window.open(pdfOutput, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}