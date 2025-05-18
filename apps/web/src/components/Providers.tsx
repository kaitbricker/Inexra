'use client';

import { LogRocketProvider } from '@/components/LogRocketProvider';
import { ThemeProvider } from '@/hooks/useTheme2';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <LogRocketProvider>{children}</LogRocketProvider>
    </ThemeProvider>
  );
}
