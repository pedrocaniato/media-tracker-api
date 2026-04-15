"use client";

import React from "react";
import { AuthGuard } from "@/app/components/AuthGuard";
import { Navbar } from "@/app/components/Navbar";

import { SearchProvider } from "@/app/context/SearchContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SearchProvider>
        <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
          <Navbar />
          <main>
            {children}
          </main>
        </div>
      </SearchProvider>
    </AuthGuard>
  );
}
