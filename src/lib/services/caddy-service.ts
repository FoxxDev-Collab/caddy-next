import { caddyManager } from '../caddy/manager';
import { configWatcher } from '../config/watcher';
import { CaddyError } from '../caddy/types';

class CaddyService {
  private static instance: CaddyService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): CaddyService {
    if (!CaddyService.instance) {
      CaddyService.instance = new CaddyService();
    }
    return CaddyService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Caddy service...');

      // Start Caddy process
      await caddyManager.start();
      console.log('Caddy process started');

      // Start config watcher
      await configWatcher.start();
      console.log('Config watcher started');

      this.isInitialized = true;
      console.log('Caddy service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Caddy service:', error);
      if (error instanceof CaddyError) {
        switch (error.code) {
          case 'NOT_INSTALLED':
            console.error('Please ensure Caddy is installed and available in PATH');
            break;
          case 'ALREADY_RUNNING':
            console.error('Another instance of Caddy is already running');
            break;
          default:
            console.error('An unexpected error occurred:', error.message);
        }
      }
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('Shutting down Caddy service...');

      // Stop config watcher
      await configWatcher.stop();
      console.log('Config watcher stopped');

      // Stop Caddy process
      await caddyManager.stop();
      console.log('Caddy process stopped');

      this.isInitialized = false;
      console.log('Caddy service shut down successfully');
    } catch (error) {
      console.error('Failed to shut down Caddy service:', error);
      throw error;
    }
  }

  public async getStatus(): Promise<{
    initialized: boolean;
    caddyStatus: Awaited<ReturnType<typeof caddyManager.getStatus>>;
  }> {
    return {
      initialized: this.isInitialized,
      caddyStatus: await caddyManager.getStatus()
    };
  }
}

// Export singleton instance
export const caddyService = CaddyService.getInstance();

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await caddyService.shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await caddyService.shutdown();
    process.exit(0);
  });
}
