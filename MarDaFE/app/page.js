"use client";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/signin");
            return;
        }
        const raw = session?.user?.roles || session?.roles || [];
        const roles = Array.isArray(raw) ? raw : [];
        const normalized = roles.map((r) => String(r || '').replace(/^ROLE_/i, '').toLowerCase());
        const permittedPages = session?.user?.permittedPages || session?.permittedPages || [];

        // Dynamic routing: if user has permittedPages from user_records, route to manager
        if (permittedPages.length > 0) {
            router.push("/ui/manager");
            return;
        }

        // ROLE_ADMIN → admin page
        if (roles.includes("ROLE_ADMIN")) {
            router.push("/ui/admin");
            return;
        }

        // Cashier-only → cashier page (but not if they also have manager roles)
        const cashierOnly = normalized.length === 1 && normalized.includes("cashier");
        if (cashierOnly || roles.includes("ROLE_CASHIER")) {
            router.push("/ui/cashier/cashier");
            return;
        }

        // Default: any authenticated user with any role → manager dashboard
        if (roles.length > 0) {
            router.push("/ui/manager");
            return;
        }

        // No roles at all — shouldn't happen, but don't redirect to unauthorized
    }, [status, session, router]);
}