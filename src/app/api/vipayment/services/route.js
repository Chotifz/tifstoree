import { NextResponse } from 'next/server';

const API_KEY = process.env.VIPPAYMENT_KEY;
const sign = process.env.VIPPAYMENT_SIGN;

export async function GET(request) {
  try {
    const params = new URLSearchParams({
      key: API_KEY,
      sign: sign,
      type: 'services',
    });
    
    const { searchParams } = new URL(request.url);
    
    const filterType = searchParams.get('filter_type');
    const filterValue = searchParams.get('filter_value');
    const filterStatus = searchParams.get('filter_status');
    
    if (filterType) params.append('filter_type', filterType);
    if (filterValue) params.append('filter_value', filterValue);
    if (filterStatus) params.append('filter_status', filterStatus);
    
    const response = await fetch(`${process.env.API_URL_SERVER}/game-feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { 
        result: false, 
        message: 'Failed to fetch services', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}