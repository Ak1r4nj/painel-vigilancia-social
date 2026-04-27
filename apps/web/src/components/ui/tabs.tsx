'use client';

import { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────
   Context
────────────────────────────────────────────── */
interface TabsCtx {
  value: string;
  onChange: (v: string) => void;
}

const Ctx = createContext<TabsCtx>({ value: '', onChange: () => {} });

/* ──────────────────────────────────────────────
   Root
────────────────────────────────────────────── */
interface TabsProps {
  /** Modo não-controlado: aba inicial. */
  defaultValue?: string;
  /** Modo controlado: aba atual (use junto com onValueChange). */
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue = '', value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  function handleChange(v: string) {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  }

  return (
    <Ctx.Provider value={{ value: current, onChange: handleChange }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

/* ──────────────────────────────────────────────
   List (a barra de abas)
────────────────────────────────────────────── */
export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 rounded-lg bg-muted p-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Trigger (cada botão de aba)
────────────────────────────────────────────── */
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const ctx = useContext(Ctx);
  const active = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      onClick={() => ctx.onChange(value)}
      className={cn(
        'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────
   Content (painel de cada aba)
────────────────────────────────────────────── */
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const ctx = useContext(Ctx);
  const active = ctx.value === value;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!active}
      className={cn('focus:outline-none', className)}
    >
      {children}
    </div>
  );
}
