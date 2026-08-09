import { test, expect } from '@playwright/test';
import { ENV } from '../../env';

/**
 * Backend API - Reports Management Tests
 */

test.describe('Backend API - Reports', () => {
  const API_URL = ENV.API_URL;
  let authToken: string;
  let reportId: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate as survivor to get token
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.survivor.email,
        password: ENV.USERS.survivor.password,
      },
    });

    const body = await response.json();
    authToken = body.access_token;
  });

  test('should create anonymous report', async ({ request }) => {
    const response = await request.post(`${API_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        title: 'Test Anonymous Report',
        description: 'This is a test incident report for API testing.',
        category: 'DOMESTIC_VIOLENCE',
        location: 'Addis Ababa',
        occurredAt: new Date().toISOString(),
        isAnonymous: true,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('caseId');
    expect(body.isAnonymous).toBe(true);
    reportId = body.id;
  });

  test('should create verified report', async ({ request }) => {
    const response = await request.post(`${API_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        title: 'Test Verified Report',
        description: 'This is a verified incident report.',
        category: 'HARASSMENT',
        location: 'Oromia',
        occurredAt: new Date().toISOString(),
        isAnonymous: false,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.isAnonymous).toBe(false);
    expect(body).toHaveProperty('reporterId');
  });

  test('should get all reports for admin', async ({ request }) => {
    // Login as admin
    const adminLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.admin.email,
        password: ENV.USERS.admin.password,
      },
    });
    const { access_token: adminToken } = await adminLogin.json();

    const response = await request.get(`${API_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should get report by ID', async ({ request }) => {
    const response = await request.get(`${API_URL}/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(reportId);
  });

  test('should update report status', async ({ request }) => {
    // Login as case manager
    const cmLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.caseManager.email,
        password: ENV.USERS.caseManager.password,
      },
    });
    const { access_token: cmToken } = await cmLogin.json();

    const response = await request.patch(`${API_URL}/reports/${reportId}/status`, {
      headers: {
        Authorization: `Bearer ${cmToken}`,
      },
      data: {
        status: 'IN_PROGRESS',
        notes: 'Case is being reviewed by counselor.',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('IN_PROGRESS');
  });

  test('should reject report creation without authentication', async ({ request }) => {
    const response = await request.post(`${API_URL}/reports`, {
      data: {
        title: 'Test Report',
        description: 'Should fail without auth.',
        category: 'OTHER',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should validate required fields for report', async ({ request }) => {
    const response = await request.post(`${API_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        title: '',
        description: '',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should filter reports by status', async ({ request }) => {
    const response = await request.get(`${API_URL}/reports?status=PENDING`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const reports = body.data || body;
    if (Array.isArray(reports) && reports.length > 0) {
      expect(reports[0].status).toBe('PENDING');
    }
  });

  test('should search reports by keyword', async ({ request }) => {
    const response = await request.get(`${API_URL}/reports?search=test`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
  });
});
