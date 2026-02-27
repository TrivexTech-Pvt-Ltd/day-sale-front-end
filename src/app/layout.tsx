import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientRoot from "./ClientRoot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Daily Sales System | Premium Dashboard",
    description: "Enterprise Automated Sales Reporting and Inventory Management",
};

export const viewport: Viewport = {
    themeColor: "#3b82f6",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <ClientRoot>{children}</ClientRoot>
            </body>
        </html>
    );
}
