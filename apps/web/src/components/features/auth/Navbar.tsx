'use client';

import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';

export function Navbar() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold text-sm sm:text-base">Vigilância Social</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">— Prefeitura do Rio</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
