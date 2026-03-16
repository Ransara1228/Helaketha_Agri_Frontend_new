import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headers = await getAuthHeaders(request);
    const { id } = await params;
    const response = await fetch(`${BACKEND_API_URL}/harvester-drivers/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorMessage = await parseBackendError(response, 'Failed to fetch harvester driver');
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching harvester driver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headers = await getAuthHeaders(request);
    const { id } = await params;
    const body = await request.json();
    const response = await fetch(`${BACKEND_API_URL}/harvester-drivers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = await parseBackendError(response, 'Failed to update harvester driver');
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating harvester driver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headers = await getAuthHeaders(request);
    const { id } = await params;
    const response = await fetch(`${BACKEND_API_URL}/harvester-drivers/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorMessage = await parseBackendError(response, 'Failed to delete harvester driver');
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting harvester driver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

