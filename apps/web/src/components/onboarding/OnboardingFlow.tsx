'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlatformConnection } from './PlatformConnection';
import { UserPreferences, type UserPreferences as UserPreferencesType } from './UserPreferences';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface Role {
  id: string;
  title: string;
  description: string;
}

interface OnboardingData {
  role?: string;
  email?: string;
  platforms?: string[];
  preferences?: UserPreferencesType;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Inexra',
    description: "Let's get you set up with your account.",
  },
  {
    id: 'role',
    title: "What's your role?",
    description: 'This helps us personalize your experience.',
  },
  {
    id: 'connect',
    title: 'Connect your accounts',
    description: 'Link your social media and messaging platforms.',
  },
  {
    id: 'preferences',
    title: 'Set your preferences',
    description: 'Customize your notification and automation settings.',
  },
];

const ROLES: Role[] = [
  {
    id: 'marketing',
    title: 'Marketing Manager',
    description: 'Manage campaigns and customer engagement',
  },
  {
    id: 'sales',
    title: 'Sales Representative',
    description: 'Handle leads and customer relationships',
  },
  {
    id: 'support',
    title: 'Customer Support',
    description: 'Provide assistance and resolve issues',
  },
];

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  },
  error: {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  },
} as const;

const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

const validateStep = (step: string, data: Partial<OnboardingData>): boolean => {
  switch (step) {
    case 'welcome':
      return true;
    case 'role':
      return !!data.role;
    case 'connect':
      return Array.isArray(data.platforms) && data.platforms.length > 0;
    case 'preferences':
      return !!data.preferences;
    default:
      return false;
  }
};

const ProgressIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center justify-center space-x-2 mb-8">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-2 rounded-full transition-colors duration-200 ${
          i <= current ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

const OnboardingFlow: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const getOptimizedConfig = useCallback(
    (baseConfig: typeof ANIMATION_VARIANTS) => {
      if (prefersReducedMotion) {
        return {
          container: { visible: { opacity: 1 } },
          item: { visible: { opacity: 1, y: 0 } },
          error: {},
        };
      }
      return baseConfig;
    },
    [prefersReducedMotion]
  );

  const animationConfig = useMemo(() => getOptimizedConfig(ANIMATION_VARIANTS), [getOptimizedConfig]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement final submission logic
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleNext = useCallback(() => {
    if (validateStep(STEPS[currentStep].id, data)) {
      if (currentStep === STEPS.length - 1) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      setError('Please complete all required fields');
    }
  }, [currentStep, data, handleSubmit]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setError(null);
  }, [setCurrentStep, setError]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleNext();
      } else if (e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoading, handleNext, handleBack]);

  const handleConnect = useCallback(async (platformId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement platform connection logic
      const updatedPlatforms = [...(data.platforms || []), platformId];
      setData((prev) => ({ ...prev, platforms: updatedPlatforms }));
    } catch (err) {
      setError('Failed to connect platform');
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const handleSavePreferences = useCallback(async (preferences: UserPreferencesType) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Implement preferences saving logic
      setData((prev) => ({ ...prev, preferences }));
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderStep = useCallback(() => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <motion.div
            variants={animationConfig.item}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            <p className="text-center text-gray-600">{step.description}</p>
            <div className="flex justify-center">
              <Button onClick={handleNext}>Get Started</Button>
            </div>
          </motion.div>
        );

      case 'role':
        return (
          <motion.div
            variants={animationConfig.item}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            <p className="text-center text-gray-600">{step.description}</p>
            <RadioGroup
              value={data.role}
              onValueChange={(value) => setData((prev) => ({ ...prev, role: value }))}
              className="space-y-4"
            >
              {ROLES.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={role.id} id={role.id} />
                  <Label htmlFor={role.id}>
                    <div>
                      <div className="font-medium">{role.title}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 'connect':
        return (
          <motion.div
            variants={animationConfig.item}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            <p className="text-center text-gray-600">{step.description}</p>
            <PlatformConnection
              onConnect={handleConnect}
              connectedPlatforms={data.platforms || []}
            />
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div
            variants={animationConfig.item}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            <p className="text-center text-gray-600">{step.description}</p>
            <UserPreferences
              onSave={handleSavePreferences}
              initialPreferences={data.preferences}
            />
          </motion.div>
        );

      default:
        return null;
    }
  }, [currentStep, data, animationConfig, handleConnect, handleSavePreferences]);

  return (
    <motion.div
      variants={animationConfig.container}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Onboarding</CardTitle>
          <CardDescription className="text-center">
            Complete your profile setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressIndicator current={currentStep} total={STEPS.length - 1} />
          {error && (
            <motion.div
              variants={animationConfig.error}
              animate="shake"
              className="text-red-500 text-center mb-4"
            >
              {error}
            </motion.div>
          )}
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentStep === STEPS.length - 1 ? (
              'Complete'
            ) : (
              'Next'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

OnboardingFlow.displayName = 'OnboardingFlow';

export { OnboardingFlow };
