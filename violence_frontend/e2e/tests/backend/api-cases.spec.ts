import { test, expect } from '@playwright/test';
import { ENV } from '../../env';

/**
 * Backend API - Case Management Tests
 */

test.describe('Backend API - Cases', () => {
  const API_URL = ENV.API_URL;
  let adminToken: string;
  let caseManagerToken: string;
  let medicalToken: string;
  let legalToken: string;
  let testCaseId: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate all required users
    const adminLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.admin.email,
        password: ENV.USERS.admin.password,
      },
    });
    adminToken = (await adminLogin.json()).access_token;

    const cmLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.caseManager.email,
        password: ENV.USERS.caseManager.password,
      },
    });
    caseManagerToken = (await cmLogin.json()).access_token;

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
  });

  test('should get all cases as admin', async ({ request }) => {
    const response = await request.get(`${API_URL}/cases`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should assign case to case manager', async ({ request }) => {
    // First create a report to generate a case
    const reportResponse = await request.post(`${API_URL}/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        title: 'Case Assignment Test',
        description: 'Testing case assignment workflow.',
        category: 'PHYSICAL_VIOLENCE',
        location: 'Addis Ababa',
        occurredAt: new Date().toISOString(),
      },
    });

    const report = await reportResponse.json();
    testCaseId = report.caseId;

    // Assign case to case manager
    const response = await request.patch(`${API_URL}/cases/${testCaseId}/assign`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        caseManagerId: 'case-manager-id',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('assignedTo');
  });

  test('should update case status by case manager', async ({ request }) => {
    const response = await request.patch(`${API_URL}/cases/${testCaseId}/status`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
      data: {
        status: 'IN_PROGRESS',
        notes: 'Initial assessment completed.',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('IN_PROGRESS');
  });

  test('should add case note by case manager', async ({ request }) => {
    const response = await request.post(`${API_URL}/cases/${testCaseId}/notes`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
      data: {
        content: 'Follow-up call scheduled for next week.',
        type: 'GENERAL',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.content).toBe('Follow-up call scheduled for next week.');
  });

  test('should get case details with timeline', async ({ request }) => {
    const response = await request.get(`${API_URL}/cases/${testCaseId}`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timeline');
    expect(Array.isArray(body.timeline)).toBe(true);
  });

  test('should get assigned cases for case manager', async ({ request }) => {
    const response = await request.get(`${API_URL}/cases/assigned`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should escalate case to higher priority', async ({ request }) => {
    const response = await request.patch(`${API_URL}/cases/${testCaseId}/priority`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        priority: 'HIGH',
        reason: 'Immediate safety concern identified.',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.priority).toBe('HIGH');
  });

  test('should close resolved case', async ({ request }) => {
    const response = await request.patch(`${API_URL}/cases/${testCaseId}/status`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
      data: {
        status: 'RESOLVED',
        resolution: 'Case resolved successfully. Survivor provided with resources.',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('RESOLVED');
  });
});
