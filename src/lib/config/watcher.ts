import chokidar from 'chokidar';
import path from 'path';
import { caddyManager } from '../caddy/manager';
import debounce from 'lodash/debounce';

export class ConfigWatcher {
  private static instance: ConfigWatcher;
  private watcher: chokidar.FSWatcher | null = null;

  private constructor() {}

  public static getInstance(): ConfigWatcher {
    if (!ConfigWatcher.instance) {
      ConfigWatcher.instance = new ConfigWatcher();
    }
    return ConfigWatcher.instance;
  }

  private handleConfigChange = debounce(async () => {
    console.log('Configuration change detected, validating...');
    
    try {
      const isValid = await caddyManager.validateConfig();
      if (isValid) {
        console.log('Configuration is valid, reloading Caddy...');
        await caddyManager.reload();
        console.log('Caddy reloaded successfully');
      } else {
        console.error('Invalid configuration detected, skipping reload');
      }
    } catch (err) {
      console.error('Error handling configuration change:', err);
    }
  }, 1000);

  public async start(): Promise<void> {
    if (this.watcher) {
      return;
    }

    const configDir = path.join(process.cwd(), 'config');
    
    this.watcher = chokidar.watch([
      path.join(configDir, 'Caddyfile'),
      path.join(configDir, 'hosts', '*.conf')
    ], {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', this.handleConfigChange)
      .on('change', this.handleConfigChange)
      .on('unlink', this.handleConfigChange)
      .on('error', (error) => {
        console.error('Config watcher error:', error);
      });

    console.log('Config watcher started');
  }

  public async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      console.log('Config watcher stopped');
    }
  }
}

// Export a singleton instance
export const configWatcher = ConfigWatcher.getInstance();
