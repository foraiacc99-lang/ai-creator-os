import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const cookieState = req.cookies.get('oauth_state')?.value;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (cookieState && state && cookieState !== state) {
    return NextResponse.redirect(`${appUrl}/settings?gcal_error=invalid_oauth_state`);
  }

  if (error) {
    return NextResponse.redirect(`${appUrl}/settings?gcal_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/settings?gcal_error=no_code_provided`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/calendar/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${appUrl}/settings?gcal_error=${encodeURIComponent('Google Client ID/Secret not set in server environment')}`
    );
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return NextResponse.redirect(`${appUrl}/settings?gcal_error=${encodeURIComponent(`Token exchange failed: ${err}`)}`);
    }

    const tokenData = await tokenRes.json();
    const response = NextResponse.redirect(`${appUrl}/settings?gcal_success=true`);
    if (tokenData.access_token) {
      response.cookies.set('gcal_token', tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      });
    }
    return response;
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.redirect(`${appUrl}/settings?gcal_error=${encodeURIComponent(err.message)}`);
  }
}
