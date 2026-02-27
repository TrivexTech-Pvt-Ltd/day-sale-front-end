import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navigation } from "@/components/layout/Navigation";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
                <AuthProvider>
                    <QueryProvider>
                        <Navigation>{children}</Navigation>
                    </QueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
