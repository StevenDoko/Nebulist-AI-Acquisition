// Gmail OAuth Callback Endpoint
// Handles OAuth callback and exchanges code for tokens

import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/gmail';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json(
        { error: `OAuth error: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not found' },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Return tokens (in production, save to database)
    return NextResponse.json({
      success: true,
      message: 'Gmail authorization successful!',
      refreshToken: tokens.refresh_token,
      instructions: [
        'Copy the refresh_token below',
        'Add it to your .env.local file as GMAIL_REFRESH_TOKEN',
        'Restart your application',
      ],
    });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete authorization' },
      { status: 500 }
    );
  }
}
