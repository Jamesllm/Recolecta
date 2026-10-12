import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Recolecta+ | Panel Administrativo y Centro de Despacho',
  description: 'Sistema inteligente de gestión de residuos urbanos y optimización geoespacial con IA y PostGIS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-[#F8FAFC] text-[#0F172A]">
        {/* Sidebar Fijo Slate 900 (#0F172A) */}
        <Sidebar />

        {/* Área Principal de Contenido Dinámico (#F8FAFC) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC] overflow-x-hidden">
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
