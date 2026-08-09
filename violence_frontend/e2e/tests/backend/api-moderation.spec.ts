import { test, expect } from '@playwright/test';
import { ENV } from '../../env';

/**
 * Backend API - Content Moderation Tests
 */

test.describe('Backend API - Moderation', () => {
  const API_URL = ENV.API_URL;
  let moderatorToken: string;
  let survivorToken: string;
  let postId: string;

  test.beforeAll(async ({ request }) => {
    // Authenticate moderator
    const modLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.moderator.email,
        password: ENV.USERS.moderator.password,
      },
    });
    moderatorToken = (await modLogin.json()).access_token;

    // Authenticate survivor for creating posts
    const survLogin = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ENV.USERS.survivor.email,
        password: ENV.USERS.survivor.password,
      },
    });
    survivorToken = (await survLogin.json()).access_token;
  });

  test('should create forum post', async ({ request }) => {
    const response = await request.post(`${API_URL}/forum/posts`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
      data: {
        title: 'Test Post for Moderation',
        content: 'This is a test post to verify moderation workflow.',
        category: 'SUPPORT',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('PENDING'); // Should be pending approval
    postId = body.id;
  });

  test('should get content moderation queue', async ({ request }) => {
    const response = await request.get(`${API_URL}/moderator/content-queue`, {
      headers: { Authorization: `Bearer ${moderatorToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should approve pending post', async ({ request }) => {
    const response = await request.patch(`${API_URL}/moderator/posts/${postId}/approve`, {
      headers: { Authorization: `Bearer ${moderatorToken}` },
      data: {
        approved: true,
        notes: 'Content is appropriate and supportive.',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('APPROVED');
  });

  test('should reject inappropriate post', async ({ request }) => {
    // First create a new post to reject
    const createResponse = await request.post(`${API_URL}/forum/posts`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
      data: {
        title: 'Post to Reject',
        content: 'This post will be rejected.',
        category: 'GENERAL',
      },
    });
    const newPost = await createResponse.json();

    // Reject the post
    const response = await request.patch(`${API_URL}/moderator/posts/${newPost.id}/reject`, {
      headers: { Authorization: `Bearer ${moderatorToken}` },
      data: {
        reason: 'Contains inappropriate content',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('REJECTED');
  });

  test('should get moderation history', async ({ request }) => {
    const response = await request.get(`${API_URL}/moderator/history`, {
      headers: { Authorization: `Bearer ${moderatorToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('should hide rejected posts from public view', async ({ request }) => {
    // Get all approved posts
    const response = await request.get(`${API_URL}/forum/posts?status=APPROVED`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const posts = body.data || body;

    if (Array.isArray(posts)) {
      // No rejected posts should appear in approved list
      const rejectedPost = posts.find((p: any) => p.status === 'REJECTED');
      expect(rejectedPost).toBeUndefined();
    }
  });

  test('survivor should NOT access moderation endpoints', async ({ request }) => {
    const response = await request.get(`${API_URL}/moderator/content-queue`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
    });

    expect(response.status()).toBe(403);
  });

  test('should flag suspicious content automatically', async ({ request }) => {
    const response = await request.post(`${API_URL}/forum/posts`, {
      headers: { Authorization: `Bearer ${survivorToken}` },
      data: {
        title: 'Test Content Flagging',
        content: 'Testing automatic content flagging system.',
        category: 'GENERAL',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    // Post should be flagged for review if content triggers filters
    expect(body).toHaveProperty('flaggedForReview');
  });
});
