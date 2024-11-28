'use client';

import { useEffect } from 'react';

export function SystemInitializer() {
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const response = await fetch('/api/system/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          console.error('Failed to initialize system:', data.error);
          return;
        }

        const data = await response.json();
        console.log('System initialized successfully:', data);
      } catch (error) {
        console.error('Error initializing system:', error);
      }
    };

    initializeSystem();

    // No cleanup needed as Caddy service handles shutdown via process signals
  }, []);

  // This component doesn't render anything
  return null;
}
