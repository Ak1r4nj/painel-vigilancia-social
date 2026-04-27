'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Navbar } from '@/components/features/auth/Navbar';
import { SummaryCards } from '@/components/features/summary/SummaryCards';
import { ChartsSection } from '@/components/features/charts/ChartsSection';
import { ChildList } from '@/components/features/children/ChildList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutList, BarChart2 } from 'lucide-react';
import type { ChildListParams } from '@/lib/api';

export default function DashboardPage() {
  const [tab, setTab] = useState<'children' | 'charts'>('children');
  const [cardFilter, setCardFilter] = useState<Partial<ChildListParams>>({});

  function handleCardFilter(params: Partial<ChildListParams>) {
    setCardFilter(params);
    // Qualquer clique num card leva para a aba de crianças
    if (Object.keys(params).length > 0) setTab('children');
  }

  return (
    <AuthGuard>
      <Navbar />
      <main id="main-content" className="container py-6 space-y-6">
        <SummaryCards
          activeFilter={cardFilter}
          onFilter={handleCardFilter}
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'children' | 'charts')}>
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
            <ChildList
              externalParams={cardFilter}
              onExternalParamsClear={() => setCardFilter({})}
            />
          </TabsContent>

          <TabsContent value="charts" className="mt-4">
            <ChartsSection />
          </TabsContent>
        </Tabs>
      </main>
    </AuthGuard>
  );
}
