import { useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

export function Toast() {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Cleanup any remaining toasts when component unmounts
    return () => {
      toasts.forEach(toast => {
        if (toast.id) {
          removeToast(toast.id);
        }
      });
    };
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`rounded-lg px-4 py-2 text-white shadow-lg transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
