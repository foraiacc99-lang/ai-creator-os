import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accountId, accessToken } = await req.json();

    if (!accountId || !accessToken) {
      return NextResponse.json({
        success: false,
        message: 'Account ID and valid Access Token are required to sync live Instagram data.',
      }, { status: 400 });
    }

    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    // 1. Fetch recent media posts with pagination
    const mediaFields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';
    const mediaUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/media?fields=${mediaFields}&limit=25&access_token=${accessToken}`;

    const mediaRes = await fetch(mediaUrl);
    const mediaData = await mediaRes.json();

    if (!mediaRes.ok) {
      throw new Error(mediaData.error?.message || 'Failed to fetch Instagram media');
    }

    // 2. Fetch account total insights
    const insightsUrl = `https://graph.facebook.com/${apiVersion}/${accountId}/insights?metric=impressions,reach,profile_views&period=days_28&access_token=${accessToken}`;
    const insightsRes = await fetch(insightsUrl);
    const insightsData = await insightsRes.json();

    return NextResponse.json({
      success: true,
      mediaCount: mediaData.data?.length || 0,
      posts: mediaData.data || [],
      insights: insightsData.data || [],
      syncedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      message: e.message || 'Sync failed',
    }, { status: 500 });
  }
}
