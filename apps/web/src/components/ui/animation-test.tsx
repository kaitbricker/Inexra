'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  useGPUAcceleration,
  CustomAnimatePresence,
} from './animation-utils';
import { FormField, LoadingSpinner, SuccessCheckmark } from './form-animations';

export function AnimationTest() {
  const [isVisible, setIsVisible] = useState(false);
  const [formValue, setFormValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isGPUSupported, gpuStyle } = useGPUAcceleration();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Animation System Test</h1>

      {/* Form Test */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Form Animations</h2>
        <FormField
          label="Test Input"
          type="text"
          value={formValue}
          onChange={setFormValue}
          placeholder="Type something..."
          tooltip="This is a test tooltip"
          validation={value => value.length >= 3}
        />
      </div>

      {/* Loading State Test */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Loading States</h2>
        <div className="flex justify-center">
          <motion.button
            whileHover={!isGPUSupported ? undefined : { scale: 1.05 }}
            whileTap={!isGPUSupported ? undefined : { scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner /> : 'Test Loading'}
          </motion.button>
        </div>
      </div>

      {/* Success State Test */}
      <CustomAnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-lg shadow-lg"
            style={isGPUSupported ? gpuStyle : undefined}
          >
            <h2 className="text-xl font-semibold mb-4">Success State</h2>
            <div className="flex items-center justify-center space-x-4">
              <SuccessCheckmark />
              <span className="text-green-500 font-medium">Success!</span>
            </div>
          </motion.div>
        )}
      </CustomAnimatePresence>

      {/* Performance Info */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Performance Info</h2>
        <div className="space-y-2">
          <p>GPU Acceleration: {isGPUSupported ? 'Enabled' : 'Disabled'}</p>
          <p>Device Optimization: {!isGPUSupported ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
}
