import { NextResponse } from 'next/server';
import { SSLCertificate } from '@/lib/caddy/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import path from 'path';
import { promises as fs } from 'fs';
import { CaddyConfigGenerator } from '@/lib/caddy/config';
import { caddyManager } from '@/lib/caddy/manager';

// Helper to ensure SSL directory exists
async function ensureSSLDirectory() {
  const sslDir = path.join(process.cwd(), 'config/ssl');
  try {
    await fs.mkdir(sslDir, { recursive: true });
    console.log('SSL directory ensured at:', sslDir);
    return sslDir;
  } catch (error) {
    console.error('Error ensuring SSL directory:', error);
    throw error;
  }
}

// Helper to read SSL certificates
async function readSSLCertificates(): Promise<SSLCertificate[]> {
  console.log('Reading SSL certificates...');
  const sslDir = await ensureSSLDirectory();
  try {
    const files = await fs.readdir(sslDir);
    console.log('Found files in SSL directory:', files);
    
    const certificates: SSLCertificate[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(sslDir, file), 'utf-8');
        certificates.push(JSON.parse(content));
      }
    }
    
    console.log('Loaded certificates:', certificates);
    return certificates;
  } catch (error) {
    console.error('Error reading SSL certificates:', error);
    return [];
  }
}

// Helper to update Caddy configuration for SSL
async function updateCaddyConfig(domain: string, enableSSL: boolean = true) {
  console.log('Updating Caddy config for domain:', domain);
  try {
    const config = await CaddyConfigGenerator.loadConfig();
    const hostToUpdate = config.hosts.find(host => host.domain === domain);
    
    if (hostToUpdate) {
      hostToUpdate.ssl = enableSSL;
      hostToUpdate.forceSSL = enableSSL;
      await CaddyConfigGenerator.saveConfig(config);
      await caddyManager.reload();
      console.log('Caddy config updated and reloaded successfully');
    } else {
      console.log('No matching host found for domain:', domain);
    }
  } catch (error) {
    console.error('Error updating Caddy config:', error);
    throw error;
  }
}

export async function GET() {
  console.log('Handling GET request to /api/ssl');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');

    if (!session) {
      console.log('Unauthorized access attempt');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const certificates = await readSSLCertificates();
    return new NextResponse(
      JSON.stringify(certificates),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/ssl:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function POST(request: Request) {
  console.log('Handling POST request to /api/ssl');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');

    if (!session) {
      console.log('Unauthorized access attempt');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const data = await request.json();
    console.log('Received data:', data);
    const { domain } = data;

    if (!domain) {
      return new NextResponse(
        JSON.stringify({ error: 'Domain is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Create SSL certificate
    const certificate: SSLCertificate = {
      id: crypto.randomUUID(),
      domain,
      issuer: 'Let\'s Encrypt',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
      autoRenew: true
    };

    console.log('Created certificate:', certificate);

    // Save certificate
    const sslDir = await ensureSSLDirectory();
    const certPath = path.join(sslDir, `${certificate.id}.json`);
    await fs.writeFile(certPath, JSON.stringify(certificate, null, 2));
    console.log('Saved certificate to:', certPath);

    // Update Caddy configuration
    await updateCaddyConfig(domain, true);

    return new NextResponse(
      JSON.stringify(certificate),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error in POST /api/ssl:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function DELETE(request: Request) {
  console.log('Handling DELETE request to /api/ssl');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session status:', session ? 'Authenticated' : 'Not authenticated');

    if (!session) {
      console.log('Unauthorized access attempt');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Delete request for certificate ID:', id);

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Certificate ID is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const sslDir = await ensureSSLDirectory();
    const certPath = path.join(sslDir, `${id}.json`);
    console.log('Attempting to delete certificate at:', certPath);
    
    // Read certificate before deleting to get domain
    let domain: string | undefined;
    try {
      const certContent = await fs.readFile(certPath, 'utf-8');
      const cert = JSON.parse(certContent) as SSLCertificate;
      domain = cert.domain;
    } catch {
      console.log('Certificate file not found:', certPath);
      return new NextResponse(
        JSON.stringify({ error: 'Certificate not found' }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Delete the certificate file
    await fs.unlink(certPath);
    console.log('Successfully deleted certificate:', certPath);

    // Update Caddy configuration if we found the domain
    if (domain) {
      await updateCaddyConfig(domain, false);
    }
    
    return new NextResponse(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/ssl:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
