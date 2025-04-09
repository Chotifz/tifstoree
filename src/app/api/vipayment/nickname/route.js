import { NextResponse } from 'next/server';
import { checkNickname } from '@/services/provider/vippayment.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameCode = searchParams.get('gameCode');
    const userId = searchParams.get('userId');
    const zoneId = searchParams.get('zoneId');
    
    if (!gameCode || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: gameCode and userId" },
        { status: 400 }
      );
    }
 
    const result = await checkNickname({ gameCode, userId, zoneId });
    
    return NextResponse.json({
      success: true,
      nickname: result.nickname,
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