'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGPUAcceleration, CustomAnimatePresence } from './animation-utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isCompleted: boolean;
  isOptional?: boolean;
  tooltip?: string;
}

interface OnboardingAnimationsProps {
  steps: OnboardingStep[];
  currentStep: number;
  onStepComplete: (stepId: string) => void;
  onComplete: () => void;
  userRole?: string;
  firstName?: string;
}

export const OnboardingAnimations: React.FC<OnboardingAnimationsProps> = ({
  steps,
  currentStep,
  onStepComplete,
  onComplete,
  userRole,
  firstName,
}) => {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const { isGPUSupported, gpuStyle } = useGPUAcceleration();

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    const timeBasedGreeting =
      hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    setGreeting(`${timeBasedGreeting}, ${firstName || 'there'}!`);
    setLoading(false);
  }, [firstName]);

  // Animation variants
  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${(currentStep / steps.length) * 100}%` },
  };

  const stepCardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const checkmarkVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 },
  };

  const tooltipVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const handleStepComplete = (stepId: string) => {
    onStepComplete(stepId);
    if (currentStep === steps.length - 1) {
      onComplete();
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-[200px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">{greeting}</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to your {userRole ? `your ${userRole} account` : 'your account'} onboarding
          journey
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          variants={progressVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="h-full bg-primary"
          style={isGPUSupported ? gpuStyle : undefined}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            variants={stepCardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              step.isCompleted ? 'border-primary' : 'border-border'
            }`}
            style={isGPUSupported ? gpuStyle : undefined}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {step.isCompleted ? (
                <motion.div
                  variants={checkmarkVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              ) : (
                <button
                  onClick={() => handleStepComplete(step.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
            {step.tooltip && !step.isCompleted && (
              <CustomAnimatePresence>
                <motion.div
                  variants={tooltipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mt-2 p-2 bg-muted rounded text-sm"
                >
                  {step.tooltip}
                </motion.div>
              </CustomAnimatePresence>
            )}
          </motion.div>
        ))}
      </div>

      {/* Success Confetti */}
      {currentStep === steps.length - 1 && steps.every(step => step.isCompleted) && (
        <CustomAnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 pointer-events-none"
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * window.innerWidth }}
                animate={{
                  y: window.innerHeight + 100,
                  x: Math.random() * window.innerWidth,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: 'easeOut',
                  delay: Math.random() * 0.5,
                }}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={isGPUSupported ? gpuStyle : undefined}
              />
            ))}
          </motion.div>
        </CustomAnimatePresence>
      )}
    </div>
  );
};
