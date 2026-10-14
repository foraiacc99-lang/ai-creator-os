import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || `${req.nextUrl.origin}/api/instagram/callback`;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';

  if (!appId || appId.includes('your-meta')) {
    // If Meta App ID is not yet configured in .env, redirect to onboarding with explanatory query
    return NextResponse.redirect(
      new URL('/?setup_required=meta_app_id&msg=Please+configure+META_APP_ID+in+.env', req.url)
    );
  }

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);
  const scope = [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
    'instagram_content_publish',
  ].join(',');

  const authUrl = `https://www.facebook.com/${apiVersion}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&response_type=code&state=${state}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('ig_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 15, // 15 mins
    path: '/',
  });

  return response;
}
