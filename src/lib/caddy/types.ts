export interface CaddyHost {
  id: string;
  domain: string;
  targetHost: string;
  targetPort: number;
  ssl: boolean;
  forceSSL: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSLCertificate {
  id: string;
  domain: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  autoRenew: boolean;
}

export interface CaddyConfig {
  hosts: CaddyHost[];
  globalSettings: {
    defaultSNIHost?: string;
    logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  };
}

// Error types for better error handling
export class CaddyError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CaddyError';
  }
}

export type CaddyStatus = {
  running: boolean;
  pid?: number;
  uptime?: number;
  configFile: string;
  version?: string;
};
