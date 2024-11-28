import { NextResponse } from 'next/server';
import { caddyService } from '@/lib/services/caddy-service';

// This endpoint will be called during application startup
export async function POST() {
  try {
    await caddyService.initialize();
    const status = await caddyService.getStatus();
    
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to initialize system:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize system' 
      },
      { status: 500 }
    );
  }
}

// Endpoint to check system status
export async function GET() {
  try {
    const status = await caddyService.getStatus();
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to get system status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get system status' 
      },
      { status: 500 }
    );
  }
}
