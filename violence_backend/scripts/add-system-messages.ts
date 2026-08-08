import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reportId = process.argv[2];
  
  if (!reportId) {
    console.log('Usage: npx ts-node scripts/add-system-messages.ts <reportId>');
    process.exit(1);
  }

  console.log(`Adding system messages to report: ${reportId}`);

  // Get report with assignment
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      caseAssignment: {
        include: {
          assignedTo: true,
          supportProviders: true,
        },
      },
      reporter: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!report) {
    console.error('Report not found');
    process.exit(1);
  }

  if (!report.caseAssignment) {
    console.error('Report has no case assignment');
    process.exit(1);
  }

  const assignment = report.caseAssignment;
  const primaryProfessional = assignment.assignedTo;
  const supportProviders = assignment.supportProviders;

  console.log(`Found assignment to: ${primaryProfessional.name}`);

  // Create system messages
  const professionalName = primaryProfessional.name;
  
  const supportProvidersList = supportProviders
    .map((p: any) => p.name)
    .join(', ');

  // 1. Survivor notification
  const survivorMessage = `Your case has been assigned to ${professionalName}` +
    (supportProvidersList ? ` with additional support from ${supportProvidersList}` : '') +
    `. The case is currently under counselor review.`;

  await prisma.caseComment.create({
    data: {
      reportId,
      authorId: null,
      senderRole: UserRole.SYSTEM,
      content: survivorMessage,
      isSystemMessage: true,
      isPublic: true,
    },
  });
  console.log('✓ Created survivor notification');

  // 2. Professional notification
  const survivorName = report.isAnonymous
    ? 'an anonymous survivor'
    : `${report.reporter?.firstName || ''} ${report.reporter?.lastName || ''}`.trim() || 'a survivor';
  
  const professionalMessage = `You have been assigned to ${survivorName}'s case (${report.category}). ` +
    `Severity: ${report.severity}. Please review the case details and accept when ready.`;

  await prisma.caseComment.create({
    data: {
      reportId,
      authorId: null,
      senderRole: UserRole.SYSTEM,
      content: professionalMessage,
      isSystemMessage: true,
      isPublic: true,
    },
  });
  console.log('✓ Created professional notification');

  // 3. Support provider notifications
  for (const provider of supportProviders) {
    const providerName = provider.name;
    const providerMessage = `You have been added as a support provider for ${survivorName}'s case (${report.category}). ` +
      `Severity: ${report.severity}. Primary assigned: ${professionalName}.`;

    await prisma.caseComment.create({
      data: {
        reportId,
        authorId: null,
        senderRole: UserRole.SYSTEM,
        content: providerMessage,
        isSystemMessage: true,
        isPublic: true,
      },
    });
    console.log(`✓ Created notification for support provider: ${providerName}`);
  }

  console.log('\nSystem messages added successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
