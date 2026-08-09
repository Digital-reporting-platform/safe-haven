// Environment configuration for E2E tests
// Copy this file to env.local.ts and fill in actual values for local testing

export const ENV = {
  // Application URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:3000',

  // Test User Credentials - Replace with actual test accounts
  USERS: {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!',
    },
    survivor: {
      email: process.env.TEST_SURVIVOR_EMAIL || 'survivor@test.com',
      password: process.env.TEST_SURVIVOR_PASSWORD || 'TestPassword123!',
    },
    caseManager: {
      email: process.env.TEST_CASE_MANAGER_EMAIL || 'casemanager@test.com',
      password: process.env.TEST_CASE_MANAGER_PASSWORD || 'TestPassword123!',
    },
    moderator: {
      email: process.env.TEST_MODERATOR_EMAIL || 'moderator@test.com',
      password: process.env.TEST_MODERATOR_PASSWORD || 'TestPassword123!',
    },
    medical: {
      email: process.env.TEST_MEDICAL_EMAIL || 'medical@test.com',
      password: process.env.TEST_MEDICAL_PASSWORD || 'TestPassword123!',
    },
    legal: {
      email: process.env.TEST_LEGAL_EMAIL || 'legal@test.com',
      password: process.env.TEST_LEGAL_PASSWORD || 'TestPassword123!',
    },
  },

  // Test Configuration
  TIMEOUTS: {
    navigation: 30000,
    action: 15000,
    api: 10000,
  },
};

export default ENV;
