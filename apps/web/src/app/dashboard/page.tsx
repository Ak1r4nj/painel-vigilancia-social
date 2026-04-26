'use client';

import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Navbar } from '@/components/features/auth/Navbar';
import { SummaryCards } from '@/components/features/summary/SummaryCards';
import { ChartsSection } from '@/components/features/charts/ChartsSection';
import { ChildList } from '@/components/features/children/ChildList';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main id="main-content" className="container py-6 space-y-8">
        <SummaryCards />
        <ChartsSection />
        <ChildList />
      </main>
    </AuthGuard>
  );
}
