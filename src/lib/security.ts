/**
 * Security utilities for AI Creator OS
 * Protects against SSRF, validates gateway URLs, and sanitizes API boundaries.
 */

export function isSafeEndpoint(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block cloud metadata services (AWS, GCP, Azure, DigitalOcean)
    if (
      hostname === '169.254.169.254' ||
      hostname.startsWith('169.254.') ||
      hostname === 'metadata.google.internal' ||
      hostname === 'metadata'
    ) {
      return false;
    }

    // Block link-local IPv6 addresses
    if (hostname === '[fe80::1]' || hostname.includes('fe80:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes external error messages to prevent sensitive operational disclosure
 */
export function sanitizeErrorMessage(err: unknown, fallback = 'Internal server error'): string {
  if (err instanceof Error) {
    // Strip file system paths from stack or message
    const cleanMsg = err.message.replace(/([A-Za-z]:\\[^:\s]+|\/[a-zA-Z0-9_\-\.\/]+)/g, '[internal-path]');
    return cleanMsg || fallback;
  }
  return fallback;
}

