'use client';

import { LogRocketProvider } from '@/components/LogRocketProvider';
import { ThemeProvider } from '@/hooks/useTheme2';
import { Toast } from '@/components/ui/Toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <LogRocketProvider>
        {children}
        <Toast />
      </LogRocketProvider>
    </ThemeProvider>
  );
}
