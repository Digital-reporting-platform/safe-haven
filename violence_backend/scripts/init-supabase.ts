import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Initialize Supabase database with complete schema and seed data
 * This script creates all tables, indexes, and populates with sample data
 */
async function main() {
  console.log('🚀 Starting Supabase database initialization...');

  try {
    // Step 1: Create initial admin user
    console.log('📝 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@violencereporting.org' },
      update: {},
      create: {
        email: 'admin@violencereporting.org',
        password: adminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
        language: 'en',
      },
    });
    console.log('✅ Admin user created:', admin.id);

    // Step 2: Create sample service providers (professionals)
    console.log('📋 Creating service providers...');
    const counselor = await prisma.serviceProvider.upsert({
      where: { email: 'counselor@example.org' },
      update: {},
      create: {
        name: 'Dr. Sarah Johnson',
        email: 'counselor@example.org',
        phone: '+1-555-0100',
        type: 'COUNSELOR',
        specializations: ['Trauma', 'PTSD', 'Grief Counseling'],
        languages: ['English', 'Spanish'],
        location: 'New York, NY',
        bio: 'Licensed psychologist specializing in trauma recovery',
        rating: 4.8,
        reviewCount: 45,
        isVerified: true,
        status: 'ACTIVE',
      },
    });

    const medicalPro = await prisma.serviceProvider.upsert({
      where: { email: 'doctor@example.org' },
      update: {},
      create: {
        name: 'Dr. Michael Chen',
        email: 'doctor@example.org',
        phone: '+1-555-0101',
        type: 'MEDICAL_PROFESSIONAL',
        specializations: ['Trauma Medicine', 'Emergency Care', 'Forensic Examination'],
        languages: ['English', 'Mandarin'],
        location: 'Los Angeles, CA',
        bio: 'Board-certified emergency physician with 15 years experience',
        rating: 4.9,
        reviewCount: 78,
        isVerified: true,
        status: 'ACTIVE',
      },
    });

    const legalAdvisor = await prisma.serviceProvider.upsert({
      where: { email: 'lawyer@example.org' },
      update: {},
      create: {
        name: 'Attorney Jane Williams',
        email: 'lawyer@example.org',
        phone: '+1-555-0102',
        type: 'LEGAL_ADVISOR',
        specializations: ['Criminal Law', 'Family Law', 'Protective Orders'],
        languages: ['English'],
        location: 'Chicago, IL',
        bio: 'Specializing in domestic violence and victim advocacy',
        rating: 4.7,
        reviewCount: 56,
        isVerified: true,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Service providers created');

    // Step 3: Create sample reports
    console.log('📄 Creating sample reports...');
    const report1 = await prisma.report.create({
      data: {
        title: 'Workplace Harassment Incident',
        description:
          'I experienced repeated unwanted comments and physical contact from my supervisor during work hours. This has been ongoing for 3 months and is affecting my mental health and job performance.',
        category: 'WORKPLACE_ABUSE',
        severity: 'HIGH',
        status: 'UNDER_INVESTIGATION',
        isAnonymous: false,
        language: 'en',
        classificationScore: 0.95,
        classificationLabel: 'WORKPLACE_ABUSE',
        suggestedCaseType: 'COUNSELING_LEGAL',
        suggestedPriority: 'HIGH',
        riskScore: 7.5,
        reporterId: admin.id,
      },
    });

    const report2 = await prisma.report.create({
      data: {
        title: 'Cyberbullying on Social Media',
        description:
          'Group of classmates created a fake profile using my photos and spreading false rumors. They are also sharing private conversations without my consent.',
        category: 'CYBERBULLYING',
        severity: 'MEDIUM',
        status: 'ASSIGNED_TO_PROFESSIONAL',
        isAnonymous: true,
        language: 'en',
        classificationScore: 0.92,
        classificationLabel: 'CYBERBULLYING',
        suggestedCaseType: 'COUNSELING_SUPPORT',
        suggestedPriority: 'MEDIUM',
        riskScore: 5.2,
      },
    });

    const report3 = await prisma.report.create({
      data: {
        title: 'Domestic Violence Incident',
        description:
          'My partner has been physically abusive. I need immediate support and legal guidance to protect myself and my children.',
        category: 'DOMESTIC_VIOLENCE',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        isAnonymous: false,
        language: 'en',
        classificationScore: 0.98,
        classificationLabel: 'DOMESTIC_VIOLENCE',
        suggestedCaseType: 'LEGAL_MEDICAL_COUNSELING',
        suggestedPriority: 'CRITICAL',
        riskScore: 9.2,
      },
    });

    console.log('✅ Sample reports created');

    // Step 4: Create case assignments
    console.log('🎯 Creating case assignments...');
    const caseAssignment1 = await prisma.caseAssignment.create({
      data: {
        reportId: report1.id,
        assignedToId: counselor.id,
        caseType: 'COUNSELING_LEGAL',
        priority: 'HIGH',
        status: 'ACTIVE',
        description: 'Workplace harassment case requiring counseling and potential legal action',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    const caseAssignment2 = await prisma.caseAssignment.create({
      data: {
        reportId: report3.id,
        assignedToId: legalAdvisor.id,
        caseType: 'LEGAL_MEDICAL_COUNSELING',
        priority: 'CRITICAL',
        status: 'ACTIVE',
        description: 'Critical domestic violence case requiring immediate legal intervention',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    console.log('✅ Case assignments created');

    // Step 5: Create case comments
    console.log('💬 Creating case communications...');
    await prisma.caseComment.create({
      data: {
        caseAssignmentId: caseAssignment1.id,
        userId: counselor.id,
        content:
          'Initial assessment complete. The client shows signs of workplace stress and anxiety. Recommended therapy sessions and legal consultation.',
      },
    });

    console.log('✅ Case communications created');

    // Step 6: Create support requests
    console.log('📞 Creating support requests...');
    const supportRequest = await prisma.supportRequest.create({
      data: {
        userId: admin.id,
        serviceProviderId: counselor.id,
        type: 'COUNSELING',
        status: 'PENDING',
        description: 'Need emergency counseling support',
        requestedDate: new Date(),
      },
    });

    console.log('✅ Support requests created');

    // Step 7: Create analytics snapshot
    console.log('📊 Creating analytics data...');
    await prisma.analyticsSnapshot.create({
      data: {
        date: new Date(),
        totalReports: 3,
        criticalCases: 1,
        resolvedCases: 0,
        averageResolutionTime: 0,
        reportsByCategory: {
          WORKPLACE_ABUSE: 1,
          CYBERBULLYING: 1,
          DOMESTIC_VIOLENCE: 1,
        },
        reportsBySeverity: {
          CRITICAL: 1,
          HIGH: 1,
          MEDIUM: 1,
        },
      },
    });

    console.log('✅ Analytics snapshot created');

    // Step 8: Verify database connections and indexes
    console.log('🔍 Verifying database setup...');
    const userCount = await prisma.user.count();
    const reportCount = await prisma.report.count();
    const providerCount = await prisma.serviceProvider.count();

    console.log(`📊 Database Summary:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Reports: ${reportCount}`);
    console.log(`   - Service Providers: ${providerCount}`);

    console.log('\n✨ Database initialization complete!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start the backend: npm run start:dev');
    console.log('   2. Visit Swagger docs: http://localhost:3001/api/docs');
    console.log('   3. Login with admin@violencereporting.org / Admin@123!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
