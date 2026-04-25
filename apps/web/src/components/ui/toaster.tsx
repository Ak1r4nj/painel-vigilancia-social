'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <ToastPrimitive.Root
          key={id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
            variant === 'destructive'
              ? 'border-destructive bg-destructive text-destructive-foreground'
              : 'border-border bg-background text-foreground',
          )}
          {...props}
        >
          <div className="grid gap-1">
            {title && <ToastPrimitive.Title className="text-sm font-semibold">{title}</ToastPrimitive.Title>}
            {description && (
              <ToastPrimitive.Description className="text-sm opacity-90">{description}</ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">Fechar</span>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastPrimitive.Provider>
  );
}
