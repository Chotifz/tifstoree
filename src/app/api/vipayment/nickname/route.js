import { NextResponse } from 'next/server';

const PROVIDER_API_URL = process.env.API_URL_SERVER + '/game-feature';
const API_KEY = process.env.VIPPAYMENT_KEY;
const API_SIGN = process.env.VIPPAYMENT_SIGN;

async function fetchGameNickname({ gameCode, userId, zoneId }) {
  try {
    const signature = API_SIGN
    
    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('sign', signature);
    formData.append('type', 'get-nickname');
    formData.append('code', gameCode);
    formData.append('target', userId);
    
    if (zoneId) {
      formData.append('additional_target', zoneId);
    }
    
    const response = await fetch(PROVIDER_API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.result) {
      throw new Error(data.message || 'Failed to fetch nickname');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching game nickname:', error);
    throw error;
  }
}


export async function POST(request) {
  try {

    const body = await request.json();
    const { gameCode, userId, zoneId } = body;
    
 
    if (!gameCode || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: gameCode and userId" },
        { status: 400 }
      );
    }
    
    const result = await fetchGameNickname({ gameCode, userId, zoneId });
    
    return NextResponse.json({
      success: true,
      nickname: result.data,
      message: result.message,
    });
    
  } catch (error) {
    console.error('Nickname API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch nickname", 
      }, 
      { status: 500 }
    );
  }
}