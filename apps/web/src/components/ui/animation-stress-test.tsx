'use client';

import { useState, useEffect } from 'react';
import { AnimationWrapper, StaggeredAnimationWrapper } from './animation-wrapper';
import { useStressTest, useDeviceTesting } from './animation-utils';

export function AnimationStressTest() {
  const [testConfig, setTestConfig] = useState({
    itemCount: 100,
    animationDelay: 50,
    isRunning: false,
    simulateLatency: false,
    lowEndMode: false,
  });
  const { isRunning, stats, startTest, stopTest } = useStressTest();
  const deviceInfo = useDeviceTesting();

  // Simulate network latency
  useEffect(() => {
    if (testConfig.simulateLatency) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return originalFetch(...args);
      };
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [testConfig.simulateLatency]);

  // Generate test items
  const testItems = Array.from({ length: testConfig.itemCount }).map((_, i) => ({
    id: i,
    delay: i * testConfig.animationDelay,
  }));

  return (
    <div className="p-8 space-y-8">
      {/* Test Controls */}
      <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm space-y-2">
        <div>FPS: {stats.fps}</div>
        <div>Memory: {stats.memoryUsage.toFixed(1)}MB</div>
        <div>Animations: {stats.animationCount}</div>
        <div>Touch Events: {stats.touchEvents}</div>
        <div>Scroll Events: {stats.scrollEvents}</div>
        <div>
          Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
        </div>
        <div>GPU: {deviceInfo.hasGPUSupport ? 'Supported' : 'Not Supported'}</div>
        <div>Touch: {deviceInfo.hasTouch ? 'Yes' : 'No'}</div>
        <div>Hover: {deviceInfo.hasHover ? 'Yes' : 'No'}</div>
        <div>Reduced Motion: {deviceInfo.hasReducedMotion ? 'Yes' : 'No'}</div>
      </div>

      {/* Test Configuration */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Animation Stress Test</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              if (isRunning) {
                stopTest();
                setTestConfig(prev => ({ ...prev, isRunning: false }));
              } else {
                startTest();
                setTestConfig(prev => ({ ...prev, isRunning: true }));
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isRunning ? 'Stop Test' : 'Start Test'}
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={testConfig.simulateLatency}
              onChange={e =>
                setTestConfig(prev => ({ ...prev, simulateLatency: e.target.checked }))
              }
            />
            Simulate Latency
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={testConfig.lowEndMode}
              onChange={e => setTestConfig(prev => ({ ...prev, lowEndMode: e.target.checked }))}
            />
            Low-End Mode
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            Items:
            <input
              type="range"
              min="10"
              max="500"
              value={testConfig.itemCount}
              onChange={e =>
                setTestConfig(prev => ({ ...prev, itemCount: parseInt(e.target.value) }))
              }
            />
            {testConfig.itemCount}
          </label>
          <label className="flex items-center gap-2">
            Delay (ms):
            <input
              type="range"
              min="0"
              max="200"
              value={testConfig.animationDelay}
              onChange={e =>
                setTestConfig(prev => ({ ...prev, animationDelay: parseInt(e.target.value) }))
              }
            />
            {testConfig.animationDelay}
          </label>
        </div>
      </div>

      {/* Test Scenarios */}
      <div className="space-y-8">
        {/* Long List Test */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-bold mb-4">Long List Performance</h3>
          <StaggeredAnimationWrapper>
            {testItems.map(item => (
              <div
                key={item.id}
                className="w-full h-20 bg-gray-200 rounded mb-4"
                data-animation
                style={{
                  transitionDelay: `${item.delay}ms`,
                  ...(testConfig.lowEndMode && {
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                  }),
                }}
              />
            ))}
          </StaggeredAnimationWrapper>
        </div>

        {/* Rapid Interaction Test */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-bold mb-4">Rapid Interaction Test</h3>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <AnimationWrapper key={i} interactive mobileOptimized={testConfig.lowEndMode}>
                <div className="w-32 h-32 bg-blue-500 rounded cursor-pointer" data-animation />
              </AnimationWrapper>
            ))}
          </div>
        </div>

        {/* Nested Animation Test */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-bold mb-4">Nested Animation Test</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <AnimationWrapper
                key={i}
                config={{
                  type: 'slide',
                  direction: 'up',
                  distance: 20,
                  delay: i * 100,
                }}
              >
                <div className="p-4 bg-gray-100 rounded">
                  <h4 className="font-bold mb-2">Nested Level {i + 1}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <AnimationWrapper
                        key={j}
                        config={{
                          type: 'scale',
                          delay: j * 50,
                        }}
                      >
                        <div className="h-20 bg-green-500 rounded" data-animation />
                      </AnimationWrapper>
                    ))}
                  </div>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </div>

        {/* Overflow Test */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-bold mb-4">Overflow Test</h3>
          <div className="h-96 overflow-auto">
            <StaggeredAnimationWrapper>
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="w-full h-32 bg-purple-500 rounded mb-4" data-animation />
              ))}
            </StaggeredAnimationWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
