import { NextResponse } from 'next/server';
import { SSLCertificate } from '@/lib/caddy/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { CaddyConfigGenerator } from '@/lib/caddy/config';
import { caddyManager } from '@/lib/caddy/manager';
import { CaddyHost } from '@/lib/caddy/types';

// Helper to get SSL status for a domain
async function getSSLStatus(domain: string): Promise<SSLCertificate | null> {
  try {
    const config = await CaddyConfigGenerator.loadConfig();
    const host = config.hosts.find((h: CaddyHost) => h.domain === domain);
    
    if (host?.enabled) {
      return {
        id: host.id,
        domain: host.domain,
        issuer: 'Let\'s Encrypt',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
        autoRenew: true
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting SSL status:', error);
    return null;
  }
}

export async function GET() {
  console.log('Handling GET request to /api/ssl');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = await CaddyConfigGenerator.loadConfig();
    const certificates = await Promise.all(
      config.hosts
        .filter((host: CaddyHost) => host.enabled && host.ssl)
        .map((host: CaddyHost) => getSSLStatus(host.domain))
    );

    return new NextResponse(
      JSON.stringify(certificates.filter((cert: SSLCertificate | null) => cert !== null)),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in GET /api/ssl:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  console.log('Handling POST request to /api/ssl');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { domain } = await request.json();
    if (!domain) {
      return new NextResponse(
        JSON.stringify({ error: 'Domain is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update host configuration to enable SSL
    const config = await CaddyConfigGenerator.loadConfig();
    const host = config.hosts.find((h: CaddyHost) => h.domain === domain);
    
    if (!host) {
      return new NextResponse(
        JSON.stringify({ error: 'Host not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    host.ssl = true;
    await CaddyConfigGenerator.saveConfig(config);
    await caddyManager.reload();

    const certificate = await getSSLStatus(domain);
    return new NextResponse(
      JSON.stringify(certificate),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in POST /api/ssl:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request: Request) {
  console.log('Handling DELETE request to /api/ssl');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Certificate ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update host configuration to disable SSL
    const config = await CaddyConfigGenerator.loadConfig();
    const host = config.hosts.find((h: CaddyHost) => h.id === id);
    
    if (!host) {
      return new NextResponse(
        JSON.stringify({ error: 'Host not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    host.ssl = false;
    await CaddyConfigGenerator.saveConfig(config);
    await caddyManager.reload();

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in DELETE /api/ssl:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
