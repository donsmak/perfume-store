import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Header } from '@/components/layout/header';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Luxury Perfumes | Premium Fragrances',
  description: 'Discover and shop premium perfumes and fragrances',
  icons: {
    icon: [
      {
        url: '/icon.png',
        href: '/icon.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
