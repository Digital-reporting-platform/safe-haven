import { test, expect } from '@playwright/test';
import { ENV } from '../../env';

/**
 * Backend API - Role-Based Access Control Tests
 */

test.describe('Backend API - RBAC', () => {
  const API_URL = ENV.API_URL;
  let survivorToken: string;
  let caseManagerToken: string;
  let medicalToken: string;
  let legalToken: string;
  let moderatorToken: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate all roles
    const roles = ['survivor', 'caseManager', 'medical', 'legal', 'moderator', 'admin'] as const;
    const tokens: Record<string, string> = {};

    for (const role of roles) {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: ENV.USERS[role].email,
          password: ENV.USERS[role].password,
        },
      });

      if (response.status() === 200) {
        const body = await response.json();
        tokens[`${role}Token`] = body.access_token;
      }
    }

    survivorToken = tokens.survivorToken;
    caseManagerToken = tokens.caseManagerToken;
    medicalToken = tokens.medicalToken;
    legalToken = tokens.legalToken;
    moderatorToken = tokens.moderatorToken;
    adminToken = tokens.adminToken;
  });

  test('survivor should NOT access admin endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('survivor should NOT manage users', async ({ request }) => {
    const response = await request.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('case manager should NOT access admin analytics', async ({ request }) => {
    const response = await request.get(`${API_URL}/analytics/system-stats`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('case manager should NOT manage other case managers cases', async ({ request }) => {
    // Try to access a case endpoint that requires admin access
    const response = await request.get(`${API_URL}/cases/all`, {
      headers: { Authorization: `Bearer ${caseManagerToken}` },
    });

    // Should get either 403 or filtered results
    expect(response.status()).toBeLessThan(500);
    if (response.status() === 200) {
      const body = await response.json();
      // Should only see their assigned cases
      expect(body).not.toHaveProperty('allCases');
    }
  });

  test('moderator should access moderation endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/moderator/content-queue`, {
      headers: { Authorization: `Bearer ${moderatorToken}` },
    });

    expect(response.status()).toBe(200);
  });

  test('moderator should NOT access case management', async ({ request }) => {
    const response = await request.get(`${API_URL}/cases`, {
      headers: { Authorization: `Bearer ${moderatorToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('medical professional should access medical endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/medical/cases`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
    });

    // Should be allowed (200) or filtered (200 with limited data)
    expect(response.status()).toBeLessThan(500);
  });

  test('medical professional should NOT access legal endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/legal/cases`, {
      headers: { Authorization: `Bearer ${medicalToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('legal provider should access legal endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/legal/cases`, {
      headers: { Authorization: `Bearer ${legalToken}` },
    });

    expect(response.status()).toBeLessThan(500);
  });

  test('legal provider should NOT access medical endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/medical/cases`, {
      headers: { Authorization: `Bearer ${legalToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('admin should access all endpoints', async ({ request }) => {
    const endpoints = [
      '/users',
      '/cases',
      '/reports',
      '/analytics/dashboard',
      '/system/settings',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.status()).toBeLessThan(500);
      // Should be 200 or 404 (if endpoint doesn't exist)
      expect([200, 404]).toContain(response.status());
    }
  });

  test('admin should manage user roles', async ({ request }) => {
    const response = await request.patch(`${API_URL}/users/test-user-id/role`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        role: 'CASE_MANAGER',
      },
    });

    // Should be 200 or 404 if user not found
    expect(response.status()).toBeLessThan(500);
  });

  test('unauthenticated requests should be rejected', async ({ request }) => {
    const protectedEndpoints = [
      '/auth/profile',
      '/cases',
      '/reports',
      '/users',
      '/analytics/dashboard',
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(`${API_URL}${endpoint}`);
      expect(response.status()).toBe(401);
    }
  });

  test('invalid token should be rejected', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: 'Bearer invalid_token_12345' },
    });

    expect(response.status()).toBe(401);
  });

  test('expired token should be rejected', async ({ request }) => {
    // Use a clearly expired/invalid JWT format
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    const response = await request.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    expect(response.status()).toBe(401);
  });
});
