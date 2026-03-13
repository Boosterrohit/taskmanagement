import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const bgByType: Record<ToastType, string> = {
  success: "bg-green-400",
  error: "bg-red-600",
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => removeToast(id), 2600);
  }, [removeToast]);

  const value = useMemo(
    () => ({
      showSuccess: (message: string) => addToast("success", message),
      showError: (message: string) => addToast("error", message),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`text-white w-64 flex flex-col justify-center items-center h-16 px-4 py-2 rounded-lg shadow-lg text-sm ${bgByType[toast.type]} animate-in fade-in slide-in-from-top-2`}
          >
            {toast.message}😍😍😍😍😍😍
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
