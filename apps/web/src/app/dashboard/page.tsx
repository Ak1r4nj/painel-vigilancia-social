'use client';

import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Navbar } from '@/components/features/auth/Navbar';
import { SummaryCards } from '@/components/features/summary/SummaryCards';
import { ChartsSection } from '@/components/features/charts/ChartsSection';
import { ChildList } from '@/components/features/children/ChildList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutList, BarChart2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Navbar />
      <main id="main-content" className="container py-6 space-y-6">
        <SummaryCards />

        <Tabs defaultValue="children">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="children" className="gap-2">
              <LayoutList className="h-4 w-4" aria-hidden />
              Crianças
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart2 className="h-4 w-4" aria-hidden />
              Gráficos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="mt-4">
            <ChildList />
          </TabsContent>

          <TabsContent value="charts" className="mt-4">
            <ChartsSection />
          </TabsContent>
        </Tabs>
      </main>
    </AuthGuard>
  );
}
