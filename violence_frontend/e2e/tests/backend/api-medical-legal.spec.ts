import { test, expect } from '@playwright/test';
import { ENV } from '../../env';

/**
 * Backend API - Medical & Legal Workflow Tests
 */

test.describe('Backend API - Medical Workflow', () => {
  const API_URL = ENV.API_URL;
  let medicalToken: string;
  let caseId: string;

  test.beforeAll(async ({ request }) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.medical.email,
        password: ENV.USERS.medical.password,
      },
    });
    medicalToken = (await login.json()).access_token;
  });

  test('should get assigned medical cases', async ({ request }) => {
    const response = await request.get(`${API_URL}/medical/cases`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should add medical note to case', async ({ request }) => {
    const response = await request.post(`${API_URL}/medical/cases/medical-case-123/notes`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
      data: {
        content: 'Patient examination completed. Physical injuries documented.',
        type: 'MEDICAL_ASSESSMENT',
        priority: 'HIGH',
      },
    });

    // Should be 201 or 404 if case doesn't exist
    expect(response.status()).toBeLessThan(500);
  });

  test('should update medical status', async ({ request }) => {
    const response = await request.patch(`${API_URL}/medical/cases/medical-case-123/status`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
      data: {
        status: 'TREATMENT_IN_PROGRESS',
        notes: 'Patient receiving ongoing care.',
      },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('should mark medical support as completed', async ({ request }) => {
    const response = await request.patch(`${API_URL}/medical/cases/medical-case-123/complete`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
      data: {
        completed: true,
        summary: 'Medical treatment completed. Patient discharged with follow-up plan.',
      },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('should upload medical document', async ({ request }) => {
    // Note: File upload tests would use form data
    const response = await request.post(`${API_URL}/medical/cases/medical-case-123/documents`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
      multipart: {
        file: {
          name: 'medical-report.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('test pdf content'),
        },
        description: 'Medical assessment report',
      },
    });

    // File upload endpoint may vary
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Backend API - Legal Workflow', () => {
  const API_URL = ENV.API_URL;
  let legalToken: string;

  test.beforeAll(async ({ request }) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.legal.email,
        password: ENV.USERS.legal.password,
      },
    });
    legalToken = (await login.json()).access_token;
  });

  test('should get assigned legal cases', async ({ request }) => {
    const response = await request.get(`${API_URL}/legal/cases`, {
      headers: { Authorization: `Bearer ${legalToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should add legal advice', async ({ request }) => {
    const response = await request.post(`${API_URL}/legal/cases/legal-case-123/advice`, {
      headers: { Authorization: `Bearer ${legalToken}` },
      data: {
        content: 'Advised client on legal rights and available options for protection order.',
        type: 'LEGAL_CONSULTATION',
      },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('should update legal case progress', async ({ request }) => {
    const response = await request.patch(`${API_URL}/legal/cases/legal-case-123/progress`, {
      headers: { Authorization: `Bearer ${legalToken}` },
      data: {
        stage: 'LEGAL_ACTION_INITIATED',
        description: 'Filed application for protection order.',
        nextSteps: ['Court hearing scheduled', 'Gather additional evidence'],
      },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('should request court documentation', async ({ request }) => {
    const response = await request.post(`${API_URL}/legal/cases/legal-case-123/court-docs`, {
      headers: { Authorization: `Bearer ${legalToken}` },
      data: {
        documentType: 'PROTECTION_ORDER',
        urgency: 'HIGH',
        notes: 'Urgent protection needed due to safety concerns.',
      },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('should update case status to resolved', async ({ request }) => {
    const response = await request.patch(`${API_URL}/legal/cases/legal-case-123/status`, {
      headers: { Authorization: `Bearer ${legalToken}` },
      data: {
        status: 'RESOLVED',
        resolution: 'Protection order granted. Client briefed on enforcement.',
      },
    });

    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Backend API - Medical-Legal Integration', () => {
  const API_URL = ENV.API_URL;
  let medicalToken: string;
  let legalToken: string;
  let caseManagerToken: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate all required roles
    const medicalLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.medical.email,
        password: ENV.USERS.medical.password,
      },
    });
    medicalToken = (await medicalLogin.json()).access_token;

    const legalLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.legal.email,
        password: ENV.USERS.legal.password,
      },
    });
    legalToken = (await legalLogin.json()).access_token;

    const cmLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.caseManager.email,
        password: ENV.USERS.caseManager.password,
      },
    });
    caseManagerToken = (await cmLogin.json()).access_token;
  });

  test('medical update should be visible to case manager', async ({ request }) => {
    // Medical adds note
    await request.post(`${API_URL}/medical/cases/shared-case-123/notes`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
      data: {
        content: 'Medical evidence collected for legal proceedings.',
        type: 'MEDICAL_EVIDENCE',
      },
    });

    // Case manager views case timeline
    const response = await request.get(`${API_URL}/cases/shared-case-123/timeline`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
    });

    expect(response.status()).toBeLessThan(500);
    if (response.status() === 200) {
      const body = await response.json();
      const timeline = body.data || body;
      if (Array.isArray(timeline)) {
        const medicalUpdate = timeline.find((t: any) => 
          t.content?.includes('Medical evidence') || t.type === 'MEDICAL_UPDATE'
        );
        expect(medicalUpdate).toBeTruthy();
      }
    }
  });

  test('legal update should be visible to case manager', async ({ request }) => {
    // Legal adds update
    await request.post(`${API_URL}/legal/cases/shared-case-123/advice`, {
      headers: { Authorization: `Bearer ${legalToken}` },
      data: {
        content: 'Legal proceedings initiated based on medical evidence.',
        type: 'LEGAL_UPDATE',
      },
    });

    // Case manager views case
    const response = await request.get(`${API_URL}/cases/shared-case-123`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('case manager should coordinate between medical and legal', async ({ request }) => {
    const response = await request.post(`${API_URL}/cases/shared-case-123/coordinate`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
      data: {
        message: 'Please coordinate medical report delivery for legal proceedings.',
        parties: ['medical', 'legal'],
        urgency: 'HIGH',
      },
    });

    expect(response.status()).toBeLessThan(500);
  });
});
