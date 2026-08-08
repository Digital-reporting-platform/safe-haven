import { Injectable, Logger } from '@nestjs/common';

export interface LocationDetectionResult {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isVpn: boolean;
  isProxy: boolean;
  source: 'ip' | 'gps' | 'unknown';
}

export interface LocationValidationResult {
  hasMismatch: boolean;
  detectedLocation: LocationDetectionResult;
  selectedRegion: string;
  warningMessage?: string;
  shouldBlock: boolean;
  isVpnOrProxy: boolean;
}

const ETHIOPIAN_REGIONS = [
  'addis ababa',
  'afar',
  'amhara',
  'benishangul-gumuz',
  'dire dawa',
  'gambela',
  'harari',
  'oromia',
  'sidama',
  'somali',
  'south ethiopia',
  'south west ethiopia',
  'tigray',
];

const REGION_ALIASES: Record<string, string[]> = {
  'addis ababa': ['addis abeba', 'addis-ababa', 'addis'],
  'amhara': ['amhara', 'bahir dar'],
  'oromia': ['oromia', 'oromiya', 'finfinne'],
  'tigray': ['tigray', 'mekelle'],
  'afar': ['afar', 'afrer'],
  'somali': ['somali', 'jijiga'],
  'gambela': ['gambela', 'gambella'],
};

@Injectable()
export class LocationValidationService {
  private readonly logger = new Logger(LocationValidationService.name);

  async validateLocation(
    selectedRegion: string,
    ipAddress: string,
    gpsLat?: number,
    gpsLng?: number,
  ): Promise<LocationValidationResult> {
    const normalizedRegion = selectedRegion.toLowerCase().trim();

    const detectedLocation = await this.detectLocation(ipAddress, gpsLat, gpsLng);

    const detectedRegionNormalized = detectedLocation.region?.toLowerCase().trim() || '';
    const selectedRegionNormalized = normalizedRegion;

    const detectedRegionMatches = this.normalizeRegionForComparison(detectedRegionNormalized);
    const selectedRegionMatches = this.normalizeRegionForComparison(selectedRegionNormalized);

    const hasMismatch = detectedRegionMatches && selectedRegionMatches
      ? detectedRegionMatches !== selectedRegionMatches
      : false;

    const isVpnOrProxy = detectedLocation.isVpn || detectedLocation.isProxy;

    let warningMessage: string | undefined;
    if (hasMismatch) {
      warningMessage = `Location mismatch detected: Your current location appears to be in ${detectedLocation.region || 'an unknown region'}, but you selected ${selectedRegion} as the incident location.`;
    }

    return {
      hasMismatch,
      detectedLocation,
      selectedRegion,
      warningMessage,
      shouldBlock: false,
      isVpnOrProxy,
    };
  }

  async detectLocation(
    ipAddress: string,
    gpsLat?: number,
    gpsLng?: number,
  ): Promise<LocationDetectionResult> {
    if (gpsLat !== undefined && gpsLng !== undefined) {
      const regionFromGps = this.getRegionFromCoordinates(gpsLat, gpsLng);
      return {
        country: 'Ethiopia',
        region: regionFromGps,
        city: 'GPS Detected',
        latitude: gpsLat,
        longitude: gpsLng,
        isVpn: false,
        isProxy: false,
        source: 'gps',
      };
    }

    return this.detectLocationFromIP(ipAddress);
  }

  private async detectLocationFromIP(ipAddress: string): Promise<LocationDetectionResult> {
    if (this.isPrivateOrLocalIP(ipAddress)) {
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        isVpn: false,
        isProxy: false,
        source: 'unknown',
      };
    }

    try {
      const locationData = await this.lookupIPLocation(ipAddress);
      return {
        ...locationData,
        source: 'ip',
      };
    } catch (error) {
      this.logger.warn(`Failed to detect location from IP ${ipAddress}: ${error}`);
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        isVpn: false,
        isProxy: false,
        source: 'unknown',
      };
    }
  }

  private isPrivateOrLocalIP(ip: string): boolean {
    const privateRanges = [
      /^127\./,
      /^localhost$/i,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^::ffff:127\./,
      /^::ffff:10\./,
      /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^::ffff:192\.168\./,
    ];

    return privateRanges.some((range) => range.test(ip));
  }

  private async lookupIPLocation(ipAddress: string): Promise<{
    country: string;
    region: string;
    city: string;
    isVpn: boolean;
    isProxy: boolean;
  }> {
    return new Promise((resolve) => {
      const req = require('http').get(
        {
          hostname: 'ip-api.com',
          path: `/json/${ipAddress}?fields=status,country,regionName,city`,
          headers: { 'User-Agent': 'SafeHaven-Reporting/1.0' },
          timeout: 5000,
        },
        (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.status !== 'success') {
                resolve({
                  country: 'Unknown',
                  region: 'Unknown',
                  city: 'Unknown',
                  isVpn: false,
                  isProxy: false,
                });
                return;
              }
              resolve({
                country: json.country || 'Unknown',
                region: json.regionName || 'Unknown',
                city: json.city || 'Unknown',
                isVpn: this.checkForVpnIndicators(ipAddress),
                isProxy: false,
              });
            } catch {
              resolve({
                country: 'Unknown',
                region: 'Unknown',
                city: 'Unknown',
                isVpn: false,
                isProxy: false,
              });
            }
          });
        }
      );
      req.on('error', () => {
        resolve({
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown',
          isVpn: false,
          isProxy: false,
        });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown',
          isVpn: false,
          isProxy: false,
        });
      });
    });
  }

  private checkForVpnIndicators(ipAddress: string): boolean {
    const knownVPNServices = [
      'vpn', 'vpn-', 'tor', 'exit-node', 'proxyl',
    ];

    for (const service of knownVPNServices) {
      if (ipAddress.toLowerCase().includes(service)) {
        return true;
      }
    }

    return false;
  }

  private normalizeRegionForComparison(region: string): string | null {
    if (!region) return null;

    const normalized = region.toLowerCase().trim();

    for (const [standardRegion, aliases] of Object.entries(REGION_ALIASES)) {
      if (aliases.includes(normalized) || standardRegion === normalized) {
        return standardRegion;
      }
    }

    if (ETHIOPIAN_REGIONS.includes(normalized)) {
      return normalized;
    }

    return null;
  }

  private getRegionFromCoordinates(lat: number, lng: number): string {
    const ethiopiaBounds = {
      minLat: 3.4,
      maxLat: 14.9,
      minLng: 33.0,
      maxLng: 48.0,
    };

    if (
      lat >= ethiopiaBounds.minLat &&
      lat <= ethiopiaBounds.maxLat &&
      lng >= ethiopiaBounds.minLng &&
      lng <= ethiopiaBounds.maxLng
    ) {
      if (lat >= 8.9 && lat <= 9.1 && lng >= 38.7 && lng <= 38.9) {
        return 'Addis Ababa';
      }
      if (lat >= 11.5 && lat <= 13.5 && lng >= 37.0 && lng <= 39.5) {
        return 'Amhara';
      }
      if (lat >= 7.5 && lat <= 10.0 && lng >= 34.0 && lng <= 37.0) {
        return 'Tigray';
      }
      if (lat >= 4.0 && lat <= 10.0 && lng >= 40.0 && lng <= 48.0) {
        return 'Somali';
      }
      if (lat >= 5.0 && lat <= 10.0 && lng >= 34.0 && lng <= 40.0) {
        return 'Oromia';
      }
      if (lat >= 6.0 && lat <= 11.0 && lng >= 36.0 && lng <= 42.0) {
        return 'Afar';
      }

      return 'Ethiopia (Region Unknown)';
    }

    return 'Outside Ethiopia';
  }

  isValidEthiopianRegion(region: string): boolean {
    const normalized = region.toLowerCase().trim();
    return (
      ETHIOPIAN_REGIONS.includes(normalized) ||
      Object.values(REGION_ALIASES).some((aliases) => aliases.includes(normalized))
    );
  }
}
