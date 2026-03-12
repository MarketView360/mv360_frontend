import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "fd33e1d170a841198cc2751f74fbe212";
const SITE_URL = "https://www.marketview360.io";

// IndexNow endpoints for different search engines
const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

interface IndexNowRequest {
  urls: string[];
}

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow for instant indexing by Bing, Yandex, and other search engines
 * 
 * Body: { urls: string[] }
 * 
 * Usage: Call this endpoint when new content is published or updated
 */
export async function POST(request: NextRequest) {
  try {
    const body: IndexNowRequest = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    // Limit to 10,000 URLs per request (IndexNow limit)
    if (urls.length > 10000) {
      return NextResponse.json(
        { error: "Maximum 10,000 URLs per request" },
        { status: 400 }
      );
    }

    // Validate URLs belong to our domain
    const validUrls = urls.filter(url => url.startsWith(SITE_URL));
    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid URLs for this domain" },
        { status: 400 }
      );
    }

    // Prepare IndexNow payload
    const payload = {
      host: "www.marketview360.io",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: validUrls,
    };

    // Submit to all IndexNow endpoints
    const results = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        return {
          endpoint,
          status: response.status,
          ok: response.ok,
        };
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.ok
    ).length;

    return NextResponse.json({
      success: true,
      message: `Submitted ${validUrls.length} URLs to ${successCount}/${INDEXNOW_ENDPOINTS.length} endpoints`,
      urlsSubmitted: validUrls.length,
      results: results.map((r) =>
        r.status === "fulfilled"
          ? { endpoint: r.value.endpoint, status: r.value.status }
          : { error: "failed" }
      ),
    });
  } catch (error) {
    console.error("IndexNow submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit URLs" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexnow
 * Returns the IndexNow key for verification
 */
export async function GET() {
  return NextResponse.json({
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    endpoints: INDEXNOW_ENDPOINTS,
  });
}
