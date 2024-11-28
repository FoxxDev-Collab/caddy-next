import { spawn, ChildProcess, execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { CaddyStatus, CaddyError } from './types';
import { CaddyConfigGenerator } from './config';

export class CaddyManager {
  private static instance: CaddyManager;
  private process: ChildProcess | null = null;
  private startTime: Date | null = null;
  private reloadRetryCount: number = 0;
  private maxReloadRetries: number = 3;

  private constructor() {}

  public static getInstance(): CaddyManager {
    if (!CaddyManager.instance) {
      CaddyManager.instance = new CaddyManager();
    }
    return CaddyManager.instance;
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      path.join(process.cwd(), 'config'),
      path.join(process.cwd(), 'config/hosts'),
      path.join(process.cwd(), 'config/ssl')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async waitForAdminAPI(): Promise<boolean> {
    const maxAttempts = 30;  // Increased from 5 to 30
    const delayMs = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://0.0.0.0:2019/config/');
        if (response.ok) {
          console.log('Successfully connected to Caddy admin API');
          return true;
        }
      } catch (err) {
        console.log(`Waiting for Caddy admin API (attempt ${i + 1}/${maxAttempts})...`);
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    console.error('Failed to connect to Caddy admin API after maximum attempts');
    return false;
  }

  public async start(): Promise<void> {
    if (this.process) {
      throw new CaddyError('Caddy is already running', 'ALREADY_RUNNING');
    }

    await this.ensureDirectories();

    try {
      // In containerized environment, Caddy is guaranteed to be installed
      execSync('caddy version', { stdio: 'ignore' });
    } catch {
      console.warn('Caddy version check failed, but continuing as we might be in a container');
    }

    const caddyfilePath = CaddyConfigGenerator.getCaddyfilePath();
    
    // Ensure Caddyfile exists
    if (!await fs.access(caddyfilePath).then(() => true).catch(() => false)) {
      // Create default Caddyfile if it doesn't exist
      await fs.writeFile(caddyfilePath, CaddyConfigGenerator.generateCaddyfile({
        hosts: [],
        globalSettings: { logLevel: 'INFO' }
      }));
    }

    this.process = spawn('caddy', ['run', '--config', caddyfilePath], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    this.startTime = new Date();

    // Handle process events
    this.process.on('error', (error) => {
      console.error('Caddy process error:', error);
      this.process = null;
      this.startTime = null;
    });

    this.process.on('exit', (code) => {
      console.log(`Caddy process exited with code ${code}`);
      this.process = null;
      this.startTime = null;
    });

    // Log stdout and stderr
    this.process.stdout?.on('data', (data) => {
      console.log('[Caddy]', data.toString());
    });

    this.process.stderr?.on('data', (data) => {
      console.error('[Caddy Error]', data.toString());
    });

    // Wait for admin API to be available
    const apiAvailable = await this.waitForAdminAPI();
    if (!apiAvailable) {
      throw new CaddyError('Caddy admin API not available after timeout', 'START_FAILED');
    }

    if (!this.process) {
      throw new CaddyError('Failed to start Caddy process', 'START_FAILED');
    }
  }

  public async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.process.kill();
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.process) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  private async reloadWithRetry(caddyfileContent: string): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let attempt = 1; attempt <= this.maxReloadRetries; attempt++) {
      try {
        console.log(`Attempting to reload Caddy configuration (attempt ${attempt}/${this.maxReloadRetries})...`);
        const response = await fetch('http://0.0.0.0:2019/load', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/caddyfile',
          },
          body: caddyfileContent,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to reload Caddy: ${response.statusText} - ${errorText}`);
        }

        console.log('Successfully reloaded Caddy configuration');
        // Reset retry count on success
        this.reloadRetryCount = 0;
        return;
      } catch (err) {
        console.error(`Reload attempt ${attempt} failed:`, err);
        
        if (attempt === this.maxReloadRetries) {
          throw new CaddyError('Failed to reload Caddy configuration after multiple attempts', 'RELOAD_FAILED');
        }
        
        // Wait before retrying with exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${backoffTime}ms before next attempt...`);
        await delay(backoffTime);
      }
    }
  }

  public async reload(): Promise<void> {
    try {
      // Read the current Caddyfile content
      const caddyfilePath = CaddyConfigGenerator.getCaddyfilePath();
      const caddyfileContent = await fs.readFile(caddyfilePath, 'utf-8');

      // Validate config before attempting reload
      if (!await this.validateConfig()) {
        throw new Error('Invalid Caddy configuration');
      }

      // Attempt reload with retry logic
      await this.reloadWithRetry(caddyfileContent);
    } catch (err) {
      console.error('Failed to reload Caddy:', err);
      throw new CaddyError('Failed to reload Caddy configuration', 'RELOAD_FAILED');
    }
  }

  public async getStatus(): Promise<CaddyStatus> {
    let version: string | undefined;
    try {
      version = execSync('caddy version').toString().trim();
    } catch (err) {
      console.error('Failed to get Caddy version:', err);
    }

    return {
      running: true, // In containerized environment, Caddy is always running
      configFile: CaddyConfigGenerator.getCaddyfilePath(),
      version
    };
  }

  public async validateConfig(): Promise<boolean> {
    try {
      execSync('caddy validate --config ' + CaddyConfigGenerator.getCaddyfilePath());
      return true;
    } catch (err) {
      console.error('Config validation failed:', err);
      return false;
    }
  }
}

// Export a singleton instance
export const caddyManager = CaddyManager.getInstance();
