import * as crypto from 'crypto';

export function mapSeverityToPriority(severity: string): string {
  const mapping: Record<string, string> = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
  };

  return mapping[severity] || 'MEDIUM';
}

export function normalizeIpAddress(ipAddress?: string | null): string | null {
  if (!ipAddress) {
    return null;
  }

  const normalizedIp = ipAddress.trim();

  if (!normalizedIp || normalizedIp.toLowerCase() === 'unknown') {
    return null;
  }

  if (normalizedIp.includes(',')) {
    const [forwardedIp] = normalizedIp.split(',');
    return normalizeIpAddress(forwardedIp);
  }

  if (normalizedIp.startsWith('::ffff:')) {
    return normalizedIp.slice(7);
  }

  return normalizedIp;
}

export function hashIP(ipAddress: string): string {
  return crypto
    .createHash('sha256')
    .update(ipAddress)
    .digest('hex')
    .substring(0, 32);
}
