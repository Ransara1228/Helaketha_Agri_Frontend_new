import { NextRequest, NextResponse } from 'next/server';

// Backend API URL - use environment variable or default
const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Proxy route to handle CORS and API calls
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_API_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `Failed to create service (Status: ${response.status})` };
      }
      
      // Extract error message with details
      let errorMessage = errorData.message || errorData.error || 'Failed to create service';
      
      // Include validation details if available
      if (errorData.details) {
        if (Array.isArray(errorData.details)) {
          errorMessage += ` - ${errorData.details.join(', ')}`;
        } else if (typeof errorData.details === 'object') {
          const detailsArray = Object.entries(errorData.details).map(([key, value]) => `${key}: ${value}`);
          errorMessage += ` - ${detailsArray.join(', ')}`;
        } else {
          errorMessage += ` - ${errorData.details}`;
        }
      }
      
      if (errorData.validationErrors) {
        if (Array.isArray(errorData.validationErrors)) {
          errorMessage += ` - ${errorData.validationErrors.join(', ')}`;
        } else if (typeof errorData.validationErrors === 'object') {
          const validationArray = Object.entries(errorData.validationErrors).map(([key, value]) => `${key}: ${value}`);
          errorMessage += ` - ${validationArray.join(', ')}`;
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData.details || errorData.validationErrors || null
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

