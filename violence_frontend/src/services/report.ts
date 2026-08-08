import { api } from './api/client';

// --- Interfaces ---

export interface LocationMismatchData {
  hasMismatch: boolean;
  detectedLocation: {
    country: string;
    region: string;
    city: string;
    isVpn: boolean;
    isProxy: boolean;
  };
  selectedRegion: string;
  message: string;
  isVpnOrProxy: boolean;
}

export interface CreateReportResponse {
  id: string;
  trackingNumber?: string;
  locationWarning?: LocationMismatchData;
  classification?: {
    category: string;
    severity: string;
    suggestedCaseType: string;
    supportTrack?: 'MEDICAL' | 'LEGAL' | 'BOTH';
    detectedLanguage?: string;
    translatedText?: string;
    confidence: number;
  };
  riskScore?: any;
}

// --- Service Object ---

export const reportService = {
  /**
   * Submits a new incident report to the backend.
   * The backend handles the classification, risk scoring, and salt-based hashing.
   */
  async createReport(reportData: any): Promise<CreateReportResponse> {
    // Generate/Get simple device fingerprint if not provided
    let fingerprint = localStorage.getItem('sh_fingerprint');
    if (!fingerprint) {
      fingerprint = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sh_fingerprint', fingerprint);
    }

    try {
      const response = await api.post('/reports', {
        ...reportData,
        deviceFingerprint: fingerprint,
      });
      return response.data;
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message &&
        (Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message);

      throw new Error(
        String(
          backendMessage ||
            error?.message ||
            'Failed to submit report. Please try again.',
        ),
      );
    }
  },

  /**
   * Validates if the user's selected region matches their detected IP/GPS location.
   */
  async validateLocation(
    region: string,
    gpsLat?: number,
    gpsLng?: number
  ): Promise<LocationMismatchData | null> {
    try {
      const response = await api.post('/reports/validate-location', {
        region,
        gpsLat,
        gpsLng,
      });

      const data = response.data;
      
      if (data.hasMismatch) {
        return {
          hasMismatch: true,
          detectedLocation: data.detectedLocation,
          selectedRegion: data.selectedRegion,
          message: data.warningMessage || 'Location mismatch detected',
          isVpnOrProxy: data.isVpnOrProxy,
        };
      }

      return null;
    } catch (error) {
      console.warn('Location validation failed:', error);
      return null;
    }
  },

  /**
   * Fetches the authenticated user's submitted reports.
   */
  async getMyReports(page = 1, limit = 10) {
    const response = await api.get(`/reports`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Fetches a single report by ID.
   */
  async getReportById(reportId: string) {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  /**
   * Updates contact information for a specific report (if not anonymous).
   */
  async updateReportContact(reportId: string, email: string) {
    const response = await api.patch(`/reports/${reportId}/contact`, {
      contactEmail: email,
    });
    return response.data;
  },
};
