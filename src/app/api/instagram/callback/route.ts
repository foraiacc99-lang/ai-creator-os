import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');
  const errorDescription = req.nextUrl.searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, req.url)
    );
  }

  const storedState = req.cookies.get('ig_oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/?error=Invalid+OAuth+state+parameter.+Possible+CSRF+detected.', req.url)
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || `${req.nextUrl.origin}/api/instagram/callback`;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';

  try {
    // 1. Exchange authorization code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to exchange authorization code');
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived access token (valid 60 days)
    const longLivedUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const accessToken = longLivedData.access_token || shortLivedToken;

    // 3. Query user Facebook Pages & associated Instagram Business/Creator Account
    const pagesUrl = `https://graph.facebook.com/${apiVersion}/me/accounts?fields=id,name,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}&access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    let igAccount = null;
    if (pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        if (page.instagram_business_account) {
          igAccount = page.instagram_business_account;
          break;
        }
      }
    }

    if (!igAccount) {
      return NextResponse.redirect(
        new URL(
          '/?warning=No+Instagram+Business+or+Creator+account+found+connected+to+your+Facebook+Pages.+Ensure+your+Instagram+is+set+to+Creator/Business+mode.',
          req.url
        )
      );
    }

    // Redirect to app with success parameter
    const redirectSuccess = NextResponse.redirect(
      new URL(
        `/?connected=true&username=${encodeURIComponent(igAccount.username)}&id=${encodeURIComponent(
          igAccount.id
        )}`,
        req.url
      )
    );

    return redirectSuccess;
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err.message || 'OAuth callback failed')}`, req.url)
    );
  }
}
