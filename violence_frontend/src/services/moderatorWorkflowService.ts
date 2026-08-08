import { api } from './api/client';

export const moderatorWorkflowService = {
  async getDashboard() {
    const response = await api.get<{
      stats: {
        pendingReviews: number;
        activeFlags: number;
        totalUsers: number;
        forumPosts: number;
      };
      recentActivities: Array<{
        id: string;
        type: string;
        message: string;
        time: string;
        priority: string;
        author: string;
      }>;
    }>('/moderator/dashboard');
    return response.data;
  },

  async getContentQueue(priority = 'all') {
    const response = await api.get<
      Array<{
        id: string;
        contentType: string;
        title: string;
        author: string;
        submittedDate: string;
        priority: string;
        status: string;
        reason: string;
      }>
    >('/moderator/content-queue', {
      params: { priority },
    });
    return response.data;
  },

  async moderateContent(postId: string, action: 'APPROVE' | 'REJECT' | 'HIDE') {
    const response = await api.post(`/moderator/content-queue/${postId}/action`, { action });
    return response.data;
  },

  async getUsers(search?: string) {
    const response = await api.get<
      Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        flags: number;
        lastActive: string;
      }>
    >('/moderator/users', {
      params: search ? { search } : {},
    });
    return response.data;
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED') {
    const response = await api.patch(`/moderator/users/${userId}/status`, { status });
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get<{
      totalModerated: number;
      forumByStatus: Array<{ status: string; count: number }>;
      usersByStatus: Array<{ status: string; count: number }>;
    }>('/moderator/analytics');
    return response.data;
  },

  async getProfile() {
    const response = await api.get<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      bio: string;
      role: string;
      language: string;
      timezone: string;
    }>('/moderator/profile');
    return response.data;
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
  }) {
    const response = await api.put('/moderator/profile', payload);
    return response.data;
  },
};
