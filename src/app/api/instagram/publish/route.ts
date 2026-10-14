import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      accountId,
      accessToken,
      caption,
      mediaUrl,
      mediaType = 'REELS',
      coverUrl,
      shareToFeed = true,
    } = await req.json();

    if (!accountId || !accessToken) {
      return NextResponse.json({
        success: false,
        supportsDirectPublishing: false,
        message: 'No active Instagram access token found. Please use the Manual Publishing Workflow below.',
      });
    }

    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    // Step 1: Create media container
    let containerEndpoint = `https://graph.facebook.com/${apiVersion}/${accountId}/media`;
    let containerPayload: Record<string, any> = {
      caption,
      access_token: accessToken,
    };

    if (mediaType === 'REELS') {
      containerPayload.media_type = 'REELS';
      containerPayload.video_url = mediaUrl;
      containerPayload.share_to_feed = shareToFeed;
      if (coverUrl) containerPayload.cover_url = coverUrl;
    } else if (mediaType === 'IMAGE') {
      containerPayload.image_url = mediaUrl;
    }

    const containerRes = await fetch(containerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerPayload),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || !containerData.id) {
      throw new Error(containerData.error?.message || 'Failed to create media upload container on Instagram');
    }

    const creationId = containerData.id;

    // Step 2: Publish media container
    const publishEndpoint = `https://graph.facebook.com/${apiVersion}/${accountId}/media_publish`;
    const publishRes = await fetch(publishEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok) {
      throw new Error(publishData.error?.message || 'Publishing container failed');
    }

    return NextResponse.json({
      success: true,
      publishedPostId: publishData.id,
      publishedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      message: e.message || 'Direct publishing error',
      manualFallbackRecommended: true,
    });
  }
}
