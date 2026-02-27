"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navigation } from "@/components/layout/Navigation";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <QueryProvider>
                <Navigation>{children}</Navigation>
            </QueryProvider>
        </AuthProvider>
    );
}
