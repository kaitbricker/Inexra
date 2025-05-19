'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGPUAcceleration } from './animation-utils';

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: string;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  validation?: (value: string) => boolean;
}

export function FormField({
  label,
  type,
  value,
  onChange,
  error,
  success,
  placeholder,
  required,
  tooltip,
  validation,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const { isGPUSupported, gpuStyle } = useGPUAcceleration();

  // Validate input on change
  useEffect(() => {
    if (validation) {
      setIsValid(validation(value));
    }
  }, [value, validation]);

  // Input animation variants
  const inputVariants = {
    initial: { scale: 1 },
    focus: {
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    error: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
    success: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  // Label animation variants
  const labelVariants = {
    initial: { y: 0, scale: 1 },
    focus: {
      y: -20,
      scale: 0.8,
      color: '#3B82F6',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  // Tooltip animation variants
  const tooltipVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="relative">
      {/* Label */}
      <motion.label
        variants={labelVariants}
        initial="initial"
        animate={isFocused ? 'focus' : 'initial'}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input Container */}
      <motion.div
        variants={inputVariants}
        initial="initial"
        animate={error ? 'error' : success ? 'success' : isFocused ? 'focus' : 'initial'}
        className="relative"
        style={isGPUSupported ? gpuStyle : undefined}
      >
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 rounded-lg border ${
            error
              ? 'border-red-500 bg-red-50'
              : success
                ? 'border-green-500 bg-green-50'
                : isFocused
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
        />

        {/* Success Icon */}
        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}

        {/* Error Icon */}
        {error && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Success Message */}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-green-500"
        >
          {success}
        </motion.p>
      )}

      {/* Tooltip */}
      {tooltip && (
        <motion.div className="absolute right-0 top-0" whileHover="hover" initial="initial">
          <motion.button
            className="p-1 text-gray-400 hover:text-gray-600"
            whileHover={isGPUSupported ? undefined : { scale: 1.1 }}
            whileTap={isGPUSupported ? undefined : { scale: 0.9 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.button>

          <motion.div
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg z-10"
            style={isGPUSupported ? gpuStyle : undefined}
          >
            <p className="text-sm text-gray-600">{tooltip}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Loading spinner component
export function LoadingSpinner() {
  const { isGPUSupported, gpuStyle } = useGPUAcceleration();

  return (
    <motion.div
      className="flex items-center justify-center"
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={isGPUSupported ? gpuStyle : undefined}
    >
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

// Success checkmark component
export function SuccessCheckmark() {
  const { isGPUSupported, gpuStyle } = useGPUAcceleration();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={isGPUSupported ? gpuStyle : undefined}
    >
      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </motion.div>
  );
}
