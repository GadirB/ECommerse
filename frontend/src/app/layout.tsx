import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Layout from '@/components/layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ECommerce - Your Online Shopping Destination',
  description: 'Discover amazing products with great prices and fast delivery. Shop electronics, fashion, home goods and more.',
  keywords: 'ecommerce, online shopping, products, electronics, fashion, home goods',
  authors: [{ name: 'ECommerce Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'ECommerce - Your Online Shopping Destination',
    description: 'Discover amazing products with great prices and fast delivery.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECommerce - Your Online Shopping Destination',
    description: 'Discover amazing products with great prices and fast delivery.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}