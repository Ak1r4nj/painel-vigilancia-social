'use client';

import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Navbar } from '@/components/features/auth/Navbar';
import { SummaryCards } from '@/components/features/summary/SummaryCards';
import { ChildList } from '@/components/features/children/ChildList';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="container py-6 space-y-8">
        <SummaryCards />
        <ChildList />
      </main>
    </AuthGuard>
  );
}
