import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css'
import "./globals.css";
import './theme.css'
import BootstrapClient from './bootstrap-client'
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDeal Construction - Garden Rooms, House Extensions, House Building",
  description: "Stage 1: Foundation MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient>
          <NavBar />
          <main className="container py-4">
            {children}
          </main>
          <Footer />
        </BootstrapClient>
      </body>
    </html>
  );
}
