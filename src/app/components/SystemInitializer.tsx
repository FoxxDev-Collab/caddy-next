'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function SystemInitializer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // Initialize system
        const systemResponse = await fetch('/api/system/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!systemResponse.ok) {
          const data = await systemResponse.json();
          console.error('Failed to initialize system:', data.error);
          return;
        }

        // Load theme settings
        const themeResponse = await fetch('/api/settings/theme');
        if (themeResponse.ok) {
          const { theme } = await themeResponse.json();
          setTheme(theme);
        }

        console.log('System initialized successfully');
      } catch (error) {
        console.error('Error initializing system:', error);
      }
    };

    initializeSystem();

    // No cleanup needed as Caddy service handles shutdown via process signals
  }, [setTheme]);

  // This component doesn't render anything
  return null;
}
