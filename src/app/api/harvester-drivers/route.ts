import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';

// Backend API URL - use environment variable or default
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

async function getAuthHeaders(request: NextRequest) {
  const jwtToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const jwtAccessToken = (jwtToken as any)?.accessToken || (jwtToken as any)?.idToken;
  const session = await getServerSession(authOptions);
  const sessionAccessToken = (session as any)?.accessToken || (session as any)?.idToken;
  const accessToken = jwtAccessToken || sessionAccessToken;
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function parseBackendError(response: Response, fallback: string) {
  const rawText = await response.text().catch(() => '');
  if (!rawText) return fallback;

  try {
    const data = JSON.parse(rawText);
    return (
      data?.message ||
      data?.error ||
      (Array.isArray(data?.details) ? data.details.join(', ') : undefined) ||
      fallback
    );
  } catch {
    return rawText || fallback;
  }
}

// Proxy route to handle CORS and API calls
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(`${BACKEND_API_URL}/harvester-drivers`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorMessage = await parseBackendError(response, 'Failed to fetch harvester drivers');
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching harvester drivers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    const body = await request.json();
    const response = await fetch(`${BACKEND_API_URL}/harvester-drivers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = await parseBackendError(response, 'Failed to create harvester driver');
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating harvester driver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

