import { NextResponse } from 'next/server';
import { fetchVipaymentGameFeature } from '@/services/provider/vippayment.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const filterType = searchParams.get('filter_type');
    const filterValue = searchParams.get('filter_value');
    const filterStatus = searchParams.get('filter_status');

    const responseData = await fetchVipaymentGameFeature({
      filterType,
      gameCode : filterValue,
      filterStatus,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in API route:', error.message);
    return NextResponse.json(
      { result: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
