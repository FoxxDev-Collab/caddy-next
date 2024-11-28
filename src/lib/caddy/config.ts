import { CaddyHost, CaddyConfig } from './types';
import path from 'path';
import { promises as fs } from 'fs';

export class CaddyConfigGenerator {
  private static generateHostBlock(host: CaddyHost): string {
    const lines: string[] = [];
    
    // Domain definition
    lines.push(`${host.domain} {`);
    
    // Reverse proxy configuration
    lines.push('  reverse_proxy {');
    lines.push(`    to ${host.targetHost}:${host.targetPort}`);
    lines.push('    header_up Host {upstream_hostport}');
    lines.push('    header_up X-Real-IP {remote_host}');
    lines.push('    header_up X-Forwarded-For {remote_host}');
    lines.push('    header_up X-Forwarded-Proto {scheme}');
    lines.push('  }');
    
    lines.push('}');
    
    return lines.join('\n');
  }

  public static generateCaddyfile(config: CaddyConfig): string {
    const lines: string[] = [];
    
    // Global settings
    lines.push('{');
    lines.push('  # Global options');
    lines.push('  admin 0.0.0.0:2019');
    lines.push('  persist_config off');
    
    if (config.globalSettings?.logLevel) {
      lines.push(`  debug ${config.globalSettings.logLevel.toLowerCase()}`);
    }
    
    if (config.globalSettings?.defaultSNIHost) {
      lines.push(`  default_sni ${config.globalSettings.defaultSNIHost}`);
    }
    
    lines.push('}');
    lines.push('');
    
    // Import all host configurations
    lines.push('# Import host configurations');
    lines.push('import config/hosts/*.conf');
    
    return lines.join('\n');
  }

  public static generateHostConfig(host: CaddyHost): string {
    if (!host.enabled) {
      return `# Host ${host.domain} is disabled`;
    }
    return this.generateHostBlock(host);
  }

  public static getHostConfigPath(hostId: string): string {
    return path.join(process.cwd(), 'config', 'hosts', `${hostId}.conf`);
  }

  public static getCaddyfilePath(): string {
    return path.join(process.cwd(), 'config', 'Caddyfile');
  }

  public static getConfigPath(): string {
    return path.join(process.cwd(), 'config', 'config.json');
  }

  public static async loadConfig(): Promise<CaddyConfig> {
    try {
      const configPath = this.getConfigPath();
      const configData = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      // Return default config if file doesn't exist
      return {
        hosts: [],
        globalSettings: {
          logLevel: 'INFO'
        }
      };
    }
  }

  public static async saveConfig(config: CaddyConfig): Promise<void> {
    const configPath = this.getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    // Generate and save individual host configs
    const hostsDir = path.join(process.cwd(), 'config', 'hosts');
    await fs.mkdir(hostsDir, { recursive: true });

    // Clear existing host configs
    const existingFiles = await fs.readdir(hostsDir);
    await Promise.all(
      existingFiles.map(file => 
        fs.unlink(path.join(hostsDir, file))
      )
    );

    // Write new host configs
    await Promise.all(
      config.hosts.map(host =>
        fs.writeFile(
          this.getHostConfigPath(host.id),
          this.generateHostConfig(host)
        )
      )
    );

    // Generate and save Caddyfile
    await fs.writeFile(
      this.getCaddyfilePath(),
      this.generateCaddyfile(config)
    );
  }
}

// Helper function to validate host configuration
export function validateHostConfig(host: CaddyHost): string[] {
  const errors: string[] = [];
  
  if (!host.domain) {
    errors.push('Domain is required');
  }
  
  if (!host.targetHost) {
    errors.push('Target host is required');
  }
  
  if (!host.targetPort || host.targetPort < 1 || host.targetPort > 65535) {
    errors.push('Invalid target port');
  }
  
  return errors;
}
