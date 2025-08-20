import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SmartMillScale - Timbangan Digital",
  description: "Sistem Timbangan Digital Otomatis Real-time - Timbang Otomatis, Proses Sistematis",
};

export default function TimbanganLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full">
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        duration={4000}
      />
    </div>
  );
}