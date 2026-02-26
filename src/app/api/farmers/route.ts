import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Backend API URL - use environment variable or default
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Proxy route to handle CORS and API calls [cite: 1]
export async function GET(request: NextRequest) {
  // Read session using getServerSession [cite: 1, 32]
  const session = await getServerSession(authOptions);

  // Return unauthorized error if no session exists [cite: 1]
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}/farmers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Call backend with Authorization: Bearer token [cite: 1, 33, 34]
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Failed to fetch farmers: ${response.status} ${response.statusText}`;
      console.error('Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: `${BACKEND_API_URL}/farmers`
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Return backend response [cite: 1, 35]
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching farmers:', {
      error: errorMessage,
      url: `${BACKEND_API_URL}/farmers`,
      backendUrl: BACKEND_API_URL
    });
    
    // Check if it's a connection error
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: `Cannot connect to backend server at ${BACKEND_API_URL}. Please ensure the backend is running.` },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Read session using getServerSession [cite: 1, 32]
  const session = await getServerSession(authOptions);

  // Return unauthorized error if no session exists [cite: 1]
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_API_URL}/farmers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Call backend with Authorization: Bearer token [cite: 1, 33, 34]
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to create farmer' },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Return backend response [cite: 1, 35]
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating farmer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}