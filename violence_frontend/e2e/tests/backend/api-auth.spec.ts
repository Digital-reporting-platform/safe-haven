import { test, expect } from '@playwright/test';
import { ENV } from '../../env';

/**
 * Backend API Authentication Tests
 * Tests the NestJS backend REST API endpoints directly
 */

test.describe('Backend API - Authentication', () => {
  const API_URL = ENV.API_URL;

  test('should login with valid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.admin.email,
        password: ENV.USERS.admin.password,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('role');
  });

  test('should reject login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  test('should reject login with missing fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: '',
        password: '',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should register new user', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `test.user.${timestamp}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+251911234567',
        role: 'SURVIVOR',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
  });

  test('should get current user profile with valid token', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.survivor.email,
        password: ENV.USERS.survivor.password,
      },
    });

    const { access_token } = await loginResponse.json();

    // Get profile
    const response = await request.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('role');
  });

  test('should reject profile access without token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/profile`);

    expect(response.status()).toBe(401);
  });

  test('should reject profile access with invalid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: 'Bearer invalid_token',
      },
    });

    expect(response.status()).toBe(401);
  });
});
