import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '../common/Button';
import { useToast } from '@/hooks/useToast';

interface OnboardingStep {
  target: string;
  content: string;
  title: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingFlowProps {
  role: 'admin' | 'creator' | 'user';
}

const steps: Record<string, OnboardingStep[]> = {
  admin: [
    {
      target: '.dashboard-overview',
      content:
        'Welcome to your admin dashboard! Here you can manage users, roles, and monitor system performance.',
      title: 'Dashboard Overview',
      placement: 'bottom',
    },
    {
      target: '.user-management',
      content: 'Manage your team members, assign roles, and track user activity.',
      title: 'User Management',
      placement: 'right',
    },
    {
      target: '.analytics',
      content: "View detailed analytics and insights about your team's performance.",
      title: 'Analytics',
      placement: 'left',
    },
  ],
  creator: [
    {
      target: '.template-editor',
      content: 'Create and manage your message templates here.',
      title: 'Template Editor',
      placement: 'bottom',
    },
    {
      target: '.analytics',
      content: 'Track the performance of your templates and messages.',
      title: 'Analytics',
      placement: 'left',
    },
  ],
  user: [
    {
      target: '.dashboard',
      content: 'Welcome to your dashboard! Here you can view your messages and templates.',
      title: 'Dashboard',
      placement: 'bottom',
    },
    {
      target: '.templates',
      content: 'Browse and use pre-made templates for your messages.',
      title: 'Templates',
      placement: 'right',
    },
  ],
};

export function OnboardingFlow({ role }: OnboardingFlowProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { isDark } = useTheme();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = session?.user?.onboardingCompleted;
    if (!hasCompletedOnboarding) {
      setRun(true);
    }
  }, [session]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Mark onboarding as completed
      completeOnboarding();
    }

    setStepIndex(index);
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update onboarding status');
      }

      showToast('Onboarding completed!', 'success');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToast('Error completing onboarding', 'error');
    }
  };

  return (
    <div className="onboarding-container">
      <Joyride
        steps={steps[role]}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        stepIndex={stepIndex}
        styles={{
          options: {
            primaryColor: isDark ? '#3B82F6' : '#2563EB',
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            textColor: isDark ? '#F3F4F6' : '#1F2937',
            arrowColor: isDark ? '#1F2937' : '#FFFFFF',
          },
        }}
      />

      <AnimatePresence>
        {!run && !session?.user?.onboardingCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={() => setRun(true)}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <span>Start Tour</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
