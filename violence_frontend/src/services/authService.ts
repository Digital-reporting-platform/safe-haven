import { api } from './api/client';
import { User, UserRole, UserStatus } from '@/types/user';
import { NavigateFunction } from 'react-router-dom';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language?: string;
  role?: UserRole;
}

export const authService = {
  /**
   * Hits POST /auth/login
   * Returns MFA required flag for professional roles
   */
  async login(credentials: LoginCredentials): Promise<
    | { mfaRequired: false; user: User; token: string }
    | { mfaRequired: true; user: { id: string; email: string; role: UserRole }; message: string }
    | null
  > {
    const response = await api.post('/auth/login', credentials);
    const { user, token, mfaRequired, message } = response.data;

    // MFA required for professional roles - no token yet
    if (mfaRequired) {
      return {
        mfaRequired: true,
        user,
        message: message || 'Please enter the verification code sent to your email',
      };
    }

    // No MFA - save token directly
    if (token) {
      localStorage.setItem('sh_token', token);
      const transformedUser = this.transformUser(user);
      if (transformedUser) {
        localStorage.setItem('sh_user', JSON.stringify(transformedUser));
      }
      return { mfaRequired: false, user: transformedUser!, token };
    }

    return null;
  },

  /**
   * Verify MFA OTP for professional login
   * POST /auth/verify-otp
   */
  async verifyLoginOTP(data: {
    email: string;
    otp: string;
  }): Promise<{ user: User; token: string } | null> {
    console.log('[AuthService] verifyLoginOTP called with:', { email: data.email, otp: data.otp });
    
    const payload = {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
      type: 'LOGIN_OTP',
    };
    console.log('[AuthService] Sending payload:', payload);
    
    const response = await api.post('/auth/verify-otp', payload);
    console.log('[AuthService] Response:', response.data);

    const { user, token } = response.data;

    if (token) {
      localStorage.setItem('sh_token', token);
      const transformedUser = this.transformUser(user);
      if (transformedUser) {
        localStorage.setItem('sh_user', JSON.stringify(transformedUser));
      }
      return { user: transformedUser!, token };
    }

    return null;
  },


  /**
   * Hits POST /auth/register
   * Does NOT auto-login - user must verify email first
   */
  async signUp(data: SignUpData): Promise<{ user: User; message: string } | null> {
    // Result: http://localhost:4000/api/v1/auth/register
    const normalizedPhone = data.phone?.trim();
    const isValidE164Phone = normalizedPhone
      ? /^\+?[1-9]\d{1,14}$/.test(normalizedPhone)
      : false;
    const response = await api.post('/auth/register', {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      ...(normalizedPhone && isValidE164Phone ? { phone: normalizedPhone } : {}),
      ...(data.language ? { language: data.language } : {}),
      role: data.role || UserRole.SURVIVOR,
    });

    const { user, message } = response.data;
    const transformedUser = this.transformUser(user);
    if (transformedUser) {
      return { user: transformedUser, message };
    }
    return null;
  },

  /**
   * Hits GET /auth/profile
   */
  async getCurrentSession(): Promise<User | null> {
    const token = localStorage.getItem('sh_token');
    if (!token) return null;

    try {
      const response = await api.get('/auth/profile');
      return this.transformUser(response.data);
    } catch (error) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      return null;
    }
  },

async logout() {
    // Call backend to invalidate session
    await api.post('/auth/logout');
  },

  /**
   * Activate invited user account with OTP
   * POST /auth/activate-account
   */
  async activateAccount(data: {
    email: string;
    otp: string;
    password: string;
  }): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/activate-account', {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
      password: data.password,
    });
    return {
      message: response.data.message,
      user: this.transformUser(response.data.user)!,
    };
  },

  /**
   * Verify survivor email with OTP
   * POST /auth/verify-email
   */
  async verifyEmail(data: {
    email: string;
    otp: string;
  }): Promise<{ user: User; token: string; message: string } | null> {
    const response = await api.post('/auth/verify-email', {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
    });

    const { user, token, message } = response.data;

    if (token) {
      localStorage.setItem('sh_token', token);
      const transformedUser = this.transformUser(user);
      if (transformedUser) {
        localStorage.setItem('sh_user', JSON.stringify(transformedUser));
      }
      return { user: transformedUser!, token, message };
    }

    return null;
  },

  /**
   * Resend email verification OTP
   * POST /auth/resend-otp
   */
  async resendEmailVerificationOTP(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-otp', {
      email: email.trim().toLowerCase(),
      type: 'EMAIL_VERIFICATION',
    });
    return response.data;
  },

  /**
   * Resend OTP for account activation
   * POST /auth/resend-otp
   */
  async resendActivationOTP(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-otp', {
      email: email.trim().toLowerCase(),
      type: 'ACCOUNT_ACTIVATION',
    });
    return response.data;
  },

  async logoutAndRedirect(navigate?: NavigateFunction) {
    // Set flag FIRST to prevent session recovery during the transition
    localStorage.setItem('just_logged_out', 'true');

    // Clear local storage immediately
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    sessionStorage.clear();

    // Clear all cookies aggressively
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    }

    try {
      // Call backend to invalidate session (non-blocking)
      await this.logout();
    } catch (error) {
      console.error('Backend logout failed:', error);
    }

    // Redirect to home using React Router if available, otherwise fallback
    if (navigate) {
      navigate('/', { replace: true });
    } else {
      window.location.replace('/');
    }
  },

  /**
   * Request password reset link
   * POST /auth/forgot-password
   */
  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', {
      email: data.email.trim().toLowerCase(),
    });
    return response.data;
  },
 
  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  async resetPassword(data: { token: string; password: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', {
      token: data.token.trim(),
      password: data.password,
    });
    return response.data;
  },
 
  transformUser(backendUser: any): User | null {
    if (!backendUser) return null;
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName || 'User',
      lastName: backendUser.lastName || '',
      role: backendUser.role as UserRole,
      status: (backendUser.status as UserStatus) || UserStatus.ACTIVE,
      language: backendUser.language || 'en',
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
    };
  }
};
