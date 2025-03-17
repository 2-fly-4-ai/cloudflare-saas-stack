"use client";

import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex flex-col items-end gap-2 p-4 max-h-screen w-full overflow-hidden">
      {toasts.map(function ({ id, title, description, variant }) {
        return (
          <Toast key={id} variant={variant}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </Toast>
        );
      })}
    </div>
  );
}
