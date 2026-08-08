import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in correct order due to foreign keys)
  console.log('  Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.mLTrainingData.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.missingPerson.deleteMany();
  await prisma.forumComment.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.caseFeedback.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.serviceProviderReview.deleteMany();
  await prisma.caseComment.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.caseAssignment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Data cleaned');

  // Create or update admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'havensafe207@gmail.com';
  console.log(`  Creating/updating admin user: ${adminEmail}...`);
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      isEmailVerified: true,
      language: 'en',
      phone: '+251900000000',
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      isEmailVerified: true,
      language: 'en',
      phone: '+251900000000',
    },
  });
  console.log(`  ✓ Admin ready: ${admin.email} (ID: ${admin.id})`);
  console.log('  ✓ isEmailVerified:', admin.isEmailVerified);
  console.log('  ✓ status:', admin.status);
  console.log('  ✓ Password: Admin@123456');

  // Initialize System Settings
  console.log('  Creating system settings...');
  
  const defaultSettings = {
    general: {
      siteName: 'SafeHaven',
      siteDescription: 'A platform for survivor support and resources',
      contactEmail: adminEmail,
      timezone: 'UTC',
      language: 'en',
    },
    security: {
      enableTwoFactor: true,
      sessionTimeout: 30,
      passwordMinLength: 8,
      enableAuditLogs: true,
      maxLoginAttempts: 5,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      incidentAlerts: true,
    },
    maintenance: {
      maintenanceMode: false,
      backupFrequency: 'daily',
      logRetentionDays: 90,
      autoUpdates: true,
    },
  };

  for (const [category, data] of Object.entries(defaultSettings)) {
    await prisma.systemSetting.create({
      data: {
        category,
        data: data as any,
        updatedById: admin.id,
      },
    });
    console.log(`  ✓ Created ${category} settings`);
  }

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });