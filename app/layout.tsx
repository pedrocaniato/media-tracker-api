// O Layout Principal é um componente de servidor por padrão
// O Next.js exige um ficheiro layout.tsx na raiz de 'app'

// IMPORTAÇÃO CORRIGIDA: Usa './globals.css' (com 's')
import './globals.css'; 

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Defina metadados básicos para a aplicação
export const metadata: Metadata = {
  title: 'Media Tracker',
  description: 'Sistema de rastreamento de mídia para filmes e séries.',
};

// O componente de layout envolve todas as páginas
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}