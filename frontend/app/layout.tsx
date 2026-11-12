import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

// Texto en Inter y cifras y títulos en Space Grotesk (propuesta «Mapa primero»)
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const display = Space_Grotesk({ variable: '--font-display-face', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Recolecta+ | Panel municipal',
  description: 'Sistema inteligente de gestión de residuos urbanos y optimización geoespacial con IA y PostGIS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f4f6f3] text-slate-900 font-sans">
        {/* Riel de navegación flotante */}
        <Sidebar />

        {/* Contenido: deja libre el ancho del riel */}
        <div className="min-h-screen pl-[104px] pr-4 flex flex-col min-w-0 overflow-x-hidden">
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
